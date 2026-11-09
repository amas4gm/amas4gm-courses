// This simulator admits only the numeric path authored for this checkpoint.
// Every admitted intermediate value has a native Blender reference frame.
const targets={move:'1',rotate:'45',inset:'3',extrude:'-15',bevel:'0.6'};
export function startModal(kind){return {kind,raw:'',axis:kind==='extrude'?'z':'',segments:1};}
export function modalKey(op,key){
 const next={...op};
 if(['x','y','z'].includes(key)){
  const axis=op.kind==='move'?'x':op.kind==='rotate'?'z':null;
  if(key!==axis||op.axis===axis)return null;next.axis=axis;return next;
 }
 if(key==='Backspace'){next.raw=next.raw.slice(0,-1);return next;}
 if(!/^[0-9.\-]$/.test(key))return null;
 if(['move','rotate'].includes(op.kind)&&!op.axis)return null;
 next.raw+=key;return targets[op.kind].startsWith(next.raw)?next:null;
}
export function modalReady(op){return op.raw===targets[op.kind]&&(!['move','rotate'].includes(op.kind)||op.axis===(op.kind==='move'?'x':'z'))&&(op.kind!=='bevel'||op.segments===3);}
export function modalFrame(op){
 if(op.kind==='bevel')return op.raw==='0.6'?`bevel-modal-${op.segments}`:'bevel-modal-start';
 if(op.raw===targets[op.kind])return `${op.kind}-modal-ready`;
 if(op.kind==='rotate'&&op.raw==='4')return 'rotate-modal-4';
 if(op.kind==='extrude'&&op.raw==='-1')return 'extrude-modal-minus1';
 if(op.kind==='extrude'&&op.raw==='-')return 'extrude-modal-minus';
 return `${op.kind}-modal-${op.axis&&op.kind!=='extrude'?'axis':'start'}`;
}
