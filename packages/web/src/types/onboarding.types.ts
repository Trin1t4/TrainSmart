/**
 * Onboarding Types - Centralizzato
 * Definizioni complete per il flow di onboarding
 */

import type { RunningPreferences } from '@trainsmart/shared';

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
  | 'pre_partum'
  | 'post_partum'
  | 'disabilita';

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
  rack?: boolean; // Home gym: squat rack/stand
  cables?: boolean; // Home gym: cable machine/pulley
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

export interface Anagrafica {
  firstName: string;
  lastName: string;
  birthDate?: string; // ISO date string (optional)
  privacyAccepted: boolean;
  termsAccepted: boolean;
}

export interface RunningInterest {
  enabled: boolean;
  level?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
}

// ═══ PRESCRIZIONI MEDICHE ═══
export type MedicalRestrictionArea =
  | 'neck' | 'shoulder' | 'lower_back' | 'hip'
  | 'knee' | 'ankle' | 'wrist' | 'elbow'
  | 'arm'   // espande in: shoulder + elbow + wrist
  | 'leg';  // espande in: hip + knee + ankle

export interface MedicalRestriction {
  area: MedicalRestrictionArea;
  reason?: string;
  startDate: string;
  lastConfirmedDate: string;
}

export interface MedicalRestrictionsData {
  hasRestrictions: boolean;
  restrictions: MedicalRestriction[];
}

export interface OnboardingData {
  // Step 0: Anagrafica (required for Stripe & GDPR)
  anagrafica?: Anagrafica;

  // Step 1: Personal Info (include Navy Method measurements)
  personalInfo?: PersonalInfo;

  // Step 2: Goal (supporta multi-goal)
  goal?: string; // backward compatibility (primo goal)
  goals?: string[]; // multi-goal support (max 2-3)
  sport?: string; // if goal includes sport_performance
  sportRole?: string;
  muscularFocus?: string | string[]; // Multi-select muscular focus (max 3 muscle groups)

  // Step 3: Running Interest (legacy - solo interesse + livello base)
  runningInterest?: RunningInterest;

  // Step 3: Running Preferences (COMPLETO - da RunningOnboarding)
  running?: RunningPreferences;

  // Step 4: Location, Equipment & Frequency
  trainingLocation?: TrainingLocation;
  trainingType?: TrainingType;
  equipment?: Equipment;
  frequency?: number; // days per week (1-6)

  // Step 5: Screening Type
  screeningType?: 'thorough' | 'light';

  // Legacy / Optional
  activityLevel?: ActivityLevel;
  painAreas?: PainEntry[];

  // Medical Restrictions (prescrizioni mediche)
  medicalRestrictions?: MedicalRestrictionsData;
}

/**
 * Tipo per validare completezza onboarding
 */
export type CompleteOnboardingData = Required<Omit<OnboardingData, 'sport' | 'sportRole' | 'painAreas'>> & {
  painAreas: PainEntry[];
};
