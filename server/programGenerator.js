// ===== FORMULE E CALCOLI =====

export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
}

export function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null;
  
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  
  return Math.round(weight / 2.5) * 2.5;
}

// ===== IMPORTS =====
import { 
  getExerciseForLocation
} from './exerciseSubstitutions.js';

// ===== MAPPATURA BODY PARTS -> ESERCIZI =====

const BODY_PART_EXERCISES = {
  chest: ['Panca Piana', 'Panca Inclinata', 'Chest Press', 'Chest Fly', 'Push-up'],
  arms: ['Curl bilanciere', 'French Press', 'Dips', 'Hammer Curl', 'Triceps Pushdown', 'Concentration Curl'],
  shoulders: ['Military Press', 'Alzate laterali', 'Face Pull', 'Arnold Press', 'Shoulder Press'],
  back_width: ['Trazioni', 'Lat Machine', 'Pull-down', 'Straight Arm Pulldown'],
  back_thickness: ['Rematore', 'Rematore Bilanciere', 'Seal Row', 'T-Bar Row', 'Chest Supported Row'],
  legs: ['Squat', 'Leg Press', 'Leg Extension', 'Bulgarian Split Squat', 'Hack Squat'],
  glutes: ['Hip Thrust', 'Glute Bridge', 'Romanian Deadlift', 'Abductor Machine', 'Kickback'],
  abs: ['Crunch', 'Cable Crunch', 'Ab Wheel', 'Hanging Leg Raise', 'Russian Twist'],
  calves: ['Calf Raises', 'Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
};

// ===== FILOSOFIA RUBINI - PERFORMANCE SPORT =====

const RUBINI_SPORT_PROGRAMS = {
  calcio: {
    portiere: {
      focus: ['explosive_power', 'lateral_agility', 'core_stability'],
      exercises: {
        strength: ['Trap Bar Deadlift', 'Box Jump', 'Lateral Bound', 'Single Leg RDL'],
        power: ['Med Ball Slam', 'Split Squat Jump', 'Broad Jump'],
        prevention: ['Nordic Hamstring Curl', 'Copenhagen Plank', 'Pallof Press']
      }
    },
    difensore: {
      focus: ['max_strength', 'power', 'physical_contact'],
      exercises: {
        strength: ['Squat', 'Deadlift', 'Hip Thrust', 'Rematore Bilanciere'],
        power: ['Power Clean', 'Box Jump', 'Sprint Drills'],
        prevention: ['Nordic Hamstring Curl', 'Copenhagen Plank', 'Core Rotation']
      }
    },
    centrocampista: {
      focus: ['strength_endurance', 'repeated_sprint', 'agility'],
      exercises: {
        strength: ['Front Squat', 'Trap Bar Deadlift', 'Step-up'],
        power: ['Jump Squat', 'Skater Jump', 'COD Drills'],
        prevention: ['Nordic Hamstring Curl', 'Single Leg Bridge', 'Anti-Rotation Press']
      }
    },
    attaccante: {
      focus: ['explosive_speed', 'acceleration', 'change_direction'],
      exercises: {
        strength: ['Squat', 'Hip Thrust', 'Bulgarian Split Squat'],
        power: ['Jump Squat', 'Bound Series', 'Sprint Mechanics'],
        prevention: ['Nordic Hamstring Curl', 'Eccentric Calf', 'Pallof Press']
      }
    }
  },
  
  basket: {
    playmaker: {
      focus: ['agility', 'quick_first_step', 'core_stability'],
      exercises: {
        strength: ['Front Squat', 'Trap Bar Deadlift', 'Single Leg RDL'],
        power: ['Lateral Bound', 'Depth Jump', 'Reaction Drills'],
        prevention: ['Nordic Hamstring Curl', 'Ankle Stability', 'Hip Mobility']
      }
    },
    guardia: {
      focus: ['vertical_jump', 'lateral_quickness', 'shoulder_stability'],
      exercises: {
        strength: ['Squat', 'Deadlift', 'Bench Press'],
        power: ['Box Jump', 'Lateral Hop', 'Medicine Ball Throws'],
        prevention: ['Nordic Curl', 'Rotator Cuff', 'Landing Mechanics']
      }
    },
    ala: {
      focus: ['vertical_jump', 'speed', 'contact_strength'],
      exercises: {
        strength: ['Squat', 'Hip Thrust', 'Pull-ups'],
        power: ['Depth Jump', 'Broad Jump', 'Sprint Starts'],
        prevention: ['Nordic Curl', 'Shoulder Stability', 'Core Anti-Rotation']
      }
    },
    centro: {
      focus: ['max_strength', 'vertical_jump', 'physical_contact'],
      exercises: {
        strength: ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press'],
        power: ['Box Jump', 'Trap Bar Jump', 'Power Shrug'],
        prevention: ['Nordic Curl', 'Face Pull', 'Thoracic Mobility']
      }
    }
  },
  
  tennis: {
    singolo: {
      focus: ['lateral_power', 'rotational_core', 'ankle_stability'],
      exercises: {
        strength: ['Bulgarian Split Squat', 'Single Leg RDL', 'Landmine Press'],
        power: ['Lateral Bound', 'Med Ball Rotational Throw', 'Skater Jump'],
        prevention: ['Copenhagen Plank', 'Calf Raises Eccentric', 'Anti-Rotation Press']
      }
    },
    doppio: {
      focus: ['explosive_first_step', 'rotational_power', 'endurance_strength'],
      exercises: {
        strength: ['Split Squat', 'Trap Bar Deadlift', 'Cable Row'],
        power: ['Lateral Hop', 'Med Ball Slam', 'Jump Lunge'],
        prevention: ['Ankle Stability', 'Rotator Cuff', 'Core Endurance']
      }
    }
  },
  
  pallavolo: {
    schiacciatore: {
      focus: ['max_vertical_jump', 'shoulder_health', 'landing_mechanics'],
      exercises: {
        strength: ['Trap Bar Deadlift', 'Hip Thrust', 'Front Squat'],
        power: ['Depth Jump', 'Box Jump', 'Broad Jump'],
        prevention: ['Nordic Curl', 'Face Pull', 'Scapular Stability', 'Landing Drills']
      }
    },
    centrale: {
      focus: ['vertical_jump', 'block_power', 'shoulder_stability'],
      exercises: {
        strength: ['Squat', 'Deadlift', 'Overhead Press'],
        power: ['Box Jump', 'Depth Jump', 'Med Ball Overhead Throw'],
        prevention: ['Nordic Curl', 'YTW', 'Rotator Cuff']
      }
    },
    palleggiatore: {
      focus: ['agility', 'finger_strength', 'shoulder_stability'],
      exercises: {
        strength: ['Front Squat', 'Single Leg RDL', 'Bench Press'],
        power: ['Lateral Bound', 'Box Jump', 'Quick Feet Drills'],
        prevention: ['Wrist Stability', 'Shoulder Stability', 'Core Anti-Rotation']
      }
    },
    libero: {
      focus: ['lateral_agility', 'reaction_speed', 'ankle_stability'],
      exercises: {
        strength: ['Bulgarian Split Squat', 'Trap Bar Deadlift', 'Pull-ups'],
        power: ['Lateral Hop', 'Reaction Drills', 'Skater Jump'],
        prevention: ['Ankle Stability', 'Hip Mobility', 'Core Stability']
      }
    }
  },
  
  corsa: {
    sprint: {
      focus: ['max_strength', 'explosive_power', 'minimal_fatigue'],
      exercises: {
        strength: ['Squat', 'Trap Bar Deadlift', 'Hip Thrust'],
        power: ['Power Clean', 'Broad Jump', 'Sprint Mechanics'],
        prevention: ['Nordic Curl', 'Single Leg Bridge', 'Calf Eccentric']
      },
      volume: 'very_low',
      frequency: 2
    },
    mezzofondo: {
      focus: ['strength_endurance', 'running_economy', 'injury_prevention'],
      exercises: {
        strength: ['Front Squat', 'Single Leg RDL', 'Step-up'],
        power: ['Box Jump', 'Bounding'],
        prevention: ['Nordic Curl', 'Calf Raises', 'Hip Stability']
      },
      volume: 'low',
      frequency: 2
    },
    maratona: {
      focus: ['injury_prevention', 'running_economy', 'minimal_interference'],
      exercises: {
        strength: ['Trap Bar Deadlift', 'Single Leg RDL', 'Bulgarian Split Squat'],
        power: [],
        prevention: ['Nordic Curl', 'Calf Eccentric', 'Hip Stability', 'Core Endurance']
      },
      volume: 'minimal',
      frequency: 1
    }
  },
  
  ciclismo: {
    strada: {
      focus: ['max_strength_legs', 'core_stability', 'minimal_fatigue'],
      exercises: {
        strength: ['Squat', 'Deadlift', 'Single Leg Press'],
        power: [],
        prevention: ['Hip Flexor Stretch', 'Core Anti-Flexion', 'Lower Back']
      },
      volume: 'low',
      frequency: 2
    },
    mtb: {
      focus: ['explosive_power', 'upper_body_strength', 'core_stability'],
      exercises: {
        strength: ['Squat', 'Deadlift', 'Pull-ups', 'Overhead Press'],
        power: ['Box Jump', 'Power Clean'],
        prevention: ['Hip Mobility', 'Core Stability', 'Grip Strength']
      },
      volume: 'medium',
      frequency: 2
    }
  },
  
  triathlon: {
    ironman: {
      focus: ['injury_prevention', 'minimal_volume', 'no_interference'],
      exercises: {
        strength: ['Trap Bar Deadlift', 'Single Leg RDL', 'Push-ups'],
        power: [],
        prevention: ['Core Endurance', 'Hip Stability', 'Shoulder Health']
      },
      volume: 'minimal',
      frequency: 1
    },
    sprint: {
      focus: ['power_endurance', 'running_economy', 'bike_power'],
      exercises: {
        strength: ['Front Squat', 'Hip Thrust', 'Bench Press'],
        power: ['Box Jump', 'Medicine Ball'],
        prevention: ['Nordic Curl', 'Core Stability', 'Ankle Mobility']
      },
      volume: 'low',
      frequency: 2
    }
  }
};

function getExercisesForSoccerRole(role, level) {
  const roleExercises = {
    portiere: ['Box Jump', 'Lateral Bound', 'Med Ball Slam', 'Single Leg RDL', 'Split Squat Jump', 'Pallof Press'],
    difensore: ['Squat', 'Deadlift', 'Rematore Bilanciere', 'Panca Piana', 'Core Rotation', 'Farmer Walk'],
    centrocampista: ['Burpees', 'Mountain Climbers', 'Step-up', 'Battle Ropes', 'Box Step', 'Kettlebell Swing'],
    attaccante: ['Sprint Drills', 'Jump Squat', 'Power Clean', 'Box Jump', 'Single Leg Bound', 'Explosive Push-up'],
  };
  
  const exercises = roleExercises[role] || roleExercises.centrocampista;
  
  if (level === 'beginner') return exercises.slice(0, 2);
  if (level === 'intermediate') return exercises.slice(0, 3);
  return exercises.slice(0, 3);
}

function getExercisesForBodyPart(bodyPart, level) {
  const exercises = BODY_PART_EXERCISES[bodyPart] || [];
  if (level === 'beginner') return exercises.slice(0, 1);
  if (level === 'intermediate') return exercises.slice(0, 2);
  return exercises.slice(0, 2);
}

// ===== REGOLE SICUREZZA ESERCIZI =====

const PREGNANCY_UNSAFE_EXERCISES = [
  'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
  'Panca Piana', 'Bench Press', 'Floor Press',
  'Stacco', 'Deadlift', 'Romanian Deadlift', 'Good Morning',
  'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
  'Front Squat', 'Back Squat',
];

const DISABILITY_COMPLEX_EXERCISES = [
  'Clean', 'Snatch', 'Clean & Jerk',
  'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
  'Overhead Squat', 'Snatch Grip Deadlift',
];

export function isExerciseSafeForPregnancy(exerciseName) {
  return !PREGNANCY_UNSAFE_EXERCISES.some(unsafe => 
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

export function isExerciseSafeForDisability(exerciseName, disabilityType) {
  return !DISABILITY_COMPLEX_EXERCISES.some(complex => 
    exerciseName.toLowerCase().includes(complex.toLowerCase())
  );
}

export function getPregnancySafeAlternative(exerciseName) {
  const alternatives = {
    'Panca Piana': 'Panca Inclinata 45°',
    'Bench Press': 'Incline Press',
    'Stacco': 'Hip Thrust',
    'Deadlift': 'Goblet Squat',
    'Squat': 'Goblet Squat',
    'Crunch': 'Bird Dog',
  };
  
  for (const [unsafe, safe] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(unsafe.toLowerCase())) {
      return safe;
    }
  }
  return exerciseName;
}

export function getDisabilitySafeAlternative(exerciseName) {
  const alternatives = {
    'Bulgarian Split Squat': 'Leg Press',
    'Single Leg RDL': 'Seated Leg Curl',
    'Pistol Squat': 'Chair Squat',
  };
  
  for (const [complex, simple] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(complex.toLowerCase())) {
      return simple;
    }
  }
  return exerciseName;
}

// ===== GENERAZIONE PROGRAMMA =====

export function generateProgram(input) {
  const { level, frequency, location, hasGym, equipment, painAreas, assessments, goal, disabilityType, sportRole } = input;
  
  // SE PERFORMANCE → USA FILOSOFIA RUBINI
  if (goal === 'performance' && sportRole) {
    return generatePerformanceProgramRubini(input);
  }
  
  // ALTRIMENTI → PROGRAMMA STANDARD
  const specificBodyParts = input.specificBodyParts?.map(part => 
    part === 'upper_chest' ? 'chest' : part
  );

  let split, daysPerWeek;
  if (frequency <= 3) {
    split = "full_body";
    daysPerWeek = frequency;
  } else if (frequency === 4) {
    split = "upper_lower";
    daysPerWeek = 4;
  } else {
    split = "ppl";
    daysPerWeek = frequency;
  }

  let progression;
  if (level === "beginner") progression = "wave_loading";
  else if (level === "intermediate") progression = "ondulata_settimanale";
  else progression = "ondulata_giornaliera";

  const weeklySchedule = generateWeeklySchedule(
    split, daysPerWeek, location || 'gym', hasGym, equipment, painAreas,
    assessments, level, goal, specificBodyParts, disabilityType, sportRole
  );

  const includesDeload = level === "intermediate" || level === "advanced";
  const deloadFrequency = includesDeload ? 4 : undefined;
  const requiresEndCycleTest = goal === "strength" || goal === "muscle_gain" || goal === "performance";

  let totalWeeks = 4;
  if (goal === "strength") totalWeeks = 8;
  else if (goal === "muscle_gain") totalWeeks = 12;
  else if (goal === "performance") totalWeeks = 8;

  return {
    name: `Programma ${split.toUpperCase()} - ${level}`,
    description: `${daysPerWeek}x/settimana, progressione ${progression}`,
    split,
    daysPerWeek,
    weeklySchedule,
    progression,
    includesDeload,
    deloadFrequency,
    totalWeeks,
    requiresEndCycleTest,
  };
}

// ===== GENERAZIONE PROGRAMMA PERFORMANCE RUBINI =====

function generatePerformanceProgramRubini(input) {
  const { level, frequency, location, hasGym, equipment, painAreas, assessments, sportRole } = input;
  
  // Determina sport e ruolo
  const [sport, role] = sportRole ? sportRole.split('_') : ['calcio', 'centrocampista'];
  
  const sportConfig = RUBINI_SPORT_PROGRAMS[sport]?.[role] || RUBINI_SPORT_PROGRAMS.calcio.centrocampista;
  
  // Frequency adattata per endurance (max 2 sessioni)
  const adjustedFrequency = ['corsa', 'ciclismo', 'triathlon'].includes(sport) 
    ? Math.min(frequency, sportConfig.frequency || 2)
    : frequency;
  
  // Split specifico: 3-4 sessioni settimanali
  const split = "performance_rubini";
  const daysPerWeek = adjustedFrequency;
  
  // Genera schedule
  const weeklySchedule = generatePerformanceScheduleRubini(
    sport, role, sportConfig, daysPerWeek, location, hasGym, equipment, 
    painAreas, assessments, level
  );
  
  const totalWeeks = 8; // Mesociclo standard
  
  return {
    name: `Performance ${sport.toUpperCase()} - ${role} (Metodo Rubini)`,
    description: `${daysPerWeek}x/settimana - Forza, Potenza, Prevenzione`,
    split,
    daysPerWeek,
    weeklySchedule,
    progression: "ondulata_giornaliera",
    includesDeload: true,
    deloadFrequency: 3,
    totalWeeks,
    requiresEndCycleTest: true,
  };
}

function generatePerformanceScheduleRubini(sport, role, sportConfig, daysPerWeek, location, hasGym, equipment, painAreas, assessments, level) {
  const schedule = [];
  const baseLoad = getBaseLoads(assessments);
  
  // RIR adattato per livello (Rubini: beginner più conservativo)
  const RIR_STRENGTH = level === 'beginner' ? 3 : level === 'intermediate' ? 2 : 1;
  const RIR_POWER = 2; // Sempre 2 per potenza (focus qualità)
  
  // Sessioni tipo per sport NON endurance
  if (!['corsa', 'ciclismo', 'triathlon'].includes(sport)) {
    if (daysPerWeek >= 3) {
      // Sessione 1: Forza Massima
      schedule.push({
        dayName: "Forza Massima",
        exercises: [
          ...sportConfig.exercises.strength.slice(0, 3).map(ex => 
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'strength', RIR_STRENGTH)
          ),
          ...sportConfig.exercises.prevention.slice(0, 2).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'prevention', 2)
          )
        ]
      });
      
      // Sessione 2: Potenza/Esplosività
      schedule.push({
        dayName: "Potenza & Esplosività",
        exercises: [
          ...sportConfig.exercises.power.slice(0, 3).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'power', RIR_POWER)
          ),
          ...sportConfig.exercises.prevention.slice(0, 2).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'prevention', 2)
          )
        ]
      });
      
      // Sessione 3: Misto (Forza + Prevenzione Focus)
      schedule.push({
        dayName: "Forza & Prevenzione",
        exercises: [
          ...sportConfig.exercises.strength.slice(1, 3).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'strength', RIR_STRENGTH)
          ),
          ...sportConfig.exercises.prevention.map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'prevention', 2)
          )
        ]
      });
    }
    
    // Sessione 4 (se frequency >= 4): Potenza + Mobility
    if (daysPerWeek >= 4) {
      schedule.push({
        dayName: "Potenza & Mobilità",
        exercises: [
          ...sportConfig.exercises.power.slice(1, 3).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'power', RIR_POWER)
          ),
          createPerformanceExercise('Hip Mobility Flow', location, hasGym, equipment, baseLoad, level, 'mobility', 0),
          createPerformanceExercise('Shoulder Mobility', location, hasGym, equipment, baseLoad, level, 'mobility', 0)
        ]
      });
    }
  } else {
    // ENDURANCE: Volume MINIMAL (1-2 sessioni MAX)
    schedule.push({
      dayName: "Forza Economia & Prevenzione",
      exercises: [
        ...sportConfig.exercises.strength.slice(0, 2).map(ex =>
          createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'strength', 3) // RIR 3 sempre
        ),
        ...sportConfig.exercises.prevention.map(ex =>
          createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'prevention', 2)
        )
      ]
    });
    
    if (daysPerWeek >= 2 && sportConfig.exercises.power.length > 0) {
      schedule.push({
        dayName: "Potenza Breve",
        exercises: [
          ...sportConfig.exercises.power.slice(0, 2).map(ex =>
            createPerformanceExercise(ex, location, hasGym, equipment, baseLoad, level, 'power', 2)
          )
        ]
      });
    }
  }
  
  return schedule;
}

