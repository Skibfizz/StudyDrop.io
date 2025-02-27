"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, ChevronRight, Brain, RefreshCcw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast as useToastHook } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@/lib/hooks/use-user';
import { UsageDisplay } from "@/components/usage/usage-display";
import { useUsage } from "@/lib/hooks/use-usage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function YouTubeLearningPage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const { toast } = useToastHook();
  const { user } = useUser();
  const { checkAndIncrementUsage } = useUsage();

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_usage', {
        p_user_id: user?.id
      });

      if (error) throw error;
      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const handleProcess = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    // Extract video ID from URL
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const id = match?.[1];

    if (!id) {
      toast({
        title: "Error",
        description: "Invalid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    // Check usage limits before processing
    const canProceed = await checkAndIncrementUsage('video_summaries');
    if (!canProceed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/youtube-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userId: user?.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process video');
      }

      const data = await response.json();
      setVideoData(data);
      setVideoId(id);

      toast({
        title: "Success",
        description: "Video processed successfully",
        variant: "success"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!videoData?.transcript) {
      toast({
        title: "Error",
        description: "No transcript available to regenerate summary",
        variant: "destructive"
      });
      return;
    }

    // Check usage limits before regenerating
    const canProceed = await checkAndIncrementUsage('video_summaries');
    if (!canProceed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/youtube-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRegenerating: true,
          transcript: videoData.transcript,
          userId: user?.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate summary');
      }

      const data = await response.json();
      setVideoData({ ...videoData, summary: data.summary });

      toast({
        title: "Success",
        description: "Summary regenerated successfully",
        variant: "success"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
          <UsageDisplay />

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
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Youtube className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Processing...' : 'Process'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
              <h2 className="text-xl font-semibold mb-4">{videoData?.title || 'Lecture Video'}</h2>
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
                <Button variant="outline" className="flex-1 py-4" disabled={isLoading}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-4"
                  onClick={handleRegenerateSummary}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  ) : (
                    <RefreshCcw className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Regenerating...' : 'Regenerate Summary'}
                </Button>
              </div>
              {videoData?.summary && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Summary</h3>
                  <div className="prose max-w-none">
                    {videoData.summary.split('\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
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