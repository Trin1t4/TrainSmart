/**
 * Exercise Variants Mapping
 * Database di varianti per creare split intelligenti
 * Ogni pattern ha 3-4 varianti per evitare ripetizioni
 *
 * FIX: Aggiunto varianti MACCHINE per ogni pattern
 * Ogni pattern ora ha almeno 2-3 opzioni macchina
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
 * Macchine: Leg Press, Hack Squat, Leg Extension, Smith Squat
 */
export const LOWER_PUSH_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
  {
    id: 'squat_basic',
    name: 'Bodyweight Squat',
    difficulty: 3,
    equipment: 'bodyweight',
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
  },
  // PESI LIBERI
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
    id: 'bulgarian_split',
    name: 'Bulgarian Split Squat',
    difficulty: 5,
    equipment: 'both',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  // MACCHINE
  {
    id: 'leg_press',
    name: 'Leg Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'hack_squat',
    name: 'Hack Squat (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps'],
    secondary: ['glutes', 'hamstrings']
  },
  {
    id: 'leg_extension',
    name: 'Leg Extension (Machine)',
    difficulty: 2,
    equipment: 'gym',
    primary: ['quadriceps'],
    secondary: []
  },
  {
    id: 'smith_squat',
    name: 'Smith Machine Squat',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'pendulum_squat',
    name: 'Pendulum Squat (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  }
];

/**
 * LOWER PULL VARIANTS (Deadlift/Hip Hinge - Posterior chain)
 * Macchine: Leg Curl (Lying/Seated), Hip Thrust Machine, Glute Kickback, Back Extension
 */
export const LOWER_PULL_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
  {
    id: 'hinge_basic',
    name: 'Bodyweight Hip Hinge',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['hamstrings', 'glutes'],
    secondary: ['erectors', 'core']
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
    id: 'glute_bridge',
    name: 'Glute Bridge',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['glutes'],
    secondary: ['hamstrings', 'core']
  },
  // PESI LIBERI
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
    id: 'hip_thrust_barbell',
    name: 'Barbell Hip Thrust',
    difficulty: 4,
    equipment: 'gym',
    primary: ['glutes'],
    secondary: ['hamstrings', 'core']
  },
  // MACCHINE
  {
    id: 'leg_curl_lying',
    name: 'Lying Leg Curl (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['hamstrings'],
    secondary: ['calves']
  },
  {
    id: 'leg_curl_seated',
    name: 'Seated Leg Curl (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['hamstrings'],
    secondary: ['calves']
  },
  {
    id: 'hip_thrust_machine',
    name: 'Hip Thrust Machine',
    difficulty: 3,
    equipment: 'gym',
    primary: ['glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'glute_kickback_machine',
    name: 'Glute Kickback Machine',
    difficulty: 2,
    equipment: 'gym',
    primary: ['glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'back_extension_machine',
    name: 'Back Extension (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['erectors', 'glutes'],
    secondary: ['hamstrings']
  }
];

/**
 * HORIZONTAL PUSH VARIANTS (Bench Press pattern - Pectorals)
 * Macchine: Chest Press, Incline Chest Press, Pec Deck, Smith Bench
 */
export const HORIZONTAL_PUSH_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
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
    id: 'pushup_decline',
    name: 'Decline Push-up',
    difficulty: 5,
    equipment: 'bodyweight',
    primary: ['upper_pectorals', 'triceps'],
    secondary: ['front_delts', 'core']
  },
  // PESI LIBERI
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
  },
  // MACCHINE
  {
    id: 'chest_press_machine',
    name: 'Chest Press (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'incline_chest_press_machine',
    name: 'Incline Chest Press (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['upper_pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'pec_deck',
    name: 'Pec Deck / Fly Machine',
    difficulty: 2,
    equipment: 'gym',
    primary: ['pectorals'],
    secondary: ['front_delts']
  },
  {
    id: 'smith_bench',
    name: 'Smith Machine Bench Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts']
  }
];

/**
 * HORIZONTAL PULL VARIANTS (Row pattern - Mid-back)
 * Macchine: Seated Row Machine, Chest Supported Row, Low Row Machine
 */
