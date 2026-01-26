/**
 * Biomechanics Engine Types
 * Sistema di analisi video basato sui principi DCSS di Paolo Evangelista
 */

// ============================================
// LANDMARK E POSE
// ============================================

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseLandmarks {
  // Testa
  nose: PoseLandmark;
  left_eye: PoseLandmark;
  right_eye: PoseLandmark;
  left_ear: PoseLandmark;
  right_ear: PoseLandmark;

  // Spalle
  left_shoulder: PoseLandmark;
  right_shoulder: PoseLandmark;

  // Braccia
  left_elbow: PoseLandmark;
  right_elbow: PoseLandmark;
  left_wrist: PoseLandmark;
  right_wrist: PoseLandmark;

  // Anche
  left_hip: PoseLandmark;
  right_hip: PoseLandmark;

  // Gambe
  left_knee: PoseLandmark;
  right_knee: PoseLandmark;
  left_ankle: PoseLandmark;
  right_ankle: PoseLandmark;

  // Piedi
  left_heel: PoseLandmark;
  right_heel: PoseLandmark;
  left_foot_index: PoseLandmark;
  right_foot_index: PoseLandmark;
}

// ============================================
// PROPORZIONI E MORFOTIPO
// ============================================

export interface UserProportions {
  // Calcolati automaticamente dal video
  femurLength: number;      // hip → knee
  tibiaLength: number;      // knee → ankle
  torsoLength: number;      // hip → shoulder
  armLength: number;        // shoulder → wrist

  // Rapporti derivati
  femurToTorso: number;     // < 1 = torso lungo, > 1 = femori lunghi
  armToTorso: number;       // > 1 = braccia lunghe
  tibiaToFemur: number;     // influenza stance e profondità
}

export type MorphotypeType =
  | 'LONG_FEMUR'
  | 'LONG_TORSO'
  | 'LONG_ARMS'
  | 'SHORT_ARMS'
  | 'BALANCED';

export interface SquatImplications {
  expectedTorsoLean: 'low' | 'medium' | 'high';  // 20-35°, 35-45°, 45-60°
  preferredStance: 'narrow' | 'medium' | 'wide';
  preferredStyle: 'high_bar' | 'low_bar';
  depthChallenge: boolean;
}

export interface DeadliftImplications {
  preferredStyle: 'conventional' | 'sumo';
  hipStartPosition: 'low' | 'medium' | 'high';
  advantage?: boolean;
}

export interface BenchImplications {
  romAdvantage: boolean;
  gripWidth: 'narrow' | 'medium' | 'wide';
}

export interface Morphotype {
  type: MorphotypeType;
  // Limb-to-torso ratios (for biomechanical calculations)
  armToTorso?: number;    // e.g., 1.1 means arms 10% longer than torso
  legToTorso?: number;    // e.g., 0.9 means legs 10% shorter than torso
  femurToTibia?: number;  // femur length relative to tibia
  squatImplications?: SquatImplications;
  deadliftImplications?: DeadliftImplications;
  benchImplications?: BenchImplications;
  note?: string;
}

// ============================================
// ANALISI FRAME
// ============================================

export type ExercisePhase =
  | 'SETUP'
  | 'ECCENTRIC'
  | 'BOTTOM'
  | 'CONCENTRIC'
  | 'LOCKOUT'
  | 'TOP'
  | 'MID_RANGE'
  | 'PEAK_CONTRACTION';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueType = 'SAFETY' | 'EFFICIENCY' | 'OPTIMIZATION';

export interface Issue {
  type: IssueType;
  code: string;
  severity: IssueSeverity;
  timestamp?: number;
  frameNumber?: number;
  description: string;
  correction: string;
}

export interface BarPath {
  x: number;
  y: number;
  deviationFromVertical: number;
  forwardDeviation?: number;
}

export interface FrameAngles {
  knee?: number;
  hip?: number;
  ankle?: number;
  torso?: number;
  elbow?: number;
  shoulder?: number;
  wrist?: number;
  lumbar?: number;
  neck?: number;

  // Angoli specifici
  kneeValgus?: number;
  shoulderAbduction?: number;
  elbowFlare?: number;
  lumbarFlexion?: number;
  lumbarExtension?: number;
}

export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  phase: ExercisePhase;

  angles: FrameAngles;

  barPath?: BarPath;

  velocity?: number;  // Calcolata tra frame

  // Stati specifici
  spineNeutral?: boolean;
  heelContact?: boolean;
  chinAboveBar?: boolean;
  elbowBehindTorso?: boolean;
  barOnDelts?: boolean;

  // Posizioni
  centerOfPressure?: 'HEEL' | 'MIDFOOT' | 'FOREFOOT';
  pelvicTilt?: 'ANTERIOR' | 'NEUTRAL' | 'POSTERIOR';

  issues: Issue[];
}

// ============================================
// STICKING POINT
// ============================================

export type StickingPosition = 'BOTTOM' | 'MID_RANGE' | 'LOCKOUT' | 'BALANCE';

export interface StickingPointDiagnosis {
  muscular: string[];    // Possibili deficit muscolari
  technical: string[];   // Possibili errori tecnici
}

