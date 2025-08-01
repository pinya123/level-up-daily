import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { theme } from '@/theme';

interface TasksScreenProps {
  navigation: any;
}

export default function TasksScreen({ navigation }: TasksScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddTask')}
        style={styles.button}
      >
        Add New Task
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.md,
  },
}); 