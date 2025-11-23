import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface BlastGameProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const BlastGame = ({ flashcards, onComplete, onExit }: BlastGameProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (flashcards.length > 0) {
      generateOptions();
    }
  }, [currentCardIndex, flashcards]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(score);
    }
  }, [timeLeft]);

  const generateOptions = () => {
    if (flashcards.length === 0) return;
    
    const currentCard = flashcards[currentCardIndex];
    const correctAnswer = currentCard.back;
    
    const wrongAnswers = flashcards
      .filter((_, idx) => idx !== currentCardIndex)
      .map(card => card.back)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswer = (answer: string) => {
    const currentCard = flashcards[currentCardIndex];
    const correct = answer === currentCard.back;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
    }

    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0);
      }
      setSelectedAnswer(null);
      setIsCorrect(null);
    }, 1000);
  };

  if (flashcards.length === 0) {
    return <div>No flashcards available</div>;
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onExit}>← Back</Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Blast Game
          </h2>
          <div className="flex gap-4 justify-center text-sm">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
        </div>
        <div className="w-20" />
      </div>

      <Card className="p-8 text-center shadow-glow border-primary/50 bg-gradient-card">
        <p className="text-sm text-muted-foreground mb-2">Question {currentCardIndex + 1} of {flashcards.length}</p>
        <h3 className="text-3xl font-bold mb-8">{currentCard.front}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {options.map((option, idx) => (
            <Button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              variant={
                selectedAnswer === option
                  ? isCorrect
                    ? "default"
                    : "destructive"
                  : "outline"
              }
              className={`h-auto py-6 px-6 text-base min-h-[80px] whitespace-normal transition-all ${
                selectedAnswer === option && isCorrect
                  ? "bg-success hover:bg-success"
                  : ""
              } ${
                selectedAnswer && option === currentCard.back && selectedAnswer !== option
                  ? "ring-2 ring-success"
                  : ""
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Answer as many questions correctly as you can before time runs out!
      </p>
    </div>
  );
};
