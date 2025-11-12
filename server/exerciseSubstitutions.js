// ===== EXERCISE SUBSTITUTIONS =====
// Gestione conversioni esercizi e varianti goal-specific

import { EXERCISE_DATABASE } from './exerciseDatabase.js';

/**
 * Seleziona la variante corretta di un esercizio basata su location, equipment, goal
 */
export function selectExerciseVariant(exerciseName, location, equipment = {}, goal = 'muscle_gain', weekNumber = 1) {
  // Se location è home senza equipment, ritorna variante bodyweight
  if (location === 'home' && !hasEquipment(equipment)) {
    return getBodyweightVariant(exerciseName, goal);
  }
  
  // Se location è gym o home con equipment, ritorna esercizio standard
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
  
  // Se location è gym, ritorna variante gym
  if (location === 'gym' && exerciseData.gym) {
    return exerciseData.gym.name || exerciseName;
  }
  
  // Se location è home con equipment
  if (location === 'home' && hasEquipment(equipment) && exerciseData.homeEquipment) {
    return exerciseData.homeEquipment[goal]?.[level] || exerciseData.homeEquipment.name || exerciseName;
  }
  
  // Se location è home bodyweight
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

// Helper: ottiene variante bodyweight per goal
function getBodyweightVariant(exerciseName, goal) {
  const name = exerciseName.toLowerCase();
  
  // Mapping bodyweight per goal
  const bodyweightMapping = {
    'strength': {
      'squat': 'Pistol Squat Assistito',
      'panca': 'One-Arm Push-up Eccentrico',
      'trazioni': 'Archer Pull-up',
      'stacco': 'Nordic Curl'
    },
    'muscle_gain': {
      'squat': 'Squat Bulgaro Tempo',
      'panca': 'Diamond Push-up Tempo',
      'trazioni': 'Pull-up Tempo',
      'stacco': 'Single Leg RDL'
    },
    'fat_loss': {
      'squat': 'Jump Squat',
      'panca': 'Clap Push-up',
      'trazioni': 'Pull-up Esplosive',
      'stacco': 'Jump Lunge'
    },
    'performance': {
      'squat': 'Box Jump',
      'panca': 'Plyometric Push-up',
      'trazioni': 'Muscle-up Progressione',
      'stacco': 'Broad Jump'
    }
  };
  
  let category = null;
  if (name.includes('squat')) category = 'squat';
  else if (name.includes('panca') || name.includes('push')) category = 'panca';
  else if (name.includes('trazioni') || name.includes('pull')) category = 'trazioni';
  else if (name.includes('stacco') || name.includes('deadlift')) category = 'stacco';
  
  const variantName = bodyweightMapping[goal]?.[category] || exerciseName;
  
  return {
    name: variantName,
    sets: goal === 'strength' ? 4 : 3,
    reps: goal === 'strength' ? '3-5' : goal === 'fat_loss' ? '15-20' : '8-12',
    rest: goal === 'strength' ? 180 : goal === 'fat_loss' ? 45 : 90,
    category: 'compound'
  };
}

console.log('✅ Exercise substitutions loaded (full implementation)');
