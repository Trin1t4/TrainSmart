/**
 * Script per scaricare immagini da fonti esterne e caricarle su Supabase Storage
 *
 * Esegui con: node scripts/upload-exercise-images.js
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

// Mapping immagini da scaricare
const IMAGES_TO_UPLOAD = [
  {
    name: 'plank',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/plank-exercise-illustration.jpg',
    fileName: 'plank.jpg'
  },
  {
    name: 'side-plank',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/side-plank-exercise-illustration.jpg',
    fileName: 'side-plank.jpg'
  },
  {
    name: 'bird-dog',
    url: 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
    fileName: 'bird-dog.jpg'
  },
  {
    name: 'dead-bug',
    url: 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
    fileName: 'dead-bug.jpg'
  },
  {
    name: 'superman',
    url: 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
    fileName: 'superman.jpg'
  },
  {
    name: 'wall-sit',
    url: 'https://spotebi.com/wp-content/uploads/2015/05/wall-sit-exercise-illustration.jpg',
    fileName: 'wall-sit.jpg'
  },
  {
    name: 'glute-bridge',
    url: 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
    fileName: 'glute-bridge.jpg'
  },
  {
    name: 'side-plank-pose',
    url: 'https://spotebi.com/wp-content/uploads/2016/07/side-plank-pose-vasisthasana-spotebi.jpg',
    fileName: 'side-plank-pose.jpg'
  },
  {
    name: 'pigeon-pose',
    url: 'https://burst.shopifycdn.com/photos/pigeon-pose.jpg',
    fileName: 'pigeon-pose.jpg'
  },
  {
    name: 'l-sit',
    url: 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
    fileName: 'l-sit.jpg'
  },
  {
    name: 'hip-stretch',
    url: 'https://images.pexels.com/photos/4051518/pexels-photo-4051518.jpeg?auto=compress&cs=tinysrgb&w=600',
    fileName: 'hip-stretch.jpg'
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
  console.log('=== Upload Immagini Esercizi su Supabase ===\n');

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
  for (const image of IMAGES_TO_UPLOAD) {
    console.log(`\n[${image.name}]`);
    console.log(`  URL: ${image.url}`);

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
        url: publicUrl
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
      console.log(`  - ${r.fileName}: ${r.url}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\nFailed images:');
    results.failed.forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
