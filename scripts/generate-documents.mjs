import { readdir, mkdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const folder = path.join(root, 'public/documents');
await mkdir(folder, { recursive: true });
const details = JSON.parse(await readFile(path.join(root, 'data/document-details.json'), 'utf8'));
export async function scanPdfs(directory, prefix = '') {
  const documents = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const relative = prefix + entry.name;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) documents.push(...await scanPdfs(fullPath, relative + '/'));
    if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      const bytes = await readFile(fullPath);
      if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error(`Not a valid PDF: ${relative}`);
      const meta = details[relative] ?? {};
      documents.push({file: relative, title: meta.title || entry.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '), category: meta.category || 'Dokumente', sourceUrl: meta.sourceUrl || '', url: '/documents/' + relative.split('/').map(encodeURIComponent).join('/'), size: (await stat(fullPath)).size});
    }
  }
  return documents.sort((a,b) => a.title.localeCompare(b.title, 'sq'));
}
const documents = await scanPdfs(folder);
await writeFile(path.join(root, 'data/documents.generated.json'), JSON.stringify(documents, null, 2) + '\n');
console.log(`Document library: ${documents.length} PDF(s).`);
