/**
 * CALISTHENICS PROGRESSIONS - SINGLE SOURCE OF TRUTH
 * ====================================================
 *
 * Questo file definisce TUTTE le progressioni calisthenics.
 *
 * IMPORTATO DA:
 * - ScreeningFlow.tsx (per mostrare le opzioni all'utente)
 * - ScreeningFlowFull.tsx (per mostrare le opzioni all'utente)
 * - exerciseVariants.ts (per generare varianti coerenti)
 *
 * REGOLA D'ORO: Se modifichi questo file, la modifica si propaga ovunque!
 *
 * @version 1.0 - Single Source of Truth
 */

export interface CalisthenicsProgression {
  id: string;
  name: string;
  difficulty: number; // 1-10
  isometric?: boolean; // true per esercizi a tempo (secondi invece di reps)
  videoUrl?: string;
  description?: string;
}

export interface CalisthenicsPattern {
  id: string;
  name: string;
  description: string;
  progressions: CalisthenicsProgression[];
}

/**
 * Progressioni Calisthenics Scientifiche
 * Ordinate dalla più facile alla più difficile per ogni pattern
 */
export const CALISTHENICS_PATTERNS: CalisthenicsPattern[] = [
  // ============================================================================
  // LOWER PUSH - Squat Pattern
  // ============================================================================
  {
    id: 'lower_push',
    name: 'Spinta Gambe (Squat)',
    description: 'Progressioni squat - dalla più facile alla più difficile',
    progressions: [
      { id: 'squat_assisted', name: 'Squat Assistito (con supporto)', difficulty: 1 },
      { id: 'air_squat', name: 'Squat a Corpo Libero', difficulty: 2 },
      { id: 'squat_pause', name: 'Squat con Pausa', difficulty: 3 },
      { id: 'jump_squat', name: 'Squat con Salto', difficulty: 4 },
      { id: 'split_squat', name: 'Split Squat', difficulty: 4 },
      { id: 'bulgarian_split', name: 'Split Squat Bulgaro', difficulty: 5 },
      { id: 'skater_squat', name: 'Skater Squat', difficulty: 6 },
      { id: 'pistol_assisted', name: 'Pistol Squat Assistito', difficulty: 7 },
      { id: 'shrimp_squat', name: 'Shrimp Squat (Squat Gambero)', difficulty: 8 },
      { id: 'pistol', name: 'Pistol Squat', difficulty: 10 }
    ]
  },

  // ============================================================================
  // HORIZONTAL PUSH - Push-up Pattern
  // ============================================================================
  {
    id: 'horizontal_push',
    name: 'Spinta Orizzontale (Push-up)',
    description: 'Progressioni push-up orizzontali',
    progressions: [
      { id: 'wall_pushup', name: 'Push-up al Muro', difficulty: 1 },
      { id: 'incline_pushup', name: 'Push-up Inclinato (rialzato)', difficulty: 2 },
      { id: 'knee_pushup', name: 'Push-up su Ginocchia', difficulty: 3 },
      { id: 'standard_pushup', name: 'Push-up Standard', difficulty: 5 },
      { id: 'wide_pushup', name: 'Push-up Larghi', difficulty: 5 },
      { id: 'diamond_pushup', name: 'Push-up Diamante', difficulty: 6 },
      { id: 'decline_pushup', name: 'Push-up Declinato', difficulty: 6 },
      { id: 'archer_pushup', name: 'Push-up Arciere', difficulty: 8 },
      { id: 'pseudo_planche', name: 'Pseudo Planche Push-up', difficulty: 9 },
      { id: 'one_arm_pushup', name: 'Push-up a Un Braccio', difficulty: 10 }
    ]
  },

  // ============================================================================
  // VERTICAL PUSH - Pike / HSPU Pattern
  // ============================================================================
  {
    id: 'vertical_push',
    name: 'Spinta Verticale (Pike -> HSPU)',
    description: 'Progressioni spinta verticale verso handstand',
    progressions: [
      { id: 'pike_pushup_knee', name: 'Pike Push-up su Ginocchia', difficulty: 3 },
      { id: 'pike_pushup', name: 'Pike Push-up', difficulty: 4 },
      { id: 'elevated_pike', name: 'Pike Push-up Elevato', difficulty: 5 },
      { id: 'wall_walk', name: 'Camminata al Muro', difficulty: 6 },
      { id: 'wall_hspu_partial', name: 'HSPU al Muro (ROM parziale)', difficulty: 7 },
      { id: 'wall_hspu', name: 'HSPU al Muro (ROM completo)', difficulty: 8 },
      { id: 'wall_hspu_deficit', name: 'HSPU al Muro (Deficit)', difficulty: 9 },
      { id: 'freestanding_hspu', name: 'HSPU in Verticale Libera', difficulty: 10 }
    ]
  },

  // ============================================================================
  // VERTICAL PULL - Pull-up Pattern
  // ============================================================================
  {
    id: 'vertical_pull',
    name: 'Tirata Verticale (Row -> Trazioni)',
    description: 'Progressioni trazione verticale - BASE: rematore inverso',
    progressions: [
      { id: 'dead_hang', name: 'Dead Hang', difficulty: 1 },
      { id: 'inverted_row_high', name: 'Rematore Inverso (barra alta)', difficulty: 2 },
      { id: 'inverted_row_mid', name: 'Rematore Inverso (barra media)', difficulty: 3 },
      { id: 'scapular_pullup', name: 'Scapular Pull-up', difficulty: 3 },
      { id: 'inverted_row_low', name: 'Rematore Inverso (barra bassa)', difficulty: 4 },
      { id: 'negative_pullup', name: 'Trazione Negativa (solo eccentrica)', difficulty: 5 },
      { id: 'band_pullup', name: 'Trazione con Elastico', difficulty: 6 },
      { id: 'pullup', name: 'Trazione alla Sbarra', difficulty: 7 },
      { id: 'chinup', name: 'Chin-up (presa supina)', difficulty: 7 },
      { id: 'wide_pullup', name: 'Trazioni Presa Larga', difficulty: 8 },
      { id: 'archer_pullup', name: 'Trazione Arciere', difficulty: 9 },
      { id: 'one_arm_pullup_prog', name: 'Progressione Trazione a Un Braccio', difficulty: 10 }
    ]
  },

  // ============================================================================
  // HORIZONTAL PULL - Row Pattern (per split avanzati)
  // ============================================================================
  {
    id: 'horizontal_pull',
    name: 'Tirata Orizzontale (Row)',
    description: 'Progressioni rematore - usato in split PPL',
    progressions: [
      { id: 'floor_pull', name: 'Floor Pull', difficulty: 2 },
      { id: 'inverted_row_easy', name: 'Inverted Row (Facilitato)', difficulty: 3 },
      { id: 'inverted_row', name: 'Inverted Row', difficulty: 5 },
      { id: 'inverted_row_elevated', name: 'Inverted Row (Piedi Elevati)', difficulty: 6 },
      { id: 'archer_row', name: 'Archer Row', difficulty: 7 },
      { id: 'front_lever_row_tuck', name: 'Front Lever Row (Tuck)', difficulty: 8 },
      { id: 'front_lever_row', name: 'Front Lever Row', difficulty: 10 }
    ]
  },

  // ============================================================================
  // LOWER PULL - Hip Hinge / Hamstring Pattern
  // ============================================================================
  {
    id: 'lower_pull',
    name: 'Tirata Gambe (Cerniera/Femorali)',
    description: 'Progressioni cerniera anca e femorali',
    progressions: [
      { id: 'glute_bridge', name: 'Ponte Glutei', difficulty: 2 },
      { id: 'single_leg_glute', name: 'Ponte Glutei a Una Gamba', difficulty: 3 },
      { id: 'hip_hinge', name: 'Hip Hinge a Corpo Libero', difficulty: 3 },
      { id: 'rdl_bodyweight', name: 'Stacco Rumeno a Una Gamba (corpo libero)', difficulty: 4 },
      { id: 'hip_thrust_elevated', name: 'Hip Thrust Rialzato', difficulty: 4 },
      { id: 'sliding_leg_curl', name: 'Leg Curl Scivolato', difficulty: 5 },
      { id: 'nordic_eccentric', name: 'Nordic Curl (solo eccentrica)', difficulty: 6 },
      { id: 'nordic_partial', name: 'Nordic Curl (Parziale)', difficulty: 7 },
      { id: 'nordic_assisted', name: 'Nordic Curl (Assistito)', difficulty: 8 },
      { id: 'nordic_full', name: 'Nordic Curl (completo)', difficulty: 9 }
    ]
  },

  // ============================================================================
  // CORE - Stability Pattern
  // ============================================================================
  {
    id: 'core',
    name: 'Stabilita Core',
    description: 'Progressioni core e stabilita',
    progressions: [
      { id: 'dead_bug', name: 'Dead Bug', difficulty: 1 },
      { id: 'bird_dog', name: 'Bird Dog', difficulty: 1 },
      { id: 'plank', name: 'Plank', difficulty: 2, isometric: true },
      { id: 'side_plank', name: 'Plank Laterale', difficulty: 3, isometric: true },
      { id: 'plank_rocking', name: 'Plank con Oscillazione', difficulty: 4, isometric: true },
      { id: 'hollow_body', name: 'Hollow Body Hold', difficulty: 5, isometric: true },
      { id: 'hollow_rock', name: 'Hollow Body Rock', difficulty: 6 },
      { id: 'lsit_tuck', name: 'L-sit Raccolto', difficulty: 6, isometric: true },
      { id: 'hanging_knee_raise', name: 'Hanging Knee Raise', difficulty: 6 },
      { id: 'lsit_one_leg', name: 'L-sit a Una Gamba', difficulty: 7, isometric: true },
      { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', difficulty: 7 },
      { id: 'toes_to_bar', name: 'Toes to Bar', difficulty: 8 },
      { id: 'lsit_full', name: 'L-sit Completo', difficulty: 9, isometric: true },
      { id: 'dragon_flag_partial', name: 'Dragon Flag (Parziale)', difficulty: 9 },
      { id: 'dragon_flag', name: 'Dragon Flag', difficulty: 10 }
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Trova un pattern per ID
 */
export function getPatternById(patternId: string): CalisthenicsPattern | undefined {
  return CALISTHENICS_PATTERNS.find(p => p.id === patternId);
}

/**
 * Trova una progressione per pattern e ID progressione
 */
export function getProgressionById(
  patternId: string,
  progressionId: string
): CalisthenicsProgression | undefined {
  const pattern = getPatternById(patternId);
  return pattern?.progressions.find(p => p.id === progressionId);
}

/**
 * Trova progressione per nome (case-insensitive)
 */
export function getProgressionByName(
  patternId: string,
  name: string
): CalisthenicsProgression | undefined {
  const pattern = getPatternById(patternId);
  const lowerName = name.toLowerCase();
  return pattern?.progressions.find(p => p.name.toLowerCase() === lowerName);
}

/**
 * Trova progressione piu vicina a una difficolta target
 */
export function getProgressionByDifficulty(
  patternId: string,
  targetDifficulty: number
): CalisthenicsProgression | undefined {
  const pattern = getPatternById(patternId);
  if (!pattern) return undefined;

  return pattern.progressions.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.difficulty - targetDifficulty);
    const currentDiff = Math.abs(current.difficulty - targetDifficulty);
    return currentDiff < closestDiff ? current : closest;
  });
}

/**
 * Ottieni progressione successiva (upgrade)
 * Ritorna undefined se gia al massimo
 */
export function getNextProgression(
  patternId: string,
  currentProgressionId: string,
  maxDifficultyJump: number = 2
): CalisthenicsProgression | undefined {
  const pattern = getPatternById(patternId);
  if (!pattern) return undefined;

  const currentIndex = pattern.progressions.findIndex(p => p.id === currentProgressionId);
  if (currentIndex === -1) return undefined;

  const current = pattern.progressions[currentIndex];

  // Trova la prossima progressione entro il salto massimo
  for (let i = currentIndex + 1; i < pattern.progressions.length; i++) {
    const next = pattern.progressions[i];
    if (next.difficulty <= current.difficulty + maxDifficultyJump) {
      return next;
    }
  }

  return undefined;
}

/**
 * Ottieni progressione precedente (downgrade)
 * Ritorna undefined se gia al minimo
 */
export function getPreviousProgression(
  patternId: string,
  currentProgressionId: string
): CalisthenicsProgression | undefined {
  const pattern = getPatternById(patternId);
  if (!pattern) return undefined;

  const currentIndex = pattern.progressions.findIndex(p => p.id === currentProgressionId);
  if (currentIndex <= 0) return undefined;

  return pattern.progressions[currentIndex - 1];
}

/**
 * Converti progressione in formato ExerciseVariant (per compatibilita con exerciseVariants.ts)
 */
export function progressionToVariant(
  patternId: string,
  progression: CalisthenicsProgression
): {
  id: string;
  name: string;
  difficulty: number;
  equipment: 'bodyweight';
  primary: string[];
  secondary: string[];
  isometric?: boolean;
} {
  // Mappa dei muscoli primari/secondari per pattern
  const muscleMap: Record<string, { primary: string[]; secondary: string[] }> = {
    lower_push: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'core'] },
    horizontal_push: { primary: ['pectorals', 'triceps'], secondary: ['front_delts', 'core'] },
    vertical_push: { primary: ['front_delts', 'triceps'], secondary: ['upper_pectorals', 'core'] },
    vertical_pull: { primary: ['lats', 'biceps'], secondary: ['rear_delts', 'traps', 'core'] },
    horizontal_pull: { primary: ['mid_back', 'biceps'], secondary: ['lats', 'rear_delts', 'core'] },
    lower_pull: { primary: ['hamstrings', 'glutes'], secondary: ['erectors', 'core'] },
    core: { primary: ['rectus_abdominis', 'transverse'], secondary: ['obliques', 'hip_flexors'] }
  };

  const muscles = muscleMap[patternId] || { primary: [], secondary: [] };

  return {
    id: progression.id,
    name: progression.name,
    difficulty: progression.difficulty,
    equipment: 'bodyweight',
    primary: muscles.primary,
    secondary: muscles.secondary,
    isometric: progression.isometric
  };
}

/**
 * Genera array di ExerciseVariant da CALISTHENICS_PATTERNS
 * Usato per popolare exerciseVariants.ts
 */
export function getAllVariantsForPattern(patternId: string) {
  const pattern = getPatternById(patternId);
  if (!pattern) return [];

  return pattern.progressions.map(p => progressionToVariant(patternId, p));
}

// Default export per retrocompatibilita
export default CALISTHENICS_PATTERNS;
