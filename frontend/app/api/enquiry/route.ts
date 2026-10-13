import { SITE_ORIGIN } from '@/lib/api';
export async function POST(request:Request) {
  if(request.headers.get('origin')!==SITE_ORIGIN) return Response.json({detail:'Please submit from this website.'},{status:403});
  if(!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({detail:'Invalid submission.'},{status:415});
  const token=process.env.ENQUIRY_PROXY_TOKEN;
  if(!token) return Response.json({detail:'The form is temporarily unavailable. Please contact us by email.'},{status:503});
  try {
    // Bound the stream even when Content-Length is absent or dishonest.
    const reader=request.body?.getReader();
    if(!reader) return Response.json({detail:'An enquiry is required.'},{status:400});
    let length=0; const chunks:Uint8Array[]=[];
    while(true) {const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>24000){await reader.cancel();return Response.json({detail:'Your enquiry is too long.'},{status:413});}chunks.push(value);}
    let data:unknown;try {data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return Response.json({detail:'Invalid submission.'},{status:400});}
    const response=await fetch(`${process.env.API_ORIGIN || 'http://127.0.0.1:8017'}/api/enquiries/`,{method:'POST',headers:{'Content-Type':'application/json','X-Enquiry-Token':token,...(process.env.DEPLOYMENT_ENV==='production'?{'X-Forwarded-Proto':'https'}:{}),...(process.env.TRUST_PROXY_CLIENT_IP==='1'?{'X-Real-IP':request.headers.get('x-real-ip') || 'unknown'}:{})},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(12000)});
    if(response.status===201) return Response.json({detail:'Enquiry received.'},{status:201});
    if(response.status===400) return Response.json({errors:await response.json()},{status:400});
    if(response.status===429) return Response.json({detail:'Too many enquiries. Please try again in an hour.'},{status:429,headers:{'Retry-After':'3600'}});
    return Response.json({detail:'The form is temporarily unavailable. Please contact us by email.'},{status:503});
  } catch {return Response.json({detail:'Delivery could not be confirmed. Please contact us directly before submitting again.'},{status:503});}
}
