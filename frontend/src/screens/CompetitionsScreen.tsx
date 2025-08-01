import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { theme } from '@/theme';

interface CompetitionsScreenProps {
  navigation: any;
}

export default function CompetitionsScreen({ navigation }: CompetitionsScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competitions Screen</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CompetitionDetail', { id: '1' })}
        style={styles.button}
      >
        View Competitions
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