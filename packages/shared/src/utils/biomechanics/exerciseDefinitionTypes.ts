/**
 * Exercise Definition Types
 * Tipi per le definizioni dettagliate degli esercizi biomeccanici
 */

import type { SupportedExercise } from '../../types/biomechanics.types';

export type ExerciseCategory =
  | 'lower_push'
  | 'lower_pull'
  | 'horizontal_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'vertical_push'
  | 'core'
  | 'accessory';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'bench'
  | 'bar'
  | 'rings'
  | 'trx'
  | 'trap_bar'
  | 'landmine'
  | 't_bar'
  | 'parallel_bars'
  | 'dip_station'
  | 'plate'
  | 'ab_wheel'
  | 'medicine_ball'
  | 'rope'
  | 'wall';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ErrorDefinition {
  detection: string;
  severity: ErrorSeverity;
  risk: string;
  cue_it: string;
  cue_en: string;
}

export interface AngleRange {
  min?: number;
  max?: number;
  optimal?: number;
}

export interface ExerciseDefinition {
  id: SupportedExercise | string;
  names: string[];
  category: ExerciseCategory;
  equipment: (EquipmentType | string)[];
  unilateral?: boolean;
  isometric?: boolean;
  isolation?: boolean;
  difficulty?: number; // 1-10
  landmarks_required?: string[];
  angles?: Record<string, AngleRange>;
  positions?: Record<string, any>;
  errors?: Record<string, ErrorDefinition>;
  maps_to?: SupportedExercise;
  contraindications?: string[];
}

export interface ExerciseMetadata {
  id: SupportedExercise;
  names: string[];
  category: ExerciseCategory;
  equipment: string[];
  unilateral?: boolean;
  isometric?: boolean;
  isolation?: boolean;
  difficulty?: number;
  mapsTo?: SupportedExercise;
}
