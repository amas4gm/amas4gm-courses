import * as T from '../../shared/vendor/three.module.js';

export function supportPathMesh(buffer,material){
 if(!buffer.byteLength||buffer.byteLength%32)throw new Error('Invalid support path data');
 const data=new Float32Array(buffer),count=data.length/8;
 const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,count),transform=new T.Object3D();
 for(let i=0;i<count;i++){
  const p=i*8,[x,y,z,xx,yy,zz,w,h]=data.subarray(p,p+8),dx=xx-x,dz=zz-z;
  transform.position.set((x+xx)/2,(y+yy-h)/2,(z+zz)/2);
  transform.rotation.set(0,-Math.atan2(dz,dx),0);
  // Small overlap seals joins between arc chords without moving their centers.
  transform.scale.set(Math.hypot(dx,dz)+.015,h,w);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
 }
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 mesh.name='Support paths extracted from Bambu Studio';
 return mesh;
}

export async function loadSupportPaths(material){
 const response=await fetch(new URL('./assets/benchy-support-paths.bin',import.meta.url));
 if(!response.ok)throw new Error('Could not load the reference support paths');
 return supportPathMesh(await response.arrayBuffer(),material);
}
