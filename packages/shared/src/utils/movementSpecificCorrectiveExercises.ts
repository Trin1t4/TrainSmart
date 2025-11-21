/**
 * Movement-Specific Corrective Exercises
 * Esercizi correttivi MIRATI basati sul movimento anatomico doloroso
 * Non "3 esercizi per la schiena", ma esercizi SPECIFICI per il pattern di dolore
 */

export interface CorrectiveExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  purpose: string; // Perché questo esercizio per questo movimento
  cues: string[];  // Cues tecnici
}

/**
 * LOWER BACK - Esercizi specifici per movimento
 */
export const LOWER_BACK_CORRECTIVES = {
  // FLEXION INTOLERANT (dolore piegandosi in avanti)
  spinal_flexion: {
    directional_preference: 'extension',
    exercises: [
      {
        name: 'McKenzie Press-ups',
        sets: '3',
        reps: '10',
        rest: '60s',
        purpose: 'Centralizza il dolore con estensione ripetuta (McKenzie Protocol)',
        cues: [
          'Prono, mani sotto le spalle',
          'Estendi le braccia mantenendo bacino a terra',
          'Rilassa i glutei, lascia la schiena iperestendere',
          'Ripeti lentamente, il dolore dovrebbe centralizzarsi'
        ]
      },
      {
        name: 'Prone Cobra',
        sets: '3',
        reps: '8',
        rest: '45s',
        purpose: 'Rinforza estensori toracici e lombari',
        cues: [
          'Prono, fronte a terra',
          'Solleva petto e braccia ruotando pollici verso l\'alto',
          'Attiva scapole e lombari',
          'Hold 3-5 secondi in cima'
        ]
      },
      {
        name: 'Bird Dog (Anti-flexion)',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Stabilità anti-flessione in posizione neutra',
        cues: [
          'Mantieni spine neutrale, NO flessione lombare',
          'Estendi braccio e gamba opposta senza ruotare bacino',
          'Focus su controllo, non su ROM'
        ]
      }
    ]
  },

  // EXTENSION INTOLERANT (dolore piegandosi indietro)
  spinal_extension: {
    directional_preference: 'flexion',
    exercises: [
      {
        name: 'Cat-Cow (Flexion Emphasis)',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Mobilità flessione + decompressione vertebrale',
        cues: [
          'Quadrupedia, colonna neutra',
          'ESPIRAZIONE: arrotonda schiena (Cat)',
          'INSPIRAZIONE: ritorna neutrale (NO estensione)',
          'Enfatizza la flessione, limita l\'estensione'
        ]
      },
      {
        name: 'Child\'s Pose',
        sets: '3',
        reps: '30s hold',
        rest: '30s',
        purpose: 'Stretch passivo in flessione, riduce compressione posteriore',
        cues: [
          'Ginocchia larghe, piedi uniti',
          'Porta glutei verso talloni',
          'Braccia estese avanti, fronte a terra',
          'Respira profondo, rilassa lombari'
        ]
      },
      {
        name: 'Dead Bug',
        sets: '3',
        reps: '10/side',
        rest: '45s',
        purpose: 'Stabilità anti-estensione',
        cues: [
          'Supino, lombare piatta a terra (NO arco!)',
          'Abbassa braccio e gamba opposta mantenendo lombare schiacciata',
          'Espirazione attiva durante il movimento'
        ]
      }
    ]
  },

  // ROTATION INTOLERANT (dolore ruotando)
  spinal_rotation_right: {
    directional_preference: 'neutral',
    exercises: [
      {
        name: 'Pallof Press (Anti-rotation)',
        sets: '3',
        reps: '10/side',
        rest: '60s',
        purpose: 'Rinforza anti-rotazione, stabilizza colonna',
        cues: [
          'In piedi laterale a banda/cavo',
          'Mani al petto, estendi braccia SENZA ruotare busto',
          'Resisti alla rotazione, mantieni spalle quadrate',
          'Controllo eccentrico al ritorno'
        ]
      },
      {
        name: 'Side Plank',
        sets: '3',
        reps: '20-30s/side',
        rest: '45s',
        purpose: 'Stabilità laterale, previene rotazione eccessiva',
        cues: [
          'Gomito sotto spalla, corpo allineato',
          'NO rotazione bacino',
          'Attiva obliqui mantenendo allineamento'
        ]
      },
      {
        name: 'Quadruped Thoracic Rotation',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Mobilità toracica CONTROLLATA, deloading lombare',
        cues: [
          'Quadrupedia, una mano dietro la testa',
          'Ruota SOLO torace, bacino resta fermo',
          'Mobilità toracica, stabilità lombare'
        ]
      }
    ]
  },

  spinal_rotation_left: {
    directional_preference: 'neutral',
    exercises: [
      // Stessi esercizi di rotation_right
      {
        name: 'Pallof Press (Anti-rotation)',
        sets: '3',
        reps: '10/side',
        rest: '60s',
        purpose: 'Rinforza anti-rotazione, stabilizza colonna',
        cues: [
          'In piedi laterale a banda/cavo',
          'Mani al petto, estendi braccia SENZA ruotare busto',
          'Resisti alla rotazione, mantieni spalle quadrate'
        ]
      },
      {
        name: 'Side Plank',
        sets: '3',
        reps: '20-30s/side',
        rest: '45s',
        purpose: 'Stabilità laterale, previene rotazione eccessiva',
        cues: [
          'Gomito sotto spalla, corpo allineato',
          'NO rotazione bacino',
          'Attiva obliqui mantenendo allineamento'
        ]
      }
    ]
  },

  // INSTABILITY PATTERN (dolore in posizioni isometriche)
  neutral_spine_isometric: {
    directional_preference: 'neutral',
    exercises: [
      {
        name: 'McGill Big 3 - Curl-Up',
        sets: '3',
        reps: '8',
        rest: '45s',
        purpose: 'Stabilità anteriore, spine sparing',
        cues: [
          'Supino, una gamba piegata, una estesa',
          'Mani sotto lombare per supporto',
          'Solleva SOLO testa/spalle, lombare resta neutra',
          'Hold 10s in cima'
        ]
      },
      {
        name: 'McGill Big 3 - Side Plank',
        sets: '3',
        reps: '3x10s hold/side',
        rest: '60s',
        purpose: 'Stabilità laterale anti-buckling',
        cues: [
          'Gomito sotto spalla',
          'Corpo rigido come tavola',
          'NO cedimento bacino'
        ]
      },
      {
        name: 'McGill Big 3 - Bird Dog',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Stabilità dinamica multiplanare',
        cues: [
          'Quadrupedia neutra',
          'Estendi lentamente (4 secondi)',
          'Hold 10s, ritorna lentamente',
          'Zero movimento lombare'
        ]
      }
    ]
  }
};

