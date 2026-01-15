/**
 * PAIN MANAGEMENT HOOK - MIGRATO A PAIN DETECT 2.0
 * 
 * File: packages/web/src/hooks/usePainManagement.ts
 * 
 * Questo hook è un WRAPPER per compatibilità con codice esistente.
 * Per nuove implementazioni, usa direttamente usePainDetect.
 * 
 * @deprecated Usa usePainDetect da @trainsmart/shared
 */

import { useState, useCallback, useMemo } from 'react';
import {
  usePainDetect,
  classifyDiscomfort,
  evaluateDiscomfort,
  PAIN_THRESHOLDS,
  BODY_AREA_LABELS,
  type DiscomfortIntensity,
  type DiscomfortResponse,
  type BodyArea,
  type UserChoice,
  type SessionPainState
} from '@trainsmart/shared';

// =============================================================================
// TYPES (Mantenuti per compatibilità)
// =============================================================================

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
  referToPhysio: boolean;
}

export interface PainAttempt {
  timestamp: string;
  painLevel: number;
  action: 'load_reduction' | 'rep_reduction' | 'suspension' | 'screening_triggered' | 'physio_referral';
  loadReduction?: number;
  repReduction?: number;
  notes?: string;
}

interface LegacyPainManagementState {
  exerciseHistory: Map<string, ExercisePainHistory>;
  activeScreeningExercise: string | null;
  physioReferralNeeded: string[];
}

// =============================================================================
// MAPPING HELPERS
// =============================================================================

/**
 * Mappa PainArea legacy → BodyArea nuovo sistema
 */
function mapLegacyAreaToBodyArea(area: PainArea): BodyArea {
  const mapping: Record<PainArea, BodyArea> = {
    neck: 'neck',
    shoulder: 'shoulder',
    elbow: 'elbow',
    wrist: 'wrist',
    scapula: 'upper_back',
    thoracic_spine: 'upper_back',
    lower_back: 'lower_back',
    hip: 'hip',
    knee: 'knee',
    ankle: 'ankle'
  };
  return mapping[area] || 'lower_back';
}

/**
 * Mappa exercise name → area probabile (euristica)
 */
function getPainAreaFromExerciseName(exerciseName: string): PainArea {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('squat') || name.includes('leg press') || name.includes('lunge')) {
    return 'knee';
  }
  if (name.includes('deadlift') || name.includes('row') || name.includes('good morning')) {
    return 'lower_back';
  }
  if (name.includes('press') || name.includes('fly') || name.includes('raise')) {
    return 'shoulder';
  }
  if (name.includes('curl') || name.includes('extension') || name.includes('pushdown')) {
    return 'elbow';
  }
  if (name.includes('pull') || name.includes('chin')) {
    return 'shoulder';
  }
  if (name.includes('hip') || name.includes('thrust') || name.includes('glute')) {
    return 'hip';
  }
  if (name.includes('calf') || name.includes('ankle')) {
    return 'ankle';
  }
  
  return 'lower_back'; // Default
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * @deprecated Usa usePainDetect per nuove implementazioni
 */
