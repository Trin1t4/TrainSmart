/**
 * FIX 4: MULTI-GOAL VOLUME DISTRIBUTION
 * 
 * PROBLEMA: Il codice attuale logga "Volume distribution: 70-30" ma poi
 * non implementa effettivamente questa distribuzione. Tutti i goal vengono
 * trattati allo stesso modo.
 * 
 * SOLUZIONE:
 * 1. Implementare distribuzione reale del volume tra goal
 * 2. 2 goal: 70% primario, 30% secondario
 * 3. 3 goal: 50% primario, 30% secondario, 20% terziario
 * 4. Tradurre in parametri concreti (sets, reps, intensità)
 * 
 * COME APPLICARE:
 * 1. Importare questo modulo in weeklySplitGenerator.ts
 * 2. Chiamare distributeVolumeByGoals() prima di generare gli esercizi
 * 3. Usare i parametri risultanti per modificare createExercise()
 */

import { Goal, Level, Exercise, PatternId } from '../types';

// ============================================================
// TIPI
// ============================================================

interface GoalWeight {
  goal: Goal;
  weight: number; // 0-1 (percentuale)
  priority: 1 | 2 | 3;
}

interface VolumeModifiers {
  setsMultiplier: number;
  repsMultiplier: number;
  intensityOffset: number; // Offset percentuale (es: +5% o -5%)
  restMultiplier: number;
}

interface PatternVolumeAllocation {
  patternId: PatternId;
  primaryGoal: Goal;
  setsAllocated: number;
  intensityTarget: string;
  notes: string;
}

interface MultiGoalDistribution {
  goals: GoalWeight[];
  patternAllocations: Map<PatternId, PatternVolumeAllocation>;
  weeklySetsBudget: number;
  recommendations: string[];
}

// ============================================================
// CONFIGURAZIONE
// ============================================================

/**
 * Volume settimanale di riferimento (sets totali) per livello
 */
const WEEKLY_SETS_BUDGET: Record<Level, number> = {
  beginner: 40,      // ~13 sets/session × 3 sessions
  intermediate: 60,  // ~15 sets/session × 4 sessions
  advanced: 90,      // ~15 sets/session × 6 sessions
};

/**
 * Distribuzione percentuale per numero di goal
 */
const GOAL_WEIGHT_DISTRIBUTION: Record<number, number[]> = {
  1: [1.0],
  2: [0.70, 0.30],
  3: [0.50, 0.30, 0.20],
};

/**
 * Mapping goal → parametri volume preferiti
 */
const GOAL_VOLUME_PROFILES: Record<string, VolumeModifiers> = {
  // FORZA: meno reps, più intensità, più rest
  forza: {
    setsMultiplier: 1.0,
    repsMultiplier: 0.7,  // Reps più basse
    intensityOffset: 10,  // +10% intensità
    restMultiplier: 1.5,  // Più rest
  },
  strength: {
    setsMultiplier: 1.0,
    repsMultiplier: 0.7,
    intensityOffset: 10,
    restMultiplier: 1.5,
  },
  
  // IPERTROFIA: più volume, reps medie
  ipertrofia: {
    setsMultiplier: 1.2,  // Più sets
    repsMultiplier: 1.0,
    intensityOffset: 0,
    restMultiplier: 1.0,
  },
  hypertrophy: {
    setsMultiplier: 1.2,
    repsMultiplier: 1.0,
    intensityOffset: 0,
    restMultiplier: 1.0,
  },
  muscle_gain: {
    setsMultiplier: 1.2,
    repsMultiplier: 1.0,
    intensityOffset: 0,
    restMultiplier: 1.0,
  },
  
  // DIMAGRIMENTO: più reps, meno rest (densità)
  dimagrimento: {
    setsMultiplier: 1.0,
    repsMultiplier: 1.3,  // Reps più alte
    intensityOffset: -5,  // Meno intensità
    restMultiplier: 0.7,  // Meno rest
  },
  fat_loss: {
    setsMultiplier: 1.0,
    repsMultiplier: 1.3,
    intensityOffset: -5,
    restMultiplier: 0.7,
  },
  
  // RESISTENZA: molte reps, poco rest
  resistenza: {
    setsMultiplier: 0.9,
    repsMultiplier: 1.5,
    intensityOffset: -10,
    restMultiplier: 0.5,
  },
  endurance: {
    setsMultiplier: 0.9,
    repsMultiplier: 1.5,
    intensityOffset: -10,
    restMultiplier: 0.5,
  },
  
  // GENERALE: bilanciato
  generale: {
    setsMultiplier: 1.0,
    repsMultiplier: 1.0,
    intensityOffset: 0,
    restMultiplier: 1.0,
  },
  general_fitness: {
    setsMultiplier: 1.0,
    repsMultiplier: 1.0,
    intensityOffset: 0,
    restMultiplier: 1.0,
  },
  
  // SPORT: simile a forza ma con più enfasi su power
  prestazioni_sportive: {
    setsMultiplier: 0.9,
    repsMultiplier: 0.8,
    intensityOffset: 5,
    restMultiplier: 1.3,
  },
  sport_performance: {
    setsMultiplier: 0.9,
    repsMultiplier: 0.8,
    intensityOffset: 5,
    restMultiplier: 1.3,
  },
};

