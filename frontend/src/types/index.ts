export interface User {
  id: string;
  username: string;
  email: string;
  dayStart: number;
  currentStreak: number;
  maxStreak: number;
  lastTaskDate?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  isRecurring: boolean;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dueTime?: string;
  completedAt?: string;
  reflection?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  competitionId?: string;
  competition?: {
    id: string;
    name: string;
  };
}

export interface Competition {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: {
    id: string;
    username: string;
  };
  members: CompetitionMember[];
  tasks: Task[];
  _count?: {
    tasks: number;
  };
}

export interface CompetitionMember {
  id: string;
  joinedAt: string;
  totalPoints: number;
  competitionId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  tasksCompleted: number;
  rank: number;
}

export interface Friendship {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    username: string;
    currentStreak: number;
    maxStreak: number;
  };
  receiver: {
    id: string;
    username: string;
    currentStreak: number;
    maxStreak: number;
  };
}

export interface DifficultyReview {
  id: string;
  suggestedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  reason?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  taskId: string;
  senderId: string;
  receiverId: string;
  task: {
    id: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  };
  sender: {
    id: string;
    username: string;
  };
}

export interface Notification {
  id: string;
  type: 'streak' | 'competition' | 'task' | 'friend';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  taskReminders: boolean;
  streakReminders: boolean;
  competitionUpdates: boolean;
  quietHours: {
    start: number;
    end: number;
  };
}

export interface TaskStats {
  totalPoints: number;
  tasksCompleted: number;
  averagePointsPerTask: number;
  period: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type ReviewStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'; 