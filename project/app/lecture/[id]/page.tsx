"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LectureSummary } from "@/components/lecture-summary";
import { RecentLectures } from "@/components/recent-lectures";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/context/supabase-context";
import { getLectureById } from "@/lib/video-helpers";
import { Loader2 } from "lucide-react";

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [lectureData, setLectureData] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Fetch lecture data on component mount
  useEffect(() => {
    const fetchLectureData = async () => {
      if (!params.id) {
        toast({
          title: "Error",
          description: "Lecture ID not provided",
          variant: "error"
        });
        router.push("/dashboard");
        return;
      }

      try {
        setIsLoading(true);
        const lectureId = Array.isArray(params.id) ? params.id[0] : params.id;
        const lecture = await getLectureById(lectureId);
        
        if (!lecture || !lecture.content) {
          toast({
            title: "Error",
            description: "Lecture not found or data is incomplete",
            variant: "error"
          });
          router.push("/dashboard");
          return;
        }

        setLectureData({
          id: lecture.id,
          title: lecture.title || "Untitled Lecture",
          videoId: lecture.content.videoId,
          summary: lecture.content.summary,
          transcript: lecture.content.transcript,
          duration: lecture.content.duration || "PT00M00S"
        });
      } catch (error) {
        console.error("Error fetching lecture:", error);
        toast({
          title: "Error",
          description: "Failed to load lecture data",
          variant: "error"
        });
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureData();
  }, [params.id, router, toast]);

  // Handle regenerate summary
  const handleRegenerateSummary = async () => {
    if (!lectureData || !user) return;

    setIsRegenerating(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase.functions.invoke('youtube-process', {
        body: {
          url: `https://www.youtube.com/watch?v=${lectureData.videoId}`,
          userId: user.id,
          isRegenerating: true
        }
      });
      
      if (error) throw error;
      
      // Update lecture data with new summary
      setLectureData({
        ...lectureData,
        summary: data.summary
      });
      
      toast({
        title: "Success",
        description: "Summary regenerated successfully",
      });
    } catch (error) {
      console.error("Error regenerating summary:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate summary",
        variant: "error"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!lectureData || !user) return;

    setIsGeneratingFlashcards(true);
    try {
      // Navigate to flashcards page with lecture data
      router.push(`/flashcards?lectureId=${lectureData.id}`);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards",
        variant: "error"
      });
      setIsGeneratingFlashcards(false);
    }
  };

  // Handle lecture selection from recent lectures
  const handleLectureSelect = (lecture: any) => {
    // Navigate to the chat page with the YouTube tab active and the video loaded
    router.push(`/chat?tab=youtube&videoId=${lecture.videoId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-purple-500/10 bg-white/80 backdrop-blur-md">
        <div className="container flex h-14 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Background pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      {/* Main content */}
      <main className="container flex-1 py-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : lectureData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lecture Summary */}
            <div className="md:col-span-2">
              <LectureSummary
                title={lectureData.title}
                summary={lectureData.summary}
                videoId={lectureData.videoId}
                onRegenerateSummary={handleRegenerateSummary}
                onGenerateFlashcards={handleGenerateFlashcards}
                isRegenerating={isRegenerating}
                isGeneratingFlashcards={isGeneratingFlashcards}
              />
            </div>

            {/* Recent Lectures */}
            <div>
              <RecentLectures
                onLectureSelect={handleLectureSelect}
                limit={3}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Lecture not found</p>
          </div>
        )}
      </main>
    </div>
  );
} 