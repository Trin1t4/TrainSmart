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
import {
  calculateNextWeightWithVideo,
  type VideoLoadRecommendation,
  type VideoProgressionResult
} from '../utils/progressiveOverload';

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
// VIDEO ANALYSIS INTEGRATION
// ================================================================

/**
 * Video correction record from database
 */
export interface VideoCorrection {
  id: string;
  exercise_name: string;
  load_recommendation: VideoLoadRecommendation;
  feedback_score: number;
  processed_at: string;
  metadata?: {
    stickingPoint?: string;
    morphotype?: string;
  };
}

/**
 * Suggested weight for next session
 */
export interface SuggestedWeight {
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  percentChange: number;
  reason: string;
  source: 'video_analysis' | 'auto_progression' | 'manual';
  videoData?: {
    correctionId: string;
    score: number;
    recommendation: VideoLoadRecommendation;
    analyzedAt: string;
  };
}

/**
 * Get the latest video analysis for an exercise (within last 7 days)
 */
export async function getLatestVideoAnalysis(
  userId: string,
  exerciseName: string,
  daysBack: number = 7
): Promise<VideoCorrection | null> {
  const client = getClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await client
    .from('video_corrections')
    .select('id, exercise_name, load_recommendation, feedback_score, processed_at, metadata')
    .eq('user_id', userId)
    .ilike('exercise_name', `%${exerciseName}%`)
    .eq('processing_status', 'completed')
    .gte('processed_at', cutoffDate.toISOString())
    .order('processed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as VideoCorrection;
}

/**
 * Get the last completed weight for an exercise
 */
export async function getLastCompletedWeight(
  userId: string,
  exerciseName: string
): Promise<{ weight: number; reps: number; date: string } | null> {
  const client = getClient();

  // Try set_logs first (more granular)
  const { data: setData } = await client
    .from('set_logs')
    .select(`
      weight_used,
      reps_completed,
      completed_at,
      workout_log_id,
      workout_logs!inner(user_id, status)
    `)
    .eq('workout_logs.user_id', userId)
    .eq('workout_logs.status', 'completed')
    .ilike('exercise_name', `%${exerciseName}%`)
    .not('weight_used', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (setData && setData.weight_used) {
    return {
      weight: setData.weight_used,
      reps: setData.reps_completed,
      date: setData.completed_at
    };
  }

  // Fallback to exercise_logs
  const { data: logData } = await client
    .from('exercise_logs')
    .select(`
      weight_used,
      reps_completed,
      created_at,
      workout_log_id,
      workout_logs!inner(user_id, status)
    `)
    .eq('workout_logs.user_id', userId)
    .eq('workout_logs.status', 'completed')
    .ilike('exercise_name', `%${exerciseName}%`)
    .not('weight_used', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (logData && logData.weight_used) {
    return {
      weight: logData.weight_used,
      reps: logData.reps_completed || 10,
      date: logData.created_at
    };
  }

  return null;
}

/**
 * Get user's training level from profile
 */
export async function getUserTrainingLevel(userId: string): Promise<string> {
  const client = getClient();

  const { data } = await client
    .from('profiles')
    .select('experience_level')
    .eq('user_id', userId)
    .single();

  // Map profile values to progression levels
  const levelMap: Record<string, string> = {
    'principiante': 'beginner',
    'beginner': 'beginner',
    'intermedio': 'intermediate',
    'intermediate': 'intermediate',
    'avanzato': 'advanced',
    'advanced': 'advanced'
  };

  return levelMap[data?.experience_level?.toLowerCase()] || 'intermediate';
}

/**
 * Calculate suggested weight for next session integrating video analysis
 *
 * This is the MAIN function that connects video analysis with load progression
 */
export async function getSuggestedWeightForExercise(
  userId: string,
  exerciseName: string,
  pattern?: string,
  weekNumber: number = 1
): Promise<SuggestedWeight | null> {
  // 1. Get last completed weight
  const lastWeight = await getLastCompletedWeight(userId, exerciseName);

  if (!lastWeight) {
    console.log(`[VideoProgression] No previous weight found for ${exerciseName}`);
    return null;
  }

  // 2. Get user's training level
  const level = await getUserTrainingLevel(userId);

  // 3. Check for recent video analysis
  const videoAnalysis = await getLatestVideoAnalysis(userId, exerciseName);

  // 4. Calculate progression with video integration
  const result: VideoProgressionResult = calculateNextWeightWithVideo(
    lastWeight.weight,
    lastWeight.reps,
    lastWeight.reps,
    level,
    weekNumber,
    exerciseName,
    pattern,
    videoAnalysis?.load_recommendation,
    videoAnalysis?.feedback_score
  );

  // 5. Build response
  const suggested: SuggestedWeight = {
    exerciseName,
    currentWeight: lastWeight.weight,
    suggestedWeight: result.newWeight,
    percentChange: result.percentChange,
    reason: result.reason,
    source: result.videoApplied ? 'video_analysis' : 'auto_progression'
  };

  if (videoAnalysis && result.videoApplied) {
    suggested.videoData = {
      correctionId: videoAnalysis.id,
      score: videoAnalysis.feedback_score,
      recommendation: videoAnalysis.load_recommendation,
      analyzedAt: videoAnalysis.processed_at
    };
  }

  console.log(`[VideoProgression] ${exerciseName}: ${lastWeight.weight}kg → ${result.newWeight}kg (${result.reason})`);

  return suggested;
}

/**
 * Get suggested weights for all exercises in a workout
 */
export async function getSuggestedWeightsForWorkout(
  userId: string,
  exercises: Array<{ name: string; pattern?: string }>,
  weekNumber: number = 1
): Promise<SuggestedWeight[]> {
  const suggestions: SuggestedWeight[] = [];

  for (const exercise of exercises) {
    const suggestion = await getSuggestedWeightForExercise(
      userId,
      exercise.name,
      exercise.pattern,
      weekNumber
    );

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

/**
 * Apply video recommendation to a specific exercise and save
 */
export async function applyVideoRecommendationToExercise(
  userId: string,
  exerciseName: string,
  videoCorrectionId: string
): Promise<SuggestedWeight | null> {
  const client = getClient();

  // Get video analysis
  const { data: videoData } = await client
    .from('video_corrections')
    .select('load_recommendation, feedback_score')
    .eq('id', videoCorrectionId)
    .single();

  if (!videoData) {
    return null;
  }

  // Calculate new weight
  const suggestion = await getSuggestedWeightForExercise(userId, exerciseName);

  if (suggestion) {
    // Log the application
    console.log(`[VideoProgression] Applied ${videoData.load_recommendation} to ${exerciseName}`);
  }

  return suggestion;
}

// ================================================================
// CORRECTIVE EXERCISES - Extract & Add to Program
// ================================================================

export interface VideoCorrectiveExercise {
  name: string;
  type: 'mobility' | 'accessory' | 'activation';
  sets?: number;
  reps?: string;
  notes?: string;
  sourceIssue?: string;
}

export interface VideoCorrectiveData {
  exerciseName: string;
  issues: Array<{ name: string; severity: string; description: string }>;
  correctiveExercises: VideoCorrectiveExercise[];
  mobilityDrills: string[];
  immediateCorrections: string[];
  analyzedAt: string;
}

/**
 * Extract corrective exercises from video analysis
 * Uses the issue codes to determine appropriate corrective work
 */
export async function getVideoCorrectiveExercisesFromVideo(
  userId: string,
  exerciseName: string,
  daysBack: number = 30
): Promise<VideoCorrectiveData | null> {
  if (!supabaseClient) {
    console.error('Progressive workout service not initialized');
    return null;
  }

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  const { data, error } = await supabaseClient
    .from('video_corrections')
    .select('*')
    .eq('user_id', userId)
    .ilike('exercise_name', `%${exerciseName}%`)
    .eq('processing_status', 'completed')
    .gte('created_at', dateThreshold.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Extract corrective exercises based on issues detected
  const correctiveExercises: VideoCorrectiveExercise[] = [];
  const mobilityDrills: string[] = [];
  const immediateCorrections: string[] = data.feedback_corrections || [];
  const issues = data.feedback_issues || [];

  // Map issues to corrective exercises
  for (const issue of issues) {
    const correctives = mapIssueToCorrectives(issue.name);
    correctiveExercises.push(...correctives.exercises);
    mobilityDrills.push(...correctives.mobility);
  }

  // Remove duplicates
  const uniqueExercises = correctiveExercises.filter((ex, idx, arr) =>
    arr.findIndex(e => e.name === ex.name) === idx
  );
  const uniqueMobility = Array.from(new Set(mobilityDrills));

  return {
    exerciseName: data.exercise_name,
    issues,
    correctiveExercises: uniqueExercises,
    mobilityDrills: uniqueMobility,
    immediateCorrections,
    analyzedAt: data.created_at
  };
}

/**
 * Map an issue code to corrective exercises and mobility drills
 */
function mapIssueToCorrectives(issueCode: string): {
  exercises: VideoCorrectiveExercise[];
  mobility: string[];
} {
  const exercises: VideoCorrectiveExercise[] = [];
  const mobility: string[] = [];

  switch (issueCode.toUpperCase()) {
    case 'KNEE_VALGUS':
      exercises.push(
        { name: 'Clamshell', type: 'activation', sets: 2, reps: '15 per lato', sourceIssue: 'KNEE_VALGUS' },
        { name: 'Lateral Band Walk', type: 'activation', sets: 2, reps: '20 passi', sourceIssue: 'KNEE_VALGUS' }
      );
      mobility.push('Hip internal rotation stretch');
      break;

    case 'SPINE_FLEXION':
    case 'BUTT_WINK':
      exercises.push(
        { name: 'Goblet Squat Hold', type: 'mobility', sets: 3, reps: '30s', sourceIssue: issueCode },
        { name: 'Cat-Cow', type: 'mobility', sets: 2, reps: '10', sourceIssue: issueCode }
      );
      mobility.push('90/90 Hip Stretch', 'Pigeon Stretch');
      break;

    case 'HEEL_RISE':
      exercises.push(
        { name: 'Wall Ankle Stretch', type: 'mobility', sets: 2, reps: '45s per lato', sourceIssue: 'HEEL_RISE' }
      );
      mobility.push('Ankle Dorsiflexion Stretch', 'Calf Foam Rolling');
      break;

    case 'HIPS_RISE_FIRST':
    case 'FORWARD_LEAN':
      exercises.push(
        { name: 'Front Squat', type: 'accessory', sets: 3, reps: '8', notes: 'Forza posizione verticale', sourceIssue: issueCode },
        { name: 'Tempo Squat 3-1-1', type: 'accessory', sets: 3, reps: '6', sourceIssue: issueCode }
      );
      break;

    case 'DEPTH_ASYMMETRY':
    case 'WEIGHT_SHIFT':
      exercises.push(
        { name: 'Bulgarian Split Squat', type: 'accessory', sets: 3, reps: '8 per lato', sourceIssue: issueCode },
        { name: 'Single Leg Press', type: 'accessory', sets: 3, reps: '10 per lato', sourceIssue: issueCode }
      );
      mobility.push('Pigeon Stretch lato debole');
      break;

    case 'TORSO_ROTATION':
      exercises.push(
        { name: 'Pallof Press', type: 'accessory', sets: 3, reps: '12 per lato', sourceIssue: 'TORSO_ROTATION' },
        { name: 'Dead Bug', type: 'activation', sets: 3, reps: '10', sourceIssue: 'TORSO_ROTATION' }
      );
      mobility.push('Thoracic Rotation on Foam Roller');
      break;

    case 'KNEE_CAVE_ECCENTRIC':
    case 'KNEE_ANGLE_ASYMMETRY':
      exercises.push(
        { name: 'Single Leg Extension', type: 'accessory', sets: 2, reps: '12 per lato', sourceIssue: issueCode },
        { name: 'Step-Up', type: 'accessory', sets: 3, reps: '10 per lato', sourceIssue: issueCode }
      );
      break;

    default:
      // Generic correctives for unknown issues
      exercises.push(
        { name: 'Pause Squat', type: 'accessory', sets: 3, reps: '5', notes: '3s pausa nel bottom', sourceIssue: issueCode }
      );
  }

  return { exercises, mobility };
}

/**
 * Add corrective exercises to a user's program
 */
export async function addVideoCorrectiveExercisesToProgram(
  userId: string,
  programId: string,
  correctiveExercises: VideoCorrectiveExercise[],
  addAs: 'warmup' | 'accessory' | 'cooldown' = 'warmup'
): Promise<{ success: boolean; message: string }> {
  if (!supabaseClient) {
    return { success: false, message: 'Service not initialized' };
  }

  try {
    // Get current program
    const { data: program, error: fetchError } = await supabaseClient
      .from('user_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !program) {
      return { success: false, message: 'Program not found' };
    }

    const programData = program.program_data || {};
    const weeks = programData.weeks || [];

    if (weeks.length === 0) {
      return { success: false, message: 'Program has no weeks' };
    }

    // Convert corrective exercises to program format
    const exercisesToAdd = correctiveExercises.map(ex => ({
      name: ex.name,
      pattern: 'corrective',
      sets: ex.sets || 2,
      reps: ex.reps || '10-12',
      rest: '30s',
      intensity: 'Low',
      notes: ex.notes || `Correttivo per ${ex.sourceIssue}`,
      isVideoCorrectiveExercise: true,
      addedFrom: 'video_analysis'
    }));

    // Add to all workout days based on addAs type
    let addedCount = 0;
    for (const week of weeks) {
      for (const day of week.days || []) {
        if (day.isRestDay) continue;

        if (addAs === 'warmup') {
          // Add at the beginning
          day.exercises = [...exercisesToAdd, ...(day.exercises || [])];
          addedCount++;
        } else if (addAs === 'cooldown') {
          // Add at the end
          day.exercises = [...(day.exercises || []), ...exercisesToAdd];
          addedCount++;
        } else {
          // Add after main exercises, before cooldown/stretching
          const exercises = day.exercises || [];
          const insertIndex = exercises.findIndex((ex: any) =>
            ex.pattern === 'stretching' || ex.pattern === 'cooldown'
          );
          if (insertIndex >= 0) {
            day.exercises = [
              ...exercises.slice(0, insertIndex),
              ...exercisesToAdd,
              ...exercises.slice(insertIndex)
            ];
          } else {
            day.exercises = [...exercises, ...exercisesToAdd];
          }
          addedCount++;
        }
      }
    }

    // Save updated program
    const { error: updateError } = await supabaseClient
      .from('user_programs')
      .update({
        program_data: { ...programData, weeks },
        updated_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      return { success: false, message: `Failed to update program: ${updateError.message}` };
    }

    return {
      success: true,
      message: `Added ${exercisesToAdd.length} corrective exercises to ${addedCount} workout days`
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Get all video-based recommendations for a user's exercises
 * Useful for showing a summary of what needs attention
 */
export async function getAllVideoRecommendations(
  userId: string,
  daysBack: number = 30
): Promise<VideoCorrectiveData[]> {
  if (!supabaseClient) {
    return [];
  }

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  const { data, error } = await supabaseClient
    .from('video_corrections')
    .select('*')
    .eq('user_id', userId)
    .eq('processing_status', 'completed')
    .gte('created_at', dateThreshold.toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  // Group by exercise and get the most recent for each
  const byExercise = new Map<string, any>();
  for (const item of data) {
    const key = item.exercise_name.toLowerCase();
    if (!byExercise.has(key)) {
      byExercise.set(key, item);
    }
  }

  // Convert to VideoCorrectiveData format
  const results: VideoCorrectiveData[] = [];
  const exerciseEntries = Array.from(byExercise.entries());
  for (const [, item] of exerciseEntries) {
    const issues = item.feedback_issues || [];
    const correctiveExercises: VideoCorrectiveExercise[] = [];
    const mobilityDrills: string[] = [];

    for (const issue of issues) {
      const correctives = mapIssueToCorrectives(issue.name);
      correctiveExercises.push(...correctives.exercises);
      mobilityDrills.push(...correctives.mobility);
    }

    results.push({
      exerciseName: item.exercise_name,
      issues,
      correctiveExercises: correctiveExercises.filter((ex, idx, arr) =>
        arr.findIndex(e => e.name === ex.name) === idx
      ),
      mobilityDrills: Array.from(new Set(mobilityDrills)),
      immediateCorrections: item.feedback_corrections || [],
      analyzedAt: item.created_at
    });
  }

  return results;
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
  // Video Analysis Integration
  getLatestVideoAnalysis,
  getLastCompletedWeight,
  getUserTrainingLevel,
  getSuggestedWeightForExercise,
  getSuggestedWeightsForWorkout,
  applyVideoRecommendationToExercise,
  // Corrective Exercises
  getVideoCorrectiveExercisesFromVideo,
  addVideoCorrectiveExercisesToProgram,
  getAllVideoRecommendations,
};

export default progressiveWorkoutService;
