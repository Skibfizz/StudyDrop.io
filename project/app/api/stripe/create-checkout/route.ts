import { stripe, PLANS } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Check if Stripe API key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return new NextResponse('Stripe API key not configured', { status: 503 });
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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { planId } = await req.json();
    
    // Convert planId to lowercase to match the keys in PLANS
    const normalizedPlanId = planId.toLowerCase();
    const plan = PLANS[normalizedPlanId as keyof typeof PLANS];

    if (!plan) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // Free plan doesn't need checkout
    if (normalizedPlanId === 'free') {
      // Update the user's subscription to free tier
      await supabase
        .from('subscriptions')
        .update({
          tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      return NextResponse.json({ 
        success: true,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&plan=free` 
      });
    }

    // Check if price ID is configured
    if (!plan.priceId) {
      return new NextResponse('Stripe price ID not configured for this plan', { status: 503 });
    }

    // Get the user's current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer: subscription?.stripe_customer_id || undefined,
      customer_email: !subscription?.stripe_customer_id ? session.user.email! : undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: normalizedPlanId,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: normalizedPlanId,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 