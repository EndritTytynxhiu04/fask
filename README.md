# FASK website

React 19 website in Albanian. Built with Vite/vinext and exported to plain HTML, CSS and JavaScript. **No backend, database, API keys, paid news service or server process is needed for hosting.**

## Run locally

```sh
npm ci
npm run dev
```

## Edit your content

| Content | File / folder |
| --- | --- |
| Clubs | `data/clubs.json` |
| Board members | `data/board.json` |
| Race calendar | `data/calendar.json` |
| PDFs | `public/documents/` |
| Optional PDF titles / categories | `data/document-details.json` |
| Images | `public/images/` |
| Facebook page URL | `FACEBOOK` in `app/site.tsx` |

### Clubs

Copy an existing object in the `clubs` array to add another club. Give every club a unique `id`. Edit `name`, `city`, `description` and `disciplines`. Leave `logo` and `website` empty if not available. To add a logo, put the actual logo in `public/images/` and set `logo` to `/images/my-club.png`. `website` must be a complete `https://…` URL. Set `isDemo` to `false` once all sample entries are replaced.

### Board

Edit the `members` array in `data/board.json`; add or remove entries as needed. The first entry is visually highlighted as the president. Every entry has a unique `id`, `name`, `role`, `photo`, and `bio`. Leave `photo` empty for the neutral user icon, or use `/images/person.jpg`. Names and roles are explicitly sample content as requested. Set `isDemo` to `false` when ready.

### Calendar

Edit `data/calendar.json`. Use ISO dates (`YYYY-MM-DD`) for both `startDate` and `endDate`; a single-day event uses the same date twice. Each event has a unique `id`, `name`, `discipline`, `location` and an `organizer`. The top-level `sourceUrl` links to the official calendar post. Events sort chronologically automatically. Change `year`, `note`, and `isComplete` as appropriate. The current calendar contains all 21 events transcribed from the official FASK 2026 calendar image provided through https://www.facebook.com/share/p/19jZmgEb1V/ (canonical post: https://www.facebook.com/FASKKOSOVA/posts/1642118111249817/). The original image is saved at `public/images/calendar-2026.jpg`. The 20 September karting location and Kruja organizer are blank in the source; these were not invented. Dates reflect this published calendar and may be superseded by later announcements. Calendar content does not auto-sync; the news feed does.

### Documents: drop PDFs into the folder

1. Put PDFs in `public/documents/` (subfolders and names with spaces or Albanian characters are supported).
2. Run `npm run build`.
3. Publish the updated static output.

The build automatically creates the dropdown from PDFs actually present in the folder. It derives names and file sizes, validates PDF headers, and encodes filenames correctly. No manual link updates are needed. Optionally add metadata in `data/document-details.json`, keyed by the exact relative filename. Do not edit `data/documents.generated.json` manually.

When adding PDFs while the development server is already running, run `npm run documents` to refresh the list. Removing all PDFs produces a clear empty state. An authentic archived Brezovica 2025 regulation is included to demonstrate the download flow; it is clearly marked as an archive, not a 2026 regulation.

### Automatic Facebook news

The news page embeds Facebook's Page Plugin timeline for `https://www.facebook.com/FASKKOSOVA`. Facebook supplies the posts dynamically when the page is viewed; there is no manual copying or token in this project. The feed adjusts to the available width and has a reload button and a permanent link to Facebook.

Facebook controls availability, login requirements, regional restrictions, cookies and rendering. Browser privacy tools may block the embed. The site provides a direct fallback link and does not falsely report successful post loading. A completely custom card feed that imports Facebook posts reliably would require an authorized Meta API integration with protected credentials; this static project intentionally uses the no-backend embed instead.

## Build / free static hosting

```sh
npm run build
```

The output folder is `dist/client` (vinext static export). Publish that folder using a static host. It contains pre-rendered pages, assets and documents, with no backend. All routes have their own `index.html`, so direct links and refreshes work without an SPA fallback. A custom domain can be configured through your host. The private Sites preview is separate from your eventual public federation domain.

Do not publish the project root or `node_modules`; publish only the static output. JSON edits and newly added PDFs require a rebuild and redeploy.

## Image sources

Real racing / federation photography was sourced from Autoportali articles. Attribution and source URLs are in `public/images/sources.json`; the site also credits photos where shown as editorial content. Images are stored locally rather than hotlinked to expiring Facebook URLs. No open reuse license was found; confirm the federation's publication rights for the selected photographs before public launch. Board photos and club logos remain blank until you supply the correct assets.

## Pages

`/` · `/bordi/` · `/klubet/` · `/kalendari/` · `/dokumentet/` · `/lajmet/`