/**
 * Pattern prioritari per ogni goal
 * Usato per allocare volume extra ai pattern più rilevanti
 */
const GOAL_PRIORITY_PATTERNS: Record<string, PatternId[]> = {
  forza: ['lower_push', 'lower_pull', 'horizontal_push'],
  strength: ['lower_push', 'lower_pull', 'horizontal_push'],
  ipertrofia: ['horizontal_push', 'vertical_pull', 'lower_push'],
  hypertrophy: ['horizontal_push', 'vertical_pull', 'lower_push'],
  muscle_gain: ['horizontal_push', 'vertical_pull', 'lower_push'],
  dimagrimento: ['lower_push', 'lower_pull', 'core'],
  fat_loss: ['lower_push', 'lower_pull', 'core'],
  resistenza: ['lower_push', 'core', 'horizontal_push'],
  endurance: ['lower_push', 'core', 'horizontal_push'],
  generale: ['lower_push', 'horizontal_push', 'vertical_pull'],
  general_fitness: ['lower_push', 'horizontal_push', 'vertical_pull'],
  prestazioni_sportive: ['lower_push', 'lower_pull', 'core'],
  sport_performance: ['lower_push', 'lower_pull', 'core'],
};

// ============================================================
// FUNZIONI HELPER
// ============================================================

/**
 * Normalizza goal name (supporta sia italiano che inglese)
 */
