/**
 * PROGRAM NORMALIZER UNIFIED v2.0
 * 
 * Sostituisce:
 * - programNormalizer.ts (output: weekly_schedule)
 * - programStructureNormalizer.ts (output: weekly_split)
 * 
 * STANDARD UNICO: weekly_split.days[] con flag _normalized
 * 
 * @module programNormalizerUnified
 */

import type { Exercise, DayWorkout, WeeklySplit } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface NormalizedExercise {
  id: string;
  name: string;
  pattern: string;
  sets: number;
  reps: string | number;
  rest: number; // sempre in secondi
  weight?: string | number;
  tempo?: string;
  intensity?: string;
  targetRir?: number;
  notes?: string;
  videoUrl?: string;
  alternatives?: string[];
  isWarmup?: boolean;
  isFinisher?: boolean;
  baseline?: any;
  superset?: boolean;
  /** ⚠️ IMPORTANTE: Configurazione riscaldamento specifica per questo esercizio */
  warmup?: {
    sets: number;
    reps: number;
    percentage: number;
    note?: string;
    ramp?: Array<{ reps: number; percentage: number }>;
  };
}

export interface NormalizedDay {
  dayIndex: number;
  dayName: string;
  dayNumber?: number;
  dayType: 'strength' | 'hypertrophy' | 'endurance' | 'recovery' | 'mixed' | 'running';
  muscleGroups: string[];
  exercises: NormalizedExercise[];
  estimatedDuration: number;
  location: 'gym' | 'home' | 'home_gym' | 'outdoor';
  notes?: string;
  focus?: string;
  runningSession?: NormalizedRunningSession;
}

export interface NormalizedRunningSession {
  type: 'easy' | 'tempo' | 'intervals' | 'long' | 'recovery';
  duration: number;
  distance?: number;
  targetHRZone?: number;
  intervals?: {
    workDuration: number;
    restDuration: number;
    repeats: number;
  };
  notes?: string;
}

export interface NormalizedWeeklySplit {
  days: NormalizedDay[];
  totalDays: number;
  restDays: number[];
  splitName?: string;
  deloadWeek?: number;
}

export interface NormalizedProgram {
  // Identificatori
  id: string;
  user_id: string;
  name: string;
  description?: string;

  // Parametri core
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  location: 'gym' | 'home' | 'home_gym';
  training_type: 'bodyweight' | 'equipment' | 'machines' | 'mixed';

  // Schedule - UNICO FORMATO STANDARD
  frequency: number;
  split: string;
  weekly_split: NormalizedWeeklySplit;

  // Durata
  total_weeks: number;
  current_week: number;

  // Metadata
  start_date: string;
  end_date?: string;
  is_active: boolean;
  status: 'active' | 'completed' | 'paused' | 'archived' | 'draft';

  // Assessment data
  pattern_baselines?: Record<string, any>;
  pain_areas?: Array<{ area: string; intensity?: number; severity?: number }>;
  available_equipment?: Record<string, boolean>;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;

  // Campi extra preservati
  assessment_id?: string;
  progression?: any[];
  includes_deload?: boolean;
  deload_frequency?: number;
  corrective_exercises?: any[];
  metadata?: Record<string, any>;
  notes?: string;

  // Flag normalizzazione
  _normalized: true;
  _normalizedAt: string;
  _originalStructure: StructureType;
}

export type StructureType = 
  | 'weekly_split'
  | 'weekly_schedule'
  | 'exercises'
  | 'already_normalized'
  | 'unknown';

// =============================================================================
// DETECTION
// =============================================================================

/**
 * Rileva quale struttura usa il programma
 */
export function detectProgramStructure(program: any): StructureType {
  if (!program) return 'unknown';

  // Già normalizzato
  if (program._normalized === true) {
    return 'already_normalized';
  }

  // weekly_split.days (formato DB standard)
  if (program.weekly_split?.days && Array.isArray(program.weekly_split.days)) {
    return 'weekly_split';
  }

  // weekly_schedule (formato legacy/team)
  if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
    return 'weekly_schedule';
  }

  // exercises[] flat (formato legacy)
  if (program.exercises && Array.isArray(program.exercises)) {
    return 'exercises';
  }

  return 'unknown';
}

