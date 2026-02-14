/**
 * Issue Segment Mapping
 * Mappa ogni codice issue ai landmark da disegnare come overlay sul video
 *
 * - Segmenti rossi = posizione attuale (errore)
 * - Segmenti verdi = posizione corretta (calcolata)
 */

import type { PoseLandmarks, PoseLandmark } from './types';

// ============================================
// TYPES
// ============================================

export type CorrectionStrategy =
  | 'project_to_vertical_plane'
  | 'rotate_around_point'
  | 'project_to_ground'
  | 'straighten_chain'
  | 'symmetrize'
  | 'none';

export type LandmarkKey = keyof PoseLandmarks;

export interface SegmentDefinition {
  from: LandmarkKey;
  to: LandmarkKey;
}

export interface IssueSegmentMap {
  /** Segmenti da disegnare in rosso (posizione errata) */
  errorSegments: SegmentDefinition[];
  /** Punti da evidenziare con cerchio rosso */
  errorPoints: LandmarkKey[];
  /** Strategia per calcolare la posizione corretta (verde) */
  correctionStrategy: CorrectionStrategy;
  /** Parametri per la strategia di correzione */
  correctionParams?: {
    targetAngle?: number;
    pivot?: LandmarkKey;
    endpoint?: LandmarkKey;
    chain?: LandmarkKey[];
    referenceLine?: [LandmarkKey, LandmarkKey];
    projectPoint?: LandmarkKey;
    symmetryAxis?: [LandmarkKey, LandmarkKey];
    symmetryPairs?: [LandmarkKey, LandmarkKey][];
  };
}

// ============================================
// MAPPING
// ============================================

