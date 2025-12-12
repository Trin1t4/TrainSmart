/**
 * ============================================================================
 * PROGRAM GENERATOR - CONSOLIDATED VERSION
 * ============================================================================
 *
 * Versione unificata del generatore programmi per FitnessFlow e TeamFlow.
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
          'Lateral Bound',
          'Box Jump Lateral',
          'Single Leg Hop',
          'Plank Lateral Shift',
          'Medicine Ball Slam Lateral'
        ]
      },
      difensore: {
        priority: ['forza_massimale', 'accelerazione', 'duelli_aerei'],
        exercises: [
          'Squat Jump',
          'Broad Jump',
          'Box Jump',
          'Nordic Curl',
          'Push Press'
        ]
      },
      centrocampista: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'accelerazione'],
        exercises: [
          'Lateral Shuffle',
          'Cone Drill',
          'Burpee Broad Jump',
          'Jump Squat',
          'HIIT Intervals'
        ]
      },
      attaccante: {
        priority: ['accelerazione_esplosiva', 'salto_verticale', 'sprint'],
        exercises: [
          'Depth Jump',
          'Sprint Start',
          'Single Leg Bound',
          'Box Jump',
          'Power Clean (se gym)'
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
          'Lateral Bound',
          'Cone Drill',
          'Jump Squat',
          'Sprint Intervals',
          'Box Jump'
        ]
      },
      ala: {
        priority: ['salto_verticale', 'accelerazione', 'forza_esplosiva'],
        exercises: [
          'Depth Jump',
          'Box Jump',
          'Broad Jump',
          'Single Leg Bound',
          'Clap Push-up'
        ]
      },
      centro: {
        priority: ['forza_massimale', 'salto_verticale', 'contatto_fisico'],
        exercises: [
          'Box Jump',
          'Nordic Curl',
          'Push Press',
          'Squat Jump pesante',
          'Plank con peso'
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
          'Lateral Shuffle',
          'Medicine Ball Rotation',
          'Jump Squat',
          'Plank Rotation',
          'Sprint Intervals'
        ]
      },
      doppio: {
        priority: ['esplosività', 'forza_core', 'reattività'],
        exercises: [
          'Lateral Bound',
          'Medicine Ball Slam',
          'Box Jump',
          'Plank Shoulder Taps',
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
          'Depth Jump',
          'Box Jump Alto',
          'Plyometric Push-up',
          'Nordic Curl Atterraggio',
          'Medicine Ball Overhead Slam'
        ]
      },
      centrale: {
        priority: ['salto_verticale', 'forza_massimale_gambe', 'muro'],
        exercises: [
          'Box Jump',
          'Squat Jump',
          'Broad Jump',
          'Single Leg Hop',
          'Plank Hold'
        ]
      },
      libero: {
        priority: ['reattività', 'accelerazione_laterale', 'endurance'],
        exercises: [
          'Lateral Shuffle',
          'Cone Drill',
          'Burpees',
          'Jump Squat Veloce',
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
          'Jump Squat',
          'Box Jump',
          'Plank Hold',
          'Flutter Kicks',
          'Medicine Ball Slam'
        ]
      },
      fondista: {
        priority: ['endurance', 'efficienza_movimento', 'core'],
        exercises: [
          'Plank Dinamico',
          'Flutter Kicks Extended',
          'Hollow Body Hold',
          'Squat Endurance',
          'Swimming Kicks'
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
          'Plank Pesante',
          'Sled Push'
        ]
      },
      trequarti: {
        priority: ['accelerazione', 'cambio_direzione', 'sprint'],
        exercises: [
          'Sprint Start',
          'Lateral Bound',
          'Box Jump',
          'Cone Drill',
          'Broad Jump'
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
      { name: 'Neck Flexion/Extension', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Lento e controllato' },
      { name: 'Cervical Lateral Flexion', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Inclinazione laterale' },
      { name: 'Neck Rotation', sets: 3, reps: '15 per lato', rest: 45, weight: null, notes: 'Rotazione controllata' },
      { name: 'Shoulder Shrugs', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Spallucce lente' },
      { name: 'Scapular Retraction Hold', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Spalle indietro' },
      { name: 'Chin Tucks', sets: 3, reps: '15-20', rest: 45, weight: null, notes: 'Mento in dentro' }
    ]
  },
  'neck_stability': {
    name: 'Recupero Collo - Stabilità',
    exercises: [
      { name: 'Isometric Neck Hold (Neutral)', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Tenuta posizione neutra' },
      { name: 'Cervical Isometric Flexion', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza in avanti' },
      { name: 'Cervical Isometric Extension', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza indietro' },
      { name: 'Cervical Isometric Lateral (per lato)', sets: 3, reps: '25s per lato', rest: 60, weight: null, notes: 'Resistenza laterale' },
      { name: 'Trapezius Activation Band Pull-Apart', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Trapezio superiore' },
      { name: 'Prone Cobra Hold', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Estensione dolce' }
    ]
  },
  'ankle_stability': {
    name: 'Stabilità Caviglia',
    exercises: [
      { name: 'Single Leg Stance', sets: 3, reps: '30-60s', rest: 60, weight: null, notes: 'Su una gamba' },
      { name: 'Ankle Circles', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Seated Ankle Dorsiflexion', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Flessione dorsale' },
      { name: 'Calf Raises su Una Gamba', sets: 3, reps: '12-15', rest: 90, weight: null, notes: 'Single leg' },
      { name: 'Balance Board Work', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Propriocezione' },
      { name: 'Proprioceptive Training', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Equilibrio' }
    ]
  },
  'knee_stability': {
    name: 'Stabilità Ginocchio',
    exercises: [
      { name: 'Isometric Quad Hold', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Quadricipiti statici' },
      { name: 'Short Arc Quads', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Range limitato' },
      { name: 'VMO Work', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Vasto mediale' },
      { name: 'Glute Bridge Isometric', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Ponte statico' },
      { name: 'Single Leg Balance', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Equilibrio su gamba' },
      { name: 'Step-Up Recovery', sets: 3, reps: '10 per lato', rest: 90, weight: null, notes: 'Scalini bassi' }
    ]
  },
  'hip_mobility': {
    name: 'Mobilità Anca',
    exercises: [
      { name: 'Hip Flexor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Allungamento flessori' },
      { name: 'Pigeon Pose', sets: 3, reps: '60s', rest: 90, weight: null, notes: 'Posizione piccione' },
      { name: 'Clamshells', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Aperture anca' },
      { name: 'Hip Rotations', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Rotazioni controllate' },
      { name: 'Glute Activation Bridges', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Attivazione glutei' },
      { name: 'Fire Log Stretch', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Allungamento profondo' }
    ]
  },
  'shoulder_stability': {
    name: 'Stabilità Spalla',
    exercises: [
      { name: 'Scapular Push-up', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Spalla protetta' },
      { name: 'Shoulder Blade Squeeze', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Contrazione scapola' },
      { name: 'External Rotation Prone', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Rotazione esterna' },
      { name: 'Band Pull-Apart', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Elastico strappo' },
      { name: 'Dead Hang Hold', sets: 3, reps: '20-30s', rest: 90, weight: null, notes: 'Tenuta sbarra' },
      { name: 'Shoulder Shrugs Isometric', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Spallucce statiche' }
    ]
  },
  'lower_back_rehabilitation': {
    name: 'Riabilitazione Schiena',
    exercises: [
      { name: 'Quadruped Bird Dogs', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Coordinazione core' },
      { name: 'Dead Bugs', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Schiena protetta' },
      { name: 'Modified Planks', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Plank sicuro' },
      { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Ponte completo' },
      { name: 'Cat-Cow Stretches', sets: 3, reps: '10', rest: 60, weight: null, notes: 'Mobilità vertebrale' },
      { name: 'Child Pose Hold', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Posizione riposo' }
    ]
  },
  'wrist_mobility': {
    name: 'Mobilità Polso',
    exercises: [
      { name: 'Wrist Circles', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Wrist Flexor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Flessori' },
      { name: 'Wrist Extensor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Estensori' },
      { name: 'Pronate/Supinate Movements', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Pronazione/supinazione' },
      { name: 'Wall Wrist Holds', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Isometrico' },
      { name: 'Wrist Curls Light', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Carico leggero' }
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
  // BEGINNER: Scheda di ADATTAMENTO ANATOMICO fissa
  if (level === 'beginner') {
    const workingReps = Math.max(8, Math.min(Math.floor(baselineMaxReps * 0.65), 10));

    return {
      sets: 3,
      reps: workingReps,
      rest: '90s',
      intensity: '65%',
      notes: 'Adattamento Anatomico - Focus sulla tecnica'
    };
  }

  // INTERMEDIATE/ADVANCED: Sistema DUP
  const workingReps = Math.max(4, Math.floor(baselineMaxReps * 0.75));
  let sets = 4;
  let reps = workingReps;
  let rest = '90s';
  let intensity = '75%';
  let notes = '';

  // STRENGTH
  if (goal === 'forza' || goal === 'strength') {
    if (location === 'gym') {
      if (dayType === 'heavy') {
        sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
        reps = Math.max(3, Math.min(workingReps, 5));
        rest = '3-5min';
        intensity = '85-90%';
        notes = 'Heavy Day - Forza massimale';
      } else if (dayType === 'volume') {
        sets = level === 'beginner' ? 3 : 4;
        reps = Math.max(10, Math.min(workingReps, 15));
        rest = '90-120s';
        intensity = '65-70%';
        notes = 'Volume Day - Ipertrofia + work capacity';
      } else {
        sets = level === 'beginner' ? 3 : 4;
        reps = Math.max(5, Math.min(workingReps, 6));
        rest = '2-3min';
        intensity = '75-80%';
        notes = 'Moderate Day - Forza submassimale';
      }
    } else {
      if (dayType === 'heavy') {
        sets = level === 'advanced' ? 6 : 5;
        reps = Math.max(3, Math.min(workingReps, 6));
        rest = '2-3min';
        intensity = '80-85%';
        notes = 'Heavy Day - Skill strength';
      } else if (dayType === 'volume') {
        sets = 5;
        reps = Math.max(10, Math.min(workingReps, 15));
        rest = '90s';
        intensity = '60-70%';
        notes = 'Volume Day - Work capacity';
      } else {
        sets = 5;
        reps = Math.max(5, Math.min(workingReps, 6));
        rest = '90-120s';
        intensity = '70-75%';
        notes = 'Moderate Day - Forza submassimale';
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
      notes = 'Heavy Day - Tensione meccanica';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6;
      reps = Math.max(10, Math.min(workingReps, 15));
      rest = '60-75s';
      intensity = '65-70%';
      notes = 'Volume Day - Stress metabolico';
    } else {
      sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
      reps = Math.max(8, Math.min(workingReps, 12));
      rest = '75-90s';
      intensity = '70-80%';
      notes = 'Moderate Day - Ipertrofia classica';
    }
  }
  // FAT LOSS
  else if (goal === 'fat_loss' || goal === 'tonificazione' || goal === 'dimagrimento' || goal === 'definizione') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(8, Math.min(workingReps, 10));
      rest = '75-90s';
      intensity = '75-80%';
      notes = 'Heavy Day - Preservazione massa';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 4 : 5;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Volume Day - Consumo calorico';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(10, Math.min(workingReps, 12));
      rest = '60-75s';
      intensity = '70-75%';
      notes = 'Moderate Day - Definizione';
    }
  }
  // ENDURANCE
  else if (goal === 'endurance' || goal === 'resistenza') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(12, Math.min(workingReps, 15));
      rest = '60s';
      intensity = '65-70%';
      notes = 'Heavy Day - Forza resistente';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
      reps = Math.max(15, Math.min(workingReps, 20));
      rest = '30-45s';
      intensity = '55-65%';
      notes = 'Volume Day - Capacità aerobica';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(12, Math.min(workingReps, 18));
      rest = '45-60s';
      intensity = '60-70%';
      notes = 'Moderate Day - Endurance muscolare';
    }
  }
  // GENERAL FITNESS
  else if (goal === 'general_fitness' || goal === 'benessere') {
    if (dayType === 'heavy') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(6, Math.min(workingReps, 10));
      rest = '90s';
      intensity = '75-80%';
      notes = 'Heavy Day - Forza generale';
    } else if (dayType === 'volume') {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(10, Math.min(workingReps, 15));
      rest = '60-75s';
      intensity = '65-75%';
      notes = 'Volume Day - Fitness generale';
    } else {
      sets = level === 'beginner' ? 3 : 4;
      reps = Math.max(8, Math.min(workingReps, 12));
      rest = '75-90s';
      intensity = '70-78%';
      notes = 'Moderate Day - Bilanciato';
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

      if (isExerciseConflicting(exerciseName, painArea)) {
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

  // Aggiungi esercizi correttivi per zone doloranti
  const correctiveExercises: Exercise[] = [];
  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const correctives = getCorrectiveExercises(painArea);

    for (const corrective of correctives) {
      correctiveExercises.push({
        pattern: 'corrective',
        name: corrective,
        sets: 2,
        reps: '10-15',
        rest: '30s',
        intensity: 'Low',
        notes: `Correttivo per ${painArea} - Eseguire con focus sulla qualità`
      });
    }
  }

  exercises.push(...correctiveExercises);

  let split = 'FULL BODY';
  if (frequency >= 5) split = 'PUSH/PULL/LEGS';
  else if (frequency >= 4) split = 'UPPER/LOWER';
  else if (frequency >= 3) split = 'FULL BODY A/B';

  return {
    name: `Programma ${level.toUpperCase()} - ${goal}`,
    split: split,
    exercises: exercises,
    level,
    goal,
    frequency,
    notes: `Programma personalizzato basato sulle TUE baseline. Parti da dove sei realmente, non da template generici.`
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
 * Seleziona un esercizio random dal pool
 */
