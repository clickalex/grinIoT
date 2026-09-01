# Grinrex IoT — Signal Garden

A modular, water-intelligent operating system for urban gardens. The site is a
pure client-side React SPA (Vite + React + Tailwind + wouter) with a live,
fully simulated 14-page demo section — no backend required.

## Local development

```bash
corepack enable        # makes pnpm available
pnpm install
pnpm dev               # http://localhost:3000
```

## The live demo

Fourteen pages, one shared simulation (`client/src/demo/`). The tab bar groups them:

| Group               | Pages                                              |
| ------------------- | -------------------------------------------------- |
| Garden loop         | Overview, Zones, Irrigation, Tank & water, Harvest |
| Garden intelligence | Weather, Camera, Fertilizer, Tasks                 |
| System & evidence   | Rules, Devices, Alerts, Analytics, Settings        |

Nothing on those pages is a screenshot: the tick engine in `simulation.ts` drives
soil decay, weather, rain harvesting, the rule engine (windows, cycle limits,
rain hold-over, freeze guard, dry-run), tank safety cutoffs, device battery/radio/
firmware and faults, fertilizer dosing, camera captures with human-confirmed pest
review, and generated garden tasks. `GardenProvider` holds that state once for all
demo pages, so a change made on Rules is visible on Overview, and every action is
written to the shared event log. The page list lives in one place —
`client/src/demo/sections.ts` — which feeds the tab bar, the footer, and the tests.

The demo runs inside a nested wouter route (`<Route path="/demo" nest>`), which resolves every
`Link` against `/demo`. So links _between_ demo pages are relative (`demoLink("/zones")` → the
browser gets `#/demo/zones`), while links _into_ the demo from the marketing pages carry the
prefix (`demoHref("/zones")`). Getting that backwards renders `#/demo/demo/zones`, which lands on
the 404 page — `pnpm test:smoke` fails loudly if any demo link does it.

## Tests

```bash
pnpm check             # TypeScript
pnpm test:smoke        # renders every route in jsdom and asserts content (24 routes)
pnpm test:interact     # drives the demo controls in jsdom (50 checks)
pnpm test:audit        # 156 data checks: the sim moves, every page renders it live, tabs link through
```

## Deploy to GitHub Pages (demo)

The repo ships with a ready-made GitHub Actions workflow:
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It builds the
app with Vite and publishes `dist/public` to GitHub Pages on every push.

### One-time setup

1. In the GitHub repo go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That is it. Every push to `main` (or a manual run from the **Actions** tab)
builds and deploys the site to:

**https://clickalex.github.io/grinIoT/**

The workflow prints the live URL at the end of the "Deploy to GitHub Pages"
job.

### How all pages work on Pages

GitHub Pages only serves static files, so routing is handled two ways:

- **Hash routes** — the app uses wouter's `useHashLocation`, so all pages live
  under one document: `/grinIoT/#/demo`, `/#/demo/zones`, `/#/system`, …
  Every page loads, refreshes, and deep-links correctly with no server.
- **Clean-URL fallback** — `client/public/404.html` rewrites clean URLs such as
  `/grinIoT/demo/zones` to their hash equivalent, in case a clean link is
  pasted directly.

### Renaming or forking the repo

If the repo is renamed or forked, change the base path in one place:
edit `VITE_BASE_PATH` in `.github/workflows/deploy.yml` to `/new-repo-name/`
(and the `base` value inside `client/public/404.html`).

### Demo URL list

| Page              | URL                  |
| ----------------- | -------------------- |
| Home              | `/#/`                |
| Problem           | `/#/problem`         |
| System            | `/#/system`          |
| Capabilities      | `/#/capabilities`    |
| Platform          | `/#/platform`        |
| Roadmap           | `/#/roadmap`         |
| Safety            | `/#/safety`          |
| Commercial        | `/#/commercial`      |
| Investor          | `/#/investor`        |
| Documents         | `/#/documents`       |
| Demo overview     | `/#/demo`            |
| Demo zones        | `/#/demo/zones`      |
| Demo irrigation   | `/#/demo/irrigation` |
| Demo tank & water | `/#/demo/water`      |
| Demo harvest      | `/#/demo/harvest`    |
| Demo weather      | `/#/demo/weather`    |
| Demo camera       | `/#/demo/camera`     |
| Demo fertilizer   | `/#/demo/fertilizer` |
| Demo tasks        | `/#/demo/tasks`      |
| Demo rules        | `/#/demo/rules`      |
| Demo devices      | `/#/demo/devices`    |
| Demo alerts       | `/#/demo/alerts`     |
| Demo analytics    | `/#/demo/analytics`  |
| Demo settings     | `/#/demo/settings`   |

Prefix each path with `https://clickalex.github.io/grinIoT`.
