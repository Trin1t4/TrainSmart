/**
 * Pain Detect 2.0 - Exercise Substitution
 *
 * Sistema di sostituzione esercizi basato su aree corporee e pattern di movimento.
 */

import {
  BodyArea,
  DiscomfortIntensity,
  SubstitutionResult,
  ROMModification,
  PAIN_THRESHOLDS,
} from './painDetectTypes';

// =============================================================================
// EXERCISE PATTERNS & ALTERNATIVES
// =============================================================================

interface ExercisePattern {
  primaryMuscles: string[];
  movementPattern: string;
  involvedAreas: BodyArea[];
  alternatives: string[];
  reducedROMOption?: string;
}

const EXERCISE_PATTERNS: Record<string, ExercisePattern> = {
  // === UPPER BODY PUSH ===
  'Bench Press': {
    primaryMuscles: ['chest', 'triceps', 'front_delt'],
    movementPattern: 'horizontal_push',
    involvedAreas: ['shoulder', 'chest', 'elbow', 'wrist'],
    alternatives: ['Incline Dumbbell Press', 'Push-ups', 'Cable Fly', 'Machine Chest Press'],
    reducedROMOption: 'Floor Press',
  },
  'Overhead Press': {
    primaryMuscles: ['shoulders', 'triceps'],
    movementPattern: 'vertical_push',
    involvedAreas: ['shoulder', 'elbow', 'wrist', 'lower_back'],
    alternatives: ['Landmine Press', 'Arnold Press', 'Lateral Raises', 'Front Raises'],
    reducedROMOption: 'Partial Range Overhead Press',
  },
  'Push-ups': {
    primaryMuscles: ['chest', 'triceps', 'front_delt'],
    movementPattern: 'horizontal_push',
    involvedAreas: ['shoulder', 'chest', 'elbow', 'wrist'],
    alternatives: ['Wall Push-ups', 'Incline Push-ups', 'Knee Push-ups', 'Bench Press'],
  },
  'Dips': {
    primaryMuscles: ['chest', 'triceps'],
    movementPattern: 'vertical_push',
    involvedAreas: ['shoulder', 'chest', 'elbow'],
    alternatives: ['Close-grip Bench Press', 'Tricep Pushdown', 'Diamond Push-ups'],
  },

  // === UPPER BODY PULL ===
  'Pull-ups': {
    primaryMuscles: ['lats', 'biceps', 'rear_delt'],
    movementPattern: 'vertical_pull',
    involvedAreas: ['shoulder', 'elbow', 'wrist'],
    alternatives: ['Lat Pulldown', 'Assisted Pull-ups', 'Inverted Rows', 'Cable Pullover'],
    reducedROMOption: 'Partial Pull-ups',
  },
  'Barbell Row': {
    primaryMuscles: ['lats', 'rhomboids', 'biceps'],
    movementPattern: 'horizontal_pull',
    involvedAreas: ['shoulder', 'elbow', 'wrist', 'lower_back'],
    alternatives: ['Cable Row', 'Dumbbell Row', 'Machine Row', 'Chest-Supported Row'],
  },
  'Lat Pulldown': {
    primaryMuscles: ['lats', 'biceps'],
    movementPattern: 'vertical_pull',
    involvedAreas: ['shoulder', 'elbow'],
    alternatives: ['Assisted Pull-ups', 'Cable Pullover', 'Straight-arm Pulldown'],
  },

  // === LEGS ===
  'Squat': {
    primaryMuscles: ['quads', 'glutes', 'hamstrings'],
    movementPattern: 'squat',
    involvedAreas: ['knee', 'hip', 'lower_back', 'ankle'],
    alternatives: ['Leg Press', 'Goblet Squat', 'Box Squat', 'Bulgarian Split Squat'],
    reducedROMOption: 'Half Squat',
  },
  'Deadlift': {
    primaryMuscles: ['hamstrings', 'glutes', 'erectors'],
    movementPattern: 'hip_hinge',
    involvedAreas: ['lower_back', 'hip', 'knee'],
    alternatives: ['Romanian Deadlift', 'Hip Thrust', 'Cable Pull-through', 'Trap Bar Deadlift'],
    reducedROMOption: 'Block Pull',
  },
  'Leg Press': {
    primaryMuscles: ['quads', 'glutes'],
    movementPattern: 'squat',
    involvedAreas: ['knee', 'hip'],
    alternatives: ['Hack Squat', 'Goblet Squat', 'Leg Extension + Leg Curl'],
  },
  'Lunges': {
    primaryMuscles: ['quads', 'glutes'],
    movementPattern: 'lunge',
    involvedAreas: ['knee', 'hip', 'ankle'],
    alternatives: ['Split Squat', 'Step-ups', 'Reverse Lunges', 'Leg Press'],
  },
  'Romanian Deadlift': {
    primaryMuscles: ['hamstrings', 'glutes'],
    movementPattern: 'hip_hinge',
    involvedAreas: ['lower_back', 'hip'],
    alternatives: ['Lying Leg Curl', 'Good Mornings', 'Cable Pull-through', 'Nordic Curl'],
  },
  'Leg Extension': {
    primaryMuscles: ['quads'],
    movementPattern: 'knee_extension',
    involvedAreas: ['knee'],
    alternatives: ['Sissy Squat', 'Terminal Knee Extension', 'Wall Sit'],
  },
  'Leg Curl': {
    primaryMuscles: ['hamstrings'],
    movementPattern: 'knee_flexion',
    involvedAreas: ['knee'],
    alternatives: ['Nordic Curl', 'Glute-Ham Raise', 'Stability Ball Leg Curl'],
  },

  // === CORE ===
  'Plank': {
    primaryMuscles: ['core'],
    movementPattern: 'anti_extension',
    involvedAreas: ['lower_back', 'shoulder', 'wrist'],
    alternatives: ['Dead Bug', 'Bird Dog', 'Side Plank', 'Pallof Press'],
  },
  'Crunches': {
    primaryMuscles: ['abs'],
    movementPattern: 'spinal_flexion',
    involvedAreas: ['neck', 'lower_back'],
    alternatives: ['Dead Bug', 'Reverse Crunch', 'Cable Crunch', 'Hollow Body Hold'],
  },

  // === SHOULDERS ===
  'Lateral Raises': {
    primaryMuscles: ['side_delt'],
    movementPattern: 'shoulder_abduction',
    involvedAreas: ['shoulder'],
    alternatives: ['Cable Lateral Raise', 'Machine Lateral Raise', 'Upright Row'],
    reducedROMOption: 'Partial Lateral Raises',
  },
  'Face Pulls': {
    primaryMuscles: ['rear_delt', 'rhomboids'],
    movementPattern: 'external_rotation',
    involvedAreas: ['shoulder', 'elbow'],
    alternatives: ['Rear Delt Fly', 'Band Pull-apart', 'Reverse Pec Deck'],
  },

  // === ARMS ===
  'Bicep Curl': {
    primaryMuscles: ['biceps'],
    movementPattern: 'elbow_flexion',
    involvedAreas: ['elbow', 'wrist'],
    alternatives: ['Hammer Curl', 'Cable Curl', 'Preacher Curl', 'Concentration Curl'],
  },
  'Tricep Extension': {
    primaryMuscles: ['triceps'],
    movementPattern: 'elbow_extension',
    involvedAreas: ['elbow', 'shoulder'],
    alternatives: ['Tricep Pushdown', 'Close-grip Bench Press', 'Skull Crushers'],
  },
};

