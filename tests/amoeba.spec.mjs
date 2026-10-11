import { test, expect } from "@playwright/test";

const ca = "4cjLraGqbJciiaRbW8UFvntta84eBMeZ53zXB43Kpump";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.MilonoOrganism?.views.length === 11);
});
async function command(page, text) {
  await page.locator("#terminal-input").fill(text);
  await page.locator("#terminal-input").press("Enter");
}
test("renders all instruments, omits the retired CA, and loads local assets", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.reload();
  await expect(page.locator("header .ca")).toBeVisible();
  await expect(page.locator("header .ca")).toHaveText("CA：Du8TzQun4vnrSGncRzhsPbRYyKQUFJ5QP7dQ5Mu7pump");
  await expect(page.locator("#contract-address")).toHaveText("Du8TzQun4vnrSGncRzhsPbRYyKQUFJ5QP7dQ5Mu7pump");
  expect(await page.content()).not.toContain(ca);
  await expect(page.locator(".intro")).toContainText("Form mutates. Identity persists.");
  await expect(page.locator(".weight-cell")).toHaveCount(256);
  expect(await page.evaluate(() => MilonoOrganism.views.length)).toBe(11);
  for (const path of ["/assets/amoeba.js", "/assets/amoeba.svg"]) {
    // Use the actual browser network context, including its system proxy routing.
    expect(await page.evaluate(async url => (await fetch(url)).ok, path)).toBeTruthy();
  }
  expect(await page.locator("body").innerText()).not.toMatch(/tardigrade|water bear|animal/i);
  expect(errors).toEqual([]);
});
test("weights map to membrane regions and body inspection is keyboard accessible", async ({ page }) => {
  const cell = page.locator(".weight-cell").nth(180);
  const index = Number(await cell.getAttribute("data-index"));
  await cell.focus();
  await expect(page.locator("#weight-affects")).toContainText("W[" + index + "]");
  await expect(page.locator("#fingerprint-organism")).toHaveAttribute("data-region", String(Math.floor(index / 1536)));
  await cell.press("ArrowDown");
  expect(await page.evaluate(() => Number(document.activeElement.dataset.index)))
    .toBe(Number(await page.locator(".weight-cell").nth(196).getAttribute("data-index")));
  await page.locator("#body-canvas").focus();
  await page.locator("#body-canvas").press("ArrowRight");
  await page.locator("#body-canvas").press("Enter");
  await expect(page.locator("#node-inspector")).toBeVisible();
  await expect(page.locator("#node-inspector")).toContainText("motility bias");
  const stats = await page.evaluate(() => [MilonoOrganism.regionData("A", 1), MilonoOrganism.regionData("A", 1)]);
  expect(stats[0]).toEqual(stats[1]);
  expect(stats[0].variance).toBeGreaterThan(0);
});
test("stress compresses smoothly and waking preserves identity and fixed body weights", async ({ page }) => {
  const before = await page.evaluate(() => ({ identity: Milono.provider.getSpecimen().identity, root: Milono.provider.getSpecimen().root,
    weight: MilonoOrganism.weightAt("A", 271).value }));
  await page.locator("#stress-organism").scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    for (const [key,value] of Object.entries({latency:90,noise:90,compute:10,resource:10,pressure:90})) {
      const input = document.getElementById("stress-" + key); input.value = value; input.dispatchEvent(new Event("input", {bubbles:true}));
    }
  });
  await expect(page.locator("#survival-state")).toHaveText("TUN");
  const compact = await page.locator("#stress-organism").getAttribute("data-compact");
  expect(Number(compact)).toBeLessThan(1);
  await expect.poll(async () => Number(await page.locator("#stress-organism").getAttribute("data-compact"))).toBeGreaterThan(.95);
  await expect(page.locator("#wake-button")).toBeDisabled();
  await command(page, "inspect nucleus");
  await expect(page.locator("#terminal-output")).toContainText("PRESERVED");
  await command(page, "stress 0.15");
  await command(page, "wake");
  await expect(page.locator("#live-state")).toHaveText("ACTIVE");
  const after = await page.evaluate(() => ({ identity: Milono.provider.getSpecimen().identity, root: Milono.provider.getSpecimen().root,
    weight: MilonoOrganism.weightAt("A", 271).value }));
  expect(after).toEqual(before);
});
test("each specimen has a distinct form and direct selection stays predictable", async ({ page }) => {
  await page.locator(".specimen-tabs").scrollIntoViewIfNeeded();
  const shapes = await page.evaluate(() => MilonoOrganism.views.filter(v => v.options.specimen && v.options.mode).map(v => {
    v.clock = 0; v.draw(); return v.points.map(p => [p.x.toFixed(2),p.y.toFixed(2)]);
  }));
  expect(JSON.stringify(shapes[0])).not.toEqual(JSON.stringify(shapes[1]));
  expect(JSON.stringify(shapes[1])).not.toEqual(JSON.stringify(shapes[2]));
  await page.locator('[data-specimen="B"]').click();
  await expect(page.locator(".specimen-label")).toContainText("002");
  await page.locator('[data-specimen="C"]').click();
  await expect(page.locator(".specimen-label")).toContainText("003");
  await page.locator("#compare-toggle").click();
  await page.locator('[data-specimen="A"]').click();
  await expect(page.locator("#comparison-matrix")).toBeVisible();
  await expect(page.locator("#comparison-matrix")).toContainText("fingerprint");
  await expect(page.locator("#comparison-matrix")).toContainText("motility");
  await expect(page.locator(".specimen-label")).toContainText("003");
});
test("dead specimen fails proof, loses coherence, and cannot revive by switching individuals", async ({ page }) => {
  await page.locator('button[data-mode="DEAD"]').click();
  await page.locator("[data-death-confirm]").click();
  await expect(page.locator("#live-state")).toHaveText("DEAD");
  await page.locator("#verify-proof").click();
  await expect(page.locator("#proof-result")).toHaveText("LOCAL FAIL");
  await command(page, "inspect nucleus");
  await expect(page.locator("#terminal-output")).toContainText("coherence 0.0%");
  await command(page, "verify commitment");
  await expect(page.locator("#terminal-output")).toContainText("LOCAL FAIL");
  await page.locator('[data-specimen="B"]').click();
  await page.locator('[data-specimen="A"]').click();
  await expect(page.locator("#live-state")).toHaveText("DEAD");
  await page.reload();
  await expect(page.locator("#live-state")).toHaveText("DEAD");
});
test("terminal organism commands and local proof complete", async ({ page }) => {
  for (const term of ["inspect body","inspect membrane","inspect nucleus","inspect motility","inspect metabolism","inspect history"]) await command(page, term);
  await expect(page.locator("#terminal-output")).not.toContainText("unknown procedure");
  await expect(page.locator("#terminal-output")).toContainText("FLUID MEMBRANE");
  await page.locator("#verify-proof").click();
  await expect(page.locator("#proof-sequence .is-pass")).toHaveCount(5);
  await expect(page.locator("#proof-result")).toHaveText("LOCAL PASS");
});
test("reduced motion keeps low-amplitude life and responds to state changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForFunction(() => window.MilonoOrganism?.views.length === 11);
  const clock = await page.evaluate(() => MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism").clock);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism").clock)).toBeGreaterThan(clock);
  await page.locator("#live-suspend").click();
  await expect(page.locator("#hero-organism")).toHaveAttribute("data-mode","TUN");
  await expect(page.locator("#hero-organism")).toHaveAttribute("data-compact","1.000");
  await page.locator("#live-wake").click();
  await expect(page.locator("#hero-organism")).toHaveAttribute("data-mode","ACTIVE");
});
test("phone and tablet layouts keep all instruments in bounds", async ({ page }) => {
  for (const width of [320,390,768]) {
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for(const selector of [".body-section",".fingerprint-section",".stress-chamber",".states",".comparison-section"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      const box=await page.locator(selector).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width+1);
    }
  }
});

