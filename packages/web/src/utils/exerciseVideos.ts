/**
 * Exercise Video Mapping
 * Mappa ogni esercizio al suo video su Supabase Storage
 */

// URL base di Supabase Storage
const SUPABASE_STORAGE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-videos';

/**
 * Converte nome esercizio in nome file video
 * "Push-up" -> "push-up.mp4"
 * "Barbell Squat" -> "barbell-squat.mp4"
 */
function exerciseNameToFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')           // Rimuovi parentesi
    .replace(/\s+/g, '-')           // Spazi -> trattini
    .replace(/[^a-z0-9-]/g, '')     // Solo alfanumerici e trattini
    .replace(/-+/g, '-')            // Trattini multipli -> singolo
    .replace(/^-|-$/g, '')          // Rimuovi trattini iniziali/finali
    + '.mp4';
}

/**
 * Mapping manuale per esercizi con nomi particolari
 * Aggiungi qui override se il nome automatico non funziona
 */
const VIDEO_OVERRIDES: Record<string, string> = {
  // Esempio: 'Romanian Deadlift (RDL)': 'romanian-deadlift.mp4'
};

/**
 * Ottieni URL del video per un esercizio
 */
export function getExerciseVideoUrl(exerciseName: string): string {
  // Check override manuale
  if (VIDEO_OVERRIDES[exerciseName]) {
    return `${SUPABASE_STORAGE_URL}/${VIDEO_OVERRIDES[exerciseName]}`;
  }

  // Genera URL automatico
  const fileName = exerciseNameToFileName(exerciseName);
  return `${SUPABASE_STORAGE_URL}/${fileName}`;
}

/**
 * Ottieni nome file per un esercizio (per upload)
 */
export function getExerciseVideoFileName(exerciseName: string): string {
  if (VIDEO_OVERRIDES[exerciseName]) {
    return VIDEO_OVERRIDES[exerciseName];
  }
  return exerciseNameToFileName(exerciseName);
}

/**
 * Lista completa di tutti gli esercizi con i rispettivi nomi file
 * Utile per verificare cosa caricare
 */
export const EXERCISE_VIDEO_LIST = [
  // === LOWER PUSH ===
  'Bodyweight Squat',
  'Goblet Squat',
  'Front Squat',
  'Back Squat',
  'Leg Press',
  'Bulgarian Split Squat',
  'Pistol Squat',
  'Lunges',
  'Step-up',
  'Leg Extension',

  // === LOWER PULL ===
  'Bodyweight Hip Hinge',
  'Conventional Deadlift',
  'Romanian Deadlift (RDL)',
  'Sumo Deadlift',
  'Good Morning',
  'Hip Thrust',
  'Glute Bridge',
  'Nordic Curl',
  'Leg Curl',

  // === UPPER PUSH HORIZONTAL ===
  'Push-up',
  'Bench Press',
  'Dumbbell Bench Press',
  'Incline Push-up',
  'Decline Push-up',
  'Diamond Push-up',
  'Dips',

  // === UPPER PUSH VERTICAL ===
  'Pike Push-up',
  'Handstand Push-up',
  'Overhead Press',
  'Dumbbell Shoulder Press',
  'Arnold Press',
  'Lateral Raise',
  'Front Raise',

  // === UPPER PULL HORIZONTAL ===
  'Inverted Row',
  'Barbell Row',
  'Dumbbell Row',
  'Cable Row',
  'T-Bar Row',
  'Face Pull',

  // === UPPER PULL VERTICAL ===
  'Pull-up',
  'Chin-up',
  'Lat Pulldown',
  'Assisted Pull-up',

  // === CORE ===
  'Plank',
  'Dead Bug',
  'Bird Dog',
  'Hanging Leg Raise',
  'Ab Wheel Rollout',
  'Cable Crunch',
  'Pallof Press',

  // === TRICIPITI ===
  'Tricep Dips',
  'Tricep Pushdown',
  'Skull Crushers',

  // === BICIPITI ===
  'Barbell Curl',
  'Hammer Curl',

  // === POLPACCI ===
  'Standing Calf Raise',
  'Seated Calf Raise',
];

/**
 * Genera lista per upload con nomi file
 */
export function generateUploadList(): Array<{ exercise: string; fileName: string; url: string }> {
  return EXERCISE_VIDEO_LIST.map(exercise => ({
    exercise,
    fileName: getExerciseVideoFileName(exercise),
    url: getExerciseVideoUrl(exercise)
  }));
}

/**
 * Verifica se un video esiste (client-side check)
 * Nota: fa una richiesta HEAD al server
 */
export async function checkVideoExists(exerciseName: string): Promise<boolean> {
  try {
    const url = getExerciseVideoUrl(exerciseName);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
