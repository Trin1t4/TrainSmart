/**
 * Mapping tra valori frontend (italiano) e backend (inglese)
 */

export const GOAL_MAPPING: Record<string, string> = {
  'forza': 'strength',
  'ipertrofia': 'muscle_gain',
  'tonificazione': 'muscle_gain',  // Tonificazione → muscle_gain
  'dimagrimento': 'fat_loss',
  'prestazioni_sportive': 'performance',
  'benessere': 'muscle_gain',  // Benessere → muscle_gain (default)
  'resistenza': 'fat_loss',     // Resistenza → fat_loss (cardio focus)
  'motor_recovery': 'motor_recovery',  // Già corretto
  'gravidanza': 'pregnancy',
  'disabilita': 'disability'
};

export const SPORT_MAPPING: Record<string, string> = {
  'calcio': 'calcio',
  'basket': 'basket',
  'pallavolo': 'pallavolo',
  'rugby': 'rugby',
  'tennis': 'tennis',
  'corsa': 'running',
  'nuoto': 'swimming',
  'ciclismo': 'cycling',
  'crossfit': 'crossfit',
  'powerlifting': 'powerlifting',
  'altro': 'other'
};

/**
 * Converte sportRole dal formato frontend al formato backend
 * Frontend: { sport: 'calcio', sportRole: 'Attaccante' }
 * Backend: { sport: 'calcio', role: 'attaccante' }
 */
export function mapSportRole(sport?: string, role?: string) {
  if (!sport || !role) return undefined;
  
  return {
    sport: SPORT_MAPPING[sport] || sport,
    role: role.toLowerCase()  // "Attaccante" → "attaccante"
  };
}

/**
 * Converte goal dal formato frontend al formato backend
 */
export function mapGoal(goal: string): string {
  return GOAL_MAPPING[goal] || 'muscle_gain';  // Default fallback
}

console.log('✅ Goal mappings loaded');
