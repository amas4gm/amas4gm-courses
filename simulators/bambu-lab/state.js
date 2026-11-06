export const devices=['Steve','Candus'];
export function createLabState(phase='choose',completed=false,device='Steve'){
 const rank=['choose','unlock','place','press','insert','complete'].indexOf(phase),past=n=>rank>n||rank===n&&completed;
 return {phase,device:devices.includes(device)?device:'Steve',chosen:past(0),tabs:[past(1),past(1)],lid:past(1),roll:past(2),pressed:past(3)&&!past(4),fed:past(4)};
}
export function applyLabAction(state,action){
 const next={...state,tabs:[...state.tabs]};let complete=false;
 if(state.phase==='choose'&&devices.includes(action)){next.device=action;next.chosen=true;complete=true;}
 else if(state.phase==='unlock'&&['left-tab','right-tab'].includes(action)){const i=action==='left-tab'?0:1;if(next.tabs[i])return {accepted:false,state};next.tabs[i]=true;next.lid=next.tabs.every(Boolean);complete=next.lid;}
 else if(state.phase==='place'&&action==='roll'&&state.lid){next.roll=true;complete=true;}
 else if(state.phase==='press'&&action==='intake'&&state.roll){next.pressed=true;complete=true;}
 else if(state.phase==='insert'&&action==='filament'&&state.pressed){next.fed=true;next.pressed=false;complete=true;}
 else return {accepted:false,state};
 return {accepted:true,state:next,complete};
}
