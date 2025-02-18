"use client";

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brain, MessageSquare, Sparkles, ArrowRight, Zap, Star, Users, Upload, Quote, Youtube } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

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

  const handleLearnMore = (tab: string) => {
    if (session) {
      router.push(`/chat?tab=${tab}`);
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
        <section className="relative flex items-center justify-center px-6 pt-80 pb-80">
          {/* Enhanced Gradient Background */}
          <div className="absolute inset-0 theme-gradient-bg" />
          <div className="absolute inset-0 theme-dot-pattern" />
          
          <div className="relative mx-auto max-w-[920px] space-y-8 text-center flex flex-col items-center justify-center">
            {/* Enhanced Status Badge */}
            <div className="animate-pulse inline-flex items-center rounded-full border border-purple-500/40 bg-purple-500/20 px-4 py-1.5 text-sm font-medium backdrop-blur self-center">
              <span className="text-purple-600">New</span>
              <span className="mx-2 text-purple-600">•</span>
              <span className="text-purple-600">AI Study Assistant Now Live</span>
              <Sparkles className="ml-2 h-4 w-4 text-purple-600" />
            </div>
            
            {/* More Impactful Headline */}
            <div className="space-y-4 w-full text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mx-auto">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-[1.15] mb-1">
                  Master Any Subject
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-[1.15]">
                  With AI-Powered Learning
                </span>
              </h1>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-3 gap-4 max-w-[600px] mx-auto mb-8">
              <div className="theme-card p-4 flex flex-col items-center space-y-2">
                <Brain className="h-6 w-6 text-purple-400" />
                <span className="text-sm font-medium text-gray-900">Smart AI Tutor</span>
              </div>
              <div className="theme-card p-4 flex flex-col items-center space-y-2">
                <Zap className="h-6 w-6 text-blue-400" />
                <span className="text-sm font-medium text-gray-900">Instant Help</span>
              </div>
              <div className="theme-card p-4 flex flex-col items-center space-y-2">
                <Star className="h-6 w-6 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">Track Progress</span>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col items-center space-y-4">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all"
                onClick={() => router.push('/auth/signin')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-600">No credit card required • Free plan available</p>
            </div>

            {/* Social Proof */}
            <div className="mt-2 pt-2 border-t border-foreground/10">
              <div className="flex justify-center items-center space-x-8 text-gray-600">
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
        <section className="relative px-0 py-64 border-t border-foreground/10 overflow-hidden">
          <div className="absolute inset-0 theme-gradient-bg" />
          <div className="relative mx-auto w-full">
            <div className="text-center mb-32">
              <h2 className="text-3xl font-bold sm:text-4xl mb-10 text-gray-900">What Our Users Say</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
            </div>
            <div className="relative overflow-hidden w-full">
              <div className="container mx-auto max-w-[1600px] px-8">
                <div 
                  className="flex transition-transform duration-1000 ease-linear" 
                  style={{ transform: `translateX(-${position}%)` }}
                >
                  {allReviews.map((review, index) => (
                    <div key={`${index}-${review.author}`} className="w-[500px] flex-shrink-0 px-4">
                      <div className="theme-card aspect-[4/3] p-10 backdrop-blur-sm flex flex-col justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-8">
                            <Quote className="h-10 w-10 text-purple-400 mr-6 flex-shrink-0" />
                            <p className="text-xl text-gray-700 italic leading-relaxed">{review.text}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between pt-6 border-t border-foreground/10">
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{review.author}</p>
                              <p className="text-base text-gray-600">{review.role}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
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
        <section className="relative px-6 py-32 border-t border-foreground/10">
          <div className="absolute inset-0 theme-gradient-bg" />
          <div className="relative mx-auto max-w-[1200px] space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">Features that set us apart</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience a new way of learning with our cutting-edge features designed to enhance your study sessions.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="theme-card p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 w-fit">
                    <Youtube className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Video Learning</h3>
                  <p className="text-muted-foreground">
                    Upload and process YouTube lectures into structured study materials with automatic indexing and OCR support.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-purple-500 hover:text-purple-600 p-0 h-auto"
                    onClick={() => handleLearnMore('youtube')}
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="theme-card p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 w-fit">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Text Humanizer</h3>
                  <p className="text-muted-foreground">
                    Transform your text with AI-powered humanization. Make your writing more natural and engaging.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-blue-500 hover:text-blue-600 p-0 h-auto"
                    onClick={() => handleLearnMore('humanizer')}
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="theme-card p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-green-500/10 w-fit">
                    <Brain className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Flashcards</h3>
                  <p className="text-muted-foreground">
                    Generate and practice with AI-created flashcards. Turn your notes into interactive study materials.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-green-500 hover:text-green-600 p-0 h-auto"
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
        <section className="relative px-6 py-24 border-t border-foreground/10">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Active Users", value: "50K+" },
                { label: "Notes Processed", value: "1M+" },
                { label: "Questions Answered", value: "10M+" },
                { label: "Study Hours", value: "500K+" }
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative px-6 py-24 border-t border-foreground/10">
          <div className="absolute inset-0 theme-gradient-bg" />
          <div className="relative mx-auto max-w-[920px] text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">Ready to transform your study experience?</h2>
            <p className="text-gray-600 max-w-[600px] mx-auto">
              Join thousands of students who are already using StudyMind to enhance their learning journey.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all"
                onClick={() => router.push('/auth/signin')}
              >
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}