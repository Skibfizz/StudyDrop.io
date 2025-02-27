'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/ui/button'
import {
  Upload,
  Brain,
  Sparkles,
  Youtube,
  ChevronRight,
  Rocket,
  Star,
  Clock,
  Users,
  AlertCircle,
  Crown,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSupabase } from '@/context/supabase-context'
import { useUsage, UsageType } from '@/lib/hooks/use-usage'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

interface UsageFeature {
  type: UsageType
  label: string
  icon: React.ElementType
  color: string
  gradient: string
  description: string
}

const FEATURES: UsageFeature[] = [
  {
    type: 'video_summaries',
    label: 'Video Summaries',
    icon: Youtube,
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-orange-500/20',
    description: 'Process and summarize video lectures',
  },
  {
    type: 'flashcard_sets',
    label: 'Flashcard Sets',
    icon: Brain,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Generate study flashcards',
  },
  {
    type: 'text_humanizations',
    label: 'Text Humanizations',
    icon: Sparkles,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    description: 'Transform and improve text content',
  },
]

export default function DashboardPage() {
  const { user, loading } = useSupabase()
  const { usageData, getUsagePercentage, getRemainingUsage } = useUsage()
  const router = useRouter()

  useEffect(() => {
    console.log('🎯 Dashboard mounted:', {
      hasUser: !!user,
      userId: user?.id,
      isLoading: loading,
      timestamp: new Date().toISOString(),
    })
  }, [user, loading])

  return (
    <div className="flex min-h-screen flex-col">
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
        <section className="relative px-6 pb-16 pt-24">
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-purple-500/[0.08]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(120, 119, 198, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/20 px-4 py-1.5 text-sm font-medium backdrop-blur dark:border-purple-500/20 dark:bg-purple-500/10">
                  <span className="text-purple-600">Welcome back</span>
                  <span className="mx-2 text-purple-600">•</span>
                  <span className="text-purple-600">Ready to continue learning?</span>
                  <Sparkles className="ml-2 h-4 w-4 text-purple-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text py-1 leading-tight text-transparent">
                    Your Study Dashboard
                  </span>
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  Explore our AI-powered features to enhance your learning experience and achieve
                  your academic goals.
                </p>
              </div>
              <div className="relative">
                <Button
                  size="lg"
                  className="group h-14 transform bg-gradient-to-r from-purple-500 to-blue-500 px-8 text-lg shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:from-purple-600 hover:to-blue-600"
                >
                  <Upload className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Upload Study Material
                </Button>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                  Supports PDF, DOCX, and more
                </div>
              </div>
            </div>

            {/* Usage Stats Grid */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              {FEATURES.map(feature => {
                const percentage = getUsagePercentage?.(feature.type) ?? 0
                const remaining = getRemainingUsage?.(feature.type) ?? 0
                const used = usageData?.usage[feature.type] ?? 0
                const limit = usageData?.limits[feature.type] ?? 0
                const isNearLimit = percentage >= 80
                const Icon = feature.icon

                return (
                  <Card
                    key={feature.type}
                    className="group relative overflow-hidden border-purple-500/10 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/20"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="relative space-y-4 p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="w-fit rounded-lg bg-white/80 p-2">
                            <Icon className={`h-5 w-5 ${feature.color}`} />
                          </div>
                          <h3 className="mt-2 text-lg font-semibold">{feature.label}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {used}/{limit}
                          </div>
                          <div className="text-sm text-muted-foreground">Used this week</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Usage</span>
                          <span className="font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {isNearLimit && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>
                              {remaining === 0
                                ? `You've reached your ${feature.label.toLowerCase()} limit`
                                : `Only ${remaining} ${feature.label.toLowerCase()} remaining`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {usageData?.tier === 'free' && (
              <div className="mt-8">
                <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-purple-500/20 p-3">
                        <Crown className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                        <p className="text-sm text-muted-foreground">
                          Get unlimited access to all features
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      View Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold">Featured Tools</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Powerful AI-driven tools designed to transform your study experience
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {FEATURES.map(feature => (
                <Link href={`/chat?tab=${feature.type}`} key={feature.type}>
                  <div className="group relative">
                    <div className="absolute inset-0 -m-1 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-all duration-500 group-hover:opacity-100" />
                    <Card className="relative flex h-[400px] flex-col overflow-hidden border-border/40 bg-white/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                      />
                      <div className="relative flex-1 space-y-8">
                        <div className="space-y-6">
                          <div className="w-fit rounded-xl bg-white/80 p-4 backdrop-blur">
                            <feature.icon
                              className={`h-10 w-10 ${feature.color} transform transition-transform duration-500 group-hover:scale-110`}
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold">{feature.label}</h3>
                            <p className="text-base leading-relaxed text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-border/40 py-6">
                          {/* Placeholder for stats */}
                        </div>

                        <div className="mt-auto flex items-center pt-4 text-sm">
                          <Button className="group/button w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                            <span className="font-medium">Get Started</span>
                            <ChevronRight className="ml-2 h-4 w-4 transform transition-transform group-hover/button:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <Card className="relative overflow-hidden border-border/40 bg-white/50 p-8 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-purple-500/[0.08]" />
              <div className="relative flex items-start space-x-8">
                <div className="rounded-xl bg-white/80 p-4 backdrop-blur">
                  <Rocket className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">Quick Start Guide</h3>
                    <p className="mt-2 text-muted-foreground">
                      New to StudyMind? Follow these steps to get started with your learning
                      journey.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      {
                        step: '1',
                        title: 'Upload Materials',
                        desc: 'Start by uploading your study materials or lecture videos',
                      },
                      {
                        step: '2',
                        title: 'AI Processing',
                        desc: 'Our AI will analyze and organize your content',
                      },
                      {
                        step: '3',
                        title: 'Start Learning',
                        desc: 'Begin your enhanced learning experience',
                      },
                    ].map(item => (
                      <div key={item.step} className="group relative">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                        <div className="relative rounded-lg border border-border/40 p-4">
                          <div className="mb-2 text-lg font-semibold">Step {item.step}</div>
                          <div className="mb-1 font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
