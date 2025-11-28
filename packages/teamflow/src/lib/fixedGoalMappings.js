export const GOAL_MAP = {
  'forza': 'strength',
  'massa': 'muscle_gain',
  'definizione': 'fat_loss',
  'resistenza': 'endurance',
  'muscle_gain': 'muscle_gain',
  'fat_loss': 'fat_loss',
  'strength': 'strength',
  'endurance': 'endurance'
};

export function mapGoal(goal) {
  if (!goal) return 'muscle_gain';
  const mapped = GOAL_MAP[goal.toLowerCase()] || goal;
  console.log(`[GOAL MAPPING] ${goal} → ${mapped}`);
  return mapped;
}
