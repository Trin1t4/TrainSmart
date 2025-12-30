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
  'Trazioni Australiane': 'inverted-row.mp4',
  'Trazioni Orizzontali': 'inverted-row.mp4',

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
  'Rematore Inverso': 'inverted-row.mp4',
  'Rematore Inverso (barra alta)': 'inverted-row.mp4',
  'Rematore Inverso (barra bassa)': 'inverted-row.mp4',

  // === PIKE PUSH-UP varianti ===
  'Pike Push-up': 'pike-push-up.mp4',
  'Pike Push Up': 'pike-push-up.mp4',
  'Pike Push-up Facile': 'pike-push-up.mp4',
  'Pike Push-up Elevato': 'elevated-pike-push-up.mp4',
  'Plank to Pike': 'pike-push-up.mp4',
  'Piegamenti a V': 'pike-push-up.mp4',
  'Piegamenti a V Facili': 'pike-push-up.mp4',
  'Piegamenti a V Elevati': 'elevated-pike-push-up.mp4',

  // === NORDIC CURL varianti ===
  'Nordic Curl': 'nordic-hamstring-curl.mp4',
  'Nordic Curl (solo eccentrica)': 'nordic-hamstring-curl.mp4',
  'Nordic Curl (completo)': 'nordic-hamstring-curl.mp4',
  'Nordic Curl Negativo': 'nordic-hamstring-curl.mp4',
  'Nordic Hamstring Curl': 'nordic-hamstring-curl.mp4',
  'Curl Nordico': 'nordic-hamstring-curl.mp4',
  'Curl Nordico Negativo': 'nordic-hamstring-curl.mp4',
  'Curl Nordico Eccentrico': 'nordic-hamstring-curl.mp4',

  // === PULL-UP varianti ===
  'Pull-up Standard': 'standard-pull-up.mp4',
  'Pull-up': 'standard-pull-up.mp4',
  'Negative Pull-up (solo eccentrica)': 'standard-pull-up.mp4',
  'Negative Pull-ups (5-10s)': 'standard-pull-up.mp4',
  'Pull-ups / Chin-ups': 'standard-pull-up.mp4',
  'Trazioni': 'standard-pull-up.mp4',
  'Trazioni alla Sbarra': 'standard-pull-up.mp4',
  'Trazioni Prone': 'standard-pull-up.mp4',
  'Trazioni Negative': 'standard-pull-up.mp4',
  'Chin-up': 'chin-up.mp4',
  'Chin-ups': 'chin-up.mp4',
  'Trazioni Supine': 'chin-up.mp4',
  'Trazioni Presa Supina': 'chin-up.mp4',
  'Band-Assisted Pull-up': 'assisted-pull-up.mp4',
  'Assisted Pull-up': 'assisted-pull-up.mp4',
  'Trazioni Assistite': 'assisted-pull-up.mp4',
  'Trazioni con Elastico': 'assisted-pull-up.mp4',

  // === PUSH-UP varianti ===
  'Push-up Standard': 'standard-push-up.mp4',
  'Push-up': 'standard-push-up.mp4',
  'Push-up su Ginocchia': 'standard-push-up.mp4',
  'Push-up Ginocchia': 'standard-push-up.mp4',
  'Piegamenti': 'standard-push-up.mp4',
  'Piegamenti sulle Braccia': 'standard-push-up.mp4',
  'Flessioni': 'standard-push-up.mp4',
  'Piegamenti sulle Ginocchia': 'standard-push-up.mp4',
  'Decline Push-up': 'decline-push-up.mp4',
  'Piegamenti Declinati': 'decline-push-up.mp4',
  'Piegamenti Piedi Elevati': 'decline-push-up.mp4',
  'Incline Push-up': 'incline-push-up.mp4',
  'Piegamenti Inclinati': 'incline-push-up.mp4',
  'Piegamenti su Rialzo': 'incline-push-up.mp4',
  'Diamond Push-up': 'diamond-push-up.mp4',
  'Piegamenti Diamante': 'diamond-push-up.mp4',
  'Piegamenti Stretti': 'diamond-push-up.mp4',
  'Wall Push-up': 'wall-push-up.mp4',
  'Wall Push Up': 'wall-push-up.mp4',
  'Piegamenti al Muro': 'wall-push-up.mp4',
  'Flessioni al Muro': 'wall-push-up.mp4',

  // === SQUAT varianti ===
  'Air Squat': 'bodyweight-squat.mp4',
  'Squat': 'bodyweight-squat.mp4',
  'Squat Assistito': 'bodyweight-squat.mp4',
  'Squat Completo': 'bodyweight-squat.mp4',
  'Bodyweight Squat': 'bodyweight-squat.mp4',
  'Squat a Corpo Libero': 'bodyweight-squat.mp4',
  'Accosciata': 'bodyweight-squat.mp4',
  'Modified Squat': 'modified-squat.mp4',
  'Squat Modificato': 'modified-squat.mp4',
  'Deep Squat Hold': 'deep-squat-hold.mp4',
  'Squat Profondo': 'deep-squat-hold.mp4',
  'Squat Isometrico': 'deep-squat-hold.mp4',
  'Goblet Squat': 'goblet-squat.mp4',
  'Front Squat': 'front-squat.mp4',
  'Squat Frontale': 'front-squat.mp4',
  'Back Squat': 'back-squat.mp4',
  'Squat con Bilanciere': 'back-squat.mp4',
  'Bulgarian Split Squat': 'bulgarian-split-squat.mp4',
  'Split Squat Bulgaro': 'bulgarian-split-squat.mp4',
  'Affondi Bulgari': 'bulgarian-split-squat.mp4',
  'Pistol Squat': 'pistol-squat.mp4',
  'Squat su una Gamba': 'pistol-squat.mp4',

  // === LEG CURL varianti ===
  'Slider Leg Curl': 'slider-leg-curl.mp4',
  'Sliding Leg Curl': 'slider-leg-curl.mp4',
  'Leg Curl con Slider': 'slider-leg-curl.mp4',
  'Leg Curl': 'leg-curl.mp4',
  'Leg Curl (Machine)': 'leg-curl.mp4',
  'Leg Curl Machine': 'leg-curl.mp4',
  'Leg Curl Sdraiato': 'leg-curl.mp4',
  'Curl Femorali': 'leg-curl.mp4',
  'Standing Leg Curl': 'standing-leg-curl.mp4',
  'Leg Curl in Piedi': 'standing-leg-curl.mp4',

  // === HIP THRUST / GLUTE ===
  'Hip Thrust': 'hip-thrust.mp4',
  'Spinta d\'Anca': 'hip-thrust.mp4',
  'Hip Thrust (Elevated)': 'elevated-hip-thrust.mp4',
  'Elevated Hip Thrust': 'elevated-hip-thrust.mp4',
  'Hip Thrust Elevato': 'elevated-hip-thrust.mp4',
  'Glute Bridge': 'glute-bridge.mp4',
  'Ponte Glutei': 'glute-bridge.mp4',
  'Single Leg Glute Bridge': 'single-leg-glute-bridge.mp4',
  'Ponte Glutei Unilaterale': 'single-leg-glute-bridge.mp4',
  'Ponte Glutei su una Gamba': 'single-leg-glute-bridge.mp4',

  // === DEADLIFT varianti ===
  'Romanian Deadlift (RDL)': 'romanian-deadlift.mp4',
  'Romanian Deadlift': 'romanian-deadlift.mp4',
  'RDL': 'romanian-deadlift.mp4',
  'Stacco Rumeno': 'romanian-deadlift.mp4',
  'Stacco a Gambe Tese': 'romanian-deadlift.mp4',
  'Single Leg RDL': 'single-leg-rdl.mp4',
  'Single Leg RDL (corpo libero)': 'single-leg-rdl.mp4',
  'Single Leg RDL (Bodyweight)': 'single-leg-rdl.mp4',
  'Single Leg Deadlift': 'single-leg-rdl.mp4',
  'Stacco Rumeno Unilaterale': 'single-leg-rdl.mp4',
  'Stacco su una Gamba': 'single-leg-rdl.mp4',
  'Sumo Deadlift': 'sumo-deadlift.mp4',
  'Stacco Sumo': 'sumo-deadlift.mp4',
  'Conventional Deadlift': 'conventional-deadlift.mp4',
  'Deadlift': 'conventional-deadlift.mp4',
  'Stacco': 'conventional-deadlift.mp4',
  'Stacco da Terra': 'conventional-deadlift.mp4',
  'Stacco Classico': 'conventional-deadlift.mp4',
  'Trap Bar Deadlift': 'conventional-deadlift.mp4',
  'Stacco con Trap Bar': 'conventional-deadlift.mp4',

  // === ROW varianti ===
  'Barbell Row': 'barbell-row.mp4',
  'Rematore Bilanciere': 'barbell-row.mp4',
  'Rematore con Bilanciere': 'barbell-row.mp4',
  'Dumbbell Row': 'dumbbell-row.mp4',
  'Rematore Manubri': 'dumbbell-row.mp4',
  'Rematore con Manubrio': 'dumbbell-row.mp4',
  'Rematore Unilaterale': 'dumbbell-row.mp4',
  'T-Bar Row': 't-bar-row.mp4',
  'Rematore T-Bar': 't-bar-row.mp4',
  'Seated Cable Row': 'seated-cable-row.mp4',
  'Cable Row': 'seated-cable-row.mp4',
  'Rematore ai Cavi': 'seated-cable-row.mp4',
  'Pulley Basso': 'seated-cable-row.mp4',
  'Seated Row (Band)': 'seated-row-band.mp4',
  'Band Row': 'seated-row-band.mp4',
  'Rematore con Elastico': 'seated-row-band.mp4',

  // === LAT / FACE PULL ===
  'Lat Pulldown': 'lat-pulldown.mp4',
  'Lat Pulldown (Machine)': 'lat-pulldown.mp4',
  'Lat Machine': 'lat-pulldown.mp4',
  'Tirate al Lat Machine': 'lat-pulldown.mp4',
  'Pulley Alto': 'lat-pulldown.mp4',
  'Face Pull': 'face-pull.mp4',
  'Band Face Pull': 'face-pull.mp4',
  'Face Pull con Cavi': 'face-pull.mp4',
  'Face Pull con Elastico': 'face-pull.mp4',

  // === AFFONDI / LUNGES ===
  'Lunges': 'lunges.mp4',
  'Affondi': 'lunges.mp4',
  'Affondi in Avanti': 'lunges.mp4',
  'Affondi Camminati': 'lunges.mp4',
  'Reverse Lunge': 'reverse-lunge.mp4',
  'Affondi Inversi': 'reverse-lunge.mp4',
  'Affondi Indietro': 'reverse-lunge.mp4',
  'Step-up': 'step-up.mp4',
  'Step Up': 'step-up.mp4',
  'Salita su Gradino': 'step-up.mp4',
  'Step Up su Panca': 'step-up.mp4',

  // === SHOULDER PRESS ===
  'Military Press': 'military-press.mp4',
  'Military Press (Barbell)': 'military-press.mp4',
  'Overhead Press': 'military-press.mp4',
  'Lento Avanti': 'military-press.mp4',
  'Distensioni Sopra la Testa': 'military-press.mp4',
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press.mp4',
  'Shoulder Press Manubri': 'dumbbell-shoulder-press.mp4',
  'Lento Avanti Manubri': 'dumbbell-shoulder-press.mp4',
  'Spinte con Manubri': 'dumbbell-shoulder-press.mp4',
  'Arnold Press': 'arnold-press.mp4',

  // === RAISE ===
  'Lateral Raise': 'lateral-raise.mp4',
  'Lateral Raises': 'lateral-raise.mp4',
  'Alzate Laterali': 'lateral-raise.mp4',
  'Front Raise': 'front-raise.mp4',
  'Front Raises': 'front-raise.mp4',
  'Alzate Frontali': 'front-raise.mp4',

  // === CORE ===
  'Plank': 'plank.mp4',
  'Plank Frontale': 'plank.mp4',
  'Tenuta Isometrica': 'plank.mp4',
  'Side Plank': 'side-plank.mp4',
  'Plank Laterale': 'side-plank.mp4',
  'Side Plank (Modified)': 'side-plank-modified.mp4',
  'Plank Laterale Modificato': 'side-plank-modified.mp4',
  'Pallof Press': 'pallof-press.mp4',
  'Pallof Press (Kneeling)': 'pallof-press-kneeling.mp4',
  'Pallof Press in Ginocchio': 'pallof-press-kneeling.mp4',
  'Half Kneeling Chop': 'half-kneeling-chop.mp4',
  'Chop in Ginocchio': 'half-kneeling-chop.mp4',
  'Dead Bug': 'dead-bug.mp4',
  'Scarafaggio Morto': 'dead-bug.mp4',
  'Dead Bug Progression': 'dead-bug-progression.mp4',
  'Dead Bug Heel Slides': 'dead-bug-heel-slides.mp4',
  'Bear Hold': 'bear-hold.mp4',
  'Tenuta Orso': 'bear-hold.mp4',
  'Posizione dell\'Orso': 'bear-hold.mp4',
  'Hanging Leg Raise': 'hanging-leg-raise.mp4',
  'Alzate Gambe alla Sbarra': 'hanging-leg-raise.mp4',
  'Crunch Inverso Sospeso': 'hanging-leg-raise.mp4',
  'Ab Wheel Rollout': 'ab-wheel-rollout.mp4',
  'Rollout con Ruota': 'ab-wheel-rollout.mp4',
  'Ruota per Addominali': 'ab-wheel-rollout.mp4',
  'Cable Crunch': 'cable-crunch.mp4',
  'Crunch ai Cavi': 'cable-crunch.mp4',
  'Crunch al Cavo Alto': 'cable-crunch.mp4',

  // === BENCH PRESS ===
  'Bench Press': 'flat-barbell-bench-press.mp4',
  'Flat Barbell Bench Press': 'flat-barbell-bench-press.mp4',
  'Panca Piana': 'flat-barbell-bench-press.mp4',
  'Panca Piana Bilanciere': 'flat-barbell-bench-press.mp4',
  'Distensioni su Panca': 'flat-barbell-bench-press.mp4',
  'Dumbbell Bench Press': 'dumbbell-bench-press.mp4',
  'Panca Piana Manubri': 'dumbbell-bench-press.mp4',
  'Distensioni Manubri': 'dumbbell-bench-press.mp4',

  // === DIPS ===
  'Dips': 'chest-dips.mp4',
  'Chest Dips': 'chest-dips.mp4',
  'Dip alle Parallele': 'chest-dips.mp4',
  'Parallele': 'chest-dips.mp4',
  'Tricep Dips': 'tricep-dips.mp4',
  'Dips su Sedia': 'tricep-dips.mp4',
  'Dip su Panca': 'tricep-dips.mp4',
  'Dips per Tricipiti': 'tricep-dips.mp4',

  // === ARMS ===
  'Barbell Curl': 'barbell-curl.mp4',
  'Curl con Bilanciere': 'barbell-curl.mp4',
  'Curl Bilanciere': 'barbell-curl.mp4',
  'Hammer Curl': 'hammer-curl.mp4',
  'Curl a Martello': 'hammer-curl.mp4',
  'Skull Crushers': 'skull-crushers.mp4',
  'French Press': 'skull-crushers.mp4',
  'Estensioni Tricipiti Sdraiato': 'skull-crushers.mp4',
  'Tricep Pushdown': 'tricep-pushdown.mp4',
  'Push Down Tricipiti': 'tricep-pushdown.mp4',
  'Spinte in Basso Tricipiti': 'tricep-pushdown.mp4',

  // === CALVES ===
  'Standing Calf Raise': 'standing-calf-raise.mp4',
  'Calf Raise in Piedi': 'standing-calf-raise.mp4',
  'Polpacci in Piedi': 'standing-calf-raise.mp4',
  'Seated Calf Raise': 'seated-calf-raise.mp4',
  'Calf Raise Seduto': 'seated-calf-raise.mp4',
  'Polpacci da Seduto': 'seated-calf-raise.mp4',

  // === MOBILITY / CORRECTIVE ===
  'Cat-Cow': 'cat-cow.mp4',
  'Gatto-Mucca': 'cat-cow.mp4',
  'Gatto-Cammello': 'cat-cow.mp4',
  'Bird Dog': 'bird-dog.mp4',
  'Cane-Uccello': 'bird-dog.mp4',
  'Bird Dog (Modified)': 'bird-dog-modified.mp4',
  'Clamshells': 'clamshells.mp4',
  'Clamshell': 'clamshells.mp4',
  'Conchiglia': 'clamshells.mp4',
  'Apertura a Conchiglia': 'clamshells.mp4',
  'Good Morning': 'good-morning.mp4',
  'Good Morning BW': 'good-morning.mp4',
  'Buongiorno': 'good-morning.mp4',
  'Bodyweight Hip Hinge': 'bodyweight-hip-hinge.mp4',
  'Hip Hinge': 'bodyweight-hip-hinge.mp4',
  'Cerniera d\'Anca': 'bodyweight-hip-hinge.mp4',
  'Standing Hip Circles': 'standing-hip-circles.mp4',
  'Cerchi d\'Anca': 'standing-hip-circles.mp4',
  'Pelvic Tilts': 'pelvic-tilts.mp4',
  'Retroversione Bacino': 'pelvic-tilts.mp4',
  'Inclinazioni Pelviche': 'pelvic-tilts.mp4',
  'Diaphragmatic Breathing': 'diaphragmatic-breathing.mp4',
  'Respirazione Diaframmatica': 'diaphragmatic-breathing.mp4',
  'Connection Breath': 'connection-breath.mp4',
  'Respiro di Connessione': 'connection-breath.mp4',
  'Happy Baby Stretch': 'happy-baby-stretch.mp4',
  'Bambino Felice': 'happy-baby-stretch.mp4',
  'Squat to Stand': 'squat-to-stand.mp4',
  'Squat in Piedi': 'squat-to-stand.mp4',
  'Toe Taps': 'toe-taps.mp4',
  'Tocco Punte': 'toe-taps.mp4',
  'Supine Marching': 'supine-marching.mp4',
  'Marcia Supina': 'supine-marching.mp4',
  'Standing March': 'standing-march.mp4',
  'Marcia sul Posto': 'standing-march.mp4',
  'Side Lying Leg Lift': 'side-lying-leg-lift.mp4',
  'Alzate Gamba Laterali': 'side-lying-leg-lift.mp4',
  'Shoulder Blade Squeeze': 'shoulder-blade-squeeze.mp4',
  'Adduzione Scapole': 'shoulder-blade-squeeze.mp4',
  'Retrazione Scapolare': 'shoulder-blade-squeeze.mp4',
  'Pelvic Floor Activation': 'pelvic-floor-activation.mp4',
  'Attivazione Pavimento Pelvico': 'pelvic-floor-activation.mp4',
  'Wall Sit with Breathing': 'wall-sit-breathing.mp4',
  'Sedia al Muro con Respiro': 'wall-sit-breathing.mp4',
  'Seated Knee Lifts': 'seated-knee-lifts.mp4',
  'Alzate Ginocchia da Seduto': 'seated-knee-lifts.mp4',
  'Bridge with Ball Squeeze': 'bridge-ball-squeeze.mp4',
  'Ponte con Palla': 'bridge-ball-squeeze.mp4',

  // === MACHINE ===
  'Leg Press': 'leg-press.mp4',
  'Pressa per Gambe': 'leg-press.mp4',
  'Leg Extension': 'leg-extension.mp4',
  'Estensione Gambe': 'leg-extension.mp4',
  'Leg Extension Machine': 'leg-extension.mp4',

  // === HSPU ===
  'Wall Handstand Push-up': 'wall-handstand-push-up.mp4',
  'Handstand Push-up': 'wall-handstand-push-up.mp4',
  'Wall HSPU': 'wall-handstand-push-up.mp4',
  'HSPU': 'wall-handstand-push-up.mp4',
  'Piegamenti in Verticale': 'wall-handstand-push-up.mp4',
  'Piegamenti in Verticale al Muro': 'wall-handstand-push-up.mp4',
  'Handstand Hold': 'handstand-hold.mp4',
  'Verticale': 'handstand-hold.mp4',
  'Tenuta in Verticale': 'handstand-hold.mp4',

  // === NEW SQUAT VARIANTS ===
  'Pause Squat': 'pause-squat.mp4',
  'Pause Squat (Bodyweight)': 'pause-squat.mp4',
  'Squat con Pausa': 'pause-squat.mp4',
  'Squat Isometrico con Pausa': 'pause-squat.mp4',
  'Squat Jump': 'squat-jump.mp4',
  'Jump Squat': 'squat-jump.mp4',
  'Salto con Squat': 'squat-jump.mp4',
  'Squat Saltato': 'squat-jump.mp4',
  'Split Squat': 'split-squat.mp4',
  'Affondi sul Posto': 'split-squat.mp4',
  'Skater Squat': 'skater-squat.mp4',
  'Squat del Pattinatore': 'skater-squat.mp4',
  'Shrimp Squat': 'shrimp-squat.mp4',
  'Squat Gambero': 'shrimp-squat.mp4',
  'Box Squat': 'box-squat.mp4',
  'Squat su Box': 'box-squat.mp4',
  'Squat sulla Scatola': 'box-squat.mp4',
  'Assisted Pistol Squat': 'assisted-pistol-squat.mp4',
  'Pistol Squat Assistito': 'assisted-pistol-squat.mp4',
  'Pistol Assistito': 'assisted-pistol-squat.mp4',

  // === ADVANCED PUSH-UP VARIANTS ===
  'Archer Push-up': 'archer-push-up.mp4',
  'Archer Push Up': 'archer-push-up.mp4',
  'Piegamenti Arciere': 'archer-push-up.mp4',
  'Ring Push-up': 'ring-push-up.mp4',
  'Ring Push Up': 'ring-push-up.mp4',
  'Piegamenti agli Anelli': 'ring-push-up.mp4',
  'Typewriter Push-up': 'typewriter-push-up.mp4',
  'Typewriter Push Up': 'typewriter-push-up.mp4',
  'Piegamenti Macchina da Scrivere': 'typewriter-push-up.mp4',
  'Clap Push-up': 'clap-push-up.mp4',
  'Clap Push Up': 'clap-push-up.mp4',
  'Piegamenti con Battito': 'clap-push-up.mp4',
  'Piegamenti Esplosivi': 'clap-push-up.mp4',
  'Pseudo Planche Push-up': 'pseudo-planche-push-up.mp4',
  'Pseudo Planche Push Up': 'pseudo-planche-push-up.mp4',
  'Piegamenti Pseudo Planche': 'pseudo-planche-push-up.mp4',
  'Elevated Pike Push-up': 'elevated-pike-push-up.mp4',
  'Elevated Pike Push Up': 'elevated-pike-push-up.mp4',

  // === ADVANCED PULL-UP VARIANTS ===
  'Wide Grip Pull-up': 'wide-grip-pull-up.mp4',
  'Wide Grip Pull Up': 'wide-grip-pull-up.mp4',
  'Trazioni Presa Larga': 'wide-grip-pull-up.mp4',
  'Neutral Grip Pull-up': 'neutral-grip-pull-up.mp4',
  'Neutral Grip Pull Up': 'neutral-grip-pull-up.mp4',
  'Trazioni Presa Neutra': 'neutral-grip-pull-up.mp4',

  // === TRX / SUSPENSION ===
  'TRX Row': 'trx-row.mp4',
  'TRX Rows': 'trx-row.mp4',
  'Rematore TRX': 'trx-row.mp4',
  'Rematore in Sospensione': 'trx-row.mp4',

  // === CORE ADVANCED ===
  'Hollow Body Hold': 'hollow-body-hold.mp4',
  'Hollow Body': 'hollow-body-hold.mp4',
  'Hollow Hold': 'hollow-body-hold.mp4',
  'Posizione Cava': 'hollow-body-hold.mp4',
  'Tenuta Hollow': 'hollow-body-hold.mp4',
  'Corpo Cavo': 'hollow-body-hold.mp4',
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
  'Assisted Pistol Squat',
  'Lunges',
  'Reverse Lunge',
  'Step-up',
  'Leg Extension',
  'Pause Squat',
  'Squat Jump',
  'Split Squat',
  'Skater Squat',
  'Shrimp Squat',
  'Box Squat',

  // === LOWER PULL ===
  'Bodyweight Hip Hinge',
  'Conventional Deadlift',
  'Romanian Deadlift (RDL)',
  'Sumo Deadlift',
  'Good Morning',
  'Hip Thrust',
  'Elevated Hip Thrust',
  'Glute Bridge',
  'Single Leg Glute Bridge',
  'Single Leg RDL',
  'Nordic Curl',
  'Leg Curl',
  'Slider Leg Curl',

  // === UPPER PUSH HORIZONTAL ===
  'Push-up',
  'Bench Press',
  'Dumbbell Bench Press',
  'Incline Push-up',
  'Decline Push-up',
  'Diamond Push-up',
  'Archer Push-up',
  'Ring Push-up',
  'Typewriter Push-up',
  'Clap Push-up',
  'One Arm Push-up',
  'Dips',

  // === UPPER PUSH VERTICAL ===
  'Pike Push-up',
  'Elevated Pike Push-up',
  'Pseudo Planche Push-up',
  'Handstand Push-up',
  'Handstand Hold',
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
  'TRX Row',
  'Face Pull',

  // === UPPER PULL VERTICAL ===
  'Pull-up',
  'Wide Grip Pull-up',
  'Neutral Grip Pull-up',
  'Chin-up',
  'Lat Pulldown',
  'Assisted Pull-up',

  // === CORE ===
  'Plank',
  'Side Plank',
  'Hollow Body Hold',
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
