'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { supabase, getSession } from '@/lib/supabase';

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  console.log('🏁 SupabaseProvider initializing');
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const initAttempts = useRef(0);
  const sessionChecks = useRef(0);

  useEffect(() => {
    let mounted = true;
    console.log('🔄 SupabaseProvider effect running', {
      attempt: initAttempts.current + 1,
      sessionChecks: sessionChecks.current,
      timestamp: new Date().toISOString()
    });

    // Check current user on mount
    const initializeAuth = async () => {
      try {
        sessionChecks.current += 1;
        console.log('🎯 Starting auth initialization:', {
          attempt: initAttempts.current + 1,
          sessionCheck: sessionChecks.current,
          timestamp: new Date().toISOString()
        });

        // Get session using debug-enhanced getter
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error details:', {
            error: sessionError,
            code: sessionError.code,
            message: sessionError.message,
            attempt: initAttempts.current + 1,
            sessionCheck: sessionChecks.current,
            timestamp: new Date().toISOString()
          });
          throw sessionError;
        }

        if (session?.user) {
          console.log('✅ Valid session found:', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider,
            attempt: initAttempts.current + 1,
            sessionCheck: sessionChecks.current,
            timestamp: new Date().toISOString()
          });
          
          if (mounted) {
            setUser(session.user);
            setLoading(false);
          }
          return;
        }

        console.log('⚠️ No valid session found:', {
          attempt: initAttempts.current + 1,
          sessionCheck: sessionChecks.current,
          timestamp: new Date().toISOString()
        });

        if (mounted) {
          setUser(null);
          setLoading(false);
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          attempt: initAttempts.current + 1,
          sessionCheck: sessionChecks.current,
          timestamp: new Date().toISOString()
        });
        
        if (mounted) {
          setAuthError(error instanceof Error ? error : new Error('Auth initialization failed'));
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      sessionChecks.current += 1;
      console.log('🔔 Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        attempt: initAttempts.current,
        sessionCheck: sessionChecks.current,
        timestamp: new Date().toISOString()
      });
      
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    initAttempts.current += 1;

    return () => {
      console.log('🧹 Cleaning up auth effect:', {
        attempt: initAttempts.current,
        sessionChecks: sessionChecks.current,
        timestamp: new Date().toISOString()
      });
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  console.log('🎯 SupabaseProvider render:', {
    hasUser: !!user,
    userId: user?.id,
    isLoading: loading,
    hasError: !!authError,
    attempts: initAttempts.current,
    sessionChecks: sessionChecks.current,
    timestamp: new Date().toISOString()
  });

  if (authError) {
    console.error('🚨 Auth error:', {
      message: authError.message,
      attempt: initAttempts.current,
      sessionChecks: sessionChecks.current,
      timestamp: new Date().toISOString()
    });
  }

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