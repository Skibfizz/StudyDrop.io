import Stripe from 'stripe';

// Use a dummy key if STRIPE_SECRET_KEY is not available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_process';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    features: [
      '5 Summarised Video lectures',
      '5 FlashCard Sets (75)',
      '10 text humanizations',
      'C1 Generation Speed'
    ],
    price: 0,
    priceId: null, // Free plan doesn't have a price ID
  },
  basic: {
    name: 'Basic',
    description: 'For institutions & teams',
    features: [
      '20 Summarised Video lectures',
      '20 Flashcard Sets (300)',
      '40 Text humanizations',
      'B1 Generation Speed'
    ],
    price: 1.99,
    period: '/week',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_placeholder',
  },
  pro: {
    name: 'Pro',
    description: 'For dedicated learners',
    features: [
      '1000 Summarised Video Lectures',
      '1000 FlashCard Sets (15k)',
      '500 Text Humanizations',
      'A1-Super Generation Speed'
    ],
    price: 3.99,
    period: '/week',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
  },
} as const;

export type PlanType = keyof typeof PLANS; 