"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, BookOpen } from "lucide-react";
import YouTube from "react-youtube";

interface LectureSummaryProps {
  title: string;
  summary: string;
  videoId: string;
  onRegenerateSummary: () => void;
  onGenerateFlashcards: () => void;
  isRegenerating: boolean;
  isGeneratingFlashcards: boolean;
}

export function LectureSummary({
  title,
  summary,
  videoId,
  onRegenerateSummary,
  onGenerateFlashcards,
  isRegenerating,
  isGeneratingFlashcards,
}: LectureSummaryProps) {
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Format summary with proper paragraph breaks
  const formattedSummary = summary
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ));

  return (
    <Card className="shadow-md border-purple-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900">{title}</CardTitle>
        <CardDescription>Lecture Summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Player */}
        <div className={`relative overflow-hidden rounded-lg ${isVideoExpanded ? 'aspect-video' : 'aspect-video max-h-[300px]'}`}>
          <YouTube
            videoId={videoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsVideoExpanded(!isVideoExpanded)}
          className="w-full"
        >
          {isVideoExpanded ? "Collapse Video" : "Expand Video"}
        </Button>

        {/* Summary Content */}
        <div className="prose prose-purple max-w-none">
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <div className="bg-purple-50 p-4 rounded-lg">
            {formattedSummary}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={onRegenerateSummary}
          disabled={isRegenerating}
          className="w-full sm:w-auto"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Summary
            </>
          )}
        </Button>
        <Button 
          onClick={onGenerateFlashcards}
          disabled={isGeneratingFlashcards}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
        >
          {isGeneratingFlashcards ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-4 w-4" />
              Generate Flashcards
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 