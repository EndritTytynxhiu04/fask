# FASK website

React 19 website in Albanian. Built with Vite/vinext and exported to plain HTML, CSS and JavaScript. **No backend, database, API keys, paid news service or server process is needed for hosting.**

## Run locally

```sh
npm ci
npm run dev
```

Use `npm run dev` while editing JSON or page styles. Save the file and the local development page updates automatically. `npm run start` only previews the last build in `dist/client`; it does not rebuild after edits. To refresh that preview, stop it with Ctrl+C, run `npm run build`, then `npm run start`. The published website updates after you rebuild and redeploy (or push to a GitHub-connected host configured to run the build).

## Edit your content

| Content | File / folder |
| --- | --- |
| Clubs | `data/clubs.json` |
| Board members | `data/board.json` |
| Race calendar | `data/calendar.json` |
| PDFs | `public/documents/` |
| Optional PDF titles / categories | `data/document-details.json` |
| Images | `public/images/` |
| Homepage slideshow | `data/hero-slides.json` |
| Facebook page URL | `FACEBOOK` in `app/config.ts` |

### Clubs

Copy an existing object in the `clubs` array to add another club. Give every club a unique `id`. Edit `name`, `city`, `description` and `disciplines`. Leave `logo` and `website` empty if not available. To add a logo, put the actual logo in `public/images/` and set `logo` to `/images/my-club.png`. `website` must be a complete `https://…` URL. Set `isDemo` to `false` once all sample entries are replaced.

Logo paths are website URLs, not paths relative to the JSON file. For example, `public/images/Klubet/DTM.jpg` must be written as `"logo": "/images/Klubet/DTM.jpg"`. Do not include `public` or `../` in the URL. Match filename capitalization exactly for hosting. If using `npm run start`, rebuild after updating these paths; `npm run dev` shows saved changes automatically.

### Board

Edit the `members` array in `data/board.json`; add or remove entries as needed. The first entry is visually highlighted as the president. Every entry has a unique `id`, `name`, `role` and `bio`. Cards are text-only (no photos); `bio` is shown only when filled in. `term` is shown as the board mandate. Set `isDemo` to `false` when ready.

### Calendar

Edit `data/calendar.json`. Use ISO dates (`YYYY-MM-DD`) for both `startDate` and `endDate`; a single-day event uses the same date twice. Each event has a unique `id`, `name`, `discipline`, `location` and an `organizer`. The top-level `sourceUrl` links to the official calendar post. Events sort chronologically automatically. Change `year`, `note`, and `isComplete` as appropriate; `year` also sets the season shown in the header, hero and homepage. Finished races, the next race and its countdown are worked out in the visitor's browser from today's date, so they stay correct without rebuilding. The current calendar contains all 21 events transcribed from the official FASK 2026 calendar image provided through https://www.facebook.com/share/p/19jZmgEb1V/ (canonical post: https://www.facebook.com/FASKKOSOVA/posts/1642118111249817/). The original image is saved at `public/images/calendar-2026.jpg`. The 20 September karting location and Kruja organizer are blank in the source; these were not invented. Dates reflect this published calendar and may be superseded by later announcements. Calendar content does not auto-sync; the news feed does.

### Race results from KS Timing

Finished races with a `results` link in `data/calendar.json` show a **Rezultatet** badge; clicking the race opens its results (podium, class filter and full timing table, or the Drag Race heats by AWD / FWD-RWD and class). A link such as `/kalendari/#rezultatet-kulla` opens a race's results directly.

To add results after a race:

1. Open https://kstiming.com/arkiva.html and copy the race's link, e.g. `https://kstiming.com/arkiva/2026/index.html?g=m/KullaM2.xml` (hill climb), `…/indexr.html?g=s/PrizrenSS3.xml` (auto slalom) or `…/Drag1/awd.html` (drag).
2. Add it to the event in `data/calendar.json` as `"results": "<link>"`.
3. Run `npm run results`. It downloads the data and saves `public/results/<event id>.json`; if KS Timing is unreachable, existing files are kept.

The build fails if a linked race has no results file. Races that KS Timing does not time (karting, oldtimer, electric slalom) simply show **Përfunduar**.

### Documents: drop PDFs into the folder

1. Put PDFs in `public/documents/` (subfolders and names with spaces or Albanian characters are supported).
2. Run `npm run build`.
3. Publish the updated static output.

The build automatically creates the dropdown from PDFs actually present in the folder. It derives names and file sizes, validates PDF headers, and encodes filenames correctly. No manual link updates are needed. Optionally add metadata in `data/document-details.json`, keyed by the exact relative filename. Do not edit `data/documents.generated.json` manually.

When adding PDFs while the development server is already running, run `npm run documents` to refresh the list. Removing all PDFs produces a clear empty state.

### Automatic Facebook news

Both the homepage and news page embed Facebook's Page Plugin timeline for `https://www.facebook.com/FASKKOSOVA` immediately. Facebook supplies the posts dynamically when the page is viewed; there is no manual copying or token in this project. The feed adjusts to the available width and has a reload button and a permanent link to Facebook.

Facebook controls availability, login requirements, regional restrictions, cookies and rendering. Browser privacy tools may block the embed. The site provides a direct fallback link and does not falsely report successful post loading. A completely custom card feed that imports Facebook posts reliably would require an authorized Meta API integration with protected credentials; this static project intentionally uses the no-backend embed instead.

## Build / free static hosting

The homepage rotates through four real photographs every 7 seconds (`SLIDE_DURATION` in `app/hero.tsx`). Edit `data/hero-slides.json` to replace or add images, captions and focal positions. Previous, next and pause controls are included; automatic rotation pauses while the tab is hidden or the controls have keyboard focus, and starts paused when reduced motion is preferred. Page navigation uses ordinary hyperlinks so it also works without JavaScript.

```sh
npm run build
```

The output folder is `dist/client` (vinext static export). Publish that folder using a static host. It contains pre-rendered pages, assets and documents, with no backend. All routes have their own `index.html`, so direct links and refreshes work without an SPA fallback. A custom domain can be configured through your host. The private Sites preview is separate from your eventual public federation domain.

Do not publish the project root or `node_modules`; publish only the static output. JSON edits and newly added PDFs require a rebuild and redeploy.

### Netlify

Connect the GitHub repository with `main` as the production branch. The root `netlify.toml` sets the build command, Node version and `dist/client` publish directory automatically, overriding corresponding dashboard settings. No SPA redirect or server adapter is needed because every route is exported to HTML. A successful deploy must contain `index.html` at the root in Netlify's Deploy File Explorer. If automatic deploys are paused, use Deploys > Trigger deploy after pushing.

To connect a domain managed elsewhere, add the domain under Domain management > Production domains, then select Pending DNS verification. Send those records to the domain administrator. Website visibility is managed separately in Netlify; a private project requires Netlify login even after DNS is connected.

## Image sources

Real racing / federation photography was sourced from Autoportali articles. Attribution and source URLs are in `public/images/sources.json`; the site also credits photos where shown as editorial content. Images are stored locally rather than hotlinked to expiring Facebook URLs. No open reuse license was found; confirm the federation's publication rights for the selected photographs before public launch. Board photos and club logos remain blank until you supply the correct assets.

## Pages

`/` · `/bordi/` · `/klubet/` · `/kalendari/` · `/dokumentet/` · `/lajmet/`
