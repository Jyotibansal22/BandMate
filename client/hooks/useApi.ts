import { useState, useCallback } from "react";

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// --- NEW HELPER FUNCTION ---
// This function gets the logged-in user's ID from localStorage.
function getUserId() {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Use the ID from localStorage, fallback to 'user-1' if something goes wrong
      return user.id || "user-1"; 
    }
    return "user-1"; // Default fallback if no user is in localStorage
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return "user-1"; // Fallback on any error
  }
}
// -------------------------

export function useApi<T>() {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (url: string, options?: RequestInit) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        // Try to get a specific error message from the backend
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errorResult = await response.json();
            if(errorResult.error) errorMsg = errorResult.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const result = await response.json();
      setState({ data: result.data, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, request };
}

// Speaking API calls
export async function submitSpeakingRecording(
  partId: string,
  audioUrl: string,
  duration: number
) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/speaking/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      partId,
      audioUrl,
      duration,
    }),
  });
  if (!response.ok) throw new Error("Failed to submit recording");
  return response.json();
}

export async function analyzeSpeakingSubmission(submissionId: string) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/speaking/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      submissionId,
    }),
  });
  if (!response.ok) throw new Error("Failed to analyze submission");
  return response.json();
}

export async function getSpeakingSubmissions() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/speaking/submissions?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get submissions");
  return response.json();
}

export async function getSpeakingAnalytics() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/speaking/analytics?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get analytics");
  return response.json();
}

// Writing API calls
export async function submitWritingEssay(taskId: string, content: string) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/writing/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      taskId,
      content,
    }),
  });
  if (!response.ok) throw new Error("Failed to submit essay");
  return response.json();
}

export async function analyzeWritingSubmission(submissionId: string) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/writing/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      submissionId,
    }),
  });
  if (!response.ok) throw new Error("Failed to analyze submission");
  return response.json();
}

export async function getWritingSubmissions() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/writing/submissions?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get submissions");
  return response.json();
}

export async function getWritingAnalytics() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/writing/analytics?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get analytics");
  return response.json();
}

// Dashboard API calls
export async function getDashboardMetrics() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/dashboard/metrics?userId=${userId}`); // <--- FIXED
  if (!response.ok) {
      // This is the error you are seeing
      const errorResult = await response.json();
      throw new Error(errorResult.error || "Failed to get metrics");
  }
  return response.json();
}

export async function getUserProgress() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/dashboard/progress?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get progress");
  return response.json();
}

export async function getProgressChart() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/dashboard/chart?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get chart data");
  return response.json();
}

export async function getRecommendations() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/dashboard/recommendations?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get recommendations");
  return response.json();
}

// Metaverse API calls
export async function getPracticeRooms() {
  const response = await fetch("/api/metaverse/rooms");
  if (!response.ok) throw new Error("Failed to get rooms");
  return response.json();
}

export async function getPracticeRoom(roomId: string) {
  const response = await fetch(`/api/metaverse/rooms/${roomId}`);
  if (!response.ok) throw new Error("Failed to get room");
  return response.json();
}

export async function joinPracticeRoom(roomId: string) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/metaverse/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      roomId,
    }),
  });
  if (!response.ok) throw new Error("Failed to join room");
  return response.json();
}

export async function getLeaderboard() {
  const response = await fetch("/api/metaverse/leaderboard");
  if (!response.ok) throw new Error("Failed to get leaderboard");
  return response.json();
}

export async function getAchievements() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/metaverse/achievements?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get achievements");
  return response.json();
}

export async function updateAchievementProgress(
  achievementId: string,
  progress: number
) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/metaverse/achievements/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      achievementId,
      progress,
    }),
  });
  if (!response.ok) throw new Error("Failed to update achievement");
  return response.json();
}

export async function getChallenges() {
  const response = await fetch("/api/metaverse/challenges");
  if (!response.ok) throw new Error("Failed to get challenges");
  return response.json();
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number
) {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch("/api/metaverse/challenges/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId, // <--- FIXED
      challengeId,
      progress,
    }),
  });
  if (!response.ok) throw new Error("Failed to update challenge");
  return response.json();
}

export async function getUserProfile() {
  const userId = getUserId(); // <--- FIXED
  const response = await fetch(`/api/metaverse/profile?userId=${userId}`); // <--- FIXED
  if (!response.ok) throw new Error("Failed to get profile");
  return response.json();
}