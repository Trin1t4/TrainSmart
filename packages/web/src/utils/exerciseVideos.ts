/**
 * Exercise Video Mapping
 * Mappa ogni esercizio al suo video locale in /videos/exercises/
 */

// Path base per i video su Supabase Storage
const VIDEO_BASE_PATH = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-videos';

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
  'Nordic Curl (Solo Eccentrica)': 'nordic-hamstring-curl.mp4',
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
  'Trazione Negativa (solo eccentrica)': 'standard-pull-up.mp4',
  'Chin-up': 'chin-up.mp4',
  'Chin-ups': 'chin-up.mp4',
  'Trazioni Supine': 'chin-up.mp4',
  'Trazioni Presa Supina': 'chin-up.mp4',
  'Band-Assisted Pull-up': 'assisted-pull-up.mp4',
  'Assisted Pull-up': 'assisted-pull-up.mp4',
  'Trazioni Assistite': 'assisted-pull-up.mp4',
  'Trazioni con Elastico': 'assisted-pull-up.mp4',
  'Trazione con Elastico': 'assisted-pull-up.mp4',

  // === PUSH-UP varianti ===
  'Push-up Standard': 'standard-push-up.mp4',
  'Push-up': 'standard-push-up.mp4',
  'Standard Push-up': 'standard-push-up.mp4',
  'Piegamenti': 'standard-push-up.mp4',
  'Piegamenti sulle Braccia': 'standard-push-up.mp4',
  'Flessioni': 'standard-push-up.mp4',
  // Knee push-up
  'Push-up su Ginocchia': 'knee-push-up.mp4',
  'Push-up sulle Ginocchia': 'knee-push-up.mp4',
  'Push-up Ginocchia': 'knee-push-up.mp4',
  'Knee Push-up': 'knee-push-up.mp4',
  'Piegamenti sulle Ginocchia': 'knee-push-up.mp4',
  // Decline push-up
  'Decline Push-up': 'decline-push-up.mp4',
  'Piegamenti Declinati': 'decline-push-up.mp4',
  'Piegamenti Piedi Elevati': 'decline-push-up.mp4',
  // Incline push-up
  'Incline Push-up': 'incline-push-up.mp4',
  'Push-up Inclinato': 'incline-push-up.mp4',
  'Piegamenti Inclinati': 'incline-push-up.mp4',
  'Piegamenti su Rialzo': 'incline-push-up.mp4',
  'Push-up Inclinati': 'incline-push-up.mp4',
  // Diamond push-up
  'Diamond Push-up': 'diamond-push-up.mp4',
  'Piegamenti Diamante': 'diamond-push-up.mp4',
  'Piegamenti Stretti': 'diamond-push-up.mp4',
  'Push-up Diamante': 'diamond-push-up.mp4',
  'Push-up Stretti': 'diamond-push-up.mp4',
  'Push-up Mani Strette': 'diamond-push-up.mp4',
  'Close Grip Push-up': 'diamond-push-up.mp4',
  'Narrow Push-up': 'diamond-push-up.mp4',
  // Wide push-up
  'Wide Push-up': 'standard-push-up.mp4',
  'Push-up Larghi': 'standard-push-up.mp4',
  'Push-up Presa Larga': 'standard-push-up.mp4',
  'Piegamenti Larghi': 'standard-push-up.mp4',
  // Wall push-up
  'Wall Push-up': 'wall-push-up.mp4',
  'Wall Push Up': 'wall-push-up.mp4',
  'Push-up al Muro': 'wall-push-up.mp4',
  'Piegamenti al Muro': 'wall-push-up.mp4',
  'Flessioni al Muro': 'wall-push-up.mp4',
  // Pike push-up (altre varianti in ADVANCED PUSH-UP)
  'Piegamenti Pike': 'pike-push-up.mp4',

  // === SQUAT varianti ===
  'Air Squat': 'modified-squat.mp4',
  'Squat': 'modified-squat.mp4',
  'Squat Assistito': 'modified-squat.mp4',
  'Squat Completo': 'deep-squat-hold.mp4',
  'Bodyweight Squat': 'modified-squat.mp4',
  'Squat a Corpo Libero': 'modified-squat.mp4',
  'Accosciata': 'modified-squat.mp4',
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
  'Squat Bulgaro': 'bulgarian-split-squat.mp4',
  'Affondi Bulgari': 'bulgarian-split-squat.mp4',
  'Pistol Squat': 'pistol-squat.mp4',
  'Squat su una Gamba': 'pistol-squat.mp4',

  // === LEG CURL varianti ===
  'Slider Leg Curl': 'slider-leg-curl.mp4',
  'Sliding Leg Curl': 'slider-leg-curl.mp4',
  'Leg Curl con Slider': 'slider-leg-curl.mp4',
  'Leg Curl Scivolato': 'slider-leg-curl.mp4',
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
  'Assisted Pistol': 'assisted-pistol-squat.mp4',
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

  // === FMS (Functional Movement Screening) ===
  'FMS Deep Squat': 'fms-deep-squat.mp4',
  'FMS Hurdle Step': 'fms-hurdle-step.mp4',
  'FMS Inline Lunge': 'fms-inline-lunge.mp4',
  'FMS Active Straight Leg Raise': 'fms-active-straight-leg-raise.mp4',
  'FMS Trunk Stability Push-up': 'fms-trunk-stability-push-up.mp4',
  'FMS Rotary Stability': 'fms-rotary-stability.mp4',
  'Hurdle Step': 'fms-hurdle-step.mp4',
  'Inline Lunge': 'fms-inline-lunge.mp4',
  'Active Straight Leg Raise': 'fms-active-straight-leg-raise.mp4',
  'Trunk Stability Push-up': 'fms-trunk-stability-push-up.mp4',
  'Rotary Stability': 'fms-rotary-stability.mp4',

  // === NECK (Esercizi per il collo) ===
  'Neck Flexion': 'neck-flexion.mp4',
  'Neck Extension': 'neck-extension.mp4',
  'Neck Lateral Flexion': 'neck-lateral-flexion.mp4',
  'Flessione Collo': 'neck-flexion.mp4',
  'Estensione Collo': 'neck-extension.mp4',
  'Flessione Laterale Collo': 'neck-lateral-flexion.mp4',
  'Neck Rotation': 'neck-rotation.mp4',
  'Rotazione Collo': 'neck-rotation.mp4',
  'Neck Harness Exercise': 'neck-harness-exercise.mp4',

  // === KETTLEBELL ===
  'Kettlebell Swing': 'kettlebell-swing.mp4',
  'Swing con Kettlebell': 'kettlebell-swing.mp4',
  'Kettlebell Clean': 'kettlebell-clean.mp4',
  'Clean con Kettlebell': 'kettlebell-clean.mp4',
  'Kettlebell Snatch': 'kettlebell-snatch.mp4',
  'Snatch con Kettlebell': 'kettlebell-snatch.mp4',
  'Turkish Get Up': 'turkish-get-up.mp4',
  'Turkish Get-Up': 'turkish-get-up.mp4',
  'Alzata Turca': 'turkish-get-up.mp4',

  // === FUNCTIONAL / CONDITIONING ===
  'Battle Ropes': 'battle-ropes.mp4',
  'Corde da Battaglia': 'battle-ropes.mp4',
  'Farmers Walk': 'farmers-walk.mp4',
  "Farmer's Walk": 'farmers-walk.mp4',
  'Camminata del Contadino': 'farmers-walk.mp4',
  'Sandbag Carry': 'sandbag-carry.mp4',
  'Trasporto Sandbag': 'sandbag-carry.mp4',
  'Sled Push': 'sled-push.mp4',
  'Spinta Slitta': 'sled-push.mp4',
  'Sled Pull': 'sled-pull.mp4',
  'Tirata Slitta': 'sled-pull.mp4',
  'Landmine Press': 'landmine-press.mp4',
  'Pressa Landmine': 'landmine-press.mp4',
  'Fire Hydrant': 'fire-hydrant.mp4',
  'Idrante': 'fire-hydrant.mp4',
  'Cable Kickback': 'cable-kickback.mp4',
  'Kickback ai Cavi': 'cable-kickback.mp4',

  // === PLYOMETRICS / JUMP TRAINING ===
  'Box Jump': 'box-jump.mp4',
  'Salto al Box': 'box-jump.mp4',
  'Salto sulla Scatola': 'box-jump.mp4',
  'Broad Jump': 'broad-jump.mp4',
  'Salto in Lungo': 'broad-jump.mp4',
  'Counter Movement Jump': 'counter-movement-jump.mp4',
  'CMJ': 'counter-movement-jump.mp4',
  'Salto Contromovimento': 'counter-movement-jump.mp4',
  'Drop Jump': 'drop-jump.mp4',
  'Salto di Caduta': 'drop-jump.mp4',
  'Squat Jump Test': 'squat-jump-test.mp4',

  // === MED BALL / POWER ===
  'Med Ball Chest Pass': 'med-ball-chest-pass.mp4',
  'Lancio Petto Palla Medica': 'med-ball-chest-pass.mp4',
  'Med Ball Overhead Throw': 'med-ball-overhead-throw.mp4',
  'Lancio Sopra Testa Palla Medica': 'med-ball-overhead-throw.mp4',

  // === CALISTHENICS AVANZATO ===
  'Copenhagen Plank': 'copenhagen-plank.mp4',
  'Plank Copenhagen': 'copenhagen-plank.mp4',
  'Dragon Flag': 'dragon-flag.mp4',
  'Bandiera del Drago': 'dragon-flag.mp4',
  'L-Sit': 'l-sit.mp4',
  'L Sit': 'l-sit.mp4',
  'Tenuta a L': 'l-sit.mp4',
  'L-sit Raccolto': 'l-sit.mp4',
  'Tuck L-Sit': 'l-sit.mp4',
  'Lying Leg Raise': 'lying-leg-raise.mp4',
  'Alzate Gambe Supino': 'lying-leg-raise.mp4',
  'Alzate Gambe a Terra': 'lying-leg-raise.mp4',
  'Pistol Squat V2': 'pistol-squat-v2.mp4',
  'One Arm Push-up': 'one-arm-push-up.mp4',
  'Piegamenti a Un Braccio': 'one-arm-push-up.mp4',

  // === HIP HINGE BODYWEIGHT ===
  'Hip Hinge a Corpo Libero': 'bodyweight-hip-hinge.mp4',
  'Hip Hinge Bodyweight': 'bodyweight-hip-hinge.mp4',

  // === VERTICAL PUSH ===
  'Verticale al Muro Push-up': 'wall-handstand-push-up.mp4',
  'HSPU al Muro': 'wall-handstand-push-up.mp4',
  'Camminata al Muro': 'wall-handstand-push-up.mp4',
  'Wall Walk': 'wall-handstand-push-up.mp4',

  // === FLOOR PULL (Bodyweight rowing alternatives) ===
  'Floor Pull': 'floor-pull.mp4',
  'Floor Pull (asciugamano)': 'floor-pull.mp4',
  'Floor Pull con Asciugamano': 'floor-pull.mp4',
  'Prone Row': 'floor-pull.mp4',
  'Superman Row': 'floor-pull.mp4',
  'Remata a Terra': 'band-rows.mp4',

  // === ADDITIONAL EXERCISES ===
  // Back Extension
  'Back Extension': 'back-extension-roman-chair.mp4',
  'Back Extension (Roman Chair)': 'back-extension-roman-chair.mp4',
  'Iperestensioni': 'back-extension-roman-chair.mp4',
  'Estensioni Schiena': 'back-extension-roman-chair.mp4',

  // Band Rows
  'Band Rows': 'band-rows.mp4',
  'Rematore con Banda': 'band-rows.mp4',

  // Banded Hip Thrust
  'Banded Hip Thrust': 'banded-hip-thrust.mp4',
  'Hip Thrust con Banda': 'banded-hip-thrust.mp4',

  // Cable Fly varianti
  'Cable Fly High to Low': 'cable-fly-high-to-low.mp4',
  'Cable Fly (High to Low)': 'cable-fly-high-to-low.mp4',
  'Croci ai Cavi Alto-Basso': 'cable-fly-high-to-low.mp4',
  'Cable Fly Low to High': 'cable-fly-low-to-high.mp4',
  'Cable Fly (Low to High)': 'cable-fly-low-to-high.mp4',
  'Croci ai Cavi Basso-Alto': 'cable-fly-low-to-high.mp4',
  'Cable Fly Mid': 'cable-fly-mid.mp4',
  'Cable Fly': 'cable-fly-mid.mp4',
  'Croci ai Cavi': 'cable-fly-mid.mp4',

  // Cable Pull Through
  'Cable Pull Through': 'cable-pull-through.mp4',
  'Pull Through ai Cavi': 'cable-pull-through.mp4',

  // Chest Supported Row
  'Chest Supported Row': 'chest-supported-row.mp4',
  'Rematore con Supporto Petto': 'chest-supported-row.mp4',

  // Close Grip Bench Press
  'Close Grip Bench Press': 'close-grip-bench-press.mp4',
  'Panca Presa Stretta': 'close-grip-bench-press.mp4',
  'Distensioni Presa Stretta': 'close-grip-bench-press.mp4',

  // Concentration Curl
  'Concentration Curl': 'concentration-curl.mp4',
  'Curl di Concentrazione': 'concentration-curl.mp4',

  // Cuban Press
  'Cuban Press': 'cuban-press.mp4',
  'Pressa Cubana': 'cuban-press.mp4',

  // Decline Bench Press
  'Decline Bench Press': 'decline-bench-press.mp4',
  'Panca Declinata': 'decline-bench-press.mp4',

  // Donkey Calf Raise
  'Donkey Calf Raise': 'donkey-calf-raise.mp4',
  'Polpacci alla Donkey': 'donkey-calf-raise.mp4',

  // Dumbbell Fly
  'Dumbbell Fly': 'dumbbell-fly.mp4',
  'Croci con Manubri': 'dumbbell-fly.mp4',
  'Aperture con Manubri': 'dumbbell-fly.mp4',

  // External Rotation
  'External Rotation (Band)': 'external-rotation-band.mp4',
  'Rotazione Esterna con Banda': 'external-rotation-band.mp4',
  'External Rotation (Cable)': 'external-rotation-cable.mp4',
  'Rotazione Esterna ai Cavi': 'external-rotation-cable.mp4',
  'External Rotation': 'external-rotation-cable.mp4',

  // Frog Pump
  'Frog Pump': 'frog-pump.mp4',
  'Pompa Rana': 'frog-pump.mp4',

  // Hack Squat
  'Hack Squat': 'hack-squat.mp4',
  'Squat Hack': 'hack-squat.mp4',

  // Hanging Knee Raise
  'Hanging Knee Raise': 'hanging-knee-raise.mp4',
  'Alzate Ginocchia alla Sbarra': 'hanging-knee-raise.mp4',

  // Hollow Body Rock
  'Hollow Body Rock': 'hollow-body-rock.mp4',
  'Dondolo Hollow': 'hollow-body-rock.mp4',

  // Incline Bench Press
  'Incline Barbell Bench Press': 'incline-barbell-bench-press.mp4',
  'Panca Inclinata Bilanciere': 'incline-barbell-bench-press.mp4',
  'Incline Bench Press': 'incline-barbell-bench-press.mp4',
  'Incline Dumbbell Bench Press': 'incline-dumbbell-bench-press.mp4',
  'Panca Inclinata Manubri': 'incline-dumbbell-bench-press.mp4',

  // Incline Dumbbell Curl
  'Incline Dumbbell Curl': 'incline-dumbbell-curl.mp4',
  'Curl Inclinato con Manubri': 'incline-dumbbell-curl.mp4',

  // Lying Leg Curl
  'Lying Leg Curl': 'lying-leg-curl.mp4',
  'Leg Curl Prono': 'lying-leg-curl.mp4',

  // Meadows Row
  'Meadows Row': 'meadows-row.mp4',
  'Rematore Meadows': 'meadows-row.mp4',

  // Overhead Tricep Extension
  'Overhead Tricep Extension': 'overhead-tricep-extension.mp4',
  'Estensione Tricipiti Sopra la Testa': 'overhead-tricep-extension.mp4',

  // Pec Deck
  'Pec Deck': 'pec-deck-machine-fly.mp4',
  'Pec Deck Machine Fly': 'pec-deck-machine-fly.mp4',
  'Pectoral Machine': 'pec-deck-machine-fly.mp4',

  // Pendlay Row
  'Pendlay Row': 'pendlay-row.mp4',
  'Rematore Pendlay': 'pendlay-row.mp4',

  // Preacher Curl
  'Preacher Curl': 'preacher-curl.mp4',
  'Curl alla Panca Scott': 'preacher-curl.mp4',
  'Scott Curl': 'preacher-curl.mp4',

  // Pullover
  'Pullover': 'pullover-dumbbell.mp4',
  'Pullover Dumbbell': 'pullover-dumbbell.mp4',
  'Pullover con Manubrio': 'pullover-dumbbell.mp4',

  // Rear Delt
  'Rear Delt Fly (Cable)': 'rear-delt-fly-cable.mp4',
  'Rear Delt Fly Cable': 'rear-delt-fly-cable.mp4',
  'Alzate Posteriori ai Cavi': 'rear-delt-fly-cable.mp4',
  'Rear Delt Fly (Dumbbell)': 'rear-delt-fly-dumbbell.mp4',
  'Rear Delt Fly Dumbbell': 'rear-delt-fly-dumbbell.mp4',
  'Rear Delt Fly': 'rear-delt-fly-dumbbell.mp4',
  'Alzate Posteriori': 'rear-delt-fly-dumbbell.mp4',

  // Reverse Hyperextension
  'Reverse Hyperextension': 'reverse-hyperextension.mp4',
  'Iperestensione Inversa': 'reverse-hyperextension.mp4',

  // Reverse Nordic Curl
  'Reverse Nordic Curl': 'reverse-nordic-curl.mp4',
  'Nordic Curl Inverso': 'reverse-nordic-curl.mp4',

  // Seal Row
  'Seal Row': 'seal-row.mp4',
  'Rematore Foca': 'seal-row.mp4',

  // Seated Leg Curl
  'Seated Leg Curl': 'seated-leg-curl.mp4',
  'Leg Curl Seduto': 'seated-leg-curl.mp4',

  // Single Leg Calf Raise
  'Single Leg Calf Raise': 'single-leg-calf-raise.mp4',
  'Polpacci su una Gamba': 'single-leg-calf-raise.mp4',

  // Single Leg Hip Thrust
  'Single Leg Hip Thrust': 'single-leg-hip-thrust.mp4',
  'Hip Thrust su una Gamba': 'single-leg-hip-thrust.mp4',

  // Sissy Squat
  'Sissy Squat': 'sissy-squat.mp4',
  'Squat Sissy': 'sissy-squat.mp4',

  // Spanish Squat
  'Spanish Squat': 'spanish-squat.mp4',
  'Squat Spagnolo': 'spanish-squat.mp4',

  // Spider Curl
  'Spider Curl': 'spider-curl.mp4',
  'Curl Ragno': 'spider-curl.mp4',

  // Straight Arm Pulldown
  'Straight Arm Pulldown': 'straight-arm-pulldown.mp4',
  'Pulldown Braccia Tese': 'straight-arm-pulldown.mp4',

  // Swiss Ball Leg Curl
  'Swiss Ball Leg Curl': 'swiss-ball-leg-curl.mp4',
  'Leg Curl con Palla Svizzera': 'swiss-ball-leg-curl.mp4',

  // Tibialis Raise
  'Tibialis Raise': 'tibialis-raise.mp4',
  'Alzata Tibiale': 'tibialis-raise.mp4',

  // Tricep Kickback
  'Tricep Kickback': 'tricep-kickback.mp4',
  'Kickback Tricipiti': 'tricep-kickback.mp4',

  // V-Up
  'V-Up': 'v-up.mp4',
  'V Up': 'v-up.mp4',
  'Crunch a V': 'v-up.mp4',

  // === VARIANTI ESERCIZI (mapping a video esistenti) ===

  // Ab Wheel varianti
  'Ab Wheel (in ginocchio)': 'ab-wheel-rollout.mp4',
  'Barbell Rollout': 'ab-wheel-rollout.mp4',
  'Stability Ball Rollout': 'ab-wheel-rollout.mp4',

  // Pull-up varianti
  'Band Pull-up': 'assisted-pull-up.mp4',
  'Negative Pull-up': 'standard-pull-up.mp4',

  // Bench Press varianti
  'Bench Press (leggero)': 'flat-barbell-bench-press.mp4',
  'Panca Piana con Bilanciere': 'flat-barbell-bench-press.mp4',
  'Panca con Manubri': 'dumbbell-bench-press.mp4',
  'Panca Inclinata': 'incline-barbell-bench-press.mp4',
  'Panca Inclinata con Manubri': 'incline-dumbbell-bench-press.mp4',
  'Floor Press': 'flat-barbell-bench-press.mp4',
  'Floor Press con Manubri': 'dumbbell-bench-press.mp4',
  'Decline Dumbbell Press': 'decline-bench-press.mp4',
  'Incline Dumbbell Press': 'incline-dumbbell-bench-press.mp4',
  'Single Arm Dumbbell Press': 'dumbbell-bench-press.mp4',

  // Machine varianti
  'Chest Press (Macchina)': 'flat-barbell-bench-press.mp4',
  'Machine Chest Press': 'flat-barbell-bench-press.mp4',
  'Incline Chest Press (Macchina)': 'incline-barbell-bench-press.mp4',
  'Shoulder Press (Macchina)': 'dumbbell-shoulder-press.mp4',
  'Machine Shoulder Press': 'dumbbell-shoulder-press.mp4',
  'Machine Row': 'seated-cable-row.mp4',
  'Machine Crunch': 'cable-crunch.mp4',

  // Squat varianti
  'Bulgarian Split Squat profondo': 'bulgarian-split-squat.mp4',
  'Dumbbell Squat': 'goblet-squat.mp4',
  'Dumbbell Front Squat': 'goblet-squat.mp4',
  'Goblet Squat (leggero)': 'goblet-squat.mp4',
  'Smith Machine Squat': 'back-squat.mp4',
  'Sumo Squat': 'sumo-deadlift.mp4',
  'Zercher Squat': 'front-squat.mp4',

  // Deadlift varianti
  'Dumbbell Deadlift': 'conventional-deadlift.mp4',
  'Dumbbell Sumo Deadlift': 'sumo-deadlift.mp4',
  'Dumbbell RDL': 'romanian-deadlift.mp4',
  'Stacco con Manubri': 'conventional-deadlift.mp4',
  'Stacco in Deficit': 'conventional-deadlift.mp4',
  'Stacco Rumeno con Manubri': 'romanian-deadlift.mp4',

  // Cable varianti
  'Cable Curl + Pulldown': 'lat-pulldown.mp4',
  'Cable Lateral Raise': 'lateral-raise.mp4',
  'Cable Pullover': 'straight-arm-pulldown.mp4',
  'Cable Rotation': 'pallof-press.mp4',
  'High Cable Fly': 'cable-fly-high-to-low.mp4',
  'Low Cable Fly': 'cable-fly-low-to-high.mp4',
  'Pushdown ai Cavi': 'tricep-pushdown.mp4',
  'Seated Cable Row (presa alta)': 'seated-cable-row.mp4',

  // Lat Pulldown varianti
  'Neutral Grip Lat Pulldown': 'lat-pulldown.mp4',
  'Supinated Lat Pulldown': 'lat-pulldown.mp4',
  'Wide Grip Lat Pulldown': 'lat-pulldown.mp4',

  // Cable Pulldown
  'Cable Pulldown': 'cable-pulldown.mp4',
  'Pulldown ai Cavi': 'cable-pulldown.mp4',
  'Cable Lat Pulldown': 'cable-pulldown.mp4',

  // Shoulder Press varianti
  'Dumbbell Push Press': 'dumbbell-shoulder-press.mp4',
  'Dumbbell Shoulder Press (pesante)': 'dumbbell-shoulder-press.mp4',
  'Shoulder Press con Manubri': 'dumbbell-shoulder-press.mp4',
  'Push Press': 'military-press.mp4',

  // Row varianti
  'Landmine Row': 't-bar-row.mp4',

  // Leg Press varianti
  'Leg Press (piedi alti)': 'leg-press.mp4',
  'Single Leg Press': 'leg-press.mp4',
  'Wide Stance Leg Press': 'leg-press.mp4',
  'Pressa': 'leg-press.mp4',

  // Core varianti
  'Captain Chair Leg Raise': 'hanging-leg-raise.mp4',
  'Weighted Crunch': 'cable-crunch.mp4',
  'TRX Fallout': 'ab-wheel-rollout.mp4',

  // Leg Curl varianti
  'GHD Raise': 'nordic-hamstring-curl.mp4',
  'Nordic Curl (eccentrico)': 'nordic-hamstring-curl.mp4',

  // Push-up varianti
  'Pike Push-up (elevato)': 'elevated-pike-push-up.mp4',
  'Push-up (piedi rialzati)': 'decline-push-up.mp4',
  'Push-up (weighted)': 'standard-push-up.mp4',

  // Dips varianti
  'Dip Tricipiti': 'tricep-dips.mp4',

  // Raise varianti
  'Lateral Raise + Press': 'lateral-raise.mp4',

  // Carry varianti
  'Suitcase Carry': 'farmers-walk.mp4',

  // Thruster / compound
  'Thruster': 'front-squat.mp4',

  // Wall varianti
  'Wall Sit': 'wall-sit-breathing.mp4',
};

