import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sentry from '@sentry/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { getBlogLastmod } from './src/lib/blog-lastmod.mjs';

const blogLastmod = getBlogLastmod(new URL('./src/content/blog/', import.meta.url));
const env = {
  ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''),
  ...process.env,
};
const sentryEnabled = Boolean(env.PUBLIC_SENTRY_DSN);

// https://astro.build/config
export default defineConfig({
  site: 'https://allisterantosik.com',
  trailingSlash: 'always',
  adapter: vercel(),
  // Explicit Shiki syntax highlighting for Markdown + MDX (not Prism)
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Dark theme aligned with zinc/emerald site chrome
      theme: 'github-dark-dimmed',
      wrap: true,
      // Use Shiki defaults (full bundle) — explicit lang list breaks MDX blocks
      // like ```env which Shiki doesn't have. Keep env as plaintext alias.
      langs: [],
      langAlias: { env: 'plaintext' },
    },
  },
  integrations: [
    mdx({
      // Inherit markdown.shikiConfig from the root markdown config
      syntaxHighlight: 'shiki',
    }),
    ...(sentryEnabled
      ? [sentry({
        // Runtime SDK options live in the sentry.*.config.ts files.
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT || 'bloggy',
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          disable: !env.SENTRY_AUTH_TOKEN,
        },
        telemetry: false,
      })]
      : []),
    sitemap({
      serialize(item) {
        const lastmod = blogLastmod.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
