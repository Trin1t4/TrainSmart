/**
 * ============================================================================
 * PROGRAM GENERATOR - CONSOLIDATED VERSION
 * ============================================================================
 *
 * Versione unificata del generatore programmi per TrainSmart e TeamFlow.
 * Contiene TUTTA la logica di generazione programmi:
 * - Programmi standard (forza, massa, fat loss, etc.)
 * - Programmi performance sport-specifici (calcio, basket, tennis, etc.)
 * - Programmi motor recovery/rieducazione
 * - Pre-workout screening e runtime adaptation
 * - Calcolo volume DUP (Daily Undulating Periodization)
 * - Conversioni gym/home e gestione equipment
 *
 * @module programGenerator
 * @version 2.0.0 (Consolidated)
 */

import type { Level, Goal, PatternBaselines, Exercise, Program } from '../types';
import {
  isExerciseConflicting,
  applyPainDeload,
  findSafeAlternative,
  getCorrectiveExercises
} from './painManagement';
import { convertToMachineVariant } from './exerciseMapping';
import type { NormalizedPainArea } from './validators';
import { generateWeeklySplit } from './weeklySplitGenerator';
import { integrateRunningIntoSplit } from './runningProgramGenerator';
import type { RunningPreferences } from '../types/onboarding.types';
import {
  validateProgramInput,
  applyCorrections,
  generateDefaultBaselines,
  adaptWorkoutToRuntime,
  formatValidationResult,
  type ValidationResult,
  type RuntimeContext as BaseRuntimeContext,
  type RuntimeAdaptation
} from './programValidation';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VolumeResult {
  sets: number;
  reps: number;
  rest: string;
  intensity: string;
  notes?: string;
}

export interface ProgramGeneratorOptions {
  level: Level;
  goal: Goal;
  goals?: string[];
  location: 'gym' | 'home' | 'home_gym';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  equipment?: any;
  muscularFocus?: string | string[];
  sport?: string;
  sportRole?: string;
  sessionDuration?: number;
  disabilityType?: string;
  assessments?: any[];
  userBodyweight?: number; // Peso corporeo utente in kg - fondamentale per location adapter
  // Legs goal type for females (PHA, rebalance, or standard toning)
  legsGoalType?: 'toning' | 'slimming' | 'rebalance';
  gender?: 'M' | 'F';
  // Running/Cardio preferences
  runningPrefs?: RunningPreferences;
  userAge?: number;
}

export interface ScreeningResult {
  screening: {
    sleep: number;
    stress: number;
    painAreas: string[];
    timestamp: string;
  };
  recommendations: {
    intensityMultiplier: number;
    shouldReduceVolume: boolean;
    shouldFocusOnRecovery: boolean;
    volumeReduction: number;
  };
  warnings: string[];
}

export interface RuntimeContext extends BaseRuntimeContext {
  currentAssessments?: any[];
}

// ============================================================================
// CONSTANTS - LEVEL CONFIGURATION
// ============================================================================

export const LEVEL_CONFIG = {
  beginner: {
    RIR: 3,
    repsRange: 2,
    startPercentage: 0.70,
    compoundSets: 3,
    accessorySets: 2
  },
  intermediate: {
    RIR: 2,
    repsRange: 1,
    startPercentage: 0.85,
    compoundSets: 4,
    accessorySets: 3
  },
  advanced: {
    RIR: 1,
    repsRange: 0,
    startPercentage: 0.90,
    compoundSets: 5,
    accessorySets: 3
  }
};

// ============================================================================
// SUPERSET CONFIGURATION
// ============================================================================

/**
 * Coppie di gruppi muscolari antagonisti per superset
 * Usate per: fat loss, toning, poco tempo disponibile
 */
export const ANTAGONIST_SUPERSET_PAIRS: Record<string, string> = {
  // Upper body antagonisti
  'chest': 'back',
  'back': 'chest',
  'biceps': 'triceps',
  'triceps': 'biceps',
  'front_delt': 'rear_delt',
  'rear_delt': 'front_delt',
  // Lower body antagonisti
  'quadriceps': 'hamstrings',
  'hamstrings': 'quadriceps',
  'hip_flexors': 'glutes',
  'glutes': 'hip_flexors',
};

/**
 * Coppie pre-exhaustion per superset (isolamento → compound)
 * Usate per: ipertrofia con focus specifico
 */
export const PRE_EXHAUSTION_PAIRS: Record<string, { isolation: string[], compound: string[] }> = {
  'chest': {
    isolation: ['Croci ai Cavi', 'Pec Deck', 'Croci con Manubri', 'Croci Inclinato'],
    compound: ['Panca Piana', 'Panca Inclinata', 'Panca con Manubri', 'Piegamenti']
  },
  'back': {
    isolation: ['Pulldown a Braccia Tese', 'Pullover', 'Croci Inverse'],
    compound: ['Trazioni', 'Lat Machine', 'Rematore con Bilanciere', 'Pulley Basso']
  },
  'quadriceps': {
    isolation: ['Leg Extension', 'Sissy Squat'],
    compound: ['Squat', 'Pressa', 'Hack Squat', 'Affondi Bulgari']
  },
  'hamstrings': {
    isolation: ['Leg Curl', 'Nordic Curl'],
    compound: ['Stacco Rumeno', 'Stacco a Gambe Tese', 'Good Morning']
  },
  'shoulders': {
    isolation: ['Alzate Laterali', 'Alzate Frontali', 'Croci Inverse'],
    compound: ['Lento Avanti', 'Military Press', 'Arnold Press', 'Pike Push-up']
  },
  'glutes': {
    isolation: ['Slanci Glutei', 'Abduzioni Anca', 'Clamshell'],
    compound: ['Hip Thrust', 'Ponte Glutei', 'Stacco Sumo', 'Step Up']
  },
  'biceps': {
    isolation: ['Curl Concentrato', 'Curl alla Panca Scott'],
    compound: ['Trazioni Supine', 'Rematore Supino', 'Curl con Bilanciere EZ']
  },
  'triceps': {
    isolation: ['Kickback Tricipiti', 'French Press'],
    compound: ['Panca Presa Stretta', 'Dip alle Parallele', 'Piegamenti Diamante']
  }
};

/**
 * Post-exhaustion pairs (compound → isolation)
 * Stesso mapping ma invertito nell'uso
 */
export const POST_EXHAUSTION_PAIRS = PRE_EXHAUSTION_PAIRS;

/**
 * Determina se usare superset in base a goal, livello, tempo e focus
 */
export function shouldUseSupersets(
  goal: string,
  level: string,
  sessionDuration?: number,
  muscularFocus?: string | string[]
): { use: boolean; type: 'antagonist' | 'pre_exhaustion' | 'post_exhaustion' | 'none'; reason: string } {
  // Principianti: MAI superset
  if (level === 'beginner') {
    return { use: false, type: 'none', reason: 'Principiante - focus su tecnica base' };
  }

  const normalizedGoal = goal.toLowerCase();
  const hasFocus = muscularFocus && (Array.isArray(muscularFocus) ? muscularFocus.length > 0 : muscularFocus !== '');
  const hasLimitedTime = sessionDuration && sessionDuration <= 45;

  // Fat loss / Toning: superset antagonisti per efficienza metabolica
  if (['fat_loss', 'dimagrimento', 'toning', 'tonificazione'].includes(normalizedGoal)) {
    return { use: true, type: 'antagonist', reason: 'Fat loss/Toning - superset antagonisti per efficienza metabolica' };
  }

  // Poco tempo: superset antagonisti per risparmiare tempo
  if (hasLimitedTime) {
    return { use: true, type: 'antagonist', reason: 'Sessione breve - superset antagonisti per ottimizzare tempo' };
  }

  // Ipertrofia con focus specifico: pre/post exhaustion stesso gruppo
  if (['muscle_gain', 'massa', 'ipertrofia', 'hypertrophy'].includes(normalizedGoal) && hasFocus) {
    // Alterna tra pre e post exhaustion
    const usePreExhaustion = Math.random() > 0.5;
    return {
      use: true,
      type: usePreExhaustion ? 'pre_exhaustion' : 'post_exhaustion',
      reason: `Ipertrofia con focus - ${usePreExhaustion ? 'pre' : 'post'}-exhaustion per massimizzare volume`
    };
  }

  // Ipertrofia senza focus: superset antagonisti per volume generale
  if (['muscle_gain', 'massa', 'ipertrofia', 'hypertrophy'].includes(normalizedGoal)) {
    return { use: true, type: 'antagonist', reason: 'Ipertrofia generale - superset antagonisti per volume' };
  }

  // Forza: NO superset (serve recupero completo)
  if (['strength', 'forza'].includes(normalizedGoal)) {
    return { use: false, type: 'none', reason: 'Forza - recupero completo necessario' };
  }

  return { use: false, type: 'none', reason: 'Default - nessun superset' };
}

/**
 * Trova il pattern antagonista per un dato pattern
 */
function getAntagonistPattern(pattern: string): string | null {
  const patternLower = pattern.toLowerCase();

  // Mapping pattern → gruppo muscolare
  const patternToMuscle: Record<string, string> = {
    'horizontal_push': 'chest',
    'horizontal_pull': 'back',
    'vertical_push': 'shoulders',
    'vertical_pull': 'back',
    'hip_hinge': 'hamstrings',
    'squat': 'quadriceps',
    'lunge': 'quadriceps',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'chest': 'chest',
    'back': 'back',
  };

  const muscle = patternToMuscle[patternLower];
  if (!muscle) return null;

  const antagonist = ANTAGONIST_SUPERSET_PAIRS[muscle];
  if (!antagonist) return null;

  // Mapping gruppo muscolare → pattern
  const muscleToPattern: Record<string, string> = {
    'chest': 'horizontal_push',
    'back': 'horizontal_pull',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'quadriceps': 'squat',
    'hamstrings': 'hip_hinge',
    'shoulders': 'vertical_push',
    'glutes': 'hip_hinge',
  };

  return muscleToPattern[antagonist] || null;
}

/**
 * Applica supersetGroup agli esercizi in base alla configurazione
 */
export function applySupersetGroups(
  exercises: any[],
  supersetConfig: { use: boolean; type: 'antagonist' | 'pre_exhaustion' | 'post_exhaustion' | 'none'; reason: string },
  muscularFocus?: string | string[]
): any[] {
  if (!supersetConfig.use || supersetConfig.type === 'none') {
    return exercises;
  }

  const result = [...exercises];
  let supersetGroupId = 1;

  if (supersetConfig.type === 'antagonist') {
    // Trova coppie antagoniste tra gli esercizi
    const paired = new Set<number>();

    for (let i = 0; i < result.length; i++) {
      if (paired.has(i)) continue;

      const exercise = result[i];
      const antagonistPattern = getAntagonistPattern(exercise.pattern || '');

      if (!antagonistPattern) continue;

      // Cerca un esercizio con pattern antagonista non ancora accoppiato
      for (let j = i + 1; j < result.length; j++) {
        if (paired.has(j)) continue;

        const candidate = result[j];
        if (candidate.pattern?.toLowerCase().includes(antagonistPattern) ||
            antagonistPattern.includes(candidate.pattern?.toLowerCase())) {
          // Trovata coppia antagonista
          result[i] = { ...result[i], supersetGroup: supersetGroupId };
          result[j] = { ...result[j], supersetGroup: supersetGroupId };
          paired.add(i);
          paired.add(j);
          supersetGroupId++;
          break;
        }
      }
    }
  } else if (supersetConfig.type === 'pre_exhaustion' || supersetConfig.type === 'post_exhaustion') {
    // Focus su gruppo specifico con pre/post exhaustion
    const focusGroups = Array.isArray(muscularFocus) ? muscularFocus : [muscularFocus];

    for (const focus of focusGroups) {
      if (!focus) continue;

      const focusLower = focus.toLowerCase();
      const pairs = PRE_EXHAUSTION_PAIRS[focusLower];
      if (!pairs) continue;

      // Trova esercizi del focus group
      const focusExercises = result.filter(ex =>
        ex.pattern?.toLowerCase().includes(focusLower) ||
        ex.name?.toLowerCase().includes(focusLower)
      );

      // Trova isolation e compound
      let isolationIdx = -1;
      let compoundIdx = -1;

      for (let i = 0; i < result.length; i++) {
        const exName = result[i].name?.toLowerCase() || '';

        if (isolationIdx === -1 && pairs.isolation.some(iso => exName.includes(iso.toLowerCase()))) {
          isolationIdx = i;
        }
        if (compoundIdx === -1 && pairs.compound.some(comp => exName.includes(comp.toLowerCase()))) {
          compoundIdx = i;
        }
      }

      if (isolationIdx !== -1 && compoundIdx !== -1) {
        if (supersetConfig.type === 'pre_exhaustion') {
          // Isolation prima del compound
          result[isolationIdx] = { ...result[isolationIdx], supersetGroup: supersetGroupId };
          result[compoundIdx] = { ...result[compoundIdx], supersetGroup: supersetGroupId };
        } else {
          // Compound prima dell'isolation (post-exhaustion)
          result[compoundIdx] = { ...result[compoundIdx], supersetGroup: supersetGroupId };
          result[isolationIdx] = { ...result[isolationIdx], supersetGroup: supersetGroupId };
        }
        supersetGroupId++;
      }
    }
  }

  return result;
}

// ============================================================================
// ADVANCED TRAINING TECHNIQUES
// ============================================================================

/**
 * Configurazione tecniche avanzate di intensificazione
 */
export const INTENSIFICATION_TECHNIQUES = {
  // Drop Sets - riduzione carico senza pausa
  drop_set: {
    name: 'Drop Set',
    description: 'Riduzione carico 20-30% senza pausa, continua fino a cedimento',
    applicableTo: ['isolation', 'machine'], // Più sicuro su isolamento/macchine
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia', 'hypertrophy'],
    notation: 'DS',
    implementation: { drops: 2, reductionPercent: 25 }
  },

  // Myo-Reps - serie attivazione + mini-set
  myo_reps: {
    name: 'Myo-Reps',
    description: 'Serie attivazione 12-15 reps, poi 3-5 mini-set da 3-5 reps con 5-10sec pausa',
    applicableTo: ['isolation', 'accessory'],
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia', 'hypertrophy'],
    notation: 'MR',
    implementation: { activationReps: '12-15', miniSets: 4, miniReps: '3-5', restBetween: 10 }
  },

  // Rest-Pause - pausa breve, altre reps
  rest_pause: {
    name: 'Rest-Pause',
    description: 'Serie a cedimento, 10-15sec pausa, altre reps a cedimento x2-3',
    applicableTo: ['compound', 'isolation'],
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia', 'strength', 'forza'],
    notation: 'RP',
    implementation: { pauseSeconds: 12, additionalSets: 2 }
  },

  // Cluster Sets - mini-pause intra-set
  cluster_set: {
    name: 'Cluster Set',
    description: 'Set suddiviso in mini-cluster con 10-15sec pausa (es: 2+2+2 invece di 6)',
    applicableTo: ['compound'],
    minLevel: 'advanced',
    goals: ['strength', 'forza'],
    notation: 'CL',
    implementation: { repsPerCluster: 2, clusters: 3, restBetweenClusters: 12 }
  },

  // Mechanical Drop Set - cambio angolo
  mechanical_drop_set: {
    name: 'Mechanical Drop Set',
    description: 'Cambio angolo/variante per continuare senza ridurre peso',
    applicableTo: ['compound', 'isolation'],
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia'],
    notation: 'MDS',
    sequences: {
      'chest': ['Panca Inclinata', 'Panca Piana', 'Panca Declinata'],
      'shoulders': ['Lento Avanti', 'Panca Inclinata', 'Alzate Laterali'],
      'back': ['Trazioni Larghe', 'Trazioni Neutre', 'Trazioni Strette'],
      'biceps': ['Curl Inclinato', 'Curl in Piedi', 'Curl alla Panca Scott'],
      'triceps': ['Estensioni Sopra la Testa', 'Pushdown', 'Panca Presa Stretta']
    }
  }
};

/**
 * Configurazione tecniche Time Under Tension (TUT)
 */
export const TUT_TECHNIQUES = {
  // Tempo Training - velocità controllata
  tempo: {
    name: 'Tempo Training',
    description: 'Controllo velocità eccentrica/concentrica/pause',
    patterns: {
      hypertrophy: '3-1-2-0', // 3sec ecc, 1sec pause, 2sec conc, 0 pause top
      strength: '2-1-X-0',    // 2sec ecc, 1sec pause, esplosivo, 0 pause
      control: '4-2-2-1',     // massimo controllo
      eccentric: '5-1-1-0'    // focus eccentrica
    },
    minLevel: 'beginner', // Tutti possono usare tempo
    goals: ['all']
  },

  // Eccentric Focus - negative lente
  eccentric_focus: {
    name: 'Eccentric Focus',
    description: 'Fase eccentrica 4-6 secondi per massimo danno muscolare',
    tempo: '5-1-1-0',
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia', 'strength', 'forza'],
    notation: 'ECC',
    eccentricSeconds: 5
  },

  // Pause Reps - pausa nel punto difficile
  pause_reps: {
    name: 'Pause Reps',
    description: '2-3 sec pausa nel punto più difficile (elimina stretch reflex)',
    pausePosition: 'bottom', // o 'mid' per alcuni esercizi
    pauseSeconds: 3,
    minLevel: 'intermediate',
    goals: ['strength', 'forza', 'muscle_gain'],
    notation: 'PR'
  },

  // 1.5 Reps - rep completa + mezza
  one_and_half_reps: {
    name: '1.5 Reps',
    description: 'Rep completa + mezza rep nel range più difficile',
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia'],
    notation: '1.5',
    countsAs: 1 // Ogni 1.5 rep conta come 1 rep per il volume
  },

  // Isometric Holds
  isometric_hold: {
    name: 'Isometric Hold',
    description: 'Pausa isometrica 3-5 sec nel punto di massima contrazione',
    holdPosition: 'peak_contraction',
    holdSeconds: 4,
    minLevel: 'beginner',
    goals: ['muscle_gain', 'toning', 'rehabilitation'],
    notation: 'ISO'
  }
};

/**
 * Configurazione Giant Sets e Tri-sets
 */
