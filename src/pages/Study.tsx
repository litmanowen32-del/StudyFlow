import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Trash2, Edit, Play, Shuffle, Sparkles, Trophy, PenTool, CheckCircle, Zap, Rocket } from "lucide-react";
import { MatchGame } from "@/components/games/MatchGame";
import { GravityGame } from "@/components/games/GravityGame";
import { BlastGame } from "@/components/games/BlastGame";

interface StudySet {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  created_at: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  study_set_id: string;
}

const Study = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [selectedSet, setSelectedSet] = useState<StudySet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [studyMode, setStudyMode] = useState<'view' | 'flashcards' | 'shuffle' | 'match' | 'write' | 'quiz' | 'match-game' | 'gravity-game' | 'blast-game'>('view');
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [writeAnswers, setWriteAnswers] = useState<{ [key: string]: string }>({});
  const [showWriteResults, setShowWriteResults] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newSet, setNewSet] = useState({ title: '', description: '', subject: '' });
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [isAiGenerateOpen, setIsAiGenerateOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCardCount, setAiCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudySets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSet) {
      fetchFlashcards(selectedSet.id);
    }
  }, [selectedSet]);

  const fetchStudySets = async () => {
    const { data, error } = await (supabase as any)
      .from('study_sets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading study sets", variant: "destructive" });
    } else {
      setStudySets((data as any) || []);
    }
  };

  const fetchFlashcards = async (setId: string) => {
    const { data, error } = await (supabase as any)
      .from('flashcards')
      .select('*')
      .eq('study_set_id', setId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: "Error loading flashcards", variant: "destructive" });
    } else {
      setFlashcards((data as any) || []);
    }
  };

  const createStudySet = async () => {
    if (!user || !newSet.title.trim()) return;

    const { error } = await (supabase as any)
      .from('study_sets')
      .insert([{ 
        user_id: user.id, 
        title: newSet.title,
        description: newSet.description || null,
        subject: newSet.subject || null
      }]);

    if (error) {
      toast({ title: "Error creating study set", variant: "destructive" });
    } else {
      toast({ title: "Study set created!" });
      setNewSet({ title: '', description: '', subject: '' });
      setIsCreateSetOpen(false);
      fetchStudySets();
    }
  };

  const createFlashcard = async () => {
    if (!user || !selectedSet || !newCard.front.trim() || !newCard.back.trim()) return;

    const { error } = await (supabase as any)
      .from('flashcards')
      .insert([{ 
        user_id: user.id,
        study_set_id: selectedSet.id,
        front: newCard.front,
        back: newCard.back
      }]);

    if (error) {
      toast({ title: "Error creating flashcard", variant: "destructive" });
    } else {
      toast({ title: "Flashcard created!" });
      setNewCard({ front: '', back: '' });
      setIsCreateCardOpen(false);
      fetchFlashcards(selectedSet.id);
    }
  };

  const deleteStudySet = async (id: string) => {
    const { error } = await (supabase as any)
      .from('study_sets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting study set", variant: "destructive" });
    } else {
      toast({ title: "Study set deleted" });
      if (selectedSet?.id === id) {
        setSelectedSet(null);
        setFlashcards([]);
      }
      fetchStudySets();
    }
  };

  const deleteFlashcard = async (id: string) => {
    const { error } = await (supabase as any)
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting flashcard", variant: "destructive" });
    } else {
      toast({ title: "Flashcard deleted" });
      if (selectedSet) {
        fetchFlashcards(selectedSet.id);
      }
    }
  };

  const generateFlashcardsWithAI = async () => {
    if (!aiTopic.trim()) {
      toast({ title: "Please enter a topic", variant: "destructive" });
      return;
    }

    if (!selectedSet) {
      toast({ title: "Please select a study set first", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: { 
          topic: aiTopic,
          count: aiCardCount 
        }
      });

      if (error) throw error;

      if (!data.success || !data.flashcards) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Insert all generated flashcards
      const flashcardsToInsert = data.flashcards.map((card: any) => ({
        user_id: user?.id,
        study_set_id: selectedSet.id,
        front: card.front,
        back: card.back
      }));

      const { error: insertError } = await (supabase as any)
        .from('flashcards')
        .insert(flashcardsToInsert);

      if (insertError) throw insertError;

      toast({ 
        title: "Flashcards generated!", 
        description: `Added ${data.flashcards.length} cards to your study set` 
      });
      
      setAiTopic("");
      setIsAiGenerateOpen(false);
      fetchFlashcards(selectedSet.id);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({ 
        title: "Failed to generate flashcards", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startFlashcards = () => {
    if (flashcards.length > 0) {
      setStudyMode('flashcards');
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const startShuffle = () => {
    if (flashcards.length > 0) {
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
      setStudyMode('shuffle');
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const startMatchGame = () => {
    if (flashcards.length > 0) {
      setStudyMode('match');
      setMatchedPairs([]);
      setSelectedTerms([]);
    }
  };

  const startWriteMode = () => {
    if (flashcards.length > 0) {
      setStudyMode('write');
      setWriteAnswers({});
      setShowWriteResults(false);
    }
  };

  const generateAIQuiz = async () => {
    if (flashcards.length === 0) {
      toast({ title: "No flashcards available", variant: "destructive" });
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const flashcardsData = flashcards.map(card => ({
        term: card.front,
        definition: card.back
      }));

      const { data, error } = await supabase.functions.invoke('generate-ai-test', {
        body: { 
          flashcards: flashcardsData,
          setTitle: selectedSet?.title || 'Study Set'
        }
      });

      if (error) throw error;

      if (!data.success || !data.questions) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuizQuestions(data.questions);
      setQuizAnswers({});
      setShowQuizResults(false);
      setCurrentQuizIndex(0);
      setStudyMode('quiz');
      
      toast({ 
        title: "AI Quiz Generated!", 
        description: `Created ${data.questions.length} questions based on your flashcards` 
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({ 
        title: "Failed to generate quiz", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleMatchClick = (cardId: string, type: 'term' | 'definition') => {
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
          toast({ title: "Congratulations! 🎉", description: "You matched all pairs!" });
        }
      } else {
        setTimeout(() => setSelectedTerms([]), 800);
      }
    } else {
      setSelectedTerms(newSelected);
    }
  };

  const checkWriteAnswers = () => {
    setShowWriteResults(true);
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
  };

  const handleGameComplete = async (score: number, gameType: string) => {
    const xpEarned = Math.floor(score / 10);
    
    // Award XP to study buddy
    if (user) {
      const { data: prefs } = await (supabase as any)
        .from('user_preferences')
        .select('study_buddy_xp, study_buddy_enabled')
        .eq('user_id', user.id)
        .single();

      if (prefs?.study_buddy_enabled) {
        await (supabase as any)
          .from('user_preferences')
          .update({ 
            study_buddy_xp: (prefs.study_buddy_xp || 0) + xpEarned 
          })
          .eq('user_id', user.id);

        toast({ 
          title: `🎮 Game Complete!`, 
          description: `Score: ${score} | +${xpEarned} XP for your study buddy!` 
        });
      }
    }
    
    setStudyMode('view');
  };

  if (studyMode === 'match-game') {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <MatchGame 
          flashcards={flashcards}
          onComplete={(score) => handleGameComplete(score, 'match')}
          onExit={() => setStudyMode('view')}
        />
      </div>
    );
  }

  if (studyMode === 'gravity-game') {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <GravityGame 
          flashcards={flashcards}
          onComplete={(score) => handleGameComplete(score, 'gravity')}
          onExit={() => setStudyMode('view')}
        />
      </div>
    );
  }

  if (studyMode === 'blast-game') {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <BlastGame 
          flashcards={flashcards}
          onComplete={(score) => handleGameComplete(score, 'blast')}
          onExit={() => setStudyMode('view')}
        />
      </div>
    );
  }

  if (!selectedSet) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Study Sets</h1>
            <p className="text-muted-foreground">Create and study flashcard sets</p>
          </div>
          <Dialog open={isCreateSetOpen} onOpenChange={setIsCreateSetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Set
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Set</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newSet.title}
                    onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                    placeholder="e.g., Spanish Vocabulary"
                  />
                </div>
                <div>
                  <Label>Subject (optional)</Label>
                  <Input
                    value={newSet.subject}
                    onChange={(e) => setNewSet({ ...newSet, subject: e.target.value })}
                    placeholder="e.g., Spanish"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={newSet.description}
                    onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                    placeholder="Describe this study set..."
                  />
                </div>
                <Button onClick={createStudySet} className="w-full">Create Set</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studySets.map((set) => (
            <Card key={set.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div onClick={() => setSelectedSet(set)}>
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{set.title}</h3>
                {set.subject && (
                  <p className="text-sm text-muted-foreground mb-2">{set.subject}</p>
                )}
                {set.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{set.description}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStudySet(set.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {studySets.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No study sets yet</h3>
            <p className="text-muted-foreground mb-4">Create your first study set to get started</p>
          </div>
        )}
      </div>
    );
  }

  if (studyMode === 'match') {
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    const terms = shuffledFlashcards.map(card => ({ id: card.id, text: card.front, type: 'term' as const }));
    const definitions = [...shuffledFlashcards].sort(() => Math.random() - 0.5).map(card => ({ id: card.id, text: card.back, type: 'definition' as const }));
    
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => {
            setStudyMode('view');
            setMatchedPairs([]);
            setSelectedTerms([]);
          }}>
            ← Back to Set
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Match Game
          </h2>
          <p className="text-muted-foreground">
            Matched: {matchedPairs.length} / {flashcards.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-3">Terms</h3>
            {terms.map(item => (
              <Card
                key={`term-${item.id}`}
                className={`p-4 cursor-pointer transition-all ${
                  matchedPairs.includes(item.id)
                    ? 'opacity-50 bg-green-100 dark:bg-green-900'
                    : selectedTerms.includes(`term-${item.id}`)
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleMatchClick(item.id, 'term')}
              >
                <p className="text-sm">{item.text}</p>
              </Card>
            ))}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-3">Definitions</h3>
            {definitions.map(item => (
              <Card
                key={`def-${item.id}`}
                className={`p-4 cursor-pointer transition-all ${
                  matchedPairs.includes(item.id)
                    ? 'opacity-50 bg-green-100 dark:bg-green-900'
                    : selectedTerms.includes(`definition-${item.id}`)
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleMatchClick(item.id, 'definition')}
              >
                <p className="text-sm">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (studyMode === 'write') {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => {
            setStudyMode('view');
            setWriteAnswers({});
            setShowWriteResults(false);
          }}>
            ← Back to Set
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <PenTool className="w-6 h-6 text-primary" />
            Write Mode
          </h2>
          <p className="text-muted-foreground">Type the correct answer for each term</p>
        </div>

        <div className="space-y-4">
          {flashcards.map((card, index) => {
            const isCorrect = writeAnswers[card.id]?.toLowerCase().trim() === card.back.toLowerCase().trim();
            return (
              <Card key={card.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Label className="text-lg font-semibold mb-2">
                      {index + 1}. {card.front}
                    </Label>
                    <Input
                      value={writeAnswers[card.id] || ''}
                      onChange={(e) => setWriteAnswers({ ...writeAnswers, [card.id]: e.target.value })}
                      placeholder="Type your answer..."
                      disabled={showWriteResults}
                      className={showWriteResults ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}
                    />
                    {showWriteResults && !isCorrect && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Correct answer: {card.back}
                      </p>
                    )}
                  </div>
                  {showWriteResults && (
                    <div className="mt-2">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          {!showWriteResults ? (
            <Button onClick={checkWriteAnswers} size="lg">
              Check Answers
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-xl font-bold mb-4">
                Score: {Object.keys(writeAnswers).filter(id => 
                  writeAnswers[id]?.toLowerCase().trim() === 
                  flashcards.find(c => c.id === id)?.back.toLowerCase().trim()
                ).length} / {flashcards.length}
              </p>
              <Button onClick={() => {
                setWriteAnswers({});
                setShowWriteResults(false);
              }}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (studyMode === 'quiz') {
    if (quizQuestions.length === 0) return null;

    const currentQuestion = quizQuestions[currentQuizIndex];
    
    if (showQuizResults) {
      const score = Object.values(quizAnswers).filter((answer, idx) => 
        answer === quizQuestions[idx]?.correctAnswer
      ).length;
      
      return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-5xl font-bold text-primary mb-2">
              {score} / {quizQuestions.length}
            </p>
            <p className="text-xl text-muted-foreground">
              {Math.round((score / quizQuestions.length) * 100)}% Correct
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {quizQuestions.map((q, idx) => {
              const userAnswer = quizAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-2">{q.question}</p>
                      <div className="space-y-1 text-sm">
                        <p className={userAnswer === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                          Your answer: {userAnswer}
                        </p>
                        {!isCorrect && (
                          <p className="text-muted-foreground">
                            Correct answer: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => {
              setStudyMode('view');
              setQuizAnswers({});
              setShowQuizResults(false);
              setCurrentQuizIndex(0);
            }}>
              Back to Set
            </Button>
            <Button variant="outline" onClick={generateAIQuiz}>
              Generate New Quiz
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => {
            setStudyMode('view');
            setQuizAnswers({});
            setShowQuizResults(false);
          }}>
            ← Back to Set
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">AI Generated Quiz</h2>
          <p className="text-muted-foreground">
            Question {currentQuizIndex + 1} of {quizQuestions.length}
          </p>
        </div>

        <Card className="p-8 mb-6">
          <p className="text-xl font-semibold mb-6">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, idx: number) => (
              <Card
                key={idx}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  quizAnswers[currentQuizIndex] === option ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: option })}
              >
                <p>{option}</p>
              </Card>
            ))}
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
            disabled={currentQuizIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuizIndex < quizQuestions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
              disabled={!quizAnswers[currentQuizIndex]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (studyMode === 'flashcards' || studyMode === 'shuffle') {
    const currentCard = flashcards[currentCardIndex];
    
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => {
            setStudyMode('view');
            setCurrentCardIndex(0);
            setIsFlipped(false);
          }}>
            ← Back to Set
          </Button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{selectedSet.title}</h2>
          <p className="text-muted-foreground">
            Card {currentCardIndex + 1} of {flashcards.length}
          </p>
        </div>

        <div 
          className="relative h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}>
            <div className={`text-center ${isFlipped ? 'hidden' : 'block'}`}>
              <p className="text-sm text-muted-foreground mb-4">Front</p>
              <p className="text-2xl font-medium">{currentCard?.front}</p>
            </div>
            <div className={`text-center ${isFlipped ? 'block' : 'hidden'}`}>
              <p className="text-sm text-muted-foreground mb-4">Back</p>
              <p className="text-2xl font-medium">{currentCard?.back}</p>
            </div>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setIsFlipped(!isFlipped)}
          >
            Flip Card
          </Button>
          <Button
            variant="outline"
            onClick={nextCard}
            disabled={currentCardIndex === flashcards.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => {
          setSelectedSet(null);
          setFlashcards([]);
        }}>
          ← Back to Sets
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{selectedSet.title}</h1>
          {selectedSet.subject && (
            <p className="text-muted-foreground">{selectedSet.subject}</p>
          )}
        </div>
        <Tabs defaultValue="study" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="study">Study Modes</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
          </TabsList>
          
          <TabsContent value="study" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={startFlashcards} disabled={flashcards.length === 0}>
                <Play className="w-4 h-4 mr-2" />
                Flashcards
              </Button>
              <Button variant="outline" onClick={startShuffle} disabled={flashcards.length === 0}>
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
              <Button variant="outline" onClick={startWriteMode} disabled={flashcards.length === 0}>
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </Button>
              <Button 
                variant="outline" 
                onClick={generateAIQuiz} 
                disabled={flashcards.length === 0 || isGeneratingQuiz}
              >
                {isGeneratingQuiz ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quiz
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="games" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" onClick={() => setStudyMode('match-game')} disabled={flashcards.length < 6}>
                <Trophy className="w-4 h-4 mr-2" />
                Match Game
              </Button>
              <Button variant="outline" onClick={() => setStudyMode('gravity-game')} disabled={flashcards.length === 0}>
                <Rocket className="w-4 h-4 mr-2" />
                Gravity Game
              </Button>
              <Button variant="outline" onClick={() => setStudyMode('blast-game')} disabled={flashcards.length === 0}>
                <Zap className="w-4 h-4 mr-2" />
                Blast Game
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-center"
        >
          <Dialog open={isAiGenerateOpen} onOpenChange={setIsAiGenerateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Flashcards with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Topic</Label>
                  <Input
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, World War II, JavaScript Basics"
                  />
                </div>
                <div>
                  <Label>Number of Cards</Label>
                  <Input
                    type="number"
                    min="3"
                    max="20"
                    value={aiCardCount}
                    onChange={(e) => setAiCardCount(parseInt(e.target.value) || 10)}
                  />
                </div>
                <Button 
                  onClick={generateFlashcardsWithAI} 
                  className="w-full gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Flashcard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Front</Label>
                  <Textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    placeholder="Question or term..."
                  />
                </div>
                <div>
                  <Label>Back</Label>
                  <Textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    placeholder="Answer or definition..."
                  />
                </div>
                <Button onClick={createFlashcard} className="w-full">Create Card</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {flashcards.map((card, index) => (
          <Card key={card.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Front</p>
                  <p className="font-medium">{card.front}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Back</p>
                  <p className="font-medium">{card.back}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteFlashcard(card.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {flashcards.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
          <p className="text-muted-foreground mb-4">Add your first flashcard to start studying</p>
        </div>
      )}
    </div>
  );
};

export default Study;
