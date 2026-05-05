import React, { useState, useRef, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  submitSpeakingRecording,
  analyzeSpeakingSubmission,
  getPracticeRooms,
  getUserProfile,
  getSpeakingAnalytics // Added
} from "@/hooks/useApi";
import { PracticeRoom, UserProfile, SpeakingFeedback } from "@shared/api"; // Import types
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Volume2,
  Star,
  Clock,
  TrendingUp,
  Award,
  Brain,
  Zap,
  RotateCcw,
  Waves,
  Globe,
  Heart,
  Users,
  Target,
  Sparkles,
  BookOpen,
  MessageSquare,
  Copy,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  HeadphonesIcon,
  Activity,
  Loader2
} from "lucide-react";
import Layout from "@/components/Layout";

const speakingParts = [
  {
    id: "part1",
    title: "Part 1: Introduction",
    duration: "4-5 minutes",
    description: "General questions about yourself, family, work, studies, and interests",
    questions: [
      "Can you tell me your full name?",
      "Where are you from?",
      "What do you do for work/study?",
      "Do you enjoy your work/studies?",
      "What do you like to do in your free time?"
    ]
  },
  {
    id: "part2", 
    title: "Part 2: Cue Card",
    duration: "3-4 minutes",
    description: "Speak for 1-2 minutes on a given topic after 1 minute preparation",
    topic: "Describe a memorable journey you have taken",
    points: [
      "Where you went",
      "Who you went with", 
      "What you did there",
      "Why it was memorable"
    ]
  },
  {
    id: "part3",
    title: "Part 3: Follow-up Discussion", 
    duration: "4-5 minutes",
    description: "Abstract discussion related to Part 2 topic",
    questions: [
      "How has travel changed in recent years?",
      "What are the benefits of traveling?",
      "Do you think space travel will be common in the future?",
      "How does tourism affect local communities?"
    ]
  }
];

// --- Interface for Speaking Analytics ---
interface SpeakingAnalytics {
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  totalPracticeDuration: number; // This is in seconds
}