/**
 * HIP - Esercizi specifici per movimento
 */
export const HIP_CORRECTIVES = {
  // FLEXION PAIN (FAI - Femoroacetabular Impingement)
  hip_flexion: {
    exercises: [
      {
        name: '90/90 Hip Stretch',
        sets: '3',
        reps: '30s/side',
        rest: '30s',
        purpose: 'Migliora rotazione interna e riduce impingement anteriore',
        cues: [
          'Seduto, gambe a 90° davanti e dietro',
          'Mantieni schiena dritta',
          'Inclina busto in avanti mantenendo lordosi lombare',
          'Sentire stretch gluteo profondo'
        ]
      },
      {
        name: 'Hip Flexor Stretch (Modified)',
        sets: '3',
        reps: '30s/side',
        rest: '30s',
        purpose: 'Riduce tensione ileo-psoas che peggiora impingement',
        cues: [
          'Posizione affondo, ginocchio posteriore a terra',
          'Bacino in retroversione (tuck)',
          'Spingi anca avanti mantenendo tuck',
          'NO estensione lombare'
        ]
      },
      {
        name: 'Clamshells',
        sets: '3',
        reps: '15/side',
        rest: '45s',
        purpose: 'Rinforza rotatori esterni anca',
        cues: [
          'Decubito laterale, ginocchia piegate',
          'Apri ginocchio superiore come una conchiglia',
          'NO rotazione bacino',
          'Controllo lento'
        ]
      }
    ]
  },

  // ADDUCTION/INTERNAL ROTATION PAIN
  hip_internal_rotation: {
    exercises: [
      {
        name: 'Pigeon Stretch (Modified)',
        sets: '3',
        reps: '45s/side',
        rest: '30s',
        purpose: 'Migliora rotazione esterna anca',
        cues: [
          'Gamba davanti piegata, gamba dietro estesa',
          'Mantieni bacino quadrato',
          'Abbassa busto lentamente se possibile',
          'Respira e rilassa glutei'
        ]
      },
      {
        name: 'Banded Hip Distraction',
        sets: '3',
        reps: '10 oscillations/side',
        rest: '45s',
        purpose: 'Decompressione articolare + mobilità capsulare',
        cues: [
          'Banda intorno anca, ancorata posteriore',
          'Quadrupedia, anca in trazione',
          'Oscillazioni circolari lente',
          'Sentire decompressione articolare'
        ]
      }
    ]
  }
};

