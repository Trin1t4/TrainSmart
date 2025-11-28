/**
 * RPE AUTO-REGULATION SERVICE
 *
 * Analizza RPE (Rate of Perceived Exertion) degli ultimi workouts
 * e applica adjustments automatici al programma per ottimizzare
 * il carico allenante e prevenire sovrallenamento/sottovallenamento.
 *
 * LOGICA:
 * - RPE medio > 8.5 per 2+ sessioni → Riduce volume (-10%)
 * - RPE medio < 6.0 per 2+ sessioni → Aumenta volume (+10%)
 * - RPE > 9.0 per 3+ sessioni → Deload week automatico
 *
 * TARGET RPE IDEALE: 7-8 (allenamento efficace ma sostenibile)
 */

import { supabase } from './supabaseClient';

// ================================================================
// TYPES
// ================================================================

export interface WorkoutLog {
  id: string;
  user_id: string;
  program_id: string;
  workout_date: string;
  day_name: string;
  split_type: string;
  session_rpe: number;
  session_duration_minutes?: number;
  completed: boolean;
  exercises_completed: number;
  total_exercises: number;
  notes?: string;
  mood?: string;
  sleep_quality?: number;
  // NEW: Contextual factors
  stress_level?: number;
  nutrition_quality?: 'good' | 'normal' | 'poor';
  hydration?: 'good' | 'normal' | 'poor';
  context_adjustment?: number;
}

// Input type for logWorkout function
export interface WorkoutLogInput {
  day_name: string;
  split_type: string;
  session_duration_minutes: number;
  session_rpe: number;
  exercises: Array<{
    exercise_name: string;
    pattern: string;
    sets_completed: number;
    reps_completed: number;
    weight_used?: number;
    exercise_rpe: number;
    difficulty_vs_baseline?: 'easier' | 'as_expected' | 'harder';
    notes?: string;
  }>;
  mood?: string;
  sleep_quality?: number;
  notes?: string;
  // NEW: Contextual factors
  stress_level?: number;
  nutrition_quality?: 'good' | 'normal' | 'poor';
  hydration?: 'good' | 'normal' | 'poor';
  context_adjustment?: number;
}

export interface ExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  pattern: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  exercise_rpe: number; // 1-10
  difficulty_vs_baseline?: 'easier' | 'as_expected' | 'harder';
  sets_to_failure?: number;
  reps_in_reserve?: number;
  notes?: string;
  technique_quality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RPEAnalysis {
  avg_session_rpe: number;
  avg_exercise_rpe: number;
  sessions_analyzed: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  needs_adjustment: boolean;
  adjustment_type?: 'decrease_volume' | 'increase_volume' | 'deload_week' | 'none';
  recommended_change_percent?: number;
}

export interface ExerciseAdjustment {
  exercise_name: string;
  pattern: string;
  avg_rpe: number;
  occurrences: number;
  old_sets: number;
  new_sets: number;
  old_reps: string;
  new_reps: string;
  reason: string;
}

export interface ProgramAdjustment {
  id?: string;
  user_id: string;
  program_id: string;
  trigger_type: 'high_rpe' | 'low_rpe' | 'deload_needed' | 'manual';
  avg_rpe_before: number;
  sessions_analyzed: number;
  adjustment_type: 'decrease_volume' | 'increase_volume' | 'deload_week';
  volume_change_percent: number;
  exercises_affected: ExerciseAdjustment[];
  applied: boolean;
  user_accepted?: boolean;
}

// ================================================================
// WORKOUT LOGGING
// ================================================================

/**
 * Log completo di un workout (crea log + esercizi + completa)
 * Usato da LiveWorkoutSession
 */
