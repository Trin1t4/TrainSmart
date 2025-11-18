/**
 * Weekly Split Generator
 * Sistema intelligente per creare split personalizzati basati su frequenza
 * Split scientificamente validati con varianti per evitare ripetizioni
 */

import { Level, Goal, PatternBaselines, Exercise } from '../types';
import { NormalizedPainArea } from './validators';
import { calculateVolume } from './programGenerator';
import {
  isExerciseConflicting,
  applyPainDeload,
  findSafeAlternative,
  getCorrectiveExercises
} from './painManagement';
import { convertToMachineVariant } from './exerciseMapping';
import {
  getVariantForPattern,
  HORIZONTAL_PULL_VARIANTS,
  ACCESSORY_VARIANTS
} from './exerciseVariants';

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WeeklySplit {
  splitName: string;
  description: string;
  days: DayWorkout[];
}

interface SplitGeneratorOptions {
  level: Level;
  goal: Goal;
  location: 'gym' | 'home';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  muscularFocus?: string; // glutei, addome, petto, dorso, spalle, gambe, braccia, polpacci
}

/**
 * MUSCULAR FOCUS SYSTEM
 * Mappa focus muscolari → pattern di esercizi da enfatizzare
 */
const MUSCULAR_FOCUS_PATTERNS: Record<string, string[]> = {
  glutei: ['lower_push', 'lower_pull'], // Squat, Deadlift, Hip Hinge
  addome: ['core'],
  petto: ['horizontal_push'], // Push-ups, Bench Press, Dips
  dorso: ['horizontal_pull', 'vertical_pull'], // Rows, Pull-ups
  spalle: ['vertical_push'], // Overhead Press, Pike Push-ups
  gambe: ['lower_push', 'lower_pull'], // Tutti lower body
  braccia: ['horizontal_push', 'horizontal_pull'], // Push/Pull compound
  polpacci: [] // Richiede esercizio dedicato (non pattern, ma isolamento)
};

/**
 * Esercizi di isolamento da aggiungere per ogni focus
 */
const ISOLATION_EXERCISES: Record<string, { name: string; sets: number; reps: string }[]> = {
  glutei: [
    { name: 'Hip Thrust', sets: 3, reps: '12-15' },
    { name: 'Glute Bridge', sets: 3, reps: '15-20' }
  ],
  addome: [
    { name: 'Plank', sets: 3, reps: '30-60s' },
    { name: 'Dead Bug', sets: 3, reps: '12-15' }
  ],
  petto: [
    { name: 'Chest Fly', sets: 3, reps: '12-15' },
    { name: 'Cable Crossover', sets: 3, reps: '12-15' }
  ],
  dorso: [
    { name: 'Face Pull', sets: 3, reps: '15-20' },
    { name: 'Band Pull Apart', sets: 3, reps: '20-25' }
  ],
  spalle: [
    { name: 'Lateral Raise', sets: 3, reps: '12-15' },
    { name: 'Front Raise', sets: 3, reps: '12-15' }
  ],
  gambe: [
    { name: 'Bulgarian Split Squat', sets: 3, reps: '10-12' },
    { name: 'Walking Lunge', sets: 3, reps: '12-15' }
  ],
  braccia: [
    { name: 'Bicep Curl', sets: 3, reps: '12-15' },
    { name: 'Tricep Extension', sets: 3, reps: '12-15' }
  ],
  polpacci: [
    { name: 'Calf Raise', sets: 4, reps: '15-20' },
    { name: 'Seated Calf Raise', sets: 3, reps: '20-25' }
  ]
};

/**
 * APPLICA MUSCULAR FOCUS
 * Modifica un workout day per enfatizzare un distretto muscolare
 */
