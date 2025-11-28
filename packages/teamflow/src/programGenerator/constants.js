// ===== IMPORTS =====
import { GOAL_CONFIGS as GOAL_CONFIGS_NEW } from './GOAL_CONFIGS_COMPLETE_CJS.js';

// ===== Costanti e Mappature =====

export const GOAL_CONFIGS = GOAL_CONFIGS_NEW;

// Mappatura progressioni esercizi corpo libero
export const BODYWEIGHT_PROGRESSIONS = {
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

// Configurazioni livelli di allenamento
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

// Configurazioni specifiche di performance sportiva
export const PERFORMANCE_SPORT_CONFIGS = {
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
  }
};

// Motor recovery configuration (collo, etc.)
export const MOTOR_RECOVERY_GOALS = {
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
  // Other motor recovery goal configs similarly defined...
};

console.log('✅ Constants module loaded (ES Modules)');
