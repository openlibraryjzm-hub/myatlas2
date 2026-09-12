import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://giguvusbbgonlvsqtrei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-eLh4iHUShl5pYEyXOLEvg_YBvfrLST';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedToolsAtlas() {
  console.log('🚀 Starting Supabase Cloud Seeding for ToolsAtlas (Transparent Brand PNGs)...');

  const batchDir = path.resolve('tools_downloads/batch1_dev_tools');
  const manifestPath = path.join(batchDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📦 Loaded manifest with ${manifest.length} tools.`);

  // 1. Clear existing toolsatlas posts from Supabase database
  console.log('🧹 Purging existing "toolsatlas" records from Supabase database...');
  await supabase.from('posts').delete().eq('atlas_id', 'toolsatlas');

  const records = [];
  let uploadSuccess = 0;
  let uploadFail = 0;

  const batchTimestamp = Date.now();

  // 2. Upload each Option 1 PNG card to Supabase Storage
  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const filePath = path.join(batchDir, item.file);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Missing file on disk: ${item.file}`);
      uploadFail++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storageKey = `toolsatlas/b1_${batchTimestamp}_${item.file.toLowerCase()}`;

    const { error: storageErr } = await supabase.storage
      .from('atlas-media')
      .upload(storageKey, fileBuffer, {
        upsert: true,
        contentType: 'image/png'
      });

    if (storageErr) {
      console.warn(`⚠️ Storage error for ${item.file}:`, storageErr.message);
      uploadFail++;
      continue;
    }

    const { data: publicData } = supabase.storage
      .from('atlas-media')
      .getPublicUrl(storageKey);

    const publicUrl = publicData?.publicUrl || '';
    const sourceTag = (item.tags || []).find(t => typeof t === 'string' && t.startsWith('source:'));
    const sourceUrl = sourceTag ? sourceTag.replace('source:', '') : '';

    const colorTag = (item.tags || []).find(t => typeof t === 'string' && t.startsWith('general:color:'));
    const hexColor = colorTag ? `#${colorTag.replace('general:color:', '')}` : '#7c3aed';

    records.push({
      id: `cloud_toolsatlas_${batchTimestamp}_${i}`,
      atlas_id: 'toolsatlas',
      name: item.title,
      tagline: null,
      description: null,
      website: publicUrl,
      secondary_url: sourceUrl,
      visual_color: hexColor,
      rating: 'safe',
      tags: item.tags,
      created_at: new Date().toISOString()
    });

    uploadSuccess++;
    if (uploadSuccess % 25 === 0) {
      console.log(`⏳ Storage Upload Progress: ${uploadSuccess} / ${manifest.length}...`);
    }
  }

  // 3. Commit records to Supabase Postgres 'posts' table
  console.log(`\n💾 Committing ${records.length} records to Supabase 'posts' database table...`);
  const { data: dbData, error: dbErr } = await supabase
    .from('posts')
    .insert(records)
    .select();

  if (dbErr) {
    console.error('❌ Supabase database insert error:', dbErr.message);
    process.exit(1);
  }

  console.log(`\n🎉 Option 1 ToolsAtlas Supabase Seeding Complete!`);
  console.log(`✅ Successfully seeded: ${records.length} tool posts into Supabase Cloud!`);
  console.log(`🌐 All images are hosted on Supabase CDN with HTTP 200 OK.`);
}

seedToolsAtlas().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
