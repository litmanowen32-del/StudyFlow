import { useState, useEffect } from "react";
import { Plus, Trophy, Target, Zap, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    goal_type: "short_term",
    target_value: "",
    unit: "",
    target_date: "",
  });

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) setGoals(data);
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) {
      toast({ title: "Please enter a goal title", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user?.id,
      title: newGoal.title,
      description: newGoal.description,
      goal_type: newGoal.goal_type,
      target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
      unit: newGoal.unit,
      target_date: newGoal.target_date || null,
    });

    if (!error) {
      toast({ title: "Goal created!" });
      setNewGoal({ title: "", description: "", goal_type: "short_term", target_value: "", unit: "", target_date: "" });
      setOpen(false);
      fetchGoals();
    }
  };

  const calculateProgress = (goal: any) => {
    if (!goal.target_value || !goal.current_value) return 0;
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  };

  const getGoalIcon = (index: number) => {
    const icons = [Clock, Target, Zap];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Set and track your academic milestones</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Complete 100 study hours"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select
                    value={newGoal.goal_type}
                    onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short Term</SelectItem>
                      <SelectItem value="long_term">Long Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-value">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="hours"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Why is this goal important?"
                  />
                </div>
                <Button onClick={createGoal} className="w-full">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8 bg-gradient-primary p-8 text-primary-foreground shadow-glow">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4">
              <Trophy className="h-12 w-12" />
            </div>
            <div>
              <div className="text-4xl font-bold">15</div>
              <div className="text-primary-foreground/80">Goals Achieved This Semester</div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {goals.map((goal, index) => {
            const Icon = getGoalIcon(index);
            const progress = calculateProgress(goal);
            return (
              <Card key={goal.id} className="p-6 shadow-soft transition-all hover:shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{goal.title}</h3>
                      {goal.description && (
                        <p className="mb-2 text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <Progress value={progress} className="mb-2 h-2" />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{progress}% Complete</span>
                        {goal.target_value && goal.unit && (
                          <>
                            <span>•</span>
                            <span>{goal.current_value || 0} / {goal.target_value} {goal.unit}</span>
                          </>
                        )}
                        {goal.target_date && (
                          <>
                            <span>•</span>
                            <span>Due {new Date(goal.target_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="p-12 text-center shadow-soft">
            <p className="text-muted-foreground">No goals yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Goals;
