/**
 * Sport-Specific Training System
 *
 * PRINCIPI FONDAMENTALI:
 * 1. Forza è la madre di tutte le qualità atletiche
 * 2. Fondamentali sempre (Squat, Panca, Stacco) come base
 * 3. Accessori per prevenzione infortuni sport-specifici
 * 4. No junk volume - ogni esercizio ha uno scopo
 * 5. Periodizzazione: Off-season (forza base) → Pre-season (forza esplosiva) → In-season (mantenimento)
 *
 * Se utente non ha carichi → varianti calisthenics con stessa logica
 */

// ============================================
// TYPES
// ============================================

export type SportType =
  | 'calcio' | 'basket' | 'pallavolo' | 'rugby'
  | 'tennis' | 'corsa' | 'nuoto' | 'ciclismo'
  | 'crossfit' | 'powerlifting' | 'altro';

export type SeasonPhase = 'off_season' | 'pre_season' | 'in_season';

export type TrainingMode = 'barbell' | 'calisthenics' | 'mixed';

export interface SportProfile {
  sport: SportType;
  // Qualità atletiche prioritarie (1-5, 5 = massima priorità)
  priorities: {
    maxStrength: number;      // Forza massimale
    explosivePower: number;   // Potenza esplosiva
    speedStrength: number;    // Forza veloce
    endurance: number;        // Resistenza muscolare
    mobility: number;         // Mobilità/Flessibilità
    coreStability: number;    // Stabilità core
  };
  // Aree a rischio infortunio
  injuryRiskAreas: string[];
  // Focus muscolare primario
  primaryMuscles: string[];
  // Esercizi fondamentali consigliati
  keyLifts: {
    barbell: string[];
    calisthenics: string[];
  };
  // Accessori prevenzione
  preventionExercises: string[];
  // Note specifiche
  notes: string;
}

export interface RoleModifier {
  role: string;
  sport: SportType;
  // Modifiche alle priorità
  priorityAdjustments: Partial<SportProfile['priorities']>;
  // Esercizi aggiuntivi specifici per ruolo
  additionalExercises: string[];
  // Note
  notes: string;
}

export interface PhaseConfig {
  phase: SeasonPhase;
  // Parametri allenamento
  setsRange: [number, number];
  repsRange: [number, number];
  intensityRange: [number, number]; // % 1RM
  restSeconds: [number, number];
  // Volume settimanale
  weeklyFrequency: [number, number];
  // Focus
  focus: string;
  notes: string;
}

// ============================================
// DATABASE SPORT PROFILES
// ============================================

