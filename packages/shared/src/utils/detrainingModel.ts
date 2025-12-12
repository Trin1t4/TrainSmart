/**
 * EVIDENCE-BASED DETRAINING MODEL
 *
 * Based on scientific literature on training cessation effects:
 *
 * References:
 * - Mujika & Padilla (2000) "Detraining: Loss of Training-Induced Physiological and Performance Adaptations"
 * - McMaster et al. (2013) "The Development, Retention and Decay Rates of Strength and Power"
 * - Bosquet et al. (2013) "Effect of Training Cessation on Muscular Performance"
 *
 * Key findings:
 * 1. Strength decays slower than power/endurance
 * 2. Beginners retain gains longer than advanced athletes
 * 3. Neural adaptations decay faster than muscular adaptations
 * 4. Eccentric strength is retained longer than concentric
 * 5. Type I fibers (endurance) decay faster than Type II (strength)
 */

import { Level } from '../types';

export type TrainingGoal = 'strength' | 'muscle_gain' | 'endurance' | 'power' | 'fat_loss' | 'general';

export interface DetrainingConfig {
  /** Days since last workout */
  daysSinceTraining: number;
  /** User's training level */
  level: Level;
  /** Primary training goal */
  goal: TrainingGoal;
  /** Months of consistent training before break */
  trainingHistory?: number;
}

export interface DetrainingResult {
  /** Multiplier for training volume (0.5 - 1.0) */
  volumeMultiplier: number;
  /** Multiplier for training intensity (0.5 - 1.0) */
  intensityMultiplier: number;
  /** Estimated strength retention percentage (0-100) */
  strengthRetention: number;
  /** Estimated endurance retention percentage (0-100) */
  enduranceRetention: number;
  /** Recommended re-adaptation weeks */
  reAdaptationWeeks: number;
  /** Specific recommendations */
  recommendations: string[];
  /** Risk level for injury */
  injuryRisk: 'low' | 'moderate' | 'high';
}

/**
 * Decay curves based on scientific literature
 *
 * Strength decay curve (McMaster et al., 2013):
 * - Week 1-2: ~2% loss
 * - Week 2-4: ~5-10% loss
 * - Week 4-8: ~10-15% loss
 * - Week 8+: ~15-25% loss (plateau)
 *
 * Endurance decay curve (Mujika & Padilla, 2000):
 * - Week 1-2: ~4-7% VO2max loss
 * - Week 2-4: ~10-15% loss
 * - Week 4-8: ~15-25% loss
 * - Week 8+: ~25-35% loss
 */

interface DecayCurve {
  /** Days threshold */
  days: number;
  /** Retention percentage at this point */
  retention: number;
}

export const STRENGTH_DECAY_CURVE: Record<Level, DecayCurve[]> = {
  beginner: [
    { days: 7, retention: 100 },   // Beginners retain better short-term
    { days: 14, retention: 98 },
    { days: 21, retention: 95 },
    { days: 28, retention: 90 },
    { days: 42, retention: 85 },
    { days: 56, retention: 80 },
    { days: 84, retention: 75 },   // 12 weeks
  ],
  intermediate: [
    { days: 7, retention: 99 },
    { days: 14, retention: 96 },
    { days: 21, retention: 92 },
    { days: 28, retention: 88 },
    { days: 42, retention: 82 },
    { days: 56, retention: 76 },
    { days: 84, retention: 70 },
  ],
  advanced: [
    { days: 7, retention: 98 },    // Advanced athletes lose gains faster
    { days: 14, retention: 94 },
    { days: 21, retention: 88 },
    { days: 28, retention: 83 },
    { days: 42, retention: 75 },
    { days: 56, retention: 68 },
    { days: 84, retention: 60 },
  ]
};

export const ENDURANCE_DECAY_CURVE: Record<Level, DecayCurve[]> = {
  beginner: [
    { days: 7, retention: 98 },
    { days: 14, retention: 93 },
    { days: 21, retention: 87 },
    { days: 28, retention: 80 },
    { days: 42, retention: 72 },
    { days: 56, retention: 65 },
    { days: 84, retention: 55 },
  ],
  intermediate: [
    { days: 7, retention: 96 },
    { days: 14, retention: 90 },
    { days: 21, retention: 82 },
    { days: 28, retention: 75 },
    { days: 42, retention: 65 },
    { days: 56, retention: 58 },
    { days: 84, retention: 48 },
  ],
  advanced: [
    { days: 7, retention: 95 },
    { days: 14, retention: 87 },
    { days: 21, retention: 78 },
    { days: 28, retention: 70 },
    { days: 42, retention: 58 },
    { days: 56, retention: 50 },
    { days: 84, retention: 40 },
  ]
};

