/**
 * CORRECTIVE EXERCISES - DCSS Paradigm
 * 
 * Esercizi correttivi e alternative basate su principi DCSS.
 * NON prescrittivi, ma suggerimenti per chi vuole lavorare su specifici pattern.
 * 
 * PRINCIPI:
 * 1. Niente è "obbligatorio" - sono opzioni
 * 2. L'obiettivo è migliorare la tolleranza, non evitare il movimento
 * 3. Progressione verso il movimento completo, non away from it
 * 4. Contesto individuale sempre considerato
 * 
 * NOTA: I "McGill Big 3" sono validi per chi ha intolleranza alla flessione,
 * ma NON sono il default per tutti. Sono UNA opzione tra molte.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CorrectiveExercise {
  name: string;
  nameIt: string;
  category: 'mobility' | 'activation' | 'stability' | 'load_progression';
  targetArea: string[];
  purpose: string;
  purposeIt: string;
  sets: string;
  reps: string;
  rest: string;
  cues: string[];
  cuesIt: string[];
  videoUrl?: string;
  whenToUse: string;
  whenToUseIt: string;
  progression?: string;
  progressionIt?: string;
}

export interface MovementCorrectiveSet {
  movement: string;
  context: string;
  contextIt: string;
  note: string;
  noteIt: string;
  exercises: CorrectiveExercise[];
}

// ============================================================================
// CORRECTIVE EXERCISES DATABASE
// ============================================================================

/**
 * Esercizi per migliorare la mobilità dell'anca
 * Utili per: squat depth, deadlift setup, lunge range
 */
export const HIP_MOBILITY_EXERCISES: CorrectiveExercise[] = [
  {
    name: '90/90 Hip Stretch',
    nameIt: 'Stretch Anca 90/90',
    category: 'mobility',
    targetArea: ['hip'],
    purpose: 'Improve hip internal and external rotation',
    purposeIt: 'Migliorare la rotazione interna ed esterna dell\'anca',
    sets: '2-3',
    reps: '30-60s per side',
    rest: '30s',
    cues: [
      'Front leg at 90°, back leg at 90°',
      'Keep spine neutral, don\'t round',
      'Breathe deeply, relax into the stretch'
    ],
    cuesIt: [
      'Gamba anteriore a 90°, gamba posteriore a 90°',
      'Mantieni la colonna neutra, non arrotondare',
      'Respira profondamente, rilassati nello stretch'
    ],
    whenToUse: 'Before squats/deadlifts if you feel "blocked" at the hips',
    whenToUseIt: 'Prima di squat/stacchi se ti senti "bloccato" alle anche'
  },
  {
    name: 'Goblet Squat Hold',
    nameIt: 'Goblet Squat Tenuta',
    category: 'mobility',
    targetArea: ['hip', 'ankle'],
    purpose: 'Improve squat depth with assistance',
    purposeIt: 'Migliorare la profondità dello squat con assistenza',
    sets: '2-3',
    reps: '30-45s hold',
    rest: '30s',
    cues: [
      'Use light weight for counterbalance',
      'Push knees out with elbows',
      'Keep chest up, breathe normally'
    ],
    cuesIt: [
      'Usa un peso leggero per il controbilanciamento',
      'Spingi le ginocchia fuori con i gomiti',
      'Mantieni il petto alto, respira normalmente'
    ],
    whenToUse: 'If you struggle to reach depth in squat',
    whenToUseIt: 'Se fai fatica a raggiungere la profondità nello squat'
  },
  {
    name: 'Hip Flexor Stretch (Half Kneeling)',
    nameIt: 'Stretch Flessori Anca (Mezza Ginocchio)',
    category: 'mobility',
    targetArea: ['hip'],
    purpose: 'Release tight hip flexors that limit hip extension',
    purposeIt: 'Rilasciare i flessori dell\'anca tesi che limitano l\'estensione',
    sets: '2',
    reps: '45-60s per side',
    rest: '30s',
    cues: [
      'Tuck pelvis (posterior tilt)',
      'Squeeze glute of the back leg',
      'Lean forward only until you feel stretch in front of hip'
    ],
    cuesIt: [
      'Retroversione del bacino',
      'Stringi il gluteo della gamba posteriore',
      'Inclinati in avanti solo fino a sentire lo stretch davanti all\'anca'
    ],
    whenToUse: 'If you sit a lot or feel tight in front of hips during deadlifts',
    whenToUseIt: 'Se stai molto seduto o senti tensione davanti alle anche durante gli stacchi'
  }
];

