import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { habitService } from "@/src/lib/habitService";
import { Habit } from "@/src/types/habit";
import { normalizeToDay } from "@/src/lib/dateUtils";

const ITEMS_PER_PAGE = 10;

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  useEffect(() => {
    async function loadHabit() {
      try {
        const habitData = await habitService.getHabit(id);
        setHabit(habitData);
        if (habitData && habitData.completedDates.length <= ITEMS_PER_PAGE) {
          setShowLoadMore(false);
        }
      } catch (error) {
        console.error("Failed to load habit:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHabit();
  }, [id]);

  // Update the header title when the habit loads
  useEffect(() => {
    if (habit) {
      // Set the header title to the habit name
      router.setParams({ title: habit.name });
    }
  }, [habit]);

  const handleDelete = async () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (habit) {
              const success = await habitService.deleteHabit(habit.id);
              if (success) {
                router.push("/");
              } else {
                Alert.alert("Error", "Failed to delete habit");
              }
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (habit) {
      setNewHabitName(habit.name);
      setIsEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!habit || !newHabitName.trim()) return;

    try {
      const success = await habitService.updateHabit({
        id: habit.id,
        name: newHabitName.trim(),
      });

      if (success) {
        setHabit({
          ...habit,
          name: newHabitName.trim(),
        });
        router.setParams({ title: newHabitName.trim() });
        setIsEditModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update habit name");
      }
    } catch (error) {
      console.error("Failed to update habit:", error);
      Alert.alert("Error", "Failed to update habit name");
    }
  };

  const calculateStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates
      .map(date => normalizeToDay(date).getTime())
      .sort((a, b) => b - a);

    let streak = 1;
    let currentDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const previousDate = currentDate - 24 * 60 * 60 * 1000;
      if (previousDate === sortedDates[i]) {
        streak++;
        currentDate = previousDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    if (habit && (nextPage + 1) * ITEMS_PER_PAGE >= habit.completedDates.length) {
      setShowLoadMore(false);
    }
  };

  const handleDayPress = (date: Date) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    if (selectedDate?.getTime() === date.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
      tooltipTimeoutRef.current = setTimeout(() => {
        setSelectedDate(null);
      }, 10000);
    }
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const calculateLast30DaysStats = (completedDates: Date[]) => {
    const today = normalizeToDay(new Date());
    const days: { date: Date; completed: boolean }[] = [];
    let completed = 0;
    
    // Convert completed dates to timestamps for easier comparison
    const completedTimestamps = new Set(
      completedDates.map(date => normalizeToDay(date).getTime())
    );

    // Generate last 30 days (including today)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const normalizedDate = normalizeToDay(date);
      const isCompleted = completedTimestamps.has(normalizedDate.getTime());
      
      if (isCompleted) {
        completed++;
      }
      
      days.push({
        date: normalizedDate,
        completed: isCompleted
      });
    }

    return {
      completed,
      total: 30,
      days
    };
  };

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

  const visibleCompletions = habit.completedDates
    .slice(0, (page + 1) * ITEMS_PER_PAGE)
    .sort((a, b) => b.getTime() - a.getTime());

  return (
    <>
      <Stack.Screen 
        options={{
          title: habit?.name ?? "Loading...",
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title">{habit.name}</ThemedText>
          
          <View style={styles.statsSection}>
            <ThemedText type="defaultSemiBold" style={styles.streakText}>
              🔥 {calculateStreak(habit.completedDates)} day streak
            </ThemedText>
            <ThemedText>
              Total completions: {habit.completedDates.length}
            </ThemedText>
            <View style={styles.streakVisualization}>
              {calculateLast30DaysStats(habit.completedDates).days.map((day) => (
                <View key={day.date.toISOString()} style={styles.dayContainer}>
                  {selectedDate?.getTime() === day.date.getTime() && (
                    <View style={styles.tooltip}>
                      <ThemedText style={styles.tooltipText}>
                        {day.date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </ThemedText>
                    </View>
                  )}
                  <Pressable
                    onPress={() => handleDayPress(day.date)}
                    style={[
                      styles.dayBox,
                      day.completed ? styles.dayCompleted : styles.dayMissed
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.completionLog}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Completion History
            </ThemedText>
            {visibleCompletions.map((date, index) => (
              <View key={date.getTime()} style={styles.completionItem}>
                <ThemedText>
                  {date.toLocaleDateString()}
                </ThemedText>
              </View>
            ))}
            {showLoadMore && (
              <Pressable 
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
              >
                <ThemedText style={styles.loadMoreText}>
                  Load More
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.actionButtons}>
            <Pressable 
              onPress={handleEdit}
              style={[styles.button, styles.editButton]}
            >
              <ThemedText style={styles.buttonText}>
                Edit Habit
              </ThemedText>
            </Pressable>
            
            <Pressable 
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
            >
              <ThemedText style={[styles.buttonText, styles.deleteButtonText]}>
                Delete Habit
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
              Edit Habit Name
            </ThemedText>
            
            <TextInput
              style={styles.input}
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="Enter new habit name"
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleSaveEdit}
            />

            <View style={styles.modalButtons}>
              <Pressable 
                onPress={() => setIsEditModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <ThemedText style={styles.modalButtonText}>
                  Cancel
                </ThemedText>
              </Pressable>

              <Pressable 
                onPress={handleSaveEdit}
                style={[styles.modalButton, styles.saveButton]}
              >
                <ThemedText style={styles.modalButtonText}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
  },
  statsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  streakText: {
    fontSize: 18,
    marginBottom: 8,
  },
  streakVisualization: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 12,
  },
  dayBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  dayCompleted: {
    backgroundColor: '#0a7ea4',
  },
  dayMissed: {
    backgroundColor: 'transparent',
  },
  dayContainer: {
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    flexShrink: 0,
  },
  completionLog: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  completionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loadMoreButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#007AFF',
  },
  actionButtons: {
    marginTop: 30,
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
});
