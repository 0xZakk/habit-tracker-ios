export interface Habit {
  id: string;
  name: string;
  createdAt: Date;
  completedDates: Date[];
}

export interface HabitCompletion {
  habitId: string;
  completedAt: Date;
} 