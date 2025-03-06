import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

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
      <div className="flex items-center justify-center h-[400px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
        <p className="text-gray-500 font-medium">No flashcards available</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Flashcards</h2>
        <div className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
          {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      <div className="relative">
        <Card
          className={`
            relative h-[400px] cursor-pointer transition-all duration-700 mx-auto max-w-2xl
            ${currentCard.isFlipped 
              ? 'bg-gradient-to-br from-purple-500/[0.15] to-blue-500/[0.15] shadow-lg border border-purple-200' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-md border border-purple-100'}
            hover:shadow-xl rounded-xl overflow-hidden
          `}
          onClick={() => onFlip(currentCard.id)}
        >
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white text-purple-600"
              onClick={(e) => {
                e.stopPropagation();
                onFlip(currentCard.id);
              }}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full max-w-md mx-auto">
              <div className={`transition-all duration-500 ${currentCard.isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <p className="text-xl text-center font-medium text-gray-800">
                  {currentCard.question}
                </p>
              </div>
              <div className={`absolute inset-0 transition-all duration-500 ${!currentCard.isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <p className="text-xl text-center font-medium text-gray-800">
                  {currentCard.answer}
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            Click to flip
          </div>
        </Card>

        <div className="absolute left-0 right-0 bottom-8 flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10 rounded-full bg-white shadow-md border-purple-100 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="h-10 w-10 rounded-full bg-white shadow-md border-purple-100 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 