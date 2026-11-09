import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const base = new URL('../simulators/blender/assets/', import.meta.url);
const read = name => readFileSync(new URL(name, base));
const json = name => JSON.parse(read(name));
const names = ['cube','blank','inset','cavity','finished'];
const close = (a,b,eps=1e-5) => assert.ok(Math.abs(a-b)<eps, `${a} != ${b}`);
const bounds = vertices => [0,1,2].map(i => [Math.min(...vertices.map(v=>v[i])),Math.max(...vertices.map(v=>v[i]))]);

for (const name of names) test(`Blender ${name}: closed consistently wound manifold and valid selection`, () => {
  const mesh = json(`${name}.json`);
  assert.equal(mesh.units, 'mm');
  assert.equal(mesh.upAxis, 'Z');
  const edgeCounts = new Map(), edgeWinding = new Map();
  let volume = 0;
  for (const face of mesh.faces) {
    assert.ok(face.length>=3);
    assert.equal(new Set(face).size,face.length);
    for(let i=0;i<face.length;i++) {
      const a=face[i],b=face[(i+1)%face.length];
      assert.ok(Number.isInteger(a)&&a>=0&&a<mesh.vertices.length);
      const key=[Math.min(a,b),Math.max(a,b)].join(':');
      edgeCounts.set(key,(edgeCounts.get(key)||0)+1);
      edgeWinding.set(key,(edgeWinding.get(key)||0)+(a<b?1:-1));
    }
    const a=mesh.vertices[face[0]];
    for(let i=1;i<face.length-1;i++) {
      const b=mesh.vertices[face[i]],c=mesh.vertices[face[i+1]];
      volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    }
  }
  for(const [key,count] of edgeCounts) {
    assert.equal(count,2,`Open or overconnected edge ${key}`);
    assert.equal(edgeWinding.get(key),0,`Inconsistent normal at ${key}`);
  }
  assert.ok(volume>0);
  close(volume,mesh.checks.volumeMm3,.005);
  for(const id of mesh.selectedFaces) assert.ok(Number.isInteger(id)&&id>=0&&id<mesh.faces.length);
  const box=bounds(mesh.vertices);
  box.forEach(([min,max],i)=>close(max-min,mesh.dimensions[i]));
  if(name!=='cube') {
    assert.deepEqual(mesh.dimensions,[100,70,18]);
    close(box[2][0],0);
    close(box[2][1],18);
  }
});

test('Inset and extrusion preserve 3 mm walls and floor', () => {
  const inset=json('inset.json'), cavity=json('cavity.json');
  assert.equal(inset.selectedFaces.length,1);
  assert.equal(cavity.selectedFaces.length,1);
  const inner=inset.faces[inset.selectedFaces[0]].map(i=>inset.vertices[i]);
  const floor=cavity.faces[cavity.selectedFaces[0]].map(i=>cavity.vertices[i]);
  assert.deepEqual(bounds(inner),[[-47,47],[-32,32],[18,18]]);
  assert.deepEqual(bounds(floor),[[-47,47],[-32,32],[3,3]]);
  close(cavity.checks.volumeMm3,100*70*18-94*64*15);
  const finished=json('finished.json');
  assert.ok(finished.faces.length>cavity.faces.length,'Bevel must add geometry');
  assert.ok(finished.checks.volumeMm3<cavity.checks.volumeMm3);
});

test('STL export retains millimeter bounding box and valid binary structure', () => {
  const stl=read('desk-tray.stl');
  const count=stl.readUInt32LE(80);
  assert.ok(count>0);
  assert.equal(stl.length,84+count*50);
  const vertices=[];
  for(let i=0;i<count;i++) for(let j=0;j<3;j++) {
    const offset=84+i*50+12+j*12;
    vertices.push([0,4,8].map(k=>stl.readFloatLE(offset+k)));
  }
  assert.deepEqual(bounds(vertices),[[-50,50],[-35,35],[0,18]]);
});

test('Manifest pins actual asset bytes and includes editable recovery files', () => {
  const manifest=json('manifest.json');
  assert.equal(manifest.physicalPrintValidated,false);
  assert.deepEqual(manifest.export.roundTripDimensionsMm,[100,70,18]);
  for(const name of names) assert.ok(manifest.files[`${name}.blend`].bytes>1000);
  for(const [name,expected] of Object.entries(manifest.files)) {
    const data=read(name);
    assert.equal(data.length,expected.bytes,name);
    assert.equal(createHash('sha256').update(data).digest('hex'),expected.sha256,name);
  }
});
