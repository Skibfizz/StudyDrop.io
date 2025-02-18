import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    name: 'Basic',
    price: 1.99,
    interval: 'week',
    currency: 'gbp',
    features: [
      "20 Summarised Video lectures",
      "20 Flashcard Sets (300)",
      "40 Text humanizations",
      "B1 Generation Speed"
    ]
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro',
    price: 3.99,
    interval: 'week',
    currency: 'gbp',
    features: [
      "1000 Summarised Video Lectures",
      "1000 FlashCard Sets (15k)",
      "500 Text Humanizations",
      "A1-Super Generation Speed"
    ]
  }
} as const;

export type PlanType = keyof typeof PLANS; 