// server/database.ts (CLEAN & FINAL MIGRATED SERVICE LAYER)

import { 
    SpeakingSubmission, 
    WritingSubmission, 
    PracticeRoom, 
    LeaderboardEntry, 
    Achievement, 
    Challenge, 
    ActivityEntry, 
    UserProfile,
} from "@shared/api";
import { 
    UserModel, 
    SpeakingSubmissionModel, 
    WritingSubmissionModel, 
    PracticeRoomModel, 
    LeaderboardModel, 
    AchievementModel, 
    ChallengeModel, 
    ActivityModel,
    IUser,
    ISpeaking, // Import Mongoose Document types
    IWriting,  // Import Mongoose Document types
    IAchievement
} from "./mongo-db";
import { UpdateQuery } from 'mongoose';


// --- MOCK DATA FOR SEEDING ---
const defaultAchievements: Partial<IAchievement>[] = [
  { id: "streak", title: "15-Day Streak", description: "Practice for 15 consecutive days", icon: "Calendar", progress: 0, target: 15, earned: false, points: 500, rarity: "gold" },
  { id: "speaker", title: "Speaking Champion", description: "Achieve Band 8+ in speaking 5 times", icon: "Mic", progress: 0, target: 5, earned: false, points: 1000, rarity: "platinum" },
  { id: "social", title: "Community Helper", description: "Help 10 learners in group sessions", icon: "Users", progress: 0, target: 10, earned: false, points: 750, rarity: "silver" },
  { id: "perfect", title: "Perfect Practice", description: "Score 100% in any module quiz", icon: "Target", progress: 0, target: 1, earned: false, points: 300, rarity: "bronze" },
];

const defaultChallenges: Challenge[] = [
    { id: "daily", title: "Daily Challenge", description: "Complete 3 speaking tasks", progress: 0, target: 3, timeLeft: "6h 24m", reward: "50 XP + Speaking Badge", difficulty: "Easy" },
    { id: "weekly", title: "Weekly Quest", description: "Join 5 group practice sessions", progress: 0, target: 5, timeLeft: "2d 14h", reward: "200 XP + Community Champion", difficulty: "Medium" },
    { id: "monthly", title: "Monthly Mission", description: "Improve overall band score by 0.5", progress: 0.0, target: 0.5, timeLeft: "18d 7h", reward: "1000 XP + Legendary Badge", difficulty: "Hard" },
];

const defaultLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Alex Rivera", avatar: "AR", score: 2850, level: "Grandmaster", badge: "crown", streak: 47 },
    { rank: 2, name: "Priya Sharma", avatar: "PS", score: 2720, level: "Master", badge: "trophy", streak: 32 },
    { rank: 3, name: "James Wang", avatar: "JW", score: 2650, level: "Master", badge: "medal", streak: 28 },
    { rank: 6, name: "You", avatar: "YU", score: 0, level: "Newcomer", badge: "target", streak: 0 },
];

const defaultPracticeRooms: PracticeRoom[] = [
    { id: "room1", name: "Advanced Speaking Lounge", type: "Speaking", participants: 8, maxParticipants: 10, difficulty: "Advanced", host: "Sarah Chen", topic: "Technology and Society", duration: "45 minutes", status: "Live", avgBand: 7.5 },
    { id: "room2", name: "Writing Workshop Elite", type: "Writing", participants: 12, maxParticipants: 15, difficulty: "Expert", host: "Dr. Michael Johnson", topic: "Task 2: Environmental Essays", duration: "60 minutes", status: "Starting Soon", avgBand: 8.0 },
];
// --- END MOCK DATA ---


class DatabaseSeeder {
    private async seedGlobalData() {
        try {
            if (await LeaderboardModel.countDocuments() === 0) {
                await LeaderboardModel.insertMany(defaultLeaderboard);
                console.log("Seeded default leaderboard.");
            }
            if (await PracticeRoomModel.countDocuments() === 0) {
                await PracticeRoomModel.insertMany(defaultPracticeRooms);
                console.log("Seeded default practice rooms.");
            }
            if (await ChallengeModel.countDocuments() === 0) {
                await ChallengeModel.insertMany(defaultChallenges);
                console.log("Seeded default challenges.");
            }
        } catch (error) {
            console.error("Error seeding data:", error);
        }
    }

    public async initializeAndSeed() {
        await this.seedGlobalData();
    }
}

class DatabaseService {
    private seeder = new DatabaseSeeder();

    constructor() {
        this.seeder.initializeAndSeed();
    }

    // --- USER METHODS ---
    async getUser(userId: string): Promise<UserProfile | null> {
        return UserModel.findOne({ id: userId }).select('-passwordHash').lean();
    }
    