function createPerformanceExercise(name, location, hasGym, equipment, baseLoad, level, type, RIR) {
  let sets, reps, rest, weight;
  
  // Volume Rubini: 3-4 serie (non 5)
  if (level === "beginner") {
    sets = 3;
  } else {
    sets = type === 'strength' || type === 'power' ? 4 : 3;
  }
  
  // Range reps Rubini
  if (type === 'strength') {
    reps = "3"; // Forza massima
    rest = 240; // 4 min
    const targetReps = 3;
    weight = baseLoad.squat ? calculateTrainingWeight(baseLoad.squat, targetReps, RIR) : null;
  } else if (type === 'power') {
    reps = "3"; // Potenza esplosiva
    rest = 180; // 3 min
    weight = null; // Dipende dall'esercizio
  } else if (type === 'prevention') {
    reps = "6"; // Controllo/prevenzione
    rest = 90;
    weight = null;
  } else if (type === 'mobility') {
    reps = "60s";
    rest = 60;
    weight = null;
  } else {
    reps = "5";
    rest = 120;
    weight = null;
  }
  
  const exerciseOrGiantSet = getExerciseForLocation(name, location, hasGym, equipment, goal, level);
  
  if (typeof exerciseOrGiantSet !== 'string') {
    return exerciseOrGiantSet;
  }
  
  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight,
    notes: type === 'strength' ? `Forza massima - RIR ${RIR}` : 
           type === 'power' ? 'Massima velocità esecutiva' :
           type === 'prevention' ? 'Controllo eccentrico - Prevenzione infortuni' :
           'Mobilità attiva'
  };
}

