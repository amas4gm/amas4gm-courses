import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectEdge,rimEdgeIndices} from '../simulators/blender/selection.js';
import {meshForState} from '../simulators/blender/live-state.js';
import {STLLoader} from '../shared/vendor/STLLoader.js';
import {completedThroughStep,normalizeProgress} from '../shared/teaching/progress.js';
import lesson from '../blender/edit-mode/lesson.js';
const base=new URL('../simulators/blender/assets/',import.meta.url);
const json=async name=>JSON.parse(await readFile(new URL(name,base)));
const cavity=await json('cavity.json');
test('rim selection starts empty and plain/Shift clicks select only the intended four edges',()=>{
 const required=rimEdgeIndices(cavity);assert.equal(required.length,4);
 let selected=[];for(const i of required)selected=selectEdge(selected,i,selected.length>0);
 assert.deepEqual(selected,required);assert.deepEqual(selectEdge(selected,required[0],false),[required[0]]);
 assert.deepEqual(selectEdge(selected,required[0],true),required.slice(1));
 const mesh=meshForState({asset:'cavity',mode:'EDIT',values:{},selection:'none',selectedEdges:selected},{cavity});
 assert.equal(mesh.selectedEdges.filter(Boolean).length,4);assert.equal(mesh.selectedFaces.filter(Boolean).length,0);
 for(const i of required)assert.ok(cavity.edges[i].every(j=>cavity.vertices[j][2]===18));
 assert.equal(lesson.steps[lesson.steps.findIndex(s=>s.id==='bevel')-1].id,'rim-edges');
});
test('live bevels agree with independently generated native Blender samples at three widths',async()=>{
 const proof=await json('live/bevel-validation.json');assert.equal(proof.profile,.5);
 for(let segments=1;segments<=3;segments++){
  const data=await json(`live/bevel-${segments}.json`);assert.equal(data.profile,.5);
  for(const sample of proof.segments[segments].samples){
   const mesh=meshForState({asset:'cavity',mode:'EDIT',values:{},selection:'rim',operation:{kind:'bevel',segments,value:sample.width}},{[`bevel-${segments}`]:data});
   assert.equal(mesh.vertices.length,sample.vertices.length);
   const error=Math.max(...mesh.vertices.flatMap((v,i)=>v.map((x,j)=>Math.abs(x-sample.vertices[i][j]))));
   assert.ok(error<.0001,`${segments} segments, ${sample.width} mm: ${error}`);
  }
 }
});
test('exported STL has the same rounded surface as the final live bevel and correct import dimensions',async()=>{
 const bytes=await readFile(new URL('desk-tray.stl',base));
 const geometry=new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));geometry.computeBoundingBox();
 assert.deepEqual(geometry.boundingBox.max.toArray().map((n,i)=>n-geometry.boundingBox.min.toArray()[i]),[100,70,18]);
 const live=await json('live/bevel-3.json'),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++)assert.ok(live.vertices.some(v=>Math.hypot(v[0]-positions.getX(i),v[1]-positions.getY(i),v[2]-positions.getZ(i))<.0001));
 geometry.dispose();
});
test('handoff requires launch and import before inspection and preserves imported state on reload',()=>{
 const last=lesson.steps.slice(-4);assert.deepEqual(last.map(s=>s.id),['open-bambu','import-tray','inspect-tray','complete']);
 assert.ok(last.every(s=>s.simulation.software==='bambu-studio'));
 const index=lesson.steps.findIndex(s=>s.id==='inspect-tray'),completed=new Set(lesson.steps.slice(0,index).map(s=>s.id));
 const steps=completedThroughStep(lesson,completed,new Set(),index);
 assert.equal(Object.assign({},...steps.map(s=>s.simulation.effects)).modelVisible,true);
 const old=lesson.steps.filter(s=>!['rim-edges','open-bambu','import-tray','inspect-tray','complete'].includes(s.id)).map(s=>s.id);
 assert.equal(normalizeProgress(lesson,{current:'complete',completed:old,practiced:[]}).current,'rim-edges');
});
