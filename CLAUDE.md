# Holy City Jerusalem Real Estate — website

Owner: Aryeh (Holy City Jerusalem Real Estate). Non-technical; wants minimal manual work and to see a demo before anything goes live. Speak plainly.

## What this is
Astro static site (EN + HE/RTL), "Signature" design: dark cinematic hero + glass search, warm limestone body, tall photo cards, gold accents. Benchmarked against Oren Cohen Group, Daniel Bouzaglo, JRE, Prosperity, Sotheby's.

- `scripts/import-grist.mjs` — listings → `src/data/properties.json` (from Grist API or `data/grist-export.json`); applies Hebrew glossary; downloads photos to `public/photos/<id>-800|1600.webp` (use `--no-photos` to keep original URLs); merges map positions from `data/geocode.json`; writes `public/property_details.html` redirect map for old URLs.
- `src/lib/i18n.js` — all wording EN/HE, contact details, currencies (live rates via open.er-api.com in the browser), `img()` size helper.
- `src/lib/glossary.js` — professional Hebrew terms (features, types, neighborhoods).
- `src/styles/global.css`, `src/styles/themes.css` — design; default theme `signature` (others: heritage, gallery, prestige via SITE_THEME).
- `src/lib/map.js` — Leaflet maps (OpenStreetMap tiles, CSS-tinted; CARTO now needs an API key): `/map/` page with price pins grouped per building, and a mini map (soft circle, not exact address) on property pages.
- `.github/workflows/deploy.yml` — future automatic publishing (needs Pages source = GitHub Actions + secrets).

## Hosting
- Demo: https://holycityestates.github.io — repo `holycityestates/holycityestates.github.io` (Aryeh's account). Branch `main` = built static files (served by Pages; keep `.nojekyll`). Branch `source` = this code.
- Demo build: `node scripts/import-grist.mjs --file data/grist-export.json --no-photos && PREVIEW=1 npx astro build && touch dist/.nojekyll && printf 'User-agent: *\nDisallow: /\n' > dist/robots.txt`, then push `dist` to `main`.
- Real domain holycity-realestate.com is still served from `ajdorfman93/holy-city` (another person's account). Go-live = domain released there (or verified on Aryeh's account) → add custom domain + `public/CNAME`, remove PREVIEW.