// ===== PROGRAMMA STANDARD (resto invariato) =====

function generateWeeklySchedule(split, daysPerWeek, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const schedule = [];
  
  if (split === "full_body") {
    for (let i = 0; i < daysPerWeek; i++) {
      schedule.push({
        dayName: i % 2 === 0 ? "Full Body A" : "Full Body B",
        exercises: generateFullBodyDay(i % 2 === 0 ? "A" : "B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
      });
    }
  } else if (split === "upper_lower") {
    schedule.push(
      { dayName: "Upper A", exercises: generateUpperDay("A", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower A", exercises: generateLowerDay("A", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Upper B", exercises: generateUpperDay("B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower B", exercises: generateLowerDay("B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  } else {
    schedule.push(
      { dayName: "Push", exercises: generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull", exercises: generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs", exercises: generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
    if (daysPerWeek >= 6) {
      schedule.push(
        { dayName: "Push B", exercises: generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Pull B", exercises: generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Legs B", exercises: generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      );
    }
  }
  return schedule;
}

function generateFullBodyDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (!painAreas.includes("knee") && !painAreas.includes("lower_back")) {
    exercises.push(createExercise(safeExercise("Squat"), location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
  } else {
    exercises.push(createExercise("Leg Press", location, hasGym, equipment, baseLoad.squat * 1.3, level, goal, "compound"));
  }

  if (!painAreas.includes("lower_back")) {
    exercises.push(createExercise(safeExercise(variant === "A" ? "Stacco" : "Romanian Deadlift"), location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  if (!painAreas.includes("shoulder")) {
    exercises.push(createExercise(safeExercise(variant === "A" ? "Panca Piana" : "Panca Inclinata"), location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
  }

  exercises.push(createExercise(variant === "A" ? "Trazioni" : "Rematore", location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));

  if (!painAreas.includes("shoulder")) {
    exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "accessory"));
  }

  exercises.push(createExercise(goal === 'pregnancy' ? 'Bird Dog' : 'Plank', location, hasGym, equipment, 0, level, goal, "core"));

  return exercises;
}

function generateUpperDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Panca Piana"), location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
    exercises.push(createExercise("Trazioni", location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));
  } else {
    exercises.push(createExercise(safeExercise("Panca Inclinata"), location, hasGym, equipment, baseLoad.bench * 0.85, level, goal, "compound"));
    exercises.push(createExercise("Rematore Bilanciere", location, hasGym, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  }

  exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "accessory"));
  exercises.push(createExercise(variant === "A" ? "Curl bilanciere" : "French Press", location, hasGym, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));

  return exercises;
}

function generateLowerDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Squat"), location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
    exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, hasGym, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  } else {
    exercises.push(createExercise(safeExercise("Front Squat"), location, hasGym, equipment, baseLoad.squat * 0.8, level, goal, "compound"));
    exercises.push(createExercise(safeExercise("Stacco"), location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));
  
  if (!painAreas.includes("ankles")) {
    exercises.push(createExercise("Calf Raises", location, hasGym, equipment, baseLoad.squat * 0.5, level, goal, "isolation"));
  }

  return exercises;
}

function generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Panca Piana"), location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
  exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "compound"));
  exercises.push(createExercise("Dips", location, hasGym, equipment, 0, level, goal, "compound"));
  exercises.push(createExercise("Croci manubri", location, hasGym, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));
  exercises.push(createExercise("French Press", location, hasGym, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));

  return exercises;
}

function generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Stacco"), location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Trazioni"), location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Rematore Bilanciere"), location, hasGym, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Curl bilanciere"), location, hasGym, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));
  exercises.push(createExercise(safeExercise("Face Pull"), location, hasGym, equipment, baseLoad.pull * 0.2, level, goal, "isolation"));

  return exercises;
}

function generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Squat"), location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Leg Press"), location, hasGym, equipment, baseLoad.squat * 1.5, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, hasGym, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));
  exercises.push(createExercise("Leg Extension", location, hasGym, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));

  return exercises;
}