test("membrane breathes locally, smoothly, and without a short global loop", async ({ page }) => {
  const result = await page.evaluate(() => {
    const v = MilonoOrganism.views.find(v => v.canvas.id === "hero-organism");
    v.pointer = null; v.response.strength = 0;
    const radii = t => { v.clock = t; v.geometry(); return v.points.map(p => Math.hypot(p.x - v.cx, p.y - v.cy)); };
    const a = radii(2), b = radii(8), next = radii(8.02), later = radii(14);
    const ratios = b.map((r, i) => r / a[i]);
    return { spread: Math.max(...ratios) - Math.min(...ratios),
      maxFrameStep: Math.max(...next.map((r,i) => Math.abs(r-b[i]))),
      loopDifference: Math.max(...later.map((r,i) => Math.abs(r-b[i]))),
      bounds: v.points.every(p => p.x > 0 && p.x < v.width && p.y > 0 && p.y < v.height) };
  });
  expect(result.spread).toBeGreaterThan(0.015);
  expect(result.maxFrameStep).toBeLessThan(0.3);
  expect(result.loopDifference).toBeGreaterThan(0.2);
  expect(result.bounds).toBeTruthy();
});

test("pointer affects a local patch gradually, never the organism center", async ({ page }) => {
  const result = await page.evaluate(() => {
    const v = MilonoOrganism.views.find(v => v.canvas.id === "hero-organism");
    const state = Milono.provider.getState();
    v.options.mode = "ACTIVE";
    for (let i=0;i<180;i++) v.update(state, 1/30);
    v.explorations=[];v.nextExplore=Infinity;
    v.clock=2; v.response.strength=0; v.geometry();
    const original = v.points.map(p => ({...p})), center=[v.cx,v.cy];
    v.pointer = {x:original[0].x,y:original[0].y};
    const step = () => { v.update(state,1/30); v.clock=2; v.geometry(); };
    const displacement = index => Math.hypot(v.points[index].x-original[index].x,v.points[index].y-original[index].y);
    step(); const first=displacement(0);
    for(let i=0;i<90;i++) step();
    const near=displacement(0), far=displacement(90), strength=v.response.strength;
    v.pointer=null;
    for(let i=0;i<90;i++) step();
    return {first,near,far,released:v.response.strength/strength,centerStable:center[0]===v.cx&&center[1]===v.cy};
  });
  expect(result.first).toBeLessThan(1);
  expect(result.near).toBeGreaterThan(3);
  expect(result.near).toBeLessThanOrEqual(10.01);
  expect(result.far).toBeLessThan(.03);
  expect(result.released).toBeLessThan(.04);
  expect(result.centerStable).toBeTruthy();
});

