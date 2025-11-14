import { GOAL_CONFIGS } from './constants.js';

/**
 * Calcola volume totale di allenamento (sets × reps × peso)
 */
export function calculateVolume(sets, reps, weight) {
  if (!weight) return 0;
  
  // Se reps è un range (es. "8-12"), usa il valore medio
  let repsValue;
  if (typeof reps === 'string' && reps.includes('-')) {
    const [min, max] = reps.split('-').map(Number);
    repsValue = (min + max) / 2;
  } else {
    repsValue = parseInt(reps) || 10;
  }

  return sets * repsValue * weight;
}

/**
 * Calcola intensità relativa (% 1RM)
 */
export function calculateIntensity(weight, oneRepMax) {
  if (!oneRepMax || oneRepMax === 0) return 0;
  return (weight / oneRepMax) * 100;
}

/**
 * Adatta esercizio in base ad aree di dolore
 */
export function adjustForPain(exercise, painAreas) {
  if (!painAreas || painAreas.length === 0) return exercise;

  let modifiedExercise = { ...exercise };

  painAreas.forEach(painArea => {
    switch (painArea) {
      case 'lower_back':
        if (exercise.name.includes('Squat') || exercise.name.includes('Stacco')) {
          modifiedExercise.notes = `⚠️ Dolore schiena - ROM limitato. ${exercise.notes || ''}`;
          modifiedExercise.reps = '8-10'; // Riduzione reps
        }
        break;

      case 'knee':
        if (exercise.name.includes('Squat') || exercise.name.includes('Affond')) {
          modifiedExercise.notes = `⚠️ Dolore ginocchio - Profondità limitata. ${exercise.notes || ''}`;
          modifiedExercise.reps = '6-8';
        }
        break;

      case 'shoulder':
        if (exercise.name.includes('Press') || exercise.name.includes('Push') || exercise.name.includes('Panca')) {
          modifiedExercise.notes = `⚠️ Dolore spalla - ROM ridotto. ${exercise.notes || ''}`;
          modifiedExercise.reps = '10-12';
        }
        break;

      case 'wrist':
        if (exercise.name.includes('Push-up') || exercise.name.includes('Plank')) {
          modifiedExercise.notes = `⚠️ Dolore polso - Variante su pugni o manubri. ${exercise.notes || ''}`;
        }
        break;

      default:
        break;
    }
  });

  return modifiedExercise;
}

/**
 * Verifica safety per gravidanza
 */
export function isSafeForPregnancy(exerciseName, trimester) {
  const unsafeExercises = {
    1: [], // Primo trimestre: quasi tutto ok con cautela
    2: ['Plank', 'Crunch', 'Leg Raises', 'Dead Bug'], // Secondo: evitare addominali diretti
    3: ['Plank', 'Crunch', 'Leg Raises', 'Dead Bug', 'Jump Squat', 'Box Jump'] // Terzo: evitare impatti e addominali
  };

  const trimesterUnsafe = unsafeExercises[trimester] || [];
  return !trimesterUnsafe.some(unsafe => exerciseName.includes(unsafe));
}

/**
 * Adatta esercizio per disabilità
 */
export function adaptForDisability(exercise, disabilityType) {
  let adapted = { ...exercise };

  switch (disabilityType) {
    case 'wheelchair':
      // Sostituisci esercizi gambe con upper body
      if (exercise.name.includes('Squat') || exercise.name.includes('Affond') || exercise.name.includes('Stacco')) {
        adapted.name = 'Seated Row';
        adapted.notes = `♿ Adattato per sedia a rotelle: ${exercise.name} → Seated Row`;
      }
      break;

    case 'visual_impairment':
      // Evita esercizi con equilibrio complesso
      if (exercise.name.includes('Pistol') || exercise.name.includes('Single Leg')) {
        adapted.name = 'Squat Completo';
        adapted.notes = `👁️ Adattato per ipovisione: variante più stabile`;
      }
      break;

    case 'upper_limb':
      // Sostituisci upper body con lower body
      if (exercise.name.includes('Push') || exercise.name.includes('Pull') || exercise.name.includes('Press')) {
        adapted.name = 'Squat';
        adapted.notes = `🦾 Adattato per arto superiore: focus gambe`;
      }
      break;

    default:
      break;
  }

  return adapted;
}