function createExercise(name, location, hasGym, equipment, baseWeight, level, goal, type) {
  let sets, reps, rest;

  if (level === "beginner") {
    sets = type === "compound" ? 3 : 2;
  } else if (level === "intermediate") {
    sets = type === "compound" ? 4 : 3;
  } else {
    sets = type === "compound" ? 5 : 3;
  }

  if (type === "compound") reps = "5";
  else if (type === "accessory") reps = "10";
  else if (type === "isolation") reps = "12";
  else if (type === "core") reps = "30-60s";
  else reps = "10";

  if (type === "compound") rest = 180;
  else if (type === "accessory") rest = 120;
  else rest = 60;

  const exerciseOrGiantSet = getExerciseForLocation(name, location, hasGym, equipment, 'performance', level);

  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' ? getPregnancySafeAlternative(name) : getDisabilitySafeAlternative(name);
      return {
        name: safeAlternative,
        sets,
        reps,
        rest,
        weight: null,
        notes: `Esercizio adattato per sicurezza`,
      };
    }
    return exerciseOrGiantSet;
  }

  // ===== CALCOLO PESO CON RIR (UNIVERSALE) =====
  let trainingWeight = null;
  if (baseWeight > 0) {
    let targetReps = 10;
    
    if (typeof reps === 'string' && reps.includes('-')) {
      targetReps = parseInt(reps.split('-')[1]);
    } else if (typeof reps === 'string' && !reps.includes('s')) {
      targetReps = parseInt(reps);
    }
    
    const RIR = level === 'beginner' ? 3 : 2;
    trainingWeight = calculateTrainingWeight(baseWeight, targetReps, RIR);
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: trainingWeight,
    notes: type === "compound" ? "Esercizio fondamentale" : "Esercizio complementare",
  };
}

