const steps = [
  {id:'prepare', chapter:'01 / THE WORKSPACE', title:'Start in Prepare', text:'Bambu Studio opens on Home. Prepare is where you bring in a model and get it ready for printing.', task:'Follow the arrow and select Prepare to open the workspace.', done:'You opened Prepare. The build plate is empty; we will add Benchy after finding the main controls.'},
  {id:'preview', chapter:'01 / THE WORKSPACE', title:'Preview comes after slicing', text:'Preview shows the paths and layers the printer will follow after slicing. The layer slider is on the right and the toolpath slider is along the bottom.', task:'Select Preview to see its workspace.', done:'You opened Preview. The plate is empty and the sliders are inactive because we have not imported or sliced a model.'},
  {id:'device', chapter:'01 / THE WORKSPACE', title:'Meet the Device tab', text:'Device is where you connect to and monitor a printer. In the shop, check that the selected device is the one you intend to use.', task:'Find and select Device. No printer will be connected here.', done:'Device is for the actual printer. This simulation cannot send a print.'},
  {id:'return-prepare', target:'prepare', chapter:'01 / THE WORKSPACE', title:'Return to Prepare', text:'You have seen where to prepare a model, review its sliced layers, and monitor a printer. Now return to the workspace where you will add Benchy.', task:'Select Prepare to return to the empty build plate.', done:'Back in Prepare. Next, find the printer, material, process, and model controls.'},
  {id:'printer', chapter:'01 / THE WORKSPACE', title:'Printer and build plate', text:'The Printer panel holds the printer profile, build plate, and nozzle settings. They need to match the equipment you will use.', task:'Select the highlighted Printer panel.', done:'You found the printer settings. These example values are not instructions for setting up a shop print.'},
  {id:'filament', chapter:'01 / THE WORKSPACE', title:'Choose your material here', text:'Project Filaments describes the material used by your model. Later, you will match the material and color to what is loaded in the printer.', task:'Select the Project Filaments panel.', done:'For this entry course, we will use one material. We will choose it in a later tutorial.'},
  {id:'process', chapter:'01 / THE WORKSPACE', title:'How the print is made', text:'Process contains settings such as layer height, strength, speed, and supports. You do not need to adjust these during navigation practice.', task:'Select the highlighted Process panel.', done:'These settings control how the model will be sliced. Leave them alone for this lesson.'},
  {id:'toolbar', chapter:'01 / THE WORKSPACE', title:'Tools that change the model', text:'The toolbar includes Move, Rotate, Scale, and Lay on face. Those tools change the model itself.', task:'Select the highlighted model toolbar.', done:'Remember this difference: the Rotate tool changes the model. Orbiting changes only your view.'},
  {id:'import-model', chapter:'01 / THE WORKSPACE', title:'Add your first model', text:'The Add model icon opens a file picker. The course includes Benchy.stl for this practice.', task:'Click the Add model icon, select Benchy.stl, then choose Open.', done:'Benchy is now on the plate. Importing adds the model; it does not slice or print it.'},
  {id:'plate-hotspot', chapter:'01 / THE WORKSPACE', title:'Your 3D workspace', text:'The large area is the 3D viewport. It shows Benchy on the build plate—the surface where a print starts.', task:'Select the highlighted 3D viewport.', done:'Imported models may arrive in an orientation that is unsuitable for printing, like Benchy on its side here. In the next tutorial, you will learn how to orient models for printing.'},
  {id:'orbit', chapter:'02 / 3D NAVIGATION', title:'Look around Benchy', text:'Orbiting moves your viewpoint around the model. The model stays in exactly the same place and orientation.', task:'Hold the LEFT mouse button on empty space beside Benchy and drag sideways.', done:'You changed your view—not Benchy’s orientation.', hint:'Orbit: primary-click drag or one-finger touchscreen drag on empty space'},
  {id:'pan', chapter:'02 / 3D NAVIGATION', title:'Slide your view', text:'Panning moves your viewpoint sideways or up and down without turning it. Benchy stays fixed on the plate.', task:'Hold the RIGHT mouse button (or the mouse wheel button) and drag across the viewport.', done:'Your view shifted. Benchy did not move on the build plate.', hint:'Pan: secondary-click drag or two-finger touchscreen slide'},
  {id:'zoom', chapter:'02 / 3D NAVIGATION', title:'Get closer. Step back.', text:'Zooming changes how close the model looks. It does not change the model’s physical size.', task:'Scroll up to zoom in, then scroll down to zoom out. Complete both directions.', done:'Both directions done. Benchy stayed the same size.', hint:'Zoom: mouse wheel / touchpad scroll · touchscreen pinch / spread'},
  {id:'complete', chapter:'TUTORIAL COMPLETE', title:'You finished the tutorial', text:'You found the main sections of Bambu Studio and practiced orbit, pan, and zoom.', task:'Try these same navigation actions in Bambu Studio. Start left-dragging on empty space beside the model.', done:'This completes Tutorial 01 only. It does not qualify you to print independently yet.', hint:'Free camera practice · model editing remains disabled', tools:[['reset','↺ Reset practice view'],['orbit-left','↶ Orbit'],['pan-right','Pan →'],['zoom-in','＋ Zoom'],['zoom-out','− Zoom']]}
];

