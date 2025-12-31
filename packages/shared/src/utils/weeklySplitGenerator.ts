/**
 * Weekly Split Generator
 * Sistema intelligente per creare split personalizzati basati su frequenza
 * Split scientificamente validati con varianti per evitare ripetizioni
 */

import { Level, Goal, PatternBaselines, Exercise, WarmupSet, WarmupSetDetail, SupersetConfig } from '../types';
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
import { adaptExercisesForLocation } from './locationAdapter';

/**
 * Mapping nomi esercizi inglese -> italiano
 */
const EXERCISE_NAMES_IT: Record<string, string> = {
  // Lower Push - Calisthenics
  'Shrimp Squat': 'Squat Gamberetto',
  'Skater Squat': 'Squat del Pattinatore',
  'Pistol Squat': 'Squat a Pistola',
  'Pistol Squat (Assisted)': 'Squat a Pistola (Assistito)',
  'Bulgarian Split Squat': 'Squat Bulgaro',
  'Split Squat': 'Affondi Statici',
  'Jump Squat': 'Squat con Salto',
  'Bodyweight Squat': 'Squat a Corpo Libero',
  'Air Squat': 'Squat a Corpo Libero',
  'Box Squat': 'Squat al Box',

  // Lower Push - Palestra
  'Back Squat': 'Squat con Bilanciere',
  'Front Squat': 'Squat Frontale',
  'Goblet Squat': 'Goblet Squat',
  'Leg Press': 'Pressa',
  'Hack Squat': 'Hack Squat',
  'Smith Machine Squat': 'Squat al Multipower',
  'Leg Extension': 'Leg Extension',

  // Lower Pull - Calisthenics
  'Nordic Curl': 'Nordic Curl',
  'Nordic Hamstring Curl': 'Nordic Curl',
  'Nordic Curl (Eccentric Only)': 'Nordic Curl (Solo Eccentrica)',
  'Slider Leg Curl': 'Leg Curl Scorrevole',
  'Slider Leg Curl (Single Leg)': 'Leg Curl Scorrevole Singolo',
  'Sliding Leg Curl': 'Leg Curl Scorrevole',
  'Single Leg RDL': 'Stacco Rumeno Monopodalico',
  'Single Leg RDL (Bodyweight)': 'Stacco Rumeno Monopodalico',
  'Single Leg Glute Bridge': 'Ponte Glutei Monopodalico',
  'Glute Bridge': 'Ponte Glutei',
  'Hip Thrust': 'Hip Thrust',
  'Hip Thrust (Single Leg)': 'Hip Thrust Monopodalico',
  'Hip Thrust (Elevated)': 'Hip Thrust Elevato',

  // Lower Pull - Palestra
  'Conventional Deadlift': 'Stacco da Terra',
  'Deadlift': 'Stacco da Terra',
  'Romanian Deadlift (RDL)': 'Romanian Deadlift',
  'Romanian Deadlift': 'Romanian Deadlift',
  'Sumo Deadlift': 'Stacco Sumo',
  'Trap Bar Deadlift': 'Stacco Trap Bar',
  'Leg Curl (Machine)': 'Leg Curl',
  'Leg Curl': 'Leg Curl',
  'Bodyweight Hip Hinge': 'Good Morning Bodyweight',
  'Good Morning': 'Good Morning',

  // Horizontal Push - Calisthenics
  'Standard Push-up': 'Push-up Standard',
  'Push-up': 'Push-up',
  'Diamond Push-up': 'Push-up Diamante',
  'Archer Push-up': 'Push-up Arciere',
  'One Arm Push-up': 'Push-up a Un Braccio',
  'Wide Push-up': 'Push-up Larghi',
  'Close Grip Push-up': 'Push-up Stretti',
  'Decline Push-up': 'Push-up Declinati',
  'Incline Push-up': 'Push-up Inclinati',
  'Deficit Push-up': 'Push-up Deficit',
  'Pseudo Planche Push-up': 'Pseudo Planche Push-up',
  'Ring Push-up': 'Push-up agli Anelli',
  'Typewriter Push-up': 'Push-up Typewriter',

  // Horizontal Push - Palestra
  'Flat Barbell Bench Press': 'Panca Piana',
  'Barbell Bench Press': 'Panca Piana',
  'Bench Press': 'Panca Piana',
  'Incline Bench Press': 'Panca Inclinata',
  'Decline Bench Press': 'Panca Declinata',
  'Dumbbell Bench Press': 'Panca con Manubri',
  'Incline Dumbbell Press': 'Panca Inclinata Manubri',
  'Chest Press (Machine)': 'Chest Press',
  'Chest Press': 'Chest Press',
  'Cable Fly': 'Croci ai Cavi',
  'Dips': 'Dips',
  'Chest Dips': 'Dips per Petto',

  // Horizontal Pull - Calisthenics
  'Inverted Row': 'Rematore Inverso',
  'Inverted Row (tavolo)': 'Rematore Inverso (tavolo)',
  'Australian Pull-up': 'Rematore Inverso',
  'TRX Row': 'TRX Row',
  'Ring Row': 'Row agli Anelli',
  'Floor Pull': 'Floor Pull',
  'Floor Pull Facilitato': 'Floor Pull Facilitato',

  // Horizontal Pull - Palestra
  'Barbell Row': 'Rematore con Bilanciere',
  'Bent Over Row': 'Rematore con Bilanciere',
  'Dumbbell Row': 'Rematore con Manubrio',
  'One Arm Dumbbell Row': 'Rematore con Manubrio',
  'Cable Row': 'Pulley Basso',
  'Seated Cable Row': 'Pulley Basso',
  'T-Bar Row': 'Rematore T-Bar',
  'Machine Row': 'Pulley Basso',

  // Vertical Push - Calisthenics
  'Pike Push-up': 'Pike Push-up',
  'Elevated Pike Push-up': 'Pike Push-up Elevato',
  'Wall Handstand Push-up': 'HSPU al Muro',
  'Handstand Push-up': 'Handstand Push-up',
  'Wall Walk': 'Camminata al Muro',

  // Vertical Push - Palestra
  'Overhead Press': 'Military Press',
  'Barbell Overhead Press': 'Military Press',
  'Standing Barbell Press': 'Military Press',
  'Military Press': 'Military Press',
  'Dumbbell Shoulder Press': 'Shoulder Press con Manubri',
  'Seated Dumbbell Press': 'Shoulder Press con Manubri',
  'Arnold Press': 'Arnold Press',
  'Machine Shoulder Press': 'Shoulder Press Macchina',

  // Vertical Pull - Calisthenics
  'Pull-up': 'Trazioni',
  'Chin-up': 'Chin-up',
  'Wide Grip Pull-up': 'Trazioni Presa Larga',
  'Close Grip Chin-up': 'Trazioni Presa Stretta',
  'Neutral Grip Pull-up': 'Trazioni Presa Neutra',
  'Assisted Pull-up': 'Trazioni Assistite',
  'Band Assisted Pull-up': 'Trazioni con Elastico',
  'Negative Pull-up': 'Trazioni Negative',
  'Archer Pull-up': 'Trazioni Arciere',

  // Vertical Pull - Palestra
  'Lat Pulldown': 'Lat Machine',
  'Lat Pulldown Wide': 'Lat Machine Presa Larga',
  'Lat Pulldown Close': 'Lat Machine Presa Stretta',
  'Cable Pulldown': 'Lat Machine',

  // Core - Calisthenics
  'Plank': 'Plank',
  'Side Plank': 'Plank Laterale',
  'Hollow Body Hold': 'Hollow Body Hold',
  'L-sit': 'L-sit',
  'Tuck L-sit': 'L-sit Raccolto',
  'Dead Bug': 'Dead Bug',
  'Bird Dog': 'Bird Dog',
  'Dragon Flag': 'Dragon Flag',
  'Mountain Climber': 'Mountain Climber',

  // Core - Palestra
  'Pallof Press': 'Pallof Press',
  'Ab Wheel Rollout': 'Ab Wheel',
  'Ab Wheel': 'Ab Wheel',
  'Hanging Leg Raise': 'Leg Raise alla Sbarra',
  'Cable Crunch': 'Crunch ai Cavi',
  'Russian Twist': 'Russian Twist',
  'Bicycle Crunch': 'Crunch Bicicletta',
  'Reverse Crunch': 'Crunch Inverso',

  // Accessori
  'Bicep Curl': 'Curl con Manubri',
  'Dumbbell Curl': 'Curl con Manubri',
  'Barbell Curl': 'Curl con Bilanciere',
  'Hammer Curl': 'Hammer Curl',
  'Tricep Extension': 'French Press',
  'Tricep Pushdown': 'Tricep Pushdown',
  'Skull Crusher': 'French Press',
  'Lateral Raise': 'Alzate Laterali',
  'Front Raise': 'Alzate Frontali',
  'Face Pull': 'Face Pull',
  'Calf Raise': 'Calf Raise',
  'Seated Calf Raise': 'Calf Raise Seduto',
  'Walking Lunge': 'Affondi Camminati',
  'Lunge': 'Affondi',
  'Reverse Lunge': 'Affondi Indietro',
  'Cable Crossover': 'Croci ai Cavi',
  'Band Pull Apart': 'Band Pull Apart',
  'Chest Fly': 'Croci con Manubri',
  'Reverse Fly': 'Alzate Posteriori',

  // Varianti aggiuntive da exerciseVariants.ts
  'Squat Jump': 'Squat con Salto',
  'Squat con Pausa': 'Squat con Pausa',
  'Hip Hinge a Corpo Libero': 'Hip Hinge a Corpo Libero',
  'Hip Thrust Rialzato': 'Hip Thrust Rialzato',
  'Nordic Curl (Solo Eccentrica)': 'Nordic Curl (Solo Eccentrica)',
  'Piegamenti Diamante': 'Push-up Diamante',
  'Alzate Gambe alla Sbarra': 'Alzate Gambe alla Sbarra',

  // Esercizi correttivi/riabilitativi
  'Connection Breath': 'Respiro Connesso',
  'Diaphragmatic Breathing': 'Respirazione Diaframmatica',
  'Pelvic Floor Activation': 'Attivazione Pavimento Pelvico',
  'Deep Squat Hold': 'Tenuta Squat Profondo',
  'Happy Baby Stretch': 'Allungamento Happy Baby',
  'Pelvic Tilts': 'Inclinazioni Pelviche',
  'Bird Dog (Modified)': 'Bird Dog (Modificato)',
  'Dead Bug Heel Slides': 'Dead Bug con Scivolamenti',
  'Toe Taps': 'Toe Taps',
  'Supine Marching': 'Marcia Supina',
  'Dead Bug Progression': 'Progressione Dead Bug',
  'Pallof Press (Kneeling)': 'Pallof Press (in Ginocchio)',
  'Side Plank (Modified)': 'Plank Laterale (Modificato)',
  'Bear Hold': 'Tenuta dell\'Orso',
  'Wall Sit with Breathing': 'Muro con Respirazione',
  'Seated Knee Lifts': 'Alzate Ginocchia Seduto',
  'Half Kneeling Chop': 'Chop in Ginocchio',
  'Wall Push-up': 'Push-up al Muro',
  'Seated Row (Band)': 'Remata con Elastico',
  'Standing Leg Curl': 'Leg Curl in Piedi',
  'Side Lying Leg Lift': 'Alzate Gambe Laterali',
  'Modified Squat': 'Squat Modificato',
  'Standing Hip Circles': 'Cerchi dell\'Anca',
  'Shoulder Blade Squeeze': 'Attivazione Scapolare',
  'Standing March': 'Marcia in Piedi',

  // Alternative palestra (solo non-duplicati)
  'Dumbbell Squat': 'Squat con Manubri',
  'Dumbbell Deadlift': 'Stacco con Manubri',
  'Dumbbell RDL': 'Stacco Rumeno con Manubri',
  'Cable Pull Through': 'Pull Through ai Cavi',
  'Dumbbell Sumo Deadlift': 'Stacco Sumo con Manubri',
  'Wide Stance Leg Press': 'Pressa Gambe Larghe',
  'Sumo Squat': 'Squat Sumo',
  'Floor Press': 'Floor Press',
  'Floor Press con Manubri': 'Floor Press con Manubri',
  'Panca Inclinata con Manubri': 'Panca Inclinata con Manubri',
  'Landmine Press': 'Landmine Press',
  'Incline Chest Press (Macchina)': 'Chest Press Inclinato',
  'Low Cable Fly': 'Croci ai Cavi (dal basso)',
  'High Cable Fly': 'Croci ai Cavi (dall\'alto)',
  'Decline Dumbbell Press': 'Panca Declinata Manubri',
  'Shoulder Press (Macchina)': 'Shoulder Press Macchina',
  'Close Grip Bench Press': 'Panca Presa Stretta',
  'Tricep Dips': 'Dip Tricipiti',
  'Narrow Push-up': 'Push-up Stretti',
  'Single Arm Dumbbell Press': 'Panca Unilaterale',
  'Dumbbell Push Press': 'Push Press con Manubri',
  'Lateral Raise + Press': 'Alzate Laterali + Press',
  'Cable Lateral Raise': 'Alzate Laterali ai Cavi',
  'Pike Push-up (elevato)': 'Pike Push-up Elevato',
  'Dumbbell Shoulder Press (pesante)': 'Shoulder Press Pesante',
  'Handstand Hold': 'Verticale in Tenuta',
  'Wide Grip Lat Pulldown': 'Lat Machine Presa Larga',
  'Standard Pull-up': 'Trazioni',
  'Straight Arm Pulldown': 'Pulldown Braccia Tese',
  'Supinated Lat Pulldown': 'Lat Machine Presa Supina',
  'Cable Curl + Pulldown': 'Curl + Pulldown ai Cavi',
  'Neutral Grip Lat Pulldown': 'Lat Machine Presa Neutra',
  'Seated Cable Row (presa alta)': 'Pulley Presa Alta',
  'Cable Pullover': 'Pullover ai Cavi',
  'Band Pull-up': 'Trazioni con Elastico',
  'Chest Supported Row': 'Rematore su Panca',
  'Band Row': 'Rematore con Elastico',
  'Landmine Row': 'Rematore Landmine',
  'Ab Wheel (in ginocchio)': 'Ab Wheel (in Ginocchio)',
  'Suitcase Carry': 'Trasporto Laterale',
  'Copenhagen Plank': 'Copenhagen Plank',
  'Captain Chair Leg Raise': 'Alzate Gambe alla Captain Chair',
  'Lying Leg Raise': 'Alzate Gambe a Terra',
  'Barbell Rollout': 'Rollout con Bilanciere',
  'Stability Ball Rollout': 'Rollout con Palla',
  'Machine Crunch': 'Crunch alla Macchina',
  'Weighted Crunch': 'Crunch con Peso',
  'Hanging Knee Raise': 'Ginocchia al Petto alla Sbarra',
  'Cable Rotation': 'Rotazione ai Cavi',

  // Curl e accessori
  'Curl con Bilanciere': 'Curl con Bilanciere',
  'Curl a Martello': 'Curl a Martello',
  'Dip Tricipiti': 'Dip Tricipiti',
  'Pushdown ai Cavi': 'Pushdown ai Cavi',
  'Calf Raise in Piedi': 'Calf Raise in Piedi',

  // ============================================
  // Esercizi da locationAdapter.ts (forza relativa)
  // ============================================

  // Horizontal Push - Progressioni
  'One-Arm Push-up': 'Push-up a Un Braccio',
  'One-Arm Push-up (Assisted)': 'Push-up a Un Braccio (Assistito)',
  'Knee Push-up': 'Push-up sulle Ginocchia',

  // Vertical Push - Progressioni
  'Freestanding Handstand Push-up': 'Verticale Push-up Libero',
  'Wall Handstand Push-up (Eccentric)': 'HSPU al Muro (Solo Eccentrica)',
  'Elevated Pike Push-up (High)': 'Pike Push-up Alto',
  'Pike Push-up (Knee)': 'Pike Push-up sulle Ginocchia',
  'Wall Shoulder Tap': 'Shoulder Tap al Muro',

  // Vertical Pull - Alternative senza sbarra
  'Floor Pull Singolo Braccio': 'Floor Pull a Un Braccio',
  'Floor Pull (asciugamano)': 'Floor Pull con Asciugamano',
  'Inverted Row Facilitato': 'Rematore Inverso Facilitato',
  'Scapular Pull (a terra)': 'Retrazione Scapolare a Terra',

  // Horizontal Pull - Alternative
  'Inverted Row Singolo Braccio': 'Rematore Inverso a Un Braccio',
  'Inverted Row Piedi Elevati': 'Rematore Inverso Piedi Elevati',

  // Altri esercizi body weight
  'Prone Y-raise': 'Y-raise Prono',
  'Alzate Gambe a Terra': 'Alzate Gambe a Terra'
};

