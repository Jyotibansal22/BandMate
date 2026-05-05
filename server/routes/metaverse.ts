// server/routes/metaverse.ts (FINAL CORRECTED VERSION)

import { RequestHandler } from "express";
import { db } from "../database";
import {
  PracticeRoom,
  LeaderboardEntry,
  Achievement,
  Challenge,
  ApiResponse,
} from "@shared/api";

export const getPracticeRooms: RequestHandler = async (req, res) => {
  try {
    const rooms = await db.getPracticeRooms();
    const response: ApiResponse<PracticeRoom[]> = {
      success: true,
      data: rooms,
      message: "Practice rooms retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPracticeRoomById: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ success: false, error: "Missing required parameter: roomId" });
      return;
    }
    const room = await db.getPracticeRoom(roomId);
    if (!room) {
      res.status(404).json({ success: false, error: "Practice room not found" });
      return;
    }
    const response: ApiResponse<PracticeRoom> = {
      success: true,
      data: room,
      message: "Practice room retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const joinPracticeRoom: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const { roomId } = req.body;

    if (!roomId) {
      res.status(400).json({
        success: false,
        error: "Missing required field: roomId",
      });
      return;
    }

    const room = await db.joinPracticeRoom(roomId);

    if (!room) {
      res.status(404).json({
        success: false,
        error: "Practice room not found or is full",
      });
      return;
    }

    // FIX: Removed 'id' and 'userId' fields
    await db.addActivity(userId, { 
      type: "speaking",
      title: "Joined Practice Room",
      description: `Joined ${room.name}`,
      timestamp: new Date().toISOString(),
    });

    const response: ApiResponse<PracticeRoom> = {
      success: true,
      data: room,
      message: "Successfully joined practice room",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const leaderboard = await db.getLeaderboard();
    const response: ApiResponse<LeaderboardEntry[]> = {
      success: true,
      data: leaderboard,
      message: "Leaderboard retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAchievements: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const achievements = await db.getAchievements(userId);
    const response: ApiResponse<Achievement[]> = {
      success: true,
      data: achievements,
      message: "Achievements retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateAchievementProgress: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const { achievementId, progress } = req.body;

    if (!achievementId || progress === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: achievementId, progress",
      });
      return;
    }

    const achievement = await db.updateAchievement(userId, achievementId, progress);

    if (!achievement) {
      res.status(404).json({
        success: false,
        error: "Achievement not found",
      });
      return;
    }

    if (achievement.earned && achievement.progress >= achievement.target) {
      // FIX: Removed 'id' and 'userId' fields
      await db.addActivity(userId, { 
        type: "achievement",
        title: `Achievement Unlocked: ${achievement.title}`,
        description: `You have earned the "${achievement.title}" achievement`,
        timestamp: new Date().toISOString(),
      });
    }

    const response: ApiResponse<Achievement> = {
      success: true,
      data: achievement,
      message: "Achievement progress updated successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getChallenges: RequestHandler = async (req, res) => {
  try {
    const challenges = await db.getChallenges();
    const response: ApiResponse<Challenge[]> = {
      success: true,
      data: challenges,
      message: "Challenges retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateChallengeProgress: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const { challengeId, progress } = req.body;

    if (!challengeId || progress === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: challengeId, progress",
      });
      return;
    }

    const challenge = await db.updateChallenge(challengeId, progress);

    if (!challenge) {
      res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
      return;
    }

    if (challenge.progress >= challenge.target) {
      // FIX: Removed 'id' and 'userId' fields
      await db.addActivity(userId, { 
        type: "achievement",
        title: `Challenge Completed: ${challenge.title}`,
        description: `You have completed "${challenge.title}" challenge`,
        timestamp: new Date().toISOString(),
      });
    }

    const response: ApiResponse<Challenge> = {
      success: true,
      data: challenge,
      message: "Challenge progress updated successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const user = await db.getUser(userId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: "User profile retrieved successfully",
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};