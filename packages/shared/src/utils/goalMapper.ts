/**
 * ============================================================================
 * UNIFIED GOAL MAPPER - SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * Questo file è l'UNICA fonte per il mapping dei goal in tutto il progetto.
 *
 * IMPORTANTE:
 * - NON creare altri file di mapping goal
 * - Tutti gli import devono puntare qui
 * - I file deprecati sono stati rimossi o reindirizzati
 *
 * @module goalMapper
 * @version 3.0.0 (Unified)
 */

import type { Goal } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Goal canonici usati internamente (inglese per codice)
 */
export type CanonicalGoal =
  | 'strength'
  | 'hypertrophy'
  | 'toning'
  | 'fat_loss'
  | 'endurance'
  | 'sport_performance'
  | 'wellness'
  | 'motor_recovery'
  | 'prenatal'
  | 'postnatal'
  | 'disability';

/**
 * Goal per il database (italiano per UI e persistenza)
 */
export type DatabaseGoal =
  | 'forza'
  | 'ipertrofia'
  | 'tonificazione'
  | 'dimagrimento'
  | 'resistenza'
  | 'prestazioni_sportive'
  | 'benessere'
  | 'motor_recovery'
  | 'pre_partum'
  | 'post_partum'
  | 'disabilita';

/**
 * Goal per il programGenerator (backend API)
 */
export type ProgramGoal =
  | 'strength'
  | 'muscle_gain'
  | 'fat_loss'
  | 'endurance'
  | 'performance'
  | 'motor_recovery'
  | 'pregnancy'
  | 'disability';

export interface GoalConfig {
  canonical: CanonicalGoal;
  database: DatabaseGoal;
  program: ProgramGoal;
  displayKey: string;
  icon: string;
  color: string;
  category: 'fitness' | 'health' | 'sport' | 'special';
  // Training parameters
  primaryRep: number;
  repRange: [number, number];
  restSeconds: [number, number];
  sets: number;
  targetRIR: number;
  intensity: number;
  volumeMultiplier: number;
  // DUP parameters
  dupBias: {
    heavy: number;
    moderate: number;
    volume: number;
  };
  // Safety parameters
  allowHeavyDays: boolean;
  maxIntensityBeginner: 'moderate' | 'volume';
  requiresMedicalClearance: boolean;
}

// ============================================================================
// GOAL CONFIGURATIONS - SINGLE SOURCE OF TRUTH
// ============================================================================

