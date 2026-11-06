import {loadProgress,saveProgress} from './progress.js';
import {createSound} from './sound.js';
import {createGuidance} from './guidance.js';
import {createCountdown} from './countdown.js';
import {captureReturnToCourse} from './return-to-course.js';

export async function startTutorial({lesson,createSimulator,root}){
 const $=selector=>root.querySelector(selector);
 const returnToCourse=captureReturnToCourse(lesson);
 let adapter,sound,guidance,frame=0,lastMistake=-Infinity,index=0,completed=new Set(),ready=false;
 const listeners=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:listeners.signal});
 const step=()=>lesson.steps[index],isCompleted=()=>completed.has(step().id);
 let storage;try{storage=localStorage;}catch{}
 const saved=loadProgress(lesson,storage);completed=new Set(saved.completed);index=lesson.steps.findIndex(s=>s.id===saved.current);
 function persist(){saveProgress(lesson,{current:step().id,completed:[...completed]},storage);}
 const unlocked=()=>{const i=lesson.steps.findIndex(s=>!s.terminal&&!completed.has(s.id));return i<0?lesson.steps.length-1:i;};
 const context={isCompleted,completedSteps:()=>lesson.steps.filter(s=>completed.has(s.id))};
 function updateGuidance(){adapter?.setGuidance(!isCompleted()&&!step().terminal);guidance?.update(isCompleted()||step().terminal?null:adapter?.getGuide());}
 function feedback(message){$('#feedback').classList.remove('error-feedback');$('#feedback').textContent=message;}
 function retry(message,region){
   if(!ready||performance.now()-lastMistake<850)return;lastMistake=performance.now();
   feedback(message);$('#feedback').classList.add('error-feedback');region??=adapter.getRegion();
   region.classList.add('error-flash');setTimeout(()=>region.classList.remove('error-flash'),650);sound.play('retry');
 }
 function updateProgress(){const total=lesson.steps.filter(s=>!s.terminal).length;
   $('#progress').max=total;$('#progress').value=completed.size;$('#percent').textContent=`${Math.round(completed.size/total*100)}%`;
   $('#step-count').textContent=step().terminal?'Practice complete':`STEP ${String(index+1).padStart(2,'0')} OF ${total}`;
   $('#lesson-map').replaceChildren();lesson.steps.forEach((item,i)=>{
     const li=document.createElement('li'),b=document.createElement('button');b.textContent=(completed.has(item.id)?'✓ ':'')+item.title;
     b.classList.toggle('current',i===index);b.disabled=i>unlocked();b.addEventListener('click',()=>go(i));li.append(b);$('#lesson-map').append(li);
   });
 }
 function cancelPause(){cancelAnimationFrame(frame);frame=0;$('#completion-notice').hidden=true;}
 function showCompletion(){
   if(!ready||!isCompleted()||step().terminal)return;cancelPause();updateGuidance();
   $('#review-step').hidden=false;$('#control-status').textContent='Task complete · Open step summary to continue';
   $('#completion-count').textContent=`STEP ${index+1} OF ${lesson.steps.filter(s=>!s.terminal).length} COMPLETE`;
   const finalTask=!!lesson.steps[index+1]?.terminal;
   $('#completion-title').textContent=finalTask?'You finished the tutorial':step().title;$('#completion-explanation').textContent=step().done;
   $('#completion-reminder').textContent=step().text;
   $('#completion-next').hidden=finalTask;$('#completion-next').textContent=`Next: ${lesson.steps[index+1]?.title||'Tutorial complete'}`;
   $('#next').textContent=finalTask?'Back to course':'Continue →';
   $('#review-workspace').textContent=finalTask?'Close popup to keep interacting with the simulation':'Review workspace';
   adapter.setPaused(true);if(!$('#completion-dialog').open)$('#completion-dialog').showModal();$('#next').focus({preventScroll:true});
 }
 function partial(message,{title='Good! Keep going.'}={}){
   $('#partial-title').textContent=title;$('#partial-message').textContent=message;$('#partial-notice').hidden=false;sound.play('partial');
 }
 function finish(){
   if(!ready||isCompleted()||step().terminal)return;
   $('#partial-notice').hidden=true;completed.add(step().id);feedback('');persist();updateProgress();adapter.refreshState();updateGuidance();
   $('#next').disabled=false;$('#review-step').hidden=false;sound.play(step().quiz?'complete':'success');
   if(!step().completionDelayMs){showCompletion();return;}
   const active=step().id,timer=createCountdown(step().completionDelayMs,performance.now());
   $('#completion-notice').hidden=false;$('#completion-seconds').textContent=String(Math.ceil(step().completionDelayMs/1000));$('#completion-countdown').value=0;
   $('#review-step').hidden=true;$('#control-status').textContent='Good! Keep practicing while the countdown finishes';
   function tick(now){if(step().id!==active){cancelPause();return;}const t=timer.tick(now,!document.hidden);
     $('#completion-seconds').textContent=String(t.seconds);$('#completion-countdown').value=t.progress;
     if(t.done){showCompletion();return;}frame=requestAnimationFrame(tick);
   }frame=requestAnimationFrame(tick);
 }
 function render(){
   const s=step();$('#partial-notice').hidden=true;feedback('');$('#chapter').textContent=s.chapter;$('#lesson-title').textContent=s.title;$('#lesson-text').textContent=s.text;$('#task').textContent=s.task;
   $('#back').disabled=index===0;$('#review-step').hidden=!isCompleted()||s.terminal;$('#next').disabled=!isCompleted();$('#back-to-course').hidden=!s.terminal;
   $('.lesson-panel').classList.toggle('completed',!!s.terminal);
   $('#control-status').textContent=s.controlStatus||'Only the highlighted area is active';
   $('#practice-tools').hidden=!s.tools;$('#practice-buttons').replaceChildren();
   for(const [action,label] of s.tools||[]){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>adapter.perform(action));$('#practice-buttons').append(b);}
   if(s.keyboard){const p=document.createElement('p');p.className='small-note';p.textContent=`${s.keyboard} Touch: use the practice buttons above.`;$('#practice-buttons').append(p);}
   $('#quiz').hidden=!s.quiz;$('#quiz').replaceChildren();
   s.quiz?.answers.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.disabled=isCompleted();b.addEventListener('click',()=>{b.classList.add(i===s.quiz.correct?'correct':'wrong');if(i===s.quiz.correct){finish();$('#quiz').querySelectorAll('button').forEach(button=>button.disabled=true);}else retry(s.quiz.retry,$('.lesson-panel'));});$('#quiz').append(b);});
   adapter.setStep(s,context);adapter.setPaused(false);updateProgress();updateGuidance();
   if(s.terminal)feedback(s.done);
   requestAnimationFrame(()=>{updateGuidance();if(isCompleted())showCompletion();});
 }
 function go(next){cancelPause();$('#completion-dialog').close();index=Math.max(0,Math.min(lesson.steps.length-1,next,unlocked()));render();persist();$('#lesson-title').focus({preventScroll:true});}
 try{
   const response=await fetch(new URL('./shell.html',import.meta.url));if(!response.ok)throw new Error('Lesson shell unavailable');root.innerHTML=await response.text();
   document.body.classList.toggle('embed-mode',new URLSearchParams(location.search).get('embed')==='1');
   $('#catalog-link').href=new URL('../../',import.meta.url);$('#credits-link').href=new URL('../../credits.html',import.meta.url);
   for(const [id,value] of [['course-title',lesson.title],['course-subtitle',lesson.subtitle],['course-eyebrow',lesson.eyebrow],['simulator-label',lesson.simulatorLabel],['simulation-note',lesson.simulationNote||'Practice simulation']])$('#'+id).textContent=value;
   sound=createSound($('#sound-toggle'));guidance=createGuidance(root);
   $('#restart').disabled=true;$('#back').disabled=true;
   $('#lesson-title').textContent='Loading your practice workspace…';
   adapter=await createSimulator({container:$('#simulator-mount'),lesson,api:{complete:finish,retry,feedback,partial,guideChanged:()=>requestAnimationFrame(updateGuidance)}});
   ready=true;$('#restart').disabled=false;
   on($('#next'),'click',()=>{if(isCompleted()){if(lesson.steps[index+1]?.terminal)returnToCourse();else go(index+1);}});on($('#back'),'click',()=>go(index-1));
   on($('#back-to-course'),'click',returnToCourse);
   on($('#review-step'),'click',showCompletion);on($('#review-workspace'),'click',()=>{if(lesson.steps[index+1]?.terminal)go(index+1);else $('#completion-dialog').close();});
   on($('#completion-dialog'),'close',()=>adapter.setPaused($('#completion-dialog').open));
   on($('#completion-dialog'),'cancel',event=>{if(lesson.steps[index+1]?.terminal){event.preventDefault();go(index+1);}});
   on($('#restart'),'click',()=>{completed.clear();adapter.reset();go(0);});
   render();
 }catch(error){
   console.error(error);adapter?.dispose();
   const panel=document.createElement('div');panel.className='load-error';panel.setAttribute('role','alert');
   const p=document.createElement('p');p.textContent='The practice workspace could not load. Check your connection and reload, or try another browser. Your saved progress is safe.';
   const b=document.createElement('button');b.className='primary';b.textContent='Retry loading';b.onclick=()=>location.reload();panel.append(p,b);root.replaceChildren(panel);
 }
 return {dispose(){cancelAnimationFrame(frame);listeners.abort();guidance?.dispose();adapter?.dispose();sound?.dispose();root.replaceChildren();}};
}
