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
  weight10RM?: number; // kg usati nel test 10RM (solo per esercizi con pesi)
  testDate?: string; // ISO date dell'ultimo test per questo pattern
  isEstimated?: boolean; // true = peso inferito da altri pattern, da adattare dopo 2-3 sedute
  estimatedFrom?: string; // pattern da cui è stato inferito (es. "horizontal_push")
}

export interface PatternBaselines {
  lower_push?: PatternBaseline;
  lower_pull?: PatternBaseline;
  horizontal_push?: PatternBaseline;
  horizontal_pull?: PatternBaseline;  // Rematore/Row - aggiunto per completezza
  vertical_push?: PatternBaseline;
  vertical_pull?: PatternBaseline;
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

/**
 * Serie singola di riscaldamento
 */
export interface WarmupSetDetail {
  reps: number;       // Ripetizioni per questa serie
  percentage: number; // Percentuale del peso di lavoro
}

/**
 * Configurazione riscaldamento per un esercizio
 * Può essere semplice (stesso schema per tutte le serie) o progressivo (rampa)
 */
export interface WarmupSet {
  sets: number;       // Numero totale serie riscaldamento
  reps: number;       // Ripetizioni per serie (se tutte uguali)
  percentage: number; // Percentuale del peso di lavoro (se tutte uguali)
  note?: string;      // Nota opzionale (es. "Riscaldamento lower body")
  /** Schema progressivo per lavori di forza (opzionale) */
  ramp?: WarmupSetDetail[];
}

/**
 * Configurazione superset per ottimizzazione tempo
 * Un superset combina due esercizi antagonisti senza pausa tra loro
 */
export interface SupersetConfig {
  pairedWith: string;      // Nome dell'esercizio abbinato
  pairedExerciseIndex: number; // Indice dell'esercizio abbinato nella lista
  restAfterSuperset: string;   // Rest dopo il superset completo (es. "90s")
  timeSaved: number;       // Minuti risparmiati con questo superset
}

export interface Exercise {
  pattern: PatternId | 'corrective';
  name: string;
  sets: number;
  reps: number | string; // può essere "10-15" per range
  rest: string; // "90s", "2-3min", etc.
  intensity?: string; // "65%", "75%", etc.
  dayType?: 'heavy' | 'moderate' | 'volume'; // DUP intra-giornata: tipo intensità
  notes?: string;
  baseline?: {
    variantId: string;
    difficulty: number;
    maxReps: number;
  };
  wasReplaced?: boolean; // true se sostituito per dolore
  weight?: string; // per esercizi gym con carico
  warmup?: WarmupSet; // Serie di riscaldamento specifiche per questo esercizio
  superset?: SupersetConfig; // Configurazione superset (se abbinato ad altro esercizio)
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
  estimatedDuration?: number; // Durata stimata in minuti (incluso riscaldamento)
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
