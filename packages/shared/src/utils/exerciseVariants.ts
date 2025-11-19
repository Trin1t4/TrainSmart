/**
 * Exercise Variants Mapping
 * Database di varianti per creare split intelligenti
 * Ogni pattern ha 3-4 varianti per evitare ripetizioni
 */

export interface ExerciseVariant {
  id: string;
  name: string;
  difficulty: number; // 1-10 scale
  equipment: 'bodyweight' | 'gym' | 'both';
  primary: string[]; // Muscoli primari
  secondary: string[]; // Muscoli secondari
}

/**
 * LOWER PUSH VARIANTS (Squat pattern - Quadriceps dominanti)
 */
export const LOWER_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'squat_basic',
    name: 'Bodyweight Squat',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'squat_goblet',
    name: 'Goblet Squat',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'squat_front',
    name: 'Front Squat',
    difficulty: 6,
    equipment: 'gym',
    primary: ['quadriceps'],
    secondary: ['glutes', 'core', 'upper_back']
  },
  {
    id: 'squat_back',
    name: 'Back Squat',
    difficulty: 5,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core', 'erectors']
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'bulgarian_split',
    name: 'Bulgarian Split Squat',
    difficulty: 5,
    equipment: 'both',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'pistol_squat',
    name: 'Pistol Squat',
    difficulty: 8,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core', 'balance']
  }
];

/**
 * LOWER PULL VARIANTS (Deadlift/Hip Hinge - Posterior chain)
 */
export const LOWER_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'hinge_basic',
    name: 'Bodyweight Hip Hinge',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['hamstrings', 'glutes'],
    secondary: ['erectors', 'core']
  },
  {
    id: 'deadlift_conventional',
    name: 'Conventional Deadlift',
    difficulty: 6,
    equipment: 'gym',
    primary: ['hamstrings', 'glutes', 'erectors'],
    secondary: ['lats', 'traps', 'forearms']
  },
  {
    id: 'deadlift_romanian',
    name: 'Romanian Deadlift (RDL)',
    difficulty: 5,
    equipment: 'gym',
    primary: ['hamstrings', 'glutes'],
    secondary: ['erectors', 'lats']
  },
  {
    id: 'deadlift_sumo',
    name: 'Sumo Deadlift',
    difficulty: 5,
    equipment: 'gym',
    primary: ['glutes', 'hamstrings', 'adductors'],
    secondary: ['quadriceps', 'erectors']
  },
  {
    id: 'deadlift_trap_bar',
    name: 'Trap Bar Deadlift',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes', 'hamstrings'],
    secondary: ['erectors', 'traps']
  },
  {
    id: 'nordic_curl',
    name: 'Nordic Hamstring Curl',
    difficulty: 7,
    equipment: 'bodyweight',
    primary: ['hamstrings'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'leg_curl',
    name: 'Leg Curl (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['hamstrings'],
    secondary: ['calves']
  }
];

/**
 * HORIZONTAL PUSH VARIANTS (Bench Press pattern - Pectorals)
 */
export const HORIZONTAL_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pushup_standard',
    name: 'Standard Push-up',
    difficulty: 4,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'core']
  },
  {
    id: 'pushup_diamond',
    name: 'Diamond Push-up',
    difficulty: 6,
    equipment: 'bodyweight',
    primary: ['triceps', 'pectorals'],
    secondary: ['front_delts', 'core']
  },
  {
    id: 'pushup_archer',
    name: 'Archer Push-up',
    difficulty: 7,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'core', 'obliques']
  },
  {
    id: 'bench_flat',
    name: 'Flat Barbell Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'bench_incline',
    name: 'Incline Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['upper_pectorals', 'front_delts'],
    secondary: ['triceps']
  },
  {
    id: 'bench_decline',
    name: 'Decline Bench Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lower_pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'dumbbell_press',
    name: 'Dumbbell Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'stabilizers']
  },
  {
    id: 'dips_chest',
    name: 'Chest Dips',
    difficulty: 6,
    equipment: 'both',
    primary: ['lower_pectorals', 'triceps'],
    secondary: ['front_delts']
  }
];

