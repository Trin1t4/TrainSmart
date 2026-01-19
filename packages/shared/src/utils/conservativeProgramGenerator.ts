/**
 * Conservative Program Generator
 *
 * Genera programmi conservativi per utenti che hanno completato il Quick Start
 * senza baseline screening. I programmi sono sicuri e si auto-calibrano
 * nelle prime 4 sessioni.
 */

import type {
  QuickStartData,
  InitialLevel,
  ConservativeProgramParams,
  FeelerSetConfig,
  CalibrationData,
} from '../types/quickStart.types';

import {
  determineInitialLevel,
  getConservativeParams,
  calculateInitialWeight,
  mapQuickStartGoalToProgram,
} from './quickStartService';

import { isBodyweightExercise } from './exerciseProgressionEngine';

import type {
  WeeklySplit,
  DayWorkout,
  Exercise,
  PatternBaselines,
} from '../types/program.types';

// ============================================================
// TYPES
// ============================================================

export interface ConservativeProgramOptions {
  quickStartData: QuickStartData;
  bodyWeight?: number; // kg, opzionale
}

export interface ConservativeProgramResult {
  success: boolean;
  program?: ConservativeProgram;
  error?: string;
}

export interface ConservativeProgram {
  weeklySplit: WeeklySplit;
  level: InitialLevel;
  params: ConservativeProgramParams;
  calibrationConfig: CalibrationConfig;
  totalWeeks: number;
  includesDeload: boolean;
  goal: string;
  createdAt: string;
}

export interface CalibrationConfig {
  feelerSetsEnabled: boolean;
  sessionsBeforeAutoProgress: number;
  compoundExercises: string[]; // Esercizi che richiedono feeler sets
}

// ============================================================
// ESERCIZI DI BASE PER PATTERN
// ============================================================

const BEGINNER_EXERCISES: Record<string, { name: string; pattern: string }[]> = {
  lower_push: [
    { name: 'Goblet Squat', pattern: 'lower_push' },
    { name: 'Bodyweight Squat', pattern: 'lower_push' },
  ],
  lower_pull: [
    { name: 'Romanian Deadlift', pattern: 'lower_pull' },
    { name: 'Glute Bridge', pattern: 'lower_pull' },
  ],
  horizontal_push: [
    { name: 'Push-up', pattern: 'horizontal_push' },
    { name: 'Incline Push-up', pattern: 'horizontal_push' },
  ],
  horizontal_pull: [
    { name: 'Inverted Row', pattern: 'horizontal_pull' },
    { name: 'Band Row', pattern: 'horizontal_pull' },
  ],
  vertical_push: [
    { name: 'Pike Push-up', pattern: 'vertical_push' },
    { name: 'Dumbbell Shoulder Press', pattern: 'vertical_push' },
  ],
  vertical_pull: [
    { name: 'Lat Pulldown', pattern: 'vertical_pull' },
    { name: 'Assisted Pull-up', pattern: 'vertical_pull' },
  ],
  core: [
    { name: 'Dead Bug', pattern: 'core' },
    { name: 'Plank', pattern: 'core' },
  ],
};

const GYM_EXERCISES: Record<string, { name: string; pattern: string }[]> = {
  lower_push: [
    { name: 'Goblet Squat', pattern: 'lower_push' },
    { name: 'Leg Press', pattern: 'lower_push' },
  ],
  lower_pull: [
    { name: 'Romanian Deadlift', pattern: 'lower_pull' },
    { name: 'Leg Curl', pattern: 'lower_pull' },
  ],
  horizontal_push: [
    { name: 'Dumbbell Bench Press', pattern: 'horizontal_push' },
    { name: 'Machine Chest Press', pattern: 'horizontal_push' },
  ],
  horizontal_pull: [
    { name: 'Cable Row', pattern: 'horizontal_pull' },
    { name: 'Dumbbell Row', pattern: 'horizontal_pull' },
  ],
  vertical_push: [
    { name: 'Dumbbell Shoulder Press', pattern: 'vertical_push' },
    { name: 'Machine Shoulder Press', pattern: 'vertical_push' },
  ],
  vertical_pull: [
    { name: 'Lat Pulldown', pattern: 'vertical_pull' },
    { name: 'Assisted Pull-up', pattern: 'vertical_pull' },
  ],
  core: [
    { name: 'Cable Crunch', pattern: 'core' },
    { name: 'Plank', pattern: 'core' },
  ],
};

