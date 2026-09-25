'use client';
import { useState } from 'react';
import { ArrowUpRight, MapPin, Flag, FileText, Download, CalendarDays, Users, Check } from 'lucide-react';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select';
import { FacebookFeed } from './facebook-feed';
import { Shell, PageHeading, SectionHeading } from './site';
import { FACEBOOK, SEASON, events, useToday, dayRange, monthName, dateLabel, daysUntil, type RaceEvent } from './config';
import clubsData from '@/data/clubs.json';
import boardData from '@/data/board.json';
import calendarData from '@/data/calendar.json';
import documentData from '@/data/documents.generated.json';

function DemoNotice(){ return <div className="notice"><span className="notice-label">PËRMBAJTJE DEMONSTRUESE</span><p>Emrat dhe të dhënat më poshtë janë shembuj. Lista zyrtare do të publikohet së shpejti.</p></div>; }
const pad = (n: number) => String(n).padStart(2, '0');

export function BoardPage(){
 const [president, ...members] = boardData.members;
 return <Shell active="Bordi"><PageHeading section="FEDERATA" title="Bordi i federatës" text="Njerëzit që udhëheqin dhe mbështesin zhvillimin e auto sportit në Kosovë."/>
  <section className="container section">{boardData.isDemo && <DemoNotice/>}
   <div className="board-intro">
    <div><div className="eyebrow"><span/> UDHËHEQJA</div><h2>Bashkë, për sportin tonë.</h2><p>Njihuni me kryetarin, nënkryetarët dhe anëtarët e bordit të federatës.</p></div>
    <dl className="board-stats"><div><dt>Mandati</dt><dd>{boardData.term}</dd></div><div><dt>Anëtarë</dt><dd>{pad(boardData.members.length)}</dd></div></dl>
   </div>
   {president && <article className="member-card president"><span className="member-number">01</span><span className="role">{president.role}</span><h3>{president.name}</h3>{president.bio && <p>{president.bio}</p>}</article>}
   <div className="board-grid">{members.map((person,i)=><article className="member-card" key={person.id}><span className="member-number">{pad(i+2)}</span><span className="role">{person.role}</span><h3>{person.name}</h3>{person.bio && <p>{person.bio}</p>}</article>)}</div>
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
    {club.website&&<a href={club.website} className="text-link" target="_blank" rel="noreferrer">Faqja e klubit <ArrowUpRight size={18}/></a>}
   </article>)}</div>
   {clubsData.clubs.length===0&&<p className="empty-state">Lista e klubeve do të publikohet së shpejti.</p>}
  </section></Shell>;
}

function EventRow({event, status}: {event: RaceEvent; status?: 'past' | 'next'}) {
 return <article className={'event-row' + (status ? ' is-' + status : '')}>
  <div className="event-date"><strong>{dayRange(event)}</strong><span>{monthName(event.startDate)}</span></div>
  <div className="event-main"><span className="role">{event.discipline}</span><h3>{event.name}</h3>
   <div className="event-meta"><span className="location"><MapPin size={15}/>{event.location}</span>{event.organizer && <span className="location"><Users size={15}/>{event.organizer}</span>}</div>
  </div>
  {status === 'past' && <span className="event-badge"><Check size={14}/> Përfunduar</span>}
  {status === 'next' && <span className="event-badge next">E radhës</span>}
 </article>;
}

export function CalendarPage(){
 const today = useToday();
 const next = today ? events.find(event => event.endDate >= today) : undefined;
 const done = today ? events.filter(event => event.endDate < today).length : 0;
 const byMonth = events.reduce<Record<string, RaceEvent[]>>((groups, event) => { (groups[event.startDate.slice(0, 7)] ??= []).push(event); return groups; }, {});
 const daysLeft = next && today ? daysUntil(next.startDate, today) : 0;
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
    <div className="event-list">{list.map(event => <EventRow key={event.id} event={event} status={event === next ? 'next' : today && event.endDate < today ? 'past' : undefined}/>)}</div>
   </section>)}
   {!events.length&&<div className="empty-state">Kalendari i këtij viti do të publikohet së shpejti.</div>}
   <div className="calendar-bottom"><p>Ndiqni njoftimet e federatës për çdo ndryshim të datave.</p><a className="text-link" href={calendarData.sourceUrl} target="_blank" rel="noreferrer">Njoftimi zyrtar në Facebook <ArrowUpRight size={18}/></a></div>
  </section></Shell>;
}

