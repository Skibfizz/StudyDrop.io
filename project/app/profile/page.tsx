"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Book, 
  GraduationCap, 
  Clock, 
  Star,
  Edit,
  Camera,
  Trophy,
  Target,
  Brain,
  Zap,
  Calendar,
  BarChart,
  BookOpen,
  Users,
  Medal,
  Award,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Memoized achievement component for better performance
const Achievement = ({ icon: Icon, color, title }: { icon: any, color: string, title: string }) => (
  <div className="flex flex-col items-center space-y-2 group">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-white/10">
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <span className="text-xs text-center text-gray-400 group-hover:text-white transition-colors">{title}</span>
  </div>
);

// Memoized stat card component
const StatCard = ({ title, value, change, color }: { title: string, value: string, change: string, color: string }) => (
  <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-2">
        <Progress value={parseInt(value)} className="h-1 bg-white/10" indicatorClassName={color} />
      </div>
      <p className="mt-2 text-xs text-gray-400">{change}</p>
    </CardContent>
  </Card>
);

// Profile Picture Component
const ProfilePicture = () => (
  <div className="relative group">
    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-black transition-all duration-300 group-hover:scale-105 group-hover:border-purple-500/50">
      <div className="relative h-full w-full">
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces"
          alt="Profile picture"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:opacity-0 transition-opacity" />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <Button 
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-purple-500 p-0 hover:bg-purple-600 transition-all transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        asChild
      >
        <Link href="/profile/edit">
          <Camera className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
);

export default function ProfilePage() {
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
        {/* Enhanced Profile Header with better gradient and animation */}
        <div className="relative h-48 w-full rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-purple-500/30 animate-gradient" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="absolute -bottom-12 left-8 flex items-end space-x-6">
            <ProfilePicture />
            <div className="mb-4 flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Sarah Connor</h1>
              <p className="text-gray-400">Medical Student • 3rd Year</p>
            </div>
          </div>
          <div className="absolute right-8 bottom-4">
            <Button 
              size="lg" 
              className="h-10 bg-white/10 hover:bg-white/20 backdrop-blur transition-all hover:scale-105"
              asChild
            >
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-6">
          {/* Left Sidebar */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Mail, text: "sarah@example.com" },
                  { icon: GraduationCap, text: "University of Technology" },
                  { icon: Calendar, text: "Joined September 2023" },
                  { icon: Users, text: "250+ Study Connections" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm group">
                    <item.icon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Streak Card */}
            <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 animate-pulse">7</div>
                  <p className="text-sm text-gray-400">Days in a row</p>
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {Array(7).fill(null).map((_, i) => (
                      <div key={i} className="h-2 rounded-full bg-yellow-400/80 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-purple-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Star, color: "text-yellow-400", title: "Fast Learner" },
                    { icon: Brain, color: "text-purple-400", title: "AI Master" },
                    { icon: Target, color: "text-blue-400", title: "Goal Setter" },
                    { icon: Medal, color: "text-green-400", title: "Top Student" },
                    { icon: Award, color: "text-red-400", title: "Champion" },
                    { icon: BookOpen, color: "text-cyan-400", title: "Bookworm" }
                  ].map((achievement, index) => (
                    <Achievement key={index} {...achievement} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-4 space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <StatCard 
                title="Study Hours"
                value="128.5"
                change="+12.3% from last month"
                color="bg-purple-500"
              />
              <StatCard 
                title="Notes Created"
                value="45"
                change="+8 this month"
                color="bg-blue-500"
              />
              <StatCard 
                title="AI Interactions"
                value="256"
                change="+32% from last week"
                color="bg-green-500"
              />
            </div>

            {/* Learning Progress */}
            <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-blue-400" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { subject: "Medical Anatomy", progress: 85, color: "bg-purple-500" },
                    { subject: "Pathology", progress: 72, color: "bg-blue-500" },
                    { subject: "Pharmacology", progress: 64, color: "bg-green-500" },
                    { subject: "Clinical Skills", progress: 91, color: "bg-yellow-500" }
                  ].map((subject, index) => (
                    <div key={index} className="space-y-2 group">
                      <div className="flex justify-between text-sm">
                        <span className="group-hover:text-white transition-colors">{subject.subject}</span>
                        <span className="text-gray-400 group-hover:text-white transition-colors">{subject.progress}%</span>
                      </div>
                      <Progress 
                        value={subject.progress} 
                        className="h-1 bg-white/10" 
                        indicatorClassName={`${subject.color} transition-all duration-500`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      action: "Completed Study Session",
                      subject: "Advanced Pathology",
                      time: "2 hours ago",
                      icon: Brain,
                      color: "text-purple-400",
                      bgColor: "bg-purple-500/10"
                    },
                    {
                      action: "Created New Notes",
                      subject: "Anatomy & Physiology",
                      time: "5 hours ago",
                      icon: BookOpen,
                      color: "text-blue-400",
                      bgColor: "bg-blue-500/10"
                    },
                    {
                      action: "Earned Achievement",
                      subject: "Study Streak: 7 Days",
                      time: "1 day ago",
                      icon: Trophy,
                      color: "text-yellow-400",
                      bgColor: "bg-yellow-500/10"
                    },
                    {
                      action: "Joined Study Group",
                      subject: "Medical Students Network",
                      time: "2 days ago",
                      icon: Users,
                      color: "text-green-400",
                      bgColor: "bg-green-500/10"
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 group hover:bg-white/5 p-3 rounded-lg transition-colors cursor-pointer">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.bgColor} group-hover:scale-110 transition-transform`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium group-hover:text-white transition-colors">{activity.action}</p>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{activity.subject}</p>
                      </div>
                      <div className="text-sm text-gray-400 group-hover:text-white transition-colors flex items-center">
                        {activity.time}
                        <ChevronRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 