// ============================================================
// TEMPLATE SPLIT PER FREQUENZA
// ============================================================

interface DayTemplate {
  name: string;
  patterns: string[];
  dayType: 'moderate' | 'volume'; // No heavy per conservativo
}

const SPLIT_TEMPLATES: Record<number, DayTemplate[]> = {
  2: [
    { name: 'Full Body A', patterns: ['lower_push', 'horizontal_push', 'horizontal_pull', 'core'], dayType: 'moderate' },
    { name: 'Full Body B', patterns: ['lower_pull', 'vertical_push', 'vertical_pull', 'core'], dayType: 'volume' },
  ],
  3: [
    { name: 'Full Body A', patterns: ['lower_push', 'horizontal_push', 'vertical_pull', 'core'], dayType: 'moderate' },
    { name: 'Full Body B', patterns: ['lower_pull', 'vertical_push', 'horizontal_pull', 'core'], dayType: 'volume' },
    { name: 'Full Body C', patterns: ['lower_push', 'horizontal_push', 'horizontal_pull', 'core'], dayType: 'moderate' },
  ],
  4: [
    { name: 'Upper A', patterns: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'core'], dayType: 'moderate' },
    { name: 'Lower A', patterns: ['lower_push', 'lower_pull', 'core'], dayType: 'moderate' },
    { name: 'Upper B', patterns: ['vertical_push', 'vertical_pull', 'horizontal_push', 'core'], dayType: 'volume' },
    { name: 'Lower B', patterns: ['lower_pull', 'lower_push', 'core'], dayType: 'volume' },
  ],
  5: [
    { name: 'Push', patterns: ['horizontal_push', 'vertical_push', 'core'], dayType: 'moderate' },
    { name: 'Pull', patterns: ['horizontal_pull', 'vertical_pull', 'core'], dayType: 'moderate' },
    { name: 'Legs', patterns: ['lower_push', 'lower_pull', 'core'], dayType: 'moderate' },
    { name: 'Upper', patterns: ['horizontal_push', 'horizontal_pull', 'vertical_push'], dayType: 'volume' },
    { name: 'Lower', patterns: ['lower_push', 'lower_pull', 'core'], dayType: 'volume' },
  ],
  6: [
    { name: 'Push A', patterns: ['horizontal_push', 'vertical_push', 'core'], dayType: 'moderate' },
    { name: 'Pull A', patterns: ['horizontal_pull', 'vertical_pull', 'core'], dayType: 'moderate' },
    { name: 'Legs A', patterns: ['lower_push', 'lower_pull', 'core'], dayType: 'moderate' },
    { name: 'Push B', patterns: ['horizontal_push', 'vertical_push', 'core'], dayType: 'volume' },
    { name: 'Pull B', patterns: ['horizontal_pull', 'vertical_pull', 'core'], dayType: 'volume' },
    { name: 'Legs B', patterns: ['lower_push', 'lower_pull', 'core'], dayType: 'volume' },
  ],
};

// ============================================================
// PARAMETRI PER TIPO GIORNO
// ============================================================

interface DayTypeParams {
  sets: number;
  reps: string;
  rir: number;
  rest: string;
}

const DAY_TYPE_PARAMS: Record<InitialLevel, Record<'moderate' | 'volume', DayTypeParams>> = {
  beginner: {
    moderate: { sets: 3, reps: '8-10', rir: 4, rest: '90s' },
    volume: { sets: 3, reps: '10-12', rir: 4, rest: '60s' },
  },
  intermediate: {
    moderate: { sets: 3, reps: '6-8', rir: 3, rest: '120s' },
    volume: { sets: 4, reps: '10-12', rir: 3, rest: '60s' },
  },
};

// ============================================================
// FEELER SET CONFIG
// ============================================================

const DEFAULT_FEELER_CONFIG: FeelerSetConfig = {
  enabled: true,
  reps: 5,
  targetRPE: 4,
  percentageOfWorking: 0.5,
};

const COMPOUND_PATTERNS = ['lower_push', 'lower_pull', 'horizontal_push'];

