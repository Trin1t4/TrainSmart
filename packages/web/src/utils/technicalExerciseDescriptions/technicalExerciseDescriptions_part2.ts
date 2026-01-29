/**
 * TECHNICAL EXERCISE DESCRIPTIONS - PARTE 2
 * 
 * Horizontal Push, Horizontal Pull, Vertical Push, Vertical Pull, Core, Accessory
 * 
 * @file packages/web/src/utils/technicalExerciseDescriptions_part2.ts
 */

import type { TechnicalExerciseDescription, MuscleActivation, JointAction, PhaseDescription, CompensatoryPattern } from './technicalExerciseDescriptions';

// =============================================================================
// HORIZONTAL PUSH PATTERN (Bench Press / Push-up Variants)
// =============================================================================

export const HORIZONTAL_PUSH_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Push-up': {
    name: 'Push-up',
    nameIT: 'Piegamenti',
    pattern: 'horizontal_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Pectoralis major (sternal head)', activation: 'high', emgPercentage: '60-75% MVC' },
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '55-70% MVC' },
        { muscle: 'Triceps brachii', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Serratus anterior', 'Core (anti-extension)', 'Pectoralis minor'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Horizontal adduction/abduction', rom: '0° → ~90° adduction' },
        { joint: 'Elbow', movement: 'Flexion/Extension', rom: '0° → 90-110°' },
        { joint: 'Scapula', movement: 'Protraction/Retraction', rom: 'Completo' }
      ],
      forceVector: 'Resistenza contro gravità a circa 64% del peso corporeo (in posizione standard)',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Mani leggermente più larghe delle spalle. Dita avanti o leggermente extraruotate. Piedi uniti o leggermente separati.',
      bodyPosition: 'Corpo in LINEA RETTA da testa a talloni (plank position). Core attivo, glutei contratti. Spalle sopra o leggermente avanti alle mani.',
      breathingPattern: 'Inspira scendendo, espira spingendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Gomiti a circa 45° dal corpo (non completamente addotti né a 90°)',
        tempo: '2-3 secondi',
        endPosition: 'Petto che sfiora o quasi tocca il pavimento',
        feeling: 'Stretch pettorali e deltoidi anteriori'
      },
      concentricInitiation: 'Spingi la terra LONTANO da te, non pensare a sollevarti.',
      concentricDrive: [
        'Mantieni il corpo RIGIDO come una tavola',
        'Spingi uniformemente con entrambe le mani',
        'Protrudi le scapole al termine (serratus finish)'
      ],
      peakContraction: 'Braccia estese, scapole protratte, corpo in linea.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia: braccia lunghe = ROM maggiore',
        'Larghezza spalle: influenza posizione mani ottimale',
        'Proporzioni torso: influenza angolo del corpo'
      ],
      acceptableVariations: [
        'Mani più larghe: più pettorali',
        'Mani più strette: più tricipiti',
        'Gomiti più addotti (45°) vs più abdotti (60°): variabile individuale',
        'Su ginocchia: regressione valida per chi non riesce full push-up'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Anche che cadono (sagging)',
          cause: 'Core debole',
          threshold: 'Anche visibilmente sotto la linea spalle-talloni',
          action: 'address'
        },
        {
          pattern: 'Anche in alto (pike)',
          cause: 'Pattern errato o core che "fugge"',
          threshold: 'Anche visibilmente sopra la linea',
          action: 'address'
        },
        {
          pattern: 'Scapole alate (winging)',
          cause: 'Serratus debole',
          threshold: 'Scapole che sporgono dalla schiena',
          action: 'address'
        },
        {
          pattern: 'Head forward',
          cause: 'Pattern errato',
          threshold: 'Testa che precede il corpo',
          action: 'monitor'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'wrist', 'elbow'],
      modifications: {
        'shoulder': 'Riduci ROM (non scendere fino in basso). Gomiti più addotti (vicini al corpo). Se persiste, considera Incline Push-up.',
        'wrist': 'Usa parallele o maniglie per posizione neutra polso. Oppure pugni chiusi.',
        'elbow': 'Riduci ROM, evita lockout completo'
      }
    },
    
    coachingCues: {
      setup: [
        'Corpo RIGIDO come una tavola',
        'Mani sotto le spalle, leggermente più larghe',
        'Glutei e core ATTIVI'
      ],
      execution: [
        'Gomiti a 45°, non a T',
        'Petto tocca terra (o quasi)',
        'Spingi la TERRA lontano',
        'Protrai le scapole in alto'
      ],
      commonErrors: [
        'Anche che cadono (core non attivo)',
        'Gomiti a 90° (stress eccessivo spalla)',
        'ROM incompleto',
        'Testa che guida il movimento'
      ]
    }
  },

  'Bench Press': {
    name: 'Bench Press',
    nameIT: 'Panca Piana',
    pattern: 'horizontal_push',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Pectoralis major (sternal)', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '60-75% MVC' },
        { muscle: 'Triceps brachii', activation: 'high', emgPercentage: '65-80% MVC' }
      ],
      secondaryMuscles: ['Pectoralis major (clavicular)', 'Serratus anterior', 'Latissimus dorsi (stabilization)'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Horizontal adduction', rom: '~90° abduction → 0°' },
        { joint: 'Elbow', movement: 'Extension', rom: '90-110° → 0°' },
        { joint: 'Scapula', movement: 'Retracted and depressed (stabilized)', rom: 'Fisso' }
      ],
      forceVector: 'Verticale contro gravità. Il bilanciere si muove in linea retta.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Sdraiato sulla panca, piedi a terra (o su panca per lombare flat). Occhi sotto il bilanciere.',
      grip: 'Presa media: circa 1.5x larghezza spalle (index finger su ring del bilanciere come riferimento). Presa chiusa (pollice intorno).',
      bodyPosition: 'SCAPOLE RETRATTE e DEPRESSE ("tasca nelle tasche posteriori"). Arco toracico naturale (NON lombare). 5 punti di contatto: testa, spalle, glutei, piede dx, piede sx.',
      breathingPattern: 'Inspira a fondo prima di abbassare, trattieni durante la rep (o espira nello sticking point), respira nuovamente in alto.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Gomiti a circa 45-75° dal corpo (non completamente addotti né a 90°)',
        tempo: '2-3 secondi controllati',
        endPosition: 'Bilanciere tocca il petto (sterno/parte bassa del pettorale)',
        feeling: 'Stretch pettorali con scapole che restano "ancorate"'
      },
      concentricInitiation: 'Spingi il bilanciere VERSO IL RACK (traiettoria leggermente diagonale), non verticale pura.',
      concentricDrive: [
        'Mantieni le scapole RETRATTE per tutta la spinta',
        'Leg drive: spingi i piedi nel pavimento',
        'Bilanciere si muove in leggera diagonale verso il rack'
      ],
      peakContraction: 'Braccia estese, bilanciere sopra le spalle (non sopra il petto).',
      tempo: '2-0-1-0 standard. Paused: 2-1-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia: braccia lunghe = ROM maggiore = più difficile',
        'Larghezza spalle e cassa toracica: influenza grip width ottimale',
        'Punto di contatto petto: variabile anatomicamente'
      ],
      acceptableVariations: [
        'Grip più largo: più pettorali, ROM ridotto',
        'Grip più stretto: più tricipiti',
        'Arco più o meno pronunciato: entrambi validi (powerlifter vs bodybuilder)',
        'Piedi a terra vs su panca: preferenza personale'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Glutei che si alzano dalla panca',
          cause: 'Leg drive eccessivo o arco instabile',
          threshold: 'Qualsiasi sollevamento glutei',
          action: 'address'
        },
        {
          pattern: 'Scapole che perdono retrazione',
          cause: 'Fatica o pattern errato',
          threshold: 'Spalle che ruotano in avanti durante la spinta',
          action: 'address'
        },
        {
          pattern: 'Bilanciere che rimbalza sul petto',
          cause: 'Carico eccessivo o pattern errato',
          threshold: 'Qualsiasi rimbalzo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'wrist', 'elbow', 'lower_back'],
      modifications: {
        'shoulder': 'Riduci ROM (usa board o stop 5cm dal petto). Grip più stretto. Considera Dumbbell Press (più libertà articolare).',
        'wrist': 'Verifica che il bilanciere sia sulla base del palmo (non sulle dita). Usa polsiere.',
        'elbow': 'Grip più largo, evita lockout completo',
        'lower_back': 'Riduci arco toracico, piedi su panca per appiattire la lombare'
      }
    },
    
    coachingCues: {
      setup: [
        'Scapole IN TASCA',
        'Arco toracico, NON lombare',
        'Piedi piantati, pronti a spingere'
      ],
      execution: [
        'Abbassa il bilanciere allo sterno',
        'Gomiti a 45-75°, non a T',
        'Spingi verso il RACK, non verticale',
        'Scapole SEMPRE retratte'
      ],
      commonErrors: [
        'Scapole che si aprono durante la spinta',
        'Bilanciere che scende troppo in alto (verso la gola)',
        'Gomiti a 90° (shoulder killer)',
        'Rimbalzo sul petto'
      ]
    }
  },

  'Dips': {
    name: 'Dips',
    nameIT: 'Parallele',
    pattern: 'horizontal_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Pectoralis major (lower)', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Triceps brachii', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Rhomboids', 'Latissimus dorsi', 'Core'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Extension/Flexion + slight adduction', rom: '30° ext → 60-90° flex' },
        { joint: 'Elbow', movement: 'Flexion/Extension', rom: '0° → 90-110°' },
        { joint: 'Scapula', movement: 'Depression/Elevation', rom: 'Significativo' }
      ],
      forceVector: 'Verticale, carico = 100% BW + eventuale zavorra',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Presa sulle parallele, braccia estese, corpo sollevato.',
      grip: 'Parallele a larghezza spalle o leggermente più larghe. Presa salda.',
      bodyPosition: 'INCLINAZIONE BUSTO: avanti (15-30°) = più pettorali, verticale = più tricipiti. Gambe incrociate o dritte.',
      breathingPattern: 'Inspira scendendo, espira spingendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Controllo della discesa senza cadere',
        tempo: '2-3 secondi',
        endPosition: 'Gomiti a circa 90° O quando senti stretch eccessivo spalla (fermati prima se hai problemi)',
        feeling: 'Stretch pettorali e deltoidi anteriori'
      },
      concentricInitiation: 'Spingi le parallele LONTANO da te.',
      concentricDrive: [
        'Mantieni l\'inclinazione scelta',
        'Spingi uniformemente con entrambe le braccia',
        'Estendi completamente'
      ],
      peakContraction: 'Braccia estese, spalle depresse (non "alle orecchie").',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Larghezza spalle: determina distanza parallele ottimale',
        'Mobilità spalla: limita ROM sicuro',
        'Lunghezza braccia: influenza leve'
      ],
      acceptableVariations: [
        'Chest dips (inclinato avanti): focus pettorali',
        'Tricep dips (verticale): focus tricipiti',
        'Assisted con banda: per chi non riesce BW',
        'Weighted: per progressione avanzata'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Spalle che salgono alle orecchie',
          cause: 'Debolezza depressori scapola o fatica',
          threshold: 'Elevazione scapola visibile',
          action: 'address'
        },
        {
          pattern: 'Scendere troppo',
          cause: 'ROM eccessivo',
          threshold: 'Dolore o stretch estremo alla spalla',
          action: 'stop'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'sternum', 'elbow'],
      modifications: {
        'shoulder': 'ESERCIZIO AD ALTO RISCHIO per spalle problematiche. Riduci ROM significativamente. Se persiste, evita l\'esercizio.',
        'sternum': 'Riduci stretch in basso, non scendere così tanto',
        'elbow': 'Evita lockout completo'
      },
      contraindications: ['Instabilità spalla', 'Problemi cuffia rotatori', 'Costocondrite']
    },
    
    coachingCues: {
      setup: [
        'Braccia estese, spalle GIÙ',
        'Scegli inclinazione: avanti (petto) o verticale (tricipiti)'
      ],
      execution: [
        'Scendi CONTROLLATO',
        'Gomiti a 90°, non di più',
        'Spingi le parallele LONTANO'
      ],
      commonErrors: [
        'Scendere troppo (shoulder killer)',
        'Spalle che salgono',
        'Oscillare per momentum'
      ]
    }
  },

  'Incline Bench Press': {
    name: 'Incline Bench Press',
    nameIT: 'Panca Inclinata',
    pattern: 'horizontal_push',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Pectoralis major (clavicular head)', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Triceps brachii', activation: 'moderate', emgPercentage: '55-70% MVC' }
      ],
      secondaryMuscles: ['Pectoralis major (sternal)', 'Serratus anterior'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Flexion + horizontal adduction', rom: 'Variabile per inclinazione' },
        { joint: 'Elbow', movement: 'Extension', rom: '90-100° → 0°' }
      ],
      forceVector: 'Inclinato rispetto al corpo. Più inclinazione = più deltoidi, meno petto.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Panca inclinata a 30-45° (30° ottimale per petto alto, >45° diventa shoulder press).',
      grip: 'Simile a flat bench, forse leggermente più stretto.',
      bodyPosition: 'Scapole retratte e depresse. Arco toracico ridotto rispetto a flat.',
      breathingPattern: 'Come flat bench.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Bilanciere scende verso clavicole/parte alta del petto',
        tempo: '2-3 secondi',
        endPosition: 'Bilanciere tocca la parte alta del petto (clavicolare)',
        feeling: 'Stretch petto alto e deltoidi'
      },
      concentricInitiation: 'Spingi verso l\'alto e leggermente indietro.',
      concentricDrive: [
        'Scapole SEMPRE retratte',
        'Bilanciere sale in linea o leggermente verso il rack'
      ],
      peakContraction: 'Braccia estese, bilanciere sopra le spalle.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Inclinazione: 30° massimizza petto clavicolare, >45° diventa più spalla',
        'Stesso principio di grip width del flat bench'
      ],
      acceptableVariations: [
        '30° vs 45°: entrambi validi, diverso focus',
        'Manubri: più ROM e libertà articolare'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Scapole che si aprono',
          cause: 'Pattern errato o fatica',
          threshold: 'Perdita retrazione',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'wrist'],
      modifications: {
        'shoulder': 'Riduci inclinazione, grip più stretto, considera manubri',
        'wrist': 'Bilanciere sulla base del palmo, polsiere'
      }
    },
    
    coachingCues: {
      setup: [
        'Panca a 30-45°',
        'Scapole in tasca come flat bench'
      ],
      execution: [
        'Bilanciere tocca CLAVICOLE, non sterno',
        'Scapole SEMPRE retratte'
      ],
      commonErrors: [
        'Panca troppo inclinata (>45° = shoulder press)',
        'Bilanciere che scende troppo basso sul petto'
      ]
    }
  }
};

