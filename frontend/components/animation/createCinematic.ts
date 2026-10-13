import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import {createBottle} from './mangoBottle';
import {cinematicConfig} from './cinematicConfig';
import type {Product} from '@/types/catalogue';

const clamp=THREE.MathUtils.clamp;
const ease=(a:number,b:number,v:number)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
type Treatment={color:string;fruit:string[];tilt:number;turns:number;pour:boolean;bubbles:boolean;spread:number};
const treatments:Record<string,Treatment>={
 mango:{color:'#ff9c0a',fruit:['/cinematic/mango-cheek.webp','/cinematic/mango-slice.webp'],tilt:-.24,turns:1.2,pour:true,bubbles:false,spread:1},
 lemon:{color:'#f9cd31',fruit:['/images/fruit-lemon.webp'],tilt:.32,turns:.8,pour:true,bubbles:false,spread:1.12},
 'lemon-salt':{color:'#d4e783',fruit:['/images/fruit-lemon-salt.webp'],tilt:-.1,turns:.65,pour:false,bubbles:true,spread:.9},
 cola:{color:'#60301d',fruit:[],tilt:.13,turns:1.5,pour:false,bubbles:true,spread:.8},
 dew:{color:'#86c923',fruit:[],tilt:-.5,turns:1.7,pour:true,bubbles:true,spread:1.05},
 apple:{color:'#de5436',fruit:['/images/fruit-apple.webp'],tilt:.18,turns:.85,pour:false,bubbles:false,spread:1.12},
 pineapple:{color:'#ffba21',fruit:['/images/fruit-pineapple.webp'],tilt:-.35,turns:1.1,pour:true,bubbles:false,spread:1.08},
 'mixed-fruits':{color:'#f09628',fruit:['/images/fruit-mixed-fruits.webp','/images/fruit-apple.webp','/cinematic/mango-cheek.webp'],tilt:.25,turns:1.3,pour:false,bubbles:false,spread:1.15},
 'green-apple':{color:'#92c839',fruit:['/images/fruit-green-apple.webp'],tilt:-.18,turns:.75,pour:false,bubbles:true,spread:1.04},
 nannari:{color:'#a05b2e',fruit:[],tilt:.06,turns:.55,pour:true,bubbles:false,spread:.9},
};