/**
 * Traduce il nome dell'esercizio in italiano
 */
function translateExerciseName(name: string): string {
  if (EXERCISE_NAMES_IT[name]) {
    return EXERCISE_NAMES_IT[name];
  }
  const key = Object.keys(EXERCISE_NAMES_IT).find(
    k => k.toLowerCase() === name.toLowerCase()
  );
  if (key) {
    return EXERCISE_NAMES_IT[key];
  }
  return name;
}

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
  // CORE/ACCESSORI: SEMPRE VOLUME (non cambiano)
  if (patternId === 'core' || patternId === 'corrective') {
    return 'volume';
  }

  // ROTAZIONE DUP PER COMPOUND MOVEMENTS (Full Body 7 pattern)
  // Ogni giorno 2 esercizi HEAVY, 4 MODERATE, 1 VOLUME (core)

  // DAY 1 (Monday): Lower Push (Squat) + Horizontal Push (Bench) HEAVY
  if (dayIndex === 0) {
    if (patternId === 'lower_push' || patternId === 'horizontal_push') {
      return 'heavy'; // Squat HEAVY, Bench HEAVY
    }
    // Tutti gli altri: MODERATE (Deadlift, Row, Military, Pulldown)
    return 'moderate';
  }

  // DAY 2 (Wednesday): Lower Pull (Deadlift) + Horizontal Pull (Row) + Vertical Push (Military) HEAVY
  if (dayIndex === 1) {
    if (patternId === 'lower_pull' || patternId === 'horizontal_pull' || patternId === 'vertical_push') {
      return 'heavy'; // Deadlift HEAVY, Row HEAVY, Military HEAVY
    }
    // Tutti gli altri: MODERATE (Squat, Bench, Pulldown)
    return 'moderate';
  }

  // DAY 3 (Friday): Lower Push (Squat) + Vertical Pull (Pulldown) HEAVY
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

