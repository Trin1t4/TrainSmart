import { EXERCISE_DATABASE } from './exerciseDatabase.js';
import { selectExerciseByGoal } from './exerciseSelectionLogic_CJS.js';

/**
 * Seleziona la variante corretta usando selectExerciseByGoal (assessment-aware)
 */
export function selectExerciseVariant(exerciseName, location, equipment = {}, goal = 'muscle_gain', level = 'intermediate', weekNumber = 1, assessment = null) {
  console.log(`[VARIANT] selectExerciseVariant: ${exerciseName}, location=${location}, goal=${goal}, level=${level}`);

  // Se home senza equipment, usa selectExerciseByGoal per logica intelligente
  if (location === 'home' && !hasEquipment(equipment)) {
    const baseName = mapToBaseName(exerciseName);
    // FIXED: Parametri corretti (exerciseBaseName, level, goal, assessment, weekNumber)
    const selected = selectExerciseByGoal(baseName, level, goal, assessment, weekNumber);
    if (selected) {
      console.log(`[VARIANT] → Selected from selectExerciseByGoal: ${selected.name}`);
      return {
        name: selected.name,
        sets: selected.sets,
        reps: selected.reps,
        rest: selected.rest,
        category: 'compound',
        notes: selected.notes || `${goal} - Week ${weekNumber}`
      };
    }
  }

  // Fallback: ritorna esercizio standard
  console.log(`[VARIANT] → Fallback to original: ${exerciseName}`);
  return {
    name: exerciseName,
    sets: 3,
    reps: '8-12',
    rest: 90,
    category: 'compound'
  };
}

/**
 * Ottiene l'esercizio adatto per la location specificata
 */
export function getExerciseForLocation(exerciseName, location, equipment = {}, goal = 'muscle_gain', level = 'intermediate') {
  const exerciseData = EXERCISE_DATABASE[exerciseName];
  if (!exerciseData) {
    console.warn(`[SUBSTITUTION] Exercise "${exerciseName}" not found in database`);
    return exerciseName;
  }

  console.log(`[SUBSTITUTION] getExerciseForLocation: ${exerciseName}, location=${location}, goal=${goal}, level=${level}`);

  // Se gym, ritorna variante gym
  if (location === 'gym' && exerciseData.gym) {
    console.log(`[SUBSTITUTION] → GYM variant: ${exerciseData.gym.name}`);
    return exerciseData.gym.name || exerciseName;
  }

  // Se home con equipment
  if (location === 'home' && hasEquipment(equipment) && exerciseData.homeWithEquipment) {
    const homeName = exerciseData.homeWithEquipment.name || exerciseName;
    console.log(`[SUBSTITUTION] → HOME with equipment: ${homeName}`);
    return homeName;
  }

  // Se home bodyweight - FIXED: homeBodyweight[goal] è una stringa, non un oggetto
  if (location === 'home' && exerciseData.homeBodyweight) {
    const goalVariant = exerciseData.homeBodyweight[goal];
    if (goalVariant && typeof goalVariant === 'string') {
      console.log(`[SUBSTITUTION] → HOME bodyweight for goal ${goal}: ${goalVariant}`);
      return goalVariant;
    }
    // Fallback a muscle_gain se goal non trovato
    const fallbackVariant = exerciseData.homeBodyweight.muscle_gain || exerciseData.homeBodyweight.general_fitness;
    if (fallbackVariant) {
      console.log(`[SUBSTITUTION] → HOME bodyweight fallback: ${fallbackVariant}`);
      return fallbackVariant;
    }
  }

  console.log(`[SUBSTITUTION] → No substitution found, returning original: ${exerciseName}`);
  return exerciseName;
}

// Helper: controlla se c'è equipment disponibile
function hasEquipment(equipment) {
  if (!equipment) return false;
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  );
}

// Helper che mappa nome italiano → nome base in EXERCISE_PROGRESSIONS
function mapToBaseName(exerciseName) {
  const name = exerciseName.toLowerCase();
  if (name.includes('squat')) return 'Squat';
  if (name.includes('panca') || name.includes('push') || name.includes('bench')) return 'Push-up';
  if (name.includes('trazioni') || name.includes('pull')) return 'Trazioni';
  if (name.includes('military') || name.includes('press') || name.includes('pike') || name.includes('hspu') || name.includes('spalle')) return 'Pike Push-up';
  if (name.includes('stacco') || name.includes('rdl') || name.includes('deadlift') || name.includes('affondi') || name.includes('lunge')) return 'Affondi';
  if (name.includes('plank')) return 'Plank';
  if (name.includes('dips')) return 'Dips';
  if (name.includes('leg raise')) return 'Leg Raises';

  // Fallback: ritorna il nome originale
  return exerciseName;
}

console.log('✅ Exercise substitutions loaded (selectExerciseByGoal integrated)');
