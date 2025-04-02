"use client";

import { useState, useRef, useEffect, useCallback, useMemo, createElement } from "react";
import { Card } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Youtube,
  Brain,
  GraduationCap,
  Loader2,
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  Sliders,
  Copy,
  Pencil,
  Lightbulb,
  Scale,
  ChevronDown,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { SharedHeader } from "@/components/shared-header";
import { toast } from "@/components/ui/use-toast";
import { RecentLectures } from "@/components/recent-lectures";
import { useUsage } from "@/lib/hooks/use-usage";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isCorrect?: boolean;
  userAnswer?: string;
}

interface StoredLecture {
  id: string;
  videoId: string;
  title: string;
  timestamp: Date;
  duration: string;
  summary: string;
  transcript: string;
  expiresAt: Date;
}

interface FlashcardDeck {
  id: string;
  title: string;
  videoId: string;
  timestamp: Date;
  cards: Flashcard[];
  progress: number;
  expiresAt: Date;
}

type WritingStyle = 'casual' | 'professional' | 'academic' | 'creative' | 'balanced';

const STYLE_OPTIONS = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly and conversational',
    icon: Pencil
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear and polished',
    icon: Brain
  },
  {
    value: 'academic',
    label: 'Academic',
    description: 'Scholarly and precise',
    icon: GraduationCap
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Engaging and imaginative',
    icon: Lightbulb
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Natural mix of styles',
    icon: Scale
  }
];

