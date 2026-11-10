import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {inputDemoPlan,createInputDemo,sampleKeyDemo,keyDuration} from '../simulators/blender/input-demo.js';
import intro from '../blender/getting-started/lesson.js';
import objects from '../blender/object-manipulation/lesson.js';
import edit from '../blender/edit-mode/lesson.js';
const viewport={left:88,right:1900,visibleY:115,y:78,height:1240},target={x:600,y:400,width:50,height:30};
const plan=(lesson,id,extra={})=>inputDemoPlan({step:lesson.steps.find(s=>s.id===id),viewport,target,gesture:'focus',...extra});
const keys=p=>p.parts.filter(x=>x.type==='keys').flatMap(x=>x.keys);

test('Sidebar teaches menu first; shortcut demo includes focus click then N',()=>{
 const first=intro.steps.find(s=>s.id==='sidebar');assert.equal(first.simulation.menuOnly,true);assert.deepEqual(first.keys,[]);
 assert.deepEqual(keys(plan(intro,'sidebar',{gesture:'click'})),[]);
 const p=plan(intro,'sidebar-shortcut');assert.deepEqual(p.parts.map(x=>x.type),['mouse','keys']);assert.deepEqual(keys(p),['N']);
});
test('every numeric field follows double click with all digits and Enter',()=>{
 for(const s of objects.steps.filter(s=>s.simulation.action==='field')){
  const p=plan(objects,s.id,{gesture:'double-click'});assert.equal(p.parts[0].plan.frames.filter(f=>f.button==='left').length,2);assert.deepEqual(keys(p),[...String(s.simulation.value),'Enter']);
  const editing=plan(objects,s.id,{keyboardInput:true});assert.ok(editing.parts.every(x=>x.type==='keys'));assert.equal(keys(editing)[0],'Ctrl+A');
 }
});
test('visual transforms order focus, invocation key, and free movement with Shift',()=>{
 for(const s of objects.steps.filter(s=>s.simulation.visual)){
  const p=plan(objects,s.id);assert.deepEqual(p.parts.map(x=>x.type),['mouse','keys','mouse']);assert.deepEqual(keys(p),[s.keys[0]]);
  assert.ok(p.parts[2].plan.frames.some(f=>f.key==='Shift'&&!f.button));
 }
});
test('bevel orders numeric entry before wheel detents and final confirmation',()=>{
 const p=plan(edit,'bevel');assert.deepEqual(p.parts.map(x=>x.type),['mouse','keys','mouse','keys']);assert.deepEqual(p.parts[1].keys,['Ctrl+B','0','.','6']);assert.equal(p.parts[2].plan.frames.filter(f=>f.wheel).length,2);assert.deepEqual(p.parts[3].keys,['Enter']);
 const correction=plan(edit,'bevel',{operator:{kind:'bevel',raw:'8',segments:2}});assert.deepEqual(correction.parts[0].keys,['Backspace','0','.','6']);assert.equal(correction.parts[1].plan.frames.filter(f=>f.wheel).length,1);
});
test('open shortcut menus do not replay the shortcut; rename includes text and confirmation',()=>{
 assert.deepEqual(keys(plan(objects,'apply-shortcut',{gesture:'click'})),[]);
 assert.deepEqual(keys(plan(intro,'rename')),['F2','Shift+D','e','s','k','Space','Shift+T','r','a','y','Enter']);
 assert.deepEqual(keys(plan(edit,'cancel-extrude')),['E','Escape','Ctrl+Z']);
});
test('each key appears, presses, releases, and fades before the next key',()=>{
 const k=['Ctrl+Shift+S','Enter'];assert.equal(sampleKeyDemo(k,0).opacity,0);assert.equal(sampleKeyDemo(k,200).pressed,false);assert.equal(sampleKeyDemo(k,400).pressed,true);assert.equal(sampleKeyDemo(k,700).pressed,false);assert.ok(sampleKeyDemo(k,900).opacity<1);assert.equal(sampleKeyDemo(k,keyDuration).key,'Enter');assert.equal(sampleKeyDemo(k,2*keyDuration).done,true);
});
test('mouse fades out before keyboard; stop prevents queued keys and stale callbacks',()=>{
 const win=new Window();globalThis.document=win.document;const stage=document.createElement('div');Object.defineProperties(stage,{clientWidth:{value:2400},clientHeight:{value:1494}});document.body.append(stage);
 let pending,now=0;const demo=createInputDemo({stage,requestFrame:fn=>{pending=fn;return 1;},cancelFrame:()=>{pending=null;},reducedMotion:()=>false});
 const advance=ms=>{for(let t=0;t<ms;t+=50){const cb=pending;pending=null;cb?.(now);now+=50;}};
 demo.play(plan(intro,'sidebar-shortcut'));advance(2250);assert.ok(Number(stage.querySelector('.bl-mouse-demo').style.opacity)<1);assert.equal(stage.querySelector('.bl-key-demo'),null);
 advance(600);assert.equal(stage.querySelector('.bl-mouse-demo'),null);assert.equal(stage.querySelector('.bl-key-demo').dataset.key,'N');assert.equal(stage.querySelector('.bl-key-demo').dataset.pressed,'true');
 const stale=pending;demo.stop();stale(now);assert.equal(stage.children.length,0);assert.equal(demo.isPlaying(),false);
 demo.play(plan(intro,'sidebar-shortcut'));advance(500);demo.stop();advance(5000);assert.equal(stage.children.length,0);
 const reduced=createInputDemo({stage,reducedMotion:()=>true,requestFrame:()=>{throw Error('No reduced-motion animation');},cancelFrame:()=>{}});reduced.play(plan(intro,'sidebar-shortcut'));assert.equal(stage.querySelectorAll('li').length,2);assert.equal(stage.querySelector('kbd').textContent,'N');reduced.dispose();win.happyDOM.abort();
});
