/**
 * Prune itch.io zip under the 1000-file limit, then pack dist/.
 * Keeps gameplay assets; drops demos / duplicate textures only.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const zipPath = path.join(root, 'sportivia-itch.zip');

function rm(p) {
  const full = path.join(dist, p);
  fs.rmSync(full, { recursive: true, force: true });
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run build:itch first');
  process.exit(1);
}

// Safe prunes for itch file-count / size headroom
rm('demos');
rm('basketball.png'); // SportBall uses basketball-ball.png
rm('icons/earth.jpg'); // AnimatedGlobeIcon uses earth-globe.webp
rm('icons/flags/canada.svg'); // ca.png is the flag used
rm('icons.svg');

for (const dirent of fs.readdirSync(dist, { withFileTypes: true, recursive: true })) {
  if (dirent.name === '.DS_Store') {
    const parent = 'path' in dirent ? dirent.path : dist;
    fs.rmSync(path.join(parent, dirent.name), { force: true });
  }
}

const files = execSync('find . -type f | wc -l', { cwd: dist, encoding: 'utf8' }).trim();
const entries = execSync('find . | wc -l', { cwd: dist, encoding: 'utf8' }).trim();
console.log(`dist files=${files} entries=${entries}`);

if (Number(files) > 1000) {
  console.error(`Still ${files} files — itch.io limit is 1000. Prune more assets.`);
  process.exit(1);
}

fs.rmSync(zipPath, { force: true });
execSync('zip -qr ../sportivia-itch.zip . -x "*.DS_Store"', { cwd: dist, stdio: 'inherit' });
const listed = execSync(`unzip -l "${zipPath}" | tail -1`, { encoding: 'utf8' });
const size = execSync(`ls -lh "${zipPath}" | awk '{print $5}'`, { encoding: 'utf8' }).trim();
console.log(listed.trim());
console.log(`Wrote ${zipPath} (${size})`);
