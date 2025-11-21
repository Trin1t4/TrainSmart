/**
 * ANATOMICAL MOVEMENT TAXONOMY
 *
 * Sistema completo di classificazione anatomica dei movimenti per:
 * - Pain pattern detection
 * - Movement screening
 * - Exercise substitution
 * - Recovery protocols
 *
 * Basato su:
 * - McKenzie Method (directional preference)
 * - Sahrmann Movement System Impairment Syndromes
 * - Selective Functional Movement Assessment (SFMA)
 * - Orthopedic special tests
 */

// ============================================================================
// TYPES
// ============================================================================

export type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse' | 'combined';

export interface AnatomicalMovement {
  name: string;
  region: BodyRegion;
  plane: PlaneOfMotion;
  description: string;
  normalROM?: string; // Range of motion normale
  restrictions_indicate?: string[]; // Cosa indica una restrizione
  pain_indicates?: string[]; // Cosa indica dolore in questo movimento
}

export type BodyRegion =
  | 'cervical_spine'
  | 'thoracic_spine'
  | 'lumbar_spine'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'hip'
  | 'knee'
  | 'ankle';

// ============================================================================
// COLONNA VERTEBRALE - Movimenti
// ============================================================================

export const SPINAL_MOVEMENTS: Record<string, AnatomicalMovement> = {
  // SAGITTAL PLANE
  'spinal_flexion': {
    name: 'Flessione Spinale',
    region: 'lumbar_spine',
    plane: 'sagittal',
    description: 'Flessione anteriore della colonna (chin to chest, trunk forward)',
    normalROM: 'Lumbar: 40-60°, Cervical: 50-60°',
    pain_indicates: [
      'Disc herniation (posterior)',
      'Flexion intolerance',
      'Posterior annular tear',
      'Facet joint compression (if extension relieves)',
      'Hamstring tightness (se limitato)'
    ]
  },

  'spinal_extension': {
    name: 'Estensione Spinale',
    region: 'lumbar_spine',
    plane: 'sagittal',
    description: 'Estensione posteriore (arch back, look up)',
    normalROM: 'Lumbar: 20-30°, Cervical: 60-75°',
    pain_indicates: [
      'Facet joint arthritis',
      'Spinal stenosis',
      'Spondylolisthesis',
      'Extension intolerance',
      'Anterior disc migration (if flexion relieves)'
    ]
  },

  // FRONTAL PLANE
  'spinal_lateral_flexion_right': {
    name: 'Flessione Laterale Destra',
    region: 'lumbar_spine',
    plane: 'frontal',
    description: 'Inclinazione laterale verso destra',
    normalROM: 'Lumbar: 15-20° each side',
    pain_indicates: [
      'Quadratus lumborum strain (ipsilateral)',
      'Facet joint irritation',
      'SI joint dysfunction',
      'Disc lateral protrusion (contralateral)'
    ]
  },

  'spinal_lateral_flexion_left': {
    name: 'Flessione Laterale Sinistra',
    region: 'lumbar_spine',
    plane: 'frontal',
    description: 'Inclinazione laterale verso sinistra',
    normalROM: 'Lumbar: 15-20° each side',
    pain_indicates: [
      'Quadratus lumborum strain (ipsilateral)',
      'Facet joint irritation',
      'SI joint dysfunction',
      'Disc lateral protrusion (contralateral)'
    ]
  },

  // TRANSVERSE PLANE
  'spinal_rotation_right': {
    name: 'Rotazione Spinale Destra',
    region: 'thoracic_spine',
    plane: 'transverse',
    description: 'Rotazione assiale verso destra',
    normalROM: 'Thoracic: 35-50°, Lumbar: 5-10°',
    pain_indicates: [
      'Facet joint irritation',
      'Rib dysfunction',
      'Thoracic restriction',
      'Disc annular tear'
    ]
  },

  'spinal_rotation_left': {
    name: 'Rotazione Spinale Sinistra',
    region: 'thoracic_spine',
    plane: 'transverse',
    description: 'Rotazione assiale verso sinistra',
    normalROM: 'Thoracic: 35-50°, Lumbar: 5-10°',
    pain_indicates: [
      'Facet joint irritation',
      'Rib dysfunction',
      'Thoracic restriction',
      'Disc annular tear'
    ]
  },

  // COMBINED MOVEMENTS (Clinicamente più rilevanti!)
  'spinal_flexion_rotation_right': {
    name: 'Flessorotazione Destra',
    region: 'lumbar_spine',
    plane: 'combined',
    description: 'Flessione + rotazione destra (movimento più comune per ernia)',
    pain_indicates: [
      'Posterolateral disc herniation (common!)',
      'Facet joint irritation',
      'Multifidus strain',
      'HIGH RISK movement per disc pathology'
    ]
  },

  'spinal_flexion_rotation_left': {
    name: 'Flessorotazione Sinistra',
    region: 'lumbar_spine',
    plane: 'combined',
    description: 'Flessione + rotazione sinistra',
    pain_indicates: [
      'Posterolateral disc herniation (common!)',
      'Facet joint irritation',
      'Multifidus strain',
      'HIGH RISK movement per disc pathology'
    ]
  },

  // LOADING
  'spinal_axial_compression': {
    name: 'Compressione Assiale',
    region: 'lumbar_spine',
    plane: 'sagittal',
    description: 'Carico verticale sulla colonna (squat, overhead press)',
    pain_indicates: [
      'Disc degeneration',
      'Vertebral endplate fracture',
      'Facet joint arthritis',
      'Spinal stenosis'
    ]
  },

  'spinal_anterior_shear': {
    name: 'Forza di Taglio Anteriore',
    region: 'lumbar_spine',
    plane: 'sagittal',
    description: 'Forza che spinge vertebra in avanti (deadlift setup)',
    pain_indicates: [
      'Spondylolisthesis',
      'Pars interarticularis stress',
      'Facet joint irritation'
    ]
  }
};