function applyMuscularFocus(
  day: DayWorkout,
  focus: string,
  options: SplitGeneratorOptions
): void {
  if (!focus || focus === '') return;

  console.log(`🎯 Applicando focus muscolare: ${focus} su ${day.dayName}`);

  const targetPatterns = MUSCULAR_FOCUS_PATTERNS[focus] || [];
  const isolationExercises = ISOLATION_EXERCISES[focus] || [];

  // 1. AUMENTA VOLUME per esercizi che matchano il focus (+1 set)
  day.exercises.forEach(exercise => {
    if (targetPatterns.includes(exercise.pattern)) {
      const originalSets = exercise.sets;
      exercise.sets = Math.min(exercise.sets + 1, 5); // Max 5 sets
      console.log(`   ↑ ${exercise.name}: ${originalSets} → ${exercise.sets} sets (focus boost)`);

      // Aggiungi nota
      const focusNote = `💪 Focus ${focus}: volume aumentato`;
      exercise.notes = exercise.notes
        ? `${exercise.notes} | ${focusNote}`
        : focusNote;
    }
  });

  // 2. AGGIUNGI ESERCIZI DI ISOLAMENTO (1-2 esercizi)
  const exercisesToAdd = isolationExercises.slice(0, 2); // Max 2 isolation
  exercisesToAdd.forEach(iso => {
    const isolationExercise: Exercise = {
      pattern: 'accessory' as any,
      name: iso.name,
      sets: iso.sets,
      reps: iso.reps,
      rest: '60s',
      intensity: '60-70%',
      notes: `🎯 Isolamento ${focus} (focus muscolare)`
    };
    day.exercises.push(isolationExercise);
    console.log(`   + Aggiunto: ${iso.name} (${iso.sets}x${iso.reps})`);
  });

  // 3. RIORDINA: Esercizi focus all'inizio (quando fresco)
  day.exercises.sort((a, b) => {
    const aIsFocus = targetPatterns.includes(a.pattern);
    const bIsFocus = targetPatterns.includes(b.pattern);

    if (aIsFocus && !bIsFocus) return -1; // a prima
    if (!aIsFocus && bIsFocus) return 1;  // b prima
    return 0; // mantieni ordine originale
  });

  console.log(`   ✅ Focus ${focus} applicato: ${day.exercises.length} esercizi totali`);
}

/**
 * SPLIT SCIENTIFICI VALIDATI
 *
 * Principi:
 * - Frequenza 2x settimana per gruppo muscolare (ottimale per ipertrofia/forza)
 * - Recupero adeguato (48-72h per gruppo muscolare)
 * - Varianti diverse per stimoli diversi
 * - Volume distribuito intelligentemente
 */

/**
 * 3x SETTIMANA - FULL BODY A/B/C
 * Ideale per: Beginners, General Fitness, Time-Constrained Athletes
 *
 * Ogni sessione: Tutto il corpo con focus diverso
 * Recupero: 1 giorno tra sessioni
 */
function generate3DayFullBody(options: SplitGeneratorOptions): WeeklySplit {
  const { baselines, level, goal, location, trainingType, painAreas } = options;

  const days: DayWorkout[] = [
    {
      dayNumber: 1,
      dayName: 'Monday - Full Body A (Squat Focus)',
      focus: 'Lower Push Dominant + Horizontal Push + Vertical Pull',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Wednesday - Full Body B (Deadlift Focus)',
      focus: 'Lower Pull Dominant + Vertical Push + Horizontal Push Variant',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Friday - Full Body C (Balanced)',
      focus: 'Lower Push Variant + Vertical Pull Variant + Horizontal Push',
      exercises: []
    }
  ];

  // DAY A: Lower Push + Horizontal Push + Vertical Pull + Core
  days[0].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options),
    createExercise('horizontal_push', baselines.horizontal_push, 0, options),
    createExercise('vertical_pull', baselines.vertical_pull, 0, options),
    createExercise('core', baselines.core, 0, options)
  ];

  // DAY B: Lower Pull + Vertical Push + Horizontal Push (variante) + Core
  days[1].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 0, options),
    createExercise('vertical_push', baselines.vertical_push, 0, options),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options), // Variante diversa
    createExercise('core', baselines.core, 1, options)
  ];

  // DAY C: Lower Push (variante) + Vertical Pull (variante) + Horizontal Push + Core
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 1, options), // Variante diversa
    createExercise('vertical_pull', baselines.vertical_pull, 1, options), // Variante diversa
    createExercise('horizontal_push', baselines.horizontal_push, 0, options),
    createExercise('core', baselines.core, 2, options)
  ];

  // Aggiungi correttivi a tutti i giorni se necessario
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // ✅ VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // 💪 APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'FULL BODY A/B/C (3x/week)',
    description: 'Allenamento total body con varianti diverse ogni sessione. Ottimale per frequenza 3x/settimana.',
    days
  };
}

