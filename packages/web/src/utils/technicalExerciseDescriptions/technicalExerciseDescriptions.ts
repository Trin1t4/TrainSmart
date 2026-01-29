/**
 * TECHNICAL EXERCISE DESCRIPTIONS - DCSS PARADIGM
 * 
 * Tassonomia biomeccanica completa per ogni esercizio.
 * Basato sui principi DCSS di Paolo Evangelista:
 * - La tecnica ottimale varia per proporzioni individuali
 * - Non esistono posizioni "sbagliate" universali
 * - Focus sul controllo del movimento, non su posizioni statiche
 * - I tessuti si adattano ai carichi progressivi
 * 
 * FONTI SCIENTIFICHE:
 * - Dati EMG: Contreras et al., Schoenfeld et al., Escamilla et al.
 * - Biomeccanica: McGill (spine), Schoenfeld (hypertrophy), Evangelista (DCSS)
 * - Joint angles: NSCA guidelines, peer-reviewed kinematic studies
 * 
 * @file packages/web/src/utils/technicalExerciseDescriptions.ts
 * @author TrainSmart Team
 * @version 2.0.0
 */

import type { PatternId } from '../../types/program.types';

// =============================================================================
// TYPES
// =============================================================================

export interface TechnicalExerciseDescription {
  // IDENTIFICAZIONE
  name: string;
  nameIT: string;
  pattern: PatternId | 'core' | 'accessory' | 'corrective';
  equipment: 'bodyweight' | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'band';
  category: 'compound' | 'isolation' | 'corrective';
  
  // BIOMECCANICA
  biomechanics: {
    primaryMuscles: MuscleActivation[];
    secondaryMuscles: string[];
    jointActions: JointAction[];
    forceVector: string;
    mechanicalTension: 'lengthened' | 'shortened' | 'mid-range';
  };
  
  // SETUP TECNICO
  setup: {
    stance: string;
    grip?: string;
    bodyPosition: string;
    breathingPattern: string;
  };
  
  // ESECUZIONE
  execution: {
    eccentric: PhaseDescription;
    concentricInitiation: string;
    concentricDrive: string[];
    peakContraction: string;
    tempo: string;
  };
  
  // VARIABILITÀ DCSS
  dcssVariability: {
    anthropometricFactors: string[];
    acceptableVariations: string[];
    compensatoryPatterns: CompensatoryPattern[];
  };
  
  // INTEGRAZIONE PAIN DETECT
  painDetectIntegration: {
    affectedAreas: string[];
    modifications: Record<string, string>;
    contraindications?: string[];
  };
  
  // CUE COACHING
  coachingCues: {
    setup: string[];
    execution: string[];
    commonErrors: string[];
  };
}

export interface MuscleActivation {
  muscle: string;
  activation: 'high' | 'moderate' | 'low';
  emgPercentage?: string; // es: "70-85% MVC"
}

export interface JointAction {
  joint: string;
  movement: string;
  rom: string; // Range in gradi
}

export interface PhaseDescription {
  controlPoint: string;
  tempo: string;
  endPosition: string;
  feeling: string;
}

export interface CompensatoryPattern {
  pattern: string;
  cause: string;
  threshold: string;
  action: 'monitor' | 'address' | 'stop';
}

// =============================================================================
// LOWER PUSH PATTERN (Squat Variants)
// =============================================================================

