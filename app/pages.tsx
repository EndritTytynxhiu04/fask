'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, MapPin, Flag, FileText, Download, CalendarDays, Users, Check, Trophy, Mail, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { FacebookFeed } from './facebook-feed';
import { Shell, PageHeading, SectionHeading } from './site';
import { ResultsDialog } from './results';
import { FACEBOOK, SEASON, events, useToday, dayRange, monthName, dateLabel, daysUntil, type RaceEvent } from './config';
import clubsData from '@/data/clubs.json';
import boardData from '@/data/board.json';
import calendarData from '@/data/calendar.json';
import documentData from '@/data/documents.generated.json';

function DemoNotice(){ return <div className="notice"><span className="notice-label">PËRMBAJTJE DEMONSTRUESE</span><p>Emrat dhe të dhënat më poshtë janë shembuj. Lista zyrtare do të publikohet së shpejti.</p></div>; }
const pad = (n: number) => String(n).padStart(2, '0');
// mailto: does nothing when the visitor has no default mail app, so offer webmail and copy as well.
function ContactLink({email, name}: {email?: string; name: string}){
 const [open, setOpen] = useState(false);
 const [copied, setCopied] = useState(false);
 if (!email) return null;
 const to = encodeURIComponent(email);
 const copy = () => navigator.clipboard.writeText(email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }, () => {});
 return <>
  <button type="button" className="contact-link" title={'Dërgo email te '+name} aria-label={'Dërgo email te '+name+' ('+email+')'} onClick={() => setOpen(true)}><Mail size={15}/>{email}</button>
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogContent className="email-dialog">
    <span className="role">DËRGO EMAIL</span>
    <DialogTitle className="email-dialog-title">{name}</DialogTitle>
    <DialogDescription className="email-dialog-address">{email}</DialogDescription>
    <div className="email-options">
     <a href={'https://mail.google.com/mail/?view=cm&fs=1&to='+to} target="_blank" rel="noreferrer">Gmail <ArrowUpRight size={17}/></a>
     <a href={'https://outlook.live.com/mail/0/deeplink/compose?to='+to} target="_blank" rel="noreferrer">Outlook <ArrowUpRight size={17}/></a>
     <a href={'mailto:'+email}>Aplikacioni i emailit <Mail size={17}/></a>
     <button type="button" onClick={copy}>{copied ? 'U kopjua' : 'Kopjo adresën'} {copied ? <Check size={17}/> : <Copy size={17}/>}</button>
    </div>
   </DialogContent>
  </Dialog>
 </>;
}

export function BoardPage(){
 const [president, ...members] = boardData.members;
 return <Shell active="Bordi"><PageHeading section="FEDERATA" title="Bordi i federatës" text="Njerëzit që udhëheqin dhe mbështesin zhvillimin e auto sportit në Kosovë."/>
  <section className="container section">{boardData.isDemo && <DemoNotice/>}
   <div className="board-intro">
    <div><div className="eyebrow"><span/> UDHËHEQJA</div><h2>Bashkë, për sportin tonë.</h2><p>Njihuni me kryetarin, nënkryetarët dhe anëtarët e bordit të federatës.</p></div>
    <dl className="board-stats"><div><dt>Mandati</dt><dd>{boardData.term}</dd></div><div><dt>Anëtarë</dt><dd>{pad(boardData.members.length)}</dd></div></dl>
   </div>
   {president && <article className="member-card president"><span className="member-number">01</span><span className="role">{president.role}</span><h3>{president.name}</h3>{president.bio && <p>{president.bio}</p>}<ContactLink email={president.contact} name={president.name}/></article>}
   <div className="board-grid">{members.map((person,i)=><article className="member-card" key={person.id}><span className="member-number">{pad(i+2)}</span><span className="role">{person.role}</span><h3>{person.name}</h3>{person.bio && <p>{person.bio}</p>}<ContactLink email={person.contact} name={person.name}/></article>)}</div>
  </section></Shell>;
}

