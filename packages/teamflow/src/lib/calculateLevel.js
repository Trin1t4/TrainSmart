export function calculateLevelFromScore(score) {
  if (score >= 100) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'beginner';
}

export function saveQuizWithLevel(quizData) {
  const level = calculateLevelFromScore(quizData.score || 0);
  const dataWithLevel = {
    ...quizData,
    level: level
  };
  localStorage.setItem('quiz_data', JSON.stringify(dataWithLevel));
  return dataWithLevel;
}
