import * as T from '../../shared/vendor/three.module.js';
import {buildLab} from '../bambu-lab/models.js';

// Reuse the lab and the course STL. No video or duplicate model payload.
export function createPrintAnimation({host,geometry,supports,materialColor=0x8e8960,onComplete}){
 host.innerHTML='<canvas aria-label="Accelerated simulation of the selected printer printing Benchy"></canvas><div class="print-caption"><strong></strong><p>Accelerated printing simulation</p><progress max="599" value="0"></progress><span role="status"></span></div>';
 const canvas=host.querySelector('canvas'),status=host.querySelector('[role=status]'),progress=host.querySelector('progress');
 const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.localClippingEnabled=true;
 const scene=new T.Scene();scene.background=new T.Color('#e4e9e4');scene.add(new T.HemisphereLight(0xffffff,0x45524b,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,12,12);scene.add(light);
 const lab=buildLab(scene),camera=new T.PerspectiveCamera(38,1,.1,100);lab.spare.visible=false;
 const model=new T.Mesh(geometry.clone(),new T.MeshStandardMaterial({color:materialColor,roughness:.7,side:T.DoubleSide}));model.geometry.computeBoundingBox();const bounds=model.geometry.boundingBox,center=bounds.getCenter(new T.Vector3());model.geometry.translate(-center.x,-bounds.min.y,-center.z);model.scale.setScalar(.052);
 const height=(bounds.max.y-bounds.min.y)*.052,clip=new T.Plane(new T.Vector3(0,-1,0),4.4);model.material.clippingPlanes=[clip];
 for(const original of supports.children){const part=original.clone();part.geometry=original.geometry.clone();part.material=original.material.clone();part.material.clippingPlanes=[clip];model.add(part);}
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const head=new T.Mesh(new T.BoxGeometry(.9,.6,.8),lab.materials.dark);const nozzle=new T.Mesh(new T.ConeGeometry(.08,.2,12),lab.materials.metal);nozzle.rotation.z=Math.PI;nozzle.position.y=-.39;head.add(nozzle);
 function screen(text){const tx=machine.statusDisplay.material.map,c=tx.image,ctx=c.getContext('2d');ctx.fillStyle='#203c4b';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#72e6ad';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 90px Arial';ctx.fillText(text,c.width/2,c.height/2,600);tx.needsUpdate=true;}
 let machine,frame=0,last=0,elapsed=0,paused=false,active=false;
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw();}
 function draw(){if(machine)renderer.render(scene,camera);}
 function state(fraction){const y=4.4-height*fraction;machine.bed.position.y=y-.06;model.position.y=y;clip.constant=4.405;head.position.set(reduceMotion?0:Math.sin(elapsed*.009)*1.3,4.85,reduceMotion?0:Math.cos(elapsed*.013)*.65);machine.roll.rotation.x=reduceMotion?0:elapsed*.001;model.visible=fraction>0;const layer=Math.max(1,Math.round(fraction*599));progress.value=layer;status.textContent=fraction>=1?'Print complete · Benchy and supports are ready to cool before removal':`Printing layer ${layer} of 599`;if(fraction>=1)head.position.set(-1.7,4.85,-1.5);draw();}
 function tick(now){const delta=Math.min(100,now-last);last=now;if(!paused&&!document.hidden)elapsed+=delta;const fraction=Math.min(1,elapsed/14000);state(fraction);if(fraction<1)frame=requestAnimationFrame(tick);else{active=false;screen('Complete');draw();onComplete();}}
 function show(name,finished=false){cancelAnimationFrame(frame);active=!finished;elapsed=finished?14000:0;machine=lab.machines[name];for(const m of Object.values(lab.machines))m.group.visible=m===machine;machine.roll.visible=true;screen(finished?'Complete':'Printing');machine.lid.rotation.x=0;machine.group.add(model,head);camera.position.set(machine.group.position.x+7.5,7.5,14);camera.lookAt(machine.group.position.x,4,0);host.hidden=false;host.querySelector('strong').textContent=`${name} · Bambu Lab X2D`;resize();state(finished?1:0);if(!finished){last=performance.now();frame=requestAnimationFrame(tick);}}
 const observer=new ResizeObserver(resize);observer.observe(host);
 return {show,hide(){cancelAnimationFrame(frame);active=false;host.hidden=true;},setPaused(value){paused=value;},get active(){return active;},dispose(){cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat().filter(Boolean)){Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();}});renderer.dispose();host.remove();}};
}