export function ClubsPage(){
 const cities = new Set(clubsData.clubs.map(club => club.city)).size;
 return <Shell active="Klubet"><PageHeading section="KOMUNITETI YNË" title="Klubet e federatës" text="Nga çdo qytet, me të njëjtin pasion. Klubet që bëhen pjesë e auto sportit të Kosovës."/>
  <section className="container section">{clubsData.isDemo && <DemoNotice/>}
   <SectionHeading eyebrow={`${pad(clubsData.clubs.length)} KLUBE · ${pad(cities)} QYTETE`} title="Një sport që na bashkon."/>
   <div className="clubs-grid">{clubsData.clubs.map((club,i)=><article className="club-card" key={club.id}>
    <div className="club-card-top">{club.logo?<img className="club-logo" src={club.logo} alt={'Logo e '+club.name} loading="lazy"/>:<span className="club-placeholder"><Flag size={29} strokeWidth={1.5}/></span>}<span className="club-index">{pad(i+1)}</span></div>
    <h3>{club.name}</h3><div className="location"><MapPin size={15}/>{club.city}</div>
    {club.description && <p>{club.description}</p>}
    <div className="chips">{club.disciplines.map(d=><span key={d}>{d}</span>)}</div>
    <ContactLink email={club.contact} name={club.name}/>
    {club.website&&<a href={club.website} className="text-link" target="_blank" rel="noreferrer">Faqja e klubit <ArrowUpRight size={18}/></a>}
   </article>)}</div>
   {clubsData.clubs.length===0&&<p className="empty-state">Lista e klubeve do të publikohet së shpejti.</p>}
  </section></Shell>;
}

function EventRow({event, status, onResults}: {event: RaceEvent; status?: 'past' | 'next'; onResults?: (event: RaceEvent) => void}) {
 const hasResults = status === 'past' && Boolean(event.results) && Boolean(onResults);
 return <article className={'event-row' + (status ? ' is-' + status : '') + (hasResults ? ' has-results' : '')}>
  <div className="event-date"><strong>{dayRange(event)}</strong><span>{monthName(event.startDate)}</span></div>
  <div className="event-main"><span className="role">{event.discipline}</span><h3>{event.name}</h3>
   <div className="event-meta"><span className="location"><MapPin size={15}/>{event.location}</span>{event.organizer && <span className="location"><Users size={15}/>{event.organizer}</span>}</div>
  </div>
  {hasResults && <button type="button" className="event-badge results" onClick={() => onResults!(event)} aria-label={'Shiko rezultatet: ' + event.name}><Trophy size={14}/> Rezultatet</button>}
  {status === 'past' && !hasResults && <span className="event-badge"><Check size={14}/> Përfunduar</span>}
  {status === 'next' && <span className="event-badge next">E radhës</span>}
 </article>;
}

