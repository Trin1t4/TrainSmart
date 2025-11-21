/**
 * Exercise Mapping System
 * Conversione esercizi calisthenics/pesi liberi → varianti con macchine
 * Per principianti in palestra che preferiscono macchine guidate
 */

/**
 * Mappa esercizi bodyweight/free weights → machine variants
 * Usata quando trainingType === 'machines'
 */
export const MACHINE_EXERCISE_MAP: Record<string, string> = {
  // LOWER BODY
  'pistol': 'Leg Press',
  'pistol assistito': 'Leg Press',
  'pistol squat': 'Leg Press',
  'pistol squat assistito': 'Leg Press',
  'squat': 'Leg Press',
  'squat completo': 'Leg Press',
  'goblet squat': 'Leg Press',
  'box squat': 'Leg Press',
  'affondi': 'Leg Press',
  'bulgarian split squat': 'Leg Press',

  // LOWER PULL (Hamstrings/Glutes)
  'nordic curl': 'Leg Curl Machine',
  'romanian deadlift': 'Leg Curl Machine + Back Extension',
  'glute bridge': 'Hip Thrust Machine',

  // HORIZONTAL PUSH
  'push-up': 'Chest Press Machine',
  'push up': 'Chest Press Machine',
  'archer push-up': 'Chest Press Machine',
  'push-up standard': 'Chest Press Machine',
  'bench press': 'Chest Press Machine',

  // VERTICAL PUSH
  'pike push-up': 'Shoulder Press Machine',
  'pike push up': 'Shoulder Press Machine',
  'elevated pike push-up': 'Shoulder Press Machine',
  'hspu': 'Shoulder Press Machine',
  'handstand push-up': 'Shoulder Press Machine',
  'military press': 'Shoulder Press Machine',

  // VERTICAL PULL
  'pull-up': 'Lat Pulldown Machine',
  'pull up': 'Lat Pulldown Machine',
  'assisted pull-up': 'Lat Pulldown Machine',
  'inverted row': 'Seated Row Machine',

  // CORE (mantieni bodyweight - le macchine per core sono meno efficaci)
  'plank': 'Plank',
  'l-sit': 'Ab Crunch Machine',
  'dragon flag': 'Ab Crunch Machine'
};

/**
 * Converti esercizio in variante con macchine
 * @param exerciseName - Nome esercizio originale
 * @returns - Nome variante macchina o originale se non trovata
 */
export function convertToMachineVariant(exerciseName: string): string {
  const exerciseLower = exerciseName.toLowerCase();

  // Cerca match esatto
  if (MACHINE_EXERCISE_MAP[exerciseLower]) {
    return MACHINE_EXERCISE_MAP[exerciseLower];
  }

  // Cerca match parziale (es. "Pistol Squat Assistito" → contiene "pistol")
  for (const [key, machine] of Object.entries(MACHINE_EXERCISE_MAP)) {
    if (exerciseLower.includes(key)) {
      return machine;
    }
  }

  // Fallback: mantieni originale
  return exerciseName;
}