export const MUSCLE_MASS_DECAY_CURVE: Record<Level, DecayCurve[]> = {
  beginner: [
    { days: 7, retention: 100 },
    { days: 14, retention: 99 },
    { days: 21, retention: 97 },
    { days: 28, retention: 95 },
    { days: 42, retention: 92 },
    { days: 56, retention: 88 },
    { days: 84, retention: 82 },
  ],
  intermediate: [
    { days: 7, retention: 100 },
    { days: 14, retention: 98 },
    { days: 21, retention: 95 },
    { days: 28, retention: 92 },
    { days: 42, retention: 87 },
    { days: 56, retention: 82 },
    { days: 84, retention: 75 },
  ],
  advanced: [
    { days: 7, retention: 99 },
    { days: 14, retention: 96 },
    { days: 21, retention: 92 },
    { days: 28, retention: 88 },
    { days: 42, retention: 80 },
    { days: 56, retention: 73 },
    { days: 84, retention: 65 },
  ]
};

/**
 * Interpolate retention from decay curve
 */
function interpolateRetention(days: number, curve: DecayCurve[]): number {
  if (days <= 0) return 100;

  // Find the two points to interpolate between
  let lowerPoint = curve[0];
  let upperPoint = curve[curve.length - 1];

  for (let i = 0; i < curve.length - 1; i++) {
    if (days >= curve[i].days && days <= curve[i + 1].days) {
      lowerPoint = curve[i];
      upperPoint = curve[i + 1];
      break;
    }
    if (days < curve[i].days) {
      // Before first point - assume 100%
      return 100;
    }
  }

  // Beyond last point - use last value with continued decay
  if (days > curve[curve.length - 1].days) {
    const lastRetention = curve[curve.length - 1].retention;
    const daysExtra = days - curve[curve.length - 1].days;
    // Slow decay beyond last point (0.1% per day)
    return Math.max(50, lastRetention - daysExtra * 0.1);
  }

  // Linear interpolation
  const ratio = (days - lowerPoint.days) / (upperPoint.days - lowerPoint.days);
  return lowerPoint.retention + ratio * (upperPoint.retention - lowerPoint.retention);
}

/**
 * Calculate detraining effects based on scientific evidence
 */
