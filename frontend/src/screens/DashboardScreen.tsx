import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Paragraph,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useQuery } from 'react-query';
import { useAuthStore } from '@/store/authStore';
import { tasksAPI, usersAPI } from '@/services/api';
import { theme } from '@/theme';
import { Task, TaskStats } from '@/types';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data
  const { data: stats, refetch: refetchStats } = useQuery(
    ['taskStats'],
    () => tasksAPI.getStats(7),
    { enabled: !!user }
  );

  // Fetch recent tasks
  const { data: tasksData, refetch: refetchTasks } = useQuery(
    ['recentTasks'],
    () => tasksAPI.getTasks({ status: 'pending' }),
    { enabled: !!user }
  );

  // Fetch suggestions
  const { data: suggestionsData, refetch: refetchSuggestions } = useQuery(
    ['suggestions'],
    () => usersAPI.getSuggestions(),
    { enabled: !!user }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchTasks(),
      refetchSuggestions(),
    ]);
    setRefreshing(false);
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const handleViewTasks = () => {
    navigation.navigate('Tasks');
  };

  const handleViewCompetitions = () => {
    navigation.navigate('Competitions');
  };

  const handleCompleteTask = async (taskId: string) => {
    Alert.prompt(
      'Task Reflection',
      'How did this task go? What did you learn?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async (reflection) => {
            if (!reflection || reflection.trim().length === 0) {
              Alert.alert('Error', 'Please provide a reflection');
              return;
            }
            try {
              await tasksAPI.completeTask(taskId, { reflection });
              refetchTasks();
              refetchStats();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to complete task');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return theme.colors.difficulty.easy;
      case 'MEDIUM':
        return theme.colors.difficulty.medium;
      case 'HARD':
        return theme.colors.difficulty.hard;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 50;
      case 'MEDIUM':
        return 70;
      case 'HARD':
        return 100;
      default:
        return 0;
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.greeting}>
          Hello, {user.username}! 👋
        </Title>
        <Paragraph style={styles.subtitle}>
          Ready to level up your productivity?
        </Paragraph>
      </View>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <Card.Content>
          <View style={styles.streakHeader}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Title style={styles.streakTitle}>
                {user.currentStreak} Day{user.currentStreak !== 1 ? 's' : ''} Streak
              </Title>
              <Text style={styles.streakSubtitle}>
                Best: {user.maxStreak} days
              </Text>
            </View>
          </View>
          <View style={styles.streakProgress}>
            <View style={[styles.streakBar, { width: `${Math.min((user.currentStreak / 7) * 100, 100)}%` }]} />
          </View>
        </Card.Content>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>
              {stats?.totalPoints || 0}
            </Text>
            <Text style={styles.statLabel}>Points This Week</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>
              {stats?.tasksCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleAddTask}
              style={styles.actionButton}
              icon="plus"
            >
              Add Task
            </Button>
            <Button
              mode="outlined"
              onPress={handleViewTasks}
              style={styles.actionButton}
              icon="list"
            >
              View Tasks
            </Button>
            <Button
              mode="outlined"
              onPress={handleViewCompetitions}
              style={styles.actionButton}
              icon="trophy"
            >
              Competitions
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Tasks */}
      {tasksData?.tasks && tasksData.tasks.length > 0 && (
        <Card style={styles.tasksCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Tasks</Title>
            {tasksData.tasks.slice(0, 3).map((task: Task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getDifficultyColor(task.difficulty) }}
                    style={[styles.difficultyChip, { borderColor: getDifficultyColor(task.difficulty) }]}
                  >
                    {task.difficulty} ({getDifficultyPoints(task.difficulty)}pts)
                  </Chip>
                </View>
                <IconButton
                  icon="check-circle"
                  size={24}
                  onPress={() => handleCompleteTask(task.id)}
                  iconColor={theme.colors.success}
                />
              </View>
            ))}
            {tasksData.tasks.length > 3 && (
              <Button
                mode="text"
                onPress={handleViewTasks}
                style={styles.viewAllButton}
              >
                View All Tasks
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Suggestions */}
      {suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 && (
        <Card style={styles.suggestionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>💡 Suggestions</Title>
            {suggestionsData.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  greeting: {
    color: 'white',
    fontSize: theme.typography.h2.fontSize,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
  },
  streakCard: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.streak.background,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  streakTitle: {
    color: theme.colors.streak.text,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
  },
  streakSubtitle: {
    color: theme.colors.streak.text,
    opacity: 0.8,
  },
  streakProgress: {
    height: 8,
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  streakBar: {
    height: '100%',
    backgroundColor: theme.colors.streak.text,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  actionsCard: {
    margin: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  tasksCard: {
    margin: theme.spacing.lg,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
  },
  viewAllButton: {
    marginTop: theme.spacing.md,
  },
  suggestionsCard: {
    margin: theme.spacing.lg,
  },
  suggestionItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
}); 