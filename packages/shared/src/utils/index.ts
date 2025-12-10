/**
 * Utils - Export Centrale
 * Import centralizzato: import { calculateVolume, generateWeeklySplit, etc } from '@fitnessflow/shared'
 */

// Exercise Variants
export type { ExerciseVariant, ExerciseAlternative, SuggestedParams } from './exerciseVariants';
export {
  LOWER_PUSH_VARIANTS,
  LOWER_PULL_VARIANTS,
  HORIZONTAL_PUSH_VARIANTS,
  VERTICAL_PUSH_VARIANTS,
  VERTICAL_PULL_VARIANTS,
  HORIZONTAL_PULL_VARIANTS,
  CORE_VARIANTS,
  ACCESSORY_VARIANTS,
  EXERCISE_ALTERNATIVES,
  WEIGHT_CONVERSION_NOTES,
  getVariantForPattern,
  getEasierVariant,
  getExerciseAlternatives,
  hasAlternatives,
  getQuickAlternative,
  calculateSuggestedParams,
  getAlternativesWithParams
} from './exerciseVariants';

// Exercise Descriptions
export type { ExerciseDescription } from './exerciseDescriptions';
export {
  EXERCISE_DESCRIPTIONS,
  getExerciseDescription
} from './exerciseDescriptions';

// Program Generator
export type { VolumeResult, ProgramGeneratorOptions } from './programGenerator';
export {
  calculateVolume,
  generateProgram,
  generateProgramWithSplit,
  isBodyweightExercise
} from './programGenerator';

// Program Validation & Runtime Adaptation
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationCorrection,
  RuntimeContext,
  RuntimeAdaptation,
  ScreeningResults as PreWorkoutScreening,
  SessionFeedback,
  PainAdaptation,
  ExerciseReplacement,
  TimeCompression
} from './programValidation';
export {
  validateProgramInput,
  applyCorrections,
  generateDefaultBaselines,
  adaptWorkoutToRuntime,
  formatValidationResult
} from './programValidation';

// Weekly Split Generator
// Note: DayWorkout and WeeklySplit are exported from types, not here
export {
  generateWeeklySplit,
  estimateWorkoutDuration,
  formatDuration,
  calculate1RMFromNRM,
  calculateNRMFrom1RM,
  calculateWeightFromRIR,
  getTargetRIR,
  calculateSuggestedWeight,
  formatWeight,
  getProgressionMultiplier,
  calculateWeightIncrement
} from './weeklySplitGenerator';

// Strength Standards
export type {
  Level as StrengthLevel,
  Gender,
  StrengthStandard,
  LiftResult,
  LevelAssessment
} from './strengthStandards';
export {
  getStandardsForGender,
  calculatePatternLevel,
  calculateOverallLevel,
  convertScreeningToLifts,
  suggestNextGoals,
  getStandardsTable
} from './strengthStandards';

// Retest Progression
export type {
  Goal as RetestGoal,
  Level as RetestLevel,
  RetestConfig,
  RetestHistory,
  RetestSchedule,
  DeloadConfig
} from './retestProgression';
export {
  getRetestConfig,
  getRetestSchedule,
  calculateEstimated1RM,
  calculateWeightForRM,
  generateRetestInstructions,
  generateDeloadInstructions,
  convertBaselines,
  validateRetestResults
} from './retestProgression';

// Validators
export type { NormalizedPainArea } from './validators';
export {
  validateAndNormalizePainAreas,
  numericSeverityToString
} from './validators';

// Pain Management
export type { PainExerciseMapping, DeloadResult } from './painManagement';
export {
  PAIN_EXERCISE_MAP,
  applyPainDeload,
  isExerciseConflicting,
  findSafeAlternative,
  getCorrectiveExercises
} from './painManagement';

// Functional Screening
export type {
  ScreeningTest,
  ScreeningProtocol,
  ScreeningResults,
  TestResult,
  MovementProfile
} from './functionalScreening';
export {
  LOWER_BACK_QUICK_SCREEN,
  LOWER_BACK_COMPREHENSIVE_SCREEN,
  HIP_QUICK_SCREEN,
  KNEE_QUICK_SCREEN,
  SHOULDER_QUICK_SCREEN,
  SCREENING_PROTOCOLS,
  interpretScreeningResults,
  generateScreeningReport,
  getAvailableScreeningProtocols,
  getScreeningProtocol,
  createScreeningResultTemplate,
  quickPainAssessment
} from './functionalScreening';

// Movement-Specific Corrective Exercises
export type { CorrectiveExercise } from './movementSpecificCorrectiveExercises';
export {
  LOWER_BACK_CORRECTIVES,
  HIP_CORRECTIVES,
  KNEE_CORRECTIVES,
  SHOULDER_CORRECTIVES,
  getMovementSpecificCorrectiveExercises
} from './movementSpecificCorrectiveExercises';

// Exercise Mapping
export {
  MACHINE_EXERCISE_MAP,
  convertToMachineVariant
} from './exerciseMapping';

// Body Composition (Navy Method)
export type { BodyMeasurements, BodyCompositionResult } from './bodyComposition';
export {
  calculateBodyComposition,
  calculateBodyFatNavy,
  calculateBodyFatYMCA,
  calculateBodyFatFromBMI,
  calculateBMI,
  categorizeBodyFat,
  interpretBodyFatCategory,
  validateMeasurements
} from './bodyComposition';

// Exercise Form Cues
export type { FormCue, ExerciseFormCues } from './exerciseFormCues';
export {
  EXERCISE_FORM_DATABASE,
  getFormCues,
  getCuesByCategory,
  getCriticalCues
} from './exerciseFormCues';

