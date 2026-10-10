import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function makeTransparent(inputPath, outputPathWebp, outputPathPng) {
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  const raw = await image.ensureAlpha().raw().toBuffer();
  
  // Convert background near-white pixels to transparent alpha
  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];
    
    // Check if background pixel (light/white)
    if (r > 240 && g > 240 && b > 240) {
      const minVal = Math.min(r, g, b);
      if (minVal >= 250) {
        raw[i + 3] = 0; // Pure transparent
      } else {
        // Feather
        const alpha = Math.round(((250 - minVal) / 10) * 255);
        raw[i + 3] = Math.min(255, Math.max(0, alpha));
      }
    }
  }
  
  await sharp(raw, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95 })
    .toFile(outputPathWebp);

  await sharp(raw, { raw: { width, height, channels: 4 } })
    .png({ quality: 95 })
    .toFile(outputPathPng);

  console.log(`Saved: ${outputPathWebp} and ${outputPathPng}`);
}

async function run() {
  const outDir = path.resolve('public/mascots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const dirInput = 'C:/Users/Windows/.gemini/antigravity/brain/871a4f79-ec5b-476e-bfea-5c122cb12411/boxy_mascot_sheet_1791562348378.jpg';
  const reactInput = 'C:/Users/Windows/.gemini/antigravity/brain/871a4f79-ec5b-476e-bfea-5c122cb12411/boxy_reactions_sheet_1791562372536.jpg';

  await makeTransparent(
    dirInput,
    path.join(outDir, 'box-directions.webp'),
    path.join(outDir, 'box-directions.png')
  );

  await makeTransparent(
    reactInput,
    path.join(outDir, 'box-reactions.webp'),
    path.join(outDir, 'box-reactions.png')
  );

  console.log('All box mascot sprite sheets processed successfully!');
}

run();
