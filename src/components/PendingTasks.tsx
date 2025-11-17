import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date?: string;
}

interface TimeSlotSuggestion {
  task_id: string;
  suggested_start: string;
  suggested_end: string;
  reason: string;
}

export const PendingTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [suggestions, setSuggestions] = useState<TimeSlotSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);

  useEffect(() => {
    if (user) fetchPendingTasks();
  }, [user]);

  const fetchPendingTasks = async () => {
    // Get all incomplete tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .eq("completed", false);

    if (!tasks) return;

    // Get tasks that already have calendar events
    const { data: scheduledEvents } = await supabase
      .from("calendar_events")
      .select("title")
      .eq("user_id", user?.id);

    const scheduledTitles = new Set(scheduledEvents?.map(e => e.title) || []);
    const unscheduled = tasks.filter(task => !scheduledTitles.has(task.title));
    
    setPendingTasks(unscheduled);
  };

  const scheduleWithAI = async () => {
    if (pendingTasks.length === 0) {
      toast({ title: "No pending tasks to schedule", variant: "destructive" });
      return;
    }

    setIsScheduling(true);
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('sleep_start_time, sleep_end_time')
        .eq('user_id', user?.id)
        .single();

      const { data: existingEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user?.id)
        .gte("start_time", weekStart.toISOString())
        .lte("start_time", weekEnd.toISOString());

      const { data, error } = await supabase.functions.invoke("suggest-time-slots", {
        body: {
          tasks: pendingTasks,
          existingEvents: existingEvents || [],
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          sleepStart: prefs?.sleep_start_time?.slice(0, 5) || '23:00',
          sleepEnd: prefs?.sleep_end_time?.slice(0, 5) || '07:00',
        },
      });

      if (error) throw error;

      if (data?.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setSelectedSuggestions(new Set(data.suggestions.map((s: TimeSlotSuggestion) => s.task_id)));
        setShowSuggestionsDialog(true);
        toast({ title: "AI generated scheduling suggestions!" });
      } else {
        toast({ title: "No suitable time slots found", variant: "destructive" });
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      toast({ 
        title: "Failed to generate suggestions", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const applySuggestions = async () => {
    const selectedSlots = suggestions.filter(s => selectedSuggestions.has(s.task_id));
    
    if (selectedSlots.length === 0) {
      toast({ title: "Please select at least one suggestion", variant: "destructive" });
      return;
    }

    try {
      const eventsToCreate = selectedSlots.map(slot => {
        const task = pendingTasks.find(t => t.id === slot.task_id);
        return {
          user_id: user?.id,
          title: task?.title || "Scheduled Task",
          start_time: slot.suggested_start,
          end_time: slot.suggested_end,
          event_type: "study",
          calendar_view: "both",
        };
      });

      const { error } = await supabase
        .from("calendar_events")
        .insert(eventsToCreate);

      if (error) throw error;

      toast({ title: `Scheduled ${selectedSlots.length} task(s) successfully!` });
      setShowSuggestionsDialog(false);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      fetchPendingTasks();
    } catch (error) {
      console.error("Error creating events:", error);
      toast({ title: "Failed to create events", variant: "destructive" });
    }
  };

  const toggleSuggestion = (taskId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedSuggestions(newSelected);
  };

  const getTaskTitle = (taskId: string) => {
    return pendingTasks.find(t => t.id === taskId)?.title || "Unknown Task";
  };

  if (pendingTasks.length === 0) return null;

  return (
    <>
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Pending Tasks</h3>
              <Badge variant="secondary">{pendingTasks.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These tasks haven't been scheduled yet. Let AI suggest optimal time slots!
            </p>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full ${
                    task.priority === "high" ? "bg-red-500" :
                    task.priority === "medium" ? "bg-orange-500" :
                    "bg-green-500"
                  }`} />
                  <span className="font-medium">{task.title}</span>
                  {task.due_date && (
                    <span className="text-muted-foreground text-xs">
                      Due: {format(new Date(task.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              ))}
              {pendingTasks.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{pendingTasks.length - 5} more tasks
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={scheduleWithAI}
            disabled={isScheduling}
            className="gap-2 bg-gradient-primary"
          >
            <Sparkles className="h-4 w-4" />
            {isScheduling ? "Generating..." : "Schedule with AI"}
          </Button>
        </div>
      </Card>

      <Dialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Scheduling Suggestions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the time slots you'd like to schedule:
            </p>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.task_id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={selectedSuggestions.has(suggestion.task_id)}
                  onCheckedChange={() => toggleSuggestion(suggestion.task_id)}
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{getTaskTitle(suggestion.task_id)}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(suggestion.suggested_start), "MMM d, h:mm a")} - 
                      {format(new Date(suggestion.suggested_end), "h:mm a")}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{suggestion.reason}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={applySuggestions} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Apply Selected ({selectedSuggestions.size})
              </Button>
              <Button variant="outline" onClick={() => setShowSuggestionsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};