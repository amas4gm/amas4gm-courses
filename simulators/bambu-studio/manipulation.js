import {drawRotationGizmo,snapRotation,rotationBasis} from './rotation-gizmo.js?v=2';
import {createSelectionOutline} from './selection-outline.js?v=rotation-retry-1';
import * as THREE from '../../shared/vendor/three.module.js';
import {axes,rotationQuaternion,rotationDegrees,groundObject,objectBounds,applyObjectState,layOnFace,scaleObject} from './object-transform.js';
// Shared, optional object-editing capability. Lesson data supplies goals and checkpoints.
export function createManipulation({container,mesh,camera,controls,renderer,render,api}){
 const $=s=>container.querySelector(s),viewport=$('#viewport'),canvas=$('#scene');
 const listeners=new AbortController(),on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:listeners.signal});
 const names={move:'Move',scale:'Scale',rotate:'Rotate',flatten:'Lay on face'},colors={X:'#d62929',Y:'#16942a',Z:'#235ae1'};
 let step,context,tool=null,selected=false,paused=false,uniform=true,drag=null,hoverFace=null,selectedAtStart=false,lastRelative=[0,0,0],rotationHover=null,lastRotationGesture=null;
 let retryAnimation=null,retryFrame=0;
 const panel=document.createElement('section');panel.id='transform-panel';panel.hidden=true;panel.setAttribute('aria-label','Object manipulation');viewport.append(panel);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='object-gizmo';svg.setAttribute('aria-label','Object manipulation handles');viewport.append(svg);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 // Center the pivot. The mesh still starts at the exact imported orientation and dimensions.
 mesh.geometry.computeBoundingBox();mesh.geometry.translate(0,-mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).y,0);mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();groundObject(mesh);
 const baseSize=mesh.geometry.boundingBox.getSize(new THREE.Vector3());
 const outline=createSelectionOutline({mesh,scene:mesh.parent,camera,renderer});
 // Select actual planar exterior surfaces. This compact extraction avoids another mesh asset.
 const groups=new Map(),positions=mesh.geometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<positions.count;i+=3){a.fromBufferAttribute(positions,i);b.fromBufferAttribute(positions,i+1);c.fromBufferAttribute(positions,i+2);const cross=b.clone().sub(a).cross(c.clone().sub(a)),area=cross.length()/2;if(area<1e-7)continue;const n=cross.normalize(),d=n.dot(a),key=[n.x,n.y,n.z,d].map(v=>v.toFixed(3)).join(',');let g=groups.get(key);if(!g){g={normal:n.clone(),d,area:0,vertices:[],center:new THREE.Vector3()};groups.set(key,g);}g.area+=area;g.center.add(a.clone().add(b).add(c).multiplyScalar(area/3));g.vertices.push(...a.toArray(),...b.toArray(),...c.toArray());}
 const faces=[...groups.values()].filter(g=>g.area>60).filter(g=>{for(let i=0;i<positions.count;i++){a.fromBufferAttribute(positions,i);if(g.normal.dot(a)>g.d+.12)return false;}return true;}).sort((a,b)=>b.area-a.area);
 function convexSurface(face){
  const u=new THREE.Vector3().crossVectors(face.normal,Math.abs(face.normal.y)<.9?axes.Z:axes.X).normalize(),v=new THREE.Vector3().crossVectors(face.normal,u),points=new Map();
  for(let i=0;i<face.vertices.length;i+=3){const p=new THREE.Vector3(...face.vertices.slice(i,i+3)),x=p.dot(u),y=p.dot(v);points.set(x.toFixed(4)+','+y.toFixed(4),{x,y,p});}
  const sorted=[...points.values()].sort((a,b)=>a.x-b.x||a.y-b.y),cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lower=[],upper=[];
  for(const p of sorted){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(const p of sorted.toReversed()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1)),vertices=[];face.hull=hull.map(p=>p.p.clone());for(let i=1;i<hull.length-1;i++)vertices.push(...hull[0].p.toArray(),...hull[i].p.toArray(),...hull[i+1].p.toArray());return vertices;
 }
 for(const face of faces){face.center.divideScalar(face.area);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(convexSurface(face),3));const material=new THREE.MeshBasicMaterial({color:0xf5f5f5,transparent:true,opacity:.52,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false});face.overlay=new THREE.Mesh(geometry,material);face.overlay.visible=false;mesh.add(face.overlay);}
 const baseFace=faces.find(f=>f.normal.z>.999); // Supplied STL's flat underside, derived from its faces.
 const active=()=>!!step?.simulation?.editing,free=()=>step?.simulation?.action==='manipulate-free';
 const allowed=()=>!paused&&!retryAnimation&&active();
 const cfg=()=>step.simulation;
 const project=v=>{const p=v.clone().project(camera);return {x:(p.x+1)*viewport.clientWidth/2,y:(1-p.y)*viewport.clientHeight/2};};
 const center=()=>objectBounds(mesh).getCenter(new THREE.Vector3());
 const rotationCenter=()=>mesh.localToWorld(mesh.geometry.boundingSphere.center.clone());
 const rotationRadius=()=>mesh.geometry.boundingSphere.radius*Math.max(mesh.scale.x,mesh.scale.y,mesh.scale.z)+5;
 const size=()=>objectBounds(mesh).getSize(new THREE.Vector3());
 const permittedTool=t=>allowed()&&selected&&(free()||cfg().tool===t);
 function updateToolbar(){for(const [id,name] of Object.entries(names)){const button=$('#tool-'+id);button.disabled=!permittedTool(id);button.classList.toggle('tool-selected',tool===id);button.setAttribute('aria-pressed',String(tool===id));button.title=`${name} [${{move:'M',scale:'S',rotate:'R',flatten:'F'}[id]}]`;}}
 function chooseTool(next){if(!permittedTool(next))return;tool=next;rotationHover=null;lastRotationGesture=null;updateToolbar();buildPanel();draw();if(cfg().action==='tool'&&cfg().tool===next)api.complete();api.guideChanged();}
 function fields(row,label,unit){return `<span>${label}</span>${['X','Y','Z'].map(axis=>`<label><span class="sr-only">${label} ${axis}</span><input id="${row}-${axis}" data-row="${row}" data-axis="${axis}" aria-label="${label} ${axis}" type="number" step="${row==='scale'?'1':'.1'}"></label>`).join('')}<span>${unit}</span>`;}
 function buildPanel(){
  panel.hidden=!tool||!selected;viewport.classList.toggle('has-transform-panel',!panel.hidden);panel.innerHTML='';if(panel.hidden)return;
  const coordinate=tool==='scale'?'Object coordinates':'World coordinates';
  let body=`<div class="transform-grid"><span>${coordinate}</span><b class="axis-X">X</b><b class="axis-Y">Y</b><b class="axis-Z">Z</b><span></span>`;
  if(tool==='move')body+=fields('position','Position','mm');
  if(tool==='scale')body+=fields('scale','Scale','%')+fields('size','Size','mm');
  if(tool==='rotate')body+=fields('relative','Rotate (relative)','°')+fields('rotation','Rotate (absolute)','°');
  body+='</div>';
  if(tool==='scale')body+='<label class="uniform-control"><input type="checkbox" id="uniform-scale"> uniform scale</label>';
  if(tool==='flatten')body='<div class="face-mode">Mode: <label><input type="radio" checked disabled> Convex hull</label> <label><input type="radio" disabled> Triangular facet</label></div><p class="face-help">Click a pale flat face to put it on the plate.</p>';
  panel.innerHTML=body;
  for(const input of panel.querySelectorAll('input[data-row]')){
   input.disabled=!allowed()||(!free()&&cfg().action!=='transform');
   if(input.id==='position-Z')input.disabled=true;
   if(!free()&&cfg().editable)input.disabled=!allowed()||!cfg().editable.includes(input.id);
   on(input,'input',()=>delete input.dataset.committed);on(input,'change',()=>applyInput(input));on(input,'keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyInput(input);input.blur();updateValues();}});
  }
  const check=$('#uniform-scale');if(check){check.checked=uniform;check.disabled=paused||(!free()&&!cfg().allowUniform);on(check,'change',()=>{uniform=check.checked;if(cfg().action==='uniform'&&uniform===cfg().uniform)api.complete();});}
  updateValues();
 }
 function updateValues(){
  const bounds=objectBounds(mesh),mid=bounds.getCenter(new THREE.Vector3()),s=mesh.scale,r=rotationDegrees(mesh.quaternion);
  const values={position:[mid.x+128,128-mid.z,mid.y],scale:[s.x*100,s.z*100,s.y*100],size:[baseSize.x*s.x,baseSize.z*s.z,baseSize.y*s.y],rotation:r,relative:[0,0,0]};
  for(const el of panel.querySelectorAll('input[data-row]'))if(document.activeElement!==el)el.value=values[el.dataset.row]['XYZ'.indexOf(el.dataset.axis)].toFixed(2);
  const dimensions=bounds.getSize(new THREE.Vector3());$('.object-info').textContent=`Object name: Benchy.stl\nSize: ${dimensions.x.toFixed(2)} × ${dimensions.z.toFixed(2)} × ${dimensions.y.toFixed(2)} mm\nPosition: ${(mid.x+128).toFixed(1)}, ${(128-mid.z).toFixed(1)}, ${mid.y.toFixed(1)} mm`;
 }
 function applyInput(input){
  if(!allowed()||input.disabled||input.dataset.committed===input.value)return;input.dataset.committed=input.value;const value=input.value.trim()===''?NaN:Number(input.value),axis=input.dataset.axis,row=input.dataset.row,index='XYZ'.indexOf(axis),component={X:'x',Y:'z',Z:'y'}[axis];
  if(!Number.isFinite(value)){api.retry('Enter a number, then press Enter.',panel);updateValues();return;}
  if(row==='position'){
   if(value<0||value>256){api.retry('Use a position between 0 and 256 mm in this practice.',panel);updateValues();return;}
   const mid=center();if(axis==='X')mesh.position.x+=value-(mid.x+128);if(axis==='Y')mesh.position.z-=value-(128-mid.z);if(axis==='Z'){mesh.position.y+=value-mid.y;groundObject(mesh);}
  }else if(row==='scale'||row==='size'){
   const factor=row==='scale'?value/100:value/baseSize[component];
   if(!scaleObject(mesh,axis,factor,uniform)){api.retry('For this practice, use a scale from 10% to 300%.',panel);updateValues();return;}
  }else{
   const degrees=rotationDegrees(mesh.quaternion);if(row==='relative'){lastRelative=[0,0,0];lastRelative[index]=value;mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axes[axis],THREE.MathUtils.degToRad(value)));}else{degrees[index]=value;mesh.quaternion.copy(rotationQuaternion(degrees));}groundObject(mesh);
  }
  updateValues();render();checkGoal();
 }
 function resetRotationAttempt(){
  const checkpoint=cfg().objectState,position=mesh.position.clone(),started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  retryAnimation={position};lastRotationGesture=null;rotationHover=null;controls.enabled=false;
  api.partial(cfg().retryMessage||'For this step, rotate to exactly 45 deg using the snap ticks. Resetting orientation.',{title:'Try again.',tone:'retry'});
  outline.setError(true);updateToolbar();buildPanel();
  function animate(now){
   const elapsed=now-started,progress=Math.min(1,elapsed/700);
   mesh.position.copy(position);if(!reduced)mesh.position.x+=Math.sin(progress*Math.PI*8)*2*(1-progress);
   outline.setError(reduced||Math.floor(elapsed/175)%2===0);render();
   if(progress<1){retryFrame=requestAnimationFrame(animate);return;}
   retryFrame=0;retryAnimation=null;outline.setError(false);applyObjectState(mesh,checkpoint);controls.enabled=allowed();updateToolbar();buildPanel();render();api.guideChanged();
  }
  render();retryFrame=requestAnimationFrame(animate);
 }
 function cancelRotationRetry(){cancelAnimationFrame(retryFrame);retryFrame=0;if(retryAnimation)mesh.position.copy(retryAnimation.position);retryAnimation=null;outline.setError(false);}
 function checkGoal({released=false}={}){
  if(context.isCompleted()||!cfg().goal)return;const g=cfg().goal,mid=center(),degrees=rotationDegrees(mesh.quaternion),state={position:[mid.x+128,128-mid.z,mid.y],scale:[mesh.scale.x*100,mesh.scale.z*100,mesh.scale.y*100],size:[baseSize.x*mesh.scale.x,baseSize.z*mesh.scale.z,baseSize.y*mesh.scale.y],rotation:degrees,relative:lastRelative};
  const actual=state[g.property]?.['XYZ'.indexOf(g.axis)];
  if(Math.abs(actual-g.value)<(g.tolerance??.15)&&(!g.requiresSnap||lastRotationGesture?.axis===g.axis&&lastRotationGesture?.snap===g.requiresSnap))api.complete();else if(released&&g.requiresSnap)resetRotationAttempt();else if(!drag&&g.requiresSnap&&Math.abs(actual-g.value)<(g.tolerance??.15))api.partial(`Use the ${g.requiresSnap==='fine'?'outer tick band for 5°':'inner spokes for 45°'} snapping, then release at the requested angle.`,{title:'Try the snap marks.'});else if(!drag)api.partial(`Current ${g.axis}: ${actual.toFixed(1)}${g.property==='scale'?'%':g.property==='rotation'?'°':' mm'}. Aim for ${g.value}${g.property==='scale'?'%':g.property==='rotation'?'°':' mm'}.`,{title:'Keep adjusting.'});
 }
 function hitModel(event){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);ray.setFromCamera(pointer,camera);return ray.intersectObject(mesh,false)[0];}
 function faceAt(hit){if(!hit)return null;const p=hit.point.clone();mesh.worldToLocal(p);return faces.find(f=>f.normal.dot(hit.face.normal)>.999&&Math.abs(f.normal.dot(p)-f.d)<.15);}
 function pickFace(event){const modelHit=hitModel(event),hits=ray.intersectObjects(faces.map(f=>f.overlay),false);const hit=hits.find(h=>!modelHit||h.distance<=modelHit.distance+.2);return hit?faces.find(f=>f.overlay===hit.object):faceAt(modelHit);}
 function lay(face){
  if(!face)return api.retry('Choose a pale, flat surface on the model.');
  if(!free()&&face!==baseFace)return api.retry('Choose the broad flat underside of the hull, not the deck or cabin.');
  layOnFace(mesh,face.normal);tool=null;updateToolbar();buildPanel();render();if(cfg().action==='lay-face')api.complete();
 }
 on(canvas,'pointerdown',event=>{
  if(!allowed()||event.button!==0)return;const hit=hitModel(event);
  if(cfg().action==='object-select'){
   event.stopImmediatePropagation();if(!hit){api.retry('Click Benchy itself to select the object.');return;}selected=true;updateToolbar();render();api.complete();return;
  }
  if(tool==='flatten'){const face=pickFace(event);if(hit||face){event.stopImmediatePropagation();lay(face);}return;}
  if(hit&&selected){event.stopImmediatePropagation();if(free()&&tool==='move')beginDrag(event,'XY');else if(cfg().action==='transform')api.retry('Use the colored handles or the number fields for this tool.');}
 },{capture:true});
 on(canvas,'pointermove',event=>{if(!allowed()||tool!=='flatten')return;const next=pickFace(event);if(next!==hoverFace){hoverFace=next;render();}});
 function svgNode(tag,attrs,parent=svg){const el=document.createElementNS(svg.namespaceURI,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));parent.append(el);return el;}
 function handle(attrs,axis,tag='circle'){
  const el=svgNode(tag,{...attrs,class:'gizmo-handle',role:'button',tabindex:paused?-1:0,'aria-label':`${names[tool]} ${axis} handle`});
  el.addEventListener('pointerdown',event=>{event.stopPropagation();if(allowed()&&(free()||cfg().action==='transform'))beginDrag(event,axis);});
  el.addEventListener('keydown',e=>{if(!allowed()||!['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key))return;e.preventDefault();nudge(axis,['ArrowRight','ArrowUp'].includes(e.key)?1:-1);});return el;
 }
 function draw(){
  svg.hidden=!active()||!selected;outline.update(active()&&selected);
  for(const f of faces){f.overlay.visible=active()&&tool==='flatten';f.overlay.material.color.set(f===hoverFace?0x65cd91:0xf5f5f5);}
  svg.replaceChildren();if(svg.hidden)return;const width=viewport.clientWidth,height=viewport.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const mid=center(),p=project(mid),dimensions=size(),radius=Math.max(dimensions.x,dimensions.y,dimensions.z)*.7+15;
  if(tool==='move'||tool==='scale'){
   for(const axis of ['X','Y','Z']){const direction=axes[axis].clone();if(tool==='scale')direction.applyQuaternion(mesh.quaternion);const q=project(mid.clone().addScaledVector(direction,radius));svgNode('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,stroke:colors[axis],'stroke-width':2,'stroke-dasharray':'5 3'});
    svgNode('text',{x:q.x+12,y:q.y-8,fill:colors[axis],'font-size':16}).textContent=axis;
    if(tool==='move'){const angle=Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;handle({points:`${q.x+9},${q.y} ${q.x-7},${q.y-6} ${q.x-7},${q.y+6}`,transform:`rotate(${angle} ${q.x} ${q.y})`,fill:colors[axis]},axis,'polygon');}
    else handle({x:q.x-7,y:q.y-7,width:14,height:14,fill:colors[axis]},axis,'rect');
   }
   if(tool==='scale'){const q=project(mid.clone().add(new THREE.Vector3(radius,radius,radius)));svgNode('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,stroke:'#21bfbf','stroke-dasharray':'4 4'});handle({x:q.x-7,y:q.y-7,width:14,height:14,fill:'#20caca'},'XYZ','rect');}
  }
  if(tool==='rotate')drawRotationGizmo({node:svgNode,handle,project,center:drag?.tool==='rotate'?drag.center:rotationCenter(),radius:drag?.tool==='rotate'?drag.radius:rotationRadius(),hover:rotationHover,drag:drag?.tool==='rotate'?drag:null,colors});
  if(tool==='flatten')for(const [index,face] of faces.entries()){
   const worldCenter=mesh.localToWorld(face.center.clone()),normal=face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize();
   if(normal.dot(camera.position.clone().sub(worldCenter))<=0)continue;
   const points=face.hull.map(p=>project(mesh.localToWorld(p.clone()))),surface=svgNode('polygon',{points:points.map(p=>`${p.x},${p.y}`).join(' '),fill:'transparent',class:'flat-face-hit',role:'button',tabindex:paused?-1:0,'aria-label':face===baseFace?'Flat underside of hull':`Flat face ${index+1}`});
   surface.addEventListener('click',()=>{if(allowed())lay(face);});surface.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&allowed()){e.preventDefault();lay(face);}});
  }
  if(tool==='flatten'&&baseFace&&baseFace.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).dot(camera.position.clone().sub(mesh.localToWorld(baseFace.center.clone())))>0){const q=project(mesh.localToWorld(baseFace.center.clone()));const el=svgNode('circle',{id:'base-face-target',cx:q.x,cy:q.y,r:13,fill:'transparent',role:'button',tabindex:paused?-1:0,'aria-label':'Lay Benchy on its flat underside',class:'face-target'});el.addEventListener('click',()=>{if(allowed())lay(baseFace);});el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&allowed()){e.preventDefault();lay(baseFace);}});}
  updateValues();if((tool==='flatten'||cfg().goal?.requiresSnap)&&!context.isCompleted())api.guideChanged();
 }
 function beginDrag(event,axis){
  if(!allowed()||!selected)return;event.preventDefault();const mid=tool==='rotate'?rotationCenter():center(),origin=project(mid),end=project(mid.clone().addScaledVector(tool==='scale'?(axis==='XYZ'?new THREE.Vector3(1,1,1).normalize():axes[axis].clone().applyQuaternion(mesh.quaternion)):(axes[axis]||axes.X),30));
  const plane=tool==='rotate'?new THREE.Plane().setFromNormalAndCoplanarPoint(axes[axis],mid):null;
  drag={plane,radius:rotationRadius(),angle:0,snap:'free',axis,x:event.clientX,y:event.clientY,position:mesh.position.clone(),scale:mesh.scale.clone(),quaternion:mesh.quaternion.clone(),origin,end,center:mid,tool};controls.enabled=false;
  viewport.setPointerCapture(event.pointerId);if(tool==='rotate'){rotationHover=axis;render();}
 }
 on(viewport,'pointermove',event=>{
  if(paused||retryAnimation)return;if(!drag){if(tool==='rotate'){const next=event.target.closest('[data-rotation-axis]')?.dataset.rotationAxis||null;if(next!==rotationHover){rotationHover=next;render();}}return;}const rect=viewport.getBoundingClientRect(),factor=viewport.clientWidth/rect.width,dx=(event.clientX-drag.x)*factor,dy=(event.clientY-drag.y)*factor;
  const vector={x:drag.end.x-drag.origin.x,y:drag.end.y-drag.origin.y},length=Math.hypot(vector.x,vector.y),delta=(dx*vector.x+dy*vector.y)/Math.max(length,1);
  if(tool==='move'){mesh.position.copy(drag.position);if(drag.axis==='XY'){mesh.position.x+=dx*.15;mesh.position.z+=dy*.15;}else mesh.position.addScaledVector(axes[drag.axis],Math.round(delta/Math.max(length,1)*30));if(drag.axis==='Z')groundObject(mesh);}
  if(tool==='scale'){mesh.scale.copy(drag.scale);const scale=Math.max(.1,Math.min(3,1+delta/160));if(uniform||drag.axis==='XYZ')mesh.scale.multiplyScalar(scale);else mesh.scale[{X:'x',Y:'z',Z:'y'}[drag.axis]]*=scale;groundObject(mesh);}
  if(tool==='rotate'){
   hitModel(event);const point=ray.ray.intersectPlane(drag.plane,new THREE.Vector3());if(!point)return;
   const vector=point.sub(drag.center),basis=rotationBasis(drag.axis),raw=Math.atan2(vector.dot(basis.v),vector.dot(basis.u)),snapped=snapRotation(raw,vector.length()/drag.radius);
   const previousSnap=drag.snap;drag.angle=snapped.angle;drag.snap=snapped.mode;mesh.position.copy(drag.position);mesh.quaternion.copy(drag.quaternion).premultiply(new THREE.Quaternion().setFromAxisAngle(axes[drag.axis],drag.angle));
   if(cfg().goal?.requiresSnap&&snapped.mode!==previousSnap){
    if(snapped.mode==='free')api.partial('The pointer is off the snap marks, so snapping is no longer engaged. Hover the tick-mark band while dragging to snap again.',{title:'Free rotation.'});
    else api.partial(`${snapped.mode==='fine'?'5\u00b0 tick':'45\u00b0 inner-guide'} snapping is active only while your pointer hovers over these marks. Move off the marks to rotate freely.`,{title:'Snap marks engaged.'});
   }
  }
  render();
 });
 on(viewport,'pointerleave',()=>{if(!drag&&rotationHover){rotationHover=null;render();}});
 on(viewport,'pointerup',event=>{if(!drag)return;const rotationRelease=drag.tool==='rotate';if(rotationRelease){lastRotationGesture={axis:drag.axis,snap:drag.snap,angle:drag.angle};groundObject(mesh);}drag=null;rotationHover=null;render();if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);controls.enabled=allowed()&&cfg().action!=='object-select';checkGoal({released:rotationRelease});});
 on(viewport,'pointercancel',()=>{if(drag?.tool==='rotate'){mesh.position.copy(drag.position);mesh.quaternion.copy(drag.quaternion);}drag=null;rotationHover=null;render();controls.enabled=allowed()&&cfg().action!=='object-select';});
 function nudge(axis,direction){
  if(!allowed()||(!free()&&cfg().action!=='transform'))return;
  if(tool==='rotate'&&cfg().goal?.requiresSnap&&!context.isCompleted()&&axis!==cfg().goal.axis){resetRotationAttempt();return;}
  if(tool==='move'){mesh.position.addScaledVector(axes[axis]||axes.X,direction);groundObject(mesh);}
  if(tool==='scale'){const a=axis==='XYZ'?'X':axis,current=mesh.scale[{X:'x',Y:'z',Z:'y'}[a]];scaleObject(mesh,a,current+direction*.05,uniform||axis==='XYZ');}
  if(tool==='rotate'){const snap=cfg().goal?.requiresSnap||'fine',degrees=direction*(snap==='coarse'?45:5);rotationHover=axis;mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axes[axis],THREE.MathUtils.degToRad(degrees)));lastRotationGesture={axis,snap,angle:THREE.MathUtils.degToRad(degrees)};groundObject(mesh);}
  render();checkGoal();
 }
 on(viewport,'keydown',e=>{if(e.target.closest('input'))return;if(allowed()&&cfg().action==='object-select'&&e.key==='Enter'){e.preventDefault();selected=true;updateToolbar();render();api.complete();return;}const t={m:'move',s:'scale',r:'rotate',f:'flatten'}[e.key.toLowerCase()];if(t){e.preventDefault();chooseTool(t);}});
 for(const name of Object.keys(names))on($('#tool-'+name),'click',()=>chooseTool(name));
 return {
  setStep(next,ctx){cancelRotationRetry();step=next;context=ctx;lastRelative=[0,0,0];rotationHover=null;lastRotationGesture=null;drag=null;hoverFace=null;selectedAtStart=cfg().action!=='object-select'||ctx.isCompleted();selected=selectedAtStart;uniform=cfg().uniformBefore??true;tool=cfg().action==='tool'&&!ctx.isCompleted()?null:cfg().tool||null;applyObjectState(mesh,ctx.isCompleted()?cfg().completedState||cfg().objectState:cfg().objectState);updateToolbar();buildPanel();draw();},
  draw,renderSelection:()=>outline.render(),handles:target=>!!target.closest('#transform-panel,#object-gizmo,[id^="tool-"]'),
  setPaused(value){paused=value;updateToolbar();panel.querySelectorAll('input').forEach(el=>{if(value)el.disabled=true;});if(!value)buildPanel();},
  getTarget(){if(cfg().action==='object-select')return $('#scene');if(cfg().action==='lay-face')return $('#base-face-target');return $('#'+(cfg().target||'transform-panel'));},
  dispose(){cancelRotationRetry();listeners.abort();outline.dispose();panel.remove();svg.remove();},
  perform(action){const [prefix,axis,direction]=action.split(':');if(prefix==='adjust'||prefix==='snap')nudge(axis,Number(direction));},
  enabled:active
 };
}