/**
 * Esercizi per migliorare la mobilità della caviglia
 * Utili per: squat depth, forward knee travel
 */
export const ANKLE_MOBILITY_EXERCISES: CorrectiveExercise[] = [
  {
    name: 'Wall Ankle Mobilization',
    nameIt: 'Mobilizzazione Caviglia al Muro',
    category: 'mobility',
    targetArea: ['ankle'],
    purpose: 'Improve ankle dorsiflexion for better squat mechanics',
    purposeIt: 'Migliorare la dorsiflessione della caviglia per una migliore meccanica dello squat',
    sets: '2-3',
    reps: '10-15 per side',
    rest: '30s',
    cues: [
      'Face wall, foot 3-4 inches from wall',
      'Drive knee forward over toes',
      'Keep heel down, don\'t let it lift'
    ],
    cuesIt: [
      'Di fronte al muro, piede a 8-10 cm dal muro',
      'Porta il ginocchio avanti oltre le dita',
      'Tieni il tallone giù, non farlo alzare'
    ],
    whenToUse: 'If your heels rise during squat or you can\'t reach depth',
    whenToUseIt: 'Se i talloni si alzano durante lo squat o non riesci a raggiungere la profondità'
  },
  {
    name: 'Banded Ankle Distraction',
    nameIt: 'Distrazione Caviglia con Banda',
    category: 'mobility',
    targetArea: ['ankle'],
    purpose: 'Improve joint mobility of the ankle',
    purposeIt: 'Migliorare la mobilità articolare della caviglia',
    sets: '2',
    reps: '10-15 oscillations per side',
    rest: '30s',
    cues: [
      'Band around front of ankle, anchored behind',
      'Lunge forward, letting band pull ankle back',
      'Oscillate gently in and out of range'
    ],
    cuesIt: [
      'Banda intorno alla parte anteriore della caviglia, ancorata dietro',
      'Affondo in avanti, lasciando che la banda tiri indietro la caviglia',
      'Oscilla delicatamente dentro e fuori dal range'
    ],
    whenToUse: 'Before lower body work if ankle mobility is limited',
    whenToUseIt: 'Prima del lavoro lower body se la mobilità della caviglia è limitata'
  }
];

/**
 * Esercizi per attivazione glutei
 * Utili per: valgismo, debolezza in squat/deadlift
 */
export const GLUTE_ACTIVATION_EXERCISES: CorrectiveExercise[] = [
  {
    name: 'Glute Bridge',
    nameIt: 'Ponte Glutei',
    category: 'activation',
    targetArea: ['hip', 'glutes'],
    purpose: 'Wake up glutes before compound lifts',
    purposeIt: 'Attivare i glutei prima degli esercizi composti',
    sets: '2',
    reps: '10-15',
    rest: '30s',
    cues: [
      'Feet hip width, heels close to butt',
      'Squeeze glutes to lift hips',
      'Pause at top, feel the squeeze'
    ],
    cuesIt: [
      'Piedi larghezza anche, talloni vicino al sedere',
      'Stringi i glutei per sollevare le anche',
      'Pausa in alto, senti la contrazione'
    ],
    whenToUse: 'Before squats/deadlifts if you feel glutes don\'t engage well',
    whenToUseIt: 'Prima di squat/stacchi se senti che i glutei non si attivano bene'
  },
  {
    name: 'Clamshell',
    nameIt: 'Clamshell',
    category: 'activation',
    targetArea: ['hip', 'glutes'],
    purpose: 'Activate gluteus medius to prevent knee valgus',
    purposeIt: 'Attivare il gluteo medio per prevenire il valgismo del ginocchio',
    sets: '2',
    reps: '15-20 per side',
    rest: '30s',
    cues: [
      'Lie on side, knees bent at 90°',
      'Keep feet together, open knees like a clamshell',
      'Don\'t rotate pelvis, isolate the hip'
    ],
    cuesIt: [
      'Sdraiato sul fianco, ginocchia piegate a 90°',
      'Tieni i piedi uniti, apri le ginocchia come una conchiglia',
      'Non ruotare il bacino, isola l\'anca'
    ],
    whenToUse: 'If your knees tend to cave in during squats or lunges',
    whenToUseIt: 'Se le ginocchia tendono a cedere verso l\'interno durante squat o affondi'
  },
  {
    name: 'Banded Monster Walk',
    nameIt: 'Monster Walk con Banda',
    category: 'activation',
    targetArea: ['hip', 'glutes'],
    purpose: 'Activate glutes in a more functional pattern',
    purposeIt: 'Attivare i glutei in un pattern più funzionale',
    sets: '2',
    reps: '10 steps each direction',
    rest: '30s',
    cues: [
      'Band around ankles or above knees',
      'Slight squat position, stay low',
      'Take wide steps, maintain tension on band'
    ],
    cuesIt: [
      'Banda intorno alle caviglie o sopra le ginocchia',
      'Posizione di leggero squat, resta basso',
      'Fai passi ampi, mantieni tensione sulla banda'
    ],
    whenToUse: 'Before squats if you want to prime your glutes',
    whenToUseIt: 'Prima degli squat se vuoi preparare i glutei'
  }
];

