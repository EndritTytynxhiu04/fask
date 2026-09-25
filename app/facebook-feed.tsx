'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FACEBOOK } from './config';

// Facebook renders the timeline at a fixed width, so snap to a few sizes instead of reloading on every resize.
const WIDTHS = [500, 440, 380, 320, 260];
function feedWidth(available: number) { return WIDTHS.find(width => width <= available) ?? 180; }

function FacebookFrame({width}: {width:number}) {
  const loadTimer = useRef<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    loadTimer.current = window.setTimeout(() => {setLoading(false); setTimedOut(true)}, 15_000);
    return () => window.clearTimeout(loadTimer.current);
  }, []);
  const source = 'https://www.facebook.com/plugins/page.php?' + new URLSearchParams({href:FACEBOOK,tabs:'timeline',width:String(width),height:'700',small_header:'false',adapt_container_width:'true',hide_cover:'false',show_facepile:'false'}).toString();
  return <>
    {loading && <output className="feed-status">Duke ngarkuar publikimet…</output>}
    <iframe title="Lajmet e fundit të FASK Kosova nga Facebook" src={source} width={width} height="700" loading="lazy" style={{border:0,width:'100%',maxWidth:500,display:'block',marginInline:'auto'}} onLoad={()=>{window.clearTimeout(loadTimer.current);setLoading(false);setTimedOut(false)}} allow="encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin"/>
    {timedOut && <output className="feed-status">Publikimet po vonohen. Provoni ringarkimin ose hapni faqen në Facebook.</output>}
  </>;
}

export function FacebookFeed(){
  const ref = useRef<HTMLDivElement>(null);
  // Include the live iframe in static HTML, without waiting for hydration.
  const [width, setWidth] = useState(500);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => setWidth(feedWidth(entries[0].contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div className="feed-card">
    <div className="feed-top"><img src="/images/fask-logo.jpg" alt="" width="44" height="44"/><div><strong>FASK Kosova</strong><span>Publikimet nga Facebook</span></div><Button type="button" className="reload-button" variant="ghost" onClick={()=>setRevision(value=>value+1)} aria-label="Ringarko lajmet"><RefreshCw size={18}/></Button></div>
    <div className="feed-frame" ref={ref}><FacebookFrame key={`${width}-${revision}`} width={width}/></div>
    <div className="feed-fallback"><a href={FACEBOOK} target="_blank" rel="noreferrer" className="text-link">Shih të gjitha publikimet <ArrowUpRight size={18}/></a><p className="feed-help">Nëse Facebook nuk shfaq postimet këtu, hapni faqen e FASK-ut. Facebook mund të kërkojë identifikim ose leje për cookies.</p></div>
  </div>;
}
