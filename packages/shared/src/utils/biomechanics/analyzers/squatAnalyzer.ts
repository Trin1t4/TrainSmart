/**
 * Squat Analyzer
 * Analisi biomeccanica per Back Squat e Front Squat
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
  getKneeAngle,
  getHipAngle,
  getTorsoAngle,
  getKneeValgus,
  isSpineNeutral,
  areHeelsDown,
  midpoint,
  distance2D,
  angleFromVertical,
  // Nuove funzioni per vista 45° latero-posteriore
  detectDepthAsymmetry,
  detectKneeAsymmetry,
  detectTorsoRotation,
  detectLateralWeightShift,
  detectScapularPosition,
  analyzeFullAsymmetry,
  type BilateralAsymmetryResult,
  type ScapularPositionResult,
  type FullAsymmetryAnalysis
} from '../core';

// ============================================
// RANGE DI SICUREZZA SQUAT
// NOTA DCSS: Questi range sono INDICATIVI, non assoluti.
// La tecnica ottimale dipende dalle proporzioni individuali:
// - Femori lunghi → torso più inclinato è NORMALE
// - Caviglie rigide → ginocchia avanzano meno
// - Struttura anca → profondità varia
// ============================================

export const SQUAT_SAFE_RANGES = {
  knee: { min: 70, max: 170 },          // Range indicativo - varia con struttura
  hip: { min: 40, max: 170 },           // Varia significativamente con proporzioni
  ankle: { min: 25, max: 45 },          // Dipende da mobilità individuale
  torso: { min: 20, max: 75 },          // ESTESO: femori lunghi richiedono più inclinazione
  kneeValgus: { min: -10, max: 10 }     // Range ampliato - leggero valgus dinamico può essere normale
};

// ============================================
// SAFETY CHECKS
// ============================================

export const SQUAT_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'SPINE_FLEXION',
    severity: 'HIGH',
    description: 'Perdita di neutralità lombare (butt wink)',
    correction: 'Fermati prima del punto dove perdi la curva. Lavora su mobilità anca e caviglia.',
    check: (frame) => frame.spineNeutral === false
  },
  {
    code: 'KNEE_VALGUS',
    severity: 'HIGH',
    description: 'Ginocchia che tendono verso l\'interno - da monitorare',
    correction: 'Potresti provare a spingere le ginocchia fuori, seguendo la direzione delle punte. Un leggero movimento dinamico può essere normale per alcune strutture.',
    check: (frame) => {
      const valgus = frame.angles.kneeValgus || 0;
      return Math.abs(valgus) > 12; // Soglia aumentata per tollerare variazioni individuali
    }
  },
  {
    code: 'HEEL_RISE',
    severity: 'MEDIUM',
    description: 'Talloni che si alzano dal pavimento',
    correction: 'Migliora mobilità caviglia o usa scarpe con tacco. Peso sui talloni/mesopiede.',
    check: (frame) => frame.heelContact === false
  },
  {
    code: 'KNEE_CAVE_SEVERE',
    severity: 'HIGH',
    description: 'Cedimento severo delle ginocchia nella risalita',
    correction: 'Riduci il carico. Attiva i glutei spingendo le ginocchia fuori prima di iniziare la risalita.',
    check: (frame) => {
      const valgus = frame.angles.kneeValgus || 0;
      return frame.phase === 'CONCENTRIC' && Math.abs(valgus) > 15;
    }
  },
  {
    code: 'EXCESSIVE_FORWARD_LEAN',
    severity: 'MEDIUM',
    description: 'Inclinazione del torso marcata - valutare in base alle proporzioni',
    correction: 'Con femori lunghi, un\'inclinazione maggiore è biomeccanicamente normale. Valuta se mantieni il controllo e la colonna neutra.',
    check: (frame, morphotype) => {
      const torso = frame.angles.torso || 0;
      // Soglie più permissive che tengono conto delle proporzioni
      const threshold = morphotype?.type === 'LONG_FEMUR' ? 75 : 65;
      return torso > threshold;
    }
  }
];

// ============================================
// EFFICIENCY CHECKS
// ============================================

export const SQUAT_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'BAR_PATH_FORWARD',
    description: 'Bilanciere si sposta in avanti durante il movimento',
    correction: 'Potresti sperimentare con la distribuzione del peso sui talloni/mesopiede. Per molti, il bilanciere sopra il mesopiede risulta più stabile.',
    check: (frames, morphotype) => {
      // Verifica se il bar path devia troppo in avanti
      const deviations = frames
        .filter(f => f.barPath)
        .map(f => f.barPath!.forwardDeviation || 0);

      if (deviations.length === 0) return false;

      const maxDeviation = Math.max(...deviations);
      const threshold = morphotype?.type === 'LONG_FEMUR' ? 8 : 5;
      return maxDeviation > threshold;
    }
  },
  {
    code: 'HIPS_RISE_FIRST',
    description: 'Le anche salgono prima delle spalle (good morning squat)',
    correction: 'Potresti provare a guidare con il petto, pensando a "spingere la schiena contro il bilanciere". Valuta se funziona per la tua struttura.',
    check: (frames) => {
      // Cerca pattern dove l'angolo del torso aumenta durante la fase concentrica
      const concentricFrames = frames.filter(f => f.phase === 'CONCENTRIC');
      if (concentricFrames.length < 3) return false;

      // Se il torso si inclina di più mentre si sale = hips rise first
      const firstTorso = concentricFrames[0].angles.torso || 0;
      const midTorso = concentricFrames[Math.floor(concentricFrames.length / 2)].angles.torso || 0;

      return midTorso > firstTorso + 10; // Il torso si inclina >10° in più
    }
  },
  {
    code: 'INSUFFICIENT_DEPTH',
    description: 'Profondità insufficiente - anca non sotto il ginocchio',
    correction: 'Scendi fino a quando la piega dell\'anca è sotto il ginocchio. Lavora su mobilità se necessario.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      if (!bottomFrame) return false;

      const hipAngle = bottomFrame.angles.hip || 180;
      return hipAngle > 100; // Non abbastanza profondo
    }
  },
  {
    code: 'ASYMMETRIC_STANCE',
    description: 'Posizione asimmetrica - un lato lavora più dell\'altro',
    correction: 'Verifica che i piedi siano equidistanti. Possibile squilibrio muscolare da correggere.',
    check: (frames) => {
      // Verifica asimmetria confrontando angoli dx e sx
      // Implementazione semplificata
      return false; // TODO: implementare confronto bilaterale
    }
  },
  {
    code: 'NO_PAUSE_BOTTOM',
    description: 'Rimbalzo eccessivo nel bottom - perdita di controllo',
    correction: 'Controlla la discesa, breve pausa nel bottom per mantenere tensione.',
    check: (frames) => {
      // Cerca velocità eccessiva nell'inversione
      const bottomFrames = frames.filter(f => f.phase === 'BOTTOM');
      if (bottomFrames.length === 0) return false;

      // Se la velocità nel bottom è alta = rimbalzo
      const avgVelocity = bottomFrames.reduce((sum, f) => sum + (f.velocity || 0), 0) / bottomFrames.length;
      return avgVelocity > 0.5; // Threshold arbitrario, da calibrare
    }
  }
];

// ============================================
// CONTROLLI VISTA 45° LATERO-POSTERIORE
// Errori visibili solo dalla ripresa a 45°
// ============================================

export interface LateroPosteriorCheck {
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  correction: string;
  checkAsymmetry: (asymmetry: FullAsymmetryAnalysis) => boolean;
}

export const SQUAT_LATERO_POSTERIOR_CHECKS: LateroPosteriorCheck[] = [
  {
    code: 'DEPTH_ASYMMETRY',
    severity: 'MEDIUM',
    description: 'Un lato scende meno in profondità dell\'altro',
    correction: 'Lavoro unilaterale: Bulgarian split squat, pistol squat assistito. Verifica mobilità anca.',
    checkAsymmetry: (asymmetry) => asymmetry.depth.hasAsymmetry && asymmetry.depth.severity !== 'LOW'
  },
  {
    code: 'KNEE_ANGLE_ASYMMETRY',
    severity: 'MEDIUM',
    description: 'Differenza significativa nell\'angolo delle ginocchia',
    correction: 'Possibile squilibrio di forza quadricipiti. Single leg press, step-up unilaterali.',
    checkAsymmetry: (asymmetry) => asymmetry.knee.hasAsymmetry && asymmetry.knee.severity !== 'LOW'
  },
  {
    code: 'TORSO_ROTATION',
    severity: 'HIGH',
    description: 'Rotazione del tronco durante lo squat',
    correction: 'Core anti-rotazione debole. Pallof press, bird-dog, dead bug. Verifica anche mobilità toracica.',
    checkAsymmetry: (asymmetry) => asymmetry.torsoRotation.hasAsymmetry && asymmetry.torsoRotation.severity !== 'LOW'
  },
  {
    code: 'WEIGHT_SHIFT_LATERAL',
    severity: 'HIGH',
    description: 'Peso spostato su un lato - squilibrio nella distribuzione del carico',
    correction: 'Allenati davanti a uno specchio. Usa feedback tattile (mani sulle anche). Lavoro unilaterale.',
    checkAsymmetry: (asymmetry) => asymmetry.weightShift.hasAsymmetry && asymmetry.weightShift.severity !== 'LOW'
  },
  {
    code: 'SCAPULAR_PROTRACTION',
    severity: 'MEDIUM',
    description: 'Scapole protratte - spalle in avanti, upper back debole',
    correction: 'Retrarre scapole prima di ogni rep. Lavoro su romboidi: face pull, band pull-apart.',
    checkAsymmetry: (asymmetry) => !asymmetry.scapular.isOptimal && asymmetry.scapular.issue === 'PROTRACTED'
  },
  {
    code: 'SHOULDERS_ELEVATED',
    severity: 'LOW',
    description: 'Spalle elevate - tensione nel trapezio superiore',
    correction: 'Rilassa le spalle prima di iniziare. "Spalle lontane dalle orecchie".',
    checkAsymmetry: (asymmetry) => !asymmetry.scapular.isOptimal && asymmetry.scapular.issue === 'ELEVATED'
  },
  {
    code: 'SHOULDER_ASYMMETRY',
    severity: 'MEDIUM',
    description: 'Asimmetria nell\'altezza delle spalle',
    correction: 'Verifica posizione del bilanciere. Possibile squilibrio muscolare da correggere.',
    checkAsymmetry: (asymmetry) => !asymmetry.scapular.isOptimal && asymmetry.scapular.issue === 'ASYMMETRIC'
  }
];

// ============================================
// ANALISI FRAME SQUAT
// ============================================

export function analyzeSquatFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  morphotype?: Morphotype
): FrameAnalysis {
  // Calcola angoli
  const kneeAngleLeft = getKneeAngle(landmarks, 'left');
  const kneeAngleRight = getKneeAngle(landmarks, 'right');
  const kneeAngle = (kneeAngleLeft + kneeAngleRight) / 2;

  const hipAngleLeft = getHipAngle(landmarks, 'left');
  const hipAngleRight = getHipAngle(landmarks, 'right');
  const hipAngle = (hipAngleLeft + hipAngleRight) / 2;

  const torsoAngle = getTorsoAngle(landmarks);

  const kneeValgusLeft = getKneeValgus(landmarks, 'left');
  const kneeValgusRight = getKneeValgus(landmarks, 'right');
  const kneeValgus = (kneeValgusLeft + kneeValgusRight) / 2;

  // Stati
  const spineNeutral = isSpineNeutral(landmarks);
  const heelContact = areHeelsDown(landmarks);

  // Calcola bar path (stima dalla posizione delle spalle)
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);

  // Issues per questo frame
  const issues: Issue[] = [];

  // Check safety
  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      knee: kneeAngle,
      hip: hipAngle,
      torso: torsoAngle,
      kneeValgus
    },
    barPath: {
      x: shoulderMid.x,
      y: shoulderMid.y,
      deviationFromVertical: Math.abs(shoulderMid.x - hipMid.x) * 100 // cm approssimati
    },
    spineNeutral,
    heelContact,
    issues
  };

  // Esegui safety checks
  for (const check of SQUAT_SAFETY_CHECKS) {
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

/**
 * Analizza un singolo frame per asimmetrie (vista 45° latero-posteriore)
 */