/**
 * Verifica se il programma è già normalizzato
 */
export function isNormalizedProgram(program: any): program is NormalizedProgram {
  return program?._normalized === true &&
         program?.weekly_split?.days &&
         Array.isArray(program.weekly_split.days);
}

// =============================================================================
// NORMALIZATION HELPERS
// =============================================================================

let idCounter = 0;

function generateExerciseId(dayIndex: number, exIndex: number, name: string): string {
  const slug = (name || 'exercise')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);
  idCounter++;
  return `ex_${dayIndex}_${exIndex}_${slug}_${idCounter.toString(36)}`;
}

function normalizeRest(rest: any): number {
  if (typeof rest === 'number') return rest;
  if (typeof rest === 'string') {
    // "60s" -> 60, "90" -> 90, "1:30" -> 90
    const match = rest.match(/^(\d+)/);
    if (match) return parseInt(match[1], 10);
    if (rest.includes(':')) {
      const [min, sec] = rest.split(':').map(Number);
      return (min * 60) + (sec || 0);
    }
  }
  return 60;
}

function normalizeExercise(ex: any, dayIndex: number, exIndex: number): NormalizedExercise {
  if (typeof ex === 'string') {
    return {
      id: generateExerciseId(dayIndex, exIndex, ex),
      name: ex,
      pattern: inferPatternFromName(ex),
      sets: 3,
      reps: '8-12',
      rest: 60
    };
  }

  // ⚠️ Preserva l'oggetto warmup se esiste (NON convertirlo in boolean!)
  const warmupData = ex.warmup && typeof ex.warmup === 'object' ? {
    sets: ex.warmup.sets || 2,
    reps: ex.warmup.reps || 6,
    percentage: ex.warmup.percentage || 60,
    note: ex.warmup.note,
    ramp: ex.warmup.ramp,
  } : undefined;

  return {
    id: ex.id || generateExerciseId(dayIndex, exIndex, ex.name),
    name: ex.name || `Exercise ${exIndex + 1}`,
    pattern: ex.pattern || inferPatternFromName(ex.name),
    sets: typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets) || 3,
    reps: ex.reps ?? '8-12',
    rest: normalizeRest(ex.rest),
    weight: ex.weight,
    tempo: ex.tempo,
    intensity: ex.intensity,
    targetRir: ex.targetRir ?? ex.target_rir ?? ex.rir,
    notes: ex.notes,
    videoUrl: ex.videoUrl ?? ex.video_url,
    alternatives: ex.alternatives,
    isWarmup: ex.isWarmup ?? (typeof ex.warmup === 'boolean' ? ex.warmup : false),
    isFinisher: ex.isFinisher ?? ex.finisher ?? false,
    baseline: ex.baseline,
    superset: ex.superset,
    warmup: warmupData, // ⚠️ Ora il warmup viene preservato!
  };
}

function inferPatternFromName(name: string): string {
  if (!name) return 'accessory';
  const lower = name.toLowerCase();

  const patterns: Record<string, string[]> = {
    'squat': ['squat', 'goblet', 'leg press', 'hack', 'pistol'],
    'hinge': ['deadlift', 'rdl', 'hip hinge', 'good morning', 'stacco', 'romanian'],
    'horizontal_push': ['bench', 'push-up', 'pushup', 'chest press', 'panca', 'dip'],
    'horizontal_pull': ['row', 'rematore', 'pulley', 'cable row'],
    'vertical_push': ['overhead', 'ohp', 'military', 'shoulder press', 'lento', 'pike'],
    'vertical_pull': ['pull-up', 'pullup', 'chin-up', 'chinup', 'lat pulldown', 'trazioni', 'pull up'],
    'core': ['plank', 'crunch', 'dead bug', 'bird dog', 'pallof', 'addominali', 'hollow', 'ab '],
    'carry': ['farmer', 'carry', 'walk', 'suitcase'],
    'lunge': ['lunge', 'split squat', 'step up', 'bulgarian'],
  };

  for (const [pattern, keywords] of Object.entries(patterns)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return pattern;
    }
  }

  return 'accessory';
}

