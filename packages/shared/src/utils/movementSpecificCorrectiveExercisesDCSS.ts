/**
 * MOVEMENT-SPECIFIC CORRECTIVE EXERCISES - DCSS Revision
 * 
 * CAMBIAMENTI CHIAVE:
 * 1. McGill Big 3 NON più gold standard esclusivo
 * 2. Diversificazione esercizi correttivi
 * 3. Approccio individuale: esercizi SUGGERITI, non IMPOSTI
 * 4. Aggiunta alternative progressione (es. Jefferson Curl per flessione controllata)
 * 5. Linguaggio educational invece che prescrittivo
 * 
 * FILOSOFIA DCSS:
 * - Il corpo si ADATTA ai carichi progressivi
 * - La flessione spinale NON è intrinsecamente pericolosa
 * - Gli esercizi correttivi sono OPZIONI, non OBBLIGHI
 * - L'obiettivo è MOVIMENTO COMPETENTE, non evitare pattern
 */

export interface CorrectiveExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  purpose: string;
  purposeIt: string;
  cues: string[];
  cuesIt: string[];
  alternative?: string;  // Alternativa se questo non piace/funziona
  progressionTo?: string; // Dove può portare questo esercizio
  whenToUse: string;     // Quando suggerirlo
  whenToAvoid?: string;  // Quando NON suggerirlo
}

export interface CorrectiveProtocol {
  movementPattern: string;
  description: string;
  descriptionIt: string;
  approach: 'desensitization' | 'strengthening' | 'mobility' | 'control';
  exercises: CorrectiveExercise[];
  progressionPath?: string[]; // Percorso di progressione
  educationalNote: string;
  educationalNoteIt: string;
}

// ============================================================================
// LOWER BACK CORRECTIVES - Diversified Approach
// ============================================================================

