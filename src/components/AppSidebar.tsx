import { Calendar, CheckSquare, Clock, BarChart3, Target, Flame, BookOpen, Settings, LogOut, GraduationCap, Info, Library, Heart, Calculator, FileText, Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Clock, label: "Focus Timer", path: "/focus" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Flame, label: "Habits", path: "/habits" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Library, label: "Study Sets", path: "/study" },
];

interface OptionalFeatures {
  studyBuddyEnabled: boolean;
  summarizerEnabled: boolean;
  calculatorEnabled: boolean;
  researchFinderEnabled: boolean;
  studyAssistantEnabled: boolean;
}

export function AppSidebar() {
  const { open } = useSidebar();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </SidebarMenuButton>
        </TooltipTrigger>
        {!open && (
          <TooltipContent side="right" className="font-medium">
            <p>{item.label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </SidebarMenuItem>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar collapsible="icon" className="border-r-0 hidden md:flex">
        <SidebarContent className="bg-sidebar">
          {/* Logo Section */}
          <SidebarGroup>
            <div className="flex items-center gap-3 px-4 py-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              {open && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-sidebar-foreground font-display">StudyFlow</span>
                  <span className="text-xs text-sidebar-foreground/60">Productivity Suite</span>
                </div>
              )}
            </div>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider px-4">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
                {features.studyAssistantEnabled && (
                  <NavItem item={{ icon: BookOpen, label: "Study Assistant", path: "/study-assistant" }} />
                )}
                {features.calculatorEnabled && (
                  <NavItem item={{ icon: Calculator, label: "Calculator", path: "/calculator" }} />
                )}
                {features.studyBuddyEnabled && (
                  <NavItem item={{ icon: Heart, label: "Study Buddy", path: "/study-buddy" }} />
                )}
                {features.summarizerEnabled && (
                  <NavItem item={{ icon: FileText, label: "Summarizer", path: "/summarizer" }} />
                )}
                {features.researchFinderEnabled && (
                  <NavItem item={{ icon: Search, label: "Research Finder", path: "/research" }} />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider px-4">
              Preferences
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-1">
                <NavItem item={{ icon: Settings, label: "Settings", path: "/settings" }} />
                <NavItem item={{ icon: Info, label: "About", path: "/about" }} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
          {user && (
            <div className="p-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    {open && <span className="font-medium">Sign Out</span>}
                  </Button>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
