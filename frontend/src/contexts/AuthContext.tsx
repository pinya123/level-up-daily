import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { sessionManager } from '../services/sessionManager';

interface User {
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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, dayStartTime: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Debug effect to log authentication state changes
  useEffect(() => {
    console.log('🔐 Auth State Changed:', {
      user: user ? user.username : null,
      isAuthenticated,
      isLoading,
    });
  }, [user, isAuthenticated, isLoading]);

  const loadUserFromStorage = async () => {
    try {
      console.log('🔄 Loading user from storage...');
      const userData = await AsyncStorage.getItem('user');
      const isSessionValid = await sessionManager.isSessionValid();
      
      console.log('📦 Storage data:', { userData: !!userData, isSessionValid });
      
      if (userData && isSessionValid) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User loaded from storage');
        
        // Try to refresh the session to ensure tokens are still valid
        await refreshSession();
      } else if (userData && !isSessionValid) {
        // Clear invalid session data
        console.log('⚠️ Invalid session data, clearing...');
        await clearAuthData();
      } else {
        console.log('ℹ️ No user data found');
      }
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
      // Clear corrupted data
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    console.log('🧹 Clearing auth data...');
    await sessionManager.clearSession();
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Auth data cleared');
  };

  const login = async (username: string, password: string) => {
    console.log('🔐 Attempting login for:', username);
    try {
      const response = await authAPI.login(username, password);
      const { user: userData, tokens } = response;
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await sessionManager.startSession(tokens.accessToken, tokens.refreshToken);
      
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ Login successful for:', userData.username);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, dayStartTime: string) => {
    console.log('📝 Attempting registration for:', username);
    try {
      const response = await authAPI.register(username, email, password, dayStartTime);
      const { user: userData, tokens } = response;
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await sessionManager.startSession(tokens.accessToken, tokens.refreshToken);
      
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ Registration successful for:', userData.username);
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Attempting logout...');
    try {
      await authAPI.logout();
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      await clearAuthData();
      console.log('✅ Logout completed');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User data updated');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      console.log('✅ Password changed successfully');
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshToken = await sessionManager.getRefreshToken();
      if (!refreshToken) {
        console.log('⚠️ No refresh token available');
        return false;
      }

      const tokens = await authAPI.refreshToken(refreshToken);
      await sessionManager.startSession(tokens.accessToken, tokens.refreshToken);
      console.log('✅ Session refreshed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      await clearAuthData();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 