import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Habit } from '@/types/habit';

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
}

export function HabitItem({ habit, onToggle }: HabitItemProps) {
  const isCompletedToday = habit.completedDates.some(
    date => date.toDateString() === new Date().toDateString()
  );

  const streak = calculateStreak(habit.completedDates);

  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <View style={styles.habitInfo}>
        <ThemedText type="defaultSemiBold">{habit.name}</ThemedText>
        <ThemedText>🔥 {streak} day streak</ThemedText>
      </View>
      <View style={[styles.checkbox, isCompletedToday && styles.checked]} />
    </Pressable>
  );
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(date => date.toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    if (previousDate.toDateString() === sortedDates[i]) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
  },
  habitInfo: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  checked: {
    backgroundColor: '#0a7ea4',
  },
}); 