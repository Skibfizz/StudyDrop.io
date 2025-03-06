import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
// Fallback to anon key if service role key is not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    // Check if webhook secret is available
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // For development or if webhook secret is not set, try to parse the body directly
      // This is less secure but allows the webhook to work without the secret
      event = JSON.parse(body) as Stripe.Event;
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(checkoutSession);
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Get the customer ID and subscription ID
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  
  // Determine the tier based on the price ID
  let tier: 'free' | 'basic' | 'pro' = 'free';
  
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    tier = 'basic';
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    tier = 'pro';
  }
  
  // Get the user ID from the subscription metadata or look it up by customer ID
  let userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Look up the user by customer ID
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();
      
    if (subscriptionData) {
      userId = subscriptionData.user_id;
    } else {
      console.error('Could not find user for customer ID:', customerId);
      return;
    }
  }
  
  // Update the subscription in the database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      tier,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  // Get the customer ID
  const customerId = subscription.customer as string;
  
  // Get the user ID from the subscription metadata or look it up by customer ID
  let userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Look up the user by customer ID
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();
      
    if (subscriptionData) {
      userId = subscriptionData.user_id;
    } else {
      console.error('Could not find user for customer ID:', customerId);
      return;
    }
  }
  
  // Update the subscription in the database to free tier
  const { error } = await supabase
    .from('subscriptions')
    .update({
      tier: 'free',
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating subscription in database:', error);
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Only process subscription checkouts
  if (session.mode !== 'subscription') return;
  
  // Get the user ID from the session metadata
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID in checkout session metadata');
    return;
  }
  
  // Get the subscription ID
  const subscriptionId = session.subscription as string;
  
  // Get the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update the subscription in the database
  await handleSubscriptionChange(subscription);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // This function handles payments from payment links
  // We need to determine which plan was purchased and update the user's subscription
  
  // Check if this payment intent has metadata with user_id and plan
  // If it does, we can use that directly
  const userId = paymentIntent.metadata?.user_id;
  const planId = paymentIntent.metadata?.plan;
  
  if (userId && planId) {
    // We have all the information we need from metadata
    await updateUserSubscription(userId, planId as 'basic' | 'pro');
    return;
  }
  
  // If we don't have metadata, we need to try to determine the plan from the amount
  // and find the user from other sources
  
  // First, check if this payment is linked to a customer
  const customerId = paymentIntent.customer as string;
  if (!customerId) {
    console.error('Payment intent has no customer ID and no user metadata:', paymentIntent.id);
    return;
  }
  
  // Look up the user by customer ID
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (!subscriptionData?.user_id) {
    console.error('Could not find user for customer ID:', customerId);
    return;
  }
  
  // Determine the plan based on the amount paid
  const amountPaid = paymentIntent.amount / 100; // Convert from cents to dollars/pounds
  let tier: 'basic' | 'pro' = 'basic';
  
  if (amountPaid >= 3.99) {
    tier = 'pro';
  } else if (amountPaid >= 1.99) {
    tier = 'basic';
  }
  
  // Update the user's subscription
  await updateUserSubscription(subscriptionData.user_id, tier);
}

async function updateUserSubscription(userId: string, tier: 'basic' | 'pro') {
  // Calculate subscription period (1 week from now)
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  // Check if the user already has a subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (subscription) {
    // Update existing subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        tier,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: oneWeekLater.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating subscription in database:', error);
    }
  } else {
    // Create new subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: oneWeekLater.toISOString()
      });
      
    if (error) {
      console.error('Error creating subscription in database:', error);
    }
  }
} 