export async function logWorkout(
  userId: string,
  programId: string,
  input: WorkoutLogInput
): Promise<{ data: WorkoutLog | null; error: any }> {
  try {
    console.log('[AutoRegulation] Logging workout:', input.day_name);

    // 1. Create workout log
    const { data: workoutLog, error: createError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        program_id: programId,
        day_name: input.day_name,
        split_type: input.split_type,
        session_rpe: input.session_rpe,
        session_duration_minutes: input.session_duration_minutes,
        completed: true,
        exercises_completed: input.exercises.length,
        total_exercises: input.exercises.length,
        mood: input.mood,
        sleep_quality: input.sleep_quality,
        notes: input.notes,
        // NEW: Contextual factors
        stress_level: input.stress_level,
        nutrition_quality: input.nutrition_quality,
        hydration: input.hydration,
        context_adjustment: input.context_adjustment
      })
      .select()
      .single();

    if (createError || !workoutLog) {
      throw createError || new Error('Failed to create workout log');
    }

    // 2. Add exercise logs
    const exerciseInserts = input.exercises.map(ex => ({
      workout_log_id: workoutLog.id,
      exercise_name: ex.exercise_name,
      pattern: ex.pattern,
      sets_completed: ex.sets_completed,
      reps_completed: ex.reps_completed,
      weight_used: ex.weight_used,
      exercise_rpe: ex.exercise_rpe,
      difficulty_vs_baseline: ex.difficulty_vs_baseline,
      notes: ex.notes
    }));

    const { error: exerciseError } = await supabase
      .from('exercise_logs')
      .insert(exerciseInserts);

    if (exerciseError) {
      console.error('[AutoRegulation] Error inserting exercise logs:', exerciseError);
      // Continue anyway - workout log is saved
    }

    console.log('[AutoRegulation] Workout logged successfully:', workoutLog.id);

    return { data: workoutLog, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Error logging workout:', error);
    return { data: null, error };
  }
}

/**
 * Crea nuovo workout log
 */
export async function createWorkoutLog(
  userId: string,
  programId: string,
  dayName: string,
  splitType: string
): Promise<{ data: WorkoutLog | null; error: any }> {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      program_id: programId,
      day_name: dayName,
      split_type: splitType,
      completed: false,
      exercises_completed: 0
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Aggiungi exercise log al workout
 */
export async function addExerciseLog(
  workoutLogId: string,
  exercise: {
    exercise_name: string;
    pattern: string;
    sets_completed: number;
    reps_completed: number;
    weight_used?: number;
    exercise_rpe: number;
    difficulty_vs_baseline?: 'easier' | 'as_expected' | 'harder';
    sets_to_failure?: number;
    reps_in_reserve?: number;
    notes?: string;
    technique_quality?: 'excellent' | 'good' | 'fair' | 'poor';
  }
): Promise<{ data: ExerciseLog | null; error: any }> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({
      workout_log_id: workoutLogId,
      ...exercise
    })
    .select()
    .single();

  // Trigger automatico aggiornerà session_rpe in workout_logs

  return { data, error };
}

/**
 * Completa workout (segna come completato)
 */
export async function completeWorkout(
  workoutLogId: string,
  totalExercises: number,
  notes?: string,
  mood?: string,
  sleepQuality?: number
): Promise<{ data: WorkoutLog | null; error: any }> {
  const { data, error } = await supabase
    .from('workout_logs')
    .update({
      completed: true,
      total_exercises: totalExercises,
      notes,
      mood,
      sleep_quality,
      updated_at: new Date().toISOString()
    })
    .eq('id', workoutLogId)
    .select()
    .single();

  return { data, error };
}

// ================================================================
// RPE ANALYSIS
// ================================================================

/**
 * Analizza RPE delle ultime N sessioni
 */
export async function analyzeRPE(
  userId: string,
  programId: string,
  sessionsCount: number = 2
): Promise<{ data: RPEAnalysis | null; error: any }> {
  try {
    // Call Supabase function per analisi RPE
    const { data, error } = await supabase.rpc('get_avg_rpe_last_sessions', {
      p_user_id: userId,
      p_program_id: programId,
      p_sessions_count: sessionsCount
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        data: {
          avg_session_rpe: 0,
          avg_exercise_rpe: 0,
          sessions_analyzed: 0,
          trend: 'insufficient_data',
          needs_adjustment: false,
          adjustment_type: 'none'
        },
        error: null
      };
    }

    const result = data[0];

    // Determina se serve adjustment
    let needs_adjustment = false;
    let adjustment_type: RPEAnalysis['adjustment_type'] = 'none';
    let recommended_change_percent = 0;

    if (result.sessions_analyzed >= sessionsCount) {
      // HIGH RPE: Sovrallenamento
      if (result.avg_session_rpe > 8.5) {
        needs_adjustment = true;
        adjustment_type = result.avg_session_rpe > 9.0 ? 'deload_week' : 'decrease_volume';
        recommended_change_percent = -10; // Riduce 10%
      }
      // LOW RPE: Sottovallenamento
      else if (result.avg_session_rpe < 6.0) {
        needs_adjustment = true;
        adjustment_type = 'increase_volume';
        recommended_change_percent = 10; // Aumenta 10%
      }
    }

    return {
      data: {
        avg_session_rpe: result.avg_session_rpe,
        avg_exercise_rpe: result.avg_exercise_rpe,
        sessions_analyzed: result.sessions_analyzed,
        trend: result.trend,
        needs_adjustment,
        adjustment_type,
        recommended_change_percent
      },
      error: null
    };
  } catch (error) {
    console.error('[AutoRegulation] Errore analisi RPE:', error);
    return { data: null, error };
  }
}