const navigationControls={
 orbit:[['Mouse','Hold the left button and drag on empty space beside Benchy.'],['Touchpad','Press and hold the primary (left) click while sliding a finger to drag. Start on empty space beside Benchy.'],['Touchscreen','Drag one finger on empty space beside Benchy.']],
 pan:[['Mouse','Hold the right button or wheel button and drag.'],['Touchpad','Hold the secondary (right) click while sliding to drag. On a clickpad, hold the lower-right click area with one finger and move another. A two-finger tap alone does not drag.'],['Touchscreen','Slide two fingers together across the viewport, keeping their spacing steady.']],
 zoom:[['Mouse','Roll the wheel up to zoom in and down to zoom out.'],['Touchpad','Use two fingers to scroll over the viewport, first one way and then the other. Direction follows your scroll settings; reverse the gesture if needed.'],['Touchscreen','Spread two fingers apart to zoom in; pinch them together to zoom out.']]
};
for(const s of steps){
 if(navigationControls[s.id])s.controls=navigationControls[s.id];
 if(s.id==='orbit')s.task='Orbit around Benchy using the controls for your input device.';
 if(s.id==='pan')s.task='Pan the view sideways using the controls for your input device.';
 if(s.id==='zoom')s.task='Zoom in and zoom out using the controls for your input device. Complete both directions.';
 if(s.id==='complete'){delete s.tools;s.controls=[['Mouse','Left-drag empty space to orbit; right-drag to pan; scroll to zoom.'],['Touchpad','Hold primary click and drag to orbit; hold secondary click and drag to pan; two-finger scroll to zoom.'],['Touchscreen','One-finger drag on empty space to orbit; two-finger slide to pan; pinch or spread to zoom.']];s.task='Try orbit, pan, and zoom with your input device, here and in Bambu Studio.';}
}

const legacyStepIds=steps.map(s=>s.id);
legacyStepIds.splice(legacyStepIds.indexOf('complete'),0,'check');
steps.splice(steps.findIndex(s=>s.id==='complete'),0,{id:'top-view',chapter:'02 / 3D NAVIGATION',title:'Look straight down',text:'The view cube follows your camera as you orbit. Click a face to look directly at that side of the model. This changes your viewpoint, not the model’s orientation.',task:'Click the Top face of the view cube in the lower-left corner of the viewport.',done:'You are looking straight down at the build plate. Benchy has not moved or rotated. The cube gives you a repeatable view without dragging.'});

const tabViews={prepare:['home','prepare'],preview:['prepare','preview'],device:['preview','device'],'return-prepare':['device','prepare']};
for(const step of steps){
  const action=['orbit','pan','zoom'].includes(step.id)?step.id:step.id==='complete'?'free':step.id==='import-model'?'import':'select';
  step.simulation={action,target:step.target||step.id,view:'prepare',hint:step.hint||'',camera:['orbit','pan','zoom'].includes(action)?'close':'wide'};
  if(tabViews[step.id]) [step.simulation.viewBefore,step.simulation.viewAfter]=tabViews[step.id];
  if(step.id==='import-model')step.simulation.effects={modelVisible:true};
  if(['orbit','pan','zoom'].includes(action))step.completionMode='practice';
  if(['orbit','pan','zoom','free'].includes(action))step.controlStatus='Only camera navigation is enabled';
  if(step.keyboard)step.keyboard='Focus the 3D view: '+step.keyboard;
  if(step.id==='top-view')Object.assign(step.simulation,{action:'view',target:'cube-top',camera:'close',selectedView:'Top',hint:'Click Top on the view cube'});
  if(step.id==='complete')step.terminal=true;
}
steps.find(s=>s.id==='top-view').quiz={
  prompt:'You orbit, pan, and zoom around Benchy. What changed?',
  answers:['The camera view changed. Benchy stayed fixed.','Benchy rotated on the plate.','Benchy became physically larger.'],
  correct:0,retry:'Try again. Orbit, pan, and zoom move the camera. They do not edit the model.',
  success:'Exactly. Navigation changes your view. Model tools change the object.'
};
export default {
  id:'getting-started',software:'bambu-studio',version:2,title:'Meet Bambu Studio',
  subtitle:'Find your way around. Then take Benchy for a spin.',
  eyebrow:'INTRO TO 3D PRINTING SLICING / TUTORIAL 01',simulatorLabel:'SIMULATED BAMBU STUDIO',
  simulationNote:'Example settings · not a print setup recommendation',
  initialState:{view:'home',modelVisible:false},
  model:{url:new URL('../../shared/assets/models/Benchy.stl',import.meta.url).href,name:'Benchy.stl'},
  legacyProgress:{key:'amas-bambu-tutorial-01-v5',stepIds:legacyStepIds},
  progressMigrations:[{key:'amas-tutorial:bambu-studio:getting-started:v1',migrate(saved){
    const completed=Array.isArray(saved?.completed)?saved.completed:[],pending=completed.includes('top-view')&&!completed.includes('check');
    return {current:saved?.current==='check'?'top-view':saved?.current,completed:completed.filter(id=>id!=='check'&&!(pending&&id==='top-view')),practiced:pending?['top-view']:[]};
  }}],
  steps
};
