import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      referral_source: "",
      study_goal_hours_per_week: 10,
      school_level: undefined,
      study_preference: "",
    },
  });

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to StudyFlow!</CardTitle>
          <CardDescription>
            Let's personalize your experience to help you achieve your study goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="referral_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you find out about StudyFlow?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Friend, Social media, Search engine..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="study_goal_hours_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your study goal per week? (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="168" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="school_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What level are you currently at?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="middle_school" id="middle_school" />
                          <Label htmlFor="middle_school" className="cursor-pointer">
                            Middle School
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high_school" id="high_school" />
                          <Label htmlFor="high_school" className="cursor-pointer">
                            High School
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="study_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you study best?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quiet environment, with music, group study..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Get Started"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
