/**
 * Service layer exports for TrainSmart
 *
 * All services use dependency injection for the Supabase client.
 * Each platform (web/mobile) should initialize the services with their
 * respective Supabase client instance.
 *
 * Usage:
 * ```typescript
 * import { initProgramService, createProgram } from '@trainsmart/shared';
 * import { supabase } from './supabaseClient';
 *
 * // Initialize once at app startup
 * initProgramService(supabase);
 *
 * // Then use the service functions
 * const result = await createProgram(programData);
 * ```
 */

// Program Service
export {
  initProgramService,
  createProgram,
  getActiveProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  setActiveProgram,
  completeProgram,
  clearProgramCache,
  migrateLocalStorageToSupabase,
  syncProgramsFromCloud,
  type TrainingProgram,
  type ProgramServiceResponse,
} from './programService';

// Auto-Regulation Service
export {
  initAutoRegulationService,
  logWorkout,
  createWorkoutLog,
  addExerciseLog,
  completeWorkout,
  analyzeRPE,
  getExercisesNeedingAdjustment,
  applyAutoRegulation,
  applyAdjustmentToProgram,
  getPendingAdjustments,
  rejectAdjustment,
  postponeAdjustment,
  acceptAndApplyAdjustment,
  getRecentWorkouts,
  getWorkoutExercises,
  getAdjustmentHistory,
  type WorkoutLog,
  type WorkoutLogInput,
  type ExerciseLog,
  type RPEAnalysis,
  type ExerciseAdjustment,
  type ProgramAdjustment,
} from './autoRegulationService';

// Admin Service
export {
  initAdminService,
  isAdmin,
  getUserRole,
  getBusinessMetrics,
  getAggregatedMetrics,
  getUsersAnalytics,
  getRPETrends,
  getProgramPopularity,
  getAdminDashboardData,
  grantAdminRole,
  getAllUserRoles,
  type UserRole,
  type BusinessMetrics,
  type UserAnalytics,
  type RPETrend,
  type ProgramPopularity,
  type AdminDashboardData,
} from './adminService';

// Streak Service
export {
  initStreakService,
  getStreak,
  updateStreak,
  getStreakMilestones,
  checkNewMilestone,
  resetStreak,
  getStreakLeaderboard,
  recalculateStreak,
  STREAK_MILESTONES,
} from './streakService';

// Personal Records Service
export {
  initPersonalRecordsService,
  getAllPRs,
  getPRByExercise,
  getPRHistory,
  checkForNewPR,
  createOrUpdatePR,
  getRecentPRs,
  getPRSummary,
  getPRCount,
  deletePR,
  getPRLeaderboard,
} from './personalRecordsService';

// Achievement Service
export {
  initAchievementService,
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  unlockAchievement,
  checkAndUnlockAchievements,
  markAchievementShared,
  getAchievementLeaderboard,
} from './achievementService';

// Follow Service
export {
  initFollowService,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  isFollowing,
  searchUsers,
} from './followService';

// Social Service
export {
  initSocialService,
  createPost,
  getPost,
  getFeed,
  getUserPosts,
  getFollowingFeed,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
} from './socialService';

// Pain Tracking Service - DEPRECATED: Use discomfortTrackingService instead
// Old exports removed - see Discomfort Tracking Service section below

// Rehabilitation Service - DEPRECATED: Use exerciseAdaptationService instead
// Old exports removed - see Exercise Adaptation Service section below

// Default exports for convenience
export { default as autoRegulationService } from './autoRegulationService';
export { default as streakService } from './streakService';
export { default as personalRecordsService } from './personalRecordsService';
export { default as achievementService } from './achievementService';
export { default as followService } from './followService';
export { default as socialService } from './socialService';

// Free Weight Suggestion Service
export {
  shouldSuggestFreeWeight,
  isInOptimalCondition,
  getUserMachinePreference,
  findFreeWeightAlternative,
  markSuggestionShown,
  recordSuggestionResponse,
  // Nuove funzioni per transizione automatica e tracking
  updatePreferencesToFreeWeights,
  hasCompletedTransition,
  recordExercisePerformance,
  getTransitionProgress,
  getAllTransitionProgress,
  calculateSuggestedWeight,
  comparePerformance,
  type RecoveryConditions,
  type FreeWeightSuggestion,
  type ExerciseProgressRecord,
  type MachineToFreeWeightProgress,
} from './freeWeightSuggestionService';

// Skip Tracking Service
export {
  initSkipTrackingService,
  patternToMuscleGroup,
  logExerciseSkip,
  getActiveAlerts,
  acknowledgeSkipAlert,
  getSkipStats,
  checkSkipPattern,
  getRecentSkips,
  calculateLoadReduction as calculateSkipLoadReduction,
  generateSkipFeedback,
  MUSCLE_GROUP_NAMES,
  type SkipReason,
  type MuscleGroup,
  type ExerciseSkip,
  type SkipPatternAlert,
  type SkipStats,
} from './skipTrackingService';
export { default as skipTrackingService } from './skipTrackingService';

