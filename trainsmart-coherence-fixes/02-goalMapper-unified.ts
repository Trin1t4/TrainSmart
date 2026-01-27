/**
 * GOAL MAPPER - UNIFIED
 * 
 * File: packages/shared/src/utils/goalMapper.ts
 * 
 * Single source of truth per il mapping dei goal tra:
 * - Onboarding (italiano)
 * - Database (italiano legacy)
 * - Program Generator (inglese canonical)
 * - Display (italiano user-friendly)
 * 
 * REGOLA: Usa sempre `normalizeGoal()` prima di passare un goal al generator.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Goal canonici usati internamente dal program generator
 */
export type CanonicalGoal =
  | 'strength'
  | 'muscle_gain'
  | 'fat_loss'
  | 'toning'
  | 'endurance'
  | 'general_fitness'
  | 'performance'
  | 'motor_recovery'
  | 'pregnancy'
  | 'postnatal'
  | 'disability';

/**
 * Goal come salvati in italiano nel database/onboarding
 */
export type ItalianGoal =
  | 'forza'
  | 'ipertrofia'
  | 'massa'
  | 'massa muscolare'
  | 'tonificazione'
  | 'dimagrimento'
  | 'resistenza'
  | 'benessere'
  | 'prestazioni_sportive'
  | 'sport_performance'
  | 'motor_recovery'
  | 'pre_partum'
  | 'post_partum'
  | 'disabilita';

// ============================================================================
// MAPPING TABLES
// ============================================================================

/**
 * Mappa italiano → canonical (inglese)
 */
const ITALIAN_TO_CANONICAL: Record<string, CanonicalGoal> = {
  // Fitness goals
  'forza': 'strength',
  'strength': 'strength',
  
  'ipertrofia': 'muscle_gain',
  'massa': 'muscle_gain',
  'massa muscolare': 'muscle_gain',
  'massa_muscolare': 'muscle_gain',
  'muscle_gain': 'muscle_gain',
  'hypertrophy': 'muscle_gain',
  
  'tonificazione': 'toning',
  'toning': 'toning',
  'tone': 'toning',
  
  'dimagrimento': 'fat_loss',
  'fat_loss': 'fat_loss',
  'weight_loss': 'fat_loss',
  'perdita_peso': 'fat_loss',
  
  'resistenza': 'endurance',
  'endurance': 'endurance',
  
  'benessere': 'general_fitness',
  'general_fitness': 'general_fitness',
  'fitness_generale': 'general_fitness',
  'wellbeing': 'general_fitness',
  
  // Sport/Performance
  'prestazioni_sportive': 'performance',
  'sport_performance': 'performance',
  'performance': 'performance',
  'athletic_performance': 'performance',
  
  // Health/Special needs
  'motor_recovery': 'motor_recovery',
  'recupero_motorio': 'motor_recovery',
  'rehabilitation': 'motor_recovery',
  'riabilitazione': 'motor_recovery',
  
  'pre_partum': 'pregnancy',
  'pregnancy': 'pregnancy',
  'gravidanza': 'pregnancy',
  
  'post_partum': 'postnatal',
  'postnatal': 'postnatal',
  'postpartum': 'postnatal',
  
  'disabilita': 'disability',
  'disability': 'disability',
};

/**
 * Mappa canonical → italiano (per display)
 */
const CANONICAL_TO_ITALIAN: Record<CanonicalGoal, string> = {
  'strength': 'Forza',
  'muscle_gain': 'Ipertrofia',
  'fat_loss': 'Dimagrimento',
  'toning': 'Tonificazione',
  'endurance': 'Resistenza',
  'general_fitness': 'Benessere Generale',
  'performance': 'Prestazioni Sportive',
  'motor_recovery': 'Recupero Motorio',
  'pregnancy': 'Gravidanza',
  'postnatal': 'Post-Partum',
  'disability': 'Adattato',
};

/**
 * Mappa canonical → emoji per UI
 */
