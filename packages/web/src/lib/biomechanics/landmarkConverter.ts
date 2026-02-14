/**
 * Landmark Converter
 * Converte i landmark dal formato MediaPipe (PoseDetectionService)
 * al formato Biomechanics (PoseLandmarks required fields).
 */

import type { PoseLandmarks as SharedPoseLandmarks } from '@trainsmart/shared';
import type { PoseLandmarks, PoseLandmark, FrameLandmarkSnapshot, SegmentDef, Issue } from './types';

const DEFAULT_LANDMARK: PoseLandmark = { x: 0, y: 0, z: 0, visibility: 0 };

function toLandmark(point?: { x: number; y: number; z: number; visibility?: number }): PoseLandmark {
  if (!point) return DEFAULT_LANDMARK;
  return {
    x: point.x,
    y: point.y,
    z: point.z,
    visibility: point.visibility ?? 0,
  };
}

/**
 * Converte un frame MediaPipe nel formato PoseLandmarks con campi required.
 */
export function convertToBiomechanicsLandmarks(mp: SharedPoseLandmarks): PoseLandmarks {
  return {
    nose: toLandmark(mp.nose),
    left_eye: toLandmark(mp.left_eye),
    right_eye: toLandmark(mp.right_eye),
    left_ear: toLandmark(mp.left_ear),
    right_ear: toLandmark(mp.right_ear),
    left_shoulder: toLandmark(mp.left_shoulder),
    right_shoulder: toLandmark(mp.right_shoulder),
    left_elbow: toLandmark(mp.left_elbow),
    right_elbow: toLandmark(mp.right_elbow),
    left_wrist: toLandmark(mp.left_wrist),
    right_wrist: toLandmark(mp.right_wrist),
    left_hip: toLandmark(mp.left_hip),
    right_hip: toLandmark(mp.right_hip),
    left_knee: toLandmark(mp.left_knee),
    right_knee: toLandmark(mp.right_knee),
    left_ankle: toLandmark(mp.left_ankle),
    right_ankle: toLandmark(mp.right_ankle),
    left_heel: toLandmark(mp.left_heel),
    right_heel: toLandmark(mp.right_heel),
    left_foot_index: toLandmark(mp.left_foot_index),
    right_foot_index: toLandmark(mp.right_foot_index),
  };
}

/**
 * Crea un FrameLandmarkSnapshot da un frame MediaPipe e le issue rilevate.
 */
export function createLandmarkSnapshot(
  mp: SharedPoseLandmarks,
  frameNumber: number,
  timestamp: number,
  issues: Pick<Issue, 'code' | 'severity'>[],
  status: 'error' | 'correct' = 'error',
  exerciseSegments?: SegmentDef[]
): FrameLandmarkSnapshot {
  return {
    frameNumber,
    timestamp,
    landmarks: convertToBiomechanicsLandmarks(mp),
    issues,
    status,
    exerciseSegments,
  };
}
