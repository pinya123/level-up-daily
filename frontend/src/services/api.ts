import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
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
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  dayStartTime: string;
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  status: 'pending' | 'completed' | 'deleted';
  recurrenceType: 'none' | 'daily' | 'weekly';
  dueDate?: string;
  completedAt?: string;
  reflectionNote?: string;
  pointsEarned: number;
  taskDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  recurrenceType?: 'none' | 'daily' | 'weekly';
  recurrenceConfig?: any;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'difficult';
  dueDate?: string;
}

export interface CompleteTaskDto {
  reflectionNote: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authAPI = {
  register: async (username: string, email: string, password: string, dayStartTime?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      dayStartTime,
    });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },
};

export const tasksAPI = {
  createTask: async (taskData: CreateTaskDto): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  getUserTasks: async (status?: string): Promise<Task[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId: string, taskData: UpdateTaskDto): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  completeTask: async (taskId: string, reflectionNote: string): Promise<Task> => {
    const response = await api.post(`/tasks/${taskId}/complete`, {
      reflectionNote,
    });
    return response.data;
  },

  getDailyStats: async (date?: string): Promise<any> => {
    const params = date ? { date } : {};
    const response = await api.get('/tasks/stats/daily', { params });
    return response.data;
  },

  getWeeklyStats: async (): Promise<any[]> => {
    const response = await api.get('/tasks/stats/weekly');
    return response.data;
  },
};

export default api; 