export const MULTI_EXERCISE_SETS = {
  // Giant Set - 4+ esercizi
  giant_set: {
    name: 'Giant Set',
    description: '4+ esercizi di fila senza pausa per stesso gruppo o full body',
    minExercises: 4,
    maxExercises: 6,
    restBetweenExercises: 0,
    restBetweenRounds: 90,
    minLevel: 'intermediate',
    goals: ['fat_loss', 'dimagrimento', 'toning', 'conditioning'],
    notation: 'GS'
  },

  // Tri-set stesso gruppo
  tri_set_same_muscle: {
    name: 'Tri-Set (Stesso Muscolo)',
    description: '3 esercizi stesso muscolo, angoli diversi',
    exercises: 3,
    restBetweenExercises: 0,
    restBetweenRounds: 120,
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia'],
    notation: 'TS',
    patterns: {
      'chest': ['Panca Inclinata', 'Panca Piana', 'Croci ai Cavi'],
      'back': ['Trazioni', 'Rematore', 'Pullover'],
      'shoulders': ['Lento Avanti', 'Alzate Laterali', 'Alzate Posteriori'],
      'quadriceps': ['Squat', 'Pressa', 'Leg Extension'],
      'hamstrings': ['Stacco Rumeno', 'Leg Curl', 'Good Morning'],
      'biceps': ['Curl Bilanciere', 'Curl Inclinato', 'Curl Concentrato'],
      'triceps': ['Panca Presa Stretta', 'Pushdown', 'Estensioni Sopra la Testa']
    }
  },

  // Superset Agonisti - 2 esercizi stesso muscolo
  agonist_superset: {
    name: 'Agonist Superset',
    description: '2 esercizi stesso muscolo per massimo pump',
    exercises: 2,
    restBetweenExercises: 0,
    restBetweenRounds: 90,
    minLevel: 'intermediate',
    goals: ['muscle_gain', 'massa', 'ipertrofia'],
    notation: 'AS'
  }
};

/**
 * Configurazione Contrast Training (per performance/sport)
 */
export const CONTRAST_TRAINING = {
  name: 'Allenamento a Contrasto',
  description: 'Esercizio pesante seguito da esplosivo (PAP - Post-Activation Potentiation)',
  minLevel: 'intermediate',
  goals: ['performance', 'sport', 'power'],
  pairs: {
    'squat': { heavy: 'Squat con Bilanciere', explosive: 'Squat Jump' },
    'deadlift': { heavy: 'Stacco Trap Bar', explosive: 'Salto in Lungo' },
    'bench': { heavy: 'Panca Piana', explosive: 'Piegamenti Esplosivi' },
    'pull': { heavy: 'Trazioni Zavorrate', explosive: 'Lancio Palla Medica' },
    'lunge': { heavy: 'Affondi Camminati', explosive: 'Split Jump' }
  },
  protocol: {
    heavySets: 3,
    heavyReps: '3-5',
    heavyRest: 30, // Prima dell'esplosivo
    explosiveSets: 3,
    explosiveReps: '5-8',
    explosiveRest: 180 // Prima del prossimo round
  }
};

/**
 * Configurazione Finisher Metabolici
 */
export const METABOLIC_FINISHERS = {
  // AMRAP - As Many Reps/Rounds As Possible
  amrap: {
    name: 'AMRAP',
    description: 'Quante più reps/round possibili in tempo limite',
    duration: { min: 5, max: 12 },
    minLevel: 'beginner',
    goals: ['fat_loss', 'conditioning', 'toning'],
    notation: 'AMRAP',
    exercises: ['Burpees', 'Scalatori', 'Squat Jump', 'Piegamenti', 'Swing con Kettlebell']
  },

  // EMOM - Every Minute On the Minute
  emom: {
    name: 'EMOM',
    description: 'Esercizio ogni minuto, riposo = tempo rimanente',
    duration: { min: 8, max: 15 },
    minLevel: 'beginner',
    goals: ['fat_loss', 'conditioning', 'toning', 'strength'],
    notation: 'EMOM',
    repsPerMinute: '8-12'
  },

  // Tabata
  tabata: {
    name: 'Tabata',
    description: '20sec lavoro, 10sec riposo x 8 round',
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    minLevel: 'intermediate',
    goals: ['fat_loss', 'conditioning'],
    notation: 'TAB'
  },

  // Ladder
  ladder: {
    name: 'Ladder',
    description: 'Reps crescenti o decrescenti (1-2-3-4-5-4-3-2-1)',
    minLevel: 'beginner',
    goals: ['fat_loss', 'conditioning', 'muscle_gain'],
    notation: 'LAD',
    patterns: {
      ascending: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      descending: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      pyramid: [1, 2, 3, 4, 5, 5, 4, 3, 2, 1]
    }
  }
};

/**
 * Configurazione Warm-up Dinamico Specifico
 */
