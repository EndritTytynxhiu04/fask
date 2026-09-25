// Downloads race results from KS Timing for every calendar event that has a `results` link,
// and saves a clean copy in public/results/<event id>.json for the calendar page.
// Run with `npm run results` after adding a link. Existing files are kept if KS Timing is unreachable.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'public/results');
const calendar = JSON.parse(await readFile(path.join(root, 'data/calendar.json'), 'utf8'));

// Class names exactly as KS Timing labels them (hill climb: index.html, slalom: indexr.html).
const HILL_CLASSES = {
  1: 'Klasa 1 · Deri në 1400 ccm · E1', 2: 'Klasa 2 · Deri në 1600 ccm · E1', 3: 'Klasa 3 · Deri në 2000 ccm · E1',
  4: 'Klasa 4 · PF5 mbi 159 PF', 5: 'Klasa 5 · PF4 120 deri në 159 PF', 6: 'Klasa 6 · PF3 80 deri në 119 PF',
  7: 'Klasa 7 · PF2 40 deri në 79 PF', 8: 'Klasa 8 · PF1 15 deri në 39 PF', 9: 'Klasa 9 · Single Seater, E2', 20: 'Mysafirë',
};
const SLALOM_CLASSES = {
  1: 'Klasa 1 · Deri në 1200 ccm, pa turbo · Grupi 1', 2: 'Klasa 2 · 1200–1600 ccm, pa turbo · Grupi 1',
  3: 'Klasa 3 · Mbi 1600 ccm, pa turbo · Grupi 1', 4: 'Klasa 4 · Deri në 1600 ccm, turbo · Grupi 1',
  5: 'Klasa 5 · Mbi 1600 ccm, turbo · Grupi 1', 6: 'Klasa 6 · Deri në 1200 ccm, pa turbo · Grupi 2',
  7: 'Klasa 7 · 1200–1600 ccm, pa turbo · Grupi 2', 8: 'Klasa 8 · Mbi 1600 ccm, pa turbo · Grupi 2',
  9: 'Klasa 9 · Deri në 1600 ccm, turbo · Grupi 2', 10: 'Klasa 10 · Mbi 1600 ccm, turbo · Grupi 2',
  11: 'Klasa 11 · Deri në 1400 ccm · Grupi 3', 12: 'Klasa 12 · 1400–1600 ccm · Grupi 3',
  13: 'Klasa 13 · 1600–2000 ccm · Grupi 3', 14: 'Klasa 14 · Mbi 2000 ccm · Grupi 3',
  15: 'Klasa 15 · Single seaters / prototipet · Grupi 3', 16: 'Klasa 16 · Veturat elektrike · Grupi 4', 20: 'Klasa Promo',
};

const decode = text => text.trim()
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** The KS Timing files are flat: <Root><Field>…</Field><G><Field>…</Field></G>…</Root>. */
function fields(xml) {
  const result = {};
  for (const match of xml.matchAll(/<(\w+)>([^<]*)<\/\1>|<(\w+)\s*\/>/g)) result[match[1] ?? match[3]] = match[1] ? decode(match[2]) : '';
  return result;
}
const records = (xml, tag) => [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map(match => fields(match[1]));
const heading = xml => fields(xml.replace(/<(G\d*)>[\s\S]*?<\/\1>/g, '')).Titulli ?? '';

async function download(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'fask-kosova-site (results import)' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return (await response.text()).replace(/^﻿/, '');
}

const isTime = value => /^\d/.test(value ?? '');

async function timedResults(pageUrl) {
  const url = new URL(pageUrl);
  const slalom = url.pathname.endsWith('indexr.html');
  const xmlUrl = new URL(url.searchParams.get('g'), url);
  const xml = await download(xmlUrl.href);
  const labels = slalom ? SLALOM_CLASSES : HILL_CLASSES;
  let position = 0;
  const rows = records(xml, 'G').map(g => ({
    position: isTime(g.K) ? ++position : null,
    number: g.N, name: g.E, car: g.M, classId: g.KL, group: g.DI,
    runs: [g.K1, g.K2, g.K3].filter(value => value !== undefined),
    penalty: g.P || '', total: g.K, gap: g.D || '', speed: g.S || '',
  }));
  const classIds = [...new Set(rows.map(row => row.classId))].sort((a, b) => Number(a) - Number(b));
  return {
    kind: 'timed', discipline: slalom ? 'slalom' : 'hill', title: heading(xml), source: pageUrl,
    classes: classIds.map(id => ({ id, label: labels[id] ?? `Klasa ${id}` })),
    hasPenalties: rows.some(row => row.penalty), hasSpeed: rows.some(row => row.speed), rows,
  };
}

async function dragResults(pageUrl) {
  const divisions = [];
  let title = '';
  for (const file of ['AWD.xml', 'FWD.xml']) {
    const xml = await download(new URL(file, pageUrl).href);
    title ||= heading(xml);
    const lane = (g, n) => g[`NR${n}`]?.trim() ? {
      number: g[`NR${n}`].trim(), name: g[`Emri${n}`], car: g[`Vet${n}`], reaction: g[`RT${n}`], eighth: g[`ET${n}18`],
      quarter: g[`ET${n}`], total: g[`TT${n}`], speed: g[`Speed${n}`], winner: g[`Col${n}`]?.toLowerCase() === '#c2f0c2',
    } : null;
    const heats = records(xml, 'G').map(g => ({ classId: g.Kl, lanes: [lane(g, 1), lane(g, 2)].filter(Boolean) })).filter(heat => heat.lanes.length);
    const classes = [...new Set(heats.map(heat => heat.classId))].sort((a, b) => Number(a) - Number(b))
      .map(id => ({ id, label: `Klasa ${id}`, heats: heats.filter(heat => heat.classId === id).map(({ lanes }) => lanes) }));
    divisions.push({ name: file === 'AWD.xml' ? 'AWD (4x4)' : 'FWD-RWD', classes });
  }
  return { kind: 'drag', title, source: pageUrl, divisions };
}

await mkdir(outDir, { recursive: true });
let saved = 0, failed = 0;
for (const event of calendar.events.filter(event => event.results)) {
  try {
    const url = new URL(event.results);
    const data = url.searchParams.get('g') ? await timedResults(url.href) : await dragResults(url.href);
    await writeFile(path.join(outDir, `${event.id}.json`), JSON.stringify({ event: event.id, fetchedAt: new Date().toISOString(), ...data }) + '\n');
    const count = data.kind === 'drag' ? data.divisions.reduce((sum, d) => sum + d.classes.reduce((s, c) => s + c.heats.length, 0), 0) + ' heats' : data.rows.length + ' drivers';
    console.log(`✓ ${event.id}: ${count}`);
    saved++;
  } catch (error) {
    console.warn(`✗ ${event.id}: ${error.message} (kept the previous file, if any)`);
    failed++;
  }
}
console.log(`Results: ${saved} saved, ${failed} failed.`);
if (failed) process.exitCode = 1;
