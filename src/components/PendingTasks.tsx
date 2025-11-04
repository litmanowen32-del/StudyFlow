import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, startOfWeek } from "date-fns";

export const PendingTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (user) fetchPendingTasks();
  }, [user]);

  const fetchPendingTasks = async () => {
    // Get tasks that aren't completed and don't have calendar events
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .eq("completed", false);

    if (tasks) {
      // Check which tasks already have calendar events
      const { data: events } = await supabase
        .from("calendar_events")
        .select("title")
        .eq("user_id", user?.id);

      const eventTitles = new Set(events?.map(e => e.title.replace("📝 ", "")) || []);
      const pending = tasks.filter(t => !eventTitles.has(t.title));
      setPendingTasks(pending);
    }
  };

  const scheduleWithAI = async () => {
    if (pendingTasks.length === 0) {
      toast({ title: "No pending tasks to schedule" });
      return;
    }

    setIsScheduling(true);
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: existingEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user?.id)
        .gte("start_time", weekStart.toISOString())
        .lte("start_time", addDays(weekStart, 7).toISOString());

      const { data, error } = await supabase.functions.invoke('suggest-time-slots', {
        body: {
          tasks: pendingTasks,
          existingEvents: existingEvents || [],
          startDate: weekStart.toISOString(),
          endDate: addDays(weekStart, 7).toISOString()
        }
      });

      if (error) throw error;

      if (data.suggestions && data.suggestions.length > 0) {
        for (const suggestion of data.suggestions) {
          const task = pendingTasks.find(t => t.id === suggestion.task_id);
          if (task) {
            await supabase.from("calendar_events").insert({
              user_id: user?.id,
              title: task.title,
              description: `${task.description || ''}\n\nAI Suggestion: ${suggestion.reason}`,
              start_time: suggestion.suggested_start,
              end_time: suggestion.suggested_end,
              event_type: "study",
              subject: task.subject,
              calendar_view: "hourly"
            });
          }
        }
        
        toast({
          title: "Tasks scheduled!",
          description: `AI added ${data.suggestions.length} study sessions to your calendar`,
        });
        fetchPendingTasks();
      } else {
        toast({
          title: "No suggestions available",
          description: "Try adding more time slots to your calendar",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule tasks",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (pendingTasks.length === 0) return null;

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-gradient-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <Badge variant="secondary">{pendingTasks.length}</Badge>
        </div>
        <Button 
          onClick={scheduleWithAI}
          disabled={isScheduling}
          className="gap-2 bg-gradient-primary"
        >
          <Sparkles className="h-4 w-4" />
          {isScheduling ? "Scheduling..." : "Schedule with AI"}
        </Button>
      </div>
      <div className="space-y-2">
        {pendingTasks.slice(0, 5).map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <div>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-muted-foreground">
                {task.subject} • {task.priority} priority
                {task.due_date && ` • Due ${new Date(task.due_date).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        ))}
        {pendingTasks.length > 5 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{pendingTasks.length - 5} more tasks
          </p>
        )}
      </div>
    </Card>
  );
};