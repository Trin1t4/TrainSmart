/**
 * TRAINSMART BIOMECHANICS ENGINE - EXERCISE DEFINITIONS
 *
 * Definizioni dettagliate degli esercizi con:
 * - Landmarks richiesti per analisi
 * - Range di angoli corretti
 * - Errori comuni con cue correttive (IT/EN)
 *
 * @version 2.0.0
 * @author TrainSmart Team
 */

import type { ExerciseDefinition } from './exerciseDefinitionTypes';
import type { SupportedExercise } from '../../types/biomechanics.types';

// ============================================================================
// LOWER PUSH EXERCISES
// ============================================================================

export const BACK_SQUAT: ExerciseDefinition = {
  id: 'BACK_SQUAT',
  names: ['Back Squat', 'Squat', 'Barbell Squat'],
  category: 'lower_push',
  equipment: ['barbell'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'],
  angles: {
    knee: { min: 70, max: 180 },
    hip: { min: 40, max: 180 },
    torso: { min: 0, max: 60 }
  },
  positions: {
    bar: { on_traps: true },
    stance: { shoulder_width_or_wider: true },
    feet: { toes_slightly_out: true }
  },
  errors: {
    KNEE_CAVE: {
      detection: 'knee_width < ankle_width * 0.85',
      severity: 'HIGH',
      risk: 'ACL/MCL stress',
      cue_it: 'Spingi le ginocchia in fuori',
      cue_en: 'Push knees out'
    },
    HEEL_RISE: {
      detection: 'heel_lift > 0.02',
      severity: 'MEDIUM',
      risk: 'Forward balance shift',
      cue_it: 'Tieni i talloni a terra, lavora sulla mobilità caviglie',
      cue_en: 'Keep heels down, work on ankle mobility'
    },
    FORWARD_LEAN_EXCESSIVE: {
      detection: 'torso_angle > 60',
      severity: 'MEDIUM',
      risk: 'Lower back stress',
      cue_it: 'Petto alto, core contratto',
      cue_en: 'Chest up, core tight'
    },
    BUTT_WINK: {
      detection: 'pelvis_tuck_at_bottom',
      severity: 'MEDIUM',
      risk: 'Lumbar flexion under load',
      cue_it: 'Fermati prima del punto in cui perdi la curva lombare',
      cue_en: 'Stop before losing lumbar curve'
    },
    INSUFFICIENT_DEPTH: {
      detection: 'min_knee_angle > 100',
      severity: 'LOW',
      risk: 'Reduced stimulus',
      cue_it: 'Scendi più in basso se la mobilità lo permette',
      cue_en: 'Go deeper if mobility allows'
    }
  }
};

export const FRONT_SQUAT: ExerciseDefinition = {
  id: 'FRONT_SQUAT',
  names: ['Front Squat', 'Squat Frontale'],
  category: 'lower_push',
  equipment: ['barbell'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
  angles: {
    knee: { min: 60, max: 180 },
    hip: { min: 40, max: 180 },
    torso: { min: 0, max: 45 }
  },
  positions: {
    bar: { on_front_delts: true },
    elbows: { high: true }
  },
  errors: {
    ELBOW_DROP: {
      detection: 'elbow_below_shoulder',
      severity: 'HIGH',
      risk: 'Bar rolls forward',
      cue_it: 'Gomiti ALTI - puntali al muro davanti',
      cue_en: 'Elbows HIGH - point at wall ahead'
    },
    KNEE_CAVE: {
      detection: 'knee_width < ankle_width * 0.85',
      severity: 'HIGH',
      risk: 'ACL/MCL stress',
      cue_it: 'Spingi le ginocchia in fuori',
      cue_en: 'Push knees out'
    },
    FORWARD_LEAN_EXCESSIVE: {
      detection: 'torso_angle > 45',
      severity: 'HIGH',
      risk: 'Bar loss, back stress',
      cue_it: 'Stai più verticale, core strettissimo',
      cue_en: 'Stay more upright, core very tight'
    }
  }
};

export const BULGARIAN_SPLIT_SQUAT: ExerciseDefinition = {
  id: 'BULGARIAN_SPLIT_SQUAT',
  names: ['Bulgarian Split Squat', 'Squat Bulgaro', 'Split Squat Bulgaro'],
  category: 'lower_push',
  equipment: ['bodyweight', 'dumbbell', 'barbell'],
  unilateral: true,
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  angles: {
    front_knee: { min: 70, max: 95 },
    rear_knee: { min: 70, max: 100 }
  },
  positions: {
    rear_foot: { elevated: true },
    torso: { upright_or_slight_lean: true }
  },
  errors: {
    KNEE_CAVE: {
      detection: 'front_knee_inside_foot',
      severity: 'HIGH',
      risk: 'Knee stress',
      cue_it: 'Ginocchio anteriore in linea col piede',
      cue_en: 'Front knee in line with foot'
    },
    KNEE_OVER_TOE_EXCESSIVE: {
      detection: 'knee_far_past_toe',
      severity: 'MEDIUM',
      risk: 'Patellar stress',
      cue_it: 'Arretra il piede anteriore',
      cue_en: 'Step back with front foot'
    },
    TORSO_COLLAPSE: {
      detection: 'torso_angle > 40',
      severity: 'MEDIUM',
      risk: 'Balance, back stress',
      cue_it: 'Petto alto, core contratto',
      cue_en: 'Chest up, core tight'
    }
  }
};

export const LUNGES: ExerciseDefinition = {
  id: 'LUNGES',
  names: ['Lunges', 'Affondi', 'Walking Lunges'],
  category: 'lower_push',
  equipment: ['bodyweight', 'dumbbell', 'barbell'],
  unilateral: true,
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'],
  angles: {
    front_knee: { min: 80, max: 100 },
    rear_knee: { min: 70, max: 100 }
  },
  errors: {
    KNEE_CAVE: {
      detection: 'knee_inside_foot',
      severity: 'HIGH',
      risk: 'Knee injury',
      cue_it: 'Spingi il ginocchio in fuori',
      cue_en: 'Push knee out'
    },
    TORSO_LEAN: {
      detection: 'torso_angle > 25',
      severity: 'MEDIUM',
      risk: 'Balance issues',
      cue_it: 'Petto alto',
      cue_en: 'Chest up'
    },
    SHORT_STRIDE: {
      detection: 'stride_length < optimal',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Passo più lungo',
      cue_en: 'Longer stride'
    }
  }
};

export const LEG_PRESS: ExerciseDefinition = {
  id: 'LEG_PRESS',
  names: ['Leg Press', 'Pressa', 'Leg Press Machine'],
  category: 'lower_push',
  equipment: ['machine'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  angles: {
    knee: { min: 70, max: 180 }
  },
  positions: {
    back: { flat_on_pad: true },
    feet: { flat_on_platform: true }
  },
  errors: {
    BUTT_LIFT: {
      detection: 'hip_lifts_off_pad',
      severity: 'HIGH',
      risk: 'Lumbar injury',
      cue_it: 'Tieni la schiena a contatto, riduci la profondità',
      cue_en: 'Keep back on pad, reduce depth'
    },
    KNEE_LOCKOUT_HARD: {
      detection: 'knee_angle > 178',
      severity: 'HIGH',
      risk: 'Knee hyperextension',
      cue_it: 'Non bloccare completamente le ginocchia',
      cue_en: 'Don\'t fully lock knees'
    },
    KNEE_CAVE: {
      detection: 'knee_width < ankle_width * 0.85',
      severity: 'HIGH',
      risk: 'Knee stress',
      cue_it: 'Spingi le ginocchia in fuori',
      cue_en: 'Push knees out'
    }
  }
};

export const LEG_EXTENSION: ExerciseDefinition = {
  id: 'LEG_EXTENSION',
  names: ['Leg Extension', 'Leg Extension Machine'],
  category: 'lower_push',
  equipment: ['machine'],
  isolation: true,
  landmarks_required: ['left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  angles: {
    knee: { min: 180, optimal: 180, max: 180 }
  },
  errors: {
    MOMENTUM_USE: {
      detection: 'velocity_spike',
      severity: 'MEDIUM',
      risk: 'Joint stress',
      cue_it: 'Movimento controllato, no slanci',
      cue_en: 'Controlled movement, no swinging'
    },
    INCOMPLETE_EXTENSION: {
      detection: 'knee_angle < 170',
      severity: 'LOW',
      risk: 'Reduced peak contraction',
      cue_it: 'Estendi completamente in alto',
      cue_en: 'Fully extend at top'
    }
  }
};

// ============================================================================
// LOWER PULL EXERCISES
// ============================================================================

export const DEADLIFT_CONVENTIONAL: ExerciseDefinition = {
  id: 'DEADLIFT_CONVENTIONAL',
  names: ['Deadlift', 'Conventional Deadlift', 'Stacco'],
  category: 'lower_pull',
  equipment: ['barbell'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'],
  angles: {
    hip: { min: 0, max: 180 },
    knee: { min: 130, max: 180 },
    back: { min: 0, max: 45 }
  },
  positions: {
    bar: { over_mid_foot: true },
    shoulders: { over_or_slightly_ahead_of_bar: true },
    spine: { neutral: true }
  },
  errors: {
    ROUNDED_BACK: {
      detection: 'lumbar_flexion > 15',
      severity: 'HIGH',
      risk: 'Disc injury',
      cue_it: 'Petto fuori, schiena piatta, contrai i dorsali',
      cue_en: 'Chest out, flat back, engage lats'
    },
    HIPS_RISE_FIRST: {
      detection: 'hip_velocity > shoulder_velocity * 1.5',
      severity: 'HIGH',
      risk: 'Stiff-leg deadlift pattern, back stress',
      cue_it: 'Spingi il pavimento via, tutto sale insieme',
      cue_en: 'Push floor away, everything rises together'
    },
    BAR_DRIFT: {
      detection: 'bar_forward_of_midfoot',
      severity: 'MEDIUM',
      risk: 'Inefficient lever, back stress',
      cue_it: 'Tieni la sbarra attaccata alle gambe',
      cue_en: 'Keep bar close to legs'
    },
    LOCKOUT_INCOMPLETE: {
      detection: 'hip_angle < 175',
      severity: 'LOW',
      risk: 'Incomplete rep',
      cue_it: 'Stringi i glutei al top, anche avanti',
      cue_en: 'Squeeze glutes at top, hips forward'
    }
  }
};

export const DEADLIFT_SUMO: ExerciseDefinition = {
  id: 'DEADLIFT_SUMO',
  names: ['Sumo Deadlift', 'Stacco Sumo'],
  category: 'lower_pull',
  equipment: ['barbell'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_shoulder', 'right_shoulder'],
  angles: {
    hip: { min: 0, max: 180 },
    knee: { min: 100, max: 180 }
  },
  positions: {
    feet: { wide: true, toes_out_45: true },
    knees: { tracking_over_toes: true },
    torso: { more_upright: true }
  },
  errors: {
    KNEE_CAVE: {
      detection: 'knee_inside_foot_line',
      severity: 'HIGH',
      risk: 'Knee/hip stress',
      cue_it: 'Spingi le ginocchia in fuori verso le punte',
      cue_en: 'Push knees out toward toes'
    },
    ROUNDED_BACK: {
      detection: 'lumbar_flexion > 15',
      severity: 'HIGH',
      risk: 'Disc injury',
      cue_it: 'Petto alto, schiena neutra',
      cue_en: 'Chest up, neutral back'
    },
    HIPS_TOO_LOW: {
      detection: 'hip_below_optimal',
      severity: 'MEDIUM',
      risk: 'Inefficient start',
      cue_it: 'Anche più alte, leve più efficienti',
      cue_en: 'Hips higher, more efficient lever'
    }
  }
};

export const ROMANIAN_DEADLIFT: ExerciseDefinition = {
  id: 'ROMANIAN_DEADLIFT',
  names: ['Romanian Deadlift', 'RDL', 'Stacco Rumeno'],
  category: 'lower_pull',
  equipment: ['barbell', 'dumbbell'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder'],
  angles: {
    knee: { min: 145, max: 175 },
    hip_hinge: { min: 45, max: 90 }
  },
  positions: {
    bar: { close_to_legs: true },
    knees: { slight_bend_maintained: true },
    spine: { neutral: true }
  },
  errors: {
    KNEE_BEND_EXCESSIVE: {
      detection: 'knee_angle < 145',
      severity: 'MEDIUM',
      risk: 'Becomes squat pattern',
      cue_it: 'Mantieni le ginocchia quasi tese',
      cue_en: 'Keep knees almost straight'
    },
    ROUNDED_BACK: {
      detection: 'lumbar_flexion',
      severity: 'HIGH',
      risk: 'Back injury',
      cue_it: 'Schiena piatta, petto fuori',
      cue_en: 'Flat back, chest out'
    },
    INSUFFICIENT_HINGE: {
      detection: 'hip_hinge < 45',
      severity: 'LOW',
      risk: 'Reduced hamstring stretch',
      cue_it: 'Spingi i fianchi più indietro',
      cue_en: 'Push hips back more'
    }
  }
};

export const HIP_THRUST: ExerciseDefinition = {
  id: 'HIP_THRUST',
  names: ['Hip Thrust', 'Barbell Hip Thrust'],
  category: 'lower_pull',
  equipment: ['barbell', 'bodyweight', 'machine'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder'],
  angles: {
    hip_top: { min: 170, max: 190 },
    knee: { min: 80, max: 100 }
  },
  positions: {
    upper_back: { on_bench: true },
    feet: { flat_shoulder_width: true }
  },
  errors: {
    HYPEREXTENSION: {
      detection: 'hip_angle > 185',
      severity: 'MEDIUM',
      risk: 'Lumbar stress',
      cue_it: 'Stringi i glutei al top, non iperestendere',
      cue_en: 'Squeeze glutes at top, don\'t hyperextend'
    },
    KNEE_CAVE: {
      detection: 'knee_width < ankle_width * 0.85',
      severity: 'MEDIUM',
      risk: 'Knee stress',
      cue_it: 'Spingi le ginocchia in fuori',
      cue_en: 'Push knees out'
    },
    INCOMPLETE_EXTENSION: {
      detection: 'hip_angle < 170',
      severity: 'LOW',
      risk: 'Reduced glute contraction',
      cue_it: 'Estendi completamente, stringi al top',
      cue_en: 'Full extension, squeeze at top'
    }
  }
};

export const NORDIC_CURL: ExerciseDefinition = {
  id: 'NORDIC_CURL',
  names: ['Nordic Curl', 'Nordic Hamstring Curl'],
  category: 'lower_pull',
  equipment: ['bodyweight'],
  landmarks_required: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'],
  angles: {},
  positions: {
    ankles: { secured: true },
    body: { straight_line: 'knee_to_shoulder' }
  },
  errors: {
    HIP_BREAK: {
      detection: 'hip_flexion > 15',
      severity: 'HIGH',
      risk: 'Reduced hamstring work',
      cue_it: 'Mantieni il corpo dritto dalle ginocchia alle spalle',
      cue_en: 'Keep body straight from knees to shoulders'
    },
    FALLING_UNCONTROLLED: {
      detection: 'velocity_spike',
      severity: 'MEDIUM',
      risk: 'Hamstring strain',
      cue_it: 'Controlla la discesa il più possibile',
      cue_en: 'Control the descent as long as possible'
    }
  }
};

// ============================================================================
// HORIZONTAL PUSH EXERCISES
// ============================================================================

export const BENCH_PRESS: ExerciseDefinition = {
  id: 'BENCH_PRESS',
  names: ['Bench Press', 'Panca Piana', 'Flat Bench'],
  category: 'horizontal_push',
  equipment: ['barbell', 'bench'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: {
    elbow: { min: 70, max: 180 },
    shoulder_abduction: { min: 45, max: 75 }
  },
  positions: {
    grip: { medium_or_wide: true },
    back: { arch_optional: true, scapulae_retracted: true },
    feet: { flat_on_floor: true }
  },
  errors: {
    ELBOW_FLARE: {
      detection: 'shoulder_abduction > 75',
      severity: 'HIGH',
      risk: 'Shoulder impingement',
      cue_it: 'Gomiti a 45-75°, non a 90°',
      cue_en: 'Elbows at 45-75°, not 90°'
    },
    BAR_BOUNCE: {
      detection: 'velocity_spike_at_chest',
      severity: 'MEDIUM',
      risk: 'Rib/sternum stress',
      cue_it: 'Tocca il petto con controllo, no rimbalzo',
      cue_en: 'Touch chest with control, no bounce'
    },
    UNEVEN_LOCKOUT: {
      detection: 'left_elbow_angle != right_elbow_angle',
      severity: 'MEDIUM',
      risk: 'Muscle imbalance',
      cue_it: 'Spingi uniformemente con entrambe le braccia',
      cue_en: 'Push evenly with both arms'
    },
    BUTT_LIFT: {
      detection: 'hip_lifts_off_bench',
      severity: 'LOW',
      risk: 'Reduces ROM, powerlifting fault',
      cue_it: 'Glutei a contatto con la panca',
      cue_en: 'Glutes on bench'
    }
  }
};

export const PUSH_UP: ExerciseDefinition = {
  id: 'PUSH_UP',
  names: ['Push-up', 'Push Up', 'Piegamenti'],
  category: 'horizontal_push',
  equipment: ['bodyweight'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'],
  angles: {
    elbow: { min: 70, max: 180 }
  },
  positions: {
    body: { straight_line: 'shoulder_to_ankle' },
    hands: { shoulder_width: true }
  },
  errors: {
    HIP_SAG: {
      detection: 'hip_below_line > 10',
      severity: 'HIGH',
      risk: 'Lower back stress',
      cue_it: 'Stringi glutei e core, corpo dritto',
      cue_en: 'Squeeze glutes and core, body straight'
    },
    HIP_PIKE: {
      detection: 'hip_above_line > 10',
      severity: 'MEDIUM',
      risk: 'Reduced chest work',
      cue_it: 'Abbassa i fianchi in linea',
      cue_en: 'Lower hips in line'
    },
    ELBOW_FLARE: {
      detection: 'elbow_angle_from_body > 75',
      severity: 'MEDIUM',
      risk: 'Shoulder stress',
      cue_it: 'Gomiti a 45° dal corpo',
      cue_en: 'Elbows at 45° from body'
    },
    INCOMPLETE_ROM: {
      detection: 'min_elbow_angle > 100',
      severity: 'LOW',
      risk: 'Reduced stimulus',
      cue_it: 'Scendi fino a toccare quasi il pavimento',
      cue_en: 'Go down until almost touching floor'
    }
  }
};

export const DIPS_CHEST: ExerciseDefinition = {
  id: 'DIPS_CHEST',
  names: ['Dips', 'Chest Dips', 'Parallele'],
  category: 'horizontal_push',
  equipment: ['parallel_bars', 'dip_station'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_hip', 'right_hip'],
  angles: {
    elbow: { min: 70, max: 180 },
    torso_forward: { min: 15, max: 30 }
  },
  positions: {
    torso: { forward_lean: true },
    elbows: { flared_slightly: true }
  },
  errors: {
    INSUFFICIENT_DEPTH: {
      detection: 'elbow_angle > 100',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Scendi fino a 90° di flessione gomito',
      cue_en: 'Go down to 90° elbow flexion'
    },
    SHOULDER_FORWARD: {
      detection: 'shoulder_anterior_to_wrist',
      severity: 'HIGH',
      risk: 'Shoulder injury',
      cue_it: 'Non scendere troppo, fermati prima del dolore',
      cue_en: 'Don\'t go too low, stop before pain'
    },
    SWINGING: {
      detection: 'body_oscillation',
      severity: 'MEDIUM',
      risk: 'Momentum use',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    }
  }
};

// ============================================================================
// HORIZONTAL PULL EXERCISES
// ============================================================================

export const BARBELL_ROW: ExerciseDefinition = {
  id: 'BARBELL_ROW',
  names: ['Barbell Row', 'Bent Over Row', 'Rematore'],
  category: 'horizontal_pull',
  equipment: ['barbell'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist'],
  angles: {
    torso: { min: 30, max: 60 },
    elbow: { min: 0, max: 180 }
  },
  positions: {
    spine: { neutral: true },
    bar_path: { to_lower_chest_or_belly: true }
  },
  errors: {
    TORSO_RISE: {
      detection: 'torso_angle_increase > 20',
      severity: 'MEDIUM',
      risk: 'Uses momentum',
      cue_it: 'Mantieni il busto fermo',
      cue_en: 'Keep torso still'
    },
    ROUNDED_BACK: {
      detection: 'lumbar_flexion',
      severity: 'HIGH',
      risk: 'Back injury',
      cue_it: 'Schiena piatta, petto fuori',
      cue_en: 'Flat back, chest out'
    },
    INCOMPLETE_ROM: {
      detection: 'bar_doesnt_reach_body',
      severity: 'LOW',
      risk: 'Reduced back activation',
      cue_it: 'Tira fino al petto/pancia',
      cue_en: 'Pull to chest/belly'
    }
  }
};

export const DUMBBELL_ROW: ExerciseDefinition = {
  id: 'DUMBBELL_ROW',
  names: ['Dumbbell Row', 'One Arm Row', 'Rematore Manubrio'],
  category: 'horizontal_pull',
  equipment: ['dumbbell', 'bench'],
  unilateral: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_hip', 'right_hip'],
  angles: {
    torso: { min: 0, max: 30 }
  },
  positions: {
    support_hand: { on_bench: true },
    spine: { neutral: true }
  },
  errors: {
    TORSO_ROTATION: {
      detection: 'torso_rotation > 20',
      severity: 'MEDIUM',
      risk: 'Uses momentum',
      cue_it: 'Tieni le spalle orizzontali',
      cue_en: 'Keep shoulders level'
    },
    ELBOW_FLARE: {
      detection: 'elbow_far_from_body',
      severity: 'LOW',
      risk: 'Changes muscle emphasis',
      cue_it: 'Gomito vicino al corpo',
      cue_en: 'Elbow close to body'
    }
  }
};

export const CABLE_ROW: ExerciseDefinition = {
  id: 'CABLE_ROW',
  names: ['Cable Row', 'Seated Cable Row', 'Pulley'],
  category: 'horizontal_pull',
  equipment: ['cable'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_hip', 'right_hip'],
  angles: {},
  positions: {
    torso: { upright_or_slight_lean: true },
    knees: { slightly_bent: true }
  },
  errors: {
    EXCESSIVE_LEAN_BACK: {
      detection: 'torso_lean_back > 30',
      severity: 'MEDIUM',
      risk: 'Uses momentum',
      cue_it: 'Meno oscillazione, più controllo',
      cue_en: 'Less swinging, more control'
    },
    ROUNDED_SHOULDERS: {
      detection: 'shoulder_protraction',
      severity: 'LOW',
      risk: 'Reduced back activation',
      cue_it: 'Retrarre le scapole alla fine del movimento',
      cue_en: 'Retract scapulae at end of movement'
    }
  }
};

// ============================================================================
// VERTICAL PULL EXERCISES
// ============================================================================

export const PULL_UP: ExerciseDefinition = {
  id: 'PULL_UP',
  names: ['Pull-up', 'Pull Up', 'Trazioni'],
  category: 'vertical_pull',
  equipment: ['bar'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: {
    elbow: { min: 0, max: 180 }
  },
  positions: {
    grip: { pronated: true, wider_than_shoulder: true },
    start: { dead_hang: true },
    top: { chin_above_bar: true }
  },
  errors: {
    KIPPING: {
      detection: 'hip_swing',
      severity: 'LOW',
      risk: 'Reduces strict work',
      cue_it: 'Movimento controllato, no slancio',
      cue_en: 'Controlled movement, no swing'
    },
    INCOMPLETE_ROM_TOP: {
      detection: 'chin_below_bar',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Mento sopra la sbarra',
      cue_en: 'Chin above bar'
    },
    INCOMPLETE_ROM_BOTTOM: {
      detection: 'elbow_not_fully_extended',
      severity: 'LOW',
      risk: 'Reduced ROM',
      cue_it: 'Estendi completamente in basso',
      cue_en: 'Fully extend at bottom'
    }
  }
};

export const CHIN_UP: ExerciseDefinition = {
  id: 'CHIN_UP',
  names: ['Chin-up', 'Chin Up', 'Trazioni Supine'],
  category: 'vertical_pull',
  equipment: ['bar'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: {
    elbow: { min: 0, max: 180 }
  },
  positions: {
    grip: { supinated: true, shoulder_width: true },
    start: { dead_hang: true },
    top: { chin_above_bar: true }
  },
  errors: {
    KIPPING: {
      detection: 'hip_swing',
      severity: 'LOW',
      risk: 'Reduces strict work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    }
  },
  maps_to: 'PULL_UP'
};

export const LAT_PULLDOWN: ExerciseDefinition = {
  id: 'LAT_PULLDOWN',
  names: ['Lat Pulldown', 'Lat Machine', 'Tirata'],
  category: 'vertical_pull',
  equipment: ['cable', 'machine'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
  angles: {
    elbow: { min: 0, max: 180 }
  },
  positions: {
    torso: { slight_lean_back: true },
    bar_path: { to_upper_chest: true }
  },
  errors: {
    EXCESSIVE_LEAN_BACK: {
      detection: 'torso_lean > 30',
      severity: 'MEDIUM',
      risk: 'Uses momentum',
      cue_it: 'Meno inclinazione, più controllo',
      cue_en: 'Less lean, more control'
    },
    BEHIND_NECK: {
      detection: 'bar_behind_head',
      severity: 'HIGH',
      risk: 'Shoulder injury',
      cue_it: 'Tira al petto, non dietro la testa',
      cue_en: 'Pull to chest, not behind head'
    }
  }
};

// ============================================================================
// VERTICAL PUSH EXERCISES
// ============================================================================

export const OVERHEAD_PRESS: ExerciseDefinition = {
  id: 'OVERHEAD_PRESS',
  names: ['Overhead Press', 'Military Press', 'OHP', 'Lento Avanti'],
  category: 'vertical_push',
  equipment: ['barbell'],
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip'],
  angles: {
    elbow: { min: 0, max: 180 }
  },
  positions: {
    grip: { just_outside_shoulders: true },
    start: { bar_on_front_delts: true },
    lockout: { bar_over_mid_foot: true }
  },
  errors: {
    EXCESSIVE_BACK_LEAN: {
      detection: 'torso_lean_back > 15',
      severity: 'HIGH',
      risk: 'Lower back stress',
      cue_it: 'Core stretto, non inarcare',
      cue_en: 'Tight core, don\'t arch'
    },
    ELBOW_FLARE: {
      detection: 'elbow_behind_bar',
      severity: 'MEDIUM',
      risk: 'Shoulder stress',
      cue_it: 'Gomiti sotto la sbarra',
      cue_en: 'Elbows under bar'
    },
    BAR_FORWARD: {
      detection: 'bar_path_not_vertical',
      severity: 'LOW',
      risk: 'Inefficient lever',
      cue_it: 'Sbarra in linea verticale',
      cue_en: 'Bar in vertical line'
    }
  }
};

export const LATERAL_RAISE: ExerciseDefinition = {
  id: 'LATERAL_RAISE',
  names: ['Lateral Raise', 'Side Raise', 'Alzate Laterali'],
  category: 'vertical_push',
  equipment: ['dumbbell', 'cable'],
  isolation: true,
  landmarks_required: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
  angles: {
    arm_raise: { min: 80, max: 100 },
    elbow_bend: { min: 10, max: 30 }
  },
  positions: {
    top: { arms_parallel_to_floor: true },
    torso: { upright: true }
  },
  errors: {
    SHRUGGING: {
      detection: 'shoulder_elevation > 3',
      severity: 'MEDIUM',
      risk: 'Trap dominant',
      cue_it: 'Spalle basse, alza solo le braccia',
      cue_en: 'Shoulders down, raise only arms'
    },
    EXCESSIVE_SWING: {
      detection: 'momentum_use',
      severity: 'MEDIUM',
      risk: 'Reduced delt work',
      cue_it: 'Movimento controllato',
      cue_en: 'Controlled movement'
    },
    ARM_TOO_HIGH: {
      detection: 'arm_above_shoulder > 20',
      severity: 'LOW',
      risk: 'Shoulder impingement',
      cue_it: 'Fermati all\'altezza delle spalle',
      cue_en: 'Stop at shoulder height'
    }
  }
};

// ============================================================================
// EXPORT ALL EXERCISE DEFINITIONS
// ============================================================================

export const EXERCISE_DEFINITIONS: Record<string, ExerciseDefinition> = {
  // Lower Push
  BACK_SQUAT,
  FRONT_SQUAT,
  BULGARIAN_SPLIT_SQUAT,
  LUNGES,
  LEG_PRESS,
  LEG_EXTENSION,

  // Lower Pull
  DEADLIFT_CONVENTIONAL,
  DEADLIFT_SUMO,
  ROMANIAN_DEADLIFT,
  HIP_THRUST,
  NORDIC_CURL,

  // Horizontal Push
  BENCH_PRESS,
  PUSH_UP,
  DIPS_CHEST,

  // Horizontal Pull
  BARBELL_ROW,
  DUMBBELL_ROW,
  CABLE_ROW,

  // Vertical Pull
  PULL_UP,
  CHIN_UP,
  LAT_PULLDOWN,

  // Vertical Push
  OVERHEAD_PRESS,
  LATERAL_RAISE
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get exercise definition by ID
 */
export function getExerciseDefinition(id: SupportedExercise | string): ExerciseDefinition | undefined {
  return EXERCISE_DEFINITIONS[id];
}

/**
 * Get effective exercise definition (follows maps_to if present)
 */
export function getEffectiveExerciseDefinition(id: SupportedExercise | string): ExerciseDefinition | undefined {
  const def = EXERCISE_DEFINITIONS[id];
  if (!def) return undefined;

  if (def.maps_to) {
    return EXERCISE_DEFINITIONS[def.maps_to] || def;
  }
  return def;
}

/**
 * Get all error codes for an exercise
 */
export function getExerciseErrors(id: SupportedExercise | string): string[] {
  const def = getEffectiveExerciseDefinition(id);
  if (!def?.errors) return [];
  return Object.keys(def.errors);
}

/**
 * Get error cue in specified language
 */
export function getErrorCue(
  exerciseId: SupportedExercise | string,
  errorCode: string,
  language: 'it' | 'en' = 'it'
): string | undefined {
  const def = getEffectiveExerciseDefinition(exerciseId);
  if (!def?.errors?.[errorCode]) return undefined;

  return language === 'it'
    ? def.errors[errorCode].cue_it
    : def.errors[errorCode].cue_en;
}

console.log(`[Biomechanics] Exercise definitions loaded: ${Object.keys(EXERCISE_DEFINITIONS).length} exercises with error detection`);
