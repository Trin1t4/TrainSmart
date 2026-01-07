/**
 * CORRECTIVE EXERCISES - DCSS Paradigm
 * 
 * Esercizi correttivi e mobilità basati su DCSS di Evangelista.
 * 
 * PRINCIPI:
 * 1. Non esistono esercizi "più sicuri" in assoluto
 * 2. Gli esercizi sono appropriati per SITUAZIONI specifiche
 * 3. L'obiettivo è tornare a tollerare il movimento, non evitarlo
 * 4. La progressione è fondamentale
 * 
 * NOTA: McGill Big 3 sono validi per intolleranza alla flessione ACUTA,
 * ma non sono il default universale.
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
  videoUrl?: string;
  imageUrl?: string;
  progression?: string;
  progressionIt?: string;
}

export interface CorrectiveProtocol {
  id: string;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  appropriateFor: string[];
  appropriateForIt: string[];
  notAppropriateFor: string[];
  notAppropriateForIt: string[];
  exercises: CorrectiveExercise[];
  progressionCriteria: string[];
  progressionCriteriaIt: string[];
  note: string;
  noteIt: string;
}

// ============================================================================
// MOBILITY PROTOCOLS (General Use)
// ============================================================================

export const HIP_MOBILITY_PROTOCOL: CorrectiveProtocol = {
  id: 'hip_mobility',
  name: 'Hip Mobility Protocol',
  nameIt: 'Protocollo Mobilità Anca',
  description: 'General hip mobility work suitable for most people. Helps with squat depth, hip hinge quality, and general movement.',
  descriptionIt: 'Lavoro generale sulla mobilità dell\'anca adatto alla maggior parte delle persone. Aiuta con la profondità dello squat, la qualità dell\'hip hinge e il movimento generale.',
  
  appropriateFor: [
    'Anyone wanting to improve squat depth',
    'Those with general hip stiffness',
    'Desk workers',
    'Pre-workout warm-up'
  ],
  appropriateForIt: [
    'Chiunque voglia migliorare la profondità dello squat',
    'Chi ha rigidità generale all\'anca',
    'Lavoratori sedentari',
    'Riscaldamento pre-allenamento'
  ],
  
  notAppropriateFor: [
    'Acute hip pain that worsens with movement',
    'Post-surgical without clearance'
  ],
  notAppropriateForIt: [
    'Dolore acuto all\'anca che peggiora col movimento',
    'Post-chirurgico senza autorizzazione'
  ],
  
  exercises: [
    {
      name: '90/90 Hip Stretch',
      nameIt: 'Stretch Anca 90/90',
      sets: '2-3',
      reps: '30-45s per side',
      rest: 'None',
      purpose: 'Hip internal and external rotation',
      purposeIt: 'Rotazione interna ed esterna dell\'anca',
      cues: [
        'Front leg: 90° at hip and knee',
        'Back leg: 90° at hip and knee',
        'Sit tall, don\'t round forward',
        'Breathe and relax into the stretch'
      ],
      cuesIt: [
        'Gamba anteriore: 90° a anca e ginocchio',
        'Gamba posteriore: 90° a anca e ginocchio',
        'Siediti dritto, non arrotondare in avanti',
        'Respira e rilassati nello stretch'
      ]
    },
    {
      name: 'Hip Flexor Stretch (Half-Kneeling)',
      nameIt: 'Stretch Flessori Anca (Mezzo Inginocchiato)',
      sets: '2',
      reps: '45-60s per side',
      rest: 'None',
      purpose: 'Hip extension and flexor length',
      purposeIt: 'Estensione anca e lunghezza flessori',
      cues: [
        'Back knee on pad',
        'Squeeze glute of back leg',
        'Tuck pelvis slightly (posterior tilt)',
        'Shift forward from hips, not lower back'
      ],
      cuesIt: [
        'Ginocchio posteriore su un pad',
        'Stringi il gluteo della gamba posteriore',
        'Retroverti leggermente il bacino',
        'Spostati in avanti dalle anche, non dalla bassa schiena'
      ]
    },
    {
      name: 'Goblet Squat Hold',
      nameIt: 'Goblet Squat Hold',
      sets: '2-3',
      reps: '30-45s',
      rest: '30s',
      purpose: 'Active hip mobility in squat position',
      purposeIt: 'Mobilità attiva dell\'anca in posizione di squat',
      cues: [
        'Hold light weight at chest',
        'Sink into deep squat',
        'Use elbows to push knees out',
        'Keep heels down (use elevation if needed)'
      ],
      cuesIt: [
        'Tieni un peso leggero al petto',
        'Affonda in uno squat profondo',
        'Usa i gomiti per spingere le ginocchia fuori',
        'Mantieni i talloni giù (usa rialzo se necessario)'
      ],
      progression: 'Increase hold time, then add gentle rocking side to side',
      progressionIt: 'Aumenta il tempo di tenuta, poi aggiungi un leggero dondolio laterale'
    },
    {
      name: 'Pigeon Stretch (Modified)',
      nameIt: 'Stretch del Piccione (Modificato)',
      sets: '2',
      reps: '45-60s per side',
      rest: 'None',
      purpose: 'Hip external rotation and glute stretch',
      purposeIt: 'Rotazione esterna anca e stretch del gluteo',
      cues: [
        'Front shin angled based on your mobility',
        'Back leg straight behind you',
        'Stay upright or fold forward based on comfort',
        'Breathe deeply'
      ],
      cuesIt: [
        'Tibia anteriore angolata in base alla tua mobilità',
        'Gamba posteriore dritta dietro di te',
        'Resta eretto o piegati in avanti in base al comfort',
        'Respira profondamente'
      ]
    }
  ],
  
  progressionCriteria: [
    'Can hold deep squat for 60s comfortably',
    'Hip rotation feels symmetric',
    'No discomfort during or after'
  ],
  progressionCriteriaIt: [
    'Può tenere squat profondo per 60s comodamente',
    'La rotazione dell\'anca sembra simmetrica',
    'Nessun fastidio durante o dopo'
  ],
  
  note: 'This protocol is for general mobility improvement. It\'s not a treatment for any specific condition.',
  noteIt: 'Questo protocollo è per il miglioramento generale della mobilità. Non è un trattamento per nessuna condizione specifica.'
};

// ============================================================================
// ANKLE MOBILITY PROTOCOL
// ============================================================================

export const ANKLE_MOBILITY_PROTOCOL: CorrectiveProtocol = {
  id: 'ankle_mobility',
  name: 'Ankle Mobility Protocol',
  nameIt: 'Protocollo Mobilità Caviglia',
  description: 'Improve ankle dorsiflexion for better squat depth and knee tracking.',
  descriptionIt: 'Migliora la dorsiflessione della caviglia per una migliore profondità dello squat e tracking del ginocchio.',
  
  appropriateFor: [
    'Heels rising during squat',
    'Limited squat depth',
    'Knee tracking issues'
  ],
  appropriateForIt: [
    'Talloni che si alzano durante lo squat',
    'Profondità dello squat limitata',
    'Problemi di tracking del ginocchio'
  ],
  
  notAppropriateFor: [
    'Acute ankle injury',
    'Post-surgical without clearance'
  ],
  notAppropriateForIt: [
    'Infortunio acuto alla caviglia',
    'Post-chirurgico senza autorizzazione'
  ],
  
  exercises: [
    {
      name: 'Wall Ankle Mobilization',
      nameIt: 'Mobilizzazione Caviglia al Muro',
      sets: '2-3',
      reps: '15-20 per side',
      rest: 'None',
      purpose: 'Active dorsiflexion work',
      purposeIt: 'Lavoro attivo sulla dorsiflessione',
      cues: [
        'Foot 3-4 inches from wall',
        'Drive knee forward over toes',
        'Keep heel down',
        'Progress by moving foot further from wall'
      ],
      cuesIt: [
        'Piede a 8-10 cm dal muro',
        'Porta il ginocchio in avanti oltre le dita',
        'Mantieni il tallone giù',
        'Progredisci allontanando il piede dal muro'
      ]
    },
    {
      name: 'Banded Ankle Mobilization',
      nameIt: 'Mobilizzazione Caviglia con Banda',
      sets: '2',
      reps: '15-20 per side',
      rest: 'None',
      purpose: 'Joint mobilization with distraction',
      purposeIt: 'Mobilizzazione articolare con distrazione',
      cues: [
        'Band around front of ankle, attached behind',
        'Step forward into lunge',
        'Drive knee forward',
        'Band pulls ankle back, creating space'
      ],
      cuesIt: [
        'Banda intorno alla parte anteriore della caviglia, attaccata dietro',
        'Fai un passo avanti in affondo',
        'Porta il ginocchio in avanti',
        'La banda tira la caviglia indietro, creando spazio'
      ]
    },
    {
      name: 'Calf Stretch (Straight Leg)',
      nameIt: 'Stretch Polpaccio (Gamba Dritta)',
      sets: '2',
      reps: '30-45s per side',
      rest: 'None',
      purpose: 'Gastrocnemius length',
      purposeIt: 'Lunghezza del gastrocnemio',
      cues: [
        'Hands on wall',
        'Back leg straight, heel down',
        'Lean forward until stretch is felt',
        'Hold, breathe'
      ],
      cuesIt: [
        'Mani al muro',
        'Gamba posteriore dritta, tallone giù',
        'Inclinati in avanti finché senti lo stretch',
        'Tieni, respira'
      ]
    },
    {
      name: 'Calf Stretch (Bent Knee)',
      nameIt: 'Stretch Polpaccio (Ginocchio Piegato)',
      sets: '2',
      reps: '30-45s per side',
      rest: 'None',
      purpose: 'Soleus length',
      purposeIt: 'Lunghezza del soleo',
      cues: [
        'Same as straight leg but bend the back knee',
        'Keep heel down',
        'Feel stretch lower in calf',
        'Hold, breathe'
      ],
      cuesIt: [
        'Come gamba dritta ma piega il ginocchio posteriore',
        'Mantieni il tallone giù',
        'Senti lo stretch più in basso nel polpaccio',
        'Tieni, respira'
      ]
    }
  ],
  
  progressionCriteria: [
    'Knee can reach 4-5 inches past toes',
    'Heels stay down during squat',
    'No compensatory movement'
  ],
  progressionCriteriaIt: [
    'Il ginocchio può raggiungere 10-12 cm oltre le dita',
    'I talloni restano giù durante lo squat',
    'Nessun movimento compensatorio'
  ],
  
  note: 'If you have limited ankle mobility, using heel elevation (squat shoes or plates) is a valid permanent solution, not just a "crutch".',
  noteIt: 'Se hai mobilità della caviglia limitata, usare rialzo talloni (scarpe da squat o dischi) è una soluzione permanente valida, non solo una "stampella".'
};

// ============================================================================
// FLEXION INTOLERANCE PROTOCOL (Context-Specific)
// ============================================================================

export const FLEXION_INTOLERANCE_PROTOCOL: CorrectiveProtocol = {
  id: 'flexion_intolerance',
  name: 'Flexion Sensitivity Protocol',
  nameIt: 'Protocollo Sensibilità alla Flessione',
  description: 'For those currently experiencing discomfort with spinal flexion. The goal is to RETURN to tolerating flexion, not avoid it forever.',
  descriptionIt: 'Per chi attualmente prova fastidio con la flessione spinale. L\'obiettivo è TORNARE a tollerare la flessione, non evitarla per sempre.',
  
  appropriateFor: [
    'Current discomfort with forward bending',
    'Discomfort during deadlifts or rows',
    'Temporary use during sensitive period'
  ],
  appropriateForIt: [
    'Fastidio attuale con la flessione in avanti',
    'Fastidio durante stacchi o rematori',
    'Uso temporaneo durante periodo sensibile'
  ],
  
  notAppropriateFor: [
    'General use for "injury prevention"',
    'Long-term avoidance of flexion',
    'Those without current flexion sensitivity'
  ],
  notAppropriateForIt: [
    'Uso generale per "prevenzione infortuni"',
    'Evitamento a lungo termine della flessione',
    'Chi non ha attuale sensibilità alla flessione'
  ],
  
  exercises: [
    {
      name: 'Hip Hinge Drill',
      nameIt: 'Esercizio Hip Hinge',
      sets: '3',
      reps: '10-15',
      rest: '30s',
      purpose: 'Learn to flex at hips, not spine',
      purposeIt: 'Imparare a flettere dalle anche, non dalla colonna',
      cues: [
        'Stand with back to wall, feet 6 inches away',
        'Push hips back to touch wall',
        'Keep spine neutral (not forced straight)',
        'Feel hamstrings stretch'
      ],
      cuesIt: [
        'In piedi con la schiena verso il muro, piedi a 15 cm',
        'Spingi le anche indietro per toccare il muro',
        'Mantieni la colonna neutra (non forzatamente dritta)',
        'Senti gli ischiocruali allungarsi'
      ],
      progression: 'Move feet further from wall, then add light stick on back',
      progressionIt: 'Allontana i piedi dal muro, poi aggiungi un bastone leggero sulla schiena'
    },
    {
      name: 'Dead Bug',
      nameIt: 'Dead Bug',
      sets: '3',
      reps: '8-10 per side',
      rest: '45s',
      purpose: 'Core control without spinal flexion',
      purposeIt: 'Controllo del core senza flessione spinale',
      cues: [
        'Lie on back, arms up, knees at 90°',
        'Press lower back gently into floor',
        'Extend opposite arm and leg',
        'Return with control, repeat other side'
      ],
      cuesIt: [
        'Sdraiato sulla schiena, braccia in alto, ginocchia a 90°',
        'Premi leggermente la bassa schiena nel pavimento',
        'Estendi braccio e gamba opposti',
        'Ritorna con controllo, ripeti dall\'altro lato'
      ]
    },
    {
      name: 'Cat-Cow (Modified - Emphasis on Control)',
      nameIt: 'Cat-Cow (Modificato - Enfasi sul Controllo)',
      sets: '2',
      reps: '8-10',
      rest: 'None',
      purpose: 'Gentle spinal movement with control',
      purposeIt: 'Movimento spinale delicato con controllo',
      cues: [
        'Quadruped position',
        'SLOWLY round spine (cat) - only as far as comfortable',
        'SLOWLY arch (cow) - only as far as comfortable',
        'Focus on control, not range'
      ],
      cuesIt: [
        'Posizione quadrupedica',
        'LENTAMENTE arrotonda la colonna (cat) - solo fin dove è comodo',
        'LENTAMENTE inarca (cow) - solo fin dove è comodo',
        'Concentrati sul controllo, non sul range'
      ]
    },
    {
      name: 'Goblet Squat (Depth Limited)',
      nameIt: 'Goblet Squat (Profondità Limitata)',
      sets: '3',
      reps: '8-10',
      rest: '60s',
      purpose: 'Maintain squat pattern with controlled depth',
      purposeIt: 'Mantenere il pattern dello squat con profondità controllata',
      cues: [
        'Hold light weight at chest',
        'Squat only as deep as you maintain control',
        'Don\'t force depth',
        'Progress depth as tolerance improves'
      ],
      cuesIt: [
        'Tieni un peso leggero al petto',
        'Squat solo fin dove mantieni il controllo',
        'Non forzare la profondità',
        'Progredisci la profondità man mano che la tolleranza migliora'
      ],
      progression: 'Gradually increase depth over sessions as comfort allows',
      progressionIt: 'Aumenta gradualmente la profondità nelle sessioni man mano che il comfort lo permette'
    }
  ],
  
  progressionCriteria: [
    'Can perform hip hinge without discomfort',
    'Squat depth improving without symptoms',
    'Ready to try light deadlifts or rows'
  ],
  progressionCriteriaIt: [
    'Può eseguire hip hinge senza fastidio',
    'Profondità squat in miglioramento senza sintomi',
    'Pronto a provare stacchi o rematori leggeri'
  ],
  
  note: 'IMPORTANT: This protocol is TEMPORARY. The goal is to return to normal training, not to avoid flexion permanently. Avoiding movement long-term can make sensitivity worse, not better.',
  noteIt: 'IMPORTANTE: Questo protocollo è TEMPORANEO. L\'obiettivo è tornare all\'allenamento normale, non evitare la flessione permanentemente. Evitare il movimento a lungo termine può peggiorare la sensibilità, non migliorarla.'
};

// ============================================================================
// EXTENSION INTOLERANCE PROTOCOL
// ============================================================================

export const EXTENSION_INTOLERANCE_PROTOCOL: CorrectiveProtocol = {
  id: 'extension_intolerance',
  name: 'Extension Sensitivity Protocol',
  nameIt: 'Protocollo Sensibilità all\'Estensione',
  description: 'For those currently experiencing discomfort with spinal extension. Temporary protocol to return to normal movement.',
  descriptionIt: 'Per chi attualmente prova fastidio con l\'estensione spinale. Protocollo temporaneo per tornare al movimento normale.',
  
  appropriateFor: [
    'Discomfort when arching back',
    'Discomfort during overhead work',
    'Temporary use during sensitive period'
  ],
  appropriateForIt: [
    'Fastidio quando si inarca la schiena',
    'Fastidio durante lavoro sopra la testa',
    'Uso temporaneo durante periodo sensibile'
  ],
  
  notAppropriateFor: [
    'General use for "injury prevention"',
    'Long-term avoidance',
    'Those without current extension sensitivity'
  ],
  notAppropriateForIt: [
    'Uso generale per "prevenzione infortuni"',
    'Evitamento a lungo termine',
    'Chi non ha attuale sensibilità all\'estensione'
  ],
  
  exercises: [
    {
      name: 'Child\'s Pose',
      nameIt: 'Posizione del Bambino',
      sets: '2-3',
      reps: '30-45s',
      rest: 'None',
      purpose: 'Gentle flexion stretch, reduces extension compression',
      purposeIt: 'Stretch in flessione delicato, riduce la compressione in estensione',
      cues: [
        'Knees wide, feet together',
        'Sit hips back toward heels',
        'Arms extended forward',
        'Breathe deeply, relax'
      ],
      cuesIt: [
        'Ginocchia larghe, piedi uniti',
        'Porta le anche indietro verso i talloni',
        'Braccia estese in avanti',
        'Respira profondamente, rilassati'
      ]
    },
    {
      name: 'Knees to Chest',
      nameIt: 'Ginocchia al Petto',
      sets: '2',
      reps: '30s',
      rest: 'None',
      purpose: 'Gentle lumbar flexion',
      purposeIt: 'Flessione lombare delicata',
      cues: [
        'Lie on back',
        'Bring both knees to chest',
        'Hold behind thighs or shins',
        'Gentle pull, no forcing'
      ],
      cuesIt: [
        'Sdraiato sulla schiena',
        'Porta entrambe le ginocchia al petto',
        'Tieni dietro le cosce o gli stinchi',
        'Tira delicatamente, senza forzare'
      ]
    },
    {
      name: 'Pelvic Tilts (Supine)',
      nameIt: 'Tilt del Bacino (Supino)',
      sets: '2',
      reps: '10-15',
      rest: '30s',
      purpose: 'Controlled spinal movement',
      purposeIt: 'Movimento spinale controllato',
      cues: [
        'Lie on back, knees bent, feet flat',
        'Gently flatten lower back into floor (posterior tilt)',
        'Then gently arch (anterior tilt)',
        'Small, controlled movements'
      ],
      cuesIt: [
        'Sdraiato sulla schiena, ginocchia piegate, piedi piatti',
        'Appiattisci delicatamente la bassa schiena nel pavimento (retroversione)',
        'Poi inarca delicatamente (anteroversione)',
        'Movimenti piccoli e controllati'
      ]
    },
    {
      name: 'Seated Overhead Press (Light)',
      nameIt: 'Press Sopra la Testa Seduto (Leggero)',
      sets: '3',
      reps: '10-12',
      rest: '60s',
      purpose: 'Maintain pressing pattern without excessive arch',
      purposeIt: 'Mantenere il pattern di spinta senza eccessivo arco',
      cues: [
        'Sit with back supported',
        'Press light weight overhead',
        'Keep core engaged, minimal arch',
        'Progress load as tolerance improves'
      ],
      cuesIt: [
        'Siediti con la schiena supportata',
        'Pressa un peso leggero sopra la testa',
        'Mantieni il core attivo, arco minimo',
        'Progredisci il carico man mano che la tolleranza migliora'
      ],
      progression: 'Gradually reduce back support, progress to standing',
      progressionIt: 'Riduci gradualmente il supporto alla schiena, progredisci a in piedi'
    }
  ],
  
  progressionCriteria: [
    'Can perform pelvic tilts without discomfort',
    'Overhead pressing improving',
    'Ready to try standing overhead work'
  ],
  progressionCriteriaIt: [
    'Può eseguire tilt del bacino senza fastidio',
    'Press sopra la testa in miglioramento',
    'Pronto a provare lavoro sopra la testa in piedi'
  ],
  
  note: 'IMPORTANT: This protocol is TEMPORARY. Extension is a normal movement that your body should tolerate.',
  noteIt: 'IMPORTANTE: Questo protocollo è TEMPORANEO. L\'estensione è un movimento normale che il tuo corpo dovrebbe tollerare.'
};

// ============================================================================
// GET APPROPRIATE PROTOCOL
// ============================================================================

export function getCorrectiveProtocol(
  situation: 'hip_mobility' | 'ankle_mobility' | 'flexion_intolerance' | 'extension_intolerance'
): CorrectiveProtocol {
  switch (situation) {
    case 'hip_mobility':
      return HIP_MOBILITY_PROTOCOL;
    case 'ankle_mobility':
      return ANKLE_MOBILITY_PROTOCOL;
    case 'flexion_intolerance':
      return FLEXION_INTOLERANCE_PROTOCOL;
    case 'extension_intolerance':
      return EXTENSION_INTOLERANCE_PROTOCOL;
    default:
      return HIP_MOBILITY_PROTOCOL;
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  HIP_MOBILITY_PROTOCOL,
  ANKLE_MOBILITY_PROTOCOL,
  FLEXION_INTOLERANCE_PROTOCOL,
  EXTENSION_INTOLERANCE_PROTOCOL,
  getCorrectiveProtocol
};
