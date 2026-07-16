import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three-stdlib';
import { AnimationMixer, type Object3D } from 'three';
import { readFileSync } from 'fs';

(globalThis as unknown as { self: typeof globalThis }).self = globalThis;

const loader = new GLTFLoader();
function load(path: string) {
  const buf = readFileSync(path);
  return new Promise((resolve, reject) => {
    loader.parse(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      '',
      resolve,
      reject,
    );
  });
}

async function main() {
  const mesh = (await load('./public/models/creative.glb')) as {
    scene: Object3D;
    animations: { name: string; duration: number; tracks: { name: string }[] }[];
  };
  const anims = (await load('./public/models/creative-anims.glb')) as {
    animations: { name: string; duration: number; tracks: { name: string }[] }[];
  };
  console.log(
    'anims file',
    anims.animations.map(a => `${a.name}:${a.duration}:tracks ${a.tracks.length}`),
  );
  console.log(
    'sample tracks',
    anims.animations[0].tracks.slice(0, 8).map(t => t.name),
  );

  const clone = SkeletonUtils.clone(mesh.scene);
  const mixer = new AnimationMixer(clone);
  const clip = anims.animations.find(a => a.name === 'Idle_Breathing')!;
  const action = mixer.clipAction(clip as never);
  action.play();

  let arm: Object3D | undefined;
  let hips: Object3D | undefined;
  clone.traverse(o => {
    if (o.name === 'LeftArm') arm = o;
    if (o.name === 'Hips') hips = o;
  });
  if (!arm || !hips) throw new Error('bones missing');
  const arm0 = arm.quaternion.toArray();
  mixer.update(0);
  console.log('t0 arm q', arm.quaternion.toArray().map(n => n.toFixed(3)));
  mixer.update(1);
  console.log('t1 arm q', arm.quaternion.toArray().map(n => n.toFixed(3)));
  mixer.update(2);
  console.log('t3 arm q', arm.quaternion.toArray().map(n => n.toFixed(3)));
  console.log('hips pos t3', hips.position.toArray().map(n => n.toFixed(3)));
  console.log(
    'changed?',
    arm.quaternion.toArray().some((n, i) => Math.abs(n - arm0[i]) > 1e-4),
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
