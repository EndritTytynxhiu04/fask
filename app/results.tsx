'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { dateLabel, type RaceEvent } from './config';

type TimedRow = { position: number | null; number: string; name: string; car: string; classId: string; group: string; runs: string[]; penalty: string; total: string; gap: string; speed: string };
type TimedResults = { kind: 'timed'; discipline: 'hill' | 'slalom'; title: string; source: string; classes: { id: string; label: string }[]; hasPenalties: boolean; hasSpeed: boolean; rows: TimedRow[] };
type Lane = { number: string; name: string; car: string; reaction: string; eighth: string; quarter: string; total: string; speed: string; winner: boolean };
type DragResults = { kind: 'drag'; title: string; source: string; divisions: { name: string; classes: { id: string; label: string; heats: Lane[][] }[] }[] };
type Results = TimedResults | DragResults;

// Results are static files written by `npm run results`; load each one once, when it is first opened.
const cache = new Map<string, Promise<Results>>();
function loadResults(id: string) {
  if (!cache.has(id)) cache.set(id, fetch(`/results/${id}.json`).then(response => {
    if (!response.ok) throw new Error(String(response.status));
    return response.json() as Promise<Results>;
  }).catch(error => { cache.delete(id); throw error; }));
  return cache.get(id)!;
}

/** "3:41.427" or "58.120" → milliseconds; DNS/DNF → null. */
function toMs(time: string) {
  const match = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(time.trim());
  return match ? Math.round((Number(match[1] ?? 0) * 60 + Number(match[2])) * 1000) : null;
}
function formatGap(ms: number) {
  const seconds = ms / 1000;
  if (seconds < 60) return '+' + seconds.toFixed(3).padStart(6, '0');
  const minutes = Math.floor(seconds / 60);
  return `+${String(minutes).padStart(2, '0')}:${(seconds - minutes * 60).toFixed(3).padStart(6, '0')}`;
}

export function ResultsDialog({ event, open, onOpenChange }: { event: RaceEvent | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loaded, setLoaded] = useState<{ id: string; data?: Results; failed?: boolean }>();
  useEffect(() => {
    if (!event || !open) return;
    let current = true;
    loadResults(event.id).then(data => current && setLoaded({ id: event.id, data }), () => current && setLoaded({ id: event.id, failed: true }));
    return () => { current = false; };
  }, [event, open]);
  const state = loaded?.id === event?.id ? loaded : undefined;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="results-dialog">
      {event && <>
        <header className="results-head">
          <div className="results-head-text">
            <span className="eyebrow"><span/>REZULTATET · {event.discipline.toUpperCase()}</span>
            <DialogTitle className="results-title">{event.name}</DialogTitle>
            <DialogDescription render={<div className="results-meta"/>}>
              <span><CalendarDays size={15}/>{dateLabel(event)} {event.startDate.slice(0, 4)}</span>
              <span><MapPin size={15}/>{event.location}</span>
              {event.results && <a href={event.results} target="_blank" rel="noreferrer" className="text-link">Burimi: KS Timing <ArrowUpRight size={15}/></a>}
            </DialogDescription>
          </div>
          {event.results && <a className="ks-badge" href={event.results} target="_blank" rel="noreferrer" title="Rezultatet zyrtare në KS Timing"><img src="/images/kstiming.png" alt="KS Timing" width="273" height="78"/></a>}
        </header>
        <div className="results-body">
          {!state && <output className="results-status">Duke ngarkuar rezultatet…</output>}
          {state?.failed && <div className="results-status">Rezultatet nuk u ngarkuan. {event.results && <a href={event.results} target="_blank" rel="noreferrer" className="text-link">Shihni rezultatet në KS Timing <ArrowUpRight size={15}/></a>}</div>}
          {state?.data?.kind === 'timed' && <TimedTable key={event.id} data={state.data}/>}
          {state?.data?.kind === 'drag' && <DragHeats key={event.id} data={state.data}/>}
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}

function TimedTable({ data }: { data: TimedResults }) {
  const [classId, setClassId] = useState('');
  const counts = new Map(data.classes.map(c => [c.id, data.rows.filter(row => row.classId === c.id).length]));
  const inClass = classId ? data.rows.filter(row => row.classId === classId) : data.rows;
  // Within a class, positions and gaps are counted from that class's leader.
  const leader = toMs(inClass.find(row => row.position)?.total ?? '');
  let place = 0;
  const rows = inClass.map(row => {
    if (!classId || !row.position) return row;
    const ms = toMs(row.total);
    return { ...row, position: ++place, gap: place === 1 || ms === null || leader === null ? '' : formatGap(ms - leader) };
  });
  const podium = rows.filter(row => row.position).slice(0, 3);
  // Only show run columns that were actually driven (e.g. Brezovica has a single run).
  const runCount = Math.max(0, ...data.rows.map(row => row.runs.reduce((count, run, i) => run ? i + 1 : count, 0)));
  const classLabel = new Map(data.classes.map(c => [c.id, c.label]));

  return <>
    {podium.length > 0 && <ol className="results-podium" aria-label="Tre të parët">
      {podium.map(row => <li key={row.number} className={'podium-' + row.position}>
        <span className="podium-place">{row.position}</span>
        <div><strong>{row.name}</strong><span>{row.car}</span></div>
        <span className="podium-time">{row.total}{row.gap && <small>{row.gap}</small>}</span>
      </li>)}
    </ol>}
    <div className="results-toolbar">
      <label htmlFor="results-class">Plasmani</label>
      <NativeSelect id="results-class" className="results-select" value={classId} onChange={event => setClassId(event.target.value)}>
        <NativeSelectOption value="">I përgjithshëm ({data.rows.length})</NativeSelectOption>
        {data.classes.map(c => <NativeSelectOption key={c.id} value={c.id}>{c.label} ({counts.get(c.id)})</NativeSelectOption>)}
      </NativeSelect>
    </div>
    <div className="results-table-wrap">
      <table className="results-table">
        <thead><tr>
          <th scope="col" className="col-pos">Poz.</th><th scope="col" className="col-nr">Nr</th><th scope="col">Garuesi</th>
          {Array.from({ length: runCount }, (_, i) => <th key={i} scope="col" className="col-run">Xhiro {i + 1}</th>)}
          {data.hasPenalties && <th scope="col" className="col-run" title="Sekonda penallti">Pen.</th>}
          <th scope="col">Koha</th><th scope="col" className="col-gap">Dif.</th>
          {data.hasSpeed && <th scope="col" className="col-speed">km/h</th>}
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.number} className={row.position && row.position <= 3 ? 'is-top' : row.position ? '' : 'is-out'}>
          <td className="col-pos">{row.position ?? '–'}</td>
          <td className="col-nr">{row.number}</td>
          <td className="col-driver"><strong>{row.name}</strong><span>{row.car}{!classId && classLabel.get(row.classId) && <> · {classLabel.get(row.classId)!.split(' · ')[0]}</>}</span></td>
          {Array.from({ length: runCount }, (_, i) => <td key={i} className="col-run">{row.runs[i] ?? ''}</td>)}
          {data.hasPenalties && <td className="col-run">{row.penalty ? '+' + row.penalty : ''}</td>}
          <td className="col-total">{row.position ? row.total : <span className="results-flag">{row.total}</span>}{row.gap && <small className="gap-inline">{row.gap}</small>}</td>
          <td className="col-gap">{row.gap}</td>
          {data.hasSpeed && <td className="col-speed">{row.speed}</td>}
        </tr>)}</tbody>
      </table>
    </div>
    <p className="results-note">DNS: nuk startoi · DNF: nuk përfundoi. Koha totale është shuma e xhirove{data.hasPenalties ? ', përfshirë sekondat penallti' : ''}.</p>
  </>;
}

