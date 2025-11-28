/**
 * Pain Management Hook
 * Gestisce la logica completa di pain tracking e progressive deload
 *
 * SCENARIO 1 (Durante workout):
 * Pain ≥5 → Load -20% → Reps -30% → Suspend → (2nd time) → Screening
 *
 * SCENARIO 2 (Pre-workout pain):
 * Gestito da PreWorkoutPainCheck component
 */

import { useState, useCallback } from 'react';

export type PainArea =
  | 'neck'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'scapula'
  | 'thoracic_spine'
  | 'lower_back'
  | 'hip'
  | 'knee'
  | 'ankle';

export interface ExercisePainHistory {
  exerciseName: string;
  attempts: PainAttempt[];
  suspensionCount: number;
  needsScreening: boolean;
  lastPainLevel: number;
  recoveryProtocolActive: boolean;
  referToPhysio: boolean; // Se recovery fallisce
}

export interface PainAttempt {
  timestamp: string;
  painLevel: number;
  action: 'load_reduction' | 'rep_reduction' | 'suspension' | 'screening_triggered' | 'physio_referral';
  loadReduction?: number; // Percentuale riduzione (es. -20%)
  repReduction?: number; // Percentuale riduzione (es. -30%)
  notes?: string;
}

interface PainManagementState {
  exerciseHistory: Map<string, ExercisePainHistory>;
  activeScreeningExercise: string | null;
  physioReferralNeeded: string[]; // Lista esercizi che necessitano referral
}

