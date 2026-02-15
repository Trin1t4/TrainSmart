/**
 * ============================================================================
 * SEVERE PAIN BLOCK - Fix Critico #3
 * ============================================================================
 *
 * Implementa un BLOCCO FORZATO quando l'utente segnala dolore >= 8/10.
 * A differenza del sistema attuale che "consiglia" di fermarsi,
 * questo IMPEDISCE di continuare.
 *
 * COMPORTAMENTO:
 * | Livello Dolore | Comportamento                          |
 * |----------------|----------------------------------------|
 * | 0-3            | Continua normalmente                   |
 * | 4-6            | Opzioni: riduci/salta/continua         |
 * | 7              | Warning forte, ma scelta utente        |
 * | 8-10           | BLOCCO FORZATO - Solo skip/end         |
 *
 * FILOSOFIA:
 * - Non "HAI SBAGLIATO", ma "Ti proteggiamo"
 * - Sempre offrire via d'uscita (end session)
 * - Non bloccare MAI l'accesso all'app, solo all'esercizio
 *
 * @module severePainBlock
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type PainBlockAction = 'skip_exercise' | 'end_session';

export interface SeverePainBlockResult {
  isBlocked: true;
  painLevel: number;
  area: string;
  exerciseName: string;
  title: string;
  titleIt: string;
  message: string;
  messageIt: string;
  professionalMessage: string;
  professionalMessageIt: string;
  availableActions: PainBlockAction[];
  recommendedAction: PainBlockAction;
  timestamp: string;
}

export interface PainBlockCheck {
  shouldBlock: boolean;
  result: SeverePainBlockResult | null;
  warningLevel: 'none' | 'moderate' | 'strong' | 'blocked';
}

export interface BlockLogEntry {
  painLevel: number;
  area: string;
  exerciseName: string;
  timestamp: string;
  wasBlocked: boolean;
  actionTaken?: PainBlockAction;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Soglia per blocco HARD (nessuna opzione "continua")
 */
export const HARD_BLOCK_THRESHOLD = 8;

/**
 * Soglia per warning forte (ma scelta utente)
 */
export const STRONG_WARNING_THRESHOLD = 7;

/**
 * Etichette per le azioni disponibili nel blocco
 */
export const BLOCK_ACTION_LABELS: Record<PainBlockAction, {
  label: string;
  labelIt: string;
  description: string;
  descriptionIt: string;
  icon: string;
}> = {
  skip_exercise: {
    label: 'Skip this exercise',
    labelIt: 'Salta questo esercizio',
    description: 'Move to next exercise that doesn\'t involve this area',
    descriptionIt: 'Passa al prossimo esercizio che non coinvolge questa zona',
    icon: '⏭️'
  },
  end_session: {
    label: 'End session',
    labelIt: 'Termina sessione',
    description: 'Rest is part of training. Come back stronger!',
    descriptionIt: 'Il riposo fa parte dell\'allenamento. Torna più forte!',
    icon: '🏠'
  }
};

/**
 * Mappatura aree del corpo -> pattern/esercizi coinvolti
 */
