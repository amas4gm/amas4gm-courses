"""Capture Blender's actual complete UI for bounded browser lesson states.
Run interactively: blender --factory-startup -p 50 50 1600 1000 --python scripts/capture-blender-ui.py
No user preferences or existing files are changed. The screenshot queue uses Blender's API.
"""
import bpy, json, math, traceback, sys
from pathlib import Path
from mathutils import Quaternion, Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'simulators/blender/reference'
OUT.mkdir(parents=True,exist_ok=True)
ASSETS=ROOT/'simulators/blender/assets'
bpy.context.preferences.view.show_splash=False
bpy.context.preferences.filepaths.save_version=0
manifest={'version':2,'blender':bpy.app.version_string,'build':bpy.app.build_hash.decode(),'states':{}}
queue=[]
base_rot=Quaternion((0.820,0.425,0.176,0.340)).normalized()

def set_scene(asset='cube',mode='OBJECT',selection='all',sidebar=False,values=None,units=True,startup=False,empty=False,orientation=False,angle=0,pan=0,zoom=1,prop='OBJECT',tool='builtin.select_box',top=False,headerPan=0,bevelSegments=0,objectName=None):
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.meshes):
        if m.users==0:bpy.data.meshes.remove(m)
    sc=bpy.context.scene;sc.unit_settings.system='METRIC' if units else 'NONE';sc.unit_settings.scale_length=.001 if units else 1;sc.unit_settings.length_unit='MILLIMETERS' if units else 'ADAPTIVE'
    if not empty:
        with bpy.data.libraries.load(str(ASSETS/f'{asset}.blend'),link=False) as (src,dst):dst.objects=['Desk Tray']
        obj=dst.objects[0];bpy.context.collection.objects.link(obj);obj.name=objectName or ('Cube' if startup else 'Desk Tray');obj.data.name='Cube';bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        if startup:
            bpy.ops.object.camera_add(location=(7,-7,5));bpy.context.object.name='Camera';bpy.ops.object.light_add(type='POINT',location=(4,-4,6));bpy.context.object.name='Light';bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
        for key,value in (values or {}).items():
            if key=='dx':obj.dimensions.x=value
            elif key=='dy':obj.dimensions.y=value
            elif key=='dz':obj.dimensions.z=value
            elif key=='x':obj.location.x=value
            elif key=='z':obj.location.z=value
            elif key=='rz':obj.rotation_euler.z=math.radians(value)
            elif key=='apply':bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
            bpy.context.view_layer.update()
        bpy.context.view_layer.update()
        if mode=='EDIT':
            for v in obj.data.vertices:v.select=selection=='all'
            for e in obj.data.edges:e.select=selection=='all'
            for f in obj.data.polygons:f.select=selection=='all' or (selection in ['top','inner'] and all(abs((obj.matrix_world@obj.data.vertices[i].co).z-18)<.001 for i in f.vertices)) or (selection=='floor' and all(abs((obj.matrix_world@obj.data.vertices[i].co).z-3)<.001 for i in f.vertices))
            if selection=='inner':
                largest=max((f for f in obj.data.polygons if f.select),key=lambda f:f.area)
                for f in obj.data.polygons:f.select=f==largest
            if selection=='rim':
                for e in obj.data.edges:e.select=all(abs((obj.matrix_world@obj.data.vertices[i].co).z-18)<.001 and (abs(obj.data.vertices[i].co.x)>49.99 or abs(obj.data.vertices[i].co.y)>34.99) for i in e.vertices)
            bpy.context.tool_settings.mesh_select_mode=({'vertex':(True,False,False),'edge':(False,True,False)}.get(tool,(False,False,True)))
            bpy.ops.object.mode_set(mode='EDIT')
            if bevelSegments:bpy.ops.mesh.bevel(offset=.6,segments=bevelSegments,affect='EDGES')
        elif selection=='none':obj.select_set(False)
    for area in bpy.context.window.screen.areas:
        if area.type=='PROPERTIES':
            try:area.spaces.active.context=prop
            except TypeError:area.spaces.active.context='SCENE'
        if area.type=='VIEW_3D':
            sp=area.spaces.active;sp.show_region_ui=sidebar;sp.show_region_toolbar=True;sp.show_region_tool_header=True
            sp.overlay.show_face_orientation=orientation
            rv=sp.region_3d;rv.view_rotation=Quaternion((0,0,1),angle)@base_rot;rv.view_perspective='PERSP'
            if top:rv.view_rotation=Quaternion((1,0,0,0));rv.view_perspective='ORTHO'
            rv.view_location=(pan,0,9 if asset!='cube' else 0);rv.view_distance=(185 if asset!='cube' or values and any(k in values for k in ['dx','dy','dz']) else 10)*zoom
            sp.clip_end=10000;sp.overlay.grid_scale=10 if asset!='cube' else 1
            with bpy.context.temp_override(area=area,region=next(r for r in area.regions if r.type=='WINDOW')):
                if tool not in ['vertex','edge']:bpy.ops.wm.tool_set_by_id(name=tool)
            if headerPan:
                with bpy.context.temp_override(area=area,region=next(r for r in area.regions if r.type=='HEADER')):
                    bpy.ops.view2d.pan(deltax=-10000,deltay=0)
                    bpy.ops.view2d.pan(deltax=headerPan,deltay=0)
            area.tag_redraw()