// ============================================================================
// ANCA - Movimenti
// ============================================================================

export const HIP_MOVEMENTS: Record<string, AnatomicalMovement> = {
  // SAGITTAL
  'hip_flexion': {
    name: 'Flessione Anca',
    region: 'hip',
    plane: 'sagittal',
    description: 'Ginocchio verso petto',
    normalROM: '120-125° (knee bent), 80-90° (knee straight)',
    pain_indicates: [
      'Hip impingement (FAI) - se dolore anteriore',
      'Labral tear',
      'Hip flexor strain',
      'Psoas tendinopathy'
    ]
  },

  'hip_extension': {
    name: 'Estensione Anca',
    region: 'hip',
    plane: 'sagittal',
    description: 'Gamba indietro',
    normalROM: '10-15°',
    restrictions_indicate: [
      'Hip flexor tightness (psoas, rectus femoris)',
      'Anterior capsule restriction',
      'Thomas test positive'
    ]
  },

  // FRONTAL
  'hip_abduction': {
    name: 'Abduzione Anca',
    region: 'hip',
    plane: 'frontal',
    description: 'Gamba verso esterno',
    normalROM: '45-50°',
    pain_indicates: [
      'Gluteus medius/minimus strain',
      'Trochanteric bursitis',
      'IT band syndrome',
      'Hip abductor weakness (Trendelenburg)'
    ]
  },

  'hip_adduction': {
    name: 'Adduzione Anca',
    region: 'hip',
    plane: 'frontal',
    description: 'Gamba verso interno (cross midline)',
    normalROM: '20-30°',
    pain_indicates: [
      'Adductor strain (groin)',
      'Osteitis pubis',
      'Hip impingement (se combinato con flexion)'
    ]
  },

  // TRANSVERSE
  'hip_internal_rotation': {
    name: 'Rotazione Interna Anca',
    region: 'hip',
    plane: 'transverse',
    description: 'Piede verso interno',
    normalROM: '35-45°',
    pain_indicates: [
      'FAI (femoroacetabular impingement) - se combinato con flexion',
      'Labral tear',
      'Hip arthritis',
      'Piriformis syndrome (se limitato)'
    ],
    restrictions_indicate: [
      'Capsular restriction',
      'Bony impingement',
      'Femoral anteversion'
    ]
  },

  'hip_external_rotation': {
    name: 'Rotazione Esterna Anca',
    region: 'hip',
    plane: 'transverse',
    description: 'Piede verso esterno',
    normalROM: '45-60°',
    pain_indicates: [
      'Piriformis syndrome',
      'Deep gluteal syndrome',
      'Sciatic nerve irritation'
    ],
    restrictions_indicate: [
      'Anterior capsule tightness',
      'Femoral retroversion'
    ]
  },

  // COMBINED (Test Clinici)
  'hip_flexion_adduction_internal_rotation': {
    name: 'FADIR Test (Flexion-Adduction-Internal Rotation)',
    region: 'hip',
    plane: 'combined',
    description: 'Test impingement: flessione 90° + adduzione + rotazione interna',
    pain_indicates: [
      'FAI (femoroacetabular impingement) - GOLD STANDARD TEST',
      'Labral tear',
      'Hip arthritis',
      'Anterior hip pathology'
    ]
  },

  'hip_flexion_abduction_external_rotation': {
    name: 'FABER Test (Patrick Test)',
    region: 'hip',
    plane: 'combined',
    description: 'Tallone su ginocchio opposto, poi press ginocchio verso tavolo',
    pain_indicates: [
      'Hip pathology (dolore anteriore)',
      'SI joint dysfunction (dolore posteriore)',
      'Iliopsoas strain',
      'Sacroiliac joint pathology'
    ]
  }
};

