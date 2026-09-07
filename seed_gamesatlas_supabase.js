import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf-8');
  envText.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'atlas-media';
const DOWNLOAD_DIR = path.join(__dirname, 'games_downloads');
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, 'manifest.json');

const sanitizeKey = (str) => str.replace(/[^\w.-]/g, '_').toLowerCase();

async function ensureBucketAndAtlasExist() {
  console.log(`📦 Ensuring Supabase Storage Bucket "${BUCKET_NAME}" exists...`);
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = Array.isArray(buckets) && buckets.some(b => b.name === BUCKET_NAME);

  if (!exists) {
    console.log(`🚀 Creating public storage bucket "${BUCKET_NAME}"...`);
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    });
  }
  console.log(`✅ Bucket "${BUCKET_NAME}" active.`);

  console.log(`🏛️ Registering "gamesatlas" in Supabase atlases table...`);
  const { error: atlasErr } = await supabase.from('atlases').upsert([{
    id: 'gamesatlas',
    name: 'Games Atlas',
    tagline: 'Curated Games Archive',
    description: 'Universal curated video games box art archive',
    theme_color: '#2563EB'
  }]);
  if (atlasErr) {
    console.warn('Atlas registration warning:', atlasErr.message);
  } else {
    console.log(`✅ "gamesatlas" registered in Supabase atlases table.`);
  }
}

async function run() {
  console.log(`\n==================================================`);
  console.log(`🌐 Seeding gamesatlas to Supabase Cloud Storage & Database`);
  console.log(`Target Supabase URL: ${SUPABASE_URL}`);
  console.log(`==================================================\n`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest file not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  await ensureBucketAndAtlasExist();

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log(`📄 Loaded ${manifest.length} items from manifest.json\n`);

  let uploadedCount = 0;
  let dbCount = 0;

  const recordsToInsert = [];

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const fileName = item.file;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    const cleanStorageName = sanitizeKey(fileName);
    const storagePath = `gamesatlas/${cleanStorageName}`;

    let publicUrl = '';

    if (fs.existsSync(filePath)) {
      const fileBytes = fs.readFileSync(filePath);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBytes, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (!uploadError) {
        uploadedCount++;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      publicUrl = publicUrlData.publicUrl;
    }

    const itemId = `steam_${cleanStorageName.replace(/\.jpg$/i, '')}`;
    const sourceUrl = item.tags.find(t => t.startsWith('source:'))?.replace('source:', '') || '';

    recordsToInsert.push({
      id: itemId,
      atlas_id: 'gamesatlas',
      name: item.title,
      tagline: null,
      description: null,
      website: publicUrl || sourceUrl,
      secondary_url: sourceUrl,
      visual_color: '#7c3aed',
      rating: 'safe',
      tags: item.tags,
      created_at: new Date().toISOString()
    });
  }

  // Batch insert into 'posts' table in Supabase
  console.log(`💾 Inserting ${recordsToInsert.length} records into Supabase 'posts' table...`);

  // Delete existing gamesatlas items first to clean stale test records
  await supabase.from('posts').delete().eq('atlas_id', 'gamesatlas');

  const { data: insertData, error: insertError } = await supabase
    .from('posts')
    .insert(recordsToInsert)
    .select();

  if (insertError) {
    console.error(`❌ Database insert error on 'posts' table:`, insertError.message);
  } else {
    dbCount = Array.isArray(insertData) ? insertData.length : recordsToInsert.length;
    console.log(`✅ Successfully inserted ${dbCount} records into Supabase table 'posts'!`);
  }

  console.log(`\n==================================================`);
  console.log(`🎉 COMPLETED Supabase Cloud Seeding for gamesatlas!`);
  console.log(`Images Uploaded to Storage: ${uploadedCount}`);
  console.log(`Records Inserted to DB:     ${dbCount}`);
  console.log(`==================================================\n`);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
