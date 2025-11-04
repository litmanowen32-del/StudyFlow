import { Users, Heart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">About StudyFlow</h1>
        <p className="text-xl text-muted-foreground">
          Built by students, for students
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                We're a dedicated group of students who knew we could achieve more. 
                Juggling classes, assignments, and personal goals felt overwhelming, 
                so we built StudyFlow—a comprehensive productivity platform designed 
                specifically for the modern student lifestyle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe every student deserves tools that actually work with their 
                busy schedules. StudyFlow combines smart scheduling, task management, 
                and AI-powered study assistance to help you focus on what matters most: 
                learning and growing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Built With Care</h2>
              <p className="text-muted-foreground leading-relaxed">
                Every feature in StudyFlow comes from real student experiences. 
                From AI-powered time blocking to habit tracking, we've packed in the 
                tools we wish we'd had from day one. This is productivity software that 
                understands your life because we're living it too.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Have questions or feedback? We'd love to hear from you!
        </p>
      </div>
    </div>
  );
};

export default About;
