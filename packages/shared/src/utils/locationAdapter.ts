/**
 * Location Adapter
 * Adatta gli esercizi alla location scelta (palestra/casa)
 * Implementa la logica client-side per evitare chiamate API non necessarie
 */

import { Exercise, PatternId } from '../types';
import {
  LOWER_PUSH_VARIANTS,
  LOWER_PULL_VARIANTS,
  HORIZONTAL_PUSH_VARIANTS,
  VERTICAL_PUSH_VARIANTS,
  VERTICAL_PULL_VARIANTS,
  HORIZONTAL_PULL_VARIANTS,
  CORE_VARIANTS,
  ExerciseVariant
} from './exerciseVariants';
import { MACHINE_EXERCISE_MAP, convertToMachineVariant } from './exerciseMapping';

export type LocationType = 'gym' | 'home';
export type HomeType = 'bodyweight' | 'with_equipment';

export interface HomeEquipment {
  barbell: boolean;
  dumbbellMaxKg: number;
  kettlebellKg?: number[];
  bands: boolean;
  pullupBar: boolean;
  bench: boolean;
  sturdyTable?: boolean;
  loopBands?: boolean;
  noEquipment?: boolean;
}

export interface LocationAdaptationOptions {
  location: LocationType;
  homeType?: HomeType;
  equipment?: HomeEquipment;
  userBodyweight?: number; // Peso corporeo utente in kg - FONDAMENTALE per matching accurato
  /**
   * Carichi REALI dai test di screening (baselines)
   * Questi hanno priorità sulle stime perché sono dati effettivi
   * Formato: { pattern: carico_in_kg }
   * Es: { lower_push: 80, horizontal_push: 60 }
   */
  realLoads?: Record<string, number>;
  /**
   * Date dell'ultimo test per pattern
   * Formato: { pattern: ISO_date_string }
   * Es: { lower_push: '2025-01-15', horizontal_push: '2025-01-10' }
   */
  testDates?: Record<string, string>;
}

/**
 * Mappa pattern -> varianti
 */
const PATTERN_VARIANTS: Record<string, ExerciseVariant[]> = {
  lower_push: LOWER_PUSH_VARIANTS,
  lower_pull: LOWER_PULL_VARIANTS,
  horizontal_push: HORIZONTAL_PUSH_VARIANTS,
  vertical_push: VERTICAL_PUSH_VARIANTS,
  vertical_pull: VERTICAL_PULL_VARIANTS,
  horizontal_pull: HORIZONTAL_PULL_VARIANTS,
  core: CORE_VARIANTS
};

/**
 * Verifica se un esercizio è già una variante bodyweight valida
 * Questo evita di sostituire esercizi già corretti per casa
 */
function isAlreadyBodyweightExercise(exerciseName: string, pattern: string): boolean {
  const variants = PATTERN_VARIANTS[pattern];
  if (!variants) return false;

  const lowerName = exerciseName.toLowerCase();

  // Cerca tra le varianti del pattern
  const isInVariants = variants.some(v =>
    (v.equipment === 'bodyweight' || v.equipment === 'both') &&
    v.name.toLowerCase() === lowerName
  );

  if (isInVariants) return true;

  // Controlla anche esercizi comuni bodyweight non in variants
  const commonBodyweight = [
    'squat a corpo libero', 'squat', 'air squat', 'bodyweight squat',
    'split squat', 'affondi', 'affondi statici', 'affondi indietro',
    'squat bulgaro', 'bulgarian split squat', 'pistol squat', 'squat a pistola',
    'shrimp squat', 'squat gamberetto', 'skater squat', 'squat del pattinatore',
    'push-up', 'piegamenti', 'push-up standard', 'standard push-up',
    'push-up diamante', 'diamond push-up', 'push-up arciere', 'archer push-up',
    'push-up deficit', 'deficit push-up', 'push-up inclinati', 'incline push-up',
    'push-up al muro', 'wall push-up', 'push-up sulle ginocchia', 'knee push-up',
    'pike push-up', 'pike push-up elevato', 'elevated pike push-up',
    'trazioni', 'pull-up', 'chin-up', 'trazioni presa neutra', 'neutral grip pull-up',
    'trazioni negative', 'negative pull-up', 'trazioni con elastico',
    'rematore inverso', 'inverted row', 'australian pull-up',
    'rematore inverso facilitato', 'rematore inverso presa larga', 'rematore inverso piedi elevati',
    'superman row', 'prone y raise',
    'floor pull', 'floor pull con asciugamano',
    'plank', 'plank laterale', 'side plank', 'hollow body hold',
    'dead bug', 'bird dog', 'l-sit', 'dragon flag',
    'ponte glutei', 'glute bridge', 'hip thrust', 'nordic curl',
    'slider leg curl', 'leg curl scorrevole'
  ];

  return commonBodyweight.some(bw => lowerName.includes(bw) || bw.includes(lowerName));
}

/**
 * Mappa inversa: macchina -> bodyweight
 * Include alias italiani per supporto i18n
 */
