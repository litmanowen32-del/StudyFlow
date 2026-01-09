import { Calendar, CheckSquare, Clock, BarChart3, Target, Zap, BookOpen, Brain, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const features = [
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Color-coded schedule tailored to your classes and commitments",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: CheckSquare,
      title: "Task Prioritization",
      description: "Matrix-based system to beat procrastination and focus on what matters",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Clock,
      title: "Focus Timer",
      description: "Pomodoro sessions with adaptive breaks to maximize productivity",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visual insights into your study patterns and completion trends",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor academic milestones with motivational streaks",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Zap,
      title: "AI Study Planner",
      description: "Intelligent scheduling based on your energy levels and free time",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display text-foreground">StudyFlow</span>
            </div>
            <Link to="/auth">
              <Button className="rounded-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 dark:opacity-20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary animate-fade-in">
              <Zap className="h-4 w-4" />
              <span>Built for Students, By Students</span>
            </div>
            
            <h1 className="mb-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-display animate-fade-in">
              Master Your Time,
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Ace Your Goals
              </span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-lg sm:text-xl text-muted-foreground animate-fade-in leading-relaxed">
              StudyFlow is the ultimate productivity companion for students. Stay organized, 
              beat procrastination, and achieve more with intelligent scheduling and focus tools.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-base rounded-full bg-gradient-primary shadow-glow hover:shadow-accent-glow transition-all hover:scale-105">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-2 hover:bg-muted transition-all">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="px-6 py-20 lg:py-32 relative">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-16 rounded-full p-1.5 bg-muted/50">
              <TabsTrigger value="features" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Features
              </TabsTrigger>
              <TabsTrigger value="study-tips" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Study Tips
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="animate-fade-in">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display">
                  Everything You Need to Succeed
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Powerful features designed to help you plan smarter, focus better, and achieve more
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={index}
                      className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
                    >
                      <div className="relative">
                        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground font-display">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="study-tips" className="animate-fade-in">
              <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display">
                    Master the Art of Studying
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Evidence-based strategies to help you study smarter, not harder
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Purpose of Studying */}
                  <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start gap-5">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 shadow-lg shrink-0">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
                          Why We Study
                        </h3>
                        <div className="space-y-3 text-muted-foreground leading-relaxed">
                          <p>
                            Studying isn't just about memorizing facts for exams—it's about building knowledge that stays with you. 
                            When you truly understand something, you can apply it in new situations, connect it to other concepts, 
                            and use it to solve real-world problems.
                          </p>
                          <p>
                            Effective studying strengthens neural pathways in your brain, making information easier to recall when 
                            you need it. It's like building mental muscles—the more you work them, the stronger they become.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Overcoming Procrastination */}
                  <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start gap-5">
                      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-lg shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
                          Beating Procrastination
                        </h3>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                          <p>
                            Procrastination is often about emotional regulation, not laziness. We avoid tasks that make us feel 
                            anxious, overwhelmed, or uncertain. The key is to make starting easier than avoiding.
                          </p>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span><strong className="text-foreground">The 2-Minute Rule:</strong> Commit to just 2 minutes of work. Once started, you'll often continue naturally.</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span><strong className="text-foreground">Break It Down:</strong> Large tasks feel overwhelming. Split them into tiny, specific actions.</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span><strong className="text-foreground">Remove Friction:</strong> Prepare your study space in advance. Close distracting tabs before you start.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Study Techniques */}
                  <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start gap-5">
                      <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 p-4 shadow-lg shrink-0">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
                          Proven Study Techniques
                        </h3>
                        <div className="space-y-5 text-muted-foreground">
                          <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-semibold text-foreground mb-2">Active Recall</h4>
                            <p className="leading-relaxed">
                              Instead of re-reading notes, close them and try to recall the information from memory. 
                              This strengthens neural connections and reveals what you actually don't know yet.
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-semibold text-foreground mb-2">Spaced Repetition</h4>
                            <p className="leading-relaxed">
                              Review material at increasing intervals: after 1 day, 3 days, 1 week, 2 weeks, 1 month. 
                              This fights the forgetting curve and moves information into long-term memory.
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-semibold text-foreground mb-2">Pomodoro Technique</h4>
                            <p className="leading-relaxed">
                              Study for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break. 
                              This maintains focus while preventing burnout.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Pro Tips */}
                  <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start gap-5">
                      <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-4 shadow-lg shrink-0">
                        <Lightbulb className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
                          Pro Tips for Success
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground">
                          <div className="p-4 rounded-xl bg-muted/30">
                            <strong className="text-foreground block mb-1">Study in Different Locations</strong>
                            <span className="text-sm">Varying your environment helps create multiple retrieval cues.</span>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30">
                            <strong className="text-foreground block mb-1">Handwrite Notes</strong>
                            <span className="text-sm">Writing by hand engages your brain more deeply than typing.</span>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30">
                            <strong className="text-foreground block mb-1">Teach Others</strong>
                            <span className="text-sm">Explaining concepts to classmates reinforces your own understanding.</span>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30">
                            <strong className="text-foreground block mb-1">Embrace Mistakes</strong>
                            <span className="text-sm">Getting answers wrong helps you learn what needs more attention.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Card className="relative overflow-hidden border-0 bg-gradient-primary p-12 lg:p-16 text-primary-foreground shadow-2xl rounded-3xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0tOCA4aC0ydi00aDJ2NHptMC04aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-3 text-5xl lg:text-6xl font-extrabold font-display">10K+</div>
                <div className="text-lg text-primary-foreground/80">Active Students</div>
              </div>
              <div className="text-center">
                <div className="mb-3 text-5xl lg:text-6xl font-extrabold font-display">85%</div>
                <div className="text-lg text-primary-foreground/80">Productivity Boost</div>
              </div>
              <div className="text-center">
                <div className="mb-3 text-5xl lg:text-6xl font-extrabold font-display">4.9★</div>
                <div className="text-lg text-primary-foreground/80">Student Rating</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display">
            Ready to Transform Your Productivity?
          </h2>
          <p className="mb-12 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who've already transformed their study habits. Start your journey today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-14 px-10 text-base rounded-full bg-gradient-primary shadow-glow hover:shadow-accent-glow transition-all hover:scale-105">
              Get Started - It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          <p>&copy; 2024 StudyFlow. Made with ♡ for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
