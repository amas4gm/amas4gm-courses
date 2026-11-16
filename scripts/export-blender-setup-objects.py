"""Export Blender's factory camera and point-light display geometry for the setup viewport."""
import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
cam=bpy.data.objects['Camera']; light=bpy.data.objects['Light']
# view_frame is Blender's own camera frame in camera-local coordinates.
frame=[v*cam.data.display_size for v in cam.data.view_frame(scene=bpy.context.scene)]
vertices=[Vector((0,0,0)),*frame]
edges=[[0,i] for i in range(1,5)]+[[i,1 if i==4 else i+1] for i in range(1,5)]
# Camera's top orientation marker, in the same local plane as its frame.
x=max(abs(v.x) for v in frame); y=max(v.y for v in frame); z=frame[0].z
vertices.extend([Vector((-x*.7,y,z)),Vector((0,y+x*.6,z)),Vector((x*.7,y,z))]);edges.extend([[5,6],[6,7],[7,5]])
d={'blender':bpy.app.version_string,'camera':{'name':cam.name,'vertices':[list(cam.matrix_world@v) for v in vertices],'edges':edges},'light':{'name':light.name,'position':list(light.matrix_world.translation),'radius':light.data.shadow_soft_size},'objects':[o.name for o in bpy.context.scene.objects]}
(root/'simulators/blender/assets/live/setup-objects.json').write_text(json.dumps(d,indent=2)+'\n')
print(json.dumps(d))
