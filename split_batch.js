import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), 'wiki_downloads', 'batch_wonders');
const MANIFEST_PATH = path.join(SOURCE_DIR, 'manifest.json');
const CHUNK_SIZE = 225;

async function splitBatch() {
  console.log('📦 Starting Batch Splitting Utility...');
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest file not found:', MANIFEST_PATH);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log(`📄 Loaded main manifest with ${manifest.length} entries.`);

  const manifestMap = new Map();
  manifest.forEach(item => {
    manifestMap.set(item.file, item);
  });

  // Get all image files in source directory
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f !== 'manifest.json' && !fs.statSync(path.join(SOURCE_DIR, f)).isDirectory());
  console.log(`📸 Found ${files.length} image files in source directory.`);

  // Divide into chunks
  const numChunks = Math.ceil(files.length / CHUNK_SIZE);
  console.log(`🗂️ Splitting into ${numChunks} subfolder parts (up to ${CHUNK_SIZE} items per part)...\n`);

  for (let c = 0; c < numChunks; c++) {
    const partNum = c + 1;
    const partDirName = `batch_wonders_part${partNum}`;
    const partDirPath = path.join(process.cwd(), 'wiki_downloads', partDirName);

    if (!fs.existsSync(partDirPath)) {
      fs.mkdirSync(partDirPath, { recursive: true });
    }

    const chunkFiles = files.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
    const chunkManifest = [];

    chunkFiles.forEach(file => {
      const srcFile = path.join(SOURCE_DIR, file);
      const destFile = path.join(partDirPath, file);

      // Copy file to part subfolder
      fs.copyFileSync(srcFile, destFile);

      // Find matching manifest entry
      if (manifestMap.has(file)) {
        chunkManifest.push(manifestMap.get(file));
      } else {
        // Fallback manifest entry if missing
        chunkManifest.push({
          file: file,
          title: file.replace(/_[Q0-9]+\.[a-z]+$/i, '').replace(/_/g, ' '),
          tags: ['r/wikiatlas', 'meta:atlas:wikiatlas', 'meta:format:image']
        });
      }
    });

    // Write part manifest.json
    const partManifestPath = path.join(partDirPath, 'manifest.json');
    fs.writeFileSync(partManifestPath, JSON.stringify(chunkManifest, null, 2), 'utf-8');

    console.log(`  ✅ Created [${partDirName}]: ${chunkFiles.length} images + manifest.json`);
  }

  console.log('\n==================================================');
  console.log(`🎉 Batch Splitting Complete!`);
  console.log(`📁 Destination Base: ./wiki_downloads/`);
  console.log(`📊 Created ${numChunks} self-contained part folders ready for in-app upload.`);
  console.log('==================================================\n');
}

splitBatch().catch(err => {
  console.error('Error during batch splitting:', err);
});
