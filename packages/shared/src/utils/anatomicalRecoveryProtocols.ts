/**
 * Anatomical Recovery Protocols
 *
 * Evidence-based recovery protocols for common movement-based pain patterns.
 * Based on clinical guidelines, directional preference, and pain science.
 */

export interface RecoveryProtocol {
  movement_pattern: string; // movement key from anatomicalMovements
  protocol_name: string;
  diagnosis_hints: string[];
  common_in: string[];

  phase_1_acute: PhaseProtocol;
  phase_2_subacute: PhaseProtocol;
  phase_3_return: PhaseProtocol;

  red_flags?: string[]; // When to refer to medical professional
  clinical_pearls?: string[];
}

export interface PhaseProtocol {
  phase_name: string;
  avoid_movements: string[];
  avoid_exercises: string[];
  emphasize_movements?: string[];
  recommended_exercises: string[];
  goal: string;
  duration: string;
  progression_criteria?: string;
}

// =============================================================================
// SPINE PROTOCOLS (7 protocols)
// =============================================================================

const SPINE_PROTOCOLS: Record<string, RecoveryProtocol> = {
  flexion_intolerance: {
    movement_pattern: 'spinal_flexion',
    protocol_name: 'Flexion Intolerance Protocol',
    diagnosis_hints: [
      'Pain increases with forward bending',
      'Pain worse in morning or after sitting',
      'Pain better with standing/walking/extension',
      'Pain peripheralizes with flexion',
      'History of disc herniation or "slipped disc"'
    ],
    common_in: [
      'Lumbar disc herniation',
      'Posterior annular tear',
      'Discogenic pain',
      'Flexion-based mechanical back pain',
      'McKenzie Derangement Syndrome'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Establish Directional Preference',
      avoid_movements: [
        'spinal_flexion',
        'spinal_flexion_rotation_right',
        'spinal_flexion_rotation_left',
        'combined_flexion_rotation'
      ],
      avoid_exercises: [
        'Conventional Deadlift (from floor)',
        'Good Morning',
        'Barbell Row (bent-over)',
        'T-Bar Row',
        'Romanian Deadlift (if form breaks)',
        'Toe Touch',
        'Sit-ups',
        'Crunches',
        'Cable Crunch',
        'Hanging Leg Raise',
        'Russian Twist',
        'Jefferson Curl',
        'Any exercise requiring setup in spinal flexion'
      ],
      emphasize_movements: [
        'spinal_extension',
        'neutral_spine_isometric',
        'anti_extension',
        'anti_flexion'
      ],
      recommended_exercises: [
        'McKenzie Extensions (Prone Press-ups) - 10 reps every 2-3 hours',
        'Standing Extensions - 10 reps hourly',
        'Dead Bug - 3x10 each side',
        'Bird Dog - 3x10 each side',
        'Plank - 3x20-30sec',
        'Quadruped Arm/Leg Raise',
        'Rack Pull (mid-thigh height) - 3x8-10',
        'Trap Bar Deadlift (if tolerated) - 3x8',
        'Cable Pull-through - 3x12-15',
        'Hip Thrust - 3x12',
        'Chest-Supported Row - 3x10-12',
        'Cable Row - 3x10-12'
      ],
      goal: 'Centralize pain, establish extension directional preference, build anti-flexion core strength',
      duration: '2-4 weeks or until pain-free with extension movements',
      progression_criteria: 'Pain centralized, no peripheralization, pain-free in extension'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Gradual Flexion Reintroduction',
      avoid_movements: [
        'end_range_spinal_flexion',
        'loaded_spinal_flexion',
        'combined_flexion_rotation'
      ],
      avoid_exercises: [
        'Conventional Deadlift (from floor)',
        'Good Morning',
        'Full ROM bent-over movements',
        'Flexion-based core exercises',
        'Russian Twist'
      ],
      emphasize_movements: [
        'controlled_hip_hinge',
        'neutral_spine_isometric',
        'anti_extension'
      ],
      recommended_exercises: [
        'Romanian Deadlift (stop at hamstring stretch) - 3x8-10',
        'Trap Bar Deadlift - 3x8',
        'Rack Pull (knee height) - 3x8',
        'Goblet Squat (controlled depth) - 3x10',
        'Box Squat - 3x8-10',
        'Cable Pull-through - 3x12',
        'Hip Thrust - 3x10-12',
        'Single-Leg RDL - 3x8 each',
        'Chest-Supported Row - 3x10',
        'TRX Row (less flexion) - 3x10',
        'Plank variations - 3x30-45sec',
        'Dead Bug - 3x12',
        'Pallof Press - 3x10 each side',
        'Continue daily McKenzie extensions'
      ],
      goal: 'Build tolerance to controlled hip flexion, maintain neutral spine under load',
      duration: '4-6 weeks',
      progression_criteria: 'Pain-free in Phase 1 exercises for 2+ weeks, no centralization, can perform hip hinge with neutral spine'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [
        'end_range_loaded_flexion',
        'flexion_rotation_combined'
      ],
      avoid_exercises: [
        'Russian Twist',
        'Heavy Good Mornings',
        'Excessive flexion exercises'
      ],
      recommended_exercises: [
        'Conventional Deadlift (perfect form) - progressive loading',
        'Barbell Row - 3x8-10',
        'Sumo Deadlift - 3x6-8',
        'Front Squat - 3x6-8',
        'Back Squat - 3x6-8',
        'All Phase 2 exercises with progressive load'
      ],
      goal: 'Return to full training with maintained neutral spine awareness',
      duration: 'Ongoing maintenance',
      progression_criteria: 'Pain-free in Phase 2 for 2+ weeks, no peripheralization with loaded movements'
    },

    red_flags: [
      'Cauda equina symptoms (bowel/bladder dysfunction, saddle anesthesia)',
      'Progressive neurological deficits (foot drop, severe weakness)',
      'Severe unremitting pain not responding to position changes',
      'Pain not responding after 6-8 weeks of directional preference training',
      'Worsening symptoms despite adherence to protocol'
    ],

    clinical_pearls: [
      'McKenzie extensions are diagnostic AND therapeutic - perform frequently',
      'Morning is worst time - perform extensions upon waking',
      'Avoid sitting >30 min without extension break',
      'Educate on spine-sparing strategies for daily activities',
      'Directional preference (extension) typically maintains for life',
      'Most patients respond to McKenzie approach within 2 weeks'
    ]
  },

  extension_intolerance: {
    movement_pattern: 'spinal_extension',
    protocol_name: 'Extension Intolerance Protocol',
    diagnosis_hints: [
      'Pain increases with standing or walking',
      'Pain better with sitting or flexion',
      'Pain in back of spine',
      'Relief with forward bending',
      'Worse at end of day'
    ],
    common_in: [
      'Facet joint syndrome',
      'Spinal stenosis',
      'Spondylolisthesis',
      'Extension-based mechanical back pain',
      'Posterior element pathology'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Avoid Extension Provocation',
      avoid_movements: [
        'spinal_extension',
        'spinal_hyperextension',
        'combined_extension_rotation'
      ],
      avoid_exercises: [
        'McKenzie Extensions',
        'Standing Extension',
        'Overhead Press (if excessive lumbar extension)',
        'Hip Thrust (if excessive extension at top)',
        'Back Squat (if excessive extension)',
        'Good Morning',
        'Upright Row',
        'Any exercise with lumbar hyperextension'
      ],
      emphasize_movements: [
        'spinal_flexion',
        'neutral_spine_isometric',
        'anti_extension'
      ],
      recommended_exercises: [
        'Cat-Cow (emphasize cat/flexion) - 10 reps x 3-5/day',
        'Child\'s Pose - hold 30-60sec x 5/day',
        'Knee to Chest Stretch - 2x30sec each leg',
        'Dead Bug - 3x10',
        'Plank (avoid sag) - 3x20-30sec',
        'Goblet Squat - 3x10',
        'Leg Press - 3x10-12',
        'Bulgarian Split Squat - 3x8 each',
        'Cable Pull-through - 3x12',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Lat Pulldown - 3x10',
        'McGill Curl-up (if flexion tolerated) - 3x10'
      ],
      goal: 'Reduce posterior element loading, establish flexion directional preference, build core stability',
      duration: '2-4 weeks',
      progression_criteria: 'Pain reduced by 50%, can stand >20 min pain-free'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Gradual Extension Reintroduction',
      avoid_movements: [
        'loaded_spinal_hyperextension',
        'combined_extension_rotation'
      ],
      avoid_exercises: [
        'Heavy Overhead Press',
        'Standing Overhead movements',
        'Exercises requiring lumbar hyperextension'
      ],
      recommended_exercises: [
        'Front Squat (upright torso) - 3x8',
        'Goblet Squat - 3x10',
        'Leg Press - 3x10-12',
        'Bulgarian Split Squat - 3x8-10',
        'Romanian Deadlift (neutral spine) - 3x8',
        'Trap Bar Deadlift - 3x8',
        'Hip Thrust (limit top ROM) - 3x10',
        'Glute Bridge - 3x12',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Landmine Press (single-arm) - 3x8 each',
        'Plank variations - 3x30-45sec',
        'Dead Bug - 3x12',
        'Bird Dog - 3x10 each',
        'Pallof Press - 3x10 each'
      ],
      goal: 'Build load tolerance in neutral spine, strengthen core in anti-extension',
      duration: '4-6 weeks',
      progression_criteria: 'Can stand/walk >45 min pain-free, minimal pain with daily activities'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [
        'end_range_loaded_extension'
      ],
      avoid_exercises: [],
      recommended_exercises: [
        'Back Squat (monitor extension) - progressive loading',
        'Deadlift variations - 3x6-8',
        'Overhead Press (controlled) - 3x8',
        'All Phase 2 exercises with progressive load',
        'Maintain anti-extension core work'
      ],
      goal: 'Return to full training with maintained neutral spine',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free in Phase 2 for 3+ weeks'
    },

    red_flags: [
      'Progressive neurological deficits',
      'Severe stenosis symptoms (neurogenic claudication)',
      'Bladder/bowel dysfunction',
      'Severe unremitting pain',
      'No response after 6-8 weeks'
    ],

    clinical_pearls: [
      'Flexion typically provides relief - use strategically',
      'Avoid prolonged standing - sit/flex frequently',
      'Core bracing in neutral reduces extension stress',
      'May need permanent modification of overhead work',
      'Consider epidural injection if conservative care fails'
    ]
  },

  rotation_intolerance: {
    movement_pattern: 'spinal_rotation_right',
    protocol_name: 'Rotation Intolerance Protocol',
    diagnosis_hints: [
      'Pain with twisting movements',
      'Pain getting in/out of car',
      'Unilateral pain',
      'Pain with golf swing or similar rotation',
      'Sharp pain with rotation'
    ],
    common_in: [
      'Facet joint dysfunction',
      'Disc pathology (lateral)',
      'Sacroiliac joint dysfunction',
      'Multifidus weakness',
      'Rotation-based injury'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Avoid Rotation Stress',
      avoid_movements: [
        'spinal_rotation_right',
        'spinal_rotation_left',
        'combined_flexion_rotation',
        'loaded_rotation'
      ],
      avoid_exercises: [
        'Russian Twist',
        'Barbell Row (if rotation)',
        'Single-Arm Dumbbell Row (painful side)',
        'Rotational cable exercises',
        'Woodchops',
        'Landmine rotations',
        'Any exercise with spinal rotation'
      ],
      emphasize_movements: [
        'anti_rotation',
        'neutral_spine_isometric',
        'bilateral_symmetrical_movements'
      ],
      recommended_exercises: [
        'Dead Bug - 3x10 each',
        'Bird Dog - 3x10 each',
        'Plank - 3x30sec',
        'Pallof Press (CRITICAL) - 3x10 each side',
        'Front Squat - 3x8',
        'Goblet Squat - 3x10',
        'Leg Press - 3x10',
        'Hip Thrust - 3x12',
        'Trap Bar Deadlift - 3x8',
        'Chest-Supported Row (bilateral) - 3x10',
        'Cable Row (bilateral) - 3x10',
        'Lat Pulldown - 3x10',
        'Bench Press - 3x8',
        'Overhead Press - 3x8'
      ],
      goal: 'Build anti-rotation strength, reduce rotation stress, establish neutral spine control',
      duration: '2-4 weeks',
      progression_criteria: 'Pain reduced by 50%, can perform anti-rotation exercises pain-free'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Controlled Rotation Introduction',
      avoid_movements: [
        'end_range_rotation',
        'loaded_rotation'
      ],
      avoid_exercises: [
        'Russian Twist',
        'Heavy rotational exercises'
      ],
      recommended_exercises: [
        'Pallof Press - 3x12 each',
        'Pallof Press with Walk-out - 3x8 each',
        'Single-Arm Cable Row (light) - 3x10 each',
        'Single-Arm DB Row - 3x10 each',
        'Single-Leg RDL - 3x8 each',
        'Suitcase Carry - 3x30m each',
        'Farmer Carry (bilateral) - 3x40m',
        'Half-Kneeling Pallof Press - 3x10 each',
        'All Phase 1 bilateral exercises',
        'Deadlift variations - 3x6-8',
        'Squat variations - 3x8-10'
      ],
      goal: 'Build tolerance to controlled asymmetric loading, progress anti-rotation capacity',
      duration: '4-6 weeks',
      progression_criteria: 'Can perform single-arm exercises pain-free, no pain with car entry/exit'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [
        'Russian Twist (consider permanent avoidance per McGill)'
      ],
      recommended_exercises: [
        'Progressive rotational exercises',
        'Sport-specific rotation (if applicable)',
        'All Phase 2 exercises with progressive load',
        'Maintain anti-rotation core work 2x/week'
      ],
      goal: 'Return to full activity including rotation demands',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free in Phase 2 for 3+ weeks, no pain with sport/life rotation'
    },

    red_flags: [
      'Radicular symptoms',
      'Progressive weakness',
      'No improvement after 6 weeks',
      'Severe unilateral symptoms'
    ],

    clinical_pearls: [
      'Pallof Press is cornerstone exercise',
      'Anti-rotation strength often more important than rotation strength',
      'Avoid Russian Twist even after recovery (McGill recommendation)',
      'Carries excellent functional anti-rotation training',
      'Address asymmetries in hip/shoulder mobility'
    ]
  },

  axial_compression_intolerance: {
    movement_pattern: 'spinal_axial_compression',
    protocol_name: 'Axial Compression Intolerance Protocol',
    diagnosis_hints: [
      'Pain worse with loaded spinal exercises',
      'Pain with squats, overhead press, deadlifts',
      'Relief with decompression',
      'Generalized back pain with loading',
      'Pain increases throughout training session'
    ],
    common_in: [
      'Disc degeneration',
      'Vertebral endplate issues',
      'General spine sensitivity',
      'Post-injury spine',
      'Chronic back pain'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Minimize Compression',
      avoid_movements: [
        'spinal_axial_compression',
        'loaded_vertical_compression'
      ],
      avoid_exercises: [
        'Back Squat',
        'Front Squat',
        'Overhead Press (standing)',
        'Good Morning',
        'Conventional Deadlift',
        'Any exercise with barbell on back'
      ],
      emphasize_movements: [
        'horizontal_loading',
        'unloaded_movements',
        'decompression'
      ],
      recommended_exercises: [
        'Leg Press - 3x10-12',
        'Bulgarian Split Squat (DB) - 3x8 each',
        'Step-ups - 3x10 each',
        'Hip Thrust - 3x12',
        'Glute Bridge - 3x15',
        'Cable Pull-through - 3x12',
        'Romanian Deadlift (light DB) - 3x10',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Lat Pulldown - 3x10',
        'Bench Press - 3x8',
        'Push-ups - 3x10-15',
        'Landmine Press - 3x10',
        'Dead Bug - 3x10',
        'Plank - 3x30sec',
        'Hanging Knee Raise (decompression) - 3x8'
      ],
      goal: 'Maintain strength without compression stress, allow spine recovery',
      duration: '3-4 weeks',
      progression_criteria: 'Back pain reduced by 60%, can train without increasing pain'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Gradual Compression Reintroduction',
      avoid_movements: [
        'heavy_axial_compression'
      ],
      avoid_exercises: [
        'Heavy Back Squat',
        'Heavy Overhead Press'
      ],
      recommended_exercises: [
        'Goblet Squat (light-moderate) - 3x10',
        'Front Squat (light-moderate) - 3x8',
        'Box Squat - 3x8',
        'Trap Bar Deadlift (light-moderate) - 3x8',
        'Hack Squat - 3x10',
        'Leg Press - 3x10-12',
        'Bulgarian Split Squat - 3x8-10',
        'Romanian Deadlift - 3x8',
        'Hip Thrust - 3x10-12',
        'DB Shoulder Press (seated) - 3x10',
        'Landmine Press - 3x10',
        'All Phase 1 exercises with progressive load'
      ],
      goal: 'Build tolerance to moderate compression, progressive loading',
      duration: '6-8 weeks',
      progression_criteria: 'Can perform light-moderate loaded exercises pain-free'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Back Squat (progressive loading) - 3x6-8',
        'Overhead Press - 3x6-8',
        'Conventional Deadlift - 3x5-6',
        'All compound movements',
        'Maintain decompression work (hanging, cat-cow)'
      ],
      goal: 'Return to full training with load management',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free with moderate loads in Phase 2 for 4+ weeks'
    },

    red_flags: [
      'Severe disc pathology',
      'Fracture',
      'Tumor',
      'Infection',
      'Worsening neurological symptoms'
    ],

    clinical_pearls: [
      'Decompression between sets helpful (hanging, cat-cow)',
      'Consider belt for heavy lifts when returning',
      'Horizontal loading preserves strength without compression',
      'May need permanent load management vs maximal loading',
      'Technique critical - spinal position under load matters'
    ]
  },

  lateral_flexion_intolerance: {
    movement_pattern: 'spinal_lateral_flexion_right',
    protocol_name: 'Lateral Flexion Pain Protocol',
    diagnosis_hints: [
      'Unilateral pain with side bending',
      'Pain bending to one side',
      'QL or lateral back pain',
      'Pain with overhead reach',
      'Asymmetric pain'
    ],
    common_in: [
      'Quadratus lumborum strain',
      'Unilateral facet dysfunction',
      'Lateral disc pathology',
      'SI joint dysfunction',
      'Muscle imbalance'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Avoid Lateral Stress',
      avoid_movements: [
        'spinal_lateral_flexion_right',
        'spinal_lateral_flexion_left',
        'asymmetric_loading'
      ],
      avoid_exercises: [
        'Side Plank (painful side)',
        'Suitcase Carry (if painful)',
        'Single-Arm Overhead Press',
        'Windmills',
        'Side bends',
        'Asymmetric loaded movements'
      ],
      emphasize_movements: [
        'bilateral_symmetrical',
        'neutral_spine_isometric',
        'anti_lateral_flexion'
      ],
      recommended_exercises: [
        'Dead Bug - 3x10',
        'Bird Dog - 3x10',
        'Plank - 3x30sec',
        'Side Plank (non-painful side only) - 3x20sec',
        'Pallof Press - 3x10 each',
        'Goblet Squat - 3x10',
        'Leg Press - 3x10',
        'Hip Thrust - 3x12',
        'Bilateral exercises (symmetric loading)',
        'Gentle stretching of painful side QL'
      ],
      goal: 'Reduce lateral stress, build bilateral strength, address imbalances',
      duration: '2-3 weeks',
      progression_criteria: 'Pain reduced by 50%, can perform symmetric exercises pain-free'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive Unilateral Work',
      avoid_movements: [
        'end_range_lateral_flexion'
      ],
      avoid_exercises: [
        'Heavy lateral flexion exercises'
      ],
      recommended_exercises: [
        'Side Plank (both sides, progress gradually) - 3x20-30sec',
        'Copenhagen Plank - 3x15-20sec',
        'Suitcase Carry (light) - 3x30m each',
        'Single-Arm Farmer Carry - 3x30m',
        'Single-Leg RDL - 3x8 each',
        'Bulgarian Split Squat - 3x8 each',
        'Single-Arm Cable Row - 3x10 each',
        'Single-Arm DB Row - 3x10 each',
        'All bilateral exercises from Phase 1'
      ],
      goal: 'Build unilateral strength and anti-lateral flexion capacity',
      duration: '4-6 weeks',
      progression_criteria: 'Can perform side plank both sides pain-free, carries pain-free'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'All unilateral and bilateral exercises',
        'Progressive single-arm overhead work',
        'Maintain carry variations 2x/week',
        'Continue side plank for prevention'
      ],
      goal: 'Full return with maintained lateral stability',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free Phase 2 for 3+ weeks'
    },

    red_flags: [
      'Kidney pathology symptoms',
      'Severe unilateral radicular pain',
      'Progressive weakness',
      'No improvement after 6 weeks'
    ],

    clinical_pearls: [
      'Often related to asymmetric sport/work demands',
      'Address hip mobility asymmetries',
      'QL stretching helpful in acute phase',
      'Carries excellent for lateral stability',
      'Side plank progression key exercise'
    ]
  },

  si_joint_dysfunction: {
    movement_pattern: 'si_joint_stress',
    protocol_name: 'SI Joint Dysfunction Protocol',
    diagnosis_hints: [
      'Unilateral buttock/SI joint pain',
      'Pain with single-leg activities',
      'Pain getting in/out of car',
      'Pain rolling in bed',
      'Positive FABER or Gaenslen test'
    ],
    common_in: [
      'Sacroiliac joint dysfunction',
      'Post-partum SI pain',
      'Hypermobility-related SI pain',
      'Asymmetric loading injuries',
      'SI joint instability'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Stabilize SI Joint',
      avoid_movements: [
        'single_leg_loading',
        'si_joint_shear',
        'asymmetric_hip_movements'
      ],
      avoid_exercises: [
        'Single-Leg Deadlift',
        'Single-Leg Squat',
        'Bulgarian Split Squat',
        'Lunges',
        'Step-ups',
        'Single-Leg Hip Thrust',
        'Heavy squats without belt'
      ],
      emphasize_movements: [
        'bilateral_symmetrical',
        'pelvic_stability',
        'core_bracing'
      ],
      recommended_exercises: [
        'Dead Bug - 3x10',
        'Bird Dog - 3x10',
        'Clamshells - 3x15 each',
        'Glute Bridge (bilateral) - 3x12',
        'Hip Thrust (bilateral) - 3x10',
        'Quadruped Hip Extension - 3x10 each',
        'Goblet Squat (narrow stance) - 3x10',
        'Leg Press (bilateral) - 3x10',
        'Cable Pull-through - 3x12',
        'Plank - 3x30sec',
        'Side Plank - 3x20sec each',
        'SI joint belt usage during training',
        'Active Straight Leg Raise with compression - 3x8 each'
      ],
      goal: 'Restore pelvic stability, reduce SI joint irritability, strengthen stabilizers',
      duration: '2-4 weeks',
      progression_criteria: 'Pain reduced by 50%, improved ASLR test, reduced SI joint tenderness'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive Unilateral Loading',
      avoid_movements: [
        'extreme_single_leg_loading'
      ],
      avoid_exercises: [
        'Heavy single-leg work'
      ],
      recommended_exercises: [
        'Bulgarian Split Squat (light) - 3x8 each',
        'Reverse Lunges (light) - 3x8 each',
        'Step-ups (low height) - 3x10 each',
        'Single-Leg Glute Bridge - 3x10 each',
        'Single-Leg Hip Thrust - 3x8 each',
        'Lateral Band Walks - 3x15 each direction',
        'Monster Walks - 3x12 each direction',
        'Copenhagen Plank - 3x15sec each',
        'Single-Leg RDL (light DB) - 3x8 each',
        'Front Squat - 3x8',
        'Back Squat (with belt) - 3x8',
        'Trap Bar Deadlift - 3x8',
        'All Phase 1 exercises with progressive load'
      ],
      goal: 'Build unilateral strength and load tolerance with SI joint stability',
      duration: '4-6 weeks',
      progression_criteria: 'Can perform single-leg exercises with minimal pain, improved ASLR'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Progressive unilateral training',
        'Sport-specific single-leg work',
        'All compound lifts',
        'Maintain hip stabilizer work 2x/week (clamshells, lateral walks)',
        'Consider SI belt for heavy lifts if needed'
      ],
      goal: 'Full return to activity with maintained pelvic stability',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free Phase 2 for 3-4 weeks, negative provocation tests'
    },

    red_flags: [
      'Severe instability requiring bracing',
      'Inflammatory arthropathy (ankylosing spondylitis)',
      'Pregnancy-related severe instability',
      'No improvement after 8 weeks',
      'Neurological symptoms'
    ],

    clinical_pearls: [
      'SI belt can be very helpful acutely',
      'ASLR test tracks progress',
      'Hip external rotator weakness common contributor',
      'Avoid excessive asymmetric loading',
      'Post-partum patients may need longer recovery',
      'Manual therapy can be adjunct to exercise'
    ]
  },

  thoracic_mobility_restriction: {
    movement_pattern: 'thoracic_extension',
    protocol_name: 'Thoracic Mobility Restriction Protocol',
    diagnosis_hints: [
      'Upper back stiffness',
      'Limited overhead reach',
      'Compensatory lumbar extension with overhead work',
      'Shoulder pain with overhead exercises',
      'Rounded upper back posture'
    ],
    common_in: [
      'Desk workers',
      'Hyperkyphotic posture',
      'Overhead athletes with poor mobility',
      'Post-injury stiffness',
      'General deconditioning'
    ],

    phase_1_acute: {
      phase_name: 'Mobility Restoration Phase',
      avoid_movements: [
        'forced_thoracic_flexion',
        'end_range_compression'
      ],
      avoid_exercises: [
        'Heavy overhead pressing until mobility improved',
        'Exercises requiring significant thoracic extension'
      ],
      emphasize_movements: [
        'thoracic_extension',
        'thoracic_rotation',
        'scapular_mobility'
      ],
      recommended_exercises: [
        'Thoracic Extension on Foam Roller - 2min x 2/day',
        'Cat-Cow (emphasize thoracic) - 10 reps x 3/day',
        'Thread the Needle - 3x10 each side',
        'Quadruped Thoracic Rotation - 3x12 each',
        'Wall Slides - 3x12',
        'Face Pulls - 3x15',
        'Band Pull-aparts - 3x20',
        'Chest-Supported Row - 3x10',
        'Lat Pulldown - 3x10',
        'Landmine Press - 3x10',
        'Incline Bench Press (moderate angle) - 3x8',
        'Lower body training (no restrictions)'
      ],
      goal: 'Restore thoracic extension and rotation mobility',
      duration: '2-4 weeks',
      progression_criteria: 'Improved thoracic extension ROM, can reach overhead without lumbar compensation'
    },

    phase_2_subacute: {
      phase_name: 'Loaded Mobility Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Overhead Press (progressive) - 3x8-10',
        'DB Shoulder Press - 3x10',
        'Landmine Press - 3x10',
        'Face Pulls - 3x15',
        'Band Pull-aparts - 3x20',
        'Chest-Supported Row - 3x10',
        'All Phase 1 mobility work (daily)',
        'Front Squat (requires thoracic extension) - 3x8',
        'Overhead Squat (light, mobility work) - 3x10'
      ],
      goal: 'Strengthen in new ROM, maintain mobility gains',
      duration: '4-6 weeks',
      progression_criteria: 'Can perform overhead press with good form, no compensatory lumbar extension'
    },

    phase_3_return: {
      phase_name: 'Maintenance Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'All overhead exercises',
        'Maintain thoracic mobility work 3-4x/week',
        'Foam rolling before upper body sessions',
        'Continue face pulls and band work'
      ],
      goal: 'Maintain mobility gains, prevent regression',
      duration: 'Ongoing (lifelong for desk workers)',
      progression_criteria: 'Maintained mobility for 4+ weeks'
    },

    red_flags: [
      'Structural kyphosis (Scheuermann\'s)',
      'Compression fracture',
      'Severe osteoporosis',
      'Inflammatory spine disease'
    ],

    clinical_pearls: [
      'Thoracic mobility critical for shoulder health',
      'Poor T-spine mobility → compensatory lumbar extension',
      'Daily mobility work essential for desk workers',
      'Foam rolling very helpful for thoracic extension',
      'Often improves shoulder impingement symptoms',
      'Pull to push ratio important (2:1 recommended)'
    ]
  }
};

