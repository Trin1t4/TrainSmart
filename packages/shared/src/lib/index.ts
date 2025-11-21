/**
 * Service layer exports for FitnessFlow
 *
 * All services use dependency injection for the Supabase client.
 * Each platform (web/mobile) should initialize the services with their
 * respective Supabase client instance.
 *
 * Usage:
 * ```typescript
 * import { initProgramService, createProgram } from '@fitnessflow/shared';
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

// Default exports for convenience
export { default as autoRegulationService } from './autoRegulationService';
