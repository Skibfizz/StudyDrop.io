"use client";

import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Brain, 
  Sparkles,
  Youtube,
  ChevronRight,
  Rocket,
  Star,
  Clock,
  Users
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const features = [
    {
      title: "Video Learning",
      description: "Process YouTube lectures into structured study materials. Upload any educational video and get AI-powered summaries, notes, and practice questions.",
      icon: Youtube,
      color: "text-red-500",
      gradient: "from-red-500/20 to-orange-500/20",
      link: "/chat?tab=youtube",
      stats: [
        { label: "Videos Processed", value: "1.2K+" },
        { label: "Hours Saved", value: "500+" }
      ]
    },
    {
      title: "Text Humanizer",
      description: "Transform your text with AI-powered humanization. Make your writing more natural, engaging, and easier to understand with intelligent suggestions.",
      icon: Sparkles,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-pink-500/20",
      link: "/chat?tab=humanizer",
      stats: [
        { label: "Texts Processed", value: "50K+" },
        { label: "Success Rate", value: "95%" }
      ]
    },
    {
      title: "Flashcards",
      description: "Generate and practice with AI-created flashcards. Turn your notes into interactive study materials and track your learning progress.",
      icon: Brain,
      color: "text-green-500",
      gradient: "from-green-500/20 to-emerald-500/20",
      link: "/chat?tab=flashcards",
      stats: [
        { label: "Cards Created", value: "100K+" },
        { label: "Retention Rate", value: "85%" }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full theme-header">
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
        <section className="relative px-6 pt-24 pb-16">
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-purple-500/[0.08]" />
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center rounded-full border dark:border-purple-500/20 border-purple-500/40 dark:bg-purple-500/10 bg-purple-500/20 px-4 py-1.5 text-sm font-medium backdrop-blur">
                  <span className="text-purple-600">Welcome back</span>
                  <span className="mx-2 text-purple-600">•</span>
                  <span className="text-purple-600">Ready to continue learning?</span>
                  <Sparkles className="ml-2 h-4 w-4 text-purple-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-tight py-1">
                    Your Study Dashboard
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Explore our AI-powered features to enhance your learning experience and achieve your academic goals.
                </p>
              </div>
              <div className="relative">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all group shadow-lg shadow-purple-500/25"
                >
                  <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Upload Study Material
                </Button>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                  Supports PDF, DOCX, and more
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-4 gap-8">
              {[
                { icon: Users, label: "Active Users", value: "50K+", color: "text-purple-500" },
                { icon: Star, label: "Average Rating", value: "4.9/5", color: "text-yellow-500" },
                { icon: Clock, label: "Study Hours", value: "1M+", color: "text-blue-500" },
                { icon: Rocket, label: "Success Rate", value: "95%", color: "text-green-500" }
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <Card className="border-border/40 p-6 backdrop-blur-sm bg-white/50">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-white/80">
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Featured Tools</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful AI-driven tools designed to transform your study experience
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {features.map((feature) => (
                <Link href={feature.link} key={feature.title}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -m-1" />
                    <Card className="relative overflow-hidden border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20 h-[400px] p-8 flex flex-col backdrop-blur-sm bg-white/50">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative space-y-8 flex-1">
                        <div className="space-y-6">
                          <div className="p-4 rounded-xl bg-white/80 backdrop-blur w-fit">
                            <feature.icon className={`h-10 w-10 ${feature.color} transform group-hover:scale-110 transition-transform duration-500`} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold">{feature.title}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-border/40">
                          {feature.stats.map((stat, index) => (
                            <div key={index} className="space-y-1">
                              <div className="text-lg font-semibold">{stat.value}</div>
                              <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center text-sm mt-auto pt-4">
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white group/button"
                          >
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
          <div className="max-w-7xl mx-auto">
            <Card className="relative overflow-hidden border-border/40 p-8 backdrop-blur-sm bg-white/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-purple-500/[0.08]" />
              <div className="relative flex items-start space-x-8">
                <div className="p-4 rounded-xl bg-white/80 backdrop-blur">
                  <Rocket className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">Quick Start Guide</h3>
                    <p className="text-muted-foreground mt-2">
                      New to StudyMind? Follow these steps to get started with your learning journey.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { step: "1", title: "Upload Materials", desc: "Start by uploading your study materials or lecture videos" },
                      { step: "2", title: "AI Processing", desc: "Our AI will analyze and organize your content" },
                      { step: "3", title: "Start Learning", desc: "Begin your enhanced learning experience" }
                    ].map((item) => (
                      <div key={item.step} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <div className="relative p-4 rounded-lg border border-border/40">
                          <div className="text-lg font-semibold mb-2">Step {item.step}</div>
                          <div className="font-medium mb-1">{item.title}</div>
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
  );
}