export function usePainManagement() {
  const [state, setState] = useState<PainManagementState>({
    exerciseHistory: new Map(),
    activeScreeningExercise: null,
    physioReferralNeeded: []
  });

  /**
   * STEP 1: Riporta dolore durante esercizio
   * Avvia progressive deload: Load → Reps → Suspend
   */
  const reportPain = useCallback(
    (exerciseName: string, painLevel: number): {
      action: 'continue' | 'reduce_load' | 'reduce_reps' | 'suspend' | 'screening';
      loadReduction?: number;
      repReduction?: number;
      message: string;
    } => {
      if (painLevel < 5) {
        return {
          action: 'continue',
          message: 'Dolore lieve. Continua con cautela.'
        };
      }

      setState((prev) => {
        const history = prev.exerciseHistory.get(exerciseName) || {
          exerciseName,
          attempts: [],
          suspensionCount: 0,
          needsScreening: false,
          lastPainLevel: painLevel,
          recoveryProtocolActive: false,
          referToPhysio: false
        };

        const newHistory = new Map(prev.exerciseHistory);

        // Conta quante azioni progressive abbiamo già fatto
        const loadReductions = history.attempts.filter(
          (a) => a.action === 'load_reduction'
        ).length;
        const repReductions = history.attempts.filter(
          (a) => a.action === 'rep_reduction'
        ).length;

        // PROGRESSIVE DELOAD LOGIC
        let action: PainAttempt['action'];
        let loadReduction: number | undefined;
        let repReduction: number | undefined;
        let message: string;

        if (loadReductions === 0) {
          // STEP 1: First time → Reduce Load -20%
          action = 'load_reduction';
          loadReduction = -20;
          message = '🔽 Riduciamo il carico del 20%. Riprova.';
        } else if (repReductions === 0) {
          // STEP 2: Still pain → Reduce Reps -30%
          action = 'rep_reduction';
          repReduction = -30;
          message = '🔽 Riduciamo le ripetizioni del 30%. Riprova.';
        } else {
          // STEP 3: Still pain → SUSPEND
          action = 'suspension';
          const newSuspensionCount = history.suspensionCount + 1;
          message =
            newSuspensionCount === 1
              ? '⏸️ SOSPESO per oggi. Se capita ancora, faremo screening.'
              : '🔍 2° sospensione! Attiviamo functional screening.';

          history.suspensionCount = newSuspensionCount;

          // 2nd suspension → Screening needed
          if (newSuspensionCount >= 2) {
            history.needsScreening = true;
            action = 'screening_triggered';
          }
        }

        history.attempts.push({
          timestamp: new Date().toISOString(),
          painLevel,
          action,
          loadReduction,
          repReduction,
          notes: message
        });

        history.lastPainLevel = painLevel;
        newHistory.set(exerciseName, history);

        return {
          ...prev,
          exerciseHistory: newHistory,
          activeScreeningExercise:
            action === 'screening_triggered' ? exerciseName : prev.activeScreeningExercise
        };
      });

      // Return action info per UI
      const history = state.exerciseHistory.get(exerciseName);
      const loadReductions = history?.attempts.filter((a) => a.action === 'load_reduction').length || 0;
      const repReductions = history?.attempts.filter((a) => a.action === 'rep_reduction').length || 0;

      if (loadReductions === 0) {
        return {
          action: 'reduce_load',
          loadReduction: -20,
          message: '🔽 Riduciamo il carico del 20%. Riprova.'
        };
      } else if (repReductions === 0) {
        return {
          action: 'reduce_reps',
          repReduction: -30,
          message: '🔽 Riduciamo le ripetizioni del 30%. Riprova.'
        };
      } else {
        const suspensionCount = (history?.suspensionCount || 0) + 1;
        if (suspensionCount >= 2) {
          return {
            action: 'screening',
            message: '🔍 2° sospensione! Attiviamo functional screening.'
          };
        } else {
          return {
            action: 'suspend',
            message: '⏸️ SOSPESO per oggi. Se capita ancora, faremo screening.'
          };
        }
      }
    },
    [state.exerciseHistory]
  );

  /**
   * Check if exercise needs screening
   */
  const needsScreening = useCallback(
    (exerciseName: string): boolean => {
      const history = state.exerciseHistory.get(exerciseName);
      return history?.needsScreening || false;
    },
    [state.exerciseHistory]
  );

  /**
   * Get pain area from exercise name (basic mapping)
   */
  const getPainAreaFromExercise = useCallback((exerciseName: string): PainArea => {
    const name = exerciseName.toLowerCase();

    // Mapping esercizi → body areas
    if (name.includes('neck') || name.includes('cervical')) return 'neck';
    if (name.includes('shoulder') || name.includes('overhead') || name.includes('press')) return 'shoulder';
    if (name.includes('elbow')) return 'elbow';
    if (name.includes('wrist')) return 'wrist';
    if (name.includes('scapula') || name.includes('row')) return 'scapula';
    if (name.includes('thoracic') || name.includes('upper back')) return 'thoracic_spine';
    if (name.includes('deadlift') || name.includes('lower back') || name.includes('lumbar')) return 'lower_back';
    if (name.includes('squat') || name.includes('hip')) return 'hip';
    if (name.includes('lunge') || name.includes('knee')) return 'knee';
    if (name.includes('calf') || name.includes('ankle')) return 'ankle';

    // Default fallback
    return 'lower_back';
  }, []);

  /**
   * Mark screening completed for exercise
   */
  const completeScreening = useCallback((exerciseName: string) => {
    setState((prev) => {
      const newHistory = new Map(prev.exerciseHistory);
      const history = newHistory.get(exerciseName);

      if (history) {
        history.needsScreening = false;
        history.recoveryProtocolActive = true;
        newHistory.set(exerciseName, history);
      }

      return {
        ...prev,
        exerciseHistory: newHistory,
        activeScreeningExercise: null
      };
    });
  }, []);

  /**
   * Recovery protocol fallito → Referral fisioterapista
   */
  const markForPhysioReferral = useCallback((exerciseName: string, reason: string) => {
    setState((prev) => {
      const newHistory = new Map(prev.exerciseHistory);
      const history = newHistory.get(exerciseName);

      if (history) {
        history.referToPhysio = true;
        history.attempts.push({
          timestamp: new Date().toISOString(),
          painLevel: history.lastPainLevel,
          action: 'physio_referral',
          notes: reason
        });
        newHistory.set(exerciseName, history);
      }

      return {
        ...prev,
        exerciseHistory: newHistory,
        physioReferralNeeded: [...prev.physioReferralNeeded, exerciseName]
      };
    });
  }, []);

  /**
   * Get exercise history
   */
  const getExerciseHistory = useCallback(
    (exerciseName: string): ExercisePainHistory | undefined => {
      return state.exerciseHistory.get(exerciseName);
    },
    [state.exerciseHistory]
  );

  /**
   * Get all exercises needing physio referral
   */
  const getPhysioReferralList = useCallback((): string[] => {
    return state.physioReferralNeeded;
  }, [state.physioReferralNeeded]);

  /**
   * Reset exercise history (new workout session)
   */
  const resetExercise = useCallback((exerciseName: string) => {
    setState((prev) => {
      const newHistory = new Map(prev.exerciseHistory);
      newHistory.delete(exerciseName);
      return {
        ...prev,
        exerciseHistory: newHistory
      };
    });
  }, []);

  /**
   * Clear all history (new program)
   */
  const clearAllHistory = useCallback(() => {
    setState({
      exerciseHistory: new Map(),
      activeScreeningExercise: null,
      physioReferralNeeded: []
    });
  }, []);

  return {
    // Actions
    reportPain,
    completeScreening,
    markForPhysioReferral,
    resetExercise,
    clearAllHistory,

    // Queries
    needsScreening,
    getPainAreaFromExercise,
    getExerciseHistory,
    getPhysioReferralList,

    // State
    activeScreeningExercise: state.activeScreeningExercise,
    physioReferralNeeded: state.physioReferralNeeded,
    exerciseHistory: state.exerciseHistory
  };
}
