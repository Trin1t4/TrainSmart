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

/**
 * Determina l'intensità dell'esercizio con ROTAZIONE tra giorni
 * LOGICA: Mix intelligente + rotazione DUP per Full Body 7 esercizi
 *
 * FULL BODY 3x - 7 esercizi/giorno:
 * 1. Squat, 2. Deadlift, 3. Bench, 4. Row, 5. Military, 6. Pulldown, 7. Core
 *
 * Rotazione intensità per evitare CNS burnout e ottimizzare recupero
 */
function getIntensityForPattern(
  patternId: string,
  exerciseIndex: number,
  dayIndex: number
): 'heavy' | 'volume' | 'moderate' {
  // 🎯 CORE/ACCESSORI: SEMPRE VOLUME (non cambiano)
  if (patternId === 'core' || patternId === 'corrective') {
    return 'volume';
  }

  // 🔄 ROTAZIONE DUP PER COMPOUND MOVEMENTS (Full Body 7 pattern)
  // Ogni giorno 2 esercizi HEAVY, 4 MODERATE, 1 VOLUME (core)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DAY 1 (Monday): Lower Push (Squat) + Horizontal Push (Bench) HEAVY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (dayIndex === 0) {
    if (patternId === 'lower_push' || patternId === 'horizontal_push') {
      return 'heavy'; // Squat HEAVY, Bench HEAVY
    }
    // Tutti gli altri: MODERATE (Deadlift, Row, Military, Pulldown)
    return 'moderate';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DAY 2 (Wednesday): Lower Pull (Deadlift) + Horizontal Pull (Row) + Vertical Push (Military) HEAVY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (dayIndex === 1) {
    if (patternId === 'lower_pull' || patternId === 'horizontal_pull' || patternId === 'vertical_push') {
      return 'heavy'; // Deadlift HEAVY, Row HEAVY, Military HEAVY
    }
    // Tutti gli altri: MODERATE (Squat, Bench, Pulldown)
    return 'moderate';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DAY 3 (Friday): Lower Push (Squat) + Vertical Pull (Pulldown) HEAVY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (dayIndex === 2) {
    if (patternId === 'lower_push' || patternId === 'vertical_pull') {
      return 'heavy'; // Squat HEAVY, Pulldown HEAVY
    }
    // Tutti gli altri: MODERATE (Deadlift, Bench, Row, Military)
    return 'moderate';
  }

  // Default: moderate
  return 'moderate';
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
  estimatedDuration?: number; // Durata stimata in minuti
}

export interface WeeklySplit {
  splitName: string;
  description: string;
  days: DayWorkout[];
  averageDuration?: number; // Durata media workout in minuti
}

interface SplitGeneratorOptions {
  level: Level;
  goal: Goal;
  goals?: string[]; // Multi-goal support (max 3)
  location: 'gym' | 'home';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  muscularFocus?: string; // glutei, addome, petto, dorso, spalle, gambe, braccia, polpacci
}

/**
 * MULTI-GOAL VOLUME DISTRIBUTION
 * Calcola il moltiplicatore di volume per ogni goal
 *
 * 1 goal: 100%
 * 2 goals: 70% primario, 30% secondario
 * 3 goals: 40% primario, 30% secondario, 30% terziario
 */
function getGoalVolumeMultiplier(goals: string[], goalIndex: number): number {
  if (!goals || goals.length <= 1) return 1.0;

  if (goals.length === 2) {
    return goalIndex === 0 ? 0.7 : 0.3;
  }

  // 3 goals
  if (goalIndex === 0) return 0.4;
  return 0.3; // secondary and tertiary both get 30%
}

/**
 * GOAL DISTRIBUTION INFO
 * Genera una nota descrittiva sulla distribuzione degli obiettivi
 */
function getGoalDistributionNote(goals: string[]): string {
  if (!goals || goals.length <= 1) return '';

  const goalLabels: Record<string, string> = {
    'forza': 'Forza',
    'ipertrofia': 'Ipertrofia',
    'massa': 'Massa',
    'tonificazione': 'Tonificazione',
    'dimagrimento': 'Dimagrimento',
    'resistenza': 'Resistenza',
    'benessere': 'Benessere',
    'motor_recovery': 'Recupero',
    'gravidanza': 'Gravidanza',
    'disabilita': 'Disabilità',
    'prestazioni_sportive': 'Sport'
  };

  if (goals.length === 2) {
    const primary = goalLabels[goals[0]] || goals[0];
    const secondary = goalLabels[goals[1]] || goals[1];
    return `📊 Distribuzione: ${primary} (70%) + ${secondary} (30%)`;
  }

  // 3 goals
  const primary = goalLabels[goals[0]] || goals[0];
  const secondary = goalLabels[goals[1]] || goals[1];
  const tertiary = goalLabels[goals[2]] || goals[2];
  return `📊 Distribuzione: ${primary} (40%) + ${secondary} (30%) + ${tertiary} (30%)`;
}

/**
 * WORKOUT DURATION ESTIMATOR
 * Calcola durata stimata in minuti basandosi su esercizi/sets/rest
 *
 * Formula:
 * Duration = Warm-up + Σ(Sets × TimePerSet + RestBetweenSets) + Cool-down
 *
 * Tempi medi:
 * - Warm-up: 5 min
 * - Time per set: 30-45s (basato su reps)
 * - Rest: estratto dall'esercizio (30s, 60s, 90s, 2min, 3min)
 * - Cool-down: 3 min
 */
export function estimateWorkoutDuration(exercises: Exercise[]): number {
  const WARMUP_MINUTES = 5;
  const COOLDOWN_MINUTES = 3;

  let totalSeconds = 0;

  for (const exercise of exercises) {
    const sets = typeof exercise.sets === 'number' ? exercise.sets : 3;
    const reps = typeof exercise.reps === 'number' ? exercise.reps : 10;

    // Tempo per set basato su reps (più reps = più tempo)
    // ~3-4 secondi per rep (incluso tempo sotto tensione)
    const secondsPerSet = Math.max(20, Math.min(reps * 3.5, 60));

    // Parse rest time string (es: "90s", "2-3min", "60-75s")
    const restSeconds = parseRestTime(exercise.rest || '60s');

    // Tempo totale esercizio = (sets × tempo_per_set) + (sets - 1) × rest
    // Il rest è tra i set, quindi ne abbiamo sets-1
    const exerciseTime = (sets * secondsPerSet) + ((sets - 1) * restSeconds);

    // Aggiungi tempo transizione tra esercizi (~30s)
    totalSeconds += exerciseTime + 30;
  }

  // Converti in minuti e aggiungi warm-up/cool-down
  const workoutMinutes = Math.ceil(totalSeconds / 60);
  const totalMinutes = WARMUP_MINUTES + workoutMinutes + COOLDOWN_MINUTES;

  return totalMinutes;
}

/**
 * Parse rest time string to seconds
 * Handles formats: "30s", "90s", "2min", "2-3min", "60-75s"
 */
function parseRestTime(restString: string): number {
  if (!restString) return 60;

  // Check for minute format first
  if (restString.includes('min')) {
    // Extract first number (e.g., "2-3min" → 2, "3min" → 3)
    const match = restString.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60;
    }
    return 120; // Default 2 minutes
  }

  // Seconds format (e.g., "90s", "60-75s")
  const match = restString.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  return 60; // Default 60 seconds
}

