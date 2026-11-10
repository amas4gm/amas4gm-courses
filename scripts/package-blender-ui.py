"""Package lossless native UI captures; preserve original pixels and capture geometry."""
from pathlib import Path
from PIL import Image
import json,hashlib,subprocess
root=Path(__file__).resolve().parents[1];src=root/'simulators/blender/reference';out=root/'simulators/blender/assets/ui';out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((src/'capture-manifest.json').read_text())
# A separate narrow capture manifest is merged when available.
if (src/'narrow-manifest.json').exists():manifest['states'].update(json.loads((src/'narrow-manifest.json').read_text())['states'])
# Live navigation replaces the orbit/pan/zoom image sequences. Keep native UI
# checkpoints, modal captions and narrow-header motion, not unused camera frames.
frame_names=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {frames} from './simulators/blender/native-state.js'; console.log(JSON.stringify(Object.values(frames).flatMap(l=>Object.values(l).flat())));"],cwd=root,text=True))
needed=set(frame_names)|{'bevel-3','dialog-save','dialog-export','extrude-cancelled','rename-popup'}
needed.update(f'header-narrow-{i:02d}' for i in range(17))
needed.update(p.stem for p in src.glob('*-modal-*.png'))
needed.update(p.stem for p in src.glob('*-confirmed.png'))
manifest['states']={name:record for name,record in manifest['states'].items() if name in needed}
for name,record in manifest['states'].items():
 im=Image.open(src/(name+'.png')).convert('RGB')
 if not (out/(name+'.webp')).exists() or (src/(name+'.png')).stat().st_mtime>(out/(name+'.webp')).stat().st_mtime:im.save(out/(name+'.webp'),lossless=True,method=6)
 record.pop('source',None);record['width'],record['height']=im.size;record['sha256']=hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()
extras=['dialog-save','dialog-export','units-expanded','extrude-cancelled','rename-popup']+[p.stem for p in src.glob('*-modal-*.png')]+[p.stem for p in src.glob('*-confirmed.png')]
for name in extras:
 if (src/(name+'.png')).exists():
  im=Image.open(src/(name+'.png')).convert('RGB')
  if not (out/(name+'.webp')).exists() or (src/(name+'.png')).stat().st_mtime>(out/(name+'.webp')).stat().st_mtime:im.save(out/(name+'.webp'),lossless=True,method=6)
  manifest['states'][name]={'file':name+'.webp','width':im.width,'height':im.height,'sha256':hashlib.sha256((out/(name+'.webp')).read_bytes()).hexdigest()}
menu_crops={
 'VIEW3D_MT_add':('menu-add',(372,71,619,673),29),
 'VIEW3D_MT_mesh_add':('menu-mesh',(619,71,866,381),29),
 'VIEW3D_MT_object':('menu-object',(425,71,714,1080),29),
 'VIEW3D_MT_object_apply':('menu-apply',(714,184,1040,649),29),
 'VIEW3D_MT_view':('menu-view',(240,71,621,731),29),
 'TOPBAR_MT_file':('menu-file',(36,33,339,654),29),
 'TOPBAR_MT_file_export':('menu-export',(339,437,705,737),29),
 'object.mode_set':('menu-mode',(70,71,260,270),32),
 'object.mode_set.edit':('menu-mode-edit',(70,71,260,270),32),
 'overlays':('overlays',(1490,77,1928,887),29),
 'overlays.enabled':('overlays-enabled',(1490,77,1928,887),29),
}
manifest['menus']={}
for key,(source,box,row_height) in menu_crops.items():
 im=Image.open(src/(source+'.png')).convert('RGB').crop(box);name='popup-'+key.replace('.','-')+'.webp';im.save(out/name,lossless=True,method=6)
 manifest['menus'][key]={'file':name,'width':im.width,'height':im.height,'rowHeight':row_height,'sourceCapture':source+'.png','crop':box,'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest()}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
# Only generated files in this resolved output directory are eligible for pruning.
kept={r['file'] for r in manifest['states'].values()}|{r['file'] for r in manifest['menus'].values()}
for path in out.glob('*.webp'):
 if path.name not in kept and path.resolve().parent==out.resolve():path.unlink()
print('Packaged',len(manifest['states']),'native UI captures;',round(sum(p.stat().st_size for p in out.iterdir())/1e6,2),'MB')
