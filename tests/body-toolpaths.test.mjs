import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import * as T from '../shared/vendor/three.module.js';
import {extractToolpaths,bodyFeatures} from '../scripts/support-toolpaths.mjs';
import {toolpathMesh,setToolpathHeight,cloneToolpathMesh} from '../simulators/bambu-studio/toolpath-mesh.js';

test('body extraction includes walls, infill, surfaces and bridges but excludes support and startup moves',()=>{
 const code=['M83','G1 X128 Y128 Z.2'];
 for(const role of [...bodyFeatures,'Support','Support interface','Custom'])code.push(`; FEATURE: ${role}`,'G91','G1 X1 E.2');
 const {segments,counts}=extractToolpaths(code.join('\n'));
 assert.equal(segments.length/8,bodyFeatures.length);for(const role of bodyFeatures)assert.equal(counts[role],1);
});

test('sloped deposited paths preserve endpoint height and slider selection remains independent after cloning',()=>{
 const data=new Float32Array([0,.2,0,1,.2,0,.42,.2,0,.2,0,1,.28,0,.42,.08]);
 const material=new T.MeshStandardMaterial(),mesh=toolpathMesh(data.buffer,material,{heightSorted:true});
 setToolpathHeight(mesh,.2);assert.equal(mesh.count,1);
 const clone=cloneToolpathMesh(mesh,material);setToolpathHeight(clone,.28);assert.equal(clone.count,2);assert.equal(mesh.count,1);
 const matrix=new T.Matrix4();clone.getMatrixAt(1,matrix);
 const start=new T.Vector3(-.5,0,0).applyMatrix4(matrix),end=new T.Vector3(.5,0,0).applyMatrix4(matrix);
 assert.ok(Math.abs((end.y-start.y)-.08)<.002);
 clone.dispose();clone.geometry.dispose();mesh.dispose();mesh.geometry.dispose();material.dispose();
});

for(const variant of ['supported','unsupported'])test(`${variant} reference contains real infill and all 599 layer heights`,async()=>{
 const url=new URL(`../simulators/bambu-studio/assets/benchy-body-${variant}.bin.gz`,import.meta.url);
 const decoded=gunzipSync(await readFile(url)),buffer=decoded.buffer.slice(decoded.byteOffset,decoded.byteOffset+decoded.byteLength);
 const data=new Float32Array(buffer),manifest=JSON.parse(await readFile(new URL(`../simulators/bambu-studio/assets/benchy-body-${variant}.json`,import.meta.url),'utf8'));
 assert.equal(data.length/8,manifest.segments);assert.ok(manifest.counts['Sparse infill']>70000);
 assert.ok(manifest.counts['Outer wall']>80000);assert.ok(manifest.counts['Top surface']>1000);
 for(let i=0;i<data.length;i+=8){assert.ok(Math.abs(data[i])<31&&Math.abs(data[i+2])<17);assert.ok(data[i+1]>=0&&data[i+1]<=48.041);}
 const material=new T.MeshStandardMaterial(),mesh=toolpathMesh(buffer,material,{heightSorted:true});
 let previous=0;
 for(let layer=1;layer<=599;layer++){
  setToolpathHeight(mesh,.2+(layer-1)*.08);assert.ok(mesh.count>previous,`layer ${layer} contains new deposition`);previous=mesh.count;
 }
 assert.equal(mesh.count,manifest.segments);setToolpathHeight(mesh,.19);assert.equal(mesh.count,0);
 setToolpathHeight(mesh,24.04);assert.ok(mesh.count>0&&mesh.count<manifest.segments);
 mesh.dispose();mesh.geometry.dispose();material.dispose();
});
