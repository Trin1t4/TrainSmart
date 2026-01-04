/**
 * Pathology-Specific Pain Profiles
 * Gestione differenziata per patologie comuni
 *
 * Basato su:
 * - Clinical Practice Guidelines (JOSPT, APTA)
 * - Evidence-based rehabilitation protocols
 * - Sports medicine literature
 */

// ============================================================================
// TYPES
// ============================================================================

export type KneePathology =
  | 'acl_reconstruction'
  | 'pcl_injury'
  | 'meniscus_tear'
  | 'patellofemoral_syndrome'
  | 'patellar_tendinopathy'
  | 'quadriceps_tendinopathy'
  | 'it_band_syndrome'
  | 'osteoarthritis'
  | 'mcl_sprain'
  | 'lcl_sprain'
  | 'bakers_cyst'
  | 'general_knee_pain';

export type ShoulderPathology =
  | 'rotator_cuff_tear'
  | 'rotator_cuff_tendinopathy'
  | 'subacromial_impingement'
  | 'labrum_tear_slap'
  | 'labrum_tear_bankart'
  | 'frozen_shoulder'
  | 'ac_joint_injury'
  | 'instability_anterior'
  | 'instability_posterior'
  | 'instability_multidirectional'
  | 'biceps_tendinopathy'
  | 'thoracic_outlet'
  | 'general_shoulder_pain';

export type LowerBackPathology =
  | 'herniated_disc_flexion_intolerant'
  | 'herniated_disc_extension_intolerant'
  | 'spinal_stenosis'
  | 'spondylolisthesis'
  | 'spondylolysis'
  | 'facet_joint_dysfunction'
  | 'si_joint_dysfunction'
  | 'muscle_strain'
  | 'sciatica'
  | 'piriformis_syndrome'
  | 'general_lower_back_pain';

export type HipPathology =
  | 'hip_impingement_fai'
  | 'labral_tear'
  | 'hip_osteoarthritis'
  | 'greater_trochanteric_bursitis'
  | 'hip_flexor_strain'
  | 'adductor_strain'
  | 'gluteal_tendinopathy'
  | 'general_hip_pain';

export type AllPathologies = KneePathology | ShoulderPathology | LowerBackPathology | HipPathology;

export interface PathologyProfile {
  id: AllPathologies;
  name: string;
  nameIt: string;
  area: 'knee' | 'shoulder' | 'lower_back' | 'hip';

  description: string;
  descriptionIt: string;

  // Esercizi da evitare assolutamente
  avoidExercises: string[];

  // Pattern di movimento da evitare
  avoidPatterns: string[];

  // Esercizi CONSIGLIATI (terapeutici)
  recommendedExercises: string[];

  // Modifiche da applicare agli esercizi permessi
  modifications: {
    exercise: string;
    modification: string;
    modificationIt: string;
    romLimit?: number;
    loadReduction?: number;
    tempoChange?: string;
  }[];

  // Screening questions per identificare la patologia
  screeningQuestions: {
    question: string;
    questionIt: string;
    yesIndicates: boolean;
    weight: number;
  }[];

  // Progressione consigliata
  progressionCriteria: string[];

  // Red flags che richiedono consulto medico
  redFlags?: string[];
}

// Exercise interface per il type checking
interface Exercise {
  name: string;
  tags?: string[];
  [key: string]: unknown;
}

// ============================================================================
// KNEE PATHOLOGY PROFILES
// ============================================================================

