/**
 * PROGRAM STRUCTURE NORMALIZER
 *
 * Risolve il problema delle 3 strutture diverse per i programmi:
 * - weekly_schedule (legacy/team)
 * - weekly_split.days (standard)
 * - exercises array (flat)
 *
 * STANDARD UNICO: weekly_split.days
 *
 * Uso:
 * import { normalizeProgram, isNormalizedProgram } from './programStructureNormalizer';
 * const normalized = normalizeProgram(anyProgram);
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NormalizedExercise {
  id: string;
  name: string;
  pattern: string;
  sets: number;
  reps: string | number;
  rest: number; // seconds
  weight?: string | number;
  tempo?: string;
  intensity?: string;
  targetRir?: number;
  notes?: string;
  videoUrl?: string;
  alternatives?: string[];
  isWarmup?: boolean;
  isFinisher?: boolean;
}

export interface NormalizedDay {
  dayIndex: number;
  dayName: string;
  dayType: 'strength' | 'hypertrophy' | 'endurance' | 'recovery' | 'mixed' | 'running';
  muscleGroups: string[];
  exercises: NormalizedExercise[];
  estimatedDuration: number; // minutes
  location: 'gym' | 'home' | 'home_gym' | 'outdoor';
  notes?: string;
  runningSession?: NormalizedRunningSession;
}

export interface NormalizedRunningSession {
  type: 'easy' | 'tempo' | 'intervals' | 'long' | 'recovery';
  duration: number; // minutes
  distance?: number; // km
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
  deloadWeek?: number;
}

export interface NormalizedProgram {
  id: string;
  user_id: string;
  name: string;
  description?: string;

  // Core fields
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  location: 'gym' | 'home' | 'home_gym';
  training_type: 'bodyweight' | 'equipment' | 'machines' | 'mixed';

  // Schedule
  frequency: number;
  split: string;
  weekly_split: NormalizedWeeklySplit;

  // Duration
  total_weeks: number;
  current_week: number;

  // Metadata
  start_date: string;
  is_active: boolean;
  status: 'active' | 'completed' | 'paused' | 'archived';

  // Assessment data
  pattern_baselines?: Record<string, PatternBaseline>;
  pain_areas?: PainArea[];
  available_equipment?: Record<string, boolean>;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;

  // Additional metadata
  metadata?: Record<string, any>;

  // Normalization flag
  _normalized: true;
  _normalizedAt: string;
  _originalStructure: 'weekly_schedule' | 'weekly_split' | 'exercises' | 'already_normalized' | 'unknown';
}

export interface PatternBaseline {
  variantId?: string;
  variantName?: string;
  difficulty?: number;
  reps?: number;
  weight10RM?: number;
  maxReps?: number;
  testedAt?: string;
}

export interface PainArea {
  area: string;
  severity?: number;
  intensity?: number;
}

// ============================================================================
// LEGACY STRUCTURE TYPES (for detection)
// ============================================================================

interface LegacyWeeklyScheduleDay {
  dayName?: string;
  day_name?: string;
  exercises?: any[];
  location?: string;
  focus?: string;
}

interface LegacyProgram {
  id?: string;
  user_id?: string;
  name?: string;

  // Possible structures
  weekly_schedule?: LegacyWeeklyScheduleDay[];
  weekly_split?: { days?: any[] } | any;
  exercises?: any[];

  // Other fields
  [key: string]: any;
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect which structure the program uses
 */