// ============================================================================
// GINOCCHIO - Movimenti + Stress Tests
// ============================================================================

export const KNEE_MOVEMENTS: Record<string, AnatomicalMovement> = {
  'knee_flexion': {
    name: 'Flessione Ginocchio',
    region: 'knee',
    plane: 'sagittal',
    description: 'Tallone verso gluteo',
    normalROM: '130-140°',
    pain_indicates: [
      'Meniscal tear (posterior horn)',
      'Patellofemoral pain',
      'Baker cyst',
      'Hamstring strain (se limitato)'
    ]
  },

  'knee_extension': {
    name: 'Estensione Ginocchio',
    region: 'knee',
    plane: 'sagittal',
    description: 'Gamba dritta',
    normalROM: '0° (full extension)',
    restrictions_indicate: [
      'Meniscal tear (anterior horn)',
      'ACL reconstruction (post-op)',
      'Quad weakness',
      'Joint effusion (swelling)'
    ]
  },

  'knee_valgus_stress': {
    name: 'Stress in Valgo',
    region: 'knee',
    plane: 'frontal',
    description: 'Ginocchio spinto verso interno',
    pain_indicates: [
      'MCL sprain/tear',
      'Medial meniscus tear',
      'Pes anserine bursitis',
      'Valgus instability'
    ]
  },

  'knee_varus_stress': {
    name: 'Stress in Varo',
    region: 'knee',
    plane: 'frontal',
    description: 'Ginocchio spinto verso esterno',
    pain_indicates: [
      'LCL sprain/tear',
      'Lateral meniscus tear',
      'IT band syndrome',
      'Varus instability'
    ]
  },

  'knee_anterior_translation': {
    name: 'Traslazione Anteriore (Lachman)',
    region: 'knee',
    plane: 'sagittal',
    description: 'Tibia traslata in avanti su femore',
    pain_indicates: [
      'ACL tear (GOLD STANDARD TEST)',
      'ACL insufficiency',
      'Anterior instability'
    ]
  },

  'knee_rotation_on_flexion': {
    name: 'Rotazione su Ginocchio Flesso (McMurray)',
    region: 'knee',
    plane: 'transverse',
    description: 'Rotazione tibia con ginocchio flesso',
    pain_indicates: [
      'Meniscal tear (medial or lateral)',
      'Clicking/popping = tear likely'
    ]
  },

  'patellofemoral_compression': {
    name: 'Compressione Patellofemorale',
    region: 'knee',
    plane: 'sagittal',
    description: 'Pressione su rotula con quad contraction',
    pain_indicates: [
      'Patellofemoral pain syndrome (PFPS)',
      'Chondromalacia patellae',
      'Patellar tracking disorder'
    ]
  }
};

// ============================================================================
// SPALLA - Movimenti
// ============================================================================