export const DYNAMIC_WARMUP = {
  patterns: {
    // Warm-up per pattern di movimento
    'squat': {
      exercises: ['Cerchi delle Anche', 'Slanci Gambe', 'Squat a Corpo Libero', 'Goblet Squat Isometrico'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    },
    'hip_hinge': {
      exercises: ['Hip Hinge', 'Good Morning Leggero', 'Stacco con Bastone', 'Ponte Glutei'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    },
    'horizontal_push': {
      exercises: ['Cerchi Braccia', 'Aperture con Elastico', 'Piegamenti Plus', 'Piegamenti Inclinati'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    },
    'horizontal_pull': {
      exercises: ['Cerchi Braccia', 'Aperture con Elastico', 'Retrazioni Scapolari', 'Face Pull Leggero'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    },
    'vertical_push': {
      exercises: ['Cerchi Spalle', 'Wall Slides', 'Alzate Y-T-W', 'Pike Isometrico'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    },
    'vertical_pull': {
      exercises: ['Sospensione Passiva', 'Trazioni Scapolari', 'Pulldown con Elastico', 'Sospensione Attiva'],
      duration: 5,
      sets: 1,
      reps: '10-15'
    }
  },

  // Warm-up generale per full body
  general: {
    exercises: ['Jumping Jacks', 'Corsa sul Posto', 'Cerchi Braccia', 'Cerchi Anche', 'Slanci Gambe', 'Rotazioni Busto'],
    duration: 5,
    sets: 1,
    reps: '20-30'
  }
};

/**
 * Configurazione Active Recovery tra set
 */
export const ACTIVE_RECOVERY = {
  enabled: true,
  minRestForActivation: 90, // Usa active recovery solo se riposo >= 90sec
  exercises: {
    'upper': ['Aperture con Elastico', 'Face Pull Leggero', 'Cerchi Braccia', 'Rotazione Toracica'],
    'lower': ['Cerchi Anca', 'Slanci Gambe', 'Cerchi Caviglie', 'Attivazione Glutei'],
    'core': ['Dead Bug', 'Bird Dog', 'Plank Isometrico', 'Plank Laterale']
  },
  duration: 30, // secondi di active recovery
  intensity: 'very_light'
};

/**
 * Configurazione Deload Automatico
 */
export const AUTO_DELOAD = {
  triggers: {
    // Trigger basati su RPE trend
    highRPETrend: {
      threshold: 8.5, // RPE medio > 8.5
      consecutiveSessions: 3, // Per 3+ sessioni
      action: 'deload_week'
    },
    // Trigger basati su performance
    performanceDecline: {
      repsDeclinePercent: 15, // Calo reps > 15%
      weightDeclinePercent: 10, // Calo peso > 10%
      consecutiveSessions: 2,
      action: 'deload_week'
    },
    // Trigger basati su recupero
    poorRecovery: {
      sorenessLevel: 7, // Dolore muscolare persistente > 7/10
      sleepQualityThreshold: 5, // Qualità sonno < 5/10
      consecutiveDays: 4,
      action: 'light_session'
    }
  },
  deloadProtocol: {
    volumeReduction: 40, // -40% volume
    intensityReduction: 10, // -10% intensità
    durationWeeks: 1,
    focusOn: ['technique', 'mobility', 'recovery']
  }
};

/**
 * Configurazione Progressione Adattiva
 */
export const ADAPTIVE_PROGRESSION = {
  // Tipi di progressione
  types: {
    linear: {
      description: 'Aumento costante ogni sessione',
      weightIncrement: { upper: 1.25, lower: 2.5 }, // kg
      repsIncrement: 1,
      applicableTo: ['beginner', 'intermediate']
    },
    double_progression: {
      description: 'Prima aumenta reps, poi peso quando raggiungi top range',
      repsRange: { min: 8, max: 12 },
      weightIncrementOnMax: { upper: 1.25, lower: 2.5 },
      applicableTo: ['beginner', 'intermediate', 'advanced']
    },
    wave: {
      description: 'Progressione a onde (3 settimane up, 1 deload)',
      weeklyIntensityProgression: [85, 90, 95, 70], // % of working max
      applicableTo: ['intermediate', 'advanced']
    },
    dup: {
      description: 'Daily Undulating Periodization',
      dailyVariation: {
        day1: { reps: '3-5', intensity: 'heavy' },
        day2: { reps: '8-12', intensity: 'moderate' },
        day3: { reps: '12-15', intensity: 'light' }
      },
      applicableTo: ['intermediate', 'advanced']
    },
    autoregulated: {
      description: 'Basato su RPE/RIR del giorno',
      targetRPE: 8,
      adjustmentPerRPEPoint: 2.5, // % peso
      applicableTo: ['intermediate', 'advanced']
    }
  },

  // Logica di selezione progressione
  selectProgression: (level: string, goal: string, experience: number) => {
    if (level === 'beginner') return 'linear';
    if (goal === 'strength' || goal === 'forza') return 'wave';
    if (goal === 'muscle_gain' || goal === 'ipertrofia') return 'double_progression';
    if (experience > 24) return 'autoregulated'; // 24+ mesi
    return 'double_progression';
  }
};

/**
 * Logica contestuale per tecniche
 */
export const CONTEXTUAL_LOGIC = {
  // Palestra affollata - più superset per efficienza
  crowdedGym: {
    preferSupersets: true,
    avoidMachineHogging: true,
    preferBodyweight: true,
    suggestOffPeakTimes: true
  },

  // Poca attrezzatura a casa
  limitedEquipment: {
    preferSameEquipmentSupersets: true, // Superset con stessa attrezzatura
    useMoreBodyweight: true,
    longerTUT: true, // Compensa carico basso con TUT alto
    moreReps: true // Range reps più alto
  },

  // Poco tempo
  timeLimited: {
    useSupersets: true,
    useGiantSets: true,
    shorterRest: true,
    prioritizeCompounds: true,
    skipIsolation: true
  }
};

/**
 * Determina quali tecniche applicare in base al contesto
 */
export function selectTechniques(
  goal: string,
  level: string,
  sessionDuration?: number,
  muscularFocus?: string | string[],
  equipment?: any,
  context?: { crowded?: boolean; limitedEquipment?: boolean }
): {
  superset: ReturnType<typeof shouldUseSupersets>;
  intensification: string[];
  tut: string[];
  finisher: string | null;
  warmup: string[];
  activeRecovery: boolean;
  progression: string;
} {
  const superset = shouldUseSupersets(goal, level, sessionDuration, muscularFocus);

  // Seleziona tecniche di intensificazione
  const intensification: string[] = [];
  if (level !== 'beginner') {
    const goalLower = goal.toLowerCase();

    if (['muscle_gain', 'massa', 'ipertrofia'].includes(goalLower)) {
      intensification.push('drop_set', 'myo_reps');
      if (level === 'advanced') intensification.push('rest_pause', 'mechanical_drop_set');
    }
    if (['strength', 'forza'].includes(goalLower) && level === 'advanced') {
      intensification.push('cluster_set', 'rest_pause');
    }
  }

  // Seleziona tecniche TUT
  const tut: string[] = ['tempo']; // Tempo sempre disponibile
  if (level !== 'beginner') {
    const goalLower = goal.toLowerCase();
    if (['muscle_gain', 'massa', 'ipertrofia'].includes(goalLower)) {
      tut.push('eccentric_focus', 'one_and_half_reps', 'isometric_hold');
    }
    if (['strength', 'forza'].includes(goalLower)) {
      tut.push('pause_reps', 'eccentric_focus');
    }
  }

  // Seleziona finisher
  let finisher: string | null = null;
  const goalLower = goal.toLowerCase();
  if (['fat_loss', 'dimagrimento', 'toning', 'conditioning'].includes(goalLower)) {
    finisher = level === 'beginner' ? 'amrap' : (Math.random() > 0.5 ? 'tabata' : 'emom');
  }

  // Warm-up patterns basati sugli esercizi del giorno
  const warmup = ['general']; // Sempre warm-up generale

  // Active recovery se riposo lungo
  const activeRecovery = level !== 'beginner' && (sessionDuration || 60) >= 45;

  // Progressione
  const progression = ADAPTIVE_PROGRESSION.selectProgression(level, goal, 12); // Default 12 mesi esperienza

  return {
    superset,
    intensification,
    tut,
    finisher,
    warmup,
    activeRecovery,
    progression
  };
}

/**
 * Genera warm-up dinamico basato sugli esercizi del giorno
 */
export function generateDynamicWarmup(exercises: any[]): any[] {
  const patterns = new Set<string>();

  // Estrai i pattern dagli esercizi
  exercises.forEach(ex => {
    if (ex.pattern) patterns.add(ex.pattern.toLowerCase());
  });

  const warmupExercises: any[] = [];

  // Aggiungi warm-up generale
  warmupExercises.push({
    name: 'General Warm-up',
    type: 'warmup',
    exercises: DYNAMIC_WARMUP.general.exercises,
    duration: DYNAMIC_WARMUP.general.duration,
    notes: 'Riscaldamento generale cardiovascolare e mobilità'
  });

  // Aggiungi warm-up specifico per ogni pattern
  patterns.forEach(pattern => {
    const patternWarmup = DYNAMIC_WARMUP.patterns[pattern as keyof typeof DYNAMIC_WARMUP.patterns];
    if (patternWarmup) {
      warmupExercises.push({
        name: `Warm-up ${pattern.replace('_', ' ')}`,
        type: 'warmup',
        exercises: patternWarmup.exercises,
        sets: patternWarmup.sets,
        reps: patternWarmup.reps,
        notes: `Attivazione specifica per ${pattern}`
      });
    }
  });

  return warmupExercises;
}

/**
 * Genera finisher metabolico
 */
export function generateMetabolicFinisher(type: string, level: string): any {
  const finisher = METABOLIC_FINISHERS[type as keyof typeof METABOLIC_FINISHERS];
  if (!finisher) return null;

  // Calculate duration based on finisher type
  let duration: number;

  if ('duration' in finisher && finisher.duration) {
    // AMRAP, EMOM have explicit duration
    duration = level === 'beginner'
      ? finisher.duration.min || 5
      : level === 'intermediate'
        ? Math.round((finisher.duration.min + finisher.duration.max) / 2)
        : finisher.duration.max || 10;
  } else if ('rounds' in finisher && 'workSeconds' in finisher && 'restSeconds' in finisher) {
    // Tabata: calculate from rounds * (work + rest)
    const totalSeconds = finisher.rounds * (finisher.workSeconds + finisher.restSeconds);
    duration = Math.round(totalSeconds / 60);
  } else {
    // Ladder or other: use default
    duration = level === 'beginner' ? 5 : level === 'intermediate' ? 8 : 10;
  }

  return {
    name: finisher.name,
    type: 'finisher',
    notation: finisher.notation,
    duration: `${duration} min`,
    description: finisher.description,
    exercises: 'exercises' in finisher ? finisher.exercises : [],
    notes: `Finisher metabolico - ${finisher.name}`
  };
}

/**
 * Applica notazione tecniche agli esercizi
 */
export function applyTechniqueNotation(
  exercise: any,
  techniques: { intensification: string[]; tut: string[] },
  setNumber: number,
  totalSets: number
): any {
  const result = { ...exercise };
  const notations: string[] = [];

  // Applica intensificazione solo sull'ultimo set
  if (setNumber === totalSets && techniques.intensification.length > 0) {
    const technique = techniques.intensification[Math.floor(Math.random() * techniques.intensification.length)];
    const techConfig = INTENSIFICATION_TECHNIQUES[technique as keyof typeof INTENSIFICATION_TECHNIQUES];
    if (techConfig) {
      notations.push(techConfig.notation);
      result.lastSetTechnique = technique;
    }
  }

  // Applica TUT sempre se selezionato
  if (techniques.tut.includes('tempo')) {
    const tempoPattern = TUT_TECHNIQUES.tempo.patterns.hypertrophy;
    result.tempo = tempoPattern;
    notations.push(`T:${tempoPattern}`);
  }

  if (notations.length > 0) {
    result.notes = result.notes
      ? `${result.notes} | ${notations.join(' ')}`
      : notations.join(' ');
  }

  return result;
}

// ============================================================================
// CONSTANTS - GOAL CONFIGURATIONS
// ============================================================================

export const GOAL_CONFIGS: Record<string, any> = {
  strength: {
    name: 'Forza',
    repsRange: '3-5',
    rest: { compound: 180, accessory: 150, isolation: 120, core: 90 },
    intensity: 'high',
    focus: 'progressive_difficulty',
    setsMultiplier: 1.0,
    notes: 'Progressione verso esercizi più difficili',
    homeStrategy: 'skill_progression',
    unlockThreshold: 12,
    startReps: 3,
    weeklyProgression: 'linear_first_set'
  },
  forza: {
    name: 'Forza',
    repsRange: '3-5',
    rest: { compound: 180, accessory: 150, isolation: 120, core: 90 },
    intensity: 'high',
    focus: 'progressive_difficulty',
    setsMultiplier: 1.0,
    notes: 'Progressione verso esercizi più difficili',
    homeStrategy: 'skill_progression',
    unlockThreshold: 12,
    startReps: 3,
    weeklyProgression: 'linear_first_set'
  },
  muscle_gain: {
    name: 'Ipertrofia',
    repsRange: '12-25',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'high',
    focus: 'time_under_tension',
    setsMultiplier: 1.2,
    notes: 'TUT, Superset, Giant Set',
    homeStrategy: 'time_under_tension',
    techniques: ['tempo_313', 'superset', 'giant_set', 'dropset'],
    targetRIR: 1
  },
  massa: {
    name: 'Ipertrofia',
    repsRange: '8-12',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'high',
    focus: 'time_under_tension',
    setsMultiplier: 1.2,
    notes: 'Focus ipertrofia',
    homeStrategy: 'time_under_tension',
    targetRIR: 1
  },
  ipertrofia: {
    name: 'Ipertrofia',
    repsRange: '8-12',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'high',
    focus: 'time_under_tension',
    setsMultiplier: 1.2,
    notes: 'Focus ipertrofia',
    homeStrategy: 'time_under_tension',
    targetRIR: 1
  },
  toning: {
    name: 'Tonificazione',
    repsRange: '15-25',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'medium',
    focus: 'controlled_volume',
    setsMultiplier: 1.0,
    notes: 'Range simile ipertrofia ma controllato',
    homeStrategy: 'controlled_tempo',
    targetRIR: 3,
    metabolicFinisher: {
      enabled: true,
      mode: 'finisher'
    }
  },
  tonificazione: {
    name: 'Tonificazione',
    repsRange: '15-25',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'medium',
    focus: 'controlled_volume',
    setsMultiplier: 1.0,
    notes: 'Range simile ipertrofia ma controllato',
    homeStrategy: 'controlled_tempo',
    targetRIR: 3,
    metabolicFinisher: {
      enabled: true,
      mode: 'finisher'
    }
  },
  fat_loss: {
    name: 'Dimagrimento',
    intensity: 'medium-high',
    focus: 'rpe_timed_circuits',
    metabolicCircuit: {
      enabled: true,
      mode: 'standalone',
      rpeTarget: 8,
      rpeEmergencyStop: 10,
      earlyStopThreshold: 15,
      timeoutMax: {
        beginner: 45,
        intermediate: 60,
        advanced: 75
      },
      duration: {
        finisher: {
          beginner: { base: 5, progression: 1, max: 8 },
          intermediate: { base: 6, progression: 1, max: 10 },
          advanced: { base: 8, progression: 1, max: 12 }
        },
        standalone: {
          beginner: { base: 12, progression: 2, max: 20 },
          intermediate: { base: 18, progression: 2, max: 26 },
          advanced: { base: 24, progression: 3, max: 36 }
        }
      },
      restBetweenRounds: {
        finisher: 0,
        standalone: {
          beginner: 90,
          intermediate: 60,
          advanced: 45
        }
      },
      exercisesCount: {
        finisher: 4,
        standalone: 6
      },
      rotation: {
        sessionsBeforeRotation: 3,
        strategy: 'pool_shift'
      },
      deloadMultiplier: 0.6
    },
    patternSequence: {
      finisher: ['lower_push', 'upper_push', 'core_dynamic', 'cardio_burst'],
      standalone: ['lower_push', 'upper_push', 'lower_pull', 'upper_pull', 'core_dynamic', 'cardio_burst']
    },
    includesCardio: true,
    cardioFrequency: 0,
    notes: 'Circuiti RPE-based, cambio esercizio a RPE 8, rotazione ogni 3 sessioni',
    homeStrategy: 'rpe_timed_circuits',
    circuitFormat: true
  },
  dimagrimento: {
    name: 'Dimagrimento',
    intensity: 'medium-high',
    focus: 'rpe_timed_circuits',
    metabolicCircuit: {
      enabled: true,
      mode: 'standalone',
      rpeTarget: 8,
      rpeEmergencyStop: 10,
      earlyStopThreshold: 15,
      timeoutMax: {
        beginner: 45,
        intermediate: 60,
        advanced: 75
      },
      duration: {
        finisher: {
          beginner: { base: 5, progression: 1, max: 8 },
          intermediate: { base: 6, progression: 1, max: 10 },
          advanced: { base: 8, progression: 1, max: 12 }
        },
        standalone: {
          beginner: { base: 12, progression: 2, max: 20 },
          intermediate: { base: 18, progression: 2, max: 26 },
          advanced: { base: 24, progression: 3, max: 36 }
        }
      },
      restBetweenRounds: {
        finisher: 0,
        standalone: {
          beginner: 90,
          intermediate: 60,
          advanced: 45
        }
      },
      exercisesCount: {
        finisher: 4,
        standalone: 6
      },
      rotation: {
        sessionsBeforeRotation: 3,
        strategy: 'pool_shift'
      },
      deloadMultiplier: 0.6
    },
    patternSequence: {
      finisher: ['lower_push', 'upper_push', 'core_dynamic', 'cardio_burst'],
      standalone: ['lower_push', 'upper_push', 'lower_pull', 'upper_pull', 'core_dynamic', 'cardio_burst']
    },
    includesCardio: true,
    cardioFrequency: 0,
    notes: 'Circuiti RPE-based, cambio esercizio a RPE 8, rotazione ogni 3 sessioni',
    homeStrategy: 'rpe_timed_circuits',
    circuitFormat: true
  },
  performance: {
    name: 'Performance Sportiva',
    repsRange: '4-8',
    rest: { compound: 180, accessory: 120, isolation: 90, core: 90 },
    intensity: 'explosive',
    focus: 'power_quality',
    setsMultiplier: 1.0,
    notes: 'Esplosività controllata - qualità > quantità',
    homeStrategy: 'plyometric_explosive',
    explosiveFocus: true
  },
  sport_performance: {
    name: 'Performance Sportiva',
    repsRange: '4-8',
    rest: { compound: 180, accessory: 120, isolation: 90, core: 90 },
    intensity: 'explosive',
    focus: 'power_quality',
    setsMultiplier: 1.0,
    notes: 'Esplosività controllata',
    homeStrategy: 'plyometric_explosive',
    explosiveFocus: true
  },
  motor_recovery: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore, progressione: difficoltà → carico → ROM',
    homeStrategy: 'mobility_strength',
    painThreshold: true,
    progressionOrder: ['difficulty', 'load', 'rom']
  },
  recupero_motorio: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore',
    homeStrategy: 'mobility_strength',
    painThreshold: true
  },
  endurance: {
    name: 'Resistenza',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'medium',
    focus: 'endurance',
    setsMultiplier: 1.0,
    notes: 'Alta frequenza, bassa intensità',
    homeStrategy: 'high_rep_circuits'
  },
  resistenza: {
    name: 'Resistenza',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'medium',
    focus: 'endurance',
    setsMultiplier: 1.0,
    notes: 'Alta frequenza, bassa intensità',
    homeStrategy: 'high_rep_circuits'
  },
  general_fitness: {
    name: 'Fitness Generale',
    repsRange: '10-15',
    rest: { compound: 90, accessory: 60, isolation: 45, core: 45 },
    intensity: 'moderate',
    focus: 'balanced',
    setsMultiplier: 1.0,
    notes: 'Programma bilanciato',
    homeStrategy: 'balanced'
  },
  benessere: {
    name: 'Benessere',
    repsRange: '10-15',
    rest: { compound: 90, accessory: 60, isolation: 45, core: 45 },
    intensity: 'moderate',
    focus: 'balanced',
    setsMultiplier: 1.0,
    notes: 'Programma bilanciato',
    homeStrategy: 'balanced'
  },
  pregnancy: {
    name: 'Gravidanza',
    repsRange: '12-15',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low',
    focus: 'safety',
    setsMultiplier: 0.7,
    notes: 'Sicurezza prima di tutto',
    homeStrategy: 'safe_controlled'
  },
  gravidanza: {
    name: 'Gravidanza',
    repsRange: '12-15',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low',
    focus: 'safety',
    setsMultiplier: 0.7,
    notes: 'Sicurezza prima di tutto',
    homeStrategy: 'safe_controlled'
  },
  disability: {
    name: 'Adattato',
    repsRange: '10-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-medium',
    focus: 'adaptation',
    setsMultiplier: 0.8,
    notes: 'Adattamenti specifici',
    homeStrategy: 'adapted'
  },
  disabilita: {
    name: 'Adattato',
    repsRange: '10-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-medium',
    focus: 'adaptation',
    setsMultiplier: 0.8,
    notes: 'Adattamenti specifici',
    homeStrategy: 'adapted'
  }
};

// ============================================================================
// CONSTANTS - METABOLIC CIRCUIT EXERCISE POOLS
// ============================================================================

export const METABOLIC_EXERCISES: Record<string, Record<string, Record<string, string[]>>> = {
  beginner: {
    lower_push: {
      poolA: ['Squat Bodyweight', 'Wall Sit', 'Squat Parziale'],
      poolB: ['Step-up Basso', 'Lunge Statico', 'Squat Box'],
      poolC: ['Squat Isometrico', 'Glute Bridge March', 'Calf Raise']
    },
    upper_push: {
      poolA: ['Push-up Ginocchia', 'Incline Push-up', 'Wall Push-up'],
      poolB: ['Push-up Negativo', 'Plank to Push-up', 'Diamond Push-up Ginocchia'],
      poolC: ['Shoulder Tap', 'Pike Push-up Facile', 'Push-up Hold']
    },
    lower_pull: {
      poolA: ['Glute Bridge', 'Good Morning BW', 'Single Leg Glute Bridge'],
      poolB: ['Hip Hinge', 'Romanian DL BW', 'Prone Leg Curl'],
      poolC: ['Fire Hydrant', 'Donkey Kick', 'Clamshell']
    },
    upper_pull: {
      poolA: ['Inverted Row Alta', 'Band Pull-apart', 'Prone Y-raise'],
      poolB: ['Superman', 'Reverse Snow Angel', 'Scapular Squeeze'],
      poolC: ['Doorway Row', 'Towel Row Isometrico', 'Band Face Pull']
    },
    core_dynamic: {
      poolA: ['Dead Bug', 'Bird Dog', 'Plank Hold'],
      poolB: ['Toe Touch', 'Bicycle Lento', 'Side Plank'],
      poolC: ['Cat-Cow Dinamico', 'Pallof Press BW', 'Hollow Hold Facile']
    },
    cardio_burst: {
      poolA: ['Marching in Place', 'Step Touch', 'Low Jumping Jack'],
      poolB: ['High Knees Lento', 'Butt Kicks', 'Side Step'],
      poolC: ['Skater Lento', 'Squat to Stand', 'Arm Circles Veloce']
    }
  },
  intermediate: {
    lower_push: {
      poolA: ['Goblet Squat', 'Lunge Alternato', 'Squat Jump Controllato'],
      poolB: ['Sumo Squat', 'Reverse Lunge', 'Box Jump Basso'],
      poolC: ['Bulgarian Split Squat', 'Curtsy Lunge', 'Squat Pulse']
    },
    upper_push: {
      poolA: ['Push-up Standard', 'Pike Push-up', 'Diamond Push-up'],
      poolB: ['Archer Push-up', 'Decline Push-up', 'Spiderman Push-up'],
      poolC: ['Staggered Push-up', 'T Push-up', 'Hindu Push-up']
    },
    lower_pull: {
      poolA: ['Romanian Deadlift BW', 'Single Leg RDL', 'Hip Thrust'],
      poolB: ['Good Morning', 'Kickstand RDL', 'Glute Bridge March'],
      poolC: ['Nordic Curl Negativo', 'Slider Leg Curl', 'Frog Pump']
    },
    upper_pull: {
      poolA: ['Inverted Row', 'Band Row', 'Face Pull'],
      poolB: ['Towel Row', 'Prone I-Y-T', 'Doorway Stretch Row'],
      poolC: ['Renegade Row BW', 'Reverse Plank', 'Scap Pull-up']
    },
    core_dynamic: {
      poolA: ['Mountain Climber', 'Plank to Push-up', 'Russian Twist'],
      poolB: ['V-up Parziale', 'Bicycle Crunch', 'Plank Jack'],
      poolC: ['Dead Bug Avanzato', 'Bear Crawl', 'Side Plank Dip']
    },
    cardio_burst: {
      poolA: ['Burpee Senza Salto', 'High Knees', 'Jumping Jack'],
      poolB: ['Skater', 'Tuck Jump', 'Speed Skater'],
      poolC: ['Star Jump', 'Squat Thrust', 'Seal Jack']
    }
  },
  advanced: {
    lower_push: {
      poolA: ['Jump Squat', 'Lunge Jump', 'Pistol Assistito'],
      poolB: ['Box Jump', 'Broad Jump', 'Shrimp Squat'],
      poolC: ['180 Jump Squat', 'Scissor Lunge', 'Skater Squat']
    },
    upper_push: {
      poolA: ['Clap Push-up', 'Pike Push-up Elevato', 'Pseudo Planche Push-up'],
      poolB: ['Superman Push-up', 'Aztec Push-up', 'Dive Bomber'],
      poolC: ['One-Arm Push-up Assist', 'Typewriter Push-up', 'Explosive Push-up']
    },
    lower_pull: {
      poolA: ['Nordic Curl', 'Single Leg Hip Thrust', 'Sprinter Lunge'],
      poolB: ['Sliding Leg Curl', 'Pistol RDL', 'Deficit RDL'],
      poolC: ['Nordic Curl Iso', 'B-Stance Hip Thrust', 'Reverse Hyper BW']
    },
    upper_pull: {
      poolA: ['Pull-up', 'Muscle-up Negativo', 'Renegade Row'],
      poolB: ['Archer Pull-up', 'L-Sit Pull-up', 'Commando Pull-up'],
      poolC: ['Typewriter Pull-up', 'Clapping Pull-up', 'Front Lever Tuck']
    },
    core_dynamic: {
      poolA: ['V-up', 'Hanging Knee Raise', 'Ab Wheel'],
      poolB: ['Toes to Bar', 'Dragon Flag Negativo', 'Windshield Wiper'],
      poolC: ['L-Sit', 'Hanging Leg Raise', 'Planche Lean']
    },
    cardio_burst: {
      poolA: ['Burpee Completo', 'Box Jump Alto', 'Sprint in Place'],
      poolB: ['Devil Press BW', 'Broad Jump Continuo', 'Plyo Lunge'],
      poolC: ['Burpee Box Jump', 'Double Under Immaginario', 'Sprawl']
    }
  }
};

// Pain area exclusions for metabolic exercises
const METABOLIC_PAIN_EXCLUSIONS: Record<string, string[]> = {
  knee: ['Jump Squat', 'Lunge Jump', 'Box Jump', 'Burpee', 'Skater',
         'Pistol', 'Tuck Jump', 'Broad Jump', 'Scissor Lunge', 'Squat Jump'],
  lower_back: ['Good Morning', 'Romanian', 'Superman', 'Burpee',
               'V-up', 'Dragon Flag', 'Hanging Leg Raise'],
  shoulder: ['Pike Push-up', 'Handstand', 'Planche', 'Muscle-up',
             'Archer Push-up', 'Superman Push-up', 'Dive Bomber'],
  wrist: ['Push-up', 'Plank', 'Bear Crawl', 'Burpee', 'Mountain Climber'],
  ankle: ['Jump Squat', 'Box Jump', 'Skater', 'Calf Raise', 'Lunge Jump'],
  hip: ['Lunge', 'Bulgarian', 'Pistol', 'Squat Profondo', 'Hip Thrust'],
  elbow: ['Push-up', 'Diamond Push-up', 'Tricep Dip', 'Skull Crusher'],
  neck: ['Burpee', 'Mountain Climber', 'Plank to Push-up'],
  upper_back: ['Pull-up', 'Row', 'Renegade', 'Superman']
};

// ============================================================================
// CONSTANTS - PERFORMANCE SPORT CONFIGS
// ============================================================================

export const PERFORMANCE_SPORT_CONFIGS: Record<string, any> = {
  calcio: {
    name: 'Calcio',
    focus: ['accelerazione', 'cambio_direzione', 'salto_verticale', 'endurance_anaerobica'],
    roles: {
      portiere: {
        priority: ['esplosività_laterale', 'salto_verticale', 'core_stability'],
        exercises: [
          'Balzo Laterale',
          'Box Jump Laterale',
          'Salto Monopodalico',
          'Plank con Spostamento Laterale',
          'Lancio Palla Medica Laterale'
        ]
      },
      difensore: {
        priority: ['forza_massimale', 'accelerazione', 'duelli_aerei'],
        exercises: [
          'Squat Jump',
          'Salto in Lungo',
          'Box Jump',
          'Nordic Curl',
          'Push Press'
        ]
      },
      centrocampista: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'accelerazione'],
        exercises: [
          'Shuffle Laterale',
          'Slalom tra Coni',
          'Burpee con Salto',
          'Squat Jump',
          'Intervalli HIIT'
        ]
      },
      attaccante: {
        priority: ['accelerazione_esplosiva', 'salto_verticale', 'sprint'],
        exercises: [
          'Salto in Profondità',
          'Partenza Sprint',
          'Balzo Monopodalico',
          'Box Jump',
          'Girata al Petto (se palestra)'
        ]
      }
    }
  },

  basket: {
    name: 'Basket',
    focus: ['salto_verticale', 'forza_esplosiva_gambe', 'core_rotation'],
    roles: {
      playmaker: {
        priority: ['accelerazione', 'cambio_direzione', 'endurance'],
        exercises: [
          'Balzo Laterale',
          'Slalom tra Coni',
          'Squat Jump',
          'Sprint Intervallati',
          'Box Jump'
        ]
      },
      ala: {
        priority: ['salto_verticale', 'accelerazione', 'forza_esplosiva'],
        exercises: [
          'Salto in Profondità',
          'Box Jump',
          'Salto in Lungo',
          'Balzo Monopodalico',
          'Piegamenti Esplosivi'
        ]
      },
      centro: {
        priority: ['forza_massimale', 'salto_verticale', 'contatto_fisico'],
        exercises: [
          'Box Jump',
          'Nordic Curl',
          'Push Press',
          'Squat Jump Pesante',
          'Plank con Sovraccarico'
        ]
      }
    }
  },

  tennis: {
    name: 'Tennis',
    focus: ['rotazione_core', 'accelerazione_laterale', 'esplosività_gambe'],
    roles: {
      singolo: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'rotazione_core'],
        exercises: [
          'Shuffle Laterale',
          'Rotazione con Palla Medica',
          'Squat Jump',
          'Plank con Rotazione',
          'Sprint Intervallati'
        ]
      },
      doppio: {
        priority: ['esplosività', 'forza_core', 'reattività'],
        exercises: [
          'Balzo Laterale',
          'Lancio Palla Medica',
          'Box Jump',
          'Plank con Tocco Spalla',
          'Burpees'
        ]
      }
    }
  },

  pallavolo: {
    name: 'Pallavolo',
    focus: ['salto_verticale', 'esplosività_spalle', 'core_stability'],
    roles: {
      schiacciatore: {
        priority: ['salto_verticale_massimo', 'esplosività_spalle', 'atterraggio'],
        exercises: [
          'Salto in Profondità',
          'Box Jump Alto',
          'Piegamenti Pliometrici',
          'Nordic Curl per Atterraggio',
          'Lancio Palla Medica Sopra la Testa'
        ]
      },
      centrale: {
        priority: ['salto_verticale', 'forza_massimale_gambe', 'muro'],
        exercises: [
          'Box Jump',
          'Squat Jump',
          'Salto in Lungo',
          'Salto Monopodalico',
          'Plank Isometrico'
        ]
      },
      libero: {
        priority: ['reattività', 'accelerazione_laterale', 'endurance'],
        exercises: [
          'Shuffle Laterale',
          'Slalom tra Coni',
          'Burpees',
          'Squat Jump Veloce',
          'Plank Dinamico'
        ]
      }
    }
  },

  nuoto: {
    name: 'Nuoto',
    focus: ['forza_core', 'esplosività_gambe', 'resistenza_spalle'],
    roles: {
      velocista: {
        priority: ['esplosività', 'forza_gambe', 'core_stability'],
        exercises: [
          'Squat Jump',
          'Box Jump',
          'Plank Isometrico',
          'Calci Flutter',
          'Lancio Palla Medica'
        ]
      },
      fondista: {
        priority: ['endurance', 'efficienza_movimento', 'core'],
        exercises: [
          'Plank Dinamico',
          'Calci Flutter Prolungati',
          'Hollow Body Hold',
          'Squat Resistenza',
          'Calci Stile Nuoto'
        ]
      }
    }
  },

  rugby: {
    name: 'Rugby',
    focus: ['forza_massimale', 'potenza', 'resistenza_contatto'],
    roles: {
      avanti: {
        priority: ['forza_massimale', 'potenza_mischia', 'resistenza'],
        exercises: [
          'Squat Pesante',
          'Push Press',
          'Nordic Curl',
          'Plank con Sovraccarico',
          'Spinta Slitta'
        ]
      },
      trequarti: {
        priority: ['accelerazione', 'cambio_direzione', 'sprint'],
        exercises: [
          'Partenza Sprint',
          'Balzo Laterale',
          'Box Jump',
          'Slalom tra Coni',
          'Salto in Lungo'
        ]
      }
    }
  }
};