const BODYWEIGHT_ALTERNATIVES: Record<string, string> = {
  // English keys
  'leg press': 'Squat a Corpo Libero',
  'leg curl machine': 'Nordic Curl',
  'leg curl (machine)': 'Nordic Curl',
  'hip thrust machine': 'Ponte Glutei',
  'chest press machine': 'Piegamenti',
  'shoulder press machine': 'Pike Push-up',
  'lat pulldown machine': 'Trazioni alla Sbarra',
  'lat pulldown (machine)': 'Trazioni alla Sbarra',
  'assisted pull-up': 'Trazioni Negative',
  'seated cable row': 'Superman Row',
  'seated row machine': 'Superman Row',
  'ab crunch machine': 'Plank',
  'cable crunch': 'Plank',
  'back squat': 'Squat a Corpo Libero',
  'front squat': 'Squat a Corpo Libero',
  'goblet squat': 'Squat a Corpo Libero',
  'conventional deadlift': 'Hip Hinge a Corpo Libero',
  'romanian deadlift (rdl)': 'Hip Hinge a Corpo Libero',
  'sumo deadlift': 'Hip Hinge a Corpo Libero',
  'trap bar deadlift': 'Hip Hinge a Corpo Libero',
  'flat barbell bench press': 'Piegamenti',
  'incline bench press': 'Piegamenti Declinati',
  'decline bench press': 'Piegamenti',
  'dumbbell bench press': 'Piegamenti',
  'military press (barbell)': 'Pike Push-up',
  'dumbbell shoulder press': 'Pike Push-up',
  'arnold press': 'Pike Push-up',
  'push press': 'Pike Push-up',
  'barbell row': 'Superman Row',
  'dumbbell row': 'Superman Row',
  't-bar row': 'Superman Row',
  'tricep pushdown': 'Piegamenti Diamante',
  'skull crushers': 'Piegamenti Diamante',
  'barbell curl': 'Chin-up (Supinato)',
  'hammer curl': 'Trazioni Presa Neutra',
  'seated calf raise': 'Calf Raise in Piedi',
  'pallof press': 'Plank Laterale',
  // Italian keys (alias)
  'pressa': 'Squat a Corpo Libero',
  'leg curl': 'Nordic Curl',
  'chest press': 'Piegamenti',
  'lat machine': 'Trazioni alla Sbarra',
  'lat pulldown': 'Trazioni alla Sbarra',
  'pulley basso': 'Superman Row',
  'pulley': 'Superman Row',
  'crunch ai cavi': 'Plank',
  'squat con bilanciere': 'Squat a Corpo Libero',
  'squat frontale': 'Squat a Corpo Libero',
  // 'goblet squat' già definito sopra (riga 86)
  'stacco da terra': 'Hip Hinge a Corpo Libero',
  'stacco rumeno': 'Hip Hinge a Corpo Libero',
  'stacco sumo': 'Hip Hinge a Corpo Libero',
  'stacco con trap bar': 'Hip Hinge a Corpo Libero',
  'panca piana': 'Piegamenti',
  'panca piana con bilanciere': 'Piegamenti',
  'panca inclinata': 'Piegamenti Declinati',
  'panca declinata': 'Piegamenti',
  'panca con manubri': 'Piegamenti',
  'lento avanti': 'Pike Push-up',
  'shoulder press': 'Pike Push-up',
  'shoulder press con manubri': 'Pike Push-up',
  'rematore con bilanciere': 'Superman Row',
  'rematore con manubrio': 'Superman Row',
  'rematore': 'Superman Row',
  'pushdown ai cavi': 'Piegamenti Diamante',
  'french press': 'Piegamenti Diamante',
  'curl con bilanciere': 'Chin-up (Supinato)',
  'curl a martello': 'Trazioni Presa Neutra',
  'calf raise seduto': 'Calf Raise in Piedi'
  // 'pallof press' già definito sopra (riga 107)
};

/**
 * Esercizi che richiedono sbarra (English + Italian)
 */
const PULLUP_BAR_EXERCISES = [
  // English
  'standard pull-up',
  'pull-up',
  'wide grip pull-up',
  'chin-up',
  'chin-up (supinated)',
  'neutral grip pull-up',
  'negative pull-up',
  'hanging leg raise',
  // Italian
  'trazioni alla sbarra',
  'trazioni',
  'trazioni presa larga',
  'chin-up',
  'chin-up (supinato)',
  'trazioni presa neutra',
  'trazioni negative',
  'alzate gambe alla sbarra'
];

/**
 * Alternative senza sbarra (English + Italian)
 */
const NO_PULLUP_BAR_ALTERNATIVES: Record<string, string> = {
  // English - Floor Pull come alternativa principale (trazione a pavimento con asciugamano)
  'standard pull-up': 'Floor Pull (asciugamano)',
  'pull-up': 'Floor Pull (asciugamano)',
  'wide grip pull-up': 'Floor Pull (asciugamano)',
  'chin-up': 'Floor Pull (asciugamano)',
  'chin-up (supinated)': 'Floor Pull (asciugamano)',
  'neutral grip pull-up': 'Floor Pull (asciugamano)',
  'negative pull-up': 'Prone Y-raise',
  'hanging leg raise': 'Alzate Gambe a Terra',
  // Italian - Floor Pull come alternativa principale
  'trazioni alla sbarra': 'Floor Pull (asciugamano)',
  'trazioni': 'Floor Pull (asciugamano)',
  'trazioni presa larga': 'Floor Pull (asciugamano)',
  'chin-up (supinato)': 'Floor Pull (asciugamano)',
  'trazioni presa neutra': 'Floor Pull (asciugamano)',
  'trazioni negative': 'Prone Y-raise',
  'alzate gambe alla sbarra': 'Alzate Gambe a Terra',
  // Lat pulldown (gym) -> Floor Pull (home senza sbarra)
  'lat pulldown': 'Floor Pull (asciugamano)',
  'lat pulldown machine': 'Floor Pull (asciugamano)',
  'lat pulldown (machine)': 'Floor Pull (asciugamano)'
};

