import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three-stdlib';
import { AnimationMixer } from 'three';
import { readFileSync } from 'fs';
(globalThis as any).self = globalThis;
const loader = new GLTFLoader();
const buf = readFileSync('./public/models/creative.glb');
const g: any = await new Promise((res, rej) =>
  loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej),
);
const clone = SkeletonUtils.clone(g.scene);
const mixer = new AnimationMixer(clone);
const clip = g.animations.find((a: any) => a.name === 'Idle_Breathing');
mixer.clipAction(clip).play();
let arm: any;
clone.traverse((o: any) => { if (o.name === 'LeftArm') arm = o; });
const samples = [];
for (const t of [0, 0.4, 0.8, 1.2, 1.6, 2.0]) {
  // reset mixer time
  mixer.setTime(t);
  samples.push(arm.quaternion.toArray().map((n: number) => +n.toFixed(3)));
}
const unique = new Set(samples.map(s => s.join(',')));
console.log('samples', samples);
console.log('unique poses', unique.size);
console.log('HAS_MOTION', unique.size > 1);