// =============================================================================
// AREA-SPECIFIC CONTRAINDICATIONS
// =============================================================================

const AREA_CONTRAINDICATIONS: Record<BodyArea, string[]> = {
  shoulder: [
    'Overhead Press',
    'Lateral Raises',
    'Pull-ups',
    'Dips',
    'Upright Row',
    'Behind-neck Press',
  ],
  elbow: [
    'Tricep Extension',
    'Skull Crushers',
    'Close-grip Bench Press',
    'Preacher Curl',
  ],
  wrist: [
    'Barbell Curl',
    'Wrist Curl',
    'Push-ups',
    'Front Squat',
  ],
  upper_back: [
    'Barbell Row',
    'Deadlift',
    'Face Pulls',
    'Shrugs',
  ],
  lower_back: [
    'Deadlift',
    'Good Mornings',
    'Barbell Row',
    'Squat',
    'Romanian Deadlift',
  ],
  hip: [
    'Squat',
    'Lunges',
    'Hip Thrust',
    'Leg Press',
    'Deadlift',
  ],
  knee: [
    'Squat',
    'Lunges',
    'Leg Extension',
    'Leg Press',
    'Running',
  ],
  ankle: [
    'Squat',
    'Lunges',
    'Calf Raises',
    'Running',
    'Jump Squats',
  ],
  neck: [
    'Shoulder Shrugs',
    'Crunches',
    'Neck Extension',
    'Behind-neck Press',
  ],
  chest: [
    'Bench Press',
    'Push-ups',
    'Dips',
    'Cable Fly',
  ],
};

