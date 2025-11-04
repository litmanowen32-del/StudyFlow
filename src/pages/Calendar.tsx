import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "study",
    start_time: "",
    subject: "",
  });
  
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

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentDate]);

  const fetchEvents = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user?.id)
      .gte("start_time", startOfMonth.toISOString())
      .lte("start_time", endOfMonth.toISOString());
    
    if (!error && data) setEvents(data);
  };

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user?.id,
      title: newEvent.title,
      description: newEvent.description,
      event_type: newEvent.event_type,
      start_time: newEvent.start_time,
      subject: newEvent.subject,
    });

    if (!error) {
      toast({ title: "Event created!" });
      setNewEvent({ title: "", description: "", event_type: "study", start_time: "", subject: "" });
      setOpen(false);
      fetchEvents();
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: "destructive",
      assignment: "warning",
      study: "success",
      class: "default",
      meeting: "secondary",
    };
    return colors[type] || "default";
  };

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Math Study Session"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={newEvent.event_type}
                    onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="study">Study Session</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-time">Date & Time *</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Chapter 5 review"
                  />
                </div>
                <Button onClick={createEvent} className="w-full">Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
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
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                return eventDate.getDate() === day && 
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
              });
              const isToday = day === new Date().getDate() && 
                             currentDate.getMonth() === new Date().getMonth() &&
                             currentDate.getFullYear() === new Date().getFullYear();
              
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
                        <Badge key={idx} variant={getEventColor(event.event_type) as any} className="text-xs truncate">
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
