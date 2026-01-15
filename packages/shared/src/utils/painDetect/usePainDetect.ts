/**
 * Pain Detect 2.0 - React Hook
 *
 * Hook React per la gestione del fastidio durante l'allenamento.
 * Gestisce lo stato della sessione, i report e il recovery tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  BodyArea,
  DiscomfortIntensity,
  DiscomfortReport,
  DiscomfortResponse,
  PainSessionState,
  RecoveryProgress,
  RecoveryPhase,
  UserChoice,
  UsePainDetectOptions,
  PainHistoryEntry,
  ExerciseParams,
  AdaptedExerciseParams,
  PostSetResult,
  ExerciseCheck,
  SubstitutionResult,
  ScreeningTrigger,
  ReportPhase,
  PAIN_THRESHOLDS,
  DISCLAIMER,
} from './painDetectTypes';

import {
  classifyDiscomfort,
  evaluateDiscomfort,
  applyAdaptations,
  evaluatePostSet as evaluatePostSetService,
  checkExercise as checkExerciseService,
  createDiscomfortReport,
  getLoadReductions,
} from './painDetectService';

import { findSubstitution, isContraindicated } from './painDetectSubstitution';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

export interface UsePainDetectReturn {
  // === State ===
  sessionState: PainSessionState;
  activeRecoveries: RecoveryProgress[];
  painPatterns: Map<string, number>; // exerciseId -> suspension count

  // === Actions ===
  reportDiscomfort: (
    area: BodyArea,
    intensity: DiscomfortIntensity,
    phase: ReportPhase,
    exerciseId?: string,
    exerciseName?: string,
    setNumber?: number
  ) => DiscomfortResponse;

  evaluatePostSet: (
    exerciseId: string,
    beforeIntensity: DiscomfortIntensity,
    afterIntensity: DiscomfortIntensity
  ) => PostSetResult;

  applyUserChoice: (
    exerciseId: string,
    choice: UserChoice,
    alternativeExercise?: string
  ) => void;

  getExerciseAdaptations: (
    exerciseId: string,
    exerciseName: string,
    originalParams: ExerciseParams
  ) => AdaptedExerciseParams;

  checkExercise: (
    exerciseId: string,
    exerciseAreas: BodyArea[]
  ) => ExerciseCheck;

  findAlternative: (
    exerciseName: string,
    painArea: BodyArea,
    intensity: DiscomfortIntensity
  ) => SubstitutionResult;

  generateSessionAdaptations: () => Map<string, AdaptedExerciseParams>;

  updateRecovery: (
    area: BodyArea,
    painFreeSession: boolean,
    exerciseId?: string
  ) => RecoveryProgress | null;

  // === Helpers ===
  isAreaSkipped: (area: BodyArea) => boolean;
  getPreWorkoutIntensity: (area: BodyArea) => DiscomfortIntensity | undefined;
  getExerciseChoice: (exerciseId: string) => UserChoice | undefined;
  disclaimer: typeof DISCLAIMER;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function usePainDetect(
  userId: string,
  sessionId: string,
  options?: UsePainDetectOptions
): UsePainDetectReturn {
  // === Session State ===
  const [sessionState, setSessionState] = useState<PainSessionState>({
    sessionId,
    userId,
    preWorkoutReports: [],
    inSessionReports: [],
    exerciseChoices: {},
    skippedAreas: [],
    adaptedExercises: [],
    substitutedExercises: {},
  });

  // === Recovery State ===
  const [activeRecoveries, setActiveRecoveries] = useState<RecoveryProgress[]>([]);

  // === Pain Patterns (for screening) ===
  const [painPatterns, setPainPatterns] = useState<Map<string, number>>(new Map());

  // ==========================================================================
  // REPORT DISCOMFORT
  // ==========================================================================

  const reportDiscomfort = useCallback(
    (
      area: BodyArea,
      intensity: DiscomfortIntensity,
      phase: ReportPhase,
      exerciseId?: string,
      exerciseName?: string,
      setNumber?: number
    ): DiscomfortResponse => {
      // Crea report
      const report = createDiscomfortReport(
        userId,
        sessionId,
        area,
        intensity,
        phase,
        exerciseId,
        exerciseName,
        setNumber
      );

      // Valuta il report
      const response = evaluateDiscomfort(report, {
        exerciseName,
        isRecurringIssue: painPatterns.has(exerciseId || ''),
      });

      // Aggiorna stato sessione
      setSessionState((prev) => {
        if (phase === 'pre_workout') {
          return {
            ...prev,
            preWorkoutReports: [...prev.preWorkoutReports, report],
          };
        }
        return {
          ...prev,
          inSessionReports: [...prev.inSessionReports, report],
        };
      });

      // Persist se callback fornito
      if (options?.onPersistReport) {
        options.onPersistReport(report).catch(console.error);
      }

      return response;
    },
    [userId, sessionId, painPatterns, options]
  );

  // ==========================================================================
  // EVALUATE POST-SET
  // ==========================================================================

  const evaluatePostSet = useCallback(
    (
      exerciseId: string,
      beforeIntensity: DiscomfortIntensity,
      afterIntensity: DiscomfortIntensity
    ): PostSetResult => {
      return evaluatePostSetService(exerciseId, beforeIntensity, afterIntensity);
    },
    []
  );

  // ==========================================================================
  // APPLY USER CHOICE
  // ==========================================================================

  const applyUserChoice = useCallback(
    (
      exerciseId: string,
      choice: UserChoice,
      alternativeExercise?: string
    ) => {
      setSessionState((prev) => {
        const newState = { ...prev };

        // Registra la scelta
        newState.exerciseChoices = {
          ...prev.exerciseChoices,
          [exerciseId]: choice,
        };

        switch (choice) {
          case 'continue_adapted':
            if (!newState.adaptedExercises.includes(exerciseId)) {
              newState.adaptedExercises = [...prev.adaptedExercises, exerciseId];
            }
            break;

          case 'substitute_exercise':
            if (alternativeExercise) {
              newState.substitutedExercises = {
                ...prev.substitutedExercises,
                [exerciseId]: alternativeExercise,
              };
            }
            break;

          case 'skip_area':
            // Trova l'area dal report più recente
            const latestReport = [...prev.inSessionReports, ...prev.preWorkoutReports]
              .filter((r) => r.exerciseId === exerciseId)
              .pop();
            if (latestReport && !newState.skippedAreas.includes(latestReport.area)) {
              newState.skippedAreas = [...prev.skippedAreas, latestReport.area];
            }
            break;

          case 'skip_exercise':
            // Incrementa contatore sospensioni per screening
            setPainPatterns((prev) => {
              const newMap = new Map(prev);
              const currentCount = newMap.get(exerciseId) || 0;
              newMap.set(exerciseId, currentCount + 1);

              // Check screening trigger
              if (currentCount + 1 >= PAIN_THRESHOLDS.SUSPENSIONS_FOR_SCREENING) {
                const report = sessionState.inSessionReports.find(
                  (r) => r.exerciseId === exerciseId
                );
                if (report && options?.onScreeningTrigger) {
                  const trigger: ScreeningTrigger = {
                    exerciseId,
                    exerciseName: report.exerciseName || exerciseId,
                    area: report.area,
                    suspensionCount: currentCount + 1,
                    reason: `Exercise suspended ${currentCount + 1} times`,
                  };
                  options.onScreeningTrigger(trigger);
                }
              }

              return newMap;
            });
            break;
        }

        return newState;
      });

      // Persist history
      if (options?.onPersistHistory) {
        const report = sessionState.inSessionReports.find(
          (r) => r.exerciseId === exerciseId
        );
        if (report) {
          const historyEntry: PainHistoryEntry = {
            reportId: report.id,
            sessionId,
            area: report.area,
            intensity: report.intensity,
            exerciseName: report.exerciseName,
            actionTaken: choice,
            userChoice: choice,
            resolvedWithAdaptation: choice === 'continue_adapted',
            timestamp: new Date(),
          };
          options.onPersistHistory(historyEntry).catch(console.error);
        }
      }
    },
    [sessionState, sessionId, options]
  );

  // ==========================================================================
  // GET EXERCISE ADAPTATIONS
  // ==========================================================================

  const getExerciseAdaptations = useCallback(
    (
      exerciseId: string,
      exerciseName: string,
      originalParams: ExerciseParams
    ): AdaptedExerciseParams => {
      // Controlla se l'esercizio è stato adattato
      if (!sessionState.adaptedExercises.includes(exerciseId)) {
        return { ...originalParams };
      }

      // Trova l'intensità del fastidio correlato
      const relevantReport = sessionState.inSessionReports.find(
        (r) => r.exerciseId === exerciseId
      ) || sessionState.preWorkoutReports.find(
        (r) => r.exerciseName === exerciseName
      );

      if (!relevantReport) {
        return { ...originalParams };
      }

      return applyAdaptations(originalParams, relevantReport.intensity);
    },
    [sessionState]
  );

  // ==========================================================================
  // CHECK EXERCISE
  // ==========================================================================

  const checkExercise = useCallback(
    (exerciseId: string, exerciseAreas: BodyArea[]): ExerciseCheck => {
      // Verifica aree saltate
      const hasSkippedArea = exerciseAreas.some((area) =>
        sessionState.skippedAreas.includes(area)
      );

      if (hasSkippedArea) {
        const skippedArea = exerciseAreas.find((area) =>
          sessionState.skippedAreas.includes(area)
        );
        return {
          exerciseId,
          appropriate: false,
          reasonIt: `L'area ${skippedArea} è stata saltata per questa sessione.`,
          reasonEn: `The ${skippedArea} area has been skipped for this session.`,
          suggestedAction: 'skip_exercise',
        };
      }

      return checkExerciseService(
        exerciseId,
        exerciseAreas,
        sessionState.preWorkoutReports
      );
    },
    [sessionState]
  );

  // ==========================================================================
  // FIND ALTERNATIVE
  // ==========================================================================

  const findAlternative = useCallback(
    (
      exerciseName: string,
      painArea: BodyArea,
      intensity: DiscomfortIntensity
    ): SubstitutionResult => {
      return findSubstitution(exerciseName, painArea, intensity);
    },
    []
  );

  // ==========================================================================
  // GENERATE SESSION ADAPTATIONS
  // ==========================================================================

  const generateSessionAdaptations = useCallback((): Map<string, AdaptedExerciseParams> => {
    const adaptations = new Map<string, AdaptedExerciseParams>();

    // Per ogni esercizio adattato, calcola i nuovi parametri
    sessionState.adaptedExercises.forEach((exerciseId) => {
      const report = sessionState.inSessionReports.find(
        (r) => r.exerciseId === exerciseId
      );
      if (report) {
        // Nota: serve conoscere i params originali
        // Qui restituiamo solo le riduzioni
        const reductions = getLoadReductions(report.intensity);
        adaptations.set(exerciseId, {
          sets: 0, // placeholder - verrà usato con params reali
          reps: 0,
          restSeconds: 0,
          adaptationNote: `Load: -${reductions.load}%, Volume: -${reductions.volume}%, Rest: +${reductions.rest}%`,
          adaptationNoteIt: `Carico: -${reductions.load}%, Volume: -${reductions.volume}%, Riposo: +${reductions.rest}%`,
        });
      }
    });

    return adaptations;
  }, [sessionState]);

  // ==========================================================================
  // UPDATE RECOVERY
  // ==========================================================================

  const updateRecovery = useCallback(
    (
      area: BodyArea,
      painFreeSession: boolean = false,
      exerciseId?: string
    ): RecoveryProgress | null => {
      let updatedProgress: RecoveryProgress | null = null;

      setActiveRecoveries((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.area === area && r.exerciseId === exerciseId
        );

        if (existingIndex === -1) {
          // Crea nuovo recovery se non esiste e non è pain-free
          if (!painFreeSession) {
            const newProgress: RecoveryProgress = {
              id: `recovery_${Date.now()}`,
              area,
              exerciseId,
              phase: 'acute',
              painFreeSessions: 0,
              targetSessions: PAIN_THRESHOLDS.SESSIONS_FOR_PROGRESSION,
              currentLoadPercent: 0,
              nextLoadPercent: 60,
              isComplete: false,
              startedAt: new Date(),
              updatedAt: new Date(),
            };
            updatedProgress = newProgress;
            return [...prev, newProgress];
          }
          return prev;
        }

        // Aggiorna esistente
        const existing = prev[existingIndex];
        const updated = { ...existing, updatedAt: new Date() };

        if (painFreeSession) {
          updated.painFreeSessions = existing.painFreeSessions + 1;

          // Progressione fase
          if (updated.painFreeSessions >= updated.targetSessions) {
            updated.phase = getNextPhase(existing.phase);
            updated.painFreeSessions = 0;
            updated.currentLoadPercent = updated.nextLoadPercent;
            updated.nextLoadPercent = Math.min(100, updated.nextLoadPercent + 20);

            if (updated.phase === 'complete') {
              updated.isComplete = true;
              updated.completedAt = new Date();

              // Callback completamento
              if (options?.onRecoveryComplete) {
                options.onRecoveryComplete(updated);
              }
            }
          }
        } else {
          // Reset progressione se c'è dolore
          updated.painFreeSessions = 0;
          // Potenzialmente regredire fase
          if (existing.phase !== 'acute') {
            updated.phase = getPreviousPhase(existing.phase);
          }
        }

        updatedProgress = updated;
        const newArr = [...prev];
        newArr[existingIndex] = updated;
        return newArr;
      });

      // Persist recovery
      if (updatedProgress && options?.onPersistRecovery) {
        options.onPersistRecovery(updatedProgress).catch(console.error);
      }

      return updatedProgress;
    },
    [options]
  );

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  const isAreaSkipped = useCallback(
    (area: BodyArea): boolean => {
      return sessionState.skippedAreas.includes(area);
    },
    [sessionState.skippedAreas]
  );

  const getPreWorkoutIntensity = useCallback(
    (area: BodyArea): DiscomfortIntensity | undefined => {
      const report = sessionState.preWorkoutReports.find((r) => r.area === area);
      return report?.intensity;
    },
    [sessionState.preWorkoutReports]
  );

  const getExerciseChoice = useCallback(
    (exerciseId: string): UserChoice | undefined => {
      return sessionState.exerciseChoices[exerciseId];
    },
    [sessionState.exerciseChoices]
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    sessionState,
    activeRecoveries,
    painPatterns,

    // Actions
    reportDiscomfort,
    evaluatePostSet,
    applyUserChoice,
    getExerciseAdaptations,
    checkExercise,
    findAlternative,
    generateSessionAdaptations,
    updateRecovery,

    // Helpers
    isAreaSkipped,
    getPreWorkoutIntensity,
    getExerciseChoice,
    disclaimer: DISCLAIMER,
  };
}

// =============================================================================
// PHASE HELPERS
// =============================================================================

function getNextPhase(current: RecoveryPhase): RecoveryPhase {
  const phases: RecoveryPhase[] = ['acute', 'subacute', 'reloading', 'return_to_sport', 'complete'];
  const currentIndex = phases.indexOf(current);
  return phases[Math.min(currentIndex + 1, phases.length - 1)];
}

function getPreviousPhase(current: RecoveryPhase): RecoveryPhase {
  const phases: RecoveryPhase[] = ['acute', 'subacute', 'reloading', 'return_to_sport', 'complete'];
  const currentIndex = phases.indexOf(current);
  return phases[Math.max(currentIndex - 1, 0)];
}
