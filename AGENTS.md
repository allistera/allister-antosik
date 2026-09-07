# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 7 static portfolio and blog deployed to Vercel. Application code lives in `src/`: reusable UI in `src/components/`, page routes in `src/pages/`, shared layout in `src/layouts/`, global styles in `src/styles/`, and telemetry helpers in `src/lib/` and `src/scripts/`. Blog posts are MDX files in `src/content/blog/`; update carousel entries in `src/data/carousel.json`. Browser tests live in `tests/`.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts the Astro development server.
- `npm run lint` runs ESLint across Astro, TypeScript, and JavaScript source files.
- `npm run typecheck` checks repository TypeScript and JavaScript with TypeScript 7.
- `npm run build` produces the production/Vercel output and builds the Pagefind index.
- `npm run preview` serves the production build locally.
- `npm test` (or `npm run test:e2e`) runs the Playwright suite across configured desktop and mobile browsers. Run `npx playwright install` once when browser binaries are missing.
- `npm run test:e2e:ui` opens Playwright's interactive test runner; `npm run test:e2e:report` opens its latest report.

Run `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run build` before completion, then run the relevant Playwright tests; run the full suite for cross-page or shared-component work.

## Coding Style & Naming Conventions

Use TypeScript and Astro components with two-space indentation, semicolons, and single quotes, matching existing files. Name components in PascalCase (for example, `Carousel.astro`); use lowercase route files and kebab-case MDX slugs such as `chaos-mesh-kubernetes.mdx`. Keep path aliases rooted at `@/` for `src/` imports. Prefer Tailwind utility classes and preserve the existing dark, monospace visual language.

## Testing Guidelines

Add or update Playwright coverage for visible behavior. Keep test files as `tests/<feature>.spec.ts` and use descriptive `TC-...` test names where extending the existing suites. Tests start a production build and preview server automatically; mock network data with `page.route` or the fixtures in `tests/helpers/mock-data.ts` instead of relying on live services.

## Commit & Pull Request Guidelines

Use short, imperative, sentence-case commit subjects, as in `Fix carousel 404 by using build-time JSON only`. Keep commits focused. PRs should explain the user-visible change, link the issue when applicable, list validation commands, and include screenshots for visual changes. Do not commit `.env` files or Sentry tokens; use `.env.example` and Vercel environment settings.
