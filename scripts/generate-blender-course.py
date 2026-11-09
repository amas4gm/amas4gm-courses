"""Generate checked reference assets with Blender, not a browser approximation.

Run: blender --background --factory-startup --python scripts/generate-blender-course.py
Coordinates and STL numbers are millimeters; Blender scene scale is 0.001.
"""
from pathlib import Path
import bpy
import bmesh
import json
import hashlib
from mathutils import Quaternion, Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "simulators" / "blender" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001
scene.unit_settings.length_unit = 'MILLIMETERS'
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
obj = bpy.context.object
obj.name = 'Desk Tray'
records = {}

def object_mode():
    if obj.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

def select_top():
    object_mode()
    for p in obj.data.polygons:
        p.select = p.normal.z > .99 and p.center.z > 0
    bpy.context.tool_settings.mesh_select_mode = (False, False, True)
    bpy.ops.object.mode_set(mode='EDIT')

def capture(name, description, mode='EDIT'):
    object_mode()
    obj.data.update()
    vertices = [[round(float(c), 7) for c in obj.matrix_world @ v.co] for v in obj.data.vertices]
    data = {
        'schemaVersion': 1, 'name': name, 'description': description,
        'units': 'mm', 'upAxis': 'Z', 'blenderVersion': bpy.app.version_string,
        'vertices': vertices,
        'faces': [list(p.vertices) for p in obj.data.polygons],
        'selectedFaces': [p.index for p in obj.data.polygons if p.select],
        'edges': [list(e.vertices) for e in obj.data.edges],
        'dimensions': [round(float(x), 6) for x in obj.dimensions],
        'mode': mode,
    }
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    data['checks'] = {
        'nonManifoldEdges': sum(not e.is_manifold for e in bm.edges),
        'boundaryEdges': sum(e.is_boundary for e in bm.edges),
        'volumeMm3': round(bm.calc_volume(signed=True), 6),
    }
    bm.free()
    assert data['checks']['nonManifoldEdges'] == 0, name
    assert data['checks']['volumeMm3'] > 0, name
    (OUT / f'{name}.json').write_text(json.dumps(data, separators=(',', ':')), encoding='utf-8')
    if mode == 'EDIT':
        bpy.ops.object.mode_set(mode='EDIT')
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                space = area.spaces.active
                space.region_3d.view_distance = 170 if name != 'cube' else 7
                space.region_3d.view_location = (0, 0, 5 if name != 'cube' else 0)
                space.region_3d.view_rotation = Quaternion((0.820, 0.425, 0.176, 0.340)).normalized()
                space.clip_end = 10000
                space.overlay.grid_scale = 10 if name != 'cube' else 1
                space.show_region_ui = True
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f'{name}.blend'), compress=True)
    object_mode()
    records[name] = {'description': description, 'dimensionsMm': data['dimensions'], **data['checks']}

capture('cube', 'New cube, before dimensioning. Scene uses millimeter coordinates.', 'OBJECT')
obj.dimensions = (100, 70, 18)
obj.location.z = 9
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
capture('blank', '100 x 70 x 18 mm blank; scale applied; bottom at Z=0.', 'OBJECT')
select_top()
bpy.ops.mesh.inset(thickness=3, depth=0, use_even_offset=True)
capture('inset', 'Top face inset 3 mm, defining a 94 x 64 mm opening.')
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={'value': (0, 0, -15)})
capture('cavity', 'Inner face extruded down 15 mm; floor and walls are 3 mm.')

# Bevel the four outside rim edges only. This preserves floor and inside wall thickness.
bm = bmesh.new()
bm.from_mesh(obj.data)
rim = [e for e in bm.edges if all(abs(v.co.z - 9) < 1e-5 for v in e.verts)
       and all(abs(v.co.x) > 49.99 or abs(v.co.y) > 34.99 for v in e.verts)]
assert len(rim) == 4, f'Expected four outer rim edges, found {len(rim)}'
for f in bm.faces:
    f.select = False
result = bmesh.ops.bevel(bm, geom=rim, offset=.6, segments=3, affect='EDGES', clamp_overlap=True)
for f in result['faces']:
    f.select = True
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(obj.data)
bm.free()
capture('finished', 'Finished tray: outer top rim beveled 0.6 mm with three segments.')
bpy.ops.wm.stl_export(filepath=str(OUT / 'desk-tray.stl'), export_selected_objects=True,
                      global_scale=1, use_scene_unit=False, apply_modifiers=True)

# Prove the STL round trip retains its dimensions and enclosed volume.
original = obj
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.stl_import(filepath=str(OUT / 'desk-tray.stl'), global_scale=1, use_scene_unit=False)
imported = bpy.context.object
assert all(abs(float(a)-b)<.0001 for a,b in zip(imported.dimensions,(100,70,18)))
bm = bmesh.new()
bm.from_mesh(imported.data)
assert all(e.is_manifold for e in bm.edges)
assert bm.calc_volume(signed=True) > 0
bm.free()
bpy.data.objects.remove(imported, do_unlink=True)
# Reference render is generated by Blender too; cameras/lights are not saved
# into the teaching checkpoints or included in the export.
material = bpy.data.materials.new('Tray orange')
material.diffuse_color = (.72, .24, .055, 1)
material.use_nodes = True
material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.72,.24,.055,1)
material.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .4
original.data.materials.clear()
original.data.materials.append(material)
scene.world = bpy.data.worlds.new('Reference world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.12,.14,.18,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .6
bpy.ops.object.camera_add(location=(130,-170,170))
camera = bpy.context.object
camera.rotation_euler = (Vector((0,0,7))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 155
scene.camera = camera
bpy.ops.object.light_add(type='AREA', location=(20,-50,150))
light = bpy.context.object
light.data.energy = 500000
light.data.shape = 'DISK'
light.data.size = 100
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.render.resolution_x = 800
scene.render.resolution_y = 600
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(OUT / 'tray-reference.png')
bpy.ops.render.render(write_still=True)
manifest = {
    'schemaVersion': 1, 'blenderVersion': bpy.app.version_string,
    'buildHash': bpy.app.build_hash.decode(), 'generator': 'scripts/generate-blender-course.py',
    'coordinateConvention': 'millimeters; Z up; ground Z=0; scene scale_length=0.001',
    'export': {'file': 'desk-tray.stl', 'globalScale': 1, 'useSceneUnit': False,
               'roundTripDimensionsMm': [100,70,18]},
    'checkpoints': records, 'physicalPrintValidated': False,
    'files': {p.name: {'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
              for p in sorted(OUT.iterdir()) if p.suffix in ('.json','.blend','.stl','.png') and p.name != 'manifest.json'}
}
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('COURSE_ARTIFACTS_OK ' + json.dumps(records))