// ============================================
// SISTEMA RISCALDAMENTO AUTOMATICO
// ============================================

/**
 * Zona muscolare per il riscaldamento
 * - upper: petto, spalle, dorso, braccia
 * - lower: gambe, glutei, anche
 * - core: addome (non richiede riscaldamento specifico con pesi)
 */
type MuscleZone = 'upper' | 'lower' | 'core';

/**
 * Mappa pattern -> zona muscolare
 */
const PATTERN_TO_ZONE: Record<string, MuscleZone> = {
  // LOWER BODY
  lower_push: 'lower',    // Squat, Leg Press, etc.
  lower_pull: 'lower',    // Deadlift, RDL, etc.
  // UPPER BODY - PUSH
  horizontal_push: 'upper', // Bench Press, Push-up, etc.
  vertical_push: 'upper',   // Military Press, etc.
  // UPPER BODY - PULL
  vertical_pull: 'upper',   // Lat Pulldown, Pull-up, etc.
  horizontal_pull: 'upper', // Row, etc.
  // CORE
  core: 'core',
  corrective: 'core', // Correttivi non richiedono warmup con pesi
};

/**
 * Determina la zona muscolare di un esercizio
 */
function getExerciseZone(exercise: Exercise): MuscleZone {
  const pattern = exercise.pattern;

  // Prima controlla il pattern
  if (pattern && PATTERN_TO_ZONE[pattern]) {
    return PATTERN_TO_ZONE[pattern];
  }

  // Fallback: analizza il nome dell'esercizio
  const nameLower = exercise.name.toLowerCase();

  // Lower body keywords
  if (
    nameLower.includes('squat') ||
    nameLower.includes('deadlift') ||
    nameLower.includes('stacco') ||
    nameLower.includes('leg') ||
    nameLower.includes('lunge') ||
    nameLower.includes('affondo') ||
    nameLower.includes('hip thrust') ||
    nameLower.includes('glute') ||
    nameLower.includes('calf') ||
    nameLower.includes('polpacci')
  ) {
    return 'lower';
  }

  // Core keywords
  if (
    nameLower.includes('plank') ||
    nameLower.includes('crunch') ||
    nameLower.includes('dead bug') ||
    nameLower.includes('bird dog') ||
    nameLower.includes('ab ') ||
    nameLower.includes('core')
  ) {
    return 'core';
  }

  // Default: upper body
  return 'upper';
}

/**
 * Tipo di lavoro basato sulle ripetizioni target
 */
type WorkType = 'strength' | 'hypertrophy' | 'endurance';

/**
 * Determina il tipo di lavoro dalle ripetizioni
 */
function getWorkType(reps: number | string): WorkType {
  const numReps = typeof reps === 'number' ? reps : parseInt(String(reps).split('-')[0] || '10');

  if (numReps <= 5) return 'strength';      // 1-5 rep = forza
  if (numReps <= 12) return 'hypertrophy';  // 6-12 rep = ipertrofia
  return 'endurance';                        // 13+ rep = resistenza
}

/**
 * Crea le serie di riscaldamento per un esercizio
 *
 * Schema basato sul tipo di lavoro:
 *
 * FORZA (1-5 rep): Rampa progressiva per preparare il SNC
 * - 8 rep @ 40% (leggero, attivazione)
 * - 5 rep @ 55% (medio)
 * - 3 rep @ 70% (avvicinamento al carico)
 * - 1 rep @ 85% (singola pesante, opzionale)
 *
 * IPERTROFIA (6-12 rep): Riscaldamento moderato
 * - 2x6 @ 60%
 *
 * RESISTENZA (13+ rep): Riscaldamento leggero
 * - 1x8 @ 50%
 */
function createWarmupSets(zone: MuscleZone, targetReps: number | string = 10): WarmupSet {
  const workType = getWorkType(targetReps);
  const zoneLabel = zone === 'upper' ? 'parte alta' : 'parte bassa';

  if (workType === 'strength') {
    // FORZA: Rampa progressiva (fondamentale per carichi pesanti)
    const ramp: WarmupSetDetail[] = [
      { reps: 8, percentage: 40 },  // Leggero - attivazione muscolare
      { reps: 5, percentage: 55 },  // Medio - preparazione
      { reps: 3, percentage: 70 },  // Pesante - avvicinamento
      { reps: 1, percentage: 85 },  // Singola - "sentire" il carico
    ];

    return {
      sets: 4,
      reps: 4, // media (per stima durata)
      percentage: 60, // media (per stima durata)
      ramp,
      note: `Rampa forza ${zoneLabel}: 8@40%, 5@55%, 3@70%, 1@85%`
    };
  }

  if (workType === 'hypertrophy') {
    // IPERTROFIA: Standard 2x6 @ 60%
    return {
      sets: 2,
      reps: 6,
      percentage: 60,
      note: `Riscaldamento ${zoneLabel}`
    };
  }

  // RESISTENZA: Leggero 1x8 @ 50%
  return {
    sets: 1,
    reps: 8,
    percentage: 50,
    note: `Attivazione ${zoneLabel}`
  };
}

/**
 * Goal che richiedono valutazione speciale per il warmup
 * Per ora il warmup è disabilitato per questi goal in attesa di test specifici
 */
const GOALS_WITHOUT_AUTO_WARMUP = [
  'motor_recovery',
  'prenatal',
  'postnatal',
  'disability'
];

/**
 * Applica il riscaldamento agli esercizi di un giorno
 *
 * Logica:
 * - Traccia quali zone sono già state "scaldate"
 * - Aggiunge warmup solo al PRIMO esercizio di ogni zona
 * - Adatta lo schema di warmup al tipo di lavoro (forza/ipertrofia/resistenza)
 * - Core/correttivi non ricevono warmup con pesi
 * - Goal speciali (prenatal, postnatal, motor_recovery, disability) non ricevono warmup automatico
 */
function applyWarmupToExercises(exercises: Exercise[], goal?: Goal): Exercise[] {
  // Skip warmup per goal che richiedono valutazione speciale
  if (goal && GOALS_WITHOUT_AUTO_WARMUP.includes(goal)) {
    console.log(`⚠️ Warmup automatico disabilitato per goal: ${goal} (richiede valutazione specifica)`);
    return exercises;
  }

  const warmedUpZones: Set<MuscleZone> = new Set();

  return exercises.map(exercise => {
    const zone = getExerciseZone(exercise);

    // Core non richiede riscaldamento con pesi
    if (zone === 'core') {
      return exercise;
    }

    // Se questa zona è già stata scaldata, non aggiungere warmup
    if (warmedUpZones.has(zone)) {
      return exercise;
    }

    // Prima volta che incontriamo questa zona -> aggiungi warmup
    warmedUpZones.add(zone);

    // Crea warmup basato sulle ripetizioni target dell'esercizio
    const warmup = createWarmupSets(zone, exercise.reps);
    const workType = getWorkType(exercise.reps);

    if (workType === 'strength') {
      console.log(`🔥 Warmup FORZA ${zone}: ${exercise.name} (rampa: 8@40%, 5@55%, 3@70%, 1@85%)`);
    } else if (workType === 'hypertrophy') {
      console.log(`🔥 Warmup ${zone}: ${exercise.name} (2x6 @ 60%)`);
    } else {
      console.log(`🔥 Warmup leggero ${zone}: ${exercise.name} (1x8 @ 50%)`);
    }

    return {
      ...exercise,
      warmup
    };
  });
}

