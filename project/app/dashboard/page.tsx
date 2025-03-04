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
  Users,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeatureUsage } from "@/components/dashboard/feature-usage";
import { TierInfo } from "@/components/dashboard/tier-info";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { RecentLectures } from "@/components/recent-lectures";
import { useUsage } from "@/lib/hooks/use-usage";
import { useEffect, useState } from "react";
import { SharedHeader } from "@/components/shared-header";
import { isSuccessfulCheckout, isCanceledCheckout, getPlan } from "@/lib/stripe-client";
import { toast } from "sonner";

export default function DashboardPage() {
  const { refresh } = useUsage();
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);

  // Refresh usage data when dashboard page mounts
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Check for Stripe checkout success/error
  useEffect(() => {
    if (isSuccessfulCheckout()) {
      const plan = getPlan();
      setUpgradedPlan(plan || 'premium');
      setShowSuccessMessage(true);
      
      // Show success toast
      toast.success(
        plan 
          ? `Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!` 
          : 'Subscription updated successfully!'
      );
      
      // Clear URL parameters after showing toast
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    } else if (isCanceledCheckout()) {
      // Show canceled toast
      toast.error('Subscription checkout was canceled. You can try again anytime.');
      
      // Clear URL parameters after showing toast
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Handle lecture selection
  const handleLectureSelect = (lecture: any) => {
    router.push(`/chat?tab=youtube&videoId=${lecture.videoId}`);
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

      <main className="flex-1">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg mx-auto max-w-7xl mt-6 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-700">Subscription Activated!</h3>
                <p className="text-green-600 text-sm">
                  {upgradedPlan 
                    ? `Your ${upgradedPlan.charAt(0).toUpperCase() + upgradedPlan.slice(1)} plan is now active. Enjoy your enhanced features!` 
                    : 'Your subscription has been updated successfully.'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-700 hover:text-green-800 hover:bg-green-500/10"
            >
              Dismiss
            </Button>
          </div>
        )}

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

            {/* Feature Usage and Tier Info */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="col-span-1 lg:col-span-3">
                <h2 className="text-xl font-semibold mb-4">Feature Usage</h2>
                <FeatureUsage />
              </div>
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                <SubscriptionCard />
              </div>
            </div>

            {/* Recent Lectures Section */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Recent Lectures</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-1 lg:col-span-3">
                  <RecentLectures 
                    onLectureSelect={handleLectureSelect}
                    limit={3}
                  />
                </div>
              </div>
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
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Quick Start Guide</h3>
                  <p className="text-muted-foreground">
                    New to StudyMind? Follow these steps to get started with our AI-powered learning tools.
                  </p>
                  <div className="flex space-x-4 mt-4">
                    <Button variant="outline" className="border-purple-500/20 hover:border-purple-500/40">
                      View Tutorial
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                      Start Learning
                    </Button>
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