/**
 * Esercizi che richiedono tavolo robusto (per Inverted Row e simili)
 */
const STURDY_TABLE_EXERCISES = [
  'inverted row',
  'inverted row (tavolo)',
  'inverted row alta',
  'inverted row 45°',
  'inverted row 30°',
  'inverted row orizzontale',
  'inverted row singolo braccio',
  'inverted row facilitato',
  'rematore inverso',
  'rematore inverso (tavolo)',
  'rematore inverso facilitato',
  'rematore inverso presa larga',
  'rematore inverso piedi elevati',
  'australian pull-up',
  'australian pull-up (tavolo)',
  'bodyweight row (tavolo)'
];

/**
 * Alternative senza tavolo per esercizi di tirata
 */
const NO_TABLE_ALTERNATIVES: Record<string, string> = {
  'inverted row': 'Floor Pull (asciugamano)',
  'inverted row (tavolo)': 'Floor Pull (asciugamano)',
  'inverted row alta': 'Floor Pull (asciugamano)',
  'inverted row 45°': 'Floor Pull Facilitato',
  'inverted row 30°': 'Floor Pull Facilitato',
  'inverted row orizzontale': 'Floor Pull (asciugamano)',
  'inverted row singolo braccio': 'Floor Pull Singolo Braccio',
  'inverted row facilitato': 'Floor Pull Facilitato',
  'rematore inverso': 'Floor Pull (asciugamano)',
  'rematore inverso (tavolo)': 'Floor Pull (asciugamano)',
  'rematore inverso facilitato': 'Floor Pull Facilitato',
  'rematore inverso presa larga': 'Floor Pull (asciugamano)',
  'rematore inverso piedi elevati': 'Floor Pull (asciugamano)',
  'australian pull-up': 'Floor Pull (asciugamano)',
  'australian pull-up (tavolo)': 'Floor Pull (asciugamano)',
  'bodyweight row (tavolo)': 'Superman Row'
};

/**
 * RELATIVE STRENGTH-BASED BODYWEIGHT EQUIVALENTS
 *
 * La logica: usa il RAPPORTO carico/peso_corporeo per determinare l'equivalente.
 * Questo è fondamentale perché:
 * - Ragazza 40kg che squatta 80kg = 2x BW → MOLTO AVANZATA → Pistol Squat
 * - Uomo 80kg che squatta 80kg = 1x BW → INTERMEDIO → Skater Squat
 * - Uomo 100kg che squatta 80kg = 0.8x BW → BASE → Bulgarian Split Squat
 *
 * Standard di forza relativa (Squat come riferimento):
 * - <0.5x BW = Principiante
 * - 0.5-1x BW = Intermedio
 * - 1-1.5x BW = Avanzato
 * - 1.5-2x BW = Molto avanzato
 * - >2x BW = Elite
 *
 * minRatio = rapporto minimo carico/peso_corporeo per questo esercizio
 */
