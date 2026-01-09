import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Calendar, Brain, Clock, Sun, Moon, BookOpen } from "lucide-react";
import { addDays, startOfWeek, setHours, setMinutes, parse, format } from "date-fns";

interface QuizData {
  goesToSchool: boolean | null;
  schoolStartTime: string;
  schoolEndTime: string;
  schoolDays: number[];
  subjects: string[];
  studyGoalHours: number;
  energyPattern: string;
  preferredSessionLength: number;
  sleepTime: string;
  wakeTime: string;
  extracurriculars: string;
}

interface ScheduleItem {
  day: number;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface GeneratedSchedule {
  schedule: ScheduleItem[];
  tips: string[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const COMMON_SUBJECTS = [
  "Math", "English", "Science", "History", "Geography", 
  "Physics", "Chemistry", "Biology", "Computer Science", 
  "Foreign Language", "Art", "Music", "Physical Education"
];

export default function ScheduleQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  
  const [quizData, setQuizData] = useState<QuizData>({
    goesToSchool: null,
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    schoolDays: [1, 2, 3, 4, 5],
    subjects: [],
    studyGoalHours: 10,
    energyPattern: "morning",
    preferredSessionLength: 45,
    sleepTime: "22:00",
    wakeTime: "07:00",
    extracurriculars: "",
  });

  const getSteps = () => {
    const steps = [
      { id: "school", title: "School Schedule", icon: Calendar },
    ];
    
    if (quizData.goesToSchool) {
      steps.push({ id: "schoolTimes", title: "School Hours", icon: Clock });
      steps.push({ id: "schoolDays", title: "School Days", icon: Calendar });
    }
    
    steps.push(
      { id: "subjects", title: "Your Subjects", icon: BookOpen },
      { id: "goals", title: "Study Goals", icon: Brain },
      { id: "energy", title: "Energy Pattern", icon: Sun },
      { id: "sleep", title: "Sleep Schedule", icon: Moon },
      { id: "extras", title: "Extra Activities", icon: Clock }
    );
    
    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step) return false;
    
    switch (step.id) {
      case "school":
        return quizData.goesToSchool !== null;
      case "schoolDays":
        return quizData.schoolDays.length > 0;
      case "subjects":
        return quizData.subjects.length > 0;
      case "goals":
        return quizData.studyGoalHours >= 1;
      case "energy":
        return !!quizData.energyPattern;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSubject = (subject: string) => {
    setQuizData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleSchoolDay = (day: number) => {
    setQuizData(prev => ({
      ...prev,
      schoolDays: prev.schoolDays.includes(day)
        ? prev.schoolDays.filter(d => d !== day)
        : [...prev.schoolDays, day]
    }));
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ quizData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service Unavailable",
            description: "AI service requires additional credits.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to generate schedule");
      }

      const data: GeneratedSchedule = await response.json();
      setGeneratedSchedule(data);
      
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveScheduleToCalendar = async () => {
    if (!user || !generatedSchedule) return;
    
    setIsGenerating(true);
    
    try {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const events = [];

      // Create events for next 4 weeks
      for (let week = 0; week < 4; week++) {
        for (const item of generatedSchedule.schedule) {
          const eventDate = addDays(weekStart, week * 7 + item.day);
          
          const [startHour, startMin] = item.startTime.split(':').map(Number);
          const [endHour, endMin] = item.endTime.split(':').map(Number);
          
          const startDateTime = setMinutes(setHours(eventDate, startHour), startMin);
          const endDateTime = setMinutes(setHours(eventDate, endHour), endMin);

          events.push({
            user_id: user.id,
            title: item.title,
            description: item.description,
            subject: item.subject,
            event_type: "study",
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            calendar_view: "both",
            all_day: false,
          });
        }
      }

      // Also add school events if applicable
      if (quizData.goesToSchool && quizData.schoolDays.length > 0) {
        for (let week = 0; week < 4; week++) {
          for (const dayOfWeek of quizData.schoolDays) {
            const eventDate = addDays(weekStart, week * 7 + dayOfWeek);
            
            const [startHour, startMin] = quizData.schoolStartTime.split(':').map(Number);
            const [endHour, endMin] = quizData.schoolEndTime.split(':').map(Number);
            
            const startDateTime = setMinutes(setHours(eventDate, startHour), startMin);
            const endDateTime = setMinutes(setHours(eventDate, endHour), endMin);

            events.push({
              user_id: user.id,
              title: "School",
              event_type: "class",
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              calendar_view: "both",
              all_day: false,
            });
          }
        }
      }

      if (events.length > 0) {
        const { error } = await supabase
          .from("calendar_events")
          .insert(events);

        if (error) throw error;
      }

      // Update user preferences
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          study_goal_hours_per_week: quizData.studyGoalHours,
          sleep_start_time: quizData.sleepTime,
          sleep_end_time: quizData.wakeTime,
          onboarding_completed: true,
        });

      toast({
        title: "Schedule Created! 🎉",
        description: `Added ${events.length} events to your calendar for the next 4 weeks.`,
      });

      navigate("/calendar");
      
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;

    switch (step.id) {
      case "school":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Do you currently attend school?</Label>
            <RadioGroup
              value={quizData.goesToSchool === null ? "" : quizData.goesToSchool ? "yes" : "no"}
              onValueChange={(v) => setQuizData(prev => ({ ...prev, goesToSchool: v === "yes" }))}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-xl border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                <RadioGroupItem value="yes" id="school_yes" />
                <Label htmlFor="school_yes" className="cursor-pointer flex-1">Yes, I go to school</Label>
              </div>
              <div className="flex items-center space-x-3 rounded-xl border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                <RadioGroupItem value="no" id="school_no" />
                <Label htmlFor="school_no" className="cursor-pointer flex-1">No, I don't go to school</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "schoolTimes":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-medium">School starts at</Label>
              <Input
                type="time"
                value={quizData.schoolStartTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, schoolStartTime: e.target.value }))}
                className="h-12 max-w-xs"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-medium">School ends at</Label>
              <Input
                type="time"
                value={quizData.schoolEndTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, schoolEndTime: e.target.value }))}
                className="h-12 max-w-xs"
              />
            </div>
          </div>
        );

      case "schoolDays":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Which days do you go to school?</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={quizData.schoolDays.includes(day.value) ? "default" : "outline"}
                  onClick={() => toggleSchoolDay(day.value)}
                  className="w-14 h-14 rounded-xl"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case "subjects":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">What subjects do you need to study?</Label>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_SUBJECTS.map((subject) => (
                <Button
                  key={subject}
                  type="button"
                  variant={quizData.subjects.includes(subject) ? "default" : "outline"}
                  onClick={() => toggleSubject(subject)}
                  className="h-12 rounded-xl text-sm"
                >
                  {subject}
                </Button>
              ))}
            </div>
            <div className="pt-4">
              <Label className="text-sm text-muted-foreground">Add custom subject</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter subject name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !quizData.subjects.includes(value)) {
                        toggleSubject(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case "goals":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-medium">How many hours do you want to study per week?</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={quizData.studyGoalHours}
                onChange={(e) => setQuizData(prev => ({ ...prev, studyGoalHours: parseInt(e.target.value) || 1 }))}
                className="h-12 max-w-xs"
              />
              <p className="text-sm text-muted-foreground">We recommend 10-20 hours for optimal results</p>
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-medium">Preferred study session length</Label>
              <RadioGroup
                value={quizData.preferredSessionLength.toString()}
                onValueChange={(v) => setQuizData(prev => ({ ...prev, preferredSessionLength: parseInt(v) }))}
                className="flex flex-wrap gap-2"
              >
                {[25, 45, 60, 90].map((mins) => (
                  <div key={mins} className="flex items-center">
                    <RadioGroupItem value={mins.toString()} id={`session-${mins}`} className="peer sr-only" />
                    <Label
                      htmlFor={`session-${mins}`}
                      className="flex items-center justify-center px-4 py-3 rounded-xl border border-border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-accent transition-colors"
                    >
                      {mins} min
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case "energy":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">When do you have the most energy?</Label>
            <RadioGroup
              value={quizData.energyPattern}
              onValueChange={(v) => setQuizData(prev => ({ ...prev, energyPattern: v }))}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-xl border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                <RadioGroupItem value="morning" id="morning" />
                <Sun className="h-5 w-5 text-yellow-500" />
                <Label htmlFor="morning" className="cursor-pointer flex-1">
                  <span className="font-medium">Morning Person</span>
                  <p className="text-sm text-muted-foreground">I'm most focused in the morning</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-xl border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <Clock className="h-5 w-5 text-orange-500" />
                <Label htmlFor="afternoon" className="cursor-pointer flex-1">
                  <span className="font-medium">Afternoon Peak</span>
                  <p className="text-sm text-muted-foreground">I'm most productive after lunch</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-xl border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                <RadioGroupItem value="evening" id="evening" />
                <Moon className="h-5 w-5 text-indigo-500" />
                <Label htmlFor="evening" className="cursor-pointer flex-1">
                  <span className="font-medium">Night Owl</span>
                  <p className="text-sm text-muted-foreground">I focus best in the evening</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "sleep":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-medium">What time do you usually wake up?</Label>
              <Input
                type="time"
                value={quizData.wakeTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, wakeTime: e.target.value }))}
                className="h-12 max-w-xs"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-medium">What time do you usually go to sleep?</Label>
              <Input
                type="time"
                value={quizData.sleepTime}
                onChange={(e) => setQuizData(prev => ({ ...prev, sleepTime: e.target.value }))}
                className="h-12 max-w-xs"
              />
            </div>
          </div>
        );

      case "extras":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Do you have any extracurricular activities?</Label>
            <p className="text-sm text-muted-foreground">Sports, clubs, hobbies, part-time job, etc.</p>
            <Input
              placeholder="e.g., Soccer practice on Tuesdays, Piano lessons on Fridays..."
              value={quizData.extracurriculars}
              onChange={(e) => setQuizData(prev => ({ ...prev, extracurriculars: e.target.value }))}
              className="h-12"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Show generated schedule review
  if (generatedSchedule) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Your AI-Generated Schedule</CardTitle>
              <CardDescription>Here's a personalized study plan based on your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tips */}
              {generatedSchedule.tips?.length > 0 && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Personalized Tips
                  </h3>
                  <ul className="space-y-2">
                    {generatedSchedule.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Schedule Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold">Weekly Schedule Preview</h3>
                {generatedSchedule.schedule?.length > 0 ? (
                  <div className="grid gap-2">
                    {generatedSchedule.schedule.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-xs font-medium text-muted-foreground w-10">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item.day]}
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          {item.subject && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {item.subject}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {generatedSchedule.schedule.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{generatedSchedule.schedule.length - 10} more sessions per week
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No sessions generated. Try adjusting your preferences.</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedSchedule(null)}
                  className="flex-1"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={saveScheduleToCalendar}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-primary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
                Skip
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-6" />
            <div className="flex items-center gap-3">
              {steps[currentStep] && (
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="h-6 w-6 text-primary-foreground" />;
                  })()}
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{steps[currentStep]?.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}
            
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {isLastStep ? (
                <Button
                  onClick={generateSchedule}
                  disabled={!canProceed() || isGenerating}
                  className="flex-1 bg-gradient-primary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Schedule...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate My Schedule
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
