import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Read .env file
const envPath = path.join(ROOT_DIR, '.env');
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

async function main() {
  console.log(`\n==================================================`);
  console.log(`🧹 Wiping gamesatlas entries from Supabase 'posts' table...`);
  console.log(`==================================================\n`);

  const { data, error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('atlas_id', 'gamesatlas');

  if (error) {
    console.error('❌ Wipe failed:', error.message);
  } else {
    console.log(`✅ Successfully wiped gamesatlas! (${count ?? 0} records removed)`);
  }
}

main().catch(console.error);
