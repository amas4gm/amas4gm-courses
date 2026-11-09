// Offline extraction of deposited body and support paths from Bambu Studio's G-code.
// No machine commands or printer identifiers are included in the web asset.
export const bodyFeatures=['Outer wall','Inner wall','Sparse infill','Internal solid infill','Top surface','Bottom surface','Gap infill','Bridge','Overhang wall','Floating vertical shell'];
export function extractSupportPaths(gcode,options={}){return extractToolpaths(gcode,{...options,features:['Support','Support interface']});}
export function extractToolpaths(gcode,{centerX=128,centerY=128,chordError=.015,features=bodyFeatures}={}){
 let x=0,y=0,z=0,e=0,relativeE=false,relativeXYZ=false,feature='',width=.42,height=.2,wiping=false;
 const segments=[],counts=Object.fromEntries(features.map(name=>[name,0]));
 function add(a,b){
  if(Math.hypot(b[0]-a[0],b[1]-a[1])<1e-6)return;
  // Bambu Z-up -> simulator Y-up; origin at the model's plate center.
  segments.push(a[0]-centerX,a[2],centerY-a[1],b[0]-centerX,b[2],centerY-b[1],width,height);
  counts[feature]++;
 }
 for(const raw of gcode.split(/\r?\n/)){
  const line=raw.trim();
  if(line.startsWith('; FEATURE: ')){feature=line.slice(11).trim();continue;}
  if(line.startsWith('; LINE_WIDTH: ')){width=Number(line.slice(14));continue;}
  if(line.startsWith('; LAYER_HEIGHT: ')){height=Number(line.slice(16));continue;}
  if(line==='; WIPE_START'){wiping=true;continue;}
  if(line==='; WIPE_END'){wiping=false;continue;}
  const code=line.split(';')[0],command=code.match(/^([GMT]\d+)\b/)?.[1];
  if(!command)continue;
  const p=Object.fromEntries([...code.matchAll(/([XYZEIJRP])\s*(-?(?:\d+\.?\d*|\.\d+))/g)].map(m=>[m[1],Number(m[2])]));
  if(command==='M82'){relativeE=false;continue;}if(command==='M83'){relativeE=true;continue;}
  if(command==='G90'){relativeXYZ=false;continue;}if(command==='G91'){relativeXYZ=true;continue;}
  if(command==='G20')throw new Error('Inch units are not supported by this extractor');
  if(command==='G92'){x=p.X??x;y=p.Y??y;z=p.Z??z;e=p.E??e;continue;}
  if(!['G0','G1','G2','G3'].includes(command))continue;
  const next=(key,current)=>p[key]===undefined?current:p[key]+(relativeXYZ?current:0);
  const nx=next('X',x),ny=next('Y',y),nz=next('Z',z),de=p.E===undefined?0:relativeE?p.E:p.E-e;
  if(!wiping&&de>0&&Object.hasOwn(counts,feature)){
   if(command==='G2'||command==='G3'){
    if(p.R!==undefined||p.I===undefined&&p.J===undefined)throw new Error('Expected an I/J extrusion arc');
    const cx=x+(p.I??0),cy=y+(p.J??0),radius=Math.hypot(x-cx,y-cy),start=Math.atan2(y-cy,x-cx);
    let sweep=Math.atan2(ny-cy,nx-cx)-start;
    if(command==='G2'){if(sweep>=0)sweep-=Math.PI*2;}else if(sweep<=0)sweep+=Math.PI*2;
    const limit=Math.min(Math.PI/18,2*Math.acos(Math.max(-1,1-chordError/radius)));
    const n=Math.max(1,Math.ceil(Math.abs(sweep)/limit));let previous=[x,y,z];
    for(let i=1;i<=n;i++){const angle=start+sweep*i/n,point=i===n?[nx,ny,nz]:[cx+radius*Math.cos(angle),cy+radius*Math.sin(angle),z+(nz-z)*i/n];add(previous,point);previous=point;}
   }else add([x,y,z],[nx,ny,nz]);
  }
  x=nx;y=ny;z=nz;if(p.E!==undefined)e=relativeE?e+p.E:p.E;
 }
 if(segments.some(v=>!Number.isFinite(v)))throw new Error('Non-finite support coordinate');
 return {segments:new Float32Array(segments),counts};
}
