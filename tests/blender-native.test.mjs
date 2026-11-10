import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {statePair,fieldRects,boundedFrame} from '../simulators/blender/native-state.js';
import intro from '../blender/getting-started/lesson.js';
import objects from '../blender/object-manipulation/lesson.js';
import edit from '../blender/edit-mode/lesson.js';
import {startModal,modalKey,modalReady,modalFrame} from '../simulators/blender/native-modal.js';
const base=new URL('../simulators/blender/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('assets/ui/manifest.json',base)));
const provenance=JSON.parse(await readFile(new URL('source-reference.json',base)));
test('source references and native font retain their upstream bytes',async()=>{
 for(const item of [...provenance.sourceFiles,provenance.font])assert.equal(createHash('sha256').update(await readFile(new URL(item.file,base))).digest('hex'),item.sha256,item.file);
});
test('every lesson checkpoint resolves to a complete native capture',()=>{
 for(const l of [intro,objects,edit])for(const s of l.steps.filter(s=>s.simulation.software!=='bambu-studio'))for(const name of statePair(l.id,s.id)){
  const frame=manifest.states[name];assert.ok(frame,`${l.id}/${s.id}: ${name}`);
  assert.equal(frame.width,s.id==='headers'?1000:2400);assert.equal(frame.height,s.id==='headers'?1000:1494);
 }
});
test('published native captures retain their recorded bytes',async()=>{
 for(const r of [...Object.values(manifest.states),...Object.values(manifest.menus)])assert.equal(createHash('sha256').update(await readFile(new URL(`assets/ui/${r.file}`,base))).digest('hex'),r.sha256,r.file);
 assert.equal(manifest.build,'d13f752e3b9c');
});
test('dimension screenshots record Blender’s evaluated object size and applied scale',()=>{
 for(const [name,dimensions] of [['width',[100,2,2]],['depth',[100,70,2]],['height',[100,70,18]],['applied',[100,70,18]]])assert.deepEqual(manifest.states[name].measuredObject.dimensions,dimensions);
 assert.deepEqual(manifest.states.applied.measuredObject.scale,[1,1,1]);
});
test('native SVG files are unmodified upstream assets pinned to the installed build',async()=>{
 assert.equal(provenance.commit.slice(0,12),manifest.build);assert.ok(provenance.icons.length>100);
 for(const r of provenance.icons)assert.equal(createHash('sha256').update(await readFile(new URL(r.file,base))).digest('hex'),r.sha256,r.file);
});
test('native menu hierarchy preserves Blender mesh, mode, apply, and export controls',async()=>{
 const {menus}=JSON.parse(await readFile(new URL('native-assets/menu-reference.json',base)));
 assert.equal(menus['VIEW3D_MT_add'][0].menu,'VIEW3D_MT_mesh_add');
 assert.deepEqual(menus['VIEW3D_MT_mesh_add'].slice(0,4).map(r=>r.label),['Plane','Cube','Circle','UV Sphere']);
 assert.equal(menus['VIEW3D_MT_object_apply'][2].label,'Scale');
 assert.equal(menus['object.mode_set'].length,6);
 assert.ok(menus['TOPBAR_MT_file_export'].some(r=>r.operator==='wm.stl_export'));
});
test('navigation clamps to authored frames and narrow-header captures actually change',()=>{
 assert.equal(boundedFrame('orbit',100),'orbit-48');assert.equal(boundedFrame('pan',-2),'pan-00');
 assert.notEqual(manifest.states['header-narrow-00'].sha256,manifest.states['header-narrow-16'].sha256);
 for(const r of Object.values(fieldRects)){assert.ok(r[0]>=1549&&r[0]+r[2]<=1969);assert.ok(r[1]>115);}
});
test('every admitted modal input has a native frame and waits for confirmation',()=>{
 for(const [kind,keys] of [['move',['x','1']],['rotate',['z','4','5']],['inset',['3']],['extrude',['-','1','5']],['bevel',['0','.','6']]]){
  let op=startModal(kind);assert.equal(modalReady(op),false);assert.ok(manifest.states[modalFrame(op)],modalFrame(op));
  for(const key of keys){op=modalKey(op,key);assert.ok(op);assert.ok(manifest.states[modalFrame(op)],modalFrame(op));}
  if(kind==='bevel'){assert.equal(modalReady(op),false);op.segments=3;}
  assert.ok(modalReady(op));assert.ok(modalKey(op,'9'));assert.equal(modalReady(modalKey(op,'9')),false);
  assert.equal(modalReady(modalKey(op,'Backspace')),false);
 }
});
