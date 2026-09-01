# Grinrex IoT — Signal Garden

A modular, water-intelligent operating system for urban gardens. The site is a
pure client-side React SPA (Vite + React + Tailwind + wouter) with a live,
fully simulated demo section — no backend required.

## Local development

```bash
corepack enable        # makes pnpm available
pnpm install
pnpm dev               # http://localhost:3000
```

## Tests

```bash
pnpm check             # TypeScript
pnpm test:smoke        # renders every route in jsdom and asserts content
pnpm test:interact     # drives the demo controls in jsdom
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

| Page              | URL                                        |
| ----------------- | ------------------------------------------ |
| Home              | `/#/`                                      |
| Problem           | `/#/problem`                               |
| System            | `/#/system`                                |
| Capabilities      | `/#/capabilities`                          |
| Platform          | `/#/platform`                              |
| Roadmap           | `/#/roadmap`                               |
| Safety            | `/#/safety`                                |
| Commercial        | `/#/commercial`                            |
| Investor          | `/#/investor`                              |
| Documents         | `/#/documents`                             |
| Demo dashboard    | `/#/demo`                                  |
| Demo zones        | `/#/demo/zones`                            |
| Demo irrigation   | `/#/demo/irrigation`                       |
| Demo water        | `/#/demo/water`                            |
| Demo analytics    | `/#/demo/analytics`                        |

Prefix each path with `https://clickalex.github.io/grinIoT`.