function getBaseLoads(assessments) {
  const findLoad = (exercise) => {
    const assessment = assessments.find((a) =>
      a.exerciseName.toLowerCase().includes(exercise.toLowerCase())
    );
    return assessment ? assessment.oneRepMax : 50;
  };
  
  return {
    squat: findLoad("squat"),
    deadlift: findLoad("stacco"),
    bench: findLoad("panca"),
    pull: findLoad("trazioni") || findLoad("pull"),
    press: findLoad("press") || findLoad("spalle"),
  };
}

// ===== PAIN MANAGEMENT =====

export function analyzePainPersistence(workouts) {
  const painAreas = {};
  workouts.forEach((w) => {
    if (w.painLevel && w.painLevel > 3 && w.painLocation) {
      painAreas[w.painLocation] = (painAreas[w.painLocation] || 0) + 1;
    }
  });
  
  const persistentPain = Object.entries(painAreas)
    .filter(([_, count]) => count >= 3)
    .map(([location, _]) => location);
  
  return {
    hasPersistentPain: persistentPain.length > 0,
    persistentAreas: persistentPain,
  };
}

export function checkRecoveryFromPain(workouts) {
  const lastThree = workouts.slice(0, 3);
  const noPainSessions = lastThree.filter((w) => !w.painLevel || w.painLevel <= 2);
  
  return {
    canReturnToNormal: noPainSessions.length === 3,
    painFreeSessions: noPainSessions.length,
  };
}

export function calculateDetrainingFactor(workouts) {
  if (workouts.length === 0) return 0.7;
  
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

export function recalibrateProgram(assessments, detrainingFactor) {
  return assessments.map((a) => ({
    exerciseName: a.exerciseName,
    oneRepMax: a.oneRepMax * detrainingFactor,
  }));
}
