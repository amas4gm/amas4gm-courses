import {createBlenderSimulator} from './native-simulator.js?v=bevel-handoff-1';
import {createBambuSimulator} from '../bambu-studio/simulator.js?v=bevel-handoff-1';

// Keep the teaching engine and progress intact while changing simulated apps.
export async function createBlenderCourseSimulator({container,lesson,api}){
 const host=document.createElement('div'),bar=document.createElement('div');
 bar.className='native-controls handoff-controls';bar.hidden=true;container.append(bar,host);
 const bambuLesson={...lesson,capabilities:['manipulation'],initialState:{modelVisible:false},model:{name:'desk-tray.stl',displayName:'tray',url:new URL('./assets/desk-tray.stl?v=bevel-handoff-1',import.meta.url).href}};
 let adapter=await createBlenderSimulator({container:host,lesson,api}),app='blender',step,context,paused=false,disposed=false,generation=0,launch=null;
 function labels(name){
  const label=document.querySelector('#simulator-label'),note=document.querySelector('#simulation-note');
  if(label)label.textContent=name==='bambu'?'Bambu Studio · import your Blender model':lesson.simulatorLabel;
  if(note)note.textContent=name==='bambu'?'Guided Bambu Studio simulation':lesson.simulationNote||'Practice simulation';
 }
 function controls(){
  bar.replaceChildren();bar.hidden=app!=='bambu';if(app!=='bambu')return;
  const label=document.createElement('span');label.textContent='Bambu Studio · actual exported tray STL';
  const expand=document.createElement('button');expand.type='button';
  const update=()=>expand.textContent=document.body.classList.contains('native-expanded')?'Return to lesson layout':'Expand workspace';update();
  expand.addEventListener('click',()=>{document.body.classList.toggle('native-expanded');update();window.dispatchEvent(new Event('resize'));});
  bar.append(label,expand);
  if(step.terminal){const link=document.createElement('a');link.href=new URL('../../bambu-studio/slicing-and-printing/',import.meta.url).href;link.textContent='Continue to slicing →';bar.append(link);}
 }
 async function mount(nextApp,token){
  if(app===nextApp)return;
  const expanded=document.body.classList.contains('native-expanded');adapter?.dispose();adapter=null;app=nextApp;
  host.textContent=`Opening ${nextApp==='bambu'?'Bambu Studio':'Blender'}…`;
  const factory=nextApp==='bambu'?createBambuSimulator:createBlenderSimulator;
  const next=await factory({container:host,lesson:nextApp==='bambu'?bambuLesson:lesson,api});
  if(disposed){next.dispose();return;}adapter=next;
  document.body.classList.add('blender-course');document.body.classList.toggle('native-expanded',expanded);
  if(token!==generation)return;
 }
 // Serialize app initialization; a map jump can arrive while assets are loading.
 let pending=Promise.resolve();
 function setStep(next,ctx){
  step=next;context=ctx;paused=false;launch=null;bar.hidden=true;const token=++generation;
  pending=pending.then(async()=>{
   if(disposed||token!==generation)return;
   const launcher=next.id==='open-bambu'&&!ctx.isCompleted();
   const nextApp=next.simulation.software==='bambu-studio'&&!launcher?'bambu':'blender';
   await mount(nextApp,token);if(disposed||token!==generation)return;
   labels(nextApp);controls();
   if(launcher){
    adapter.setStep({id:'complete',terminal:true,text:next.text,task:next.task,simulation:{action:'free',asset:'finished'}},{isCompleted:()=>true,completedSteps:()=>[]});
    adapter.setPaused(true);bar.hidden=false;bar.replaceChildren();
    const label=document.createElement('span');label.textContent='Course app switch · simulated launch';
    launch=document.createElement('button');launch.type='button';launch.textContent='Open Bambu Studio';launch.disabled=paused;
    launch.addEventListener('click',()=>{
     if(paused||!launch)return;launch.disabled=true;launch=null;
     pending=pending.then(async()=>{await mount('bambu',token);if(disposed||token!==generation)return;labels('bambu');controls();adapter.setStep(next,ctx);adapter.setPaused(paused);api.guideChanged();}).catch(report);
    });bar.append(label,launch);
   }else {adapter.setStep(next,ctx);adapter.setPaused(paused);}
   api.guideChanged();
  }).catch(report);
 }
 function report(error){if(!disposed){host.textContent='The simulator could not load. Reload this page to retry.';api.feedback(error.message);}}
 return {
  setStep,refreshState(){adapter?.refreshState();},getGuide(){return launch?{target:launch,parent:container,scale:1}:adapter?.getGuide();},
  perform(action){adapter?.perform(action);},getRegion(){return adapter?.getRegion()||host;},
  setPaused(value){paused=value;if(launch)launch.disabled=value;adapter?.setPaused(launch?true:value);},setGuidance(value){adapter?.setGuidance(value);},reset(){adapter?.reset();},
  dispose(){disposed=true;generation++;adapter?.dispose();container.replaceChildren();document.body.classList.remove('blender-course','native-expanded');}
 };
}
