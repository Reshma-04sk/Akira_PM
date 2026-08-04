import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User as UserIcon, 
  Lock, 
  Paintbrush, 
  Bell, 
  Info,
  Save,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-hooks";
import { usersApi } from "@/services/api/users.api";
import { useTheme } from "@/app/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/data-display";
import { FormField, FormLabel } from "@/components/ui/form";
import { Skeleton, toast } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { AISettings } from "../components/AISettings";

const AVATAR_PRESETS = [
  "🦊", "🐯", "🐼", "🐨", "🦁", "🐰", "🐙", "⭐", "🚀", "💡", "🎨", "💻"
];

export const SettingsPage: React.FC = () => {
  const { user, refresh } = useAuth();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "theme" | "notifications" | "account" | "ai">("profile");

  // Load latest user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => usersApi.getMe().then((res) => res.data),
    enabled: !!user,
  });

  // Local Form States
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifPreferences, setNotifPreferences] = useState<Record<string, boolean>>({
    task_assigned: true,
    task_updated: true,
    comment_added: true,
    email_digest: false,
  });

  // Initialize form fields once profile loads
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || profile.name || "");
      const currentAvatar = profile.avatar_url || "";
      setAvatarUrl(currentAvatar);
      
      if (AVATAR_PRESETS.includes(currentAvatar)) {
        setSelectedPreset(currentAvatar);
      } else {
        setSelectedPreset("");
      }

      if (profile.notification_preferences) {
        setNotifPreferences((prev) => ({
          ...prev,
          ...profile.notification_preferences,
        }));
      }
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) => usersApi.updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      // Refresh current auth context user
      if (refresh) {
        await refresh();
      }
      toast.success("Profile Updated", "Your profile details have been saved successfully.");
    },
    onError: (err: any) => {
      toast.error("Failed to update profile", err.message || "An error occurred.");
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: any) => usersApi.changePassword(payload),
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password Changed", "Your account password has been updated.");
    },
    onError: (err: any) => {
      toast.error("Failed to change password", err.message || "Please verify your old password.");
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Validation Error", "Full name is required.");
      return;
    }
    const finalAvatar = selectedPreset || avatarUrl;
    updateProfileMutation.mutate({
      full_name: fullName.trim(),
      avatar_url: finalAvatar || null,
      notification_preferences: notifPreferences,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Validation Error", "Old password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Validation Error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Validation Error", "Confirm password does not match new password.");
      return;
    }
    changePasswordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword,
    });
  };

  const handleToggleNotif = (key: string) => {
    const updated = { ...notifPreferences, [key]: !notifPreferences[key] };
    setNotifPreferences(updated);
    // Auto-save notification preferences
    updateProfileMutation.mutate({
      notification_preferences: updated,
    });
  };

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setAvatarUrl(""); // Reset manual url
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-40 col-span-1" />
          <Skeleton className="h-96 col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your workspace configuration, security keys, and profile notifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 flex flex-row md:flex-col gap-1 overflow-x-auto p-1 bg-card/45 border border-border/80 rounded-xl">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={UserIcon}
            label="User Profile"
          />
          <TabButton
            active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
            icon={Lock}
            label="Security Keys"
          />
          <TabButton
            active={activeTab === "theme"}
            onClick={() => setActiveTab("theme")}
            icon={Paintbrush}
            label="Theme Interface"
          />
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={Bell}
            label="Notifications"
          />
          <TabButton
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
            icon={Sparkles}
            label="AI Configuration"
          />
          <TabButton
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
            icon={Info}
            label="Account Info"
          />
        </aside>

        {/* Tab Content Panel */}
        <main className="md:col-span-3">
          {activeTab === "profile" && (
            <Card className="border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <CardTitle>User Profile Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Picker Section */}
                  <div className="space-y-3">
                    <FormLabel>Profile Photo / Avatar</FormLabel>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border/60 bg-card/10">
                      {/* Avatar Preview */}
                      <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shrink-0 select-none shadow">
                        {selectedPreset ? selectedPreset : (avatarUrl ? "🔗" : "👤")}
                      </div>
                      
                      <div className="space-y-3 flex-1 w-full">
                        {/* Predefined Grid */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Choose Preset Emoji</span>
                          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {AVATAR_PRESETS.map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleSelectPreset(preset)}
                                className={cn(
                                  "h-8 w-8 text-lg rounded-lg border border-border/40 hover:bg-accent/40 flex items-center justify-center transition-all",
                                  selectedPreset === preset && "border-primary bg-primary/10 shadow-sm"
                                )}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Image URL */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Or Custom Image URL</span>
                          <Input
                            placeholder="https://example.com/avatar.jpg"
                            value={avatarUrl}
                            onChange={(e) => {
                              setAvatarUrl(e.target.value);
                              setSelectedPreset(""); // Deselect preset
                            }}
                            className="h-8 text-xs placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField>
                      <FormLabel required>Full Name</FormLabel>
                      <Input
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Email Address (Immutable)</FormLabel>
                      <Input
                        value={profile?.email || ""}
                        disabled
                        className="bg-card/10 opacity-70"
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border/40">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 gap-1.5 px-4 text-xs font-semibold"
                      isLoading={updateProfileMutation.isPending}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <CardTitle>Change Login Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <FormField>
                    <FormLabel required>Current Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </FormField>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField>
                      <FormLabel required>New Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel required>Confirm New Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Confirm password match"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border/40 mt-4">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 gap-1.5 px-4 text-xs font-semibold"
                      isLoading={changePasswordMutation.isPending}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "theme" && (
            <Card className="border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <CardTitle>Theme Layout Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-muted-foreground">
                  Select your system interface styling theme. Responsive styles adjust to device capabilities.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <ThemeSelectCard
                    active={theme === "light"}
                    onClick={() => setTheme("light")}
                    title="Light Interface"
                    description="Vibrant colors optimized for bright daylight work."
                    previewBg="bg-white border-zinc-200"
                  />
                  <ThemeSelectCard
                    active={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    title="Sleek Dark Mode"
                    description="Premium dark-hsl tones helping restrict eye fatigue."
                    previewBg="bg-zinc-950 border-zinc-800"
                  />
                  <ThemeSelectCard
                    active={theme === "system"}
                    onClick={() => setTheme("system")}
                    title="System Default"
                    description="Auto-switches layout themes matched to system rules."
                    previewBg="bg-gradient-to-r from-white to-zinc-950 border-zinc-400"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <CardTitle>Notification Alert Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground mb-4">
                  Manage when and where notifications are delivered. Preferences are auto-saved.
                </p>

                <div className="space-y-2">
                  <NotifToggleRow
                    checked={notifPreferences.task_assigned}
                    onChange={() => handleToggleNotif("task_assigned")}
                    title="Task Assignment Alerts"
                    description="Notify me instantly when I am assigned to project tasks."
                  />
                  <NotifToggleRow
                    checked={notifPreferences.task_updated}
                    onChange={() => handleToggleNotif("task_updated")}
                    title="Task Updates"
                    description="Alert when cards I'm watching undergo changes."
                  />
                  <NotifToggleRow
                    checked={notifPreferences.comment_added}
                    onChange={() => handleToggleNotif("comment_added")}
                    title="Comments Activity Feed"
                    description="Notify when team members append comments to active tasks."
                  />
                  <NotifToggleRow
                    checked={notifPreferences.email_digest}
                    onChange={() => handleToggleNotif("email_digest")}
                    title="Weekly Summary Digest"
                    description="Receive email digest lists covering workspace status."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card className="border-border/80 bg-card/45 backdrop-blur">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <AccountInfoItem
                  icon={ShieldCheck}
                  title="Verified Account Check"
                  value={profile?.is_verified ? "Verified Professional" : "Unverified Account"}
                  status={profile?.is_verified ? "success" : "warning"}
                />
                <AccountInfoItem
                  icon={Layers}
                  title="Subscription Role"
                  value={profile?.role ? profile.role.toUpperCase() : "MEMBER"}
                  status="info"
                />
                <AccountInfoItem
                  icon={Calendar}
                  title="Sign Up Date"
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  status="info"
                />
                <AccountInfoItem
                  icon={Sparkles}
                  title="System Status"
                  value={profile?.is_active ? "Active Dev Node" : "Inactive"}
                  status={profile?.is_active ? "success" : "error"}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && (
            <AISettings />
          )}
        </main>
      </div>
    </div>
  );
};

// Sub-components for SettingsPage layout

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none shrink-0 w-full text-left cursor-pointer",
      active 
        ? "bg-accent/60 text-foreground font-bold border border-border/40 shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
    )}
  >
    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
    <span>{label}</span>
  </button>
);

