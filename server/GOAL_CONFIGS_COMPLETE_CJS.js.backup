// ===== CONFIGURAZIONI GOAL COMPLETE =====

const GOAL_CONFIGS = {
  strength: {
    name: 'Forza',
    repsRange: '3-5',
    rest: { compound: 180, accessory: 150, isolation: 120, core: 90 },
    intensity: 'high',
    focus: 'progressive_difficulty',
    setsMultiplier: 1.0,
    notes: 'Progressione verso esercizi più difficili',
    homeStrategy: 'skill_progression',
    unlockThreshold: 12,
    startReps: 3,
    weeklyProgression: 'linear_first_set'
  },
  
  muscle_gain: {
    name: 'Ipertrofia',
    repsRange: '12-25',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'high',
    focus: 'time_under_tension',
    setsMultiplier: 1.2,
    notes: 'TUT, Superset, Giant Set',
    homeStrategy: 'time_under_tension',
    techniques: ['tempo_313', 'superset', 'giant_set', 'dropset'],
    targetRIR: 1
  },
  
  toning: {
    name: 'Tonificazione',
    repsRange: '15-25',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
    intensity: 'medium',
    focus: 'controlled_volume',
    setsMultiplier: 1.0,
    notes: 'Range simile ipertrofia ma controllato',
    homeStrategy: 'controlled_tempo',
    targetRIR: 3
  },
  
  fat_loss: {
    name: 'Dimagrimento',
    repsRange: '15-20',
    rest: { compound: 45, accessory: 30, isolation: 30, core: 30 },
    intensity: 'medium',
    focus: 'circuits_density',
    setsMultiplier: 0.8,
    includesCardio: true,
    cardioFrequency: 2,
    notes: 'Circuiti, media intensità, recuperi bassi',
    homeStrategy: 'high_density_circuits',
    circuitFormat: true
  },
  
  performance: {
    name: 'Performance Sportiva',
    repsRange: '4-8',
    rest: { compound: 180, accessory: 120, isolation: 90, core: 90 },
    intensity: 'explosive',
    focus: 'power_quality',
    setsMultiplier: 1.0,
    notes: 'Esplosività controllata - qualità > quantità',
    homeStrategy: 'plyometric_explosive',
    explosiveFocus: true
  },
  
  motor_recovery: {
    name: 'Recupero Motorio',
    repsRange: '8-12',
    rest: { compound: 120, accessory: 90, isolation: 75, core: 60 },
    intensity: 'low-controlled',
    focus: 'rom_progressive',
    setsMultiplier: 0.8,
    notes: 'Entro limiti dolore, progressione: difficoltà → carico → ROM',
    homeStrategy: 'mobility_strength',
    painThreshold: true,
    progressionOrder: ['difficulty', 'load', 'rom']
  }
}

// ===== PROGRESSIONI ESERCIZI COMPLETE =====