export interface StickingPointRecommendations {
  accessories: string[];  // Esercizi complementari
  cues: string[];         // Cue tecniche
}

export interface StickingPointAnalysis {
  detected: boolean;
  position?: StickingPosition;
  angleAtSticking?: number;

  diagnosis?: StickingPointDiagnosis;
  recommendations?: StickingPointRecommendations;
}

// ============================================
// ESERCIZI SUPPORTATI (106 ESERCIZI)
// ============================================

export type SupportedExercise =
  // LOWER PUSH (15)
  | 'BACK_SQUAT'
  | 'FRONT_SQUAT'
  | 'BULGARIAN_SPLIT_SQUAT'
  | 'GOBLET_SQUAT'
  | 'PISTOL_SQUAT'
  | 'LUNGES'
  | 'STEP_UP'
  | 'LEG_PRESS'
  | 'HACK_SQUAT'
  | 'LEG_EXTENSION'
  | 'SMITH_SQUAT'
  | 'SKATER_SQUAT'
  | 'SISSY_SQUAT'
  | 'BODYWEIGHT_SQUAT'
  | 'PENDULUM_SQUAT'

  // LOWER PULL (14)
  | 'DEADLIFT_CONVENTIONAL'
  | 'DEADLIFT_SUMO'
  | 'ROMANIAN_DEADLIFT'
  | 'TRAP_BAR_DEADLIFT'
  | 'HIP_THRUST'
  | 'GLUTE_BRIDGE'
  | 'NORDIC_CURL'
  | 'GOOD_MORNING'
  | 'LEG_CURL_LYING'
  | 'LEG_CURL_SEATED'
  | 'BACK_EXTENSION'
  | 'SINGLE_LEG_RDL'
  | 'KETTLEBELL_SWING'
  | 'HIP_THRUST_MACHINE'

  // HORIZONTAL PUSH (16)
  | 'BENCH_PRESS'
  | 'INCLINE_BENCH_PRESS'
  | 'DECLINE_BENCH_PRESS'
  | 'DUMBBELL_BENCH_PRESS'
  | 'PUSH_UP'
  | 'DIAMOND_PUSH_UP'
  | 'ARCHER_PUSH_UP'
  | 'DECLINE_PUSH_UP'
  | 'INCLINE_PUSH_UP'
  | 'DIPS_CHEST'
  | 'DIPS_TRICEPS'
  | 'CHEST_PRESS_MACHINE'
  | 'CABLE_FLY'
  | 'PEC_DECK'
  | 'SVEND_PRESS'
  | 'LANDMINE_PRESS'

  // HORIZONTAL PULL (12)
  | 'BARBELL_ROW'
  | 'DUMBBELL_ROW'
  | 'T_BAR_ROW'
  | 'INVERTED_ROW'
  | 'CABLE_ROW'
  | 'CHEST_SUPPORTED_ROW'
  | 'FACE_PULL'
  | 'SEATED_ROW_MACHINE'
  | 'HIGH_ROW'
  | 'LOW_ROW_MACHINE'
  | 'MEADOWS_ROW'
  | 'PENDLAY_ROW'

  // VERTICAL PULL (10)
  | 'PULL_UP'
  | 'CHIN_UP'
  | 'LAT_PULLDOWN'
  | 'ASSISTED_PULL_UP'
  | 'NEGATIVE_PULL_UP'
  | 'WIDE_GRIP_PULLDOWN'
  | 'NEUTRAL_GRIP_PULLDOWN'
  | 'STRAIGHT_ARM_PULLDOWN'
  | 'PULLOVER'
  | 'ROPE_CLIMB'

  // VERTICAL PUSH (12)
  | 'OVERHEAD_PRESS'
  | 'DUMBBELL_SHOULDER_PRESS'
  | 'ARNOLD_PRESS'
  | 'PIKE_PUSH_UP'
  | 'HANDSTAND_PUSH_UP'
  | 'PUSH_PRESS'
  | 'SHOULDER_PRESS_MACHINE'
  | 'LATERAL_RAISE'
  | 'LATERAL_RAISE_MACHINE'
  | 'FRONT_RAISE'
  | 'REAR_DELT_FLY'
  | 'REAR_DELT_MACHINE'

  // CORE (15)
  | 'PLANK'
  | 'SIDE_PLANK'
  | 'DEAD_BUG'
  | 'BIRD_DOG'
  | 'HANGING_LEG_RAISE'
  | 'PALLOF_PRESS'
  | 'AB_WHEEL_ROLLOUT'
  | 'HOLLOW_BODY'
  | 'V_UPS'
  | 'RUSSIAN_TWIST'
  | 'WOODCHOP'
  | 'CABLE_CRUNCH'
  | 'SIT_UP'
  | 'CRUNCH'
  | 'LEG_LOWER'

  // ACCESSORY (12)
  | 'BICEP_CURL'
  | 'TRICEP_PUSHDOWN'
  | 'SKULL_CRUSHERS'
  | 'HAMMER_CURL'
  | 'PREACHER_CURL'
  | 'CALF_RAISE'
  | 'SHRUGS'
  | 'FOREARM_CURL'
  | 'WRIST_EXTENSION'
  | 'NECK_CURL'
  | 'HIP_ADDUCTION'
  | 'HIP_ABDUCTION'

  // Legacy aliases for backward compatibility
  | 'LUNGE_FORWARD'
  | 'LUNGE_REVERSE'
  | 'LATERAL_LUNGE'
  | 'DIP'
  | 'LEG_CURL'
  | 'CHEST_PRESS';

