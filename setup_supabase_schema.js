import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf-8');
  envText.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCleanInsert() {
  console.log('Testing insert without onConflict constraint requirement...');
  const testRecord = {
    id: 'test_game_456',
    atlas_id: 'gamesatlas',
    name: 'Cyberpunk Test',
    website: 'https://giguvusbbgonlvsqtrei.supabase.co/storage/v1/object/public/atlas-media/gamesatlas/cyberpunk.jpg',
    secondary_url: 'https://store.steampowered.com/app/1091500',
    tags: ['source:https://store.steampowered.com/app/1091500', 'copyright:steam', 'work:cyberpunk'],
    visual_color: '#7c3aed',
    created_at: new Date().toISOString()
  };

  // Try insert directly
  let { data, error } = await supabase.from('posts').insert([testRecord]).select();

  if (error) {
    console.warn('Direct insert error:', error.message);
    console.log('Trying delete then insert...');
    await supabase.from('posts').delete().eq('id', 'test_game_456');
    const retry = await supabase.from('posts').insert([testRecord]).select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Final error:', error);
  } else {
    console.log('🎉 Clean insert success! Inserted:', data);
    await supabase.from('posts').delete().eq('id', 'test_game_456');
  }
}

testCleanInsert();
