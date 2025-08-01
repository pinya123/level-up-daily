import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Title } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content>
          <Title style={styles.username}>{user?.username}</Title>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.streak}>
            Current Streak: {user?.currentStreak} days
          </Text>
          <Text style={styles.maxStreak}>
            Best Streak: {user?.maxStreak} days
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Friends')}
          style={styles.button}
          icon="account-group"
        >
          Friends
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Settings', 'Settings coming soon...')}
          style={styles.button}
          icon="cog"
        >
          Settings
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.button, styles.logoutButton]}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    marginBottom: theme.spacing.xl,
  },
  username: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  email: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  streak: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  maxStreak: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  actions: {
    flex: 1,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    marginTop: theme.spacing.xl,
  },
}); 