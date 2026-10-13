'use client';
export default function GlobalError({reset}:{reset:()=>void}) {return <html lang="en"><body style={{margin:0,padding:'12%',background:'#fffbed',color:'#173b26',fontFamily:'Arial,sans-serif'}}><main><h1>We’ll be back shortly.</h1><p>Fruzo is temporarily unavailable. Please try again.</p><button onClick={reset}>Try again</button></main></body></html>;}
