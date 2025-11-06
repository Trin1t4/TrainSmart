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

const LEVEL_CONFIG = {
  beginner: {
    RIR: 3,
    repsRange: 2,
    startPercentage: 0.60,
    compoundSets: 3,
    accessorySets: 2
  },
  intermediate: {
    RIR: 2,
    repsRange: 1,
    startPercentage: 0.85,
    compoundSets: 4,
    accessorySets: 3
  },
  advanced: {
    RIR: 1,
    repsRange: 0,
    startPercentage: 0.90,
    compoundSets: 5,
    accessorySets: 3
  }
}
// ===== GOAL-BASED TRAINING CONFIGURATION (GYM + HOME) =====

const GOAL_CONFIGS = {
  strength: {
    name: 'Forza',
    repsRange: '3-6',
    rest: { compound: 240, accessory: 180, isolation: 120 },
    intensity: 'high',
    focus: 'compound_heavy',
    setsMultiplier: 1.0,
    notes: 'Focus carichi massimali',
    homeStrategy: 'progressive_overload_advanced_variations'
  },
  muscle_gain: {
    name: 'Ipertrofia',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 60 },
    intensity: 'medium-high',
    focus: 'volume',
    setsMultiplier: 1.0,
    notes: 'Focus volume e pump',
    homeStrategy: 'time_under_tension'
  },
  fat_loss: {
    name: 'Dimagrimento',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 30 },
    intensity: 'low-medium',
    focus: 'circuits_cardio',
    setsMultiplier: 0.8,
    includesCardio: true,
    cardioFrequency: 2,
    notes: 'Circuiti e densità alta',
    homeStrategy: 'high_density_circuits'
  },
  performance: {
    name: 'Performance Sportiva',
    repsRange: '4-8',
    rest: { compound: 180, accessory: 120, isolation: 90 },
    intensity: 'explosive',
    focus: 'power_speed',
    setsMultiplier: 1.0,
    notes: 'Focus esplosività',
    homeStrategy: 'plyometric_explosive'
  }
}

// ===== HOME BODYWEIGHT MAPPING PER GOAL =====

const HOME_BODYWEIGHT_BY_GOAL = {
  strength: {
    'Squat': {
      beginner: 'Squat con Pausa 3s',
      intermediate: 'Pistol Squat Assistito',
      advanced: 'Pistol Squat Completo'
    },
    'Panca': {
      beginner: 'Push-up con Pausa 3s',
      intermediate: 'Archer Push-up',
      advanced: 'One-Arm Push-up Eccentrico'
    },
    'Trazioni': {
      beginner: 'Negative Pull-ups 5s',
      intermediate: 'Pull-up con Pausa 3s',
      advanced: 'Archer Pull-up'
    },
    'Stacco': {
      beginner: 'Nordic Curl Eccentrico',
      intermediate: 'Single Leg RDL',
      advanced: 'Nordic Curl Completo'
    }
  },
  
  muscle_gain: {
    'Squat': {
      beginner: 'Squat Tempo 3-1-3',
      intermediate: 'Squat Bulgaro Tempo',
      advanced: 'Pistol Squat Tempo'
    },
    'Panca': {
      beginner: 'Push-up Tempo 3-1-3',
      intermediate: 'Diamond Push-up Tempo',
      advanced: 'Pseudo Planche Push-up'
    },
    'Trazioni': {
      beginner: 'Inverted Row Tempo',
      intermediate: 'Pull-up Tempo 3-1-3',
      advanced: 'L-Sit Pull-up'
    },
    'Stacco': {
      beginner: 'Glute Bridge Tempo',
      intermediate: 'Single Leg RDL Tempo',
      advanced: 'Nordic Curl Tempo'
    }
  },
  
  fat_loss: {
    'Squat': {
      beginner: 'Jump Squat',
      intermediate: 'Jump Squat Alternato',
      advanced: 'Pistol Squat Jump'
    },
    'Panca': {
      beginner: 'Push-up Veloci',
      intermediate: 'Clap Push-up',
      advanced: 'Plyo Push-up'
    },
    'Trazioni': {
      beginner: 'Australian Pull-up Veloci',
      intermediate: 'Pull-up Esplosive',
      advanced: 'Muscle-up Progressione'
    },
    'Stacco': {
      beginner: 'Jump Lunge',
      intermediate: 'Single Leg Hop',
      advanced: 'Broad Jump'
    }
  },
  
  performance: {
    'Squat': {
      beginner: 'Jump Squat',
      intermediate: 'Box Jump',
      advanced: 'Depth Jump'
    },
    'Panca': {
      beginner: 'Clap Push-up',
      intermediate: 'Plyometric Push-up',
      advanced: 'Superman Push-up'
    },
    'Trazioni': {
      beginner: 'Pull-up Esplosiva',
      intermediate: 'Kipping Pull-up',
      advanced: 'Muscle-up'
    },
    'Stacco': {
      beginner: 'Broad Jump',
      intermediate: 'Single Leg Bound',
      advanced: 'Alternate Leg Bound'
    }
  }
}