// Exercise Images (Static)
export {
  EXERCISE_IMAGES,
  EXERCISE_IMAGE_FALLBACKS,
  STATIC_EXERCISES,
  isStaticExercise,
  getExerciseImageUrl,
  getExerciseImageFallback,
  getExerciseImageWithFallback,
  generateImageUploadList
} from './exerciseImages';

// Location Adapter (gym/home switch)
export type {
  LocationType,
  HomeType,
  HomeEquipment,
  LocationAdaptationOptions
} from './locationAdapter';
export {
  adaptExercisesForLocation,
  isExerciseCompatible,
  getAvailableVariants
} from './locationAdapter';

// Exercise Progression (downgrade/upgrade/auto-adjust)
export type {
  DifficultyFeedback,
  ProgressionResult
} from './exerciseProgression';
export {
  analyzeExerciseFeedback,
  getDowngradedExercise,
  getUpgradedExercise,
  getLocationSwitchAdjustment,
  getSuggestedStartingExercise,
  PROGRESSION_CHAINS
} from './exerciseProgression';

// Level Calculation (centralized)
export type { Level as UserLevel, LevelThresholds } from './levelCalculation';
export {
  calculateLevelFromScore,
  calculateLevelFromScreening,
  calculateLevelFromBaselines,
  getLevelInfo,
  DEFAULT_THRESHOLDS
} from './levelCalculation';

// Data Sync (localStorage ↔ Supabase)
export type { SyncableData, SyncResult, SyncConfig, SyncStatus } from './dataSync';
export {
  safeStorage,
  STORAGE_KEYS,
  TABLE_MAPPINGS,
  compareTimestamps,
  mergeData,
  getSyncStatus,
  updateSyncStatus,
  markPendingSync,
  clearPendingSync,
  validateOnboardingData,
  validateScreeningData,
  createSyncedSaver,
  onboardingSaver,
  screeningSaver,
  recoverySaver,
  programSaver,
  exportUserData,
  importUserData
} from './dataSync';

// Detraining Model (evidence-based)
export type { TrainingGoal, DetrainingConfig, DetrainingResult } from './detrainingModel';
export {
  calculateDetraining,
  getDetrainingFactor,
  getDaysUntilDetraining,
  STRENGTH_DECAY_CURVE,
  ENDURANCE_DECAY_CURVE,
  MUSCLE_MASS_DECAY_CURVE
} from './detrainingModel';

// Pain Load Reduction (evidence-based)
export type {
  PainType,
  PainCharacter,
  PainTiming,
  MovementPhase,
  PainAssessment,
  LoadReductionResult
} from './painLoadReduction';
export {
  calculatePainLoadReduction,
  getSimplePainReduction,
  shouldModifyForPain,
  classifyPainType,
  isDOMS
} from './painLoadReduction';

// Workout Tracking & Missed Sessions
export type {
  WorkoutStatus,
  WorkoutSession,
  SessionFeedback,
  WorkoutStreak,
  MissedWorkoutAnalysis,
  MissedWorkoutRecommendation,
  UnvalidatedSession
} from './workoutTracking';
export {
  daysSinceLastWorkout,
  analyzeMissedWorkouts,
  findUnvalidatedSessions,
  getUnvalidatedSessionPrompt,
  calculateStreak,
  getStreakMessage,
  shouldShowMissedWarning
} from './workoutTracking';

// Pain Tracking System (real-time & cross-session)
export type {
  // Base types
  ExtendedPainArea,
  LateralizedPainArea,
  AllPainAreas,
  PainType,
  PainCharacter,
  Laterality,
  PainTiming,
  PainAction,
  PainRecord,
  // Exercise tracking
  ExerciseTrackingStatus,
  ExercisePainHistory,
  RecoveryPlan,
  NextSessionExerciseCheck,
  ProgressivePainState,
  PainEvaluationResult,
  PainScreening,
  IncompleteSetFeedback,
  PainTrackedSession,
  // Memory & History
  UserPainMemory,
  ChronicPainArea,
  WeeklyPainSummary,
  LongTermPainHistory,
  MonthlyTrend,
  // Correlations
  ExercisePainCorrelation,
  CyclePainCorrelation,
  // Alerts & Warmup
  MedicalAlert,
  AdaptiveWarmup,
  WarmupExercise,
  PainTypeEvaluation
} from './painTracking';
export {
  // Labels
  EXTENDED_PAIN_AREA_LABELS,
  LATERALIZED_PAIN_AREA_LABELS,
  PAIN_TYPE_LABELS,
  PAIN_CHARACTER_LABELS,
  // Core evaluation
  getSeverityCategory,
  evaluatePreWorkoutPain,
  evaluateIntraExercisePain,
  evaluatePostExercisePain,
  evaluateIncompleteSet,
  // Screening
  performPreWorkoutScreening,
  performPostWarmupScreening,
  // Progressive tracking
  updateProgressivePainState,
  // Memory
  updatePainMemory,
  createRecoveryPlan,
  advanceRecoveryPlan,
  isRecoveryPlanComplete,
  checkExerciseForNextSession,
  checkExerciseFlag,
  prepareNextSessionAdaptations,
  createEmptyPainMemory,
  // Multi-area
  evaluateMultiAreaPain,
  // Area helpers
  getAffectedPatterns,
  isPainAreaSupported,
  getSupportedPainAreas,
  getPainAreaLabel,
  getBaseArea,
  areBilateral,
  // DOMS vs Articolare
  evaluatePainType,
  getPainTypeQuestions,
  // Warm-up adattivo
  generateAdaptiveWarmup,
  // Correlazioni
  analyzeExercisePainCorrelations,
  analyzeCyclePainCorrelations,
  // Long-term
  calculateLongTermTrend,
  generateLongTermInsights,
  // Medical alerts
  generateMedicalAlerts,
  hasUrgentAlerts,
  acknowledgeAlert
} from './painTracking';