// =============================================================================
// HORIZONTAL PULL PATTERN (Row Variants)
// =============================================================================

export const HORIZONTAL_PULL_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Barbell Row': {
    name: 'Barbell Row',
    nameIT: 'Rematore con Bilanciere',
    pattern: 'horizontal_pull',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Latissimus dorsi', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Rhomboids', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Trapezius (middle)', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Biceps brachii', 'Rear deltoid', 'Erector spinae (isometric)', 'Core'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Extension + horizontal abduction', rom: '~90° flex → 0-30° ext' },
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 90-120°' },
        { joint: 'Scapula', movement: 'Retraction + depression', rom: 'Completo' }
      ],
      forceVector: 'Orizzontale/diagonale contro gravità',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Hip-width, ginocchia leggermente flesse. Piedi sotto il bilanciere.',
      grip: 'Presa prona, appena più larga delle spalle. Alternativa: presa supina (underhand row) per più bicipiti e lat inferiore.',
      bodyPosition: 'Busto inclinato avanti 45-70° (più parallelo = più difficile). Schiena NEUTRA. Bilanciere pende sotto le spalle.',
      breathingPattern: 'Inspira tirando, espira abbassando. Oppure inspira in basso, trattieni tirando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata senza "buttare" il bilanciere',
        tempo: '2-3 secondi',
        endPosition: 'Braccia estese, bilanciere sotto le spalle',
        feeling: 'Stretch lats e romboidi'
      },
      concentricInitiation: 'Tira i GOMITI verso l\'alto e indietro, non pensare alle mani.',
      concentricDrive: [
        'Gomiti che salgono verso il soffitto',
        'Scapole che si avvicinano',
        'Bilanciere verso l\'addome (presa prona) o parte bassa del petto (presa supina)'
      ],
      peakContraction: 'Bilanciere tocca addome/petto basso, scapole completamente retratte, gomiti alti.',
      tempo: '2-0-1-1 (con pausa in alto)'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia: determina ROM',
        'Rapporto torso/gambe: influenza angolo del busto'
      ],
      acceptableVariations: [
        'Pendlay row (partenza da terra ogni rep): più esplosivo',
        'Yates row (busto più verticale, presa supina): meno lombare',
        'Chest supported row: elimina stress lombare',
        'Seal row (panca alta): isola completamente la schiena'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Busto che si solleva (cheat row)',
          cause: 'Carico eccessivo o fatica',
          threshold: 'Uso di momentum significativo',
          action: 'monitor'
        },
        {
          pattern: 'Schiena che si arrotonda',
          cause: 'Debolezza erettori o carico eccessivo',
          threshold: 'Perdita curva lombare',
          action: 'stop'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'shoulder', 'bicep'],
      modifications: {
        'lower_back': 'Usa Chest Supported Row o Seal Row. Busto più verticale (Yates style).',
        'shoulder': 'Sperimenta presa più larga o più stretta. Cable row per traiettoria più libera.',
        'bicep': 'Presa più larga, focus su "tirare con i gomiti"'
      }
    },
    
    coachingCues: {
      setup: [
        'Busto inclinato, schiena PIATTA',
        'Ginocchia morbide',
        'Bilanciere pende sotto le spalle'
      ],
      execution: [
        'Tira i GOMITI verso il soffitto',
        'Stringi le SCAPOLE in alto',
        'Bilanciere all\'addome'
      ],
      commonErrors: [
        'Tirare con le braccia invece che con la schiena',
        'Usare troppo momentum',
        'Schiena che si arrotonda'
      ]
    }
  },

  'Inverted Row': {
    name: 'Inverted Row',
    nameIT: 'Rematore Inverso',
    pattern: 'horizontal_pull',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Latissimus dorsi', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Rhomboids', activation: 'high', emgPercentage: '60-75% MVC' },
        { muscle: 'Trapezius (middle)', activation: 'moderate', emgPercentage: '50-65% MVC' }
      ],
      secondaryMuscles: ['Biceps', 'Rear deltoid', 'Core (anti-extension)'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Extension + horizontal abduction', rom: '90° → 0°' },
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 90-110°' },
        { joint: 'Scapula', movement: 'Retraction', rom: 'Completo' }
      ],
      forceVector: 'Orizzontale (% BW dipende dall\'angolo del corpo)',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Sotto una sbarra o TRX. Presa alla larghezza spalle o leggermente più larga.',
      grip: 'Prona, supina, o neutra (TRX). Tutte valide con diverso focus.',
      bodyPosition: 'Corpo in LINEA RETTA. Più orizzontale = più difficile. Più verticale = più facile.',
      breathingPattern: 'Inspira tirando, espira scendendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata mantenendo corpo rigido',
        tempo: '2-3 secondi',
        endPosition: 'Braccia estese, corpo in linea',
        feeling: 'Stretch lats'
      },
      concentricInitiation: 'Tira i gomiti verso il pavimento.',
      concentricDrive: [
        'Gomiti che scendono',
        'Petto verso la sbarra',
        'Scapole che si stringono'
      ],
      peakContraction: 'Petto tocca o sfiora la sbarra, scapole completamente retratte.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia determina ROM',
        'Progressione tramite angolo del corpo'
      ],
      acceptableVariations: [
        'Piedi elevati (più difficile)',
        'Ginocchia piegate (più facile)',
        'TRX/anelli (instabilità aggiunta)',
        'Presa variabile per diverso focus'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Anche che cadono',
          cause: 'Core debole',
          threshold: 'Anche visibilmente sotto la linea',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'wrist'],
      modifications: {
        'shoulder': 'Varia presa, riduci ROM',
        'wrist': 'TRX per presa neutra'
      }
    },
    
    coachingCues: {
      setup: [
        'Corpo RIGIDO come una tavola',
        'Regola altezza per difficoltà desiderata'
      ],
      execution: [
        'Tira il petto alla sbarra',
        'Stringi le scapole in alto'
      ],
      commonErrors: [
        'Anche che cadono',
        'Non tirare abbastanza in alto'
      ]
    }
  },

  'Seated Cable Row': {
    name: 'Seated Cable Row',
    nameIT: 'Pulley Basso',
    pattern: 'horizontal_pull',
    equipment: 'cable',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Latissimus dorsi', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Rhomboids', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Trapezius (middle)', activation: 'moderate', emgPercentage: '55-70% MVC' }
      ],
      secondaryMuscles: ['Biceps', 'Rear deltoid', 'Erector spinae'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Extension', rom: '~90° → 0-15°' },
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 90-110°' },
        { joint: 'Scapula', movement: 'Retraction', rom: 'Completo' }
      ],
      forceVector: 'Orizzontale (cavo)',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Seduto, piedi sulle piattaforme, ginocchia leggermente flesse.',
      grip: 'Triangolo (close grip), sbarra dritta (wide), o rope. Ognuno diverso focus.',
      bodyPosition: 'Busto VERTICALE o leggermente inclinato avanti nella fase di stretch. Schiena neutra.',
      breathingPattern: 'Inspira tirando, espira rilasciando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Rilascio controllato permettendo leggero stretch',
        tempo: '2-3 secondi',
        endPosition: 'Braccia estese, leggero stretch lat (busto può inclinarsi leggermente avanti)',
        feeling: 'Stretch lats e romboidi'
      },
      concentricInitiation: 'Tira i gomiti INDIETRO, non le mani.',
      concentricDrive: [
        'Gomiti che vanno INDIETRO',
        'Busto torna verticale',
        'Scapole che si stringono',
        'Attacco verso l\'addome'
      ],
      peakContraction: 'Attacco all\'addome, scapole completamente retratte, busto verticale.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Attacco diverso = diverso focus (basso = più lat, alto = più romboidi/trap)',
        'Grip variabile per preferenza'
      ],
      acceptableVariations: [
        'Close grip: più ROM, più lat',
        'Wide grip: più romboidi',
        'Single arm: per unilateralità',
        'Rope: più contrazione di picco'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Usare momentum con il busto',
          cause: 'Carico eccessivo',
          threshold: 'Oscillazione significativa del busto',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'shoulder'],
      modifications: {
        'lower_back': 'Riduci inclinazione busto, mantieni sempre verticale',
        'shoulder': 'Sperimenta attacchi diversi'
      }
    },
    
    coachingCues: {
      setup: [
        'Seduto stabile, ginocchia morbide',
        'Scegli attacco per obiettivo'
      ],
      execution: [
        'Tira i GOMITI indietro',
        'Stringi le scapole',
        'Attacco all\'addome'
      ],
      commonErrors: [
        'Oscillare il busto per momentum',
        'Tirare con le braccia',
        'ROM incompleto'
      ]
    }
  }
};

