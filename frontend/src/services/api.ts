import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      await SecureStore.deleteItemAsync('auth_token');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    dayStart?: number;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { dayStart?: number }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (params?: { status?: string; competitionId?: string }) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  createTask: async (data: {
    title: string;
    description?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isRecurring?: boolean;
    recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dueTime?: string;
    competitionId?: string;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: {
    title?: string;
    description?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    dueTime?: string;
  }) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  completeTask: async (id: string, data: { reflection: string }) => {
    const response = await api.post(`/tasks/${id}/complete`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getStats: async (period?: number) => {
    const response = await api.get('/tasks/stats', { params: { period } });
    return response.data;
  },
};

// Competitions API
export const competitionsAPI = {
  getCompetitions: async () => {
    const response = await api.get('/competitions');
    return response.data;
  },

  createCompetition: async (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    memberIds: string[];
  }) => {
    const response = await api.post('/competitions', data);
    return response.data;
  },

  getCompetition: async (id: string) => {
    const response = await api.get(`/competitions/${id}`);
    return response.data;
  },

  joinCompetition: async (id: string) => {
    const response = await api.post(`/competitions/${id}/join`);
    return response.data;
  },

  getLeaderboard: async (id: string) => {
    const response = await api.get(`/competitions/${id}/leaderboard`);
    return response.data;
  },

  endCompetition: async (id: string) => {
    const response = await api.post(`/competitions/${id}/end`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  searchUsers: async (username: string) => {
    const response = await api.get('/users/search', { params: { username } });
    return response.data;
  },

  sendFriendRequest: async (receiverId: string) => {
    const response = await api.post('/users/friend-request', { receiverId });
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await api.get('/users/friend-requests');
    return response.data;
  },

  updateFriendRequest: async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    const response = await api.put(`/users/friend-request/${id}`, { status });
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/users/friends');
    return response.data;
  },

  submitDifficultyReview: async (data: {
    taskId: string;
    suggestedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    reason?: string;
  }) => {
    const response = await api.post('/users/difficulty-review', data);
    return response.data;
  },

  getDifficultyReviews: async () => {
    const response = await api.get('/users/difficulty-reviews');
    return response.data;
  },

  updateDifficultyReview: async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    const response = await api.put(`/users/difficulty-review/${id}`, { status });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/users/suggestions');
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  registerToken: async (data: { token: string; platform: 'ios' | 'android' }) => {
    const response = await api.post('/notifications/register-token', data);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  getReminderSettings: async () => {
    const response = await api.get('/notifications/reminders');
    return response.data;
  },

  updateReminderSettings: async (data: {
    enabled?: boolean;
    taskReminders?: boolean;
    streakReminders?: boolean;
    competitionUpdates?: boolean;
    quietHours?: { start: number; end: number };
  }) => {
    const response = await api.put('/notifications/reminders', data);
    return response.data;
  },
};

export default api; 