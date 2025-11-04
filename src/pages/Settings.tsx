import { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Sparkles, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);

  const testNotifications = async () => {
    toast({ title: "Sending test notifications..." });
    try {
      const { error } = await supabase.functions.invoke("send-notifications");
      if (error) throw error;
      toast({ 
        title: "Notifications sent!", 
        description: "Check your email for any due tasks or upcoming events" 
      });
    } catch (error) {
      toast({ 
        title: "Note", 
        description: "Email notifications require Resend API configuration. Contact support for setup.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Customize Your Experience</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="mt-1 text-sm text-muted-foreground">{user?.email || "Not logged in"}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Focus Session Alerts</Label>
                <p className="text-sm text-muted-foreground">Alerts for break times and session ends</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Goal Milestones</Label>
                <p className="text-sm text-muted-foreground">Celebrate when you reach your goals</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-primary/20 bg-gradient-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Email Reminders</h2>
              <p className="text-sm text-muted-foreground">
                Get email notifications for upcoming tasks and events
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            You'll receive emails when:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-4 ml-4">
            <li>• Tasks are due within 24 hours</li>
            <li>• Events are starting within 1 hour</li>
          </ul>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Button onClick={testNotifications} variant="outline" className="w-full">
            Test Email Notifications
          </Button>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme for better focus</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve StudyFlow with usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;