/**
 * Formatta durata in stringa leggibile
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * BRZYCKI FORMULAS
 * Conversioni tra 1RM e nRM
 *
 * 1RM = weight × (36 / (37 - reps))
 * nRM = 1RM × ((37 - n) / 36)
 */

/**
 * Calcola 1RM da un test nRM usando Brzycki
 */
export function calculate1RMFromNRM(weight: number, reps: number): number {
  if (reps >= 37) return weight; // Limite formula
  return weight * (36 / (37 - reps));
}

/**
 * Calcola nRM da 1RM usando Brzycki
 */
export function calculateNRMFrom1RM(oneRM: number, targetReps: number): number {
  if (targetReps >= 37) return oneRM * 0.5; // Fallback
  return oneRM * ((37 - targetReps) / 36);
}

/**
 * METODO RIR-BASED - Calcolo carico più preciso
 *
 * Logica:
 * - Target reps = 5, RIR = 2
 * - Reps effettive = 5 + 2 = 7
 * - Usa peso 7RM per fare 5 reps
 *
 * @param baseline10RM - Peso usato nel test 10RM (kg)
 * @param targetReps - Reps target dell'esercizio
 * @param targetRIR - Reps In Reserve target
 * @returns Peso suggerito in kg
 */
export function calculateWeightFromRIR(
  baseline10RM: number,
  targetReps: number,
  targetRIR: number
): number {
  if (!baseline10RM || baseline10RM <= 0) return 0;

  // 1. Calcola 1RM dal test 10RM
  const estimated1RM = calculate1RMFromNRM(baseline10RM, 10);

  // 2. Calcola reps effettive (target + RIR)
  const effectiveReps = targetReps + targetRIR;

  // 3. Calcola nRM per le reps effettive
  const suggestedWeight = calculateNRMFrom1RM(estimated1RM, effectiveReps);

  // Arrotonda a 0.5kg
  return Math.round(suggestedWeight * 2) / 2;
}

