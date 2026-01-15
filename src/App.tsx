import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Home as HomeIcon } from "lucide-react";
import { ThemeProvider } from "next-themes";
import studyflowLogo from "@/assets/studyflow-logo.png";
import Index from "./pages/Index";
import HomePage from "./pages/Home";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import HabitTracker from "./pages/HabitTracker";
import StudyAssistant from "./pages/StudyAssistant";
import Study from "./pages/Study";
import StudyBuddy from "./pages/StudyBuddy";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Calculator from "./pages/Calculator";
import Summarizer from "./pages/Summarizer";
import ResearchFinder from "./pages/ResearchFinder";
import ScheduleQuiz from "./pages/ScheduleQuiz";

const queryClient = new QueryClient();

const AppLayout = ({ children, showHomeButton = true }: { children: React.ReactNode; showHomeButton?: boolean }) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
        <a 
          href="/home" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <img src={studyflowLogo} alt="Studyflow" className="h-10 md:h-12 object-contain" />
        </a>
        <div className="flex-1" />
      </header>
      <main className="overflow-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/landing" element={<Index />} />
          <Route path="/schedule-quiz" element={<ProtectedRoute><ScheduleQuiz /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><AppLayout showHomeButton={false}><HomePage /></AppLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><AppLayout><Tasks /></AppLayout></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><AppLayout><Focus /></AppLayout></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><AppLayout><HabitTracker /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/study-assistant" element={<ProtectedRoute><AppLayout><StudyAssistant /></AppLayout></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><AppLayout><Calculator /></AppLayout></ProtectedRoute>} />
          <Route path="/summarizer" element={<ProtectedRoute><AppLayout><Summarizer /></AppLayout></ProtectedRoute>} />
          <Route path="/research" element={<ProtectedRoute><AppLayout><ResearchFinder /></AppLayout></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><AppLayout><Study /></AppLayout></ProtectedRoute>} />
          <Route path="/study-buddy" element={<ProtectedRoute><AppLayout><StudyBuddy /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><AppLayout><About /></AppLayout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