// ============================================
// SISTEMA SUPERSET PER OTTIMIZZAZIONE TEMPO
// ============================================

/**
 * Pattern antagonisti che possono essere combinati in superset
 * Logica: muscoli opposti che non si affaticano a vicenda
 */
const ANTAGONIST_PAIRS: Array<[string, string]> = [
  // Upper body push/pull
  ['horizontal_push', 'horizontal_pull'],  // Panca + Row
  ['vertical_push', 'vertical_pull'],      // Military + Lat Pulldown
  ['horizontal_push', 'vertical_pull'],    // Panca + Lat Pulldown
  // Upper + Core (core non affatica upper)
  ['horizontal_push', 'core'],
  ['vertical_push', 'core'],
  ['horizontal_pull', 'core'],
  ['vertical_pull', 'core'],
  // Lower + Upper (diversi distretti)
  ['lower_push', 'horizontal_pull'],       // Squat + Row
  ['lower_push', 'vertical_pull'],         // Squat + Pulldown
  ['lower_pull', 'horizontal_push'],       // Deadlift + Panca (ATTENZIONE: entrambi stressano lower back)
];

/**
 * Verifica se due esercizi possono essere combinati in superset
 */
function canSuperset(ex1: Exercise, ex2: Exercise): boolean {
  const pattern1 = ex1.pattern;
  const pattern2 = ex2.pattern;

  // Non supersettare correttivi
  if (pattern1 === 'corrective' || pattern2 === 'corrective') {
    return false;
  }

  // Verifica se sono antagonisti
  return ANTAGONIST_PAIRS.some(([p1, p2]) =>
    (pattern1 === p1 && pattern2 === p2) ||
    (pattern1 === p2 && pattern2 === p1)
  );
}

/**
 * Calcola tempo risparmiato con un superset
 * In un superset, il rest tra i due esercizi è eliminato
 * Si riposa solo dopo aver completato entrambi
 */
function calculateSupersetTimeSaved(ex1: Exercise, ex2: Exercise): number {
  // Tempo rest eliminato = rest del primo esercizio × (sets - 1)
  // Perché nel superset facciamo: A1, B1, rest, A2, B2, rest, ...
  const sets = Math.min(
    typeof ex1.sets === 'number' ? ex1.sets : 3,
    typeof ex2.sets === 'number' ? ex2.sets : 3
  );

  const rest1 = parseRestTime(ex1.rest || '60s');
  const rest2 = parseRestTime(ex2.rest || '60s');

  // Risparmio: eliminiamo i rest individuali, teniamo solo un rest condiviso
  // Prima: A1-rest-A2-rest-A3, B1-rest-B2-rest-B3
  // Dopo:  A1-B1-rest, A2-B2-rest, A3-B3-rest
  // Risparmio = (sets - 1) × rest1 + (sets - 1) × rest2
  const savedSeconds = (sets - 1) * rest1 + (sets - 1) * rest2;

  return Math.round(savedSeconds / 60); // Converti in minuti
}

/**
 * Applica superset agli esercizi per ridurre il tempo totale
 *
 * Strategia:
 * 1. Trova coppie di esercizi antagonisti
 * 2. Combina in superset partendo dai più lunghi (più tempo risparmiato)
 * 3. Continua finché non raggiungiamo il target di tempo
 */
function applySupersets(
  exercises: Exercise[],
  targetMinutesToSave: number
): { exercises: Exercise[]; totalTimeSaved: number; supersetsApplied: number } {
  const result = [...exercises];
  let totalTimeSaved = 0;
  let supersetsApplied = 0;
  const alreadyPaired: Set<number> = new Set();

  console.log(`\n💪 Applicazione superset per risparmiare ~${targetMinutesToSave} min`);

  // Trova tutte le possibili coppie di superset
  const possiblePairs: Array<{ i: number; j: number; timeSaved: number }> = [];

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      if (canSuperset(result[i], result[j])) {
        const timeSaved = calculateSupersetTimeSaved(result[i], result[j]);
        possiblePairs.push({ i, j, timeSaved });
      }
    }
  }

  // Ordina per tempo risparmiato (decrescente)
  possiblePairs.sort((a, b) => b.timeSaved - a.timeSaved);

  // Applica superset finché non raggiungiamo il target
  for (const pair of possiblePairs) {
    if (totalTimeSaved >= targetMinutesToSave) break;
    if (alreadyPaired.has(pair.i) || alreadyPaired.has(pair.j)) continue;

    const ex1 = result[pair.i];
    const ex2 = result[pair.j];

    // Calcola rest condiviso (media dei due rest originali)
    const rest1 = parseRestTime(ex1.rest || '60s');
    const rest2 = parseRestTime(ex2.rest || '60s');
    const sharedRest = Math.round((rest1 + rest2) / 2);
    const sharedRestStr = sharedRest >= 60 ? `${Math.round(sharedRest / 60)}min` : `${sharedRest}s`;

    // Configura superset
    const supersetConfig1: SupersetConfig = {
      pairedWith: ex2.name,
      pairedExerciseIndex: pair.j,
      restAfterSuperset: sharedRestStr,
      timeSaved: pair.timeSaved
    };

    const supersetConfig2: SupersetConfig = {
      pairedWith: ex1.name,
      pairedExerciseIndex: pair.i,
      restAfterSuperset: sharedRestStr,
      timeSaved: pair.timeSaved
    };

    result[pair.i] = { ...ex1, superset: supersetConfig1 };
    result[pair.j] = { ...ex2, superset: supersetConfig2 };

    alreadyPaired.add(pair.i);
    alreadyPaired.add(pair.j);

    totalTimeSaved += pair.timeSaved;
    supersetsApplied++;

    console.log(`   🔗 Superset: ${ex1.name} + ${ex2.name} (risparmio: ${pair.timeSaved} min)`);
  }

  console.log(`   ✅ Totale risparmiato: ${totalTimeSaved} min con ${supersetsApplied} superset`);

  return { exercises: result, totalTimeSaved, supersetsApplied };
}

/**
 * Aggiorna la stima della durata considerando i superset
 */
function estimateWorkoutDurationWithSupersets(exercises: Exercise[]): number {
  const GENERAL_WARMUP_MINUTES = 5;
  const COOLDOWN_MINUTES = 3;
  const WARMUP_REST_SECONDS = 45;

  let totalSeconds = 0;
  const processedSupersets: Set<number> = new Set();

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];

    // Se fa parte di un superset e l'abbiamo già processato, skip
    if (exercise.superset && processedSupersets.has(i)) {
      continue;
    }

    // Warmup (con supporto rampa forza)
    if (exercise.warmup) {
      if (exercise.warmup.ramp) {
        // RAMPA FORZA
        let rampTime = 0;
        for (const rampSet of exercise.warmup.ramp) {
          const setTime = rampSet.reps * 3;
          rampTime += setTime + WARMUP_REST_SECONDS + 20;
        }
        totalSeconds += rampTime + 30;
      } else {
        // STANDARD
        const warmupSets = exercise.warmup.sets;
        const warmupReps = exercise.warmup.reps;
        const secondsPerWarmupSet = warmupReps * 3;
        const warmupTime = (warmupSets * secondsPerWarmupSet) + ((warmupSets - 1) * WARMUP_REST_SECONDS);
        totalSeconds += warmupTime + 30;
      }
    }

    const sets = typeof exercise.sets === 'number' ? exercise.sets : 3;
    const reps = typeof exercise.reps === 'number' ? exercise.reps : 10;
    const secondsPerSet = Math.max(20, Math.min(reps * 3.5, 60));

    if (exercise.superset) {
      // SUPERSET: calcola tempo combinato
      const pairedIndex = exercise.superset.pairedExerciseIndex;
      const pairedExercise = exercises[pairedIndex];

      if (pairedExercise) {
        const pairedSets = typeof pairedExercise.sets === 'number' ? pairedExercise.sets : 3;
        const pairedReps = typeof pairedExercise.reps === 'number' ? pairedExercise.reps : 10;
        const pairedSecondsPerSet = Math.max(20, Math.min(pairedReps * 3.5, 60));

        // Tempo superset: A1 + B1 + rest, A2 + B2 + rest, ...
        const restSeconds = parseRestTime(exercise.superset.restAfterSuperset);
        const supersetTime = sets * (secondsPerSet + pairedSecondsPerSet + restSeconds);

        totalSeconds += supersetTime + 30; // transizione
        processedSupersets.add(pairedIndex);
      }
    } else {
      // Esercizio normale
      const restSeconds = parseRestTime(exercise.rest || '60s');
      const exerciseTime = (sets * secondsPerSet) + ((sets - 1) * restSeconds);
      totalSeconds += exerciseTime + 30;
    }
  }

  const workoutMinutes = Math.ceil(totalSeconds / 60);
  return GENERAL_WARMUP_MINUTES + workoutMinutes + COOLDOWN_MINUTES;
}

