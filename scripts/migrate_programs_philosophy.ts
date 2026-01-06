/**
 * Migration Script: Update Program Philosophy
 *
 * Aggiorna tutti i programmi esistenti nel database con:
 * 1. Struttura normalizzata (weekly_schedule)
 * 2. Nuova filosofia di progressione (DUP bodyweight vs linear weighted)
 * 3. Goal mapping canonico
 * 4. Metadata aggiornati
 *
 * Esegui con: npx tsx scripts/migrate_programs_philosophy.ts
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================
// TYPES
// ============================================

interface Exercise {
  pattern?: string;
  name: string;
  sets: number;
  reps: number;
  rest: string;
  intensity?: string;
  notes?: string;
  weight?: string;
  baseline?: any;
}

interface DayWorkout {
  dayName: string;
  dayNumber?: number;
  focus?: string;
  exercises: Exercise[];
  estimatedDuration?: number;
}

interface TrainingProgram {
  id: string;
  user_id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  location?: string;
  training_type?: string;
  frequency: number;
  split: string;
  weekly_split?: { days: DayWorkout[] };
  weekly_schedule?: DayWorkout[];
  exercises?: Exercise[];
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// GOAL MAPPING (Canonical ↔ Database)
// ============================================

const GOAL_TO_CANONICAL: Record<string, string> = {
  // Italian → English canonical
  'ipertrofia': 'hypertrophy',
  'massa': 'hypertrophy',
  'massa muscolare': 'hypertrophy',
  'forza': 'strength',
  'forza massimale': 'strength',
  'perdita peso': 'fat_loss',
  'dimagrimento': 'fat_loss',
  'fat loss': 'fat_loss',
  'tonificazione': 'toning',
  'toning': 'toning',
  'resistenza': 'endurance',
  'endurance': 'endurance',
  'performance': 'athletic_performance',
  'athletic': 'athletic_performance',
  'sport': 'athletic_performance',
  'generale': 'general_fitness',
  'general': 'general_fitness',
  'ricomposizione': 'recomposition',
  'recomp': 'recomposition',
  'mobilità': 'mobility',
  'mobility': 'mobility',
  'riabilitazione': 'rehabilitation',
  'rehab': 'rehabilitation',
};

function normalizeGoal(goal: string): string {
  const lower = goal.toLowerCase().trim();
  return GOAL_TO_CANONICAL[lower] || lower;
}

// ============================================
// PROGRESSION PHILOSOPHY
// ============================================

interface ProgressionPhilosophy {
  type: 'dup_bodyweight' | 'linear_weighted' | 'hybrid';
  description: string;
  principles: string[];
  dayTypes?: {
    heavy?: string;
    moderate?: string;
    volume?: string;
  };
}

function determinePhilosophy(
  location: string,
  trainingType: string,
  goal: string
): ProgressionPhilosophy {
  const isBodyweight = location === 'home' || trainingType === 'bodyweight';
  const normalizedGoal = normalizeGoal(goal);

  if (isBodyweight) {
    return {
      type: 'dup_bodyweight',
      description: 'Daily Undulating Periodization per bodyweight',
      principles: [
        'Heavy day: variante più difficile (-40% reps)',
        'Volume day: variante base (+15% reps)',
        'Moderate day: variante base (tecnica)',
        'Progressione attraverso varianti più difficili',
        'RPE-based intensity (scala 1-10)',
      ],
      dayTypes: {
        heavy: 'Usa variante upgrade, focus forza',
        moderate: 'Variante base, consolidamento tecnica',
        volume: 'Variante base, accumulo reps',
      },
    };
  }

  if (normalizedGoal === 'strength' || normalizedGoal === 'hypertrophy') {
    return {
      type: 'linear_weighted',
      description: 'Progressione lineare con carichi',
      principles: [
        'Incremento peso quando RIR target raggiunto',
        'Range reps fisso per obiettivo',
        'Deload ogni 4-6 settimane',
        'Autoregolazione basata su RPE/RIR',
      ],
    };
  }

  return {
    type: 'hybrid',
    description: 'Approccio ibrido periodizzato',
    principles: [
      'Combina elementi DUP e lineari',
      'Adatta intensità al contesto',
      'Priorità a recupero e consistenza',
    ],
  };
}

// ============================================
// PROGRAM NORMALIZER
// ============================================

function normalizeExercise(ex: any): Exercise {
  return {
    pattern: ex.pattern || 'core',
    name: ex.name,
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    rest: typeof ex.rest === 'number' ? `${ex.rest}s` : (ex.rest || '60s'),
    intensity: ex.intensity,
    notes: ex.notes,
    weight: ex.weight,
    baseline: ex.baseline,
  };
}

function normalizeProgram(program: TrainingProgram): {
  weekly_schedule: DayWorkout[];
  weekly_split: { days: DayWorkout[] };
} {
  let days: DayWorkout[];

  // Priority 1: weekly_split.days (DB canonical format)
  if (program.weekly_split?.days && Array.isArray(program.weekly_split.days)) {
    days = program.weekly_split.days.map((day: any) => ({
      dayName: day.dayName,
      dayNumber: day.dayNumber,
      focus: day.focus,
      exercises: (day.exercises || []).map(normalizeExercise),
      estimatedDuration: day.estimatedDuration,
    }));
  }
  // Priority 2: weekly_schedule
  else if (program.weekly_schedule && Array.isArray(program.weekly_schedule)) {
    days = program.weekly_schedule.map((day: any, index: number) => ({
      dayName: day.dayName || day.name || `Giorno ${index + 1}`,
      dayNumber: day.dayNumber || index + 1,
      focus: day.focus || '',
      exercises: (day.exercises || []).map(normalizeExercise),
      estimatedDuration: day.estimatedDuration,
    }));
  }
  // Priority 3: exercises[] (legacy flat format)
  else if (program.exercises && Array.isArray(program.exercises)) {
    const exercises = program.exercises.map(normalizeExercise);
    days = [{
      dayName: 'Full Body',
      dayNumber: 1,
      focus: 'Allenamento Completo',
      exercises,
      estimatedDuration: Math.max(30, exercises.length * 5),
    }];
  }
  // Fallback
  else {
    days = [];
  }

  return {
    weekly_schedule: days,
    weekly_split: { days },
  };
}

// ============================================
// MAIN MIGRATION
// ============================================

async function migratePrograms() {
  console.log('🚀 Starting program philosophy migration...\n');

  // 1. Fetch all active programs
  console.log('📥 Fetching active programs from Supabase...');
  const { data: programs, error: fetchError } = await supabase
    .from('training_programs')
    .select('*')
    .eq('is_active', true);

  if (fetchError) {
    console.error('❌ Error fetching programs:', fetchError);
    process.exit(1);
  }

  if (!programs || programs.length === 0) {
    console.log('ℹ️ No active programs found to migrate.');
    return;
  }

  console.log(`✅ Found ${programs.length} active programs to migrate\n`);

  // 2. Process each program
  let successCount = 0;
  let errorCount = 0;

  for (const program of programs as TrainingProgram[]) {
    console.log(`\n📝 Processing: "${program.name}" (${program.id.slice(0, 8)}...)`);
    console.log(`   User: ${program.user_id.slice(0, 8)}...`);
    console.log(`   Level: ${program.level}, Goal: ${program.goal}`);
    console.log(`   Location: ${program.location || 'N/A'}, Type: ${program.training_type || 'N/A'}`);

    try {
      // Normalize program structure
      const normalized = normalizeProgram(program);

      // Determine progression philosophy
      const philosophy = determinePhilosophy(
        program.location || 'home',
        program.training_type || 'bodyweight',
        program.goal
      );

      // Prepare updated metadata
      const updatedMetadata = {
        ...(program.metadata || {}),
        progression_philosophy: philosophy,
        canonical_goal: normalizeGoal(program.goal),
        migrated_at: new Date().toISOString(),
        migration_version: '2.0.0',
      };

      // 3. Update program in database
      const { error: updateError } = await supabase
        .from('training_programs')
        .update({
          weekly_schedule: normalized.weekly_schedule,
          weekly_split: normalized.weekly_split,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Updated successfully`);
        console.log(`   📊 Philosophy: ${philosophy.type}`);
        console.log(`   📅 Days: ${normalized.weekly_schedule.length}`);
        console.log(`   🏋️ Exercises: ${normalized.weekly_schedule.reduce((acc, d) => acc + d.exercises.length, 0)}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Exception: ${err.message}`);
      errorCount++;
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total processed: ${programs.length}`);
  console.log('='.repeat(50));

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Also migrate inactive programs (optional, can be run separately)
async function migrateAllPrograms() {
  console.log('🚀 Starting FULL program philosophy migration (all programs)...\n');

  // Fetch ALL programs
  console.log('📥 Fetching ALL programs from Supabase...');
  const { data: programs, error: fetchError } = await supabase
    .from('training_programs')
    .select('*');

  if (fetchError) {
    console.error('❌ Error fetching programs:', fetchError);
    process.exit(1);
  }

  if (!programs || programs.length === 0) {
    console.log('ℹ️ No programs found to migrate.');
    return;
  }

  console.log(`✅ Found ${programs.length} total programs to migrate\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const program of programs as TrainingProgram[]) {
    try {
      const normalized = normalizeProgram(program);
      const philosophy = determinePhilosophy(
        program.location || 'home',
        program.training_type || 'bodyweight',
        program.goal
      );

      const updatedMetadata = {
        ...(program.metadata || {}),
        progression_philosophy: philosophy,
        canonical_goal: normalizeGoal(program.goal),
        migrated_at: new Date().toISOString(),
        migration_version: '2.0.0',
      };

      const { error: updateError } = await supabase
        .from('training_programs')
        .update({
          weekly_schedule: normalized.weekly_schedule,
          weekly_split: normalized.weekly_split,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (updateError) {
        console.log(`❌ ${program.name}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${program.name} (${philosophy.type})`);
        successCount++;
      }
    } catch (err: any) {
      console.log(`❌ ${program.name}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migrated: ${successCount} | ❌ Errors: ${errorCount} | Total: ${programs.length}`);
  console.log('='.repeat(50));
}

// ============================================
// RUN
// ============================================

const args = process.argv.slice(2);
const migrateAll = args.includes('--all');

if (migrateAll) {
  migrateAllPrograms().catch(console.error);
} else {
  migratePrograms().catch(console.error);
}