// =============================================================================
// VERTICAL PULL PATTERN (Pull-up / Lat Pulldown Variants)
// =============================================================================

export const VERTICAL_PULL_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Pull-up': {
    name: 'Pull-up',
    nameIT: 'Trazioni',
    pattern: 'vertical_pull',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Latissimus dorsi', activation: 'high', emgPercentage: '80-95% MVC' },
        { muscle: 'Biceps brachii', activation: 'high', emgPercentage: '70-85% MVC' }
      ],
      secondaryMuscles: ['Brachialis', 'Teres major', 'Rhomboids', 'Trapezius (lower)', 'Core'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Adduction + Extension', rom: '180° → 0°' },
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 130-150°' },
        { joint: 'Scapula', movement: 'Depression + Retraction', rom: 'Significativo' }
      ],
      forceVector: 'Verticale, carico = 100% BW + eventuale zavorra',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Appeso alla sbarra, braccia completamente estese.',
      grip: 'PRONA: presa overhand, leggermente più larga delle spalle per pull-up standard. Più larga = più lat, più stretta = più bicipiti.',
      bodyPosition: 'Corpo leggermente inclinato INDIETRO (non verticale puro). Gambe incrociate o dritte.',
      breathingPattern: 'Inspira salendo, espira scendendo. O inspira in basso, trattieni salendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa CONTROLLATA, non caduta',
        tempo: '2-4 secondi',
        endPosition: 'Braccia completamente estese (dead hang)',
        feeling: 'Stretch lats al massimo'
      },
      concentricInitiation: 'Inizia DEPRIMENDO le scapole (engagement), POI tira.',
      concentricDrive: [
        'Tira i GOMITI verso le anche (non verso l\'alto)',
        'Petto verso la sbarra',
        'Scapole che si avvicinano in alto'
      ],
      peakContraction: 'Mento sopra la sbarra O petto che tocca la sbarra (variante). Scapole retratte.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia: braccia lunghe = più difficile (ROM maggiore)',
        'Rapporto forza/peso: leggeri con alta forza relativa sono avvantaggiati',
        'Mobilità spalle: influenza presa ottimale'
      ],
      acceptableVariations: [
        'Chin-up (presa supina): più bicipiti, generalmente più facile',
        'Neutral grip: compromesso tra i due',
        'Wide grip: più enfasi lat esterno',
        'Kipping: per CrossFit/volume (meno strict)',
        'Weighted: progressione avanzata'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Kipping non intenzionale',
          cause: 'Forza insufficiente',
          threshold: 'Uso di momentum per completare rep',
          action: 'monitor'
        },
        {
          pattern: 'ROM incompleto',
          cause: 'Fatica o debolezza',
          threshold: 'Mento non supera la sbarra',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'elbow', 'wrist'],
      modifications: {
        'shoulder': 'Presa neutra (meno stress). ROM ridotto (non dead hang). Lat Pulldown come alternativa.',
        'elbow': 'Chin-up (supina) può essere più confortevole per alcuni, peggiore per altri. Sperimenta.',
        'wrist': 'Presa neutra o anelli (rotazione libera)'
      }
    },
    
    coachingCues: {
      setup: [
        'Presa overhand, leggermente più larga delle spalle',
        'Dead hang completo per iniziare'
      ],
      execution: [
        'PRIMA deprimi le scapole',
        'Tira i gomiti VERSO LE ANCHE',
        'Petto verso la sbarra',
        'Mento SOPRA'
      ],
      commonErrors: [
        'Iniziare tirando senza engagement scapolare',
        'ROM incompleto (mento non passa)',
        'Cadere giù invece di scendere controllato',
        'Usare kipping non voluto'
      ]
    }
  },

  'Lat Pulldown': {
    name: 'Lat Pulldown',
    nameIT: 'Lat Machine',
    pattern: 'vertical_pull',
    equipment: 'cable',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Latissimus dorsi', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Biceps brachii', activation: 'moderate', emgPercentage: '55-70% MVC' }
      ],
      secondaryMuscles: ['Teres major', 'Rhomboids', 'Trapezius (lower)', 'Brachialis'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Adduction + Extension', rom: '150-180° → 0°' },
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 110-130°' },
        { joint: 'Scapula', movement: 'Depression + Retraction', rom: 'Completo' }
      ],
      forceVector: 'Verticale (cavo)',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Seduto, cosce sotto i cuscinetti per stabilità.',
      grip: 'Sbarra larga, presa prona, leggermente più larga delle spalle. Alternative: close grip, neutral grip, V-bar.',
      bodyPosition: 'Leggera inclinazione INDIETRO (10-15°). Petto alto.',
      breathingPattern: 'Inspira tirando, espira rilasciando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Rilascio controllato con stretch lat',
        tempo: '2-3 secondi',
        endPosition: 'Braccia estese, stretch lat completo',
        feeling: 'Stretch lat massimo'
      },
      concentricInitiation: 'Deprimi le scapole, POI tira.',
      concentricDrive: [
        'Tira la sbarra verso la parte ALTA del petto',
        'Gomiti che scendono verso le anche',
        'Stringi le scapole'
      ],
      peakContraction: 'Sbarra alla clavicola/parte alta del petto, scapole retratte e depresse.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia: influenza ROM',
        'Mobilità spalle: determina presa ottimale'
      ],
      acceptableVariations: [
        'Wide grip: più enfasi lat esterno',
        'Close grip: più ROM, più bicipiti',
        'V-bar: neutral grip',
        'Behind neck: SCONSIGLIATO per la maggior parte (stress spalla)',
        'Single arm: per unilateralità'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Inclinarsi troppo indietro',
          cause: 'Carico eccessivo',
          threshold: 'Inclinazione >30° per completare rep',
          action: 'address'
        },
        {
          pattern: 'Tirare solo con le braccia',
          cause: 'Mancato engagement scapolare',
          threshold: 'Scapole che non si muovono',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'elbow'],
      modifications: {
        'shoulder': 'Grip più stretto, evita behind neck assolutamente',
        'elbow': 'Sperimenta prese diverse'
      }
    },
    
    coachingCues: {
      setup: [
        'Cosce bloccate sotto i cuscinetti',
        'Leggera inclinazione indietro',
        'Petto alto'
      ],
      execution: [
        'PRIMA deprimi le scapole',
        'Tira alla parte ALTA del petto',
        'Stringi le scapole in basso'
      ],
      commonErrors: [
        'Behind neck (stress spalla)',
        'Tirare solo con le braccia',
        'Inclinarsi troppo indietro'
      ]
    }
  }
};

