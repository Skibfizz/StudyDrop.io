import { PlanType } from './stripe';

// This file maps Stripe payment link IDs to subscription plans
// Update these with your actual payment link IDs from Stripe

export const PAYMENT_LINKS: Record<string, { plan: PlanType, url: string }> = {
  // Basic plan payment link
  'plink_1PXYZxyz123456': { 
    plan: 'basic',
    url: 'https://buy.stripe.com/8wMeWz8bCdtNbqU7st' // Basic plan payment link
  },
  
  // Pro plan payment link
  'plink_1PXYZabc789012': { 
    plan: 'pro',
    url: 'https://buy.stripe.com/9AQcOr8bCcpJamQ8wy' // Pro plan payment link
  }
};

// Helper function to get payment link ID from URL
export function getPaymentLinkIdFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/');
    // The last segment of the path is typically the payment link ID
    const potentialId = pathSegments[pathSegments.length - 1];
    
    // Check if this ID exists in our mapping
    for (const linkId in PAYMENT_LINKS) {
      if (linkId === potentialId || PAYMENT_LINKS[linkId].url.includes(potentialId)) {
        return linkId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing payment link URL:', error);
    return null;
  }
}

// Helper function to get plan from payment link URL
export function getPlanFromPaymentLinkUrl(url: string): PlanType | null {
  for (const linkId in PAYMENT_LINKS) {
    if (PAYMENT_LINKS[linkId].url === url) {
      return PAYMENT_LINKS[linkId].plan;
    }
  }
  
  // Try to extract the ID from the URL and match it
  const linkId = getPaymentLinkIdFromUrl(url);
  if (linkId && PAYMENT_LINKS[linkId]) {
    return PAYMENT_LINKS[linkId].plan;
  }
  
  return null;
} 