/**
 * Pull Analyzer
 * Analisi biomeccanica per tirate orizzontali (Row) e verticali (Pull-up, Lat Pulldown)
 * Basato sui principi DCSS di Paolo Evangelista
 */

import type {
  PoseLandmarks,
  FrameAnalysis,
  Issue,
  Morphotype,
  StickingPointAnalysis,
  SafetyCheck,
  EfficiencyCheck
} from '../../../types/biomechanics.types';

import {
  calculateAngle,
  getElbowAngle,
  getTorsoAngle,
  midpoint,
  distance2D,
  isSpineNeutral
} from '../core';

// ============================================
// TIRATA ORIZZONTALE (ROW)
// ============================================

export const ROW_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'LUMBAR_FLEXION',
    severity: 'HIGH',
    description: 'Schiena che si arrotonda durante la tirata',
    correction: 'Riduci il carico. Mantieni il petto alto e core attivo.',
    check: (frame) => frame.spineNeutral === false
  },
  {
    code: 'CERVICAL_EXTENSION',
    severity: 'MEDIUM',
    description: 'Collo iperesteso (guardi troppo in alto)',
    correction: 'Sguardo a 2-3 metri davanti a te, collo neutro con la spine.',
    check: (frame) => (frame.angles.neck || 0) > 30
  },
  {
    code: 'SHOULDER_ELEVATION',
    severity: 'MEDIUM',
    description: 'Spalle che salgono verso le orecchie',
    correction: 'Deprimi le scapole prima di tirare. "Spalle in tasca".',
    check: (frame) => {
      // Semplificato: se le spalle sono troppo alte rispetto alla loro posizione di partenza
      return false; // Richiede tracking più preciso
    }
  }
];

export const ROW_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INCOMPLETE_ROM',
    description: 'ROM incompleto - gomito non supera il torso',
    correction: 'Tira fino a toccare l\'addome/petto basso. Stringi le scapole.',
    check: (frames) => {
      const peakFrame = frames.find(f => f.phase === 'PEAK_CONTRACTION' || f.phase === 'TOP');
      if (!peakFrame) return false;
      return !peakFrame.elbowBehindTorso;
    }
  },
  {
    code: 'ARM_DOMINANT',
    description: 'Movimento dominato dalle braccia, non dalla schiena',
    correction: 'Inizia retraendo le scapole, POI fletti i gomiti. Pensa a "tirare con i gomiti".',
    check: (frames) => {
      // Difficile da rilevare senza EMG, pattern proxy
      return false;
    }
  },
  {
    code: 'MOMENTUM_EXCESSIVE',
    description: 'Troppo slancio dal torso (cheating eccessivo)',
    correction: 'Riduci il carico. Il torso deve restare relativamente fermo.',
    check: (frames) => {
      // Calcola oscillazione del torso
      const torsoAngles = frames.map(f => f.angles.torso || 0);
      if (torsoAngles.length < 5) return false;

      const maxSwing = Math.max(...torsoAngles) - Math.min(...torsoAngles);
      return maxSwing > 25; // Più di 25° di oscillazione
    }
  },
  {
    code: 'ELBOW_FLARE',
    description: 'Gomiti troppo larghi (più deltoide, meno dorsale)',
    correction: 'Gomiti a 30-45° dal torso per enfatizzare i dorsali.',
    check: (frames) => {
      return frames.some(f => (f.angles.elbowFlare || 0) > 60);
    }
  }
];

// ============================================
// TIRATA VERTICALE (PULL-UP / LAT PULLDOWN)
// ============================================

export const PULLUP_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'BEHIND_NECK',
    severity: 'HIGH',
    description: 'Tirata dietro il collo - alto rischio spalla',
    correction: 'Tira sempre davanti, al petto. Dietro il collo stressa la cuffia dei rotatori.',
    check: (frame) => {
      // Rileva se la barra/mani sono dietro la testa
      return false; // Richiede tracking specifico
    }
  },
  {
    code: 'SHOULDER_INTERNAL_ROTATION',
    severity: 'MEDIUM',
    description: 'Spalle ruotate internamente (chiuse in avanti)',
    correction: 'Apri il petto, porta le spalle indietro prima di tirare.',
    check: (frame) => {
      return false; // Richiede tracking 3D
    }
  }
];

