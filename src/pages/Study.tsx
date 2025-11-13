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
import { Plus, BookOpen, Trash2, Edit, Play, Shuffle } from "lucide-react";

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
  const [studyMode, setStudyMode] = useState<'view' | 'flashcards' | 'shuffle'>('view');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newSet, setNewSet] = useState({ title: '', description: '', subject: '' });
  const [newCard, setNewCard] = useState({ front: '', back: '' });

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
    const { data, error } = await supabase
      .from('study_sets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading study sets", variant: "destructive" });
    } else {
      setStudySets(data || []);
    }
  };

  const fetchFlashcards = async (setId: string) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('study_set_id', setId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: "Error loading flashcards", variant: "destructive" });
    } else {
      setFlashcards(data || []);
    }
  };

  const createStudySet = async () => {
    if (!user || !newSet.title.trim()) return;

    const { error } = await supabase
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

    const { error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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
        <div className="flex gap-2">
          <Button onClick={startFlashcards} disabled={flashcards.length === 0}>
            <Play className="w-4 h-4 mr-2" />
            Study
          </Button>
          <Button variant="outline" onClick={startShuffle} disabled={flashcards.length === 0}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
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
