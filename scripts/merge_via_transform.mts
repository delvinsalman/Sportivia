import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

const target = await io.read('./public/models/creative.glb');
for (const a of [...target.getRoot().listAnimations()]) a.dispose();

/** Source path → clip name on creative.glb */
const sources: [string, string][] = [
  ['/tmp/creative_blend_export/Idle_Breathing.glb', 'Idle_Breathing'],
  ['/tmp/creative_blend_export/Idle_Look_Around.glb', 'Idle_Look_Around'],
  ['/tmp/creative_blend_export/Idle_Relaxed.glb', 'Idle_Relaxed'],
  // Sport flourishes (manual-sampled glTF — Blender exporter drops leg motion)
  ['/tmp/creative_blend_export/Soccer_Kick.gltf', 'Soccer_Kick'],
  ['/tmp/creative_blend_export/Basketball_Shoot.gltf', 'Basketball_Shoot'],
  ['/tmp/creative_blend_export/Basketball_Block.gltf', 'Basketball_Block'],
  ['/tmp/creative_blend_export/Basketball_Jump.gltf', 'Basketball_Jump'],
];

function findNode(name: string) {
  return target.getRoot().listNodes().find(n => n.getName() === name);
}

for (const [path, name] of sources) {
  const src = await io.read(path);
  const srcAnim = src.getRoot().listAnimations()[0];
  if (!srcAnim) throw new Error(`no anim in ${path}`);

  const dstAnim = target.createAnimation(name);

  for (const channel of srcAnim.listChannels()) {
    const sampler = channel.getSampler();
    const targetNode = channel.getTargetNode();
    const pathName = channel.getTargetPath();
    if (!sampler || !targetNode || !pathName) continue;

    const boneName = targetNode.getName();
    const dstNode = findNode(boneName);
    if (!dstNode) {
      console.warn('skip missing bone', boneName);
      continue;
    }

    const input = sampler.getInput();
    const output = sampler.getOutput();
    if (!input || !output) continue;
    const inputArr = input.getArray();
    const outputArr = output.getArray();
    if (!inputArr || !outputArr) continue;

    const dstInput = target
      .createAccessor(`${name}-${boneName}-t`)
      .setType(input.getType())
      .setArray(inputArr.slice() as Float32Array);
    const dstOutput = target
      .createAccessor(`${name}-${boneName}-v`)
      .setType(output.getType())
      .setArray(outputArr.slice() as Float32Array);

    const dstSampler = target
      .createAnimationSampler(`${name}-${boneName}-${pathName}`)
      .setInput(dstInput)
      .setOutput(dstOutput)
      .setInterpolation(sampler.getInterpolation());

    const dstChannel = target
      .createAnimationChannel(`${name}-${boneName}-${pathName}`)
      .setSampler(dstSampler)
      .setTargetNode(dstNode)
      .setTargetPath(pathName);

    dstAnim.addSampler(dstSampler);
    dstAnim.addChannel(dstChannel);
  }
  console.log('copied', name, 'channels', dstAnim.listChannels().length);
}

await io.write('./public/models/creative.glb', target);
await io.write('./public/models/creative-anims.glb', target);
console.log('wrote creative.glb + creative-anims.glb');