export function CalendarPage(){
 const today = useToday();
 const next = today ? events.find(event => event.endDate >= today) : undefined;
 const done = today ? events.filter(event => event.endDate < today).length : 0;
 const byMonth = events.reduce<Record<string, RaceEvent[]>>((groups, event) => { (groups[event.startDate.slice(0, 7)] ??= []).push(event); return groups; }, {});
 const daysLeft = next && today ? daysUntil(next.startDate, today) : 0;
 const [shown, setShown] = useState<RaceEvent | null>(null);
 const [resultsOpen, setResultsOpen] = useState(false);
 const showResults = (event: RaceEvent) => { setShown(event); setResultsOpen(true); history.replaceState(null, '', '#rezultatet-' + event.id); };
 const closeResults = (open: boolean) => { setResultsOpen(open); if (!open) history.replaceState(null, '', location.pathname + location.search); };
 // A shared link such as /kalendari/#rezultatet-kulla opens that race's results directly.
 useEffect(() => {
  const id = location.hash.startsWith('#rezultatet-') ? decodeURIComponent(location.hash.slice(12)) : '';
  const event = events.find(item => item.id === id && item.results);
  if (event) { setShown(event); setResultsOpen(true); }
 }, []);
 return <Shell active="Kalendari"><PageHeading section={'KAMPIONATI I KOSOVËS / '+SEASON} title={'Kalendari '+SEASON} text="Një sezon plot adrenalinë. Datat, disiplinat dhe vendet e garave."/>
  <section className="container section">
   <div className="calendar-toolbar"><div className="eyebrow"><span/>{calendarData.isComplete?'KALENDARI I GARAVE':'GARA TË KONFIRMUARA'}</div>
    <div className="calendar-links"><a href={calendarData.poster} className="text-link" target="_blank" rel="noreferrer">Posteri zyrtar <ArrowUpRight size={17}/></a><a href="/dokumentet/" className="text-link"><Download size={17}/> Dokumentet e garave</a></div></div>
   {next && <div className="next-race">
    <div><span className="eyebrow"><span/>GARA E RADHËS</span><h2>{next.name}</h2>
     <div className="event-meta"><span className="location"><CalendarDays size={16}/>{dateLabel(next)} {next.startDate.slice(0,4)}</span><span className="location"><MapPin size={16}/>{next.location}</span>{next.organizer && <span className="location"><Users size={16}/>{next.organizer}</span>}</div></div>
    <div className="next-race-count"><strong>{Math.max(0, daysLeft)}</strong><span>{daysLeft <= 0 ? 'Sot në pistë' : 'ditë deri në start'}</span></div>
   </div>}
   {today && events.length > 0 && <div className="season-progress"><div aria-hidden="true"><span style={{width: `${done / events.length * 100}%`}}/></div><p><b>{done}</b> / {events.length} gara të përfunduara</p></div>}
   {calendarData.note&&<div className="notice"><CalendarDays size={22}/><p>{calendarData.note}</p></div>}
   {Object.entries(byMonth).map(([month, list]) => <section className="event-month" key={month} aria-label={monthName(month + '-01')}>
    <h2 className="event-month-title">{monthName(month + '-01')} <span>{list.length} {list.length === 1 ? 'garë' : 'gara'}</span></h2>
    <div className="event-list">{list.map(event => <EventRow key={event.id} event={event} status={event === next ? 'next' : today && event.endDate < today ? 'past' : undefined} onResults={showResults}/>)}</div>
   </section>)}
   {!events.length&&<div className="empty-state">Kalendari i këtij viti do të publikohet së shpejti.</div>}
   <ResultsDialog event={shown} open={resultsOpen} onOpenChange={closeResults}/>
   <div className="calendar-bottom"><p>Ndiqni njoftimet e federatës për çdo ndryshim të datave.</p><a className="text-link" href={calendarData.sourceUrl} target="_blank" rel="noreferrer">Njoftimi zyrtar në Facebook <ArrowUpRight size={18}/></a></div>
  </section></Shell>;
}

