import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Home from "./pages/Home";
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

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Desktop header */}
          <div className="sticky top-0 z-40 hidden md:flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="hover:bg-muted rounded-lg" />
            <div className="flex-1" />
          </div>
          {/* Mobile header */}
          <div className="sticky top-0 z-40 flex md:hidden h-14 items-center justify-center border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
            <span className="font-display font-bold text-foreground">StudyFlow</span>
          </div>
          <div className="pb-20 md:pb-0">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </SidebarProvider>
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
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/schedule-quiz" element={<ProtectedRoute><ScheduleQuiz /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
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
