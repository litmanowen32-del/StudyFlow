import { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Sparkles, Mail, Upload, BookOpen, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [sleepStartTime, setSleepStartTime] = useState('23:00');
  const [sleepEndTime, setSleepEndTime] = useState('07:00');

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkGoogleConnection();
      fetchGoogleConfig();
      fetchSleepPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (googleClientId) {
      initializeGoogleSignIn();
    }
  }, [googleClientId]);

  const fetchGoogleConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-config');
      if (error) throw error;
      setGoogleClientId(data.clientId);
    } catch (error) {
      console.error('Failed to fetch Google config:', error);
    }
  };

  const initializeGoogleSignIn = () => {
    if (!googleClientId) return;
    
    const google = (window as any).google;
    
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated successfully!" });
    } catch (error) {
      toast({ 
        title: "Error uploading avatar", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const checkGoogleConnection = async () => {
    if (!user) return;
    setCheckingConnection(true);
    try {
      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setIsGoogleConnected(!!data && !error);
    } catch (error) {
      setIsGoogleConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-classroom-auth', {
        body: { credential: response.credential },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      setIsGoogleConnected(true);
      toast({ title: "Google Classroom connected successfully!" });
    } catch (error) {
      toast({ 
        title: "Connection failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const connectGoogleClassroom = () => {
    if (!googleClientId) {
      toast({
        title: "Configuration loading",
        description: "Please wait a moment and try again",
        variant: "destructive"
      });
      return;
    }

    const google = (window as any).google;
    
    if (typeof google !== 'undefined') {
      google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/gmail.readonly",
        callback: async (response: any) => {
          if (response.code) {
            try {
              const { data, error } = await supabase.functions.invoke('google-classroom-auth', {
                body: { code: response.code },
                headers: {
                  Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
              });
              
              if (error) throw error;
              
              setIsGoogleConnected(true);
              toast({ title: "Google Account connected successfully! (Classroom + Gmail)" });
            } catch (error) {
              toast({ 
                title: "Connection failed", 
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive" 
              });
            }
          }
        },
      }).requestCode();
    } else {
      toast({
        title: "Google Sign-In not loaded",
        description: "Please refresh the page and try again",
        variant: "destructive"
      });
    }
  };

  const disconnectGoogleAccount = async () => {
    try {
      const { error } = await supabase
        .from('google_oauth_tokens')
        .delete()
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setIsGoogleConnected(false);
      toast({ title: "Google Account disconnected" });
    } catch (error) {
      toast({ 
        title: "Error disconnecting", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const syncGoogleAccount = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-account', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Sync complete!", 
        description: data.message 
      });
    } catch (error) {
      toast({ 
        title: "Sync failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsSyncing(false);
    }
  };

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

  const fetchSleepPreferences = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('sleep_start_time, sleep_end_time')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      if (data.sleep_start_time) setSleepStartTime(data.sleep_start_time.slice(0, 5));
      if (data.sleep_end_time) setSleepEndTime(data.sleep_end_time.slice(0, 5));
    }
  };

  const updateSleepPreferences = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        sleep_start_time: sleepStartTime,
        sleep_end_time: sleepEndTime,
      });

    if (error) {
      toast({ 
        title: "Error saving sleep times", 
        description: error.message,
        variant: "destructive" 
      });
    } else {
      toast({ title: "Sleep times saved!" });
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
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user?.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    disabled={uploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
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

        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Sleep Schedule</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Set your sleep hours to prevent AI from scheduling during this time
          </p>
          <div className="space-y-4">
            <div>
              <Label>Sleep Start Time</Label>
              <Input
                type="time"
                value={sleepStartTime}
                onChange={(e) => setSleepStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Wake Up Time</Label>
              <Input
                type="time"
                value={sleepEndTime}
                onChange={(e) => setSleepEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={updateSleepPreferences} className="w-full">
              Save Sleep Schedule
            </Button>
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
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-primary/20 bg-gradient-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Google Account</h2>
              <p className="text-sm text-muted-foreground">
                Sync Classroom assignments and Gmail messages
              </p>
            </div>
          </div>

          {checkingConnection ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : isGoogleConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                Connected to Google Account (Classroom + Gmail)
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={syncGoogleAccount} 
                  disabled={isSyncing}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button 
                  onClick={disconnectGoogleAccount}
                  variant="outline"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Google account to import Classroom assignments and important Gmail messages as tasks.
              </p>
              <Button onClick={connectGoogleClassroom} className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Connect Google Account
              </Button>
            </div>
          )}
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