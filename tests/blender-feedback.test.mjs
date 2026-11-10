import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectVertex} from '../simulators/blender/selection.js';
import {liveState,meshForState} from '../simulators/blender/live-state.js';
import {mouseDemoPlan} from '../simulators/blender/mouse-demo.js';
import {normalizeProgress} from '../shared/teaching/progress.js';
import intro from '../blender/getting-started/lesson.js';
import objects from '../blender/object-manipulation/lesson.js';
import edit from '../blender/edit-mode/lesson.js';
const base=new URL('../simulators/blender/assets/',import.meta.url);
test('plain click replaces the selection; Shift-click toggles without selecting unrelated geometry',async()=>{
 const blank=JSON.parse(await readFile(new URL('blank.json',base))),manifest=JSON.parse(await readFile(new URL('ui/manifest.json',base)));
 const state=liveState('edit-all',manifest);let ids=selectVertex([0,1,2,3,4,5,6,7],0);
 assert.deepEqual(ids,[0]);state.selectedVertices=ids;let mesh=meshForState(state,{blank});
 assert.equal(mesh.selectedVertices.filter(Boolean).length,1);assert.equal(mesh.selectedEdges.filter(Boolean).length,0);assert.equal(mesh.selectedFaces.filter(Boolean).length,0);
 const edge=blank.edges.find(e=>e.includes(0)),other=edge.find(i=>i!==0);ids=selectVertex(ids,other,true);state.selectedVertices=ids;mesh=meshForState(state,{blank});
 assert.equal(mesh.selectedVertices.filter(Boolean).length,2);assert.equal(mesh.selectedEdges.filter(Boolean).length,1);assert.equal(mesh.selectedFaces.filter(Boolean).length,0);
 assert.deepEqual(selectVertex(ids,other,true),[0]);assert.deepEqual(selectVertex(ids,3),[3]);
});
test('Shift-click hint holds Shift before mouse press and through release',()=>{
 const p=mouseDemoPlan({action:'select-vertices',gesture:'shift-click',target:{x:600,y:400,width:80,height:48},viewport:{left:88,right:1900,visibleY:115,y:78,height:1240}});
 const press=p.frames.findIndex(f=>f.button==='left');assert.equal(p.frames[press-1].key,'Shift');assert.equal(p.frames[press].key,'Shift');assert.equal(p.frames[press+1].key,'Shift');assert.equal(p.frames.at(-1).key,'');
});
test('retired numpad/save drills do not trap returning learners and useful drills enforce distinct routes',()=>{
 const ids=intro.steps.filter(s=>!s.terminal).map(s=>s.id);
 const saved=normalizeProgress(intro,{current:'frame-shortcut',completed:[...ids,'frame-shortcut','save-shortcut']});
 assert.equal(saved.current,'complete');assert.ok(!saved.completed.includes('frame-shortcut'));
 assert.equal(intro.steps.find(s=>s.id==='orbit').quiz,undefined);
 assert.ok(!intro.steps.some(s=>s.simulation.shortcutOnly&&s.keys.some(k=>k.includes('Numpad'))));
 for(const [lesson,id] of [[objects,'apply'],[edit,'mode']]){assert.equal(lesson.steps.find(s=>s.id===id).simulation.menuOnly,true);assert.equal(lesson.steps.find(s=>s.id===id+'-shortcut').simulation.shortcutOnly,true);}
});
