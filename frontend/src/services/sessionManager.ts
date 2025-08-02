import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  constructor() {
    this.setupTokenRefresh();
  }

  private async setupTokenRefresh() {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        // Set up automatic token refresh every 14 minutes (before 15-minute expiry)
        this.scheduleTokenRefresh();
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }

  private scheduleTokenRefresh() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh for 14 minutes (840000 ms)
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, 14 * 60 * 1000);
  }

  private async refreshToken() {
    if (this.isRefreshing) return;

    try {
      this.isRefreshing = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokens = await authAPI.refreshToken(refreshToken);
      
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);

      console.log('✅ Token refreshed successfully');
      
      // Schedule next refresh
      this.scheduleTokenRefresh();
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear all auth data on refresh failure
      await this.clearSession();
    } finally {
      this.isRefreshing = false;
    }
  }

  async clearSession() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }

  async startSession(accessToken: string, refreshToken: string) {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      this.scheduleTokenRefresh();
      console.log('✅ Session started');
    } catch (error) {
      console.error('❌ Error starting session:', error);
    }
  }

  async isSessionValid(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('❌ Error checking session validity:', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  }
}

export const sessionManager = new SessionManager(); 