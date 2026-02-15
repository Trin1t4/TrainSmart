/**
 * ONE REP MAX CALCULATOR — Single Source of Truth
 * 
 * Centralizza TUTTE le stime 1RM dell'app in un unico modulo.
 * Sostituisce le 6 implementazioni sparse nel codebase.
 * 
 * FORMULE IMPLEMENTATE (7 + media):
 * - Epley (1985)
 * - Brzycki (1993)
 * - Lander (1985)
 * - Lombardi (1989)
 * - O'Conner et al. (1989)
 * - Mayhew et al. (1992)
 * - Wathan (1994)
 * 
 * FEATURES:
 * - Media multi-formula (default) — riduce errore sistematico (LeSuer et al. 1997)
 * - Correzione RPE/RIR per set non a cedimento
 * - Bias esercizio-specifico (Hoeger et al. 1990; Reynolds et al. 2006)
 * - Tabella VBT di riferimento (González-Badillo, Jovanović et al.)
 * - Safety cap per livello utente
 * - Calcolo inverso (1RM → nRM)
 * 
 * REFERENCES:
 * - LeSuer DA et al. (1997). J Strength Cond Res, 11(4), 211-213.
 * - Reynolds JM et al. (2006). J Strength Cond Res, 20(3), 584-592.
 * - Hoeger WWK et al. (1990). J Appl Sport Sci Res, 4(2), 47-52.
 * - González-Badillo JJ, Sánchez-Medina L (2010). Int J Sports Med, 31(5), 347-352.
 * - Jovanović M, Flanagan EP (2014). Strength Cond J, 36(6), 68-74.
 */

// ================================================================
// TYPES
// ================================================================

export type Formula = 
  | 'epley' 
  | 'brzycki' 
  | 'lander' 
  | 'lombardi' 
  | 'oconner' 
  | 'mayhew' 
  | 'wathan' 
  | 'average';

export type ExercisePattern = 
  | 'horizontal_push'   // Panca
  | 'lower_push'        // Squat
  | 'lower_pull'        // Stacco
  | 'vertical_push'     // Military Press
  | 'vertical_pull'     // Lat Pulldown / Trazioni
  | 'horizontal_pull'   // Rematore
  | 'core'
  | 'generic';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface OneRMInput {
  weight: number;          // Carico utilizzato (kg)
  reps: number;            // Ripetizioni completate
  rpe?: number;            // Rate of Perceived Exertion (6-10 scala Borg modificata)
  rir?: number;            // Reps In Reserve (alternativa a RPE)
  formula?: Formula;       // Formula da usare (default: 'average')
  pattern?: ExercisePattern; // Pattern per bias esercizio-specifico
}

export interface OneRMResult {
  estimated1RM: number;           // 1RM stimato finale (con tutte le correzioni)
  raw1RM: number;                 // 1RM grezzo (solo formula, senza correzioni)
  formula: Formula;               // Formula utilizzata
  confidence: 'high' | 'moderate' | 'low';  // Confidenza della stima
  confidenceNote: string;         // Nota sulla confidenza
  allFormulas: Record<Formula, number>;  // Risultati di tutte le formule
  corrections: {
    rpeAdjustment: number;        // Correzione RPE applicata (kg)
    exerciseBias: number;         // Correzione bias esercizio (moltiplicatore)
  };
}

export interface PercentageTableRow {
  percentage: number;
  weight: number;
  maxReps: number;
  velocityReference?: number;  // m/s — VBT reference
  zone?: string;               // Zona di allenamento
}

export interface VBTReference {
  percentage: number;
  bench: number;     // m/s
  squat: number;     // m/s
  deadlift: number;  // m/s
  press: number;     // m/s
  generic: number;   // m/s
}

// ================================================================
// INDIVIDUAL FORMULAS
// ================================================================

/**
 * Epley (1985): weight × (1 + reps/30)
 * Più accurata per alti rep range (>10 reps)
 */
function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Brzycki (1993): weight × (36 / (37 - reps))
 * Più accurata per bassi rep range (1-6 reps)
 * Limite: diverge a 37 reps
 */
function brzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 2; // Safety cap
  return weight * (36 / (37 - reps));
}

/**
 * Lander (1985): (100 × weight) / (101.3 - 2.67123 × reps)
 * Buon compromesso tra Epley e Brzycki
 */
function lander(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const divisor = 101.3 - 2.67123 * reps;
  if (divisor <= 0) return weight * 2; // Safety cap
  return (100 * weight) / divisor;
}

