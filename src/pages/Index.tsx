import { Calendar, CheckSquare, Clock, BarChart3, Target, Zap, BookOpen, Brain, Lightbulb } from "lucide-react";
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
    return <Navigate to="/calendar" replace />;
  }
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

      {/* Tabbed Content Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-16">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="study-tips">Study Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features">
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
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="study-tips">
              <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                    Master the Art of Studying
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted-foreground">
                    Evidence-based strategies to help you study smarter, not harder
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Purpose of Studying */}
                  <Card className="p-8 border-border bg-card shadow-soft">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Why We Study
                        </h3>
                        <div className="space-y-3 text-muted-foreground">
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
                  <Card className="p-8 border-border bg-card shadow-soft">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Beating Procrastination
                        </h3>
                        <div className="space-y-3 text-muted-foreground">
                          <p>
                            Procrastination is often about emotional regulation, not laziness. We avoid tasks that make us feel 
                            anxious, overwhelmed, or uncertain. The key is to make starting easier than avoiding.
                          </p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>The 2-Minute Rule:</strong> Commit to just 2 minutes of work. Once started, you'll often continue naturally.</li>
                            <li><strong>Break It Down:</strong> Large tasks feel overwhelming. Split them into tiny, specific actions.</li>
                            <li><strong>Remove Friction:</strong> Prepare your study space in advance. Close distracting tabs before you start.</li>
                            <li><strong>Time Block:</strong> Schedule specific times for studying. Treat these appointments as non-negotiable.</li>
                            <li><strong>Forgive Yourself:</strong> Being harsh about past procrastination makes it worse. Focus on the next step.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Improving Study Habits */}
                  <Card className="p-8 border-border bg-card shadow-soft">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Building Better Habits
                        </h3>
                        <div className="space-y-3 text-muted-foreground">
                          <p>
                            Consistent habits beat intense cramming every time. Here's how to build a sustainable study routine:
                          </p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Same Time, Same Place:</strong> Studying at consistent times trains your brain to focus automatically.</li>
                            <li><strong>Start Small:</strong> Begin with 15-20 minutes daily. Consistency matters more than duration initially.</li>
                            <li><strong>Track Progress:</strong> Use a simple checkmark system to build momentum and see your streak grow.</li>
                            <li><strong>Environment Design:</strong> Keep your study space clean, well-lit, and free from distractions.</li>
                            <li><strong>Sleep & Exercise:</strong> Your brain consolidates learning during sleep. Regular exercise boosts cognitive function.</li>
                            <li><strong>Review Regularly:</strong> Revisit material within 24 hours, then at increasing intervals to strengthen memory.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Study Techniques */}
                  <Card className="p-8 border-border bg-card shadow-soft">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Proven Study Techniques
                        </h3>
                        <div className="space-y-4 text-muted-foreground">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Active Recall</h4>
                            <p>
                              Instead of re-reading notes, close them and try to recall the information from memory. 
                              This strengthens neural connections and reveals what you actually don't know yet.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Spaced Repetition</h4>
                            <p>
                              Review material at increasing intervals: after 1 day, 3 days, 1 week, 2 weeks, 1 month. 
                              This fights the forgetting curve and moves information into long-term memory.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Pomodoro Technique</h4>
                            <p>
                              Study for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break. 
                              This maintains focus while preventing burnout.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Feynman Technique</h4>
                            <p>
                              Explain concepts in simple terms as if teaching someone else. If you get stuck, you've found a gap in 
                              your understanding. Go back and learn that part better.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Interleaving Practice</h4>
                            <p>
                              Mix up different topics or types of problems in one session. This builds flexibility and helps you 
                              recognize when to apply different concepts.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Elaborative Interrogation</h4>
                            <p>
                              Constantly ask yourself "why" and "how" questions. Connect new information to what you already know. 
                              The more connections you create, the easier recall becomes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Additional Tips */}
                  <Card className="p-8 border-border bg-card shadow-soft">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Pro Tips for Success
                        </h3>
                        <div className="space-y-3 text-muted-foreground">
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Study in Different Locations:</strong> Varying your environment helps create multiple retrieval cues.</li>
                            <li><strong>Handwrite Notes:</strong> Writing by hand engages your brain more deeply than typing.</li>
                            <li><strong>Teach Others:</strong> Explaining concepts to classmates reinforces your own understanding.</li>
                            <li><strong>Practice Tests:</strong> Testing yourself is more effective than re-reading. Make practice questions as you study.</li>
                            <li><strong>Mind Your Nutrition:</strong> Stay hydrated, eat regular meals, and avoid excessive caffeine that can spike anxiety.</li>
                            <li><strong>Use Multiple Senses:</strong> Read aloud, create diagrams, or walk while reviewing flashcards to engage different parts of your brain.</li>
                            <li><strong>Embrace Mistakes:</strong> Getting answers wrong during practice is actually good—it helps you learn what needs more attention.</li>
                            <li><strong>Plan Recovery Time:</strong> Schedule breaks and fun activities. A rested brain learns better than an exhausted one.</li>
                          </ul>
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
