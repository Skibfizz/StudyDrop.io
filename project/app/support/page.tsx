"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SupportPage() {
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

      <main className="flex-1 space-y-8">
        {/* Enhanced Hero Section */}
        <section className="relative px-6 pt-24 pb-16">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-purple-500/[0.08]" />
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          <div className="relative max-w-2xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-tight py-1">
                Contact Support
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're here to help. Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Enhanced Contact Form */}
        <div className="max-w-2xl mx-auto px-6">
          <Card className="relative overflow-hidden border-purple-500/10 p-8 backdrop-blur-sm bg-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] to-blue-500/[0.08]" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="What do you need help with?" 
                  className="h-12 bg-white/80 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-medium">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue in detail..." 
                  className="min-h-[200px] resize-none bg-white/80 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20 placeholder:text-gray-400"
                />
              </div>
              <Button 
                className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                Send Message
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 