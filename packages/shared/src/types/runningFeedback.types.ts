/**
 * RUNNING FEEDBACK & AUTO-REGULATION TYPES
 *
 * Sistema completo per raccogliere feedback strutturati dopo ogni sessione
 * di running e adattare automaticamente il programma basandosi sui pattern.
 */

// ============================================================================
// SENSAZIONI SOGGETTIVE
// ============================================================================

export type LegsFeel = 'fresh' | 'normal' | 'heavy' | 'dead';

export const LEGS_FEEL_OPTIONS = [
  { value: 'fresh' as LegsFeel, label: 'Fresh & light', labelIt: 'Fresche e leggere', emoji: '🦵✨', score: 4 },
  { value: 'normal' as LegsFeel, label: 'Normal', labelIt: 'Normali', emoji: '🦵', score: 3 },
  { value: 'heavy' as LegsFeel, label: 'Heavy', labelIt: 'Pesanti', emoji: '🦵💤', score: 2 },
  { value: 'dead' as LegsFeel, label: 'Dead / no response', labelIt: 'Morte / senza risposta', emoji: '🦵❌', score: 1 },
] as const;

export type BreathingQuality = 'easy' | 'controlled' | 'labored' | 'gasping';

export const BREATHING_OPTIONS = [
  { value: 'easy' as BreathingQuality, label: 'Easy, could chat', labelIt: 'Facile, potevo parlare', emoji: '😌', score: 4 },
  { value: 'controlled' as BreathingQuality, label: 'Controlled, short sentences', labelIt: 'Controllato, frasi brevi', emoji: '😤', score: 3 },
  { value: 'labored' as BreathingQuality, label: 'Labored, few words', labelIt: 'Affannoso, poche parole', emoji: '😰', score: 2 },
  { value: 'gasping' as BreathingQuality, label: "Gasping, couldn't talk", labelIt: 'Ansimante, non potevo parlare', emoji: '😵', score: 1 },
] as const;

export type RunQuality = 'smooth' | 'ok' | 'forced' | 'struggled';

export const RUN_QUALITY_OPTIONS = [
  { value: 'smooth' as RunQuality, label: 'Smooth & effortless', labelIt: 'Fluida e senza sforzo', emoji: '🏃‍♂️💨', score: 4 },
  { value: 'ok' as RunQuality, label: 'OK, some effort', labelIt: 'Ok, un po\' di sforzo', emoji: '🏃‍♂️', score: 3 },
  { value: 'forced' as RunQuality, label: 'Forced, had to push', labelIt: 'Forzata, ho dovuto spingere', emoji: '🏃‍♂️😓', score: 2 },
  { value: 'struggled' as RunQuality, label: 'Struggled throughout', labelIt: 'Faticato tutto il tempo', emoji: '🏃‍♂️😫', score: 1 },
] as const;

export type MentalState = 'motivated' | 'neutral' | 'distracted' | 'wanted_to_stop';

export const MENTAL_STATE_OPTIONS = [
  { value: 'motivated' as MentalState, label: 'Motivated, enjoyed it', labelIt: 'Motivato, mi sono divertito', emoji: '🔥', score: 4 },
  { value: 'neutral' as MentalState, label: 'Neutral, got it done', labelIt: 'Neutro, l\'ho fatta', emoji: '😐', score: 3 },
  { value: 'distracted' as MentalState, label: 'Distracted, mind elsewhere', labelIt: 'Distratto, testa altrove', emoji: '🤔', score: 2 },
  { value: 'wanted_to_stop' as MentalState, label: 'Wanted to stop', labelIt: 'Volevo fermarmi', emoji: '🛑', score: 1 },
] as const;

export type RecoveryFeeling = 'energized' | 'normal' | 'tired' | 'exhausted';

export const RECOVERY_FEELING_OPTIONS = [
  { value: 'energized' as RecoveryFeeling, label: 'Energized, could do more', labelIt: 'Energico, potevo fare di più', emoji: '⚡', score: 4 },
  { value: 'normal' as RecoveryFeeling, label: 'Normal, good workout', labelIt: 'Normale, buon allenamento', emoji: '👍', score: 3 },
  { value: 'tired' as RecoveryFeeling, label: 'Tired, need rest', labelIt: 'Stanco, ho bisogno di riposo', emoji: '😴', score: 2 },
  { value: 'exhausted' as RecoveryFeeling, label: 'Exhausted, overdid it', labelIt: 'Esausto, ho esagerato', emoji: '💀', score: 1 },
] as const;