export const GOAL_CONFIGS: Record<CanonicalGoal, GoalConfig> = {
  strength: {
    canonical: 'strength',
    database: 'forza',
    program: 'strength',
    displayKey: 'goals.strength',
    icon: '💪',
    color: '#FF6B6B',
    category: 'fitness',
    primaryRep: 5,
    repRange: [3, 6],
    restSeconds: [180, 300],
    sets: 5,
    targetRIR: 2,
    intensity: 85,
    volumeMultiplier: 0.8,
    dupBias: { heavy: 0.4, moderate: 0.35, volume: 0.25 },
    allowHeavyDays: true,
    maxIntensityBeginner: 'moderate',
    requiresMedicalClearance: false
  },

  hypertrophy: {
    canonical: 'hypertrophy',
    database: 'ipertrofia',
    program: 'muscle_gain',
    displayKey: 'goals.hypertrophy',
    icon: '🏋️',
    color: '#4ECDC4',
    category: 'fitness',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [90, 120],
    sets: 4,
    targetRIR: 2,
    intensity: 75,
    volumeMultiplier: 1.0,
    dupBias: { heavy: 0.3, moderate: 0.4, volume: 0.3 },
    allowHeavyDays: true,
    maxIntensityBeginner: 'moderate',
    requiresMedicalClearance: false
  },

  toning: {
    canonical: 'toning',
    database: 'tonificazione',
    program: 'muscle_gain',  // IMPORTANTE: toning usa muscle_gain nel backend
    displayKey: 'goals.toning',
    icon: '✨',
    color: '#9B59B6',
    category: 'fitness',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 3,
    targetRIR: 3,
    intensity: 65,
    volumeMultiplier: 0.9,
    dupBias: { heavy: 0.25, moderate: 0.35, volume: 0.4 },
    allowHeavyDays: false,  // NO heavy days per toning
    maxIntensityBeginner: 'moderate',
    requiresMedicalClearance: false
  },

  fat_loss: {
    canonical: 'fat_loss',
    database: 'dimagrimento',
    program: 'fat_loss',
    displayKey: 'goals.fat_loss',
    icon: '🔥',
    color: '#E74C3C',
    category: 'fitness',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [45, 75],
    sets: 3,
    targetRIR: 3,
    intensity: 65,
    volumeMultiplier: 1.1,
    dupBias: { heavy: 0.25, moderate: 0.35, volume: 0.4 },
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: false
  },

  endurance: {
    canonical: 'endurance',
    database: 'resistenza',
    program: 'endurance',
    displayKey: 'goals.endurance',
    icon: '🏃',
    color: '#3498DB',
    category: 'fitness',
    primaryRep: 15,
    repRange: [12, 20],
    restSeconds: [30, 60],
    sets: 3,
    targetRIR: 3,
    intensity: 60,
    volumeMultiplier: 1.2,
    dupBias: { heavy: 0.2, moderate: 0.3, volume: 0.5 },
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: false
  },

  sport_performance: {
    canonical: 'sport_performance',
    database: 'prestazioni_sportive',
    program: 'performance',
    displayKey: 'goals.sport_performance',
    icon: '🏆',
    color: '#F39C12',
    category: 'sport',
    primaryRep: 6,
    repRange: [4, 8],
    restSeconds: [120, 180],
    sets: 4,
    targetRIR: 2,
    intensity: 80,
    volumeMultiplier: 0.9,
    dupBias: { heavy: 0.35, moderate: 0.4, volume: 0.25 },
    allowHeavyDays: true,
    maxIntensityBeginner: 'moderate',
    requiresMedicalClearance: false
  },

  wellness: {
    canonical: 'wellness',
    database: 'benessere',
    program: 'muscle_gain',  // Wellness usa muscle_gain con parametri soft
    displayKey: 'goals.wellness',
    icon: '🧘',
    color: '#2ECC71',
    category: 'health',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 3,
    targetRIR: 4,
    intensity: 55,
    volumeMultiplier: 0.7,
    dupBias: { heavy: 0.15, moderate: 0.35, volume: 0.5 },
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: false
  },

  motor_recovery: {
    canonical: 'motor_recovery',
    database: 'motor_recovery',
    program: 'motor_recovery',
    displayKey: 'goals.motor_recovery',
    icon: '🔄',
    color: '#1ABC9C',
    category: 'special',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [90, 120],
    sets: 2,
    targetRIR: 4,
    intensity: 40,
    volumeMultiplier: 0.5,
    dupBias: { heavy: 0.0, moderate: 0.3, volume: 0.7 },  // NO heavy mai
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: true  // Richiede ok medico
  },

  prenatal: {
    canonical: 'prenatal',
    database: 'pre_partum',
    program: 'pregnancy',
    displayKey: 'goals.prenatal',
    icon: '🤰',
    color: '#FFC0CB',
    category: 'special',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 2,
    targetRIR: 4,
    intensity: 50,
    volumeMultiplier: 0.6,
    dupBias: { heavy: 0.0, moderate: 0.2, volume: 0.8 },  // NO heavy mai
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: true
  },

  postnatal: {
    canonical: 'postnatal',
    database: 'post_partum',
    program: 'pregnancy',  // Usa stesso backend di pregnancy
    displayKey: 'goals.postnatal',
    icon: '👶',
    color: '#87CEEB',
    category: 'special',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 3,
    targetRIR: 3,
    intensity: 55,
    volumeMultiplier: 0.7,
    dupBias: { heavy: 0.0, moderate: 0.3, volume: 0.7 },
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: true
  },

  disability: {
    canonical: 'disability',
    database: 'disabilita',
    program: 'disability',
    displayKey: 'goals.disability',
    icon: '♿',
    color: '#5DADE2',
    category: 'special',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [90, 120],
    sets: 2,
    targetRIR: 4,
    intensity: 45,
    volumeMultiplier: 0.5,
    dupBias: { heavy: 0.0, moderate: 0.3, volume: 0.7 },
    allowHeavyDays: false,
    maxIntensityBeginner: 'volume',
    requiresMedicalClearance: true
  }
};