/**
 * KNEE - Esercizi specifici per movimento
 */
export const KNEE_CORRECTIVES = {
  // PATELLOFEMORAL PAIN
  patellofemoral_compression: {
    exercises: [
      {
        name: 'Spanish Squat',
        sets: '3',
        reps: '3x30s hold',
        rest: '60s',
        purpose: 'Riduce compressione patello-femorale del 30-40%',
        cues: [
          'Banda dietro ginocchia, ancorata posteriore',
          'Squat contro banda (banda tira tibia indietro)',
          'Riduce shear stress su rotula',
          'Hold isometrico in posizione confortevole'
        ]
      },
      {
        name: 'Terminal Knee Extension',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Isola VMO (vasto mediale obliquo), stabilizza rotula',
        cues: [
          'In piedi, banda dietro ginocchio',
          'Estendi completamente ginocchio (ultimi 20°)',
          'Squeeze quadricipite in cima',
          'Controllo eccentrico'
        ]
      },
      {
        name: 'Clamshells + Lateral Band Walks',
        sets: '3',
        reps: '15 + 10 passi/direzione',
        rest: '60s',
        purpose: 'Rinforza abduttori anca, previene valgus dinamico',
        cues: [
          'Clamshells per attivazione',
          'Poi band walks laterali',
          'Mantieni ginocchia allineate con punte piedi',
          'NO collasso interno ginocchio'
        ]
      }
    ]
  },

  // GENERAL KNEE FLEXION PAIN
  knee_flexion: {
    exercises: [
      {
        name: 'Knee Flexion Mobilization',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Migliora ROM flessione riducendo dolore',
        cues: [
          'Seduto, piede su superficie scorrevole',
          'Tira ginocchio verso petto lentamente',
          'Oscillazioni controllate',
          'Non forzare oltre il dolore'
        ]
      },
      {
        name: 'Wall Sit Isometric',
        sets: '3',
        reps: '20-30s',
        rest: '60s',
        purpose: 'Rinforza in range confortevole, nessun movimento',
        cues: [
          'Schiena al muro, ginocchia a 60-90° (range confortevole)',
          'Hold isometrico',
          'Distribuisci peso uniformemente'
        ]
      }
    ]
  }
};

/**
 * SHOULDER - Esercizi specifici per movimento
 */
