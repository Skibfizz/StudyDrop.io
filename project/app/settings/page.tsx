"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Moon,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Zap,
  Brain
} from "lucide-react";

export default function SettingsPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and settings</p>
          </div>
          <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            Save Changes
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Account Settings */}
          <Card className="bg-black border border-white/10">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="sarah@example.com" 
                  className="bg-transparent border-white/10 focus:border-white/20"
                />
              </div>
              <div className="grid gap-4">
                <Label>Time Zone</Label>
                <Input 
                  type="text" 
                  placeholder="UTC-5 (Eastern Time)" 
                  className="bg-transparent border-white/10 focus:border-white/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-black border border-white/10">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Study Reminders",
                  description: "Get notified about scheduled study sessions",
                  icon: Bell
                },
                {
                  title: "AI Assistant Updates",
                  description: "Receive updates about new AI features",
                  icon: Brain
                },
                {
                  title: "Progress Reports",
                  description: "Weekly summary of your study progress",
                  icon: Zap
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-black border border-white/10">
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Two-Factor Authentication",
                  description: "Add an extra layer of security to your account",
                  icon: Shield,
                  enabled: true
                },
                {
                  title: "Study Data Collection",
                  description: "Allow us to collect data to improve your experience",
                  icon: Brain,
                  enabled: true
                },
                {
                  title: "Profile Visibility",
                  description: "Control who can see your profile and activity",
                  icon: Globe,
                  enabled: false
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card className="bg-black border border-white/10">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected accounts and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  service: "Google",
                  status: "Connected",
                  icon: Mail
                },
                {
                  service: "Mobile App",
                  status: "Not Connected",
                  icon: Smartphone
                }
              ].map((account, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                      <account.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{account.service}</p>
                      <p className="text-sm text-gray-400">{account.status}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5">
                    {account.status === "Connected" ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 