// Drops the legacy .woff copies of each font from the single-file build
// (every current browser uses the .woff2 copy), roughly halving its size.
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'dist-single/index.html';
const s = readFileSync(p, 'utf8');
writeFileSync(p, s.replace(/,\s*url\(data:font\/woff;base64,[A-Za-z0-9+/=]+\)\s*format\("woff"\)/g, ''));