function inferDayType(exercises: NormalizedExercise[]): NormalizedDay['dayType'] {
  if (exercises.length === 0) return 'recovery';

  const avgSets = exercises.reduce((sum, e) => sum + e.sets, 0) / exercises.length;
  const patterns = exercises.map(e => e.pattern);

  if (patterns.some(p => p === 'running')) return 'running';
  if (avgSets >= 4) return 'hypertrophy';
  if (avgSets <= 3 && exercises.length <= 5) return 'strength';

  return 'mixed';
}

function inferMuscleGroups(exercises: NormalizedExercise[]): string[] {
  const groups = new Set<string>();

  const patternToMuscles: Record<string, string[]> = {
    'squat': ['quadriceps', 'glutes'],
    'hinge': ['hamstrings', 'glutes', 'erectors'],
    'horizontal_push': ['chest', 'triceps', 'front_delts'],
    'horizontal_pull': ['lats', 'mid_back', 'biceps'],
    'vertical_push': ['shoulders', 'triceps'],
    'vertical_pull': ['lats', 'biceps'],
    'core': ['abs', 'obliques'],
    'lunge': ['quadriceps', 'glutes', 'hamstrings'],
  };

  for (const ex of exercises) {
    const muscles = patternToMuscles[ex.pattern];
    if (muscles) muscles.forEach(m => groups.add(m));
  }

  return Array.from(groups);
}

function estimateDuration(exercises: NormalizedExercise[]): number {
  if (exercises.length === 0) return 0;

  let totalSeconds = 5 * 60; // warmup

  for (const ex of exercises) {
    const reps = typeof ex.reps === 'number' 
      ? ex.reps 
      : parseInt(String(ex.reps).split('-')[1]) || 10;
    const setDuration = reps * 4;
    const totalSetTime = (setDuration + ex.rest) * ex.sets;
    totalSeconds += totalSetTime + 30; // transition
  }

  return Math.round(totalSeconds / 60);
}

function calculateRestDays(totalDays: number): number[] {
  const map: Record<number, number[]> = {
    1: [2, 3, 4, 5, 6, 7],
    2: [2, 4, 6, 7],
    3: [2, 4, 7],
    4: [3, 6, 7],
    5: [3, 7],
    6: [7],
    7: [],
  };
  return map[totalDays] || [];
}

function inferSplitName(totalDays: number): string {
  const names: Record<number, string> = {
    1: 'full_body',
    2: 'upper_lower',
    3: 'push_pull_legs',
    4: 'upper_lower_2x',
    5: 'ppl_upper_lower',
    6: 'ppl_2x',
  };
  return names[totalDays] || 'custom';
}

// =============================================================================
// CONVERTERS
// =============================================================================

function fromWeeklySchedule(program: any): NormalizedWeeklySplit {
  const schedule = program.weekly_schedule || [];

  const days: NormalizedDay[] = schedule.map((day: any, index: number) => {
    const exercises = (day.exercises || []).map((ex: any, exIdx: number) =>
      normalizeExercise(ex, index, exIdx)
    );

    return {
      dayIndex: index,
      dayName: day.dayName || day.day_name || day.name || `Giorno ${index + 1}`,
      dayNumber: day.dayNumber || index + 1,
      dayType: day.dayType || inferDayType(exercises),
      muscleGroups: day.muscleGroups || inferMuscleGroups(exercises),
      exercises,
      estimatedDuration: day.estimatedDuration || estimateDuration(exercises),
      location: (day.location || program.location || 'gym') as NormalizedDay['location'],
      notes: day.notes,
      focus: day.focus,
    };
  });

  return {
    days,
    totalDays: days.length,
    restDays: calculateRestDays(days.length),
    splitName: program.split || inferSplitName(days.length),
  };
}

