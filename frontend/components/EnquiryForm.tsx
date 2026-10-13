'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
type Errors=Record<string,string[]>;
export function EnquiryForm({products,selectedProduct}:{products:{slug:string;name:string}[];selectedProduct?:string}) {
  const [busy,setBusy]=useState(false), [success,setSuccess]=useState(false), [errors,setErrors]=useState<Errors>({});
  const feedback=useRef<HTMLDivElement>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(busy)return;
    const data=Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);setErrors({});
    try {
      const response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,product:data.product||null}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok) setErrors(result.errors || {form:[result.detail || 'We could not send your enquiry. Please try again.']});
      else setSuccess(true);
    } catch {setErrors({form:['We could not confirm delivery. Please contact us directly before submitting again.']});}
    finally {setBusy(false);requestAnimationFrame(()=>feedback.current?.focus());}
  }
  function field(name:string,label:string,type='text',required=false,maxLength=160,autoComplete='off') {
    return <div className="form-field"><label htmlFor={name}>{label}{required?' *':' (optional)'}</label><input id={name} name={name} type={type} required={required} maxLength={maxLength} autoComplete={autoComplete} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`${name}-error`:undefined}/>{errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name].join(' ')}</p>}</div>;
  }
  return <div><div ref={feedback} tabIndex={-1} aria-live="polite" className="form-feedback">{success?<div className="success-panel"><h2>Enquiry received.</h2><p>Thank you for getting in touch. Your message is saved for the Fruzo team.</p></div>:Object.keys(errors).length>0?<div role="alert"><p>Please check your enquiry.</p><ul>{Object.entries(errors).map(([key,value])=><li key={key}>{key==='form'?value.join(' '):<a href={`#${key}`}>{key}: {value.join(' ')}</a>}</li>)}</ul></div>:null}</div>
  {!success && <form className="enquiry-form" onSubmit={submit} aria-busy={busy}><p>Fields marked * are required.</p><div className="form-grid">{field('name','Name','text',true,100,'name')}{field('company','Company','text',false,160,'organization')}{field('email','Email','email',true,254,'email')}{field('phone','Phone','tel',false,40,'tel')}</div>{field('subject','Subject','text',true)}<div className="form-grid"><div className="form-field"><label htmlFor="enquiry_type">Enquiry type *</label><select id="enquiry_type" name="enquiry_type" defaultValue={selectedProduct?'product':'general'}><option value="general">General enquiry</option><option value="distribution">Distribution</option><option value="product">Product information</option></select></div><div className="form-field"><label htmlFor="product">Product (optional)</label><select id="product" name="product" defaultValue={products.some(p=>p.slug===selectedProduct)?selectedProduct:''}><option value="">Any product</option>{products.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></div></div><div className="form-field"><label htmlFor="message">Message *</label><textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} aria-invalid={!!errors.message} aria-describedby={errors.message?'message-error':undefined}/>{errors.message && <p className="field-error" id="message-error">{errors.message.join(' ')}</p>}</div><div className="honey-field" aria-hidden="true"><label htmlFor="website">Leave this empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div><p className="privacy-caption">We use these details to handle your enquiry. <Link href="/privacy">Read our privacy notice</Link>. Please do not include sensitive personal information.</p><button className="pill-button" disabled={busy} type="submit">{busy?'Sending…':'Send enquiry ↗'}</button><noscript><p>This form requires JavaScript. Please use the email address on this page to contact us.</p></noscript></form>}</div>;
}
