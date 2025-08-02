import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { AuthGuard } from '../src/components/AuthGuard';
import { ThemedView } from '../components/ThemedView';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="auto" />
      </ThemedView>
    );
  }

  return (
    <Stack>
      {user ? (
        // Authenticated user - show main app with AuthGuard
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Prevent going back to auth screens
            gestureEnabled: false,
          }} 
        />
      ) : (
        // Unauthenticated user - show auth screens
        <>
          <Stack.Screen 
            name="auth/login" 
            options={{ 
              headerShown: false,
              // Prevent going back to main app
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="auth/register" 
            options={{ 
              headerShown: false,
              // Prevent going back to main app
              gestureEnabled: false,
            }} 
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}