// ============================================================================
// FATTORI CONTESTUALI
// ============================================================================

export type NutritionPreRun = 'good' | 'ok' | 'poor' | 'fasted';

export const NUTRITION_OPTIONS = [
  { value: 'good' as NutritionPreRun, label: 'Well fueled', labelIt: 'Ben alimentato', emoji: '🍌' },
  { value: 'ok' as NutritionPreRun, label: 'OK', labelIt: 'Ok', emoji: '🥪' },
  { value: 'poor' as NutritionPreRun, label: 'Poor / junk', labelIt: 'Scarsa / junk food', emoji: '🍔' },
  { value: 'fasted' as NutritionPreRun, label: 'Fasted', labelIt: 'A digiuno', emoji: '⏰' },
] as const;

export type WeatherCondition = 'ideal' | 'warm' | 'hot' | 'cold' | 'rainy' | 'windy' | 'humid';

export const WEATHER_OPTIONS = [
  { value: 'ideal' as WeatherCondition, label: 'Ideal (15-20°C)', labelIt: 'Ideale (15-20°C)', emoji: '🌤️', hrAdjustment: 0 },
  { value: 'warm' as WeatherCondition, label: 'Warm (20-25°C)', labelIt: 'Caldo (20-25°C)', emoji: '☀️', hrAdjustment: 3 },
  { value: 'hot' as WeatherCondition, label: 'Hot (>25°C)', labelIt: 'Molto caldo (>25°C)', emoji: '🥵', hrAdjustment: 8 },
  { value: 'cold' as WeatherCondition, label: 'Cold (<10°C)', labelIt: 'Freddo (<10°C)', emoji: '🥶', hrAdjustment: 2 },
  { value: 'rainy' as WeatherCondition, label: 'Rainy', labelIt: 'Pioggia', emoji: '🌧️', hrAdjustment: 0 },
  { value: 'windy' as WeatherCondition, label: 'Windy', labelIt: 'Ventoso', emoji: '💨', hrAdjustment: 2 },
  { value: 'humid' as WeatherCondition, label: 'Humid', labelIt: 'Umido', emoji: '💧', hrAdjustment: 5 },
] as const;

export type RunningSurface = 'asphalt' | 'trail' | 'track' | 'treadmill' | 'grass' | 'sand';

export const SURFACE_OPTIONS = [
  { value: 'asphalt' as RunningSurface, label: 'Asphalt', labelIt: 'Asfalto', emoji: '🛣️' },
  { value: 'trail' as RunningSurface, label: 'Trail', labelIt: 'Sentiero', emoji: '🌲' },
  { value: 'track' as RunningSurface, label: 'Track', labelIt: 'Pista', emoji: '🏟️' },
  { value: 'treadmill' as RunningSurface, label: 'Treadmill', labelIt: 'Tapis roulant', emoji: '🏃' },
  { value: 'grass' as RunningSurface, label: 'Grass', labelIt: 'Erba', emoji: '🌿' },
  { value: 'sand' as RunningSurface, label: 'Sand', labelIt: 'Sabbia', emoji: '🏖️' },
] as const;

export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';

export const TIME_OF_DAY_OPTIONS = [
  { value: 'morning' as TimeOfDay, label: 'Morning (6-11)', labelIt: 'Mattina (6-11)', emoji: '🌅' },
  { value: 'midday' as TimeOfDay, label: 'Midday (11-14)', labelIt: 'Mezzogiorno (11-14)', emoji: '☀️' },
  { value: 'afternoon' as TimeOfDay, label: 'Afternoon (14-18)', labelIt: 'Pomeriggio (14-18)', emoji: '🌤️' },
  { value: 'evening' as TimeOfDay, label: 'Evening (18-22)', labelIt: 'Sera (18-22)', emoji: '🌙' },
] as const;

