import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HourlyCalendar } from "@/components/HourlyCalendar";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";

const Calendar = () => {
  const [view, setView] = useState<"hourly" | "monthly">("hourly");

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Smart Scheduling with AI</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Calendar
        </h1>
        <p className="text-lg text-muted-foreground">
          Drag, resize, and schedule with AI-powered time suggestions
        </p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "hourly" | "monthly")} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hourly">Hourly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <HourlyCalendar />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlyCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calendar;
