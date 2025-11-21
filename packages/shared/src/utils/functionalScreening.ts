/**
 * Functional Screening System
 *
 * Comprehensive movement screening protocols to identify painful movement patterns.
 * Generates movement profiles and exercise recommendations based on screening results.
 */

import { BodyRegion, GOLDEN_STANDARD_TESTS, getTestsByRegion } from './goldenStandardTests';
import {
  ANATOMICAL_RECOVERY_PROTOCOLS,
  RecoveryProtocol,
  getProtocolByMovement
} from './anatomicalRecoveryProtocols';
import { findSafeSubstitutions, generatePainAdaptedProgram } from './exerciseSubstitutionEngine';

// =============================================================================
// TYPES
// =============================================================================

export interface ScreeningTest {
  test_name: string;
  movement_tested: string; // key from anatomicalMovements
  procedure: string;
  pain_scale: boolean; // ask 0-10 pain rating?
  rom_assessment: boolean; // assess range of motion?
  video_ref?: string;
}

export interface ScreeningProtocol {
  name: string;
  description: string;
  region: BodyRegion;
  estimated_duration: string; // e.g., "5-10 minutes"
  tests: ScreeningTest[];
}

export interface ScreeningResults {
  protocol_used: string;
  date: string;
  test_results: TestResult[];
}

export interface TestResult {
  test_name: string;
  movement_tested: string;
  pain_level: number; // 0-10
  rom_restriction: boolean;
  notes?: string;
}

export interface MovementProfile {
  pain_patterns: string[]; // movement keys that are painful
  restrictions: string[]; // movement keys that are restricted
  directional_preference?: 'flexion' | 'extension' | 'neutral';
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  safe_exercises: string[];
  avoid_exercises: string[];
  recommended_protocols: RecoveryProtocol[];
}

// =============================================================================
// SCREENING PROTOCOLS
// =============================================================================

