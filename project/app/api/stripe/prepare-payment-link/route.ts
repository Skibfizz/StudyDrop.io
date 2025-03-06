import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PAYMENT_LINKS } from '@/lib/payment-links';
import { stripe } from '@/lib/stripe';

// Define a simple function to generate a random ID instead of using uuid
function generateRandomId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(req: Request) {
  try {
    console.log("prepare-payment-link API called");
    
    // Parse the request body first
    const { planId, anonymousId } = await req.json();
    console.log("API: Processing plan:", planId, "Anonymous ID:", anonymousId);
    
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
      anonymousId: anonymousId
    });

    // Handle both authenticated and anonymous users
    let userId: string;
    let userEmail: string | null = null;
    let isAnonymous = false;
    
    if (!session?.user) {
      console.log("API: No authenticated session detected, processing as anonymous user");
      isAnonymous = true;
      
      // Use the provided anonymousId or generate a new one
      userId = anonymousId || generateRandomId();
      userEmail = null;
      
      // Set a cookie to track this anonymous user
      const response = NextResponse.next();
      if (userId) {
        response.cookies.set('studydrop_anonymous_id', userId, { 
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          sameSite: 'lax'
        });
      }
    } else {
      userId = session.user.id;
      userEmail = session.user.email || null;
    }
    
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
    
    if (!isAnonymous) {
      // For authenticated users, check if they already have a customer ID
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();
      
      console.log("API: Existing subscription data:", subscription);
      
      if (subscription?.stripe_customer_id) {
        customerId = subscription.stripe_customer_id;
        console.log("API: Using existing customer ID:", customerId);
      }
    }
    
    // If no customer ID found or anonymous user, create a new one
    if (!customerId) {
      // Create a new customer
      console.log("API: Creating new Stripe customer");
      
      const customerData: any = {
        metadata: {
          user_id: userId,
          is_anonymous: isAnonymous ? 'true' : 'false'
        }
      };
      
      // Add email only if it exists
      if (userEmail) {
        customerData.email = userEmail;
      }
      
      // Add anonymous_id to metadata if this is an anonymous user
      if (isAnonymous) {
        customerData.metadata.anonymous_id = userId;
      }
      
      const customer = await stripe.customers.create(customerData);
      
      customerId = customer.id;
      console.log("API: Created new customer ID:", customerId);
      
      // For authenticated users, update the subscription record
      if (!isAnonymous) {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            tier: 'free', // Default tier until payment is complete
            status: 'inactive',
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('API: Error updating subscription with customer ID:', error);
        }
      } else {
        // For anonymous users, store the information in a pending_subscriptions table
        const { error } = await supabase
          .from('pending_subscriptions')
          .insert({
            anonymous_id: userId,
            stripe_customer_id: customerId,
            intended_plan: normalizedPlanId,
            created_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('API: Error creating pending subscription:', error);
          // Continue even if this fails - we'll rely on the webhook
        }
      }
    }
    
    // Create a custom success URL with query parameters to track the payment
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://studydrop.io'}/api/stripe/payment-link-success`);
    successUrl.searchParams.append('payment_link', paymentLinkId);
    if (isAnonymous) {
      successUrl.searchParams.append('anonymous_id', userId);
    }
    
    // For now, we'll just use the static payment link
    // The webhook will handle updating the subscription when payment is complete
    console.log("API: Returning payment link URL:", paymentLinkUrl);
    
    // Create a response with the cookie
    const response = NextResponse.json({ 
      url: paymentLinkUrl,
      customer_id: customerId,
      success_url: successUrl.toString()
    });
    
    // Set a cookie to track this user/payment
    response.cookies.set('studydrop_payment_intent', JSON.stringify({
      plan: normalizedPlanId,
      customer_id: customerId,
      user_id: userId,
      is_anonymous: isAnonymous,
      timestamp: Date.now()
    }), { 
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Error in prepare-payment-link:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 