# Holy City Jerusalem Real Estate — website

Static site (Astro) built from the Grist listings table and published to GitHub Pages at holycity-realestate.com.

## How listings get to the site
1. Add or edit a property in Grist (photos can be uploaded straight into Grist).
2. Within the hour the "Publish site" workflow pulls Grist, optimizes photos, rebuilds and publishes.
   To publish immediately: GitHub → Actions → Publish site → Run workflow.

## Setup (one time)
- Repo → Settings → Pages → Source: **GitHub Actions**.
- Repo → Settings → Secrets and variables → Actions:
  - `GRIST_API_KEY` — Grist → Profile settings → API key
  - `GRIST_DOC_ID` — from the Grist document URL
  - (variable) `GRIST_TABLE` if the table isn't called `Properties`

## Local
    npm install
    node scripts/import-grist.mjs --file data/grist-export.json   # or with GRIST_* env vars
    npm run dev

## Where things live
- `scripts/import-grist.mjs` — Grist → `src/data/properties.json` (+ WebP photos in `public/photos/`)
- `src/lib/i18n.js` — all English/Hebrew wording, contact details, currencies
- `src/lib/glossary.js` — professional Hebrew terms for features, types, neighborhoods
- `src/styles/themes.css` — design themes (default: `signature`)
