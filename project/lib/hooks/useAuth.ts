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
    try {
      // First, sign out from Supabase
      await supabase.auth.signOut()
      
      // Then, sign out from NextAuth if it's being used
      try {
        await nextAuthSignOut({ redirect: false })
      } catch (nextAuthError) {
        console.log('NextAuth not in use or error:', nextAuthError)
      }
      
      // Clear any local storage items that might be storing auth state
      localStorage.clear()
      
      // Clear any cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=')
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Force reload the page to ensure all auth states are cleared
      window.location.href = '/auth/signin'
    } catch (error) {
      console.error('Error signing out:', error)
      // If there's an error, force reload anyway
      window.location.href = '/auth/signin'
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut
  }
} 