/**
 * 4x SETTIMANA - UPPER/LOWER SPLIT
 * Ideale per: Intermediate Athletes, Muscle Gain, Strength Focus
 *
 * Volume maggiore per gruppo muscolare
 * Recupero: 2-3 giorni per gruppo
 */
function generate4DayUpperLower(options: SplitGeneratorOptions): WeeklySplit {
  const { baselines, level, goal, location, trainingType, painAreas } = options;

  const days: DayWorkout[] = [
    {
      dayNumber: 1,
      dayName: 'Monday - Upper A',
      focus: 'Horizontal Push + Vertical Pull + Vertical Push + Core',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Tuesday - Lower A',
      focus: 'Lower Push + Lower Pull + Core',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Thursday - Upper B',
      focus: 'Vertical Push + Horizontal Push Variant + Vertical Pull Variant',
      exercises: []
    },
    {
      dayNumber: 4,
      dayName: 'Friday - Lower B',
      focus: 'Lower Pull Variant + Lower Push Variant + Core',
      exercises: []
    }
  ];

  // UPPER A: Horizontal Push focus
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options),
    createExercise('vertical_pull', baselines.vertical_pull, 0, options),
    createExercise('vertical_push', baselines.vertical_push, 0, options),
    createExercise('core', baselines.core, 0, options)
  ];

  // LOWER A: Squat focus
  days[1].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options),
    createExercise('lower_pull', baselines.lower_pull, 0, options),
    createExercise('core', baselines.core, 1, options)
  ];

  // UPPER B: Vertical Push focus + varianti
  days[2].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options), // Variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options), // Variante
    createExercise('core', baselines.core, 2, options)
  ];

  // LOWER B: Deadlift focus + varianti
  days[3].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options), // Variante
    createExercise('lower_push', baselines.lower_push, 1, options), // Variante
    createExercise('core', baselines.core, 3, options)
  ];

  // Aggiungi correttivi
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // ✅ VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // 💪 APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'UPPER/LOWER (4x/week)',
    description: 'Split Upper/Lower classico. Maggior volume per gruppo muscolare, ideale per ipertrofia e forza.',
    days
  };
}

/**
 * 5-6x SETTIMANA - PUSH/PULL/LEGS (PPL)
 * Ideale per: Advanced Athletes, Bodybuilding, High Frequency Training
 *
 * Massimo volume e frequenza
 * Recupero: Ogni gruppo 2x settimana
 */
