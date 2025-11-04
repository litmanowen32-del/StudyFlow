import { Calendar, CheckSquare, Clock, BarChart3, Target, Settings, Flame, Repeat, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: Clock, label: "Focus", path: "/focus" },
    { icon: Flame, label: "Habits", path: "/habits" },
    { icon: Repeat, label: "Routines", path: "/routines" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StudyFlow</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {user && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-2">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