interface SplitGeneratorOptions {
  level: Level;
  goal: Goal;
  goals?: string[]; // Multi-goal support (max 3)
  location: 'gym' | 'home' | 'home_gym';
  trainingType: 'bodyweight' | 'equipment' | 'machines';
  frequency: number;
  baselines: PatternBaselines;
  painAreas: NormalizedPainArea[];
  muscularFocus?: string; // glutei, addome, petto, dorso, spalle, gambe, braccia, polpacci
  sessionDuration?: number; // Durata sessione disponibile in minuti (15, 20, 30, 45, 60, 90)
  userBodyweight?: number; // Peso corporeo utente in kg - fondamentale per location adapter
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
    return `Distribuzione: ${primary} (70%) + ${secondary} (30%)`;
  }

  // 3 goals
  const primary = goalLabels[goals[0]] || goals[0];
  const secondary = goalLabels[goals[1]] || goals[1];
  const tertiary = goalLabels[goals[2]] || goals[2];
  return `Distribuzione: ${primary} (40%) + ${secondary} (30%) + ${tertiary} (30%)`;
}

/**
 * WORKOUT DURATION ESTIMATOR
 * Calcola durata stimata in minuti basandosi su esercizi/sets/rest
 *
 * Formula:
 * Duration = General Warm-up + Specific Warmup Sets + Work Sets + Cool-down
 *
 * Tempi medi:
 * - General Warm-up: 5 min (cardio leggero, mobilità)
 * - Specific Warmup Sets: 2x6 reps @ 60% = ~90s per esercizio con warmup
 * - Time per work set: 30-45s (basato su reps)
 * - Rest: estratto dall'esercizio (30s, 60s, 90s, 2min, 3min)
 * - Cool-down: 3 min
 */
export function estimateWorkoutDuration(exercises: Exercise[]): number {
  const GENERAL_WARMUP_MINUTES = 5; // Cardio leggero + mobilità generale
  const COOLDOWN_MINUTES = 3;
  const WARMUP_REST_SECONDS = 45; // Rest breve tra serie warmup

  let totalSeconds = 0;

  for (const exercise of exercises) {
    const sets = typeof exercise.sets === 'number' ? exercise.sets : 3;
    const reps = typeof exercise.reps === 'number' ? exercise.reps : 10;

    // ============================================
    // SERIE DI RISCALDAMENTO SPECIFICHE
    // ============================================
    if (exercise.warmup) {
      if (exercise.warmup.ramp) {
        // RAMPA FORZA: calcola tempo per ogni serie della rampa
        let rampTime = 0;
        for (const rampSet of exercise.warmup.ramp) {
          // ~3s per rep + tempo per cambiare peso
          const setTime = rampSet.reps * 3;
          rampTime += setTime + WARMUP_REST_SECONDS + 20; // +20s per cambio peso
        }
        totalSeconds += rampTime;
      } else {
        // STANDARD: warmup uniforme
        const warmupSets = exercise.warmup.sets;
        const warmupReps = exercise.warmup.reps;
        const secondsPerWarmupSet = warmupReps * 3; // ~3s per rep
        const warmupTime = (warmupSets * secondsPerWarmupSet) + ((warmupSets - 1) * WARMUP_REST_SECONDS);
        totalSeconds += warmupTime;
      }

      // Aggiungi transizione dopo warmup al peso di lavoro (~30s per caricare)
      totalSeconds += 30;
    }

    // ============================================
    // SERIE DI LAVORO
    // ============================================
    // Tempo per set basato su reps (più reps = più tempo)
    // ~3-4 secondi per rep (incluso tempo sotto tensione)
    const secondsPerSet = Math.max(20, Math.min(reps * 3.5, 60));

    // Parse rest time string (es: "90s", "2-3min", "60-75s")
    const restSeconds = parseRestTime(exercise.rest || '60s');

    // Tempo totale esercizio = (sets x tempo_per_set) + (sets - 1) x rest
    // Il rest è tra i set, quindi ne abbiamo sets-1
    const exerciseTime = (sets * secondsPerSet) + ((sets - 1) * restSeconds);

    // Aggiungi tempo transizione tra esercizi (~30s)
    totalSeconds += exerciseTime + 30;
  }

  // Converti in minuti e aggiungi warm-up generale/cool-down
  const workoutMinutes = Math.ceil(totalSeconds / 60);
  const totalMinutes = GENERAL_WARMUP_MINUTES + workoutMinutes + COOLDOWN_MINUTES;

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
    // Extract first number (e.g., "2-3min" -> 2, "3min" -> 3)
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
 * 1RM = weight x (36 / (37 - reps))
 * nRM = 1RM x ((37 - n) / 36)
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
 *   - Eccezione: forza/prestazioni -> RIR 2
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
    rpeModifier = 1.5; // RPE basso -> incremento maggiore
  } else if (rpe >= 9) {
    rpeModifier = 0; // RPE troppo alto -> nessun incremento
  } else if (rpe >= 8) {
    rpeModifier = 0.5; // RPE alto -> incremento ridotto
  }

  const finalIncrement = baseIncrement * progressionMultiplier * rpeModifier;

  // Arrotonda a 0.5kg
  return Math.round(finalIncrement * 2) / 2;
}