function normalizeGoal(goal: string): string {
  return goal.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Ottieni profilo volume per goal
 */
function getGoalProfile(goal: string): VolumeModifiers {
  const normalized = normalizeGoal(goal);
  return GOAL_VOLUME_PROFILES[normalized] || GOAL_VOLUME_PROFILES.generale;
}

/**
 * Ottieni pattern prioritari per goal
 */
function getPriorityPatterns(goal: string): PatternId[] {
  const normalized = normalizeGoal(goal);
  return GOAL_PRIORITY_PATTERNS[normalized] || GOAL_PRIORITY_PATTERNS.generale;
}

// ============================================================
// FUNZIONE PRINCIPALE
// ============================================================

/**
 * Calcola la distribuzione del volume tra multipli goal
 * 
 * @param goals - Array di goal (max 3), il primo è il primario
 * @param level - Livello fitness utente
 * @param frequency - Giorni di allenamento per settimana
 * @returns Distribuzione con allocazioni per pattern e raccomandazioni
 */
export function calculateMultiGoalDistribution(
  goals: string[],
  level: Level,
  frequency: number
): MultiGoalDistribution {
  // Limita a max 3 goal
  const limitedGoals = goals.slice(0, 3);
  const numGoals = limitedGoals.length;
  
  console.log(`🎯 [MultiGoal] Calcolo distribuzione per ${numGoals} goal: ${limitedGoals.join(', ')}`);
  
  // 1. Calcola pesi per ogni goal
  const weights = GOAL_WEIGHT_DISTRIBUTION[numGoals] || [1.0];
  const goalWeights: GoalWeight[] = limitedGoals.map((goal, idx) => ({
    goal: goal as Goal,
    weight: weights[idx] || 0,
    priority: (idx + 1) as 1 | 2 | 3,
  }));
  
  // 2. Calcola budget settimanale totale
  const baseBudget = WEEKLY_SETS_BUDGET[level];
  const frequencyMultiplier = frequency / 4; // 4 è la frequenza "standard"
  const weeklySetsBudget = Math.round(baseBudget * frequencyMultiplier);
  
  console.log(`   📊 Budget settimanale: ${weeklySetsBudget} sets`);
  
  // 3. Alloca sets per pattern in base ai goal
  const allPatterns: PatternId[] = ['lower_push', 'lower_pull', 'horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'core'];
  const patternAllocations = new Map<PatternId, PatternVolumeAllocation>();
  
  // Sets base per pattern (distribuzione uniforme)
  const baseSetsPerPattern = Math.floor(weeklySetsBudget / allPatterns.length);
  
  for (const pattern of allPatterns) {
    let totalSets = baseSetsPerPattern;
    let dominantGoal = limitedGoals[0] as Goal;
    let intensityBonus = 0;
    
    // Calcola bonus per ogni goal
    for (const gw of goalWeights) {
      const priorityPatterns = getPriorityPatterns(gw.goal);
      const profile = getGoalProfile(gw.goal);
      
      if (priorityPatterns.includes(pattern)) {
        // Pattern prioritario per questo goal → bonus proporzionale al peso
        const bonus = Math.round(baseSetsPerPattern * 0.3 * gw.weight);
        totalSets += bonus;
        
        // Il goal con più peso determina intensità
        if (gw.priority === 1) {
          dominantGoal = gw.goal;
          intensityBonus = profile.intensityOffset;
        }
      }
    }
    
    // Cap per evitare overreaching
    totalSets = Math.min(totalSets, baseSetsPerPattern * 2);
    
    const baseIntensity = 70;
    const targetIntensity = Math.max(50, Math.min(90, baseIntensity + intensityBonus));
    
    patternAllocations.set(pattern, {
      patternId: pattern,
      primaryGoal: dominantGoal,
      setsAllocated: totalSets,
      intensityTarget: `${targetIntensity}%`,
      notes: `Goal primario: ${dominantGoal}`,
    });
  }
  
  // 4. Genera raccomandazioni
  const recommendations: string[] = [];
  
  if (numGoals > 1) {
    recommendations.push(`Focus primario su ${limitedGoals[0]} (${Math.round(weights[0] * 100)}% volume)`);
    recommendations.push(`Supporto per ${limitedGoals[1]} (${Math.round(weights[1] * 100)}% volume)`);
  }
  
  if (numGoals === 3) {
    recommendations.push(`Mantenimento ${limitedGoals[2]} (${Math.round(weights[2] * 100)}% volume)`);
    recommendations.push('⚠️ Con 3 goal, i progressi saranno più lenti su ciascuno');
  }
  
  // Goal conflittuali?
  const hasConflict = checkGoalConflicts(limitedGoals);
  if (hasConflict) {
    recommendations.push('⚠️ Goal parzialmente conflittuali - considera di prioritizzarne uno');
  }
  
  // Log allocazioni
  console.log('   📋 Allocazioni per pattern:');
  patternAllocations.forEach((alloc, pattern) => {
    console.log(`      ${pattern}: ${alloc.setsAllocated} sets @ ${alloc.intensityTarget}`);
  });
  
  return {
    goals: goalWeights,
    patternAllocations,
    weeklySetsBudget,
    recommendations,
  };
}

/**
 * Verifica se ci sono goal conflittuali
 */
function checkGoalConflicts(goals: string[]): boolean {
  const conflicts: [string, string][] = [
    ['forza', 'resistenza'],
    ['strength', 'endurance'],
    ['ipertrofia', 'dimagrimento'], // Solo parzialmente conflittuali
    ['hypertrophy', 'fat_loss'],
  ];
  
  for (const [a, b] of conflicts) {
    if (goals.includes(a) && goals.includes(b)) {
      return true;
    }
  }
  
  return false;
}

// ============================================================
// FUNZIONE: APPLICA DISTRIBUZIONE A ESERCIZIO
// ============================================================

/**
 * Modifica i parametri di un esercizio in base alla distribuzione multi-goal
 * 
 * @param exercise - Esercizio da modificare
 * @param distribution - Distribuzione calcolata
 * @returns Esercizio con parametri modificati
 */
export function applyMultiGoalToExercise(
  exercise: Exercise,
  distribution: MultiGoalDistribution
): Exercise {
  const allocation = distribution.patternAllocations.get(exercise.pattern as PatternId);
  
  if (!allocation) {
    return exercise;
  }
  
  // Calcola modificatori blended dai goal
  let setsMultiplier = 0;
  let repsMultiplier = 0;
  let restMultiplier = 0;
  
  for (const gw of distribution.goals) {
    const profile = getGoalProfile(gw.goal);
    setsMultiplier += profile.setsMultiplier * gw.weight;
    repsMultiplier += profile.repsMultiplier * gw.weight;
    restMultiplier += profile.restMultiplier * gw.weight;
  }
  
  // Applica modificatori
  const baseSets = typeof exercise.sets === 'number' ? exercise.sets : 3;
  const baseReps = typeof exercise.reps === 'number' 
    ? exercise.reps 
    : parseInt(String(exercise.reps).split('-')[0]) || 10;
  
  const newSets = Math.round(baseSets * setsMultiplier);
  const newReps = Math.round(baseReps * repsMultiplier);
  
  // Modifica rest
  const baseRestSeconds = parseRestToSeconds(exercise.rest);
  const newRestSeconds = Math.round(baseRestSeconds * restMultiplier);
  const newRest = formatSecondsToRest(newRestSeconds);
  
  return {
    ...exercise,
    sets: Math.max(2, Math.min(6, newSets)), // Cap 2-6 sets
    reps: Math.max(4, Math.min(20, newReps)), // Cap 4-20 reps
    rest: newRest,
    intensity: allocation.intensityTarget,
    notes: exercise.notes 
      ? `${exercise.notes} | ${allocation.notes}`
      : allocation.notes,
  };
}

/**
 * Parse rest string to seconds
 */
function parseRestToSeconds(rest: string): number {
  if (!rest) return 90;
  
  const lower = rest.toLowerCase();
  
  // "2-3min" → prendi il medio
  const rangeMatch = lower.match(/(\d+)-(\d+)\s*min/);
  if (rangeMatch) {
    return ((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2) * 60;
  }
  
  // "90s" o "90sec"
  const secMatch = lower.match(/(\d+)\s*s/);
  if (secMatch) {
    return parseInt(secMatch[1]);
  }
  
  // "2min"
  const minMatch = lower.match(/(\d+)\s*min/);
  if (minMatch) {
    return parseInt(minMatch[1]) * 60;
  }
  
  return 90; // Default
}

/**
 * Format seconds to rest string
 */
function formatSecondsToRest(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  if (seconds % 60 === 0) {
    return `${seconds / 60}min`;
  }
  
  return `${Math.round(seconds / 30) * 30}s`;
}

// ============================================================
// ESEMPIO DI INTEGRAZIONE
// ============================================================

/**
 * PRIMA (codice attuale):
 * ```typescript
 * if (goals && goals.length > 1) {
 *   console.log(`📊 Volume distribution: ${goals.length === 2 ? '70-30' : '40-30-30'}`);
 * }
 * // ...poi non fa nulla con questa info
 * ```
 * 
 * DOPO (nuovo codice):
 * ```typescript
 * // In generateWeeklySplit():
 * const multiGoalDistribution = goals && goals.length > 1
 *   ? calculateMultiGoalDistribution(goals, level, frequency)
 *   : null;
 * 
 * // In createExercise():
 * let exercise = createExerciseBase(...);
 * if (multiGoalDistribution) {
 *   exercise = applyMultiGoalToExercise(exercise, multiGoalDistribution);
 * }
 * ```
 */

// ============================================================
// EXPORT HELPER PER UI
// ============================================================

/**
 * Genera testo esplicativo per l'utente sulla distribuzione goal
 */
export function generateMultiGoalExplanation(
  distribution: MultiGoalDistribution,
  locale: 'it' | 'en' = 'it'
): string {
  const { goals, weeklySetsBudget, recommendations } = distribution;
  
  const lines: string[] = [];
  
  if (locale === 'it') {
    lines.push('📊 Distribuzione del Volume:');
    for (const gw of goals) {
      lines.push(`   • ${gw.goal}: ${Math.round(gw.weight * 100)}% del volume`);
    }
    lines.push('');
    lines.push(`📈 Volume settimanale totale: ~${weeklySetsBudget} serie`);
    lines.push('');
    if (recommendations.length > 0) {
      lines.push('💡 Raccomandazioni:');
      for (const rec of recommendations) {
        lines.push(`   ${rec}`);
      }
    }
  } else {
    lines.push('📊 Volume Distribution:');
    for (const gw of goals) {
      lines.push(`   • ${gw.goal}: ${Math.round(gw.weight * 100)}% of volume`);
    }
    lines.push('');
    lines.push(`📈 Weekly total volume: ~${weeklySetsBudget} sets`);
    lines.push('');
    if (recommendations.length > 0) {
      lines.push('💡 Recommendations:');
      for (const rec of recommendations) {
        lines.push(`   ${rec}`);
      }
    }
  }
  
  return lines.join('\n');
}
