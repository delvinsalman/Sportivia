/**
 * Pack a self-contained Poki zip from dist/.
 * Keeps faces/demos local — Poki forbids loading external resources.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const zipPath = path.join(root, 'sportivia-poki.zip');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html missing — run the Poki build first');
  process.exit(1);
}

for (const dirent of fs.readdirSync(dist, { withFileTypes: true, recursive: true })) {
  if (dirent.name === '.DS_Store') {
    const parent = 'path' in dirent ? dirent.path : dist;
    fs.rmSync(path.join(parent, dirent.name), { force: true });
  }
}

fs.rmSync(zipPath, { force: true });
execSync('zip -qr ../sportivia-poki.zip . -x "*.DS_Store"', {
  cwd: dist,
  stdio: 'inherit',
});

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`Wrote ${zipPath} (${sizeMb} MB)`);
