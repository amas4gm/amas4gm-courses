import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from '../shared/vendor/three.module.js';
import {OrbitControls} from '../shared/vendor/OrbitControls.js';
import {createZoomPractice} from '../simulators/bambu-studio/navigation-state.js';
class Surface extends EventTarget{
 style={};clientWidth=800;clientHeight=600;getRootNode(){return this;}setPointerCapture(){}releasePointerCapture(){}
 getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}
 pointer(type,id,x,y){const e=new Event(type);Object.assign(e,{pointerId:id,pointerType:'touch',pageX:x,pageY:y,clientX:x,clientY:y});this.dispatchEvent(e);}
}
function setup(){const surface=new Surface(),camera=new PerspectiveCamera(20,4/3,.1,10000);camera.position.set(0,450,550);const controls=new OrbitControls(camera,surface);return {surface,camera,controls};}
test('real camera controls accept pinch in both directions and the lesson records both',()=>{
 const {surface,camera,controls}=setup();controls.enableRotate=false;controls.enablePan=false;
 const practice=createZoomPractice(camera.position.distanceTo(controls.target));let result;
 controls.addEventListener('change',()=>{result=practice.update(camera.position.distanceTo(controls.target));});
 surface.pointer('pointerdown',1,300,300);surface.pointer('pointerdown',2,500,300);
 surface.pointer('pointermove',2,560,300);assert.equal(result.zoomIn,true);assert.equal(result.complete,false);
 surface.pointer('pointermove',2,480,300);assert.equal(result.complete,true);controls.dispose();
});
test('two-finger slide pans and one-finger drag orbits with real controls',()=>{
 const {surface,camera,controls}=setup();controls.enableRotate=false;controls.enableZoom=false;const start=controls.target.clone();
 surface.pointer('pointerdown',1,300,300);surface.pointer('pointerdown',2,500,300);
 surface.pointer('pointermove',1,350,300);surface.pointer('pointermove',2,550,300);assert.ok(controls.target.distanceTo(start)>12);
 surface.pointer('pointerup',1,350,300);surface.pointer('pointerup',2,550,300);
 controls.enableRotate=true;controls.enablePan=false;const position=camera.position.clone();
 surface.pointer('pointerdown',3,250,200);surface.pointer('pointermove',3,350,200);assert.ok(camera.position.distanceTo(position)>45);controls.dispose();
});
test('small touchpad deltas accumulate and retry starts with neither direction completed',()=>{
 const practice=createZoomPractice(700);let result;
 for(let distance=699.9;distance>695;distance-=.1)result=practice.update(distance);
 assert.equal(result.zoomIn,true);assert.equal(result.zoomOut,false);
 assert.equal(createZoomPractice(700).update(700).complete,false);
});
