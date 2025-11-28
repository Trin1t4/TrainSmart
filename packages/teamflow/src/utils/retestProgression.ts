/**
 * RETEST PROGRESSION SYSTEM
 *
 * Gestisce la progressione dei test massimali nel tempo.
 * Dopo ogni mesociclo (4 settimane), c'è una settimana di deload
 * seguita dal test massimale.
 *
 * STRUTTURA CICLO:
 * Mesociclo (4 sett) → Deload (1 sett) → Retest → Nuovo ciclo
 *
 * PROGRESSIONE PER GOAL:
 * - Forza:     10RM → 6RM → 3RM → 1RM (test massimali crescenti)
 * - Ipertrofia: 10RM → 8RM → 8RM → 6RM (range ottimale per volume)
 * - Endurance: 10RM → 12RM → 15RM → 20RM (capacità di lavoro)
 * - Dimagrimento: 10RM → 10RM → 12RM → 15RM (mantenimento + volume)
 *
 * BENEFICI DELOAD PRIMA DEL TEST:
 * 1. Dissipazione fatica accumulata
 * 2. Supercompensazione per prestazione ottimale
 * 3. Sicurezza nei test ad alta intensità
 * 4. Baseline accurata per il nuovo ciclo
 */

// ================================================================
// TYPES
// ================================================================

export type Goal = 'forza' | 'ipertrofia' | 'resistenza' | 'dimagrimento' | 'prestazioni';

export interface RetestConfig {
  cycle: number;        // Numero ciclo corrente (1, 2, 3, ...)
  targetRM: number;     // Rep max target per questo ciclo
  description: string;  // Descrizione per UI
  intensity: string;    // % 1RM indicativo
  restSeconds: number;  // Recupero tra tentativi
}

export interface RetestHistory {
  date: string;
  cycle: number;
  targetRM: number;
  results: Record<string, {
    weight: number;
    reps: number;
    estimated1RM: number;
  }>;
}

export interface RetestSchedule {
  isRetestDue: boolean;
  daysUntilRetest: number;
  nextRetestDate: string;
  currentCycle: number;
  nextConfig: RetestConfig;
  // NEW: Deload phase
  isDeloadWeek: boolean;
  daysUntilDeload: number;
  deloadConfig: DeloadConfig | null;
  phase: 'training' | 'deload' | 'retest';
}

export interface DeloadConfig {
  volumeReduction: number;      // % riduzione volume (es: 0.5 = -50%)
  intensityReduction: number;   // % riduzione intensità (es: 0.15 = -15%)
  frequencyReduction: number;   // % riduzione frequenza (es: 0 = stessa freq)
  guidelines: string[];         // Linee guida per la settimana
  focusAreas: string[];         // Aree su cui concentrarsi
}

// ================================================================
// PROGRESSIONE RM PER GOAL E LIVELLO
// ================================================================

export type Level = 'beginner' | 'intermediate' | 'advanced';

// Progressione per goal (massimo range per ogni goal)
const RETEST_PROGRESSION: Record<Goal, number[]> = {
  forza: [10, 6, 3, 1],           // Verso massimale singolo
  ipertrofia: [10, 8, 8, 6],      // Range ipertrofia ottimale
  resistenza: [10, 12, 15, 20],   // Endurance crescente
  dimagrimento: [10, 10, 12, 15], // Mantenimento + volume
  prestazioni: [10, 6, 4, 2]      // Potenza e velocità
};

// Limite minimo RM per livello (per sicurezza)
// Beginner: mai sotto 6RM (tecnica non consolidata)
// Intermediate: può arrivare a 3RM
// Advanced: può fare 1RM
const MIN_RM_BY_LEVEL: Record<Level, number> = {
  beginner: 6,      // Fermarsi a 6RM max
  intermediate: 3,  // Può arrivare a 3RM
  advanced: 1       // Può testare il singolo
};

