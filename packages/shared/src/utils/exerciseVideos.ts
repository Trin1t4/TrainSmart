/**
 * Exercise Video Mapping
 * Mappa ogni esercizio al suo video su Supabase Storage
 */

// URL base di Supabase Storage
// Costruito dinamicamente dall'URL Supabase configurato
const getSupabaseStorageUrl = () => {
  const importMeta = typeof import.meta !== 'undefined' ? (import.meta as any) : {};
  const supabaseUrl = importMeta.env?.VITE_SUPABASE_URL
    ? importMeta.env.VITE_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
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
 * Aggiungi qui override se il nome automatico non funziona
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
  'Plank to Pike': 'pike-push-up.mp4',

  // === NORDIC CURL varianti ===
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

  // === ROW varianti ===
  'Barbell Row': 'barbell-row.mp4',
  'Rematore Bilanciere': 'barbell-row.mp4',
  'Dumbbell Row': 'dumbbell-row.mp4',
  'Rematore Manubri': 'dumbbell-row.mp4',
  'T-Bar Row': 't-bar-row.mp4',
  'Seated Cable Row': 'seated-cable-row.mp4',
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
  'Dumbbell Shoulder Press': 'dumbbell-shoulder-press.mp4',
  'Shoulder Press Manubri': 'dumbbell-shoulder-press.mp4',
  'Arnold Press': 'arnold-press.mp4',

  // === RAISE ===
  'Lateral Raise': 'lateral-raise.mp4',
  'Lateral Raises': 'lateral-raise.mp4',
  'Front Raise': 'front-raise.mp4',
  'Front Raises': 'front-raise.mp4',

  // === CORE ===
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

  // =============================================
  // NOMI ITALIANI (mapping a video inglesi)
  // =============================================

  // === SQUAT PATTERN ===
  'Squat a Corpo Libero': 'bodyweight-squat.mp4',
  'Squat con Pausa': 'pause-squat.mp4',
  'Squat con Salto': 'squat-jump.mp4',
  'Squat Bulgaro': 'bulgarian-split-squat.mp4',
  'Squat a Pistola': 'pistol-squat.mp4',
  'Squat a Pistola (Assistito)': 'assisted-pistol-squat.mp4',
  'Pistol Squat Assistito': 'assisted-pistol-squat.mp4',
  'Assisted Pistol': 'assisted-pistol-squat.mp4',
  'Squat Gamberetto': 'shrimp-squat.mp4',
  'Squat del Pattinatore': 'skater-squat.mp4',
  'Squat con Bilanciere': 'back-squat.mp4',
  'Squat Frontale': 'front-squat.mp4',
  'Squat al Box': 'box-squat.mp4',
  'Affondi Statici': 'split-squat.mp4',
  'Affondi Indietro': 'reverse-lunge.mp4',
  'Affondi Camminati': 'lunges.mp4',
  'Pressa': 'leg-press.mp4',

  // === LOWER PULL (Hip Hinge / Deadlift) ===
  'Ponte Glutei': 'glute-bridge.mp4',
  'Ponte Glutei Monopodalico': 'single-leg-glute-bridge.mp4',
  'Ponte Glutei a Una Gamba': 'single-leg-glute-bridge.mp4',
  'Hip Thrust Elevato': 'elevated-hip-thrust.mp4',
  'Hip Thrust Monopodalico': 'single-leg-glute-bridge.mp4',
  'Stacco Rumeno Monopodalico': 'single-leg-rdl.mp4',
  'Leg Curl Scorrevole': 'slider-leg-curl.mp4',
  'Leg Curl Scorrevole Singolo': 'slider-leg-curl.mp4',
  'Nordic Curl (Solo Eccentrica)': 'nordic-hamstring-curl.mp4',

  // === PUSH-UP PATTERN ===
  'Push-up Diamante': 'diamond-push-up.mp4',
  'Push-up Arciere': 'archer-push-up.mp4',
  'Push-up a Un Braccio': 'one-arm-push-up.mp4',
  'Push-up a Un Braccio (Assistito)': 'one-arm-push-up.mp4',
  'Push-up Declinati': 'decline-push-up.mp4',
  'Push-up Inclinati': 'incline-push-up.mp4',
  'Push-up Deficit': 'decline-push-up.mp4',
  'Push-up al Muro': 'wall-push-up.mp4',
  'Push-up Typewriter': 'typewriter-push-up.mp4',
  'Push-up agli Anelli': 'ring-push-up.mp4',
  'Piegamenti': 'standard-push-up.mp4',
  'Panca con Manubri': 'dumbbell-bench-press.mp4',
  'Panca Inclinata': 'incline-bench-press.mp4',
  'Panca Inclinata Manubri': 'incline-dumbbell-press.mp4',

  // === VERTICAL PUSH (Pike / HSPU) ===
  'Pike Push-up Elevato': 'elevated-pike-push-up.mp4',
  'Pike Push-up Alto': 'elevated-pike-push-up.mp4',
  'Pike Push-up sulle Ginocchia': 'pike-push-up.mp4',
  'HSPU al Muro': 'wall-handstand-push-up.mp4',
  'HSPU al Muro (Solo Eccentrica)': 'wall-handstand-push-up.mp4',
  'Verticale Push-up Libero': 'wall-handstand-push-up.mp4',
  'Verticale al Muro Push-up': 'wall-handstand-push-up.mp4',
  'Shoulder Tap al Muro': 'wall-handstand-push-up.mp4',
  'Shoulder Press con Manubri': 'dumbbell-shoulder-press.mp4',

  // === VERTICAL PULL (Trazioni) ===
  'Trazioni': 'standard-pull-up.mp4',
  'Trazioni Presa Larga': 'wide-grip-pull-up.mp4',
  'Trazioni Presa Neutra': 'neutral-grip-pull-up.mp4',
  'Trazioni Presa Stretta': 'chin-up.mp4',
  'Trazioni Negative': 'standard-pull-up.mp4',
  'Trazioni con Elastico': 'assisted-pull-up.mp4',
  'Trazioni Arciere': 'archer-pull-up.mp4',
  'Chin-up (Supinato)': 'chin-up.mp4',
  'Lat Machine Presa Larga': 'lat-pulldown.mp4',
  'Lat Machine Presa Stretta': 'lat-pulldown.mp4',
  'Floor Pull con Asciugamano': 'band-rows.mp4',

  // === HORIZONTAL PULL (Row) ===
  'Rematore Inverso': 'inverted-row.mp4',
  'Rematore Inverso (tavolo)': 'inverted-row.mp4',
  'Rematore Inverso Facilitato': 'inverted-row.mp4',
  'Rematore Inverso Piedi Elevati': 'inverted-row.mp4',
  'Rematore Inverso a Un Braccio': 'inverted-row.mp4',
  'Rematore con Bilanciere': 'barbell-row.mp4',
  'Rematore con Manubrio': 'dumbbell-row.mp4',
  'Rematore T-Bar': 't-bar-row.mp4',
  'Pulley Basso': 'seated-cable-row.mp4',
  'Row agli Anelli': 'trx-row.mp4',

  // === CORE ===
  'Plank Laterale': 'side-plank.mp4',
  'Plank Laterale (Modificato)': 'side-plank-modified.mp4',
  'Alzate Gambe alla Sbarra': 'hanging-leg-raise.mp4',
  'Alzate Gambe a Terra': 'lying-leg-raise.mp4',
  'Crunch ai Cavi': 'cable-crunch.mp4',
  'Crunch Bicicletta': 'bicycle-crunch.mp4',
  'Crunch Inverso': 'reverse-crunch.mp4',
  'Pallof Press (in Ginocchio)': 'pallof-press-kneeling.mp4',
  'Leg Raise alla Sbarra': 'hanging-leg-raise.mp4',
  'Ginocchia al Petto alla Sbarra': 'hanging-knee-raise.mp4',

  // === ACCESSORI ===
  'Curl con Manubri': 'barbell-curl.mp4',
  'Curl con Bilanciere': 'barbell-curl.mp4',
  'Alzate Laterali': 'lateral-raise.mp4',
  'Alzate Frontali': 'front-raise.mp4',
  'Alzate Posteriori': 'face-pull.mp4',
  'Calf Raise': 'standing-calf-raise.mp4',
  'Calf Raise Seduto': 'seated-calf-raise.mp4',
  'Calf Raise in Piedi': 'standing-calf-raise.mp4',
  'Dip Tricipiti': 'tricep-dips.mp4',
  'Dips per Petto': 'chest-dips.mp4',
  'Croci ai Cavi': 'cable-fly.mp4',
  'French Press': 'skull-crushers.mp4',

  // === ESERCIZI CORRETTIVI ===
  'Respiro Connesso': 'connection-breath.mp4',
  'Respirazione Diaframmatica': 'diaphragmatic-breathing.mp4',
  'Attivazione Pavimento Pelvico': 'pelvic-floor-activation.mp4',
  'Tenuta Squat Profondo': 'deep-squat-hold.mp4',
  'Inclinazioni Pelviche': 'pelvic-tilts.mp4',
  'Bird Dog (Modificato)': 'bird-dog-modified.mp4',
  'Dead Bug con Scivolamenti': 'dead-bug-heel-slides.mp4',
  'Progressione Dead Bug': 'dead-bug-progression.mp4',
  'Marcia Supina': 'supine-marching.mp4',
  'Marcia in Piedi': 'standing-march.mp4',
  'Tenuta dell\'Orso': 'bear-hold.mp4',
  'Muro con Respirazione': 'wall-sit-breathing.mp4',
  'Alzate Ginocchia Seduto': 'seated-knee-lifts.mp4',
  'Chop in Ginocchio': 'half-kneeling-chop.mp4',
  'Remata con Elastico': 'seated-row-band.mp4',
  'Alzate Gambe Laterali': 'side-lying-leg-lift.mp4',
  'Cerchi dell\'Anca': 'standing-hip-circles.mp4',
  'Attivazione Scapolare': 'shoulder-blade-squeeze.mp4',

  // =============================================
  // FMS (Functional Movement Screening)
  // =============================================
  'FMS Deep Squat': 'fms-deep-squat.mp4',
  'FMS Hurdle Step': '39 FMS Hurdle Step.mp4',
  'FMS Inline Lunge': '40 FMS Inline Lunge.mp4',
  'FMS Active Straight Leg Raise': '41 FMS Active Straight Leg Raise.mp4',
  'FMS Trunk Stability Push-up': '42 FMS Trunk Stability Push-up.mp4',
  'FMS Rotary Stability': '43 FMS Rotary Stability.mp4',
  'Hurdle Step': '39 FMS Hurdle Step.mp4',
  'Inline Lunge': '40 FMS Inline Lunge.mp4',
  'Active Straight Leg Raise': '41 FMS Active Straight Leg Raise.mp4',
  'Trunk Stability Push-up': '42 FMS Trunk Stability Push-up.mp4',
  'Rotary Stability': '43 FMS Rotary Stability.mp4',

  // =============================================
  // NECK (Esercizi per il collo)
  // =============================================
  'Neck Flexion': '44 Neck Flexion.mp4',
  'Neck Extension': '45 Neck Extension.mp4',
  'Neck Lateral Flexion': '46 Neck Lateral Flexion.mp4',
  'Neck Rotation': '47 Neck Rotation.mp4',
  'Neck Harness Exercise': '48 Neck Harness Exercise.mp4',
  'Flessione Collo': '44 Neck Flexion.mp4',
  'Estensione Collo': '45 Neck Extension.mp4',
  'Flessione Laterale Collo': '46 Neck Lateral Flexion.mp4',
  'Rotazione Collo': '47 Neck Rotation.mp4',
  'Esercizio con Imbracatura Collo': '48 Neck Harness Exercise.mp4',

  // =============================================
  // PLYOMETRICS / JUMP TRAINING
  // =============================================
  'Box Jump': 'box-jump.mp4',
  'Salto al Box': 'box-jump.mp4',
  'Broad Jump': 'broad-jump.mp4',
  'Salto in Lungo': 'broad-jump.mp4',
  'Counter Movement Jump': 'counter-movement-jump.mp4',
  'CMJ': 'counter-movement-jump.mp4',
  'Salto Contromovimento': 'counter-movement-jump.mp4',
  'Drop Jump': 'drop-jump.mp4',
  'Salto di Caduta': 'drop-jump.mp4',
  'Squat Jump Test': 'squat-jump-test.mp4',

  // =============================================
  // MED BALL / POWER
  // =============================================
  'Med Ball Chest Pass': 'med-ball-chest-pass.mp4',
  'Lancio Petto Palla Medica': 'med-ball-chest-pass.mp4',
  'Med Ball Overhead Throw': 'med-ball-overhead-throw.mp4',
  'Lancio Sopra Testa Palla Medica': 'med-ball-overhead-throw.mp4',

  // =============================================
  // CALISTHENICS AVANZATO
  // =============================================
  'Clap Push-up': 'clap-push-up.mp4',
  'Push-up con Battito': 'clap-push-up.mp4',
  'Push-up Esplosivi': 'clap-push-up.mp4',
  'Copenhagen Plank': 'copenhagen-plank.mp4',
  'Plank Copenhagen': 'copenhagen-plank.mp4',
  'Dragon Flag': 'dragon-flag.mp4',
  'Bandiera del Drago': 'dragon-flag.mp4',
  'Hollow Body Hold': 'hollow-body-hold.mp4',
  'Hollow Hold': 'hollow-body-hold.mp4',
  'Tenuta Corpo Cavo': 'hollow-body-hold.mp4',
  'L-Sit': 'l-sit.mp4',
  'L Sit': 'l-sit.mp4',
  'Handstand Hold': 'handstand-hold.mp4',
  'Tenuta in Verticale': 'handstand-hold.mp4',
  'Pseudo Planche Push-up': 'pseudo-planche-push-up.mp4',
  'Push-up Pseudo Planche': 'pseudo-planche-push-up.mp4',
  'Knee Push-up': 'knee-push-up.mp4',
  'Push-up sulle Ginocchia': 'knee-push-up.mp4',
  'Lying Leg Raise': 'lying-leg-raise.mp4',
  'Alzate Gambe Supino': 'lying-leg-raise.mp4',
  'Side Plank': 'side-plank.mp4',
  'Plank Laterale Completo': 'side-plank.mp4',
  'Pistol Squat V2': 'pistol-squat-v2.mp4',
  'V-Up': '55 V-Up.mp4',
  'V Up': '55 V-Up.mp4',
  'Hollow Body Rock': '54 Hollow Body Rock.mp4',
  'Oscillazione Corpo Cavo': '54 Hollow Body Rock.mp4',

  // =============================================
  // BACK EXTENSION / HYPEREXTENSION
  // =============================================
  'Back Extension': '50 Back Extension Roman Chair.mp4',
  'Back Extension Roman Chair': '50 Back Extension Roman Chair.mp4',
  'Back Extension 45°': '50 Back Extension Roman Chair.mp4',
  'Back Extension 45 Gradi': '50 Back Extension Roman Chair.mp4',
  '45 Degree Back Extension': '50 Back Extension Roman Chair.mp4',
  'Estensioni Schiena': '50 Back Extension Roman Chair.mp4',
  'Estensioni Schiena 45°': '50 Back Extension Roman Chair.mp4',
  'Iperestensioni': '50 Back Extension Roman Chair.mp4',
  'Iperestensioni 45°': '50 Back Extension Roman Chair.mp4',
  'Hyperextension': '50 Back Extension Roman Chair.mp4',
  'Hyperextension 45°': '50 Back Extension Roman Chair.mp4',
  'Reverse Hyperextension': '51 Reverse Hyperextension.mp4',
  'Iperestensioni Inverse': '51 Reverse Hyperextension.mp4',
  'Reverse Nordic Curl': '53 Reverse Nordic Curl.mp4',
  'Nordic Curl Inverso': '53 Reverse Nordic Curl.mp4',

  // =============================================
  // BENCH PRESS VARIANTI
  // =============================================
  'Incline Barbell Bench Press': '57 Incline Barbell Bench Press.mp4',
  'Panca Inclinata Bilanciere': '57 Incline Barbell Bench Press.mp4',
  'Incline Dumbbell Bench Press': '58 Incline Dumbbell Bench Press.mp4',
  'Panca Inclinata con Manubri': '58 Incline Dumbbell Bench Press.mp4',
  'Decline Bench Press': '59 Decline Bench Press.mp4',
  'Panca Declinata': '59 Decline Bench Press.mp4',

  // =============================================
  // CABLE EXERCISES
  // =============================================
  'Cable Fly High to Low': '60 Cable Fly High to Low.mp4',
  'Croci ai Cavi Alto-Basso': '60 Cable Fly High to Low.mp4',

  // =============================================
  // HANGING EXERCISES
  // =============================================
  'Hanging Knee Raise': '56 Hanging Knee Raise.mp4',
  'Ginocchia al Petto Sospeso': '56 Hanging Knee Raise.mp4',

  // =============================================
  // TRX / SUSPENSION
  // =============================================
  'TRX Row': 'trx-row.mp4',
  'Row al TRX': 'trx-row.mp4',

  // =============================================
  // GOBLET SQUAT
  // =============================================
  'Goblet Squat': 'goblet-squat.mp4',
  'Squat Goblet': 'goblet-squat.mp4',
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
  'Squat Jump',

  // === MED BALL ===
  'Med Ball Chest Pass',
  'Med Ball Overhead Throw',

  // === CALISTHENICS AVANZATO ===
  'Clap Push-up',
  'Copenhagen Plank',
  'Dragon Flag',
  'Hollow Body Hold',
  'L-Sit',
  'Handstand Hold',
  'Pseudo Planche Push-up',
  'Knee Push-up',
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