export const SPORT_PROFILES: Record<SportType, SportProfile> = {

  // ========================================
  // CALCIO - Sport intermittente, molti cambi direzione
  // ========================================
  calcio: {
    sport: 'calcio',
    priorities: {
      maxStrength: 4,        // Base per tutto
      explosivePower: 5,     // Sprint, salti, tiri
      speedStrength: 5,      // Accelerazioni/decelerazioni
      endurance: 3,          // 90 min ma intermittente
      mobility: 4,           // Prevenzione infortuni
      coreStability: 4       // Contrasti, stabilità
    },
    injuryRiskAreas: ['hamstring', 'knee_acl', 'ankle', 'groin', 'hip_flexor'],
    primaryMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'],
    keyLifts: {
      barbell: [
        'Back Squat',           // Re degli esercizi per calcio
        'Romanian Deadlift',    // Hamstring forte = meno infortuni
        'Hip Thrust',           // Potenza glutei per sprint
        'Trap Bar Deadlift',    // Più transfer su sprint
        'Front Squat'           // Core + quadricipiti
      ],
      calisthenics: [
        'Pistol Squat',
        'Nordic Curl',          // FONDAMENTALE prevenzione hamstring
        'Bulgarian Split Squat',
        'Glute Bridge',
        'Single Leg Hip Thrust'
      ]
    },
    preventionExercises: [
      'Nordic Curl',            // Hamstring eccentrico - essenziale per prevenzione
      'Copenhagen Adductor',    // Adduttori - infortuni frequenti
      'Single Leg RDL',         // Stabilità + hamstring
      'Calf Raise',             // Spesso trascurati
      'Hip Flexor Stretch'      // Mobilità anca
    ],
    notes: 'Focus su forza esplosiva e prevenzione hamstring/ACL. Nordic Curl obbligatorio.'
  },

  // ========================================
  // BASKET - Salti, cambi direzione, contatti
  // ========================================
  basket: {
    sport: 'basket',
    priorities: {
      maxStrength: 4,
      explosivePower: 5,     // Salti verticali
      speedStrength: 5,      // Primi passi esplosivi
      endurance: 3,
      mobility: 4,           // Spalle per tiri
      coreStability: 5       // Contatti in aria
    },
    injuryRiskAreas: ['knee_acl', 'ankle', 'shoulder', 'lower_back'],
    primaryMuscles: ['quadriceps', 'glutes', 'calves', 'shoulders', 'core'],
    keyLifts: {
      barbell: [
        'Back Squat',
        'Trap Bar Deadlift',    // Jump transfer
        'Push Press',           // Potenza overhead
        'Hip Thrust',
        'Bench Press'
      ],
      calisthenics: [
        'Pistol Squat',
        'Box Jump',
        'Push-up',
        'Pull-up',
        'Depth Jump'
      ]
    },
    preventionExercises: [
      'Nordic Curl',
      'Single Leg Squat',       // Stabilità ginocchio
      'Ankle Mobility',
      'Face Pull',              // Salute spalle
      'Dead Bug'                // Core anti-rotazione
    ],
    notes: 'Vertical jump = squat forte + potenza. Core per stabilità nei contatti.'
  },

  // ========================================
  // PALLAVOLO - Salti ripetuti, spalle
  // ========================================
  pallavolo: {
    sport: 'pallavolo',
    priorities: {
      maxStrength: 3,
      explosivePower: 5,     // Salti per schiacciare/murare
      speedStrength: 4,
      endurance: 2,          // Set brevi
      mobility: 5,           // Spalle fondamentali
      coreStability: 4
    },
    injuryRiskAreas: ['shoulder', 'knee_patellar', 'ankle', 'lower_back', 'fingers'],
    primaryMuscles: ['shoulders', 'quadriceps', 'glutes', 'core', 'rotator_cuff'],
    keyLifts: {
      barbell: [
        'Front Squat',
        'Push Press',
        'Trap Bar Deadlift',
        'Overhead Press',
        'Barbell Row'
      ],
      calisthenics: [
        'Pistol Squat',
        'Pike Push-up',
        'Pull-up',
        'Box Jump',
        'Plank'
      ]
    },
    preventionExercises: [
      'Face Pull',              // Cuffia rotatori
      'External Rotation',      // Stabilità spalla
      'Nordic Curl',
      'Single Leg Calf Raise',
      'Shoulder Mobility'
    ],
    notes: 'Spalle = priorità assoluta. Salute della cuffia dei rotatori prima di tutto.'
  },

  // ========================================
  // RUGBY - Forza massimale + potenza + contatti
  // ========================================
  rugby: {
    sport: 'rugby',
    priorities: {
      maxStrength: 5,        // Mischie, placcaggi
      explosivePower: 5,
      speedStrength: 4,
      endurance: 4,          // 80 min intensi
      mobility: 3,
      coreStability: 5       // Contatti pesanti
    },
    injuryRiskAreas: ['shoulder', 'knee', 'neck', 'hamstring', 'ankle'],
    primaryMuscles: ['full_body', 'neck', 'traps', 'core', 'posterior_chain'],
    keyLifts: {
      barbell: [
        'Back Squat',           // Forza base
        'Conventional Deadlift', // Potenza totale
        'Bench Press',          // Push per placcaggi
        'Barbell Row',          // Pull per mischie
        'Power Clean'           // Esplosività (se tecnica ok)
      ],
      calisthenics: [
        'Push-up',
        'Pull-up',
        'Pistol Squat',
        'Inverted Row',
        'Plank'
      ]
    },
    preventionExercises: [
      'Neck Strengthening',     // FONDAMENTALE per rugby
      'Face Pull',
      'Nordic Curl',
      'External Rotation',
      'Hip Mobility'
    ],
    notes: 'Sport più completo. Forza massimale necessaria per contatti. Mai trascurare il collo.'
  },

  // ========================================
  // TENNIS - Asimmetrico, rotazioni, resistenza
  // ========================================
  tennis: {
    sport: 'tennis',
    priorities: {
      maxStrength: 3,
      explosivePower: 4,     // Primi passi, servizio
      speedStrength: 5,      // Cambi direzione rapidi
      endurance: 4,          // Match lunghi
      mobility: 5,           // Spalle, anche
      coreStability: 5       // Rotazioni potenti
    },
    injuryRiskAreas: ['shoulder', 'elbow', 'wrist', 'lower_back', 'knee'],
    primaryMuscles: ['shoulders', 'core', 'legs', 'forearms', 'rotator_cuff'],
    keyLifts: {
      barbell: [
        'Front Squat',
        'Romanian Deadlift',
        'Overhead Press',
        'Barbell Row',
        'Hip Thrust'
      ],
      calisthenics: [
        'Pistol Squat',
        'Push-up',
        'Pull-up',
        'Pallof Press',         // Anti-rotazione
        'Turkish Get-up'
      ]
    },
    preventionExercises: [
      'External Rotation',      // Spalla
      'Wrist Curls',            // Prevenzione epicondilite
      'Pallof Press',           // Core anti-rotazione
      'Hip Mobility',
      'Thoracic Rotation'
    ],
    notes: 'Sport asimmetrico - bilanciare il lavoro. Core anti-rotazione fondamentale.'
  },

  // ========================================
  // CORSA - Endurance, efficienza, prevenzione
  // ========================================
  corsa: {
    sport: 'corsa',
    priorities: {
      maxStrength: 3,        // Base per efficienza
      explosivePower: 2,     // Solo sprint
      speedStrength: 3,
      endurance: 5,          // Priorità
      mobility: 4,           // Prevenzione
      coreStability: 4       // Postura
    },
    injuryRiskAreas: ['knee_itband', 'shin', 'achilles', 'plantar_fascia', 'hip'],
    primaryMuscles: ['quadriceps', 'hamstrings', 'calves', 'glutes', 'core'],
    keyLifts: {
      barbell: [
        'Back Squat',           // Forza base
        'Romanian Deadlift',
        'Hip Thrust',
        'Calf Raise',
        'Step-up'
      ],
      calisthenics: [
        'Single Leg Squat',
        'Nordic Curl',
        'Glute Bridge',
        'Calf Raise',
        'Plank'
      ]
    },
    preventionExercises: [
      'Single Leg RDL',         // Stabilità
      'Calf Raise Eccentrico',  // Achille
      'Hip Flexor Stretch',
      'IT Band Foam Roll',
      'Glute Activation'
    ],
    notes: 'Forza = efficienza + prevenzione. Non serve ipertrofia, serve forza relativa.'
  },

  // ========================================
  // NUOTO - Upper body, mobilità spalle
  // ========================================
  nuoto: {
    sport: 'nuoto',
    priorities: {
      maxStrength: 3,
      explosivePower: 3,     // Tuffi, virate
      speedStrength: 4,
      endurance: 4,
      mobility: 5,           // Spalle, caviglie
      coreStability: 5       // Posizione in acqua
    },
    injuryRiskAreas: ['shoulder', 'lower_back', 'knee_breaststroke', 'neck'],
    primaryMuscles: ['lats', 'shoulders', 'core', 'chest', 'triceps'],
    keyLifts: {
      barbell: [
        'Bench Press',
        'Barbell Row',
        'Overhead Press',
        'Deadlift',
        'Pull-up'               // Fondamentale
      ],
      calisthenics: [
        'Pull-up',              // RE del nuoto
        'Push-up',
        'Inverted Row',
        'Pike Push-up',
        'Plank'
      ]
    },
    preventionExercises: [
      'Face Pull',
      'External Rotation',
      'Shoulder Mobility',
      'Thoracic Extension',
      'Ankle Mobility'          // Per pinnata
    ],
    notes: 'Pull-up è il re. Spalle sane = carriera lunga. Mobilità toracica fondamentale.'
  },

  // ========================================
  // CICLISMO - Gambe, core, postura
  // ========================================
  ciclismo: {
    sport: 'ciclismo',
    priorities: {
      maxStrength: 4,        // Watt = forza
      explosivePower: 3,     // Sprint finali
      speedStrength: 3,
      endurance: 5,
      mobility: 4,           // Postura
      coreStability: 4
    },
    injuryRiskAreas: ['knee_patellar', 'lower_back', 'neck', 'hip_flexor', 'it_band'],
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings', 'core', 'hip_flexors'],
    keyLifts: {
      barbell: [
        'Back Squat',           // Re per ciclisti
        'Romanian Deadlift',
        'Hip Thrust',
        'Step-up',
        'Leg Press'
      ],
      calisthenics: [
        'Pistol Squat',
        'Bulgarian Split Squat',
        'Glute Bridge',
        'Step-up',
        'Plank'
      ]
    },
    preventionExercises: [
      'Hip Flexor Stretch',     // Sempre accorciati
      'Thoracic Extension',     // Postura in bici
      'Glute Activation',
      'IT Band Work',
      'Neck Stretches'
    ],
    notes: 'Squat = più watt. Hip flexor sempre corti - stretcharli. Core per postura.'
  },

  // ========================================
  // CROSSFIT - Tutto, ma con criterio
  // ========================================
  crossfit: {
    sport: 'crossfit',
    priorities: {
      maxStrength: 5,
      explosivePower: 5,
      speedStrength: 5,
      endurance: 5,
      mobility: 5,
      coreStability: 5
    },
    injuryRiskAreas: ['shoulder', 'lower_back', 'knee', 'wrist', 'elbow'],
    primaryMuscles: ['full_body'],
    keyLifts: {
      barbell: [
        'Back Squat',
        'Front Squat',
        'Conventional Deadlift',
        'Overhead Press',
        'Power Clean'
      ],
      calisthenics: [
        'Pull-up',
        'Push-up',
        'Pistol Squat',
        'Handstand Push-up',
        'Muscle-up'
      ]
    },
    preventionExercises: [
      'Face Pull',
      'External Rotation',
      'Wrist Mobility',
      'Hip Mobility',
      'Thoracic Mobility'
    ],
    notes: 'Tutto serve. Priorità a tecnica perfetta prima di caricare. Spalle = punto debole comune.'
  },

  // ========================================
  // POWERLIFTING - Forza massimale pura
  // ========================================
  powerlifting: {
    sport: 'powerlifting',
    priorities: {
      maxStrength: 5,        // Tutto qui
      explosivePower: 3,
      speedStrength: 3,
      endurance: 1,
      mobility: 3,           // Quanto serve per le alzate
      coreStability: 5
    },
    injuryRiskAreas: ['lower_back', 'shoulder', 'hip', 'knee', 'elbow'],
    primaryMuscles: ['full_body', 'posterior_chain', 'chest', 'triceps'],
    keyLifts: {
      barbell: [
        'Back Squat',           // Gara
        'Bench Press',          // Gara
        'Conventional Deadlift', // Gara
        'Pause Squat',          // Accessorio
        'Close Grip Bench'      // Accessorio
      ],
      calisthenics: [
        // Powerlifting senza bilanciere è limitato
        'Push-up',
        'Pull-up',
        'Pistol Squat',
        'Dips',
        'Inverted Row'
      ]
    },
    preventionExercises: [
      'Face Pull',
      'Hip Mobility',
      'Shoulder Mobility',
      'Core Work',
      'Upper Back Work'
    ],
    notes: 'Le 3 alzate sono tutto. Accessori servono a migliorare le alzate, non per altro.'
  },

  // ========================================
  // ALTRO - Profilo generico bilanciato
  // ========================================
  altro: {
    sport: 'altro',
    priorities: {
      maxStrength: 4,
      explosivePower: 3,
      speedStrength: 3,
      endurance: 3,
      mobility: 4,
      coreStability: 4
    },
    injuryRiskAreas: ['lower_back', 'shoulder', 'knee'],
    primaryMuscles: ['full_body'],
    keyLifts: {
      barbell: [
        'Back Squat',
        'Bench Press',
        'Conventional Deadlift',
        'Overhead Press',
        'Barbell Row'
      ],
      calisthenics: [
        'Push-up',
        'Pull-up',
        'Pistol Squat',
        'Dips',
        'Plank'
      ]
    },
    preventionExercises: [
      'Face Pull',
      'Hip Mobility',
      'Core Work',
      'Glute Activation',
      'Shoulder Mobility'
    ],
    notes: 'Profilo generico - fondamentali + prevenzione base.'
  }
};