function selectFromPool(patternPools: Record<string, string[]>, currentPoolSet: string): string {
  const pool = patternPools[currentPoolSet] || patternPools.poolA || [];
  if (pool.length === 0) return 'Bodyweight Exercise';
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

  // 8. Seleziona esercizi
  const timeoutMax = config.timeoutMax?.[levelKey] || 60;
  const exercises = patternSequence.map((pattern: string) => ({
    pattern,
    name: selectFromPool(filteredPool[pattern] || {}, currentPoolSet),
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
  // STEP 5: APPLICA RUNTIME MULTIPLIERS
  // ============================================
  if (runtimeAdaptation) {
    const { volumeMultiplier, intensityMultiplier } = runtimeAdaptation;

    if (volumeMultiplier < 1 || intensityMultiplier < 1) {
      console.log(`[RUNTIME] Applying multipliers: volume=${volumeMultiplier}, intensity=${intensityMultiplier}`);

      weeklySplit.days.forEach((day: any) => {
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
      });
    }
  }

  const allExercises: Exercise[] = [];
  weeklySplit.days.forEach((day: any) => {
    allExercises.push(...day.exercises);
  });

  // ============================================
  // STEP 6: COSTRUZIONE RISPOSTA
  // ============================================
  const result: any = {
    name: `Programma ${correctedOptions.level.toUpperCase()} - ${correctedOptions.goal}`,
    split: weeklySplit.splitName,
    exercises: allExercises,
    level: correctedOptions.level,
    goal: correctedOptions.goal,
    frequency: correctedOptions.frequency,
    notes: `${weeklySplit.description}\n\nProgramma personalizzato basato sulle TUE baseline. Ogni giorno ha esercizi diversi per stimoli ottimali.`,
    weeklySplit: weeklySplit
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
