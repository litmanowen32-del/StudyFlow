import { Plus, Trophy, Target, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Goals = () => {
  const goals = [
    { title: "Complete 100 Study Hours", progress: 67, icon: Clock, streak: 12 },
    { title: "Maintain 90+ Average", progress: 85, icon: Target, streak: 8 },
    { title: "Finish All Assignments Early", progress: 42, icon: Zap, streak: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals</h1>
            <p className="text-muted-foreground">Set and track your academic milestones</p>
          </div>
          <Button className="bg-gradient-primary shadow-glow">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
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
            const Icon = goal.icon;
            return (
              <Card key={index} className="p-6 shadow-soft transition-all hover:shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{goal.title}</h3>
                      <Progress value={goal.progress} className="mb-2 h-2" />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{goal.progress}% Complete</span>
                        <span>•</span>
                        <span>🔥 {goal.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Goals;