export function analyzeSquatFrameAsymmetry(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number
): { asymmetryAnalysis: FullAsymmetryAnalysis; issues: Issue[] } {
  const asymmetryAnalysis = analyzeFullAsymmetry(landmarks);
  const issues: Issue[] = [];

  // Controlla ogni tipo di asimmetria dalla vista 45°
  for (const check of SQUAT_LATERO_POSTERIOR_CHECKS) {
    if (check.checkAsymmetry(asymmetryAnalysis)) {
      issues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: check.severity,
        timestamp,
        frameNumber,
        description: check.description,
        correction: check.correction
      });
    }
  }

  return { asymmetryAnalysis, issues };
}

// ============================================
// STICKING POINT ANALYSIS
// ============================================

export function analyzeSquatStickingPoint(frames: FrameAnalysis[]): StickingPointAnalysis {
  // Trova il frame con velocità minima nella fase concentrica
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length < 3) {
    return { detected: false };
  }

  // Trova il frame più lento
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

  const kneeAngle = minVelocityFrame.angles.knee || 180;

  // Sticking nella buca (knee < 100°)
  if (kneeAngle < 100) {
    return {
      detected: true,
      position: 'BOTTOM',
      angleAtSticking: kneeAngle,
      diagnosis: {
        muscular: ['Quadricipiti deboli in allungamento', 'Glutei non attivati nel bottom'],
        technical: ['Perdita di tensione nel bottom', 'Rimbalzo assente o eccessivo']
      },
      recommendations: {
        accessories: ['Pause squat (3s nel bottom)', 'Pin squat dal bottom', 'Belt squat'],
        cues: ['Mantieni tensione nel bottom', 'Spingi il pavimento via da te', 'Gomiti sotto la barra']
      }
    };
  }

  // Sticking mid-range (100° < knee < 140°)
  if (kneeAngle >= 100 && kneeAngle < 140) {
    return {
      detected: true,
      position: 'MID_RANGE',
      angleAtSticking: kneeAngle,
      diagnosis: {
        muscular: ['Glutei deboli nel mid-range', 'Estensori anca carenti'],
        technical: ['Good morning squat', 'Perdita verticalità barra', 'Ginocchia che cedono']
      },
      recommendations: {
        accessories: ['Hip thrust', 'Good morning', 'Squat con catene/bande', 'Box squat'],
        cues: ['Guida con il petto', 'Stringi i glutei uscendo dalla buca', 'Spingi le ginocchia fuori']
      }
    };
  }

  // Sticking in lockout (knee > 140°)
  return {
    detected: true,
    position: 'LOCKOUT',
    angleAtSticking: kneeAngle,
    diagnosis: {
      muscular: ['Quadricipiti deboli in accorciamento'],
      technical: ['Perdita di velocità nella parte finale']
    },
    recommendations: {
      accessories: ['1.5 rep squat', 'Leg press', 'Leg extension'],
      cues: ['Accelera attraverso il movimento', 'Spingi fino al lockout completo']
    }
  };
}

