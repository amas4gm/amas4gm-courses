import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractSupportPaths} from '../scripts/support-toolpaths.mjs';
import {supportPathMesh} from '../simulators/bambu-studio/support-paths.js';
import * as T from '../shared/vendor/three.module.js';

test('only deposited support and interface moves are extracted, with widths and coordinates',()=>{
 const {segments,counts}=extractSupportPaths(`M83
G1 X128 Y128 Z.2
; FEATURE: Support
; LINE_WIDTH: 0.5
; LAYER_HEIGHT: 0.2
G1 X130 E.2
G1 X140
G1 E-.4
; WIPE_START
G1 X141 E.1
; WIPE_END
; FEATURE: Outer wall
G1 X142 E.1
; FEATURE: Support interface
G1 Y130 E.1`);
 assert.deepEqual(counts,{Support:1,'Support interface':1});
 assert.equal(segments[0],0);assert.equal(segments[3],2);assert.equal(segments[6],.5);
 assert.equal(segments[8],14);assert.equal(segments[13],-2);
 assert.ok(Math.abs(segments[1]-.2)<1e-6);
});

test('absolute extrusion, retractions, G92 and relative XYZ do not create travel supports',()=>{
 const {segments}=extractSupportPaths(`M82
G92 E0
G1 X128 Y128 Z1
; FEATURE: Support
G1 X129 E1
G1 X130 E.5
G92 E0
G91
G1 X1 E.2
G1 E.3`);
 assert.equal(segments.length/8,2);assert.equal(segments[8],2);assert.equal(segments[11],3);
});

test('clockwise and counterclockwise support arcs retain their curves and exact endpoints',()=>{
 for(const direction of ['G2','G3']){
  const {segments}=extractSupportPaths(`M83\nG1 X129 Y128 Z1\n; FEATURE: Support\n${direction} X128 Y129 I-1 J0 E1`);
  assert.ok(segments.length>8);
  for(let i=0;i<segments.length;i+=8)assert.ok(Math.abs(Math.hypot(segments[i],segments[i+2])-1)<1e-5);
  assert.equal(segments.at(-5),0);assert.equal(segments.at(-3),-1);
  assert.ok(direction==='G2'?segments[10]>0:segments[10]<0);
 }
});

test('reference paths build clipped, cloneable geometry in the cabin and below the roof',async()=>{
 const bytes=await readFile(new URL('../simulators/bambu-studio/assets/benchy-support-paths.bin',import.meta.url));
 const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),data=new Float32Array(buffer);
 const material=new T.MeshStandardMaterial(),mesh=supportPathMesh(buffer,material);
 assert.equal(mesh.count,75107);assert.ok(mesh.boundingSphere.radius<50);
 let interiorHigh=0;for(let i=0;i<data.length;i+=8)if(data[i+1]>25&&data[i+1]<40&&Math.abs(data[i])<10&&Math.abs(data[i+2])<10)interiorHigh++;
 assert.ok(interiorHigh>100,'supports must reach the interior below the cabin roof');
 const copy=mesh.clone();assert.equal(copy.count,mesh.count);assert.deepEqual(copy.instanceMatrix.array,mesh.instanceMatrix.array);
 mesh.geometry.dispose();material.dispose();
});