export const LOWER_BACK_CORRECTIVES: Record<string, CorrectiveProtocol> = {
  
  // FLEXION SENSITIVITY (not "intolerance")
  spinal_flexion: {
    movementPattern: 'spinal_flexion',
    description: 'For those who report discomfort with forward bending',
    descriptionIt: 'Per chi segnala fastidio piegandosi in avanti',
    approach: 'desensitization',
    exercises: [
      {
        name: 'Cat-Cow (Controlled Flexion)',
        sets: '2-3',
        reps: '8-10',
        rest: '30s',
        purpose: 'Gentle spinal mobility through full range',
        purposeIt: 'Mobilità spinale dolce attraverso tutto il ROM',
        cues: [
          'On all fours, neutral spine',
          'Slowly round your back (cat), then gently arch (cow)',
          'Move within comfortable range',
          'Breathe: exhale on flexion, inhale on extension'
        ],
        cuesIt: [
          'Quadrupedia, colonna neutra',
          'Arrotonda lentamente la schiena (cat), poi inarca dolcemente (cow)',
          'Muoviti nel range confortevole',
          'Respira: espira in flessione, inspira in estensione'
        ],
        alternative: 'Supine Pelvic Tilts',
        progressionTo: 'Jefferson Curl (light)',
        whenToUse: 'Start of session, as warm-up',
        whenToAvoid: 'Never - this is safe for everyone'
      },
      {
        name: 'Supported Child\'s Pose',
        sets: '2',
        reps: '30-60s hold',
        rest: '30s',
        purpose: 'Passive flexion stretch, decompression',
        purposeIt: 'Stretch passivo in flessione, decompressione',
        cues: [
          'Knees wide, reach forward with arms',
          'Let your chest sink toward floor',
          'Breathe deeply into lower back',
          'Use pillow under chest if needed'
        ],
        cuesIt: [
          'Ginocchia larghe, allunga le braccia in avanti',
          'Lascia il petto scendere verso il pavimento',
          'Respira profondamente nella bassa schiena',
          'Usa un cuscino sotto il petto se necessario'
        ],
        alternative: 'Supine Knee-to-Chest',
        whenToUse: 'After main workout, before bed',
        whenToAvoid: 'If causes sharp pain'
      },
      {
        name: 'Dead Bug',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Core control while maintaining neutral spine',
        purposeIt: 'Controllo del core mantenendo la colonna neutra',
        cues: [
          'Supine, arms up, knees at 90°',
          'Press lower back into floor',
          'Extend opposite arm and leg slowly',
          'Don\'t let lower back arch'
        ],
        cuesIt: [
          'Supino, braccia in alto, ginocchia a 90°',
          'Premi la lombare contro il pavimento',
          'Estendi braccio e gamba opposti lentamente',
          'Non far arcuare la lombare'
        ],
        alternative: 'Bird Dog',
        progressionTo: 'Hollow Body Hold',
        whenToUse: 'As core work in any session'
      },
      {
        name: 'Jefferson Curl (Very Light)',
        sets: '2',
        reps: '5-8',
        rest: '60s',
        purpose: 'Progressive loading of spinal flexion - BUILDS TOLERANCE',
        purposeIt: 'Carico progressivo della flessione spinale - COSTRUISCE TOLLERANZA',
        cues: [
          'Stand on elevated surface, very light weight or none',
          'Roll down ONE VERTEBRA at a time',
          'Let arms hang, feel stretch in hamstrings and back',
          'Roll up the same way - controlled'
        ],
        cuesIt: [
          'In piedi su superficie rialzata, peso molto leggero o nessuno',
          'Scendi UNA VERTEBRA alla volta',
          'Lascia le braccia penzolare, senti lo stretch in femorali e schiena',
          'Risali allo stesso modo - controllato'
        ],
        alternative: 'Standing Forward Fold',
        progressionTo: 'Jefferson Curl with progressive load',
        whenToUse: 'When ready to build flexion tolerance (not acute phase)',
        whenToAvoid: 'Acute disc issues, first 2 weeks of discomfort'
      }
    ],
    progressionPath: [
      'Cat-Cow → Supported Child\'s Pose → Dead Bug → Jefferson Curl (light) → Jefferson Curl (loaded)'
    ],
    educationalNote: 'Spinal flexion is NORMAL and safe when controlled. The goal is not to avoid flexion forever, but to build tolerance and control. Your spine is strong and adaptable.',
    educationalNoteIt: 'La flessione spinale è NORMALE e sicura quando controllata. L\'obiettivo non è evitare la flessione per sempre, ma costruire tolleranza e controllo. La tua colonna è forte e adattabile.'
  },

  // EXTENSION SENSITIVITY
  spinal_extension: {
    movementPattern: 'spinal_extension',
    description: 'For those who report discomfort with backward bending',
    descriptionIt: 'Per chi segnala fastidio piegandosi indietro',
    approach: 'mobility',
    exercises: [
      {
        name: 'Supine Knee-to-Chest',
        sets: '2',
        reps: '30s hold/side',
        rest: '20s',
        purpose: 'Gentle flexion bias, decompression',
        purposeIt: 'Bias verso la flessione, decompressione',
        cues: [
          'Lie on back, pull one knee to chest',
          'Keep other leg extended or bent',
          'Feel gentle stretch in lower back',
          'Breathe and relax into it'
        ],
        cuesIt: [
          'Supino, tira un ginocchio al petto',
          'Tieni l\'altra gamba estesa o piegata',
          'Senti stretch dolce nella bassa schiena',
          'Respira e rilassati'
        ],
        whenToUse: 'Morning, or when extension feels tight'
      },
      {
        name: 'Pelvic Tilts (Posterior Focus)',
        sets: '2',
        reps: '10-12',
        rest: '30s',
        purpose: 'Learn to control pelvic position',
        purposeIt: 'Imparare a controllare la posizione del bacino',
        cues: [
          'Supine, knees bent, feet flat',
          'Flatten lower back into floor (posterior tilt)',
          'Then arch slightly (anterior tilt)',
          'Find the middle - that\'s neutral'
        ],
        cuesIt: [
          'Supino, ginocchia piegate, piedi a terra',
          'Schiaccia la lombare contro il pavimento (retroversione)',
          'Poi inarca leggermente (antiversione)',
          'Trova il centro - quello è neutro'
        ],
        whenToUse: 'As part of warm-up'
      },
      {
        name: 'Quadruped Rock-Back',
        sets: '2',
        reps: '10',
        rest: '30s',
        purpose: 'Hip mobility without forcing extension',
        purposeIt: 'Mobilità anca senza forzare l\'estensione',
        cues: [
          'On all fours, sit back toward heels',
          'Keep spine neutral (no rounding or arching)',
          'Feel hip flexion, not back stretch',
          'Return to start, repeat'
        ],
        cuesIt: [
          'Quadrupedia, siediti indietro verso i talloni',
          'Mantieni la colonna neutra (non arrotondare o inarcare)',
          'Senti flessione anca, non stretch schiena',
          'Torna all\'inizio, ripeti'
        ],
        whenToUse: 'Before lower body work'
      }
    ],
    educationalNote: 'Extension sensitivity often relates to facet joints or tight hip flexors, not structural damage. Improving hip mobility often helps. Extension isn\'t "bad" - it\'s just sensitive right now.',
    educationalNoteIt: 'La sensibilità all\'estensione spesso è legata alle faccette articolari o ai flessori dell\'anca tesi, non a danni strutturali. Migliorare la mobilità dell\'anca spesso aiuta. L\'estensione non è "cattiva" - è solo sensibile in questo momento.'
  },

  // ROTATION SENSITIVITY
  spinal_rotation: {
    movementPattern: 'spinal_rotation',
    description: 'For those who report discomfort with twisting movements',
    descriptionIt: 'Per chi segnala fastidio con movimenti di torsione',
    approach: 'control',
    exercises: [
      {
        name: 'Pallof Press',
        sets: '3',
        reps: '10/side',
        rest: '45s',
        purpose: 'Anti-rotation strength - control rotation, don\'t just avoid it',
        purposeIt: 'Forza anti-rotazione - controlla la rotazione, non evitarla',
        cues: [
          'Stand sideways to cable/band',
          'Press hands forward WITHOUT rotating',
          'Resist the pull, keep shoulders square',
          'Slow and controlled'
        ],
        cuesIt: [
          'In piedi laterale al cavo/elastico',
          'Spingi le mani avanti SENZA ruotare',
          'Resisti alla trazione, tieni le spalle quadrate',
          'Lento e controllato'
        ],
        alternative: 'Dead Bug with Rotation Resistance',
        progressionTo: 'Cable Wood Chop (controlled)',
        whenToUse: 'As core work in any session'
      },
      {
        name: 'Side Plank (or Modified)',
        sets: '3',
        reps: '20-30s/side',
        rest: '45s',
        purpose: 'Lateral stability - supports rotation control',
        purposeIt: 'Stabilità laterale - supporta il controllo della rotazione',
        cues: [
          'Elbow under shoulder, body in line',
          'Don\'t let hip sag or pike',
          'Can do from knees if needed',
          'Breathe normally'
        ],
        cuesIt: [
          'Gomito sotto la spalla, corpo in linea',
          'Non far cedere o sollevare l\'anca',
          'Si può fare dalle ginocchia se necessario',
          'Respira normalmente'
        ],
        alternative: 'Suitcase Carry',
        whenToUse: 'Core portion of workout'
      },
      {
        name: 'Quadruped Thoracic Rotation',
        sets: '2',
        reps: '8/side',
        rest: '30s',
        purpose: 'Improve thoracic rotation - takes stress off lumbar',
        purposeIt: 'Migliorare la rotazione toracica - toglie stress dalla lombare',
        cues: [
          'All fours, one hand behind head',
          'Rotate THORACIC spine only (upper back)',
          'Keep hips and lumbar still',
          'Look up as you rotate'
        ],
        cuesIt: [
          'Quadrupedia, una mano dietro la testa',
          'Ruota SOLO la colonna toracica (parte alta della schiena)',
          'Tieni anche e lombare fermi',
          'Guarda in alto mentre ruoti'
        ],
        progressionTo: 'Open Book Stretch',
        whenToUse: 'Warm-up or mobility work'
      }
    ],
    educationalNote: 'Rotation sensitivity often means the THORACIC spine is stiff, so the lumbar has to rotate more. Improving thoracic mobility can help. Rotation is a normal movement - we\'re building your tolerance to it.',
    educationalNoteIt: 'La sensibilità alla rotazione spesso significa che la colonna TORACICA è rigida, quindi la lombare deve ruotare di più. Migliorare la mobilità toracica può aiutare. La rotazione è un movimento normale - stiamo costruendo la tua tolleranza.'
  },

  // INSTABILITY / GENERAL WEAKNESS
  general_instability: {
    movementPattern: 'general_instability',
    description: 'For those who feel unstable or weak in the lower back',
    descriptionIt: 'Per chi si sente instabile o debole nella bassa schiena',
    approach: 'strengthening',
    exercises: [
      {
        name: 'Bird Dog',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Multi-planar stability in neutral',
        purposeIt: 'Stabilità multi-planare in posizione neutra',
        cues: [
          'All fours, spine neutral',
          'Extend opposite arm and leg slowly (4 seconds)',
          'Don\'t rotate or shift weight',
          'Hold 2-3 seconds, return slowly'
        ],
        cuesIt: [
          'Quadrupedia, colonna neutra',
          'Estendi braccio e gamba opposti lentamente (4 secondi)',
          'Non ruotare o spostare il peso',
          'Tieni 2-3 secondi, ritorna lentamente'
        ],
        progressionTo: 'Bird Dog with Rotation',
        whenToUse: 'Every session as part of warm-up or core work'
      },
      {
        name: 'Glute Bridge',
        sets: '3',
        reps: '12-15',
        rest: '45s',
        purpose: 'Glute and hip strength - supports lower back',
        purposeIt: 'Forza glutei e anche - supporta la bassa schiena',
        cues: [
          'Supine, knees bent, feet flat',
          'Drive through heels, squeeze glutes at top',
          'Don\'t hyperextend lower back',
          'Pause at top, lower controlled'
        ],
        cuesIt: [
          'Supino, ginocchia piegate, piedi a terra',
          'Spingi attraverso i talloni, stringi i glutei in alto',
          'Non iperestendere la lombare',
          'Pausa in alto, scendi controllato'
        ],
        progressionTo: 'Hip Thrust',
        whenToUse: 'Glute activation or lower body work'
      },
      {
        name: 'Plank (or Modified)',
        sets: '3',
        reps: '20-45s',
        rest: '45s',
        purpose: 'Full-body tension, anti-extension',
        purposeIt: 'Tensione tutto il corpo, anti-estensione',
        cues: [
          'Forearms and toes (or knees)',
          'Body in straight line - don\'t sag or pike',
          'Squeeze glutes, brace core',
          'Breathe normally'
        ],
        cuesIt: [
          'Avambracci e punte dei piedi (o ginocchia)',
          'Corpo in linea retta - non cedere o sollevare',
          'Stringi i glutei, stabilizza il core',
          'Respira normalmente'
        ],
        alternative: 'Wall Plank',
        progressionTo: 'Long-Lever Plank, Plank Variations',
        whenToUse: 'Core portion of any workout'
      },
      {
        name: 'Suitcase Carry',
        sets: '3',
        reps: '30-40m/side',
        rest: '60s',
        purpose: 'Anti-lateral flexion under load - real-world stability',
        purposeIt: 'Anti-flessione laterale sotto carico - stabilità del mondo reale',
        cues: [
          'Hold weight in one hand',
          'Walk without leaning toward or away',
          'Keep shoulders level',
          'Core tight throughout'
        ],
        cuesIt: [
          'Tieni un peso in una mano',
          'Cammina senza inclinarti verso o via',
          'Tieni le spalle a livello',
          'Core attivo per tutto il tempo'
        ],
        alternative: 'Single-Arm Farmer Carry',
        whenToUse: 'As loaded carry at end of session'
      }
    ],
    educationalNote: 'Feeling unstable doesn\'t mean your back is weak or damaged - it often means the nervous system is being protective. Building strength and confidence through controlled exercises helps "teach" your back it\'s safe to move.',
    educationalNoteIt: 'Sentirsi instabili non significa che la schiena sia debole o danneggiata - spesso significa che il sistema nervoso è protettivo. Costruire forza e fiducia attraverso esercizi controllati aiuta a "insegnare" alla schiena che è sicuro muoversi.'
  }
};

