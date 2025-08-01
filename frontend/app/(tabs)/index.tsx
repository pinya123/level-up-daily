import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Modal,
  TextInput,
  SegmentedButtons,
  IconButton,
  Surface,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { tasksAPI, Task } from '../../src/services/api';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'difficult',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await tasksAPI.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await tasksAPI.createTask({
        title: newTask.title,
        description: newTask.description,
        difficulty: newTask.difficulty,
      });
      
      setShowAddModal(false);
      setNewTask({ title: '', description: '', difficulty: 'medium' });
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask || !reflectionNote.trim()) {
      Alert.alert('Error', 'Please enter a reflection note');
      return;
    }

    try {
      await tasksAPI.completeTask(selectedTask.id, { reflectionNote });
      setShowCompleteModal(false);
      setSelectedTask(null);
      setReflectionNote('');
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksAPI.deleteTask(taskId);
              loadTasks();
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
      default: return '#757575';
    }
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 25;
      case 'difficult': return 50;
      default: return 0;
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Stats */}
        <Surface style={styles.statsCard} elevation={2}>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Welcome back, {user?.username}! 🚀
          </Text>
          
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.totalPoints || 0}
                </Text>
                <Text variant="bodyMedium">Total Points</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.currentStreak || 0}
                </Text>
                <Text variant="bodyMedium">Current Streak</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statValue}>
                  {user?.maxStreak || 0}
                </Text>
                <Text variant="bodyMedium">Best Streak</Text>
              </Card.Content>
            </Card>
          </View>
        </Surface>

        {/* Today's Progress */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Today's Tasks ({pendingTasks.length})
            </Text>
            
            {pendingTasks.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No tasks for today. Add one to get started!
              </Text>
            ) : (
              pendingTasks.map((task) => (
                <Card key={task.id} style={styles.taskCard}>
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskInfo}>
                        <Text variant="titleMedium">{task.title}</Text>
                        {task.description && (
                          <Text variant="bodyMedium" style={styles.taskDescription}>
                            {task.description}
                          </Text>
                        )}
                      </View>
                      <Chip
                        textStyle={{ color: 'white' }}
                        style={[
                          styles.difficultyChip,
                          { backgroundColor: getDifficultyColor(task.difficulty) }
                        ]}
                      >
                        {task.difficulty} (+{getDifficultyPoints(task.difficulty)})
                      </Chip>
                    </View>
                    
                    <View style={styles.taskActions}>
                      <Button
                        mode="contained"
                        onPress={() => {
                          setSelectedTask(task);
                          setShowCompleteModal(true);
                        }}
                        style={styles.completeButton}
                      >
                        Complete
                      </Button>
                      <IconButton
                        icon="delete"
                        onPress={() => handleDeleteTask(task.id)}
                        iconColor="#F44336"
                      />
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
        onPress={() => setShowAddModal(true)}
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modal}
      >
        <Card>
          <Card.Content>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Add New Task
            </Text>
            
            <TextInput
              label="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              mode="outlined"
              style={styles.modalInput}
            />
            
            <TextInput
              label="Description (optional)"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              mode="outlined"
              style={styles.modalInput}
              multiline
            />
            
            <Text variant="bodyMedium" style={styles.modalLabel}>
              Difficulty Level
            </Text>
            <SegmentedButtons
              value={newTask.difficulty}
              onValueChange={(value) => setNewTask({ ...newTask, difficulty: value as any })}
              buttons={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'difficult', label: 'Hard' },
              ]}
              style={styles.segmentedButton}
            />
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
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
          </Card.Content>
        </Card>
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        visible={showCompleteModal}
        onDismiss={() => setShowCompleteModal(false)}
        contentContainerStyle={styles.modal}
      >
        <Card>
          <Card.Content>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Complete Task
            </Text>
            
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {selectedTask?.title}
            </Text>
            
            <TextInput
              label="Reflection Note"
              value={reflectionNote}
              onChangeText={setReflectionNote}
              mode="outlined"
              style={styles.modalInput}
              multiline
              numberOfLines={3}
              placeholder="How did this task go? What did you learn?"
            />
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowCompleteModal(false);
                  setSelectedTask(null);
                  setReflectionNote('');
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCompleteTask}
                style={styles.modalButton}
              >
                Complete
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
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
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  welcomeText: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsRow: {
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
  sectionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  completeButton: {
    marginRight: 8,
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
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButton: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 80,
  },
});