// ============================================
// PUNTI DI FORZA
// ============================================

export function identifySquatStrengths(frames: FrameAnalysis[]): string[] {
  const strengths: string[] = [];

  // Verifica profondità
  const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
  if (bottomFrame && (bottomFrame.angles.hip || 180) < 90) {
    strengths.push('Ottima profondità raggiunta');
  }

  // Verifica spine neutrale
  const spineIssues = frames.filter(f => f.spineNeutral === false);
  if (spineIssues.length === 0) {
    strengths.push('Spine neutrale mantenuta durante tutto il movimento');
  }

  // Verifica talloni
  const heelIssues = frames.filter(f => f.heelContact === false);
  if (heelIssues.length === 0) {
    strengths.push('Peso ben distribuito sul piede');
  }

  // Verifica valgismo
  const valgusIssues = frames.filter(f => Math.abs(f.angles.kneeValgus || 0) > 8);
  if (valgusIssues.length === 0) {
    strengths.push('Ginocchia stabili e allineate');
  }

  // Verifica controllo eccentrico
  const eccentricFrames = frames.filter(f => f.phase === 'ECCENTRIC');
  if (eccentricFrames.length > 0) {
    const avgVelocity = eccentricFrames.reduce((sum, f) => sum + (f.velocity || 0), 0) / eccentricFrames.length;
    if (avgVelocity < 0.3) {
      strengths.push('Buon controllo nella fase eccentrica');
    }
  }

  return strengths;
}

