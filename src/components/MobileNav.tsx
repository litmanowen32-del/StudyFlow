import { Calendar, CheckSquare, Clock, BarChart3, Target, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { FullMobileMenu } from "./FullMobileMenu";

const mainNavItems = [
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Clock, label: "Focus", path: "/focus" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border shadow-lg">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "mobile-nav-item flex-1 max-w-[72px]",
                  isActive && "active"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="mobile-nav-item flex-1 max-w-[72px]">
                <Menu className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
              <FullMobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
