import { chromium } from '@playwright/test';
const browser = await chromium.launch({ executablePath: process.env.MILONO_CHROME });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1250 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('https://www.ameba.life/', { waitUntil: 'networkidle' });
  if (response.status() !== 200) throw new Error(`Site returned ${response.status()}`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
  });
  await page.waitForFunction(() => window.Milono?.provider && document.querySelector('#live-state')?.textContent.trim());
  await page.screenshot({ path: 'qa/readme-preview-live.png' });
  console.log(JSON.stringify({ url: page.url(), title: await page.title(), errors,
    logo: await page.locator('.logo img').getAttribute('src'),
    screenshot: 'qa/readme-preview-live.png', viewport: page.viewportSize() }));
  if (errors.length) throw new Error('Production browser errors found');
} finally { await browser.close(); }
