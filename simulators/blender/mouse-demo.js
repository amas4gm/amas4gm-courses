// Coordinates are Blender's native frame coordinates. The cursor tip, rather
// than the mouse illustration's center, is the exact interaction location.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const center=r=>[r.x+r.width/2,r.y+r.height/2];
export function mouseDemoPlan({action,target,viewport,operator,gesture,shortcutOnly=false,keyboardInput=false,undo=false,zoomDirections=[]}){
 if(!viewport||keyboardInput||undo)return null;
 const v=viewport,inside=p=>[clamp(p[0],v.left+90,v.right-90),clamp(p[1],v.visibleY+100,v.y+v.height-90)];
 const focus=inside([(v.left+v.right)/2,v.visibleY+(v.y+v.height-v.visibleY)*.55]);
 let at=target?center(target):focus,frames=[],thenKeys=false;
 const add=(ms,point,label,button='',key='',wheel=0)=>frames.push({ms,point,button,key,wheel,label});
 const arrive=point=>{add(0,[point[0]-100,point[1]+75],'Move to the highlighted target');add(700,point,'Move to the highlighted target');add(950,point,'Mouse is on the target');};
 const click=(point,double=false)=>{arrive(point);add(1150,point,double?'LMB · first click':'LMB · click','left');add(1350,point,'Release LMB');if(double){add(1500,point,'LMB · second click','left');add(1700,point,'Release LMB');}add(double?2350:2050,point,double?'Double-click this exact field':'Click here');};
 const drag=(point,end,button,label)=>{arrive(point);add(1200,point,label,button);add(2550,end,label,button);add(2850,end,`Release ${button==='middle'?'MMB':'LMB'}`);add(3350,end,'Drag complete');};
 if(operator){
  if(operator.raw){
   if(operator.kind!=='bevel'||operator.segments>=3)return null;
   at=focus;arrive(at);let t=1150;for(let n=operator.segments;n<3;n++){add(t,at,'Scroll wheel up · add one segment','', '',1);add(t+350,at,'Wheel released');t+=700;}add(t+400,at,'Then press Enter');thenKeys=true;
  }else if(operator.visual){
   const start=inside([focus[0]+110,focus[1]]),middle=inside([start[0]+150,start[1]-60]),end=inside([middle[0]+70,middle[1]-30]);
   add(0,start,'Move mouse · no button held');add(1400,middle,'Move mouse · no button held');
   add(1700,middle,'Hold Shift · no mouse button','', 'Shift');add(3100,end,'Move slowly with Shift · no mouse button','', 'Shift');add(3400,end,'Release Shift');
   add(3800,end,'LMB · confirm the transform','left');add(4050,end,'Release LMB');add(4650,end,'Transform confirmed');
  }else return null;
 }else if(['pan','orbit','zoom'].includes(action)){
  if(!target)return null;
  const end=action==='zoom'?inside([at[0]-1,at[1]+(zoomDirections.includes(-1)?130:-130)]):inside([at[0]-170,at[1]+85]);
  // Keep zoom perfectly vertical, starting on the magnifier (including near
  // the edge of the viewport); no sideways displacement is needed.
  if(action==='zoom'){end[0]=at[0];end[1]=clamp(at[1]+(zoomDirections.includes(-1)?130:-130),v.visibleY+20,v.y+v.height-20);}
  drag(at,end,'left',action==='zoom'?'Hold LMB · drag the magnifier vertically':action==='pan'?'Hold LMB · drag the hand':'Hold LMB · drag the axes');
  if(action==='zoom'&&!zoomDirections.length){add(4000,at,'Return to the magnifier · button released');add(4300,at,'Hold LMB again','left');add(5650,[at[0],at[1]+130],'Hold LMB · drag down','left');add(5950,[at[0],at[1]+130],'Release LMB');add(6550,[at[0],at[1]+130],'Practice both directions');}
 }else if(action==='header-scroll'){
  if(!target)return null;drag(at,[Math.max(target.x+24,at[0]-180),at[1]],'middle','Hold MMB · drag the header left');
 }else if(gesture==='shift-click'){
  arrive(at);add(1100,at,'Hold Shift','', 'Shift');add(1500,at,'Shift + LMB · add to selection','left','Shift');add(1750,at,'Release LMB · keep Shift held','','Shift');add(2100,at,'Release Shift');add(2550,at,'Added to selection');
 }else if(gesture==='hover'){
  arrive(at);add(1700,at,'Hover here to open the submenu');add(2600,at,'No mouse button needed');
 }else if(shortcutOnly&&!gesture){click(focus);thenKeys=true;}
 else if(target){click(at,gesture==='double-click');thenKeys=gesture==='focus';}
 else return null;
 const description=gesture==='shift-click'?'Hold Shift, click LMB here, release LMB, then release Shift':gesture==='double-click'?'Double-click LMB here':gesture==='hover'?'Hover here · no mouse button':action==='zoom'?'Hold LMB and drag up, release; return and drag down':action==='header-scroll'?'Hold MMB and drag left, then release':['pan','orbit'].includes(action)?'Hold LMB and drag along the path, then release':operator?.visual?'Move without holding a button; use Shift for precision; LMB confirms':operator?.kind==='bevel'?'Scroll the wheel up for more segments':'Click LMB here';
 return {frames,duration:frames.at(-1).ms,thenKeys,description};
}
export function sampleMouseDemo(plan,time){
 const frames=plan.frames,t=clamp(time,0,plan.duration);let i=0;while(i+1<frames.length&&frames[i+1].ms<=t)i++;
 const from=frames[i],to=frames[i+1]||from,duration=to.ms-from.ms,u=duration?(t-from.ms)/duration:0,eased=u*u*(3-2*u);
 return {...from,point:from.point.map((v,k)=>v+(to.point[k]-v)*eased),done:time>=plan.duration};
}
export function createMouseDemo({stage,onComplete=()=>{},requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}){
 let frame=0,node=null,start=null,elapsed=0,plan=null,lastLabel='';
 function stop(){cancelFrame(frame);frame=0;node?.remove();node=null;plan=null;start=null;elapsed=0;}
 function paint(state){
  node.style.left=`${state.point[0]}px`;node.style.top=`${state.point[1]}px`;node.dataset.button=state.button;node.dataset.key=state.key;node.dataset.wheel=String(state.wheel);
  node.classList.toggle('place-left',state.point[0]>stage.clientWidth-300);node.classList.toggle('place-above',state.point[1]>stage.clientHeight-200);
  if(lastLabel!==state.label){node.querySelector('.bl-mouse-caption').textContent=state.label;lastLabel=state.label;}
  const key=node.querySelector('kbd');key.textContent=state.key;key.hidden=!state.key;
 }
 function tick(now){if(!node||!plan)return;start??=now;elapsed+=Math.min(80,Math.max(0,now-start));start=now;const state=sampleMouseDemo(plan,elapsed);paint(state);node.style.opacity=String(clamp((plan.duration+300-elapsed)/300,0,1));if(elapsed>=plan.duration+300){stop();onComplete();return;}frame=requestFrame(tick);}
 return {
  stop,
  play(next){stop();if(!next)return;plan=next;lastLabel='';node=document.createElement('div');node.className='bl-mouse-demo';node.setAttribute('aria-hidden','true');
   node.innerHTML='<svg class="bl-mouse-tip" viewBox="0 0 28 36"><path d="M1 1L24 22L14 23L20 33L14 35L8 25L1 31Z"/></svg><div class="bl-mouse-body"><svg viewBox="0 0 70 96"><rect class="mouse-shell" x="3" y="3" width="64" height="90" rx="30"/><path class="mouse-left" d="M34 6C16 6 6 18 6 34V44H34Z"/><path class="mouse-right" d="M38 6C55 6 64 18 64 34V44H38Z"/><path class="mouse-divider" d="M35 7V45M6 45H64"/><rect class="mouse-wheel" x="29" y="17" width="14" height="25" rx="6"/><path class="mouse-wheel-arrow" d="M36 11V-7M29 0L36-7L43 0"/></svg><kbd hidden></kbd></div><span class="bl-mouse-caption"></span>';
   stage.append(node);
   if(reducedMotion()){
    const pressed=plan.frames.find(f=>f.button||f.wheel||f.key)||plan.frames.at(-1);paint({...pressed,label:plan.description});node.classList.add('reduced-motion');
    const segments=plan.frames.slice(1).map((to,i)=>({from:plan.frames[i],to})).filter(({from,to})=>(from.button&&to.button===from.button||from.key&&to.key===from.key)&&Math.hypot(to.point[0]-from.point[0],to.point[1]-from.point[1])>10);
    if(segments.length){const path=document.createElementNS('http://www.w3.org/2000/svg','svg');path.classList.add('bl-mouse-path');path.setAttribute('viewBox',`0 0 ${stage.clientWidth} ${stage.clientHeight}`);Object.assign(path.style,{left:`${-pressed.point[0]}px`,top:`${-pressed.point[1]}px`,width:`${stage.clientWidth}px`,height:`${stage.clientHeight}px`});path.innerHTML=segments.map(({from,to})=>`<path d="M${from.point.join(' ')} L${to.point.join(' ')}"/><circle cx="${to.point[0]}" cy="${to.point[1]}" r="10"/>`).join('');node.prepend(path);}
    if(plan.thenKeys)onComplete();return;
   }
   frame=requestFrame(tick);
  },
  dispose:stop
 };
}