// ============================================================
// MAIN GENERATOR
// ============================================================

/**
 * Genera un programma conservativo dal Quick Start data
 */
export function generateConservativeProgram(
  options: ConservativeProgramOptions
): ConservativeProgramResult {
  try {
    const { quickStartData, bodyWeight } = options;

    // Determina livello
    const level = determineInitialLevel(quickStartData);
    const params = getConservativeParams(level);

    // Seleziona template split
    const template = SPLIT_TEMPLATES[quickStartData.frequency];
    if (!template) {
      return {
        success: false,
        error: `Frequenza ${quickStartData.frequency} non supportata`,
      };
    }

    // Seleziona database esercizi
    const exerciseDb = quickStartData.location === 'gym' ? GYM_EXERCISES : BEGINNER_EXERCISES;

    // Genera giorni
    const days: DayWorkout[] = template.map((dayTemplate, index) => {
      const dayParams = DAY_TYPE_PARAMS[level][dayTemplate.dayType];

      const exercises: Exercise[] = dayTemplate.patterns.map((pattern) => {
        const patternExercises = exerciseDb[pattern];
        if (!patternExercises || patternExercises.length === 0) {
          return null;
        }

        // Scegli esercizio (primo per semplicita)
        const exerciseInfo = patternExercises[0];

        // Calcola peso iniziale se gym e bodyweight disponibile
        // ⚡ SKIP per esercizi a corpo libero (Push-up, Nordic Curl, etc.)
        let weight: string | undefined;
        if (quickStartData.location === 'gym' && bodyWeight && !isBodyweightExercise(exerciseInfo.name)) {
          const estimatedWeight = calculateInitialWeight(pattern, bodyWeight, level);
          weight = `${estimatedWeight}kg`;
        }

        // Determina se questo esercizio ha feeler set
        const isCompound = COMPOUND_PATTERNS.includes(pattern);
        const needsFeeler = isCompound && quickStartData.location === 'gym';

        const exercise: Exercise = {
          pattern: pattern as any,
          name: exerciseInfo.name,
          sets: dayParams.sets,
          reps: dayParams.reps,
          rest: dayParams.rest,
          intensity: `RIR ${dayParams.rir}`,
          dayType: dayTemplate.dayType,
          notes: needsFeeler ? 'Feeler set consigliato prima del primo set di lavoro' : undefined,
          weight,
        };

        return exercise;
      }).filter((e): e is Exercise => e !== null);

      // Filtra esercizi per zone dolorose
      const filteredExercises = filterExercisesForPain(
        exercises,
        quickStartData.painAreas
      );

      return {
        day: index + 1,
        name: dayTemplate.name,
        focus: dayTemplate.patterns.join(', '),
        exercises: filteredExercises,
        estimatedDuration: filteredExercises.length * 8, // ~8 min per esercizio
      };
    });

    // Crea configurazione calibrazione
    const calibrationConfig: CalibrationConfig = {
      feelerSetsEnabled: quickStartData.location === 'gym',
      sessionsBeforeAutoProgress: 4,
      compoundExercises: COMPOUND_PATTERNS.map(p => {
        const exercises = exerciseDb[p];
        return exercises?.[0]?.name || '';
      }).filter(Boolean),
    };

    const program: ConservativeProgram = {
      weeklySplit: { days },
      level,
      params,
      calibrationConfig,
      totalWeeks: 8, // 8 settimane iniziali
      includesDeload: false, // Nessun deload per conservativo
      goal: mapQuickStartGoalToProgram(quickStartData.goal),
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      program,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore nella generazione del programma',
    };
  }
}

// ============================================================
// HELPER: FILTRA ESERCIZI PER DOLORE
// ============================================================

const PAIN_EXERCISE_CONFLICTS: Record<string, string[]> = {
  shoulders: ['Dumbbell Shoulder Press', 'Machine Shoulder Press', 'Pike Push-up', 'Dumbbell Bench Press'],
  elbows: ['Push-up', 'Dumbbell Bench Press', 'Machine Chest Press', 'Cable Row'],
  wrists: ['Push-up', 'Plank', 'Pike Push-up'],
  upper_back: ['Lat Pulldown', 'Pull-up', 'Dumbbell Row'],
  lower_back: ['Romanian Deadlift', 'Deadlift', 'Barbell Row'],
  hips: ['Goblet Squat', 'Leg Press', 'Romanian Deadlift', 'Glute Bridge'],
  knees: ['Goblet Squat', 'Leg Press', 'Leg Extension', 'Leg Curl'],
  ankles: ['Goblet Squat', 'Bodyweight Squat', 'Calf Raise'],
};