function generate6DayPPL(options: SplitGeneratorOptions): WeeklySplit {
  const { baselines, level, goal, location, trainingType, painAreas } = options;

  const days: DayWorkout[] = [
    {
      dayNumber: 1,
      dayName: 'Monday - Push A',
      focus: 'Horizontal Push + Vertical Push + Triceps + Core',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Tuesday - Pull A',
      focus: 'Vertical Pull + Horizontal Pull (Row) + Biceps + Core',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Wednesday - Legs A',
      focus: 'Lower Push + Lower Pull + Calves + Core',
      exercises: []
    },
    {
      dayNumber: 4,
      dayName: 'Thursday - Push B',
      focus: 'Vertical Push + Horizontal Push Variant + Triceps',
      exercises: []
    },
    {
      dayNumber: 5,
      dayName: 'Friday - Pull B',
      focus: 'Horizontal Pull + Vertical Pull Variant + Biceps',
      exercises: []
    },
    {
      dayNumber: 6,
      dayName: 'Saturday - Legs B',
      focus: 'Lower Pull Variant + Lower Push Variant + Calves',
      exercises: []
    }
  ];

  // PUSH A
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options),
    createExercise('vertical_push', baselines.vertical_push, 0, options),
    createAccessoryExercise('triceps', 0, options),
    createExercise('core', baselines.core, 0, options)
  ];

  // PULL A - Include Horizontal Pull (Row)
  days[1].exercises = [
    createExercise('vertical_pull', baselines.vertical_pull, 0, options),
    createHorizontalPullExercise(0, options), // Row pattern
    createAccessoryExercise('biceps', 0, options),
    createExercise('core', baselines.core, 1, options)
  ];

  // LEGS A
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options),
    createExercise('lower_pull', baselines.lower_pull, 0, options),
    createAccessoryExercise('calves', 0, options),
    createExercise('core', baselines.core, 2, options)
  ];

  // PUSH B (varianti)
  days[3].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options),
    createAccessoryExercise('triceps', 1, options)
  ];

  // PULL B (varianti)
  days[4].exercises = [
    createHorizontalPullExercise(1, options), // Row variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options),
    createAccessoryExercise('biceps', 1, options)
  ];

  // LEGS B (varianti)
  days[5].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options),
    createExercise('lower_push', baselines.lower_push, 1, options),
    createAccessoryExercise('calves', 1, options)
  ];

  // Aggiungi correttivi
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // ✅ VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // 💪 APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'PUSH/PULL/LEGS (6x/week)',
    description: 'Split PPL avanzato con massimo volume e frequenza. Ogni gruppo muscolare allenato 2x/settimana.',
    days
  };
}

/**
 * Crea un esercizio con gestione baseline, varianti e pain management
 */
