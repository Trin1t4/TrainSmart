import { EXERCISE_DATABASE } from './exerciseDatabase.js';
import { selectExerciseByGoal } from './exerciseSelectionLogic_CJS.js';

/**
 * Seleziona la variante corretta usando selectExerciseByGoal (assessment-aware)
 */
export function selectExerciseVariant(exerciseName, location, equipment = {}, goal = 'muscle_gain', weekNumber = 1, assessment = null) {
  // Se home senza equipment, usa selectExerciseByGoal per logica intelligente
  if (location === 'home' && !hasEquipment(equipment)) {
    const baseName = mapToBaseName(exerciseName);
    const selected = selectExerciseByGoal(baseName, assessment, goal, weekNumber);
    if (selected) {
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
  // Se gym, ritorna variante gym
  if (location === 'gym' && exerciseData.gym) {
    return exerciseData.gym.name || exerciseName;
  }
  // Se home con equipment
  if (location === 'home' && hasEquipment(equipment) && exerciseData.homeEquipment) {
    return exerciseData.homeEquipment[goal]?.[level] || exerciseData.homeEquipment.name || exerciseName;
  }
  // Se home bodyweight
  if (location === 'home' && exerciseData.homeBodyweight) {
    return exerciseData.homeBodyweight[goal]?.[level] || exerciseData.homeBodyweight.name || exerciseName;
  }
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