export default function Speaking() {
  const [selectedPart, setSelectedPart] = useState("part1");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeFeature, setActiveFeature] = useState("practice");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0).map(() => Math.random() * 100));
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<SpeakingFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- States for Backend Data ---
  const [roleplayRooms, setRoleplayRooms] = useState<PracticeRoom[] | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [speakingAnalytics, setSpeakingAnalytics] = useState<SpeakingAnalytics | null>(null); // State for progress
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true); // State for progress card
  // ---

  const currentPart = speakingParts.find(part => part.id === selectedPart);

  // --- Fixed Recording Timer ---
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setWaveformData(Array(20).fill(0).map(() => Math.random() * 100));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);
  // ---

  // --- Effect to Fetch Tab Data ---
  useEffect(() => {
    const fetchTabData = async () => {
      // Don't fetch if data already exists
      if (activeFeature === "roleplay" && roleplayRooms) return;
      if (activeFeature === "analytics" && profileData) return;

      setIsLoadingTabs(true);
      try {
        if (activeFeature === "roleplay") {
          const roomsRes = await getPracticeRooms();
          if (roomsRes.success) {
            setRoleplayRooms(roomsRes.data);
          } else {
            throw new Error(roomsRes.error || "Failed to get practice rooms");
          }
        } else if (activeFeature === "analytics") {
          const profileRes = await getUserProfile();
          if (profileRes.success) {
            setProfileData(profileRes.data);
          } else {
            throw new Error(profileRes.error || "Failed to get user profile");
          }
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "Failed to fetch",
          variant: "destructive"
        });
      } finally {
        setIsLoadingTabs(false);
      }
    };
    
    // Only fetch if the tab is active
    if (activeFeature === "roleplay" || activeFeature === "analytics") {
      fetchTabData();
    }
  }, [activeFeature, roleplayRooms, profileData, toast]);
  // ---

  // --- NEW: Effect to Fetch Progress Data ---
  const fetchProgressData = async () => {
    setIsLoadingProgress(true);
    try {
      const analyticsRes = await getSpeakingAnalytics();
      if (analyticsRes.success) {
        setSpeakingAnalytics(analyticsRes.data);
      } else {
        throw new Error(analyticsRes.error || "Failed to get analytics");
      }
    } catch (error) {
        toast({
        title: "Error loading progress",
        description: error instanceof Error ? error.message : "Failed to fetch",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };
  
  useEffect(() => {
    fetchProgressData(); // Runs on page load
  }, []); 
  // ---

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // --- NEW: Start/Stop Recording Handlers ---
  const handleStartRecording = async () => {
    // --- NEW: Request Microphone Permission ---
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast({
        title: "Microphone permission denied",
        description: "Please allow microphone access in your browser settings.",
        variant: "destructive",
      });
      return;
    }
    // ---
    
    // Reset everything related to previous analysis
    setCurrentSubmissionId(null);
    setFeedbackData(null);
    setShowFeedback(false);
    setRecordingTime(0);
    
    setIsRecording(true);
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
  };
  // ---

  const handleSubmitRecording = async () => {
    if (isRecording) {
      toast({
        title: "Error",
        description: "Please stop the recording first",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await submitSpeakingRecording(
        selectedPart,
        "mock-audio-url", // In production, this would be the actual audio file
        recordingTime
      );

      if (result.success) {
        setCurrentSubmissionId(result.data.id);
        toast({
          title: "Success",
          description: "Recording submitted successfully. You can now analyze it.",
        });
        // --- NEW: Refresh progress after submission ---
        fetchProgressData();
        // ---
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit recording",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (!currentSubmissionId) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSpeakingSubmission(currentSubmissionId);

      if (result.success) {
        setFeedbackData(result.data);
        setShowFeedback(true); // Show feedback in the sidebar
        toast({
          title: "Analysis Complete",
          description: "Your recording has been analyzed",
        });
        // --- NEW: Refresh progress after analysis to update avg score ---
        fetchProgressData();
        // ---
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze submission",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- NEW: Clear Feedback Handler ---
  const handleClearFeedback = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    setCurrentSubmissionId(null);
    toast({
      title: "Feedback Cleared",
      description: "You can submit a new recording to analyze.",
    });
  };
  // ---

  const WaveformVisualization = () => (
    <div className="flex items-end justify-center space-x-1 h-16 bg-gradient-to-t from-ielts-blue/20 to-transparent rounded-lg p-2">
      {waveformData.map((height, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-ielts-blue to-ielts-teal rounded-sm transition-all duration-300"
          style={{ 
            height: `${Math.max(4, height * 0.6)}%`, 
            width: '4px',
            opacity: isRecording ? 1 : 0.3 
          }}
        />
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-ielts-blue/5 to-ielts-teal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-ielts-blue/20 via-transparent to-ielts-teal/20 rounded-3xl blur-3xl" />
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-ielts-blue via-ielts-teal to-ielts-green rounded-3xl flex items-center justify-center shadow-2xl">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-ielts-orange to-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-ielts-blue via-ielts-teal to-ielts-green bg-clip-text text-transparent mb-4">
                AI-Powered Speaking Lab
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Next-generation IELTS speaking practice with accent adaptation, stress analysis, and real-time AI coaching
              </p>
            </div>
          </div>

          {/* Feature Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button
                variant={activeFeature === "practice" ? "default" : "outline"}
                onClick={() => setActiveFeature("practice")}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Practice Mode</span>
              </Button>
              <Button
                variant={activeFeature === "roleplay" ? "default" : "outline"}
                onClick={() => setActiveFeature("roleplay")}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Roleplay Scenarios</span>
              </Button>
              <Button
                variant={activeFeature === "accent" ? "default" : "outline"}
                onClick={() => setActiveFeature("accent")}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Accent Lab</span>
              </Button>
              <Button
                variant={activeFeature === "analytics" ? "default" : "outline"}
                onClick={() => setActiveFeature("analytics")}
                className="flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>AI Analytics</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Practice Area */}
            <div className="lg:col-span-2 space-y-6">
              {activeFeature === "practice" && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{currentPart?.title}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Clock className="w-4 h-4 mr-2" />
                          {currentPart?.duration}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-gradient-to-r from-ielts-blue to-ielts-teal text-white">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">{currentPart?.description}</p>

                    {/* Part Selector */}
                    <Tabs value={selectedPart} onValueChange={setSelectedPart}>
                      <TabsList className="grid w-full grid-cols-3">
                        {speakingParts.map((part) => (
                          <TabsTrigger key={part.id} value={part.id} className="text-xs sm:text-sm">
                            {part.title.split(':')[1]}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {speakingParts.map((part) => (
                        <TabsContent key={part.id} value={part.id} className="mt-6">
                          {part.id === "part2" ? (
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-ielts-blue/10 to-ielts-teal/10 p-6 rounded-xl border border-ielts-blue/20">
                                <h3 className="font-semibold text-lg mb-4">{part.topic}</h3>
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">You should talk about:</p>
                                  <ul className="space-y-1">
                                    {part.points?.map((point, index) => (
                                      <li key={index} className="flex items-center text-sm">
                                        <Star className="w-3 h-3 text-ielts-teal mr-2 fill-current" />
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-ielts-blue/10 to-ielts-teal/10 p-6 rounded-xl border border-ielts-blue/20">
                                <h3 className="font-semibold mb-4">
                                  Question {currentQuestion + 1} of {part.questions?.length}
                                </h3>
                                <p className="text-lg">{part.questions?.[currentQuestion]}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                  disabled={currentQuestion === 0}
                                >
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentQuestion(Math.min((part.questions?.length || 1) - 1, currentQuestion + 1))}
                                  disabled={currentQuestion === (part.questions?.length || 1) - 1}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>

                    {/* --- FIXED Recording Controls --- */}
                    <div className="flex flex-col items-center space-y-6 py-8 bg-gradient-to-b from-transparent to-ielts-blue/5 rounded-xl">
                      
                      {/* Separate Record and Stop Buttons */}
                      <div className="flex items-center space-x-4">
                        <Button
                          size="lg"
                          className="w-32 h-16 rounded-lg text-white shadow-lg bg-gradient-to-r from-ielts-blue to-ielts-teal hover:from-ielts-blue/90 hover:to-ielts-teal/90 disabled:opacity-50"
                          onClick={handleStartRecording}
                          disabled={isRecording}
                        >
                          <Mic className="w-6 h-6 mr-2" />
                          Record
                        </Button>
                        <Button
                          size="lg"
                          className="w-32 h-16 rounded-lg text-white shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
                          onClick={handleStopRecording}
                          disabled={!isRecording}
                        >
                          <Square className="w-6 h-6 mr-2" />
                          Stop
                        </Button>
                      </div>
                      
                      <div className="text-center h-10"> 
                        <p className="text-lg font-medium">
                          {isRecording ? `Recording... ${formatTime(recordingTime)}` : (recordingTime > 0 ? `Recording finished: ${formatTime(recordingTime)}` : "Click 'Record' to start")}
                        </p>
                        {isRecording && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Real-time accent analysis & stress detection active
                          </p>
                        )}
                      </div>

                      {/* Enhanced Waveform */}
                      <div className="w-full max-w-md">
                        <WaveformVisualization />
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>Audio Level</span>
                          <span>{isRecording ? "LIVE" : "IDLE"}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          disabled={isRecording || isSubmitting || recordingTime === 0}
                          onClick={handleSubmitRecording}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Submit Recording
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleAnalyzeFeedback}
                          disabled={!currentSubmissionId || isRecording || isAnalyzing}
                          className="bg-gradient-to-r from-ielts-green/10 to-ielts-teal/10 border-ielts-teal/30"
                        >
                          {isAnalyzing ? (
                             <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                             <>
                              <Brain className="w-4 h-4 mr-2" />
                              Get AI Analysis
                            </>
                          )}
                        </Button>
                        <Button variant="outline" className="bg-gradient-to-r from-ielts-orange/10 to-yellow-400/10 border-ielts-orange/30">
                          <HeadphonesIcon className="w-4 h-4 mr-2" />
                          Speech Twin
                        </Button>
                      </div>
                    </div>
                    {/* --- END FIXED Recording Controls --- */}
                  </CardContent>
                </Card>
              )}

              {/* --- DYNAMIC ROLEPLAY TAB --- */}
              {activeFeature === "roleplay" && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Users className="w-6 h-6 mr-3 text-ielts-blue" />
                      Immersive Roleplay Scenarios
                    </CardTitle>
                    <CardDescription>Practice real-world situations with AI interaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTabs && (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-ielts-blue" />
                      </div>
                    )}
                    <div className="grid gap-4">
                      {roleplayRooms && roleplayRooms.length > 0 ? roleplayRooms.map((scenario) => (
                        <div 
                          key={scenario.id}
                          className="p-4 rounded-xl border-2 border-transparent hover:border-ielts-blue/30 transition-all cursor-pointer bg-gradient-to-r from-ielts-blue/5 to-ielts-teal/5"
                          onClick={() => setSelectedScenario(scenario)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{scenario.name}</h3>
                            <Badge variant="outline" className={`
                              ${scenario.difficulty === 'Beginner' ? 'border-green-300 text-green-700' : 
                                scenario.difficulty === 'Intermediate' ? 'border-yellow-300 text-yellow-700' : 
                                scenario.difficulty === 'Advanced' ? 'border-orange-300 text-orange-700' :
                                'border-red-300 text-red-700'}
                            `}>
                              {scenario.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{scenario.type} Practice (Host: {scenario.host})</p>
                          <p className="text-xs bg-white/50 p-2 rounded italic">{scenario.topic}</p>
                        </div>
                      )) : (
                        !isLoadingTabs && <p className="text-muted-foreground text-center p-4">No practice rooms available right now.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* --- END DYNAMIC ROLEPLAY TAB --- */}

              {/* --- DYNAMIC ACCENT LAB TAB --- */}
              {activeFeature === "accent" && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Globe className="w-6 h-6 mr-3 text-ielts-blue" />
                      Accent Adaptation Lab
                    </CardTitle>
                    <CardDescription>AI-powered accent neutralization and pronunciation improvement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {feedbackData ? (
                      <>
                        {/* Accent Detection */}
                        <div className="bg-gradient-to-r from-ielts-blue/10 to-ielts-teal/10 p-6 rounded-xl">
                          <h3 className="font-semibold mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-ielts-blue" />
                            Detected Accent Profile
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Primary Accent:</span>
                              <Badge variant="secondary" className="bg-ielts-blue/20 text-ielts-blue">
                                {feedbackData.detectedAccent}
                              </Badge>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span>Mother-tongue Influence</span>
                                <span className="font-semibold">{feedbackData.accentInfluence}%</span>
                              </div>
                              <Progress value={feedbackData.accentInfluence} className="h-3" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span>Neutralization Progress</span>
                                <span className="font-semibold text-ielts-green">{feedbackData.neutralizationProgress}%</span>
                              </div>
                              <Progress value={feedbackData.neutralizationProgress} className="h-3" />
                            </div>
                          </div>
                        </div>

                        {/* Specific Issues */}
                        <div>
                          <h3 className="font-semibold mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-ielts-orange" />
                            Focus Areas for Improvement
                          </h3>
                          <div className="space-y-3">
                            {feedbackData.suggestions.map((suggestion, index) => (
                              <div key={index} className="p-4 bg-white/50 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Suggestion {index + 1}</span>
                                  <Badge variant={index === 0 ? 'destructive' : 'secondary'}>
                                    {index === 0 ? 'High Priority' : 'Medium Priority'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 h-80 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Please record and analyze a practice session
                            <br />
                            to see your Accent Lab report.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* --- END DYNAMIC ACCENT LAB TAB --- */}

              {/* --- DYNAMIC AI ANALYTICS TAB --- */}
              {activeFeature === "analytics" && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Activity className="w-6 h-6 mr-3 text-ielts-blue" />
                      Advanced AI Analytics
                    </CardTitle>
                    <CardDescription>Comprehensive analysis of your speaking performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Stress Analysis */}
                    <div className="bg-gradient-to-r from-ielts-purple/10 to-pink-400/10 p-6 rounded-xl">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-ielts-purple" />
                        Cognitive Load & Stress Analysis
                      </h3>
                      {feedbackData ? (
                        <>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-ielts-purple">{feedbackData.confidenceLevel}%</div>
                              <div className="text-sm text-muted-foreground">Confidence Level</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-ielts-orange">{feedbackData.hesitationCount}</div>
                              <div className="text-sm text-muted-foreground">Hesitations</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm"><strong>Stress Level:</strong> {feedbackData.stressLevel}</p>
                            <p className="text-sm"><strong>Pause Frequency:</strong> N/A (Mock Data)</p>
                          </div>
                        </>
                      ) : (
                         <p className="text-sm text-muted-foreground text-center p-4">
                          Analyze a recording to see stress analysis.
                         </p>
                      )}
                    </div>

                    {/* Global Benchmarking */}
                    <div className="bg-gradient-to-r from-ielts-green/10 to-ielts-teal/10 p-6 rounded-xl">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-ielts-green" />
                        Global Benchmarking
                      </h3>
                      {isLoadingTabs && !profileData && (
                        <div className="flex justify-center items-center h-20">
                          <Loader2 className="w-6 h-6 animate-spin text-ielts-green" />
                        </div>
                      )}
                      {profileData ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-ielts-green">{100 - profileData.globalRank}%</div>
                              <div className="text-sm text-muted-foreground">Global Percentile</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-ielts-blue">Top {profileData.globalRank}%</div>
                              <div className="text-sm text-muted-foreground">Global Ranking</div>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <p className="text-sm text-center text-muted-foreground">
                            Your performance is better than <strong>{100 - profileData.globalRank}%</strong> of learners
                          </p>
                        </>
                      ) : (
                         !isLoadingTabs && <p className="text-sm text-muted-foreground text-center p-4">
                          Could not load benchmark data.
                         </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* --- END DYNAMIC AI ANALYTICS TAB --- */}

            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* --- FIXED Smart Vocabulary Booster --- */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Lightbulb className="w-5 h-5 mr-2 text-ielts-orange" />
                    Smart Vocabulary Booster
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedbackData && feedbackData.suggestions && feedbackData.suggestions.length > 0 ? (
                    // If feedback IS available, show the (random) suggestions from the backend
                    feedbackData.suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="p-3 bg-white/70 rounded-lg border">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Suggestion {index + 1}</span>
                            <Badge variant="outline" className="text-xs">Improvement</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600">{suggestion}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="text-xs">Suggestion</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    // If no feedback is available, show the placeholder text
                    <p className="text-sm text-muted-foreground">Submit and analyze a recording to see suggestions</p>
                  )}
                </CardContent>
              </Card>
              {/* --- END FIXED Smart Vocabulary Booster --- */}


              {/* Enhanced Feedback */}
              {showFeedback && feedbackData && (
                <Card className="bg-gradient-to-br from-ielts-blue/10 to-ielts-teal/10 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="w-5 h-5 mr-2 text-ielts-blue" />
                      AI Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Pronunciation</span>
                          <Badge variant="secondary">{(feedbackData.pronunciation || 0).toFixed(1)}/9</Badge>
                        </div>
                        <Progress value={(feedbackData.pronunciation || 0) * 11.11} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Fluency</span>
                          <Badge variant="secondary">{(feedbackData.fluency || 0).toFixed(1)}/9</Badge>
                        </div>
                        <Progress value={(feedbackData.fluency || 0) * 11.11} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Vocabulary</span>
                          <Badge variant="secondary">{(feedbackData.vocabulary || 0).toFixed(1)}/9</Badge>
                        </div>
                        <Progress value={(feedbackData.vocabulary || 0) * 11.11} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Grammar</span>
                          <Badge variant="secondary">{(feedbackData.grammar || 0).toFixed(1)}/9</Badge>
                        </div>
                        <Progress value={(feedbackData.grammar || 0) * 11.11} className="h-2" />
                      </div>
                    </div>

                    <Separator />

                    {/* Adaptive Band Predictor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Overall Score</span>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-ielts-blue" />
                          <span className="text-xl font-bold text-ielts-blue">{(feedbackData.overall || 0).toFixed(1)}/9</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Confidence Level</span>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-ielts-orange" />
                          <span className="text-lg font-bold text-ielts-orange">{feedbackData.confidenceLevel}%</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-ielts-green/20 to-ielts-teal/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-center">Accent: {feedbackData.detectedAccent || "Analyzing..."}</p>
                      </div>

                      <div className="bg-gradient-to-r from-ielts-orange/20 to-yellow-400/20 p-3 rounded-lg">
                        <p className="text-sm"><strong>Stress Level:</strong> {feedbackData.stressLevel || "Medium"}</p>
                        <p className="text-sm"><strong>Hesitations:</strong> {feedbackData.hesitationCount || 0}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-ielts-orange" />
                        Improvement Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {feedbackData.suggestions && feedbackData.suggestions.length > 0 ? (
                          feedbackData.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-ielts-green mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">No suggestions yet</li>
                        )}
                      </ul>
                    </div>

                    <Button className="w-full" variant="outline" onClick={handleClearFeedback}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear Feedback
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* AI Features */}
              <Card className="bg-gradient-to-br from-ielts-purple/10 to-pink-400/10 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Zap className="w-5 h-5 mr-2 text-ielts-purple" />
                    Next-Level AI Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-ielts-blue rounded-full animate-pulse" />
                      <span className="text-sm">Real-time accent adaptation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-ielts-teal rounded-full animate-pulse" />
                      <span className="text-sm">Cognitive stress monitoring</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-ielts-green rounded-full animate-pulse" />
                      <span className="text-sm">Speech twin technology</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-ielts-orange rounded-full animate-pulse" />
                      <span className="text-sm">Global benchmarking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-ielts-purple rounded-full animate-pulse" />
                      <span className="text-sm">Immersive roleplay</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* --- FIXED Today's Progress --- */}
              <Card className="bg-gradient-to-br from-ielts-green/10 to-ielts-teal/10 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProgress ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="w-8 h-8 animate-spin text-ielts-green" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => { // Wrap in IIFE to calculate
                        const totalSubmissions = speakingAnalytics?.totalSubmissions || 0;
                        const totalMinutes = (speakingAnalytics?.totalPracticeDuration || 0) / 60;
                        const averageScore = speakingAnalytics?.averageScore || 0;

                        return (
                          <>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Practice Sessions</span>
                                <span>{totalSubmissions}/5</span>
                              </div>
                              <Progress value={(totalSubmissions / 5) * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Speaking Time</span>
                                <span>{totalMinutes.toFixed(1)}/20 min</span>
                              </div>
                              <Progress value={(totalMinutes / 20) * 100} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Average Score</span>
                                <span>{averageScore.toFixed(1)}/9.0</span>
                              </div>
                              <Progress value={(averageScore / 9) * 100} className="h-2" />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* --- END FIXED Today's Progress --- */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}