/**
 * Ottieni URL del video per un esercizio
 */
export function getExerciseVideoUrl(exerciseName: string): string {
  // Check override manuale
  if (VIDEO_OVERRIDES[exerciseName]) {
    return `${VIDEO_BASE_PATH}/${VIDEO_OVERRIDES[exerciseName]}`;
  }

  // Genera URL automatico
  const fileName = exerciseNameToFileName(exerciseName);
  return `${VIDEO_BASE_PATH}/${fileName}`;
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

  // === FMS SCREENING ===
  'FMS Deep Squat',
  'FMS Hurdle Step',
  'FMS Inline Lunge',
  'FMS Active Straight Leg Raise',
  'FMS Trunk Stability Push-up',
  'FMS Rotary Stability',

  // === NECK ===
  'Neck Flexion',
  'Neck Extension',
  'Neck Lateral Flexion',

  // === PLYOMETRICS ===
  'Box Jump',
  'Broad Jump',
  'Counter Movement Jump',
  'Drop Jump',

  // === MED BALL ===
  'Med Ball Chest Pass',
  'Med Ball Overhead Throw',

  // === CALISTHENICS AVANZATO ===
  'Copenhagen Plank',
  'Dragon Flag',
  'L-Sit',
  'Lying Leg Raise',
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