/**
 * MUSCULAR FOCUS SYSTEM
 * Mappa focus muscolari -> pattern di esercizi da enfatizzare
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

  console.log(`Applicando focus muscolare: ${focus} su ${day.dayName}`);

  const targetPatterns = MUSCULAR_FOCUS_PATTERNS[focus] || [];
  const isolationExercises = ISOLATION_EXERCISES[focus] || [];

  // 1. AUMENTA VOLUME per esercizi che matchano il focus (+1 set)
  day.exercises.forEach(exercise => {
    if (targetPatterns.includes(exercise.pattern)) {
      const originalSets = exercise.sets;
      exercise.sets = Math.min(exercise.sets + 1, 5); // Max 5 sets
      console.log(`   Up ${exercise.name}: ${originalSets} -> ${exercise.sets} sets (focus boost)`);

      // Aggiungi nota
      const focusNote = `Focus ${focus}: volume aumentato`;
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
      notes: `Isolamento ${focus} (focus muscolare)`
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

  console.log(`   Done Focus ${focus} applicato: ${day.exercises.length} esercizi totali`);
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
      dayName: 'Giorno 1 - Full Body A (Focus Squat)',
      focus: 'Gambe Dominanti + Panca + Tirate Verticali',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Giorno 2 - Full Body B (Focus Stacco)',
      focus: 'Stacco Dominante + Spalle + Panca Variante',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Giorno 3 - Full Body C (Bilanciato)',
      focus: 'Squat Variante + Tirate Variante + Panca',
      exercises: []
    }
  ];

  // DAY A: FULL BODY (tutti i 7 pattern)
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

  // DAY B: FULL BODY (tutti i 7 pattern, rotazione intensità)
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

  // DAY C: FULL BODY (tutti i 7 pattern, altra rotazione)
  // Usa variantIndex=2 per TUTTI gli esercizi per garantire varianti diverse da Day A (0) e Day B (1)
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 2, options, getIntensityForPattern('lower_push', 0, 2)), // Variante 2
    createExercise('lower_pull', baselines.lower_pull, 2, options, getIntensityForPattern('lower_pull', 1, 2)), // Variante 2
    createExercise('horizontal_push', baselines.horizontal_push, 2, options, getIntensityForPattern('horizontal_push', 2, 2)), // Variante 2
    createHorizontalPullExercise(2, options, getIntensityForPattern('horizontal_pull', 3, 2), baselines.vertical_pull), // Variante 2
    createExercise('vertical_push', baselines.vertical_push, 2, options, getIntensityForPattern('vertical_push', 4, 2)), // Variante 2
    createExercise('vertical_pull', baselines.vertical_pull, 2, options, getIntensityForPattern('vertical_pull', 5, 2)), // Variante 2
    createExercise('core', baselines.core, 2, options, getIntensityForPattern('core', 6, 2))
  ];

  // Aggiungi correttivi a tutti i giorni se necessario
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'Full Body 3x Settimana',
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
      dayName: 'Giorno 1 - Upper A',
      focus: 'Panca + Tirate + Spalle + Core',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Giorno 2 - Gambe A',
      focus: 'Squat + Stacco + Core',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Giorno 3 - Upper B',
      focus: 'Spalle + Panca Variante + Tirate Variante',
      exercises: []
    },
    {
      dayNumber: 4,
      dayName: 'Giorno 4 - Gambe B',
      focus: 'Stacco Variante + Squat Variante + Core',
      exercises: []
    }
  ];

  // UPPER A: HEAVY DAY (Horizontal Push focus)
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options, 'heavy'),
    createExercise('vertical_pull', baselines.vertical_pull, 0, options, 'heavy'),
    createExercise('vertical_push', baselines.vertical_push, 0, options, 'heavy'),
    createExercise('core', baselines.core, 0, options, 'heavy')
  ];

  // LOWER A: VOLUME DAY (Squat focus)
  days[1].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, 'volume'),
    createExercise('lower_pull', baselines.lower_pull, 0, options, 'volume'),
    createExercise('core', baselines.core, 1, options, 'volume')
  ];

  // UPPER B: MODERATE DAY (Vertical Push focus + varianti)
  days[2].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options, 'moderate'),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options, 'moderate'), // Variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options, 'moderate'), // Variante
    createExercise('core', baselines.core, 2, options, 'moderate')
  ];

  // LOWER B: MODERATE DAY (Deadlift focus + varianti)
  days[3].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options, 'moderate'), // Variante
    createExercise('lower_push', baselines.lower_push, 1, options, 'moderate'), // Variante
    createExercise('core', baselines.core, 3, options, 'moderate')
  ];

  // Aggiungi correttivi
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'Upper/Lower 4x Settimana',
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
      dayName: 'Giorno 1 - Push A',
      focus: 'Panca + Spalle + Tricipiti + Core',
      exercises: []
    },
    {
      dayNumber: 2,
      dayName: 'Giorno 2 - Pull A',
      focus: 'Tirate + Rematore + Bicipiti + Core',
      exercises: []
    },
    {
      dayNumber: 3,
      dayName: 'Giorno 3 - Gambe A',
      focus: 'Squat + Stacco + Polpacci + Core',
      exercises: []
    },
    {
      dayNumber: 4,
      dayName: 'Giorno 4 - Push B',
      focus: 'Spalle + Panca Variante + Tricipiti',
      exercises: []
    },
    {
      dayNumber: 5,
      dayName: 'Giorno 5 - Pull B',
      focus: 'Rematore + Tirate Variante + Bicipiti',
      exercises: []
    },
    {
      dayNumber: 6,
      dayName: 'Giorno 6 - Gambe B',
      focus: 'Stacco Variante + Squat Variante + Polpacci',
      exercises: []
    }
  ];

  // PUSH A: HEAVY DAY
  days[0].exercises = [
    createExercise('horizontal_push', baselines.horizontal_push, 0, options, 'heavy'),
    createExercise('vertical_push', baselines.vertical_push, 0, options, 'heavy'),
    createAccessoryExercise('triceps', 0, options, 'heavy'),
    createExercise('core', baselines.core, 0, options, 'heavy')
  ];

  // PULL A: VOLUME DAY - Include Horizontal Pull (Row)
  days[1].exercises = [
    createExercise('vertical_pull', baselines.vertical_pull, 0, options, 'volume'),
    createHorizontalPullExercise(0, options, 'volume', baselines.vertical_pull), // Row pattern
    createAccessoryExercise('biceps', 0, options, 'volume'),
    createExercise('core', baselines.core, 1, options, 'volume')
  ];

  // LEGS A: MODERATE DAY
  days[2].exercises = [
    createExercise('lower_push', baselines.lower_push, 0, options, 'moderate'),
    createExercise('lower_pull', baselines.lower_pull, 0, options, 'moderate'),
    createAccessoryExercise('calves', 0, options, 'moderate'),
    createExercise('core', baselines.core, 2, options, 'moderate')
  ];

  // PUSH B: VOLUME DAY (varianti)
  days[3].exercises = [
    createExercise('vertical_push', baselines.vertical_push, 1, options, 'volume'),
    createExercise('horizontal_push', baselines.horizontal_push, 1, options, 'volume'),
    createAccessoryExercise('triceps', 1, options, 'volume')
  ];

  // PULL B: MODERATE DAY (varianti)
  days[4].exercises = [
    createHorizontalPullExercise(1, options, 'moderate', baselines.vertical_pull), // Row variante
    createExercise('vertical_pull', baselines.vertical_pull, 1, options, 'moderate'),
    createAccessoryExercise('biceps', 1, options, 'moderate')
  ];

  // LEGS B: HEAVY DAY (varianti)
  days[5].exercises = [
    createExercise('lower_pull', baselines.lower_pull, 1, options, 'heavy'),
    createExercise('lower_push', baselines.lower_push, 1, options, 'heavy'),
    createAccessoryExercise('calves', 1, options, 'heavy')
  ];

  // Aggiungi correttivi
  const correctives = generateCorrectiveExercises(painAreas);
  days.forEach(day => day.exercises.push(...correctives));

  // VALIDAZIONE: Rimuovi esercizi undefined/incompleti
  days.forEach(day => {
    day.exercises = day.exercises.filter(ex => ex && ex.name && ex.pattern);
  });

  // APPLICA MUSCULAR FOCUS se presente
  if (options.muscularFocus) {
    days.forEach(day => applyMuscularFocus(day, options.muscularFocus!, options));
  }

  return {
    splitName: 'Push/Pull/Gambe 6x Settimana',
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

  // Calcola volume basato su baseline + dayType (DUP)
  const baselineReps = baseline.reps;
  const volumeCalc = calculateVolume(baselineReps, goal, level, location, dayType);

  // Determina quale variante usare
  const equipment = location === 'gym' ? 'gym' : 'bodyweight';
  // Traduci il nome dal baseline (potrebbe essere inglese da screening vecchio)
  const translatedBaselineName = translateExerciseName(baseline.variantName);

  // Per bodyweight: SEMPRE usa varianti bodyweight appropriate (non dal baseline palestra)
  // Per gym: usa baseline per index 0, varianti per altri indici
  let exerciseName: string;
  if (equipment === 'bodyweight') {
    // Sempre prendi variante bodyweight appropriata per l'indice
    exerciseName = getVariantForPattern(patternId, translatedBaselineName, variantIndex, equipment);
  } else {
    // Gym: usa baseline per variantIndex 0
    exerciseName = variantIndex === 0
      ? translatedBaselineName
      : getVariantForPattern(patternId, translatedBaselineName, variantIndex, equipment);
  }

  let finalSets = volumeCalc.sets;
  let finalReps = volumeCalc.reps;
  let painNotes = '';
  let wasReplaced = false;

  // Pain Management
  for (const painEntry of painAreas) {
    const painArea = painEntry.area;
    const severity = painEntry.severity;

    if (isExerciseConflicting(exerciseName, painArea)) {
      console.log(`⚠️ Dolore ${painArea} (${severity}): ${exerciseName}`);

      const deload = applyPainDeload(severity, finalSets, finalReps, location);
      finalSets = deload.sets;
      finalReps = deload.reps;
      painNotes = deload.note;

      // LOGICA SOSTITUZIONE:
      // - mild: MAI sostituire, solo deload
      // - moderate: variante più facile dello STESSO pattern (es. Deadlift → RDL ridotto)
      // - severe: sostituzione completa con pattern diverso (es. Deadlift → Glute Bridge)
      if (deload.needsReplacement) {
        // SEVERE: sostituzione completa
        const alternative = findSafeAlternative(exerciseName, painArea, severity);
        console.log(`  🔄 Sostituzione (${severity}): ${exerciseName} → ${alternative}`);
        exerciseName = alternative;
        wasReplaced = true;
        painNotes = `${painNotes} | Sostituito con ${alternative}`;
      } else if (deload.needsEasierVariant) {
        // MODERATE: variante più facile stesso pattern
        const alternative = findSafeAlternative(exerciseName, painArea, severity);
        console.log(`  📉 Variante ridotta (${severity}): ${exerciseName} → ${alternative}`);
        exerciseName = alternative;
        wasReplaced = true;
        painNotes = `${painNotes} | Variante ridotta: ${alternative}`;
      } else {
        // MILD: solo deload, nessuna sostituzione
        console.log(`  📊 Deload (${severity}): ${finalSets}x${finalReps}, carico -${Math.round((1-deload.loadReduction)*100)}%`);
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
      machineNotes = `Macchina: ${originalExercise} -> ${exerciseName}`;
    }
  }

  // CALCOLO CARICO AUTOMATICO (RIR-based)
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

    console.log(`Weight: ${exerciseName}: ${suggestedWeight} (${targetReps} reps @ RIR ${targetRIR} = ${effectiveReps}RM) [${level}]`);
    console.log(`   -> 10RM: ${baseline.weight10RM}kg -> 1RM stimato: ${Math.round(estimated1RM)}kg`);
  }

  return {
    pattern: patternId as any,
    name: translateExerciseName(exerciseName),
    sets: finalSets,
    reps: finalReps,
    rest: volumeCalc.rest,
    intensity: volumeCalc.intensity,
    weight: suggestedWeight || undefined, // Peso calcolato dal sistema
    baseline: {
      variantId: baseline.variantId,
      difficulty: baseline.difficulty,
      maxReps: baselineReps
    },
    wasReplaced: wasReplaced,
    notes: [
      volumeCalc.notes,
      `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
      suggestedWeight ? `Carico: ${suggestedWeight} (${weightNote})` : '',
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

  // Usa baseline del vertical_pull se disponibile, altrimenti assume 12 reps
  const baselineReps = verticalPullBaseline?.reps || 12;
  const volumeCalc = calculateVolume(baselineReps, goal, level, location, dayType);

  // Conversione a macchine
  if (location === 'gym' && trainingType === 'machines') {
    exerciseName = convertToMachineVariant(exerciseName);
  }

  // CALCOLO CARICO AUTOMATICO (se abbiamo baseline dal vertical_pull)
  let suggestedWeight = '';
  let weightNote = '';
  if (verticalPullBaseline?.weight10RM && verticalPullBaseline.weight10RM > 0 && location === 'gym') {
    const targetRIR = getTargetRIR(dayType, goal, level);
    const targetReps = typeof volumeCalc.reps === 'number' ? volumeCalc.reps : 8;
    const weight = calculateWeightFromRIR(verticalPullBaseline.weight10RM, targetReps, targetRIR);
    suggestedWeight = formatWeight(weight);
    weightNote = `RIR ${targetRIR}`;

    console.log(`Weight: ${exerciseName}: ${suggestedWeight} (${targetReps} reps @ RIR ${targetRIR}) [${level}] - stimato da vertical pull`);
  }

  return {
    pattern: 'horizontal_pull' as any, // Pattern corretto per Row
    name: translateExerciseName(exerciseName),
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
      suggestedWeight ? `Carico: ${suggestedWeight} (${weightNote}) - stimato` : '',
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
    name: translateExerciseName(exerciseName),
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
        name: translateExerciseName(corrective),
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
/**
 * Adatta workout al tempo disponibile con strategia GOAL-AWARE
 *
 * Priorità di riduzione basata sull'obiettivo:
 * - FORZA: preserva esercizi 3-6 reps, taglia volume/resistenza
 * - IPERTROFIA: preserva esercizi 8-15 reps, taglia forza/resistenza
 * - RESISTENZA/TONIFICAZIONE: preserva esercizi 12+ reps, taglia forza/volume
 *
 * Strategia:
 * 1. Rimuovi esercizi NON allineati con il goal
 * 2. Riduci sets esercizi NON allineati con il goal
 * 3. Rimuovi esercizi accessori anche se goal-aligned
 * 4. ULTIMO RESORT: riduci sets esercizi del goal principale
 */
