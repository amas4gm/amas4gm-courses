"""Blender-generated rounded bevels with validated linear width interpolation."""
import bpy,bmesh,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
assets=root/'simulators/blender/assets';out=assets/'live';out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(assets/'cavity.blend'))
obj=bpy.context.object
if obj.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
def bevel(width,segments):
    bm=bmesh.new();bm.from_mesh(obj.data)
    rim=[e for e in bm.edges if all(abs(v.co.z-9)<1e-5 for v in e.verts) and all(abs(v.co.x)>49.99 or abs(v.co.y)>34.99 for v in e.verts)]
    assert len(rim)==4
    for f in bm.faces:f.select=False
    result=bmesh.ops.bevel(bm,geom=rim,offset=width,segments=segments,profile=.5,affect='EDGES',clamp_overlap=True)
    for f in result['faces']:f.select=True
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    assert all(e.is_manifold for e in bm.edges)
    mesh=bpy.data.meshes.new('bevel sample');bm.to_mesh(mesh);bm.free();mesh.update()
    data={'vertices':[[float(c) for c in obj.matrix_world@v.co] for v in mesh.vertices],'faces':[list(p.vertices) for p in mesh.polygons],'edges':[list(e.vertices) for e in mesh.edges],'selectedFaces':[p.index for p in mesh.polygons if p.select]}
    bpy.data.meshes.remove(mesh);return data
records={};proof={}
for segments in (1,2,3):
    data=bevel(.6,segments);half=bevel(.3,segments)
    assert data['faces']==half['faces'] and data['edges']==half['edges']
    data['width']=.6;data['profile']=.5
    data['zeroVertices']=[[2*a-b for a,b in zip(va,vb)] for va,vb in zip(half['vertices'],data['vertices'])]
    errors=[];samples=[]
    for width in (.1,1.2,2.4):
        sample=bevel(width,segments);assert sample['faces']==data['faces']
        error=max(abs(z+(v-z)*width/.6-actual) for zv,vv,av in zip(data['zeroVertices'],data['vertices'],sample['vertices']) for z,v,actual in zip(zv,vv,av))
        assert error<.0001,(segments,width,error)
        errors.append(error);samples.append({'width':width,'vertices':sample['vertices']})
    proof[str(segments)]={'maxErrorMm':max(errors),'samples':samples}
    path=out/f'bevel-{segments}.json';path.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
    records[path.name]={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
(out/'bevel-validation.json').write_text(json.dumps({'profile':.5,'segments':proof},separators=(',',':')),encoding='utf-8')
(out/'manifest.json').write_text(json.dumps({'blender':bpy.app.version_string,'build':bpy.app.build_hash.decode(),'profile':.5,'meshes':records},indent=2),encoding='utf-8')
print('Exported rounded native bevels:',sum(r['bytes'] for r in records.values()),'bytes')
