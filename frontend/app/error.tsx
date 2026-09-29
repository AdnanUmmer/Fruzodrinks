'use client';
export default function ErrorPage({reset}: {reset:()=>void}) {
  return <main id="main" className="error-page"><span className="eyebrow">A LITTLE PAUSE</span><h1>Back in a sip.</h1><p>Our flavour catalogue is temporarily unavailable. Please try again in a moment.</p><button className="pill-button" onClick={reset}>Try again</button></main>;
}