export function detectProgramStructure(program: any): 'weekly_schedule' | 'weekly_split' | 'exercises' | 'already_normalized' | 'unknown' {
  if (!program) return 'unknown';

  // Already normalized
  if (program._normalized === true) {
    return 'already_normalized';
  }

  // Check for weekly_split.days (standard structure)
  if (program.weekly_split?.days && Array.isArray(program.weekly_split.days)) {
    // Verify it has the expected normalized shape
    const firstDay = program.weekly_split.days[0];
    if (firstDay && typeof firstDay.dayIndex === 'number' && Array.isArray(firstDay.exercises)) {
      return 'weekly_split';
    }
  }

  // Check for weekly_schedule (legacy/team structure)
  if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
    return 'weekly_schedule';
  }

  // Check for flat exercises array
  if (program.exercises && Array.isArray(program.exercises) && !program.weekly_split && !program.weekly_schedule) {
    return 'exercises';
  }

  // Partial weekly_split without proper days array
  if (program.weekly_split && !program.weekly_split.days) {
    return 'exercises'; // Treat as flat
  }

  return 'unknown';
}

/**
 * Check if program is already normalized
 */
export function isNormalizedProgram(program: any): program is NormalizedProgram {
  return program?._normalized === true &&
         program?.weekly_split?.days &&
         Array.isArray(program.weekly_split.days);
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Generate unique exercise ID
 */
function generateExerciseId(dayIndex: number, exerciseIndex: number, name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
  return `ex_${dayIndex}_${exerciseIndex}_${slug}_${Date.now().toString(36)}`;
}

/**
 * Normalize a single exercise from any format
 */
function normalizeExercise(ex: any, dayIndex: number, exerciseIndex: number): NormalizedExercise {
  // Handle string-only exercise (just a name)
  if (typeof ex === 'string') {
    return {
      id: generateExerciseId(dayIndex, exerciseIndex, ex),
      name: ex,
      pattern: inferPatternFromName(ex),
      sets: 3,
      reps: '8-12',
      rest: 90
    };
  }

  // Normalize sets
  let sets = 3;
  if (typeof ex.sets === 'number') sets = ex.sets;
  else if (typeof ex.sets === 'string') sets = parseInt(ex.sets) || 3;

  // Normalize reps
  let reps: string | number = '8-12';
  if (ex.reps !== undefined) {
    reps = typeof ex.reps === 'number' ? ex.reps : String(ex.reps);
  }

  // Normalize rest
  let rest = 90;
  if (typeof ex.rest === 'number') rest = ex.rest;
  else if (typeof ex.rest === 'string') {
    // Handle "90s", "90 sec", "1:30" formats
    const parsed = parseRestTime(ex.rest);
    if (parsed) rest = parsed;
  }

  // Normalize weight
  let weight: string | number | undefined = ex.weight;
  if (typeof weight === 'string' && weight.includes('kg')) {
    const num = parseFloat(weight);
    if (!isNaN(num)) weight = num;
  }

  return {
    id: ex.id || generateExerciseId(dayIndex, exerciseIndex, ex.name || 'unknown'),
    name: ex.name || ex.exercise_name || ex.exerciseName || 'Unknown Exercise',
    pattern: ex.pattern || ex.movement_pattern || inferPatternFromName(ex.name || ''),
    sets,
    reps,
    rest,
    weight,
    tempo: ex.tempo,
    intensity: ex.intensity,
    targetRir: ex.targetRir ?? ex.target_rir ?? ex.rir,
    notes: ex.notes,
    videoUrl: ex.videoUrl || ex.video_url,
    alternatives: ex.alternatives || ex.safe_alternatives,
    isWarmup: ex.isWarmup || ex.is_warmup || false,
    isFinisher: ex.isFinisher || ex.is_finisher || false
  };
}

/**
 * Parse rest time from various formats
 */
function parseRestTime(restStr: string): number | null {
  // "90s" or "90 sec"
  const secMatch = restStr.match(/(\d+)\s*s(?:ec)?/i);
  if (secMatch) return parseInt(secMatch[1]);

  // "1:30" format
  const minSecMatch = restStr.match(/(\d+):(\d+)/);
  if (minSecMatch) {
    return parseInt(minSecMatch[1]) * 60 + parseInt(minSecMatch[2]);
  }

  // "2 min"
  const minMatch = restStr.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  // Plain number
  const num = parseInt(restStr);
  if (!isNaN(num)) return num;

  return null;
}

/**
 * Infer movement pattern from exercise name
 */
function inferPatternFromName(name: string): string {
  const lower = name.toLowerCase();

  // Lower push patterns
  if (lower.includes('squat') || lower.includes('leg press') || lower.includes('lunge') ||
      lower.includes('affondo') || lower.includes('step up')) {
    return 'lower_push';
  }

  // Lower pull patterns
  if (lower.includes('deadlift') || lower.includes('stacco') || lower.includes('hip thrust') ||
      lower.includes('glute bridge') || lower.includes('nordic') || lower.includes('leg curl')) {
    return 'lower_pull';
  }

  // Horizontal push
  if (lower.includes('push-up') || lower.includes('pushup') || lower.includes('panca') ||
      lower.includes('bench') || lower.includes('chest press') || lower.includes('dip')) {
    return 'horizontal_push';
  }

  // Horizontal pull
  if (lower.includes('row') || lower.includes('rematore') || lower.includes('face pull') ||
      lower.includes('inverted')) {
    return 'horizontal_pull';
  }

  // Vertical push
  if (lower.includes('military') || lower.includes('overhead') || lower.includes('shoulder press') ||
      lower.includes('pike') || lower.includes('handstand') || lower.includes('hspu')) {
    return 'vertical_push';
  }

  // Vertical pull
  if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up') ||
      lower.includes('chinup') || lower.includes('lat pull') || lower.includes('trazioni')) {
    return 'vertical_pull';
  }

  // Core
  if (lower.includes('plank') || lower.includes('crunch') || lower.includes('ab') ||
      lower.includes('core') || lower.includes('dead bug') || lower.includes('hollow')) {
    return 'core';
  }

  // Isolation
  if (lower.includes('curl') || lower.includes('extension') || lower.includes('raise') ||
      lower.includes('fly') || lower.includes('calf')) {
    return 'isolation';
  }

  return 'accessory';
}