// ============================================
// RACCOMANDAZIONI IMMEDIATE
// ============================================

export function generateSquatRecommendations(
  issues: Issue[],
  morphotype?: Morphotype
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  // Raccomandazioni basate sugli issues
  for (const issue of issues) {
    switch (issue.code) {
      case 'KNEE_VALGUS':
      case 'KNEE_CAVE_SEVERE':
        immediate.push('Usa una banda elastica sopra le ginocchia per feedback tattile');
        accessories.push('Clamshell 2x15 per lato', 'Lateral band walk 2x20');
        break;

      case 'SPINE_FLEXION':
        immediate.push('Riduci la profondità fino a mantenere la curva lombare');
        mobility.push('90/90 hip stretch', 'Goblet squat hold 3x30s');
        break;

      case 'HEEL_RISE':
        immediate.push('Prova con rialzo sotto i talloni o scarpe da squat');
        mobility.push('Ankle dorsiflexion stretch', 'Calf foam rolling');
        break;

      case 'HIPS_RISE_FIRST':
        immediate.push('Pensa "petto alto" mentre sali');
        accessories.push('Front squat (obbliga posizione verticale)', 'Tempo squat 3-1-1');
        break;

      case 'EXCESSIVE_FORWARD_LEAN':
        immediate.push('Core attivo, respira nel diaframma prima di ogni rep');
        accessories.push('Front squat', 'Goblet squat');
        break;

      // Nuovi controlli vista 45° latero-posteriore
      case 'DEPTH_ASYMMETRY':
        immediate.push('Concentrati su scendere uniformemente su entrambi i lati');
        accessories.push('Bulgarian split squat 3x8 per lato', 'Single leg press');
        mobility.push('Pigeon stretch lato debole');
        break;

      case 'KNEE_ANGLE_ASYMMETRY':
        immediate.push('Spingi le ginocchia fuori in modo simmetrico');
        accessories.push('Single leg extension', 'Step-up 3x10 per lato');
        break;

      case 'TORSO_ROTATION':
        immediate.push('Mantieni il petto rivolto in avanti, non ruotare');
        accessories.push('Pallof press 3x12', 'Dead bug 3x10', 'Bird-dog 3x10');
        mobility.push('Rotazione toracica su foam roller');
        break;

      case 'WEIGHT_SHIFT_LATERAL':
        immediate.push('Allenati davanti a uno specchio per feedback visivo');
        immediate.push('Distribuisci il peso equamente sui due piedi');
        accessories.push('Goblet squat con pausa nel bottom', 'Box squat');
        break;

      case 'SCAPULAR_PROTRACTION':
        immediate.push('Retrai le scapole prima di ogni rep - "petto fuori"');
        accessories.push('Face pull 3x15', 'Band pull-apart 3x20');
        break;

      case 'SHOULDERS_ELEVATED':
        immediate.push('Abbassa le spalle - "spalle lontane dalle orecchie"');
        accessories.push('Shrug eccentrico', 'Upper trap stretch');
        break;

      case 'SHOULDER_ASYMMETRY':
        immediate.push('Verifica che il bilanciere sia centrato sulla schiena');
        accessories.push('Single arm row', 'Face pull unilaterale');
        break;
    }
  }

  // Raccomandazioni basate sul morfotipo
  if (morphotype?.type === 'LONG_FEMUR') {
    immediate.push('Con femori lunghi, una maggiore inclinazione del torso è normale');
    accessories.push('Box squat per trovare la profondità ottimale');
  }

  // Rimuovi duplicati
  return {
    immediate: [...new Set(immediate)],
    accessories: [...new Set(accessories)],
    mobility: [...new Set(mobility)]
  };
}