export const SHOULDER_CORRECTIVES = {
  // IMPINGEMENT (dolore elevazione)
  shoulder_flexion: {
    exercises: [
      {
        name: 'Face Pulls',
        sets: '3',
        reps: '15-20',
        rest: '45s',
        purpose: 'Rinforza rotatori esterni + retrazione scapolare',
        cues: [
          'Cavo/banda altezza viso',
          'Tira verso viso aprendo gomiti',
          'Rotazione esterna in cima',
          'Squeeze scapole insieme'
        ]
      },
      {
        name: 'Wall Slides',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Mobilità overhead con controllo scapolare',
        cues: [
          'Schiena al muro, braccia a "W"',
          'Scorri braccia verso alto mantenendo contatto muro',
          'NO arco lombare',
          'Sentire attivazione trapezio basso'
        ]
      },
      {
        name: 'YTW Raises',
        sets: '3',
        reps: '8 each position',
        rest: '60s',
        purpose: 'Rinforza stabilizzatori scapola in pattern funzionali',
        cues: [
          'Prono o inclinato, braccia leggere/corpo libero',
          'Y: braccia a 45° overhead',
          'T: braccia a 90° laterali',
          'W: gomiti piegati, retrazione scapolare'
        ]
      }
    ]
  },

  // ROTATOR CUFF PAIN
  shoulder_external_rotation: {
    exercises: [
      {
        name: 'External Rotation (Side-lying)',
        sets: '3',
        reps: '12/side',
        rest: '45s',
        purpose: 'Isolamento rotatori esterni della cuffia',
        cues: [
          'Decubito laterale, gomito a 90° contro fianco',
          'Ruota braccio verso alto',
          'Peso leggero (2-5kg max)',
          'Controllo lento'
        ]
      },
      {
        name: 'Scapular Push-ups',
        sets: '3',
        reps: '12',
        rest: '45s',
        purpose: 'Attiva e rinforza serratus anterior',
        cues: [
          'Push-up position o wall push-up',
          'NO flessione gomiti',
          'Protrarre scapole (push away dal suolo)',
          'Ritrarre scapole (pinch together)'
        ]
      }
    ]
  }
};

/**
 * NECK/CERVICAL SPINE - Esercizi specifici per movimento
 */
export const NECK_CORRECTIVES = {
  // FLEXION PAIN (chin to chest)
  cervical_flexion: {
    exercises: [
      {
        name: 'Chin Tucks',
        sets: '3',
        reps: '10',
        rest: '30s',
        purpose: 'Rinforza flessori cervicali profondi, migliora postura Forward Head',
        cues: [
          'Seduto o supino, sguardo dritto',
          'Retrai mento come fare doppio mento (NO tilt)',
          'Hold 5 secondi',
          'Sentire allungamento base cranio'
        ]
      },
      {
        name: 'Prone Neck Extension',
        sets: '3',
        reps: '8',
        rest: '45s',
        purpose: 'Rinforza estensori cervicali',
        cues: [
          'Prono, fronte su bordo letto/tavolo',
          'Solleva testa in estensione (sguardo avanti)',
          'NO iperestensione, ROM controllato',
          'Hold 3 secondi in cima'
        ]
      }
    ]
  },

  // EXTENSION PAIN (looking up)
  cervical_extension: {
    exercises: [
      {
        name: 'Cervical Flexion Stretch',
        sets: '3',
        reps: '30s hold',
        rest: '30s',
        purpose: 'Stretch posteriore collo, riduce tensione estensori',
        cues: [
          'Seduto, porta mento verso petto',
          'Mani dietro testa per gentle overpressure',
          'Sentire stretch base collo/upper back'
        ]
      },
      {
        name: 'Deep Neck Flexor Strengthening',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Contrasta weak deep flexors che causano extension pain',
        cues: [
          'Supino, chin tuck',
          'Solleva testa 2-3cm da superficie',
          'Mantieni chin tucked',
          'Hold 5-10 secondi'
        ]
      }
    ]
  },

  // ROTATION PAIN
  cervical_rotation_right: {
    exercises: [
      {
        name: 'Cervical Rotation Stretch',
        sets: '3',
        reps: '30s/side',
        rest: '30s',
        purpose: 'Migliora ROM rotazione',
        cues: [
          'Seduto, ruota testa verso lato non doloroso',
          'Mano sulla testa per gentle overpressure',
          'NO forzare dolore'
        ]
      },
      {
        name: 'Isometric Rotation Holds',
        sets: '3',
        reps: '6/side',
        rest: '45s',
        purpose: 'Rinforza rotatori in posizione neutra',
        cues: [
          'Mano contro tempia',
          'Premi testa contro mano (NO movimento)',
          'Hold 5 secondi',
          'Entrambi i lati'
        ]
      }
    ]
  },

  cervical_rotation_left: {
    exercises: [
      {
        name: 'Cervical Rotation Stretch',
        sets: '3',
        reps: '30s/side',
        rest: '30s',
        purpose: 'Migliora ROM rotazione',
        cues: [
          'Seduto, ruota testa verso lato non doloroso',
          'Gentle overpressure con mano'
        ]
      }
    ]
  },

  // NERVE COMPRESSION (Spurling's positive)
  cervical_compression: {
    exercises: [
      {
        name: 'Cervical Traction (Self)',
        sets: '3',
        reps: '30s hold',
        rest: '60s',
        purpose: 'Decomprime radici nervose',
        cues: [
          'Supino, asciugamano sotto base cranio',
          'Tira asciugamano verso alto (traction)',
          'Sentire decompressione collo'
        ]
      },
      {
        name: 'Nerve Glide - Median',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Mobilizza nervo mediano se sintomi braccio',
        cues: [
          'Braccio fuori lato, palmo up',
          'Estendi polso, fletti collo lato opposto',
          'Alterna wrist flex/extend con neck side bend'
        ]
      }
    ]
  }
};

