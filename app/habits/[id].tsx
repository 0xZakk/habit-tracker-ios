import { View, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import { habitService } from "@/src/lib/habitService";
import { Habit } from "@/src/types/habit";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHabit() {
      try {
        const habitData = await habitService.getHabit(id);
        setHabit(habitData);
      } catch (error) {
        console.error("Failed to load habit:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHabit();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={styles.notFoundText}>Habit not found</ThemedText>
        <Pressable 
          onPress={() => router.push("/")}
          style={styles.backButton}
        >
          <ThemedText style={styles.backButtonText}>Back to Home</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">{habit.name}</ThemedText>
        <View style={styles.statsSection}>
          <ThemedText type="subtitle">Streak</ThemedText>
          {/* We'll add the streak visualization here */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  statsSection: {
    marginTop: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  }
});
