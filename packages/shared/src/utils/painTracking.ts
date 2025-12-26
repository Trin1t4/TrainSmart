/**
 * ============================================================================
 * PAIN TRACKING SYSTEM - Real-time & Cross-Session
 * ============================================================================
 *
 * Sistema completo di tracking dolore con:
 * - Pre-workout screening (dolore prima della sessione)
 * - Intra-workout tracking (dolore che emerge durante)
 * - Post-exercise feedback (dolore a fine esercizio)
 * - Serie incompleta per dolore
 * - Memoria cross-sessione (esercizi problematici)
 * - Re-screening post warm-up
 * - Tracking progressivo (1→3→5→7)
 * - Multi-area severe (suggerisci riposo)
 *
 * @module painTracking
 * @version 2.0.0
 */

import type { PainArea, PainSeverity } from '../types';

// ============================================================================
// EXTENDED TYPES
// ============================================================================

/** Zone dolore estese (include zone non ancora nel sistema base) */
export type ExtendedPainArea = PainArea | 'neck' | 'upper_back' | 'forearm' | 'calf' | 'chest';

/** Zone dolore LATERALIZZATE (sinistro/destro) */
export type LateralizedPainArea =
  | 'left_knee' | 'right_knee'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_hip' | 'right_hip'
  | 'left_ankle' | 'right_ankle'
  | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist'
  | 'left_calf' | 'right_calf';

/** Tutte le zone possibili */
export type AllPainAreas = ExtendedPainArea | LateralizedPainArea;

/** Tipo di dolore (importante per distinguere DOMS da problemi reali) */
export type PainType =
  | 'muscular_doms'      // Indolenzimento muscolare post-allenamento (OK)
  | 'muscular_acute'     // Dolore muscolare acuto (potenziale strappo)
  | 'joint'              // Dolore articolare (ATTENZIONE)
  | 'tendon'             // Dolore tendineo (ATTENZIONE)
  | 'nerve'              // Dolore nervoso/irradiato (STOP)
  | 'bone'               // Dolore osseo (STOP + MEDICO)
  | 'unknown';           // Non specificato

/** Caratteristiche del dolore */
export type PainCharacter =
  | 'sharp'              // Acuto/pungente
  | 'dull'               // Sordo/profondo
  | 'burning'            // Bruciante
  | 'throbbing'          // Pulsante
  | 'stabbing'           // Lancinante
  | 'aching'             // Dolorante/indolenzito
  | 'tingling'           // Formicolio (nervoso)
  | 'radiating';         // Irradiato (nervoso)

/** Lateralità */
export type Laterality = 'left' | 'right' | 'bilateral' | 'central';

/** Timing del dolore riportato */
export type PainTiming = 'pre_workout' | 'during_warmup' | 'during_exercise' | 'post_exercise' | 'post_workout';

/** Azione risultante dal dolore */
export type PainAction =
  | 'continue'           // Continua normalmente
  | 'deload'             // Deload (-15% volume/intensità)
  | 'substitute'         // Sostituisci esercizio
  | 'skip_exercise'      // Salta questo esercizio
  | 'end_session'        // Termina sessione
  | 'rest_day';          // Suggerisci giorno di riposo

/** Record di dolore singolo - ESTESO */
export interface PainRecord {
  // Localizzazione
  area: AllPainAreas;        // Zona (può essere lateralizzata)
  laterality?: Laterality;   // Lateralità esplicita

  // Intensità e timing
  severity: number;          // 1-10
  timing: PainTiming;

  // Tipo e carattere (DOMS vs articolare)
  painType?: PainType;       // muscular_doms, joint, tendon, etc.
  painCharacter?: PainCharacter; // sharp, dull, burning, etc.

  // Contesto esercizio
  exerciseId?: string;       // Se durante/dopo esercizio specifico
  exerciseName?: string;
  setNumber?: number;        // Se durante una serie specifica
  repNumber?: number;        // Se durante una rep specifica (es. 3/8)

  // Metadata
  timestamp: string;         // ISO date
  notes?: string;
  wasIncomplete?: boolean;   // Se la serie è stata interrotta

