const fs=require('fs'),path=require('path'),sharp=require('../frontend/node_modules/sharp');
const dest=path.resolve(__dirname,'../frontend/public/cinematic/source');fs.mkdirSync(dest,{recursive:true});
const specs={
 mango:{file:'mango_3D.png',x:144,y:268,w:350,h:880,cy:589,ch:309,cx:318},
 apple:{file:'fruzo-apple-png.png',x:340,y:125,w:420,h:1090,cy:537,ch:346,cx:550},
 cola:{file:'fruzo-cola-png-1.png',x:337,y:125,w:420,h:1100,cy:535,ch:343,cx:547},
 dew:{file:'fruzo-dew-png.png',x:340,y:125,w:420,h:1100,cy:533,ch:345,cx:550},
 'green-apple':{file:'fruzo-green-png.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
 lemon:{file:'fruzo-lemon-png.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
 'mixed-fruits':{file:'fruzo-mixed-png.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
 nannari:{file:'fruzo-nannaripng.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
 pineapple:{file:'fruzo-pineapple-png.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
 'lemon-salt':{file:'fruzo-salt-png.png',x:340,y:125,w:420,h:1100,cy:535,ch:345,cx:550},
};
const ingredients=[
 ['mango','fruzo-mangopng.png',650,1000,280,230,'ellipse',150,120,125,100],
 ['apple','fruzo-apple-png.png',645,990,280,240,'ellipse',155,137,115,85],
 ['green-apple','fruzo-green-png.png',660,975,280,245,'ellipse',155,137,110,85],
 ['lemon','fruzo-lemon-png.png',730,965,260,260,'ellipse',135,135,105,108],
 ['lemon-salt','fruzo-salt-png.png',730,965,260,260,'ellipse',135,135,105,108],
 ['pineapple','fruzo-pineapple-png.png',645,975,285,260,'triangle'],
 ['dew','fruzo-dew-png.png',750,965,260,260,'ellipse',130,135,100,102],
 ['cola','fruzo-cola-png-1.png',210,430,185,195,'cube'],
 ['mixed-fruits','fruzo-mixed-png.png',150,980,240,250,'ellipse',130,140,95,95],
];
(async()=>{
 const manifest={bottles:{},ingredients:[],rear:'Mango rear uses supplied 250 ml reference; catalogue remains 200 ml pending packaging verification. Other rear artwork is provisional.'};
 for(const [slug,s] of Object.entries(specs)){
  const scale=675/s.h,width=Math.round(s.w*scale),pad=Math.floor((274-width)/2);
  const buffer=await sharp(path.resolve(__dirname,'../img/'+s.file)).extract({left:s.x,top:s.y,width:s.w,height:s.h}).resize({height:675}).png().toBuffer();
  let normalized=await sharp({create:{width:274,height:675,channels:4,background:'#00000000'}}).composite([{input:buffer,left:pad,top:0}]).png().toBuffer();
  await sharp(normalized).webp({quality:96}).toFile(path.join(dest,slug+'-front.webp'));
  manifest.bottles[slug]={source:s.file,crop:s,normalized:{cx:pad+(s.cx-s.x)*scale,labelY:(s.cy-s.y)*scale,labelH:s.ch*scale,bodyRatio:slug==='mango'?1:.91,capRatio:slug==='mango'?1:.9},url:'/cinematic/source/'+slug+'-front.webp'};
 }
 for(const [slug,file,x,y,w,h,shape,cx,cy,rx,ry] of ingredients){
  const outline=shape==='triangle'?'<path d="M8 216 L150 12 L271 201 L193 249 Z" fill="white"/>':shape==='cube'?'<path d="M22 20 L148 6 L181 137 L142 184 L15 152 Z" fill="white"/>':'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="white"/>';
  const mask=Buffer.from('<svg width="'+w+'" height="'+h+'">'+outline+'</svg>');
  const piece=await sharp(path.resolve(__dirname,'../img/'+file)).extract({left:x,top:y,width:w,height:h}).ensureAlpha().composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
  await sharp(piece).trim().webp({quality:92}).toFile(path.join(dest,slug+'-piece.webp'));
  manifest.ingredients.push({slug,source:file,crop:{x,y,w,h},url:'/cinematic/source/'+slug+'-piece.webp'});
 }
 fs.mkdirSync(path.resolve(__dirname,'../source/showcase'),{recursive:true});
 fs.writeFileSync(path.resolve(__dirname,'../source/showcase/asset-manifest.json'),JSON.stringify(manifest,null,2));console.log('Prepared ten front textures and nine ingredient extractions.');
})();