/**
 * Lombardi (1989): weight × reps^0.10
 * Formula semplice, performa bene su range medi (5-12 reps)
 */
function lombardi(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.10);
}

/**
 * O'Conner et al. (1989): weight × (1 + reps/40)
 * Simile a Epley ma più conservativa
 */
function oconner(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 40);
}

/**
 * Mayhew et al. (1992): (100 × weight) / (52.2 + 41.9 × e^(-0.055 × reps))
 * Formula esponenziale, buona per range alti (>12 reps)
 */
function mayhew(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const divisor = 52.2 + 41.9 * Math.exp(-0.055 * reps);
  if (divisor <= 0) return weight * 2;
  return (100 * weight) / divisor;
}

/**
 * Wathan (1994): (100 × weight) / (48.8 + 53.8 × e^(-0.075 × reps))
 * Spesso la più accurata in studi comparativi (Reynolds et al. 2006)
 */
function wathan(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const divisor = 48.8 + 53.8 * Math.exp(-0.075 * reps);
  if (divisor <= 0) return weight * 2;
  return (100 * weight) / divisor;
}

// Mappa formule per accesso dinamico
const FORMULAS: Record<Exclude<Formula, 'average'>, (w: number, r: number) => number> = {
  epley,
  brzycki,
  lander,
  lombardi,
  oconner,
  mayhew,
  wathan,
};

// ================================================================
// RPE/RIR CORRECTION
// ================================================================

/**
 * Converte RPE in RIR
 * RPE 10 = 0 RIR (cedimento)
 * RPE 9 = 1 RIR
 * RPE 8 = 2 RIR
 * etc.
 * 
 * Supporta mezzi punti: RPE 9.5 = 0.5 RIR
 */
function rpeToRIR(rpe: number): number {
  return Math.max(0, 10 - rpe);
}

/**
 * Corregge il 1RM per set non eseguiti a cedimento.
 * 
 * Se un utente fa 5 reps @ RPE 8 (= 2 RIR), ha effettivamente
 * la capacità di fare 7 reps con quel peso. La stima 1RM deve
 * basarsi su 7 reps effettive, non 5.
 * 
 * Questo è il pezzo che mancava rispetto a Gungnir.
 */
function getEffectiveReps(reps: number, rpe?: number, rir?: number): number {
  // Se abbiamo RIR diretto, lo usiamo
  if (rir !== undefined && rir >= 0) {
    return reps + rir;
  }
  
  // Se abbiamo RPE, convertiamo
  if (rpe !== undefined && rpe >= 6 && rpe <= 10) {
    return reps + rpeToRIR(rpe);
  }
  
  // Nessuna correzione — assume cedimento (RPE 10)
  return reps;
}

// ================================================================
// EXERCISE-SPECIFIC BIAS CORRECTION
// ================================================================

/**
 * Fattori di correzione esercizio-specifici.
 * 
 * Le formule standard tendono a:
 * - SOTTOSTIMARE per squat e stacco (Hoeger et al. 1990)
 * - SOVRASTIMARE per panca (Reynolds et al. 2006)
 * - Essere ragionevolmente accurate per press
 * 
 * I fattori sono basati sulla letteratura e calibrati conservativamente.
 * Valori > 1 = formula sottostima → correggiamo in su
 * Valori < 1 = formula sovrastima → correggiamo in giù
 * 
 * NOTA: Questi fattori sono PICCOLI (±2-3%) perché la media
 * multi-formula già riduce il bias. Li applichiamo come fine-tuning.
 */
const EXERCISE_BIAS: Record<ExercisePattern, number> = {
  horizontal_push: 0.98,   // Panca: formule tendono a sovrastimare (+2% di riduzione)
  lower_push: 1.02,        // Squat: formule tendono a sottostimare (+2% di aggiunta)
  lower_pull: 1.03,        // Stacco: sottostima maggiore (+3%)
  vertical_push: 1.00,     // Military press: bias trascurabile
  vertical_pull: 1.00,     // Trazioni/Lat: bias trascurabile
  horizontal_pull: 1.00,   // Rematore: bias trascurabile
  core: 1.00,              // Core: non applicabile
  generic: 1.00,           // Default: nessuna correzione
};

// ================================================================
// CONFIDENCE ASSESSMENT
// ================================================================

