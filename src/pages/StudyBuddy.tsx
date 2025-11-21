import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const StudyBuddy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [xp, setXp] = useState(0);
  const [hunger, setHunger] = useState(100);
  const [buddyType, setBuddyType] = useState("cat");

  useEffect(() => {
    if (user) fetchBuddyData();
  }, [user]);

  const fetchBuddyData = async () => {
    const { data } = await supabase
      .from('user_preferences')
      .select('study_buddy_xp, study_buddy_hunger, study_buddy_type')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setXp(data.study_buddy_xp || 0);
      setHunger(data.study_buddy_hunger || 100);
      setBuddyType(data.study_buddy_type || "cat");
    }
  };

  const feedBuddy = async () => {
    const feedCost = 10;
    if (xp < feedCost) {
      toast({ 
        title: "Not enough XP!", 
        description: `You need ${feedCost} XP to feed your buddy. Complete tasks to earn more!`,
        variant: "destructive" 
      });
      return;
    }

    const newXp = xp - feedCost;
    const newHunger = Math.min(hunger + 20, 100);

    const { error } = await supabase
      .from('user_preferences')
      .update({
        study_buddy_xp: newXp,
        study_buddy_hunger: newHunger,
      })
      .eq('user_id', user?.id);

    if (!error) {
      setXp(newXp);
      setHunger(newHunger);
      toast({ title: "Your buddy is happy! 🎉" });
    }
  };

  const changeBuddyType = async (type: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_preferences')
      .update({ study_buddy_type: type })
      .eq('user_id', user.id);

    if (!error) {
      setBuddyType(type);
      toast({ title: `Study Buddy changed to ${type}!` });
    }
  };

  const getBuddyEmoji = () => {
    switch (buddyType) {
      case "cat": return "🐱";
      case "dog": return "🐶";
      default: return "🐱";
    }
  };

  const getBuddyName = () => {
    switch (buddyType) {
      case "cat": return "Whiskers";
      case "dog": return "Buddy";
      default: return "Friend";
    }
  };

  const getBuddyMood = () => {
    if (hunger > 70) return "Happy and energetic!";
    if (hunger > 40) return "Getting a bit hungry...";
    if (hunger > 20) return "Really hungry now!";
    return "Very hungry! Feed me soon!";
  };

  const getHungerColor = () => {
    if (hunger > 70) return "bg-primary";
    if (hunger > 40) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Virtual Companion</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Study Buddy
        </h1>
        <p className="text-lg text-muted-foreground">
          Take care of your virtual companion by completing tasks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Buddy Display */}
        <Card className="p-8 shadow-soft border-primary/20 bg-gradient-card">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-9xl animate-bounce-slow">
              {getBuddyEmoji()}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{getBuddyName()}</h2>
              <p className="text-muted-foreground">{getBuddyMood()}</p>
            </div>
            
            {/* Animal Selection */}
            <Card className="p-4 w-full bg-background/50">
              <Label className="text-sm font-medium mb-3 block">Choose Your Buddy</Label>
              <RadioGroup value={buddyType} onValueChange={changeBuddyType} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cat" id="cat" />
                  <Label htmlFor="cat" className="cursor-pointer flex items-center gap-2">
                    <span className="text-2xl">🐱</span>
                    <span>Cat</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dog" id="dog" />
                  <Label htmlFor="dog" className="cursor-pointer flex items-center gap-2">
                    <span className="text-2xl">🐶</span>
                    <span>Dog</span>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
            
            <div className="w-full space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Hunger</span>
                  <span className="text-sm text-muted-foreground">{hunger}%</span>
                </div>
                <Progress value={hunger} className={getHungerColor()} />
              </div>
              
              <Button 
                onClick={feedBuddy} 
                className="w-full bg-gradient-primary shadow-glow"
                size="lg"
              >
                <Heart className="h-4 w-4 mr-2" />
                Feed Buddy (10 XP)
              </Button>
            </div>
          </div>
        </Card>

        {/* XP Stats */}
        <div className="space-y-6">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Your XP</h3>
                <p className="text-3xl font-bold text-primary">{xp}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete tasks to earn more XP and keep your buddy fed!
            </p>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4">How to Earn XP</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <p className="font-medium">Complete Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    Low Priority: 5 XP<br/>
                    Medium Priority: 10 XP<br/>
                    High Priority: 20 XP
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-yellow-500/20 bg-yellow-500/5">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span>💡</span> Pro Tip
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep your buddy's hunger above 70% for optimal happiness! Your buddy loses hunger over time, so check back regularly.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
