/**
 * Pain Detect 2.0 - Entry Point
 *
 * Sistema unificato per la gestione del fastidio/dolore durante l'allenamento.
 *
 * @example
 * ```typescript
 * import {
 *   usePainDetect,
 *   classifyDiscomfort,
 *   evaluateDiscomfort,
 *   applyAdaptations,
 *   findSubstitution,
 *   PAIN_THRESHOLDS,
 *   BODY_AREA_LABELS
 * } from '@/utils/painDetect';
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  BodyArea,
  DiscomfortIntensity,
  DiscomfortLevel,
  DiscomfortReport,
  DiscomfortResponse,
  DiscomfortTrend,
  ReportPhase,
  UserChoice,
  UserOption,
  LoadReduction,
  PostSetResult,
  ExerciseCheck,
  ROMModification,
  SubstitutionResult,
  RecoveryPhase,
  RecoveryProgress,
  PainSessionState,
  ScreeningTrigger,
  ExerciseParams,
  AdaptedExerciseParams,
  UsePainDetectOptions,
  PainHistoryEntry,
} from './painDetectTypes';

// =============================================================================
// CONSTANTS
// =============================================================================

export {
  PAIN_THRESHOLDS,
  LOAD_REDUCTIONS,
  BODY_AREA_LABELS,
  DISCLAIMER,
} from './painDetectTypes';

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

export {
  classifyDiscomfort,
  evaluateDiscomfort,
  applyAdaptations,
  evaluatePostSet,
  checkExercise,
  createDiscomfortReport,
  getLoadReductions,
} from './painDetectService';

// =============================================================================
// SUBSTITUTION FUNCTIONS
// =============================================================================

export {
  findSubstitution,
  isContraindicated,
  getContraindicatedExercises,
  getSafeExercises,
  findSimilarExercise,
  generateROMModification,
} from './painDetectSubstitution';

// =============================================================================
// REACT HOOK
// =============================================================================

export { usePainDetect } from './usePainDetect';
export type { UsePainDetectReturn } from './usePainDetect';