test("suspension tightens first and wake restores core before membrane", async ({ page }) => {
  const result=await page.evaluate(() => {
    const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism");
    const state=Milono.provider.getState();
    const step=(n)=>{for(let i=0;i<n;i++)v.update(state,1/30);v.geometry();};
    v.options.mode="ACTIVE";step(180);
    const before={...v.current};
    v.options.mode="TUN";step(1);
    const tensionFraction=(v.current.tension-before.tension)/(1-before.tension);
    const compactFraction=v.current.compact;
    step(180);const tun={...v.current};const core=v.form.core;
    v.options.mode="ACTIVE";step(6);
    const early={...v.current};
    step(150);const awake={...v.current};
    v.options.mode="DEAD";step(600);
    const deadClock=v.clock,deadFlow=v.flowClock;
    step(30);
    return {tensionFraction,compactFraction,tun,early,awake,
      coreStable:core===v.form.core,deadDrift:Math.abs(v.clock-deadClock)+Math.abs(v.flowClock-deadFlow)};
  });
  expect(result.tensionFraction).toBeGreaterThan(result.compactFraction);
  expect(result.tun.flow).toBeLessThan(.01);
  expect(result.tun.compact).toBeGreaterThan(.99);
  expect(result.early.coreActivity).toBeGreaterThan(.65);
  expect(result.early.compact).toBeGreaterThan(.99);
  expect(result.awake.compact).toBeLessThan(.01);
  expect(result.awake.flow).toBeGreaterThan(.7);
  expect(result.coreStable).toBeTruthy();
  expect(result.deadDrift).toBeLessThan(1e-10);
});

test("offscreen organisms do not consume continuous animation work", async ({ page }) => {
  await page.locator("#terminal-input").scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>!MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism").visible);
  const getClock=()=>page.evaluate(()=>MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism").clock);
  const clock=await getClock();
  await page.waitForTimeout(250);
  expect(await getClock()).toBe(clock);
});
