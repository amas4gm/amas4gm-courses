import * as T from '../../shared/vendor/three.module.js';

const heightsByMesh=new WeakMap();
export function toolpathMesh(buffer,material,{heightSorted=false,name='Bambu Studio extrusion paths'}={}){
 if(!buffer.byteLength||buffer.byteLength%32)throw new Error('Invalid toolpath data');
 const data=new Float32Array(buffer),count=data.length/8,heights=heightSorted?new Float32Array(count):null;
 const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,count),transform=new T.Object3D();
 const axis=new T.Vector3(1,0,0),direction=new T.Vector3();
 for(let i=0;i<count;i++){
  const p=i*8,[x,y,z,xx,yy,zz,w,h]=data.subarray(p,p+8);
  if(![x,y,z,xx,yy,zz,w,h].every(Number.isFinite)||w<=0||h<=0)throw new Error('Invalid extrusion dimensions');
  direction.set(xx-x,yy-y,zz-z);const length=direction.length();
  if(length===0)throw new Error('Empty extrusion segment');
  transform.position.set((x+xx)/2,(y+yy-h)/2,(z+zz)/2);
  transform.quaternion.setFromUnitVectors(axis,direction.divideScalar(length));
  // Preserve endpoints, slope, width, and height; overlap arc chords at their joins.
  transform.scale.set(length+.015,h,w);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
  if(heights){heights[i]=Math.max(y,yy);if(i&&heights[i]<heights[i-1])throw new Error('Toolpaths must be sorted by height');}
 }
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.name=name;
 if(heights)heightsByMesh.set(mesh,heights);
 return mesh;
}

export function setToolpathHeight(mesh,height){
 const heights=heightsByMesh.get(mesh);if(!heights)return;
 let lo=0,hi=heights.length;
 while(lo<hi){const mid=(lo+hi)>>>1;if(heights[mid]<=height+.001)lo=mid+1;else hi=mid;}
 mesh.count=lo;
}

export function cloneToolpathMesh(original,material){
 const copy=original.clone();copy.geometry=original.geometry.clone();copy.material=material;
 const heights=heightsByMesh.get(original);if(heights)heightsByMesh.set(copy,heights);
 return copy;
}

export async function loadBodyPaths(material){
 const urls={
  without:new URL('./assets/benchy-body-unsupported.bin.gz',import.meta.url),
  with:new URL('./assets/benchy-body-supported.bin.gz',import.meta.url)
 };
 const loaded=[];
 try{
  // Sequential decoding avoids two simultaneous large transient allocations.
  for(const [variant,url] of Object.entries(urls)){
   const response=await fetch(url);if(!response.ok)throw new Error('Could not load the Benchy reference slice');
   const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   loaded.push([variant,toolpathMesh(buffer,material,{heightSorted:true,name:`Benchy ${variant} supports: actual walls and infill`})]);
  }
  return Object.fromEntries(loaded);
 }catch(error){for(const [,mesh] of loaded){mesh.dispose();mesh.geometry.dispose();}throw error;}
}