/**
 * Infer day type from exercises
 */
function inferDayType(exercises: NormalizedExercise[]): NormalizedDay['dayType'] {
  if (exercises.length === 0) return 'recovery';

  const avgSets = exercises.reduce((sum, ex) => sum + ex.sets, 0) / exercises.length;
  const hasHeavyCompounds = exercises.some(ex =>
    ['lower_push', 'lower_pull', 'horizontal_push', 'vertical_pull'].includes(ex.pattern) &&
    ex.sets >= 4
  );

  // Check for running
  if (exercises.some(ex => ex.name.toLowerCase().includes('running') || ex.name.toLowerCase().includes('corsa'))) {
    return 'running';
  }

  // High sets, lower reps = strength
  if (hasHeavyCompounds && avgSets >= 4) {
    const avgReps = exercises.reduce((sum, ex) => {
      const reps = typeof ex.reps === 'number' ? ex.reps : parseInt(String(ex.reps).split('-')[0]) || 8;
      return sum + reps;
    }, 0) / exercises.length;

    if (avgReps <= 6) return 'strength';
    if (avgReps <= 12) return 'hypertrophy';
    return 'endurance';
  }

  return 'mixed';
}

/**
 * Infer muscle groups from exercises
 */
function inferMuscleGroups(exercises: NormalizedExercise[]): string[] {
  const groups = new Set<string>();

  const patternToMuscles: Record<string, string[]> = {
    'lower_push': ['quadriceps', 'glutes'],
    'lower_pull': ['hamstrings', 'glutes', 'lower_back'],
    'horizontal_push': ['chest', 'triceps', 'front_delts'],
    'horizontal_pull': ['lats', 'rhomboids', 'biceps'],
    'vertical_push': ['shoulders', 'triceps'],
    'vertical_pull': ['lats', 'biceps', 'rear_delts'],
    'core': ['abs', 'obliques'],
    'isolation': ['arms'],
    'accessory': ['misc']
  };

  exercises.forEach(ex => {
    const muscles = patternToMuscles[ex.pattern] || ['misc'];
    muscles.forEach(m => groups.add(m));
  });

  return Array.from(groups);
}

