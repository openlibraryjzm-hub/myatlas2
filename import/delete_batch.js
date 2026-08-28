import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteBatch() {
  const targetTag = 'meta:upload:2026-08-16_12-36-00';
  console.log(`Deleting posts with tag: ${targetTag}...`);

  const { data, error } = await supabase
    .from('posts')
    .delete()
    .contains('tags', [targetTag])
    .select('id, title');

  if (error) {
    console.error('Error deleting posts:', error.message);
  } else {
    console.log(`Successfully deleted ${data ? data.length : 0} posts from Supabase!`);
    if (data && data.length > 0) {
      console.log('Deleted post titles:', data.map(p => p.title).join(', '));
    }
  }
}

deleteBatch();
