import { test, expect } from "@playwright/test";

test('brand icon exports, manifest and social image are served', async ({page}) => {
  await page.goto('/');
  const iconLinks = await page.locator('link[rel="icon"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(iconLinks).toEqual(['./brand/favicon.ico?v=20261011', './brand/favicon.svg?v=20261011']);
  const manifest = await page.evaluate(async () => (await fetch('./site.webmanifest?v=20261011')).json());
  expect(manifest.name).toBe('MILONO');
  expect(manifest.icons.map(icon => icon.sizes)).toEqual(['192x192','512x512']);
  for (const [file, width, height] of [['favicon-16.png',16,16],['favicon-32.png',32,32],['favicon-48.png',48,48],['apple-touch-icon.png',180,180],['icon-192.png',192,192],['icon-512.png',512,512],['og-image.png',1200,630]]) {
    const dimensions = await page.evaluate(async file => {
      const img = new Image(); img.src = '/brand/' + file; await img.decode();
      return [img.naturalWidth,img.naturalHeight];
    }, file);
    expect(dimensions).toEqual([width,height]);
  }
  const ico = await page.evaluate(async () => {
    const buffer = await (await fetch('/favicon.ico')).arrayBuffer();
    const view = new DataView(buffer);
    return {type:view.getUint16(2,true), count:view.getUint16(4,true), sizes:[view.getUint8(6),view.getUint8(22),view.getUint8(38)]};
  });
  expect(ico).toEqual({type:1,count:3,sizes:[16,32,48]});
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://milono.xyz/brand/og-image.png?v=20261011');
});

test('brand tokens, selection and keyboard focus preserve contrast', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(0, 0, 0)');
  await expect(page.locator('.intro p')).toHaveCSS('color','rgb(243, 236, 228)');
  await expect(page.locator('.alive-dot')).toHaveCSS('background-color','rgb(206, 98, 65)');
  await expect(page.locator('.terminal')).toHaveCSS('background-color','rgb(0, 0, 0)');
  await page.locator('#terminal-input').focus();
  await expect(page.locator('#terminal-input')).toHaveCSS('outline-color','rgb(206, 98, 65)');
  await expect(page.locator('#terminal-input')).toHaveCSS('outline-style','solid');
  await page.locator('.weight-cell').nth(20).click();
  await expect(page.locator('.weight-cell').nth(20)).toHaveCSS('background-color','rgb(206, 98, 65)');
});

test('neural animation, region hover/pin and real slider drag remain functional', async ({page}) => {
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const canvas=page.locator('#body-canvas'); await canvas.scrollIntoViewIfNeeded();
  const first=await canvas.evaluate(el=>el.toDataURL());
  await expect.poll(()=>canvas.evaluate(el=>el.toDataURL())).not.toBe(first);
  const point=await canvas.evaluate(el=>{
    const {data,width,height}=el.getContext('2d').getImageData(0,0,el.width,el.height);
    for(let y=height*.2|0;y<height*.8;y++) for(let x=width*.15|0;x<width*.85;x++) {
      const i=(y*width+x)*4;
      if(data[i+3]>80 && data[i]>150) return {x:x*el.clientWidth/width,y:y*el.clientHeight/height};
    }
  });
  expect(point).toBeTruthy();
  await canvas.hover({position:point});
  await expect(page.locator('.lab-probe')).toHaveClass(/is-visible/);
  await canvas.click({position:point});
  await expect(page.locator('#node-inspector')).toBeVisible();
  const slider=page.locator('#stress-latency'); await slider.scrollIntoViewIfNeeded();
  const box=await slider.boundingBox();
  await page.mouse.move(box.x+box.width*.31,box.y+box.height/2);
  await page.mouse.down(); await page.mouse.move(box.x+box.width*.82,box.y+box.height/2,{steps:12}); await page.mouse.up();
  expect(Number(await slider.inputValue())).toBeGreaterThan(75);
  expect(await slider.evaluate(el=>parseFloat(el.style.getPropertyValue('--range-fill')))).toBeGreaterThan(75);
  expect(errors).toEqual([]);
});

test("milono public brand and official social links", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("milono — Fluid Cryptographic Organism");
  await expect(page.locator(".brand")).toHaveText("milono");
  await expect(page.locator("footer")).toContainText("milono");
  await expect(page.locator(".intro")).toContainText("milono");
  await expect(page.locator(".specimen-label")).toHaveText("milono / SPECIMEN 001");
  await expect(page.locator(".terminal-form label")).toHaveText("milono@organism:~$");
  await expect(page.locator("#terminal-output")).toContainText("milono RESEARCH CONSOLE");
  for (const [name, href] of [["X", "https://x.com/Milono_sol"], ["GitHub", "https://github.com/theovarne/milono"]]) {
    const link = page.getByRole("link", { name: "milono on " + name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute("content", "milono is a fluid cryptographic organism with mutable form and persistent identity.");
  }
  expect(await page.locator("body").innerText()).not.toMatch(/\b(?:milno|ameba)\b/i);
  expect(await page.locator("body").innerText()).not.toMatch(/\bMILONO\b/);
  await expect(page.locator(".specimen-label")).toHaveCSS("text-transform", "none");
  await page.locator('[data-specimen="B"]').click();
  await expect(page.locator(".specimen-label")).toHaveText("milono / SPECIMEN 002");
  expect(await page.locator("body").innerText()).not.toMatch(/\bMILONO\b/);
});

for (const legacyKey of ["milno.simulation.v2", "ameba.simulation.v2"]) {
  for (const current of ["missing", "corrupt", "valid"]) {
    test("storage migration: " + legacyKey + " / new " + current, async ({ page }) => {
      await page.goto("/");
      const before = await page.evaluate(({ legacyKey, current }) => {
        const provider = window.Milono.provider;
        provider.enterTun();
        const legacy = provider.getState();
        const newer = { ...legacy, epoch: legacy.epoch + 7, reserve: 73 };
        localStorage.clear();
        localStorage.setItem(legacyKey, JSON.stringify(legacy));
        if (current === "corrupt") localStorage.setItem("milono.simulation.v2", "{invalid");
        if (current === "valid") localStorage.setItem("milono.simulation.v2", JSON.stringify(newer));
        return { legacy, newer, root: provider.getSpecimen().root };
      }, { legacyKey, current });
      await page.reload();
      await expect(page.locator("#live-state")).toHaveText("TUN");
      const after = await page.evaluate(legacyKey => ({
        state: window.Milono.provider.getState(),
        saved: JSON.parse(localStorage.getItem("milono.simulation.v2")),
        legacy: JSON.parse(localStorage.getItem(legacyKey)),
        root: window.Milono.provider.getSpecimen().root,
        identity: window.Milono.provider.getSpecimen().identity
      }), legacyKey);
      expect(after.state).toEqual(current === "valid" ? before.newer : before.legacy);
      expect(after.saved).toEqual(after.state);
      expect(after.legacy).toEqual(before.legacy);
      expect(after.root).toBe(before.root);
      expect(after.identity).toBe("did:milono:7F2A91C4");
    });
  }
}

test("unavailable storage does not crash the console", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
    Storage.prototype.setItem = () => { throw new Error("blocked"); };
  });
  await page.goto("/");
  await expect(page.locator("#live-state")).toHaveText("ACTIVE");
  await page.locator("#terminal-input").fill("enter tun");
  await page.locator("#terminal-input").press("Enter");
  await expect(page.locator("#live-state")).toHaveText("TUN");
  expect(errors).toEqual([]);
});
