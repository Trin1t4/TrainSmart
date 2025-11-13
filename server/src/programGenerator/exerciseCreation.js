import { selectExerciseByGoal } from './exerciseSelectionLogic_CJS.js';
import { selectExerciseVariant, getExerciseForLocation } from './exerciseSubstitutions.js';
import { GOAL_CONFIGS } from './constants.js';

/**
 * Crea oggetto esercizio completo in base ai parametri e alle logiche di varianti/modalità
 */
export function createExercise(
  name,
  location,
  equipment,
  baseWeight,
  level,
  goal,
  type,
  assessments
) {
  // Determina variante corretta se assessment disponibile
  let variant;
  if (assessments && assessments[name]) {
    variant = selectExerciseByGoal(name, assessments[name], goal);
  } else {
    variant = selectExerciseVariant(name, location, equipment, goal, 1, null);
  }

  // Se non trovata una variante, prende la standard
  const finalName = variant?.name || name;

  // Sets/reps/rest da GOAL_CONFIGS
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain;
  const setsDefault = goalConfig.setsMultiplier ? Math.round(3 * goalConfig.setsMultiplier) : 3;
  const repsDefault = goalConfig.repsRange || '8-12';
  const restDefault = goalConfig.rest?.compound || 90;

  // Se tipo core, riduci set
  const setsValue = type === 'core' ? Math.max(2, Math.round(setsDefault * 0.66)) : setsDefault;
  const repsValue = variant?.reps || repsDefault;
  const restValue = variant?.rest || restDefault;

  // Calcolo peso base (se attrezzi disponibili)
  let weightValue = null;
  if (equipment && equipment.barbell && type === 'compound') {
    // Esempio di calcolo peso partendo da stima base
    weightValue = baseWeight ? baseWeight : Math.round(equipment.barbell * 0.6);
  }

  // Notes adattate
  const notesValue = variant?.notes || `Goal: ${goal} - Type: ${type}`;

  return {
    name: finalName,
    sets: setsValue,
    reps: repsValue,
    rest: restValue,
    weight: weightValue,
    notes: notesValue,
    goal: goal,
    type: type
  };
}

console.log('✅ exerciseCreation.js module loaded (ES modules)');
