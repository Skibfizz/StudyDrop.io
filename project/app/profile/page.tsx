"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Camera, Upload, ArrowLeft, Home, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/avatar-utils";
import { SharedHeader } from "@/components/shared-header";
import { VerifiedAvatar } from "@/components/verified-avatar";
import { useUsage } from "@/lib/hooks/use-usage";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status: sessionStatus } = useSession();
  const { user: supabaseUser, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { usageData } = useUsage();
  const router = useRouter();
  
  // Initialize form with user data when session is loaded
  useEffect(() => {
    // First try to get data from Next-Auth session
    if (sessionStatus === "authenticated" && session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setIsLoading(false);
    } 
    // If Next-Auth doesn't have the data, try Supabase
    else if (!authLoading && supabaseUser) {
      setName(supabaseUser.user_metadata?.full_name || "");
      setEmail(supabaseUser.email || "");
      setIsLoading(false);
    }
    // If both auth methods have loaded but no user data is found
    else if (sessionStatus !== "loading" && !authLoading) {
      setIsLoading(false);
    }
  }, [session, sessionStatus, supabaseUser, authLoading]);

  const handleSaveChanges = () => {
    // Here you would implement the API call to save changes
    toast({
      title: "Success",
      description: "Your profile has been updated",
      variant: "success",
    });
  };

  // Generate avatar data
  const displayName = name || session?.user?.name || supabaseUser?.user_metadata?.full_name || "User";
  
  // Format subscription tier for display
  const formatTier = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Fixed position header with z-index to ensure it's visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-500/10">
        <SharedHeader />
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 pt-24">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Navigation Options */}
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex space-x-2">
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/50 rounded-full px-4 py-1.5 mb-4 border border-purple-500/20">
              <User className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">Profile Settings</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Your Profile
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your account settings and preferences
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-gray-500">Loading your profile information...</p>
              </div>
            </div>
          ) : (
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
              <div className="space-y-8">
                {/* Profile Picture Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="relative group">
                      <VerifiedAvatar
                        name={displayName}
                        size="lg"
                        isVerified={true}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        {displayName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{email || "your.email@example.com"}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {usageData ? `${formatTier(usageData.tier)} subscription` : "Loading subscription..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid gap-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="pl-10 h-12 bg-white/80 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          className="pl-10 h-12 bg-white/80 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      className="h-11 px-8"
                      onClick={() => {
                        // Reset to original values
                        const originalName = session?.user?.name || supabaseUser?.user_metadata?.full_name || "";
                        const originalEmail = session?.user?.email || supabaseUser?.email || "";
                        setName(originalName);
                        setEmail(originalEmail);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="h-11 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 