// Descrizioni per ogni tipo di test
const RM_DESCRIPTIONS: Record<number, { description: string; intensity: string; rest: number }> = {
  1: {
    description: 'Test del massimale singolo - Trova il carico massimo per 1 ripetizione',
    intensity: '100% 1RM',
    rest: 300 // 5 minuti
  },
  2: {
    description: 'Test del doppio - Trova il carico massimo per 2 ripetizioni',
    intensity: '95% 1RM',
    rest: 240 // 4 minuti
  },
  3: {
    description: 'Test del triplo - Trova il carico massimo per 3 ripetizioni',
    intensity: '93% 1RM',
    rest: 240
  },
  4: {
    description: 'Test del quadruplo - Trova il carico massimo per 4 ripetizioni',
    intensity: '90% 1RM',
    rest: 180
  },
  6: {
    description: 'Test del 6RM - Trova il carico massimo per 6 ripetizioni',
    intensity: '85% 1RM',
    rest: 180 // 3 minuti
  },
  8: {
    description: 'Test dell\'8RM - Trova il carico massimo per 8 ripetizioni',
    intensity: '80% 1RM',
    rest: 150
  },
  10: {
    description: 'Test del 10RM - Trova il carico massimo per 10 ripetizioni',
    intensity: '75% 1RM',
    rest: 120 // 2 minuti
  },
  12: {
    description: 'Test del 12RM - Trova il carico massimo per 12 ripetizioni',
    intensity: '70% 1RM',
    rest: 90
  },
  15: {
    description: 'Test del 15RM - Trova il carico massimo per 15 ripetizioni',
    intensity: '65% 1RM',
    rest: 90
  },
  20: {
    description: 'Test del 20RM - Trova il carico massimo per 20 ripetizioni',
    intensity: '60% 1RM',
    rest: 60
  }
};

// ================================================================
// DELOAD CONFIGURATION
// ================================================================

const DELOAD_DURATION = 7; // 1 settimana

/**
 * Configurazione deload standard
 * Basata su principi di recupero attivo
 */
function getDeloadConfig(): DeloadConfig {
  return {
    volumeReduction: 0.5,      // -50% volume (meno serie)
    intensityReduction: 0.15,  // -15% intensità (carichi più leggeri)
    frequencyReduction: 0,     // Stessa frequenza
    guidelines: [
      'Mantieni la stessa frequenza di allenamento',
      'Riduci le serie del 40-50% per ogni esercizio',
      'Usa carichi al 80-85% del normale',
      'Nessuna serie a cedimento (RPE max 7)',
      'Focus sulla tecnica e sul controllo',
      'Aumenta il recupero tra le serie',
      'Dormi 7-9 ore per notte',
      'Cura particolarmente l\'alimentazione'
    ],
    focusAreas: [
      'Recupero muscolare e articolare',
      'Qualità del movimento',
      'Mobilità e stretching',
      'Preparazione mentale per il test'
    ]
  };
}

/**
 * Genera istruzioni dettagliate per la settimana di deload
 */
export function generateDeloadInstructions(): string[] {
  const config = getDeloadConfig();

  return [
    'SETTIMANA DI DELOAD',
    '==================',
    '',
    'OBIETTIVO: Dissipare la fatica accumulata per esprimere',
    'il massimo potenziale nel test della prossima settimana.',
    '',
    'LINEE GUIDA:',
    ...config.guidelines.map((g, i) => `${i + 1}. ${g}`),
    '',
    'AREE DI FOCUS:',
    ...config.focusAreas.map(f => `• ${f}`),
    '',
    'ESEMPIO PRATICO:',
    'Se normalmente fai 4x8 Squat @ 100kg:',
    `→ Deload: 2x8 @ 85kg (${Math.round(config.volumeReduction * 100)}% volume, ${Math.round(config.intensityReduction * 100)}% intensità in meno)`,
    '',
    'IMPORTANTE:',
    '• NON saltare gli allenamenti - il recupero attivo è meglio',
    '• NON aggiungere volume "perché ti senti bene"',
    '• Il test sarà più preciso se arrivi riposato'
  ];
}

// ================================================================
// FUNZIONI PRINCIPALI
// ================================================================

/**
 * Ottieni la configurazione del retest per un ciclo specifico
 * Considera il livello per determinare il minimo RM testabile (sicurezza)
 */
export function getRetestConfig(
  goal: Goal,
  cycle: number,
  level: Level = 'intermediate'
): RetestConfig {
  const progression = RETEST_PROGRESSION[goal] || RETEST_PROGRESSION.ipertrofia;
  const minRM = MIN_RM_BY_LEVEL[level];

  // Ciclo 1-indexed, array 0-indexed
  const cycleIndex = Math.min(cycle - 1, progression.length - 1);
  let targetRM = progression[cycleIndex];

  // Applica limite di sicurezza per livello
  // Se il target RM è sotto il minimo consentito, usa il minimo
  if (targetRM < minRM) {
    targetRM = minRM;
    console.log(`[RetestProgression] Target RM limitato a ${minRM}RM per livello ${level}`);
  }

  const rmInfo = RM_DESCRIPTIONS[targetRM] || RM_DESCRIPTIONS[10];

  return {
    cycle,
    targetRM,
    description: rmInfo.description,
    intensity: rmInfo.intensity,
    restSeconds: rmInfo.rest
  };
}

