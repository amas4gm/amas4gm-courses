"""Capture setup checkpoints in the isolated authoring Blender session.

Open Units and the Sidebar View tab using Blender's native controls first.
Run from that session's Python Console, then return to the 3D Viewport.
BLENDER_USER_CONFIG must point inside .qa; never save a user's startup file.
"""
import bpy, os, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'simulators/blender/reference'
config=Path(os.environ.get('BLENDER_USER_CONFIG','')).resolve()
assert config==ROOT/'.qa/blender-setup-config', 'Requires isolated authoring profile'
bpy.context.preferences.view.show_tooltips=False
if bpy.context.area.type=='CONSOLE':bpy.context.area.type='VIEW_3D'
for obj in bpy.context.scene.objects:obj.select_set(obj.name=='Cube')
bpy.context.view_layer.objects.active=bpy.data.objects['Cube']
states=[
 ('setup-start','NONE',1,'ADAPTIVE',False,'OBJECT',.01,1000),
 ('setup-units','NONE',1,'ADAPTIVE',False,'SCENE',.01,1000),
 ('setup-metric','METRIC',1,'METERS',False,'SCENE',.01,1000),
 ('setup-scale','METRIC',.001,'METERS',False,'SCENE',.01,1000),
 ('setup-mm','METRIC',.001,'MILLIMETERS',False,'SCENE',.01,1000),
 ('setup-view','METRIC',.001,'MILLIMETERS',True,'SCENE',.01,1000),
 ('setup-clip-start','METRIC',.001,'MILLIMETERS',True,'SCENE',.1,1000),
 ('setup-clip-end','METRIC',.001,'MILLIMETERS',True,'SCENE',.1,10000),
]
records={};index=0;phase=0
def tick_setup():
 global index,phase
 if index==len(states):
  bpy.ops.wm.save_homefile()
  # This is a portable scene template, not an automatic installer.
  bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'simulators/blender/assets/printing-setup.blend'),copy=True)
  (OUT/'setup-manifest.json').write_text(json.dumps({'blender':bpy.app.version_string,'build':bpy.app.build_hash.decode(),'states':records},indent=2))
  return None
 name,system,scale,length,sidebar,prop,near,far=states[index]
 if phase==0:
  u=bpy.context.scene.unit_settings;u.system=system;u.scale_length=scale;u.length_unit=length
  for a in bpy.context.window.screen.areas:
   if a.type=='PROPERTIES':a.spaces.active.context=prop
   if a.type=='VIEW_3D':a.spaces.active.show_region_ui=sidebar;a.spaces.active.clip_start=near;a.spaces.active.clip_end=far
   a.tag_redraw()
  phase=1;return .6
 bpy.ops.screen.screenshot(filepath=str(OUT/(name+'.png')))
 w=bpy.context.window
 records[name]={'file':name+'.webp','configuration':{'startup':True,'units':system=='METRIC','sidebar':sidebar,'prop':prop},'settings':{'system':system,'scale':scale,'length':length,'clipStart':near,'clipEnd':far},'layout':{'width':w.width,'height':w.height,'areas':[{'type':a.type,'x':a.x,'y':a.y,'width':a.width,'height':a.height,'regions':[{'type':r.type,'x':r.x,'y':r.y,'width':r.width,'height':r.height} for r in a.regions]} for a in w.screen.areas]}}
 index+=1;phase=0;return .2
bpy.app.timers.register(tick_setup,first_interval=3)
