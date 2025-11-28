/**
 * STRENGTH STANDARDS - Sistema di classificazione livello
 *
 * Calcola il livello dell'utente basandosi sui carichi sollevati
 * rispetto al peso corporeo, usando gli standard di Project Invictus.
 *
 * Il livello viene determinato OGGETTIVAMENTE dai carichi,
 * non da quiz o percezioni soggettive.
 *
 * RATIO = Carico Sollevato / Peso Corporeo
 *
 * STANDARD PROJECT INVICTUS (uomo):
 * ┌─────────────┬──────────┬──────────────┬──────────┐
 * │ Esercizio   │ Beginner │ Intermediate │ Advanced │
 * ├─────────────┼──────────┼──────────────┼──────────┤
 * │ Squat       │ < 1.0x   │ 1.0 - 1.5x   │ > 1.5x   │
 * │ Bench Press │ < 0.75x  │ 0.75 - 1.25x │ > 1.25x  │
 * │ Deadlift    │ < 1.25x  │ 1.25 - 2.0x  │ > 2.0x   │
 * │ OHP         │ < 0.5x   │ 0.5 - 0.75x  │ > 0.75x  │
 * │ Row         │ < 0.6x   │ 0.6 - 1.0x   │ > 1.0x   │
 * │ Pull-up     │ < 5 reps │ 5-15 reps    │ > 15 reps│
 * └─────────────┴──────────┴──────────────┴──────────┘
 *
 * Per donne: ratio ridotti del 30%
 */

// ================================================================
// TYPES
// ================================================================

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'M' | 'F';

export interface StrengthStandard {
  pattern: string;
  exerciseName: string;
  beginnerMax: number;    // Ratio max per beginner
  intermediateMax: number; // Ratio max per intermediate
  // Sopra intermediateMax = advanced
  isBodyweight?: boolean;  // Per esercizi a corpo libero (conta reps)
}

export interface LiftResult {
  pattern: string;
  weight: number;  // Carico sollevato (kg)
  reps: number;    // Reps completate
}

export interface LevelAssessment {
  overallLevel: Level;
  patternLevels: Record<string, Level>;
  patternRatios: Record<string, number>;
  strengths: string[];   // Pattern dove sei più forte
  weaknesses: string[];  // Pattern da migliorare
  details: string;
}

// ================================================================
// STRENGTH STANDARDS (Project Invictus)
// ================================================================

// Standard per uomini (ratio carico/peso corporeo)
const MALE_STANDARDS: StrengthStandard[] = [
  // Lower body
  {
    pattern: 'lower_push',
    exerciseName: 'Squat',
    beginnerMax: 1.0,
    intermediateMax: 1.5
  },
  {
    pattern: 'lower_pull',
    exerciseName: 'Deadlift',
    beginnerMax: 1.25,
    intermediateMax: 2.0
  },

  // Upper push
  {
    pattern: 'horizontal_push',
    exerciseName: 'Bench Press',
    beginnerMax: 0.75,
    intermediateMax: 1.25
  },
  {
    pattern: 'vertical_push',
    exerciseName: 'Overhead Press',
    beginnerMax: 0.5,
    intermediateMax: 0.75
  },

  // Upper pull
  {
    pattern: 'horizontal_pull',
    exerciseName: 'Row',
    beginnerMax: 0.6,
    intermediateMax: 1.0
  },
  {
    pattern: 'vertical_pull',
    exerciseName: 'Pull-up',
    beginnerMax: 5,      // Reps per bodyweight
    intermediateMax: 15,
    isBodyweight: true
  }
];

// Moltiplicatore per donne (standard ridotti del 30%)
const FEMALE_MULTIPLIER = 0.7;

// ================================================================
// FUNZIONI PRINCIPALI
// ================================================================

/**
 * Ottieni gli standard per un genere specifico
 */
export function getStandardsForGender(gender: Gender): StrengthStandard[] {
  if (gender === 'F') {
    return MALE_STANDARDS.map(std => ({
      ...std,
      beginnerMax: std.isBodyweight ? std.beginnerMax * FEMALE_MULTIPLIER : std.beginnerMax * FEMALE_MULTIPLIER,
      intermediateMax: std.isBodyweight ? std.intermediateMax * FEMALE_MULTIPLIER : std.intermediateMax * FEMALE_MULTIPLIER
    }));
  }
  return MALE_STANDARDS;
}

/**
 * Calcola il livello per un singolo pattern
 */
export function calculatePatternLevel(
  pattern: string,
  weight: number,
  reps: number,
  bodyweight: number,
  gender: Gender
): { level: Level; ratio: number } {
  const standards = getStandardsForGender(gender);
  const standard = standards.find(s => s.pattern === pattern);

  if (!standard) {
    // Pattern non trovato, usa valori di default
    return { level: 'intermediate', ratio: 1.0 };
  }

  let ratio: number;

  if (standard.isBodyweight) {
    // Per esercizi bodyweight, usa le reps come "ratio"
    ratio = reps;
  } else {
    // Calcola 1RM stimato e poi il ratio
    const estimated1RM = weight * (36 / (37 - reps));
    ratio = estimated1RM / bodyweight;
  }

  // Determina il livello
  let level: Level;
  if (ratio < standard.beginnerMax) {
    level = 'beginner';
  } else if (ratio < standard.intermediateMax) {
    level = 'intermediate';
  } else {
    level = 'advanced';
  }

  return { level, ratio: Math.round(ratio * 100) / 100 };
}

/**
 * Calcola il livello complessivo basato su tutti i lift
 */
