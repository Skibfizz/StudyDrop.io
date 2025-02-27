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
      'Access to AI-powered study tools',
      'Basic flashcard creation',
      'Limited YouTube video processing',
      'Email support',
    ],
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
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
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const;

export type PlanType = keyof typeof PLANS; 