export const SHOULDER_MOVEMENTS: Record<string, AnatomicalMovement> = {
  // SAGITTAL
  'shoulder_flexion': {
    name: 'Flessione Spalla',
    region: 'shoulder',
    plane: 'sagittal',
    description: 'Braccio in avanti e verso alto',
    normalROM: '160-180°',
    pain_indicates: [
      'Subacromial impingement (60-120° = painful arc)',
      'Rotator cuff tendinopathy',
      'Biceps tendinopathy',
      'AC joint arthritis (>120°)'
    ]
  },

  'shoulder_extension': {
    name: 'Estensione Spalla',
    region: 'shoulder',
    plane: 'sagittal',
    description: 'Braccio indietro',
    normalROM: '50-60°',
    pain_indicates: [
      'Anterior shoulder strain',
      'Pec major/minor tightness (se limitato)'
    ]
  },

  // FRONTAL
  'shoulder_abduction': {
    name: 'Abduzione Spalla',
    region: 'shoulder',
    plane: 'frontal',
    description: 'Braccio verso esterno (lato)',
    normalROM: '170-180°',
    pain_indicates: [
      'Subacromial impingement (PAINFUL ARC 60-120°)',
      'Rotator cuff tear (supraspinatus)',
      'AC joint arthritis (>120°)',
      'Adhesive capsulitis (frozen shoulder - se molto limitato)'
    ]
  },

  'shoulder_adduction': {
    name: 'Adduzione Spalla',
    region: 'shoulder',
    plane: 'frontal',
    description: 'Braccio verso corpo',
    normalROM: '30-50°',
    pain_indicates: [
      'Lat/teres strain',
      'Posterior capsule restriction'
    ]
  },

  // TRANSVERSE
  'shoulder_horizontal_abduction': {
    name: 'Abduzione Orizzontale',
    region: 'shoulder',
    plane: 'transverse',
    description: 'Braccio indietro a 90° (scarfold stretch)',
    normalROM: '45° past neutral',
    pain_indicates: [
      'Posterior rotator cuff strain',
      'Posterior labral tear',
      'Supraspinatus impingement (se combinato con IR)'
    ]
  },

  'shoulder_horizontal_adduction': {
    name: 'Adduzione Orizzontale',
    region: 'shoulder',
    plane: 'transverse',
    description: 'Braccio attraverso petto',
    normalROM: '130-135°',
    pain_indicates: [
      'AC joint pathology',
      'Pec major/minor strain',
      'Anterior capsule restriction'
    ]
  },

  // ROTATIONS
  'shoulder_internal_rotation': {
    name: 'Rotazione Interna',
    region: 'shoulder',
    plane: 'transverse',
    description: 'Mano dietro schiena',
    normalROM: '70-90°',
    pain_indicates: [
      'Subscapularis tendinopathy (Lift-off test)',
      'Posterior capsule tightness (se limitato)',
      'Internal impingement (overhead athletes)'
    ]
  },

  'shoulder_external_rotation': {
    name: 'Rotazione Esterna',
    region: 'shoulder',
    plane: 'transverse',
    description: 'Mano dietro testa',
    normalROM: '80-90°',
    pain_indicates: [
      'Infraspinatus/teres minor strain',
      'Anterior instability (apprehension)',
      'Anterior capsule tightness (se limitato)'
    ]
  },

  // COMBINED MOVEMENTS (Test Clinici)
  'shoulder_flexion_internal_rotation': {
    name: 'Neer Test (Impingement)',
    region: 'shoulder',
    plane: 'combined',
    description: 'Flessione passiva completa con braccio intra-ruotato',
    pain_indicates: [
      'Subacromial impingement (GOLD STANDARD)',
      'Rotator cuff tendinopathy',
      'Subacromial bursitis'
    ]
  },

  'shoulder_abduction_internal_rotation': {
    name: 'Empty Can Test (Jobe)',
    region: 'shoulder',
    plane: 'combined',
    description: 'Abduzione 90° con pollice verso basso (empty can)',
    pain_indicates: [
      'Supraspinatus tendinopathy/tear',
      'Weakness = possible tear'
    ]
  },

  'shoulder_horizontal_adduction_internal_rotation': {
    name: 'Hawkins-Kennedy Test',
    region: 'shoulder',
    plane: 'combined',
    description: '90° flessione, poi rotazione interna',
    pain_indicates: [
      'Supraspinatus impingement',
      'Subacromial bursa inflammation'
    ]
  },

  'shoulder_abduction_external_rotation': {
    name: 'Apprehension Test',
    region: 'shoulder',
    plane: 'combined',
    description: 'Abduzione 90° + rotazione esterna (throwing position)',
    pain_indicates: [
      'Anterior instability',
      'Anterior labral tear (Bankart lesion)',
      'Feeling of subluxation = positive test'
    ]
  }
};

