import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎣 useUser hook initializing');

    // Get initial user
    const getInitialUser = async () => {
      console.log('👤 Fetching initial user state');
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      console.log('👥 Initial user state:', {
        hasUser: !!initialUser,
        userId: initialUser?.id,
        email: initialUser?.email,
      });
      setUser(initialUser);
      setLoading(false);
    };

    getInitialUser();

    // Listen for auth changes
    console.log('👂 Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('🧹 Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 