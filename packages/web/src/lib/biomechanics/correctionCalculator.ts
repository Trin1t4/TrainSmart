/**
 * Correction Calculator
 * Calcola le posizioni "corrette" (linee verdi) a partire dai landmark attuali e dalla strategia di correzione.
 *
 * 5 strategie:
 * 1. project_to_vertical_plane - Proietta un punto sulla linea tra due riferimenti (es. KNEE_VALGUS)
 * 2. rotate_around_point - Ruota un endpoint attorno a un pivot fino all'angolo target (es. FORWARD_LEAN, ELBOW_FLARE)
 * 3. project_to_ground - Proietta un punto alla y massima (suolo) (es. HEEL_RISE)
 * 4. straighten_chain - Linea retta dal primo all'ultimo punto della catena (es. SPINE_FLEXION)
 * 5. symmetrize - Simmetrizza i punti attorno all'asse centrale (es. WEIGHT_SHIFT)
 */

import type { PoseLandmarks } from './types';
import type {
  IssueSegmentMap,
  LandmarkKey,
  SegmentDefinition,
} from './issueSegmentMapping';

export interface Point2D {
  x: number;
  y: number;
}

export interface CorrectedSegment {
  from: Point2D;
  to: Point2D;
}

/**
 * Calcola i segmenti corretti (verdi) per un dato issue, dato i landmark attuali.
 * Ritorna null se la strategia e' 'none' o non calcolabile.
 */
export function calculateCorrectedSegments(
  mapping: IssueSegmentMap,
  landmarks: PoseLandmarks
): CorrectedSegment[] | null {
  const { correctionStrategy, correctionParams } = mapping;

  if (correctionStrategy === 'none' || !correctionParams) {
    return null;
  }

  switch (correctionStrategy) {
    case 'project_to_vertical_plane':
      return calcProjectToVerticalPlane(landmarks, mapping);

    case 'rotate_around_point':
      return calcRotateAroundPoint(landmarks, mapping);

    case 'project_to_ground':
      return calcProjectToGround(landmarks, mapping);

    case 'straighten_chain':
      return calcStraightenChain(landmarks, mapping);

    case 'symmetrize':
      return calcSymmetrize(landmarks, mapping);

    default:
      return null;
  }
}

// ============================================
// STRATEGY IMPLEMENTATIONS
// ============================================

/**
 * Proietta il punto problematico sulla linea verticale tra due riferimenti.
 * Usato per KNEE_VALGUS: proietta il ginocchio sulla linea hip-ankle (asse x).
 * Usato per BAR_DRIFT_FORWARD: proietta il polso sulla verticale della spalla.
 */
function calcProjectToVerticalPlane(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.referenceLine || !params.projectPoint) return null;

  const refFrom = landmarks[params.referenceLine[0]];
  const refTo = landmarks[params.referenceLine[1]];
  const point = landmarks[params.projectPoint];

  const t = refFrom.y !== refTo.y
    ? (point.y - refFrom.y) / (refTo.y - refFrom.y)
    : 0.5;
  const clampedT = Math.max(0, Math.min(1, t));
  const correctedX = refFrom.x + clampedT * (refTo.x - refFrom.x);

  const correctedPoint: Point2D = { x: correctedX, y: point.y };

  const result: CorrectedSegment[] = [];

  for (const seg of mapping.errorSegments) {
    const from = landmarks[seg.from];
    const to = landmarks[seg.to];

    const fromPt: Point2D = seg.from === params.projectPoint
      ? correctedPoint : { x: from.x, y: from.y };
    const toPt: Point2D = seg.to === params.projectPoint
      ? correctedPoint : { x: to.x, y: to.y };

    result.push({ from: fromPt, to: toPt });
  }

  if (hasBilateralSegments(mapping.errorSegments)) {
    const rightResult = calcProjectBilateral(landmarks, mapping);
    if (rightResult) result.push(...rightResult);
  }

  return result.length > 0 ? deduplicateSegments(result) : null;
}

function calcProjectBilateral(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.projectPoint) return null;

  const pointKey = params.projectPoint;
  const isLeft = pointKey.startsWith('left_');
  const oppositeKey = (isLeft
    ? pointKey.replace('left_', 'right_')
    : pointKey.replace('right_', 'left_')) as LandmarkKey;

  if (!landmarks[oppositeKey]) return null;

  const refFrom = params.referenceLine![0];
  const refTo = params.referenceLine![1];
  const oppRefFrom = (isLeft
    ? refFrom.replace('left_', 'right_')
    : refFrom.replace('right_', 'left_')) as LandmarkKey;
  const oppRefTo = (isLeft
    ? refTo.replace('left_', 'right_')
    : refTo.replace('right_', 'left_')) as LandmarkKey;

  if (!landmarks[oppRefFrom] || !landmarks[oppRefTo]) return null;

  const from = landmarks[oppRefFrom];
  const to = landmarks[oppRefTo];
  const point = landmarks[oppositeKey];

  const t = from.y !== to.y
    ? (point.y - from.y) / (to.y - from.y)
    : 0.5;
  const clampedT = Math.max(0, Math.min(1, t));
  const correctedX = from.x + clampedT * (to.x - from.x);

  const correctedPoint: Point2D = { x: correctedX, y: point.y };

  const segments = mapping.errorSegments.filter(s =>
    s.from.startsWith(isLeft ? 'right_' : 'left_') ||
    s.to.startsWith(isLeft ? 'right_' : 'left_')
  );

  return segments.map(seg => {
    const segFrom = landmarks[seg.from];
    const segTo = landmarks[seg.to];
    return {
      from: seg.from === oppositeKey ? correctedPoint : { x: segFrom.x, y: segFrom.y },
      to: seg.to === oppositeKey ? correctedPoint : { x: segTo.x, y: segTo.y },
    };
  });
}

