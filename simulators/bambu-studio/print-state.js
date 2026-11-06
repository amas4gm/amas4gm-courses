export function createLayerPractice(max=599,threshold=300){
 let inspected=false;
 return {input(value){const layer=Math.max(1,Math.min(max,Math.round(Number(value)||1)));const first=!inspected&&layer<=threshold;if(layer<=threshold)inspected=true;return {layer,first,complete:inspected&&layer===max};}};
}
export function validDevice(name){return ['Steve','Candus'].includes(name)?name:null;}
export function layerHeight(layer){return .2+(layer-1)*.08;}
