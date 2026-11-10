import {meetsGoal} from './state.js';
import {statePair,fieldRects,boundedFrame} from './native-state.js';
import {startModal,modalKey,modalReady,modalFrame} from './native-modal.js';
import {createLiveViewport} from './live-viewport.js';

// Each frame contains Blender's complete, unmodified native interface. Only
// the current checkpoint's controls receive a transparent interaction layer.
export async function createBlenderSimulator({container,lesson,api}) {
 const base=new URL('./',import.meta.url),url=p=>new URL(p,base).href;
 const [manifest,reference]=await Promise.all(['assets/ui/manifest.json','native-assets/menu-reference.json'].map(async p=>{const r=await fetch(url(p));if(!r.ok)throw Error(`Missing reference: ${p}`);return r.json();}));
 document.body.classList.add('blender-course');
 container.innerHTML=`<div class="native-controls"><span>Blender 5.2.2 LTS · native interface</span><button type="button" class="expand-native">Expand workspace</button></div><div class="native-host"><div class="native-stage" tabindex="0" role="application" aria-label="Blender practice workspace"><img class="native-frame" alt="" draggable="false"><div class="native-hotspots"></div><div class="native-menus"></div></div></div><div class="bl-follow"><strong>Follow along in real Blender · save often</strong><p class="follow-copy"></p><details><summary>Blender checkpoints and recovery</summary><p>Save your own copy before experimenting. Browser progress does not save your real Blender project.</p><div class="downloads"></div></details></div>`;
 const $=s=>container.querySelector(s),host=$('.native-host'),stage=$('.native-stage'),frame=$('.native-frame'),spots=$('.native-hotspots'),menus=$('.native-menus');
 const abort=new AbortController(),on=(el,event,fn,extra={})=>el.addEventListener(event,fn,{signal:abort.signal,...extra});
 let step,pair,paused=false,finished=false,current='',scale=1,guide=null,drag=null,navIndex=8,operator=null,dialog=false,popup=false,loadToken=0;
 let zoomDirections=new Set(),extrusionUndo=false,orientationEnabled=false,travel=0;const loaded=new Map();
 const live=await createLiveViewport({stage,frame,manifest,url,onView(kind,dx,dy){
  if(paused||finished||step?.simulation.action!==kind)return;
  if(kind==='zoom'){zoomDirections.add(Math.sign(dx));if(zoomDirections.size===2)practiceComplete();}
  else {travel+=Math.hypot(dx,dy);if(travel>60)practiceComplete();}
 },onTop(){if(!paused&&!finished&&step.simulation.action==='top')finish();},onRender:()=>api.guideChanged()});
 function preload(name){if(!manifest.states[name])throw Error(`Missing captured UI state ${name}`);if(!loaded.has(name)){const im=new Image();im.src=url(`assets/ui/${manifest.states[name].file}`);loaded.set(name,im.decode().then(()=>im));}return loaded.get(name);}
 async function show(name,{resetCamera=false}={}){const token=++loadToken,im=await preload(name);if(token!==loadToken)return false;current=name;frame.src=im.src;stage.dataset.state=name;const r=manifest.states[name];stage.style.width=`${r.width}px`;stage.style.height=`${r.height}px`;live.setFrame(name,{resetCamera});resize();return true;}
 function resize(){if(!current)return;const r=manifest.states[current];scale=host.clientWidth/2400;
  if(document.body.classList.contains('native-expanded')){const instructions=document.querySelector('.lesson-panel');const available=window.innerHeight-(instructions?.getBoundingClientRect().height||0)-$('.native-controls').offsetHeight-4;scale=Math.min(scale,Math.max(180,available)/r.height);}
  stage.style.left=`${(host.clientWidth-r.width*scale)/2}px`;stage.style.transform=`scale(${scale})`;host.style.height=`${r.height*scale}px`;live.resize();api.guideChanged();}
 const observer=new ResizeObserver(resize);observer.observe(host);if(document.querySelector('.lesson-panel'))observer.observe(document.querySelector('.lesson-panel'));on(window,'resize',resize);
 const unavailable=()=>api.retry('That control is outside this step. Your checkpoint is unchanged.',host);
 function rect(el,[x,y,w,h]){Object.assign(el.style,{left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});return el;}
 function hotspot(label,box,fn,{target=false,dbl=false}={}){
  const b=rect(document.createElement('button'),box);b.className='native-hit';b.type='button';b.setAttribute('aria-label',label);b.title=label;
  on(b,dbl?'dblclick':'click',e=>{e.stopPropagation();if(!paused&&!finished)fn(e);});
  if(dbl)on(b,'click',e=>{e.stopPropagation();stage.focus({preventScroll:true});api.feedback('Double-click the number to enter an exact value.');});
  spots.append(b);if(target)guide=b;return b;
 }
 function clear(){menus.replaceChildren();operator=null;dialog=false;popup=false;orientationEnabled=false;}
 async function finish(name=pair[1]){if(finished||paused)return;finished=true;clear();spots.replaceChildren();guide=null;if(await show(name,{resetCamera:step.simulation.action==='frame'}))api.complete();}
 function cancel(){
  if(orientationEnabled)return finish();
  if(operator?.kind==='extrude'){clear();extrusionUndo=true;show('extrude-cancelled');api.feedback('Escape cancelled the movement, but the extrusion remains. Press Ctrl+Z to remove the new geometry.');stage.focus({preventScroll:true});return;}
  clear();show(pair[0]);buildControls();stage.focus({preventScroll:true});api.feedback('Cancelled. The starting checkpoint is restored.');
 }
 for(const name of ['cube','blank','inset','cavity','finished']){const a=document.createElement('a');a.href=url(`assets/${name}.blend`);a.download=`desk-tray-${name}.blend`;a.textContent=name==='cube'?'Start':name[0].toUpperCase()+name.slice(1);$('.downloads').append(a);}
 on($('.expand-native'),'click',()=>{const expanded=document.body.classList.toggle('native-expanded');$('.expand-native').textContent=expanded?'Return to lesson layout':'Expand workspace';(document.querySelector('.learning-layout')||container).scrollIntoView({block:'start'});resize();});
 function selectedMenuRow(row){const a=step.simulation.action;
  if(a==='add-cube'&&row.operator==='mesh.primitive_cube_add')return ()=>finish();
  if(a==='frame'&&row.operator==='view3d.view_selected')return ()=>finish();
  if(a==='sidebar'&&row.property==='show_region_ui')return ()=>finish();
  if(a==='apply-scale'&&row.operator==='object.transform_apply'&&row.label==='Scale')return ()=>finish();
  if(a==='edit-mode'&&row.properties?.mode==='EDIT')return ()=>finish();
  if(a==='object-mode'&&row.properties?.mode==='OBJECT')return ()=>finish();
  if(a==='save'&&row.operator==='wm.save_as_mainfile')return fileDialog;
  if(a==='export'&&row.operator==='wm.stl_export')return fileDialog;
  return null;
 }
 function allowedSubmenu(name){return (step.simulation.action==='add-cube'&&name==='VIEW3D_MT_mesh_add')||(step.simulation.action==='apply-scale'&&name==='VIEW3D_MT_object_apply')||(step.simulation.action==='export'&&name==='TOPBAR_MT_file_export');}
 function openMenu(name,x,y,level=0){
  if(!reference.menus[name])return unavailable();
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
   const fn=selectedMenuRow(row),sub=allowedSubmenu(row.menu);if(fn||sub)guide=b;
   const invoke=()=>{if(paused||finished)return;if(row.kind==='submenu'){if(!sub)return unavailable();openMenu(row.menu,parseFloat(list.style.left)+width,parseFloat(list.style.top)+b.offsetTop-5,level+1);}else if(fn)fn();else unavailable();};
   on(b,'click',e=>{e.stopPropagation();invoke();});on(b,'pointerenter',()=>{if(sub)invoke();else [...menus.children].filter(el=>Number(el.dataset.level)>level).forEach(el=>el.remove());});
   on(b,'keydown',e=>{const buttons=[...list.querySelectorAll('button')],i=buttons.indexOf(b);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus();}else if(e.key==='ArrowRight'&&sub){e.preventDefault();invoke();menus.lastElementChild.querySelector('button')?.focus();}else if(e.key==='ArrowLeft'&&level){e.preventDefault();list.remove();menus.lastElementChild.querySelector('button')?.focus();}});
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
  const input=rect(document.createElement('input'),[828,698,364,30]);input.className='native-input filename';input.setAttribute('aria-label','Object Name');input.value='Cube';menus.append(input);guide=input;input.focus();input.select();
  on(input,'keydown',e=>{if(e.key==='Enter'){e.stopPropagation();e.preventDefault();if(input.value==='Desk Tray')finish();else api.retry('Name the object Desk Tray to match the course checkpoints.',host);}});api.guideChanged();
 }
 function editField(key){const input=rect(document.createElement('input'),fieldRects[key]);input.className='native-input';input.setAttribute('aria-label',fieldLabel(key));input.value=String(step.simulation.values?.[key]??(key[0]==='d'?2:0));menus.replaceChildren(input);guide=input;input.focus();input.select();
  on(input,'keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();if(meetsGoal(input.value,step.simulation.value,key==='rz'?'angle':'length'))finish();else api.retry(`Enter ${step.simulation.value}${key==='rz'?'°':' mm'} for this step.`,host);}else if(e.key==='Escape')cancel();});api.guideChanged();
 }
 function beginOperation(kind){if(operator||finished)return;clear();operator=startModal(kind);stage.focus({preventScroll:true});updateOperation();}
 function updateOperation(){menus.replaceChildren();show(modalFrame(operator));api.guideChanged();}
 function confirmOperation(){if(step.simulation.action==='extrude-cancel')return api.retry('This exercise practices cancellation: press Escape, then Ctrl+Z.',host);if(!modalReady(operator))return api.retry('Follow the task’s axis, value, and segment count before confirming. Escape cancels the active movement.',host);finish();}
 function buildControls(){
  spots.replaceChildren();guide=null;if(finished)return;
  const a=step.simulation.action,edit=step.simulation.mode==='edit'||['vertex','edge','face','select-top','inset','extrude','bevel','orientation','object-mode'].includes(a);
  if(a==='header-scroll'){const r=manifest.states[pair[0]];hotspot('Scrollable viewport header',[3,39,r.layout.areas.find(a=>a.type==='VIEW_3D').width,38],()=>api.feedback('Scroll over the header, or drag it with the middle mouse button.'),{target:true});return;}
  hotspot('File',[42,1,50,36],()=>['save','export'].includes(a)?openMenu('TOPBAR_MT_file',42,37):unavailable(),{target:['save','export'].includes(a)});
  hotspot('Mode selector',[72,39,edit?137:162,38],()=>['edit-mode','object-mode'].includes(a)?openMenu('object.mode_set',72,77):unavailable(),{target:['edit-mode','object-mode'].includes(a)});
  hotspot('View',[edit?318:246,39,65,38],()=>['frame','sidebar'].includes(a)?openMenu('VIEW3D_MT_view',edit?318:246,77):unavailable(),{target:['frame','sidebar'].includes(a)});
  hotspot('Add',[edit?441:376,39,54,38],()=>a==='add-cube'?openMenu('VIEW3D_MT_add',376,77):unavailable(),{target:a==='add-cube'});
  if(!edit)hotspot('Object',[431,39,90,38],()=>a==='apply-scale'?openMenu('VIEW3D_MT_object',431,77):unavailable(),{target:a==='apply-scale'});
  if(['viewport','orbit','pan','zoom','delete','rename','move','rotate','inset','extrude','extrude-cancel','bevel','free'].includes(a))hotspot('3D Viewport',[88,115,1450,1200],()=>{stage.focus({preventScroll:true});if(a==='viewport')finish();else if(operator)confirmOperation();},{target:true});
  if(a==='outliner')hotspot('Cube in Outliner',[2040,162,340,27],()=>finish(),{target:true});
  if(a==='units')hotspot('Units in Scene Properties',[2030,615,355,35],()=>finish(),{target:true});
  if(a==='select-object'){hotspot('Cube mesh',[88,115,1450,1200],e=>live.hit(e.clientX,e.clientY)?finish():api.retry('Click the cube itself to select it.',host));guide=live.selectionGuide();}
  if(a==='select-top'){hotspot('Top face',[88,115,1450,1200],e=>live.hit(e.clientX,e.clientY,{topOnly:true})?finish():api.retry('Select the broad top face, not a side or empty space.',host));guide=live.selectionGuide(true);}
  for(const [i,key] of ['vertex','edge','face'].entries())if(edit)hotspot(`${key[0].toUpperCase()+key.slice(1)} Select`,[219+i*29,39,28,38],()=>a===key?finish():unavailable(),{target:a===key});
  if(a==='top')guide=live.topButton;
  if(a==='field')hotspot(fieldLabel(step.simulation.field),fieldRects[step.simulation.field],()=>editField(step.simulation.field),{target:true,dbl:true});
  if(a==='orientation')hotspot('Viewport Overlays popover',[1698,39,32,38],()=>orientationPopover(false),{target:true});
 }
 function orientationPopover(enabled){
  spots.replaceChildren();menus.replaceChildren();popup=true;orientationEnabled=enabled;
  const reference=manifest.menus[enabled?'overlays.enabled':'overlays'],im=rect(document.createElement('img'),[1490,77,reference.width,reference.height]);im.src=url('assets/ui/'+reference.file);im.alt='';im.className='native-popover';menus.append(im);
  if(enabled){hotspot('Close Overlays in viewport',[88,115,1350,1200],()=>finish(),{target:true});api.feedback('Face Orientation is enabled. Click the viewport to close the popover.');}
  else hotspot('Face Orientation',[1501,680,275,31],async()=>{await show(pair[1]);orientationPopover(true);},{target:true});
  api.guideChanged();
 }
 function practiceComplete(){finished=true;guide=null;api.complete();}
 function navigate(kind,dx,dy=0){if(paused||dialog||popup||operator||extrusionUndo)return;live.navigate(kind,dx,dy);}
 async function scrollHeader(delta){navIndex=Math.min(16,Math.max(0,navIndex+delta));if(await show(boundedFrame('header-narrow',navIndex))&&navIndex>=8)practiceComplete();}
 on(stage,'keydown',e=>{
  if(paused||finished)return;const a=step.simulation.action,k=e.key.toLowerCase();
  if(extrusionUndo){e.preventDefault();if(k==='z'&&e.ctrlKey){extrusionUndo=false;if(a==='extrude-cancel')finish();else cancel();}else api.feedback('Press Ctrl+Z to undo the extrusion geometry before trying again.');return;}
  if(k==='escape'){e.preventDefault();cancel();return;}if(e.target.tagName==='INPUT')return;
  if(operator){e.preventDefault();if(k==='enter'||k===' '){confirmOperation();return;}const next=modalKey(operator,k==='backspace'?'Backspace':k);if(next){operator=next;updateOperation();}else api.feedback('This checkpoint allows the axis and number in the task. Escape cancels; Backspace edits your entry.');return;}
  if(k==='tab'&&['edit-mode','object-mode'].includes(a)){e.preventDefault();finish();}
  else if(k==='n'&&a==='sidebar'){e.preventDefault();finish();}
  else if(k==='f2'&&a==='rename'){e.preventDefault();rename();}
  else if(k==='delete'&&a==='delete'){e.preventDefault();finish();}
  else if(k==='a'&&e.shiftKey&&a==='add-cube'){e.preventDefault();openMenu('VIEW3D_MT_add',376,77);}
  else if(e.code==='NumpadDecimal'&&a==='frame'){e.preventDefault();finish();}
  else if(['vertex','edge','face'].includes(a)&&e.code===`Digit${['vertex','edge','face'].indexOf(a)+1}`){e.preventDefault();finish();}
  else if((a==='move'&&k==='g')||(a==='rotate'&&k==='r')||(a==='inset'&&k==='i')||(['extrude','extrude-cancel'].includes(a)&&k==='e')||(a==='bevel'&&k==='b'&&e.ctrlKey)){e.preventDefault();beginOperation(a==='extrude-cancel'?'extrude':a);}
 });
 const point=e=>{const b=stage.getBoundingClientRect();return [(e.clientX-b.left)/scale,(e.clientY-b.top)/scale];};
 on(stage,'pointerdown',e=>{if(paused||dialog)return;if(operator&&e.button===2){e.preventDefault();cancel();return;}if(e.button!==1||popup||operator||extrusionUndo)return;const [x,y]=point(e),a=step.simulation.action;
  if((a==='header-scroll'&&!finished&&y>=39&&y<=77)||live.isViewport(x,y)){e.preventDefault();live.beginNavigation();drag={x:e.clientX,y:e.clientY,action:a==='header-scroll'&&y<=77?'header-scroll':e.shiftKey?'pan':'orbit'};stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});}});
 on(stage,'pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x)/scale,dy=(e.clientY-drag.y)/scale;if(drag.action==='header-scroll'){if(Math.abs(dx)>12){drag.x=e.clientX;scrollHeader(dx<0?1:-1);}}else{drag.x=e.clientX;drag.y=e.clientY;navigate(drag.action,dx,dy);}});
 on(stage,'pointerup',()=>{drag=null;live.endNavigation();});on(stage,'pointercancel',()=>{drag=null;live.endNavigation();});
 on(stage,'wheel',e=>{if(paused)return;const a=step.simulation.action,[x,y]=point(e);if(operator?.kind==='bevel'){e.preventDefault();if(operator.raw!=='0.6')return api.feedback('Enter 0.6 first, then adjust the bevel segments.');operator.segments=Math.max(1,Math.min(3,operator.segments+(e.deltaY<0?1:-1)));updateOperation();}else if(a==='header-scroll'&&!finished&&y>=39&&y<=77){e.preventDefault();scrollHeader(Math.sign(e.deltaX||e.deltaY));}else if(live.isViewport(x,y)&&!popup&&!operator){e.preventDefault();navigate('zoom',e.deltaY);}},{passive:false});
 on(stage,'contextmenu',e=>{e.preventDefault();if(operator)cancel();});on(stage,'click',e=>{if(e.target===stage||e.target===frame){if(popup)cancel();else if(!paused&&!finished)unavailable();}});
 return {
  async setStep(s,c){step=s;pair=statePair(lesson.id.replace(/-qa$/,''),s.id);finished=c.isCompleted();paused=false;drag=null;extrusionUndo=false;travel=0;zoomDirections=new Set();navIndex=0;clear();$('.follow-copy').textContent=s.follow||lesson.follow;if(!await show(pair[finished?1:0],{resetCamera:true}))return;buildControls();api.guideChanged();preload(pair[1]);const action=s.simulation.action;if(action==='header-scroll')for(let i=0;i<=16;i++)preload(boundedFrame('header-narrow',i));const kind=action==='extrude-cancel'?'extrude':action;for(const name of Object.keys(manifest.states))if(name.startsWith(kind+'-modal-'))preload(name);},
  refreshState(){},setPaused(v){paused=v;},setGuidance(){},getGuide(){return guide?{target:guide,parent:host,scale:1}:null;},getRegion(){return host;},
  perform(action){if(paused)return;const a=step.simulation.action;if(action==='delete'&&a==='delete'&&!finished)finish();else if(action==='orbit-aid'&&a==='orbit')navigate('orbit',70,0);else if(action==='pan-aid'&&a==='pan')navigate('pan',70,0);else if(action==='zoom-in'&&a==='zoom')navigate('zoom',-120);else if(action==='zoom-out'&&a==='zoom')navigate('zoom',120);},
  reset(){cancel();},dispose(){abort.abort();observer.disconnect();live.dispose();document.body.classList.remove('blender-course','native-expanded');container.replaceChildren();}
 };
}
