import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Surface,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { tasksAPI } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [weekly, daily] = await Promise.all([
        tasksAPI.getWeeklyStats(),
        tasksAPI.getDailyStats(),
      ]);
      setWeeklyStats(weekly);
      setDailyStats(daily);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMaxPoints = () => {
    if (weeklyStats.length === 0) return 1;
    return Math.max(...weeklyStats.map(day => day.points));
  };

  const maxPoints = getMaxPoints();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Progress */}
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Today's Progress
          </Text>
          
          <View style={styles.todayStats}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statValue}>
                  {dailyStats?.totalPoints || 0}
                </Text>
                <Text variant="bodyMedium">Points Earned</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statValue}>
                  {dailyStats?.tasksCompleted || 0}
                </Text>
                <Text variant="bodyMedium">Tasks Completed</Text>
              </Card.Content>
            </Card>
          </View>
        </Surface>

        {/* Weekly Progress */}
        <Card style={styles.weeklyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              This Week's Progress
            </Text>
            
            {weeklyStats.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No data for this week yet. Complete some tasks to see your progress!
              </Text>
            ) : (
              <View style={styles.weeklyChart}>
                {weeklyStats.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <Text variant="bodySmall" style={styles.dayLabel}>
                      {getDayName(day.date)}
                    </Text>
                    
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: (day.points / maxPoints) * 100,
                            backgroundColor: day.points > 0 ? '#2196F3' : '#E0E0E0',
                          },
                        ]}
                      />
                    </View>
                    
                    <Text variant="bodySmall" style={styles.pointsLabel}>
                      {day.points}
                    </Text>
                    
                    <Text variant="bodySmall" style={styles.tasksLabel}>
                      {day.tasksCompleted} tasks
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* User Stats */}
        <Card style={styles.userStatsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Your Achievements
            </Text>
            
            <View style={styles.achievementRow}>
              <View style={styles.achievement}>
                <Text variant="titleLarge" style={styles.achievementValue}>
                  {user?.totalPoints || 0}
                </Text>
                <Text variant="bodyMedium">Total Points</Text>
              </View>
              
              <View style={styles.achievement}>
                <Text variant="titleLarge" style={styles.achievementValue}>
                  {user?.currentStreak || 0}
                </Text>
                <Text variant="bodyMedium">Current Streak</Text>
              </View>
            </View>
            
            <View style={styles.achievementRow}>
              <View style={styles.achievement}>
                <Text variant="titleLarge" style={styles.achievementValue}>
                  {user?.maxStreak || 0}
                </Text>
                <Text variant="bodyMedium">Best Streak</Text>
              </View>
              
              <View style={styles.achievement}>
                <Text variant="titleLarge" style={styles.achievementValue}>
                  {user?.dayStartTime || '09:00'}
                </Text>
                <Text variant="bodyMedium">Day Start</Text>
              </View>
            </View>

            {/* Streak Progress */}
            <View style={styles.streakSection}>
              <Text variant="bodyMedium" style={styles.streakLabel}>
                Streak Progress
              </Text>
              <ProgressBar
                progress={(user?.currentStreak || 0) / Math.max(user?.maxStreak || 1, 1)}
                color="#4CAF50"
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.streakText}>
                {user?.currentStreak || 0} / {user?.maxStreak || 0} days
              </Text>
            </View>
          </Card.Content>
        </Card>
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
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weeklyCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
    marginVertical: 20,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginTop: 16,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  barContainer: {
    width: 20,
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
  pointsLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tasksLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  userStatsCard: {
    margin: 16,
    marginTop: 0,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievement: {
    flex: 1,
    alignItems: 'center',
  },
  achievementValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  streakSection: {
    marginTop: 16,
  },
  streakLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    marginBottom: 4,
  },
  streakText: {
    textAlign: 'center',
    opacity: 0.7,
  },
}); 