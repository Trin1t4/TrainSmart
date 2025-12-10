/**
 * EVIDENCE-BASED PAIN LOAD REDUCTION
 *
 * Based on Pain Science and Sports Medicine literature:
 *
 * References:
 * - Smith et al. (2017) "A Framework for Rehabilitation of Athletes with Pain"
 * - Moseley & Butler (2015) "Explain Pain Supercharged"
 * - Rio et al. (2016) "Isometric Exercise for Tendinopathy Pain Relief"
 * - Littlewood et al. (2015) "Exercise for Tendinopathy"
 *
 * Key principles:
 * 1. Pain ≠ Damage (central sensitization, fear-avoidance)
 * 2. Movement is medicine (graded exposure)
 * 3. Pain during exercise acceptable if:
 *    - Not exceeding 3-4/10 during
 *    - Returns to baseline within 24h
 *    - No progressive worsening
 * 4. Chronic pain requires different approach than acute
 * 5. Context matters (sport, history, psychology)
 */

export type PainType = 'acute' | 'subacute' | 'chronic' | 'doms' | 'unknown';
export type PainCharacter = 'sharp' | 'dull' | 'burning' | 'throbbing' | 'aching' | 'stiffness';
export type PainTiming = 'constant' | 'movement_only' | 'after_exercise' | 'morning_stiffness' | 'load_dependent';
export type MovementPhase = 'eccentric' | 'concentric' | 'isometric' | 'all_phases' | 'end_range';

export interface PainAssessment {
  /** Pain intensity 0-10 VAS */
  intensity: number;
  /** Type based on duration */
  type: PainType;
  /** Character of pain */
  character?: PainCharacter;
  /** When pain occurs */
  timing?: PainTiming;
  /** Body area affected */
  area: string;
  /** Does pain increase during exercise? */
  increasesDuringExercise?: boolean;
  /** Does pain return to baseline within 24h? */
  returnsToBaseline24h?: boolean;
  /** Has pain been progressively worsening? */
  progressiveWorsening?: boolean;
  /** Which movement phase triggers pain? */
  triggerPhase?: MovementPhase;
  /** Previous injury history */
  hasInjuryHistory?: boolean;
  /** Is there swelling/inflammation? */
  hasSwelling?: boolean;
}

export interface LoadReductionResult {
  /** Volume multiplier (0.0 - 1.0, where 0 = skip exercise) */
  volumeMultiplier: number;
  /** Intensity multiplier (0.0 - 1.0) */
  intensityMultiplier: number;
  /** Rest multiplier (1.0 - 2.0) */
  restMultiplier: number;
  /** ROM restriction recommendation */
  romRestriction?: 'full' | 'partial' | 'isometric_only' | 'avoid';
  /** Acceptable pain threshold during exercise (0-10) */
  acceptablePainThreshold: number;
  /** Should completely skip affected exercises? */
  skipExercise: boolean;
  /** Specific modifications */
  modifications: string[];
  /** Warning messages */
  warnings: string[];
  /** When to seek medical attention */
  redFlags: string[];
  /** Confidence level of recommendation */
  confidence: 'high' | 'moderate' | 'low';
}

/**
 * RED FLAGS - Immediate medical attention required
 * Based on clinical screening guidelines
 */
const RED_FLAG_PATTERNS: Array<{ check: (p: PainAssessment) => boolean; message: string }> = [
  {
    check: (p) => p.intensity >= 9 && p.type === 'acute' && p.hasSwelling === true,
    message: '⚠️ STOP: Dolore acuto severo con gonfiore - Consulta un medico'
  },
  {
    check: (p) => p.progressiveWorsening === true && p.type === 'chronic',
    message: '⚠️ Dolore cronico in peggioramento - Valutazione medica raccomandata'
  },
  {
    check: (p) => p.character === 'sharp' && p.timing === 'constant' && p.intensity >= 7,
    message: '⚠️ Dolore costante e acuto - Non allenarti, consulta specialista'
  },
  {
    check: (p) => p.area.toLowerCase().includes('chest') || p.area.toLowerCase().includes('petto'),
    message: '⚠️ Dolore toracico - Escludi cause cardiache prima di allenarti'
  }
];

/**
 * Pain type classification based on duration
 */
export function classifyPainType(daysWithPain: number): PainType {
  if (daysWithPain <= 3) return 'acute';
  if (daysWithPain <= 14) return 'subacute';
  if (daysWithPain > 90) return 'chronic';
  return 'subacute';
}

/**
 * Determine if pain is likely DOMS vs pathological
 */
export function isDOMS(assessment: PainAssessment): boolean {
  return (
    assessment.timing === 'morning_stiffness' &&
    assessment.character === 'aching' &&
    assessment.intensity <= 5 &&
    assessment.returnsToBaseline24h !== false &&
    !assessment.hasSwelling
  );
}

