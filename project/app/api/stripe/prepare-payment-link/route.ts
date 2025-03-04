import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PAYMENT_LINKS } from '@/lib/payment-links';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    console.log("prepare-payment-link API called");
    
    // Get the user from Supabase auth
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
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
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    console.log("API auth session check result:", {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    if (!session?.user) {
      console.log("API: No session detected, returning 401");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    console.log("API: Processing plan:", planId);
    
    // Convert planId to lowercase to match the keys in PLANS
    const normalizedPlanId = planId.toLowerCase();
    
    // Find the payment link for this plan
    let paymentLinkUrl = '';
    let paymentLinkId = '';
    
    for (const linkId in PAYMENT_LINKS) {
      if (PAYMENT_LINKS[linkId].plan === normalizedPlanId) {
        paymentLinkUrl = PAYMENT_LINKS[linkId].url;
        paymentLinkId = linkId;
        break;
      }
    }
    
    console.log("API: Found payment link:", { paymentLinkUrl, paymentLinkId });
    
    if (!paymentLinkUrl) {
      console.log("API: No payment link found for plan:", normalizedPlanId);
      return NextResponse.json({ error: 'Payment link not found for this plan' }, { status: 404 });
    }
    
    // Get or create a customer for this user
    let customerId: string | null = null;
    
    // Check if the user already has a customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();
    
    console.log("API: Existing subscription data:", subscription);
    
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
      console.log("API: Using existing customer ID:", customerId);
    } else {
      // Create a new customer
      console.log("API: Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          user_id: session.user.id
        }
      });
      
      customerId = customer.id;
      console.log("API: Created new customer ID:", customerId);
      
      // Update or create the subscription record with the customer ID
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: session.user.id,
          stripe_customer_id: customerId,
          tier: 'free', // Default tier until payment is complete
          status: 'inactive',
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('API: Error updating subscription with customer ID:', error);
      }
    }
    
    // For now, we'll just use the static payment link
    // The webhook will handle updating the subscription when payment is complete
    console.log("API: Returning payment link URL:", paymentLinkUrl);
    
    return NextResponse.json({ 
      url: paymentLinkUrl,
      customer_id: customerId
    });
  } catch (error) {
    console.error('Error in prepare-payment-link:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 