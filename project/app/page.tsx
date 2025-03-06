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
import { HomepageNavbar } from "@/components/homepage-navbar";
import { SharedHeader } from "@/components/shared-header";
import { LogoCarouselDemo } from "@/components/ui/logo-carousel-demo";
import { useTheme } from "next-themes";
import { Footer } from "@/components/ui/code.demo";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { StarRating } from "@/components/ui/star-rating";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  
  console.log("Home page component: Session data on render:", {
    nextAuthSessionExists: !!session,
    nextAuthSessionUser: session?.user,
    supabaseUserExists: !!supabaseUser
  });
  
  // Add an effect to check Supabase authentication
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      console.log("Home page component: Supabase session check:", {
        hasSession: !!supabaseSession,
        userId: supabaseSession?.user?.id,
        email: supabaseSession?.user?.email
      });
      
      setSupabaseUser(supabaseSession?.user || null);
    };
    
    checkSupabaseAuth();
  }, []);
  
  // Add an effect to log when session changes
  useEffect(() => {
    console.log("Home page component: NextAuth session data changed:", {
      sessionExists: !!session,
      sessionUser: session?.user
    });
  }, [session]);
  
  // Function to handle authentication check and redirection
  const handleAuthCheck = async () => {
    console.log("Home page: Checking auth with Supabase");
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    
    console.log("Home page: Supabase auth check result:", {
      hasSession: !!supabaseSession,
      userId: supabaseSession?.user?.id,
      email: supabaseSession?.user?.email
    });
    
    if (supabaseSession) {
      console.log("Home page: Supabase user is authenticated, redirecting to dashboard");
      router.push('/dashboard');
    } else {
      console.log("Home page: Supabase user is not authenticated, redirecting to signin");
      router.push('/auth/signin');
    }
  };

  const reviews = [
    {
      text: "The Video Learning feature has transformed how I study from YouTube lectures. Being able to automatically get summaries and notes saves me so much time.",
      author: "Sarah K.",
      role: "Medical Student",
      rating: 5
    },
    {
      text: "The Text Humanizer tool is incredible! It makes my academic writing more engaging and easier to understand. My professors have noticed the improvement.",
      author: "James L.",
      role: "Computer Science Major",
      rating: 5
    },
    {
      text: "I love how the Flashcards feature turns my notes into interactive study materials. It's helped me memorize complex concepts much faster.",
      author: "Emily R.",
      role: "High School Senior",
      rating: 5
    },
    {
      text: "The YouTube lecture processing is a game-changer. I can upload any educational video and get AI-powered summaries and practice questions instantly.",
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
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 theme-gradient-bg z-0" />
      <div className="absolute inset-0 theme-dot-pattern z-0" />
      <HomepageNavbar />
      
      <main className="flex-1 pt-16 md:pt-0 relative z-10">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center px-6 pt-60 pb-40">
          <AnimatedGridPattern
            numSquares={50}
            maxOpacity={0.1}
            duration={4}
            repeatDelay={0.5}
            className={cn(
              "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-0 h-full"
            )}
          />
          
          <div className="relative mx-auto max-w-[920px] space-y-8 text-center flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-4 mx-auto text-center">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 leading-[1.2] pb-1">
                Master any subject
              </span>
              <span className="block leading-[1.2]">with AI-Powered learning</span>
            </h1>
            
            <div className="mt-4 mb-8">
              <RainbowButton onClick={handleAuthCheck}>
                Get started - It's Free
              </RainbowButton>
              <div className="flex flex-row items-center justify-center gap-6 mt-6 w-full mx-auto">
                <AvatarCircles 
                  numPeople={99} 
                  avatarUrls={[
                    "https://avatars.githubusercontent.com/u/16860528",
                    "https://avatars.githubusercontent.com/u/20110627",
                    "https://avatars.githubusercontent.com/u/106103625",
                    "https://avatars.githubusercontent.com/u/59228569",
                  ]} 
                />
                <StarRating defaultValue={4.5} disabled size="md" />
              </div>
            </div>
            
            <div className="w-[75%] mt-16">
              <LogoCarouselDemo />
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="relative px-0 py-32 overflow-hidden scroll-mt-32">
          <div className="relative mx-auto w-full">
            <div className="text-center mb-16">
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
        <section id="features-section" className="relative px-6 py-32 scroll-mt-32">
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

        {/* Final CTA Section */}
        <section className="relative px-6 py-24">
          <div className="relative mx-auto max-w-[920px] text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">Ready to transform your study experience?</h2>
            <p className="text-gray-600 max-w-[600px] mx-auto">
              Join thousands of students who are already using StudyDrop to enhance their learning journey.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all"
                onClick={handleAuthCheck}
              >
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}