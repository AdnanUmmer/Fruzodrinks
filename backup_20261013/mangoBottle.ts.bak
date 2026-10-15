import * as THREE from 'three';

export const bottleArtwork:Record<string,{cx:number;y:number;h:number;cap:string;juice:string;label:string}>={
 mango:{cx:136,y:277,h:235,cap:'#f07800',juice:'#e8b432',label:'#ffc315'},
 lemon:{cx:136,y:273,h:237,cap:'#e9c900',juice:'#e7d69b',label:'#f5d02d'},
 'lemon-salt':{cx:264,y:274,h:238,cap:'#ead000',juice:'#dfdbb3',label:'#e7d055'},
 cola:{cx:301,y:272,h:237,cap:'#181a16',juice:'#341408',label:'#8c2112'},
 dew:{cx:138,y:272,h:237,cap:'#008036',juice:'#a0c566',label:'#82b630'},
 apple:{cx:331,y:273,h:238,cap:'#c20b20',juice:'#e2cfaa',label:'#c91c24'},
 pineapple:{cx:137,y:271,h:239,cap:'#e9c800',juice:'#dfc980',label:'#e2c437'},
 'mixed-fruits':{cx:334,y:274,h:238,cap:'#d21929',juice:'#e79880',label:'#d84220'},
 'green-apple':{cx:327,y:274,h:238,cap:'#008334',juice:'#afc976',label:'#8bb735'},
 nannari:{cx:138,y:274,h:235,cap:'#642600',juice:'#a56620',label:'#b87922'},
};

