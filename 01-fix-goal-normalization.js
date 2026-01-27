// ============================================================================
// FILE: api/lib/programGenerator.js
// SEZIONE: GOAL_NORMALIZATION (circa riga 10-35)
// AZIONE: SOSTITUISCI l'intero oggetto GOAL_NORMALIZATION
// ============================================================================

const GOAL_NORMALIZATION = {
  // Italian → English mapping
  'forza': 'strength',
  'ipertrofia': 'muscle_gain',
  'massa': 'muscle_gain',
  'massa_muscolare': 'muscle_gain',
  'dimagrimento': 'fat_loss',
  'perdita_peso': 'fat_loss',
  'tonificazione': 'toning',
  'resistenza': 'endurance',
  'performance': 'performance',
  'performance_sportiva': 'performance',
  'prestazioni_sportive': 'performance',
  'recupero_motorio': 'motor_recovery',
  'motor_recovery': 'motor_recovery',
  'generale': 'general_fitness',
  'fitness_generale': 'general_fitness',
  'general_fitness': 'general_fitness',
  
  // ✅ FIX BUG: Aggiunto benessere/wellness - MANCAVA!
  'benessere': 'general_fitness',
  'wellness': 'general_fitness',
  
  // ✅ FIX: Aggiunto corsa/running
  'corsa': 'endurance',
  'running': 'endurance',
  
  // Already correct (passthrough)
  'strength': 'strength',
  'muscle_gain': 'muscle_gain',
  'fat_loss': 'fat_loss',
  'toning': 'toning',
  'endurance': 'endurance',
  'disability': 'disability',
  'pregnancy': 'pregnancy'
};
