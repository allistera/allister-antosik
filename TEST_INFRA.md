# Test infrastructure

Bloggy uses Vitest for unit tests and Playwright for browser tests. The test files are the source of truth for current cases; this document records how to run them and the behaviours they cover.

## Commands

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm test
```

`npm test` runs Chromium, Firefox, WebKit, mobile Chrome, and mobile Safari projects from `playwright.config.ts`. Playwright serves the production output at `http://localhost:4321`; install missing browser binaries with `npx playwright install`.

For focused work:

```bash
npx playwright test tests/carousel.spec.ts --project=chromium
npm run test:e2e:ui
npm run test:e2e:debug
npm run test:e2e:report
```

## Coverage

- `portfolio.spec.ts` and `verify.spec.js`: homepage content, navigation, metadata, responsive layout, and keyboard access.
- `projects.spec.ts`: static project cards, no-JavaScript rendering, links, and absence of runtime project requests.
- `carousel.spec.ts`: progressive enhancement, controls, touch targets, image fallback, modal focus, and lazy-module failure recovery.
- `blog.spec.ts`: published content, filtering, article rendering, metadata, mobile table overflow, and 404 behaviour.
- `performance.spec.ts`: lazy loading boundaries, search retry behaviour, responsive images, static projects, and telemetry exclusion.
- `combinations.spec.ts` and `scenarios.spec.ts`: cross-feature and real-world interaction paths.

Network failures are isolated with Playwright routing. Tests use the repository's generated content and assets unless the failure itself requires a mocked response.