function DragHeats({ data }: { data: DragResults }) {
  const [divisionIndex, setDivisionIndex] = useState(0);
  const division = data.divisions[divisionIndex];
  const [classId, setClassId] = useState(division?.classes[0]?.id ?? '');
  const selected = division?.classes.find(c => c.id === classId) ?? division?.classes[0];
  if (!division) return <p className="results-status">Nuk ka duele të regjistruara.</p>;

  return <>
    <div className="results-tabs" role="tablist" aria-label="Kategoria">
      {data.divisions.map((d, i) => <button key={d.name} type="button" role="tab" aria-selected={i === divisionIndex} className={i === divisionIndex ? 'is-active' : ''} onClick={() => { setDivisionIndex(i); setClassId(d.classes[0]?.id ?? ''); }}>{d.name}</button>)}
    </div>
    <div className="results-chips" aria-label="Klasa">
      {division.classes.map(c => <button key={c.id} type="button" aria-pressed={c.id === selected?.id} className={c.id === selected?.id ? 'is-active' : ''} onClick={() => setClassId(c.id)}>{c.label}<small>{c.heats.length}</small></button>)}
    </div>
    {selected && <ol className="drag-heats" aria-label={`${division.name}, ${selected.label}`}>
      {selected.heats.map((lanes, i) => <li key={i} className="drag-heat">
        <span className="drag-heat-no">Dueli {i + 1}</span>
        {lanes.map(lane => <div key={lane.number} className={'drag-lane' + (lane.winner ? ' is-winner' : '')}>
          <span className="drag-nr">{lane.number}</span>
          <div className="drag-driver"><strong>{lane.name}</strong><span>{lane.car}</span></div>
          <dl className="drag-times">
            <div><dt>RT</dt><dd>{lane.reaction}</dd></div>
            <div><dt>ET ¼</dt><dd>{lane.quarter}</dd></div>
            <div><dt>km/h</dt><dd>{lane.speed}</dd></div>
          </dl>
          <div className="drag-total"><span>TT</span><strong>{lane.total}</strong></div>
          {lane.winner && <span className="drag-win"><Check size={14}/> Fitues</span>}
        </div>)}
      </li>)}
    </ol>}
    <p className="results-note">RT: koha e reagimit · ET ¼: koha në çerek milje · TT: koha totale (RT + ET). Fituesi i çdo dueli është i shënuar me të verdhë.</p>
  </>;
}