/**
 * ELBOW - Esercizi specifici per movimento
 */
export const ELBOW_CORRECTIVES = {
  // TENNIS ELBOW (lateral epicondylitis)
  wrist_extension: {
    exercises: [
      {
        name: 'Eccentric Wrist Extension',
        sets: '3',
        reps: '15',
        rest: '60s',
        purpose: 'Gold standard per lateral epicondylitis (Tyler Twist)',
        cues: [
          'Peso leggero in mano (1-2kg)',
          'Gomito esteso, wrist extension',
          'LENTA eccentrica (3-5 sec) verso flexion',
          'Solleva con altra mano, ripeti'
        ]
      },
      {
        name: 'Forearm Extensor Stretch',
        sets: '3',
        reps: '30s',
        rest: '30s',
        purpose: 'Riduce tensione extensors',
        cues: [
          'Braccio esteso davanti, palmo down',
          'Altra mano flette polso verso basso',
          'Sentire stretch avambraccio esterno'
        ]
      },
      {
        name: 'Wrist Radial Deviation with Theraband',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Rinforza ECRL/ECRB (specifici per tennis elbow)',
        cues: [
          'Theraband sotto piede',
          'Pollice verso alto, devia polso verso lato radiale',
          'Focus su controllo'
        ]
      }
    ]
  },

  // GOLFER'S ELBOW (medial epicondylitis)
  wrist_flexion: {
    exercises: [
      {
        name: 'Eccentric Wrist Flexion',
        sets: '3',
        reps: '15',
        rest: '60s',
        purpose: 'Gold standard per medial epicondylitis',
        cues: [
          'Peso leggero, palmo up',
          'Gomito esteso, wrist flexion',
          'LENTA eccentrica verso extension',
          'Usa altra mano per assist concentrico'
        ]
      },
      {
        name: 'Forearm Flexor Stretch',
        sets: '3',
        reps: '30s',
        rest: '30s',
        purpose: 'Riduce tensione flexors',
        cues: [
          'Braccio esteso, palmo up',
          'Altra mano estende polso indietro',
          'Sentire stretch avambraccio interno'
        ]
      }
    ]
  },

  // GENERAL ELBOW ROM
  elbow_flexion: {
    exercises: [
      {
        name: 'Elbow Flexion Mobilization',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Migliora ROM flessione',
        cues: [
          'Fletti gomito attivamente',
          'Gentle overpressure con altra mano in cima',
          'Hold 5 secondi',
          'Non forzare oltre dolore'
        ]
      }
    ]
  },

  elbow_extension: {
    exercises: [
      {
        name: 'Elbow Extension Stretch',
        sets: '3',
        reps: '30s',
        rest: '30s',
        purpose: 'Migliora ROM estensione',
        cues: [
          'Braccio esteso su tavolo',
          'Peso leggero in mano per gravity assist',
          'Lascia gomito estendere passivamente'
        ]
      }
    ]
  }
};

