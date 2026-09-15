import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('project filters narrow the gallery and restore all four projects', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Business systems', exact: true }).click();
  await expect(page.locator('[data-category]:visible')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Programme & Project Monitoring' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Commitment & Expenditure Approval' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly Budget Planner' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Business systems', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'All projects', exact: true }).click();
  await expect(page.locator('[data-category]:visible')).toHaveCount(4);
});

test('mobile menu works with navigation and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#work$/);
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('case studies, local assets, anchors and CV resolve', async ({ page, request }) => {
  for (const route of ['/', '/projects/education-dashboard.html', '/projects/budget-planner.html', '/projects/ppms.html', '/projects/ceaf.html', '/404.html']) {
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const targets = await page.locator('a[href], img[src], link[rel="stylesheet"], script[src]').evaluateAll(nodes => nodes.map(n => n.href || n.src).filter(Boolean));
    for (const target of [...new Set(targets)]) {
      if (!target.startsWith('http://127.0.0.1:4173')) continue;
      const url = new URL(target);
      const result = await request.get(url.href);
      expect(result.status(), `${route}: ${target}`).toBe(200);
      if (url.hash && url.pathname === new URL(page.url()).pathname) expect(await page.locator(url.hash).count(), target).toBe(1);
    }
  }
  const pdf = await request.get('/assets/docs/Thembelani-Nofumba-CV.pdf');
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('layouts fit mobile, tablet and desktop and pass accessibility checks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/projects/education-dashboard.html']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test('core content and project links remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('[data-category]:visible')).toHaveCount(4);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work', exact: true })).toBeVisible();
  await page.locator('a[href="projects/budget-planner.html"]').first().click();
  await expect(page).toHaveURL(/budget-planner.html$/);
  await context.close();
});
