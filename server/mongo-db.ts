// server/mongo-db.ts (FINALIZED & CORRECTED)

import mongoose, { Schema, Document } from 'mongoose';
import { 
    UserProfile, 
    SpeakingSubmission, 
    WritingSubmission, 
    PracticeRoom, 
    LeaderboardEntry, 
    Achievement, 
    Challenge, 
    ActivityEntry, 
} from '@shared/api';
import "dotenv/config";

// --- INTERFACES (These define the plain data shape) ---
export interface IUserBase extends UserProfile {
  passwordHash: string;
}
export interface ISpeakingBase extends SpeakingSubmission {}
export interface IWritingBase extends WritingSubmission {}
export interface IAchievementBase extends Achievement {
    userId: string;
}
export interface IActivityEntryBase extends ActivityEntry {
    userId: string;
}


// --- MONGOOSE DOCUMENTS (These include methods like .save()) ---
// FIX: We Omit 'id' from Mongoose's Document to prevent a type conflict
// with the 'id' property already defined in your UserProfile, SpeakingSubmission, etc.
export interface IUser extends IUserBase, Omit<Document, 'id'> {}
export interface ISpeaking extends ISpeakingBase, Omit<Document, 'id'> {}
export interface IWriting extends IWritingBase, Omit<Document, 'id'> {}
export interface IAchievement extends IAchievementBase, Omit<Document, 'id'> {}
export interface IActivityEntry extends IActivityEntryBase, Omit<Document, 'id'> {}


// --- SCHEMAS ---

const UserSchema: Schema = new Schema<IUser>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { 
        type: String, 
        required: true, 
        default: function(this: IUser) { return this.name.substring(0, 2).toUpperCase() }
    }, 
    joinedDate: { type: String, required: true, default: () => new Date().toISOString() },
    currentBandScore: { type: Number, default: 0.0 },
    targetBandScore: { type: Number, default: 8.0 },
    totalPracticeHours: { type: Number, default: 0.0 },
    practiceStreak: { type: Number, default: 0 },
    globalRank: { type: Number, default: 100 },
});


const SpeakingSubmissionSchema: Schema = new Schema<ISpeaking>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    partId: { type: String, required: true },
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    timestamp: { type: String, required: true },
    feedback: { type: Object, default: undefined }, 
});

const WritingSubmissionSchema: Schema = new Schema<IWriting>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    taskId: { type: String, required: true },
    content: { type: String, required: true },
    wordCount: { type: Number, required: true },
    timestamp: { type: String, required: true },
    feedback: { type: Object, default: undefined }, 
});

const PracticeRoomSchema: Schema = new Schema<PracticeRoom>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    participants: { type: Number, default: 0 },
    maxParticipants: { type: Number, default: 10 },
    difficulty: { type: String, required: true },
    host: { type: String, required: true },
    topic: { type: String, required: true },
    duration: { type: String, required: true },
    status: { type: String, required: true },
    avgBand: { type: Number, default: 0 },
});

const LeaderboardSchema: Schema = new Schema<LeaderboardEntry>({
    rank: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    score: { type: Number, required: true },
    level: { type: String, required: true },
    streak: { type: Number, required: true },
    badge: { type: String, required: true },
});

const AchievementSchema: Schema = new Schema<IAchievement>({
    id: { type: String, required: true },
    userId: { type: String, required: true, index: true }, 
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    earned: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    rarity: { type: String, required: true },
});

const ChallengeSchema: Schema = new Schema<Challenge>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    timeLeft: { type: String, required: true },
    reward: { type: String, required: true },
    difficulty: { type: String, required: true },
});

const ActivitySchema: Schema = new Schema<IActivityEntry>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, required: true },
    score: { type: Number, default: undefined },
});


// --- POST-SCHEMA INDEX DEFINITION ---
AchievementSchema.index({ userId: 1, id: 1 }, { unique: true });


// --- MODELS ---
export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const SpeakingSubmissionModel = mongoose.model<ISpeaking>('SpeakingSubmission', SpeakingSubmissionSchema);
export const WritingSubmissionModel = mongoose.model<IWriting>('WritingSubmission', WritingSubmissionSchema);
export const PracticeRoomModel = mongoose.model<PracticeRoom>('PracticeRoom', PracticeRoomSchema);
export const LeaderboardModel = mongoose.model<LeaderboardEntry>('Leaderboard', LeaderboardSchema);
export const AchievementModel = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const ChallengeModel = mongoose.model<Challenge>('Challenge', ChallengeSchema);
export const ActivityModel = mongoose.model<IActivityEntry>('Activity', ActivitySchema);


// --- CONNECTION HANDLER ---
export async function connectDB(mongoUri: string) {
  try {
    await mongoose.connect(mongoUri);
    console.log(' MongoDB connected successfully!');
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    process.exit(1); 
  }
}