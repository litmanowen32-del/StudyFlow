import { TrendingUp, Clock, CheckCircle, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";

const Analytics = () => {
  const stats = [
    { icon: Clock, label: "Study Hours This Week", value: "32.5", change: "+12%", color: "text-primary" },
    { icon: CheckCircle, label: "Tasks Completed", value: "47", change: "+8%", color: "text-success" },
    { icon: Target, label: "Goals Achieved", value: "12", change: "+25%", color: "text-accent" },
    { icon: TrendingUp, label: "Productivity Score", value: "85%", change: "+5%", color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your productivity and progress</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 shadow-soft transition-all hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg bg-primary/10 p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium text-success">{stat.change}</div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Study Time by Subject</h3>
            <div className="space-y-4">
              {[
                { subject: "Mathematics", hours: 8.5, color: "bg-primary" },
                { subject: "Physics", hours: 7.2, color: "bg-success" },
                { subject: "Chemistry", hours: 6.8, color: "bg-accent" },
                { subject: "History", hours: 5.4, color: "bg-warning" },
                { subject: "English", hours: 4.6, color: "bg-destructive" },
              ].map((item, index) => (
                <div key={index}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground">{item.subject}</span>
                    <span className="text-muted-foreground">{item.hours}h</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.hours / 8.5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Weekly Activity</h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {[65, 80, 45, 90, 75, 85, 70].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-primary rounded-t" style={{ height: `${height}%` }} />
                  <span className="text-xs text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
