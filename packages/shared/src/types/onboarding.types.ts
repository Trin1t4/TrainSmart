/**
 * Onboarding Types - Centralizzato
 * Definizioni complete per il flow di onboarding
 */

export type TrainingLocation = 'gym' | 'home' | 'home_gym';

export type TrainingType = 'bodyweight' | 'equipment' | 'machines';

export type EquipmentPreference = 'prefer_machines' | 'prefer_free_weights' | 'mixed';

export type Goal =
  // Fitness goals
  | 'forza'
  | 'ipertrofia'
  | 'tonificazione'
  | 'dimagrimento'
  | 'resistenza'
  // Legacy values (backward compatibility)
  | 'massa'
  | 'massa muscolare'
  | 'endurance'
  | 'general_fitness'
  // Sport & Wellness
  | 'prestazioni_sportive'
  | 'sport_performance'
  | 'benessere'
  // Health & Special Needs
  | 'motor_recovery'
  | 'pre_partum'      // prenatal (Italian UI value)
  | 'post_partum'     // postnatal (Italian UI value)
  | 'disabilita'      // disability (Italian UI value)
  // Legacy values (keep for backward compatibility)
  | 'prenatal'
  | 'postnatal'
  | 'disability';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface PersonalInfo {
  gender: 'M' | 'F' | 'Other';
  age: number;
  height: number; // cm
  weight: number; // kg
  bmi: number;

  // Navy Method - Circumferences (optional)
  neck?: number; // cm
  waist?: number; // cm (ombelico per uomini, punto più stretto per donne)
  hips?: number; // cm (solo donne - punto più largo)

  // Body Composition (calcolato con Navy Method se circonferenze fornite)
  bodyFat?: number; // %
  fatMass?: number; // kg
  leanMass?: number; // kg
}

export interface Equipment {
  pullupBar?: boolean;
  loopBands?: boolean;
  dumbbells?: boolean;
  dumbbellMaxKg?: number;
  barbell?: boolean;
  kettlebell?: boolean;
  kettlebellKg?: number;
  bench?: boolean;
  rings?: boolean;
  parallelBars?: boolean;
}

export interface ActivityLevel {
  weeklyFrequency: number; // days per week
  sessionDuration: number; // minutes
}

export type PainArea =
  | 'wrist' | 'neck'

  // ═══ GOMITO ═══
  | 'elbow'           // Dolore generico o entrambi
  | 'elbow_pull'      // Solo TIRATE (curl, pull-up, row)
  | 'elbow_push'      // Solo SPINTE (french press, dips)

  // ═══ SPALLA ═══
  | 'shoulder'            // Generico o multipli
  | 'shoulder_overhead'   // Solo SOPRA LA TESTA
  | 'shoulder_push'       // Solo SPINTE orizzontali
  | 'shoulder_rotation'   // Solo ROTAZIONI (cuffia)

  // ═══ GINOCCHIO ═══
  | 'knee'                // Generico o multipli
  | 'knee_flexion'        // Dolore in FLESSIONE (squat profondo, leg curl)
  | 'knee_extension'      // Dolore in ESTENSIONE (leg extension, calci)
  | 'knee_load'           // Dolore sotto CARICO ASSIALE (squat, salti)

  // ═══ ANCA ═══
  | 'hip'                 // Generico o multipli
  | 'hip_flexion'         // Dolore in FLESSIONE (squat, sit-up)
  | 'hip_extension'       // Dolore in ESTENSIONE (hip thrust, ponte)
  | 'hip_abduction'       // Dolore in ABDUZIONE (laterali)
  | 'hip_rotation'        // Dolore in ROTAZIONE (piriforme)

  // ═══ COLONNA LOMBARE ═══
  | 'lower_back'          // Generico o multipli
  | 'lower_back_flexion'  // Dolore in FLESSIONE (piegarsi avanti)
  | 'lower_back_extension'// Dolore in ESTENSIONE (iperestensione)
  | 'lower_back_load'     // Dolore sotto CARICO ASSIALE (squat, stacco)
  | 'lower_back_rotation' // Dolore in ROTAZIONE (torsioni)

  // ═══ CAVIGLIA ═══
  | 'ankle'               // Generico o multipli
  | 'ankle_dorsiflexion'  // Dolore in DORSIFLESSIONE (squat profondo)
  | 'ankle_plantarflexion'// Dolore in PLANTARFLESSIONE (calf raise)
  | 'ankle_stability';    // Problemi di STABILITÀ (inversione/eversione)

