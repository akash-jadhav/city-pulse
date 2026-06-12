# City Pulse

A civic intelligence dashboard that visualizes neighborhood survey data for Delhi. Built with Next.js, deployed on Vercel.

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
- Recharts, MapLibre GL, Framer Motion
- Zod for dataset validation

## Getting started

```bash
npm install
npm run generate:data   # create public/data/delhi.json (mock data)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/delhi` **Map Dashboard** (single-screen overview with map, parameters, and analytics).

## Data pipeline

1. Export CSV from Google Forms ("Rate Your Neighbourhood!")
2. Place file in `data/raw/` (gitignored)
3. Run import:

```bash
npm run import:survey -- "data/raw/your-export.csv"
```

4. Commit `public/data/delhi.json` and deploy

**No public file upload** — visitors cannot modify survey data.

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy — app available at `your-project.vercel.app`

Ensure `public/data/delhi.json` is committed before deploy.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run generate:data` | Generate mock Delhi dataset |
| `npm run import:survey` | Import real CSV export |

## License

Private — civic survey project.
