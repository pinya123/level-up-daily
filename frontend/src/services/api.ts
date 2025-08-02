import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine the correct base URL based on platform
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator
  } else {
    return 'http://localhost:3000'; // iOS simulator
  }
};

// Create axios instance with correct base URL for development
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

console.log('🌐 API Base URL:', getBaseURL());
console.log('📱 Platform:', Platform.OS);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📦 Request Data:', config.data);
    console.log('🌐 Base URL:', config.baseURL);
    
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    console.log('📦 Response Data:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url);
    console.error('📦 Error Data:', error.response?.data);
    console.error('🔗 Network Error:', error.message);
    
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${getBaseURL()}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear all auth data on refresh failure
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
      }
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
  lastLoginAt?: Date;
  createdAt?: Date;
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
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string, dayStartTime: string): Promise<AuthResponse> => {
    console.log('🔐 Registering user:', { username, email, dayStartTime });
    
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        dayStartTime,
      });
      
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    console.log('🔐 Logging in user:', { username });
    
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Clear local storage even if API call fails
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
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