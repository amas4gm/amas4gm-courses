import * as THREE from '../../shared/vendor/three.module.js';
import {axes} from './object-transform.js';

// Bambu GLGizmoRotate: 72 outer ticks (5°), 8 inner spokes (45°).
// Snapping is selected by radial distance in the axis plane, not by a modifier key.
export function snapRotation(angle,radiusRatio){
 const tau=Math.PI*2;let radians=((angle%tau)+tau)%tau;
 const mode=radiusRatio>=1/3&&radiusRatio<=2/3?'coarse':radiusRatio>=1&&radiusRatio<=1.1?'fine':'free';
 const increment=mode==='coarse'?Math.PI/4:mode==='fine'?Math.PI/36:0;
 if(increment)radians=Math.round(radians/increment)*increment;
 return {angle:radians%tau,mode};
}
export function rotationBasis(axis){
 const u=axis==='X'?axes.Y.clone().negate():axis==='Y'?axes.Z.clone():axes.X.clone();
 return {u,v:new THREE.Vector3().crossVectors(axes[axis],u)};
}
export function drawRotationGizmo({node,handle,project,center,radius,hover,drag,colors}){
 const active=drag?.axis||hover;
 for(const axis of ['X','Y','Z']){
  if(active&&active!==axis)continue;
  const {u,v}=rotationBasis(axis),angle=drag?.axis===axis?drag.angle||0:0,color=active?'#fff':colors[axis];
  const at=(theta,r=1)=>project(center.clone().addScaledVector(u,Math.cos(theta)*radius*r).addScaledVector(v,Math.sin(theta)*radius*r));
  const path=(from,to,r=1,count=72)=>Array.from({length:count+1},(_,i)=>{const p=at(from+(to-from)*i/count,r);return `${i?'L':'M'}${p.x},${p.y}`;}).join(' ');
  node('path',{d:path(0,Math.PI*2),fill:'none',stroke:color,'stroke-width':active?2:1.5,'data-ring-axis':axis});
  const origin=project(center),q=at(angle,1.15),reference=at(0,1.15);
  node('line',{x1:origin.x,y1:origin.y,x2:q.x,y2:q.y,stroke:color,'stroke-width':1.4});
  if(active){
   const ticks=node('g',{'aria-label':`${axis} rotation snap ticks`});
   for(let i=0;i<72;i++){const inner=at(i*Math.PI/36),outer=at(i*Math.PI/36,i%2===0?1.1:1.05);node('line',{x1:inner.x,y1:inner.y,x2:outer.x,y2:outer.y,stroke:'#fff','stroke-width':1.2},ticks);}
   for(let i=0;i<8;i++){const inner=at(i*Math.PI/4,1/3),outer=at(i*Math.PI/4,2/3);node('line',{x1:inner.x,y1:inner.y,x2:outer.x,y2:outer.y,stroke:'#fff','stroke-width':1.2},ticks);}
   node('line',{x1:origin.x,y1:origin.y,x2:reference.x,y2:reference.y,stroke:'#fff','stroke-width':1.2});
   if(angle)node('path',{d:path(0,angle,1.15,Math.max(2,Math.ceil(angle*12))),fill:'none',stroke:colors[axis],'stroke-width':2});
  }
  const tangent=at(angle+.01,1.15),rotation=Math.atan2(tangent.y-q.y,tangent.x-q.x)*180/Math.PI;
  const group=handle({id:`rotate-${axis}-handle`,'data-rotation-axis':axis,transform:`translate(${q.x} ${q.y}) rotate(${rotation})`},axis,'g');
  node('circle',{r:23,fill:'transparent','pointer-events':'all'},group);
  node('rect',{x:-5,y:-5,width:10,height:10,fill:colors[axis],stroke:colors[axis],'stroke-width':1},group);
  node('polygon',{points:'-24,0 -10,-5 -10,5',fill:colors[axis]},group);
  node('polygon',{points:'24,0 10,-5 10,5',fill:colors[axis]},group);
  if(active){
   const label=node('g',{id:'rotation-readout','data-angle':THREE.MathUtils.radToDeg(angle).toFixed(2),'data-snap':drag?.snap||'free'});
   node('rect',{x:q.x+12,y:q.y+14,width:92,height:25,rx:2,fill:'#252b2de8'},label);
   node('text',{x:q.x+19,y:q.y+31,fill:'#fff','font-size':14},label).textContent=`${axis}: ${THREE.MathUtils.radToDeg(angle).toFixed(2)}`;
  }
 }
}
