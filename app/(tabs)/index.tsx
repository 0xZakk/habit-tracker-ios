import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { HabitItem } from '@/components/HabitItem';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Habit } from '@/src/types/habit';
import { habitService } from '@/src/lib/habitService';
import { normalizeToDay } from '@/src/lib/dateUtils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHabits = async () => {
    try {
      const fetchedHabits = await habitService.getHabits();
      console.log("fetchedHabits", fetchedHabits);
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const toggleHabitCompletion = async (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const todayNormalized = normalizeToDay(new Date()).getTime();
        const isCompleted = habit.completedDates.some((date: Date) => 
          normalizeToDay(date).getTime() === todayNormalized
        );
        
        return {
          ...habit,
          completedDates: isCompleted 
            ? habit.completedDates.filter((date: Date) => 
                normalizeToDay(date).getTime() !== todayNormalized
              )
            : [...habit.completedDates, normalizeToDay(new Date())]
        };
      }
      return habit;
    }));
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedText type="title">My Habits</ThemedText>
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            Ready to build some great habits?
          </ThemedText>
          <Link href="/(tabs)/new" asChild>
            <Pressable style={styles.addButton}>
              <ThemedText style={styles.buttonText}>Add Your First Habit</ThemedText>
            </Pressable>
          </Link>
        </View>
      ) : (
        <FlatList 
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitItem 
              habit={item} 
              onToggle={() => toggleHabitCompletion(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
