import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Brain, RefreshCcw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

// TypewriterText component for animating text
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

interface LectureSummaryProps {
  title: string;
  summary: string;
  videoId: string;
  onRegenerateSummary?: () => void;
  onGenerateFlashcards?: () => void;
  isRegenerating?: boolean;
  isGeneratingFlashcards?: boolean;
  className?: string;
}

export function LectureSummary({
  title,
  summary,
  videoId,
  onRegenerateSummary,
  onGenerateFlashcards,
  isRegenerating = false,
  isGeneratingFlashcards = false,
  className = ""
}: LectureSummaryProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const { toast } = useToast();

  // Reset typing animation when summary changes
  useEffect(() => {
    setIsTyping(true);
    setShowFullSummary(false);
  }, [summary]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard",
    });
  };

  return (
    <Card className={`p-6 bg-white/80 backdrop-blur-sm border-purple-500/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center space-x-2">
          {isRegenerating && (
            <div className="flex items-center text-sm text-purple-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-sm border-purple-500/20 hover:bg-purple-500/5"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3 mr-2" />
            Copy Summary
          </Button>
        </div>
      </div>

      {/* YouTube Embed */}
      {videoId && (
        <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Summary Content */}
      <div className="prose prose-sm max-w-none">
        {isTyping ? (
          <TypewriterText 
            text={summary} 
            speed={5} 
            onComplete={() => setIsTyping(false)} 
          />
        ) : (
          <div>
            {showFullSummary ? (
              <div>
                {summary.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <Button
                  variant="link"
                  className="p-0 h-auto text-purple-500"
                  onClick={() => setShowFullSummary(false)}
                >
                  Show Less
                </Button>
              </div>
            ) : (
              <div>
                {summary.split('\n').slice(0, 5).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {summary.split('\n').length > 5 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-purple-500"
                    onClick={() => setShowFullSummary(true)}
                  >
                    Show More
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {onRegenerateSummary && (
          <Button
            variant="outline"
            className="flex-1 py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
            onClick={onRegenerateSummary}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
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
        )}
        
        {onGenerateFlashcards && (
          <Button
            variant="outline"
            className="flex-1 py-3 flex items-center justify-center bg-white hover:bg-purple-50/50 text-gray-700 border-purple-100 hover:border-purple-200 transition-all"
            onClick={onGenerateFlashcards}
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
        )}
      </div>
    </Card>
  );
} 