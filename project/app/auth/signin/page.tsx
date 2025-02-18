"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Header matching home page */}
      <header className="fixed top-0 z-50 w-full theme-header">
        <div className="flex h-14 items-center px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative pt-16">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-blue-500/[0.02]" />
        
        {/* Main Content Container */}
        <div className="relative w-full max-w-[420px] mx-auto p-6">
          <div className="theme-card p-8">
            <div className="space-y-8">
              {/* Logo & Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 ml-2">
                    StudyMind
                  </span>
                </div>
                
                <h1 className="text-2xl font-semibold mb-2">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sign in to your account to continue learning
                </p>
              </div>

              {/* Sign In Button */}
              <Button
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-600 transition-all border border-border hover:border-border/80 rounded-lg flex items-center justify-center group"
                onClick={handleGoogleSignIn}
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
              </Button>

              {/* Features List */}
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

              {/* Terms */}
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
  );
} 