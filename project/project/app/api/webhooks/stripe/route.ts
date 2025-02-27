import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

async function updateSubscriptionInDatabase(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!('metadata' in customer) || customer.deleted) {
    console.error('Invalid customer or customer is deleted:', customerId);
    return;
  }

  const userId = customer.metadata.userId;
  if (!userId) {
    console.error('No userId found in customer metadata:', customerId);
    return;
  }

  // Determine subscription tier based on price ID
  const priceId = subscription.items.data[0].price.id;
  const tier = priceId === process.env.STRIPE_PRO_PRICE_ID
    ? 'pro'
    : priceId === process.env.STRIPE_BASIC_PRICE_ID
    ? 'basic'
    : 'free';

  // Update subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error updating subscription in database:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

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

  // Get the user from Supabase auth using the new SSR pattern
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      } as any,
    }
  );

  try {
    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionInDatabase(subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const customerId = deletedSubscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if ('metadata' in customer && !customer.deleted) {
          const userId = customer.metadata.userId;
          if (userId) {
            // Update user to free tier
            await supabase
              .from('subscriptions')
              .update({
                tier: 'free',
                updated_at: new Date().toISOString(),
                status: 'canceled',
              })
              .eq('user_id', userId);
          }
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // If this is a subscription, sync it to our database
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await updateSubscriptionInDatabase(subscription, supabase);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
} 