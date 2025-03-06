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
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeatureUsage } from "@/components/dashboard/feature-usage";
import { TierInfo } from "@/components/dashboard/tier-info";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { RecentLectures } from "@/components/recent-lectures";
import { useUsage } from "@/lib/hooks/use-usage";
import { useEffect } from "react";
import { SharedHeader } from "@/components/shared-header";

export default function DashboardPage() {
  const { refresh } = useUsage();
  const router = useRouter();

  // Refresh usage data when dashboard page mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handle lecture selection
  const handleLectureSelect = (lecture: any) => {
    console.log('Dashboard handleLectureSelect called with lecture:', {
      id: lecture.id,
      videoId: lecture.videoId,
      title: lecture.title || 'Untitled'
    });
    
    try {
      router.push(`/chat?tab=youtube&videoId=${lecture.videoId}`);
      console.log('Navigation initiated from dashboard to:', `/chat?tab=youtube&videoId=${lecture.videoId}`);
    } catch (error) {
      console.error('Error during navigation from dashboard:', error);
    }
  };

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
      <SharedHeader />

      <main className="flex-1 pb-10">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 md:pb-16">
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
          
          <div className="relative container mx-auto px-2 sm:px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-10">
              <div className="space-y-4 sm:space-y-5 max-w-2xl">
                <div className="inline-flex items-center rounded-full border dark:border-purple-500/20 border-purple-500/40 dark:bg-purple-500/10 bg-purple-500/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium backdrop-blur">
                  <span className="text-purple-600">Welcome back</span>
                  <span className="mx-1 sm:mx-2 text-purple-600">•</span>
                  <span className="text-purple-600">Ready to continue learning?</span>
                  <Sparkles className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-tight py-1">
                    Your Study Dashboard
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl">
                  Explore our AI-powered features to enhance your learning experience and achieve your academic goals.
                </p>
              </div>
              <div className="relative mt-6 md:mt-0 flex-shrink-0">
                <Button 
                  size="lg" 
                  className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all group shadow-lg shadow-purple-500/25"
                >
                  <Upload className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline">Upload Study Material</span>
                  <span className="inline xs:hidden">Upload</span>
                </Button>
                <div className="absolute -bottom-6 sm:-bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Supports PDF, DOCX, and more
                </div>
              </div>
            </div>

            {/* Feature Usage and Tier Info */}
            <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <div className="col-span-1 lg:col-span-3">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Feature Usage</h2>
                <FeatureUsage />
              </div>
              <div className="col-span-1 mt-8 lg:mt-0">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Subscription</h2>
                <SubscriptionCard />
              </div>
            </div>

            {/* Recent Lectures Section - The RecentLectures component will now handle its own visibility */}
            <div className="mt-10 sm:mt-12 md:mt-16">
              <RecentLectures 
                onLectureSelect={handleLectureSelect}
                limit={3}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
          <div className="container mx-auto space-y-8 sm:space-y-10 md:space-y-12 max-w-6xl">
            <div className="text-center space-y-3 sm:space-y-4 mb-2 sm:mb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Featured Tools</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Powerful AI-driven tools designed to transform your study experience
              </p>
            </div>

            <div className="grid gap-5 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link href={feature.link} key={feature.title}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -m-1" />
                    <Card className="relative overflow-hidden border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl group-hover:shadow-purple-500/20 h-[280px] sm:h-[320px] md:h-[380px] p-4 sm:p-6 md:p-8 flex flex-col backdrop-blur-sm bg-white/50">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative space-y-4 sm:space-y-5 md:space-y-6 flex-1">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-white/80 backdrop-blur w-fit">
                            <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 ${feature.color} transform group-hover:scale-110 transition-transform duration-500`} />
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{feature.title}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 py-3 sm:py-4 md:py-5 border-t border-border/40">
                          {feature.stats.map((stat, index) => (
                            <div key={index} className="space-y-0.5 sm:space-y-1">
                              <div className="text-base sm:text-lg font-semibold">{stat.value}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center text-xs sm:text-sm mt-auto pt-2 sm:pt-3">
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white group/button text-xs sm:text-sm"
                          >
                            <span className="font-medium">Get Started</span>
                            <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transform transition-transform group-hover/button:translate-x-1" />
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
      </main>
    </div>
  );
}