import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Youtube, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/context/supabase-context";
import { getRecentLectures, getLectureById } from "@/lib/video-helpers";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  hideTitle?: boolean;
}

export function RecentLectures({ 
  onLectureSelect, 
  limit = 3, 
  className = "",
  hideTitle = false
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
      
      console.log('Lecture clicked - DETAILED DEBUG:', {
        lectureId: lecture.id,
        videoId,
        isDbLecture,
        title: getLectureTitle(lecture),
        fullLecture: lecture,
        router: !!router
      });
      
      // For database lectures, fetch the full lecture data
      if (isDbLecture) {
        console.log('Fetching full lecture data from database for lecture ID:', lecture.id);
        const fullLecture = await getLectureById(lecture.id);
        
        console.log('Full lecture data received:', fullLecture);
        
        if (fullLecture && fullLecture.content) {
          const lectureData = {
            id: fullLecture.id,
            videoId: fullLecture.content.videoId,
            title: fullLecture.title || 'Untitled Lecture',
            summary: fullLecture.content.summary,
            duration: fullLecture.content.duration || 'PT00M00S',
            transcript: fullLecture.content.transcript
          };
          
          console.log('Navigating to chat page with lecture data:', {
            id: lectureData.id,
            videoId: lectureData.videoId,
            title: lectureData.title,
            summaryLength: lectureData.summary?.length,
            transcriptLength: lectureData.transcript?.length
          });
          
          // Try to call onLectureSelect first
          try {
            console.log('Calling onLectureSelect with lecture data');
            onLectureSelect(lectureData);
            console.log('onLectureSelect called successfully');
          } catch (error) {
            console.error('Error calling onLectureSelect:', error);
          }
          
          // Then try to navigate
          try {
            console.log('Attempting to navigate to:', `/chat?tab=youtube&videoId=${lectureData.videoId}`);
            router.push(`/chat?tab=youtube&videoId=${lectureData.videoId}`);
            console.log('Navigation initiated');
          } catch (error) {
            console.error('Error during navigation:', error);
            
            // Fallback: Use window.location as a last resort
            console.log('Falling back to window.location navigation');
            window.location.href = `/chat?tab=youtube&videoId=${lectureData.videoId}`;
          }
        } else {
          console.error('Failed to load lecture details:', {
            lectureId: lecture.id,
            fullLecture
          });
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
        
        console.log('Navigating to chat page with localStorage lecture data:', {
          id: lectureData.id,
          videoId: lectureData.videoId,
          title: lectureData.title,
          summaryLength: lectureData.summary?.length,
          transcriptLength: lectureData.transcript?.length
        });
        
        // Try to call onLectureSelect first
        try {
          console.log('Calling onLectureSelect with localStorage lecture data');
          onLectureSelect(lectureData);
          console.log('onLectureSelect called successfully');
        } catch (error) {
          console.error('Error calling onLectureSelect:', error);
        }
        
        // Then try to navigate
        try {
          console.log('Attempting to navigate to:', `/chat?tab=youtube&videoId=${lectureData.videoId}`);
          router.push(`/chat?tab=youtube&videoId=${lectureData.videoId}`);
          console.log('Navigation initiated');
        } catch (error) {
          console.error('Error during navigation:', error);
          
          // Fallback: Use window.location as a last resort
          console.log('Falling back to window.location navigation');
          window.location.href = `/chat?tab=youtube&videoId=${lectureData.videoId}`;
        }
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

  // Clean title by removing quotation marks
  const cleanTitle = (title: string) => {
    return title.replace(/["']/g, '');
  };

  // Get lecture title based on whether it's from database or localStorage
  const getLectureTitle = (lecture: any) => {
    const rawTitle = lecture.title || (lecture.video_id ? `YouTube Video (${lecture.video_id})` : `YouTube Video (${lecture.videoId})`);
    return cleanTitle(rawTitle);
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

  // If there are no lectures and we're not loading, don't render anything
  if (!isLoading && recentLectures.length === 0) {
    console.log('DEBUG: No lectures to display, returning null');
    return null;
  }

  return (
    <Card className={`p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 ${className}`}>
      {!hideTitle && (
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="text-sm font-medium text-gray-600">Recent Lectures</h3>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-4 sm:py-8">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-purple-500" />
        </div>
      ) : recentLectures.length === 0 ? (
        <div className="text-center py-4 sm:py-8 text-gray-500 text-sm sm:text-base">
          No recent lectures found
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {recentLectures.map((lecture) => {
            // Determine the videoId for the lecture
            const videoId = lecture.video_id || lecture.videoId;
            const chatUrl = `/chat?tab=youtube&videoId=${videoId}`;
            
            return (
              <div key={lecture.id} className="relative">
                {/* Invisible anchor tag that covers the entire button area */}
                <a 
                  href={chatUrl}
                  className="absolute inset-0 z-10 opacity-0"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {getLectureTitle(lecture)}
                </a>
                
                <Link 
                  href={chatUrl}
                  passHref
                  legacyBehavior
                >
                  <Button
                    variant="ghost"
                    className="w-full p-2 h-auto flex items-start justify-between hover:bg-purple-500/5 transition-all group"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default button behavior
                      e.stopPropagation(); // Stop event propagation
                      console.log('Button clicked for lecture:', lecture.id);
                      handleLectureClick(lecture);
                    }}
                    type="button" // Explicitly set type to button
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="relative w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Youtube className="h-4 w-4 sm:h-6 sm:w-6 text-purple-500" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
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
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-purple-500 transition-colors mt-2" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}