/**
 * Identifica esercizi che necessitano adjustment
 */
export async function getExercisesNeedingAdjustment(
  userId: string,
  programId: string,
  sessionsCount: number = 2
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_exercises_needing_adjustment', {
      p_user_id: userId,
      p_program_id: programId,
      p_sessions_count: sessionsCount
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore identificazione esercizi:', error);
    return { data: null, error };
  }
}

// ================================================================
// AUTO-REGULATION (Automatic Adjustments)
// ================================================================

/**
 * Applica auto-regulation al programma
 * Modifica automaticamente volume basato su RPE
 */
export async function applyAutoRegulation(
  userId: string,
  programId: string
): Promise<{ data: ProgramAdjustment | null; error: any }> {
  try {
    console.log('[AutoRegulation] Inizio analisi per user:', userId, 'program:', programId);

    // 1. Analizza RPE
    const { data: analysis, error: analysisError } = await analyzeRPE(userId, programId, 2);
    if (analysisError || !analysis) {
      throw new Error('Impossibile analizzare RPE');
    }

    console.log('[AutoRegulation] Analisi RPE:', analysis);

    // 2. Se non serve adjustment, esci
    if (!analysis.needs_adjustment) {
      console.log('[AutoRegulation] ✅ RPE nel range ottimale, nessun adjustment necessario');
      return { data: null, error: null };
    }

    // 3. Identifica esercizi da modificare
    const { data: exercises, error: exercisesError } = await getExercisesNeedingAdjustment(userId, programId, 2);
    if (exercisesError) {
      throw new Error('Impossibile identificare esercizi');
    }

    console.log('[AutoRegulation] Esercizi da modificare:', exercises);

    // 4. Carica programma corrente
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError || !program) {
      throw new Error('Impossibile caricare programma');
    }

    // 5. Calcola adjustments per ogni esercizio
    const exercisesAffected: ExerciseAdjustment[] = [];

    if (exercises && exercises.length > 0) {
      for (const ex of exercises) {
        // Trova esercizio nel programma
        const programExercise = program.exercises?.find(
          (pe: any) => pe.name === ex.exercise_name
        );

        if (!programExercise) continue;

        const oldSets = programExercise.sets;
        const oldReps = programExercise.reps;

        // Calcola nuovo volume
        let newSets = oldSets;
        let newReps = oldReps;

        if (analysis.adjustment_type === 'decrease_volume') {
          // Riduce sets del 10% (arrotondato)
          newSets = Math.max(2, Math.round(oldSets * 0.9));
        } else if (analysis.adjustment_type === 'increase_volume') {
          // Aumenta sets del 10%
          newSets = Math.round(oldSets * 1.1);
        } else if (analysis.adjustment_type === 'deload_week') {
          // Deload: -30% volume, reps basse
          newSets = Math.max(2, Math.round(oldSets * 0.7));
          newReps = typeof oldReps === 'string' ? oldReps : Math.max(3, Math.round(oldReps * 0.7));
        }

        exercisesAffected.push({
          exercise_name: ex.exercise_name,
          pattern: ex.pattern,
          avg_rpe: ex.avg_rpe,
          occurrences: ex.occurrences,
          old_sets: oldSets,
          new_sets: newSets,
          old_reps: oldReps.toString(),
          new_reps: newReps.toString(),
          reason: analysis.adjustment_type === 'decrease_volume'
            ? `RPE troppo alto (${ex.avg_rpe}/10) - Riduzione volume`
            : analysis.adjustment_type === 'increase_volume'
            ? `RPE troppo basso (${ex.avg_rpe}/10) - Aumento volume`
            : `RPE critico (${ex.avg_rpe}/10) - Deload necessario`
        });
      }
    }

    // 6. Se nessun esercizio specifico, applica adjustment generale
    if (exercisesAffected.length === 0 && analysis.needs_adjustment) {
      // Applica adjustment a TUTTI gli esercizi principali (non core/corrective)
      const mainExercises = program.exercises?.filter(
        (ex: any) => ex.pattern !== 'core' && ex.pattern !== 'corrective'
      ) || [];

      for (const ex of mainExercises) {
        const oldSets = ex.sets;
        let newSets = oldSets;

        if (analysis.adjustment_type === 'decrease_volume') {
          newSets = Math.max(2, Math.round(oldSets * 0.9));
        } else if (analysis.adjustment_type === 'increase_volume') {
          newSets = Math.round(oldSets * 1.1);
        } else if (analysis.adjustment_type === 'deload_week') {
          newSets = Math.max(2, Math.round(oldSets * 0.7));
        }

        exercisesAffected.push({
          exercise_name: ex.name,
          pattern: ex.pattern,
          avg_rpe: analysis.avg_session_rpe,
          occurrences: analysis.sessions_analyzed,
          old_sets: oldSets,
          new_sets: newSets,
          old_reps: ex.reps.toString(),
          new_reps: ex.reps.toString(),
          reason: `Adjustment generale programma - RPE medio ${analysis.avg_session_rpe}/10`
        });
      }
    }

    // 7. Crea record adjustment
    const adjustment: ProgramAdjustment = {
      user_id: userId,
      program_id: programId,
      trigger_type: analysis.adjustment_type === 'deload_week'
        ? 'deload_needed'
        : analysis.avg_session_rpe > 8.5
        ? 'high_rpe'
        : 'low_rpe',
      avg_rpe_before: analysis.avg_session_rpe,
      sessions_analyzed: analysis.sessions_analyzed,
      adjustment_type: analysis.adjustment_type!,
      volume_change_percent: analysis.recommended_change_percent || 0,
      exercises_affected: exercisesAffected,
      applied: false // Non ancora applicato
    };

    // 8. Salva adjustment nel database
    const { data: savedAdjustment, error: saveError } = await supabase
      .from('program_adjustments')
      .insert(adjustment)
      .select()
      .single();

    if (saveError) {
      console.error('[AutoRegulation] Errore salvataggio adjustment:', saveError);
      throw saveError;
    }

    console.log('[AutoRegulation] ✅ Adjustment creato (NON applicato automaticamente):', savedAdjustment);

    // 9. NON APPLICA AUTOMATICAMENTE - restituisce l'adjustment per mostrarlo all'utente
    // L'utente deciderà se accettare, rifiutare o modificare tramite DeloadSuggestionModal
    // await applyAdjustmentToProgram(savedAdjustment.id, programId, exercisesAffected);

    return { data: savedAdjustment, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore apply auto-regulation:', error);
    return { data: null, error };
  }
}

