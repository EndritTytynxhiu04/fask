'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, CalendarDays, Flag, Menu, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Hero } from './hero';
import { FacebookFeed } from './facebook-feed';

export const FACEBOOK = 'https://www.facebook.com/FASKKOSOVA';
const navigation = [['/', 'Ballina'], ['/bordi/', 'Bordi'], ['/klubet/', 'Klubet'], ['/kalendari/', 'Kalendari'], ['/dokumentet/', 'Dokumentet'], ['/lajmet/', 'Lajmet']];

export function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return <>
    <a href="#permbajtja" className="skip-link">Kalo te përmbajtja</a>
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="brand" aria-label="FASK — Ballina">
          <img className="brand-logo" src="/images/fask-logo.jpg" alt="FASK — Federata e Auto Sporteve të Kosovës" width="174" height="66"/>
        </a>
        <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Navigimi kryesor">
          {navigation.map(([href, label]) => <a key={href} href={href} aria-current={active === label ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="header-calendar" href="/kalendari/" aria-label="Kalendari i garave 2026"><CalendarDays size={18}/><span>Sezoni 2026</span><ArrowUpRight size={17}/></a>
        <Button type="button" className="menu-button" variant="ghost" aria-label={menuOpen ? 'Mbyll menynë' : 'Hap menynë'} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X/> : <Menu/>}</Button>
      </div>
    </header>
    <main id="permbajtja">{children}</main>
    <footer>
      <div className="container footer-main">
        <div><a href="/" className="footer-brand" aria-label="FASK — Ballina"><img src="/images/fask-logo.jpg" alt="FASK" className="brand-logo" width="174" height="66"/></a><p>Federata e Auto Sportit e Kosovës</p><span className="muted">Pasioni ynë. Sporti ynë. Kosova jonë.</span></div>
        <div><h3>Federata</h3><a href="/bordi/">Bordi i federatës</a><a href="/klubet/">Klubet</a><a href="/lajmet/">Lajmet</a></div>
        <div><h3>Për garuesit</h3><a href="/kalendari/">Kalendari i garave</a><a href="/dokumentet/">Dokumentet</a></div>
        <div><h3>Na kontaktoni</h3><a href="mailto:info@fask-ks.org">info@fask-ks.org <ArrowUpRight size={14}/></a><span>Prishtinë, Kosovë</span><a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook <ArrowUpRight size={14}/></a></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} FASK. Të gjitha të drejtat e rezervuara.</span><span>AUTO SPORTI NA BASHKON.</span></div>
    </footer>
  </>;
}

export function PageHeading({section, title, text}: {section:string; title:string; text:string}) {
  return <div className="page-heading"><div className="container"><div className="eyebrow"><span/>{section}</div><h1>{title}<span className="yellow">.</span></h1><p>{text}</p></div></div>;
}

export function SectionHeading({eyebrow, title, href, label}: {eyebrow:string; title:string; href?:string; label?:string}) {
  return <div className="section-heading"><div><div className="eyebrow"><span/>{eyebrow}</div><h2>{title}</h2></div>{href && <a href={href} className="text-link">{label} <ArrowUpRight size={19}/></a>}</div>;
}

export function HomePage() {
  return <Shell active="Ballina">
    <Hero/>
    <div className="discipline-strip"><div className="container"><Flag size={21}/>{['GARA MALORE','AUTO SLLALLOM','DRAG RACE','KARTING','DRIFT','E-SPORT'].map(item => <span key={item}>{item}</span>)}</div></div>
    <section className="container section home-news" id="lajmet">
      <SectionHeading eyebrow="NGA FEDERATA" title="Lajmet e fundit." href="/lajmet/" label="Të gjitha lajmet"/>
      <div className="home-live-grid">
        <div className="home-editorial">
          <figure className="editorial-photo"><img src="/images/racing.jpg" alt="Garuesit dhe publiku në startin e Drag Race në Kosovë" loading="lazy"/><figcaption>Drag Race, Kosovë · Foto: Shpend Ahmeti / Autoportali</figcaption></figure>
          <div className="home-editorial-copy"><span className="eyebrow">NGA PISTA, TE JU</span><h3>Çdo garë ka<br/>historinë e vet.</h3><p>Njoftimet, rezultatet dhe momentet e fundit, drejtpërdrejt nga faqja e federatës në Facebook.</p><a href={FACEBOOK} target="_blank" rel="noreferrer" className="text-link">FASK Kosova në Facebook <ArrowUpRight size={19}/></a></div>
        </div>
        <FacebookFeed/>
      </div>
    </section>
    <section className="container home-tools" aria-label="Kalendari dhe dokumentet">
      <a href="/kalendari/" className="season-feature"><div><span className="eyebrow">KAMPIONATI I KOSOVËS</span><h2>Shihemi<br/>në pistë.</h2><span className="text-link">Kalendari 2026 <ArrowUpRight size={20}/></span></div><span className="season-watermark" aria-hidden="true">26</span></a>
      <a href="/dokumentet/" className="documents-feature"><FileText size={36} strokeWidth={1.3}/><span className="eyebrow">PËR GARUESIT DHE KLUBET</span><h3>Gjithçka që ju duhet.<br/>Në një vend.</h3><span className="text-link">Shkarko dokumentet <ArrowRight size={20}/></span></a>
    </section>
    <section className="federation-section"><div className="container federation-grid"><div><div className="eyebrow"><span/>NJË KOMUNITET. NJË QËLLIM.</div><h2>Më shumë<br/>se një garë.</h2></div><div><p>Klubet, garuesit dhe njerëzit që e çojnë përpara auto sportin e Kosovës. Njihuni me federatën dhe komunitetin tonë.</p><div className="federation-links"><a href="/bordi/">Bordi i federatës <ArrowUpRight/></a><a href="/klubet/">Klubet tona <ArrowUpRight/></a></div></div></div></section>
  </Shell>;
}
