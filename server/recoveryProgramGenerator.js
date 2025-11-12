// ===== RECOVERY PROGRAM GENERATOR =====
// Generatore programmi post-riabilitazione
// Supporta: casa corpo libero, casa con attrezzi, palestra

import { getExerciseForLocation } from './exerciseSubstitutions.js';

// ===== PROGRAMMI PER ZONA E FASE =====

const RECOVERY_PROGRAMS = {
  shoulder: {
    phase1: {
      name: 'Fase 1: Mobilità e Controllo Scapolare',
      weeks: 2,
      frequency: 4,
      exercises: [
        { 
          name_gym: 'Scapular Wall Slides',
          name_home: 'Scapular Wall Slides', // Stesso (solo muro)
          sets: 3, 
          reps: '10-12', 
          rest: 60,
          notes: 'Controllo scapolare lento',
          equipment_needed: null // Corpo libero
        },
        { 
          name_gym: 'Face Pulls Cavi',
          name_home: 'Face Pulls Elastico', // Alternativa casa
          sets: 3, 
          reps: '12-15', 
          rest: 60,
          notes: 'Attivazione posteriori spalla',
          equipment_needed: 'resistance_band' // Serve elastico
        },
        { 
          name_gym: 'Pendulum Swings',
          name_home: 'Pendulum Swings',
          sets: 3, 
          reps: '30s per direzione', 
          rest: 30,
          notes: 'ROM passivo',
          equipment_needed: null
        },
        { 
          name_gym: 'Plank Scapular Protraction',
          name_home: 'Plank Scapular Protraction',
          sets: 3, 
          reps: '8-10', 
          rest: 60,
          notes: 'Stabilità dinamica',
          equipment_needed: null
        },
        { 
          name_gym: 'External Rotation 90/90',
          name_home: 'External Rotation Elastico',
          sets: 3, 
          reps: '10-12', 
          rest: 45,
          notes: 'Cuffia rotatori',
          equipment_needed: 'dumbbell_or_band' // Manubrio o elastico
        }
      ]
    },
    phase2: {
      name: 'Fase 2: Rinforzo Progressivo',
      weeks: 4,
      frequency: 4,
      exercises: [
        { 
          name_gym: 'Push-up',
          name_home: 'Push-up',
          sets: 3, 
          reps: '8-10', 
          rest: 90,
          notes: 'Progressione: ginocchia → standard',
          equipment_needed: null
        },
        { 
          name_gym: 'Band Pull-Aparts',
          name_home: 'Band Pull-Aparts',
          sets: 3, 
          reps: '15-20', 
          rest: 60,
          notes: 'Rinforzo posteriori',
          equipment_needed: 'resistance_band'
        },
        { 
          name_gym: 'Shoulder External Rotation Manubri',
          name_home: 'Shoulder External Rotation Elastico',
          sets: 3, 
          reps: '12-15', 
          rest: 60,
          notes: 'Cuffia rotatori',
          equipment_needed: 'dumbbell_or_band'
        },
        { 
          name_gym: 'YTW Prone',
          name_home: 'YTW su Pavimento',
          sets: 3, 
          reps: '10 per lettera', 
          rest: 90,
          notes: 'Stabilizzatori scapolari',
          equipment_needed: null
        },
        { 
          name_gym: 'Dead Hang',
          name_home: 'Dead Hang (porta/sbarra)',
          sets: 3, 
          reps: '10-20s', 
          rest: 90,
          notes: 'Decompressione',
          equipment_needed: 'pullup_bar' // Serve sbarra
        }
      ]
    },
    phase3: {
      name: 'Fase 3: Ritorno all\'Attività',
      weeks: 4,
      frequency: 3,
      exercises: [
        { 
          name_gym: 'Push-up Standard',
          name_home: 'Push-up Standard',
          sets: 3, 
          reps: '10-15', 
          rest: 120,
          notes: 'Full ROM',
          equipment_needed: null
        },
        { 
          name_gym: 'Pike Push-up',
          name_home: 'Pike Push-up',
          sets: 3, 
          reps: '8-12', 
          rest: 120,
          notes: 'Overhead pressing',
          equipment_needed: null
        },
        { 
          name_gym: 'Inverted Row',
          name_home: 'Inverted Row (tavolo/sbarra bassa)',
          sets: 3, 
          reps: '10-12', 
          rest: 120,
          notes: 'Pulling orizzontale',
          equipment_needed: 'low_bar' // Serve tavolo/sbarra bassa
        },
        { 
          name_gym: 'Turkish Get-Up Kettlebell',
          name_home: 'Turkish Get-Up (peso improvvisato)',
          sets: 3, 
          reps: '3-5 per lato', 
          rest: 150,
          notes: 'Stabilità overhead dinamica',
          equipment_needed: 'kettlebell_or_weight'
        },
        { 
          name_gym: 'Landmine Press',
          name_home: 'Pike Push-up Avanzato',
          sets: 3, 
          reps: '10-12', 
          rest: 120,
          notes: 'Overhead pattern',
          equipment_needed: 'barbell' // Solo gym
        }
      ]
    }
  },
  
  knee: {
    phase1: {
      name: 'Fase 1: Mobilità e Attivazione Muscolare',
      weeks: 2,
      frequency: 4,
      exercises: [
        { 
          name_gym: 'Wall Sit',
          name_home: 'Wall Sit',
          sets: 3, 
          reps: '20-30s', 
          rest: 60,
          notes: 'Attivazione quadricipiti isometrica',
          equipment_needed: null
        },
        { 
          name_gym: 'Glute Bridge',
          name_home: 'Glute Bridge',
          sets: 3, 
          reps: '12-15', 
          rest: 60,
          notes: 'Attivazione glutei',
          equipment_needed: null
        },
        { 
          name_gym: 'Leg Extensions Machine',
          name_home: 'Terminal Knee Extensions Elastico',
          sets: 3, 
          reps: '15-20', 
          rest: 45,
          notes: 'Rinforzo quadricipiti',
          equipment_needed: 'leg_extension_or_band'
        },
        { 
          name_gym: 'Hamstring Curl Machine',
          name_home: 'Single Leg Glute Bridge',
          sets: 3, 
          reps: '10-12', 
          rest: 60,
          notes: 'Attivazione ischiocrurali',
          equipment_needed: null
        },
        { 
          name_gym: 'Ankle Mobilization',
          name_home: 'Ankle Mobilization',
          sets: 3, 
          reps: '10 per gamba', 
          rest: 30,
          notes: 'Mobilità caviglia per squat',
          equipment_needed: null
        }
      ]
    },
    phase2: {
      name: 'Fase 2: Rinforzo e Propriocezione',
      weeks: 4,
      frequency: 4,
      exercises: [
        { 
          name_gym: 'Leg Press',
          name_home: 'Squat a Corpo Libero',
          sets: 3, 
          reps: '10-15', 
          rest: 120,
          notes: 'Progressione carico',
          equipment_needed: null
        },
        { 
          name_gym: 'Step-Up Bilanciere',
          name_home: 'Step-Up (sedia/gradino)',
          sets: 3, 
          reps: '10-12 per gamba', 
          rest: 90,
          notes: 'Rinforzo unilaterale',
          equipment_needed: null
        },
        { 
          name_gym: 'Nordic Curl Assistito',
          name_home: 'Nordic Curl Eccentrico',
          sets: 3, 
          reps: '5-8', 
          rest: 120,
          notes: 'Eccentrico ischiocrurali',
          equipment_needed: null
        },
        { 
          name_gym: 'Single Leg Balance BOSU',
          name_home: 'Single Leg Balance (cuscino)',
          sets: 3, 
          reps: '30s per gamba', 
          rest: 60,
          notes: 'Propriocezione',
          equipment_needed: null
        }
      ]
    },
    phase3: {
      name: 'Fase 3: Ritorno Sport',
      weeks: 4,
      frequency: 3,
      exercises: [
        { 
          name_gym: 'Squat Bilanciere',
          name_home: 'Pistol Squat Assistito',
          sets: 3, 
          reps: '8-12', 
          rest: 150,
          notes: 'Forza massimale',
          equipment_needed: 'barbell'
        },
        { 
          name_gym: 'Bulgarian Split Squat Manubri',
          name_home: 'Bulgarian Split Squat',
          sets: 3, 
          reps: '10-12', 
          rest: 120,
          notes: 'Stabilità unilaterale',
          equipment_needed: null
        },
        { 
          name_gym: 'Box Jump',
          name_home: 'Jump Squat',
          sets: 3, 
          reps: '8-10', 
          rest: 120,
          notes: 'Pliometria',
          equipment_needed: 'box'
        },
        { 
          name_gym: 'Lateral Lunge Kettlebell',
          name_home: 'Lateral Lunge',
          sets: 3, 
          reps: '10 per lato', 
          rest: 90,
          notes: 'Pattern laterale',
          equipment_needed: null
        }
      ]
    }
  },
  
  lower_back: {
    phase1: {
      name: 'Fase 1: Stabilizzazione Core',
      weeks: 2,
      frequency: 5,
      exercises: [
        { name_gym: 'Bird Dog', name_home: 'Bird Dog', sets: 3, reps: '10-12', rest: 60, equipment_needed: null },
        { name_gym: 'Dead Bug', name_home: 'Dead Bug', sets: 3, reps: '10-12', rest: 60, equipment_needed: null },
        { name_gym: 'Cat-Cow', name_home: 'Cat-Cow', sets: 3, reps: '12-15', rest: 45, equipment_needed: null },
        { name_gym: 'Plank', name_home: 'Plank', sets: 3, reps: '20-30s', rest: 60, equipment_needed: null },
        { name_gym: 'Side Plank', name_home: 'Side Plank', sets: 3, reps: '15-20s per lato', rest: 60, equipment_needed: null }
      ]
    },
    phase2: {
      name: 'Fase 2: Rinforzo Estensori',
      weeks: 4,
      frequency: 4,
      exercises: [
        { name_gym: 'McGill Curl-Up', name_home: 'McGill Curl-Up', sets: 3, reps: '10', rest: 60, equipment_needed: null },
        { name_gym: 'Side Plank con Leg Lift', name_home: 'Side Plank con Leg Lift', sets: 3, reps: '8-10', rest: 60, equipment_needed: null },
        { name_gym: 'Bird Dog Dinamico', name_home: 'Bird Dog Dinamico', sets: 3, reps: '12-15', rest: 60, equipment_needed: null },
        { name_gym: 'Superman', name_home: 'Superman', sets: 3, reps: '10-12', rest: 60, equipment_needed: null },
        { name_gym: 'Pallof Press Cavi', name_home: 'Pallof Press Elastico', sets: 3, reps: '12 per lato', rest: 60, equipment_needed: 'resistance_band' }
      ]
    },
    phase3: {
      name: 'Fase 3: Carico Funzionale',
      weeks: 4,
      frequency: 3,
      exercises: [
        { name_gym: 'Romanian Deadlift', name_home: 'Single Leg RDL', sets: 3, reps: '10-12', rest: 120, equipment_needed: 'barbell_or_dumbbells' },
        { name_gym: 'Goblet Squat', name_home: 'Goblet Squat (peso casa)', sets: 3, reps: '12-15', rest: 90, equipment_needed: 'kettlebell' },
        { name_gym: 'Farmer Walk', name_home: 'Farmer Walk (pesi improvvisati)', sets: 3, reps: '30-45s', rest: 90, equipment_needed: 'dumbbells' },
        { name_gym: 'Landmine Rotations', name_home: 'Standing Cable/Band Rotations', sets: 3, reps: '10 per lato', rest: 60, equipment_needed: 'barbell_or_band' }
      ]
    }
  },
  
  cervical: {
    phase1: {
      name: 'Fase 1: Mobilità e Postura',
      weeks: 2,
      frequency: 5,
      exercises: [
        { name_gym: 'Chin Tucks', name_home: 'Chin Tucks', sets: 4, reps: '10-15', rest: 45, equipment_needed: null },
        { name_gym: 'Neck Rotations', name_home: 'Neck Rotations', sets: 3, reps: '10 per lato', rest: 30, equipment_needed: null },
        { name_gym: 'Scapular Retractions', name_home: 'Scapular Retractions', sets: 3, reps: '15-20', rest: 60, equipment_needed: null },
        { name_gym: 'Cat-Cow Toracico', name_home: 'Cat-Cow Toracico', sets: 3, reps: '12', rest: 45, equipment_needed: null },
        { name_gym: 'Upper Trap Stretch', name_home: 'Upper Trap Stretch', sets: 3, reps: '30s per lato', rest: 30, equipment_needed: null }
      ]
    },
    phase2: {
      name: 'Fase 2: Rinforzo Stabilizzatori',
      weeks: 4,
      frequency: 4,
      exercises: [
        { name_gym: 'Isometric Neck 4-Way', name_home: 'Isometric Neck 4-Way', sets: 3, reps: '10s per direzione', rest: 60, equipment_needed: null },
        { name_gym: 'Prone Cobra', name_home: 'Prone Cobra', sets: 3, reps: '8-10', rest: 90, equipment_needed: null },
        { name_gym: 'Wall Angels', name_home: 'Wall Angels', sets: 3, reps: '12-15', rest: 60, equipment_needed: null },
        { name_gym: 'Band Face Pulls', name_home: 'Band Face Pulls', sets: 3, reps: '15-20', rest: 60, equipment_needed: 'resistance_band' }
      ]
    },
    phase3: {
      name: 'Fase 3: Carico e Funzionalità',
      weeks: 4,
      frequency: 3,
      exercises: [
        { name_gym: 'Farmer Walks', name_home: 'Farmer Walks', sets: 3, reps: '30-60s', rest: 90, equipment_needed: 'dumbbells' },
        { name_gym: 'Turkish Get-Up', name_home: 'Turkish Get-Up', sets: 3, reps: '3-5', rest: 150, equipment_needed: 'kettlebell' },
        { name_gym: 'Overhead Press', name_home: 'Pike Push-up', sets: 3, reps: '8-12', rest: 120, equipment_needed: 'barbell' },
        { name_gym: 'Renegade Rows', name_home: 'Renegade Rows (improvvisato)', sets: 3, reps: '8-10', rest: 120, equipment_needed: 'dumbbells' }
      ]
    }
  },
  
  // ✅ Aggiungi ankle, hip, elbow, wrist con stesso schema...
  // Per brevità mostro solo shoulder, knee, lower_back, cervical
};