export const HORIZONTAL_PULL_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
  {
    id: 'row_inverted',
    name: 'Inverted Row',
    difficulty: 5,
    equipment: 'both',
    primary: ['mid_back', 'biceps'],
    secondary: ['rear_delts', 'core']
  },
  // PESI LIBERI
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
    id: 'row_tbar',
    name: 'T-Bar Row',
    difficulty: 6,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'erectors']
  },
  // CAVI
  {
    id: 'row_cable',
    name: 'Seated Cable Row',
    difficulty: 4,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'face_pull',
    name: 'Face Pull (Cable)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['rear_delts', 'traps'],
    secondary: ['rotator_cuff', 'mid_back']
  },
  // MACCHINE
  {
    id: 'seated_row_machine',
    name: 'Seated Row (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'chest_supported_row_machine',
    name: 'Chest Supported Row (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'low_row_machine',
    name: 'Low Row Machine',
    difficulty: 3,
    equipment: 'gym',
    primary: ['lats', 'mid_back'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'high_row_machine',
    name: 'High Row Machine',
    difficulty: 3,
    equipment: 'gym',
    primary: ['upper_back', 'rear_delts'],
    secondary: ['biceps', 'traps']
  }
];

/**
 * VERTICAL PUSH VARIANTS (Overhead Press - Shoulders)
 * Macchine: Shoulder Press Machine, Lateral Raise Machine, Smith Overhead
 */
export const VERTICAL_PUSH_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
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
  // PESI LIBERI
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
  },
  {
    id: 'lateral_raise',
    name: 'Dumbbell Lateral Raise',
    difficulty: 3,
    equipment: 'gym',
    primary: ['side_delts'],
    secondary: ['front_delts', 'traps']
  },
  // MACCHINE
  {
    id: 'shoulder_press_machine',
    name: 'Shoulder Press (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['side_delts']
  },
  {
    id: 'lateral_raise_machine',
    name: 'Lateral Raise (Machine)',
    difficulty: 2,
    equipment: 'gym',
    primary: ['side_delts'],
    secondary: ['front_delts', 'traps']
  },
  {
    id: 'smith_overhead',
    name: 'Smith Machine Overhead Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['upper_pectorals', 'core']
  },
  {
    id: 'rear_delt_machine',
    name: 'Rear Delt Machine (Reverse Fly)',
    difficulty: 2,
    equipment: 'gym',
    primary: ['rear_delts'],
    secondary: ['mid_back', 'traps']
  }
];

/**
 * VERTICAL PULL VARIANTS (Pull-up/Lat Pulldown - Lats)
 * Macchine: Lat Pulldown, Pulldown Machine, Assisted Pull-up
 */
export const VERTICAL_PULL_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
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
  // MACCHINE
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps']
  },
  {
    id: 'lat_pulldown_close',
    name: 'Close Grip Lat Pulldown',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['brachialis', 'rear_delts']
  },
  {
    id: 'assisted_pullup',
    name: 'Assisted Pull-up (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'core']
  },
  {
    id: 'pulldown_machine_fixed',
    name: 'Pulldown Machine (Fixed)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps']
  },
  {
    id: 'straight_arm_pulldown',
    name: 'Straight Arm Pulldown',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats'],
    secondary: ['triceps', 'core']
  }
];

/**
 * CORE VARIANTS
 * Macchine: Ab Crunch Machine, Rotary Torso, Back Extension
 */
