# Backend Implementation Documentation

## Overview

A fully functional backend has been implemented for the IELTS Prep AI application with API endpoints for Speaking, Writing, Dashboard, and Metaverse modules. The backend uses Express.js with an in-memory database that can be easily replaced with a real database like PostgreSQL.

## Architecture

### Backend Stack
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: In-memory (easily replaceable with PostgreSQL, MongoDB, etc.)
- **API Format**: RESTful JSON

### Project Structure

```
server/
  ├── index.ts              # Main Express server setup and route registration
  ├── database.ts           # In-memory database with data persistence logic
  └── routes/
      ├── speaking.ts       # Speaking module endpoints
      ├── writing.ts        # Writing module endpoints
      ├── dashboard.ts      # Dashboard module endpoints
      └── metaverse.ts      # Metaverse/Community module endpoints

shared/
  └── api.ts               # Shared TypeScript types between client and server

client/
  ├── hooks/
  │   └── useApi.ts        # API client functions and hooks
  └── pages/
      ├── Speaking.tsx     # Integrated with backend
      ├── Writing.tsx      # Integrated with backend
      ├── Dashboard.tsx    # Integrated with backend
      └── Metaverse.tsx    # Integrated with backend
```

## API Endpoints

### Speaking Module

#### Submit Recording
- **Endpoint**: `POST /api/speaking/submit`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "partId": "part1|part2|part3",
    "audioUrl": "string",
    "duration": number
  }
  ```
- **Response**: Submission ID and metadata

#### Analyze Submission
- **Endpoint**: `POST /api/speaking/analyze`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "submissionId": "string"
  }
  ```
- **Response**: Detailed feedback with scores for pronunciation, fluency, vocabulary, grammar, confidence level, accent analysis, and suggestions

#### Get Submissions
- **Endpoint**: `GET /api/speaking/submissions?userId=user-1`
- **Response**: Array of all speaking submissions for the user

#### Get Analytics
- **Endpoint**: `GET /api/speaking/analytics?userId=user-1`
- **Response**: Aggregated statistics including total submissions, average score, best score, total practice duration

### Writing Module

#### Submit Essay
- **Endpoint**: `POST /api/writing/submit`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "taskId": "task1|task2",
    "content": "essay text"
  }
  ```
- **Response**: Submission ID with word count and metadata

#### Analyze Submission
- **Endpoint**: `POST /api/writing/analyze`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "submissionId": "string"
  }
  ```
- **Response**: Detailed feedback with band scores for task achievement, coherence & cohesion, lexical resource, grammatical range, and specific improvement suggestions

#### Get Submissions
- **Endpoint**: `GET /api/writing/submissions?userId=user-1`
- **Response**: Array of all writing submissions for the user

#### Get Analytics
- **Endpoint**: `GET /api/writing/analytics?userId=user-1`
- **Response**: Aggregated statistics including total submissions, average score, best score, total words written, average word count

### Dashboard Module

#### Get Metrics
- **Endpoint**: `GET /api/dashboard/metrics?userId=user-1`
- **Response**: Overall dashboard metrics including current band, target band, progress percentage, practice hours, global rank, recent activity, and skills breakdown

#### Get Progress
- **Endpoint**: `GET /api/dashboard/progress?userId=user-1`
- **Response**: Detailed progress for each module (Speaking, Writing, Reading, Listening) with current band, practice count, total time, and last practice date

#### Get Chart Data
- **Endpoint**: `GET /api/dashboard/chart?userId=user-1`
- **Response**: Monthly progress data for charting band score trends across all modules

#### Get Recommendations
- **Endpoint**: `GET /api/dashboard/recommendations?userId=user-1`
- **Response**: Personalized AI-generated recommendations for improvement based on user performance

### Metaverse Module

#### Get Practice Rooms
- **Endpoint**: `GET /api/metaverse/rooms`
- **Response**: Array of all available practice rooms with status, difficulty, host, participants, average band score

#### Get Room Details
- **Endpoint**: `GET /api/metaverse/rooms/:roomId`
- **Response**: Detailed information about a specific practice room

#### Join Room
- **Endpoint**: `POST /api/metaverse/rooms/join`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "roomId": "room1"
  }
  ```
- **Response**: Updated room details with incremented participant count

#### Get Leaderboard
- **Endpoint**: `GET /api/metaverse/leaderboard`
- **Response**: Global leaderboard with top performers, their scores, XP, streaks, and badges

#### Get Achievements
- **Endpoint**: `GET /api/metaverse/achievements?userId=user-1`
- **Response**: Array of all achievements for the user with progress, earned status, and rewards

#### Update Achievement Progress
- **Endpoint**: `POST /api/metaverse/achievements/update`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "achievementId": "streak",
    "progress": 15
  }
  ```
- **Response**: Updated achievement data

#### Get Challenges
- **Endpoint**: `GET /api/metaverse/challenges`
- **Response**: Array of active challenges with progress, difficulty, and rewards

#### Update Challenge Progress
- **Endpoint**: `POST /api/metaverse/challenges/update`
- **Body**: 
  ```json
  {
    "userId": "user-1",
    "challengeId": "daily",
    "progress": 2
  }
  ```
- **Response**: Updated challenge data