export type HydrationLevel = 'good' | 'ok' | 'poor';

// ============================================================================
// COMPLETE FEEDBACK INTERFACE
// ============================================================================

export interface RunningSessionFeedback {
  // Identificatori
  id: string;
  sessionId: string;
  date: string;
  weekNumber: number;

  // === DATI OGGETTIVI ===
  completed: boolean;
  duration: number;            // minuti effettivi
  distance?: number;           // km
  avgPace?: string;            // min/km (es. "5:30")
  avgPaceSeconds?: number;     // per calcoli

  // HR Data
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  restingHeartRateMorning?: number;
  hrDrift?: number;            // % aumento HR fine vs inizio
  timeInZone2?: number;        // % tempo in zona 2

  // === SENSAZIONI SOGGETTIVE ===
  rpe: number;                 // 1-10
  legsFeel: LegsFeel;
  breathingQuality: BreathingQuality;
  runQuality: RunQuality;
  mentalState: MentalState;
  recoveryFeeling: RecoveryFeeling;

  // === CONTESTO ===
  sleepQualityLastNight: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  nutritionPreRun: NutritionPreRun;
  hydrationPreRun: HydrationLevel;

  // === AMBIENTE ===
  weather?: WeatherCondition;
  temperature?: number;
  surface?: RunningSurface;
  elevation?: number;
  timeOfDay?: TimeOfDay;

  // === NOTE ===
  notes?: string;
  painAreas?: string[];

  // === FOLLOW-UP (giorno dopo) ===
  soreness24h?: 1 | 2 | 3 | 4 | 5;
  sleepQualityAfter?: 1 | 2 | 3 | 4 | 5;

  // === METRICHE CALCOLATE ===
  sessionScore?: number;       // 0-100
  readinessScore?: number;     // 0-100
  fatigueIndicator?: number;   // 0-100
}

export interface RunningSessionFeedbackInput extends Omit<RunningSessionFeedback, 'id' | 'sessionScore' | 'readinessScore' | 'fatigueIndicator'> {}

// ============================================================================
// THRESHOLDS & CONSTANTS
// ============================================================================

export const RUNNING_FEEDBACK_THRESHOLDS = {
  // HR Drift
  HR_DRIFT_EXCELLENT: 3,       // <3% = ottimo
  HR_DRIFT_GOOD: 5,            // 3-5% = buono
  HR_DRIFT_CONCERNING: 8,      // 5-8% = attenzione
  HR_DRIFT_HIGH: 10,           // >10% = troppo

  // RPE per Zone 2
  RPE_TOO_EASY: 4,             // <4 = troppo facile
  RPE_OPTIMAL_MIN: 5,          // 5-7 = zona ottimale
  RPE_OPTIMAL_MAX: 7,
  RPE_TOO_HARD: 8,             // >8 = troppo duro per Z2

  // Sessions to analyze
  MIN_SESSIONS_FOR_ANALYSIS: 3,
  SESSIONS_FOR_FULL_ANALYSIS: 6,

  // Pattern detection
  CONSECUTIVE_BAD_SESSIONS: 2,  // N sessioni consecutive negative = warning
  CONSECUTIVE_GOOD_SESSIONS: 3, // N sessioni consecutive positive = può progredire
} as const;

// ============================================================================
// PATTERN TYPES
// ============================================================================

export type RunningPatternId =
  | 'overreaching'
  | 'too_fast'
  | 'poor_recovery'
  | 'undertraining'
  | 'cardiac_adaptation'
  | 'mental_fatigue';

export type PatternSeverity = 'critical' | 'warning' | 'info';

export interface RunningPattern {
  id: RunningPatternId;
  name: string;
  nameIt: string;
  severity: PatternSeverity;
  confidence: number;        // 0-1
  detectedAt: string;
  sessionsAnalyzed: number;
  suggestedAction: string;
  suggestedActionIt: string;
}

// ============================================================================
// ADJUSTMENT TYPES
// ============================================================================