export type PainSeverity = 'mild' | 'moderate' | 'severe';

// Fase stagionale per sport
export type SeasonPhase = 'off_season' | 'pre_season' | 'in_season';

// ═══ RUNNING / AEROBIC TRAINING ═══

/**
 * Obiettivi per l'allenamento running
 */
export type RunningGoal =
  | 'base_aerobica'       // Costruire base aerobica (Zone 2)
  | 'preparazione_5k'     // Prepararsi per una 5K
  | 'preparazione_10k'    // Prepararsi per una 10K
  | 'resistenza_generale' // Resistenza generale
  | 'complemento_sport'   // Complemento per altri sport
  | 'dimagrimento_cardio' // Focus brucia grassi
  | 'recupero_attivo';    // Recupero tra sessioni pesi

/**
 * Come integrare running con pesi
 */
export type RunningIntegration =
  | 'separate_days'    // Giorni separati (es. Lu/Me/Ve pesi, Ma/Gi running)
  | 'post_workout'     // Dopo la sessione pesi (15-20min)
  | 'hybrid_alternate' // Sessioni ibride alternate (per sport)
  | 'running_only';    // Solo running (niente pesi)

/**
 * Capacità running attuale (assessment)
 */
export interface RunningCapacity {
  canRun5Min: boolean;
  canRun10Min: boolean;
  canRun20Min: boolean;
  canRun30Min: boolean;
  currentPace?: string;     // es. "6:30/km"
  restingHeartRate?: number; // bpm
}

/**
 * Preferenze running complete
 */
export interface RunningPreferences {
  enabled: boolean;
  goal: RunningGoal;
  integration: RunningIntegration;
  sessionsPerWeek: number;   // 2-4 sessioni
  preferredDays?: string[];  // es. ['martedi', 'giovedi', 'sabato']
  capacity: RunningCapacity;
}

export interface PainEntry {
  area: PainArea;
  severity: PainSeverity;
}

/**
 * Injury History Record - Storico infortuni permanenti
 * Usato per controindicazioni PERMANENTI (es. ricostruzione LCA)
 */
export interface InjuryRecord {
  id: string;
  label: string;
  area: string;
  isRecent: boolean; // Se < 12 mesi, applica anche cautions come hard blocks
  contraindications: string[]; // Esercizi sempre vietati
  cautions: string[]; // Esercizi con warning (hard block se recente)
  notes?: string;
  dateOfInjury?: string;
}

export interface OnboardingData {
  // Step 1: Personal Info (include Navy Method measurements)
  personalInfo?: PersonalInfo;

  // Step 2: Location & Equipment
  trainingLocation?: TrainingLocation;
  trainingType?: TrainingType;
  equipmentPreference?: EquipmentPreference;
  equipment?: Equipment;

  // Step 3: Activity Level
  activityLevel?: ActivityLevel;

  // Step 4: Goal (supporta multi-goal)
  goal?: string; // backward compatibility (primo goal)
  goals?: string[]; // multi-goal support (max 2-3)
  sport?: string; // if goal includes sport_performance
  sportRole?: string; // ruolo/categoria (es. peso leggero per boxe)
  seasonPhase?: SeasonPhase; // fase stagionale (off_season, pre_season, in_season)
  muscularFocus?: string; // if goal includes ipertrofia or tonificazione

  // Step 5: Pain/Injury
  painAreas?: PainEntry[];

  // Step 6: Injury History (storico infortuni permanenti)
  injuryHistory?: InjuryRecord[];

  // Step 7: Running/Aerobic (optional)
  running?: RunningPreferences;
}

/**
 * Tipo per validare completezza onboarding
 */
export type CompleteOnboardingData = Required<Omit<OnboardingData, 'sport' | 'sportRole' | 'painAreas'>> & {
  painAreas: PainEntry[];
};