    async updateUserProfile(userId: string, update: UpdateQuery<IUser>): Promise<UserProfile | null> {
        return UserModel.findOneAndUpdate(
            { id: userId }, 
            update, 
            { new: true }
        ).select('-passwordHash').lean();
    }
    
    async updateUserBandScore(userId: string, newScore: number): Promise<UserProfile | null> {
        return this.updateUserProfile(userId, { currentBandScore: newScore });
    }

    // --- SUBMISSION METHODS ---
    async addSpeakingSubmission(userId: string, submission: SpeakingSubmission): Promise<SpeakingSubmission> {
        const newSubmission = new SpeakingSubmissionModel(submission);
        await newSubmission.save();
        await this.updateUserProfile(userId, { $inc: { totalPracticeHours: (submission.duration / 3600) } });
        return newSubmission.toObject();
    }

    async getSpeakingSubmissions(userId: string): Promise<SpeakingSubmission[]> {
        return SpeakingSubmissionModel.find({ userId }).lean();
    }
    
    // FIX: Returns the full Mongoose Document (ISpeaking) for .save()
    async getSpeakingSubmission(submissionId: string): Promise<ISpeaking | null> {
        return SpeakingSubmissionModel.findOne({ id: submissionId });
    }
    
    async addWritingSubmission(userId: string, submission: WritingSubmission): Promise<WritingSubmission> {
        const newSubmission = new WritingSubmissionModel(submission);
        await newSubmission.save();
        await this.updateUserProfile(userId, { $inc: { totalPracticeHours: (20 / 60) } }); 
        return newSubmission.toObject();
    }

    async getWritingSubmissions(userId: string): Promise<WritingSubmission[]> {
        return WritingSubmissionModel.find({ userId }).lean();
    }

    // FIX: Returns the full Mongoose Document (IWriting) for .save()
    async getWritingSubmission(submissionId: string): Promise<IWriting | null> {
        return WritingSubmissionModel.findOne({ id: submissionId });
    }
    
    // --- METAVERSE / COMMUNITY METHODS ---
    async getPracticeRooms(): Promise<PracticeRoom[]> {
        return PracticeRoomModel.find({}).lean();
    }

    async getPracticeRoom(roomId: string): Promise<PracticeRoom | null> {
        return PracticeRoomModel.findOne({ id: roomId }).lean();
    }

    async joinPracticeRoom(roomId: string): Promise<PracticeRoom | null> {
        return PracticeRoomModel.findOneAndUpdate(
            { id: roomId, participants: { $lt: '$maxParticipants' } },
            { $inc: { participants: 1 } },
            { new: true }
        ).lean();
    }

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        return LeaderboardModel.find({}).sort({ rank: 1 }).lean();
    }

    async getAchievements(userId: string): Promise<Achievement[]> {
        let achievements = await AchievementModel.find({ userId }).lean();
        
        if (achievements.length === 0) {
            const achievementsToSeed = defaultAchievements.map(a => ({ ...a, userId }));
            await AchievementModel.insertMany(achievementsToSeed);
            achievements = await AchievementModel.find({ userId }).lean();
        }
        return achievements;
    }

    async updateAchievement(userId: string, achievementId: string, progress: number): Promise<Achievement | null> {
        const achievement = await AchievementModel.findOneAndUpdate(
            { userId, id: achievementId }, 
            { $set: { progress: progress } }, // Use $set for clarity
            { new: true }
        );
        
        if (achievement && achievement.progress >= achievement.target && !achievement.earned) {
            achievement.earned = true;
            await achievement.save();
        }
        
        return achievement ? achievement.toObject() : null;
    }

    async getChallenges(): Promise<Challenge[]> {
        return ChallengeModel.find({}).lean();
    }

    async updateChallenge(challengeId: string, progress: number): Promise<Challenge | null> {
        return ChallengeModel.findOneAndUpdate(
            { id: challengeId }, 
            { $set: { progress: progress } }, // Use $set for clarity
            { new: true }
        ).lean();
    }

    // --- ACTIVITY METHODS ---
    // FIX: Correctly typed to Omit 'id' AND 'userId'
    async addActivity(userId: string, activity: Omit<ActivityEntry, 'id' | 'userId'>): Promise<ActivityEntry> {
        const newActivity = new ActivityModel({
            ...activity,
            id: `activity-${Date.now()}`,
            userId: userId 
        });
        await newActivity.save();
        return newActivity.toObject();
    }

    async getActivity(userId: string, limit: number = 10): Promise<ActivityEntry[]> {
        return ActivityModel.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    }
}

// Export singleton instance
export const db = new DatabaseService();