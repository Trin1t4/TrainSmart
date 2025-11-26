/**
 * Script per caricare i video degli esercizi su Supabase Storage
 *
 * Prerequisiti:
 * 1. Crea bucket "exercise-videos" in Supabase Dashboard > Storage
 * 2. Imposta bucket come PUBLIC
 * 3. Esegui: node upload-videos-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurazione Supabase
const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Errore: SUPABASE_SERVICE_KEY non impostata');
  console.log('\nUsa:');
  console.log('  set SUPABASE_SERVICE_KEY=your_service_role_key');
  console.log('  node upload-videos-to-supabase.js');
  console.log('\nTrova la service_role key in: Supabase Dashboard > Settings > API > service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const VIDEOS_DIR = path.join(__dirname, 'packages', 'web', 'public', 'videos', 'exercises');
const BUCKET_NAME = 'exercise-videos';

async function uploadVideos() {
  console.log('🎬 Upload video su Supabase Storage\n');
  console.log(`📁 Cartella: ${VIDEOS_DIR}`);
  console.log(`🪣 Bucket: ${BUCKET_NAME}\n`);

  // Leggi tutti i file video
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
  console.log(`📊 Trovati ${files.length} video\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(VIDEOS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);

    process.stdout.write(`⬆️  ${file} (${fileSize} MB)... `);

    try {
      // Check if already exists
      const { data: existing } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { search: file });

      if (existing && existing.find(f => f.name === file)) {
        console.log('⏭️  già esistente');
        skipped++;
        continue;
      }

      // Upload
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file, fileBuffer, {
          contentType: 'video/mp4',
          cacheControl: '31536000', // 1 year cache
          upsert: false
        });

      if (error) {
        console.log(`❌ ${error.message}`);
        errors++;
      } else {
        console.log('✅');
        uploaded++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Caricati: ${uploaded}`);
  console.log(`⏭️  Saltati: ${skipped}`);
  console.log(`❌ Errori: ${errors}`);
  console.log('='.repeat(50));

  if (uploaded > 0 || skipped > 0) {
    console.log(`\n🔗 URL base: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`);
    console.log('\nEsempio URL video:');
    console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/push-up.mp4`);
  }
}

uploadVideos().catch(console.error);