// =============================================================================
// HIP PROTOCOLS (4 protocols)
// =============================================================================

const HIP_PROTOCOLS: Record<string, RecoveryProtocol> = {
  hip_impingement: {
    movement_pattern: 'hip_flexion',
    protocol_name: 'Hip Impingement (FAI) Protocol',
    diagnosis_hints: [
      'Anterior groin pain',
      'Pain with deep squatting',
      'Positive FADIR test',
      'C-sign (patient forms C with hand around hip)',
      'Pain at bottom of squat'
    ],
    common_in: [
      'Femoroacetabular impingement (FAI)',
      'Hip labral tear',
      'Acetabular pathology',
      'Deep squat athletes'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Avoid Impingement',
      avoid_movements: [
        'hip_flexion', // deep flexion >90°
        'hip_internal_rotation',
        'hip_adduction',
        'combined_flexion_ir_adduction'
      ],
      avoid_exercises: [
        'Deep Squats (>90° hip flexion)',
        'Pistol Squats',
        'Ass-to-Grass Squats',
        'Deep Lunges',
        'Leg Press (deep ROM)',
        'Bicycle exercises',
        'High-knee running',
        'Deep yoga poses (pigeon, etc.)'
      ],
      emphasize_movements: [
        'limited_rom_hip_flexion', // <90°
        'hip_extension',
        'hip_external_rotation',
        'hip_abduction'
      ],
      recommended_exercises: [
        'Box Squat (parallel only) - 3x10',
        'Goblet Squat (50% ROM) - 3x10',
        'Leg Press (90° max hip flexion) - 3x10',
        'Romanian Deadlift - 3x10',
        'Hip Thrust - 3x12',
        'Glute Bridge - 3x15',
        'Cable Pull-through - 3x12',
        'Clamshells - 3x15 each',
        'Hip Airplane - 3x8 each',
        'Side-lying Hip Abduction - 3x15',
        'Bulgarian Split Squat (limited depth) - 3x8 each',
        'Step-ups (low step) - 3x10 each',
        '90/90 Hip External Rotation Stretch - 2x30sec each'
      ],
      goal: 'Reduce impingement irritation, strengthen hip in safe ROM, improve ER mobility',
      duration: '3-4 weeks',
      progression_criteria: 'Pain reduced by 60%, can squat to parallel pain-free'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive ROM',
      avoid_movements: [
        'end_range_hip_flexion_ir'
      ],
      avoid_exercises: [
        'Full ROM deep squats',
        'Extreme hip flexion exercises'
      ],
      recommended_exercises: [
        'Box Squat (progressive depth) - 3x8',
        'Goblet Squat (progressive depth 60-80%) - 3x10',
        'Front Squat (controlled depth) - 3x8',
        'Leg Press (progressive ROM) - 3x10',
        'Romanian Deadlift - 3x8',
        'Single-Leg RDL - 3x8 each',
        'Hip Thrust - 3x10',
        'Bulgarian Split Squat - 3x8 each',
        'Reverse Lunges - 3x10 each',
        'Clamshells with band - 3x15',
        'Hip 90/90 ER mobility - daily',
        'All Phase 1 exercises with progressive load'
      ],
      goal: 'Gradually increase hip flexion ROM, build strength in expanding ROM',
      duration: '6-8 weeks',
      progression_criteria: 'Can squat 80% depth pain-free, negative FADIR test'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [
        'extreme_combined_flexion_ir_adduction'
      ],
      avoid_exercises: [],
      recommended_exercises: [
        'Back Squat (progressive depth) - 3x6-8',
        'Front Squat - 3x6-8',
        'All squat variations',
        'Deadlift variations - 3x5-8',
        'Maintain hip ER mobility work daily',
        'Continue glute strengthening 2x/week'
      ],
      goal: 'Return to full training with maintained ROM and strength',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free at 80-90% depth for 4+ weeks, sport-ready'
    },

    red_flags: [
      'Severe structural impingement requiring surgery',
      'Progressive labral tear symptoms',
      'Locking or catching',
      'No improvement after 12 weeks',
      'Severe restriction despite protocol adherence'
    ],

    clinical_pearls: [
      'ROM restriction often permanent - may never get full depth back',
      'External rotation mobility critical',
      'Squat stance width modification helpful (wider = less flexion)',
      'Heel elevation can reduce hip flexion demand',
      'Surgery consideration if conservative care fails after 3-6 months',
      'Many athletes perform well with 80% squat depth'
    ]
  },

  hip_flexor_strain: {
    movement_pattern: 'hip_extension',
    protocol_name: 'Hip Flexor Strain Protocol',
    diagnosis_hints: [
      'Anterior hip pain',
      'Pain with hip flexion against resistance',
      'Pain with sprinting or kicking',
      'Tenderness in hip flexor region',
      'Pain with Thomas test'
    ],
    common_in: [
      'Iliopsoas strain',
      'Rectus femoris strain',
      'Hip flexor tendinopathy',
      'Sprinters and kickers',
      'Sudden acceleration injuries'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Protect Healing',
      avoid_movements: [
        'hip_flexion_against_resistance',
        'hip_extension', // stretches hip flexor
        'explosive_hip_flexion'
      ],
      avoid_exercises: [
        'Sprinting',
        'High knees',
        'Leg raises',
        'Hanging leg raise',
        'Bicycle crunches',
        'Deep lunges',
        'Bulgarian Split Squat (back leg)',
        'Hip flexion machine',
        'Aggressive hip flexor stretching'
      ],
      emphasize_movements: [
        'limited_rom_hip_movement',
        'hip_extension', // gentle, progressive
        'isometric_hip_flexion'
      ],
      recommended_exercises: [
        'Glute Bridge - 3x12',
        'Hip Thrust (limited ROM initially) - 3x10',
        'Goblet Squat (moderate depth) - 3x10',
        'Box Squat - 3x10',
        'Leg Press - 3x10',
        'Romanian Deadlift - 3x8',
        'Cable Pull-through - 3x12',
        'Clamshells - 3x15',
        'Side-lying Hip Abduction - 3x15',
        'Isometric Hip Flexion (light) - 3x10sec holds',
        'Dead Bug (modified) - 3x8',
        'Gentle hip flexor stretching (pain-free) - 2x30sec'
      ],
      goal: 'Allow healing, maintain lower body strength, prevent atrophy',
      duration: '1-3 weeks depending on severity',
      progression_criteria: 'Pain reduced by 50%, can walk without limp, minimal pain with ADLs'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive Loading',
      avoid_movements: [
        'explosive_hip_flexion',
        'sprinting'
      ],
      avoid_exercises: [
        'Sprinting',
        'Explosive movements'
      ],
      recommended_exercises: [
        'Goblet Squat - 3x10',
        'Front Squat - 3x8',
        'Back Squat - 3x8',
        'Bulgarian Split Squat (progress gradually) - 3x8 each',
        'Reverse Lunges - 3x10 each',
        'Step-ups - 3x10 each',
        'Hip Thrust - 3x10-12',
        'Romanian Deadlift - 3x8',
        'Single-Leg RDL - 3x8 each',
        'Dead Bug - 3x10',
        'Marching (controlled) - 3x20 total',
        'Straight Leg Raises (light resistance) - 3x10',
        'Eccentric Hip Flexion (slow lowering) - 3x8',
        'Progressive hip flexor stretching - 2x30sec'
      ],
      goal: 'Rebuild hip flexor strength and endurance, restore full ROM',
      duration: '3-6 weeks',
      progression_criteria: 'Pain-free with all Phase 2 exercises, can jog comfortably'
    },

    phase_3_return: {
      phase_name: 'Return to Sport Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Progressive running program',
        'Sprint progressions (70% → 80% → 90% → 100%)',
        'Plyometric progressions (low → moderate → high)',
        'Sport-specific drills',
        'All compound lifts',
        'Maintain hip flexor strengthening 2x/week',
        'Continue mobility work'
      ],
      goal: 'Return to full sport/activity demands',
      duration: 'Progressive over 2-4 weeks',
      progression_criteria: 'Can sprint at 80% without pain, no morning stiffness, symmetric strength'
    },

    red_flags: [
      'Complete rupture',
      'Avulsion fracture',
      'Severe weakness',
      'No improvement after 2-3 weeks',
      'Worsening pain'
    ],

    clinical_pearls: [
      'Respect healing timeline - don\'t rush return to sprinting',
      'Eccentric strengthening important in later phases',
      'Often recurrent if returned too early',
      'Gradual return to running critical',
      'Thomas test tracks flexibility recovery',
      'Consider biomechanical assessment for recurrent strains'
    ]
  },

  hip_abductor_weakness: {
    movement_pattern: 'hip_abduction',
    protocol_name: 'Hip Abductor Weakness Protocol (Gluteus Medius)',
    diagnosis_hints: [
      'Trendelenburg sign',
      'Lateral hip pain with single-leg activities',
      'Knee valgus during squats',
      'IT band syndrome',
      'Positive Trendelenburg test'
    ],
    common_in: [
      'Gluteus medius weakness',
      'Gluteus minimus weakness',
      'Post-hip surgery',
      'Runners (IT band syndrome)',
      'Sedentary individuals'
    ],

    phase_1_acute: {
      phase_name: 'Foundational Strengthening Phase',
      avoid_movements: [
        'heavy_single_leg_loading',
        'end_range_hip_adduction'
      ],
      avoid_exercises: [
        'Heavy single-leg exercises',
        'Running (if painful)',
        'Lateral movements (if painful)'
      ],
      emphasize_movements: [
        'hip_abduction',
        'hip_external_rotation',
        'controlled_single_leg_stance'
      ],
      recommended_exercises: [
        'Clamshells - 3x15-20 each',
        'Side-lying Hip Abduction - 3x15 each',
        'Fire Hydrants - 3x15 each',
        'Side Plank - 3x20-30sec each',
        'Copenhagen Plank - 3x15-20sec each',
        'Lateral Band Walks - 3x15 each direction',
        'Monster Walks - 3x12 each direction',
        'Single-Leg Stance - 3x30sec each',
        'Single-Leg Glute Bridge - 3x10 each',
        'Glute Bridge (bilateral) - 3x15',
        'Hip Thrust (bilateral) - 3x12',
        'Goblet Squat (focus on knee out) - 3x10',
        'Step-downs (low step, controlled) - 3x8 each'
      ],
      goal: 'Build foundational hip abductor strength and motor control',
      duration: '3-4 weeks',
      progression_criteria: 'No Trendelenburg sign, can stand on one leg 30sec stable, improved knee control in squat'
    },

    phase_2_subacute: {
      phase_name: 'Progressive Loading Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Clamshells with heavy band - 3x15',
        'Side-lying Hip Abduction (ankle weight) - 3x12',
        'Cable Hip Abduction - 3x12 each',
        'Side Plank with Hip Abduction - 3x10 each',
        'Copenhagen Plank - 3x20-30sec',
        'Single-Leg RDL - 3x8 each',
        'Bulgarian Split Squat - 3x8 each',
        'Step-ups (higher step) - 3x10 each',
        'Single-Leg Press - 3x10 each',
        'Lateral Lunges - 3x8 each',
        'Skater Squats - 3x6 each',
        'Single-Leg Hip Thrust - 3x10 each',
        'All Phase 1 exercises with added resistance'
      ],
      goal: 'Progress to functional single-leg strength and dynamic control',
      duration: '4-6 weeks',
      progression_criteria: 'Can perform single-leg exercises with good form, no knee valgus, symmetric strength'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Progressive running program',
        'Lateral movements and cutting',
        'Sport-specific training',
        'All single-leg exercises',
        'Maintain hip abductor work 2x/week (clamshells, lateral walks)',
        'Continue Copenhagen plank 1-2x/week'
      ],
      goal: 'Return to full activity with maintained hip abductor strength',
      duration: 'Ongoing',
      progression_criteria: 'No Trendelenburg during activity, symmetric single-leg performance, sport-ready'
    },

    red_flags: [
      'Superior gluteal nerve injury',
      'Hip joint pathology',
      'Lumbar radiculopathy affecting L5',
      'No progress after 6-8 weeks',
      'Progressive weakness'
    ],

    clinical_pearls: [
      'Glute med weakness extremely common',
      'Often contributes to IT band syndrome, patellofemoral pain',
      'Clamshells and lateral walks are gold standard',
      'Copenhagen plank excellent advanced exercise',
      'Monitor knee valgus during all exercises - key indicator',
      'Runners especially benefit from this protocol',
      'Often requires ongoing maintenance 2x/week'
    ]
  },

  hip_ir_restriction: {
    movement_pattern: 'hip_internal_rotation',
    protocol_name: 'Hip Internal Rotation Restriction Protocol',
    diagnosis_hints: [
      'Limited hip internal rotation <20°',
      'Difficulty with squat depth',
      'Hip pain with squatting',
      'Asymmetric hip rotation',
      'Compensatory lumbar rotation'
    ],
    common_in: [
      'Femoral retroversion',
      'Posterior hip capsule tightness',
      'Hip joint pathology',
      'Squatters with depth issues',
      'Post-injury stiffness'
    ],

    phase_1_acute: {
      phase_name: 'Mobility Restoration Phase',
      avoid_movements: [
        'forced_end_range_ir',
        'deep_squat_if_painful'
      ],
      avoid_exercises: [
        'Deep squats until mobility improved',
        'Exercises requiring significant hip IR'
      ],
      emphasize_movements: [
        'hip_internal_rotation',
        'hip_flexion_with_ir',
        'controlled_squat_depth'
      ],
      recommended_exercises: [
        '90/90 Hip IR Stretch - 3x30sec each, multiple times daily',
        'Figure-4 IR Stretch - 3x30sec each',
        '90/90 Hip Switches - 3x10 transitions',
        'Shin Box Get-ups - 3x6 each side',
        'Hip IR PAILs/RAILs - 2x (2min passive, 10sec PAIL, 10sec RAIL)',
        'Goblet Squat (50-70% ROM) - 3x10',
        'Box Squat (controlled depth) - 3x10',
        'Cossack Squats - 3x8 each',
        'Romanian Deadlift - 3x10',
        'Hip Thrust - 3x12',
        'Side-lying Hip IR (active) - 3x15 each',
        'Foam roll hip external rotators - 2min each side'
      ],
      goal: 'Restore hip internal rotation ROM to >30°',
      duration: '4-6 weeks (mobility takes time)',
      progression_criteria: 'IR improved by 10°+, less compensatory movement, improved squat depth'
    },

    phase_2_subacute: {
      phase_name: 'Strengthening in New ROM Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Goblet Squat (progressive depth) - 3x10',
        'Front Squat (progressive depth) - 3x8',
        'Box Squat (progressive depth) - 3x8',
        'Bulgarian Split Squat - 3x8 each',
        'Cossack Squats - 3x10 each',
        'Lateral Lunges - 3x10 each',
        '90/90 Hip Switches (loaded) - 3x10',
        'Copenhagen Plank - 3x20sec',
        'Continue daily IR mobility work',
        'Hip IR strengthening (banded) - 3x15 each'
      ],
      goal: 'Strengthen hip musculature in improved ROM, maintain mobility gains',
      duration: '4-6 weeks',
      progression_criteria: 'Can squat to 80-90% depth with good form, maintained IR ROM'
    },

    phase_3_return: {
      phase_name: 'Maintenance Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'All squat variations at full available ROM',
        'Deadlift variations',
        'Maintain IR mobility work 4-5x/week (lifelong)',
        'Continue 90/90 stretching',
        'Foam roll hip ER muscles regularly'
      ],
      goal: 'Maintain mobility gains, prevent regression',
      duration: 'Ongoing (lifelong maintenance required)',
      progression_criteria: 'Maintained IR ROM for 6+ weeks'
    },

    red_flags: [
      'Structural femoral retroversion',
      'Hip joint pathology',
      'Labral tear',
      'FAI',
      'No improvement after 8 weeks of dedicated mobility work'
    ],

    clinical_pearls: [
      'Hip IR often chronic limitation - requires consistent work',
      '90/90 position is gold standard stretch',
      'External rotator tightness common contributor',
      'Squat stance width can compensate (wider = less IR demand)',
      'Many powerlifters have limited IR - can still perform well',
      'Daily mobility work essential for long-term gains',
      'Consider structural limitations may prevent full ROM'
    ]
  }
};

