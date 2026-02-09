/**
 * useWorkoutFlow - State machine for workout session flow
 *
 * Manages the transitions:
 * 1. Day selected → Recovery Screening
 * 2. Recovery Screening → Live Workout
 * 3. Live Workout → Workout Logger
 * 4. Workout Logger → Done
 *
 * Running alternative:
 * 1. Running day selected → Running Session
 * 2. Running Session → Done
 */

import { useReducer, useCallback } from 'react';
import type { RecoveryData } from '../pages/RecoveryScreening';

// =============================================================================
// TYPES
// =============================================================================

type WorkoutFlowState =
  | { phase: 'idle' }
  | { phase: 'recovery_screening'; workoutDay: any }
  | { phase: 'live_workout'; workoutDay: any; recoveryData: RecoveryData | null }
  | { phase: 'workout_logger'; workoutDay: any }
  | { phase: 'running_session'; runningDayData: any };

type WorkoutFlowAction =
  | { type: 'START_WORKOUT'; day: any }
  | { type: 'START_RUNNING'; day: any }
  | { type: 'RECOVERY_COMPLETE'; recoveryData: RecoveryData }
  | { type: 'RECOVERY_SKIP' }
  | { type: 'LIVE_WORKOUT_COMPLETE' }
  | { type: 'LIVE_WORKOUT_CLOSE' }
  | { type: 'WORKOUT_LOGGED' }
  | { type: 'WORKOUT_LOGGER_CLOSE' }
  | { type: 'RUNNING_COMPLETE' }
  | { type: 'RUNNING_CANCEL' }
  | { type: 'RESET' };

const DEFAULT_RECOVERY: RecoveryData = {
  sleepHours: 7,
  stressLevel: 5,
  hasInjury: false,
  injuryDetails: null,
  menstrualCycle: null,
  availableTime: 45,
  isFemale: false,
  timestamp: new Date().toISOString(),
};

// =============================================================================
// REDUCER
// =============================================================================

function workoutFlowReducer(state: WorkoutFlowState, action: WorkoutFlowAction): WorkoutFlowState {
  switch (action.type) {
    case 'START_WORKOUT':
      return { phase: 'recovery_screening', workoutDay: action.day };

    case 'START_RUNNING':
      return { phase: 'running_session', runningDayData: action.day };

    case 'RECOVERY_COMPLETE':
      if (state.phase !== 'recovery_screening') return state;
      return { phase: 'live_workout', workoutDay: state.workoutDay, recoveryData: action.recoveryData };

    case 'RECOVERY_SKIP':
      if (state.phase !== 'recovery_screening') return state;
      return { phase: 'live_workout', workoutDay: state.workoutDay, recoveryData: DEFAULT_RECOVERY };

    case 'LIVE_WORKOUT_COMPLETE':
      if (state.phase !== 'live_workout') return state;
      return { phase: 'workout_logger', workoutDay: state.workoutDay };

    case 'LIVE_WORKOUT_CLOSE':
    case 'WORKOUT_LOGGED':
    case 'WORKOUT_LOGGER_CLOSE':
    case 'RUNNING_COMPLETE':
    case 'RUNNING_CANCEL':
    case 'RESET':
      return { phase: 'idle' };

    default:
      return state;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkoutFlow() {
  const [state, dispatch] = useReducer(workoutFlowReducer, { phase: 'idle' });

  const startWorkout = useCallback((day: any) => {
    // Check if it's a running day
    if (day.type === 'running' && day.runningSession && (!day.exercises || day.exercises.length === 0)) {
      dispatch({ type: 'START_RUNNING', day });
    } else {
      dispatch({ type: 'START_WORKOUT', day });
    }
  }, []);

  const startRunning = useCallback((day: any) => {
    dispatch({ type: 'START_RUNNING', day });
  }, []);

  const completeRecovery = useCallback((data: RecoveryData) => {
    dispatch({ type: 'RECOVERY_COMPLETE', recoveryData: data });
  }, []);

  const skipRecovery = useCallback(() => {
    dispatch({ type: 'RECOVERY_SKIP' });
  }, []);

  const completeLiveWorkout = useCallback(() => {
    dispatch({ type: 'LIVE_WORKOUT_COMPLETE' });
  }, []);

  const closeLiveWorkout = useCallback(() => {
    dispatch({ type: 'LIVE_WORKOUT_CLOSE' });
  }, []);

  const logWorkout = useCallback(() => {
    dispatch({ type: 'WORKOUT_LOGGED' });
  }, []);

  const closeWorkoutLogger = useCallback(() => {
    dispatch({ type: 'WORKOUT_LOGGER_CLOSE' });
  }, []);

  const completeRunning = useCallback(() => {
    dispatch({ type: 'RUNNING_COMPLETE' });
  }, []);

  const cancelRunning = useCallback(() => {
    dispatch({ type: 'RUNNING_CANCEL' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Derived state for backward compatibility
  const showRecoveryScreening = state.phase === 'recovery_screening';
  const showLiveWorkout = state.phase === 'live_workout';
  const showWorkoutLogger = state.phase === 'workout_logger';
  const showRunningSession = state.phase === 'running_session';

  const currentWorkoutDay = state.phase === 'recovery_screening' ? state.workoutDay
    : state.phase === 'live_workout' ? state.workoutDay
    : state.phase === 'workout_logger' ? state.workoutDay
    : null;

  const recoveryData = state.phase === 'live_workout' ? state.recoveryData : null;

  const runningDayData = state.phase === 'running_session' ? state.runningDayData : null;

  return {
    // State
    phase: state.phase,
    showRecoveryScreening,
    showLiveWorkout,
    showWorkoutLogger,
    showRunningSession,
    currentWorkoutDay,
    recoveryData,
    runningDayData,

    // Actions
    startWorkout,
    startRunning,
    completeRecovery,
    skipRecovery,
    completeLiveWorkout,
    closeLiveWorkout,
    logWorkout,
    closeWorkoutLogger,
    completeRunning,
    cancelRunning,
    reset,
  };
}
