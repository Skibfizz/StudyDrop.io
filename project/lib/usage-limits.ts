import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UsageType = 'video_summaries' | 'flashcard_sets' | 'text_humanizations';

export async function checkAndIncrementUsage(
  userId: string,
  usageType: UsageType
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await supabase.rpc(
      'check_and_increment_usage',
      {
        p_user_id: userId,
        p_usage_type: usageType,
        p_increment: 1
      }
    );

    if (error) {
      console.error('Error checking usage:', error);
      return {
        success: false,
        message: 'Failed to check usage limits. Please try again later.'
      };
    }

    if (!data) {
      return {
        success: false,
        message: 'You have reached your usage limit for this feature. Please upgrade your plan for more access.'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in checkAndIncrementUsage:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    };
  }
}

export async function getUserUsage(userId: string) {
  try {
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError) {
      console.error('Error fetching usage:', usageError);
      return null;
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return null;
    }

    const tier = (subscription?.tier || 'free') as 'free' | 'basic' | 'pro';
    const limits = {
      free: {
        video_summaries: 5,
        flashcard_sets: 5,
        text_humanizations: 10
      },
      basic: {
        video_summaries: 20,
        flashcard_sets: 20,
        text_humanizations: 40
      },
      pro: {
        video_summaries: 1000,
        flashcard_sets: 1000,
        text_humanizations: 500
      }
    } as const;

    return {
      usage: {
        video_summaries: usage?.video_summaries_count || 0,
        flashcard_sets: usage?.flashcard_sets_count || 0,
        text_humanizations: usage?.text_humanizations_count || 0
      },
      limits: limits[tier],
      tier
    };
  } catch (error) {
    console.error('Error in getUserUsage:', error);
    return null;
  }
} 