const RELATIVE_STRENGTH_ALTERNATIVES: Record<string, { minRatio: number; exercise: string; notes: string }[]> = {
  // LOWER PUSH - Basato su rapporto carico/bodyweight
  'lower_push': [
    { minRatio: 2.0, exercise: 'Pistol Squat', notes: 'Elite - 2x+ bodyweight squat' },
    { minRatio: 1.5, exercise: 'Pistol Squat (Assisted)', notes: 'Molto avanzato - 1.5x+ BW' },
    { minRatio: 1.2, exercise: 'Shrimp Squat', notes: 'Avanzato - 1.2x+ BW' },
    { minRatio: 1.0, exercise: 'Skater Squat', notes: 'Intermedio-avanzato - 1x BW' },
    { minRatio: 0.75, exercise: 'Bulgarian Split Squat', notes: 'Intermedio - 0.75x BW' },
    { minRatio: 0.5, exercise: 'Split Squat', notes: 'Intermedio base - 0.5x BW' },
    { minRatio: 0, exercise: 'Bodyweight Squat', notes: 'Principiante' }
  ],
  // LOWER PULL - Hip hinge (stacco come riferimento)
  // Nordic curl è MOLTO difficile, riservato a elite
  'lower_pull': [
    { minRatio: 2.5, exercise: 'Nordic Hamstring Curl', notes: 'Elite - 2.5x+ BW deadlift' },
    { minRatio: 2.0, exercise: 'Nordic Curl (Eccentric Only)', notes: 'Molto avanzato - 2x+ BW' },
    { minRatio: 1.5, exercise: 'Slider Leg Curl (Single Leg)', notes: 'Avanzato - 1.5x+ BW' },
    { minRatio: 1.2, exercise: 'Slider Leg Curl', notes: 'Intermedio-avanzato - 1.2x BW' },
    { minRatio: 1.0, exercise: 'Single Leg RDL (Bodyweight)', notes: 'Intermedio - 1x BW' },
    { minRatio: 0.75, exercise: 'Hip Thrust (Single Leg)', notes: 'Intermedio - 0.75x BW' },
    { minRatio: 0.5, exercise: 'Hip Thrust (Elevated)', notes: 'Base - 0.5x BW' },
    { minRatio: 0, exercise: 'Glute Bridge', notes: 'Principiante' }
  ],
  // HORIZONTAL PUSH (bench press come riferimento)
  // 1x BW bench = intermedio-avanzato
  'horizontal_push': [
    { minRatio: 1.5, exercise: 'One-Arm Push-up', notes: 'Elite - 1.5x+ BW bench' },
    { minRatio: 1.3, exercise: 'One-Arm Push-up (Assisted)', notes: 'Molto avanzato - 1.3x+ BW' },
    { minRatio: 1.1, exercise: 'Archer Push-up', notes: 'Avanzato - 1.1x+ BW' },
    { minRatio: 0.9, exercise: 'Pseudo Planche Push-up', notes: 'Avanzato - 0.9x BW' },
    { minRatio: 0.75, exercise: 'Diamond Push-up', notes: 'Intermedio-avanzato - 0.75x BW' },
    { minRatio: 0.6, exercise: 'Deficit Push-up', notes: 'Intermedio - 0.6x BW' },
    { minRatio: 0.5, exercise: 'Standard Push-up', notes: 'Intermedio - 0.5x BW' },
    { minRatio: 0.3, exercise: 'Knee Push-up', notes: 'Base - 0.3x BW' },
    { minRatio: 0.15, exercise: 'Incline Push-up', notes: 'Principiante avanzato - 0.15x BW' },
    { minRatio: 0, exercise: 'Wall Push-up', notes: 'Principiante' }
  ],
  // VERTICAL PUSH (OHP come riferimento - carichi più bassi, 0.75x BW OHP = molto forte)
  'vertical_push': [
    { minRatio: 1.0, exercise: 'Freestanding Handstand Push-up', notes: 'Elite mondiale - 1x+ BW OHP' },
    { minRatio: 0.85, exercise: 'Wall Handstand Push-up', notes: 'Elite - 0.85x+ BW OHP' },
    { minRatio: 0.7, exercise: 'Wall Handstand Push-up (Eccentric)', notes: 'Molto avanzato - 0.7x+ BW' },
    { minRatio: 0.6, exercise: 'Elevated Pike Push-up (High)', notes: 'Avanzato - 0.6x+ BW' },
    { minRatio: 0.5, exercise: 'Elevated Pike Push-up', notes: 'Intermedio-avanzato - 0.5x BW' },
    { minRatio: 0.4, exercise: 'Pike Push-up', notes: 'Intermedio - 0.4x BW' },
    { minRatio: 0.25, exercise: 'Pike Push-up (Knee)', notes: 'Base - 0.25x BW' },
    { minRatio: 0, exercise: 'Wall Shoulder Tap', notes: 'Principiante' }
  ],
  // VERTICAL PULL - Basato su lat pulldown/weighted pull-up come riferimento
  // SENZA SBARRA: Floor Pull (trazioni scivolate) e Inverted Row sono i sostituti validi
  // Chi tira 1x BW ha bisogno di esercizi VERI, non riabilitazione!
  // FIX: Fallback finale SENZA attrezzatura (Prone Y Raise invece di Band Pull-apart)
  'vertical_pull': [
    { minRatio: 1.2, exercise: 'Floor Pull Singolo Braccio', notes: 'Elite - unilaterale con asciugamano' },
    { minRatio: 1.0, exercise: 'Floor Pull (asciugamano)', notes: 'Avanzato - trazioni scivolate a terra' },
    { minRatio: 0.8, exercise: 'Inverted Row (tavolo)', notes: 'Avanzato - sotto un tavolo robusto' },
    { minRatio: 0.6, exercise: 'Floor Pull Facilitato', notes: 'Intermedio - ginocchia piegate' },
    { minRatio: 0.4, exercise: 'Prone Y-T-W Raises', notes: 'Intermedio - a terra prono SENZA ATTREZZI' },
    { minRatio: 0.2, exercise: 'Superman Pull', notes: 'Base - tirata prona SENZA ATTREZZI' },
    { minRatio: 0, exercise: 'Prone Y Raise', notes: 'Principiante - a terra prono ZERO ATTREZZI' }
  ],
  // HORIZONTAL PULL (row come riferimento - bent over row/cable row)
  // SENZA ATTREZZATURA: Inverted Row, Superman Row e Floor Pull sono esercizi ALLENANTI
  // FIX: Più esercizi SENZA attrezzatura come fallback
  'horizontal_pull': [
    { minRatio: 1.2, exercise: 'Inverted Row Singolo Braccio', notes: 'Elite - unilaterale sotto tavolo' },
    { minRatio: 1.0, exercise: 'Rematore Inverso Piedi Elevati', notes: 'Avanzato - piedi elevati su sedia' },
    { minRatio: 0.85, exercise: 'Rematore Inverso', notes: 'Avanzato - gambe tese sotto tavolo' },
    { minRatio: 0.7, exercise: 'Superman Row', notes: 'Intermedio-avanzato - a terra SENZA ATTREZZI' },
    { minRatio: 0.5, exercise: 'Prone Y-T-W Raises', notes: 'Intermedio - a terra SENZA ATTREZZI' },
    { minRatio: 0.3, exercise: 'Superman Pull', notes: 'Base - tirata prona SENZA ATTREZZI' },
    { minRatio: 0, exercise: 'Prone Y Raise', notes: 'Principiante - a terra prono ZERO ATTREZZI' }
  ]
};