function adaptWorkoutToTimeLimit(
  exercises: Exercise[],
  targetDuration: number,
  goal?: string
): { exercises: Exercise[]; warning?: string; usedSupersets?: boolean } {
  let adapted = [...exercises];
  let currentDuration = estimateWorkoutDuration(adapted);
  let usedSupersets = false;

  // Se già entro il limite, nessun adattamento necessario
  if (currentDuration <= targetDuration) {
    return { exercises: adapted };
  }

  console.log(`⚠️ Workout troppo lungo: ${currentDuration}min > ${targetDuration}min target`);
  console.log(`🎯 Goal: ${goal || 'non specificato'}`);

  // ============================================
  // STEP 0: PROVA CON SUPERSET (mantiene volume!)
  // ============================================
  const minutesToSave = currentDuration - targetDuration;
  console.log(`\n🔗 STEP 0: Provo superset per risparmiare ${minutesToSave} min`);

  const supersetResult = applySupersets(adapted, minutesToSave);
  if (supersetResult.totalTimeSaved > 0) {
    adapted = supersetResult.exercises;
    currentDuration = estimateWorkoutDurationWithSupersets(adapted);
    usedSupersets = true;

    console.log(`   Durata dopo superset: ${currentDuration}min`);

    if (currentDuration <= targetDuration) {
      return {
        exercises: adapted,
        usedSupersets: true,
        warning: `⏱️ WORKOUT OTTIMIZZATO: Ho creato ${supersetResult.supersetsApplied} superset per entrare nei ${targetDuration} minuti. Il volume è invariato - stesso numero di serie ed esercizi, solo organizzazione più efficiente.`
      };
    }
  }

  const compoundPatterns = ['squat', 'deadlift', 'bench', 'row', 'pullup', 'dip', 'press'];

  /**
   * Identifica se un esercizio è allineato con il goal basandosi su reps/rest/intensità
   */
  function isGoalAligned(exercise: Exercise): boolean {
    if (!goal) return true; // Se nessun goal, considera tutti allineati

    const reps = typeof exercise.reps === 'number' ? exercise.reps : parseInt(String(exercise.reps).split('-')[0] || '10');
    const restStr = exercise.rest?.toLowerCase() || '';
    const intensityStr = exercise.intensity?.toLowerCase() || '';

    // Parse rest in secondi
    let restSeconds = 60;
    if (restStr.includes('min')) {
      const match = restStr.match(/(\d+)/);
      if (match) restSeconds = parseInt(match[1]) * 60;
    } else {
      const match = restStr.match(/(\d+)/);
      if (match) restSeconds = parseInt(match[1]);
    }

    // Identifica tipo di lavoro
    if (goal === 'forza' || goal === 'strength') {
      // FORZA: basse reps (≤6), alto rest (≥120s), alta intensità (≥80%)
      return reps <= 6 || restSeconds >= 120 || intensityStr.includes('85') || intensityStr.includes('90');
    }
    else if (goal === 'massa' || goal === 'ipertrofia' || goal === 'hypertrophy') {
      // IPERTROFIA: reps moderate (8-15), rest medio (60-120s)
      return reps >= 8 && reps <= 15 && restSeconds >= 60 && restSeconds <= 120;
    }
    else if (goal === 'tonificazione' || goal === 'dimagrimento' || goal === 'resistenza' || goal === 'endurance') {
      // RESISTENZA: alte reps (≥12), rest breve (≤60s)
      return reps >= 12 || restSeconds <= 60;
    }

    return true; // Default: considera allineato
  }

  /**
   * Classifica priorità esercizio (più basso = più importante)
   * 0 = Compound + Goal-aligned (MAX priorità)
   * 1 = Compound + Non goal-aligned
   * 2 = Accessorio + Goal-aligned
   * 3 = Accessorio + Non goal-aligned (MIN priorità)
   */
  function getExercisePriority(exercise: Exercise): number {
    const isCompound = compoundPatterns.some(p => exercise.pattern?.toLowerCase().includes(p));
    const aligned = isGoalAligned(exercise);

    if (isCompound && aligned) return 0;
    if (isCompound && !aligned) return 1;
    if (!isCompound && aligned) return 2;
    return 3;
  }

  let reducedSets = false;

  // Helper per calcolare durata (considera superset se presenti)
  const getDuration = (exs: Exercise[]) =>
    usedSupersets ? estimateWorkoutDurationWithSupersets(exs) : estimateWorkoutDuration(exs);

  // STEP 1: Rimuovi esercizi NON allineati con il goal (priorità 3)
  console.log(`\n🔍 STEP 1: Rimozione esercizi NON allineati con goal`);
  while (currentDuration > targetDuration && adapted.length > 3) {
    let removedIndex = -1;
    let maxPriority = -1;

    // Cerca l'esercizio con priorità più bassa (3 = non-compound + non-aligned)
    for (let i = adapted.length - 1; i >= 0; i--) {
      const priority = getExercisePriority(adapted[i]);
      if (priority > maxPriority) {
        maxPriority = priority;
        removedIndex = i;
      }
    }

    if (removedIndex !== -1 && maxPriority === 3) {
      console.log(`   ✂️ Rimosso (non-goal): ${adapted[removedIndex].name}`);
      adapted.splice(removedIndex, 1);
      currentDuration = getDuration(adapted);
    } else {
      break; // Nessun esercizio non-aligned trovato
    }
  }

  if (currentDuration <= targetDuration) {
    console.log(`   ✅ Target raggiunto: ${currentDuration}min`);
    return {
      exercises: adapted,
      warning: `⚠️ WORKOUT ADATTATO: Con ${targetDuration} minuti disponibili, gli esercizi non allineati con l'obiettivo "${goal}" sono stati rimossi.`
    };
  }

  // STEP 2: Riduci sets esercizi NON allineati con goal (priorità 1-2)
  console.log(`\n🔧 STEP 2: Riduzione sets esercizi NON goal-aligned`);
  adapted = adapted.map(ex => {
    const priority = getExercisePriority(ex);
    if (priority >= 1 && typeof ex.sets === 'number' && ex.sets > 2) {
      reducedSets = true;
      console.log(`   📉 Ridotto: ${ex.name} (${ex.sets} → ${ex.sets - 1} sets)`);
      return { ...ex, sets: ex.sets - 1 };
    }
    return ex;
  });

  currentDuration = getDuration(adapted);
  if (currentDuration <= targetDuration) {
    console.log(`   ✅ Target raggiunto: ${currentDuration}min`);
    return {
      exercises: adapted,
      usedSupersets,
      warning: `⚠️ WORKOUT ADATTATO: Con ${targetDuration} minuti disponibili, alcuni esercizi/serie non allineati con l'obiettivo "${goal}" sono stati ridotti.${usedSupersets ? ' Superset applicati per ottimizzare il tempo.' : ''}`
    };
  }

  // STEP 3: Rimuovi esercizi accessori anche se goal-aligned (priorità 2)
  console.log(`\n✂️ STEP 3: Rimozione esercizi accessori goal-aligned`);
  while (currentDuration > targetDuration && adapted.length > 2) {
    let removedIndex = -1;

    // Cerca ultimo esercizio accessorio (anche se aligned)
    for (let i = adapted.length - 1; i >= 0; i--) {
      const isCompound = compoundPatterns.some(p => adapted[i].pattern?.toLowerCase().includes(p));
      if (!isCompound) {
        removedIndex = i;
        break;
      }
    }

    if (removedIndex !== -1) {
      console.log(`   ✂️ Rimosso (accessorio): ${adapted[removedIndex].name}`);
      adapted.splice(removedIndex, 1);
      currentDuration = getDuration(adapted);
    } else {
      break;
    }
  }

  if (currentDuration <= targetDuration) {
    console.log(`   ✅ Target raggiunto: ${currentDuration}min`);
    return {
      exercises: adapted,
      usedSupersets,
      warning: `⚠️ WORKOUT ADATTATO: Con ${targetDuration} minuti disponibili, alcuni esercizi accessori sono stati rimossi. Focus mantenuto su "${goal}".${usedSupersets ? ' Superset applicati.' : ''}`
    };
  }

  // STEP 4: ULTIMO RESORT - Riduci sets esercizi del goal principale (priorità 0)
  console.log(`\n⚠️ STEP 4: Riduzione sets esercizi GOAL PRINCIPALI (ultimo resort)`);
  adapted = adapted.map(ex => {
    if (typeof ex.sets === 'number' && ex.sets > 2) {
      reducedSets = true;
      console.log(`   📉 Ridotto (goal exercise): ${ex.name} (${ex.sets} → ${ex.sets - 1} sets)`);
      return { ...ex, sets: ex.sets - 1 };
    }
    return ex;
  });

  currentDuration = getDuration(adapted);
  console.log(`   ✅ Durata finale: ${currentDuration}min`);

  const finalWarning = `⚠️ WORKOUT FORTEMENTE ADATTATO: Con ${targetDuration} minuti disponibili, anche gli esercizi principali per "${goal}" sono stati ridotti.${usedSupersets ? ' Nonostante i superset applicati,' : ''} L'efficacia del programma sarà significativamente inferiore. RACCOMANDAZIONE: aumenta il tempo disponibile (almeno ${Math.ceil(estimateWorkoutDuration(exercises) * 0.8)} minuti) o riduci la frequenza settimanale.`;

  return { exercises: adapted, usedSupersets, warning: finalWarning };
}

