/**
 * EXERCISE PROGRESSION ENGINE
 *
 * Separazione COMPLETA della logica di progressione tra:
 * - WEIGHTED: Progressione tramite peso (powerlifting logic)
 * - BODYWEIGHT: Progressione tramite varianti (calisthenics logic)
 *
 * REGOLA FONDAMENTALE:
 * - Weighted: RIR basso → riduci peso, RIR alto → aumenta peso
 * - Bodyweight: RIR basso → variante più facile, RIR alto → variante più difficile
 *
 * MAI applicare logica di peso a esercizi bodyweight!
 */

// ============================================================================
// TYPES
// ============================================================================

export type ExerciseType = 'weighted' | 'bodyweight' | 'hybrid';
export type ProgressionAction = 'maintain' | 'upgrade' | 'downgrade';
export type LocationType = 'gym' | 'home' | 'home_gym';

export interface ExerciseFeedback {
  exerciseName: string;
  exerciseType: ExerciseType;
  pattern: string;

  // Performance metrics
  targetReps: number;
  completedReps: number;
  targetRIR: number;
  actualRIR: number;
  rpe?: number; // 1-10

  // For weighted exercises
  currentWeight?: number;

  // For bodyweight exercises
  currentDifficulty?: number; // 1-10
  currentVariant?: string;

  // Context
  location: LocationType;
  setNumber?: number;
  isLastSet?: boolean;
}