def add(name,**kw):queue.append((name,kw))
add('startup',startup=True,units=False)
add('startup-sidebar',startup=True,units=False,sidebar=True)
add('units',startup=True,sidebar=True,prop='SCENE')
add('empty',empty=True)
add('cube')
add('cube-added',objectName='Cube')
add('top',top=True)
add('cube-unselected',selection='none')
add('cube-sidebar',sidebar=True)
add('cube-wide',sidebar=True,zoom=18.5)
for name,v in [('move-x',{'x':1}),('rotate-z',{'rz':45}),('width',{'dx':100}),('depth',{'dx':100,'dy':70}),('height',{'dx':100,'dy':70,'dz':18}),('applied',{'dx':100,'dy':70,'dz':18,'apply':True})]:add(name,sidebar=True,values=v)
add('blank',asset='blank',sidebar=True)
add('edit-all',asset='blank',mode='EDIT',selection='all',tool='vertex')
add('edit-edges',asset='blank',mode='EDIT',selection='all',tool='edge')
add('edit-faces',asset='blank',mode='EDIT',selection='all')
add('edit-none',asset='blank',mode='EDIT',selection='none')
add('edit-top',asset='blank',mode='EDIT',selection='top')
add('inset',asset='inset',mode='EDIT',selection='inner')
add('cavity',asset='cavity',mode='EDIT',selection='floor')
add('rim',asset='cavity',mode='EDIT',selection='rim',tool='edge')
add('finished-edit',asset='finished',mode='EDIT',selection='none',tool='edge')
for segments in [1,2,3]:add(f'bevel-{segments}',asset='cavity',mode='EDIT',selection='rim',tool='edge',bevelSegments=segments)
add('orientation',asset='finished',mode='EDIT',selection='none',orientation=True,tool='edge')
add('finished',asset='finished',sidebar=True)
for i in range(49):add(f'orbit-{i:02d}',angle=(i-24)*math.pi/48)
for i in range(17):add(f'pan-{i:02d}',pan=(i-8)*.25)
for i in range(17):add(f'zoom-{i:02d}',zoom=math.exp((i-8)*.07))
if '--narrow' in sys.argv:
    queue=[]
    for i in range(17):add(f'header-narrow-{i:02d}',headerPan=i*50 or 1)
if '--manual' in sys.argv:queue=[]
if '--repair' in sys.argv:
    names=['width','depth','height','applied','cube-wide','orientation','bevel-1','bevel-2','bevel-3']
    queue=[q for q in queue if q[0] in names]
    manifest=json.loads((OUT/'capture-manifest.json').read_text())
if '--extra' in sys.argv:
    queue=[q for q in queue if q[0]=='cube-added']
    manifest=json.loads((OUT/'capture-manifest.json').read_text())
index=0;phase=0

def layout():
    w=bpy.context.window
    return {'width':w.width,'height':w.height,'areas':[{'type':a.type,'x':a.x,'y':a.y,'width':a.width,'height':a.height,'regions':[{'type':r.type,'x':r.x,'y':r.y,'width':r.width,'height':r.height} for r in a.regions]} for a in w.screen.areas]}

def tick():
    global index,phase
    try:
        if index<len(queue):
            name,kw=queue[index]
            if phase==0:set_scene(**kw);phase=1;return .4
            bpy.ops.screen.screenshot(filepath=str(OUT/f'{name}.png'))
            obj=bpy.context.object
            metrics={'dimensions':list(obj.dimensions),'location':list(obj.location),'scale':list(obj.scale)} if obj else None
            manifest['states'][name]={'file':f'{name}.webp','source':f'{name}.png','configuration':kw,'layout':layout(),'measuredObject':metrics}
            index+=1;phase=0
            (OUT/('narrow-manifest.json' if '--narrow' in sys.argv else 'capture-manifest.json')).write_text(json.dumps(manifest,indent=2))
            print('CAPTURED',name,flush=True)
            return .15
        request=OUT/'capture-request.json'
        if request.exists():
            command=json.loads(request.read_text());request.unlink()
            if command.get('scene'):set_scene(**command['scene'])
            if command.get('exportView'):
                area=next(a for a in bpy.context.window.screen.areas if a.type=='VIEW_3D');sp=area.spaces.active;rv=sp.region_3d
                data={'layout':layout(),'viewMatrix':[list(row) for row in rv.view_matrix],'projectionMatrix':[list(row) for row in rv.window_matrix],'rotation':list(rv.view_rotation),'distance':rv.view_distance,'target':list(rv.view_location),'lens':sp.lens,'rotationMethod':bpy.context.preferences.inputs.view_rotate_method,'rotationSensitivity':bpy.context.preferences.inputs.view_rotate_sensitivity_turntable,'zoomMethod':bpy.context.preferences.inputs.view_zoom_method,'solidLights':[{'direction':list(l.direction),'diffuse':list(l.diffuse_color),'specular':list(l.specular_color),'smooth':l.smooth,'enabled':l.use} for l in bpy.context.preferences.system.solid_lights]}
                (OUT/'live-view-reference.json').write_text(json.dumps(data,indent=2))
            if command.get('operator'):
                module,op=command['operator'].split('.')
                getattr(getattr(bpy.ops,module),op)('INVOKE_DEFAULT',**command.get('properties',{}))
            if command.get('capture'):
                w=bpy.context.window_manager.windows[-1]
                with bpy.context.temp_override(window=w):bpy.ops.screen.screenshot(filepath=str(OUT/(command['capture']+'.png')))
                print('MANUAL_CAPTURE',command['capture'],flush=True)
        return .4
    except Exception:
        traceback.print_exc();return None
bpy.app.timers.register(tick,first_interval=2)
