import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { signOut as nextAuthSignOut } from 'next-auth/react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log("useAuth: signOut function called");
    try {
      // First, sign out from Supabase
      console.log("useAuth: Signing out from Supabase");
      await supabase.auth.signOut()
      
      // Then, sign out from NextAuth if it's being used
      try {
        console.log("useAuth: Attempting to sign out from NextAuth");
        await nextAuthSignOut({ redirect: false })
        console.log("useAuth: Successfully signed out from NextAuth");
      } catch (nextAuthError) {
        console.log('useAuth: NextAuth not in use or error:', nextAuthError)
      }
      
      // Clear any local storage items that might be storing auth state
      console.log("useAuth: Clearing localStorage");
      localStorage.clear()
      
      // Clear any cookies
      console.log("useAuth: Clearing cookies");
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=')
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Force reload the page to ensure all auth states are cleared
      console.log("useAuth: Redirecting to root path '/'");
      window.location.href = '/'
    } catch (error) {
      console.error('useAuth: Error signing out:', error)
      // If there's an error, force reload anyway
      console.log("useAuth: Error occurred, still redirecting to root path '/'");
      window.location.href = '/'
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut
  }
} 