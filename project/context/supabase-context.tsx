'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  
  // Add counters to track state changes
  const userChangeCount = useRef(0);
  const authStateChangeCount = useRef(0);
  const mountTimestamp = useRef(Date.now());
  
  // Memoized function to update user state only if needed
  const updateUser = useCallback((newUser: User | null) => {
    // Check if user is actually different to avoid unnecessary state updates
    const currentUserId = user?.id;
    const newUserId = newUser?.id;
    
    // Compare user IDs and email to determine if we need to update
    const userChanged = 
      currentUserId !== newUserId || 
      user?.email !== newUser?.email;
    
    if (userChanged) {
      userChangeCount.current += 1;
      console.log("SupabaseProvider: User changed, updating state", {
        userChangeCount: userChangeCount.current,
        from: currentUserId,
        to: newUserId
      });
      
      setUser(newUser);
      return true;
    } else {
      console.log("SupabaseProvider: User is the same, skipping update");
      return false;
    }
  }, [user]);

  useEffect(() => {
    console.log("SupabaseProvider: Initializing auth state", {
      timestamp: new Date().toISOString()
    });
    console.log("SupabaseProvider: Mount timestamp:", mountTimestamp.current);
    
    let isMounted = true;
    
    // Check current user on mount
    getCurrentUser()
      .then(user => {
        console.log("SupabaseProvider: getCurrentUser result:", {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          timeSinceMount: (Date.now() - mountTimestamp.current) / 1000,
          timestamp: new Date().toISOString()
        });
        
        if (isMounted) {
          const userUpdated = updateUser(user);
          console.log("SupabaseProvider: User updated from getCurrentUser:", {
            userUpdated,
            userId: user?.id,
            timestamp: new Date().toISOString()
          });
          setLoading(false);
        }
      })
      .catch(error => {
        console.error("SupabaseProvider: Error getting current user:", error);
        if (isMounted) {
          setLoading(false);
        }
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      authStateChangeCount.current += 1;
      console.log("SupabaseProvider: Auth state changed:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        authStateChangeCount: authStateChangeCount.current,
        timeSinceMount: (Date.now() - mountTimestamp.current) / 1000
      });
      
      if (isMounted) {
        // Only update user if it's different
        updateUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      console.log("SupabaseProvider: Unsubscribing from auth changes");
      subscription.unsubscribe();
    };
  }, [updateUser]);
  
  // Log when user state changes
  useEffect(() => {
    console.log("SupabaseProvider: User state changed:", {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      userChangeCount: userChangeCount.current,
      timeSinceMount: (Date.now() - mountTimestamp.current) / 1000,
      timestamp: new Date().toISOString()
    });
  }, [user]);

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

export const useSupabase = () => useContext(SupabaseContext); 