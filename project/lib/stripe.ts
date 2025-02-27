import Stripe from 'stripe';

// Use a dummy key if STRIPE_SECRET_KEY is not available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_process';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export const PLANS = {
  basic: {
    name: 'Basic',
    description: 'Perfect for getting started',
    features: [
      'Access to AI-powered study tools',
      'Basic flashcard creation',
      'Limited YouTube video processing',
      'Email support',
    ],
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_placeholder',
  },
  pro: {
    name: 'Pro',
    description: 'For serious learners',
    features: [
      'All Basic features',
      'Unlimited flashcard creation',
      'Advanced YouTube video processing',
      'Priority support',
      'Custom study plans',
      'Progress analytics',
    ],
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
  },
} as const;

export type PlanType = keyof typeof PLANS; 