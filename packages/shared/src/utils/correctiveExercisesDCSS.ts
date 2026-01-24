/**
 * CORRECTIVE EXERCISES - DCSS Paradigm (Replaces McGill-centric approach)
 * 
 * ⚠️ QUESTO FILE SOSTITUISCE movementSpecificCorrectiveExercises.ts
 * 
 * CAMBIAMENTI CHIAVE DA McGILL → DCSS:
 * 
 * 1. ❌ RIMOSSO: "McGill Big 3" come gold standard
 * 2. ✅ AGGIUNTO: Diversità di opzioni (l'utente sceglie)
 * 3. ✅ AGGIUNTO: Progressione VERSO il movimento, non LONTANO da esso
 * 4. ✅ AGGIUNTO: Linguaggio educativo, non prescrittivo
 * 5. ✅ AGGIUNTO: Jefferson Curl e altri esercizi di tolleranza alla flessione
 * 
 * FILOSOFIA DCSS (Evangelista):
 * - La flessione spinale NON è intrinsecamente pericolosa
 * - Il corpo si ADATTA ai carichi progressivi
 * - L'obiettivo è costruire TOLLERANZA, non evitare pattern
 * - Gli esercizi sono OPZIONI, non prescrizioni
 * 
 * REFERENCE:
 * - Evangelista P - DCSS (Didattica e Correzione degli esercizi)
 * - Caneiro JP et al. (2019) - Beliefs about the body and pain
 * - O'Sullivan PB et al. (2018) - Cognitive functional therapy
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CorrectiveExercise {
  name: string;
  nameIt: string;
  sets: string;
  reps: string;
  rest: string;
  purpose: string;
  purposeIt: string;
  cues: string[];
  cuesIt: string[];
  alternative?: string;
  progressionTo?: string;
  whenToUse: string;
  whenToUseIt: string;
  whenToAvoid?: string;
  whenToAvoidIt?: string;
  videoUrl?: string;
}

export interface CorrectiveProtocol {
  id: string;
  movementPattern: string;
  description: string;
  descriptionIt: string;
  approach: 'mobility' | 'stability' | 'tolerance' | 'strength';
  educationalNote: string;
  educationalNoteIt: string;
  exercises: CorrectiveExercise[];
  progressionPath: string[];
}

// ============================================================================
// LOWER BACK PROTOCOLS (DCSS - No McGill)
// ============================================================================

export const LOWER_BACK_CORRECTIVES: Record<string, CorrectiveProtocol> = {
  
  /**
   * FLEXION SENSITIVITY
   * Approccio DCSS: Costruire tolleranza progressiva alla flessione,
   * NON evitarla permanentemente
   */
  spinal_flexion_sensitivity: {
    id: 'spinal_flexion_sensitivity',
    movementPattern: 'spinal_flexion',
    description: 'For those reporting discomfort with forward bending',
    descriptionIt: 'Per chi segnala fastidio piegandosi in avanti',
    approach: 'tolerance',
    educationalNote: 'Spinal flexion is NORMAL and safe when controlled. The spine is strong and adaptable. Our goal is to build your tolerance, not to avoid the movement forever. Many people bend forward daily without issues.',
    educationalNoteIt: 'La flessione spinale è NORMALE e sicura quando controllata. La colonna è forte e adattabile. Il nostro obiettivo è costruire la tua tolleranza, non evitare il movimento per sempre. Molte persone si piegano in avanti quotidianamente senza problemi.',
    exercises: [
      {
        name: 'Cat-Cow',
        nameIt: 'Gatto-Mucca',
        sets: '2-3',
        reps: '8-10 cicli',
        rest: '30s',
        purpose: 'Gentle spinal mobility through full range - normalizes flexion',
        purposeIt: 'Mobilità spinale dolce attraverso tutto il ROM - normalizza la flessione',
        cues: [
          'On all fours, hands under shoulders, knees under hips',
          'Slowly round your back (cat), then gently arch (cow)',
          'Move within comfortable range - it should feel good',
          'Breathe: exhale on cat (flexion), inhale on cow (extension)'
        ],
        cuesIt: [
          'Quadrupedia, mani sotto le spalle, ginocchia sotto i fianchi',
          'Arrotonda lentamente la schiena (gatto), poi inarca dolcemente (mucca)',
          'Muoviti nel range confortevole - dovrebbe essere piacevole',
          'Respira: espira nel gatto (flessione), inspira nella mucca (estensione)'
        ],
        alternative: 'Pelvic Tilts (supine)',
        progressionTo: 'Seated Flexion, then Jefferson Curl',
        whenToUse: 'Warm-up or any time to reduce stiffness',
        whenToUseIt: 'Riscaldamento o in qualsiasi momento per ridurre la rigidità'
      },
      {
        name: 'Child\'s Pose (Supported)',
        nameIt: 'Posizione del Bambino (Supportata)',
        sets: '2-3',
        reps: '30-60s hold',
        rest: '15s',
        purpose: 'Sustained, relaxed spinal flexion - desensitization',
        purposeIt: 'Flessione spinale sostenuta e rilassata - desensibilizzazione',
        cues: [
          'Kneel and sit back on heels, arms forward or alongside body',
          'Let gravity gently flex your spine - don\'t force',
          'Breathe deeply into your lower back',
          'You can place a pillow under your belly for support'
        ],
        cuesIt: [
          'Inginocchiati e siediti sui talloni, braccia in avanti o lungo il corpo',
          'Lascia che la gravità fletta dolcemente la colonna - non forzare',
          'Respira profondamente nella bassa schiena',
          'Puoi mettere un cuscino sotto la pancia per supporto'
        ],
        alternative: 'Supine Knee-to-Chest',
        progressionTo: 'Full Child\'s Pose without support',
        whenToUse: 'Cool-down or rest days',
        whenToUseIt: 'Defaticamento o giorni di riposo'
      },
      {
        name: 'Dead Bug',
        nameIt: 'Dead Bug',
        sets: '2-3',
        reps: '8-10 per lato',
        rest: '45s',
        purpose: 'Core control while maintaining spine position - builds stability',
        purposeIt: 'Controllo del core mantenendo la posizione spinale - costruisce stabilità',
        cues: [
          'Supine, arms toward ceiling, knees at 90°',
          'Press lower back gently into floor (not forced)',
          'Extend opposite arm and leg slowly',
          'Maintain back contact throughout - no arching'
        ],
        cuesIt: [
          'Supino, braccia verso il soffitto, ginocchia a 90°',
          'Premi dolcemente la lombare a terra (non forzato)',
          'Estendi braccio e gamba opposti lentamente',
          'Mantieni il contatto della schiena - niente inarcamenti'
        ],
        alternative: 'Supine March',
        progressionTo: 'Bird Dog',
        whenToUse: 'Core work in any session',
        whenToUseIt: 'Lavoro core in qualsiasi sessione'
      },
      {
        name: 'Jefferson Curl (Bodyweight)',
        nameIt: 'Jefferson Curl (Corpo Libero)',
        sets: '2',
        reps: '5-8',
        rest: '60s',
        purpose: 'PROGRESSIVE LOADING of spinal flexion - BUILDS TOLERANCE',
        purposeIt: 'CARICO PROGRESSIVO della flessione spinale - COSTRUISCE TOLLERANZA',
        cues: [
          'Stand on elevated surface (box/step) or floor',
          'NO weight initially - just bodyweight',
          'Roll down ONE VERTEBRA at a time from neck to lower back',
          'Let arms hang, feel stretch in hamstrings and entire back',
          'Roll up the same way - controlled, vertebra by vertebra'
        ],
        cuesIt: [
          'In piedi su superficie rialzata (box/step) o pavimento',
          'NESSUN peso inizialmente - solo corpo libero',
          'Scendi UNA VERTEBRA alla volta dal collo alla bassa schiena',
          'Lascia le braccia penzolare, senti lo stretch in femorali e tutta la schiena',
          'Risali allo stesso modo - controllato, vertebra per vertebra'
        ],
        alternative: 'Standing Forward Fold',
        progressionTo: 'Jefferson Curl with light weight (2-5kg)',
        whenToUse: 'When ready to build flexion tolerance (not in acute phase)',
        whenToUseIt: 'Quando sei pronto a costruire tolleranza alla flessione (non in fase acuta)',
        whenToAvoid: 'Acute disc symptoms, first 1-2 weeks of new discomfort',
        whenToAvoidIt: 'Sintomi discali acuti, prime 1-2 settimane di nuovo fastidio'
      }
    ],
    progressionPath: [
      'Cat-Cow (mobility)',
      'Child\'s Pose (passive flexion)',
      'Dead Bug (core control)',
      'Jefferson Curl bodyweight (active flexion)',
      'Jefferson Curl loaded (progressive overload)'
    ]
  },

  /**
   * EXTENSION SENSITIVITY
   */
  spinal_extension_sensitivity: {
    id: 'spinal_extension_sensitivity',
    movementPattern: 'spinal_extension',
    description: 'For those reporting discomfort with back arching',
    descriptionIt: 'Per chi segnala fastidio inarcando la schiena',
    approach: 'mobility',
    educationalNote: 'Extension sensitivity is often related to hip flexor tightness or excessive lumbar curve compensation. We\'ll work on hip mobility and core control to reduce the demand on your lower back.',
    educationalNoteIt: 'La sensibilità all\'estensione è spesso legata a rigidità dei flessori dell\'anca o compensazione con curva lombare eccessiva. Lavoreremo sulla mobilità dell\'anca e controllo del core per ridurre la richiesta sulla bassa schiena.',
    exercises: [
      {
        name: 'Hip Flexor Stretch (Active)',
        nameIt: 'Stretch Flessori Anca (Attivo)',
        sets: '2-3',
        reps: '30-45s per lato',
        rest: '15s',
        purpose: 'Reduce hip flexor tension that causes lumbar hyperextension',
        purposeIt: 'Ridurre tensione flessori anca che causa iperestensione lombare',
        cues: [
          'Half-kneeling position, back knee on pad',
          'TUCK your pelvis under (posterior pelvic tilt)',
          'Shift weight forward WHILE maintaining pelvic tuck',
          'You should feel the stretch in front of hip, NOT lower back'
        ],
        cuesIt: [
          'Posizione semi-inginocchiata, ginocchio posteriore su pad',
          'PORTA il bacino sotto (retroversione pelvica)',
          'Sposta il peso avanti MANTENENDO la retroversione',
          'Dovresti sentire lo stretch davanti all\'anca, NON nella bassa schiena'
        ],
        alternative: 'Couch Stretch',
        progressionTo: 'Deep Lunge',
        whenToUse: 'Daily, especially after sitting',
        whenToUseIt: 'Quotidianamente, specialmente dopo stare seduti'
      },
      {
        name: 'Glute Bridge (Controlled)',
        nameIt: 'Ponte Glutei (Controllato)',
        sets: '3',
        reps: '12-15',
        rest: '45s',
        purpose: 'Hip extension without lumbar hyperextension',
        purposeIt: 'Estensione anca senza iperestensione lombare',
        cues: [
          'Supine, knees bent, feet flat',
          'Drive through heels, squeeze glutes at top',
          'DO NOT hyperextend lower back - stop when hips are in line',
          'Pause 2s at top, lower controlled'
        ],
        cuesIt: [
          'Supino, ginocchia piegate, piedi a terra',
          'Spingi attraverso i talloni, stringi i glutei in alto',
          'NON iperestendere la lombare - fermati quando i fianchi sono in linea',
          'Pausa 2s in alto, scendi controllato'
        ],
        alternative: 'Hip Thrust (bench)',
        progressionTo: 'Single Leg Glute Bridge',
        whenToUse: 'Lower body sessions, glute activation',
        whenToUseIt: 'Sessioni lower body, attivazione glutei'
      },
      {
        name: 'Hollow Body Hold',
        nameIt: 'Hollow Body Hold',
        sets: '3',
        reps: '20-30s',
        rest: '45s',
        purpose: 'Anti-extension core control',
        purposeIt: 'Controllo core anti-estensione',
        cues: [
          'Supine, arms overhead, legs extended',
          'Press lower back INTO the floor',
          'Lift head, shoulders, and feet slightly off ground',
          'Maintain the "banana" shape - no arching'
        ],
        cuesIt: [
          'Supino, braccia sopra la testa, gambe estese',
          'Premi la lombare NEL pavimento',
          'Solleva testa, spalle e piedi leggermente dal suolo',
          'Mantieni la forma a "banana" - niente inarcamenti'
        ],
        alternative: 'Dead Bug',
        progressionTo: 'Hollow Body Rocks',
        whenToUse: 'Core work',
        whenToUseIt: 'Lavoro core'
      }
    ],
    progressionPath: [
      'Hip Flexor Stretch (reduce compensation)',
      'Glute Bridge (hip extension pattern)',
      'Hollow Body (anti-extension control)',
      'Plank (if tolerated)'
    ]
  },

  /**
   * ROTATION SENSITIVITY
   */
  spinal_rotation_sensitivity: {
    id: 'spinal_rotation_sensitivity',
    movementPattern: 'spinal_rotation',
    description: 'For those reporting discomfort with twisting movements',
    descriptionIt: 'Per chi segnala fastidio con movimenti di torsione',
    approach: 'stability',
    educationalNote: 'Rotation sensitivity often means the THORACIC spine is stiff, so the LUMBAR spine compensates with more rotation. Improving thoracic mobility can help. Rotation is a normal movement - we\'re building your tolerance to it.',
    educationalNoteIt: 'La sensibilità alla rotazione spesso significa che la colonna TORACICA è rigida, quindi la LOMBARE compensa ruotando di più. Migliorare la mobilità toracica può aiutare. La rotazione è un movimento normale - stiamo costruendo la tua tolleranza.',
    exercises: [
      {
        name: 'Thoracic Rotation (Quadruped)',
        nameIt: 'Rotazione Toracica (Quadrupedia)',
        sets: '2-3',
        reps: '8-10 per lato',
        rest: '30s',
        purpose: 'Improve thoracic rotation to reduce lumbar demand',
        purposeIt: 'Migliorare rotazione toracica per ridurre richiesta lombare',
        cues: [
          'All fours position, one hand behind head',
          'Rotate ONLY your upper back - pelvis stays still',
          'Follow your elbow with your eyes',
          'Feel the rotation in your mid-back, not lower back'
        ],
        cuesIt: [
          'Posizione quadrupedia, una mano dietro la testa',
          'Ruota SOLO la parte alta della schiena - il bacino resta fermo',
          'Segui il gomito con gli occhi',
          'Senti la rotazione nella schiena media, non bassa'
        ],
        alternative: 'Open Book Stretch',
        progressionTo: 'Thread the Needle',
        whenToUse: 'Warm-up, mobility work',
        whenToUseIt: 'Riscaldamento, lavoro mobilità'
      },
      {
        name: 'Pallof Press',
        nameIt: 'Pallof Press',
        sets: '3',
        reps: '10-12 per lato',
        rest: '45s',
        purpose: 'Anti-rotation stability - control without avoiding',
        purposeIt: 'Stabilità anti-rotazione - controllo senza evitare',
        cues: [
          'Stand sideways to cable/band at chest height',
          'Hold handle at chest, step out for tension',
          'Press arms straight out - RESIST the rotation',
          'Keep shoulders square, core braced'
        ],
        cuesIt: [
          'In piedi di lato a cavo/elastico all\'altezza del petto',
          'Tieni la maniglia al petto, fai un passo fuori per tensione',
          'Estendi le braccia dritte - RESISTI alla rotazione',
          'Mantieni spalle dritte, core attivato'
        ],
        alternative: 'Suitcase Carry',
        progressionTo: 'Pallof Press with rotation',
        whenToUse: 'Core work in any session',
        whenToUseIt: 'Lavoro core in qualsiasi sessione'
      },
      {
        name: 'Side Plank',
        nameIt: 'Plank Laterale',
        sets: '2-3',
        reps: '20-30s per lato',
        rest: '30s',
        purpose: 'Lateral stability - anti-lateral flexion',
        purposeIt: 'Stabilità laterale - anti-flessione laterale',
        cues: [
          'Elbow under shoulder, body in straight line',
          'Top hip lifted - don\'t let it sag',
          'Stack feet or stagger for balance',
          'Breathe normally, maintain alignment'
        ],
        cuesIt: [
          'Gomito sotto la spalla, corpo in linea retta',
          'Anca superiore sollevata - non lasciarla cedere',
          'Piedi sovrapposti o sfalsati per equilibrio',
          'Respira normalmente, mantieni allineamento'
        ],
        alternative: 'Side Plank on knees',
        progressionTo: 'Side Plank with hip dips',
        whenToUse: 'Core work',
        whenToUseIt: 'Lavoro core'
      }
    ],
    progressionPath: [
      'Thoracic Rotation (mobility)',
      'Pallof Press (anti-rotation)',
      'Side Plank (lateral stability)',
      'Wood Chop (controlled rotation)'
    ]
  },

  /**
   * GENERAL WEAKNESS / INSTABILITY
   */
  general_instability: {
    id: 'general_instability',
    movementPattern: 'general_stability',
    description: 'For those who feel weak or unstable in the lower back',
    descriptionIt: 'Per chi si sente debole o instabile nella bassa schiena',
    approach: 'strength',
    educationalNote: 'Feeling unstable doesn\'t mean your spine is fragile. It often means there\'s an opportunity to build strength and confidence in these positions. Your spine is designed to move and handle load - we\'ll build your capacity.',
    educationalNoteIt: 'Sentirsi instabili non significa che la colonna sia fragile. Spesso indica un\'opportunità per costruire forza e confidenza in queste posizioni. La tua colonna è progettata per muoversi e gestire carico - costruiremo la tua capacità.',
    exercises: [
      {
        name: 'Bird Dog',
        nameIt: 'Bird Dog',
        sets: '3',
        reps: '8-10 per lato',
        rest: '45s',
        purpose: 'Multi-planar stability in neutral - foundational',
        purposeIt: 'Stabilità multi-planare in posizione neutra - fondamentale',
        cues: [
          'All fours, spine neutral (slight natural curves)',
          'Extend opposite arm and leg SLOWLY (4 seconds)',
          'Don\'t rotate or shift weight laterally',
          'Hold 2-3 seconds, return controlled'
        ],
        cuesIt: [
          'Quadrupedia, colonna neutra (curve naturali leggere)',
          'Estendi braccio e gamba opposti LENTAMENTE (4 secondi)',
          'Non ruotare o spostare il peso lateralmente',
          'Tieni 2-3 secondi, ritorna controllato'
        ],
        alternative: 'Supine March',
        progressionTo: 'Bird Dog with hold at end range',
        whenToUse: 'Warm-up or core work',
        whenToUseIt: 'Riscaldamento o lavoro core'
      },
      {
        name: 'Plank (or Modified)',
        nameIt: 'Plank (o Modificato)',
        sets: '3',
        reps: '20-45s',
        rest: '45s',
        purpose: 'Full-body tension, anti-extension foundation',
        purposeIt: 'Tensione tutto il corpo, fondamento anti-estensione',
        cues: [
          'Forearms and toes (or knees for modified)',
          'Body in straight line - don\'t sag or pike',
          'Squeeze glutes, brace core',
          'Breathe normally - don\'t hold breath'
        ],
        cuesIt: [
          'Avambracci e punte dei piedi (o ginocchia per modificato)',
          'Corpo in linea retta - non cedere o sollevare',
          'Stringi glutei, attiva core',
          'Respira normalmente - non trattenere il fiato'
        ],
        alternative: 'Wall Plank (standing)',
        progressionTo: 'Plank with shoulder taps',
        whenToUse: 'Core work',
        whenToUseIt: 'Lavoro core'
      },
      {
        name: 'Farmer Carry',
        nameIt: 'Farmer Carry',
        sets: '3',
        reps: '30-40m',
        rest: '60s',
        purpose: 'Functional stability under load - real world transfer',
        purposeIt: 'Stabilità funzionale sotto carico - trasferimento mondo reale',
        cues: [
          'Hold dumbbells/kettlebells at sides',
          'Stand tall, shoulders back',
          'Walk with controlled steps - don\'t waddle',
          'Core braced throughout'
        ],
        cuesIt: [
          'Tieni manubri/kettlebell ai lati',
          'Stai dritto, spalle indietro',
          'Cammina con passi controllati - non ondeggiare',
          'Core attivato per tutto il tempo'
        ],
        alternative: 'Suitcase Carry (single side)',
        progressionTo: 'Heavier Farmer Carry',
        whenToUse: 'Finisher or functional work',
        whenToUseIt: 'Finisher o lavoro funzionale'
      }
    ],
    progressionPath: [
      'Bird Dog (control)',
      'Plank (isometric strength)',
      'Dead Bug (dynamic control)',
      'Farmer Carry (loaded stability)',
      'Deadlift progression (functional strength)'
    ]
  }
};

