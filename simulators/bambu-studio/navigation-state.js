// Observe camera distance for wheel, touchpad, and pinch input alike.
export function createZoomPractice(initialDistance){
 let reference=initialDistance,zoomIn=false,zoomOut=false;
 return {update(distance){
  const beforeIn=zoomIn,beforeOut=zoomOut;
  if(Number.isFinite(distance)&&distance>0){
   if(distance<reference*.995){zoomIn=true;reference=distance;}
   else if(distance>reference*1.005){zoomOut=true;reference=distance;}
  }
  return {zoomIn,zoomOut,changed:beforeIn!==zoomIn||beforeOut!==zoomOut,complete:zoomIn&&zoomOut};
 }};
}