/**
 * Esercizi per controllo del core
 * NOTA: Questi NON sono "McGill Big 3" come prescrizione universale.
 * Sono opzioni per chi vuole lavorare sulla stabilità del core.
 */
export const CORE_STABILITY_EXERCISES: CorrectiveExercise[] = [
  {
    name: 'Dead Bug',
    nameIt: 'Dead Bug',
    category: 'stability',
    targetArea: ['core', 'lower_back'],
    purpose: 'Learn to stabilize core while moving limbs',
    purposeIt: 'Imparare a stabilizzare il core mentre si muovono gli arti',
    sets: '2-3',
    reps: '8-10 per side',
    rest: '30s',
    cues: [
      'Back flat on floor, no gap under lower back',
      'Move opposite arm and leg slowly',
      'Exhale as you extend, don\'t let back arch'
    ],
    cuesIt: [
      'Schiena piatta sul pavimento, nessuno spazio sotto la bassa schiena',
      'Muovi braccio e gamba opposti lentamente',
      'Espira mentre estendi, non lasciare che la schiena si inarchi'
    ],
    whenToUse: 'If you want to improve core control during lifts',
    whenToUseIt: 'Se vuoi migliorare il controllo del core durante i sollevamenti'
  },
  {
    name: 'Bird Dog',
    nameIt: 'Bird Dog',
    category: 'stability',
    targetArea: ['core', 'lower_back'],
    purpose: 'Develop spine stability during movement',
    purposeIt: 'Sviluppare la stabilità della colonna durante il movimento',
    sets: '2-3',
    reps: '8-10 per side',
    rest: '30s',
    cues: [
      'Hands under shoulders, knees under hips',
      'Extend opposite arm and leg, keep spine neutral',
      'Move slowly, don\'t rush'
    ],
    cuesIt: [
      'Mani sotto le spalle, ginocchia sotto le anche',
      'Estendi braccio e gamba opposti, mantieni la colonna neutra',
      'Muoviti lentamente, non avere fretta'
    ],
    whenToUse: 'Before deadlifts or if you want to work on back stability',
    whenToUseIt: 'Prima degli stacchi o se vuoi lavorare sulla stabilità della schiena'
  },
  {
    name: 'Pallof Press',
    nameIt: 'Pallof Press',
    category: 'stability',
    targetArea: ['core'],
    purpose: 'Anti-rotation core training',
    purposeIt: 'Allenamento del core anti-rotazione',
    sets: '2-3',
    reps: '8-10 per side',
    rest: '30s',
    cues: [
      'Stand sideways to cable/band anchor',
      'Hold at chest, press straight out',
      'Resist rotation, keep hips square'
    ],
    cuesIt: [
      'In piedi di lato rispetto all\'ancoraggio cavo/banda',
      'Tieni al petto, spingi dritto in avanti',
      'Resisti alla rotazione, mantieni i fianchi fermi'
    ],
    whenToUse: 'If you want to build core stability for compound lifts',
    whenToUseIt: 'Se vuoi costruire stabilità del core per esercizi composti'
  }
];

/**
 * Progressioni di carico per tornare a movimenti completi
 * L'obiettivo è TORNARE al movimento, non evitarlo
 */