// ============================================
// RISULTATO ANALISI
// ============================================

export interface AnalysisRecommendations {
  immediate: string[];     // Da applicare subito
  accessories: string[];   // Esercizi complementari suggeriti
  mobility: string[];      // Lavoro di mobilità se necessario
}

export interface FormAnalysisResult {
  // Metadata
  exercise: SupportedExercise;
  duration: number;
  framesAnalyzed: number;

  // Proporzioni stimate
  estimatedProportions?: UserProportions;
  morphotype?: Morphotype;

  // Valutazione globale
  overallScore: number;  // 1-10

  // Problemi identificati (ordinati per priorità: SAFETY > EFFICIENCY > OPTIMIZATION)
  issues: Issue[];

  // Punti di forza
  strengths: string[];

  // Sticking point (se rilevato)
  stickingPoint?: StickingPointAnalysis;

  // Suggerimenti personalizzati
  recommendations: AnalysisRecommendations;
}

// ============================================
// CONFRONTO BILATERALE
// ============================================

export interface SideAnalysis {
  avgDepth: number;
  avgKneeValgus: number;
  avgTorsoLean: number;
  stickingPoint?: string;
}

export interface Asymmetry {
  type: 'DEPTH' | 'KNEE_VALGUS' | 'TORSO_LEAN' | 'STRENGTH';
  severity: IssueSeverity;
  weakerSide: 'LEFT' | 'RIGHT';
  worseSide?: 'LEFT' | 'RIGHT';
  delta: number;
}

export interface BilateralComparison {
  exercise: string;
  leftSide: SideAnalysis;
  rightSide: SideAnalysis;
  asymmetries: Asymmetry[];
  recommendations: string[];
}

// ============================================
// SETUP VIDEO
// ============================================

export type CameraPosition = '45_DEGREES_POSTERIOR_LATERAL';
export type CameraHeight = 'HIP_HEIGHT';

export interface VideoSetupInstructions {
  cameraPosition: CameraPosition;
  cameraHeight: CameraHeight;
  distance: string;
  userInstructions: string[];
  validationChecks: string[];
}

export interface CameraValidationResult {
  valid: boolean;
  estimatedAngle?: number;
  error?: 'CAMERA_TOO_LATERAL' | 'CAMERA_TOO_POSTERIOR' | 'BODY_NOT_VISIBLE' | 'POOR_LIGHTING';
  message?: string;
}

// ============================================
// SAFETY CHECKS CONFIG
// ============================================

export interface SafetyCheck {
  code: string;
  severity: IssueSeverity;
  description: string;
  correction: string;
  check: (frame: FrameAnalysis, morphotype?: Morphotype) => boolean;
}

export interface EfficiencyCheck {
  code: string;
  severity?: IssueSeverity;
  description: string;
  correction: string;
  check: (frames: FrameAnalysis[], morphotype?: Morphotype) => boolean;
}

// ============================================
// ADAPTFLOW INTEGRATION
// ============================================

export interface RecurringIssue {
  code: string;
  count: number;
  lastOccurrence: Date;
}

export interface AdaptFlowWarning {
  beforeExercises: string[];
  message: string;
}

export interface AdaptFlowIntegration {
  warmupAdditions?: string[];
  warnings?: AdaptFlowWarning[];
  exerciseModifications?: {
    exercise: string;
    modification: string;
    reason: string;
  }[];
}

// ============================================
// ANALISI ASIMMETRIE (VISTA 45° LATERO-POST.)
// ============================================

export type AsymmetryType = 'DEPTH' | 'KNEE_ANGLE' | 'HIP_ANGLE' | 'TORSO_ROTATION' | 'WEIGHT_SHIFT';
export type ScapularIssue = 'PROTRACTED' | 'ELEVATED' | 'ASYMMETRIC' | 'WINGING';

export interface AsymmetryAnalysis {
  hasAsymmetry: boolean;
  type?: AsymmetryType;
  weakerSide?: 'LEFT' | 'RIGHT';
  delta: number;
  severity: IssueSeverity;
  description?: string;
}

export interface ScapularAnalysis {
  isOptimal: boolean;
  issue?: ScapularIssue;
  severity: IssueSeverity;
  description?: string;
  correction?: string;
}

export interface LateroPosteriorAnalysis {
  depthAsymmetry: AsymmetryAnalysis;
  kneeAsymmetry: AsymmetryAnalysis;
  torsoRotation: AsymmetryAnalysis;
  weightShift: AsymmetryAnalysis;
  scapularPosition: ScapularAnalysis;
  overallSymmetryScore: number;  // 0-10
  issues: string[];
  recommendations: string[];
}