// ============================================================================
// SHOULDER CORRECTIVES
// ============================================================================

export const SHOULDER_CORRECTIVES: Record<string, CorrectiveProtocol> = {
  
  shoulder_flexion: {
    movementPattern: 'shoulder_flexion',
    description: 'For discomfort when raising arm overhead',
    descriptionIt: 'Per fastidio alzando il braccio sopra la testa',
    approach: 'mobility',
    exercises: [
      {
        name: 'Wall Slides',
        sets: '2',
        reps: '10-12',
        rest: '30s',
        purpose: 'Improve overhead mobility with control',
        purposeIt: 'Migliorare la mobilità overhead con controllo',
        cues: [
          'Back against wall, arms in "W" position',
          'Slide arms up into "Y", keeping contact',
          'Only go as high as comfortable',
          'Squeeze shoulder blades together'
        ],
        cuesIt: [
          'Schiena contro il muro, braccia in posizione "W"',
          'Scorri le braccia in "Y", mantenendo il contatto',
          'Vai solo fin dove è confortevole',
          'Stringi le scapole insieme'
        ],
        whenToUse: 'Warm-up before pressing'
      },
      {
        name: 'Band Pull-Aparts',
        sets: '3',
        reps: '15-20',
        rest: '30s',
        purpose: 'Rear delt and rotator cuff activation',
        purposeIt: 'Attivazione deltoide posteriore e cuffia dei rotatori',
        cues: [
          'Hold band at shoulder width',
          'Pull apart until band touches chest',
          'Squeeze shoulder blades, control return',
          'Keep arms straight'
        ],
        cuesIt: [
          'Tieni l\'elastico alla larghezza delle spalle',
          'Tira fino a che l\'elastico tocca il petto',
          'Stringi le scapole, controlla il ritorno',
          'Tieni le braccia dritte'
        ],
        whenToUse: 'Warm-up and between pushing sets'
      },
      {
        name: 'Thoracic Extension on Foam Roller',
        sets: '1',
        reps: '60-90s',
        rest: '-',
        purpose: 'Improve thoracic extension - helps overhead reach',
        purposeIt: 'Migliorare l\'estensione toracica - aiuta il reach overhead',
        cues: [
          'Foam roller under upper back',
          'Support head, let upper back extend over roller',
          'Move up and down to different segments',
          'Breathe and relax into extension'
        ],
        cuesIt: [
          'Foam roller sotto la parte alta della schiena',
          'Supporta la testa, lascia la parte alta estendersi sul roller',
          'Muoviti su e giù per diversi segmenti',
          'Respira e rilassati nell\'estensione'
        ],
        whenToUse: 'Before any overhead work'
      }
    ],
    educationalNote: 'Overhead discomfort often comes from stiff thoracic spine or weak scapular muscles, not shoulder damage. Improving mobility and control usually helps significantly.',
    educationalNoteIt: 'Il fastidio overhead spesso viene da una colonna toracica rigida o muscoli scapolari deboli, non da danni alla spalla. Migliorare mobilità e controllo di solito aiuta significativamente.'
  },

  shoulder_internal_rotation: {
    movementPattern: 'shoulder_internal_rotation',
    description: 'For discomfort with internal rotation (e.g., reaching behind back)',
    descriptionIt: 'Per fastidio con rotazione interna (es. raggiungere dietro la schiena)',
    approach: 'mobility',
    exercises: [
      {
        name: 'Sleeper Stretch',
        sets: '2',
        reps: '30-45s/side',
        rest: '20s',
        purpose: 'Improve internal rotation range',
        purposeIt: 'Migliorare il range di rotazione interna',
        cues: [
          'Lie on side, bottom arm at 90°',
          'Gently push forearm toward floor',
          'Don\'t force - mild stretch only',
          'Keep shoulder blade stable'
        ],
        cuesIt: [
          'Sdraiato sul fianco, braccio inferiore a 90°',
          'Spingi dolcemente l\'avambraccio verso il pavimento',
          'Non forzare - solo stretch leggero',
          'Tieni la scapola stabile'
        ],
        whenToUse: 'After training or before bed',
        whenToAvoid: 'If causes sharp pain - use cross-body stretch instead'
      },
      {
        name: 'Cross-Body Stretch',
        sets: '2',
        reps: '30s/side',
        rest: '20s',
        purpose: 'Posterior shoulder stretch',
        purposeIt: 'Stretch spalla posteriore',
        cues: [
          'Pull arm across body at shoulder height',
          'Use other hand to gently increase stretch',
          'Feel stretch in back of shoulder',
          'Don\'t shrug'
        ],
        cuesIt: [
          'Tira il braccio attraverso il corpo all\'altezza della spalla',
          'Usa l\'altra mano per aumentare lo stretch delicatamente',
          'Senti lo stretch nella parte posteriore della spalla',
          'Non alzare le spalle'
        ],
        whenToUse: 'Any time, especially after bench/push work'
      }
    ],
    educationalNote: 'Internal rotation is important for many movements. Tightness here is common in desk workers and bench-press enthusiasts. Gentle stretching helps.',
    educationalNoteIt: 'La rotazione interna è importante per molti movimenti. La rigidità qui è comune in chi lavora alla scrivania e negli appassionati di panca. Lo stretching dolce aiuta.'
  }
};

