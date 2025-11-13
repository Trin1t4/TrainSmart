import { GOAL_CONFIGS, LEVEL_CONFIG } from './constants.js';
import { createExercise } from './exerciseCreation.js';

/**
 * Genera programma standard basato su goal, livello, frequenza
 */
export function generateStandardProgram(input) {
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

  console.log('[STANDARD] 🎯 Generating standard program:', { level, frequency, location, goal });

  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain;
  const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG.intermediate;

  // Determina split in base alla frequenza
  let split = 'full_body';
  if (frequency >= 6) {
    split = 'ppl'; // Push Pull Legs
  } else if (frequency >= 4) {
    split = 'upper_lower';
  } else if (frequency >= 3) {
    split = 'full_body';
  } else {
    split = 'full_body'; // Default per 2 giorni
  }

  console.log('[STANDARD] ✅ Split selected:', split);

  // Genera schedule settimanale
  const weeklySchedule = generateWeeklySchedule(
    split,
    frequency,
    location,
    equipment,
    painAreas,
    assessments,
    level,
    goal,
    disabilityType,
    sportRole
  );

  // Calcola settimane totali e deload
  const totalWeeks = calculateTotalWeeks(goal, level);
  const includesDeload = totalWeeks >= 4;

  return {
    name: `${goalConfig.name} - ${split.toUpperCase()}`,
    description: `Programma ${goalConfig.name} con split ${split}`,
    split: split,
    daysPerWeek: frequency,
    weeklySchedule: weeklySchedule,
    progression: goalConfig.focus,
    includesDeload: includesDeload,
    totalWeeks: totalWeeks,
    deloadWeek: includesDeload ? totalWeeks - 1 : null
  };
}

/**
 * Genera la schedulazione settimanale completa
 */
export function generateWeeklySchedule(
  split,
  daysPerWeek,
  location,
  equipment,
  painAreas,
  assessments,
  level,
  goal,
  disabilityType,
  sportRole
) {
  console.log('[SCHEDULE] 📅 Generating weekly schedule for split:', split);

  switch (split) {
    case 'full_body':
      return generateFullBodySchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal);
    
    case 'upper_lower':
      return generateUpperLowerSchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal);
    
    case 'ppl':
      return generatePPLSchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal);
    
    default:
      return generateFullBodySchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal);
  }
}

/**
 * Full Body Schedule (2-3 giorni/settimana)
 */
function generateFullBodySchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal) {
  const schedule = [];

  const compoundExercises = [
    'Squat',
    'Panca Piana',
    'Trazioni',
    'Military Press',
    'Stacco Rumeno',
    'Rematore Bilanciere'
  ];

  const coreExercises = ['Plank', 'Leg Raises', 'Dead Bug'];

  for (let day = 1; day <= daysPerWeek; day++) {
    const dayExercises = [];

    // Compound exercises (rotation per day)
    const compoundsForDay = compoundExercises.slice((day - 1) * 2, (day - 1) * 2 + 4);

    compoundsForDay.forEach(exerciseName => {
      const exercise = createExercise(
        exerciseName,
        location,
        equipment,
        null,
        level,
        goal,
        'compound',
        assessments
      );
      if (exercise) {
        dayExercises.push(exercise);
      }
    });

    // Core exercise
    const coreExercise = createExercise(
      coreExercises[day % coreExercises.length],
      location,
      equipment,
      null,
      level,
      goal,
      'core',
      assessments
    );
    if (coreExercise) {
      dayExercises.push(coreExercise);
    }

    schedule.push({
      dayName: `Full Body Day ${day}`,
      exercises: dayExercises
    });
  }

  return schedule;
}

/**
 * Upper/Lower Schedule (4 giorni/settimana)
 */
function generateUpperLowerSchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal) {
  const schedule = [];

  const upperExercises = ['Panca Piana', 'Trazioni', 'Military Press', 'Rematore Bilanciere', 'Dips'];
  const lowerExercises = ['Squat', 'Stacco Rumeno', 'Affondi', 'Front Squat'];
  const coreExercises = ['Plank', 'Leg Raises', 'Dead Bug'];

  for (let day = 1; day <= daysPerWeek; day++) {
    const dayExercises = [];
    const isUpperDay = day % 2 === 1;

    if (isUpperDay) {
      // Upper day
      upperExercises.forEach(exerciseName => {
        const exercise = createExercise(
          exerciseName,
          location,
          equipment,
          null,
          level,
          goal,
          'compound',
          assessments
        );
        if (exercise) {
          dayExercises.push(exercise);
        }
      });

      schedule.push({
        dayName: `Upper Body Day ${Math.ceil(day / 2)}`,
        exercises: dayExercises
      });
    } else {
      // Lower day
      lowerExercises.forEach(exerciseName => {
        const exercise = createExercise(
          exerciseName,
          location,
          equipment,
          null,
          level,
          goal,
          'compound',
          assessments
        );
        if (exercise) {
          dayExercises.push(exercise);
        }
      });

      // Core
      const coreExercise = createExercise(
        coreExercises[Math.floor(day / 2) % coreExercises.length],
        location,
        equipment,
        null,
        level,
        goal,
        'core',
        assessments
      );
      if (coreExercise) {
        dayExercises.push(coreExercise);
      }

      schedule.push({
        dayName: `Lower Body Day ${Math.floor(day / 2)}`,
        exercises: dayExercises
      });
    }
  }

  return schedule;
}

/**
 * Push Pull Legs Schedule (6 giorni/settimana)
 */
function generatePPLSchedule(daysPerWeek, location, equipment, painAreas, assessments, level, goal) {
  const schedule = [];

  const pushExercises = ['Panca Piana', 'Military Press', 'Panca Inclinata', 'Dips'];
  const pullExercises = ['Trazioni', 'Rematore Bilanciere', 'Face Pull', 'Trazioni Presa Stretta'];
  const legExercises = ['Squat', 'Stacco Rumeno', 'Affondi', 'Front Squat'];
  const coreExercises = ['Plank', 'Leg Raises', 'Dead Bug', 'Bird Dog'];

  for (let day = 1; day <= daysPerWeek; day++) {
    const dayExercises = [];
    const dayMod = (day - 1) % 3;

    if (dayMod === 0) {
      // Push Day
      pushExercises.forEach(exerciseName => {
        const exercise = createExercise(
          exerciseName,
          location,
          equipment,
          null,
          level,
          goal,
          'compound',
          assessments
        );
        if (exercise) {
          dayExercises.push(exercise);
        }
      });

      schedule.push({
        dayName: `Push Day ${Math.floor((day - 1) / 3) + 1}`,
        exercises: dayExercises
      });

    } else if (dayMod === 1) {
      // Pull Day
      pullExercises.forEach(exerciseName => {
        const exercise = createExercise(
          exerciseName,
          location,
          equipment,
          null,
          level,
          goal,
          'compound',
          assessments
        );
        if (exercise) {
          dayExercises.push(exercise);
        }
      });

      schedule.push({
        dayName: `Pull Day ${Math.floor((day - 1) / 3) + 1}`,
        exercises: dayExercises
      });

    } else {
      // Legs Day
      legExercises.forEach(exerciseName => {
        const exercise = createExercise(
          exerciseName,
          location,
          equipment,
          null,
          level,
          goal,
          'compound',
          assessments
        );
        if (exercise) {
          dayExercises.push(exercise);
        }
      });

      // Core
      const coreExercise = createExercise(
        coreExercises[Math.floor((day - 1) / 3) % coreExercises.length],
        location,
        equipment,
        null,
        level,
        goal,
        'core',
        assessments
      );
      if (coreExercise) {
        dayExercises.push(coreExercise);
      }

      schedule.push({
        dayName: `Legs Day ${Math.floor((day - 1) / 3) + 1}`,
        exercises: dayExercises
      });
    }
  }

  return schedule;
}

/**
 * Calcola numero settimane totali in base a goal e livello
 */
function calculateTotalWeeks(goal, level) {
  if (goal === 'strength') {
    return level === 'beginner' ? 6 : level === 'intermediate' ? 8 : 12;
  } else if (goal === 'muscle_gain' || goal === 'toning') {
    return level === 'beginner' ? 8 : level === 'intermediate' ? 10 : 12;
  } else if (goal === 'fat_loss') {
    return 8; // Fisso per dimagrimento
  } else if (goal === 'performance') {
    return 8;
  } else {
    return 8; // Default
  }
}

console.log('✅ standardProgram.js module loaded (ES modules)');
```