/**
 * Calculate evidence-based load reduction
 *
 * Algorithm based on:
 * 1. Pain intensity (primary factor)
 * 2. Pain type (acute vs chronic - different approaches)
 * 3. Pain behavior (increases/decreases with exercise)
 * 4. 24h response (key indicator)
 * 5. Progressive worsening (red flag)
 */
export function calculatePainLoadReduction(assessment: PainAssessment): LoadReductionResult {
  const result: LoadReductionResult = {
    volumeMultiplier: 1.0,
    intensityMultiplier: 1.0,
    restMultiplier: 1.0,
    acceptablePainThreshold: 4, // Default: pain up to 4/10 acceptable
    skipExercise: false,
    modifications: [],
    warnings: [],
    redFlags: [],
    confidence: 'moderate'
  };

  // Check for red flags first
  RED_FLAG_PATTERNS.forEach(flag => {
    if (flag.check(assessment)) {
      result.redFlags.push(flag.message);
    }
  });

  // If red flags present, recommend skipping
  if (result.redFlags.length > 0) {
    result.skipExercise = true;
    result.volumeMultiplier = 0;
    result.intensityMultiplier = 0;
    result.confidence = 'high';
    return result;
  }

  // Check if likely DOMS
  if (isDOMS(assessment)) {
    result.modifications.push('DOMS rilevato - allenamento attivo aiuta il recupero');
    result.volumeMultiplier = 0.8;
    result.intensityMultiplier = 0.7;
    result.acceptablePainThreshold = 5;
    result.confidence = 'high';
    return result;
  }

  // ========================================
  // INTENSITY-BASED REDUCTION (Primary factor)
  // ========================================

  if (assessment.intensity <= 2) {
    // Minimal pain - proceed with minor adjustments
    result.volumeMultiplier = 0.95;
    result.intensityMultiplier = 0.95;
    result.acceptablePainThreshold = 4;
    result.modifications.push('Dolore minimo - procedi con attenzione');
    result.confidence = 'high';
  }
  else if (assessment.intensity <= 4) {
    // Mild pain - moderate reduction
    result.volumeMultiplier = 0.75;
    result.intensityMultiplier = 0.80;
    result.restMultiplier = 1.25;
    result.acceptablePainThreshold = 4;
    result.modifications.push('Riduci range of motion se necessario');
    result.confidence = 'high';
  }
  else if (assessment.intensity <= 6) {
    // Moderate pain - significant reduction
    result.volumeMultiplier = 0.50;
    result.intensityMultiplier = 0.65;
    result.restMultiplier = 1.5;
    result.acceptablePainThreshold = 3;
    result.romRestriction = 'partial';
    result.modifications.push('Evita il range di movimento doloroso');
    result.modifications.push('Considera varianti isometriche');
    result.confidence = 'moderate';
  }
  else if (assessment.intensity <= 8) {
    // High pain - minimal loading
    result.volumeMultiplier = 0.25;
    result.intensityMultiplier = 0.40;
    result.restMultiplier = 2.0;
    result.acceptablePainThreshold = 2;
    result.romRestriction = 'isometric_only';
    result.modifications.push('Solo esercizi isometrici a bassa intensità');
    result.warnings.push('Valuta se è opportuno allenarti oggi');
    result.confidence = 'moderate';
  }
  else {
    // Severe pain - skip
    result.skipExercise = true;
    result.volumeMultiplier = 0;
    result.intensityMultiplier = 0;
    result.romRestriction = 'avoid';
    result.warnings.push('Dolore troppo intenso - salta questo esercizio');
    result.confidence = 'high';
  }

  // ========================================
  // TYPE-BASED ADJUSTMENTS
  // ========================================

  if (assessment.type === 'acute') {
    // Acute pain: be more conservative
    result.volumeMultiplier *= 0.8;
    result.intensityMultiplier *= 0.8;
    result.acceptablePainThreshold = Math.min(result.acceptablePainThreshold, 3);
    result.modifications.push('Dolore acuto: approccio conservativo');
  }
  else if (assessment.type === 'chronic') {
    // Chronic pain: graded exposure approach
    // Research shows movement helps chronic pain
    result.volumeMultiplier = Math.max(0.5, result.volumeMultiplier * 1.1);
    result.acceptablePainThreshold = Math.min(5, result.acceptablePainThreshold + 1);
    result.modifications.push('Dolore cronico: esposizione graduale raccomandata');
    result.modifications.push('Monitora risposta nelle 24h successive');
  }

  // ========================================
  // BEHAVIOR-BASED ADJUSTMENTS
  // ========================================

  // Pain that increases during exercise
  if (assessment.increasesDuringExercise === true) {
    result.volumeMultiplier *= 0.7;
    result.acceptablePainThreshold = Math.max(2, result.acceptablePainThreshold - 1);
    result.warnings.push('Se il dolore aumenta oltre 3/10, ferma l\'esercizio');
  }

  // Pain that doesn't return to baseline in 24h
  if (assessment.returnsToBaseline24h === false) {
    result.volumeMultiplier *= 0.6;
    result.intensityMultiplier *= 0.7;
    result.warnings.push('Il dolore non è rientrato - riduci ulteriormente');
    result.confidence = 'low';
  }

  // Progressive worsening
  if (assessment.progressiveWorsening === true) {
    result.volumeMultiplier *= 0.5;
    result.intensityMultiplier *= 0.6;
    result.warnings.push('Peggioramento progressivo - considera pausa o consulto medico');
    result.confidence = 'low';
  }

  // ========================================
  // MOVEMENT PHASE MODIFICATIONS
  // ========================================

  if (assessment.triggerPhase) {
    switch (assessment.triggerPhase) {
      case 'eccentric':
        result.modifications.push('Evita fase eccentrica lenta - usa concentrico + drop');
        break;
      case 'concentric':
        result.modifications.push('Riduci esplosività concentrica');
        break;
      case 'end_range':
        result.romRestriction = 'partial';
        result.modifications.push('Limita il range di movimento');
        break;
      case 'isometric':
        result.modifications.push('Evita pause in posizione statica');
        break;
    }
  }

  // ========================================
  // SWELLING CHECK
  // ========================================

  if (assessment.hasSwelling) {
    result.volumeMultiplier *= 0.5;
    result.warnings.push('Gonfiore presente - possibile infiammazione attiva');
    if (assessment.type === 'acute') {
      result.skipExercise = true;
      result.redFlags.push('Gonfiore acuto - riposo e ghiaccio raccomandati');
    }
  }

  // Ensure multipliers stay in valid range
  result.volumeMultiplier = Math.max(0, Math.min(1, result.volumeMultiplier));
  result.intensityMultiplier = Math.max(0, Math.min(1, result.intensityMultiplier));
  result.restMultiplier = Math.max(1, Math.min(2, result.restMultiplier));

  // Round to 2 decimal places
  result.volumeMultiplier = Math.round(result.volumeMultiplier * 100) / 100;
  result.intensityMultiplier = Math.round(result.intensityMultiplier * 100) / 100;
  result.restMultiplier = Math.round(result.restMultiplier * 100) / 100;

  return result;
}

