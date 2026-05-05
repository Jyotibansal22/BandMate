import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Calendar,
  Target,
  Trophy,
  Settings,
  LogOut,
  Edit2,
  Check,
  X,
  Award,
  TrendingUp,
  Clock,
  Loader2,
  Mic,
  Users as CommunityIcon
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  getDashboardMetrics,
  getUserProgress,
  getAchievements,
} from "@/hooks/useApi"; 
import {
  DashboardMetrics,
  UserProgress,
  Achievement,
} from "@shared/api";
// Removed theme imports

export default function Profile() {
  const [user, setUser] = useState<any>(null); // This is the "fake" user from login
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  // Removed useTheme hook

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load "fake" user from localStorage (for name/email)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditData(userData); // Set initial edit data
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [metricsRes, progressRes, achRes] = await Promise.all([
          getDashboardMetrics(),
          getUserProgress(),
          getAchievements(),
        ]);

        if (metricsRes.success) setMetrics(metricsRes.data);
        if (progressRes.success) setProgress(progressRes.data);
        if (achRes.success) setAchievements(achRes.data);

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load real profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // This is still a "fake" update to localStorage
      // A real app would have a POST /api/profile/update endpoint
      const updatedUser = { ...user, ...editData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully (Demo)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  };
  
  // Helper to get the correct icon component
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "Calendar": return Calendar;
      case "Mic": return Mic;
      case "Users": return CommunityIcon;
      case "Target": return Target;
      default: return Award;
    }
  };

  if (!user || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-ielts-blue" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const totalSubmissions = (progress?.speaking.practiceCount || 0) + (progress?.writing.practiceCount || 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account and learning preferences
              </p>
            </div>
            <Button
              variant="destructive"
              className="mt-4 sm:mt-0"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-2xl">
                      <User className="w-6 h-6 mr-3 text-ielts-blue" />
                      Personal Information
                    </CardTitle>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="border-1"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                          type="email"
                          value={editData.email || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="border-1"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Band Score</label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={editData.targetBand || metrics?.targetBand || 8.0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              targetBand: parseFloat(e.target.value),
                            })
                          }
                          className="border-1"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex-1 bg-gradient-to-r from-ielts-blue to-ielts-teal"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditData(user);
                          }}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-ielts-blue/10 to-ielts-teal/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-ielts-blue to-ielts-teal rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="w-4 h-4 text-ielts-blue" />
                            <p className="text-sm text-muted-foreground">Email</p>
                          </div>
                          <p className="font-medium">{user.email}</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="w-4 h-4 text-ielts-teal" />
                            <p className="text-sm text-muted-foreground">Target Band</p>
                          </div>
                          <p className="font-medium">{metrics?.targetBand.toFixed(1) || "8.0"} / 9.0</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-ielts-green" />
                            <p className="text-sm text-muted-foreground">Account Age</p>
                          </div>
                          <p className="font-medium">
                            {Math.floor(
                              (Date.now() - new Date(user.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="w-4 h-4 text-ielts-orange" />
                            <p className="text-sm text-muted-foreground">Status</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-ielts-blue to-ielts-teal">
                            Active Learner
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Settings className="w-5 h-5 mr-3 text-ielts-blue" />
                    Learning Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-ielts-blue/5 to-ielts-teal/5 rounded-lg border">
                    <div>
                      <p className="font-medium">Daily Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified about your daily practice</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-ielts-blue/5 to-ielts-teal/5 rounded-lg border">
                    <div>
                      <p className="font-medium">Email Updates</p>
                      <p className="text-sm text-muted-foreground">Receive progress updates and tips</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>

                  {/* --- REMOVED DARK MODE TOGGLE --- */}

                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Learning Stats */}
              <Card className="bg-gradient-to-br from-ielts-blue/10 to-ielts-teal/10 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-ielts-blue" />
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-3xl font-bold text-ielts-blue">{metrics?.currentBand.toFixed(1) || "0.0"}</p>
                    <p className="text-sm text-muted-foreground">Current Band Score</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Practice Streak</span>
                        <span className="font-medium">{metrics?.practiceStreak || 0} days</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Total Practice</span>
                        <span className="font-medium">{metrics?.practiceHours.toFixed(1) || 0} hours</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Submissions</span>
                        <span className="font-medium">{totalSubmissions}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-gradient-to-br from-ielts-green/10 to-emerald-400/10 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Trophy className="w-5 h-5 mr-2 text-ielts-green" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements && achievements.length > 0 ? (
                    achievements.slice(0, 3).map((ach) => {
                      const Icon = getAchievementIcon(ach.icon);
                      return (
                        <div key={ach.id} className={`flex items-center space-x-3 p-3 bg-white/50 rounded-lg ${ach.earned ? '' : 'opacity-50'}`}>
                          <div className={`w-10 h-10 ${ach.earned ? 'bg-ielts-blue' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${ach.earned ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{ach.title}</p>
                            <p className="text-xs text-muted-foreground">{ach.description}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No achievements yet. Keep practicing!</p>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure? This action cannot be undone."
                        )
                      ) {
                        handleLogout();
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}