// ============================================================================
// CONSTANTS - MOTOR RECOVERY GOALS
// ============================================================================

export const MOTOR_RECOVERY_GOALS: Record<string, any> = {
  'neck_mobility': {
    name: 'Recupero Collo - Mobilità',
    exercises: [
      { name: 'Flessione/Estensione Collo', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Lento e controllato' },
      { name: 'Inclinazione Laterale Cervicale', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Inclinazione laterale' },
      { name: 'Rotazione Collo', sets: 3, reps: '15 per lato', rest: 45, weight: null, notes: 'Rotazione controllata' },
      { name: 'Spallucce', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Spallucce lente' },
      { name: 'Retrazione Scapolare', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Spalle indietro' },
      { name: 'Rientro Mento', sets: 3, reps: '15-20', rest: 45, weight: null, notes: 'Mento in dentro' }
    ]
  },
  'neck_stability': {
    name: 'Recupero Collo - Stabilità',
    exercises: [
      { name: 'Tenuta Isometrica Collo (Neutro)', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Tenuta posizione neutra' },
      { name: 'Isometrico Cervicale in Flessione', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza in avanti' },
      { name: 'Isometrico Cervicale in Estensione', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza indietro' },
      { name: 'Isometrico Cervicale Laterale', sets: 3, reps: '25s per lato', rest: 60, weight: null, notes: 'Resistenza laterale' },
      { name: 'Attivazione Trapezio con Elastico', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Trapezio superiore' },
      { name: 'Cobra Prono Isometrico', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Estensione dolce' }
    ]
  },
  'ankle_stability': {
    name: 'Stabilità Caviglia',
    exercises: [
      { name: 'Equilibrio su Una Gamba', sets: 3, reps: '30-60s', rest: 60, weight: null, notes: 'Su una gamba' },
      { name: 'Cerchi Caviglie', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Dorsiflessione Caviglia da Seduto', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Flessione dorsale' },
      { name: 'Calf Raises Monopodalico', sets: 3, reps: '12-15', rest: 90, weight: null, notes: 'Single leg' },
      { name: 'Tavoletta Propriocettiva', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Propriocezione' },
      { name: 'Allenamento Propriocettivo', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Equilibrio' }
    ]
  },
  'knee_stability': {
    name: 'Stabilità Ginocchio',
    exercises: [
      { name: 'Tenuta Isometrica Quadricipite', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Quadricipiti statici' },
      { name: 'Estensione Ginocchio Ridotta', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Range limitato' },
      { name: 'Attivazione Vasto Mediale', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Vasto mediale' },
      { name: 'Ponte Glutei Isometrico', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Ponte statico' },
      { name: 'Equilibrio Monopodalico', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Equilibrio su gamba' },
      { name: 'Step Up Recupero', sets: 3, reps: '10 per lato', rest: 90, weight: null, notes: 'Scalini bassi' }
    ]
  },
  'hip_mobility': {
    name: 'Mobilità Anca',
    exercises: [
      { name: 'Allungamento Flessori Anca', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Allungamento flessori' },
      { name: 'Posizione del Piccione', sets: 3, reps: '60s', rest: 90, weight: null, notes: 'Posizione piccione' },
      { name: 'Clamshell', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Aperture anca' },
      { name: 'Rotazioni Anca', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Rotazioni controllate' },
      { name: 'Ponte Attivazione Glutei', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Attivazione glutei' },
      { name: 'Allungamento Profondo Anca', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Allungamento profondo' }
    ]
  },
  'shoulder_stability': {
    name: 'Stabilità Spalla',
    exercises: [
      { name: 'Piegamenti Scapolari', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Spalla protetta' },
      { name: 'Retrazione Scapole', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Contrazione scapola' },
      { name: 'Rotazione Esterna Prono', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Rotazione esterna' },
      { name: 'Aperture con Elastico', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Elastico strappo' },
      { name: 'Sospensione Passiva', sets: 3, reps: '20-30s', rest: 90, weight: null, notes: 'Tenuta sbarra' },
      { name: 'Spallucce Isometriche', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Spallucce statiche' }
    ]
  },
  'lower_back_rehabilitation': {
    name: 'Riabilitazione Schiena',
    exercises: [
      { name: 'Bird Dog', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Coordinazione core' },
      { name: 'Dead Bug', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Schiena protetta' },
      { name: 'Plank Modificato', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Plank sicuro' },
      { name: 'Ponte Glutei', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Ponte completo' },
      { name: 'Gatto-Mucca', sets: 3, reps: '10', rest: 60, weight: null, notes: 'Mobilità vertebrale' },
      { name: 'Posizione del Bambino', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Posizione riposo' }
    ]
  },
  'wrist_mobility': {
    name: 'Mobilità Polso',
    exercises: [
      { name: 'Cerchi Polso', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Allungamento Flessori Polso', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Flessori' },
      { name: 'Allungamento Estensori Polso', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Estensori' },
      { name: 'Pronazione/Supinazione', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Pronazione/supinazione' },
      { name: 'Tenuta Polso al Muro', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Isometrico' },
      { name: 'Curl Polso Leggero', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Carico leggero' }
    ]
  }
};

// ============================================================================
// CONSTANTS - EXERCISE PROGRESSIONS
// ============================================================================

export const EXERCISE_PROGRESSIONS: Record<string, Record<string, any[]>> = {
  'Squat': {
    strength: [
      { name: 'Squat Completo', level: 1, unlockReps: 12 },
      { name: 'Squat Bulgaro', level: 2, unlockReps: 12 },
      { name: 'Skater Squat', level: 3, unlockReps: 12 },
      { name: 'Pistol Assistito', level: 4, unlockReps: 12 },
      { name: 'Step Up senza Appoggio', level: 5, unlockReps: 12 },
      { name: 'Pistol Completo', level: 6, unlockReps: 15 }
    ],
    muscle_gain: [
      { name: 'Squat Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Squat Bulgaro Tempo 3-1-3', level: 2, reps: '12-20' },
      { name: 'Pistol Assistito Tempo 3-1-3', level: 3, reps: '12-20' },
      { name: 'Pistol Completo Tempo 3-1-3', level: 4, reps: '12-25' }
    ],
    fat_loss: [
      { name: 'Jump Squat', level: 1, reps: '15-20' },
      { name: 'Jump Squat Alternato', level: 2, reps: '15-20' },
      { name: 'Pistol Squat Jump', level: 3, reps: '12-15' }
    ],
    performance: [
      { name: 'Jump Squat Esplosivo', level: 1, reps: '4-8' },
      { name: 'Box Jump', level: 2, reps: '4-8' },
      { name: 'Depth Jump', level: 3, reps: '4-6' }
    ]
  },
  'Push-up': {
    strength: [
      { name: 'Push-up Standard', level: 1, unlockReps: 12 },
      { name: 'Push-up Larghe', level: 2, unlockReps: 12 },
      { name: 'Push-up Strette', level: 3, unlockReps: 12 },
      { name: 'Diamond Push-up', level: 4, unlockReps: 12 },
      { name: 'Archer Push-up', level: 5, unlockReps: 12 },
      { name: 'One-Arm Push-up', level: 6, unlockReps: 15 }
    ],
    muscle_gain: [
      { name: 'Push-up Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Diamond Push-up Tempo', level: 2, reps: '12-20' },
      { name: 'Archer Push-up Tempo', level: 3, reps: '10-15' },
      { name: 'Pseudo Planche Push-up', level: 4, reps: '8-12' }
    ],
    fat_loss: [
      { name: 'Push-up Veloci', level: 1, reps: '15-20' },
      { name: 'Clap Push-up', level: 2, reps: '12-15' },
      { name: 'Plyo Push-up', level: 3, reps: '10-15' }
    ],
    performance: [
      { name: 'Clap Push-up', level: 1, reps: '4-8' },
      { name: 'Plyometric Push-up', level: 2, reps: '4-8' },
      { name: 'Superman Push-up', level: 3, reps: '3-6' }
    ]
  },
  'Trazioni': {
    strength: [
      { name: 'Dead Hang + Scapular Pulls', level: 1, unlockReps: 12 },
      { name: 'Australian Pull-up', level: 2, unlockReps: 12 },
      { name: 'Negative Pull-ups (5-10s)', level: 3, unlockReps: 12 },
      { name: 'Assisted Pull-ups (band)', level: 4, unlockReps: 12 },
      { name: 'Pull-ups / Chin-ups', level: 5, unlockReps: 12 },
      { name: 'Archer Pull-ups', level: 6, unlockReps: 12 },
      { name: 'One-Arm Pull-up Assistito', level: 7, unlockReps: 8 },
      { name: 'One-Arm Pull-up Completo', level: 8, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Inverted Row Tempo', level: 1, reps: '12-20' },
      { name: 'Pull-up Tempo 3-1-3', level: 2, reps: '12-20' },
      { name: 'L-Sit Pull-up', level: 3, reps: '8-15' },
      { name: 'Archer Pull-up Tempo', level: 4, reps: '6-12' }
    ],
    fat_loss: [
      { name: 'Australian Pull-up Veloci', level: 1, reps: '15-20' },
      { name: 'Pull-up Esplosive', level: 2, reps: '12-15' }
    ],
    performance: [
      { name: 'Pull-up Esplosiva', level: 1, reps: '4-8' },
      { name: 'Kipping Pull-up', level: 2, reps: '6-10' },
      { name: 'Muscle-up', level: 3, reps: '3-6' }
    ]
  },
  'Affondi': {
    strength: [
      { name: 'Affondo Statico', level: 1, unlockReps: 12 },
      { name: 'Affondo Camminato', level: 2, unlockReps: 12 },
      { name: 'Squat Bulgaro', level: 3, unlockReps: 12 },
      { name: 'Pistol Squat Assistito', level: 4, unlockReps: 12 },
      { name: 'Pistol Squat Completo', level: 5, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Squat Bulgaro Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Pistol Assistito Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Affondo Saltato', level: 1, reps: '15-20' },
      { name: 'Pistol Jump', level: 2, reps: '10-12' }
    ],
    performance: [
      { name: 'Affondo Saltato Esplosivo', level: 1, reps: '6-10' },
      { name: 'Pistol Jump', level: 2, reps: '4-6' }
    ]
  }
};

// ============================================================================
// CONSTANTS - BODYWEIGHT PROGRESSIONS
// ============================================================================

export const BODYWEIGHT_PROGRESSIONS: Record<string, Record<number, string>> = {
  'Squat': {
    1: 'Squat Assistito',
    2: 'Squat Completo',
    3: 'Jump Squat',
    4: 'Pistol Assistito',
    5: 'Pistol Completo'
  },
  'Panca': {
    1: 'Push-up su Ginocchia',
    2: 'Push-up Standard',
    3: 'Push-up Mani Strette',
    4: 'Archer Push-up',
    5: 'One-Arm Push-up'
  },
  'Trazioni': {
    1: 'Floor Pull (asciugamano)',
    2: 'Inverted Row 45°',
    3: 'Inverted Row 30°',
    4: 'Australian Pull-up',
    5: 'Pull-up Completa'
  },
  'Press': {
    1: 'Plank to Pike',
    2: 'Pike Push-up',
    3: 'Pike Push-up Elevato',
    4: 'Handstand Assistito',
    5: 'Handstand Push-up'
  },
  'Stacco': {
    1: 'Affondi',
    2: 'Squat Bulgaro',
    3: 'Single Leg Deadlift',
    4: 'Jump Lunge',
    5: 'Pistol Squat'
  }
};

// ============================================================================
// HELPER FUNCTIONS - GENERAL
// ============================================================================

export function isBodyweightExercise(exerciseName: string): boolean {
  const bodyweightKeywords = [
    'corpo libero', 'bodyweight', 'push-up', 'pull-up', 'trazioni', 'dips',
    'plank', 'hollow body', 'superman', 'handstand', 'pike push-up',
    'diamond push-up', 'archer push-up', 'nordic curl', 'pistol squat',
    'jump', 'burpee', 'mountain climber', 'flutter kick', 'bicycle crunch',
    'leg raise', 'australian pull-up', 'inverted row', 'floor pull',
    'dead hang', 'scapular', 'floor slide', 'bird dog', 'l-sit', 'assistito',
    'squat bulgaro', 'affondi', 'glute bridge', 'wall sit', 'calf raises',
    'chin-up', 'negative', 'isometric', 'hold', 'ytw', 'mobility', 'stretch'
  ];

  const name = exerciseName.toLowerCase();
  return bodyweightKeywords.some(keyword => name.includes(keyword));
}

function hasWeightedEquipment(equipment: any): boolean {
  if (!equipment) return false;
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  );
}

function getBaseLoads(assessments: any[]): Record<string, number> {
  if (!assessments || !Array.isArray(assessments)) {
    console.warn('[PROGRAM] assessments undefined, using defaults');
    return { squat: 50, deadlift: 60, bench: 40, pull: 30, press: 30 };
  }

  const findLoad = (exercise: string): number => {
    const assessment = assessments.find((a) =>
      a.exerciseName?.toLowerCase().includes(exercise.toLowerCase())
    );
    return assessment ? assessment.oneRepMax : 50;
  };

  return {
    squat: findLoad('squat'),
    deadlift: findLoad('stacco'),
    bench: findLoad('panca'),
    pull: findLoad('trazioni') || findLoad('pull'),
    press: findLoad('press') || findLoad('spalle')
  };
}

function calculateTrainingWeight(oneRM: number, targetReps: number, RIR: number = 2): number | null {
  if (!oneRM || oneRM === 0) return null;
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  return Math.round(weight / 2.5) * 2.5;
}

// ============================================================================
// HELPER FUNCTIONS - SCREENING & ADAPTATION
// ============================================================================

function calculateSleepReduction(hours: number): number {
  if (hours < 5) return 0.7;
  if (hours < 6) return 0.80;
  if (hours < 7) return 0.90;
  if (hours <= 9) return 1.0;
  return 0.95;
}

function calculateStressReduction(stressLevel: number): number {
  if (stressLevel <= 1) return 1.0;
  if (stressLevel === 2) return 0.95;
  if (stressLevel === 3) return 0.90;
  if (stressLevel === 4) return 0.80;
  return 0.60;
}

function generateScreeningWarnings(sleepHours: number, stressLevel: number, painAreas: string[]): string[] {
  const warnings: string[] = [];
  if (sleepHours < 6) warnings.push('Poco sonno: riduci volume e intensità');
  if (stressLevel >= 4) warnings.push('Stress alto: riduci carichi pesanti');
  if (painAreas.length > 0) warnings.push(`Dolori presenti: salta esercizi che li coinvolgono`);
  return warnings;
}

function adjustRepsForDetraining(repsString: number | string, detrainingFactor: number): string {
  if (typeof repsString !== 'string') return String(repsString);
  if (repsString.includes('-')) {
    const [min, max] = repsString.split('-').map(Number);
    const newMin = Math.round(min * detrainingFactor);
    const newMax = Math.round(max * detrainingFactor);
    return `${newMin}-${newMax}`;
  }
  return Math.round(Number(repsString) * detrainingFactor).toString();
}

// ============================================================================
// HELPER FUNCTIONS - SAFETY CHECKS
// ============================================================================

function isExerciseSafeForPregnancy(exerciseName: string): boolean {
  const unsafeExercises = [
    'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
    'Panca Piana', 'Bench Press', 'Floor Press',
    'Stacco', 'Deadlift', 'Stacco Rumeno', 'Good Morning',
    'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
    'Front Squat', 'Back Squat'
  ];
  return !unsafeExercises.some(unsafe =>
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

function isExerciseSafeForDisability(exerciseName: string, _disabilityType?: string): boolean {
  // Per disabilità e recupero motorio: evita esercizi complessi e ad alto impatto
  const unsafeExercises = [
    // Esercizi complessi
    'Clean', 'Snatch', 'Clean & Jerk',
    'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
    'Overhead Squat', 'Snatch Grip Deadlift',
    // Esercizi ad impatto (salti)
    'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge', 'Jumping',
    'Tuck Jump', 'Star Jump', 'Broad Jump', 'Drop Jump',
    // Esercizi esplosivi
    'Plyometric', 'Power Clean', 'Power Snatch'
  ];
  return !unsafeExercises.some(unsafe =>
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

function getPregnancySafeAlternative(exerciseName: string): string {
  const alternatives: Record<string, string> = {
    'Panca Piana': 'Panca Inclinata 45°',
    'Bench Press': 'Incline Press',
    'Stacco': 'Hip Thrust',
    'Deadlift': 'Goblet Squat',
    'Squat': 'Goblet Squat',
    'Crunch': 'Bird Dog',
    // Esercizi esplosivi → Affondi o alternative sicure
    'Jump Squat': 'Affondi',
    'Squat Jump': 'Affondi',
    'Jump Lunge': 'Affondi Statici',
    'Box Jump': 'Step Up',
    'Burpees': 'Squat Completo',
    'Tuck Jump': 'Affondi',
    'Star Jump': 'Squat Completo',
    'Broad Jump': 'Affondi Camminati'
  };
  for (const [unsafe, safe] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(unsafe.toLowerCase())) return safe;
  }
  return exerciseName;
}

function getDisabilitySafeAlternative(exerciseName: string): string {
  const alternatives: Record<string, string> = {
    // Esercizi complessi → versioni semplificate
    'Bulgarian Split Squat': 'Leg Press',
    'Single Leg RDL': 'Seated Leg Curl',
    'Pistol Squat': 'Chair Squat',
    // Esercizi esplosivi → alternative senza impatto
    'Jump Squat': 'Affondi',
    'Squat Jump': 'Affondi',
    'Jump Lunge': 'Affondi Statici',
    'Box Jump': 'Step Up',
    'Burpees': 'Squat Completo',
    'Tuck Jump': 'Affondi',
    'Star Jump': 'Squat Completo',
    'Broad Jump': 'Affondi Camminati',
    'Drop Jump': 'Step Down'
  };
  for (const [complex, simple] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(complex.toLowerCase())) return simple;
  }
  return exerciseName;
}

// ============================================================================
// HELPER FUNCTIONS - BODYWEIGHT CONVERSIONS
// ============================================================================

function convertToBodyweight(exerciseName: string, level: string): string {
  const name = exerciseName.toLowerCase();
  console.log(`[CONVERT] Converting "${exerciseName}" to bodyweight for ${level}`);

  // GAMBE - SQUAT
  if (name.includes('squat') && !name.includes('bulgaro') && !name.includes('pistol')) {
    if (level === 'beginner') return 'Squat Assistito';
    if (level === 'intermediate') return 'Squat Completo';
    return 'Pistol Assistito';
  }

  if (name.includes('leg press')) {
    if (level === 'beginner') return 'Squat Completo';
    if (level === 'intermediate') return 'Squat Bulgaro';
    return 'Pistol Assistito';
  }

  // GAMBE - STACCHI
  if (name.includes('stacco') || name.includes('deadlift')) {
    if (level === 'beginner') return 'Affondi';
    if (level === 'intermediate') return 'Squat Bulgaro';
    return 'Single Leg Deadlift';
  }

  // PUSH - PETTORALI
  if (name.includes('panca') || name.includes('bench') || (name.includes('press') && !name.includes('leg'))) {
    if (level === 'beginner') return 'Push-up su Ginocchia';
    if (level === 'intermediate') return 'Push-up Standard';
    return 'Push-up Mani Strette';
  }

  // PUSH - SPALLE
  if (name.includes('military') || name.includes('shoulder') || name.includes('arnold')) {
    if (level === 'beginner') return 'Pike Push-up';
    if (level === 'intermediate') return 'Pike Push-up Elevato';
    return 'Handstand Push-up Assistito';
  }

  // PULL - TRAZIONI
  if (name.includes('trazioni') || name.includes('pull-up') || name.includes('lat')) {
    if (level === 'beginner') return 'Floor Pull (asciugamano)';
    if (level === 'intermediate') return 'Inverted Row 45°';
    return 'Australian Pull-up';
  }

  // PULL - REMATORE
  if (name.includes('rematore') || name.includes('row')) {
    if (level === 'beginner') return 'Inverted Row 45°';
    if (level === 'intermediate') return 'Inverted Row 30°';
    return 'Inverted Row Orizzontale';
  }

  // CORE
  if (name.includes('plank')) {
    if (level === 'beginner') return 'Plank su Ginocchia';
    if (level === 'intermediate') return 'Plank Standard';
    return 'Plank con Sollevamenti';
  }

  console.warn(`[CONVERT] No bodyweight alternative for: "${exerciseName}"`);
  if (level === 'beginner') return 'Plank';
  if (level === 'intermediate') return 'Mountain Climbers';
  return 'Burpees';
}

// ============================================================================
// PRE-WORKOUT SCREENING
// ============================================================================

/**
 * Conducts pre-workout screening to assess readiness
 */
export function conductPreWorkoutScreening(completedScreening: {
  sleepHours?: number;
  stressLevel?: number;
  painAreas?: string[];
}): ScreeningResult {
  const { sleepHours = 7, stressLevel = 3, painAreas = [] } = completedScreening;

  console.log('[SCREENING] Pre-workout assessment:', { sleepHours, stressLevel, painAreas });

  const sleepReduction = calculateSleepReduction(sleepHours);
  const stressReduction = calculateStressReduction(stressLevel);
  const combinedReduction = Math.min(sleepReduction, stressReduction);

  return {
    screening: {
      sleep: sleepHours,
      stress: stressLevel,
      painAreas: painAreas,
      timestamp: new Date().toISOString()
    },
    recommendations: {
      intensityMultiplier: combinedReduction,
      shouldReduceVolume: combinedReduction < 0.85,
      shouldFocusOnRecovery: painAreas.length > 0 && stressLevel >= 4,
      volumeReduction: combinedReduction < 0.85 ? 1 - combinedReduction : 0
    },
    warnings: generateScreeningWarnings(sleepHours, stressLevel, painAreas)
  };
}

// ============================================================================
// RUNTIME SESSION ADAPTATION
// ============================================================================

/**
 * Adapts a planned session to runtime context (location change, pain, detraining)
 */
export function adaptSessionToRuntimeContext(plannedSession: any, runtimeContext: RuntimeContext): any {
  const {
    actualLocation,
    emergingPainAreas = [],
    currentAssessments = [],
    detrainingFactor = 1.0,
    screeningResults = null
  } = runtimeContext;

  console.log('[RUNTIME] Adapting session to runtime context:', {
    actualLocation,
    emergingPainAreas,
    detrainingFactor,
    hasScreening: !!screeningResults
  });

  let adaptedSession = { ...plannedSession };

  if (actualLocation && actualLocation !== plannedSession.location) {
    console.log(`[RUNTIME] Location change: ${plannedSession.location} → ${actualLocation}`);
    adaptedSession = adaptLocationChange(adaptedSession, actualLocation, currentAssessments);
  }

  if (emergingPainAreas.length > 0) {
    console.log('[RUNTIME] Pain areas detected:', emergingPainAreas);
    adaptedSession = adaptToPain(adaptedSession, emergingPainAreas);
  }

  if (detrainingFactor < 1.0) {
    console.log('[RUNTIME] Detraining factor:', detrainingFactor);
    adaptedSession = recalibrateSessionForDetraining(adaptedSession, detrainingFactor);
  }

  if (screeningResults?.recommendations) {
    console.log('[RUNTIME] Applying screening results:', screeningResults.recommendations);
    adaptedSession = applyScreeningReductions(adaptedSession, screeningResults);
  }

  adaptedSession.isAdapted = JSON.stringify(adaptedSession) !== JSON.stringify(plannedSession);
  adaptedSession.adaptedAt = new Date().toISOString();

  return adaptedSession;
}

function adaptLocationChange(plannedSession: any, newLocation: string, assessments: any[]): any {
  console.log(`[ADAPT] Location change: ${plannedSession.location} → ${newLocation}`);

  const adaptedExercises = plannedSession.exercises.map((exercise: any) => {
    if (plannedSession.location === 'gym' && newLocation === 'home') {
      return convertGymExerciseToHome(exercise, assessments);
    }
    if (plannedSession.location === 'home' && newLocation === 'gym') {
      return convertHomeExerciseToGym(exercise, assessments);
    }
    return exercise;
  });

  return {
    ...plannedSession,
    location: newLocation,
    exercises: adaptedExercises,
    notes: `Runtime: ${plannedSession.location} → ${newLocation}`,
    isAdapted: true
  };
}

function convertGymExerciseToHome(exercise: any, _assessments: any[]): any {
  console.log(`[ADAPT] Gym→Home: ${exercise.name}`);

  const bodyweightName = convertToBodyweight(exercise.name, 'intermediate');

  return {
    ...exercise,
    name: bodyweightName,
    weight: null,
    notes: `${exercise.name} (${exercise.weight}kg) → ${bodyweightName}`
  };
}

function convertHomeExerciseToGym(exercise: any, assessments: any[]): any {
  console.log(`[ADAPT] Home→Gym: ${exercise.name}`);

  if (!isBodyweightExercise(exercise.name)) return exercise;

  const gymMapping: Record<string, string> = {
    'Push-up Standard': 'Panca Piana',
    'Push-up su Ginocchia': 'Panca Piana',
    'Pike Push-up': 'Military Press',
    'Handstand Push-up Assistito': 'Military Press',
    'Dips su Sedia': 'Dips',
    'Floor Pull (asciugamano)': 'Lat Pulldown',
    'Inverted Row 45°': 'Rematore Bilanciere',
    'Australian Pull-up': 'Trazioni Assistite',
    'Squat Assistito': 'Squat',
    'Squat Completo': 'Squat',
    'Affondi': 'Leg Press',
    'Glute Bridge': 'Hip Thrust',
    'Plank': 'Ab Wheel'
  };

  const gymEquivalent = gymMapping[exercise.name] || exercise.name;
  const assessment = assessments?.find(a =>
    exercise.name.toLowerCase().includes(a.exerciseName?.toLowerCase())
  );

  let estimatedWeight = 40;
  if (assessment?.oneRepMax) {
    estimatedWeight = assessment.oneRepMax * 0.7;
  }

  return {
    ...exercise,
    name: gymEquivalent,
    weight: Math.round(estimatedWeight / 2.5) * 2.5,
    notes: `${exercise.name} → ${gymEquivalent} (${estimatedWeight}kg)`
  };
}

function adaptToPain(plannedSession: any, painAreas: NormalizedPainArea[]): any {
  const areaNames = painAreas.map(p => p.area);
  console.log('[ADAPT] Adapting to pain:', areaNames);

  const painContraindications: Record<string, string[]> = {
    'neck': ['neck', 'heavy rows', 'shrugs'],
    'shoulder': ['panca', 'press', 'lateral raise', 'dips', 'push-up', 'pull-up'],
    'lower_back': ['stacco', 'deadlift', 'good morning', 'back squat', 'heavy rows'],
    'knee': ['squat', 'leg press', 'leg curl', 'leg extension', 'lunge', 'jump'],
    'ankle': ['calf raises', 'jump', 'single leg'],
    'wrist': ['curl', 'tricep', 'close grip', 'push-up'],
    'elbow': ['curl', 'tricep', 'close grip']
  };

  const adaptedExercises = plannedSession.exercises
    .map((exercise: any) => {
      const name = exercise.name.toLowerCase();

      for (const painArea of areaNames) {
        const contraindications = painContraindications[painArea] || [];
        if (contraindications.some(keyword => name.includes(keyword))) {
          console.log(`[ADAPT] Removing ${exercise.name} due to ${painArea} pain`);
          return null;
        }
      }

      return {
        ...exercise,
        weight: exercise.weight ? exercise.weight * 0.7 : null,
        sets: Math.max(exercise.sets - 1, 1),
        notes: `Pain-adapted: reduced intensity`
      };
    })
    .filter((ex: any) => ex !== null);

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true,
    notes: `Adapted for: ${areaNames.join(', ')}`
  };
}

function recalibrateSessionForDetraining(plannedSession: any, detrainingFactor: number): any {
  console.log('[ADAPT] Detraining factor:', detrainingFactor);

  const adaptedExercises = plannedSession.exercises.map((exercise: any) => ({
    ...exercise,
    weight: exercise.weight ? Math.round(exercise.weight * detrainingFactor / 2.5) * 2.5 : null,
    reps: adjustRepsForDetraining(exercise.reps, detrainingFactor),
    sets: Math.max(Math.round(exercise.sets * detrainingFactor), 1),
    notes: `Detraining: ${(detrainingFactor * 100).toFixed(0)}%`
  }));

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true
  };
}

function applyScreeningReductions(plannedSession: any, screeningResults: ScreeningResult): any {
  const { intensityMultiplier, shouldReduceVolume } = screeningResults.recommendations;

  const adaptedExercises = plannedSession.exercises.map((exercise: any) => {
    let adaptedExercise = { ...exercise };

    if (exercise.weight) {
      adaptedExercise.weight = Math.round(exercise.weight * intensityMultiplier / 2.5) * 2.5;
    }

    if (shouldReduceVolume) {
      adaptedExercise.sets = Math.max(Math.round(exercise.sets * intensityMultiplier), 1);
    }

    return adaptedExercise;
  });

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true,
    screeningApplied: true,
    notes: `Screening applied: ${(intensityMultiplier * 100).toFixed(0)}%`
  };
}

// ============================================================================
// RECOVERY ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyzes pain persistence across workouts
 */
export function analyzePainPersistence(workouts: any[]): {
  hasPersistentPain: boolean;
  persistentAreas: string[];
} {
  const painAreas: Record<string, number> = {};
  workouts?.forEach((w) => {
    if (w.painLevel && w.painLevel > 3 && w.painLocation) {
      painAreas[w.painLocation] = (painAreas[w.painLocation] || 0) + 1;
    }
  });

  const persistentPain = Object.entries(painAreas)
    .filter(([_, count]) => count >= 3)
    .map(([location]) => location);

  return {
    hasPersistentPain: persistentPain.length > 0,
    persistentAreas: persistentPain
  };
}

/**
 * Checks if user can return to normal training after pain
 */
export function checkRecoveryFromPain(workouts: any[]): {
  canReturnToNormal: boolean;
  painFreeSessions: number;
} {
  const lastThree = workouts?.slice(0, 3) || [];
  const noPainSessions = lastThree.filter((w) => !w.painLevel || w.painLevel <= 2);

  return {
    canReturnToNormal: noPainSessions.length === 3,
    painFreeSessions: noPainSessions.length
  };
}

/**
 * Calculates detraining factor based on time since last workout
 */
export function calculateDetrainingFactor(workouts: any[]): number {
  if (!workouts || workouts.length === 0) return 0.7;

  const lastWorkout = workouts[0];
  const daysSinceLastWorkout = lastWorkout.completedAt
    ? Math.floor((Date.now() - new Date(lastWorkout.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (daysSinceLastWorkout < 7) return 1.0;
  if (daysSinceLastWorkout < 14) return 0.95;
  if (daysSinceLastWorkout < 21) return 0.9;
  if (daysSinceLastWorkout < 30) return 0.85;
  return 0.7;
}

/**
 * Recalibrates program assessments based on detraining
 */
export function recalibrateProgram(assessments: any[], detrainingFactor: number): any[] {
  return assessments?.map((a) => ({
    exerciseName: a.exerciseName,
    oneRepMax: a.oneRepMax * detrainingFactor
  })) || [];
}

// ============================================================================
// CALCULATE VOLUME (DUP System)
// ============================================================================

/**
 * Calcola volume (sets/reps/rest) basato su baseline, goal e dayType
 * Sistema DUP (Daily Undulating Periodization) per variare stimoli
 */
export function calculateVolume(
  baselineMaxReps: number,
  goal: string,
  level: string,
  location: 'gym' | 'home' | 'home_gym' = 'gym',
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
): VolumeResult {
  // Nota: Il livello beginner usa comunque il DUP con parametri più conservativi
  // I baseline del test pratico determinano la difficoltà appropriata per ogni pattern
  // Un "beginner" che fa shrimp squat avrà parametri diversi da uno che fa squat base

  // Sistema DUP per tutti i livelli
  const workingReps = Math.max(4, Math.floor(baselineMaxReps * 0.75));
  let sets = 4;
  let reps = workingReps;
  let rest = '90s';
  let intensity = '75%';
  let notes = '';

  // STRENGTH - Mix di stimoli con FOCUS FORZA
  // Heavy: forza massimale (3-5 reps, 85-90%)
  // Moderate: forza dinamica (5-8 reps, 78-82%) - velocità e tecnica
  // Volume: forza-resistenza (6-10 reps, 75-80%) - capacità di lavoro MA carichi significativi
  if (goal === 'forza' || goal === 'strength') {
    if (location === 'gym') {
      if (dayType === 'heavy') {
        sets = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6;
        reps = Math.max(3, Math.min(workingReps, 5));
        rest = '3-5min';
        intensity = '85-90%';
        notes = 'Forza Massimale - Carico pesante, recupero completo';
      } else if (dayType === 'volume') {
        // VOLUME per FORZA = più serie a carichi ANCORA significativi (non bassi!)
        sets = level === 'beginner' ? 4 : 5;
        reps = Math.max(6, Math.min(workingReps, 10));
        rest = '2-3min';
        intensity = '75-80%';
        notes = 'Forza-Resistenza - Accumulo volume a carichi medi-alti';
      } else {
        // Moderate: forza dinamica con focus tecnico
        sets = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 5;
        reps = Math.max(5, Math.min(workingReps, 8));
        rest = '2-3min';
        intensity = '78-82%';
        notes = 'Forza Dinamica - Velocità e tecnica';
      }
    } else {
      // BODYWEIGHT: focus su progressioni difficili
      if (dayType === 'heavy') {
        sets = level === 'advanced' ? 6 : 5;
        reps = Math.max(3, Math.min(workingReps, 5));
        rest = '3-4min';
        intensity = '85-90%';
        notes = 'Forza Massimale - Progressione difficile';
      } else if (dayType === 'volume') {
        // Volume per forza BW = più serie della progressione attuale
        sets = 5;
        reps = Math.max(6, Math.min(workingReps, 10));
        rest = '2min';
        intensity = '75-80%';
        notes = 'Forza-Resistenza - Accumulo volume';
      } else {
        // Moderate: tecnica e velocità
        sets = level === 'advanced' ? 5 : 4;
        reps = Math.max(5, Math.min(workingReps, 8));
        rest = '2min';
        intensity = '78-82%';
        notes = 'Forza Dinamica - Velocità esecuzione';
      }
    }
  }
  // HYPERTROPHY
  else if (goal === 'massa' || goal === 'massa muscolare' || goal === 'muscle_gain' || goal === 'ipertrofia') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
      reps = workingReps <= 6 ? 6 : 8;
      rest = '90-120s';
      intensity = '80-85%';
      notes = 'Pesante - Tensione meccanica';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6;
      reps = Math.max(10, Math.min(workingReps, 15));
      rest = '60-75s';
      intensity = '65-70%';
      notes = 'Volume - Stress metabolico';
    } else {
      sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
      reps = Math.max(8, Math.min(workingReps, 12));
      rest = '75-90s';
      intensity = '70-80%';
      notes = 'Moderato - Ipertrofia classica';
    }
  }
  // FAT LOSS
  else if (goal === 'fat_loss' || goal === 'tonificazione' || goal === 'dimagrimento' || goal === 'definizione') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(8, Math.min(workingReps, 10));
      rest = '75-90s';
      intensity = '75-80%';
      notes = 'Pesante - Preservazione massa';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 4 : 5;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Volume - Consumo calorico';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(10, Math.min(workingReps, 12));
      rest = '60-75s';
      intensity = '70-75%';
      notes = 'Moderato - Definizione';
    }
  }
  // ENDURANCE
  else if (goal === 'endurance' || goal === 'resistenza') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '60s';
      intensity = '65-70%';
      notes = 'Pesante - Forza resistente';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
      reps = Math.max(15, Math.min(workingReps, 20));
      rest = '30-45s';
      intensity = '55-65%';
      notes = 'Volume - Capacità aerobica';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(12, Math.min(workingReps, 18));
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Moderato - Endurance muscolare';
    }
  }
  // GENERAL FITNESS
  else if (goal === 'general_fitness' || goal === 'benessere') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(6, Math.min(workingReps, 10));
      rest = '90s';
      intensity = '75-80%';
      notes = 'Pesante - Forza generale';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(10, Math.min(workingReps, 15));
      rest = '60-75s';
      intensity = '65-75%';
      notes = 'Volume - Fitness generale';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(8, Math.min(workingReps, 12));
      rest = '75-90s';
      intensity = '70-78%';
      notes = 'Moderato - Bilanciato';
    }
  }
  // SPECIAL GOALS
  else if (goal === 'sport_performance' || goal === 'prestazioni_sportive') {
    sets = 4;
    reps = Math.max(6, Math.min(workingReps, 10));
    rest = '90-120s';
    intensity = '70-80%';
    notes = 'Allenamento sport-specifico';
  } else if (goal === 'motor_recovery' || goal === 'recupero_motorio') {
    sets = 3;
    reps = Math.max(8, Math.min(workingReps, 12));
    rest = '90-120s';
    intensity = '60-70%';
    notes = 'Recupero motorio - Focus tecnica';
  } else if (goal === 'pregnancy' || goal === 'gravidanza') {
    sets = 3;
    reps = Math.max(10, Math.min(workingReps, 15));
    rest = '90-120s';
    intensity = '50-65%';
    notes = 'Gravidanza - Intensità controllata';
  } else if (goal === 'disability' || goal === 'disabilita') {
    sets = 3;
    reps = Math.max(8, Math.min(workingReps, 12));
    rest = '120s';
    intensity = '60-70%';
    notes = 'Adattamenti specifici';
  }
  // DEFAULT
  else {
    sets = 4;
    reps = Math.max(8, Math.min(workingReps, 12));
    rest = '75-90s';
    intensity = '70%';
    notes = 'Programma generale';
  }

  return { sets, reps, rest, intensity, notes };
}

// ============================================================================
// GENERATE PROGRAM (CLIENT-SIDE / BASELINE-AWARE)
// ============================================================================

/**
 * Genera programma personalizzato baseline-aware
 * DEPRECATO: Usare generateProgramWithSplit() per split intelligenti
 */
export function generateProgram(options: ProgramGeneratorOptions): Omit<Program, 'created_at'> {
  const { level, goal, location, trainingType, frequency, baselines, painAreas, equipment } = options;

  console.log('[PROGRAM] GENERAZIONE PROGRAMMA BASELINE-AWARE + EQUIPMENT-AWARE');
  console.log('Location:', location);
  console.log('Training Type:', trainingType);
  console.log('Equipment:', equipment);
  console.log('Baselines dallo screening:', baselines);
  console.log('Dolori validati:', painAreas);

  const exercises: Exercise[] = [];

  const patternMap: Record<string, any> = {
    lower_push: baselines.lower_push,
    horizontal_push: baselines.horizontal_push,
    vertical_push: baselines.vertical_push,
    vertical_pull: baselines.vertical_pull,
    lower_pull: baselines.lower_pull,
    core: baselines.core
  };

  Object.entries(patternMap).forEach(([patternId, baseline]) => {
    if (!baseline) return;

    const baselineReps = baseline.reps;
    const volumeCalc = calculateVolume(baselineReps, goal, level, location as any);

    let exerciseName = baseline.variantName;
    let finalSets = volumeCalc.sets;
    let finalReps = volumeCalc.reps;
    let painNotes = '';
    let wasReplaced = false;

    for (const painEntry of painAreas) {
      const painArea = painEntry.area;
      const severity = painEntry.severity;

      // Passa severity a isExerciseConflicting per attivare sostituzione con dolore 5+
      if (isExerciseConflicting(exerciseName, painArea, severity)) {
        console.log(`Conflitto: ${exerciseName} carica zona dolente: ${painArea} (${severity})`);

        const deload = applyPainDeload(severity, finalSets, finalReps as number, location as any);

        finalSets = deload.sets;
        finalReps = deload.reps;
        painNotes = deload.note;

        if (deload.needsReplacement || (deload.needsEasierVariant && location === 'home')) {
          const alternative = findSafeAlternative(exerciseName, painArea, severity);
          exerciseName = alternative;
          wasReplaced = true;
          painNotes = `${painNotes} | Sostituito da ${baseline.variantName}`;
        }

        break;
      }
    }

    let machineNotes = '';
    if (location === 'gym' && trainingType === 'machines') {
      const originalExercise = exerciseName;
      exerciseName = convertToMachineVariant(exerciseName);

      if (exerciseName !== originalExercise) {
        machineNotes = `Convertito a macchina guidata: ${originalExercise} → ${exerciseName}`;
        console.log(machineNotes);
      }
    }

    exercises.push({
      pattern: patternId as any,
      name: exerciseName,
      sets: finalSets,
      reps: finalReps,
      rest: volumeCalc.rest,
      intensity: volumeCalc.intensity,
      baseline: {
        variantId: baseline.variantId,
        difficulty: baseline.difficulty,
        maxReps: baselineReps
      },
      wasReplaced: wasReplaced,
      notes: [
        volumeCalc.notes,
        `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
        painNotes,
        machineNotes
      ].filter(Boolean).join(' | ')
    });

    console.log(`${exerciseName}: ${finalSets}x${finalReps} @ ${volumeCalc.intensity} ${painNotes ? '(' + painNotes + ')' : ''}`);
  });

  // Aggiungi esercizi correttivi per zone doloranti (MAX 2 per non allungare troppo la sessione)
  const correctiveExercises: Exercise[] = [];
  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const correctives = getCorrectiveExercises(painArea);

    // Limita a MAX 3 correttivi per zona per non aumentare troppo la durata
    const selectedCorrectives = correctives.slice(0, 3);

    for (const corrective of selectedCorrectives) {
      correctiveExercises.push({
        pattern: 'corrective',
        name: corrective,
        sets: 2,
        reps: '10-15',
        rest: '30s',
        intensity: 'Low',
        notes: `Correttivo per ${painArea} - Eseguire a fine sessione`
      });
    }
  }

  exercises.push(...correctiveExercises);

  let split = 'FULL BODY';
  if (frequency >= 5) split = 'PUSH/PULL/LEGS';
  else if (frequency >= 4) split = 'UPPER/LOWER';
  else if (frequency >= 3) split = 'FULL BODY A/B';

  // Verifica se ci sono esercizi sostituiti per dolore
  const hasReplacedExercises = exercises.some(e => e.wasReplaced);
  const hasCorrectives = correctiveExercises.length > 0;

  // Costruisci le note con disclaimer se necessario
  let programNotes = 'Programma personalizzato basato sulle TUE baseline.';

  if (hasReplacedExercises || hasCorrectives) {
    const painZones = painAreas.map(p => p.area).join(', ');
    programNotes = `⚠️ PROGRAMMA ADATTATO PER DOLORE (${painZones})

Alcuni esercizi sono stati sostituiti con alternative a minor impatto sulla zona dolente.
Il focus è su VOLUME/RECUPERO invece che su forza massimale per permettere al corpo di allenarsi senza aggravare il problema.

Quando il dolore scende sotto 3/10, potrai riprendere gli esercizi originali con progressione graduale.

Gli esercizi correttivi a fine sessione aiutano a migliorare la mobilità e stabilità della zona interessata.`;
  }

  return {
    name: `Programma ${level.toUpperCase()} - ${goal}`,
    split: split,
    exercises: exercises,
    level,
    goal,
    frequency,
    notes: programNotes
  };
}

// ============================================================================
// METABOLIC CIRCUIT GENERATOR
// ============================================================================

interface MetabolicCircuitInput {
  goal: string;
  level: string;
  location: string;
  equipment?: any;
  painAreas?: any[];
  sessionNumber?: number;
  weekNumber?: number;
  userPreferences?: any;
}

interface MetabolicCircuitOutput {
  type: 'metabolic_circuit';
  mode: 'finisher' | 'standalone';
  totalDuration: number;
  baseDuration: number;
  weekNumber: number;
  restBetweenRounds: number;
  exerciseCount: number;
  exercises: Array<{
    pattern: string;
    name: string;
    pool: string;
    timeoutMax: number;
    rpeTarget: number;
    alternatives: string[];
  }>;
  sessionNumber: number;
  currentPoolSet: string;
  nextRotationIn: number;
  painAreasFiltered: string[];
  locationAdapted: string;
  equipmentUsed: string[];
}

/**
 * Determina se usare circuito metabolico e in che modalità
 */
function determineCircuitMode(goal: string, userPreferences?: any): { mode: 'finisher' | 'standalone' | 'none'; position: string } {
  if (goal === 'fat_loss' || goal === 'dimagrimento') {
    return { mode: 'standalone', position: 'main' };
  }

  if (goal === 'toning' || goal === 'tonificazione') {
    return { mode: 'finisher', position: 'end' };
  }

  if (userPreferences?.includesFatLossComponent) {
    return { mode: 'finisher', position: 'end' };
  }

  return { mode: 'none', position: '' };
}

/**
 * Ottiene il pool set corrente basato sulla rotazione
 */
function getCurrentPoolSet(sessionNumber: number, rotationConfig: { sessionsBeforeRotation: number }): string {
  const pools = ['poolA', 'poolB', 'poolC'];
  const index = Math.floor(sessionNumber / rotationConfig.sessionsBeforeRotation) % 3;
  return pools[index];
}

/**
 * Esercizi che richiedono attrezzatura specifica
 */
const EQUIPMENT_REQUIREMENTS: Record<string, { requires: string[], alternatives: string[] }> = {
  // Esercizi che richiedono barra trazioni o tavolo robusto
  // Floor Pull (asciugamano) è l'alternativa principale per chi non ha attrezzi
  'Inverted Row': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row (tavolo)': { requires: ['sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row Alta': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row 45°': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row 30°': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row Orizzontale': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Inverted Row Singolo Braccio': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull Singolo Braccio', 'Superman Row', 'Prone Y-raise'] },
  'Rematore Inverso': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Rematore Inverso (tavolo)': { requires: ['sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Rematore Inverso Facilitato': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull Facilitato', 'Prone Y-raise', 'Superman Row'] },
  'Rematore Inverso Presa Larga': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Rematore Inverso Piedi Elevati': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Australian Pull-up': { requires: ['pullupBar', 'sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Australian Pull-up (Tavolo)': { requires: ['sturdyTable'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Pull-up': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Chin-up': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Trazioni': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Trazioni Larghe': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Trazioni Neutre': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Trazioni Strette': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Trazioni Supine': { requires: ['pullupBar'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Hanging Leg Raise': { requires: ['pullupBar'], alternatives: ['Lying Leg Raise', 'V-up'] },
  'Hanging Knee Raise': { requires: ['pullupBar'], alternatives: ['Lying Knee Raise', 'Dead Bug'] },
  // Esercizi che richiedono elastici
  'Band Row': { requires: ['loopBands'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise', 'Superman Row'] },
  'Band Face Pull': { requires: ['loopBands'], alternatives: ['Prone Y-raise', 'Prone I-Y-T'] },
  'Face Pull': { requires: ['loopBands'], alternatives: ['Prone Y-raise', 'Prone I-Y-T'] },
  'Band Pull-apart': { requires: ['loopBands'], alternatives: ['Prone Y-raise', 'Reverse Snow Angel'] },
  'Band Pull-down': { requires: ['loopBands'], alternatives: ['Floor Pull (asciugamano)', 'Prone Y-raise'] },
};

/**
 * Filtra esercizi in base all'equipment disponibile
 */
function filterExercisesByEquipment(exercises: string[], equipment: any): string[] {
  if (!equipment) return exercises;

  return exercises.map(exercise => {
    const requirement = EQUIPMENT_REQUIREMENTS[exercise];
    if (!requirement) return exercise;

    // Controlla se l'utente ha almeno uno degli attrezzi richiesti
    const hasRequired = requirement.requires.some(req => equipment[req]);

    if (hasRequired) return exercise;

    // Altrimenti restituisci la prima alternativa disponibile
    return requirement.alternatives[0] || exercise;
  });
}

/**
 * Filtra esercizi per pain areas
 */
function filterMetabolicExercisesByPain(exercises: Record<string, Record<string, string[]>>, painAreas: any[]): Record<string, Record<string, string[]>> {
  if (!painAreas || painAreas.length === 0) return exercises;

  const filtered: Record<string, Record<string, string[]>> = {};

  Object.keys(exercises).forEach(pattern => {
    filtered[pattern] = {};
    Object.keys(exercises[pattern]).forEach(pool => {
      filtered[pattern][pool] = exercises[pattern][pool].filter(exerciseName => {
        // Check each pain area
        for (const pain of painAreas) {
          const painArea = typeof pain === 'string' ? pain : pain.area;
          const exclusions = METABOLIC_PAIN_EXCLUSIONS[painArea] || [];

          // Check if exercise name contains any excluded term
          for (const exclusion of exclusions) {
            if (exerciseName.toLowerCase().includes(exclusion.toLowerCase())) {
              return false;
            }
          }
        }
        return true;
      });
    });
  });

  return filtered;
}

/**
 * Seleziona un esercizio random dal pool, filtrando per equipment
 */
function selectFromPool(patternPools: Record<string, string[]>, currentPoolSet: string, equipment?: any): string {
  let pool = patternPools[currentPoolSet] || patternPools.poolA || [];
  if (pool.length === 0) return 'Bodyweight Exercise';

  // Filtra in base all'equipment disponibile
  if (equipment) {
    pool = filterExercisesByEquipment(pool, equipment);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Ottiene alternative per un pattern
 */
function getAlternatives(patternPools: Record<string, string[]>, currentPoolSet: string): string[] {
  const pool = patternPools[currentPoolSet] || patternPools.poolA || [];
  return pool.slice(0, 3);
}

/**
 * Genera un circuito metabolico completo
 * Usato per goal fat_loss (standalone) e toning (finisher)
 */
export function generateMetabolicCircuit(input: MetabolicCircuitInput): MetabolicCircuitOutput | null {
  const {
    goal,
    level,
    location,
    equipment,
    painAreas = [],
    sessionNumber = 1,
    weekNumber = 1,
    userPreferences
  } = input;

  // 1. Determina modalità
  const circuitMode = determineCircuitMode(goal, userPreferences);
  if (circuitMode.mode === 'none') return null;

  const mode = circuitMode.mode;

  // 2. Configurazione da GOAL_CONFIGS
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.fat_loss;
  const config = goalConfig.metabolicCircuit || goalConfig.metabolicFinisher || {
    rpeTarget: 8,
    timeoutMax: { beginner: 45, intermediate: 60, advanced: 75 },
    duration: {
      finisher: { beginner: { base: 5, progression: 1, max: 8 }, intermediate: { base: 6, progression: 1, max: 10 }, advanced: { base: 8, progression: 1, max: 12 } },
      standalone: { beginner: { base: 12, progression: 2, max: 20 }, intermediate: { base: 18, progression: 2, max: 26 }, advanced: { base: 24, progression: 3, max: 36 } }
    },
    restBetweenRounds: { finisher: 0, standalone: { beginner: 90, intermediate: 60, advanced: 45 } },
    exercisesCount: { finisher: 4, standalone: 6 },
    rotation: { sessionsBeforeRotation: 3, strategy: 'pool_shift' }
  };

  // 3. Calcola durata corrente
  const levelKey = level as 'beginner' | 'intermediate' | 'advanced';
  const durationConfig = config.duration?.[mode]?.[levelKey] || { base: 10, progression: 2, max: 20 };
  const currentDuration = Math.min(
    durationConfig.base + (durationConfig.progression * (weekNumber - 1)),
    durationConfig.max
  );

  // 4. Seleziona pool esercizi per livello
  const exercisePool = METABOLIC_EXERCISES[levelKey] || METABOLIC_EXERCISES.intermediate;

  // 5. Filtra per pain areas
  const filteredPool = filterMetabolicExercisesByPain(exercisePool, painAreas);

  // 6. Determina pool attivo (rotazione)
  const rotationConfig = config.rotation || { sessionsBeforeRotation: 3 };
  const currentPoolSet = getCurrentPoolSet(sessionNumber, rotationConfig);

  // 7. Pattern sequence
  const patternSequence = goalConfig.patternSequence?.[mode] ||
    (mode === 'finisher'
      ? ['lower_push', 'upper_push', 'core_dynamic', 'cardio_burst']
      : ['lower_push', 'upper_push', 'lower_pull', 'upper_pull', 'core_dynamic', 'cardio_burst']
    );

  // 8. Seleziona esercizi (con filtro equipment)
  const timeoutMax = config.timeoutMax?.[levelKey] || 60;
  const exercises = patternSequence.map((pattern: string) => ({
    pattern,
    name: selectFromPool(filteredPool[pattern] || {}, currentPoolSet, equipment),
    pool: currentPoolSet,
    timeoutMax,
    rpeTarget: config.rpeTarget || 8,
    alternatives: getAlternatives(filteredPool[pattern] || {}, currentPoolSet)
  }));

  // 9. Rest between rounds
  const restBetweenRounds = mode === 'finisher'
    ? 0
    : (config.restBetweenRounds?.standalone?.[levelKey] || 60);

  // 10. Costruisci output
  return {
    type: 'metabolic_circuit',
    mode,
    totalDuration: currentDuration,
    baseDuration: durationConfig.base,
    weekNumber,
    restBetweenRounds,
    exerciseCount: config.exercisesCount?.[mode] || exercises.length,
    exercises,
    sessionNumber,
    currentPoolSet,
    nextRotationIn: rotationConfig.sessionsBeforeRotation - (sessionNumber % rotationConfig.sessionsBeforeRotation),
    painAreasFiltered: painAreas.map((p: any) => typeof p === 'string' ? p : p.area),
    locationAdapted: location,
    equipmentUsed: Object.keys(equipment || {}).filter(k => equipment?.[k])
  };
}

// ============================================================================
// GENERATE PROGRAM WITH SPLIT (ADVANCED)
// ============================================================================

/**
 * Genera programma con split intelligente
 * Sistema avanzato con giorni diversi e varianti
 * Include validazione input e runtime adaptation
 */
export function generateProgramWithSplit(
  options: ProgramGeneratorOptions,
  runtimeContext?: RuntimeContext
): any {
  console.log('[PROGRAM] GENERAZIONE PROGRAMMA CON SPLIT INTELLIGENTE');

  // ============================================
  // STEP 1: VALIDAZIONE INPUT
  // ============================================
  const validation = validateProgramInput({
    level: options.level,
    goal: options.goal,
    goals: options.goals,
    location: options.location as 'gym' | 'home' | 'home_gym',
    trainingType: options.trainingType,
    frequency: options.frequency,
    baselines: options.baselines,
    painAreas: options.painAreas,
    sessionDuration: options.sessionDuration,
    equipment: options.equipment
  });

  // Log validazione
  if (validation.errors.length > 0 || validation.warnings.length > 0) {
    console.log('[VALIDATION]', formatValidationResult(validation));
  }

  // Blocca se errori critici
  if (validation.shouldBlock) {
    console.error('[PROGRAM] BLOCCATO - Errori critici nella validazione');
    return {
      error: true,
      blocked: true,
      validation: validation,
      message: 'Impossibile generare il programma. Risolvi gli errori.',
      errors: validation.errors,
      warnings: validation.warnings
    };
  }

  // Applica correzioni automatiche
  let correctedOptions = options;
  if (validation.corrections.length > 0) {
    correctedOptions = applyCorrections(options, validation.corrections);
    console.log('[VALIDATION] Correzioni applicate:', validation.corrections.length);
  }

  // Fallback baseline se mancanti
  if (!correctedOptions.baselines || Object.keys(correctedOptions.baselines).length === 0) {
    console.log('[VALIDATION] Generazione baseline di default');
    correctedOptions.baselines = generateDefaultBaselines();
  }

  // ============================================
  // STEP 2: RUNTIME ADAPTATION (cambio seduta)
  // ============================================
  let runtimeAdaptation: RuntimeAdaptation | null = null;

  if (runtimeContext) {
    runtimeAdaptation = adaptWorkoutToRuntime(
      {
        location: correctedOptions.location,
        trainingType: correctedOptions.trainingType,
        painAreas: correctedOptions.painAreas,
        sessionDuration: correctedOptions.sessionDuration,
        goal: correctedOptions.goal,
        level: correctedOptions.level
      },
      runtimeContext
    );

    console.log('[RUNTIME] Adaptation:', runtimeAdaptation);

    // Suggerisci riposo se necessario
    if (runtimeAdaptation.shouldSuggestRest) {
      console.warn('[RUNTIME] SUGGERITO GIORNO DI RIPOSO');
      return {
        error: false,
        suggestRest: true,
        runtimeAdaptation: runtimeAdaptation,
        message: 'Le tue condizioni attuali suggeriscono un giorno di riposo o recupero attivo.',
        warnings: runtimeAdaptation.warnings
      };
    }

    // Applica cambio location
    if (runtimeAdaptation.locationChanged && runtimeAdaptation.newLocation) {
      correctedOptions.location = runtimeAdaptation.newLocation as any;
      // Se da gym a home, forza bodyweight
      if (runtimeAdaptation.newLocation === 'home') {
        correctedOptions.trainingType = 'bodyweight';
      }
    }

    // Aggiungi nuovi dolori
    if (runtimeAdaptation.painAdaptations.length > 0) {
      const newPains = runtimeAdaptation.painAdaptations.map(p => ({
        area: p.area,
        severity: p.action === 'exclude' ? 'severe' : 'moderate'
      })) as NormalizedPainArea[];

      correctedOptions.painAreas = [...correctedOptions.painAreas, ...newPains];
    }

    // Applica tempo disponibile ridotto
    if (runtimeAdaptation.timeCompression && runtimeContext.availableTime) {
      correctedOptions.sessionDuration = runtimeContext.availableTime;
    }
  }

  // ============================================
  // STEP 3: LOGGING
  // ============================================
  console.log('Location:', correctedOptions.location);
  console.log('Training Type:', correctedOptions.trainingType);
  console.log('Frequenza:', correctedOptions.frequency);

  if (correctedOptions.goals && correctedOptions.goals.length > 1) {
    console.log('Multi-goal:', correctedOptions.goals.join(' + '));
    console.log('Distribuzione volume:', correctedOptions.goals.length === 2 ? '70-30' : '40-30-30');
  }

  if (correctedOptions.muscularFocus) {
    const focusDisplay = Array.isArray(correctedOptions.muscularFocus)
      ? correctedOptions.muscularFocus.map(f => f.toUpperCase()).join(', ')
      : correctedOptions.muscularFocus.toUpperCase();
    const focusCount = Array.isArray(correctedOptions.muscularFocus) ? correctedOptions.muscularFocus.length : 1;

    console.log(`Focus Muscolare (${focusCount}x):`, focusDisplay);
  }

  if (correctedOptions.sport) {
    console.log(`Sport-Specific: ${correctedOptions.sport.toUpperCase()}`);
    if (correctedOptions.sportRole) {
      console.log(`Ruolo: ${correctedOptions.sportRole}`);
    }
  }

  // ============================================
  // STEP 4: GENERAZIONE SPLIT
  // ============================================
  const weeklySplit = generateWeeklySplit({
    level: correctedOptions.level,
    goal: correctedOptions.goal,
    goals: correctedOptions.goals,
    location: correctedOptions.location as 'gym' | 'home' | 'home_gym',
    trainingType: correctedOptions.trainingType,
    frequency: correctedOptions.frequency,
    baselines: correctedOptions.baselines,
    painAreas: correctedOptions.painAreas,
    muscularFocus: correctedOptions.muscularFocus as string | undefined,
    sessionDuration: correctedOptions.sessionDuration,
    userBodyweight: correctedOptions.userBodyweight
  });

  console.log(`Split generato: ${weeklySplit.splitName}`);
  console.log(`Giorni di allenamento: ${weeklySplit.days.length}`);

  // ============================================
  // STEP 4b: INTEGRAZIONE RUNNING (se abilitato)
  // ============================================
  let finalSplit = weeklySplit;
  if (correctedOptions.runningPrefs?.enabled) {
    console.log('[RUNNING] Integrazione sessioni running nel programma');
    console.log(`[RUNNING] Integrazione: ${correctedOptions.runningPrefs.integration}`);
    console.log(`[RUNNING] Sessioni/settimana: ${correctedOptions.runningPrefs.sessionsPerWeek}`);

    finalSplit = integrateRunningIntoSplit(
      weeklySplit,
      correctedOptions.runningPrefs,
      1, // weekNumber - sempre 1 per la generazione iniziale
      correctedOptions.userAge
    );

    const runningDays = finalSplit.days.filter((d: any) => d.type === 'running' || d.runningSession).length;
    console.log(`[RUNNING] Giorni con running: ${runningDays}`);
  }

  // ============================================
  // STEP 5: APPLICA RUNTIME MULTIPLIERS
  // ============================================
  if (runtimeAdaptation) {
    const { volumeMultiplier, intensityMultiplier } = runtimeAdaptation;

    if (volumeMultiplier < 1 || intensityMultiplier < 1) {
      console.log(`[RUNTIME] Applying multipliers: volume=${volumeMultiplier}, intensity=${intensityMultiplier}`);

      finalSplit.days.forEach((day: any) => {
        if (day.exercises) {
          day.exercises.forEach((exercise: any) => {
            // Riduci sets
            if (volumeMultiplier < 1 && typeof exercise.sets === 'number') {
              exercise.sets = Math.max(2, Math.round(exercise.sets * volumeMultiplier));
            }

            // Aggiungi nota intensità ridotta
            if (intensityMultiplier < 1) {
              const reduction = Math.round((1 - intensityMultiplier) * 100);
              exercise.notes = exercise.notes
                ? `${exercise.notes} | ⚠️ Intensità -${reduction}%`
                : `⚠️ Intensità ridotta del ${reduction}%`;
            }
          });
        }
      });
    }
  }

  // ============================================
  // STEP 5b: LEGS GOAL TYPE ADAPTATION (PHA / REBALANCE)
  // Solo per donne con focus gambe
  // ============================================
  if (correctedOptions.legsGoalType && correctedOptions.gender === 'F') {
    console.log(`[LEGS] Applying legs goal type: ${correctedOptions.legsGoalType}`);

    if (correctedOptions.legsGoalType === 'slimming') {
      // PHA (Peripheral Heart Action) - Drenaggio e circolazione
      console.log('[LEGS] Applying PHA protocol for leg slimming');

      finalSplit.days.forEach((day: any) => {
        // Skip running days (no exercises)
        if (!day.exercises || day.type === 'running') return;

        // Riordina esercizi per alternare upper/lower (PHA style)
        const upperExercises = day.exercises.filter((ex: any) =>
          ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull'].includes(ex.pattern)
        );
        const lowerExercises = day.exercises.filter((ex: any) =>
          ['lower_push', 'lower_pull'].includes(ex.pattern)
        );
        const otherExercises = day.exercises.filter((ex: any) =>
          !['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'lower_push', 'lower_pull'].includes(ex.pattern)
        );

        // Alterna upper/lower
        const phaOrder: any[] = [];
        const maxLen = Math.max(upperExercises.length, lowerExercises.length);
        for (let i = 0; i < maxLen; i++) {
          if (upperExercises[i]) phaOrder.push(upperExercises[i]);
          if (lowerExercises[i]) phaOrder.push(lowerExercises[i]);
        }
        phaOrder.push(...otherExercises);

        // Applica parametri PHA: alte reps, poco riposo
        phaOrder.forEach((ex: any) => {
          ex.reps = '15-20';
          ex.rest = '30-45s';
          ex.notes = ex.notes
            ? `${ex.notes} | 💧 PHA - Circolazione`
            : '💧 PHA - Focus circolazione e drenaggio';
        });

        day.exercises = phaOrder;
        day.name = `${day.name} (PHA)`;
        day.description = day.description
          ? `${day.description} - Protocollo PHA per migliorare circolazione e drenaggio gambe`
          : 'Protocollo PHA per migliorare circolazione e drenaggio gambe';
      });
    } else if (correctedOptions.legsGoalType === 'rebalance') {
      // Riproporzione - Focus upper body, mantenimento lower
      console.log('[LEGS] Applying rebalance protocol for body proportions');

      finalSplit.days.forEach((day: any) => {
        // Skip running days
        if (!day.exercises || day.type === 'running') return;

        day.exercises.forEach((ex: any) => {
          // Aumenta volume upper body
          if (['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull'].includes(ex.pattern)) {
            if (typeof ex.sets === 'number') {
              ex.sets = Math.min(ex.sets + 1, 5); // +1 set, max 5
            }
            // Focus su spalle e schiena per creare V-taper
            if (ex.pattern === 'vertical_push' || ex.pattern === 'horizontal_pull') {
              ex.notes = ex.notes
                ? `${ex.notes} | ⚖️ Focus proporzioni - Priorità`
                : '⚖️ Focus proporzioni - Esercizio prioritario';
            }
          }

          // Riduci volume lower body a mantenimento
          if (['lower_push', 'lower_pull'].includes(ex.pattern)) {
            if (typeof ex.sets === 'number') {
              ex.sets = Math.max(ex.sets - 1, 2); // -1 set, min 2
            }
            ex.notes = ex.notes
              ? `${ex.notes} | 🔄 Mantenimento`
              : '🔄 Mantenimento - Volume ridotto per riproporzione';
          }
        });

        day.name = `${day.name} (Riproporzione)`;
        day.description = day.description
          ? `${day.description} - Focus upper body per bilanciare le proporzioni corporee`
          : 'Focus upper body per bilanciare le proporzioni corporee';
      });
    }
    // 'toning' = programma standard, nessuna modifica
  }

  const allExercises: Exercise[] = [];
  finalSplit.days.forEach((day: any) => {
    if (day.exercises) {
      allExercises.push(...day.exercises);
    }
  });

  // ============================================
  // STEP 6: COSTRUZIONE RISPOSTA
  // ============================================
  const result: any = {
    name: `Programma ${correctedOptions.level.toUpperCase()} - ${correctedOptions.goal}`,
    split: finalSplit.splitName,
    exercises: allExercises,
    level: correctedOptions.level,
    goal: correctedOptions.goal,
    frequency: correctedOptions.frequency,
    notes: `${finalSplit.description}\n\nProgramma personalizzato basato sulle TUE baseline. Ogni giorno ha esercizi diversi per stimoli ottimali.`,
    weeklySplit: finalSplit
  };

  // Aggiungi info validazione se presenti warning
  if (validation.warnings.length > 0) {
    result.validationWarnings = validation.warnings;
  }

  // Aggiungi info correzioni se applicate
  if (validation.corrections.length > 0) {
    result.corrections = validation.corrections;
  }

  // Aggiungi info runtime adaptation
  if (runtimeAdaptation && runtimeAdaptation.warnings.length > 0) {
    result.runtimeWarnings = runtimeAdaptation.warnings;
    result.runtimeAdaptation = {
      locationChanged: runtimeAdaptation.locationChanged,
      volumeMultiplier: runtimeAdaptation.volumeMultiplier,
      intensityMultiplier: runtimeAdaptation.intensityMultiplier,
      exerciseReplacements: runtimeAdaptation.exerciseReplacements
    };
  }

  return result;
}

// ============================================================================
// GENERATE PROGRAM API (SERVER-SIDE ENTRY POINT)
// ============================================================================

/**
 * Entry point principale per generazione programmi (API)
 * Gestisce branching tra: Motor Recovery, Performance, Standard
 */
export function generateProgramAPI(input: any): any {
  const {
    level,
    frequency,
    location,
    equipment,
    painAreas = [],
    assessments = [],
    goal,
    disabilityType,
    sportRole
  } = input;

  console.log('[PROGRAM] ENTRY POINT:', { level, frequency, location, goal, sportRole });

  // RAMO 1: MOTOR RECOVERY
  if (goal === 'motor_recovery' || goal === 'rehabilitation' || goal === 'recupero_motorio') {
    console.log('[PROGRAM] BRANCHING → MOTOR RECOVERY');
    return generateMotorRecoveryProgram({ level, painAreas, location, goal });
  }

  // RAMO 2: PERFORMANCE
  if (goal === 'performance' || goal === 'sport_performance') {
    console.log('[PROGRAM] BRANCHING → PERFORMANCE');
    return generatePerformanceProgram({
      level,
      frequency,
      assessments,
      sportRole,
      location,
      equipment
    });
  }

  // RAMO 3: STANDARD TRAINING
  console.log('[PROGRAM] BRANCHING → STANDARD TRAINING (GOAL-based)');
  return generateStandardProgram({
    level,
    frequency,
    location,
    equipment,
    painAreas,
    assessments,
    goal,
    disabilityType,
    sportRole
  });
}

// ============================================================================
// MOTOR RECOVERY PROGRAM
// ============================================================================

function generateMotorRecoveryProgram(input: any): any {
  const { level, painAreas = [], location, goal } = input;

  console.log('[PROGRAM] generateMotorRecoveryProgram with:', { painAreas, level, goal });

  if (!painAreas || painAreas.length === 0) {
    console.warn('[PROGRAM] No pain areas specified for motor recovery');
    return {
      name: 'Recupero Motorio',
      description: 'Nessun area dolente specificata',
      split: 'motor_recovery',
      daysPerWeek: 0,
      weeklySchedule: [],
      isRecoveryProgram: true
    };
  }

  const weeklySchedule: any[] = [];

  painAreas.forEach((area: string) => {
    const recoveryConfig = MOTOR_RECOVERY_GOALS[area];

    if (!recoveryConfig) {
      console.warn(`[PROGRAM] No recovery config for: ${area}`);
      return;
    }

    weeklySchedule.push({
      dayName: recoveryConfig.name,
      focus: area,
      location: location || 'home',
      exercises: recoveryConfig.exercises.map((ex: any) => ({
        ...ex,
        weight: null,
        notes: 'Recupero motorio - NO carico'
      }))
    });
  });

  return {
    name: `Riabilitazione ${level || 'beginner'} - Recupero Motorio`,
    description: `Programma specifico per: ${painAreas.join(', ')}`,
    split: 'motor_recovery',
    daysPerWeek: painAreas.length,
    weeklySchedule,
    progression: 'low_intensity_stability',
    includesDeload: true,
    deloadFrequency: 2,
    totalWeeks: 4,
    requiresEndCycleTest: false,
    isRecoveryProgram: true
  };
}

// ============================================================================
// PERFORMANCE PROGRAM
// ============================================================================

function generatePerformanceProgram(input: any): any {
  const { level, frequency, assessments, sportRole, location, equipment } = input;

  console.log('[PROGRAM] Performance for:', sportRole, location);

  if (!sportRole || !sportRole.sport) {
    console.warn('[PROGRAM] No sport specified, using generic performance');
    return generateGenericPerformanceProgram(input);
  }

  const sport = sportRole.sport.toLowerCase();
  const role = sportRole.role?.toLowerCase() || 'singolo';

  const sportConfig = PERFORMANCE_SPORT_CONFIGS[sport];
  if (!sportConfig) {
    console.warn(`[PROGRAM] Sport "${sport}" not in Performance configs`);
    return generateGenericPerformanceProgram(input);
  }

  let roleConfig = sportConfig.roles[role];
  if (!roleConfig) {
    console.warn(`[PROGRAM] Role "${role}" not found for ${sport}`);
    const firstRole = Object.keys(sportConfig.roles)[0];
    roleConfig = sportConfig.roles[firstRole];
  }

  console.log(`[PERFORMANCE] ${sportConfig.name} - ${role} - Priority:`, roleConfig.priority);

  const weeklySchedule: any[] = [];

  weeklySchedule.push({
    dayName: `${sportConfig.name} - Esplosività Gambe`,
    location,
    exercises: generatePerformanceLowerBody(roleConfig, location, equipment, level)
  });

  weeklySchedule.push({
    dayName: `${sportConfig.name} - Potenza Busto`,
    location,
    exercises: generatePerformanceUpperBody(roleConfig, location)
  });

  if (frequency >= 3) {
    weeklySchedule.push({
      dayName: `${sportConfig.name} - Conditioning Specifico`,
      location,
      exercises: generatePerformanceConditioning(roleConfig)
    });
  }

  return {
    name: `Performance ${sportConfig.name} - ${role}`,
    description: `Focus: ${roleConfig.priority.join(', ')}`,
    split: 'performance_sport_specific',
    daysPerWeek: frequency,
    location,
    weeklySchedule: weeklySchedule.slice(0, frequency),
    progression: 'progressive_explosive',
    includesDeload: true,
    deloadFrequency: 3,
    totalWeeks: 8,
    requiresEndCycleTest: true,
    sportSpecific: true
  };
}

function generatePerformanceLowerBody(roleConfig: any, location: string, equipment: any, level: string): any[] {
  const exercises: any[] = [];
  const isGym = location === 'gym';

  roleConfig.exercises.filter((ex: string) =>
    ex.includes('Jump') || ex.includes('Squat') || ex.includes('Nordic') || ex.includes('Bound')
  ).forEach((exerciseName: string) => {
    exercises.push({
      name: exerciseName,
      sets: level === 'advanced' ? 5 : 4,
      reps: exerciseName.includes('Jump') || exerciseName.includes('Bound') ? '5-8' : '4-6',
      rest: 180,
      weight: null,
      notes: 'Max esplosività'
    });
  });

  if (isGym) {
    exercises.unshift({
      name: 'Squat Pesante',
      sets: 3,
      reps: '3-5',
      rest: 240,
      weight: 'assessment-based',
      notes: 'Base forza'
    });
  }

  return exercises;
}

function generatePerformanceUpperBody(roleConfig: any, location: string): any[] {
  const exercises: any[] = [];

  roleConfig.exercises.filter((ex: string) =>
    ex.includes('Push') || ex.includes('Medicine Ball') || ex.includes('Slam') || ex.includes('Press')
  ).forEach((exerciseName: string) => {
    exercises.push({
      name: exerciseName,
      sets: 4,
      reps: '6-8',
      rest: 120,
      weight: null,
      notes: 'Potenza'
    });
  });

  exercises.push({
    name: 'Plank Rotation',
    sets: 3,
    reps: '30-45s',
    rest: 60,
    weight: null,
    notes: 'Core stability'
  });

  return exercises;
}

function generatePerformanceConditioning(roleConfig: any): any[] {
  const exercises: any[] = [];

  roleConfig.exercises.filter((ex: string) =>
    ex.includes('Interval') || ex.includes('Shuffle') || ex.includes('Drill') || ex.includes('Sprint')
  ).forEach((exerciseName: string) => {
    exercises.push({
      name: exerciseName,
      sets: exerciseName.includes('Interval') ? 8 : 5,
      reps: exerciseName.includes('Interval') ? '30s on / 30s off' : '10-15',
      rest: 60,
      weight: null,
      notes: 'Conditioning specifico'
    });
  });

  if (exercises.length === 0) {
    exercises.push(
      { name: 'Burpees', sets: 5, reps: '10', rest: 45, weight: null, notes: 'Conditioning' },
      { name: 'Sprint Intervals', sets: 8, reps: '20s on / 40s off', rest: 60, weight: null, notes: 'Anaerobico' }
    );
  }

  return exercises;
}

function generateGenericPerformanceProgram(input: any): any {
  const { level, frequency, location } = input;

  return {
    name: `Performance Generica - ${level}`,
    description: `${frequency}x/settimana, focus esplosività generale`,
    split: 'performance_generic',
    daysPerWeek: frequency,
    location,
    weeklySchedule: [
      {
        dayName: 'Esplosività Gambe',
        location,
        exercises: [
          { name: 'Jump Squat', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Esplosività' },
          { name: 'Broad Jump', sets: 3, reps: '5', rest: 120, weight: null },
          { name: 'Single Leg Hop', sets: 3, reps: '8/lato', rest: 90, weight: null }
        ]
      },
      {
        dayName: 'Potenza Busto',
        location,
        exercises: [
          { name: 'Clap Push-up', sets: 4, reps: '6-8', rest: 180, weight: null },
          { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 90, weight: null },
          { name: 'Plank Dinamico', sets: 3, reps: '45s', rest: 60, weight: null }
        ]
      }
    ].slice(0, frequency),
    progression: 'progressive_explosive',
    totalWeeks: 8
  };
}

// ============================================================================
// STANDARD PROGRAM
// ============================================================================

function generateStandardProgram(input: any): any {
  const {
    level,
    frequency,
    location,
    equipment,
    painAreas = [],
    assessments = [],
    goal,
    disabilityType,
    sportRole,
    userPreferences
  } = input;

  console.log('[PROGRAM] generateStandardProgram with:', { level, frequency, location, goal });

  // Check if this goal uses metabolic circuits
  const metabolicCircuit = generateMetabolicCircuit({
    goal,
    level,
    location: location || 'home',
    equipment,
    painAreas,
    sessionNumber: 1,
    weekNumber: 1,
    userPreferences
  });

  // FAT LOSS: Circuito metabolico come workout principale (standalone)
  if (metabolicCircuit && metabolicCircuit.mode === 'standalone') {
    console.log('[PROGRAM] FAT LOSS MODE: Generating metabolic circuit as main workout');

    // Per fat loss, genera circuiti per ogni giorno
    const weeklySchedule = [];
    for (let i = 0; i < frequency; i++) {
      const dayCircuit = generateMetabolicCircuit({
        goal,
        level,
        location: location || 'home',
        equipment,
        painAreas,
        sessionNumber: i + 1,
        weekNumber: 1,
        userPreferences
      });

      weeklySchedule.push({
        dayName: `Circuito Metabolico ${String.fromCharCode(65 + i)}`,
        location,
        isMetabolicCircuit: true,
        metabolicCircuit: dayCircuit,
        exercises: dayCircuit?.exercises || []
      });
    }

    return {
      name: `Programma Dimagrimento - Circuiti RPE`,
      description: `${frequency}x/settimana - Circuiti metabolici a tempo con cambio esercizio a RPE 8`,
      split: 'metabolic_circuits',
      daysPerWeek: frequency,
      location,
      weeklySchedule,
      progression: 'duration_progressive',
      includesDeload: true,
      deloadFrequency: 4,
      totalWeeks: 8,
      requiresEndCycleTest: false,
      isMetabolicProgram: true,
      metabolicConfig: metabolicCircuit
    };
  }

  // Standard program generation
  let split: string;
  let daysPerWeek: number;

  if (frequency <= 2) {
    split = 'full_body';
    daysPerWeek = frequency;
  } else if (frequency === 3) {
    split = 'full_body';
    daysPerWeek = 3;
  } else if (frequency === 4) {
    split = 'upper_lower';
    daysPerWeek = 4;
  } else if (frequency === 5) {
    split = 'ppl_plus';
    daysPerWeek = 5;
  } else {
    split = 'ppl';
    daysPerWeek = 6;
  }

  let progression: string;
  if (level === 'beginner') progression = 'wave_loading';
  else if (level === 'intermediate') progression = 'ondulata_settimanale';
  else progression = 'ondulata_giornaliera';

  const weeklySchedule = generateWeeklyScheduleAPI(
    split, daysPerWeek, location || 'gym', equipment, painAreas,
    assessments, level, goal, disabilityType, sportRole
  );

  // TONING: Aggiungi finisher metabolico a ogni giornata
  if (metabolicCircuit && metabolicCircuit.mode === 'finisher') {
    console.log('[PROGRAM] TONING MODE: Adding metabolic finisher to each day');

    weeklySchedule.forEach((day: any, index: number) => {
      const finisherCircuit = generateMetabolicCircuit({
        goal,
        level,
        location: location || 'home',
        equipment,
        painAreas,
        sessionNumber: index + 1,
        weekNumber: 1,
        userPreferences
      });

      day.finisher = finisherCircuit;
      day.hasMetabolicFinisher = true;
    });
  }

  const includesDeload = level === 'intermediate' || level === 'advanced';
  const deloadFrequency = includesDeload ? 4 : undefined;
  const requiresEndCycleTest = goal === 'strength' || goal === 'muscle_gain' || goal === 'performance';

  let totalWeeks = 4;
  if (goal === 'strength') totalWeeks = 8;
  else if (goal === 'muscle_gain') totalWeeks = 12;
  else if (goal === 'performance') totalWeeks = 8;
  else if (goal === 'toning' || goal === 'tonificazione') totalWeeks = 8;

  return {
    name: `Programma ${split.toUpperCase()} - ${level}`,
    description: `${daysPerWeek}x/settimana, progressione ${progression}${metabolicCircuit?.mode === 'finisher' ? ' + Finisher Metabolico' : ''}`,
    split,
    daysPerWeek,
    location,
    weeklySchedule,
    progression,
    includesDeload,
    deloadFrequency,
    totalWeeks,
    requiresEndCycleTest,
    hasMetabolicFinisher: metabolicCircuit?.mode === 'finisher'
  };
}

function generateWeeklyScheduleAPI(
  split: string,
  daysPerWeek: number,
  location: string,
  equipment: any,
  painAreas: any[],
  assessments: any[],
  level: string,
  goal: string,
  disabilityType?: string,
  sportRole?: any
): any[] {
  const schedule: any[] = [];
  const baseLoad = getBaseLoads(assessments || []);
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain;
  const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.intermediate;

  const safeExercise = (name: string): string => {
    // Gravidanza: controlli più restrittivi
    if (goal === 'pregnancy' || goal === 'gravidanza') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    }
    // Post-partum: stessi controlli della gravidanza (fase delicata)
    if (goal === 'post_partum' || goal === 'postpartum') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    }
    // Disabilità e recupero motorio: evita esercizi complessi e ad impatto
    if (goal === 'disability' || goal === 'disabilita' ||
        goal === 'motor_recovery' || goal === 'recupero_motorio') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  const createExerciseSimple = (name: string, baseWeight: number, type: string): any => {
    const safeName = safeExercise(name);
    let sets = type === 'compound' ? config.compoundSets : config.accessorySets;
    sets = Math.round(sets * goalConfig.setsMultiplier);
    const rest = goalConfig.rest[type] || (type === 'compound' ? 180 : 120);
    const [minReps, maxReps] = goalConfig.repsRange.split('-').map(Number);
    const reps = type === 'compound' ? `${minReps}-${maxReps}` : `${maxReps}`;

    const isBodyweight = isBodyweightExercise(safeName);
    let weight = null;

    if (!isBodyweight && (location === 'gym' || hasWeightedEquipment(equipment))) {
      if (baseWeight > 0) {
        weight = calculateTrainingWeight(baseWeight, maxReps, config.RIR);
      }
    }

    return {
      name: safeName,
      sets,
      reps,
      rest,
      weight,
      category: type,
      notes: `${goalConfig.name} - ${type === 'compound' ? `RIR ${config.RIR}` : 'Complementare'}`
    };
  };

  if (split === 'full_body') {
    for (let i = 0; i < daysPerWeek; i++) {
      const variant = String.fromCharCode(65 + i); // A, B, C
      const exercises: any[] = [];

      if (!painAreas?.some((p: any) => p === 'knee' || p.area === 'knee')) {
        exercises.push(createExerciseSimple('Squat', baseLoad.squat, 'compound'));
      }
      if (!painAreas?.some((p: any) => p === 'shoulder' || p.area === 'shoulder')) {
        exercises.push(createExerciseSimple('Panca Piana', baseLoad.bench, 'compound'));
      }
      exercises.push(createExerciseSimple('Trazioni', baseLoad.pull, 'compound'));
      if (!painAreas?.some((p: any) => p === 'lower_back' || p.area === 'lower_back')) {
        exercises.push(createExerciseSimple('Stacco Rumeno', baseLoad.deadlift * 0.7, 'accessory'));
      }
      exercises.push(createExerciseSimple('Plank', 0, 'core'));

      schedule.push({
        dayName: `Full Body ${variant}`,
        location,
        exercises
      });
    }
  } else if (split === 'upper_lower') {
    schedule.push({
      dayName: 'Upper A',
      location,
      exercises: [
        createExerciseSimple('Panca Piana', baseLoad.bench, 'compound'),
        createExerciseSimple('Trazioni', baseLoad.pull, 'compound'),
        createExerciseSimple('Military Press', baseLoad.press, 'compound'),
        createExerciseSimple('Curl Bilanciere', baseLoad.bench * 0.3, 'isolation'),
        createExerciseSimple('Tricep Pushdown', baseLoad.bench * 0.3, 'isolation')
      ]
    });
    schedule.push({
      dayName: 'Lower A',
      location,
      exercises: [
        createExerciseSimple('Squat', baseLoad.squat, 'compound'),
        createExerciseSimple('Stacco Rumeno', baseLoad.deadlift * 0.7, 'compound'),
        createExerciseSimple('Leg Curl', baseLoad.squat * 0.3, 'isolation'),
        createExerciseSimple('Leg Extension', baseLoad.squat * 0.3, 'isolation'),
        createExerciseSimple('Calf Raises', baseLoad.squat * 0.5, 'isolation')
      ]
    });
    schedule.push({
      dayName: 'Upper B',
      location,
      exercises: [
        createExerciseSimple('Panca Inclinata', baseLoad.bench * 0.85, 'compound'),
        createExerciseSimple('Rematore Bilanciere', baseLoad.pull * 0.9, 'compound'),
        createExerciseSimple('Arnold Press', baseLoad.press * 0.85, 'compound'),
        createExerciseSimple('Hammer Curl', baseLoad.bench * 0.3, 'isolation'),
        createExerciseSimple('French Press', baseLoad.bench * 0.3, 'isolation')
      ]
    });
    schedule.push({
      dayName: 'Lower B',
      location,
      exercises: [
        createExerciseSimple('Stacco', baseLoad.deadlift, 'compound'),
        createExerciseSimple('Front Squat', baseLoad.squat * 0.8, 'compound'),
        createExerciseSimple('Affondi', baseLoad.squat * 0.6, 'accessory'),
        createExerciseSimple('Nordic Curl', 0, 'accessory'),
        createExerciseSimple('Hip Thrust', baseLoad.squat * 0.8, 'accessory')
      ]
    });
  } else {
    // PPL
    schedule.push({
      dayName: 'Push A',
      location,
      exercises: [
        createExerciseSimple('Panca Piana', baseLoad.bench, 'compound'),
        createExerciseSimple('Military Press', baseLoad.press, 'compound'),
        createExerciseSimple('Panca Inclinata Manubri', baseLoad.bench * 0.7, 'accessory'),
        createExerciseSimple('Alzate Laterali', baseLoad.press * 0.3, 'isolation'),
        createExerciseSimple('Tricep Pushdown', baseLoad.bench * 0.3, 'isolation')
      ]
    });
    schedule.push({
      dayName: 'Pull A',
      location,
      exercises: [
        createExerciseSimple('Stacco', baseLoad.deadlift, 'compound'),
        createExerciseSimple('Trazioni', baseLoad.pull, 'compound'),
        createExerciseSimple('Rematore Bilanciere', baseLoad.pull * 0.9, 'compound'),
        createExerciseSimple('Curl Bilanciere', baseLoad.bench * 0.3, 'isolation'),
        createExerciseSimple('Face Pull', baseLoad.pull * 0.2, 'isolation')
      ]
    });
    schedule.push({
      dayName: 'Legs A',
      location,
      exercises: [
        createExerciseSimple('Squat', baseLoad.squat, 'compound'),
        createExerciseSimple('Stacco Rumeno', baseLoad.deadlift * 0.7, 'compound'),
        createExerciseSimple('Leg Press', baseLoad.squat * 1.3, 'accessory'),
        createExerciseSimple('Leg Curl', baseLoad.squat * 0.3, 'isolation'),
        createExerciseSimple('Leg Extension', baseLoad.squat * 0.3, 'isolation')
      ]
    });

    if (daysPerWeek >= 5) {
      schedule.push({
        dayName: 'Upper',
        location,
        exercises: [
          createExerciseSimple('Dips', 0, 'compound'),
          createExerciseSimple('Chin-up', baseLoad.pull * 0.95, 'compound'),
          createExerciseSimple('Push Press', baseLoad.press * 1.1, 'compound'),
          createExerciseSimple('Face Pull', baseLoad.pull * 0.2, 'isolation'),
          createExerciseSimple('Alzate Laterali', baseLoad.press * 0.3, 'isolation')
        ]
      });
      schedule.push({
        dayName: 'Lower',
        location,
        exercises: [
          createExerciseSimple('Sumo Deadlift', baseLoad.deadlift * 0.9, 'compound'),
          createExerciseSimple('Squat Bulgaro', baseLoad.squat * 0.6, 'compound'),
          createExerciseSimple('Hip Thrust', baseLoad.squat * 0.8, 'accessory'),
          createExerciseSimple('Good Morning', baseLoad.deadlift * 0.5, 'accessory'),
          createExerciseSimple('Calf Raises', baseLoad.squat * 0.5, 'isolation')
        ]
      });
    }

    if (daysPerWeek >= 6) {
      schedule.push({
        dayName: 'Push B',
        location,
        exercises: [
          createExerciseSimple('Panca Inclinata', baseLoad.bench * 0.85, 'compound'),
          createExerciseSimple('Arnold Press', baseLoad.press * 0.85, 'compound'),
          createExerciseSimple('Dips', 0, 'compound'),
          createExerciseSimple('Croci Cavi Alti', baseLoad.bench * 0.3, 'isolation'),
          createExerciseSimple('French Press', baseLoad.bench * 0.3, 'isolation')
        ]
      });
    }
  }

  return schedule.slice(0, daysPerWeek);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Volume calculation
  calculateVolume,

  // Program generation
  generateProgram,
  generateProgramWithSplit,
  generateProgramAPI,

  // Pre-workout screening
  conductPreWorkoutScreening,

  // Runtime adaptation
  adaptSessionToRuntimeContext,

  // Recovery analysis
  analyzePainPersistence,
  checkRecoveryFromPain,
  calculateDetrainingFactor,
  recalibrateProgram,

  // Constants
  GOAL_CONFIGS,
  LEVEL_CONFIG,
  PERFORMANCE_SPORT_CONFIGS,
  MOTOR_RECOVERY_GOALS,
  EXERCISE_PROGRESSIONS,
  BODYWEIGHT_PROGRESSIONS
};