// ============================================================================
// KNEE CORRECTIVES
// ============================================================================

export const KNEE_CORRECTIVES: Record<string, CorrectiveProtocol> = {
  
  knee_flexion: {
    movementPattern: 'knee_flexion',
    description: 'For discomfort when bending the knee deeply',
    descriptionIt: 'Per fastidio piegando profondamente il ginocchio',
    approach: 'strengthening',
    exercises: [
      {
        name: 'Terminal Knee Extensions (TKEs)',
        sets: '3',
        reps: '15-20',
        rest: '30s',
        purpose: 'VMO activation, end-range control',
        purposeIt: 'Attivazione VMO, controllo fine corsa',
        cues: [
          'Band around something behind you, around knee',
          'Slightly bent knee, straighten against resistance',
          'Squeeze quad hard at top',
          'Control the return'
        ],
        cuesIt: [
          'Elastico attorno a qualcosa dietro di te, attorno al ginocchio',
          'Ginocchio leggermente piegato, raddrizza contro resistenza',
          'Stringi forte il quadricipite in alto',
          'Controlla il ritorno'
        ],
        whenToUse: 'Warm-up and as quad activation'
      },
      {
        name: 'Box Squat (to comfortable depth)',
        sets: '3',
        reps: '10-12',
        rest: '60s',
        purpose: 'Build squat confidence within comfortable range',
        purposeIt: 'Costruire fiducia nello squat nel range confortevole',
        cues: [
          'Use box/bench at depth that feels okay',
          'Sit back, touch box lightly, stand up',
          'Over time, lower the box as tolerance improves',
          'No bouncing off box'
        ],
        cuesIt: [
          'Usa un box/panca alla profondità che va bene',
          'Siediti indietro, tocca il box leggermente, alzati',
          'Col tempo, abbassa il box mentre la tolleranza migliora',
          'Niente rimbalzo dal box'
        ],
        progressionTo: 'Full depth squat',
        whenToUse: 'As main squat variation during sensitivity period'
      },
      {
        name: 'Reverse Sled Drag',
        sets: '3',
        reps: '40-60m',
        rest: '90s',
        purpose: 'Quad loading without deep flexion',
        purposeIt: 'Carico sui quadricipiti senza flessione profonda',
        cues: [
          'Walk backward dragging sled',
          'Take small steps, stay low',
          'Quads should burn, knees should feel okay',
          'Great for knee rehab'
        ],
        cuesIt: [
          'Cammina all\'indietro trascinando la slitta',
          'Fai passi piccoli, resta basso',
          'I quadricipiti dovrebbero bruciare, le ginocchia dovrebbero stare bene',
          'Ottimo per riabilitazione ginocchio'
        ],
        alternative: 'Backward Walking (no sled)',
        whenToUse: 'As low-impact quad work'
      }
    ],
    educationalNote: 'Deep knee flexion is SAFE when the knee is healthy. Discomfort often indicates the tissue isn\'t yet adapted to that range under load. We build tolerance gradually.',
    educationalNoteIt: 'La flessione profonda del ginocchio è SICURA quando il ginocchio è sano. Il fastidio spesso indica che il tessuto non è ancora adattato a quel range sotto carico. Costruiamo la tolleranza gradualmente.'
  }
};

