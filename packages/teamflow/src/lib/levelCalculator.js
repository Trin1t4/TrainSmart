export function calculateLevelFromScore(score) {
  if (!score) return 'beginner';
  if (score >= 100) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'beginner';
}
