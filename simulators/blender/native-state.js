// Every state names a complete, unretouched Blender capture. Coordinates are
// native capture pixels, never percentages inferred from the course layout.
export const frames = {
 'setup-for-printing': {
  scene:['setup-start','setup-scene'],units:['setup-scene','setup-units'],system:['setup-units','setup-metric'],scale:['setup-metric','setup-scale'],length:['setup-scale','setup-mm'],
  sidebar:['setup-mm','setup-sidebar'],view:['setup-sidebar','setup-view'],'clip-start':['setup-view','setup-clip-start'],'clip-end':['setup-clip-start','setup-clip-end'],
  startup:['setup-clip-end','setup-clip-end'],confirm:['setup-clip-end','setup-clip-end'],complete:['setup-clip-end','setup-clip-end']
 },
 'getting-started': {
  viewport:['startup','startup'],outliner:['startup','startup'],sidebar:['startup','startup-sidebar'],
  units:['units','units-expanded'],headers:['header-narrow-00','header-narrow-16'],
  delete:['cube','empty'],add:['empty','cube-added'],rename:['cube-added','cube'],orbit:['orbit-24','orbit-32'],pan:['pan-08','pan-12'],zoom:['zoom-08','zoom-08'],
  top:['cube','top'],frame:['pan-16','cube'],save:['cube','cube'],complete:['cube','cube']
 },
 'object-manipulation': {
  select:['cube-unselected','cube'],move:['cube-sidebar','move-confirmed'],return:['move-x','cube-sidebar'],
  rotate:['cube-sidebar','rotate-confirmed'],straighten:['rotate-z','cube-sidebar'],width:['cube-wide','width'],
  depth:['width','depth'],height:['depth','height'],apply:['height','applied'],ground:['applied','blank'],
  save:['blank','blank'],complete:['blank','blank']
 },
 'edit-mode': {
  mode:['blank','edit-all'],vertices:['edit-all','edit-all'],edges:['edit-all','edit-edges'],faces:['edit-edges','edit-faces'],
  'top-face':['edit-none','edit-top'],inset:['edit-top','inset-confirmed'],'cancel-extrude':['inset','inset'],extrude:['inset','extrude-confirmed'],
  'save-cavity':['cavity','cavity'],bevel:['rim','bevel-confirmed'],orientation:['finished-edit','orientation'],
  object:['orientation','finished'],'save-final':['finished','finished'],export:['finished','finished'],complete:['finished','finished']
 }
};
for(const [lesson,extra] of Object.entries({'getting-started':{'sidebar-shortcut':'sidebar'},'object-manipulation':{'apply-shortcut':'apply'},'edit-mode':{'mode-shortcut':'mode'}}))for(const [id,source] of Object.entries(extra))frames[lesson][id]=frames[lesson][source];
for(const kind of ['move','rotate','scale'])frames['object-manipulation']['visual-'+kind]=['cube-sidebar','cube-sidebar'];
export const fieldRects={x:[1573,195,263,28],z:[1573,252,263,28],rz:[1573,371,263,28],dx:[1573,585,341,28],dy:[1573,614,341,29],dz:[1573,644,341,29]};
export function statePair(lesson,step){const result=frames[lesson]?.[step];if(!result)throw Error(`Missing native state: ${lesson}/${step}`);return result;}
export function boundedFrame(kind,index){const max=kind==='orbit'?48:16;return `${kind}-${String(Math.min(max,Math.max(0,Math.round(index)))).padStart(2,'0')}`;}
