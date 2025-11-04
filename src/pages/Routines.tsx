import { useState, useEffect } from "react";
import { Plus, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const Routines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: "",
    description: "",
    schedule_type: "daily",
    time_of_day: "09:00",
  });

  useEffect(() => {
    if (user) fetchRoutines();
  }, [user]);

  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) setRoutines(data);
  };

  const createRoutine = async () => {
    if (!newRoutine.name.trim()) return;

    const { error } = await supabase.from("routines").insert({
      user_id: user?.id,
      name: newRoutine.name,
      description: newRoutine.description,
      schedule_type: newRoutine.schedule_type,
      time_of_day: newRoutine.time_of_day,
    });

    if (!error) {
      toast({ title: "Routine created!" });
      setNewRoutine({ name: "", description: "", schedule_type: "daily", time_of_day: "09:00" });
      setOpen(false);
      fetchRoutines();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Routine Builder</h1>
            <p className="text-muted-foreground">Create personalized daily and weekly routines</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4" />
                New Routine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Routine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Routine Name</Label>
                  <Input
                    id="name"
                    value={newRoutine.name}
                    onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                    placeholder="Morning Study Session"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
                    placeholder="Review notes and complete assignments"
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select
                    value={newRoutine.schedule_type}
                    onValueChange={(value) => setNewRoutine({ ...newRoutine, schedule_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time of Day</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newRoutine.time_of_day}
                    onChange={(e) => setNewRoutine({ ...newRoutine, time_of_day: e.target.value })}
                  />
                </div>
                <Button onClick={createRoutine} className="w-full">Create Routine</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {routines.map((routine) => (
            <Card key={routine.id} className="p-6 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{routine.name}</h3>
                  {routine.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{routine.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {routine.time_of_day}
                    </div>
                    <span className="capitalize">{routine.schedule_type}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {routines.length === 0 && (
          <Card className="p-12 text-center shadow-soft">
            <p className="text-muted-foreground">No routines yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Routines;