interface ThemeSelectCardProps {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  previewBg: string;
}

const ThemeSelectCard: React.FC<ThemeSelectCardProps> = ({ active, onClick, title, description, previewBg }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group border rounded-xl p-4 text-left space-y-3 bg-card/20 transition-all flex flex-col justify-between h-40 cursor-pointer hover:shadow-md",
      active ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "border-border/60 hover:border-border"
    )}
  >
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground leading-none">{title}</span>
        {active && <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">✓</span>}
      </div>
      <p className="text-[10px] text-muted-foreground leading-normal">{description}</p>
    </div>

    {/* Color preview bar block */}
    <div className={cn("h-10 w-full rounded border flex items-end p-1 overflow-hidden shrink-0", previewBg)}>
      <div className="flex gap-1 w-full">
        <div className="h-2 w-3 rounded-full bg-primary shrink-0" />
        <div className="h-2 w-full rounded bg-muted-foreground/30" />
      </div>
    </div>
  </button>
);

interface NotifToggleRowProps {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}

const NotifToggleRow: React.FC<NotifToggleRowProps> = ({ checked, onChange, title, description }) => (
  <div className="flex items-center justify-between p-3 border border-border/50 bg-card/5 rounded-xl hover:bg-accent/10 transition-colors">
    <div className="flex flex-col gap-0.5 max-w-[80%]">
      <span className="text-xs font-bold text-foreground leading-tight">{title}</span>
      <span className="text-[10px] text-muted-foreground leading-normal">{description}</span>
    </div>

    {/* Switch Control */}
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "h-5 w-9 rounded-full transition-all relative border border-transparent shadow cursor-pointer focus:outline-none",
        checked ? "bg-primary" : "bg-zinc-700"
      )}
    >
      <span 
        className={cn(
          "h-4 w-4 rounded-full bg-white absolute top-[0.5px] transition-all shadow-sm",
          checked ? "right-[1px]" : "left-[1px]"
        )}
      />
    </button>
  </div>
);

interface AccountInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  status: "success" | "warning" | "error" | "info";
}

const AccountInfoItem: React.FC<AccountInfoItemProps> = ({ icon: Icon, title, value, status }) => (
  <div className="flex items-center gap-3 p-3.5 border border-border/50 bg-card/10 rounded-xl">
    <div className={cn(
      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
      status === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      status === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-600",
      status === "error" && "bg-rose-500/10 border-rose-500/20 text-rose-600",
      status === "info" && "bg-primary/10 border-primary/20 text-primary"
    )}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
      <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">{value}</span>
    </div>
  </div>
);
