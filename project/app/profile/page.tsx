"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Camera, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  // Initialize form with user data when session is loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSaveChanges = () => {
    // Here you would implement the API call to save changes
    toast({
      title: "Success",
      description: "Your profile has been updated",
      variant: "success",
    });
  };

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

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 pt-24">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
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

          {/* Profile Card */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
            <div className="space-y-8">
              {/* Profile Picture Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-purple-50 ring-offset-2">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Profile"}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-purple-100">
                          <User className="h-12 w-12 text-purple-500" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white hover:bg-purple-50 border-purple-100 hover:border-purple-200 transition-all shadow-lg"
                    >
                      <Camera className="h-4 w-4 text-purple-500" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                      {session?.user?.name || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{session?.user?.email || "your.email@example.com"}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: JPEG, PNG, GIF. Maximum file size: 5MB.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="space-x-2 h-10">
                  <Upload className="h-4 w-4 text-purple-500" />
                  <span>Upload New</span>
                </Button>
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
                      setName(session?.user?.name || "");
                      setEmail(session?.user?.email || "");
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
        </div>
      </main>
    </div>
  );
} 