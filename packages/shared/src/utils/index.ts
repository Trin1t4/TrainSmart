/**
 * Utils - Export Centrale
 * Import centralizzato: import { calculateVolume, generateWeeklySplit, etc } from '@trainsmart/shared'
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
  shouldSuggestVariantUpgrade,
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
  SessionFeedback as ProgramSessionFeedback,
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
  // getTargetRIR moved to dupBeginnerSafety (improved version with DUP safety)
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

// Functional Screening - DEPRECATED: Use movementCheck instead
// Old exports removed - see Movement Check System section for new API

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
export type { Level as UserLevel, LevelThresholds, DiscrepancyType, ScreeningDiscrepancy } from './levelCalculation';
export {
  calculateLevelFromScore,
  calculateLevelFromScreening,
  calculateLevelFromBaselines,
  getLevelInfo,
  detectScreeningDiscrepancy,
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

// Pain Load Reduction (simplified - fitness-first)
export type {
  DiscomfortSeverity,
  DiscomfortReport,
  LoadReductionResult,
  // Legacy compatibility
  PainType as LoadPainType,
  PainAssessment
} from './painLoadReduction';
export {
  calculateLoadReduction,
  quickLoadReduction,
  shouldSkipExercise,
  getVolumeMultiplier,
  getIntensityMultiplier,
  isExerciseSensitiveForArea,
  calculateExerciseSpecificReduction,
  intensityToSeverity,
  severityToIntensityRange,
  DISCOMFORT_DISCLAIMER,
  // Legacy compatibility
  calculatePainLoadReduction,
  getSimplePainReduction,
  shouldModifyForPain
} from './painLoadReduction';

// Movement Check System (fitness-first screening)
export type {
  BodyArea,
  FundamentalMovement,
  MovementCheck,
  MovementCheckResult,
  MovementProfile as MovementCheckProfile
} from './movementCheck';
export {
  MOVEMENT_CHECKS,
  evaluateMovementChecks,
  isMovementAppropriate,
  getChecksForArea,
  getCheckForMovement,
  createEmptyResults,
  MOVEMENT_TO_EXERCISE_CATEGORY,
  getCategoriesToAvoid,
  getSafeCategories,
  MOVEMENT_CHECK_COUNT
} from './movementCheck';

// Exercise Anatomical Classification
export type { BodyRegion } from './exerciseAnatomicalClassification';
export {
  EXERCISE_ANATOMICAL_DATABASE,
  getExerciseProfile,
  getExercisesByCategory,
  isExerciseContraindicated
} from './exerciseAnatomicalClassification';

// Workout Tracking & Missed Sessions
export type {
  WorkoutStatus,
  WorkoutSession,
  SessionFeedback,
  WorkoutStreak as CalculatedStreak,
  MissedWorkoutAnalysis,
  MissedWorkoutRecommendation,
  UnvalidatedSession
} from './workoutTracking';
export {
  daysSinceLastWorkout,
  analyzeMissedWorkouts,
  findUnvalidatedSessions,
  getUnvalidatedSessionDecision,
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
  PainTypeEvaluation,
  // Pain Nature (v2.0)
  PainNature,
  PainNatureEvaluation
} from './painTracking';
export {
  // Labels
  EXTENDED_PAIN_AREA_LABELS,
  LATERALIZED_PAIN_AREA_LABELS,
  PAIN_TYPE_LABELS,
  PAIN_CHARACTER_LABELS,
  PAIN_NATURE_LABELS,
  PAIN_NATURE_DESCRIPTIONS,
  // Core evaluation
  getSeverityCategory,
  evaluatePreWorkoutPain,
  evaluatePainNature,
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
  acknowledgeAlert,
  // Special populations
  SPECIAL_POPULATION_GOALS,
  isSpecialPopulation
} from './painTracking';

// Biomechanics Engine - Video Form Analysis
export {
  // Main analyzer
  analyzeExercise,
  CAMERA_SETUP_INSTRUCTIONS,
  SUPPORTED_EXERCISES,
  type AnalysisConfig,
  // Core utilities
  calculateAngle,
  getKneeAngle,
  getHipAngle,
  getTorsoAngle,
  getKneeValgus,
  isSpineNeutral,
  areHeelsDown,
  calculateProportions,
  classifyMorphotype,
  validateCameraAngle,
  distance,
  midpoint,
  // Analyzers
  analyzeSquatFrame,
  analyzeFullSquat,
  analyzeDeadliftFrame,
  analyzeFullDeadlift,
  analyzeBenchFrame,
  analyzeFullBench,
  // Issue Segment Mapping (visual overlay)
  getIssueSegmentMap,
  getVisibleSegments,
  isLandmarkVisible,
  ISSUE_SEGMENT_MAP,
  type IssueSegmentMap,
  type SegmentDefinition,
  type LandmarkKey,
  type CorrectionStrategy
} from './biomechanics';

// Running Program Generator (Aerobic Training)
export {
  generateRunningProgram,
  assessAerobicCapacity
} from './runningProgramGenerator';

// Logger - Environment-aware logging
export {
  logger,
  configureLogger,
  resetLogger,
  type LogLevel,
  type LoggerConfig
} from './logger';

// ============================================================
// PROGRAM GENERATION MODULES (previously fix-01 through fix-09)
// ============================================================

// Baseline Inference (no baseline handling)
export {
  createExerciseWithFallback,
  shouldAutoCalibrateExercise,
  calculateCalibratedWeight,
  type ExerciseWithCalibration,
} from './baselineInference';

// Correctives Distribution
export {
  distributeCorrectivesIntelligently,
  addCorrectivesToDaysIntelligently,
} from './correctiveDistribution';

// DUP for Beginners Safety
export {
  getTargetRIR,
  getDayTypeForLevel,
  getDayTypeLabel,
  getVolumeParamsForDayType,
  MIN_RIR_BY_LEVEL,
  RIR_MATRIX,
} from './dupBeginnerSafety';

// Multi-Goal Distribution
export {
  calculateMultiGoalDistribution,
  applyMultiGoalToExercise,
  generateMultiGoalExplanation,
  type MultiGoalDistribution,
} from './multiGoalDistribution';

// Accessory Volume by Goal
export {
  createAccessoryExerciseAdapted,
  ACCESSORY_PARAMS_BY_GOAL,
  ACCESSORY_NAMES_IT,
} from './accessoryVolume';

// Horizontal Pull Inference
export {
  createHorizontalPullExerciseImproved,
  checkAndAutoCalibrateInferred,
  inferHorizontalPullWeight,
  HORIZONTAL_PULL_CORRELATIONS,
  INFERRED_CALIBRATION_CONFIG,
  type InferredExercise,
  type CalibrationResult,
} from './horizontalPullInference';

// Home Training - No Pull Equipment
export {
  checkHorizontalPullCapability,
  selectHorizontalPullExercise,
  trackPullDebt,
  generatePullDebtWarning,
  HORIZONTAL_PULL_EQUIPMENT,
  PULL_ALTERNATIVES_NO_EQUIPMENT,
  MAKESHIFT_ROW_EXERCISES,
  HOME_EQUIPMENT_QUESTIONS,
  type EquipmentCheckResult,
  type PullDebt,
} from './homeNoPullEquipment';

// RPE/RIR Feedback System
export {
  calculateReadinessScore,
  calculateFeelerSetWeight,
  analyzeFeelerSet,
  isInLearningPeriod,
  handleLearningPeriodFeedback,
  updateUserCalibration,
  analyzeSetFeedback,
  analyzeSessionFeedback,
  getExerciseCategory,
  getRPEDescription,
  getRIRDisplay,
  CALIBRATION_CONFIG,
  RPE_TO_RIR,
  RIR_TO_RPE,
  type SetFeedback,
  type ReadinessCheck,
  type UserCalibration,
  type AdjustmentSuggestion,
  type ExerciseCategory,
} from './rpeFeedbackSystem';

// Auto-Regulation Improvements
export {
  checkLearningPeriod,
  getSessionCountWithExercise,
  calculateWeightedRIR,
  calculateDampedAdjustment,
  calculateNormalizedSessionFatigue,
  analyzeExerciseForAdjustment,
  LEVEL_CONFIG,
  FATIGUE_MULTIPLIERS,
  SET_WEIGHTS,
  type SetData,
  type ExerciseSessionData,
  type AdjustmentResult,
  type LearningPeriodStatus,
  type WeightedRIRResult,
} from './autoRegulation';

// ============================================================
// PROGRAM NORMALIZER UNIFIED (sostituisce programNormalizer.ts e programStructureNormalizer.ts)
// ============================================================

export type {
  NormalizedExercise,
  NormalizedDay,
  NormalizedRunningSession,
  NormalizedWeeklySplit,
  NormalizedProgram,
  StructureType,
} from './programNormalizerUnified';

export {
  // Main functions
  normalizeProgram,
  normalizeOnLoad,
  normalizeMany,
  prepareForSave,

  // Detection
  detectProgramStructure,
  isNormalizedProgram,

  // Getters
  getAllExercises,
  getExercisesForDay,
  getExerciseById,
  getExerciseByName,
  getExercisesByPattern,
  countExercises,

  // Updaters
  updateExerciseInProgram,
  updateExerciseWeight,

  // Legacy compatibility (deprecated)
  needsNormalization,
  isCanonicalFormat,
  findExerciseByName,
} from './programNormalizerUnified';

// Legacy aliases for backward compatibility
// TODO: Remove in v3.0
export {
  detectProgramStructure as detectStructureType,
  isNormalizedProgram as isStructureNormalized,
  normalizeProgram as normalizeToStructure,
  updateExerciseInProgram as updateStructureExercise,
  getExerciseById as getStructureExerciseById,
  getAllExercises as getAllStructureExercises,
} from './programNormalizerUnified';

// Type aliases for backward compatibility
export type {
  NormalizedExercise as StructureNormalizedExercise,
  NormalizedDay as StructureNormalizedDay,
  NormalizedWeeklySplit as StructureNormalizedWeeklySplit,
  NormalizedProgram as StructureNormalizedProgram,
} from './programNormalizerUnified';

// Tempo Modifiers (TUT = AGGRAVANTE)
export type { TempoModifier } from '../data/tempoModifiers';
export {
  TEMPO_MODIFIERS,
  getFirstTUTAggravante,
  getStandardTempo,
  getTempoById,
  formatTempoDisplay,
  getNextHarderTempo,
  isStandardTempo
} from '../data/tempoModifiers';

// RIR Adjustment Logic (Downgrade/Upgrade)
export type {
  ExerciseType,
  LocationType,
  DowngradeInput,
  DowngradeResult,
  ActiveModification,
  UpgradeInput,
  UpgradeResult
} from './rirAdjustmentLogic';
export {
  calculateDowngrade,
  calculateUpgrade,
  isBodyweightExercise as isBodyweightExerciseRIR,
  didUserPushTooHard,
  getEducationalMessage
} from './rirAdjustmentLogic';

// Program Normalizer - Extended functions (now in programNormalizerUnified)
// NOTE: Exports moved to unified section above

// Exercise Progression Engine - Separazione Weighted/Bodyweight
export type {
  ExerciseFeedback,
  ProgressionResult,
  WeightedProgressionResult,
  BodyweightProgressionResult
} from './exerciseProgressionEngine';
export {
  calculateProgression,
  calculateWeightedProgression,
  calculateBodyweightProgression,
  classifyExercise,
  isWeightedExercise,
  getNextVariant,
  getPreviousVariant,
  getExerciseDifficulty,
  getProgressionChain,
  BODYWEIGHT_PROGRESSIONS
} from './exerciseProgressionEngine';

// Goal Mapper - Standardizzazione Goals (UNIFIED - Single Source of Truth)
export type {
  CanonicalGoal,
  DatabaseGoal,
  ProgramGoal,
  GoalConfig
} from './goalMapper';
export {
  toCanonicalGoal,
  toDatabaseGoal,
  toProgramGoal,
  getGoalConfig,
  getDupBias,
  allowsHeavyDays,
  getMaxIntensityForBeginner,
  requiresMedicalClearance,
  isValidGoal,
  getAllGoals,
  getAllValidGoals,
  getCanonicalGoals,
  getGoalsByCategory,
  getRepRangeForGoal,
  getRestTimeForGoal,
  getSetsForGoal,
  getRIRForGoal,
  getIntensityForGoal,
  getVolumeRecommendation,
  migrateGoalValue,
  // Multi-goal support
  normalizeGoal,
  normalizeGoals,
  areGoalsCompatible,
  combineGoalConfigs,
  getSuggestedCombinations,
  // deprecated
  mapGoal, // deprecated - use toProgramGoal
  GOAL_CONFIGS,
  GOAL_MAP, // deprecated - use toCanonicalGoal
  GOAL_MAPPING // deprecated - use GOAL_ALIASES
} from './goalMapper';

// Safety Caps - Centralized Safety Checks
export type {
  DayType as SafetyDayType,
  DiscrepancyType,
  SafetyContext,
  SafetyResult,
  RIRConfig
} from './safetyCaps';
export {
  calculateSafetyLimits,
  applySafetyCap,
  applySafetyCapSimple,
  getTargetRIR as getTargetRIRSafe,
  getRIRConfig,
  getMaxSets,
  canAccessIntensity,
  determineDayType,
  formatSafetyReport,
  createSafetyContext,
  getMaxAllowedIntensity,
  MIN_RIR_BY_LEVEL as SAFETY_MIN_RIR,
  RIR_MATRIX as SAFETY_RIR_MATRIX,
  MAX_SETS_BY_LEVEL as SAFETY_MAX_SETS
} from './safetyCaps';

// Unified Program Generator - Single Entry Point
export type {
  UnifiedProgramOptions,
  UnifiedProgramResult
} from './unifiedProgramGenerator';
export {
  generateProgramUnified,
  generateProgramAPI, // deprecated - use generateProgramUnified
  generateProgramWithSplitLegacy // deprecated - use generateProgramUnified
} from './unifiedProgramGenerator';

// Program Structure Normalizer (V2) - REMOVED
// NOTE: Merged into programNormalizerUnified - see unified section above

// ============================================================
// DCSS PARADIGM - Discomfort & Recovery System
// ============================================================

// Pain Tracking Service (DCSS - choice-based approach)
export type {
  DiscomfortLevel,
  UserChoice,
  DiscomfortReport as DCSSDiscomfortReport,
  AdaptationOption,
  DiscomfortResponse,
  RecoveryProgress as DCSSRecoveryProgress,
  RecoveryTracker
} from './painTrackingServiceDCSS';
export {
  classifyDiscomfort,
  evaluateDiscomfort,
  evaluateDiscomfortChange,
  checkPersistentPattern,
  initializeRecovery,
  updateRecoveryProgress,
  generateRecoverySummary,
  calculateLoadReduction as calculateDCSSLoadReduction,
  getAlternativeExercise,
  TOLERABLE_DISCOMFORT_THRESHOLD,
  PROFESSIONAL_THRESHOLD,
  SESSIONS_FOR_RECOVERY
} from './painTrackingServiceDCSS';

// Discomfort Messages (DCSS educational approach)
export type {
  DiscomfortLevel,
  DiscomfortCategory,
  UserChoice,
  DiscomfortResponse,
  UserOption,
  TolerableDiscomfortInfo,
  PersistentDiscomfortCheck
} from './discomfortMessages';
export {
  categorizeDiscomfort,
  getDiscomfortResponse,
  getTolerableDiscomfortInfo,
  getPostSetDiscomfortOptions,
  checkPersistentDiscomfort,
  getReturnToNormalMessage,
  PRE_WORKOUT_MESSAGES,
  BODY_AREA_LABELS,
  getInSessionDiscomfortResponse,
  getPostExerciseDiscomfortResponse
} from './discomfortMessages';

// Corrective Protocols (DCSS)
export type {
  CorrectiveProtocol,
  CorrectiveExercise
} from './correctiveProtocols';
export {
  HIP_MOBILITY_PROTOCOL,
  ANKLE_MOBILITY_PROTOCOL,
  FLEXION_INTOLERANCE_PROTOCOL,
  EXTENSION_INTOLERANCE_PROTOCOL,
  getCorrectiveProtocol
} from './correctiveProtocols';

// Return to Normal Service (DCSS progressive recovery)
export type {
  RecoveryProgress as RTNRecoveryProgress,
  ProgressionStep,
  ProgressionSuggestion,
  ReturnToNormalResult
} from './returnToNormalService';
export {
  PROGRESSION_CONFIG,
  calculateStartingPercentage,
  canProgressToNextLevel,
  returnToNormalService,
  setSupabaseClient as setRTNSupabaseClient,
  RECOVERY_MESSAGES
} from './returnToNormalService';

// Exercise Analyzers (DCSS biomechanics - educational feedback)
export type {
  AnalysisContext,
  UserMorphotype,
  ObservationSeverity,
  ObservationType,
  FormObservation,
  ROMRange,
  AnalysisResult,
  ExerciseAnalyzer
} from './biomechanics/exerciseAnalyzers';
export {
  SQUAT_ANALYZER,
  DEADLIFT_ANALYZER,
  BENCH_PRESS_ANALYZER,
  BARBELL_ROW_ANALYZER,
  EXERCISE_ANALYZERS,
  getExerciseAnalyzer,
  generateSessionSummary
} from './biomechanics/exerciseAnalyzers';

// ============================================================
// PROGRESSIVE OVERLOAD & VOLUME TRACKING SYSTEMS
// ============================================================

// Body Composition Scoring (Navy Formula - replaces BMI-only)
export type {
  BodyMeasurements as BCBodyMeasurements,
  BodyCompositionResult as BCResult,
  PhysicalScoreResult
} from './bodyCompositionScoring';
export {
  calculateNavyBodyFat,
  estimateBodyFatFromBMI,
  calculateBodyComposition as calculateBCComposition,
  calculatePhysicalScore,
  calculatePhysicalScoreFromOnboarding,
  BodyCompositionScoring
} from './bodyCompositionScoring';

// RIR Calibration by Level (beginners overestimate RIR)
export type {
  UserLevel as RIRUserLevel,
  RIRCalibrationConfig,
  CalibratedRIR,
  AdjustmentDecision
} from './rirCalibration';
export {
  calibrateRIR,
  shouldApplyWeightAdjustment,
  getTargetRIR as getRIRTarget,
  analyzeRIRPattern,
  RIR_CALIBRATION_CONFIG,
  TARGET_RIR_MATRIX,
  RIRCalibration
} from './rirCalibration';

// Progressive Overload (Linear/Double/Wave Periodization + Video Integration)
export type {
  ProgressionStrategy,
  ProgressionConfig,
  ProgressionResult as OverloadProgressionResult,
  WeeklyPlan,
  ExerciseProgressionHistory,
  // Video Integration Types
  VideoLoadRecommendation,
  VideoProgressionResult
} from './progressiveOverload';
export {
  calculateNextWeight,
  // Video Integration Functions
  calculateNextWeightWithVideo,
  applyVideoRecommendation,
  generateProgressionPlanWithVideo,
  // Base Functions
  generateProgressionPlan,
  analyzeProgressionHistory,
  calculateE1RM,
  weightForReps,
  PROGRESSION_CONFIG as OVERLOAD_PROGRESSION_CONFIG,
  EXERCISE_TYPE_MODIFIERS,
  ProgressiveOverload
} from './progressiveOverload';

// Weekly Volume Tracker (sets per muscle group)
export type {
  VolumeStatus,
  VolumeThresholds,
  MuscleGroupVolume,
  VolumeAnalysis,
  ExerciseVolumeContribution
} from './weeklyVolumeTracker';
export {
  calculateWeeklyVolume,
  analyzeWeeklyVolume,
  getExerciseContributions,
  VOLUME_THRESHOLDS,
  PATTERN_MUSCLE_MAP,
  WeeklyVolumeTracker
} from './weeklyVolumeTracker';

// Corrective Exercises DCSS (replaces McGill Big 3)
export type {
  CorrectiveExercise as DCSSCorrectiveExercise,
  CorrectiveProtocol as DCSSCorrectiveProtocol
} from './correctiveExercisesDCSS';
export {
  LOWER_BACK_CORRECTIVES as DCSS_LOWER_BACK_CORRECTIVES,
  CORRECTIVE_MAPPING,
  getCorrectiveExercisesForArea,
  CorrectiveExercisesDCSS
} from './correctiveExercisesDCSS';

// ============================================================
// PAIN DETECT 2.0 - Sistema Unificato Fastidio
// ============================================================

export type {
  BodyArea as PDBodyArea,
  DiscomfortIntensity,
  DiscomfortLevel as PDDiscomfortLevel,
  DiscomfortReport as PDDiscomfortReport,
  DiscomfortResponse as PDDiscomfortResponse,
  DiscomfortTrend,
  ReportPhase,
  UserChoice as PDUserChoice,
  UserOption as PDUserOption,
  LoadReduction as PDLoadReduction,
  PostSetResult,
  ExerciseCheck,
  ROMModification,
  SubstitutionResult,
  RecoveryPhase,
  RecoveryProgress as PDRecoveryProgress,
  PainSessionState,
  ScreeningTrigger,
  ExerciseParams as PDExerciseParams,
  AdaptedExerciseParams,
  UsePainDetectOptions,
  PainHistoryEntry
} from './painDetect';

export {
  // Constants
  PAIN_THRESHOLDS,
  LOAD_REDUCTIONS as PD_LOAD_REDUCTIONS,
  LOAD_REDUCTIONS, // Direct export for backward compatibility
  BODY_AREA_LABELS as PD_BODY_AREA_LABELS,
  DISCLAIMER as PD_DISCLAIMER,
  PAIN_DETECT_DISCLAIMER,
  // Service functions (with aliases for legacy code)
  classifyDiscomfort as pdClassifyDiscomfort,
  evaluateDiscomfort as pdEvaluateDiscomfort,
  applyAdaptations,
  evaluatePostSet as pdEvaluatePostSet,
  checkExercise as pdCheckExercise,
  createDiscomfortReport,
  getLoadReductions,
  // Substitution functions
  findSubstitution,
  isContraindicated as pdIsContraindicated,
  getContraindicatedExercises,
  getSafeExercises,
  findSimilarExercise,
  generateROMModification,
  // React Hook
  usePainDetect
} from './painDetect';

// ============================================================
// QUICK START & CALIBRATION SYSTEM
// ============================================================

// Quick Start Service
export {
  calculateExperienceScore,
  determineInitialLevel,
  getConservativeParams,
  getInitialWeightStrategy,
  calculateInitialWeight,
  calculateFeelerSetWeight as calculateQuickStartFeelerSetWeight,
  analyzeFeelerSetFeedback,
  analyzeRIRPerception,
  calculateWeightAdjustmentFromRIR,
  evaluateRecoveryTrend,
  calculateOverallRIRConsistency,
  calculateAvgSessionRPE,
  shouldUnlockIntermediateMode,
  evaluateTechQuiz,
  createCalibrationData,
  updateCalibrationSession1,
  updateCalibrationSession2,
  updateCalibrationSession3,
  updateCalibrationUnlock,
  analyzeWeeklyChecks,
  mapQuickStartGoalToProgram,
  generateProgramOptionsFromQuickStart,
} from './quickStartService';

// Conservative Program Generator
export type {
  ConservativeProgramOptions,
  ConservativeProgramResult,
  ConservativeProgram,
  CalibrationConfig,
} from './conservativeProgramGenerator';

export {
  generateConservativeProgram,
  generateEmptyBaselines,
  applyCalibrationToProgram,
  programNeedsCalibration,
} from './conservativeProgramGenerator';

// ============================================================
// PREGNANCY SAFETY - Filtro Esercizi Gravidanza (ACOG Guidelines)
// ============================================================

export type {
  Trimester,
  PregnancyContext
} from './pregnancySafety';

export {
  // Core functions
  isPregnancyGoal,
  isExerciseSafeForPregnancy,
  getPregnancySafeAlternative,
  filterExerciseForPregnancy,
  applyPregnancyIntensityCap,
  // Params & Constants
  PREGNANCY_PARAMS,
  PREGNANCY_SAFE_ALTERNATIVES,
  DEFAULT_SAFE_EXERCISES,
  // Aggregated export
  PregnancySafety
} from './pregnancySafety';

// ============================================================
// BEGINNER WEIGHT CAPS - Safety Limits for New Lifters
// ============================================================

export type {
  Level as BeginnerLevel,
  WeightCapResult,
  CapConfiguration
} from './beginnerWeightCaps';

export {
  // Core functions
  applyBeginnerSafetyCap,
  calculateSafeWeight,
  getCapExplanationMessage,
  shouldPromoteFromBeginner,
  // Constants
  BEGINNER_ABSOLUTE_CAPS,
  PATTERN_DEFAULT_CAPS,
  // Aggregated export
  BeginnerWeightCaps
} from './beginnerWeightCaps';

// ============================================================
// TECHNICAL TIPS - Consigli Tecnici con Paywall
// ============================================================

export type {
  SubscriptionTier,
  TechnicalTipsSettings,
  TipsAccessResult,
  TechnicalTip,
  TipFeedback
} from './technicalTips';

export {
  // Access control
  checkTipsAccess,
  canReceiveTips,
  TIERS_WITH_TIPS_ACCESS,
  TIERS_WITHOUT_TIPS_ACCESS,
  MINIMUM_TIER_FOR_TIPS,
  MINIMUM_PRICE_FOR_TIPS,
  // Settings management
  createDefaultTipsSettings,
  updateSettingsFromOnboarding,
  updateSettingsAfterSession1,
  shouldShowSession1Confirmation,
  // Tips database & selection
  TECHNICAL_TIPS_DATABASE,
  getTipForExercise,
  getAllTipsForPattern,
  // Upsell
  UPSELL_MESSAGES,
  getUpsellMessage,
  // Aggregated export
  TechnicalTips
} from './technicalTips';

// ============================================================
// SEVERE PAIN BLOCK - Hard Stop for Pain >= 8/10
// ============================================================

export type {
  PainBlockAction,
  SeverePainBlockResult,
  PainBlockCheck,
  BlockLogEntry
} from './severePainBlock';

export {
  // Core functions
  checkSeverePainBlock,
  exerciseInvolvesArea,
  filterExercisesForPainArea,
  createBlockLogEntry,
  getSkippedExercisesMessage,
  isHardBlockLevel,
  isStrongWarningLevel,
  // Constants
  HARD_BLOCK_THRESHOLD,
  STRONG_WARNING_THRESHOLD,
  BLOCK_ACTION_LABELS,
  // Aggregated export
  SeverePainBlock
} from './severePainBlock';

// ============================================================
// ONE REP MAX CALCULATOR - Evidence-Based (Reynolds 2006, DiStasio 2014)
// ============================================================

export type {
  TestType,
  OneRMPrediction,
  TestTypeInfo
} from './oneRepMaxEvidenceBased';

export {
  // Main function
  calculate1RM,
  // Individual formulas
  brzycki,
  epley,
  mayhew,
  wathen,
  lombardi,
  lander,
  // Inverse calculations
  calculate_nRM_from_1RM,
  generateLoadTable,
  // Comparison utilities
  calculateAllFormulas,
  calculate1RMRange,
  // Config & recommendations
  TEST_TYPES,
  suggestTestType,
  // Aggregated export
  OneRepMaxEvidenceBased
} from './oneRepMaxEvidenceBased';

// ============================================================
// ONE REP MAX CALCULATOR - SSOT (7 formulas + RPE/RIR + VBT + bias)
// ============================================================

export type {
  Formula,
  ExercisePattern,
  UserLevel as OneRMUserLevel,
  OneRMInput,
  OneRMResult,
  PercentageTableRow,
  VBTReference
} from './oneRepMaxCalculator';

export {
  // Main calculator (object input, full result)
  calculate1RM as calculateOneRM,
  // Quick estimate (number-only result)
  estimate1RM,
  // Backward-compatible functions
  calculate1RMFrom5RM,
  calculate5RMFrom1RM,
  calculate1RMFromNRM as calculate1RMFromNRM_SSOT,
  calculateNRMFrom1RM as calculateNRMFrom1RM_SSOT,
  calculatePercentage as calculatePercentage1RM,
  // Percentage table with VBT
  generatePercentageTable,
  VBT_REFERENCE_TABLE,
  estimatePercentageFromVelocity,
  // Safety
  MIN_RM_BY_LEVEL,
  isTestSafe,
  getSafeTestRM
} from './oneRepMaxCalculator';