/**
 * Stima il carico equivalente basato sul nome dell'esercizio
 * Per esercizi con bilanciere, stima conservativa del carico tipico
 */
function estimateExerciseLoad(exerciseName: string): number {
  const lowerName = exerciseName.toLowerCase();

  // Esercizi con bilanciere = carichi significativi
  if (lowerName.includes('bilanciere') || lowerName.includes('barbell')) {
    if (lowerName.includes('squat')) return 70; // Squat con bilanciere ~70kg
    if (lowerName.includes('deadlift') || lowerName.includes('stacco')) return 80;
    if (lowerName.includes('bench') || lowerName.includes('panca')) return 60;
    if (lowerName.includes('press') || lowerName.includes('military')) return 40;
    if (lowerName.includes('row') || lowerName.includes('rematore')) return 50;
    return 60; // Default bilanciere
  }

  // Esercizi specifici
  if (lowerName.includes('back squat') || lowerName === 'squat') return 70;
  if (lowerName.includes('front squat')) return 60;
  if (lowerName.includes('leg press')) return 100;
  if (lowerName.includes('deadlift') || lowerName.includes('stacco')) return 80;
  if (lowerName.includes('rdl') || lowerName.includes('romanian')) return 60;
  if (lowerName.includes('bench') || lowerName.includes('panca piana')) return 60;
  if (lowerName.includes('incline')) return 50;
  if (lowerName.includes('shoulder press') || lowerName.includes('lento avanti')) return 40;
  if (lowerName.includes('lat pulldown') || lowerName.includes('lat machine')) return 50;
  if (lowerName.includes('cable row') || lowerName.includes('pulley')) return 45;
  if (lowerName.includes('dumbbell') || lowerName.includes('manubr')) return 30; // Manubri = meno carico

  // Default per esercizi non riconosciuti ma probabilmente con sovraccarico
  if (lowerName.includes('press') || lowerName.includes('curl') || lowerName.includes('row')) return 35;

  return 20; // Default basso per esercizi non riconosciuti
}

/**
 * Converte un carico NRM (N Rep Max) in 1RM stimato usando Brzycki formula
 * 1RM = weight × (36 / (37 - reps))
 *
 * Esempi:
 * - 70kg x 10RM → 70 × (36/27) = 93kg 1RM
 * - 80kg x 10RM → 80 × (36/27) = 107kg 1RM
 */
function convert10RMTo1RM(weight10RM: number): number {
  // Brzycki formula per 10 reps: multiplier = 36 / (37 - 10) = 36/27 ≈ 1.333
  return weight10RM * (36 / (37 - 10));
}

/**
 * Trova variante bodyweight per un esercizio
 * LOGICA RELATIVE STRENGTH: considera il RAPPORTO 1RM_stimato/peso_corporeo
 *
 * IMPORTANTE: I carichi dai test sono 10RM, vanno convertiti in 1RM per confronto accurato!
 * Formula Brzycki: 1RM = weight × (36 / (37 - reps))
 *
 * Esempi con 70kg x 10RM (= ~93kg 1RM):
 * - Ragazza 40kg: 93/40 = 2.33x BW → Pistol Squat (elite)
 * - Uomo 80kg: 93/80 = 1.16x BW → Shrimp Squat (avanzato)
 * - Uomo 100kg: 93/100 = 0.93x BW → Bulgarian Split Squat (intermedio)
 *
 * @param exerciseName - Nome esercizio originale
 * @param pattern - Pattern biomeccanico (lower_push, etc)
 * @param userBodyweight - Peso corporeo utente in kg (default 75 se non specificato)
 * @param realLoad10RM - Carico REALE 10RM da test di screening (ha priorità sulla stima)
 * @param testDate - Data ISO dell'ultimo test per questo pattern
 * @param equipment - Attrezzatura disponibile (opzionale)
 */
