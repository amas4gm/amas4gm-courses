// The UI stays native; this state describes the actual mesh behind its window.
const aliases={
 'units-expanded':'units','rename-popup':'cube-added','move-confirmed':'move-x','rotate-confirmed':'rotate-z',
 'inset-confirmed':'inset','extrude-confirmed':'cavity','extrude-cancelled':'inset','bevel-confirmed':'bevel-3'
};
export function liveState(name,manifest){
 if(name.startsWith('dialog-'))return null;
 let source=aliases[name]||name,op=null;
 if(name.includes('-modal-')){
  const kind=name.split('-modal-')[0];source=({move:'cube-sidebar',rotate:'cube-sidebar',scale:'cube-sidebar',inset:'edit-top',extrude:'inset',bevel:'rim'})[kind];
  const value=name.endsWith('ready')?({move:1,rotate:45,inset:3,extrude:-15}[kind]):name==='rotate-modal-4'?4:name==='extrude-modal-minus1'?-1:name.startsWith('bevel-modal-')&&!name.endsWith('start')?.6:0;
  op={kind,value,axis:kind==='extrude'?'z':!name.endsWith('start')?kind==='move'?'x':kind==='rotate'?'z':'': '',segments:kind==='bevel'?Number(name.at(-1))||1:1};
 }
 if(name==='extrude-cancelled')op={kind:'extrude',value:0,segments:1};
 const cfg=structuredClone(manifest.states[source]?.configuration||{});
 return {asset:'cube',mode:'OBJECT',selection:'all',...cfg,values:{...(cfg.values||{})},renamePopup:name==='rename-popup',clipStart:manifest.states[source]?.settings?.clipStart,clipEnd:manifest.states[source]?.settings?.clipEnd,name:source,operation:op};
}
export function meshForState(state,assets){
 if(!state||state.empty)return null;
 let asset=state.bevelSegments?`bevel-${state.bevelSegments}`:state.asset,op=state.operation;
 if(op?.kind==='inset')asset='inset';
 if(op?.kind==='extrude')asset='cavity';
 if(op?.kind==='bevel'&&op.value>0)asset=`bevel-${op.segments}`;
 const data=assets[asset];if(!data)throw Error(`Missing live mesh ${asset}`);
 const vertices=data.vertices.map(v=>v.slice()),values=state.values;
 if(asset==='cube')for(const v of vertices){v[0]*=(values.dx??2)/2;v[1]*=(values.dy??2)/2;v[2]*=(values.dz??2)/2;}
 if(op?.kind==='inset')for(const i of [1,3,5,7]){vertices[i][0]=Math.sign(vertices[i][0])*(50-op.value);vertices[i][1]=Math.sign(vertices[i][1])*(35-op.value);}
 if(op?.kind==='extrude')for(let i=12;i<16;i++)vertices[i][2]=18+op.value;
 if(op?.kind==='bevel'&&op.value>0){const factor=Math.min(op.value,2.9)/.6;for(const v of vertices){const nearest=assets.cavity.vertices.reduce((best,c)=>Math.hypot(...c.map((x,i)=>x-v[i]))<Math.hypot(...best.map((x,i)=>x-v[i]))?c:best);for(let i=0;i<3;i++)v[i]=nearest[i]+(v[i]-nearest[i])*factor;}}
 const rz=(values.rz||0)*Math.PI/180;
 for(const v of vertices){const x=v[0],y=v[1];v[0]=x*Math.cos(rz)-y*Math.sin(rz);v[1]=x*Math.sin(rz)+y*Math.cos(rz);
  if(op?.kind==='scale')for(let i=0;i<3;i++)if(!op.axis||'xyz'[i]===op.axis)v[i]*=op.value;
  if(op?.kind==='rotate'){const a=op.axis?[...op.axis].flatMap(k=>[k==='x'?1:0,k==='y'?1:0,k==='z'?1:0]):(op.viewAxis||[0,0,1]),r=op.value*Math.PI/180,c=Math.cos(r),s=Math.sin(r),dot=v.reduce((n,x,i)=>n+x*a[i],0),cross=[a[1]*v[2]-a[2]*v[1],a[2]*v[0]-a[0]*v[2],a[0]*v[1]-a[1]*v[0]];for(let i=0;i<3;i++)v[i]=v[i]*c+cross[i]*s+a[i]*dot*(1-c);}
  v[0]+=values.x||0;v[1]+=values.y||0;v[2]+=values.z||0;
  if(op?.kind==='move')for(let i=0;i<3;i++)v[i]+=op.axis?('xyz'[i]===op.axis?op.value:0):(op.vector?.[i]||0);
 }
 let selection=state.selection;
 if(op?.kind==='inset')selection='inner';if(op?.kind==='extrude')selection='floor';
 const selectedFaces=data.faces.map((f,i)=>{
  if(state.mode!=='EDIT'||selection==='none')return false;
  if(state.selectedVertices)return f.every(j=>state.selectedVertices.includes(j));
  if(state.bevelSegments||(op?.kind==='bevel'&&op.value>0))return data.selectedFaces.includes(i);
  if(selection==='rim')return false;
  if(selection==='all')return true;
  if(selection==='inner'||selection==='floor')return data.selectedFaces.includes(i);
  return selection==='top'&&f.every(j=>Math.abs(vertices[j][2]-18)<1e-5);
 });
 const selectedEdges=data.edges.map(([a,b])=>state.selectedVertices?[a,b].every(i=>state.selectedVertices.includes(i)):selection==='rim'&&asset==='cavity'?[a,b].every(i=>Math.abs(vertices[i][2]-18)<1e-5&&(Math.abs(vertices[i][0])>49.99||Math.abs(vertices[i][1])>34.99)):data.faces.some((f,i)=>selectedFaces[i]&&f.includes(a)&&f.includes(b)));
 const selectedVertices=vertices.map((_,i)=>state.selectedVertices?state.selectedVertices.includes(i):selection==='all'||data.faces.some((f,j)=>selectedFaces[j]&&f.includes(i)));
 return {...data,vertices,selectedFaces,selectedEdges,selectedVertices,asset};
}
export function viewportRect(state,manifest){
 const record=manifest.states[state?.name]||manifest.states.cube;
 const area=record.layout?.areas.find(a=>a.type==='VIEW_3D')||manifest.states.cube.layout.areas.find(a=>a.type==='VIEW_3D');
 const tools=area.regions.find(r=>r.type==='TOOLS'),ui=area.regions.find(r=>r.type==='UI');
 return {x:area.x,y:record.height-area.y-area.height,visibleY:115,width:area.width,height:area.height,left:area.x+(tools?.width||84),right:state?.sidebar&&ui?.width>1?ui.x:area.x+area.width};
}