// =============================================================================
// SAFE ALTERNATIVES BY AREA
// =============================================================================

const SAFE_ALTERNATIVES_BY_AREA: Record<BodyArea, string[]> = {
  shoulder: [
    'Chest-Supported Row',
    'Cable Fly',
    'Machine Chest Press',
    'Leg exercises',
  ],
  elbow: [
    'Machine exercises',
    'Cable exercises with neutral grip',
    'Leg exercises',
  ],
  wrist: [
    'Dumbbell exercises',
    'EZ-bar exercises',
    'Machines',
    'Leg exercises',
  ],
  upper_back: [
    'Machine Row',
    'Chest-Supported Row',
    'Cable exercises',
  ],
  lower_back: [
    'Machine exercises',
    'Seated exercises',
    'Chest-Supported Row',
    'Leg Press',
    'Leg Extension',
    'Leg Curl',
  ],
  hip: [
    'Leg Extension',
    'Leg Curl',
    'Calf Raises',
    'Upper body exercises',
  ],
  knee: [
    'Hip Thrust',
    'Glute Bridge',
    'Romanian Deadlift',
    'Upper body exercises',
  ],
  ankle: [
    'Seated exercises',
    'Machine exercises',
    'Upper body exercises',
  ],
  neck: [
    'Most exercises with proper positioning',
    'Machine exercises',
  ],
  chest: [
    'Back exercises',
    'Leg exercises',
    'Core exercises',
  ],
};

// =============================================================================
// MAIN SUBSTITUTION FUNCTION
// =============================================================================

/**
 * Trova un esercizio sostitutivo sicuro
 */
