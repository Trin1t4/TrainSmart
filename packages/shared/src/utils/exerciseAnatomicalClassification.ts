/**
 * Exercise Anatomical Classification Database
 *
 * Complete anatomical breakdown of 60+ exercises by movement patterns.
 * Used for pain-based exercise substitution and program modification.
 */

import { BodyRegion } from './goldenStandardTests';

export interface ExerciseAnatomicalProfile {
  exerciseName: string;
  category: ExerciseCategory;
  primaryRegions: BodyRegion[];
  movements: MovementProfile[];
  contraindicated_if_pain_in: string[]; // movement keys
  safe_alternatives?: string[]; // exercise names
  clinical_notes?: string;
}

export type ExerciseCategory =
  | 'lower_push'
  | 'lower_pull'
  | 'upper_push_horizontal'
  | 'upper_push_vertical'
  | 'upper_pull_horizontal'
  | 'upper_pull_vertical'
  | 'core'
  | 'carry'
  | 'olympic';

export interface MovementProfile {
  region: BodyRegion;
  primary: string[]; // primary movement keys
  secondary: string[]; // secondary movement keys
  phase_specific?: {
    eccentric?: string[];
    bottom?: string[];
    concentric?: string[];
    top?: string[];
  };
}

// =============================================================================
// LOWER BODY PUSH (15 exercises)
// =============================================================================

