import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Habit } from '@/src/types/habit';
import { habitService } from '@/src/lib/habitService';
import { normalizeToDay } from '@/src/lib/dateUtils';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
}

export function HabitItem({ habit, onToggle }: HabitItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const expandAnimation = useRef(new Animated.Value(0)).current;
  
  const isCompletedToday = habit.completedDates.some(
    (date: Date) => normalizeToDay(date).getTime() === normalizeToDay(new Date()).getTime()
  );

  console.log(habit);
  
  const streak = calculateStreak(habit.completedDates);
  const last30DaysStats = calculateLast30DaysStats(habit.completedDates);

//   console.log(last30DaysStats);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    Animated.spring(expandAnimation, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const handleCheckboxPress = async (event: any) => {
    event.stopPropagation();
    const success = await habitService.toggleHabitCompletion(habit.id, new Date());
    if (success) {
      onToggle();
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

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress} style={styles.container}>
        <View style={styles.habitInfo}>
          <ThemedText type="defaultSemiBold">{habit.name}</ThemedText>
          <ThemedText>🔥 {streak} day streak</ThemedText>
        </View>
        <Pressable 
          onPress={handleCheckboxPress}
          style={[styles.checkbox, isCompletedToday && styles.checked]} 
        />
      </Pressable>
      
      <Animated.View style={[
        styles.expandedContent,
        {
          maxHeight: expandAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500]
          }),
          opacity: expandAnimation,
          marginTop: expandAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8]
          })
        }
      ]}>
        <View style={styles.statsContainer}>
          <ThemedText type="defaultSemiBold">
            {last30DaysStats.completed}/{last30DaysStats.total} days completed
          </ThemedText>
        </View>
        <View style={styles.streakVisualization}>
          {last30DaysStats.days.map((day, index) => (
            <View key={day.date.toISOString()} style={styles.dayContainer}>
                {/* <ThemedText style={{ color: '#000000' }}>{selectedDate?.getTime() === day.date.getTime()}</ThemedText> */}
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
        <Pressable 
          onPress={() => router.push(`/habits/${habit.id}`)} 
          style={styles.moreDetailsButton}
        >
          <ThemedText type="link">More Details</ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function calculateStreak(dates: Date[]): number {
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
}

interface DayStats {
  date: Date;
  completed: boolean;
}

interface Last30DaysStats {
  completed: number;
  total: number;
  days: DayStats[];
}

function calculateLast30DaysStats(completedDates: Date[]): Last30DaysStats {
  const today = normalizeToDay(new Date());
  const days: DayStats[] = [];
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
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  expandedContent: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsContainer: {
    marginBottom: 12,
  },
  streakVisualization: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
  moreDetailsButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
}); 