import {createMouseDemo,mouseDemoPlan} from './mouse-demo.js?v=input-sequence-1';
import {modalReady} from './native-modal.js?v=input-5';

// A demonstration describes input, but never dispatches it to the simulator.
// Keep mouse and keyboard in one queue so neither can run ahead of the other.
export function inputDemoPlan(context){
 const {step,operator,keyboardInput,undo,viewport,gesture}=context,s=step.simulation;
 const base={...context,action:s.action,shortcutOnly:s.shortcutOnly&&gesture==='focus',operator:operator?{...operator,visual:s.visual}:null};
 const nameKeys=['Shift+D','e','s','k','Space','Shift+T','r','a','y','Enter'];
 const parts=[],mouse=p=>{if(p)parts.push({type:'mouse',plan:p});},keys=k=>{if(k.length)parts.push({type:'keys',keys:k});};
 const numeric=()=>[...String(s.value)];
 const visual=()=>mouse(mouseDemoPlan({...base,operator:{kind:s.action,raw:'',visual:true}}));
 const bevel=segments=>mouse(mouseDemoPlan({...base,keyboardInput:false,operator:{kind:'bevel',raw:String(s.value),segments}}));
 if(undo){keys(['Ctrl+Z']);}
 else if(operator){
  if(s.visual){keys(Array(operator.raw.length).fill('Backspace'));visual();}
  else if(s.action==='extrude-cancel'){keys(['Escape','Ctrl+Z']);}
  else if(modalReady(operator,s.value)){keys(['Enter']);}
  else{
   keys([...Array(operator.raw.length).fill('Backspace'),...(['move','rotate'].includes(operator.kind)?[operator.kind==='move'?'X':'Z'].filter(k=>operator.axis!==k.toLowerCase()):[]),...numeric()]);
   if(operator.kind==='bevel')bevel(operator.segments);
   keys(['Enter']);
  }
 }else if(keyboardInput){keys(s.action==='field'?['Ctrl+A',...numeric(),'Enter']:['Ctrl+A',...nameKeys]);}
 else{
  mouse(mouseDemoPlan(base));
  if(s.action==='field')keys([...numeric(),'Enter']);
  else if(gesture==='focus'){
   if(s.visual){keys([step.keys[0]]);visual();}
   else if(s.action==='rename')keys(['F2',...nameKeys]);
   else if(s.action==='bevel'){keys(['Ctrl+B',...numeric()]);bevel(1);keys(['Enter']);}
   else keys(step.keys||[]);
  }
 }
 return {parts,point:[(viewport.left+viewport.right)/2,viewport.visibleY+(viewport.y+viewport.height-viewport.visibleY)*.65]};
}

export const keyDuration=1150;
export function sampleKeyDemo(keys,time){
 const index=Math.min(keys.length-1,Math.floor(time/keyDuration)),local=time-index*keyDuration;
 return {key:keys[index],index,pressed:local>=300&&local<680,opacity:Math.max(0,Math.min(1,local/200,(1000-local)/200)),done:time>=keys.length*keyDuration};
}

export function createInputDemo({stage,onKey=()=>{},requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}){
 let queue=[],point=[],frame=0,node=null,last=null,elapsed=0,shown=-1,active=false,version=0;
 const mouse=createMouseDemo({stage,requestFrame,cancelFrame,reducedMotion,onComplete:next});
 function removeKeys(){cancelFrame(frame);frame=0;node?.remove();node=null;onKey('');}
 function stop(){version++;queue=[];active=false;mouse.stop();removeKeys();}
 function keycaps(parent,key){key.split('+').forEach((part,i)=>{if(i)parent.append(document.createTextNode(' + '));const cap=document.createElement('kbd');cap.textContent=part;parent.append(cap);});}
 function next(){
  removeKeys();const part=queue.shift();if(!part){active=false;return;}
  if(part.type==='mouse'){mouse.play(part.plan);return;}
  node=document.createElement('div');node.className='bl-key-demo';node.setAttribute('aria-hidden','true');node.style.left=`${point[0]}px`;node.style.top=`${point[1]}px`;node.style.opacity='0';stage.append(node);
  elapsed=0;last=null;shown=-1;const token=version;
  function tick(now){
   if(token!==version||!node)return;last??=now;elapsed+=Math.min(80,Math.max(0,now-last));last=now;
   const state=sampleKeyDemo(part.keys,elapsed);if(state.done){next();return;}
   if(shown!==state.index){shown=state.index;node.replaceChildren();const caps=document.createElement('div');caps.className='bl-demo-keycaps';keycaps(caps,state.key);const caption=document.createElement('span');caption.textContent=`Press ${state.key} · ${state.index+1} of ${part.keys.length}`;node.append(caps,caption);}
   node.dataset.key=state.key;node.dataset.pressed=String(state.pressed);node.style.opacity=String(state.opacity);onKey(state.pressed?state.key:'');frame=requestFrame(tick);
  }
  frame=requestFrame(tick);
 }
 return {
  play(plan){
   stop();if(!plan?.parts.length)return;point=plan.point;
   if(reducedMotion()){
    // Respect reduced motion with the whole ordered sequence, without moving,
    // flashing keys, or losing the keyboard half of a mixed demonstration.
    node=document.createElement('ol');node.className='bl-input-demo-static';node.setAttribute('aria-label','Input sequence');
    for(const p of plan.parts){const item=document.createElement('li');if(p.type==='mouse')item.textContent=p.plan.description;else p.keys.forEach((key,i)=>{if(i)item.append(' → ');keycaps(item,key);});node.append(item);}stage.append(node);return;
   }
   queue=[...plan.parts];active=true;next();
  },
  stop,dispose:stop,isPlaying:()=>active
 };
}
