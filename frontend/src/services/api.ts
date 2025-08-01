import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
      // Clear stored auth data on 401
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
  dayStartTime: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  status: 'pending' | 'completed' | 'deleted';
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

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string, dayStartTime: string): Promise<AuthResponse> => {
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

// Tasks API
export const tasksAPI = {
  createTask: async (taskData: CreateTaskDto): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  getTasks: async (status?: string): Promise<Task[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id: string, taskData: UpdateTaskDto): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  completeTask: async (id: string, completeData: CompleteTaskDto): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/complete`, completeData);
    return response.data;
  },

  getDailyStats: async (date?: string): Promise<any> => {
    const params = date ? { date } : {};
    const response = await api.get('/tasks/stats/daily', { params });
    return response.data;
  },

  getWeeklyStats: async (): Promise<any> => {
    const response = await api.get('/tasks/stats/weekly');
    return response.data;
  },
}; 