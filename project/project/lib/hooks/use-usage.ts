import { useEffect, useState } from 'react';
import { useSupabase } from '@/project/context/supabase-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/project/components/ui/use-toast';

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
  const supabase = createClientComponentClient();
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
      
      // Check if tables exist by attempting to count rows
      const { count: subscriptionCount, error: countError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

      console.log('🔍 Checking database tables:', {
        subscriptionsTableExists: countError ? false : true,
        error: countError?.message,
        details: countError?.details,
        hint: countError?.hint,
        code: countError?.code,
        timestamp: new Date().toISOString()
      });

      // Get current subscription tier
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user?.id)
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

      if (subscriptionError) {
        console.error('❌ Error fetching subscription:', subscriptionError);
        throw subscriptionError;
      }

      // Get current usage with detailed error logging
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user?.id)
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

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('❌ Error fetching usage:', usageError);
        throw usageError;
      }

      const tier = subscription?.tier || 'free';
      const currentUsage = usage || {
        video_summaries_count: 0,
        flashcard_sets_count: 0,
        text_humanizations_count: 0
      };

      setUsageData({
        usage: {
          video_summaries: currentUsage.video_summaries_count,
          flashcard_sets: currentUsage.flashcard_sets_count,
          text_humanizations: currentUsage.text_humanizations_count
        },
        limits: TIER_LIMITS[tier],
        tier
      });
    } catch (error) {
      console.error('❌ Error in fetchUsage:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : undefined,
        details: error instanceof Error ? (error as any).details : undefined,
        hint: error instanceof Error ? (error as any).hint : undefined,
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Error",
        description: "Failed to fetch usage data. Database tables might not be set up.",
        variant: "destructive"
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
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🔍 Checking usage limits for:', {
        userId: user.id,
        usageType,
        timestamp: new Date().toISOString()
      });

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
        timestamp: new Date().toISOString()
      });

      if (error) throw error;

      if (!allowed) {
        console.log('⚠️ Usage limit reached for:', usageType);
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your ${usageType.replace('_', ' ')} limit. Please upgrade your plan for more access.`,
          variant: "destructive"
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
        variant: "destructive"
      });
      return false;
    }
  };

  const getRemainingUsage = (usageType: UsageType): number => {
    if (!usageData) return 0;
    const current = usageData.usage[usageType];
    const limit = usageData.limits[usageType];
    return Math.max(0, limit - current);
  };

  const getUsagePercentage = (usageType: UsageType): number => {
    if (!usageData) return 0;
    const current = usageData.usage[usageType];
    const limit = usageData.limits[usageType];
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