import * as THREE from '../../shared/vendor/three.module.js';

// Bambu's bottom-left navigator uses the camera's view rotation, never model rotation.
// This SVG projection uses the same camera quaternion as the Three.js viewport.
export const viewDirections={Top:[0,1,0],Bottom:[0,-1,0],Front:[0,0,1],Back:[0,0,-1],Left:[-1,0,0],Right:[1,0,0]};
export function createViewCube({element,camera,controls,canInteract,onSelect,onRetry,onChange}){
 const ns='http://www.w3.org/2000/svg',make=tag=>document.createElementNS(ns,tag);
 const svg=make('svg');svg.setAttribute('viewBox','0 0 128 128');svg.setAttribute('aria-label','View cube');svg.setAttribute('role','group');element.append(svg);
 const faceLayer=make('g'),edgeLayer=make('g'),axisLayer=make('g');svg.append(axisLayer,faceLayer,edgeLayer);
 const faces=Object.entries(viewDirections).map(([name,normal])=>{
   const n=new THREE.Vector3(...normal),u=Math.abs(n.y)===1?new THREE.Vector3(1,0,0):new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n);
   const v=new THREE.Vector3().crossVectors(n,u),center=n.clone();
   const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>center.clone().addScaledVector(u,x).addScaledVector(v,y));
   const group=make('g'),polygon=make('polygon'),label=make('text');group.id=`cube-${name.toLowerCase()}`;group.setAttribute('role','button');group.setAttribute('aria-label',`${name} view`);group.classList.add('cube-face');
   label.textContent=name;label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','central');group.append(polygon,label);faceLayer.append(group);
   group.addEventListener('click',()=>{if(dragged)return;if(canInteract(name))snap(normal,name);else onRetry();});
   group.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();if(canInteract(name))snap(normal,name);else onRetry();}});
   return {name,n,u,v,corners,group,polygon,label};
 });
 // Edge and corner picks give diagonal viewpoints in free practice.
 const corners=[];for(const x of [-1,0,1])for(const y of [-1,0,1])for(const z of [-1,0,1]){
   if([x,y,z].filter(Boolean).length<2)continue;
   const point=new THREE.Vector3(x,y,z),hit=make('circle');hit.setAttribute('r','4');hit.classList.add('cube-corner');
   hit.addEventListener('click',()=>{if(!dragged&&canInteract('diagonal'))snap(point.toArray(),'diagonal');else if(!dragged)onRetry();});edgeLayer.append(hit);corners.push({point,hit});
 }
 const axes=[['X',[1,0,0],'#ad6464'],['Y',[0,0,-1],'#5d9677'],['Z',[0,1,0],'#6b7eaa']].map(([name,direction,color])=>{
   const line=make('line'),label=make('text');line.setAttribute('stroke',color);label.setAttribute('fill',color);label.textContent=name;axisLayer.append(line,label);return {direction:new THREE.Vector3(...direction),line,label};
 });
 let drag=null,dragged=false,animation=0;
 const project=point=>{const p=point.clone().applyQuaternion(camera.quaternion.clone().invert());return {x:64+p.x*24,y:62-p.y*24,z:p.z};};
 function update(){
   const inv=camera.quaternion.clone().invert();
   for(const face of faces){
     const facing=face.n.clone().applyQuaternion(inv).z>.001;face.group.style.display=facing?'':'none';face.group.setAttribute('tabindex',facing&&canInteract(face.name)?'0':'-1');face.group.setAttribute('aria-disabled',String(!canInteract(face.name)));
     if(!facing)continue;face.polygon.setAttribute('points',face.corners.map(v=>{const p=project(v);return `${p.x},${p.y}`;}).join(' '));
     // Text lives in the face plane, so it tilts and rotates with the cube too.
     const c=project(face.n),u=project(face.n.clone().add(face.u)),v=project(face.n.clone().add(face.v));
     face.label.setAttribute('transform',`matrix(${(u.x-c.x)/24} ${(u.y-c.y)/24} ${(c.x-v.x)/24} ${(c.y-v.y)/24} ${c.x} ${c.y})`);
   }
   for(const {point,hit} of corners){const p=project(point);const visible=faces.some(f=>f.n.dot(point)===1&&f.n.clone().applyQuaternion(inv).z>.001);hit.style.display=visible?'':'none';hit.setAttribute('cx',p.x);hit.setAttribute('cy',p.y);hit.style.pointerEvents=canInteract('diagonal')?'auto':'none';}
   for(const {direction,line,label} of axes){const p=direction.clone().applyQuaternion(inv);line.setAttribute('x1','64');line.setAttribute('y1','62');line.setAttribute('x2',64+p.x*54);line.setAttribute('y2',62-p.y*54);label.setAttribute('x',61+p.x*61);label.setAttribute('y',66-p.y*61);}
 }
 function snap(direction,name){
   cancelAnimationFrame(animation);const target=controls.target.clone(),distance=camera.position.distanceTo(target);
   const destination=target.clone().add(new THREE.Vector3(...direction).normalize().multiplyScalar(distance));
   // A tiny offset avoids the lookAt singularity at the poles while retaining a true top/bottom view.
   if(direction[0]===0&&direction[2]===0)destination.z+=distance*1e-6;
   const dummy=camera.clone();dummy.position.copy(destination);dummy.lookAt(target);
   const from=camera.quaternion.clone(),to=dummy.quaternion.clone(),start=performance.now();
   const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:220;
   function tick(now){const t=duration?Math.min(1,(now-start)/duration):1,q=from.clone().slerp(to,t*t*(3-2*t));camera.quaternion.copy(q);camera.position.copy(target).add(new THREE.Vector3(0,0,distance).applyQuaternion(q));controls.update();onChange();if(t<1)animation=requestAnimationFrame(tick);else{animation=0;onSelect(name);}}
   animation=requestAnimationFrame(tick);
 }
 svg.addEventListener('pointerdown',e=>{dragged=false;if(!canInteract('drag'))return;cancelAnimationFrame(animation);drag={x:e.clientX,y:e.clientY,theta:controls.getAzimuthalAngle(),phi:controls.getPolarAngle()};});
 svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!dragged&&Math.hypot(dx,dy)<4)return;dragged=true;svg.setPointerCapture(e.pointerId);const sphere=new THREE.Spherical(camera.position.distanceTo(controls.target),THREE.MathUtils.clamp(drag.phi-dy*.015,.000001,Math.PI-.000001),drag.theta-dx*.015);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere));controls.update();onChange();});
 svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
 return {update,snap,cancel(){cancelAnimationFrame(animation);drag=null;},dispose(){cancelAnimationFrame(animation);element.replaceChildren();}};
}
