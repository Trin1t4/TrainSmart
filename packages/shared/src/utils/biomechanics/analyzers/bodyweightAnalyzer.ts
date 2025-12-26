/**
 * Bodyweight Analyzer
 * Analisi biomeccanica per esercizi a corpo libero
 * Push-up, Dip, Plank, Lunge, Split Squat, ecc.
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
  getKneeAngle,
  getHipAngle,
  getElbowAngle,
  getTorsoAngle,
  getKneeValgus,
  isSpineNeutral,
  midpoint,
  distance2D,
  calculateAngle
} from '../core';

// ============================================
// CONFIGURAZIONE ESERCIZI
// Struttura unificata per evitare ripetizioni
// ============================================

interface ExerciseConfig {
  safetyChecks: SafetyCheck[];
  efficiencyChecks: EfficiencyCheck[];
  strengthChecks: ((frames: FrameAnalysis[]) => string | null)[];
}

// ============================================
// PUSH-UP
// ============================================

const PUSHUP_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'HIP_SAG',
      severity: 'MEDIUM',
      description: 'Anche che cedono verso il basso',
      correction: 'Stringi glutei e core. Linea retta testa-talloni.',
      check: (frame) => {
        // Se l'anca è più bassa della linea spalla-caviglia
        return (frame.angles.hip || 180) > 190;
      }
    },
    {
      code: 'HIP_PIKE',
      severity: 'LOW',
      description: 'Anche troppo alte (pike position)',
      correction: 'Abbassa le anche in linea con il corpo.',
      check: (frame) => (frame.angles.hip || 180) < 160
    },
    {
      code: 'ELBOW_FLARE_90',
      severity: 'MEDIUM',
      description: 'Gomiti a 90° dal corpo (T-shape)',
      correction: 'Gomiti a 45°, forma una freccia (↑) non una T.',
      check: (frame) => (frame.angles.elbowFlare || 0) > 75
    },
    {
      code: 'NECK_HYPEREXTENSION',
      severity: 'LOW',
      description: 'Collo iperesteso (guardi avanti)',
      correction: 'Sguardo al pavimento, collo neutro.',
      check: (frame) => (frame.angles.neck || 0) > 25
    }
  ],

  efficiencyChecks: [
    {
      code: 'INCOMPLETE_ROM_BOTTOM',
      description: 'Non scendi abbastanza',
      correction: 'Petto a 5cm dal pavimento o fino a toccare.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.elbow || 180) > 100 : false;
      }
    },
    {
      code: 'INCOMPLETE_LOCKOUT',
      description: 'Braccia non completamente estese in alto',
      correction: 'Estendi completamente, protraendo le scapole.',
      check: (frames) => {
        const top = frames.find(f => f.phase === 'LOCKOUT' || f.phase === 'TOP');
        return top ? (top.angles.elbow || 0) < 170 : false;
      }
    },
    {
      code: 'NO_SCAPULAR_MOVEMENT',
      description: 'Scapole bloccate, non si muovono',
      correction: 'Scapole retratte in basso, protratte in alto.',
      check: (frames) => false // Difficile da rilevare
    }
  ],

  strengthChecks: [
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.elbow || 180) < 95 ? 'ROM completo raggiunto' : null;
    },
    (frames) => {
      const hipIssues = frames.filter(f => (f.angles.hip || 180) > 190 || (f.angles.hip || 180) < 160);
      return hipIssues.length === 0 ? 'Ottimo allineamento del corpo' : null;
    }
  ]
};

// ============================================
// DIP
// ============================================

const DIP_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'DIP_TOO_DEEP',
      severity: 'MEDIUM',
      description: 'Dip troppo profondo - spalla sotto il gomito',
      correction: 'Fermati quando la spalla è all\'altezza del gomito.',
      check: (frame) => {
        // Spalla più bassa del gomito
        return (frame.angles.shoulder || 0) > 15;
      }
    },
    {
      code: 'ELBOW_FLARE',
      severity: 'MEDIUM',
      description: 'Gomiti che vanno troppo in fuori',
      correction: 'Gomiti vicini al corpo, non aprirli lateralmente.',
      check: (frame) => (frame.angles.elbowFlare || 0) > 45
    },
    {
      code: 'FORWARD_LEAN_EXCESSIVE',
      severity: 'LOW',
      description: 'Inclinazione eccessiva in avanti',
      correction: 'Leggera inclinazione ok per il petto, ma non esagerare.',
      check: (frame) => (frame.angles.torso || 0) > 45
    }
  ],

  efficiencyChecks: [
    {
      code: 'INCOMPLETE_ROM',
      description: 'ROM insufficiente',
      correction: 'Scendi fino a 90° al gomito, sali fino a lockout.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.elbow || 180) > 110 : false;
      }
    },
    {
      code: 'NO_LOCKOUT',
      description: 'Manca il lockout in cima',
      correction: 'Estendi completamente le braccia in cima.',
      check: (frames) => {
        const top = frames.find(f => f.phase === 'LOCKOUT');
        return top ? (top.angles.elbow || 0) < 170 : false;
      }
    }
  ],

  strengthChecks: [
    (frames) => {
      const spineOk = frames.every(f => f.spineNeutral !== false);
      return spineOk ? 'Buon controllo del core' : null;
    }
  ]
};

// ============================================
// LUNGE (Forward/Reverse)
// ============================================

const LUNGE_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'KNEE_VALGUS',
      severity: 'HIGH',
      description: 'Ginocchio anteriore che collassa verso l\'interno',
      correction: 'Spingi il ginocchio in fuori, in linea col piede.',
      check: (frame) => Math.abs(frame.angles.kneeValgus || 0) > 8
    },
    {
      code: 'KNEE_PAST_TOE_EXCESSIVE',
      severity: 'MEDIUM',
      description: 'Ginocchio troppo avanti rispetto alle dita',
      correction: 'Fai un passo più lungo. Un po\' oltre le dita è ok.',
      check: (frame) => false // Richiede tracking piede
    },
    {
      code: 'TORSO_COLLAPSE',
      severity: 'MEDIUM',
      description: 'Torso che si inclina lateralmente',
      correction: 'Core attivo, spalle dritte. Possibile debolezza gluteo medio.',
      check: (frame) => (frame.angles.torso || 0) > 15
    },
    {
      code: 'LUMBAR_HYPEREXTENSION',
      severity: 'MEDIUM',
      description: 'Eccessiva lordosi lombare',
      correction: 'Leggera retroversione del bacino. "Coda sotto".',
      check: (frame) => (frame.angles.lumbar || 0) > 20
    }
  ],

  efficiencyChecks: [
    {
      code: 'INSUFFICIENT_DEPTH',
      description: 'Profondità insufficiente',
      correction: 'Ginocchio posteriore quasi a terra.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.knee || 180) > 110 : false;
      }
    },
    {
      code: 'PUSH_OFF_REAR_LEG',
      description: 'Ti spingi con la gamba posteriore',
      correction: 'Tutto il drive dalla gamba davanti.',
      check: (frames) => false // Difficile da rilevare
    }
  ],

  strengthChecks: [
    (frames) => {
      const valgusIssues = frames.filter(f => Math.abs(f.angles.kneeValgus || 0) > 8);
      return valgusIssues.length === 0 ? 'Ginocchio stabile e allineato' : null;
    },
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.knee || 180) < 100 ? 'Buona profondità' : null;
    }
  ]
};

// ============================================
// BULGARIAN SPLIT SQUAT
// ============================================

const BULGARIAN_CONFIG: ExerciseConfig = {
  safetyChecks: [
    ...LUNGE_CONFIG.safetyChecks, // Eredita i check del lunge
    {
      code: 'REAR_FOOT_POSITION',
      severity: 'LOW',
      description: 'Piede posteriore mal posizionato',
      correction: 'Dorso del piede sulla panca, non le dita.',
      check: (frame) => false // Richiede tracking piede
    }
  ],

  efficiencyChecks: [
    {
      code: 'INSUFFICIENT_DEPTH',
      description: 'Non scendi abbastanza',
      correction: 'Coscia anteriore parallela al pavimento.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.knee || 180) > 100 : false;
      }
    },
    {
      code: 'TORSO_TOO_VERTICAL',
      description: 'Torso troppo verticale per focus glutei',
      correction: 'Inclina leggermente avanti per più glutei.',
      check: (frames) => false // Dipende dall'obiettivo
    }
  ],

  strengthChecks: LUNGE_CONFIG.strengthChecks
};

// ============================================
// HIP THRUST
// ============================================

const HIP_THRUST_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'LUMBAR_HYPEREXTENSION',
      severity: 'HIGH',
      description: 'Iperestensione lombare in cima',
      correction: 'Chiudi con i glutei, non con la schiena. PPT in cima.',
      check: (frame) => (frame.angles.lumbar || 0) > 15
    },
    {
      code: 'NECK_HYPEREXTENSION',
      severity: 'MEDIUM',
      description: 'Collo iperesteso (guardi il soffitto)',
      correction: 'Mento al petto, sguardo avanti.',
      check: (frame) => (frame.angles.neck || 0) > 30
    },
    {
      code: 'KNEE_VALGUS',
      severity: 'MEDIUM',
      description: 'Ginocchia che cedono verso l\'interno',
      correction: 'Spingi le ginocchia fuori durante la spinta.',
      check: (frame) => Math.abs(frame.angles.kneeValgus || 0) > 10
    }
  ],

  efficiencyChecks: [
    {
      code: 'INCOMPLETE_ROM',
      description: 'Estensione dell\'anca incompleta',
      correction: 'Full lockout: anche completamente estese.',
      check: (frames) => {
        const top = frames.find(f => f.phase === 'LOCKOUT' || f.phase === 'TOP');
        return top ? (top.angles.hip || 180) < 175 : false;
      }
    },
    {
      code: 'NO_PPT',
      description: 'Manca il posterior pelvic tilt in cima',
      correction: '"Nascondi la fibbia della cintura" in cima.',
      check: (frames) => {
        const top = frames.find(f => f.phase === 'LOCKOUT');
        return top ? top.pelvicTilt !== 'POSTERIOR' : false;
      }
    }
  ],

  strengthChecks: [
    (frames) => {
      const top = frames.find(f => f.phase === 'LOCKOUT');
      return top && (top.angles.hip || 0) >= 175 ? 'Full lockout raggiunto' : null;
    },
    (frames) => {
      const lumbarIssues = frames.filter(f => (f.angles.lumbar || 0) > 15);
      return lumbarIssues.length === 0 ? 'Nessuna iperestensione lombare' : null;
    }
  ]
};

// ============================================
// RDL (Romanian Deadlift) - Corpo libero/Dumbbell
// ============================================

const RDL_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'LUMBAR_FLEXION',
      severity: 'HIGH',
      description: 'Schiena che si arrotonda',
      correction: 'Fermati prima di perdere la lordosi. Lavora sulla mobilità.',
      check: (frame) => frame.spineNeutral === false
    },
    {
      code: 'KNEE_HYPEREXTENSION',
      severity: 'MEDIUM',
      description: 'Ginocchia iperestese (bloccate indietro)',
      correction: 'Soft lock alle ginocchia, mai completamente dritte.',
      check: (frame) => (frame.angles.knee || 0) > 178
    },
    {
      code: 'NECK_CRANE',
      severity: 'LOW',
      description: 'Collo iperesteso (guardi lo specchio)',
      correction: 'Sguardo segue la spine.',
      check: (frame) => (frame.angles.neck || 0) > 25
    }
  ],

  efficiencyChecks: [
    {
      code: 'INSUFFICIENT_HIP_HINGE',
      description: 'ROM insufficiente - non stai hingando abbastanza',
      correction: 'Spingi le anche INDIETRO. "Chiudi una porta col sedere".',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.hip || 180) > 120 : false;
      }
    },
    {
      code: 'SQUAT_PATTERN',
      description: 'Stai facendo uno squat, non un hinge',
      correction: 'Ginocchia quasi ferme. Movimento TUTTO dalle anche.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.knee || 180) < 140 : false;
      }
    },
    {
      code: 'WEIGHT_ON_TOES',
      description: 'Peso sulle punte',
      correction: 'Peso sui talloni/mesopiede.',
      check: (frames) => {
        return frames.some(f => f.centerOfPressure === 'FOREFOOT');
      }
    }
  ],

  strengthChecks: [
    (frames) => {
      const spineOk = frames.every(f => f.spineNeutral !== false);
      return spineOk ? 'Spine neutrale mantenuta' : null;
    },
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.hip || 180) < 100 ? 'Ottimo ROM dell\'hinge' : null;
    }
  ]
};

// ============================================
// PISTOL SQUAT
// ============================================

const PISTOL_SQUAT_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'KNEE_VALGUS',
      severity: 'HIGH',
      description: 'Ginocchio che collassa verso l\'interno',
      correction: 'Spingi il ginocchio in fuori, in linea col 2° dito del piede.',
      check: (frame) => Math.abs(frame.angles.kneeValgus || 0) > 10
    },
    {
      code: 'HEEL_RISE',
      severity: 'MEDIUM',
      description: 'Tallone che si alza durante la discesa',
      correction: 'Lavora sulla mobilità della caviglia. Usa un rialzo sotto il tallone.',
      check: (frame) => frame.heelContact === false
    },
    {
      code: 'LUMBAR_FLEXION',
      severity: 'MEDIUM',
      description: 'Schiena che si arrotonda in basso',
      correction: 'Core attivo, petto in fuori. Fermati dove perdi la postura.',
      check: (frame) => frame.spineNeutral === false
    },
    {
      code: 'FORWARD_LEAN_EXCESSIVE',
      severity: 'LOW',
      description: 'Busto troppo inclinato in avanti',
      correction: 'Braccia avanti per controbilanciare, ma cerca di restare più verticale.',
      check: (frame) => (frame.angles.torso || 0) > 55
    }
  ],

  efficiencyChecks: [
    {
      code: 'INSUFFICIENT_DEPTH',
      description: 'Non scendi abbastanza in profondità',
      correction: 'Full ROM: sedere quasi a toccare il tallone.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.knee || 180) > 70 : false;
      }
    },
    {
      code: 'LEG_NOT_EXTENDED',
      description: 'Gamba libera non completamente estesa',
      correction: 'Mantieni la gamba avanti dritta e parallela al pavimento.',
      check: (frames) => false // Richiede tracking gamba libera
    },
    {
      code: 'USING_MOMENTUM',
      description: 'Usi lo slancio invece della forza',
      correction: '3 secondi in discesa, pausa in basso, poi sali.',
      check: (frames) => false // Richiede analisi velocità
    }
  ],

  strengthChecks: [
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.knee || 180) < 60 ? 'Full depth raggiunta' : null;
    },
    (frames) => {
      const valgusIssues = frames.filter(f => Math.abs(f.angles.kneeValgus || 0) > 10);
      return valgusIssues.length === 0 ? 'Ginocchio stabile e allineato' : null;
    },
    (frames) => {
      const spineOk = frames.every(f => f.spineNeutral !== false);
      return spineOk ? 'Ottimo controllo del core' : null;
    }
  ]
};

// ============================================
// SKATER SQUAT
// ============================================

const SKATER_SQUAT_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'KNEE_VALGUS',
      severity: 'HIGH',
      description: 'Ginocchio che collassa verso l\'interno',
      correction: 'Spingi il ginocchio in fuori, attiva il gluteo medio.',
      check: (frame) => Math.abs(frame.angles.kneeValgus || 0) > 10
    },
    {
      code: 'TORSO_COLLAPSE',
      severity: 'MEDIUM',
      description: 'Torso che si inclina lateralmente',
      correction: 'Core attivo, spalle dritte. Braccia avanti per equilibrio.',
      check: (frame) => (frame.angles.torso || 0) > 20
    },
    {
      code: 'LUMBAR_HYPEREXTENSION',
      severity: 'MEDIUM',
      description: 'Eccessiva lordosi lombare',
      correction: 'Leggera retroversione del bacino durante la discesa.',
      check: (frame) => (frame.angles.lumbar || 0) > 20
    }
  ],

  efficiencyChecks: [
    {
      code: 'INSUFFICIENT_DEPTH',
      description: 'Non scendi abbastanza',
      correction: 'Ginocchio posteriore quasi a terra (o tocca leggermente).',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.knee || 180) > 100 : false;
      }
    },
    {
      code: 'BACK_LEG_HELPS',
      description: 'La gamba posteriore aiuta a spingere',
      correction: 'Solo equilibrio con la gamba dietro, tutto il drive dalla gamba davanti.',
      check: (frames) => false // Difficile da rilevare
    }
  ],

  strengthChecks: [
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.knee || 180) < 95 ? 'Ottima profondità' : null;
    },
    (frames) => {
      const valgusIssues = frames.filter(f => Math.abs(f.angles.kneeValgus || 0) > 10);
      return valgusIssues.length === 0 ? 'Stabilità del ginocchio eccellente' : null;
    }
  ]
};

// ============================================
// ARCHER PUSH-UP
// ============================================

const ARCHER_PUSHUP_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'HIP_SAG',
      severity: 'MEDIUM',
      description: 'Anche che cedono verso il basso',
      correction: 'Stringi glutei e core. Mantieni la linea del corpo.',
      check: (frame) => (frame.angles.hip || 180) > 190
    },
    {
      code: 'HIP_ROTATION',
      severity: 'MEDIUM',
      description: 'Bacino che ruota durante il movimento',
      correction: 'Mantieni il bacino parallelo al pavimento.',
      check: (frame) => false // Richiede tracking rotazione
    },
    {
      code: 'ELBOW_FLARE',
      severity: 'MEDIUM',
      description: 'Gomito del braccio che lavora a 90°',
      correction: 'Gomito a 45° dal corpo, forma una freccia.',
      check: (frame) => (frame.angles.elbowFlare || 0) > 70
    },
    {
      code: 'ASSIST_ARM_BENT',
      severity: 'LOW',
      description: 'Braccio d\'assistenza piegato',
      correction: 'Il braccio laterale deve restare completamente esteso.',
      check: (frame) => false // Richiede tracking braccio specifico
    }
  ],

  efficiencyChecks: [
    {
      code: 'INCOMPLETE_ROM',
      description: 'Non scendi abbastanza verso il lato',
      correction: 'Petto verso la mano che lavora, quasi a toccare.',
      check: (frames) => {
        const bottom = frames.find(f => f.phase === 'BOTTOM');
        return bottom ? (bottom.angles.elbow || 180) > 100 : false;
      }
    },
    {
      code: 'WEIGHT_DISTRIBUTION',
      description: 'Peso non spostato correttamente',
      correction: 'Sposta il peso verso il braccio che lavora nella discesa.',
      check: (frames) => false
    }
  ],

  strengthChecks: [
    (frames) => {
      const bottom = frames.find(f => f.phase === 'BOTTOM');
      return bottom && (bottom.angles.elbow || 180) < 95 ? 'Ottimo ROM raggiunto' : null;
    },
    (frames) => {
      const hipIssues = frames.filter(f => (f.angles.hip || 180) > 190);
      return hipIssues.length === 0 ? 'Ottimo allineamento del corpo' : null;
    }
  ]
};

// ============================================
// INVERTED ROW (Australian Pull-up)
// ============================================

const INVERTED_ROW_CONFIG: ExerciseConfig = {
  safetyChecks: [
    {
      code: 'HIP_SAG',
      severity: 'MEDIUM',
      description: 'Corpo che cede al centro',
      correction: 'Linea retta testa-talloni. Stringi glutei.',
      check: (frame) => (frame.angles.hip || 180) > 185
    },
    {
      code: 'NECK_PROTRACTION',
      severity: 'LOW',
      description: 'Testa che va in avanti',
      correction: 'Mento retratto, collo in linea con la colonna.',
      check: (frame) => (frame.angles.neck || 0) > 20
    }
  ],

  efficiencyChecks: [
    {
      code: 'INCOMPLETE_ROM',
      description: 'Non tiri abbastanza in alto',
      correction: 'Petto che tocca la barra/anelli.',
      check: (frames) => {
        const top = frames.find(f => f.phase === 'TOP' || f.phase === 'LOCKOUT');
        return top ? (top.angles.elbow || 180) > 100 : false;
      }
    },
    {
      code: 'NO_SCAPULAR_RETRACTION',
      description: 'Scapole non retratte in alto',
      correction: 'Stringi le scapole insieme quando tiri.',
      check: (frames) => false // Difficile da rilevare
    },
    {
      code: 'PULLING_WITH_ARMS',
      description: 'Tiri solo con le braccia',
      correction: 'Inizia il movimento con la retrazione scapolare.',
      check: (frames) => false
    }
  ],

  strengthChecks: [
    (frames) => {
      const top = frames.find(f => f.phase === 'TOP');
      return top && (top.angles.elbow || 180) < 100 ? 'Full ROM raggiunto' : null;
    },
    (frames) => {
      const hipOk = frames.every(f => (f.angles.hip || 180) <= 185);
      return hipOk ? 'Ottimo allineamento del corpo' : null;
    }
  ]
};

// ============================================
// REGISTRY - Mappa esercizio -> config
// ============================================

const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  'PUSH_UP': PUSHUP_CONFIG,
  'DIP': DIP_CONFIG,
  'LUNGE_FORWARD': LUNGE_CONFIG,
  'LUNGE_REVERSE': LUNGE_CONFIG,
  'BULGARIAN_SPLIT_SQUAT': BULGARIAN_CONFIG,
  'STEP_UP': LUNGE_CONFIG, // Simile al lunge
  'LATERAL_LUNGE': LUNGE_CONFIG,
  'HIP_THRUST': HIP_THRUST_CONFIG,
  'GLUTE_BRIDGE': HIP_THRUST_CONFIG,
  'ROMANIAN_DEADLIFT': RDL_CONFIG,
  'GOOD_MORNING': RDL_CONFIG,
  // Nuovi esercizi bodyweight avanzati
  'PISTOL_SQUAT': PISTOL_SQUAT_CONFIG,
  'SKATER_SQUAT': SKATER_SQUAT_CONFIG,
  'ARCHER_PUSH_UP': ARCHER_PUSHUP_CONFIG,
  'INVERTED_ROW': INVERTED_ROW_CONFIG
};

// ============================================
// FUNZIONI DI ANALISI GENERICHE
// ============================================

export function analyzeBodyweightFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  exerciseType: string,
  morphotype?: Morphotype
): FrameAnalysis {
  const config = EXERCISE_CONFIGS[exerciseType];
  if (!config) {
    return {
      frameNumber,
      timestamp,
      phase: phase as any,
      angles: {},
      issues: []
    };
  }

  // Calcola angoli comuni
  const angles = {
    knee: getKneeAngle(landmarks, 'left'),
    hip: getHipAngle(landmarks, 'left'),
    elbow: getElbowAngle(landmarks, 'left'),
    torso: getTorsoAngle(landmarks),
    kneeValgus: getKneeValgus(landmarks, 'left')
  };

  const spineNeutral = isSpineNeutral(landmarks);
  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles,
    spineNeutral,
    issues
  };

  // Esegui safety checks
  for (const check of config.safetyChecks) {
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

export function analyzeFullBodyweight(
  allFrames: FrameAnalysis[],
  exerciseType: string,
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  const config = EXERCISE_CONFIGS[exerciseType];
  if (!config) {
    return {
      issues: [],
      strengths: [],
      stickingPoint: { detected: false },
      recommendations: { immediate: [], accessories: [], mobility: [] },
      overallScore: 7
    };
  }

  // Raccogli issues dai frame
  const allIssues: Issue[] = [];
  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  // Esegui efficiency checks
  for (const check of config.efficiencyChecks) {
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

  // Deduplica e ordina
  const uniqueIssues = [...new Map(allIssues.map(i => [i.code, i])).values()];
  const sortedIssues = uniqueIssues.sort((a, b) => {
    const priorityOrder = { SAFETY: 0, EFFICIENCY: 1, OPTIMIZATION: 2 };
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const pDiff = priorityOrder[a.type] - priorityOrder[b.type];
    return pDiff !== 0 ? pDiff : severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Max 2 correzioni
  const topIssues = sortedIssues.slice(0, 2);

  // Punti di forza
  const strengths: string[] = [];
  for (const check of config.strengthChecks) {
    const result = check(allFrames);
    if (result) strengths.push(result);
  }

  // Raccomandazioni
  const recommendations = generateBodyweightRecommendations(topIssues, exerciseType);

  // Score
  let score = 10;
  for (const issue of topIssues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else {
      score -= 1;
    }
  }
  score += Math.min(strengths.length * 0.3, 1);
  const overallScore = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  return {
    issues: topIssues,
    strengths,
    stickingPoint: { detected: false },
    recommendations,
    overallScore
  };
}

// ============================================
// RACCOMANDAZIONI
// ============================================

function generateBodyweightRecommendations(
  issues: Issue[],
  exerciseType: string
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  for (const issue of issues) {
    switch (issue.code) {
      case 'HIP_SAG':
        immediate.push('Stringi glutei e core');
        accessories.push('Plank', 'Dead bug');
        break;

      case 'ELBOW_FLARE_90':
      case 'ELBOW_FLARE':
        immediate.push('Gomiti a 45°, forma una freccia');
        break;

      case 'KNEE_VALGUS':
        immediate.push('Spingi il ginocchio in fuori');
        accessories.push('Clamshell', 'Banded squat');
        break;

      case 'LUMBAR_FLEXION':
        immediate.push('Fermati prima di perdere la curva');
        mobility.push('Hip flexor stretch', '90/90 stretch');
        break;

      case 'LUMBAR_HYPEREXTENSION':
        immediate.push('Core attivo, "coda sotto"');
        accessories.push('Dead bug', 'Hollow body hold');
        break;

      case 'INCOMPLETE_ROM':
      case 'INCOMPLETE_ROM_BOTTOM':
        immediate.push('Full ROM con movimento controllato');
        break;

      case 'SQUAT_PATTERN':
        immediate.push('Pensa ANCHE INDIETRO, non ginocchia avanti');
        break;
    }
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 2),
    accessories: [...new Set(accessories)].slice(0, 2),
    mobility: [...new Set(mobility)].slice(0, 2)
  };
}

// ============================================
// EXPORT CONFIGS (per testing/estensione)
// ============================================

export {
  PUSHUP_CONFIG,
  DIP_CONFIG,
  LUNGE_CONFIG,
  BULGARIAN_CONFIG,
  HIP_THRUST_CONFIG,
  RDL_CONFIG,
  EXERCISE_CONFIGS
};
