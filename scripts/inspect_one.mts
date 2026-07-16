import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';
(globalThis as any).self = globalThis;
const loader = new GLTFLoader();
const file = process.argv[2];
const buf = readFileSync(file);
const g: any = await new Promise((resolve, reject) =>
  loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', resolve, reject),
);
for (const clip of g.animations) {
  let maxDelta = 0, varying = 0;
  for (const t of clip.tracks) {
    if (!t.name.endsWith('.quaternion') && !t.name.endsWith('.position')) continue;
    const stride = t.name.endsWith('.quaternion') ? 4 : 3;
    const n = t.times.length;
    const first = t.values.slice(0, stride);
    let localMax = 0;
    for (let i = 1; i < n; i++) for (let c = 0; c < stride; c++)
      localMax = Math.max(localMax, Math.abs(t.values[i * stride + c] - first[c]));
    if (localMax > 1e-5) varying++;
    maxDelta = Math.max(maxDelta, localMax);
  }
  console.log(file.split('/').pop(), clip.name, 'keys', clip.tracks[0]?.times.length, 'varying', varying, 'maxDelta', maxDelta.toFixed(5));
}
