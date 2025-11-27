/**
 * Script per scaricare immagini test screening e caricarle su Supabase Storage
 *
 * Esegui con: node scripts/upload-screening-images.js
 */

const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';
const BUCKET_NAME = 'exercise-images';

// Crea client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =====================================================
// IMMAGINI TEST SCREENING INIZIALE
// =====================================================
const SCREENING_IMAGES = [
  // === LOWER BODY PUSH (SQUAT) ===
  {
    name: 'air-squat',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/squat-exercise-illustration.jpg',
    fileName: 'air-squat.jpg',
    exercises: ['Air Squat', 'Squat', 'Bodyweight Squat']
  },
  {
    name: 'jump-squat',
    url: 'https://spotebi.com/wp-content/uploads/2015/08/jump-squat-exercise-illustration.jpg',
    fileName: 'jump-squat.jpg',
    exercises: ['Jump Squat']
  },
  {
    name: 'bulgarian-split-squat',
    url: 'https://spotebi.com/wp-content/uploads/2015/05/bulgarian-split-squat-exercise-illustration.jpg',
    fileName: 'bulgarian-split-squat.jpg',
    exercises: ['Bulgarian Split Squat']
  },
  {
    name: 'pistol-squat',
    url: 'https://spotebi.com/wp-content/uploads/2015/05/pistol-squat-exercise-illustration.jpg',
    fileName: 'pistol-squat.jpg',
    exercises: ['Pistol Squat', 'Pistol Squat Assistito']
  },
  {
    name: 'shrimp-squat',
    url: 'https://spotebi.com/wp-content/uploads/2017/07/shrimp-squat-exercise-illustration-spotebi.jpg',
    fileName: 'shrimp-squat.jpg',
    exercises: ['Shrimp Squat']
  },

  // === HORIZONTAL PUSH (PUSH-UP) ===
  {
    name: 'push-up',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/push-up-exercise-illustration.jpg',
    fileName: 'push-up.jpg',
    exercises: ['Push-up Standard', 'Push-up', 'Standard Push-up']
  },
  {
    name: 'knee-push-up',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/knee-push-up-exercise-illustration.jpg',
    fileName: 'knee-push-up.jpg',
    exercises: ['Push-up su Ginocchia', 'Knee Push-up']
  },
  {
    name: 'decline-push-up',
    url: 'https://spotebi.com/wp-content/uploads/2016/03/decline-push-up-exercise-illustration-spotebi.jpg',
    fileName: 'decline-push-up.jpg',
    exercises: ['Decline Push-up', 'Elevated Pike Push-up']
  },

  // === VERTICAL PUSH (PIKE → HSPU) ===
  {
    name: 'pike-push-up',
    url: 'https://spotebi.com/wp-content/uploads/2016/03/pike-push-up-exercise-illustration-spotebi.jpg',
    fileName: 'pike-push-up.jpg',
    exercises: ['Pike Push-up']
  },

  // === VERTICAL PULL (PULL-UP) ===
  {
    name: 'pull-up',
    url: 'https://workoutlabs.com/train/svg.php?id=85099',
    fileName: 'pull-up.svg',
    exercises: ['Pull-up Standard', 'Pull-up', 'Negative Pull-up', 'Band-Assisted Pull-up']
  },
  {
    name: 'chin-up',
    url: 'https://workoutlabs.com/fit/pin-ex/cache-png/82487-m.png',
    fileName: 'chin-up.png',
    exercises: ['Chin-up', 'Chin-up Standard']
  },

  // === GYM MODE ===
  {
    name: 'lat-pulldown',
    url: 'https://spotebi.com/wp-content/uploads/2017/08/cobra-lat-pulldown-exercise-illustration-spotebi.jpg',
    fileName: 'lat-pulldown.jpg',
    exercises: ['Lat Pulldown', 'Cobra Lat Pulldown']
  }
];

// Directory temporanea per le immagini
const TEMP_DIR = path.join(__dirname, 'temp-images');

/**
 * Scarica un file da URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`  Redirect to: ${redirectUrl}`);
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Crea bucket se non esiste
 */
async function ensureBucketExists() {
  console.log(`\nVerifica bucket '${BUCKET_NAME}'...`);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Errore listing buckets:', listError);
    return false;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`Creazione bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error('Errore creazione bucket:', createError);
      return false;
    }
    console.log('Bucket creato con successo!');
  } else {
    console.log('Bucket già esistente.');
  }

  return true;
}

/**
 * Carica file su Supabase
 */
async function uploadToSupabase(localPath, fileName) {
  const fileBuffer = fs.readFileSync(localPath);
  const contentType = fileName.endsWith('.svg') ? 'image/svg+xml' :
                      fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true // Sovrascrivi se esiste
    });

  if (error) {
    throw error;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

/**
 * Main
 */
async function main() {
  console.log('=== Upload Immagini Test Screening su Supabase ===\n');

  // Crea directory temporanea
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // Verifica/crea bucket
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('Impossibile preparare il bucket. Uscita.');
    process.exit(1);
  }

  // Risultati
  const results = {
    success: [],
    failed: []
  };

  // Processa ogni immagine
  for (const image of SCREENING_IMAGES) {
    console.log(`\n[${image.name}]`);
    console.log(`  URL: ${image.url}`);
    console.log(`  Esercizi: ${image.exercises.join(', ')}`);

    const localPath = path.join(TEMP_DIR, image.fileName);

    try {
      // Scarica
      console.log('  Downloading...');
      await downloadFile(image.url, localPath);

      // Verifica dimensione file
      const stats = fs.statSync(localPath);
      console.log(`  Downloaded: ${(stats.size / 1024).toFixed(1)} KB`);

      // Carica su Supabase
      console.log('  Uploading to Supabase...');
      const publicUrl = await uploadToSupabase(localPath, image.fileName);
      console.log(`  ✅ Success: ${publicUrl}`);

      results.success.push({
        name: image.name,
        fileName: image.fileName,
        url: publicUrl,
        exercises: image.exercises
      });

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.failed.push({
        name: image.name,
        error: err.message
      });
    }
  }

  // Cleanup
  console.log('\n--- Cleanup ---');
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('Temp directory removed.');
  } catch (e) {
    console.log('Could not remove temp directory:', e.message);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\nUploaded images:');
    results.success.forEach(r => {
      console.log(`  - ${r.fileName}`);
      console.log(`    URL: ${r.url}`);
      console.log(`    Esercizi: ${r.exercises.join(', ')}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\nFailed images:');
    results.failed.forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  // Genera mapping per exerciseImages.ts
  console.log('\n=== MAPPING per exerciseImages.ts ===\n');
  results.success.forEach(r => {
    r.exercises.forEach(ex => {
      console.log(`  '${ex}': {`);
      console.log(`    url: \`\${SUPABASE_STORAGE_URL}/${r.fileName}\`,`);
      console.log(`    source: 'Spotebi/WorkoutLabs',`);
      console.log(`    type: 'illustration'`);
      console.log(`  },`);
    });
  });

  console.log('\n✅ Done!');
}

main().catch(console.error);
