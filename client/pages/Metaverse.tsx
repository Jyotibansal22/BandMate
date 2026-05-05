import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  getPracticeRooms,
  getLeaderboard,
  getAchievements,
  getChallenges,
  joinPracticeRoom,
} from "@/hooks/useApi";
import {
  PracticeRoom, // Import types from shared API
  LeaderboardEntry,
  Achievement,
  Challenge,
} from "@shared/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Clock,
  MessageSquare,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Globe,
  TrendingUp,
  Award,
  Play,
  Pause,
  UserCheck,
  Gamepad2,
  Sparkles,
  Medal,
  Gift,
  Calendar,
  ArrowRight,
  Volume2,
  CheckCircle,
  Loader2 // Import Loader
} from "lucide-react";
import Layout from "@/components/Layout";

// --- DELETED ALL STATIC (FAKE) DATA ARRAYS ---
// const practiceRooms = [...]
// const leaderboard = [...]
// const achievements = [...]
// const challenges = [...]

export default function Metaverse() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState("rooms");
  
  // These state variables will now be used
  const [rooms, setRooms] = useState<PracticeRoom[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        const [roomsRes, lbRes, achRes, chalRes] = await Promise.all([
          getPracticeRooms(),
          getLeaderboard(),
          getAchievements(),
          getChallenges(),
        ]);

        if (roomsRes.success) setRooms(roomsRes.data);
        if (lbRes.success) setLeaderboard(lbRes.data);
        if (achRes.success) setAchievements(achRes.data);
        if (chalRes.success) setChallenges(chalRes.data);

      } catch (error) {
        console.error("Failed to fetch metaverse data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load metaverse data",
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [toast]);

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "Live": return "bg-green-500";
      case "Starting Soon": return "bg-yellow-500";
      case "Waiting": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case "crown": return Crown;
      case "trophy": return Trophy;
      case "medal": return Medal;
      case "star": return Star;
      case "target": return Target;
      default: return Award;
    }
  };
  
  // Helper to get the correct icon component
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "Calendar": return Calendar;
      case "Mic": return Mic;
      case "Users": return Users;
      case "Target": return Target;
      default: return Award;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "platinum": return "from-purple-400 to-purple-600";
      case "gold": return "from-yellow-400 to-yellow-600";
      case "silver": return "from-gray-300 to-gray-500";
      case "bronze": return "from-orange-400 to-orange-600";
      default: return "from-blue-400 to-blue-600";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-500/20 to-teal-400/20 rounded-3xl blur-3xl" />
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
                IELTS Metaverse
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join the global community of IELTS learners. Practice together, compete, and achieve your goals!
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="rooms" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Practice Rooms</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Challenges</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-ielts-blue" />
              </div>
            )}

            {/* Practice Rooms */}
            <TabsContent value="rooms">
              {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rooms && rooms.length > 0 ? rooms.map((room) => (
                    <Card key={room.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl mb-2">{room.name}</CardTitle>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {room.type}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${
                                room.difficulty === 'Beginner' ? 'border-green-300 text-green-700' :
                                room.difficulty === 'Advanced' ? 'border-orange-300 text-orange-700' :
                                room.difficulty === 'Expert' ? 'border-red-300 text-red-700' :
                                'border-blue-300 text-blue-700'
                              }`}>
                                {room.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getRoomStatusColor(room.status)} animate-pulse`} />
                            <span className="text-sm font-medium">{room.status}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Host:</strong> {room.host}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Topic:</strong> {room.topic}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Duration:</strong> {room.duration}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{room.participants}/{room.maxParticipants}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{room.avgBand} avg</span>
                          </div>
                        </div>

                        <Progress value={(room.participants / room.maxParticipants) * 100} className="h-2" />

                        <Button
                          className="w-full"
                          disabled={room.participants >= room.maxParticipants}
                          onClick={async () => {
                            try {
                              await joinPracticeRoom(room.id);
                              toast({
                                title: "Success",
                                description: `Joined ${room.name}`,
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to join room",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {room.status === "Live" ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Join Live Session
                            </>
                          ) : room.status === "Starting Soon" ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Reserve Spot
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Join Waiting List
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <p className="text-muted-foreground text-center lg:col-span-2">No practice rooms available right now.</p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Leaderboard */}
            <TabsContent value="leaderboard">
              {!loading && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
                      Global Leaderboard
                    </CardTitle>
                    <CardDescription>Top performers this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard && leaderboard.length > 0 ? leaderboard.map((player) => {
                        const BadgeIcon = getBadgeIcon(player.badge);
                        return (
                          <div key={player.rank} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                            player.name === "You" ? "border-ielts-blue bg-ielts-blue/10" : "border-transparent bg-white/50"
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                player.rank === 1 ? "bg-yellow-500" :
                                player.rank === 2 ? "bg-gray-400" :
                                player.rank === 3 ? "bg-orange-500" :
                                "bg-blue-500"
                              }`}>
                                {player.rank}
                              </div>
                              <Avatar>
                                <AvatarFallback>{player.avatar}</AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold">{player.name}</span>
                                <BadgeIcon className="w-4 h-4 text-yellow-500" />
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{player.level}</span>
                                <span>🔥 {player.streak} day streak</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-ielts-blue">{player.score.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">XP</div>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-muted-foreground text-center">Leaderboard data is not available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements">
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements && achievements.length > 0 ? achievements.map((achievement) => {
                    const Icon = getAchievementIcon(achievement.icon);
                    return (
                      <Card key={achievement.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl ${
                        achievement.earned ? "ring-2 ring-yellow-400" : ""
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                                <CardDescription>{achievement.description}</CardDescription>
                              </div>
                            </div>
                            {achievement.earned && (
                              <Badge className="bg-yellow-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Earned
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{achievement.progress}/{achievement.target}</span>
                            </div>
                            <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Reward</span>
                              <Badge variant="outline" className="text-xs">
                                <Gift className="w-3 h-3 mr-1" />
                                {achievement.points} XP
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }) : (
                     <p className="text-muted-foreground text-center md:col-span-2">No achievements found.</p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Challenges */}
            <TabsContent value="challenges">
              {!loading && (
                <div className="space-y-6">
                  {challenges && challenges.length > 0 ? challenges.map((challenge) => (
                    <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{challenge.title}</CardTitle>
                            <CardDescription>{challenge.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge variant={challenge.difficulty === "Easy" ? "secondary" : challenge.difficulty === "Medium" ? "default" : "destructive"}>
                              {challenge.difficulty}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {challenge.timeLeft}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm">{challenge.progress}/{challenge.target}</span>
                            </div>
                            <Progress value={(challenge.progress / challenge.target) * 100} className="h-3" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Gift className="w-4 h-4 text-ielts-orange" />
                              <span className="text-sm font-medium">{challenge.reward}</span>
                            </div>
                            <Button size="sm">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <p className="text-muted-foreground text-center">No challenges available right now.</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}