// server/index.ts

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as speakingRoutes from "./routes/speaking";
import * as writingRoutes from "./routes/writing";
import * as dashboardRoutes from "./routes/dashboard";
import * as metaverseRoutes from "./routes/metaverse";
import { connectDB } from "./mongo-db"; // <--- NEW IMPORT
import * as authRoutes from "./routes/auth"; // <--- NEW IMPORT

export function createServer() {
  
  // --- NEW: Database Connection Initialization ---
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    connectDB(mongoUri); // Call the connection function on server startup
  } else {
    console.error(" MONGO_URI not found in environment variables. Running without MongoDB connection.");
  }
  // ---------------------------------------------
  
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // --- AUTH MIDDLEWARE REMOVED ---
  // app.use(cors({ credentials: true, origin: true }));
  // app.use(cookieParser());
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));
  // app.use(verifyJwt);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // --- NEW AUTH ROUTES ---
  app.post("/api/auth/register", authRoutes.registerUser); 
  app.post("/api/auth/login", authRoutes.loginUser);
  // ------------------------

  // Speaking routes
  app.post("/api/speaking/submit", speakingRoutes.submitSpeakingRecording);
  app.post("/api/speaking/analyze", speakingRoutes.analyzeSpeakingSubmission);
  app.get("/api/speaking/submissions", speakingRoutes.getSpeakingSubmissions);
  app.get("/api/speaking/analytics", speakingRoutes.getSpeakingAnalytics);

  // Writing routes
  app.post("/api/writing/submit", writingRoutes.submitWritingEssay);
  app.post("/api/writing/analyze", writingRoutes.analyzeWritingSubmission);
  app.get("/api/writing/submissions", writingRoutes.getWritingSubmissions);
  app.get("/api/writing/analytics", writingRoutes.getWritingAnalytics);

  // Dashboard routes
  app.get("/api/dashboard/metrics", dashboardRoutes.getDashboardMetrics);
  app.get("/api/dashboard/progress", dashboardRoutes.getUserProgress);
  app.get("/api/dashboard/chart", dashboardRoutes.getProgressChart);
  app.get("/api/dashboard/recommendations", dashboardRoutes.getRecommendations);

  // Metaverse routes
  app.get("/api/metaverse/rooms", metaverseRoutes.getPracticeRooms);
  app.get("/api/metaverse/rooms/:roomId", metaverseRoutes.getPracticeRoomById);
  app.post("/api/metaverse/rooms/join", metaverseRoutes.joinPracticeRoom);
  app.get("/api/metaverse/leaderboard", metaverseRoutes.getLeaderboard);
  app.get("/api/metaverse/achievements", metaverseRoutes.getAchievements);
  app.post("/api/metaverse/achievements/update", metaverseRoutes.updateAchievementProgress);
  app.get("/api/metaverse/challenges", metaverseRoutes.getChallenges);
  app.post("/api/metaverse/challenges/update", metaverseRoutes.updateChallengeProgress);
  app.get("/api/metaverse/profile", metaverseRoutes.getUserProfile);

  return app;
}