// ============================================================================
// UNIFIED ALIAS MAPPING - Tutti i possibili input mappati al canonico
// ============================================================================

const GOAL_ALIASES: Record<string, CanonicalGoal> = {
  // === ITALIANO ===
  'forza': 'strength',
  'ipertrofia': 'hypertrophy',
  'massa': 'hypertrophy',
  'massa muscolare': 'hypertrophy',
  'tonificazione': 'toning',
  'dimagrimento': 'fat_loss',
  'perdita peso': 'fat_loss',
  'resistenza': 'endurance',
  'prestazioni_sportive': 'sport_performance',
  'prestazioni sportive': 'sport_performance',
  'benessere': 'wellness',
  'motor_recovery': 'motor_recovery',
  'recupero_motorio': 'motor_recovery',
  'recupero motorio': 'motor_recovery',
  'pre_partum': 'prenatal',
  'gravidanza': 'prenatal',
  'post_partum': 'postnatal',
  'postpartum': 'postnatal',
  'disabilita': 'disability',
  'disabilità': 'disability',

  // === ENGLISH ===
  'strength': 'strength',
  'hypertrophy': 'hypertrophy',
  'muscle_gain': 'hypertrophy',
  'muscle_mass': 'hypertrophy',
  'toning': 'toning',
  'fat_loss': 'fat_loss',
  'weight_loss': 'fat_loss',
  'endurance': 'endurance',
  'general_fitness': 'endurance',
  'sport_performance': 'sport_performance',
  'performance': 'sport_performance',
  'wellness': 'wellness',
  'prenatal': 'prenatal',
  'pregnancy': 'prenatal',
  'postnatal': 'postnatal',
  'disability': 'disability',

  // === LEGACY/VECCHI MAPPING ===
  'massa_muscolare': 'hypertrophy',
  'definizione': 'fat_loss',
  'conditioning': 'fat_loss',
  'generale': 'wellness',
  'general': 'wellness',
};

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converte qualsiasi valore goal al formato CANONICO (interno)
 * SEMPRE usare questo per normalizzare l'input
 */
export function toCanonicalGoal(goal: string | Goal | null | undefined): CanonicalGoal {
  if (!goal) {
    console.warn('[GoalMapper] Empty goal, defaulting to hypertrophy');
    return 'hypertrophy';
  }

  const normalized = String(goal).toLowerCase().trim();
  const canonical = GOAL_ALIASES[normalized];

  if (!canonical) {
    console.warn(`[GoalMapper] Unknown goal "${goal}", defaulting to hypertrophy`);
    return 'hypertrophy';
  }

  return canonical;
}

/**
 * Converte al formato DATABASE (italiano per Supabase/UI)
 */
export function toDatabaseGoal(goal: string | Goal): DatabaseGoal {
  const canonical = toCanonicalGoal(goal);
  return GOAL_CONFIGS[canonical].database;
}

/**
 * Converte al formato PROGRAM (per programGenerator backend)
 * QUESTO È IL MAPPING CRITICO CHE ERA INCONSISTENTE
 */
export function toProgramGoal(goal: string | Goal): ProgramGoal {
  const canonical = toCanonicalGoal(goal);
  return GOAL_CONFIGS[canonical].program;
}

