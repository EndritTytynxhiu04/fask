'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE = 'https://www.facebook.com/FASKKOSOVA';
export const FEED_REFRESH_INTERVAL = 5 * 60 * 1000;

function FacebookFrame({width}: {width:number}) {
  const loadTimer = useRef<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    loadTimer.current = window.setTimeout(() => {setLoading(false); setTimedOut(true)}, 15_000);
    return () => window.clearTimeout(loadTimer.current);
  }, []);
  const source = 'https://www.facebook.com/plugins/page.php?' + new URLSearchParams({href:PAGE,tabs:'timeline',width:String(width),height:'700',small_header:'false',adapt_container_width:'true',hide_cover:'false',show_facepile:'false'}).toString();
  return <>
    {loading && <output className="feed-status" style={{display:'block'}}>Duke ngarkuar publikimet…</output>}
    <iframe title="Lajmet e fundit të FASK Kosova nga Facebook" src={source} width={width} height="700" loading="eager" style={{border:0,width:'100%',maxWidth:500,display:'block'}} onLoad={()=>{window.clearTimeout(loadTimer.current);setLoading(false);setTimedOut(false)}} allow="encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin"/>
    {timedOut && <output className="feed-status" style={{display:'block'}}>Publikimet po vonohen. Provoni ringarkimin ose hapni faqen në Facebook.</output>}
  </>;
}

export function FacebookFeed(){
  const ref = useRef<HTMLDivElement>(null);
  // Include the live iframe in static HTML, without waiting for hydration.
  const [width, setWidth] = useState(500);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => setWidth(Math.max(180, Math.min(500, Math.round(entries[0].contentRect.width)))));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => { if (!document.hidden) setRevision(value => value + 1) }, FEED_REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="feed-card">
    <div className="feed-top"><img src="/images/fask-logo.jpg" alt="" width="44" height="44"/><div><strong>FASK Kosova</strong><span>Publikimet nga Facebook</span></div><Button type="button" className="reload-button" variant="ghost" onClick={()=>setRevision(value=>value+1)} aria-label="Ringarko lajmet"><RefreshCw size={18}/></Button></div>
    <div className="feed-frame" ref={ref}><FacebookFrame key={`${width}-${revision}`} width={width}/></div>
    <div className="feed-fallback"><a href={PAGE} target="_blank" rel="noreferrer" className="text-link">Shih të gjitha publikimet <ArrowUpRight size={18}/></a><p className="feed-help">Nëse Facebook nuk shfaq postimet këtu, hapni faqen e FASK-ut. Facebook mund të kërkojë identifikim ose leje për cookies.</p></div>
  </div>;
}