export interface WeightedProgressionResult {
  action: 'maintain' | 'increase_weight' | 'decrease_weight';
  newWeight?: number;
  weightChangePercent?: number;
  reason: string;
  userMessage: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BodyweightProgressionResult {
  action: 'maintain' | 'upgrade_variant' | 'downgrade_variant';
  newVariant?: string;
  newDifficulty?: number;
  repsAdjustment?: number; // +2 or -2 reps
  reason: string;
  userMessage: string;
  severity: 'info' | 'warning' | 'critical';
  educationalTip?: string;
}

export interface ProgressionResult {
  exerciseType: ExerciseType;
  weighted?: WeightedProgressionResult;
  bodyweight?: BodyweightProgressionResult;
  shouldPersist: boolean;
  nextSessionRecommendation?: string;
}

// ============================================================================
// EXERCISE CLASSIFICATION
// ============================================================================

const BODYWEIGHT_EXERCISES = new Set([
  // Push
  'push-up', 'pushup', 'pike push-up', 'pike pushup', 'diamond push-up',
  'archer push-up', 'one arm push-up', 'handstand push-up', 'hspu',
  'dips', 'parallel dips', 'ring dips',

  // Pull
  'pull-up', 'pullup', 'chin-up', 'chinup', 'muscle-up', 'muscleup',
  'inverted row', 'australian pull-up', 'body row',
  'negative pull-up', 'band assisted pull-up',

  // Legs
  'pistol squat', 'shrimp squat', 'bulgarian split squat', 'bodyweight squat',
  'jump squat', 'box jump', 'step up', 'lunge', 'walking lunge',
  'nordic curl', 'glute bridge', 'single leg glute bridge',
  'sissy squat', 'natural leg curl',

  // Core
  'plank', 'side plank', 'hollow body', 'l-sit', 'v-sit',
  'dragon flag', 'front lever', 'back lever',
  'hanging leg raise', 'toes to bar', 'dead bug',
  'mountain climber', 'burpee'
]);

const WEIGHTED_EXERCISES = new Set([
  // Compound
  'squat', 'back squat', 'front squat', 'goblet squat',
  'deadlift', 'conventional deadlift', 'sumo deadlift', 'romanian deadlift', 'rdl',
  'bench press', 'incline bench', 'decline bench', 'floor press',
  'overhead press', 'military press', 'push press',
  'barbell row', 'pendlay row', 't-bar row',
  'lat pulldown', 'cable row', 'seated row',

  // Isolation
  'bicep curl', 'hammer curl', 'preacher curl',
  'tricep extension', 'skull crusher', 'tricep pushdown',
  'lateral raise', 'front raise', 'rear delt fly',
  'leg press', 'leg extension', 'leg curl', 'calf raise',
  'chest fly', 'cable crossover', 'pec deck'
]);

/**
 * Determine exercise type from name
 */
export function classifyExercise(exerciseName: string): ExerciseType {
  const normalized = exerciseName.toLowerCase().trim();

  // Check hybrid first (weighted + bodyweight name)
  if (normalized.includes('weighted') || normalized.includes('zavorrat')) {
    return 'hybrid'; // e.g., "weighted pull-up"
  }

  // Check specific bodyweight terms first (priority)
  const specificBodyweightTerms = [
    'pistol', 'shrimp', 'bulgarian', 'bodyweight',
    'push-up', 'pushup', 'pull-up', 'pullup', 'chin-up', 'chinup',
    'dips', 'plank', 'l-sit', 'hollow', 'nordic', 'inverted',
    'muscle-up', 'muscleup', 'handstand', 'pike', 'hspu',
    'dead bug', 'bird dog', 'dragon flag'
  ];

  for (const term of specificBodyweightTerms) {
    if (normalized.includes(term)) return 'bodyweight';
  }

  // Check weighted exercises
  for (const w of WEIGHTED_EXERCISES) {
    if (normalized === w || normalized.includes(w) || w.includes(normalized)) {
      return 'weighted';
    }
  }

  // Check remaining bodyweight exercises
  for (const bw of BODYWEIGHT_EXERCISES) {
    if (normalized === bw || normalized.includes(bw) || bw.includes(normalized)) {
      return 'bodyweight';
    }
  }

  // Default - assume bodyweight if unknown
  return 'bodyweight';
}

/**
 * Check if exercise is primarily bodyweight
 */
export function isBodyweightExercise(exerciseName: string): boolean {
  return classifyExercise(exerciseName) === 'bodyweight';
}

/**
 * Check if exercise is primarily weighted
 */
export function isWeightedExercise(exerciseName: string): boolean {
  return classifyExercise(exerciseName) === 'weighted';
}

// ============================================================================
// WEIGHTED PROGRESSION LOGIC
// ============================================================================

const WEIGHT_ADJUSTMENT_CONFIG = {
  tooHard: {
    critical: -3,
    warning: -2
  },
  tooEasy: {
    threshold: 2
  },
  decrease: {
    critical: 20,
    warning: 10
  },
  increase: {
    normal: 5,
    confident: 7.5
  }
};

/**
 * Calculate weighted exercise progression
 */
export function calculateWeightedProgression(feedback: ExerciseFeedback): WeightedProgressionResult {
  const { targetRIR, actualRIR, currentWeight, completedReps, targetReps } = feedback;

  if (!currentWeight || currentWeight <= 0) {
    return {
      action: 'maintain',
      reason: 'No weight data available',
      userMessage: 'Continua con il carico attuale.',
      severity: 'info'
    };
  }

  const rirDelta = actualRIR - targetRIR;
  const completionRate = completedReps / targetReps;

  if (rirDelta <= WEIGHT_ADJUSTMENT_CONFIG.tooHard.critical || completionRate < 0.7) {
    const reduction = WEIGHT_ADJUSTMENT_CONFIG.decrease.critical;
    const newWeight = roundWeight(currentWeight * (1 - reduction / 100));
    return {
      action: 'decrease_weight',
      newWeight,
      weightChangePercent: -reduction,
      reason: `RIR ${actualRIR} vs target ${targetRIR}, completion: ${Math.round(completionRate * 100)}%`,
      userMessage: `🛑 Carico troppo alto! Prossima sessione: ${newWeight}kg (-${reduction}%)`,
      severity: 'critical'
    };
  }

  if (rirDelta <= WEIGHT_ADJUSTMENT_CONFIG.tooHard.warning) {
    const reduction = WEIGHT_ADJUSTMENT_CONFIG.decrease.warning;
    const newWeight = roundWeight(currentWeight * (1 - reduction / 100));
    return {
      action: 'decrease_weight',
      newWeight,
      weightChangePercent: -reduction,
      reason: `RIR ${actualRIR} vs target ${targetRIR}`,
      userMessage: `⚠️ Leggermente pesante. Prossima sessione: ${newWeight}kg (-${reduction}%)`,
      severity: 'warning'
    };
  }

  if (rirDelta >= WEIGHT_ADJUSTMENT_CONFIG.tooEasy.threshold + 1) {
    const increase = WEIGHT_ADJUSTMENT_CONFIG.increase.confident;
    const newWeight = roundWeight(currentWeight * (1 + increase / 100));
    return {
      action: 'increase_weight',
      newWeight,
      weightChangePercent: increase,
      reason: `RIR ${actualRIR} vs target ${targetRIR} - molto facile`,
      userMessage: `💪 Troppo facile! Prossima sessione: ${newWeight}kg (+${increase}%)`,
      severity: 'info'
    };
  }

  if (rirDelta >= WEIGHT_ADJUSTMENT_CONFIG.tooEasy.threshold) {
    const increase = WEIGHT_ADJUSTMENT_CONFIG.increase.normal;
    const newWeight = roundWeight(currentWeight * (1 + increase / 100));
    return {
      action: 'increase_weight',
      newWeight,
      weightChangePercent: increase,
      reason: `RIR ${actualRIR} vs target ${targetRIR}`,
      userMessage: `📈 Pronto per progredire! Prossima sessione: ${newWeight}kg (+${increase}%)`,
      severity: 'info'
    };
  }

  return {
    action: 'maintain',
    reason: `RIR ${actualRIR} nel range target (${targetRIR})`,
    userMessage: `✅ Carico perfetto! Mantieni ${currentWeight}kg.`,
    severity: 'info'
  };
}

function roundWeight(weight: number): number {
  if (weight < 20) {
    return Math.round(weight * 2) / 2;
  } else if (weight < 50) {
    return Math.round(weight / 2.5) * 2.5;
  } else {
    return Math.round(weight / 5) * 5;
  }
}

// ============================================================================
// BODYWEIGHT PROGRESSION LOGIC
// ============================================================================

export const BODYWEIGHT_PROGRESSIONS: Record<string, string[]> = {
  horizontal_push: [
    'Wall Push-up', 'Incline Push-up', 'Knee Push-up', 'Push-up',
    'Diamond Push-up', 'Wide Push-up', 'Decline Push-up', 'Archer Push-up',
    'One Arm Push-up (Assisted)', 'One Arm Push-up'
  ],
  vertical_push: [
    'Pike Push-up (Knee)', 'Pike Push-up', 'Pike Push-up (Elevated)',
    'Box Pike Push-up', 'Wall Handstand Push-up', 'Handstand Push-up (Assisted)',
    'Handstand Push-up', 'Handstand Push-up (Deficit)'
  ],
  horizontal_pull: [
    'Inverted Row (High Bar)', 'Inverted Row (45°)', 'Inverted Row (Horizontal)',
    'Inverted Row (Feet Elevated)', 'Archer Inverted Row',
    'Front Lever Row (Tuck)', 'Front Lever Row'
  ],
  vertical_pull: [
    'Dead Hang', 'Scapular Pull-up', 'Negative Pull-up', 'Band Assisted Pull-up',
    'Pull-up', 'Chest to Bar Pull-up', 'L-Sit Pull-up', 'Weighted Pull-up',
    'Archer Pull-up', 'One Arm Pull-up (Assisted)', 'One Arm Pull-up'
  ],
  lower_push: [
    'Assisted Squat', 'Box Squat', 'Bodyweight Squat', 'Squat (Pause)',
    'Bulgarian Split Squat', 'Shrimp Squat (Assisted)', 'Shrimp Squat',
    'Pistol Squat (Assisted)', 'Pistol Squat', 'Dragon Squat'
  ],
  lower_pull: [
    'Glute Bridge', 'Single Leg Glute Bridge', 'Hip Thrust (BW)',
    'Nordic Curl (Eccentric)', 'Nordic Curl (Partial)', 'Nordic Curl (Assisted)',
    'Nordic Curl', 'Natural Leg Curl'
  ],
  core: [
    'Dead Bug', 'Bird Dog', 'Plank', 'Side Plank', 'Hollow Body Hold',
    'Hollow Body Rock', 'L-Sit (Tucked)', 'L-Sit', 'Hanging Leg Raise',
    'Toes to Bar', 'Dragon Flag (Partial)', 'Dragon Flag'
  ],
  dips: [
    'Bench Dips', 'Bench Dips (Feet Elevated)', 'Parallel Dips (Assisted)',
    'Parallel Dips', 'Ring Dips (Assisted)', 'Ring Dips', 'Weighted Dips', 'Korean Dips'
  ]
};

function findInProgressionChain(exerciseName: string, pattern: string): number {
  const chain = BODYWEIGHT_PROGRESSIONS[pattern];
  if (!chain) return -1;
  const normalized = exerciseName.toLowerCase();
  return chain.findIndex(ex => {
    const chainNormalized = ex.toLowerCase();
    return chainNormalized.includes(normalized) || normalized.includes(chainNormalized);
  });
}

function getExerciseAtPosition(pattern: string, position: number): string | null {
  const chain = BODYWEIGHT_PROGRESSIONS[pattern];
  if (!chain || position < 0 || position >= chain.length) return null;
  return chain[position];
}

/**
 * Calculate bodyweight exercise progression
 */
export function calculateBodyweightProgression(feedback: ExerciseFeedback): BodyweightProgressionResult {
  const { exerciseName, pattern, targetRIR, actualRIR, completedReps, targetReps } = feedback;

  const rirDelta = actualRIR - targetRIR;
  const completionRate = completedReps / targetReps;
  const currentPosition = findInProgressionChain(exerciseName, pattern);

  if (rirDelta <= -2 || completionRate < 0.7) {
    const newPosition = Math.max(0, currentPosition - 1);
    const newVariant = getExerciseAtPosition(pattern, newPosition);

    if (newVariant && newVariant !== exerciseName) {
      return {
        action: 'downgrade_variant',
        newVariant,
        newDifficulty: newPosition + 1,
        repsAdjustment: 2,
        reason: `RIR ${actualRIR} vs target ${targetRIR}, completion ${Math.round(completionRate * 100)}%`,
        userMessage: `🔄 Proviamo una variante più accessibile: ${newVariant}`,
        severity: rirDelta <= -3 ? 'critical' : 'warning',
        educationalTip: 'Nel calisthenics, la progressione avviene tramite varianti più difficili, non tramite peso.'
      };
    }
    return {
      action: 'downgrade_variant',
      repsAdjustment: -2,
      reason: 'Già alla variante più facile',
      userMessage: `⚠️ Riduci a ${Math.max(3, targetReps - 2)} reps per migliorare la qualità.`,
      severity: 'warning',
      educationalTip: 'Sei alla variante base. Concentrati sulla qualità del movimento.'
    };
  }

  if (rirDelta >= 3 && completionRate >= 1.0) {
    const chain = BODYWEIGHT_PROGRESSIONS[pattern] || [];
    const newPosition = Math.min(chain.length - 1, currentPosition + 1);
    const newVariant = getExerciseAtPosition(pattern, newPosition);

    if (newVariant && newVariant !== exerciseName) {
      return {
        action: 'upgrade_variant',
        newVariant,
        newDifficulty: newPosition + 1,
        repsAdjustment: -2,
        reason: `RIR ${actualRIR} vs target ${targetRIR} - molto facile`,
        userMessage: `🚀 Pronto per la progressione! Prova: ${newVariant}`,
        severity: 'info',
        educationalTip: `Hai padroneggiato ${exerciseName}. La prossima sfida è ${newVariant}.`
      };
    }
  }

  if (rirDelta >= 2 && completionRate >= 1.0) {
    const chain = BODYWEIGHT_PROGRESSIONS[pattern] || [];
    const newPosition = currentPosition + 1;
    const newVariant = getExerciseAtPosition(pattern, newPosition);

    if (newVariant) {
      return {
        action: 'upgrade_variant',
        newVariant,
        newDifficulty: newPosition + 1,
        reason: `RIR ${actualRIR} vs target ${targetRIR}`,
        userMessage: `📈 Buon lavoro! Prossima sessione prova: ${newVariant}`,
        severity: 'info',
        educationalTip: 'Quando completi tutte le reps con reps in riserva, è il momento di progredire.'
      };
    }
    return {
      action: 'maintain',
      repsAdjustment: 2,
      reason: 'Variante massima raggiunta',
      userMessage: `💪 Sei alla variante avanzata! Prova ${targetReps + 2} reps.`,
      severity: 'info',
      educationalTip: 'Hai raggiunto la variante più avanzata. Aumenta le ripetizioni o rallenta il tempo.'
    };
  }

  return {
    action: 'maintain',
    reason: `RIR ${actualRIR} nel range target`,
    userMessage: `✅ Ottimo! Continua con ${exerciseName}.`,
    severity: 'info'
  };
}

// ============================================================================
// UNIFIED PROGRESSION FUNCTION
// ============================================================================

export function calculateProgression(feedback: ExerciseFeedback): ProgressionResult {
  const exerciseType = feedback.exerciseType || classifyExercise(feedback.exerciseName);

  if (exerciseType === 'weighted') {
    const weighted = calculateWeightedProgression(feedback);
    return {
      exerciseType: 'weighted',
      weighted,
      shouldPersist: weighted.action !== 'maintain',
      nextSessionRecommendation: weighted.userMessage
    };
  }

  if (exerciseType === 'bodyweight') {
    const bodyweight = calculateBodyweightProgression(feedback);
    return {
      exerciseType: 'bodyweight',
      bodyweight,
      shouldPersist: bodyweight.action !== 'maintain',
      nextSessionRecommendation: bodyweight.userMessage
    };
  }

  // Hybrid
  if (feedback.currentWeight && feedback.currentWeight > 0) {
    const weighted = calculateWeightedProgression(feedback);
    return {
      exerciseType: 'hybrid',
      weighted,
      shouldPersist: weighted.action !== 'maintain',
      nextSessionRecommendation: weighted.userMessage
    };
  } else {
    const bodyweight = calculateBodyweightProgression(feedback);
    return {
      exerciseType: 'hybrid',
      bodyweight,
      shouldPersist: bodyweight.action !== 'maintain',
      nextSessionRecommendation: bodyweight.userMessage
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getNextVariant(exerciseName: string, pattern: string): string | null {
  const position = findInProgressionChain(exerciseName, pattern);
  if (position === -1) return null;
  return getExerciseAtPosition(pattern, position + 1);
}

export function getPreviousVariant(exerciseName: string, pattern: string): string | null {
  const position = findInProgressionChain(exerciseName, pattern);
  if (position <= 0) return null;
  return getExerciseAtPosition(pattern, position - 1);
}

export function getExerciseDifficulty(exerciseName: string, pattern: string): number {
  const chain = BODYWEIGHT_PROGRESSIONS[pattern];
  if (!chain) return 5;
  const position = findInProgressionChain(exerciseName, pattern);
  if (position === -1) return 5;
  return Math.round((position / (chain.length - 1)) * 9) + 1;
}

export function getProgressionChain(pattern: string): string[] {
  return BODYWEIGHT_PROGRESSIONS[pattern] || [];
}

export default {
  classifyExercise,
  isBodyweightExercise,
  isWeightedExercise,
  calculateProgression,
  calculateWeightedProgression,
  calculateBodyweightProgression,
  getNextVariant,
  getPreviousVariant,
  getExerciseDifficulty,
  getProgressionChain,
  BODYWEIGHT_PROGRESSIONS
};
