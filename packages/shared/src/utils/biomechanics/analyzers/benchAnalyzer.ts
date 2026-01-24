/**
 * Bench Press Analyzer
 * Analisi biomeccanica per Panca Piana
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
  midpoint,
  distance2D,
  angleFromHorizontal
} from '../core';

// ============================================
// RANGE DI SICUREZZA PANCA
// NOTA DCSS: Questi sono range indicativi, non assoluti.
// La tecnica ottimale varia in base a proporzioni individuali,
// mobilità articolare e struttura scheletrica.
// ============================================

export const BENCH_SAFE_RANGES = {
  elbow: { min: 70, max: 180 },              // ROM completo (varia con lunghezza braccia)
  shoulderAbduction: { min: 45, max: 75 },   // Range indicativo - dipende da struttura spalle
  wrist: { neutral: true },                   // Preferibile neutro, ma varia con presa
  arch: { present: true }                     // Arco lombare per leg drive (entità varia)
};

// ============================================
// SAFETY CHECKS
// ============================================

export const BENCH_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'SHOULDER_IMPINGEMENT_RISK',
    severity: 'HIGH',
    description: 'Gomiti molto larghi (>75° dal torso) - potenziale stress spalla',
    correction: 'Potresti provare a ridurre l\'angolo dei gomiti (45-75° funziona per molti). Sperimenta cosa funziona per la tua struttura.',
    check: (frame) => {
      const abduction = frame.angles.shoulderAbduction || 0;
      return abduction > 80;
    }
  },
  {
    code: 'ELBOW_FLARE_90',
    severity: 'HIGH',
    description: 'Gomiti a 90° dal corpo - spesso aumenta stress sulla spalla',
    correction: 'La forma a freccia (↑) tende a essere più confortevole per molti. Prova gomiti a 45-60° e valuta le sensazioni.',
    check: (frame) => {
      const abduction = frame.angles.shoulderAbduction || 0;
      return abduction > 85 && abduction < 95;
    }
  },
  {
    code: 'WRIST_FLEXION',
    severity: 'MEDIUM',
    description: 'Polsi flessi all\'indietro - stress articolare',
    correction: 'Bilanciere sulla base del palmo, polso neutro. Stack verticale: polso-gomito-spalla.',
    check: (frame) => {
      const wrist = frame.angles.wrist || 0;
      return wrist < -15;
    }
  },
  {
    code: 'FEET_UNSTABLE',
    severity: 'LOW',
    description: 'Piedi non stabili - perdita di leg drive',
    correction: 'Piedi piantati a terra, spingi come se volessi scivolare verso la testa.',
    check: (frame) => {
      // Questo check richiederebbe tracking dei piedi
      return false;
    }
  },
  {
    code: 'SHOULDER_PROTRACTION',
    severity: 'MEDIUM',
    description: 'Spalle protratte (in avanti) - perdita di stabilità',
    correction: 'Scapole retratte e depresse. "Metti le scapole nelle tasche posteriori".',
    check: (frame) => {
      // Check basato sulla posizione delle spalle
      // Implementazione semplificata
      return false;
    }
  },
  {
    code: 'BUTT_OFF_BENCH',
    severity: 'MEDIUM',
    description: 'Glutei che si alzano dalla panca',
    correction: 'Mantieni i glutei sulla panca. Arco lombare sì, ma glutei giù.',
    check: (frame) => {
      // Richiederebbe tracking della posizione dei glutei
      return false;
    }
  }
];

// ============================================
// EFFICIENCY CHECKS
// ============================================

export const BENCH_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'BAR_PATH_TOO_STRAIGHT',
    description: 'Traiettoria molto verticale - potrebbe essere meno efficiente',
    correction: 'Per molti, una leggera curva (J rovesciata) risulta più efficiente: giù verso il petto basso, su verso lockout sopra le spalle.',
    check: (frames) => {
      const barPaths = frames.filter(f => f.barPath).map(f => f.barPath!);
      if (barPaths.length < 5) return false;

      // Verifica se la barra si muove abbastanza in orizzontale
      const xPositions = barPaths.map(bp => bp.x);
      const xRange = Math.max(...xPositions) - Math.min(...xPositions);

      // Troppo poca variazione orizzontale = path troppo dritto
      return xRange < 0.03;
    }
  },
  {
    code: 'NO_LEG_DRIVE',
    description: 'Mancanza di leg drive - potenza persa',
    correction: 'Piedi piantati, spingi il pavimento mentre premi. La forza parte dalle gambe.',
    check: (frames) => {
      // Difficile da rilevare senza sensori di forza
      // Potremmo cercare oscillazioni delle anche
      return false;
    }
  },
  {
    code: 'TOUCH_TOO_HIGH',
    description: 'Barra che tocca troppo in alto (sul petto alto o collo)',
    correction: 'La barra dovrebbe toccare sul petto basso/sterno, sotto i capezzoli.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      if (!bottomFrame || !bottomFrame.barPath) return false;

      // Se la barra è troppo alta nel bottom
      // Y basso = alto nell'immagine
      return bottomFrame.barPath.y < 0.3;
    }
  },
  {
    code: 'INCOMPLETE_ROM',
    description: 'ROM incompleto - barra non tocca il petto',
    correction: 'Scendi fino a toccare il petto (pausa minima). ROM completo = guadagni completi.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      if (!bottomFrame) return false;

      const elbow = bottomFrame.angles.elbow || 180;
      return elbow > 100; // Non scende abbastanza
    }
  },
  {
    code: 'UNEVEN_PRESS',
    description: 'Pressione asimmetrica - un braccio spinge prima',
    correction: 'Controlla allo specchio/video. Lavora con dumbbell per correggere.',
    check: (frames) => {
      // Richiederebbe confronto preciso tra lato dx e sx
      return false;
    }
  },
  {
    code: 'NO_SCAPULAR_RETRACTION',
    description: 'Scapole non retratte - base instabile',
    correction: 'Prima di staccare la barra: scapole insieme e giù. Mantieni per tutto il set.',
    check: (frames) => {
      // Difficile da rilevare con precisione
      return false;
    }
  }
];

// ============================================
// ANALISI FRAME PANCA
// ============================================

export function analyzeBenchFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  morphotype?: Morphotype
): FrameAnalysis {
  // Angolo gomito
  const elbowAngleLeft = getElbowAngle(landmarks, 'left');
  const elbowAngleRight = getElbowAngle(landmarks, 'right');
  const elbowAngle = (elbowAngleLeft + elbowAngleRight) / 2;

  // Abduzione spalla (angolo tra torso e braccio superiore)
  // Semplificato: angolo tra linea spalla-spalla e linea spalla-gomito
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const shoulderAbductionLeft = calculateShoulderAbduction(landmarks, 'left');
  const shoulderAbductionRight = calculateShoulderAbduction(landmarks, 'right');
  const shoulderAbduction = (shoulderAbductionLeft + shoulderAbductionRight) / 2;

  // Bar path (posizione dei polsi come proxy)
  const wristMid = midpoint(landmarks.left_wrist, landmarks.right_wrist);

  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      elbow: elbowAngle,
      shoulderAbduction
    },
    barPath: {
      x: wristMid.x,
      y: wristMid.y,
      deviationFromVertical: 0
    },
    issues
  };

  // Safety checks
  for (const check of BENCH_SAFETY_CHECKS) {
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

export function analyzeBenchStickingPoint(frames: FrameAnalysis[]): StickingPointAnalysis {
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

  // Sticking off the chest (gomito molto flesso)
  if (elbowAngle < 100) {
    return {
      detected: true,
      position: 'BOTTOM',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Pettorali deboli in allungamento', 'Deltoidi anteriori carenti'],
        technical: ['Mancanza di leg drive', 'Touch point da verificare', 'Perdita di tensione']
      },
      recommendations: {
        accessories: ['Spoto press (pausa 2-3")', 'Dumbbell press', 'Floor press'],
        cues: ['Leg drive appena stacchi dal petto', 'Pensa a "piegare la barra"', 'Esplosivo dal basso']
      }
    };
  }

  // Sticking mid-range
  if (elbowAngle >= 100 && elbowAngle < 150) {
    return {
      detected: true,
      position: 'MID_RANGE',
      angleAtSticking: elbowAngle,
      diagnosis: {
        muscular: ['Tricipiti deboli', 'Deltoidi anteriori carenti'],
        technical: ['Gomiti che flare out', 'Bar path da ottimizzare']
      },
      recommendations: {
        accessories: ['Close grip bench', 'Pin press (altezza sticking)', 'JM press', 'Dip'],
        cues: ['Tuck i gomiti leggermente', 'Spingi verso il lockout, non verso l\'alto']
      }
    };
  }

  // Sticking in lockout
  return {
    detected: true,
    position: 'LOCKOUT',
    angleAtSticking: elbowAngle,
    diagnosis: {
      muscular: ['Tricipiti deboli in estensione'],
      technical: ['Perdita di traiettoria', 'Gomiti che driftano']
    },
    recommendations: {
      accessories: ['Board press', 'Tricep pushdown', 'Skull crusher', 'Pin press alto'],
      cues: ['Estendi completamente', 'Spingi le spalle nel pad']
    }
  };
}

// ============================================
// PUNTI DI FORZA
// ============================================

export function identifyBenchStrengths(frames: FrameAnalysis[]): string[] {
  const strengths: string[] = [];

  // Verifica ROM completo
  const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
  if (bottomFrame && (bottomFrame.angles.elbow || 180) < 95) {
    strengths.push('ROM completo - barra al petto');
  }

  // Verifica posizione gomiti
  const elbowIssues = frames.filter(f => {
    const abduction = f.angles.shoulderAbduction || 0;
    return abduction > 80 || abduction < 40;
  });
  if (elbowIssues.length === 0) {
    strengths.push('Ottima posizione dei gomiti (45-75°)');
  }

  // Verifica lockout
  const lockoutFrame = frames.find(f => f.phase === 'LOCKOUT');
  if (lockoutFrame && (lockoutFrame.angles.elbow || 0) > 170) {
    strengths.push('Lockout completo');
  }

  // Verifica controllo eccentrico
  const eccentricFrames = frames.filter(f => f.phase === 'ECCENTRIC');
  if (eccentricFrames.length > 3) {
    strengths.push('Buon controllo nella discesa');
  }

  return strengths;
}

// ============================================
// RACCOMANDAZIONI
// ============================================

export function generateBenchRecommendations(
  issues: Issue[],
  morphotype?: Morphotype
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  for (const issue of issues) {
    switch (issue.code) {
      case 'SHOULDER_IMPINGEMENT_RISK':
      case 'ELBOW_FLARE_90':
        immediate.push('Tuck i gomiti: pensa a formare una freccia (↑), non una T');
        immediate.push('Angolo gomiti 45-60° rispetto al torso');
        mobility.push('Shoulder dislocates con banda', 'Sleeper stretch');
        break;

      case 'WRIST_FLEXION':
        immediate.push('Barra sulla base del palmo, non sulle dita');
        immediate.push('Polso in linea con l\'avambraccio (stack verticale)');
        accessories.push('Lavoro di grip e avambracci');
        break;

      case 'BAR_PATH_TOO_STRAIGHT':
        immediate.push('Tocca il petto basso, spingi verso il lockout sopra le spalle');
        immediate.push('Il path è una J rovesciata');
        break;

      case 'INCOMPLETE_ROM':
        immediate.push('Scendi fino a toccare il petto, pausa breve, poi spingi');
        accessories.push('Spoto press (pausa lunga sul petto)');
        break;

      case 'NO_SCAPULAR_RETRACTION':
        immediate.push('Setup: scapole insieme e in basso prima di staccare');
        immediate.push('"Metti le scapole nelle tasche posteriori"');
        accessories.push('Face pull', 'Band pull apart');
        break;
    }
  }

  // Raccomandazioni per morfotipo
  if (morphotype?.type === 'LONG_ARMS') {
    immediate.push('Con braccia lunghe: ROM maggiore è normale, non abbreviarlo');
    accessories.push('Floor press per lavorare sulla porzione centrale');
  }

  if (morphotype?.benchImplications?.gripWidth === 'wide') {
    immediate.push('Considera una presa più larga per ridurre il ROM');
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 4),
    accessories: [...new Set(accessories)].slice(0, 4),
    mobility: [...new Set(mobility)].slice(0, 2)
  };
}

// ============================================
// FULL BENCH ANALYSIS
// ============================================

export function analyzeFullBench(
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

  // Efficiency checks
  for (const check of BENCH_EFFICIENCY_CHECKS) {
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

  const strengths = identifyBenchStrengths(allFrames);
  const stickingPoint = analyzeBenchStickingPoint(allFrames);
  const recommendations = generateBenchRecommendations(topIssues, morphotype);

  if (stickingPoint.detected && stickingPoint.recommendations) {
    recommendations.accessories.push(...stickingPoint.recommendations.accessories);
    recommendations.immediate.push(...stickingPoint.recommendations.cues);
  }

  const overallScore = calculateBenchScore(topIssues, strengths);

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

function calculateShoulderAbduction(landmarks: PoseLandmarks, side: 'left' | 'right'): number {
  // Calcola l'angolo tra il torso e il braccio superiore nel piano frontale
  const shoulder = side === 'left' ? landmarks.left_shoulder : landmarks.right_shoulder;
  const elbow = side === 'left' ? landmarks.left_elbow : landmarks.right_elbow;
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;

  // Vettore torso (da anca a spalla)
  const torsoVec = { x: shoulder.x - hip.x, y: shoulder.y - hip.y };

  // Vettore braccio superiore (da spalla a gomito)
  const armVec = { x: elbow.x - shoulder.x, y: elbow.y - shoulder.y };

  // Angolo tra i due vettori
  const dot = torsoVec.x * armVec.x + torsoVec.y * armVec.y;
  const cross = torsoVec.x * armVec.y - torsoVec.y * armVec.x;

  let angle = Math.atan2(Math.abs(cross), dot) * (180 / Math.PI);

  // L'abduzione è l'angolo dal torso, quindi 90° - angle
  return 90 - Math.abs(angle - 90);
}

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

function calculateBenchScore(issues: Issue[], strengths: string[]): number {
  let score = 10;

  for (const issue of issues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else if (issue.type === 'EFFICIENCY') {
      score -= issue.severity === 'HIGH' ? 1.5 : issue.severity === 'MEDIUM' ? 1 : 0.5;
    } else {
      score -= 0.5;
    }
  }

  score += Math.min(strengths.length * 0.3, 1);

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