function assessConfidence(reps: number): { 
  level: 'high' | 'moderate' | 'low'; 
  note: string;
} {
  if (reps >= 1 && reps <= 6) {
    return { 
      level: 'high', 
      note: 'Range ottimale per la stima (1-6 reps). Errore atteso: ±2-3%.' 
    };
  }
  if (reps >= 7 && reps <= 10) {
    return { 
      level: 'moderate', 
      note: 'Range accettabile (7-10 reps). Errore atteso: ±5%.' 
    };
  }
  if (reps >= 11 && reps <= 15) {
    return { 
      level: 'low', 
      note: 'Range alto (11-15 reps). Errore atteso: ±10%. Considerare un test con meno ripetizioni.' 
    };
  }
  return { 
    level: 'low', 
    note: `Range molto alto (${reps} reps). Stima poco affidabile (errore >15%). Si consiglia un test ≤10 reps.` 
  };
}

// ================================================================
// MAIN CALCULATOR
// ================================================================

/**
 * Calcola 1RM stimato con tutte le correzioni.
 * 
 * UTILIZZO:
 * ```ts
 * // Minimo — solo peso e reps (assume cedimento)
 * const result = calculate1RM({ weight: 100, reps: 5 });
 * 
 * // Con RPE — corregge per reps in riserva
 * const result = calculate1RM({ weight: 100, reps: 5, rpe: 8 });
 * 
 * // Completo — con pattern esercizio e formula specifica
 * const result = calculate1RM({ 
 *   weight: 100, reps: 5, rpe: 8, 
 *   pattern: 'lower_push', formula: 'average' 
 * });
 * ```
 */
export function calculate1RM(input: OneRMInput): OneRMResult {
  const { 
    weight, 
    reps, 
    rpe, 
    rir, 
    formula = 'average', 
    pattern = 'generic' 
  } = input;

  // Edge cases
  if (weight <= 0 || reps <= 0) {
    return {
      estimated1RM: 0,
      raw1RM: 0,
      formula,
      confidence: 'low',
      confidenceNote: 'Dati non validi.',
      allFormulas: { epley: 0, brzycki: 0, lander: 0, lombardi: 0, oconner: 0, mayhew: 0, wathan: 0, average: 0 },
      corrections: { rpeAdjustment: 0, exerciseBias: 1 },
    };
  }

  if (reps === 1 && (!rpe || rpe >= 9.5)) {
    // 1RM diretto (o quasi)
    const directResult = weight;
    return {
      estimated1RM: directResult,
      raw1RM: directResult,
      formula: 'average',
      confidence: 'high',
      confidenceNote: 'Massimale diretto.',
      allFormulas: { 
        epley: directResult, brzycki: directResult, lander: directResult, 
        lombardi: directResult, oconner: directResult, mayhew: directResult, 
        wathan: directResult, average: directResult 
      },
      corrections: { rpeAdjustment: 0, exerciseBias: 1 },
    };
  }

  // 1. Calcola reps effettive (corregge per RPE/RIR)
  const effectiveReps = getEffectiveReps(reps, rpe, rir);

  // 2. Calcola con tutte le formule
  const allResults: Record<Exclude<Formula, 'average'>, number> = {
    epley: epley(weight, effectiveReps),
    brzycki: brzycki(weight, effectiveReps),
    lander: lander(weight, effectiveReps),
    lombardi: lombardi(weight, effectiveReps),
    oconner: oconner(weight, effectiveReps),
    mayhew: mayhew(weight, effectiveReps),
    wathan: wathan(weight, effectiveReps),
  };

  // 3. Calcola media (trimmed — esclude min e max per robustezza)
  const values = Object.values(allResults).sort((a, b) => a - b);
  const trimmedValues = values.slice(1, -1); // Rimuove outlier
  const average = trimmedValues.reduce((sum, v) => sum + v, 0) / trimmedValues.length;

  const allFormulas: Record<Formula, number> = {
    ...allResults,
    average: Math.round(average * 10) / 10,
  };

  // 4. Seleziona risultato base
  const raw1RM = formula === 'average' 
    ? allFormulas.average 
    : allFormulas[formula];

  // 5. Applica bias esercizio-specifico
  const exerciseBias = EXERCISE_BIAS[pattern];
  const biasAdjusted = raw1RM * exerciseBias;

  // 6. Calcola RPE adjustment per reporting
  const rawWithoutRPE = formula === 'average'
    ? (() => {
        const rawValues = Object.values(FORMULAS).map(fn => fn(weight, reps)).sort((a, b) => a - b);
        const rawTrimmed = rawValues.slice(1, -1);
        return rawTrimmed.reduce((s, v) => s + v, 0) / rawTrimmed.length;
      })()
    : FORMULAS[formula as Exclude<Formula, 'average'>]?.(weight, reps) || raw1RM;

  const rpeAdjustment = Math.round((raw1RM - rawWithoutRPE) * 10) / 10;

  // 7. Risultato finale arrotondato
  const estimated1RM = Math.round(biasAdjusted * 10) / 10;

  // 8. Confidenza
  const { level: confidence, note: confidenceNote } = assessConfidence(effectiveReps);

  return {
    estimated1RM,
    raw1RM: Math.round(raw1RM * 10) / 10,
    formula,
    confidence,
    confidenceNote,
    allFormulas: Object.fromEntries(
      Object.entries(allFormulas).map(([k, v]) => [k, Math.round(v * 10) / 10])
    ) as Record<Formula, number>,
    corrections: {
      rpeAdjustment,
      exerciseBias,
    },
  };
}