/**
 * Determina RIR target basato su level, goal e dayType
 *
 * BEGINNER: RIR 3 fisso (sicurezza, tecnica)
 *   - Eccezione: forza/prestazioni → RIR 2
 *
 * INTERMEDIATE/ADVANCED: Varia per dayType
 *   - Heavy: RIR 1-2
 *   - Moderate: RIR 2-3
 *   - Volume: RIR 3-4
 *
 * Il sistema calibra nel tempo basandosi sui feedback RPE
 */
export function getTargetRIR(
  dayType: 'heavy' | 'volume' | 'moderate',
  goal: string,
  level: string = 'intermediate'
): number {
  // Goal che richiedono intensità più alta
  const isHighIntensityGoal =
    goal === 'forza' ||
    goal === 'strength' ||
    goal === 'prestazioni_sportive' ||
    goal === 'sport_performance';

  // ========================================
  // BEGINNER: RIR conservativo per sicurezza
  // ========================================
  if (level === 'beginner') {
    // Forza/prestazioni: RIR 2 (un po' più vicino al cedimento)
    if (isHighIntensityGoal) {
      return 2;
    }
    // Tutti gli altri: RIR 3 (più buffer per sicurezza e tecnica)
    return 3;
  }

  // ========================================
  // INTERMEDIATE/ADVANCED: Sistema DUP completo
  // ========================================
  switch (dayType) {
    case 'heavy':
      // Heavy day: vicino al cedimento
      return isHighIntensityGoal ? 1 : 2;

    case 'moderate':
      // Moderate day: buffer moderato
      return isHighIntensityGoal ? 2 : 3;

    case 'volume':
      // Volume day: più buffer per sostenere il volume
      return isHighIntensityGoal ? 3 : 4;

    default:
      return level === 'advanced' ? 2 : 3;
  }
}

/**
 * LOAD CALCULATOR - Calcolo carico automatico (LEGACY - usa RIR-based)
 * Mantenuto per backward compatibility
 */
export function calculateSuggestedWeight(
  baseline10RM: number,
  targetIntensity: string
): number {
  if (!baseline10RM || baseline10RM <= 0) return 0;

  // Stima 1RM dal test 10RM usando Brzycki
  const estimated1RM = calculate1RMFromNRM(baseline10RM, 10);

  // Parse intensità (es: "75%", "85-90%", "65-70%")
  const intensityMatch = targetIntensity.match(/(\d+)/);
  const intensityPercent = intensityMatch ? parseInt(intensityMatch[1]) : 70;

  // Calcola peso target
  const suggestedWeight = Math.round((estimated1RM * intensityPercent / 100) * 2) / 2;

  return suggestedWeight;
}