// Progressive Workout Service
export {
  initProgressiveWorkoutService,
  startWorkout as startProgressiveWorkout,
  saveSet as saveProgressiveSet,
  updateProgress as updateProgressiveProgress,
  completeWorkout as completeProgressiveWorkout,
  abandonWorkout as abandonProgressiveWorkout,
  getInProgressWorkout,
  getWorkoutSets,
  hasInProgressWorkout,
  getWorkoutResumeSummary,
  // Video Analysis Integration
  getLatestVideoAnalysis,
  getLastCompletedWeight,
  getUserTrainingLevel,
  getSuggestedWeightForExercise,
  getSuggestedWeightsForWorkout,
  applyVideoRecommendationToExercise,
  // Corrective Exercises from Video
  getVideoCorrectiveExercisesFromVideo,
  addVideoCorrectiveExercisesToProgram,
  getAllVideoRecommendations,
  // Types
  type WorkoutSession as ProgressiveWorkoutSession,
  type SetLog as ProgressiveSetLog,
  type StartWorkoutInput,
  type VideoCorrection,
  type SuggestedWeight,
  type VideoCorrectiveExercise,
  type VideoCorrectiveData,
} from './progressiveWorkoutService';
export { default as progressiveWorkoutService } from './progressiveWorkoutService';

// Baseline Inference Service - Stima pesi mancanti dai pattern correlati
export {
  inferMissingBaselines,
  isPatternEstimated,
  calculateWeightAdjustment,
  shouldValidateEstimatedWeight,
} from './baselineInferenceService';
export { default as baselineInferenceService } from './baselineInferenceService';

// Discomfort Tracking Service (Simplified - fitness-first)
export {
  initDiscomfortService,
  reportDiscomfort,
  getDiscomfortStatus,
  getLoadMultiplierForArea,
  hasActiveDiscomfort,
  clearDiscomfort,
  clearAllDiscomfort,
  isExerciseAffectedByDiscomfort,
  getExerciseLoadMultiplier,
  AREA_TO_EXERCISE_CATEGORIES,
  DISCOMFORT_DISCLAIMER as DISCOMFORT_SERVICE_DISCLAIMER,
  // Legacy aliases
  initRehabilitationService as initDiscomfortRehabService,
  initPainTrackingService as initDiscomfortPainService,
  reportWorkoutPain as reportDiscomfortPain,
  getPainStatus as getDiscomfortPainStatus,
  resetPainTracking as resetDiscomfortTracking,
} from './discomfortTrackingService';

// Exercise Adaptation Service (with levels - fitness-first)
export {
  initAdaptationService,
  getAdaptationRoutine,
  getExercisesForLevel,
  startAdaptation,
  completeAdaptationSession,
  getAdaptationDashboard,
  ADAPTATION_ROUTINES,
  // Legacy aliases
  initRehabilitationService as initExerciseAdaptationRehabService,
  REHABILITATION_PROGRAMS as ADAPTATION_PROGRAMS_LEGACY,
  getRehabilitationProgram as getAdaptationProgram,
  startRehabilitation as startAdaptationRehab,
  completeRehabSession as completeAdaptationSessionRehab,
  getRehabilitationDashboard as getAdaptationDashboardRehab,
} from './exerciseAdaptationService';

// GDPR Compliance Service
export {
  initGDPRService,
  hasRequiredConsents,
  hasHealthDataConsent,
  saveConsents,
  getConsents,
  revokeConsent,
  calculateAge,
  isOldEnough,
  saveAgeVerification,
  runDataRetentionCleanup,
  requestDataExport,
  generateDataExport,
  requestAccountDeletion,
  confirmAccountDeletion,
  cancelAccountDeletion,
  processScheduledDeletions,
  requiresHealthConsent,
  getHealthConsentText,
  MINIMUM_AGE_BY_COUNTRY,
  DATA_RETENTION_POLICIES,
  LEGAL_DOCUMENT_VERSIONS,
  HEALTH_DATA_FIELDS,
  type ConsentTypes,
  type ConsentRecord,
  type UserConsentProfile,
  type RetentionPolicy,
  type UserDataExport,
  type DeletionRequest,
} from './gdprComplianceService';

// Centralized Service Initialization
export {
  initAllServices,
  areServicesInitialized,
  resetServicesForTesting,
  type InitServicesOptions,
} from './initAllServices';

// Exercise Modification Service
export {
  saveModification,
  updateModification,
  removeModification,
  getActiveModifications,
  getModificationForExercise,
  resetModificationsForProgram,
  countActiveModifications,
  type ExerciseModification,
  type SaveModificationInput,
} from './exerciseModificationService';

// Screening Data Persistence Service
export {
  initScreeningPersistence,
  saveScreeningToLocal,
  loadScreeningFromLocal,
  clearScreeningLocal,
  saveScreeningWithSync,
  syncScreeningData,
  validateScreeningData,
  normalizeScreeningData,
  inferMissingBaselines as inferMissingScreeningBaselines,
  type ScreeningData,
  type ScreeningSyncResult,
} from './screeningDataPersistence';

// Unified Wellness Service
export {
  initWellnessService,
  calculateWellnessScore,
  calculateWorkoutReadiness,
  processPainEvent,
  shouldModifyExercise,
  saveSessionWellness,
  getPainHistory,
  analyzePainTrends,
  type WellnessAssessment,
  type WorkoutReadiness,
  type PainEvent,
  type WorkoutAdaptation,
  type SessionWellnessData,
  type PainArea as WellnessPainArea,
  type PainRestriction,
} from './unifiedWellnessService';
