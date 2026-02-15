/**
 * Types - Export Centrale
 * Import centralizzato: import { OnboardingData, Program, etc } from '@trainsmart/shared'
 */

// Onboarding
export type {
  TrainingLocation,
  TrainingType,
  EquipmentPreference,
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
  InjuryRecord,
  // Medical Restrictions
  MedicalRestrictionArea,
  MedicalRestriction,
  MedicalRestrictionsData,
  // Running/Aerobic
  RunningGoal,
  RunningIntegration,
  RunningCapacity,
  RunningPreferences,
  SeasonPhase,
} from './onboarding.types';

// Program & Screening
export type {
  PatternId,
  PatternBaseline,
  PatternBaselines,
  ScreeningData,
  WarmupSetDetail,
  WarmupSet,
  SupersetConfig,
  Exercise,
  DayType,
  DayWorkout,
  WeeklySplit,
  WeekProgram,
  ProgressionStrategy,
  Program,
  WeeklySchedule,
  WorkoutExercise,
  VolumeCalculation,
} from './program.types';

// Rehabilitation & Pain Tracking - DEPRECATED
// Use discomfortTracking.types or exerciseAdaptation.types instead
// Old exports removed - see Discomfort Tracking and Exercise Adaptation sections below

// Discomfort Tracking (Simplified - fitness-first)
export type {
  TrackedBodyArea as DiscomfortBodyArea,
  DiscomfortRecord,
  DiscomfortSummary,
  DiscomfortStatus,
  ReportDiscomfortResponse,
  ReportDiscomfortInput,
} from './discomfortTracking.types';

export {
  TRACKED_BODY_AREAS as DISCOMFORT_BODY_AREAS,
  BODY_AREA_LABELS as DISCOMFORT_AREA_LABELS,
  SESSIONS_FOR_PROFESSIONAL_ADVICE,
  STANDARD_LOAD_REDUCTION,
  RECURRING_LOAD_REDUCTION,
} from './discomfortTracking.types';

// Exercise Adaptation (with levels - fitness-first)
export type {
  AdaptationLevel,
  AdaptationStatus,
  ActiveAdaptation,
  AdaptationSession,
  AdaptationExerciseLog,
  AdaptationExercise,
  AdaptationRoutine,
  DiscomfortTracking,
  AdaptationDashboardCard,
  RespondToAdaptationResponse,
  CompleteAdaptationSessionResponse,
  CompleteAdaptationResponse,
  RespondToAdaptationInput,
  CompleteAdaptationSessionInput,
} from './exerciseAdaptation.types';

export {
  ADAPTATION_LEVELS,
  DISCOMFORT_THRESHOLD,
  SESSIONS_TO_LEVEL_UP,
  SESSIONS_TO_RESOLVE,
} from './exerciseAdaptation.types';

// Social Features
export type {
  // User Profile
  UserProfileSocial,
  // Followers
  FollowStatus,
  Follower,
  FollowerWithProfile,
  FollowStats,
  // Personal Records
  RecordType,
  PersonalRecord,
  PersonalRecordHistory,
  PRSummary,
  PRDetectionResult,
  // Achievements
  AchievementCategory,
  AchievementRequirementType,
  AchievementRarity,
  Achievement,
  UserAchievement,
  AchievementProgress,
  AchievementUnlockEvent,
  // Social Posts
  PostType,
  PostVisibility,
  SocialPost,
  WorkoutCompletedMetadata,
  PRAchievedMetadata,
  StreakMilestoneMetadata,
  AchievementUnlockedMetadata,
  PostMetadata,
  PostLike,
  PostComment,
  // Streaks
  WorkoutStreak,
  StreakMilestone,
  // Share Cards
  ShareCardType,
  ShareCardData,
  WorkoutShareCardData,
  PRShareCardData,
  StreakShareCardData,
  AchievementShareCardData,
  // Sharing
  SharePlatform,
  ShareOptions,
  ShareResult,
  // Feed
  FeedFilters,
  FeedPagination,
  FeedResponse,
  // Service Responses
  SocialServiceResponse,
  FollowResponse,
  LikeResponse,
  CommentResponse,
  // Notifications
  NotificationType,
  SocialNotification,
} from './social.types';

// Biomechanics Engine Types
export type {
  PoseLandmark,
  PoseLandmarks,
  UserProportions,
  Morphotype,
  MorphotypeType,
  SquatImplications,
  DeadliftImplications,
  BenchImplications,
  ExercisePhase,
  IssueSeverity,
  IssueType,
  Issue,
  BarPath,
  FrameAngles,
  FrameAnalysis,
  StickingPosition,
  StickingPointDiagnosis,
  StickingPointRecommendations,
  StickingPointAnalysis,
  SupportedExercise,
  AnalysisRecommendations,
  FormAnalysisResult,
  SideAnalysis,
  Asymmetry,
  BilateralComparison,
  CameraPosition,
  CameraHeight,
  VideoSetupInstructions,
  CameraValidationResult,
  SafetyCheck,
  EfficiencyCheck,
  RecurringIssue,
  AdaptFlowWarning,
  AdaptFlowIntegration,
  FrameLandmarkSnapshot,
} from './biomechanics.types';

// Running / Aerobic Training Types
export type {
  RunningLevel,
  RunningIntensity,
  HeartRateZone,
  RunningInterval,
  RunningSession,
  RunningWeek,
  RunningProgram,
  RunningSessionLog,
  RunningWeeklySummary,
  RunningProgressData,
  AerobicAssessment,
} from './running.types';

export {
  HR_ZONES,
  estimateHRMax,
  getZone2Range,
  determineRunningLevel,
} from './running.types';

// Quick Start (nuovo onboarding 3 minuti)
export type {
  QuickStartGoal,
  QuickStartLocation,
  ExperienceLevel,
  QuickStartExperience,
  QuickStartData,
  InitialLevel,
  ConservativeProgramParams,
  BodyweightStrategy,
  WeightedStrategy,
  InitialWeightStrategy,
  FeelerSetFeedback,
  FeelerSetResult,
  Session1Calibration,
  RIRPerception,
  Session2Calibration,
  RecoveryTrend,
  PainEvolution,
  Session3Calibration,
  UnlockAssessment,
  CalibrationData,
  PainReport,
  SessionExerciseData,
  SessionData,
  WeeklySkipReason,
  WeeklyCheck,
  FeelerSetConfig,
  TechQuizQuestion,
  TechQuizResult,
} from './quickStart.types';

export {
  FEELER_SET_OPTIONS,
  CALIBRATION_SESSIONS_REQUIRED,
  EXPERIENCE_SCORE_MAP,
  CONSERVATIVE_PARAMS,
  INITIAL_WEIGHT_ESTIMATES,
  RIR_CONSISTENCY_THRESHOLD,
  MAX_SESSION_RPE_FOR_UNLOCK,
} from './quickStart.types';
