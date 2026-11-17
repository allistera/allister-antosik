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

## Publish by email

An email from `me@allisterantosik.com` to `blog@allisterantosik.com` becomes a post. The subject is the title and the body, converted to Markdown, is the content. The post is committed to `main` as `src/content/blog/<title-as-slug>.md`, and Vercel deploys it like any other commit.

- The description is the opening paragraph and the date is the time the email arrived.
- Posts arrive without tags. Add them by editing the file.
- A title that is already taken is not overwritten, and nothing is published.
- Attachments and images embedded in the email are not published. Images linked by URL are kept.

The conversion runs in the `blog-email-publish` Cloudflare Worker, which lives in the [Cookie-Worker](https://github.com/allistera/Cookie-Worker) repository along with its setup notes.

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
