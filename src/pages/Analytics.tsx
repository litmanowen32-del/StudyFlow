import { useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle, Target, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studyHours: 0,
    tasksCompleted: 0,
    goalsAchieved: 0,
    productivityScore: 0
  });

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch study sessions
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", user?.id)
      .gte("started_at", weekAgo.toISOString());

    // Fetch completed tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .eq("completed", true)
      .gte("completed_at", weekAgo.toISOString());

    // Fetch achieved goals
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .eq("completed", true);

    // Calculate stats
    const totalHours = (sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0) / 60;
    const completedTasks = tasks?.length || 0;
    const achievedGoals = goals?.length || 0;
    
    // Simple productivity score based on activity
    const productivity = Math.min(100, Math.round(
      (totalHours * 2) + (completedTasks * 1.5) + (achievedGoals * 3)
    ));

    setStats({
      studyHours: totalHours,
      tasksCompleted: completedTasks,
      goalsAchieved: achievedGoals,
      productivityScore: productivity
    });
  };

  const statsData = [
    { 
      icon: Clock, 
      label: "Study Hours This Week", 
      value: stats.studyHours.toFixed(1), 
      change: "+12%", 
      color: "text-primary" 
    },
    { 
      icon: CheckCircle, 
      label: "Tasks Completed", 
      value: stats.tasksCompleted.toString(), 
      change: "+8%", 
      color: "text-success" 
    },
    { 
      icon: Target, 
      label: "Goals Achieved", 
      value: stats.goalsAchieved.toString(), 
      change: "+25%", 
      color: "text-accent" 
    },
    { 
      icon: TrendingUp, 
      label: "Productivity Score", 
      value: `${stats.productivityScore}%`, 
      change: "+5%", 
      color: "text-warning" 
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Performance Insights</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your progress and study patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-6 shadow-soft border-border/50 hover:shadow-glow transition-all animate-fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-primary/10 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-success">{stat.change}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Study Habits</h2>
          <p className="text-muted-foreground">
            {stats.studyHours > 0 
              ? `You've logged ${stats.studyHours.toFixed(1)} hours of study time this week! Keep up the great work.`
              : "Start tracking your study sessions to see insights about your study patterns and most productive times."
            }
          </p>
        </Card>

        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Weekly Overview</h2>
          <p className="text-muted-foreground">
            {stats.tasksCompleted > 0
              ? `You've completed ${stats.tasksCompleted} tasks this week with ${stats.goalsAchieved} goals achieved. Excellent progress!`
              : "Complete tasks and achieve goals to see your weekly progress and optimize your study schedule."
            }
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
