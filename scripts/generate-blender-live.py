"""Small native mesh variants for the live viewport; existing checkpoints stay untouched."""
import bpy,bmesh,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
assets=root/'simulators/blender/assets';out=assets/'live';out.mkdir(exist_ok=True)
records={}
for segments in (1,2,3):
    bpy.ops.wm.open_mainfile(filepath=str(assets/'cavity.blend'))
    obj=bpy.context.object
    if obj.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    bm=bmesh.new();bm.from_mesh(obj.data)
    rim=[e for e in bm.edges if all(abs(v.co.z-9)<1e-5 for v in e.verts) and all(abs(v.co.x)>49.99 or abs(v.co.y)>34.99 for v in e.verts)]
    assert len(rim)==4
    for f in bm.faces:f.select=False
    result=bmesh.ops.bevel(bm,geom=rim,offset=.6,segments=segments,affect='EDGES',clamp_overlap=True)
    for f in result['faces']:f.select=True
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free();obj.data.update()
    data={'vertices':[[float(c) for c in obj.matrix_world@v.co] for v in obj.data.vertices],'faces':[list(p.vertices) for p in obj.data.polygons],'edges':[list(e.vertices) for e in obj.data.edges],'selectedFaces':[p.index for p in obj.data.polygons if p.select]}
    name=f'bevel-{segments}.json';path=out/name;path.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
    records[name]={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
(out/'manifest.json').write_text(json.dumps({'blender':bpy.app.version_string,'build':bpy.app.build_hash.decode(),'meshes':records},indent=2),encoding='utf-8')
print('Exported native bevel meshes:',sum(r['bytes'] for r in records.values()),'bytes')
