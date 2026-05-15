export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface DietLog {
  id: string;
  user_id: string;
  meal_name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  logged_at: string;
  created_at: string;
}

export interface DietGoal {
  id: string;
  user_id: string;
  daily_calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  date: string;
  created_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  type: string;
  duration_minutes?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: "workout" | "diet" | "work" | "finance";
  label: string;
  target_value: number;
  unit: string;
  period: "daily" | "weekly";
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  color: string;
  archived: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
}