/**
 * Ruota un endpoint attorno a un pivot fino all'angolo target.
 */
function calcRotateAroundPoint(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.pivot || !params.endpoint || params.targetAngle === undefined) return null;

  const pivot = landmarks[params.pivot];
  const endpoint = landmarks[params.endpoint];

  const dx = endpoint.x - pivot.x;
  const dy = endpoint.y - pivot.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const targetRad = (params.targetAngle * Math.PI) / 180;

  const correctedEndpoint: Point2D = {
    x: pivot.x + distance * Math.cos(targetRad),
    y: pivot.y + distance * Math.sin(targetRad),
  };

  const result: CorrectedSegment[] = [];

  for (const seg of mapping.errorSegments) {
    const from = landmarks[seg.from];
    const to = landmarks[seg.to];

    const fromPt: Point2D = seg.from === params.endpoint
      ? correctedEndpoint : { x: from.x, y: from.y };
    const toPt: Point2D = seg.to === params.endpoint
      ? correctedEndpoint : { x: to.x, y: to.y };

    result.push({ from: fromPt, to: toPt });
  }

  return result.length > 0 ? result : null;
}

/**
 * Proietta un punto al livello del suolo (y massima nel frame).
 */
function calcProjectToGround(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.projectPoint) return null;

  const groundY = Math.max(
    landmarks.left_heel.y,
    landmarks.right_heel.y,
    landmarks.left_foot_index.y,
    landmarks.right_foot_index.y,
    landmarks.left_ankle.y,
    landmarks.right_ankle.y
  );

  const result: CorrectedSegment[] = [];

  for (const seg of mapping.errorSegments) {
    const from = landmarks[seg.from];
    const to = landmarks[seg.to];

    const isFromHeel = seg.from.includes('heel');
    const isToHeel = seg.to.includes('heel');

    result.push({
      from: isFromHeel ? { x: from.x, y: groundY } : { x: from.x, y: from.y },
      to: isToHeel ? { x: to.x, y: groundY } : { x: to.x, y: to.y },
    });
  }

  return result.length > 0 ? result : null;
}

/**
 * Linea retta dal primo all'ultimo punto della catena.
 */
function calcStraightenChain(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.chain || params.chain.length < 2) return null;

  const first = landmarks[params.chain[0]];
  const last = landmarks[params.chain[params.chain.length - 1]];

  const straightFrom: Point2D = { x: first.x, y: first.y };
  const straightTo: Point2D = { x: last.x, y: last.y };

  const result: CorrectedSegment[] = [{ from: straightFrom, to: straightTo }];

  const hasRight = mapping.errorSegments.some(s =>
    s.from.startsWith('right_') || s.to.startsWith('right_')
  );
  if (hasRight) {
    const rightChain = params.chain.map(k =>
      (k.startsWith('left_') ? k.replace('left_', 'right_') : k) as LandmarkKey
    );
    const rFirst = landmarks[rightChain[0]];
    const rLast = landmarks[rightChain[rightChain.length - 1]];
    if (rFirst && rLast) {
      result.push({
        from: { x: rFirst.x, y: rFirst.y },
        to: { x: rLast.x, y: rLast.y },
      });
    }
  }

  return result;
}

/**
 * Simmetrizza i punti attorno all'asse centrale.
 */
function calcSymmetrize(
  landmarks: PoseLandmarks,
  mapping: IssueSegmentMap
): CorrectedSegment[] | null {
  const params = mapping.correctionParams!;
  if (!params.symmetryPairs) return null;

  const result: CorrectedSegment[] = [];

  for (const [leftKey, rightKey] of params.symmetryPairs) {
    const left = landmarks[leftKey];
    const right = landmarks[rightKey];

    const centerX = (left.x + right.x) / 2;
    const centerY = (left.y + right.y) / 2;

    const halfDist = Math.sqrt(
      Math.pow(right.x - left.x, 2) + Math.pow(right.y - left.y, 2)
    ) / 2;

    result.push({
      from: { x: centerX - halfDist, y: centerY },
      to: { x: centerX + halfDist, y: centerY },
    });
  }

  return result.length > 0 ? result : null;
}

// ============================================
// HELPERS
// ============================================

function hasBilateralSegments(segments: SegmentDefinition[]): boolean {
  const hasLeft = segments.some(s => s.from.startsWith('left_') || s.to.startsWith('left_'));
  const hasRight = segments.some(s => s.from.startsWith('right_') || s.to.startsWith('right_'));
  return hasLeft && hasRight;
}

function deduplicateSegments(segments: CorrectedSegment[]): CorrectedSegment[] {
  const seen = new Set<string>();
  return segments.filter(seg => {
    const key = `${seg.from.x.toFixed(4)},${seg.from.y.toFixed(4)}-${seg.to.x.toFixed(4)},${seg.to.y.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