// ================================================================
// CONVENIENCE FUNCTIONS (backward compatible)
// ================================================================

/**
 * Quick 1RM estimate — drop-in replacement per tutte le funzioni legacy.
 * Restituisce solo il numero.
 */
export function estimate1RM(
  weight: number, 
  reps: number, 
  rpe?: number,
  pattern?: ExercisePattern
): number {
  const result = calculate1RM({ weight, reps, rpe, pattern, formula: 'average' });
  return result.estimated1RM;
}

/**
 * Calcola 1RM da 5RM — backward compatible con MaximalsInput.tsx
 */
export function calculate1RMFrom5RM(weight: number): number {
  return Math.round(estimate1RM(weight, 5));
}

/**
 * Calcola 5RM da 1RM — backward compatible
 */
export function calculate5RMFrom1RM(oneRM: number): number {
  return Math.round(calculateNRMFrom1RM(oneRM, 5));
}

/**
 * Calcola 1RM da nRM — backward compatible con weeklySplitGenerator.ts
 */
export function calculate1RMFromNRM(weight: number, reps: number): number {
  return estimate1RM(weight, reps);
}

/**
 * Calcola nRM da 1RM (formula inversa)
 * Usa Brzycki inversa: nRM = 1RM × ((37 - n) / 36)
 * Per reps > 10, usa Epley inversa: nRM = 1RM / (1 + n/30)
 */
export function calculateNRMFrom1RM(oneRM: number, targetReps: number): number {
  if (targetReps <= 0 || oneRM <= 0) return 0;
  if (targetReps === 1) return oneRM;
  
  if (targetReps <= 10) {
    // Brzycki inversa — più accurata per basse reps
    if (targetReps >= 37) return oneRM * 0.5;
    return oneRM * ((37 - targetReps) / 36);
  }
  
  // Epley inversa — più accurata per alte reps
  return oneRM / (1 + targetReps / 30);
}

/**
 * Calcola peso per dato % del 1RM con arrotondamento pratico
 */
export function calculatePercentage(
  oneRM: number, 
  percentage: number,
  roundTo: number = 2.5 // Default: bilanciere standard
): number {
  if (oneRM <= 0 || percentage <= 0) return 0;
  const raw = oneRM * percentage / 100;
  return Math.round(raw / roundTo) * roundTo;
}

// ================================================================
// PERCENTAGE TABLE GENERATOR
// ================================================================

/**
 * Genera tabella percentuali completa con VBT reference
 */
export function generatePercentageTable(
  oneRM: number,
  pattern: ExercisePattern = 'generic',
  roundTo: number = 2.5
): PercentageTableRow[] {
  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  
  // Rep max approssimativo per percentuale (Brzycki-based)
  const repMaxByPercentage: Record<number, number> = {
    100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 
    70: 12, 65: 15, 60: 18, 55: 22, 50: 25,
  };

  // VBT reference per pattern
  const vbtRef = VBT_REFERENCE_TABLE;

  return percentages.map(pct => {
    const vbtRow = vbtRef.find(r => r.percentage === pct);
    let velocity: number | undefined;
    
    if (vbtRow) {
      switch (pattern) {
        case 'horizontal_push': velocity = vbtRow.bench; break;
        case 'lower_push': velocity = vbtRow.squat; break;
        case 'lower_pull': velocity = vbtRow.deadlift; break;
        case 'vertical_push': velocity = vbtRow.press; break;
        default: velocity = vbtRow.generic; break;
      }
    }

    return {
      percentage: pct,
      weight: Math.round((oneRM * pct / 100) / roundTo) * roundTo,
      maxReps: repMaxByPercentage[pct] || Math.round(30 * (1 - pct / 100)),
      velocityReference: velocity,
      zone: getTrainingZone(pct),
    };
  });
}

