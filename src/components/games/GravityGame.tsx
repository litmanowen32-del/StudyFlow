import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FallingCard {
  id: string;
  term: string;
  answer: string;
  position: number;
  speed: number;
}

interface GravityGameProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const GravityGame = ({ flashcards, onComplete, onExit }: GravityGameProps) => {
  const [fallingCards, setFallingCards] = useState<FallingCard[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameLoopRef = useRef<number>();
  const nextCardTimeRef = useRef(0);

  useEffect(() => {
    startGame();
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const startGame = () => {
    nextCardTimeRef.current = Date.now() + 2000;
    gameLoop();
  };

  const spawnCard = () => {
    if (flashcards.length === 0) return;
    const card = flashcards[Math.floor(Math.random() * flashcards.length)];
    const newCard: FallingCard = {
      id: `${card.id}-${Date.now()}`,
      term: card.front,
      answer: card.back.toLowerCase().trim(),
      position: 0,
      speed: 0.15 + Math.random() * 0.15,
    };
    setFallingCards(prev => [...prev, newCard]);
  };

  const gameLoop = () => {
    setFallingCards(prev => {
      const updated = prev.map(card => ({
        ...card,
        position: card.position + card.speed
      })).filter(card => {
        if (card.position >= 100) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) setIsGameOver(true);
            return newLives;
          });
          return false;
        }
        return true;
      });
      return updated;
    });

    if (Date.now() >= nextCardTimeRef.current && !isGameOver) {
      spawnCard();
      nextCardTimeRef.current = Date.now() + 3000;
    }

    if (!isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const answer = currentAnswer.toLowerCase().trim();
    
    if (!answer || fallingCards.length === 0) return;

    // Check answer with AI
    const cardToCheck = fallingCards[0]; // Check against the first falling card
    try {
      const { data, error } = await supabase.functions.invoke('check-gravity-answer', {
        body: { 
          userAnswer: answer,
          correctAnswer: cardToCheck.answer
        }
      });

      if (error) throw error;

      if (data.isCorrect) {
        setScore(s => s + 10);
        setCurrentAnswer("");
        setFallingCards(prev => prev.filter((_, idx) => idx !== 0));
      }
    } catch (err) {
      console.error('Error checking answer:', err);
    }
  };

  useEffect(() => {
    if (isGameOver) {
      onComplete(score);
    }
  }, [isGameOver]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onExit}>← Back</Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Gravity Game
          </h2>
          <div className="flex gap-4 justify-center text-sm">
            <span>Score: {score}</span>
            <span>Lives: {"❤️".repeat(lives)}</span>
          </div>
        </div>
        <div className="w-20" />
      </div>

      <Card className="p-6 relative h-96 bg-gradient-subtle overflow-hidden">
        {fallingCards.map(card => (
          <div
            key={card.id}
            className="absolute left-1/2 -translate-x-1/2 transition-none"
            style={{ 
              top: `${card.position}%`,
              width: '200px'
            }}
          >
            <Card className="p-3 bg-primary/20 border-primary text-center animate-pulse-glow">
              <p className="font-medium">{card.term}</p>
            </Card>
          </div>
        ))}
        
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">Game Over!</h3>
              <p className="text-xl mb-2">Final Score: {score}</p>
              <p className="text-muted-foreground">XP Earned: {Math.floor(score / 10)}</p>
            </div>
          </div>
        )}
      </Card>

      <form onSubmit={handleAnswer} className="flex gap-2">
        <Input
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type the answer..."
          disabled={isGameOver}
          className="text-lg"
        />
        <Button type="submit" disabled={isGameOver}>Submit</Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Type the answer for the falling terms before they reach the bottom!
      </p>
    </div>
  );
};