// =============================================================================
// VERTICAL PUSH PATTERN (Overhead Press Variants)
// =============================================================================

export const VERTICAL_PUSH_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Overhead Press': {
    name: 'Overhead Press',
    nameIT: 'Lento Avanti',
    pattern: 'vertical_push',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Lateral deltoid', activation: 'moderate', emgPercentage: '55-70% MVC' },
        { muscle: 'Triceps brachii', activation: 'high', emgPercentage: '65-80% MVC' }
      ],
      secondaryMuscles: ['Upper pectoralis', 'Serratus anterior', 'Trapezius (upper)', 'Core (anti-extension)'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Flexion + abduction', rom: '0° → 180°' },
        { joint: 'Elbow', movement: 'Extension', rom: '90° → 0°' },
        { joint: 'Scapula', movement: 'Upward rotation + elevation', rom: 'Significativo' }
      ],
      forceVector: 'Verticale contro gravità',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'In piedi, piedi alla larghezza anche. Ginocchia leggermente flesse per stabilità.',
      grip: 'Presa appena più larga delle spalle. Bilanciere appoggiato sui deltoidi anteriori/clavicole.',
      bodyPosition: 'Core ATTIVATO (anti-extension). Glutei contratti. Testa neutra o leggermente indietro per permettere passaggio bilanciere.',
      breathingPattern: 'Inspira in basso, trattieni spingendo (Valsalva), espira in alto.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata riportando bilanciere sui deltoidi',
        tempo: '2-3 secondi',
        endPosition: 'Bilanciere sui deltoidi/clavicole, gomiti sotto o leggermente avanti al bilanciere',
        feeling: 'Stretch deltoidi e tricipiti'
      },
      concentricInitiation: 'Spingi il bilanciere VERSO L\'ALTO E INDIETRO (per permettere alla testa di "fare spazio").',
      concentricDrive: [
        'Testa che "passa sotto" appena il bilanciere supera',
        'Bilanciere si muove in linea retta vista di lato',
        'Estendi completamente le braccia',
        'Shrug in alto (elevazione scapolare completa)'
      ],
      peakContraction: 'Braccia estese verticalmente, bilanciere sopra la nuca (non davanti alla faccia), trapezi attivi.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Mobilità spalle: limita ROM overhead',
        'Cifosi toracica: può richiedere compenso lombare (da evitare)',
        'Lunghezza braccia: influenza meccanica'
      ],
      acceptableVariations: [
        'Push press: con leg drive, per carichi maggiori',
        'Seated press: elimina leg drive, isola più le spalle',
        'Dumbbell press: più ROM e libertà articolare',
        'Z-press (seduto a terra): massimo core engagement'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Iperestensione lombare',
          cause: 'Mobilità spalle insufficiente o core debole',
          threshold: 'Arco lombare eccessivo',
          action: 'address'
        },
        {
          pattern: 'Bilanciere che va avanti',
          cause: 'Pattern errato o mobilità limitata',
          threshold: 'Bilanciere che finisce davanti alla faccia',
          action: 'address'
        },
        {
          pattern: 'Leg drive non intenzionale',
          cause: 'Carico eccessivo o fatica',
          threshold: 'Uso di ginocchia per iniziare la spinta',
          action: 'monitor'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'lower_back', 'wrist'],
      modifications: {
        'shoulder': 'Usa manubri (più libertà articolare). ROM ridotto. Landmine press come alternativa.',
        'lower_back': 'Seated press per eliminare compenso. Focus su core. Riduci carico.',
        'wrist': 'Neutral grip con manubri. Verifica posizione bilanciere sulla base del palmo.'
      }
    },
    
    coachingCues: {
      setup: [
        'Bilanciere sulle clavicole',
        'Core TIGHT, glutei TIGHT',
        'Testa leggermente indietro'
      ],
      execution: [
        'Spingi DRITTO verso l\'alto',
        'Testa "passa sotto" appena possibile',
        'Estendi COMPLETAMENTE',
        'Shrug in alto'
      ],
      commonErrors: [
        'Iperestendere la schiena',
        'Bilanciere che finisce davanti alla faccia',
        'Non estendere completamente',
        'Usare leg drive non voluto'
      ]
    }
  },

  'Pike Push-up': {
    name: 'Pike Push-up',
    nameIT: 'Pike Push-up',
    pattern: 'vertical_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Anterior deltoid', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Triceps brachii', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Lateral deltoid', 'Upper pectoralis', 'Serratus anterior', 'Core'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Flexion', rom: '90° → 180°' },
        { joint: 'Elbow', movement: 'Extension', rom: '90-110° → 0°' }
      ],
      forceVector: 'Diagonale/verticale (dipende dall\'angolo del corpo)',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Posizione pike (V invertita). Mani a larghezza spalle, piedi avvicinati alle mani quanto possibile.',
      bodyPosition: 'Anche ALTE, corpo a V. Più le anche sono in alto e i piedi vicini, più verticale è la spinta (più difficile).',
      breathingPattern: 'Inspira scendendo, espira spingendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Testa che scende TRA le mani, non davanti',
        tempo: '2-3 secondi',
        endPosition: 'Testa che sfiora o tocca il pavimento (tra le mani)',
        feeling: 'Stretch deltoidi'
      },
      concentricInitiation: 'Spingi il pavimento lontano, testa tra le mani.',
      concentricDrive: [
        'Spingi uniformemente',
        'Mantieni posizione pike',
        'Estendi completamente'
      ],
      peakContraction: 'Braccia estese, posizione pike mantenuta.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Flessibilità hamstrings: limita quanto puoi avvicinare i piedi',
        'Mobilità spalle: influenza ROM'
      ],
      acceptableVariations: [
        'Elevated pike (piedi su rialzo): più verticale, più difficile',
        'Deficit pike (mani su rialzi): più ROM',
        'Wall pike: contro il muro per supporto'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Anche che scendono',
          cause: 'Fatica o pattern errato',
          threshold: 'Perdita posizione pike',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder', 'wrist'],
      modifications: {
        'shoulder': 'Riduci ROM, versione meno verticale',
        'wrist': 'Pugni chiusi o parallele'
      }
    },
    
    coachingCues: {
      setup: [
        'Corpo a V invertita',
        'Anche ALTE',
        'Piedi vicini alle mani quanto possibile'
      ],
      execution: [
        'Testa tra le mani, non davanti',
        'Mantieni la V'
      ],
      commonErrors: [
        'Testa che va avanti (diventa push-up)',
        'Anche che scendono'
      ]
    }
  }
};

