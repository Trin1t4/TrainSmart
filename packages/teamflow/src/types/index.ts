/**
 * Types - Export Centrale
 * Import centralizzato: import { OnboardingData, Program, etc } from '@/types'
 */

// Onboarding
export type {
  TrainingLocation,
  TrainingType,
  Goal,
  Level,
  PersonalInfo,
  Equipment,
  ActivityLevel,
  PainArea,
  PainSeverity,
  PainEntry,
  OnboardingData,
  CompleteOnboardingData,
} from './onboarding.types';

// Program & Screening
export type {
  PatternId,
  PatternBaseline,
  PatternBaselines,
  ScreeningData,
  Exercise,
  Program,
  WeeklySchedule,
  WorkoutExercise,
  VolumeCalculation,
} from './program.types';

// Team Management
export type {
  UserMode,
  TeamRole,
  Team,
  TeamMember,
  PlayerData,
  TeamProgram,
  TeamInvite,
  CreateTeamForm,
  AddPlayerForm,
  ModeSelectionState,
} from './team.types';

// Pain Tracking System (re-exported from @trainsmart/shared)
// Complete system with lateralized areas, recovery plans, DOMS detection, etc.
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
  // Pain Management
  PainExerciseMapping,
  DeloadResult,
  NormalizedPainArea,
} from '@trainsmart/shared';