function fromWeeklySplit(program: any): NormalizedWeeklySplit {
  const split = program.weekly_split || { days: [] };
  const rawDays = split.days || [];

  const days: NormalizedDay[] = rawDays.map((day: any, index: number) => {
    const exercises = (day.exercises || []).map((ex: any, exIdx: number) =>
      normalizeExercise(ex, index, exIdx)
    );

    return {
      dayIndex: day.dayIndex ?? index,
      dayName: day.dayName || day.day_name || `Giorno ${index + 1}`,
      dayNumber: day.dayNumber || index + 1,
      dayType: day.dayType || inferDayType(exercises),
      muscleGroups: day.muscleGroups || inferMuscleGroups(exercises),
      exercises,
      estimatedDuration: day.estimatedDuration || estimateDuration(exercises),
      location: (day.location || program.location || 'gym') as NormalizedDay['location'],
      notes: day.notes,
      focus: day.focus,
      runningSession: day.runningSession,
    };
  });

  return {
    days,
    totalDays: days.length,
    restDays: split.restDays || calculateRestDays(days.length),
    splitName: split.splitName || program.split || inferSplitName(days.length),
    deloadWeek: split.deloadWeek,
  };
}

function fromExercisesArray(program: any): NormalizedWeeklySplit {
  const exercises = (program.exercises || []).map((ex: any, exIdx: number) =>
    normalizeExercise(ex, 0, exIdx)
  );

  const day: NormalizedDay = {
    dayIndex: 0,
    dayName: 'Full Body',
    dayNumber: 1,
    dayType: inferDayType(exercises),
    muscleGroups: inferMuscleGroups(exercises),
    exercises,
    estimatedDuration: estimateDuration(exercises),
    location: (program.location || 'gym') as NormalizedDay['location'],
    notes: 'Converted from legacy exercises[]',
    focus: 'Full Body Training',
  };

  return {
    days: [day],
    totalDays: 1,
    restDays: [2, 3, 4, 5, 6, 7],
    splitName: 'full_body',
  };
}

// =============================================================================
// VALUE NORMALIZERS
// =============================================================================

function normalizeLevel(level: any): NormalizedProgram['level'] {
  if (!level) return 'intermediate';
  const l = String(level).toLowerCase();
  if (l.includes('beg') || l === 'principiante') return 'beginner';
  if (l.includes('adv') || l === 'avanzato') return 'advanced';
  return 'intermediate';
}

function normalizeLocation(location: any): NormalizedProgram['location'] {
  if (!location) return 'gym';
  const l = String(location).toLowerCase();
  if (l === 'home' || l === 'casa') return 'home';
  if (l.includes('home_gym') || l.includes('homegym')) return 'home_gym';
  return 'gym';
}

function normalizeTrainingType(type: any): NormalizedProgram['training_type'] {
  if (!type) return 'mixed';
  const t = String(type).toLowerCase();
  if (t === 'bodyweight' || t === 'corpo_libero' || t === 'calisthenics') return 'bodyweight';
  if (t === 'equipment' || t === 'attrezzi') return 'equipment';
  if (t === 'machines' || t === 'macchine') return 'machines';
  return 'mixed';
}

function normalizeStatus(status: any): NormalizedProgram['status'] {
  if (!status) return 'active';
  const s = String(status).toLowerCase();
  if (['active', 'completed', 'paused', 'archived', 'draft'].includes(s)) {
    return s as NormalizedProgram['status'];
  }
  return 'active';
}

// =============================================================================
// MAIN NORMALIZER
// =============================================================================

/**
 * NORMALIZZA QUALSIASI PROGRAMMA → FORMATO UNIFICATO
 * 
 * @example
 * const raw = await supabase.from('training_programs').select('*').single();
 * const program = normalizeProgram(raw.data);
 * // Usa SEMPRE program.weekly_split.days
 */
