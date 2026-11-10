import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {mouseDemoPlan,sampleMouseDemo,createMouseDemo} from '../simulators/blender/mouse-demo.js';
const viewport={left:88,right:1900,visibleY:78,y:78,height:1240};
const target={x:2040,y:162,width:340,height:27};
const plan=options=>mouseDemoPlan({viewport,target,...options});
test('a click arrives at the real target before LMB lights and releases without drifting',()=>{
 const p=plan({action:'outliner'}),point=[2210,175.5];
 assert.notDeepEqual(sampleMouseDemo(p,0).point,point);assert.equal(sampleMouseDemo(p,400).button,'');
 for(const t of [700,950,1150,1300,1350,2050])assert.deepEqual(sampleMouseDemo(p,t).point,point);
 assert.equal(sampleMouseDemo(p,1150).button,'left');assert.equal(sampleMouseDemo(p,1350).button,'');
});
test('numeric fields demonstrate two stationary clicks, and keyboard entry never clicks the numeric readout',()=>{
 const p=plan({action:'field',gesture:'double-click'});assert.equal(p.frames.filter(f=>f.button==='left').length,2);
 const clicks=p.frames.filter(f=>f.button);assert.deepEqual(clicks[0].point,clicks[1].point);assert.ok(clicks[1].ms-clicks[0].ms<=400);
 assert.equal(plan({action:'field',keyboardInput:true}),null);
 assert.equal(plan({action:'move',operator:{kind:'move',raw:'1'}}),null);
});
test('native navigation drags hold LMB along the entire path and release at the endpoint',()=>{
 for(const action of ['pan','orbit']){const p=plan({action,target:{x:1850,y:253,width:45,height:44}});
  assert.deepEqual(sampleMouseDemo(p,1200).point,[1872.5,275]);assert.equal(sampleMouseDemo(p,1800).button,'left');assert.equal(sampleMouseDemo(p,2600).button,'left');assert.equal(sampleMouseDemo(p,2850).button,'');
  assert.notDeepEqual(sampleMouseDemo(p,1200).point,sampleMouseDemo(p,2550).point);
 }
});
test('zoom demonstrates two vertical drags and returns to the magnifier with LMB released',()=>{
 const p=plan({action:'zoom',target:{x:1850,y:208,width:45,height:44}});
 assert.equal(sampleMouseDemo(p,1800).point[0],1872.5);assert.ok(sampleMouseDemo(p,2550).point[1]<230);
 assert.equal(sampleMouseDemo(p,3700).button,'');assert.deepEqual(sampleMouseDemo(p,4300).point,[1872.5,230]);
 assert.equal(sampleMouseDemo(p,5000).button,'left');assert.ok(sampleMouseDemo(p,5650).point[1]>230);
});
test('header scrolling lights MMB, submenu hover lights no buttons, and visual transforms move freely until confirmation',()=>{
 const header=plan({action:'header-scroll',target:{x:3,y:39,width:950,height:38}});assert.equal(sampleMouseDemo(header,1800).button,'middle');assert.equal(sampleMouseDemo(header,1800).point[1],58);
 assert.ok(plan({action:'add-cube',gesture:'hover'}).frames.every(f=>!f.button));
 const visual=plan({action:'rotate',operator:{kind:'rotate',raw:'',visual:true}});
 assert.ok(visual.frames.filter(f=>f.ms<3800).every(f=>!f.button));assert.equal(sampleMouseDemo(visual,2400).key,'Shift');assert.equal(sampleMouseDemo(visual,3800).button,'left');
});
test('bevel hint shows only the remaining wheel detents; undo stays keyboard-only',()=>{
 const bevel=plan({action:'bevel',operator:{kind:'bevel',raw:'0.6',segments:1}});assert.equal(bevel.frames.filter(f=>f.wheel===1).length,2);assert.ok(bevel.frames.every(f=>!f.button));
 assert.equal(plan({action:'extrude-cancel',undo:true}),null);
});
test('demonstration cancels cleanly and reduced motion shows the drag path without animation',()=>{
 const win=new Window();globalThis.document=win.document;let callback,stopped=0;
 const stage=document.createElement('div');Object.defineProperties(stage,{clientWidth:{value:2400},clientHeight:{value:1600}});document.body.append(stage);
 const demo=createMouseDemo({stage,requestFrame:fn=>{callback=fn;return 1;},cancelFrame:()=>stopped++,reducedMotion:()=>false});
 demo.play(plan({action:'outliner'}));for(let t=0;t<=1200;t+=40)callback(t);assert.equal(stage.querySelector('.bl-mouse-demo').dataset.button,'left');
 demo.stop();assert.equal(stage.children.length,0);assert.ok(stopped);callback(1400);assert.equal(stage.children.length,0);
 const still=createMouseDemo({stage,requestFrame:()=>{throw Error('Reduced motion must not animate');},cancelFrame:()=>{},reducedMotion:()=>true});still.play(plan({action:'pan'}));assert.equal(stage.querySelector('.bl-mouse-demo').dataset.button,'left');assert.ok(stage.querySelector('.bl-mouse-path'));still.dispose();assert.equal(stage.children.length,0);win.happyDOM.abort();
});