export const PULLUP_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'NO_SCAPULAR_DEPRESSION',
    description: 'Scapole che non si deprimono (restano alte)',
    correction: 'Inizia il movimento abbassando le scapole, POI tira con le braccia.',
    check: (frames) => {
      // Difficile senza tracking scapolare preciso
      return false;
    }
  },
  {
    code: 'INCOMPLETE_ROM_TOP',
    description: 'Mento non supera la barra / petto non alla barra',
    correction: 'Tira fino a portare il petto alla barra, non solo il mento.',
    check: (frames) => {
      const topFrame = frames.find(f => f.phase === 'TOP');
      if (!topFrame) return false;
      return topFrame.chinAboveBar === false;
    }
  },
  {
    code: 'INCOMPLETE_ROM_BOTTOM',
    description: 'Braccia non completamente estese tra le rep',
    correction: 'Scendi fino a braccia tese per massimo stretch dei dorsali.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      if (!bottomFrame) return false;
      return (bottomFrame.angles.elbow || 0) < 170;
    }
  },
  {
    code: 'BICEP_DOMINANT',
    description: 'Movimento dominato dai bicipiti, dorsali sotto-attivati',
    correction: 'Pensa a "tirare con i gomiti", non con le mani.',
    check: (frames) => {
      // Pattern proxy: se i gomiti restano troppo avanti
      return false;
    }
  },
  {
    code: 'KIPPING_EXCESSIVE',
    severity: 'MEDIUM',
    description: 'Kipping eccessivo (oscillazione anche)',
    correction: 'Per ipertrofia, controlla la discesa. Kipping solo per performance/CrossFit.',
    check: (frames) => {
      // Calcola oscillazione delle anche
      const hipPositions = frames.map(f => f.barPath?.y || 0);
      if (hipPositions.length < 5) return false;
      const amplitude = Math.max(...hipPositions) - Math.min(...hipPositions);
      return amplitude > 0.15; // 15% della frame height
    }
  }
];

// ============================================
// ANALISI FRAME ROW
// ============================================

export function analyzeRowFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  morphotype?: Morphotype
): FrameAnalysis {
  const elbowAngle = getElbowAngle(landmarks, 'left');
  const torsoAngle = getTorsoAngle(landmarks);
  const spineNeutral = isSpineNeutral(landmarks);

  // Verifica se il gomito è dietro il torso (ROM completo)
  const shoulder = landmarks.left_shoulder;
  const elbow = landmarks.left_elbow;
  const hip = landmarks.left_hip;

  const elbowBehindTorso = elbow.x < shoulder.x && elbow.x < hip.x;

  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      elbow: elbowAngle,
      torso: torsoAngle
    },
    spineNeutral,
    elbowBehindTorso,
    issues
  };

  for (const check of ROW_SAFETY_CHECKS) {
    if (check.check(frameAnalysis, morphotype)) {
      issues.push({
        type: 'SAFETY',
        code: check.code,
        severity: check.severity,
        timestamp,
        frameNumber,
        description: check.description,
        correction: check.correction
      });
    }
  }

  return frameAnalysis;
}

// ============================================
// ANALISI FRAME PULL-UP
// ============================================

export function analyzePullUpFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  morphotype?: Morphotype
): FrameAnalysis {
  const elbowAngle = getElbowAngle(landmarks, 'left');

  // Verifica chin above bar (proxy: posizione y della testa vs polsi)
  const nose = landmarks.nose;
  const wristMid = midpoint(landmarks.left_wrist, landmarks.right_wrist);
  const chinAboveBar = nose.y < wristMid.y;

  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      elbow: elbowAngle
    },
    chinAboveBar,
    issues
  };

  for (const check of PULLUP_SAFETY_CHECKS) {
    if (check.check(frameAnalysis, morphotype)) {
      issues.push({
        type: 'SAFETY',
        code: check.code,
        severity: check.severity,
        timestamp,
        frameNumber,
        description: check.description,
        correction: check.correction
      });
    }
  }

  return frameAnalysis;
}

// ============================================
// STICKING POINT ANALYSIS
// ============================================

export function analyzeRowStickingPoint(frames: FrameAnalysis[]): StickingPointAnalysis {
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length < 3) {
    return { detected: false };
  }

  let minVelocityFrame: FrameAnalysis | null = null;
  let minVelocity = Infinity;

  for (const frame of concentricFrames) {
    if (frame.velocity !== undefined && frame.velocity < minVelocity && frame.velocity > 0) {
      minVelocity = frame.velocity;
      minVelocityFrame = frame;
    }
  }

  if (!minVelocityFrame) {
    return { detected: false };
  }

  const elbowAngle = minVelocityFrame.angles.elbow || 180;

  // Sticking mid-range
  if (elbowAngle > 100 && elbowAngle < 150) {
    return {
      detected: true,
      position: 'MID_RANGE',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Romboidi deboli', 'Trapezio medio carente'],
        technical: ['Mancata attivazione scapolare', 'Tirare con le braccia']
      },
      recommendations: {
        accessories: ['Face pull', 'Prone Y raise', 'Scapular row (senza flessione gomito)'],
        cues: ['Spremi un limone tra le scapole', 'Tira con i gomiti, non con le mani']
      }
    };
  }

  // Sticking in peak contraction
  if (elbowAngle <= 100) {
    return {
      detected: true,
      position: 'LOCKOUT',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Deficit picco contrazione dorsale'],
        technical: ['ROM abbreviato abitualmente']
      },
      recommendations: {
        accessories: ['Pause row (2s al petto)', 'Chest-supported row', 'Seal row'],
        cues: ['Tocca la pancia con la barra', 'Pausa di 1s in cima', 'Squeeze scapole']
      }
    };
  }

  return { detected: false };
}