const GOAL_EMOJIS: Record<CanonicalGoal, string> = {
  'strength': '💪',
  'muscle_gain': '🏋️',
  'fat_loss': '🔥',
  'toning': '✨',
  'endurance': '🏃',
  'general_fitness': '🌟',
  'performance': '⚡',
  'motor_recovery': '🏥',
  'pregnancy': '🤰',
  'postnatal': '👶',
  'disability': '♿',
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Normalizza qualsiasi goal al formato canonical (inglese)
 * 
 * @param goal - Goal in qualsiasi formato (italiano, inglese, mixed)
 * @returns Goal in formato canonical
 * @throws Error se il goal non è riconosciuto
 * 
 * @example
 * normalizeGoal('ipertrofia') // → 'muscle_gain'
 * normalizeGoal('forza') // → 'strength'
 * normalizeGoal('muscle_gain') // → 'muscle_gain' (già canonical)
 */
export function normalizeGoal(goal: string | undefined | null): CanonicalGoal {
  if (!goal) {
    console.warn('[GOAL_MAPPER] ⚠️ No goal provided, defaulting to muscle_gain');
    return 'muscle_gain';
  }

  // Normalizza: lowercase, trim, sostituisci spazi con underscore
  const normalized = goal.toLowerCase().trim().replace(/\s+/g, '_');

  const canonical = ITALIAN_TO_CANONICAL[normalized];

  if (!canonical) {
    console.warn(`[GOAL_MAPPER] ⚠️ Unknown goal: "${goal}", defaulting to muscle_gain`);
    return 'muscle_gain';
  }

  return canonical;
}

/**
 * Normalizza un array di goal
 * Rimuove duplicati e mantiene l'ordine
 * 
 * @param goals - Array di goal in qualsiasi formato
 * @returns Array di goal canonical senza duplicati
 */
export function normalizeGoals(goals: string[] | undefined | null): CanonicalGoal[] {
  if (!goals || goals.length === 0) {
    return ['muscle_gain'];
  }

  const normalized = goals.map(g => normalizeGoal(g));
  
  // Rimuovi duplicati mantenendo l'ordine
  return [...new Set(normalized)];
}

/**
 * Converti goal canonical in italiano per display
 * 
 * @param goal - Goal in formato canonical
 * @returns Nome italiano del goal
 */
export function goalToItalian(goal: CanonicalGoal): string {
  return CANONICAL_TO_ITALIAN[goal] || goal;
}

/**
 * Ottieni emoji per un goal
 */
export function getGoalEmoji(goal: CanonicalGoal): string {
  return GOAL_EMOJIS[goal] || '🎯';
}

/**
 * Formatta goal per display con emoji
 * 
 * @example
 * formatGoalDisplay('muscle_gain') // → '🏋️ Ipertrofia'
 */
export function formatGoalDisplay(goal: CanonicalGoal): string {
  return `${getGoalEmoji(goal)} ${goalToItalian(goal)}`;
}

// ============================================================================
// GOAL CONFIGURATION
// ============================================================================

/**
 * Configurazione parametri allenamento per goal
 */
export interface GoalConfig {
  repsRange: [number, number];
  setsRange: [number, number];
  restSeconds: [number, number];
  intensity: [number, number]; // % 1RM
  volumeMultiplier: number;
  includesCardio: boolean;
  cardioFrequency: number; // sessioni/settimana
  emphasis: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
}

/**
 * Configurazioni per ogni goal canonical
 */
export const GOAL_CONFIGS: Record<CanonicalGoal, GoalConfig> = {
  'strength': {
    repsRange: [1, 5],
    setsRange: [4, 6],
    restSeconds: [180, 300],
    intensity: [85, 95],
    volumeMultiplier: 0.8,
    includesCardio: false,
    cardioFrequency: 0,
    emphasis: 'strength'
  },
  'muscle_gain': {
    repsRange: [6, 12],
    setsRange: [3, 5],
    restSeconds: [60, 120],
    intensity: [65, 80],
    volumeMultiplier: 1.0,
    includesCardio: false,
    cardioFrequency: 0,
    emphasis: 'hypertrophy'
  },
  'fat_loss': {
    repsRange: [10, 15],
    setsRange: [3, 4],
    restSeconds: [30, 60],
    intensity: [50, 70],
    volumeMultiplier: 1.2,
    includesCardio: true,
    cardioFrequency: 3,
    emphasis: 'endurance'
  },
  'toning': {
    repsRange: [12, 20],
    setsRange: [2, 4],
    restSeconds: [45, 90],
    intensity: [50, 65],
    volumeMultiplier: 1.1,
    includesCardio: true,
    cardioFrequency: 2,
    emphasis: 'mixed'
  },
  'endurance': {
    repsRange: [15, 25],
    setsRange: [2, 3],
    restSeconds: [30, 60],
    intensity: [40, 60],
    volumeMultiplier: 1.3,
    includesCardio: true,
    cardioFrequency: 4,
    emphasis: 'endurance'
  },
  'general_fitness': {
    repsRange: [8, 15],
    setsRange: [2, 4],
    restSeconds: [60, 90],
    intensity: [55, 70],
    volumeMultiplier: 1.0,
    includesCardio: true,
    cardioFrequency: 2,
    emphasis: 'mixed'
  },
  'performance': {
    repsRange: [3, 8],
    setsRange: [3, 5],
    restSeconds: [120, 180],
    intensity: [70, 90],
    volumeMultiplier: 0.9,
    includesCardio: true,
    cardioFrequency: 2,
    emphasis: 'strength'
  },
  'motor_recovery': {
    repsRange: [10, 15],
    setsRange: [2, 3],
    restSeconds: [60, 120],
    intensity: [30, 50],
    volumeMultiplier: 0.6,
    includesCardio: false,
    cardioFrequency: 0,
    emphasis: 'mixed'
  },
  'pregnancy': {
    repsRange: [10, 15],
    setsRange: [2, 3],
    restSeconds: [60, 90],
    intensity: [40, 60],
    volumeMultiplier: 0.7,
    includesCardio: false,
    cardioFrequency: 0,
    emphasis: 'mixed'
  },
  'postnatal': {
    repsRange: [10, 15],
    setsRange: [2, 3],
    restSeconds: [60, 90],
    intensity: [40, 60],
    volumeMultiplier: 0.7,
    includesCardio: false,
    cardioFrequency: 1,
    emphasis: 'mixed'
  },
  'disability': {
    repsRange: [8, 15],
    setsRange: [2, 3],
    restSeconds: [90, 150],
    intensity: [40, 65],
    volumeMultiplier: 0.7,
    includesCardio: false,
    cardioFrequency: 0,
    emphasis: 'mixed'
  }
};

/**
 * Ottieni configurazione per un goal
 */
export function getGoalConfig(goal: string): GoalConfig {
  const canonical = normalizeGoal(goal);
  return GOAL_CONFIGS[canonical];
}

// ============================================================================
// MULTI-GOAL UTILITIES
// ============================================================================

/**
 * Combina configurazioni per multi-goal
 * Usa media pesata con priorità al primo goal
 * 
 * @param goals - Array di goal (primo = prioritario)
 * @returns Configurazione combinata
 */
export function combineGoalConfigs(goals: string[]): GoalConfig {
  const normalized = normalizeGoals(goals);
  
  if (normalized.length === 1) {
    return GOAL_CONFIGS[normalized[0]];
  }

  // Pesi: primo goal = 60%, secondo = 30%, terzo = 10%
  const weights = [0.6, 0.3, 0.1];
  
  const configs = normalized.map(g => GOAL_CONFIGS[g]);
  
  // Calcola medie pesate
  const combined: GoalConfig = {
    repsRange: [
      Math.round(configs.reduce((sum, c, i) => sum + c.repsRange[0] * (weights[i] || 0), 0)),
      Math.round(configs.reduce((sum, c, i) => sum + c.repsRange[1] * (weights[i] || 0), 0))
    ],
    setsRange: [
      Math.round(configs.reduce((sum, c, i) => sum + c.setsRange[0] * (weights[i] || 0), 0)),
      Math.round(configs.reduce((sum, c, i) => sum + c.setsRange[1] * (weights[i] || 0), 0))
    ],
    restSeconds: [
      Math.round(configs.reduce((sum, c, i) => sum + c.restSeconds[0] * (weights[i] || 0), 0)),
      Math.round(configs.reduce((sum, c, i) => sum + c.restSeconds[1] * (weights[i] || 0), 0))
    ],
    intensity: [
      Math.round(configs.reduce((sum, c, i) => sum + c.intensity[0] * (weights[i] || 0), 0)),
      Math.round(configs.reduce((sum, c, i) => sum + c.intensity[1] * (weights[i] || 0), 0))
    ],
    volumeMultiplier: configs.reduce((sum, c, i) => sum + c.volumeMultiplier * (weights[i] || 0), 0),
    includesCardio: configs.some(c => c.includesCardio),
    cardioFrequency: Math.round(configs.reduce((sum, c, i) => sum + c.cardioFrequency * (weights[i] || 0), 0)),
    emphasis: configs[0].emphasis // Usa l'emphasis del goal principale
  };

  return combined;
}

/**
 * Verifica se due goal sono compatibili per essere combinati
 */
export function areGoalsCompatible(goal1: string, goal2: string): { compatible: boolean; reason?: string } {
  const g1 = normalizeGoal(goal1);
  const g2 = normalizeGoal(goal2);

  // Goal identici
  if (g1 === g2) {
    return { compatible: false, reason: 'Stesso obiettivo selezionato due volte' };
  }

  // Combinazioni incompatibili
  const incompatible: [CanonicalGoal, CanonicalGoal, string][] = [
    ['strength', 'endurance', 'Forza massimale e resistenza richiedono adattamenti opposti'],
    ['fat_loss', 'muscle_gain', 'Dimagrimento e ipertrofia sono difficili da perseguire insieme'],
    ['pregnancy', 'strength', 'Durante la gravidanza si evitano carichi massimali'],
    ['motor_recovery', 'performance', 'Il recupero richiede approccio conservativo'],
  ];

  for (const [a, b, reason] of incompatible) {
    if ((g1 === a && g2 === b) || (g1 === b && g2 === a)) {
      return { compatible: false, reason };
    }
  }

  return { compatible: true };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  normalizeGoal,
  normalizeGoals,
  goalToItalian,
  getGoalEmoji,
  formatGoalDisplay,
  getGoalConfig,
  combineGoalConfigs,
  areGoalsCompatible,
  GOAL_CONFIGS,
};
