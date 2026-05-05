// server/routes/speaking.ts 

import { RequestHandler } from "express";
import { db } from "../database";
import {
  SpeakingSubmission,
  SpeakingFeedback,
  SpeakingSubmissionRequest,
  ApiResponse,
} from "@shared/api";
import { ISpeaking } from "../mongo-db"; // Import the Mongoose Document interface
import OpenAI from "openai";


const groq = new OpenAI({
  
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", 
});


function createMockGroqFeedback(duration: number): SpeakingFeedback {
    const baseScore = 6.5;
    const overall = parseFloat((baseScore + Math.random() * 2.0).toFixed(1));
    const confidence = Math.min(100, Math.max(70, 70 + Math.floor(Math.random() * 30)));
    const fluencyScore = parseFloat(Math.min(9.0, Math.max(5.0, overall + (duration > 60 ? 0.5 : -0.5) + (Math.random() * 0.5 - 0.25))).toFixed(1));
    const hesitationCount = Math.floor(duration / 30);

    return {
        overall: overall,
        pronunciation: parseFloat(Math.min(9.0, Math.max(5.0, overall + (Math.random() * 0.5 - 0.25))).toFixed(1)),
        fluency: fluencyScore,
        vocabulary: parseFloat(Math.min(9.0, Math.max(5.0, overall + (Math.random() * 0.5 - 0.25))).toFixed(1)),
        grammar: parseFloat(Math.min(9.0, Math.max(5.0, overall + (Math.random() * 0.5 - 0.25))).toFixed(1)),
        stressLevel: overall >= 7.0 ? "Low" : "Medium",
        confidenceLevel: confidence,
        hesitationCount: hesitationCount,
        detectedAccent: "General American",
        accentInfluence: 20,
        neutralizationProgress: 75,
        suggestions: [
            "Your fluency is excellent, try to vary your sentence structures.",
            "Use more idiomatic language to boost your vocabulary score.",
            `Try to reduce pauses, currently at ${hesitationCount} major hesitations.`,
        ],
    };
}

async function analyzeSpeakingWithGroq(submission: SpeakingSubmission): Promise<SpeakingFeedback> {
    const prompt = `Analyze the IELTS speaking response for part ${submission.partId} with audio URL ${submission.audioUrl} and duration ${submission.duration} seconds. Provide a detailed JSON output matching the SpeakingFeedback interface, including band scores for overall, pronunciation, fluency, vocabulary, and grammar, plus analysis on stress, confidence, accent, and actionable suggestions. The user's goal is Band 8.`;

    console.log("Simulating Groq API call with prompt:", prompt.substring(0, 100) + "...");
    
    try {
       
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API latency
        return createMockGroqFeedback(submission.duration);

    } catch (error) {
        console.error("Groq API error:", error);
        return {
            overall: 5.0, pronunciation: 5.0, fluency: 5.0, vocabulary: 5.0, grammar: 5.0, 
            stressLevel: "High", confidenceLevel: 50, hesitationCount: 10, detectedAccent: "Unknown",
            accentInfluence: 100, neutralizationProgress: 0, suggestions: ["Could not connect to AI. Please check GROQ_API_KEY."],
        };
    }
}



export const submitSpeakingRecording: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const { partId, audioUrl, duration }: SpeakingSubmissionRequest = req.body;

    if (!partId || !audioUrl || duration === undefined) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: partId, audioUrl, duration",
      });
      return;
    }

    const submission: SpeakingSubmission = {
      id: `speaking-${Date.now()}`,
      userId,
      partId,
      audioUrl,
      duration,
      timestamp: new Date().toISOString(),
    };

    const newSubmission = await db.addSpeakingSubmission(userId, submission);

    // FIX: Removed 'id' and 'userId' fields from this call to match Omit<> type
    await db.addActivity(userId, { 
      type: "speaking",
      title: "Speaking Practice Submitted",
      description: `Submitted recording for ${partId}`,
      timestamp: new Date().toISOString(),
    });

    const response: ApiResponse<SpeakingSubmission> = {
      success: true,
      data: newSubmission,
      message: "Speaking submission recorded successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const analyzeSpeakingSubmission: RequestHandler = async (req, res) => { 
  try {
    const userId = req.body.userId || "user-1";
    const { submissionId } = req.body;

    if (!submissionId) {
      res.status(400).json({
        success: false,
        error: "Missing required field: submissionId",
      });
      return;
    }
    
    // FIX: This method now correctly returns the full Mongoose Document type
    const submission: ISpeaking | null = await db.getSpeakingSubmission(submissionId);

    if (!submission) {
      res.status(404).json({
        success: false,
        error: "Submission not found",
      });
      return;
    }

    
    const feedback = await analyzeSpeakingWithGroq(submission); 
   
    
    
    submission.feedback = feedback;
    await submission.save(); 
    
    const user = await db.getUser(userId);
    if (user && feedback.overall > user.currentBandScore) {
      await db.updateUserBandScore(userId, feedback.overall);
    }
    
    
    await db.addActivity(userId, { 
      type: "speaking",
      title: "Speaking Analysis Complete",
      description: `Band Score: ${feedback.overall}/9`,
      timestamp: new Date().toISOString(),
      score: feedback.overall,
    });

    const response: ApiResponse<SpeakingFeedback> = {
      success: true,
      data: feedback,
      message: "Speaking submission analyzed successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error in analysis:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSpeakingSubmissions: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const submissions = await db.getSpeakingSubmissions(userId);

    const response: ApiResponse<SpeakingSubmission[]> = {
      success: true,
      data: submissions,
      message: "Speaking submissions retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSpeakingAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const submissions = await db.getSpeakingSubmissions(userId);

    const submissionsWithFeedback = submissions.filter(s => s.feedback);
    const averageScore = submissionsWithFeedback.length > 0
      ? submissionsWithFeedback.reduce((sum, s) => sum + (s.feedback?.overall || 0), 0) /
        submissionsWithFeedback.length
      : 0;

    const analytics = {
      totalSubmissions: submissions.length,
      averageScore: averageScore,
      bestScore: Math.max(
        0,
        ...submissionsWithFeedback.map((s) => s.feedback?.overall || 0)
      ),
      totalPracticeDuration: submissions.reduce((sum, s) => sum + s.duration, 0),
    };

    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
      message: "Speaking analytics retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};