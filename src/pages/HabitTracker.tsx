import { useState, useEffect } from "react";
import { Plus, Flame, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HabitTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", description: "" });

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) setHabits(data);
  };

  const createHabit = async () => {
    if (!newHabit.name.trim()) return;

    const { error } = await supabase.from("habits").insert({
      user_id: user?.id,
      name: newHabit.name,
      description: newHabit.description,
    });

    if (!error) {
      toast({ title: "Habit created!" });
      setNewHabit({ name: "", description: "" });
      setOpen(false);
      fetchHabits();
    }
  };

  const completeHabit = async (habitId: string) => {
    const { error } = await supabase.from("habit_completions").insert({
      habit_id: habitId,
      user_id: user?.id,
    });

    if (!error) {
      const habit = habits.find(h => h.id === habitId);
      await supabase
        .from("habits")
        .update({ 
          streak_count: (habit.streak_count || 0) + 1,
          last_completed_at: new Date().toISOString()
        })
        .eq("id", habitId);
      
      toast({ title: "Great job! Streak continued! 🔥" });
      fetchHabits();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Habit Tracker</h1>
            <p className="text-muted-foreground">Build consistency with daily check-ins</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Habit Name</Label>
                  <Input
                    id="name"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="Study for 30 minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    placeholder="Focus on difficult subjects"
                  />
                </div>
                <Button onClick={createHabit} className="w-full">Create Habit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {habits.map((habit) => (
            <Card key={habit.id} className="p-6 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{habit.name}</h3>
                  {habit.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{habit.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{habit.streak_count || 0} day streak</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => completeHabit(habit.id)}
                  className="shrink-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {habits.length === 0 && (
          <Card className="p-12 text-center shadow-soft">
            <p className="text-muted-foreground">No habits yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;