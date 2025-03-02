"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, ChevronRight, Brain, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUsage } from "@/lib/hooks/use-usage";
import { useSupabase } from "@/context/supabase-context";
import { saveVideoSummary, getRecentLectures, getLectureById } from "@/lib/video-helpers";
import { format } from "date-fns";

// TypewriterText component for animating text
const TypewriterText = ({ text, speed = 10, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return <span>{displayedText}<span className="animate-pulse">|</span></span>;
};

export default function YouTubeLearningPage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [recentLectures, setRecentLectures] = useState<any[]>([]);
  const [isLoadingLectures, setIsLoadingLectures] = useState(true);
  const { toast } = useToast();
  const { checkAndIncrementUsage } = useUsage();
  const { user } = useSupabase();

  // Function to fetch recent lectures
  const fetchRecentLectures = async () => {
    if (!user) {
      console.log('No user found, skipping lecture fetch');
      return;
    }
    
    console.log('Fetching recent lectures for user:', user.id);
    setIsLoadingLectures(true);
    try {
      // Always fetch exactly 3 recent lectures
      const lectures = await getRecentLectures(user.id, 3);
      console.log('Fetched lectures:', lectures);
      setRecentLectures(lectures);
    } catch (error) {
      console.error('Error fetching recent lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load recent lectures",
        variant: "error"
      });
    } finally {
      setIsLoadingLectures(false);
    }
  };

  // Fetch recent lectures on component mount or when user changes
  useEffect(() => {
    fetchRecentLectures();
  }, [user]);
  
  // Refresh lectures after processing a new video
  useEffect(() => {
    if (videoData) {
      fetchRecentLectures();
    }
  }, [videoData]);

  // Load lecture details when a lecture is clicked
  const handleLectureClick = async (lecture: any) => {
    setVideoId(lecture.video_id);
    setIsLoading(true);
    
    try {
      // Fetch the full lecture data
      const fullLecture = await getLectureById(lecture.id);
      
      if (fullLecture && fullLecture.content) {
        setVideoData({
          title: fullLecture.title || 'Untitled Lecture',
          videoId: fullLecture.content.videoId,
          summary: fullLecture.content.summary,
          duration: fullLecture.content.duration || 'PT00M00S',
          transcript: fullLecture.content.transcript
        });
        
        // Start typing animation for the summary
        setIsTyping(true);
        
        // Update URL without refreshing the page
        setUrl(`https://www.youtube.com/watch?v=${fullLecture.content.videoId}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to load lecture details. The lecture data may be incomplete.",
          variant: "error"
        });
      }
    } catch (error) {
      console.error('Error loading lecture:', error);
      toast({
        title: "Error",
        description: "Failed to load lecture details",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "error"
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
        variant: "error"
      });
      return;
    }

    // Check usage limits before processing
    const canProceed = await checkAndIncrementUsage('video_summaries');
    if (!canProceed) return;

    setIsLoading(true);
    try {
      // Call the Supabase Edge Function to process the video
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase.functions.invoke('youtube-process', {
        body: {
          url,
          userId: user?.id,
          isRegenerating: false
        }
      });
      
      if (error) throw error;
      
      setVideoId(id);
      setVideoData(data);
      
      // Save the video summary to the database
      if (user && data) {
        console.log('Saving video summary for user:', user.id);
        try {
          const savedData = await saveVideoSummary(user.id, data);
          console.log('Video summary saved successfully:', savedData);
          
          // Refresh the recent lectures list
          console.log('Refreshing recent lectures after save');
          await fetchRecentLectures();
        } catch (saveError) {
          console.error('Error saving video summary:', saveError);
          toast({
            title: "Warning",
            description: "Video processed but could not be saved to your history",
            variant: "error"
          });
        }
      } else {
        console.log('Cannot save video summary:', { user: !!user, data: !!data });
      }
      
      // Start typing animation
      setIsTyping(true);

      toast({
        title: "Success",
        description: "Video processed successfully",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error processing video:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!videoId || !videoData?.transcript) {
      toast({
        title: "Error",
        description: "No video available to regenerate summary",
        variant: "error"
      });
      return;
    }

    // Check usage limits before regenerating
    const canProceed = await checkAndIncrementUsage('video_summaries');
    if (!canProceed) return;

    setIsLoading(true);
    try {
      // Call the Supabase Edge Function to regenerate the summary
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase.functions.invoke('youtube-process', {
        body: {
          userId: user?.id,
          isRegenerating: true,
          transcript: videoData.transcript
        }
      });
      
      if (error) throw error;
      
      // Update the video data with the new summary
      setVideoData({
        ...videoData,
        summary: data.summary
      });
      
      // Start typing animation
      setIsTyping(true);
      
      toast({
        title: "Success",
        description: "Summary regenerated successfully",
        variant: "success"
      });
    } catch (error: any) {
      console.error('Error regenerating summary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate summary",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!videoId || !videoData?.transcript) {
      toast({
        title: "Error",
        description: "No video available to generate flashcards",
        variant: "error"
      });
      return;
    }

    // Check usage limits before generating flashcards
    const canProceed = await checkAndIncrementUsage('flashcard_sets');
    if (!canProceed) return;

    setIsLoading(true);
    try {
      // Here you would call an API to generate flashcards
      // For now, we'll just show a success message
      
      toast({
        title: "Success",
        description: "Flashcards generated successfully",
        variant: "success"
      });
      
      // In a real implementation, you would:
      // 1. Call an API to generate flashcards from the transcript
      // 2. Save the flashcards to the database
      // 3. Navigate to a flashcards view or show them on the page
      
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format duration from ISO 8601 format
  const formatDuration = (isoDuration: string) => {
    if (!isoDuration) return "00:00";
    
    // Simple parsing for PT15M30S format
    const minutesMatch = isoDuration.match(/(\d+)M/);
    const secondsMatch = isoDuration.match(/(\d+)S/);
    
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), 'dd/MM/yyyy');
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
                <Button 
                  variant="outline" 
                  className="flex-1 py-4"
                  onClick={handleGenerateFlashcards}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Flashcards'}
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
                      <p key={index}>
                        {isTyping ? (
                          <TypewriterText 
                            text={paragraph} 
                            speed={5} 
                            onComplete={() => {
                              if (index === videoData.summary.split('\n').length - 1) {
                                setIsTyping(false);
                              }
                            }}
                          />
                        ) : paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Lectures</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchRecentLectures}
                disabled={isLoadingLectures}
                className="h-8 px-2"
              >
                {isLoadingLectures ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
            <div className="space-y-2">
              {isLoadingLectures ? (
                <div className="py-8 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                </div>
              ) : recentLectures.length > 0 ? (
                recentLectures.map((lecture) => (
                  <Button
                    key={lecture.id}
                    variant="ghost"
                    className="w-full justify-between hover:bg-purple-500/5 h-auto py-3"
                    onClick={() => handleLectureClick(lecture)}
                  >
                    <div className="flex items-center space-x-3">
                      <Youtube className="h-4 w-4 text-red-500" />
                      <div className="text-left">
                        <div className="font-medium">{lecture.title || 'Untitled Lecture'}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(lecture.created_at)} • {formatDuration(lecture.duration || 'PT00M00S')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No lectures processed yet. Process a YouTube video to get started.
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 