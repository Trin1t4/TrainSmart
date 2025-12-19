/**
 * Exercise Video Mapping
 * Mappa ogni esercizio al suo video su Supabase Storage
 */

// URL base di Supabase Storage
// Costruito dinamicamente dall'URL Supabase configurato
const getSupabaseStorageUrl = () => {
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/exercise-videos`;
};
const SUPABASE_STORAGE_URL = getSupabaseStorageUrl();

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
 * Override quando il nome nel sistema non matcha il nome del file video
 */
const VIDEO_OVERRIDES: Record<string, string> = {
  // === AUSTRALIAN PULL-UP (alias per Inverted Row) ===
  'Australian Pull-up': 'inverted-row.mp4',
  'Australian Pull-up Veloci': 'inverted-row.mp4',
  'Australian Pull Up': 'inverted-row.mp4',

  // === INVERTED ROW varianti ===
  'Inverted Row': 'inverted-row.mp4',
  'Inverted Row Alta': 'inverted-row.mp4',
  'Inverted Row 45°': 'inverted-row.mp4',
  'Inverted Row 30°': 'inverted-row.mp4',
  'Inverted Row Orizzontale': 'inverted-row.mp4',
  'Inverted Row Tempo': 'inverted-row.mp4',
  'Inverted Row (barra alta)': 'inverted-row.mp4',
  'Inverted Row (barra media)': 'inverted-row.mp4',
  'Inverted Row (barra bassa)': 'inverted-row.mp4',

  // === PIKE PUSH-UP varianti ===
  'Pike Push-up': 'pike-push-up.mp4',
  'Pike Push Up': 'pike-push-up.mp4',
  'Pike Push-up Facile': 'pike-push-up.mp4',
  'Pike Push-up Elevato': 'pike-push-up.mp4',
  'Plank to Pike': 'pike-push-up.mp4',

  // === NORDIC CURL varianti ===
  'Nordic Curl': 'nordic-hamstring-curl.mp4',
  'Nordic Curl (solo eccentrica)': 'nordic-hamstring-curl.mp4',
  'Nordic Curl (completo)': 'nordic-hamstring-curl.mp4',
  'Nordic Curl Negativo': 'nordic-hamstring-curl.mp4',
  'Nordic Hamstring Curl': 'nordic-hamstring-curl.mp4',

  // === PULL-UP varianti ===
  'Pull-up Standard': 'standard-pull-up.mp4',
  'Pull-up': 'standard-pull-up.mp4',
  'Negative Pull-up (solo eccentrica)': 'standard-pull-up.mp4',
  'Negative Pull-ups (5-10s)': 'standard-pull-up.mp4',
  'Pull-ups / Chin-ups': 'standard-pull-up.mp4',
  'Band-Assisted Pull-up': 'assisted-pull-up.mp4',
  'Assisted Pull-up': 'assisted-pull-up.mp4',
  'Trazioni Assistite': 'assisted-pull-up.mp4',

  // === PUSH-UP varianti ===
  'Push-up Standard': 'standard-push-up.mp4',
  'Push-up': 'standard-push-up.mp4',
  'Push-up su Ginocchia': 'standard-push-up.mp4',
  'Push-up Ginocchia': 'standard-push-up.mp4',
  'Decline Push-up': 'decline-push-up.mp4',

  // === SQUAT varianti ===
  'Air Squat': 'bodyweight-squat.mp4',
  'Squat': 'bodyweight-squat.mp4',
  'Squat Assistito': 'bodyweight-squat.mp4',
  'Squat Completo': 'bodyweight-squat.mp4',
  'Modified Squat': 'modified-squat.mp4',
  'Squat Modificato': 'modified-squat.mp4',
  'Deep Squat Hold': 'deep-squat-hold.mp4',

  // === LEG CURL varianti ===
  'Slider Leg Curl': 'standing-leg-curl.mp4',
  'Leg Curl': 'leg-curl.mp4',
  'Leg Curl (Machine)': 'leg-curl.mp4',
  'Leg Curl Machine': 'leg-curl.mp4',
  'Standing Leg Curl': 'standing-leg-curl.mp4',

  // === HIP THRUST / GLUTE ===
  'Hip Thrust': 'hip-thrust.mp4',
  'Hip Thrust (Elevated)': 'hip-thrust.mp4',
  'Single Leg Glute Bridge': 'glute-bridge.mp4',

  // === DEADLIFT varianti ===
  'Romanian Deadlift (RDL)': 'romanian-deadlift.mp4',
  'Romanian Deadlift': 'romanian-deadlift.mp4',
  'RDL': 'romanian-deadlift.mp4',
  'Stacco Rumeno': 'romanian-deadlift.mp4',
  'Single Leg RDL (corpo libero)': 'romanian-deadlift.mp4',
  'Single Leg RDL (Bodyweight)': 'romanian-deadlift.mp4',
  'Sumo Deadlift': 'sumo-deadlift.mp4',
  'Conventional Deadlift': 'conventional-deadlift.mp4',
  'Deadlift': 'conventional-deadlift.mp4',
  'Stacco': 'conventional-deadlift.mp4',
  'Stacco da Terra': 'conventional-deadlift.mp4',
  'Trap Bar Deadlift': 'conventional-deadlift.mp4',

  // === ROW varianti ===
  'Barbell Row': 'barbell-row.mp4',
  'Rematore Bilanciere': 'barbell-row.mp4',
  'Dumbbell Row': 'dumbbell-row.mp4',
  'Rematore Manubri': 'dumbbell-row.mp4',
  'T-Bar Row': 't-bar-row.mp4',
  'Seated Cable Row': 'seated-cable-row.mp4',
  'Cable Row': 'seated-cable-row.mp4',
  'Seated Row (Band)': 'seated-row-band.mp4',
  'Band Row': 'seated-row-band.mp4',

  // === LAT / FACE PULL ===
  'Lat Pulldown': 'lat-pulldown.mp4',
  'Lat Pulldown (Machine)': 'lat-pulldown.mp4',
  'Lat Machine': 'lat-pulldown.mp4',
  'Face Pull': 'face-pull.mp4',
  'Band Face Pull': 'face-pull.mp4',

  // === AFFONDI / LUNGES ===
  'Lunges': 'lunges.mp4',
  'Affondi': 'lunges.mp4',
  'Reverse Lunge': 'lunges.mp4',
  'Step-up': 'step-up.mp4',
  'Step Up': 'step-up.mp4',

  // === SHOULDER PRESS ===
  'Military Press': 'military-press.mp4',
  'Military Press (Barbell)': 'military-press.mp4',
  'Overhead Press': 'military-press.mp4',
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press.mp4',
  'Shoulder Press Manubri': 'dumbbell-shoulder-press.mp4',
  'Arnold Press': 'arnold-press.mp4',

  // === RAISE ===
  'Lateral Raise': 'lateral-raise.mp4',
  'Lateral Raises': 'lateral-raise.mp4',
  'Front Raise': 'front-raise.mp4',
  'Front Raises': 'front-raise.mp4',

  // === CORE ===
  'Side Plank': 'side-plank-modified.mp4',
  'Side Plank (Modified)': 'side-plank-modified.mp4',
  'Pallof Press': 'pallof-press.mp4',
  'Pallof Press (Kneeling)': 'pallof-press-kneeling.mp4',
  'Half Kneeling Chop': 'half-kneeling-chop.mp4',
  'Dead Bug Progression': 'dead-bug-progression.mp4',
  'Dead Bug Heel Slides': 'dead-bug-heel-slides.mp4',
  'Bear Hold': 'bear-hold.mp4',
  'Hanging Leg Raise': 'hanging-leg-raise.mp4',
  'Ab Wheel Rollout': 'ab-wheel-rollout.mp4',
  'Cable Crunch': 'cable-crunch.mp4',

  // === BENCH PRESS ===
  'Bench Press': 'flat-barbell-bench-press.mp4',
  'Flat Barbell Bench Press': 'flat-barbell-bench-press.mp4',
  'Panca Piana': 'flat-barbell-bench-press.mp4',
  'Dumbbell Bench Press': 'dumbbell-bench-press.mp4',

  // === DIPS ===
  'Dips': 'chest-dips.mp4',
  'Chest Dips': 'chest-dips.mp4',
  'Tricep Dips': 'tricep-dips.mp4',
  'Dips su Sedia': 'tricep-dips.mp4',

  // === ARMS ===
  'Barbell Curl': 'barbell-curl.mp4',
  'Hammer Curl': 'hammer-curl.mp4',
  'Skull Crushers': 'skull-crushers.mp4',
  'Tricep Pushdown': 'tricep-pushdown.mp4',

  // === CALVES ===
  'Standing Calf Raise': 'standing-calf-raise.mp4',
  'Seated Calf Raise': 'seated-calf-raise.mp4',

  // === MOBILITY / CORRECTIVE ===
  'Cat-Cow': 'cat-cow.mp4',
  'Bird Dog (Modified)': 'bird-dog-modified.mp4',
  'Clamshells': 'clamshells.mp4',
  'Clamshell': 'clamshells.mp4',
  'Good Morning': 'good-morning.mp4',
  'Good Morning BW': 'good-morning.mp4',
  'Bodyweight Hip Hinge': 'bodyweight-hip-hinge.mp4',
  'Standing Hip Circles': 'standing-hip-circles.mp4',
  'Pelvic Tilts': 'pelvic-tilts.mp4',
  'Diaphragmatic Breathing': 'diaphragmatic-breathing.mp4',
  'Connection Breath': 'connection-breath.mp4',
  'Happy Baby Stretch': 'happy-baby-stretch.mp4',
  'Squat to Stand': 'squat-to-stand.mp4',
  'Toe Taps': 'toe-taps.mp4',
  'Supine Marching': 'supine-marching.mp4',
  'Standing March': 'standing-march.mp4',
  'Side Lying Leg Lift': 'side-lying-leg-lift.mp4',
  'Shoulder Blade Squeeze': 'shoulder-blade-squeeze.mp4',
  'Pelvic Floor Activation': 'pelvic-floor-activation.mp4',
  'Wall Sit with Breathing': 'wall-sit-breathing.mp4',
  'Seated Knee Lifts': 'seated-knee-lifts.mp4',
  'Bridge with Ball Squeeze': 'bridge-ball-squeeze.mp4',

  // === MACHINE ===
  'Leg Press': 'leg-press.mp4',
  'Leg Extension': 'leg-extension.mp4',

  // === HSPU ===
  'Wall Handstand Push-up': 'wall-handstand-push-up.mp4',
  'Handstand Push-up': 'wall-handstand-push-up.mp4',
  'Wall HSPU': 'wall-handstand-push-up.mp4',
  'HSPU': 'wall-handstand-push-up.mp4',
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
 * Usa mode: 'no-cors' per evitare problemi CORS con Supabase Storage
 */
export async function checkVideoExists(exerciseName: string): Promise<boolean> {
  try {
    const url = getExerciseVideoUrl(exerciseName);
    // Usa GET con range header per verificare se il video esiste
    // Supabase Storage non supporta HEAD con CORS
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Range': 'bytes=0-0' } // Solo primo byte
    });
    return response.ok || response.status === 206; // 206 = Partial Content
  } catch {
    // In caso di errore CORS, assumiamo che il video esista
    // e lasciamo che l'errore venga gestito dal video element
    return true;
  }
}
