"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SharedHeader } from "@/components/shared-header";

export default function SettingsPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SharedHeader />

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 pt-24">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Settings
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your account settings
            </p>
          </div>

          {/* Sign Out Card */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-red-100">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 