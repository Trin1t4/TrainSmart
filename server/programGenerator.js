import { 
  getExerciseForLocation 
} from './exerciseSubstitutions.js'

// ===== MAPPING PROGRESSIONI BODYWEIGHT =====

const BODYWEIGHT_PROGRESSIONS = {
  'Squat': {
    1: 'Squat Assistito',
    2: 'Squat Completo',
    3: 'Jump Squat',
    4: 'Pistol Assistito',
    5: 'Pistol Completo'
  },
  'Panca': {
    1: 'Push-up su Ginocchia',
    2: 'Push-up Standard',
    3: 'Push-up Mani Strette',
    4: 'Archer Push-up',
    5: 'One-Arm Push-up'
  },
  'Trazioni': {
    1: 'Floor Pull (asciugamano)',
    2: 'Inverted Row 45°',
    3: 'Inverted Row 30°',
    4: 'Australian Pull-up',
    5: 'Pull-up Completa'
  },
  'Press': {
    1: 'Plank to Pike',
    2: 'Pike Push-up',
    3: 'Pike Push-up Elevato',
    4: 'Handstand Assistito',
    5: 'Handstand Push-up'
  },
  'Stacco': {
    1: 'Affondi',
    2: 'Squat Bulgaro',
    3: 'Single Leg Deadlift',
    4: 'Jump Lunge',
    5: 'Pistol Squat'
  }
}

// ===== CONFIGURAZIONE LIVELLI =====

const LEVEL_CONFIG = {
  beginner: {
    RIR: 3,
    repsRange: 2,
    startPercentage: 0.60,  // OK per principianti
    compoundSets: 3,
    accessorySets: 2
  },
  intermediate: {
    RIR: 2,
    repsRange: 1,
    startPercentage: 0.85,  // ← CAMBIA da 0.75 a 0.85
    compoundSets: 4,
    accessorySets: 3
  },
  advanced: {
    RIR: 1,
    repsRange: 0,
    startPercentage: 0.90,  // ← CAMBIA da 0.85 a 0.90
    compoundSets: 5,
    accessorySets: 3
  }
}

// ===== MOTOR RECOVERY CONFIGURATION (+ COLLO) =====

