import {narrationText} from './narration-text.js';

export const narrationSpeeds=[.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3];
export function validSpeed(value){const n=Number(value);return narrationSpeeds.includes(n)?n:1;}
export function narrationQueue(phase,fields){return (phase==='summary'?['summary']:['description','controls','task']).filter(kind=>fields[kind]);}
const stamp=seconds=>{const n=Math.max(0,Math.floor(seconds||0));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};

// One media element prevents overlapping narration and preserves audio permission
// across passages. No audio state participates in tutorial completion.
export function createNarration({root,lesson,storage,media=new Audio(),fetcher=fetch}){
 const abort=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
 let manifest,step,fields={},phase='step',active=null,queue=[],generation=0,disposed=false,blocked=false;
 let speed=1,autoplay=true;
 try{speed=validSpeed(storage?.getItem('amas-narration-speed'));autoplay=storage?.getItem('amas-narration-autoplay')!=='off';}catch{}
 const players=new Map(),base=new URL('../narration/',import.meta.url);
 media.preload='metadata';media.preservesPitch=true;
 function save(key,value){try{storage?.setItem(key,String(value));}catch{}}
 const settings=root.querySelector('#narration-settings');
 settings.innerHTML='<label><input type="checkbox" checked> Auto-play narration</label><label>Speed <select aria-label="Narration speed"></select></label><small>AI voice · Listen or continue at any time</small>';
 const toggle=settings.querySelector('input'),select=settings.querySelector('select');toggle.checked=autoplay;
 for(const value of narrationSpeeds){const o=document.createElement('option');o.value=String(value);o.textContent=`${value}×`;select.append(o);}select.value=String(speed);
 on(select,'change',()=>{speed=validSpeed(select.value);media.playbackRate=speed;save('amas-narration-speed',speed);for(const p of players.values())p.speed.value=String(speed);});
 on(toggle,'change',()=>{autoplay=toggle.checked;save('amas-narration-autoplay',autoplay?'on':'off');if(!autoplay)stop();else startPhase();});
 const mounts=[['description','lesson-text','Description'],['controls','input-controls','Device controls'],['task','task','Your turn'],['summary','completion-explanation','Step summary'],['reminder','completion-reminder','Replay step description'],['quiz','quiz-prompt','Quick check']];
 for(const [kind,id,label] of mounts){
  const host=document.createElement('div');host.className='narration-player';host.dataset.narration=kind;host.hidden=true;
  const play=document.createElement('button');play.type='button';play.textContent='▶';play.setAttribute('aria-label',`Play ${label.toLowerCase()}`);
  const seek=document.createElement('input');seek.type='range';seek.min=0;seek.max=0;seek.value=0;seek.step=.1;seek.disabled=true;seek.setAttribute('aria-label',`Seek ${label.toLowerCase()}`);
  const time=document.createElement('span');time.className='narration-time';time.textContent='0:00';
  const rate=document.createElement('select');rate.setAttribute('aria-label',`${label} playback speed`);
  for(const value of narrationSpeeds){const o=document.createElement('option');o.value=String(value);o.textContent=`${value}×`;rate.append(o);}rate.value=String(speed);
  const status=document.createElement('small');status.className='narration-status';status.textContent=label;
  host.append(play,seek,time,rate,status);root.querySelector('#'+id).after(host);
  const player={kind,host,play,seek,time,speed:rate,status,label,position:0};players.set(kind,player);
  on(play,'click',()=>{if(active===kind&&!media.paused){media.pause();blocked=false;update();}else{if(active!==kind)queue=[];playKind(kind);}});
  on(seek,'input',()=>{player.position=Number(seek.value);if(active===kind)media.currentTime=player.position;player.time.textContent=`${stamp(player.position)} / ${stamp(Number(seek.max))}`;});
  on(rate,'change',()=>{select.value=rate.value;select.dispatchEvent(new Event('change'));});
 }
 function entry(kind){return fields[kind==='reminder'?'description':kind];}
 function update(){
  for(const p of players.values()){
   const current=active===p.kind,playing=current&&!media.paused;
   p.play.textContent=playing?'Ⅱ':'▶';p.play.setAttribute('aria-label',`${playing?'Pause':'Play'} ${p.label.toLowerCase()}`);
   p.host.classList.toggle('is-playing',playing);
   if(current&&Number.isFinite(media.duration)){p.seek.max=media.duration;p.seek.disabled=false;p.position=media.currentTime;p.seek.value=p.position;p.time.textContent=`${stamp(p.position)} / ${stamp(media.duration)}`;}
  }
 }
 function stop(){generation++;queue=[];blocked=false;media.pause();active=null;update();}
 async function playKind(kind){
  const p=players.get(kind),item=entry(kind);if(disposed||!item)return;
  const token=++generation;blocked=false;
  if(active!==kind){media.pause();active=kind;media.src=new URL(item.file,base).href;if(p.position>=(item.duration||Infinity)-.1)p.position=0;media.currentTime=p.position;}
  else if(media.ended)media.currentTime=0;
  if(media.error)media.load();
  media.playbackRate=speed;
  try{await media.play();if(token!==generation)return;p.status.textContent=p.label;}
  catch(error){if(token!==generation)return;if(error.name==='NotAllowedError'){blocked=true;p.status.textContent='Press Play to hear narration.';}else if(error.name!=='AbortError'){queue=[];p.status.textContent='Audio could not load. Press Play to retry; you can keep learning.';}}
  update();
 }
 function startPhase(){if(!manifest||!step||disposed||!autoplay||phase==='pending-summary')return;queue=narrationQueue(phase,fields);const first=queue.shift();if(first)playKind(first);}
 function assign(){
  const records=manifest?.lessons?.[`${lesson.software}/${lesson.id}`]?.[step.id]||{},texts=narrationText(step);fields={};
  for(const [kind,record] of Object.entries(records)){const clip=manifest.clips[record.id];if(clip&&record.display===texts[kind])fields[kind]=clip;}
  for(const p of players.values()){
   p.position=0;p.seek.value=0;p.seek.max=entry(p.kind)?.duration||0;p.seek.disabled=!Number(p.seek.max);p.time.textContent=`0:00 / ${stamp(Number(p.seek.max))}`;p.status.textContent=p.label;
   p.host.hidden=!entry(p.kind);p.play.disabled=!entry(p.kind);
  }
 }
 on(media,'timeupdate',update);on(media,'loadedmetadata',update);on(media,'play',update);on(media,'pause',update);
 on(media,'ended',()=>{update();const next=queue.shift();if(next)playKind(next);});
 on(media,'error',()=>{queue=[];const p=players.get(active);if(p)p.status.textContent='Audio could not load. Press Play to retry; you can keep learning.';update();});
 // A normal first interaction can unlock autoplay; explicit pause/off always wins.
 function unlock(event){if(blocked&&autoplay&&!event.target.closest('.narration-player, #narration-settings'))playKind(active);}
 on(root,'pointerup',unlock);on(root,'keydown',unlock);
 on(window,'pagehide',stop);
 const ready=fetcher(new URL('manifest.json?v=narration-1',base)).then(r=>{if(!r.ok)throw Error('Narration manifest unavailable');return r.json();}).then(value=>{if(disposed)return;manifest=value;if(step){assign();startPhase();}}).catch(()=>{if(disposed)return;settings.querySelector('small').textContent='Narration unavailable. You can continue without audio.';for(const p of players.values())p.host.hidden=true;});
 return {
  ready,
  setStep(value,{summary=false}={}){stop();step=value;phase=summary?'pending-summary':'step';assign();if(!summary)startPhase();},
  openSummary(){if(phase==='summary'&&active)return;stop();phase='summary';startPhase();},
  closeSummary(){if(phase!=='summary')return;stop();phase='step';},
  stop,
  dispose(){disposed=true;stop();abort.abort();media.removeAttribute('src');media.load();for(const p of players.values())p.host.remove();settings.replaceChildren();}
 };
}