/**
 * Simple load reduction for backward compatibility
 * Maps pain intensity (0-10) to load reduction percentage
 */
export function getSimplePainReduction(painIntensity: number): number {
  const result = calculatePainLoadReduction({
    intensity: painIntensity,
    type: 'unknown',
    area: 'general'
  });

  return Math.round((1 - result.volumeMultiplier) * 100);
}

/**
 * Check if exercise should be modified for pain area
 */
export function shouldModifyForPain(
  exerciseName: string,
  painArea: string,
  painIntensity: number
): { modify: boolean; suggestion: string } {
  const exerciseLower = exerciseName.toLowerCase();
  const painLower = painArea.toLowerCase();

  // Pain area to exercise mapping
  const painExerciseMap: Record<string, string[]> = {
    'knee': ['squat', 'leg press', 'lunge', 'affondi', 'leg extension', 'leg curl', 'step'],
    'ginocchio': ['squat', 'leg press', 'lunge', 'affondi', 'leg extension', 'leg curl', 'step'],
    'lower_back': ['deadlift', 'stacco', 'good morning', 'row', 'rematore', 'back extension'],
    'schiena': ['deadlift', 'stacco', 'good morning', 'row', 'rematore', 'back extension'],
    'shoulder': ['press', 'military', 'alzate', 'raise', 'dip', 'bench', 'panca'],
    'spalla': ['press', 'military', 'alzate', 'raise', 'dip', 'bench', 'panca'],
    'hip': ['squat', 'deadlift', 'lunge', 'hip thrust', 'abductor', 'adductor'],
    'anca': ['squat', 'deadlift', 'lunge', 'hip thrust', 'abductor', 'adductor'],
    'wrist': ['curl', 'push-up', 'plank', 'front squat', 'clean'],
    'polso': ['curl', 'push-up', 'plank', 'front squat', 'clean'],
    'elbow': ['curl', 'tricep', 'push-up', 'press', 'pull'],
    'gomito': ['curl', 'tricep', 'push-up', 'press', 'pull']
  };

  const affectedExercises = painExerciseMap[painLower] || [];
  const isAffected = affectedExercises.some(ex => exerciseLower.includes(ex));

  if (!isAffected) {
    return { modify: false, suggestion: '' };
  }

  // Determine modification based on intensity
  if (painIntensity >= 7) {
    return {
      modify: true,
      suggestion: `Sostituisci ${exerciseName} con un\'alternativa che non coinvolga ${painArea}`
    };
  } else if (painIntensity >= 4) {
    return {
      modify: true,
      suggestion: `Riduci carico e ROM per ${exerciseName}, monitora il dolore`
    };
  } else {
    return {
      modify: true,
      suggestion: `Procedi con cautela per ${exerciseName}, ferma se il dolore supera 4/10`
    };
  }
}

export default {
  calculatePainLoadReduction,
  getSimplePainReduction,
  shouldModifyForPain,
  classifyPainType,
  isDOMS
};