export function analyzePullUpStickingPoint(frames: FrameAnalysis[]): StickingPointAnalysis {
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length < 3) {
    return { detected: false };
  }

  let minVelocityFrame: FrameAnalysis | null = null;
  let minVelocity = Infinity;

  for (const frame of concentricFrames) {
    if (frame.velocity !== undefined && frame.velocity < minVelocity && frame.velocity > 0) {
      minVelocity = frame.velocity;
      minVelocityFrame = frame;
    }
  }

  if (!minVelocityFrame) {
    return { detected: false };
  }

  const elbowAngle = minVelocityFrame.angles.elbow || 180;

  // Sticking nella parte bassa (braccia quasi estese)
  if (elbowAngle > 140) {
    return {
      detected: true,
      position: 'BOTTOM',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Dorsali deboli in allungamento', 'Gran rotondo carente'],
        technical: ['Mancata depressione scapolare']
      },
      recommendations: {
        accessories: ['Straight arm pulldown', 'Scapular pull-up', 'Dead hang attivo'],
        cues: ['Parti sempre dalle scapole', 'Deprimi le scapole prima di tirare']
      }
    };
  }

  // Sticking in cima
  if (elbowAngle < 100) {
    return {
      detected: true,
      position: 'LOCKOUT',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Trapezio basso debole', 'Bicipiti limitanti'],
        technical: ['Perdita di tensione scapolare']
      },
      recommendations: {
        accessories: ['Chin-up isometriche in cima', 'Row inverso alto', 'Flexed arm hang'],
        cues: ['Porta il petto alla barra, non il mento', 'Gomiti verso i fianchi']
      }
    };
  }

  return { detected: false };
}

// ============================================
// PUNTI DI FORZA
// ============================================

export function identifyPullStrengths(frames: FrameAnalysis[], exerciseType: 'row' | 'pullup'): string[] {
  const strengths: string[] = [];

  if (exerciseType === 'row') {
    // ROM completo row
    const peakFrame = frames.find(f => f.phase === 'PEAK_CONTRACTION' || f.phase === 'TOP');
    if (peakFrame && peakFrame.elbowBehindTorso) {
      strengths.push('ROM completo - gomito oltre il torso');
    }

    // Spine neutrale
    const spineIssues = frames.filter(f => f.spineNeutral === false);
    if (spineIssues.length === 0) {
      strengths.push('Spine neutrale mantenuta');
    }

    // Torso stabile
    const torsoAngles = frames.map(f => f.angles.torso || 0);
    const torsoSwing = Math.max(...torsoAngles) - Math.min(...torsoAngles);
    if (torsoSwing < 15) {
      strengths.push('Ottima stabilità del torso');
    }
  }

  if (exerciseType === 'pullup') {
    // ROM completo pull-up
    const topFrame = frames.find(f => f.phase === 'TOP');
    if (topFrame && topFrame.chinAboveBar) {
      strengths.push('ROM completo - mento sopra la barra');
    }

    // Estensione completa nel bottom
    const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
    if (bottomFrame && (bottomFrame.angles.elbow || 0) > 170) {
      strengths.push('Estensione completa tra le rep');
    }
  }

  return strengths;
}

// ============================================
// RACCOMANDAZIONI
// ============================================

