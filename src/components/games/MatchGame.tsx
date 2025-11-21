import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface MatchGameProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const MatchGame = ({ flashcards, onComplete, onExit }: MatchGameProps) => {
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [gameCards, setGameCards] = useState<any[]>([]);

  useEffect(() => {
    // Shuffle cards for the game
    const terms = flashcards.map(card => ({ id: card.id, text: card.front, type: 'term' }));
    const definitions = [...flashcards].sort(() => Math.random() - 0.5).map(card => ({ id: card.id, text: card.back, type: 'definition' }));
    setGameCards([...terms, ...definitions].sort(() => Math.random() - 0.5));
  }, [flashcards]);

  const handleCardClick = (cardId: string, type: string) => {
    const fullId = `${type}-${cardId}`;
    
    if (matchedPairs.includes(cardId)) return;
    if (selectedTerms.includes(fullId)) {
      setSelectedTerms(selectedTerms.filter(id => id !== fullId));
      return;
    }

    const newSelected = [...selectedTerms, fullId];
    
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const [firstType, firstId] = first.split('-');
      const [secondType, secondId] = second.split('-');
      
      if (firstType !== secondType && firstId === secondId) {
        setMatchedPairs([...matchedPairs, firstId]);
        setSelectedTerms([]);
        
        if (matchedPairs.length + 1 === flashcards.length) {
          const timeTaken = Math.floor((Date.now() - startTime) / 1000);
          const score = Math.max(100 - timeTaken, 20);
          setTimeout(() => onComplete(score), 500);
        }
      } else {
        setTimeout(() => setSelectedTerms([]), 800);
      }
    } else {
      setSelectedTerms(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onExit}>← Back</Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Match Game
          </h2>
          <p className="text-muted-foreground">
            Matched: {matchedPairs.length} / {flashcards.length}
          </p>
        </div>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
        {gameCards.map((item, idx) => (
          <Card
            key={`${item.type}-${item.id}-${idx}`}
            className={`p-4 cursor-pointer transition-all min-h-24 flex items-center justify-center text-center ${
              matchedPairs.includes(item.id)
                ? 'opacity-50 bg-success/20 border-success'
                : selectedTerms.includes(`${item.type}-${item.id}`)
                ? 'ring-2 ring-primary scale-105'
                : 'hover:shadow-glow hover:scale-105'
            }`}
            onClick={() => handleCardClick(item.id, item.type)}
          >
            <p className="text-sm font-medium">{item.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
