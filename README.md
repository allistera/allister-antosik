# Allister Antosik

Personal portfolio and blog: [allisterantosik.com](https://allisterantosik.com)

Built with [Astro](https://astro.build), Tailwind CSS, MDX, and Pagefind.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` runs Astro, then [Pagefind](https://pagefind.app) to index `dist/` for site search. Search is available in the header after a production build (dev server has no index until you build once).

## Deploy (Vercel)

This project uses [`@astrojs/vercel`](https://docs.astro.build/en/guides/integrations-guide/vercel/).

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Deploy with defaults (`npm run build`; adapter writes `.vercel/output`)
3. Attach `allisterantosik.com` under Project → Settings → Domains

Or from the CLI:

```bash
npx vercel
npx vercel --prod
```

## Sentry

Error monitoring via [`@sentry/astro`](https://docs.sentry.io/platforms/javascript/guides/astro/).

1. Create a Sentry project (platform: **Astro** / JavaScript) named `bloggy`
2. Copy `.env.example` → `.env` and set:
   - `PUBLIC_SENTRY_DSN` / `SENTRY_DSN` — project DSN
   - `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT=bloggy` — source map upload
3. On Vercel, add the same env vars for Production (and Preview if desired)

Config files: `sentry.client.config.ts`, `sentry.server.config.ts`, and the conditional `sentry()` integration in `astro.config.mjs`. When `PUBLIC_SENTRY_DSN` is empty, Sentry and the application telemetry entry point are excluded from the browser build.

**Logs & metrics** are opt-in by usage (Sentry 11 removed `enableLogs` / `enableMetrics`); `dataCollection` is set to the restrictive v10 defaults so no user IPs, cookies, headers, bodies, or query strings are collected:

- Console calls are forwarded via `consoleLoggingIntegration`
- Page views and carousel navigation emit `Sentry.logger` + `Sentry.metrics`
- Node runtime metrics on the server (`nodeRuntimeMetricsIntegration`)
- App helpers live in `src/lib/telemetry.ts`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright install
npm test
```

`npm run typecheck` uses the native TypeScript 7 compiler. Astro and MDX
template checking still requires upstream support for the TypeScript 7 compiler
API; the current check covers the repository's TypeScript and JavaScript files.

See [PROJECT.md](PROJECT.md) for the current architecture and data flows.
