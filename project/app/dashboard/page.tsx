"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  BookOpen, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Calendar, 
  Brain, 
  Flame,
  Star,
  Trophy,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <Upload className="mr-2 h-4 w-4" />
            Upload Notes
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Notes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-white/60">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Study Sessions
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-white/60">
                +4 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Chat Interactions
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">120</div>
              <p className="text-xs text-white/60">
                +18 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Study Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Progress value={68} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500" />
              <p className="mt-2 text-xs text-white/60">
                68% of weekly goal completed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="group relative col-span-4 border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold text-white">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-6">
                {[
                  {
                    title: "Machine Learning Fundamentals",
                    date: "2 hours ago",
                    progress: 75,
                  },
                  {
                    title: "Data Structures",
                    date: "4 hours ago",
                    progress: 32,
                  },
                  {
                    title: "Web Development",
                    date: "6 hours ago",
                    progress: 90,
                  },
                ].map((note) => (
                  <div className="group/note flex items-center" key={note.title}>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-white">
                        {note.title}
                      </p>
                      <p className="text-sm text-white/60">
                        {note.date}
                      </p>
                    </div>
                    <div className="ml-4 w-20">
                      <Progress 
                        value={note.progress} 
                        className="h-1.5 bg-white/10" 
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative col-span-3 border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold text-white">Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-6">
                {[
                  "Review Machine Learning concepts",
                  "Practice Data Structures problems",
                  "Complete Web Development exercises",
                ].map((recommendation) => (
                  <div
                    className="group/rec flex items-center justify-between"
                    key={recommendation}
                  >
                    <p className="text-sm font-medium text-white">
                      {recommendation}
                    </p>
                    <Button variant="link" className="group/btn text-blue-400 hover:text-blue-300 p-0">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="group relative col-span-3 border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center text-lg font-semibold text-white">
                <Calendar className="mr-2 h-5 w-5 text-purple-400" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {[
                  { time: "09:00 AM", subject: "Machine Learning", duration: "1h 30m" },
                  { time: "11:00 AM", subject: "Data Structures", duration: "2h" },
                  { time: "02:00 PM", subject: "Web Development", duration: "1h" },
                ].map((session) => (
                  <div key={session.time} className="flex items-center justify-between border-l-2 border-purple-500/30 pl-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{session.subject}</p>
                      <p className="text-xs text-white/60">{session.time}</p>
                    </div>
                    <span className="text-xs text-white/60">{session.duration}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative col-span-4 border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center text-lg font-semibold text-white">
                <Brain className="mr-2 h-5 w-5 text-blue-400" />
                Recent AI Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {[
                  {
                    question: "Can you explain neural networks?",
                    time: "10 mins ago",
                    subject: "Machine Learning"
                  },
                  {
                    question: "How does quicksort work?",
                    time: "1 hour ago",
                    subject: "Data Structures"
                  },
                  {
                    question: "Explain React hooks",
                    time: "2 hours ago",
                    subject: "Web Development"
                  }
                ].map((interaction) => (
                  <div key={interaction.question} className="group/chat flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{interaction.question}</p>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <span>{interaction.time}</span>
                        <span>•</span>
                        <span>{interaction.subject}</span>
                      </div>
                    </div>
                    <Button variant="link" className="group/btn text-blue-400 hover:text-blue-300 p-0">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Learning Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">7 Days</div>
              <p className="text-xs text-white/60">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Topics Mastered
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-white/60">+3 this month</p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Achievements
              </CardTitle>
              <Trophy className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">8</div>
              <p className="text-xs text-white/60">2 near completion</p>
            </CardContent>
          </Card>

          <Card className="group relative border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Monthly Goal
              </CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent className="relative">
              <Progress value={85} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500" />
              <p className="mt-2 text-xs text-white/60">
                85% completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}