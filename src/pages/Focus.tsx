import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Focus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ focus: 25, break: 5 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalTime = mode === "focus" ? focusDuration * 60 : breakDuration * 60;
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
    
    if (mode === "focus") {
      setSessions((prev) => prev + 1);
      
      // Save session to database
      await supabase.from("study_sessions").insert({
        user_id: user?.id,
        duration_minutes: focusDuration,
        session_type: "pomodoro",
        completed: true,
      });

      toast({
        title: "Focus Session Complete! 🎉",
        description: "Great work! Starting your break...",
      });

      // Automatically start break timer
      setMode("break");
      setTimeLeft(breakDuration * 60);
      setTimeout(() => setIsActive(true), 1000);
    } else {
      toast({
        title: "Break Complete! ☕",
        description: "Ready to focus again?",
      });
      
      // Switch back to focus mode
      setMode("focus");
      setTimeLeft(focusDuration * 60);
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    const duration = mode === "focus" ? focusDuration : breakDuration;
    setTimeLeft(duration * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleFastForward = () => {
    setTimeLeft(0);
    handleSessionComplete();
  };

  const handleSkipBreak = () => {
    setIsActive(false);
    setMode("focus");
    setTimeLeft(focusDuration * 60);
  };

  const handleSwitchMode = () => {
    setIsActive(false);
    const newMode = mode === "focus" ? "break" : "focus";
    setMode(newMode);
    const duration = newMode === "focus" ? focusDuration : breakDuration;
    setTimeLeft(duration * 60);
  };

  const handleSaveSettings = () => {
    setFocusDuration(tempSettings.focus);
    setBreakDuration(tempSettings.break);
    setTimeLeft(mode === "focus" ? tempSettings.focus * 60 : tempSettings.break * 60);
    setSettingsOpen(false);
    toast({ title: "Settings saved!" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Pomodoro Technique</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Focus Timer
        </h1>
        <p className="text-lg text-muted-foreground">
          Use the Pomodoro technique to maximize productivity
        </p>
      </div>

      <Card className="mt-12 p-12 text-center shadow-glow">
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className={`px-4 py-2 rounded-full ${
            mode === "focus" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          }`}>
            {mode === "focus" ? "Focus Time" : "Break Time"}
          </div>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="focus-duration">Focus Duration (minutes)</Label>
                  <Input
                    id="focus-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.focus}
                    onChange={(e) => setTempSettings({ ...tempSettings, focus: parseInt(e.target.value) || 25 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.break}
                    onChange={(e) => setTempSettings({ ...tempSettings, break: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-gradient-primary">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <div className={`mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-full border-8 ${
            mode === "focus" ? "border-primary/20" : "border-success/20"
          } bg-gradient-card`}>
            <div className="text-7xl font-bold text-foreground">
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-8 flex justify-center gap-4 flex-wrap">
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
          <Button
            size="lg"
            variant="outline"
            onClick={handleFastForward}
            disabled={!isActive}
          >
            Fast Forward
          </Button>
          {mode === "break" && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkipBreak}
            >
              Skip Break
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleSwitchMode}
          >
            Switch to {mode === "focus" ? "Break" : "Focus"}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            <span>Sessions: {sessions}</span>
          </div>
          <div>
            {mode === "focus" 
              ? `Next break: ${breakDuration} min` 
              : `Back to focus: ${focusDuration} min`}
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-4 text-center shadow-soft">
          <div className="text-3xl font-bold text-primary">{focusDuration}</div>
          <div className="text-sm text-muted-foreground">Focus Time</div>
        </Card>
        <Card className="p-4 text-center shadow-soft">
          <div className="text-3xl font-bold text-success">{breakDuration}</div>
          <div className="text-sm text-muted-foreground">Short Break</div>
        </Card>
        <Card className="p-4 text-center shadow-soft">
          <div className="text-3xl font-bold text-accent">{sessions}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
      </div>
    </div>
  );
};

export default Focus;