import {createZoomPractice} from './navigation-state.js';
import {createViewCube,viewDirections} from './view-cube.js';
import * as THREE from '../../shared/vendor/three.module.js';
import {OrbitControls} from '../../shared/vendor/OrbitControls.js';
import {STLLoader} from '../../shared/vendor/STLLoader.js';

// Adapter owns software state and rendering; the teaching engine owns progress and feedback.
export async function createBambuSimulator({container,lesson,api}){
 const response=await fetch(new URL('./interface.html?v=rotation-retry-1',import.meta.url));if(!response.ok)throw new Error('Simulator interface unavailable');
 container.innerHTML=await response.text();
 const $=selector=>container.querySelector(selector),asset=name=>new URL(`./assets/${name}`,import.meta.url).href;
 container.querySelectorAll('img[src]').forEach(img=>img.src=new URL(img.getAttribute('src'),import.meta.url).href);
 let step={simulation:{action:'select'},task:''},context={isCompleted:()=>false,completedSteps:()=>[]},paused=false;
 let loaded=false,ready=false,scene,camera,renderer,controls,mesh,resizeObserver,scaleObserver,cube,manipulation,workflow;
 const plateControlMeshes=[];
 let startPosition,startTarget,startAngle,zoomPractice,stepReady=false,resetting=false;
 const mode=()=>step.simulation.action,isEditing=()=>!!step.simulation.editing,isNav=()=>['orbit','pan','zoom','free'].includes(mode());
 const finish=()=>api.complete(),mistake=(message,region)=>api.retry(message,region);
 const renderScene=()=>{if(renderer&&camera){camera.updateMatrixWorld();manipulation?.draw();renderer.render(scene,camera);manipulation?.renderSelection();}cube?.update();};
 function configureControls(){if(!controls)return;const id=mode();controls.enabled=loaded&&(isNav()||isEditing()&&mode()!=='object-select')&&!paused;controls.enableRotate=isEditing()||['orbit','free'].includes(id);controls.enablePan=isEditing()||['pan','free'].includes(id);controls.enableZoom=isEditing()||['zoom','free'].includes(id);controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.PAN};}
 function refreshState(){
   const state=Object.assign({},lesson.initialState,...context.completedSteps().map(s=>s.simulation?.effects||{}));
   const visible=!!state.modelVisible;mesh.visible=visible;
   $('.filename').textContent=visible?`* ${lesson.model.name.replace(/\.stl$/i,'')}`:'Untitled';$('.object-info').hidden=!visible;
   $('#scene').setAttribute('aria-label',visible?'Interactive 3D Benchy model':'Empty 3D build plate');
   $('#viewport').setAttribute('aria-label',visible?'3D build plate with Benchy. Camera controls are enabled during navigation steps.':'Empty 3D build plate. Add a model to begin.');
   const config=step.simulation;setStudioView(context.isCompleted()?(config.viewAfter||config.view):(config.viewBefore||config.view));workflow?.refreshState();renderScene();
 }
 function setStep(nextStep,nextContext){
   stepReady=false;cube?.cancel();step=nextStep;context=nextContext;paused=false;
   if($('#import-dialog').open)$('#import-dialog').close();
   container.querySelectorAll('.studio button').forEach(el=>el.disabled=true);
   $('#toolbar').setAttribute('aria-disabled',String(step.simulation.target!=='toolbar'&&!isEditing()));$('#toolbar').tabIndex=step.simulation.target==='toolbar'?0:-1;
   $('#import-model').hidden=mode()!=='import';
   const target=$('#'+step.simulation.target);if(target&&!isNav())target.disabled=false;
   $('#viewport').classList.toggle('navigation',isNav());$('#viewport').classList.toggle('object-editing',isEditing());$('#viewport').tabIndex=isNav()||isEditing()?0:-1;$('#gesture-hint').textContent=step.simulation.hint;
   refreshState();manipulation?.setStep(step,context);configureControls();cube.cancel();if(step.simulation.camera==='close')resetView(true);if(mode()==='free')$('#view-home').disabled=false;if(step.simulation.camera==='object'){resetView(true);camera.position.set(260,300,420);controls.target.set(8,22,5);controls.update();}snapshot();workflow?.setStep(step,context);stepReady=true;renderScene();
   if(mode()==='view'&&context.isCompleted()&&viewDirections[step.simulation.selectedView])cube.snap(viewDirections[step.simulation.selectedView],step.simulation.selectedView,true);
   api.guideChanged();
 }
 function getGuide(){
   if(workflow)return workflow.getGuide();
   const scale=$('#studio').getBoundingClientRect().width/1582;
   if(!$('#import-model').hidden){const slot=$('#toolbar > span:first-child').getBoundingClientRect(),base=$('.viewport-wrap').getBoundingClientRect();Object.assign($('#import-model').style,{left:(slot.left-base.left)/scale+'px',top:(slot.top-base.top)/scale+'px',width:slot.width/scale+'px',height:slot.height/scale+'px'});}
   if(!loaded||context.isCompleted()||isNav())return null;
   if(isEditing()){const target=manipulation?.getTarget();return target?{target,parent:$('#studio'),scale,anchorY:mode()==='object-select'?target.getBoundingClientRect().top+target.getBoundingClientRect().height*.5:undefined}:null;}
   const dialogOpen=$('#import-dialog').open,target=dialogOpen?($('#confirm-import').disabled?$('#benchy-file'):$('#confirm-import')):$('#'+step.simulation.target);
   if(!target)return null;const rect=target.getBoundingClientRect();
   return {target,parent:dialogOpen?$('#import-dialog'):$('#studio'),above:mode()==='view',scale:dialogOpen?1:scale,anchorY:dialogOpen?undefined:['printer','filament','process'].includes(step.simulation.target)?rect.top+33*scale:step.simulation.target==='plate-hotspot'?rect.top+rect.height*.42:undefined};
 }
 $('#toolbar').addEventListener('keydown',e=>{if(step.simulation.target==='toolbar'&&['Enter',' '].includes(e.key)){e.preventDefault();finish();}});
 const targetIds=new Set(lesson.steps.map(s=>s.simulation?.target).filter(Boolean));
 for(const targetId of targetIds){const target=$('#'+targetId);target?.addEventListener('click',()=>{
   if(step.simulation.workflow||isEditing()||mode()==='view'||step.simulation.target!==targetId||!loaded||context.isCompleted())return;
   if(mode()==='import'){$('#benchy-file').setAttribute('aria-pressed','false');$('#import-filename').value='';$('#confirm-import').disabled=true;$('#import-dialog').showModal();api.feedback(`Select ${lesson.model.name} in the simulated file picker, then choose Open.`);api.guideChanged();return;}finish();
 });}
 $('#studio').addEventListener('pointerdown',e=>{if(!loaded||context.isCompleted()||workflow?.handles(e.target)||e.target.closest('.active-target')||e.target.closest('#viewport')&&(isNav()||isEditing()||mode()==='view')||isEditing()&&manipulation?.handles(e.target))return;mistake(`Try the current task: ${step.task}`);},true);
 $('#benchy-file').addEventListener('click',()=>{$('#benchy-file').setAttribute('aria-pressed','true');$('#import-filename').value=lesson.model.name;$('#confirm-import').disabled=false;api.guideChanged();});
 $('#confirm-import').addEventListener('click',()=>{if($('#import-filename').value!==lesson.model.name)return;$('#import-dialog').close();finish();});
 $('#import-dialog').addEventListener('close',()=>api.guideChanged());
 $('#import-dialog').addEventListener('pointerdown',e=>{const r=$('#confirm-import').getBoundingClientRect();if($('#confirm-import').disabled&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)mistake(`Select ${lesson.model.name} first, then choose Open.`,$('#import-dialog'));},true);
