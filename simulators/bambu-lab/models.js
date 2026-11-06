import * as T from '../../shared/vendor/three.module.js';
export function buildLab(scene){
 const materials={metal:new T.MeshStandardMaterial({color:0x414747,roughness:.48,metalness:.3}),dark:new T.MeshStandardMaterial({color:0x202a29,roughness:.65}),white:new T.MeshStandardMaterial({color:0xe8e8dd,roughness:.6}),green:new T.MeshStandardMaterial({color:0x14b95f,roughness:.45}),rubber:new T.MeshStandardMaterial({color:0x242b29,roughness:1}),glass:new T.MeshPhysicalMaterial({color:0x8ba5a2,transparent:true,opacity:.19,roughness:.17,side:T.DoubleSide,depthWrite:false}),wood:new T.MeshStandardMaterial({color:0xc3ac88,roughness:.85})};
 function box(parent,w,h,d,x,y,z,mat=materials.dark){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function cylinder(parent,r,h,x,y,z,mat=materials.dark,axis='y'){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40),mat);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function label(parent,text,w,h,x,y,z,{background='#f5f4eb',color='#226b48',font='bold italic 90px Georgia'}={}){const c=document.createElement('canvas');c.width=640;c.height=Math.round(640*h/w);const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;ctx.fillText(text,c.width/2,c.height/2,600);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide}));m.position.set(x,y,z);parent.add(m);return m;}
 function spool(){const g=new T.Group();cylinder(g,.89,.76,0,0,0,materials.green,'x');
  for(const x of [-.43,.43]){const flange=new T.Mesh(new T.RingGeometry(.22,1.04,64),materials.white);flange.material=materials.white.clone();flange.material.side=T.DoubleSide;flange.rotation.y=Math.PI/2;flange.position.x=x;g.add(flange);const rim=new T.Mesh(new T.TorusGeometry(1.02,.035,6,64),materials.white);rim.rotation.y=Math.PI/2;rim.position.x=x;g.add(rim);
   for(let i=0;i<24;i++){const a=i*Math.PI/12;const hole=new T.Mesh(new T.CircleGeometry(.035,6),materials.dark);hole.rotation.y=x>0?Math.PI/2:-Math.PI/2;hole.position.set(x+(x>0?.002:-.002),Math.cos(a)*.85,Math.sin(a)*.85);g.add(hole);}
   const stripe=box(g,.01,.085,.34,x+(x>0?.008:-.008),.62,0,materials.green);stripe.rotation.x=.4;
  }
  for(let i=0;i<20;i++){const winding=new T.Mesh(new T.TorusGeometry(.897,.009,4,48),materials.green);winding.rotation.y=Math.PI/2;winding.position.x=-.36+i*.038;g.add(winding);}return g;
 }
 function printer(name,x){const g=new T.Group();g.position.x=x;scene.add(g);
  box(g,5.7,.09,5.1,0,-.08,0,new T.MeshStandardMaterial({color:0x345fba}));box(g,.24,6.4,4.7,-2.48,3.2,0,materials.metal);box(g,.24,6.4,4.7,2.48,3.2,0,materials.metal);box(g,5.2,.3,4.7,0,.15,0,materials.metal);box(g,5.2,.3,4.7,0,6.25,0,materials.metal);box(g,5.2,6.4,.2,0,3.2,-2.25,materials.metal);
  box(g,.18,4.9,.08,-2.25,3.05,2.39,materials.dark);box(g,.18,4.9,.08,2.25,3.05,2.39,materials.dark);box(g,4.65,.2,.08,0,.6,2.39,materials.dark);box(g,4.65,.2,.08,0,5.5,2.39,materials.dark);const bed=box(g,4.15,.12,3.8,0,1.65,.05,new T.MeshStandardMaterial({color:0x767f78,roughness:1}));
  for(const sx of [-2,2])cylinder(g,.045,4.6,sx,3.1,2.16,materials.white);
  box(g,4.35,4.65,.04,0,3.05,2.49,materials.glass);box(g,.18,1,.13,2.12,2.7,2.62,materials.white);
  box(g,5.1,.7,.2,0,5.8,2.5,materials.metal);label(g,'Bambu Lab   X2D',1.9,.3,1.23,5.82,2.62,{background:'#414747',color:'#d2d8d3',font:'bold 70px Arial'});
  box(g,1.65,1.05,.18,-1.25,5.9,2.75);const statusDisplay=label(g,'Ready',1.35,.64,-1.25,5.94,2.85,{background:'#203c4b',color:'#72e6ad',font:'bold 100px Arial'});
  box(g,.1,.65,.1,-1.7,6.5,2.8,materials.white);const tag=label(g,name,2.4,.64,-1.58,6.83,2.86);tag.userData.action=name;
  const ams=new T.Group();ams.position.y=6.45;g.add(ams);
  box(ams,5.35,.32,4.6,0,.2,0);box(ams,5.35,.6,.15,0,.63,2.22,materials.glass);box(ams,5.35,.1,.14,0,.97,2.22,materials.metal);
  box(ams,.12,.85,4.4,-2.62,.64,0);box(ams,.12,.85,4.4,2.62,.64,0);box(ams,5.3,.9,.1,0,.64,-2.2);
  label(ams,'AMS 2 Pro',1.6,.28,1.5,.68,2.31,{background:'#26302f',color:'#e7e8e1',font:'bold 82px Arial'});
  const slots=[-1.86,-.62,.62,1.86],intakes=[];
  for(let i=0;i<4;i++){const sx=slots[i];for(const z of [-.9,1])cylinder(ams,.14,1.03,sx,.63,z,materials.rubber,'x');
   if(i<3)box(ams,.07,.7,3.7,sx+.62,.58,0,materials.metal);
   cylinder(ams,.23,.7,sx,.41,1.9,materials.white);box(ams,.48,.15,.48,sx,.82,1.75,new T.MeshStandardMaterial({color:0xb8844a,transparent:true,opacity:.7}));
   const lever=new T.Group();lever.position.set(sx,.93,1.74);ams.add(lever);cylinder(lever,.19,.12,0,0,0,materials.white);box(lever,.38,.12,.19,0,-.02,.12,materials.white);cylinder(lever,.06,.13,0,.01,-.035,materials.dark);intakes.push(lever);
   label(ams,String(i+1),.22,.17,sx,.4,2.32,{background:'#26302f',color:'#e7e8e1',font:'bold 200px Arial'});
  }
  const tabs=[-2.42,2.42].map((sx,i)=>{const pivot=new T.Group();pivot.position.set(sx,1.02,2.12);ams.add(pivot);const tab=box(pivot,.18,.1,.55,0,0,-.16,materials.metal);tab.userData.action=i?'right-tab':'left-tab';return pivot;});
  const lid=new T.Group();lid.position.set(0,1,-2.15);ams.add(lid);
  const verts=[],indices=[];for(let i=0;i<=32;i++){const theta=i*Math.PI/32;for(const x of [-2.62,2.62])verts.push(x,Math.sin(theta)*1.75,2.15+Math.cos(theta)*2.15);if(i<32){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();lid.add(new T.Mesh(geo,materials.glass));
  for(const sx of [-2.62,2.62]){const pts=[];for(let i=0;i<=32;i++){let t=i*Math.PI/32;pts.push(new T.Vector3(sx,Math.sin(t)*1.75,2.15+Math.cos(t)*2.15));}lid.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x6e817b})));}
  box(lid,5.25,.08,.08,0,0,4.3,materials.metal);
  const roll=spool();roll.position.set(-1.86,1.6,0);roll.visible=false;ams.add(roll);
  const intake=intakes[0],end=new T.Object3D();end.position.set(-1.86,1.37,1.9);ams.add(end);
  const tagTarget=new T.Object3D();tagTarget.position.set(0,3.8,2.5);g.add(tagTarget);
  return {name,group:g,bed,statusDisplay,ams,tabs,lid,roll,intake,end,tagTarget,slots};
 }
 // Neutral lab context: bench, wall, computer, and the two named printers.
 box(scene,28,.45,7,0,-.36,0,materials.wood);for(const x of [-12,12])for(const z of [-2.5,2.5])box(scene,.24,4.2,.24,x,-2.65,z,materials.dark);
 box(scene,100,.2,100,0,-4.9,0,new T.MeshStandardMaterial({color:0xc6ccc5,roughness:1}));box(scene,40,22,.2,0,5,-5,new T.MeshStandardMaterial({color:0xe7e6dd,roughness:1}));
 const machines={Steve:printer('Steve',-3.7),Candus:printer('Candus',3.2)};
 box(scene,3.6,2.45,.2,-10,2.7,0,materials.dark);label(scene,'AMAS4GM',3.3,1.9,-10,2.7,.12,{background:'#153e32',color:'#deefdd',font:'bold 76px Arial'});box(scene,.2,1.5,.2,-10,.9,0,materials.metal);box(scene,1.6,.12,1,-10,.12,0,materials.metal);box(scene,3,.12,1.1,-10,.15,1.4,materials.dark);for(let i=0;i<12;i++)box(scene,.15,.03,.65,-11.2+i*.21,.23,1.4,materials.metal);label(scene,'LAB WORKSTATION',3,.4,-10,.55,2,{background:'#e7e6dd',color:'#486056',font:'bold 70px Arial'});
 const spare=spool();spare.position.set(9,1.08,1);scene.add(spare);
 return {machines,spare,materials};
}
