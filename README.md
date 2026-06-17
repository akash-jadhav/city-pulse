# Know Your Neighborhood

A Quality of Life Survey dashboard that visualizes neighborhood survey data across India. Built with Next.js, deployed on Vercel.

## Features

- Executive overview with KPI scores
- City overview and neighborhood explorer with interactive map
- Infrastructure, safety, and civic issues insights
- Community voice (keyword sentiment, word cloud, quotes)
- Comparative analysis vs city averages
- Read-only public site — data updated via admin import pipeline

## Stack

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS, shadcn/ui
- Recharts, Google Maps, Framer Motion
- Zod for dataset validation

## Getting started

```bash
npm install
npm run generate:data   # create public/data/*.json + cities.json (mock data)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/india` **Map Dashboard** (single-screen overview with map, parameters, and analytics).

## Data pipeline

Survey responses live in a **Google Sheet** linked to your Google Form. The import script fetches the sheet as CSV — no manual download needed.

### One-time setup

1. Google Form → **Responses** → **Link to Sheets**
2. Open the Responses tab in the sheet → **Share** → **Anyone with the link** = **Viewer**
3. Copy the URL from your browser's address bar (the normal `/edit#gid=...` link is fine)
4. Add to `.env.local`:

```bash
GOOGLE_FORM_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
GOOGLE_MAPS_API_KEY=your_key_here
```

(`GOOGLE_FORM_SHEET_CSV_URL` also works — same value. The import script converts any sheet link to a CSV export automatically.)

Alternatively, use `GOOGLE_SHEET_ID` + `GOOGLE_SHEET_GID` (defaults to `0`) instead of the full URL.

### Import

```bash
npm run import:survey
```

Commit `public/data/*.json` and `public/data/cities.json`, then deploy.

**Local file fallback** (optional backup CSV):

```bash
npm run import:survey -- "path/to/backup.csv"
```

**No public file upload** — visitors cannot modify survey data.

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy — app available at `your-project.vercel.app`

Ensure `public/data/cities.json` and per-city JSON files are committed before deploy.

## Google Maps API key

Maps use the **Maps JavaScript API**. CSV import uses the **Geocoding API** to resolve city names from lat/long. Use the same GCP key for both (enable both APIs on the project).

1. Copy `.env.example` to `.env.local` and set your keys:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
```

(`GOOGLE_MAPS_API_KEY` is used by the import script only; it can be the same value as the public key.)

2. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), restrict the browser key:
   - **Application restrictions:** HTTP referrers
     - `http://localhost:3000/*`
     - `https://*.vercel.app/*`
     - `https://your-custom-domain.com/*` (if applicable)
   - **API restrictions:** Maps JavaScript API

   For import, use the same key with **Geocoding API** enabled (IP restriction optional for local scripts).

3. On Vercel: add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for the web app. Geocoding runs at import time locally, not on Vercel deploy.

The key is visible in the browser (required for Maps JS). Referrer restrictions prevent use on other sites.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run generate:data` | Generate mock datasets + cities manifest |
| `npm run import:survey` | Fetch Google Sheet CSV, geocode, write per-city JSON + cities manifest |

## License

Private — civic survey project.
