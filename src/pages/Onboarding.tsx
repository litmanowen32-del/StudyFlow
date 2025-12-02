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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { addDays, startOfWeek, setHours, setMinutes, format, parse } from "date-fns";

const onboardingSchema = z.object({
  referral_source: z.string().min(1, "Please tell us how you found StudyFlow"),
  study_goal_hours_per_week: z.coerce.number().min(1, "Study goal must be at least 1 hour").max(168, "Study goal cannot exceed 168 hours per week"),
  school_level: z.enum(["middle_school", "high_school"], {
    required_error: "Please select your school level",
  }),
  study_preference: z.string().min(1, "Please tell us how you study best"),
  goes_to_school: z.enum(["yes", "no"]).optional(),
  school_start_time: z.string().optional(),
  school_end_time: z.string().optional(),
  school_days: z.array(z.number()).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

type StepField = 
  | "goes_to_school" 
  | "school_start_time" 
  | "school_end_time" 
  | "school_days" 
  | "referral_source" 
  | "study_goal_hours_per_week" 
  | "school_level" 
  | "study_preference";

interface Step {
  title: string;
  description: string;
  field: StepField;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      referral_source: "",
      study_goal_hours_per_week: 10,
      school_level: undefined,
      study_preference: "",
      goes_to_school: undefined,
      school_start_time: "08:00",
      school_end_time: "15:00",
      school_days: [1, 2, 3, 4, 5], // Monday to Friday by default
    },
  });

  const goesToSchool = form.watch("goes_to_school");
  
  // Dynamic steps based on whether user goes to school
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        title: "Do you go to school?",
        description: "We'll help set up your schedule",
        field: "goes_to_school",
      },
    ];

    if (goesToSchool === "yes") {
      baseSteps.push(
        {
          title: "What time does school start and end?",
          description: "Set your typical school hours",
          field: "school_start_time",
        },
        {
          title: "Which days do you go to school?",
          description: "Select your school days",
          field: "school_days",
        }
      );
    }

    baseSteps.push(
      {
        title: "How did you find us?",
        description: "Help us understand how you discovered StudyFlow",
        field: "referral_source",
      },
      {
        title: "What's your study goal?",
        description: "Set your weekly study target to stay on track",
        field: "study_goal_hours_per_week",
      },
      {
        title: "What's your school level?",
        description: "We'll personalize your experience accordingly",
        field: "school_level",
      },
      {
        title: "How do you study best?",
        description: "Tell us about your ideal study environment",
        field: "study_preference",
      }
    );

    return baseSteps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    const currentField = steps[currentStep]?.field;
    if (!currentField) return false;
    
    const value = form.getValues(currentField as any);
    
    if (currentField === "study_goal_hours_per_week") {
      const numValue = Number(value);
      return !isNaN(numValue) && numValue >= 1 && numValue <= 168;
    }
    if (currentField === "school_days") {
      return Array.isArray(value) && value.length > 0;
    }
    if (currentField === "school_start_time" || currentField === "school_end_time") {
      return true; // Times have defaults
    }
    return value && value.toString().trim() !== "";
  };

  const handleNext = async () => {
    const currentField = steps[currentStep]?.field;
    if (!currentField) return;
    
    // Validate current field if it's part of the schema
    if (['referral_source', 'study_goal_hours_per_week', 'school_level', 'study_preference'].includes(currentField)) {
      const isValid = await form.trigger(currentField as any);
      if (!isValid) return;
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
        });

      if (error) throw error;

      toast({
        title: "Welcome to StudyFlow!",
        description: "You can set up your preferences later in Settings.",
      });

      navigate("/calendar");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      navigate("/calendar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createSchoolEvents = async (data: OnboardingFormData) => {
    if (!user || data.goes_to_school !== "yes" || !data.school_days?.length) return;

    const startTime = data.school_start_time || "08:00";
    const endTime = data.school_end_time || "15:00";
    const schoolDays = data.school_days || [];

    // Create events for the next 4 weeks
    const events = [];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });

    for (let week = 0; week < 4; week++) {
      for (const dayOfWeek of schoolDays) {
        const eventDate = addDays(weekStart, week * 7 + dayOfWeek);
        
        // Parse times
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
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

    if (events.length > 0) {
      const { error } = await supabase
        .from("calendar_events")
        .insert(events);

      if (error) {
        console.error("Error creating school events:", error);
      }
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save preferences
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          referral_source: data.referral_source,
          study_goal_hours_per_week: data.study_goal_hours_per_week,
          school_level: data.school_level,
          study_preference: data.study_preference,
          onboarding_completed: true,
        });

      if (error) throw error;

      // Create school events if applicable
      await createSchoolEvents(data);

      toast({
        title: "Welcome to StudyFlow!",
        description: data.goes_to_school === "yes" 
          ? "Your school schedule has been added to your calendar!" 
          : "Your preferences have been saved.",
      });

      navigate("/calendar");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentField = steps[currentStep]?.field;

    if (currentField === "goes_to_school") {
      return (
        <FormField
          control={form.control}
          name="goes_to_school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Do you currently attend school?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-4 mt-4"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="yes" id="school_yes" />
                    <Label htmlFor="school_yes" className="cursor-pointer flex-1 text-base">
                      Yes, I go to school
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="no" id="school_no" />
                    <Label htmlFor="school_no" className="cursor-pointer flex-1 text-base">
                      No, I don't go to school
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (currentField === "school_start_time") {
      return (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="school_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">School starts at</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field}
                    className="h-12 text-base max-w-xs"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="school_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">School ends at</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field}
                    className="h-12 text-base max-w-xs"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (currentField === "school_days") {
      return (
        <FormField
          control={form.control}
          name="school_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Select your school days</FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.value}
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      field.value?.includes(day.value) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => {
                      const current = field.value || [];
                      const newValue = current.includes(day.value)
                        ? current.filter((d) => d !== day.value)
                        : [...current, day.value];
                      field.onChange(newValue);
                    }}
                  >
                    <Checkbox 
                      checked={field.value?.includes(day.value)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        const newValue = checked
                          ? [...current, day.value]
                          : current.filter((d) => d !== day.value);
                        field.onChange(newValue);
                      }}
                    />
                    <Label className="cursor-pointer text-base">{day.label}</Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (currentField === "referral_source") {
      return (
        <FormField
          control={form.control}
          name="referral_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">How did you find out about StudyFlow?</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Friend, Social media, Search engine..." 
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (currentField === "study_goal_hours_per_week") {
      return (
        <FormField
          control={form.control}
          name="study_goal_hours_per_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Weekly study hours</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="168" 
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground mt-2">
                We recommend 10-20 hours per week for optimal results
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (currentField === "school_level") {
      return (
        <FormField
          control={form.control}
          name="school_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Current school level</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-4 mt-4"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="middle_school" id="middle_school" />
                    <Label htmlFor="middle_school" className="cursor-pointer flex-1 text-base">
                      Middle School
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="high_school" id="high_school" />
                    <Label htmlFor="high_school" className="cursor-pointer flex-1 text-base">
                      High School
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (currentField === "study_preference") {
      return (
        <FormField
          control={form.control}
          name="study_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Ideal study environment</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Quiet library, with lo-fi music, coffee shop..." 
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground mt-2">
                This helps us provide better study recommendations
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl shadow-glow border-border/50 animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Welcome to StudyFlow!</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="animate-fade-in" key={currentStep}>
            <CardTitle className="text-xl">{steps[currentStep]?.title}</CardTitle>
            <CardDescription className="text-base">
              {steps[currentStep]?.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="min-h-[250px] animate-fade-in" key={currentStep}>
                {renderStepContent()}
              </div>

              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="w-32"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="w-32 ml-auto"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !canProceed()}
                    className="w-32 ml-auto bg-gradient-primary shadow-glow"
                  >
                    {isSubmitting ? "Saving..." : "Finish"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