/**
 * Applica adjustment al programma (modifica effettivamente il programma)
 */
export async function applyAdjustmentToProgram(
  adjustmentId: string,
  programId: string,
  exercisesAffected: ExerciseAdjustment[]
): Promise<{ success: boolean; error: any }> {
  try {
    console.log('[AutoRegulation] Applicazione adjustment:', adjustmentId);

    // 1. Carica programma corrente
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError || !program) {
      throw new Error('Impossibile caricare programma');
    }

    // 2. Modifica exercises array
    const updatedExercises = program.exercises.map((ex: any) => {
      const adjustment = exercisesAffected.find(adj => adj.exercise_name === ex.name);

      if (adjustment) {
        console.log(`[AutoRegulation] Modifica ${ex.name}: ${adjustment.old_sets} → ${adjustment.new_sets} sets`);
        return {
          ...ex,
          sets: adjustment.new_sets,
          reps: adjustment.new_reps,
          notes: `${ex.notes || ''} | Auto-adjusted: ${adjustment.reason}`.trim()
        };
      }

      return ex;
    });

    // 3. Aggiorna programma
    const { error: updateError } = await supabase
      .from('training_programs')
      .update({
        exercises: updatedExercises,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      throw updateError;
    }

    // 4. Marca adjustment come applicato
    const { error: markError } = await supabase
      .from('program_adjustments')
      .update({
        applied: true,
        applied_at: new Date().toISOString(),
        user_accepted: true // Automatico = accettato
      })
      .eq('id', adjustmentId);

    if (markError) {
      throw markError;
    }

    console.log('[AutoRegulation] ✅ Adjustment applicato con successo');

    return { success: true, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore applicazione adjustment:', error);
    return { success: false, error };
  }
}

/**
 * Recupera adjustment pendenti (non applicati) per mostrare all'utente
 */
export async function getPendingAdjustments(
  userId: string,
  programId: string
): Promise<{ data: ProgramAdjustment[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('program_adjustments')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('applied', false)
      .order('trigger_date', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore get pending adjustments:', error);
    return { data: null, error };
  }
}

/**
 * Rifiuta un adjustment (marca come non applicato e rifiutato)
 */
export async function rejectAdjustment(
  adjustmentId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('program_adjustments')
      .update({
        applied: false,
        user_accepted: false,
        rejected_at: new Date().toISOString()
      })
      .eq('id', adjustmentId);

    if (error) throw error;

    console.log('[AutoRegulation] Adjustment rifiutato:', adjustmentId);
    return { success: true, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore reject adjustment:', error);
    return { success: false, error };
  }
}

/**
 * Posticipa un adjustment (imposta una data futura per rimostrarlo)
 */
export async function postponeAdjustment(
  adjustmentId: string,
  daysToPostpone: number = 7
): Promise<{ success: boolean; error: any }> {
  try {
    const postponeUntil = new Date();
    postponeUntil.setDate(postponeUntil.getDate() + daysToPostpone);

    const { error } = await supabase
      .from('program_adjustments')
      .update({
        postponed_until: postponeUntil.toISOString()
      })
      .eq('id', adjustmentId);

    if (error) throw error;

    console.log('[AutoRegulation] Adjustment posticipato fino a:', postponeUntil);
    return { success: true, error: null };
  } catch (error) {
    console.error('[AutoRegulation] Errore postpone adjustment:', error);
    return { success: false, error };
  }
}

/**
 * Accetta e applica un adjustment (con possibili modifiche dall'utente)
 */
export async function acceptAndApplyAdjustment(
  adjustment: ProgramAdjustment
): Promise<{ success: boolean; error: any }> {
  try {
    if (!adjustment.id) {
      throw new Error('Adjustment ID mancante');
    }

    // Applica l'adjustment al programma
    const result = await applyAdjustmentToProgram(
      adjustment.id,
      adjustment.program_id,
      adjustment.exercises_affected
    );

    return result;
  } catch (error) {
    console.error('[AutoRegulation] Errore accept and apply adjustment:', error);
    return { success: false, error };
  }
}

// ================================================================
// WORKOUT HISTORY
// ================================================================

/**
 * Carica ultimi N workouts dell'utente
 */
export async function getRecentWorkouts(
  userId: string,
  limit: number = 10
): Promise<{ data: WorkoutLog[] | null; error: any }> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('workout_date', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Carica exercise logs di un workout specifico
 */
export async function getWorkoutExercises(
  workoutLogId: string
): Promise<{ data: ExerciseLog[] | null; error: any }> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('workout_log_id', workoutLogId)
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Carica history adjustments
 */
export async function getAdjustmentHistory(
  userId: string,
  programId?: string
): Promise<{ data: ProgramAdjustment[] | null; error: any }> {
  let query = supabase
    .from('program_adjustments')
    .select('*')
    .eq('user_id', userId)
    .order('trigger_date', { ascending: false });

  if (programId) {
    query = query.eq('program_id', programId);
  }

  const { data, error } = await query;

  return { data, error };
}

// ================================================================
// EXPORT
// ================================================================

export default {
  // Workout logging
  logWorkout,
  createWorkoutLog,
  addExerciseLog,
  completeWorkout,

  // RPE analysis
  analyzeRPE,
  getExercisesNeedingAdjustment,

  // Auto-regulation
  applyAutoRegulation,
  applyAdjustmentToProgram,

  // Adjustment management (interactive UI)
  getPendingAdjustments,
  rejectAdjustment,
  postponeAdjustment,
  acceptAndApplyAdjustment,

  // History
  getRecentWorkouts,
  getWorkoutExercises,
  getAdjustmentHistory
};