function getTrainingZone(percentage: number): string {
  if (percentage >= 90) return 'Forza Massima';
  if (percentage >= 80) return 'Forza';
  if (percentage >= 70) return 'Ipertrofia';
  if (percentage >= 60) return 'Forza-Resistenza';
  return 'Resistenza / Tecnica';
}

// ================================================================
// VBT REFERENCE TABLE
// ================================================================

/**
 * Velocity Based Training — velocità media concentrica (m/s)
 * 
 * Basato su:
 * - González-Badillo JJ, Sánchez-Medina L (2010) — Bench press & squat
 * - Jovanović M, Flanagan EP (2014) — Review VBT
 * - Conceição F et al. (2016) — Deadlift velocity profiles
 * 
 * NOTA: Questi sono valori INDICATIVI per atleti intermedi.
 * La velocità minima (MVT) varia significativamente tra individui.
 */
export const VBT_REFERENCE_TABLE: VBTReference[] = [
  { percentage: 100, bench: 0.15, squat: 0.30, deadlift: 0.15, press: 0.20, generic: 0.20 },
  { percentage: 95,  bench: 0.22, squat: 0.37, deadlift: 0.22, press: 0.28, generic: 0.27 },
  { percentage: 90,  bench: 0.32, squat: 0.45, deadlift: 0.30, press: 0.37, generic: 0.36 },
  { percentage: 85,  bench: 0.42, squat: 0.52, deadlift: 0.38, press: 0.46, generic: 0.44 },
  { percentage: 80,  bench: 0.52, squat: 0.60, deadlift: 0.46, press: 0.55, generic: 0.53 },
  { percentage: 75,  bench: 0.61, squat: 0.68, deadlift: 0.54, press: 0.64, generic: 0.62 },
  { percentage: 70,  bench: 0.72, squat: 0.76, deadlift: 0.62, press: 0.73, generic: 0.71 },
  { percentage: 65,  bench: 0.82, squat: 0.84, deadlift: 0.70, press: 0.82, generic: 0.80 },
  { percentage: 60,  bench: 0.93, squat: 0.92, deadlift: 0.78, press: 0.91, generic: 0.89 },
  { percentage: 55,  bench: 1.03, squat: 1.00, deadlift: 0.86, press: 1.00, generic: 0.97 },
  { percentage: 50,  bench: 1.13, squat: 1.08, deadlift: 0.94, press: 1.09, generic: 1.06 },
];

/**
 * Stima %1RM dalla velocità concentrica osservata
 * Utile per auto-regulation basata su VBT
 */
export function estimatePercentageFromVelocity(
  velocity: number,
  pattern: ExercisePattern = 'generic'
): number {
  const columnKey = pattern === 'horizontal_push' ? 'bench'
    : pattern === 'lower_push' ? 'squat'
    : pattern === 'lower_pull' ? 'deadlift'
    : pattern === 'vertical_push' ? 'press'
    : 'generic';

  // Trova le due righe più vicine e interpola
  for (let i = 0; i < VBT_REFERENCE_TABLE.length - 1; i++) {
    const current = VBT_REFERENCE_TABLE[i];
    const next = VBT_REFERENCE_TABLE[i + 1];
    
    const currentVel = current[columnKey];
    const nextVel = next[columnKey];

    if (velocity >= currentVel && velocity <= nextVel) {
      // Interpolazione lineare
      const ratio = (velocity - currentVel) / (nextVel - currentVel);
      return Math.round(current.percentage - ratio * (current.percentage - next.percentage));
    }
  }

  // Fuori range
  if (velocity < VBT_REFERENCE_TABLE[0][columnKey]) return 100;
  return 50;
}

// ================================================================
// SAFETY CAPS
// ================================================================

/**
 * Limita il RM target in base al livello utente.
 * Un beginner non dovrebbe mai testare un 1RM vero.
 */
export const MIN_RM_BY_LEVEL: Record<UserLevel, number> = {
  beginner: 6,       // Mai sotto 6RM
  intermediate: 3,   // Può arrivare a 3RM  
  advanced: 1,       // Può testare il singolo
};

/**
 * Verifica se un test RM è sicuro per il livello dato
 */
export function isTestSafe(targetRM: number, level: UserLevel): boolean {
  return targetRM >= MIN_RM_BY_LEVEL[level];
}

/**
 * Suggerisce il RM di test appropriato per il livello
 */
export function getSafeTestRM(targetRM: number, level: UserLevel): number {
  return Math.max(targetRM, MIN_RM_BY_LEVEL[level]);
}
