import test from 'node:test';
import assert from 'node:assert/strict';
import {meetsGoal,checkpointFor} from '../simulators/blender/state.js';
import intro from '../blender/getting-started/lesson.js';
import objects from '../blender/object-manipulation/lesson.js';
import edit from '../blender/edit-mode/lesson.js';
import {loadProgress,saveProgress,retryStepProgress} from '../shared/teaching/progress.js';
test('numeric checkpoints accept explicit converted lengths and reject malformed or wrong-unit values',()=>{
 assert.ok(meetsGoal('10 cm',100));assert.ok(meetsGoal('-15 mm',-15));assert.ok(meetsGoal('45 deg',45,'angle'));
 for(const raw of ['','3mm junk','Infinity','NaN','3deg','3°'])assert.equal(meetsGoal(raw,3),false);
 assert.equal(meetsGoal('45 mm',45,'angle'),false);assert.equal(meetsGoal('4 mm',3),false);
});
test('all 39 guided steps have valid checkpoints, stable unique IDs and a terminal inspection state',()=>{
 assert.equal([intro,objects,edit].reduce((n,l)=>n+l.steps.filter(s=>!s.terminal).length,0),39);
 for(const lesson of [intro,objects,edit]){assert.equal(new Set(lesson.steps.map(s=>s.id)).size,lesson.steps.length);assert.ok(lesson.steps.at(-1).terminal);for(const s of lesson.steps){assert.ok(['cube','blank','inset','cavity','finished'].includes(s.simulation.asset));assert.ok(s.text&&s.task&&s.done);}}
});
test('retry restores the geometry preceding a topology operation',()=>{
 for(const id of ['inset','extrude','bevel']){const s=edit.steps.find(s=>s.id===id);assert.equal(checkpointFor(s,false),s.simulation.asset);assert.equal(checkpointFor(s,true),s.simulation.after);assert.notEqual(s.simulation.asset,s.simulation.after);}
});
test('extrusion quiz persists separately from its completed mesh action',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const prior=edit.steps.slice(0,edit.steps.findIndex(s=>s.id==='extrude')).map(s=>s.id);saveProgress(edit,{current:'extrude',completed:prior,practiced:['extrude']},storage);
 const saved=loadProgress(edit,storage);assert.ok(saved.practiced.includes('extrude'));assert.ok(!saved.completed.includes('extrude'));
 const retry=retryStepProgress(edit,saved,'extrude');assert.ok(!retry.practiced.includes('extrude'));assert.deepEqual(retry.completed,prior);
});
