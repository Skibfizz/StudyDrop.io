import { createBrowserClient } from '@supabase/ssr';

// Add debug function to safely parse and log token
function debugToken(token: string) {
  try {
    // If token is an array-like string, parse it
    if (token.startsWith('[') && token.endsWith(']')) {
      const tokens = JSON.parse(token);
      return {
        isArray: true,
        tokenCount: tokens.length,
        firstToken: tokens[0]?.slice(0, 20) + '...',
        types: tokens.map((t: any) => t ? (t.startsWith('eyJ') ? 'JWT' : 'Other') : 'null')
      };
    }
    // Single token
    return {
      isArray: false,
      token: token.slice(0, 20) + '...',
      type: token.startsWith('eyJ') ? 'JWT' : 'Other'
    };
  } catch (e) {
    return { error: 'Failed to parse token' };
  }
}

console.log('📦 Initializing Supabase client with config:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  timestamp: new Date().toISOString()
});

// Create the Supabase client for client components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Wrap getSession to add debugging
const getSessionWithDebug = async () => {
  console.log('🔍 Getting session...');
  
  // Check cookies for auth token
  const authCookie = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.includes('auth-token'));

  if (authCookie) {
    console.log('🍪 Found auth cookie:', {
      tokenInfo: debugToken(authCookie.split('=')[1]),
      timestamp: new Date().toISOString()
    });
  }

  // Check localStorage
  const localToken = localStorage.getItem('supabase.auth.token');
  if (localToken) {
    console.log('💾 Found localStorage token:', {
      tokenInfo: debugToken(localToken),
      timestamp: new Date().toISOString()
    });
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('📊 Session result:', {
    hasSession: !!session,
    userId: session?.user?.id,
    error: error?.message,
    accessToken: session?.access_token ? debugToken(session.access_token) : null,
    timestamp: new Date().toISOString()
  });

  return { data: { session }, error };
};

export const getSession = getSessionWithDebug;

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string, username: string) => {
  console.log('📝 Starting email signup process...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('❌ Signup error:', {
      error,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  console.log('✅ Signup successful:', {
    userId: data.user?.id,
    sessionExists: !!data.session,
    timestamp: new Date().toISOString()
  });
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log('🔑 Starting email signin process...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Signin error:', {
      error,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  console.log('✅ Signin successful:', {
    userId: data.user?.id,
    sessionExists: !!data.session,
    session: {
      expiresAt: data.session?.expires_at
    },
    timestamp: new Date().toISOString()
  });

  // Check if session is properly stored
  const storedSession = await supabase.auth.getSession();
  console.log('🔍 Stored session check:', {
    hasStoredSession: !!storedSession.data.session,
    storedUserId: storedSession.data.session?.user?.id,
    timestamp: new Date().toISOString()
  });
  
  return data;
};

export const signInWithGoogle = async () => {
  console.log('🔑 Starting Google signin process...');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    console.error('❌ Google signin error:', {
      error,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  console.log('✅ Google signin initiated:', {
    hasData: !!data,
    timestamp: new Date().toISOString()
  });
  return data;
};

export const signOut = async () => {
  console.log('🚪 Starting signout process...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Signout error:', {
      error,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
  console.log('✅ Signout successful');
};

// Auth state management
export const getCurrentUser = async () => {
  console.log('👤 Getting current user...');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('❌ Get user error:', {
      error,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
  console.log('✅ Current user:', {
    exists: !!user,
    userId: user?.id,
    timestamp: new Date().toISOString()
  });
  return user;
};

export const onAuthStateChange = (callback: (event: any, session: any) => void) => {
  console.log('👂 Setting up auth state listener...');
  return supabase.auth.onAuthStateChange(callback);
}; 