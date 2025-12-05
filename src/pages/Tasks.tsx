import { useState, useEffect } from "react";
import { Plus, Filter, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    subject: "",
    due_date: "",
  });

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .order("due_date", { ascending: true });
    
    if (!error && data) setTasks(data);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast({ title: "Please enter a task title", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: user?.id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      subject: newTask.subject,
      due_date: newTask.due_date || null,
    });

    if (!error) {
      toast({ 
        title: "Task created!", 
        description: "Visit the Calendar to schedule it with AI"
      });
      setNewTask({ title: "", description: "", priority: "medium", subject: "", due_date: "" });
      setOpen(false);
      fetchTasks();
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    
    const { error } = await supabase
      .from("tasks")
      .update({ 
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null
      })
      .eq("id", taskId);

    if (!error) {
      // Award XP when completing a task
      if (!completed && task) {
        const xpReward = task.priority === 'high' ? 20 : task.priority === 'medium' ? 10 : 5;
        
        // Get current XP
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('study_buddy_xp, study_buddy_enabled')
          .eq('user_id', user?.id)
          .single();
        
        if (prefs?.study_buddy_enabled) {
          const newXp = (prefs.study_buddy_xp || 0) + xpReward;
          await supabase
            .from('user_preferences')
            .update({ study_buddy_xp: newXp })
            .eq('user_id', user?.id);
          
          toast({ 
            title: "Task completed! 🎉", 
            description: `You earned ${xpReward} XP! Feed your study buddy!` 
          });
        } else {
          toast({ title: "Task completed!" });
        }
      } else {
        toast({ title: "Task reopened" });
      }
      fetchTasks();
    }
  };

  const getDaysUntil = (dueDate: string) => {
    if (!dueDate) return { text: "No due date", isOverdue: false, days: null };
    const now = new Date();
    const due = new Date(dueDate);
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formattedDate = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (days < 0) return { text: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`, isOverdue: true, days, formattedDate };
    if (days === 0) return { text: "Due today", isOverdue: false, days: 0, formattedDate };
    if (days === 1) return { text: "Due tomorrow", isOverdue: false, days: 1, formattedDate };
    return { text: `Due in ${days} days`, isOverdue: false, days, formattedDate };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Task Management</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and prioritize your assignments
          </p>
        </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Complete assignment"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
                <Button onClick={createTask} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Active Tasks</h2>
            <div className="space-y-3">
              {tasks.filter(t => !t.completed).map((task) => (
                <Card key={task.id} className="p-4 shadow-soft transition-all hover:shadow-glow">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      className="mt-1" 
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id, task.completed)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-card-foreground">{task.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority) as any}>
                            {task.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={async () => {
                              await supabase.from("tasks").delete().eq("id", task.id);
                              toast({ title: "Task deleted" });
                              fetchTasks();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {task.subject && <span className="text-muted-foreground">{task.subject}</span>}
                        {task.subject && task.due_date && <span className="text-muted-foreground">•</span>}
                        {task.due_date && (() => {
                          const dueInfo = getDaysUntil(task.due_date);
                          return (
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${dueInfo.isOverdue ? 'text-destructive animate-pulse' : dueInfo.days === 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                                {dueInfo.text}
                              </span>
                              {dueInfo.formattedDate && (
                                <span className="text-xs text-muted-foreground/70">({dueInfo.formattedDate})</span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Completed Tasks</h2>
            <div className="space-y-3">
              {tasks.filter(t => t.completed).map((task) => (
                <Card key={task.id} className="p-4 opacity-60 shadow-soft">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked 
                      className="mt-1" 
                      onCheckedChange={() => toggleTask(task.id, task.completed)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-card-foreground line-through">{task.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={async () => {
                            await supabase.from("tasks").delete().eq("id", task.id);
                            toast({ title: "Task deleted" });
                            fetchTasks();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        {task.subject && <span>{task.subject}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Tasks;
