"""Resolve native Blender 5.2 menu labels/icons from its actual Python UI definitions."""
import bpy,json
from pathlib import Path
from types import SimpleNamespace
OUT=Path(__file__).resolve().parents[1]/'menu-reference.json'
class Layout:
    def __init__(self,items):self.items=items;self.operator_context='INVOKE_DEFAULT';self.enabled=True;self.active=True
    def operator(self,id,**kw):
        op=bpy.ops
        for part in id.split('.'):op=getattr(op,part)
        try: label=op.get_rna_type().name
        except: label=id
        self.items.append({'kind':'operator','label':kw.get('text',label),'icon':kw.get('icon'),'operator':id,'enabled':self.enabled and self.active})
        return SimpleNamespace()
    def menu(self,id,**kw):
        cls=getattr(bpy.types,id,None);self.items.append({'kind':'submenu','label':kw.get('text',getattr(cls,'bl_label',id)),'icon':kw.get('icon'),'menu':id,'enabled':self.enabled and self.active})
    def operator_menu_enum(self,id,property,**kw):
        op=bpy.ops
        for part in id.split('.'):op=getattr(op,part)
        self.items.append({'kind':'submenu','label':kw.get('text',op.get_rna_type().name),'icon':kw.get('icon'),'operator':id,'property':property})
    def separator(self,**kw):self.items.append({'kind':'separator'})
    def row(self,**kw):return Layout(self.items)
    def column(self,**kw):return Layout(self.items)
    def prop(self,data,id,**kw):
        try: label=data.bl_rna.properties[id].name
        except: label=id
        self.items.append({'kind':'property','label':kw.get('text',label),'property':id,'value':getattr(data,id,None),'enabled':self.enabled and self.active})
    def label(self,**kw):self.items.append({'kind':'label',**kw})
    def template_node_operator_asset_menu_items(self,**kw):pass
    def __getattr__(self,name):
        if name.startswith('template_'):return lambda **kw:None
        raise AttributeError(name)
result={'source':'Actual installed Blender 5.2.2 UI draw functions and RNA labels','menus':{}}
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
with bpy.context.temp_override(area=area):
    for name in ['VIEW3D_MT_add','VIEW3D_MT_mesh_add','VIEW3D_MT_object','VIEW3D_MT_object_apply','VIEW3D_MT_view','TOPBAR_MT_file','TOPBAR_MT_file_export','VIEW3D_PT_overlay_geometry']:
        rows=[];layout=Layout(rows);cls=getattr(bpy.types,name)
        try:cls.draw(SimpleNamespace(layout=layout),bpy.context)
        except Exception as e:rows.append({'ERROR':str(e)})
        result['menus'][name]=rows
# C++ registered menu labels are not Python bpy.types classes.
for row in result['menus']['TOPBAR_MT_file']:
    if row.get('menu') == 'TOPBAR_MT_file_open_recent':
        row['label'] = 'Open Recent'  # space_topbar.cc:220.
# Context filter: rna_object.cc:36, object_edit.cc:2007, object_modes.cc:103.
result['menus']['object.mode_set'] = [
    {'kind':'operator', 'label':label, 'icon':icon, 'operator':'object.mode_set',
     'properties':{'mode':mode}, 'enabled':True}
    for mode,label,icon in [
        ('OBJECT','Object Mode','OBJECT_DATAMODE'),
        ('EDIT','Edit Mode','EDITMODE_HLT'),
        ('SCULPT','Sculpt Mode','SCULPTMODE_HLT'),
        ('VERTEX_PAINT','Vertex Paint','VPAINT_HLT'),
        ('WEIGHT_PAINT','Weight Paint','WPAINT_HLT'),
        ('TEXTURE_PAINT','Texture Paint','TPAINT_HLT'),
    ]
]
result['notes'] = [
    'Recorded native Python draw structure; enabled flags represent layout state, not complete native operator polling.',
    'Mode entries are source-filtered for an ordinary mesh without particle-edit support.',
    'Open Recent label comes from C++ registration in space_topbar.cc:220.',
    'Export includes enabled installed addons. Icon IDs map to icons/<lowercase id>.svg.',
]
OUT.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print('Saved',OUT)
