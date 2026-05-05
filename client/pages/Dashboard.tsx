import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  getDashboardMetrics,
  getUserProgress,
  getProgressChart,
  getRecommendations,
} from "@/hooks/useApi";
import {
  DashboardMetrics, // Import interfaces
  UserProgress,
  SkillScore,
  ActivityEntry
} from "@shared/api";
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  Users,
  Star,
  Award,
  Clock,
  Zap,
  Globe,
  Download,
  Share2,
  Loader2 // Import Loader
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast"; // Import toast

// --- Removed all DEFAULT_ static data ---

// This remains static as it's for UI demonstration
const ACHIEVEMENTS = [
  { title: "First Practice", description: "Completed your first speaking practice", icon: Star, earned: true },
  { title: "Week Warrior", description: "Practiced for 7 consecutive days", icon: Calendar, earned: true },
  { title: "Band 7 Hero", description: "Achieved Band 7 in any module", icon: Award, earned: true },
  { title: "Grammar Master", description: "Perfect grammar score in writing", icon: Trophy, earned: false },
  { title: "Pronunciation Pro", description: "95%+ pronunciation accuracy", icon: Zap, earned: false },
  { title: "Global Learner", description: "Top 10% worldwide", icon: Globe, earned: false },
];

const chartConfig = {
  speaking: {
    label: "Speaking",
    color: "hsl(var(--ielts-blue))",
  },
  writing: {
    label: "Writing",
    color: "hsl(var(--ielts-teal))",
  },
  reading: {
    label: "Reading",
    color: "hsl(var(--ielts-green))",
  },
  listening: {
    label: "Listening",
    color: "hsl(var(--ielts-orange))",
  },
};

// --- Define Progress Chart type ---
type ProgressChartData = {
  month: string;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
};

