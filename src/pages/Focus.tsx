import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Focus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalTime = 25 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    setSessions((prev) => prev + 1);
    
    // Save session to database
    await supabase.from("study_sessions").insert({
      user_id: user?.id,
      duration_minutes: 25,
      session_type: "pomodoro",
      completed: true,
    });

    toast({
      title: "Session Complete! 🎉",
      description: "Great work! Time for a break.",
    });
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground">Focus Timer</h1>
          <p className="text-muted-foreground">Use the Pomodoro technique to maximize productivity</p>
        </div>

        <Card className="mt-12 p-12 text-center shadow-glow">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-full border-8 border-primary/20 bg-gradient-card">
              <div className="text-7xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mb-8 flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-primary shadow-glow"
              onClick={handleStartPause}
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span>Sessions: {sessions}</span>
            </div>
            <div>Next break in 25:00</div>
          </div>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-4 text-center shadow-soft">
            <div className="text-3xl font-bold text-primary">25</div>
            <div className="text-sm text-muted-foreground">Focus Time</div>
          </Card>
          <Card className="p-4 text-center shadow-soft">
            <div className="text-3xl font-bold text-success">5</div>
            <div className="text-sm text-muted-foreground">Short Break</div>
          </Card>
          <Card className="p-4 text-center shadow-soft">
            <div className="text-3xl font-bold text-accent">15</div>
            <div className="text-sm text-muted-foreground">Long Break</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
