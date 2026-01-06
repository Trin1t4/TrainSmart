/**
 * MIGRATION SCRIPT: Fix Exercise Progressions
 * ============================================
 *
 * This script fixes programs where users got wrong exercises due to the
 * screening/generator mismatch bug.
 *
 * Strategy: Use program level (BEGINNER/INTERMEDIATE) to determine appropriate
 * exercise difficulty since historical screening data isn't stored separately.
 *
 * - BEGINNER programs: difficulty 1-3 (Wall Push-up, Incline, Knee)
 * - INTERMEDIATE programs: difficulty 4-6 (Standard, Diamond)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Exercise replacements based on program level
const BEGINNER_REPLACEMENTS: Record<string, string> = {
  // If BEGINNER has advanced exercises, downgrade them
  'Push-up Diamante': 'Push-up su Ginocchia',
  'Piegamenti Diamante': 'Push-up su Ginocchia',
  'Diamond Push-up': 'Push-up su Ginocchia',
  'Archer Push-up': 'Push-up su Ginocchia',
  'Pseudo Planche Push-up': 'Push-up su Ginocchia',
  'Push-up Standard': 'Push-up Inclinato (rialzato)',  // Standard might be too hard for beginners
  'Piegamenti': 'Push-up Inclinato (rialzato)',
};

// INTERMEDIATE can keep mid-level exercises
const INTERMEDIATE_ALLOWED = [
  'Push-up Standard',
  'Piegamenti',
  'Push-up Diamante',
  'Piegamenti Diamante',
  'Push-up su Ginocchia',
  'Push-up Inclinato (rialzato)',
  'Push-up al Muro'
];

interface Exercise {
  name: string;
  pattern?: string;
  difficulty?: number;
  [key: string]: any;
}

interface Day {
  exercises: Exercise[];
  [key: string]: any;
}

interface WeeklySplit {
  days: Day[];
  [key: string]: any;
}

interface Program {
  id: string;
  user_id: string;
  name: string;
  weekly_split: WeeklySplit;
  weekly_schedule: Day[];
}

function getProgramLevel(programName: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  const nameLower = programName.toLowerCase();
  if (nameLower.includes('beginner')) return 'BEGINNER';
  if (nameLower.includes('advanced')) return 'ADVANCED';
  return 'INTERMEDIATE';
}

async function fixProgram(program: Program): Promise<boolean> {
  let modified = false;
  const level = getProgramLevel(program.name);

  console.log(`  📊 Program level: ${level}`);

  // Only fix BEGINNER programs that might have wrong exercises
  if (level !== 'BEGINNER') {
    console.log(`  ✓ INTERMEDIATE/ADVANCED programs don't need fixing`);
    return false;
  }

  // Fix exercises in weekly_split.days
  if (program.weekly_split?.days) {
    for (const day of program.weekly_split.days) {
      if (day.exercises) {
        for (const exercise of day.exercises) {
          const currentName = exercise.name;

          // Check if this is an exercise that needs downgrade for beginners
          if (BEGINNER_REPLACEMENTS[currentName]) {
            const correctName = BEGINNER_REPLACEMENTS[currentName];
            console.log(`    🔄 ${currentName} → ${correctName}`);
            exercise.name = correctName;
            modified = true;
          }
        }
      }
    }
  }

  // Fix exercises in weekly_schedule
  if (program.weekly_schedule) {
    for (const day of program.weekly_schedule) {
      if (day.exercises) {
        for (const exercise of day.exercises) {
          const currentName = exercise.name;

          if (BEGINNER_REPLACEMENTS[currentName]) {
            const correctName = BEGINNER_REPLACEMENTS[currentName];
            console.log(`    🔄 ${currentName} → ${correctName}`);
            exercise.name = correctName;
            modified = true;
          }
        }
      }
    }
  }

  return modified;
}

async function main() {
  console.log('🚀 Starting exercise progression fix migration...\n');

  // Get all programs (we'll check environment from the data)
  const { data: programs, error } = await supabase
    .from('training_programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching programs:', error);
    return;
  }

  console.log(`📋 Found ${programs?.length || 0} programs to check\n`);

  let fixedCount = 0;
  let errorCount = 0;

  for (const program of programs || []) {
    console.log(`\n🔍 Checking program: ${program.name} (${program.id})`);

    try {
      const wasFixed = await fixProgram(program);

      if (wasFixed) {
        // Update the program in database
        const { error: updateError } = await supabase
          .from('training_programs')
          .update({
            weekly_split: program.weekly_split,
            weekly_schedule: program.weekly_schedule,
            updated_at: new Date().toISOString()
          })
          .eq('id', program.id);

        if (updateError) {
          console.error(`  ❌ Error updating: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`  ✅ Program fixed successfully`);
          fixedCount++;
        }
      } else {
        console.log(`  ✓ No changes needed`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing: ${err}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Migration complete!`);
  console.log(`   Fixed: ${fixedCount} programs`);
  console.log(`   Errors: ${errorCount} programs`);
  console.log(`   Total checked: ${programs?.length || 0} programs`);
}

main().catch(console.error);
