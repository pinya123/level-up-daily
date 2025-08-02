import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dayStartTime, setDayStartTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      console.log('Error', 'Please fill in all fields');
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      console.log('Error', 'Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      console.log('Error', 'Password must be at least 6 characters long');
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!email.includes('@')) {
      console.log('Error', 'Please enter a valid email address');
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    console.log(isLoading);
    try {
      console.log('Attempting to register with:', {
        username: username.trim(),
        email: email.trim(),
        password: password.length,
        dayStartTime,
      });

      await register(username.trim(), email.trim(), password, dayStartTime);
      
      console.log('Registration successful!');
      // The layout will automatically redirect to the main app
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        errorMessage = error.response.data?.message || error.response.data?.error || 'Server error';
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = 'Network error - please check your connection';
      } else {
        // Other error
        console.error('Other error:', error.message);
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="headlineMedium" style={styles.title}>
            Join the Journey!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Create your account to start leveling up your productivity
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                disabled={isLoading}
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                disabled={isLoading}
              />

              <Text variant="bodyMedium" style={styles.label}>
                When does your day start?
              </Text>
              <SegmentedButtons
                value={dayStartTime}
                onValueChange={setDayStartTime}
                buttons={[
                  { value: '06:00', label: '6 AM' },
                  { value: '09:00', label: '9 AM' },
                  { value: '12:00', label: '12 PM' },
                ]}
                style={styles.segmentedButton}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Button
              mode="text"
              onPress={() => router.push('/auth/login')}
              compact
            >
              Sign In
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
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
  card: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButton: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 