function createExercise(
  patternId: string,
  baseline: any,
  variantIndex: number,
  options: SplitGeneratorOptions
): Exercise {
  const { level, goal, location, trainingType, painAreas } = options;

  if (!baseline) {
    // Fallback se baseline non presente
    return {
      pattern: patternId as any,
      name: `${patternId} (No Baseline)`,
      sets: 3,
      reps: 10,
      rest: '90s',
      intensity: '70%',
      notes: 'Esercizio non testato nello screening'
    };
  }

  // Calcola volume basato su baseline
  const baselineReps = baseline.reps;
  const volumeCalc = calculateVolume(baselineReps, goal, level, location);

  // Determina quale variante usare
  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  let exerciseName = variantIndex === 0
    ? baseline.variantName // Prima variante = quella dello screening
    : getVariantForPattern(patternId, baseline.variantName, variantIndex, equipment);

  let finalSets = volumeCalc.sets;
  let finalReps = volumeCalc.reps;
  let painNotes = '';
  let wasReplaced = false;

  // Pain Management
  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const severity = painEntry.severity;

    if (isExerciseConflicting(exerciseName, painArea)) {
      console.log(`⚠️ Conflitto: ${exerciseName} carica zona dolente: ${painArea} (${severity})`);

      const deload = applyPainDeload(severity, finalSets, finalReps, location);
      finalSets = deload.sets;
      finalReps = deload.reps;
      painNotes = deload.note;

      if (deload.needsReplacement || (deload.needsEasierVariant && location === 'home')) {
        const alternative = findSafeAlternative(exerciseName, painArea, severity);
        exerciseName = alternative;
        wasReplaced = true;
        painNotes = `${painNotes} | Sostituito da ${baseline.variantName}`;
      }

      break;
    }
  }

  // Conversione a macchine se richiesto
  let machineNotes = '';
  if (location === 'gym' && trainingType === 'machines') {
    const originalExercise = exerciseName;
    exerciseName = convertToMachineVariant(exerciseName);

    if (exerciseName !== originalExercise) {
      machineNotes = `Macchina: ${originalExercise} → ${exerciseName}`;
    }
  }

  return {
    pattern: patternId as any,
    name: exerciseName,
    sets: finalSets,
    reps: finalReps,
    rest: volumeCalc.rest,
    intensity: volumeCalc.intensity,
    baseline: {
      variantId: baseline.variantId,
      difficulty: baseline.difficulty,
      maxReps: baselineReps
    },
    wasReplaced: wasReplaced,
    notes: [
      volumeCalc.notes,
      `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
      painNotes,
      machineNotes
    ].filter(Boolean).join(' | ')
  };
}

/**
 * Crea esercizio Horizontal Pull (Row) - non testato nello screening
 * Usato per split PPL
 */
function createHorizontalPullExercise(
  variantIndex: number,
  options: SplitGeneratorOptions
): Exercise {
  const { level, goal, location, trainingType } = options;

  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  const variants = HORIZONTAL_PULL_VARIANTS.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  const selectedVariant = variants[variantIndex % variants.length];
  let exerciseName = selectedVariant.name;

  // Volume generico (non abbiamo baseline per questo pattern)
  const volumeCalc = calculateVolume(12, goal, level, location); // Assume 12 reps come baseline

  // Conversione a macchine
  if (location === 'gym' && trainingType === 'machines') {
    exerciseName = convertToMachineVariant(exerciseName);
  }

  return {
    pattern: 'vertical_pull', // Usiamo vertical_pull come pattern parent
    name: exerciseName,
    sets: volumeCalc.sets,
    reps: volumeCalc.reps,
    rest: volumeCalc.rest,
    intensity: volumeCalc.intensity,
    notes: 'Row pattern - complementare al vertical pull'
  };
}

/**
 * Crea esercizio accessorio (triceps, biceps, calves)
 */
function createAccessoryExercise(
  muscleGroup: 'triceps' | 'biceps' | 'calves',
  variantIndex: number,
  options: SplitGeneratorOptions
): Exercise {
  const { level, goal, location, trainingType } = options;

  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  const variants = ACCESSORY_VARIANTS[muscleGroup].filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  if (variants.length === 0) {
    // Fallback se non ci sono varianti disponibili
    return {
      pattern: 'core',
      name: `${muscleGroup} exercise`,
      sets: 3,
      reps: 12,
      rest: '60s',
      intensity: '70%',
      notes: `Accessorio ${muscleGroup}`
    };
  }

  const selectedVariant = variants[variantIndex % variants.length];
  let exerciseName = selectedVariant.name;

  // Volume per accessori: set/reps moderati
  const sets = level === 'advanced' ? 4 : 3;
  const reps = muscleGroup === 'calves' ? 15 : 12;

  // Conversione a macchine
  if (location === 'gym' && trainingType === 'machines') {
    exerciseName = convertToMachineVariant(exerciseName);
  }

  return {
    pattern: 'core', // Usiamo core come pattern generico per accessori
    name: exerciseName,
    sets: sets,
    reps: reps,
    rest: '60s',
    intensity: '70%',
    notes: `Accessorio ${muscleGroup}`
  };
}

/**
 * Genera esercizi correttivi per dolori
 */
function generateCorrectiveExercises(painAreas: NormalizedPainArea[]): Exercise[] {
  const correctiveExercises: Exercise[] = [];

  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const correctives = getCorrectiveExercises(painArea);

    for (const corrective of correctives) {
      correctiveExercises.push({
        pattern: 'corrective',
        name: corrective,
        sets: 2,
        reps: '10-15',
        rest: '30s',
        intensity: 'Low',
        notes: `Correttivo per ${painArea} - Focus sulla qualità`
      });
    }
  }

  return correctiveExercises;
}

/**
 * FUNZIONE PRINCIPALE - Genera split settimanale basato su frequenza
 */
export function generateWeeklySplit(options: SplitGeneratorOptions): WeeklySplit {
  const { frequency } = options;

  console.log(`🗓️ Generazione split settimanale per ${frequency}x/settimana`);

  if (frequency <= 3) {
    return generate3DayFullBody(options);
  } else if (frequency === 4) {
    return generate4DayUpperLower(options);
  } else {
    // 5-6 giorni
    return generate6DayPPL(options);
  }
}
