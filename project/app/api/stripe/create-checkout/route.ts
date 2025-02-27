import { stripe, PLANS } from '@/lib/stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Check if Stripe API key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return new NextResponse('Stripe API key not configured', { status: 503 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { planId } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // Check if price ID is configured
    if (!plan.priceId) {
      return new NextResponse('Stripe price ID not configured for this plan', { status: 503 });
    }

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: session.user.email!,
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
        planId,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId,
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