import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '@/services/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, dayStart?: number) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authAPI.login({ email, password });
      
      // Store token securely
      await SecureStore.setItemAsync('auth_token', response.token);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Login failed',
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, dayStart = 6) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authAPI.register({ username, email, password, dayStart });
      
      // Store token securely
      await SecureStore.setItemAsync('auth_token', response.token);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear token from secure storage
      await SecureStore.deleteItemAsync('auth_token');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Check if token exists
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        set({
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Verify token by getting user profile
      const response = await authAPI.getProfile();
      
      set({
        user: response.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, clear it
      await SecureStore.deleteItemAsync('auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  updateUser: (user: User) => {
    set({ user });
  },
})); 