export function usePainManagement(userId?: string, sessionId?: string) {
  // Usa il nuovo hook internamente (se userId/sessionId forniti)
  const painDetect = userId && sessionId 
    ? usePainDetect(userId, sessionId)
    : null;

  // State legacy per compatibilità
  const [legacyState, setLegacyState] = useState<LegacyPainManagementState>({
    exerciseHistory: new Map(),
    activeScreeningExercise: null,
    physioReferralNeeded: []
  });

  /**
   * REPORT PAIN - Metodo principale legacy
   * Avvia progressive deload: Load → Reps → Suspend
   */
  const reportPain = useCallback(
    (exerciseName: string, painLevel: number): {
      action: 'continue' | 'reduce_load' | 'reduce_reps' | 'suspend' | 'screening';
      loadReduction?: number;
      repReduction?: number;
      message: string;
      _painDetectResponse?: DiscomfortResponse;
    } => {
      const intensity = Math.min(10, Math.max(0, painLevel)) as DiscomfortIntensity;
      const level = classifyDiscomfort(intensity);

      // Usa il nuovo sistema se disponibile
      if (painDetect) {
        const area = mapLegacyAreaToBodyArea(getPainAreaFromExerciseName(exerciseName));
        const response = painDetect.reportDiscomfort(
          area,
          intensity,
          'during_set',
          exerciseName,
          exerciseName
        );

        // Converti in formato legacy
        if (level === 'none' || level === 'mild') {
          return {
            action: 'continue',
            message: response.messageIt,
            _painDetectResponse: response
          };
        }

        if (level === 'moderate') {
          // Check history per escalation
          const history = legacyState.exerciseHistory.get(exerciseName);
          const attempts = history?.attempts || [];
          const loadAttempts = attempts.filter(a => a.action === 'load_reduction').length;
          const repAttempts = attempts.filter(a => a.action === 'rep_reduction').length;

          // Escalation: Load → Reps → Suspend
          if (loadAttempts === 0) {
            updateHistory(exerciseName, painLevel, 'load_reduction', 20);
            return {
              action: 'reduce_load',
              loadReduction: 20,
              message: `⚠️ Fastidio ${painLevel}/10. Riduciamo il carico del 20%.`,
              _painDetectResponse: response
            };
          }

          if (repAttempts === 0) {
            updateHistory(exerciseName, painLevel, 'rep_reduction', undefined, 30);
            return {
              action: 'reduce_reps',
              repReduction: 30,
              message: `⚠️ Fastidio persistente. Riduciamo le ripetizioni del 30%.`,
              _painDetectResponse: response
            };
          }

          // Già provato load e reps → suspend
          updateHistory(exerciseName, painLevel, 'suspension');
          return {
            action: 'suspend',
            message: `🛑 Sospendiamo l'esercizio per questa sessione.`,
            _painDetectResponse: response
          };
        }

        // Significant/Severe → suspend immediato
        updateHistory(exerciseName, painLevel, 'suspension');
        return {
          action: 'suspend',
          message: response.messageIt,
          _painDetectResponse: response
        };
      }

      // Fallback senza painDetect hook
      if (painLevel < 5) {
        return {
          action: 'continue',
          message: 'Fastidio lieve. Continua con cautela.'
        };
      }

      if (painLevel <= 6) {
        return {
          action: 'reduce_load',
          loadReduction: 20,
          message: `⚠️ Fastidio ${painLevel}/10. Riduciamo il carico del 20%.`
        };
      }

      return {
        action: 'suspend',
        message: `🛑 Fastidio ${painLevel}/10. Sospendiamo l'esercizio.`
      };
    },
    [painDetect, legacyState.exerciseHistory]
  );

  /**
   * Update exercise history
   */
  const updateHistory = useCallback((
    exerciseName: string,
    painLevel: number,
    action: PainAttempt['action'],
    loadReduction?: number,
    repReduction?: number
  ) => {
    setLegacyState(prev => {
      const newHistory = new Map(prev.exerciseHistory);
      const existing = newHistory.get(exerciseName) || {
        exerciseName,
        attempts: [],
        suspensionCount: 0,
        needsScreening: false,
        lastPainLevel: 0,
        recoveryProtocolActive: false,
        referToPhysio: false
      };

      const attempt: PainAttempt = {
        timestamp: new Date().toISOString(),
        painLevel,
        action,
        loadReduction,
        repReduction
      };

      existing.attempts.push(attempt);
      existing.lastPainLevel = painLevel;

      if (action === 'suspension') {
        existing.suspensionCount++;
        if (existing.suspensionCount >= PAIN_THRESHOLDS.SUSPENSIONS_FOR_SCREENING) {
          existing.needsScreening = true;
        }
      }

      newHistory.set(exerciseName, existing);

      return {
        ...prev,
        exerciseHistory: newHistory,
        activeScreeningExercise: existing.needsScreening ? exerciseName : prev.activeScreeningExercise
      };
    });
  }, []);

  /**
   * Check if exercise needs screening
   */
  const needsScreening = useCallback((exerciseName: string): boolean => {
    const history = legacyState.exerciseHistory.get(exerciseName);
    return history?.needsScreening || false;
  }, [legacyState.exerciseHistory]);

  /**
   * Get pain area from exercise name
   */
  const getPainAreaFromExercise = useCallback((exerciseName: string): PainArea => {
    return getPainAreaFromExerciseName(exerciseName);
  }, []);

  /**
   * Mark screening completed for exercise
   */
  const completeScreening = useCallback((exerciseName: string) => {
    setLegacyState(prev => {
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
   * Mark for physio referral
   */
  const markForPhysioReferral = useCallback((exerciseName: string, reason: string) => {
    setLegacyState(prev => {
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
      return legacyState.exerciseHistory.get(exerciseName);
    },
    [legacyState.exerciseHistory]
  );

  /**
   * Get all exercises needing physio referral
   */
  const getPhysioReferralList = useCallback((): string[] => {
    return legacyState.physioReferralNeeded;
  }, [legacyState.physioReferralNeeded]);

  /**
   * Reset exercise history
   */
  const resetExercise = useCallback((exerciseName: string) => {
    setLegacyState(prev => {
      const newHistory = new Map(prev.exerciseHistory);
      newHistory.delete(exerciseName);
      return {
        ...prev,
        exerciseHistory: newHistory
      };
    });
  }, []);

  /**
   * Clear all history
   */
  const clearAllHistory = useCallback(() => {
    setLegacyState({
      exerciseHistory: new Map(),
      activeScreeningExercise: null,
      physioReferralNeeded: []
    });
    painDetect?.resetSession();
  }, [painDetect]);

  return {
    // Legacy Actions
    reportPain,
    completeScreening,
    markForPhysioReferral,
    resetExercise,
    clearAllHistory,

    // Legacy Queries
    needsScreening,
    getPainAreaFromExercise,
    getExerciseHistory,
    getPhysioReferralList,

    // Legacy State
    activeScreeningExercise: legacyState.activeScreeningExercise,
    physioReferralNeeded: legacyState.physioReferralNeeded,
    exerciseHistory: legacyState.exerciseHistory,

    // NEW: Accesso diretto al sistema Pain Detect 2.0
    painDetect,

    // NEW: Costanti esposte
    PAIN_THRESHOLDS,
    BODY_AREA_LABELS
  };
}

// Re-export per uso diretto del nuovo sistema
export {
  usePainDetect,
  classifyDiscomfort,
  evaluateDiscomfort,
  PAIN_THRESHOLDS,
  BODY_AREA_LABELS
} from '@trainsmart/shared';

export type {
  DiscomfortIntensity,
  DiscomfortResponse,
  BodyArea,
  UserChoice
} from '@trainsmart/shared';
