import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  onFlip: (cardId: string) => void;
}

export default function FlashcardList({ flashcards, onFlip }: FlashcardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!flashcards.length) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-gray-400">No flashcards available</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="text-sm text-gray-400">
          {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      <div className="relative">
        <Card
          className={`
            relative h-[400px] cursor-pointer transition-all duration-500
            ${currentCard.isFlipped ? 'bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15]' : 'bg-white/5'}
          `}
          onClick={() => onFlip(currentCard.id)}
        >
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-xl text-center">
              {currentCard.isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>
        </Card>

        <div className="absolute left-0 right-0 bottom-8 flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 