// =============================================================================
// CORE EXERCISES
// =============================================================================

export const CORE_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Plank': {
    name: 'Plank',
    nameIT: 'Plank',
    pattern: 'core',
    equipment: 'bodyweight',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Rectus abdominis', activation: 'moderate', emgPercentage: '40-60% MVC' },
        { muscle: 'Transversus abdominis', activation: 'high', emgPercentage: '50-70% MVC' },
        { muscle: 'Obliques', activation: 'moderate', emgPercentage: '35-55% MVC' }
      ],
      secondaryMuscles: ['Erector spinae', 'Gluteus maximus', 'Quadriceps', 'Serratus anterior'],
      jointActions: [
        { joint: 'Spine', movement: 'Anti-extension isometric', rom: 'Neutro mantenuto' },
        { joint: 'Pelvis', movement: 'Posterior tilt maintained', rom: 'Neutro/leggera retroversione' }
      ],
      forceVector: 'Resistenza alla gravità (anti-extension)',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Avambracci a terra, gomiti sotto le spalle. Piedi alla larghezza anche o uniti.',
      bodyPosition: 'Corpo in LINEA RETTA da testa a talloni. Glutei CONTRATTI. Leggera retroversione pelvica (appiattisci la lombare).',
      breathingPattern: 'Respiro normale ma controllato. NO trattenere il respiro per tutta la durata.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'N/A - esercizio isometrico',
        tempo: 'Tenuta statica',
        endPosition: 'Mantenimento posizione',
        feeling: 'Tensione uniforme su tutto il core'
      },
      concentricInitiation: 'Attiva pensando a "tirare i gomiti verso i piedi" (senza muoverti).',
      concentricDrive: [
        'Mantieni glutei CONTRATTI',
        'Lombare PIATTA (no arco)',
        'Respira normalmente'
      ],
      peakContraction: 'Tensione uniforme mantenuta per la durata target.',
      tempo: 'Hold time: inizia con 20-30s, progredisci a 60s+'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Proporzioni corporee influenzano difficoltà',
        'Peso corporeo = resistenza'
      ],
      acceptableVariations: [
        'Su ginocchia: regressione',
        'RKC plank: contrazione massima per tempo ridotto',
        'Long lever plank (mani avanti): più difficile',
        'Stir the pot: aggiunge instabilità'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Anche che cadono',
          cause: 'Core debole o fatica',
          threshold: 'Lordosi lombare visibile',
          action: 'stop'
        },
        {
          pattern: 'Anche in alto (pike)',
          cause: 'Pattern errato',
          threshold: 'Anche sopra la linea',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'shoulder', 'wrist'],
      modifications: {
        'lower_back': 'Enfatizza retroversione pelvica. Riduci durata. Considera Dead Bug.',
        'shoulder': 'Su ginocchia per ridurre carico',
        'wrist': 'Su avambracci invece che su mani'
      }
    },
    
    coachingCues: {
      setup: [
        'Gomiti sotto le spalle',
        'Corpo DRITTO come una tavola'
      ],
      execution: [
        'Glutei TIGHT',
        'Appiattisci la lombare',
        'RESPIRA normalmente'
      ],
      commonErrors: [
        'Anche che cadono',
        'Anche troppo in alto',
        'Trattenere il respiro'
      ]
    }
  },

  'Dead Bug': {
    name: 'Dead Bug',
    nameIT: 'Dead Bug',
    pattern: 'core',
    equipment: 'bodyweight',
    category: 'corrective',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Rectus abdominis', activation: 'moderate', emgPercentage: '45-65% MVC' },
        { muscle: 'Transversus abdominis', activation: 'high', emgPercentage: '55-75% MVC' }
      ],
      secondaryMuscles: ['Obliques', 'Hip flexors', 'Erector spinae'],
      jointActions: [
        { joint: 'Spine', movement: 'Anti-extension', rom: 'Neutro mantenuto' },
        { joint: 'Hip', movement: 'Flexion/Extension contralateral', rom: '90° → 0° (gamba che si estende)' },
        { joint: 'Shoulder', movement: 'Flexion contralateral', rom: '90° → 180°' }
      ],
      forceVector: 'Anti-extension mentre arti si muovono',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'Supino, anche e ginocchia a 90° (tabletop position). Braccia estese verso il soffitto.',
      bodyPosition: 'Lombare PIATTA a terra (NO arco). Questa posizione deve essere mantenuta per tutta l\'esecuzione.',
      breathingPattern: 'Espira mentre estendi braccio e gamba opposta. Inspira tornando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento lombare piatta mentre gli arti si muovono',
        tempo: '2-3 secondi per lato',
        endPosition: 'Braccio e gamba opposta estesi (senza toccare terra)',
        feeling: 'Core che lavora per mantenere stabilità'
      },
      concentricInitiation: 'Riporta braccio e gamba alla posizione iniziale.',
      concentricDrive: [
        'SEMPRE lombare piatta',
        'Movimento controllato',
        'Alterna i lati'
      ],
      peakContraction: 'Massima tensione quando braccio e gamba sono estesi.',
      tempo: '2-0-2-0 per lato'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza arti influenza leva e difficoltà'
      ],
      acceptableVariations: [
        'Solo gambe: regressione',
        'Solo braccia: regressione',
        'Con banda: aggiunge resistenza',
        'Con ball squeeze tra ginocchia: maggiore attivazione'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Lombare che si inarca',
          cause: 'Core insufficiente o estensione troppo bassa',
          threshold: 'Qualsiasi arco lombare',
          action: 'stop'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back'],
      modifications: {
        'lower_back': 'Questo è già un esercizio terapeutico. Se causa dolore, riduci ROM degli arti.'
      }
    },
    
    coachingCues: {
      setup: [
        'Supino, anche e ginocchia a 90°',
        'Lombare PIATTA a terra',
        'Braccia al soffitto'
      ],
      execution: [
        'Lombare sempre PIATTA',
        'Estendi braccio e gamba OPPOSTA',
        'Se la schiena si inarca, fermati'
      ],
      commonErrors: [
        'Lombare che si inarca (errore principale)',
        'Andare troppo veloce',
        'Estendere troppo in basso'
      ]
    }
  },

  'Hanging Leg Raise': {
    name: 'Hanging Leg Raise',
    nameIT: 'Alzate Gambe alla Sbarra',
    pattern: 'core',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Rectus abdominis', activation: 'high', emgPercentage: '70-90% MVC' },
        { muscle: 'Hip flexors (iliopsoas)', activation: 'high', emgPercentage: '75-90% MVC' }
      ],
      secondaryMuscles: ['Obliques', 'Quadriceps', 'Grip/forearms', 'Lats (stabilization)'],
      jointActions: [
        { joint: 'Hip', movement: 'Flexion', rom: '0° → 90-120°' },
        { joint: 'Spine', movement: 'Flexion (se range completo)', rom: '0° → 30-45°' }
      ],
      forceVector: 'Contro gravità',
      mechanicalTension: 'shortened'
    },
    
    setup: {
      stance: 'Appeso alla sbarra, braccia estese. Presa overhand.',
      bodyPosition: 'Corpo dritto, leggera retroversione pelvica. No oscillazione.',
      breathingPattern: 'Espira salendo, inspira scendendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata senza oscillare',
        tempo: '2-3 secondi',
        endPosition: 'Gambe dritte, corpo verticale',
        feeling: 'Controllo eccentrico addominali'
      },
      concentricInitiation: 'Retroversione pelvica PRIMA, poi solleva le gambe.',
      concentricDrive: [
        'Retroversione pelvica',
        'Gambe che salgono',
        'Per massima attivazione abs: porta piedi SOPRA le anche (oltre 90°)'
      ],
      peakContraction: 'Gambe a 90° o oltre, massima contrazione addominale.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Peso gambe = resistenza',
        'Forza presa può essere limitante'
      ],
      acceptableVariations: [
        'Knee raise: regressione (gambe piegate)',
        'Toes to bar: versione completa',
        'Captain\'s chair: supporto per la schiena',
        'Weighted: progressione avanzata'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Oscillazione (swinging)',
          cause: 'Momentum invece che forza',
          threshold: 'Corpo che oscilla',
          action: 'address'
        },
        {
          pattern: 'Solo flessione anca',
          cause: 'No retroversione pelvica',
          threshold: 'Bacino che non si muove',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'shoulder', 'grip'],
      modifications: {
        'lower_back': 'Versione con ginocchia piegate. Captain\'s chair per supporto.',
        'shoulder': 'Captain\'s chair. Verifica ROM overhead.',
        'grip': 'Straps. Captain\'s chair.'
      }
    },
    
    coachingCues: {
      setup: [
        'Appeso stabile, no oscillazione',
        'Core attivo da subito'
      ],
      execution: [
        'PRIMA retroversione pelvica',
        'POI solleva le gambe',
        'Controlla la discesa'
      ],
      commonErrors: [
        'Oscillare per momentum',
        'Solo flessione anca (no retroversione)',
        'Cadere giù veloce'
      ]
    }
  }
};