function ribbonGeometry(turns:number){
 const points:number[]=[],indices:number[]=[];const n=180,sides=10;
 for(let i=0;i<=n;i++){
  const t=i/n,a=t*Math.PI*2*turns,r=2.04+.24*Math.sin(t*Math.PI*3);
  const width=.018+.34*Math.pow(Math.sin(Math.PI*t),.8);
  for(let j=0;j<sides;j++){
   const c=j/sides*Math.PI*2,rr=r+Math.cos(c)*width;
   points.push(Math.sin(a)*rr,-1.5+t*.88+Math.sin(a*3)*.20+Math.sin(c)*(.022+width*.19),Math.cos(a)*rr);
   if(i<n){const k=i*sides+j,next=i*sides+(j+1)%sides;indices.push(k,next,k+sides,next,next+sides,k+sides)}
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export async function createCinematic(root:HTMLElement,products:Product[],signal:AbortSignal){
 const canvas=document.createElement('canvas');canvas.className='cinematic-canvas';canvas.setAttribute('aria-hidden','true');
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})}catch{return()=>{}}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,1,4000);camera.position.set(0,0,1400);
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?cinematicConfig.rendering.mobileDpr:cinematicConfig.rendering.desktopDpr));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfff9e0,0x886333,.65));
 const key=new THREE.DirectionalLight(0xfff4dc,1.7);key.position.set(-400,500,800);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffffff,1.8);rim.position.set(450,200,-400);scene.add(rim);
 const textures=new Map<string,THREE.Texture>(),loader=new THREE.TextureLoader();
 const loadImage=async(src:string)=>{const img=new Image();img.src=src;await img.decode();return img};
 let logo:HTMLImageElement,fronts:HTMLImageElement[];
 try{
  [logo,fronts]=await Promise.all([loadImage('/images/logo.webp'),Promise.all(products.map(p=>loadImage('/images/'+p.slug+'.webp')))]);
  await Promise.all(Array.from(new Set(Object.values(treatments).flatMap(t=>t.fruit))).map(async p=>{try{const t=await loader.loadAsync(p);t.colorSpace=THREE.SRGBColorSpace;textures.set(p,t)}catch{/* Decorative imagery is optional. */}}));
 }catch{renderer.dispose();env.dispose();textures.forEach(t=>t.dispose());return()=>{}}
 if(signal.aborted){renderer.dispose();env.dispose();textures.forEach(t=>t.dispose());return()=>{}}
 const bottles=products.map((p,i)=>{const b=createBottle(fronts[i],logo,p.slug);scene.add(b.group);return b});
 const mangoIndex=Math.max(0,products.findIndex(p=>p.slug==='mango'));
 const effects=new THREE.Group();scene.add(effects);
 const liquidMat=new THREE.MeshPhysicalMaterial({color:'#ffa015',roughness:.26,metalness:0,clearcoat:.75,clearcoatRoughness:.06,side:THREE.DoubleSide,transparent:true,opacity:.95,depthWrite:false,envMapIntensity:.65});
 const ribbon=new THREE.Mesh(ribbonGeometry(1.2),liquidMat);effects.add(ribbon);
 // Local origin is the actual neck opening (0,2.36,0); effects follow its world transform.
 const createPour=(slug:string)=>{
  const t=treatments[slug]||treatments.mango;
  const paths:Record<string,number[][]>={
   mango:[[0,2.35,0],[-.28,2.92,.08],[-1.25,3.08,-.1],[-2.1,1.9,-.3],[-2.2,.3,-.1],[-1.7,-1.1,.5],[.1,-1.4,.7]],
   lemon:[[0,2.35,0],[.3,2.98,0],[1.35,2.7,-.4],[2.1,1.2,-.6],[1.9,-.8,.4],[.4,-1.6,.8]],
   'lemon-salt':[[0,2.35,0],[-.12,2.94,0],[-.75,2.83,-.6],[-1.4,1.9,-.8],[-1.7,.1,-.2],[-1.5,-1.5,.3]],
   cola:[[0,2.35,0],[.15,2.87,0],[.85,2.9,-.5],[1.45,2,-.7],[1.65,.6,-.6],[1.75,-1.7,.3]],
   dew:[[0,2.35,0],[-.15,2.95,0],[-1.2,2.9,-.4],[-2.05,1.6,-.7],[-1.8,0,.6],[-.8,-1.5,1]],
   apple:[[0,2.35,0],[.4,2.83,0],[1.3,2.55,-.4],[2.0,1.3,-.8],[2.1,-.9,0],[.4,-1.9,1]],
   pineapple:[[0,2.35,0],[-.3,3.15,0],[-1.4,3.02,-.2],[-2.2,1.7,-.7],[-2.0,-.6,-.2],[-.8,-1.8,.7]],
   'mixed-fruits':[[0,2.35,0],[.3,3.0,0],[1.2,2.8,-.5],[2.1,1.4,-.9],[1.75,-.5,.3],[.1,-1.7,1]],
   'green-apple':[[0,2.35,0],[.1,2.97,0],[.9,2.85,-.5],[1.7,1.7,-.7],[1.95,-.1,-.2],[1.25,-1.7,.5]],
   nannari:[[0,2.35,0],[-.2,2.86,0],[-.85,2.8,-.4],[-1.55,1.5,-.7],[-1.75,-.2,-.2],[-1.35,-1.8,.5]],
  };
  const points=(paths[slug]||paths.mango).map(([x,y,z])=>new THREE.Vector3(x,y,z));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,t.bubbles?.065:slug==='nannari'?.07:.10,8,false);
 };
 const pour=new THREE.Mesh(createPour('mango'),liquidMat);effects.add(pour);
 const beadGeo=new THREE.SphereGeometry(1,8,6);
 const drops=Array.from({length:innerWidth<800?16:26},()=>{const m=new THREE.Mesh(beadGeo,liquidMat);effects.add(m);return m});
 const fruits=Array.from({length:4},()=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));effects.add(m);return m});
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d')!,sg=sc.createRadialGradient(64,64,0,64,64,64);sg.addColorStop(0,'rgba(88,47,0,.28)');sg.addColorStop(1,'rgba(88,47,0,0)');sc.fillStyle=sg;sc.fillRect(0,0,128,128);
 const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadow=new THREE.Sprite(new THREE.SpriteMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.6}));scene.add(shadow);
 const traveller=root.querySelector<HTMLElement>('.travelling-bottle')!,stage=root.querySelector<HTMLElement>('.carousel-stage')!,hero=root.querySelector<HTMLElement>('.evolution-hero')!;
 const slots=Array.from(root.querySelectorAll<HTMLElement>('.carousel-bottle'));
 let selected=Number(root.querySelector<HTMLSelectElement>('#direct-flavour')?.value||0),effectIndex=selected,effectSlug='',revealAt=performance.now(),entered=false,w=0,h=0,disposed=false,lastFrame=0;
 const opens=products.map(()=>0);const capTransitions=products.map(()=>({from:0,to:0,start:0}));
 const setup=(slug:string)=>{
  const t=treatments[slug]||treatments.mango;liquidMat.color.set(t.color);
  ribbon.geometry.dispose();ribbon.geometry=ribbonGeometry(t.turns);pour.geometry.dispose();pour.geometry=createPour(slug);
  fruits.forEach((f,i)=>{f.material.map=textures.get(t.fruit[i%t.fruit.length])||null;f.material.needsUpdate=true});effectSlug=slug;return t;
 };
 const onSelect=(event:Event)=>{const index=products.findIndex(p=>p.slug===(event as CustomEvent<string>).detail);if(index>=0){selected=index;revealAt=performance.now()}};
 root.addEventListener('cinematic-flavour',onSelect);
 const resize=()=>{w=innerWidth;h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};
 resize();window.addEventListener('resize',resize);root.appendChild(canvas);root.dataset.webgl='true';
 const onLost=(e:Event)=>{e.preventDefault();delete root.dataset.webgl;canvas.style.visibility='hidden'};
 canvas.addEventListener('webglcontextlost',onLost);
 const place=(object:THREE.Object3D,x:number,y:number,height:number,depth=0)=>{
  const unit=2*Math.tan(THREE.MathUtils.degToRad(17))*camera.position.z/h;
  object.position.set((x-w/2)*unit,(h/2-y)*unit,depth);object.scale.setScalar(height/6.1*unit);
 };
 const dim=(group:THREE.Group,amount:number)=>{
  if(Math.abs((group.userData.brightness??-1)-amount)<.01)return;group.userData.brightness=amount;
  const seen=new Set<THREE.Material>();
  group.traverse(object=>{if(!(object instanceof THREE.Mesh))return;const list=Array.isArray(object.material)?object.material:[object.material];for(const m of list){if(seen.has(m))continue;seen.add(m);if(m instanceof THREE.MeshPhysicalMaterial){if(!m.userData.originalColor)m.userData.originalColor=m.color.clone();m.color.copy(m.userData.originalColor).multiplyScalar(amount)}}});
 };
 const draw=()=>{
  const now=performance.now();
  if(disposed||document.hidden)return;
  if(w<800&&now-lastFrame<1000/cinematicConfig.rendering.mobileFps)return;
  const rr=root.getBoundingClientRect();if(rr.bottom<0||rr.top>h)return;
  const inCarousel=root.dataset.docked==='true',stageRect=stage.getBoundingClientRect();
  if(inCarousel&&(stageRect.bottom<0||stageRect.top>h)){canvas.style.visibility='hidden';return}
  canvas.style.visibility='visible';lastFrame=now;
  if(inCarousel&&!entered){entered=true;revealAt=now;effectIndex=selected;opens.fill(0);capTransitions.forEach(c=>{c.from=0;c.to=0;c.start=now})}if(!inCarousel)entered=false;
  const p=Number(root.dataset.cinematicProgress||0),ambient=now/1000,age=(now-revealAt)/1000,dragging=root.dataset.dragged==='true';
  const heroOpen=ease(.095,.29,p)*(1-ease(.83,.97,p));
  const spin=ease(.30,.81,p)*Math.PI*2;
  const depth=Number(root.dataset.journeyDepth||0),rx=Number(root.dataset.journeyTilt||0),ry=Number(root.dataset.journeyTurn||0);
  const rect=traveller.getBoundingClientRect();
  const scale=Number(gsap.getProperty(traveller,'scaleY'));
  const heroShrink=1-heroOpen*.11;
  const carouselWidth=parseFloat(getComputedStyle(stage).getPropertyValue('--bottle-width'));
  for(let i=0;i<bottles.length;i++){
   const b=bottles[i];
   if(!inCarousel){
    b.group.visible=i===mangoIndex;
    if(i!==mangoIndex)continue;
    place(b.group,rect.left+rect.width/2,rect.top+rect.height/2+heroOpen*28,592.5926*scale*heroShrink,depth);
    b.group.rotation.set(rx+.035*Math.sin(p*Math.PI),spin+ry,-THREE.MathUtils.degToRad(Number(gsap.getProperty(traveller,'rotation'))));
    b.setOpen(heroOpen,p*4);dim(b.group,1);
   }else{
    const slot=slots[i],r=slot.getBoundingClientRect(),visible=getComputedStyle(slot).visibility!=='hidden';
    b.group.visible=visible;
    const target=i===selected&&age>.52&&!dragging?1:0;
    const transition=capTransitions[i];if(transition.to!==target){transition.from=opens[i];transition.to=target;transition.start=now}const duration=target?cinematicConfig.carousel.openSeconds:cinematicConfig.carousel.closeSeconds;opens[i]=THREE.MathUtils.lerp(transition.from,target,THREE.MathUtils.clamp((now-transition.start)/(duration*1000),0,1));
    b.setOpen(ease(0,1,opens[i]),ambient*.75);
    if(!visible)continue;
    const s=Number(gsap.getProperty(slot,'scaleY'));
    place(b.group,r.left+r.width/2,r.top+r.height/2+Math.sin(ambient*.7)*1.8*opens[i],carouselWidth*800/540*s);
    b.group.rotation.set(Math.sin(ambient*.4)*.015*opens[i],Math.sin(ambient*.36)*.045*opens[i],-THREE.MathUtils.degToRad(Number(gsap.getProperty(slot,'rotation'))));
    dim(b.group,.68+.32*THREE.MathUtils.clamp((s-.48)/.52,0,1));
   }
  }
  if(inCarousel&&effectIndex!==selected&&age>.25)effectIndex=selected;
  const effectBottle=bottles[inCarousel?effectIndex:mangoIndex],slug=products[inCarousel?effectIndex:mangoIndex].slug;
  const treatment=effectSlug===slug?(treatments[slug]||treatments.mango):setup(slug);
  effects.position.copy(effectBottle.group.position);effects.scale.copy(effectBottle.group.scale);effects.rotation.set(effectBottle.group.rotation.x,0,effectBottle.group.rotation.z);
  const envelope=inCarousel?(effectIndex===selected?ease(.55,.9,opens[selected]):Math.max(0,1-age/.25))*(dragging?.2:1):ease(.31,.40,p)*(1-ease(.78,.87,p));
  effects.visible=(inCarousel||p<1&&hero.getBoundingClientRect().bottom>0)&&envelope>.005;
  const phase=inCarousel?ambient*.12:p*2.3;
  ribbon.rotation.y=phase*.6;ribbon.rotation.z=treatment.tilt;
  ribbon.scale.setScalar(.83+.17*envelope);ribbon.geometry.setDrawRange(0,Math.floor(clamp(envelope*1.4,0,1)*180)*60);
  liquidMat.opacity=.88*envelope;
  pour.visible=envelope>.01;pour.geometry.setDrawRange(0,Math.floor(envelope*100)*48);
  // A gentle pulse changes stream thickness while its first vertex stays at the mouth.
  pour.scale.set(1,1,1+Math.sin(phase*2)*.055);
  drops.forEach((drop,i)=>{const a=i*2.39996+phase*(i%2?.32:-.22),r=(1.65+(i%5)*.20)*treatment.spread;drop.position.set(Math.sin(a)*r,-.8+(i%7)*.39+Math.sin(phase*1.5+i)*.15,Math.cos(a)*r);const s=(.022+(i%4)*.015)*envelope;drop.scale.set(s,s*(treatment.bubbles?1:1.5),s)});
  fruits.forEach((fruit,i)=>{
   fruit.visible=treatment.fruit.length>0&&(w>=800||i<3);const side=i%2===0?-1:1;
   fruit.position.set(side*(1.9+(i%2)*.32)*treatment.spread+Math.sin(phase+i)*.16,[.8,-1.6,1.9,-.4][i]+Math.cos(phase*.8+i)*.18,[.6,1.5,-1.9,-1.3][i]);
   const size=[1.45,1.20,.75,.65][i]*(inCarousel?.83:1);fruit.scale.set(size,size*.74,1);fruit.material.rotation=[-.35,.3,-.15,.4][i]+Math.sin(phase+i)*.09;fruit.material.opacity=envelope*(i<2?.97:.65);
  });
  const b=bottles[inCarousel?selected:mangoIndex];shadow.position.copy(b.group.position);shadow.position.y-=b.group.scale.y*3.1;shadow.position.z=-60;shadow.scale.set(b.group.scale.x*4,b.group.scale.y*.4,1);shadow.material.opacity=inCarousel?.32:.55;
  canvas.dataset.rotationDegrees=(spin*180/Math.PI).toFixed(1);canvas.dataset.mode=inCarousel?'carousel':'journey';canvas.dataset.activeFlavour=products[inCarousel?selected:mangoIndex].slug;canvas.dataset.capOpen=(inCarousel?opens[selected]:heroOpen).toFixed(3);canvas.dataset.liquid=envelope.toFixed(3);
  renderer.render(scene,camera);
 };
 gsap.ticker.add(draw);draw();
 return()=>{disposed=true;gsap.ticker.remove(draw);window.removeEventListener('resize',resize);root.removeEventListener('cinematic-flavour',onSelect);canvas.removeEventListener('webglcontextlost',onLost);delete root.dataset.webgl;canvas.remove();bottles.forEach(b=>b.dispose());ribbon.geometry.dispose();pour.geometry.dispose();beadGeo.dispose();liquidMat.dispose();fruits.forEach(f=>f.material.dispose());textures.forEach(t=>t.dispose());shadowTexture.dispose();shadow.material.dispose();env.dispose();renderer.dispose()};
}