const MOTOR_RECOVERY_GOALS = {
  'neck_mobility': {
    name: 'Recupero Collo - Mobilità',
    exercises: [
      { name: 'Neck Flexion/Extension', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Lento e controllato' },
      { name: 'Cervical Lateral Flexion', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Inclinazione laterale' },
      { name: 'Neck Rotation', sets: 3, reps: '15 per lato', rest: 45, weight: null, notes: 'Rotazione controllata' },
      { name: 'Shoulder Shrugs', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Spallucce lente' },
      { name: 'Scapular Retraction Hold', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Spalle indietro' },
      { name: 'Chin Tucks', sets: 3, reps: '15-20', rest: 45, weight: null, notes: 'Mento in dentro' }
    ]
  },
  'neck_stability': {
    name: 'Recupero Collo - Stabilità',
    exercises: [
      { name: 'Isometric Neck Hold (Neutral)', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Tenuta posizione neutra' },
      { name: 'Cervical Isometric Flexion', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza in avanti' },
      { name: 'Cervical Isometric Extension', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Resistenza indietro' },
      { name: 'Cervical Isometric Lateral (per lato)', sets: 3, reps: '25s per lato', rest: 60, weight: null, notes: 'Resistenza laterale' },
      { name: 'Trapezius Activation Band Pull-Apart', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Trapezio superiore' },
      { name: 'Prone Cobra Hold', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Estensione dolce' }
    ]
  },
  'ankle_stability': {
    name: 'Stabilità Caviglia',
    exercises: [
      { name: 'Single Leg Stance', sets: 3, reps: '30-60s', rest: 60, weight: null, notes: 'Su una gamba' },
      { name: 'Ankle Circles', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Seated Ankle Dorsiflexion', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Flessione dorsale' },
      { name: 'Calf Raises su Una Gamba', sets: 3, reps: '12-15', rest: 90, weight: null, notes: 'Single leg' },
      { name: 'Balance Board Work', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Propriocezione' },
      { name: 'Proprioceptive Training', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Equilibrio' }
    ]
  },
  'knee_stability': {
    name: 'Stabilità Ginocchio',
    exercises: [
      { name: 'Isometric Quad Hold', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Quadricipiti statici' },
      { name: 'Short Arc Quads', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Range limitato' },
      { name: 'VMO Work', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Vasto mediale' },
      { name: 'Glute Bridge Isometric', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Ponte statico' },
      { name: 'Single Leg Balance', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Equilibrio su gamba' },
      { name: 'Step-Up Recovery', sets: 3, reps: '10 per lato', rest: 90, weight: null, notes: 'Scalini bassi' }
    ]
  },
  'hip_mobility': {
    name: 'Mobilità Anca',
    exercises: [
      { name: 'Hip Flexor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Allungamento flessori' },
      { name: 'Pigeon Pose', sets: 3, reps: '60s', rest: 90, weight: null, notes: 'Posizione piccione' },
      { name: 'Clamshells', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Aperture anca' },
      { name: 'Hip Rotations', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Rotazioni controllate' },
      { name: 'Glute Activation Bridges', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Attivazione glutei' },
      { name: 'Fire Log Stretch', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Allungamento profondo' }
    ]
  },
  'shoulder_stability': {
    name: 'Stabilità Spalla',
    exercises: [
      { name: 'Scapular Push-up', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Spalla protetta' },
      { name: 'Shoulder Blade Squeeze', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Contrazione scapola' },
      { name: 'External Rotation Prone', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Rotazione esterna' },
      { name: 'Band Pull-Apart', sets: 3, reps: '20', rest: 60, weight: null, notes: 'Elastico strappo' },
      { name: 'Dead Hang Hold', sets: 3, reps: '20-30s', rest: 90, weight: null, notes: 'Tenuta sbarra' },
      { name: 'Shoulder Shrugs Isometric', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Spallucce statiche' }
    ]
  },
  'lower_back_rehabilitation': {
    name: 'Riabilitazione Schiena',
    exercises: [
      { name: 'Quadruped Bird Dogs', sets: 3, reps: '12 per lato', rest: 60, weight: null, notes: 'Coordinazione core' },
      { name: 'Dead Bugs', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Schiena protetta' },
      { name: 'Modified Planks', sets: 3, reps: '20-30s', rest: 60, weight: null, notes: 'Plank sicuro' },
      { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: 90, weight: null, notes: 'Ponte completo' },
      { name: 'Cat-Cow Stretches', sets: 3, reps: '10', rest: 60, weight: null, notes: 'Mobilità vertebrale' },
      { name: 'Child Pose Hold', sets: 3, reps: '45-60s', rest: 90, weight: null, notes: 'Posizione riposo' }
    ]
  },
  'wrist_mobility': {
    name: 'Mobilità Polso',
    exercises: [
      { name: 'Wrist Circles', sets: 3, reps: '15 per direzione', rest: 45, weight: null, notes: 'Movimenti circolari' },
      { name: 'Wrist Flexor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Flessori' },
      { name: 'Wrist Extensor Stretch', sets: 3, reps: '45s', rest: 60, weight: null, notes: 'Estensori' },
      { name: 'Pronate/Supinate Movements', sets: 3, reps: '15', rest: 60, weight: null, notes: 'Pronazione/supinazione' },
      { name: 'Wall Wrist Holds', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Isometrico' },
      { name: 'Wrist Curls Light', sets: 3, reps: '15-20', rest: 60, weight: null, notes: 'Carico leggero' }
    ]
  }
}

// ===== HELPER FUNCTIONS (UNICO BLOCCO - NO DUPLICATI) =====

function isBodyweightExercise(exerciseName) {
  const bodyweightKeywords = [
    'corpo libero', 'bodyweight', 'push-up', 'pull-up', 'trazioni', 'dips',
    'plank', 'hollow body', 'superman', 'handstand', 'pike push-up',
    'diamond push-up', 'archer push-up', 'nordic curl', 'pistol squat',
    'jump', 'burpee', 'mountain climber', 'flutter kick', 'bicycle crunch',
    'leg raise', 'australian pull-up', 'inverted row', 'floor pull',
    'dead hang', 'scapular', 'floor slide', 'bird dog', 'l-sit', 'assistito',
    'squat bulgaro', 'affondi', 'glute bridge', 'wall sit', 'calf raises',
    'chin-up', 'negative', 'isometric', 'hold', 'ytw', 'mobility', 'stretch'
  ]

  const name = exerciseName.toLowerCase()
  return bodyweightKeywords.some(keyword => name.includes(keyword))
}

function hasWeightedEquipment(equipment) {
  if (!equipment) return false
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  )
}

function convertToBodyweight(exerciseName, level) {
  const name = exerciseName.toLowerCase()
  console.log(`[CONVERT] Converting "${exerciseName}" to bodyweight for ${level}`)

  // GAMBE - SQUAT
  if (name.includes('squat') && !name.includes('bulgaro') && !name.includes('pistol')) {
    if (name.includes('front')) {
      if (level === 'beginner') return 'Squat Assistito'
      if (level === 'intermediate') return 'Squat Completo'
      return 'Jump Squat'
    }
    if (level === 'beginner') return 'Squat Assistito'
    if (level === 'intermediate') return 'Squat Completo'
    return 'Pistol Assistito'
  }

  if (name.includes('leg press')) {
    if (level === 'beginner') return 'Squat Completo'
    if (level === 'intermediate') return 'Squat Bulgaro'
    return 'Pistol Assistito'
  }

  // GAMBE - STACCHI
  if (name.includes('stacco') || name.includes('deadlift')) {
    if (name.includes('romanian') || name.includes('rumeno')) {
      if (level === 'beginner') return 'Glute Bridge'
      if (level === 'intermediate') return 'Single Leg Glute Bridge'
      return 'Single Leg Deadlift'
    }
    if (name.includes('sumo')) {
      if (level === 'beginner') return 'Squat Sumo'
      if (level === 'intermediate') return 'Squat Sumo con Pausa'
      return 'Jump Squat Sumo'
    }
    if (level === 'beginner') return 'Affondi'
    if (level === 'intermediate') return 'Squat Bulgaro'
    return 'Single Leg Deadlift'
  }

  if (name.includes('good morning')) {
    if (level === 'beginner') return 'Glute Bridge'
    if (level === 'intermediate') return 'Hip Thrust a Corpo Libero'
    return 'Nordic Curl Eccentrico'
  }

  // GAMBE - ISOLAMENTO
  if (name.includes('leg curl')) {
    if (level === 'beginner') return 'Glute Bridge'
    if (level === 'intermediate') return 'Single Leg Glute Bridge'
    return 'Nordic Curl'
  }

  if (name.includes('leg extension')) {
    if (level === 'beginner') return 'Wall Sit'
    if (level === 'intermediate') return 'Squat Isometrico'
    return 'Pistol Squat Eccentrico'
  }

  if (name.includes('calf')) {
    if (level === 'beginner') return 'Calf Raises Doppia Gamba'
    if (level === 'intermediate') return 'Calf Raises Singola Gamba'
    return 'Calf Raises Saltellando'
  }

  if (name.includes('hip thrust')) {
    if (level === 'beginner') return 'Glute Bridge'
    if (level === 'intermediate') return 'Hip Thrust a Corpo Libero'
    return 'Single Leg Hip Thrust'
  }

  if (name.includes('affondi') || name.includes('lunge')) {
    if (name.includes('jump')) return 'Jump Lunge'
    if (level === 'beginner') return 'Affondi'
    if (level === 'intermediate') return 'Affondi Camminati'
    return 'Jump Lunge'
  }

  if (name.includes('bulgaro')) {
    if (level === 'beginner') return 'Affondi'
    if (level === 'intermediate') return 'Squat Bulgaro'
    return 'Squat Bulgaro con Salto'
  }

  // PUSH - PETTORALI
  if (name.includes('panca') || name.includes('bench') || (name.includes('press') && !name.includes('leg'))) {
    if (name.includes('inclinat')) {
      if (level === 'beginner') return 'Pike Push-up'
      if (level === 'intermediate') return 'Pike Push-up Elevato'
      return 'Handstand Push-up Assistito'
    }
    if (level === 'beginner') return 'Push-up su Ginocchia'
    if (level === 'intermediate') return 'Push-up Standard'
    return 'Push-up Mani Strette'
  }

  // PUSH - SPALLE
  if (name.includes('military') || name.includes('shoulder') || name.includes('arnold') || (name.includes('press') && (name.includes('spalle') || name.includes('overhead')))) {
    if (level === 'beginner') return 'Pike Push-up'
    if (level === 'intermediate') return 'Pike Push-up Elevato'
    return 'Handstand Push-up Assistito'
  }

  if (name.includes('push press')) {
    if (level === 'beginner') return 'Pike Push-up'
    if (level === 'intermediate') return 'Pike Push-up con Salto'
    return 'Handstand Push-up'
  }

  // PUSH - DIPS E TRICIPITI
  if (name.includes('dips')) {
    if (level === 'beginner') return 'Dips su Sedia Assistiti'
    if (level === 'intermediate') return 'Dips su Sedia'
    return 'Dips Completi'
  }

  if (name.includes('croci') || name.includes('fly') || name.includes('cavi')) {
    if (level === 'beginner') return 'Plank Shoulder Taps'
    if (level === 'intermediate') return 'Pseudo Planche Lean'
    return 'Pseudo Planche Hold'
  }

  if (name.includes('lateral raise') || name.includes('alzate laterali')) {
    if (level === 'beginner') return 'Plank Shoulder Taps'
    if (level === 'intermediate') return 'Pike Hold'
    return 'L-Sit Progressione'
  }

  if (name.includes('tricep') || name.includes('french')) {
    if (level === 'beginner') return 'Diamond Push-up su Ginocchia'
    if (level === 'intermediate') return 'Diamond Push-up'
    return 'Triangle Push-up'
  }

  // PULL - TRAZIONI
  if (name.includes('trazioni') || name.includes('pull-up') || name.includes('pullup') || name.includes('lat machine') || name.includes('lat pull')) {
    if (name.includes('chin') || name.includes('presa stretta')) {
      if (level === 'beginner') return 'Chin-up Isometric Hold'
      if (level === 'intermediate') return 'Chin-up Negative'
      return 'Chin-up'
    }
    if (level === 'beginner') return 'Floor Pull (asciugamano)'
    if (level === 'intermediate') return 'Inverted Row 45°'
    return 'Australian Pull-up'
  }

  // PULL - REMATORE
  if (name.includes('rematore') || name.includes('row')) {
    if (level === 'beginner') return 'Inverted Row 45°'
    if (level === 'intermediate') return 'Inverted Row 30°'
    return 'Inverted Row Orizzontale'
  }

  // PULL - BICIPITI
  if (name.includes('curl')) {
    if (level === 'beginner') return 'Chin-up Isometric Hold'
    if (level === 'intermediate') return 'Chin-up Negative'
    return 'Archer Pull-up'
  }

  // PULL - POSTERIORI SPALLA
  if (name.includes('face pull') || name.includes('rear delt')) {
    if (level === 'beginner') return 'Scapular Slides a Terra'
    if (level === 'intermediate') return 'YTW su Pavimento'
    return 'Scapular Pull-up'
  }

  if (name.includes('shrug')) return 'Dead Hang'

  // CORE
  if (name.includes('plank')) {
    if (level === 'beginner') return 'Plank su Ginocchia'
    if (level === 'intermediate') return 'Plank Standard'
    return 'Plank con Sollevamenti'
  }

  if (name.includes('crunch') || name.includes('sit-up') || name.includes('sit up')) {
    if (level === 'beginner') return 'Dead Bug'
    if (level === 'intermediate') return 'Bicycle Crunch'
    return 'V-ups'
  }

  if (name.includes('leg raise') || name.includes('leg raises')) {
    if (level === 'beginner') return 'Knee Raises'
    if (level === 'intermediate') return 'Leg Raises'
    return 'Toes to Bar'
  }

  console.warn(`[CONVERT] ⚠️ No bodyweight alternative for: "${exerciseName}"`)
  if (level === 'beginner') return 'Plank'
  if (level === 'intermediate') return 'Mountain Climbers'
  return 'Burpees'
}

function mapBodyweightToGymExercise(bodyweightName) {
  const mapping = {
    'Push-up Standard': 'Panca Piana',
    'Push-up su Ginocchia': 'Panca Piana',
    'Pike Push-up': 'Military Press',
    'Handstand Push-up Assistito': 'Military Press',
    'Dips su Sedia': 'Dips',
    'Floor Pull (asciugamano)': 'Lat Pulldown',
    'Inverted Row 45°': 'Rematore Bilanciere',
    'Australian Pull-up': 'Trazioni Assistite',
    'Squat Assistito': 'Squat',
    'Squat Completo': 'Squat',
    'Affondi': 'Leg Press',
    'Glute Bridge': 'Hip Thrust',
    'Plank': 'Ab Wheel'
  }
  return mapping[bodyweightName] || bodyweightName
}

function getBaseLoads(assessments) {
  if (!assessments || !Array.isArray(assessments)) {
    console.warn('[PROGRAM] ⚠️ assessments undefined, using defaults')
    return { squat: 50, deadlift: 60, bench: 40, pull: 30, press: 30 }
  }

  const findLoad = (exercise) => {
    const assessment = assessments.find((a) =>
      a.exerciseName?.toLowerCase().includes(exercise.toLowerCase())
    )
    return assessment ? assessment.oneRepMax : 50
  }

  return {
    squat: findLoad('squat'),
    deadlift: findLoad('stacco'),
    bench: findLoad('panca'),
    pull: findLoad('trazioni') || findLoad('pull'),
    press: findLoad('press') || findLoad('spalle')
  }
}

function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null
  const maxReps = targetReps + RIR
  const weight = oneRM * (37 - maxReps) / 36
  return Math.round(weight / 2.5) * 2.5
}

function calculateSleepReduction(hours) {
  if (hours < 5) return 0.7
  if (hours < 6) return 0.80
  if (hours < 7) return 0.90
  if (hours <= 9) return 1.0
  return 0.95
}

function calculateStressReduction(stressLevel) {
  if (stressLevel <= 1) return 1.0
  if (stressLevel === 2) return 0.95
  if (stressLevel === 3) return 0.90
  if (stressLevel === 4) return 0.80
  return 0.60
}

function generateScreeningWarnings(sleepHours, stressLevel, painAreas) {
  const warnings = []
  if (sleepHours < 6) warnings.push('⚠️ Poco sonno: riduci volume e intensità')
  if (stressLevel >= 4) warnings.push('⚠️ Stress alto: riduci carichi pesanti')
  if (painAreas.length > 0) warnings.push(`⚠️ Dolori presenti: salta esercizi che li coinvolgono`)
  return warnings
}

function isExerciseSafeForPregnancy(exerciseName) {
  const unsafeExercises = [
    'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
    'Panca Piana', 'Bench Press', 'Floor Press',
    'Stacco', 'Deadlift', 'Romanian Deadlift', 'Good Morning',
    'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
    'Front Squat', 'Back Squat'
  ]
  return !unsafeExercises.some(unsafe =>
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  )
}

function isExerciseSafeForDisability(exerciseName, disabilityType) {
  const complexExercises = [
    'Clean', 'Snatch', 'Clean & Jerk',
    'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
    'Overhead Squat', 'Snatch Grip Deadlift'
  ]
  return !complexExercises.some(complex =>
    exerciseName.toLowerCase().includes(complex.toLowerCase())
  )
}

function getPregnancySafeAlternative(exerciseName) {
  const alternatives = {
    'Panca Piana': 'Panca Inclinata 45°',
    'Bench Press': 'Incline Press',
    'Stacco': 'Hip Thrust',
    'Deadlift': 'Goblet Squat',
    'Squat': 'Goblet Squat',
    'Crunch': 'Bird Dog'
  }
  for (const [unsafe, safe] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(unsafe.toLowerCase())) return safe
  }
  return exerciseName
}

function getDisabilitySafeAlternative(exerciseName) {
  const alternatives = {
    'Bulgarian Split Squat': 'Leg Press',
    'Single Leg RDL': 'Seated Leg Curl',
    'Pistol Squat': 'Chair Squat'
  }
  for (const [complex, simple] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(complex.toLowerCase())) return simple
  }
  return exerciseName
}

function adjustRepsForDetraining(repsString, detrainingFactor) {
  if (typeof repsString !== 'string') return repsString
  if (repsString.includes('-')) {
    const [min, max] = repsString.split('-').map(Number)
    const newMin = Math.round(min * detrainingFactor)
    const newMax = Math.round(max * detrainingFactor)
    return `${newMin}-${newMax}`
  }
  return Math.round(Number(repsString) * detrainingFactor).toString()
}

// ===== PRE-WORKOUT SCREENING =====

export function conductPreWorkoutScreening(completedScreening) {
  const { sleepHours = 7, stressLevel = 3, painAreas = [] } = completedScreening

  console.log('[SCREENING] 📋 Pre-workout assessment:', { sleepHours, stressLevel, painAreas })

  const sleepReduction = calculateSleepReduction(sleepHours)
  const stressReduction = calculateStressReduction(stressLevel)
  const combinedReduction = Math.min(sleepReduction, stressReduction)

  return {
    screening: {
      sleep: sleepHours,
      stress: stressLevel,
      painAreas: painAreas,
      timestamp: new Date().toISOString()
    },
    recommendations: {
      intensityMultiplier: combinedReduction,
      shouldReduceVolume: combinedReduction < 0.85,
      shouldFocusOnRecovery: painAreas.length > 0 && stressLevel >= 4,
      volumeReduction: combinedReduction < 0.85 ? 1 - combinedReduction : 0
    },
    warnings: generateScreeningWarnings(sleepHours, stressLevel, painAreas)
  }
}

// ===== RUNTIME SESSION ADAPTATION =====

export function adaptSessionToRuntimeContext(plannedSession, runtimeContext) {
  const { actualLocation, emergingPainAreas = [], currentAssessments = [], detrainingFactor = 1.0, screeningResults = null } = runtimeContext

  console.log('[RUNTIME] 🔄 Adapting session to runtime context:', {
    actualLocation,
    emergingPainAreas,
    detrainingFactor,
    hasScreening: !!screeningResults
  })

  let adaptedSession = { ...plannedSession }

  if (actualLocation && actualLocation !== plannedSession.location) {
    console.log(`[RUNTIME] 📍 Location change: ${plannedSession.location} → ${actualLocation}`)
    adaptedSession = adaptLocationChange(adaptedSession, actualLocation, currentAssessments)
  }

  if (emergingPainAreas.length > 0) {
    console.log('[RUNTIME] 🩹 Pain areas detected:', emergingPainAreas)
    adaptedSession = adaptToPain(adaptedSession, emergingPainAreas, actualLocation || plannedSession.location)
  }

  if (detrainingFactor < 1.0) {
    console.log('[RUNTIME] 📉 Detraining factor:', detrainingFactor)
    adaptedSession = recalibrateSessionForDetraining(adaptedSession, detrainingFactor)
  }

  if (screeningResults?.recommendations) {
    console.log('[RUNTIME] 📋 Applying screening results:', screeningResults.recommendations)
    adaptedSession = applyScreeningReductions(adaptedSession, screeningResults)
  }

  adaptedSession.isAdapted = JSON.stringify(adaptedSession) !== JSON.stringify(plannedSession)
  adaptedSession.adaptedAt = new Date().toISOString()

  return adaptedSession
}

function adaptLocationChange(plannedSession, newLocation, assessments) {
  console.log(`[ADAPT] Location change: ${plannedSession.location} → ${newLocation}`)

  const adaptedExercises = plannedSession.exercises.map(exercise => {
    if (plannedSession.location === 'gym' && newLocation === 'home') {
      return convertGymExerciseToHome(exercise, assessments)
    }
    if (plannedSession.location === 'home' && newLocation === 'gym') {
      return convertHomeExerciseToGym(exercise, assessments)
    }
    return exercise
  })

  return {
    ...plannedSession,
    location: newLocation,
    exercises: adaptedExercises,
    notes: `⚠️ Runtime: ${plannedSession.location} → ${newLocation}`,
    isAdapted: true
  }
}

function convertGymExerciseToHome(exercise, assessments) {
  console.log(`[ADAPT] Gym→Home: ${exercise.name}`)

  if (exercise.weight && exercise.weight > 0) {
    const estimatedLevel = exercise.weight > 80 ? 'advanced' : exercise.weight > 50 ? 'intermediate' : 'beginner'
    const bodyweightName = convertToBodyweight(exercise.name, estimatedLevel)

    return {
      ...exercise,
      name: bodyweightName,
      weight: null,
      notes: `🔄 ${exercise.name} (${exercise.weight}kg) → ${bodyweightName}`
    }
  }
  return exercise
}

function convertHomeExerciseToGym(exercise, assessments) {
  console.log(`[ADAPT] Home→Gym: ${exercise.name}`)

  if (!isBodyweightExercise(exercise.name)) return exercise

  const gymEquivalent = mapBodyweightToGymExercise(exercise.name)
  const assessment = assessments?.find(a =>
    exercise.name.toLowerCase().includes(a.exerciseName?.toLowerCase())
  )

  let estimatedWeight = 40
  if (assessment?.oneRepMax) {
    estimatedWeight = assessment.oneRepMax * 0.7
  }

  return {
    ...exercise,
    name: gymEquivalent,
    weight: Math.round(estimatedWeight / 2.5) * 2.5,
    notes: `🔄 ${exercise.name} → ${gymEquivalent} (${estimatedWeight}kg)`
  }
}

function adaptToPain(plannedSession, painAreas, location) {
  console.log('[ADAPT] Adapting to pain:', painAreas)

  const adaptedExercises = plannedSession.exercises
    .map(exercise => adaptExerciseForPain(exercise, painAreas))
    .filter(ex => ex !== null)

  if (adaptedExercises.length < plannedSession.exercises.length * 0.5) {
    console.warn('[ADAPT] ⚠️ Too many exercises removed due to pain')
    return {
      ...plannedSession,
      exercises: adaptedExercises,
      isRecoverySession: true,
      notes: `Pain-adapted session - reduced volume`
    }
  }

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true,
    notes: `Adapted for: ${painAreas.join(', ')}`
  }
}

function adaptExerciseForPain(exercise, painAreas) {
  const name = exercise.name.toLowerCase()

  const painContraindications = {
    'neck': ['neck', 'heavy rows', 'shrugs'],
    'shoulder': ['panca', 'press', 'lateral raise', 'dips', 'push-up', 'pull-up'],
    'lower_back': ['stacco', 'deadlift', 'good morning', 'back squat', 'heavy rows'],
    'knee': ['squat', 'leg press', 'leg curl', 'leg extension', 'lunge', 'jump'],
    'ankle': ['calf raises', 'jump', 'single leg'],
    'wrist': ['curl', 'tricep', 'close grip', 'push-up'],
    'elbow': ['curl', 'tricep', 'close grip']
  }

  for (const painArea of painAreas) {
    const contraindications = painContraindications[painArea] || []
    if (contraindications.some(keyword => name.includes(keyword))) {
      console.log(`[ADAPT] ❌ Removing ${exercise.name} due to ${painArea} pain`)
      return null
    }
  }

  return {
    ...exercise,
    weight: exercise.weight ? exercise.weight * 0.7 : null,
    sets: Math.max(exercise.sets - 1, 1),
    notes: `⚠️ Pain-adapted: reduced intensity`
  }
}

function recalibrateSessionForDetraining(plannedSession, detrainingFactor) {
  console.log('[ADAPT] Detraining factor:', detrainingFactor)

  const adaptedExercises = plannedSession.exercises.map(exercise => ({
    ...exercise,
    weight: exercise.weight ? Math.round(exercise.weight * detrainingFactor / 2.5) * 2.5 : null,
    reps: adjustRepsForDetraining(exercise.reps, detrainingFactor),
    sets: Math.max(Math.round(exercise.sets * detrainingFactor), 1),
    notes: `📉 Detraining: ${(detrainingFactor * 100).toFixed(0)}%`
  }))

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true
  }
}

function applyScreeningReductions(plannedSession, screeningResults) {
  const { intensityMultiplier, shouldReduceVolume } = screeningResults.recommendations

  const adaptedExercises = plannedSession.exercises.map(exercise => {
    let adaptedExercise = { ...exercise }

    if (exercise.weight) {
      adaptedExercise.weight = Math.round(exercise.weight * intensityMultiplier / 2.5) * 2.5
    }

    if (shouldReduceVolume) {
      adaptedExercise.sets = Math.max(Math.round(exercise.sets * intensityMultiplier), 1)
    }

    return adaptedExercise
  })

  return {
    ...plannedSession,
    exercises: adaptedExercises,
    isAdapted: true,
    screeningApplied: true,
    notes: `📋 Screening applied: ${(intensityMultiplier * 100).toFixed(0)}%`
  }
}

// ===== MAIN BRANCHING LOGIC: ENTRY POINT =====

export function generateProgram(input) {
  const { level, frequency, location, equipment, painAreas = [], assessments = [], goal, disabilityType, sportRole } = input

  console.log('[PROGRAM] 🎯 ENTRY POINT - generateProgram with:', {
    level,
    frequency,
    location,
    goal,
    painAreasCount: painAreas?.length
  })

  // ===== RAMO 1: MOTOR RECOVERY / REHABILITATION =====
  if (goal === 'motor_recovery' || goal === 'rehabilitation' || (painAreas?.length > 0 && goal !== 'standard')) {
    console.log('[PROGRAM] 🏥 BRANCHING → MOTOR RECOVERY PROGRAM')
    return generateMotorRecoveryProgram({ level, painAreas, location, goal })
  }

  // ===== RAMO 2: PERFORMANCE SPORT HOME =====
  if (goal === 'performance' && (location === 'home' || !hasWeightedEquipment(equipment))) {
    console.log('[PROGRAM] 🏃 BRANCHING → PERFORMANCE HOME PROGRAM')
    return generatePerformanceHomeProgram({ level, frequency, assessments, sportRole })
  }

  // ===== RAMO 3: STANDARD TRAINING (GYM O HOME CON ATTREZZI) =====
  console.log('[PROGRAM] 💪 BRANCHING → STANDARD TRAINING PROGRAM')
  return generateStandardProgram({ level, frequency, location, equipment, painAreas, assessments, goal, disabilityType, sportRole })
}

// ===== RAMO 1: MOTOR RECOVERY PROGRAM =====

function generateMotorRecoveryProgram(input) {
  const { level, painAreas = [], location, goal } = input

  console.log('[PROGRAM] 🏥 generateMotorRecoveryProgram with:', { painAreas, level, goal })

  if (!painAreas || painAreas.length === 0) {
    console.warn('[PROGRAM] ⚠️ No pain areas specified for motor recovery')
    return {
      name: 'Recupero Motorio',
      description: 'Nessun area dolente specificata',
      split: 'motor_recovery',
      daysPerWeek: 0,
      weeklySchedule: [],
      isRecoveryProgram: true
    }
  }

  const weeklySchedule = []

  painAreas.forEach(area => {
    const recoveryConfig = MOTOR_RECOVERY_GOALS[area]

    if (!recoveryConfig) {
      console.warn(`[PROGRAM] ⚠️ No recovery config for: ${area}`)
      return
    }

    weeklySchedule.push({
      dayName: recoveryConfig.name,
      focus: area,
      location: location || 'home',
      exercises: recoveryConfig.exercises.map(ex => ({
        ...ex,
        weight: null,
        notes: '🏥 Recupero motorio - NO carico'
      }))
    })
  })

  return {
    name: `Riabilitazione ${level || 'beginner'} - Recupero Motorio`,
    description: `Programma specifico per: ${painAreas.join(', ')}`,
    split: 'motor_recovery',
    daysPerWeek: painAreas.length,
    weeklySchedule,
    progression: 'low_intensity_stability',
    includesDeload: true,
    deloadFrequency: 2,
    totalWeeks: 4,
    requiresEndCycleTest: false,
    isRecoveryProgram: true
  }
}

// ===== RAMO 2: PERFORMANCE HOME PROGRAM =====

function generatePerformanceHomeProgram(input) {
  const { level, frequency, assessments, sportRole } = input

  console.log('[PROGRAM] 🏃 generatePerformanceHomeProgram for:', sportRole)

  const weeklySchedule = []

  weeklySchedule.push({
    dayName: 'Esplosività Gambe',
    exercises: [
      { name: 'Jump Squat', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Focus esplosività' },
      { name: 'Broad Jump', sets: 3, reps: '5', rest: 120, weight: null, notes: 'Salto in lungo' },
      { name: 'Single Leg Hop', sets: 3, reps: '8 per gamba', rest: 90, weight: null, notes: 'Unilaterale' },
      { name: 'Squat Isometrico', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Tenuta 90°' },
      { name: 'Nordic Curl Eccentrico', sets: 3, reps: '5-6', rest: 120, weight: null, notes: 'Fase negativa lenta' },
      { name: 'Plank Dinamico', sets: 3, reps: '45-60s', rest: 60, weight: null, notes: 'Con spostamenti braccia' }
    ]
  })

  weeklySchedule.push({
    dayName: 'Esplosività Busto',
    exercises: [
      { name: 'Clap Push-up', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Piegamenti esplosivi' },
      { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 90, weight: null, notes: 'Usa oggetto pesante' },
      { name: 'Pull-up Esplosiva', sets: 3, reps: '5-6', rest: 120, weight: null, notes: 'Fase concentrica veloce' },
      { name: 'Plank to Push-up', sets: 3, reps: '12-15', rest: 60, weight: null, notes: 'Coordinazione core' },
      { name: 'Dead Hang Isometrico', sets: 3, reps: '30-45s', rest: 90, weight: null, notes: 'Tenuta sbarra' },
      { name: 'Bear Crawl', sets: 3, reps: '30s', rest: 60, weight: null, notes: 'Coordinazione full body' }
    ]
  })

  weeklySchedule.push({
    dayName: 'Conditioning Sport',
    exercises: [
      { name: 'Burpees', sets: 4, reps: '10-12', rest: 60, weight: null, notes: 'Conditioning generale' },
      { name: 'Lateral Bound', sets: 3, reps: '8 per lato', rest: 90, weight: null, notes: 'Agilità laterale' },
      { name: 'Mountain Climbers', sets: 3, reps: '20-30', rest: 45, weight: null, notes: 'Velocità' },
      { name: 'Pistol Squat Assistito', sets: 3, reps: '6-8 per gamba', rest: 120, weight: null, notes: 'Stabilità unilaterale' },
      { name: 'Hollow Body Hold', sets: 3, reps: '30-45s', rest: 60, weight: null, notes: 'Core isometrico' },
      { name: 'Sprint sul posto', sets: 4, reps: '20s', rest: 90, weight: null, notes: 'Conditioning anaerobico' }
    ]
  })

  return {
    name: `Performance Sport HOME - ${level}`,
    description: `${frequency}x/settimana, focus pliometria ed esplosività`,
    split: 'performance_home',
    daysPerWeek: frequency,
    weeklySchedule: weeklySchedule.slice(0, frequency),
    progression: 'progressive_overload_volume',
    includesDeload: level === 'intermediate' || level === 'advanced',
    deloadFrequency: 4,
    totalWeeks: 8,
    requiresEndCycleTest: true
  }
}

// ===== RAMO 3: STANDARD TRAINING PROGRAM =====

function generateStandardProgram(input) {
  const { level, frequency, location, equipment, painAreas = [], assessments = [], goal, disabilityType, sportRole } = input

  console.log('[PROGRAM] 💪 generateStandardProgram with:', { level, frequency, location })

  let split, daysPerWeek

  if (frequency <= 2) {
    split = 'full_body'
    daysPerWeek = frequency
  } else if (frequency === 3) {
    split = 'full_body'
    daysPerWeek = 3
  } else if (frequency === 4) {
    split = 'upper_lower'
    daysPerWeek = 4
  } else if (frequency === 5) {
    split = 'ppl_plus'
    daysPerWeek = 5
  } else {
    split = 'ppl'
    daysPerWeek = 6
  }

  let progression
  if (level === 'beginner') progression = 'wave_loading'
  else if (level === 'intermediate') progression = 'ondulata_settimanale'
  else progression = 'ondulata_giornaliera'
console.log('[GENERATOR] 🔍 DEBUG - location value:', location);
console.log('[GENERATOR] 🔍 DEBUG - location || gym result:', location || 'gym');
  const weeklySchedule = generateWeeklySchedule(
    split, daysPerWeek, location || 'gym', equipment, painAreas,
    assessments, level, goal, disabilityType, sportRole
  )

  const includesDeload = level === 'intermediate' || level === 'advanced'
  const deloadFrequency = includesDeload ? 4 : undefined
  const requiresEndCycleTest = goal === 'strength' || goal === 'muscle_gain' || goal === 'performance'

  let totalWeeks = 4
  if (goal === 'strength') totalWeeks = 8
  else if (goal === 'muscle_gain') totalWeeks = 12
  else if (goal === 'performance') totalWeeks = 8

  return {
    name: `Programma ${split.toUpperCase()} - ${level}`,
    description: `${daysPerWeek}x/settimana, progressione ${progression}`,
    split,
    daysPerWeek,
    location,
    weeklySchedule,
    progression,
    includesDeload,
    deloadFrequency,
    totalWeeks,
    requiresEndCycleTest
  }
}

// ===== WEEKLY SCHEDULE GENERATOR =====

function generateWeeklySchedule(split, daysPerWeek, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const schedule = []

  console.log('[PROGRAM] 📅 generateWeeklySchedule:', { split, daysPerWeek, location, level })

  if (split === 'full_body') {
    if (daysPerWeek === 1) {
      schedule.push({
        dayName: 'Full Body',
        location,
        exercises: generateFullBodyDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole)
      })
    } else if (daysPerWeek === 2) {
      schedule.push(
        { dayName: 'Full Body A', location, exercises: generateFullBodyDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
        { dayName: 'Full Body B', location, exercises: generateFullBodyDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) }
      )
    } else if (daysPerWeek === 3) {
      schedule.push(
        { dayName: 'Full Body A', location, exercises: generateFullBodyDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
        { dayName: 'Full Body B', location, exercises: generateFullBodyDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
        { dayName: 'Full Body C', location, exercises: generateFullBodyDay('C', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) }
      )
    }
  } else if (split === 'upper_lower') {
    schedule.push(
      { dayName: 'Upper A', location, exercises: generateUpperDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Lower A', location, exercises: generateLowerDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Upper B', location, exercises: generateUpperDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Lower B', location, exercises: generateLowerDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) }
    )
  } else if (split === 'ppl_plus') {
    schedule.push(
      { dayName: 'Push', location, exercises: generatePushDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Pull', location, exercises: generatePullDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Legs', location, exercises: generateLegsDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Upper', location, exercises: generateUpperDay('C', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Lower', location, exercises: generateLowerDay('C', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) }
    )
  } else {
    schedule.push(
      { dayName: 'Push A', location, exercises: generatePushDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Pull A', location, exercises: generatePullDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Legs A', location, exercises: generateLegsDay('A', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Push B', location, exercises: generatePushDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Pull B', location, exercises: generatePullDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) },
      { dayName: 'Legs B', location, exercises: generateLegsDay('B', location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) }
    )
  }

  return schedule
}

// ===== FULL BODY DAYS =====

function generateFullBodyDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    if (!painAreas?.includes('knee') && !painAreas?.includes('lower_back')) {
      exercises.push(createExercise(safeExercise('Squat'), location, equipment, baseLoad.squat, level, goal, 'compound', assessments))
    }
    if (!painAreas?.includes('shoulder')) {
      exercises.push(createExercise(safeExercise('Panca Piana'), location, equipment, baseLoad.bench, level, goal, 'compound', assessments))
    }
    exercises.push(createExercise('Trazioni', location, equipment, baseLoad.pull, level, goal, 'compound', assessments))
    if (!painAreas?.includes('lower_back')) {
      exercises.push(createExercise('Romanian Deadlift', location, equipment, baseLoad.deadlift * 0.7, level, goal, 'accessory', assessments))
    }
    if (!painAreas?.includes('shoulder')) {
      exercises.push(createExercise('Lateral Raises', location, equipment, baseLoad.press * 0.3, level, goal, 'isolation', assessments))
    }
    exercises.push(createExercise(goal === 'pregnancy' ? 'Bird Dog' : 'Plank', location, equipment, 0, level, goal, 'core', assessments))
  } else if (variant === 'B') {
    if (!painAreas?.includes('lower_back')) {
      exercises.push(createExercise(safeExercise('Stacco'), location, equipment, baseLoad.deadlift, level, goal, 'compound', assessments))
    }
    if (!painAreas?.includes('shoulder')) {
      exercises.push(createExercise(safeExercise('Panca Inclinata'), location, equipment, baseLoad.bench * 0.85, level, goal, 'compound', assessments))
    }
    exercises.push(createExercise('Rematore Bilanciere', location, equipment, baseLoad.pull * 0.9, level, goal, 'compound', assessments))
    if (!painAreas?.includes('knee')) {
      exercises.push(createExercise('Affondi', location, equipment, baseLoad.squat * 0.6, level, goal, 'accessory', assessments))
    }
    if (!painAreas?.includes('shoulder')) {
      exercises.push(createExercise('Military Press', location, equipment, baseLoad.press, level, goal, 'accessory', assessments))
    }
    exercises.push(createExercise('Leg Raises', location, equipment, 0, level, goal, 'core', assessments))
  } else if (variant === 'C') {
    if (!painAreas?.includes('knee')) {
      exercises.push(createExercise(safeExercise('Front Squat'), location, equipment, baseLoad.squat * 0.8, level, goal, 'compound', assessments))
    }
    exercises.push(createExercise('Dips', location, equipment, 0, level, goal, 'compound', assessments))
    exercises.push(createExercise('Trazioni Presa Stretta', location, equipment, baseLoad.pull * 0.95, level, goal, 'compound', assessments))
    if (!painAreas?.includes('lower_back')) {
      exercises.push(createExercise('Good Morning', location, equipment, baseLoad.deadlift * 0.5, level, goal, 'accessory', assessments))
    }
    exercises.push(createExercise('Face Pull', location, equipment, baseLoad.pull * 0.2, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Dead Bug', location, equipment, 0, level, goal, 'core', assessments))
  }

  return exercises
}

// ===== UPPER/LOWER DAYS =====

function generateUpperDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    exercises.push(createExercise(safeExercise('Panca Piana'), location, equipment, baseLoad.bench, level, goal, 'compound', assessments))
    exercises.push(createExercise('Trazioni', location, equipment, baseLoad.pull, level, goal, 'compound', assessments))
    exercises.push(createExercise('Military Press', location, equipment, baseLoad.press, level, goal, 'compound', assessments))
    exercises.push(createExercise('Curl Bilanciere', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Tricep Pushdown', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
  } else if (variant === 'B') {
    exercises.push(createExercise(safeExercise('Panca Inclinata'), location, equipment, baseLoad.bench * 0.85, level, goal, 'compound', assessments))
    exercises.push(createExercise('Rematore Bilanciere', location, equipment, baseLoad.pull * 0.9, level, goal, 'compound', assessments))
    exercises.push(createExercise('Arnold Press', location, equipment, baseLoad.press * 0.85, level, goal, 'compound', assessments))
    exercises.push(createExercise('Hammer Curl', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('French Press', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
  } else if (variant === 'C') {
    exercises.push(createExercise('Dips', location, equipment, 0, level, goal, 'compound', assessments))
    exercises.push(createExercise('Chin-up', location, equipment, baseLoad.pull * 0.95, level, goal, 'compound', assessments))
    exercises.push(createExercise('Push Press', location, equipment, baseLoad.press * 1.1, level, goal, 'compound', assessments))
    exercises.push(createExercise('Face Pull', location, equipment, baseLoad.pull * 0.2, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Lateral Raises', location, equipment, baseLoad.press * 0.3, level, goal, 'isolation', assessments))
  }

  return exercises
}

function generateLowerDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    exercises.push(createExercise(safeExercise('Squat'), location, equipment, baseLoad.squat, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Romanian Deadlift'), location, equipment, baseLoad.deadlift * 0.7, level, goal, 'compound', assessments))
    exercises.push(createExercise('Leg Curl', location, equipment, baseLoad.squat * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Leg Extension', location, equipment, baseLoad.squat * 0.3, level, goal, 'isolation', assessments))
    if (!painAreas?.includes('ankles')) {
      exercises.push(createExercise('Calf Raises', location, equipment, baseLoad.squat * 0.5, level, goal, 'isolation', assessments))
    }
  } else if (variant === 'B') {
    exercises.push(createExercise(safeExercise('Stacco'), location, equipment, baseLoad.deadlift, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Front Squat'), location, equipment, baseLoad.squat * 0.8, level, goal, 'compound', assessments))
    exercises.push(createExercise('Affondi', location, equipment, baseLoad.squat * 0.6, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Nordic Curl', location, equipment, 0, level, goal, 'accessory', assessments))
    if (!painAreas?.includes('ankles')) {
      exercises.push(createExercise('Seated Calf Raises', location, equipment, baseLoad.squat * 0.4, level, goal, 'isolation', assessments))
    }
  } else if (variant === 'C') {
    exercises.push(createExercise(safeExercise('Sumo Deadlift'), location, equipment, baseLoad.deadlift * 0.9, level, goal, 'compound', assessments))
    exercises.push(createExercise('Squat Bulgaro', location, equipment, baseLoad.squat * 0.6, level, goal, 'compound', assessments))
    exercises.push(createExercise('Leg Press', location, equipment, baseLoad.squat * 1.3, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Good Morning', location, equipment, baseLoad.deadlift * 0.5, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Hip Thrust', location, equipment, baseLoad.squat * 0.8, level, goal, 'accessory', assessments))
  }

  return exercises
}

function generatePushDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    exercises.push(createExercise(safeExercise('Panca Piana'), location, equipment, baseLoad.bench, level, goal, 'compound', assessments))
    exercises.push(createExercise('Military Press', location, equipment, baseLoad.press, level, goal, 'compound', assessments))
    exercises.push(createExercise('Panca Inclinata Manubri', location, equipment, baseLoad.bench * 0.7, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Lateral Raises', location, equipment, baseLoad.press * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Tricep Pushdown', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
  } else {
    exercises.push(createExercise(safeExercise('Panca Inclinata'), location, equipment, baseLoad.bench * 0.85, level, goal, 'compound', assessments))
    exercises.push(createExercise('Arnold Press', location, equipment, baseLoad.press * 0.85, level, goal, 'compound', assessments))
    exercises.push(createExercise('Dips', location, equipment, 0, level, goal, 'compound', assessments))
    exercises.push(createExercise('Croci Cavi Alti', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('French Press', location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
  }

  return exercises
}

function generatePullDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    exercises.push(createExercise(safeExercise('Stacco'), location, equipment, baseLoad.deadlift, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Trazioni'), location, equipment, baseLoad.pull, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Rematore Bilanciere'), location, equipment, baseLoad.pull * 0.9, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Curl Bilanciere'), location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise(safeExercise('Face Pull'), location, equipment, baseLoad.pull * 0.2, level, goal, 'isolation', assessments))
  } else {
    exercises.push(createExercise(safeExercise('Romanian Deadlift'), location, equipment, baseLoad.deadlift * 0.7, level, goal, 'compound', assessments))
    exercises.push(createExercise('Chin-up', location, equipment, baseLoad.pull * 0.95, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Rematore Manubri'), location, equipment, baseLoad.pull * 0.8, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Hammer Curl'), location, equipment, baseLoad.bench * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise(safeExercise('Shrugs'), location, equipment, baseLoad.deadlift * 0.4, level, goal, 'isolation', assessments))
  }

  return exercises
}

function generateLegsDay(variant, location, equipment, painAreas, assessments, level, goal, disabilityType, sportRole) {
  const exercises = []
  const baseLoad = getBaseLoads(assessments || [])

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name)
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name)
    return name
  }

  if (variant === 'A') {
    exercises.push(createExercise(safeExercise('Squat'), location, equipment, baseLoad.squat, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Romanian Deadlift'), location, equipment, baseLoad.deadlift * 0.7, level, goal, 'compound', assessments))
    exercises.push(createExercise('Leg Press', location, equipment, baseLoad.squat * 1.3, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Leg Curl', location, equipment, baseLoad.squat * 0.3, level, goal, 'isolation', assessments))
    exercises.push(createExercise('Leg Extension', location, equipment, baseLoad.squat * 0.3, level, goal, 'isolation', assessments))
  } else {
    exercises.push(createExercise(safeExercise('Front Squat'), location, equipment, baseLoad.squat * 0.8, level, goal, 'compound', assessments))
    exercises.push(createExercise(safeExercise('Stacco Sumo'), location, equipment, baseLoad.deadlift * 0.9, level, goal, 'compound', assessments))
    exercises.push(createExercise('Squat Bulgaro', location, equipment, baseLoad.squat * 0.6, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Nordic Curl', location, equipment, 0, level, goal, 'accessory', assessments))
    exercises.push(createExercise('Hip Thrust', location, equipment, baseLoad.squat * 0.8, level, goal, 'accessory', assessments))
  }

  return exercises
}

// ===== CREATE EXERCISE =====


function createExercise(name, location, equipment, baseWeight, level, goal, type, assessments) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.intermediate
  
  // ✅ FIX TRAZIONI INTELLIGENTE basato su livello
  if ((name.toLowerCase().includes('trazioni') || name.toLowerCase().includes('pull-up')) && 
      location === 'gym' && 
      baseWeight > 0) {
    
    // Trova bodyweight dagli assessments
    const bodyweight = assessments?.find(a => a.bodyweight)?.bodyweight || 80;
    const ratio = baseWeight / bodyweight;
    
    if (ratio < 0.9) { // Lat machine weight < 90% del peso corporeo
      
      if (level === 'beginner') {
        // Principianti: lat machine sicura
        name = 'Lat Machine';
        console.log(`[PROGRAM] 🔄 Beginner: Trazioni → Lat Machine (${baseWeight}kg < ${bodyweight}kg)`);
        
      } else {
        // Intermedi/Avanzati: progressioni tecniche
        if (ratio < 0.6) {
          name = 'Negative Pull-ups';
          console.log(`[PROGRAM] 🔄 ${level}: Trazioni → Negative Pull-ups (ratio: ${ratio.toFixed(2)})`);
        } else if (ratio < 0.75) {
          name = 'Banded Pull-ups';
          console.log(`[PROGRAM] 🔄 ${level}: Trazioni → Banded Pull-ups (ratio: ${ratio.toFixed(2)})`);
        } else {
          name = 'Pull-ups con Pausa';
          console.log(`[PROGRAM] 🔄 ${level}: Trazioni → Pull-ups con Pausa (ratio: ${ratio.toFixed(2)})`);
        }
      }
    }
    // Se ratio >= 0.9 → trazioni complete
  }
  
  let sets = type === 'compound' ? config.compoundSets : config.accessorySets
  // ... resto codice
  let rest = type === 'compound' ? 180 : type === 'accessory' ? 120 : 60

  console.log('[PROGRAM] 🎯 createExercise:', { name, level, type, location })

  const assessment = assessments?.find(a =>
    a.exerciseName && name.toLowerCase().includes(a.exerciseName.toLowerCase())
  )

  if (assessment?.variant && assessment?.level && location === 'home' && BODYWEIGHT_PROGRESSIONS[assessment.exerciseName]) {
    const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const progressionName = BODYWEIGHT_PROGRESSIONS[assessment.exerciseName][levelMap[assessment.level] || 2]
    const targetReps = assessment.maxReps || 12
    const range = config.repsRange

    console.log('[PROGRAM] ✅ Using bodyweight progression from assessment')
    console.log("[DEBUG] Assessment found:", assessment);
    console.log("[DEBUG] BODYWEIGHT_PROGRESSIONS[", assessment.exerciseName, "]:", BODYWEIGHT_PROGRESSIONS[assessment.exerciseName]);
    console.log("[DEBUG] progressionName:", progressionName);

    return {
      name: progressionName,
      sets,
      reps: range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`,
      rest,
      weight: null,
      notes: `Progressione livello ${assessment.level}`
    }
  }

  const hasEquipment = hasWeightedEquipment(equipment)

  if (location === 'home' && !hasEquipment) {
    console.log('[PROGRAM] 🏠 HOME without equipment - converting to bodyweight')

    const bodyweightName = convertToBodyweight(name, level)
    const targetReps = type === 'compound' ? 12 : type === 'accessory' ? 15 : 20
    const range = config.repsRange

    return {
      name: bodyweightName,
      sets,
      reps: type === 'core' ? '30-60s' : (range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`),
      rest,
      weight: null,
      notes: `Corpo libero - ${level}`
    }
  }

  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal || 'muscle_gain', level)

  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' ? getPregnancySafeAlternative(name) : getDisabilitySafeAlternative(name)
      return {
        name: safeAlternative,
        sets,
        reps: type === 'compound' ? '12-15' : '15-20',
        rest,
        weight: null,
        notes: 'Adattato per sicurezza'
      }
    }
    console.log("[DEBUG] Giant set with name:", { name, type: exerciseOrGiantSet.type });
    return {
      name: name,
      ...exerciseOrGiantSet
    }
  }

  const isBodyweight = isBodyweightExercise(exerciseOrGiantSet)

  let targetReps = 10
  let reps

  if (isBodyweight) {
    targetReps = type === 'compound' ? 12 : type === 'accessory' ? 15 : 20
  } else {
    targetReps = type === 'compound' ? 5 : type === 'accessory' ? 10 : 12
  }

  if (type === 'core') {
    reps = '30-60s'
  } else {
    const range = config.repsRange
    reps = range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`
  }

  let trainingWeight = null

  if (isBodyweight) {
    trainingWeight = null
    console.log('[PROGRAM] ⭕ No weight (bodyweight exercise)')
  } else if (location === 'gym' || hasEquipment) {
    if (baseWeight > 0) {
// const startWeight = baseWeight * config.startPercentage  // ← COMMENTA QUESTA
      const finalReps = typeof reps === 'string' && reps.includes('-')
        ? parseInt(reps.split('-')[1])
        : targetReps
trainingWeight = calculateTrainingWeight(baseWeight, finalReps, config.RIR)
      
      if (hasEquipment && equipment.dumbbellMaxKg && trainingWeight > equipment.dumbbellMaxKg) {
        trainingWeight = equipment.dumbbellMaxKg
      }

      console.log('[PROGRAM] ✅ Weight:', trainingWeight, 'kg da 1RM', baseWeight, 'kg, RIR', config.RIR)
    }
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: trainingWeight,
    notes: type === 'compound' ? `RIR ${config.RIR}` : 'Complementare'
  }
}

// ===== EXPORT RECOVERY FUNCTIONS =====

export function analyzePainPersistence(workouts) {
  const painAreas = {}
  workouts?.forEach((w) => {
    if (w.painLevel && w.painLevel > 3 && w.painLocation) {
      painAreas[w.painLocation] = (painAreas[w.painLocation] || 0) + 1
    }
  })

  const persistentPain = Object.entries(painAreas)
    .filter(([_, count]) => count >= 3)
    .map(([location]) => location)

  return {
    hasPersistentPain: persistentPain.length > 0,
    persistentAreas: persistentPain
  }
}

export function checkRecoveryFromPain(workouts) {
  const lastThree = workouts?.slice(0, 3) || []
  const noPainSessions = lastThree.filter((w) => !w.painLevel || w.painLevel <= 2)

  return {
    canReturnToNormal: noPainSessions.length === 3,
    painFreeSessions: noPainSessions.length
  }
}

export function calculateDetrainingFactor(workouts) {
  if (!workouts || workouts.length === 0) return 0.7

  const lastWorkout = workouts[0]
  const daysSinceLastWorkout = lastWorkout.completedAt
    ? Math.floor((Date.now() - new Date(lastWorkout.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (daysSinceLastWorkout < 7) return 1.0
  if (daysSinceLastWorkout < 14) return 0.95
  if (daysSinceLastWorkout < 21) return 0.9
  if (daysSinceLastWorkout < 30) return 0.85
  return 0.7
}

export function recalibrateProgram(assessments, detrainingFactor) {
  return assessments?.map((a) => ({
    exerciseName: a.exerciseName,
    oneRepMax: a.oneRepMax * detrainingFactor
  })) || []
}

export function generatePerformanceProgramRubini(input) {
  return generateProgram({ ...input, goal: 'strength' })
}