// =============================================================================
// ACCESSORY EXERCISES
// =============================================================================

export const ACCESSORY_EXERCISES: Record<string, TechnicalExerciseDescription> = {

  'Barbell Curl': {
    name: 'Barbell Curl',
    nameIT: 'Curl con Bilanciere',
    pattern: 'accessory',
    equipment: 'barbell',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Biceps brachii', activation: 'high', emgPercentage: '80-95% MVC' },
        { muscle: 'Brachialis', activation: 'moderate', emgPercentage: '55-70% MVC' }
      ],
      secondaryMuscles: ['Brachioradialis', 'Forearm flexors', 'Anterior deltoid (stabilization)'],
      jointActions: [
        { joint: 'Elbow', movement: 'Flexion', rom: '0° → 130-150°' }
      ],
      forceVector: 'Verticale contro gravità',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'In piedi, piedi alla larghezza anche.',
      grip: 'Presa supina, alla larghezza spalle (EZ bar per meno stress polso). Presa stretta = più capo lungo, larga = più capo corto.',
      bodyPosition: 'Gomiti ai fianchi, FISSI. Corpo stabile, no oscillazione.',
      breathingPattern: 'Espira salendo, inspira scendendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Gomiti FERMI ai fianchi durante la discesa',
        tempo: '2-3 secondi',
        endPosition: 'Braccia quasi completamente estese (leggera flessione)',
        feeling: 'Stretch bicipiti controllato'
      },
      concentricInitiation: 'Fletti i gomiti sollevando il bilanciere.',
      concentricDrive: [
        'Gomiti FISSI ai fianchi',
        'Solo avambracci che si muovono',
        'Contrai i bicipiti al massimo in alto'
      ],
      peakContraction: 'Bilanciere alle spalle, bicipiti massimamente contratti.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza avambraccio influenza leva',
        'Inserzione muscolare determina "picco" del bicipite'
      ],
      acceptableVariations: [
        'EZ bar: meno stress polso',
        'Preacher curl: elimina momentum',
        'Incline curl: più stretch',
        'Hammer curl: più brachiale e brachioradiale'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Gomiti che si spostano avanti',
          cause: 'Carico eccessivo o ricerca ROM extra',
          threshold: 'Gomiti che si muovono significativamente',
          action: 'monitor'
        },
        {
          pattern: 'Body swing (cheating)',
          cause: 'Carico eccessivo',
          threshold: 'Uso di momentum del busto',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['elbow', 'wrist', 'shoulder'],
      modifications: {
        'elbow': 'Riduci ROM, evita estensione completa. Considera varianti con presa neutra (hammer).',
        'wrist': 'EZ bar. Presa neutra (hammer curl).',
        'shoulder': 'Gomiti più indietro rispetto al corpo.'
      }
    },
    
    coachingCues: {
      setup: [
        'Gomiti ai fianchi',
        'Corpo stabile'
      ],
      execution: [
        'Gomiti FERMI',
        'Solo gli avambracci si muovono',
        'Stringi in alto'
      ],
      commonErrors: [
        'Cheating con il busto',
        'Gomiti che si muovono',
        'Scendere troppo veloce'
      ]
    }
  },

  'Tricep Pushdown': {
    name: 'Tricep Pushdown',
    nameIT: 'Pushdown ai Cavi',
    pattern: 'accessory',
    equipment: 'cable',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Triceps brachii (lateral head)', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Triceps brachii (medial head)', activation: 'high', emgPercentage: '70-85% MVC' }
      ],
      secondaryMuscles: ['Triceps (long head - meno attivo)', 'Anconeus'],
      jointActions: [
        { joint: 'Elbow', movement: 'Extension', rom: '90° → 0°' }
      ],
      forceVector: 'Verticale/diagonale (cavo)',
      mechanicalTension: 'shortened'
    },
    
    setup: {
      stance: 'In piedi davanti al cavo alto. Piedi alla larghezza anche, leggera inclinazione avanti.',
      grip: 'Barra dritta, rope, o V-bar. Ognuno leggermente diverso.',
      bodyPosition: 'Gomiti ai fianchi, FISSI. Busto leggermente inclinato avanti.',
      breathingPattern: 'Espira spingendo giù, inspira rilasciando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Rilascio controllato con gomiti fermi',
        tempo: '2-3 secondi',
        endPosition: 'Avambracci a circa 90° o leggermente oltre',
        feeling: 'Stretch controllato tricipiti'
      },
      concentricInitiation: 'Estendi i gomiti spingendo verso il basso.',
      concentricDrive: [
        'Gomiti FISSI ai fianchi',
        'Solo avambracci che si muovono',
        'Estensione COMPLETA (lockout)'
      ],
      peakContraction: 'Braccia completamente estese, tricipiti massimamente contratti.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza avambraccio influenza ROM'
      ],
      acceptableVariations: [
        'Rope: più ROM e contrazione di picco (separa le corde in basso)',
        'V-bar: grip neutro',
        'Single arm: unilaterale',
        'Overhead extension: più capo lungo'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Gomiti che si spostano',
          cause: 'Carico eccessivo',
          threshold: 'Gomiti che si muovono',
          action: 'address'
        },
        {
          pattern: 'Inclinarsi con il busto',
          cause: 'Carico eccessivo',
          threshold: 'Uso di peso corporeo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['elbow', 'wrist'],
      modifications: {
        'elbow': 'Riduci ROM, evita lockout completo. Prova rope per posizione più neutra.',
        'wrist': 'Rope per grip neutro.'
      }
    },
    
    coachingCues: {
      setup: [
        'Gomiti ai fianchi',
        'Leggera inclinazione avanti'
      ],
      execution: [
        'Gomiti FERMI',
        'Estendi COMPLETAMENTE',
        'Stringi in basso'
      ],
      commonErrors: [
        'Gomiti che si muovono',
        'Usare il peso del corpo',
        'ROM incompleto'
      ]
    }
  },

  'Lateral Raise': {
    name: 'Lateral Raise',
    nameIT: 'Alzate Laterali',
    pattern: 'accessory',
    equipment: 'dumbbell',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Lateral deltoid', activation: 'high', emgPercentage: '70-85% MVC' }
      ],
      secondaryMuscles: ['Anterior deltoid', 'Trapezius (upper)', 'Supraspinatus'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Abduction', rom: '0° → 90-110°' }
      ],
      forceVector: 'Laterale contro gravità. Momento massimo a 90°.',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'In piedi o seduto. Manubri ai lati.',
      grip: 'Presa neutra (palmi verso il corpo) o prona (pollici verso il basso - più difficile, più deltoide laterale isolato).',
      bodyPosition: 'Leggera flessione gomiti (15-30°) FISSA. Busto leggermente inclinato avanti.',
      breathingPattern: 'Espira salendo, inspira scendendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata senza "buttare" i pesi',
        tempo: '2-3 secondi',
        endPosition: 'Manubri ai lati, non a contatto con il corpo',
        feeling: 'Tensione mantenuta sui deltoidi'
      },
      concentricInitiation: 'Solleva lateralmente guidando con i GOMITI, non con le mani.',
      concentricDrive: [
        'Gomiti che salgono',
        'Mignolo "versa l\'acqua" in alto (se presa prona)',
        'Ferma a altezza spalle (~90°)'
      ],
      peakContraction: 'Braccia a circa 90° di abduzione, deltoidi laterali contratti.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza braccia = leva maggiore = più difficile a parità di peso',
        'Forma dell\'acromion: alcuni soggetti hanno più spazio subacromiale'
      ],
      acceptableVariations: [
        'Cavo: tensione costante',
        'Incline lateral raise (sdraiato su panca inclinata): stretch maggiore',
        'Machine: traiettoria guidata',
        'Con rotazione interna ("pour water"): più isolamento deltoide laterale'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Trapezio che prende over (shrugging)',
          cause: 'Peso eccessivo o pattern errato',
          threshold: 'Spalle che salgono verso le orecchie',
          action: 'address'
        },
        {
          pattern: 'Momentum (cheating)',
          cause: 'Peso eccessivo',
          threshold: 'Uso di body swing',
          action: 'address'
        },
        {
          pattern: 'Gomiti che si estendono',
          cause: 'Pattern errato',
          threshold: 'Braccia che si raddrizzano durante il movimento',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder'],
      modifications: {
        'shoulder': 'Riduci ROM (<90°). Rotazione esterna leggera (pollici in alto). Cavo per meno stress. Se impingement sospetto, evita e consulta.'
      },
      contraindications: ['Impingement attivo', 'Borsite acuta']
    },
    
    coachingCues: {
      setup: [
        'Gomiti leggermente piegati',
        'Leggera inclinazione avanti'
      ],
      execution: [
        'Guida con i GOMITI',
        'Ferma a altezza spalle',
        'Spalle GIÙ (no shrugging)'
      ],
      commonErrors: [
        'Shrugging (trapezio che domina)',
        'Usare momentum',
        'Gomiti che si estendono'
      ]
    }
  },

  'Face Pull': {
    name: 'Face Pull',
    nameIT: 'Face Pull',
    pattern: 'accessory',
    equipment: 'cable',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Rear deltoid', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Trapezius (middle)', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Rhomboids', activation: 'moderate', emgPercentage: '50-65% MVC' }
      ],
      secondaryMuscles: ['External rotators', 'Trapezius (lower)', 'Biceps'],
      jointActions: [
        { joint: 'Shoulder', movement: 'Horizontal abduction + external rotation', rom: 'Completo' },
        { joint: 'Scapula', movement: 'Retraction', rom: 'Completo' }
      ],
      forceVector: 'Orizzontale verso il viso',
      mechanicalTension: 'mid-range'
    },
    
    setup: {
      stance: 'In piedi di fronte a un cavo alto. Piedi stabili.',
      grip: 'Rope con presa neutra, mani separate.',
      bodyPosition: 'Braccia estese avanti verso il cavo. Corpo stabile.',
      breathingPattern: 'Espira tirando, inspira rilasciando.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Rilascio controllato',
        tempo: '2-3 secondi',
        endPosition: 'Braccia estese verso il cavo',
        feeling: 'Stretch deltoidi posteriori'
      },
      concentricInitiation: 'Tira verso il viso separando la corda.',
      concentricDrive: [
        'Tira verso la FRONTE, non verso il petto',
        'Ruota esternamente (pollici indietro)',
        'Scapole che si stringono',
        'Gomiti ALTI'
      ],
      peakContraction: 'Corda separata, mani ai lati della testa, rotazione esterna massima, scapole retratte.',
      tempo: '2-0-1-2 (pausa lunga in contrazione)'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Altezza del cavo regolabile per preferenza'
      ],
      acceptableVariations: [
        'Seduto: per eliminare compensi',
        'Band face pull: alternativa con elastico',
        'Prone Y raise: versione a terra'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Tirare verso il petto',
          cause: 'Pattern errato',
          threshold: 'Mani che finiscono al petto invece che al viso',
          action: 'address'
        },
        {
          pattern: 'Inclinarsi indietro',
          cause: 'Carico eccessivo',
          threshold: 'Uso di peso corporeo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['shoulder'],
      modifications: {
        'shoulder': 'Riduci ROM. Assicurati rotazione esterna corretta. Questo esercizio è generalmente shoulder-friendly.'
      }
    },
    
    coachingCues: {
      setup: [
        'Cavo alto',
        'Presa sulla rope'
      ],
      execution: [
        'Tira verso la FRONTE',
        'Gomiti ALTI',
        'Ruota i pollici INDIETRO',
        'Stringi le scapole'
      ],
      commonErrors: [
        'Tirare verso il petto',
        'Gomiti bassi',
        'Non ruotare esternamente'
      ]
    }
  },

  'Calf Raise': {
    name: 'Calf Raise',
    nameIT: 'Calf Raise',
    pattern: 'accessory',
    equipment: 'machine',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Gastrocnemius', activation: 'high', emgPercentage: '80-95% MVC' },
        { muscle: 'Soleus', activation: 'moderate', emgPercentage: '50-70% MVC' }
      ],
      secondaryMuscles: ['Tibialis posterior', 'Peronei'],
      jointActions: [
        { joint: 'Ankle', movement: 'Plantarflexion', rom: 'Dorsiflessione massima → Plantarflessione massima' }
      ],
      forceVector: 'Verticale contro gravità',
      mechanicalTension: 'shortened'
    },
    
    setup: {
      stance: 'Avampiedi sul bordo del rialzo, talloni nel vuoto. Piedi dritti, paralleli, alla larghezza anche.',
      grip: 'Se in piedi con bilanciere: barra sulle spalle. Se macchina: cuscinetti sulle spalle.',
      bodyPosition: 'Corpo dritto, ginocchia ESTESE per gastrocnemio, FLESSE per soleo.',
      breathingPattern: 'Espira salendo, inspira scendendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata fino a stretch completo',
        tempo: '2-3 secondi',
        endPosition: 'Talloni sotto il livello del rialzo (massima dorsiflessione)',
        feeling: 'Stretch completo polpacci'
      },
      concentricInitiation: 'Spingi sui metatarsi sollevando i talloni.',
      concentricDrive: [
        'Spingi fino a stare in punta di piedi',
        'Contrai i polpacci al massimo',
        'Evita di "rimbalzare"'
      ],
      peakContraction: 'Massima plantarflessione, polpacci duramente contratti. PAUSA in alto.',
      tempo: '2-1-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza tendine d\'Achille: tendine lungo = polpacci più piccoli visivamente ma potenzialmente più forti',
        'Inserzione muscolare: alta = polpaccio "corto", bassa = polpaccio "lungo"'
      ],
      acceptableVariations: [
        'Seated calf raise: più soleo (ginocchia flesse)',
        'Standing calf raise: più gastrocnemio (ginocchia estese)',
        'Single leg: per unilateralità',
        'Donkey calf raise: massimo stretch'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Rimbalzo in basso',
          cause: 'Uso di stretch reflex',
          threshold: 'Bounce visibile',
          action: 'address'
        },
        {
          pattern: 'ROM incompleto',
          cause: 'Carico eccessivo',
          threshold: 'Non raggiungere stretch o picco completo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['ankle', 'achilles'],
      modifications: {
        'ankle': 'Riduci ROM, evita dorsiflessione estrema',
        'achilles': 'Evita stretch eccessivo. ROM ridotto. Se tendinopatia, consulta.'
      },
      contraindications: ['Tendinopatia Achille acuta']
    },
    
    coachingCues: {
      setup: [
        'Avampiedi sul bordo, talloni nel vuoto',
        'Ginocchia estese (gastrocnemio) o flesse (soleo)'
      ],
      execution: [
        'Stretch COMPLETO in basso',
        'Contrazione COMPLETA in alto',
        'PAUSA in entrambe le posizioni'
      ],
      commonErrors: [
        'Rimbalzare',
        'ROM incompleto',
        'Andare troppo veloce'
      ]
    }
  }
};

// =============================================================================
// EXPORT COMBINATO
// =============================================================================

export const TECHNICAL_EXERCISES_PART2 = {
  ...HORIZONTAL_PUSH_EXERCISES,
  ...HORIZONTAL_PULL_EXERCISES,
  ...VERTICAL_PULL_EXERCISES,
  ...VERTICAL_PUSH_EXERCISES,
  ...CORE_EXERCISES,
  ...ACCESSORY_EXERCISES
};

export default TECHNICAL_EXERCISES_PART2;
