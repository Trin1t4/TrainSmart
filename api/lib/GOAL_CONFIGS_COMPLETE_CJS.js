// ===== CONFIGURAZIONI GOAL COMPLETE =====

export const GOAL_CONFIGS = {
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
  },

  general_fitness: {
    name: 'Fitness Generale / Benessere',
    repsRange: '10-15',
    rest: { compound: 90, accessory: 75, isolation: 60, core: 45 },
    intensity: 'moderate',
    focus: 'balanced_health',
    setsMultiplier: 1.0,
    notes: 'Programma bilanciato per salute e benessere generale',
    homeStrategy: 'balanced_bodyweight',
    targetRIR: 3,
    includesMobility: true,
    mobilityFrequency: 2
  },

  endurance: {
    name: 'Resistenza',
    repsRange: '15-20',
    rest: { compound: 60, accessory: 45, isolation: 45, core: 30 },
    intensity: 'moderate',
    focus: 'muscular_endurance',
    setsMultiplier: 0.9,
    notes: 'Alta densità, recuperi brevi',
    homeStrategy: 'high_rep_circuits',
    targetRIR: 2,
    includesCardio: true,
    cardioFrequency: 3
  }
}

// ===== PROGRESSIONI ESERCIZI COMPLETE =====

export const EXERCISE_PROGRESSIONS = {

  // ===== SQUAT (Quad-dominant, pattern fondamentale) =====
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

  // ===== PANCA PIANA (Push Orizzontale) =====
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

  // ===== TRAZIONI (Pull Verticale) =====
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

  // ===== MILITARY PRESS (Push Verticale) =====
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

  // ===== STACCO RUMENO (Hip Hinge - Posterior Chain) =====
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
  },

  // ===== REMATORE BILANCIERE (Pull Orizzontale) =====
  'Rematore Bilanciere': {
    strength: [
      { name: 'Rematore Australiano (60°)', level: 1, unlockReps: 12 },
      { name: 'Rematore Australiano (45°)', level: 2, unlockReps: 12 },
      { name: 'Rematore Australiano (30°)', level: 3, unlockReps: 12 },
      { name: 'Rematore Australiano Orizzontale', level: 4, unlockReps: 12 },
      { name: 'Rematore Australiano Piedi Elevati', level: 5, unlockReps: 12 },
      { name: 'Rematore Australiano Archer', level: 6, unlockReps: 12 },
      { name: 'Rematore Australiano Monobraccio', level: 7, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Rematore Australiano Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Rematore Orizzontale Tempo', level: 2, reps: '12-20' },
      { name: 'Rematore Archer Tempo', level: 3, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Rematore Australiano Veloce', level: 1, reps: '15-20' },
      { name: 'Rematore Esplosivo', level: 2, reps: '12-15' }
    ],
    performance: [
      { name: 'Rematore Esplosivo', level: 1, reps: '6-10' },
      { name: 'Rematore con Battuta Mani', level: 2, reps: '4-8' }
    ]
  },

  // ===== PANCA INCLINATA (Push Superiore) =====
  'Panca Inclinata': {
    strength: [
      { name: 'Piegamenti Declinati (piedi rialzati 30cm)', level: 1, unlockReps: 12 },
      { name: 'Piegamenti Declinati (piedi rialzati 60cm)', level: 2, unlockReps: 12 },
      { name: 'Pike Push-up Basso', level: 3, unlockReps: 12 },
      { name: 'Piegamenti Declinati Stretti', level: 4, unlockReps: 12 },
      { name: 'Piegamenti Declinati Archer', level: 5, unlockReps: 10 },
      { name: 'Pike Push-up Elevato', level: 6, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Piegamenti Declinati Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Pike Push-up Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Piegamenti Declinati Veloci', level: 1, reps: '15-20' },
      { name: 'Piegamenti Declinati con Battuta', level: 2, reps: '12-15' }
    ],
    performance: [
      { name: 'Piegamenti Declinati Esplosivi', level: 1, reps: '6-10' },
      { name: 'Piegamenti Declinati Pliometrici', level: 2, reps: '4-8' }
    ]
  },

  // ===== AFFONDI (Unilateral Leg) =====
  'Affondi': {
    strength: [
      { name: 'Affondo Statico', level: 1, unlockReps: 12 },
      { name: 'Affondo Camminato', level: 2, unlockReps: 12 },
      { name: 'Affondo Inverso', level: 3, unlockReps: 12 },
      { name: 'Squat Bulgaro', level: 4, unlockReps: 12 },
      { name: 'Pistol Squat Assistito', level: 5, unlockReps: 12 },
      { name: 'Pistol Squat su Box', level: 6, unlockReps: 12 },
      { name: 'Step-Up su Box Alto senza Appoggio', level: 7, unlockReps: 10 },
      { name: 'Pistol Squat Completo', level: 8, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Squat Bulgaro Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Pistol Assistito Tempo', level: 2, reps: '10-15' },
      { name: 'Pistol Completo Tempo', level: 3, reps: '8-12' }
    ],
    fat_loss: [
      { name: 'Affondo Saltato', level: 1, reps: '15-20' },
      { name: 'Affondo Saltato Alternato', level: 2, reps: '15-20' },
      { name: 'Pistol Jump', level: 3, reps: '10-12' }
    ],
    performance: [
      { name: 'Affondo Saltato Esplosivo', level: 1, reps: '6-10' },
      { name: 'Affondo Alternato in Volo', level: 2, reps: '5-8' },
      { name: 'Pistol Jump', level: 3, reps: '4-6' }
    ]
  },

  // ===== DIPS (Push Compound) =====
  'Dips': {
    strength: [
      { name: 'Dip su Panca', level: 1, unlockReps: 12 },
      { name: 'Dip su Panca Piedi Elevati', level: 2, unlockReps: 12 },
      { name: 'Dip su Parallele Parziali', level: 3, unlockReps: 12 },
      { name: 'Dip su Parallele Completi', level: 4, unlockReps: 12 },
      { name: 'Dip agli Anelli', level: 5, unlockReps: 10 },
      { name: 'Dip agli Anelli L-Sit', level: 6, unlockReps: 8 }
    ],
    muscle_gain: [
      { name: 'Dip Parallele Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Dip Anelli Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Dip Veloci', level: 1, reps: '15-20' },
      { name: 'Dip Esplosivi', level: 2, reps: '12-15' }
    ],
    performance: [
      { name: 'Dip Esplosivi', level: 1, reps: '6-10' },
      { name: 'Dip Pliometrici', level: 2, reps: '4-8' }
    ]
  },

  // ===== STACCO (Triple Extension - Power Movement) =====
  'Stacco': {
    strength: [
      { name: 'Jump Squat Controllato (negative 3s)', level: 1, unlockReps: 12 },
      { name: 'Jump Squat (negative 2s + esplosivo)', level: 2, unlockReps: 12 },
      { name: 'Broad Jump (salto lungo in avanti)', level: 3, unlockReps: 12 },
      { name: 'Box Jump (30cm)', level: 4, unlockReps: 12 },
      { name: 'Box Jump (60cm)', level: 5, unlockReps: 10 },
      { name: 'Depth Jump (caduta + rimbalzo)', level: 6, unlockReps: 10 },
      { name: 'Single Leg Box Jump', level: 7, unlockReps: 8 }
    ],
    muscle_gain: [
      { name: 'Jump Squat Tempo (negative 3s)', level: 1, reps: '12-20' },
      { name: 'Box Jump Controllato', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Jump Squat Continuo', level: 1, reps: '15-20' },
      { name: 'Broad Jump Ripetuto', level: 2, reps: '12-15' }
    ],
    performance: [
      { name: 'Box Jump Massimale', level: 1, reps: '4-8' },
      { name: 'Depth Jump', level: 2, reps: '4-6' },
      { name: 'Single Leg Power Jump', level: 3, reps: '3-5' }
    ]
  },

  // ===== FRONT SQUAT (Quad-dominant, postura eretta) =====
  'Front Squat': {
    strength: [
      { name: 'Squat Corpo Libero Pause (3s in basso)', level: 1, unlockReps: 12 },
      { name: 'Goblet Squat (immaginando peso)', level: 2, unlockReps: 12 },
      { name: 'Sissy Squat', level: 3, unlockReps: 12 },
      { name: 'Squat Bulgaro', level: 4, unlockReps: 12 },
      { name: 'Pistol Assistito', level: 5, unlockReps: 12 },
      { name: 'Pistol su Box', level: 6, unlockReps: 10 },
      { name: 'Pistol Completo', level: 7, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Sissy Squat Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Pistol Assistito Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Jump Squat', level: 1, reps: '15-20' },
      { name: 'Tuck Jump', level: 2, reps: '12-15' }
    ]
  },

  // ===== TRAZIONI PRESA STRETTA (Pull Verticale - bicipiti emphasis) =====
  'Trazioni Presa Stretta': {
    strength: [
      { name: 'Chin-up Assistito (elastico)', level: 1, unlockReps: 12 },
      { name: 'Chin-up', level: 2, unlockReps: 12 },
      { name: 'Chin-up Zavorrato (+5kg)', level: 3, unlockReps: 12 },
      { name: 'Trazioni Presa Stretta', level: 4, unlockReps: 12 },
      { name: 'Trazioni Presa Stretta Zavorrrate', level: 5, unlockReps: 10 },
      { name: 'Archer Chin-up', level: 6, unlockReps: 10 },
      { name: 'Chin-up Monobraccio Negativa (5s)', level: 7, unlockReps: 8 }
    ],
    muscle_gain: [
      { name: 'Chin-up Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Trazioni Strette Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Chin-up Veloci', level: 1, reps: '12-15' },
      { name: 'Kipping Chin-up', level: 2, reps: '15-20' }
    ]
  },

  // ===== ALZATE LATERALI (Shoulder Isolation) =====
  'Alzate Laterali': {
    strength: [
      { name: 'Pike Push-up Mani Larghe', level: 1, unlockReps: 12 },
      { name: 'Pike Push-up Piedi Elevati', level: 2, unlockReps: 12 },
      { name: 'Handstand Hold a Muro (30s)', level: 3, unlockReps: 60 },
      { name: 'Wall HSPU Parziale (¼ ROM)', level: 4, unlockReps: 10 },
      { name: 'Wall HSPU (½ ROM)', level: 5, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Pike Push-up Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Pike Elevato Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Pike Push-up Dinamico', level: 1, reps: '15-20' }
    ]
  },

  // ===== GOOD MORNING (Hip Hinge) =====
  'Good Morning': {
    strength: [
      { name: 'Single Leg RDL (Romanian Deadlift)', level: 1, unlockReps: 12 },
      { name: 'Single Leg RDL con Pausa (2s)', level: 2, unlockReps: 12 },
      { name: 'Stacco Rumeno a Gamba Singola con Hop', level: 3, unlockReps: 10 },
      { name: 'Nordic Curl Negativa (5s)', level: 4, unlockReps: 10 },
      { name: 'Nordic Curl con Pause', level: 5, unlockReps: 10 },
      { name: 'Nordic Curl Completo', level: 6, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Single Leg RDL Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Nordic Curl Tempo', level: 2, reps: '8-15' }
    ],
    fat_loss: [
      { name: 'Single Leg RDL Alternato', level: 1, reps: '15-20' },
      { name: 'Good Morning Jump', level: 2, reps: '12-15' }
    ]
  },

  // ===== FACE PULL (Pull Orizzontale Alto) =====
  'Face Pull': {
    strength: [
      { name: 'Rematore Australiano Presa Larga', level: 1, unlockReps: 12 },
      { name: 'Rematore Australiano W-Pull', level: 2, unlockReps: 12 },
      { name: 'Rematore Orizzontale Presa Larga', level: 3, unlockReps: 12 },
      { name: 'Trazioni Presa Larga', level: 4, unlockReps: 10 }
    ],
    muscle_gain: [
      { name: 'Rematore Larga Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Trazioni Larghe Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Rematore Larga Veloce', level: 1, reps: '15-20' }
    ]
  },

  // ===== PLANK (Core Anti-Extension) =====
  'Plank': {
    strength: [
      { name: 'Plank (30s)', level: 1, unlockReps: 60 },
      { name: 'Plank (45s)', level: 2, unlockReps: 90 },
      { name: 'Plank (60s)', level: 3, unlockReps: 120 },
      { name: 'Plank Rialzato su Gomiti (45s)', level: 4, unlockReps: 90 },
      { name: 'RKC Plank (20s)', level: 5, unlockReps: 40 },
      { name: 'Hollow Body Hold (30s)', level: 6, unlockReps: 60 }
    ],
    muscle_gain: [
      { name: 'Plank Statico (60s)', level: 1, reps: '3x60s' },
      { name: 'Hollow Hold (45s)', level: 2, reps: '3x45s' }
    ],
    fat_loss: [
      { name: 'Plank con Tocco Spalle', level: 1, reps: '15-20' },
      { name: 'Plank Dinamico', level: 2, reps: '12-15' }
    ]
  },

  // ===== LEG RAISES (Core Flessione Anca) =====
  'Leg Raises': {
    strength: [
      { name: 'Knee Raises', level: 1, unlockReps: 12 },
      { name: 'Knee Raises con Pausa (2s)', level: 2, unlockReps: 12 },
      { name: 'Leg Raises Parziali (45°)', level: 3, unlockReps: 12 },
      { name: 'Leg Raises Parziali (90°)', level: 4, unlockReps: 12 },
      { name: 'Leg Raises Complete (toes up)', level: 5, unlockReps: 12 },
      { name: 'Toes to Bar', level: 6, unlockReps: 10 },
      { name: 'L-Sit (15s)', level: 7, unlockReps: 30 }
    ],
    muscle_gain: [
      { name: 'Leg Raises Tempo 3-1-3', level: 1, reps: '12-20' },
      { name: 'Toes to Bar Tempo', level: 2, reps: '10-15' }
    ],
    fat_loss: [
      { name: 'Leg Raises Veloci', level: 1, reps: '15-20' },
      { name: 'Bicycle Crunch', level: 2, reps: '20-30' }
    ]
  },

  // ===== DEAD BUG (Core Anti-Rotation) =====
  'Dead Bug': {
    strength: [
      { name: 'Dead Bug Base', level: 1, unlockReps: 12 },
      { name: 'Dead Bug Gambe Estese', level: 2, unlockReps: 12 },
      { name: 'Dead Bug con Pausa (2s)', level: 3, unlockReps: 12 },
      { name: 'Dead Bug con Peso Leggero', level: 4, unlockReps: 12 }
    ],
    muscle_gain: [
      { name: 'Dead Bug Tempo 4-1-4', level: 1, reps: '12-20' }
    ],
    fat_loss: [
      { name: 'Dead Bug Dinamico', level: 1, reps: '15-20' }
    ]
  },

  // ===== BIRD DOG (Core Stabilità Globale) =====
  'Bird Dog': {
    strength: [
      { name: 'Bird Dog Base', level: 1, unlockReps: 12 },
      { name: 'Bird Dog con Hold (10s)', level: 2, unlockReps: 20 },
      { name: 'Bird Dog con Hold (15s)', level: 3, unlockReps: 30 },
      { name: 'Bird Dog con Movimento Lento', level: 4, unlockReps: 12 }
    ],
    muscle_gain: [
      { name: 'Bird Dog Tempo 3-1-3', level: 1, reps: '12-20' }
    ],
    fat_loss: [
      { name: 'Bird Dog Dinamico', level: 1, reps: '15-20' }
    ]
  }
}

console.log('✅ GOAL_CONFIGS_COMPLETE loaded with full progressions');