/**
 * Estimate workout duration
 */
function estimateDuration(exercises: NormalizedExercise[]): number {
  let totalSeconds = 0;

  exercises.forEach(ex => {
    const reps = typeof ex.reps === 'number' ? ex.reps : parseInt(String(ex.reps).split('-')[1]) || 10;
    const timePerRep = 4; // seconds
    const setDuration = reps * timePerRep;
    const totalSetTime = (setDuration + ex.rest) * ex.sets;
    totalSeconds += totalSetTime;
  });

  // Add warmup and transition time
  totalSeconds += 5 * 60; // 5 min warmup
  totalSeconds += exercises.length * 30; // 30 sec transition per exercise

  return Math.round(totalSeconds / 60);
}

/**
 * Normalize from weekly_schedule structure
 */
function normalizeFromWeeklySchedule(program: LegacyProgram): NormalizedWeeklySplit {
  const schedule = program.weekly_schedule || [];

  const days: NormalizedDay[] = schedule.map((day, index) => {
    const exercises = (day.exercises || []).map((ex: any, exIndex: number) =>
      normalizeExercise(ex, index, exIndex)
    );

    return {
      dayIndex: index,
      dayName: day.dayName || day.day_name || `Day ${index + 1}`,
      dayType: inferDayType(exercises),
      muscleGroups: inferMuscleGroups(exercises),
      exercises,
      estimatedDuration: estimateDuration(exercises),
      location: (day.location || program.location || 'gym') as NormalizedDay['location'],
      notes: day.focus
    };
  });

  return {
    days,
    totalDays: days.length,
    restDays: calculateRestDays(days.length)
  };
}

/**
 * Normalize from existing weekly_split structure (partial normalization)
 */
function normalizeFromWeeklySplit(program: LegacyProgram): NormalizedWeeklySplit {
  const split = program.weekly_split || { days: [] };
  const rawDays = split.days || [];

  const days: NormalizedDay[] = rawDays.map((day: any, index: number) => {
    const exercises = (day.exercises || []).map((ex: any, exIndex: number) =>
      normalizeExercise(ex, index, exIndex)
    );

    return {
      dayIndex: day.dayIndex ?? index,
      dayName: day.dayName || day.day_name || day.name || `Day ${index + 1}`,
      dayType: day.dayType || inferDayType(exercises),
      muscleGroups: day.muscleGroups || inferMuscleGroups(exercises),
      exercises,
      estimatedDuration: day.estimatedDuration || estimateDuration(exercises),
      location: (day.location || program.location || 'gym') as NormalizedDay['location'],
      notes: day.notes,
      runningSession: day.runningSession
    };
  });

  return {
    days,
    totalDays: days.length,
    restDays: split.restDays || calculateRestDays(days.length),
    deloadWeek: split.deloadWeek
  };
}

/**
 * Normalize from flat exercises array
 */
function normalizeFromExercisesArray(program: LegacyProgram): NormalizedWeeklySplit {
  const exercises = program.exercises || [];
  const frequency = program.frequency || program.days_per_week || 3;

  // Split exercises across days
  const exercisesPerDay = Math.ceil(exercises.length / frequency);
  const days: NormalizedDay[] = [];

  for (let dayIndex = 0; dayIndex < frequency; dayIndex++) {
    const startIdx = dayIndex * exercisesPerDay;
    const dayExercises = exercises.slice(startIdx, startIdx + exercisesPerDay);

    const normalizedExercises = dayExercises.map((ex: any, exIndex: number) =>
      normalizeExercise(ex, dayIndex, exIndex)
    );

    days.push({
      dayIndex,
      dayName: generateDayName(dayIndex, normalizedExercises),
      dayType: inferDayType(normalizedExercises),
      muscleGroups: inferMuscleGroups(normalizedExercises),
      exercises: normalizedExercises,
      estimatedDuration: estimateDuration(normalizedExercises),
      location: (program.location || 'gym') as NormalizedDay['location']
    });
  }

  return {
    days,
    totalDays: days.length,
    restDays: calculateRestDays(days.length)
  };
}

