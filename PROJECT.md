# Bloggy architecture

Bloggy is a statically generated Astro 7 portfolio and MDX blog. Vercel serves the generated files; there is no application server or database at runtime.

## Main data flows

- `src/pages/index.astro` renders the homepage and project cards at build time. Project content is maintained in `src/components/ProjectCards.astro` and needs no browser request.
- `src/content/blog/` contains MDX posts. Astro's content collection validates frontmatter, filters unpublished posts, and generates the blog index, post routes, RSS feed, sitemap entries, and JSON-LD metadata.
- `src/data/carousel.json` is imported by `src/components/Carousel.astro` during the build. The component renders complete slide HTML; the lazy client module in `src/scripts/carousel.ts` only adds navigation and the screenshot dialog.
- Pagefind indexes the generated `dist/` directory after the Astro build. Its browser component loads only when the user opens search.
- Sentry is optional. The integration and application telemetry entry point are included only when `PUBLIC_SENTRY_DSN` is set at build time.

## Runtime boundaries

The browser receives static HTML, CSS, images, and small interaction modules. The carousel module loads when its section approaches the viewport, and Pagefind loads on search interaction. No authentication, tenant data, uploads, background jobs, server endpoints, or runtime GitHub API calls exist.

## Source layout

```text
src/
├── components/       Astro UI components
├── content/blog/     MDX posts
├── data/             Build-time carousel data
├── layouts/          Shared document layout
├── lib/              Content, SEO, schema, and telemetry helpers
├── pages/            Static routes and RSS
├── scripts/          Lazy browser interaction modules
└── styles/           Global Tailwind styles
tests/                Playwright browser tests
```

See `README.md` for setup, deployment, monitoring, and validation commands.