export function normalizeProgram(program: any): NormalizedProgram {
  if (!program) {
    throw new Error('[ProgramNormalizer] Cannot normalize null/undefined program');
  }

  if (isNormalizedProgram(program)) {
    return program;
  }

  const structure = detectProgramStructure(program);
  console.log(`[ProgramNormalizer] Detected: ${structure}`);

  let weeklySplit: NormalizedWeeklySplit;

  switch (structure) {
    case 'weekly_schedule':
      weeklySplit = fromWeeklySchedule(program);
      break;
    case 'weekly_split':
      weeklySplit = fromWeeklySplit(program);
      break;
    case 'exercises':
      weeklySplit = fromExercisesArray(program);
      break;
    case 'already_normalized':
      return program as NormalizedProgram;
    default:
      console.warn('[ProgramNormalizer] Unknown structure, using exercises fallback');
      weeklySplit = fromExercisesArray(program);
  }

  const normalized: NormalizedProgram = {
    // IDs
    id: program.id || `prog_${Date.now()}`,
    user_id: program.user_id || '',
    name: program.name || 'Training Program',
    description: program.description,

    // Core params
    level: normalizeLevel(program.level),
    goal: program.goal || 'ipertrofia',
    location: normalizeLocation(program.location),
    training_type: normalizeTrainingType(program.training_type || program.trainingType),

    // Schedule
    frequency: weeklySplit.totalDays,
    split: weeklySplit.splitName || program.split || 'custom',
    weekly_split: weeklySplit,

    // Duration
    total_weeks: program.total_weeks || program.totalWeeks || 8,
    current_week: program.current_week || program.currentWeek || 1,

    // Metadata
    start_date: program.start_date || program.startDate || new Date().toISOString(),
    end_date: program.end_date || program.endDate,
    is_active: program.is_active ?? program.isActive ?? true,
    status: normalizeStatus(program.status),

    // Assessment
    pattern_baselines: program.pattern_baselines || program.patternBaselines,
    pain_areas: program.pain_areas || program.painAreas,
    available_equipment: program.available_equipment || program.equipment,

    // Timestamps
    created_at: program.created_at || program.createdAt || new Date().toISOString(),
    updated_at: program.updated_at || program.updatedAt || new Date().toISOString(),
    last_accessed_at: program.last_accessed_at,

    // Extra fields preserved
    assessment_id: program.assessment_id,
    progression: program.progression,
    includes_deload: program.includes_deload,
    deload_frequency: program.deload_frequency,
    corrective_exercises: program.corrective_exercises,
    metadata: program.metadata,
    notes: program.notes,

    // Normalization flag
    _normalized: true,
    _normalizedAt: new Date().toISOString(),
    _originalStructure: structure,
  };

  console.log(`[ProgramNormalizer] ✅ Normalized: ${normalized.name} (${weeklySplit.totalDays} days)`);

  return normalized;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Wrapper null-safe per service
 */
export function normalizeOnLoad<T>(data: T): T extends null | undefined ? null : NormalizedProgram {
  if (!data) return null as any;
  return normalizeProgram(data) as any;
}

/**
 * Normalizza array di programmi
 */
export function normalizeMany(programs: any[]): NormalizedProgram[] {
  return programs.map(p => normalizeProgram(p));
}

/**
 * Prepara per salvataggio DB (rimuove campi runtime)
 */
export function prepareForSave(program: NormalizedProgram): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _normalized, _normalizedAt, _originalStructure, ...dbProgram } = program;
  return {
    ...dbProgram,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Ottieni tutti gli esercizi flattened
 */
export function getAllExercises(program: NormalizedProgram): NormalizedExercise[] {
  return program.weekly_split.days.flatMap(day => day.exercises);
}

/**
 * Ottieni esercizi per giorno
 */
export function getExercisesForDay(program: NormalizedProgram, dayIndex: number): NormalizedExercise[] {
  return program.weekly_split.days[dayIndex]?.exercises || [];
}

/**
 * Trova esercizio per ID
 */
export function getExerciseById(
  program: NormalizedProgram,
  exerciseId: string
): { exercise: NormalizedExercise; dayIndex: number } | null {
  for (let dayIndex = 0; dayIndex < program.weekly_split.days.length; dayIndex++) {
    const exercise = program.weekly_split.days[dayIndex].exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      return { exercise, dayIndex };
    }
  }
  return null;
}