type DocumentEntry={file:string;title:string;category:string;sourceUrl:string;url:string;size:number};
const documents = documentData as DocumentEntry[];
const CATEGORY_ORDER = ['Statuti dhe organet', 'Rregulloret e garave', 'Klubet dhe garuesit', 'Planet dhe raportet'];
const categoryRank = (category:string) => { const index = CATEGORY_ORDER.indexOf(category); return index < 0 ? CATEGORY_ORDER.length : index; };
const documentGroups = [...new Set(documents.map(d => d.category))].sort((a,b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b, 'sq')).map(category => ({category, items: documents.filter(d => d.category === category)}));
function fileSize(bytes:number){return bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.max(1,Math.ceil(bytes/1024))+' KB'}
const normalize = (text:string) => text.toLocaleLowerCase('sq').normalize('NFD').replace(/[̀-ͯ]/g, '');
export function DocumentsPage(){
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('');
 const q=normalize(query.trim());
 const groups=documentGroups.filter(g=>!category||g.category===category).map(g=>({...g,items:g.items.filter(d=>!q||normalize(d.title).includes(q))})).filter(g=>g.items.length);
 return <Shell active="Dokumentet"><PageHeading section="BIBLIOTEKA E FEDERATËS" title="Dokumentet" text="Statuti, rregulloret, planet dhe raportet e publikuara të federatës, në një vend."/><section className="container section documents-layout"><div className="document-panel"><div className="document-toolbar"><label className="sr-only" htmlFor="document-search">Kërko dokumentin</label><input id="document-search" className="document-search" type="search" placeholder="Kërko dokumentin…" value={query} onChange={e=>setQuery(e.target.value)} disabled={!documents.length}/><label className="sr-only" htmlFor="document-category">Kategoria</label><NativeSelect id="document-category" className="document-select" value={category} onChange={e=>setCategory(e.target.value)} disabled={!documents.length}><NativeSelectOption value="">Të gjitha kategoritë</NativeSelectOption>{documentGroups.map(g=><NativeSelectOption key={g.category} value={g.category}>{g.category} ({g.items.length})</NativeSelectOption>)}</NativeSelect></div>
  {groups.map(group=><div className="document-group" key={group.category}><h2 className="document-group-title">{group.category}<span>{pad(group.items.length)}</span></h2><ul className="document-list">{group.items.map(d=><li key={d.file} className="document-item"><span className="document-item-icon"><FileText size={20}/></span><div className="document-item-main"><a className="document-item-title" href={d.url} target="_blank" rel="noreferrer">{d.title}</a><span className="file-meta">PDF · {fileSize(d.size)}{d.sourceUrl&&<> · <a className="source-link" href={d.sourceUrl} target="_blank" rel="noreferrer">Burimi ↗</a></>}</span></div><div className="document-item-actions"><a className="text-link" href={d.url} target="_blank" rel="noreferrer" aria-label={'Hap: '+d.title}>Hap <ArrowUpRight size={16}/></a><a className="document-download" href={d.url} download={d.file.split('/').at(-1)} aria-label={'Shkarko: '+d.title} title="Shkarko PDF"><Download size={17}/></a></div></li>)}</ul></div>)}
  {!groups.length&&<p className="empty-state">{documents.length?'Asnjë dokument nuk përputhet me kërkimin.':'Dokumentet do të publikohen së shpejti.'}</p>}
 </div><aside className="documents-aside"><span className="eyebrow">NË DISPOZICION</span><strong>{String(documents.length).padStart(2,'0')}</strong><span>dokumente PDF</span><div className="aside-divider"/><h3>Përgatituni për garën.</h3><p>Kontrolloni rregulloren përkatëse dhe njoftimet e fundit para çdo pjesëmarrjeje.</p><a href="/kalendari/" className="text-link">Shih kalendarin <ArrowUpRight size={18}/></a></aside></section></Shell>
}

export function NewsPage(){return <Shell active="Lajmet"><PageHeading section="NJOFTIME · REZULTATE · AKTIVITETE" title="Lajmet e federatës" text="Qëndroni pranë garës. Publikimet nga faqja e FASK-ut në Facebook."/><section className="container section news-layout"><div className="news-intro"><div className="eyebrow"><span/> NGA FAQJA E FASK-UT</div><h2>Çdo garë.<br/>Çdo moment.</h2><p>Njoftimet e reja të federatës shfaqen këtu përmes faqes sonë në Facebook.</p><a className="button yellow-button" href={FACEBOOK} target="_blank" rel="noreferrer">Na ndiqni <ArrowUpRight size={19}/></a><figure><img src="/images/racing.jpg" alt="Starti i garës Drag Race në Kosovë" loading="lazy"/><figcaption>Foto: Shpend Ahmeti / <a href="https://autoportali.com/drag-race-2-tubon-garuesit-tane-dhe-ata-te-rajonit/" target="_blank" rel="noreferrer">Autoportali</a></figcaption></figure><a href="/kalendari/" className="news-calendar"><CalendarDays size={25}/><div><span>SEZONI {SEASON}</span><h3>Shihemi në pistë.</h3></div><ArrowUpRight size={23}/></a></div><FacebookFeed/></section></Shell>}
