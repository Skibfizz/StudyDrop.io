import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useUser } from './use-user';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setSubscription(data as Subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const isSubscriptionActive = () => {
    return (
      subscription?.status === 'active' &&
      (subscription?.tier === 'basic' || subscription?.tier === 'pro')
    );
  };

  const isSubscriptionExpiring = () => {
    return (
      subscription?.cancel_at_period_end === true &&
      subscription?.current_period_end !== null
    );
  };

  const getExpiryDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  };

  const getRenewalDate = () => {
    if (!subscription?.current_period_end || subscription?.cancel_at_period_end) return null;
    return new Date(subscription.current_period_end);
  };

  const canAccessFeature = (feature: 'video_summaries' | 'flashcard_sets' | 'text_humanizations') => {
    if (!subscription) return false;
    
    // Free tier has limited access
    if (subscription.tier === 'free') {
      return true; // They can access but with limits
    }
    
    // Basic and Pro tiers have access to all features
    return true;
  };

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
    isSubscriptionActive,
    isSubscriptionExpiring,
    getExpiryDate,
    getRenewalDate,
    canAccessFeature,
    tier: subscription?.tier || 'free'
  };
} 