export function findSubstitution(
  exerciseName: string,
  painArea: BodyArea,
  intensity: DiscomfortIntensity,
  availableEquipment?: string[]
): SubstitutionResult {
  // Normalizza il nome dell'esercizio
  const normalizedName = normalizeExerciseName(exerciseName);

  // Cerca il pattern dell'esercizio
  const pattern = EXERCISE_PATTERNS[normalizedName];

  if (!pattern) {
    // Esercizio non trovato nel database
    return {
      found: false,
      rationale: `No substitution data available for "${exerciseName}". Consider a general alternative for the same muscle group.`,
      rationaleIt: `Nessun dato di sostituzione disponibile per "${exerciseName}". Considera un'alternativa generale per lo stesso gruppo muscolare.`,
    };
  }

  // Verifica se l'esercizio coinvolge l'area dolorosa
  if (!pattern.involvedAreas.includes(painArea)) {
    return {
      found: false,
      rationale: `"${exerciseName}" doesn't primarily involve the ${painArea}. It may be safe to continue with monitoring.`,
      rationaleIt: `"${exerciseName}" non coinvolge principalmente ${painArea}. Potrebbe essere sicuro continuare monitorando.`,
    };
  }

  // Se intensità alta, considera ROM ridotto come prima opzione
  if (intensity >= 4 && intensity <= 6 && pattern.reducedROMOption) {
    return {
      found: true,
      substitute: pattern.reducedROMOption,
      matchScore: 0.9,
      rationale: `Reduced range of motion version available that may reduce stress on ${painArea}.`,
      rationaleIt: `Versione a range di movimento ridotto disponibile che potrebbe ridurre lo stress su ${painArea}.`,
      modifications: {
        reducedROM: true,
        description: `Perform ${pattern.reducedROMOption} to reduce joint stress`,
        percentage: 50,
      },
    };
  }

  // Cerca alternative che non coinvolgano l'area dolorosa
  const safeAlternatives = pattern.alternatives.filter((alt) => {
    const altPattern = EXERCISE_PATTERNS[alt];
    if (!altPattern) return true; // Se non abbiamo dati, assumiamo sia sicuro
    return !altPattern.involvedAreas.includes(painArea);
  });

  if (safeAlternatives.length > 0) {
    // Filtra per equipment disponibile se specificato
    let finalAlternatives = safeAlternatives;
    if (availableEquipment && availableEquipment.length > 0) {
      // Per semplicità, manteniamo tutte le alternative
      // In futuro si può filtrare per equipment
    }

    return {
      found: true,
      substitute: finalAlternatives[0],
      matchScore: 0.85,
      rationale: `"${finalAlternatives[0]}" targets similar muscles without stressing the ${painArea}.`,
      rationaleIt: `"${finalAlternatives[0]}" allena muscoli simili senza stressare ${painArea}.`,
    };
  }

  // Se non ci sono alternative sicure, suggerisci esercizi generici sicuri per l'area
  const areaSafeExercises = SAFE_ALTERNATIVES_BY_AREA[painArea];
  if (areaSafeExercises && areaSafeExercises.length > 0) {
    return {
      found: true,
      substitute: areaSafeExercises[0],
      matchScore: 0.6,
      rationale: `No direct alternative found. "${areaSafeExercises[0]}" is generally safe for ${painArea} issues.`,
      rationaleIt: `Nessuna alternativa diretta trovata. "${areaSafeExercises[0]}" è generalmente sicuro per problemi a ${painArea}.`,
    };
  }

  return {
    found: false,
    rationale: `Unable to find a safe alternative. Consider skipping exercises for ${painArea} today.`,
    rationaleIt: `Impossibile trovare un'alternativa sicura. Considera di saltare gli esercizi per ${painArea} oggi.`,
  };
}

/**
 * Verifica se un esercizio è controindicato per un'area
 */
export function isContraindicated(
  exerciseName: string,
  painArea: BodyArea,
  intensity: DiscomfortIntensity
): boolean {
  if (intensity < PAIN_THRESHOLDS.SUGGEST_SUBSTITUTION) {
    return false;
  }

  const normalizedName = normalizeExerciseName(exerciseName);
  const contraindicated = AREA_CONTRAINDICATIONS[painArea] || [];

  return contraindicated.some(
    (ex) => normalizeExerciseName(ex) === normalizedName
  );
}

/**
 * Ottiene tutti gli esercizi controindicati per un'area
 */
export function getContraindicatedExercises(painArea: BodyArea): string[] {
  return AREA_CONTRAINDICATIONS[painArea] || [];
}

/**
 * Ottiene esercizi sicuri per un'area
 */
export function getSafeExercises(painArea: BodyArea): string[] {
  return SAFE_ALTERNATIVES_BY_AREA[painArea] || [];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalizza il nome dell'esercizio per il matching
 */
function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Trova il pattern più simile per un esercizio non esatto
 */
export function findSimilarExercise(name: string): string | null {
  const normalized = normalizeExerciseName(name);
  const patterns = Object.keys(EXERCISE_PATTERNS);

  // Cerca match esatto
  if (patterns.includes(normalized)) {
    return normalized;
  }

  // Cerca match parziale
  const partialMatch = patterns.find(
    (p) => p.includes(normalized) || normalized.includes(p)
  );

  return partialMatch || null;
}

/**
 * Genera suggerimenti di modifica ROM
 */
export function generateROMModification(
  exerciseName: string,
  painArea: BodyArea
): ROMModification | null {
  const pattern = EXERCISE_PATTERNS[normalizeExerciseName(exerciseName)];

  if (!pattern || !pattern.reducedROMOption) {
    return null;
  }

  return {
    reducedROM: true,
    description: `Consider ${pattern.reducedROMOption} to reduce stress on ${painArea}`,
    percentage: 50,
  };
}