/**
 * WRIST - Esercizi specifici per movimento
 */
export const WRIST_CORRECTIVES = {
  wrist_flexion: {
    exercises: [
      {
        name: 'Median Nerve Glide',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Se Phalen\'s positivo (carpal tunnel)',
        cues: [
          'Braccio esteso lato, palmo up',
          'Alterna wrist flex/extend con neck side bend opposto',
          'Mobilizza nervo mediano'
        ]
      },
      {
        name: 'Wrist Flexor Strengthening',
        sets: '3',
        reps: '12',
        rest: '45s',
        purpose: 'Rinforza flexors se weak',
        cues: [
          'Avambraccio su tavolo, palmo up',
          'Peso leggero in mano',
          'Flexion polso (palm curl)',
          'Controllo eccentrico'
        ]
      }
    ]
  },

  wrist_extension: {
    exercises: [
      {
        name: 'Wrist Extension Stretch',
        sets: '3',
        reps: '30s',
        rest: '30s',
        purpose: 'Stretch extensors',
        cues: [
          'Braccio esteso, palmo down',
          'Altra mano flette polso',
          'Sentire stretch top avambraccio'
        ]
      },
      {
        name: 'Wrist Extension Strengthening',
        sets: '3',
        reps: '12',
        rest: '45s',
        purpose: 'Rinforza extensors',
        cues: [
          'Avambraccio su tavolo, palmo down',
          'Peso leggero',
          'Extend polso contro gravità'
        ]
      }
    ]
  },

  wrist_deviation: {
    exercises: [
      {
        name: 'Radial/Ulnar Deviation Mobilization',
        sets: '3',
        reps: '10 each direction',
        rest: '45s',
        purpose: 'Migliora ROM deviazione',
        cues: [
          'Avambraccio su tavolo, polso al bordo',
          'Move hand side to side (radial/ulnar)',
          'ROM completo senza dolore'
        ]
      }
    ]
  }
};

/**
 * SCAPULA - Esercizi specifici per movimento
 */
export const SCAPULA_CORRECTIVES = {
  scapular_protraction: {
    exercises: [
      {
        name: 'Scapular Push-ups',
        sets: '3',
        reps: '12',
        rest: '45s',
        purpose: 'Rinforza serratus anterior (previene winging)',
        cues: [
          'Plank o push-up position',
          'NO flessione gomiti',
          'Protrarre scapole (push away)',
          'Ritrarre (pinch together)',
          'Focus su scapular movement'
        ]
      },
      {
        name: 'Wall Slides with Protraction',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Insegna scapular upward rotation corretta',
        cues: [
          'Schiena al muro, braccia a W',
          'Slide up mantenendo scapole contro muro',
          'Protrarre scapole in cima'
        ]
      }
    ]
  },

  scapular_retraction: {
    exercises: [
      {
        name: 'Prone Y Raises',
        sets: '3',
        reps: '12',
        rest: '45s',
        purpose: 'Rinforza lower trap e romboidi',
        cues: [
          'Prono su bench inclinato o terra',
          'Braccia a 45° (Y shape)',
          'Solleva braccia retracting scapole',
          'Hold 2 secondi in cima'
        ]
      },
      {
        name: 'Band Pull-Aparts',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Rinforza retractors',
        cues: [
          'Banda davanti a livello spalle',
          'Tira banda aprendo braccia (retract scapole)',
          'Squeeze scapole insieme'
        ]
      }
    ]
  },

  shoulder_abduction: {
    exercises: [
      {
        name: 'Scapular CARs (Controlled Articular Rotations)',
        sets: '2',
        reps: '5 circles/direction',
        rest: '60s',
        purpose: 'Migliora coordinazione scapulo-omerale',
        cues: [
          'In piedi, braccia rilassate',
          'Muovi scapole in cerchi lenti',
          'Up -> Out -> Down -> Together',
          'Controllo massimo'
        ]
      }
    ]
  }
};

