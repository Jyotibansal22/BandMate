// server/routes/dashboard.ts (FINAL CORRECTED VERSION)

import { RequestHandler } from "express";
import { db } from "../database";
import { DashboardMetrics, ApiResponse, SkillScore, ActivityEntry } from "@shared/api";

export const getDashboardMetrics: RequestHandler = async (req, res) => { 
  try {
    const userId = req.query.userId as string || "user-1";
    const user = await db.getUser(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // --- REAL SKILLS BREAKDOWN ---
    const speakingSubmissions = await db.getSpeakingSubmissions(userId);
    const writingSubmissions = await db.getWritingSubmissions(userId);
    
    let skills: SkillScore[] = [
      { skill: "Pronunciation", score: 0 },
      { skill: "Fluency", score: 0 },
      { skill: "Vocabulary", score: 0 },
      { skill: "Grammar", score: 0 },
      { skill: "Coherence", score: 0 },
      { skill: "Task Response", score: 0 },
    ];

    const speakingFeedback = speakingSubmissions.filter(s => s.feedback);
    const writingFeedback = writingSubmissions.filter(s => s.feedback);
    
    if (speakingFeedback.length > 0) {
      const avgPronunciation = speakingFeedback.reduce((sum, s) => sum + (s.feedback?.pronunciation || 0), 0) / speakingFeedback.length;
      const avgFluency = speakingFeedback.reduce((sum, s) => sum + (s.feedback?.fluency || 0), 0) / speakingFeedback.length;
      skills[0].score = parseFloat(avgPronunciation.toFixed(1));
      skills[1].score = parseFloat(avgFluency.toFixed(1));
    }
    
    if (writingFeedback.length > 0) {
      const avgLexical = writingFeedback.reduce((sum, s) => sum + (s.feedback?.lexicalResource || 0), 0) / writingFeedback.length;
      const avgGrammar = writingFeedback.reduce((sum, s) => sum + (s.feedback?.grammaticalRange || 0), 0) / writingFeedback.length;
      const avgCoherence = writingFeedback.reduce((sum, s) => sum + (s.feedback?.coherenceCohesion || 0), 0) / writingFeedback.length;
      const avgTask = writingFeedback.reduce((sum, s) => sum + (s.feedback?.taskAchievement || 0), 0) / writingFeedback.length;
      
      skills[2].score = parseFloat(avgLexical.toFixed(1));
      skills[3].score = parseFloat(avgGrammar.toFixed(1));
      skills[4].score = parseFloat(avgCoherence.toFixed(1));
      skills[5].score = parseFloat(avgTask.toFixed(1));
    }
    // --- END REAL SKILLS ---

    // Calculate progress percentage
    const progress = user.targetBandScore > 0 && user.currentBandScore > 0
      ? Math.round(
          (user.currentBandScore / user.targetBandScore) * 100
        )
      : 0;

    // Get recent activity
    const recentActivity: ActivityEntry[] = await db.getActivity(userId, 10);

    const metrics: DashboardMetrics = {
      userId,
      currentBand: user.currentBandScore,
      targetBand: user.targetBandScore,
      progress,
      practiceHours: user.totalPracticeHours,
      globalRank: user.globalRank === 100 ? "N/A" : `Top ${user.globalRank}%`,
      recentActivity,
      skillsBreakdown: skills,
      practiceStreak: user.practiceStreak,
    };

    const response: ApiResponse<DashboardMetrics> = {
      success: true,
      data: metrics,
      message: "Dashboard metrics retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserProgress: RequestHandler = async (req, res) => { 
  try {
    const userId = req.query.userId as string || "user-1";
    const user = await db.getUser(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }
    
    const speakingSubs = await db.getSpeakingSubmissions(userId);
    const writingSubs = await db.getWritingSubmissions(userId);
    
    const speakingFeedback = speakingSubs.filter(s => s.feedback);
    const writingFeedback = writingSubs.filter(s => s.feedback);
    
    const totalSpeakingTime = speakingSubs.reduce((sum, s) => sum + s.duration, 0);
    const totalWritingTime = writingSubs.length * (20 * 60); // 20 minutes in seconds

    const progress = {
      speaking: {
        currentBand: speakingFeedback.length > 0 ? parseFloat((speakingFeedback.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) / speakingFeedback.length).toFixed(1)) : 0,
        practiceCount: speakingSubs.length,
        totalTime: totalSpeakingTime,
        lastPracticeDate: speakingSubs.length > 0 ? speakingSubs[speakingSubs.length - 1].timestamp : null,
      },
      writing: {
        currentBand: writingFeedback.length > 0 ? parseFloat((writingFeedback.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) / writingFeedback.length).toFixed(1)) : 0,
        practiceCount: writingSubs.length,
        totalTime: totalWritingTime,
        lastPracticeDate: writingSubs.length > 0 ? writingSubs[writingSubs.length - 1].timestamp : null,
      },
      reading: {
        currentBand: 0,
        practiceCount: 0,
        totalTime: 0,
        lastPracticeDate: null,
      },
      listening: {
        currentBand: 0,
        practiceCount: 0,
        totalTime: 0,
        lastPracticeDate: null,
      },
      overallBand: user.currentBandScore,
    };

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
      message: "User progress retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProgressChart: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    
    const speakingSubs = await db.getSpeakingSubmissions(userId);
    const writingSubs = await db.getWritingSubmissions(userId);
    
    const allSubs = [...speakingSubs, ...writingSubs];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Group by month
    const monthlyData = new Map<string, { speaking: number[], writing: number[], reading: number[], listening: number[] }>();

    for (const sub of allSubs) {
      const month = monthNames[new Date(sub.timestamp).getMonth()];
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { speaking: [], writing: [], reading: [], listening: [] });
      }
      if (sub.feedback) {
        // Use duck-typing to distinguish Speaking/Writing feedback
        if ('pronunciation' in sub.feedback && typeof sub.feedback.pronunciation === 'number') {
          monthlyData.get(month)!.speaking.push(sub.feedback.overall);
        } else if ('taskAchievement' in sub.feedback) {
          monthlyData.get(month)!.writing.push(sub.feedback.overall);
        }
      }
    }
    
    // Create chart data
    const chartData = monthNames.slice(0, new Date().getMonth() + 1).map(month => {
      const data = monthlyData.get(month);
      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      return {
        month,
        speaking: parseFloat(avg(data?.speaking || []).toFixed(1)),
        writing: parseFloat(avg(data?.writing || []).toFixed(1)),
        reading: 0,
        listening: 0,
      };
    });


    const response: ApiResponse<typeof chartData> = {
      success: true,
      data: chartData,
      message: "Progress chart data retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRecommendations: RequestHandler = (req, res) => {
  try {
    // This can remain static demo data, as it's meant to be "AI" generated
    const recommendations = [
      {
        id: 1,
        title: "Focus on Fluency",
        description:
          "Practice speaking for 15+ minutes daily to improve your fluency score.",
        icon: "Target",
        priority: "high",
      },
      {
        id: 2,
        title: "Writing Structure",
        description:
          "Work on essay organization and coherence to reach your target band.",
        icon: "Award",
        priority: "high",
      },
      {
        id: 3,
        title: "Time Management",
        description:
          "Practice reading passages under time pressure to improve your reading speed.",
        icon: "Clock",
        priority: "medium",
      },
    ];

    const response: ApiResponse<typeof recommendations> = {
      success: true,
      data: recommendations,
      message: "Recommendations retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};