// ============================================================================
// PAIN MANAGEMENT CORRECTIVE MAPPING
// Mappa per sostituire i riferimenti McGill nel sistema esistente
// ============================================================================

export const CORRECTIVE_MAPPING: Record<string, string[]> = {
  // LOWER BACK - sostituisce 'McGill Big 3'
  lower_back: [
    'Dead Bug',
    'Bird Dog', 
    'Side Plank',
    'Glute Bridge',
    'Cat-Cow',
    'Pallof Press'
  ],
  lower_back_flexion: [
    'Cat-Cow',
    'Child\'s Pose',
    'Dead Bug',
    'Jefferson Curl (bodyweight)'
  ],
  lower_back_extension: [
    'Hip Flexor Stretch',
    'Glute Bridge',
    'Hollow Body Hold',
    'Dead Bug'
  ],
  lower_back_rotation: [
    'Thoracic Rotation',
    'Pallof Press',
    'Side Plank',
    'Bird Dog'
  ],
  
  // HIP
  hip: [
    '90/90 Hip Stretch',
    'Hip Flexor Stretch',
    'Glute Bridge',
    'Clamshells'
  ],
  hip_flexion: [
    '90/90 Hip Stretch',
    'Pigeon Pose (Modified)',
    'Clamshells'
  ],
  
  // SHOULDER
  shoulder: [
    'Face Pull',
    'External Rotation',
    'Wall Slides',
    'Prone Y-T-W'
  ],
  
  // KNEE
  knee: [
    'VMO Activation',
    'Terminal Knee Extension',
    'Wall Sit (controlled)',
    'Step Downs'
  ],
  
  // ANKLE
  ankle: [
    'Wall Ankle Mobilization',
    'Calf Stretch',
    'Single Leg Balance',
    'Toe Raises'
  ]
};

/**
 * Ottieni esercizi correttivi per una zona di dolore
 * SOSTITUISCE qualsiasi logica che usava McGill Big 3
 */
export function getCorrectiveExercisesForArea(area: string): string[] {
  const areaLower = area.toLowerCase().replace(/[^a-z_]/g, '_');
  
  // Prima cerca match esatto
  if (CORRECTIVE_MAPPING[areaLower]) {
    return CORRECTIVE_MAPPING[areaLower];
  }
  
  // Poi cerca partial match
  for (const [key, exercises] of Object.entries(CORRECTIVE_MAPPING)) {
    if (areaLower.includes(key) || key.includes(areaLower)) {
      return exercises;
    }
  }
  
  // Default: esercizi generici di stabilità
  return ['Dead Bug', 'Bird Dog', 'Glute Bridge', 'Cat-Cow'];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const CorrectiveExercisesDCSS = {
  LOWER_BACK_CORRECTIVES,
  CORRECTIVE_MAPPING,
  getCorrectiveExercisesForArea
};

export default CorrectiveExercisesDCSS;