// =============================================================================
// KNEE PROTOCOLS (2 protocols)
// =============================================================================

const KNEE_PROTOCOLS: Record<string, RecoveryProtocol> = {
  patellofemoral_pain: {
    movement_pattern: 'patellofemoral_compression',
    protocol_name: 'Patellofemoral Pain Syndrome (PFPS) Protocol',
    diagnosis_hints: [
      'Anterior knee pain around or behind kneecap',
      'Pain with stairs (especially descent)',
      'Pain with squatting',
      'Pain after prolonged sitting (movie sign)',
      'Positive patellar grind test'
    ],
    common_in: [
      'Patellofemoral pain syndrome',
      'Chondromalacia patellae',
      'Runner\'s knee',
      'Quad dominant athletes',
      'Weakness in hip external rotators/glutes'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Reduce Compression',
      avoid_movements: [
        'patellofemoral_compression',
        'knee_flexion', // deep flexion >90°
        'knee_shear_force'
      ],
      avoid_exercises: [
        'Deep Squats (>90° knee flexion)',
        'Deep Lunges',
        'Leg Extension (especially last 30°)',
        'Running',
        'Jumping/Plyometrics',
        'Stairs (descent especially)',
        'Kneeling exercises',
        'Pistol Squats',
        'Deep Step-ups'
      ],
      emphasize_movements: [
        'limited_rom_knee_flexion', // 0-60° initially
        'hip_extension',
        'hip_abduction',
        'terminal_knee_extension'
      ],
      recommended_exercises: [
        'Spanish Squat - 3x30sec holds',
        'Terminal Knee Extension (TKE) with band - 3x15',
        'Wall Sit (90-100° knee angle) - 3x30sec',
        'Partial Squat (60° max knee flexion) - 3x10',
        'Leg Press (60° max knee flexion) - 3x10',
        'Hip Thrust - 3x12',
        'Glute Bridge - 3x15',
        'Romanian Deadlift - 3x10',
        'Cable Pull-through - 3x12',
        'Clamshells - 3x20',
        'Side-lying Hip Abduction - 3x15',
        'Lateral Band Walks - 3x15 each direction',
        'Monster Walks - 3x12',
        'Side Plank - 3x30sec',
        'Straight Leg Raises - 3x15',
        'Quad sets - 3x15'
      ],
      goal: 'Reduce patellofemoral irritation, strengthen hip abductors/extensors, maintain quad strength in pain-free ROM',
      duration: '3-4 weeks',
      progression_criteria: 'Pain reduced by 50%, can walk stairs without significant pain, improved single-leg stance'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive ROM Loading',
      avoid_movements: [
        'excessive_patellofemoral_compression',
        'high_knee_shear_force'
      ],
      avoid_exercises: [
        'Leg Extension (full ROM)',
        'Running (until late phase 2)',
        'Jumping'
      ],
      recommended_exercises: [
        'Box Squat (progressive depth 70-90°) - 3x10',
        'Goblet Squat (progressive depth) - 3x10',
        'Leg Press (progressive ROM to 90°) - 3x10',
        'Spanish Squat - 3x45sec',
        'TKE - 3x20',
        'Step-ups (low step, progress height) - 3x10 each',
        'Reverse Lunges (controlled depth) - 3x8 each',
        'Bulgarian Split Squat (limited ROM) - 3x8 each',
        'Single-Leg Press (limited ROM) - 3x10 each',
        'Hip Thrust - 3x12',
        'Romanian Deadlift - 3x10',
        'Single-Leg RDL - 3x8 each',
        'Continue hip abductor work - clamshells, lateral walks',
        'Eccentric Step-downs (controlled) - 3x8 each',
        'Isometric Wall Sit (deeper angles) - 3x40-60sec',
        'Walking (progress to light jogging by end phase 2)'
      ],
      goal: 'Progress knee flexion ROM under load, build quadriceps strength, maintain hip strength',
      duration: '6-8 weeks',
      progression_criteria: 'Can squat to 90° pain-free, stairs pain-free, can jog 10 min comfortably'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [
        'Leg Extension (consider permanent avoidance or limited ROM only)'
      ],
      recommended_exercises: [
        'Back Squat (progressive depth and load) - 3x6-8',
        'Front Squat - 3x6-8',
        'Bulgarian Split Squat - 3x8-10',
        'Forward Lunges (if tolerated) - 3x8 each',
        'Step-ups (full height) - 3x10 each',
        'Progressive running program',
        'Plyometric progressions (low → high)',
        'Deadlift variations - 3x5-8',
        'Maintain hip abductor work 2x/week',
        'Continue Spanish Squat 2x/week for maintenance'
      ],
      goal: 'Return to full training and sport activities',
      duration: 'Progressive over 3-4 weeks',
      progression_criteria: 'Can squat to parallel/full depth pain-free, can run/jump without pain, no morning stiffness'
    },

    red_flags: [
      'Structural patellar maltracking requiring surgery',
      'Significant cartilage damage',
      'Locking or catching',
      'Effusion/swelling',
      'No improvement after 12 weeks of protocol adherence'
    ],

    clinical_pearls: [
      'Hip abductor weakness VERY common contributor - always address',
      'Spanish Squat reduces PF compression - cornerstone exercise',
      'Knee valgus (collapse) during exercises = poor hip control',
      'Leg extension often permanently problematic - avoid or use limited ROM (90-45°)',
      'Eccentric strengthening important for stairs',
      'Quadriceps strengthening in limited ROM preserves strength',
      'Most patients respond well to hip strengthening + load management',
      'Taping (McConnell taping) can provide short-term relief'
    ]
  },

  acl_reconstruction_rehab: {
    movement_pattern: 'knee_anterior_translation',
    protocol_name: 'Post-ACL Reconstruction Protocol',
    diagnosis_hints: [
      'Recent ACL reconstruction surgery',
      'Knee instability pre-surgery',
      'Positive Lachman test (pre-surgery)',
      'History of ACL injury'
    ],
    common_in: [
      'Post-ACL reconstruction',
      'Return to sport after ACL surgery',
      'Athletes'
    ],

    phase_1_acute: {
      phase_name: 'Phase 1 - Early Post-Op (Weeks 0-6)',
      avoid_movements: [
        'knee_anterior_shear',
        'knee_valgus',
        'explosive_movements',
        'twisting_movements'
      ],
      avoid_exercises: [
        'Running',
        'Jumping',
        'Cutting',
        'Pivoting',
        'Open chain knee extension (controversial - depends on protocol)',
        'Deep squats initially',
        'Any explosive movements'
      ],
      emphasize_movements: [
        'terminal_knee_extension',
        'controlled_knee_flexion',
        'hip_extension',
        'quadriceps_activation'
      ],
      recommended_exercises: [
        'Quad sets - 4x20 (multiple times daily early)',
        'Straight Leg Raises - 3x15',
        'Ankle pumps - continuous',
        'Heel slides - 3x15',
        'Seated knee extension (90-45°) - 3x15',
        'Terminal Knee Extension - 3x15',
        'Standing hamstring curls - 3x12',
        'Glute sets - 4x15',
        'Hip abduction (side-lying) - 3x15',
        'Clamshells - 3x15',
        'Wall sits (90° angle) - 3x30sec (weeks 4-6)',
        'Partial weight-bearing squats (week 4+) - 3x10',
        'Stationary bike (no resistance initially) - 10-20min daily',
        'Pool walking (if available)',
        'ROM: Target full extension, 120-130° flexion by week 6'
      ],
      goal: 'Restore ROM, control swelling, activate quadriceps, protect graft, restore normal gait',
      duration: '6 weeks',
      progression_criteria: 'Full extension, 120°+ flexion, minimal effusion, quad activation achieved, normal gait'
    },

    phase_2_subacute: {
      phase_name: 'Phase 2 - Strengthening (Weeks 6-12)',
      avoid_movements: [
        'explosive_movements',
        'cutting',
        'pivoting',
        'running (until week 10-12)'
      ],
      avoid_exercises: [
        'Jumping',
        'Cutting',
        'Running (until cleared)',
        'Sports'
      ],
      recommended_exercises: [
        'Leg Press (bilateral) - 3x10-12',
        'Goblet Squat (progressive depth) - 3x10',
        'Box Squat - 3x10',
        'Step-ups (low step, progress height) - 3x10 each',
        'Step-downs (eccentric control) - 3x8 each',
        'Spanish Squat - 3x40sec',
        'Terminal Knee Extension - 3x20',
        'Leg Curl - 3x12',
        'Nordic Hamstring Curl (assisted, progress to full) - 3x5',
        'Romanian Deadlift - 3x10',
        'Single-Leg Press - 3x10 each (weeks 10+)',
        'Hip Thrust - 3x12',
        'Clamshells with band - 3x15',
        'Lateral Band Walks - 3x15',
        'Monster Walks - 3x12',
        'Stationary bike - 20-30min, progress resistance',
        'Elliptical - 20min (weeks 8+)',
        'Walking program - progressive distance',
        'Light jogging on treadmill (weeks 10-12 if cleared)',
        'Balance training - single leg stance progressions'
      ],
      goal: 'Build quadriceps and hamstring strength, restore full ROM, improve single-leg control, prepare for running',
      duration: '6 weeks (weeks 6-12 post-op)',
      progression_criteria: '>70% quad strength vs uninvolved leg, full ROM, no effusion, good single-leg control, cleared for running'
    },

    phase_3_return: {
      phase_name: 'Phase 3 - Return to Sport (Weeks 12-24+)',
      avoid_movements: [
        'unrestricted_sport_until_cleared'
      ],
      avoid_exercises: [],
      recommended_exercises: [
        'Progressive running program (weeks 12-16)',
        'Nordic Hamstring Curl - 3x8 (CRITICAL for ACL protection)',
        'Back Squat (progressive) - 3x6-8',
        'Front Squat - 3x6-8',
        'Bulgarian Split Squat - 3x8 each',
        'Single-Leg RDL - 3x8 each',
        'Walking Lunges - 3x10 each',
        'Trap Bar Deadlift - 3x6-8',
        'Step-ups (high box) - 3x10 each',
        'Lateral Lunges - 3x8 each',
        'Plyometric progressions (weeks 16+):',
        '  - Box jumps (landing, then jumping)',
        '  - Jump squats',
        '  - Single-leg hops',
        '  - Lateral hops',
        '  - Cutting drills (weeks 20+)',
        'Sport-specific agility drills',
        'Scrimmage/practice (progressive)',
        'Continue Nordic curls 2x/week (lifelong)'
      ],
      goal: 'Return to unrestricted sport, achieve >90% strength symmetry, pass return-to-sport testing',
      duration: 'Weeks 12-24+ (average RTS 9-12 months)',
      progression_criteria: 'Pass RTS battery: >90% quad/hamstring strength LSI, hop tests >90% LSI, psychological readiness, sport-specific performance, cleared by surgeon/PT'
    },

    red_flags: [
      'Significant effusion',
      'Loss of ROM',
      'Graft failure',
      'Pain not responding to protocol',
      'Giving way episodes',
      'Significant quad atrophy not improving'
    ],

    clinical_pearls: [
      'MOST IMPORTANT: Do not rush return to sport - 9-12 months minimum',
      'Nordic hamstring curl reduces ACL re-injury risk by 50%+',
      'Quad strength most important predictor of outcomes',
      'Every 1-month delay in RTS reduces re-injury risk',
      'Psychological readiness critical - use ACL-RSI scale',
      'Hamstring autograft: protect hamstrings early',
      'Patellar tendon graft: protect knee extension mechanism early',
      'Hop testing critical before sport return',
      'Limb symmetry index >90% required for all strength measures',
      'Continue Nordic curls lifelong - 1-2x/week maintenance'
    ]
  }
};

