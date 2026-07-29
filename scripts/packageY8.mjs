import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const zipPath = path.join(root, 'sportivia-y8.zip');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html missing — run the Y8 build first');
  process.exit(1);
}

// Large portraits and guide videos are served from sportivia.xyz in Y8 builds.
fs.rmSync(path.join(dist, 'faces'), { recursive: true, force: true });
fs.rmSync(path.join(dist, 'demos'), { recursive: true, force: true });
fs.rmSync(zipPath, { force: true });

execSync('zip -qr ../sportivia-y8.zip . -x "*.DS_Store"', {
  cwd: dist,
  stdio: 'inherit',
});

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`Wrote ${zipPath} (${sizeMb} MB)`);
