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

    if (!session?.user) {
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
    
    // If we have a payment link ID and it's in our mapping, use that tier
    if (paymentLinkId && PAYMENT_LINKS[paymentLinkId]) {
      tier = PAYMENT_LINKS[paymentLinkId].plan;
    } else {
      // Try to extract the payment link ID from the referrer URL
      const referrer = req.headers.get('referer');
      if (referrer) {
        const extractedLinkId = getPaymentLinkIdFromUrl(referrer);
        if (extractedLinkId && PAYMENT_LINKS[extractedLinkId]) {
          tier = PAYMENT_LINKS[extractedLinkId].plan;
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
      }
    }

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
  } catch (error) {
    console.error('Error processing payment link success:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=processing_error`
    );
  }
} 