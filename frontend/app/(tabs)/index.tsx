import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, FAB, Portal, Modal, TextInput } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { tasksAPI, Task, CreateTaskDto } from '../../src/services/api';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

interface DashboardStats {
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
  todayPoints: number;
  todayTasks: number;
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    currentStreak: 0,
    maxStreak: 0,
    todayPoints: 0,
    todayTasks: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskDto>({
    title: '',
    description: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [tasksData, dailyStats] = await Promise.all([
        tasksAPI.getUserTasks('pending'),
        tasksAPI.getDailyStats(),
      ]);

      setTasks(tasksData);
      
      if (user) {
        setStats({
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          todayPoints: dailyStats.totalPoints || 0,
          todayTasks: dailyStats.tasksCompleted || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    try {
      await tasksAPI.createTask(newTask);
      setShowAddTask(false);
      setNewTask({ title: '', description: '', difficulty: 'medium' });
      loadDashboard();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleCompleteTask = async (task: Task) => {
    Alert.prompt(
      'Complete Task',
      'Add a reflection note (required):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async (reflectionNote) => {
            if (!reflectionNote?.trim()) {
              Alert.alert('Error', 'Reflection note is required');
              return;
            }

            try {
              await tasksAPI.completeTask(task.id, reflectionNote);
              loadDashboard();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete task');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteTask = async (task: Task) => {
    Alert.alert(
      'Delete Task',
      task.status === 'completed' 
        ? `Are you sure? You will lose ${task.pointsEarned} points.`
        : 'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksAPI.deleteTask(task.id);
              loadDashboard();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'difficult': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 50;
      case 'medium': return 70;
      case 'difficult': return 100;
      default: return 70;
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with user info */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall">Welcome back, {user.username}! 👋</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Keep up the great work!
            </Text>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.totalPoints}
              </Text>
              <Text variant="bodyMedium">Total Points</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.currentStreak}
              </Text>
              <Text variant="bodyMedium">Current Streak</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {stats.maxStreak}
              </Text>
              <Text variant="bodyMedium">Best Streak</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Today's Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="titleMedium">Today's Progress</Text>
            <View style={styles.progressRow}>
              <Text variant="bodyLarge">{stats.todayPoints} points earned</Text>
              <Text variant="bodyLarge">{stats.todayTasks} tasks completed</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Tasks List */}
        <Card style={styles.tasksCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Pending Tasks ({tasks.length})
            </Text>
            
            {tasks.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No pending tasks. Add your first task to get started!
              </Text>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} style={styles.taskItem}>
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <Text variant="titleMedium">{task.title}</Text>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(task.difficulty) },
                        ]}
                      >
                        <Text style={styles.difficultyText}>
                          {task.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    {task.description && (
                      <Text variant="bodyMedium" style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                    
                    <Text variant="bodySmall" style={styles.pointsText}>
                      Worth {getDifficultyPoints(task.difficulty)} points
                    </Text>
                    
                    <View style={styles.taskActions}>
                      <Button
                        mode="contained"
                        onPress={() => handleCompleteTask(task)}
                        style={styles.completeButton}
                      >
                        Complete
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleDeleteTask(task)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Task FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddTask(true)}
      />

      {/* Add Task Modal */}
      <Portal>
        <Modal
          visible={showAddTask}
          onDismiss={() => setShowAddTask(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add New Task
          </Text>
          
          <TextInput
            label="Task Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Description (optional)"
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            multiline
            style={styles.input}
          />
          
          <View style={styles.difficultyContainer}>
            <Text variant="bodyMedium">Difficulty:</Text>
            <View style={styles.difficultyButtons}>
              {(['easy', 'medium', 'difficult'] as const).map((difficulty) => (
                <Button
                  key={difficulty}
                  mode={newTask.difficulty === difficulty ? 'contained' : 'outlined'}
                  onPress={() => setNewTask({ ...newTask, difficulty })}
                  style={styles.difficultyButton}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Button>
              ))}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddTask(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddTask}
              style={styles.modalButton}
            >
              Add Task
            </Button>
          </View>
        </Modal>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressCard: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tasksCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginVertical: 20,
  },
  taskItem: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDescription: {
    marginBottom: 8,
    opacity: 0.8,
  },
  pointsText: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  difficultyContainer: {
    marginBottom: 16,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  difficultyButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