// =============================================================================
// SHOULDER PROTOCOLS (2 protocols)
// =============================================================================

const SHOULDER_PROTOCOLS: Record<string, RecoveryProtocol> = {
  subacromial_impingement: {
    movement_pattern: 'shoulder_flexion',
    protocol_name: 'Subacromial Impingement Syndrome Protocol',
    diagnosis_hints: [
      'Painful arc 60-120° abduction',
      'Positive Neer test',
      'Positive Hawkins-Kennedy test',
      'Pain with overhead reaching',
      'Night pain (lateral shoulder)'
    ],
    common_in: [
      'Subacromial impingement syndrome',
      'Rotator cuff tendinopathy',
      'Subacromial bursitis',
      'Overhead athletes/workers',
      'Poor scapular control'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Reduce Impingement',
      avoid_movements: [
        'shoulder_flexion', // >90° initially
        'shoulder_abduction', // 60-120° painful arc
        'shoulder_internal_rotation', // combined with flexion
        'overhead_movements'
      ],
      avoid_exercises: [
        'Overhead Press',
        'Pull-ups',
        'Lat Pulldown (initially)',
        'Lateral Raises (60-120° range)',
        'Front Raises',
        'Upright Rows',
        'Any overhead exercises',
        'Dips (bottom position)'
      ],
      emphasize_movements: [
        'scapular_retraction',
        'shoulder_external_rotation',
        'limited_rom_shoulder_flexion', // <90°
        'scapular_control'
      ],
      recommended_exercises: [
        'Face Pulls - 3x15-20',
        'Band Pull-aparts - 3x20',
        'Prone Y-T-W - 3x10 each',
        'Scapular Wall Slides (limited ROM) - 3x12',
        'External Rotation (ER) at side with band - 3x15',
        'Side-lying ER - 3x15',
        'Reverse Flyes - 3x15',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Inverted Row (elevated, limited shoulder flexion) - 3x8',
        'Serratus Punches - 3x15',
        'Scapular Push-ups - 3x10',
        'Floor Press - 3x10',
        'Bench Press (limited ROM if pain-free) - 3x8',
        'Push-ups (if pain-free) - 3x10',
        'Lower body training (no restrictions)',
        'Pendulum exercises (early) - 2min x 3/day',
        'Sleeper stretch (posterior capsule) - 3x30sec'
      ],
      goal: 'Reduce subacromial irritation, improve scapular control, strengthen rotator cuff, restore external rotation',
      duration: '3-4 weeks',
      progression_criteria: 'Pain reduced by 50%, improved painful arc, better scapular control, ER strength improved'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive ROM and Loading',
      avoid_movements: [
        'end_range_overhead',
        'heavy_overhead_loading'
      ],
      avoid_exercises: [
        'Heavy Overhead Press',
        'Heavy Overhead movements'
      ],
      recommended_exercises: [
        'Wall Slides (progressive height) - 3x12',
        'Landmine Press - 3x10',
        'DB Shoulder Press (neutral grip, limited ROM) - 3x10',
        'Cable Shoulder Press - 3x10',
        'Lat Pulldown (neutral grip) - 3x10',
        'Assisted Pull-ups (band) - 3x5-8',
        'Face Pulls - 3x15',
        'Band Pull-aparts - 3x20',
        'ER strengthening (progress resistance) - 3x12',
        'Prone Y-T-W - 3x12',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Inverted Row - 3x10',
        'Bench Press - 3x8-10',
        'Incline Bench Press (moderate angle) - 3x8',
        'Push-ups - 3x10-15',
        'Serratus strengthening - 3x15',
        'Continue sleeper stretch - daily'
      ],
      goal: 'Progress overhead ROM, build rotator cuff strength, maintain scapular control',
      duration: '6-8 weeks',
      progression_criteria: 'Can raise arm overhead with minimal pain, negative Neer test, improved strength'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [
        'Upright Rows (consider permanent avoidance - high impingement risk)'
      ],
      recommended_exercises: [
        'Overhead Press (progressive loading) - 3x6-8',
        'DB Shoulder Press - 3x8',
        'Pull-ups - 3x5-8',
        'Lat Pulldown - 3x8-10',
        'All pressing variations',
        'All rowing variations',
        'Sport-specific overhead training',
        'Maintain face pulls 2-3x/week (CRITICAL for prevention)',
        'Continue ER strengthening 2x/week',
        'Maintain 2:1 pull:push ratio'
      ],
      goal: 'Return to full training and overhead activities',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free overhead activities, full strength restored, maintained scapular control'
    },

    red_flags: [
      'Full-thickness rotator cuff tear',
      'Severe structural pathology',
      'Frozen shoulder developing',
      'No improvement after 12 weeks',
      'Progressive weakness'
    ],

    clinical_pearls: [
      'Face pulls and ER work are cornerstone exercises - continue lifelong',
      'Scapular control often the primary issue',
      'Poor thoracic mobility often contributes - address if limited',
      '2:1 pull to push ratio recommended for shoulder health',
      'Avoid upright rows even after recovery (high impingement risk)',
      'Neutral grip often better tolerated than pronated/supinated',
      'Sleep position matters - avoid sleeping on affected shoulder',
      'Most cases respond to conservative management',
      'Steroid injection may help if not responding at 6 weeks'
    ]
  },

  rotator_cuff_strain: {
    movement_pattern: 'shoulder_external_rotation',
    protocol_name: 'Rotator Cuff Strain/Tendinopathy Protocol',
    diagnosis_hints: [
      'Lateral shoulder pain',
      'Pain with resisted external rotation',
      'Positive empty can test',
      'Weakness in abduction or ER',
      'Night pain'
    ],
    common_in: [
      'Rotator cuff tendinopathy',
      'Partial rotator cuff tear',
      'Supraspinatus tendinopathy',
      'Infraspinatus strain',
      'Overhead athletes'
    ],

    phase_1_acute: {
      phase_name: 'Acute Phase - Protect Healing',
      avoid_movements: [
        'shoulder_abduction', // >60° initially if painful
        'shoulder_external_rotation_against_resistance',
        'shoulder_flexion', // overhead
        'end_range_movements'
      ],
      avoid_exercises: [
        'Overhead Press',
        'Lateral Raises',
        'Front Raises',
        'Pull-ups',
        'Heavy pressing',
        'External rotation exercises (initially)',
        'Any painful movements'
      ],
      emphasize_movements: [
        'limited_rom_strengthening',
        'scapular_stability',
        'pain_free_movements'
      ],
      recommended_exercises: [
        'Pendulum exercises - 2min x 3/day',
        'Scapular retraction - 3x15',
        'Face Pulls (light) - 3x15',
        'Band Pull-aparts (light) - 3x20',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Floor Press - 3x10',
        'Push-ups (if tolerated) - 3x10',
        'Isometric ER (low intensity) - 3x10sec holds',
        'Isometric abduction (low intensity) - 3x10sec holds',
        'Serratus strengthening - 3x15',
        'Lower body training (no restrictions)',
        'Gentle ROM exercises (pain-free only)',
        'Ice after activity'
      ],
      goal: 'Allow healing, reduce inflammation, maintain pain-free ROM, prevent atrophy',
      duration: '2-3 weeks (partial tears may need 4-6 weeks)',
      progression_criteria: 'Pain reduced by 50%, improved active ROM, can perform isometrics without pain'
    },

    phase_2_subacute: {
      phase_name: 'Subacute Phase - Progressive Strengthening',
      avoid_movements: [
        'heavy_overhead_loading',
        'ballistic_movements'
      ],
      avoid_exercises: [
        'Heavy Overhead Press',
        'Heavy Lateral Raises',
        'Explosive movements'
      ],
      recommended_exercises: [
        'External Rotation (band/cable) - 3x12-15',
        'Side-lying ER - 3x12',
        'Internal Rotation (band/cable) - 3x12',
        'Scaption (thumbs up) - 3x12',
        'Empty Can (if pain-free) - 3x12',
        'Prone Y-T-W - 3x12',
        'Face Pulls - 3x15',
        'Band Pull-aparts - 3x20',
        'Chest-Supported Row - 3x10',
        'Cable Row - 3x10',
        'Inverted Row - 3x8-10',
        'Landmine Press - 3x10',
        'DB Shoulder Press (light, limited ROM) - 3x10',
        'Bench Press - 3x8',
        'Incline Bench Press - 3x8',
        'Push-ups - 3x10-15',
        'Lat Pulldown (neutral grip) - 3x10',
        'PNF patterns (if with PT)',
        'Progressive ROM exercises'
      ],
      goal: 'Rebuild rotator cuff strength and endurance, restore full ROM, improve scapular stability',
      duration: '6-8 weeks',
      progression_criteria: 'Minimal pain, ER strength >80% of uninvolved side, full ROM, good scapular control'
    },

    phase_3_return: {
      phase_name: 'Return to Activity Phase',
      avoid_movements: [],
      avoid_exercises: [],
      recommended_exercises: [
        'Overhead Press (progressive loading) - 3x6-8',
        'DB Shoulder Press - 3x8',
        'All pressing variations',
        'Pull-ups/Chin-ups - 3x5-8',
        'All rowing variations',
        'Lateral Raises - 3x12',
        'Sport-specific training',
        'Maintain ER strengthening 2-3x/week (CRITICAL)',
        'Continue face pulls 2-3x/week',
        'Maintain 2:1 pull:push ratio'
      ],
      goal: 'Return to full training, prevent re-injury',
      duration: 'Ongoing',
      progression_criteria: 'Pain-free with all activities, >90% strength symmetry, sport-ready'
    },

    red_flags: [
      'Full-thickness rotator cuff tear (may need surgery)',
      'Massive rotator cuff tear',
      'Progressive weakness',
      'Drop arm sign',
      'No improvement after 12 weeks',
      'Age >60 with acute tear (higher surgical consideration)'
    ],

    clinical_pearls: [
      'External rotation strengthening is KEY - continue lifelong 2x/week',
      'High volume, low load better for tendinopathy',
      'Eccentric strengthening beneficial in later phases',
      'Most partial tears heal with conservative management',
      'Face pulls crucial for rotator cuff health',
      'Pull:push ratio 2:1 for shoulder health',
      'Sleep modification important (avoid affected side)',
      'May need 3-4 months for full recovery',
      'Consider platelet-rich plasma if not responding at 12 weeks',
      'Surgery consideration if no improvement after 6 months conservative care'
    ]
  }
};

