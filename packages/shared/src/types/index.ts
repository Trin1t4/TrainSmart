/**
 * Types - Export Centrale
 * Import centralizzato: import { OnboardingData, Program, etc } from '@trainsmart/shared'
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
  WarmupSetDetail,
  WarmupSet,
  SupersetConfig,
  Exercise,
  DayWorkout,
  WeeklySplit,
  Program,
  WeeklySchedule,
  WorkoutExercise,
  VolumeCalculation,
} from './program.types';

// Rehabilitation & Pain Tracking
export type {
  TrackedBodyArea,
  RehabilitationStatus,
  RehabilitationPhase,
  PainTracking,
  PainTrackingSummary,
  ActiveRehabilitation,
  RehabilitationSession,
  RehabilitationExerciseLog,
  RehabilitationExercise,
  RehabilitationProgram,
  ReportPainResponse,
  RespondToRehabilitationResponse,
  CompleteRehabSessionResponse,
  CompleteRehabilitationResponse,
  ReportPainInput,
  RespondToRehabilitationInput,
  CompleteRehabSessionInput,
  RehabilitationDashboardCard,
} from './rehabilitation.types';

export {
  TRACKED_BODY_AREAS,
  PAIN_TO_REHAB_MAPPING,
  REHABILITATION_PHASES,
  BODY_AREA_LABELS,
} from './rehabilitation.types';

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
} from './biomechanics.types';