// ============================================
// FULL SQUAT ANALYSIS
// ============================================

export function analyzeFullSquat(
  allFrames: FrameAnalysis[],
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  // Raccogli tutti gli issues
  const allIssues: Issue[] = [];

  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  // Esegui efficiency checks
  for (const check of SQUAT_EFFICIENCY_CHECKS) {
    if (check.check(allFrames, morphotype)) {
      allIssues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: check.severity || 'MEDIUM',
        description: check.description,
        correction: check.correction
      });
    }
  }

  // Ordina per priorità e rimuovi duplicati
  const uniqueIssues = removeDuplicateIssues(allIssues);
  const sortedIssues = sortIssuesByPriority(uniqueIssues);

  // Max 2 correzioni alla volta per non sovraccaricare l'utente
  const topIssues = sortedIssues.slice(0, 2);

  // Identifica punti di forza
  const strengths = identifySquatStrengths(allFrames);

  // Analizza sticking point
  const stickingPoint = analyzeSquatStickingPoint(allFrames);

  // Genera raccomandazioni
  const recommendations = generateSquatRecommendations(topIssues, morphotype);

  // Aggiungi raccomandazioni dallo sticking point
  if (stickingPoint.detected && stickingPoint.recommendations) {
    recommendations.accessories.push(...stickingPoint.recommendations.accessories);
    recommendations.immediate.push(...stickingPoint.recommendations.cues);
  }

  // Calcola score
  const overallScore = calculateSquatScore(topIssues, strengths);

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

function calculateSquatScore(issues: Issue[], strengths: string[]): number {
  let score = 10;

  // Penalità per issues
  for (const issue of issues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else if (issue.type === 'EFFICIENCY') {
      score -= issue.severity === 'HIGH' ? 1.5 : issue.severity === 'MEDIUM' ? 1 : 0.5;
    } else {
      score -= 0.5;
    }
  }

  // Bonus per punti di forza
  score += Math.min(strengths.length * 0.3, 1);

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