/**
 * THORACIC SPINE - Esercizi specifici per movimento
 */
export const THORACIC_SPINE_CORRECTIVES = {
  thoracic_rotation_right: {
    exercises: [
      {
        name: 'Quadruped Thoracic Rotation',
        sets: '3',
        reps: '10/side',
        rest: '45s',
        purpose: 'Migliora rotazione toracica isolata',
        cues: [
          'Quadrupedia, mano dietro testa',
          'Ruota thoracic spine (NO lumbar)',
          'Gomito al cielo, poi a terra',
          'Bacino resta fermo'
        ]
      },
      {
        name: 'Open Book Stretch',
        sets: '3',
        reps: '8/side',
        rest: '45s',
        purpose: 'Mobilità rotazione + apertura torace',
        cues: [
          'Decubito laterale, ginocchia piegate',
          'Top arm ruota aprendo come libro',
          'Segui mano con sguardo',
          'Sentire stretch torace/thoracic'
        ]
      }
    ]
  },

  thoracic_rotation_left: {
    exercises: [
      {
        name: 'Quadruped Thoracic Rotation',
        sets: '3',
        reps: '10/side',
        rest: '45s',
        purpose: 'Migliora rotazione toracica',
        cues: ['Stesso esercizio lato opposto']
      }
    ]
  },

  thoracic_extension: {
    exercises: [
      {
        name: 'Foam Roll Thoracic Extension',
        sets: '3',
        reps: '8',
        rest: '45s',
        purpose: 'Mobilità estensione toracica (kyphosis correction)',
        cues: [
          'Supino, foam roller sotto mid-back',
          'Mani dietro testa, extend over roller',
          'Focus su thoracic extension, NO lumbar',
          'Breathe in extension'
        ]
      },
      {
        name: 'Prone Cobra',
        sets: '3',
        reps: '10',
        rest: '45s',
        purpose: 'Rinforza estensori toracici',
        cues: [
          'Prono, fronte a terra',
          'Solleva petto, braccia a Y',
          'Squeeze scapole',
          'Hold 3 secondi'
        ]
      }
    ]
  },

  thoracic_flexion: {
    exercises: [
      {
        name: 'Cat Stretch (Thoracic Focus)',
        sets: '3',
        reps: '10',
        rest: '30s',
        purpose: 'Mobilità flessione toracica',
        cues: [
          'Quadrupedia',
          'Round UPPER back (cat)',
          'Exhale e fletti thoracic',
          'Lumbar resta neutra'
        ]
      }
    ]
  }
};

/**
 * ANKLE - Esercizi specifici per movimento
 */
