import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

interface Subscription {
  tier: SubscriptionTier;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  status: string;
}

export function useSubscription() {
  const { user } = useSupabase();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setSubscription(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message);
        // Set default free tier if no subscription found
        setSubscription({
          tier: 'free',
          cancel_at_period_end: false,
          status: 'active'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to realtime subscription changes
    const subscriptionChannel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Subscription>) => {
          console.log('Subscription changed:', payload);
          if (payload.new && 'tier' in payload.new) {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      subscriptionChannel.unsubscribe();
    };
  }, [user]);

  const isSubscribed = subscription?.tier !== 'free';
  const isPro = subscription?.tier === 'pro';
  const isBasic = subscription?.tier === 'basic';
  const isCanceled = subscription?.cancel_at_period_end;

  return {
    subscription,
    loading,
    error,
    isSubscribed,
    isPro,
    isBasic,
    isCanceled,
  };
} 