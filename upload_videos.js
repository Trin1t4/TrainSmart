const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const VIDEOS_DIRS = [
  './packages/teamflow/public/videos/exercises',
  './packages/web/public/videos/exercises'
];
const BUCKET_NAME = 'exercise-videos';

async function main() {
  console.log('🚀 Starting video upload to Supabase Storage...\n');

  // 1. Crea bucket se non esiste
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    });
    if (error) {
      console.error('Error creating bucket:', error.message);
      return;
    }
    console.log('✅ Bucket created!\n');
  } else {
    console.log(`📦 Bucket "${BUCKET_NAME}" already exists\n`);
  }

  // 2. Get existing files in bucket
  const { data: existingFiles } = await supabase.storage.from(BUCKET_NAME).list();
  const existingNames = new Set((existingFiles || []).map(f => f.name));
  console.log(`📦 ${existingNames.size} files already in bucket\n`);

  // 3. Collect all videos from all directories (deduplicated by name)
  const allFiles = new Map();
  for (const dir of VIDEOS_DIRS) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'));
      for (const file of files) {
        if (!allFiles.has(file)) {
          allFiles.set(file, path.join(dir, file));
        }
      }
    }
  }

  // Filter only new files (not in bucket)
  const newFiles = [...allFiles.entries()].filter(([name]) => !existingNames.has(name));
  console.log(`📁 Found ${allFiles.size} total videos, ${newFiles.length} new to upload\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  if (newFiles.length === 0) {
    console.log('✅ All videos already uploaded!\n');
    return;
  }

  for (const [fileName, filePath] of newFiles) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = (fileBuffer.length / 1024 / 1024).toFixed(2);

    process.stdout.write(`⬆️  Uploading ${fileName} (${fileSize}MB)... `);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      errors++;
    } else {
      console.log('✅');
      uploaded++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`========================================`);

  // URL base per i video
  console.log(`\n🔗 Video URL format:`);
  console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/[filename].mp4`);
}

main().catch(console.error);
