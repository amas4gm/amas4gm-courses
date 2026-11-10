import {meetsGoal,numericValue} from './state.js';
import {setupValue,setupReady} from './setup-state.js?v=input-sequence-1';
import {statePair,fieldRects,boundedFrame} from './native-state.js?v=input-sequence-1';
import {startModal,modalKey,modalReady,modalValue,modalCaption,visualReady} from './native-modal.js?v=input-5';
import {createLiveViewport} from './live-viewport.js?v=input-sequence-1';
import {createInputCoach} from './input-coach.js?v=input-sequence-1';
import {createInputDemo,inputDemoPlan} from './input-demo.js?v=input-sequence-1';

// Each frame contains Blender's complete, unmodified native interface. Only
// the current checkpoint's controls receive a transparent interaction layer.
export async function createBlenderSimulator({container,lesson,api}) {
 const base=new URL('./',import.meta.url),url=p=>new URL(p,base).href;
 const [manifest,reference]=await Promise.all(['assets/ui/manifest.json','native-assets/menu-reference.json'].map(async p=>{const r=await fetch(url(p)+'?v=input-sequence-1');if(!r.ok)throw Error(`Missing reference: ${p}`);return r.json();}));
 document.body.classList.add('blender-course');
 container.innerHTML=`<div class="native-controls"><span>Blender 5.2.2 LTS · native interface</span><button type="button" class="expand-native">Expand workspace</button></div><div class="native-host"><div class="native-stage" tabindex="0" role="application" aria-label="Blender practice workspace"><img class="native-frame" alt="" draggable="false"><div class="native-hotspots"></div><div class="native-menus"></div></div></div><div class="bl-follow"><strong>Follow along in real Blender · save often</strong><p class="follow-copy"></p><details><summary>Blender checkpoints and recovery</summary><p>Save your own copy before experimenting. Browser progress does not save your real Blender project.</p><div class="downloads"></div></details></div>`;
 const $=s=>container.querySelector(s),host=$('.native-host'),stage=$('.native-stage'),frame=$('.native-frame'),spots=$('.native-hotspots'),menus=$('.native-menus');
 const abort=new AbortController(),on=(el,event,fn,extra={})=>el.addEventListener(event,fn,{signal:abort.signal,...extra});
 let step,pair,paused=false,finished=false,current='',scale=1,guide=null,drag=null,navIndex=8,operator=null,dialog=false,popup=false,loadToken=0;
 let zoomDirections=new Set(),extrusionUndo=false,orientationEnabled=false,travel=0;const loaded=new Map();let pointer=[900,600],lastInput=performance.now(),readout=null,visualResult=null,shortcutInvoked=false,suppressClick=false;const valuesLayer=document.createElement('div');stage.append(valuesLayer);
 const coach=createInputCoach({stage,container,onDemonstrate:()=>demonstrate()});
 const inputDemo=createInputDemo({stage,onKey:key=>coach.pressed(key)});
 const live=await createLiveViewport({stage,frame,manifest,url,onView(kind,dx,dy){
  if(paused||finished||step?.simulation.action!==kind)return;
  if(kind==='zoom'){zoomDirections.add(Math.sign(dx));if(zoomDirections.size===2)practiceComplete();}
  else {travel+=Math.hypot(dx,dy);if(travel>60)practiceComplete();}
 },onTop(){if(!paused&&!finished&&step.simulation.action==='top')finish();},onRender:()=>api.guideChanged()});
 function preload(name){if(!manifest.states[name])throw Error(`Missing captured UI state ${name}`);if(!loaded.has(name)){const im=new Image();im.src=url(`assets/ui/${manifest.states[name].file}`);loaded.set(name,im.decode().then(()=>im));}return loaded.get(name);}
 async function show(name,{resetCamera=false}={}){const token=++loadToken,im=await preload(name);if(token!==loadToken)return false;current=name;frame.src=im.src;stage.dataset.state=name;const r=manifest.states[name];stage.style.width=`${r.width}px`;stage.style.height=`${r.height}px`;live.setFrame(name,{resetCamera});resize();return true;}
 function resize(){if(!current)return;const previousScale=scale,r=manifest.states[current];scale=host.clientWidth/2400;
  if(document.body.classList.contains('native-expanded')){const main=document.querySelector('main'),inset=main?parseFloat(getComputedStyle(main).paddingTop):0;const available=window.innerHeight-inset*2-$('.native-controls').offsetHeight-4;scale=Math.min(scale,Math.max(180,available)/r.height);}
  if(Math.abs(previousScale-scale)>.0001)inputDemo.stop();
  stage.style.left=`${(host.clientWidth-r.width*scale)/2}px`;stage.style.transform=`scale(${scale})`;host.style.height=`${r.height*scale}px`;live.resize();api.guideChanged();}
 const observer=new ResizeObserver(resize);observer.observe(host);if(document.querySelector('.lesson-panel'))observer.observe(document.querySelector('.lesson-panel'));on(window,'resize',resize);
 const unavailable=()=>{api.retry('That control is outside this step. Follow the highlighted control or the key sequence.',host);demonstrate();};
 function demonstrate(message){
  if(paused||finished||drag)return;lastInput=performance.now();
  const editing=guide?.tagName==='INPUT';
  const g=guide?.isConnected?guide.getBoundingClientRect():null,b=stage.getBoundingClientRect(),r=live.viewport()||{left:0,right:stage.clientWidth,visibleY:0,y:0,height:stage.clientHeight};
  const target=g?{x:(g.left-b.left)/scale,y:(g.top-b.top)/scale,width:g.width/scale,height:g.height/scale}:null;
  const plan=inputDemoPlan({step,target,viewport:r,operator,gesture:guide?.dataset.mouseGesture,keyboardInput:editing,undo:extrusionUndo,zoomDirections:[...zoomDirections]});
  coach.help(message||step.inputHint||'Watch the mouse and keys in order.',null,{animate:false});
  inputDemo.play(plan);
 }
 const idleTimer=setInterval(()=>{if(step&&!finished&&!paused&&!document.hidden&&!inputDemo.isPlaying()&&performance.now()-lastInput>16000){lastInput=performance.now();demonstrate();}},4000);
 function rect(el,[x,y,w,h]){Object.assign(el.style,{left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});return el;}
 function hotspot(label,box,fn,{target=false,dbl=false}={}){
  const b=rect(document.createElement('button'),box);b.className='native-hit';b.type='button';b.setAttribute('aria-label',label);b.title=label;b.dataset.mouseGesture=dbl?'double-click':'click';
  on(b,dbl?'dblclick':'click',e=>{e.stopPropagation();if(!paused&&!finished){inputDemo.stop();fn(e);}});
  if(dbl)on(b,'click',e=>{e.stopPropagation();stage.focus({preventScroll:true});api.feedback('Double-click the number to enter an exact value.');});
  spots.append(b);if(target)guide=b;return b;
 }
 function clear(){inputDemo.stop();menus.replaceChildren();valuesLayer.replaceChildren();readout?.remove();readout=null;operator=null;dialog=false;popup=false;orientationEnabled=false;}
 async function finish(name=pair[1]){if(finished||paused)return;finished=true;clear();spots.replaceChildren();guide=null;if(await show(name,{resetCamera:step.simulation.action==='frame'})){if(step.simulation.action==='setup-startup')startupConfirmation(false);api.complete();}}
 function cancel(){
  if(step.simulation.action==='setup-confirm'){dismissStartup();return;}
  coach.hint('Cancelled. The checkpoint is restored. You can try the keys or mouse again.');
  if(orientationEnabled)return finish();
  if(operator?.kind==='extrude'){clear();extrusionUndo=true;show('extrude-cancelled');api.feedback('Escape cancelled the movement, but the extrusion remains. Press Ctrl+Z to remove the new geometry.');stage.focus({preventScroll:true});return;}
  clear();show(pair[0]);buildControls();stage.focus({preventScroll:true});api.feedback('Cancelled. The starting checkpoint is restored.');
 }
 for(const name of (lesson.id==='setup-for-printing'?['printing-setup']:['cube','blank','inset','cavity','finished'])){const a=document.createElement('a');a.href=url(`assets/${name}.blend`);a.download=name==='printing-setup'?'printing-setup.blend':`desk-tray-${name}.blend`;a.textContent=name==='printing-setup'?'Printing setup scene':name==='cube'?'Start':name[0].toUpperCase()+name.slice(1);$('.downloads').append(a);}
 on($('.expand-native'),'click',()=>{const expanded=document.body.classList.toggle('native-expanded');$('.expand-native').textContent=expanded?'Return to lesson layout':'Expand workspace';(document.querySelector('.learning-layout')||container).scrollIntoView({block:'start'});resize();});
 function selectedMenuRow(row){const a=step.simulation.action;if(step.simulation.shortcutOnly&&!shortcutInvoked)return null;
  if(a==='add-cube'&&row.operator==='mesh.primitive_cube_add')return ()=>finish();
  if(a==='frame'&&row.operator==='view3d.view_selected')return ()=>finish();
  if(a==='sidebar'&&row.property==='show_region_ui')return ()=>finish();
  if(a==='apply-scale'&&row.operator==='object.transform_apply'&&row.label==='Scale')return ()=>finish();
  if(a==='edit-mode'&&row.properties?.mode==='EDIT')return ()=>finish();
  if(a==='object-mode'&&row.properties?.mode==='OBJECT')return ()=>finish();
  if(a==='setup-startup'&&row.operator==='wm.save_homefile')return ()=>finish();
  if(a==='setup-confirm'&&row.operator==='wm.save_homefile')return ()=>startupConfirmation();
  if(a==='save'&&row.operator==='wm.save_as_mainfile')return fileDialog;
  if(a==='export'&&row.operator==='wm.stl_export')return fileDialog;
  return null;
 }
 function allowedSubmenu(name){return (['setup-startup','setup-confirm'].includes(step.simulation.action)&&name==='TOPBAR_MT_file_defaults')||(step.simulation.action==='add-cube'&&name==='VIEW3D_MT_mesh_add')||(step.simulation.action==='apply-scale'&&name==='VIEW3D_MT_object_apply')||(step.simulation.action==='export'&&name==='TOPBAR_MT_file_export');}
 function openMenu(name,x,y,level=0){
  inputDemo.stop();if(!reference.menus[name])return unavailable();
  if(level===0){clear();popup=true;[x,y]=({TOPBAR_MT_file:[36,33],VIEW3D_MT_add:[372,71],VIEW3D_MT_object:[425,71],VIEW3D_MT_view:[240,71],'object.mode_set':[70,71]})[name]||[x,y];}else [...menus.children].filter(el=>Number(el.dataset.level)>=level).forEach(el=>el.remove());
  const list=document.createElement('div');list.className='native-menu';list.setAttribute('role','menu');list.dataset.level=level;list.setAttribute('aria-label',name);const rows=reference.menus[name];
  const pixels=manifest.menus[name==='object.mode_set'&&step.simulation.action==='object-mode'?'object.mode_set.edit':name],width=pixels.width,height=pixels.height,state=manifest.states[current];
  list.classList.add('captured-menu');list.style.backgroundImage=`url("${url('assets/ui/'+pixels.file)}")`;list.style.height=`${height}px`;
  Object.assign(list.style,{left:`${Math.min(x,state.width-width-4)}px`,top:`${Math.max(33,Math.min(y,state.height-height-38))}px`,width:`${width}px`});
  for(const row of rows){
   if(row.kind==='separator'){list.append(document.createElement('hr'));continue;}
   const b=document.createElement('button');b.type='button';b.className='native-menu-row';b.style.height=`${pixels.rowHeight}px`;b.setAttribute('role','menuitem');b.setAttribute('aria-label',row.label);if(row.kind==='submenu')b.setAttribute('aria-haspopup','menu');
   const icon=document.createElement('span');icon.className='native-menu-icon';if(row.icon){const img=document.createElement('img');img.src=url(`native-assets/icons/${row.icon.toLowerCase()}.svg`);img.alt='';icon.append(img);}b.append(icon);
   const label=document.createElement('span');label.textContent=row.label;b.append(label);const tail=document.createElement('span');tail.className='native-menu-tail';tail.textContent=row.kind==='submenu'?'›':row.shortcut||'';b.append(tail);
   const fn=selectedMenuRow(row),sub=allowedSubmenu(row.menu);if(fn||sub){guide=b;b.dataset.mouseTarget='true';}b.dataset.mouseGesture=sub?'hover':'click';
   const invoke=()=>{if(paused||finished)return;inputDemo.stop();if(row.kind==='submenu'){if(!sub)return unavailable();openMenu(row.menu,parseFloat(list.style.left)+width,parseFloat(list.style.top)+b.offsetTop-5,level+1);}else if(fn)fn();else unavailable();};
   on(b,'click',e=>{e.stopPropagation();invoke();});on(b,'pointerenter',()=>{if(sub)invoke();else{[...menus.children].filter(el=>Number(el.dataset.level)>level).forEach(el=>el.remove());guide=[...menus.querySelectorAll('[data-mouse-target]')].at(-1);api.guideChanged();}});
   on(b,'keydown',e=>{const buttons=[...list.querySelectorAll('button')],i=buttons.indexOf(b);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus();}else if(e.key==='ArrowRight'&&sub){e.preventDefault();invoke();menus.lastElementChild.querySelector('button')?.focus();}else if(e.key==='ArrowLeft'&&level){e.preventDefault();list.remove();guide=[...menus.querySelectorAll('[data-mouse-target]')].at(-1);api.guideChanged();menus.lastElementChild.querySelector('button')?.focus();}});
   list.append(b);
  }
  menus.append(list);list.querySelector('button')?.focus({preventScroll:true});api.guideChanged();
 }
 async function fileDialog(){clear();dialog=true;spots.replaceChildren();if(!await show(step.simulation.action==='export'?'dialog-export':'dialog-save')||!dialog)return;
  const r=manifest.states[current],filename=step.simulation.filename||'desk-tray.stl';
  const input=rect(document.createElement('input'),[372,r.height-47,r.width-779,35]);input.className='native-input filename';input.setAttribute('aria-label','File name');input.value=filename;menus.append(input);
  hotspot(step.simulation.action==='export'?'Export STL':'Save As',[r.width-391,r.height-47,182,35],()=>{if(input.value.trim()!==filename)return api.retry(`Use ${filename} for this checkpoint.`,host);finish();},{target:true});
  hotspot('Cancel',[r.width-197,r.height-47,182,35],cancel);api.guideChanged();
 }
 const fieldLabel=key=>({x:'Location X',z:'Location Z',rz:'Rotation Z',dx:'Dimensions X',dy:'Dimensions Y',dz:'Dimensions Z'})[key];
 async function rename(){clear();popup=true;spots.replaceChildren();if(!await show('rename-popup'))return;
  const input=rect(document.createElement('input'),[828,698,364,30]);input.className='native-input filename';input.setAttribute('aria-label','Object Name');input.value='Cube';menus.append(input);guide=input;input.focus({preventScroll:true});input.select();
  on(input,'keydown',e=>{inputDemo.stop();if(e.key==='Enter'){e.stopPropagation();e.preventDefault();if(input.value==='Desk Tray')finish();else api.retry('Name the object Desk Tray to match the course checkpoints.',host);}});api.guideChanged();
 }
 function editField(key){inputDemo.stop();const input=rect(document.createElement('input'),fieldRects[key]);input.className='native-input';input.setAttribute('aria-label',fieldLabel(key));input.value=String(step.simulation.values?.[key]??(key[0]==='d'?2:0));menus.replaceChildren(input);guide=input;input.focus({preventScroll:true});input.select();
  on(input,'input',()=>{inputDemo.stop();lastInput=performance.now();const v=numericValue(input.value);if(Number.isFinite(v))live.previewField(key,v);});
  on(input,'keydown',e=>{inputDemo.stop();e.stopPropagation();coach.pressed(e.key);if(e.key==='Enter'){e.preventDefault();if(meetsGoal(input.value,step.simulation.value,key==='rz'?'angle':'length'))finish();else help(`Select the field contents with Ctrl+A, enter ${step.simulation.value}${key==='rz'?'°':' mm'}, then Enter.`);}else if(e.key==='Escape')cancel();});api.guideChanged();
 }
 async function beginOperation(kind){if(operator||finished)return;clear();operator=startModal(kind);stage.focus({preventScroll:true});const native=`${kind}-modal-start`;await show(native);if(!operator||operator.kind!==kind)return;updateOperation();coach.hint('Watch the entry at the top of the viewport. Move the pointer for a live preview; typing a number takes over. Hold Shift for fine movement.');}
 function updateOperation(){if(!operator)return;const value=modalValue(operator),preview={...operator,value};if(operator.kind==='move'&&!operator.axis&&operator.raw){const len=Math.hypot(...operator.vector)||1;preview.vector=operator.vector.map(v=>v/len*value);}
  live.previewOperation(preview);if(!readout){readout=document.createElement('div');readout.className='bl-transform-readout';readout.setAttribute('role','status');readout.setAttribute('aria-label','Blender transform numeric entry');stage.append(readout);}readout.style.width=`${live.viewport().width-176}px`;readout.replaceChildren();const text=document.createElement('span');text.textContent=modalCaption(operator);readout.append(text);guide=readout;
  valuesLayer.replaceChildren();const numbers=operator.kind==='move'?{x:operator.axis?(operator.axis==='x'?value:0):preview.vector[0],y:operator.axis?(operator.axis==='y'?value:0):preview.vector[1],z:operator.axis?(operator.axis==='z'?value:0):preview.vector[2]}:operator.kind==='rotate'?live.rotationValues(preview):operator.kind==='scale'?{dx:2*(!operator.axis||operator.axis==='x'?value:1),dy:2*(!operator.axis||operator.axis==='y'?value:1),dz:2*(!operator.axis||operator.axis==='z'?value:1),sx:!operator.axis||operator.axis==='x'?value:1,sy:!operator.axis||operator.axis==='y'?value:1,sz:!operator.axis||operator.axis==='z'?value:1}:{};
  const item={...fieldRects,y:[1573,224,263,28],rx:[1573,313,263,28],ry:[1573,342,263,28],sx:[1573,464,263,28],sy:[1573,493,263,28],sz:[1573,522,263,28]},properties={x:[2169,502,145,28],y:[2169,531,145,28],z:[2169,560,145,28],rx:[2169,593,145,28],ry:[2169,622,145,28],rz:[2169,651,145,28],sx:[2169,723,145,28],sy:[2169,752,145,28],sz:[2169,781,145,28]};
  for(const [key,value] of Object.entries(numbers))for(const box of [live.viewport().right<1900?item[key]:null,properties[key]]){if(!box)continue;const el=rect(document.createElement('div'),box);el.className='bl-transform-value';el.textContent=value.toFixed(3)+(key.startsWith('r')?'°':key.startsWith('s')?'':' mm');valuesLayer.append(el);}
  stage.dataset.operator=JSON.stringify({kind:operator.kind,raw:operator.raw,value,axis:operator.axis,mouseTravel:operator.mouseTravel,normalTravel:operator.normalTravel,precisionTravel:operator.precisionTravel});api.guideChanged();
 }
 async function confirmOperation(){if(!operator)return;if(step.simulation.action==='extrude-cancel')return help('Press Escape, then Ctrl+Z to remove the new extrusion geometry.');
  if(step.simulation.visual){if(operator.normalTravel<20)return help('Move the pointer to change the object before confirming.');if(!visualReady(operator))return help('Keep the operation active, hold Shift and move the pointer for fine control.');const preview={...operator,value:modalValue(operator),confirmed:true};finished=true;clear();spots.replaceChildren();guide=null;await show(pair[0]);operator=preview;updateOperation();readout?.remove();readout=null;operator=null;guide=null;visualResult=preview;api.complete();return;}
  if(!modalReady(operator,step.simulation.value))return help(`The preview is live. Adjust the value to ${step.simulation.value}${operator.kind==='rotate'?'°':' mm'}${operator.kind==='bevel'?' and 3 segments':''}, then Enter. Use Backspace to edit, or Escape to restart.`);finish();
 }
 function help(message){lastInput=performance.now();api.retry(message,host);demonstrate(message);}
 function navigationControls(){const r=live.viewport();if(!r)return;for(const [kind,y,label] of [['zoom',r.visibleY+130,'Zoom view — drag magnifier'],['pan',r.visibleY+175,'Pan view — drag hand'],['orbit',r.visibleY+5,'Orbit view — drag axes']]){const box=kind==='orbit'?[r.right-155,y,144,144]:[r.right-50,y,45,44];const b=hotspot(label,box,()=>{},{target:step.simulation.action===kind});b.classList.add('bl-native-drag');b.dataset.navigation=kind;b.style.zIndex='3';live.topButton.style.zIndex='4';live.topButton.dataset.navigation='orbit';}
 }
 function startupConfirmation(active=true){
  inputDemo.stop();spots.replaceChildren();menus.replaceChildren();popup=true;
  const r=manifest.menus['startup.confirm'],im=rect(document.createElement('img'),[975,666,r.width,r.height]);im.src=url('assets/ui/'+r.file);im.alt='Overwrite Startup File. Blender will start next time as it is now.';im.className='native-popover';menus.append(im);
  if(active){hotspot('Overwrite Startup File',[1076,761,157,35],()=>finish(),{target:true});hotspot('Cancel startup save',[1244,761,157,35],dismissStartup);}
  api.guideChanged();
 }
 function dismissStartup(){
  clear();spots.replaceChildren();guide=null;
  hotspot('File',[42,1,50,36],()=>openMenu('TOPBAR_MT_file',42,37),{target:true});
  stage.focus({preventScroll:true});api.feedback('Cancelled without saving. Choose File → Defaults → Save Startup File to reopen the confirmation.');api.guideChanged();
 }
 function setupControls(){
  const s=step.simulation;
  if(s.action==='setup-confirm'){startupConfirmation();return true;}
  if(s.action==='setup-click'){hotspot(s.label,s.box,()=>finish(),{target:true});return true;}
  if(s.action==='setup-choice'){
   hotspot(s.label,s.box,async()=>{clear();popup=true;if(!await show(s.menu))return;spots.replaceChildren();hotspot(s.choice,s.choiceBox,()=>finish(),{target:true});api.guideChanged();},{target:true});return true;
  }
  if(s.setting){
   hotspot(s.label,s.box,()=>{
    inputDemo.stop();const input=rect(document.createElement('input'),s.box);input.className='native-input';input.setAttribute('aria-label',s.label);input.value=String(s.initial);menus.replaceChildren(input);guide=input;input.focus({preventScroll:true});input.select();
    on(input,'input',()=>{inputDemo.stop();lastInput=performance.now();const v=setupValue(input.value,s.setting);if(Number.isFinite(v)&&v>0&&s.setting!=='unitScale')live.previewClipping(s.setting,v);});
    on(input,'keydown',e=>{inputDemo.stop();e.stopPropagation();coach.pressed(e.key);if(e.key==='Enter'){e.preventDefault();if(setupReady(input.value,s))finish();else help(`Enter ${s.value}${s.setting==='unitScale'?'':' mm'}, then Enter. Ctrl+A replaces the current entry.`);}else if(e.key==='Escape')cancel();});api.guideChanged();
   },{target:true,dbl:true});return true;
  }
  return false;
 }
 function buildControls(){
  spots.replaceChildren();guide=null;navigationControls();if(finished){if(step.simulation.action==='setup-startup')startupConfirmation(false);return;}
  if(setupControls())return;
  const a=step.simulation.action,edit=step.simulation.mode==='edit'||['vertex','edge','face','select-top','inset','extrude','bevel','orientation','object-mode'].includes(a);
  if(a==='header-scroll'){const r=manifest.states[pair[0]];hotspot('Scrollable viewport header',[3,39,r.layout.areas.find(a=>a.type==='VIEW_3D').width,38],()=>api.feedback('Scroll over the header, or drag it with the middle mouse button.'),{target:true});return;}
  hotspot('File',[42,1,50,36],()=>['save','export','setup-startup'].includes(a)?openMenu('TOPBAR_MT_file',42,37):unavailable(),{target:['save','export','setup-startup'].includes(a)});
  hotspot('Mode selector',[72,39,edit?137:162,38],()=>['edit-mode','object-mode'].includes(a)?openMenu('object.mode_set',72,77):unavailable(),{target:['edit-mode','object-mode'].includes(a)});
  hotspot('View',[edit?318:246,39,65,38],()=>['frame','sidebar'].includes(a)?openMenu('VIEW3D_MT_view',edit?318:246,77):unavailable(),{target:['frame','sidebar'].includes(a)});
  hotspot('Add',[edit?441:376,39,54,38],()=>a==='add-cube'?openMenu('VIEW3D_MT_add',376,77):unavailable(),{target:a==='add-cube'});
  if(!edit)hotspot('Object',[431,39,90,38],()=>a==='apply-scale'?openMenu('VIEW3D_MT_object',431,77):unavailable(),{target:a==='apply-scale'});
  if(['viewport','orbit','pan','zoom','delete','rename','move','rotate','scale','inset','extrude','extrude-cancel','bevel','free'].includes(a))hotspot('3D Viewport',[88,115,1450,1200],()=>{stage.focus({preventScroll:true});if(a==='viewport')finish();else if(operator)confirmOperation();},{target:!['orbit','pan','zoom'].includes(a)});
  if(a==='outliner')hotspot('Cube in Outliner',[2040,162,340,27],()=>finish(),{target:true});
  if(a==='units')hotspot('Units in Scene Properties',[2030,615,355,35],()=>finish(),{target:true});
  if(a==='select-object'){hotspot('Cube mesh',[88,115,1450,1200],e=>live.hit(e.clientX,e.clientY)?finish():api.retry('Click the cube itself to select it.',host));guide=live.selectionGuide();}
  if(a==='select-top'){hotspot('Top face',[88,115,1450,1200],e=>live.hit(e.clientX,e.clientY,{topOnly:true})?finish():api.retry('Select the broad top face, not a side or empty space.',host));guide=live.selectionGuide(true);}
  for(const [i,key] of ['vertex','edge','face'].entries())if(edit)hotspot(`${key[0].toUpperCase()+key.slice(1)} Select`,[219+i*29,39,28,38],()=>a===key?finish():unavailable(),{target:a===key});
  if(a==='top')guide=live.topButton;
  if(a==='field')hotspot(fieldLabel(step.simulation.field),fieldRects[step.simulation.field],()=>editField(step.simulation.field),{target:true,dbl:true});
  if(a==='orientation')hotspot('Viewport Overlays popover',[1698,39,32,38],()=>orientationPopover(false),{target:true});
  if(step.simulation.shortcutOnly)hotspot('3D Viewport — keyboard focus',[88,115,1450,1200],()=>stage.focus({preventScroll:true}),{target:true});
  if(guide&&(['delete','rename','move','rotate','scale','inset','extrude','extrude-cancel','bevel'].includes(a)||step.simulation.shortcutOnly))guide.dataset.mouseGesture='focus';
 }
 function orientationPopover(enabled){
  inputDemo.stop();spots.replaceChildren();menus.replaceChildren();popup=true;orientationEnabled=enabled;
  const reference=manifest.menus[enabled?'overlays.enabled':'overlays'],im=rect(document.createElement('img'),[1490,77,reference.width,reference.height]);im.src=url('assets/ui/'+reference.file);im.alt='';im.className='native-popover';menus.append(im);
  if(enabled){hotspot('Close Overlays in viewport',[88,115,1350,1200],()=>finish(),{target:true});api.feedback('Face Orientation is enabled. Click the viewport to close the popover.');}
  else hotspot('Face Orientation',[1501,680,275,31],async()=>{await show(pair[1]);orientationPopover(true);},{target:true});
  api.guideChanged();
 }
 function practiceComplete(){inputDemo.stop();finished=true;guide=null;api.complete();}
 function navigate(kind,dx,dy=0){if(paused||dialog||popup||operator||extrusionUndo)return;live.navigate(kind,dx,dy);}
 async function scrollHeader(delta){navIndex=Math.min(16,Math.max(0,navIndex+delta));if(await show(boundedFrame('header-narrow',navIndex))&&navIndex>=8)practiceComplete();}
 on(stage,'keydown',e=>{
  inputDemo.stop();if(paused||finished)return;lastInput=performance.now();const a=step.simulation.action,k=e.key.toLowerCase();coach.pressed(k==='shift'?'Shift':(e.ctrlKey?'Ctrl+':e.shiftKey?'Shift+':'')+(e.key.length===1?e.key.toUpperCase():e.key));
  if(extrusionUndo){e.preventDefault();if(k==='z'&&e.ctrlKey){extrusionUndo=false;if(a==='extrude-cancel')finish();else cancel();}else api.feedback('Press Ctrl+Z to undo the extrusion geometry before trying again.');return;}
  if(k==='escape'){e.preventDefault();cancel();return;}if(e.target.tagName==='INPUT')return;
  if(operator){if(k==='shift')return;e.preventDefault();if(k==='enter'||k===' '){confirmOperation();return;}const next=modalKey(operator,k==='backspace'?'Backspace':k);if(next){operator=next;updateOperation();}else demonstrate('Use numbers, X/Y/Z, or Backspace. Enter confirms; Escape cancels.');return;}
  if(k==='tab'&&['edit-mode','object-mode'].includes(a)){e.preventDefault();finish();}
  else if(k==='n'&&a==='sidebar'){e.preventDefault();if(step.simulation.menuOnly)help('Use View → Sidebar for this step. You will practice N in the next step.');else finish();}
  else if(k==='s'&&e.ctrlKey&&e.shiftKey&&a==='save'){e.preventDefault();fileDialog();}
  else if(k==='a'&&e.ctrlKey&&a==='apply-scale'){e.preventDefault();shortcutInvoked=true;openMenu('VIEW3D_MT_object_apply',pointer[0],pointer[1]);}
  else if(e.code==='Numpad7'&&a==='top'){e.preventDefault();finish();}
  else if(k==='f2'&&a==='rename'){e.preventDefault();rename();}
  else if(k==='delete'&&a==='delete'){e.preventDefault();finish();}
  else if(k==='a'&&e.shiftKey&&a==='add-cube'){e.preventDefault();openMenu('VIEW3D_MT_add',376,77);}
  else if(e.code==='NumpadDecimal'&&a==='frame'){e.preventDefault();finish();}
  else if(['vertex','edge','face'].includes(a)&&e.code===`Digit${['vertex','edge','face'].indexOf(a)+1}`){e.preventDefault();finish();}
  else if((a==='move'&&k==='g')||(a==='rotate'&&k==='r')||(a==='scale'&&k==='s')||(a==='inset'&&k==='i')||(['extrude','extrude-cancel'].includes(a)&&k==='e')||(a==='bevel'&&k==='b'&&e.ctrlKey)){e.preventDefault();beginOperation(a==='extrude-cancel'?'extrude':a);}
 });
 const point=e=>{const b=stage.getBoundingClientRect();return [(e.clientX-b.left)/scale,(e.clientY-b.top)/scale];};
 on(stage,'pointerdown',e=>{inputDemo.stop();lastInput=performance.now();pointer=point(e);if(paused||dialog)return;if(operator&&e.button===2){e.preventDefault();cancel();return;}const nav=e.target.closest('[data-navigation]');if((e.button!==1&&!nav)||popup||operator||extrusionUndo)return;const [x,y]=pointer,a=step.simulation.action;
  if(nav||(a==='header-scroll'&&!finished&&y>=39&&y<=77)||live.isViewport(x,y)){e.preventDefault();live.beginNavigation();const action=nav?.dataset.navigation||(a==='header-scroll'&&y<=77?'header-scroll':e.shiftKey?'pan':'orbit');drag={x:e.clientX,y:e.clientY,button:e.button,travel:0,action,zoom:action==='zoom'?live.beginZoom(y):null};stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});}});
 on(stage,'pointermove',e=>{const next=point(e);if(operator&&!paused&&!operator.raw){live.transformPointer(operator,pointer,next,e.shiftKey);updateOperation();}pointer=next;if(!drag)return;lastInput=performance.now();const dx=(e.clientX-drag.x)/scale,dy=(e.clientY-drag.y)/scale;drag.travel+=Math.hypot(dx,dy);if(drag.action==='header-scroll'){if(Math.abs(dx)>12){drag.x=e.clientX;scrollHeader(dx<0?1:-1);}}else{drag.x=e.clientX;drag.y=e.clientY;if(drag.zoom)live.dragZoom(drag.zoom,next[1]);else navigate(drag.action,dx,dy);}});
 on(stage,'pointerup',()=>{suppressClick=drag?.button===0&&drag.travel>3;setTimeout(()=>{suppressClick=false;},100);drag=null;live.endNavigation();});on(stage,'pointercancel',()=>{drag=null;live.endNavigation();});
 on(stage,'wheel',e=>{inputDemo.stop();if(paused)return;const a=step.simulation.action,[x,y]=point(e);if(operator?.kind==='bevel'){e.preventDefault();operator.segments=Math.max(1,Math.min(3,operator.segments+(e.deltaY<0?1:-1)));updateOperation();}else if(a==='header-scroll'&&!finished&&y>=39&&y<=77){e.preventDefault();scrollHeader(Math.sign(e.deltaX||e.deltaY));}else if(live.isViewport(x,y)&&!popup&&!operator){e.preventDefault();navigate('zoom',e.deltaY);}},{passive:false});
 on(stage,'click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 on(stage,'contextmenu',e=>{e.preventDefault();if(operator)cancel();});on(stage,'click',e=>{if(e.target===stage||e.target===frame||e.target===live.canvas){if(popup)cancel();else if(operator&&!paused)confirmOperation();else if(!paused&&!finished)unavailable();}});
 return {
  async setStep(s,c){step=s;guide=null;spots.replaceChildren();coach.setStep(s);lastInput=performance.now();visualResult=null;shortcutInvoked=false;pair=statePair(lesson.id.replace(/-qa$/,''),s.id);finished=c.isCompleted();paused=false;drag=null;extrusionUndo=false;travel=0;zoomDirections=new Set();navIndex=0;clear();stage.dataset.operator='';$('.follow-copy').textContent=s.follow||lesson.follow;if(!await show(pair[finished?1:0],{resetCamera:true}))return;buildControls();api.guideChanged();preload(pair[1]);const action=s.simulation.action;if(action==='header-scroll')for(let i=0;i<=16;i++)preload(boundedFrame('header-narrow',i));const kind=action==='extrude-cancel'?'extrude':action;for(const name of Object.keys(manifest.states))if(name.startsWith(kind+'-modal-'))preload(name);},
  refreshState(){},setPaused(v){paused=v;if(v)inputDemo.stop();},setGuidance(){},getGuide(){return guide?{target:guide,parent:host,scale:1}:null;},getRegion(){return host;},
  perform(action){if(paused||finished)return;if(action==='delete'&&step.simulation.action==='delete')finish();},
  reset(){cancel();},dispose(){clearInterval(idleTimer);inputDemo.dispose();coach.dispose();abort.abort();observer.disconnect();live.dispose();document.body.classList.remove('blender-course','native-expanded');container.replaceChildren();}
 };
}
