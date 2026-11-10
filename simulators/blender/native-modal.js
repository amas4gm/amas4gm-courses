// Checkpoints validate the result, not the path taken to enter a number.
export const targets={move:1,rotate:45,inset:3,extrude:-15,bevel:.6};
export function startModal(kind){return {kind,raw:'',axis:kind==='extrude'?'z':'',segments:1,visualValue:kind==='scale'?1:0,vector:[0,0,0],mouseTravel:0,normalTravel:0,precisionTravel:0};}
export function modalValue(op){return op.raw!==''?(Number.isFinite(Number(op.raw))?Number(op.raw):0):op.visualValue;}
export function modalKey(op,key){
 const next={...op};
 if(['x','y','z'].includes(key)&&['move','rotate','scale'].includes(op.kind)){next.axis=op.axis===key?'':key;return next;}
 if(key==='Backspace'){next.raw=next.raw.slice(0,-1);return next;}
 if(key==='-'){next.raw=next.raw.startsWith('-')?next.raw.slice(1):'-'+next.raw;return next;}
 if(!/^[0-9.]$/.test(key)||next.raw.length>=12||(key==='.'&&next.raw.includes('.')))return null;
 next.raw+=key;return next;
}
export function modalReady(op,goal=targets[op.kind]){return Math.abs(modalValue(op)-goal)<.001&&(!['move','rotate'].includes(op.kind)||op.axis===(op.kind==='move'?'x':'z'))&&(op.kind!=='bevel'||op.segments===3);}
export function modalFrame(op){
 if(op.kind==='scale')return 'cube-sidebar';
 if(op.kind==='bevel')return op.raw==='0.6'?`bevel-modal-${op.segments}`:'bevel-modal-start';
 if(op.raw===String(targets[op.kind]))return `${op.kind}-modal-ready`;
 if(op.kind==='rotate'&&op.raw==='4')return 'rotate-modal-4';
 if(op.kind==='extrude'&&op.raw==='-1')return 'extrude-modal-minus1';
 if(op.kind==='extrude'&&op.raw==='-')return 'extrude-modal-minus';
 return `${op.kind}-modal-${op.axis&&op.kind!=='extrude'?'axis':'start'}`;
}
export function modalCaption(op){
 const value=modalValue(op),typed=op.raw?`[${op.raw}|] = `:'',axis=op.axis?` along global ${op.axis.toUpperCase()}`:'';
 const n=Number.isFinite(value)?value.toFixed(4):'0.0000';
 if(op.kind==='move')return op.axis?`D: ${typed}${n} mm${axis}`:op.raw?`D: ${typed}${n} mm`:`Dx: ${op.vector[0].toFixed(4)} mm  Dy: ${op.vector[1].toFixed(4)} mm  Dz: ${op.vector[2].toFixed(4)} mm`;
 if(op.kind==='rotate')return `Rotation: ${typed}${value.toFixed(2)}°${axis}`;
 if(op.kind==='scale')return op.axis?`Scale: ${typed}${n}${axis}`:`Scale X: ${typed}${n}  Y: ${typed}${n}  Z: ${typed}${n}`;
 if(op.kind==='inset')return `Thickness: ${typed}${n} mm, Depth: 0 mm`;
 if(op.kind==='extrude')return `D: ${typed}${n} mm along normal Z`;
 return `Offset: ${typed}${n} mm, Segments: ${op.segments}, Profile Shape: 0.5`;
}
export function precisionDelta(delta,shift){return delta*(shift ? 0.1 : 1);}

// Navigation gizmos use the region center (use_cursor_init=false). Native Dolly zoom.
export function dragZoomDistance(distance,deltaY,regionHeight){return Math.max(.15,Math.min(3000,distance*(1+2*deltaY/(regionHeight/2+11.25))));}

export function visualReady(op){return op.normalTravel>=20&&op.precisionTravel>=12;}
