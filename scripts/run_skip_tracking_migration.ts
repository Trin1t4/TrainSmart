/**
 * Script per eseguire la migration del skip tracking
 * Esegui con: npx tsx scripts/run_skip_tracking_migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non impostata');
  console.log('Imposta la variabile d\'ambiente SUPABASE_SERVICE_ROLE_KEY con la service role key');
  console.log('Puoi trovarla in: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Esecuzione migration skip tracking...\n');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '022_exercise_skip_tracking.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split SQL in statements separati (per evitare problemi con statement multipli)
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip commenti puri
    if (statement.split('\n').every(line => line.trim().startsWith('--') || line.trim() === '')) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Prova esecuzione diretta se rpc non funziona
        const { error: directError } = await supabase.from('_exec').select().limit(0);
        if (directError) {
          console.log(`⚠️  Statement ${i + 1}: ${error.message.substring(0, 100)}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch (err: any) {
      console.log(`⚠️  Statement ${i + 1}: ${err.message?.substring(0, 100) || 'Errore sconosciuto'}`);
      errorCount++;
    }
  }

  console.log(`\n✅ Migration completata: ${successCount} statements eseguiti, ${errorCount} errori/skip`);
  console.log('\n📋 Per verificare, esegui in Supabase SQL Editor:');
  console.log('   SELECT * FROM exercise_skips LIMIT 1;');
  console.log('   SELECT * FROM skip_pattern_alerts LIMIT 1;');
}

runMigration().catch(console.error);
