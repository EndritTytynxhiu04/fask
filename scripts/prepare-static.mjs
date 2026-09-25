import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
// Emit directory aliases too, so basic static hosts can serve either URL form.
const root = path.resolve('dist/client');
for (const route of ['bordi', 'klubet', 'kalendari', 'dokumentet', 'lajmet']) {
  const html = await fs.readFile(path.join(root, route + '.html'), 'utf8');
  assert.ok(html.includes('<html') && html.includes('permbajtja'), `Missing page: ${route}`);
  await fs.mkdir(path.join(root, route), {recursive:true});
  await fs.writeFile(path.join(root, route, 'index.html'), html);
}
const documents = JSON.parse(await fs.readFile('data/documents.generated.json','utf8'));
for (const doc of documents) {
  const file = path.join(root, decodeURIComponent(doc.url));
  const bytes = await fs.readFile(file);
  assert.equal(bytes.subarray(0,5).toString(), '%PDF-');
  assert.equal(bytes.length, doc.size);
}
const calendar = JSON.parse(await fs.readFile('data/calendar.json','utf8'));
assert.equal(new Set(calendar.events.map(x=>x.id)).size, calendar.events.length);
for(const event of calendar.events){
  assert.ok(!Number.isNaN(Date.parse(event.startDate)) && !Number.isNaN(Date.parse(event.endDate)));
  assert.ok(event.endDate >= event.startDate, `Invalid date range: ${event.id}`);
}
// Catch broken navigation and missing assets in the actual exported HTML.
for (const route of ['', 'bordi', 'klubet', 'kalendari', 'dokumentet', 'lajmet']) {
  const html = await fs.readFile(path.join(root, route, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const url = decodeURIComponent(match[1]);
    const target = path.join(root, url, url.endsWith('/') ? 'index.html' : '');
    assert.ok((await fs.stat(target)).isFile(), `Missing target on ${route || 'home'}: ${url}`);
  }
  if (route === '' || route === 'lajmet') {
    assert.match(html, /<iframe[^>]+facebook\.com\/plugins\/page\.php/);
  }
}
const clubs = JSON.parse(await fs.readFile('data/clubs.json', 'utf8'));
const clubPage = await fs.readFile(path.join(root, 'klubet/index.html'), 'utf8');
assert.equal((clubPage.match(/class="club-card"/g) || []).length, clubs.clubs.length, 'Exported club list is stale');
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[char]));
for (const club of clubs.clubs) {
  assert.ok(clubPage.includes(`<h3>${escapeHtml(club.name)}</h3>`), `Missing club in export: ${club.name}`);
}
console.log(`Static checks passed: 6 pages and their links/assets, ${clubs.clubs.length} clubs, Facebook embeds, ${calendar.events.length} calendar events, ${documents.length} PDF(s).`);
