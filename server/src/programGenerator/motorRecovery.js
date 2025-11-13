import { MOTOR_RECOVERY_GOALS } from './constants.js';
import { getExerciseForLocation } from './exerciseSubstitutions.js';

/**
 * Genera programmazione per recupero motorio
 * @param {Object} input - Contiene parametri necessari
 */
export function generateMotorRecoveryProgram(input) {
  const { recoveryScreening, location, equipment } = input;

  if (!recoveryScreening) {
    throw new Error('Recovery screening data is required');
  }

  const { body_area, assigned_phase } = recoveryScreening;

  const areaPrograms = MOTOR_RECOVERY_GOALS[body_area];

  if (!areaPrograms) {
    throw new Error(`No recovery program for area: ${body_area}`);
  }

  // Fase assegnata
  const phaseProgram = areaPrograms;

  // Adatta esercizi con nomi per location (casa o palestra)
  const exercisesAdapted = phaseProgram.exercises.map(ex => {
    const exerciseName = getExerciseForLocation(ex.name, location, equipment);
    return {
      ...ex,
      name: exerciseName
    };
  });

  // Ritorna programma completo da mostrare
  return {
    name: `Recovery - ${phaseProgram.name}`,
    description: phaseProgram.name,
    split: 'recovery',
    daysPerWeek: 3, // Fisso per ora, da adattare se serve
    weeklySchedule: [
      {
        dayName: 'Recovery Session',
        exercises: exercisesAdapted,
      },
    ],
    progression: 'phased_recovery',
    currentPhase: assigned_phase,
    totalPhases: 1,
    totalWeeks: 4, // Placeholder
  };
}

console.log('✅ motorRecovery.js module loaded (ES modules)');
