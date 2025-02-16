"use client";

import * as React from "react";
import { useState } from "react";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Sparkles, Brain, Zap, GraduationCap, Star, ArrowRight, Shield, Clock, Users, Crown, Rocket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started",
      price: isAnnual ? "0" : "0",
      period: isAnnual ? "/year" : "/month",
      features: [
        "5 AI Study Sessions per month",
        "Basic note organization",
        "Access to community resources",
        "Email support",
        "Basic analytics"
      ],
      icon: Brain,
      color: "from-purple-500/10 to-blue-500/10",
      buttonColor: "bg-white/10 hover:bg-white/20",
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      description: "For dedicated learners",
      price: isAnnual ? "144" : "15",
      period: isAnnual ? "/year" : "/month",
      features: [
        "Unlimited AI Study Sessions",
        "Advanced note organization",
        "Priority AI response time",
        "Custom study plans",
        "Progress tracking",
        "Advanced analytics",
        "24/7 Priority support"
      ],
      icon: Crown,
      color: "from-purple-500/20 to-blue-500/20",
      buttonColor: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
      buttonText: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For institutions & teams",
      price: "Custom",
      period: "",
      features: [
        "Everything in Pro plan",
        "Custom integrations",
        "Dedicated support",
        "Analytics & reporting",
        "SSO & advanced security",
        "Team collaboration",
        "Custom AI training"
      ],
      icon: Shield,
      color: "from-blue-500/10 to-cyan-500/10",
      buttonColor: "bg-white/10 hover:bg-white/20",
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="flex h-14 items-center px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-8 p-8 pt-6">
        {/* Enhanced Header with Gradient Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-purple-500/20 animate-gradient" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="relative text-center space-y-4 py-16">
            <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-1.5 mb-8 border border-white/10 hover:border-white/20 transition-colors">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">New Features Available</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your Learning Journey
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Unlock the power of AI-enhanced learning with our flexible plans designed for every student's needs.
            </p>
            
            {/* Enhanced Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <span className={`text-sm transition-colors duration-200 ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <div className="relative">
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-blue-500"
                />
                {isAnnual && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-bounce">
                    Save 20%
                  </div>
                )}
              </div>
              <span className={`text-sm transition-colors duration-200 ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Annual</span>
            </div>
          </div>
        </div>

        {/* Enhanced Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto pt-8">
          {plans.map((plan, index) => (
            <div 
              key={plan.name} 
              className="relative group"
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10 flex items-center space-x-1">
                  <Crown className="w-4 h-4 mr-1" />
                  <span>Most Popular</span>
                </div>
              )}
              <Card 
                className={`
                  relative bg-black/80 backdrop-blur-sm border 
                  ${plan.popular ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15]' : 'border-white/10'} 
                  hover:border-white/20 transition-all duration-500 h-full 
                  transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10
                  ${hoveredPlan === plan.name ? 'scale-105' : 'scale-100'}
                `}
              >
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${plan.color} opacity-0 transition-opacity duration-500 ${hoveredPlan === plan.name ? 'opacity-100' : 'opacity-0'}`} />
                <CardHeader className="relative space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${plan.popular ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 shadow-lg shadow-purple-500/20' : 'bg-white/10'} transform transition-transform duration-300 group-hover:scale-110`}>
                      <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-200">{plan.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    {plan.price === "Custom" ? (
                      <span className="text-4xl font-bold text-white">Custom</span>
                    ) : (
                      <>
                        <span className="text-sm font-medium mr-2 text-gray-200">$</span>
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-200 ml-2">{plan.period}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <Button 
                    className={`
                      w-full ${plan.buttonColor} transform transition-all duration-300 
                      hover:scale-105 h-12 group/button font-semibold text-white shadow-lg shadow-purple-500/20
                      ${hoveredPlan === plan.name ? 'scale-105' : 'scale-100'}
                    `}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover/button:translate-x-1" />
                  </Button>
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center text-sm group/feature"
                      >
                        <div className={`
                          flex-shrink-0 h-5 w-5 rounded-full 
                          ${plan.popular ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 shadow-sm shadow-purple-500/20' : 'bg-white/10'} 
                          flex items-center justify-center mr-3 
                          group-hover/feature:scale-110 transition-transform duration-300
                        `}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-100 group-hover/feature:text-white transition-colors duration-200">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-32 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Why Choose Our Platform?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="absolute inset-0 bg-gradient-to-br from-${feature.color}-500/10 to-${feature.color}-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative text-center space-y-4 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-105">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-${feature.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "Can I switch plans at any time?",
                answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Is there a limit to AI interactions?",
                answer: "Basic plans have a monthly limit, while Pro and Enterprise plans offer unlimited AI interactions."
              },
              {
                question: "Do you offer student discounts?",
                answer: "Yes! Students with valid .edu email addresses are eligible for a 20% discount on Pro plans."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">{faq.question}</h3>
                  <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-gray-400 group-hover:text-gray-300 transition-colors">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10 animate-gradient" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="relative mx-auto max-w-[920px] text-center space-y-8 py-16">
            <h2 className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to transform your study experience?
            </h2>
            <p className="text-gray-400 max-w-[600px] mx-auto text-lg">
              Join thousands of students who are already using StudyMind to enhance their learning journey.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all group"
              >
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5 group-hover:animate-spin" />
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 transform hover:scale-105 transition-all group"
              >
                View Demo
                <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
            <div className="pt-8 flex justify-center items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center group hover:text-white transition-colors">
                <Clock className="h-4 w-4 mr-2 group-hover:text-purple-400 transition-colors" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center group hover:text-white transition-colors">
                <Shield className="h-4 w-4 mr-2 group-hover:text-purple-400 transition-colors" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center group hover:text-white transition-colors">
                <Users className="h-4 w-4 mr-2 group-hover:text-purple-400 transition-colors" />
                <span>50K+ active users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 