function filterExercisesForPain(
  exercises: Exercise[],
  painAreas: string[]
): Exercise[] {
  if (painAreas.length === 0) return exercises;

  // Raccogli tutti gli esercizi da evitare
  const exercisesToAvoid = new Set<string>();
  painAreas.forEach(area => {
    const conflicts = PAIN_EXERCISE_CONFLICTS[area] || [];
    conflicts.forEach(ex => exercisesToAvoid.add(ex));
  });

  // Filtra ma mantieni almeno un esercizio per pattern
  const filtered = exercises.filter(ex => !exercisesToAvoid.has(ex.name));

  // Se troppi esercizi rimossi, aggiungi note di cautela invece di rimuovere
  if (filtered.length < exercises.length / 2) {
    return exercises.map(ex => {
      if (exercisesToAvoid.has(ex.name)) {
        return {
          ...ex,
          notes: `Procedi con cautela per il fastidio riportato. Riduci il carico se necessario.`,
        };
      }
      return ex;
    });
  }

  return filtered;
}

// ============================================================
// GENERATE EMPTY BASELINES (for compatibility)
// ============================================================

/**
 * Genera baselines vuote per compatibilita con il sistema esistente
 */
export function generateEmptyBaselines(): PatternBaselines {
  return {
    lower_push: undefined,
    lower_pull: undefined,
    horizontal_push: undefined,
    horizontal_pull: undefined,
    vertical_push: undefined,
    vertical_pull: undefined,
    core: undefined,
  };
}

// ============================================================
// APPLY CALIBRATION TO PROGRAM
// ============================================================

/**
 * Applica i risultati della calibrazione al programma
 */
export function applyCalibrationToProgram(
  program: ConservativeProgram,
  calibration: CalibrationData
): ConservativeProgram {
  // Se sessione 1 completata, aggiorna i pesi
  if (calibration.session1) {
    const weightsDiscovered = calibration.session1.weightsDiscovered;

    const updatedDays = program.weeklySplit.days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => {
        // ⚡ Non applicare pesi a esercizi bodyweight
        if (isBodyweightExercise(ex.name)) {
          return ex;
        }
        const calibratedWeight = weightsDiscovered[ex.name];
        if (calibratedWeight) {
          return {
            ...ex,
            weight: `${calibratedWeight.adjustedWeight}kg`,
            notes: calibratedWeight.confidence === 'high'
              ? undefined
              : 'Peso in calibrazione - verifica nella prossima sessione',
          };
        }
        return ex;
      }),
    }));

    return {
      ...program,
      weeklySplit: { days: updatedDays },
    };
  }

  return program;
}

// ============================================================
// CHECK IF PROGRAM NEEDS CALIBRATION
// ============================================================

/**
 * Verifica se un programma ha bisogno di calibrazione
 */
export function programNeedsCalibration(
  program: ConservativeProgram,
  calibration: CalibrationData | null
): {
  needsCalibration: boolean;
  currentSession: number;
  message: string;
} {
  if (!calibration) {
    return {
      needsCalibration: true,
      currentSession: 1,
      message: 'Prima sessione di calibrazione: scoprirai i tuoi pesi ideali',
    };
  }

  if (calibration.sessionsCompleted < 4) {
    const messages = [
      'Prima sessione di calibrazione: scoprirai i tuoi pesi ideali',
      'Seconda sessione: validazione pesi e calibrazione percezione sforzo',
      'Terza sessione: check pattern di recupero',
      'Quarta sessione: valutazione finale per sbloccare funzioni avanzate',
    ];

    return {
      needsCalibration: true,
      currentSession: calibration.sessionsCompleted + 1,
      message: messages[calibration.sessionsCompleted],
    };
  }

  return {
    needsCalibration: false,
    currentSession: calibration.sessionsCompleted,
    message: 'Calibrazione completata',
  };
}
