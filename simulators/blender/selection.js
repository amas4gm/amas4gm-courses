// Blender's plain click replaces a selection; Shift-click toggles one member.
export function selectVertex(current,index,extend=false){
 if(!extend)return [index];
 return current.includes(index)?current.filter(i=>i!==index):[...current,index];
}
