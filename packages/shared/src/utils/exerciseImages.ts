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
