import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

interface StudyNote {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  progress: number;
  lastStudied: string;
  type: 'quiz-results';
}

interface QuizSectionProps {
  quiz: QuizQuestion[];
  onAnswer: (questionId: string, answerIndex: number) => void;
  videoTitle?: string;
  onQuizComplete: (note: StudyNote) => void;
}

export default function QuizSection({ 
  quiz, 
  onAnswer, 
  videoTitle = "Untitled Lecture",
  onQuizComplete 
}: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    onAnswer(quiz[currentIndex].id, answerIndex);
    
    if (currentIndex < quiz.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 1000);
    } else {
      setIsComplete(true);
      const score = calculateScore();
      createStudyNote(score);
    }
  };

  const calculateScore = () => {
    const correctAnswers = quiz.filter(
      q => q.userAnswer !== undefined && q.userAnswer === q.correctAnswer
    ).length;
    return (correctAnswers / quiz.length) * 100;
  };

  const createStudyNote = (score: number) => {
    const note: StudyNote = {
      id: Date.now().toString(),
      title: `Quiz Results: ${videoTitle}`,
      description: `Quiz completed with ${score.toFixed(1)}% accuracy`,
      content: generateQuizSummary(),
      tags: ['quiz', 'completed'],
      progress: score,
      lastStudied: new Date().toISOString(),
      type: 'quiz-results'
    };
    onQuizComplete(note);
  };

  const generateQuizSummary = () => {
    return quiz.map((q, index) => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      return `
Question ${index + 1}: ${q.question}
Your Answer: ${q.userAnswer !== undefined ? q.options[q.userAnswer] : 'Not answered'}
Correct Answer: ${q.options[q.correctAnswer]}
Status: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
      `.trim();
    }).join('\n\n');
  };

  if (!quiz.length) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-gray-400">No quiz available</p>
      </div>
    );
  }

  if (isComplete) {
    const score = calculateScore();
    return (
      <div className="space-y-8">
        <Card className="p-8 bg-white/5">
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <div className="space-y-2">
              <p className="text-gray-400">Your Score</p>
              <p className="text-4xl font-bold">{score.toFixed(1)}%</p>
            </div>
            <Progress value={score} className="h-2" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Summary</h3>
              <div className="space-y-2">
                {quiz.map((question, index) => (
                  <div 
                    key={question.id}
                    className="flex items-center justify-between p-2 rounded bg-white/5"
                  >
                    <span className="text-sm">Question {index + 1}</span>
                    {question.userAnswer === question.correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz[currentIndex];
  const hasAnswered = currentQuestion.userAnswer !== undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz</h2>
        <div className="text-sm text-gray-400">
          Question {currentIndex + 1} of {quiz.length}
        </div>
      </div>

      <Progress value={(currentIndex / quiz.length) * 100} className="h-2" />

      <Card className="p-8 bg-white/5">
        <div className="space-y-8">
          <p className="text-xl">{currentQuestion.question}</p>
          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={hasAnswered ? "outline" : "default"}
                className={`
                  w-full justify-start p-4 h-auto text-left
                  ${hasAnswered && index === currentQuestion.correctAnswer
                    ? 'bg-green-500/20 border-green-500/50'
                    : hasAnswered && index === currentQuestion.userAnswer
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
                onClick={() => !hasAnswered && handleAnswer(index)}
                disabled={hasAnswered}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 