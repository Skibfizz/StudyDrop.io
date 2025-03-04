import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe.js library with your publishable key
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Parse URL query parameters
export const getQueryParams = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  // Use forEach instead of for...of to avoid downlevelIteration issues
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

// Check if the current page is a success redirect from Stripe
export const isSuccessfulCheckout = () => {
  const params = getQueryParams();
  return params.success === 'true';
};

// Check if the checkout was canceled
export const isCanceledCheckout = () => {
  const params = getQueryParams();
  return params.canceled === 'true';
};

// Get the session ID from the URL if available
export const getSessionId = () => {
  const params = getQueryParams();
  return params.session_id;
};

// Get the plan from the URL if available
export const getPlan = () => {
  const params = getQueryParams();
  return params.plan;
}; 