// ============================================
// ROLE MODIFIERS - Aggiustamenti per ruolo
// ============================================

export const ROLE_MODIFIERS: RoleModifier[] = [
  // CALCIO
  {
    role: 'portiere',
    sport: 'calcio',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5,
      endurance: 2
    },
    additionalExercises: ['Lateral Bound', 'Box Jump', 'Medicine Ball Throw'],
    notes: 'Esplosività laterale, reattività, potenza nel tuffo'
  },
  {
    role: 'difensore',
    sport: 'calcio',
    priorityAdjustments: {
      maxStrength: 5,
      endurance: 4
    },
    additionalExercises: ['Hip Thrust', 'Isometric Hold'],
    notes: 'Forza nei contrasti, resistenza alla forza'
  },
  {
    role: 'centrocampista',
    sport: 'calcio',
    priorityAdjustments: {
      endurance: 5,
      speedStrength: 4
    },
    additionalExercises: ['Step-up', 'Tempo Run Simulation'],
    notes: 'Copertura massima, resistenza a intensità variabile'
  },
  {
    role: 'attaccante',
    sport: 'calcio',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5
    },
    additionalExercises: ['Sprint Start', 'Plyometric Lunge'],
    notes: 'Primi passi esplosivi, accelerazione massima'
  },

  // BASKET
  {
    role: 'playmaker',
    sport: 'basket',
    priorityAdjustments: {
      speedStrength: 5,
      endurance: 4
    },
    additionalExercises: ['Lateral Shuffle', 'Quick Feet Drill'],
    notes: 'Rapidità nei cambi direzione, gestione partita'
  },
  {
    role: 'centro',
    sport: 'basket',
    priorityAdjustments: {
      maxStrength: 5,
      coreStability: 5
    },
    additionalExercises: ['Post Move Simulation', 'Heavy Hip Thrust'],
    notes: 'Forza nel post, rimbalzi, box-out'
  },
  {
    role: 'ala',
    sport: 'basket',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5
    },
    additionalExercises: ['Depth Jump', 'Vertical Jump'],
    notes: 'Salto verticale massimo, versatilità'
  },

  // PALLAVOLO
  {
    role: 'schiacciatore',
    sport: 'pallavolo',
    priorityAdjustments: {
      explosivePower: 5,
      mobility: 5
    },
    additionalExercises: ['Approach Jump', 'Shoulder External Rotation'],
    notes: 'Salto ripetuto, potenza spalla'
  },
  {
    role: 'palleggiatore',
    sport: 'pallavolo',
    priorityAdjustments: {
      speedStrength: 5,
      mobility: 5
    },
    additionalExercises: ['Quick Feet', 'Wrist Strengthening'],
    notes: 'Rapidità, precisione, mobilità completa'
  },
  {
    role: 'centrale',
    sport: 'pallavolo',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5
    },
    additionalExercises: ['Lateral Jump', 'Quick Block Drill'],
    notes: 'Salti rapidi ripetuti per muro'
  },
  {
    role: 'libero',
    sport: 'pallavolo',
    priorityAdjustments: {
      speedStrength: 5,
      endurance: 4
    },
    additionalExercises: ['Dive Drill', 'Lateral Movement'],
    notes: 'Reattività, tuffi, copertura campo'
  },

  // RUGBY
  {
    role: 'pilone',
    sport: 'rugby',
    priorityAdjustments: {
      maxStrength: 5,
      coreStability: 5
    },
    additionalExercises: ['Heavy Squat', 'Neck Strengthening', 'Sled Push'],
    notes: 'Forza massimale per mischia, collo forte'
  },
  {
    role: 'tallonatore',
    sport: 'rugby',
    priorityAdjustments: {
      maxStrength: 5,
      explosivePower: 4
    },
    additionalExercises: ['Power Clean', 'Medicine Ball Throw'],
    notes: 'Forza + esplosività per rimesse'
  },
  {
    role: 'terza linea',
    sport: 'rugby',
    priorityAdjustments: {
      endurance: 5,
      speedStrength: 5
    },
    additionalExercises: ['Shuttle Run', 'Tackling Drill'],
    notes: 'Box-to-box, placcaggi ripetuti'
  },
  {
    role: 'mediano',
    sport: 'rugby',
    priorityAdjustments: {
      speedStrength: 5,
      explosivePower: 4
    },
    additionalExercises: ['Passing Power', 'Quick Acceleration'],
    notes: 'Passaggi potenti, accelerazioni'
  },
  {
    role: 'trequarti',
    sport: 'rugby',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5
    },
    additionalExercises: ['Sprint Drill', 'Side Step Drill'],
    notes: 'Velocità pura, cambi direzione'
  },

  // CORSA
  {
    role: 'sprint',
    sport: 'corsa',
    priorityAdjustments: {
      explosivePower: 5,
      speedStrength: 5,
      endurance: 2
    },
    additionalExercises: ['Block Start', 'Plyometric Bound'],
    notes: 'Potenza pura, accelerazione massima'
  },
  {
    role: 'mezzofondo',
    sport: 'corsa',
    priorityAdjustments: {
      endurance: 5,
      speedStrength: 4
    },
    additionalExercises: ['Tempo Run', 'Hill Sprint'],
    notes: 'Resistenza + kick finale'
  },
  {
    role: 'fondo',
    sport: 'corsa',
    priorityAdjustments: {
      endurance: 5,
      maxStrength: 3
    },
    additionalExercises: ['Long Slow Run', 'Core Endurance'],
    notes: 'Efficienza, economia di corsa'
  },

  // NUOTO
  {
    role: 'stile libero',
    sport: 'nuoto',
    priorityAdjustments: {
      speedStrength: 5,
      mobility: 5
    },
    additionalExercises: ['Pull-up', 'Lat Pulldown', 'Streamline Drill'],
    notes: 'Bracciata potente, idrodinamicità'
  },
  {
    role: 'dorso',
    sport: 'nuoto',
    priorityAdjustments: {
      mobility: 5,
      coreStability: 5
    },
    additionalExercises: ['Shoulder Rotation', 'Core Rotation'],
    notes: 'Rotazione spalle, stabilità core'
  },
  {
    role: 'rana',
    sport: 'nuoto',
    priorityAdjustments: {
      explosivePower: 4,
      mobility: 5
    },
    additionalExercises: ['Frog Kick Drill', 'Hip Mobility'],
    notes: 'Mobilità anche, ginocchia (attenzione)'
  },
  {
    role: 'farfalla',
    sport: 'nuoto',
    priorityAdjustments: {
      explosivePower: 5,
      coreStability: 5
    },
    additionalExercises: ['Dolphin Kick', 'Shoulder Power'],
    notes: 'Potenza totale, coordinazione'
  }
];

