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
  // LOWER BODY - English
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
  'back squat': 'Leg Press',
  'front squat': 'Leg Press',
  'hack squat': 'Hack Squat Machine',
  'leg extension': 'Leg Extension Machine',
  'lunge': 'Leg Press',

  // LOWER BODY - Italian
  'squat con bilanciere': 'Leg Press',
  'squat con manubri': 'Leg Press',
  'squat frontale': 'Leg Press',
  'squat sumo': 'Leg Press',
  'pressa': 'Leg Press',
  'affondi con manubri': 'Leg Press',

  // LOWER PULL - English
  'nordic curl': 'Leg Curl Machine',
  'romanian deadlift': 'Leg Curl Machine',
  'glute bridge': 'Hip Thrust Machine',
  'deadlift': 'Leg Curl Machine',
  'hip thrust': 'Hip Thrust Machine',
  'good morning': 'Back Extension Machine',
  'rdl': 'Leg Curl Machine',

  // LOWER PULL - Italian
  'stacco rumeno': 'Leg Curl Machine',
  'stacco con bilanciere': 'Leg Curl Machine',
  'stacco con trap bar': 'Leg Curl Machine',
  'stacco': 'Leg Curl Machine',
  'ponte glutei': 'Hip Thrust Machine',
  'ponte glutei monopodalico': 'Hip Thrust Machine',
  'nordic curl (parziale)': 'Leg Curl Machine',
  'nordic curl (assistito)': 'Leg Curl Machine',

  // HORIZONTAL PUSH - English
  'push-up': 'Chest Press Machine',
  'push up': 'Chest Press Machine',
  'archer push-up': 'Chest Press Machine',
  'push-up standard': 'Chest Press Machine',
  'bench press': 'Chest Press Machine',
  'incline bench press': 'Incline Chest Press Machine',
  'decline bench press': 'Chest Press Machine',
  'dumbbell press': 'Chest Press Machine',
  'floor press': 'Chest Press Machine',
  'dip': 'Chest Press Machine',

  // HORIZONTAL PUSH - Italian
  'panca piana': 'Chest Press Machine',
  'panca inclinata': 'Incline Chest Press Machine',
  'panca declinata': 'Chest Press Machine',
  'panca inclinata con manubri': 'Incline Chest Press Machine',
  'panca con manubri': 'Chest Press Machine',
  'piegamenti': 'Chest Press Machine',
  'dip tricipiti': 'Chest Press Machine',

  // VERTICAL PUSH - English
  'pike push-up': 'Shoulder Press Machine',
  'pike push up': 'Shoulder Press Machine',
  'elevated pike push-up': 'Shoulder Press Machine',
  'hspu': 'Shoulder Press Machine',
  'handstand push-up': 'Shoulder Press Machine',
  'military press': 'Shoulder Press Machine',
  'overhead press': 'Shoulder Press Machine',
  'shoulder press': 'Shoulder Press Machine',
  'arnold press': 'Shoulder Press Machine',

  // VERTICAL PUSH - Italian
  'shoulder press con manubri': 'Shoulder Press Machine',
  'lento avanti': 'Shoulder Press Machine',

  // VERTICAL PULL - English
  'pull-up': 'Lat Pulldown Machine',
  'pull up': 'Lat Pulldown Machine',
  'assisted pull-up': 'Lat Pulldown Machine',
  'chin-up': 'Lat Pulldown Machine',
  'lat pulldown': 'Lat Pulldown Machine',

  // VERTICAL PULL - Italian
  'trazioni': 'Lat Pulldown Machine',
  'trazioni assistite': 'Lat Pulldown Machine',
  'lat machine': 'Lat Pulldown Machine',

  // HORIZONTAL PULL - English
  'inverted row': 'Seated Row Machine',
  'barbell row': 'Seated Row Machine',
  'dumbbell row': 'Seated Row Machine',
  'cable row': 'Seated Row Machine',
  'seated row': 'Seated Row Machine',
  'bent over row': 'Seated Row Machine',
  't-bar row': 'Seated Row Machine',

  // HORIZONTAL PULL - Italian
  'rematore con bilanciere': 'Seated Row Machine',
  'rematore con manubrio': 'Seated Row Machine',
  'rematore': 'Seated Row Machine',
  'pulley basso': 'Seated Row Machine',
  'pulley': 'Seated Row Machine',

  // CORE (mantieni bodyweight - le macchine per core sono meno efficaci)
  'plank': 'Plank',
  'l-sit': 'Ab Crunch Machine',
  'dragon flag': 'Ab Crunch Machine',
  'crunch ai cavi': 'Ab Crunch Machine',
  'cable crunch': 'Ab Crunch Machine',
  'pallof press': 'Cable Rotation Machine',
  'dead bug': 'Ab Crunch Machine',
  'hollow hold': 'Ab Crunch Machine'
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
