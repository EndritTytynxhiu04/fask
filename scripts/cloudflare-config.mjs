// Deploy settings for `npx wrangler deploy` (Cloudflare Workers Builds): upload dist/client as static assets.
// Written after the build rather than kept as a root wrangler.jsonc, because vinext fails the build when it
// finds a wrangler config in the project root (it then expects a full Cloudflare Worker setup).
// Wrangler picks this up through its standard redirect file, .wrangler/deploy/config.json.
import fs from 'node:fs/promises';

const config = {
  name: 'fask',
  compatibility_date: '2026-09-25',
  assets: { directory: 'client' }, // relative to dist/wrangler.json, i.e. dist/client
};

await fs.writeFile('dist/wrangler.json', JSON.stringify(config, null, 2) + '\n');
await fs.mkdir('.wrangler/deploy', { recursive: true });
await fs.writeFile('.wrangler/deploy/config.json', JSON.stringify({ configPath: '../../dist/wrangler.json' }) + '\n');
console.log('Cloudflare deploy config written to dist/wrangler.json.');