// ============================================
// PHASE CONFIGURATIONS - Periodizzazione
// ============================================

export const PHASE_CONFIGS: Record<SeasonPhase, PhaseConfig> = {

  // OFF-SEASON: Costruire forza base
  off_season: {
    phase: 'off_season',
    setsRange: [4, 5],
    repsRange: [5, 8],
    intensityRange: [75, 85],
    restSeconds: [180, 300],
    weeklyFrequency: [3, 4],
    focus: 'Forza massimale + Ipertrofia funzionale',
    notes: 'Costruire la base. Volume più alto, intensità progressiva. Fondamentali pesanti.'
  },

  // PRE-SEASON: Convertire in potenza
  pre_season: {
    phase: 'pre_season',
    setsRange: [3, 4],
    repsRange: [3, 6],
    intensityRange: [80, 90],
    restSeconds: [180, 240],
    weeklyFrequency: [3, 4],
    focus: 'Forza esplosiva + Transfer sport-specifico',
    notes: 'Convertire forza in potenza. Meno volume, più intensità. Aggiungere esplosività.'
  },

  // IN-SEASON: Mantenere senza affaticare
  in_season: {
    phase: 'in_season',
    setsRange: [2, 3],
    repsRange: [3, 5],
    intensityRange: [80, 88],
    restSeconds: [180, 240],
    weeklyFrequency: [2, 2],
    focus: 'Mantenimento forza + Freschezza',
    notes: 'Mantenere i guadagni. Volume basso, intensità alta. Mai affaticarsi prima delle gare.'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Ottiene il profilo sport completo
 */
export function getSportProfile(sport: SportType): SportProfile {
  return SPORT_PROFILES[sport] || SPORT_PROFILES.altro;
}

/**
 * Ottiene il modificatore per ruolo
 */
export function getRoleModifier(sport: SportType, role?: string): RoleModifier | undefined {
  if (!role) return undefined;

  const normalizedRole = role.toLowerCase().trim();

  return ROLE_MODIFIERS.find(rm =>
    rm.sport === sport &&
    normalizedRole.includes(rm.role.toLowerCase())
  );
}

/**
 * Combina profilo sport + modificatore ruolo
 */
export function getAdjustedProfile(sport: SportType, role?: string): SportProfile {
  const baseProfile = getSportProfile(sport);
  const modifier = getRoleModifier(sport, role);

  if (!modifier) return baseProfile;

  return {
    ...baseProfile,
    priorities: {
      ...baseProfile.priorities,
      ...modifier.priorityAdjustments
    },
    keyLifts: {
      barbell: [...baseProfile.keyLifts.barbell],
      calisthenics: [...baseProfile.keyLifts.calisthenics]
    },
    preventionExercises: [
      ...baseProfile.preventionExercises,
      ...modifier.additionalExercises.filter(e =>
        !baseProfile.preventionExercises.includes(e)
      )
    ],
    notes: `${baseProfile.notes} | Ruolo ${role}: ${modifier.notes}`
  };
}

/**
 * Ottiene configurazione fase
 */
export function getPhaseConfig(phase: SeasonPhase): PhaseConfig {
  return PHASE_CONFIGS[phase];
}

/**
 * Determina la fase automaticamente in base alla data
 * (Assumendo sport con stagione settembre-maggio)
 */
export function detectSeasonPhase(date: Date = new Date()): SeasonPhase {
  const month = date.getMonth(); // 0-11

  // Giugno-Agosto: Off-season (preparazione estiva)
  if (month >= 5 && month <= 7) {
    return 'off_season';
  }
  // Agosto-Settembre: Pre-season
  if (month === 7 || month === 8) {
    return 'pre_season';
  }
  // Ottobre-Maggio: In-season
  return 'in_season';
}

/**
 * Seleziona esercizi in base a modalità (barbell/calisthenics)
 */
export function getExercisesForMode(
  profile: SportProfile,
  mode: TrainingMode,
  includeAll: boolean = false
): string[] {
  if (mode === 'barbell') {
    return includeAll
      ? [...profile.keyLifts.barbell, ...profile.preventionExercises]
      : profile.keyLifts.barbell;
  }

  if (mode === 'calisthenics') {
    return includeAll
      ? [...profile.keyLifts.calisthenics, ...profile.preventionExercises]
      : profile.keyLifts.calisthenics;
  }

  // Mixed: prendi il meglio di entrambi
  const exercises = new Set([
    ...profile.keyLifts.barbell.slice(0, 3),
    ...profile.keyLifts.calisthenics.slice(0, 2)
  ]);

  if (includeAll) {
    profile.preventionExercises.forEach(e => exercises.add(e));
  }

  return Array.from(exercises);
}

/**
 * Genera raccomandazioni per programma sport-specifico
 */
export function generateSportRecommendations(
  sport: SportType,
  role?: string,
  hasBarbell: boolean = false,
  phase?: SeasonPhase
): {
  profile: SportProfile;
  phaseConfig: PhaseConfig;
  recommendedExercises: string[];
  preventionFocus: string[];
  trainingNotes: string[];
} {
  const profile = getAdjustedProfile(sport, role);
  const currentPhase = phase || detectSeasonPhase();
  const phaseConfig = getPhaseConfig(currentPhase);
  const mode: TrainingMode = hasBarbell ? 'barbell' : 'calisthenics';

  const recommendedExercises = getExercisesForMode(profile, mode, false);
  const preventionFocus = profile.preventionExercises.slice(0, 3);

  const trainingNotes: string[] = [
    `Sport: ${sport.toUpperCase()}${role ? ` - ${role}` : ''}`,
    `Fase: ${currentPhase.replace('_', '-').toUpperCase()}`,
    `Focus: ${phaseConfig.focus}`,
    `Parametri: ${phaseConfig.setsRange[0]}-${phaseConfig.setsRange[1]} serie × ${phaseConfig.repsRange[0]}-${phaseConfig.repsRange[1]} reps @ ${phaseConfig.intensityRange[0]}-${phaseConfig.intensityRange[1]}%`,
    `Frequenza: ${phaseConfig.weeklyFrequency[0]}-${phaseConfig.weeklyFrequency[1]}x/settimana`,
    `⚠️ Prevenzione: ${profile.injuryRiskAreas.slice(0, 3).join(', ')}`,
    profile.notes
  ];

  return {
    profile,
    phaseConfig,
    recommendedExercises,
    preventionFocus,
    trainingNotes
  };
}

// ============================================
// EXERCISE MAPPING - Collegamento al database esistente
// ============================================

/**
 * Mappa nomi esercizi sport-specifici ai nomi nel database esercizi
 */
export const SPORT_TO_DB_EXERCISE_MAP: Record<string, string> = {
  // Fondamentali
  'Back Squat': 'Back Squat',
  'Front Squat': 'Front Squat',
  'Conventional Deadlift': 'Conventional Deadlift',
  'Romanian Deadlift': 'Romanian Deadlift (RDL)',
  'Bench Press': 'Bench Press',
  'Overhead Press': 'Overhead Press',
  'Barbell Row': 'Barbell Row',
  'Hip Thrust': 'Hip Thrust',
  'Trap Bar Deadlift': 'Trap Bar Deadlift',

  // Calisthenics
  'Pull-up': 'Pull-up',
  'Push-up': 'Push-up',
  'Pistol Squat': 'Pistol Squat',
  'Dips': 'Dips',
  'Inverted Row': 'Inverted Row',
  'Pike Push-up': 'Pike Push-up',
  'Plank': 'Plank',
  'Glute Bridge': 'Glute Bridge',
  'Nordic Curl': 'Nordic Curl',
  'Bulgarian Split Squat': 'Bulgarian Split Squat',

  // Accessori
  'Face Pull': 'Face Pull',
  'Calf Raise': 'Standing Calf Raise',
  'Step-up': 'Step-up',
  'Dead Bug': 'Dead Bug',
  'Pallof Press': 'Pallof Press',
  'Lateral Raise': 'Lateral Raise'
};

/**
 * Converte nome esercizio sport-specifico in nome database
 */
export function mapToDbExercise(sportExercise: string): string {
  return SPORT_TO_DB_EXERCISE_MAP[sportExercise] || sportExercise;
}

console.log('✅ Sport-Specific Training module loaded');
