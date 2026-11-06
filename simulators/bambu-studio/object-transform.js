import * as THREE from '../../shared/vendor/three.module.js';

// Bambu's X/Y/Z (Z up) mapped into the renderer's Y-up coordinates.
export const axes={X:new THREE.Vector3(1,0,0),Y:new THREE.Vector3(0,0,-1),Z:new THREE.Vector3(0,1,0)};
const basis=new THREE.Quaternion().setFromAxisAngle(axes.X,-Math.PI/2);
export function rotationQuaternion(degrees){
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...degrees.map(THREE.MathUtils.degToRad),'ZYX'));
 return basis.clone().multiply(q).multiply(basis.clone().invert());
}
export function rotationDegrees(quaternion){
 const q=basis.clone().invert().multiply(quaternion).multiply(basis),e=new THREE.Euler().setFromQuaternion(q,'ZYX');
 return [e.x,e.y,e.z].map(THREE.MathUtils.radToDeg);
}
export function groundObject(mesh){mesh.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(mesh,true);mesh.position.y-=box.min.y;mesh.updateMatrixWorld(true);}
const boundsCache=new WeakMap();
export function objectBounds(mesh){
 mesh.updateMatrixWorld(true);const matrix=mesh.matrixWorld.elements,cached=boundsCache.get(mesh);
 if(cached&&cached.geometry===mesh.geometry&&matrix.every((value,i)=>value===cached.matrix[i]))return cached.box.clone();
 const box=new THREE.Box3().setFromObject(mesh,true);boundsCache.set(mesh,{matrix:[...matrix],geometry:mesh.geometry,box});return box.clone();
}
export function applyObjectState(mesh,state={}){
 mesh.scale.fromArray([state.scale?.[0]??1,state.scale?.[2]??1,state.scale?.[1]??1]);
 mesh.quaternion.copy(rotationQuaternion(state.rotation||[0,0,0]));
 mesh.position.set((state.position?.[0]??128)-128,0,128-(state.position?.[1]??128));groundObject(mesh);
}
export function layOnFace(mesh,localNormal){
 mesh.updateMatrixWorld(true);
 const normal=localNormal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize();
 mesh.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(normal,new THREE.Vector3(0,-1,0)));
 groundObject(mesh);
}
export function scaleObject(mesh,axis,factor,uniform){
 const component={X:'x',Y:'z',Z:'y'}[axis],old=mesh.scale[component];
 if(!Number.isFinite(factor)||factor<.1||factor>3)return false;
 if(uniform)mesh.scale.multiplyScalar(factor/old);else mesh.scale[component]=factor;
 groundObject(mesh);return true;
}