export const ISSUE_SEGMENT_MAP: Record<string, IssueSegmentMap> = {
  // --- SQUAT / LOWER BODY ---
  KNEE_VALGUS: {
    errorSegments: [
      { from: 'left_hip', to: 'left_knee' },
      { from: 'left_knee', to: 'left_ankle' },
      { from: 'right_hip', to: 'right_knee' },
      { from: 'right_knee', to: 'right_ankle' },
    ],
    errorPoints: ['left_knee', 'right_knee'],
    correctionStrategy: 'project_to_vertical_plane',
    correctionParams: {
      referenceLine: ['left_hip', 'left_ankle'],
      projectPoint: 'left_knee',
    },
  },

  SPINE_FLEXION: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'right_hip', to: 'right_shoulder' },
    ],
    errorPoints: ['left_shoulder', 'right_shoulder'],
    correctionStrategy: 'straighten_chain',
    correctionParams: {
      chain: ['left_hip', 'left_shoulder'],
    },
  },

  EXCESSIVE_FORWARD_LEAN: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'right_hip', to: 'right_shoulder' },
    ],
    errorPoints: ['left_shoulder', 'right_shoulder'],
    correctionStrategy: 'rotate_around_point',
    correctionParams: {
      pivot: 'left_hip',
      endpoint: 'left_shoulder',
      targetAngle: -15,
    },
  },

  HEEL_RISE: {
    errorSegments: [
      { from: 'left_ankle', to: 'left_heel' },
      { from: 'right_ankle', to: 'right_heel' },
    ],
    errorPoints: ['left_heel', 'right_heel'],
    correctionStrategy: 'project_to_ground',
    correctionParams: {
      projectPoint: 'left_heel',
    },
  },

  INSUFFICIENT_DEPTH: {
    errorSegments: [
      { from: 'left_hip', to: 'left_knee' },
      { from: 'left_knee', to: 'left_ankle' },
    ],
    errorPoints: ['left_hip', 'left_knee'],
    correctionStrategy: 'none',
  },

  HIPS_RISE_FIRST: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'left_hip', to: 'left_knee' },
    ],
    errorPoints: ['left_hip'],
    correctionStrategy: 'none',
  },

  // --- DEADLIFT ---
  LOWER_BACK_ROUND: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'right_hip', to: 'right_shoulder' },
    ],
    errorPoints: ['left_shoulder', 'right_shoulder'],
    correctionStrategy: 'straighten_chain',
    correctionParams: {
      chain: ['left_hip', 'left_shoulder'],
    },
  },

  BAR_DRIFT_FORWARD: {
    errorSegments: [
      { from: 'left_wrist', to: 'left_shoulder' },
      { from: 'right_wrist', to: 'right_shoulder' },
    ],
    errorPoints: ['left_wrist', 'right_wrist'],
    correctionStrategy: 'project_to_vertical_plane',
    correctionParams: {
      referenceLine: ['left_shoulder', 'left_shoulder'],
      projectPoint: 'left_wrist',
    },
  },

  LOCKOUT_INCOMPLETE: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'left_hip', to: 'left_knee' },
    ],
    errorPoints: ['left_hip'],
    correctionStrategy: 'none',
  },

  // --- BENCH PRESS ---
  ELBOW_FLARE: {
    errorSegments: [
      { from: 'left_shoulder', to: 'left_elbow' },
      { from: 'right_shoulder', to: 'right_elbow' },
    ],
    errorPoints: ['left_elbow', 'right_elbow'],
    correctionStrategy: 'rotate_around_point',
    correctionParams: {
      pivot: 'left_shoulder',
      endpoint: 'left_elbow',
      targetAngle: 45,
    },
  },

  BAR_PATH_DEVIATION: {
    errorSegments: [
      { from: 'left_wrist', to: 'left_elbow' },
      { from: 'right_wrist', to: 'right_elbow' },
    ],
    errorPoints: ['left_wrist', 'right_wrist'],
    correctionStrategy: 'project_to_vertical_plane',
    correctionParams: {
      referenceLine: ['left_shoulder', 'left_shoulder'],
      projectPoint: 'left_wrist',
    },
  },

  ARM_ASYMMETRY: {
    errorSegments: [
      { from: 'left_shoulder', to: 'left_wrist' },
      { from: 'right_shoulder', to: 'right_wrist' },
    ],
    errorPoints: ['left_wrist', 'right_wrist'],
    correctionStrategy: 'symmetrize',
    correctionParams: {
      symmetryPairs: [
        ['left_wrist', 'right_wrist'],
      ],
    },
  },

  // --- ROW / PULL ---
  TORSO_SWING: {
    errorSegments: [
      { from: 'left_hip', to: 'left_shoulder' },
      { from: 'right_hip', to: 'right_shoulder' },
    ],
    errorPoints: ['left_shoulder', 'right_shoulder'],
    correctionStrategy: 'straighten_chain',
    correctionParams: {
      chain: ['left_hip', 'left_shoulder'],
    },
  },

  // --- ASYMMETRY ---
  WEIGHT_SHIFT_LATERAL: {
    errorSegments: [
      { from: 'left_hip', to: 'right_hip' },
      { from: 'left_shoulder', to: 'right_shoulder' },
    ],
    errorPoints: ['left_hip', 'right_hip'],
    correctionStrategy: 'symmetrize',
    correctionParams: {
      symmetryAxis: ['nose', 'left_hip'],
      symmetryPairs: [
        ['left_hip', 'right_hip'],
        ['left_shoulder', 'right_shoulder'],
      ],
    },
  },
};

/**
 * Ritorna la mappatura segmenti per un dato codice issue.
 * Se il codice non e' mappato, ritorna null.
 */
export function getIssueSegmentMap(issueCode: string): IssueSegmentMap | null {
  return ISSUE_SEGMENT_MAP[issueCode] ?? null;
}

// ============================================
// EXERCISE BODY SEGMENTS (per overlay verde su keyframe corretti)
// ============================================

/**
 * Ritorna i segmenti corporei rilevanti per un dato esercizio.
 * Usati per disegnare in verde solido sui keyframe corretti.
 */
