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

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return data.map((habit) => ({
      id: habit.id,
      name: habit.name,
      createdAt: new Date(habit.created_at),
      completedDates: [],
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
}; 