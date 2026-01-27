/**
 * MULTI-GOAL SUPPORT PATCH
 * 
 * Istruzioni per aggiornare il program generator per supportare multi-goal.
 * 
 * File da modificare:
 * - api/lib/programGenerator.js
 * - packages/web/src/components/Dashboard.tsx
 * - packages/web/src/lib/programGeneration/weeklySplitGenerator.ts
 */

// ============================================================================
// STEP 1: Aggiorna api/lib/programGenerator.js
// ============================================================================

/**
 * Aggiungi questo import all'inizio del file:
 */
// import { normalizeGoal, normalizeGoals, combineGoalConfigs, getGoalConfig } from '@trainsmart/shared';

/**
 * Modifica la funzione generateProgramAPI per accettare goals array:
 */

/*
// PRIMA (attuale):
function generateProgramAPI(input) {
  const { level, frequency, location, equipment, painAreas = [], assessments = [], goal, ... } = input;
  const normalizedGoal = normalizeGoal(goal);
  // ...
}

// DOPO (con multi-goal):
function generateProgramAPI(input) {
  const { 
    level, 
    frequency, 
    location, 
    equipment, 
    painAreas = [], 
    assessments = [], 
    goal,      // legacy single goal
    goals = [],  // NEW: array di goals
    ...rest 
  } = input;

  // Normalizza goals (supporta sia single che array)
  const normalizedGoals = goals.length > 0 
    ? normalizeGoals(goals) 
    : [normalizeGoal(goal)];
  
  // Usa il primo goal come principale per la logica di branching
  const primaryGoal = normalizedGoals[0];
  
  // Combina configurazioni se multi-goal
  const goalConfig = normalizedGoals.length > 1 
    ? combineGoalConfigs(normalizedGoals) 
    : getGoalConfig(primaryGoal);

  console.log('[PROGRAM] 🎯 Goals:', normalizedGoals, '→ Config:', goalConfig);

  // Passa goalConfig invece di goal singolo alle funzioni
  // ...
}
*/

// ============================================================================
// STEP 2: Funzione helper per combinare parametri
// ============================================================================

/**
 * Aggiungi questa funzione a programGenerator.js
 */
export function createExerciseWithMultiGoal(
  exerciseName: string,
  goalConfig: {
    repsRange: [number, number];
    setsRange: [number, number];
    restSeconds: [number, number];
    intensity: [number, number];
  },
  level: 'beginner' | 'intermediate' | 'advanced',
  baseWeight: number
): {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  weight: number | null;
} {
  const { repsRange, setsRange, restSeconds, intensity } = goalConfig;

  // Determina set/reps basandosi su level
  const levelMultiplier = {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.2
  }[level];

  const sets = Math.round(
    (setsRange[0] + setsRange[1]) / 2 * levelMultiplier
  );
  
  const repsMin = repsRange[0];
  const repsMax = repsRange[1];
  const reps = repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;

  const rest = Math.round((restSeconds[0] + restSeconds[1]) / 2);

  // Calcola peso basandosi su intensità media
  const avgIntensity = (intensity[0] + intensity[1]) / 2 / 100;
  const weight = baseWeight > 0 ? Math.round(baseWeight * avgIntensity / 2.5) * 2.5 : null;

  return {
    name: exerciseName,
    sets: Math.max(2, Math.min(6, sets)), // Clamp 2-6
    reps,
    rest,
    weight
  };
}

// ============================================================================
// STEP 3: Aggiorna Dashboard.tsx
// ============================================================================

/**
 * Modifica generateLocalProgram() nel Dashboard per passare goals array
 */

/*
// PRIMA:
function generateLocalProgram(level: string, goal: string, onboarding: any) {
  // ...
  const program = generateProgramWithSplit({
    level: finalLevel,
    goal: finalGoal,  // single goal
    // ...
  });
}

// DOPO:
function generateLocalProgram(level: string, goal: string, onboarding: any) {
  // Supporta multi-goal se presente nell'onboarding
  const goals = onboarding?.goals || [goal];
  
  const program = generateProgramWithSplit({
    level: finalLevel,
    goal: goals[0],        // primary goal (backward compat)
    goals: goals,          // NEW: full array
    // ...
  });
}
*/

// ============================================================================
// STEP 4: UI per selezione multi-goal
// ============================================================================

/**
 * Aggiorna GoalStep.tsx per permettere selezione multipla (max 2-3)
 * 
 * Aggiungi validazione:
 */

export function validateGoalSelection(goals: string[]): {
  valid: boolean;
  error?: string;
} {
  if (goals.length === 0) {
    return { valid: false, error: 'Seleziona almeno un obiettivo' };
  }

  if (goals.length > 3) {
    return { valid: false, error: 'Massimo 3 obiettivi selezionabili' };
  }

  // Verifica compatibilità
  if (goals.length >= 2) {
    // Import areGoalsCompatible from goalMapper
    // const { compatible, reason } = areGoalsCompatible(goals[0], goals[1]);
    // if (!compatible) return { valid: false, error: reason };
  }

  return { valid: true };
}

// ============================================================================
// STEP 5: Esempio di output multi-goal
// ============================================================================

/**
 * Esempio: Utente seleziona "Forza" + "Ipertrofia"
 * 
 * Config combinata (60% forza, 40% ipertrofia):
 * - repsRange: [3, 8] (media pesata)
 * - setsRange: [4, 5]
 * - restSeconds: [120, 180]
 * - intensity: [75, 88]
 * - emphasis: 'strength' (dal goal primario)
 * 
 * Risultato pratico nel programma:
 * - Primi esercizi composti: 4x4-6 @ 85% (forza)
 * - Esercizi successivi: 4x6-10 @ 75% (ipertrofia)
 * - Mix di approcci per ottimizzare entrambi gli obiettivi
 */

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * Test per verificare il multi-goal:
 */

/*
import { normalizeGoals, combineGoalConfigs } from './goalMapper';

// Test 1: Single goal (backward compat)
const single = normalizeGoals(['ipertrofia']);
console.assert(single.length === 1);
console.assert(single[0] === 'muscle_gain');

// Test 2: Multi-goal
const multi = normalizeGoals(['forza', 'ipertrofia']);
console.assert(multi.length === 2);
console.assert(multi[0] === 'strength');
console.assert(multi[1] === 'muscle_gain');

// Test 3: Config combinata
const config = combineGoalConfigs(['forza', 'ipertrofia']);
console.assert(config.repsRange[0] >= 2 && config.repsRange[0] <= 5);
console.assert(config.emphasis === 'strength'); // Dal primo goal

// Test 4: Deduplica
const dedup = normalizeGoals(['massa', 'ipertrofia', 'muscle_gain']);
console.assert(dedup.length === 1); // Tutti mappano a muscle_gain

console.log('✅ All multi-goal tests passed');
*/
