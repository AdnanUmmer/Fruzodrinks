export function Chevron({direction='right'}:{direction?:'left'|'right'|'down'}) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{transform:direction==='left'?'rotate(180deg)':direction==='down'?'rotate(90deg)':undefined}}><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