const LOWER_PUSH: Record<string, ExerciseAnatomicalProfile> = {
  bodyweight_squat: {
    exerciseName: 'Bodyweight Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression'],
        secondary: ['neutral_spine_isometric'],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['spinal_flexion'], // potential buttwink
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction', 'hip_external_rotation'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'], // deep flexion
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          bottom: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'spinal_flexion',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression',
      'ankle_dorsiflexion'
    ],
    safe_alternatives: ['Box Squat', 'Leg Press', 'Wall Sit'],
    clinical_notes: 'Minimal load. Good for screening movement patterns. Can modify depth based on pain.'
  },

  goblet_squat: {
    exerciseName: 'Goblet Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['spinal_flexion'], // buttwink risk
          concentric: ['spinal_axial_compression', 'spinal_extension']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction', 'hip_external_rotation'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'], // deep hip flexion
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          bottom: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'spinal_flexion',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Box Squat', 'Bulgarian Split Squat', 'Leg Press'],
    clinical_notes: 'Front load helps maintain upright torso, reducing spinal flexion risk vs back squat.'
  },

  front_squat: {
    exerciseName: 'Front Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'thoracic_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'thoracic_spine',
        primary: ['thoracic_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['thoracic_extension'],
          concentric: ['thoracic_extension']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction', 'hip_external_rotation'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression',
      'ankle_dorsiflexion'
    ],
    safe_alternatives: ['Goblet Squat', 'Leg Press', 'Bulgarian Split Squat'],
    clinical_notes: 'More upright torso than back squat = less lumbar stress. Requires good thoracic extension and ankle dorsiflexion.'
  },

  back_squat: {
    exerciseName: 'Back Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['spinal_flexion'], // buttwink common
          concentric: ['spinal_axial_compression', 'spinal_extension']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction', 'hip_external_rotation'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'], // deep hip flexion
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          bottom: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'spinal_flexion',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Box Squat', 'Front Squat', 'Leg Press', 'Bulgarian Split Squat'],
    clinical_notes: 'King of exercises but high technical demand. Buttwink common if poor hip mobility. Can modify bar position (high vs low) and depth.'
  },

  box_squat: {
    exerciseName: 'Box Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['neutral_spine_isometric'], // paused on box
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'], // controlled depth
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Leg Press', 'Bulgarian Split Squat', 'Step-up'],
    clinical_notes: 'Excellent for controlling depth. Reduces buttwink risk. Box height adjustable for ROM limitation.'
  },

  bulgarian_split_squat: {
    exerciseName: 'Bulgarian Split Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'], // front leg
          bottom: ['hip_flexion', 'hip_flexor_stretch'], // back leg stretch
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression',
      'ankle_dorsiflexion'
    ],
    safe_alternatives: ['Step-up', 'Leg Press (single leg)', 'Split Squat (back foot on ground)'],
    clinical_notes: 'Excellent alternative to bilateral squats. Less spinal load. Can be hip or quad dominant based on torso angle.'
  },

  lunges: {
    exerciseName: 'Forward Lunges',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: ['spinal_axial_compression'],
        phase_specific: {
          eccentric: ['neutral_spine_isometric'],
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression', 'knee_shear_force'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression', 'knee_shear_force'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression',
      'knee_shear_force'
    ],
    safe_alternatives: ['Reverse Lunges', 'Step-ups', 'Bulgarian Split Squat'],
    clinical_notes: 'Forward lunges have higher knee shear force than reverse. Consider reverse lunges for knee pain.'
  },

  reverse_lunges: {
    exerciseName: 'Reverse Lunges',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: ['spinal_axial_compression'],
        phase_specific: {
          eccentric: ['neutral_spine_isometric'],
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Step-ups', 'Bulgarian Split Squat', 'Leg Press'],
    clinical_notes: 'Lower knee shear force than forward lunges. Better for knee pain. Easier to control descent.'
  },

  step_ups: {
    exerciseName: 'Step-ups',
    category: 'lower_push',
    primaryRegions: ['hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'], // loading phase
          concentric: ['hip_extension'] // step up
        }
      },
      {
        region: 'knee',
        primary: ['knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          concentric: ['knee_extension', 'patellofemoral_compression']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion', 'ankle_plantarflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'hip_extension',
      'knee_extension',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Bulgarian Split Squat', 'Leg Press', 'Wall Sit'],
    clinical_notes: 'Primarily concentric = less DOMS. Height adjustable for ROM control. Good for return to sport.'
  },

  leg_press: {
    exerciseName: 'Leg Press',
    category: 'lower_push',
    primaryRegions: ['hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_flexion'], // risk if pelvis tilts at bottom
        secondary: [],
        phase_specific: {
          bottom: ['spinal_flexion'] // buttwink equivalent
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Box Squat', 'Bulgarian Split Squat', 'Wall Sit'],
    clinical_notes: 'No spinal axial compression = good for back pain IF ROM controlled. Avoid excessive depth causing pelvic tilt.'
  },

  hack_squat: {
    exerciseName: 'Hack Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Leg Press', 'Bulgarian Split Squat', 'Front Squat'],
    clinical_notes: 'Quad-dominant variation. Fixed path = less stabilization demand. High patellofemoral compression.'
  },

  leg_extension: {
    exerciseName: 'Leg Extension',
    category: 'lower_push',
    primaryRegions: ['knee'],
    movements: [
      {
        region: 'knee',
        primary: ['knee_extension'],
        secondary: ['patellofemoral_compression', 'knee_shear_force'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension', 'patellofemoral_compression', 'knee_shear_force']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'knee_extension',
      'patellofemoral_compression',
      'knee_shear_force'
    ],
    safe_alternatives: ['Terminal Knee Extension', 'Spanish Squat', 'Step-ups'],
    clinical_notes: 'HIGH knee shear force. Often painful in patellofemoral pain syndrome. Use cautiously. Consider limited ROM (90-45°).'
  },

  pistol_squat: {
    exerciseName: 'Pistol Squat',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee', 'ankle'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'spinal_flexion'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_flexion'],
          bottom: ['spinal_flexion'],
          concentric: ['spinal_flexion']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction', 'hip_external_rotation'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'], // extreme deep flexion
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          bottom: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: ['ankle_dorsiflexion'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression',
      'ankle_dorsiflexion'
    ],
    safe_alternatives: ['Bulgarian Split Squat', 'Single Leg Press', 'Step-downs'],
    clinical_notes: 'Advanced exercise. Requires excellent mobility. High spinal flexion demand. Not recommended during back pain.'
  },

  wall_sit: {
    exerciseName: 'Wall Sit',
    category: 'lower_push',
    primaryRegions: ['knee', 'hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion'], // isometric hold
        secondary: [],
        phase_specific: {
          concentric: ['hip_flexion'] // isometric
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion'], // isometric hold
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          concentric: ['knee_flexion', 'patellofemoral_compression']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Spanish Squat', 'TKE', 'Seated Leg Press'],
    clinical_notes: 'Isometric exercise. No eccentric = minimal DOMS. Angle adjustable. Can be painful in patellofemoral pain at deep angles.'
  },

  spanish_squat: {
    exerciseName: 'Spanish Squat',
    category: 'lower_push',
    primaryRegions: ['knee'],
    movements: [
      {
        region: 'knee',
        primary: ['knee_flexion'], // isometric
        secondary: ['posterior_knee_shear'], // band pulls tibia backward
        phase_specific: {
          concentric: ['knee_flexion', 'posterior_knee_shear']
        }
      }
    ],
    contraindicated_if_pain_in: [],
    safe_alternatives: ['Wall Sit', 'Terminal Knee Extension', 'Partial Squats'],
    clinical_notes: 'Excellent for patellofemoral pain. Band creates posterior tibial translation = reduces patellofemoral compression.'
  },

  goblet_squat_heels_elevated: {
    exerciseName: 'Goblet Squat (Heels Elevated)',
    category: 'lower_push',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: ['patellofemoral_compression'],
        phase_specific: {
          eccentric: ['knee_flexion', 'patellofemoral_compression'],
          concentric: ['knee_extension']
        }
      },
      {
        region: 'ankle',
        primary: [], // dorsiflexion requirement reduced by heel elevation
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'hip_flexion',
      'knee_flexion',
      'patellofemoral_compression'
    ],
    safe_alternatives: ['Box Squat', 'Leg Press', 'Bulgarian Split Squat'],
    clinical_notes: 'Heel elevation compensates for limited ankle dorsiflexion. More upright torso = less spinal stress. Quad-dominant.'
  }
};

// =============================================================================
// LOWER BODY PULL (12 exercises)
// =============================================================================

