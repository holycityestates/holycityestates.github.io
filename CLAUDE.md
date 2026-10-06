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
- Demo publish is prepared (dist built with local photos, CNAME removed, robots Disallow) but NOT pushed: needs Aryeh's explicit "publish the demo". A stale `.git/HEAD.lock` blocked the commit.
- Local Node: `../_tools/node/bin` (not in git). Dev server: `node node_modules/astro/bin/astro.mjs dev --port 4321`.
- Next: build, pixel-polish pass at 1440/1024/768/390 in EN+HE, redeploy demo (ask Aryeh before pushing).

## Holy City Desk (back office)
- Artifact: https://claude.ai/artifact/H1YNsibWYML7FPVQQpxUR7 — source `../holy-city-desk/index.html` (+ `listings.json`, `thumbs/<id>.webp` exported from `src/data/properties.json`; re-export and republish when listings change). Capabilities db + assets.
- db collections: leads (with `log` array), viewings, owners, listingMeta/<listingId> (desk status, owner, exclusivity, commission, private notes), drafts (new listings, photo asset ids, state draft|ready|published), tasks. Seeded 6 docs marked `example: true` (page has "Remove examples").
- "Publish" of drafts is manual for now: when a draft is `ready`, Claude reads it via ArtifactData and adds it to Grist/site.

## Backlog Aryeh liked
Listing brochures / social images, lead forms to Gmail, price-reduced badge, favorites, video/3D tours, mortgage & purchase-tax calculator, neighborhood guides, visitor stats, WordPress/Houzez trial site.