  // Ciclo mestruale (se applicabile)
  cycleDay?: number;         // Giorno del ciclo (1-28+)
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

/** Stato dell'esercizio nel sistema di tracking */
export type ExerciseTrackingStatus =
  | 'normal'              // Nessun problema
  | 'warning'             // Primo episodio - riproponi con avviso
  | 'retry_pending'       // In attesa del secondo tentativo
  | 'recovery_plan'       // Secondo episodio - piano di recupero attivo
  | 'cooldown';           // In pausa forzata

/** Storico dolore per esercizio specifico */
export interface ExercisePainHistory {
  exerciseId: string;
  exerciseName: string;
  painRecords: PainRecord[];
  lastOccurrence: string;    // ISO date
  occurrenceCount: number;
  averageSeverity: number;
  status: ExerciseTrackingStatus;  // Stato corrente
  consecutiveIssues: number;       // Episodi consecutivi (reset se ok)
  lastSuccessfulSession?: string;  // Ultima sessione senza problemi
  retryScheduled?: string;         // Data del retry programmato
  flagReason?: string;
  suggestedAlternative?: string;
  recoveryPlan?: RecoveryPlan;     // Piano di recupero se attivato
}

/** Piano di recupero per esercizio problematico */
export interface RecoveryPlan {
  exerciseId: string;
  exerciseName: string;
  painArea: ExtendedPainArea;
  startDate: string;
  phase: 'active_rest' | 'mobility' | 'light_load' | 'progressive' | 'return_to_normal';
  currentWeek: number;
  totalWeeks: number;
  correctiveExercises: string[];
  alternativeExercise: string;
  progressionCriteria: string[];
  notes: string[];
}

/** Risultato del check esercizio per sessione successiva */
export interface NextSessionExerciseCheck {
  exerciseId: string;
  exerciseName: string;
  canPerform: boolean;
  status: ExerciseTrackingStatus;
  message: string;
  emoji: string;
  isRetry: boolean;           // È un secondo tentativo?
  showWarning: boolean;
  warningMessage?: string;
  alternative?: string;
  recoveryPlan?: RecoveryPlan;
}

/** Stato dolore progressivo intra-sessione */
export interface ProgressivePainState {
  area: ExtendedPainArea;
  initialSeverity: number;
  currentSeverity: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  history: { severity: number; timestamp: string; context: string }[];
  alertTriggered: boolean;
}

/** Risultato della valutazione dolore */
export interface PainEvaluationResult {
  action: PainAction;
  message: string;
  emoji: string;
  suggestions: string[];
  exerciseAlternative?: string;
  correctiveExercises?: string[];
  shouldLogForFuture: boolean;
  flagExercise?: boolean;
  cooldownDays?: number;     // Giorni prima di riproporre esercizio
}

/** Screening pre/post warm-up */
export interface PainScreening {
  timestamp: string;
  phase: 'pre_workout' | 'post_warmup';
  painAreas: {
    area: ExtendedPainArea;
    severity: number;
  }[];
  overallReadiness: number;  // 1-10
  canProceed: boolean;
  warnings: string[];
  adaptations: PainEvaluationResult[];
}

/** Feedback serie incompleta */
export interface IncompleteSetFeedback {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetReps: number;
  completedReps: number;
  reason: 'pain' | 'fatigue' | 'form_breakdown' | 'other';
  painDetails?: {
    area: ExtendedPainArea;
    severity: number;
    wasProgressive: boolean;  // Il dolore è aumentato durante la serie?
  };
  timestamp: string;
}

/** Sessione con tracking dolore completo */
export interface PainTrackedSession {
  sessionId: string;
  userId: string;
  date: string;
  preWorkoutScreening: PainScreening;
  postWarmupScreening?: PainScreening;
  intraSessionRecords: PainRecord[];
  incompleteSetFeedbacks: IncompleteSetFeedback[];
  progressivePainStates: ProgressivePainState[];
  exercisesModified: {
    exerciseId: string;
    originalExercise: string;
    replacement: string;
    reason: string;
  }[];
  sessionTerminatedEarly: boolean;
  terminationReason?: string;
}

/** Memoria cross-sessione per utente - ESTESA */
export interface UserPainMemory {
  userId: string;
  flaggedExercises: ExercisePainHistory[];
  chronicPainAreas: ChronicPainArea[];
  longTermHistory: LongTermPainHistory;
  exerciseCorrelations: ExercisePainCorrelation[];
  cycleCorrelations?: CyclePainCorrelation[];
  medicalAlerts: MedicalAlert[];
  lastUpdated: string;
}

/** Area di dolore cronico con tracking dettagliato */
export interface ChronicPainArea {
  area: AllPainAreas;
  laterality?: Laterality;
  firstReported: string;
  lastReported: string;
  averageSeverity: number;
  occurrences: number;
  predominantType?: PainType;
  predominantCharacter?: PainCharacter;
  trend: 'improving' | 'stable' | 'worsening';
  weeklyHistory: WeeklyPainSummary[];
}

/** Sommario settimanale dolore */
export interface WeeklyPainSummary {
  weekStart: string;           // ISO date (lunedì)
  weekEnd: string;             // ISO date (domenica)
  avgSeverity: number;
  maxSeverity: number;
  occurrences: number;
  sessionsAffected: number;
  totalSessions: number;
}

/** Storico lungo termine dolore */
export interface LongTermPainHistory {
  userId: string;
  startDate: string;
  totalRecords: number;
  areasSummary: {
    area: AllPainAreas;
    totalOccurrences: number;
    avgSeverity: number;
    firstSeen: string;
    lastSeen: string;
    monthlyTrend: MonthlyTrend[];
  }[];
  overallTrend: 'improving' | 'stable' | 'worsening';
  insights: string[];
}

/** Trend mensile */
export interface MonthlyTrend {
  month: string;              // YYYY-MM
  avgSeverity: number;
  occurrences: number;
  comparedToPrevious: 'better' | 'same' | 'worse';
}

/** Correlazione esercizio-dolore (pattern recognition) */
export interface ExercisePainCorrelation {
  exerciseId: string;
  exerciseName: string;
  painArea: AllPainAreas;
  correlationStrength: 'weak' | 'moderate' | 'strong';
  occurrences: number;
  avgSeverityWhenPerformed: number;
  avgSeverityWithout: number;
  confidence: number;          // 0-1
  suggestedAction: 'monitor' | 'modify' | 'avoid';
  lastAnalyzed: string;
  notes: string[];
}

/** Correlazione ciclo mestruale - dolore */
export interface CyclePainCorrelation {
  area: AllPainAreas;
  phaseCorrelations: {
    phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    avgSeverity: number;
    occurrences: number;
    isSignificant: boolean;    // > media generale
  }[];
  peakPhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  insights: string[];
}

/** Alert medico/fisioterapico */
export interface MedicalAlert {
  id: string;
  createdAt: string;
  type: 'chronic_pain' | 'recurring_injury' | 'nerve_symptoms' | 'bone_pain' | 'bilateral_severe';
  severity: 'info' | 'warning' | 'urgent';
  area: AllPainAreas;
  message: string;
  recommendation: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  triggerCriteria: string;
}

/** Warm-up adattivo basato su dolore */
export interface AdaptiveWarmup {
  baseDuration: number;        // Minuti base
  additionalMinutes: number;   // Minuti extra per dolore
  totalDuration: number;
  focusAreas: {
    area: AllPainAreas;
    exercises: WarmupExercise[];
    priority: 'high' | 'medium' | 'low';
  }[];
  generalExercises: WarmupExercise[];
  notes: string[];
}

/** Esercizio di warm-up */
export interface WarmupExercise {
  name: string;
  duration: number;            // Secondi
  sets?: number;
  reps?: number;
  notes?: string;
  targetArea: AllPainAreas | 'general';
}

/** Risultato valutazione tipo dolore */
export interface PainTypeEvaluation {
  likelyType: PainType;
  confidence: number;          // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  canContinue: boolean;
  action: PainAction;
  message: string;
  medicalAdvice?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Mapping zone estese → pattern affetti */
const EXTENDED_PAIN_PATTERN_MAP: Record<ExtendedPainArea, string[]> = {
  // Zone base
  knee: ['lower_push', 'lower_pull'],
  shoulder: ['horizontal_push', 'vertical_push', 'vertical_pull'],
  lower_back: ['lower_push', 'lower_pull', 'core'],
  wrist: ['horizontal_push', 'vertical_push', 'vertical_pull'],
  ankle: ['lower_push'],
  elbow: ['horizontal_push', 'vertical_push', 'horizontal_pull'],
  hip: ['lower_push', 'lower_pull'],
  neck: ['vertical_push', 'core', 'vertical_pull'],
  upper_back: ['horizontal_pull', 'vertical_pull', 'core'],
  forearm: ['horizontal_pull', 'vertical_pull', 'horizontal_push'],
  calf: ['lower_push'],
  chest: ['horizontal_push', 'vertical_push'],

  // Sub-aree gomito
  elbow_pull: ['horizontal_pull', 'vertical_pull'],
  elbow_push: ['horizontal_push', 'vertical_push'],

  // Sub-aree spalla
  shoulder_overhead: ['vertical_push', 'vertical_pull'],
  shoulder_push: ['horizontal_push', 'vertical_push'],
  shoulder_rotation: ['horizontal_pull', 'horizontal_push'],

  // Sub-aree ginocchio
  knee_flexion: ['lower_push'],
  knee_extension: ['lower_push'],
  knee_load: ['lower_push', 'lower_pull'],

  // Sub-aree anca
  hip_flexion: ['lower_push', 'core'],
  hip_extension: ['lower_pull'],
  hip_abduction: ['lower_push', 'lower_pull'],
  hip_rotation: ['lower_push', 'lower_pull'],

  // Sub-aree zona lombare
  lower_back_flexion: ['lower_push', 'core'],
  lower_back_extension: ['lower_pull', 'core'],
  lower_back_load: ['lower_push', 'lower_pull'],
  lower_back_rotation: ['core'],

  // Sub-aree caviglia
  ankle_dorsiflexion: ['lower_push'],
  ankle_plantarflexion: ['lower_push'],
  ankle_stability: ['lower_push'],
};

/** Label italiane per zone estese */
export const EXTENDED_PAIN_AREA_LABELS: Record<ExtendedPainArea, string> = {
  // Zone base
  knee: 'Ginocchio',
  shoulder: 'Spalla',
  lower_back: 'Zona Lombare',
  wrist: 'Polso',
  ankle: 'Caviglia',
  elbow: 'Gomito',
  hip: 'Anca',
  neck: 'Collo/Cervicale',
  upper_back: 'Zona Dorsale',
  forearm: 'Avambraccio',
  calf: 'Polpaccio',
  chest: 'Petto/Sterno',

  // Sub-aree gomito
  elbow_pull: 'Gomito (tirate)',
  elbow_push: 'Gomito (spinte)',

  // Sub-aree spalla
  shoulder_overhead: 'Spalla (sopra la testa)',
  shoulder_push: 'Spalla (spinte)',
  shoulder_rotation: 'Spalla (rotazione)',

  // Sub-aree ginocchio
  knee_flexion: 'Ginocchio (flessione)',
  knee_extension: 'Ginocchio (estensione)',
  knee_load: 'Ginocchio (carico)',

  // Sub-aree anca
  hip_flexion: 'Anca (flessione)',
  hip_extension: 'Anca (estensione)',
  hip_abduction: 'Anca (abduzione)',
  hip_rotation: 'Anca (rotazione)',

  // Sub-aree zona lombare
  lower_back_flexion: 'Lombare (flessione)',
  lower_back_extension: 'Lombare (estensione)',
  lower_back_load: 'Lombare (carico)',
  lower_back_rotation: 'Lombare (rotazione)',

  // Sub-aree caviglia
  ankle_dorsiflexion: 'Caviglia (dorsiflessione)',
  ankle_plantarflexion: 'Caviglia (plantarflessione)',
  ankle_stability: 'Caviglia (stabilità)',
};

/** Soglie per azioni */
const PAIN_THRESHOLDS = {
  MILD_MAX: 3,           // 1-3 = mild
  MODERATE_MAX: 5,       // 4-5 = moderate (legacy, ora = severe)
  SEVERE_MIN: 4,         // 4+ = severe (conservative)
  CRITICAL_MIN: 7,       // 7+ = stop immediato
  PROGRESSIVE_ALERT: 2,  // Aumento di +2 punti = alert
  MAX_SEVERE_AREAS: 2,   // Max aree severe prima di suggerire riposo
};

/** Giorni di cooldown per severità */
const COOLDOWN_DAYS_BY_SEVERITY: Record<string, number> = {
  mild: 0,
  moderate: 3,
  severe: 7,
  critical: 14
};

/** Label per zone lateralizzate */
export const LATERALIZED_PAIN_AREA_LABELS: Record<LateralizedPainArea, string> = {
  left_knee: 'Ginocchio Sinistro',
  right_knee: 'Ginocchio Destro',
  left_shoulder: 'Spalla Sinistra',
  right_shoulder: 'Spalla Destra',
  left_hip: 'Anca Sinistra',
  right_hip: 'Anca Destra',
  left_ankle: 'Caviglia Sinistra',
  right_ankle: 'Caviglia Destra',
  left_elbow: 'Gomito Sinistro',
  right_elbow: 'Gomito Destro',
  left_wrist: 'Polso Sinistro',
  right_wrist: 'Polso Destro',
  left_calf: 'Polpaccio Sinistro',
  right_calf: 'Polpaccio Destro'
};

/** Label per tipo di dolore */
export const PAIN_TYPE_LABELS: Record<PainType, string> = {
  muscular_doms: 'Indolenzimento muscolare (DOMS)',
  muscular_acute: 'Dolore muscolare acuto',
  joint: 'Dolore articolare',
  tendon: 'Dolore tendineo',
  nerve: 'Dolore nervoso/irradiato',
  bone: 'Dolore osseo',
  unknown: 'Non specificato'
};

/** Label per carattere dolore */
export const PAIN_CHARACTER_LABELS: Record<PainCharacter, string> = {
  sharp: 'Acuto/Pungente',
  dull: 'Sordo/Profondo',
  burning: 'Bruciante',
  throbbing: 'Pulsante',
  stabbing: 'Lancinante',
  aching: 'Dolorante/Indolenzito',
  tingling: 'Formicolio',
  radiating: 'Irradiato'
};

/** Rischio per tipo di dolore */
const PAIN_TYPE_RISK: Record<PainType, { risk: 'low' | 'medium' | 'high' | 'critical'; canContinue: boolean }> = {
  muscular_doms: { risk: 'low', canContinue: true },      // DOMS è normale!
  muscular_acute: { risk: 'medium', canContinue: false }, // Potenziale strappo
  joint: { risk: 'high', canContinue: false },            // Articolare = stop
  tendon: { risk: 'high', canContinue: false },           // Tendineo = stop
  nerve: { risk: 'critical', canContinue: false },        // Nervoso = stop + medico
  bone: { risk: 'critical', canContinue: false },         // Osseo = stop + medico urgente
  unknown: { risk: 'medium', canContinue: false }         // Non rischiare
};

/** Caratteri che suggeriscono problemi nervosi */
const NERVE_PAIN_CHARACTERS: PainCharacter[] = ['tingling', 'radiating', 'burning'];

/** Soglie per alert medico */
const MEDICAL_ALERT_THRESHOLDS = {
  CHRONIC_WEEKS: 3,            // Dolore per 3+ settimane = cronico
  RECURRING_OCCURRENCES: 5,    // 5+ episodi stesso esercizio
  CONSECUTIVE_SESSIONS: 3,     // 3 sessioni consecutive con stesso dolore
  BILATERAL_SEVERE_MIN: 5,     // Bilaterale severo
};

/**
 * Popolazioni speciali che richiedono riscaldamento autonomo
 * - Gravidanza/Pre-partum: esercizi ad impatto vietati
 * - Post-partum: fase delicata di recupero
 * - Recupero motorio: necessità specifiche
 * - Disabilità: adattamenti individuali
 */
export const SPECIAL_POPULATION_GOALS = [
  'gravidanza',
  'pregnancy',
  'pre_partum',
  'prepartum',
  'post_partum',
  'postpartum',
  'motor_recovery',
  'recupero_motorio',
  'disability',
  'disabilita'
] as const;

export type SpecialPopulationGoal = typeof SPECIAL_POPULATION_GOALS[number];

/** Warm-up base per zona (esercizi e durata) */
const WARMUP_EXERCISES_BY_AREA: Record<ExtendedPainArea, WarmupExercise[]> = {
  knee: [
    { name: 'Knee Circles', duration: 30, targetArea: 'knee' },
    { name: 'Bodyweight Squats (partial ROM)', duration: 60, sets: 2, reps: 10, targetArea: 'knee' },
    { name: 'VMO Activation', duration: 45, targetArea: 'knee' },
    { name: 'Leg Swings', duration: 30, targetArea: 'knee' }
  ],
  shoulder: [
    { name: 'Arm Circles', duration: 30, targetArea: 'shoulder' },
    { name: 'Shoulder Dislocations', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' },
    { name: 'Band Pull-Aparts', duration: 45, sets: 2, reps: 15, targetArea: 'shoulder' },
    { name: 'Wall Slides', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' }
  ],
  lower_back: [
    { name: 'Cat-Cow', duration: 60, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Pelvic Tilts', duration: 45, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Bird Dog', duration: 60, sets: 2, reps: 8, targetArea: 'lower_back' },
    { name: 'Dead Bug', duration: 60, sets: 2, reps: 8, targetArea: 'lower_back' }
  ],
  wrist: [
    { name: 'Wrist Circles', duration: 30, targetArea: 'wrist' },
    { name: 'Wrist Flexion/Extension', duration: 45, targetArea: 'wrist' },
    { name: 'Prayer Stretch', duration: 30, targetArea: 'wrist' },
    { name: 'Finger Flexion', duration: 30, targetArea: 'wrist' }
  ],
  ankle: [
    { name: 'Ankle Circles', duration: 30, targetArea: 'ankle' },
    { name: 'Calf Raises (slow)', duration: 45, sets: 2, reps: 10, targetArea: 'ankle' },
    { name: 'Dorsiflexion Stretch', duration: 45, targetArea: 'ankle' }
  ],
  elbow: [
    { name: 'Elbow Circles', duration: 30, targetArea: 'elbow' },
    { name: 'Forearm Pronation/Supination', duration: 45, targetArea: 'elbow' },
    { name: 'Wrist Curls (light)', duration: 45, sets: 2, reps: 10, targetArea: 'elbow' }
  ],
  hip: [
    { name: 'Hip Circles', duration: 30, targetArea: 'hip' },
    { name: '90/90 Stretch', duration: 60, targetArea: 'hip' },
    { name: 'Hip Flexor Stretch', duration: 45, targetArea: 'hip' },
    { name: 'Glute Bridges', duration: 45, sets: 2, reps: 10, targetArea: 'hip' }
  ],
  neck: [
    { name: 'Neck Rotations', duration: 30, targetArea: 'neck' },
    { name: 'Chin Tucks', duration: 30, sets: 2, reps: 10, targetArea: 'neck' },
    { name: 'Levator Scapulae Stretch', duration: 45, targetArea: 'neck' }
  ],
  upper_back: [
    { name: 'Thoracic Rotations', duration: 45, targetArea: 'upper_back' },
    { name: 'Thread the Needle', duration: 60, sets: 2, reps: 8, targetArea: 'upper_back' },
    { name: 'Foam Roll T-Spine', duration: 60, targetArea: 'upper_back' }
  ],
  forearm: [
    { name: 'Forearm Stretch', duration: 30, targetArea: 'forearm' },
    { name: 'Wrist Curls', duration: 45, sets: 2, reps: 10, targetArea: 'forearm' },
    { name: 'Reverse Wrist Curls', duration: 45, sets: 2, reps: 10, targetArea: 'forearm' }
  ],
  calf: [
    { name: 'Calf Raises', duration: 45, sets: 2, reps: 10, targetArea: 'calf' },
    { name: 'Standing Calf Stretch', duration: 45, targetArea: 'calf' },
    { name: 'Ankle Mobility Drills', duration: 45, targetArea: 'calf' }
  ],
  chest: [
    { name: 'Arm Circles', duration: 30, targetArea: 'chest' },
    { name: 'Doorway Stretch', duration: 45, targetArea: 'chest' },
    { name: 'Push-up Plus', duration: 45, sets: 2, reps: 10, targetArea: 'chest' }
  ],

  // Sub-aree gomito (ereditano da elbow)
  elbow_pull: [
    { name: 'Elbow Circles', duration: 30, targetArea: 'elbow' },
    { name: 'Forearm Supination', duration: 45, targetArea: 'elbow' },
    { name: 'Light Bicep Curls', duration: 45, sets: 2, reps: 10, targetArea: 'elbow' }
  ],
  elbow_push: [
    { name: 'Elbow Circles', duration: 30, targetArea: 'elbow' },
    { name: 'Tricep Stretch', duration: 45, targetArea: 'elbow' },
    { name: 'Light Tricep Extensions', duration: 45, sets: 2, reps: 10, targetArea: 'elbow' }
  ],

  // Sub-aree spalla (ereditano da shoulder)
  shoulder_overhead: [
    { name: 'Arm Circles', duration: 30, targetArea: 'shoulder' },
    { name: 'Wall Slides', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' },
    { name: 'Shoulder Dislocations', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' }
  ],
  shoulder_push: [
    { name: 'Arm Circles', duration: 30, targetArea: 'shoulder' },
    { name: 'Band Pull-Aparts', duration: 45, sets: 2, reps: 15, targetArea: 'shoulder' },
    { name: 'Push-up Plus', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' }
  ],
  shoulder_rotation: [
    { name: 'Arm Circles', duration: 30, targetArea: 'shoulder' },
    { name: 'External Rotation', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' },
    { name: 'Internal Rotation', duration: 45, sets: 2, reps: 10, targetArea: 'shoulder' }
  ],

  // Sub-aree ginocchio (ereditano da knee)
  knee_flexion: [
    { name: 'Knee Circles', duration: 30, targetArea: 'knee' },
    { name: 'Partial ROM Squats', duration: 60, sets: 2, reps: 10, targetArea: 'knee' },
    { name: 'Hamstring Curls', duration: 45, sets: 2, reps: 10, targetArea: 'knee' }
  ],
  knee_extension: [
    { name: 'Knee Circles', duration: 30, targetArea: 'knee' },
    { name: 'VMO Activation', duration: 45, targetArea: 'knee' },
    { name: 'Terminal Knee Extensions', duration: 45, sets: 2, reps: 10, targetArea: 'knee' }
  ],
  knee_load: [
    { name: 'Knee Circles', duration: 30, targetArea: 'knee' },
    { name: 'Bodyweight Squats (partial ROM)', duration: 60, sets: 2, reps: 10, targetArea: 'knee' },
    { name: 'Wall Sits', duration: 45, targetArea: 'knee' }
  ],

  // Sub-aree anca (ereditano da hip)
  hip_flexion: [
    { name: 'Hip Circles', duration: 30, targetArea: 'hip' },
    { name: 'Hip Flexor Stretch', duration: 45, targetArea: 'hip' },
    { name: 'Leg Swings (front-back)', duration: 30, targetArea: 'hip' }
  ],
  hip_extension: [
    { name: 'Hip Circles', duration: 30, targetArea: 'hip' },
    { name: 'Glute Bridges', duration: 45, sets: 2, reps: 10, targetArea: 'hip' },
    { name: 'Bird Dog', duration: 60, sets: 2, reps: 8, targetArea: 'hip' }
  ],
  hip_abduction: [
    { name: 'Hip Circles', duration: 30, targetArea: 'hip' },
    { name: 'Side Leg Raises', duration: 45, sets: 2, reps: 10, targetArea: 'hip' },
    { name: 'Clamshells', duration: 45, sets: 2, reps: 10, targetArea: 'hip' }
  ],
  hip_rotation: [
    { name: 'Hip Circles', duration: 30, targetArea: 'hip' },
    { name: '90/90 Stretch', duration: 60, targetArea: 'hip' },
    { name: 'Piriformis Stretch', duration: 45, targetArea: 'hip' }
  ],

  // Sub-aree zona lombare (ereditano da lower_back)
  lower_back_flexion: [
    { name: 'Cat-Cow', duration: 60, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Pelvic Tilts', duration: 45, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Child Pose', duration: 45, targetArea: 'lower_back' }
  ],
  lower_back_extension: [
    { name: 'Cat-Cow', duration: 60, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Cobra Stretch', duration: 45, targetArea: 'lower_back' },
    { name: 'Prone Press-ups', duration: 45, sets: 2, reps: 8, targetArea: 'lower_back' }
  ],
  lower_back_load: [
    { name: 'Cat-Cow', duration: 60, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Dead Bug', duration: 60, sets: 2, reps: 8, targetArea: 'lower_back' },
    { name: 'Bird Dog', duration: 60, sets: 2, reps: 8, targetArea: 'lower_back' }
  ],
  lower_back_rotation: [
    { name: 'Cat-Cow', duration: 60, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Lumbar Rotations', duration: 45, sets: 2, reps: 10, targetArea: 'lower_back' },
    { name: 'Thread the Needle', duration: 60, sets: 2, reps: 8, targetArea: 'lower_back' }
  ],

  // Sub-aree caviglia (ereditano da ankle)
  ankle_dorsiflexion: [
    { name: 'Ankle Circles', duration: 30, targetArea: 'ankle' },
    { name: 'Dorsiflexion Stretch', duration: 45, targetArea: 'ankle' },
    { name: 'Wall Ankle Mobilization', duration: 45, targetArea: 'ankle' }
  ],
  ankle_plantarflexion: [
    { name: 'Ankle Circles', duration: 30, targetArea: 'ankle' },
    { name: 'Calf Raises (slow)', duration: 45, sets: 2, reps: 10, targetArea: 'ankle' },
    { name: 'Toe Walks', duration: 30, targetArea: 'ankle' }
  ],
  ankle_stability: [
    { name: 'Ankle Circles', duration: 30, targetArea: 'ankle' },
    { name: 'Single Leg Balance', duration: 45, targetArea: 'ankle' },
    { name: 'Alphabet Ankles', duration: 45, targetArea: 'ankle' }
  ],
};

// ============================================================================
// CORE EVALUATION FUNCTIONS
// ============================================================================

/**
 * Converte severità numerica in categoria
 */
export function getSeverityCategory(severity: number): 'mild' | 'moderate' | 'severe' | 'critical' {
  if (severity <= PAIN_THRESHOLDS.MILD_MAX) return 'mild';
  if (severity <= PAIN_THRESHOLDS.MODERATE_MAX) return 'moderate';
  if (severity < PAIN_THRESHOLDS.CRITICAL_MIN) return 'severe';
  return 'critical';
}

/**
 * SCENARIO 1: Valuta dolore PRE-WORKOUT
 * Dolore segnalato prima di iniziare la sessione
 */
export function evaluatePreWorkoutPain(
  area: ExtendedPainArea,
  severity: number,
  exerciseName?: string
): PainEvaluationResult {
  const category = getSeverityCategory(severity);

  // 1-3 = MILD: Deload, monitora
  if (category === 'mild') {
    return {
      action: 'deload',
      message: `Dolore lieve (${severity}/10) a ${EXTENDED_PAIN_AREA_LABELS[area]}`,
      emoji: '⚠️',
      suggestions: [
        'Warm-up extra per la zona interessata',
        'Monitora durante l\'esecuzione',
        'Interrompi se il dolore aumenta'
      ],
      shouldLogForFuture: true,
      flagExercise: false
    };
  }

  // 4-6 = SEVERE: Evita esercizio, sostituisci
  if (category === 'moderate' || category === 'severe') {
    return {
      action: 'substitute',
      message: `Dolore significativo (${severity}/10) a ${EXTENDED_PAIN_AREA_LABELS[area]} - Esercizio sostituito`,
      emoji: '🛑',
      suggestions: [
        'Esercizio sostituito con alternativa sicura',
        'Aggiunti esercizi correttivi',
        'Rivaluta domani'
      ],
      exerciseAlternative: exerciseName ? getGenericAlternative(area) : undefined,
      correctiveExercises: getCorrectivesForArea(area),
      shouldLogForFuture: true,
      flagExercise: true,
      cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.severe
    };
  }

  // 7+ = CRITICAL: Stop sessione
  return {
    action: 'rest_day',
    message: `Dolore critico (${severity}/10) a ${EXTENDED_PAIN_AREA_LABELS[area]} - Sessione sconsigliata`,
    emoji: '🚨',
    suggestions: [
      'Giorno di riposo consigliato',
      'Mobilità leggera se tollerata',
      'Consulta un professionista se persiste'
    ],
    shouldLogForFuture: true,
    flagExercise: true,
    cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.critical
  };
}

/**
 * SCENARIO 2: Valuta dolore DURANTE l'esercizio (emerge a metà serie)
 * Più conservativo del pre-workout perché è un campanello d'allarme
 */
export function evaluateIntraExercisePain(
  area: ExtendedPainArea,
  severity: number,
  exerciseName: string,
  setNumber: number,
  repAtPain?: number,
  totalReps?: number
): PainEvaluationResult {
  const category = getSeverityCategory(severity);

  // Dolore che emerge durante = sempre più serio del pre-workout
  // Perché il corpo sta dicendo "questo movimento fa male ORA"

  // 1-3 = Completa serie con cautela, poi valuta
  if (category === 'mild') {
    return {
      action: 'continue',
      message: `Dolore emerso (${severity}/10) durante ${exerciseName} - Completa con cautela`,
      emoji: '⚡',
      suggestions: [
        repAtPain ? `Fermato alla rep ${repAtPain}/${totalReps}` : 'Monitora attentamente',
        'Se aumenta, interrompi immediatamente',
        'Prossima serie: riduci ROM o carico'
      ],
      shouldLogForFuture: true,
      flagExercise: severity >= 3  // Flag anche se mild ma vicino a 3
    };
  }

  // 4-5 = STOP immediato, serie incompleta ok
  if (category === 'moderate') {
    return {
      action: 'skip_exercise',
      message: `⚠️ STOP - Dolore ${severity}/10 durante ${exerciseName}`,
      emoji: '🛑',
      suggestions: [
        'Interrompi questo esercizio',
        'Non forzare il completamento',
        `Passa a: ${getGenericAlternative(area)}`,
        'Flag esercizio per sessioni future'
      ],
      exerciseAlternative: getGenericAlternative(area),
      correctiveExercises: getCorrectivesForArea(area),
      shouldLogForFuture: true,
      flagExercise: true,
      cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.moderate
    };
  }

  // 6+ durante esercizio = STOP sessione
  return {
    action: 'end_session',
    message: `🚨 STOP IMMEDIATO - Dolore ${severity}/10 durante ${exerciseName}`,
    emoji: '🚨',
    suggestions: [
      'Interrompi la sessione',
      'Applica ghiaccio se necessario',
      'Riposo per il resto della giornata',
      'Consulta un professionista se non migliora'
    ],
    shouldLogForFuture: true,
    flagExercise: true,
    cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.critical
  };
}

/**
 * SCENARIO 3: Valuta dolore POST-ESERCIZIO (dopo aver completato)
 * Meno urgente ma importante per sessioni future
 */
export function evaluatePostExercisePain(
  area: ExtendedPainArea,
  severity: number,
  exerciseName: string
): PainEvaluationResult {
  const category = getSeverityCategory(severity);

  // Dolore post = il movimento è stato completato ma ha lasciato dolore
  // Importante per programmare le sessioni future

  if (category === 'mild') {
    return {
      action: 'continue',
      message: `Dolore post-esercizio lieve (${severity}/10) dopo ${exerciseName}`,
      emoji: '📝',
      suggestions: [
        'Annotato per monitoraggio',
        'Se persiste nelle prossime sessioni, verrà sostituito',
        'Stretching consigliato per la zona'
      ],
      correctiveExercises: getCorrectivesForArea(area).slice(0, 2),
      shouldLogForFuture: true,
      flagExercise: false
    };
  }

  if (category === 'moderate') {
    return {
      action: 'substitute',
      message: `Dolore post-esercizio moderato (${severity}/10) dopo ${exerciseName}`,
      emoji: '⚠️',
      suggestions: [
        'Esercizio flaggato',
        'Prossima sessione: alternativa proposta',
        'Stretching e mobilità consigliati'
      ],
      exerciseAlternative: getGenericAlternative(area),
      correctiveExercises: getCorrectivesForArea(area),
      shouldLogForFuture: true,
      flagExercise: true,
      cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.moderate
    };
  }

  // 6+ post = esercizio problematico
  return {
    action: 'substitute',
    message: `Dolore post-esercizio significativo (${severity}/10) dopo ${exerciseName}`,
    emoji: '🛑',
    suggestions: [
      'Esercizio sospeso per 1 settimana',
      'Alternativa obbligatoria nelle prossime sessioni',
      'Se persiste, consulta un professionista'
    ],
    exerciseAlternative: getGenericAlternative(area),
    correctiveExercises: getCorrectivesForArea(area),
    shouldLogForFuture: true,
    flagExercise: true,
    cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.severe
  };
}

/**
 * SCENARIO 4: Serie incompleta per dolore
 */
export function evaluateIncompleteSet(
  feedback: IncompleteSetFeedback
): PainEvaluationResult {
  if (feedback.reason !== 'pain' || !feedback.painDetails) {
    // Non è per dolore, gestisci diversamente
    return {
      action: 'continue',
      message: `Serie incompleta (${feedback.completedReps}/${feedback.targetReps}) - ${feedback.reason}`,
      emoji: '📝',
      suggestions: ['Annotato per analisi'],
      shouldLogForFuture: false
    };
  }

  const { area, severity, wasProgressive } = feedback.painDetails;
  const completionRate = feedback.completedReps / feedback.targetReps;

  // Dolore progressivo = più grave
  if (wasProgressive) {
    return {
      action: 'skip_exercise',
      message: `Serie interrotta (${feedback.completedReps}/${feedback.targetReps}) - Dolore crescente ${severity}/10`,
      emoji: '🛑',
      suggestions: [
        'Dolore aumentato durante la serie = campanello d\'allarme',
        'Salta le serie rimanenti di questo esercizio',
        `Passa a: ${getGenericAlternative(area)}`,
        'Esercizio flaggato per revisione'
      ],
      exerciseAlternative: getGenericAlternative(area),
      shouldLogForFuture: true,
      flagExercise: true,
      cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.severe
    };
  }

  // Dolore stabile ma ha costretto a fermarsi
  if (completionRate < 0.5) {
    // Meno del 50% completato = esercizio inadatto
    return {
      action: 'skip_exercise',
      message: `Serie fortemente limitata (${feedback.completedReps}/${feedback.targetReps}) da dolore ${severity}/10`,
      emoji: '⚠️',
      suggestions: [
        'Esercizio troppo impegnativo per la condizione attuale',
        'Passa ad alternativa più conservativa',
        'Rivaluta tra 3-5 giorni'
      ],
      exerciseAlternative: getGenericAlternative(area),
      shouldLogForFuture: true,
      flagExercise: true,
      cooldownDays: COOLDOWN_DAYS_BY_SEVERITY.moderate
    };
  }

  // Completato >50% ma non tutto
  return {
    action: 'deload',
    message: `Serie parziale (${feedback.completedReps}/${feedback.targetReps}) per dolore ${severity}/10`,
    emoji: '📝',
    suggestions: [
      'Prossima serie: riduci carico/ROM',
      'Se persiste, passa ad alternativa',
      'Annotato per monitoraggio'
    ],
    shouldLogForFuture: true,
    flagExercise: severity >= 4
  };
}

// ============================================================================
// SCREENING FUNCTIONS
// ============================================================================

/**
 * Esegui screening pre-workout completo
 */
export function performPreWorkoutScreening(
  painAreas: { area: ExtendedPainArea; severity: number }[]
): PainScreening {
  const timestamp = new Date().toISOString();
  const warnings: string[] = [];
  const adaptations: PainEvaluationResult[] = [];

  let canProceed = true;
  let severeCount = 0;
  let totalSeverity = 0;

  painAreas.forEach(({ area, severity }) => {
    totalSeverity += severity;

    const evaluation = evaluatePreWorkoutPain(area, severity);
    adaptations.push(evaluation);

    if (evaluation.action === 'rest_day') {
      canProceed = false;
      warnings.push(evaluation.message);
    } else if (evaluation.action === 'substitute') {
      severeCount++;
      warnings.push(evaluation.message);
    }
  });

  // Troppi dolori severe = suggerisci riposo
  if (severeCount > PAIN_THRESHOLDS.MAX_SEVERE_AREAS) {
    canProceed = false;
    warnings.unshift(`🛑 ${severeCount} zone con dolore significativo - Giorno di riposo consigliato`);
  }

  // Calcola readiness (10 - media severity pesata)
  const avgSeverity = painAreas.length > 0 ? totalSeverity / painAreas.length : 0;
  const overallReadiness = Math.max(1, Math.round(10 - avgSeverity));

  return {
    timestamp,
    phase: 'pre_workout',
    painAreas,
    overallReadiness,
    canProceed,
    warnings,
    adaptations
  };
}

/**
 * SCENARIO B: Re-screening post warm-up
 * Il dolore potrebbe essere passato dopo il riscaldamento
 */
export function performPostWarmupScreening(
  preWorkoutScreening: PainScreening,
  currentPainAreas: { area: ExtendedPainArea; severity: number }[]
): PainScreening {
  const timestamp = new Date().toISOString();
  const warnings: string[] = [];
  const adaptations: PainEvaluationResult[] = [];

  let canProceed = true;
  let improvements = 0;
  let worsenings = 0;

  // Confronta con pre-workout
  currentPainAreas.forEach(({ area, severity }) => {
    const prePain = preWorkoutScreening.painAreas.find(p => p.area === area);

    if (prePain) {
      const diff = severity - prePain.severity;
      if (diff <= -2) {
        improvements++;
        warnings.push(`✅ ${EXTENDED_PAIN_AREA_LABELS[area]}: migliorato (${prePain.severity} → ${severity})`);
      } else if (diff >= 2) {
        worsenings++;
        warnings.push(`❌ ${EXTENDED_PAIN_AREA_LABELS[area]}: peggiorato (${prePain.severity} → ${severity})`);
      }
    }

    const evaluation = evaluatePreWorkoutPain(area, severity);
    adaptations.push(evaluation);

    if (evaluation.action === 'rest_day') {
      canProceed = false;
    }
  });

  // Se è migliorato significativamente, sblocca esercizi
  if (improvements > 0 && worsenings === 0) {
    warnings.unshift(`🎉 Miglioramento post warm-up! ${improvements} zone migliorate`);
  }

  // Se è peggiorato dopo warm-up = brutto segno
  if (worsenings > 0) {
    warnings.unshift(`⚠️ Attenzione: ${worsenings} zone peggiorate dopo il warm-up`);
    if (worsenings >= 2) {
      canProceed = false;
      warnings.unshift('🛑 Peggioramento multiplo - Consigliato riposo');
    }
  }

  const totalSeverity = currentPainAreas.reduce((sum, p) => sum + p.severity, 0);
  const avgSeverity = currentPainAreas.length > 0 ? totalSeverity / currentPainAreas.length : 0;
  const overallReadiness = Math.max(1, Math.round(10 - avgSeverity));

  return {
    timestamp,
    phase: 'post_warmup',
    painAreas: currentPainAreas,
    overallReadiness,
    canProceed,
    warnings,
    adaptations
  };
}

// ============================================================================
// PROGRESSIVE PAIN TRACKING
// ============================================================================

/**
 * SCENARIO C: Tracking dolore progressivo intra-sessione
 * Monitora se il dolore sta aumentando durante la sessione
 */
export function updateProgressivePainState(
  currentStates: ProgressivePainState[],
  newRecord: PainRecord
): { updatedStates: ProgressivePainState[]; alert: PainEvaluationResult | null } {
  const existingState = currentStates.find(s => s.area === newRecord.area);
  let alert: PainEvaluationResult | null = null;

  if (existingState) {
    // Aggiorna stato esistente
    const prevSeverity = existingState.currentSeverity;
    const increase = newRecord.severity - prevSeverity;

    existingState.currentSeverity = newRecord.severity;
    existingState.history.push({
      severity: newRecord.severity,
      timestamp: newRecord.timestamp,
      context: newRecord.exerciseName || 'unknown'
    });

    // Determina trend
    if (increase >= 2) {
      existingState.trend = 'increasing';
    } else if (increase <= -2) {
      existingState.trend = 'decreasing';
    } else {
      existingState.trend = 'stable';
    }

    // Alert se aumento significativo
    if (increase >= PAIN_THRESHOLDS.PROGRESSIVE_ALERT && !existingState.alertTriggered) {
      existingState.alertTriggered = true;
      alert = {
        action: newRecord.severity >= 6 ? 'end_session' : 'skip_exercise',
        message: `🚨 ALERT: Dolore a ${getPainAreaLabel(newRecord.area)} in aumento (${prevSeverity} → ${newRecord.severity})`,
        emoji: '📈',
        suggestions: [
          'Il dolore sta peggiorando durante la sessione',
          newRecord.severity >= 6 ? 'Termina la sessione' : 'Evita esercizi che coinvolgono questa zona',
          'Questo è un campanello d\'allarme importante'
        ],
        correctiveExercises: getCorrectivesForArea(newRecord.area as ExtendedPainArea),
        shouldLogForFuture: true,
        flagExercise: true
      };
    }
  } else {
    // Nuovo tracking
    currentStates.push({
      area: newRecord.area as ExtendedPainArea,
      initialSeverity: newRecord.severity,
      currentSeverity: newRecord.severity,
      trend: 'stable',
      history: [{
        severity: newRecord.severity,
        timestamp: newRecord.timestamp,
        context: newRecord.exerciseName || 'initial'
      }],
      alertTriggered: false
    });
  }

  return { updatedStates: currentStates, alert };
}

// ============================================================================
// CROSS-SESSION MEMORY
// ============================================================================

/**
 * Aggiorna memoria dolore per sessioni future
 * LOGICA RETRY:
 * - 1° episodio → status = 'warning' (riproponi con avviso)
 * - 2° episodio consecutivo → status = 'recovery_plan' (attiva piano)
 * - Sessione senza problemi → reset a 'normal'
 */
export function updatePainMemory(
  memory: UserPainMemory,
  sessionData: PainTrackedSession
): UserPainMemory {
  const updated = { ...memory, lastUpdated: new Date().toISOString() };
  const today = new Date().toISOString();

  // Processa tutti i record di dolore della sessione
  const exercisePainMap = new Map<string, PainRecord[]>();
  const exercisesWithoutPain = new Set<string>();

  // Raccogli esercizi con dolore
  sessionData.intraSessionRecords.forEach(record => {
    if (record.exerciseId) {
      const existing = exercisePainMap.get(record.exerciseId) || [];
      existing.push(record);
      exercisePainMap.set(record.exerciseId, existing);
    }
  });

  // Identifica esercizi completati SENZA dolore (per reset)
  sessionData.exercisesModified.forEach(mod => {
    if (!exercisePainMap.has(mod.exerciseId)) {
      exercisesWithoutPain.add(mod.exerciseId);
    }
  });

  // RESET: Esercizi completati senza problemi
  exercisesWithoutPain.forEach(exerciseId => {
    const existing = updated.flaggedExercises.find(f => f.exerciseId === exerciseId);
    if (existing && (existing.status === 'warning' || existing.status === 'retry_pending')) {
      // Era in warning/retry, ora è ok → reset a normal
      existing.status = 'normal';
      existing.consecutiveIssues = 0;
      existing.lastSuccessfulSession = today;
      existing.flagReason = undefined;
      console.log(`[PAIN_MEMORY] Reset ${exerciseId} a normal - sessione completata senza dolore`);
    }
  });

  // AGGIORNA: Esercizi con dolore
  exercisePainMap.forEach((records, exerciseId) => {
    const maxSeverity = Math.max(...records.map(r => r.severity));
    const exerciseName = records[0].exerciseName || exerciseId;
    const area = records[0].area as ExtendedPainArea;

    // Solo se severità >= 4 è significativo
    if (maxSeverity >= 4) {
      const existing = updated.flaggedExercises.find(f => f.exerciseId === exerciseId);

      if (existing) {
        // Esiste già storico
        existing.painRecords.push(...records);
        existing.lastOccurrence = today;
        existing.occurrenceCount++;
        existing.averageSeverity =
          (existing.averageSeverity * (existing.occurrenceCount - 1) + maxSeverity) / existing.occurrenceCount;

        // LOGICA RETRY:
        if (existing.status === 'normal' || existing.status === 'warning') {
          // 1° episodio (o primo dopo reset) → Warning, riproponi
          existing.status = 'warning';
          existing.consecutiveIssues = 1;
          existing.retryScheduled = today; // Prossima sessione
          existing.flagReason = `Dolore ${maxSeverity}/10 - riprova nella prossima sessione`;
          console.log(`[PAIN_MEMORY] ${exerciseId} → WARNING (1° episodio)`);

        } else if (existing.status === 'retry_pending') {
          // 2° episodio consecutivo → Attiva piano di recupero!
          existing.status = 'recovery_plan';
          existing.consecutiveIssues = 2;
          existing.flagReason = `Dolore confermato (${maxSeverity}/10) - Piano di recupero attivato`;
          existing.recoveryPlan = createRecoveryPlan(exerciseId, exerciseName, area, maxSeverity);
          console.log(`[PAIN_MEMORY] ${exerciseId} → RECOVERY_PLAN (2° episodio consecutivo)`);

        } else if (existing.status === 'recovery_plan') {
          // Ancora dolore durante recovery → estendi piano
          existing.consecutiveIssues++;
          if (existing.recoveryPlan) {
            existing.recoveryPlan.totalWeeks += 1;
            existing.recoveryPlan.notes.push(`Dolore persistente (${maxSeverity}/10) - piano esteso`);
          }
          console.log(`[PAIN_MEMORY] ${exerciseId} → RECOVERY_PLAN esteso (${existing.consecutiveIssues}° episodio)`);
        }

      } else {
        // Primo episodio in assoluto → crea entry con status 'warning'
        updated.flaggedExercises.push({
          exerciseId,
          exerciseName,
          painRecords: records,
          lastOccurrence: today,
          occurrenceCount: 1,
          averageSeverity: maxSeverity,
          status: 'warning',  // 1° episodio = warning, riproponi
          consecutiveIssues: 1,
          retryScheduled: today,
          flagReason: `Dolore ${maxSeverity}/10 - riprova nella prossima sessione`,
          suggestedAlternative: getGenericAlternative(area)
        });
        console.log(`[PAIN_MEMORY] Nuovo tracking per ${exerciseId} → WARNING (1° episodio)`);
      }
    }
  });

  // Aggiorna chronic pain areas
  sessionData.preWorkoutScreening.painAreas.forEach(({ area, severity }) => {
    const existingChronic = updated.chronicPainAreas.find(c => c.area === area);

    if (existingChronic) {
      existingChronic.lastReported = today;
      existingChronic.occurrences++;
      existingChronic.averageSeverity =
        (existingChronic.averageSeverity * (existingChronic.occurrences - 1) + severity) / existingChronic.occurrences;
    } else if (severity >= 3) {
      updated.chronicPainAreas.push({
        area,
        firstReported: today,
        lastReported: today,
        averageSeverity: severity,
        occurrences: 1,
        trend: 'stable',
        weeklyHistory: []
      });
    }
  });

  return updated;
}

/**
 * Crea piano di recupero per esercizio problematico
 */
export function createRecoveryPlan(
  exerciseId: string,
  exerciseName: string,
  painArea: ExtendedPainArea,
  severity: number
): RecoveryPlan {
  const totalWeeks = severity >= 7 ? 4 : severity >= 5 ? 3 : 2;

  return {
    exerciseId,
    exerciseName,
    painArea,
    startDate: new Date().toISOString(),
    phase: 'active_rest',
    currentWeek: 1,
    totalWeeks,
    correctiveExercises: getCorrectivesForArea(painArea),
    alternativeExercise: getGenericAlternative(painArea),
    progressionCriteria: [
      'Dolore pre-workout < 3/10',
      'Nessun dolore durante alternativa',
      'ROM completo senza dolore',
      'Completare 2 sessioni consecutive senza problemi'
    ],
    notes: [
      `Piano avviato per dolore ${severity}/10 a ${EXTENDED_PAIN_AREA_LABELS[painArea]}`,
      'Settimana 1: Focus su mobilità e correttivi',
      'Settimana 2: Alternativa a carico leggero',
      'Settimana 3+: Progressione graduale verso esercizio originale'
    ]
  };
}

/**
 * Avanza il piano di recupero alla settimana successiva
 */
export function advanceRecoveryPlan(plan: RecoveryPlan, wasSuccessful: boolean): RecoveryPlan {
  const updated = { ...plan };

  if (!wasSuccessful) {
    // Non avanzare, eventualmente estendi
    updated.notes.push(`Settimana ${plan.currentWeek}: ancora problematico - rimani in questa fase`);
    return updated;
  }

  updated.currentWeek++;

  // Progressione fasi
  if (updated.currentWeek === 2) {
    updated.phase = 'mobility';
    updated.notes.push('Settimana 2: Mobilità migliorata, introduci carichi leggeri');
  } else if (updated.currentWeek === 3) {
    updated.phase = 'light_load';
    updated.notes.push('Settimana 3: Carichi leggeri tollerati, aumenta gradualmente');
  } else if (updated.currentWeek === 4) {
    updated.phase = 'progressive';
    updated.notes.push('Settimana 4: Progressione verso carichi normali');
  } else if (updated.currentWeek >= updated.totalWeeks) {
    updated.phase = 'return_to_normal';
    updated.notes.push('Piano completato! Pronto per tornare all\'esercizio originale');
  }

  return updated;
}

/**
 * Verifica se il piano di recupero è completato
 */
export function isRecoveryPlanComplete(plan: RecoveryPlan): boolean {
  return plan.phase === 'return_to_normal' || plan.currentWeek > plan.totalWeeks;
}

/**
 * Verifica stato esercizio per la sessione successiva
 * LOGICA:
 * - 1° episodio dolore → riproponi con avviso (retry)
 * - 2° episodio consecutivo → attiva piano di recupero
 * - Sessione ok → reset counter
 */
export function checkExerciseForNextSession(
  memory: UserPainMemory,
  exerciseId: string,
  exerciseName: string
): NextSessionExerciseCheck {
  const history = memory.flaggedExercises.find(f => f.exerciseId === exerciseId);

  // Nessuno storico = tutto ok
  if (!history) {
    return {
      exerciseId,
      exerciseName,
      canPerform: true,
      status: 'normal',
      message: 'Nessun problema registrato',
      emoji: '✅',
      isRetry: false,
      showWarning: false
    };
  }

  const { status, consecutiveIssues, recoveryPlan, flagReason, suggestedAlternative } = history;

  // STATO: Normal (reset dopo sessione ok)
  if (status === 'normal') {
    return {
      exerciseId,
      exerciseName,
      canPerform: true,
      status: 'normal',
      message: 'Esercizio ok - nessun problema recente',
      emoji: '✅',
      isRetry: false,
      showWarning: false
    };
  }

  // STATO: Warning (1° episodio) → RIPROPONI con avviso
  if (status === 'warning' || status === 'retry_pending') {
    return {
      exerciseId,
      exerciseName,
      canPerform: true,  // RIPROPONI!
      status: 'retry_pending',
      message: `Riproviamo oggi - dolore segnalato nella sessione precedente`,
      emoji: '🔄',
      isRetry: true,
      showWarning: true,
      warningMessage: `⚠️ Nella sessione precedente hai segnalato dolore durante "${exerciseName}". Oggi riproviamo: se il dolore si ripresenta, attiveremo un piano di recupero.`,
      alternative: suggestedAlternative
    };
  }

  // STATO: Recovery Plan (2° episodio) → Usa alternativa + piano
  if (status === 'recovery_plan' && recoveryPlan) {
    return {
      exerciseId,
      exerciseName,
      canPerform: false,  // Non proporre l'originale
      status: 'recovery_plan',
      message: `Piano di recupero attivo - Settimana ${recoveryPlan.currentWeek}/${recoveryPlan.totalWeeks}`,
      emoji: '🏥',
      isRetry: false,
      showWarning: true,
      warningMessage: `Esercizio temporaneamente sostituito. ${recoveryPlan.phase === 'active_rest' ? 'Focus su mobilità e correttivi.' : 'Progressione graduale in corso.'}`,
      alternative: recoveryPlan.alternativeExercise,
      recoveryPlan
    };
  }

  // STATO: Cooldown → Non proporre
  if (status === 'cooldown') {
    return {
      exerciseId,
      exerciseName,
      canPerform: false,
      status: 'cooldown',
      message: `Esercizio in pausa`,
      emoji: '⏸️',
      isRetry: false,
      showWarning: true,
      warningMessage: flagReason,
      alternative: suggestedAlternative
    };
  }

  // Default: proponi con cautela
  return {
    exerciseId,
    exerciseName,
    canPerform: true,
    status: 'warning',
    message: 'Procedi con cautela',
    emoji: '⚠️',
    isRetry: false,
    showWarning: true,
    warningMessage: flagReason
  };
}

/**
 * LEGACY: Vecchia funzione per backward compatibility
 * @deprecated Usa checkExerciseForNextSession
 */
export function checkExerciseFlag(
  memory: UserPainMemory,
  exerciseId: string
): { isFlagged: boolean; reason?: string; alternative?: string; canRetry: boolean } {
  const check = checkExerciseForNextSession(memory, exerciseId, '');
  return {
    isFlagged: !check.canPerform || check.showWarning,
    reason: check.warningMessage || check.message,
    alternative: check.alternative,
    canRetry: check.canPerform
  };
}

/**
 * SEDUTA SUCCESSIVA: Prepara adattamenti basati su memoria
 */
export function prepareNextSessionAdaptations(
  memory: UserPainMemory,
  plannedExercises: { id: string; name: string }[]
): {
  substitutions: { original: string; replacement: string; reason: string }[];
  warnings: string[];
  canProceed: boolean;
} {
  const substitutions: { original: string; replacement: string; reason: string }[] = [];
  const warnings: string[] = [];

  plannedExercises.forEach(exercise => {
    const check = checkExerciseFlag(memory, exercise.id);

    if (check.isFlagged && !check.canRetry) {
      substitutions.push({
        original: exercise.name,
        replacement: check.alternative || 'Alternativa da selezionare',
        reason: check.reason || 'Dolore segnalato nella sessione precedente'
      });
    } else if (check.isFlagged && check.canRetry) {
      warnings.push(`⚠️ ${exercise.name}: ${check.reason}`);
    }
  });

  // Check chronic pain
  const recentChronic = memory.chronicPainAreas.filter(c => {
    const daysSinceLastReport = (Date.now() - new Date(c.lastReported).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastReport <= 7 && c.averageSeverity >= 4;
  });

  if (recentChronic.length > 0) {
    warnings.push(`📌 Zone con dolore ricorrente: ${recentChronic.map(c => getPainAreaLabel(c.area as AllPainAreas)).join(', ')}`);
  }

  return {
    substitutions,
    warnings,
    canProceed: true
  };
}

// ============================================================================
// SCENARIO SPECIALE: MULTI-AREA SEVERE
// ============================================================================

/**
 * SCENARIO A: Dolore 5 su TUTTI i pattern
 */
export function evaluateMultiAreaPain(
  painAreas: { area: ExtendedPainArea; severity: number }[]
): PainEvaluationResult {
  const severeAreas = painAreas.filter(p => p.severity >= PAIN_THRESHOLDS.SEVERE_MIN);
  const criticalAreas = painAreas.filter(p => p.severity >= PAIN_THRESHOLDS.CRITICAL_MIN);

  // Qualsiasi area critica = stop
  if (criticalAreas.length > 0) {
    return {
      action: 'rest_day',
      message: `🚨 Dolore critico in ${criticalAreas.length} zone - Sessione fortemente sconsigliata`,
      emoji: '🚨',
      suggestions: [
        'Oggi è un giorno di riposo completo',
        'Ghiaccio/calore sulle zone dolorose',
        'Consulta un professionista se persiste',
        'Mobilità leggera solo se non causa dolore'
      ],
      shouldLogForFuture: true,
      flagExercise: false
    };
  }

  // Troppe aree severe = stop
  if (severeAreas.length > PAIN_THRESHOLDS.MAX_SEVERE_AREAS) {
    return {
      action: 'rest_day',
      message: `🛑 Dolore significativo in ${severeAreas.length} zone - Oggi non è giornata`,
      emoji: '💤',
      suggestions: [
        'Sessione di mobilità/stretching invece dell\'allenamento',
        'Foam rolling leggero',
        'Respirazione e rilassamento',
        'Riprogramma l\'allenamento a domani'
      ],
      correctiveExercises: ['Cat-Cow', 'Child\'s Pose', 'Supine Twist', 'Diaphragmatic Breathing'],
      shouldLogForFuture: true,
      flagExercise: false
    };
  }

  // Alcune aree severe ma gestibili
  if (severeAreas.length > 0) {
    return {
      action: 'substitute',
      message: `⚠️ ${severeAreas.length} zone con dolore significativo - Allenamento modificato`,
      emoji: '⚠️',
      suggestions: [
        'Esercizi per zone dolorose sostituiti',
        'Volume ridotto del 30%',
        'Focus su zone non coinvolte',
        'Monitoraggio attento durante la sessione'
      ],
      shouldLogForFuture: true,
      flagExercise: false
    };
  }

  // Solo dolori mild
  return {
    action: 'deload',
    message: `📝 ${painAreas.length} zone con dolore lieve - Procedi con cautela`,
    emoji: '📝',
    suggestions: [
      'Warm-up esteso',
      'Deload leggero (-15%)',
      'Monitora durante la sessione'
    ],
    shouldLogForFuture: true,
    flagExercise: false
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getGenericAlternative(area: ExtendedPainArea): string {
  const alternatives: Record<ExtendedPainArea, string> = {
    // Zone base
    knee: 'Glute Bridge',
    shoulder: 'Landmine Press / Floor Press',
    lower_back: 'Glute Bridge / Bird Dog',
    wrist: 'Knuckle Push-up / Parallettes',
    ankle: 'Seated Calf Raise / Box Step',
    elbow: 'Isometric Hold / Assisted Movement',
    hip: 'Box Squat / Leg Press',
    neck: 'Neutral Spine Exercises',
    upper_back: 'Face Pulls / Band Pull-aparts',
    forearm: 'Wrist-neutral Grips',
    calf: 'Seated Exercises / Low Impact',
    chest: 'Incline / Decline Variations',

    // Sub-aree gomito
    elbow_pull: 'Hammer Curl / Neutral Grip Pull',
    elbow_push: 'Close Grip Press / Pushdown',

    // Sub-aree spalla
    shoulder_overhead: 'Landmine Press / High Incline',
    shoulder_push: 'Floor Press / Cable Fly',
    shoulder_rotation: 'External Rotation Band / Face Pull',

    // Sub-aree ginocchio
    knee_flexion: 'Partial ROM Squat / Leg Press',
    knee_extension: 'Isometric Wall Sit / Terminal Extension',
    knee_load: 'Bodyweight Squat / Low Box Step',

    // Sub-aree anca
    hip_flexion: 'Glute Bridge / Reverse Hyper',
    hip_extension: 'Hip Thrust / Cable Pull-through',
    hip_abduction: 'Banded Clamshell / Side Lying Raise',
    hip_rotation: '90/90 Stretch / Pigeon',

    // Sub-aree zona lombare
    lower_back_flexion: 'Hip Hinge / RDL Light',
    lower_back_extension: 'Glute Bridge / Bird Dog',
    lower_back_load: 'Belt Squat / Leg Press',
    lower_back_rotation: 'Pallof Press / Dead Bug',

    // Sub-aree caviglia
    ankle_dorsiflexion: 'Heel Elevated Squat / Leg Press',
    ankle_plantarflexion: 'Seated Calf Raise / Toe Press',
    ankle_stability: 'Machine-based Exercises / Seated',
  };
  return alternatives[area] || 'Variante a basso impatto';
}

function getCorrectivesForArea(area: ExtendedPainArea): string[] {
  const correctives: Record<ExtendedPainArea, string[]> = {
    // Zone base
    knee: ['VMO Activation', 'Wall Sit Isometric', 'Quad Stretch', 'Knee Circles'],
    shoulder: ['Shoulder Dislocations', 'Band Pull-Aparts', 'Face Pulls', 'Wall Slides'],
    lower_back: ['Cat-Cow', 'Bird Dog', 'Dead Bug', 'Pelvic Tilts'],
    wrist: ['Wrist Circles', 'Wrist Flexion/Extension', 'Prayer Stretch'],
    ankle: ['Ankle Circles', 'Dorsiflexion Stretch', 'Calf Stretch'],
    elbow: ['Elbow Circles', 'Forearm Stretch', 'Wrist Curls Light'],
    hip: ['Hip Circles', 'Pigeon Stretch', 'Hip Flexor Stretch', '90/90 Stretch'],
    neck: ['Chin Tucks', 'Neck Rotations', 'Levator Scapulae Stretch'],
    upper_back: ['Thoracic Extension', 'Thread the Needle', 'Foam Roll T-Spine'],
    forearm: ['Wrist Curls', 'Reverse Wrist Curls', 'Forearm Pronation/Supination'],
    calf: ['Standing Calf Stretch', 'Eccentric Heel Drops', 'Foam Roll Calves'],
    chest: ['Doorway Stretch', 'Foam Roll Pecs', 'Arm Circles'],

    // Sub-aree gomito
    elbow_pull: ['Forearm Supination', 'Bicep Stretch', 'Light Curls'],
    elbow_push: ['Tricep Stretch', 'Elbow Extensions', 'Forearm Pronation'],

    // Sub-aree spalla
    shoulder_overhead: ['Wall Slides', 'Shoulder Dislocations', 'Y-T-W Raises'],
    shoulder_push: ['Band Pull-Aparts', 'External Rotation', 'Pec Stretch'],
    shoulder_rotation: ['Internal Rotation', 'External Rotation', 'Sleeper Stretch'],

    // Sub-aree ginocchio
    knee_flexion: ['Hamstring Curls', 'Quad Stretch', 'Partial Squats'],
    knee_extension: ['VMO Activation', 'Terminal Extensions', 'Quad Sets'],
    knee_load: ['Wall Sits', 'Box Squats', 'Step Downs'],

    // Sub-aree anca
    hip_flexion: ['Hip Flexor Stretch', 'Leg Swings', 'Kneeling Lunge'],
    hip_extension: ['Glute Bridge', 'Bird Dog', 'Hip Thrust'],
    hip_abduction: ['Clamshells', 'Side Leg Raises', 'Banded Walks'],
    hip_rotation: ['90/90 Stretch', 'Pigeon Pose', 'Piriformis Stretch'],

    // Sub-aree zona lombare
    lower_back_flexion: ['Cat-Cow', 'Child Pose', 'Pelvic Tilts'],
    lower_back_extension: ['Cobra Stretch', 'Prone Press-ups', 'McKenzie Extensions'],
    lower_back_load: ['Dead Bug', 'Bird Dog', 'Pallof Press'],
    lower_back_rotation: ['Thread the Needle', 'Lumbar Rotations', 'Supine Twist'],

    // Sub-aree caviglia
    ankle_dorsiflexion: ['Wall Ankle Mobilization', 'Banded Distraction', 'Calf Stretch'],
    ankle_plantarflexion: ['Toe Raises', 'Calf Raises', 'Toe Curls'],
    ankle_stability: ['Single Leg Balance', 'Alphabet Ankles', 'BOSU Drills'],
  };
  return correctives[area] || ['Mobilità generale', 'Stretching leggero'];
}

function calculateCooldownDate(severity: number): string {
  const category = getSeverityCategory(severity);
  const days = COOLDOWN_DAYS_BY_SEVERITY[category] || 3;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Ottieni pattern affetti da zona dolore (estesa)
 */
export function getAffectedPatterns(area: ExtendedPainArea): string[] {
  return EXTENDED_PAIN_PATTERN_MAP[area] || [];
}

/**
 * Verifica se zona è supportata dal sistema
 */
export function isPainAreaSupported(area: string): area is ExtendedPainArea {
  return area in EXTENDED_PAIN_AREA_LABELS;
}

/**
 * Ottieni tutte le zone supportate
 */
export function getSupportedPainAreas(): ExtendedPainArea[] {
  return Object.keys(EXTENDED_PAIN_AREA_LABELS) as ExtendedPainArea[];
}

// ============================================================================
// NUOVE FUNZIONI: DOMS vs ARTICOLARE, CORRELAZIONI, WARM-UP ADATTIVO, ALERT MEDICI
// ============================================================================

/**
 * Ottieni label per qualsiasi zona (base, estesa o lateralizzata)
 */
export function getPainAreaLabel(area: AllPainAreas): string {
  if (area in EXTENDED_PAIN_AREA_LABELS) {
    return EXTENDED_PAIN_AREA_LABELS[area as ExtendedPainArea];
  }
  if (area in LATERALIZED_PAIN_AREA_LABELS) {
    return LATERALIZED_PAIN_AREA_LABELS[area as LateralizedPainArea];
  }
  return area;
}

/**
 * Estrai zona base da zona lateralizzata
 * es: 'left_knee' → 'knee'
 */
export function getBaseArea(area: AllPainAreas): ExtendedPainArea {
  if (area.startsWith('left_') || area.startsWith('right_')) {
    const base = area.replace('left_', '').replace('right_', '');
    return base as ExtendedPainArea;
  }
  return area as ExtendedPainArea;
}

/**
 * Verifica se due aree sono bilaterali (es: left_knee + right_knee)
 */
export function areBilateral(area1: AllPainAreas, area2: AllPainAreas): boolean {
  const base1 = getBaseArea(area1);
  const base2 = getBaseArea(area2);
  if (base1 !== base2) return false;

  const isLeft1 = area1.startsWith('left_');
  const isRight1 = area1.startsWith('right_');
  const isLeft2 = area2.startsWith('left_');
  const isRight2 = area2.startsWith('right_');

  return (isLeft1 && isRight2) || (isRight1 && isLeft2);
}

// ============================================================================
// DOMS vs DOLORE ARTICOLARE
// ============================================================================

/**
 * DIFFERENZIA DOMS da dolore problematico
 *
 * DOMS (Delayed Onset Muscle Soreness):
 * - Compare 24-72h dopo allenamento
 * - Carattere: 'aching', 'dull'
 * - Migliora con movimento
 * - È NORMALE e non deve bloccare l'allenamento
 *
 * Dolore problematico:
 * - Acuto, pungente, localizzato
 * - Peggiora con movimento
 * - Articolare/tendineo
 */
export function evaluatePainType(
  area: AllPainAreas,
  severity: number,
  painType?: PainType,
  painCharacter?: PainCharacter,
  hoursAfterLastWorkout?: number
): PainTypeEvaluation {
  // Se già specificato il tipo
  if (painType) {
    const risk = PAIN_TYPE_RISK[painType];
    return createPainTypeEvaluation(painType, risk.risk, risk.canContinue, severity, area);
  }

  // Inferisci dal carattere
  if (painCharacter) {
    // Caratteri nervosi = STOP
    if (NERVE_PAIN_CHARACTERS.includes(painCharacter)) {
      return createPainTypeEvaluation('nerve', 'critical', false, severity, area);
    }

    // Acuto/lancinante su articolazione = problematico
    if ((painCharacter === 'sharp' || painCharacter === 'stabbing') &&
        isJointArea(area)) {
      return createPainTypeEvaluation('joint', 'high', false, severity, area);
    }

    // Dolorante/indolenzito 24-72h dopo workout = probabilmente DOMS
    if (painCharacter === 'aching' || painCharacter === 'dull') {
      if (hoursAfterLastWorkout && hoursAfterLastWorkout >= 24 && hoursAfterLastWorkout <= 72) {
        if (severity <= 5 && !isJointArea(area)) {
          return createPainTypeEvaluation('muscular_doms', 'low', true, severity, area);
        }
      }
    }
  }

  // Default: non rischiare
  return createPainTypeEvaluation('unknown', 'medium', severity <= 3, severity, area);
}

function createPainTypeEvaluation(
  type: PainType,
  risk: 'low' | 'medium' | 'high' | 'critical',
  canContinue: boolean,
  severity: number,
  area: AllPainAreas
): PainTypeEvaluation {
  const areaLabel = getPainAreaLabel(area);

  let action: PainAction;
  let message: string;
  let medicalAdvice: string | undefined;

  switch (type) {
    case 'muscular_doms':
      action = severity <= 3 ? 'continue' : 'deload';
      message = `DOMS (indolenzimento muscolare) a ${areaLabel} - È normale post-allenamento`;
      break;

    case 'muscular_acute':
      action = 'skip_exercise';
      message = `Dolore muscolare acuto a ${areaLabel} - Possibile lesione, evita di caricare`;
      medicalAdvice = 'Se persiste, consulta un fisioterapista';
      break;

    case 'joint':
      action = 'substitute';
      message = `Dolore ARTICOLARE a ${areaLabel} - Non ignorare!`;
      medicalAdvice = 'Consulta un fisioterapista se persiste più di 1 settimana';
      break;

    case 'tendon':
      action = 'substitute';
      message = `Dolore TENDINEO a ${areaLabel} - Richiede attenzione`;
      medicalAdvice = 'Evita movimenti che lo aggravano, considera fisioterapia';
      break;

    case 'nerve':
      action = 'end_session';
      message = `Dolore NERVOSO/irradiato a ${areaLabel} - STOP immediato`;
      medicalAdvice = 'Consulta un medico il prima possibile';
      break;

    case 'bone':
      action = 'rest_day';
      message = `Dolore OSSEO a ${areaLabel} - NON allenarti`;
      medicalAdvice = 'Consulta un medico URGENTEMENTE';
      break;

    default:
      action = severity <= 3 ? 'deload' : 'substitute';
      message = `Dolore non specificato a ${areaLabel} - Procedi con cautela`;
  }

  return {
    likelyType: type,
    confidence: type === 'unknown' ? 0.3 : 0.7,
    riskLevel: risk,
    canContinue,
    action,
    message,
    medicalAdvice
  };
}

function isJointArea(area: AllPainAreas): boolean {
  const jointAreas = ['knee', 'shoulder', 'hip', 'ankle', 'elbow', 'wrist',
    'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder',
    'left_hip', 'right_hip', 'left_ankle', 'right_ankle',
    'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'];
  return jointAreas.includes(area);
}

/**
 * Domande per identificare tipo di dolore (UI helper)
 */
export function getPainTypeQuestions(): {
  question: string;
  answers: { label: string; value: PainType | PainCharacter }[];
}[] {
  return [
    {
      question: 'Come descriveresti il dolore?',
      answers: [
        { label: 'Indolenzito/Dolorante (come dopo allenamento)', value: 'aching' },
        { label: 'Acuto/Pungente', value: 'sharp' },
        { label: 'Sordo/Profondo', value: 'dull' },
        { label: 'Bruciante', value: 'burning' },
        { label: 'Formicolio/Intorpidimento', value: 'tingling' },
        { label: 'Si irradia in altre zone', value: 'radiating' }
      ]
    },
    {
      question: 'Dove senti esattamente il dolore?',
      answers: [
        { label: 'Nel muscolo', value: 'muscular_doms' },
        { label: 'Nell\'articolazione', value: 'joint' },
        { label: 'Nel tendine (vicino all\'osso)', value: 'tendon' },
        { label: 'Non saprei', value: 'unknown' }
      ]
    },
    {
      question: 'Il dolore peggiora con il movimento?',
      answers: [
        { label: 'No, migliora quando mi muovo', value: 'muscular_doms' },
        { label: 'Sì, peggiora', value: 'joint' },
        { label: 'Solo con certi movimenti', value: 'tendon' }
      ]
    }
  ];
}

// ============================================================================
// WARM-UP ADATTIVO
// ============================================================================

/**
 * Verifica se un goal appartiene alle popolazioni speciali
 */
export function isSpecialPopulation(goal?: string): boolean {
  if (!goal) return false;
  const normalizedGoal = goal.toLowerCase().trim();
  return SPECIAL_POPULATION_GOALS.some(sp => normalizedGoal.includes(sp) || sp.includes(normalizedGoal));
}

/**
 * Genera warm-up adattivo basato su zone doloranti
 *
 * @param painAreas - Aree doloranti con severità
 * @param baseDurationMinutes - Durata base in minuti (default 5)
 * @param goal - Obiettivo utente (per rilevare popolazioni speciali)
 *
 * Per popolazioni speciali (gravidanza, post-partum, recupero motorio, disabilità):
 * - NON vengono prescritti esercizi di riscaldamento standard (no jumping jacks, etc.)
 * - Si invita l'utente a scaldarsi autonomamente per 3 minuti come meglio crede
 * - Questo per sicurezza: ogni condizione speciale richiede adattamenti individuali
 */
export function generateAdaptiveWarmup(
  painAreas: { area: AllPainAreas; severity: number; painType?: PainType }[],
  baseDurationMinutes: number = 5,
  goal?: string
): AdaptiveWarmup {
  const focusAreas: AdaptiveWarmup['focusAreas'] = [];
  let additionalMinutes = 0;
  const notes: string[] = [];

  // ================================================================
  // POPOLAZIONI SPECIALI: riscaldamento autonomo
  // ================================================================
  if (isSpecialPopulation(goal)) {
    // Per popolazioni speciali: nessun esercizio prescritto
    // L'utente si scalda come meglio crede per 3 minuti
    const selfWarmupExercises: WarmupExercise[] = [
      {
        name: 'Riscaldamento autonomo',
        duration: 180, // 3 minuti
        targetArea: 'general',
        notes: 'Scaldati come preferisci per 3 minuti prima di iniziare i test. ' +
               'Puoi camminare sul posto, fare movimenti articolari leggeri, ' +
               'o qualsiasi attività a bassa intensità che ti faccia sentire pronto/a.'
      }
    ];

    notes.push('Riscaldamento autonomo: scaldati per 3 minuti come meglio credi');
    notes.push('Evita salti, movimenti bruschi e attività ad alto impatto');
    notes.push('Ascolta il tuo corpo e procedi gradualmente');

    return {
      baseDuration: 3, // 3 minuti fissi per popolazioni speciali
      additionalMinutes: 0,
      totalDuration: 3,
      focusAreas: [],
      generalExercises: selfWarmupExercises,
      notes
    };
  }

  // ================================================================
  // WARM-UP STANDARD per utenti normali
  // ================================================================

  // General warm-up exercises (sempre inclusi per utenti standard)
  const generalExercises: WarmupExercise[] = [
    { name: 'Jumping Jacks leggeri', duration: 60, targetArea: 'general' },
    { name: 'Arm Circles', duration: 30, targetArea: 'general' },
    { name: 'Leg Swings', duration: 30, targetArea: 'general' },
    { name: 'Hip Circles', duration: 30, targetArea: 'general' }
  ];

  // Per ogni area dolorante, aggiungi warm-up specifico
  painAreas.forEach(({ area, severity, painType }) => {
    const baseArea = getBaseArea(area);

    // DOMS non richiede warm-up extra significativo
    if (painType === 'muscular_doms' && severity <= 4) {
      notes.push(`${getPainAreaLabel(area)}: DOMS - warm-up normale sufficiente`);
      return;
    }

    const exercises = WARMUP_EXERCISES_BY_AREA[baseArea] || [];
    const priority = severity >= 5 ? 'high' : severity >= 3 ? 'medium' : 'low';

    // Tempo extra basato su severità
    const extraTime = severity >= 5 ? 3 : severity >= 3 ? 2 : 1;
    additionalMinutes += extraTime;

    focusAreas.push({
      area,
      exercises,
      priority
    });

    notes.push(`${getPainAreaLabel(area)}: +${extraTime} min warm-up dedicato`);
  });

  // Ordina per priorità (high first)
  focusAreas.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    baseDuration: baseDurationMinutes,
    additionalMinutes,
    totalDuration: baseDurationMinutes + additionalMinutes,
    focusAreas,
    generalExercises,
    notes
  };
}

// ============================================================================
// CORRELAZIONE ESERCIZIO-DOLORE (Pattern Recognition)
// ============================================================================

/**
 * Analizza correlazioni tra esercizi e dolore
 * Identifica pattern: "ogni volta che fai X, hai dolore a Y"
 */
export function analyzeExercisePainCorrelations(
  memory: UserPainMemory,
  minOccurrences: number = 3
): ExercisePainCorrelation[] {
  const correlations: ExercisePainCorrelation[] = [];

  // Raggruppa record per esercizio e area
  const exerciseAreaMap = new Map<string, {
    exerciseId: string;
    exerciseName: string;
    area: AllPainAreas;
    severities: number[];
    timestamps: string[];
  }>();

  memory.flaggedExercises.forEach(flagged => {
    flagged.painRecords.forEach(record => {
      const key = `${flagged.exerciseId}|${record.area}`;
      const existing = exerciseAreaMap.get(key);

      if (existing) {
        existing.severities.push(record.severity);
        existing.timestamps.push(record.timestamp);
      } else {
        exerciseAreaMap.set(key, {
          exerciseId: flagged.exerciseId,
          exerciseName: flagged.exerciseName,
          area: record.area,
          severities: [record.severity],
          timestamps: [record.timestamp]
        });
      }
    });
  });

  // Valuta correlazioni
  exerciseAreaMap.forEach((data, key) => {
    if (data.severities.length >= minOccurrences) {
      const avgSeverity = data.severities.reduce((a, b) => a + b, 0) / data.severities.length;
      const occurrences = data.severities.length;

      // Calcola forza correlazione
      let strength: 'weak' | 'moderate' | 'strong';
      if (occurrences >= 5 && avgSeverity >= 5) {
        strength = 'strong';
      } else if (occurrences >= 3 && avgSeverity >= 4) {
        strength = 'moderate';
      } else {
        strength = 'weak';
      }

      // Confidence basata su consistenza
      const consistency = 1 - (standardDeviation(data.severities) / 5);
      const confidence = Math.max(0.3, Math.min(0.95, consistency * (occurrences / 10)));

      // Azione suggerita
      let suggestedAction: 'monitor' | 'modify' | 'avoid';
      if (strength === 'strong') {
        suggestedAction = 'avoid';
      } else if (strength === 'moderate') {
        suggestedAction = 'modify';
      } else {
        suggestedAction = 'monitor';
      }

      correlations.push({
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName,
        painArea: data.area,
        correlationStrength: strength,
        occurrences,
        avgSeverityWhenPerformed: avgSeverity,
        avgSeverityWithout: 0, // TODO: calcolare da sessioni senza esercizio
        confidence,
        suggestedAction,
        lastAnalyzed: new Date().toISOString(),
        notes: [
          `${occurrences} episodi di dolore associati`,
          `Severità media: ${avgSeverity.toFixed(1)}/10`,
          `Correlazione: ${strength}`
        ]
      });
    }
  });

  return correlations.sort((a, b) => b.occurrences - a.occurrences);
}

function standardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// ============================================================================
// CORRELAZIONE CICLO MESTRUALE
// ============================================================================

/**
 * Analizza correlazione tra dolore e fase del ciclo mestruale
 */
export function analyzeCyclePainCorrelations(
  painRecords: PainRecord[]
): CyclePainCorrelation[] {
  // Raggruppa per area
  const areaMap = new Map<AllPainAreas, PainRecord[]>();

  painRecords.forEach(record => {
    if (record.cyclePhase) {
      const existing = areaMap.get(record.area) || [];
      existing.push(record);
      areaMap.set(record.area, existing);
    }
  });

  const correlations: CyclePainCorrelation[] = [];

  areaMap.forEach((records, area) => {
    const phases: ('menstrual' | 'follicular' | 'ovulation' | 'luteal')[] =
      ['menstrual', 'follicular', 'ovulation', 'luteal'];

    const overallAvg = records.reduce((sum, r) => sum + r.severity, 0) / records.length;

    const phaseCorrelations = phases.map(phase => {
      const phaseRecords = records.filter(r => r.cyclePhase === phase);
      const avgSeverity = phaseRecords.length > 0
        ? phaseRecords.reduce((sum, r) => sum + r.severity, 0) / phaseRecords.length
        : 0;

      return {
        phase,
        avgSeverity,
        occurrences: phaseRecords.length,
        isSignificant: avgSeverity > overallAvg * 1.2 // 20% sopra la media
      };
    });

    // Trova fase di picco
    const peakPhase = phaseCorrelations
      .filter(p => p.occurrences > 0)
      .sort((a, b) => b.avgSeverity - a.avgSeverity)[0];

    const insights: string[] = [];
    phaseCorrelations.forEach(p => {
      if (p.isSignificant) {
        insights.push(`Dolore più frequente/intenso durante fase ${p.phase}`);
      }
    });

    if (peakPhase && peakPhase.isSignificant) {
      insights.push(`Considera adattare allenamento durante fase ${peakPhase.phase}`);
    }

    correlations.push({
      area,
      phaseCorrelations,
      peakPhase: peakPhase?.isSignificant ? peakPhase.phase : undefined,
      insights
    });
  });

  return correlations;
}

// ============================================================================
// STORICO LUNGO TERMINE
// ============================================================================

/**
 * Calcola trend lungo termine per area dolore
 */
export function calculateLongTermTrend(
  weeklyHistory: WeeklyPainSummary[]
): 'improving' | 'stable' | 'worsening' {
  if (weeklyHistory.length < 3) return 'stable';

  // Prendi ultime 4 settimane vs 4 settimane precedenti
  const recent = weeklyHistory.slice(-4);
  const previous = weeklyHistory.slice(-8, -4);

  if (recent.length < 2 || previous.length < 2) return 'stable';

  const recentAvg = recent.reduce((sum, w) => sum + w.avgSeverity, 0) / recent.length;
  const previousAvg = previous.reduce((sum, w) => sum + w.avgSeverity, 0) / previous.length;

  const change = ((recentAvg - previousAvg) / previousAvg) * 100;

  if (change <= -15) return 'improving';
  if (change >= 15) return 'worsening';
  return 'stable';
}

/**
 * Genera insights dallo storico lungo termine
 */
export function generateLongTermInsights(history: LongTermPainHistory): string[] {
  const insights: string[] = [];

  // Trend generale
  if (history.overallTrend === 'improving') {
    insights.push('📈 Ottimo! Il dolore generale sta diminuendo nel tempo');
  } else if (history.overallTrend === 'worsening') {
    insights.push('⚠️ Attenzione: il dolore sta aumentando. Considera un consulto');
  }

  // Aree croniche
  history.areasSummary.forEach(area => {
    if (area.totalOccurrences >= 10) {
      insights.push(`📌 ${getPainAreaLabel(area.area)}: problema ricorrente (${area.totalOccurrences} episodi)`);
    }
  });

  return insights;
}

// ============================================================================
// ALERT MEDICI/FISIOTERAPICI
// ============================================================================

/**
 * Genera alert medici basati su criteri
 */
export function generateMedicalAlerts(memory: UserPainMemory): MedicalAlert[] {
  const alerts: MedicalAlert[] = [];
  const now = new Date();

  // 1. DOLORE CRONICO (3+ settimane)
  memory.chronicPainAreas.forEach(chronic => {
    const firstDate = new Date(chronic.firstReported);
    const weeksSinceFirst = (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7);

    if (weeksSinceFirst >= MEDICAL_ALERT_THRESHOLDS.CHRONIC_WEEKS &&
        chronic.averageSeverity >= 4) {
      alerts.push({
        id: `chronic_${chronic.area}_${Date.now()}`,
        createdAt: now.toISOString(),
        type: 'chronic_pain',
        severity: 'warning',
        area: chronic.area,
        message: `Dolore a ${getPainAreaLabel(chronic.area)} presente da ${Math.floor(weeksSinceFirst)} settimane`,
        recommendation: 'Considera un consulto fisioterapico per valutare la situazione',
        acknowledged: false,
        triggerCriteria: `${MEDICAL_ALERT_THRESHOLDS.CHRONIC_WEEKS}+ settimane, severità media ${chronic.averageSeverity.toFixed(1)}`
      });
    }
  });

  // 2. INFORTUNI RICORRENTI (5+ episodi stesso esercizio)
  memory.flaggedExercises.forEach(flagged => {
    if (flagged.occurrenceCount >= MEDICAL_ALERT_THRESHOLDS.RECURRING_OCCURRENCES) {
      alerts.push({
        id: `recurring_${flagged.exerciseId}_${Date.now()}`,
        createdAt: now.toISOString(),
        type: 'recurring_injury',
        severity: 'warning',
        area: flagged.painRecords[0]?.area || 'lower_back',
        message: `${flagged.exerciseName} ha causato dolore ${flagged.occurrenceCount} volte`,
        recommendation: 'Potrebbe esserci un problema di tecnica o predisposizione. Valuta con un professionista',
        acknowledged: false,
        triggerCriteria: `${MEDICAL_ALERT_THRESHOLDS.RECURRING_OCCURRENCES}+ episodi`
      });
    }
  });

  // 3. SINTOMI NERVOSI
  const nerveRecords = memory.flaggedExercises
    .flatMap(f => f.painRecords)
    .filter(r => r.painType === 'nerve' || r.painCharacter === 'tingling' || r.painCharacter === 'radiating');

  if (nerveRecords.length > 0) {
    const latestNerve = nerveRecords[nerveRecords.length - 1];
    alerts.push({
      id: `nerve_${Date.now()}`,
      createdAt: now.toISOString(),
      type: 'nerve_symptoms',
      severity: 'urgent',
      area: latestNerve.area,
      message: `Sintomi nervosi rilevati (formicolio/irradiazione) a ${getPainAreaLabel(latestNerve.area)}`,
      recommendation: 'Consulta un medico il prima possibile. I sintomi nervosi richiedono valutazione professionale',
      acknowledged: false,
      triggerCriteria: 'Sintomi nervosi riportati'
    });
  }

  // 4. DOLORE OSSEO
  const boneRecords = memory.flaggedExercises
    .flatMap(f => f.painRecords)
    .filter(r => r.painType === 'bone');

  if (boneRecords.length > 0) {
    const latestBone = boneRecords[boneRecords.length - 1];
    alerts.push({
      id: `bone_${Date.now()}`,
      createdAt: now.toISOString(),
      type: 'bone_pain',
      severity: 'urgent',
      area: latestBone.area,
      message: `Dolore OSSEO riportato a ${getPainAreaLabel(latestBone.area)}`,
      recommendation: 'URGENTE: Consulta un medico. Il dolore osseo può indicare fratture da stress o altre patologie',
      acknowledged: false,
      triggerCriteria: 'Dolore osseo riportato'
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { urgent: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Verifica se ci sono alert urgenti non riconosciuti
 */
export function hasUrgentAlerts(memory: UserPainMemory): boolean {
  return memory.medicalAlerts.some(a => a.severity === 'urgent' && !a.acknowledged);
}

/**
 * Riconosci un alert
 */
export function acknowledgeAlert(memory: UserPainMemory, alertId: string): UserPainMemory {
  const updated = { ...memory };
  const alert = updated.medicalAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
  }
  return updated;
}

// ============================================================================
// INIZIALIZZAZIONE MEMORIA VUOTA
// ============================================================================

/**
 * Crea memoria dolore vuota per nuovo utente
 */
export function createEmptyPainMemory(userId: string): UserPainMemory {
  return {
    userId,
    flaggedExercises: [],
    chronicPainAreas: [],
    longTermHistory: {
      userId,
      startDate: new Date().toISOString(),
      totalRecords: 0,
      areasSummary: [],
      overallTrend: 'stable',
      insights: []
    },
    exerciseCorrelations: [],
    cycleCorrelations: undefined,
    medicalAlerts: [],
    lastUpdated: new Date().toISOString()
  };
}
