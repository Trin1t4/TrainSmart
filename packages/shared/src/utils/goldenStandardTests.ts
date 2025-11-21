/**
 * Golden Standard Clinical Tests Database
 *
 * Comprehensive database of evidence-based clinical tests for musculoskeletal assessment.
 * Used to identify painful movement patterns and guide exercise prescription.
 */

export type BodyRegion =
  | 'cervical_spine'
  | 'thoracic_spine'
  | 'lumbar_spine'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'shoulder'
  | 'elbow'
  | 'wrist';

export type Sensitivity = 'High' | 'Medium' | 'Low';

export interface GoldenStandardTest {
  name: string;
  region: BodyRegion;
  movements_tested: string[]; // reference to anatomicalMovements keys
  procedure: string;
  positive_indicates: string[];
  sensitivity?: Sensitivity;
  specificity?: Sensitivity;
  clinical_notes?: string;
  video_ref?: string;
}

// =============================================================================
// SPINE TESTS (14 tests)
// =============================================================================

const SPINE_TESTS: Record<string, GoldenStandardTest> = {
  standing_forward_bend: {
    name: 'Standing Forward Bend (Toe Touch)',
    region: 'lumbar_spine',
    movements_tested: ['spinal_flexion', 'hip_flexion'],
    procedure: 'Patient stands with feet together, slowly bends forward attempting to touch toes. Observe spine curvature and note pain location/intensity.',
    positive_indicates: [
      'Posterior disc pathology (pain increases)',
      'Hamstring tightness (limited ROM)',
      'Flexion intolerance pattern',
      'Facet joint dysfunction (if pain decreases)'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Note: Pain that increases = likely disc. Pain that decreases = likely facet. Assess directional preference.',
    video_ref: 'forward_bend_test'
  },

  mckenzie_extensions: {
    name: 'McKenzie Extensions (Prone Press-ups)',
    region: 'lumbar_spine',
    movements_tested: ['spinal_extension'],
    procedure: 'Patient lies prone, places hands under shoulders, presses up extending spine while keeping pelvis on floor. Repeat 10 times, assess pain centralization.',
    positive_indicates: [
      'Extension directional preference (pain centralizes)',
      'Disc derangement responding to extension',
      'Posterior annular tear (if pain centralizes)'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Centralization = good prognostic sign. Pain moving toward midline = directional preference for extension. Use for flexion-intolerant patients.',
    video_ref: 'mckenzie_extension'
  },

  seated_trunk_rotation: {
    name: 'Seated Trunk Rotation Test',
    region: 'lumbar_spine',
    movements_tested: ['spinal_rotation_right', 'spinal_rotation_left'],
    procedure: 'Patient sits on chair, arms crossed. Rotate trunk maximally to right, then left. Compare ROM and pain response.',
    positive_indicates: [
      'Facet joint dysfunction (if painful)',
      'Disc pathology (if pain peripheralizes)',
      'Rotation intolerance pattern',
      'Asymmetric mobility restriction'
    ],
    sensitivity: 'Medium',
    specificity: 'Medium',
    clinical_notes: 'Note side of pain and whether pain peripheralizes. >10% ROM difference = significant asymmetry.',
    video_ref: 'seated_rotation'
  },

  slump_test: {
    name: 'Slump Test',
    region: 'lumbar_spine',
    movements_tested: ['spinal_flexion', 'nerve_tension'],
    procedure: 'Patient sits at edge of table, slumps spine, flexes neck, extends knee. Positive if reproduces radicular symptoms that reduce with neck extension.',
    positive_indicates: [
      'Neural tension (sciatic nerve)',
      'Disc herniation with nerve root compression',
      'Nerve root irritation',
      'Radiculopathy'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Critical: Must reproduce radicular symptoms (leg pain), not just back pain. Structural differentiation with neck extension.',
    video_ref: 'slump_test'
  },

  quadruped_cat_cow: {
    name: 'Quadruped Cat-Cow Assessment',
    region: 'lumbar_spine',
    movements_tested: ['spinal_flexion', 'spinal_extension'],
    procedure: 'Patient on hands and knees, alternates between flexion (cat) and extension (cow). Assess pain in each direction and quality of movement.',
    positive_indicates: [
      'Directional preference identification',
      'Flexion intolerance (pain in cat)',
      'Extension intolerance (pain in cow)',
      'Movement control deficit'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Excellent for identifying directional preference in pain-free position. Use as both assessment and treatment.',
    video_ref: 'cat_cow'
  },

  single_leg_standing: {
    name: 'Single Leg Standing (Core Stability)',
    region: 'lumbar_spine',
    movements_tested: ['neutral_spine_isometric', 'hip_abduction'],
    procedure: 'Patient stands on one leg for 30 seconds. Observe trunk shifts, Trendelenburg sign, and pain response. Repeat other side.',
    positive_indicates: [
      'Core stability deficit',
      'Hip abductor weakness',
      'Poor motor control',
      'Instability pattern pain'
    ],
    sensitivity: 'Low',
    specificity: 'Medium',
    clinical_notes: 'Should hold 30+ seconds without trunk shift. Inability suggests need for stability training.',
    video_ref: 'single_leg_stand'
  },

  prone_instability_test: {
    name: 'Prone Instability Test',
    region: 'lumbar_spine',
    movements_tested: ['spinal_axial_compression', 'neutral_spine_isometric'],
    procedure: 'Patient prone with legs off table, feet on floor. Apply posterior-anterior pressure to spine. Repeat with patient lifting feet (activating core). Positive if pain present initially but disappears with muscle activation.',
    positive_indicates: [
      'Segmental instability',
      'Motor control deficit',
      'Need for stability training',
      'Dynamic stabilization deficit'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Pain that resolves with muscle activation = instability. Key indicator for core stability focus.',
    video_ref: 'prone_instability'
  },

  straight_leg_raise: {
    name: 'Straight Leg Raise (SLR)',
    region: 'lumbar_spine',
    movements_tested: ['hip_flexion', 'nerve_tension'],
    procedure: 'Patient supine, examiner passively raises straight leg to first point of pain or to 70°. Note angle and symptoms. Test dorsiflexion for neural tension.',
    positive_indicates: [
      'Disc herniation with nerve compression',
      'Nerve root irritation (L4-S1)',
      'Hamstring tightness (if >70° no radicular symptoms)',
      'Sciatic nerve tension'
    ],
    sensitivity: 'High',
    specificity: 'Low',
    clinical_notes: 'Positive = radicular symptoms <70°. >70° = likely hamstring tightness. Add dorsiflexion to increase neural tension.',
    video_ref: 'straight_leg_raise'
  },

  faber_test: {
    name: 'FABER Test (Patrick Test)',
    region: 'lumbar_spine',
    movements_tested: ['hip_flexion', 'hip_abduction', 'hip_external_rotation'],
    procedure: 'Patient supine, place ankle of test leg on opposite knee (figure-4). Apply gentle downward pressure on test knee. Note pain location.',
    positive_indicates: [
      'SI joint dysfunction (pain in SI joint)',
      'Hip pathology (pain in groin)',
      'Sacroiliac joint pain',
      'Hip impingement (anterior hip pain)'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Pain location critical: SI joint = SI dysfunction, groin = hip pathology. Also called Patrick test.',
    video_ref: 'faber_test'
  },

  gaenslen_test: {
    name: "Gaenslen's Test",
    region: 'lumbar_spine',
    movements_tested: ['hip_extension', 'si_joint_stress'],
    procedure: 'Patient supine at edge of table, pulls one knee to chest, allows opposite leg to drop off table into extension. Positive if reproduces SI joint pain.',
    positive_indicates: [
      'SI joint dysfunction',
      'Sacroiliac pathology',
      'SI joint hypermobility',
      'Posterior pelvic pain'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Stresses SI joint through opposing forces. Best combined with other SI joint tests for diagnosis.',
    video_ref: 'gaenslen_test'
  },

  standing_extension: {
    name: 'Standing Extension Test',
    region: 'lumbar_spine',
    movements_tested: ['spinal_extension'],
    procedure: 'Patient stands, places hands on lower back for support, extends spine backward. Note pain response and ROM.',
    positive_indicates: [
      'Facet joint pathology (if painful)',
      'Posterior element pain',
      'Extension intolerance pattern',
      'Spinal stenosis (if reproduces symptoms)'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Pain with extension = facet joints or stenosis. Pain relief = disc pathology. Test directional preference.',
    video_ref: 'standing_extension'
  },

  lateral_flexion_test: {
    name: 'Lateral Flexion Test',
    region: 'lumbar_spine',
    movements_tested: ['spinal_lateral_flexion_right', 'spinal_lateral_flexion_left'],
    procedure: 'Patient stands, slides hand down lateral thigh, bending to side. Repeat both sides. Compare ROM and pain.',
    positive_indicates: [
      'Unilateral facet dysfunction',
      'Lateral disc herniation',
      'Quadratus lumborum restriction',
      'Asymmetric mobility'
    ],
    sensitivity: 'Low',
    specificity: 'Low',
    clinical_notes: 'Note which side produces pain and whether pain is ipsilateral or contralateral to movement.',
    video_ref: 'lateral_flexion'
  },

  active_straight_leg_raise: {
    name: 'Active Straight Leg Raise (ASLR)',
    region: 'lumbar_spine',
    movements_tested: ['hip_flexion', 'core_stability'],
    procedure: 'Patient supine, actively raises one straight leg 20cm off table. Rate difficulty 0-5. Repeat with manual compression through pelvis.',
    positive_indicates: [
      'Pelvic instability',
      'Load transfer dysfunction',
      'Core control deficit',
      'Pregnancy-related pelvic pain'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'If difficulty reduces with pelvic compression = instability. Key test for load transfer assessment.',
    video_ref: 'active_slr'
  },

  flexion_rotation_test: {
    name: 'Cervical Flexion-Rotation Test',
    region: 'cervical_spine',
    movements_tested: ['cervical_rotation_right', 'cervical_rotation_left'],
    procedure: 'Patient supine, neck fully flexed. Examiner rotates head to each side. Compare ROM. >10° difference = positive.',
    positive_indicates: [
      'C1-C2 dysfunction',
      'Upper cervical restriction',
      'Cervicogenic headache',
      'Upper cervical hypomobility'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Gold standard for cervicogenic headache. >10° ROM difference = significant. Tests C1-C2 primarily.',
    video_ref: 'flexion_rotation_cervical'
  }
};

// =============================================================================
// HIP TESTS (10 tests)
// =============================================================================

const HIP_TESTS: Record<string, GoldenStandardTest> = {
  fadir_test: {
    name: 'FADIR Test (Flexion-Adduction-Internal Rotation)',
    region: 'hip',
    movements_tested: ['hip_flexion', 'hip_adduction', 'hip_internal_rotation'],
    procedure: 'Patient supine, flex hip to 90°, adduct and internally rotate. Positive if reproduces anterior hip or groin pain.',
    positive_indicates: [
      'Femoroacetabular impingement (FAI)',
      'Hip labral tear',
      'Anterior hip impingement',
      'Acetabular pathology'
    ],
    sensitivity: 'High',
    specificity: 'Low',
    clinical_notes: 'Most sensitive test for FAI. Pain typically in anterior groin. Consider imaging if positive with activity-related pain.',
    video_ref: 'fadir_test'
  },

  faber_hip_test: {
    name: 'FABER Test (Hip-specific)',
    region: 'hip',
    movements_tested: ['hip_flexion', 'hip_abduction', 'hip_external_rotation'],
    procedure: 'Patient supine, place ankle on opposite knee (figure-4), apply gentle downward pressure. Pain in groin = hip pathology.',
    positive_indicates: [
      'Hip joint pathology (groin pain)',
      'Labral tear',
      'Hip osteoarthritis',
      'Posterior hip impingement'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Differentiates hip from SI joint: groin pain = hip, SI pain = SI joint. Measure knee-to-table distance.',
    video_ref: 'faber_hip'
  },

  thomas_test: {
    name: 'Thomas Test',
    region: 'hip',
    movements_tested: ['hip_extension', 'hip_flexion'],
    procedure: 'Patient supine at edge of table, pulls both knees to chest, then lowers test leg. Positive if thigh rises off table (hip flexor tightness).',
    positive_indicates: [
      'Hip flexor tightness (iliopsoas)',
      'Rectus femoris tightness (if knee extends)',
      'Hip flexion contracture',
      'Anterior hip capsule restriction'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Thigh off table = tight hip flexors. Knee extends = rectus femoris involvement. Critical for squat/deadlift assessment.',
    video_ref: 'thomas_test'
  },

  ober_test: {
    name: 'Ober Test',
    region: 'hip',
    movements_tested: ['hip_adduction', 'hip_abduction'],
    procedure: 'Patient side-lying, bottom hip/knee flexed. Abduct and extend top leg, then allow to drop toward table. Positive if leg remains elevated.',
    positive_indicates: [
      'IT band tightness',
      'Tensor fasciae latae tightness',
      'Lateral hip tightness',
      'Hip abductor tightness'
    ],
    sensitivity: 'Medium',
    specificity: 'Medium',
    clinical_notes: 'Leg should drop to table level. Remaining elevated = IT band/TFL tightness. Common in runners.',
    video_ref: 'ober_test'
  },

  trendelenburg_test: {
    name: 'Trendelenburg Test',
    region: 'hip',
    movements_tested: ['hip_abduction'],
    procedure: 'Patient stands on one leg for 30 seconds. Positive if pelvis drops on opposite side (indicating stance-side hip abductor weakness).',
    positive_indicates: [
      'Hip abductor weakness (gluteus medius/minimus)',
      'Superior gluteal nerve injury',
      'Hip pathology causing inhibition',
      'Trendelenburg gait pattern'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Pelvis should stay level or rise slightly. Drop = weakness. Critical for single-leg exercises. Also observe lateral trunk shift.',
    video_ref: 'trendelenburg'
  },

  ninety_ninety_internal_rotation: {
    name: '90/90 Hip Internal Rotation Test',
    region: 'hip',
    movements_tested: ['hip_internal_rotation'],
    procedure: 'Patient supine, hip and knee at 90°. Rotate hip internally (shin moves out). Measure ROM. Compare to opposite side.',
    positive_indicates: [
      'Internal rotation restriction',
      'Posterior hip capsule tightness',
      'Femoral retroversion',
      'Hip joint pathology'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Normal = 30-40° IR. <20° = significant restriction. Important for squat depth assessment. Compare bilaterally.',
    video_ref: 'hip_ir_90_90'
  },

  ninety_ninety_external_rotation: {
    name: '90/90 Hip External Rotation Test',
    region: 'hip',
    movements_tested: ['hip_external_rotation'],
    procedure: 'Patient supine, hip and knee at 90°. Rotate hip externally (shin moves in). Measure ROM. Compare to opposite side.',
    positive_indicates: [
      'External rotation restriction',
      'Anterior hip capsule tightness',
      'Femoral anteversion',
      'Hip joint pathology'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Normal = 40-50° ER. <25° = significant restriction. Critical for sumo stance and deep squat positions.',
    video_ref: 'hip_er_90_90'
  },

  stinchfield_test: {
    name: 'Stinchfield Test',
    region: 'hip',
    movements_tested: ['hip_flexion'],
    procedure: 'Patient supine, actively raises straight leg to 30° against resistance. Hold 5 seconds. Positive if reproduces hip/groin pain.',
    positive_indicates: [
      'Intra-articular hip pathology',
      'Hip labral tear',
      'Hip osteoarthritis',
      'Acetabular lesion'
    ],
    sensitivity: 'Medium',
    specificity: 'Medium',
    clinical_notes: 'Loads hip joint without impingement position. Pain = likely intra-articular pathology. Useful adjunct to FADIR.',
    video_ref: 'stinchfield'
  },

  log_roll_test: {
    name: 'Hip Log Roll Test',
    region: 'hip',
    movements_tested: ['hip_internal_rotation', 'hip_external_rotation'],
    procedure: 'Patient supine with leg straight, examiner gently rolls leg internally and externally. Positive if pain or protective muscle spasm.',
    positive_indicates: [
      'Hip joint irritability',
      'Acute hip pathology',
      'Hip capsulitis',
      'Severe hip osteoarthritis'
    ],
    sensitivity: 'Low',
    specificity: 'High',
    clinical_notes: 'Gentle test for acute hip pain. Pain or spasm = high joint irritability. Avoid aggressive testing if positive.',
    video_ref: 'log_roll'
  },

  hip_scour_test: {
    name: 'Hip Quadrant/Scour Test',
    region: 'hip',
    movements_tested: ['hip_flexion', 'hip_adduction', 'hip_internal_rotation'],
    procedure: 'Patient supine, flex hip/knee to 90°. Apply axial compression and move hip through arc of flexion-adduction-internal rotation.',
    positive_indicates: [
      'Hip labral tear',
      'Acetabular cartilage lesion',
      'Hip osteoarthritis',
      'Intra-articular pathology'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Crepitus or catching = concerning. Pain throughout arc = degenerative. Sharp pain at specific point = labral tear.',
    video_ref: 'hip_scour'
  }
};

// =============================================================================
// KNEE TESTS (9 tests)
// =============================================================================

const KNEE_TESTS: Record<string, GoldenStandardTest> = {
  lachman_test: {
    name: 'Lachman Test',
    region: 'knee',
    movements_tested: ['knee_anterior_translation'],
    procedure: 'Patient supine, knee flexed 20-30°. Stabilize femur, apply anterior force to proximal tibia. Assess translation and end-feel.',
    positive_indicates: [
      'ACL tear',
      'Anterior cruciate ligament insufficiency',
      'Knee anterior instability',
      'Grade I, II, or III ACL sprain'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Gold standard for ACL assessment. Soft end-feel + excessive translation = tear. More sensitive than anterior drawer.',
    video_ref: 'lachman'
  },

  anterior_drawer_test: {
    name: 'Anterior Drawer Test',
    region: 'knee',
    movements_tested: ['knee_anterior_translation'],
    procedure: 'Patient supine, knee flexed 90°, foot stabilized. Apply anterior force to proximal tibia. Assess translation.',
    positive_indicates: [
      'ACL tear',
      'ACL insufficiency',
      'Anterolateral rotatory instability',
      'Combined ACL/meniscal injury'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Less sensitive than Lachman. >5mm translation vs opposite side = positive. Ensure hamstrings relaxed.',
    video_ref: 'anterior_drawer_knee'
  },

  posterior_drawer_test: {
    name: 'Posterior Drawer Test',
    region: 'knee',
    movements_tested: ['knee_posterior_translation'],
    procedure: 'Patient supine, knee flexed 90°, foot stabilized. Apply posterior force to proximal tibia. Assess translation.',
    positive_indicates: [
      'PCL tear',
      'Posterior cruciate ligament insufficiency',
      'Posterolateral corner injury',
      'Grade I, II, or III PCL sprain'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Observe for posterior tibial sag before testing. >5mm posterior translation = positive. Compare bilaterally.',
    video_ref: 'posterior_drawer'
  },

  mcmurray_test: {
    name: 'McMurray Test',
    region: 'knee',
    movements_tested: ['knee_flexion', 'knee_extension', 'tibial_rotation'],
    procedure: 'Patient supine, fully flex knee. Apply valgus+external rotation (medial meniscus) or varus+internal rotation (lateral meniscus) while extending knee. Positive if click/pop/pain.',
    positive_indicates: [
      'Meniscal tear (medial or lateral)',
      'Meniscal bucket handle tear',
      'Posterior horn meniscal tear',
      'Meniscal pathology'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Click/clunk = mechanical symptom = likely tear. Pain alone less specific. Tests posterior horn primarily.',
    video_ref: 'mcmurray'
  },

  apley_compression_test: {
    name: 'Apley Compression Test',
    region: 'knee',
    movements_tested: ['knee_rotation', 'meniscal_compression'],
    procedure: 'Patient prone, knee flexed 90°. Apply downward compression through foot while rotating tibia internally/externally. Positive if pain.',
    positive_indicates: [
      'Meniscal tear',
      'Meniscal pathology',
      'Intra-articular knee pathology',
      'Cartilage lesion'
    ],
    sensitivity: 'Medium',
    specificity: 'Medium',
    clinical_notes: 'Pain with compression = meniscus. Pain with distraction (Apley distraction) = ligament. Compare both maneuvers.',
    video_ref: 'apley_compression'
  },

  valgus_stress_test: {
    name: 'Valgus Stress Test',
    region: 'knee',
    movements_tested: ['knee_valgus'],
    procedure: 'Patient supine, knee at 0° and 30°. Apply valgus force (lateral-to-medial) to knee. Assess laxity and pain. Compare to opposite side.',
    positive_indicates: [
      'MCL tear (medial collateral ligament)',
      'Grade I, II, or III MCL sprain',
      'Medial knee instability',
      'Combined MCL/ACL injury (if lax at 0°)'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Test at 0° and 30°. Laxity at 30° only = isolated MCL. Laxity at both angles = MCL + cruciate or capsule.',
    video_ref: 'valgus_stress'
  },

  varus_stress_test: {
    name: 'Varus Stress Test',
    region: 'knee',
    movements_tested: ['knee_varus'],
    procedure: 'Patient supine, knee at 0° and 30°. Apply varus force (medial-to-lateral) to knee. Assess laxity and pain.',
    positive_indicates: [
      'LCL tear (lateral collateral ligament)',
      'Grade I, II, or III LCL sprain',
      'Lateral knee instability',
      'Posterolateral corner injury'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Less common than MCL injury. Laxity suggests LCL or posterolateral corner involvement. Consider combined injury.',
    video_ref: 'varus_stress'
  },

  patellar_grind_test: {
    name: 'Patellar Grind Test (Clarke Test)',
    region: 'knee',
    movements_tested: ['patellofemoral_compression'],
    procedure: 'Patient supine, knee extended. Apply downward pressure on superior patella, ask patient to contract quadriceps. Positive if pain prevents contraction.',
    positive_indicates: [
      'Patellofemoral pain syndrome',
      'Chondromalacia patellae',
      'Patellar cartilage lesion',
      'Patellofemoral arthritis'
    ],
    sensitivity: 'Low',
    specificity: 'High',
    clinical_notes: 'Patient must be unable to contract quad due to pain (not just discomfort). High false positive rate if not specific.',
    video_ref: 'patellar_grind'
  },

  patellar_apprehension_test: {
    name: 'Patellar Apprehension Test',
    region: 'knee',
    movements_tested: ['patellar_lateral_glide'],
    procedure: 'Patient supine, knee flexed 30°. Apply lateral force to medial border of patella. Positive if patient apprehensive or guarding.',
    positive_indicates: [
      'Patellar instability',
      'History of patellar dislocation',
      'Patellar subluxation',
      'MPFL insufficiency'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'True positive = apprehension/guarding, not pain alone. Suggests history of dislocation or chronic instability.',
    video_ref: 'patellar_apprehension'
  }
};

// =============================================================================
// SHOULDER TESTS (13 tests)
// =============================================================================

const SHOULDER_TESTS: Record<string, GoldenStandardTest> = {
  neer_impingement: {
    name: 'Neer Impingement Sign',
    region: 'shoulder',
    movements_tested: ['shoulder_flexion'],
    procedure: 'Examiner stabilizes scapula, passively flexes arm to maximum. Positive if pain in anterior/lateral shoulder.',
    positive_indicates: [
      'Subacromial impingement',
      'Rotator cuff tendinopathy',
      'Subacromial bursitis',
      'Anterior shoulder impingement'
    ],
    sensitivity: 'High',
    specificity: 'Low',
    clinical_notes: 'Sensitive but not specific. Positive screening test. Combine with other tests for diagnosis. Pain at 60-120° arc.',
    video_ref: 'neer_test'
  },

  hawkins_kennedy: {
    name: 'Hawkins-Kennedy Test',
    region: 'shoulder',
    movements_tested: ['shoulder_internal_rotation'],
    procedure: 'Arm at 90° flexion, elbow 90° flexion. Examiner internally rotates shoulder. Positive if pain.',
    positive_indicates: [
      'Subacromial impingement',
      'Supraspinatus tendinopathy',
      'Subacromial bursitis',
      'Anterior impingement'
    ],
    sensitivity: 'High',
    specificity: 'Low',
    clinical_notes: 'More specific than Neer. Drives humeral head into acromion. Combine with other tests. Pain = impingement.',
    video_ref: 'hawkins_kennedy'
  },

  empty_can_test: {
    name: 'Empty Can Test (Jobe Test)',
    region: 'shoulder',
    movements_tested: ['shoulder_abduction'],
    procedure: 'Arms at 90° abduction, 30° forward flexion, thumbs down (empty can). Apply downward resistance. Positive if pain or weakness.',
    positive_indicates: [
      'Supraspinatus tear',
      'Supraspinatus tendinopathy',
      'Rotator cuff pathology',
      'Supraspinatus weakness'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Isolates supraspinatus. Weakness + pain = tear likely. Pain without weakness = tendinopathy. Compare to full can test.',
    video_ref: 'empty_can'
  },

  painful_arc: {
    name: 'Painful Arc Test',
    region: 'shoulder',
    movements_tested: ['shoulder_abduction'],
    procedure: 'Patient actively abducts arm from side to overhead. Note angle of pain. Positive if pain between 60-120°.',
    positive_indicates: [
      'Subacromial impingement',
      'Rotator cuff tendinopathy',
      'Subacromial bursitis',
      'Supraspinatus pathology'
    ],
    sensitivity: 'High',
    specificity: 'Low',
    clinical_notes: 'Pain 60-120° = subacromial impingement. Pain >120° = AC joint. No pain early or late = negative.',
    video_ref: 'painful_arc'
  },

  drop_arm_test: {
    name: 'Drop Arm Test',
    region: 'shoulder',
    movements_tested: ['shoulder_abduction'],
    procedure: 'Passively abduct arm to 90°, ask patient to slowly lower. Positive if arm drops suddenly or severe pain.',
    positive_indicates: [
      'Full-thickness rotator cuff tear',
      'Massive rotator cuff tear',
      'Supraspinatus complete tear',
      'Severe rotator cuff pathology'
    ],
    sensitivity: 'Low',
    specificity: 'High',
    clinical_notes: 'Highly specific for full-thickness tear. Sudden drop = unable to control eccentric. Negative does not rule out tear.',
    video_ref: 'drop_arm'
  },

  lift_off_test: {
    name: 'Lift-Off Test (Gerber Test)',
    region: 'shoulder',
    movements_tested: ['shoulder_internal_rotation'],
    procedure: 'Patient places hand behind back, palm out. Ask to lift hand off back against resistance. Positive if unable or weak.',
    positive_indicates: [
      'Subscapularis tear',
      'Subscapularis weakness',
      'Anterior rotator cuff tear',
      'Subscapularis tendinopathy'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Best test for subscapularis. Inability to lift off = tear. Weakness = pathology. Critical for bench press assessment.',
    video_ref: 'lift_off'
  },

  apprehension_test: {
    name: 'Anterior Apprehension Test',
    region: 'shoulder',
    movements_tested: ['shoulder_external_rotation', 'shoulder_abduction'],
    procedure: 'Patient supine or seated, arm at 90° abduction and 90° elbow flexion. Examiner externally rotates shoulder. Positive if apprehension (fear of dislocation).',
    positive_indicates: [
      'Anterior shoulder instability',
      'History of anterior dislocation',
      'Bankart lesion',
      'Anterior labral tear'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'True positive = apprehension/guarding, not just pain. Suggests history of dislocation. Critical for overhead athletes.',
    video_ref: 'apprehension'
  },

  relocation_test: {
    name: 'Relocation Test (Jobe Relocation)',
    region: 'shoulder',
    movements_tested: ['shoulder_external_rotation'],
    procedure: 'Perform apprehension test. If positive, apply posterior force to humeral head. Positive if symptoms resolve.',
    positive_indicates: [
      'Anterior instability',
      'Anterior labral tear',
      'Bankart lesion',
      'Anteroinferior instability'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Confirms anterior instability if apprehension resolves with posterior pressure. Use after positive apprehension test.',
    video_ref: 'relocation'
  },

  speeds_test: {
    name: "Speed's Test",
    region: 'shoulder',
    movements_tested: ['shoulder_flexion'],
    procedure: 'Arm forward flexed 90°, elbow extended, forearm supinated. Apply downward resistance. Positive if anterior shoulder pain.',
    positive_indicates: [
      'Biceps tendinopathy',
      'Biceps tendon pathology',
      'SLAP lesion (superior labrum)',
      'Long head biceps tear'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Pain in bicipital groove = biceps tendinopathy. Less specific for SLAP. Combine with other biceps tests.',
    video_ref: 'speeds_test'
  },

  yergasons_test: {
    name: "Yergason's Test",
    region: 'shoulder',
    movements_tested: ['shoulder_external_rotation'],
    procedure: 'Elbow at 90° flexion, forearm pronated. Patient supinates forearm and externally rotates shoulder against resistance. Positive if anterior shoulder pain.',
    positive_indicates: [
      'Biceps tendinopathy',
      'Biceps tendon instability',
      'Bicipital groove pathology',
      'Transverse humeral ligament tear'
    ],
    sensitivity: 'Medium',
    specificity: 'Low',
    clinical_notes: 'Snap or subluxation = biceps instability. Pain = tendinopathy. Complements Speed\'s test.',
    video_ref: 'yergasons'
  },

  crossbody_adduction: {
    name: 'Crossbody Adduction Test (Scarf Test)',
    region: 'shoulder',
    movements_tested: ['shoulder_horizontal_adduction'],
    procedure: 'Arm at 90° flexion, passively adduct across body. Positive if pain at top of shoulder (AC joint).',
    positive_indicates: [
      'AC joint pathology',
      'Acromioclavicular arthritis',
      'AC joint separation',
      'Distal clavicle osteolysis'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Pain specifically at AC joint = AC pathology. Important for bench press/overhead pressing assessment.',
    video_ref: 'crossbody_adduction'
  },

  obrien_test: {
    name: "O'Brien Test (Active Compression)",
    region: 'shoulder',
    movements_tested: ['shoulder_flexion', 'shoulder_horizontal_adduction'],
    procedure: 'Arm at 90° flexion, 10-15° adduction, thumb down. Apply downward resistance. Repeat with palm up. Positive if pain with thumb down but not palm up.',
    positive_indicates: [
      'SLAP lesion (superior labrum)',
      'Superior labral tear',
      'AC joint pathology',
      'Long head biceps pathology'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: 'Deep shoulder pain = SLAP. Top of shoulder pain = AC joint. Must have pain with thumb down but not palm up.',
    video_ref: 'obrien_test'
  },

  sulcus_sign: {
    name: 'Sulcus Sign',
    region: 'shoulder',
    movements_tested: ['shoulder_inferior_translation'],
    procedure: 'Patient seated, arm relaxed. Apply inferior traction to arm. Observe for sulcus (depression) below acromion. Measure depth.',
    positive_indicates: [
      'Multidirectional instability',
      'Inferior shoulder instability',
      'Generalized ligamentous laxity',
      'Capsular insufficiency'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Sulcus >2cm = positive. Test with arm in neutral and external rotation. Persistent sulcus in ER = rotator interval laxity.',
    video_ref: 'sulcus_sign'
  }
};

// =============================================================================
// ANKLE TESTS (5 tests)
// =============================================================================

const ANKLE_TESTS: Record<string, GoldenStandardTest> = {
  anterior_drawer_ankle: {
    name: 'Anterior Drawer Test (Ankle)',
    region: 'ankle',
    movements_tested: ['ankle_anterior_translation'],
    procedure: 'Patient seated, knee flexed 90°, ankle neutral. Stabilize tibia, apply anterior force to heel. Assess translation. Compare to opposite ankle.',
    positive_indicates: [
      'ATFL tear (anterior talofibular ligament)',
      'Lateral ankle instability',
      'Chronic ankle instability',
      'Grade II or III lateral sprain'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: '>4mm anterior translation vs opposite = positive. Most specific test for ATFL injury. Assess end-feel quality.',
    video_ref: 'anterior_drawer_ankle'
  },

  talar_tilt: {
    name: 'Talar Tilt Test (Inversion Stress)',
    region: 'ankle',
    movements_tested: ['ankle_inversion'],
    procedure: 'Patient seated, ankle neutral. Invert calcaneus while stabilizing tibia. Assess laxity and pain. Compare to opposite side.',
    positive_indicates: [
      'CFL tear (calcaneofibular ligament)',
      'Combined ATFL/CFL tear',
      'Lateral ankle instability',
      'Severe lateral ankle sprain'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: '>10° difference vs opposite = positive. Isolated CFL rare. Usually combined with ATFL tear.',
    video_ref: 'talar_tilt'
  },

  thompson_test: {
    name: 'Thompson Test (Simmonds Test)',
    region: 'ankle',
    movements_tested: ['ankle_plantarflexion'],
    procedure: 'Patient prone or kneeling, feet off table. Squeeze calf muscle. Positive if NO ankle plantarflexion (indicates Achilles rupture).',
    positive_indicates: [
      'Achilles tendon rupture',
      'Complete Achilles tear',
      'Achilles tendon discontinuity'
    ],
    sensitivity: 'High',
    specificity: 'High',
    clinical_notes: 'Normal = ankle plantarflexes with calf squeeze. No movement = complete rupture. Requires immediate orthopedic referral.',
    video_ref: 'thompson_test'
  },

  weight_bearing_lunge: {
    name: 'Weight-Bearing Lunge Test (Ankle Dorsiflexion)',
    region: 'ankle',
    movements_tested: ['ankle_dorsiflexion'],
    procedure: 'Patient lunges forward, keeping heel down, knee tracking over toes. Measure distance from big toe to wall. Normal >10cm.',
    positive_indicates: [
      'Ankle dorsiflexion restriction',
      'Calf tightness (gastrocnemius/soleus)',
      'Ankle mobility deficit',
      'Post-sprain ankle stiffness'
    ],
    sensitivity: 'High',
    specificity: 'Medium',
    clinical_notes: '<10cm = restricted dorsiflexion. Critical for squat depth. Test knee straight (gastrocnemius) vs bent (soleus).',
    video_ref: 'wb_lunge'
  },

  squeeze_test: {
    name: 'Squeeze Test (Syndesmosis)',
    region: 'ankle',
    movements_tested: ['tibiofibular_compression'],
    procedure: 'Compress tibia and fibula together at mid-calf. Positive if pain at ankle syndesmosis (anterior tibiofibular ligament).',
    positive_indicates: [
      'Syndesmotic ankle sprain (high ankle sprain)',
      'Anterior tibiofibular ligament tear',
      'Interosseous membrane injury',
      'Syndesmosis disruption'
    ],
    sensitivity: 'Medium',
    specificity: 'High',
    clinical_notes: 'Pain at ankle (not where squeezing) = syndesmosis injury. Longer recovery than lateral ankle sprain. Consider imaging.',
    video_ref: 'squeeze_test'
  }
};

// =============================================================================
// COMBINED DATABASE
// =============================================================================

export const GOLDEN_STANDARD_TESTS: Record<string, GoldenStandardTest> = {
  ...SPINE_TESTS,
  ...HIP_TESTS,
  ...KNEE_TESTS,
  ...SHOULDER_TESTS,
  ...ANKLE_TESTS
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all tests for a specific body region
 */
export function getTestsByRegion(region: BodyRegion): GoldenStandardTest[] {
  return Object.values(GOLDEN_STANDARD_TESTS).filter(
    (test) => test.region === region
  );
}

/**
 * Get tests that assess a specific movement pattern
 */
export function getTestsByMovement(movementKey: string): GoldenStandardTest[] {
  return Object.values(GOLDEN_STANDARD_TESTS).filter((test) =>
    test.movements_tested.includes(movementKey)
  );
}

/**
 * Get test by name (case-insensitive, fuzzy match)
 */
export function getTestByName(testName: string): GoldenStandardTest | undefined {
  const normalized = testName.toLowerCase().trim();
  const testKey = Object.keys(GOLDEN_STANDARD_TESTS).find((key) =>
    key.toLowerCase().includes(normalized) ||
    GOLDEN_STANDARD_TESTS[key].name.toLowerCase().includes(normalized)
  );
  return testKey ? GOLDEN_STANDARD_TESTS[testKey] : undefined;
}

/**
 * Get quick screening tests for a region (most sensitive/specific)
 */
export function getQuickScreeningTests(region: BodyRegion): GoldenStandardTest[] {
  const allTests = getTestsByRegion(region);
  // Return tests with High sensitivity OR High specificity
  return allTests.filter(
    (test) =>
      test.sensitivity === 'High' || test.specificity === 'High'
  );
}

/**
 * Get comprehensive test battery for a region
 */
export function getComprehensiveTestBattery(region: BodyRegion): {
  screening: GoldenStandardTest[];
  confirmatory: GoldenStandardTest[];
} {
  const allTests = getTestsByRegion(region);

  return {
    screening: allTests.filter((test) => test.sensitivity === 'High'),
    confirmatory: allTests.filter((test) => test.specificity === 'High')
  };
}

/**
 * Get test statistics
 */
export function getTestStatistics() {
  const allTests = Object.values(GOLDEN_STANDARD_TESTS);

  const byRegion = allTests.reduce((acc, test) => {
    acc[test.region] = (acc[test.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allTests.length,
    byRegion,
    highSensitivity: allTests.filter((t) => t.sensitivity === 'High').length,
    highSpecificity: allTests.filter((t) => t.specificity === 'High').length
  };
}

// Export count for verification
export const TEST_COUNT = Object.keys(GOLDEN_STANDARD_TESTS).length;