/**
 * Generate day name from exercises
 */
function generateDayName(dayIndex: number, exercises: NormalizedExercise[]): string {
  const groups = inferMuscleGroups(exercises);

  // Check for common splits
  if (groups.includes('chest') && groups.includes('triceps')) return 'Push Day';
  if (groups.includes('lats') && groups.includes('biceps')) return 'Pull Day';
  if (groups.includes('quadriceps') && groups.includes('hamstrings')) return 'Leg Day';
  if (groups.includes('chest') && groups.includes('lats')) return 'Upper Body';
  if (groups.length === 1 && groups[0] === 'abs') return 'Core Day';

  // Default
  const dayNames = ['Day A', 'Day B', 'Day C', 'Day D', 'Day E', 'Day F'];
  return dayNames[dayIndex] || `Day ${dayIndex + 1}`;
}

/**
 * Calculate rest days based on training frequency
 */
function calculateRestDays(trainingDays: number): number[] {
  const weekDays = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday

  if (trainingDays >= 6) return [0]; // Only Sunday off
  if (trainingDays >= 5) return [0, 3]; // Sunday + Wednesday
  if (trainingDays >= 4) return [0, 2, 4]; // Every other day roughly
  if (trainingDays >= 3) return [0, 2, 4, 6]; // Alternating

  return [0, 1, 3, 5, 6]; // 2 days training
}

// ============================================================================
// MAIN NORMALIZATION FUNCTION
// ============================================================================

/**
 * Normalize any program structure to the standard format
 */
export function normalizeProgram(program: any): NormalizedProgram {
  if (!program) {
    throw new Error('Cannot normalize null/undefined program');
  }

  // Already normalized
  if (isNormalizedProgram(program)) {
    return program;
  }

  const structure = detectProgramStructure(program);
  console.log(`[NORMALIZER] Detected structure: ${structure}`);

  let weeklySplit: NormalizedWeeklySplit;

  switch (structure) {
    case 'weekly_schedule':
      weeklySplit = normalizeFromWeeklySchedule(program);
      break;
    case 'weekly_split':
      weeklySplit = normalizeFromWeeklySplit(program);
      break;
    case 'exercises':
      weeklySplit = normalizeFromExercisesArray(program);
      break;
    case 'already_normalized':
      return program as NormalizedProgram;
    default:
      console.warn('[NORMALIZER] Unknown structure, attempting best-effort normalization');
      weeklySplit = normalizeFromExercisesArray(program);
  }

  // Build normalized program
  const normalized: NormalizedProgram = {
    id: program.id || `prog_${Date.now()}`,
    user_id: program.user_id || '',
    name: program.name || 'Training Program',
    description: program.description,

    level: normalizeLevel(program.level),
    goal: program.goal || 'ipertrofia',
    location: normalizeLocation(program.location),
    training_type: normalizeTrainingType(program.training_type || program.trainingType),

    frequency: weeklySplit.totalDays,
    split: program.split || inferSplitType(weeklySplit),
    weekly_split: weeklySplit,

    total_weeks: program.total_weeks || program.totalWeeks || 8,
    current_week: program.current_week || program.currentWeek || 1,

    start_date: program.start_date || program.startDate || new Date().toISOString(),
    is_active: program.is_active ?? program.isActive ?? true,
    status: program.status || 'active',

    pattern_baselines: program.pattern_baselines || program.patternBaselines,
    pain_areas: normalizePainAreas(program.pain_areas || program.painAreas),
    available_equipment: program.available_equipment || program.equipment,

    created_at: program.created_at || program.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_accessed_at: program.last_accessed_at,

    metadata: {
      ...program.metadata,
      originalStructure: structure
    },

    _normalized: true,
    _normalizedAt: new Date().toISOString(),
    _originalStructure: structure
  };

  console.log(`[NORMALIZER] ✅ Normalized program: ${normalized.name} (${weeklySplit.totalDays} days)`);

  return normalized;
}

