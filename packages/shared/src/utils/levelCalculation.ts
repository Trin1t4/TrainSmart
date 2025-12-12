/**
 * CENTRALIZED LEVEL CALCULATION
 *
 * Single source of truth for user level determination.
 * All components should use these functions.
 *
 * Level thresholds are based on practical assessment scores:
 * - Advanced: 75%+ (high competency in all movement patterns)
 * - Intermediate: 55-74% (decent form, some limitations)
 * - Beginner: <55% (needs foundational work)
 */

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface LevelThresholds {
  advanced: number;
  intermediate: number;
}

// Default thresholds based on practical assessment scoring
export const DEFAULT_THRESHOLDS: LevelThresholds = {
  advanced: 75,      // 75%+ = advanced
  intermediate: 55   // 55-74% = intermediate, <55% = beginner
};

/**
 * Calculate user level from a composite score (0-100)
 *
 * @param score - The assessment score (0-100)
 * @param thresholds - Optional custom thresholds
 * @returns The calculated level
 */
export function calculateLevelFromScore(
  score: number | null | undefined,
  thresholds: LevelThresholds = DEFAULT_THRESHOLDS
): Level {
  if (score === null || score === undefined || isNaN(score)) {
    return 'beginner';
  }

  const normalizedScore = Math.max(0, Math.min(100, score));

  if (normalizedScore >= thresholds.advanced) {
    return 'advanced';
  }
  if (normalizedScore >= thresholds.intermediate) {
    return 'intermediate';
  }
  return 'beginner';
}

/**
 * Calculate level from screening data with weighted scores
 *
 * Weights:
 * - Practical tests: 60% (most important - actual movement quality)
 * - Quiz/theoretical: 20% (knowledge of proper form)
 * - Physical parameters: 20% (BMI, age considerations)
 *
 * @param practicalScore - Score from practical movement tests (0-100)
 * @param quizScore - Score from theoretical quiz (0-100)
 * @param physicalScore - Score from physical parameters (0-100)
 * @param isMachinesMode - Whether user selected machines-only mode
 */
export function calculateLevelFromScreening(
  practicalScore: number,
  quizScore: number = 50,
  physicalScore: number = 50,
  isMachinesMode: boolean = false
): { level: Level; finalScore: number } {
  // Machines mode always returns beginner (safety first)
  if (isMachinesMode) {
    return {
      level: 'beginner',
      finalScore: 0
    };
  }

  // Weighted calculation
  const finalScore = (
    quizScore * 0.2 +        // 20% theoretical
    practicalScore * 0.6 +   // 60% practical (PRIMARY)
    physicalScore * 0.2      // 20% physical
  );

  return {
    level: calculateLevelFromScore(finalScore),
    finalScore: Math.round(finalScore * 10) / 10
  };
}

/**
 * Calculate level from pattern baselines (alternative method)
 * Used when we have per-pattern assessment data
 *
 * @param baselines - Object with pattern scores
 */
export function calculateLevelFromBaselines(
  baselines: Record<string, { reps?: number; variantLevel?: number; score?: number }>
): Level {
  if (!baselines || Object.keys(baselines).length === 0) {
    return 'beginner';
  }

  const scores: number[] = [];

  Object.values(baselines).forEach((baseline) => {
    if (baseline.score !== undefined) {
      scores.push(baseline.score);
    } else if (baseline.variantLevel !== undefined) {
      // Convert variant level (1-5) to percentage
      scores.push((baseline.variantLevel / 5) * 100);
    } else if (baseline.reps !== undefined) {
      // Estimate from reps (rough conversion)
      const repScore = Math.min(100, baseline.reps * 5);
      scores.push(repScore);
    }
  });

  if (scores.length === 0) {
    return 'beginner';
  }

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  return calculateLevelFromScore(averageScore);
}

/**
 * Get level metadata
 */
export function getLevelInfo(level: Level): {
  name: string;
  description: string;
  color: string;
  rirRange: [number, number];
} {
  const levelInfo = {
    beginner: {
      name: 'Principiante',
      description: 'Focus su tecnica e fondamentali',
      color: '#22c55e', // green
      rirRange: [3, 4] as [number, number]
    },
    intermediate: {
      name: 'Intermedio',
      description: 'Progressione sistematica con tecniche avanzate',
      color: '#f59e0b', // amber
      rirRange: [2, 3] as [number, number]
    },
    advanced: {
      name: 'Avanzato',
      description: 'Allenamento intensivo con periodizzazione',
      color: '#ef4444', // red
      rirRange: [1, 2] as [number, number]
    }
  };

  return levelInfo[level];
}

export default {
  calculateLevelFromScore,
  calculateLevelFromScreening,
  calculateLevelFromBaselines,
  getLevelInfo,
  DEFAULT_THRESHOLDS
};