// TypewriterText component for animating text
interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText = ({ text, speed = 10, onComplete }: TypewriterTextProps) => {
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

// TypewriterMarkdown component for animating markdown content
const TypewriterMarkdown = ({ 
  text, 
  speed = 3.75,
  onComplete 
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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

  // Use the same markdown components as the main component
  return (
    <div className="relative" ref={textRef}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => (
            <h1 className="text-2xl font-bold mb-6 text-gray-900 pb-2 border-b border-purple-200 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-4 rounded-lg" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-xl font-semibold mb-4 text-gray-800 mt-8 flex items-center space-x-2 bg-gradient-to-r from-purple-500/5 to-transparent p-2 rounded-lg" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-lg font-medium mb-3 text-gray-700 mt-6 border-l-4 border-purple-400 pl-3" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="mb-4 text-gray-600 leading-relaxed hover:text-gray-900 transition-colors duration-200" {...props} />
          ),
          ul: ({node, ...props}) => (
            <ul className="mb-6 space-y-3 ml-2" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="mb-6 space-y-3 ml-2 list-decimal" {...props} />
          ),
          li: ({node, children, ...props}) => (
            <li className="flex items-start space-x-2 group" {...props}>
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 my-6 italic text-gray-700 bg-gradient-to-r from-purple-500/5 to-transparent py-3 rounded-r-lg" {...props} />
          ),
          strong: ({node, ...props}) => (
            <strong className="font-semibold text-purple-700 bg-purple-500/10 px-1 rounded" {...props} />
          ),
          em: ({node, ...props}) => (
            <em className="text-blue-600 not-italic bg-blue-500/10 px-1 rounded" {...props} />
          ),
          code: ({node, ...props}) => (
            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
          ),
          a: ({node, ...props}) => (
            <a className="text-purple-600 hover:text-purple-700 underline decoration-purple-500/30 hover:decoration-purple-500 transition-colors duration-200" {...props} />
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {!isComplete && (
        <span 
          ref={cursorRef}
          className="inline-block animate-pulse text-purple-500"
          style={{ marginLeft: '1px' }}
        >
          |
        </span>
      )}
    </div>
  );
};

export default function ChatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('balanced');
  const [videoSummary, setVideoSummary] = useState('');
  const [videoTranscript, setVideoTranscript] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [processingOption, setProcessingOption] = useState<'flashcards' | 'summary'>('summary');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<boolean>(false);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [recentLectures, setRecentLectures] = useState<StoredLecture[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [isGeneratingDeckTitle, setIsGeneratingDeckTitle] = useState(false);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const { checkAndIncrementUsage, usageData } = useUsage();
  const [shouldAnimateSummary, setShouldAnimateSummary] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  // Check if user has any video summaries
  const hasVideoSummaries = (usageData?.usage?.video_summaries || 0) > 0;

  useEffect(() => {
    // Get the tab and videoId from URL on initial load
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    const videoIdParam = searchParams.get('videoId');
    
    console.log('URL parameters detected:', {
      tab: tabParam,
      videoId: videoIdParam
    });
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    // If videoId is provided in the URL, load the video data
    if (videoIdParam) {
      console.log(`Loading video data for videoId: ${videoIdParam}`);
      setVideoId(videoIdParam);
      
      // Find the lecture in recent lectures if it exists
      const storedLectures = localStorage.getItem('recentLectures');
      if (storedLectures) {
        const lectures: StoredLecture[] = JSON.parse(storedLectures);
        console.log(`Found ${lectures.length} lectures in localStorage`);
        
        const matchingLecture = lectures.find(lecture => lecture.videoId === videoIdParam);
        
        if (matchingLecture) {
          console.log(`Found matching lecture in localStorage:`, {
            id: matchingLecture.id,
            videoId: matchingLecture.videoId,
            title: matchingLecture.title
          });
          
          // Load the lecture data from localStorage
          setSummary(matchingLecture.summary);
          setVideoTranscript(matchingLecture.transcript);
        } else {
          console.log(`No matching lecture found in localStorage, fetching from API`);
          // If not found in localStorage, fetch from API
          fetchVideoData(videoIdParam);
        }
      } else {
        console.log(`No lectures found in localStorage, fetching from API`);
        // If no stored lectures, fetch from API
        fetchVideoData(videoIdParam);
      }
    }
  }, []);

  // Function to fetch video data by videoId
  const fetchVideoData = async (videoId: string) => {
    setIsProcessing(true);
    setError(null);
    
    console.log(`Fetching video data for videoId: ${videoId}`);
    
    try {
      const response = await fetch('/api/youtube/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error fetching video data: ${data.error || 'Unknown error'}`);
        throw new Error(data.error || 'Failed to fetch video data');
      }
      
      console.log(`Successfully fetched video data:`, {
        videoId: data.videoId,
        title: data.title,
        summaryLength: data.summary?.length || 0,
        transcriptLength: data.transcript?.length || 0
      });
      
      // Remove any "Potential Quiz Questions" section from the summary
      let cleanedSummary = data.summary;
      if (cleanedSummary) {
        // Remove the section and everything after it
        const quizSectionIndex = cleanedSummary.indexOf("## Potential Quiz Questions");
        if (quizSectionIndex !== -1) {
          cleanedSummary = cleanedSummary.substring(0, quizSectionIndex).trim();
        }
      }
      
      setSummary(cleanedSummary);
      setVideoTranscript(data.transcript);
      // Don't animate when fetching existing video data
      setShouldAnimateSummary(false);
      setIsTypingComplete(true);
    } catch (error) {
      console.error('Error fetching video data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch video data');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load recent lectures from localStorage on mount
  useEffect(() => {
    const loadRecentLectures = () => {
      const stored = localStorage.getItem('recentLectures');
      if (stored) {
        const lectures: StoredLecture[] = JSON.parse(stored);
        // Filter out expired lectures (older than 7 days)
        const now = new Date();
        const validLectures = lectures.filter(lecture => {
          const expirationDate = new Date(lecture.expiresAt);
          return expirationDate > now;
        });
        setRecentLectures(validLectures);
        // Save filtered lectures back to localStorage
        if (validLectures.length !== lectures.length) {
          localStorage.setItem('recentLectures', JSON.stringify(validLectures));
        }
      }
    };

    const loadFlashcardDecks = () => {
      const stored = localStorage.getItem('flashcardDecks');
      if (stored) {
        const decks: FlashcardDeck[] = JSON.parse(stored);
        // Filter out expired decks (older than 30 days)
        const now = new Date();
        const validDecks = decks.filter(deck => {
          const expirationDate = new Date(deck.expiresAt);
          return expirationDate > now;
        });
        setFlashcardDecks(validDecks);
        // Save filtered decks back to localStorage
        if (validDecks.length !== decks.length) {
          localStorage.setItem('flashcardDecks', JSON.stringify(validDecks));
        }
        console.log('Loaded flashcard decks from localStorage:', validDecks);
      } else {
        console.log('No flashcard decks found in localStorage');
      }
    };

    loadRecentLectures();
    loadFlashcardDecks();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/chat?tab=${value}`, { scroll: false });
  };

  // Function to generate a descriptive title for the lecture using OpenAI
  const generateDescriptiveTitle = async (transcript: string, originalTitle: string) => {
    try {
      console.log(`[CLIENT] Generating descriptive title for video with original title: "${originalTitle}"`);
      
      // Make a request to our API endpoint for title generation
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript: transcript.substring(0, 1000), // Only send first 1000 chars
          originalTitle 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate title');
      }
      
      console.log(`[CLIENT] Generated descriptive title: "${data.title}"`);
      return data.title;
    } catch (error) {
      console.error('[CLIENT] Error generating descriptive title:', error);
      return originalTitle; // Fallback to original title if generation fails
    }
  };

  // Function to clean title by removing quotation marks
  const cleanTitle = (title: string) => {
    return title.replace(/[^\w\s-]/g, '').trim();
  };

  const generateFlashcardDeckTitle = async (flashcards: Flashcard[]) => {
    setIsGeneratingDeckTitle(true);
    try {
      // Extract questions for title generation
      const questions = flashcards.map(card => card.question).join('\n');
      
      // Send questions to OpenAI API to generate a title
      const response = await fetch('/api/generate-deck-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to generate deck title:', data.error);
        return 'Untitled Deck'; // Fallback title
      }

      return data.title || 'Untitled Deck';
    } catch (error) {
      console.error('Error generating deck title:', error);
      return 'Untitled Deck'; // Fallback title
    } finally {
      setIsGeneratingDeckTitle(false);
    }
  };

  // Add handler for loading previous lecture
  const handleLoadPreviousLecture = (lecture: StoredLecture) => {
    setVideoId(lecture.videoId);
    setSummary(lecture.summary);
    setVideoTranscript(lecture.transcript);
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Initial request to start processing
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: youtubeUrl,
          excludeQuizQuestions: true
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      // Check if the response indicates processing is still ongoing
      if (data.status === 'processing') {
        setVideoId(data.videoId);
        setSummary("Your video is being processed. This may take a minute...");
        
        // Start polling for status updates
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/youtube/status?videoId=${data.videoId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const statusData = await statusResponse.json();
            
            // If processing is complete, update the UI and stop polling
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              
              // Remove any "Potential Quiz Questions" section from the summary
              let cleanedSummary = statusData.summary;
              if (cleanedSummary) {
                // Remove the section and everything after it
                const quizSectionIndex = cleanedSummary.indexOf("## Potential Quiz Questions");
                if (quizSectionIndex !== -1) {
                  cleanedSummary = cleanedSummary.substring(0, quizSectionIndex).trim();
                }
              }
              
              setSummary(cleanedSummary);
              setVideoTranscript(statusData.transcript);
              // Enable animation for newly generated summary
              setShouldAnimateSummary(true);
              setIsTypingComplete(false);

              // The title should already be a descriptive title generated by the API
              // Clean the title to remove any quotation marks
              const videoTitle = cleanTitle(statusData.title || `YouTube Video (${statusData.videoId})`);

              // Create new lecture entry with the descriptive title from the API
              const newLecture: StoredLecture = {
                id: Date.now().toString(),
                videoId: statusData.videoId,
                title: videoTitle,
                timestamp: new Date(),
                duration: statusData.duration || 'PT00M00S',
                summary: cleanedSummary,
                transcript: statusData.transcript,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
              };

              console.log('Saving new lecture to localStorage:', newLecture);

              // Update recent lectures (keep only last 3)
              const updatedLectures = [newLecture, ...recentLectures].slice(0, 3);
              setRecentLectures(updatedLectures);
              localStorage.setItem('recentLectures', JSON.stringify(updatedLectures));

              setIsProcessing(false);
            } else if (statusData.status === 'error') {
              clearInterval(pollInterval);
              throw new Error(statusData.message || 'Error processing video');
            }
            // If still processing, continue polling
          } catch (pollError) {
            clearInterval(pollInterval);
            console.error('Error polling for video status:', pollError);
            setError(pollError instanceof Error ? pollError.message : 'Failed to check video processing status');
            setIsProcessing(false);
          }
        }, 5000); // Poll every 5 seconds
        
        // Set a timeout to stop polling after 5 minutes (to prevent infinite polling)
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isProcessing) {
            setError('Video processing is taking longer than expected. Please try again later.');
            setIsProcessing(false);
          }
        }, 5 * 60 * 1000);
        
        return;
      }

      // If we get here, the video was processed immediately (likely from cache)
      setVideoId(data.videoId);
      
      // Remove any "Potential Quiz Questions" section from the summary
      let cleanedSummary = data.summary;
      if (cleanedSummary) {
        // Remove the section and everything after it
        const quizSectionIndex = cleanedSummary.indexOf("## Potential Quiz Questions");
        if (quizSectionIndex !== -1) {
          cleanedSummary = cleanedSummary.substring(0, quizSectionIndex).trim();
        }
      }
      
      setSummary(cleanedSummary);
      setVideoTranscript(data.transcript);
      // Enable animation for newly generated summary
      setShouldAnimateSummary(true);
      setIsTypingComplete(false);

      // The title should already be a descriptive title generated by the API
      // Clean the title to remove any quotation marks
      const videoTitle = cleanTitle(data.title || `YouTube Video (${data.videoId})`);

      // Create new lecture entry with the descriptive title from the API
      const newLecture: StoredLecture = {
        id: Date.now().toString(),
        videoId: data.videoId,
        title: videoTitle,
        timestamp: new Date(),
        duration: data.duration || 'PT00M00S',
        summary: cleanedSummary,
        transcript: data.transcript,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

      console.log('Saving new lecture to localStorage:', newLecture);

      // Update recent lectures (keep only last 3)
      const updatedLectures = [newLecture, ...recentLectures].slice(0, 3);
      setRecentLectures(updatedLectures);
      localStorage.setItem('recentLectures', JSON.stringify(updatedLectures));

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing video:', error);
      setError(error instanceof Error ? error.message : 'Failed to process video');
      setIsProcessing(false);
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: inputText,
          style: selectedStyle
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          // Usage limit reached
          toast({
            title: "Usage Limit Reached",
            description: "You've reached your text humanizations limit. Please upgrade your plan for more access.",
            variant: "error"
          });
        } else {
          toast({
            title: "Error",
            description: data.error || 'Failed to process text',
            variant: "error"
          });
        }
        throw new Error(data.error || 'Failed to process text');
      }

      setOutputText(data.improvedText);
      
      toast({
        title: "Success",
        description: "Text humanized successfully",
        variant: "success"
      });
    } catch (error) {
      console.error('Error:', error);
      // Error toast is already shown above for specific errors
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      // You might want to show a success toast here
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!videoTranscript) {
      console.error('No transcript available');
      toast({
        title: "Error",
        description: "No transcript available to generate flashcards",
        variant: "error"
      });
      return;
    }
    
    console.log('Starting flashcard generation process');
    console.log('Current video data:', { 
      videoId, 
      hasTranscript: !!videoTranscript,
      transcriptLength: videoTranscript?.length
    });
    
    setIsGeneratingFlashcards(true);
    try {
      // Send transcript to OpenAI API directly
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: videoTranscript }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'Usage limit reached') {
          toast({
            title: "Usage Limit Reached",
            description: data.message || "You've reached your flashcard sets limit. Please upgrade your plan for more access.",
            variant: "error"
          });
        } else {
          toast({
            title: "Error",
            description: data.error || 'Failed to generate flashcards',
            variant: "error"
          });
        }
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      console.log('Flashcards generated successfully:', { 
        count: data.flashcards.length,
        sampleCard: data.flashcards[0]
      });
      
      // Reset current card index and flip state
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      
      // Set the flashcards with proper typing and IDs
      const generatedFlashcards = data.flashcards.map((card: any, index: number) => ({
        id: `card-${index}`,
        question: card.question,
        answer: card.answer,
        isCorrect: undefined
      }));
      
      setFlashcards(generatedFlashcards);
      
      // Generate a title for the flashcard deck
      const deckTitle = await generateFlashcardDeckTitle(generatedFlashcards);
      console.log('Generated deck title:', deckTitle);
      
      // Create a new flashcard deck
      const newDeckId = `deck-${Date.now()}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // Expire after 30 days
      
      const newDeck: FlashcardDeck = {
        id: newDeckId,
        title: deckTitle,
        videoId: videoId || 'unknown',
        timestamp: new Date(),
        cards: generatedFlashcards,
        progress: 0,
        expiresAt: expirationDate
      };
      
      // Update state with the new deck
      setCurrentDeckId(newDeckId);
      setFlashcardDecks(prevDecks => {
        // Keep only the 5 most recent decks
        const updatedDecks = [newDeck, ...prevDecks].slice(0, 5);
        // Save to localStorage
        localStorage.setItem('flashcardDecks', JSON.stringify(updatedDecks));
        return updatedDecks;
      });
      
      console.log('Flashcard deck saved:', newDeck);

      // Navigate to flashcards tab after a short delay to ensure state is updated
      setTimeout(() => {
        handleTabChange('flashcards');
      }, 100);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // Error toast is already shown above
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Handle lecture selection
  const handleLectureSelect = (lecture: any) => {
    console.log('Lecture selected:', lecture);
    
    // Set the video ID to trigger the video display
    setVideoId(lecture.videoId);
    
    // Set the summary and transcript
    setSummary(lecture.summary);
    setVideoTranscript(lecture.transcript);
    
    // Don't animate when selecting an existing lecture
    setShouldAnimateSummary(false);
    setIsTypingComplete(true);
    
    // Set the active tab to YouTube
    setActiveTab('youtube');
    
    // Update the URL
    router.push(`/chat?tab=youtube&videoId=${lecture.videoId}`);
  };

  // Handle flashcard deck selection
  const handleDeckSelect = (deckId: string) => {
    const selectedDeck = flashcardDecks.find(deck => deck.id === deckId);
    if (selectedDeck) {
      console.log('Loading flashcard deck:', selectedDeck);
      
      // Update state with the selected deck
      setFlashcards(selectedDeck.cards);
      setCurrentDeckId(selectedDeck.id);
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      
      // Update progress if needed
      if (selectedDeck.progress > 0) {
        // Optionally, you could restore the progress by setting currentCardIndex
        // to the last viewed card
      }
      
      // Navigate to flashcards tab
      handleTabChange('flashcards');
    }
  };

  const updateDeckProgress = (deckId: string, updatedFlashcards: Flashcard[]) => {
    const deckToUpdate = flashcardDecks.find(deck => deck.id === deckId);
    if (deckToUpdate) {
      const correctCards = updatedFlashcards.filter(card => card.isCorrect === true).length;
      const totalCards = updatedFlashcards.length;
      const newProgress = Math.round((correctCards / totalCards) * 100);
      
      const updatedDeck = {
        ...deckToUpdate,
        cards: updatedFlashcards,
        progress: newProgress
      };
      
      setFlashcardDecks(prevDecks => {
        const updatedDecks = prevDecks.map(deck =>
          deck.id === deckId ? updatedDeck : deck
        );
        localStorage.setItem('flashcardDecks', JSON.stringify(updatedDecks));
        return updatedDecks;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SharedHeader />
      
      {/* Updated background pattern */}
      <div className="fixed inset-0 -z-10 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />
      
      {/* Tabs Navigation */}
      <div className="w-full bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border-b border-purple-500/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center">
              <TabsList className="bg-white/80 border border-purple-500/20 p-1.5 h-14 rounded-full shadow-sm backdrop-blur-sm w-full max-w-[95vw] sm:max-w-none overflow-x-auto flex-nowrap">
                <TabsTrigger 
                  value="youtube" 
                  className={`relative px-3 sm:px-6 md:px-8 rounded-full transition-all duration-300 flex items-center whitespace-nowrap ${
                    activeTab === 'youtube'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'youtube' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-1 sm:mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill={activeTab === 'youtube' ? 'white' : 'currentColor'}/>
                      <path d="M9.75 15.02V8.48l5.75 3.27-5.75 3.27z" fill={activeTab === 'youtube' ? '#ef4444' : 'white'}/>
                    </svg>
                    <span className="relative text-base">YouTube Learning</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="flashcards" 
                  className={`relative px-3 sm:px-6 md:px-8 rounded-full transition-all duration-300 flex items-center whitespace-nowrap ${
                    activeTab === 'flashcards'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'flashcards' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Brain className="w-5 h-5 mr-1 sm:mr-2" />
                    <span className="text-base">Flashcards</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="humanizer" 
                  className={`relative px-3 sm:px-6 md:px-8 rounded-full transition-all duration-300 flex items-center whitespace-nowrap ${
                    activeTab === 'humanizer'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'humanizer' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Sparkles className="w-5 h-5 mr-1 sm:mr-2" />
                    <span className="text-base">Humanizer</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-4 min-h-[calc(100vh-14rem)]">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
          {/* YouTube Learning Tab */}
          <TabsContent value="youtube" className="m-0">
            <div className="max-w-7xl mx-auto p-6 sm:p-4 youtube-mobile-container">
              <div className={`${videoId ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1'} gap-4 md:gap-8 transition-all duration-500`}>
                {!videoId ? (
                  <div className="space-y-6 col-span-1 md:col-span-2">
                    <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-purple-500/20 shadow-lg shadow-purple-500/5 rounded-xl">
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg mr-3">
                          <Youtube className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Process YouTube Lecture</h2>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1.5 block">YouTube URL</Label>
                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-1.5">
                            <Input
                              placeholder="Paste YouTube URL here..."
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-300 rounded-lg py-2.5 px-4 transition-all duration-200"
                            />
                            <Button
                              onClick={handleYoutubeSubmit}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 w-full sm:w-auto rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Youtube className="h-4 w-4" />
                              )}
                              <span className="ml-2 font-medium">Process</span>
                            </Button>
                          </div>
                          {error && (
                            <p className="text-sm text-red-500 mt-2">{error}</p>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-purple-500/20 shadow-lg shadow-purple-500/5 rounded-xl">
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg mr-3">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Recent Lectures</h2>
                      </div>
                      {hasVideoSummaries ? (
                        <RecentLectures 
                          onLectureSelect={handleLectureSelect}
                          limit={3}
                          className="p-0 bg-transparent border-none shadow-none"
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100">
                          <GraduationCap className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                          <p>No lectures yet. Process your first video to see it here.</p>
                        </div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Video Section */}
                    <div className="space-y-4 order-1">
                      <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                        <h2 className="text-xl font-semibold mb-4">Lecture Video</h2>
                        <div className="aspect-video bg-gray-100 rounded-lg mb-4 sm:mb-6 youtube-video-container">
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

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                          <Button 
                            variant="outline"
                            className="w-full py-2 sm:py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
                            onClick={handleGenerateFlashcards}
                            disabled={isGeneratingFlashcards}
                          >
                            {isGeneratingFlashcards ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-2 text-purple-500" />
                                <span>Generate Flashcards</span>
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full py-2 sm:py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
                            onClick={handleYoutubeSubmit}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>Regenerating...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="h-4 w-4 mr-2 text-purple-500" />
                                <span>Regenerate Summary</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Recent Lectures Section - Mobile Only */}
                        <div className="border-t border-purple-500/10 pt-4 md:hidden">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Recent Lectures</h3>
                          </div>
                          {hasVideoSummaries ? (
                            <div className="overflow-x-auto pb-2 youtube-recent-lectures-mobile">
                              <div className="flex space-x-4">
                                <RecentLectures 
                                  onLectureSelect={handleLectureSelect}
                                  limit={3}
                                  className="p-0 bg-transparent border-none shadow-none min-w-[300px]"
                                  hideTitle={true}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No lectures yet. Process your first video to see it here.
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-4 order-2">
                      <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold">Lecture Summary</h2>
                          <div className="flex items-center space-x-2">
                            {isProcessing && (
                              <div className="flex items-center text-sm text-purple-500">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </div>
                            )}
                            {summary && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm border-purple-500/20 hover:bg-purple-500/5"
                                onClick={() => {
                                  navigator.clipboard.writeText(summary);
                                  // You might want to add a toast notification here
                                }}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                <span className="hidden sm:inline">Copy Summary</span>
                                <span className="sm:hidden">Copy</span>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none youtube-summary-container">
                          {shouldAnimateSummary && !isTypingComplete ? (
                            <TypewriterMarkdown 
                              text={summary || 'Generating summary...'} 
                              speed={3.75} 
                              onComplete={() => setIsTypingComplete(true)} 
                            />
                          ) : (
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => (
                                  <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 pb-2 border-b border-purple-200 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-2 sm:p-4 rounded-lg" {...props} />
                                ),
                                h2: ({node, ...props}) => (
                                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 mt-6 sm:mt-8 flex items-center space-x-2 bg-gradient-to-r from-purple-500/5 to-transparent p-2 rounded-lg" {...props} />
                              ),
                              h3: ({node, ...props}) => (
                                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3 text-gray-700 mt-4 sm:mt-6 border-l-4 border-purple-400 pl-3" {...props} />
                              ),
                              p: ({node, ...props}) => (
                                <p className="mb-3 sm:mb-4 text-gray-600 leading-relaxed hover:text-gray-900 transition-colors duration-200" {...props} />
                              ),
                              ul: ({node, ...props}) => (
                                <ul className="mb-4 sm:mb-6 space-y-2 sm:space-y-3 ml-2" {...props} />
                              ),
                              ol: ({node, ...props}) => (
                                <ol className="mb-4 sm:mb-6 space-y-2 sm:space-y-3 ml-2 list-decimal" {...props} />
                              ),
                              li: ({node, children, ...props}) => (
                                <li className="flex items-start space-x-2 group" {...props}>
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                  <span className="flex-1">{children}</span>
                                </li>
                              ),
                              blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-purple-500 pl-4 my-4 sm:my-6 italic text-gray-700 bg-gradient-to-r from-purple-500/5 to-transparent py-2 sm:py-3 rounded-r-lg" {...props} />
                              ),
                              strong: ({node, ...props}) => (
                                <strong className="font-semibold text-purple-700 bg-purple-500/10 px-1 rounded" {...props} />
                              ),
                              em: ({node, ...props}) => (
                                <em className="text-blue-600 not-italic bg-blue-500/10 px-1 rounded" {...props} />
                              ),
                              code: ({node, ...props}) => (
                                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                              ),
                              a: ({node, ...props}) => (
                                <a className="text-purple-600 hover:text-purple-700 underline decoration-purple-500/30 hover:decoration-purple-500 transition-colors duration-200" {...props} />
                              ),
                            }}
                            >
                              {summary || 'Generating summary...'}
                            </ReactMarkdown>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Recent Lectures Section - Desktop Only */}
                    <div className="hidden md:block space-y-4 order-3 md:col-span-2">
                      <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                        <h2 className="text-xl font-semibold mb-4">Recent Lectures</h2>
                        {hasVideoSummaries ? (
                          <RecentLectures 
                            onLectureSelect={handleLectureSelect}
                            limit={3}
                            className="p-0 bg-transparent border-none shadow-none"
                            hideTitle={true}
                          />
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No lectures yet. Process your first video to see it here.
                          </div>
                        )}
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="m-0">
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flashcard Display */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white/90 backdrop-blur-sm border border-purple-500/20 shadow-lg rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        Current Deck
                      </h2>
                      <Button
                        variant="outline"
                        className="space-x-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 transition-all"
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Flip Card</span>
                      </Button>
                    </div>

                    {flashcards.length > 0 ? (
                      <>
                        <div className="relative h-[400px] perspective-1000 mx-auto max-w-2xl">
                          <div
                            className={`absolute inset-0 transition-transform duration-700 transform-style-3d ${
                              isCardFlipped ? 'rotate-y-180' : ''
                            }`}
                          >
                            {/* Front of Card */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] rounded-xl shadow-md border border-purple-100 p-8 flex items-center justify-center text-center">
                              <div className={`w-full transition-opacity duration-200 ${isCardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                                <p className="text-xl text-gray-800 font-medium">{flashcards[currentCardIndex]?.question || 'No question available'}</p>
                              </div>
                            </div>
                            {/* Back of Card */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15] rounded-xl shadow-md border border-purple-200 p-8 flex items-center justify-center text-center">
                              <div className={`w-full transition-opacity duration-200 ${!isCardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                                <p className="text-xl text-gray-800 font-medium">{flashcards[currentCardIndex]?.answer || 'No answer available'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between mt-8 max-w-2xl mx-auto">
                          <Button 
                            variant="outline" 
                            className="space-x-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 transition-all"
                            onClick={() => {
                              if (currentCardIndex > 0) {
                                setCurrentCardIndex(currentCardIndex - 1);
                                setIsCardFlipped(false);
                              }
                            }}
                            disabled={currentCardIndex === 0}
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>Previous</span>
                          </Button>
                          <div className="flex items-center space-x-4">
                            <Button variant="outline" className="space-x-2 bg-red-50 border-red-200 text-red-600 transition-all"
                              onClick={() => {
                                const updatedFlashcards = [...flashcards];
                                updatedFlashcards[currentCardIndex] = {
                                  ...updatedFlashcards[currentCardIndex],
                                  isCorrect: false
                                };
                                setFlashcards(updatedFlashcards);
                                
                                // Update deck progress if we have a current deck
                                if (currentDeckId) {
                                  updateDeckProgress(currentDeckId, updatedFlashcards);
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>Incorrect</span>
                            </Button>
                            <Button variant="outline" className="space-x-2 bg-green-50 border-green-200 text-green-600 transition-all"
                              onClick={() => {
                                const updatedFlashcards = [...flashcards];
                                updatedFlashcards[currentCardIndex] = {
                                  ...updatedFlashcards[currentCardIndex],
                                  isCorrect: true
                                };
                                setFlashcards(updatedFlashcards);
                                
                                // Update deck progress if we have a current deck
                                if (currentDeckId) {
                                  updateDeckProgress(currentDeckId, updatedFlashcards);
                                }
                              }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Correct</span>
                            </Button>
                          </div>
                          <Button 
                            variant="outline" 
                            className="space-x-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 transition-all"
                            onClick={() => {
                              if (currentCardIndex < flashcards.length - 1) {
                                setCurrentCardIndex(currentCardIndex + 1);
                                setIsCardFlipped(false);
                              }
                            }}
                            disabled={currentCardIndex === flashcards.length - 1}
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                        <div className="space-y-4 max-w-md mx-auto p-8">
                          <div className="p-4 rounded-full bg-purple-500/10 mx-auto w-fit">
                            <Brain className="h-8 w-8 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">No Flashcards Available</p>
                            <p className="text-sm text-gray-500 mt-1">Generate flashcards from a YouTube video to start studying</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="mt-4 bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                            onClick={() => handleTabChange('youtube')}
                          >
                            <Youtube className="h-4 w-4 mr-2" />
                            Process YouTube Video
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 bg-white/90 backdrop-blur-sm border border-purple-500/20 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                      Study Progress
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cards Reviewed</span>
                        <span className="font-medium">{currentCardIndex + 1}/{flashcards.length}</span>
                      </div>
                      <Progress 
                        value={flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0} 
                        className="h-2 bg-purple-100" 
                      />
                      <div className="grid grid-cols-3 gap-4 text-center mt-4">
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                          <div className="text-lg font-semibold text-green-600">
                            {flashcards.filter(card => card.isCorrect === true).length}
                          </div>
                          <div className="text-xs text-gray-600">Correct</div>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                          <div className="text-lg font-semibold text-yellow-600">
                            {flashcards.filter(card => card.isCorrect === undefined).length}
                          </div>
                          <div className="text-xs text-gray-600">Review</div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                          <div className="text-lg font-semibold text-red-600">
                            {flashcards.filter(card => card.isCorrect === false).length}
                          </div>
                          <div className="text-xs text-gray-600">Incorrect</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Deck Management */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white/90 backdrop-blur-sm border border-purple-500/20 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
                      Your Decks
                    </h2>
                    {/* Debug logging */}
                    <div className="space-y-2">
                      {(() => {
                        console.log('Rendering Your Decks section with actual data:', flashcardDecks);
                        return null;
                      })()}
                      
                      {flashcardDecks.length > 0 ? (
                        flashcardDecks.map((deck) => (
                          <Button
                            key={deck.id}
                            variant="ghost"
                            className="w-full justify-between p-4 hover:bg-purple-500/5 rounded-lg transition-all"
                            onClick={() => handleDeckSelect(deck.id)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 rounded-full bg-purple-100">
                                <Brain className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-800">{deck.title}</div>
                                <div className="text-sm text-gray-600">{deck.cards.length} cards</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="w-24 h-2 bg-purple-100 rounded-full">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                  style={{ width: `${deck.progress}%` }}
                                />
                              </div>
                              <ChevronRight className="h-4 w-4 text-purple-500" />
                            </div>
                          </Button>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <div className="p-3 rounded-full bg-purple-100 mx-auto w-fit mb-3">
                            <Brain className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-gray-600 mb-2">No flashcard decks yet</p>
                          <p className="text-sm text-gray-500 mb-4">Your flashcard decks will appear here once created</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Humanizer Tab */}
          <TabsContent value="humanizer" className="m-0">
            <div className="container mx-auto px-3 sm:px-4 md:px-6">
              {/* Enhanced Header Section */}
              <div className="text-center mb-4 md:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5" />
                <div className="relative py-4 md:py-8">
                  <div className="inline-flex items-center space-x-2 bg-white/50 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4 border border-purple-500/20">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                    <span className="text-xs md:text-sm text-gray-600">AI-Powered Text Enhancement</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Text Humanizer</h1>
                  <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4 md:px-6 pb-2 md:pb-4 leading-relaxed">
                    Input any AI-Generated text and instantly make it undetectable to any ai detector
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Enhanced Input Section */}
                <div className="flex flex-col">
                  <Card className="flex-1 p-4 md:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.05]" />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4 space-y-2 sm:space-y-0">
                        <div className="space-y-1">
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Input Text</h2>
                          <p className="text-xs md:text-sm text-gray-500">Enter or paste your text below</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs md:text-sm text-gray-500 border-purple-500/20 hover:bg-purple-500/5"
                            onClick={() => setInputText("")}
                          >
                            <RefreshCcw className="h-3 w-3 mr-1 md:mr-2" />
                            Clear
                          </Button>
                        </div>
                      </div>
                      
                      <div className="min-h-[250px] md:min-h-[400px] bg-white/80 rounded-xl p-3 md:p-6 border border-purple-500/20 relative">
                        <Textarea
                          placeholder="Enter your text here..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[220px] md:min-h-[370px] w-full bg-transparent resize-none text-sm md:text-base leading-relaxed border-0 focus:ring-0 focus:border-0 p-0 placeholder:text-gray-400 shadow-none"
                        />
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 text-xs md:text-sm text-gray-400">
                          {inputText.length} characters
                        </div>
                      </div>

                      {/* Writing Style Selection */}
                      <div className="flex justify-center mt-4 mb-4">
                        {/* Mobile Dropdown - Only visible on small screens */}
                        <div className="sm:hidden w-full">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
                              >
                                <div className="flex items-center">
                                  {STYLE_OPTIONS.find(style => style.value === selectedStyle)?.icon && (
                                    <span className="mr-2">
                                      {createElement(
                                        STYLE_OPTIONS.find(style => style.value === selectedStyle)!.icon,
                                        { className: "h-4 w-4" }
                                      )}
                                    </span>
                                  )}
                                  <span>{STYLE_OPTIONS.find(style => style.value === selectedStyle)?.label || 'Select Style'}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-48">
                              <DropdownMenuLabel>Writing Style</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {STYLE_OPTIONS.map((style) => (
                                <DropdownMenuItem
                                  key={style.value}
                                  onClick={() => setSelectedStyle(style.value as WritingStyle)}
                                  className="flex items-center cursor-pointer"
                                >
                                  <span className="mr-2">
                                    {createElement(style.icon, { className: "h-4 w-4" })}
                                  </span>
                                  <span>{style.label}</span>
                                  {selectedStyle === style.value && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Desktop Style Buttons - Only visible on medium screens and up */}
                        <div className="hidden sm:flex flex-wrap justify-center gap-2">
                          {STYLE_OPTIONS.map((style) => (
                            <Button
                              key={style.value}
                              variant={selectedStyle === style.value ? "default" : "outline"}
                              onClick={() => setSelectedStyle(style.value as WritingStyle)}
                              className={`flex items-center space-x-2 px-3 py-2 ${
                                selectedStyle === style.value 
                                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                                  : "bg-white hover:bg-purple-50 text-gray-700 border-purple-200"
                              }`}
                            >
                              {createElement(style.icon, { 
                                className: `h-4 w-4 ${selectedStyle === style.value ? "text-white" : "text-purple-500"}` 
                              })}
                              <span>{style.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 md:mt-6 space-y-3 md:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center">
                            <Button
                              onClick={handleHumanize}
                              disabled={isProcessing || !inputText.trim()}
                              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 text-sm md:text-base"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin mr-1 md:mr-2" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                  Humanize Text
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Enhanced Output Section */}
                <div className="flex flex-col">
                  <Card className="flex-1 p-4 md:p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05]" />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4 space-y-2 sm:space-y-0">
                        <div className="space-y-1">
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Humanized Output</h2>
                          <p className="text-xs md:text-sm text-gray-500">Your enhanced text will appear here</p>
                        </div>
                      </div>

                      <div className="min-h-[250px] md:min-h-[400px] bg-white/80 rounded-xl p-3 md:p-6 border border-purple-500/20 relative">
                        {outputText ? (
                          <div className="space-y-3 md:space-y-4 h-full max-h-[250px] md:max-h-[400px] overflow-y-auto pr-2">
                            <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{outputText}</p>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4 md:space-y-6">
                              <div className="relative flex justify-center">
                                <div className="absolute inset-0 animate-ping flex items-center justify-center">
                                  <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-purple-500/20" />
                                </div>
                                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium text-base md:text-lg mb-1 md:mb-2">Your humanized text will appear here</p>
                                <p className="text-xs md:text-sm text-gray-400">Enter your text and click "Humanize Text" to begin</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {outputText && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            className="text-sm border-purple-500/20 hover:bg-purple-500/5"
                            onClick={handleCopy}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Text
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 