// ===== FUNZIONE PRINCIPALE =====
export function generateRecoveryProgram(input) {
  const { 
    location, 
    equipment, 
    recoveryScreening 
  } = input;
  
  if (!recoveryScreening) {
    throw new Error('Recovery screening data required');
  }
  
  const { 
    body_area, 
    assigned_phase, 
    pain_location, 
    pain_triggers, 
    pain_symptoms 
  } = recoveryScreening;
  
  console.log('[RECOVERY] 🔄 Generating recovery program for:', { 
    body_area, 
    assigned_phase, 
    location 
  });
  
  // Ottieni programma base
  const areaPrograms = RECOVERY_PROGRAMS[body_area];
  if (!areaPrograms) {
    throw new Error(`No recovery program for area: ${body_area}`);
  }
  
  const phaseKey = `phase${assigned_phase}`;
  const phaseProgram = areaPrograms[phaseKey];
  
  // ✅ ADATTA ESERCIZI A LOCATION/EQUIPMENT
  const adaptedExercises = phaseProgram.exercises.map(ex => {
    const hasEquipment = checkEquipmentAvailable(equipment, ex.equipment_needed);
    
    let finalName = ex.name_gym;
    
    if (location === 'home') {
      if (!hasEquipment && ex.equipment_needed) {
        // Casa senza equipment necessario → usa versione home
        finalName = ex.name_home;
      } else if (hasEquipment) {
        // Casa con equipment → può fare versione gym
        finalName = ex.name_gym;
      } else {
        // Casa senza equipment specifico → versione home
        finalName = ex.name_home;
      }
    }
    
    return {
      name: finalName,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      weight: null, // Recovery programs sono progressivi, no 1RM
      notes: ex.notes || ''
    };
  });
  
  // ✅ PERSONALIZZA PER PAIN PROFILE (opzionale - avanzato)
  const customizedExercises = customizeForPainProfile(
    adaptedExercises, 
    body_area, 
    pain_location, 
    pain_triggers, 
    pain_symptoms
  );
  
  return {
    name: `Recovery ${body_area.toUpperCase()} - Fase ${assigned_phase}`,
    description: phaseProgram.name,
    split: 'recovery',
    daysPerWeek: phaseProgram.frequency,
    weeklySchedule: [{
      dayName: `Recovery Session`,
      exercises: customizedExercises
    }],
    progression: 'phased_recovery',
    currentPhase: assigned_phase,
    totalPhases: 3,
    includesDeload: false,
    totalWeeks: phaseProgram.weeks,
    requiresEndCycleTest: true, // Test checkpoint per passare fase successiva
  };
}

