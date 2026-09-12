import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://giguvusbbgonlvsqtrei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-eLh4iHUShl5pYEyXOLEvg_YBvfrLST';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function wipeToolsAtlas() {
  console.log('🧹 Wiping "toolsatlas" posts from Supabase Cloud Database...');
  
  const { data, error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('atlas_id', 'toolsatlas');

  if (error) {
    console.error('❌ Delete error:', error.message);
  } else {
    console.log(`✅ Successfully deleted records from Supabase posts table for atlas_id = 'toolsatlas'.`);
  }
}

wipeToolsAtlas();
