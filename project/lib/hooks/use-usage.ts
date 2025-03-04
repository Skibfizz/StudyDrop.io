import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

export type UsageType = 'video_summaries' | 'flashcard_sets' | 'text_humanizations';

export interface UsageLimits {
  video_summaries: number;
  flashcard_sets: number;
  text_humanizations: number;
}

export interface UsageData {
  usage: {
    video_summaries: number;
    flashcard_sets: number;
    text_humanizations: number;
  };
  limits: UsageLimits;
  tier: 'free' | 'basic' | 'pro';
}

export function useUsage() {
  const { user } = useSupabase();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { toast } = useToast();

  // Define limits for each tier
  const TIER_LIMITS: Record<string, UsageLimits> = {
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
  };

  useEffect(() => {
    console.log('🔑 useUsage hook - Auth state:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      timestamp: new Date().toISOString()
    });

    if (user) {
      fetchUsage();
    } else {
      setUsageData(null);
      setLoading(false);
      console.log('⚠️ No authenticated user found');
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      console.log('📊 Fetching usage data for user:', user?.id);
      
      // If no user is found, use default free tier data
      if (!user) {
        console.log('⚠️ No user found, using default free tier data');
        setUsageData({
          usage: {
            video_summaries: 0,
            flashcard_sets: 0,
            text_humanizations: 0
          },
          limits: TIER_LIMITS['free'],
          tier: 'free'
        });
        setLoading(false);
        return;
      }
      
      // First, ensure the user has a subscription record
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      console.log('💳 Subscription query result:', {
        success: !subscriptionError,
        error: subscriptionError?.message,
        details: subscriptionError?.details,
        hint: subscriptionError?.hint,
        code: subscriptionError?.code,
        data: subscription,
        timestamp: new Date().toISOString()
      });

      // If subscription not found, create a default one
      if (subscriptionError && subscriptionError.code === 'PGRST116') { // PGRST116 is "no rows returned"
        console.log('⚠️ No subscription found, creating default subscription');
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, tier: 'free' })
          .single();
          
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('❌ Error creating default subscription:', insertError);
        }
      }

      // Default to free tier if subscription not found
      const tier = subscription?.tier || 'free';

      // Get current usage with detailed error logging
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📈 Usage query result:', {
        success: !usageError,
        error: usageError?.message,
        details: usageError?.details,
        hint: usageError?.hint,
        code: usageError?.code,
        data: usage,
        timestamp: new Date().toISOString()
      });

      // If usage record not found, create a default one
      if (usageError && usageError.code === 'PGRST116') { // PGRST116 is "no rows returned"
        console.log('⚠️ No usage record found, creating default usage record');
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({ 
            user_id: user.id, 
            video_summaries_count: 0,
            flashcard_sets_count: 0,
            text_humanizations_count: 0,
            reset_date: new Date().toISOString()
          })
          .single();
          
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('❌ Error creating default usage record:', insertError);
        }
      }

      // Fetch the usage data again after creating default records
      if ((subscriptionError && subscriptionError.code === 'PGRST116') || 
          (usageError && usageError.code === 'PGRST116')) {
        console.log('🔄 Fetching usage data again after creating default records');
        
        const { data: refreshedSubscription } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single();
          
        const { data: refreshedUsage } = await supabase
          .from('usage_tracking')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // Use the refreshed data if available
        const finalTier = refreshedSubscription?.tier || tier;
        const finalUsage = refreshedUsage || usage || {
          video_summaries_count: 0,
          flashcard_sets_count: 0,
          text_humanizations_count: 0
        };
        
        setUsageData({
          usage: {
            video_summaries: finalUsage.video_summaries_count || 0,
            flashcard_sets: finalUsage.flashcard_sets_count || 0,
            text_humanizations: finalUsage.text_humanizations_count || 0
          },
          limits: TIER_LIMITS[finalTier],
          tier: finalTier as 'free' | 'basic' | 'pro'
        });
      } else {
        // Default to zero usage if not found
        const currentUsage = usage || {
          video_summaries_count: 0,
          flashcard_sets_count: 0,
          text_humanizations_count: 0
        };

        setUsageData({
          usage: {
            video_summaries: currentUsage.video_summaries_count || 0,
            flashcard_sets: currentUsage.flashcard_sets_count || 0,
            text_humanizations: currentUsage.text_humanizations_count || 0
          },
          limits: TIER_LIMITS[tier],
          tier
        });
      }
    } catch (error) {
      console.error('❌ Error in fetchUsage:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : undefined,
        details: error instanceof Error ? (error as any).details : undefined,
        hint: error instanceof Error ? (error as any).hint : undefined,
        timestamp: new Date().toISOString()
      });
      
      // Fallback to default free tier data on error
      setUsageData({
        usage: {
          video_summaries: 0,
          flashcard_sets: 0,
          text_humanizations: 0
        },
        limits: TIER_LIMITS['free'],
        tier: 'free'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndIncrementUsage = async (usageType: UsageType): Promise<boolean> => {
    if (!user) {
      console.log('❌ No user found for usage check');
      toast({
        title: "Error",
        description: "You must be logged in to use this feature",
        variant: "error"
      });
      return false;
    }

    try {
      console.log('🔍 Checking usage limits for:', {
        userId: user.id,
        email: user.email,
        usageType,
        timestamp: new Date().toISOString()
      });

      // First, ensure the user has a subscription record
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('❌ Error fetching subscription:', {
          error: subscriptionError.message,
          details: subscriptionError.details,
          hint: subscriptionError.hint,
          code: subscriptionError.code,
          userId: user.id
        });
        
        // Create a default subscription for this user if it doesn't exist
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, tier: 'free' })
          .single();
          
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('❌ Error creating default subscription:', insertError);
        }
      }

      // Then, ensure the user has a usage tracking record
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (usageError && usageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('❌ Error fetching usage:', {
          error: usageError.message,
          details: usageError.details,
          hint: usageError.hint,
          code: usageError.code,
          userId: user.id
        });
        
        // Create a default usage record for this user if it doesn't exist
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({ 
            user_id: user.id, 
            video_summaries_count: 0,
            flashcard_sets_count: 0,
            text_humanizations_count: 0,
            reset_date: new Date().toISOString()
          })
          .single();
          
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('❌ Error creating default usage record:', insertError);
        }
      }

      // Now check and increment usage
      const { data: allowed, error } = await supabase.rpc(
        'check_and_increment_usage',
        {
          p_user_id: user.id,
          p_usage_type: usageType,
          p_increment: 1
        }
      );

      console.log('✅ Usage check result:', {
        allowed,
        error: error?.message,
        userId: user.id,
        usageType,
        timestamp: new Date().toISOString()
      });

      if (error) throw error;

      if (!allowed) {
        console.log('⚠️ Usage limit reached for:', usageType);
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your ${usageType.replace('_', ' ')} limit. Please upgrade your plan for more access.`,
          variant: "error"
        });
        return false;
      }

      // Refresh usage data after successful increment
      await fetchUsage();
      return true;
    } catch (error) {
      console.error('❌ Error checking usage:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limits",
        variant: "error"
      });
      return false;
    }
  };

  const getRemainingUsage = (usageType: UsageType): number => {
    if (!usageData) return 0;
    const current = usageData.usage[usageType] || 0;
    const limit = usageData.limits[usageType] || 0;
    return Math.max(0, limit - current);
  };

  const getUsagePercentage = (usageType: UsageType): number => {
    if (!usageData) return 0;
    const current = usageData.usage[usageType] || 0;
    const limit = usageData.limits[usageType] || 0;
    if (limit === 0) return 0; // Prevent division by zero
    return (current / limit) * 100;
  };

  return {
    usageData,
    loading,
    checkAndIncrementUsage,
    getRemainingUsage,
    getUsagePercentage,
    refresh: fetchUsage
  };
} 