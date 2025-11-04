import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const events = [
    { date: 15, title: "Math Exam", color: "destructive" },
    { date: 20, title: "Project Due", color: "warning" },
    { date: 25, title: "Study Group", color: "success" },
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">Plan your schedule and stay organized</p>
          </div>
          <Button className="bg-gradient-primary shadow-glow">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>

        <Card className="p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = events.filter(e => e.date === day);
              const isToday = day === new Date().getDate() && 
                             currentDate.getMonth() === new Date().getMonth();
              
              return (
                <Card
                  key={day}
                  className={`aspect-square p-2 transition-all hover:shadow-glow cursor-pointer ${
                    isToday ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <div className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayEvents.map((event, idx) => (
                        <Badge key={idx} variant={event.color as any} className="text-xs truncate">
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
