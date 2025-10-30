import { 
  getExerciseForLocation
} from './exerciseSubstitutions.js';

// ===== MAPPING PROGRESSIONI BODYWEIGHT =====

const BODYWEIGHT_PROGRESSIONS = {
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

// ===== CONFIGURAZIONE LIVELLI =====

const LEVEL_CONFIG = {
  beginner: {
    RIR: 3,
    repsRange: 2,  // ±2 reps
    startPercentage: 0.60,  // Parte al 60% settimana 1-2
    compoundSets: 3,
    accessorySets: 2
  },
  intermediate: {
    RIR: 2,
    repsRange: 1,  // ±1 rep
    startPercentage: 0.75,  // Parte al 75%
    compoundSets: 4,
    accessorySets: 3
  },
  advanced: {
    RIR: 1,
    repsRange: 0,  // Carico preciso
    startPercentage: 0.85,  // Parte all'85%
    compoundSets: 5,
    accessorySets: 3
  }
};

// ===== HELPER FUNCTIONS =====

function isBodyweightExercise(exerciseName) {
  const bodyweightKeywords = [
    'corpo libero', 'bodyweight', 'push-up', 'pull-up', 'trazioni', 'dips', 
    'plank', 'hollow body', 'superman', 'handstand', 'pike push-up',
    'diamond push-up', 'archer push-up', 'nordic curl', 'pistol squat',
    'jump', 'burpee', 'mountain climber', 'flutter kick', 'bicycle crunch',
    'leg raise', 'australian pull-up', 'inverted row', 'floor pull',
    'dead hang', 'scapular', 'floor slide', 'bird dog', 'l-sit', 'assistito'
  ];
  
  const name = exerciseName.toLowerCase();
  return bodyweightKeywords.some(keyword => name.includes(keyword));
}

function hasWeightedEquipment(equipment) {
  if (!equipment) return false;
  
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  );
}
// ===== HELPER FUNCTIONS =====

function isBodyweightExercise(exerciseName) {
  const bodyweightKeywords = [
    'corpo libero', 'bodyweight', 'push-up', 'pull-up', 'trazioni', 'dips', 
    'plank', 'hollow body', 'superman', 'handstand', 'pike push-up',
    'diamond push-up', 'archer push-up', 'nordic curl', 'pistol squat',
    'jump', 'burpee', 'mountain climber', 'flutter kick', 'bicycle crunch',
    'leg raise', 'australian pull-up', 'inverted row', 'floor pull',
    'dead hang', 'scapular', 'floor slide', 'bird dog', 'l-sit', 'assistito',
    'squat bulgaro', 'affondi', 'glute bridge', 'wall sit', 'calf raises', // ✅ AGGIUNTI
    'chin-up', 'negative', 'isometric', 'hold', 'ytw' // ✅ AGGIUNTI
  ];
  
  const name = exerciseName.toLowerCase();
  return bodyweightKeywords.some(keyword => name.includes(keyword));
}

function hasWeightedEquipment(equipment) {
  if (!equipment) return false;
  
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  );
}

