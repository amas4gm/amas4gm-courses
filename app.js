import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

const $ = s => document.querySelector(s);
const steps = [
  {id:'prepare', chapter:'01 / THE WORKSPACE', title:'Start in Prepare', text:'Prepare is where you bring in a model and get it ready for printing. Benchy is already loaded in this simulation.', task:'Select the highlighted Prepare tab.', done:'This is your main workspace for positioning models and choosing settings.'},
  {id:'preview', chapter:'01 / THE WORKSPACE', title:'Preview comes after slicing', text:'Preview shows the paths and layers the printer will follow after slicing. We will learn the layer sliders in a later tutorial.', task:'Find and select Preview. For this tour, we stay in Prepare.', done:'You found Preview. Nothing has been sliced in this simulation.'},
  {id:'device', chapter:'01 / THE WORKSPACE', title:'Meet the Device tab', text:'Device is where you connect to and monitor a printer. In the shop, check that the selected device is the one you intend to use.', task:'Find and select Device. No printer will be connected here.', done:'Device is for the actual printer. This simulation cannot send a print.'},
  {id:'printer', chapter:'01 / THE WORKSPACE', title:'Printer and build plate', text:'The Printer panel holds the printer profile, build plate, and nozzle settings. They need to match the equipment you will use.', task:'Select the highlighted Printer panel.', done:'You found the printer settings. These example values are not instructions for setting up a shop print.'},
  {id:'filament', chapter:'01 / THE WORKSPACE', title:'Choose your material here', text:'Project Filaments describes the material used by your model. Later, you will match the material and color to what is loaded in the printer.', task:'Select the Project Filaments panel.', done:'For this entry course, we will use one material. We will choose it in a later tutorial.'},
  {id:'process', chapter:'01 / THE WORKSPACE', title:'How the print is made', text:'Process contains settings such as layer height, strength, speed, and supports. You do not need to adjust these during navigation practice.', task:'Select the highlighted Process panel.', done:'These settings control how the model will be sliced. Leave them alone for this lesson.'},
  {id:'toolbar', chapter:'01 / THE WORKSPACE', title:'Tools that change the model', text:'The toolbar includes Move, Rotate, Scale, and Lay on face. Those tools change the model itself.', task:'Select the highlighted model toolbar.', done:'Remember this difference: the Rotate tool changes the model. Orbiting changes only your view.'},
  {id:'plate-hotspot', chapter:'01 / THE WORKSPACE', title:'Your 3D workspace', text:'The large area is the 3D viewport. It shows Benchy on the build plate—the surface where a print starts.', task:'Select the highlighted 3D viewport.', done:'Benchy is tipped on its side on purpose. Leave it that way: correcting its orientation belongs in the next tutorial.'},
  {id:'orbit', chapter:'02 / 3D NAVIGATION', title:'Look around Benchy', text:'Orbiting moves your viewpoint around the model. The model stays in exactly the same place and orientation.', task:'Hold the LEFT mouse button on empty space beside Benchy and drag sideways.', done:'You changed your view—not Benchy’s orientation.', hint:'LEFT drag on empty space · orbit', tools:[['orbit-left','↶ Orbit left'],['orbit-right','Orbit right ↷']], keyboard:'Left / Right arrows orbit; Up / Down arrows tilt.'},
  {id:'pan', chapter:'02 / 3D NAVIGATION', title:'Slide your view', text:'Panning moves your viewpoint sideways or up and down without turning it. Benchy stays fixed on the plate.', task:'Hold the RIGHT mouse button (or the mouse wheel button) and drag across the viewport.', done:'Your view shifted. Benchy did not move on the build plate.', hint:'RIGHT or MIDDLE drag · pan', tools:[['pan-left','← Pan left'],['pan-right','Pan right →']], keyboard:'Arrow keys pan the view.'},
  {id:'zoom', chapter:'02 / 3D NAVIGATION', title:'Get closer. Step back.', text:'Zooming changes how close the model looks. It does not change the model’s physical size.', task:'Scroll up to zoom in, then scroll down to zoom out. Complete both directions.', done:'Both directions done. Benchy stayed the same size.', hint:'Scroll UP to zoom in · DOWN to zoom out', tools:[['zoom-in','＋ Zoom in'],['zoom-out','− Zoom out']], keyboard:'+ and − keys zoom.'},
  {id:'reset', chapter:'02 / 3D NAVIGATION', title:'Find your way back', text:'If you lose your bearings, you can reset this simulation’s camera. This practice aid is outside the recreated slicer interface.', task:'Select Reset practice view to bring the plate and Benchy back into view.', done:'Back to a useful view. This reset affects only the simulation camera.', tools:[['reset','↺ Reset practice view']], keyboard:'Press Home to reset this practice view.'},
  {id:'check', chapter:'03 / QUICK CHECK', title:'View or model?', text:'You orbit, pan, and zoom around Benchy. What changed?', task:'Choose the best answer.', done:'Exactly. Navigation changes your view. Model tools change the object.'},
  {id:'complete', chapter:'TUTORIAL COMPLETE', title:'You know your way around', text:'You found the main sections of Bambu Studio and practiced orbit, pan, zoom, and a camera reset.', task:'Try these same navigation actions in Bambu Studio. Start left-dragging on empty space beside the model.', done:'This completes Tutorial 01 only. It does not qualify you to print independently yet.', hint:'Free camera practice · model editing remains disabled', tools:[['reset','↺ Reset practice view'],['orbit-left','↶ Orbit'],['pan-right','Pan →'],['zoom-in','＋ Zoom'],['zoom-out','− Zoom']]}
];
const storageKey='amas-bambu-tutorial-01-v2';
let completed=new Set(), index=0, loaded=false, ready=false, scene, camera, renderer, controls, mesh;
let startPosition, startTarget, startAngle, zoomIn=false, zoomOut=false, stepReady=false, resetting=false;
try { const saved=JSON.parse(localStorage.getItem(storageKey)); if(saved && Array.isArray(saved.completed)){completed=new Set(saved.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<steps.length-1));index=Math.max(0,Math.min(steps.length-1,Number(saved.index)||0,completed.size));}} catch {}
const navigationIds=['orbit','pan','zoom','reset','complete'];
const isNav=()=>navigationIds.includes(steps[index].id);
function persist(){try{localStorage.setItem(storageKey,JSON.stringify({index,completed:[...completed]}));}catch{}}
function finish(message){completed.add(index);$('#feedback').textContent=message||steps[index].done;$('#next').disabled=!loaded;updateProgress();persist();}
function updateProgress(){const n=steps.length-1;$('#progress').max=n;$('#progress').value=completed.size;$('#percent').textContent=`${Math.round(completed.size/n*100)}%`;$('#step-count').textContent=index===n?'Practice complete':`STEP ${String(index+1).padStart(2,'0')} OF ${n}`;}
function go(next,focus=true){index=Math.max(0,Math.min(steps.length-1,next));renderStep();persist();if(focus)$('#lesson-title').focus({preventScroll:true});}
function renderStep(){
  stepReady=false;const s=steps[index];
  document.querySelectorAll('.active-target').forEach(el=>el.classList.remove('active-target'));
  document.querySelectorAll('.studio button').forEach(el=>{el.disabled=true;el.removeAttribute('aria-current');});
  $('#chapter').textContent=s.chapter;$('#lesson-title').textContent=s.title;$('#lesson-text').textContent=s.text;$('#task').textContent=s.task;
  $('#feedback').textContent=completed.has(index)?s.done:'';$('#back').disabled=index===0;
  $('#next').disabled=!loaded||!completed.has(index);$('#next').hidden=s.id==='complete';
  $('#next').textContent=s.id==='check'?'Finish tutorial →':'Continue →';
  $('.lesson-panel').classList.toggle('completed',s.id==='complete');
  $('#viewport').classList.toggle('navigation',isNav());$('#viewport').tabIndex=isNav()?0:-1;
  $('#gesture-hint').textContent=s.hint||'';
  $('#control-status').textContent=isNav()?'Only camera navigation is enabled':'Only the highlighted area is active';
  const target=document.getElementById(s.id);if(target&&!isNav()){target.classList.add('active-target');target.disabled=!loaded;target.setAttribute('aria-current','step');}
  $('#practice-tools').hidden=!s.tools;$('#practice-buttons').replaceChildren();
  for(const [action,label] of s.tools||[]){const b=document.createElement('button');b.textContent=label;b.dataset.action=action;b.disabled=!loaded;b.addEventListener('click',()=>practiceAction(action));$('#practice-buttons').append(b);}
  if(s.keyboard){const note=document.createElement('p');note.className='small-note';note.textContent=`Focus the 3D view: ${s.keyboard} Touch: use the practice buttons above.`;$('#practice-buttons').append(note);}
  $('#quiz').hidden=s.id!=='check';$('#quiz').replaceChildren();
  if(s.id==='check'){
    ['The camera view changed. Benchy stayed fixed.','Benchy rotated on the plate.','Benchy became physically larger.'].forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.addEventListener('click',()=>{b.classList.add(i===0?'correct':'wrong');if(i===0)finish();else $('#feedback').textContent='Try again. Orbit, pan, and zoom move the camera. They do not edit the model.';});$('#quiz').append(b);});
  }
  $('#lesson-map').replaceChildren();steps.forEach((item,i)=>{const li=document.createElement('li'),b=document.createElement('button');b.textContent=(completed.has(i)?'✓ ':'')+item.title;b.classList.toggle('current',i===index);b.disabled=i>completed.size;b.addEventListener('click',()=>go(i));li.append(b);$('#lesson-map').append(li);});
  if(s.id==='complete')$('#feedback').textContent=s.done;
  if(ready){configureControls();if(['orbit','pan','zoom'].includes(s.id))resetView(true);if(s.id==='reset'){resetView(true);camera.position.multiplyScalar(1.45);controls.target.add(new THREE.Vector3(35,0,15));controls.update();}snapshot();}
  updateProgress();stepReady=true;
}
for(const s of steps.filter(s=>document.getElementById(s.id))){document.getElementById(s.id).addEventListener('click',()=>{if(steps[index].id===s.id&&loaded)finish();});}
$('#next').addEventListener('click',()=>{if(completed.has(index)&&loaded)go(index+1);});
$('#back').addEventListener('click',()=>go(index-1));
$('#restart').addEventListener('click',()=>{completed.clear();go(0);if(ready)resetView(false);});
function configureControls(){const id=steps[index].id;controls.enabled=loaded&&isNav()&&id!=='reset';controls.enableRotate=['orbit','complete'].includes(id);controls.enablePan=['pan','complete'].includes(id);controls.enableZoom=['zoom','complete'].includes(id);controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.PAN};}
function resetView(close=false){resetting=true;controls.target.set(0,12,0);camera.position.set(0,close?450:900,close?550:1100);camera.zoom=1;camera.updateProjectionMatrix();controls.update();resetting=false;}
function snapshot(){startPosition=camera.position.clone();startTarget=controls.target.clone();startAngle=controls.getAzimuthalAngle();zoomIn=false;zoomOut=false;}
function trackCamera(){if(!stepReady||resetting||!loaded)return;const id=steps[index].id;
  if(id==='orbit'&&(Math.abs(controls.getAzimuthalAngle()-startAngle)>.32||camera.position.distanceTo(startPosition)>45))finish();
  if(id==='pan'&&controls.target.distanceTo(startTarget)>12)finish();
}
function trackZoom(before,after){if(steps[index].id!=='zoom')return;if(after<before*.995)zoomIn=true;if(after>before*1.005)zoomOut=true;if(zoomIn&&zoomOut)finish();else $('#feedback').textContent=zoomIn?'Zoom in ✓ · Now zoom out.':'Zoom out ✓ · Now zoom in.';}
function practiceAction(action){if(!loaded||!ready||!isNav())return;const id=steps[index].id;
  if(action==='reset'&&['reset','complete'].includes(id)){resetView(false);if(id==='reset')finish();return;}
  if(action.startsWith('orbit')&&['orbit','complete'].includes(id)){
    const offset=camera.position.clone().sub(controls.target),sphere=new THREE.Spherical().setFromVector3(offset);sphere.theta+=action==='orbit-left'?.42:-.42;camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere));controls.update();
  }
  if(action.startsWith('pan')&&['pan','complete'].includes(id)){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0).multiplyScalar(action==='pan-left'?-18:18);controls.target.add(right);camera.position.add(right);controls.update();}
  if(action.startsWith('zoom')&&['zoom','complete'].includes(id)){const before=camera.position.distanceTo(controls.target);const distance=THREE.MathUtils.clamp(before*(action==='zoom-in'?.8:1.25),220,3000);camera.position.sub(controls.target).setLength(distance).add(controls.target);controls.update();trackZoom(before,distance);}
  trackCamera();
}
$('#viewport').addEventListener('keydown',e=>{const id=steps[index].id;let a=null;if(['orbit','complete'].includes(id)&&e.key==='ArrowLeft')a='orbit-left';if(['orbit','complete'].includes(id)&&e.key==='ArrowRight')a='orbit-right';if(id==='pan'&&e.key==='ArrowLeft')a='pan-left';if(id==='pan'&&e.key==='ArrowRight')a='pan-right';if(['zoom','complete'].includes(id)&&['+','='].includes(e.key))a='zoom-in';if(['zoom','complete'].includes(id)&&e.key==='-')a='zoom-out';if(['reset','complete'].includes(id)&&e.key==='Home')a='reset';if(a){e.preventDefault();practiceAction(a);return;}
  if(!loaded||!['ArrowUp','ArrowDown'].includes(e.key))return;
  if(['orbit','complete'].includes(id)){e.preventDefault();const sp=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));sp.phi=THREE.MathUtils.clamp(sp.phi+(e.key==='ArrowUp'?-.3:.3),.1,1.48);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp));controls.update();trackCamera();}
  if(id==='pan'){e.preventDefault();const v=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1).multiplyScalar(e.key==='ArrowUp'?18:-18);controls.target.add(v);camera.position.add(v);controls.update();trackCamera();}
});
async function init(){
  const canvas=$('#scene');scene=new THREE.Scene();scene.background=new THREE.Color('#e6e6e6');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  camera=new THREE.PerspectiveCamera(20,1,.1,10000);
  // Attach the guard before OrbitControls: in Bambu Studio, left-drag starts in empty space.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  canvas.addEventListener('pointerdown',e=>{if(!loaded||!isNav())return;$('#viewport').focus({preventScroll:true});if(e.button!==0||!['orbit','complete'].includes(steps[index].id))return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObject(mesh).length){e.stopImmediatePropagation();$('#feedback').textContent='Start your left-drag on empty space beside Benchy. Model editing is disabled.';}},true);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.minDistance=220;controls.maxDistance=3000;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI/2-.02;controls.zoomSpeed=1;controls.rotateSpeed=1;controls.screenSpacePanning=true;
  controls.addEventListener('change',()=>{renderScene();trackCamera();});
  canvas.addEventListener('wheel',e=>{if(!loaded||!controls.enableZoom)return;const before=camera.position.distanceTo(controls.target);requestAnimationFrame(()=>trackZoom(before,camera.position.distanceTo(controls.target)));},{capture:true,passive:true});
  canvas.addEventListener('contextmenu',e=>{if(isNav())e.preventDefault();});
  scene.add(new THREE.HemisphereLight(0xffffff,0x646c68,1.3));const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-100,250,180);scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(100,80,-150);scene.add(fill);
  const bed=new THREE.Mesh(new THREE.BoxGeometry(256,2.5,256),new THREE.MeshStandardMaterial({color:0x464c49,roughness:.94}));bed.position.y=-1.5;scene.add(bed);
  const grid=new THREE.GridHelper(256,26,0x858d86,0x747c76);grid.position.y=-.15;scene.add(grid);
  const rim=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(256,2.5,256)),new THREE.LineBasicMaterial({color:0x222c26}));rim.position.y=-1.5;scene.add(rim);
  const plateLabel=document.createElement('canvas');plateLabel.width=1024;plateLabel.height=100;const ctx=plateLabel.getContext('2d');ctx.fillStyle='#cbd0cb';ctx.font='bold 44px Arial';ctx.textAlign='center';ctx.fillText('Bambu Textured PEI Plate',512,65);const texture=new THREE.CanvasTexture(plateLabel);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(190,18),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));label.rotation.x=-Math.PI/2;label.position.set(0,.02,-113);scene.add(label);
  const geometry=await new STLLoader().loadAsync('Benchy.stl');geometry.rotateX(-Math.PI/2);geometry.computeBoundingBox();const box=geometry.boundingBox,center=new THREE.Vector3();box.getCenter(center);geometry.translate(-center.x,-box.min.y,-center.z);geometry.computeVertexNormals();
  mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x8e8960,roughness:.65,metalness:0}));scene.add(mesh);
  const resize=()=>{const rect=$('#viewport').getBoundingClientRect();if(rect.width<1||rect.height<1)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderScene();};new ResizeObserver(resize).observe($('#viewport'));
  loaded=true;ready=true;resetView(isNav());snapshot();resize();$('#loading').hidden=true;renderStep();
  // Read-only diagnostics for local QA; no application actions or printer access.
  window.simulationState=()=>({step:steps[index].id,completed:[...completed],modelTriangles:geometry.attributes.position.count/3,modelPosition:mesh.position.toArray(),modelRotation:mesh.rotation.toArray().slice(0,3),cameraPosition:camera.position.toArray(),cameraTarget:controls.target.toArray(),rotate:controls.enableRotate,pan:controls.enablePan,zoom:controls.enableZoom});
}
renderStep();init().catch(error=>{console.error(error);$('#loading').replaceChildren();const p=document.createElement('p');p.textContent='The 3D practice could not load. Use a browser with WebGL enabled and reload this page.';const b=document.createElement('button');b.textContent='Retry loading';b.className='primary';b.addEventListener('click',()=>location.reload());$('#loading').append(p,b);$('#feedback').textContent='No progress is lost. If this persists, try another browser or device.';});

const scaleStudio=()=>{const wrap=document.querySelector('.sim-wrap');const scale=Math.min(1,wrap.clientWidth/1582);document.querySelector('.studio').style.zoom=String(scale);if(controls){controls.rotateSpeed=1/scale;controls.panSpeed=1/scale;}};new ResizeObserver(scaleStudio).observe(document.querySelector('.sim-wrap'));scaleStudio();


function renderScene(){
 if(!renderer||!camera)return;
 renderer.render(scene,camera);
 for(const [selector,point] of [['.plate-controls',new THREE.Vector3(137,0,-112)],['.plate-number',new THREE.Vector3(137,0,120)]]){
  const p=point.project(camera), el=document.querySelector(selector);
  el.style.left=((p.x+1)/2*100)+'%';el.style.top=((-p.y+1)/2*100)+'%';el.style.right='auto';el.style.bottom='auto';
 }
}
