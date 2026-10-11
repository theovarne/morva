import { test, expect } from "@playwright/test";

test("optimized tardigrade console, live links and no retired contract addresses", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto("/");
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle("milono — Fluid Cryptographic Organism");
  await expect(page.locator(".brand")).toHaveText("milono");
  await expect(page.locator(".ca")).toHaveText("CA: 8HzSYtmSxBPQqCDevZHWY5DJvKRB25Lvh7vYYoK2pump");
  await expect(page.locator(".logo img")).toHaveAttribute("src", "./brand/milono-mark.png");
  expect(await page.locator(".logo img").evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "./brand/favicon.svg?v=20261011");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://milono.xyz/");
  await expect(page.locator('a[aria-label="milono on GitHub"]')).toHaveAttribute("href", "https://github.com/theovarne/milono");
  await expect(page.locator('a[aria-label="milono on X"]')).toHaveAttribute("href", "https://x.com/Milono_sol");
  await page.waitForFunction(() => Boolean(window.Milono?.provider));
  await expect(page.locator('script[src="./assets/amoeba.js"]')).toHaveCount(0);
  await expect(page.locator(".weight-cell")).toHaveCount(256);
  await expect(page.locator("#live-title")).toHaveText("Live specimen");
  await expect(page.locator(".lore")).toContainText("The tardigrade is the water bear.");
  const html = await page.content();
  for (const ca of ["Du8TzQun4vnrSGncRzhsPbRYyKQUFJ5QP7dQ5Mu7pump", "4cjLraGqbJciiaRbW8UFvntta84eBMeZ53zXB43Kpump"]) expect(html).not.toContain(ca);
  for (const path of ["/brand/milono-mark.png", "/assets/styles.css", "/assets/organism.js", "/assets/visuals.js", "/robots.txt", "/sitemap.xml"]) {
    expect(await page.evaluate(async path => (await fetch(path)).ok, path)).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

for (const width of [375, 768, 1366, 1440, 1920]) {
  test(`tardigrade layout fits ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1366 ? 768 : width === 1920 ? 1080 : 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect(page.locator(".logo img")).toBeVisible();
    await expect(page.locator(".links")).toBeVisible();
    const mark = await page.locator('.brand img').boundingBox();
    expect(mark.height).toBeGreaterThanOrEqual(28);
    expect(mark.height).toBeLessThanOrEqual(40);
    expect(mark.width / mark.height).toBeCloseTo(1.5);
  });
}

async function command(page, value) {
  await page.locator("#terminal-input").fill(value);
  await page.locator("#terminal-input").press("Enter");
}

test("optimized terminal and stress controls update the shared lifecycle and history", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.Milono?.provider));
  const identity = await page.locator("#live-identity").innerText();
  await command(page, "stress 1");
  await expect(page.locator("#live-state")).toHaveText("TUN");
  await expect(page.locator("#metabolism-mode")).toHaveText("SUSPENDED");
  await expect(page.locator("#wake-button")).toBeDisabled();
  await command(page, "stress 0");
  await expect(page.locator("#wake-button")).toBeEnabled();
  await page.locator("#wake-button").click();
  await expect(page.locator("#live-state")).toHaveText("ACTIVE");
  await expect(page.locator("#live-identity")).toHaveText(identity);
  await command(page, "inspect history");
  await expect(page.locator("#terminal-output")).toContainText("TUN->ACTIVE");
  await page.locator("#ledger-previous").click();
  await command(page, "inspect");
  await expect(page.locator("#terminal-output")).toContainText("TRANSITION");
});

test("optimized specimen, fingerprint and proof inspectors work", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-specimen="B"]').click();
  await expect(page.locator("#live-identity")).toContainText("9C81");
  await expect(page.locator("#comparison-name")).toContainText("SPECIMEN B");
  await page.locator(".weight-cell").nth(20).click();
  await command(page, "inspect");
  await expect(page.locator("#terminal-output")).toContainText("W[20]");
  await expect(page.locator("#terminal-output")).toContainText("STABILITY");
  await page.locator("#verify-proof").click();
  await expect(page.locator("#proof-result")).toHaveText("LOCAL PASS", { timeout: 10000 });
  await command(page, "inspect identity");
  await expect(page.locator("#terminal-output")).toContainText("did:milono:9C81BE30");
});