export function generatePullRecommendations(
  issues: Issue[],
  exerciseType: 'row' | 'pullup',
  morphotype?: Morphotype
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  for (const issue of issues) {
    switch (issue.code) {
      case 'LUMBAR_FLEXION':
        immediate.push('Riduci il carico, petto alto');
        accessories.push('Bird dog', 'Plank');
        break;

      case 'INCOMPLETE_ROM':
      case 'INCOMPLETE_ROM_TOP':
        immediate.push('Tira fino in fondo, pausa in contrazione');
        accessories.push('Pause row/pull-up', 'Isometriche in peak contraction');
        break;

      case 'MOMENTUM_EXCESSIVE':
      case 'KIPPING_EXCESSIVE':
        immediate.push('Rallenta, controlla ogni rep');
        immediate.push('Se vuoi kipping, fai un set separato');
        break;

      case 'ARM_DOMINANT':
      case 'BICEP_DOMINANT':
        immediate.push('Inizia dalle scapole, poi le braccia');
        immediate.push('Pensa a tirare con i gomiti');
        accessories.push('Straight arm pulldown', 'Scapular pulls');
        break;

      case 'NO_SCAPULAR_DEPRESSION':
        immediate.push('Parti sempre deprimendo le scapole');
        accessories.push('Scapular pull-up', 'Dead hang attivo');
        break;
    }
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 4),
    accessories: [...new Set(accessories)].slice(0, 4),
    mobility: [...new Set(mobility)].slice(0, 2)
  };
}

// ============================================
// FULL ANALYSIS
// ============================================

export function analyzeFullRow(
  allFrames: FrameAnalysis[],
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  const allIssues: Issue[] = [];

  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  for (const check of ROW_EFFICIENCY_CHECKS) {
    if (check.check(allFrames, morphotype)) {
      allIssues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: 'MEDIUM',
        description: check.description,
        correction: check.correction
      });
    }
  }

  const uniqueIssues = removeDuplicateIssues(allIssues);
  const sortedIssues = sortIssuesByPriority(uniqueIssues);
  // Max 2 correzioni alla volta - parti dal basso (sicurezza prima)
  const topIssues = sortedIssues.slice(0, 2);

  const strengths = identifyPullStrengths(allFrames, 'row');
  const stickingPoint = analyzeRowStickingPoint(allFrames);
  const recommendations = generatePullRecommendations(topIssues, 'row', morphotype);

  if (stickingPoint.detected && stickingPoint.recommendations) {
    recommendations.accessories.push(...stickingPoint.recommendations.accessories);
    recommendations.immediate.push(...stickingPoint.recommendations.cues);
  }

  const overallScore = calculatePullScore(topIssues, strengths);

  return {
    issues: topIssues,
    strengths,
    stickingPoint,
    recommendations: {
      immediate: [...new Set(recommendations.immediate)].slice(0, 3),
      accessories: [...new Set(recommendations.accessories)].slice(0, 4),
      mobility: [...new Set(recommendations.mobility)].slice(0, 2)
    },
    overallScore
  };
}

export function analyzeFullPullUp(
  allFrames: FrameAnalysis[],
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  const allIssues: Issue[] = [];

  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  for (const check of PULLUP_EFFICIENCY_CHECKS) {
    if (check.check(allFrames, morphotype)) {
      allIssues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: 'MEDIUM',
        description: check.description,
        correction: check.correction
      });
    }
  }

  const uniqueIssues = removeDuplicateIssues(allIssues);
  const sortedIssues = sortIssuesByPriority(uniqueIssues);
  // Max 2 correzioni alla volta - parti dal basso (sicurezza prima)
  const topIssues = sortedIssues.slice(0, 2);

  const strengths = identifyPullStrengths(allFrames, 'pullup');
  const stickingPoint = analyzePullUpStickingPoint(allFrames);
  const recommendations = generatePullRecommendations(topIssues, 'pullup', morphotype);

  if (stickingPoint.detected && stickingPoint.recommendations) {
    recommendations.accessories.push(...stickingPoint.recommendations.accessories);
    recommendations.immediate.push(...stickingPoint.recommendations.cues);
  }

  const overallScore = calculatePullScore(topIssues, strengths);

  return {
    issues: topIssues,
    strengths,
    stickingPoint,
    recommendations: {
      immediate: [...new Set(recommendations.immediate)].slice(0, 3),
      accessories: [...new Set(recommendations.accessories)].slice(0, 4),
      mobility: [...new Set(recommendations.mobility)].slice(0, 2)
    },
    overallScore
  };
}

// ============================================
// UTILITY
// ============================================

function removeDuplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter(issue => {
    if (seen.has(issue.code)) return false;
    seen.add(issue.code);
    return true;
  });
}

function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const priorityOrder = { SAFETY: 0, EFFICIENCY: 1, OPTIMIZATION: 2 };
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  return issues.sort((a, b) => {
    const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function calculatePullScore(issues: Issue[], strengths: string[]): number {
  let score = 10;

  for (const issue of issues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else {
      score -= issue.severity === 'HIGH' ? 1.5 : issue.severity === 'MEDIUM' ? 1 : 0.5;
    }
  }

  score += Math.min(strengths.length * 0.3, 1);

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
