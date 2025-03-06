"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SharedHeader } from "@/components/shared-header";
import { HelpCircle, Send } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8FC]">
      {/* Fixed position header with z-index to ensure it's visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-500/10">
        <SharedHeader />
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 space-y-8 pt-20">
        {/* Enhanced Hero Section */}
        <section className="relative px-6 pt-10 pb-8">
          <div className="relative max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-tight py-1">
                How Can We Help You?
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              We're here to assist with any questions or issues you might have. Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Enhanced Contact Form */}
        <div className="max-w-2xl mx-auto px-6 pb-16">
          <Card className="relative overflow-hidden border-purple-500/10 p-8 backdrop-blur-sm bg-white/80 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03]" />
            <div className="relative space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Send Us a Message</h2>
                <p className="text-sm text-gray-500 mt-1">Fill out the form below and we'll respond within 24 hours</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="What do you need help with?" 
                  className="h-12 bg-white/90 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20 placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue in detail..." 
                  className="min-h-[180px] resize-none bg-white/90 border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20 placeholder:text-gray-400"
                />
              </div>
              
              <Button 
                className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-[1.01] transition-all duration-200 shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 