// ============================================================================
// ANKLE - Movimenti
// ============================================================================

export const ANKLE_MOVEMENTS: Record<string, AnatomicalMovement> = {
  'ankle_dorsiflexion': {
    name: 'Dorsiflessione',
    region: 'ankle',
    plane: 'sagittal',
    description: 'Piede verso tibia (toes up)',
    normalROM: '20° (knee extended), 30° (knee flexed)',
    restrictions_indicate: [
      'Gastrocnemius tightness (se limitato a knee extended)',
      'Soleus tightness (se limitato anche a knee flexed)',
      'Anterior ankle impingement',
      'CRITICAL per squat depth!'
    ]
  },

  'ankle_plantarflexion': {
    name: 'Plantarflessione',
    region: 'ankle',
    plane: 'sagittal',
    description: 'Piede punta verso basso',
    normalROM: '50°',
    pain_indicates: [
      'Achilles tendinopathy',
      'Posterior ankle impingement',
      'Gastrocnemius/soleus strain'
    ]
  },

  'ankle_inversion': {
    name: 'Inversione',
    region: 'ankle',
    plane: 'frontal',
    description: 'Pianta piede verso interno',
    normalROM: '35°',
    pain_indicates: [
      'Lateral ankle sprain (most common!)',
      'ATFL/CFL ligament injury',
      'Peroneal tendinopathy'
    ]
  },

  'ankle_eversion': {
    name: 'Eversione',
    region: 'ankle',
    plane: 'frontal',
    description: 'Pianta piede verso esterno',
    normalROM: '15°',
    pain_indicates: [
      'Medial ankle sprain (deltoid ligament)',
      'Posterior tibialis tendinopathy'
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Ottieni tutti i movimenti per una regione corporea
 */
export function getMovementsByRegion(region: BodyRegion): AnatomicalMovement[] {
  const allMovements = [
    ...Object.values(SPINAL_MOVEMENTS),
    ...Object.values(HIP_MOVEMENTS),
    ...Object.values(KNEE_MOVEMENTS),
    ...Object.values(SHOULDER_MOVEMENTS),
    ...Object.values(ANKLE_MOVEMENTS)
  ];

  return allMovements.filter(m => m.region === region);
}

/**
 * Ottieni movimenti per piano di movimento
 */
export function getMovementsByPlane(plane: PlaneOfMotion): AnatomicalMovement[] {
  const allMovements = [
    ...Object.values(SPINAL_MOVEMENTS),
    ...Object.values(HIP_MOVEMENTS),
    ...Object.values(KNEE_MOVEMENTS),
    ...Object.values(SHOULDER_MOVEMENTS),
    ...Object.values(ANKLE_MOVEMENTS)
  ];

  return allMovements.filter(m => m.plane === plane);
}

/**
 * Cerca movimento per nome (fuzzy)
 */
export function findMovement(searchTerm: string): AnatomicalMovement | null {
  const allMovements = {
    ...SPINAL_MOVEMENTS,
    ...HIP_MOVEMENTS,
    ...KNEE_MOVEMENTS,
    ...SHOULDER_MOVEMENTS,
    ...ANKLE_MOVEMENTS
  };

  const key = Object.keys(allMovements).find(k =>
    k.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allMovements[k].name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return key ? allMovements[key] : null;
}

/**
 * Export completo per facilità d'uso
 */
export const ALL_MOVEMENTS = {
  spinal: SPINAL_MOVEMENTS,
  hip: HIP_MOVEMENTS,
  knee: KNEE_MOVEMENTS,
  shoulder: SHOULDER_MOVEMENTS,
  ankle: ANKLE_MOVEMENTS
};

export default {
  SPINAL_MOVEMENTS,
  HIP_MOVEMENTS,
  KNEE_MOVEMENTS,
  SHOULDER_MOVEMENTS,
  ANKLE_MOVEMENTS,
  getMovementsByRegion,
  getMovementsByPlane,
  findMovement,
  ALL_MOVEMENTS
};
