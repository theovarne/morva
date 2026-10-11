import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch({executablePath:process.env.AMEBA_CHROME});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto("http://127.0.0.1:4184/");
await page.waitForFunction(() => window.AmebaOrganism?.views.length === 11);
await page.evaluate(() => {
  const holder = document.createElement("div");
  holder.id = "share-export";
  Object.assign(holder.style, { position: "fixed", inset: "0 auto auto 0", width: "1200px", height: "630px", zIndex: "99999", background: "#000", color: "#e6e6e6", fontFamily: "monospace" });
  holder.innerHTML = '<div style="position:absolute;left:64px;top:52px;font-size:22px;letter-spacing:3px">AMEBA</div><canvas id="share-canvas" style="position:absolute;left:330px;top:25px;width:540px;height:450px"></canvas><div style="position:absolute;top:495px;width:100%;text-align:center;font-size:23px;letter-spacing:1px">MUTABLE IN FORM. PERSISTENT IN IDENTITY.</div><div style="position:absolute;top:545px;width:100%;text-align:center;font-size:11px;letter-spacing:3px;color:#89988e">A FLUID CRYPTOGRAPHIC ORGANISM</div>';
  document.body.append(holder);
  const view = new AmebaOrganism.View(document.getElementById("share-canvas"), { specimen: "A", mode: "ACTIVE" });
  view.update(Ameba.provider.getState(), 1); view.draw();
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator("#share-export").screenshot({ path: "dist/assets/ameba-share.png" });
await page.reload();
await page.waitForFunction(() => window.AmebaOrganism?.views.length === 11);
for (const [name, selector] of [["hero", ".logo"], ["body", ".body-section"], ["stress", ".stress-chamber"], ["states", ".states"], ["comparison", ".comparison-section"]]) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.locator(selector).screenshot({ path: "qa/amoeba-" + name + ".png" });
}
await browser.close();
