#!/usr/bin/env node
/**
 * Apply mesocycle tracking migration
 * Adds mesocycle_number and mesocycle_start_date columns to volume_profiles
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('[Migration] Applying mesocycle tracking...');
  
  const sql = `
    -- Add mesocycle tracking columns
    ALTER TABLE volume_profiles
    ADD COLUMN IF NOT EXISTS mesocycle_number INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS mesocycle_start_date TIMESTAMPTZ DEFAULT NOW();

    -- Add index for efficient queries
    CREATE INDEX IF NOT EXISTS idx_volume_profiles_mesocycle 
    ON volume_profiles(user_id, mesocycle_number);

    -- Update existing records to mesocycle 1
    UPDATE volume_profiles
    SET mesocycle_number = 1,
        mesocycle_start_date = created_at
    WHERE mesocycle_number IS NULL;
  `;
  
  const { data, error } = await supabase.rpc('exec', { sql });
  
  if (error) {
    console.error('[Migration] ❌ Error:', error);
    process.exit(1);
  }
  
  console.log('[Migration] ✅ Success! Mesocycle tracking columns added.');
  console.log('[Migration] Columns: mesocycle_number (INT), mesocycle_start_date (TIMESTAMPTZ)');
  process.exit(0);
}

applyMigration();
