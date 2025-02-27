'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertCircle,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from '@/components/ui/use-toast'
import { useUsage } from '@/lib/hooks/use-usage'
import { useSupabase } from '@/context/supabase-context'

interface Flashcard {
  id: string
  question: string
  answer: string
  isCorrect?: boolean
  userAnswer?: string
}

interface StoredLecture {
  id: string
  videoId: string
  title: string
  timestamp: Date
  duration: string
  summary: string
  transcript: string
  expiresAt: Date
}

type WritingStyle = 'casual' | 'professional' | 'academic' | 'creative' | 'balanced'

const STYLE_OPTIONS = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly and conversational',
    icon: Pencil,
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear and polished',
    icon: Brain,
  },
  {
    value: 'academic',
    label: 'Academic',
    description: 'Scholarly and precise',
    icon: GraduationCap,
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Engaging and imaginative',
    icon: Lightbulb,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Natural mix of styles',
    icon: Scale,
  },
]

export default function ChatPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('balanced')
  const [videoSummary, setVideoSummary] = useState('')
  const [videoTranscript, setVideoTranscript] = useState<string>('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [processingOption, setProcessingOption] = useState<'flashcards' | 'summary'>('summary')
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<boolean>(false)
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false)
  const [isProcessingSummary, setIsProcessingSummary] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false)
  const [recentLectures, setRecentLectures] = useState<StoredLecture[]>([])
  const { checkAndIncrementUsage, usageData } = useUsage()
  const { user, loading } = useSupabase()

  console.log('🎭 ChatPage render state:', {
    hasUser: !!user,
    userId: user?.id,
    isAuthLoading: loading,
    timestamp: new Date().toISOString(),
  })

  useEffect(() => {
    // Get the tab from URL on initial load
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [])

  // Load recent lectures from localStorage on mount
  useEffect(() => {
    const loadRecentLectures = () => {
      const stored = localStorage.getItem('recentLectures')
      if (stored) {
        const lectures: StoredLecture[] = JSON.parse(stored)
        // Filter out expired lectures (older than 7 days)
        const now = new Date()
        const validLectures = lectures.filter(lecture => {
          const expirationDate = new Date(lecture.expiresAt)
          return expirationDate > now
        })
        setRecentLectures(validLectures)
        // Save filtered lectures back to localStorage
        if (validLectures.length !== lectures.length) {
          localStorage.setItem('recentLectures', JSON.stringify(validLectures))
        }
      }
    }

    loadRecentLectures()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/chat?tab=${value}`, { scroll: false })
  }

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video')
      }

      setVideoId(data.videoId)
      setSummary(data.summary)
      setVideoTranscript(data.transcript)

      // Create new lecture entry
      const newLecture: StoredLecture = {
        id: Date.now().toString(),
        videoId: data.videoId,
        title: data.title || 'Untitled Lecture',
        timestamp: new Date(),
        duration: data.duration || '00:00',
        summary: data.summary,
        transcript: data.transcript,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      // Update recent lectures (keep only last 3)
      const updatedLectures = [newLecture, ...recentLectures].slice(0, 3)
      setRecentLectures(updatedLectures)
      localStorage.setItem('recentLectures', JSON.stringify(updatedLectures))

      setIsProcessing(false)
    } catch (error) {
      console.error('Error processing video:', error)
      setError(error instanceof Error ? error.message : 'Failed to process video')
      setIsProcessing(false)
    }
  }

  const handleHumanize = async () => {
    console.log('🎯 Starting humanize process:', {
      hasInputText: !!inputText?.trim(),
      textLength: inputText?.length,
      selectedStyle,
    })

    if (!inputText.trim()) return

    try {
      // Check usage limits before processing
      console.log('🔍 Checking usage limits...')
      const canProceed = await checkAndIncrementUsage('text_humanizations')
      console.log('✅ Usage check result:', { canProceed })

      if (!canProceed) {
        console.log('❌ Cannot proceed due to usage limits')
        return
      }

      setIsProcessing(true)
      console.log('🚀 Making API request to Supabase function...')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/humanize-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          credentials: 'omit',
          body: JSON.stringify({
            text: inputText,
            style: selectedStyle,
          }),
        }
      )

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to process text' }))
        console.error('❌ API Error:', error)
        throw new Error(error.error || 'Failed to process text')
      }

      const data = await response.json()
      console.log('✨ Successfully processed text:', {
        hasOutput: !!data.improvedText,
        outputLength: data.improvedText?.length,
      })

      setOutputText(data.improvedText)
    } catch (error: any) {
      console.error('❌ Error in handleHumanize:', {
        error,
        message: error.message,
        stack: error.stack,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to humanize text',
      })
    } finally {
      console.log('🏁 Humanize process completed')
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      // You might want to show a success toast here
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!videoTranscript) {
      console.error('No transcript available')
      return
    }

    // Check usage limits before generating flashcards
    const canProceed = await checkAndIncrementUsage('flashcard_sets')
    if (!canProceed) return

    setIsGeneratingFlashcards(true)
    try {
      // Send transcript to OpenAI API directly
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: videoTranscript }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards')
      }

      // Reset current card index and flip state
      setCurrentCardIndex(0)
      setIsCardFlipped(false)

      // Set the flashcards with proper typing and IDs
      setFlashcards(
        data.flashcards.map((card: any, index: number) => ({
          id: `card-${index}`,
          question: card.question,
          answer: card.answer,
          isCorrect: undefined,
        }))
      )

      // Navigate to flashcards tab after a short delay to ensure state is updated
      setTimeout(() => {
        handleTabChange('flashcards')
      }, 100)

      toast({
        title: 'Success',
        description: 'Flashcards generated successfully',
      })
    } catch (error: any) {
      console.error('Error generating flashcards:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate flashcards',
      })
    } finally {
      setIsGeneratingFlashcards(false)
    }
  }

  // Add handler for loading previous lecture
  const handleLoadPreviousLecture = (lecture: StoredLecture) => {
    setVideoId(lecture.videoId)
    setSummary(lecture.summary)
    setVideoTranscript(lecture.transcript)
  }

  const handleButtonClick = () => {
    console.log('🖱️ Humanize button clicked:', {
      hasUser: !!user,
      userId: user?.id,
      isProcessing,
      hasInputText: !!inputText?.trim(),
      selectedStyle,
      timestamp: new Date().toISOString(),
    })

    if (!user) {
      console.log('⚠️ No user found during humanize attempt')
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use this feature',
      })
      router.push('/auth/signin')
      return
    }

    handleHumanize()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="theme-header fixed top-0 z-50 w-full">
        <div className="flex h-14 items-center px-6">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Updated background pattern */}
      <div
        className="fixed inset-0 bg-[#F8F8FC]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 0.25px, transparent 0.25px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Tabs Navigation */}
      <div className="fixed top-14 z-40 w-full border-b border-purple-500/10 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl px-6 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center">
              <TabsList className="h-14 rounded-full border border-purple-500/20 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm">
                <TabsTrigger
                  value="youtube"
                  className={`relative flex items-center rounded-full px-8 transition-all duration-300 ${
                    activeTab === 'youtube'
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-purple-500/5 hover:text-purple-600'
                  }`}
                >
                  {activeTab === 'youtube' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
                        fill={activeTab === 'youtube' ? 'white' : 'currentColor'}
                      />
                      <path
                        d="M9.75 15.02V8.48l5.75 3.27-5.75 3.27z"
                        fill={activeTab === 'youtube' ? '#ef4444' : 'white'}
                      />
                    </svg>
                    <span className="relative text-base">YouTube Learning</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className={`relative flex items-center rounded-full px-8 transition-all duration-300 ${
                    activeTab === 'flashcards'
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-purple-500/5 hover:text-purple-600'
                  }`}
                >
                  {activeTab === 'flashcards' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    <span className="text-base">Flashcards</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="humanizer"
                  className={`relative flex items-center rounded-full px-8 transition-all duration-300 ${
                    activeTab === 'humanizer'
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-purple-500/5 hover:text-purple-600'
                  }`}
                >
                  {activeTab === 'humanizer' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 transition-all duration-300" />
                  )}
                  <div className="relative flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full w-full">
          {/* YouTube Learning Tab */}
          <TabsContent value="youtube" className="m-0">
            <div className="mx-auto max-w-7xl p-6">
              <div
                className={`grid ${videoId ? 'grid-cols-[2fr_3fr]' : 'grid-cols-1'} gap-8 transition-all duration-500`}
              >
                {!videoId ? (
                  <div className="col-span-2 space-y-6">
                    <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                      <h2 className="mb-4 text-xl font-semibold">Process YouTube Lecture</h2>
                      <div className="space-y-4">
                        <div>
                          <Label>YouTube URL</Label>
                          <div className="mt-1.5 flex space-x-2">
                            <Input
                              placeholder="Paste YouTube URL here..."
                              value={youtubeUrl}
                              onChange={e => setYoutubeUrl(e.target.value)}
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
                          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                        </div>
                      </div>
                    </Card>

                    <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                      <h2 className="mb-4 text-xl font-semibold">Recent Lectures</h2>
                      <div className="space-y-2">
                        {['Machine Learning Basics', 'Data Structures', 'Web Development'].map(
                          title => (
                            <Button
                              key={title}
                              variant="ghost"
                              className="w-full justify-between hover:bg-purple-500/5"
                            >
                              <div className="flex items-center">
                                <Youtube className="mr-2 h-4 w-4 text-red-500" />
                                <span>{title}</span>
                              </div>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Video Section */}
                    <div className="space-y-6">
                      <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                        <h2 className="mb-4 text-xl font-semibold">Lecture Video</h2>
                        <div className="mb-6 aspect-video rounded-lg bg-gray-100">
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
                        <div className="mb-6 grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            className="flex w-full items-center justify-center border-purple-100 bg-white py-3 text-gray-700 transition-all hover:border-purple-200 hover:bg-purple-50/50"
                            onClick={handleGenerateFlashcards}
                            disabled={isGeneratingFlashcards}
                          >
                            {isGeneratingFlashcards ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Brain className="mr-2 h-4 w-4 text-purple-500" />
                                <span>Generate Flashcards</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex w-full items-center justify-center border-purple-100 bg-white py-3 text-gray-700 transition-all hover:border-purple-200 hover:bg-purple-50/50"
                            onClick={handleYoutubeSubmit}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Regenerating...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="mr-2 h-4 w-4 text-purple-500" />
                                <span>Regenerate Summary</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="col-span-2 flex w-full items-center justify-center border-purple-100 bg-white py-3 text-gray-700 transition-all hover:border-purple-200 hover:bg-purple-50/50"
                          >
                            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                            <span>Key Insights</span>
                          </Button>
                        </div>

                        {/* Recent Lectures Section */}
                        <div className="border-t border-purple-500/10 pt-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-600">Recent Lectures</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm text-purple-500 hover:text-purple-600"
                            >
                              View All
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {recentLectures.map(lecture => (
                              <Button
                                key={lecture.id}
                                variant="ghost"
                                className="group flex h-auto w-full items-start justify-between p-2 transition-all hover:bg-purple-500/5"
                                onClick={() => handleLoadPreviousLecture(lecture)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-purple-500/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Youtube className="h-6 w-6 text-purple-500" />
                                    </div>
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-purple-600">
                                      {lecture.title}
                                    </p>
                                    <div className="mt-1 flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">
                                        {new Date(lecture.timestamp).toLocaleDateString()}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        {lecture.duration}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="mt-2 h-4 w-4 text-gray-400 transition-colors group-hover:text-purple-500" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-6">
                      <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-xl font-semibold">Lecture Summary</h2>
                          <div className="flex items-center space-x-2">
                            {isProcessing && (
                              <div className="flex items-center text-sm text-purple-500">
                                <Loader2 className="mr-2 h-4 animate-spin" />
                                Processing...
                              </div>
                            )}
                            {summary && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/20 text-sm hover:bg-purple-500/5"
                                onClick={() => {
                                  navigator.clipboard.writeText(summary)
                                  // You might want to add a toast notification here
                                }}
                              >
                                <Copy className="mr-2 h-3 w-3" />
                                Copy Summary
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-sm custom-scrollbar h-[calc(100vh-20rem)] max-w-none overflow-y-auto pr-4">
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1
                                  className="mb-6 rounded-lg border-b border-purple-200 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-4 pb-2 text-2xl font-bold text-gray-900"
                                  {...props}
                                />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2
                                  className="mb-4 mt-8 flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent p-2 text-xl font-semibold text-gray-800"
                                  {...props}
                                />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3
                                  className="mb-3 mt-6 border-l-4 border-purple-400 pl-3 text-lg font-medium text-gray-700"
                                  {...props}
                                />
                              ),
                              p: ({ node, ...props }) => (
                                <p
                                  className="mb-4 leading-relaxed text-gray-600 transition-colors duration-200 hover:text-gray-900"
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="mb-6 ml-2 space-y-3" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="mb-6 ml-2 list-decimal space-y-3" {...props} />
                              ),
                              li: ({ node, children, ...props }) => (
                                <li className="group flex items-start space-x-2" {...props}>
                                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-transform duration-200 group-hover:scale-110" />
                                  <span className="flex-1">{children}</span>
                                </li>
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className="my-6 rounded-r-lg border-l-4 border-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent py-3 pl-4 italic text-gray-700"
                                  {...props}
                                />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong
                                  className="rounded bg-purple-500/10 px-1 font-semibold text-purple-700"
                                  {...props}
                                />
                              ),
                              em: ({ node, ...props }) => (
                                <em
                                  className="rounded bg-blue-500/10 px-1 not-italic text-blue-600"
                                  {...props}
                                />
                              ),
                              code: ({ node, ...props }) => (
                                <code
                                  className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800"
                                  {...props}
                                />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-purple-600 underline decoration-purple-500/30 transition-colors duration-200 hover:text-purple-700 hover:decoration-purple-500"
                                  {...props}
                                />
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
            <div className="mx-auto max-w-6xl p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Flashcard Display */}
                <div className="space-y-6">
                  <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
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
                        <div className="perspective-1000 relative h-[400px]">
                          <div
                            className={`transform-style-3d absolute inset-0 transition-transform duration-500 ${
                              isCardFlipped ? 'rotate-y-180' : ''
                            }`}
                          >
                            {/* Front of Card */}
                            <div className="backface-hidden absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] p-8 text-center shadow-sm">
                              <div
                                className={`w-full transition-opacity duration-200 ${isCardFlipped ? 'opacity-0' : 'opacity-100'}`}
                              >
                                <p className="text-xl text-gray-800">
                                  {flashcards[currentCardIndex]?.question ||
                                    'No question available'}
                                </p>
                              </div>
                            </div>
                            {/* Back of Card */}
                            <div className="backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15] p-8 text-center shadow-sm">
                              <div
                                className={`w-full transition-opacity duration-200 ${!isCardFlipped ? 'opacity-0' : 'opacity-100'}`}
                              >
                                <p className="text-xl text-gray-800">
                                  {flashcards[currentCardIndex]?.answer || 'No answer available'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <Button
                            variant="outline"
                            className="space-x-2"
                            onClick={() => {
                              if (currentCardIndex > 0) {
                                setCurrentCardIndex(currentCardIndex - 1)
                                setIsCardFlipped(false)
                              }
                            }}
                            disabled={currentCardIndex === 0}
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>Previous</span>
                          </Button>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="outline"
                              className="space-x-2"
                              onClick={() => {
                                const updatedFlashcards = [...flashcards]
                                updatedFlashcards[currentCardIndex] = {
                                  ...updatedFlashcards[currentCardIndex],
                                  isCorrect: false,
                                }
                                setFlashcards(updatedFlashcards)
                              }}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>Incorrect</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="space-x-2"
                              onClick={() => {
                                const updatedFlashcards = [...flashcards]
                                updatedFlashcards[currentCardIndex] = {
                                  ...updatedFlashcards[currentCardIndex],
                                  isCorrect: true,
                                }
                                setFlashcards(updatedFlashcards)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Correct</span>
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            className="space-x-2"
                            onClick={() => {
                              if (currentCardIndex < flashcards.length - 1) {
                                setCurrentCardIndex(currentCardIndex + 1)
                                setIsCardFlipped(false)
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
                      <div className="flex h-[400px] items-center justify-center text-center">
                        <div className="space-y-4">
                          <div className="mx-auto w-fit rounded-full bg-purple-500/10 p-4">
                            <Brain className="h-8 w-8 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              No Flashcards Available
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Generate flashcards from a YouTube video to start studying
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleTabChange('youtube')}
                          >
                            <Youtube className="mr-2 h-4 w-4" />
                            Process YouTube Video
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold">Study Progress</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Cards Reviewed</span>
                        <span>
                          {currentCardIndex + 1}/{flashcards.length}
                        </span>
                      </div>
                      <Progress
                        value={
                          flashcards.length > 0
                            ? ((currentCardIndex + 1) / flashcards.length) * 100
                            : 0
                        }
                        className="h-2"
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-green-500/10 p-2">
                          <div className="text-lg font-semibold text-green-600">
                            {flashcards.filter(card => card.isCorrect === true).length}
                          </div>
                          <div className="text-xs text-gray-600">Correct</div>
                        </div>
                        <div className="rounded-lg bg-yellow-500/10 p-2">
                          <div className="text-lg font-semibold text-yellow-600">
                            {flashcards.filter(card => card.isCorrect === undefined).length}
                          </div>
                          <div className="text-xs text-gray-600">Review</div>
                        </div>
                        <div className="rounded-lg bg-red-500/10 p-2">
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
                  <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold">Your Decks</h2>
                    <div className="space-y-2">
                      {[
                        { name: 'Machine Learning Basics', cards: 30, progress: 75 },
                        { name: 'Data Structures', cards: 45, progress: 40 },
                        { name: 'Web Development', cards: 25, progress: 90 },
                      ].map(deck => (
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
                            <div className="h-2 w-24 rounded-full bg-purple-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{ width: `${deck.progress}%` }}
                              />
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-purple-500/10 bg-white/80 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create New Deck
                      </Button>
                      <Button variant="outline">
                        <Brain className="mr-2 h-4 w-4" />
                        Import Cards
                      </Button>
                      <Button variant="outline">
                        <Sliders className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View All
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Humanizer Tab */}
          <TabsContent value="humanizer" className="m-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white" />

              <div className="relative">
                <div className="container mx-auto px-6">
                  {/* Enhanced Header Section */}
                  <div className="mb-8 pt-6 text-center">
                    <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-purple-500/20 bg-white px-4 py-1.5">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">AI-Powered Text Enhancement</span>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Text Humanizer</h1>
                    <p className="mx-auto max-w-2xl text-gray-600">
                      Transform your text into natural, engaging content with our AI-powered
                      humanizer
                    </p>
                  </div>

                  <div className="grid h-full grid-cols-2 gap-8">
                    {/* Enhanced Input Section */}
                    <div className="h-full">
                      <Card className="relative flex h-full flex-col overflow-hidden border-purple-500/10 bg-white p-6">
                        <div className="relative flex h-full flex-col">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <h2 className="text-xl font-semibold text-gray-900">Input Text</h2>
                              <p className="text-sm text-gray-500">
                                Enter or paste your text below
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/20 text-sm text-gray-500 hover:bg-purple-500/5"
                                onClick={() => setInputText('')}
                              >
                                <RefreshCcw className="mr-2 h-3 w-3" />
                                Clear
                              </Button>
                            </div>
                          </div>

                          <div className="relative flex-1">
                            <Textarea
                              placeholder="Enter your text here..."
                              value={inputText}
                              onChange={e => setInputText(e.target.value)}
                              className="h-full min-h-[500px] resize-none rounded-xl border-purple-500/20 bg-white text-base leading-relaxed placeholder:text-gray-400 focus:border-purple-500/30 focus:ring-purple-500/20"
                            />
                            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                              {inputText.length} characters
                            </div>
                          </div>

                          {/* Writing Style Selection */}
                          <div className="mt-4 flex justify-center">
                            <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/20 bg-white p-1">
                              {STYLE_OPTIONS.map(style => (
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
                                  <style.icon className="mr-2 h-4 w-4" />
                                  {style.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Button
                                  onClick={handleButtonClick}
                                  disabled={isProcessing || !inputText.trim()}
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-blue-600"
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
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
                    <div className="h-full">
                      <Card className="relative flex h-full flex-col overflow-hidden border-purple-500/10 bg-white p-6">
                        <div className="relative flex h-full flex-col">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <h2 className="text-xl font-semibold text-gray-900">
                                Humanized Output
                              </h2>
                              <p className="text-sm text-gray-500">
                                Your enhanced text will appear here
                              </p>
                            </div>
                            {outputText && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-500/20 text-sm hover:bg-purple-500/5"
                                  onClick={handleCopy}
                                >
                                  <Copy className="mr-2 h-3 w-3" />
                                  Copy
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="relative flex-1 rounded-xl border border-purple-500/20 bg-white p-6">
                            {outputText ? (
                              <div className="space-y-4">
                                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                                  {outputText}
                                </p>
                                {/* Enhancement Metrics */}
                                <div className="mt-6 border-t border-purple-500/10 pt-6">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-lg bg-purple-500/5 p-3 text-center">
                                      <div className="text-lg font-semibold text-purple-600">
                                        98%
                                      </div>
                                      <div className="text-xs text-gray-500">Readability</div>
                                    </div>
                                    <div className="rounded-lg bg-blue-500/5 p-3 text-center">
                                      <div className="text-lg font-semibold text-blue-600">
                                        Natural
                                      </div>
                                      <div className="text-xs text-gray-500">Tone</div>
                                    </div>
                                    <div className="rounded-lg bg-green-500/5 p-3 text-center">
                                      <div className="text-lg font-semibold text-green-600">
                                        High
                                      </div>
                                      <div className="text-xs text-gray-500">Engagement</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="space-y-6 text-center">
                                  <div className="relative flex justify-center">
                                    <div className="absolute inset-0 flex animate-ping items-center justify-center">
                                      <Sparkles className="h-10 w-10 text-purple-500/20" />
                                    </div>
                                    <Sparkles className="h-10 w-10 text-purple-500" />
                                  </div>
                                  <div>
                                    <p className="mb-2 text-lg font-medium text-gray-500">
                                      Your humanized text will appear here
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Enter your text and click "Humanize Text" to begin
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pro Tips Section - Integrated into the card */}
                          <div className="mt-4 flex items-start space-x-3 rounded-xl bg-purple-500/5 p-4">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <h3 className="mb-1 font-medium text-gray-900">Pro Tips</h3>
                              <ul className="list-inside list-disc space-y-1 text-sm text-gray-500">
                                <li>Use clear, concise sentences for better results</li>
                                <li>Include context to improve humanization</li>
                                <li>Review and edit the output for best results</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Keep the upgrade prompt if user is on free tier */}
      {usageData?.tier === 'free' && (
        <Card className="border-purple-500/10 bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-purple-900">Upgrade to get more features</p>
              <p className="mt-1 text-sm text-purple-600">
                Get access to more summaries, flashcards, and humanizations with our Pro plan.
              </p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0 text-purple-600 hover:text-purple-700"
                onClick={() => router.push('/pricing')}
              >
                View Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
