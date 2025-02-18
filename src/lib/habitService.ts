import { supabase } from './supabase';
import { Habit } from '../types/habit';

export const habitService = {
  async createHabit(habit: Omit<Habit, 'id' | 'completedDates'>): Promise<Habit | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          name: habit.name,
          created_at: new Date().toISOString(),
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      completedDates: [],
    };
  },

  async getHabits(): Promise<Habit[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      return [];
    }

    // Fetch all completions for the user's habits
    const { data: completions, error: completionsError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);

    if (completionsError) {
      console.error('Error fetching habit completions:', completionsError);
      return [];
    }

    return habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      createdAt: new Date(habit.created_at),
      completedDates: completions
        .filter(completion => completion.habit_id === habit.id)
        .map(completion => new Date(completion.completed_at)),
    }));
  },

  async deleteHabit(id: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }

    return true;
  },

  async updateHabit(habit: Pick<Habit, 'id' | 'name'>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('habits')
      .update({ name: habit.name })
      .eq('id', habit.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating habit:', error);
      return false;
    }

    return true;
  },

  async toggleHabitCompletion(habitId: string, date: Date): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if habit is already completed for this day
    const { data: existingCompletion, error: fetchError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .gte('completed_at', startOfDay.toISOString())
      .lte('completed_at', endOfDay.toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking habit completion:', fetchError);
      return false;
    }

    if (existingCompletion) {
      // If already completed, delete the completion
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existingCompletion.id);

      if (deleteError) {
        console.error('Error removing habit completion:', deleteError);
        return false;
      }
    } else {
      // If not completed, add a completion
      const { error: insertError } = await supabase
        .from('habit_completions')
        .insert([
          {
            habit_id: habitId,
            user_id: user.id,
            completed_at: date.toISOString(),
          },
        ]);

      if (insertError) {
        console.error('Error adding habit completion:', insertError);
        return false;
      }
    }

    return true;
  },
}; 