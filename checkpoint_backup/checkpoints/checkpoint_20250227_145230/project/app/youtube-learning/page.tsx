"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, ChevronRight, Brain, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function YouTubeLearningPage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleProcess = () => {
    // Extract video ID from URL (simplified example)
    const id = url.split('v=')[1]?.split('&')[0];
    setVideoId(id);
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

      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      <main className="flex-1 p-8 pt-24 relative">
        <div className="max-w-2xl mx-auto space-y-8">
          {!videoId ? (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
              <h2 className="text-xl font-semibold mb-4">Process YouTube Lecture</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">YouTube URL</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Paste YouTube URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-white border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20"
                    />
                    <Button
                      onClick={handleProcess}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Youtube className="h-4 w-4 mr-2" />
                      Process
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
              <h2 className="text-xl font-semibold mb-4">Lecture Video</h2>
              <div className="aspect-video bg-gray-100 rounded-lg mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex-1 py-4">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </Button>
                <Button variant="outline" className="flex-1 py-4">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerate Summary
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
            <h2 className="text-xl font-semibold mb-4">Recent Lectures</h2>
            <div className="space-y-2">
              {[
                { title: 'Machine Learning Basics', date: '18/02/2024', duration: '00:00' },
                { title: 'Data Structures', date: '18/02/2024', duration: '00:00' },
                { title: 'Web Development', date: '18/02/2024', duration: '00:00' }
              ].map((lecture) => (
                <Button
                  key={lecture.title}
                  variant="ghost"
                  className="w-full justify-between hover:bg-purple-500/5 h-auto py-3"
                >
                  <div className="flex items-center space-x-3">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <div className="text-left">
                      <div>{lecture.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {lecture.date} • {lecture.duration}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 