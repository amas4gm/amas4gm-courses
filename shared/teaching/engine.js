import {loadProgress,saveProgress,retryStepProgress,completedThroughStep} from './progress.js?v=usability-2';
import {createSound} from './sound.js';
import {createGuidance} from './guidance.js';
import {createCountdown,completionPause} from './countdown.js?v=completion-pause-1';
import {captureReturnToCourse} from './return-to-course.js';

export async function startTutorial({lesson,createSimulator,root}){
 const $=selector=>root.querySelector(selector);
 const returnToCourse=captureReturnToCourse(lesson);
 let adapter,sound,guidance,frame=0,lastMistake=-Infinity,index=0,completed=new Set(),practiced=new Set(),ready=false;
 const listeners=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:listeners.signal});
 const step=()=>lesson.steps[index],isCompleted=()=>completed.has(step().id);
 const actionDone=()=>isCompleted()||practiced.has(step().id);
 let storage;try{storage=localStorage;}catch{}
 const saved=loadProgress(lesson,storage);completed=new Set(saved.completed);practiced=new Set(saved.practiced);index=lesson.steps.findIndex(s=>s.id===saved.current);
 function persist(){saveProgress(lesson,{current:step().id,completed:[...completed],practiced:[...practiced]},storage);}
 const unlocked=()=>{const i=lesson.steps.findIndex(s=>!s.terminal&&!completed.has(s.id));return i<0?lesson.steps.length-1:i;};
 const context={isCompleted:actionDone,completedSteps:()=>completedThroughStep(lesson,completed,practiced,index)};
 function updateGuidance(){adapter?.setGuidance(!actionDone()&&!step().terminal);guidance?.update(actionDone()||step().terminal?null:adapter?.getGuide());}
 function feedback(message){$('#feedback').classList.remove('error-feedback');$('#feedback').textContent=message;}
 function retry(message,region,output=$('#feedback')){
   if(!ready||performance.now()-lastMistake<850)return;lastMistake=performance.now();
   output.textContent=message;output.classList.add('error-feedback');region??=adapter.getRegion();
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
   if(!ready||!actionDone()||step().terminal)return;cancelPause();updateGuidance();
   $('#review-step').hidden=false;$('#control-status').textContent=isCompleted()?'Task complete · Open step summary to continue':'Action complete · Open the quick check to continue';
   $('#completion-count').textContent=`STEP ${index+1} OF ${lesson.steps.filter(s=>!s.terminal).length} ${isCompleted()?'COMPLETE':'· QUICK CHECK'}`;
   const finalTask=!!lesson.steps[index+1]?.terminal;
   $('#completion-title').textContent=finalTask&&isCompleted()?'You finished the tutorial':step().title;$('#completion-explanation').textContent=step().done;
   $('#completion-reminder').textContent=step().text;
   $('#completion-next').hidden=finalTask;$('#completion-next').textContent=`Next: ${lesson.steps[index+1]?.title||'Tutorial complete'}`;
   $('#next').textContent=finalTask?'Back to course':'Continue →';
   $('#next').disabled=!isCompleted();$('#restart-from-completion').hidden=!finalTask||!isCompleted();
   $('#previous-step').disabled=index===0;$('#keep-interacting').hidden=!finalTask||!isCompleted();
   renderQuiz();adapter.setPaused(true);if(!$('#completion-dialog').open)$('#completion-dialog').showModal();
   if(step().quiz?.type==='external-cost'&&!isCompleted()){$('#completion-title').tabIndex=-1;$('#completion-title').focus({preventScroll:true});$('#completion-dialog').scrollTop=0;}else (isCompleted()?$('#next'):$('#quiz button'))?.focus({preventScroll:true});
 }
 function renderQuiz(){
   const quiz=step().quiz;$('#completion-dialog').classList.toggle('external-cost',quiz?.type==='external-cost');$('#completion-quiz').hidden=!quiz;$('#quiz').replaceChildren();
   $('#quiz-feedback').classList.remove('error-feedback');$('#quiz-feedback').textContent='';
   if(!quiz)return;$('#quiz-prompt').textContent=quiz.prompt;
   if(isCompleted())$('#quiz-feedback').textContent=quiz.success||'Correct. You can continue.';
   if(quiz.type==='external-cost'){renderCostExercise(quiz);return;}
   quiz.answers.forEach((answer,i)=>{
     const button=document.createElement('button');button.textContent=answer;button.disabled=isCompleted();
     if(isCompleted()&&i===quiz.correct)button.classList.add('correct');
     button.addEventListener('click',()=>{
       if(i!==quiz.correct){button.classList.add('wrong');retry(quiz.retry,$('#completion-dialog'),$('#quiz-feedback'));return;}
       completed.add(step().id);practiced.delete(step().id);persist();updateProgress();
       sound.play(lesson.steps[index+1]?.terminal?'complete':'success');showCompletion();
     });$('#quiz').append(button);
   });
 }
 function renderCostExercise(quiz){
   const active=step().id,host=$('#quiz'),form=document.createElement('form');form.className='calculator-exercise';
   form.innerHTML=`<p class="calculator-practice-note"><strong>This is practice.</strong> Filling out the calculator or choosing Add to bill does not charge you or take a payment. You do not need to print or save a bill for this tutorial.</p><ol><li>Open the calculator in a new tab. Name the job <strong>Benchy practice</strong> and choose <strong>X2D</strong>.</li><li>Enter material cost <strong>$${quiz.job.materialCost.toFixed(2)}</strong>, print time <strong>${quiz.job.printHours} hour ${quiz.job.printMinutes} minutes</strong>, and leave staff labor at <strong>0</strong>.</li><li>Choose <strong>Add to bill</strong> and read the final cost for Benchy in the Bill section.</li><li>Return to this tab and enter this Benchy job’s final cost below.</li></ol><a class="calculator-launch" target="_blank" rel="noopener">Open AMAS calculator ↗</a><label class="bill-check"><input type="checkbox" required> I added Benchy to the practice bill and checked its final cost.</label><label class="cost-answer">Final Benchy cost ($)<input inputmode="decimal" autocomplete="off" required placeholder="0.00" aria-label="Final Benchy cost in dollars"></label><button type="submit">Check final cost</button>`;
   const link=form.querySelector('a'),input=form.querySelector('.cost-answer input'),check=form.querySelector('input[type=checkbox]'),button=form.querySelector('button');link.href=quiz.url;
   let opened=false;link.addEventListener('click',()=>{opened=true;});
   if(isCompleted()){input.disabled=true;check.disabled=true;check.checked=true;button.disabled=true;button.textContent='Cost checked ✓';}
   form.addEventListener('submit',async event=>{event.preventDefault();
     if(isCompleted()||button.disabled)return;
     if(!opened){retry('Open the calculator using the link above and practice preparing your bill first.',$('#completion-dialog'),$('#quiz-feedback'));return;}
     button.disabled=true;button.textContent='Checking current pricing…';$('#quiz-feedback').textContent='';
     let result;try{result=await quiz.validate(input.value);}catch{result={ok:false,message:'Pricing could not be checked. Please try again.'};}
     if(step().id!==active||!form.isConnected)return;
     button.disabled=false;button.textContent='Check final cost';
     if(!result.ok){retry(result.message,$('#completion-dialog'),$('#quiz-feedback'));return;}
     completed.add(active);practiced.delete(active);persist();updateProgress();sound.play('success');showCompletion();
   });host.append(form);
 }
 function partial(message,{title='Good! Keep going.',tone='partial'}={}){
   if(tone!=='retry')feedback('');
   $('#partial-title').textContent=title;$('#partial-message').textContent=message;$('#partial-notice').classList.toggle('retry-notice',tone==='retry');$('#partial-notice').hidden=false;sound.play(tone);
 }
 function finish(){
   if(!ready||actionDone()||step().terminal)return;
   $('#partial-notice').hidden=true;(step().quiz?practiced:completed).add(step().id);feedback('');persist();updateProgress();adapter.refreshState();updateGuidance();
   $('#next').disabled=!isCompleted();$('#review-step').hidden=false;sound.play('success');
   const pause=completionPause(step());adapter.setPaused(!pause.practice);
   const active=step().id,timer=createCountdown(pause.durationMs,performance.now());
   $('#completion-notice').hidden=false;$('#completion-message').textContent=pause.message;$('#completion-seconds').textContent=String(Math.ceil(pause.durationMs/1000));$('#completion-countdown').value=0;
   $('#review-step').hidden=true;$('#control-status').textContent=pause.practice?'Good! Keep practicing while the countdown finishes':'Step complete · Take a moment to see what changed';
   function tick(now){if(step().id!==active){cancelPause();return;}const t=timer.tick(now,!document.hidden);
     $('#completion-seconds').textContent=String(t.seconds);$('#completion-countdown').value=t.progress;
     if(t.done){showCompletion();return;}frame=requestAnimationFrame(tick);
   }frame=requestAnimationFrame(tick);
 }
 function render(){
   const s=step();$('#partial-notice').hidden=true;feedback('');$('#chapter').textContent=s.chapter;$('#lesson-title').textContent=s.title;$('#lesson-text').textContent=s.text;$('#task').textContent=s.task;
   $('#back').disabled=index===0;$('#review-step').hidden=!actionDone()||s.terminal;$('#next').disabled=!isCompleted();$('#back-to-course').hidden=!s.terminal;
   $('.lesson-panel').classList.toggle('completed',!!s.terminal);
   $('#control-status').textContent=s.controlStatus||'Only the highlighted area is active';
   $('#practice-tools').hidden=!s.tools;$('#practice-buttons').replaceChildren();
   for(const [action,label] of s.tools||[]){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>adapter.perform(action));$('#practice-buttons').append(b);}
   if(s.keyboard){const p=document.createElement('p');p.className='small-note';p.textContent=s.keyboard;$('#practice-buttons').append(p);}
   $('#input-controls').hidden=!s.controls;$('#input-controls').replaceChildren();for(const [device,instruction] of s.controls||[]){const label=document.createElement('dt'),description=document.createElement('dd');label.textContent=device;description.textContent=instruction;$('#input-controls').append(label,description);}
   adapter.setStep(s,context);adapter.setPaused(false);updateProgress();updateGuidance();
   if(s.terminal)feedback(s.done);
   requestAnimationFrame(()=>{updateGuidance();if(actionDone())showCompletion();});
 }
 function go(next){cancelPause();$('#completion-dialog').close();index=Math.max(0,Math.min(lesson.steps.length-1,next,unlocked()));render();persist();$('#lesson-title').focus({preventScroll:true});}
 function retryStep(){const next=retryStepProgress(lesson,{completed:[...completed],practiced:[...practiced]},step().id);completed=new Set(next.completed);practiced=new Set(next.practiced);lastMistake=-Infinity;go(index);}
 function restart(){completed.clear();practiced.clear();adapter.reset();go(0);}
 try{
   const response=await fetch(new URL('./shell.html?v=completion-pause-1',import.meta.url));if(!response.ok)throw new Error('Lesson shell unavailable');root.innerHTML=await response.text();
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
   on($('#review-step'),'click',showCompletion);on($('#previous-step'),'click',()=>go(index-1));on($('#retry-step'),'click',retryStep);on($('#keep-interacting'),'click',()=>{if(lesson.steps[index+1]?.terminal&&isCompleted())go(index+1);});
   on($('#completion-dialog'),'close',()=>adapter.setPaused($('#completion-dialog').open));
   on($('#completion-dialog'),'cancel',event=>{if(lesson.steps[index+1]?.terminal&&isCompleted()){event.preventDefault();go(index+1);}});
   on($('#restart'),'click',restart);on($('#restart-from-completion'),'click',restart);
   render();
 }catch(error){
   console.error(error);adapter?.dispose();
   const panel=document.createElement('div');panel.className='load-error';panel.setAttribute('role','alert');
   const p=document.createElement('p');p.textContent='The practice workspace could not load. Check your connection and reload, or try another browser. Your saved progress is safe.';
   const b=document.createElement('button');b.className='primary';b.textContent='Retry loading';b.onclick=()=>location.reload();panel.append(p,b);root.replaceChildren(panel);
 }
 return {dispose(){cancelAnimationFrame(frame);listeners.abort();guidance?.dispose();adapter?.dispose();sound?.dispose();root.replaceChildren();}};
}