const LOWER_PULL: Record<string, ExerciseAnatomicalProfile> = {
  conventional_deadlift: {
    exerciseName: 'Conventional Deadlift',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          eccentric: ['spinal_flexion'], // setup from floor
          bottom: ['spinal_flexion', 'spinal_axial_compression'],
          concentric: ['spinal_axial_compression', 'neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_flexion'],
          bottom: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'spinal_axial_compression',
      'hip_flexion'
    ],
    safe_alternatives: ['Rack Pull', 'Trap Bar Deadlift', 'Romanian Deadlift', 'Cable Pull-through'],
    clinical_notes: 'High spinal flexion demand at setup. Often problematic for flexion-intolerant backs. Consider alternatives or rack pulls.'
  },

  sumo_deadlift: {
    exerciseName: 'Sumo Deadlift',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension', 'hip_external_rotation'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion', 'hip_external_rotation'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression',
      'hip_external_rotation',
      'hip_adduction'
    ],
    safe_alternatives: ['Trap Bar Deadlift', 'Romanian Deadlift', 'Hip Thrust'],
    clinical_notes: 'More upright torso than conventional = less spinal flexion. Requires good hip external rotation. Better for back pain.'
  },

  romanian_deadlift: {
    exerciseName: 'Romanian Deadlift (RDL)',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'spinal_axial_compression'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          eccentric: ['neutral_spine_isometric', 'spinal_axial_compression'],
          bottom: ['spinal_flexion'], // if form breaks
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion', 'hamstring_stretch'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['soft_knee_isometric'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'hip_flexion'
    ],
    safe_alternatives: ['Cable Pull-through', 'Hip Thrust', 'Glute Bridge'],
    clinical_notes: 'Excellent hamstring exercise with minimal knee involvement. Critical: maintain neutral spine. Stop at hamstring stretch.'
  },

  trap_bar_deadlift: {
    exerciseName: 'Trap Bar Deadlift',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip', 'knee'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_axial_compression', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_axial_compression'],
          bottom: ['spinal_axial_compression'],
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_flexion'],
          concentric: ['knee_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_axial_compression'
    ],
    safe_alternatives: ['Romanian Deadlift', 'Cable Pull-through', 'Hip Thrust'],
    clinical_notes: 'More upright than conventional deadlift. Reduced spinal flexion demand. Excellent alternative for back pain. Hybrid squat/deadlift.'
  },

  hip_thrust: {
    exerciseName: 'Hip Thrust',
    category: 'lower_pull',
    primaryRegions: ['hip', 'lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_extension'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_extension'],
          top: ['spinal_extension']
        }
      },
      {
        region: 'hip',
        primary: ['hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension'],
          top: ['hip_hyperextension']
        }
      },
      {
        region: 'knee',
        primary: ['knee_flexion'], // isometric ~90°
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_extension',
      'hip_extension'
    ],
    safe_alternatives: ['Glute Bridge', 'Romanian Deadlift', 'Cable Pull-through'],
    clinical_notes: 'Excellent glute isolation. Can be problematic for extension-intolerant backs. Monitor for excessive lumbar extension at top.'
  },

  glute_bridge: {
    exerciseName: 'Glute Bridge',
    category: 'lower_pull',
    primaryRegions: ['hip', 'lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'spinal_extension'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_extension'],
          top: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_extension'
    ],
    safe_alternatives: ['Cable Pull-through', 'Quadruped Hip Extension', 'Romanian Deadlift'],
    clinical_notes: 'Bodyweight version of hip thrust. Less extension demand. Good progression exercise. Can add weight.'
  },

  good_morning: {
    exerciseName: 'Good Morning',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'spinal_axial_compression'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          eccentric: ['spinal_axial_compression', 'neutral_spine_isometric'],
          bottom: ['spinal_flexion'], // if form breaks
          concentric: ['spinal_axial_compression']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'spinal_axial_compression'
    ],
    safe_alternatives: ['Romanian Deadlift', 'Cable Pull-through', 'Hip Thrust'],
    clinical_notes: 'Advanced exercise. High spinal demand. Often painful in flexion-intolerant backs. Use cautiously.'
  },

  nordic_curl: {
    exerciseName: 'Nordic Hamstring Curl',
    category: 'lower_pull',
    primaryRegions: ['knee', 'hip'],
    movements: [
      {
        region: 'knee',
        primary: ['knee_flexion'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_extension'], // eccentric emphasis
          concentric: ['knee_flexion']
        }
      },
      {
        region: 'hip',
        primary: ['hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_extension'], // maintain extended hip
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'knee_flexion'
    ],
    safe_alternatives: ['Leg Curl', 'Romanian Deadlift', 'Glute-Ham Raise'],
    clinical_notes: 'Elite hamstring exercise. Very high eccentric load. Excellent for ACL injury prevention. Progress slowly.'
  },

  leg_curl: {
    exerciseName: 'Leg Curl (Lying/Seated)',
    category: 'lower_pull',
    primaryRegions: ['knee'],
    movements: [
      {
        region: 'knee',
        primary: ['knee_flexion'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_extension'],
          concentric: ['knee_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'knee_flexion'
    ],
    safe_alternatives: ['Romanian Deadlift', 'Glute Bridge', 'Nordic Curl'],
    clinical_notes: 'Isolated hamstring exercise. Lower load than Nordic curl. Good for beginners or rehab.'
  },

  single_leg_rdl: {
    exerciseName: 'Single Leg Romanian Deadlift',
    category: 'lower_pull',
    primaryRegions: ['lumbar_spine', 'hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'anti_rotation'],
        secondary: ['spinal_rotation'],
        phase_specific: {
          eccentric: ['neutral_spine_isometric', 'anti_rotation'],
          bottom: ['anti_rotation'],
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: ['hip_abduction'],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_rotation',
      'hip_flexion'
    ],
    safe_alternatives: ['Romanian Deadlift (bilateral)', 'Cable Pull-through', 'Hip Thrust'],
    clinical_notes: 'High balance and anti-rotation demand. Excellent functional exercise. Progress from bilateral RDL.'
  },

  cable_pull_through: {
    exerciseName: 'Cable Pull-through',
    category: 'lower_pull',
    primaryRegions: ['hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['neutral_spine_isometric'],
          concentric: ['neutral_spine_isometric']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion', 'hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          bottom: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [],
    safe_alternatives: ['Hip Thrust', 'Glute Bridge', 'Romanian Deadlift'],
    clinical_notes: 'Excellent deadlift teaching tool. Minimal spinal load. Safe for most back pain. Emphasizes hip hinge pattern.'
  },

  glute_ham_raise: {
    exerciseName: 'Glute-Ham Raise',
    category: 'lower_pull',
    primaryRegions: ['knee', 'hip'],
    movements: [
      {
        region: 'knee',
        primary: ['knee_flexion', 'knee_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['knee_extension'],
          concentric: ['knee_flexion']
        }
      },
      {
        region: 'hip',
        primary: ['hip_extension'],
        secondary: [],
        phase_specific: {
          eccentric: ['hip_flexion'],
          concentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'knee_flexion'
    ],
    safe_alternatives: ['Nordic Curl', 'Leg Curl', 'Romanian Deadlift'],
    clinical_notes: 'Advanced hamstring exercise. Combines knee flexion and hip extension. Very challenging. Progress from Nordic curl.'
  }
};

// Due to length constraints, I'll continue with the remaining exercise categories in the next response.
// This file will be completed with:
// - UPPER_PUSH_HORIZONTAL (8 exercises)
// - UPPER_PUSH_VERTICAL (7 exercises)
// - UPPER_PULL_HORIZONTAL (8 exercises)
// - UPPER_PULL_VERTICAL (6 exercises)
// - CORE (9 exercises)
// - Combined database and utility functions

// =============================================================================
// UPPER BODY PUSH HORIZONTAL (8 exercises)
// =============================================================================

const UPPER_PUSH_HORIZONTAL: Record<string, ExerciseAnatomicalProfile> = {
  pushup: {
    exerciseName: 'Push-up',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_horizontal_adduction'],
        secondary: ['shoulder_internal_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          bottom: ['shoulder_flexion'],
          concentric: ['shoulder_horizontal_adduction']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'anti_extension'],
        secondary: ['spinal_extension'],
        phase_specific: {
          eccentric: ['anti_extension'],
          concentric: ['anti_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_horizontal_adduction',
      'spinal_extension'
    ],
    safe_alternatives: ['Incline Push-up', 'Bench Press', 'Floor Press'],
    clinical_notes: 'Excellent closed-chain exercise. Requires core stability. Can modify with elevation for shoulder pain.'
  },

  bench_press: {
    exerciseName: 'Barbell Bench Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_horizontal_adduction'],
        secondary: ['shoulder_internal_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          bottom: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          concentric: ['shoulder_horizontal_adduction', 'shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_horizontal_adduction',
      'shoulder_internal_rotation'
    ],
    safe_alternatives: ['Floor Press', 'Incline Press', 'Dumbbell Press'],
    clinical_notes: 'Can stress anterior shoulder. Consider grip width modification. Floor press reduces ROM for shoulder pain.'
  },

  dumbbell_bench_press: {
    exerciseName: 'Dumbbell Bench Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_horizontal_adduction'],
        secondary: ['shoulder_internal_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          bottom: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          concentric: ['shoulder_horizontal_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_horizontal_adduction'
    ],
    safe_alternatives: ['Floor Press', 'Neutral Grip Press', 'Incline DB Press'],
    clinical_notes: 'More freedom than barbell = better for individual anatomy. Can adjust path. Neutral grip option for shoulder pain.'
  },

  incline_bench_press: {
    exerciseName: 'Incline Bench Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: ['shoulder_horizontal_adduction'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_abduction'],
          bottom: ['shoulder_flexion'],
          concentric: ['shoulder_flexion', 'shoulder_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'subacromial_impingement'
    ],
    safe_alternatives: ['Flat Bench Press', 'Floor Press', 'Landmine Press'],
    clinical_notes: 'More shoulder flexion than flat press. Can aggravate impingement. Consider lower incline (15-30°) vs steep (45°).'
  },

  decline_bench_press: {
    exerciseName: 'Decline Bench Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_horizontal_adduction'],
        secondary: ['shoulder_flexion'],
        phase_specific: {
          eccentric: ['shoulder_horizontal_abduction'],
          bottom: ['shoulder_horizontal_abduction'],
          concentric: ['shoulder_horizontal_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_horizontal_adduction'
    ],
    safe_alternatives: ['Flat Bench Press', 'Dips (partial ROM)', 'Cable Flyes'],
    clinical_notes: 'Less shoulder flexion than flat press. Often better tolerated with shoulder pain. Good flat press alternative.'
  },

  dips: {
    exerciseName: 'Parallel Bar Dips',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_adduction'],
        secondary: ['shoulder_internal_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          bottom: ['shoulder_flexion', 'shoulder_horizontal_abduction'],
          concentric: ['shoulder_extension', 'shoulder_horizontal_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_horizontal_abduction',
      'anterior_shoulder_stress'
    ],
    safe_alternatives: ['Bench Press', 'Close-Grip Bench Press', 'Overhead Press'],
    clinical_notes: 'High anterior shoulder stress at bottom. Often painful in impingement. Use limited ROM or avoid if shoulder pain.'
  },

  floor_press: {
    exerciseName: 'Floor Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_horizontal_adduction'],
        secondary: ['shoulder_flexion'],
        phase_specific: {
          eccentric: ['shoulder_horizontal_abduction'],
          bottom: ['shoulder_horizontal_abduction'], // limited ROM
          concentric: ['shoulder_horizontal_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_horizontal_adduction'
    ],
    safe_alternatives: ['Board Press', 'Pin Press', 'Close-Grip Bench'],
    clinical_notes: 'Excellent for shoulder pain. Limited ROM = reduced stress. Floor stops descent. Safe pressing variation.'
  },

  landmine_press: {
    exerciseName: 'Landmine Press',
    category: 'upper_push_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: ['shoulder_horizontal_adduction'],
        phase_specific: {
          eccentric: ['shoulder_extension'],
          concentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['anti_extension', 'anti_rotation'],
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion'
    ],
    safe_alternatives: ['Neutral Grip DB Press', 'Cable Press', 'Floor Press'],
    clinical_notes: 'Arc motion = often better for shoulder pain than fixed path. Single-arm version has core demand.'
  }
};

// =============================================================================
// UPPER BODY PUSH VERTICAL (7 exercises)
// =============================================================================

const UPPER_PUSH_VERTICAL: Record<string, ExerciseAnatomicalProfile> = {
  overhead_press: {
    exerciseName: 'Overhead Press (OHP)',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_abduction'],
          bottom: ['shoulder_flexion'],
          concentric: ['shoulder_flexion', 'shoulder_abduction'],
          top: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['anti_extension', 'neutral_spine_isometric'],
        secondary: ['spinal_extension'],
        phase_specific: {
          concentric: ['anti_extension'],
          top: ['spinal_extension'] // if excessive lean back
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_abduction',
      'subacromial_impingement',
      'spinal_extension'
    ],
    safe_alternatives: ['Landmine Press', 'DB Shoulder Press', 'Z-Press'],
    clinical_notes: 'High shoulder flexion demand. Often painful in impingement. Monitor for excessive lumbar extension.'
  },

  dumbbell_shoulder_press: {
    exerciseName: 'Dumbbell Shoulder Press',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          eccentric: ['shoulder_flexion', 'shoulder_abduction'],
          bottom: ['shoulder_flexion', 'shoulder_abduction'],
          concentric: ['shoulder_flexion', 'shoulder_abduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'shoulder_abduction',
      'subacromial_impingement'
    ],
    safe_alternatives: ['Neutral Grip DB Press', 'Landmine Press', 'Arnold Press'],
    clinical_notes: 'More freedom than barbell. Can adjust path. Neutral grip option reduces impingement risk.'
  },

  arnold_press: {
    exerciseName: 'Arnold Press',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion', 'shoulder_external_rotation'],
        secondary: ['shoulder_abduction'],
        phase_specific: {
          eccentric: ['shoulder_internal_rotation', 'shoulder_flexion'],
          bottom: ['shoulder_internal_rotation'],
          concentric: ['shoulder_external_rotation', 'shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_internal_rotation',
      'shoulder_external_rotation',
      'shoulder_flexion'
    ],
    safe_alternatives: ['Neutral Grip DB Press', 'Landmine Press', 'DB Shoulder Press'],
    clinical_notes: 'Rotation component = more shoulder stress. Avoid if rotator cuff issues. Good for healthy shoulders.'
  },

  pike_pushup: {
    exerciseName: 'Pike Push-up',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: ['shoulder_abduction'],
        phase_specific: {
          eccentric: ['shoulder_flexion'],
          bottom: ['shoulder_flexion'],
          concentric: ['shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'subacromial_impingement'
    ],
    safe_alternatives: ['Incline Push-up', 'DB Shoulder Press', 'Landmine Press'],
    clinical_notes: 'Bodyweight overhead press progression. High flexion demand. Can elevate feet for progression.'
  },

  handstand_pushup: {
    exerciseName: 'Handstand Push-up',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: ['shoulder_abduction'],
        phase_specific: {
          eccentric: ['shoulder_flexion'],
          bottom: ['shoulder_flexion'],
          concentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['spinal_extension', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          eccentric: ['spinal_extension'],
          concentric: ['spinal_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'spinal_extension'
    ],
    safe_alternatives: ['Pike Push-up', 'DB Shoulder Press', 'Overhead Press'],
    clinical_notes: 'Advanced exercise. High shoulder and core demand. Progress from pike push-up. Often has lumbar hyperextension.'
  },

  lateral_raise: {
    exerciseName: 'Lateral Raise',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_abduction'],
        secondary: [],
        phase_specific: {
          concentric: ['shoulder_abduction'],
          top: ['shoulder_abduction'],
          eccentric: ['shoulder_adduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_abduction',
      'subacromial_impingement'
    ],
    safe_alternatives: ['Cable Lateral Raise', 'Face Pulls', 'Y-Raise'],
    clinical_notes: 'Isolation exercise for middle delt. Can aggravate impingement at 60-120° arc. Consider stopping at 90°.'
  },

  front_raise: {
    exerciseName: 'Front Raise',
    category: 'upper_push_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: [],
        phase_specific: {
          concentric: ['shoulder_flexion'],
          top: ['shoulder_flexion'],
          eccentric: ['shoulder_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_flexion',
      'subacromial_impingement'
    ],
    safe_alternatives: ['Cable Front Raise', 'Landmine Press', 'Overhead Press'],
    clinical_notes: 'Isolation for anterior delt. Often aggravates impingement. Consider if anterior shoulder pain present.'
  }
};

// =============================================================================
// UPPER BODY PULL HORIZONTAL (8 exercises)
// =============================================================================

const UPPER_PULL_HORIZONTAL: Record<string, ExerciseAnatomicalProfile> = {
  barbell_row: {
    exerciseName: 'Barbell Row (Bent-over)',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          top: ['shoulder_extension'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['spinal_flexion', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_flexion'], // sustained hip hinge
          eccentric: ['spinal_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'shoulder_extension'
    ],
    safe_alternatives: ['Chest-Supported Row', 'Cable Row', 'Inverted Row'],
    clinical_notes: 'High spinal flexion demand. Often painful in flexion-intolerant backs. Consider supported row alternatives.'
  },

  dumbbell_row: {
    exerciseName: 'Dumbbell Row (Single-arm)',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['anti_rotation', 'neutral_spine_isometric'],
        secondary: ['spinal_flexion'],
        phase_specific: {
          concentric: ['anti_rotation'],
          eccentric: ['anti_rotation']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'spinal_rotation',
      'shoulder_extension'
    ],
    safe_alternatives: ['Chest-Supported Row', 'Cable Row', 'Seal Row'],
    clinical_notes: 'Less spinal load than barbell row if using bench support. Anti-rotation demand. Good unilateral option.'
  },

  cable_row: {
    exerciseName: 'Seated Cable Row',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion', 'shoulder_horizontal_adduction']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['neutral_spine_isometric'],
          eccentric: ['neutral_spine_isometric']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_horizontal_abduction'
    ],
    safe_alternatives: ['Chest-Supported Row', 'Inverted Row', 'TRX Row'],
    clinical_notes: 'Excellent row variation. Seated = minimal spinal stress. Good for back pain. Various grip options.'
  },

  inverted_row: {
    exerciseName: 'Inverted Row',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['neutral_spine_isometric', 'anti_extension'],
        secondary: ['spinal_extension'],
        phase_specific: {
          concentric: ['anti_extension'],
          eccentric: ['anti_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'spinal_extension'
    ],
    safe_alternatives: ['Cable Row', 'Chest-Supported Row', 'TRX Row (elevated)'],
    clinical_notes: 'Bodyweight row. Core anti-extension demand. Can adjust difficulty with body angle. Good pull-up progression.'
  },

  tbar_row: {
    exerciseName: 'T-Bar Row',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: [],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['spinal_flexion', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_flexion'],
          eccentric: ['spinal_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'shoulder_extension'
    ],
    safe_alternatives: ['Chest-Supported T-Bar Row', 'Cable Row', 'Seal Row'],
    clinical_notes: 'Similar to barbell row. High spinal flexion demand. Chest-supported version eliminates spinal load.'
  },

  face_pull: {
    exerciseName: 'Face Pulls',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_horizontal_abduction', 'shoulder_external_rotation'],
        secondary: ['shoulder_abduction'],
        phase_specific: {
          concentric: ['shoulder_horizontal_abduction', 'shoulder_external_rotation'],
          top: ['shoulder_external_rotation'],
          eccentric: ['shoulder_horizontal_adduction', 'shoulder_internal_rotation']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_external_rotation',
      'shoulder_horizontal_abduction'
    ],
    safe_alternatives: ['Cable Row', 'Band Pull-apart', 'Reverse Flyes'],
    clinical_notes: 'Excellent for shoulder health. Targets posterior delt and external rotators. Key for press/row balance.'
  },

  chest_supported_row: {
    exerciseName: 'Chest-Supported Row',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: [], // no load on spine
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension'
    ],
    safe_alternatives: ['Cable Row', 'Seal Row', 'TRX Row'],
    clinical_notes: 'ZERO spinal load. Excellent for back pain. Allows heavy loading of back muscles. Gold standard row for spine safety.'
  },

  seal_row: {
    exerciseName: 'Seal Row',
    category: 'upper_pull_horizontal',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_horizontal_abduction'],
        secondary: [],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_horizontal_abduction'],
          eccentric: ['shoulder_flexion']
        }
      },
      {
        region: 'lumbar_spine',
        primary: [], // no spinal load
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension'
    ],
    safe_alternatives: ['Chest-Supported Row', 'Cable Row', 'Inverted Row'],
    clinical_notes: 'Lying prone on elevated bench. ZERO spinal load. Excellent for back pain. Prevents cheating/momentum.'
  }
};

// =============================================================================
// UPPER BODY PULL VERTICAL (6 exercises)
// =============================================================================

const UPPER_PULL_VERTICAL: Record<string, ExerciseAnatomicalProfile> = {
  pullup: {
    exerciseName: 'Pull-up',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder', 'lumbar_spine'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_adduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_adduction'],
          top: ['shoulder_extension'],
          eccentric: ['shoulder_flexion', 'shoulder_abduction']
        }
      },
      {
        region: 'lumbar_spine',
        primary: ['spinal_extension', 'anti_extension'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_extension'],
          top: ['spinal_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_adduction',
      'spinal_extension'
    ],
    safe_alternatives: ['Lat Pulldown', 'Assisted Pull-up', 'Inverted Row'],
    clinical_notes: 'High shoulder extension demand. Can aggravate impingement or extension-intolerant backs. Progress from lat pulldown.'
  },

  chinup: {
    exerciseName: 'Chin-up',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_adduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_adduction'],
          top: ['shoulder_extension'],
          eccentric: ['shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_adduction'
    ],
    safe_alternatives: ['Neutral Grip Pull-up', 'Lat Pulldown (supinated)', 'Assisted Chin-up'],
    clinical_notes: 'Supinated grip = more biceps involvement. Often easier than pronated pull-up. Less shoulder external rotation demand.'
  },

  lat_pulldown: {
    exerciseName: 'Lat Pulldown',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_adduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_adduction'],
          top: ['shoulder_extension'],
          eccentric: ['shoulder_flexion', 'shoulder_abduction']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_adduction'
    ],
    safe_alternatives: ['Cable Row', 'Chest-Supported Row', 'Straight-Arm Pulldown'],
    clinical_notes: 'Scalable pull-up alternative. Various grip options. Good for shoulder pain (can reduce ROM/load).'
  },

  assisted_pullup: {
    exerciseName: 'Assisted Pull-up',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_adduction'],
        secondary: ['shoulder_external_rotation'],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_adduction'],
          eccentric: ['shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_adduction'
    ],
    safe_alternatives: ['Lat Pulldown', 'Inverted Row', 'Band-Assisted Pull-up'],
    clinical_notes: 'Scalable pull-up progression. Adjustable assistance. Good bridge from lat pulldown to pull-up.'
  },

  neutral_grip_pullup: {
    exerciseName: 'Neutral Grip Pull-up',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_extension', 'shoulder_adduction'],
        secondary: [],
        phase_specific: {
          concentric: ['shoulder_extension', 'shoulder_adduction'],
          eccentric: ['shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_extension',
      'shoulder_adduction'
    ],
    safe_alternatives: ['Neutral Grip Lat Pulldown', 'Chin-up', 'Inverted Row'],
    clinical_notes: 'Often best tolerated grip for shoulder pain. Reduced external rotation demand. Good for impingement.'
  },

  wide_grip_lat_pulldown: {
    exerciseName: 'Wide Grip Lat Pulldown',
    category: 'upper_pull_vertical',
    primaryRegions: ['shoulder'],
    movements: [
      {
        region: 'shoulder',
        primary: ['shoulder_adduction', 'shoulder_extension'],
        secondary: ['shoulder_external_rotation', 'shoulder_abduction'],
        phase_specific: {
          concentric: ['shoulder_adduction', 'shoulder_extension', 'shoulder_external_rotation'],
          top: ['shoulder_adduction'],
          eccentric: ['shoulder_abduction', 'shoulder_flexion']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'shoulder_adduction',
      'shoulder_external_rotation',
      'shoulder_abduction'
    ],
    safe_alternatives: ['Neutral Grip Pulldown', 'Close Grip Pulldown', 'Cable Row'],
    clinical_notes: 'Wide grip = higher shoulder stress. Can aggravate impingement. Consider closer grip for shoulder pain.'
  }
};

// =============================================================================
// CORE EXERCISES (9 exercises)
// =============================================================================

const CORE: Record<string, ExerciseAnatomicalProfile> = {
  plank: {
    exerciseName: 'Front Plank',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_extension', 'neutral_spine_isometric'],
        secondary: ['spinal_extension'],
        phase_specific: {
          concentric: ['anti_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_extension'
    ],
    safe_alternatives: ['Dead Bug', 'Bird Dog', 'Pallof Press'],
    clinical_notes: 'Excellent anti-extension exercise. Monitor for lumbar sag. If extension pain, substitute dead bug.'
  },

  side_plank: {
    exerciseName: 'Side Plank',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_lateral_flexion', 'neutral_spine_isometric'],
        secondary: ['spinal_lateral_flexion_right', 'spinal_lateral_flexion_left'],
        phase_specific: {
          concentric: ['anti_lateral_flexion']
        }
      },
      {
        region: 'shoulder',
        primary: ['shoulder_abduction'], // supporting arm
        secondary: []
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_lateral_flexion_right',
      'spinal_lateral_flexion_left',
      'shoulder_abduction'
    ],
    safe_alternatives: ['Pallof Press', 'Suitcase Carry', 'Copenhagen Plank (for adductors)'],
    clinical_notes: 'Anti-lateral flexion. Excellent for QL and obliques. Can modify with knee support. Also loads shoulder.'
  },

  dead_bug: {
    exerciseName: 'Dead Bug',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_extension', 'neutral_spine_isometric'],
        secondary: [],
        phase_specific: {
          concentric: ['anti_extension'],
          eccentric: ['anti_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [],
    safe_alternatives: ['Bird Dog', 'Plank', 'McGill Curl-up'],
    clinical_notes: 'GOLD STANDARD anti-extension. Very safe for back pain. Supine = spinal support. Excellent for rehab.'
  },

  bird_dog: {
    exerciseName: 'Bird Dog',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_extension', 'anti_rotation', 'neutral_spine_isometric'],
        secondary: ['spinal_extension', 'spinal_rotation_right', 'spinal_rotation_left'],
        phase_specific: {
          concentric: ['anti_extension', 'anti_rotation']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_extension'
    ],
    safe_alternatives: ['Dead Bug', 'Quadruped Shoulder Tap', 'Pallof Press'],
    clinical_notes: 'Excellent anti-extension/rotation. Good for back pain if extension tolerated. Monitor for lumbar extension.'
  },

  pallof_press: {
    exerciseName: 'Pallof Press',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_rotation', 'neutral_spine_isometric'],
        secondary: ['spinal_rotation_right', 'spinal_rotation_left'],
        phase_specific: {
          concentric: ['anti_rotation'],
          eccentric: ['anti_rotation']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_rotation_right',
      'spinal_rotation_left'
    ],
    safe_alternatives: ['Dead Bug', 'Bird Dog', 'Single-Arm Farmer Carry'],
    clinical_notes: 'EXCELLENT anti-rotation. Very safe. Standing or half-kneeling. Key for rotational sports.'
  },

  ab_wheel_rollout: {
    exerciseName: 'Ab Wheel Rollout',
    category: 'core',
    primaryRegions: ['lumbar_spine', 'shoulder'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['anti_extension'],
        secondary: ['spinal_extension'],
        phase_specific: {
          eccentric: ['anti_extension'],
          bottom: ['anti_extension'],
          concentric: ['anti_extension']
        }
      },
      {
        region: 'shoulder',
        primary: ['shoulder_flexion'],
        secondary: [],
        phase_specific: {
          eccentric: ['shoulder_flexion'],
          concentric: ['shoulder_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_extension',
      'shoulder_flexion'
    ],
    safe_alternatives: ['Plank', 'Dead Bug', 'Body Saw'],
    clinical_notes: 'Advanced anti-extension. High risk of lumbar hyperextension. Progress from plank. Monitor form carefully.'
  },

  hanging_leg_raise: {
    exerciseName: 'Hanging Leg Raise',
    category: 'core',
    primaryRegions: ['lumbar_spine', 'hip'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_flexion'],
        secondary: ['anti_extension'],
        phase_specific: {
          concentric: ['spinal_flexion'],
          top: ['spinal_flexion'],
          eccentric: ['anti_extension']
        }
      },
      {
        region: 'hip',
        primary: ['hip_flexion'],
        secondary: [],
        phase_specific: {
          concentric: ['hip_flexion'],
          eccentric: ['hip_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion',
      'hip_flexion'
    ],
    safe_alternatives: ['Dead Bug', 'Reverse Crunch', 'Knee Raise'],
    clinical_notes: 'Spinal flexion exercise. Contraindicated in flexion-intolerant backs. High hip flexor involvement.'
  },

  cable_crunch: {
    exerciseName: 'Cable Crunch (Kneeling)',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_flexion'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_flexion'],
          top: ['spinal_flexion'],
          eccentric: ['spinal_extension']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_flexion'
    ],
    safe_alternatives: ['Dead Bug', 'Plank', 'McGill Curl-up'],
    clinical_notes: 'Spinal flexion exercise. CONTRAINDICATED in flexion-intolerant backs (disc pathology). Use anti-extension exercises instead.'
  },

  russian_twist: {
    exerciseName: 'Russian Twist',
    category: 'core',
    primaryRegions: ['lumbar_spine'],
    movements: [
      {
        region: 'lumbar_spine',
        primary: ['spinal_rotation_right', 'spinal_rotation_left', 'spinal_flexion'],
        secondary: [],
        phase_specific: {
          concentric: ['spinal_rotation_right', 'spinal_rotation_left']
        }
      }
    ],
    contraindicated_if_pain_in: [
      'spinal_rotation_right',
      'spinal_rotation_left',
      'spinal_flexion'
    ],
    safe_alternatives: ['Pallof Press', 'Dead Bug', 'Bird Dog'],
    clinical_notes: 'Combined flexion + rotation. HIGH RISK for disc pathology. Stuart McGill recommends avoiding. Use Pallof Press instead.'
  }
};

// =============================================================================
// COMBINED DATABASE
// =============================================================================

export const EXERCISE_ANATOMICAL_DATABASE: Record<string, ExerciseAnatomicalProfile> = {
  ...LOWER_PUSH,
  ...LOWER_PULL,
  ...UPPER_PUSH_HORIZONTAL,
  ...UPPER_PUSH_VERTICAL,
  ...UPPER_PULL_HORIZONTAL,
  ...UPPER_PULL_VERTICAL,
  ...CORE
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get exercises that involve a specific movement pattern
 */
export function getExercisesByMovement(movementKey: string): string[] {
  return Object.values(EXERCISE_ANATOMICAL_DATABASE)
    .filter((exercise) =>
      exercise.movements.some(
        (movement) =>
          movement.primary.includes(movementKey) ||
          movement.secondary.includes(movementKey)
      )
    )
    .map((exercise) => exercise.exerciseName);
}

/**
 * Find safe alternatives for an exercise based on painful movements
 */
export function findSafeAlternatives(
  exerciseName: string,
  painfulMovements: string[]
): string[] {
  const exercise = EXERCISE_ANATOMICAL_DATABASE[exerciseName.toLowerCase().replace(/\s+/g, '_')];

  if (!exercise) {
    return [];
  }

  // Get suggested alternatives from the exercise itself
  const directAlternatives = exercise.safe_alternatives || [];

  // Find additional alternatives: same category, but don't use painful movements
  const categoryAlternatives = Object.values(EXERCISE_ANATOMICAL_DATABASE)
    .filter((alt) => {
      // Same category
      if (alt.category !== exercise.category) return false;

      // Different exercise
      if (alt.exerciseName === exercise.exerciseName) return false;

      // Check if alternative uses any painful movements
      const alternativeMovements = alt.movements.flatMap((m) => [
        ...m.primary,
        ...m.secondary
      ]);

      const usesPainfulMovement = alternativeMovements.some((movement) =>
        painfulMovements.includes(movement)
      );

      return !usesPainfulMovement;
    })
    .map((alt) => alt.exerciseName);

  // Combine and deduplicate
  return Array.from(new Set([...directAlternatives, ...categoryAlternatives]));
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: ExerciseCategory): ExerciseAnatomicalProfile[] {
  return Object.values(EXERCISE_ANATOMICAL_DATABASE).filter(
    (exercise) => exercise.category === category
  );
}

/**
 * Get exercise anatomical profile
 */
export function getExerciseProfile(exerciseName: string): ExerciseAnatomicalProfile | undefined {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  return EXERCISE_ANATOMICAL_DATABASE[normalized];
}

/**
 * Check if exercise is contraindicated for specific pain
 */
export function isExerciseContraindicated(
  exerciseName: string,
  painfulMovement: string
): boolean {
  const exercise = getExerciseProfile(exerciseName);
  if (!exercise) return false;

  return exercise.contraindicated_if_pain_in.includes(painfulMovement);
}

/**
 * Get all movements involved in an exercise
 */
export function getExerciseMovements(exerciseName: string): string[] {
  const exercise = getExerciseProfile(exerciseName);
  if (!exercise) return [];

  const allMovements = exercise.movements.flatMap((m) => [
    ...m.primary,
    ...m.secondary
  ]);

  return Array.from(new Set(allMovements));
}

/**
 * Get exercise statistics
 */
export function getExerciseStatistics() {
  const allExercises = Object.values(EXERCISE_ANATOMICAL_DATABASE);

  const byCategory = allExercises.reduce((acc, exercise) => {
    acc[exercise.category] = (acc[exercise.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allExercises.length,
    byCategory
  };
}

// Export count for verification
export const EXERCISE_COUNT = Object.keys(EXERCISE_ANATOMICAL_DATABASE).length;