export const LOWER_BACK_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Lower Back Quick Screen',
  description: '5-minute screening for lower back pain patterns and directional preference',
  region: 'lumbar_spine',
  estimated_duration: '5-7 minutes',
  tests: [
    {
      test_name: 'Standing Forward Bend (Toe Touch)',
      movement_tested: 'spinal_flexion',
      procedure:
        'Stand with feet together, slowly bend forward attempting to touch toes. Note pain location and intensity.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'forward_bend_test'
    },
    {
      test_name: 'Standing Extension',
      movement_tested: 'spinal_extension',
      procedure:
        'Stand, place hands on lower back for support, extend spine backward. Note pain response.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Seated Trunk Rotation (Right)',
      movement_tested: 'spinal_rotation_right',
      procedure:
        'Sit on chair with arms crossed, rotate trunk maximally to right. Note pain and ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Seated Trunk Rotation (Left)',
      movement_tested: 'spinal_rotation_left',
      procedure:
        'Sit on chair with arms crossed, rotate trunk maximally to left. Note pain and ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Single Leg Standing (Right)',
      movement_tested: 'neutral_spine_isometric',
      procedure:
        'Stand on right leg for 30 seconds. Observe trunk shifts, Trendelenburg, and pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Single Leg Standing (Left)',
      movement_tested: 'neutral_spine_isometric',
      procedure:
        'Stand on left leg for 30 seconds. Observe trunk shifts, Trendelenburg, and pain.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const LOWER_BACK_COMPREHENSIVE_SCREEN: ScreeningProtocol = {
  name: 'Lower Back Comprehensive Screen',
  description:
    '20-30 minute comprehensive assessment including McKenzie protocol and stability testing',
  region: 'lumbar_spine',
  estimated_duration: '20-30 minutes',
  tests: [
    ...LOWER_BACK_QUICK_SCREEN.tests,
    {
      test_name: 'McKenzie Extensions (10 reps)',
      movement_tested: 'spinal_extension',
      procedure:
        'Lie prone, perform 10 press-ups extending spine. Note if pain centralizes or peripheralizes.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'mckenzie_extension'
    },
    {
      test_name: 'Quadruped Cat-Cow',
      movement_tested: 'spinal_flexion',
      procedure:
        'On hands and knees, alternate between cat (flexion) and cow (extension). Assess pain in each direction.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Prone Instability Test',
      movement_tested: 'spinal_axial_compression',
      procedure:
        'Prone with legs off table. Apply PA pressure to spine. Repeat with feet lifted. Positive if pain disappears with muscle activation.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Straight Leg Raise (Right)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, passively raise straight leg to pain or 70°. Add dorsiflexion if >70° pain-free.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Straight Leg Raise (Left)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, passively raise straight leg to pain or 70°. Add dorsiflexion if >70° pain-free.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'FABER Test (Right)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, figure-4 position, apply gentle downward pressure. Note location of pain (SI joint vs groin).',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'FABER Test (Left)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, figure-4 position, apply gentle downward pressure. Note location of pain (SI joint vs groin).',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const HIP_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Hip Quick Screen',
  description: '10-minute screening for hip pathology and mobility restrictions',
  region: 'hip',
  estimated_duration: '10 minutes',
  tests: [
    {
      test_name: 'FADIR Test (Right)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, flex hip to 90°, adduct and internally rotate. Positive if anterior hip/groin pain.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'fadir_test'
    },
    {
      test_name: 'FADIR Test (Left)',
      movement_tested: 'hip_flexion',
      procedure:
        'Supine, flex hip to 90°, adduct and internally rotate. Positive if anterior hip/groin pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Thomas Test (Right)',
      movement_tested: 'hip_extension',
      procedure:
        'Supine at table edge, pull opposite knee to chest, lower test leg. Positive if thigh rises off table.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'thomas_test'
    },
    {
      test_name: 'Thomas Test (Left)',
      movement_tested: 'hip_extension',
      procedure:
        'Supine at table edge, pull opposite knee to chest, lower test leg. Positive if thigh rises off table.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: '90/90 Hip Internal Rotation (Right)',
      movement_tested: 'hip_internal_rotation',
      procedure:
        'Supine, hip and knee at 90°. Rotate hip internally (shin out). Measure ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: '90/90 Hip Internal Rotation (Left)',
      movement_tested: 'hip_internal_rotation',
      procedure:
        'Supine, hip and knee at 90°. Rotate hip internally (shin out). Measure ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Trendelenburg Test (Right)',
      movement_tested: 'hip_abduction',
      procedure:
        'Stand on right leg for 30 seconds. Positive if pelvis drops on left side.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'trendelenburg'
    },
    {
      test_name: 'Trendelenburg Test (Left)',
      movement_tested: 'hip_abduction',
      procedure:
        'Stand on left leg for 30 seconds. Positive if pelvis drops on right side.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const KNEE_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Knee Quick Screen',
  description: '8-minute screening for knee pain and stability',
  region: 'knee',
  estimated_duration: '8 minutes',
  tests: [
    {
      test_name: 'Bodyweight Squat',
      movement_tested: 'knee_flexion',
      procedure:
        'Perform bodyweight squat to comfortable depth. Note pain, depth achieved, and knee valgus.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Single Leg Squat (Right)',
      movement_tested: 'knee_flexion',
      procedure:
        'Perform single leg squat on right leg. Note pain, control, and knee valgus.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Single Leg Squat (Left)',
      movement_tested: 'knee_flexion',
      procedure:
        'Perform single leg squat on left leg. Note pain, control, and knee valgus.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Patellar Grind Test (Right)',
      movement_tested: 'patellofemoral_compression',
      procedure:
        'Supine, knee extended. Apply downward pressure on superior patella, ask patient to contract quad. Positive if unable due to pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Patellar Grind Test (Left)',
      movement_tested: 'patellofemoral_compression',
      procedure:
        'Supine, knee extended. Apply downward pressure on superior patella, ask patient to contract quad. Positive if unable due to pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Step-down Test (Right)',
      movement_tested: 'knee_flexion',
      procedure:
        'Stand on 8-inch step on right leg, slowly lower left heel to floor. Note pain and control.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Step-down Test (Left)',
      movement_tested: 'knee_flexion',
      procedure:
        'Stand on 8-inch step on left leg, slowly lower right heel to floor. Note pain and control.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const SHOULDER_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Shoulder Quick Screen',
  description: '10-minute screening for shoulder impingement and rotator cuff pathology',
  region: 'shoulder',
  estimated_duration: '10 minutes',
  tests: [
    {
      test_name: 'Neer Impingement Test (Right)',
      movement_tested: 'shoulder_flexion',
      procedure:
        'Stabilize scapula, passively flex arm to maximum. Positive if anterior/lateral shoulder pain.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'neer_test'
    },
    {
      test_name: 'Neer Impingement Test (Left)',
      movement_tested: 'shoulder_flexion',
      procedure:
        'Stabilize scapula, passively flex arm to maximum. Positive if anterior/lateral shoulder pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Hawkins-Kennedy Test (Right)',
      movement_tested: 'shoulder_internal_rotation',
      procedure:
        'Arm at 90° flexion, elbow 90° flexion, internally rotate shoulder. Positive if pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Hawkins-Kennedy Test (Left)',
      movement_tested: 'shoulder_internal_rotation',
      procedure:
        'Arm at 90° flexion, elbow 90° flexion, internally rotate shoulder. Positive if pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Painful Arc (Right)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Patient actively abducts arm from side to overhead. Note angle of pain (typically 60-120°).',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Painful Arc (Left)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Patient actively abducts arm from side to overhead. Note angle of pain (typically 60-120°).',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Empty Can Test (Right)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Arm at 90° abduction, 30° forward flexion, thumb down. Apply downward resistance. Note pain/weakness.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Empty Can Test (Left)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Arm at 90° abduction, 30° forward flexion, thumb down. Apply downward resistance. Note pain/weakness.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'External Rotation Strength (Right)',
      movement_tested: 'shoulder_external_rotation',
      procedure:
        'Arm at side, elbow 90°, resist external rotation. Compare to opposite side.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'External Rotation Strength (Left)',
      movement_tested: 'shoulder_external_rotation',
      procedure:
        'Arm at side, elbow 90°, resist external rotation. Compare to opposite side.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const NECK_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Neck Quick Screen',
  description: '8-minute screening for cervical spine pain and nerve involvement',
  region: 'cervical_spine',
  estimated_duration: '8 minutes',
  tests: [
    {
      test_name: 'Cervical Flexion',
      movement_tested: 'cervical_flexion',
      procedure:
        'Seated, slowly lower chin toward chest. Note pain location, ROM restriction, or radiating symptoms.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'neck_flexion_test'
    },
    {
      test_name: 'Cervical Extension',
      movement_tested: 'cervical_extension',
      procedure:
        'Seated, slowly tilt head back looking at ceiling. Note pain, ROM, or radiating symptoms.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'neck_extension_test'
    },
    {
      test_name: 'Cervical Rotation (Right)',
      movement_tested: 'cervical_rotation_right',
      procedure:
        'Seated, turn head to right attempting chin over shoulder. Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Cervical Rotation (Left)',
      movement_tested: 'cervical_rotation_left',
      procedure:
        'Seated, turn head to left attempting chin over shoulder. Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Cervical Lateral Flexion (Right)',
      movement_tested: 'cervical_lateral_flexion_right',
      procedure:
        'Seated, tilt head to right bringing ear toward shoulder (NO shoulder shrug). Note pain and ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Cervical Lateral Flexion (Left)',
      movement_tested: 'cervical_lateral_flexion_left',
      procedure:
        'Seated, tilt head to left bringing ear toward shoulder (NO shoulder shrug). Note pain and ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Spurling\'s Test (Right)',
      movement_tested: 'cervical_compression',
      procedure:
        'Extend and rotate neck to affected side, apply gentle downward compression. Positive if radiating arm pain (nerve root compression).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'spurling_test'
    },
    {
      test_name: 'Spurling\'s Test (Left)',
      movement_tested: 'cervical_compression',
      procedure:
        'Extend and rotate neck to affected side, apply gentle downward compression. Positive if radiating arm pain.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

export const ELBOW_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Elbow Quick Screen',
  description: '7-minute screening for elbow tendinopathy and nerve issues',
  region: 'elbow',
  estimated_duration: '7 minutes',
  tests: [
    {
      test_name: 'Lateral Epicondylitis Test (Right)',
      movement_tested: 'wrist_extension',
      procedure:
        'Elbow extended, fist clenched, wrist extended. Resist wrist extension. Positive if lateral elbow pain (tennis elbow).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'lateral_epicondylitis_test'
    },
    {
      test_name: 'Lateral Epicondylitis Test (Left)',
      movement_tested: 'wrist_extension',
      procedure:
        'Elbow extended, fist clenched, wrist extended. Resist wrist extension. Positive if lateral elbow pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Medial Epicondylitis Test (Right)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Elbow extended, wrist flexed. Resist wrist flexion. Positive if medial elbow pain (golfer\'s elbow).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'medial_epicondylitis_test'
    },
    {
      test_name: 'Medial Epicondylitis Test (Left)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Elbow extended, wrist flexed. Resist wrist flexion. Positive if medial elbow pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Elbow Flexion ROM (Right)',
      movement_tested: 'elbow_flexion',
      procedure:
        'Actively bend elbow bringing hand toward shoulder. Measure maximum flexion and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Elbow Flexion ROM (Left)',
      movement_tested: 'elbow_flexion',
      procedure:
        'Actively bend elbow bringing hand toward shoulder. Measure maximum flexion and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Elbow Extension ROM (Right)',
      movement_tested: 'elbow_extension',
      procedure:
        'Actively straighten elbow. Check for full extension (0°) or hyperextension. Note pain or restriction.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Elbow Extension ROM (Left)',
      movement_tested: 'elbow_extension',
      procedure:
        'Actively straighten elbow. Check for full extension (0°). Note pain or restriction.',
      pain_scale: true,
      rom_assessment: true
    }
  ]
};

export const WRIST_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Wrist Quick Screen',
  description: '6-minute screening for wrist pain and carpal tunnel',
  region: 'wrist',
  estimated_duration: '6 minutes',
  tests: [
    {
      test_name: 'Wrist Flexion ROM (Right)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Elbow extended, actively flex wrist (palm toward forearm). Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'wrist_flexion_test'
    },
    {
      test_name: 'Wrist Flexion ROM (Left)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Elbow extended, actively flex wrist. Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Wrist Extension ROM (Right)',
      movement_tested: 'wrist_extension',
      procedure:
        'Elbow extended, actively extend wrist (back of hand toward forearm). Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'wrist_extension_test'
    },
    {
      test_name: 'Wrist Extension ROM (Left)',
      movement_tested: 'wrist_extension',
      procedure:
        'Elbow extended, actively extend wrist. Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Phalen\'s Test (Right)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Press backs of hands together (wrists in full flexion) for 60 seconds. Positive if tingling/numbness in median nerve distribution (carpal tunnel).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'phalens_test'
    },
    {
      test_name: 'Phalen\'s Test (Left)',
      movement_tested: 'wrist_flexion',
      procedure:
        'Press backs of hands together for 60 seconds. Positive if tingling/numbness.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Wrist Radial/Ulnar Deviation (Right)',
      movement_tested: 'wrist_deviation',
      procedure:
        'Wrist neutral, move hand radially (thumb side) and ulnarly (pinky side). Check ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Wrist Radial/Ulnar Deviation (Left)',
      movement_tested: 'wrist_deviation',
      procedure:
        'Wrist neutral, move hand radially and ulnarly. Check ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    }
  ]
};

export const SCAPULA_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Scapula Quick Screen',
  description: '8-minute screening for scapular dyskinesis and winging',
  region: 'scapula',
  estimated_duration: '8 minutes',
  tests: [
    {
      test_name: 'Scapular Winging Test (Right)',
      movement_tested: 'scapular_protraction',
      procedure:
        'Standing wall push-up position. Observe scapula for medial border winging. Positive if scapula lifts off ribcage (serratus anterior weakness).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'scapular_winging_test'
    },
    {
      test_name: 'Scapular Winging Test (Left)',
      movement_tested: 'scapular_protraction',
      procedure:
        'Standing wall push-up. Observe for scapular winging.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Scapular Assistance Test (Right)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Actively abduct arm. If painful, manually assist scapular upward rotation and repeat. Positive if pain reduced with assistance.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'scapular_assistance_test'
    },
    {
      test_name: 'Scapular Assistance Test (Left)',
      movement_tested: 'shoulder_abduction',
      procedure:
        'Actively abduct arm. Manually assist scapula if painful. Note pain reduction.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Scapular Retraction Strength',
      movement_tested: 'scapular_retraction',
      procedure:
        'Squeeze shoulder blades together (retract scapulae) against resistance. Check strength and pain.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Lateral Scapular Slide Test',
      movement_tested: 'scapular_depression',
      procedure:
        'Measure distance from spine to inferior angle of scapula at 0°, 45°, 90° arm abduction. >1.5cm difference side-to-side = dyskinesis.',
      pain_scale: true,
      rom_assessment: true
    }
  ]
};

export const THORACIC_SPINE_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Thoracic Spine Quick Screen',
  description: '7-minute screening for thoracic spine mobility and pain',
  region: 'thoracic_spine',
  estimated_duration: '7 minutes',
  tests: [
    {
      test_name: 'Thoracic Rotation (Right) - Quadruped',
      movement_tested: 'thoracic_rotation_right',
      procedure:
        'Quadruped position, one hand behind head. Rotate thoracic spine right (NO lumbar rotation). Measure ROM.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'thoracic_rotation_test'
    },
    {
      test_name: 'Thoracic Rotation (Left) - Quadruped',
      movement_tested: 'thoracic_rotation_left',
      procedure:
        'Quadruped, one hand behind head. Rotate thoracic spine left. Measure ROM.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Thoracic Extension - Prone',
      movement_tested: 'thoracic_extension',
      procedure:
        'Prone, hands behind head, lift chest off ground (extend thoracic spine). Assess extension mobility.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'thoracic_extension_test'
    },
    {
      test_name: 'Thoracic Flexion - Seated',
      movement_tested: 'thoracic_flexion',
      procedure:
        'Seated, cross arms over chest, round upper back (flexion). Note ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Seated Slump Test',
      movement_tested: 'neural_tension',
      procedure:
        'Seated, slump forward, extend knee, dorsiflex ankle. Positive if reproduces radiating pain (neural tension).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'slump_test'
    }
  ]
};

export const ANKLE_QUICK_SCREEN: ScreeningProtocol = {
  name: 'Ankle Quick Screen',
  description: '8-minute screening for ankle mobility and stability',
  region: 'ankle',
  estimated_duration: '8 minutes',
  tests: [
    {
      test_name: 'Weight-Bearing Ankle Dorsiflexion (Right)',
      movement_tested: 'ankle_dorsiflexion',
      procedure:
        'Lunge position, knee forward over toes while heel stays down. Measure knee-to-wall distance. <10cm = restricted.',
      pain_scale: true,
      rom_assessment: true,
      video_ref: 'ankle_dorsiflexion_test'
    },
    {
      test_name: 'Weight-Bearing Ankle Dorsiflexion (Left)',
      movement_tested: 'ankle_dorsiflexion',
      procedure:
        'Lunge position, measure knee-to-wall distance with heel down.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Ankle Plantarflexion ROM (Right)',
      movement_tested: 'ankle_plantarflexion',
      procedure:
        'Seated or supine, point toes away (plantarflex). Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Ankle Plantarflexion ROM (Left)',
      movement_tested: 'ankle_plantarflexion',
      procedure:
        'Point toes away (plantarflex). Measure ROM and pain.',
      pain_scale: true,
      rom_assessment: true
    },
    {
      test_name: 'Single Leg Balance (Right)',
      movement_tested: 'ankle_stability',
      procedure:
        'Stand on right leg for 30 seconds, eyes open. Note excessive ankle wobble or inability to maintain balance.',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'single_leg_balance_test'
    },
    {
      test_name: 'Single Leg Balance (Left)',
      movement_tested: 'ankle_stability',
      procedure:
        'Stand on left leg for 30 seconds. Note ankle stability.',
      pain_scale: true,
      rom_assessment: false
    },
    {
      test_name: 'Anterior Drawer Test (Right)',
      movement_tested: 'ankle_ligament_integrity',
      procedure:
        'Seated, ankle in slight plantarflexion. Apply anterior force to heel while stabilizing tibia. Positive if excessive anterior movement (ankle sprain/laxity).',
      pain_scale: true,
      rom_assessment: false,
      video_ref: 'anterior_drawer_test'
    },
    {
      test_name: 'Anterior Drawer Test (Left)',
      movement_tested: 'ankle_ligament_integrity',
      procedure:
        'Apply anterior force to heel. Check for excessive movement.',
      pain_scale: true,
      rom_assessment: false
    }
  ]
};

// =============================================================================
// SCREENING PROTOCOL REGISTRY
// =============================================================================

export const SCREENING_PROTOCOLS: Record<string, ScreeningProtocol> = {
  lower_back_quick: LOWER_BACK_QUICK_SCREEN,
  lower_back_comprehensive: LOWER_BACK_COMPREHENSIVE_SCREEN,
  hip_quick: HIP_QUICK_SCREEN,
  knee_quick: KNEE_QUICK_SCREEN,
  shoulder_quick: SHOULDER_QUICK_SCREEN,
  neck_quick: NECK_QUICK_SCREEN,
  elbow_quick: ELBOW_QUICK_SCREEN,
  wrist_quick: WRIST_QUICK_SCREEN,
  scapula_quick: SCAPULA_QUICK_SCREEN,
  thoracic_spine_quick: THORACIC_SPINE_QUICK_SCREEN,
  ankle_quick: ANKLE_QUICK_SCREEN
};

// =============================================================================
// INTERPRETATION FUNCTIONS
// =============================================================================

/**
 * Interpret screening results and generate movement profile
 */
export function interpretScreeningResults(results: ScreeningResults): MovementProfile {
  const painfulMovements: string[] = [];
  const restrictedMovements: string[] = [];

  // Threshold for significant pain
  const PAIN_THRESHOLD = 3; // 0-10 scale

  results.test_results.forEach((result) => {
    if (result.pain_level >= PAIN_THRESHOLD) {
      painfulMovements.push(result.movement_tested);
    }
    if (result.rom_restriction) {
      restrictedMovements.push(result.movement_tested);
    }
  });

  // Determine directional preference (for spine)
  let directionalPreference: 'flexion' | 'extension' | 'neutral' | undefined;

  if (results.protocol_used.includes('lower_back')) {
    const flexionPain =
      results.test_results.find((r) => r.movement_tested === 'spinal_flexion')
        ?.pain_level || 0;
    const extensionPain =
      results.test_results.find((r) => r.movement_tested === 'spinal_extension')
        ?.pain_level || 0;

    if (flexionPain >= PAIN_THRESHOLD && extensionPain < PAIN_THRESHOLD) {
      directionalPreference = 'extension'; // Extension preference = flexion intolerant
    } else if (extensionPain >= PAIN_THRESHOLD && flexionPain < PAIN_THRESHOLD) {
      directionalPreference = 'flexion'; // Flexion preference = extension intolerant
    } else if (flexionPain < PAIN_THRESHOLD && extensionPain < PAIN_THRESHOLD) {
      directionalPreference = 'neutral';
    }
  }

  // Determine severity
  const maxPain = Math.max(...results.test_results.map((r) => r.pain_level));
  const percentPainful =
    (results.test_results.filter((r) => r.pain_level >= PAIN_THRESHOLD).length /
      results.test_results.length) *
    100;

  let severity: 'mild' | 'moderate' | 'severe';
  if (maxPain <= 4 && percentPainful <= 30) {
    severity = 'mild';
  } else if (maxPain <= 7 && percentPainful <= 60) {
    severity = 'moderate';
  } else {
    severity = 'severe';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(
    painfulMovements,
    restrictedMovements,
    directionalPreference,
    severity
  );

  // Get safe and avoid exercises
  const { safe_exercises, avoid_exercises } = generateExerciseLists(painfulMovements);

  // Get recommended protocols
  const recommendedProtocols = getRecommendedProtocols(painfulMovements);

  return {
    pain_patterns: Array.from(new Set(painfulMovements)),
    restrictions: Array.from(new Set(restrictedMovements)),
    directional_preference: directionalPreference,
    severity,
    recommendations,
    safe_exercises,
    avoid_exercises,
    recommended_protocols: recommendedProtocols
  };
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  painfulMovements: string[],
  restrictedMovements: string[],
  directionalPreference: 'flexion' | 'extension' | 'neutral' | undefined,
  severity: 'mild' | 'moderate' | 'severe'
): string[] {
  const recommendations: string[] = [];

  // Severity-based recommendations
  if (severity === 'severe') {
    recommendations.push(
      '⚠️ SEVERE pain detected. Consider medical evaluation before beginning exercise program.'
    );
    recommendations.push('Recommend starting with Phase 1 (Acute) protocols only.');
  } else if (severity === 'moderate') {
    recommendations.push(
      '⚡ MODERATE pain detected. Begin with modified programming and progress gradually.'
    );
  } else {
    recommendations.push(
      '✅ MILD pain detected. Program modifications recommended but training can continue.'
    );
  }

  // Directional preference recommendations (McKenzie approach)
  if (directionalPreference === 'extension') {
    recommendations.push(
      '🎯 EXTENSION DIRECTIONAL PREFERENCE detected (flexion intolerant).'
    );
    recommendations.push(
      'Perform McKenzie extensions (prone press-ups) 10 reps every 2-3 hours.'
    );
    recommendations.push('Avoid all forward bending exercises initially.');
    recommendations.push(
      'Use rack pulls, chest-supported rows, and trap bar deadlifts instead of conventional deadlifts.'
    );
  } else if (directionalPreference === 'flexion') {
    recommendations.push(
      '🎯 FLEXION DIRECTIONAL PREFERENCE detected (extension intolerant).'
    );
    recommendations.push(
      'Perform cat-cow stretches (emphasizing flexion) and child\'s pose 5x daily.'
    );
    recommendations.push('Avoid overhead pressing and standing extension exercises initially.');
    recommendations.push(
      'Use seated shoulder press, front squats, and leg press instead of back squats and overhead press.'
    );
  }

  // Movement-specific recommendations
  if (painfulMovements.includes('patellofemoral_compression')) {
    recommendations.push('💡 Patellofemoral pain detected.');
    recommendations.push('Limit squat depth to 60-90° knee flexion initially.');
    recommendations.push(
      'Perform Spanish squats 3x30sec holds before knee training (reduces PF compression).'
    );
    recommendations.push(
      'Strengthen hip abductors (clamshells, lateral walks) - weakness commonly contributes to knee pain.'
    );
  }

  if (painfulMovements.includes('shoulder_flexion') || painfulMovements.includes('shoulder_abduction')) {
    recommendations.push('💡 Shoulder impingement pattern detected.');
    recommendations.push('Perform face pulls 15-20 reps before every upper body session.');
    recommendations.push('Maintain 2:1 ratio of pulling to pushing exercises.');
    recommendations.push(
      'Use landmine press or limited ROM overhead work instead of full overhead press initially.'
    );
  }

  if (painfulMovements.includes('hip_flexion')) {
    recommendations.push('💡 Deep hip flexion pain detected (possible FAI).');
    recommendations.push('Limit squat depth to parallel (50-70% depth) initially.');
    recommendations.push('Widen squat stance and turn toes out 20-30° to reduce hip flexion demand.');
    recommendations.push('Work on hip external rotation mobility daily (90/90 stretches).');
  }

  if (painfulMovements.includes('spinal_rotation_right') || painfulMovements.includes('spinal_rotation_left')) {
    recommendations.push('💡 Spinal rotation pain detected.');
    recommendations.push(
      'Perform Pallof Press 3x10 each side, 3-4x per week (anti-rotation training).'
    );
    recommendations.push('Avoid Russian twists and rotational exercises initially.');
    recommendations.push('Use bilateral symmetric exercises (both arms/legs together).');
  }

  // Restriction-based recommendations
  if (restrictedMovements.includes('ankle_dorsiflexion')) {
    recommendations.push('⚙️ Limited ankle dorsiflexion detected.');
    recommendations.push(
      'Perform weight-bearing ankle stretches daily (wall lunge stretch).'
    );
    recommendations.push(
      'Consider heel elevation (0.5-1 inch) under heels for squats to compensate.'
    );
  }

  if (restrictedMovements.includes('hip_internal_rotation')) {
    recommendations.push('⚙️ Limited hip internal rotation detected.');
    recommendations.push('Perform 90/90 hip switches and IR stretches daily.');
    recommendations.push('Consider wider squat stance to reduce IR demand.');
  }

  // General recommendations
  recommendations.push(
    '📋 Follow recommended recovery protocols for structured progression through phases.'
  );

  return recommendations;
}

/**
 * Generate lists of safe and avoid exercises
 */
function generateExerciseLists(painfulMovements: string[]): {
  safe_exercises: string[];
  avoid_exercises: string[];
} {
  // This would ideally check all exercises in the database
  // For now, providing general guidance based on common patterns

  const avoid_exercises: string[] = [];
  const safe_exercises: string[] = [];

  if (painfulMovements.includes('spinal_flexion')) {
    avoid_exercises.push(
      'Conventional Deadlift (from floor)',
      'Good Morning',
      'Barbell Row (bent-over)',
      'Sit-ups',
      'Crunches',
      'Toe Touch'
    );
    safe_exercises.push(
      'Rack Pull (knee height)',
      'Trap Bar Deadlift',
      'Chest-Supported Row',
      'Cable Row',
      'Hip Thrust',
      'Plank',
      'Bird Dog'
    );
  }

  if (painfulMovements.includes('spinal_extension')) {
    avoid_exercises.push(
      'Overhead Press (standing)',
      'Hip Thrust (if excessive lumbar extension)',
      'Back Extensions',
      'Cobra Stretch'
    );
    safe_exercises.push(
      'Landmine Press',
      'DB Shoulder Press (seated with back support)',
      'Front Squat',
      'Leg Press',
      'Dead Bug'
    );
  }

  if (painfulMovements.includes('hip_flexion')) {
    avoid_exercises.push(
      'Deep Squats (ass-to-grass)',
      'Pistol Squats',
      'Deep Lunges',
      'Leg Press (deep ROM)'
    );
    safe_exercises.push(
      'Box Squat (parallel)',
      'Goblet Squat (50-70% depth)',
      'Bulgarian Split Squat (limited depth)',
      'Hip Thrust',
      'Romanian Deadlift'
    );
  }

  if (painfulMovements.includes('patellofemoral_compression')) {
    avoid_exercises.push(
      'Deep Squats',
      'Leg Extension (full ROM)',
      'Forward Lunges',
      'Pistol Squats'
    );
    safe_exercises.push(
      'Spanish Squat',
      'Box Squat (parallel)',
      'Leg Press (limited ROM to 90°)',
      'Terminal Knee Extension',
      'Wall Sit',
      'Step-ups',
      'Hip Thrust',
      'Romanian Deadlift'
    );
  }

  if (painfulMovements.includes('shoulder_flexion')) {
    avoid_exercises.push(
      'Overhead Press',
      'Pull-ups',
      'Lateral Raises',
      'Front Raises',
      'Handstand Push-ups'
    );
    safe_exercises.push(
      'Landmine Press',
      'Floor Press',
      'Bench Press',
      'Cable Row',
      'Face Pulls',
      'Chest-Supported Row'
    );
  }

  return {
    safe_exercises: Array.from(new Set(safe_exercises)),
    avoid_exercises: Array.from(new Set(avoid_exercises))
  };
}

/**
 * Get recommended recovery protocols
 */
function getRecommendedProtocols(painfulMovements: string[]): RecoveryProtocol[] {
  const protocols: RecoveryProtocol[] = [];

  painfulMovements.forEach((movement) => {
    const protocol = getProtocolByMovement(movement);
    if (protocol && !protocols.find((p) => p.protocol_name === protocol.protocol_name)) {
      protocols.push(protocol);
    }
  });

  return protocols;
}

/**
 * Generate screening report (summary)
 */
export function generateScreeningReport(
  results: ScreeningResults,
  profile: MovementProfile
): string {
  let report = `
# MOVEMENT SCREENING REPORT
Date: ${results.date}
Protocol: ${results.protocol_used}
Severity: ${profile.severity.toUpperCase()}

## Pain Patterns Identified
${profile.pain_patterns.length > 0 ? profile.pain_patterns.map((p) => `- ${p}`).join('\n') : 'None'}

## Mobility Restrictions
${profile.restrictions.length > 0 ? profile.restrictions.map((r) => `- ${r}`).join('\n') : 'None'}

${profile.directional_preference ? `## Directional Preference\n${profile.directional_preference.toUpperCase()}\n` : ''}

## Recommendations
${profile.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Exercise Modifications

### SAFE EXERCISES (Continue/Add)
${profile.safe_exercises.map((e) => `- ${e}`).join('\n')}

### AVOID EXERCISES (Remove/Substitute)
${profile.avoid_exercises.map((e) => `- ${e}`).join('\n')}

## Recommended Recovery Protocols
${
  profile.recommended_protocols.length > 0
    ? profile.recommended_protocols
        .map((p) => `- ${p.protocol_name}\n  Goal: ${p.phase_1_acute.goal}`)
        .join('\n')
    : 'No specific protocol recommended. General training modifications sufficient.'
}

---
Generated by FitnessFlow Anatomical Pain Tracking System
`;

  return report;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all available screening protocols
 */
export function getAvailableScreeningProtocols(): ScreeningProtocol[] {
  return Object.values(SCREENING_PROTOCOLS);
}

/**
 * Get screening protocol by name
 */
export function getScreeningProtocol(name: string): ScreeningProtocol | undefined {
  return SCREENING_PROTOCOLS[name];
}

/**
 * Create empty screening result template
 */
export function createScreeningResultTemplate(
  protocolName: string
): ScreeningResults | undefined {
  const protocol = SCREENING_PROTOCOLS[protocolName];
  if (!protocol) return undefined;

  return {
    protocol_used: protocol.name,
    date: new Date().toISOString().split('T')[0],
    test_results: protocol.tests.map((test) => ({
      test_name: test.test_name,
      movement_tested: test.movement_tested,
      pain_level: 0,
      rom_restriction: false,
      notes: ''
    }))
  };
}

/**
 * Quick screen helper - simplified screening for basic pain assessment
 */
export function quickPainAssessment(painPoints: Array<{ movement: string; pain: number }>): {
  severity: 'mild' | 'moderate' | 'severe';
  primaryIssues: string[];
  quickRecommendations: string[];
} {
  const maxPain = Math.max(...painPoints.map((p) => p.pain));
  const avgPain =
    painPoints.reduce((sum, p) => sum + p.pain, 0) / painPoints.length;

  let severity: 'mild' | 'moderate' | 'severe';
  if (maxPain <= 4 && avgPain <= 3) {
    severity = 'mild';
  } else if (maxPain <= 7 && avgPain <= 5) {
    severity = 'moderate';
  } else {
    severity = 'severe';
  }

  const primaryIssues = painPoints
    .filter((p) => p.pain >= 5)
    .map((p) => p.movement)
    .slice(0, 3);

  const quickRecommendations: string[] = [];

  if (severity === 'severe') {
    quickRecommendations.push('Consider medical evaluation before training');
    quickRecommendations.push('Start with Phase 1 acute protocols');
  } else if (severity === 'moderate') {
    quickRecommendations.push('Modify program to avoid painful movements');
    quickRecommendations.push('Follow recovery protocols for affected areas');
  } else {
    quickRecommendations.push('Continue training with minor modifications');
    quickRecommendations.push('Monitor symptoms for progression');
  }

  return {
    severity,
    primaryIssues,
    quickRecommendations
  };
}

// Export stats
export const SCREENING_PROTOCOL_COUNT = Object.keys(SCREENING_PROTOCOLS).length;
