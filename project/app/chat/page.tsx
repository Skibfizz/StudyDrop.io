"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Clock, 
  Brain, 
  GraduationCap, 
  Sparkles,
  Send,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  ChevronRight,
  BookOpen,
  MoreVertical,
  ArrowLeft,
  Youtube,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ThumbsUp,
  Link as LinkIcon,
  Zap,
  Star,
  BarChart
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'code' | 'link' | 'youtube';
  language?: string;
  metadata?: {
    youtubeUrl?: string;
    title?: string;
    duration?: string;
  };
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
  isCorrect?: boolean;
  userAnswer?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI study assistant. You can share a YouTube lecture URL, and I'll help you create study materials from it.",
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [studyProgress, setStudyProgress] = useState(0);
  const [transcriptSummary, setTranscriptSummary] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Check if the message is a YouTube URL
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (youtubeUrlPattern.test(inputMessage)) {
        const videoMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Processing your YouTube video...",
          sender: 'ai',
          timestamp: new Date(),
          status: 'sending',
          type: 'youtube',
          metadata: {
            youtubeUrl: inputMessage
          }
        };
        setMessages(prev => [...prev, videoMessage]);
        await handleYoutubeSubmit();
      } else {
        // Simulate AI response with code example if requested
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: inputMessage.toLowerCase().includes('code') 
              ? `Here's an example:\n\`\`\`python\ndef example():\n    print("Hello World")\`\`\``
              : `I understand you're asking about ${inputMessage}. Let me help you with that.`,
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent',
            type: inputMessage.toLowerCase().includes('code') ? 'code' : 'text',
            language: 'python'
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = messages.find(m => m.id === newMessage.id);
      if (errorMessage) {
        setMessages(prev => 
          prev.map(m => m.id === newMessage.id ? { ...m, status: 'error' } : m)
        );
      }
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    setIsProcessing(true);
    setInputMessage('');

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const data = await response.json();
      
      setFlashcards(data.flashcards);
      setTranscriptSummary(data.summary);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "I've processed the lecture and created study materials. Check the Flashcards tab to start studying!",
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent'
      }]);

    } catch (error) {
      console.error('Error processing video:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, there was an error processing the video. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        status: 'error'
      }]);
    }

    setIsProcessing(false);
    setYoutubeUrl('');
  };

  const handleFlashcardAnswer = (answer: string) => {
    const currentCard = flashcards[currentFlashcardIndex];
    const isCorrect = answer.toLowerCase() === currentCard.answer.toLowerCase();
    
    setFlashcards(prev => prev.map((card, idx) => 
      idx === currentFlashcardIndex 
        ? { ...card, isCorrect, userAnswer: answer }
        : card
    ));

    // Update progress
    const completedCards = flashcards.filter(card => card.userAnswer).length + 1;
    setStudyProgress((completedCards / flashcards.length) * 100);
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
    }
  };

  const resetFlashcards = () => {
    setFlashcards(prev => prev.map(card => ({
      ...card,
      isFlipped: false,
      isCorrect: undefined,
      userAnswer: undefined
    })));
    setCurrentFlashcardIndex(0);
    setStudyProgress(0);
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'code':
        return (
          <div className="rounded-lg overflow-hidden">
            <SyntaxHighlighter 
              language={message.language || 'javascript'}
              style={atomDark}
              customStyle={{ margin: 0, borderRadius: '0.5rem' }}
            >
              {message.content}
            </SyntaxHighlighter>
          </div>
        );
      case 'youtube':
        return (
          <div className="space-y-2">
            <p>{message.content}</p>
            {message.metadata?.youtubeUrl && (
              <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5 p-4">
                <div className="flex items-center space-x-3">
                  <Youtube className="h-5 w-5 text-red-500" />
                  <span className="text-sm">{message.metadata.youtubeUrl}</span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  const sessionStats = {
    duration: "45 minutes",
    messages: messages.length,
    topicsCovered: 3
  };

  const quickActions = [
    { icon: FileText, label: "Generate Study Notes", color: "text-purple-400" },
    { icon: MessageSquare, label: "Practice Questions", color: "text-blue-400" },
    { icon: Sparkles, label: "Summarize Session", color: "text-cyan-400" }
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

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <Button 
              size="lg" 
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10 bg-transparent border-white/10 focus:border-white/20"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {['Data Structures', 'Physics Mechanics', 'Calculus II'].map((subject, index) => (
                <div
                  key={index}
                  className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
                    selectedSession === subject ? 'bg-white/5 border border-white/10' : ''
                  }`}
                  onClick={() => setSelectedSession(subject)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{subject}</p>
                        <p className="text-xs text-gray-400">3 messages</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
                <TabsTrigger 
                  value="chat"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="video"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Process Video
                </TabsTrigger>
                <TabsTrigger 
                  value="flashcards"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Flashcards
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">AI Study Assistant</h2>
                    <p className="text-sm text-gray-400">Always here to help</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4">
                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender === 'user'
                              ? 'bg-purple-500/10 text-white'
                              : 'bg-white/5 text-white'
                          }`}
                        >
                          {renderMessage(message)}
                          <div className="mt-2 flex items-center justify-end space-x-2">
                            <span className="text-xs text-gray-400">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.sender === 'user' && (
                              <div className="flex items-center">
                                {message.status === 'sending' && (
                                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                                )}
                                {message.status === 'sent' && (
                                  <MessageSquare className="h-3 w-3 text-gray-400" />
                                )}
                                {message.status === 'error' && (
                                  <XCircle className="h-3 w-3 text-red-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                                 style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                                 style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                                 style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-end space-x-4">
                  <div className="flex-1 relative">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask anything..."
                      className="min-h-[80px] bg-transparent border-white/10 focus:border-white/20 pr-20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="h-10 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <p>Press Enter to send, Shift + Enter for new line</p>
                  <p>{inputMessage.length}/1000</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="flex-1 p-6">
              <Card className="bg-black border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Youtube className="mr-2 h-5 w-5 text-red-500" />
                    Process YouTube Lecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>YouTube Video URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="flex-1 bg-transparent border-white/10"
                      />
                      <Button
                        onClick={handleYoutubeSubmit}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Get Transcript
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {transcriptSummary && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Lecture Summary</h3>
                      <p className="text-gray-400">{transcriptSummary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {flashcards.length} flashcards created
                        </span>
                        <Button
                          onClick={() => setActiveTab('flashcards')}
                          className="bg-white/10 hover:bg-white/20"
                        >
                          Start Studying
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flashcards" className="flex-1 p-6">
              {flashcards.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Study Flashcards</h2>
                    <Button
                      onClick={resetFlashcards}
                      variant="outline"
                      className="border-white/10"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Progress
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 left-0 w-full">
                      <div className="h-1 w-full bg-white/10 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${studyProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Card className="bg-black border border-white/10">
                    <CardContent className="pt-6">
                      <div className="aspect-[3/2] flex items-center justify-center">
                        <div className="text-center space-y-6 max-w-xl">
                          <p className="text-xl">
                            {flashcards[currentFlashcardIndex].question}
                          </p>
                          
                          {flashcards[currentFlashcardIndex].userAnswer ? (
                            <div className="space-y-4">
                              <div className={`p-4 rounded-lg ${
                                flashcards[currentFlashcardIndex].isCorrect 
                                  ? 'bg-green-500/10 border border-green-500/20'
                                  : 'bg-red-500/10 border border-red-500/20'
                              }`}>
                                <p className="font-medium">Your Answer:</p>
                                <p className="text-gray-400">
                                  {flashcards[currentFlashcardIndex].userAnswer}
                                </p>
                                <div className="mt-4">
                                  <p className="font-medium">Correct Answer:</p>
                                  <p className="text-gray-400">
                                    {flashcards[currentFlashcardIndex].answer}
                                  </p>
                                </div>
                              </div>
                              
                              {currentFlashcardIndex < flashcards.length - 1 && (
                                <Button
                                  onClick={nextFlashcard}
                                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                                >
                                  Next Question
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Type your answer..."
                                className="min-h-[100px] bg-transparent border-white/10"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                              />
                              <Button
                                onClick={() => handleFlashcardAnswer(inputMessage)}
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                              >
                                Submit Answer
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Question {currentFlashcardIndex + 1} of {flashcards.length}</span>
                    <span>{Math.round(studyProgress)}% Complete</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">No Flashcards Yet</h3>
                  <p className="text-gray-400 max-w-md">
                    Process a YouTube lecture to generate study materials and flashcards.
                  </p>
                  <Button
                    onClick={() => setActiveTab('video')}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    Process Video
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Info Sidebar */}
        <div className="w-80 border-l border-white/10 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Current Topic</h3>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">Data Structures</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Session Stats</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Duration</span>
                  <span>45 minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Messages</span>
                  <span>{messages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Topics Covered</span>
                  <span>3</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/5">
                  <Brain className="mr-2 h-4 w-4 text-purple-400" />
                  Generate Study Notes
                </Button>
                <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/5">
                  <MessageSquare className="mr-2 h-4 w-4 text-blue-400" />
                  Practice Questions
                </Button>
                <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/5">
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                  Summarize Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 