/**
 * Calcola quando è il prossimo retest
 *
 * STRUTTURA CICLO COMPLETO (35 giorni):
 * - Giorni 1-28: Mesociclo di allenamento
 * - Giorni 29-35: Settimana di deload
 * - Dopo giorno 35: Retest e nuovo ciclo
 */
export function getRetestSchedule(
  programStartDate: string,
  goal: Goal,
  level: Level = 'intermediate',
  mesocycleDuration: number = 28 // 4 settimane default
): RetestSchedule {
  const startDate = new Date(programStartDate);
  const today = new Date();

  // Ciclo completo = mesociclo + deload
  const fullCycleDuration = mesocycleDuration + DELOAD_DURATION;

  // Calcola giorni dall'inizio
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determina ciclo corrente
  const completedCycles = Math.floor(daysSinceStart / fullCycleDuration);
  const currentCycle = completedCycles + 1;
  const daysIntoCurrentCycle = daysSinceStart % fullCycleDuration;

  // Determina la fase corrente
  let phase: 'training' | 'deload' | 'retest';
  let isDeloadWeek = false;
  let isRetestDue = false;
  let daysUntilDeload: number;
  let daysUntilRetest: number;

  if (daysIntoCurrentCycle < mesocycleDuration) {
    // Fase di allenamento (giorni 1-28)
    phase = 'training';
    daysUntilDeload = mesocycleDuration - daysIntoCurrentCycle;
    daysUntilRetest = fullCycleDuration - daysIntoCurrentCycle;
  } else if (daysIntoCurrentCycle < fullCycleDuration - 2) {
    // Fase di deload (giorni 29-33)
    phase = 'deload';
    isDeloadWeek = true;
    daysUntilDeload = 0;
    daysUntilRetest = fullCycleDuration - daysIntoCurrentCycle;
  } else {
    // Fase di retest (ultimi 2 giorni del ciclo)
    phase = 'retest';
    isRetestDue = true;
    daysUntilDeload = 0;
    daysUntilRetest = fullCycleDuration - daysIntoCurrentCycle;
  }

  // Data prossimo retest
  const nextRetestDate = new Date(today);
  nextRetestDate.setDate(nextRetestDate.getDate() + daysUntilRetest);

  // Configurazione per il prossimo ciclo (considera il livello)
  const nextConfig = getRetestConfig(goal, currentCycle + 1, level);

  // Configurazione deload (solo se in fase training o deload)
  const deloadConfig = (phase === 'training' || phase === 'deload')
    ? getDeloadConfig()
    : null;

  return {
    isRetestDue,
    daysUntilRetest,
    nextRetestDate: nextRetestDate.toISOString(),
    currentCycle,
    nextConfig,
    // NEW: Deload info
    isDeloadWeek,
    daysUntilDeload,
    deloadConfig,
    phase
  };
}

/**
 * Calcola 1RM stimato da nRM usando Brzycki
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 10) {
    // Per reps > 10, la formula è meno accurata
    // Usiamo una versione modificata
    return weight * (1 + reps / 30);
  }
  // Formula di Brzycki
  return weight * (36 / (37 - reps));
}

/**
 * Calcola il peso target per un dato RM dal 1RM
 */
export function calculateWeightForRM(estimated1RM: number, targetReps: number): number {
  if (targetReps === 1) return estimated1RM;

  // Brzycki inversa
  const targetWeight = estimated1RM * ((37 - targetReps) / 36);

  // Arrotonda a 0.5kg
  return Math.round(targetWeight * 2) / 2;
}

/**
 * Genera istruzioni per il retest
 */