export const ANKLE_CORRECTIVES = {
  ankle_dorsiflexion: {
    exercises: [
      {
        name: 'Wall Ankle Mobilization',
        sets: '3',
        reps: '10/side',
        rest: '45s',
        purpose: 'Gold standard per migliorare dorsiflexion ROM',
        cues: [
          'Lunge position di fronte a muro',
          'Knee forward over toes verso muro',
          'Heel MUST stay down',
          'Hold stretch 2 secondi, ripeti'
        ]
      },
      {
        name: 'Ankle Dorsiflexion with Band',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Mobilizza joint capsule anteriore',
        cues: [
          'Banda intorno ankle, ancorata dietro',
          'Lunge position, banda tira ankle indietro',
          'Knee forward mantenendo heel down',
          'Decompressione + mobilità'
        ]
      },
      {
        name: 'Tibialis Anterior Strengthening',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Rinforza dorsiflexors',
        cues: [
          'Seduto, banda intorno piede',
          'Dorsiflex ankle contro resistenza',
          'Pull toes toward shin'
        ]
      }
    ]
  },

  ankle_plantarflexion: {
    exercises: [
      {
        name: 'Calf Stretch (Gastrocnemius)',
        sets: '3',
        reps: '30s/side',
        rest: '30s',
        purpose: 'Stretch calf se limited plantarflexion',
        cues: [
          'Lunge position, back leg straight',
          'Heel down, lean forward',
          'Sentire stretch calf superiore'
        ]
      },
      {
        name: 'Calf Raises',
        sets: '3',
        reps: '15',
        rest: '45s',
        purpose: 'Rinforza plantarflexors',
        cues: [
          'In piedi, solleva su punte',
          'Full ROM alto e basso',
          'Controllo eccentrico'
        ]
      }
    ]
  },

  ankle_stability: {
    exercises: [
      {
        name: 'Single Leg Balance Progression',
        sets: '3',
        reps: '30s/side',
        rest: '45s',
        purpose: 'Migliora propriocezione e stability dopo sprain',
        cues: [
          'Stand on one leg',
          'Progress: eyes closed, unstable surface, perturbations',
          'Maintain ankle alignment'
        ]
      },
      {
        name: 'Ankle Alphabets',
        sets: '2',
        reps: 'A-Z',
        rest: '60s',
        purpose: 'Mobilità multi-planare + propriocezione',
        cues: [
          'Seduto, gamba sollevata',
          'Disegna alfabeto con piede',
          'Full ROM tutti i piani'
        ]
      },
      {
        name: 'Lateral Band Walks',
        sets: '3',
        reps: '10 passi/direzione',
        rest: '45s',
        purpose: 'Rinforza evertors/invertors + hip abductors',
        cues: [
          'Banda intorno caviglie',
          'Passi laterali mantenendo tensione',
          'Controllo ankle position'
        ]
      }
    ]
  },

  ankle_ligament_integrity: {
    exercises: [
      {
        name: 'Controlled Inversion/Eversion',
        sets: '3',
        reps: '15 each direction',
        rest: '45s',
        purpose: 'Rinforza stabilizzatori dopo sprain',
        cues: [
          'Seduto, piede su towel scorrevole',
          'Inverti ankle (sole inward)',
          'Everti ankle (sole outward)',
          'Controllo massimo, NO compensazioni'
        ]
      },
      {
        name: 'Bosu Ball Balance',
        sets: '3',
        reps: '30s',
        rest: '60s',
        purpose: 'Riabilita propriocezione post-sprain',
        cues: [
          'Stand su bosu (flat side down)',
          'Maintain balance senza rolling',
          'Progress to single leg'
        ]
      }
    ]
  }
};

/**
 * Funzione helper per ottenere esercizi correttivi basati su movimento specifico
 */
export function getMovementSpecificCorrectiveExercises(
  painArea: string,
  painfulMovement: string
): CorrectiveExercise[] {
  const areaCorrectivesMap: Record<string, any> = {
    lower_back: LOWER_BACK_CORRECTIVES,
    lumbar_spine: LOWER_BACK_CORRECTIVES, // Alias
    hip: HIP_CORRECTIVES,
    knee: KNEE_CORRECTIVES,
    shoulder: SHOULDER_CORRECTIVES,
    neck: NECK_CORRECTIVES,
    cervical_spine: NECK_CORRECTIVES, // Alias
    elbow: ELBOW_CORRECTIVES,
    wrist: WRIST_CORRECTIVES,
    scapula: SCAPULA_CORRECTIVES,
    thoracic_spine: THORACIC_SPINE_CORRECTIVES,
    ankle: ANKLE_CORRECTIVES
  };

  const areaCorrectives = areaCorrectivesMap[painArea];
  if (!areaCorrectives) return [];

  const movementCorrectives = areaCorrectives[painfulMovement];
  if (!movementCorrectives) return [];

  return movementCorrectives.exercises || [];
}