function findBodyweightAlternative(
  exerciseName: string,
  pattern: string,
  userBodyweight: number = 75,
  realLoad10RM?: number,
  testDate?: string,
  equipment?: { pullupBar?: boolean; sturdyTable?: boolean; loopBands?: boolean; noEquipment?: boolean }
): string {
  const lowerName = exerciseName.toLowerCase();

  // USA IL CARICO REALE se disponibile, convertendo da 10RM a 1RM stimato
  let estimated1RM: number;
  let loadSource: string;

  if (realLoad10RM && realLoad10RM > 0) {
    estimated1RM = convert10RMTo1RM(realLoad10RM);
    // Formatta la data del test se disponibile
    const testInfo = testDate
      ? ` (test: ${new Date(testDate).toLocaleDateString('it-IT')})`
      : '';
    loadSource = `TEST REALE: ${realLoad10RM}kg x10RM → ${estimated1RM.toFixed(0)}kg 1RM${testInfo}`;
  } else {
    // Stima conservativa (assume già 1RM)
    estimated1RM = estimateExerciseLoad(exerciseName);
    loadSource = `stimato ${estimated1RM}kg 1RM (nessun test recente)`;
  }

  // Calcola il rapporto forza relativa basato su 1RM stimato
  const strengthRatio = estimated1RM / userBodyweight;

  console.log(`🏋️ "${exerciseName}": ${loadSource} / ${userBodyweight}kg BW = ${strengthRatio.toFixed(2)}x BW`);

  // Helper per verificare se un esercizio è disponibile con l'equipment dell'utente
  const isExerciseAvailable = (exerciseName: string): boolean => {
    // Se non ci sono restrizioni equipment, tutto è disponibile
    if (!equipment) return true;

    const exLower = exerciseName.toLowerCase();

    // Se l'utente ha scelto "nessun attrezzo", esclude tutto ciò che richiede tavolo, barra o elastici
    const hasNoEquipment = equipment.noEquipment === true;
    const hasPullupBar = equipment.pullupBar === true;
    const hasTable = equipment.sturdyTable === true;
    const hasBands = equipment.loopBands === true;

    // FIX: Lista completa di keywords per esercizi che richiedono tavolo robusto
    const TABLE_REQUIRED_KEYWORDS = [
      'inverted row', 'inverted', 'rematore inverso', 'australian',
      'body row', 'table row', 'bodyweight row', 'row sotto'
    ];

    // Verifica se richiede tavolo - CHECK MIGLIORATO
    const needsTable = TABLE_REQUIRED_KEYWORDS.some(keyword => exLower.includes(keyword));
    if (needsTable && !hasTable) {
      console.log(`🚫 ${exerciseName} richiede tavolo robusto ma non disponibile`);
      return false;
    }

    // FIX: Lista completa di keywords per esercizi che richiedono sbarra
    const PULLUP_REQUIRED_KEYWORDS = [
      'pull-up', 'pullup', 'pull up', 'chin-up', 'chinup', 'chin up',
      'trazioni', 'trazione', 'hanging', 'appeso', 'alla sbarra'
    ];

    // Verifica se richiede sbarra - CHECK MIGLIORATO
    const needsPullupBar = PULLUP_REQUIRED_KEYWORDS.some(keyword => exLower.includes(keyword));
    if (needsPullupBar && !hasPullupBar) {
      console.log(`🚫 ${exerciseName} richiede sbarra ma non disponibile`);
      return false;
    }

    // Verifica se richiede elastici - CHECK MIGLIORATO
    const BAND_KEYWORDS = ['band', 'elastico', 'elastic', 'resistance band', 'loop band'];
    const needsBands = BAND_KEYWORDS.some(keyword => exLower.includes(keyword));
    if (needsBands && !hasBands) {
      console.log(`🚫 ${exerciseName} richiede elastici ma non disponibili`);
      return false;
    }

    return true;
  };

  // Trova la migliore alternativa bodyweight basata sul RAPPORTO
  const alternatives = RELATIVE_STRENGTH_ALTERNATIVES[pattern];

  if (alternatives && alternatives.length > 0) {
    // Trova l'esercizio bodyweight appropriato per questo rapporto
    // FILTRA in base all'equipment disponibile
    for (const alt of alternatives) {
      if (strengthRatio >= alt.minRatio && isExerciseAvailable(alt.exercise)) {
        console.log(`🎯 Relative strength match: ${strengthRatio.toFixed(2)}x BW → ${alt.exercise} (${alt.notes})`);
        return alt.exercise;
      }
    }
    // Fallback all'ultimo DISPONIBILE (più facile)
    for (let i = alternatives.length - 1; i >= 0; i--) {
      if (isExerciseAvailable(alternatives[i].exercise)) {
        console.log(`🎯 Fallback to easiest available: ${alternatives[i].exercise}`);
        return alternatives[i].exercise;
      }
    }
    // Se nulla è disponibile, usa l'ultimo comunque (meglio di niente)
    const easiest = alternatives[alternatives.length - 1];
    console.log(`🎯 Fallback to easiest (no filter): ${easiest.exercise}`);
    return easiest.exercise;
  }

  // Fallback al sistema precedente basato su difficoltà
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    // Per rapporti alti, prendi il bodyweight più difficile
    const bodyweightVariants = variants.filter(
      v => v.equipment === 'bodyweight' || v.equipment === 'both'
    ).sort((a, b) => b.difficulty - a.difficulty);

    if (bodyweightVariants.length > 0) {
      // Se rapporto >= 1x BW, prendi il più difficile disponibile
      if (strengthRatio >= 1.0 && bodyweightVariants[0]) {
        console.log(`🎯 High ratio (${strengthRatio.toFixed(2)}x BW) → hardest BW: ${bodyweightVariants[0].name}`);
        return bodyweightVariants[0].name;
      }
      // Altrimenti prendi uno intermedio
      const midIndex = Math.floor(bodyweightVariants.length / 2);
      console.log(`🎯 Medium ratio → mid BW: ${bodyweightVariants[midIndex].name}`);
      return bodyweightVariants[midIndex].name;
    }
  }

  // Fallback alla mappa diretta (per compatibilità)
  if (BODYWEIGHT_ALTERNATIVES[lowerName]) {
    return BODYWEIGHT_ALTERNATIVES[lowerName];
  }

  // Fallback finale: mantieni originale
  return exerciseName;
}

/**
 * Trova variante gym per un esercizio bodyweight
 */
function findGymAlternative(exerciseName: string, pattern: string): string {
  const lowerName = exerciseName.toLowerCase();

  // Prima prova la mappa macchine esistente
  const machineVariant = convertToMachineVariant(exerciseName);
  if (machineVariant !== exerciseName) {
    return machineVariant;
  }

  // Poi cerca nelle varianti del pattern
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    const gymVariant = variants.find(
      v => v.equipment === 'gym' || v.equipment === 'both'
    );
    if (gymVariant) {
      return gymVariant.name;
    }
  }

  // Fallback: mantieni originale
  return exerciseName;
}

