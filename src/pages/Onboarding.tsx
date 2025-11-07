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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const onboardingSchema = z.object({
  referral_source: z.string().min(1, "Please tell us how you found StudyFlow"),
  study_goal_hours_per_week: z.coerce.number().min(1, "Study goal must be at least 1 hour").max(168, "Study goal cannot exceed 168 hours per week"),
  school_level: z.enum(["middle_school", "high_school"], {
    required_error: "Please select your school level",
  }),
  study_preference: z.string().min(1, "Please tell us how you study best"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

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
    },
  });

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const steps = [
    {
      title: "How did you find us?",
      description: "Help us understand how you discovered StudyFlow",
      field: "referral_source" as const,
    },
    {
      title: "What's your study goal?",
      description: "Set your weekly study target to stay on track",
      field: "study_goal_hours_per_week" as const,
    },
    {
      title: "What's your school level?",
      description: "We'll personalize your experience accordingly",
      field: "school_level" as const,
    },
    {
      title: "How do you study best?",
      description: "Tell us about your ideal study environment",
      field: "study_preference" as const,
    },
  ];

  const canProceed = () => {
    const currentField = steps[currentStep].field;
    const value = form.getValues(currentField);
    
    if (currentField === "study_goal_hours_per_week") {
      const numValue = Number(value);
      return !isNaN(numValue) && numValue >= 1 && numValue <= 168;
    }
    return value && value.toString().trim() !== "";
  };

  const handleNext = async () => {
    const currentField = steps[currentStep].field;
    const isValid = await form.trigger(currentField);
    
    if (isValid) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
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

      toast({
        title: "Welcome to StudyFlow!",
        description: "Your preferences have been saved.",
      });

      navigate("/");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl shadow-glow border-border/50 animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Welcome to StudyFlow!</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="animate-fade-in" key={currentStep}>
            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-base">
              {steps[currentStep].description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="min-h-[200px] animate-fade-in" key={currentStep}>
                {currentStep === 0 && (
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
                )}

                {currentStep === 1 && (
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
                )}

                {currentStep === 2 && (
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
                )}

                {currentStep === 3 && (
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
                )}
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
