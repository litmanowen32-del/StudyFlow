import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const Tasks = () => {
  const [tasks] = useState([
    { id: 1, title: "Complete Math Assignment", priority: "high", subject: "Mathematics", due: "2 days", completed: false },
    { id: 2, title: "Read History Chapter 5", priority: "medium", subject: "History", due: "4 days", completed: false },
    { id: 3, title: "Prepare Chemistry Lab Report", priority: "high", subject: "Chemistry", due: "1 day", completed: false },
    { id: 4, title: "Review English Notes", priority: "low", subject: "English", due: "1 week", completed: true },
    { id: 5, title: "Physics Problem Set", priority: "medium", subject: "Physics", due: "3 days", completed: false },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage and prioritize your assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Active Tasks</h2>
            <div className="space-y-3">
              {tasks.filter(t => !t.completed).map((task) => (
                <Card key={task.id} className="p-4 shadow-soft transition-all hover:shadow-glow">
                  <div className="flex items-start gap-3">
                    <Checkbox className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-card-foreground">{task.title}</h3>
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{task.subject}</span>
                        <span>•</span>
                        <span>Due in {task.due}</span>
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
                    <Checkbox checked className="mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground line-through">{task.title}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{task.subject}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