// =============================================================================
// COMBINED DATABASE
// =============================================================================

export const ANATOMICAL_RECOVERY_PROTOCOLS: Record<string, RecoveryProtocol> = {
  ...SPINE_PROTOCOLS,
  ...HIP_PROTOCOLS,
  ...KNEE_PROTOCOLS,
  ...SHOULDER_PROTOCOLS
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get protocol by movement pattern
 */
export function getProtocolByMovement(movementKey: string): RecoveryProtocol | undefined {
  return Object.values(ANATOMICAL_RECOVERY_PROTOCOLS).find(
    (protocol) => protocol.movement_pattern === movementKey
  );
}

/**
 * Get all protocols for a specific diagnosis
 */
export function getProtocolsByDiagnosis(diagnosis: string): RecoveryProtocol[] {
  const normalized = diagnosis.toLowerCase();
  return Object.values(ANATOMICAL_RECOVERY_PROTOCOLS).filter((protocol) =>
    protocol.common_in.some((condition) => condition.toLowerCase().includes(normalized))
  );
}

/**
 * Get protocol by name
 */
export function getProtocolByName(protocolName: string): RecoveryProtocol | undefined {
  const normalized = protocolName.toLowerCase();
  return Object.values(ANATOMICAL_RECOVERY_PROTOCOLS).find((protocol) =>
    protocol.protocol_name.toLowerCase().includes(normalized)
  );
}

/**
 * Check if red flags present (requires medical referral)
 */
export function hasRedFlags(protocol: RecoveryProtocol, symptoms: string[]): boolean {
  if (!protocol.red_flags) return false;

  return protocol.red_flags.some((flag) =>
    symptoms.some((symptom) => symptom.toLowerCase().includes(flag.toLowerCase()))
  );
}

/**
 * Get appropriate phase based on timeline and criteria
 */
export function getAppropriatePhase(
  protocol: RecoveryProtocol,
  weeksInProtocol: number,
  currentPhase: number = 1
): PhaseProtocol {
  // Simple logic - can be enhanced with progression criteria checks
  if (weeksInProtocol < 4) {
    return protocol.phase_1_acute;
  } else if (weeksInProtocol < 12) {
    return protocol.phase_2_subacute;
  } else {
    return protocol.phase_3_return;
  }
}

/**
 * Get protocol statistics
 */
export function getProtocolStatistics() {
  const allProtocols = Object.values(ANATOMICAL_RECOVERY_PROTOCOLS);

  const byRegion: Record<string, number> = {};

  allProtocols.forEach((protocol) => {
    const region = protocol.movement_pattern.includes('spinal')
      ? 'spine'
      : protocol.movement_pattern.includes('hip')
      ? 'hip'
      : protocol.movement_pattern.includes('knee')
      ? 'knee'
      : protocol.movement_pattern.includes('shoulder')
      ? 'shoulder'
      : 'other';

    byRegion[region] = (byRegion[region] || 0) + 1;
  });

  return {
    total: allProtocols.length,
    byRegion
  };
}

// Export count for verification
export const PROTOCOL_COUNT = Object.keys(ANATOMICAL_RECOVERY_PROTOCOLS).length;