export const LOWER_PUSH_EXERCISES: Record<string, TechnicalExerciseDescription> = {
  
  'Bodyweight Squat': {
    name: 'Bodyweight Squat',
    nameIT: 'Squat a Corpo Libero',
    pattern: 'lower_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps (vastus lateralis)', activation: 'high', emgPercentage: '60-75% MVC' },
        { muscle: 'Quadriceps (vastus medialis)', activation: 'high', emgPercentage: '55-70% MVC' },
        { muscle: 'Gluteus maximus', activation: 'moderate', emgPercentage: '40-60% MVC' }
      ],
      secondaryMuscles: ['Hamstrings', 'Adductor magnus', 'Erector spinae', 'Rectus abdominis', 'Obliques'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 90-140° (variabile)' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 80-120° (variabile)' },
        { joint: 'Ankle', movement: 'Dorsiflexion', rom: '0° → 15-35° (variabile)' }
      ],
      forceVector: 'Verticale attraverso il centro di massa',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Larghezza variabile: da hip-width a 150% shoulder-width. Punte 15-45° in fuori in base a mobilità anca e struttura acetabolare.',
      bodyPosition: 'Peso distribuito su tutto il piede (tripode: tallone, 1° e 5° metatarso). Centro di massa sopra base d\'appoggio.',
      breathingPattern: 'INSPIRA in discesa (riempimento addominale 360°), TRATTIENI in buca, ESPIRA dopo lo sticking point o a movimento completato.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Transizione a 90° di flessione ginocchio - qui il momento articolare è massimo',
        tempo: '2-3 secondi controllati',
        endPosition: 'Profondità individuale: almeno parallelo (piega anca in linea con ginocchio), idealmente sotto se mobilità lo permette senza compensi',
        feeling: 'Stiramento controllato di quadricipiti e glutei, tensione addominale mantenuta'
      },
      concentricInitiation: 'Spinta attraverso TUTTO il piede simultaneamente, non solo talloni. Immagina di "spingere il pavimento lontano".',
      concentricDrive: [
        'Ginocchia tracking nella direzione delle punte (non collassano medialmente)',
        'Anche e spalle si sollevano alla STESSA velocità (evita il "squat morning")',
        'Mantieni pressione intra-addominale fino al completamento'
      ],
      peakContraction: 'Estensione completa di ginocchia e anche. Glutei contratti in lockout senza iperestensione lombare.',
      tempo: 'Standard: 2-0-1-0 (2s eccentrica, 0 pausa, 1s concentrica, 0 pausa in alto)'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Rapporto femore/tibia: femori lunghi relativamente al torso → maggiore inclinazione busto (fino a 60-70°) - NORMALE',
        'Struttura acetabolare: variabilità 20-40° nella rotazione femorale ottimale - determina stance ideale',
        'Dorsiflexione caviglia: limita profondità se <15° - usare rialzo talloni o stance più largo'
      ],
      acceptableVariations: [
        'Inclinazione busto: 30-70° dal verticale - dipende da proporzioni, NON è un errore',
        'Stance: da 100% a 150% larghezza spalle - sperimenta per trovare il tuo',
        'Ginocchia oltre le punte: FISIOLOGICO se talloni restano a terra e non c\'è dolore',
        'Piedi paralleli vs extraruotati: entrambi validi, dipende da mobilità anca'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Butt wink (retroversione pelvica in buca)',
          cause: 'Limite mobilità anca/caviglia O tensione hamstrings',
          threshold: '>15-20° di retroversione',
          action: 'monitor'
        },
        {
          pattern: 'Valgismo dinamico ginocchia',
          cause: 'Debolezza gluteo medio/adduttori O pattern motorio',
          threshold: 'Collasso visibile mediale durante la risalita',
          action: 'address'
        },
        {
          pattern: 'Sollevamento talloni',
          cause: 'Limite dorsiflexione caviglia',
          threshold: 'Talloni che si sollevano prima del parallelo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'lower_back', 'hip'],
      modifications: {
        'knee': 'Riduci profondità a 90°, considera Box Squat per limitare ROM, verifica tracking ginocchia',
        'lower_back': 'Riduci profondità, considera Goblet Squat (carico anteriore riduce stress lombare) o Leg Press',
        'hip': 'Sperimenta stance più largo/stretto, varia orientamento punte, considera Split Squat'
      }
    },
    
    coachingCues: {
      setup: [
        'Piedi alla larghezza che ti permette di scendere comodamente',
        'Punte in fuori quanto basta per sentire le anche libere',
        'Respiro profondo nella pancia PRIMA di iniziare'
      ],
      execution: [
        'Spingi il pavimento LONTANO da te',
        'Ginocchia seguono le punte dei piedi',
        'Petto alto ma non iperesteso',
        'Scendi come se ti sedessi su una sedia DIETRO di te'
      ],
      commonErrors: [
        'Iniziare la discesa con le ginocchia invece che con le anche',
        'Guardare in alto (iperestensione cervicale)',
        'Trattenere il respiro per tutta la ripetizione',
        'Collassare il torace in buca'
      ]
    }
  },

  'Goblet Squat': {
    name: 'Goblet Squat',
    nameIT: 'Goblet Squat',
    pattern: 'lower_push',
    equipment: 'dumbbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Gluteus maximus', activation: 'moderate', emgPercentage: '45-60% MVC' }
      ],
      secondaryMuscles: ['Core (anti-flexion)', 'Upper back (isometric)', 'Biceps (isometric)', 'Forearms'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 100-130°' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 90-120°' },
        { joint: 'Ankle', movement: 'Dorsiflexion', rom: '0° → 20-35°' }
      ],
      forceVector: 'Verticale con momento anteriore del carico che facilita postura eretta',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Medio-largo, 120-140% larghezza spalle. Punte 20-40° extraruotate.',
      grip: 'Manubrio/kettlebell tenuto verticalmente al petto, mani sotto il capo del peso ("coppa").',
      bodyPosition: 'Gomiti puntano verso il basso, non in fuori. Peso vicino al corpo. Questa posizione FACILITA un busto più verticale.',
      breathingPattern: 'Inspira e stabilizza PRIMA della discesa. Mantieni durante, espira in risalita.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Gomiti che "scendono tra le ginocchia" nella parte bassa',
        tempo: '2-3 secondi',
        endPosition: 'Gomiti toccano o sfiorano l\'interno cosce - questo è il range target',
        feeling: 'Stiramento interno coscia (adduttori) oltre a quad/glutes'
      },
      concentricInitiation: 'Spingi il pavimento mantenendo il peso al petto stabile.',
      concentricDrive: [
        'Il peso NON si allontana dal corpo',
        'Gomiti restano in linea, non si aprono',
        'Torace resta alto grazie al carico anteriore'
      ],
      peakContraction: 'Estensione completa, glutei contratti, peso sempre al petto.',
      tempo: '2-1-1-0 o 3-1-1-0 per principianti'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Il carico anteriore compensa femori lunghi - busto naturalmente più verticale',
        'Ottimo per chi ha difficoltà a mantenere il torace alto nel back squat',
        'Limitato dal peso massimo gestibile - transizione a front squat per carichi maggiori'
      ],
      acceptableVariations: [
        'Profondità variabile in base a mobilità - gomiti tra ginocchia è l\'obiettivo',
        'Stance più largo per chi ha anche rigide',
        'Peso leggermente più basso (livello sterno) per spalle rigide'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Peso che si allontana dal corpo',
          cause: 'Debolezza core o upper back',
          threshold: 'Peso che "cade" in avanti in discesa',
          action: 'address'
        },
        {
          pattern: 'Gomiti che si aprono lateralmente',
          cause: 'Tensione spalle o bicipiti',
          threshold: 'Gomiti a >30° dal corpo',
          action: 'monitor'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'lower_back', 'wrist', 'shoulder'],
      modifications: {
        'knee': 'Riduci profondità, considera stance più largo',
        'lower_back': 'Questo esercizio è già low-back friendly - se persiste dolore, passa a Leg Press',
        'wrist': 'Usa kettlebell invece di manubrio (presa più neutra)',
        'shoulder': 'Abbassa leggermente il peso verso lo sterno'
      }
    },
    
    coachingCues: {
      setup: [
        'Peso al petto come se lo cullassi',
        'Gomiti verso il basso, non in fuori',
        'Stance comodo, punte leggermente in fuori'
      ],
      execution: [
        'Gomiti DENTRO le ginocchia in buca',
        'Il peso resta incollato al petto',
        'Usa le ginocchia per "aprire" i gomiti nella parte bassa'
      ],
      commonErrors: [
        'Lasciare che il peso cada in avanti',
        'Gomiti che volano lateralmente',
        'Non scendere abbastanza (fermarsi prima che gomiti tocchino cosce)'
      ]
    }
  },

  'Back Squat': {
    name: 'Back Squat',
    nameIT: 'Squat con Bilanciere',
    pattern: 'lower_push',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps (vastus lateralis)', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Quadriceps (vastus medialis)', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '50-70% MVC' }
      ],
      secondaryMuscles: ['Adductor magnus', 'Hamstrings', 'Erector spinae', 'Rectus abdominis', 'Obliques', 'Upper back (isometric)'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 90-140°' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 80-130°' },
        { joint: 'Ankle', movement: 'Dorsiflexion', rom: '0° → 15-35°' },
        { joint: 'Spine', movement: 'Isometric stabilization', rom: 'Neutro mantenuto' }
      ],
      forceVector: 'Verticale con componente posteriore. Momento lombare significativo.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Variabile: hip-width to 150% shoulder-width. Punte 15-45° in fuori. La scelta dipende da struttura acetabolare e preferenza.',
      grip: 'Mani appena fuori spalle. Posizione bilanciere: HIGH BAR (sopra trapezio, base del collo) o LOW BAR (sotto trapezio, sopra deltoidi posteriori). Low bar permette più carico ma richiede più mobilità spalle.',
      bodyPosition: 'Bilanciere centrato sopra metà piede quando visto di lato. Scapole addotte e depresse per creare "scaffale". Lordosi lombare MANTENUTA (non enfatizzata).',
      breathingPattern: 'Valsalva: inspira a fondo PRIMA della discesa (360° addominale), trattieni per tutta la rep, espira DOPO aver superato lo sticking point o completato la rep.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Transizione "in buca" (bottom position) - qui il momento articolare è massimo e il carico passa da quadricipiti a catena posteriore',
        tempo: '2-3 secondi controllati. NO rimbalzo passivo in buca.',
        endPosition: 'Profondità individuale: ALMENO parallelo (cresta iliaca in linea con ginocchio), idealmente sotto se mobilità lo permette SENZA retroversione pelvica eccessiva',
        feeling: 'Tensione uniforme su tutta la muscolatura della coscia, pressione intra-addominale costante'
      },
      concentricInitiation: 'Spinta attraverso TUTTO il piede simultaneamente. "Spingi la terra lontano da te."',
      concentricDrive: [
        'Ginocchia tracking sui medi piedi (non collassano medialmente)',
        'Anche e spalle si sollevano alla STESSA velocità - se le anche salgono prima, è uno "squat morning"',
        'Mantieni pressione intra-addominale fino al lockout',
        'Bilanciere si muove in linea RETTA verticale'
      ],
      peakContraction: 'Estensione completa ginocchia e anche. Glutei contratti in lockout SENZA iperestensione lombare.',
      tempo: 'Standard: 2-0-1-0. Strength: 3-1-X-0 (X=esplosivo). Hypertrophy: 3-0-2-0.'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Rapporto femore/tibia/torso: femori lunghi relativamente al torso → maggiore inclinazione busto (fino a 60-70°). NON è un errore, è biomeccanica.',
        'Struttura acetabolare: variabilità di 20-40° nella rotazione femorale ottimale. Determina stance ideale.',
        'Dorsiflexione caviglia: limita profondità se ridotta. Soluzioni: rialzo talloni, stance più largo, scarpe da weightlifting.',
        'Posizione bilanciere: high bar = busto più verticale, più quad-dominant. Low bar = più inclinato, più hip-dominant. Entrambi validi.'
      ],
      acceptableVariations: [
        'Inclinazione busto: 30-70° dal verticale - dipende SOLO da proporzioni e posizione bilanciere',
        'Stance: da 100% a 150% larghezza spalle',
        'Ginocchia oltre le punte: ASSOLUTAMENTE FISIOLOGICO se talloni a terra',
        'Low bar vs High bar: scelta personale basata su comfort e obiettivi',
        'Profondità: parallelo è sufficiente, sotto è bonus se la mobilità lo permette'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Butt wink (retroversione pelvica in buca)',
          cause: 'Limite mobilità anca/caviglia, tensione hamstrings, o struttura acetabolare',
          threshold: '>15-20° di retroversione (visivamente: lombare che si arrotonda)',
          action: 'monitor'
        },
        {
          pattern: 'Squat morning (anche salgono prima delle spalle)',
          cause: 'Quadricipiti deboli rispetto a catena posteriore, o errore di pattern',
          threshold: 'Angolo busto che aumenta nella prima fase della risalita',
          action: 'address'
        },
        {
          pattern: 'Valgismo dinamico ginocchia',
          cause: 'Debolezza gluteo medio, adduttori, o pattern motorio non automatizzato',
          threshold: 'Collasso mediale visibile durante risalita',
          action: 'address'
        },
        {
          pattern: 'Shift laterale (spostamento a dx o sx)',
          cause: 'Asimmetria di forza, mobilità, o dolore unilaterale',
          threshold: 'Spostamento visibile del bacino durante rep',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'knee', 'hip', 'shoulder', 'wrist'],
      modifications: {
        'lower_back': 'Riduci profondità, considera Front Squat (meno momento lombare) o Safety Bar Squat. Se persiste, Leg Press.',
        'knee': 'Box Squat per limitare ROM e ridurre stress patellofemorale. Verifica tracking ginocchia. Considera bande sopra ginocchio.',
        'hip': 'Sperimenta stance più largo/stretto, varia orientamento punte. Considera Sumo stance o Belt Squat.',
        'shoulder': 'Low bar impossibile? Usa High Bar. Se anche High Bar è doloroso, Safety Squat Bar o Front Squat.',
        'wrist': 'Allarga la presa, usa polsiere, o passa a Safety Squat Bar.'
      },
      contraindications: ['Ernia discale acuta in fase infiammatoria', 'Spondilolistesi instabile', 'Frattura vertebrale recente']
    },
    
    coachingCues: {
      setup: [
        'Bilanciere sulla "carne", non sulle ossa',
        'Strozza il bilanciere con le mani per attivare il lat',
        'Piedi piantati PRIMA di sganciare',
        'Un passo indietro, sistema, poi squatta'
      ],
      execution: [
        'Big breath, belly TIGHT',
        'Rompi alle anche E alle ginocchia insieme',
        'Spingi la terra LONTANO',
        'Drive attraverso tutto il piede',
        'Ginocchia FUORI nella direzione delle punte'
      ],
      commonErrors: [
        'Sganciare e camminare troppo indietro (spreco energia)',
        'Iniziare con le ginocchia invece che anche+ginocchia insieme',
        'Perdere la pressione addominale in buca',
        'Iperestendere cervicale (guardare il soffitto)',
        'Rimbalzare in buca invece di controllare'
      ]
    }
  },

  'Front Squat': {
    name: 'Front Squat',
    nameIT: 'Squat Frontale',
    pattern: 'lower_push',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Gluteus maximus', activation: 'moderate', emgPercentage: '45-60% MVC' }
      ],
      secondaryMuscles: ['Core (anti-flexion massivo)', 'Upper back (thoracic extensors)', 'Anterior deltoids (isometric)'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 100-140°' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 90-120°' },
        { joint: 'Ankle', movement: 'Dorsiflexion', rom: '0° → 25-40°' }
      ],
      forceVector: 'Verticale con momento anteriore. RIDOTTO stress lombare rispetto a back squat (fino a 18% meno compressione L4-L5 secondo Gullett et al.)',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Medio, 100-130% larghezza spalle. Punte 15-30° extraruotate. Stance più stretto del back squat è comune.',
      grip: 'CLEAN GRIP: bilanciere sui deltoidi anteriori, gomiti ALTI (paralleli al pavimento idealmente). Se mobilità polsi insufficiente: CROSS GRIP (braccia incrociate) o STRAPS intorno al bilanciere.',
      bodyPosition: 'Torace ALTO e fiero. Bilanciere poggia sulla "scaffale" creata dai deltoidi anteriori, NON sulla gola. Scapole protratte leggermente per creare superficie.',
      breathingPattern: 'Valsalva. Inspira a fondo prima della discesa, trattieni, espira dopo lo sticking point. Respiro più difficile per pressione toracica - usa rep singole se necessario.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento gomiti ALTI - se cadono, il bilanciere rotola avanti',
        tempo: '2-3 secondi',
        endPosition: 'Massima profondità possibile mantenendo gomiti alti e torace verticale',
        feeling: 'Enorme tensione quadricipiti e core, polsi in massima estensione'
      },
      concentricInitiation: 'Spingi pavimento mantenendo i gomiti ALTI. Se gomiti cadono, perdi il bilanciere.',
      concentricDrive: [
        'GOMITI ALTI - è la priorità #1',
        'Torace che "sale verso il soffitto"',
        'Ginocchia tracking punte',
        'Core SEMPRE attivo per evitare collasso'
      ],
      peakContraction: 'Estensione completa, gomiti ancora alti, bilanciere stabile.',
      tempo: '2-0-1-0 standard. Rep singole con reset per carichi pesanti.'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Busto naturalmente più verticale - favorisce chi ha femori lunghi',
        'Richiede MAGGIORE dorsiflexione caviglia del back squat',
        'Mobilità polsi limitante per clean grip - cross grip sempre valida alternativa',
        'Lunghezza omero influenza posizione gomiti'
      ],
      acceptableVariations: [
        'Clean grip vs Cross grip vs Straps: tutte valide, scegli per comfort',
        'Gomiti non perfettamente paralleli ma comunque alti: accettabile',
        'Stance leggermente più stretto del back squat: comune e corretto'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Gomiti che cadono',
          cause: 'Debolezza upper back, fatica, carico eccessivo',
          threshold: 'Gomiti che scendono sotto parallelo durante rep',
          action: 'address'
        },
        {
          pattern: 'Torace che collassa in avanti',
          cause: 'Debolezza core o upper back',
          threshold: 'Perdita angolo torace >20° dalla partenza',
          action: 'stop'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['wrist', 'shoulder', 'knee', 'thoracic_spine'],
      modifications: {
        'wrist': 'Usa Cross Grip o Straps intorno al bilanciere',
        'shoulder': 'Cross Grip risolve la maggior parte dei problemi',
        'knee': 'Riduci profondità. Considera che il front squat è già più knee-friendly del back squat.',
        'thoracic_spine': 'Lavora sulla mobilità toracica prima di caricare. Usa Goblet Squat come regressione.'
      }
    },
    
    coachingCues: {
      setup: [
        'Bilanciere sulla "carne" dei deltoidi, non sulla gola',
        'Gomiti ALTI come se dovessi mostrare la maglietta a qualcuno davanti',
        'Solo 2-3 dita sotto il bilanciere per clean grip'
      ],
      execution: [
        'Gomiti UP durante tutta la rep',
        'Petto verso il soffitto',
        'Immagina di avere una corda che ti tira su dal petto'
      ],
      commonErrors: [
        'Gomiti che cadono (errore #1)',
        'Bilanciere sulla gola invece che sui deltoidi',
        'Forzare clean grip con polsi rigidi (usa alternativa)'
      ]
    }
  },

  'Bulgarian Split Squat': {
    name: 'Bulgarian Split Squat',
    nameIT: 'Squat Bulgaro',
    pattern: 'lower_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Gluteus medius (stabilization)', 'Adductors', 'Hamstrings', 'Core (anti-rotation/lateral flexion)'],
      jointActions: [
        { joint: 'Knee (front)', movement: 'Flexion/Extension', rom: '0° → 90-120°' },
        { joint: 'Hip (front)', movement: 'Flexion/Extension', rom: '0° → 80-110°' },
        { joint: 'Hip (back)', movement: 'Extension/Hyperextension', rom: 'Variabile' }
      ],
      forceVector: 'Prevalentemente verticale, con componente stabilizzatrice laterale significativa',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Piede anteriore circa 2-3 piedi dalla panca. Il collo del piede posteriore sulla panca, NON le dita (riduce stress piede). Distanza determinata sperimentalmente: in buca, ginocchio anteriore a circa 90°.',
      bodyPosition: 'Busto leggermente inclinato avanti (5-15°) per bilanciamento. Peso sul piede anteriore. La gamba posteriore serve SOLO per equilibrio, non per spingere.',
      breathingPattern: 'Inspira in discesa, espira in risalita. Più naturale del bilateral squat.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Controllo del ginocchio posteriore - scende verso il pavimento, non in avanti',
        tempo: '2-3 secondi',
        endPosition: 'Ginocchio posteriore sfiora o quasi tocca il pavimento',
        feeling: 'Forte stiramento flessori anca gamba posteriore + carico su quad/glute anteriore'
      },
      concentricInitiation: 'Spingi attraverso il PIEDE ANTERIORE. La gamba dietro è passiva.',
      concentricDrive: [
        'Spingi tallone + metatarso anteriore',
        'Ginocchio tracking punta del piede',
        'Mantieni equilibrio senza oscillare'
      ],
      peakContraction: 'Estensione completa gamba anteriore. Gluteo contratto.',
      tempo: '2-1-1-0 standard'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Altezza panca: standard ~40-45cm. Usa rialzo più basso se mobilità anca limitata.',
        'Distanza piede-panca: varia per trovare ROM ottimale',
        'Inclinazione busto: più inclinato = più glute, più verticale = più quad'
      ],
      acceptableVariations: [
        'Piede posteriore su panca vs su TRX/anelli (TRX più instabile ma meno stress collo piede)',
        'Busto verticale vs inclinato: entrambi validi, diverso focus muscolare',
        'Con o senza carico: inizia BW, poi aggiungi manubri/bilanciere'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Spingere con gamba posteriore',
          cause: 'Pattern motorio errato o gamba anteriore debole',
          threshold: 'Piede posteriore che "preme" sulla panca',
          action: 'address'
        },
        {
          pattern: 'Ginocchio anteriore che collassa medialmente',
          cause: 'Debolezza gluteo medio',
          threshold: 'Valgismo visibile',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'hip_flexor', 'ankle'],
      modifications: {
        'knee': 'Riduci profondità, aumenta inclinazione busto (meno stress patellofemorale)',
        'hip_flexor': 'Riduci altezza rialzo posteriore, limita ROM, stretching flessori pre-workout',
        'ankle': 'Rialzo sotto tallone anteriore'
      }
    },
    
    coachingCues: {
      setup: [
        'Collo del piede sulla panca, non le dita',
        'Distanza: sperimenta per trovare ~90° ginocchio in buca',
        'Peso sul piede DAVANTI'
      ],
      execution: [
        'La gamba dietro è solo per equilibrio',
        'Ginocchio posteriore va GIÙ, non avanti',
        'Spingi dal tallone anteriore'
      ],
      commonErrors: [
        'Spingere con la gamba posteriore',
        'Stare troppo vicino o troppo lontano dalla panca',
        'Oscillare lateralmente'
      ]
    }
  },

  'Leg Press': {
    name: 'Leg Press',
    nameIT: 'Pressa per Gambe',
    pattern: 'lower_push',
    equipment: 'machine',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Gluteus maximus', activation: 'moderate', emgPercentage: '40-55% MVC' }
      ],
      secondaryMuscles: ['Hamstrings', 'Adductors'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 90-110°' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 80-100°' }
      ],
      forceVector: 'Lungo l\'asse della macchina (varia per tipo di leg press)',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Piedi sulla piattaforma: BASSO = più quadricipiti, ALTO = più glutei/hamstrings. Larghezza: medio per bilanciato, largo per adduttori. Punte leggermente extraruotate.',
      bodyPosition: 'Schiena completamente appoggiata allo schienale. Glutei che NON si sollevano durante la discesa. Testa appoggiata se presente poggiatesta.',
      breathingPattern: 'Inspira in discesa (eccentrica), espira in spinta (concentrica).'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento glutei a contatto con lo schienale - se si sollevano, hai raggiunto il TUO limite di ROM',
        tempo: '2-3 secondi controllati',
        endPosition: 'Ginocchia a circa 90° O fino a quando glutei iniziano a sollevarsi (whichever comes first)',
        feeling: 'Carico su quadricipiti, NO dolore lombare'
      },
      concentricInitiation: 'Spingi attraverso tutto il piede, focus su talloni per più glutei.',
      concentricDrive: [
        'Spingi in modo uniforme con entrambe le gambe',
        'Ginocchia nella direzione delle punte',
        'NON bloccare completamente le ginocchia in estensione'
      ],
      peakContraction: 'Estensione quasi completa - mantieni leggera flessione (5-10°) per proteggere le ginocchia.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'La posizione dei piedi può compensare limiti di mobilità - sperimenta',
        'Macchine diverse hanno angoli diversi - adatta di conseguenza',
        'Chi ha femori lunghi potrebbe avere ROM limitato prima del butt lift'
      ],
      acceptableVariations: [
        'Posizione piedi alta vs bassa vs media: tutte valide, diverso focus',
        'Stance largo vs stretto: dipende da obiettivi',
        'ROM ridotto per chi ha scarsa mobilità: ok se glutei restano giù'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Glutei che si sollevano (butt lift)',
          cause: 'ROM eccessivo per la propria mobilità',
          threshold: 'Qualsiasi sollevamento visibile dei glutei',
          action: 'stop'
        },
        {
          pattern: 'Ginocchia che collassano',
          cause: 'Carico eccessivo o debolezza',
          threshold: 'Valgismo durante la spinta',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'lower_back', 'hip'],
      modifications: {
        'knee': 'Riduci ROM, non scendere oltre 90°. Piedi più alti sulla piattaforma.',
        'lower_back': 'NON andare così in basso che i glutei si sollevano. La leg press è già back-friendly se usata correttamente.',
        'hip': 'Sperimenta posizione piedi. Stance più largo può aiutare.'
      }
    },
    
    coachingCues: {
      setup: [
        'Schiena PIATTA contro lo schienale',
        'Glutei sempre a contatto',
        'Scegli posizione piedi per il tuo obiettivo'
      ],
      execution: [
        'Scendi fino a quando i glutei stanno per alzarsi - POI FERMATI',
        'Spingi attraverso i talloni',
        'NON bloccare le ginocchia in alto'
      ],
      commonErrors: [
        'Scendere troppo (glutei si sollevano = stress lombare)',
        'Bloccare le ginocchia in estensione',
        'Spingere più con una gamba che con l\'altra'
      ]
    }
  },

  'Pistol Squat': {
    name: 'Pistol Squat',
    nameIT: 'Pistol Squat',
    pattern: 'lower_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '85-95% MVC' },
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '65-80% MVC' }
      ],
      secondaryMuscles: ['Hip flexors (gamba libera)', 'Core (massivo)', 'Tibialis anterior', 'Gluteus medius'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension', rom: '0° → 130-150°' },
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 120-140°' },
        { joint: 'Ankle', movement: 'Dorsiflexion', rom: '0° → 35-45°' }
      ],
      forceVector: 'Verticale su singolo arto - DOPPIO carico effettivo rispetto a squat bilaterale',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Piede d\'appoggio piatto, leggermente extraruotato (10-20°). Gamba libera estesa in avanti.',
      bodyPosition: 'Braccia estese avanti per contrappeso. Core attivato. Gamba libera mantenuta sollevata per tutta la rep.',
      breathingPattern: 'Inspira prima di iniziare, trattieni durante, espira completando la risalita.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento equilibrio e gamba libera sollevata',
        tempo: '3-4 secondi controllati',
        endPosition: 'Gluteo tocca o sfiora il tallone (piena profondità)',
        feeling: 'Enorme tensione su tutta la gamba, equilibrio precario in buca'
      },
      concentricInitiation: 'Spingi attraverso tutto il piede mantenendo gamba libera in avanti.',
      concentricDrive: [
        'Spingi il pavimento lontano',
        'Usa le braccia come contrappeso',
        'Mantieni gamba libera orizzontale'
      ],
      peakContraction: 'Estensione completa in piedi su una gamba.',
      tempo: '3-0-2-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Richiede ECCELLENTE dorsiflexione caviglia (>40°)',
        'Richiede forza hip flexors per mantenere gamba libera',
        'Richiede forza unilaterale significativa (circa 1.5x BW equivalente)'
      ],
      acceptableVariations: [
        'Assistito con TRX/banda: progressione valida',
        'Su rialzo (gamba libera sotto il livello): riduce requisito flessori anca',
        'Con contrappeso in mano: facilita equilibrio'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Gamba libera che tocca terra',
          cause: 'Forza insufficiente o fatica',
          threshold: 'Qualsiasi contatto',
          action: 'address'
        },
        {
          pattern: 'Caduta laterale',
          cause: 'Debolezza gluteo medio o equilibrio',
          threshold: 'Incapacità di completare rep',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'ankle', 'hip'],
      modifications: {
        'knee': 'Questo esercizio NON è raccomandato con problemi al ginocchio. Usa versioni bilaterali.',
        'ankle': 'Rialzo tallone o versione assistita',
        'hip': 'Versione assistita con ROM ridotto'
      },
      contraindications: ['Instabilità ginocchio', 'Dolore patellofemorale attivo']
    },
    
    coachingCues: {
      setup: [
        'Braccia avanti per contrappeso',
        'Piede leggermente extraruotato',
        'Gamba libera tesa avanti'
      ],
      execution: [
        'Scendi LENTO',
        'Mantieni la gamba libera SU',
        'Usa le braccia per bilanciare'
      ],
      commonErrors: [
        'Scendere troppo veloce e perdere controllo',
        'Gamba libera che cade',
        'Tallone che si alza'
      ]
    }
  },

  'Lunges': {
    name: 'Lunges',
    nameIT: 'Affondi',
    pattern: 'lower_push',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Quadriceps', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '55-70% MVC' }
      ],
      secondaryMuscles: ['Hamstrings', 'Adductors', 'Gluteus medius', 'Core (anti-rotation)'],
      jointActions: [
        { joint: 'Knee (front)', movement: 'Flexion/Extension', rom: '0° → 90-110°' },
        { joint: 'Hip (front)', movement: 'Flexion/Extension', rom: '0° → 80-100°' },
        { joint: 'Hip (back)', movement: 'Extension', rom: '0° → 10-30°' }
      ],
      forceVector: 'Verticale + orizzontale (componente di decelerazione/accelerazione)',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'In piedi, piedi hip-width. Lunghezza passo: abbastanza lungo per permettere ~90° a entrambe le ginocchia in buca.',
      bodyPosition: 'Busto verticale o leggermente inclinato avanti. Core attivo.',
      breathingPattern: 'Inspira scendendo, espira risalendo.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Ginocchio posteriore che scende verso il pavimento verticalmente',
        tempo: '2-3 secondi',
        endPosition: 'Ginocchio posteriore sfiora il pavimento, entrambe le ginocchia ~90°',
        feeling: 'Stiramento flessori anca gamba posteriore, carico su quad/glute anteriore'
      },
      concentricInitiation: 'Spingi attraverso piede anteriore per tornare alla posizione iniziale.',
      concentricDrive: [
        'Spingi dal tallone + metatarso anteriore',
        'Mantieni ginocchio tracking punta',
        'Risali alla posizione iniziale'
      ],
      peakContraction: 'Ritorno alla stazione eretta, piedi uniti.',
      tempo: '2-0-1-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza passo varia per altezza e proporzioni',
        'Passo più lungo = più glutei, passo più corto = più quadricipiti'
      ],
      acceptableVariations: [
        'Walking lunges: aggiunge componente dinamica',
        'Reverse lunges: meno stress ginocchio, più controllo',
        'Lateral lunges: focus adduttori',
        'Deficit lunges: maggiore ROM'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Ginocchio anteriore che va molto oltre la punta del piede',
          cause: 'Passo troppo corto',
          threshold: 'Eccessiva traslazione anteriore con tallone che si alza',
          action: 'address'
        },
        {
          pattern: 'Perdita equilibrio laterale',
          cause: 'Base d\'appoggio troppo stretta',
          threshold: 'Barcollamento',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'hip_flexor', 'ankle'],
      modifications: {
        'knee': 'Usa Reverse Lunges (meno stress patellofemorale). Riduci profondità.',
        'hip_flexor': 'Passo più corto, meno profondità',
        'ankle': 'Reverse lunges, rialzo tallone'
      }
    },
    
    coachingCues: {
      setup: [
        'Passo abbastanza lungo per 90° ad entrambe le ginocchia',
        'Non camminare su una corda - mantieni larghezza naturale'
      ],
      execution: [
        'Ginocchio GIÙ, non avanti',
        'Spingi dal tallone anteriore',
        'Mantieni il busto alto'
      ],
      commonErrors: [
        'Passo troppo corto',
        'Ginocchio che va troppo avanti',
        'Perdere equilibrio'
      ]
    }
  }
};

