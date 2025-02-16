"use client";

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brain, MessageSquare, Sparkles, ArrowRight, Zap, Star, Users, Upload, Quote } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const reviews = [
    {
      text: "StudyMind transformed how I prepare for exams. The AI tutor feels like having a personal teacher available 24/7.",
      author: "Sarah K.",
      role: "Medical Student",
      rating: 5
    },
    {
      text: "The smart note processing feature saves me hours of organizing study materials. Absolutely game-changing!",
      author: "James L.",
      role: "Computer Science Major",
      rating: 5
    },
    {
      text: "I love how it breaks down complex topics into easy-to-understand concepts. My grades have improved significantly.",
      author: "Emily R.",
      role: "High School Senior",
      rating: 5
    },
    {
      text: "The collaborative features helped our study group stay connected and productive, even when studying remotely.",
      author: "Michael T.",
      role: "MBA Student",
      rating: 5
    }
  ];

  const allReviews = [...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews];

  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= (reviews.length * 100)) {
          return 0;
        }
        return prev + 0.2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
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
        <section className="relative flex items-center justify-center px-6 pt-80 pb-80">
          {/* Enhanced Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
          
          <div className="relative mx-auto max-w-[920px] space-y-8 text-center flex flex-col items-center justify-center">
            {/* Enhanced Status Badge */}
            <div className="animate-pulse inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium backdrop-blur self-center">
              <span className="text-purple-300">New</span>
              <span className="mx-2">•</span>
              <span className="text-purple-200">AI Study Assistant Now Live</span>
              <Sparkles className="ml-2 h-4 w-4 text-purple-300" />
            </div>
            
            {/* More Impactful Headline */}
            <div className="space-y-4 w-full text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mx-auto">
                <span className="block bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent pb-2">
                  Master Any Subject
                </span>
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  With AI-Powered Learning
                </span>
              </h1>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-3 gap-4 max-w-[600px] mx-auto mb-8">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-sm font-medium">Smart AI Tutor</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
                <Zap className="h-6 w-6 text-blue-400" />
                <span className="text-sm font-medium">Instant Help</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
                <Star className="h-6 w-6 text-yellow-400" />
                <span className="text-sm font-medium">Track Progress</span>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col items-center space-y-4">
              <Link href="/pricing">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-400">No credit card required • Free plan available</p>
            </div>

            {/* Social Proof */}
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex justify-center items-center space-x-8 text-white/60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-sm">Active Users</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1M+</div>
                  <div className="text-sm">Questions Answered</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-sm">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="relative px-6 py-24 border-t border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-[1200px] space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Loved by Students Worldwide</h2>
              <p className="text-gray-400 max-w-[600px] mx-auto">
                Join thousands of students who are already using StudyMind to enhance their learning experience.
              </p>
            </div>

            {/* Continuous Review Scroll */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
              <div className="overflow-hidden">
                <div 
                  className="flex gap-6 transition-transform duration-1000 ease-linear"
                  style={{ transform: `translateX(-${position}px)` }}
                >
                  {allReviews.map((review, index) => (
                    <div 
                      key={index}
                      className="flex-none w-[400px] group"
                    >
                      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-[1.02]">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative">
                          <Quote className="h-8 w-8 text-purple-400 mb-4 opacity-50" />
                          <p className="text-gray-300 mb-4">{review.text}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{review.author}</p>
                              <p className="text-sm text-gray-400">{review.role}</p>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400" />
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
        <section className="relative px-6 py-24 border-t border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
          <div className="relative mx-auto max-w-[1200px] space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Powerful Features</h2>
              <p className="text-gray-400 max-w-[600px] mx-auto">
                Everything you need to excel in your studies, powered by cutting-edge AI technology.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Notes</h3>
                  <p className="text-gray-400">
                    Transform your notes with AI-powered organization and summarization.
                  </p>
                  <div className="pt-4">
                    <Button variant="link" className="group/btn text-purple-400 hover:text-purple-300 p-0">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Powered Chat</h3>
                  <p className="text-gray-400">
                    Ask questions about your notes and get intelligent, context-aware responses.
                  </p>
                  <div className="pt-4">
                    <Button variant="link" className="group/btn text-blue-400 hover:text-blue-300 p-0">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Collaborative Learning</h3>
                  <p className="text-gray-400">
                    Share notes and insights with fellow students to enhance your learning experience.
                  </p>
                  <div className="pt-4">
                    <Button variant="link" className="group/btn text-cyan-400 hover:text-cyan-300 p-0">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative px-6 py-24 border-t border-white/10">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Active Users", value: "50K+" },
                { label: "Notes Processed", value: "1M+" },
                { label: "Questions Answered", value: "10M+" },
                { label: "Study Hours", value: "500K+" }
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative px-6 py-24 border-t border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-[920px] text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to transform your study experience?</h2>
            <p className="text-gray-400 max-w-[600px] mx-auto">
              Join thousands of students who are already using StudyMind to enhance their learning journey.
            </p>
            <div className="mt-8">
              <Link href="/pricing">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all">
                  Get Started Now
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 