export const LOAD_PROGRESSION_EXERCISES: CorrectiveExercise[] = [
  {
    name: 'Box Squat',
    nameIt: 'Box Squat',
    category: 'load_progression',
    targetArea: ['hip', 'lower_back', 'knee'],
    purpose: 'Squat with controlled depth and confidence',
    purposeIt: 'Squat con profondità controllata e sicurezza',
    sets: '3-4',
    reps: '8-10',
    rest: '90s',
    cues: [
      'Set box at a height you\'re comfortable with',
      'Sit back to box, don\'t plop',
      'Stand up from controlled seated position'
    ],
    cuesIt: [
      'Imposta il box a un\'altezza con cui ti senti a tuo agio',
      'Siediti indietro sul box, non lasciarti cadere',
      'Alzati da una posizione seduta controllata'
    ],
    whenToUse: 'When returning to squats after discomfort, to control depth',
    whenToUseIt: 'Quando torni agli squat dopo un fastidio, per controllare la profondità',
    progression: 'Lower the box as confidence increases',
    progressionIt: 'Abbassa il box man mano che la sicurezza aumenta'
  },
  {
    name: 'Rack Pull',
    nameIt: 'Rack Pull',
    category: 'load_progression',
    targetArea: ['lower_back', 'hip'],
    purpose: 'Deadlift from elevated position to reduce range of motion',
    purposeIt: 'Stacco da posizione rialzata per ridurre il range of motion',
    sets: '3-4',
    reps: '6-8',
    rest: '2min',
    cues: [
      'Set pins at knee level or above',
      'Same technique as full deadlift',
      'Gradually lower starting height over weeks'
    ],
    cuesIt: [
      'Imposta i fermi all\'altezza delle ginocchia o sopra',
      'Stessa tecnica dello stacco completo',
      'Abbassa gradualmente l\'altezza di partenza nelle settimane'
    ],
    whenToUse: 'When returning to deadlifts after back discomfort',
    whenToUseIt: 'Quando torni agli stacchi dopo un fastidio alla schiena',
    progression: 'Lower the pins each week until reaching floor',
    progressionIt: 'Abbassa i fermi ogni settimana fino a raggiungere il pavimento'
  },
  {
    name: 'Floor Press',
    nameIt: 'Floor Press',
    category: 'load_progression',
    targetArea: ['shoulder'],
    purpose: 'Bench press with naturally limited range of motion',
    purposeIt: 'Panca con range of motion naturalmente limitato',
    sets: '3-4',
    reps: '8-10',
    rest: '90s',
    cues: [
      'Lie on floor, elbows touch floor at bottom',
      'Same technique as bench press',
      'Pause briefly when elbows touch floor'
    ],
    cuesIt: [
      'Sdraiato sul pavimento, i gomiti toccano il pavimento in basso',
      'Stessa tecnica della panca piana',
      'Breve pausa quando i gomiti toccano il pavimento'
    ],
    whenToUse: 'When returning to pressing after shoulder discomfort',
    whenToUseIt: 'Quando torni alle spinte dopo un fastidio alla spalla',
    progression: 'Progress to low incline, then flat bench',
    progressionIt: 'Progredisci a panca inclinata bassa, poi panca piana'
  }
];

// ============================================================================
// MOVEMENT-SPECIFIC CORRECTIVE SETS
// ============================================================================