/**
 * Formatta peso suggerito in stringa
 */
export function formatWeight(weight: number): string {
  if (weight <= 0) return 'Corpo libero';
  if (weight % 1 === 0) return `${weight}kg`;
  return `${weight.toFixed(1)}kg`;
}

/**
 * PROGRESSION RATE - Moltiplicatore progressione per multi-goal
 *
 * Schede pure (1 goal): 100% progression rate
 * Schede miste (2 goals): 70% progression rate
 * Schede miste (3 goals): 50% progression rate
 *
 * Questo perché:
 * - Volume distribuito su più adattamenti
 * - Recupero più complesso
 * - Risultati più lenti per singolo goal
 */
export function getProgressionMultiplier(goalsCount: number): number {
  if (goalsCount <= 1) return 1.0;     // 100% - progressione normale
  if (goalsCount === 2) return 0.7;    // 70% - progressione ridotta
  return 0.5;                          // 50% - progressione molto ridotta
}

/**
 * Calcola incremento carico suggerito per prossima sessione
 *
 * Standard increments:
 * - Upper body: 1-2.5kg
 * - Lower body: 2.5-5kg
 *
 * Modificato per multi-goal
 */
export function calculateWeightIncrement(
  currentWeight: number,
  exercisePattern: string,
  goalsCount: number,
  rpe: number // 1-10 dall'ultima sessione
): number {
  // Incrementi base
  const isLowerBody = exercisePattern.includes('lower');
  const baseIncrement = isLowerBody ? 2.5 : 1.25;

  // Applica moltiplicatore multi-goal
  const progressionMultiplier = getProgressionMultiplier(goalsCount);

  // Modifica basata su RPE
  let rpeModifier = 1.0;
  if (rpe <= 6) {
    rpeModifier = 1.5; // RPE basso → incremento maggiore
  } else if (rpe >= 9) {
    rpeModifier = 0; // RPE troppo alto → nessun incremento
  } else if (rpe >= 8) {
    rpeModifier = 0.5; // RPE alto → incremento ridotto
  }

  const finalIncrement = baseIncrement * progressionMultiplier * rpeModifier;

  // Arrotonda a 0.5kg
  return Math.round(finalIncrement * 2) / 2;
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

  // ✅ DAY A: FULL BODY (tutti i 7 pattern)
  // Squat HEAVY, Deadlift MOD, Bench HEAVY, Row MOD, Military MOD, Pulldown MOD, Core VOL
  days[0].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, getIntensityForPattern('lower_push', 0, 0)),
    createExercise('lower_pull', baselines.lower_pull, 0, options, getIntensityForPattern('lower_pull', 1, 0)),
    createExercise('horizontal_push', baselines.horizontal_push, 0, options, getIntensityForPattern('horizontal_push', 2, 0)),
    createHorizontalPullExercise(0, options, getIntensityForPattern('horizontal_pull', 3, 0), baselines.vertical_pull),
    createExercise('vertical_push', baselines.vertical_push, 0, options, getIntensityForPattern('vertical_push', 4, 0)),
    createExercise('vertical_pull', baselines.vertical_pull, 0, options, getIntensityForPattern('vertical_pull', 5, 0)),
    createExercise('core', baselines.core, 0, options, getIntensityForPattern('core', 6, 0))
  ];

  // ✅ DAY B: FULL BODY (tutti i 7 pattern, rotazione intensità)
  // Squat MOD, Deadlift HEAVY, Bench MOD, Row HEAVY, Military HEAVY, Pulldown MOD, Core VOL
  days[1].exercises = [
    createExercise('lower_push', baselines.lower_push, 1, options, getIntensityForPattern('lower_push', 0, 1)), // Variante
    createExercise('lower_pull', baselines.lower_pull, 1, options, getIntensityForPattern('lower_pull', 1, 1)), // Variante
    createExercise('horizontal_push', baselines.horizontal_push, 1, options, getIntensityForPattern('horizontal_push', 2, 1)), // Variante
    createHorizontalPullExercise(1, options, getIntensityForPattern('horizontal_pull', 3, 1), baselines.vertical_pull), // Variante
    createExercise('vertical_push', baselines.vertical_push, 1, options, getIntensityForPattern('vertical_push', 4, 1)), // Variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options, getIntensityForPattern('vertical_pull', 5, 1)), // Variante
    createExercise('core', baselines.core, 1, options, getIntensityForPattern('core', 6, 1))
  ];

  // ✅ DAY C: FULL BODY (tutti i 7 pattern, altra rotazione)
  // Squat HEAVY, Deadlift MOD, Bench MOD, Row MOD, Military MOD, Pulldown HEAVY, Core VOL
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, getIntensityForPattern('lower_push', 0, 2)), // Back to baseline
    createExercise('lower_pull', baselines.lower_pull, 0, options, getIntensityForPattern('lower_pull', 1, 2)),
    createExercise('horizontal_push', baselines.horizontal_push, 2, options, getIntensityForPattern('horizontal_push', 2, 2)), // Altra variante
    createHorizontalPullExercise(2, options, getIntensityForPattern('horizontal_pull', 3, 2), baselines.vertical_pull), // Altra variante
    createExercise('vertical_push', baselines.vertical_push, 0, options, getIntensityForPattern('vertical_push', 4, 2)),
    createExercise('vertical_pull', baselines.vertical_pull, 2, options, getIntensityForPattern('vertical_pull', 5, 2)), // Altra variante
    createExercise('core', baselines.core, 2, options, getIntensityForPattern('core', 6, 2))
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

  // ✅ UPPER A: HEAVY DAY (Horizontal Push focus)
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options, 'heavy'),
    createExercise('vertical_pull', baselines.vertical_pull, 0, options, 'heavy'),
    createExercise('vertical_push', baselines.vertical_push, 0, options, 'heavy'),
    createExercise('core', baselines.core, 0, options, 'heavy')
  ];

  // ✅ LOWER A: VOLUME DAY (Squat focus)
  days[1].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, 'volume'),
    createExercise('lower_pull', baselines.lower_pull, 0, options, 'volume'),
    createExercise('core', baselines.core, 1, options, 'volume')
  ];

  // ✅ UPPER B: MODERATE DAY (Vertical Push focus + varianti)
  days[2].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options, 'moderate'),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options, 'moderate'), // Variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options, 'moderate'), // Variante
    createExercise('core', baselines.core, 2, options, 'moderate')
  ];

  // ✅ LOWER B: MODERATE DAY (Deadlift focus + varianti)
  days[3].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options, 'moderate'), // Variante
    createExercise('lower_push', baselines.lower_push, 1, options, 'moderate'), // Variante
    createExercise('core', baselines.core, 3, options, 'moderate')
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

  // ✅ PUSH A: HEAVY DAY
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options, 'heavy'),
    createExercise('vertical_push', baselines.vertical_push, 0, options, 'heavy'),
    createAccessoryExercise('triceps', 0, options, 'heavy'),
    createExercise('core', baselines.core, 0, options, 'heavy')
  ];

  // ✅ PULL A: VOLUME DAY - Include Horizontal Pull (Row)
  days[1].exercises = [
    createExercise('vertical_pull', baselines.vertical_pull, 0, options, 'volume'),
    createHorizontalPullExercise(0, options, 'volume', baselines.vertical_pull), // Row pattern
    createAccessoryExercise('biceps', 0, options, 'volume'),
    createExercise('core', baselines.core, 1, options, 'volume')
  ];

  // ✅ LEGS A: MODERATE DAY
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, 'moderate'),
    createExercise('lower_pull', baselines.lower_pull, 0, options, 'moderate'),
    createAccessoryExercise('calves', 0, options, 'moderate'),
    createExercise('core', baselines.core, 2, options, 'moderate')
  ];

  // ✅ PUSH B: VOLUME DAY (varianti)
  days[3].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options, 'volume'),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options, 'volume'),
    createAccessoryExercise('triceps', 1, options, 'volume')
  ];

  // ✅ PULL B: MODERATE DAY (varianti)
  days[4].exercises = [
    createHorizontalPullExercise(1, options, 'moderate', baselines.vertical_pull), // Row variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options, 'moderate'),
    createAccessoryExercise('biceps', 1, options, 'moderate')
  ];

  // ✅ LEGS B: HEAVY DAY (varianti)
  days[5].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options, 'heavy'),
    createExercise('lower_push', baselines.lower_push, 1, options, 'heavy'),
    createAccessoryExercise('calves', 1, options, 'heavy')
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
 * @param dayType - Tipo di giorno per DUP: 'heavy', 'volume', 'moderate'
 */
