import * as THREE from '../../shared/vendor/three.module.js';
import {precisionDelta,dragZoomDistance} from './native-modal.js?v=input-5';
import {liveState,meshForState,viewportRect} from './live-state.js?v=feedback-2';

const baseRotation=new THREE.Quaternion(.425,.176,.340,.820).normalize();
const svgNS='http://www.w3.org/2000/svg';
export async function createLiveViewport({stage,frame,manifest,url,onView,onTop,onRender}){
 const names=['cube','blank','inset','cavity','finished','bevel-1','bevel-2','bevel-3'];
 const assets=Object.fromEntries(await Promise.all(names.map(async name=>{const r=await fetch(url(`assets/${name.startsWith('bevel-')?'live/':''}${name}.json`));if(!r.ok)throw Error(`Mesh unavailable: ${name}`);return [name,await r.json()];})));
 const canvas=document.createElement('canvas');canvas.className='bl-live-canvas';canvas.setAttribute('aria-label','Live Blender 3D viewport');stage.prepend(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setClearColor(0x3f3f3f);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));let renderWidth=0,renderHeight=0;
 const scene=new THREE.Scene(),model=new THREE.Group(),grid=new THREE.Group();scene.add(model,grid);
 const perspective=new THREE.PerspectiveCamera(40,1,.01,10000),ortho=new THREE.OrthographicCamera(-1,1,1,-1,.01,10000);let camera=perspective;
 const target=new THREE.Vector3(),rotation=baseRotation.clone();let distance=10,state=null,mesh=null,rect=null,revision=0,viewChanged=false,queued=0,disposed=false,selectionPoint=null,navigationReverse=null;
 const lightRoot=new THREE.Group();scene.add(lightRoot);lightRoot.add(new THREE.AmbientLight(0xffffff,.7));
 const key=new THREE.DirectionalLight(0xffffff,2.9);key.position.set(-3,5,6);lightRoot.add(key);const fill=new THREE.DirectionalLight(0xb8c7df,.55);fill.position.set(4,-1,0);lightRoot.add(fill);
 const label=document.createElement('div');label.className='bl-live-label';stage.append(label);
 const gizmo=document.createElementNS(svgNS,'svg');gizmo.classList.add('bl-live-gizmo');gizmo.setAttribute('viewBox','0 0 144 144');stage.append(gizmo);
 const topButton=document.createElement('button');topButton.className='bl-live-top';topButton.setAttribute('aria-label','Z axis — Top view');topButton.addEventListener('click',e=>{e.stopPropagation();onTop?.();});stage.append(topButton);
 const cursorIcon=document.createElement('div');cursorIcon.className='bl-live-cursor';cursorIcon.innerHTML='<svg viewBox="0 0 40 40"><path d="M20 0V40M0 20H40" stroke="#161616" stroke-width="3"/><path d="M20 1V39M1 20H39" stroke="#ddd"/><circle cx="20" cy="20" r="10" fill="none" stroke="#eee" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="#bd4b4b" stroke-width="2" stroke-dasharray="7.85 7.85"/></svg>';stage.append(cursorIcon);
 const selectionTarget=document.createElement('span');selectionTarget.className='bl-live-selection-guide';selectionTarget.setAttribute('aria-hidden','true');stage.append(selectionTarget);
 const axes=[['X',new THREE.Vector3(1,0,0),'#d95062'],['Y',new THREE.Vector3(0,1,0),'#85ad22'],['Z',new THREE.Vector3(0,0,1),'#388ee4']];
 const raycaster=new THREE.Raycaster(),cursor=new THREE.Vector2();let faceMap=[];
 const clearGroup=g=>{for(const child of [...g.children]){child.geometry?.dispose();if(Array.isArray(child.material))child.material.forEach(m=>m.dispose());else child.material?.dispose();g.remove(child);}};
 function render(){if(disposed||!state||canvas.hidden)return;camera.position.copy(new THREE.Vector3(0,0,distance).applyQuaternion(rotation).add(target));camera.quaternion.copy(rotation);camera.updateMatrixWorld();lightRoot.quaternion.copy(rotation);renderer.render(scene,camera);revision++;canvas.dataset.renderRevision=String(revision);canvas.dataset.camera=JSON.stringify([...camera.position.toArray(),...target.toArray()]);drawGizmo();const p=new THREE.Vector3().project(camera),x=rect.x+(p.x+1)*rect.width/2,y=rect.y+(1-p.y)*rect.height/2;cursorIcon.hidden=state.renamePopup||x<rect.left+20||x>rect.right-20||y<rect.visibleY+20||y>rect.y+rect.height-20||p.z>1;cursorIcon.style.left=`${x-20}px`;cursorIcon.style.top=`${y-20}px`;if(selectionPoint){const s=selectionPoint.clone().project(camera);selectionTarget.style.left=`${rect.x+(s.x+1)*rect.width/2-40}px`;selectionTarget.style.top=`${rect.y+(1-s.y)*rect.height/2-24}px`;}onRender?.();}
 function requestRender(){if(!queued)queued=requestAnimationFrame(()=>{queued=0;render();});}
 function cameraReset(s){rotation.copy(baseRotation);if(s.angle)rotation.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),s.angle));target.set(s.pan||0,0,s.asset==='cube'?0:9);distance=(s.asset==='cube'&&!['dx','dy','dz'].some(k=>k in s.values)?10:185)*(s.zoom||1);camera=s.top?ortho:perspective;if(s.top)rotation.identity();viewChanged=false;}
 function layout(){if(!rect)return;Object.assign(canvas.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});const scale=stage.getBoundingClientRect().width/parseFloat(stage.style.width)||1;const w=Math.max(1,Math.round(rect.width*scale)),h=Math.max(1,Math.round(rect.height*scale));if(w!==renderWidth||h!==renderHeight){renderer.setSize(w,h,false);renderWidth=w;renderHeight=h;}
  for(const c of [perspective,ortho]){c.near=state.clipStart??.01;c.far=state.clipEnd??10000;}
  perspective.aspect=rect.width/rect.height;perspective.fov=2*Math.atan(1/(1.3888888359069824*perspective.aspect))*180/Math.PI;perspective.updateProjectionMatrix();const half=distance/(1.3888888359069824*perspective.aspect);ortho.left=-half*perspective.aspect;ortho.right=half*perspective.aspect;ortho.top=half;ortho.bottom=-half;ortho.updateProjectionMatrix();
  Object.assign(label.style,{left:`${rect.left+10}px`,top:`${rect.visibleY+14}px`});Object.assign(gizmo.style,{left:`${rect.right-155}px`,top:`${rect.visibleY+4}px`});requestRender();
 }
 function mask(name){const r=manifest.states[name];const opening=`<rect x="${rect.left}" y="${rect.visibleY}" width="${rect.right-rect.left}" height="${rect.height+rect.y-rect.visibleY}" fill="black"/>`;
  const popup=name==='rename-popup'?'<rect x="772" y="650" width="435" height="93" fill="white"/>':'';
  const hud=name.endsWith('-confirmed')?'<rect x="95" y="1295" width="300" height="40" fill="white"/>':'';
  const navigation=`<rect x="${rect.right-50}" y="${rect.visibleY+130}" width="50" height="220" fill="white"/>`;
  const svg=`<svg xmlns="${svgNS}" width="${r.width}" height="${r.height}"><rect width="100%" height="100%" fill="white"/>${opening}${popup}${hud}${navigation}</svg>`;
  // A luminance mask makes only the simulated viewport transparent. Native UI pixels are untouched.
  frame.style.maskImage=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;frame.style.maskMode='luminance';frame.style.maskSize='100% 100%';
 }
 function rebuild(){clearGroup(model);clearGroup(grid);const data=meshForState(state,assets);mesh=null;faceMap=[];
  const step=state.asset==='cube'?1:10,extent=step*100,positions=[];for(let i=-100;i<=100;i++){if(i===0)continue;const v=i*step;positions.push(-extent,v,0,extent,v,0,v,-extent,0,v,extent,0);}
  if(state.units===false){const gridGeometry=new THREE.BufferGeometry();gridGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));grid.add(new THREE.LineSegments(gridGeometry,new THREE.LineBasicMaterial({color:0x454545,depthWrite:false})));}
  for(const [p,color] of [[[ -extent,0,0,extent,0,0],0x824447],[[0,-extent,0,0,extent,0],0x5b6d40]]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));grid.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color,depthWrite:false})));}
  grid.children.forEach(line=>line.renderOrder=-10);
  if(!data){requestRender();return;}
  const p=[],colors=[];data.faces.forEach((face,i)=>{for(let j=1;j<face.length-1;j++){for(const index of [face[0],face[j],face[j+1]]){p.push(...data.vertices[index]);const c=new THREE.Color(data.selectedFaces[i]?(state.operation?.kind==='extrude'?0xafa89f:0xb2a291):0x909090);colors.push(c.r,c.g,c.b);}faceMap.push(i);}});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,flatShading:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));model.add(mesh);
  if(state.orientation){mesh.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb = vec3(1.0,0.0,0.0);');};}
  if(state.mode==='EDIT'){
   const ep=[],ec=[];data.edges.forEach(([a,b],i)=>{ep.push(...data.vertices[a],...data.vertices[b]);const c=new THREE.Color(data.selectedEdges[i]?(state.operation?.kind==='extrude'?0xffffff:0xffa33a):0x242424);ec.push(c.r,c.g,c.b,c.r,c.g,c.b);});const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(ep,3));eg.setAttribute('color',new THREE.Float32BufferAttribute(ec,3));model.add(new THREE.LineSegments(eg,new THREE.LineBasicMaterial({vertexColors:true})));
   if(state.tool==='vertex'){const vg=new THREE.BufferGeometry();vg.setAttribute('position',new THREE.Float32BufferAttribute(data.vertices.flat(),3));const vc=data.selectedVertices.flatMap((selected,i)=>new THREE.Color(state.selectedVertices?.at(-1)===i?0xffffff:selected?0xffa33a:0x161616).toArray());vg.setAttribute('color',new THREE.Float32BufferAttribute(vc,3));model.add(new THREE.Points(vg,new THREE.PointsMaterial({vertexColors:true,size:5,sizeAttenuation:false})));}
  }else if(state.selection!=='none'){
   const outline=new THREE.Mesh(geometry.clone(),new THREE.MeshBasicMaterial({color:state.operation&&!state.operation.confirmed?0xffffff:0xffa33a,side:THREE.BackSide}));geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new THREE.Vector3());outline.scale.setScalar(1.006);outline.position.copy(center).multiplyScalar(-.006);model.add(outline);
  }
  const origin=new THREE.Mesh(new THREE.SphereGeometry(state.asset==='cube'?.018:.25,8,6),new THREE.MeshBasicMaterial({color:0xffa33a}));origin.position.set((state.values.x||0)+(state.operation?.kind==='move'?(state.operation.axis==='x'?state.operation.value:state.operation.vector?.[0]||0):0),state.operation?.kind==='move'?(state.operation.axis==='y'?state.operation.value:state.operation.vector?.[1]||0):0,(state.asset==='cube'?(state.values.z||0):9)+(state.operation?.kind==='move'?(state.operation.axis==='z'?state.operation.value:state.operation.vector?.[2]||0):0));model.add(origin);
  if(state.operation?.axis&&!state.operation.confirmed){const g=new THREE.BufferGeometry(),isX=state.operation.axis==='x',isY=state.operation.axis==='y';g.setAttribute('position',new THREE.Float32BufferAttribute(isX?[-10000,0,0,10000,0,0]:isY?[0,-10000,0,0,10000,0]:[0,0,-10000,0,0,10000],3));const line=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:isX?0xb34c58:isY?0x83a44c:0x6b98c7,depthTest:false}));line.renderOrder=20;model.add(line);}
  canvas.dataset.mesh=JSON.stringify({asset:data.asset,vertices:data.vertices.length,faces:data.faces.length,bounds:[0,1,2].map(i=>[Math.min(...data.vertices.map(v=>v[i])),Math.max(...data.vertices.map(v=>v[i]))])});requestRender();
  canvas.dataset.selectedVertices=JSON.stringify(data.selectedVertices.flatMap((selected,i)=>selected?[i]:[]));
 }
 function visibleVertices(){
  if(!mesh)return [];camera.updateMatrixWorld();mesh.updateMatrixWorld();
  const data=meshForState(state,assets);
  return data.vertices.flatMap((v,index)=>{
   const world=new THREE.Vector3(...v),p=world.clone().project(camera);
   if(p.z< -1||p.z>1)return [];
   raycaster.setFromCamera(new THREE.Vector2(p.x,p.y),camera);const hit=raycaster.intersectObject(mesh)[0];
   if(hit&&hit.distance<raycaster.ray.origin.distanceTo(world)-.01)return [];
   const x=rect.x+(p.x+1)*rect.width/2,y=rect.y+(1-p.y)*rect.height/2;
   return x>=rect.left&&x<=rect.right&&y>=rect.visibleY&&y<=rect.y+rect.height?[{index,x,y,world}]:[];
  });
 }
 function drawGizmo(){gizmo.replaceChildren();const inverse=rotation.clone().invert();const projected=[];
  for(const [name,v,color] of axes)for(const sign of [-1,1]){const point=v.clone().multiplyScalar(sign).applyQuaternion(inverse);projected.push({name,sign,color,point});}
  projected.sort((a,b)=>a.point.z-b.point.z).forEach(({name,sign,color,point})=>{const x=72+point.x*47,y=72-point.y*47;if(sign>0){const line=document.createElementNS(svgNS,'line');for(const [k,v] of Object.entries({x1:72,y1:72,x2:x,y2:y,stroke:color,'stroke-width':3}))line.setAttribute(k,v);gizmo.append(line);}
   if(name==='Z'&&sign>0){topButton.style.left=`${rect.right-155+x-14}px`;topButton.style.top=`${rect.visibleY+4+y-14}px`;}
   const circle=document.createElementNS(svgNS,'circle');for(const [k,v] of Object.entries({cx:x,cy:y,r:12,fill:sign>0?color:'#3f3f3f',stroke:color,'stroke-width':2}))circle.setAttribute(k,v);gizmo.append(circle);if(sign>0){const text=document.createElementNS(svgNS,'text');text.setAttribute('x',x);text.setAttribute('y',y+5);text.setAttribute('text-anchor','middle');text.setAttribute('fill','#17212d');text.textContent=name;gizmo.append(text);}
  });
  label.textContent=`${camera===ortho?'Top Orthographic':'User Perspective'}\n(1) Collection | ${state.startup||state.objectName==='Cube'?'Cube':'Desk Tray'}`;
 }
 return {
  canvas,topButton,
  setVertexSelection(ids){state.selectedVertices=[...ids];rebuild();},
  vertexGuide(exclude=[]){render();const next=visibleVertices().find(v=>!exclude.includes(v.index));if(!next)return null;selectionPoint=next.world;render();selectionTarget.dataset.mouseGesture=exclude.length?'shift-click':'click';return selectionTarget;},
  visibleVertexIds(){render();return visibleVertices().map(v=>v.index);},
  hitVertex(clientX,clientY){render();const b=canvas.getBoundingClientRect(),scale=b.width/rect.width,x=rect.x+(clientX-b.left)/scale,y=rect.y+(clientY-b.top)/scale;const candidates=visibleVertices().map(v=>({...v,d:Math.hypot(v.x-x,v.y-y)*scale})).filter(v=>v.d<=10).sort((a,b)=>a.d-b.d);return candidates[0]?.index??null;},
  viewport:()=>rect,
  rotationValues(op){const axis=op.axis?new THREE.Vector3(...[...'xyz'].map(k=>k===op.axis?1:0)):new THREE.Vector3(...(op.viewAxis||[0,0,1]));const e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromAxisAngle(axis,op.value*Math.PI/180),'XYZ');return {rx:e.x*180/Math.PI,ry:e.y*180/Math.PI,rz:e.z*180/Math.PI};},
  previewOperation(op){state.operation=structuredClone(op);rebuild();},
  transformPointer(op,from,to,shift){
   const factor=precisionDelta(1,shift),dx=(to[0]-from[0])*factor,dy=(to[1]-from[1])*factor,worldPerPixel=2*distance/(rect.width*1.3888888359069824);
   const virtualFrom=op.virtualPointer||from,virtualTo=[virtualFrom[0]+dx,virtualFrom[1]+dy];op.virtualPointer=virtualTo;
   op.mouseTravel+=Math.hypot(dx,dy);if(shift)op.precisionTravel+=Math.hypot(to[0]-from[0],to[1]-from[1]);else op.normalTravel+=Math.hypot(to[0]-from[0],to[1]-from[1]);
   op.viewAxis=new THREE.Vector3(0,0,1).applyQuaternion(rotation).toArray();
   if(op.kind==='move'){
    const delta=new THREE.Vector3(dx*worldPerPixel,-dy*worldPerPixel,0).applyQuaternion(rotation);op.vector=op.vector.map((v,i)=>v+delta.getComponent(i));
    if(op.axis){const axis=new THREE.Vector3(...[...'xyz'].map(k=>k===op.axis?1:0)).applyQuaternion(rotation.clone().invert());op.visualValue+=(dx*axis.x-dy*axis.y)*worldPerPixel/Math.max(.01,axis.x*axis.x+axis.y*axis.y);}else op.visualValue=Math.hypot(...op.vector);
   }else if(op.kind==='rotate'||op.kind==='scale'){
    const c=new THREE.Vector3(state.values.x||0,0,state.asset==='cube'?state.values.z||0:9).project(camera),center=[rect.x+(c.x+1)*rect.width/2,rect.y+(1-c.y)*rect.height/2];
    const before=[virtualFrom[0]-center[0],virtualFrom[1]-center[1]],after=[virtualTo[0]-center[0],virtualTo[1]-center[1]];
    if(op.kind==='rotate'){let angle=Math.atan2(before[1],before[0])-Math.atan2(after[1],after[0]);angle=Math.atan2(Math.sin(angle),Math.cos(angle));const sign=op.axis?Math.sign(op.viewAxis['xyz'.indexOf(op.axis)])||1:1;op.visualValue+=angle*180/Math.PI*sign;}
    else op.visualValue=Math.max(.01,op.visualValue*Math.hypot(...after)/Math.max(1,Math.hypot(...before)));
   }else if(op.kind==='extrude'){const axis=new THREE.Vector3(0,0,1).applyQuaternion(rotation.clone().invert());op.visualValue+=(dx*axis.x-dy*axis.y)*worldPerPixel/Math.max(.01,axis.x*axis.x+axis.y*axis.y);}
   else {const c=new THREE.Vector3(0,0,18).project(camera),center=[rect.x+(c.x+1)*rect.width/2,rect.y+(1-c.y)*rect.height/2],radial=Math.hypot(virtualTo[0]-center[0],virtualTo[1]-center[1])-Math.hypot(virtualFrom[0]-center[0],virtualFrom[1]-center[1]);op.visualValue=Math.max(0,op.visualValue+radial*worldPerPixel*(op.kind==='inset'?-1:1));if(op.kind==='inset')op.visualValue=Math.min(34.9,op.visualValue);if(op.kind==='bevel')op.visualValue=Math.min(2.9,op.visualValue);}
  },
  previewClipping(setting,value){state[setting]=value;layout();},
  beginZoom(y){return {distance,y};},
  dragZoom(initial,y){const before=distance;distance=dragZoomDistance(initial.distance,y-initial.y,rect.height);viewChanged=true;layout();if(distance!==before)onView?.('zoom',distance-before,0);},
  selectionGuide(topOnly=false){const data=meshForState(state,assets);selectionPoint=new THREE.Vector3();if(data){const ids=topOnly?(data.faces.find(f=>f.every(i=>Math.abs(data.vertices[i][2]-18)<1e-5))||[]):data.vertices.map((_,i)=>i);for(const i of ids)selectionPoint.add(new THREE.Vector3(...data.vertices[i]));selectionPoint.divideScalar(ids.length||1);}render();return selectionTarget;},
  beginNavigation(){navigationReverse=new THREE.Vector3(0,1,0).applyQuaternion(rotation).z<0?-1:1;},
  endNavigation(){navigationReverse=null;},
  setFrame(name,{resetCamera=false}={}){const next=liveState(name,manifest);if(!next){canvas.hidden=label.hidden=topButton.hidden=cursorIcon.hidden=true;gizmo.style.display='none';frame.style.maskImage='none';return;}state=next;canvas.hidden=label.hidden=topButton.hidden=cursorIcon.hidden=false;gizmo.style.display='';rect=viewportRect(state,manifest);if(resetCamera||name==='top')cameraReset(state);mask(name);rebuild();layout();},
  resize:layout,
  navigate(kind,dx,dy=0){if(!state)return;
   if(kind==='orbit'){if(camera===ortho)camera=perspective;const sensitivity=.006981316953897476/1.5,z=new THREE.Vector3(0,0,1),back=z.clone().applyQuaternion(rotation),right=new THREE.Vector3(1,0,0).applyQuaternion(rotation),pitchAxis=right.clone();if(z.distanceToSquared(back)>.001){pitchAxis.crossVectors(z,back);if(pitchAxis.dot(right)<0)pitchAxis.negate();const f=Math.pow(Math.abs(z.angleTo(back)/Math.PI-.5)*2,2);pitchAxis.lerp(right,f).normalize();}const reverse=navigationReverse??(new THREE.Vector3(0,1,0).applyQuaternion(rotation).z<0?-1:1);rotation.premultiply(new THREE.Quaternion().setFromAxisAngle(pitchAxis,-dy*sensitivity));rotation.premultiply(new THREE.Quaternion().setFromAxisAngle(z,-dx*sensitivity*reverse));rotation.normalize();}
   else if(kind==='pan'){const factor=2*distance/(rect.width*1.3888888359069824);target.add(new THREE.Vector3(-dx*factor,dy*factor,0).applyQuaternion(rotation));}
   else if(kind==='zoom')distance=THREE.MathUtils.clamp(distance*(dx>0?1.2:1/1.2),.15,3000);
   viewChanged=true;layout();onView?.(kind,dx,dy);},
  hit(clientX,clientY,{topOnly=false}={}){if(!mesh)return false;const bounds=canvas.getBoundingClientRect();cursor.set((clientX-bounds.left)/bounds.width*2-1,-(clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(cursor,camera);const hit=raycaster.intersectObject(mesh)[0];if(!hit)return false;return !topOnly||hit.face.normal.z>.99;},
  isViewport(x,y){return rect&&x>=rect.left&&x<=rect.right&&y>=rect.visibleY&&y<=rect.y+rect.height;},
  previewField(key,value){if(!state||!Number.isFinite(value))return;state.values[key]=value;rebuild();},
  getCameraChanged:()=>viewChanged,
  dispose(){disposed=true;cancelAnimationFrame(queued);clearGroup(model);clearGroup(grid);renderer.dispose();canvas.remove();label.remove();gizmo.remove();topButton.remove();cursorIcon.remove();selectionTarget.remove();}
 };
}