export function getExerciseBodySegments(exerciseType: string): SegmentDefinition[] {
  switch (exerciseType) {
    // Lower body — gambe + busto
    case 'BACK_SQUAT':
    case 'FRONT_SQUAT':
    case 'BULGARIAN_SPLIT_SQUAT':
    case 'GOBLET_SQUAT':
    case 'PISTOL_SQUAT':
    case 'SKATER_SQUAT':
    case 'BODYWEIGHT_SQUAT':
    case 'LEG_PRESS':
    case 'HACK_SQUAT':
    case 'LUNGES':
    case 'LUNGE_FORWARD':
      return [
        { from: 'left_hip', to: 'left_knee' },
        { from: 'left_knee', to: 'left_ankle' },
        { from: 'right_hip', to: 'right_knee' },
        { from: 'right_knee', to: 'right_ankle' },
        { from: 'left_hip', to: 'left_shoulder' },
        { from: 'right_hip', to: 'right_shoulder' },
      ];

    // Deadlift / hip hinge — catena posteriore
    case 'DEADLIFT_CONVENTIONAL':
    case 'DEADLIFT_SUMO':
    case 'ROMANIAN_DEADLIFT':
    case 'GOOD_MORNING':
    case 'HIP_THRUST':
      return [
        { from: 'left_hip', to: 'left_knee' },
        { from: 'left_knee', to: 'left_ankle' },
        { from: 'right_hip', to: 'right_knee' },
        { from: 'right_knee', to: 'right_ankle' },
        { from: 'left_hip', to: 'left_shoulder' },
        { from: 'right_hip', to: 'right_shoulder' },
        { from: 'left_shoulder', to: 'left_wrist' },
        { from: 'right_shoulder', to: 'right_wrist' },
      ];

    // Bench press / push — busto + braccia
    case 'BENCH_PRESS':
    case 'INCLINE_BENCH_PRESS':
    case 'PUSH_UP':
    case 'DIP':
    case 'DIPS_CHEST':
    case 'DIPS_TRICEPS':
      return [
        { from: 'left_shoulder', to: 'left_elbow' },
        { from: 'left_elbow', to: 'left_wrist' },
        { from: 'right_shoulder', to: 'right_elbow' },
        { from: 'right_elbow', to: 'right_wrist' },
        { from: 'left_shoulder', to: 'right_shoulder' },
      ];

    // Overhead press — braccia + busto
    case 'OVERHEAD_PRESS':
    case 'DUMBBELL_SHOULDER_PRESS':
      return [
        { from: 'left_shoulder', to: 'left_elbow' },
        { from: 'left_elbow', to: 'left_wrist' },
        { from: 'right_shoulder', to: 'right_elbow' },
        { from: 'right_elbow', to: 'right_wrist' },
        { from: 'left_hip', to: 'left_shoulder' },
        { from: 'right_hip', to: 'right_shoulder' },
      ];

    // Pull / row — schiena + braccia
    case 'PULL_UP':
    case 'CHIN_UP':
    case 'LAT_PULLDOWN':
    case 'BARBELL_ROW':
    case 'DUMBBELL_ROW':
    case 'CABLE_ROW':
    case 'INVERTED_ROW':
      return [
        { from: 'left_shoulder', to: 'left_elbow' },
        { from: 'left_elbow', to: 'left_wrist' },
        { from: 'right_shoulder', to: 'right_elbow' },
        { from: 'right_elbow', to: 'right_wrist' },
        { from: 'left_hip', to: 'left_shoulder' },
        { from: 'right_hip', to: 'right_shoulder' },
      ];

    // Fallback — segmenti principali full-body
    default:
      return [
        { from: 'left_hip', to: 'left_knee' },
        { from: 'left_knee', to: 'left_ankle' },
        { from: 'right_hip', to: 'right_knee' },
        { from: 'right_knee', to: 'right_ankle' },
        { from: 'left_hip', to: 'left_shoulder' },
        { from: 'right_hip', to: 'right_shoulder' },
      ];
  }
}

/**
 * Verifica se un landmark ha visibilita' sufficiente per il disegno
 */
export function isLandmarkVisible(landmark: PoseLandmark, threshold = 0.4): boolean {
  return landmark.visibility >= threshold;
}

/**
 * Filtra i segmenti dove entrambi i landmark sono visibili
 */
export function getVisibleSegments(
  segments: SegmentDefinition[],
  landmarks: PoseLandmarks,
  threshold = 0.4
): SegmentDefinition[] {
  return segments.filter(seg =>
    isLandmarkVisible(landmarks[seg.from], threshold) &&
    isLandmarkVisible(landmarks[seg.to], threshold)
  );
}