// ===== HELPER FUNCTIONS =====

function checkEquipmentAvailable(equipment, needed) {
  if (!needed) return true; // Corpo libero, sempre disponibile
  
  const hasResistanceBand = equipment?.resistanceBand || false;
  const hasPullupBar = equipment?.pullupBar || false;
  const hasDumbbells = equipment?.dumbbellMaxKg > 0;
  const hasKettlebell = equipment?.kettlebellKg?.length > 0;
  const hasBarbell = equipment?.barbell || false;
  
  switch (needed) {
    case 'resistance_band':
      return hasResistanceBand;
    case 'pullup_bar':
    case 'low_bar':
      return hasPullupBar;
    case 'dumbbell_or_band':
      return hasDumbbells || hasResistanceBand;
    case 'kettlebell_or_weight':
      return hasKettlebell || hasDumbbells;
    case 'dumbbells':
      return hasDumbbells;
    case 'kettlebell':
      return hasKettlebell;
    case 'barbell':
    case 'barbell_or_dumbbells':
    case 'barbell_or_band':
      return hasBarbell || hasDumbbells || hasResistanceBand;
    case 'leg_extension_or_band':
      return hasResistanceBand; // Casa: elastico, Gym: macchina
    case 'box':
      return false; // Casa: jump squat, Gym: box jump
    default:
      return true;
  }
}

function customizeForPainProfile(
  exercises[], 
  bodyArea, 
  painLocation, 
  painTriggers[], 
  painSymptoms[]
)[] {
  // Esempio personalizzazione spalla
  if (bodyArea === 'shoulder') {
    if (painLocation === 'anterior') {
      // Dolore anteriore → priorità esercizi posteriori
      return exercises.map(ex => {
        if (ex.name.includes('Face Pull') || ex.name.includes('Pull-Apart')) {
          return { ...ex, sets: ex.sets + 1 }; // +1 set per posteriori
        }
        return ex;
      });
    }
    
    if (painSymptoms.includes('radiating')) {
      // Dolore irradiato → aggiungi nerve glides
      return [
        { name: 'Nerve Glides C5-C6', sets: 3, reps: '10', rest: 45, notes: 'Mobilizzazione neurale' },
        ...exercises
      ];
    }
  }
  
  // Altri body areas...
  return exercises;
}

// Export per compatibilità
export default {
  generateRecoveryProgram
};