// --- Define Recommendations type ---
type Recommendation = {
  id: number;
  title: string;
  description: string;
  icon: string;
  priority: string;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [chartData, setChartData] = useState<ProgressChartData[] | null>(null);
  const [skillsData, setSkillsData] = useState<SkillScore[] | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, progressRes, chartRes, recsRes] = await Promise.all([
          getDashboardMetrics(),
          getUserProgress(),
          getProgressChart(),
          getRecommendations(),
        ]);

        if (metricsRes?.success) {
          setMetrics(metricsRes.data);
          // Set skills data from metrics
          const formattedSkills = metricsRes.data.skillsBreakdown.map(skill => ({
            ...skill,
            fullMark: 9
          }));
          setSkillsData(formattedSkills);
        } else {
          throw new Error(metricsRes.error || "Failed to get metrics");
        }
        
        if (progressRes?.success) {
           setProgress(progressRes.data);
        } else {
           throw new Error(progressRes.error || "Failed to get progress");
        }
        
        if (chartRes?.success) {
          setChartData(chartRes.data);
        } else {
           throw new Error(chartRes.error || "Failed to get chart data");
        }
        
        if (recsRes?.success) {
          setRecommendations(recsRes.data);
        } else {
          throw new Error(recsRes.error || "Failed to get recommendations");
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]); // Removed dependencies to only run once

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ielts-blue"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate module distribution from real progress data
  const moduleDistribution = [
    { name: "Speaking", value: progress?.speaking?.practiceCount || 0, color: "hsl(var(--ielts-blue))" },
    { name: "Writing", value: progress?.writing?.practiceCount || 0, color: "hsl(var(--ielts-teal))" },
    { name: "Reading", value: progress?.reading?.practiceCount || 0, color: "hsl(var(--ielts-green))" },
    { name: "Listening", value: progress?.listening?.practiceCount || 0, color: "hsl(var(--ielts-orange))" },
  ].filter(item => item.value > 0); // Filter out empty modules
  
  // Calculate practice time from real progress data
  const practiceTimeData = [
    { day: "Mon", time: 0 },
    { day: "Tue", time: 0 },
    { day: "Wed", time: 0 },
    { day: "Thu", time: 0 },
    { day: "Fri", time: 0 },
    { day: "Sat", time: 0 },
    { day: "Sun", time: 0 },
  ];
  if (metrics?.recentActivity) {
     metrics.recentActivity.forEach((activity: ActivityEntry) => {
        const day = new Date(activity.timestamp).getDay(); // 0 = Sun, 1 = Mon
        const dayIndex = (day === 0) ? 6 : day - 1; // Adjust to Mon = 0
        // This is a demo, so we'll just add a fixed amount per activity
        practiceTimeData[dayIndex].time += 15;
     });
  }


  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Performance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your progress and achieve your IELTS goals
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Progress
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics ? (
              <>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Band Score</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-ielts-blue">{metrics.currentBand.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Based on recent activity
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Target Band Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-ielts-teal">{metrics.targetBand.toFixed(1)}</div>
                    <div className="mt-2">
                      <Progress value={metrics.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{metrics.progress}% achieved</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Practice Hours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-ielts-green">{metrics.practiceHours.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total all time
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-ielts-orange">{metrics.globalRank}</div>
                    <p className="text-xs text-muted-foreground">
                      Among 50,000+ learners
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Skeleton loaders for metrics
              [...Array(4)].map((_, i) => (
                 <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Progress Over Time */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Band Score Progress</CardTitle>
                <CardDescription>Your improvement across all modules over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  {chartData ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 9]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="speaking" stroke="var(--color-speaking)" strokeWidth={2} />
                      <Line type="monotone" dataKey="writing" stroke="var(--color-writing)" strokeWidth={2} />
                      <Line type="monotone" dataKey="reading" stroke="var(--color-reading)" strokeWidth={2} />
                      <Line type="monotone" dataKey="listening" stroke="var(--color-listening)" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <div className="h-[300px] w-full flex items-center justify-center">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Skills Radar */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>Detailed breakdown of your language skills</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  {skillsData ? (
                    <RadarChart data={skillsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 9]} />
                      <Radar
                        name="Current Score"
                        dataKey="score"
                        stroke="hsl(var(--ielts-blue))"
                        fill="hsl(var(--ielts-blue))"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  ) : (
                     <div className="h-[300px] w-full flex items-center justify-center">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Practice Time */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Weekly Practice Time</CardTitle>
                <CardDescription>Minutes practiced each day (Demo)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[200px]">
                  <BarChart data={practiceTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="time" fill="hsl(var(--ielts-blue))" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Module Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Practice Distribution</CardTitle>
                <CardDescription>Practice count per module</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[200px]">
                  {moduleDistribution.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={moduleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {moduleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  ) : (
                    <div className="h-[200px] w-full flex items-center justify-center">
                       <p className="text-muted-foreground">No practice data yet.</p>
                    </div>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ACHIEVEMENTS.slice(0, 4).map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${achievement.earned ? 'bg-ielts-blue/10' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${achievement.earned ? 'bg-ielts-blue text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="bg-ielts-blue/10 text-ielts-blue">
                          Earned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Personalized suggestions to improve your band score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations && recommendations.length > 0 ? recommendations.map((rec, index) => {
                  const colors = [
                    { bg: "bg-ielts-blue/5", border: "border-ielts-blue/20", bgIcon: "bg-ielts-blue" },
                    { bg: "bg-ielts-teal/5", border: "border-ielts-teal/20", bgIcon: "bg-ielts-teal" },
                    { bg: "bg-ielts-green/5", border: "border-ielts-green/20", bgIcon: "bg-ielts-green" },
                  ];
                  const color = colors[index % 3];
                  
                  let Icon = Target;
                  if (rec.icon === "Award") Icon = Award;
                  if (rec.icon === "Clock") Icon = Clock;

                  return (
                    <div key={rec.id} className={`p-4 ${color.bg} rounded-xl border ${color.border}`}>
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 ${color.bgIcon} rounded-lg flex items-center justify-center mr-3`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{rec.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  );
                }) : (
                  <p className="text-muted-foreground col-span-3">No recommendations available yet. Complete more practice sessions!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}