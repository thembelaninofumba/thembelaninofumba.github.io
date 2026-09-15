import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';

const server = spawn(process.execPath, ['tools/serve.mjs'], { windowsHide: true, stdio: ['ignore', 'pipe', 'inherit'] });
let browser;
try {
  await once(server.stdout, 'data');
  await mkdir('test-results/visual', { recursive: true });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [375, 768, 1440, 1600]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(images => images.forEach(img => { img.loading = 'eager'; }));
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
    await page.screenshot({ path: `test-results/visual/home-${width}.png`, fullPage: true });
    await page.locator('.hero').screenshot({ path: `test-results/visual/hero-${width}.png` });
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth,
      overflow: [...document.querySelectorAll('body *')].map(el => ({ tag: el.tagName, className: el.className, right: el.getBoundingClientRect().right, left: el.getBoundingClientRect().left })).filter(el => el.right > innerWidth + 1 || el.left < -1)
    }));
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    console.log(JSON.stringify({ width, layout, violations }));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:4173/projects/education-dashboard.html');
  await page.screenshot({ path: 'test-results/visual/case-desktop.png', fullPage: true });
  if (process.argv.includes('--public-app')) {
    const response = await page.goto('https://monthly-budget-planner-yfgjesuspchtoocycbz448.streamlit.app/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByText(/budget|sleep|wake|sign in/i).first().waitFor({ timeout: 15000 }).catch(() => {});
    console.log(JSON.stringify({ publicApp: page.url(), status: response.status(), title: await page.title(), text: (await page.locator('body').innerText()).slice(0, 1800) }));
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
