"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Brain, Sparkles, Shield } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase'
import { SharedHeader } from "@/components/shared-header";

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
      // The redirect will be handled by Supabase
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signUpWithEmail(email, password, username)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-background text-foreground">
      <SharedHeader />

      <div className="flex-1 flex items-center justify-center relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-blue-500/[0.02]" />
        
        <div className="relative w-full max-w-[420px] mx-auto p-6">
          <div className="theme-card p-8">
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 ml-2">
                    StudyDrop
                  </span>
                </div>
                
                <h1 className="text-2xl font-semibold mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                  Start your learning journey today
                </p>
              </div>

              <button
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-600 transition-all border border-border hover:border-border/80 rounded-lg flex items-center justify-center group"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleEmailSignUp}>
                {error && (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {loading ? 'Signing up...' : 'Sign up'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Access AI-powered study tools</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Personalized learning experience</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Secure and private learning environment</span>
                </div>
              </div>

              <div className="text-sm text-center">
                <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500">
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link href="#" className="text-purple-500 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-purple-500 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 