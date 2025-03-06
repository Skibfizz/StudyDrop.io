"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Sparkles, Brain, Zap, GraduationCap, Star, ArrowRight, Shield, Clock, Users, Crown, Rocket, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SharedHeader } from "@/components/shared-header";
import { createBrowserClient } from "@supabase/ssr";
import { PAYMENT_LINKS } from '@/lib/payment-links';
import { Footer } from "@/components/ui/code.demo";

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch the user's current subscription tier
  useEffect(() => {
    async function fetchUserSubscription() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) return;
        
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', session.user.id)
          .single();
          
        if (subscription) {
          setCurrentPlan(subscription.tier);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    }
    
    fetchUserSubscription();
  }, [supabase]);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      price: "Free",
      period: "",
      features: [
        "5 Summarised Video lectures",
        "5 FlashCard Sets (75)",
        "10 text humanizations",
        "C1 Generation Speed"
      ],
      icon: Brain,
      color: "from-purple-500/10 to-blue-500/10",
      buttonColor: "bg-white/10 hover:bg-white/20",
      buttonText: "Get Started Free",
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      description: "For dedicated learners",
      price: "3.99",
      period: "/week",
      features: [
        "1000 Summarised Video Lectures",
        "1000 FlashCard Sets (15k)",
        "500 Text Humanizations",
        "A1-Super Generation Speed"
      ],
      icon: Crown,
      color: "from-purple-500/20 to-blue-500/20",
      buttonColor: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
      buttonText: "Start Pro Plan",
      popular: true
    },
    {
      id: "basic",
      name: "Basic",
      description: "For institutions & teams",
      price: "1.99",
      period: "/week",
      features: [
        "20 Summarised Video lectures",
        "20 Flashcard Sets (300)",
        "40 Text humanizations",
        "B1 Generation Speed"
      ],
      icon: Shield,
      color: "from-blue-500/10 to-cyan-500/10",
      buttonColor: "bg-white/10 hover:bg-white/20",
      buttonText: "Start Basic Plan",
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(planId);

      console.log("handleSubscribe called for plan:", planId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("Auth session check result:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      
      // For free plan, we still require authentication
      if (planId.toLowerCase() === 'free' && !session) {
        console.log("Free plan requires authentication, redirecting to signin");
        router.push('/auth/signin');
        return;
      }

      // If the user is already on this plan, redirect to dashboard
      if (session && currentPlan === planId.toLowerCase()) {
        console.log("User already on plan:", planId);
        toast.info(`You are already on the ${planId} plan`);
        router.push('/dashboard');
        return;
      }

      // For free plan, update directly without Stripe
      if (planId.toLowerCase() === 'free') {
        console.log("Processing free plan subscription");
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
          }),
        });

        console.log("Free plan API response status:", response.status);

        if (!response.ok) {
          throw new Error('Failed to update subscription');
        }

        const data = await response.json();
        console.log("Free plan API response data:", data);
        
        toast.success('Successfully switched to Free plan');
        router.push('/dashboard');
        return;
      }
      
      // For paid plans, prepare the payment link
      const normalizedPlanId = planId.toLowerCase();
      console.log("Processing paid plan:", normalizedPlanId);
      
      // Generate a temporary anonymous ID if user is not authenticated
      const anonymousId = !session ? `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}` : null;
      if (anonymousId) {
        console.log("Generated anonymous ID for unauthenticated user:", anonymousId);
        // Store the anonymous ID in localStorage for later retrieval
        localStorage.setItem('studydrop_anonymous_id', anonymousId);
      }
      
      const response = await fetch('/api/stripe/prepare-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: normalizedPlanId,
          anonymousId: anonymousId
        }),
      });
      
      console.log("Payment link API response status:", response.status);
      
      if (!response.ok) {
        console.log("Payment link preparation failed, falling back to checkout");
        // Fallback to the old checkout method if prepare-payment-link fails
        const fallbackResponse = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            anonymousId: anonymousId
          }),
        });

        console.log("Fallback API response status:", fallbackResponse.status);

        if (!fallbackResponse.ok) {
          throw new Error('Failed to create checkout session');
        }

        const fallbackData = await fallbackResponse.json();
        console.log("Redirecting to fallback URL:", fallbackData.url);
        window.location.href = fallbackData.url;
        return;
      }
      
      const data = await response.json();
      console.log("Payment link data:", data);
      
      // Redirect to the payment link
      console.log("Redirecting to payment link:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SharedHeader />

      <div className="flex-1 overflow-x-hidden">
        {/* Enhanced Header with Gradient Animation */}
        <div className="relative w-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-screen theme-gradient-bg animate-gradient" />
          <div className="absolute inset-0 w-screen" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0'
            }}
          />
          <div className="relative w-full max-w-[1200px] mx-auto text-center px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 md:pb-16">
            <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-5 sm:mb-6 md:mb-8 border border-purple-500/20">
              <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-foreground/60">Simple Weekly Pricing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-[1.3] sm:leading-[1.4] mb-5 sm:mb-6 md:mb-8 px-2 sm:px-4 py-2">
              Choose Your Learning Journey
            </h1>
            <p className="text-foreground/60 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2 sm:px-4 leading-relaxed">
              Unlock the power of AI-enhanced learning with our flexible plans designed for every student's needs.
            </p>
          </div>
        </div>

        {/* Enhanced Pricing Cards */}
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative group ${plan.popular ? 'md:scale-105' : 'md:scale-100 lg:scale-95'}`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium z-10 flex items-center space-x-1 transition-transform duration-300 transform group-hover:scale-[1.02] origin-bottom">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>Most Popular</span>
                  </div>
                )}
                <Card 
                  className={`
                    relative theme-card
                    ${plan.popular ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15]' : 'border-foreground/10'} 
                    ${currentPlan === plan.id.toLowerCase() ? 'ring-2 ring-purple-500' : ''}
                    hover:border-foreground/20 transition-all duration-300 h-full 
                    transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10
                    ${hoveredPlan === plan.id ? 'scale-[1.02]' : 'scale-100'}
                  `}
                >
                  <CardHeader className="relative space-y-4 sm:space-y-6 pb-5 sm:pb-6 md:pb-8 px-4 sm:px-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-lg ${plan.popular ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 shadow-lg shadow-purple-500/20' : 'bg-foreground/10'} transform transition-transform duration-300 group-hover:scale-105`}>
                        <plan.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground/90">{plan.name}</CardTitle>
                        <CardDescription className="text-foreground/70 text-sm sm:text-base">{plan.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      {plan.price === "Free" ? (
                        <span className="text-3xl sm:text-4xl font-bold text-foreground/90">Free</span>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2 text-foreground/70">£</span>
                          <span className="text-3xl sm:text-4xl font-bold text-foreground/90">{plan.price}</span>
                          <span className="text-foreground/70 ml-1 sm:ml-2 text-sm sm:text-base">{plan.period}</span>
                        </>
                      )}
                    </div>
                    {currentPlan === plan.id.toLowerCase() && (
                      <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-600 px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium">
                        Current Plan
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="relative space-y-5 sm:space-y-6 md:space-y-8 px-4 sm:px-6">
                    <Button 
                      className={`
                        w-full ${plan.buttonColor} transform transition-all duration-300 
                        hover:scale-[1.02] h-10 sm:h-12 group/button font-semibold text-foreground/90 shadow-lg shadow-purple-500/20
                        ${hoveredPlan === plan.id ? 'scale-[1.02]' : 'scale-100'}
                        ${isLoading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}
                        ${currentPlan === plan.id.toLowerCase() ? 'bg-green-500/20 hover:bg-green-500/30 text-green-600' : ''}
                      `}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : currentPlan === plan.id.toLowerCase() ? (
                        <>
                          Current Plan
                          <Check className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </>
                      ) : (
                        <>
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transform transition-transform duration-300 group-hover/button:translate-x-1" />
                        </>
                      )}
                    </Button>
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      {plan.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex} 
                          className="flex items-center text-sm sm:text-base group/feature"
                        >
                          <div className={`
                            flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full 
                            ${plan.popular ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 shadow-sm shadow-purple-500/20' : 'bg-foreground/10'} 
                            flex items-center justify-center mr-2 sm:mr-3 
                            group-hover/feature:scale-105 transition-transform duration-300
                          `}>
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-foreground/90" />
                          </div>
                          <span className="text-foreground/80 group-hover/feature:text-foreground/90 transition-colors duration-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 sm:mt-20 md:mt-28 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 md:mb-14 theme-gradient-text-1">
            Why Choose Our Platform?
          </h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                color: "purple",
                title: "AI-Powered Learning",
                description: "Advanced AI tutoring tailored to your learning style"
              },
              {
                icon: Zap,
                color: "blue",
                title: "Instant Help",
                description: "Get answers and explanations in real-time"
              },
              {
                icon: GraduationCap,
                color: "cyan",
                title: "Comprehensive Subjects",
                description: "Support across all major academic disciplines"
              },
              {
                icon: Star,
                color: "yellow",
                title: "Personalized Experience",
                description: "Study plans adapted to your goals and pace"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/10 to-${feature.color}-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                <div className="relative text-center space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-${feature.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mt-12 sm:mt-20 md:mt-28 mb-12 sm:mb-20 md:mb-28 max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 md:mb-14 theme-gradient-text-1">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {[
              {
                question: "Can I switch plans at any time?",
                answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Is there a limit to AI interactions?",
                answer: "Free plans have a monthly limit, while Pro plans offer significantly higher limits."
              },
              {
                question: "Can I access content offline?",
                answer: "Yes! Pro users can download summaries, flashcards, and study materials for offline access. Simply look for the download icon on any content you want to save for later."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="group p-4 sm:p-6 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:bg-foreground/5 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-base sm:text-lg group-hover:text-purple-400 transition-colors">{faq.question}</h3>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-sm sm:text-base text-foreground/60 group-hover:text-foreground/80 transition-colors">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 