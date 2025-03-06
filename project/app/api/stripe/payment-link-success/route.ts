import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { PAYMENT_LINKS, getPaymentLinkIdFromUrl } from '@/lib/payment-links';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get('payment_intent');
    const paymentLinkId = url.searchParams.get('payment_link');
    const anonymousId = url.searchParams.get('anonymous_id');
    
    console.log("Payment link success handler called:", {
      paymentIntentId,
      paymentLinkId,
      anonymousId
    });
    
    if (!paymentIntentId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=missing_payment_intent`
      );
    }

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
    
    // Check for payment intent cookie
    const paymentIntentCookie = cookieStore.get('studydrop_payment_intent');
    let paymentIntentData = null;
    
    if (paymentIntentCookie) {
      try {
        paymentIntentData = JSON.parse(paymentIntentCookie.value);
        console.log("Found payment intent cookie:", paymentIntentData);
      } catch (e) {
        console.error("Error parsing payment intent cookie:", e);
      }
    }
    
    // Check if this is an anonymous user
    const isAnonymous = !session?.user && (anonymousId || (paymentIntentData && paymentIntentData.is_anonymous));
    const anonId = anonymousId || (paymentIntentData && paymentIntentData.user_id);
    
    console.log("Authentication status:", {
      hasSession: !!session,
      isAnonymous,
      anonymousId: anonId
    });

    // If no authenticated user and no anonymous ID, redirect to sign in
    if (!session?.user && !isAnonymous) {
      console.log("No authenticated user and no anonymous tracking, redirecting to sign in");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signin?redirect=/api/stripe/payment-link-success?payment_intent=${paymentIntentId}`
      );
    }

    // Retrieve the payment intent to get payment details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=payment_failed`
      );
    }

    // Determine which plan was purchased based on the payment link ID
    let tier: 'free' | 'basic' | 'pro' = 'free';
    
    // If we have payment intent data with a plan, use that
    if (paymentIntentData && paymentIntentData.plan) {
      tier = paymentIntentData.plan;
      console.log("Using plan from payment intent cookie:", tier);
    }
    // If we have a payment link ID and it's in our mapping, use that tier
    else if (paymentLinkId && PAYMENT_LINKS[paymentLinkId]) {
      tier = PAYMENT_LINKS[paymentLinkId].plan;
      console.log("Using plan from payment link ID:", tier);
    } else {
      // Try to extract the payment link ID from the referrer URL
      const referrer = req.headers.get('referer');
      if (referrer) {
        const extractedLinkId = getPaymentLinkIdFromUrl(referrer);
        if (extractedLinkId && PAYMENT_LINKS[extractedLinkId]) {
          tier = PAYMENT_LINKS[extractedLinkId].plan;
          console.log("Using plan from referrer URL:", tier);
        }
      }
      
      // If we still don't have a tier, determine based on the amount paid
      if (tier === 'free') {
        const amountPaid = paymentIntent.amount / 100; // Convert from cents to dollars/pounds
        
        if (amountPaid >= 3.99) {
          tier = 'pro';
        } else if (amountPaid >= 1.99) {
          tier = 'basic';
        }
        console.log("Determined plan based on amount paid:", tier);
      }
    }

    // If this is an authenticated user, update their subscription
    if (session?.user) {
      console.log("Processing payment for authenticated user:", session.user.id);
      
      // Get the user's current subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // Calculate subscription period (1 week from now)
      const now = new Date();
      const oneWeekLater = new Date(now);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);

      if (subscription) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            tier,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: oneWeekLater.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('user_id', session.user.id);
      } else {
        // Create new subscription
        await supabase
          .from('subscriptions')
          .insert({
            user_id: session.user.id,
            tier,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: oneWeekLater.toISOString()
          });
      }

      // Redirect to dashboard with success message
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&plan=${tier}`
      );
    } 
    // For anonymous users, store the payment info and redirect to sign up
    else if (isAnonymous && anonId) {
      console.log("Processing payment for anonymous user:", anonId);
      
      // Store the payment information in the pending_subscriptions table
      const { error } = await supabase
        .from('pending_subscriptions')
        .upsert({
          anonymous_id: anonId,
          payment_intent_id: paymentIntentId,
          intended_plan: tier,
          status: 'paid',
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error updating pending subscription:", error);
      }
      
      // Set a cookie with the payment information that will be used after sign up
      const response = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signin?redirect=/dashboard&message=payment_success`
      );
      
      response.cookies.set('studydrop_pending_subscription', JSON.stringify({
        anonymous_id: anonId,
        payment_intent_id: paymentIntentId,
        plan: tier,
        timestamp: Date.now()
      }), { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax'
      });
      
      return response;
    }
    
    // Fallback redirect
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=processing_error`
    );
  } catch (error) {
    console.error('Error processing payment link success:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=processing_error`
    );
  }
} 