// ============================================================================
// HELPER NORMALIZATION FUNCTIONS
// ============================================================================

function normalizeLevel(level: any): NormalizedProgram['level'] {
  const l = String(level).toLowerCase();
  if (l === 'advanced' || l === 'avanzato') return 'advanced';
  if (l === 'intermediate' || l === 'intermedio') return 'intermediate';
  return 'beginner';
}

function normalizeLocation(location: any): NormalizedProgram['location'] {
  const l = String(location).toLowerCase();
  if (l === 'home' || l === 'casa') return 'home';
  if (l === 'home_gym' || l === 'homegym') return 'home_gym';
  return 'gym';
}

function normalizeTrainingType(type: any): NormalizedProgram['training_type'] {
  const t = String(type).toLowerCase();
  if (t === 'bodyweight' || t === 'calisthenics') return 'bodyweight';
  if (t === 'machines' || t === 'macchine') return 'machines';
  if (t === 'equipment' || t === 'attrezzi') return 'equipment';
  return 'mixed';
}

function normalizePainAreas(areas: any[]): PainArea[] {
  if (!areas || !Array.isArray(areas)) return [];

  return areas.map(area => {
    if (typeof area === 'string') {
      return { area, severity: 3 };
    }
    return {
      area: area.area || area.name || 'unknown',
      severity: area.severity ?? area.intensity ?? 3
    };
  });
}

function inferSplitType(split: NormalizedWeeklySplit): string {
  const days = split.totalDays;

  if (days === 1) return 'full_body';
  if (days === 2) return 'upper_lower';
  if (days === 3) return 'push_pull_legs';
  if (days === 4) return 'upper_lower_2x';
  if (days >= 5) return 'bro_split';

  return 'custom';
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Update exercise in normalized program
 */
export function updateExerciseInProgram(
  program: NormalizedProgram,
  dayIndex: number,
  exerciseId: string,
  updates: Partial<NormalizedExercise>
): NormalizedProgram {
  const newProgram = { ...program };
  newProgram.weekly_split = { ...newProgram.weekly_split };
  newProgram.weekly_split.days = newProgram.weekly_split.days.map((day, idx) => {
    if (idx !== dayIndex) return day;

    return {
      ...day,
      exercises: day.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, ...updates };
      })
    };
  });

  newProgram.updated_at = new Date().toISOString();
  return newProgram;
}

/**
 * Get exercise by ID from normalized program
 */
export function getExerciseById(
  program: NormalizedProgram,
  exerciseId: string
): { exercise: NormalizedExercise; dayIndex: number } | null {
  for (let dayIndex = 0; dayIndex < program.weekly_split.days.length; dayIndex++) {
    const day = program.weekly_split.days[dayIndex];
    const exercise = day.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      return { exercise, dayIndex };
    }
  }
  return null;
}

/**
 * Get all exercises from program as flat array
 */
export function getAllExercises(program: NormalizedProgram): Array<NormalizedExercise & { dayIndex: number; dayName: string }> {
  return program.weekly_split.days.flatMap(day =>
    day.exercises.map(ex => ({
      ...ex,
      dayIndex: day.dayIndex,
      dayName: day.dayName
    }))
  );
}

export default {
  normalizeProgram,
  isNormalizedProgram,
  detectProgramStructure,
  updateExerciseInProgram,
  getExerciseById,
  getAllExercises
};
