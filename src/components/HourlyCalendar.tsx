import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, addHours, isSameDay, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  subject?: string;
  user_id: string;
  calendar_view?: string;
  is_recurring?: boolean;
  recurring_days?: number[];
}

export const HourlyCalendar = ({ selectedWeek }: { selectedWeek?: Date }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(selectedWeek || new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [timeIncrement, setTimeIncrement] = useState(60);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{ event: CalendarEvent; edge: 'top' | 'bottom'; initialY: number; initialHeight: number } | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; event?: CalendarEvent }>({ open: false });
  const [createDialog, setCreateDialog] = useState<{ open: boolean; day?: Date; hour?: number }>({ open: false });
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "study",
    subject: "",
    endTime: "",
    applyToMultipleDays: false,
    selectedDays: [] as number[]
  });
  const [sleepStart, setSleepStart] = useState<string>('23:00');
  const [sleepEnd, setSleepEnd] = useState<string>('07:00');
  const containerRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Update currentWeek when selectedWeek prop changes
  useEffect(() => {
    if (selectedWeek) {
      setCurrentWeek(selectedWeek);
    }
  }, [selectedWeek]);
  
  const getActiveHours = () => {
    const sleepStartHour = parseInt(sleepStart.split(':')[0]);
    const sleepEndHour = parseInt(sleepEnd.split(':')[0]);
    
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    return allHours.filter(hour => {
      if (sleepStartHour < sleepEndHour) {
        // Sleep period doesn't cross midnight (e.g., 01:00 to 07:00)
        return hour < sleepStartHour || hour >= sleepEndHour;
      } else {
        // Sleep period crosses midnight (e.g., 23:00 to 07:00)
        return hour >= sleepEndHour && hour < sleepStartHour;
      }
    });
  };
  
  const hours = getActiveHours();

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchSleepTimes();
    }
  }, [user, currentWeek]);

  const fetchSleepTimes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('sleep_start_time, sleep_end_time')
      .eq('user_id', user.id)
      .single();

    if (data) {
      if (data.sleep_start_time) setSleepStart(data.sleep_start_time.slice(0, 5));
      if (data.sleep_end_time) setSleepEnd(data.sleep_end_time.slice(0, 5));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingEvent || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hourHeight = rect.height / 24;
      
      // Calculate new time based on mouse position
      const minutesFromTop = (y / rect.height) * 1440;
      
      const start = parseISO(resizingEvent.event.start_time);
      const end = resizingEvent.event.end_time ? parseISO(resizingEvent.event.end_time) : addHours(start, 1);
      
      let newStart = start;
      let newEnd = end;
      
      if (resizingEvent.edge === 'top') {
        // Resizing from top - adjust start time
        newStart = new Date(start);
        newStart.setHours(0, Math.max(0, Math.round(minutesFromTop)), 0, 0);
        
        // Ensure minimum 15-minute duration
        if (newEnd.getTime() - newStart.getTime() < 15 * 60 * 1000) {
          newStart = new Date(newEnd.getTime() - 15 * 60 * 1000);
        }
      } else {
        // Resizing from bottom - adjust end time
        newEnd = new Date(start);
        newEnd.setHours(0, Math.min(1440, Math.round(minutesFromTop)), 0, 0);
        
        // Ensure minimum 15-minute duration
        if (newEnd.getTime() - newStart.getTime() < 15 * 60 * 1000) {
          newEnd = new Date(newStart.getTime() + 15 * 60 * 1000);
        }
      }
    };

    const handleMouseUp = async () => {
      if (!resizingEvent) return;
      
      const start = parseISO(resizingEvent.event.start_time);
      const end = resizingEvent.event.end_time ? parseISO(resizingEvent.event.end_time) : addHours(start, 1);
      
      const { error } = await supabase
        .from("calendar_events")
        .update({
          start_time: start.toISOString(),
          end_time: end.toISOString()
        })
        .eq("id", resizingEvent.event.id);

      if (!error) {
        toast({ title: "Event resized successfully" });
        fetchEvents();
      }
      
      setResizingEvent(null);
    };

    if (resizingEvent) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingEvent, user]);

  const fetchEvents = async () => {
    const weekEnd = addDays(weekStart, 7);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user?.id)
      .in("calendar_view", ["hourly", "both"])
      .gte("start_time", weekStart.toISOString())
      .lte("start_time", weekEnd.toISOString());
    
    if (!error && data) setEvents(data);
  };

  const createSchoolEvents = async () => {
    // Create school events for weekdays (Mon-Fri) 8:20 AM - 3:30 PM
    const weekdays = [0, 1, 2, 3, 4]; // Monday to Friday
    const schoolEvents = [];

    for (const dayOffset of weekdays) {
      const schoolDay = addDays(weekStart, dayOffset);
      
      // Check if school event already exists for this day
      const { data: existingEvents } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user?.id)
        .eq("event_type", "class")
        .eq("title", "School")
        .gte("start_time", schoolDay.toISOString())
        .lte("start_time", addDays(schoolDay, 1).toISOString());

      if (!existingEvents || existingEvents.length === 0) {
        const startTime = new Date(schoolDay);
        startTime.setHours(8, 20, 0, 0);
        const endTime = new Date(schoolDay);
        endTime.setHours(15, 30, 0, 0);

        schoolEvents.push({
          user_id: user?.id,
          title: "School",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          event_type: "class",
          calendar_view: "hourly"
        });
      }
    }

    if (schoolEvents.length > 0) {
      await supabase.from("calendar_events").insert(schoolEvents);
      fetchEvents();
    }
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    if (!draggedEvent) return;

    // Validate drop location is during active hours
    const activeHours = getActiveHours();
    if (!activeHours.includes(hour)) {
      toast({ title: "Cannot move events to sleep hours", variant: "destructive" });
      return;
    }

    const newStart = new Date(day);
    newStart.setHours(hour, 0, 0, 0);
    
    const oldStart = parseISO(draggedEvent.start_time);
    const oldEnd = draggedEvent.end_time ? parseISO(draggedEvent.end_time) : addHours(oldStart, 1);
    const duration = (oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60);
    const newEnd = addHours(newStart, duration);

    const { error } = await supabase
      .from("calendar_events")
      .update({
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      })
      .eq("id", draggedEvent.id);

    if (!error) {
      toast({ title: "Event moved successfully" });
      fetchEvents();
    }
    setDraggedEvent(null);
  };

  const handleResizeStart = (e: React.MouseEvent, event: CalendarEvent, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();
    
    const start = parseISO(event.start_time);
    const end = event.end_time ? parseISO(event.end_time) : addHours(start, 1);
    const duration = end.getTime() - start.getTime();
    
    setResizingEvent({ 
      event, 
      edge,
      initialY: e.clientY,
      initialHeight: duration / (1000 * 60 * 60) // hours
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (!error) {
      toast({ title: "Event deleted" });
      fetchEvents();
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    const { error } = await supabase
      .from("calendar_events")
      .update({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        subject: event.subject,
        start_time: event.start_time,
        end_time: event.end_time
      })
      .eq("id", event.id);

    if (!error) {
      toast({ title: "Event updated" });
      setEditDialog({ open: false });
      fetchEvents();
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !createDialog.day) {
      toast({ title: "Please enter an event title", variant: "destructive" });
      return;
    }

    if (!newEvent.endTime) {
      toast({ title: "Please enter an end time", variant: "destructive" });
      return;
    }

    const startTime = new Date(createDialog.day);
    startTime.setHours(createDialog.hour || 9, 0, 0, 0);
    
    const [endHours, endMinutes] = newEvent.endTime.split(':').map(Number);
    const endTime = new Date(createDialog.day);
    endTime.setHours(endHours, endMinutes, 0, 0);

    // Validate event is not during sleep time
    const activeHours = getActiveHours();
    if (!activeHours.includes(startTime.getHours())) {
      toast({ title: "Cannot create events during sleep hours", variant: "destructive" });
      return;
    }

    if (newEvent.applyToMultipleDays && newEvent.selectedDays.length > 0) {
      const eventsToCreate = newEvent.selectedDays.map(dayIndex => {
        const eventDay = addDays(weekStart, dayIndex);
        const eventStart = new Date(eventDay);
        eventStart.setHours(createDialog.hour || 9, 0, 0, 0);
        
        const [endHours, endMinutes] = newEvent.endTime.split(':').map(Number);
        const eventEnd = new Date(eventDay);
        eventEnd.setHours(endHours, endMinutes, 0, 0);

        return {
          user_id: user?.id,
          title: newEvent.title,
          description: newEvent.description,
          start_time: eventStart.toISOString(),
          end_time: eventEnd.toISOString(),
          event_type: newEvent.event_type,
          subject: newEvent.subject,
          calendar_view: "both",
          is_recurring: true,
          recurring_days: newEvent.selectedDays
        };
      });

      const { error } = await supabase.from("calendar_events").insert(eventsToCreate);

      if (!error) {
        toast({ title: `${eventsToCreate.length} events created!` });
        resetCreateDialog();
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user?.id,
        title: newEvent.title,
        description: newEvent.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        event_type: newEvent.event_type,
        subject: newEvent.subject,
        calendar_view: "both"
      });

      if (!error) {
        toast({ title: "Event created!" });
        resetCreateDialog();
        fetchEvents();
      }
    }
  };

  const resetCreateDialog = () => {
    setNewEvent({ 
      title: "", 
      description: "", 
      event_type: "study", 
      subject: "", 
      endTime: "",
      applyToMultipleDays: false,
      selectedDays: []
    });
    setCreateDialog({ open: false });
  };

  const toggleDaySelection = (dayIndex: number) => {
    setNewEvent(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayIndex)
        ? prev.selectedDays.filter(d => d !== dayIndex)
        : [...prev.selectedDays, dayIndex]
    }));
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: "bg-destructive",
      assignment: "bg-warning",
      study: "bg-success",
      class: "bg-accent",
      meeting: "bg-primary",
    };
    return colors[type] || "bg-muted";
  };

  const getEventPosition = (event: CalendarEvent, day: Date) => {
    const start = parseISO(event.start_time);
    if (!isSameDay(start, day)) return null;

    const end = event.end_time ? parseISO(event.end_time) : addHours(start, 1);
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    // Get the active hours to calculate relative position
    const activeHours = getActiveHours();
    
    // Don't render events that fall during sleep hours
    if (!activeHours.includes(startHour)) return null;
    
    const firstActiveHour = activeHours[0];
    const lastActiveHour = activeHours[activeHours.length - 1];
    
    // Don't render events that end outside active hours
    if (endHour > lastActiveHour + 1) return null;
    
    const totalActiveHours = activeHours.length;

    // Find the index of the start hour in active hours
    const startIndex = activeHours.indexOf(startHour);
    if (startIndex === -1) return null;

    // Calculate position relative to the active hours array
    const relativeStartMinutes = startIndex * 60 + startMinutes;
    const relativeEndMinutes = (endHour - firstActiveHour) * 60 + endMinutes;
    const duration = relativeEndMinutes - relativeStartMinutes;
    const totalActiveMinutes = totalActiveHours * 60;

    return {
      top: `${(relativeStartMinutes / totalActiveMinutes) * 100}%`,
      height: `${(duration / totalActiveMinutes) * 100}%`,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-semibold">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCreateDialog({ open: true, day: new Date(), hour: 9 })}
            className="gap-2 bg-gradient-primary"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTimeIncrement(Math.max(15, timeIncrement - 15))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTimeIncrement(Math.min(120, timeIncrement + 15))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{timeIncrement}min</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-xs font-medium text-muted-foreground border-r">Time</div>
          {days.map((day, i) => (
            <div key={i} className="p-2 text-center border-r last:border-r-0">
              <div className="text-sm font-semibold">{format(day, "EEE")}</div>
              <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
            </div>
          ))}
        </div>

        <div ref={containerRef} className="relative overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-8">
            <div className="border-r">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b text-xs text-right pr-2 py-1 text-muted-foreground"
                  style={{ height: `${60 / timeIncrement * 60}px` }}
                >
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="relative border-r last:border-r-0">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b transition-colors hover:bg-accent/50 cursor-pointer"
                    style={{ height: `${60 / timeIncrement * 60}px` }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onClick={() => setCreateDialog({ open: true, day, hour })}
                  />
                ))}

                {events.map((event) => {
                  const position = getEventPosition(event, day);
                  if (!position) return null;

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 ${getEventColor(event.event_type)} rounded p-1 ${
                        resizingEvent?.event.id === event.id ? 'cursor-ns-resize' : 'cursor-move'
                      } text-white text-xs overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group animate-scale-in hover:scale-[1.02]`}
                      style={position}
                      draggable={!resizingEvent}
                      onDragStart={(e) => handleDragStart(e, event)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold truncate">{event.title}</div>
                          {event.subject && (
                            <div className="text-[10px] opacity-90 truncate">{event.subject}</div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDialog({ open: true, event });
                            }}
                            className="p-0.5 hover:bg-white/20 rounded transition-colors"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="p-0.5 hover:bg-white/20 rounded transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div
                        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => handleResizeStart(e, event, 'top')}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => handleResizeStart(e, event, 'bottom')}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editDialog.event && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editDialog.event.title}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      event: { ...editDialog.event!, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={format(parseISO(editDialog.event.start_time), 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newStart = parseISO(editDialog.event!.start_time);
                      newStart.setHours(hours, minutes, 0, 0);
                      setEditDialog({
                        ...editDialog,
                        event: { ...editDialog.event!, start_time: newStart.toISOString() },
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editDialog.event.end_time ? format(parseISO(editDialog.event.end_time), 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const start = parseISO(editDialog.event!.start_time);
                      const newEnd = new Date(start);
                      newEnd.setHours(hours, minutes, 0, 0);
                      setEditDialog({
                        ...editDialog,
                        event: { ...editDialog.event!, end_time: newEnd.toISOString() },
                      });
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editDialog.event.description || ""}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      event: { ...editDialog.event!, description: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Event Type</Label>
                <Select
                  value={editDialog.event.event_type}
                  onValueChange={(value) =>
                    setEditDialog({
                      ...editDialog,
                      event: { ...editDialog.event!, event_type: value },
                    })
                  }
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={editDialog.event.subject || ""}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      event: { ...editDialog.event!, subject: e.target.value },
                    })
                  }
                />
              </div>
              <Button onClick={() => handleEditEvent(editDialog.event!)} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createDialog.open} onOpenChange={(open) => setCreateDialog({ open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Study session, meeting, etc."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type</Label>
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={newEvent.subject}
                onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                placeholder="Mathematics, Physics, etc."
              />
            </div>
            
            <div className="space-y-3 p-4 border rounded-lg bg-accent/10">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple-days"
                  checked={newEvent.applyToMultipleDays}
                  onCheckedChange={(checked) =>
                    setNewEvent({ ...newEvent, applyToMultipleDays: checked as boolean, selectedDays: [] })
                  }
                />
                <Label htmlFor="multiple-days" className="cursor-pointer">
                  Apply to multiple days
                </Label>
              </div>
              
              {newEvent.applyToMultipleDays && (
                <div>
                  <Label className="text-sm mb-2 block">Select days:</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => (
                      <div
                        key={index}
                        onClick={() => toggleDaySelection(index)}
                        className={`p-2 text-center rounded cursor-pointer transition-colors ${
                          newEvent.selectedDays.includes(index)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <div className="text-xs font-medium">{format(day, "EEE")}</div>
                        <div className="text-xs">{format(day, "d")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleCreateEvent} className="w-full bg-gradient-primary">
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};