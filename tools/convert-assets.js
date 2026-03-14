#!/usr/bin/env node
// Converts sector JSON files and .vlw bitmap font files into JS data files
// so the game can load via <script> tags without needing fetch()/XHR.
//
// Run: node tools/convert-assets.js
// Output: data/sectors/*.js, data/fonts/*.js

const fs = require('fs');
const path = require('path');

const portDir = path.resolve(__dirname, '..');

// --- Convert sector JSON to JS ---

const sectorDir = path.join(portDir, 'data', 'sectors');
const sectors = [
  'timber_hearth', 'sandy_twin', 'rocky_twin', 'brittle_hollow',
  'giants_deep', 'dark_bramble', 'comet', 'quantum_moon', 'eye_of_the_universe'
];

for (const name of sectors) {
  const jsonPath = path.join(sectorDir, name + '.json');
  const jsPath = path.join(sectorDir, name + '.js');
  const json = fs.readFileSync(jsonPath, 'utf-8');
  // Validate it parses
  JSON.parse(json);
  fs.writeFileSync(jsPath, `sectorJSONData['${name}'] = ${json.trimEnd()};\n`);
  console.log(`Converted ${name}.json -> ${name}.js`);
}

// --- Convert .vlw font files to JS ---

const fontDir = path.join(portDir, 'data', 'fonts');
const fonts = [
  { file: 'Consolas-14.vlw', size: 14 },
  { file: 'Consolas-18.vlw', size: 18 }
];

function readInt32(buf, offset) {
  return (buf[offset] << 24) | (buf[offset + 1] << 16) |
         (buf[offset + 2] << 8) | buf[offset + 3];
}

for (const { file, size } of fonts) {
  const vlwPath = path.join(fontDir, file);
  const data = new Uint8Array(fs.readFileSync(vlwPath));

  const glyphCount = readInt32(data, 0);
  const fontSize = readInt32(data, 8);
  const ascent = readInt32(data, 16);
  const descent = readInt32(data, 20);

  const glyphs = [];
  const pixelStart = 24 + glyphCount * 28;
  let pixelOffset = pixelStart;

  for (let i = 0; i < glyphCount; i++) {
    const off = 24 + i * 28;
    const g = {
      value: readInt32(data, off),
      height: readInt32(data, off + 4),
      width: readInt32(data, off + 8),
      setWidth: readInt32(data, off + 12),
      topExtent: readInt32(data, off + 16),
      leftExtent: readInt32(data, off + 20)
    };

    const pixelCount = g.height * g.width;
    // Store alpha values as an array
    const alphas = [];
    for (let p = 0; p < pixelCount; p++) {
      alphas.push(data[pixelOffset + p]);
    }
    g.alphas = alphas;
    glyphs.push(g);
    pixelOffset += pixelCount;
  }

  const fontData = { fontSize, ascent, descent, glyphs };
  const jsPath = path.join(fontDir, file.replace('.vlw', '.js'));
  fs.writeFileSync(jsPath,
    `fontData[${size}] = ${JSON.stringify(fontData)};\n`
  );
  console.log(`Converted ${file} -> ${file.replace('.vlw', '.js')} (${glyphs.length} glyphs)`);
}

console.log('Done.');