/**
 * Mappa nome goal generico a chiave config
 */
export function mapGoalNameToConfig(goalName) {
  const mapping = {
    'forza': 'strength',
    'strength': 'strength',
    'ipertrofia': 'muscle_gain',
    'muscle_gain': 'muscle_gain',
    'tonificazione': 'toning',
    'toning': 'toning',
    'dimagrimento': 'fat_loss',
    'fat_loss': 'fat_loss',
    'performance': 'performance',
    'recupero_motorio': 'motor_recovery',
    'motor_recovery': 'motor_recovery'
  };

  return mapping[goalName] || 'muscle_gain';
}

/**
 * Calcola RIR (Reps In Reserve) consigliato
 */
export function calculateRIR(level, goal) {
  const goalConfig = GOAL_CONFIGS[goal];
  
  if (goalConfig && goalConfig.targetRIR !== undefined) {
    return goalConfig.targetRIR;
  }

  // Default per livello
  if (level === 'beginner') return 3;
  if (level === 'intermediate') return 2;
  if (level === 'advanced') return 1;
  
  return 2;
}

/**
 * Converte tempo in secondi da stringa (es. "30s", "1m")
 */
export function parseTimeToSeconds(timeString) {
  if (!timeString) return 0;
  
  if (typeof timeString === 'number') return timeString;
  
  const match = timeString.match(/(\d+)(s|m)?/);
  if (!match) return 0;
  
  const value = parseInt(match);
  const unit = match;
  
  if (unit === 'm') return value * 60;
  return value; // Default seconds
}

console.log('✅ utils.js module loaded (ES modules)');
```

### Dove posizionarlo:
**`client/src/programGenerator/utils.js`**

---

# Modulo 7: screening.js

``````js
import { adjustForPain, adaptForDisability, isSafeForPregnancy } from './utils.js';

/**
 * Conduce screening pre-workout per adattare sessione
 */
export function conductPreWorkoutScreening(userState, session) {
  console.log('[SCREENING] 🔍 Conducting pre-workout screening...');

  const { fatigue, sleep, painAreas, isPregnant, trimester, disabilityType } = userState;

  let adjustedSession = { ...session };
  let warnings = [];

  // Adatta in base a fatica e sonno
  if (fatigue > 7 || sleep < 5) {
    warnings.push('⚠️ Alta fatica o poco sonno: volume ridotto del 20%');
    adjustedSession.exercises = adjustedSession.exercises.map(ex => ({
      ...ex,
      sets: Math.max(1, ex.sets - 1)
    }));
  }

  // Adatta per dolore
  if (painAreas && painAreas.length > 0) {
    adjustedSession.exercises = adjustedSession.exercises.map(ex => 
      adjustForPain(ex, painAreas)
    );
  }

  // Safety per gravidanza
  if (isPregnant) {
    adjustedSession.exercises = adjustedSession.exercises.filter(ex =>
      isSafeForPregnancy(ex.name, trimester)
    );
    warnings.push(`🤰 Gravidanza trimestre ${trimester}: alcuni esercizi rimossi`);
  }

  // Adatta per disabilità
  if (disabilityType) {
    adjustedSession.exercises = adjustedSession.exercises.map(ex =>
      adaptForDisability(ex, disabilityType)
    );
  }

  return {
    session: adjustedSession,
    warnings: warnings
  };
}

/**
 * Adatta sessione runtime in base a contesto real-time
 */
export function adaptSessionToRuntimeContext(session, runtimeData) {
  const { currentFatigue, currentPain, equipmentAvailable } = runtimeData;

  let adapted = { ...session };

  // Se fatica elevata durante sessione, riduci volume
  if (currentFatigue > 8) {
    adapted.exercises = adapted.exercises.map(ex => ({
      ...ex,
      sets: Math.max(1, ex.sets - 1),
      notes: `${ex.notes || ''} | Fatica elevata: volume ridotto`
    }));
  }

  // Se dolore acuto durante sessione, salta esercizi problematici
  if (currentPain && currentPain.length > 0) {
    adapted.exercises = adapted.exercises.filter(ex => {
      const isPainful = currentPain.some(area => ex.name.toLowerCase().includes(area.toLowerCase()));
      return !isPainful;
    });
  }

  return adapted;
}

console.log('✅ screening.js module loaded (ES modules)');
```
