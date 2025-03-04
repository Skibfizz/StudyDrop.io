import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Youtube, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/context/supabase-context";
import { getRecentLectures, getLectureById } from "@/lib/video-helpers";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface RecentLecturesProps {
  onLectureSelect: (lectureData: {
    id: string;
    videoId: string;
    title: string;
    summary: string;
    transcript: string;
    duration: string;
  }) => void;
  limit?: number;
  className?: string;
}

export function RecentLectures({ 
  onLectureSelect, 
  limit = 3, 
  className = "" 
}: RecentLecturesProps) {
  const [recentLectures, setRecentLectures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSupabase();
  const router = useRouter();

  // Function to fetch recent lectures
  const fetchRecentLectures = async () => {
    if (!user) {
      console.log('No user found, skipping lecture fetch');
      
      // Check localStorage for lectures even if no user is found
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('recentLectures');
        if (stored) {
          try {
            const lectures = JSON.parse(stored);
            console.log('Found lectures in localStorage:', lectures);
            setRecentLectures(lectures);
          } catch (e) {
            console.error('Error parsing localStorage lectures:', e);
          }
        }
      }
      
      setIsLoading(false);
      return;
    }
    
    console.log('Fetching recent lectures for user:', user.id);
    setIsLoading(true);
    try {
      // Fetch recent lectures with the specified limit
      const lectures = await getRecentLectures(user.id, limit);
      console.log('Fetched lectures:', lectures, 'Length:', lectures.length);
      
      // Force a re-render by creating a new array
      setRecentLectures([...lectures]);
    } catch (error) {
      console.error('Error fetching recent lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load recent lectures",
        variant: "error"
      });
      
      // Check localStorage as fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('recentLectures');
        if (stored) {
          try {
            const lectures = JSON.parse(stored);
            console.log('Found lectures in localStorage as fallback:', lectures);
            setRecentLectures(lectures);
          } catch (e) {
            console.error('Error parsing localStorage lectures:', e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent lectures on component mount or when user changes
  useEffect(() => {
    fetchRecentLectures();
  }, [user]);

  // Handle lecture click
  const handleLectureClick = async (lecture: any) => {
    try {
      // Check if this is a database lecture or localStorage lecture
      const isDbLecture = lecture.video_id !== undefined;
      const videoId = isDbLecture ? lecture.video_id : lecture.videoId;
      
      // For database lectures, fetch the full lecture data
      if (isDbLecture) {
        const fullLecture = await getLectureById(lecture.id);
        
        if (fullLecture && fullLecture.content) {
          const lectureData = {
            id: fullLecture.id,
            videoId: fullLecture.content.videoId,
            title: fullLecture.title || 'Untitled Lecture',
            summary: fullLecture.content.summary,
            duration: fullLecture.content.duration || 'PT00M00S',
            transcript: fullLecture.content.transcript
          };
          
          // Navigate directly to the chat page
          router.push(`/chat?tab=youtube&videoId=${lectureData.videoId}`);
          
          // Still call onLectureSelect to update any parent component state if needed
          onLectureSelect(lectureData);
        } else {
          toast({
            title: "Error",
            description: "Failed to load lecture details. The lecture data may be incomplete.",
            variant: "error"
          });
        }
      } else {
        // For localStorage lectures, use the data directly
        const lectureData = {
          id: lecture.id,
          videoId: lecture.videoId,
          title: lecture.title,
          summary: lecture.summary,
          duration: lecture.duration,
          transcript: lecture.transcript
        };
        
        // Navigate directly to the chat page
        router.push(`/chat?tab=youtube&videoId=${lectureData.videoId}`);
        
        // Still call onLectureSelect to update any parent component state if needed
        onLectureSelect(lectureData);
      }
    } catch (error) {
      console.error('Error loading lecture:', error);
      toast({
        title: "Error",
        description: "Failed to load lecture details",
        variant: "error"
      });
    }
  };

  // Format duration from ISO format to readable format
  const formatDuration = (isoDuration: string) => {
    try {
      // Handle simple duration format like "PT1H30M15S"
      const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!matches) return "00:00";
      
      const hours = matches[1] ? parseInt(matches[1]) : 0;
      const minutes = matches[2] ? parseInt(matches[2]) : 0;
      const seconds = matches[3] ? parseInt(matches[3]) : 0;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (e) {
      return "00:00";
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Get lecture title based on whether it's from database or localStorage
  const getLectureTitle = (lecture: any) => {
    return lecture.title || (lecture.video_id ? `YouTube Video (${lecture.video_id})` : `YouTube Video (${lecture.videoId})`);
  };
  
  // Get lecture date based on whether it's from database or localStorage
  const getLectureDate = (lecture: any) => {
    return lecture.created_at || lecture.timestamp || new Date().toISOString();
  };
  
  // Get lecture duration based on whether it's from database or localStorage
  const getLectureDuration = (lecture: any) => {
    if (lecture.duration) {
      return lecture.duration;
    } else {
      return 'PT00M00S';
    }
  };

  return (
    <Card className={`p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">Recent Lectures</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      ) : recentLectures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent lectures found
        </div>
      ) : (
        <div className="space-y-3">
          {recentLectures.map((lecture) => (
            <Button
              key={lecture.id}
              variant="ghost"
              className="w-full p-2 h-auto flex items-start justify-between hover:bg-purple-500/5 transition-all group"
              onClick={() => handleLectureClick(lecture)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Youtube className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {getLectureTitle(lecture)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(getLectureDate(lecture))}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDuration(getLectureDuration(lecture))}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors mt-2" />
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}