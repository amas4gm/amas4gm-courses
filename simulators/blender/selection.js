// Blender's plain click replaces a selection; Shift-click toggles one member.
export function selectVertex(current,index,extend=false){
 if(!extend)return [index];
 return current.includes(index)?current.filter(i=>i!==index):[...current,index];
}
export const selectEdge=selectVertex;
export function rimEdgeIndices(data){return data.edges.flatMap((edge,i)=>edge.every(j=>Math.abs(data.vertices[j][2]-18)<1e-5&&(Math.abs(data.vertices[j][0])>49.99||Math.abs(data.vertices[j][1])>34.99))?[i]:[]);}
