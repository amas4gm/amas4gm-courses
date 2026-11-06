import * as THREE from '../../shared/vendor/three.module.js';
import {objectBounds} from './object-transform.js';

// Native-style selection: a constant-width silhouette plus separated box corners.
// A screen-space mask follows the actual mesh, including openings in the cabin.
export function createSelectionOutline({mesh,scene,camera,renderer}){
 const positions=new Float32Array(8*3*2*3),geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const brackets=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xffffff,depthTest:false,transparent:true,opacity:.95}));
 brackets.frustumCulled=false;brackets.renderOrder=10;brackets.visible=false;scene.add(brackets);
 const mask=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,samples:4});
 const maskMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
 const overlayMaterial=new THREE.ShaderMaterial({
  uniforms:{maskTexture:{value:mask.texture},texel:{value:new THREE.Vector2()},radius:{value:2},outlineColor:{value:new THREE.Color(0xffffff)}},
  transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 uvScreen; void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:`uniform sampler2D maskTexture; uniform vec2 texel; uniform float radius; uniform vec3 outlineColor; varying vec2 uvScreen;
   void main(){float center=texture2D(maskTexture,uvScreen).r;float expanded=center;
    for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){
     expanded=max(expanded,texture2D(maskTexture,uvScreen+vec2(float(x),float(y))*texel*radius).r);
    }}
    float edge=max(0.0,expanded-center);if(edge<0.01)discard;gl_FragColor=vec4(outlineColor,edge);
   }`
 });
 const overlayScene=new THREE.Scene(),overlayCamera=new THREE.Camera(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),overlayMaterial);quad.frustumCulled=false;overlayScene.add(quad);
 const bufferSize=new THREE.Vector2();let enabled=false;
 return {
  setError(value){const color=value?0xff3030:0xffffff;brackets.material.color.set(color);overlayMaterial.uniforms.outlineColor.value.set(color);},
  update(selected){
   enabled=selected;brackets.visible=selected;if(!selected)return;
   const bounds=objectBounds(mesh).expandByScalar(2),size=bounds.getSize(new THREE.Vector3());let offset=0;
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const corner=[x,y,z];for(let axis=0;axis<3;axis++){
     positions.set(corner,offset);offset+=3;const end=[...corner],component=['x','y','z'][axis];
     end[axis]+=(corner[axis]===bounds.min[component]?1:-1)*Math.min(8,size[component]*.2);
     positions.set(end,offset);offset+=3;
    }
   }
   geometry.attributes.position.needsUpdate=true;
  },
  render(){
   if(!enabled)return;renderer.getDrawingBufferSize(bufferSize);
   if(mask.width!==bufferSize.x||mask.height!==bufferSize.y)mask.setSize(bufferSize.x,bufferSize.y);
   overlayMaterial.uniforms.texel.value.set(1/mask.width,1/mask.height);overlayMaterial.uniforms.radius.value=1.6*renderer.getPixelRatio();
   const previous={target:renderer.getRenderTarget(),background:scene.background,material:scene.overrideMaterial,cameraMask:camera.layers.mask,meshMask:mesh.layers.mask,autoClear:renderer.autoClear};
   try{
    camera.layers.set(1);mesh.layers.enable(1);scene.background=new THREE.Color(0);scene.overrideMaterial=maskMaterial;
    renderer.autoClear=true;renderer.setRenderTarget(mask);renderer.render(scene,camera);
    renderer.setRenderTarget(previous.target);renderer.autoClear=false;renderer.render(overlayScene,overlayCamera);
   }finally{
    scene.background=previous.background;scene.overrideMaterial=previous.material;camera.layers.mask=previous.cameraMask;mesh.layers.mask=previous.meshMask;renderer.autoClear=previous.autoClear;renderer.setRenderTarget(previous.target);
   }
  },
  dispose(){brackets.removeFromParent();geometry.dispose();brackets.material.dispose();mask.dispose();maskMaterial.dispose();quad.geometry.dispose();overlayMaterial.dispose();}
 };
}