export const KNEE_PATHOLOGY_PROFILES: Record<KneePathology, PathologyProfile> = {

  acl_reconstruction: {
    id: 'acl_reconstruction',
    name: 'ACL Reconstruction',
    nameIt: 'Ricostruzione LCA',
    area: 'knee',
    description: 'Post-ACL reconstruction rehabilitation. Focus on controlled loading, avoid cutting and pivoting until cleared.',
    descriptionIt: 'Riabilitazione post-ricostruzione LCA. Focus su carico controllato, evitare cambi direzione fino a clearance.',

    avoidExercises: [
      'Single Leg Plyometrics (uncontrolled)',
      'Cutting Drills',
      'Pivot Sports (basketball, soccer)',
      'Deep Single Leg Squats (pistol)',
      'High Box Jumps',
      'Depth Jumps'
    ],

    avoidPatterns: [
      'knee_anterior_translation',
      'knee_rotation_loaded',
      'rapid_deceleration',
      'lateral_cutting'
    ],

    recommendedExercises: [
      'Terminal Knee Extension (TKE)',
      'Quad Sets',
      'Straight Leg Raises (all directions)',
      'Wall Sits',
      'Mini Squats (0-60°)',
      'Step-ups (controlled)',
      'Single Leg Balance',
      'Hamstring Curls',
      'Hip Abduction/Adduction',
      'Calf Raises',
      'Stationary Bike',
      'Pool Walking/Running'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Limit depth to 60-90° knee flexion initially, progress over 12 weeks',
        modificationIt: 'Limitare profondità a 60-90° inizialmente, progredire in 12 settimane',
        romLimit: 90
      },
      {
        exercise: 'Lunge',
        modification: 'Start with reverse lunges (more control), limit depth',
        modificationIt: 'Iniziare con affondi indietro (più controllo), limitare profondità',
        romLimit: 75
      },
      {
        exercise: 'Leg Press',
        modification: 'Limit ROM, focus on quad activation without full extension',
        modificationIt: 'Limitare ROM, focus su attivazione quadricipite senza estensione completa',
        romLimit: 90
      }
    ],

    screeningQuestions: [
      {
        question: 'Have you had ACL reconstruction surgery?',
        questionIt: 'Hai avuto un intervento di ricostruzione del LCA?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Do you feel instability when pivoting or changing direction?',
        questionIt: 'Senti instabilità quando cambi direzione o ruoti?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Did your knee "give way" during a sports activity?',
        questionIt: 'Il ginocchio ha "ceduto" durante attività sportiva?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Quad strength >80% of contralateral',
      'Full ROM achieved',
      'No effusion',
      'Single leg hop test >85%',
      'Cleared by physician'
    ],

    redFlags: [
      'Sudden increase in swelling',
      'Feeling of instability',
      'Locking or catching',
      'Unable to fully extend knee'
    ]
  },

  patellofemoral_syndrome: {
    id: 'patellofemoral_syndrome',
    name: 'Patellofemoral Pain Syndrome',
    nameIt: 'Sindrome Femoro-Rotulea',
    area: 'knee',
    description: 'Anterior knee pain from patella tracking issues. Avoid deep flexion loading, focus on hip and quad strengthening.',
    descriptionIt: 'Dolore anteriore ginocchio da problemi di tracking rotuleo. Evitare carico in flessione profonda, focus su rinforzo anca e quadricipite.',

    avoidExercises: [
      'Leg Extension (full ROM)',
      'Deep Squats (ass-to-grass)',
      'Pistol Squats',
      'Deep Lunges',
      'Step-downs (high box)',
      'Stairs Running'
    ],

    avoidPatterns: [
      'patellofemoral_compression',
      'knee_flexion_deep_loaded'
    ],

    recommendedExercises: [
      'Spanish Squat (CORNERSTONE)',
      'Terminal Knee Extension',
      'Wall Sit (parallel)',
      'Box Squat (to parallel)',
      'Step-ups (controlled)',
      'Hip Abduction (clamshells, band walks)',
      'Hip Thrust',
      'Romanian Deadlift',
      'Single Leg Balance',
      'VMO Activation Drills'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Use Spanish Squat or limit depth to parallel. Avoid deep flexion.',
        modificationIt: 'Usa Spanish Squat o limita profondità a parallelo. Evita flessione profonda.',
        romLimit: 90
      },
      {
        exercise: 'Leg Extension',
        modification: 'Limit ROM to 90-45° (terminal extension only)',
        modificationIt: 'Limitare ROM a 90-45° (solo estensione terminale)',
        romLimit: 45
      },
      {
        exercise: 'Leg Press',
        modification: 'Limit ROM to 90° knee flexion, do not go deeper',
        modificationIt: 'Limitare ROM a 90° flessione ginocchio',
        romLimit: 90
      },
      {
        exercise: 'Lunge',
        modification: 'Use reverse lunges with limited depth, avoid forward lunges initially',
        modificationIt: 'Usa affondi indietro con profondità limitata, evita affondi in avanti inizialmente'
      }
    ],

    screeningQuestions: [
      {
        question: 'Is your knee pain worse when going down stairs?',
        questionIt: 'Il dolore peggiora scendendo le scale?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does your knee hurt after sitting for a long time (movie sign)?',
        questionIt: 'Il ginocchio fa male dopo essere stato seduto a lungo?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Is the pain located at the front of your knee, around or under the kneecap?',
        questionIt: 'Il dolore è localizzato nella parte anteriore, intorno o sotto la rotula?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does squatting deeply increase your pain?',
        questionIt: 'Accovacciarsi profondamente aumenta il dolore?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Can squat to 90° pain-free',
      'Stairs pain-free both directions',
      'Hip abductor strength normalized',
      'No morning stiffness'
    ],

    redFlags: [
      'Locking or catching',
      'Significant swelling',
      'Buckling episodes',
      'No improvement after 12 weeks'
    ]
  },

  patellar_tendinopathy: {
    id: 'patellar_tendinopathy',
    name: 'Patellar Tendinopathy (Jumper\'s Knee)',
    nameIt: 'Tendinopatia Rotulea',
    area: 'knee',
    description: 'Tendinopathy at the patellar tendon. Eccentric loading is therapeutic. Avoid high-impact initially.',
    descriptionIt: 'Tendinopatia al tendine rotuleo. Il carico eccentrico è terapeutico. Evitare alto impatto inizialmente.',

    avoidExercises: [
      'Box Jumps (high)',
      'Depth Jumps',
      'Running (initially)',
      'Sprinting',
      'High-rep Jump Squats'
    ],

    avoidPatterns: [
      'high_impact_landing',
      'explosive_knee_extension'
    ],

    recommendedExercises: [
      'Eccentric Decline Squats (CORNERSTONE - 3x15, slow 3-4 sec eccentric)',
      'Spanish Squat',
      'Isometric Wall Sit (45°, 5x45sec)',
      'Single Leg Decline Squat (eccentric)',
      'Heavy Slow Resistance (HSR) Squats',
      'Leg Press (slow eccentric)',
      'Step-ups',
      'Hip Strengthening'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Use decline board, slow 3-4 sec eccentric phase. This is therapeutic.',
        modificationIt: 'Usa tavola inclinata, eccentrica lenta 3-4 sec. Questo è terapeutico.',
        tempoChange: '4-0-1-0'
      },
      {
        exercise: 'Leg Press',
        modification: 'Slow eccentric (4 sec), moderate weight, avoid bouncing',
        modificationIt: 'Eccentrica lenta (4 sec), peso moderato, evita rimbalzi',
        tempoChange: '4-0-1-0'
      },
      {
        exercise: 'Jump',
        modification: 'Replace with low-impact alternatives until pain < 3/10',
        modificationIt: 'Sostituisci con alternative a basso impatto fino a dolore < 3/10'
      }
    ],

    screeningQuestions: [
      {
        question: 'Is the pain located at the bottom of your kneecap (where tendon attaches)?',
        questionIt: 'Il dolore è localizzato in fondo alla rotula (dove si attacca il tendine)?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does the pain increase with jumping activities?',
        questionIt: 'Il dolore aumenta con attività di salto?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Is there pain when pressing on the tendon below your kneecap?',
        questionIt: 'C\'è dolore alla pressione sul tendine sotto la rotula?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Does the pain "warm up" and reduce during activity, then worsen after?',
        questionIt: 'Il dolore "si scalda" e si riduce durante l\'attività, poi peggiora dopo?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Pain < 3/10 during eccentric loading',
      'Can single leg squat pain-free',
      'VISA-P score > 80',
      'Can tolerate progressive jump training'
    ],

    redFlags: [
      'Complete tendon rupture',
      'Severe pain at rest',
      'Significant swelling',
      'No improvement after 12 weeks of eccentric protocol'
    ]
  },

  meniscus_tear: {
    id: 'meniscus_tear',
    name: 'Meniscus Tear',
    nameIt: 'Lesione Meniscale',
    area: 'knee',
    description: 'Meniscal injury (medial or lateral). Avoid deep flexion and rotation. Focus on quad strengthening.',
    descriptionIt: 'Lesione meniscale (mediale o laterale). Evitare flessione profonda e rotazione. Focus su rinforzo quadricipite.',

    avoidExercises: [
      'Deep Squats',
      'Duck Walks',
      'Sitting Cross-legged',
      'Kneeling Exercises',
      'Rotational Movements Under Load',
      'Running (initially)'
    ],

    avoidPatterns: [
      'knee_rotation_loaded',
      'knee_flexion_deep_loaded',
      'meniscal_compression'
    ],

    recommendedExercises: [
      'Quad Sets',
      'Straight Leg Raises',
      'Terminal Knee Extension',
      'Mini Squats (0-60°)',
      'Leg Press (limited ROM)',
      'Stationary Bike',
      'Pool Walking',
      'Hip Strengthening'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Limit depth to 60-70° initially, no rotation at bottom',
        modificationIt: 'Limitare profondità a 60-70° inizialmente, nessuna rotazione',
        romLimit: 70
      },
      {
        exercise: 'Lunge',
        modification: 'Avoid deep lunges, keep torso upright, no twisting',
        modificationIt: 'Evitare affondi profondi, torso dritto, nessuna torsione',
        romLimit: 60
      }
    ],

    screeningQuestions: [
      {
        question: 'Do you feel clicking, popping, or catching in your knee?',
        questionIt: 'Senti click, schiocchi o blocchi nel ginocchio?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does your knee lock in a bent position?',
        questionIt: 'Il ginocchio si blocca in posizione piegata?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Is the pain on the inner or outer side of your knee joint?',
        questionIt: 'Il dolore è sul lato interno o esterno del ginocchio?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Did the pain start after a twisting injury?',
        questionIt: 'Il dolore è iniziato dopo un trauma in torsione?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'No locking or catching',
      'Full ROM achieved',
      'Can squat to 90° without pain',
      'No effusion'
    ],

    redFlags: [
      'Knee locking',
      'Unable to fully extend',
      'Significant swelling',
      'Giving way'
    ]
  },

  it_band_syndrome: {
    id: 'it_band_syndrome',
    name: 'IT Band Syndrome',
    nameIt: 'Sindrome della Bandelletta Ileotibiale',
    area: 'knee',
    description: 'Lateral knee pain from IT band friction. Focus on hip strengthening, avoid aggravating activities.',
    descriptionIt: 'Dolore laterale ginocchio da attrito bandelletta. Focus su rinforzo anca, evitare attività aggravanti.',

    avoidExercises: [
      'Running (initially)',
      'Cycling (high resistance)',
      'Stair Climbing',
      'Downhill Running/Walking'
    ],

    avoidPatterns: [
      'knee_flexion_30_degrees',
      'repetitive_knee_flexion_extension'
    ],

    recommendedExercises: [
      'Hip Abduction (CORNERSTONE)',
      'Clamshells',
      'Side-lying Hip Abduction',
      'Monster Walks',
      'Single Leg Balance',
      'Hip Thrust',
      'Glute Bridge',
      'Foam Rolling IT Band',
      'Hip Flexor Stretching'
    ],

    modifications: [
      {
        exercise: 'Running',
        modification: 'Reduce mileage, avoid downhill, strengthen hips first',
        modificationIt: 'Riduci chilometraggio, evita discese, rinforza anche prima'
      },
      {
        exercise: 'Cycling',
        modification: 'Adjust seat height, reduce resistance, check cleat position',
        modificationIt: 'Regola altezza sella, riduci resistenza, controlla posizione tacchette'
      }
    ],

    screeningQuestions: [
      {
        question: 'Is your pain on the outside of your knee?',
        questionIt: 'Il dolore è all\'esterno del ginocchio?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does the pain occur during running or cycling?',
        questionIt: 'Il dolore si presenta durante corsa o ciclismo?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does the pain start at a consistent distance into your run?',
        questionIt: 'Il dolore inizia sempre alla stessa distanza di corsa?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Is the pain worse going downhill?',
        questionIt: 'Il dolore è peggiore in discesa?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Can run 3km pain-free',
      'Hip abductor strength >20% contralateral',
      'No pain with daily activities',
      'Negative Ober test'
    ]
  },

  osteoarthritis: {
    id: 'osteoarthritis',
    name: 'Knee Osteoarthritis',
    nameIt: 'Artrosi del Ginocchio',
    area: 'knee',
    description: 'Degenerative joint disease. Movement is medicine. Avoid high impact, focus on strengthening.',
    descriptionIt: 'Malattia degenerativa articolare. Il movimento è medicina. Evitare alto impatto, focus su rinforzo.',

    avoidExercises: [
      'High Impact Jumping',
      'Running on Hard Surfaces',
      'Deep Squats (heavy)',
      'Leg Extension (heavy, full ROM)'
    ],

    avoidPatterns: [
      'high_impact',
      'deep_knee_flexion_heavy'
    ],

    recommendedExercises: [
      'Walking',
      'Swimming',
      'Cycling',
      'Partial Squats',
      'Leg Press (controlled ROM)',
      'Step-ups (low)',
      'Straight Leg Raises',
      'Hip Strengthening',
      'Calf Raises',
      'Water Aerobics'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Limit depth to comfort, use box squat, reduce weight',
        modificationIt: 'Limitare profondità a comfort, usa box squat, riduci peso',
        loadReduction: 30
      },
      {
        exercise: 'Lunge',
        modification: 'Use shallow lunges or replace with step-ups',
        modificationIt: 'Usa affondi corti o sostituisci con step-up'
      }
    ],

    screeningQuestions: [
      {
        question: 'Do you have stiffness in the morning that improves with movement?',
        questionIt: 'Hai rigidità mattutina che migliora con il movimento?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Has a doctor diagnosed you with osteoarthritis?',
        questionIt: 'Un medico ti ha diagnosticato artrosi?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does your knee creak or grind with movement?',
        questionIt: 'Il ginocchio scricchiola o stride durante il movimento?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Are you over 50 years old?',
        questionIt: 'Hai più di 50 anni?',
        yesIndicates: true,
        weight: 1
      }
    ],

    progressionCriteria: [
      'Pain < 3/10 during daily activities',
      'Can walk 30min without pain',
      'Quad strength improved',
      'Morning stiffness < 30min'
    ]
  },

  pcl_injury: {
    id: 'pcl_injury',
    name: 'PCL Injury',
    nameIt: 'Lesione LCP',
    area: 'knee',
    description: 'Posterior cruciate ligament injury. Avoid posterior tibial stress.',
    descriptionIt: 'Lesione legamento crociato posteriore. Evitare stress tibiale posteriore.',
    avoidExercises: ['Deep Lunges', 'Leg Curl (heavy)'],
    avoidPatterns: ['posterior_tibial_translation'],
    recommendedExercises: ['Quad strengthening', 'Hip strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  quadriceps_tendinopathy: {
    id: 'quadriceps_tendinopathy',
    name: 'Quadriceps Tendinopathy',
    nameIt: 'Tendinopatia Quadricipitale',
    area: 'knee',
    description: 'Tendinopathy at the quadriceps tendon above patella.',
    descriptionIt: 'Tendinopatia al tendine del quadricipite sopra la rotula.',
    avoidExercises: ['Heavy squats initially', 'Jump squats'],
    avoidPatterns: ['explosive_knee_extension'],
    recommendedExercises: ['Isometric quad holds', 'Eccentric squats', 'Wall sits'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  mcl_sprain: {
    id: 'mcl_sprain',
    name: 'MCL Sprain',
    nameIt: 'Distorsione LCM',
    area: 'knee',
    description: 'Medial collateral ligament sprain.',
    descriptionIt: 'Distorsione legamento collaterale mediale.',
    avoidExercises: ['Lateral movements initially', 'Wide stance squats'],
    avoidPatterns: ['knee_valgus_stress'],
    recommendedExercises: ['Quad strengthening', 'Hip strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  lcl_sprain: {
    id: 'lcl_sprain',
    name: 'LCL Sprain',
    nameIt: 'Distorsione LCL',
    area: 'knee',
    description: 'Lateral collateral ligament sprain.',
    descriptionIt: 'Distorsione legamento collaterale laterale.',
    avoidExercises: ['Lateral movements initially'],
    avoidPatterns: ['knee_varus_stress'],
    recommendedExercises: ['Hip strengthening', 'Balance training'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  bakers_cyst: {
    id: 'bakers_cyst',
    name: "Baker's Cyst",
    nameIt: 'Cisti di Baker',
    area: 'knee',
    description: 'Fluid-filled cyst behind knee.',
    descriptionIt: 'Cisti piena di liquido dietro il ginocchio.',
    avoidExercises: ['Deep squats', 'Full knee flexion'],
    avoidPatterns: ['knee_flexion_deep'],
    recommendedExercises: ['Gentle ROM', 'Quad strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  general_knee_pain: {
    id: 'general_knee_pain',
    name: 'General Knee Pain',
    nameIt: 'Dolore Generico al Ginocchio',
    area: 'knee',
    description: 'Non-specific knee pain. Conservative management.',
    descriptionIt: 'Dolore al ginocchio non specifico. Gestione conservativa.',
    avoidExercises: [],
    avoidPatterns: [],
    recommendedExercises: ['Quad strengthening', 'Hip strengthening', 'Low impact cardio'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  }
};

// ============================================================================
// SHOULDER PATHOLOGY PROFILES
// ============================================================================

export const SHOULDER_PATHOLOGY_PROFILES: Record<ShoulderPathology, PathologyProfile> = {

  rotator_cuff_tendinopathy: {
    id: 'rotator_cuff_tendinopathy',
    name: 'Rotator Cuff Tendinopathy',
    nameIt: 'Tendinopatia Cuffia dei Rotatori',
    area: 'shoulder',
    description: 'Tendinopathy of rotator cuff muscles. Focus on scapular control and external rotation strengthening.',
    descriptionIt: 'Tendinopatia dei muscoli della cuffia. Focus su controllo scapolare e rinforzo rotazione esterna.',

    avoidExercises: [
      'Upright Rows (ALWAYS AVOID)',
      'Behind Neck Press',
      'Behind Neck Pulldown',
      'Wide Grip Bench (very wide)',
      'Dips (deep, initially)'
    ],

    avoidPatterns: [
      'shoulder_internal_rotation_loaded',
      'overhead_end_range_loaded'
    ],

    recommendedExercises: [
      'External Rotation (CORNERSTONE)',
      'Face Pulls (CORNERSTONE)',
      'Band Pull-aparts',
      'Prone Y-T-W',
      'Serratus Punches',
      'Wall Slides',
      'Landmine Press',
      'Floor Press',
      'Neutral Grip Press'
    ],

    modifications: [
      {
        exercise: 'Bench Press',
        modification: 'Use neutral or close grip, limit depth (elbows to 90°), retract scapulae',
        modificationIt: 'Usa presa neutra o stretta, limita profondità (gomiti a 90°), retrai scapole',
        romLimit: 90
      },
      {
        exercise: 'Overhead Press',
        modification: 'Use landmine press or seated press with back support, limit ROM',
        modificationIt: 'Usa landmine press o pressa seduta con supporto, limita ROM'
      },
      {
        exercise: 'Lateral Raise',
        modification: 'Use thumbs up position, limit to 80°, reduce weight',
        modificationIt: 'Usa posizione pollici in su, limita a 80°, riduci peso',
        romLimit: 80,
        loadReduction: 30
      }
    ],

    screeningQuestions: [
      {
        question: 'Do you have pain when raising your arm to the side?',
        questionIt: 'Hai dolore quando alzi il braccio di lato?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Is there a "painful arc" between 60-120° of arm raising?',
        questionIt: 'C\'è un "arco doloroso" tra 60-120° quando alzi il braccio?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does the pain disturb your sleep when lying on that shoulder?',
        questionIt: 'Il dolore disturba il sonno quando dormi su quella spalla?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Pain-free arc of motion',
      'External rotation strength >80%',
      'Can press overhead without pain',
      'Negative impingement tests'
    ],

    redFlags: [
      'Significant weakness (drop arm positive)',
      'Complete inability to raise arm',
      'Trauma with immediate weakness',
      'Night pain not improving'
    ]
  },

  subacromial_impingement: {
    id: 'subacromial_impingement',
    name: 'Subacromial Impingement',
    nameIt: 'Impingement Subacromiale',
    area: 'shoulder',
    description: 'Compression of subacromial structures. Focus on scapular control and rotator cuff strengthening.',
    descriptionIt: 'Compressione strutture subacromiali. Focus su controllo scapolare e rinforzo cuffia.',

    avoidExercises: [
      'Upright Rows',
      'Behind Neck Press',
      'Behind Neck Pulldown',
      'High Cable Rows',
      'Dips (deep)'
    ],

    avoidPatterns: [
      'shoulder_internal_rotation_overhead',
      'shoulder_elevation_loaded'
    ],

    recommendedExercises: [
      'Face Pulls',
      'External Rotation',
      'Serratus Wall Slides',
      'Prone Y-T-W',
      'Scapular Retractions',
      'Landmine Press',
      'Incline Press (moderate angle)',
      'Low Cable Row'
    ],

    modifications: [
      {
        exercise: 'Overhead Press',
        modification: 'Use landmine press angle, avoid full overhead',
        modificationIt: 'Usa angolo landmine press, evita overhead completo'
      },
      {
        exercise: 'Lateral Raise',
        modification: 'Stop at 80°, use thumbs up position',
        modificationIt: 'Ferma a 80°, usa pollici in su',
        romLimit: 80
      }
    ],

    screeningQuestions: [
      {
        question: 'Does your shoulder hurt between 60-120° when raising your arm?',
        questionIt: 'La spalla fa male tra 60-120° quando alzi il braccio?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Is the pain at the front or side of your shoulder?',
        questionIt: 'Il dolore è nella parte anteriore o laterale della spalla?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'No painful arc',
      'Negative Neer/Hawkins tests',
      'Full overhead ROM without pain'
    ]
  },

  labrum_tear_slap: {
    id: 'labrum_tear_slap',
    name: 'SLAP Tear',
    nameIt: 'Lesione SLAP',
    area: 'shoulder',
    description: 'Superior labral tear. Avoid end-range overhead and behind back positions.',
    descriptionIt: 'Lesione labrale superiore. Evitare posizioni overhead e dietro schiena estreme.',

    avoidExercises: [
      'Behind Neck Press',
      'Behind Neck Pulldown',
      'Overhead Throwing',
      'Dips (deep)',
      'Pull-ups (wide grip initially)'
    ],

    avoidPatterns: [
      'shoulder_external_rotation_abducted',
      'biceps_loading_overhead'
    ],

    recommendedExercises: [
      'Rotator Cuff Strengthening',
      'Scapular Stabilization',
      'Neutral Grip Pressing',
      'Cable Rows',
      'Face Pulls'
    ],

    modifications: [
      {
        exercise: 'Pull-up',
        modification: 'Use neutral grip, chin-up grip, avoid wide grip',
        modificationIt: 'Usa presa neutra, chin-up, evita presa larga'
      }
    ],

    screeningQuestions: [
      {
        question: 'Do you have pain with overhead activities?',
        questionIt: 'Hai dolore con attività sopra la testa?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Do you feel clicking or popping in your shoulder?',
        questionIt: 'Senti click o schiocchi nella spalla?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Reduced clicking',
      'Improved strength',
      'Can perform overhead activities with reduced pain'
    ],

    redFlags: [
      'Significant instability',
      'Recurrent dislocations',
      'Severe pain not improving'
    ]
  },

  frozen_shoulder: {
    id: 'frozen_shoulder',
    name: 'Frozen Shoulder (Adhesive Capsulitis)',
    nameIt: 'Spalla Congelata (Capsulite Adesiva)',
    area: 'shoulder',
    description: 'Progressive shoulder stiffness. Gentle ROM work, avoid forcing.',
    descriptionIt: 'Rigidità progressiva della spalla. Mobilità gentile, non forzare.',

    avoidExercises: [
      'Heavy Overhead Work',
      'Stretching to Pain',
      'Forced ROM'
    ],

    avoidPatterns: [
      'forced_external_rotation',
      'forced_overhead'
    ],

    recommendedExercises: [
      'Pendulum Exercises',
      'Wall Slides (gentle)',
      'Sleeper Stretch (gentle)',
      'External Rotation (isometric initially)',
      'Cross-body Stretch',
      'Heat Before Exercise'
    ],

    modifications: [
      {
        exercise: 'All shoulder exercises',
        modification: 'Work within pain-free ROM only, do not force',
        modificationIt: 'Lavora solo nel ROM senza dolore, non forzare'
      }
    ],

    screeningQuestions: [
      {
        question: 'Is your shoulder getting progressively stiffer?',
        questionIt: 'La spalla sta diventando progressivamente più rigida?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Do you have difficulty reaching behind your back?',
        questionIt: 'Hai difficoltà a portare il braccio dietro la schiena?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Do you have diabetes or thyroid issues?',
        questionIt: 'Hai diabete o problemi di tiroide?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'ROM improving',
      'Decreased night pain',
      'Can perform daily activities'
    ]
  },

  instability_anterior: {
    id: 'instability_anterior',
    name: 'Anterior Shoulder Instability',
    nameIt: 'Instabilità Anteriore Spalla',
    area: 'shoulder',
    description: 'History of anterior dislocation. Strengthen rotator cuff, avoid apprehension positions.',
    descriptionIt: 'Storia di lussazione anteriore. Rinforza cuffia, evita posizioni di apprensione.',

    avoidExercises: [
      'Behind Neck Press',
      'Behind Neck Pulldown',
      'Dips (deep)',
      'Bench Press (very deep)'
    ],

    avoidPatterns: [
      'shoulder_abduction_external_rotation_max'
    ],

    recommendedExercises: [
      'External Rotation Strengthening (CRITICAL)',
      'Scapular Stabilization',
      'Proprioception Training',
      'Rhythmic Stabilization',
      'PNF Patterns'
    ],

    modifications: [
      {
        exercise: 'Bench Press',
        modification: 'Limit depth (elbows to 90°), use dumbbells for control',
        modificationIt: 'Limita profondità (gomiti a 90°), usa manubri per controllo',
        romLimit: 90
      }
    ],

    screeningQuestions: [
      {
        question: 'Has your shoulder dislocated before?',
        questionIt: 'La spalla si è mai lussata?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Do you feel like your shoulder might "slip out" in certain positions?',
        questionIt: 'Senti che la spalla potrebbe "uscire" in certe posizioni?',
        yesIndicates: true,
        weight: 3
      }
    ],

    progressionCriteria: [
      'No apprehension in functional positions',
      'External rotator strength normalized',
      'Can perform overhead activities safely'
    ],

    redFlags: [
      'Recurrent dislocations',
      'Neurological symptoms',
      'Significant weakness'
    ]
  },

  rotator_cuff_tear: {
    id: 'rotator_cuff_tear',
    name: 'Rotator Cuff Tear',
    nameIt: 'Lesione Cuffia dei Rotatori',
    area: 'shoulder',
    description: 'Partial or full thickness rotator cuff tear. May require surgery consultation.',
    descriptionIt: 'Lesione parziale o a tutto spessore della cuffia. Potrebbe richiedere consulto chirurgico.',
    avoidExercises: ['Heavy overhead work', 'Behind neck movements'],
    avoidPatterns: ['heavy_overhead_loading'],
    recommendedExercises: ['Isometric rotator cuff', 'Scapular exercises', 'Pendulums'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: [],
    redFlags: ['Complete tear requiring surgery', 'Significant weakness']
  },

  labrum_tear_bankart: {
    id: 'labrum_tear_bankart',
    name: 'Bankart Lesion',
    nameIt: 'Lesione di Bankart',
    area: 'shoulder',
    description: 'Anterior-inferior labral tear from dislocation.',
    descriptionIt: 'Lesione labrale antero-inferiore da lussazione.',
    avoidExercises: ['Positions that caused dislocation'],
    avoidPatterns: ['apprehension_position'],
    recommendedExercises: ['Rotator cuff strengthening', 'Scapular stabilization'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  ac_joint_injury: {
    id: 'ac_joint_injury',
    name: 'AC Joint Injury',
    nameIt: 'Lesione Articolazione Acromion-Clavicolare',
    area: 'shoulder',
    description: 'Acromioclavicular joint separation or arthritis.',
    descriptionIt: 'Separazione o artrosi dell\'articolazione acromion-clavicolare.',
    avoidExercises: ['Dips', 'Cross-body movements', 'Heavy bench press initially'],
    avoidPatterns: ['shoulder_horizontal_adduction_loaded'],
    recommendedExercises: ['Neutral grip pressing', 'External rotation'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  instability_posterior: {
    id: 'instability_posterior',
    name: 'Posterior Shoulder Instability',
    nameIt: 'Instabilità Posteriore Spalla',
    area: 'shoulder',
    description: 'Posterior shoulder instability.',
    descriptionIt: 'Instabilità posteriore della spalla.',
    avoidExercises: ['Bench press to chest', 'Push-ups to floor'],
    avoidPatterns: ['shoulder_flexion_internal_rotation_loaded'],
    recommendedExercises: ['External rotation', 'Posterior cuff strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  instability_multidirectional: {
    id: 'instability_multidirectional',
    name: 'Multidirectional Instability',
    nameIt: 'Instabilità Multidirezionale',
    area: 'shoulder',
    description: 'Instability in multiple directions, often from hypermobility.',
    descriptionIt: 'Instabilità in più direzioni, spesso da ipermobilità.',
    avoidExercises: ['Stretching', 'End range loading'],
    avoidPatterns: ['end_range_all_directions'],
    recommendedExercises: ['Rotator cuff strengthening', 'Scapular stabilization', 'Closed chain exercises'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  biceps_tendinopathy: {
    id: 'biceps_tendinopathy',
    name: 'Biceps Tendinopathy',
    nameIt: 'Tendinopatia del Bicipite',
    area: 'shoulder',
    description: 'Long head of biceps tendinopathy.',
    descriptionIt: 'Tendinopatia del capo lungo del bicipite.',
    avoidExercises: ['Overhead pressing initially', 'Speed\'s test position'],
    avoidPatterns: ['shoulder_flexion_resisted'],
    recommendedExercises: ['Eccentric bicep work', 'Rotator cuff strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  thoracic_outlet: {
    id: 'thoracic_outlet',
    name: 'Thoracic Outlet Syndrome',
    nameIt: 'Sindrome dello Stretto Toracico',
    area: 'shoulder',
    description: 'Compression of neurovascular structures at thoracic outlet.',
    descriptionIt: 'Compressione strutture neurovascolari allo stretto toracico.',
    avoidExercises: ['Heavy overhead work', 'Heavy carries'],
    avoidPatterns: ['overhead_prolonged', 'heavy_shoulder_depression'],
    recommendedExercises: ['Scalene stretching', 'First rib mobilization', 'Postural exercises'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: [],
    redFlags: ['Neurological symptoms', 'Vascular compromise']
  },

  general_shoulder_pain: {
    id: 'general_shoulder_pain',
    name: 'General Shoulder Pain',
    nameIt: 'Dolore Generico alla Spalla',
    area: 'shoulder',
    description: 'Non-specific shoulder pain.',
    descriptionIt: 'Dolore alla spalla non specifico.',
    avoidExercises: [],
    avoidPatterns: [],
    recommendedExercises: ['Rotator cuff strengthening', 'Scapular exercises', 'Mobility work'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  }
};

// ============================================================================
// LOWER BACK PATHOLOGY PROFILES
// ============================================================================

export const LOWER_BACK_PATHOLOGY_PROFILES: Record<LowerBackPathology, PathologyProfile> = {

  herniated_disc_flexion_intolerant: {
    id: 'herniated_disc_flexion_intolerant',
    name: 'Herniated Disc (Flexion Intolerant)',
    nameIt: 'Ernia del Disco (Intollerante alla Flessione)',
    area: 'lower_back',
    description: 'Disc herniation that worsens with spinal flexion. Extension-based approach.',
    descriptionIt: 'Ernia discale che peggiora con flessione spinale. Approccio basato su estensione.',

    avoidExercises: [
      'Sit-ups/Crunches',
      'Russian Twist',
      'Good Morning',
      'Conventional Deadlift (initially)',
      'Bent Over Rows (heavy)',
      'Toe Touches',
      'Jefferson Curls'
    ],

    avoidPatterns: [
      'spinal_flexion',
      'spinal_flexion_rotation',
      'loaded_flexion'
    ],

    recommendedExercises: [
      'McGill Big 3 (Bird Dog, Side Plank, McGill Curl-up)',
      'Prone Press-ups (McKenzie)',
      'Cat-Cow (emphasis on cow/extension)',
      'Hip Thrust',
      'Goblet Squat (upright torso)',
      'Trap Bar Deadlift',
      'Front Squat',
      'Cable Rows (upright)',
      'Pallof Press'
    ],

    modifications: [
      {
        exercise: 'Deadlift',
        modification: 'Use trap bar or sumo stance, maintain neutral spine, no rounding',
        modificationIt: 'Usa trap bar o sumo stance, mantieni colonna neutra, nessun arrotondamento'
      },
      {
        exercise: 'Row',
        modification: 'Use chest-supported row or cable row, avoid bent over position',
        modificationIt: 'Usa rematore con supporto petto o cavi, evita posizione piegata'
      },
      {
        exercise: 'Squat',
        modification: 'Front squat or goblet squat to maintain upright torso',
        modificationIt: 'Front squat o goblet squat per mantenere torso eretto'
      }
    ],

    screeningQuestions: [
      {
        question: 'Does bending forward make your back pain worse?',
        questionIt: 'Piegarsi in avanti peggiora il dolore alla schiena?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does extending your back (arching backward) give relief?',
        questionIt: 'Estendere la schiena (inarcare indietro) dà sollievo?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Do you have pain, numbness, or tingling going down your leg?',
        questionIt: 'Hai dolore, intorpidimento o formicolio che scende lungo la gamba?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Is sitting for long periods painful?',
        questionIt: 'Stare seduto a lungo è doloroso?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Centralization of symptoms (leg pain moves to back)',
      'Can maintain neutral spine during daily activities',
      'No radicular symptoms',
      'Can hinge at hips without back flexion'
    ],

    redFlags: [
      'Progressive neurological deficit',
      'Bladder/bowel dysfunction',
      'Saddle anesthesia',
      'Bilateral leg weakness'
    ]
  },

  herniated_disc_extension_intolerant: {
    id: 'herniated_disc_extension_intolerant',
    name: 'Herniated Disc (Extension Intolerant)',
    nameIt: 'Ernia del Disco (Intollerante all\'Estensione)',
    area: 'lower_back',
    description: 'Less common. Worsens with spinal extension. Flexion-based approach.',
    descriptionIt: 'Meno comune. Peggiora con estensione spinale. Approccio basato su flessione.',

    avoidExercises: [
      'Superman',
      'Back Extensions',
      'Cobra Pose',
      'Press-ups',
      'Overhead Press (standing)'
    ],

    avoidPatterns: [
      'spinal_extension',
      'loaded_extension'
    ],

    recommendedExercises: [
      'Knee to Chest Stretch',
      'Child\'s Pose',
      'Cat Stretch',
      'Dead Bug',
      'Hollow Body Hold',
      'Leg Press',
      'Seated Exercises'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Maintain slight forward lean, avoid hyperextending at top',
        modificationIt: 'Mantieni leggera inclinazione in avanti, evita iperestensione in alto'
      }
    ],

    screeningQuestions: [
      {
        question: 'Does arching your back backward make pain worse?',
        questionIt: 'Inarcare la schiena indietro peggiora il dolore?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does bending forward give you relief?',
        questionIt: 'Piegarsi in avanti dà sollievo?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Is standing for long periods painful?',
        questionIt: 'Stare in piedi a lungo è doloroso?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Reduced extension sensitivity',
      'Can stand without pain',
      'No leg symptoms'
    ]
  },

  spinal_stenosis: {
    id: 'spinal_stenosis',
    name: 'Spinal Stenosis',
    nameIt: 'Stenosi Spinale',
    area: 'lower_back',
    description: 'Narrowing of spinal canal. Flexion typically gives relief.',
    descriptionIt: 'Restringimento del canale spinale. La flessione tipicamente dà sollievo.',

    avoidExercises: [
      'Back Extensions',
      'Superman',
      'Standing for Long Periods',
      'Walking Long Distances (without rest)',
      'Overhead Press (standing)'
    ],

    avoidPatterns: [
      'spinal_extension',
      'prolonged_standing'
    ],

    recommendedExercises: [
      'Cycling',
      'Swimming',
      'Knee to Chest',
      'Seated Exercises',
      'Recumbent Bike',
      'Water Aerobics'
    ],

    modifications: [
      {
        exercise: 'Walking',
        modification: 'Use shopping cart or walker for support, take frequent rests',
        modificationIt: 'Usa carrello o deambulatore per supporto, fai pause frequenti'
      }
    ],

    screeningQuestions: [
      {
        question: 'Does walking become painful, requiring you to stop and rest?',
        questionIt: 'Camminare diventa doloroso, richiedendo di fermarti e riposare?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does leaning forward (like on a shopping cart) give relief?',
        questionIt: 'Piegarsi in avanti (come su un carrello) dà sollievo?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Are you over 60 years old?',
        questionIt: 'Hai più di 60 anni?',
        yesIndicates: true,
        weight: 1
      }
    ],

    progressionCriteria: [
      'Increased walking tolerance',
      'Decreased neurogenic claudication',
      'Can stand longer'
    ],

    redFlags: [
      'Progressive weakness',
      'Bladder/bowel changes',
      'Severe bilateral symptoms'
    ]
  },

  si_joint_dysfunction: {
    id: 'si_joint_dysfunction',
    name: 'SI Joint Dysfunction',
    nameIt: 'Disfunzione Articolazione Sacroiliaca',
    area: 'lower_back',
    description: 'Sacroiliac joint pain. Focus on stability and symmetry.',
    descriptionIt: 'Dolore all\'articolazione sacroiliaca. Focus su stabilità e simmetria.',

    avoidExercises: [
      'Single Leg Loading (initially)',
      'Asymmetric Loading',
      'Wide Stance Squats (initially)'
    ],

    avoidPatterns: [
      'asymmetric_loading',
      'hip_shear'
    ],

    recommendedExercises: [
      'Bird Dog',
      'Dead Bug',
      'Glute Bridge',
      'Hip Circles',
      'Clamshells',
      'Symmetric Squats',
      'SI Joint Belt (during exercise)'
    ],

    modifications: [
      {
        exercise: 'Squat',
        modification: 'Symmetric stance, use belt for support',
        modificationIt: 'Stance simmetrico, usa cintura per supporto'
      },
      {
        exercise: 'Lunge',
        modification: 'Progress slowly, maintain symmetry',
        modificationIt: 'Progredisci lentamente, mantieni simmetria'
      }
    ],

    screeningQuestions: [
      {
        question: 'Is the pain located to one side of your lower back, near the dimple?',
        questionIt: 'Il dolore è localizzato su un lato della schiena bassa, vicino alla fossetta?',
        yesIndicates: true,
        weight: 3
      },
      {
        question: 'Does the pain radiate into your buttock or thigh (not below knee)?',
        questionIt: 'Il dolore si irradia nel gluteo o coscia (non sotto il ginocchio)?',
        yesIndicates: true,
        weight: 2
      },
      {
        question: 'Is the pain worse with prolonged sitting or standing?',
        questionIt: 'Il dolore è peggiore con seduta o stazione eretta prolungata?',
        yesIndicates: true,
        weight: 2
      }
    ],

    progressionCriteria: [
      'Symmetric loading tolerated',
      'Reduced pain with daily activities',
      'Can walk without pain shift'
    ]
  },

  spondylolisthesis: {
    id: 'spondylolisthesis',
    name: 'Spondylolisthesis',
    nameIt: 'Spondilolistesi',
    area: 'lower_back',
    description: 'Vertebral slippage. Avoid extension, focus on core stability.',
    descriptionIt: 'Scivolamento vertebrale. Evita estensione, focus su stabilità core.',
    avoidExercises: ['Back extensions', 'Superman', 'Heavy deadlifts'],
    avoidPatterns: ['spinal_extension', 'spinal_anterior_shear'],
    recommendedExercises: ['Dead Bug', 'Bird Dog', 'Pallof Press', 'Plank'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: [],
    redFlags: ['Progressive slippage', 'Neurological symptoms']
  },

  spondylolysis: {
    id: 'spondylolysis',
    name: 'Spondylolysis',
    nameIt: 'Spondilolisi',
    area: 'lower_back',
    description: 'Pars interarticularis fracture. Avoid extension loading.',
    descriptionIt: 'Frattura pars interarticularis. Evita carico in estensione.',
    avoidExercises: ['Back extensions', 'Superman', 'Overhead sports initially'],
    avoidPatterns: ['spinal_extension_loaded'],
    recommendedExercises: ['Core stability', 'Hip strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  facet_joint_dysfunction: {
    id: 'facet_joint_dysfunction',
    name: 'Facet Joint Dysfunction',
    nameIt: 'Disfunzione delle Faccette Articolari',
    area: 'lower_back',
    description: 'Facet joint irritation. Often extension sensitive.',
    descriptionIt: 'Irritazione faccette articolari. Spesso sensibile a estensione.',
    avoidExercises: ['Heavy back extensions', 'Overhead press standing'],
    avoidPatterns: ['spinal_extension', 'spinal_rotation'],
    recommendedExercises: ['Flexion stretches', 'Core stability', 'Hip mobility'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  muscle_strain: {
    id: 'muscle_strain',
    name: 'Muscle Strain',
    nameIt: 'Stiramento Muscolare',
    area: 'lower_back',
    description: 'Acute muscle strain. Rest initially, then progressive loading.',
    descriptionIt: 'Stiramento muscolare acuto. Riposo iniziale, poi carico progressivo.',
    avoidExercises: ['Heavy loading initially'],
    avoidPatterns: [],
    recommendedExercises: ['Gentle movement', 'Walking', 'Swimming', 'Progressive loading'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: ['Pain resolving', 'ROM returning', 'Strength returning']
  },

  sciatica: {
    id: 'sciatica',
    name: 'Sciatica',
    nameIt: 'Sciatica',
    area: 'lower_back',
    description: 'Sciatic nerve irritation. Find directional preference.',
    descriptionIt: 'Irritazione nervo sciatico. Trova preferenza direzionale.',
    avoidExercises: ['Depends on directional preference'],
    avoidPatterns: ['nerve_tensioning'],
    recommendedExercises: ['McKenzie protocol', 'Neural glides', 'Core stability'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: ['Centralization', 'Reduced leg symptoms']
  },

  piriformis_syndrome: {
    id: 'piriformis_syndrome',
    name: 'Piriformis Syndrome',
    nameIt: 'Sindrome del Piriforme',
    area: 'lower_back',
    description: 'Piriformis compression of sciatic nerve.',
    descriptionIt: 'Compressione del nervo sciatico da parte del piriforme.',
    avoidExercises: ['Deep external rotation stretches initially'],
    avoidPatterns: ['hip_external_rotation_deep'],
    recommendedExercises: ['Piriformis stretching', 'Hip strengthening', 'Glute activation'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  general_lower_back_pain: {
    id: 'general_lower_back_pain',
    name: 'General Lower Back Pain',
    nameIt: 'Dolore Lombare Generico',
    area: 'lower_back',
    description: 'Non-specific lower back pain. Movement is medicine.',
    descriptionIt: 'Dolore lombare non specifico. Il movimento è medicina.',
    avoidExercises: [],
    avoidPatterns: [],
    recommendedExercises: ['McGill Big 3', 'Walking', 'Swimming', 'Core stability'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: ['Reduced pain', 'Increased function']
  }
};

// ============================================================================
// HIP PATHOLOGY PROFILES
// ============================================================================

export const HIP_PATHOLOGY_PROFILES: Record<HipPathology, PathologyProfile> = {
  hip_impingement_fai: {
    id: 'hip_impingement_fai',
    name: 'Hip Impingement (FAI)',
    nameIt: 'Impingement Anca (FAI)',
    area: 'hip',
    description: 'Femoroacetabular impingement. Avoid deep hip flexion.',
    descriptionIt: 'Impingement femoro-acetabolare. Evita flessione profonda anca.',
    avoidExercises: ['Deep squats', 'Pistol squats', 'Deep hip flexion'],
    avoidPatterns: ['hip_flexion_deep', 'hip_internal_rotation'],
    recommendedExercises: ['Hip strengthening', 'Glute activation', 'Core stability'],
    modifications: [
      {
        exercise: 'Squat',
        modification: 'Limit depth, use wider stance, toes out',
        modificationIt: 'Limita profondità, stance largo, punte in fuori',
        romLimit: 90
      }
    ],
    screeningQuestions: [
      {
        question: 'Does deep hip flexion cause groin pain?',
        questionIt: 'La flessione profonda dell\'anca causa dolore all\'inguine?',
        yesIndicates: true,
        weight: 3
      }
    ],
    progressionCriteria: ['Reduced groin pain', 'Improved hip ROM']
  },

  labral_tear: {
    id: 'labral_tear',
    name: 'Hip Labral Tear',
    nameIt: 'Lesione Labrale Anca',
    area: 'hip',
    description: 'Acetabular labrum tear.',
    descriptionIt: 'Lesione del labbro acetabolare.',
    avoidExercises: ['Deep squats', 'Extreme hip ROM'],
    avoidPatterns: ['hip_flexion_internal_rotation'],
    recommendedExercises: ['Hip strengthening within ROM', 'Core stability'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  hip_osteoarthritis: {
    id: 'hip_osteoarthritis',
    name: 'Hip Osteoarthritis',
    nameIt: 'Artrosi dell\'Anca',
    area: 'hip',
    description: 'Degenerative hip joint disease.',
    descriptionIt: 'Malattia degenerativa dell\'articolazione dell\'anca.',
    avoidExercises: ['High impact activities', 'Deep hip flexion'],
    avoidPatterns: ['high_impact', 'extreme_rom'],
    recommendedExercises: ['Walking', 'Swimming', 'Cycling', 'Hip strengthening'],
    modifications: [],
    screeningQuestions: [
      {
        question: 'Do you have morning hip stiffness?',
        questionIt: 'Hai rigidità mattutina all\'anca?',
        yesIndicates: true,
        weight: 3
      }
    ],
    progressionCriteria: ['Improved mobility', 'Reduced pain']
  },

  greater_trochanteric_bursitis: {
    id: 'greater_trochanteric_bursitis',
    name: 'Greater Trochanteric Bursitis',
    nameIt: 'Borsite Trocanterica',
    area: 'hip',
    description: 'Inflammation of bursa at greater trochanter.',
    descriptionIt: 'Infiammazione della borsa al grande trocantere.',
    avoidExercises: ['Lying on affected side', 'Excessive hip adduction'],
    avoidPatterns: ['hip_adduction_loaded'],
    recommendedExercises: ['Glute strengthening', 'IT band stretching'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  hip_flexor_strain: {
    id: 'hip_flexor_strain',
    name: 'Hip Flexor Strain',
    nameIt: 'Stiramento Flessori Anca',
    area: 'hip',
    description: 'Iliopsoas or rectus femoris strain.',
    descriptionIt: 'Stiramento ileopsoas o retto femorale.',
    avoidExercises: ['Leg raises', 'Sprinting', 'High kicks'],
    avoidPatterns: ['hip_flexion_resisted'],
    recommendedExercises: ['Gentle hip flexor stretching', 'Progressive strengthening'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  adductor_strain: {
    id: 'adductor_strain',
    name: 'Adductor Strain',
    nameIt: 'Stiramento Adduttori',
    area: 'hip',
    description: 'Groin muscle strain.',
    descriptionIt: 'Stiramento muscoli inguinali.',
    avoidExercises: ['Wide stance squats', 'Lateral movements', 'Soccer kicks'],
    avoidPatterns: ['hip_adduction_resisted'],
    recommendedExercises: ['Copenhagen planks', 'Adductor strengthening progressive'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  gluteal_tendinopathy: {
    id: 'gluteal_tendinopathy',
    name: 'Gluteal Tendinopathy',
    nameIt: 'Tendinopatia Glutea',
    area: 'hip',
    description: 'Gluteus medius/minimus tendinopathy.',
    descriptionIt: 'Tendinopatia del medio/piccolo gluteo.',
    avoidExercises: ['Single leg stance prolonged', 'Crossing legs'],
    avoidPatterns: ['hip_adduction'],
    recommendedExercises: ['Isometric glute exercises', 'Progressive hip abduction'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  },

  general_hip_pain: {
    id: 'general_hip_pain',
    name: 'General Hip Pain',
    nameIt: 'Dolore Generico all\'Anca',
    area: 'hip',
    description: 'Non-specific hip pain.',
    descriptionIt: 'Dolore all\'anca non specifico.',
    avoidExercises: [],
    avoidPatterns: [],
    recommendedExercises: ['Hip strengthening', 'Mobility work', 'Low impact cardio'],
    modifications: [],
    screeningQuestions: [],
    progressionCriteria: []
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get pathology profile by ID
 */
export function getPathologyProfile(pathologyId: AllPathologies): PathologyProfile | null {
  return (
    KNEE_PATHOLOGY_PROFILES[pathologyId as KneePathology] ||
    SHOULDER_PATHOLOGY_PROFILES[pathologyId as ShoulderPathology] ||
    LOWER_BACK_PATHOLOGY_PROFILES[pathologyId as LowerBackPathology] ||
    HIP_PATHOLOGY_PROFILES[pathologyId as HipPathology] ||
    null
  );
}

/**
 * Get all profiles for a body area
 */
export function getProfilesByArea(area: 'knee' | 'shoulder' | 'lower_back' | 'hip'): PathologyProfile[] {
  switch (area) {
    case 'knee':
      return Object.values(KNEE_PATHOLOGY_PROFILES);
    case 'shoulder':
      return Object.values(SHOULDER_PATHOLOGY_PROFILES);
    case 'lower_back':
      return Object.values(LOWER_BACK_PATHOLOGY_PROFILES);
    case 'hip':
      return Object.values(HIP_PATHOLOGY_PROFILES);
    default:
      return [];
  }
}

/**
 * Score screening questions to identify likely pathology
 */
export function scoreScreeningQuestions(
  area: 'knee' | 'shoulder' | 'lower_back' | 'hip',
  answers: Record<string, boolean>
): { pathology: AllPathologies; score: number; maxScore: number }[] {
  const profiles = getProfilesByArea(area);
  const results: { pathology: AllPathologies; score: number; maxScore: number }[] = [];

  profiles.forEach(profile => {
    let score = 0;
    let maxScore = 0;

    profile.screeningQuestions.forEach((q, index) => {
      const questionKey = `${profile.id}_q${index}`;
      maxScore += q.weight;

      if (answers[questionKey] === q.yesIndicates) {
        score += q.weight;
      }
    });

    results.push({
      pathology: profile.id,
      score,
      maxScore
    });
  });

  // Sort by score descending
  return results.sort((a, b) => {
    const aPercent = a.maxScore > 0 ? a.score / a.maxScore : 0;
    const bPercent = b.maxScore > 0 ? b.score / b.maxScore : 0;
    return bPercent - aPercent;
  });
}

/**
 * Apply pathology profile to exercise filtering
 */
export function applyPathologyProfile(
  exercises: Exercise[],
  pathologyId: AllPathologies
): {
  allowed: Exercise[];
  blocked: { exercise: string; reason: string }[];
  recommended: string[];
  modifications: { exercise: string; modification: string }[];
} {
  const profile = getPathologyProfile(pathologyId);

  if (!profile) {
    return { allowed: exercises, blocked: [], recommended: [], modifications: [] };
  }

  const blocked: { exercise: string; reason: string }[] = [];
  const modifications: { exercise: string; modification: string }[] = [];

  const allowed = exercises.filter(ex => {
    const exerciseName = ex.name.toLowerCase();

    // Check if exercise should be avoided
    const shouldAvoid = profile.avoidExercises.some(avoid =>
      exerciseName.includes(avoid.toLowerCase())
    );

    if (shouldAvoid) {
      blocked.push({
        exercise: ex.name,
        reason: `Controindicato per ${profile.nameIt}`
      });
      return false;
    }

    // Check for modifications
    const mod = profile.modifications.find(m =>
      exerciseName.includes(m.exercise.toLowerCase())
    );

    if (mod) {
      modifications.push({
        exercise: ex.name,
        modification: mod.modificationIt || mod.modification
      });
    }

    return true;
  });

  return {
    allowed,
    blocked,
    recommended: profile.recommendedExercises,
    modifications
  };
}

/**
 * Get all pathology IDs for a body area
 */
export function getPathologyIdsForArea(area: 'knee' | 'shoulder' | 'lower_back' | 'hip'): AllPathologies[] {
  const profiles = getProfilesByArea(area);
  return profiles.map(p => p.id);
}

/**
 * Check if exercise should be modified for a pathology
 */
export function getExerciseModification(
  exerciseName: string,
  pathologyId: AllPathologies
): { modified: boolean; modification?: string; romLimit?: number; loadReduction?: number; tempoChange?: string } {
  const profile = getPathologyProfile(pathologyId);

  if (!profile) {
    return { modified: false };
  }

  const mod = profile.modifications.find(m =>
    exerciseName.toLowerCase().includes(m.exercise.toLowerCase())
  );

  if (mod) {
    return {
      modified: true,
      modification: mod.modificationIt || mod.modification,
      romLimit: mod.romLimit,
      loadReduction: mod.loadReduction,
      tempoChange: mod.tempoChange
    };
  }

  return { modified: false };
}