export function generateWeeklySplit(options: SplitGeneratorOptions): WeeklySplit {
  const { frequency, goals, location, baselines, userBodyweight } = options;

  console.log(`Generazione split settimanale per ${frequency}x/settimana`);

  // Log multi-goal info
  if (goals && goals.length > 1) {
    console.log(`Multi-goal detected: ${goals.join(', ')}`);
    console.log(`Volume distribution: ${goals.length === 2 ? '70-30' : '40-30-30'}`);
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

  // ============================================
  // ADATTAMENTO ESERCIZI PER LOCATION (home/gym)
  // ============================================
  if (location === 'home') {
    console.log('\n🏠 Adattamento esercizi per HOME (bodyweight)');

    // Costruisci i carichi reali e le date dei test dai baseline per matching accurato
    const realLoads: Record<string, number> = {};
    const testDates: Record<string, string> = {};
    if (baselines) {
      Object.entries(baselines).forEach(([pattern, baseline]) => {
        if (baseline) {
          if (baseline.weight10RM) {
            realLoads[pattern] = baseline.weight10RM;
          }
          if (baseline.testDate) {
            testDates[pattern] = baseline.testDate;
          }
        }
      });
    }

    split.days.forEach(day => {
      const originalExercises = day.exercises.map(e => e.name);

      day.exercises = adaptExercisesForLocation(day.exercises, {
        location: 'home',
        homeType: 'bodyweight',
        realLoads,
        testDates,
        userBodyweight
      });

      // Log conversioni
      day.exercises.forEach((ex, i) => {
        if (ex.name !== originalExercises[i]) {
          console.log(`  📝 ${originalExercises[i]} → ${ex.name}`);
        }
      });

      // IMPORTANTE: Applica traduzione DOPO adaptExercisesForLocation
      // perché locationAdapter usa nomi inglesi internamente
      day.exercises = day.exercises.map(ex => ({
        ...ex,
        name: translateExerciseName(ex.name)
      }));
    });
  }

  // ============================================
  // APPLICA RISCALDAMENTO SPECIFICO PER ZONA
  // ============================================
  // Riscaldamento: 2x6 @ 60% sul PRIMO esercizio di ogni zona (upper/lower)
  console.log('\n🔥 Applicazione riscaldamento specifico per zona');
  split.days.forEach(day => {
    day.exercises = applyWarmupToExercises(day.exercises, options.goal);
  });

  // Calcola durata stimata per ogni giorno (include warmup)
  split.days.forEach(day => {
    const duration = estimateWorkoutDuration(day.exercises);
    day.estimatedDuration = duration;
    console.log(`Time: ${day.dayName}: ~${duration} min (warmup incluso)`);
  });

  // Adatta workout al tempo disponibile se specificato
  if (options.sessionDuration) {
    console.log(`\n⏱️ Adattamento al tempo disponibile: ${options.sessionDuration} minuti`);
    let globalWarning: string | undefined;

    split.days.forEach(day => {
      if (day.estimatedDuration && day.estimatedDuration > options.sessionDuration!) {
        console.log(`\n${day.dayName}: ${day.estimatedDuration}min > ${options.sessionDuration}min`);
        const adapted = adaptWorkoutToTimeLimit(day.exercises, options.sessionDuration!, options.goal);

        day.exercises = adapted.exercises;
        day.estimatedDuration = estimateWorkoutDuration(adapted.exercises);

        if (adapted.warning && !globalWarning) {
          globalWarning = adapted.warning;
        }

        console.log(`✅ ${day.dayName} adattato: nuova durata ${day.estimatedDuration}min`);
      }
    });

    // Aggiungi warning globale alla descrizione se necessario
    if (globalWarning) {
      split.description = `${split.description}\n\n${globalWarning}`;
    }
  }

  // Calcola durata media
  const avgDuration = Math.round(
    split.days.reduce((sum, day) => sum + (day.estimatedDuration || 0), 0) / split.days.length
  );
  split.averageDuration = avgDuration;
  console.log(`Average workout duration: ~${avgDuration} min`);

  return split;
}
