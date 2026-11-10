import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import lesson from '../blender/setup-for-printing/lesson.js';
import {setupReady,setupValue} from '../simulators/blender/setup-state.js';
import {statePair} from '../simulators/blender/native-state.js';
const manifest=JSON.parse(await readFile(new URL('../simulators/blender/assets/ui/manifest.json',import.meta.url)));
test('setup begins unconfigured and teaches Scene, units, viewport clipping, then startup confirmation',()=>{
 assert.deepEqual(lesson.steps.map(s=>s.id),['scene','units','system','scale','length','sidebar','view','clip-start','clip-end','startup','confirm','complete']);
 assert.equal(manifest.states['setup-start'].settings.system,'NONE');
 assert.equal(manifest.states['setup-metric'].settings.scale,1);
 assert.equal(manifest.states['setup-view'].settings.clipEnd,1000);
 assert.deepEqual(manifest.states['setup-clip-end'].settings,{system:'METRIC',scale:.001,length:'MILLIMETERS',clipStart:.1,clipEnd:10000});
 for(const s of lesson.steps)for(const name of statePair(lesson.id,s.id)){
  assert.equal(manifest.states[name].width,2400);assert.equal(manifest.states[name].height,1483);
 }
});
test('setup values reject zero, negative, incorrect units and near misses while converting explicit lengths',()=>{
 const scale=lesson.steps.find(s=>s.id==='scale').simulation;
 for(const raw of ['0','-0.001','.002','.001 mm','NaN','1'])assert.equal(setupReady(raw,scale),false,raw);
 assert.ok(setupReady('.001',scale));
 const near=lesson.steps.find(s=>s.id==='clip-start').simulation,far=lesson.steps.find(s=>s.id==='clip-end').simulation;
 assert.ok(setupReady('0.1 mm',near));assert.ok(setupReady('10 m',far));assert.ok(setupReady('1000 cm',far));
 for(const raw of ['1000','10000 deg','10000 mm junk','Infinity','-10000'])assert.equal(setupReady(raw,far),false,raw);
 assert.ok(Number.isNaN(setupValue('3°','clipStart')));
});
test('every editable setup field starts at its preceding native value',()=>{
 for(const s of lesson.steps.filter(s=>s.simulation.setting)){
  const [before,after]=statePair(lesson.id,s.id),key=s.simulation.setting==='unitScale'?'scale':s.simulation.setting;
  assert.equal(manifest.states[before].settings[key],s.simulation.initial);
  assert.equal(manifest.states[after].settings[key],s.simulation.value);
  assert.notEqual(s.simulation.initial,s.simulation.value);
 }
});
