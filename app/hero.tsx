'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import slides from '@/data/hero-slides.json';
import { SEASON } from './config';

export const SLIDE_DURATION = 7_000;

export function Hero(){
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setPaused(motion.matches);
    const syncVisibility = () => setPageHidden(document.hidden);
    syncMotion(); syncVisibility();
    motion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => { motion.removeEventListener('change', syncMotion); document.removeEventListener('visibilitychange', syncVisibility); };
  }, []);

  useEffect(() => {
    if (!api) return;
    const syncSlide = () => setActive(api.selectedScrollSnap());
    syncSlide(); api.on('select', syncSlide);
    return () => { api.off('select', syncSlide); };
  }, [api]);

  const running = Boolean(api) && !paused && !pageHidden && !focused;
  useEffect(() => {
    if (!api || !running) return;
    const timer = window.setTimeout(() => api.scrollNext(), SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [api, active, running]);

  return <Carousel className="hero hero-modern" opts={{loop:true, duration:35}} setApi={setApi} aria-label="Fotografitë e auto sportit të Kosovës">
    <CarouselContent className="hero-slides">{slides.map((slide,index) => <CarouselItem className={index===active?'hero-slide is-active':'hero-slide'} key={slide.image}><img src={slide.image} alt={slide.alt} className="hero-photo" style={{objectPosition:slide.position}} fetchPriority={index===0?'high':'auto'} loading={index===0?'eager':'lazy'}/></CarouselItem>)}</CarouselContent>
    <div className="hero-shade"/>
    <div className="container hero-content">
      <div className="eyebrow"><span/>FEDERATA E AUTO SPORTIT E KOSOVËS</div>
      <h1>SHPEJTËSI.<br/>PRECIZION.<br/><span>PASION.</span></h1>
      <p>Bashkë në çdo kthesë.<br/>Drejt çdo fitoreje.</p>
      <div className="hero-actions"><a href="/kalendari/" className="button yellow-button">Zbulo sezonin {SEASON} <ArrowUpRight size={21}/></a><a href="#lajmet" className="button hero-secondary">Lajmet e fundit <ArrowRight size={20}/></a></div>
    </div>
    <div className="hero-progress" aria-hidden="true"><span key={active} className={running?'running':''} style={{animationDuration:SLIDE_DURATION+'ms'}}/></div>
    <div className="container hero-bottom-modern">
      <div className="slide-caption"><span>{slides[active].label}</span><strong>{slides[active].caption}</strong></div>
      <div className="hero-controls" onFocusCapture={event=>{if(event.target.matches(':focus-visible'))setFocused(true)}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}>
        <span className="slide-count" aria-live="off"><b>{String(active+1).padStart(2,'0')}</b> / {String(slides.length).padStart(2,'0')}</span>
        <Button type="button" className="slider-button" variant="ghost" onClick={()=>api?.scrollPrev()} aria-label="Fotografia e mëparshme"><ChevronLeft size={21}/></Button>
        <Button type="button" className="slider-button" variant="ghost" onClick={()=>api?.scrollNext()} aria-label="Fotografia tjetër"><ChevronRight size={21}/></Button>
        <Button type="button" className="slider-button" variant="ghost" onClick={()=>{setPaused(value=>!value);setFocused(false)}} aria-label={paused?'Vazhdo ndërrimin automatik':'Ndalo ndërrimin automatik'} aria-pressed={paused}>{paused?<Play size={17}/>:<Pause size={17}/>}</Button>
      </div>
    </div>
  </Carousel>;
}
