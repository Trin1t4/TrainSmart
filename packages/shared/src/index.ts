/**
 * @trainsmart/shared
 * Codice condiviso tra web e mobile
 */

export * from './types';
export * from './utils';
export * from './i18n';
export * from './lib';

// Calisthenics Progressions - SINGLE SOURCE OF TRUTH
export {
  CALISTHENICS_PATTERNS,
  getPatternById,
  getProgressionById,
  getProgressionByName,
  getProgressionByDifficulty,
  getNextProgression,
  getPreviousProgression,
  getAllVariantsForPattern,
  progressionToVariant
} from './data/calisthenicsProgressions';
export type { CalisthenicsPattern, CalisthenicsProgression } from './data/calisthenicsProgressions';