#### Get User Profile
- **Endpoint**: `GET /api/metaverse/profile?userId=user-1`
- **Response**: Complete user profile with name, avatar, band scores, practice hours, streak, and global rank

## Data Models

### Core Types

#### User Profile
```typescript
interface UserProfile {
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
```

#### Speaking Feedback
```typescript
interface SpeakingFeedback {
  overall: number;           // 0-9 band score
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  stressLevel: string;       // "Low" | "Medium" | "High"
  confidenceLevel: number;   // 0-100%
  hesitationCount: number;
  detectedAccent: string;
  accentInfluence: number;   // 0-100%
  neutralizationProgress: number;
  suggestions: string[];
}
```

#### Writing Feedback
```typescript
interface WritingFeedback {
  overall: number;              // 0-9 band score
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  suggestions: WritingSuggestion[];
}
```

## Database

### In-Memory Implementation

The database uses Maps and Arrays to store data:

```typescript
private users: Map<string, UserProfile>
private speakingSubmissions: Map<string, SpeakingSubmission[]>
private writingSubmissions: Map<string, WritingSubmission[]>
private practiceRooms: Map<string, PracticeRoom>
private leaderboard: LeaderboardEntry[]
private achievements: Map<string, Achievement[]>
private challenges: Challenge[]
private userActivity: Map<string, ActivityEntry[]>
```

### Migration to Real Database

To migrate to a real database like PostgreSQL:

1. **Install dependencies**:
   ```bash
   npm install pg typeorm
   ```

2. **Replace database.ts** with TypeORM entities and repositories

3. **Update API routes** to use the new repository methods

4. **Add database migrations** for schema management

Example with PostgreSQL:
```typescript
// database.ts would import from TypeORM
import { AppDataSource } from "./datasource";
import { User } from "./entities/User";

// Use repositories instead of Maps
const userRepository = AppDataSource.getRepository(User);
const user = await userRepository.findOne({ where: { id: userId } });
```

## Frontend Integration

### API Client Hook

The `useApi.ts` hook provides typed API client functions:

```typescript
// Speaking
submitSpeakingRecording(partId, audioUrl, duration)
analyzeSpeakingSubmission(submissionId)
getSpeakingSubmissions()
getSpeakingAnalytics()

// Writing
submitWritingEssay(taskId, content)
analyzeWritingSubmission(submissionId)
getWritingSubmissions()
getWritingAnalytics()

// Dashboard
getDashboardMetrics()
getUserProgress()
getProgressChart()
getRecommendations()

// Metaverse
getPracticeRooms()
getPracticeRoom(roomId)
joinPracticeRoom(roomId)
getLeaderboard()
getAchievements()
updateAchievementProgress(achievementId, progress)
getChallenges()
updateChallengeProgress(challengeId, progress)
getUserProfile()
```

### Component Integration

Each component now:
1. Calls API endpoints on mount to fetch data
2. Submits user actions (recordings, essays, room joins) to the backend
3. Displays real feedback and analytics from the API
4. Shows loading states during API calls
5. Handles errors with toast notifications

## Error Handling

All endpoints return standardized responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Error handling includes:
- 400 Bad Request for missing fields
- 404 Not Found for missing resources
- 500 Internal Server Error for unexpected issues

## Future Enhancements

### Immediate
- Real database integration (PostgreSQL recommended)
- Authentication and user sessions
- File upload for audio/essay submissions
- Real AI/ML integration for feedback generation
- Caching with Redis

### Medium-term
- WebSocket support for real-time practice room updates
- Notification system
- Email confirmations and reports
- Payment processing for premium features

### Long-term
- Mobile app backend optimization
- Analytics and reporting engine
- Admin dashboard
- Advanced recommendation algorithm

## Development

### Running the Server

```bash
npm run dev    # Development server with hot reload
npm run build  # Production build
npm start      # Production server
```

### Testing

To test API endpoints:

```bash
# Using curl
curl -X POST http://localhost:8080/api/speaking/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","partId":"part1","audioUrl":"url","duration":60}'

# Or use API tools like Postman or Insomnia
```

## Performance Considerations

- In-memory database is suitable for development/demo
- For production, use PostgreSQL with proper indexing
- Add Redis caching for frequently accessed data (leaderboard, achievements)
- Implement rate limiting to prevent API abuse
- Use CDN for static assets
- Add database connection pooling

## Security

### Current Implementation
- CORS enabled for all origins (should be restricted in production)
- No authentication (add JWT tokens in production)
- No rate limiting
- No input validation beyond basic type checking

### Production Recommendations
1. Add authentication (JWT or OAuth 2.0)
2. Implement proper authorization checks
3. Add request validation and sanitization
4. Use HTTPS only
5. Add rate limiting
6. Implement CSRF protection
7. Add SQL injection prevention (TypeORM handles this)
8. Log security events

## Monitoring

Recommended monitoring tools:
- Sentry for error tracking
- DataDog for performance monitoring
- Winston or Pino for structured logging
- Prometheus for metrics

## Support

For questions or issues:
1. Check the API endpoint documentation above
2. Review the TypeScript types in `shared/api.ts`
3. Check the database implementation in `server/database.ts`
4. Review the specific route handlers in `server/routes/`
