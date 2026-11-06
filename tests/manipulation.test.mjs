import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../shared/vendor/three.module.js';
import {axes,applyObjectState,objectBounds,rotationDegrees,rotationQuaternion,scaleObject,layOnFace} from '../simulators/bambu-studio/object-transform.js';
import lesson from '../bambu-studio/object-manipulation/lesson.js';
import {progressKey,normalizeProgress} from '../shared/teaching/progress.js';
import intro from '../bambu-studio/getting-started/lesson.js';
import {snapRotation,rotationBasis} from '../simulators/bambu-studio/rotation-gizmo.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-4,`${a} ≠ ${b}`);
const model=()=>new THREE.Mesh(new THREE.BoxGeometry(60,31,48),new THREE.MeshBasicMaterial());
test('rotation snaps only in Bambu’s radial bands',()=>{
 const rad=THREE.MathUtils.degToRad,deg=THREE.MathUtils.radToDeg;
 close(deg(snapRotation(rad(43),1.05).angle),45);assert.equal(snapRotation(rad(43),1.05).mode,'fine');
 close(deg(snapRotation(rad(43),.5).angle),45);assert.equal(snapRotation(rad(43),.5).mode,'coarse');
 for(const r of [.2,.8,1.15]){close(deg(snapRotation(rad(43),r).angle),43);assert.equal(snapRotation(rad(43),r).mode,'free');}
 close(deg(snapRotation(rad(-88),1.05).angle),270);close(deg(snapRotation(rad(359),1.05).angle),0);
 for(const name of ['X','Y','Z']){const {u,v}=rotationBasis(name);close(u.dot(v),0);close(u.clone().cross(v).dot(axes[name]),1);}
});
test('snap practice requires both drag zones and migrates earlier numeric-only completion',()=>{
 const fine=lesson.steps.find(s=>s.id==='rotate-z'),coarse=lesson.steps.find(s=>s.id==='rotate-coarse');
 assert.equal(fine.simulation.goal.requiresSnap,'fine');assert.equal(coarse.simulation.goal.requiresSnap,'coarse');assert.deepEqual(fine.simulation.editable,[]);assert.deepEqual(coarse.simulation.editable,[]);
 const state=normalizeProgress(lesson,lesson.progressMigrations[0].migrate({current:'complete',completed:lesson.steps.filter(s=>!s.terminal).map(s=>s.id)}));assert.equal(state.current,'rotate-z');assert.ok(!state.completed.includes('rotate-z'));
});
test('Bambu coordinates translate without changing dimensions or bed contact',()=>{const mesh=model();applyObjectState(mesh,{position:[148,108]});const b=objectBounds(mesh),c=b.getCenter(new THREE.Vector3());close(c.x,20);close(c.z,20);close(b.min.y,0);close(b.max.x-b.min.x,60);});
test('uniform and independent scaling change the intended dimensions',()=>{const mesh=model();applyObjectState(mesh);scaleObject(mesh,'X',1.5,true);assert.deepEqual(mesh.scale.toArray(),[1.5,1.5,1.5]);scaleObject(mesh,'Y',1.2,false);assert.deepEqual(mesh.scale.toArray(),[1.5,1.5,1.2]);close(objectBounds(mesh).min.y,0);const before=mesh.scale.clone();assert.equal(scaleObject(mesh,'X',NaN,true),false);assert.ok(before.equals(mesh.scale));});
test('world Z rotates on the bed; relative rotation composes with existing rotation',()=>{const mesh=model();applyObjectState(mesh,{rotation:[0,0,45]});close(objectBounds(mesh).max.y,31);mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axes.X,Math.PI/6));const values=rotationDegrees(mesh.quaternion),expected=[22.207654,-20.704811,40.893395];values.forEach((v,i)=>close(v,expected[i]));assert.ok(mesh.quaternion.angleTo(rotationQuaternion(values))<1e-7);});
test('lay on face aligns the actual transformed normal with the bed and preserves scale/XY',()=>{const mesh=model();applyObjectState(mesh,{position:[148,108],scale:[1,1.2,1],rotation:[22,-20,41]});const scale=mesh.scale.clone(),x=mesh.position.x,z=mesh.position.z;layOnFace(mesh,new THREE.Vector3(0,0,1));const n=new THREE.Vector3(0,0,1).applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize();close(n.dot(new THREE.Vector3(0,-1,0)),1);close(objectBounds(mesh).min.y,0);assert.ok(mesh.scale.equals(scale));close(mesh.position.x,x);close(mesh.position.z,z);});
test('object tutorial has its own progress and popup checks gate continued work',()=>{assert.notEqual(progressKey(lesson),progressKey(intro));assert.equal(lesson.steps.filter(s=>!s.terminal).length,17);for(const quizStep of lesson.steps.filter(s=>s.quiz)){const index=lesson.steps.indexOf(quizStep),completed=lesson.steps.slice(0,index).map(s=>s.id);const progress=normalizeProgress(lesson,{current:'complete',completed,practiced:[quizStep.id]});assert.equal(progress.current,quizStep.id);assert.ok(!progress.completed.includes(quizStep.id));}assert.equal(lesson.model.url,intro.model.url);});

test('non-uniform practice stretches X to 150% then restores X alone',()=>{const stretch=lesson.steps.find(s=>s.id==='stretch-model').simulation,restore=lesson.steps.find(s=>s.id==='restore-proportions').simulation;assert.equal(stretch.uniformBefore,false);assert.deepEqual(stretch.goal,{property:'scale',axis:'X',value:150});assert.deepEqual(stretch.completedState.scale,[1.5,1,1]);assert.deepEqual(restore.objectState.scale,stretch.completedState.scale);assert.deepEqual(restore.goal,{property:'scale',axis:'X',value:100});});
