/**
 * Program & Exercise Types - Centralizzato
 */

import { Level, Goal } from './onboarding.types';

export type PatternId =
  | 'lower_push'
  | 'horizontal_push'
  | 'vertical_push'
  | 'vertical_pull'
  | 'lower_pull'
  | 'core';

export interface PatternBaseline {
  variantId: string;
  variantName: string;
  difficulty: number; // 1-10
  reps: number; // max reps achieved
}

export interface PatternBaselines {
  lower_push?: PatternBaseline;
  horizontal_push?: PatternBaseline;
  vertical_push?: PatternBaseline;
  vertical_pull?: PatternBaseline;
  lower_pull?: PatternBaseline;
  core?: PatternBaseline;
}

export interface ScreeningData {
  level: Level;
  finalScore: number;
  quizScore: number;
  practicalScore: number;
  physicalScore: number;
  patternBaselines: PatternBaselines;
  timestamp: string;
}

export interface Exercise {
  pattern: PatternId | 'corrective';
  name: string;
  sets: number;
  reps: number | string; // può essere "10-15" per range
  rest: string; // "90s", "2-3min", etc.
  intensity?: string; // "65%", "75%", etc.
  notes?: string;
  baseline?: {
    variantId: string;
    difficulty: number;
    maxReps: number;
  };
  wasReplaced?: boolean; // true se sostituito per dolore
  weight?: string; // per esercizi gym con carico
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WeeklySplit {
  splitName: string;
  description: string;
  days: DayWorkout[];
}

export interface Program {
  name: string;
  level: Level;
  goal: Goal;
  split: string; // "FULL BODY", "UPPER/LOWER", etc.
  frequency: number; // days per week
  exercises: Exercise[];
  correctiveExercises?: Exercise[];
  notes: string;
  created_at: string; // Changed from createdAt to match Supabase schema
  weeklySplit?: WeeklySplit; // NUOVO: Split dettagliato per giorni
}

export interface WeeklySchedule {
  dayName: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string | number;
  rest: number; // seconds
  notes: string;
  type: 'standard' | 'giant_set';
  intensity?: string;
  baseline?: {
    variantId: string;
    difficulty: number;
    maxReps: number;
  };
  weight?: string;
}

export interface VolumeCalculation {
  sets: number;
  reps: number;
  rest: string;
  intensity: string;
  notes?: string;
}