export function calculateOverallLevel(
  lifts: LiftResult[],
  bodyweight: number,
  gender: Gender
): LevelAssessment {
  const patternLevels: Record<string, Level> = {};
  const patternRatios: Record<string, number> = {};
  const levelCounts = { beginner: 0, intermediate: 0, advanced: 0 };

  // Calcola livello per ogni pattern
  for (const lift of lifts) {
    const { level, ratio } = calculatePatternLevel(
      lift.pattern,
      lift.weight,
      lift.reps,
      bodyweight,
      gender
    );

    patternLevels[lift.pattern] = level;
    patternRatios[lift.pattern] = ratio;
    levelCounts[level]++;
  }

  // Determina livello complessivo
  // Regola: sei del livello in cui hai la maggioranza dei pattern
  // Se parità, prevale il livello più basso (conservativo)
  let overallLevel: Level;
  const total = lifts.length;

  if (levelCounts.beginner > total / 2) {
    overallLevel = 'beginner';
  } else if (levelCounts.advanced > total / 2) {
    overallLevel = 'advanced';
  } else {
    overallLevel = 'intermediate';
  }

  // Identifica punti di forza e debolezza
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const [pattern, level] of Object.entries(patternLevels)) {
    if (level === 'advanced') {
      strengths.push(pattern);
    } else if (level === 'beginner') {
      weaknesses.push(pattern);
    }
  }

  // Genera dettagli
  const details = generateAssessmentDetails(patternLevels, patternRatios, overallLevel, gender);

  return {
    overallLevel,
    patternLevels,
    patternRatios,
    strengths,
    weaknesses,
    details
  };
}

/**
 * Genera descrizione testuale dell'assessment
 */
function generateAssessmentDetails(
  patternLevels: Record<string, Level>,
  patternRatios: Record<string, number>,
  overallLevel: Level,
  gender: Gender
): string {
  const standards = getStandardsForGender(gender);
  const lines: string[] = [];

  lines.push(`Livello complessivo: ${overallLevel.toUpperCase()}`);
  lines.push('');
  lines.push('Dettaglio per pattern:');

  for (const [pattern, level] of Object.entries(patternLevels)) {
    const standard = standards.find(s => s.pattern === pattern);
    const ratio = patternRatios[pattern];

    if (standard) {
      const emoji = level === 'advanced' ? '🟢' : level === 'intermediate' ? '🟡' : '🔴';
      const ratioStr = standard.isBodyweight ? `${ratio} reps` : `${ratio}x BW`;
      lines.push(`${emoji} ${standard.exerciseName}: ${ratioStr} (${level})`);
    }
  }

  return lines.join('\n');
}

/**
 * Converti risultati screening in formato LiftResult
 */
export function convertScreeningToLifts(
  screeningBaselines: Record<string, { weight10RM?: number; reps?: number; difficulty?: number }>
): LiftResult[] {
  const lifts: LiftResult[] = [];

  for (const [pattern, baseline] of Object.entries(screeningBaselines)) {
    if (baseline.weight10RM) {
      lifts.push({
        pattern,
        weight: baseline.weight10RM,
        reps: 10 // Standard 10RM test
      });
    } else if (baseline.reps && baseline.difficulty) {
      // Per esercizi bodyweight, stima un "peso equivalente"
      // Basato su difficoltà (1-10) e reps
      lifts.push({
        pattern,
        weight: 0, // Bodyweight
        reps: baseline.reps
      });
    }
  }

  return lifts;
}

/**
 * Suggerisci obiettivi per il prossimo ciclo
 */
export function suggestNextGoals(assessment: LevelAssessment): string[] {
  const suggestions: string[] = [];

  // Suggerisci di lavorare sui punti deboli
  if (assessment.weaknesses.length > 0) {
    suggestions.push(
      `Focus su: ${assessment.weaknesses.map(p => p.replace(/_/g, ' ')).join(', ')}`
    );
  }

  // Suggerisci target specifici basati sul livello
  if (assessment.overallLevel === 'beginner') {
    suggestions.push('Obiettivo: raggiungere 1x BW su squat, 0.75x su bench');
    suggestions.push('Priorità: tecnica e consistenza');
  } else if (assessment.overallLevel === 'intermediate') {
    suggestions.push('Obiettivo: raggiungere 1.5x BW su squat, 1.25x su bench');
    suggestions.push('Priorità: volume progressivo e periodizzazione');
  } else {
    suggestions.push('Obiettivo: mantenimento e specializzazione');
    suggestions.push('Priorità: peaking e specificità competitiva');
  }

  return suggestions;
}

/**
 * Tabella di riferimento completa per UI
 */
export function getStandardsTable(gender: Gender): Array<{
  pattern: string;
  exercise: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}> {
  const standards = getStandardsForGender(gender);

  return standards.map(std => ({
    pattern: std.pattern,
    exercise: std.exerciseName,
    beginner: std.isBodyweight
      ? `< ${std.beginnerMax} reps`
      : `< ${std.beginnerMax}x BW`,
    intermediate: std.isBodyweight
      ? `${std.beginnerMax} - ${std.intermediateMax} reps`
      : `${std.beginnerMax} - ${std.intermediateMax}x BW`,
    advanced: std.isBodyweight
      ? `> ${std.intermediateMax} reps`
      : `> ${std.intermediateMax}x BW`
  }));
}

// ================================================================
// EXPORT
// ================================================================

export default {
  getStandardsForGender,
  calculatePatternLevel,
  calculateOverallLevel,
  convertScreeningToLifts,
  suggestNextGoals,
  getStandardsTable
};
