import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    console.log(`Processing webhook event: ${event.type}`);
    
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
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscriptionChange(subscription);
        }
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        if (failedInvoice.subscription) {
          // Update subscription status to reflect payment failure
          const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription as string);
          await handleSubscriptionChange(subscription);
        }
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
  
  console.log(`Updating subscription for user ${userId} to tier ${tier}, status ${subscription.status}`);
  
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
    throw error;
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
  
  console.log(`Handling subscription deletion for user ${userId}`);
  
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
    throw error;
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
  
  console.log(`Handling checkout completion for user ${userId}`);
  
  // Get the subscription ID
  const subscriptionId = session.subscription as string;
  
  // Get the subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update the subscription in the database
  await handleSubscriptionChange(subscription);
} 