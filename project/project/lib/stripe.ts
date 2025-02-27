import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export const PLANS = {
  basic: {
    name: 'Basic',
    description: 'Perfect for getting started',
    features: [
      '20 video summaries per week',
      '20 flashcard sets per week',
      '40 text humanizations per week',
      'Email support',
    ],
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
  },
  pro: {
    name: 'Pro',
    description: 'For serious learners',
    features: [
      '1000 video summaries per week',
      '1000 flashcard sets per week',
      '500 text humanizations per week',
      'Priority support',
      'Custom study plans',
      'Progress analytics',
    ],
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession({
  priceId,
  userId,
  returnUrl,
}: {
  priceId: string;
  userId: string;
  returnUrl: string;
}) {
  try {
    // Get or create customer
    const { data: customers } = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    let customer: Stripe.Customer;
    if (customers.length > 0) {
      customer = customers[0];
    } else {
      customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/cancel`,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
} 