/**
 * VERTICAL PUSH VARIANTS (Overhead Press - Shoulders)
 */
export const VERTICAL_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pike_pushup',
    name: 'Pike Push-up',
    difficulty: 5,
    equipment: 'bodyweight',
    primary: ['front_delts', 'triceps'],
    secondary: ['upper_pectorals', 'core']
  },
  {
    id: 'handstand_wall',
    name: 'Wall Handstand Push-up',
    difficulty: 8,
    equipment: 'bodyweight',
    primary: ['front_delts', 'triceps'],
    secondary: ['traps', 'core']
  },
  {
    id: 'military_press',
    name: 'Military Press (Barbell)',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['upper_pectorals', 'core']
  },
  {
    id: 'overhead_press_db',
    name: 'Dumbbell Shoulder Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['stabilizers', 'core']
  },
  {
    id: 'arnold_press',
    name: 'Arnold Press',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'side_delts'],
    secondary: ['triceps', 'rotator_cuff']
  },
  {
    id: 'push_press',
    name: 'Push Press',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['quadriceps', 'core', 'power']
  }
];

/**
 * VERTICAL PULL VARIANTS (Pull-up/Lat Pulldown - Lats)
 */
export const VERTICAL_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pullup_standard',
    name: 'Standard Pull-up',
    difficulty: 7,
    equipment: 'both',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps', 'core']
  },
  {
    id: 'pullup_wide',
    name: 'Wide Grip Pull-up',
    difficulty: 8,
    equipment: 'both',
    primary: ['lats', 'teres_major'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'pullup_chinup',
    name: 'Chin-up (Supinated)',
    difficulty: 6,
    equipment: 'both',
    primary: ['biceps', 'lats'],
    secondary: ['rear_delts', 'core']
  },
  {
    id: 'pullup_neutral',
    name: 'Neutral Grip Pull-up',
    difficulty: 6,
    equipment: 'both',
    primary: ['lats', 'biceps'],
    secondary: ['brachialis', 'rear_delts']
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps']
  },
  {
    id: 'assisted_pullup',
    name: 'Assisted Pull-up',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'core']
  }
];

/**
 * HORIZONTAL PULL VARIANTS (Row pattern - Mid-back)
 * Utilizzato per split avanzati (Pull day in PPL)
 */
export const HORIZONTAL_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'row_inverted',
    name: 'Inverted Row',
    difficulty: 5,
    equipment: 'both',
    primary: ['mid_back', 'biceps'],
    secondary: ['rear_delts', 'core']
  },
  {
    id: 'row_barbell',
    name: 'Barbell Row',
    difficulty: 6,
    equipment: 'gym',
    primary: ['lats', 'mid_back'],
    secondary: ['biceps', 'erectors', 'rear_delts']
  },
  {
    id: 'row_dumbbell',
    name: 'Dumbbell Row',
    difficulty: 5,
    equipment: 'gym',
    primary: ['lats', 'mid_back'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'row_cable',
    name: 'Seated Cable Row',
    difficulty: 4,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'row_tbar',
    name: 'T-Bar Row',
    difficulty: 6,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'erectors']
  }
];

/**
 * CORE VARIANTS
 */
export const CORE_VARIANTS: ExerciseVariant[] = [
  {
    id: 'plank_standard',
    name: 'Plank',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['rectus_abdominis', 'transverse'],
    secondary: ['obliques', 'hip_flexors']
  },
  {
    id: 'plank_side',
    name: 'Side Plank',
    difficulty: 4,
    equipment: 'bodyweight',
    primary: ['obliques', 'transverse'],
    secondary: ['glute_medius', 'shoulder_stabilizers']
  },
  {
    id: 'leg_raise',
    name: 'Hanging Leg Raise',
    difficulty: 6,
    equipment: 'both',
    primary: ['lower_abs', 'hip_flexors'],
    secondary: ['lats', 'grip']
  },
  {
    id: 'ab_wheel',
    name: 'Ab Wheel Rollout',
    difficulty: 7,
    equipment: 'both',
    primary: ['rectus_abdominis', 'transverse'],
    secondary: ['lats', 'hip_flexors']
  },
  {
    id: 'crunch_cable',
    name: 'Cable Crunch',
    difficulty: 4,
    equipment: 'gym',
    primary: ['rectus_abdominis'],
    secondary: ['obliques']
  },
  {
    id: 'pallof_press',
    name: 'Pallof Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['obliques', 'transverse'],
    secondary: ['shoulder_stabilizers']
  }
];

