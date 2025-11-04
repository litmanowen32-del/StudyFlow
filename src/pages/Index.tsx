import { Calendar, CheckSquare, Clock, BarChart3, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Color-coded schedule tailored to your classes and commitments",
    },
    {
      icon: CheckSquare,
      title: "Task Prioritization",
      description: "Matrix-based system to beat procrastination and focus on what matters",
    },
    {
      icon: Clock,
      title: "Focus Timer",
      description: "Pomodoro sessions with adaptive breaks to maximize productivity",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visual insights into your study patterns and completion trends",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor academic milestones with motivational streaks",
    },
    {
      icon: Zap,
      title: "AI Study Planner",
      description: "Intelligent scheduling based on your energy levels and free time",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
              <Zap className="h-4 w-4" />
              <span>Built for Students, By Students</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground lg:text-7xl animate-fade-in">
              Master Your Time,
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Ace Your Goals
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl animate-fade-in">
              StudyFlow is the ultimate productivity companion for students. Stay organized, 
              beat procrastination, and achieve more with intelligent scheduling and focus tools.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary shadow-glow hover:shadow-accent-glow transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features designed to help you plan smarter, focus better, and achieve more
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border bg-card p-6 shadow-soft transition-all hover:shadow-glow hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-card opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Card className="relative overflow-hidden border-border bg-gradient-primary p-12 text-primary-foreground shadow-glow">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">10K+</div>
                <div className="text-primary-foreground/80">Active Students</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">85%</div>
                <div className="text-primary-foreground/80">Productivity Boost</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">4.9★</div>
                <div className="text-primary-foreground/80">Student Rating</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-foreground lg:text-5xl">
            Ready to Transform Your Productivity?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Join thousands of students who are achieving more with StudyFlow
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-accent shadow-accent-glow hover:shadow-glow transition-all">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
