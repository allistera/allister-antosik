import { test, expect } from '@playwright/test';

test.describe('Open source projects', () => {
  test('TC-F2-01: project cards are present without client-side JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto('/');

    const cards = page.locator('#projects-list .project-card');
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toContainText('monzo-mcp');
    await expect(cards.first()).toContainText('Language: TypeScript');
    await context.close();
  });

  test('TC-F2-02: viewing projects does not load HTMX or a project fragment', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));

    await page.goto('/');
    await page.locator('#projects-list').scrollIntoViewIfNeeded();
    await expect(page.locator('#projects-list .project-card')).toHaveCount(6);

    expect(requests.some(url => url.includes('/vendor/htmx'))).toBe(false);
    expect(requests.some(url => url.includes('/api/projects'))).toBe(false);
  });

  test('TC-F2-03: project descriptions preserve paragraphs and links', async ({ page }) => {
    await page.goto('/');

    const monzo = page.locator('.project-card', { hasText: 'monzo-mcp' });
    await expect(monzo.locator('.project-description p')).toHaveCount(2);

    const bookmark = page.locator('.project-card', { hasText: 'Bookmark-AI' });
    await expect(bookmark.locator('.project-description a')).toHaveAttribute(
      'href',
      'https://github.com/allistera/Bookmark-AI',
    );
  });
});
