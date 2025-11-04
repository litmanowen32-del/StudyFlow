import { TrendingUp, Clock, CheckCircle, Target, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const Analytics = () => {
  const stats = [
    { icon: Clock, label: "Study Hours This Week", value: "32.5", change: "+12%", color: "text-primary" },
    { icon: CheckCircle, label: "Tasks Completed", value: "47", change: "+8%", color: "text-success" },
    { icon: Target, label: "Goals Achieved", value: "12", change: "+25%", color: "text-accent" },
    { icon: TrendingUp, label: "Productivity Score", value: "85%", change: "+5%", color: "text-warning" },
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
        {stats.map((stat, index) => {
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
            Your analytics dashboard will show detailed insights about your study patterns,
            most productive times, and completion rates once you start tracking your activities.
          </p>
        </Card>

        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Weekly Overview</h2>
          <p className="text-muted-foreground">
            Track your weekly progress, completed tasks, and time spent on different subjects
            to optimize your study schedule and achieve better results.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
