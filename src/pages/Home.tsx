import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckSquare,
  Clock,
  BarChart3,
  Target,
  BookOpen,
  Settings,
  Info,
  Calculator,
  FileText,
  Search,
  Heart,
  Gamepad2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const pages = [
  {
    title: "Calendar",
    description: "View and manage your schedule",
    path: "/calendar",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Tasks",
    description: "Manage your to-do list",
    path: "/tasks",
    icon: CheckSquare,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Focus Timer",
    description: "Pomodoro sessions for productivity",
    path: "/focus",
    icon: Clock,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Analytics",
    description: "Track your study progress",
    path: "/analytics",
    icon: BarChart3,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    title: "Goals",
    description: "Set and achieve your goals",
    path: "/goals",
    icon: Target,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Habit Tracker",
    description: "Build positive habits",
    path: "/habits",
    icon: Heart,
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "Study",
    description: "Flashcards and study materials",
    path: "/study",
    icon: BookOpen,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    title: "Study Assistant",
    description: "AI-powered study help",
    path: "/study-assistant",
    icon: MessageSquare,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    title: "Study Buddy",
    description: "Your virtual study companion",
    path: "/study-buddy",
    icon: Gamepad2,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Calculator",
    description: "Scientific calculator",
    path: "/calculator",
    icon: Calculator,
    gradient: "from-slate-500 to-gray-600",
  },
  {
    title: "Summarizer",
    description: "Summarize articles and notes",
    path: "/summarizer",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Research Finder",
    description: "Find research articles",
    path: "/research",
    icon: Search,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Settings",
    description: "Customize your experience",
    path: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
  },
  {
    title: "About",
    description: "Learn about StudyFlow",
    path: "/about",
    icon: Info,
    gradient: "from-sky-500 to-blue-500",
  },
];

const Home = () => {
  return (
    <div className="p-6 md:p-8">
      {/* AI Schedule Builder CTA */}
      <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Build Your Perfect Schedule</h2>
              <p className="text-muted-foreground">Take a quick quiz and let AI create a personalized study plan for you</p>
            </div>
          </div>
          <Link to="/schedule-quiz">
            <Button className="bg-gradient-primary shadow-glow">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Quiz
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display mb-2">
          Welcome to StudyFlow
        </h1>
        <p className="text-muted-foreground">
          Choose a page to get started
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.path} to={page.path}>
              <Card className="group h-full p-6 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 cursor-pointer">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${page.gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {page.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
