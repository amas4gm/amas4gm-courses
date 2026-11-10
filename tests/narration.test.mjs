import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {createNarration,narrationQueue,validSpeed,narrationSpeeds} from '../shared/teaching/narration.js';
import {narrationText,spokenText} from '../shared/teaching/narration-text.js';
import {software} from '../shared/catalog-data.js';
const shell=await readFile(new URL('../shared/teaching/shell.html',import.meta.url),'utf8');
const step={id:'first',text:'Instruction.',task:'Click here.',done:'You did it.',controls:[['Mouse','Drag.']],quiz:{prompt:'Why?'}};
function setup({autoplay='on',delayed=false,blocked=false}={}){
 const win=new Window();globalThis.window=win;globalThis.document=win.document;globalThis.Event=win.Event;
 const root=win.document.body;root.innerHTML=shell;
 const media=new win.EventTarget();Object.assign(media,{paused:true,ended:false,duration:12,currentTime:0,playbackRate:1,src:'',calls:[],fail:blocked,
  async play(){this.calls.push(this.src);if(this.fail){const e=Error('Blocked');e.name='NotAllowedError';throw e;}this.paused=false;this.dispatchEvent(new win.Event('play'));},
  pause(){this.paused=true;this.dispatchEvent(new win.Event('pause'));},removeAttribute(){},load(){},
  end(){this.paused=true;this.ended=true;this.dispatchEvent(new win.Event('ended'));}
 });
 const records=Object.fromEntries(Object.entries(narrationText(step)).map(([kind,display])=>[kind,{id:kind,display}]));
 const manifest={lessons:{'test/course':{first:records,second:records}},clips:Object.fromEntries(Object.keys(records).map(kind=>[kind,{file:`${kind}.mp3`,duration:12}]))};
 const values=new Map([['amas-narration-autoplay',autoplay]]),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 let resolve;const pending=new Promise(r=>resolve=r);
 const n=createNarration({root,lesson:{software:'test',id:'course'},media,storage,fetcher:()=>delayed?pending:Promise.resolve({ok:true,json:async()=>manifest})});
 const player=kind=>root.querySelector(`[data-narration="${kind}"]`);
 return {n,root,media,player,values,resolve:()=>resolve({ok:true,json:async()=>manifest}),cleanup:()=>{n.dispose();win.happyDOM.abort();}};
}
test('automatic order reads instructions then task, but only the after-step text in summary',()=>{
 assert.deepEqual(narrationQueue('step',{description:1,controls:1,task:1,summary:1}),['description','controls','task']);
 assert.deepEqual(narrationQueue('summary',{description:1,task:1,summary:1,quiz:1}),['summary']);
 assert.equal(validSpeed(.75),.75);assert.equal(validSpeed(3),3);assert.equal(validSpeed(99),1);assert.equal(narrationSpeeds.length,10);
});
test('summary interrupts instructions; replay replaces summary instead of overlapping',async()=>{
 const q=setup();await q.n.ready;q.n.setStep(step);assert.match(q.media.src,/description.mp3$/);q.media.end();assert.match(q.media.src,/controls.mp3$/);
 q.n.openSummary();assert.match(q.media.src,/summary.mp3$/);q.player('reminder').querySelector('button').click();assert.match(q.media.src,/description.mp3$/);
 const count=q.media.calls.length;q.media.end();assert.equal(q.media.calls.length,count);q.cleanup();
});
test('completed-step reload never starts description, even with a late manifest',async()=>{
 const q=setup({delayed:true});q.n.setStep(step,{summary:true});q.n.openSummary();q.resolve();await q.n.ready;assert.equal(q.media.calls.length,1);assert.match(q.media.src,/summary.mp3$/);q.cleanup();
});
test('audio speed is shared, persisted, and preserved on track changes',async()=>{
 const q=setup();await q.n.ready;q.n.setStep(step);const select=q.player('description').querySelector('select');select.value='3';select.dispatchEvent(new Event('change'));
 assert.equal(q.media.playbackRate,3);assert.equal(q.values.get('amas-narration-speed'),'3');q.n.openSummary();assert.equal(q.media.playbackRate,3);
 assert.equal(q.player('summary').querySelector('select').value,'3');q.cleanup();
});
test('replaying a finished passage starts at the beginning after another passage played',async()=>{
 const q=setup();await q.n.ready;q.n.setStep(step);q.media.currentTime=12;q.media.end();assert.match(q.media.src,/controls.mp3$/);
 q.player('description').querySelector('button').click();assert.match(q.media.src,/description.mp3$/);assert.equal(q.media.currentTime,0);q.cleanup();
});
test('seek works before playback; explicit pause and autoplay off do not block progress',async()=>{
 const q=setup({autoplay:'off'});await q.n.ready;q.n.setStep(step);assert.equal(q.media.calls.length,0);
 const seek=q.player('description').querySelector('input');assert.equal(seek.disabled,false);seek.value='5';seek.dispatchEvent(new Event('input'));
 q.player('description').querySelector('button').click();assert.equal(q.media.currentTime,5);q.player('description').querySelector('button').click();assert.equal(q.media.paused,true);
 q.n.openSummary();assert.equal(q.media.paused,true);q.n.setStep({...step,id:'second'});assert.equal(q.media.paused,true);q.cleanup();
});
test('autoplay rejection offers Play; leaving or disposing cancels pending playback',async()=>{
 const q=setup({blocked:true});await q.n.ready;q.n.setStep(step);await Promise.resolve();assert.match(q.player('description').textContent,/Press Play/);
 q.media.fail=false;q.player('description').querySelector('button').click();assert.equal(q.media.paused,false);q.n.openSummary();q.n.closeSummary();assert.equal(q.media.paused,true);q.cleanup();
 const late=setup({delayed:true});late.n.setStep(step);late.n.dispose();late.resolve();await late.n.ready;assert.equal(late.media.calls.length,0);late.cleanup();
});
test('unlocking blocked autoplay and pausing/resuming preserve the instruction queue',async()=>{
 const q=setup({blocked:true});await q.n.ready;q.n.setStep(step);await Promise.resolve();q.media.fail=false;
 q.player('description').querySelector('button').click();q.player('description').querySelector('button').click();assert.equal(q.media.paused,true);
 q.player('description').querySelector('button').click();q.media.end();assert.match(q.media.src,/controls.mp3$/);q.media.end();assert.match(q.media.src,/task.mp3$/);q.cleanup();
});
test('every catalog lesson has narration tied to its current displayed text',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../shared/narration/manifest.json',import.meta.url),'utf8'));
 for(const app of software)for(const tutorial of app.tutorials){
  const {default:lesson}=await import(`../${app.id}/${tutorial.id}/lesson.js`);
  for(const s of lesson.steps)for(const [kind,display] of Object.entries(narrationText(s))){if(!display)continue;const entry=manifest.lessons[`${lesson.software}/${lesson.id}`][s.id][kind];assert.equal(entry.display,display);assert.equal(manifest.clips[entry.id].text,spokenText(display));}
 }
});
test('every narration entry includes a nonempty MP3, duration, and provider provenance',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../shared/narration/manifest.json',import.meta.url),'utf8'));
 for(const [id,clip] of Object.entries(manifest.clips)){
  assert.ok(clip.duration>0,`${id}: duration`);assert.ok(clip.generationId,`${id}: provenance`);
  const bytes=await readFile(new URL(`../shared/narration/${clip.file}`,import.meta.url));assert.ok(bytes.length>500,`${id}: nonempty`);
  assert.ok(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),`${id}: MP3 header`);
 }
});