export const CORE_VARIANTS: ExerciseVariant[] = [
  // BODYWEIGHT
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
    id: 'dead_bug',
    name: 'Dead Bug',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['transverse', 'rectus_abdominis'],
    secondary: ['hip_flexors', 'core_stability']
  },
  {
    id: 'hollow_body',
    name: 'Hollow Body Hold',
    difficulty: 5,
    equipment: 'bodyweight',
    primary: ['rectus_abdominis', 'transverse'],
    secondary: ['hip_flexors', 'core']
  },
  // ATTREZZI
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
  // CAVI
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
  },
  {
    id: 'woodchop_cable',
    name: 'Cable Woodchop',
    difficulty: 4,
    equipment: 'gym',
    primary: ['obliques'],
    secondary: ['transverse', 'shoulders']
  },
  // MACCHINE
  {
    id: 'ab_crunch_machine',
    name: 'Ab Crunch (Machine)',
    difficulty: 2,
    equipment: 'gym',
    primary: ['rectus_abdominis'],
    secondary: ['obliques']
  },
  {
    id: 'rotary_torso_machine',
    name: 'Rotary Torso (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['obliques'],
    secondary: ['transverse']
  },
  {
    id: 'back_extension_roman_chair',
    name: 'Back Extension (Roman Chair)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['erectors'],
    secondary: ['glutes', 'hamstrings']
  }
];

/**
 * ACCESSORY MOVEMENTS (per split avanzati)
 */
