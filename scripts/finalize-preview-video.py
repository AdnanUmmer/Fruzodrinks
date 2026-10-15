"""Add duration metadata to local MediaRecorder WebM without re-encoding frames."""
from pathlib import Path
import struct
p=Path(__file__).resolve().parent.parent/'qa/showcase-delivery/cinematic-preview.webm'
b=p.read_bytes()
def vint(data,pos,ident=False):
 first=data[pos];length=1
 while not first&(1<<(8-length)):length+=1
 raw=int.from_bytes(data[pos:pos+length],'big')
 return (raw if ident else raw&((1<<(7*length))-1)),length
def element(pos):
 ident,n=vint(b,pos,True);size,m=vint(b,pos+n);return ident,size,pos+n+m,n,m
pos=0;info=None;seg=None
while pos<len(b):
 ident,size,payload,n,m=element(pos)
 if ident==0x18538067:
  seg=(pos,size,payload,n,m);pos=payload
  while pos<len(b):
   ident,size,payload,n,m=element(pos)
   if ident==0x1549a966:info=(pos,size,payload,n,m);break
   if size==(1<<(7*m))-1:break
   pos=payload+size
  break
 pos=payload+size
if not info:raise RuntimeError('WebM Info not found')
max_time=0;cursor=0
while True:
 cluster=b.find(bytes.fromhex('1f43b675'),cursor)
 if cluster<0:break
 try:
  ident,size,payload,n,m=element(cluster);cursor=payload;cluster_time=0
  while cursor<len(b):
   ident,size,body,n,m=element(cursor)
   if ident==0x1f43b675:break
   if size==(1<<(7*m))-1 or body+size>len(b):break
   if ident==0xe7:cluster_time=int.from_bytes(b[body:body+size],'big')
   if ident in (0xa3,0xa1):
    track,k=vint(b,body);relative=int.from_bytes(b[body+k:body+k+2],'big',signed=True);max_time=max(max_time,cluster_time+relative)
   if ident==0xa0:
    child=body
    while child<body+size:
     ci,cs,cp,cn,cm=element(child)
     if ci==0xa1:
      track,k=vint(b,cp);relative=int.from_bytes(b[cp+k:cp+k+2],'big',signed=True);max_time=max(max_time,cluster_time+relative)
     child=cp+cs
   cursor=body+size
 except (IndexError,ValueError):cursor=cluster+4
if max_time<5000:raise RuntimeError("Recording duration could not be determined")
start,size,payload,n,m=info
entry=bytes.fromhex('448988')+struct.pack('>d',max_time+1000/15)
new_size=size+len(entry)
if new_size>=(1<<(7*m))-1:raise RuntimeError('Info length must expand')
updated=bytearray(b[:payload+size]+entry+b[payload+size:]);updated[start+n:start+n+m]=((1<<(7*m))|new_size).to_bytes(m,'big')
ss,sz,sp,sn,sm=seg
if sz!=(1<<(7*sm))-1:updated[ss+sn:ss+sn+sm]=((1<<(7*sm))|sz+len(entry)).to_bytes(sm,'big')
out=p.with_name('cinematic-preview-timed.webm');out.write_bytes(updated);print('Duration:',round((max_time+1000/15)/1000,2),'seconds;',out)
