import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tier, reason } = await request.json();
    
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
    }
    
    // Validate tier value
    if (!['free', 'basic', 'pro'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier value. Must be one of: free, basic, pro' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Update the user's subscription tier
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({ 
        tier,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (subscriptionError) {
      console.error('Error updating subscription tier:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to update subscription tier' },
        { status: 500 }
      );
    }
    
    // The trigger will automatically update the pricing_tier_tracking table
    
    return NextResponse.json({
      success: true,
      message: `Subscription tier updated to ${tier}`,
      data: subscription
    });
  } catch (error) {
    console.error('Error in update-tier API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 