export function calculateDetraining(config: DetrainingConfig): DetrainingResult {
  const { daysSinceTraining, level, goal, trainingHistory = 6 } = config;

  // Get appropriate decay curves based on goal
  let primaryCurve: DecayCurve[];
  let secondaryCurve: DecayCurve[];

  switch (goal) {
    case 'strength':
    case 'power':
      primaryCurve = STRENGTH_DECAY_CURVE[level];
      secondaryCurve = ENDURANCE_DECAY_CURVE[level];
      break;
    case 'endurance':
    case 'fat_loss':
      primaryCurve = ENDURANCE_DECAY_CURVE[level];
      secondaryCurve = STRENGTH_DECAY_CURVE[level];
      break;
    case 'muscle_gain':
      primaryCurve = MUSCLE_MASS_DECAY_CURVE[level];
      secondaryCurve = STRENGTH_DECAY_CURVE[level];
      break;
    default:
      primaryCurve = STRENGTH_DECAY_CURVE[level];
      secondaryCurve = ENDURANCE_DECAY_CURVE[level];
  }

  // Calculate retentions
  const strengthRetention = interpolateRetention(daysSinceTraining, STRENGTH_DECAY_CURVE[level]);
  const enduranceRetention = interpolateRetention(daysSinceTraining, ENDURANCE_DECAY_CURVE[level]);
  const primaryRetention = interpolateRetention(daysSinceTraining, primaryCurve);

  // Training history modifier (longer training = better retention)
  const historyModifier = Math.min(1.1, 1 + (trainingHistory - 6) * 0.01);

  // Calculate multipliers
  // Volume: reduce more aggressively to prevent overreaching
  const volumeMultiplier = Math.max(0.5, Math.min(1.0,
    (primaryRetention / 100) * 0.9 * historyModifier
  ));

  // Intensity: keep relatively high to maintain neural adaptations
  const intensityMultiplier = Math.max(0.6, Math.min(1.0,
    (primaryRetention / 100) * 0.95 * historyModifier
  ));

  // Re-adaptation weeks needed
  let reAdaptationWeeks: number;
  if (daysSinceTraining <= 7) {
    reAdaptationWeeks = 0;
  } else if (daysSinceTraining <= 14) {
    reAdaptationWeeks = 1;
  } else if (daysSinceTraining <= 28) {
    reAdaptationWeeks = 2;
  } else if (daysSinceTraining <= 56) {
    reAdaptationWeeks = 3;
  } else {
    reAdaptationWeeks = Math.min(6, Math.ceil(daysSinceTraining / 14));
  }

  // Injury risk assessment
  let injuryRisk: 'low' | 'moderate' | 'high';
  if (daysSinceTraining <= 7) {
    injuryRisk = 'low';
  } else if (daysSinceTraining <= 21) {
    injuryRisk = 'moderate';
  } else {
    injuryRisk = level === 'advanced' ? 'high' : 'moderate';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (daysSinceTraining <= 7) {
    recommendations.push('Riprendi normalmente, nessun detraining significativo');
  } else if (daysSinceTraining <= 14) {
    recommendations.push('Prima sessione: 80% del volume normale');
    recommendations.push('Evita cedimento muscolare per 2-3 sessioni');
  } else if (daysSinceTraining <= 28) {
    recommendations.push('Settimana 1: 60% volume, 85% intensità');
    recommendations.push('Settimana 2: 80% volume, 95% intensità');
    recommendations.push('Focus su tecnica e connessione mente-muscolo');
  } else {
    recommendations.push(`Programma di ri-adattamento di ${reAdaptationWeeks} settimane`);
    recommendations.push('Inizia con 50% volume, aumenta 10% a settimana');
    recommendations.push('Mantieni intensità moderata (RPE 6-7)');
    recommendations.push('Aumenta il riscaldamento specifico');

    if (goal === 'strength' || goal === 'power') {
      recommendations.push('Privilegia esercizi composti a ROM ridotto inizialmente');
    }
    if (goal === 'endurance') {
      recommendations.push('Ricostruisci la base aerobica prima di lavori HIIT');
    }
  }

  // Level-specific recommendations
  if (level === 'advanced' && daysSinceTraining > 14) {
    recommendations.push('⚠️ Atleta avanzato: rischio infortunio elevato, procedi con cautela');
  }

  return {
    volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
    intensityMultiplier: Math.round(intensityMultiplier * 100) / 100,
    strengthRetention: Math.round(strengthRetention * historyModifier),
    enduranceRetention: Math.round(enduranceRetention * historyModifier),
    reAdaptationWeeks,
    recommendations,
    injuryRisk
  };
}

/**
 * Get detraining factor for simple use cases
 * Returns a single multiplier (0.5 - 1.0) for backward compatibility
 */
export function getDetrainingFactor(
  daysSinceTraining: number,
  level: Level = 'intermediate',
  goal: TrainingGoal = 'general'
): number {
  const result = calculateDetraining({ daysSinceTraining, level, goal });
  // Return average of volume and intensity for simple use
  return (result.volumeMultiplier + result.intensityMultiplier) / 2;
}

/**
 * Calculate days until significant detraining begins
 * Useful for showing warnings to users
 */
export function getDaysUntilDetraining(level: Level): number {
  switch (level) {
    case 'beginner':
      return 14; // Beginners have more buffer
    case 'intermediate':
      return 10;
    case 'advanced':
      return 7; // Advanced athletes detrain faster
    default:
      return 10;
  }
}

export default {
  calculateDetraining,
  getDetrainingFactor,
  getDaysUntilDetraining,
  STRENGTH_DECAY_CURVE,
  ENDURANCE_DECAY_CURVE,
  MUSCLE_MASS_DECAY_CURVE
};