/**
 * Ottieni configurazione completa per un goal
 */
export function getGoalConfig(goal: string | Goal): GoalConfig {
  const canonical = toCanonicalGoal(goal);
  return GOAL_CONFIGS[canonical];
}

/**
 * Ottieni i parametri DUP per un goal
 */
export function getDupBias(goal: string | Goal): GoalConfig['dupBias'] {
  const config = getGoalConfig(goal);
  return config.dupBias;
}

/**
 * Verifica se un goal permette heavy days
 */
export function allowsHeavyDays(goal: string | Goal): boolean {
  const config = getGoalConfig(goal);
  return config.allowHeavyDays;
}

/**
 * Ottieni l'intensità massima permessa per un beginner
 */
export function getMaxIntensityForBeginner(goal: string | Goal): 'moderate' | 'volume' {
  const config = getGoalConfig(goal);
  return config.maxIntensityBeginner;
}

/**
 * Verifica se richiede clearance medica
 */
export function requiresMedicalClearance(goal: string | Goal): boolean {
  const config = getGoalConfig(goal);
  return config.requiresMedicalClearance;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Verifica se un valore è un goal valido
 */
export function isValidGoal(goal: string): boolean {
  const normalized = goal.toLowerCase().trim();
  return normalized in GOAL_ALIASES;
}

/**
 * Ottieni tutti i goal disponibili (canonici)
 */
export function getAllGoals(): CanonicalGoal[] {
  return Object.keys(GOAL_CONFIGS) as CanonicalGoal[];
}

/**
 * Ottieni tutti i valori goal validi (tutti gli alias)
 */
export function getAllValidGoals(): string[] {
  return Object.keys(GOAL_ALIASES);
}

/**
 * Ottieni solo i goal canonici
 */
export function getCanonicalGoals(): CanonicalGoal[] {
  return Object.keys(GOAL_CONFIGS) as CanonicalGoal[];
}

/**
 * Ottieni goal per categoria
 */
export function getGoalsByCategory(category: GoalConfig['category']): CanonicalGoal[] {
  return Object.entries(GOAL_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .map(([key]) => key as CanonicalGoal);
}

// ============================================================================
// TRAINING PARAMETER HELPERS
// ============================================================================

/**
 * Ottieni rep range per un goal
 */
export function getRepRangeForGoal(goal: string | Goal): [number, number] {
  return getGoalConfig(goal).repRange;
}

/**
 * Ottieni tempo di rest per un goal
 */
export function getRestTimeForGoal(goal: string | Goal): string {
  const [min, max] = getGoalConfig(goal).restSeconds;
  if (min === max) return `${min}s`;
  if (max >= 180) return `${Math.round(min / 60)}-${Math.round(max / 60)}min`;
  return `${min}-${max}s`;
}

/**
 * Ottieni numero di set per un goal
 */
export function getSetsForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).sets;
}

/**
 * Ottieni RIR target per un goal
 */
export function getRIRForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).targetRIR;
}

/**
 * Ottieni intensita % per un goal
 */
export function getIntensityForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).intensity;
}

/**
 * Ottieni raccomandazione volume settimanale
 */
