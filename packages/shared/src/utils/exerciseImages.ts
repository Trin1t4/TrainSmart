/**
 * Exercise Static Images Mapping
 * Mappa ogni esercizio statico/isometrico alla sua immagine su Supabase Storage
 *
 * Per esercizi statici usiamo immagini invece di video perché:
 * - Mostrare la posizione corretta è sufficiente
 * - Immagini più leggere dei video
 * - Caricamento più veloce
 */

// URL base di Supabase Storage per immagini esercizi
const SUPABASE_STORAGE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-images';

/**
 * Mapping diretto esercizio -> immagine
 * Immagini scaricate da fonti gratuite e caricate su Supabase
 */
export const EXERCISE_IMAGES: Record<string, {
  url: string;
  source: string;
  type: 'illustration' | 'photo';
}> = {
  // === CORE ISOMETRICO ===
  'Plank': {
    url: `${SUPABASE_STORAGE_URL}/plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank (Left)': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank (Right)': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bird Dog': {
    url: `${SUPABASE_STORAGE_URL}/bird-dog.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bird Dogs': {
    url: `${SUPABASE_STORAGE_URL}/bird-dog.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Dead Bug': {
    url: `${SUPABASE_STORAGE_URL}/dead-bug.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Superman': {
    url: `${SUPABASE_STORAGE_URL}/superman.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Superman Hold': {
    url: `${SUPABASE_STORAGE_URL}/superman.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Hollow Body Hold': {
    url: 'https://workoutlabs.com/train/svg.php?id=84978',
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Hollow Body': {
    url: 'https://workoutlabs.com/train/svg.php?id=84978',
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Wall Sit': {
    url: `${SUPABASE_STORAGE_URL}/wall-sit.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Glute Bridge': {
    url: `${SUPABASE_STORAGE_URL}/glute-bridge.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Glute Bridge Hold': {
    url: `${SUPABASE_STORAGE_URL}/glute-bridge.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === YOGA / STRETCHING ===
  'Pigeon Pose': {
    url: `${SUPABASE_STORAGE_URL}/pigeon-pose.jpg`,
    source: 'Shopify Burst',
    type: 'photo'
  },
  'Side Plank Pose': {
    url: `${SUPABASE_STORAGE_URL}/side-plank-pose.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Vasisthasana': {
    url: `${SUPABASE_STORAGE_URL}/side-plank-pose.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === CALISTHENICS AVANZATO ===
  'L-Sit': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },
  'L-Sit Hold': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },

  // === HIP STRETCHING ===
  'Hip Stretch': {
    url: `${SUPABASE_STORAGE_URL}/hip-stretch.jpg`,
    source: 'Pexels',
    type: 'photo'
  },

  // =====================================================
  // TEST SCREENING INIZIALE
  // =====================================================

  // === LOWER BODY PUSH (SQUAT) ===
  'Air Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bodyweight Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Squat Assistito': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Jump Squat': {
    url: `${SUPABASE_STORAGE_URL}/jump-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bulgarian Split Squat': {
    url: `${SUPABASE_STORAGE_URL}/bulgarian-split-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pistol Squat': {
    url: `${SUPABASE_STORAGE_URL}/pistol-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pistol Squat Assistito': {
    url: `${SUPABASE_STORAGE_URL}/pistol-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Shrimp Squat': {
    url: `${SUPABASE_STORAGE_URL}/shrimp-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === HORIZONTAL PUSH (PUSH-UP) ===
  'Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Push-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Standard Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Wall Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Incline Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Push-up su Ginocchia': {
    url: `${SUPABASE_STORAGE_URL}/knee-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Knee Push-up': {
    url: `${SUPABASE_STORAGE_URL}/knee-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Diamond Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Archer Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pseudo Planche Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'One Arm Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Decline Push-up': {
    url: `${SUPABASE_STORAGE_URL}/decline-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === VERTICAL PUSH (PIKE → HSPU) ===
  'Pike Push-up': {
    url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Elevated Pike Push-up': {
    url: `${SUPABASE_STORAGE_URL}/decline-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === VERTICAL PULL (PULL-UP) ===
  'Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Pull-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Negative Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Band-Assisted Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Archer Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'One Arm Pull-up Progression': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Chin-up': {
    url: `${SUPABASE_STORAGE_URL}/chin-up.png`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Chin-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/chin-up.png`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
};

/**
 * URL di fallback esterni per immagini non ancora caricate su Supabase
 * Questi sono link diretti alle fonti originali
 */
export const EXERCISE_IMAGE_FALLBACKS: Record<string, string> = {
  // Spotebi illustrations (direct links)
  'Plank': 'https://spotebi.com/wp-content/uploads/2014/10/plank-exercise-illustration.jpg',
  'Side Plank': 'https://spotebi.com/wp-content/uploads/2014/10/side-plank-exercise-illustration.jpg',
  'Bird Dog': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Bird Dogs': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Dead Bug': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Superman': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Superman Hold': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Wall Sit': 'https://spotebi.com/wp-content/uploads/2015/05/wall-sit-exercise-illustration.jpg',
  'Glute Bridge': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Glute Bridge Hold': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Side Plank Pose': 'https://spotebi.com/wp-content/uploads/2016/07/side-plank-pose-vasisthasana-spotebi.jpg',
  'Vasisthasana': 'https://spotebi.com/wp-content/uploads/2016/07/side-plank-pose-vasisthasana-spotebi.jpg',

  // WorkoutLabs
  'Hollow Body Hold': 'https://workoutlabs.com/train/svg.php?id=84978',
  'Hollow Body': 'https://workoutlabs.com/train/svg.php?id=84978',

  // Shopify Burst
  'Pigeon Pose': 'https://burst.shopifycdn.com/photos/pigeon-pose.jpg',

  // Dreamstime (L-Sit)
  'L-Sit': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
  'L-Sit Hold': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',

  // Pexels photos
  'Hip Stretch': 'https://images.pexels.com/photos/4051518/pexels-photo-4051518.jpeg?auto=compress&cs=tinysrgb&w=600',

  // Unsplash photos
  'Seated Forward Fold': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600',
  'Baddha Konasana': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',
  'Butterfly Stretch': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',
};

/**
 * Lista esercizi che hanno immagini statiche (non video)
 * Include sia esercizi isometrici che test screening
 */
export const STATIC_EXERCISES = [
  // Core isometrico
  'Plank',
  'Side Plank',
  'Side Plank (Left)',
  'Side Plank (Right)',
  'Bird Dog',
  'Bird Dogs',
  'Dead Bug',
  'Superman',
  'Superman Hold',
  'Hollow Body Hold',
  'Hollow Body',
  'Wall Sit',
  'Glute Bridge',
  'Glute Bridge Hold',
  // Yoga/Stretching
  'Pigeon Pose',
  'Side Plank Pose',
  'Vasisthasana',
  'L-Sit',
  'L-Sit Hold',
  'Hip Stretch',
  'Seated Forward Fold',
  'Baddha Konasana',
  'Butterfly Stretch',
  // Test Screening - Lower Body Push
  'Air Squat',
  'Squat',
  'Bodyweight Squat',
  'Squat Assistito',
  'Jump Squat',
  'Bulgarian Split Squat',
  'Pistol Squat',
  'Pistol Squat Assistito',
  'Shrimp Squat',
  // Test Screening - Horizontal Push
  'Push-up',
  'Push-up Standard',
  'Standard Push-up',
  'Wall Push-up',
  'Incline Push-up',
  'Push-up su Ginocchia',
  'Knee Push-up',
  'Diamond Push-up',
  'Archer Push-up',
  'Pseudo Planche Push-up',
  'One Arm Push-up',
  'Decline Push-up',
  // Test Screening - Vertical Push
  'Pike Push-up',
  'Elevated Pike Push-up',
  // Test Screening - Vertical Pull
  'Pull-up',
  'Pull-up Standard',
  'Negative Pull-up',
  'Band-Assisted Pull-up',
  'Archer Pull-up',
  'One Arm Pull-up Progression',
  'Chin-up',
  'Chin-up Standard',
];

/**
 * Controlla se un esercizio è statico (usa immagine invece di video)
 */
export function isStaticExercise(exerciseName: string): boolean {
  const normalized = exerciseName.toLowerCase();
  return STATIC_EXERCISES.some(ex => ex.toLowerCase() === normalized);
}

/**
 * Ottieni URL immagine per un esercizio
 * Prima prova Supabase, poi fallback a fonte esterna
 */
export function getExerciseImageUrl(exerciseName: string): string | null {
  // Normalizza il nome per matching
  const normalizedName = exerciseName.trim();

  // Check mapping diretto
  if (EXERCISE_IMAGES[normalizedName]) {
    return EXERCISE_IMAGES[normalizedName].url;
  }

  // Check varianti comuni
  for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value.url;
    }
  }

  return null;
}

/**
 * Ottieni URL fallback (fonte esterna) per un esercizio
 */
export function getExerciseImageFallback(exerciseName: string): string | null {
  const normalizedName = exerciseName.trim();

  if (EXERCISE_IMAGE_FALLBACKS[normalizedName]) {
    return EXERCISE_IMAGE_FALLBACKS[normalizedName];
  }

  // Check case-insensitive
  for (const [key, value] of Object.entries(EXERCISE_IMAGE_FALLBACKS)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value;
    }
  }

  return null;
}

/**
 * Ottieni URL immagine con fallback automatico
 * Utile per UI: prova Supabase, poi esterno
 */
export function getExerciseImageWithFallback(exerciseName: string): string | null {
  return getExerciseImageUrl(exerciseName) || getExerciseImageFallback(exerciseName);
}

/**
 * Genera lista per upload su Supabase
 */
export function generateImageUploadList(): Array<{
  exercise: string;
  sourceUrl: string;
  targetFileName: string;
}> {
  return Object.entries(EXERCISE_IMAGE_FALLBACKS).map(([exercise, sourceUrl]) => {
    const extension = sourceUrl.includes('.svg') ? 'svg' :
                     sourceUrl.includes('.png') ? 'png' : 'jpg';
    const fileName = exercise
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '.' + extension;

    return {
      exercise,
      sourceUrl,
      targetFileName: fileName
    };
  });
}