/**
 * Determina se l'esercizio richiede attrezzatura specifica
 */
function requiresEquipment(exerciseName: string): {
  pullupBar: boolean;
  barbell: boolean;
  dumbbell: boolean;
  bench: boolean;
} {
  const lowerName = exerciseName.toLowerCase();

  return {
    pullupBar: PULLUP_BAR_EXERCISES.includes(lowerName),
    barbell: lowerName.includes('barbell') || lowerName.includes('deadlift'),
    dumbbell: lowerName.includes('dumbbell') || lowerName.includes('goblet'),
    bench: lowerName.includes('bench') || lowerName.includes('chest dips')
  };
}

/**
 * Adatta un singolo esercizio alla location
 * Usa il peso corporeo dell'utente E i carichi reali dai test per matching accurato
 */
function adaptExercise(
  exercise: Exercise,
  options: LocationAdaptationOptions
): Exercise {
  const { location, homeType, equipment, userBodyweight, realLoads, testDates } = options;

  // Pattern correttivi non vengono modificati
  if (exercise.pattern === 'corrective') {
    return exercise;
  }

  let newName = exercise.name;
  let wasReplaced = false;

  // Default 75kg se non specificato
  const bodyweight = userBodyweight || 75;

  // Ottieni il carico REALE e la data del test per questo pattern (se disponibili)
  const patternRealLoad = realLoads?.[exercise.pattern];
  const patternTestDate = testDates?.[exercise.pattern];

  if (location === 'gym') {
    // Converti bodyweight -> gym/macchine
    newName = findGymAlternative(exercise.name, exercise.pattern);
    wasReplaced = newName !== exercise.name;
  } else if (location === 'home') {
    // Casa: dipende da homeType e equipment
    if (homeType === 'bodyweight' || !equipment) {
      // Solo corpo libero
      const lowerName = exercise.name.toLowerCase();

      // Costruisci equipment info per il filtro
      const equipmentInfo = {
        pullupBar: (equipment as any)?.pullupBar === true,
        sturdyTable: (equipment as any)?.sturdyTable === true,
        loopBands: (equipment as any)?.bands === true || (equipment as any)?.loopBands === true,
        noEquipment: (equipment as any)?.noEquipment === true
      };

      const hasPullupBar = equipment?.pullupBar === true;
      const hasTable = (equipment as any)?.sturdyTable === true;
      const hasNoEquipment = (equipment as any)?.noEquipment === true;

      // CRITICO: Se l'utente ha selezionato "nessun attrezzo" O non ha né sbarra né tavolo,
      // TUTTI gli esercizi di tirata (vertical_pull, horizontal_pull) devono essere sostituiti
      // con esercizi a terra che non richiedono attrezzatura
      const isPullPattern = exercise.pattern === 'vertical_pull' || exercise.pattern === 'horizontal_pull';
      const canDoPulls = hasPullupBar || hasTable;

      if (isPullPattern && (hasNoEquipment || !canDoPulls)) {
        // Utente non ha attrezzi per fare tirate → sostituisci con Floor Pull o simili
        console.log(`🚫 ${exercise.name} (${exercise.pattern}) - utente senza attrezzi per tirate → Floor Pull`);

        // Esercizi a terra per tirate senza attrezzi
        if (exercise.pattern === 'vertical_pull') {
          newName = 'Floor Pull (asciugamano)';
        } else {
          newName = 'Superman Row';
        }
        wasReplaced = true;
      } else {
        // PRIMA controlla se richiede sbarra e se l'utente non ce l'ha
        const needsPullupBar = PULLUP_BAR_EXERCISES.some(ex => lowerName.includes(ex) || ex.includes(lowerName));

        // NUOVO: controlla se richiede tavolo e se l'utente non ce l'ha
        const needsTable = STURDY_TABLE_EXERCISES.some(ex => lowerName.includes(ex) || ex.includes(lowerName));

        if (needsTable && !hasTable) {
          // Esercizio richiede tavolo ma non c'è → sostituisci
          console.log(`🚫 ${exercise.name} richiede tavolo ma non disponibile → sostituzione`);
          if (NO_TABLE_ALTERNATIVES[lowerName]) {
            newName = NO_TABLE_ALTERNATIVES[lowerName];
            wasReplaced = true;
          } else {
            newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
            wasReplaced = newName !== exercise.name;
          }
        } else if (needsPullupBar && !hasPullupBar) {
          // Esercizio richiede sbarra ma non c'è → sostituisci
          console.log(`🚫 ${exercise.name} richiede sbarra ma non disponibile → sostituzione`);
          if (NO_PULLUP_BAR_ALTERNATIVES[lowerName]) {
            newName = NO_PULLUP_BAR_ALTERNATIVES[lowerName];
            wasReplaced = true;
          } else {
            // Fallback: usa alternative per vertical_pull o horizontal_pull
            newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
            wasReplaced = newName !== exercise.name;
          }
        } else if (isAlreadyBodyweightExercise(exercise.name, exercise.pattern)) {
          // Esercizio già bodyweight e non richiede sbarra (o ce l'ha) → mantieni
          console.log(`✅ ${exercise.name} è già bodyweight, mantenuto`);
          // Mantieni l'esercizio originale, nessuna sostituzione
        } else {
          // Esercizio gym/macchina - trova alternativa bodyweight
          console.log(`🔄 ${exercise.name} richiede conversione a bodyweight`);
          newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
          wasReplaced = newName !== exercise.name;
        }
      }
    } else {
      // Casa con attrezzatura - verifica cosa e' disponibile
      const required = requiresEquipment(exercise.name);
      const lowerName = exercise.name.toLowerCase();

      // Costruisci equipment info per il filtro
      const equipmentInfo = {
        pullupBar: equipment.pullupBar === true,
        sturdyTable: (equipment as any)?.sturdyTable === true,
        loopBands: equipment.bands === true || (equipment as any)?.loopBands === true,
        noEquipment: (equipment as any)?.noEquipment === true
      };

      const hasPullupBar = equipment.pullupBar === true;
      const hasTable = (equipment as any)?.sturdyTable === true;
      const hasNoEquipment = (equipment as any)?.noEquipment === true;

      // CRITICO: Se l'utente ha selezionato "nessun attrezzo" O non ha né sbarra né tavolo,
      // TUTTI gli esercizi di tirata devono essere sostituiti
      const isPullPattern = exercise.pattern === 'vertical_pull' || exercise.pattern === 'horizontal_pull';
      const canDoPulls = hasPullupBar || hasTable;

      if (isPullPattern && (hasNoEquipment || !canDoPulls)) {
        console.log(`🚫 ${exercise.name} (${exercise.pattern}) - utente senza attrezzi per tirate → Floor Pull`);
        if (exercise.pattern === 'vertical_pull') {
          newName = 'Floor Pull (asciugamano)';
        } else {
          newName = 'Superman Row';
        }
        wasReplaced = true;
      } else {
        // NUOVO: controlla se richiede tavolo e se l'utente non ce l'ha
        const needsTable = STURDY_TABLE_EXERCISES.some(ex => lowerName.includes(ex) || ex.includes(lowerName));
        if (needsTable && !hasTable) {
          console.log(`🚫 ${exercise.name} richiede tavolo ma non disponibile → sostituzione`);
          if (NO_TABLE_ALTERNATIVES[lowerName]) {
            newName = NO_TABLE_ALTERNATIVES[lowerName];
            wasReplaced = true;
          } else {
            newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
            wasReplaced = newName !== exercise.name;
          }
        }

        // Se richiede sbarra ma non ce l'ha
        if (required.pullupBar && !hasPullupBar) {
          if (NO_PULLUP_BAR_ALTERNATIVES[lowerName]) {
            newName = NO_PULLUP_BAR_ALTERNATIVES[lowerName];
            wasReplaced = true;
          }
        }

        // Se richiede bilanciere ma non ce l'ha
        if (required.barbell && !equipment.barbell) {
          if (equipment.dumbbellMaxKg > 0) {
            // Usa manubri come alternativa
            newName = exercise.name.replace(/barbell/i, 'Dumbbell');
          } else {
            // Altrimenti bodyweight - USA PESO CORPOREO + CARICO REALE + DATA TEST
            newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
          }
          wasReplaced = newName !== exercise.name;
        }

        // Se richiede panca ma non ce l'ha
        if (required.bench && !equipment.bench) {
          newName = findBodyweightAlternative(exercise.name, exercise.pattern, bodyweight, patternRealLoad, patternTestDate, equipmentInfo);
          wasReplaced = newName !== exercise.name;
        }
      }
    }
  }

  return {
    ...exercise,
    name: newName,
    wasReplaced: wasReplaced || exercise.wasReplaced
  };
}

