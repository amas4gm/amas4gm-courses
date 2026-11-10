import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {liveState,meshForState,viewportRect} from '../simulators/blender/live-state.js';
import {frames} from '../simulators/blender/native-state.js';
const root=new URL('../simulators/blender/assets/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('ui/manifest.json',root)));
const assets=Object.fromEntries(await Promise.all(['cube','blank','inset','cavity','finished','bevel-1','bevel-2','bevel-3'].map(async n=>[n,JSON.parse(await readFile(new URL((n.startsWith('bevel-')?'live/':'')+n+'.json',root)))])));
test('every lesson checkpoint resolves to finite live geometry with the native viewport bounds',()=>{
 for(const lesson of Object.values(frames))for(const pair of Object.values(lesson))for(const name of pair){const state=liveState(name,manifest),mesh=meshForState(state,assets),rect=viewportRect(state,manifest);assert.ok(rect.height>0&&rect.right>rect.left,name);if(mesh)assert.ok(mesh.vertices.flat().every(Number.isFinite),name);}
});
test('live modal previews deform actual mesh coordinates, including cancelled extrusion topology',()=>{
 const inset=meshForState(liveState('inset-modal-ready',manifest),assets);assert.deepEqual(inset.vertices[1],[-47,-32,18]);
 const preview=meshForState(liveState('extrude-modal-minus1',manifest),assets);assert.equal(preview.vertices[12][2],17);
 const complete=meshForState(liveState('extrude-modal-ready',manifest),assets);assert.equal(complete.vertices[12][2],3);
 const cancel=meshForState(liveState('extrude-cancelled',manifest),assets);assert.equal(cancel.vertices.length,16);assert.equal(cancel.vertices[12][2],18);
 const undo=meshForState(liveState('inset',manifest),assets);assert.equal(undo.vertices.length,12);
});
test('native bevel segment variants change topology without changing the printable envelope',()=>{
 let previous=0;for(let n=1;n<=3;n++){const mesh=meshForState(liveState(`bevel-modal-${n}`,manifest),assets);assert.ok(mesh.vertices.length>previous);previous=mesh.vertices.length;assert.deepEqual([0,1,2].map(i=>Math.round(Math.max(...mesh.vertices.map(v=>v[i]))-Math.min(...mesh.vertices.map(v=>v[i])))),[100,70,18]);}
 const preview=meshForState(liveState('bevel-modal-3',manifest),assets),confirmed=meshForState(liveState('bevel-confirmed',manifest),assets);assert.deepEqual(confirmed.vertices,preview.vertices);assert.ok(confirmed.selectedFaces.some(Boolean));
});
test('object transforms and Edit Mode selection are derived from geometry rather than fixed hit rectangles',()=>{
 const moved=meshForState(liveState('move-confirmed',manifest),assets);assert.equal(Math.min(...moved.vertices.map(v=>v[0])),0);
 const blank=meshForState(liveState('edit-top',manifest),assets);assert.equal(blank.selectedFaces.filter(Boolean).length,1);assert.ok(blank.faces[blank.selectedFaces.indexOf(true)].every(i=>blank.vertices[i][2]===18));
 const width=meshForState(liveState('width',manifest),assets);assert.equal(Math.max(...width.vertices.map(v=>v[0])),50);
});
test('file dialogs have no live viewport and sidebar pixels remain outside the transparent opening',()=>{
 assert.equal(liveState('dialog-save',manifest),null);assert.equal(viewportRect(liveState('cube-sidebar',manifest),manifest).right,1549);assert.equal(viewportRect(liveState('cube',manifest),manifest).right,1969);
});
