import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {startModal,modalKey,modalValue,modalReady,modalCaption,precisionDelta,dragZoomDistance,visualReady} from '../simulators/blender/native-modal.js';
import {meshForState,liveState} from '../simulators/blender/live-state.js';
import objects from '../blender/object-manipulation/lesson.js';
import intro from '../blender/getting-started/lesson.js';
import edit from '../blender/edit-mode/lesson.js';
import {normalizeProgress} from '../shared/teaching/progress.js';
const root=new URL('../simulators/blender/assets/',import.meta.url),manifest=JSON.parse(await readFile(new URL('ui/manifest.json',root))),cube=JSON.parse(await readFile(new URL('cube.json',root)));
const input=(op,keys)=>keys.reduce((s,k)=>modalKey(s,k),op);
test('wrong numeric input previews, can be corrected, and only the required result completes',()=>{
 let op=input(startModal('move'),['x','2']);assert.equal(modalValue(op),2);assert.equal(modalReady(op),false);assert.match(modalCaption(op),/\[2\|\]/);
 const state=liveState('cube-sidebar',manifest);state.operation={...op,value:modalValue(op)};assert.deepEqual(meshForState(state,{cube}).vertices.map(v=>v[0]).sort(),[1,1,1,1,3,3,3,3]);
 op=input(op,['Backspace','1']);assert.equal(modalReady(op),true);assert.equal(modalValue(op),1);
});
test('numeric input overrides the mouse until erased; sign and axis can be corrected',()=>{
 let op={...startModal('rotate'),visualValue:17};assert.equal(modalValue(op),17);op=input(op,['z','4','5']);assert.equal(modalValue(op),45);op=input(op,['Backspace','Backspace']);assert.equal(modalValue(op),17);
 op=input(startModal('move'),['y','2','-']);assert.equal(modalValue(op),-2);op=modalKey(op,'x');assert.equal(op.axis,'x');op=modalKey(op,'x');assert.equal(op.axis,'');assert.equal(modalKey(op,'q'),null);
});
test('Shift uses Blender one-tenth precision for either movement direction',()=>{
 for(const delta of [-100,-2,0,2,100])assert.equal(precisionDelta(delta,true),precisionDelta(delta,false)*.1);
});
test('visual transformations act on actual mesh coordinates',()=>{
 const state=liveState('cube-sidebar',manifest);state.operation={kind:'move',value:0,vector:[2,3,4],axis:''};const moved=meshForState(state,{cube});assert.deepEqual(moved.vertices[0],cube.vertices[0].map((x,i)=>x+[2,3,4][i]));
 state.operation={kind:'scale',value:2,axis:''};assert.deepEqual(meshForState(state,{cube}).vertices[0],cube.vertices[0].map(x=>x*2));
 state.operation={kind:'rotate',value:90,axis:'x'};const v=meshForState(state,{cube}).vertices[0],src=cube.vertices[0];assert.ok(Math.abs(v[1]+src[2])<1e-6);assert.ok(Math.abs(v[2]-src[1])<1e-6);
});
test('inserted visual and shortcut lessons retain earlier progress but cannot be skipped',()=>{
 const old=objects.steps.filter(s=>!s.simulation.visual&&!s.simulation.shortcutOnly&&!s.terminal).map(s=>s.id);
 const saved=normalizeProgress(objects,{current:'complete',completed:old});assert.equal(saved.current,'visual-move');assert.ok(saved.completed.includes('move'));
 assert.equal(objects.steps.filter(s=>s.simulation.visual).length,3);
 assert.equal([intro,objects,edit].flatMap(l=>l.steps).filter(s=>s.simulation.shortcutOnly).length,5);
 for(const s of intro.steps.filter(s=>['orbit','pan','zoom'].includes(s.simulation.action)))assert.equal(s.tools,undefined);
 for(const s of objects.steps.filter(s=>s.simulation.visual))assert.ok(s.keys.includes('Shift'));
});

test('gizmo zoom uses the region center and responds continuously, not in wheel increments',()=>{
 const start=10,height=1314;
 assert.equal(dragZoomDistance(start,0,height),start);
 assert.ok(dragZoomDistance(start,-90,height)>7&&dragZoomDistance(start,-90,height)<8);
 assert.ok(dragZoomDistance(start,-1,height)<10&&dragZoomDistance(start,-1,height)>9.9);
 assert.ok(dragZoomDistance(start,90,height)>start);
});

test('visual lessons require both ordinary and Shift precision movement before confirmation',()=>{
 const op=startModal('move');assert.equal(visualReady(op),false);op.normalTravel=100;assert.equal(visualReady(op),false);op.precisionTravel=20;assert.equal(visualReady(op),true);op.normalTravel=0;assert.equal(visualReady(op),false);
});
