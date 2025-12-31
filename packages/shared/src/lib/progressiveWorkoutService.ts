/**
 * PROGRESSIVE WORKOUT SERVICE
 *
 * Gestisce il salvataggio progressivo del workout durante la sessione.
 * Se l'utente chiude l'app può riprendere da dove era.
 *
 * FLUSSO:
 * 1. startWorkout() - Crea workout_log con status='in_progress'
 * 2. saveSet() - Salva ogni set completato in tempo reale
 * 3. saveSkip() - Salva esercizi saltati
 * 4. updateProgress() - Aggiorna posizione corrente
 * 5. completeWorkout() - Finalizza con status='completed'
 *
 * RIPRESA:
 * - getInProgressWorkout() - Recupera workout interrotto
 * - getWorkoutSets() - Recupera set già completati
 * - resumeWorkout() - Riprende da posizione salvata
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPES
// ================================================================

export interface WorkoutSession {
  id: string;
  user_id: string;
  program_id?: string;
  day_name: string;
  workout_date: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_exercise_index: number;
  current_set: number;
  exercises_completed: number;
  total_exercises: number;
  last_saved_at: string;
  session_rpe?: number;
  session_duration_minutes?: number;
  mood?: string;
  sleep_quality?: number;
  notes?: string;
}

export interface SetLog {
  id?: string;
  workout_log_id: string;
  exercise_name: string;
  exercise_index: number;
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rpe?: number;
  rir?: number;
  was_adjusted?: boolean;
  adjustment_reason?: string;
  completed_at?: string;
}

export interface StartWorkoutInput {
  userId: string;
  programId?: string;
  dayName: string;
  totalExercises: number;
  mood?: string;
  sleepQuality?: number;
  notes?: string;
}

// ================================================================
// SERVICE
// ================================================================

let supabaseClient: SupabaseClient | null = null;

export function initProgressiveWorkoutService(client: SupabaseClient) {
  supabaseClient = client;
}

function getClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('ProgressiveWorkoutService not initialized. Call initProgressiveWorkoutService first.');
  }
  return supabaseClient;
}

/**
 * Start a new workout session (creates workout_log with status='in_progress')
 */
export async function startWorkout(input: StartWorkoutInput): Promise<{ workoutId: string | null; error?: string }> {
  const client = getClient();

  // First, check if there's an existing in_progress workout
  const { data: existing } = await client
    .from('workout_logs')
    .select('id')
    .eq('user_id', input.userId)
    .eq('status', 'in_progress')
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log('[ProgressiveWorkout] Found existing in_progress workout:', existing.id);
    return { workoutId: existing.id };
  }

  // Create new workout log
  const { data, error } = await client
    .from('workout_logs')
    .insert({
      user_id: input.userId,
      program_id: input.programId,
      day_name: input.dayName,
      workout_date: new Date().toISOString(),
      status: 'in_progress',
      completed: false,
      current_exercise_index: 0,
      current_set: 1,
      exercises_completed: 0,
      total_exercises: input.totalExercises,
      mood: input.mood,
      sleep_quality: input.sleepQuality,
      notes: input.notes,
      last_saved_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[ProgressiveWorkout] Error starting workout:', error);
    return { workoutId: null, error: error.message };
  }

  console.log('[ProgressiveWorkout] Started new workout:', data.id);
  return { workoutId: data.id };
}

/**
 * Save a completed set in real-time
 */
export async function saveSet(setData: SetLog): Promise<boolean> {
  const client = getClient();

  const { error } = await client
    .from('set_logs')
    .upsert({
      workout_log_id: setData.workout_log_id,
      exercise_name: setData.exercise_name,
      exercise_index: setData.exercise_index,
      set_number: setData.set_number,
      reps_completed: setData.reps_completed,
      weight_used: setData.weight_used,
      rpe: setData.rpe,
      rir: setData.rir,
      was_adjusted: setData.was_adjusted || false,
      adjustment_reason: setData.adjustment_reason,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'workout_log_id,exercise_name,set_number',
    });

  if (error) {
    console.error('[ProgressiveWorkout] Error saving set:', error);
    return false;
  }

  console.log(`[ProgressiveWorkout] Saved set: ${setData.exercise_name} Set ${setData.set_number}`);
  return true;
}

/**
 * Update workout progress (current position)
 */