## Decisions
- Hebrew brand: "העיר הקדושה – נדל״ן ירושלים". Israeli rooms (חדרים) shown alongside bedrooms. Prices ₪ + second currency switcher.
- Back office: building "Holy City Desk" (like Aryeh's Land Desk artifact): listings + photo upload, leads, clients, follow-ups, publish button → site.

## In progress (updated 2026-10-07)
- Done, not yet built/checked in a browser: `motion.js` imported in `Base.astro`; motion CSS and map CSS appended to `global.css` ("v4" sections). Signature theme's home header is now fixed and turns dark glass on scroll.
- Hebrew street typos auto-corrected by `fixStreetHe` in `glossary.js` (applied in importer). Still fix in Grist itself. Data question: "King George 33" listing has Hebrew street "35".
- Aryeh's Mac had no Node.js installed (2026-10-07) — needed to build/preview.
- Photos: never cropped. `.media-main` (object-fit: contain) over `.media-bg` (same photo, blurred) in cards, gallery mosaic, project tiles; cards are 4:3. Aryeh asked for this.
- Map page has search filters (deal type, neighborhood, type, bedrooms); map refits to results.
- Photography (Unsplash free licence, no credit required): hero = sunset from Mount of Olives (unsplash.com/photos/6YThfy8q9hE) → `public/img/hero-1200|2400.webp` (+ `hero.jpg` for social previews); `.duo-night` band = same view at night (unsplash.com/photos/B5a_mgBLBX8) → `night-1000|2000.webp`. Aryeh's own example photo was © Michael Shmidt — not usable without licence.
- Motion (v8, global.css): ONE motion language at Aryeh's request ("not random ones moving at random times"). Tokens `--m-ease`, `--m-dur` (.8s), `--m-rise`; every reveal is the same fade-up; items entering together stagger 90ms in reading order (RTL-aware, computed in motion.js per IntersectionObserver batch). No word-splits, wipes, side-slides, tilt, parallax tiles or magnetic buttons — don't reintroduce mixed effects. Kept: small gold `.cursor-dot` ("View →" pill over properties; he disliked the big ring), scroll progress hairline, hero fades on scroll, cross-document View Transition when opening a property (`prop-photo`/`prop-title`).
- Demo publish: code committed locally on `source` (5601366) but NOT pushed — this Mac has no GitHub credentials. Plan Aryeh hasn't approved yet: download GitHub CLI into `../_tools`, run `gh auth login --web` (he enters the device code himself), then push `source` and `dist` → `main`. The public demo still shows the OLD version from before 2026-10-07 (old hero, no motion) — that confused him once.
- Since that commit (uncommitted): Home link added + Sold removed from nav; sold/rented listings now at bottom of Properties (`#sold`), `/sold/` redirects there; currency picker moved from header to a small tag beside every price (`.fx-chip` + shared `#fx-menu` in Base.astro).

## Listing copy (2026-10-08)
- All descriptions rewritten EN+HE (Aryeh approved the style on #27): `src/data/overrides.json`, merged over the Grist import in `src/lib/i18n.js` (any field replaces the imported one; `display:false` hides). Style: `.lead` opening line, two short paragraphs (home, then building/location), `.note` small print; no price, no phone, no `**`, only facts from the listing.
- #17 (penthouse for rent, duplicate of #11) hidden; #11 price 11,800,000, 160 m² built + 140 m² sukkah balcony (`balconySqm`, shown in key facts).
- These corrections now live in the desk (overrides.json is emptied by import-desk).

## Review doc for 2026-10-08 — START HERE
- Aryeh's review doc (Claude Docs): https://claude.ai/code/artifact/bed99f8f-c8a0-4871-b76e-fd1ac8eadbca — every site/CRM part with a Status dropdown (Looks good / Fix / Not sure) and his notes. Read it first (docs connector) and work through his Fix rows; also answer his reply to the comment on "Decisions and next steps".

## Background redesign (in progress — resume here, 2026-10-07)
- Aryeh finds the plain light background boring. Temporary comparison page `public/_demos/backgrounds.html` (switcher Current/A/B over an iframe of the site, CSS injected; NOT part of the design — delete once he chooses, and don't ship it).
- Rejected: limestone grain / golden-hour glows (too subtle, too similar); stone + mosaic strips + Old City battlements, Armenian tile pattern (didn't like either); full dark "Jerusalem at Night" fixed photo (not chosen).
- He wants "cool and unique", noticeable, dark-luxury leaning. He LIKES the gold light that follows the cursor (asked for it smaller and bolder: now 300px circle, gold alpha .32 dark / .44 light, via `background-attachment: fixed` radial at --sx/--sy).
- Last round (no decision): A = current light colours + gold cursor light + gold hairlines; B = sections alternate light and midnight (#0D0F13 with gold dust), cursor light on both. My recommendation was B. Next time: show new options as demos first — never change the real design before he picks.
- Local preview: `../_tools/node/bin/node node_modules/astro/bin/astro.mjs dev --port 4321` → http://localhost:4321 (and /_demos/backgrounds.html).
- Still open: King George listing street number 33 vs 35.
- Local Node: `../_tools/node/bin` (not in git). Dev server: `node node_modules/astro/bin/astro.mjs dev --port 4321`.
- Next: build, pixel-polish pass at 1440/1024/768/390 in EN+HE, redeploy demo (ask Aryeh before pushing).

- Property numbers are DISPLAYED with a "300" prefix (`propNo(id)` in i18n.js and the desk: #16 → 30016, #2 → 3002), per Aryeh 2026-10-08. Stored ids, slugs and URLs are unchanged.

## Holy City Desk = the website back end (since 2026-10-08) — listings are edited HERE, not in Grist
- Artifact: https://claude.ai/artifact/H1YNsibWYML7FPVQQpxUR7 — source `../holy-city-desk/index.html` (term lists from glossary.js are inlined as `S.vocab` — a fetch of vocab.json failed in the live desk and blanked the type field; keep them inline — `photos/<hash>-800.webp` copies of existing site photos). Capabilities db + assets. Aryeh asked for "not even a CRM, just a back end"; the old CRM collections were emptied.
- db: `properties/<id>` = one doc per listing {id, slug, show, deal(sale|rent|short-term), state(available|sold|rented), featured, newProject, title{en,he}, price, rooms, bedrooms, sizeSqm, balconySqm, floor, type, neighborhood (English; Hebrew from glossary or neighborhoodHe), street{en,he}, features[en], description{en,he}{lead,body,note}, photos[{src:"photos/<hash>"}|{asset:"<id>"}], geo, date, updatedAt}. `meta/publish` {lastPublishedAt, requestedAt, removed[]}.
- PUBLISH (when Aryeh says "publish the website"):
  1. `ArtifactData list properties` with `out_dir=<scratch>/desk-export` (limit 200).
  2. For each photo `{asset}` not yet on the site: `Artifact read url=<desk> path=<asset id> out_dir=<scratch>/desk-assets`.
  3. `node scripts/import-desk.mjs --dir <scratch>/desk-export --assets <scratch>/desk-assets` (writes properties.json, empties overrides.json, redirect map; reports listings missing map positions → add to data/geocode.json).
  4. Build demo (see Hosting), check pages, push `dist` to `main` (needs GitHub sign-in; not set up yet).
  5. `ArtifactData update meta/publish {lastPublishedAt: now, removed: []}` and clear `isNew` on new listings.
- Flyers (desk "Flyer" button): poster design copied from Aryeh's example (2026-10-08) — 2:3, laid out on a 1024×1536 grid drawn at 1080×1620: dark brown textured bg + double cream frame; main photo with tab (FOR RENT/SALE/…), title in Cinzel caps + "AREA | JERUSALEM", price block (₪ in Heebo/Jost, note line e.g. "Per Month + Utilities", size + entry); parchment panel with 4 photos (+ optional captions), ABOUT THE PROPERTY text, 4 icon highlights (beds, baths or size, then features), address; footer logo / CONTACT US / phone / www.holycity-realestate.com. Same for sale and rent (only the tab differs). Hebrew mirrors; phone/web stay LTR. Per-property flyer wording saved in `properties/<id>.flyer.{en,he}` {priceNote, entry, about, captions[4]}. New `bathrooms` field in the editor.
- `scripts/import-grist.mjs` is the old path; don't run it unless Aryeh goes back to Grist (it would overwrite desk edits).

## Backlog Aryeh liked
Listing brochures / social images, lead forms to Gmail, price-reduced badge, favorites, video/3D tours, mortgage & purchase-tax calculator, neighborhood guides, visitor stats, WordPress/Houzez trial site.
