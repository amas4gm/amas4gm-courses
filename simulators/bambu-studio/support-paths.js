import {toolpathMesh} from './toolpath-mesh.js';

export function supportPathMesh(buffer,material){
 return toolpathMesh(buffer,material,{name:'Support paths extracted from Bambu Studio'});
}

export async function loadSupportPaths(material){
 const response=await fetch(new URL('./assets/benchy-support-paths.bin',import.meta.url));
 if(!response.ok)throw new Error('Could not load the reference support paths');
 return supportPathMesh(await response.arrayBuffer(),material);
}