export function getVolumeRecommendation(goal: string | Goal, level: string): {
  setsPerMuscle: number;
  totalWeeklySets: number;
} {
  const config = getGoalConfig(goal);

  // Base sets per muscle group per week
  const baseSets = level === 'beginner' ? 10 : level === 'intermediate' ? 15 : 20;
  const adjustedSets = Math.round(baseSets * config.volumeMultiplier);

  return {
    setsPerMuscle: adjustedSets,
    totalWeeklySets: adjustedSets * 6 // ~6 major muscle groups
  };
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migra un valore goal legacy al formato corretto
 */
export function migrateGoalValue(oldValue: string): {
  canonical: CanonicalGoal;
  database: DatabaseGoal;
  program: ProgramGoal;
  wasLegacy: boolean;
} {
  const canonical = toCanonicalGoal(oldValue);
  const database = toDatabaseGoal(oldValue);
  const program = toProgramGoal(oldValue);

  // Check if it was a legacy value
  const normalized = oldValue.toLowerCase().trim();
  const wasLegacy = !Object.values(GOAL_CONFIGS).some(
    c => c.canonical === normalized || c.database === normalized
  );

  return { canonical, database, program, wasLegacy };
}

// ============================================================================
// MULTI-GOAL SUPPORT
// ============================================================================

/**
 * Alias per toCanonicalGoal - per retrocompatibilità
 */
export function normalizeGoal(goal: string | Goal | null | undefined): CanonicalGoal {
  return toCanonicalGoal(goal);
}

/**
 * Normalizza un array di goals al formato canonico
 * Rimuove duplicati e invalid goals
 */
export function normalizeGoals(goals: (string | Goal | null | undefined)[]): CanonicalGoal[] {
  if (!goals || !Array.isArray(goals)) return ['hypertrophy'];

  const normalized = goals
    .filter(g => g != null && g !== '')
    .map(g => toCanonicalGoal(g))
    .filter((g, i, arr) => arr.indexOf(g) === i); // rimuovi duplicati

  return normalized.length > 0 ? normalized : ['hypertrophy'];
}

/**
 * Verifica se due goals sono compatibili tra loro
 * Goals speciali (pregnancy, disability, recovery) non sono compatibili con goals fitness intensi
 */
export function areGoalsCompatible(goal1: string | Goal, goal2: string | Goal): boolean {
  const c1 = toCanonicalGoal(goal1);
  const c2 = toCanonicalGoal(goal2);

  const config1 = GOAL_CONFIGS[c1];
  const config2 = GOAL_CONFIGS[c2];

  // Goals speciali non compatibili con fitness ad alta intensità
  const specialGoals: CanonicalGoal[] = ['prenatal', 'postnatal', 'disability', 'motor_recovery'];
  const highIntensityGoals: CanonicalGoal[] = ['strength', 'sport_performance'];

  if (specialGoals.includes(c1) && highIntensityGoals.includes(c2)) return false;
  if (specialGoals.includes(c2) && highIntensityGoals.includes(c1)) return false;

  // Goals della stessa categoria sono sempre compatibili
  if (config1.category === config2.category) return true;

  // Fitness + Sport sono compatibili
  if (['fitness', 'sport'].includes(config1.category) && ['fitness', 'sport'].includes(config2.category)) {
    return true;
  }

  // Health può combinarsi con fitness (es: wellness + hypertrophy leggera)
  if (config1.category === 'health' || config2.category === 'health') {
    // Ma non con goals ad alta intensità
    if (highIntensityGoals.includes(c1) || highIntensityGoals.includes(c2)) return false;
    return true;
  }

  return true;
}

/**
 * Combina le configurazioni di più goals in una configurazione media
 * Utile per programmi multi-obiettivo
 */
export function combineGoalConfigs(goals: (string | Goal)[]): GoalConfig {
  const canonicalGoals = normalizeGoals(goals);

  // Se un solo goal, ritorna la sua config
  if (canonicalGoals.length === 1) {
    return GOAL_CONFIGS[canonicalGoals[0]];
  }

  const configs = canonicalGoals.map(g => GOAL_CONFIGS[g]);
  const n = configs.length;

  // Media ponderata dei parametri
  const avgPrimaryRep = Math.round(configs.reduce((sum, c) => sum + c.primaryRep, 0) / n);
  const avgRepRange: [number, number] = [
    Math.round(configs.reduce((sum, c) => sum + c.repRange[0], 0) / n),
    Math.round(configs.reduce((sum, c) => sum + c.repRange[1], 0) / n)
  ];
  const avgRestSeconds: [number, number] = [
    Math.round(configs.reduce((sum, c) => sum + c.restSeconds[0], 0) / n),
    Math.round(configs.reduce((sum, c) => sum + c.restSeconds[1], 0) / n)
  ];
  const avgSets = Math.round(configs.reduce((sum, c) => sum + c.sets, 0) / n);
  const avgRIR = Math.round(configs.reduce((sum, c) => sum + c.targetRIR, 0) / n);
  const avgIntensity = Math.round(configs.reduce((sum, c) => sum + c.intensity, 0) / n);
  const avgVolumeMult = configs.reduce((sum, c) => sum + c.volumeMultiplier, 0) / n;

  // DUP bias medio
  const avgDupBias = {
    heavy: configs.reduce((sum, c) => sum + c.dupBias.heavy, 0) / n,
    moderate: configs.reduce((sum, c) => sum + c.dupBias.moderate, 0) / n,
    volume: configs.reduce((sum, c) => sum + c.dupBias.volume, 0) / n
  };

  // Safety: se anche uno solo richiede medical clearance, tutti lo richiedono
  const requiresMedical = configs.some(c => c.requiresMedicalClearance);
  // Heavy days permessi solo se TUTTI i goals li permettono
  const allowHeavy = configs.every(c => c.allowHeavyDays);
  // Max intensity beginner: il più conservativo
  const maxIntBeginner = configs.some(c => c.maxIntensityBeginner === 'volume') ? 'volume' : 'moderate';

  // Usa il primo goal come "primario" per i metadati
  const primaryConfig = configs[0];

  return {
    canonical: primaryConfig.canonical,
    database: primaryConfig.database,
    program: primaryConfig.program,
    displayKey: `goals.combined.${canonicalGoals.join('_')}`,
    icon: primaryConfig.icon,
    color: primaryConfig.color,
    category: primaryConfig.category,
    primaryRep: avgPrimaryRep,
    repRange: avgRepRange,
    restSeconds: avgRestSeconds,
    sets: avgSets,
    targetRIR: avgRIR,
    intensity: avgIntensity,
    volumeMultiplier: avgVolumeMult,
    dupBias: avgDupBias,
    allowHeavyDays: allowHeavy,
    maxIntensityBeginner: maxIntBeginner,
    requiresMedicalClearance: requiresMedical
  };
}

/**
 * Ottieni suggerimenti di goal compatibili con quello dato
 */
export function getSuggestedCombinations(goal: string | Goal): CanonicalGoal[] {
  const canonical = toCanonicalGoal(goal);

  return getAllGoals().filter(g =>
    g !== canonical && areGoalsCompatible(canonical, g)
  );
}

// ============================================================================
// BACKWARD COMPATIBILITY - Deprecati ma mantenuti per transizione
// ============================================================================

/**
 * @deprecated Usa toProgramGoal() invece
 */
export function mapGoal(goal: string): string {
  console.warn('[GoalMapper] mapGoal() is deprecated, use toProgramGoal()');
  return toProgramGoal(goal);
}

/**
 * @deprecated Usa toCanonicalGoal() invece
 */
export const GOAL_MAP = new Proxy({} as Record<string, string>, {
  get(_, prop: string) {
    console.warn('[GoalMapper] GOAL_MAP is deprecated, use toCanonicalGoal()');
    return toProgramGoal(prop);
  }
});

/**
 * @deprecated Usa GOAL_ALIASES invece
 */
export const GOAL_MAPPING = GOAL_ALIASES;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  toCanonicalGoal,
  toDatabaseGoal,
  toProgramGoal,
  getGoalConfig,
  getDupBias,
  allowsHeavyDays,
  getMaxIntensityForBeginner,
  requiresMedicalClearance,
  isValidGoal,
  getAllGoals,
  getGoalsByCategory,
  // Multi-goal support
  normalizeGoal,
  normalizeGoals,
  areGoalsCompatible,
  combineGoalConfigs,
  getSuggestedCombinations,
  GOAL_CONFIGS,
  GOAL_ALIASES
};
