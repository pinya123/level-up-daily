import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Violet
    tertiary: '#ec4899', // Pink
    background: '#ffffff',
    surface: '#f8fafc',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    card: '#ffffff',
    difficulty: {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444'
    },
    streak: {
      background: '#fef3c7',
      text: '#92400e'
    },
    competition: {
      background: '#dbeafe',
      text: '#1e40af'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28
    },
    body: {
      fontSize: 16,
      lineHeight: 24
    },
    caption: {
      fontSize: 14,
      lineHeight: 20
    },
    small: {
      fontSize: 12,
      lineHeight: 16
    }
  }
}; 