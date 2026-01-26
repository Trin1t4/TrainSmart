/**
 * TRAINSMART BIOMECHANICS ENGINE - EXERCISE DEFINITIONS PART 2
 *
 * Vertical Push (continued), Core, and Accessory exercises
 *
 * @author TrainSmart Team
 * @version 2.0.0
 */

import type { ExerciseDefinition } from './exerciseDefinitionTypes';

// ============================================================================
// VERTICAL PUSH (continued)
// ============================================================================

export const LATERAL_RAISE_MACHINE: ExerciseDefinition = {
  id: 'LATERAL_RAISE_MACHINE',
  names: ['Lateral Raise Machine', 'Machine Lateral Raise'],
  category: 'vertical_push',
  equipment: ['machine'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
  angles: { arm_raise: { min: 80, max: 100 } },
  positions: { pads: { on_upper_arms: true } },
  errors: {
    SHRUGGING: {
      detection: 'shoulder_elevation > 3',
      severity: 'MEDIUM',
      risk: 'Trap dominant',
      cue_it: 'Spalle basse',
      cue_en: 'Shoulders down'
    }
  }
};

export const FRONT_RAISE: ExerciseDefinition = {
  id: 'FRONT_RAISE',
  names: ['Front Raise', 'Alzate Frontali'],
  category: 'vertical_push',
  equipment: ['dumbbell', 'cable', 'plate'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: { elbow_bend: { min: 160, max: 180 }, arm_raise: { min: 80, max: 100 } },
  positions: { path: { forward: true }, top: { shoulder_height: true } },
  errors: {
    EXCESSIVE_SWING: {
      detection: 'momentum_use',
      severity: 'MEDIUM',
      risk: 'Reduced work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    },
    ARM_TOO_HIGH: {
      detection: 'arm_above_shoulder > 10',
      severity: 'LOW',
      risk: 'Unnecessary',
      cue_it: 'Fermati alle spalle',
      cue_en: 'Stop at shoulder height'
    }
  }
};

export const REAR_DELT_FLY: ExerciseDefinition = {
  id: 'REAR_DELT_FLY',
  names: ['Rear Delt Fly', 'Reverse Fly', 'Alzate Posteriori'],
  category: 'vertical_push',
  equipment: ['dumbbell', 'cable'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: { elbow_bend: { min: 15, max: 30 }, torso_bend: { min: 45, max: 90 } },
  positions: { movement: { arc_behind: true } },
  errors: {
    TORSO_RISE: {
      detection: 'torso_angle_increase > 15',
      severity: 'MEDIUM',
      risk: 'Uses momentum',
      cue_it: 'Busto fermo',
      cue_en: 'Torso still'
    },
    ELBOW_BEND_EXCESSIVE: {
      detection: 'elbow_angle < 140',
      severity: 'LOW',
      risk: 'Changes exercise',
      cue_it: 'Gomiti quasi tesi',
      cue_en: 'Elbows almost straight'
    }
  }
};

export const REAR_DELT_MACHINE: ExerciseDefinition = {
  id: 'REAR_DELT_MACHINE',
  names: ['Rear Delt Machine', 'Reverse Pec Deck'],
  category: 'vertical_push',
  equipment: ['machine'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
  angles: { elbow: { min: 160, max: 180 } },
  positions: { movement: { arc_behind: true } },
  errors: {
    SHRUGGING: {
      detection: 'shoulder_elevation',
      severity: 'MEDIUM',
      risk: 'Trap dominant',
      cue_it: 'Spalle basse',
      cue_en: 'Shoulders down'
    }
  }
};

// ============================================================================
// CORE EXERCISES
// ============================================================================

export const PLANK: ExerciseDefinition = {
  id: 'PLANK',
  names: ['Plank', 'Forearm Plank', 'Plank Isometrico'],
  category: 'core',
  equipment: ['bodyweight'],
  isometric: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
  angles: { hip_sag_max: { max: 10 }, hip_pike_max: { max: 10 } },
  positions: { body: { straight_line: 'shoulder_to_ankle', neutral_spine: true }, shoulder: { over_elbows: true } },
  errors: {
    HIP_SAG: {
      detection: 'hip_below_line > 10',
      severity: 'HIGH',
      risk: 'Lower back stress',
      cue_it: 'Stringi i glutei, contrai gli addominali',
      cue_en: 'Squeeze glutes, contract abs'
    },
    HIP_PIKE: {
      detection: 'hip_above_line > 10',
      severity: 'MEDIUM',
      risk: 'Reduced core work',
      cue_it: 'Abbassa i fianchi in linea',
      cue_en: 'Lower hips in line'
    },
    HEAD_DROP: {
      detection: 'cervical_flexion > 20',
      severity: 'LOW',
      risk: 'Neck strain',
      cue_it: 'Guarda il pavimento, collo neutro',
      cue_en: 'Look at floor, neutral neck'
    },
    SHOULDER_COLLAPSE: {
      detection: 'scapular_winging',
      severity: 'MEDIUM',
      risk: 'Shoulder fatigue',
      cue_it: 'Spingi via dal pavimento',
      cue_en: 'Push away from floor'
    }
  }
};

export const SIDE_PLANK: ExerciseDefinition = {
  id: 'SIDE_PLANK',
  names: ['Side Plank', 'Plank Laterale'],
  category: 'core',
  equipment: ['bodyweight'],
  isometric: true,
  unilateral: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
  angles: { hip_drop_max: { max: 10 } },
  positions: { body: { straight_line: 'lateral_view', hip_neutral: true } },
  errors: {
    HIP_SAG: {
      detection: 'hip_drop > 10',
      severity: 'HIGH',
      risk: 'Reduced oblique work',
      cue_it: 'Spingi i fianchi in alto',
      cue_en: 'Push hips up'
    },
    ROTATION: {
      detection: 'torso_rotation > 15',
      severity: 'MEDIUM',
      risk: 'Not training obliques',
      cue_it: 'Resta laterale',
      cue_en: 'Stay lateral'
    }
  }
};

export const DEAD_BUG: ExerciseDefinition = {
  id: 'DEAD_BUG',
  names: ['Dead Bug', 'Dead Bug Exercise'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_wrist', 'right_wrist'],
  angles: {},
  positions: { back: { flat_on_ground: true, lumbar_pressed_down: true }, movement: { contralateral: true } },
  errors: {
    BACK_ARCH: {
      detection: 'lumbar_lift',
      severity: 'HIGH',
      risk: 'Back stress, core not engaged',
      cue_it: 'Premi la schiena a terra',
      cue_en: 'Press back to floor'
    },
    SAME_SIDE: {
      detection: 'ipsilateral_movement',
      severity: 'MEDIUM',
      risk: 'Wrong exercise',
      cue_it: 'Braccio e gamba opposti',
      cue_en: 'Opposite arm and leg'
    }
  }
};

export const BIRD_DOG: ExerciseDefinition = {
  id: 'BIRD_DOG',
  names: ['Bird Dog', 'Quadruped Extension'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_wrist', 'right_wrist', 'left_ankle', 'right_ankle'],
  angles: {},
  positions: { quadruped: { hands_under_shoulders: true, knees_under_hips: true, spine_neutral: true }, extension: { contralateral: true, to_parallel: true } },
  errors: {
    HIP_ROTATION: {
      detection: 'pelvis_rotation > 10',
      severity: 'MEDIUM',
      risk: 'Back stress',
      cue_it: 'Fianchi livellati',
      cue_en: 'Hips level'
    },
    OVEREXTENSION: {
      detection: 'limb_above_parallel',
      severity: 'LOW',
      risk: 'Hyperextension',
      cue_it: 'Fermati al parallelo',
      cue_en: 'Stop at parallel'
    },
    BACK_SAG: {
      detection: 'lumbar_hyperextension',
      severity: 'MEDIUM',
      risk: 'Back stress',
      cue_it: 'Core contratto',
      cue_en: 'Core engaged'
    }
  }
};

export const HANGING_LEG_RAISE: ExerciseDefinition = {
  id: 'HANGING_LEG_RAISE',
  names: ['Hanging Leg Raise', 'Leg Raise', 'Sollevamento Gambe alla Sbarra'],
  category: 'core',
  equipment: ['bar'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  angles: { leg: { min: 80, optimal: 90, max: 180 } },
  positions: { start: { dead_hang: true, legs_straight: true }, top: { legs_parallel: true } },
  errors: {
    EXCESSIVE_SWING: {
      detection: 'body_oscillation > 30',
      severity: 'MEDIUM',
      risk: 'Momentum cheating',
      cue_it: 'Controlla l\'oscillazione',
      cue_en: 'Control the swing'
    },
    KNEE_BEND: {
      detection: 'knee_angle < 160',
      severity: 'LOW',
      risk: 'Easier variation',
      cue_it: 'Gambe più tese per più sfida',
      cue_en: 'Straighter legs for more challenge'
    },
    HIP_FLEXOR_DOMINANT: {
      detection: 'no_pelvic_tilt',
      severity: 'MEDIUM',
      risk: 'Hip flexors vs abs',
      cue_it: 'Ruota il bacino all\'indietro mentre sali',
      cue_en: 'Posteriorly tilt pelvis as you lift'
    }
  }
};

export const PALLOF_PRESS: ExerciseDefinition = {
  id: 'PALLOF_PRESS',
  names: ['Pallof Press', 'Anti-Rotation Press'],
  category: 'core',
  equipment: ['cable', 'band'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist'],
  angles: {},
  positions: { stance: { perpendicular_to_cable: true, athletic: true }, press: { straight_from_chest: true, resist_rotation: true } },
  errors: {
    ROTATION: {
      detection: 'torso_rotation > 5',
      severity: 'HIGH',
      risk: 'Defeats purpose',
      cue_it: 'Resisti alla rotazione, resta fermo',
      cue_en: 'Resist rotation, stay still'
    },
    ARMS_BENT: {
      detection: 'elbow_angle < 160',
      severity: 'LOW',
      risk: 'Easier',
      cue_it: 'Estendi completamente le braccia',
      cue_en: 'Extend arms fully'
    }
  }
};

export const AB_WHEEL_ROLLOUT: ExerciseDefinition = {
  id: 'AB_WHEEL_ROLLOUT',
  names: ['Ab Wheel Rollout', 'Ab Roller', 'Ruota Addominale'],
  category: 'core',
  equipment: ['ab_wheel'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist'],
  angles: {},
  positions: { start: { kneeling: true }, extension: { controlled: true, neutral_spine: true } },
  errors: {
    BACK_SAG: {
      detection: 'lumbar_hyperextension > 15',
      severity: 'HIGH',
      risk: 'Back injury',
      cue_it: 'Core strettissimo, non far cedere la schiena',
      cue_en: 'Extremely tight core, don\'t let back sag'
    },
    HIPS_BACK: {
      detection: 'hip_flexion_during_return',
      severity: 'MEDIUM',
      risk: 'Cheating',
      cue_it: 'Tira con gli addominali, non con i fianchi',
      cue_en: 'Pull with abs, not hips'
    },
    INCOMPLETE_ROM: {
      detection: 'limited_extension',
      severity: 'LOW',
      risk: 'Reduced training effect',
      cue_it: 'Vai più lontano se riesci a controllare',
      cue_en: 'Go further if you can control'
    }
  }
};

export const HOLLOW_BODY: ExerciseDefinition = {
  id: 'HOLLOW_BODY',
  names: ['Hollow Body Hold', 'Hollow Hold', 'Hollow Body'],
  category: 'core',
  equipment: ['bodyweight'],
  isometric: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
  angles: {},
  positions: { body: { lower_back_pressed: true, arms_overhead: true, legs_extended: true } },
  errors: {
    BACK_ARCH: {
      detection: 'lumbar_lift',
      severity: 'HIGH',
      risk: 'Back stress',
      cue_it: 'Premi la schiena a terra',
      cue_en: 'Press back to floor'
    },
    LIMBS_TOO_HIGH: {
      detection: 'arms_or_legs_above_45',
      severity: 'LOW',
      risk: 'Too easy',
      cue_it: 'Abbassa braccia e gambe',
      cue_en: 'Lower arms and legs'
    }
  },
  maps_to: 'PLANK'
};

export const V_UPS: ExerciseDefinition = {
  id: 'V_UPS',
  names: ['V-Ups', 'V Ups', 'V-Sit Ups'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle', 'left_wrist', 'right_wrist'],
  angles: {},
  positions: { movement: { simultaneous_lift: true, hands_to_feet: true } },
  errors: {
    MOMENTUM_USE: {
      detection: 'velocity_spike',
      severity: 'MEDIUM',
      risk: 'Reduced ab work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    },
    INCOMPLETE_ROM: {
      detection: 'hands_dont_reach_feet',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Tocca i piedi',
      cue_en: 'Touch feet'
    }
  }
};

export const RUSSIAN_TWIST: ExerciseDefinition = {
  id: 'RUSSIAN_TWIST',
  names: ['Russian Twist', 'Seated Twist'],
  category: 'core',
  equipment: ['bodyweight', 'dumbbell', 'medicine_ball'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist'],
  angles: { torso_lean: { min: 30, max: 60 } },
  positions: { movement: { rotation_side_to_side: true }, feet: { elevated_optional: true } },
  errors: {
    NO_ROTATION: {
      detection: 'torso_rotation < 30',
      severity: 'MEDIUM',
      risk: 'Reduced oblique work',
      cue_it: 'Ruota di più',
      cue_en: 'Rotate more'
    },
    ARMS_ONLY: {
      detection: 'torso_static',
      severity: 'MEDIUM',
      risk: 'Not training core',
      cue_it: 'Ruota il busto, non solo le braccia',
      cue_en: 'Rotate torso, not just arms'
    }
  }
};

export const WOODCHOP: ExerciseDefinition = {
  id: 'WOODCHOP',
  names: ['Woodchop', 'Cable Woodchop', 'Wood Chop'],
  category: 'core',
  equipment: ['cable', 'medicine_ball'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist'],
  angles: {},
  positions: { movement: { diagonal: true, high_to_low_or_reverse: true } },
  errors: {
    ALL_ARMS: {
      detection: 'no_hip_rotation',
      severity: 'MEDIUM',
      risk: 'Reduced core work',
      cue_it: 'Ruota i fianchi',
      cue_en: 'Rotate hips'
    },
    EXCESSIVE_LEAN: {
      detection: 'torso_lean > 30',
      severity: 'LOW',
      risk: 'Uses momentum',
      cue_it: 'Stai più dritto',
      cue_en: 'Stay more upright'
    }
  }
};

export const CABLE_CRUNCH: ExerciseDefinition = {
  id: 'CABLE_CRUNCH',
  names: ['Cable Crunch', 'Kneeling Cable Crunch', 'Crunch ai Cavi'],
  category: 'core',
  equipment: ['cable'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
  angles: {},
  positions: { setup: { kneeling: true }, movement: { spinal_flexion: true } },
  errors: {
    HIP_FLEXION: {
      detection: 'hip_angle_decrease > 20',
      severity: 'MEDIUM',
      risk: 'Hip flexors instead of abs',
      cue_it: 'Muovi solo il busto, fianchi fermi',
      cue_en: 'Move only torso, hips still'
    },
    PULLING_WITH_ARMS: {
      detection: 'arm_movement',
      severity: 'LOW',
      risk: 'Lat involvement',
      cue_it: 'Braccia fisse, contrai gli addominali',
      cue_en: 'Arms fixed, contract abs'
    }
  }
};

export const SIT_UP: ExerciseDefinition = {
  id: 'SIT_UP',
  names: ['Sit Up', 'Sit-up'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee'],
  angles: {},
  positions: { movement: { full_range: true } },
  errors: {
    MOMENTUM_USE: {
      detection: 'velocity_spike',
      severity: 'LOW',
      risk: 'Reduced ab work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    },
    NECK_PULL: {
      detection: 'cervical_flexion > 30',
      severity: 'MEDIUM',
      risk: 'Neck strain',
      cue_it: 'Non tirare il collo',
      cue_en: 'Don\'t pull neck'
    }
  }
};

export const CRUNCH: ExerciseDefinition = {
  id: 'CRUNCH',
  names: ['Crunch', 'Abdominal Crunch'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
  angles: {},
  positions: { movement: { short_range: true, lift_shoulders_only: true } },
  errors: {
    NECK_PULL: {
      detection: 'hands_pulling_head',
      severity: 'MEDIUM',
      risk: 'Neck strain',
      cue_it: 'Mani dietro le orecchie, non tirare',
      cue_en: 'Hands behind ears, don\'t pull'
    },
    TOO_MUCH_ROM: {
      detection: 'full_sit_up',
      severity: 'LOW',
      risk: 'Hip flexor dominant',
      cue_it: 'Solo scapole da terra',
      cue_en: 'Just shoulders off floor'
    }
  }
};

export const LEG_LOWER: ExerciseDefinition = {
  id: 'LEG_LOWER',
  names: ['Leg Lower', 'Leg Lowering', 'Lying Leg Lower'],
  category: 'core',
  equipment: ['bodyweight'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'],
  angles: {},
  positions: { movement: { controlled_lowering: true }, back: { pressed_to_floor: true } },
  errors: {
    BACK_ARCH: {
      detection: 'lumbar_lift',
      severity: 'HIGH',
      risk: 'Back stress',
      cue_it: 'Abbassa solo fino a quando riesci a tenere la schiena a terra',
      cue_en: 'Lower only as far as you can keep back down'
    },
    TOO_FAST: {
      detection: 'lowering_time < 2',
      severity: 'LOW',
      risk: 'Momentum',
      cue_it: 'Scendi lentamente',
      cue_en: 'Lower slowly'
    }
  },
  maps_to: 'DEAD_BUG'
};

// ============================================================================
// ACCESSORY EXERCISES
// ============================================================================

export const BICEP_CURL: ExerciseDefinition = {
  id: 'BICEP_CURL',
  names: ['Bicep Curl', 'Barbell Curl', 'Dumbbell Curl', 'Curl Bicipiti'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell', 'cable'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip'],
  angles: { elbow_start: { min: 160, max: 180 }, elbow_end: { min: 30, max: 50 } },
  positions: { elbow: { stable_at_side: true } },
  errors: {
    ELBOW_FORWARD: {
      detection: 'elbow_anterior_movement > 5',
      severity: 'LOW',
      risk: 'Front delt involvement',
      cue_it: 'Gomiti fermi al fianco',
      cue_en: 'Elbows at side'
    },
    BODY_SWING: {
      detection: 'torso_oscillation > 10',
      severity: 'MEDIUM',
      risk: 'Momentum cheating',
      cue_it: 'Corpo fermo, solo le braccia lavorano',
      cue_en: 'Body still, only arms work'
    },
    INCOMPLETE_ROM: {
      detection: 'elbow_angle > 60 OR elbow_angle < 160',
      severity: 'LOW',
      risk: 'Reduced work',
      cue_it: 'Estendi e fletti completamente',
      cue_en: 'Extend and flex fully'
    }
  }
};

export const TRICEP_PUSHDOWN: ExerciseDefinition = {
  id: 'TRICEP_PUSHDOWN',
  names: ['Tricep Pushdown', 'Cable Pushdown', 'Pushdown Tricipiti'],
  category: 'accessory',
  equipment: ['cable'],
  isolation: true,
  landmarks_required: ['left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder'],
  angles: { elbow_start: { min: 80, max: 100 }, elbow_end: { min: 170, max: 180 } },
  positions: { elbow: { stable_at_side: true } },
  errors: {
    ELBOW_FLARE: {
      detection: 'elbow_moves_from_body',
      severity: 'MEDIUM',
      risk: 'Shoulder involvement',
      cue_it: 'Gomiti incollati al fianco',
      cue_en: 'Elbows glued to side'
    },
    BODY_LEAN: {
      detection: 'torso_lean > 20',
      severity: 'LOW',
      risk: 'Uses body weight',
      cue_it: 'Stai dritto',
      cue_en: 'Stand straight'
    }
  }
};

export const SKULL_CRUSHERS: ExerciseDefinition = {
  id: 'SKULL_CRUSHERS',
  names: ['Skull Crushers', 'Lying Tricep Extension', 'French Press'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: { elbow_start: { min: 80, max: 100 }, elbow_end: { min: 160, max: 180 } },
  positions: { upper_arm: { vertical_or_slightly_back: true } },
  errors: {
    ELBOW_FLARE: {
      detection: 'elbow_spread > 15',
      severity: 'MEDIUM',
      risk: 'Shoulder involvement',
      cue_it: 'Gomiti dentro',
      cue_en: 'Elbows in'
    },
    UPPER_ARM_MOVEMENT: {
      detection: 'shoulder_flexion_change > 15',
      severity: 'LOW',
      risk: 'Changes exercise',
      cue_it: 'Braccia superiori ferme',
      cue_en: 'Upper arms still'
    }
  }
};

export const HAMMER_CURL: ExerciseDefinition = {
  id: 'HAMMER_CURL',
  names: ['Hammer Curl', 'Neutral Grip Curl', 'Curl a Martello'],
  category: 'accessory',
  equipment: ['dumbbell'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: { elbow_start: { min: 160, max: 180 }, elbow_end: { min: 30, max: 50 } },
  positions: { grip: { neutral: true } },
  errors: {
    BODY_SWING: {
      detection: 'torso_oscillation > 10',
      severity: 'MEDIUM',
      risk: 'Momentum',
      cue_it: 'Corpo fermo',
      cue_en: 'Body still'
    }
  },
  maps_to: 'BICEP_CURL'
};

export const PREACHER_CURL: ExerciseDefinition = {
  id: 'PREACHER_CURL',
  names: ['Preacher Curl', 'Scott Curl', 'Curl alla Panca Scott'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell', 'machine'],
  isolation: true,
  landmarks_required: ['left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: { elbow_start: { min: 140, max: 160 }, elbow_end: { min: 40, max: 60 } },
  positions: { arms: { on_pad: true } },
  errors: {
    LIFTING_OFF_PAD: {
      detection: 'arms_leave_pad',
      severity: 'MEDIUM',
      risk: 'Cheating',
      cue_it: 'Braccia sulla panca',
      cue_en: 'Arms on pad'
    },
    INCOMPLETE_EXTENSION: {
      detection: 'elbow_angle < 140',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Estendi completamente (con controllo!)',
      cue_en: 'Extend fully (with control!)'
    }
  }
};

export const CALF_RAISE: ExerciseDefinition = {
  id: 'CALF_RAISE',
  names: ['Calf Raise', 'Standing Calf Raise', 'Polpacci'],
  category: 'accessory',
  equipment: ['machine', 'bodyweight', 'dumbbell'],
  isolation: true,
  landmarks_required: ['left_ankle', 'right_ankle', 'left_knee', 'right_knee'],
  angles: { ankle_bottom: { min: -15, max: -5 }, ankle_top: { min: 30, max: 45 } },
  positions: { knee: { straight_or_slight_bend: true } },
  errors: {
    KNEE_BEND: {
      detection: 'knee_flexion > 20',
      severity: 'LOW',
      risk: 'Uses quads',
      cue_it: 'Gambe dritte',
      cue_en: 'Legs straight'
    },
    BOUNCING: {
      detection: 'velocity_spike_at_bottom',
      severity: 'MEDIUM',
      risk: 'Achilles stress',
      cue_it: 'Pausa in basso',
      cue_en: 'Pause at bottom'
    },
    INCOMPLETE_ROM: {
      detection: 'limited_plantar_dorsiflexion',
      severity: 'LOW',
      risk: 'Reduced work',
      cue_it: 'ROM completo',
      cue_en: 'Full ROM'
    }
  }
};

export const SHRUGS: ExerciseDefinition = {
  id: 'SHRUGS',
  names: ['Shrugs', 'Shoulder Shrugs', 'Scrollate'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_ear', 'right_ear'],
  angles: {},
  positions: { movement: { vertical_only: true, no_rotation: true } },
  errors: {
    ROLLING: {
      detection: 'shoulder_rotation',
      severity: 'LOW',
      risk: 'Unnecessary, potential strain',
      cue_it: 'Solo su e giù, niente rotazione',
      cue_en: 'Just up and down, no rolling'
    },
    INCOMPLETE_ROM: {
      detection: 'limited_elevation',
      severity: 'LOW',
      risk: 'Reduced work',
      cue_it: 'Porta le spalle alle orecchie',
      cue_en: 'Bring shoulders to ears'
    }
  }
};

export const FOREARM_CURL: ExerciseDefinition = {
  id: 'FOREARM_CURL',
  names: ['Forearm Curl', 'Wrist Curl', 'Curl Avambracci'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell'],
  isolation: true,
  landmarks_required: ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow'],
  angles: {},
  positions: { forearms: { on_bench_or_knees: true }, movement: { wrist_flexion: true } },
  errors: {
    ARM_MOVEMENT: {
      detection: 'forearm_lift',
      severity: 'LOW',
      risk: 'Reduced isolation',
      cue_it: 'Solo il polso si muove',
      cue_en: 'Only wrist moves'
    }
  }
};

export const WRIST_EXTENSION: ExerciseDefinition = {
  id: 'WRIST_EXTENSION',
  names: ['Wrist Extension', 'Reverse Wrist Curl'],
  category: 'accessory',
  equipment: ['barbell', 'dumbbell'],
  isolation: true,
  landmarks_required: ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow'],
  angles: {},
  positions: { forearms: { on_bench_or_knees: true, palms_down: true }, movement: { wrist_extension: true } },
  errors: {
    ARM_MOVEMENT: {
      detection: 'forearm_lift',
      severity: 'LOW',
      risk: 'Reduced isolation',
      cue_it: 'Solo il polso si muove',
      cue_en: 'Only wrist moves'
    }
  }
};

export const NECK_CURL: ExerciseDefinition = {
  id: 'NECK_CURL',
  names: ['Neck Curl', 'Neck Flexion', 'Neck Training'],
  category: 'accessory',
  equipment: ['plate', 'machine'],
  isolation: true,
  landmarks_required: ['nose', 'left_shoulder', 'right_shoulder'],
  angles: {},
  positions: { movement: { controlled: true, full_rom: true } },
  errors: {
    TOO_HEAVY: {
      detection: 'jerky_movement',
      severity: 'HIGH',
      risk: 'Neck injury',
      cue_it: 'Usa meno peso, movimento controllato',
      cue_en: 'Use less weight, controlled movement'
    }
  },
  contraindications: ['neck_issues', 'cervical_problems']
};

export const HIP_ADDUCTION: ExerciseDefinition = {
  id: 'HIP_ADDUCTION',
  names: ['Hip Adduction', 'Adductor Machine', 'Adduttori'],
  category: 'accessory',
  equipment: ['machine', 'cable'],
  isolation: true,
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
  angles: {},
  positions: { movement: { legs_together: true } },
  errors: {
    MOMENTUM_USE: {
      detection: 'velocity_spike',
      severity: 'LOW',
      risk: 'Reduced work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    }
  }
};

export const HIP_ABDUCTION: ExerciseDefinition = {
  id: 'HIP_ABDUCTION',
  names: ['Hip Abduction', 'Abductor Machine', 'Abduttori'],
  category: 'accessory',
  equipment: ['machine', 'band'],
  isolation: true,
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
  angles: {},
  positions: { movement: { legs_apart: true } },
  errors: {
    MOMENTUM_USE: {
      detection: 'velocity_spike',
      severity: 'LOW',
      risk: 'Reduced work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    },
    LEANING: {
      detection: 'torso_lean',
      severity: 'LOW',
      risk: 'Cheating',
      cue_it: 'Stai dritto',
      cue_en: 'Stay upright'
    }
  }
};

// ============================================================================
// EXPORT ALL PART 2 EXERCISES
// ============================================================================

export const EXERCISE_DEFINITIONS_PART2: Record<string, ExerciseDefinition> = {
  // Vertical Push (continued)
  LATERAL_RAISE_MACHINE,
  FRONT_RAISE,
  REAR_DELT_FLY,
  REAR_DELT_MACHINE,

  // Core
  PLANK,
  SIDE_PLANK,
  DEAD_BUG,
  BIRD_DOG,
  HANGING_LEG_RAISE,
  PALLOF_PRESS,
  AB_WHEEL_ROLLOUT,
  HOLLOW_BODY,
  V_UPS,
  RUSSIAN_TWIST,
  WOODCHOP,
  CABLE_CRUNCH,
  SIT_UP,
  CRUNCH,
  LEG_LOWER,

  // Accessory
  BICEP_CURL,
  TRICEP_PUSHDOWN,
  SKULL_CRUSHERS,
  HAMMER_CURL,
  PREACHER_CURL,
  CALF_RAISE,
  SHRUGS,
  FOREARM_CURL,
  WRIST_EXTENSION,
  NECK_CURL,
  HIP_ADDUCTION,
  HIP_ABDUCTION
};

console.log(`[Biomechanics] Exercise definitions Part 2 loaded: ${Object.keys(EXERCISE_DEFINITIONS_PART2).length} exercises`);