/**
 * PELVIC FLOOR EXERCISES (Modern approach - not just Kegel)
 * Per post-partum e recupero pavimento pelvico
 */
export const PELVIC_FLOOR_VARIANTS: ExerciseVariant[] = [
  {
    id: 'connection_breath',
    name: 'Connection Breath',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'transverse'],
    secondary: ['diaphragm']
  },
  {
    id: 'diaphragmatic_breathing',
    name: 'Diaphragmatic Breathing',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['diaphragm', 'pelvic_floor'],
    secondary: ['transverse']
  },
  {
    id: 'pelvic_floor_activation',
    name: 'Pelvic Floor Activation',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor'],
    secondary: ['transverse', 'glutes']
  },
  {
    id: 'deep_squat_hold',
    name: 'Deep Squat Hold',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_flexors'],
    secondary: ['glutes', 'adductors']
  },
  {
    id: 'happy_baby_stretch',
    name: 'Happy Baby Stretch',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_flexors'],
    secondary: ['adductors', 'glutes']
  },
  {
    id: 'pelvic_tilts',
    name: 'Pelvic Tilts',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'transverse'],
    secondary: ['glutes', 'erectors']
  },
  {
    id: 'bridge_ball_squeeze',
    name: 'Bridge with Ball Squeeze',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'adductors', 'glutes'],
    secondary: ['hamstrings', 'transverse']
  },
  {
    id: 'clamshells',
    name: 'Clamshells',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['glutes', 'hip_rotators'],
    secondary: ['pelvic_floor', 'core']
  },
  {
    id: 'bird_dog_modified',
    name: 'Bird Dog (Modified)',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['core', 'pelvic_floor'],
    secondary: ['glutes', 'erectors']
  },
  {
    id: 'cat_cow',
    name: 'Cat-Cow',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['spine_mobility', 'pelvic_floor'],
    secondary: ['transverse', 'erectors']
  },
  {
    id: 'squat_to_stand',
    name: 'Squat to Stand',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_mobility'],
    secondary: ['hamstrings', 'glutes']
  }
];

/**
 * DIASTASIS RECOVERY EXERCISES
 * Per recupero diastasi dei retti addominali
 */
export const DIASTASIS_RECOVERY_VARIANTS: ExerciseVariant[] = [
  {
    id: 'dead_bug_heel_slides',
    name: 'Dead Bug Heel Slides',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors']
  },
  {
    id: 'toe_taps',
    name: 'Toe Taps',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors', 'rectus_abdominis']
  },
  {
    id: 'marching',
    name: 'Supine Marching',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors']
  },
  {
    id: 'dead_bug_progression',
    name: 'Dead Bug Progression',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['transverse', 'rectus_abdominis'],
    secondary: ['pelvic_floor', 'hip_flexors']
  },
  {
    id: 'pallof_press_kneeling',
    name: 'Pallof Press (Kneeling)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['transverse', 'obliques'],
    secondary: ['pelvic_floor', 'shoulder_stabilizers']
  },
  {
    id: 'side_plank_modified',
    name: 'Side Plank (Modified)',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['obliques', 'transverse'],
    secondary: ['glutes', 'shoulder_stabilizers']
  },
  {
    id: 'bear_hold',
    name: 'Bear Hold',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['quadriceps', 'shoulders']
  },
  {
    id: 'wall_sit_breathing',
    name: 'Wall Sit with Breathing',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'transverse'],
    secondary: ['pelvic_floor', 'glutes']
  },
  {
    id: 'seated_knee_lifts',
    name: 'Seated Knee Lifts',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'hip_flexors'],
    secondary: ['pelvic_floor']
  },
  {
    id: 'half_kneeling_chop',
    name: 'Half Kneeling Chop',
    difficulty: 4,
    equipment: 'gym',
    primary: ['obliques', 'transverse'],
    secondary: ['shoulders', 'glutes']
  }
];

