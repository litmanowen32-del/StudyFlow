import { User, Bell, Palette, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <div className="mt-1 text-sm text-muted-foreground">Student User</div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="mt-1 text-sm text-muted-foreground">student@university.edu</div>
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
    </div>
  );
};

export default Settings;