function createExercise(
  patternId: string,
  baseline: any,
  variantIndex: number,
  options: SplitGeneratorOptions,
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
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

  // ✅ Calcola volume basato su baseline + dayType (DUP)
  const baselineReps = baseline.reps;
  const volumeCalc = calculateVolume(baselineReps, goal, level, location, dayType);

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

  // ✅ CALCOLO CARICO AUTOMATICO (RIR-based)
  // Se abbiamo il peso 10RM dallo screening, calcoliamo il peso suggerito
  let suggestedWeight = '';
  let weightNote = '';
  if (baseline.weight10RM && baseline.weight10RM > 0 && location === 'gym') {
    // Usa metodo RIR-based (più preciso) con level
    const targetRIR = getTargetRIR(dayType, goal, level);
    const targetReps = typeof finalReps === 'number' ? finalReps : 8;
    const effectiveReps = targetReps + targetRIR;

    const weight = calculateWeightFromRIR(baseline.weight10RM, targetReps, targetRIR);
    suggestedWeight = formatWeight(weight);
    weightNote = `RIR ${targetRIR}`;

    // Calcola anche 1RM per riferimento
    const estimated1RM = calculate1RMFromNRM(baseline.weight10RM, 10);

    console.log(`⚖️ ${exerciseName}: ${suggestedWeight} (${targetReps} reps @ RIR ${targetRIR} = ${effectiveReps}RM) [${level}]`);
    console.log(`   → 10RM: ${baseline.weight10RM}kg → 1RM stimato: ${Math.round(estimated1RM)}kg`);
  }

  return {
    pattern: patternId as any,
    name: exerciseName,
    sets: finalSets,
    reps: finalReps,
    rest: volumeCalc.rest,
    intensity: volumeCalc.intensity,
    weight: suggestedWeight || undefined, // ✅ Peso calcolato dal sistema
    baseline: {
      variantId: baseline.variantId,
      difficulty: baseline.difficulty,
      maxReps: baselineReps
    },
    wasReplaced: wasReplaced,
    notes: [
      volumeCalc.notes,
      `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
      suggestedWeight ? `💪 Carico: ${suggestedWeight} (${weightNote})` : '',
      painNotes,
      machineNotes
    ].filter(Boolean).join(' | ')
  };
}

/**
 * Crea esercizio Horizontal Pull (Row) - non testato nello screening
 * Usa il baseline del vertical_pull come riferimento (muscoli simili)
 */
function createHorizontalPullExercise(
  variantIndex: number,
  options: SplitGeneratorOptions,
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate',
  verticalPullBaseline?: any
): Exercise {
  const { level, goal, location, trainingType } = options;

  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  const variants = HORIZONTAL_PULL_VARIANTS.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  const selectedVariant = variants[variantIndex % variants.length];
  let exerciseName = selectedVariant.name;

  // ✅ Usa baseline del vertical_pull se disponibile, altrimenti assume 12 reps
  const baselineReps = verticalPullBaseline?.reps || 12;
  const volumeCalc = calculateVolume(baselineReps, goal, level, location, dayType);

  // Conversione a macchine
  if (location === 'gym' && trainingType === 'machines') {
    exerciseName = convertToMachineVariant(exerciseName);
  }

  // ✅ CALCOLO CARICO AUTOMATICO (se abbiamo baseline dal vertical_pull)
  let suggestedWeight = '';
  let weightNote = '';
  if (verticalPullBaseline?.weight10RM && verticalPullBaseline.weight10RM > 0 && location === 'gym') {
    const targetRIR = getTargetRIR(dayType, goal, level);
    const targetReps = typeof volumeCalc.reps === 'number' ? volumeCalc.reps : 8;
    const weight = calculateWeightFromRIR(verticalPullBaseline.weight10RM, targetReps, targetRIR);
    suggestedWeight = formatWeight(weight);
    weightNote = `RIR ${targetRIR}`;

    console.log(`⚖️ ${exerciseName}: ${suggestedWeight} (${targetReps} reps @ RIR ${targetRIR}) [${level}] - stimato da vertical pull`);
  }

  return {
    pattern: 'horizontal_pull' as any, // Pattern corretto per Row
    name: exerciseName,
    sets: volumeCalc.sets,
    reps: volumeCalc.reps,
    rest: volumeCalc.rest,
    intensity: volumeCalc.intensity,
    weight: suggestedWeight || undefined,
    baseline: verticalPullBaseline ? {
      variantId: 'estimated_from_vertical_pull',
      difficulty: verticalPullBaseline.difficulty || 5,
      maxReps: baselineReps
    } : undefined,
    notes: [
      'Row pattern - complementare al vertical pull',
      suggestedWeight ? `💪 Carico: ${suggestedWeight} (${weightNote}) - stimato` : '',
      verticalPullBaseline ? `Baseline: ${baselineReps} reps (stimato da lat pulldown)` : ''
    ].filter(Boolean).join(' | ')
  };
}

/**
 * Crea esercizio accessorio (triceps, biceps, calves)
 */
function createAccessoryExercise(
  muscleGroup: 'triceps' | 'biceps' | 'calves',
  variantIndex: number,
  options: SplitGeneratorOptions,
  dayType: 'heavy' | 'volume' | 'moderate' = 'moderate'
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
  const { frequency, goals } = options;

  console.log(`🗓️ Generazione split settimanale per ${frequency}x/settimana`);

  // Log multi-goal info
  if (goals && goals.length > 1) {
    console.log(`🎯 Multi-goal detected: ${goals.join(', ')}`);
    console.log(`📊 Volume distribution: ${goals.length === 2 ? '70-30' : '40-30-30'}`);
  }

  let split: WeeklySplit;

  if (frequency <= 3) {
    split = generate3DayFullBody(options);
  } else if (frequency === 4) {
    split = generate4DayUpperLower(options);
  } else {
    // 5-6 giorni
    split = generate6DayPPL(options);
  }

  // Aggiungi nota distribuzione obiettivi alla descrizione
  const distributionNote = getGoalDistributionNote(goals || []);
  if (distributionNote) {
    split.description = `${split.description}\n\n${distributionNote}`;
  }

  // ✅ Calcola durata stimata per ogni giorno
  split.days.forEach(day => {
    const duration = estimateWorkoutDuration(day.exercises);
    day.estimatedDuration = duration;
    console.log(`⏱️ ${day.dayName}: ~${duration} min`);
  });

  // Calcola durata media
  const avgDuration = Math.round(
    split.days.reduce((sum, day) => sum + (day.estimatedDuration || 0), 0) / split.days.length
  );
  split.averageDuration = avgDuration;
  console.log(`📊 Durata media workout: ~${avgDuration} min`);

  return split;
}
