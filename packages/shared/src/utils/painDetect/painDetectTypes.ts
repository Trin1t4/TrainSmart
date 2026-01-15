/**
 * Pain Detect 2.0 - Unified Type Definitions
 *
 * Sistema unificato per la gestione del fastidio/dolore durante l'allenamento.
 * Sostituisce i vecchi moduli frammentati (painTrackingServiceDCSS, painLoadReduction, etc.)
 */

// =============================================================================
// BODY AREAS
// =============================================================================

export type BodyArea =
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'upper_back'
  | 'lower_back'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'neck'
  | 'chest';

export const BODY_AREA_LABELS: Record<BodyArea, { it: string; en: string }> = {
  shoulder: { it: 'Spalla', en: 'Shoulder' },
  elbow: { it: 'Gomito', en: 'Elbow' },
  wrist: { it: 'Polso', en: 'Wrist' },
  upper_back: { it: 'Parte alta schiena', en: 'Upper Back' },
  lower_back: { it: 'Zona lombare', en: 'Lower Back' },
  hip: { it: 'Anca', en: 'Hip' },
  knee: { it: 'Ginocchio', en: 'Knee' },
  ankle: { it: 'Caviglia', en: 'Ankle' },
  neck: { it: 'Collo', en: 'Neck' },
  chest: { it: 'Petto', en: 'Chest' },
};

// =============================================================================
// INTENSITY & LEVELS
// =============================================================================

/** Intensità del fastidio 0-10 */
export type DiscomfortIntensity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Livelli classificati di fastidio */
export type DiscomfortLevel = 'none' | 'mild' | 'moderate' | 'significant' | 'severe';

/** Soglie per le decisioni */
export const PAIN_THRESHOLDS = {
  /** Massima intensità considerata tollerabile (1-4) */
  TOLERABLE_MAX: 4,
  /** Soglia per suggerire riduzione carico */
  SUGGEST_REDUCTION: 4,
  /** Soglia per suggerire sostituzione esercizio */
  SUGGEST_SUBSTITUTION: 5,
  /** Soglia per consigliare professionista */
  PROFESSIONAL_ADVICE: 7,
  /** Soglia per bloccare l'area */
  BLOCK_AREA: 7,
  /** Sessioni senza dolore per progressione recovery */
  SESSIONS_FOR_PROGRESSION: 3,
  /** Sospensioni per triggerare screening */
  SUSPENSIONS_FOR_SCREENING: 2,
} as const;

// =============================================================================
// LOAD REDUCTIONS
// =============================================================================

export interface LoadReduction {
  /** Riduzione carico % (0-100) */
  load: number;
  /** Riduzione volume % (0-100) */
  volume: number;
  /** Riduzione reps (numero assoluto) */
  reps: number;
  /** Aumento riposo % (0-100) */
  rest: number;
}

export const LOAD_REDUCTIONS: Record<string, LoadReduction> = {
  /** Intensità 1-3: nessuna riduzione */
  MILD: { load: 0, volume: 0, reps: 0, rest: 0 },
  /** Intensità 4: riduzione leggera */
  MODERATE_LOW: { load: 10, volume: 0, reps: 0, rest: 0 },
  /** Intensità 5-6: riduzione moderata */
  MODERATE_HIGH: { load: 20, volume: 15, reps: 0, rest: 25 },
  /** Intensità 7+: esercizio non appropriato */
  SIGNIFICANT: { load: 100, volume: 100, reps: 100, rest: 0 },
};

// =============================================================================
// USER CHOICES
// =============================================================================

export type UserChoice =
  | 'continue_normal'      // Continua normalmente
  | 'continue_adapted'     // Continua con adattamenti
  | 'substitute_exercise'  // Sostituisci esercizio
  | 'skip_exercise'        // Salta esercizio
  | 'skip_area'            // Salta tutti esercizi per quest'area
  | 'end_session';         // Termina sessione

export interface UserOption {
  choice: UserChoice;
  labelIt: string;
  labelEn: string;
  descriptionIt: string;
  descriptionEn: string;
  icon: string;
  recommended: boolean;
  loadReductionPercent?: number;
}

// =============================================================================
// DISCOMFORT REPORT & RESPONSE
// =============================================================================

export type ReportPhase = 'pre_workout' | 'during_set' | 'post_set' | 'post_exercise';

export interface DiscomfortReport {
  id: string;
  userId: string;
  sessionId: string;
  area: BodyArea;
  intensity: DiscomfortIntensity;
  phase: ReportPhase;
  exerciseId?: string;
  exerciseName?: string;
  setNumber?: number;
  timestamp: Date;
}

