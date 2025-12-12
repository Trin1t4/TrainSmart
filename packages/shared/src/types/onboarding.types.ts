/**
 * Onboarding Types - Centralizzato
 * Definizioni complete per il flow di onboarding
 */

export type TrainingLocation = 'gym' | 'home' | 'home_gym';

export type TrainingType = 'bodyweight' | 'equipment' | 'machines';

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

export type PainArea = 'knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'elbow' | 'hip' | 'neck';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export interface PainEntry {
  area: PainArea;
  severity: PainSeverity;
}

export interface OnboardingData {
  // Step 1: Personal Info (include Navy Method measurements)
  personalInfo?: PersonalInfo;

  // Step 2: Location & Equipment
  trainingLocation?: TrainingLocation;
  trainingType?: TrainingType;
  equipment?: Equipment;

  // Step 3: Activity Level
  activityLevel?: ActivityLevel;

  // Step 4: Goal (supporta multi-goal)
  goal?: string; // backward compatibility (primo goal)
  goals?: string[]; // multi-goal support (max 2-3)
  sport?: string; // if goal includes sport_performance
  sportRole?: string;
  muscularFocus?: string; // if goal includes ipertrofia or tonificazione

  // Step 5: Pain/Injury
  painAreas?: PainEntry[];
}

/**
 * Tipo per validare completezza onboarding
 */
export type CompleteOnboardingData = Required<Omit<OnboardingData, 'sport' | 'sportRole' | 'painAreas'>> & {
  painAreas: PainEntry[];
};