// ============================================================================
// HIP CORRECTIVES
// ============================================================================

export const HIP_CORRECTIVES: Record<string, CorrectiveProtocol> = {
  
  hip_flexion: {
    movementPattern: 'hip_flexion',
    description: 'For discomfort when bringing knee toward chest',
    descriptionIt: 'Per fastidio portando il ginocchio verso il petto',
    approach: 'mobility',
    exercises: [
      {
        name: '90/90 Hip Stretch',
        sets: '2',
        reps: '45-60s/side',
        rest: '20s',
        purpose: 'Improve hip internal and external rotation',
        purposeIt: 'Migliorare rotazione interna ed esterna dell\'anca',
        cues: [
          'Sit with front and back leg at 90°',
          'Keep spine tall',
          'Lean forward over front knee',
          'Feel stretch in glute'
        ],
        cuesIt: [
          'Siediti con gamba anteriore e posteriore a 90°',
          'Mantieni la colonna dritta',
          'Inclinati in avanti sul ginocchio anteriore',
          'Senti lo stretch nel gluteo'
        ],
        whenToUse: 'Warm-up or dedicated mobility work'
      },
      {
        name: 'Hip Flexor Stretch (Half-Kneeling)',
        sets: '2',
        reps: '45s/side',
        rest: '20s',
        purpose: 'Reduce hip flexor tightness that can limit ROM',
        purposeIt: 'Ridurre la tensione dei flessori dell\'anca che può limitare il ROM',
        cues: [
          'Half-kneeling position',
          'Tuck pelvis under (posterior tilt)',
          'Push hips forward while maintaining tuck',
          'Feel stretch in front of hip'
        ],
        cuesIt: [
          'Posizione mezzo inginocchiato',
          'Retroverti il bacino',
          'Spingi le anche avanti mantenendo la retroversione',
          'Senti lo stretch davanti all\'anca'
        ],
        whenToUse: 'After sitting a lot, before squats/lunges'
      }
    ],
    educationalNote: 'Hip flexion issues often relate to hip flexor tightness or hip capsule stiffness, both of which respond well to consistent mobility work.',
    educationalNoteIt: 'I problemi di flessione dell\'anca spesso sono legati a tensione dei flessori o rigidità della capsula dell\'anca, entrambi rispondono bene al lavoro di mobilità costante.'
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ALL_CORRECTIVE_PROTOCOLS = {
  lower_back: LOWER_BACK_CORRECTIVES,
  shoulder: SHOULDER_CORRECTIVES,
  knee: KNEE_CORRECTIVES,
  hip: HIP_CORRECTIVES
};

/**
 * Get correctives for a specific movement pattern
 */
export function getCorrectivesForMovement(
  bodyArea: 'lower_back' | 'shoulder' | 'knee' | 'hip',
  movementPattern: string
): CorrectiveProtocol | null {
  const areaProtocols = ALL_CORRECTIVE_PROTOCOLS[bodyArea];
  if (!areaProtocols) return null;
  
  return areaProtocols[movementPattern] || null;
}

/**
 * Get a diverse set of correctives (not just one source)
 */
export function getDiverseCorrectiveSet(
  bodyArea: 'lower_back' | 'shoulder' | 'knee' | 'hip',
  count: number = 3
): CorrectiveExercise[] {
  const areaProtocols = ALL_CORRECTIVE_PROTOCOLS[bodyArea];
  if (!areaProtocols) return [];
  
  const allExercises: CorrectiveExercise[] = [];
  Object.values(areaProtocols).forEach(protocol => {
    allExercises.push(...protocol.exercises);
  });
  
  // Return unique exercises (by name), limited to count
  const uniqueNames = new Set<string>();
  const result: CorrectiveExercise[] = [];
  
  for (const ex of allExercises) {
    if (!uniqueNames.has(ex.name) && result.length < count) {
      uniqueNames.add(ex.name);
      result.push(ex);
    }
  }
  
  return result;
}

export default {
  LOWER_BACK_CORRECTIVES,
  SHOULDER_CORRECTIVES,
  KNEE_CORRECTIVES,
  HIP_CORRECTIVES,
  ALL_CORRECTIVE_PROTOCOLS,
  getCorrectivesForMovement,
  getDiverseCorrectiveSet
};