export interface DiscomfortResponse {
  reportId: string;
  level: DiscomfortLevel;
  intensity: DiscomfortIntensity;
  messageIt: string;
  messageEn: string;
  educationalNoteIt?: string;
  educationalNoteEn?: string;
  showTolerableReminder: boolean;
  suggestProfessional: boolean;
  professionalMessageIt?: string;
  professionalMessageEn?: string;
  options: UserOption[];
  autoAdaptations?: LoadReduction;
}

// =============================================================================
// POST-SET EVALUATION
// =============================================================================

export type DiscomfortTrend = 'improved' | 'stable' | 'worsened' | 'significantly_worsened';

export interface PostSetResult {
  trend: DiscomfortTrend;
  beforeIntensity: DiscomfortIntensity;
  afterIntensity: DiscomfortIntensity;
  delta: number;
  messageIt: string;
  messageEn: string;
  suggestedAction: UserChoice;
  loadAdjustment: number; // Percentuale di aggiustamento (-20, 0, etc.)
}

// =============================================================================
// EXERCISE CHECK
// =============================================================================

export interface ExerciseCheck {
  exerciseId: string;
  appropriate: boolean;
  preWorkoutIntensity?: DiscomfortIntensity;
  reasonIt?: string;
  reasonEn?: string;
  suggestedAction?: UserChoice;
}

// =============================================================================
// SUBSTITUTION
// =============================================================================

export interface ROMModification {
  reducedROM: boolean;
  description: string;
  percentage?: number;
}

export interface SubstitutionResult {
  found: boolean;
  substitute?: string;
  matchScore?: number;
  rationale: string;
  rationaleIt: string;
  modifications?: ROMModification;
}

// =============================================================================
// RECOVERY TRACKING
// =============================================================================

export type RecoveryPhase =
  | 'acute'           // Fase acuta, evitare l'area
  | 'subacute'        // Fase subacuta, carico ridotto
  | 'reloading'       // Ricarico progressivo
  | 'return_to_sport' // Ritorno all'attività normale
  | 'complete';       // Recupero completo

export interface RecoveryProgress {
  id: string;
  area: BodyArea;
  exerciseId?: string;
  exerciseName?: string;
  phase: RecoveryPhase;
  painFreeSessions: number;
  targetSessions: number;
  currentLoadPercent: number;
  nextLoadPercent: number;
  isComplete: boolean;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// =============================================================================
// SESSION STATE
// =============================================================================

export interface PainSessionState {
  sessionId: string;
  userId: string;
  preWorkoutReports: DiscomfortReport[];
  inSessionReports: DiscomfortReport[];
  exerciseChoices: Record<string, UserChoice>;
  skippedAreas: BodyArea[];
  adaptedExercises: string[];
  substitutedExercises: Record<string, string>;
}

// =============================================================================
// SCREENING TRIGGER
// =============================================================================

export interface ScreeningTrigger {
  exerciseId: string;
  exerciseName: string;
  area: BodyArea;
  suspensionCount: number;
  reason: string;
}

// =============================================================================
// ADAPTED EXERCISE PARAMS
// =============================================================================

export interface ExerciseParams {
  sets: number;
  reps: number | string;
  weight?: number;
  restSeconds: number;
}

export interface AdaptedExerciseParams extends ExerciseParams {
  adaptationNote?: string;
  adaptationNoteIt?: string;
  originalParams?: ExerciseParams;
}

// =============================================================================
// HOOK OPTIONS
// =============================================================================

export interface UsePainDetectOptions {
  onScreeningTrigger?: (trigger: ScreeningTrigger) => void;
  onRecoveryComplete?: (progress: RecoveryProgress) => void;
  onPersistReport?: (report: DiscomfortReport) => Promise<void>;
  onPersistHistory?: (entry: PainHistoryEntry) => Promise<void>;
  onPersistRecovery?: (progress: RecoveryProgress) => Promise<void>;
}

export interface PainHistoryEntry {
  reportId: string;
  sessionId: string;
  area: BodyArea;
  intensity: DiscomfortIntensity;
  exerciseName?: string;
  actionTaken: string;
  userChoice: UserChoice;
  resolvedWithAdaptation: boolean;
  timestamp: Date;
}

// =============================================================================
// DISCLAIMER
// =============================================================================

export const DISCLAIMER = {
  it: "TrainSmart fornisce suggerimenti basati sulle tue segnalazioni, ma non sostituisce il parere di un professionista sanitario. In caso di dolore persistente o intenso, consulta un medico o fisioterapista.",
  en: "TrainSmart provides suggestions based on your reports, but does not replace professional medical advice. For persistent or severe pain, consult a doctor or physiotherapist.",
};
