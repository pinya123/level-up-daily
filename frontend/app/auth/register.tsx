import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ThemedView } from '../../components/ThemedView';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dayStartTime, setDayStartTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password, dayStartTime);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const timeOptions = [
    { label: '6 AM', value: '06:00' },
    { label: '7 AM', value: '07:00' },
    { label: '8 AM', value: '08:00' },
    { label: '9 AM', value: '09:00' },
    { label: '10 AM', value: '10:00' },
  ];

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
                  Join the Challenge! 🎯
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Start your productivity journey today
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
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
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

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.sectionTitle}>
                  When does your day start? (for points calculation)
                </Text>

                <SegmentedButtons
                  value={dayStartTime}
                  onValueChange={setDayStartTime}
                  buttons={timeOptions}
                  style={styles.timeButtons}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.registerButton}
                >
                  Create Account
                </Button>

                <Button
                  mode="text"
                  onPress={goToLogin}
                  style={styles.loginButton}
                >
                  Already have an account? Log in
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
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  timeButtons: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
}); 