// ===== PERFORMANCE METHOD: SPORT-SPECIFIC PERFORMANCE =====

const PERFORMANCE_SPORT_CONFIGS = {
  calcio: {
    name: 'Calcio',
    focus: ['accelerazione', 'cambio_direzione', 'salto_verticale', 'endurance_anaerobica'],
    roles: {
      portiere: {
        priority: ['esplosività_laterale', 'salto_verticale', 'core_stability'],
        exercises: [
          'Lateral Bound',
          'Box Jump Lateral',
          'Single Leg Hop',
          'Plank Lateral Shift',
          'Medicine Ball Slam Lateral'
        ]
      },
      difensore: {
        priority: ['forza_massimale', 'accelerazione', 'duelli_aerei'],
        exercises: [
          'Squat Jump',
          'Broad Jump',
          'Box Jump',
          'Nordic Curl',
          'Push Press'
        ]
      },
      centrocampista: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'accelerazione'],
        exercises: [
          'Lateral Shuffle',
          'Cone Drill',
          'Burpee Broad Jump',
          'Jump Squat',
          'HIIT Intervals'
        ]
      },
      attaccante: {
        priority: ['accelerazione_esplosiva', 'salto_verticale', 'sprint'],
        exercises: [
          'Depth Jump',
          'Sprint Start',
          'Single Leg Bound',
          'Box Jump',
          'Power Clean (se gym)'
        ]
      }
    }
  },
  
  basket: {
    name: 'Basket',
    focus: ['salto_verticale', 'forza_esplosiva_gambe', 'core_rotation'],
    roles: {
      playmaker: {
        priority: ['accelerazione', 'cambio_direzione', 'endurance'],
        exercises: [
          'Lateral Bound',
          'Cone Drill',
          'Jump Squat',
          'Sprint Intervals',
          'Box Jump'
        ]
      },
      ala: {
        priority: ['salto_verticale', 'accelerazione', 'forza_esplosiva'],
        exercises: [
          'Depth Jump',
          'Box Jump',
          'Broad Jump',
          'Single Leg Bound',
          'Clap Push-up'
        ]
      },
      centro: {
        priority: ['forza_massimale', 'salto_verticale', 'contatto_fisico'],
        exercises: [
          'Box Jump',
          'Nordic Curl',
          'Push Press',
          'Squat Jump pesante',
          'Plank con peso'
        ]
      }
    }
  },
  
  tennis: {
    name: 'Tennis',
    focus: ['rotazione_core', 'accelerazione_laterale', 'esplosività_gambe'],
    roles: {
      singolo: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'rotazione_core'],
        exercises: [
          'Lateral Shuffle',
          'Medicine Ball Rotation',
          'Jump Squat',
          'Plank Rotation',
          'Sprint Intervals'
        ]
      },
      doppio: {
        priority: ['esplosività', 'forza_core', 'reattività'],
        exercises: [
          'Lateral Bound',
          'Medicine Ball Slam',
          'Box Jump',
          'Plank Shoulder Taps',
          'Burpees'
        ]
      }
    }
  },
  
  pallavolo: {
    name: 'Pallavolo',
    focus: ['salto_verticale', 'esplosività_spalle', 'core_stability'],
    roles: {
      schiacciatore: {
        priority: ['salto_verticale_massimo', 'esplosività_spalle', 'atterraggio'],
        exercises: [
          'Depth Jump',
          'Box Jump Alto',
          'Plyometric Push-up',
          'Nordic Curl Atterraggio',
          'Medicine Ball Overhead Slam'
        ]
      },
      centrale: {
        priority: ['salto_verticale', 'forza_massimale_gambe', 'muro'],
        exercises: [
          'Box Jump',
          'Squat Jump',
          'Broad Jump',
          'Single Leg Hop',
          'Plank Hold'
        ]
      },
      libero: {
        priority: ['reattività', 'accelerazione_laterale', 'endurance'],
        exercises: [
          'Lateral Shuffle',
          'Cone Drill',
          'Burpees',
          'Jump Squat Veloce',
          'Plank Dinamico'
        ]
      }
    }
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

function convertToBodyweightByGoal(exerciseName, level, goal) {
  const name = exerciseName.toLowerCase()
  const goalMapping = HOME_BODYWEIGHT_BY_GOAL[goal] || HOME_BODYWEIGHT_BY_GOAL.muscle_gain
  
  console.log(`[CONVERT] 🏠 Converting "${exerciseName}" for HOME + ${goal}`)
  
  // Trova categoria esercizio
  let category = null
  if (name.includes('squat') || name.includes('leg press')) category = 'Squat'
  else if (name.includes('panca') || name.includes('bench') || (name.includes('press') && !name.includes('leg'))) category = 'Panca'
  else if (name.includes('trazioni') || name.includes('pull') || name.includes('lat')) category = 'Trazioni'
  else if (name.includes('stacco') || name.includes('deadlift') || name.includes('rdl')) category = 'Stacco'
  
  if (category && goalMapping[category]) {
    const variant = goalMapping[category][level] || goalMapping[category]['intermediate']
    console.log(`[CONVERT] ✅ ${exerciseName} → ${variant} (${goal}, ${level})`)
    return variant
  }
  
  // Fallback: usa vecchia funzione generica
  console.warn(`[CONVERT] ⚠️ No goal-specific mapping, using generic conversion`)
  return convertToBodyweight(exerciseName, level)
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
      name: realExerciseName,
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

  console.log('[PROGRAM] 🎯 ENTRY POINT:', { level, frequency, location, goal, sportRole })

  // ===== RAMO 1: MOTOR RECOVERY (invariato) =====
  if (goal === 'motor_recovery' || goal === 'rehabilitation') {
    console.log('[PROGRAM] 🏥 BRANCHING → MOTOR RECOVERY')
    return generateMotorRecoveryProgram({ level, painAreas, location, goal })
  }

  // ===== RAMO 2: PERFORMANCE (GYM O HOME) =====
  if (goal === 'performance') {
    console.log('[PROGRAM] 🏃 BRANCHING → PERFORMANCE')
    return generatePerformanceProgram({ 
      level, 
      frequency, 
      assessments, 
      sportRole, 
      location,
      equipment
    })
  }

  // ===== RAMO 3: STANDARD TRAINING (GYM O HOME CON GOAL) =====
  console.log('[PROGRAM] 💪 BRANCHING → STANDARD TRAINING (GOAL-based)')
  return generateStandardProgram({ 
    level, 
    frequency, 
    location, 
    equipment, 
    painAreas, 
    assessments, 
    goal, 
    disabilityType, 
    sportRole 
  })
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

function generatePerformanceProgram(input) {
  const { level, frequency, assessments, sportRole, location, equipment } = input
  
  console.log('[PROGRAM] 🏃 Performance for:', sportRole, location)
  
  if (!sportRole || !sportRole.sport) {
    console.warn('[PROGRAM] ⚠️ No sport specified, using generic performance')
    return generateGenericPerformanceProgram(input)
  }
  
  const sport = sportRole.sport.toLowerCase()
  const role = sportRole.role?.toLowerCase() || 'singolo'
  
  const sportConfig = PERFORMANCE_SPORT_CONFIGS[sport]
  if (!sportConfig) {
    console.warn(`[PROGRAM] ⚠️ Sport "${sport}" not in Performance configs`)
    return generateGenericPerformanceProgram(input)
  }
  
  const roleConfig = sportConfig.roles[role]
  if (!roleConfig) {
    console.warn(`[PROGRAM] ⚠️ Role "${role}" not found for ${sport}`)
    const firstRole = Object.keys(sportConfig.roles)[0]
    roleConfig = sportConfig.roles[firstRole]
  }
  
  console.log(`[PERFORMANCE] ✅ ${sportConfig.name} - ${role} - Priority:`, roleConfig.priority)
  
  const weeklySchedule = []
  
  weeklySchedule.push({
    dayName: `${sportConfig.name} - Esplosività Gambe`,
    location,
    exercises: generatePerformanceLowerBody(roleConfig, location, equipment, level)
  })
  
  weeklySchedule.push({
    dayName: `${sportConfig.name} - Potenza Busto`,
    location,
    exercises: generatePerformanceUpperBody(roleConfig, location, equipment, level)
  })
  
  if (frequency >= 3) {
    weeklySchedule.push({
      dayName: `${sportConfig.name} - Conditioning Specifico`,
      location,
      exercises: generatePerformanceConditioning(roleConfig, location, equipment, level)
    })
  }
  
  return {
    name: `Performance ${sportConfig.name} - ${role}`,
    description: `Focus: ${roleConfig.priority.join(', ')}`,
    split: 'performance_sport_specific',
    daysPerWeek: frequency,
    location,
    weeklySchedule: weeklySchedule.slice(0, frequency),
    progression: 'progressive_explosive',
    includesDeload: true,
    deloadFrequency: 3,
    totalWeeks: 8,
    requiresEndCycleTest: true,
    sportSpecific: true,
    sportSpecific: true
  }
}

function generatePerformanceLowerBody(roleConfig, location, equipment, level) {
  const exercises = []
  const isGym = location === 'gym'
  
  roleConfig.exercises.filter(ex => 
    ex.includes('Jump') || ex.includes('Squat') || ex.includes('Nordic') || ex.includes('Bound')
  ).forEach(exerciseName => {
    exercises.push({
      name: exerciseName,
      sets: level === 'advanced' ? 5 : 4,
      reps: exerciseName.includes('Jump') || exerciseName.includes('Bound') ? '5-8' : '4-6',
      rest: 180,
      weight: null,
      notes: 'Max esplosività'
    })
  })
  
  if (isGym) {
    exercises.unshift({
      name: 'Squat Pesante',
      sets: 3,
      reps: '3-5',
      rest: 240,
      weight: 'assessment-based',
      notes: 'Base forza'
    })
  }
  
  return exercises
}

function generatePerformanceUpperBody(roleConfig, location, equipment, level) {
  const exercises = []
  
  roleConfig.exercises.filter(ex =>
    ex.includes('Push') || ex.includes('Medicine Ball') || ex.includes('Slam') || ex.includes('Press')
  ).forEach(exerciseName => {
    exercises.push({
      name: exerciseName,
      sets: 4,
      reps: '6-8',
      rest: 120,
      weight: null,
      notes: 'Potenza'
    })
  })
  
  exercises.push({
    name: 'Plank Rotation',
    sets: 3,
    reps: '30-45s',
    rest: 60,
    weight: null,
    notes: 'Core stability'
  })
  
  return exercises
}

function generatePerformanceConditioning(roleConfig, location, equipment, level) {
  const exercises = []
  
  roleConfig.exercises.filter(ex =>
    ex.includes('Interval') || ex.includes('Shuffle') || ex.includes('Drill') || ex.includes('Sprint')
  ).forEach(exerciseName => {
    exercises.push({
      name: exerciseName,
      sets: exerciseName.includes('Interval') ? 8 : 5,
      reps: exerciseName.includes('Interval') ? '30s on / 30s off' : '10-15',
      rest: 60,
      weight: null,
      notes: 'Conditioning specifico'
    })
  })
  
  if (exercises.length === 0) {
    exercises.push(
      { name: 'Burpees', sets: 5, reps: '10', rest: 45, weight: null, notes: 'Conditioning' },
      { name: 'Sprint Intervals', sets: 8, reps: '20s on / 40s off', rest: 60, weight: null, notes: 'Anaerobico' }
    )
  }
  
  return exercises
}

function generateGenericPerformanceProgram(input) {
  // Fallback: programma performance generico
  const { level, frequency, location } = input
  
  return {
    name: `Performance Generica - ${level}`,
    description: `${frequency}x/settimana, focus esplosività generale`,
    split: 'performance_generic',
    daysPerWeek: frequency,
    location,
    weeklySchedule: [
      {
        dayName: 'Esplosività Gambe',
        location,
        exercises: [
          { name: 'Jump Squat', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Esplosività' },
          { name: 'Broad Jump', sets: 3, reps: '5', rest: 120, weight: null },
          { name: 'Single Leg Hop', sets: 3, reps: '8/lato', rest: 90, weight: null }
        ]
      },
      {
        dayName: 'Potenza Busto',
        location,
        exercises: [
          { name: 'Clap Push-up', sets: 4, reps: '6-8', rest: 180, weight: null },
          { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 90, weight: null },
          { name: 'Plank Dinamico', sets: 3, reps: '45s', rest: 60, weight: null }
        ]
      }
    ].slice(0, frequency),
    progression: 'progressive_explosive',
    totalWeeks: 8
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
  let schedule = []

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
// 🎯 Aggiungi cardio per goal fat_loss
  if (goal === 'fat_loss' && schedule.length > 0) {
    const goalConfig = GOAL_CONFIGS.fat_loss
    
    schedule.forEach(day => {
      day.exercises = convertToCircuit(day.exercises, goalConfig)
      day.notes = day.notes ? `${day.notes} - Formato circuito` : 'Formato circuito'
    })
    
    if (daysPerWeek >= 4 && goalConfig.includesCardio) {
      const cardioSessions = Math.min(goalConfig.cardioFrequency, Math.floor(daysPerWeek / 3))
      
      for (let i = 0; i < cardioSessions; i++) {
        schedule = addFatLossCardioDay(schedule, level)
      }
    }
    
    console.log('[PROGRAM] 🔥 Fat loss: circuiti + cardio applicati')
  }

  return schedule

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
function addFatLossCardioDay(weeklySchedule, level) {
  const cardioExercises = [
    { name: 'HIIT Intervals', sets: 8, reps: '30s on / 30s off', rest: 30, weight: null, notes: 'Sprint intervals' },
    { name: 'Jump Rope', sets: 5, reps: '60s', rest: 45, weight: null, notes: 'Cardio continuo' },
    { name: 'Burpees', sets: 4, reps: '15', rest: 30, weight: null, notes: 'Full body' },
    { name: 'Mountain Climbers', sets: 4, reps: '30s', rest: 30, weight: null, notes: 'Cardio + core' }
  ]
  
  weeklySchedule.push({
    dayName: 'Cardio HIIT',
    location: 'home',
    exercises: cardioExercises
  })
  
  return weeklySchedule
}

function convertToCircuit(exercises, goalConfig) {
  if (goalConfig.focus !== 'circuits_cardio') return exercises
  
  return exercises.map(ex => ({
    ...ex,
    rest: 30,
    notes: `${ex.notes} - CIRCUITO`
  }))
}

// ===== CREATE EXERCISE =====


function createExercise(name, location, equipment, baseWeight, level, goal, type, assessments) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.intermediate
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain
  
  console.log('[PROGRAM] 🎯 createExercise:', { name, level, goal, type, location })
  
  // ✅ FIX TRAZIONI (invariato)
  if ((name.toLowerCase().includes('trazioni') || name.toLowerCase().includes('pull-up')) && 
      location === 'gym' && 
      baseWeight > 0) {
    const bodyweight = assessments?.find(a => a.bodyweight)?.bodyweight || 80;
    const ratio = baseWeight / bodyweight;
    
    if (ratio < 0.9) {
      if (level === 'beginner') {
        name = 'Lat Machine';
      } else {
        if (ratio < 0.6) name = 'Negative Pull-ups';
        else if (ratio < 0.75) name = 'Banded Pull-ups';
        else name = 'Pull-ups con Pausa';
      }
    }
  }
  
  // 🎯 Sets e Rest basati su GOAL
  let sets = type === 'compound' ? config.compoundSets : config.accessorySets
  sets = Math.round(sets * goalConfig.setsMultiplier)
  let rest = goalConfig.rest[type] || (type === 'compound' ? 180 : 120)

  // ✅ MANTIENI: Assessment bodyweight progressions
  // ✅ ASSESSMENT BODYWEIGHT: usa variant se disponibile
  const assessment = assessments?.find(a =>
    a.exerciseName && name.toLowerCase().includes(a.exerciseName.toLowerCase())
  )

  // 🆕 DEBUG: log assessment trovato
  if (assessment) {
    console.log('[ASSESSMENT] Found for "' + name + '":', {
      exerciseName: assessment.exerciseName,
      variant: assessment.variant,
      level: assessment.level,
      maxReps: assessment.maxReps
    })
  }

  // 🆕 FIX: Usa variant direttamente se esiste (priorità massima)
  if (assessment?.variant && location === 'home') {
    console.log('[ASSESSMENT] ✅ Using variant directly: ' + assessment.variant)
    
    const targetReps = assessment.maxReps || 12
    const range = config.repsRange
    
    return {
      name: assessment.variant,
      sets,
      reps: range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`,
      rest,
      weight: null,
      notes: `Da assessment: ${assessment.maxReps || '?'} reps max (${assessment.level || 'N/A'})`
    }
  }

  // Fallback: usa BODYWEIGHT_PROGRESSIONS se variant non c'è
  if (assessment?.level && location === 'home' && BODYWEIGHT_PROGRESSIONS[assessment.exerciseName]) {
    console.log('[ASSESSMENT] Using BODYWEIGHT_PROGRESSIONS fallback')
    const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const progressionName = BODYWEIGHT_PROGRESSIONS[assessment.exerciseName][levelMap[assessment.level] || 2]
    const targetReps = assessment.maxReps || 12
    const range = config.repsRange

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

  // 🏠 NUOVO: HOME BODYWEIGHT GOAL-SPECIFIC
  if (location === 'home' && !hasEquipment) {
    console.log('[PROGRAM] 🏠 HOME without equipment - GOAL-SPECIFIC conversion')

    const bodyweightName = convertToBodyweightByGoal(name, level, goal)
    const [minReps, maxReps] = goalConfig.repsRange.split('-').map(Number)
    
    let targetReps
    if (goal === 'strength') {
      targetReps = minReps  // Forza: basse reps anche bodyweight
    } else if (goal === 'fat_loss') {
      targetReps = maxReps  // Fat loss: reps alte
    } else {
      targetReps = Math.round((minReps + maxReps) / 2)
    }

    // 🆕 TEMPO: Estrai valori se presente nel nome bodyweight
    let tempoData = null
    if (bodyweightName.toLowerCase().includes('tempo')) {
      const tempoMatch = bodyweightName.match(/tempo\s*(\d+)-(\d+)-(\d+)/i)
      if (tempoMatch) {
        tempoData = {
          eccentric: parseInt(tempoMatch[1]),
          pause: parseInt(tempoMatch[2]),
          concentric: parseInt(tempoMatch[3])
        }
        console.log('[TEMPO] Detected in bodyweight:', bodyweightName, '→', tempoData)
      } else {
        // Fallback: se c'è "Tempo" ma senza numeri, usa default 3-1-3
        tempoData = {
          eccentric: 3,
          pause: 1,
          concentric: 3
        }
        console.log('[TEMPO] Detected (no numbers, using default 3-1-3):', bodyweightName)
      }
    }

    return {
      name: realExerciseName,
      sets,
      reps: type === 'core' ? '30-60s' : `${targetReps}-${targetReps + 2}`,
      rest,
      weight: null,
      notes: `${goalConfig.name} - ${goalConfig.homeStrategy}`,
      ...(tempoData && { tempo: tempoData })
    }
  }

  // 🏠 NUOVO: HOME CON ATTREZZI (stessa intensità GYM)
  if (location === 'home' && hasEquipment) {
    console.log('[PROGRAM] 🏠 HOME with equipment - same intensity as gym')
    
    let adaptedName = name
    
    if (!equipment.barbell && name.toLowerCase().includes('bilanciere')) {
      adaptedName = name.replace(/Bilanciere/gi, 'Manubri')
      console.log(`[ADAPT] Bilanciere → Manubri: ${name} → ${adaptedName}`)
    }
    
    name = adaptedName
  }

  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal || 'muscle_gain', level)

  // ✅ MANTIENI: Safety checks
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
    return { name: name, ...exerciseOrGiantSet }
  }

  const isBodyweight = isBodyweightExercise(exerciseOrGiantSet)

  // 🎯 REPS BASATE SU GOAL
  const [minReps, maxReps] = goalConfig.repsRange.split('-').map(Number)
  let realExerciseName = bodyweightName;
if (!realExerciseName || realExerciseName.toLowerCase() === "bodyweight") {
  if (name.toLowerCase().includes("panca") || name.toLowerCase().includes("push")) {
    realExerciseName = "Push-up";
  } else if (name.toLowerCase().includes("trazioni") || name.toLowerCase().includes("pull")) {
    realExerciseName = "Australian Pull-up";
  } else if (name.toLowerCase().includes("plank")) {
    realExerciseName = "Plank";
  } else {
    realExerciseName = "Squat a corpo libero";
  }
}

  let targetReps
  
  if (isBodyweight) {
    targetReps = maxReps
  } else {
    targetReps = type === 'compound' ? minReps : Math.round((minReps + maxReps) / 2)
  }

  let reps
  if (type === 'core') {
    reps = goal === 'fat_loss' ? '20-45s' : '30-60s'
  } else {
    const range = config.repsRange
    reps = range > 0 ? `${targetReps - range}-${targetReps + range}` : `${targetReps}`
  }

  // ✅ CALCOLO PESO
  let trainingWeight = null

  if (isBodyweight) {
    trainingWeight = null
  } else if (location === 'gym' || hasEquipment) {
    if (baseWeight > 0) {
      const finalReps = typeof reps === 'string' && reps.includes('-')
        ? parseInt(reps.split('-')[1])
        : targetReps
      
      trainingWeight = calculateTrainingWeight(baseWeight, finalReps, config.RIR)
      
      if (hasEquipment && equipment.dumbbellMaxKg && trainingWeight > equipment.dumbbellMaxKg) {
        trainingWeight = equipment.dumbbellMaxKg
      }
    }
  }

  // 🆕 TEMPO: Estrai valori tempo se presente nel nome
  let tempoData = null
  if (exerciseOrGiantSet.toLowerCase().includes('tempo')) {
    const tempoMatch = exerciseOrGiantSet.match(/tempo\s*(\d+)-(\d+)-(\d+)/i)
    if (tempoMatch) {
      tempoData = {
        eccentric: parseInt(tempoMatch[1]),
        pause: parseInt(tempoMatch[2]),
        concentric: parseInt(tempoMatch[3])
      }
      console.log('[TEMPO] Detected:', exerciseOrGiantSet, '→', tempoData)
    } else {
      // Fallback: se c'è "Tempo" ma senza numeri, usa default 3-1-3
      tempoData = {
        eccentric: 3,
        pause: 1,
        concentric: 3
      }
      console.log('[TEMPO] Detected (no numbers, using default 3-1-3):', exerciseOrGiantSet)
    }
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: trainingWeight,
    notes: `${goalConfig.name} - ${type === 'compound' ? `RIR ${config.RIR}` : 'Complementare'}`,
    ...(tempoData && { tempo: tempoData })
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

