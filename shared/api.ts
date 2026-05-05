/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// User types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  currentBandScore: number;
  targetBandScore: number;
  totalPracticeHours: number;
  practiceStreak: number;
  globalRank: number;
}

export interface UserProgress {
  userId: string;
  speaking: ModuleProgress;
  writing: ModuleProgress;
  reading: ModuleProgress; // <--- FIXED TYPO
  listening: ModuleProgress;
  overallBand: number;
}

export interface ModuleProgress {
  currentBand: number;
  practiceCount: number;
  totalTime: number;
  lastPracticeDate: string | null; // <-- FIXED (added | null)
}

// Speaking types
export interface SpeakingSubmission {
  id: string;
  userId: string;
  partId: string;
  audioUrl: string;
  duration: number;
  timestamp: string;
  feedback?: SpeakingFeedback;
}

export interface SpeakingFeedback {
  overall: number;
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  stressLevel: string;
  confidenceLevel: number;
  hesitationCount: number;
  detectedAccent: string;
  accentInfluence: number;
  neutralizationProgress: number;
  suggestions: string[];
}

// Writing types
export interface WritingSubmission {
  id: string;
  userId: string;
  taskId: string;
  content: string;
  wordCount: number;
  timestamp: string;
  feedback?: WritingFeedback;
}

export interface WritingFeedback {
  overall: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  suggestions: WritingSuggestion[];
}

export interface WritingSuggestion {
  type: "grammar" | "vocabulary" | "cohesion" | "accuracy";
  text: string;
  suggestion: string;
  explanation: string;
}

// Dashboard types
export interface DashboardMetrics {
  userId: string;
  currentBand: number;
  targetBand: number;
  progress: number;
  practiceHours: number;
  globalRank: string;
  recentActivity: ActivityEntry[];
  skillsBreakdown: SkillScore[];
  practiceStreak: number; // <-- THIS IS THE FIX
}

export interface ActivityEntry {
  id: string;
  type: "speaking" | "writing" | "reading" | "listening" | "achievement";
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

export interface SkillScore {
  skill: string;
  score: number;
}

// Metaverse types
export interface PracticeRoom {
  id: string;
  name: string;
  type: "Speaking" | "Writing" | "Reading" | "Listening" | "Mixed" | "Full Test";
  participants: number;
  maxParticipants: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "All Levels";
  host: string;
  topic: string;
  duration: string;
  status: "Live" | "Starting Soon" | "Waiting";
  avgBand: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  level: string;
  streak: number;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  earned: boolean;
  points: number;
  rarity: "bronze" | "silver" | "gold" | "platinum";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  timeLeft: string;
  reward: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Speaking API endpoints
export interface SpeakingSubmissionRequest {
  partId: string;
  audioUrl: string;
  duration: number;
}

// Writing API endpoints
export interface WritingSubmissionRequest {
  taskId: string;
  content: string;
}

// Metaverse API endpoints
export interface JoinRoomRequest {
  roomId: string;
}

export interface RoomJoinResponse {
  success: boolean;
  roomId: string;
  message: string;
}