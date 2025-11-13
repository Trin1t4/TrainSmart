import { generateStandardProgram } from './standardProgram.js';
import { generateMotorRecoveryProgram } from './motorRecovery.js';
import { generatePerformanceProgram } from './performance.js';
import { conductPreWorkoutScreening, adaptSessionToRuntimeContext } from './screening.js';

/**
 * Funzione principale pubblica per generare un programma
 */
export function generateProgram(input) {
  const { goal } = input;

  switch (goal) {
    case 'motor_recovery':
    case 'rehabilitation':
      return generateMotorRecoveryProgram(input);

    case 'performance':
      return generatePerformanceProgram(input);

    case 'strength':
    case 'muscle_gain':
    case 'toning':
    case 'fat_loss':
      return generateStandardProgram(input);

    default:
      return generateStandardProgram(input);
  }
}

export {
  conductPreWorkoutScreening,
  adaptSessionToRuntimeContext,
};

console.log('✅ programGenerator/index.js module loaded');
