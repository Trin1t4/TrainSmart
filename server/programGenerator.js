// ===== FORMULE E CALCOLI =====

export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
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

const SOCCER_ROLE_EXERCISES = {
  portiere: ['Box Jump', 'Lateral Bound', 'Med Ball Slam', 'Single Leg RDL', 'Split Squat Jump', 'Plank with Reach'],
  difensore: ['Squat', 'Deadlift', 'Rematore Bilanciere', 'Panca Piana', 'Core Rotation', 'Farmer Walk'],
  centrocampista: ['Burpees', 'Mountain Climbers', 'Step-up', 'Battle Ropes', 'Box Step', 'Kettlebell Swing'],
  attaccante: ['Sprint Drills', 'Jump Squat', 'Power Clean', 'Box Jump', 'Single Leg Bound', 'Explosive Push-up'],
};

function getExercisesForBodyPart(bodyPart, level) {
  const exercises = BODY_PART_EXERCISES[bodyPart] || [];
  if (level === 'beginner') return exercises.slice(0, 1);
  if (level === 'intermediate') return exercises.slice(0, 2);
  return exercises.slice(0, 2);
}

function getExercisesForSoccerRole(role, level) {
  const exercises = SOCCER_ROLE_EXERCISES[role] || [];
  if (level === 'beginner') return exercises.slice(0, 2);
  if (level === 'intermediate') return exercises.slice(0, 3);
  return exercises.slice(0, 3);
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
  exercises.push(createExercise(variant === "A" ? "Curl bilanciere" : "French Press", location, hasGym, equipment, 0, level, goal, "isolation"));

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

  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, 0, level, goal, "isolation"));
  
  if (!painAreas.includes("ankles")) {
    exercises.push(createExercise("Calf Raises", location, hasGym, equipment, 0, level, goal, "isolation"));
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
  exercises.push(createExercise("Croci manubri", location, hasGym, equipment, 0, level, goal, "isolation"));
  exercises.push(createExercise("French Press", location, hasGym, equipment, 0, level, goal, "isolation"));

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
  exercises.push(createExercise(safeExercise("Curl bilanciere"), location, hasGym, equipment, 0, level, goal, "isolation"));
  exercises.push(createExercise(safeExercise("Face Pull"), location, hasGym, equipment, 0, level, goal, "isolation"));

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
  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, 0, level, goal, "isolation"));
  exercises.push(createExercise("Leg Extension", location, hasGym, equipment, 0, level, goal, "isolation"));

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

  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal, level);

  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' ? getPregnancySafeAlternative(name) : getDisabilitySafeAlternative(name);
      return {
        name: safeAlternative,
        sets,
        reps,
        rest,
        weight: baseWeight > 0 ? calculateTargetWeight(baseWeight, 0.7) : null,
        notes: `Esercizio adattato per sicurezza`,
      };
    }
    return exerciseOrGiantSet;
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: baseWeight > 0 ? calculateTargetWeight(baseWeight, 0.7) : null,
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
