"""Package the setup lesson's native Blender captures without repainting UI."""
from pathlib import Path
from PIL import Image
import json,hashlib,copy
root=Path(__file__).resolve().parents[1];src=root/'simulators/blender/reference';out=root/'simulators/blender/assets/ui'
manifest=json.loads((out/'manifest.json').read_text())
setup=json.loads((src/'setup-manifest.json').read_text())
assert setup['build']==manifest['build']
records=setup['states']
for name,base in [('setup-scene','setup-units'),('setup-sidebar','setup-view'),('setup-system-menu','setup-units'),('setup-length-menu','setup-scale')]:
 records[name]=copy.deepcopy(records[base]);records[name]['file']=name+'.webp'
def package(image,name):
 path=out/(name+'.webp');image.convert('RGB').save(path,lossless=True,method=6)
 return {'file':path.name,'width':image.width,'height':image.height,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
for name,record in records.items():
 record.update(package(Image.open(src/(name+'.png')),name));manifest['states'][name]=record
# Exact native popup pixels. Background scene and live viewport remain current.
for name,source,box in [('TOPBAR_MT_file_defaults','setup-defaults-menu',(339,574,644,650)),('startup.confirm','setup-startup-confirm',(975,666,1422,816))]:
 im=Image.open(src/(source+'.png')).crop(box)
 manifest['menus'][name]={**package(im,'popup-'+name.replace('.','-')),'sourceCapture':source+'.png','crop':box,'rowHeight':29}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Packaged',len(records),'setup captures and 2 native popups')