export function generateRetestInstructions(config: RetestConfig): string[] {
  const instructions = [
    `Obiettivo: Trovare il carico massimo per ${config.targetRM} ripetizioni`,
    '',
    'PREPARAZIONE:',
    '1. Riscaldamento generale (5-10 min cardio leggero)',
    '2. Mobilità articolare specifica',
    '3. Serie di riscaldamento progressivo:',
    '   - 10 reps @ 40%',
    '   - 5 reps @ 60%',
    '   - 3 reps @ 80%',
    '',
    'PROTOCOLLO TEST:',
  ];

  if (config.targetRM <= 3) {
    // Test massimali bassi - più tentativi con incrementi piccoli
    instructions.push(
      `4. Primo tentativo: peso stimato ${config.targetRM}RM`,
      '5. Riposo completo (4-5 minuti)',
      '6. Aggiusta peso (+/- 2.5kg) in base al risultato',
      '7. Massimo 5 tentativi totali',
      '',
      'CRITERI DI COMPLETAMENTO:',
      `- Completare esattamente ${config.targetRM} reps con buona tecnica`,
      '- Nessuna assistenza esterna',
      '- Range completo di movimento'
    );
  } else {
    // Test con reps più alte
    instructions.push(
      `4. Primo tentativo: peso stimato ${config.targetRM}RM`,
      `5. Riposo (${Math.floor(config.restSeconds / 60)} minuti)`,
      '6. Se completato facilmente: +5% peso',
      '7. Se fallito: -5% peso',
      '8. Massimo 3 tentativi',
      '',
      'CRITERI DI COMPLETAMENTO:',
      `- Completare esattamente ${config.targetRM} reps`,
      '- Le ultime 2 reps devono essere difficili (RPE 9-10)',
      '- Tecnica mantenuta fino alla fine'
    );
  }

  instructions.push(
    '',
    'SICUREZZA:',
    '- Usa sempre safety pins/spotter per esercizi pesanti',
    '- Interrompi se senti dolore o tecnica compromessa',
    '- Non testare se affaticato o malato'
  );

  return instructions;
}

/**
 * Converti vecchi baseline (10RM) a nuovo target RM
 */
export function convertBaselines(
  oldBaselines: Record<string, { weight10RM?: number; reps?: number; difficulty?: number }>,
  oldRM: number,
  newTargetRM: number
): Record<string, { suggestedWeight: number; targetReps: number }> {
  const converted: Record<string, { suggestedWeight: number; targetReps: number }> = {};

  for (const [pattern, baseline] of Object.entries(oldBaselines)) {
    if (baseline.weight10RM) {
      // Calcola 1RM stimato dal vecchio test
      const estimated1RM = calculateEstimated1RM(baseline.weight10RM, oldRM);

      // Calcola peso suggerito per il nuovo target RM
      const suggestedWeight = calculateWeightForRM(estimated1RM, newTargetRM);

      converted[pattern] = {
        suggestedWeight,
        targetReps: newTargetRM
      };
    }
  }

  return converted;
}

/**
 * Valida i risultati del retest e calcola progressione
 */
export function validateRetestResults(
  previousResults: RetestHistory | null,
  currentResults: Record<string, { weight: number; reps: number }>,
  targetRM: number
): {
  isValid: boolean;
  progressionPercent: Record<string, number>;
  warnings: string[];
} {
  const warnings: string[] = [];
  const progressionPercent: Record<string, number> = {};
  let isValid = true;

  for (const [pattern, result] of Object.entries(currentResults)) {
    // Verifica che le reps siano vicine al target
    if (Math.abs(result.reps - targetRM) > 2) {
      warnings.push(
        `${pattern}: ${result.reps} reps invece di ${targetRM}. ` +
        (result.reps > targetRM ? 'Aumenta il peso.' : 'Riduci il peso.')
      );
      isValid = false;
    }

    // Calcola progressione se abbiamo dati precedenti
    if (previousResults?.results[pattern]) {
      const prev1RM = calculateEstimated1RM(
        previousResults.results[pattern].weight,
        previousResults.results[pattern].reps
      );
      const curr1RM = calculateEstimated1RM(result.weight, result.reps);

      const progression = ((curr1RM - prev1RM) / prev1RM) * 100;
      progressionPercent[pattern] = Math.round(progression * 10) / 10;

      // Warning se progressione negativa significativa
      if (progression < -5) {
        warnings.push(
          `${pattern}: Regressione del ${Math.abs(progression).toFixed(1)}%. ` +
          'Verifica recupero, tecnica e nutrizione.'
        );
      }
    }
  }

  return { isValid, progressionPercent, warnings };
}

// ================================================================
// EXPORT
// ================================================================

export default {
  getRetestConfig,
  getRetestSchedule,
  calculateEstimated1RM,
  calculateWeightForRM,
  generateRetestInstructions,
  generateDeloadInstructions,
  convertBaselines,
  validateRetestResults
};
