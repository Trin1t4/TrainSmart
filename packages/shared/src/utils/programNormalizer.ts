/**
 * Program Normalizer - Gestisce la conversione tra formati programma
 *
 * Formati supportati:
 * 1. weekly_split.days[] (DB canonico) → il formato usato dal database
 * 2. weekly_schedule[] (runtime) → il formato usato dal frontend
 * 3. exercises[] (flat legacy) → formato legacy da deprecare
 *
 * @module programNormalizer
 */

import type { Exercise, DayWorkout, WeeklySplit } from '../types';

export interface NormalizedDay {
  dayName: string;
  dayNumber?: number;
  focus?: string;
  exercises: Exercise[];
  estimatedDuration?: number;
}

export interface NormalizedProgram {
  weekly_schedule: NormalizedDay[];
  weekly_split?: WeeklySplit;
  // Altri campi del programma originale
  [key: string]: any;
}

/**
 * Converte un esercizio dal formato WorkoutExercise al formato Exercise
 */
function normalizeExercise(ex: any): Exercise {
  return {
    pattern: ex.pattern || 'core',
    name: ex.name,
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    rest: typeof ex.rest === 'number' ? `${ex.rest}s` : (ex.rest || '60s'),
    intensity: ex.intensity,
    notes: ex.notes,
    baseline: ex.baseline,
    weight: ex.weight,
    warmup: ex.warmup,
    superset: ex.superset,
  };
}

/**
 * Genera weekly_schedule da exercises[] flat (legacy)
 * Crea un singolo giorno "Full Body" con tutti gli esercizi
 */
function generateFromFlatExercises(program: any): NormalizedDay[] {
  const exercises = (program.exercises || []).map(normalizeExercise);

  return [{
    dayName: 'Full Body',
    dayNumber: 1,
    focus: 'Allenamento Completo',
    exercises,
    estimatedDuration: Math.max(30, exercises.length * 5),
  }];
}

/**
 * Converte weekly_split.days[] (DB) → weekly_schedule[] (runtime)
 */
function convertWeeklySplitToSchedule(weeklySplit: WeeklySplit): NormalizedDay[] {
  return weeklySplit.days.map((day: DayWorkout) => ({
    dayName: day.dayName,
    dayNumber: day.dayNumber,
    focus: day.focus,
    exercises: day.exercises.map(normalizeExercise),
    estimatedDuration: day.estimatedDuration,
  }));
}

/**
 * Normalizza weekly_schedule[] esistente
 */
function normalizeWeeklySchedule(schedule: any[]): NormalizedDay[] {
  return schedule.map((day: any, index: number) => ({
    dayName: day.dayName || day.name || `Giorno ${index + 1}`,
    dayNumber: day.dayNumber || index + 1,
    focus: day.focus || '',
    exercises: (day.exercises || []).map(normalizeExercise),
    estimatedDuration: day.estimatedDuration,
  }));
}

/**
 * Normalizza qualsiasi formato programma in un formato unificato
 *
 * Input accettati:
 * - { weekly_split: { days: [...] } } → DB format
 * - { weekly_schedule: [...] } → Runtime format
 * - { exercises: [...] } → Legacy flat format
 *
 * Output:
 * - { weekly_schedule: NormalizedDay[], ...originalFields }
 */
export function normalizeProgram(program: any): NormalizedProgram {
  if (!program) {
    console.warn('[programNormalizer] Program is null/undefined');
    return { weekly_schedule: [] };
  }

  let weekly_schedule: NormalizedDay[];

  // Priority 1: weekly_split.days (DB canonical format)
  if (program.weekly_split?.days && Array.isArray(program.weekly_split.days)) {
    weekly_schedule = convertWeeklySplitToSchedule(program.weekly_split);
  }
  // Priority 2: weekly_schedule (runtime format)
  else if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
    weekly_schedule = normalizeWeeklySchedule(program.weekly_schedule);
  }
  // Priority 3: exercises[] (legacy flat format)
  else if (program.exercises && Array.isArray(program.exercises)) {
    weekly_schedule = generateFromFlatExercises(program);
    console.warn('[programNormalizer] Using legacy exercises[] format - consider migrating to weekly_split');
  }
  // Fallback: empty schedule
  else {
    console.warn('[programNormalizer] No valid program structure found');
    weekly_schedule = [];
  }

  return {
    ...program,
    weekly_schedule,
  };
}

/**
 * Verifica se un programma è nel formato canonico (weekly_split)
 */
export function isCanonicalFormat(program: any): boolean {
  return program?.weekly_split?.days && Array.isArray(program.weekly_split.days);
}

/**
 * Verifica se un programma ha bisogno di normalizzazione
 */
export function needsNormalization(program: any): boolean {
  // Ha già weekly_schedule normalizzato
  if (program?.weekly_schedule && Array.isArray(program.weekly_schedule)) {
    return false;
  }
  // Ha weekly_split da convertire
  if (program?.weekly_split?.days) {
    return true;
  }
  // Ha exercises[] legacy
  if (program?.exercises && Array.isArray(program.exercises)) {
    return true;
  }
  return false;
}

/**
 * Estrae gli esercizi di un giorno specifico
 */
export function getExercisesForDay(program: NormalizedProgram, dayIndex: number): Exercise[] {
  const day = program.weekly_schedule?.[dayIndex];
  return day?.exercises || [];
}

/**
 * Trova un esercizio per nome in tutto il programma
 */
export function findExerciseByName(program: NormalizedProgram, exerciseName: string): { day: NormalizedDay; exercise: Exercise; dayIndex: number } | null {
  for (let i = 0; i < (program.weekly_schedule?.length || 0); i++) {
    const day = program.weekly_schedule[i];
    const exercise = day.exercises.find(ex => ex.name === exerciseName);
    if (exercise) {
      return { day, exercise, dayIndex: i };
    }
  }
  return null;
}

/**
 * Aggiorna il peso di un esercizio nel programma normalizzato
 */
export function updateExerciseWeight(
  program: NormalizedProgram,
  exerciseName: string,
  newWeight: string
): NormalizedProgram {
  const updatedSchedule = program.weekly_schedule.map(day => ({
    ...day,
    exercises: day.exercises.map(ex =>
      ex.name === exerciseName ? { ...ex, weight: newWeight } : ex
    ),
  }));

  return {
    ...program,
    weekly_schedule: updatedSchedule,
  };
}
