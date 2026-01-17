/**
 * ============================================================================
 * BEGINNER WEIGHT SAFETY CAPS - Fix Critico #4
 * ============================================================================
 *
 * Questo modulo implementa limiti ASSOLUTI sui carichi per principianti
 * nelle prime settimane di allenamento.
 *
 * PERCHÉ È NECESSARIO:
 * - Lo screening si basa su auto-valutazione del 10RM
 * - I principianti spesso sopravvalutano (ego lifting)
 * - La form durante lo screening potrebbe essere scorretta
 * - Un 10RM "gonfiato" porta a working weights pericolosi
 *
 * SCENARIO REALE:
 * - Mario, principiante, dichiara 60kg squat 10RM
 * - In realtà lo fa con ginocchia che cedono e schiena curva
 * - Sistema calcola working weight: 45-50kg
 * - Sessione 1: Mario si fa male perché non regge il carico
 *
 * SOLUZIONE:
 * - Cap assoluto per le prime 4 settimane
 * - Squat max 40kg, Deadlift max 50kg, ecc.
 * - Il cap si rilassa gradualmente se l'utente mostra competenza
 *
 * EVIDENZA SCIENTIFICA:
 * - Rippetoe, Starting Strength: "Start light, add weight slowly"
 * - NSCA Guidelines: principianti dovrebbero iniziare al 50-60% del peso target
 *
 * @module beginnerWeightCaps
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface WeightCapResult {
  originalWeight: number;
  cappedWeight: number;
  wasCapped: boolean;
  capApplied: number | null;  // kg del cap applicato
  reason?: string;
  reasonIt?: string;
}

export interface CapConfiguration {
  exercisePattern: string;
  maxWeightKg: number;
  appliesToWeeks: number;  // Per quante settimane si applica
  relaxationRate: number;  // % di aumento cap per settimana dopo il periodo iniziale
}

// ============================================================================
// CONSTANTS - Cap Assoluti per Principianti
// ============================================================================

/**
 * Cap ASSOLUTI per principianti sui compound principali
 *
 * Questi valori sono conservativi ma permettono comunque
 * un allenamento efficace per chi inizia.
 *
 * Basati su:
 * - Peso medio bilanciere olimpico: 20kg
 * - Peso medio manubri entry-level: 5-10kg
 * - Statistiche infortuni nelle prime sessioni
 */
