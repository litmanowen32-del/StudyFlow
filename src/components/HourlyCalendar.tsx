import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, addHours, isSameDay, parseISO, startOfDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sparkles, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  subject?: string;
  user_id: string;
}

export const HourlyCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [timeIncrement, setTimeIncrement] = useState(60); // minutes
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{ event: CalendarEvent; edge: 'top' | 'bottom' } | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; event?: CalendarEvent }>({ open: false });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentWeek]);

  const fetchEvents = async () => {
    const weekEnd = addDays(weekStart, 7);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user?.id)
      .gte("start_time", weekStart.toISOString())
      .lte("start_time", weekEnd.toISOString());
    
    if (!error && data) setEvents(data);
  };

  const handleSuggestTimeSlots = async () => {
    setIsSuggesting(true);
    try {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user?.id)
        .eq("completed", false);

      const { data, error } = await supabase.functions.invoke('suggest-time-slots', {
        body: {
          tasks: tasks || [],
          existingEvents: events,
          startDate: weekStart.toISOString(),
          endDate: addDays(weekStart, 7).toISOString()
        }
      });

      if (error) throw error;

      if (data.suggestions && data.suggestions.length > 0) {
        // Create calendar events from suggestions
        for (const suggestion of data.suggestions) {
          const task = tasks?.find(t => t.id === suggestion.task_id);
          if (task) {
            await supabase.from("calendar_events").insert({
              user_id: user?.id,
              title: task.title,
              description: `${task.description || ''}\n\nAI Suggestion: ${suggestion.reason}`,
              start_time: suggestion.suggested_start,
              end_time: suggestion.suggested_end,
              event_type: "study",
              subject: task.subject
            });
          }
        }
        
        toast({
          title: "Time slots suggested!",
          description: `Added ${data.suggestions.length} suggested study sessions`,
        });
        fetchEvents();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suggest time slots",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
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
    setResizingEvent({ event, edge });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingEvent || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 24;
    const newHour = Math.floor(y / hourHeight);
    
    // Will be implemented with mouse move tracking
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
        subject: event.subject
      })
      .eq("id", event.id);

    if (!error) {
      toast({ title: "Event updated" });
      setEditDialog({ open: false });
      fetchEvents();
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: "bg-red-500",
      assignment: "bg-orange-500",
      study: "bg-green-500",
      class: "bg-blue-500",
      meeting: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getEventPosition = (event: CalendarEvent, day: Date) => {
    const start = parseISO(event.start_time);
    if (!isSameDay(start, day)) return null;

    const end = event.end_time ? parseISO(event.end_time) : addHours(start, 1);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    return {
      top: `${(startMinutes / 1440) * 100}%`,
      height: `${(duration / 1440) * 100}%`,
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
            variant="outline"
            size="sm"
            onClick={handleSuggestTimeSlots}
            disabled={isSuggesting}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isSuggesting ? "Suggesting..." : "AI Suggest Times"}
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
                    className="border-b hover:bg-accent/50 transition-colors"
                    style={{ height: `${60 / timeIncrement * 60}px` }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  />
                ))}

                {events.map((event) => {
                  const position = getEventPosition(event, day);
                  if (!position) return null;

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 ${getEventColor(event.event_type)} rounded p-1 cursor-move text-white text-xs overflow-hidden shadow-md hover:shadow-lg transition-all group`}
                      style={position}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold truncate">{event.title}</div>
                          {event.subject && (
                            <div className="text-[10px] opacity-90 truncate">{event.subject}</div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDialog({ open: true, event });
                            }}
                            className="p-0.5 hover:bg-white/20 rounded"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="p-0.5 hover:bg-white/20 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div
                        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-white/30"
                        onMouseDown={(e) => handleResizeStart(e, event, 'top')}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-white/30"
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
    </div>
  );
};
