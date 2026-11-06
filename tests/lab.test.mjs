import test from 'node:test';
import assert from 'node:assert/strict';
import {createLabState,applyLabAction} from '../simulators/bambu-lab/state.js';
import lesson from '../bambu-studio/material-installation/lesson.js';
import {normalizeProgress,progressKey} from '../shared/teaching/progress.js';
import first from '../bambu-studio/getting-started/lesson.js';
for(const device of ['Steve','Candus'])test(`${device}: every physical action is gated and checkpoints survive resume`,()=>{
 let state=createLabState();assert.equal(applyLabAction(state,'filament').accepted,false);
 let result=applyLabAction(state,device);assert.ok(result.complete);assert.equal(result.state.device,device);
 state=createLabState('unlock',false,device);result=applyLabAction(state,'right-tab');assert.ok(result.accepted);assert.equal(result.complete,false);assert.equal(result.state.lid,false);assert.equal(applyLabAction(result.state,'right-tab').accepted,false);
 result=applyLabAction(result.state,'left-tab');assert.ok(result.complete);assert.equal(result.state.lid,true);
 state=createLabState('place',false,device);assert.equal(state.lid,true);assert.equal(applyLabAction(state,'intake').accepted,false);assert.equal(applyLabAction(state,'roll').state.roll,true);
 state=createLabState('press',false,device);assert.equal(state.roll,true);assert.equal(applyLabAction(state,'filament').accepted,false);assert.equal(applyLabAction(state,'intake').state.pressed,true);
 state=createLabState('insert',false,device);assert.equal(state.pressed,true);result=applyLabAction(state,'filament');assert.equal(result.state.fed,true);assert.equal(result.state.pressed,false);assert.ok(result.complete);
 assert.equal(createLabState('complete',false,device).device,device);assert.equal(createLabState('complete',false,device).fed,true);
});
test('physical lesson is independent and cannot skip installation steps',()=>{
 assert.notEqual(progressKey(lesson),progressKey(first));assert.equal(lesson.steps.filter(s=>!s.terminal).length,5);
 const resumed=normalizeProgress(lesson,{current:'complete',completed:['choose-device','unlock-ams']});assert.equal(resumed.current,'place-roll');
 assert.deepEqual(createLabState('choose').tabs,[false,false]);assert.equal(createLabState('choose').fed,false);
});
