"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Clock, 
  GraduationCap, 
  Brain, 
  Sparkles,
  ArrowRight,
  Rocket,
  FileText,
  Share2,
  MoreHorizontal,
  Tag,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NotesPage() {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const notes = [
    {
      id: "cs101",
      title: "Computer Science 101",
      description: "Data Structures and Algorithms fundamentals, Big O notation...",
      lastStudied: "2 hours ago",
      tags: ["Algorithms", "Data Structures"],
      progress: 75,
      icon: Brain
    },
    {
      id: "physics",
      title: "Physics Mechanics",
      description: "Newton's Laws, Kinematics, Conservation of Energy...",
      lastStudied: "1 day ago",
      tags: ["Physics", "Mechanics"],
      progress: 60,
      icon: Rocket
    },
    {
      id: "calculus",
      title: "Calculus II",
      description: "Integration techniques, Series and Sequences, Applications...",
      lastStudied: "3 days ago",
      tags: ["Math", "Calculus"],
      progress: 45,
      icon: GraduationCap
    }
  ];

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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-purple-500/20 animate-gradient" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-1.5 mb-4 border border-white/10">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Study Notes</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Study Notes
              </h1>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 text-base border-white/10 hover:bg-white/5 hover:border-white/20 transition-all group"
              >
                <Brain className="mr-2 h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                Ask AI Tutor
              </Button>
              <Button 
                size="lg" 
                className="h-12 px-8 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all group"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            <Input 
              placeholder="Search your study notes..." 
              className="pl-10 bg-transparent border-white/10 focus:border-purple-500/50 h-12 transition-all hover:border-white/20"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div 
              key={note.id}
              onMouseEnter={() => setHoveredNote(note.id)}
              onMouseLeave={() => setHoveredNote(null)}
            >
              <Card className={`
                relative bg-black border border-white/10 
                hover:border-purple-500/50 transition-all duration-300 
                group cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10
                ${hoveredNote === note.id ? 'border-purple-500/50 scale-[1.02]' : ''}
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15] opacity-0 transition-opacity duration-300 rounded-lg group-hover:opacity-100" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                        <note.icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </div>
                      <CardTitle className="text-lg font-semibold group-hover:text-white transition-colors">
                        {note.title}
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
                    {note.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-1 text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full group-hover:bg-white/10 transition-colors"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{note.lastStudied}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Updated today</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 relative h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${note.progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="relative mt-6">
          <Card className="border border-dashed border-white/10 bg-transparent hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-all mb-4">
                <Plus className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">Create New Note</h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors max-w-md">
                Start a new study note with AI-powered organization and insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 