const EXERCISE_PROGRESSIONS = {
  
  'Squat': {
    strength: [
      { name: 'Squat Completo', level: 1, unlockReps: 12 },
      { name: 'Squat Bulgaro', level: 2, unlockReps: 12 },
      { name: 'Skater Squat', level: 3, unlockReps: 12 },
      { name: 'Pistol Assistito', level: 4, unlockReps: 12 },
      { name: 'Step Up senza Appoggio', level: 5, unlockReps: 12 },
      { name: 'Pistol Completo', level: 6, unlockReps: 15 }
    ],
    
    muscle_gain: [
      { name: 'Squat Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Squat Bulgaro Tempo 3-1-3', level: 2, reps: '12-20' },
      { name: 'Pistol Assistito Tempo 3-1-3', level: 3, reps: '12-20' },
      { name: 'Pistol Completo Tempo 3-1-3', level: 4, reps: '12-25' }
    ],
    
    toning: [
      { name: 'Squat Controllato', level: 1, reps: '15-25' },
      { name: 'Squat Bulgaro Controllato', level: 2, reps: '15-25' },
      { name: 'Pistol Assistito Controllato', level: 3, reps: '15-25' }
    ],
    
    fat_loss: [
      { name: 'Jump Squat', level: 1, reps: '15-20' },
      { name: 'Jump Squat Alternato', level: 2, reps: '15-20' },
      { name: 'Pistol Squat Jump', level: 3, reps: '12-15' }
    ],
    
    performance: [
      { name: 'Jump Squat Esplosivo', level: 1, reps: '4-8' },
      { name: 'Box Jump', level: 2, reps: '4-8' },
      { name: 'Depth Jump', level: 3, reps: '4-6' }
    ]
  },
  
  'Panca Piana': {
    strength: [
      { name: 'Push-up Standard', level: 1, unlockReps: 12 },
      { name: 'Push-up Larghe', level: 2, unlockReps: 12 },
      { name: 'Push-up Strette', level: 3, unlockReps: 12 },
      { name: 'Diamond Push-up', level: 4, unlockReps: 12 },
      { name: 'Archer Push-up', level: 5, unlockReps: 12 },
      { name: 'Archer Push-up con Rialzo', level: 6, unlockReps: 12 },
      { name: 'One-Arm Push-up', level: 7, unlockReps: 15 }
    ],
    
    muscle_gain: [
      { name: 'Push-up Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Diamond Push-up Tempo', level: 2, reps: '12-20' },
      { name: 'Archer Push-up Tempo', level: 3, reps: '10-15' },
      { name: 'Pseudo Planche Push-up', level: 4, reps: '8-12' }
    ],
    
    fat_loss: [
      { name: 'Push-up Veloci', level: 1, reps: '15-20' },
      { name: 'Clap Push-up', level: 2, reps: '12-15' },
      { name: 'Plyo Push-up', level: 3, reps: '10-15' }
    ],
    
    performance: [
      { name: 'Clap Push-up', level: 1, reps: '4-8' },
      { name: 'Plyometric Push-up', level: 2, reps: '4-8' },
      { name: 'Superman Push-up', level: 3, reps: '3-6' }
    ]
  },
  
  'Trazioni': {
    strength: [
      { name: 'Dead Hang + Scapular Pulls', level: 1, unlockReps: 12 },
      { name: 'Australian Pull-up', level: 2, unlockReps: 12 },
      { name: 'Negative Pull-ups (5-10s)', level: 3, unlockReps: 12 },
      { name: 'Assisted Pull-ups (band)', level: 4, unlockReps: 12 },
      { name: 'Pull-ups / Chin-ups', level: 5, unlockReps: 12 },
      { name: 'Archer Pull-ups', level: 6, unlockReps: 12 },
      { name: 'One-Arm Negative Pull-up', level: 7, unlockReps: 10 },
      { name: 'One-Arm Pull-up Assistito', level: 8, unlockReps: 8 },
      { name: 'One-Arm Pull-up Completo', level: 9, unlockReps: 10 }
    ],
    
    muscle_gain: [
      { name: 'Inverted Row Tempo', level: 1, reps: '12-20' },
      { name: 'Pull-up Tempo 3-1-3', level: 2, reps: '12-20' },
      { name: 'L-Sit Pull-up', level: 3, reps: '8-15' },
      { name: 'Archer Pull-up Tempo', level: 4, reps: '6-12' }
    ],
    
    fat_loss: [
      { name: 'Australian Pull-up Veloci', level: 1, reps: '15-20' },
      { name: 'Pull-up Esplosive', level: 2, reps: '12-15' },
      { name: 'Muscle-up Progressione', level: 3, reps: '8-12' }
    ],
    
    performance: [
      { name: 'Pull-up Esplosiva', level: 1, reps: '4-8' },
      { name: 'Kipping Pull-up', level: 2, reps: '6-10' },
      { name: 'Muscle-up', level: 3, reps: '3-6' }
    ]
  },
  
  'Military Press': {
    strength: [
      { name: 'Pike Push-ups (incline)', level: 1, unlockReps: 12 },
      { name: 'Pike Push-ups (floor)', level: 2, unlockReps: 12 },
      { name: 'Pike Push-ups Diamond', level: 3, unlockReps: 12 },
      { name: 'Wall HSPU (partial)', level: 4, unlockReps: 12 },
      { name: 'Wall HSPU (head touch)', level: 5, unlockReps: 12 },
      { name: 'Wall HSPU (full ROM)', level: 6, unlockReps: 12 },
      { name: 'Freestanding HSPU (partial)', level: 7, unlockReps: 10 },
      { name: 'Freestanding HSPU (full)', level: 8, unlockReps: 10 },
      { name: '90 Degree HSPU', level: 9, unlockReps: 8 }
    ],
    
    muscle_gain: [
      { name: 'Pike Push-ups Tempo', level: 1, reps: '12-20' },
      { name: 'Wall HSPU Tempo', level: 2, reps: '10-15' },
      { name: 'Deficit HSPU Tempo', level: 3, reps: '8-12' }
    ],
    
    performance: [
      { name: 'Pike Push-up Esplosivo', level: 1, reps: '6-10' },
      { name: 'Kipping HSPU', level: 2, reps: '5-8' },
      { name: 'Clapping HSPU', level: 3, reps: '3-6' }
    ]
  },
  
  'Stacco Rumeno': {
    strength: [
      { name: 'Glute Bridge', level: 1, unlockReps: 12 },
      { name: 'Single Leg RDL', level: 2, unlockReps: 12 },
      { name: 'Glute Bridge Gambe Tese (talloni su sedia)', level: 3, unlockReps: 12 },
      { name: 'Nordic Curl Negativa', level: 4, unlockReps: 12 },
      { name: 'Nordic Curl con Fermi', level: 5, unlockReps: 10 },
      { name: 'Nordic Curl Completo', level: 6, unlockReps: 10 }
    ],
    
    muscle_gain: [
      { name: 'Glute Bridge Tempo', level: 1, reps: '15-25' },
      { name: 'Single Leg RDL Tempo', level: 2, reps: '12-20' },
      { name: 'Nordic Curl Tempo', level: 3, reps: '6-12' }
    ],
    
    fat_loss: [
      { name: 'Jump Lunge', level: 1, reps: '15-20' },
      { name: 'Single Leg Hop', level: 2, reps: '12-15' },
      { name: 'Broad Jump', level: 3, reps: '10-12' }
    ],
    
    performance: [
      { name: 'Broad Jump', level: 1, reps: '5-8' },
      { name: 'Single Leg Bound', level: 2, reps: '4-6' },
      { name: 'Alternate Leg Bound', level: 3, reps: '4-6' }
    ]
  }
}

// ===== EXPORT COMMONJS =====
export { GOAL_CONFIGS, EXERCISE_PROGRESSIONS }


console.log('✅ GOAL_CONFIGS_COMPLETE loaded (CommonJS)');