function resetView(close=false){resetting=true;controls.target.set(0,12,0);camera.position.set(0,close?450:900,close?550:1100);camera.zoom=1;camera.updateProjectionMatrix();controls.update();resetting=false;}
function snapshot(){startPosition=camera.position.clone();startTarget=controls.target.clone();startAngle=controls.getAzimuthalAngle();zoomPractice=createZoomPractice(camera.position.distanceTo(controls.target));}
function trackCamera(){if(!stepReady||resetting||!loaded)return;const id=mode();
  if(id==='zoom')trackZoom(camera.position.distanceTo(controls.target));
  if(id==='orbit'&&(Math.abs(controls.getAzimuthalAngle()-startAngle)>.32||camera.position.distanceTo(startPosition)>45))finish();
  if(id==='pan'&&controls.target.distanceTo(startTarget)>12)finish();
}
function trackZoom(distance){
 if(mode()!=='zoom'||context.isCompleted()||!zoomPractice)return;
 const result=zoomPractice.update(distance);
 if(result.complete)finish();else if(result.changed)api.partial(result.zoomIn?'You zoomed in. Now reverse your scroll or pinch your fingers together to zoom out.':'You zoomed out. Now reverse your scroll or spread your fingers apart to zoom in.',{title:'Good! One direction done.'});
}
function practiceAction(action){if(workflow?.perform(action))return;if(isEditing()){manipulation?.perform(action);return;}if(!loaded||!ready||!isNav()||paused)return;const id=mode();
  if(action==='reset'&&['reset','free'].includes(id)){resetView(false);if(id==='reset')finish();return;}
  if(action.startsWith('orbit')&&['orbit','free'].includes(id)){
    const offset=camera.position.clone().sub(controls.target),sphere=new THREE.Spherical().setFromVector3(offset);sphere.theta+=action==='orbit-left'?.42:-.42;camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere));controls.update();
  }
  if(action.startsWith('pan')&&['pan','free'].includes(id)){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0).multiplyScalar(action==='pan-left'?-18:18);controls.target.add(right);camera.position.add(right);controls.update();}
  if(action.startsWith('zoom')&&['zoom','free'].includes(id)){const before=camera.position.distanceTo(controls.target);const distance=THREE.MathUtils.clamp(before*(action==='zoom-in'?.8:1.25),220,3000);camera.position.sub(controls.target).setLength(distance).add(controls.target);controls.update();}
  trackCamera();
}
$('#viewport').addEventListener('keydown',e=>{if(isEditing()||workflow?.handles(e.target))return;const id=mode();let a=null;if(['orbit','free'].includes(id)&&e.key==='ArrowLeft')a='orbit-left';if(['orbit','free'].includes(id)&&e.key==='ArrowRight')a='orbit-right';if(id==='pan'&&e.key==='ArrowLeft')a='pan-left';if(id==='pan'&&e.key==='ArrowRight')a='pan-right';if(['reset','free'].includes(id)&&e.key==='Home')a='reset';if(a){e.preventDefault();practiceAction(a);return;}
  if(!loaded)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)&&!(['ArrowUp','ArrowDown'].includes(e.key)&&['orbit','pan','free'].includes(id))){e.preventDefault();mistake(`For this step: ${step.task}`);return;}
  if(!['ArrowUp','ArrowDown'].includes(e.key))return;
  if(['orbit','free'].includes(id)){e.preventDefault();const sp=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));sp.phi=THREE.MathUtils.clamp(sp.phi+(e.key==='ArrowUp'?-.3:.3),.1,1.48);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp));controls.update();trackCamera();}
  if(id==='pan'){e.preventDefault();const v=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1).multiplyScalar(e.key==='ArrowUp'?18:-18);controls.target.add(v);camera.position.add(v);controls.update();trackCamera();}
});
async function init(){
  const canvas=$('#scene');scene=new THREE.Scene();scene.background=new THREE.Color('#e6e6e6');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  camera=new THREE.PerspectiveCamera(20,1,.1,10000);
  // Attach the guard before OrbitControls: in Bambu Studio, left-drag starts in empty space.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let gesture=null;
  canvas.addEventListener('pointerdown',e=>{
    if(!loaded||!isNav())return;$('#viewport').focus({preventScroll:true});
    gesture={x:e.clientX,y:e.clientY,button:e.button,pointerType:e.pointerType,warned:false};
    const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    if(raycaster.intersectObjects(plateControlMeshes).length){e.stopImmediatePropagation();gesture=null;mistake('Plate tools are disabled. Practice moving your view in the empty area beside the model.');return;}
    if(e.pointerType!=='touch'&&e.button===0&&['orbit','free'].includes(mode())&&raycaster.intersectObject(mesh).length){e.stopImmediatePropagation();gesture=null;mistake('Start your left-drag on empty space beside Benchy. Model editing is disabled.');}
  },true);
  canvas.addEventListener('pointermove',e=>{if(!gesture||gesture.pointerType==='touch'||gesture.warned||Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<7)return;const id=mode(),valid=id==='free'||id==='orbit'&&gesture.button===0||id==='pan'&&[1,2].includes(gesture.button);if(!valid){gesture.warned=true;mistake(`For this step: ${step.task}`);}},true);
  canvas.addEventListener('pointerup',()=>gesture=null);canvas.addEventListener('pointercancel',()=>gesture=null);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.minDistance=220;controls.maxDistance=3000;controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI;controls.zoomSpeed=1;controls.rotateSpeed=1;controls.screenSpacePanning=true;
  controls.addEventListener('change',()=>{renderScene();trackCamera();});
  canvas.addEventListener('wheel',e=>{if(!loaded)return;if(isNav()&&!controls.enableZoom){e.preventDefault();mistake(`For this step: ${step.task}`);return;}if(!controls.enableZoom)return;},{capture:true,passive:false});
  canvas.addEventListener('contextmenu',e=>{if(isNav())e.preventDefault();});
  scene.add(new THREE.HemisphereLight(0xffffff,0x646c68,1.3));const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-100,250,180);scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(100,80,-150);scene.add(fill);
  const bed=new THREE.Mesh(new THREE.BoxGeometry(256,2.5,256),new THREE.MeshStandardMaterial({color:0x464c49,roughness:.94}));bed.position.y=-1.5;scene.add(bed);
  const grid=new THREE.GridHelper(256,26,0x858d86,0x747c76);grid.position.y=-.15;scene.add(grid);
  const rim=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(256,2.5,256)),new THREE.LineBasicMaterial({color:0x222c26}));rim.position.y=-1.5;scene.add(rim);
  // Plate tools share the build plate's plane, so perspective and zoom stay aligned.
  const iconNames=['plate_close_ban','plate_orient','plate_arrange','plate_unlocked','plate_settings','plate_set_filament_map'];
  const iconTextures=await Promise.all(iconNames.map(name=>new THREE.TextureLoader().loadAsync(asset(`${name}.svg`))));
  iconTextures.forEach((map,i)=>{map.colorSpace=THREE.SRGBColorSpace;const icon=new THREE.Mesh(new THREE.PlaneGeometry(17,17),new THREE.MeshBasicMaterial({map,transparent:true,side:THREE.DoubleSide,depthWrite:false}));icon.rotation.x=-Math.PI/2;icon.position.set(140,.1,-116+i*21);scene.add(icon);plateControlMeshes.push(icon);});
  const numberCanvas=document.createElement('canvas');numberCanvas.width=128;numberCanvas.height=80;const numberContext=numberCanvas.getContext('2d');numberContext.font='bold 64px Arial';numberContext.fillStyle='#00ae42';numberContext.fillText('01',4,64);const numberTexture=new THREE.CanvasTexture(numberCanvas);numberTexture.colorSpace=THREE.SRGBColorSpace;const numberMesh=new THREE.Mesh(new THREE.PlaneGeometry(24,15),new THREE.MeshBasicMaterial({map:numberTexture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));numberMesh.rotation.x=-Math.PI/2;numberMesh.position.set(145,.1,120);scene.add(numberMesh);
  const plateLabel=document.createElement('canvas');plateLabel.width=1024;plateLabel.height=100;const ctx=plateLabel.getContext('2d');ctx.fillStyle='#cbd0cb';ctx.font='bold 44px Arial';ctx.textAlign='center';ctx.fillText('Bambu Textured PEI Plate',512,65);const texture=new THREE.CanvasTexture(plateLabel);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(190,18),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));label.rotation.x=-Math.PI/2;label.position.set(0,.02,-113);scene.add(label);
  const geometry=await new STLLoader().loadAsync(lesson.model.url);geometry.rotateX(-Math.PI/2);geometry.computeBoundingBox();const box=geometry.boundingBox,center=new THREE.Vector3();box.getCenter(center);geometry.translate(-center.x,-box.min.y,-center.z);geometry.computeVertexNormals();
  mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x8e8960,roughness:.65,metalness:0}));mesh.visible=false;scene.add(mesh);
  const resize=()=>{const rect=$('#viewport').getBoundingClientRect();if(rect.width<1||rect.height<1)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderScene();};resizeObserver=new ResizeObserver(resize);resizeObserver.observe($('#viewport'));
  cube=createViewCube({element:$('#view-cube'),camera,controls,canInteract:name=>!paused&&(mode()==='free'||isEditing()||mode()==='view'&&name==='Top'),onSelect:name=>{if(mode()==='view'&&name==='Top')finish();},onRetry:()=>mistake(`For this step: ${step.task}`),onChange:renderScene});
  $('#view-home').addEventListener('click',()=>{if(mode()==='free')resetView(false);});
  loaded=true;ready=true;resetView(false);resize();$('#loading').hidden=true;
}
function setStudioView(view){
  $('#home-screen').hidden=view!=='home';$('.studio-body').hidden=!['prepare','preview'].includes(view);
  $('#device-screen').hidden=view!=='device';$('#preview-details').hidden=view!=='preview';
  $('#studio').dataset.view=view;
  $('#studio').classList.toggle('showing-home',view==='home');
  for(const id of ['home-tab','prepare','preview','device']){const selected=(id==='home-tab'?'home':id)===view;$('#'+id).classList.toggle('selected',selected);$('#'+id).setAttribute('aria-selected',String(selected));}
  if(renderer)requestAnimationFrame(renderScene);
}

 function dispose(){workflow?.dispose();manipulation?.dispose();cube?.dispose();resizeObserver?.disconnect();scaleObserver?.disconnect();controls?.dispose();scene?.traverse(object=>{object.geometry?.dispose();for(const material of [object.material].flat().filter(Boolean)){Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose();});material.dispose();}});renderer?.dispose();container.replaceChildren();}
 try{await init();if(lesson.capabilities?.includes('manipulation')){const {createManipulation}=await import('./manipulation.js?v=rotation-retry-1');manipulation=createManipulation({container,mesh,camera,controls,renderer,render:renderScene,api});}if(lesson.capabilities?.includes('printing')){const {createPrintWorkflow}=await import('./printing.js?v=material-1');workflow=createPrintWorkflow({container,lesson,api,mesh,scene,camera,renderer,render:renderScene,setView:setStudioView});}}catch(error){dispose();throw error;}
 const scaleStudio=()=>{const scale=Math.min(1,container.clientWidth/1582);$('#studio').style.zoom=String(scale);if(controls){controls.rotateSpeed=1/scale;controls.panSpeed=1/scale;}api.guideChanged();};
 scaleObserver=new ResizeObserver(scaleStudio);scaleObserver.observe(container);scaleStudio();
 return {setStep,refreshState,getGuide,perform:practiceAction,getRegion:()=>$('#studio'),setPaused(value){paused=value;workflow?.setPaused(value);manipulation?.setPaused(value);configureControls();cube?.update();},setGuidance(active){$('#viewport').classList.toggle('navigation-guidance',active&&isNav());},reset(){workflow?.reset();resetView(false);},dispose};
}
