"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Building,
  GraduationCap,
  Globe,
  Camera,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces");

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

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
        {/* Header with gradient background */}
        <div className="relative -mx-8 -mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          
          {/* Header Content */}
          <div className="relative px-8 pt-12 pb-32 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="flex items-center text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
              </div>
              <Button 
                size="lg" 
                onClick={handleSave}
                disabled={isLoading}
                className="h-10 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2">
          {/* Profile Picture */}
          <Card className="group relative rounded-xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-white/90 group-hover:text-white transition-colors">Profile Picture</CardTitle>
              <CardDescription className="text-white/60">Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group/img">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white/10 transition-all duration-300 group-hover/img:border-purple-500/50 group-hover/img:shadow-lg group-hover/img:shadow-purple-500/20">
                    <div className="relative h-full w-full">
                      <Image
                        src={profileImage}
                        alt="Profile picture"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <Button 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-0 hover:from-purple-600 hover:to-blue-600 transition-all transform translate-y-2 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </div>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Click the camera icon to upload a new photo</p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="group relative rounded-xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-white/90 group-hover:text-white transition-colors">Basic Information</CardTitle>
              <CardDescription className="text-white/60">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Full Name</Label>
                <div className="relative group/input">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/40 group-hover/input:text-purple-400 transition-colors" />
                  <Input 
                    defaultValue="Sarah Connor"
                    className="pl-10 bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Email</Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40 group-hover/input:text-purple-400 transition-colors" />
                  <Input 
                    type="email"
                    defaultValue="sarah@example.com"
                    className="pl-10 bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">University</Label>
                <div className="relative group/input">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-white/40 group-hover/input:text-purple-400 transition-colors" />
                  <Input 
                    defaultValue="University of Technology"
                    className="pl-10 bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Year of Study</Label>
                <Select defaultValue="3">
                  <SelectTrigger className="bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="group relative rounded-xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-white/90 group-hover:text-white transition-colors">Additional Information</CardTitle>
              <CardDescription className="text-white/60">Add more details about yourself</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Bio</Label>
                <Textarea 
                  placeholder="Write a short bio about yourself..."
                  className="min-h-[100px] bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Field of Study</Label>
                <div className="relative group/input">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-white/40 group-hover/input:text-purple-400 transition-colors" />
                  <Input 
                    defaultValue="Medicine"
                    className="pl-10 bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Website</Label>
                <div className="relative group/input">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-white/40 group-hover/input:text-purple-400 transition-colors" />
                  <Input 
                    type="url"
                    placeholder="https://"
                    className="pl-10 bg-transparent border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="group relative rounded-xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-white/90 group-hover:text-white transition-colors">Privacy Settings</CardTitle>
              <CardDescription className="text-white/60">Manage your profile visibility</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="flex items-center justify-between group/switch">
                <div className="space-y-0.5">
                  <Label className="text-white/80 group-hover/switch:text-white transition-colors">Public Profile</Label>
                  <p className="text-sm text-white/60 group-hover/switch:text-white/80 transition-colors">Make your profile visible to everyone</p>
                </div>
                <Switch className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-blue-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between group/switch">
                <div className="space-y-0.5">
                  <Label className="text-white/80 group-hover/switch:text-white transition-colors">Show Learning Progress</Label>
                  <p className="text-sm text-white/60 group-hover/switch:text-white/80 transition-colors">Display your learning progress on your profile</p>
                </div>
                <Switch className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-blue-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between group/switch">
                <div className="space-y-0.5">
                  <Label className="text-white/80 group-hover/switch:text-white transition-colors">Show Study Streak</Label>
                  <p className="text-sm text-white/60 group-hover/switch:text-white/80 transition-colors">Display your study streak on your profile</p>
                </div>
                <Switch className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-blue-500" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 