export type AdjustmentType =
  | 'reduce_volume'         // Riduci minuti
  | 'increase_volume'       // Aumenta minuti
  | 'reduce_intensity'      // Sessioni più facili
  | 'increase_intensity'    // Può progredire
  | 'add_rest_day'          // Aggiungi giorno riposo
  | 'deload_week'           // Settimana scarico
  | 'slow_down'             // Rallenta ritmo
  | 'maintain'              // Mantieni attuale
  | 'skip_session';         // Salta prossima sessione

export interface RunningAdjustment {
  id?: string;
  type: AdjustmentType;
  reason: string;
  reasonIt: string;

  // Parametri specifici
  volumeChangePercent?: number;    // Es: -15 per ridurre del 15%
  addMinutes?: number;
  removeMinutes?: number;
  targetRPEChange?: number;

  // Messaggi per l'utente
  userMessage: string;
  userMessageIt: string;

  // Confidence dell'adjustment
  confidence: number;              // 0-1

  // Auto-apply o richiede conferma?
  requiresConfirmation: boolean;

  // Metadata
  createdAt?: string;
  appliedAt?: string;
  userConfirmed?: boolean;
}

// ============================================================================
// ANALYSIS RESULT
// ============================================================================

export interface RunningFeedbackAnalysis {
  userId: string;
  programId?: string;
  analyzedAt: string;

  // Sessions analyzed
  sessionsCount: number;
  periodDays: number;

  // Averages
  avgRPE: number;
  avgSessionScore: number;
  avgHRDrift?: number;

  // Trends
  rpesTrend: 'improving' | 'stable' | 'worsening';
  scoreTrend: 'improving' | 'stable' | 'worsening';

  // Patterns detected
  patterns: RunningPattern[];

  // Suggested adjustment
  suggestedAdjustment: RunningAdjustment | null;

  // Summary
  summary: string;
  summaryIt: string;
}

// ============================================================================
// UI WIZARD TYPES
// ============================================================================

export type RunningLoggerStep = 'basics' | 'feelings' | 'hr_data' | 'context' | 'environment' | 'summary';

export interface RunningSessionLoggerProps {
  sessionId: string;
  sessionName: string;
  plannedDuration: number;
  targetHRZone: string;
  weekNumber: number;
  onComplete: (feedback: RunningSessionFeedbackInput) => void;
  onCancel: () => void;
  userHRMax?: number;
  userRestingHR?: number;
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

export function isValidLegsFeel(value: string): value is LegsFeel {
  return ['fresh', 'normal', 'heavy', 'dead'].includes(value);
}

export function isValidBreathingQuality(value: string): value is BreathingQuality {
  return ['easy', 'controlled', 'labored', 'gasping'].includes(value);
}

export function isValidRunQuality(value: string): value is RunQuality {
  return ['smooth', 'ok', 'forced', 'struggled'].includes(value);
}

export function isValidMentalState(value: string): value is MentalState {
  return ['motivated', 'neutral', 'distracted', 'wanted_to_stop'].includes(value);
}

export function isValidRecoveryFeeling(value: string): value is RecoveryFeeling {
  return ['energized', 'normal', 'tired', 'exhausted'].includes(value);
}

// ============================================================================
// SCORE HELPERS
// ============================================================================

export function getLegsFeelScore(value: LegsFeel): number {
  const option = LEGS_FEEL_OPTIONS.find(o => o.value === value);
  return option?.score || 3;
}

export function getBreathingScore(value: BreathingQuality): number {
  const option = BREATHING_OPTIONS.find(o => o.value === value);
  return option?.score || 3;
}

export function getRunQualityScore(value: RunQuality): number {
  const option = RUN_QUALITY_OPTIONS.find(o => o.value === value);
  return option?.score || 3;
}

export function getMentalStateScore(value: MentalState): number {
  const option = MENTAL_STATE_OPTIONS.find(o => o.value === value);
  return option?.score || 3;
}

export function getRecoveryFeelingScore(value: RecoveryFeeling): number {
  const option = RECOVERY_FEELING_OPTIONS.find(o => o.value === value);
  return option?.score || 3;
}

export function getWeatherHRAdjustment(value: WeatherCondition): number {
  const option = WEATHER_OPTIONS.find(o => o.value === value);
  return option?.hrAdjustment || 0;
}