// =============================================================================
// LOWER PULL PATTERN (Hip Hinge Variants)
// =============================================================================

export const LOWER_PULL_EXERCISES: Record<string, TechnicalExerciseDescription> = {
  
  'Conventional Deadlift': {
    name: 'Conventional Deadlift',
    nameIT: 'Stacco da Terra Convenzionale',
    pattern: 'lower_pull',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Hamstrings', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Erector spinae', activation: 'high', emgPercentage: '70-90% MVC' }
      ],
      secondaryMuscles: ['Quadriceps', 'Latissimus dorsi', 'Trapezius', 'Rhomboids', 'Forearms', 'Core'],
      jointActions: [
        { joint: 'Hip', movement: 'Extension', rom: '60-80° → 0°' },
        { joint: 'Knee', movement: 'Extension', rom: '30-50° → 0°' },
        { joint: 'Spine', movement: 'Isometric stabilization', rom: 'Neutro mantenuto' }
      ],
      forceVector: 'Verticale contro gravità. Momento massimo su lombare a bilanciere staccato da terra.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Hip-width, piedi sotto il bilanciere (bilanciere sopra metà piede visto dall\'alto). Punte 10-20° extraruotate.',
      grip: 'Appena fuori le gambe. Doppia presa prona (overhand) per carichi leggeri/moderati. Mixed grip (una mano supina) o hook grip per carichi pesanti.',
      bodyPosition: 'Piega anche e ginocchia per raggiungere il bilanciere. Schiena NEUTRA (non arrotondata, non iperestesa). Scapole sopra o leggermente avanti al bilanciere. Braccia DRITTE.',
      breathingPattern: 'Big breath a fondo (360° addominale), Valsalva per tutta la rep, espira DOPO aver completato la rep a terra o in piedi.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento schiena neutra durante la discesa',
        tempo: '2-3 secondi (o rilascio controllato)',
        endPosition: 'Bilanciere a terra, setup identico alla partenza',
        feeling: 'Stiramento controllato hamstrings e glutei'
      },
      concentricInitiation: '"Spingi la terra LONTANO da te" - non pensare a tirare il bilanciere, pensa a spingere il pavimento.',
      concentricDrive: [
        'Anche e spalle si sollevano INSIEME (stesso angolo del busto)',
        'Bilanciere si muove in linea RETTA verticale, a contatto con le gambe',
        'Spingi ginocchia in fuori per "fare spazio" al bilanciere',
        'Mantieni schiena neutra - il momento lombare è massimo nella prima fase'
      ],
      peakContraction: 'Estensione completa anche. Glutei contratti. Spalle leggermente dietro al bilanciere. NO iperestensione lombare.',
      tempo: 'Rep singole con reset per forza. Touch-and-go per volume (più rischioso per tecnica).'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Rapporto torso/gambe: torso corto = più inclinazione, torso lungo = più verticale',
        'Lunghezza braccia: braccia lunghe = vantaggio meccanico significativo',
        'Struttura anche: influenza stance e tracking ginocchia'
      ],
      acceptableVariations: [
        'Angolo del busto variabile in base a proporzioni',
        'Stance leggermente più largo o stretto del hip-width',
        'Mixed grip vs Double overhand vs Hook grip: tutti validi',
        'Testa neutra vs guardare avanti: entrambi accettabili'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Schiena che si arrotonda',
          cause: 'Carico eccessivo, hamstrings deboli, setup errato',
          threshold: 'Perdita visibile della curva lombare',
          action: 'stop'
        },
        {
          pattern: 'Anche che salgono prima delle spalle ("stripper deadlift")',
          cause: 'Quadricipiti deboli o pattern errato',
          threshold: 'Aumento visibile dell\'angolo del busto nella prima fase',
          action: 'address'
        },
        {
          pattern: 'Bilanciere che si allontana dal corpo',
          cause: 'Lat non attivati o setup errato',
          threshold: 'Bilanciere che si sposta anteriormente',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'hamstring', 'grip'],
      modifications: {
        'lower_back': 'Usa Trap Bar Deadlift (posizione più neutra). Riduci ROM con blocchi. Considera Romanian Deadlift per isolare catena posteriore senza stacco da terra.',
        'hamstring': 'Riduci ROM, inizia da blocchi/rack. Più flessione ginocchia per ridurre stretch.',
        'grip': 'Usa straps. Forza della presa non dovrebbe limitare lo stacco.'
      },
      contraindications: ['Ernia discale acuta', 'Spondilolistesi instabile', 'Dolore lombare acuto']
    },
    
    coachingCues: {
      setup: [
        'Bilanciere sopra metà piede',
        'Piega ANCHE poi ginocchia per raggiungere',
        'Braccia dritte come cavi',
        'Big breath, belly tight'
      ],
      execution: [
        'SPINGI la terra lontano',
        'Bilanciere SALE dritto, a contatto con le gambe',
        'Anche e spalle si muovono INSIEME',
        'Stringi i glutei in alto'
      ],
      commonErrors: [
        'Tirare con le braccia (braccia devono essere passive)',
        'Bilanciere che si allontana dal corpo',
        'Anche che salgono prima delle spalle',
        'Iperestendere in alto'
      ]
    }
  },

  'Romanian Deadlift (RDL)': {
    name: 'Romanian Deadlift (RDL)',
    nameIT: 'Stacco Rumeno',
    pattern: 'lower_pull',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Hamstrings', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '65-80% MVC' },
        { muscle: 'Erector spinae', activation: 'high', emgPercentage: '60-75% MVC' }
      ],
      secondaryMuscles: ['Adductor magnus', 'Latissimus dorsi', 'Trapezius', 'Core', 'Forearms'],
      jointActions: [
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 60-90°' },
        { joint: 'Knee', movement: 'Minimal flexion', rom: '10-25° fisso' },
        { joint: 'Spine', movement: 'Isometric stabilization', rom: 'Neutro mantenuto' }
      ],
      forceVector: 'Verticale. Momento massimo all\'elongazione degli hamstrings.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Hip-width. Punte avanti o leggermente extraruotate (5-15°).',
      grip: 'Appena fuori le cosce. Doppia presa prona. Straps se la presa limita.',
      bodyPosition: 'Si parte IN PIEDI con il bilanciere (a differenza del conventional deadlift). Ginocchia leggermente flesse e BLOCCATE in quella posizione per tutta la rep.',
      breathingPattern: 'Inspira prima di iniziare la discesa, trattieni durante, espira completando l\'estensione.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento ginocchia leggermente flesse FISSE - non si piegano oltre durante la discesa',
        tempo: '3-4 secondi - il tempo sotto tensione è il focus',
        endPosition: 'Quando senti un forte stretch agli hamstrings O quando la schiena inizia ad arrotondarsi (whichever comes first)',
        feeling: 'Forte stiramento hamstrings dalla parte posteriore delle cosce alle anche'
      },
      concentricInitiation: '"Spingi le anche AVANTI" - non tirare con la schiena.',
      concentricDrive: [
        'Anche che si estendono portando il busto verticale',
        'Bilanciere scorre lungo le cosce, sempre a contatto',
        'Glutei che si contraggono progressivamente'
      ],
      peakContraction: 'Estensione completa anche, glutei contratti. NO iperestensione lombare.',
      tempo: '3-0-2-0 (lenta eccentrica è il focus)'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Lunghezza hamstrings: determina ROM raggiungibile',
        'Mobilità anche: limita la profondità',
        'Flessibilità limitata NON è un problema - lavora nel TUO range'
      ],
      acceptableVariations: [
        'ROM variabile in base a flessibilità: bilanciere può fermarsi a metà tibia o sotto il ginocchio',
        'Ginocchia più o meno flesse: più flesse = meno stretch hamstrings',
        'Singola gamba (Single Leg RDL): ottima variante per unilateralità'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Ginocchia che si flettono durante la discesa',
          cause: 'Hamstrings tesi O pattern errato',
          threshold: 'Aumento visibile della flessione ginocchia',
          action: 'address'
        },
        {
          pattern: 'Schiena che si arrotonda',
          cause: 'ROM eccessivo per la propria mobilità',
          threshold: 'Perdita curva lombare',
          action: 'stop'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'hamstring'],
      modifications: {
        'lower_back': 'Riduci ROM, mantieni schiena più verticale. Considera Cable Pull-Through come alternativa.',
        'hamstring': 'Riduci ROM, aumenta flessione ginocchia (avvicina a Good Morning)'
      }
    },
    
    coachingCues: {
      setup: [
        'Parti IN PIEDI',
        'Ginocchia morbide (non bloccate, non piegate)',
        'Bilanciere a contatto con le cosce'
      ],
      execution: [
        'Anche che vanno INDIETRO',
        'Ginocchia FERME (non si piegano di più)',
        'Bilanciere scorre sulle gambe',
        'Fermati quando senti lo stretch O la schiena cede'
      ],
      commonErrors: [
        'Piegare le ginocchia (diventa uno squat)',
        'Scendere troppo (schiena che si arrotonda)',
        'Bilanciere che si allontana dalle gambe',
        'Tirare con la schiena invece di spingere le anche'
      ]
    }
  },

  'Hip Thrust': {
    name: 'Hip Thrust',
    nameIT: 'Hip Thrust',
    pattern: 'lower_pull',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '85-100% MVC' }
      ],
      secondaryMuscles: ['Hamstrings', 'Quadriceps (stabilization)', 'Adductors', 'Core'],
      jointActions: [
        { joint: 'Hip', movement: 'Extension', rom: '-20° → 0° (con possibile iperestensione)' },
        { joint: 'Knee', movement: 'Isometric ~90°', rom: 'Fisso' }
      ],
      forceVector: 'Orizzontale - questo rende l\'esercizio unico per l\'attivazione glutea al picco di contrazione',
      mechanicalTension: 'shortened'
    },
    
    setup: {
      stance: 'Piedi hip-width, piante completamente a terra. Posizione piedi tale che a piena estensione le tibie siano VERTICALI (circa 90° al ginocchio).',
      bodyPosition: 'Parte alta della schiena (scapole) appoggiata su una panca stabile (~40-45cm). Bilanciere sulle anche, protetto da pad.',
      breathingPattern: 'Inspira in basso, espira spingendo in alto.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Controllo della discesa senza rilasciare tensione glutea',
        tempo: '2-3 secondi',
        endPosition: 'Glutei a qualche cm da terra, mantenendo tensione',
        feeling: 'Stiramento glutei mantenendo attivazione'
      },
      concentricInitiation: 'Spingi attraverso i TALLONI e contrai i glutei.',
      concentricDrive: [
        'Spingi le anche VERSO IL SOFFITTO',
        'Glutei che si contraggono massimamente',
        'NON iperestendere la lombare - la curva viene dai glutei, non dalla schiena'
      ],
      peakContraction: 'Anche a piena estensione, glutei DURAMENTE contratti, corpo in linea da ginocchia a spalle. PAUSA di 1-2 secondi in alto.',
      tempo: '2-0-1-1 (con pausa in alto)'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Altezza panca: regola per avere scapole comodamente appoggiate',
        'Posizione piedi: più lontani = più hamstrings, più vicini = più glutei isolati',
        'Larghezza stance: sperimenta per massima attivazione glutea'
      ],
      acceptableVariations: [
        'Piedi più larghi o più stretti del hip-width',
        'Piedi più avanti o più indietro',
        'Single leg per unilateralità',
        'Feet elevated per più ROM'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Iperestensione lombare in alto',
          cause: 'Glutei deboli o pattern errato',
          threshold: 'Curva lombare eccessiva al picco',
          action: 'address'
        },
        {
          pattern: 'Ginocchia che collassano',
          cause: 'Adduttori che prendono over',
          threshold: 'Valgismo visibile durante la spinta',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'hip', 'knee'],
      modifications: {
        'lower_back': 'Riduci ROM, enfatizza contrazione glutea senza iperestendere. Questo esercizio dovrebbe essere back-friendly se eseguito correttamente.',
        'hip': 'Sperimenta larghezza stance e posizione piedi',
        'knee': 'Posiziona i piedi in modo che il ginocchio sia a ~90° in alto. Se persiste, versione bodyweight.'
      }
    },
    
    coachingCues: {
      setup: [
        'Scapole sulla panca, non il collo',
        'Piedi posizionati così che a estensione completa le tibie siano verticali',
        'Pad sul bilanciere per proteggere le anche'
      ],
      execution: [
        'Spingi attraverso i TALLONI',
        'STRINGI i glutei DURAMENTE in alto',
        'PAUSA in alto - senti i glutei lavorare',
        'La curva viene dai glutei, NON dalla schiena'
      ],
      commonErrors: [
        'Iperestendere la lombare invece di estendere le anche',
        'Non fare pausa in alto (perdi il picco di contrazione)',
        'Piedi troppo vicini o troppo lontani'
      ]
    }
  },

  'Glute Bridge': {
    name: 'Glute Bridge',
    nameIT: 'Ponte Glutei',
    pattern: 'lower_pull',
    equipment: 'bodyweight',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Gluteus maximus', activation: 'high', emgPercentage: '70-85% MVC' }
      ],
      secondaryMuscles: ['Hamstrings', 'Core', 'Adductors'],
      jointActions: [
        { joint: 'Hip', movement: 'Extension', rom: '0° → full extension' },
        { joint: 'Knee', movement: 'Isometric ~90°', rom: 'Fisso' }
      ],
      forceVector: 'Verticale contro gravità',
      mechanicalTension: 'shortened'
    },
    
    setup: {
      stance: 'Supino, ginocchia piegate ~90°, piedi piatti a terra hip-width.',
      bodyPosition: 'Braccia lungo i fianchi, palmi a terra per stabilità. Testa a terra, neutrale.',
      breathingPattern: 'Inspira a terra, espira spingendo in alto.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Discesa controllata mantenendo attivazione',
        tempo: '2 secondi',
        endPosition: 'Glutei sfiorano terra',
        feeling: 'Tensione glutea mantenuta anche in basso'
      },
      concentricInitiation: 'Spingi attraverso i talloni, contrai glutei.',
      concentricDrive: [
        'Solleva le anche verso il soffitto',
        'Stringi glutei al massimo',
        'Corpo in linea da ginocchia a spalle in alto'
      ],
      peakContraction: 'Piena estensione anche, glutei duramente contratti, pausa 1-2 secondi.',
      tempo: '2-0-1-1'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Posizione piedi: più vicini = più glutei, più lontani = più hamstrings',
        'Versione unilaterale per maggiore intensità'
      ],
      acceptableVariations: [
        'Single leg glute bridge',
        'Feet elevated (piedi su rialzo)',
        'Marching glute bridge',
        'Con band sopra le ginocchia per extra gluteo medio'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Iperestensione lombare',
          cause: 'Glutei deboli o pattern errato',
          threshold: 'Curva lombare eccessiva',
          action: 'address'
        },
        {
          pattern: 'Crampi hamstrings',
          cause: 'Hamstrings che dominano invece dei glutei',
          threshold: 'Crampi durante l\'esercizio',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'knee'],
      modifications: {
        'lower_back': 'Riduci ROM, enfatizza contrazione glutea. Questo esercizio è generalmente back-friendly.',
        'knee': 'Regola angolo ginocchio'
      }
    },
    
    coachingCues: {
      setup: [
        'Piedi piatti, ginocchia piegate',
        'Braccia lungo i fianchi per stabilità'
      ],
      execution: [
        'Spingi dai TALLONI',
        'STRINGI i glutei in alto',
        'PAUSA in alto',
        'Corpo in linea, niente arco lombare eccessivo'
      ],
      commonErrors: [
        'Usare gli hamstrings invece dei glutei',
        'Iperestendere la schiena',
        'Non fare pausa in alto'
      ]
    }
  },

  'Good Morning': {
    name: 'Good Morning',
    nameIT: 'Good Morning',
    pattern: 'lower_pull',
    equipment: 'barbell',
    category: 'compound',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Hamstrings', activation: 'high', emgPercentage: '70-85% MVC' },
        { muscle: 'Erector spinae', activation: 'high', emgPercentage: '75-90% MVC' },
        { muscle: 'Gluteus maximus', activation: 'moderate', emgPercentage: '50-65% MVC' }
      ],
      secondaryMuscles: ['Core', 'Adductor magnus'],
      jointActions: [
        { joint: 'Hip', movement: 'Flexion/Extension', rom: '0° → 60-90°' },
        { joint: 'Knee', movement: 'Minimal flexion', rom: '10-20° fisso' },
        { joint: 'Spine', movement: 'Isometric stabilization', rom: 'Neutro mantenuto' }
      ],
      forceVector: 'Momento lungo sul rachide lombare - richiede tecnica impeccabile',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'Hip-width, punte leggermente extraruotate. Ginocchia morbide (leggera flessione).',
      grip: 'Bilanciere in posizione high bar (come per squat), mani larghe per stabilità.',
      bodyPosition: 'Bilanciere stabile sulle spalle, core attivato, schiena NEUTRA.',
      breathingPattern: 'Inspira prima di piegarsi, trattieni durante, espira tornando su.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento schiena neutra mentre le anche si flettono',
        tempo: '3-4 secondi controllati',
        endPosition: 'Busto quasi parallelo al pavimento O quando senti stretch hamstrings O quando la schiena inizia a cedere',
        feeling: 'Forte stretch hamstrings, tensione su tutta la catena posteriore'
      },
      concentricInitiation: 'Contrai glutei e spingi le anche avanti.',
      concentricDrive: [
        'Anche che si estendono',
        'Schiena che mantiene lo stesso angolo iniziale',
        'NON tirare con la schiena'
      ],
      peakContraction: 'Ritorno alla posizione eretta, glutei contratti.',
      tempo: '3-0-2-0'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Flessibilità hamstrings determina ROM',
        'Forza erettori spinali: se deboli, ridurre carico significativamente'
      ],
      acceptableVariations: [
        'Seated good morning: riduce stress lombare',
        'Good morning con band: per principianti',
        'ROM ridotto per chi ha mobilità limitata'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Schiena che si arrotonda',
          cause: 'Carico eccessivo o mobilità insufficiente',
          threshold: 'Qualsiasi perdita della curva lombare',
          action: 'stop'
        },
        {
          pattern: 'Ginocchia che si flettono eccessivamente',
          cause: 'Pattern errato',
          threshold: 'Flessione ginocchia >30°',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['lower_back', 'hamstring'],
      modifications: {
        'lower_back': 'ESERCIZIO AD ALTO RISCHIO per problemi lombari. Considera RDL o Hip Thrust come alternative più sicure.',
        'hamstring': 'Riduci ROM significativamente'
      },
      contraindications: ['Problemi lombari attivi', 'Ernia discale', 'Principianti senza supervisione']
    },
    
    coachingCues: {
      setup: [
        'Bilanciere stabile sulle spalle',
        'Ginocchia morbide, NON bloccate',
        'Big breath, core tight'
      ],
      execution: [
        'Piega DALLE ANCHE, non dalla schiena',
        'Immagina di chiudere una porta con i glutei dietro di te',
        'FERMATI quando senti lo stretch O la schiena cede',
        'Risali spingendo le anche avanti'
      ],
      commonErrors: [
        'Piegarsi dalla schiena invece che dalle anche',
        'Scendere troppo',
        'Usare carico eccessivo',
        'Ginocchia che si piegano troppo'
      ]
    }
  },

  'Nordic Curl': {
    name: 'Nordic Curl',
    nameIT: 'Nordic Curl',
    pattern: 'lower_pull',
    equipment: 'bodyweight',
    category: 'isolation',
    
    biomechanics: {
      primaryMuscles: [
        { muscle: 'Hamstrings (biceps femoris)', activation: 'high', emgPercentage: '90-100%+ MVC' }
      ],
      secondaryMuscles: ['Hamstrings (semimembranosus, semitendinosus)', 'Gastrocnemius', 'Gluteus maximus (stabilization)'],
      jointActions: [
        { joint: 'Knee', movement: 'Flexion/Extension (eccentrica controllata)', rom: '90° → 0°' },
        { joint: 'Hip', movement: 'Isometric (mantenere neutro)', rom: '0°' }
      ],
      forceVector: 'Resistenza contro gravità al ginocchio. Momento ESTREMAMENTE lungo = esercizio MOLTO difficile.',
      mechanicalTension: 'lengthened'
    },
    
    setup: {
      stance: 'In ginocchio, caviglie bloccate (sotto qualcosa di stabile o con partner). Ginocchia su superficie morbida.',
      bodyPosition: 'Corpo in linea da ginocchia a testa. Anche ESTESE (non flesse!). Braccia pronte a frenare la caduta.',
      breathingPattern: 'Inspira prima di iniziare, controlla durante la discesa.'
    },
    
    execution: {
      eccentric: {
        controlPoint: 'Mantenimento delle anche ESTESE per tutta la discesa - NON piegarti alle anche',
        tempo: '4-6 secondi (più lento possibile)',
        endPosition: 'Mani che toccano terra per frenare la caduta finale',
        feeling: 'INTENSO lavoro eccentrico degli hamstrings'
      },
      concentricInitiation: 'Spingi da terra con le mani e tira con gli hamstrings.',
      concentricDrive: [
        'Usa le mani quanto necessario',
        'Contrai DURAMENTE gli hamstrings',
        'Mantieni anche estese'
      ],
      peakContraction: 'Ritorno alla posizione iniziale in ginocchio.',
      tempo: 'Eccentrica lentissima (4-6s), concentrica assistita'
    },
    
    dcssVariability: {
      anthropometricFactors: [
        'Esercizio ESTREMAMENTE difficile - la maggior parte delle persone non riesce a fare una rep completa',
        'Lunghezza segmenti influenza difficoltà'
      ],
      acceptableVariations: [
        'Solo eccentrica (la fase più importante): scendi lento, risali con le mani',
        'Con band di assistenza',
        'ROM parziale: inizia con piccole escursioni',
        'Razor curl (con anche flesse): variante più facile ma meno efficace'
      ],
      compensatoryPatterns: [
        {
          pattern: 'Anche che si flettono durante la discesa',
          cause: 'Hamstrings insufficienti o pattern errato',
          threshold: 'Qualsiasi flessione anche visibile',
          action: 'address'
        },
        {
          pattern: 'Caduta incontrollata',
          cause: 'Forza insufficiente',
          threshold: 'Perdita totale di controllo',
          action: 'address'
        }
      ]
    },
    
    painDetectIntegration: {
      affectedAreas: ['knee', 'hamstring'],
      modifications: {
        'knee': 'ESERCIZIO CONTROINDICATO con problemi al ginocchio. Usa Leg Curl machine o RDL.',
        'hamstring': 'Riduci ROM, usa band di assistenza. Se dolore acuto, STOP.'
      },
      contraindications: ['Problemi ginocchio', 'Hamstrings precedentemente lesionati (senza clearance)']
    },
    
    coachingCues: {
      setup: [
        'Anche ESTESE, corpo dritto da ginocchia a testa',
        'Caviglie ben bloccate',
        'Mani pronte a frenare'
      ],
      execution: [
        'Scendi LENTISSIMO',
        'Anche SEMPRE estese - non piegarti in avanti',
        'Usa le mani per tornare su all\'inizio'
      ],
      commonErrors: [
        'Anche che si flettono (errore più comune)',
        'Scendere troppo veloce',
        'Non essere pronti a frenare con le mani'
      ]
    }
  }
};

// =============================================================================
// ESPORTA TUTTO
// =============================================================================

export const TECHNICAL_EXERCISE_DATABASE = {
  ...LOWER_PUSH_EXERCISES,
  ...LOWER_PULL_EXERCISES
};

export default TECHNICAL_EXERCISE_DATABASE;