/**
 * Adatta una lista di esercizi alla location selezionata
 * @param exercises - Lista esercizi originali
 * @param options - Opzioni di location e attrezzatura
 * @returns Lista esercizi adattati
 */
export function adaptExercisesForLocation(
  exercises: Exercise[],
  options: LocationAdaptationOptions
): Exercise[] {
  return exercises.map(exercise => adaptExercise(exercise, options));
}

/**
 * Verifica se un esercizio e' compatibile con la location
 */
export function isExerciseCompatible(
  exerciseName: string,
  pattern: string,
  options: LocationAdaptationOptions
): boolean {
  const { location, homeType, equipment } = options;
  const lowerName = exerciseName.toLowerCase();

  // Cerca la variante nelle liste
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    const variant = variants.find(
      v => v.name.toLowerCase() === lowerName
    );

    if (variant) {
      if (location === 'gym') {
        return variant.equipment === 'gym' || variant.equipment === 'both';
      } else {
        if (homeType === 'bodyweight' || !equipment) {
          return variant.equipment === 'bodyweight' || variant.equipment === 'both';
        }
        // Con attrezzatura - piu' flessibile
        return true;
      }
    }
  }

  // Default: assume compatibile
  return true;
}

/**
 * Ottieni tutte le varianti disponibili per un pattern e location
 */
export function getAvailableVariants(
  pattern: string,
  location: LocationType,
  equipment?: HomeEquipment
): ExerciseVariant[] {
  const variants = PATTERN_VARIANTS[pattern];
  if (!variants) return [];

  return variants.filter(v => {
    if (location === 'gym') {
      return v.equipment === 'gym' || v.equipment === 'both';
    } else {
      // Casa
      if (!equipment) {
        return v.equipment === 'bodyweight';
      }
      // Con attrezzatura
      return v.equipment === 'bodyweight' || v.equipment === 'both';
    }
  });
}
