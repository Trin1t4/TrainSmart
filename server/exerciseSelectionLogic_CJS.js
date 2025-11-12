import { GOAL_CONFIGS, EXERCISE_PROGRESSIONS } from './GOAL_CONFIGS_COMPLETE_CJS.js';

/**
 * Seleziona l'esercizio corretto basato su level, goal e assessment
 * 
 * ✅ NUOVA FIRMA (con level parametro esplicito):
 * @param {string} exerciseBaseName - Nome esercizio base (es: 'Squat')
 * @param {string} level - NUOVO: livello esplicito ('beginner', 'intermediate', 'advanced')
 * @param {string} goal - Obiettivo allenamento ('strength', 'muscle_gain', etc)
 * @param {object} assessment - Dati assessment (backup se serve)
 * @param {number} weekNumber - Settimana di allenamento (default: 1)
 * @returns {object} - Esercizio selezionato con config
 */
function selectExerciseByGoal(exerciseBaseName, level, goal, assessment, weekNumber = 1) {
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain;
  const progressions = EXERCISE_PROGRESSIONS[exerciseBaseName];

  if (!progressions || !progressions[goal]) {
    console.warn(`[SELECT] No progressions found for ${exerciseBaseName} + ${goal}`);
    return null;
  }

  const exerciseList = progressions[goal];

  // ===== FORZA: Logica speciale =====
  if (goal === 'strength') {
    return selectStrengthExercise(exerciseBaseName, assessment, exerciseList, weekNumber);
  }

  // ===== ALTRI GOAL: Selezione per livello (AGGIORNATO CON LEVEL PARAMETRO) =====
  return selectByLevel(exerciseList, assessment, level);
}

/**
 * FORZA: Selezione + Progressione Lineare
 */
function selectStrengthExercise(exerciseBaseName, assessment, exerciseList, weekNumber) {
  const goalConfig = GOAL_CONFIGS.strength;
  let currentExerciseLevel = 1;
  let currentMaxReps = 0;

  if (assessment && assessment.variant) {
    const foundExercise = exerciseList.find(ex =>
      ex.name.toLowerCase() === assessment.variant.toLowerCase()
    );

    if (foundExercise) {
      currentExerciseLevel = foundExercise.level;
      currentMaxReps = assessment.maxReps || 0;
    }
  }

  if (!assessment || currentMaxReps === 0) {
    const firstExercise = exerciseList[0];
    return {
      name: firstExercise.name,
      level: firstExercise.level,
      sets: 3,
      reps: '3-3-3',
      rest: goalConfig.rest.compound,
      notes: 'Forza - Livello 1: Parti da 3 reps, progressione lineare verso 12',
      progression: 'linear',
      targetReps: firstExercise.unlockReps || 12
    };
  }

  if (currentMaxReps >= (exerciseList[currentExerciseLevel - 1]?.unlockReps || 12)) {
    const nextExercise = exerciseList[currentExerciseLevel];

    if (nextExercise) {
      return {
        name: nextExercise.name,
        level: nextExercise.level,
        sets: 3,
        reps: '3-3-3',
        rest: goalConfig.rest.compound,
        notes: `✅ Livello sbloccato! Test ${nextExercise.name} - Se >= 3 reps, resta qui`,
        progression: 'unlock_test',
        previousExercise: exerciseList[currentExerciseLevel - 1].name,
        targetReps: nextExercise.unlockReps || 12
      };
    } else {
      return {
        name: exerciseList[currentExerciseLevel - 1].name,
        level: currentExerciseLevel,
        sets: 4,
        reps: calculateLinearReps(currentMaxReps, weekNumber),
        rest: goalConfig.rest.compound,
        notes: 'Forza - Livello massimo: Accumula volume',
        progression: 'volume',
        targetReps: 20
      };
    }
  }

  const currentExercise = exerciseList[currentExerciseLevel - 1];
  const repsString = calculateLinearReps(currentMaxReps, weekNumber);

  return {
    name: currentExercise.name,
    level: currentExercise.level,
    sets: 3,
    reps: repsString,
    rest: goalConfig.rest.compound,
    notes: `Forza - Settimana ${weekNumber}: Progressione verso ${currentExercise.unlockReps} reps`,
    progression: 'linear',
    targetReps: currentExercise.unlockReps || 12,
    weeksToUnlock: Math.ceil(((currentExercise.unlockReps || 12) - currentMaxReps) / 3)
  };
}

/**
 * Calcola reps per progressione lineare
 */
function calculateLinearReps(startReps, weekNumber) {
  const baseReps = Math.max(3, startReps);
  const weeksElapsed = weekNumber - 1;
  const targetReps = baseReps + Math.floor(weeksElapsed / 3);
  const setsAtTarget = (weeksElapsed % 3) + 1;

  const reps = [];

  for (let i = 1; i <= 3; i++) {
    if (i <= setsAtTarget) {
      reps.push(targetReps);
    } else {
      reps.push(targetReps - 1);
    }
  }

  return reps.join('-');
}

/**
 * ✅ NUOVA VERSIONE: selectByLevel riceve LEVEL PARAMETRO ESPLICITO
 * 
 * @param {array} exerciseList - Lista progressioni per quel goal
 * @param {object} assessment - Dati utente (backup)
 * @param {string} levelParam - NUOVO: level esplicito ricevuto da caller
 * @returns {object} - Esercizio selezionato
 */
function selectByLevel(exerciseList, assessment, levelParam) {
  if (!exerciseList || exerciseList.length === 0) {
    return null;
  }

  // 🎯 PRIORITÀ: levelParam > assessment.level > default beginner
  const levelMap = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  };

  let levelNum;

  // Usa levelParam se viene passato (PRIMARY)
  if (levelParam) {
    levelNum = levelMap[levelParam] || 1;
    console.log(`[SELECT] Using explicit level param: ${levelParam} (${levelNum})`);
  }
  // Fallback a assessment.level se levelParam non c'è (SECONDARY)
  else if (assessment && assessment.level) {
    levelNum = levelMap[assessment.level] || 1;
    console.log(`[SELECT] Using assessment.level: ${assessment.level} (${levelNum})`);
  }
  // Default a beginner se niente (TERTIARY)
  else {
    levelNum = 1;
    console.log(`[SELECT] Using default level: beginner (1)`);
  }

  const exercise = exerciseList.find(ex => ex.level === levelNum) || exerciseList[0];

  return {
    ...exercise,
    sets: 3,
    rest: 90,
    selectedLevel: levelNum
  };
}

/**
 * Helper: Verifica se utente può passare a livello successivo
 */
function canUnlockNextLevel(currentExercise, maxReps, goal) {
  if (goal !== 'strength') return false;

  const unlockThreshold = GOAL_CONFIGS.strength.unlockThreshold;
  return maxReps >= unlockThreshold;
}

/**
 * Helper: Test livello successivo
 */
function testNextLevel(exerciseBaseName, currentLevel, goal) {
  const progressions = EXERCISE_PROGRESSIONS[exerciseBaseName];

  if (!progressions || !progressions[goal]) return null;

  const exerciseList = progressions[goal];
  const nextExercise = exerciseList.find(ex => ex.level === currentLevel + 1);

  return nextExercise || null;
}

// ===== EXPORT ES MODULES =====
export {
  selectExerciseByGoal,
  selectByLevel,
  selectStrengthExercise,
  canUnlockNextLevel,
  testNextLevel,
  calculateLinearReps
};

console.log('✅ Exercise selection logic loaded (ES modules) - WITH LEVEL PARAMETRO FI