export const ACCESSORY_VARIANTS = {
  triceps: [
    { id: 'tricep_dips', name: 'Tricep Dips', difficulty: 5, equipment: 'both' as const },
    { id: 'tricep_pushdown', name: 'Tricep Pushdown (Cable)', difficulty: 3, equipment: 'gym' as const },
    { id: 'skull_crusher', name: 'Skull Crushers', difficulty: 5, equipment: 'gym' as const },
    { id: 'tricep_extension_machine', name: 'Tricep Extension (Machine)', difficulty: 2, equipment: 'gym' as const }
  ],
  biceps: [
    { id: 'bicep_curl', name: 'Barbell Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'hammer_curl', name: 'Hammer Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'chin_up', name: 'Chin-up', difficulty: 6, equipment: 'both' as const },
    { id: 'preacher_curl_machine', name: 'Preacher Curl (Machine)', difficulty: 2, equipment: 'gym' as const }
  ],
  calves: [
    { id: 'calf_raise', name: 'Standing Calf Raise', difficulty: 2, equipment: 'both' as const },
    { id: 'calf_seated', name: 'Seated Calf Raise', difficulty: 2, equipment: 'gym' as const },
    { id: 'calf_raise_machine', name: 'Calf Raise (Machine)', difficulty: 2, equipment: 'gym' as const }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper: determina se un esercizio e una macchina
 */
function isMachineExercise(exerciseName: string): boolean {
  const machineKeywords = [
    'machine', 'macchina',
    'press machine', 'chest press', 'shoulder press', 'leg press',
    'leg curl', 'leg extension',
    'lat pulldown', 'pulldown',
    'seated row', 'row machine',
    'pec deck', 'fly machine',
    'hack squat',
    'smith',
    'assisted',
    'crunch machine', 'ab crunch',
    'hip thrust machine',
    'glute kickback',
    'rotary torso'
  ];

  const nameLower = exerciseName.toLowerCase();
  return machineKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Helper: inferisce il pattern dal nome esercizio
 */
function inferPatternFromExercise(exerciseName: string): string {
  const name = exerciseName.toLowerCase();

  if (name.includes('squat') || name.includes('leg press') || name.includes('pressa') ||
      name.includes('lunge') || name.includes('affondo') || name.includes('leg extension') ||
      name.includes('hack') || name.includes('pendulum')) {
    return 'lower_push';
  }
  if (name.includes('deadlift') || name.includes('stacco') || name.includes('hip thrust') ||
      name.includes('leg curl') || name.includes('nordic') || name.includes('glute') ||
      name.includes('back extension')) {
    return 'lower_pull';
  }
  if (name.includes('push-up') || name.includes('panca') || name.includes('bench') ||
      name.includes('chest') || name.includes('pec') || name.includes('dip')) {
    return 'horizontal_push';
  }
  if (name.includes('row') || name.includes('remator') || name.includes('pulley') ||
      name.includes('face pull')) {
    return 'horizontal_pull';
  }
  if (name.includes('military') || name.includes('shoulder') || name.includes('pike') ||
      name.includes('lateral') || name.includes('alzate') || name.includes('overhead') ||
      name.includes('handstand') || name.includes('rear delt')) {
    return 'vertical_push';
  }
  if (name.includes('pull-up') || name.includes('pulldown') || name.includes('lat') ||
      name.includes('chin') || name.includes('trazion')) {
    return 'vertical_pull';
  }
  if (name.includes('plank') || name.includes('crunch') || name.includes('ab') ||
      name.includes('core') || name.includes('rotary') || name.includes('dead bug') ||
      name.includes('hollow') || name.includes('pallof') || name.includes('woodchop')) {
    return 'core';
  }

  return 'compound';
}

/**
 * Trova variante alternativa per un pattern
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
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return baselineVariantId;

  const validVariants = variants.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  if (validVariants.length === 0) return baselineVariantId;

  const selectedVariant = validVariants[variantIndex % validVariants.length];
  return selectedVariant.name;
}

/**
 * Trova variante piu facile per pain management
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
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return currentVariantName;

  const currentVariant = variants.find(v => v.name === currentVariantName);
  if (!currentVariant) return currentVariantName;

  const validVariants = variants.filter(
    v => (v.equipment === equipment || v.equipment === 'both') &&
         v.difficulty < currentVariant.difficulty
  );

  if (validVariants.length === 0) return currentVariantName;

  validVariants.sort((a, b) => a.difficulty - b.difficulty);
  return validVariants[0].name;
}

/**
 * Get all variants for a given exercise name and pattern
 * FIX: Garantisce sempre almeno un'opzione macchina se l'utente e in palestra
 */
export function getVariantsForExercise(
  exerciseName: string,
  patternId?: string,
  prioritizeMachines: boolean = true
): string[] {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  // Determina pattern se non fornito
  let effectivePattern = patternId;
  if (!effectivePattern || !variantMap[effectivePattern]) {
    effectivePattern = inferPatternFromExercise(exerciseName);
    console.log(`[getVariantsForExercise] Pattern inferred: "${effectivePattern}" for "${exerciseName}"`);
  }

  const variants = variantMap[effectivePattern || ''];
  if (!variants) {
    console.warn(`[getVariantsForExercise] No variants for pattern: ${effectivePattern}`);
    return [];
  }

  // Filtra escludendo l'esercizio corrente
  const normalizedCurrentName = exerciseName.toLowerCase().trim();
  let alternativeVariants = variants.filter(
    v => v.name.toLowerCase().trim() !== normalizedCurrentName
  );

  // FIX: Ordina per avere macchine in cima alla lista
  if (prioritizeMachines) {
    const machineVariants = alternativeVariants.filter(v =>
      v.equipment === 'gym' && isMachineExercise(v.name)
    );
    const otherVariants = alternativeVariants.filter(v =>
      !(v.equipment === 'gym' && isMachineExercise(v.name))
    );

    // Metti macchine prima
    alternativeVariants = [...machineVariants, ...otherVariants];

    console.log(`[getVariantsForExercise] Machine variants: ${machineVariants.length}, Others: ${otherVariants.length}`);
  }

  const alternativeNames = alternativeVariants.map(v => v.name);

  console.log(`[getVariantsForExercise] Found ${alternativeNames.length} alternatives for "${exerciseName}" (pattern: ${effectivePattern})`);

  return alternativeNames;
}

/**
 * Get only machine variants for a pattern
 * Utile quando l'utente preferisce esplicitamente le macchine
 */
export function getMachineVariantsForPattern(patternId: string): string[] {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    horizontal_pull: HORIZONTAL_PULL_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return [];

  return variants
    .filter(v => v.equipment === 'gym' && isMachineExercise(v.name))
    .map(v => v.name);
}

export default {
  LOWER_PUSH_VARIANTS,
  LOWER_PULL_VARIANTS,
  HORIZONTAL_PUSH_VARIANTS,
  HORIZONTAL_PULL_VARIANTS,
  VERTICAL_PUSH_VARIANTS,
  VERTICAL_PULL_VARIANTS,
  CORE_VARIANTS,
  ACCESSORY_VARIANTS,
  getVariantForPattern,
  getEasierVariant,
  getVariantsForExercise,
  getMachineVariantsForPattern
};