/**
 * PRE-PARTUM SAFE EXERCISES
 * Esercizi sicuri durante la gravidanza
 */
export const PREGNANCY_SAFE_VARIANTS: ExerciseVariant[] = [
  {
    id: 'wall_pushup',
    name: 'Wall Push-up',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['core']
  },
  {
    id: 'seated_row_band',
    name: 'Seated Row (Band)',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['lats', 'rhomboids'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'standing_leg_curl',
    name: 'Standing Leg Curl',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['hamstrings'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'side_lying_leg_lift',
    name: 'Side Lying Leg Lift',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['glutes', 'hip_abductors'],
    secondary: ['core']
  },
  {
    id: 'modified_squat',
    name: 'Modified Squat',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'standing_hip_circles',
    name: 'Standing Hip Circles',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['hip_mobility'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'shoulder_blade_squeeze',
    name: 'Shoulder Blade Squeeze',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['rhomboids', 'mid_traps'],
    secondary: ['rear_delts']
  },
  {
    id: 'standing_march',
    name: 'Standing March',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['hip_flexors', 'core'],
    secondary: ['glutes']
  }
];

/**
 * ACCESSORY MOVEMENTS (per split avanzati)
 */
export const ACCESSORY_VARIANTS = {
  triceps: [
    { id: 'tricep_dips', name: 'Tricep Dips', difficulty: 5, equipment: 'both' as const },
    { id: 'tricep_pushdown', name: 'Tricep Pushdown', difficulty: 3, equipment: 'gym' as const },
    { id: 'skull_crusher', name: 'Skull Crushers', difficulty: 5, equipment: 'gym' as const }
  ],
  biceps: [
    { id: 'bicep_curl', name: 'Barbell Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'hammer_curl', name: 'Hammer Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'chin_up', name: 'Chin-up', difficulty: 6, equipment: 'both' as const }
  ],
  calves: [
    { id: 'calf_raise', name: 'Standing Calf Raise', difficulty: 2, equipment: 'both' as const },
    { id: 'calf_seated', name: 'Seated Calf Raise', difficulty: 2, equipment: 'gym' as const }
  ]
};

/**
 * Trova variante alternativa per un pattern
 * @param patternId - Il pattern base (es. 'lower_push')
 * @param baselineVariantId - La variante usata nello screening
 * @param variantIndex - Quale variante usare (0, 1, 2...)
 * @param equipment - 'bodyweight' o 'gym'
 * @returns Nome della variante
 */
export function getVariantForPattern(
  patternId: string,
  baselineVariantId: string,
  variantIndex: number,
  equipment: 'bodyweight' | 'gym'
): string {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return baselineVariantId; // Fallback

  // Filtra per equipment
  const validVariants = variants.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  if (validVariants.length === 0) return baselineVariantId;

  // Prendi la variante all'indice richiesto (ciclico)
  const selectedVariant = validVariants[variantIndex % validVariants.length];
  return selectedVariant.name;
}

/**
 * Trova variante più facile per pain management
 */
export function getEasierVariant(
  patternId: string,
  currentVariantName: string,
  equipment: 'bodyweight' | 'gym'
): string {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return currentVariantName;

  // Trova variante corrente
  const currentVariant = variants.find(v => v.name === currentVariantName);
  if (!currentVariant) return currentVariantName;

  // Trova variante più facile
  const validVariants = variants.filter(
    v => (v.equipment === equipment || v.equipment === 'both') &&
         v.difficulty < currentVariant.difficulty
  );

  if (validVariants.length === 0) return currentVariantName;

  // Ritorna la più facile disponibile
  validVariants.sort((a, b) => a.difficulty - b.difficulty);
  return validVariants[0].name;
}
