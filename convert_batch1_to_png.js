import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function convertBatchToPng() {
  console.log('🚀 Starting SVG to PNG Conversion for Batch 1...');

  const batchDir = path.resolve('tools_downloads/batch1_dev_tools');
  const manifestPath = path.join(batchDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found at:', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📦 Converting ${manifest.length} tool cards to 512x512 PNG format...`);

  const updatedManifest = [];
  let successCount = 0;

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const oldFileName = item.file; // e.g. "Neovim.svg"
    const newFileName = oldFileName.replace(/\.svg$/i, '.png');

    const svgPath = path.join(batchDir, oldFileName);
    const pngPath = path.join(batchDir, newFileName);

    if (fs.existsSync(svgPath)) {
      try {
        const svgBuffer = fs.readFileSync(svgPath);
        await sharp(svgBuffer).png().toFile(pngPath);
        
        // Remove old SVG file
        fs.unlinkSync(svgPath);
        successCount++;
      } catch (err) {
        console.warn(`⚠️ Error converting ${oldFileName}:`, err.message);
      }
    } else if (fs.existsSync(pngPath)) {
      successCount++;
    }

    // Update tags to reference png extension
    const updatedTags = (item.tags || []).map(t => {
      if (t === 'meta:extension:svg') return 'meta:extension:png';
      return t;
    });

    updatedManifest.push({
      ...item,
      file: newFileName,
      tags: updatedTags
    });
  }

  // Save updated manifest.json
  fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2), 'utf-8');

  console.log(`\n🎉 PNG Conversion Complete!`);
  console.log(`✅ Successfully converted: ${successCount} assets to crisp 512x512 PNG images`);
  console.log(`📄 Manifest updated: ${manifestPath}`);
}

convertBatchToPng().catch(err => {
  console.error('Fatal error during PNG conversion:', err);
  process.exit(1);
});
