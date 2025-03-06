import { useEffect, useState, useRef } from 'react';
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

// Default subscription state to prevent layout shifts
const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: 'free',
  cancel_at_period_end: false,
  status: 'active'
};

export function useSubscription() {
  const { user } = useSupabase();
  // Initialize with default subscription to prevent layout shifts
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      // Prevent concurrent fetches
      if (fetchInProgress.current) {
        console.log("Fetch already in progress, skipping duplicate request");
        return;
      }
      
      fetchInProgress.current = true;
      
      if (!user) {
        console.log("No user found, using default subscription state");
        if (isMounted.current) {
          // Keep the default subscription state
          setLoading(false);
        }
        fetchInProgress.current = false;
        return;
      }

      console.log("Fetching subscription data for user:", user.id);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        console.log("Subscription data fetched successfully:", data);
        if (isMounted.current) {
          setSubscription(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        if (isMounted.current) {
          setError(err.message);
          // Keep using the default subscription state
          console.log("Using default subscription state after error");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        fetchInProgress.current = false;
      }
    };

    // Reset loading state when user changes
    if (isMounted.current) {
      setLoading(true);
    }
    
    fetchSubscription();

    // Subscribe to realtime subscription changes
    let subscriptionChannel: any = null;
    
    if (user) {
      subscriptionChannel = supabase
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
            console.log('Subscription realtime update received:', payload);
            if (payload.new && 'tier' in payload.new && isMounted.current) {
              console.log('Updating subscription state with realtime data:', payload.new);
              setSubscription(payload.new as Subscription);
            }
          }
        )
        .subscribe();

      console.log('Subscription realtime channel subscribed');
    }

    return () => {
      if (subscriptionChannel) {
        subscriptionChannel.unsubscribe();
        console.log('Subscription realtime channel unsubscribed');
      }
    };
  }, [user]);

  // Derived states - compute these values once when subscription changes
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