/**
 * Trova esercizio per nome
 */
export function getExerciseByName(
  program: NormalizedProgram,
  exerciseName: string
): { exercise: NormalizedExercise; dayIndex: number } | null {
  const lowerName = exerciseName.toLowerCase();
  for (let dayIndex = 0; dayIndex < program.weekly_split.days.length; dayIndex++) {
    const exercise = program.weekly_split.days[dayIndex].exercises.find(
      ex => ex.name.toLowerCase() === lowerName
    );
    if (exercise) {
      return { exercise, dayIndex };
    }
  }
  return null;
}

/**
 * Aggiorna un esercizio (immutable)
 */
export function updateExerciseInProgram(
  program: NormalizedProgram,
  dayIndex: number,
  exerciseId: string,
  updates: Partial<NormalizedExercise>
): NormalizedProgram {
  const newDays = program.weekly_split.days.map((day, idx) => {
    if (idx !== dayIndex) return day;

    return {
      ...day,
      exercises: day.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, ...updates };
      }),
    };
  });

  return {
    ...program,
    weekly_split: {
      ...program.weekly_split,
      days: newDays,
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Aggiorna peso esercizio per nome
 */
export function updateExerciseWeight(
  program: NormalizedProgram,
  exerciseName: string,
  newWeight: number | string,
  note?: string
): NormalizedProgram {
  const found = getExerciseByName(program, exerciseName);
  if (!found) {
    console.warn(`[ProgramNormalizer] Exercise "${exerciseName}" not found`);
    return program;
  }

  return updateExerciseInProgram(program, found.dayIndex, found.exercise.id, {
    weight: newWeight,
    notes: note ? `${found.exercise.notes || ''} | ${note}`.trim() : found.exercise.notes,
  });
}

/**
 * Conta esercizi totali
 */
export function countExercises(program: NormalizedProgram): number {
  return getAllExercises(program).length;
}

/**
 * Filtra esercizi per pattern
 */
export function getExercisesByPattern(program: NormalizedProgram, pattern: string): NormalizedExercise[] {
  return getAllExercises(program).filter(ex => ex.pattern === pattern);
}

// =============================================================================
// LEGACY COMPATIBILITY (per vecchio programNormalizer.ts)
// =============================================================================

/**
 * @deprecated Use normalizeProgram instead
 */
export function needsNormalization(program: any): boolean {
  return !isNormalizedProgram(program);
}

/**
 * @deprecated Use detectProgramStructure instead
 */
export function isCanonicalFormat(program: any): boolean {
  return program?.weekly_split?.days && Array.isArray(program.weekly_split.days);
}

/**
 * Trova esercizio per nome (legacy signature)
 * @deprecated Use getExerciseByName instead
 */
export function findExerciseByName(
  program: NormalizedProgram, 
  exerciseName: string
): { day: NormalizedDay; exercise: NormalizedExercise; dayIndex: number } | null {
  const result = getExerciseByName(program, exerciseName);
  if (!result) return null;
  return {
    day: program.weekly_split.days[result.dayIndex],
    exercise: result.exercise,
    dayIndex: result.dayIndex
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  // Main
  normalizeProgram,
  normalizeOnLoad,
  normalizeMany,
  prepareForSave,
  
  // Detection
  isNormalizedProgram,
  detectProgramStructure,
  
  // Getters
  getAllExercises,
  getExercisesForDay,
  getExerciseById,
  getExerciseByName,
  getExercisesByPattern,
  countExercises,
  
  // Updaters
  updateExerciseInProgram,
  updateExerciseWeight,
  
  // Legacy
  needsNormalization,
  isCanonicalFormat,
  findExerciseByName,
};