type DocumentEntry={file:string;title:string;category:string;sourceUrl:string;url:string;size:number};
const documents = documentData as DocumentEntry[];
const CATEGORY_ORDER = ['Statuti dhe organet', 'Rregulloret e garave', 'Klubet dhe garuesit'];
const categoryRank = (category:string) => { const index = CATEGORY_ORDER.indexOf(category); return index < 0 ? CATEGORY_ORDER.length : index; };
const documentGroups = [...new Set(documents.map(d => d.category))].sort((a,b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b, 'sq')).map(category => ({category, items: documents.filter(d => d.category === category)}));
function fileSize(bytes:number){return bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.max(1,Math.ceil(bytes/1024))+' KB'}
export function DocumentsPage(){
 const [selected,setSelected]=useState(documentGroups[0]?.items[0]?.file ?? '');
 const doc=documents.find(d=>d.file===selected);
 return <Shell active="Dokumentet"><PageHeading section="BIBLIOTEKA E FEDERATËS" title="Dokumentet" text="Rregulloret, kalendari dhe dokumentet e publikuara të federatës, në një vend."/><section className="container section documents-layout"><div className="document-panel"><div className="document-icon"><FileText size={34}/></div><h2>Zgjidhni dokumentin.</h2><p className="muted">Përzgjidhni një dokument nga lista për ta hapur ose shkarkuar në formatin PDF.</p><label htmlFor="document-select">Dokumenti</label><NativeSelect id="document-select" className="document-select" value={selected} onChange={e=>setSelected(e.target.value)} disabled={!documents.length}><NativeSelectOption value="">{documents.length?'Zgjidhni një dokument…':'Nuk ka dokumente të publikuara'}</NativeSelectOption>{documentGroups.map(group=><NativeSelectOptGroup key={group.category} label={group.category}>{group.items.map(d=><NativeSelectOption key={d.file} value={d.file}>{d.title}</NativeSelectOption>)}</NativeSelectOptGroup>)}</NativeSelect><div className="document-selection" aria-live="polite">{doc?<><span className="role">{doc.category}</span><h3>{doc.title}</h3><span className="file-meta">PDF · {fileSize(doc.size)}</span><div className="document-actions"><a className="button yellow-button" href={doc.url} download={doc.file.split('/').at(-1)}>Shkarko PDF <Download size={18}/></a><a className="text-link" href={doc.url} target="_blank" rel="noreferrer">Hap dokumentin <ArrowUpRight size={18}/></a></div>{doc.sourceUrl&&<a className="source-link" href={doc.sourceUrl} target="_blank" rel="noreferrer">Burimi i dokumentit ↗</a>}</>:<div className="selection-hint"><Download size={20}/><span>{documents.length?'Dokumenti i zgjedhur do të shfaqet këtu.':'Dokumentet do të publikohen së shpejti.'}</span></div>}</div></div><aside className="documents-aside"><span className="eyebrow">NË DISPOZICION</span><strong>{String(documents.length).padStart(2,'0')}</strong><span>dokumente PDF</span><div className="aside-divider"/><h3>Përgatituni për garën.</h3><p>Kontrolloni rregulloren përkatëse dhe njoftimet e fundit para çdo pjesëmarrjeje.</p><a href="/kalendari/" className="text-link">Shih kalendarin <ArrowUpRight size={18}/></a></aside></section></Shell>
}

export function NewsPage(){return <Shell active="Lajmet"><PageHeading section="NJOFTIME · REZULTATE · AKTIVITETE" title="Lajmet e federatës" text="Qëndroni pranë garës. Publikimet nga faqja e FASK-ut në Facebook."/><section className="container section news-layout"><div className="news-intro"><div className="eyebrow"><span/> NGA FAQJA E FASK-UT</div><h2>Çdo garë.<br/>Çdo moment.</h2><p>Njoftimet e reja të federatës shfaqen këtu përmes faqes sonë në Facebook.</p><a className="button yellow-button" href={FACEBOOK} target="_blank" rel="noreferrer">Na ndiqni <ArrowUpRight size={19}/></a><figure><img src="/images/racing.jpg" alt="Starti i garës Drag Race në Kosovë" loading="lazy"/><figcaption>Foto: Shpend Ahmeti / <a href="https://autoportali.com/drag-race-2-tubon-garuesit-tane-dhe-ata-te-rajonit/" target="_blank" rel="noreferrer">Autoportali</a></figcaption></figure><a href="/kalendari/" className="news-calendar"><CalendarDays size={25}/><div><span>SEZONI {SEASON}</span><h3>Shihemi në pistë.</h3></div><ArrowUpRight size={23}/></a></div><FacebookFeed/></section></Shell>}