/** Authentic front pixels; decorative rear explicitly marked provisional. No product claims. */
export function createBottle(front:HTMLImageElement,logo:HTMLImageElement,slug:string){
 const spec=bottleArtwork[slug]||bottleArtwork.mango;
 const group=new THREE.Group(),cap=new THREE.Group();group.add(cap);cap.position.y=2.60;
 const resources:(THREE.BufferGeometry|THREE.Material|THREE.Texture)[]=[];
 const material=(p:THREE.MeshPhysicalMaterialParameters)=>{const m=new THREE.MeshPhysicalMaterial(p);resources.push(m);return m};
 const add=(geometry:THREE.BufferGeometry,mat:THREE.Material,y=0,parent:THREE.Group=group)=>{resources.push(geometry);const mesh=new THREE.Mesh(geometry,mat);mesh.position.y=y;parent.add(mesh);return mesh};
 const profile=[[0,-2.9],[.82,-2.9],[1.04,-2.84],[1.12,-2.70],[1.14,-2.45],[1.14,.55],[1.13,.92],[1.04,1.20],[.91,1.47],[.70,1.80],[.58,1.98],[.57,2.36]].map(([x,y])=>new THREE.Vector2(x,y));
 const bodyMat=material({color:spec.juice,roughness:.19,metalness:.025,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.8});
 add(new THREE.LatheGeometry(profile,64),bodyMat);
 const shellMat=material({color:'#fff4db',roughness:.11,metalness:.04,transparent:true,opacity:.065,depthWrite:false,clearcoat:1});
 const shell=add(new THREE.LatheGeometry(profile,64),shellMat);shell.scale.setScalar(1.008);
 const ridge=material({color:'#ead39b',roughness:.14,metalness:.08,clearcoat:1});
 for(const [y,r] of [[-2.64,1.105],[-2.5,1.13],[.92,1.115],[2.10,.582],[2.25,.588],[2.36,.565]]){
  const ring=add(new THREE.TorusGeometry(r,.021,8,64),ridge,y);ring.rotation.x=Math.PI/2;
 }
 // Hollow mouth and internal beverage surface, revealed only when the cap lifts.
 const neck=material({color:'#d3b667',roughness:.15,side:THREE.DoubleSide,clearcoat:1});
 add(new THREE.CylinderGeometry(.535,.535,.27,48,1,true),neck,2.23);
 const mouth=add(new THREE.CircleGeometry(.53,48),material({color:spec.juice,roughness:.1,clearcoat:1}),2.14);mouth.rotation.x=-Math.PI/2;
 const capMat=material({color:spec.cap,roughness:.31,clearcoat:.48});
 add(new THREE.CylinderGeometry(.66,.68,.52,64,1,true),capMat,0,cap);
 add(new THREE.CylinderGeometry(.635,.65,.035,64),capMat,.278,cap);
 const bottom=add(new THREE.TorusGeometry(.663,.023,8,64),capMat,-.25,cap);bottom.rotation.x=Math.PI/2;
 // Tamper ring remains on the neck as the cap unscrews.
 add(new THREE.CylinderGeometry(.69,.69,.08,64,1,true),capMat,2.28);
 const ribGeo=new THREE.BoxGeometry(.021,.40,.029);resources.push(ribGeo);
 const ribs=new THREE.InstancedMesh(ribGeo,capMat,64),dummy=new THREE.Object3D();
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2;dummy.position.set(Math.sin(a)*.667,0,Math.cos(a)*.667);dummy.rotation.set(0,a,0);dummy.updateMatrix();ribs.setMatrixAt(i,dummy.matrix)}cap.add(ribs);
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=768;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle=spec.label;ctx.fillRect(0,0,2048,768);
 // A replaceable decorative back panel: logo, authentic slogan and explicit concept status.
 for(const center of [0,2048]){
  ctx.save();ctx.translate(center,0);ctx.strokeStyle='#fff5b6';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(-480,80);ctx.bezierCurveTo(-160,240,200,-80,480,100);ctx.stroke();
  ctx.globalAlpha=.18;ctx.strokeStyle='#173b26';ctx.lineWidth=80;ctx.beginPath();ctx.moveTo(-450,660);ctx.bezierCurveTo(-180,440,150,820,450,570);ctx.stroke();ctx.globalAlpha=1;
  ctx.drawImage(logo,-170,170,340,201);ctx.fillStyle='#173b26';ctx.textAlign='center';ctx.font='600 30px Arial';ctx.fillText('Refreshing Every Moment',0,425);
  ctx.font='18px Arial';ctx.fillText('PROVISIONAL ARTWORK',0,630);ctx.restore();
 }
 for(let x=0;x<2048;x++){const a=(x/2048-.5)*Math.PI*2;if(Math.abs(a)>1.38)continue;const sx=spec.cx+132*Math.sin(a);ctx.drawImage(front,sx,spec.y,1.5,spec.h,x,0,1,768)}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;resources.push(texture);
 const labelMat=material({map:texture,roughness:.46,clearcoat:.25});
 const label=add(new THREE.CylinderGeometry(1.151,1.151,2.06,80,1,true),labelMat,-.21);label.rotation.y=Math.PI;
 const beadGeo=new THREE.SphereGeometry(1,8,6);resources.push(beadGeo);
 const beadMat=material({color:'#fff3ca',roughness:.08,metalness:.1,transparent:true,opacity:.36,clearcoat:1});
 const beads=new THREE.InstancedMesh(beadGeo,beadMat,32);
 for(let i=0;i<32;i++){const a=i*2.39996,y=i%2===0?-2.48+(i%11)*.095:1.01+(i%7)*.07,r=y>1?1.1-(y-1)*.64:1.15,s=.014+(i%4)*.007;dummy.position.set(Math.sin(a)*r,y,Math.cos(a)*r);dummy.rotation.set(0,a,0);dummy.scale.set(s,s*1.32,s*.55);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix)}group.add(beads);
 const setOpen=(value:number,ambient=0)=>{
  const v=THREE.MathUtils.clamp(value,0,1),unscrew=Math.min(1,v/.45),lift=Math.max(0,(v-.35)/.65);
  cap.rotation.set(lift*.11,unscrew*Math.PI*3.2,lift*-.10);
  cap.position.set(Math.max(0,(lift-.5)*2)*.65,2.60+unscrew*.22+lift*.85+Math.sin(ambient)*.035*lift,lift*.05);
 };
 return {group,cap,setOpen,dispose:()=>resources.forEach(r=>r.dispose())};
}

