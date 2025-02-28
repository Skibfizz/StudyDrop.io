"use client";

import { useState, useRef, useEffect } from "react";
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
  Scale
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { SharedHeader } from "@/components/shared-header";

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

  useEffect(() => {
    // Get the tab from URL on initial load
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

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

    loadRecentLectures();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/chat?tab=${value}`, { scroll: false });
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setVideoId(data.videoId);
      setSummary(data.summary);
      setVideoTranscript(data.transcript);

      // Create new lecture entry
      const newLecture: StoredLecture = {
        id: Date.now().toString(),
        videoId: data.videoId,
        title: data.title || 'Untitled Lecture',
        timestamp: new Date(),
        duration: data.duration || '00:00',
        summary: data.summary,
        transcript: data.transcript,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

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
        throw new Error(data.error || 'Failed to process text');
      }

      setOutputText(data.improvedText);
    } catch (error) {
      console.error('Error:', error);
      // You might want to show an error toast here
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
      return;
    }
    
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
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      // Reset current card index and flip state
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      
      // Set the flashcards with proper typing and IDs
      setFlashcards(data.flashcards.map((card: any, index: number) => ({
        id: `card-${index}`,
        question: card.question,
        answer: card.answer,
        isCorrect: undefined
      })));

      // Navigate to flashcards tab after a short delay to ensure state is updated
      setTimeout(() => {
        handleTabChange('flashcards');
      }, 100);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // You might want to show an error toast here
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Add handler for loading previous lecture
  const handleLoadPreviousLecture = (lecture: StoredLecture) => {
    setVideoId(lecture.videoId);
    setSummary(lecture.summary);
    setVideoTranscript(lecture.transcript);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SharedHeader />

      {/* Updated background pattern */}
      <div className="fixed inset-0 bg-[#F8F8FC]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
        backgroundSize: '12px 12px'
      }} />

      {/* Tabs Navigation */}
      <div className="fixed top-14 z-40 w-full bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border-b border-purple-500/10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center">
              <TabsList className="bg-white/80 border border-purple-500/20 p-1.5 h-14 rounded-full shadow-sm backdrop-blur-sm">
                <TabsTrigger
                  value="youtube"
                  className={`relative px-8 rounded-full transition-all duration-300 flex items-center ${
                    activeTab === 'youtube'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'youtube' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill={activeTab === 'youtube' ? 'white' : 'currentColor'}/>
                      <path d="M9.75 15.02V8.48l5.75 3.27-5.75 3.27z" fill={activeTab === 'youtube' ? '#ef4444' : 'white'}/>
                    </svg>
                    <span className="relative text-base">YouTube Learning</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className={`relative px-8 rounded-full transition-all duration-300 flex items-center ${
                    activeTab === 'flashcards'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'flashcards' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    <span className="text-base">Flashcards</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="humanizer"
                  className={`relative px-8 rounded-full transition-all duration-300 flex items-center ${
                    activeTab === 'humanizer'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-500/5'
                  }`}
                >
                  {activeTab === 'humanizer' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="text-base">Humanizer</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-32">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
          {/* YouTube Learning Tab */}
          <TabsContent value="youtube" className="m-0">
            <div className="max-w-7xl mx-auto p-6">
              <div className={`grid ${videoId ? 'grid-cols-[2fr_3fr]' : 'grid-cols-1'} gap-8 transition-all duration-500`}>
                {!videoId ? (
                  <div className="space-y-6 col-span-2">
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                      <h2 className="text-xl font-semibold mb-4">Process YouTube Lecture</h2>
                      <div className="space-y-4">
                        <div>
                          <Label>YouTube URL</Label>
                          <div className="flex space-x-2 mt-1.5">
                            <Input
                              placeholder="Paste YouTube URL here..."
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              className="bg-white"
                            />
                            <Button
                              onClick={handleYoutubeSubmit}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Youtube className="h-4 w-4" />
                              )}
                              <span className="ml-2">Process</span>
                            </Button>
                          </div>
                          {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                      <h2 className="text-xl font-semibold mb-4">Recent Lectures</h2>
                      <div className="space-y-2">
                        {['Machine Learning Basics', 'Data Structures', 'Web Development'].map((title) => (
                          <Button
                            key={title}
                            variant="ghost"
                            className="w-full justify-between hover:bg-purple-500/5"
                          >
                            <div className="flex items-center">
                              <Youtube className="h-4 w-4 mr-2 text-red-500" />
                              <span>{title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Video Section */}
                    <div className="space-y-6">
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

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <Button 
                            variant="outline"
                            className="w-full py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
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
                            className="w-full py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
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

                        {/* Recent Lectures Section */}
                        <div className="border-t border-purple-500/10 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Recent Lectures</h3>
                            <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-600 text-sm">
                              View All
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {recentLectures.map((lecture) => (
                              <Button
                                key={lecture.id}
                                variant="ghost"
                                className="w-full p-2 h-auto flex items-start justify-between hover:bg-purple-500/5 transition-all group"
                                onClick={() => handleLoadPreviousLecture(lecture)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Youtube className="h-6 w-6 text-purple-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                                      {lecture.title}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-gray-500">
                                        {new Date(lecture.timestamp).toLocaleDateString()}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">{lecture.duration}</span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors mt-2" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-6">
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
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
                                Copy Summary
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar pr-4">
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
                            {summary || 'Generating summary...'}
                          </ReactMarkdown>
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="m-0">
            <div className="max-w-6xl mx-auto p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Flashcard Display */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Current Deck</h2>
                      <Button
                        variant="outline"
                        className="space-x-2"
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Flip Card</span>
                      </Button>
                    </div>

                    {flashcards.length > 0 ? (
                      <>
                        <div className="relative h-[400px] perspective-1000">
                          <div
                            className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
                              isCardFlipped ? 'rotate-y-180' : ''
                            }`}
                          >
                            {/* Front of Card */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] rounded-xl shadow-sm p-8 flex items-center justify-center text-center">
                              <div className={`w-full transition-opacity duration-200 ${isCardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                                <p className="text-xl text-gray-800">{flashcards[currentCardIndex]?.question || 'No question available'}</p>
                              </div>
                            </div>
                            {/* Back of Card */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15] rounded-xl shadow-sm p-8 flex items-center justify-center text-center">
                              <div className={`w-full transition-opacity duration-200 ${!isCardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                                <p className="text-xl text-gray-800">{flashcards[currentCardIndex]?.answer || 'No answer available'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between mt-6">
                          <Button 
                            variant="outline" 
                            className="space-x-2"
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
                            <Button variant="outline" className="space-x-2" onClick={() => {
                              const updatedFlashcards = [...flashcards];
                              updatedFlashcards[currentCardIndex] = {
                                ...updatedFlashcards[currentCardIndex],
                                isCorrect: false
                              };
                              setFlashcards(updatedFlashcards);
                            }}>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>Incorrect</span>
                            </Button>
                            <Button variant="outline" className="space-x-2" onClick={() => {
                              const updatedFlashcards = [...flashcards];
                              updatedFlashcards[currentCardIndex] = {
                                ...updatedFlashcards[currentCardIndex],
                                isCorrect: true
                              };
                              setFlashcards(updatedFlashcards);
                            }}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Correct</span>
                            </Button>
                          </div>
                          <Button 
                            variant="outline" 
                            className="space-x-2"
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
                      <div className="h-[400px] flex items-center justify-center text-center">
                        <div className="space-y-4">
                          <div className="p-4 rounded-full bg-purple-500/10 mx-auto w-fit">
                            <Brain className="h-8 w-8 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">No Flashcards Available</p>
                            <p className="text-sm text-gray-500 mt-1">Generate flashcards from a YouTube video to start studying</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => handleTabChange('youtube')}
                          >
                            <Youtube className="h-4 w-4 mr-2" />
                            Process YouTube Video
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                    <h2 className="text-xl font-semibold mb-4">Study Progress</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Cards Reviewed</span>
                        <span>{currentCardIndex + 1}/{flashcards.length}</span>
                      </div>
                      <Progress 
                        value={flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0} 
                        className="h-2" 
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <div className="text-lg font-semibold text-green-600">
                            {flashcards.filter(card => card.isCorrect === true).length}
                          </div>
                          <div className="text-xs text-gray-600">Correct</div>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <div className="text-lg font-semibold text-yellow-600">
                            {flashcards.filter(card => card.isCorrect === undefined).length}
                          </div>
                          <div className="text-xs text-gray-600">Review</div>
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/10">
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
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10">
                    <h2 className="text-xl font-semibold mb-4">Your Decks</h2>
                    <div className="space-y-2">
                      {[
                        { name: 'Machine Learning Basics', cards: 30, progress: 75 },
                        { name: 'Data Structures', cards: 45, progress: 40 },
                        { name: 'Web Development', cards: 25, progress: 90 }
                      ].map((deck) => (
                        <Button
                          key={deck.name}
                          variant="ghost"
                          className="w-full justify-between p-4 hover:bg-purple-500/5"
                        >
                          <div className="flex items-center space-x-4">
                            <Brain className="h-5 w-5 text-purple-500" />
                            <div className="text-left">
                              <div className="font-medium">{deck.name}</div>
                              <div className="text-sm text-gray-600">{deck.cards} cards</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-24 h-2 bg-purple-100 rounded-full">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                style={{ width: `${deck.progress}%` }}
                              />
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Humanizer Tab */}
          <TabsContent value="humanizer" className="m-0">
            <div className="container mx-auto px-6">
              {/* Enhanced Header Section */}
              <div className="text-center mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5" />
                <div className="relative py-8">
                  <div className="inline-flex items-center space-x-2 bg-white/50 rounded-full px-4 py-1.5 mb-4 border border-purple-500/20">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">AI-Powered Text Enhancement</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Text Humanizer</h1>
                  <p className="text-gray-600 max-w-2xl mx-auto">Transform your text into natural, engaging content with our AI-powered humanizer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Enhanced Input Section */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.05]" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-4">
                        <div className="space-y-1">
                          <h2 className="text-xl font-semibold text-gray-900">Input Text</h2>
                          <p className="text-sm text-gray-500">Enter or paste your text below</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm text-gray-500 border-purple-500/20 hover:bg-purple-500/5"
                            onClick={() => setInputText("")}
                          >
                            <RefreshCcw className="h-3 w-3 mr-2" />
                            Clear
                          </Button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Textarea
                          placeholder="Enter your text here..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[500px] bg-white/80 resize-none text-base leading-relaxed rounded-xl border-purple-500/20 focus:border-purple-500/30 focus:ring-purple-500/20 placeholder:text-gray-400"
                        />
                        <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                          {inputText.length} characters
                        </div>
                      </div>

                      {/* Writing Style Selection */}
                      <div className="flex justify-center mt-4">
                        <div className="inline-flex items-center space-x-2 bg-white/50 rounded-full p-1 border border-purple-500/20">
                          {STYLE_OPTIONS.map((style) => (
                            <Button
                              key={style.value}
                              variant={selectedStyle === style.value ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setSelectedStyle(style.value as WritingStyle)}
                              className={`rounded-full px-4 py-2 transition-all ${
                                selectedStyle === style.value 
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25' 
                                  : 'hover:bg-purple-500/10'
                              }`}
                            >
                              <style.icon className="h-4 w-4 mr-2" />
                              {style.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              onClick={handleHumanize}
                              disabled={isProcessing || !inputText.trim()}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Humanize Text
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/5">
                              <Brain className="h-4 w-4 mr-2" />
                              Save as Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Tips Card */}
                  <Card className="p-4 bg-white/80 backdrop-blur-sm border-purple-500/10">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Pro Tips</h3>
                        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                          <li>Use clear, concise sentences for better results</li>
                          <li>Include context to improve humanization</li>
                          <li>Review and edit the output for best results</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Enhanced Output Section */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05]" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-4">
                        <div className="space-y-1">
                          <h2 className="text-xl font-semibold text-gray-900">Humanized Output</h2>
                          <p className="text-sm text-gray-500">Your enhanced text will appear here</p>
                        </div>
                        {outputText && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm border-purple-500/20 hover:bg-purple-500/5"
                              onClick={handleCopy}
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="min-h-[500px] bg-white/80 rounded-xl p-6 border border-purple-500/20 relative">
                        {outputText ? (
                          <div className="space-y-4">
                            <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">{outputText}</p>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-6">
                              <div className="relative flex justify-center">
                                <div className="absolute inset-0 animate-ping flex items-center justify-center">
                                  <Sparkles className="h-10 w-10 text-purple-500/20" />
                                </div>
                                <Sparkles className="h-10 w-10 text-purple-500" />
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium text-lg mb-2">Your humanized text will appear here</p>
                                <p className="text-sm text-gray-400">Enter your text and click "Humanize Text" to begin</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {outputText && (
                        <div className="mt-6 flex items-center justify-between">
                          <Button variant="ghost" className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/5">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Generate Alternative
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/5">
                              <Brain className="h-4 w-4 mr-2" />
                              Save to Library
                            </Button>
                          </div>
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