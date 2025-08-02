import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  Surface,
  List,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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
            try {
              await logout();
              console.log('✅ Logout successful');
              // The layout will automatically redirect to login screen
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getLevel = (points: number) => {
    if (points < 100) return { level: 1, title: 'Beginner' };
    if (points < 500) return { level: 2, title: 'Apprentice' };
    if (points < 1000) return { level: 3, title: 'Journeyman' };
    if (points < 2000) return { level: 4, title: 'Expert' };
    return { level: 5, title: 'Master' };
  };

  const { level, title } = getLevel(user?.totalPoints || 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Surface style={styles.profileHeader} elevation={2}>
          <Avatar.Text
            size={80}
            label={user?.username?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          
          <Text variant="headlineSmall" style={styles.username}>
            {user?.username}
          </Text>
          
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          
          <View style={styles.levelContainer}>
            <Text variant="titleMedium" style={styles.levelTitle}>
              Level {level} - {title}
            </Text>
            <Text variant="bodySmall" style={styles.levelSubtitle}>
              {user?.totalPoints || 0} total points
            </Text>
          </View>
        </Surface>

        {/* Stats Overview */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Your Stats
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.totalPoints || 0}
                </Text>
                <Text variant="bodyMedium">Total Points</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.currentStreak || 0}
                </Text>
                <Text variant="bodyMedium">Current Streak</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.maxStreak || 0}
                </Text>
                <Text variant="bodyMedium">Best Streak</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Settings
            </Text>
            
            <List.Item
              title="Day Start Time"
              description={user?.dayStartTime || '09:00'}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            
            <Divider />
            
            <List.Item
              title="Account Information"
              description="View and edit your account details"
              left={(props) => <List.Icon {...props} icon="account-outline" />}
              onPress={() => Alert.alert('Info', 'Account settings coming soon!')}
            />
            
            <Divider />
            
            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              onPress={() => Alert.alert('Info', 'Notification settings coming soon!')}
            />
            
            <Divider />
            
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
              onPress={() => Alert.alert('Info', 'Help & support coming soon!')}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#F44336"
          buttonColor="transparent"
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#2196F3',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    opacity: 0.7,
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelTitle: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  levelSubtitle: {
    opacity: 0.7,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    borderColor: '#F44336',
  },
}); 