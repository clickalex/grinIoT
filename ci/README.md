# ci/

Deployment pipeline for the Grinrex IoT static site.

| File | Purpose |
| --- | --- |
| `deploy.yml` | GitHub Actions workflow that builds and publishes the SPA to GitHub Pages. |
| `build-pages.sh` | Builds the client into `dist/public` with the correct Vite `base` path, adds a `404.html` SPA fallback and `.nojekyll`. |

## Installing the workflow

`deploy.yml` lives here because the CI bot token used to open this PR is not
allowed to write under `.github/workflows/`. To activate it, move it into place
and push from an account with workflow permissions:

```bash
git mv ci/deploy.yml .github/workflows/deploy.yml
git rm .github/workflows/static.yml   # superseded: it published the repo unbuilt
```

Then in **Settings → Pages → Build and deployment → Source**, choose
**GitHub Actions**.

## Running the build locally

```bash
ci/build-pages.sh /grinIoT/     # same output as CI
pnpm exec vite preview          # serve dist/public
```

## What the workflow does

1. `build` job — checkout, corepack/pnpm with cache, `pnpm install --frozen-lockfile`,
   `pnpm check`, `pnpm test:smoke`, `pnpm test:interact`, `actions/configure-pages`,
   then `ci/build-pages.sh` with the base path Pages reports, and uploads
   `dist/public` as the Pages artifact.
2. `deploy` job — `actions/deploy-pages` and prints the live URL.
