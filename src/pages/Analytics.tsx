import { useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle, Target, Sparkles, Trophy, Flame, Zap, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-1.5 text-sm font-medium text-primary-foreground mb-4 shadow-glow animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Performance Insights</span>
        </div>
        <h1 className="text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your progress and celebrate your achievements 🎉
        </p>
      </div>

      {/* Hero Stats Card */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20 shadow-glow animate-scale-in">
        <div className="grid md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl p-6 bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-primary shadow-soft ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-success bg-success/10 px-2 py-1 rounded-full animate-pulse">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className={`text-4xl font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Productivity Score Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="p-8 shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-soft">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Productivity Power</h2>
              <p className="text-sm text-muted-foreground">Your weekly performance</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.productivityScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {stats.productivityScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              {stats.productivityScore >= 80 && (
                <div className="inline-flex items-center gap-2 text-success font-semibold animate-bounce">
                  <Flame className="h-5 w-5" />
                  You're on fire! Keep it up!
                </div>
              )}
              {stats.productivityScore >= 50 && stats.productivityScore < 80 && (
                <div className="inline-flex items-center gap-2 text-warning font-semibold">
                  <Zap className="h-5 w-5" />
                  Great progress! Push harder!
                </div>
              )}
              {stats.productivityScore < 50 && (
                <div className="inline-flex items-center gap-2 text-muted-foreground font-semibold">
                  <Target className="h-5 w-5" />
                  Let's get started!
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-soft hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-soft">
              <Award className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Achievement Breakdown</h2>
              <p className="text-sm text-muted-foreground">Your weekly milestones</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Study Time
                </span>
                <span className="text-muted-foreground">{stats.studyHours.toFixed(1)} hrs / 20 hrs</span>
              </div>
              <Progress value={(stats.studyHours / 20) * 100} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Tasks Done
                </span>
                <span className="text-muted-foreground">{stats.tasksCompleted} / 30</span>
              </div>
              <Progress value={(stats.tasksCompleted / 30) * 100} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Goals Achieved
                </span>
                <span className="text-muted-foreground">{stats.goalsAchieved} / 5</span>
              </div>
              <Progress value={(stats.goalsAchieved / 5) * 100} className="h-3" />
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-8 shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-success/5 to-primary/5 border-l-4 border-success">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Sparkles className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Study Streak</h3>
              <p className="text-muted-foreground leading-relaxed">
                {stats.studyHours > 0 
                  ? `Amazing! You've logged ${stats.studyHours.toFixed(1)} hours this week. You're building great study habits! 🌟`
                  : "Ready to start? Set your first study session and begin your journey to success! 🚀"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-accent/5 to-warning/5 border-l-4 border-accent">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Weekly Highlights</h3>
              <p className="text-muted-foreground leading-relaxed">
                You've completed <span className="font-bold text-foreground">{stats.tasksCompleted} tasks</span> and achieved <span className="font-bold text-foreground">{stats.goalsAchieved} goals</span>.
                {stats.productivityScore > 70 ? " You're absolutely crushing it! 🎯" : " Keep pushing forward, success is within reach! 💪"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
