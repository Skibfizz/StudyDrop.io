'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '@/lib/supabase';

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("SupabaseProvider: Initializing auth state");
    
    // Check current user on mount
    getCurrentUser()
      .then(user => {
        console.log("SupabaseProvider: getCurrentUser result:", {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email
        });
        setUser(user);
      })
      .catch(error => {
        console.error("SupabaseProvider: Error getting current user:", error);
      })
      .finally(() => {
        console.log("SupabaseProvider: Finished initial auth check");
        setLoading(false);
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("SupabaseProvider: Auth state changed:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("SupabaseProvider: Unsubscribing from auth changes");
      subscription.unsubscribe();
    };
  }, []);

  console.log("SupabaseProvider: Current auth state:", {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    loading
  });

  return (
    <SupabaseContext.Provider value={{ user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}; 