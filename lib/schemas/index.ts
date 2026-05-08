import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration_minutes: z.coerce.number().min(1).max(600),
  calories_burned: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  logged_at: z.string(),
});

export const dietLogSchema = z.object({
  meal_name: z.string().min(1, "Meal name is required"),
  calories: z.coerce.number().min(0).max(9999),
  protein_g: z.coerce.number().min(0).optional(),
  carbs_g: z.coerce.number().min(0).optional(),
  fat_g: z.coerce.number().min(0).optional(),
  logged_at: z.string(),
});

export const dietGoalSchema = z.object({
  daily_calories: z.coerce.number().min(500).max(10000),
  protein_g: z.coerce.number().min(0).optional(),
  carbs_g: z.coerce.number().min(0).optional(),
  fat_g: z.coerce.number().min(0).optional(),
});

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  date: z.string(),
});

export const workSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration_minutes: z.coerce.number().min(1).max(1440),
  notes: z.string().optional(),
  logged_at: z.string(),
});

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
});

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  duration_minutes: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  logged_at: z.string(),
});

export type WorkoutFormData = z.infer<typeof workoutSchema>;
export type DietLogFormData = z.infer<typeof dietLogSchema>;
export type DietGoalFormData = z.infer<typeof dietGoalSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type WorkSessionFormData = z.infer<typeof workSessionSchema>;
export type TodoFormData = z.infer<typeof todoSchema>;
export type ActivityFormData = z.infer<typeof activitySchema>;
