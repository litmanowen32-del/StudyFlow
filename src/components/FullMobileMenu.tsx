import { 
  Calendar, CheckSquare, Clock, BarChart3, Target, Flame, 
  BookOpen, Settings, LogOut, GraduationCap, Info, Library, 
  Heart, Calculator, FileText, Search, X 
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FullMobileMenuProps {
  onClose: () => void;
}

const coreNavItems = [
  { icon: Calendar, label: "Calendar", path: "/calendar", color: "text-blue-500" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks", color: "text-green-500" },
  { icon: Clock, label: "Focus Timer", path: "/focus", color: "text-orange-500" },
  { icon: Target, label: "Goals", path: "/goals", color: "text-purple-500" },
  { icon: Flame, label: "Habits", path: "/habits", color: "text-red-500" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", color: "text-cyan-500" },
  { icon: Library, label: "Study Sets", path: "/study", color: "text-indigo-500" },
];

interface OptionalFeatures {
  studyBuddyEnabled: boolean;
  summarizerEnabled: boolean;
  calculatorEnabled: boolean;
  researchFinderEnabled: boolean;
  studyAssistantEnabled: boolean;
}

export function FullMobileMenu({ onClose }: FullMobileMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<OptionalFeatures>({
    studyBuddyEnabled: false,
    summarizerEnabled: false,
    calculatorEnabled: false,
    researchFinderEnabled: false,
    studyAssistantEnabled: false,
  });

  useEffect(() => {
    if (user) fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    const { data } = await supabase
      .from('user_preferences')
      .select('study_buddy_enabled, article_summarizer_enabled, calculator_enabled, research_finder_enabled, study_assistant_enabled')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setFeatures({
        studyBuddyEnabled: data.study_buddy_enabled || false,
        summarizerEnabled: data.article_summarizer_enabled || false,
        calculatorEnabled: data.calculator_enabled || false,
        researchFinderEnabled: data.research_finder_enabled || false,
        studyAssistantEnabled: data.study_assistant_enabled || false,
      });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    onClose();
  };

  const optionalItems = [
    features.studyAssistantEnabled && { icon: BookOpen, label: "Study Assistant", path: "/study-assistant", color: "text-teal-500" },
    features.calculatorEnabled && { icon: Calculator, label: "Calculator", path: "/calculator", color: "text-amber-500" },
    features.studyBuddyEnabled && { icon: Heart, label: "Study Buddy", path: "/study-buddy", color: "text-pink-500" },
    features.summarizerEnabled && { icon: FileText, label: "Summarizer", path: "/summarizer", color: "text-emerald-500" },
    features.researchFinderEnabled && { icon: Search, label: "Research Finder", path: "/research", color: "text-violet-500" },
  ].filter(Boolean) as { icon: any; label: string; path: string; color: string }[];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground">StudyFlow</h2>
            <p className="text-xs text-muted-foreground">Productivity Suite</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Core Features */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Core Features
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {coreNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-95"
              >
                <div className={cn("p-2.5 rounded-xl bg-background shadow-sm", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Features */}
        {optionalItems.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Tools
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {optionalItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-95"
                >
                  <div className={cn("p-2.5 rounded-xl bg-background shadow-sm", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings & Info */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Preferences
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleNavigate("/settings")}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-muted">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">Settings</span>
            </button>
            <button
              onClick={() => handleNavigate("/about")}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-lg bg-muted">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      {user && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}
