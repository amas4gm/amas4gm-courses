import * as T from '../../shared/vendor/three.module.js';
import {buildLab} from './models.js?v=lab-1';
import {createLabState,applyLabAction,devices} from './state.js';
export async function createLabSimulator({container,lesson,api}){
 container.innerHTML=`<div id="lab" role="group" aria-label="Interactive 3D lab with Steve and Candus"><canvas aria-label="3D lab scene"></canvas><div class="lab-heading"><small>AMAS4GM · PHYSICAL PRACTICE</small><h3 id="lab-title">Choose your printer</h3><p id="lab-subtitle">Two X2D printers. One shared workstation.</p></div><div class="lab-station" id="lab-station" role="status">No printer selected</div><div class="lab-animation" hidden role="status"><span></span><progress max="1" value="0" aria-label="Action animation progress"></progress></div></div>`;
 container.closest('.sim-wrap')?.setAttribute('aria-label','Physical lab training simulation');
 const $=s=>container.querySelector(s),root=$('#lab'),canvas=$('canvas'),listeners=new AbortController();
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new T.Scene();scene.background=new T.Color(0xe8e9e0);scene.add(new T.HemisphereLight(0xfff9ef,0x778d7b,2.8));
 const light=new T.DirectionalLight(0xfff4df,3.2);light.position.set(-7,18,12);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-18,right:18,top:16,bottom:-14,near:.1,far:60});light.shadow.bias=-.001;scene.add(light);
 const fill=new T.DirectionalLight(0xc3dfeb,1.2);fill.position.set(10,8,-5);scene.add(fill);
 const camera=new T.PerspectiveCamera(38,1,.1,150);const target=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
 const lab=buildLab(scene),key=`amas-lab-device:${lesson.id}`;let chosen='Steve';try{const stored=localStorage.getItem(key);if(devices.includes(stored))chosen=stored;}catch{}
 let step,context,state=createLabState(),paused=false,busy=false,frame=0,disposed=false,guided=true,filament=null;
 const hotspots=new Map(),anchors=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const actionNames={Steve:'Choose Steve',Candus:'Choose Candus','left-tab':'Unlock left tab','right-tab':'Unlock right tab',roll:'Place green roll in bay 1',intake:'Press intake backward',filament:'Insert filament end'};
 for(const [action,label] of Object.entries(actionNames)){const button=document.createElement('button');button.className='lab-hotspot';button.dataset.action=action;button.setAttribute('aria-label',label);button.innerHTML=`<span>${label}</span>`;button.hidden=true;button.addEventListener('click',()=>act(action),{signal:listeners.signal});root.append(button);hotspots.set(action,button);}
 for(const name of devices){const m=lab.machines[name];m.group.userData.action=name;m.tabs.forEach((tab,i)=>tab.userData.action=i?'right-tab':'left-tab');m.intake.userData.action='intake';anchors.set(name,m.tagTarget);}
 lab.spare.userData.action='roll';
 const current=()=>lab.machines[chosen];
 function available(){if(!step||paused||busy||context.isCompleted()||step.terminal)return [];return {choose:devices,unlock:['left-tab','right-tab'].filter((_,i)=>!state.tabs[i]),place:['roll'],press:['intake'],insert:['filament']}[state.phase]||[];}
 function updateHotspots(){scene.updateMatrixWorld(true);camera.updateMatrixWorld();const actions=available(),rect=root.getBoundingClientRect();
  for(const [action,b] of hotspots){const active=actions.includes(action);b.hidden=!active;b.disabled=!active;b.classList.toggle('guided',active&&guided);if(!active)continue;const p=anchors.get(action)?.getWorldPosition(new T.Vector3()).project(camera);if(!p)continue;b.style.left=`${(p.x+1)*rect.width/2}px`;b.style.top=`${(1-p.y)*rect.height/2}px`;}
 }
 function render(){if(disposed)return;camera.lookAt(target);renderer.render(scene,camera);updateHotspots();api.guideChanged();}
 function cameraPose(){const m=current(),x=m.group.position.x,phase=state.phase;let pos,aim;
  if(phase==='choose'){pos=[14,13.5,28];aim=[-1.8,4,0];}
  else if(phase==='place'){pos=[x+9,13,19];aim=[x+1.6,4.8,0];}
  else if(['press','insert','complete'].includes(phase)){pos=[x+2.7,11.7,8];aim=[x-1.25,8,.6];}
  else{pos=[x+5,12.4,12];aim=[x,8,0];}
  const aspect=root.clientWidth/root.clientHeight;if(aspect<1.1){const a=new T.Vector3(...aim),p=new T.Vector3(...pos);p.sub(a).multiplyScalar(1.25/aspect).add(a);pos=p.toArray();}
  camera.position.set(...pos);target.set(...aim);
 }
 function drawFilament(amount=0){if(filament){filament.geometry.dispose();filament.removeFromParent();filament=null;}if(!state.roll)return;
  const end=new T.Vector3(-1.86,1.37,1.9).lerp(new T.Vector3(-1.86,.99,1.67),amount);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-1.86,2.05,.73),new T.Vector3(-1.86,1.75,1.05),end]);
  filament=new T.Mesh(new T.TubeGeometry(curve,24,.025,7,false),lab.materials.green);filament.userData.action='filament';current().ams.add(filament);current().end.position.copy(end);
 }
 function syncScene(){
  const m=current();for(const name of devices){const machine=lab.machines[name];machine.group.visible=state.phase==='choose'||name===chosen;machine.roll.visible=false;machine.lid.rotation.x=0;machine.tabs.forEach(t=>t.rotation.y=0);machine.intake.position.z=1.74;}
  m.tabs.forEach((t,i)=>t.rotation.y=state.tabs[i]?(i?-.95:.95):0);m.lid.rotation.x=state.lid?-1.32:0;m.roll.visible=state.roll;m.roll.position.set(-1.86,1.6,0);m.roll.rotation.x=0;m.intake.position.z=state.pressed?1.5:1.74;
  lab.spare.visible=!state.roll;lab.spare.position.set(state.phase==='choose'?9:m.group.position.x+4.6,1.08,1.2);lab.spare.rotation.x=0;
  anchors.set('left-tab',m.tabs[0]);anchors.set('right-tab',m.tabs[1]);anchors.set('roll',lab.spare);anchors.set('intake',m.intake);anchors.set('filament',m.end);drawFilament(state.fed?1:0);
  $('#lab-title').textContent=state.phase==='choose'?'Choose your printer':`${chosen} · AMS 2 Pro`;
  $('#lab-subtitle').textContent=state.phase==='choose'?'Two X2D printers. One shared workstation.':state.fed?'Filament taken up · bay 1':state.phase==='unlock'?'Release both front locking tabs':state.phase==='place'?'Green roll → leftmost bay':state.phase==='press'?'Push the white control toward the roll':'Guide the loose end into the intake';
  $('#lab-station').textContent=state.chosen?`Selected: ${chosen} / X2D · Bay 1${state.fed?' · Material installed':''}`:'Read the physical name tags';
 }
 function cancelAnimation(){cancelAnimationFrame(frame);frame=0;busy=false;$('.lab-animation').hidden=true;}
 function animate(duration,message,update,done){cancelAnimation();busy=true;$('.lab-animation').hidden=false;$('.lab-animation span').textContent=message;let elapsed=0,previous=performance.now();
  function tick(now){if(disposed)return;const dt=Math.min(100,now-previous);previous=now;if(!document.hidden&&!paused)elapsed+=dt;const t=Math.min(1,elapsed/duration);update(t);$('.lab-animation progress').value=t;render();if(t<1){frame=requestAnimationFrame(tick);return;}frame=0;busy=false;$('.lab-animation').hidden=true;done?.();render();}
  frame=requestAnimationFrame(tick);updateHotspots();
 }
 function wrong(){if(paused||busy||context.isCompleted())return;api.retry('Follow the highlighted object for this step.',root);api.partial(step.task,{title:'Try the highlighted object.',tone:'retry'});}
 function act(action){if(paused||busy)return;if(!available().includes(action)){wrong();return;}const result=applyLabAction(state,action);if(!result.accepted){wrong();return;}state=result.state;chosen=state.device;try{localStorage.setItem(key,chosen);}catch{}
  const m=current(),finish=()=>{syncScene();render();api.complete();};
  if(devices.includes(action)){syncScene();render();api.complete();return;}
  if(action.endsWith('-tab')){const i=action==='left-tab'?0:1;animate(reduced?150:450,'Releasing lid tab…',t=>{m.tabs[i].rotation.y=(i?-.95:.95)*t;},()=>{if(result.complete)animate(reduced?180:1000,'Both tabs released · opening lid…',t=>m.lid.rotation.x=-1.32*t,finish);else{syncScene();render();api.partial('One tab is unlocked. Release the other front tab to open the lid.',{title:'Good! One tab released.'});}});return;}
  if(action==='roll'){const from=lab.spare.position.clone(),to=m.ams.localToWorld(new T.Vector3(-1.86,1.6,0));animate(reduced?200:1800,'Seating the roll on bay 1 rollers…',t=>{const u=t*t*(3-2*t);lab.spare.position.lerpVectors(from,to,u);if(!reduced)lab.spare.position.y+=Math.sin(Math.PI*t)*3;},finish);return;}
  if(action==='intake'){animate(reduced?150:650,'Pressing the intake backward…',t=>m.intake.position.z=1.74-.24*t,finish);return;}
  if(action==='filament'){feed(finish);}
 }
 function feed(done){const m=current();animate(reduced?1300:5200,'The AMS is pulling filament in…',t=>{drawFilament(Math.min(1,t*4));m.intake.position.z=1.5+.24*Math.min(1,Math.max(0,t-.2)*3);if(!reduced)m.roll.rotation.x=Math.max(0,t-.2)*Math.PI*5;},done);}
 canvas.addEventListener('click',event=>{if(busy||paused)return;const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(scene.children,true);for(const hit of hits){let node=hit.object;while(node&&!node.userData.action)node=node.parent;if(node&&available().includes(node.userData.action)){act(node.userData.action);return;}}wrong();},{signal:listeners.signal});
 const observer=new ResizeObserver(()=>{const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(step)cameraPose();render();});observer.observe(root);
 return {
  setStep(next,ctx){cancelAnimation();step=next;context=ctx;state=createLabState(step.simulation.phase,ctx.isCompleted(),chosen);syncScene();cameraPose();render();},
  refreshState(){updateHotspots();},setPaused(value){paused=value;updateHotspots();},setGuidance(value){guided=value;updateHotspots();},
  getGuide(){const actions=available();return state.phase==='choose'||!actions.length?null:{target:hotspots.get(actions[0]),parent:root,above:true};},getRegion:()=>root,
  perform(action){if(action==='replay'&&step.terminal&&!busy&&!paused){state.fed=false;state.pressed=true;syncScene();feed(()=>{state.fed=true;state.pressed=false;syncScene();render();});}},
  reset(){cancelAnimation();chosen='Steve';try{localStorage.removeItem(key);}catch{}},
  dispose(){disposed=true;cancelAnimation();listeners.abort();observer.disconnect();const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){materials.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();container.replaceChildren();}
 };
}
