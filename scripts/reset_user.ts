/**
 * Script per resettare un utente (deve rifare tutto)
 *
 * Uso: npx tsx scripts/reset_user.ts "laura.comolli@email.com"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.log('Set environment variables:');
  console.log('  export SUPABASE_URL=your-url');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function resetUser(emailPattern: string) {
  console.log(`\n🔍 Cercando utente con email: ${emailPattern}\n`);

  // 1. Trova l'utente
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('Errore nel cercare utenti:', userError);
    return;
  }

  const user = users.users.find(u =>
    u.email?.toLowerCase().includes(emailPattern.toLowerCase())
  );

  if (!user) {
    console.error(`❌ Utente non trovato con email pattern: ${emailPattern}`);
    console.log('\nUtenti disponibili:');
    users.users.forEach(u => console.log(`  - ${u.email}`));
    return;
  }

  console.log(`✅ Trovato utente: ${user.email} (ID: ${user.id})\n`);

  const userId = user.id;

  // 2. Elimina dati correlati
  const tables = [
    'training_programs',
    'workout_logs',
    'exercise_logs',
    'program_adjustments',
    'pain_tracking',
    'rehabilitation_programs',
    'recovery_tracking',
    'user_streaks',
    'personal_records',
    'user_achievements',
    'video_corrections',
    'social_posts',
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`🗑️  Eliminati dati da ${table}`);
      }
    } catch (e) {
      console.log(`⚠️  ${table}: tabella non esistente o errore`);
    }
  }

  // Elimina follows (ha colonne diverse)
  try {
    await supabase.from('user_follows').delete().eq('follower_id', userId);
    await supabase.from('user_follows').delete().eq('following_id', userId);
    console.log('🗑️  Eliminati user_follows');
  } catch (e) {
    console.log('⚠️  user_follows: errore');
  }

  // 3. Resetta il profilo
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      onboarding_completed: false,
      onboarding_data: null,
      screening_data: null,
      quiz_data: null,
      level: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (profileError) {
    console.error('❌ Errore nel resettare profilo:', profileError);
  } else {
    console.log('🔄 Resettato user_profile');
  }

  console.log(`\n✅ RESET COMPLETATO per ${user.email}`);
  console.log('   L\'utente deve ora rifare:');
  console.log('   - Onboarding');
  console.log('   - Quiz biomeccanico');
  console.log('   - Screening pratico');
  console.log('   - Generazione programma');
}

// Esegui
const emailArg = process.argv[2] || 'laura';
resetUser(emailArg);
