"""Capture the selected defaults and empty startup scene in an isolated Blender process."""
import bpy,json,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'simulators/blender/reference'
defaults=ROOT/'.qa/capture-default-objects.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(defaults),copy=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'simulators/blender/assets/printing-setup.blend'))
if not bpy.context.scene.objects:
 with bpy.data.libraries.load(str(defaults)) as (source,target):target.objects=source.objects
 collection=bpy.context.scene.collection.children[0]
 for obj in target.objects:collection.objects.link(obj)
 bpy.context.view_layer.objects.active=bpy.data.objects['Cube']
bpy.context.preferences.filepaths.save_version=0
manifest=json.loads((OUT/'setup-manifest.json').read_text())
phase=0

def capture(name,empty):
 bpy.ops.screen.screenshot(filepath=str(OUT/(name+'.png')))
 r=copy.deepcopy(manifest['states']['setup-clip-end'])
 w=bpy.context.window
 r['file']=name+'.webp';r['configuration']['empty']=empty
 r['configuration']['selection']='none' if empty else 'all'
 r['objects']=sorted(o.name for o in bpy.context.scene.objects)
 r['layout']={'width':w.width,'height':w.height,'areas':[{'type':a.type,'x':a.x,'y':a.y,'width':a.width,'height':a.height,'regions':[{'type':q.type,'x':q.x,'y':q.y,'width':q.width,'height':q.height} for q in a.regions]} for a in w.screen.areas]}
 manifest['states'][name]=r

def tick():
 global phase
 if phase==0:
  for o in bpy.context.scene.objects:o.select_set(True)
 elif phase==1:
  capture('setup-all',False)
  for o in list(bpy.context.scene.objects):bpy.data.objects.remove(o,do_unlink=True)
 elif phase==2:
  capture('setup-empty',True)
  bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'simulators/blender/assets/printing-setup.blend'),copy=True)
  (OUT/'setup-manifest.json').write_text(json.dumps(manifest,indent=2))
  bpy.ops.wm.quit_blender()
  return None
 for a in bpy.context.window.screen.areas:a.tag_redraw()
 phase+=1
 return 1.5
bpy.app.timers.register(tick,first_interval=3)