const AREA_EXERCISE_MAP: Record<string, string[]> = {
  // Lower body
  'knee': ['squat', 'lunge', 'leg press', 'leg extension', 'leg curl', 'step', 'pistol', 'split'],
  'ginocchio': ['squat', 'lunge', 'leg press', 'leg extension', 'leg curl', 'step', 'pistol', 'split', 'affondi'],
  'hip': ['squat', 'deadlift', 'lunge', 'hip thrust', 'leg press', 'good morning', 'step'],
  'anca': ['squat', 'deadlift', 'lunge', 'hip thrust', 'leg press', 'good morning', 'step', 'stacco', 'affondi'],
  'lower_back': ['deadlift', 'squat', 'row', 'good morning', 'back extension', 'bent over'],
  'lombare': ['deadlift', 'squat', 'row', 'good morning', 'back extension', 'bent over', 'stacco', 'rematore'],
  'ankle': ['squat', 'lunge', 'calf', 'step', 'jump'],
  'caviglia': ['squat', 'lunge', 'calf', 'step', 'jump', 'affondi', 'polpacci'],

  // Upper body
  'shoulder': ['press', 'raise', 'fly', 'bench', 'dip', 'push', 'pull', 'row'],
  'spalla': ['press', 'raise', 'fly', 'bench', 'dip', 'push', 'pull', 'row', 'panca', 'alzate', 'croci', 'trazioni', 'rematore'],
  'elbow': ['curl', 'tricep', 'push', 'press', 'extension', 'dip'],
  'gomito': ['curl', 'tricep', 'push', 'press', 'extension', 'dip', 'french'],
  'wrist': ['curl', 'press', 'push', 'deadlift', 'row', 'pull'],
  'polso': ['curl', 'press', 'push', 'deadlift', 'row', 'pull', 'stacco', 'panca', 'rematore', 'trazioni'],

  // Core/Spine
  'upper_back': ['row', 'pull', 'deadlift', 'shrug'],
  'dorsale': ['row', 'pull', 'deadlift', 'shrug', 'rematore', 'trazioni', 'stacco'],
  'neck': ['shrug', 'press', 'deadlift'],
  'collo': ['shrug', 'press', 'deadlift', 'stacco', 'scrollate']
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Verifica se deve scattare il blocco per dolore severo
 *
 * @param painLevel - Livello dolore (1-10)
 * @param area - Area del corpo
 * @param exerciseName - Nome dell'esercizio corrente
 * @returns Check result con eventuale blocco
 */
export function checkSeverePainBlock(
  painLevel: number,
  area: string,
  exerciseName: string
): PainBlockCheck {
  // Sotto la soglia di warning -> nessun blocco
  if (painLevel < STRONG_WARNING_THRESHOLD) {
    return {
      shouldBlock: false,
      result: null,
      warningLevel: painLevel >= 4 ? 'moderate' : 'none'
    };
  }

  // Warning forte (7) ma non blocco
  if (painLevel === STRONG_WARNING_THRESHOLD) {
    return {
      shouldBlock: false,
      result: null,
      warningLevel: 'strong'
    };
  }

  // >= 8 = BLOCCO FORZATO
  const result: SeverePainBlockResult = {
    isBlocked: true,
    painLevel,
    area,
    exerciseName,
    title: `Exercise Stopped`,
    titleIt: `Esercizio Interrotto`,
    message: `You reported ${painLevel}/10 pain. For your safety, we've stopped this exercise. This is not a failure - it's smart training.`,
    messageIt: `Hai segnalato dolore ${painLevel}/10. Per la tua sicurezza, abbiamo interrotto questo esercizio. Non è un fallimento - è allenamento intelligente.`,
    professionalMessage: `Pain at this level (${painLevel}/10) requires attention. If it persists, consult a healthcare professional before your next session.`,
    professionalMessageIt: `Un dolore a questo livello (${painLevel}/10) richiede attenzione. Se persiste, consulta un professionista sanitario prima della prossima sessione.`,
    availableActions: ['skip_exercise', 'end_session'],
    recommendedAction: 'skip_exercise',
    timestamp: new Date().toISOString()
  };

  console.log(`[SEVERE_PAIN_BLOCK] Blocking ${exerciseName} - Pain ${painLevel}/10 in ${area}`);

  return {
    shouldBlock: true,
    result,
    warningLevel: 'blocked'
  };
}

/**
 * Verifica se un esercizio coinvolge un'area dolorante
 *
 * @param exerciseName - Nome esercizio
 * @param painArea - Area con dolore
 * @returns true se l'esercizio coinvolge l'area
 */
export function exerciseInvolvesArea(
  exerciseName: string,
  painArea: string
): boolean {
  const normalizedExercise = exerciseName.toLowerCase();
  const normalizedArea = painArea.toLowerCase();

  // Cerca l'area nelle chiavi della mappa
  const relevantPatterns = AREA_EXERCISE_MAP[normalizedArea] || [];

  // Se non troviamo l'area, proviamo alcune varianti comuni
  if (relevantPatterns.length === 0) {
    // Prova a cercare come sottostringa nelle chiavi
    for (const [key, patterns] of Object.entries(AREA_EXERCISE_MAP)) {
      if (key.includes(normalizedArea) || normalizedArea.includes(key)) {
        return patterns.some(pattern =>
          normalizedExercise.includes(pattern.toLowerCase())
        );
      }
    }
    return false;
  }

  return relevantPatterns.some(pattern =>
    normalizedExercise.includes(pattern.toLowerCase())
  );
}

/**
 * Filtra esercizi in base all'area dolorante
 *
 * @param exercises - Lista esercizi rimanenti
 * @param painArea - Area con dolore severo
 * @returns Oggetto con esercizi safe e skipped
 */
export function filterExercisesForPainArea<T extends { name: string }>(
  exercises: T[],
  painArea: string
): { safe: T[]; skipped: T[] } {
  const safe: T[] = [];
  const skipped: T[] = [];

  for (const exercise of exercises) {
    if (exerciseInvolvesArea(exercise.name, painArea)) {
      skipped.push(exercise);
    } else {
      safe.push(exercise);
    }
  }

  return { safe, skipped };
}

/**
 * Crea entry per il log del blocco
 */
export function createBlockLogEntry(
  result: SeverePainBlockResult,
  actionTaken?: PainBlockAction
): BlockLogEntry {
  return {
    painLevel: result.painLevel,
    area: result.area,
    exerciseName: result.exerciseName,
    timestamp: result.timestamp,
    wasBlocked: true,
    actionTaken
  };
}

/**
 * Genera messaggio per l'utente quando salta esercizi correlati
 */
export function getSkippedExercisesMessage(
  skippedExercises: { name: string }[],
  painArea: string,
  language: 'en' | 'it' = 'it'
): string | null {
  if (skippedExercises.length === 0) return null;

  const names = skippedExercises.map(e => e.name).join(', ');

  if (language === 'it') {
    return `Salteremo anche questi esercizi che coinvolgono ${painArea}: ${names}`;
  }

  return `We'll also skip these exercises involving ${painArea}: ${names}`;
}

/**
 * Verifica se il livello di dolore richiede un blocco hard
 * (utility function per check rapidi)
 */
export function isHardBlockLevel(painLevel: number): boolean {
  return painLevel >= HARD_BLOCK_THRESHOLD;
}

/**
 * Verifica se il livello di dolore richiede un warning forte
 */
export function isStrongWarningLevel(painLevel: number): boolean {
  return painLevel === STRONG_WARNING_THRESHOLD;
}

// ============================================================================
// MEDICAL RESTRICTIONS (Prescrizioni mediche - hard block)
// ============================================================================

import type { MedicalRestriction } from '../types/onboarding.types';

/** Espande arti interi nelle zone singole */
const LIMB_EXPANSION: Record<string, string[]> = {
  arm: ['shoulder', 'elbow', 'wrist'],
  leg: ['hip', 'knee', 'ankle'],
};

/** Espande le restrizioni mediche in zone singole */
export function expandMedicalRestrictions(restrictions: MedicalRestriction[]): string[] {
  if (!restrictions || restrictions.length === 0) return [];
  const areas = new Set<string>();
  for (const r of restrictions) {
    const expansion = LIMB_EXPANSION[r.area];
    if (expansion) expansion.forEach(a => areas.add(a));
    else areas.add(r.area);
  }
  return Array.from(areas);
}

/**
 * Mappa MEDICA per-esercizio: area → keywords bilingue (IT+EN)
 *
 * Diversa dalla AREA_EXERCISE_MAP del pain system:
 * - Include ENTRAMBE le lingue per ogni area
 * - Scientificamente accurata per PRESCRIZIONI MEDICHE
 *   (es. ginocchio NON include stacco/deadlift perché il ginocchio è quasi scarico)
 *
 * Fonti: anatomia funzionale - articolazioni primarie sotto carico significativo
 */
const MEDICAL_AREA_KEYWORDS: Record<string, string[]> = {
  // ═══ GINOCCHIO: Flessione/Estensione sotto carico ═══
  // Bloccati: squat, affondi, leg press, estensioni, curl gambe
  // NON bloccati: stacco/deadlift (ginocchio quasi statico), hip thrust, calf raise
  knee: [
    'squat', 'lunge', 'affondi', 'leg press', 'leg extension', 'leg curl',
    'step', 'pistol', 'split squat', 'bulgaro', 'pressa', 'sissy',
    'hack', 'goblet',
  ],

  // ═══ ANCA: Flessione/Estensione/Rotazione sotto carico ═══
  // Bloccati: squat, stacco, affondi, hip thrust, good morning
  // NON bloccati: leg extension, leg curl, calf raise
  hip: [
    'squat', 'deadlift', 'stacco', 'lunge', 'affondi', 'hip thrust',
    'leg press', 'pressa', 'good morning', 'step', 'bulgaro',
    'ponte', 'glute bridge', 'kick back', 'abductor', 'adductor',
  ],

  // ═══ CAVIGLIA: Dorsiflessione/Plantarflessione sotto carico ═══
  // Bloccati: squat (dorsiflessione), affondi, calf raise, salti
  // NON bloccati: leg press (piede fisso), leg curl/extension, stacco, hip thrust
  ankle: [
    'squat', 'lunge', 'affondi', 'calf', 'polpacci',
    'step', 'jump', 'salto', 'pistol', 'bulgaro', 'sissy',
  ],

  // ═══ LOMBARE: Carico assiale e flessione/estensione del tronco ═══
  // Bloccati: stacco, squat pesante, rematore, good morning, back extension
  // NON bloccati: leg press (supporto schiena), leg curl/ext, pressa, macchine guidate
  lower_back: [
    'deadlift', 'stacco', 'squat', 'row', 'rematore', 'good morning',
    'back extension', 'iperestensione', 'bent over', 'pendlay',
    'clean', 'snatch', 'swing',
  ],

  // ═══ SPALLA: Flessione/Abduzione/Rotazione sotto carico ═══
  // Bloccati: panca, press, alzate, croci, dip, push-up, trazioni, row
  // NON bloccati: lower body, core (plank OK se spalla non caricata)
  shoulder: [
    'press', 'panca', 'bench', 'raise', 'alzate', 'fly', 'croci',
    'dip', 'push', 'pull', 'trazioni', 'row', 'rematore',
    'lat', 'facepull', 'arnold', 'military', 'overhead',
  ],

  // ═══ GOMITO: Flessione/Estensione sotto carico ═══
  // Bloccati: curl, tricipiti, press, push-up, dip, trazioni
  // NON bloccati: alzate laterali (gomito fisso), lower body, core
  elbow: [
    'curl', 'tricep', 'french', 'press', 'panca', 'bench',
    'push', 'dip', 'extension', 'skull', 'pulldown',
    'pull', 'trazioni', 'row', 'rematore',
  ],

  // ═══ POLSO: Presa/Flessione/Estensione sotto carico ═══
  // Bloccati: press, curl, stacco (presa), push-up, trazioni
  // NON bloccati: macchine con maniglie, lower body
  wrist: [
    'curl', 'press', 'panca', 'bench', 'push', 'deadlift', 'stacco',
    'row', 'rematore', 'pull', 'trazioni', 'clean', 'snatch',
    'farmer', 'grip',
  ],

  // ═══ COLLO: Compressione cervicale ═══
  // Bloccati: scrollate, press overhead pesante, stacco pesante
  // NON bloccati: la maggior parte degli esercizi
  neck: [
    'shrug', 'scrollate', 'overhead press', 'military',
  ],
};

/**
 * Verifica se un esercizio è bloccato da una restrizione medica
 * Usa keyword matching bilingue (IT+EN) per accuratezza
 */
export function isExerciseBlockedByMedical(exerciseName: string, blockedAreas: string[]): boolean {
  if (!blockedAreas || blockedAreas.length === 0 || !exerciseName) return false;

  const name = exerciseName.toLowerCase();

  for (const area of blockedAreas) {
    const keywords = MEDICAL_AREA_KEYWORDS[area];
    if (!keywords) continue;
    if (keywords.some(kw => name.includes(kw))) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const SeverePainBlock = {
  check: checkSeverePainBlock,
  exerciseInvolvesArea,
  filterExercises: filterExercisesForPainArea,
  createLogEntry: createBlockLogEntry,
  getSkippedMessage: getSkippedExercisesMessage,
  isHardBlock: isHardBlockLevel,
  isStrongWarning: isStrongWarningLevel,
  HARD_THRESHOLD: HARD_BLOCK_THRESHOLD,
  STRONG_WARNING_THRESHOLD,
  ACTION_LABELS: BLOCK_ACTION_LABELS,
  // Medical restrictions
  expandMedicalRestrictions,
  isExerciseBlockedByMedical,
};

export default SeverePainBlock;