export async function updateProgress(
  workoutId: string,
  exerciseIndex: number,
  setNumber: number,
  exercisesCompleted: number
): Promise<boolean> {
  const client = getClient();

  const { error } = await client
    .from('workout_logs')
    .update({
      current_exercise_index: exerciseIndex,
      current_set: setNumber,
      exercises_completed: exercisesCompleted,
      last_saved_at: new Date().toISOString(),
    })
    .eq('id', workoutId);

  if (error) {
    console.error('[ProgressiveWorkout] Error updating progress:', error);
    return false;
  }

  return true;
}

/**
 * Complete the workout (finalizes with status='completed')
 */
export async function completeWorkout(
  workoutId: string,
  finalData: {
    sessionRpe?: number;
    durationMinutes?: number;
    exercisesCompleted: number;
    notes?: string;
  }
): Promise<boolean> {
  const client = getClient();

  const { error } = await client
    .from('workout_logs')
    .update({
      status: 'completed',
      completed: true,
      session_rpe: finalData.sessionRpe,
      session_duration_minutes: finalData.durationMinutes,
      exercises_completed: finalData.exercisesCompleted,
      notes: finalData.notes,
      last_saved_at: new Date().toISOString(),
    })
    .eq('id', workoutId);

  if (error) {
    console.error('[ProgressiveWorkout] Error completing workout:', error);
    return false;
  }

  console.log('[ProgressiveWorkout] Workout completed:', workoutId);
  return true;
}

/**
 * Abandon a workout (user explicitly quits)
 */
export async function abandonWorkout(workoutId: string): Promise<boolean> {
  const client = getClient();

  const { error } = await client
    .from('workout_logs')
    .update({
      status: 'abandoned',
      completed: false,
      last_saved_at: new Date().toISOString(),
    })
    .eq('id', workoutId);

  if (error) {
    console.error('[ProgressiveWorkout] Error abandoning workout:', error);
    return false;
  }

  console.log('[ProgressiveWorkout] Workout abandoned:', workoutId);
  return true;
}

/**
 * Get in-progress workout for a user (if any)
 */
export async function getInProgressWorkout(userId: string): Promise<WorkoutSession | null> {
  const client = getClient();

  const { data, error } = await client
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('workout_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as WorkoutSession;
}

/**
 * Get all sets for a workout
 */
export async function getWorkoutSets(workoutId: string): Promise<SetLog[]> {
  const client = getClient();

  const { data, error } = await client
    .from('set_logs')
    .select('*')
    .eq('workout_log_id', workoutId)
    .order('exercise_index', { ascending: true })
    .order('set_number', { ascending: true });

  if (error) {
    console.error('[ProgressiveWorkout] Error fetching sets:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has an in-progress workout (quick check)
 */
export async function hasInProgressWorkout(userId: string): Promise<boolean> {
  const client = getClient();

  const { count, error } = await client
    .from('workout_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'in_progress');

  if (error) {
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Get workout summary for resume UI
 */
export async function getWorkoutResumeSummary(workoutId: string): Promise<{
  dayName: string;
  startedAt: string;
  exerciseIndex: number;
  setNumber: number;
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
} | null> {
  const client = getClient();

  const { data: workout, error: workoutError } = await client
    .from('workout_logs')
    .select('day_name, workout_date, current_exercise_index, current_set, exercises_completed, total_exercises')
    .eq('id', workoutId)
    .single();

  if (workoutError || !workout) {
    return null;
  }

  const { count: setsCount } = await client
    .from('set_logs')
    .select('id', { count: 'exact', head: true })
    .eq('workout_log_id', workoutId);

  return {
    dayName: workout.day_name,
    startedAt: workout.workout_date,
    exerciseIndex: workout.current_exercise_index,
    setNumber: workout.current_set,
    exercisesCompleted: workout.exercises_completed,
    totalExercises: workout.total_exercises,
    setsCompleted: setsCount || 0,
  };
}

// ================================================================
// EXPORT
// ================================================================

export const progressiveWorkoutService = {
  init: initProgressiveWorkoutService,
  startWorkout,
  saveSet,
  updateProgress,
  completeWorkout,
  abandonWorkout,
  getInProgressWorkout,
  getWorkoutSets,
  hasInProgressWorkout,
  getWorkoutResumeSummary,
};

export default progressiveWorkoutService;
