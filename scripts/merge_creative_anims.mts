/**
 * Merge proper Idle_* clips from Blender ACTIVE exports onto the Fab mesh GLB.
 */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { readFileSync, writeFileSync } from 'fs';
import type { AnimationClip, Object3D } from 'three';

(globalThis as unknown as { self: typeof globalThis }).self = globalThis;

const loader = new GLTFLoader();
const load = (path: string) =>
  new Promise<{ scene: Object3D; animations: AnimationClip[] }>((resolve, reject) => {
    const buf = readFileSync(path);
    loader.parse(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      '',
      gltf => resolve(gltf as never),
      reject,
    );
  });

function variance(clip: AnimationClip) {
  let maxDelta = 0;
  let varying = 0;
  for (const t of clip.tracks) {
    if (!t.name.endsWith('.quaternion') && !t.name.endsWith('.position')) continue;
    const stride = t.name.endsWith('.quaternion') ? 4 : 3;
    const n = t.times.length;
    const first = t.values.slice(0, stride);
    let localMax = 0;
    for (let i = 1; i < n; i++) {
      for (let c = 0; c < stride; c++) {
        localMax = Math.max(localMax, Math.abs(t.values[i * stride + c] - first[c]));
      }
    }
    if (localMax > 1e-5) varying++;
    maxDelta = Math.max(maxDelta, localMax);
  }
  return { varying, maxDelta };
}

async function main() {
  const meshGltf = await load('./public/models/creative.glb');

  const sources: [string, string][] = [
    ['/tmp/creative_blend_export/Idle_Breathing.glb', 'Idle_Breathing'],
    ['/tmp/creative_blend_export/Idle_Look_Around.glb', 'Idle_Look_Around'],
    ['/tmp/creative_blend_export/Idle_Relaxed.glb', 'Idle_Relaxed'],
  ];

  const animations: AnimationClip[] = [];
  for (const [path, name] of sources) {
    const g = await load(path);
    const clip = g.animations[0]?.clone();
    if (!clip) throw new Error(`No clip in ${path}`);
    clip.name = name;
    const v = variance(clip);
    console.log(name, 'varying', v.varying, 'maxDelta', v.maxDelta.toFixed(5), 'dur', clip.duration.toFixed(2));
    if (v.varying < 5) throw new Error(`${name} still looks static`);
    animations.push(clip);
  }

  const exporter = new GLTFExporter();
  const ab = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      meshGltf.scene,
      result => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error('expected binary'));
      },
      reject,
      {
        binary: true,
        animations,
        onlyVisible: false,
      },
    );
  });

  writeFileSync('./public/models/creative.glb', Buffer.from(ab));
  // Also write anims-only companion (same clips) for dual-load path
  writeFileSync('./public/models/creative-anims.glb', Buffer.from(ab));
  console.log('WROTE creative.glb', ab.byteLength);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