export const BEGINNER_ABSOLUTE_CAPS: Record<string, CapConfiguration> = {
  // ════════════════════════════════════════════════════════════════════════════
  // LOWER BODY - I più pericolosi per infortuni
  // ════════════════════════════════════════════════════════════════════════════

  // Squat: bilanciere (20kg) + 20kg = 40kg max
  // Un principiante che fa 40kg con buona form è già molto
  'squat': {
    exercisePattern: 'lower_push',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 10  // +10% a settimana dopo week 4
  },
  'back_squat': {
    exercisePattern: 'lower_push',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'front_squat': {
    exercisePattern: 'lower_push',
    maxWeightKg: 35,  // Più tecnico = cap più basso
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'goblet_squat': {
    exercisePattern: 'lower_push',
    maxWeightKg: 24,  // Un kettlebell pesante
    appliesToWeeks: 4,
    relaxationRate: 15
  },
  'leg_press': {
    exercisePattern: 'lower_push',
    maxWeightKg: 80,  // Leg press permette più carico
    appliesToWeeks: 4,
    relaxationRate: 15
  },

  // Deadlift: il più pericoloso per la schiena
  'deadlift': {
    exercisePattern: 'lower_pull',
    maxWeightKg: 50,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'stacco': {
    exercisePattern: 'lower_pull',
    maxWeightKg: 50,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'romanian_deadlift': {
    exercisePattern: 'lower_pull',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'stacco_rumeno': {
    exercisePattern: 'lower_pull',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'rdl': {
    exercisePattern: 'lower_pull',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 10
  },

  // ════════════════════════════════════════════════════════════════════════════
  // UPPER BODY PUSH
  // ════════════════════════════════════════════════════════════════════════════

  // Bench: bilanciere (20kg) + 10kg = 30kg max
  'bench_press': {
    exercisePattern: 'horizontal_push',
    maxWeightKg: 30,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'panca_piana': {
    exercisePattern: 'horizontal_push',
    maxWeightKg: 30,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'dumbbell_bench': {
    exercisePattern: 'horizontal_push',
    maxWeightKg: 20,  // 10kg per mano
    appliesToWeeks: 4,
    relaxationRate: 15
  },
  'incline_press': {
    exercisePattern: 'horizontal_push',
    maxWeightKg: 25,
    appliesToWeeks: 4,
    relaxationRate: 10
  },

  // Shoulder Press
  'overhead_press': {
    exercisePattern: 'vertical_push',
    maxWeightKg: 20,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'shoulder_press': {
    exercisePattern: 'vertical_push',
    maxWeightKg: 20,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'military_press': {
    exercisePattern: 'vertical_push',
    maxWeightKg: 20,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'lento_avanti': {
    exercisePattern: 'vertical_push',
    maxWeightKg: 20,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'dumbbell_press': {
    exercisePattern: 'vertical_push',
    maxWeightKg: 16,  // 8kg per mano
    appliesToWeeks: 4,
    relaxationRate: 15
  },

  // ════════════════════════════════════════════════════════════════════════════
  // UPPER BODY PULL
  // ════════════════════════════════════════════════════════════════════════════

  'barbell_row': {
    exercisePattern: 'horizontal_pull',
    maxWeightKg: 25,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'bent_over_row': {
    exercisePattern: 'horizontal_pull',
    maxWeightKg: 25,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'rematore': {
    exercisePattern: 'horizontal_pull',
    maxWeightKg: 25,
    appliesToWeeks: 4,
    relaxationRate: 10
  },
  'dumbbell_row': {
    exercisePattern: 'horizontal_pull',
    maxWeightKg: 15,  // Per mano
    appliesToWeeks: 4,
    relaxationRate: 15
  },
  'cable_row': {
    exercisePattern: 'horizontal_pull',
    maxWeightKg: 35,
    appliesToWeeks: 4,
    relaxationRate: 15
  },
  'lat_pulldown': {
    exercisePattern: 'vertical_pull',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 15
  },
  'lat_machine': {
    exercisePattern: 'vertical_pull',
    maxWeightKg: 40,
    appliesToWeeks: 4,
    relaxationRate: 15
  }
};

/**
 * Cap di fallback per pattern non specificamente mappati
 */
export const PATTERN_DEFAULT_CAPS: Record<string, number> = {
  'lower_push': 40,
  'lower_pull': 50,
  'horizontal_push': 30,
  'horizontal_pull': 25,
  'vertical_push': 20,
  'vertical_pull': 40,
  'core': 10,
  'accessory': 15
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Applica il cap di sicurezza al peso calcolato
 *
 * QUESTA È LA FUNZIONE PRINCIPALE - chiamala dopo calculateWeightFromRIR()
 *
 * @param exerciseName - Nome esercizio (es. "Back Squat", "Panca Piana")
 * @param calculatedWeight - Peso calcolato dal sistema RIR
 * @param level - Livello utente
 * @param weeksInProgram - Settimane dall'inizio del programma
 * @param pattern - Pattern motorio (opzionale, per fallback)
 * @returns WeightCapResult con peso eventualmente cappato
 */
export function applyBeginnerSafetyCap(
  exerciseName: string,
  calculatedWeight: number,
  level: Level,
  weeksInProgram: number = 0,
  pattern?: string
): WeightCapResult {
  // Non applicare cap a intermedi/avanzati
  if (level !== 'beginner') {
    return {
      originalWeight: calculatedWeight,
      cappedWeight: calculatedWeight,
      wasCapped: false,
      capApplied: null
    };
  }

  // Trova il cap per questo esercizio
  const capConfig = findCapForExercise(exerciseName, pattern);

  if (!capConfig) {
    // Nessun cap definito per questo esercizio
    return {
      originalWeight: calculatedWeight,
      cappedWeight: calculatedWeight,
      wasCapped: false,
      capApplied: null
    };
  }

  // Calcola il cap effettivo (può aumentare dopo le settimane iniziali)
  const effectiveCap = calculateEffectiveCap(capConfig, weeksInProgram);

  // Se il peso calcolato è sotto il cap, nessuna modifica
  if (calculatedWeight <= effectiveCap) {
    return {
      originalWeight: calculatedWeight,
      cappedWeight: calculatedWeight,
      wasCapped: false,
      capApplied: effectiveCap
    };
  }

  // Applica il cap
  console.log(`[BEGINNER_CAP] ${exerciseName}: ${calculatedWeight}kg → ${effectiveCap}kg (week ${weeksInProgram})`);

  return {
    originalWeight: calculatedWeight,
    cappedWeight: effectiveCap,
    wasCapped: true,
    capApplied: effectiveCap,
    reason: `Safety cap for beginners (week ${weeksInProgram + 1}): max ${effectiveCap}kg`,
    reasonIt: `Cap sicurezza principianti (settimana ${weeksInProgram + 1}): max ${effectiveCap}kg`
  };
}

/**
 * Trova la configurazione del cap per un esercizio
 */
function findCapForExercise(
  exerciseName: string,
  pattern?: string
): CapConfiguration | null {
  const normalizedName = normalizeExerciseName(exerciseName);

  // 1. Cerca match esatto
  if (BEGINNER_ABSOLUTE_CAPS[normalizedName]) {
    return BEGINNER_ABSOLUTE_CAPS[normalizedName];
  }

  // 2. Cerca match parziale
  for (const [key, config] of Object.entries(BEGINNER_ABSOLUTE_CAPS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return config;
    }
  }

  // 3. Fallback su pattern
  if (pattern && PATTERN_DEFAULT_CAPS[pattern]) {
    return {
      exercisePattern: pattern,
      maxWeightKg: PATTERN_DEFAULT_CAPS[pattern],
      appliesToWeeks: 4,
      relaxationRate: 10
    };
  }

  return null;
}

/**
 * Normalizza il nome dell'esercizio per il matching
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/con_/g, '')
    .replace(/_con/g, '')
    .replace(/bilanciere/g, 'barbell')
    .replace(/manubri/g, 'dumbbell')
    .replace(/manubrio/g, 'dumbbell');
}

/**
 * Calcola il cap effettivo considerando la progressione
 */
function calculateEffectiveCap(
  config: CapConfiguration,
  weeksInProgram: number
): number {
  // Nelle prime N settimane, applica il cap pieno
  if (weeksInProgram < config.appliesToWeeks) {
    return config.maxWeightKg;
  }

  // Dopo, aumenta gradualmente il cap
  const weeksAfterInitial = weeksInProgram - config.appliesToWeeks;
  const relaxationMultiplier = 1 + (weeksAfterInitial * config.relaxationRate / 100);

  // Cap massimo: 2x il valore iniziale (dopo ~10 settimane extra)
  const maxRelaxation = config.maxWeightKg * 2;
  const relaxedCap = Math.min(config.maxWeightKg * relaxationMultiplier, maxRelaxation);

  // Arrotonda a 2.5kg
  return Math.round(relaxedCap / 2.5) * 2.5;
}

// ============================================================================
// HELPER PER INTEGRAZIONE
// ============================================================================

/**
 * Wrapper per calcolo peso completo con cap
 * Usa questa funzione invece di calculateWeightFromRIR direttamente
 */
export function calculateSafeWeight(
  weight10RM: number,
  targetReps: number,
  targetRIR: number,
  exerciseName: string,
  level: Level,
  weeksInProgram: number = 0,
  pattern?: string
): {
  weight: number;
  wasCapped: boolean;
  note?: string;
  noteIt?: string;
} {
  // Calcola peso base con formula RIR
  const baseWeight = calculateWeightFromRIR(weight10RM, targetReps, targetRIR);

  // Applica cap per principianti
  const capResult = applyBeginnerSafetyCap(
    exerciseName,
    baseWeight,
    level,
    weeksInProgram,
    pattern
  );

  if (capResult.wasCapped) {
    return {
      weight: capResult.cappedWeight,
      wasCapped: true,
      note: `Capped from ${capResult.originalWeight}kg for safety`,
      noteIt: `Limitato da ${capResult.originalWeight}kg per sicurezza`
    };
  }

  return {
    weight: capResult.cappedWeight,
    wasCapped: false
  };
}

/**
 * Formula Brzycki per calcolo peso da RIR
 * (Copia dalla funzione esistente per completezza)
 */
function calculateWeightFromRIR(
  weight10RM: number,
  targetReps: number,
  targetRIR: number
): number {
  if (!weight10RM || weight10RM <= 0) return 0;

  // Stima 1RM dal 10RM
  const estimated1RM = weight10RM * (36 / (37 - 10));

  // Effective reps = target + RIR
  const effectiveReps = targetReps + targetRIR;

  // Calcola peso per effective reps
  const suggestedWeight = estimated1RM * ((37 - effectiveReps) / 36);

  // Arrotonda a 0.5kg
  return Math.round(suggestedWeight * 2) / 2;
}

// ============================================================================
// VALIDAZIONE E FEEDBACK
// ============================================================================

/**
 * Genera messaggio per l'utente quando il cap viene applicato
 */
export function getCapExplanationMessage(
  exerciseName: string,
  originalWeight: number,
  cappedWeight: number,
  weeksInProgram: number,
  language: 'en' | 'it' = 'it'
): string {
  const remainingWeeks = Math.max(0, 4 - weeksInProgram);

  if (language === 'it') {
    if (remainingWeeks > 0) {
      return `Per ${exerciseName}, iniziamo con ${cappedWeight}kg invece di ${originalWeight}kg. ` +
        `Questo ti permette di perfezionare la tecnica in sicurezza. ` +
        `Il carico aumenterà gradualmente nelle prossime ${remainingWeeks} settimane.`;
    } else {
      return `Per ${exerciseName}, il carico massimo è ${cappedWeight}kg. ` +
        `Man mano che mostri padronanza della tecnica, potremo aumentare progressivamente.`;
    }
  }

  // English
  if (remainingWeeks > 0) {
    return `For ${exerciseName}, we're starting with ${cappedWeight}kg instead of ${originalWeight}kg. ` +
      `This allows you to perfect your technique safely. ` +
      `The load will gradually increase over the next ${remainingWeeks} weeks.`;
  } else {
    return `For ${exerciseName}, the maximum load is ${cappedWeight}kg. ` +
      `As you demonstrate technique mastery, we can progressively increase.`;
  }
}

/**
 * Verifica se un utente dovrebbe essere promosso da beginner
 * basandosi sulle performance
 */
export function shouldPromoteFromBeginner(
  sessionsCompleted: number,
  averageRPE: number,
  techniqueFeedback: 'poor' | 'fair' | 'good' | 'excellent'
): {
  shouldPromote: boolean;
  reason: string;
  reasonIt: string;
} {
  // Minimo 12 sessioni (circa 4 settimane con 3x/week)
  if (sessionsCompleted < 12) {
    return {
      shouldPromote: false,
      reason: `Need ${12 - sessionsCompleted} more sessions to evaluate`,
      reasonIt: `Servono ancora ${12 - sessionsCompleted} sessioni per valutare`
    };
  }

  // RPE dovrebbe essere nel range 6-8 consistentemente
  if (averageRPE < 5 || averageRPE > 9) {
    return {
      shouldPromote: false,
      reason: averageRPE < 5
        ? 'Loads may be too light - keep current level for proper stimulus'
        : 'Loads may be too heavy - keep current level for safety',
      reasonIt: averageRPE < 5
        ? 'I carichi potrebbero essere troppo leggeri - mantieni il livello attuale'
        : 'I carichi potrebbero essere troppo pesanti - mantieni il livello attuale per sicurezza'
    };
  }

  // Tecnica deve essere almeno "good"
  if (techniqueFeedback === 'poor' || techniqueFeedback === 'fair') {
    return {
      shouldPromote: false,
      reason: 'Technique needs improvement before increasing loads',
      reasonIt: 'La tecnica deve migliorare prima di aumentare i carichi'
    };
  }

  return {
    shouldPromote: true,
    reason: 'Ready for intermediate programming!',
    reasonIt: 'Pronto per la programmazione intermedia!'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const BeginnerWeightCaps = {
  apply: applyBeginnerSafetyCap,
  calculateSafe: calculateSafeWeight,
  getExplanation: getCapExplanationMessage,
  shouldPromote: shouldPromoteFromBeginner,
  CAPS: BEGINNER_ABSOLUTE_CAPS,
  PATTERN_DEFAULTS: PATTERN_DEFAULT_CAPS
};

export default BeginnerWeightCaps;
