'use client'

import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Brain,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Users,
  Upload,
  Quote,
  Youtube,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSupabase } from '@/context/supabase-context'

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const { user, loading } = useSupabase()

  const reviews = [
    {
      text: 'The YouTube lecture processing is incredible! It automatically creates study notes and lets me search through hours of content instantly.',
      author: 'Alex M.',
      role: 'Engineering Student',
      rating: 5,
    },
    {
      text: "The text humanizer helps me rephrase my notes in a way that's easier to understand and remember. It's like having a writing tutor.",
      author: 'Rachel K.',
      role: 'Psychology Major',
      rating: 5,
    },
    {
      text: 'Being able to chat with an AI tutor about my study materials has made a huge difference. It explains concepts clearly and helps me stay focused.',
      author: 'David L.',
      role: 'Graduate Student',
      rating: 5,
    },
    {
      text: "The combination of video learning and AI assistance is perfect for my study style. I can process lectures and get instant help when I'm stuck.",
      author: 'Sofia R.',
      role: 'Pre-Med Student',
      rating: 5,
    },
  ]

  const allReviews = [...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews]

  const [position, setPosition] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        if (prev >= reviews.length * 100) {
          return 0
        }
        return prev + 0.2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [reviews.length])

  const handleGetStarted = () => {
    if (loading) return // Don't do anything while checking auth state

    if (user) {
      // If user is logged in, go to dashboard
      router.push('/dashboard')
    } else {
      // If no user, go to sign in
      router.push('/auth/signin')
    }
  }

  const handleLearnMore = (tab: string) => {
    if (session) {
      router.push(`/chat?tab=${tab}`)
    } else {
      router.push('/pricing')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="theme-header fixed top-0 z-50 w-full">
        <div className="flex h-14 items-center px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center px-6 pb-80 pt-80">
          {/* Enhanced Gradient Background */}
          <div className="theme-gradient-bg absolute inset-0" />
          <div className="theme-dot-pattern absolute inset-0" />

          <div className="relative mx-auto flex max-w-[920px] flex-col items-center justify-center space-y-8 text-center">
            {/* Enhanced Status Badge */}
            <div className="inline-flex animate-pulse items-center self-center rounded-full border border-purple-500/40 bg-purple-500/20 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <span className="text-purple-600">New</span>
              <span className="mx-2 text-purple-600">•</span>
              <span className="text-purple-600">AI Study Assistant Now Live</span>
              <Sparkles className="ml-2 h-4 w-4 text-purple-600" />
            </div>

            {/* More Impactful Headline */}
            <div className="w-full space-y-4 text-center">
              <h1 className="mx-auto text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="mb-1 block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text leading-[1.15] text-transparent">
                  Master Any Subject
                </span>
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text leading-[1.15] text-transparent">
                  With AI-Powered Learning
                </span>
              </h1>
            </div>

            {/* Feature Highlights */}
            <div className="mx-auto mb-8 mt-16 grid max-w-[600px] grid-cols-3 gap-4">
              <div className="theme-card flex flex-col items-center space-y-2 p-4">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-sm font-medium text-gray-900">Smart AI Tutor</span>
              </div>
              <div className="theme-card flex flex-col items-center space-y-2 p-4">
                <Zap className="h-6 w-6 text-blue-400" />
                <span className="text-sm font-medium text-gray-900">Instant Help</span>
              </div>
              <div className="theme-card flex flex-col items-center space-y-2 p-4">
                <Star className="h-6 w-6 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">Track Progress</span>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                size="lg"
                className="h-14 transform bg-gradient-to-r from-purple-500 to-blue-500 px-8 text-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-blue-600"
                onClick={handleGetStarted}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get Started {user ? 'Now' : 'Free'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600">No credit card required • Free plan available</p>
            </div>

            {/* Social Proof */}
            <div className="mt-2 border-t border-foreground/10 pt-2">
              <div className="flex items-center justify-center space-x-8 text-gray-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm">Active Users</div>
                </div>
                <div className="h-8 w-px bg-foreground/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm">Questions Answered</div>
                </div>
                <div className="h-8 w-px bg-foreground/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="relative overflow-hidden border-t border-foreground/10 px-0 py-64">
          <div className="theme-gradient-bg absolute inset-0" />
          <div className="relative mx-auto w-full">
            <div className="mb-32 text-center">
              <h2 className="mb-10 text-3xl font-bold text-gray-900 sm:text-4xl">
                What Our Users Say
              </h2>
              <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            </div>
            <div className="relative w-full overflow-hidden">
              <div className="container mx-auto max-w-[1600px] px-8">
                <div
                  className="flex transition-transform duration-1000 ease-linear"
                  style={{ transform: `translateX(-${position}%)` }}
                >
                  {allReviews.map((review, index) => (
                    <div key={`${index}-${review.author}`} className="w-[500px] flex-shrink-0 px-4">
                      <div className="theme-card flex aspect-[4/3] flex-col justify-between p-10 backdrop-blur-sm">
                        <div className="flex-1">
                          <div className="mb-8 flex items-start">
                            <Quote className="mr-6 h-10 w-10 flex-shrink-0 text-purple-400" />
                            <p className="text-xl italic leading-relaxed text-gray-700">
                              {review.text}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between border-t border-foreground/10 pt-6">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{review.author}</p>
                              <p className="text-base text-gray-600">{review.role}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-t border-foreground/10 px-6 py-32">
          <div className="theme-gradient-bg absolute inset-0" />
          <div className="relative mx-auto max-w-[1200px] space-y-16">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Features that set us apart
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Experience a new way of learning with our cutting-edge features designed to enhance
                your study sessions.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="theme-card p-8 transition-all duration-300 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="w-fit rounded-xl bg-purple-500/10 p-3">
                    <Youtube className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Video Learning</h3>
                  <p className="text-muted-foreground">
                    Upload and process YouTube lectures into structured study materials with
                    automatic indexing and OCR support.
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-purple-500 hover:text-purple-600"
                    onClick={() => handleLearnMore('youtube')}
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="theme-card p-8 transition-all duration-300 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="w-fit rounded-xl bg-blue-500/10 p-3">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Text Humanizer</h3>
                  <p className="text-muted-foreground">
                    Transform your text with AI-powered humanization. Make your writing more natural
                    and engaging.
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-500 hover:text-blue-600"
                    onClick={() => handleLearnMore('humanizer')}
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="theme-card p-8 transition-all duration-300 hover:shadow-lg">
                <div className="space-y-4">
                  <div className="w-fit rounded-xl bg-green-500/10 p-3">
                    <Brain className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Flashcards</h3>
                  <p className="text-muted-foreground">
                    Generate and practice with AI-created flashcards. Turn your notes into
                    interactive study materials.
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-green-500 hover:text-green-600"
                    onClick={() => handleLearnMore('flashcards')}
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative border-t border-foreground/10 px-6 py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Active Users', value: '50K+' },
                { label: 'Notes Processed', value: '1M+' },
                { label: 'Questions Answered', value: '10M+' },
                { label: 'Study Hours', value: '500K+' },
              ].map(stat => (
                <div key={stat.label} className="space-y-2 text-center">
                  <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative border-t border-foreground/10 px-6 py-24">
          <div className="theme-gradient-bg absolute inset-0" />
          <div className="relative mx-auto max-w-[920px] space-y-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ready to transform your study experience?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-600">
              Join thousands of students who are already using StudyMind to enhance their learning
              journey.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="h-14 transform bg-gradient-to-r from-purple-500 to-blue-500 px-8 text-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-blue-600"
                onClick={handleGetStarted}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get Started {user ? 'Now' : 'Free'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