export const MOVEMENT_CORRECTIVE_SETS: MovementCorrectiveSet[] = [
  {
    movement: 'squat',
    context: 'For improving squat depth and control',
    contextIt: 'Per migliorare profondità e controllo dello squat',
    note: 'These are OPTIONAL exercises if you want to work on your squat. They are not mandatory.',
    noteIt: 'Questi sono esercizi OPZIONALI se vuoi lavorare sul tuo squat. Non sono obbligatori.',
    exercises: [
      ...HIP_MOBILITY_EXERCISES.slice(0, 2),
      ...ANKLE_MOBILITY_EXERCISES.slice(0, 1),
      ...GLUTE_ACTIVATION_EXERCISES.slice(0, 1)
    ]
  },
  {
    movement: 'deadlift',
    context: 'For improving deadlift setup and hip hinge',
    contextIt: 'Per migliorare il setup dello stacco e l\'hip hinge',
    note: 'These are OPTIONAL exercises if you want to work on your deadlift pattern.',
    noteIt: 'Questi sono esercizi OPZIONALI se vuoi lavorare sul tuo pattern di stacco.',
    exercises: [
      ...HIP_MOBILITY_EXERCISES.filter(e => e.name.includes('Hip Flexor') || e.name.includes('90/90')),
      ...GLUTE_ACTIVATION_EXERCISES.slice(0, 1),
      ...CORE_STABILITY_EXERCISES.slice(0, 1)
    ]
  },
  {
    movement: 'bench_press',
    context: 'For improving bench press stability and shoulder health',
    contextIt: 'Per migliorare la stabilità della panca e la salute della spalla',
    note: 'These are OPTIONAL exercises if you want to work on your pressing pattern.',
    noteIt: 'Questi sono esercizi OPZIONALI se vuoi lavorare sul tuo pattern di spinta.',
    exercises: [
      // Shoulder mobility and stability exercises would go here
    ]
  },
  {
    movement: 'knee_discomfort',
    context: 'For those experiencing knee discomfort who want to continue training',
    contextIt: 'Per chi ha fastidio al ginocchio e vuole continuare ad allenarsi',
    note: 'These exercises can help you continue training while managing discomfort. Consult a professional if discomfort persists.',
    noteIt: 'Questi esercizi possono aiutarti a continuare ad allenarti gestendo il fastidio. Consulta un professionista se il fastidio persiste.',
    exercises: [
      ...GLUTE_ACTIVATION_EXERCISES.slice(0, 2),
      ...LOAD_PROGRESSION_EXERCISES.filter(e => e.name === 'Box Squat')
    ]
  },
  {
    movement: 'lower_back_discomfort',
    context: 'For those experiencing lower back discomfort who want to continue training',
    contextIt: 'Per chi ha fastidio alla bassa schiena e vuole continuare ad allenarsi',
    note: 'These exercises can help build tolerance while managing discomfort. The goal is to return to full movements, not avoid them.',
    noteIt: 'Questi esercizi possono aiutare a costruire tolleranza gestendo il fastidio. L\'obiettivo è tornare ai movimenti completi, non evitarli.',
    exercises: [
      ...CORE_STABILITY_EXERCISES.slice(0, 2),
      ...HIP_MOBILITY_EXERCISES.slice(0, 1),
      ...LOAD_PROGRESSION_EXERCISES.filter(e => e.name === 'Rack Pull')
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get corrective exercises for a specific movement pattern
 */
export function getCorrectivesForMovement(movement: string): MovementCorrectiveSet | null {
  return MOVEMENT_CORRECTIVE_SETS.find(m => m.movement === movement) || null;
}

/**
 * Get corrective exercises for a specific body area
 */
export function getCorrectivesForArea(area: string): CorrectiveExercise[] {
  const allExercises = [
    ...HIP_MOBILITY_EXERCISES,
    ...ANKLE_MOBILITY_EXERCISES,
    ...GLUTE_ACTIVATION_EXERCISES,
    ...CORE_STABILITY_EXERCISES,
    ...LOAD_PROGRESSION_EXERCISES
  ];
  
  return allExercises.filter(ex => ex.targetArea.includes(area));
}

/**
 * Get warm-up suggestions based on planned exercises
 */
export function getSuggestedWarmup(
  plannedExercises: string[],
  discomfortAreas: string[] = []
): CorrectiveExercise[] {
  const suggestions: CorrectiveExercise[] = [];
  
  // Check for squat variations
  if (plannedExercises.some(ex => ex.toLowerCase().includes('squat'))) {
    suggestions.push(...HIP_MOBILITY_EXERCISES.slice(0, 1));
    suggestions.push(...ANKLE_MOBILITY_EXERCISES.slice(0, 1));
    suggestions.push(...GLUTE_ACTIVATION_EXERCISES.slice(0, 1));
  }
  
  // Check for deadlift variations
  if (plannedExercises.some(ex => 
    ex.toLowerCase().includes('deadlift') || 
    ex.toLowerCase().includes('rdl') ||
    ex.toLowerCase().includes('stacco')
  )) {
    suggestions.push(...HIP_MOBILITY_EXERCISES.filter(e => e.name.includes('Hip Flexor')));
    suggestions.push(...GLUTE_ACTIVATION_EXERCISES.slice(0, 1));
  }
  
  // Add area-specific exercises for discomfort
  for (const area of discomfortAreas) {
    const areaExercises = getCorrectivesForArea(area);
    for (const ex of areaExercises) {
      if (!suggestions.find(s => s.name === ex.name)) {
        suggestions.push(ex);
      }
    }
  }
  
  // Limit to reasonable number
  return suggestions.slice(0, 4);
}
