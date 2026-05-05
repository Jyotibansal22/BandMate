// server/routes/writing.ts (AI-ANALYSIS SIMULATOR)

import { RequestHandler } from "express";
import { db } from "../database";
import {
  WritingSubmission,
  WritingFeedback,
  WritingSuggestion,
  WritingSubmissionRequest,
  ApiResponse,
} from "@shared/api";
import { IWriting } from "../mongo-db"; // Import the Mongoose Document interface
import OpenAI from "openai"; 
const groq = new OpenAI({
  
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", 
});

// Helper functions for mock data
function getStaticScore(min: number, max: number): number {
  return parseFloat(((min + max) / 2).toFixed(1)); // Always return the midpoint
}

// **STATIC PLACEHOLDER FOR DEMO**
function createGroqPlaceholderWritingFeedback(submission: IWriting): WritingFeedback {
    const minWordCount = submission.taskId === 'task1' ? 150 : 250;
    const isUnder = submission.wordCount < minWordCount;
    const baseScore = isUnder ? 6.0 : 7.0; 
    const overall = getStaticScore(baseScore, 7.5);

    const suggestions: WritingSuggestion[] = isUnder ? [
        { type: "grammar", text: "word count is too low", suggestion: `Increase count to at least ${minWordCount} words.`, explanation: "Your essay fails the Task Response criteria due to insufficient length." },
    ] : [
        { type: "vocabulary", text: "good essay", suggestion: "well-structured composition", explanation: "Elevate your writing by using more sophisticated noun phrases." },
        { type: "grammar", text: "The main reason is", suggestion: "The principal contributing factor is", explanation: "Use nominalized phrases to increase grammatical complexity." },
        { type: "cohesion", text: "in conclusion", suggestion: "To conclude / All things considered", explanation: "Vary your cohesive devices for a higher Coherence and Cohesion score." },
    ];

    return {
        overall: overall,
        taskAchievement: getStaticScore(overall - 0.2, overall + 0.2),
        coherenceCohesion: getStaticScore(overall - 0.2, overall + 0.2),
        lexicalResource: getStaticScore(overall - 0.2, overall + 0.2),
        grammaticalRange: getStaticScore(overall - 0.2, overall + 0.2),
        suggestions: suggestions
    };
}

async function analyzeWritingWithGroq(submission: IWriting): Promise<WritingFeedback> {
    const prompt = `Analyze the IELTS writing essay for task ${submission.taskId} with word count ${submission.wordCount}. The essay is: "${submission.content}". Provide a detailed JSON output matching the WritingFeedback interface, including band scores for all four criteria and actionable suggestions. The user's goal is Band 8.`;

    console.log("Simulating Groq API call with prompt:", prompt.substring(0, 100) + "...");
    
    try {
       
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        // Return the deterministic placeholder data
        return createGroqPlaceholderWritingFeedback(submission);

    } catch (error) {
        console.error("Groq API (Simulated) Error:", error);
        return {
            overall: 5.0, taskAchievement: 5.0, coherenceCohesion: 5.0, 
            lexicalResource: 5.0, grammaticalRange: 5.0, 
            suggestions: [
              { type: "accuracy", text: "Error", suggestion: "AI Connection Error", explanation: "❌ Could not connect to AI. Check GROQ_API_KEY and server console." }
            ],
        };
    }
}
// --- END NEW GROQ AI CLIENT AND MOCK API CALL LOGIC ---


export const submitWritingEssay: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const { taskId, content }: WritingSubmissionRequest = req.body;

    if (!taskId || !content) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: taskId, content",
      });
      return;
    }

    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;

    const submission: WritingSubmission = {
      id: `writing-${Date.now()}`,
      userId,
      taskId,
      content,
      wordCount,
      timestamp: new Date().toISOString(),
    };

    const newSubmission = await db.addWritingSubmission(userId, submission);

    // FIX: Removed 'id' and 'userId' fields
    await db.addActivity(userId, { 
      type: "writing",
      title: "Essay Submitted",
      description: `Submitted essay for ${taskId} (${wordCount} words)`,
      timestamp: new Date().toISOString(),
    });

    const response: ApiResponse<WritingSubmission> = {
      success: true,
      data: newSubmission,
      message: "Writing submission recorded successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const analyzeWritingSubmission: RequestHandler = async (req, res) => {
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

    // FIX: This method now correctly returns the full Mongoose Document
    const submission = await db.getWritingSubmission(submissionId);

    if (!submission) {
      res.status(404).json({
        success: false,
        error: "Submission not found",
      });
      return;
    }

    // --- REPLACED MOCK CALL WITH NEW GROQ ANALYZER ---
    const feedback = await analyzeWritingWithGroq(submission);
    // ---
    
    submission.feedback = feedback;

    await submission.save(); // This .save() will now work

    const user = await db.getUser(userId);
    if (user && feedback.overall > user.currentBandScore) {
      await db.updateUserBandScore(userId, feedback.overall);
    }

    // FIX: Removed 'id' and 'userId' fields
    await db.addActivity(userId, { 
      type: "writing",
      title: "Essay Analysis Complete",
      description: `Band Score: ${feedback.overall}/9`,
      timestamp: new Date().toISOString(),
      score: feedback.overall,
    });

    const response: ApiResponse<WritingFeedback> = {
      success: true,
      data: feedback,
      message: "Writing submission analyzed successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getWritingSubmissions: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const submissions = await db.getWritingSubmissions(userId); // Returns .lean()

    const response: ApiResponse<WritingSubmission[]> = {
      success: true,
      data: submissions,
      message: "Writing submissions retrieved successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getWritingAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    const submissions = await db.getWritingSubmissions(userId); // Returns .lean()
    
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
      totalWordsWritten: submissions.reduce((sum, s) => sum + s.wordCount, 0),
      averageWordCount:
        submissions.length > 0
          ? submissions.reduce((sum, s) => sum + s.wordCount, 0) /
            submissions.length
          : 0,
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