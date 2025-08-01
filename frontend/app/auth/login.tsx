import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ThemedView } from '../../components/ThemedView';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.title}>
                  Welcome Back! 🚀
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Log in to continue your productivity journey
                </Text>

                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                >
                  Log In
                </Button>

                <Button
                  mode="text"
                  onPress={goToRegister}
                  style={styles.registerButton}
                >
                  Don't have an account? Sign up
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
}); 