// ✅ AGGIUNGI QUESTA FUNZIONE COMPLETA QUI
function convertToBodyweight(exerciseName, level) {
  const name = exerciseName.toLowerCase();
  
  console.log(`[CONVERT] Converting "${exerciseName}" to bodyweight for ${level}`);
  
  // GAMBE - SQUAT
  if (name.includes('squat') && !name.includes('bulgaro') && !name.includes('pistol')) {
    if (name.includes('front')) {
      if (level === 'beginner') return 'Squat Assistito';
      if (level === 'intermediate') return 'Squat Completo';
      return 'Jump Squat';
    }
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
    if (name.includes('romanian') || name.includes('rumeno')) {
      if (level === 'beginner') return 'Glute Bridge';
      if (level === 'intermediate') return 'Single Leg Glute Bridge';
      return 'Single Leg Deadlift';
    }
    if (name.includes('sumo')) {
      if (level === 'beginner') return 'Squat Sumo';
      if (level === 'intermediate') return 'Squat Sumo con Pausa';
      return 'Jump Squat Sumo';
    }
    if (level === 'beginner') return 'Affondi';
    if (level === 'intermediate') return 'Squat Bulgaro';
    return 'Single Leg Deadlift';
  }
  
  if (name.includes('good morning')) {
    if (level === 'beginner') return 'Glute Bridge';
    if (level === 'intermediate') return 'Hip Thrust a Corpo Libero';
    return 'Nordic Curl Eccentrico';
  }
  
  // GAMBE - ISOLAMENTO
  if (name.includes('leg curl')) {
    if (level === 'beginner') return 'Glute Bridge';
    if (level === 'intermediate') return 'Single Leg Glute Bridge';
    return 'Nordic Curl';
  }
  
  if (name.includes('leg extension')) {
    if (level === 'beginner') return 'Wall Sit';
    if (level === 'intermediate') return 'Squat Isometrico';
    return 'Pistol Squat Eccentrico';
  }
  
  if (name.includes('calf')) {
    if (level === 'beginner') return 'Calf Raises Doppia Gamba';
    if (level === 'intermediate') return 'Calf Raises Singola Gamba';
    return 'Calf Raises Saltellando';
  }
  
  if (name.includes('hip thrust')) {
    if (level === 'beginner') return 'Glute Bridge';
    if (level === 'intermediate') return 'Hip Thrust a Corpo Libero';
    return 'Single Leg Hip Thrust';
  }
  
  if (name.includes('affondi') || name.includes('lunge')) {
    if (name.includes('jump')) return 'Jump Lunge';
    if (level === 'beginner') return 'Affondi';
    if (level === 'intermediate') return 'Affondi Camminati';
    return 'Jump Lunge';
  }
  
  if (name.includes('bulgaro')) {
    if (level === 'beginner') return 'Affondi';
    if (level === 'intermediate') return 'Squat Bulgaro';
    return 'Squat Bulgaro con Salto';
  }
  
  // PUSH - PETTORALI
  if (name.includes('panca') || name.includes('bench') || (name.includes('press') && !name.includes('leg'))) {
    if (name.includes('inclinat')) {
      if (level === 'beginner') return 'Pike Push-up';
      if (level === 'intermediate') return 'Pike Push-up Elevato';
      return 'Handstand Push-up Assistito';
    }
    if (level === 'beginner') return 'Push-up su Ginocchia';
    if (level === 'intermediate') return 'Push-up Standard';
    return 'Push-up Mani Strette';
  }
  
  // PUSH - SPALLE
  if (name.includes('military') || name.includes('shoulder') || name.includes('arnold') || (name.includes('press') && (name.includes('spalle') || name.includes('overhead')))) {
    if (level === 'beginner') return 'Pike Push-up';
    if (level === 'intermediate') return 'Pike Push-up Elevato';
    return 'Handstand Push-up Assistito';
  }
  
  if (name.includes('push press')) {
    if (level === 'beginner') return 'Pike Push-up';
    if (level === 'intermediate') return 'Pike Push-up con Salto';
    return 'Handstand Push-up';
  }
  
  // PUSH - DIPS E TRICIPITI
  if (name.includes('dips')) {
    if (level === 'beginner') return 'Dips su Sedia Assistiti';
    if (level === 'intermediate') return 'Dips su Sedia';
    return 'Dips Completi';
  }
  
  if (name.includes('croci') || name.includes('fly') || name.includes('cavi')) {
    if (level === 'beginner') return 'Plank Shoulder Taps';
    if (level === 'intermediate') return 'Pseudo Planche Lean';
    return 'Pseudo Planche Hold';
  }
  
  if (name.includes('lateral raise') || name.includes('alzate laterali')) {
    if (level === 'beginner') return 'Plank Shoulder Taps';
    if (level === 'intermediate') return 'Pike Hold';
    return 'L-Sit Progressione';
  }
  
  if (name.includes('tricep') || name.includes('french')) {
    if (level === 'beginner') return 'Diamond Push-up su Ginocchia';
    if (level === 'intermediate') return 'Diamond Push-up';
    return 'Triangle Push-up';
  }
  
  // PULL - TRAZIONI
  if (name.includes('trazioni') || name.includes('pull-up') || name.includes('pullup') || name.includes('lat machine') || name.includes('lat pull')) {
    if (name.includes('chin') || name.includes('presa stretta')) {
      if (level === 'beginner') return 'Chin-up Isometric Hold';
      if (level === 'intermediate') return 'Chin-up Negative';
      return 'Chin-up';
    }
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
  
  // PULL - BICIPITI
  if (name.includes('curl')) {
    if (level === 'beginner') return 'Chin-up Isometric Hold';
    if (level === 'intermediate') return 'Chin-up Negative';
    return 'Archer Pull-up';
  }
  
  // PULL - POSTERIORI SPALLA
  if (name.includes('face pull') || name.includes('rear delt')) {
    if (level === 'beginner') return 'Scapular Slides a Terra';
    if (level === 'intermediate') return 'YTW su Pavimento';
    return 'Scapular Pull-up';
  }
  
  if (name.includes('shrug')) {
    return 'Dead Hang';
  }
  
  // CORE
  if (name.includes('plank')) {
    if (level === 'beginner') return 'Plank su Ginocchia';
    if (level === 'intermediate') return 'Plank Standard';
    return 'Plank con Sollevamenti';
  }
  
  if (name.includes('crunch') || name.includes('sit-up') || name.includes('sit up')) {
    if (level === 'beginner') return 'Dead Bug';
    if (level === 'intermediate') return 'Bicycle Crunch';
    return 'V-ups';
  }
  
  if (name.includes('leg raise') || name.includes('leg raises')) {
    if (level === 'beginner') return 'Knee Raises';
    if (level === 'intermediate') return 'Leg Raises';
    return 'Toes to Bar';
  }
  
  // DEFAULT FALLBACK
  console.warn(`[CONVERT] ⚠️ No bodyweight alternative for: "${exerciseName}"`);
  if (level === 'beginner') return 'Plank';
  if (level === 'intermediate') return 'Mountain Climbers';
  return 'Burpees';
}


// ===== GENERAZIONE PROGRAMMA =====

export function generateProgram(input) {
  const { level, frequency, location, equipment, painAreas, assessments, goal, disabilityType, sportRole } = input;
  
  console.log('[PROGRAM] 🎯 generateProgram called with:', { 
    level, 
    frequency,
    location, 
    equipment, 
    goal,
    assessmentsCount: assessments?.length 
  });
  
  // ✅ PERFORMANCE SPORT A CASA
  if (goal === 'performance' && sportRole) {
    if (location === 'home' || !hasWeightedEquipment(equipment)) {
      return generatePerformanceHomeProgram(input);
    }
    return generatePerformanceProgramRubini(input);
  }
  
  const specificBodyParts = input.specificBodyParts?.map(part => 
    part === 'upper_chest' ? 'chest' : part
  );

  let split, daysPerWeek;
  
  if (frequency <= 2) {
    split = "full_body";
    daysPerWeek = frequency;
  } else if (frequency === 3) {
    split = "full_body";
    daysPerWeek = 3;
  } else if (frequency === 4) {
    split = "upper_lower";
    daysPerWeek = 4;
  } else if (frequency === 5) {
    split = "ppl_plus";
    daysPerWeek = 5;
  } else {
    split = "ppl";
    daysPerWeek = 6;
  }

  let progression;
  if (level === "beginner") progression = "wave_loading";
  else if (level === "intermediate") progression = "ondulata_settimanale";
  else progression = "ondulata_giornaliera";

  const weeklySchedule = generateWeeklySchedule(
    split, daysPerWeek, location || 'gym', equipment, painAreas,
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

// ✅ PERFORMANCE HOME (PLIOMETRIA + ISOMETRIA)
function generatePerformanceHomeProgram(input) {
  const { level, frequency, assessments, sportRole } = input;
  
  console.log('[PROGRAM] 🏃 Generating PERFORMANCE HOME program for:', sportRole);
  
  const weeklySchedule = [];
  
  // Scheda A: Esplosività Lower + Core
  weeklySchedule.push({
    dayName: "Esplosività Gambe",
    exercises: [
      { name: 'Jump Squat', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Focus esplosività' },
      { name: 'Broad Jump', sets: 3, reps: '5', rest: 120, weight: null, notes: 'Salto in lungo' },
      { name: 'Single Leg Hop', sets: 3, reps: '8 per gamba', rest: 90, weight: null, notes: 'Unilaterale' },
      { name: 'Squat Isometrico', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Tenuta 90°' },
      { name: 'Nordic Curl Eccentrico', sets: 3, reps: '5-6', rest: 120, weight: null, notes: 'Fase negativa lenta' },
      { name: 'Plank Dinamico', sets: 3, reps: '45-60s', rest: 60, weight: null, notes: 'Con spostamenti braccia' }
    ]
  });
  
  // Scheda B: Esplosività Upper + Coordinazione
  weeklySchedule.push({
    dayName: "Esplosività Busto",
    exercises: [
      { name: 'Clap Push-up', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Piegamenti esplosivi' },
      { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 90, weight: null, notes: 'Usa oggetto pesante' },
      { name: 'Pull-up Esplosiva', sets: 3, reps: '5-6', rest: 120, weight: null, notes: 'Fase concentrica veloce' },
      { name: 'Plank to Push-up', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Coordinazione core' },
      { name: 'Dead Hang Isometrico', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Tenuta sbarra' },
      { name: 'Bear Crawl', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Coordinazione full body' }
    ]
  });
  
  // Scheda C: Conditioning + Agilità
  weeklySchedule.push({
    dayName: "Conditioning Sport",
    exercises: [
      { name: 'Burpees', sets: 4, reps: '10-12', rest: 60, weight: null, notes: 'Conditioning generale' },
      { name: 'Lateral Bound', sets: 3, reps: '8 per lato', rest: 90, weight: null, notes: 'Agilità laterale' },
      { name: 'Mountain Climbers', sets: 3, reps: '20-30', rest: 45, weight: null, notes: 'Velocità' },
      { name: 'Pistol Squat Assistito', sets: 3, reps: '6-8 per gamba', rest: 120, weight: null, notes: 'Stabilità unilaterale' },
      { name: 'Hollow Body Hold', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Core isometrico' },
      { name: 'Sprint sul posto', sets: 4, reps: '20s', rest: 90, weight: null, notes: 'Conditioning anaerobico' }
    ]
  });
  
  return {
    name: `Performance Sport HOME - ${level}`,
    description: `${frequency}x/settimana, focus pliometria ed esplosività`,
    split: "performance_home",
    daysPerWeek: frequency,
    weeklySchedule: weeklySchedule.slice(0, frequency),
    progression: "progressive_overload_volume",
    includesDeload: level === "intermediate" || level === "advanced",
    deloadFrequency: 4,
    totalWeeks: 8,
    requiresEndCycleTest: true,
  };
}

// ✅ GENERAZIONE SCHEDE DISTINTE (A-B-C-D)
function generateWeeklySchedule(split, daysPerWeek, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const schedule = [];
  
  console.log('[PROGRAM] 📅 generateWeeklySchedule with:', { split, daysPerWeek, location, level });
  
  if (split === "full_body") {
    if (daysPerWeek === 1) {
      schedule.push({
        dayName: "Full Body",
        exercises: generateFullBodyDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
      });
    } else if (daysPerWeek === 2) {
      schedule.push(
        {
          dayName: "Full Body A",
          exercises: generateFullBodyDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
        },
        {
          dayName: "Full Body B",
          exercises: generateFullBodyDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
        }
      );
    } else if (daysPerWeek === 3) {
      schedule.push(
        {
          dayName: "Full Body A",
          exercises: generateFullBodyDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
        },
        {
          dayName: "Full Body B",
          exercises: generateFullBodyDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
        },
        {
          dayName: "Full Body C",
          exercises: generateFullBodyDay("C", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
        }
      );
    }
  } else if (split === "upper_lower") {
    schedule.push(
      { dayName: "Upper A", exercises: generateUpperDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower A", exercises: generateLowerDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Upper B", exercises: generateUpperDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower B", exercises: generateLowerDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  } else if (split === "ppl_plus") {
    schedule.push(
      { dayName: "Push", exercises: generatePushDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull", exercises: generatePullDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs", exercises: generateLegsDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Upper", exercises: generateUpperDay("C", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower", exercises: generateLowerDay("C", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  } else {
    schedule.push(
      { dayName: "Push A", exercises: generatePushDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull A", exercises: generatePullDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs A", exercises: generateLegsDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Push B", exercises: generatePushDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull B", exercises: generatePullDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs B", exercises: generateLegsDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  }
  return schedule;
}

// ✅ FULL BODY CON VARIANTI A-B-C
function generateFullBodyDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  
  console.log('[PROGRAM] 💪 generateFullBodyDay variant:', variant);
  
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    if (!painAreas.includes("knee") && !painAreas.includes("lower_back")) {
      exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound", assessments));
    }
    
    if (!painAreas.includes("shoulder")) {
      exercises.push(createExercise(safeExercise("Panca Piana"), location, equipment, baseLoad.bench, level, goal, "compound", assessments));
    }
    
    exercises.push(createExercise("Trazioni", location, equipment, baseLoad.pull, level, goal, "compound", assessments));
    
    if (!painAreas.includes("lower_back")) {
      exercises.push(createExercise("Romanian Deadlift", location, equipment, baseLoad.deadlift * 0.7, level, goal, "accessory", assessments));
    }
    
    if (!painAreas.includes("shoulder")) {
      exercises.push(createExercise("Lateral Raises", location, equipment, baseLoad.press * 0.3, level, goal, "isolation", assessments));
    }
    
    exercises.push(createExercise(goal === 'pregnancy' ? 'Bird Dog' : 'Plank', location, equipment, 0, level, goal, "core", assessments));
  }
  
  else if (variant === "B") {
    if (!painAreas.includes("lower_back")) {
      exercises.push(createExercise(safeExercise("Stacco"), location, equipment, baseLoad.deadlift, level, goal, "compound", assessments));
    }
    
    if (!painAreas.includes("shoulder")) {
      exercises.push(createExercise(safeExercise("Panca Inclinata"), location, equipment, baseLoad.bench * 0.85, level, goal, "compound", assessments));
    }
    
    exercises.push(createExercise("Rematore Bilanciere", location, equipment, baseLoad.pull * 0.9, level, goal, "compound", assessments));
    
    if (!painAreas.includes("knee")) {
      exercises.push(createExercise("Affondi", location, equipment, baseLoad.squat * 0.6, level, goal, "accessory", assessments));
    }
    
    if (!painAreas.includes("shoulder")) {
      exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "accessory", assessments));
    }
    
    exercises.push(createExercise("Leg Raises", location, equipment, 0, level, goal, "core", assessments));
  }
  
  else if (variant === "C") {
    if (!painAreas.includes("knee")) {
      exercises.push(createExercise(safeExercise("Front Squat"), location, equipment, baseLoad.squat * 0.8, level, goal, "compound", assessments));
    }
    
    exercises.push(createExercise("Dips", location, equipment, 0, level, goal, "compound", assessments));
    
    exercises.push(createExercise("Trazioni Presa Stretta", location, equipment, baseLoad.pull * 0.95, level, goal, "compound", assessments));
    
    if (!painAreas.includes("lower_back")) {
      exercises.push(createExercise("Good Morning", location, equipment, baseLoad.deadlift * 0.5, level, goal, "accessory", assessments));
    }
    
    exercises.push(createExercise("Face Pull", location, equipment, baseLoad.pull * 0.2, level, goal, "isolation", assessments));
    
    exercises.push(createExercise("Dead Bug", location, equipment, 0, level, goal, "core", assessments));
  }

  return exercises;
}

function generateUpperDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Panca Piana"), location, equipment, baseLoad.bench, level, goal, "compound", assessments));
    exercises.push(createExercise("Trazioni", location, equipment, baseLoad.pull, level, goal, "compound", assessments));
    exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "compound", assessments));
    exercises.push(createExercise("Curl Bilanciere", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("Tricep Pushdown", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
  }
  
  else if (variant === "B") {
    exercises.push(createExercise(safeExercise("Panca Inclinata"), location, equipment, baseLoad.bench * 0.85, level, goal, "compound", assessments));
    exercises.push(createExercise("Rematore Bilanciere", location, equipment, baseLoad.pull * 0.9, level, goal, "compound", assessments));
    exercises.push(createExercise("Arnold Press", location, equipment, baseLoad.press * 0.85, level, goal, "compound", assessments));
    exercises.push(createExercise("Hammer Curl", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("French Press", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
  }
  
  else if (variant === "C") {
    exercises.push(createExercise("Dips", location, equipment, 0, level, goal, "compound", assessments));
    exercises.push(createExercise("Chin-up", location, equipment, baseLoad.pull * 0.95, level, goal, "compound", assessments));
    exercises.push(createExercise("Push Press", location, equipment, baseLoad.press * 1.1, level, goal, "compound", assessments));
    exercises.push(createExercise("Face Pull", location, equipment, baseLoad.pull * 0.2, level, goal, "isolation", assessments));
    exercises.push(createExercise("Lateral Raises", location, equipment, baseLoad.press * 0.3, level, goal, "isolation", assessments));
  }

  return exercises;
}

function generateLowerDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, equipment, baseLoad.deadlift * 0.7, level, goal, "compound", assessments));
    exercises.push(createExercise("Leg Curl", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("Leg Extension", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation", assessments));
    if (!painAreas.includes("ankles")) {
      exercises.push(createExercise("Calf Raises", location, equipment, baseLoad.squat * 0.5, level, goal, "isolation", assessments));
    }
  }
  
  else if (variant === "B") {
    exercises.push(createExercise(safeExercise("Stacco"), location, equipment, baseLoad.deadlift, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Front Squat"), location, equipment, baseLoad.squat * 0.8, level, goal, "compound", assessments));
    exercises.push(createExercise("Affondi", location, equipment, baseLoad.squat * 0.6, level, goal, "accessory", assessments));
    exercises.push(createExercise("Nordic Curl", location, equipment, 0, level, goal, "accessory", assessments));
    if (!painAreas.includes("ankles")) {
      exercises.push(createExercise("Seated Calf Raises", location, equipment, baseLoad.squat * 0.4, level, goal, "isolation", assessments));
    }
  }
  
  else if (variant === "C") {
    exercises.push(createExercise(safeExercise("Sumo Deadlift"), location, equipment, baseLoad.deadlift * 0.9, level, goal, "compound", assessments));
    exercises.push(createExercise("Squat Bulgaro", location, equipment, baseLoad.squat * 0.6, level, goal, "compound", assessments));
    exercises.push(createExercise("Leg Press", location, equipment, baseLoad.squat * 1.3, level, goal, "accessory", assessments));
    exercises.push(createExercise("Good Morning", location, equipment, baseLoad.deadlift * 0.5, level, goal, "accessory", assessments));
    exercises.push(createExercise("Hip Thrust", location, equipment, baseLoad.squat * 0.8, level, goal, "accessory", assessments));
  }

  return exercises;
}

function generatePushDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Panca Piana"), location, equipment, baseLoad.bench, level, goal, "compound", assessments));
    exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "compound", assessments));
    exercises.push(createExercise("Panca Inclinata Manubri", location, equipment, baseLoad.bench * 0.7, level, goal, "accessory", assessments));
    exercises.push(createExercise("Lateral Raises", location, equipment, baseLoad.press * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("Tricep Pushdown", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
  } else {
    exercises.push(createExercise(safeExercise("Panca Inclinata"), location, equipment, baseLoad.bench * 0.85, level, goal, "compound", assessments));
    exercises.push(createExercise("Arnold Press", location, equipment, baseLoad.press * 0.85, level, goal, "compound", assessments));
    exercises.push(createExercise("Dips", location, equipment, 0, level, goal, "compound", assessments));
    exercises.push(createExercise("Croci Cavi Alti", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("French Press", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
  }

  return exercises;
}

function generatePullDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Stacco"), location, equipment, baseLoad.deadlift, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Trazioni"), location, equipment, baseLoad.pull, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Rematore Bilanciere"), location, equipment, baseLoad.pull * 0.9, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Curl Bilanciere"), location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise(safeExercise("Face Pull"), location, equipment, baseLoad.pull * 0.2, level, goal, "isolation", assessments));
  } else {
    exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, equipment, baseLoad.deadlift * 0.7, level, goal, "compound", assessments));
    exercises.push(createExercise("Chin-up", location, equipment, baseLoad.pull * 0.95, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Rematore Manubri"), location, equipment, baseLoad.pull * 0.8, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Hammer Curl"), location, equipment, baseLoad.bench * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise(safeExercise("Shrugs"), location, equipment, baseLoad.deadlift * 0.4, level, goal, "isolation", assessments));
  }

  return exercises;
}

function generateLegsDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, equipment, baseLoad.deadlift * 0.7, level, goal, "compound", assessments));
    exercises.push(createExercise("Leg Press", location, equipment, baseLoad.squat * 1.3, level, goal, "accessory", assessments));
    exercises.push(createExercise("Leg Curl", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation", assessments));
    exercises.push(createExercise("Leg Extension", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation", assessments));
  } else {
    exercises.push(createExercise(safeExercise("Front Squat"), location, equipment, baseLoad.squat * 0.8, level, goal, "compound", assessments));
    exercises.push(createExercise(safeExercise("Stacco Sumo"), location, equipment, baseLoad.deadlift * 0.9, level, goal, "compound", assessments));
    exercises.push(createExercise("Squat Bulgaro", location, equipment, baseLoad.squat * 0.6, level, goal, "accessory", assessments));
    exercises.push(createExercise("Nordic Curl", location, equipment, 0, level, goal, "accessory", assessments));
    exercises.push(createExercise("Hip Thrust", location, equipment, baseLoad.squat * 0.8, level, goal, "accessory", assessments));
  }

  return exercises;
}

// ✅ CREATE EXERCISE CON RANGE RIDOTTO E PARTENZA GRADUALE
function createExercise(name, location, equipment, baseWeight, level, goal, type, assessments) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.intermediate;
  
  let sets = type === "compound" ? config.compoundSets : config.accessorySets;
  let rest = type === "compound" ? 180 : type === "accessory" ? 120 : 60;

  console.log('[PROGRAM] 🎯 createExercise:', { name, level, type, sets });

  // Cerca assessment
  const assessment = assessments?.find(a => 
    a.exerciseName && name.toLowerCase().includes(a.exerciseName.toLowerCase())
  );

  // ✅ USA PROGRESSIONE BODYWEIGHT
  if (assessment?.variant && assessment?.level && BODYWEIGHT_PROGRESSIONS[assessment.exerciseName]) {
    const progressionName = BODYWEIGHT_PROGRESSIONS[assessment.exerciseName][assessment.level];
    const targetReps = assessment.maxReps || 12;
    const range = config.repsRange;
    
    console.log('[PROGRAM] ✅ Bodyweight progression:', {
      base: assessment.exerciseName,
      level: assessment.level,
      progression: progressionName,
      repsRange: `${targetReps - range}-${targetReps + range}`
    });
    
    return {
      name: progressionName,
      sets,
      reps: range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`,
      rest,
      weight: null,
      notes: `Progressione livello ${assessment.level} - ${assessment.variant}`,
    };
  }

  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal || 'muscle_gain', level);

  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' ? getPregnancySafeAlternative(name) : getDisabilitySafeAlternative(name);
      return {
        name: safeAlternative,
        sets,
        reps: type === "compound" ? "12-15" : "15-20",
        rest,
        weight: null,
        notes: `Esercizio adattato per sicurezza`,
      };
    }
    return exerciseOrGiantSet;
  }

  const isBodyweight = isBodyweightExercise(exerciseOrGiantSet);
  const hasEquipment = hasWeightedEquipment(equipment);

  // ✅ RANGE REPS BASATO SU LIVELLO
  let targetReps = 10;
  let reps;
  
  if (isBodyweight) {
    targetReps = type === "compound" ? 12 : type === "accessory" ? 15 : 20;
  } else {
    targetReps = type === "compound" ? 5 : type === "accessory" ? 10 : 12;
  }
  
  if (type === "core") {
    reps = "30-60s";
  } else {
    const range = config.repsRange;
    reps = range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`;
  }

  // ✅ CALCOLO PESO CON PARTENZA GRADUALE
  let trainingWeight = null;
  
  if (isBodyweight) {
    trainingWeight = null;
    console.log('[PROGRAM] ⭕ No weight (bodyweight)');
    
  } else if (location === 'gym' || hasEquipment) {
    if (baseWeight > 0) {
      // ✅ PARTENZA GRADUALE PRINCIPIANTI (60% week 1-2)
      const startWeight = baseWeight * config.startPercentage;
      const finalReps = typeof reps === 'string' && reps.includes('-') 
        ? parseInt(reps.split('-')[1]) 
        : targetReps;
      
      trainingWeight = calculateTrainingWeight(startWeight, finalReps, config.RIR);
      
      // Cap al massimo disponibile
      if (hasEquipment && equipment.dumbbellMaxKg && trainingWeight > equipment.dumbbellMaxKg) {
        trainingWeight = equipment.dumbbellMaxKg;
      }
      
      console.log(`[PROGRAM] ✅ Training weight (${level}): ${baseWeight}kg → ${config.startPercentage * 100}% = ${trainingWeight}kg (RIR ${config.RIR})`);
    }
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: trainingWeight,
    notes: type === "compound" ? `RIR ${config.RIR} - Week 1-2 al ${config.startPercentage * 100}%` : "Esercizio complementare",
  };
}

function getBaseLoads(assessments) {
  if (!assessments || !Array.isArray(assessments)) {
    console.warn('[PROGRAM] ⚠️ assessments undefined, using defaults');
    return {
      squat: 50,
      deadlift: 60,
      bench: 40,
      pull: 30,
      press: 30
    };
  }
  
  const findLoad = (exercise) => {
    const assessment = assessments.find((a) =>
      a.exerciseName?.toLowerCase().includes(exercise.toLowerCase())
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

function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null;
  
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  
  return Math.round(weight / 2.5) * 2.5;
}

function isExerciseSafeForPregnancy(exerciseName) {
  const unsafeExercises = [
    'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
    'Panca Piana', 'Bench Press', 'Floor Press',
    'Stacco', 'Deadlift', 'Romanian Deadlift', 'Good Morning',
    'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
    'Front Squat', 'Back Squat',
  ];
  
  return !unsafeExercises.some(unsafe => 
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

function isExerciseSafeForDisability(exerciseName, disabilityType) {
  const complexExercises = [
    'Clean', 'Snatch', 'Clean & Jerk',
    'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
    'Overhead Squat', 'Snatch Grip Deadlift',
  ];
  
  return !complexExercises.some(complex => 
    exerciseName.toLowerCase().includes(complex.toLowerCase())
  );
}

function getPregnancySafeAlternative(exerciseName) {
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

function getDisabilitySafeAlternative(exerciseName) {
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

function generatePerformanceProgramRubini(input) {
  return generateProgram({ ...input, goal: 'strength' });
}

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
