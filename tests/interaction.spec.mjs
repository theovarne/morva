import {test,expect} from "@playwright/test";

test.beforeEach(async({page})=>{
  await page.goto("/");
  await page.waitForFunction(()=>window.MilonoOrganism?.views.length===11);
});
const info=page=>page.evaluate(()=>{
  const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism");
  return {drag:{...v.drag},impact:{...v.impact},response:{...v.response},core:{...v.coreOffset},
    current:{...v.current},clock:v.clock,points:v.points.map(p=>({x:p.x,y:p.y})),pods:v.explorations.length};
});
const edge=(page,index)=>page.evaluate(index=>{
  const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism"),r=v.canvas.getBoundingClientRect(),p=v.points[index];
  return {x:r.left+p.x,y:r.top+p.y,cx:r.left+v.cx,cy:r.top+v.cy,left:r.left,right:r.right};
},index);

test("approach works outside the canvas and click produces a local pressure cycle",async({page})=>{
  const p=await edge(page,0);
  await page.mouse.move(p.right+65,p.y);
  await expect.poll(async()=>(await info(page)).response.strength).toBeGreaterThan(.015);
  await page.mouse.move(p.x-3,p.y);
  await page.waitForTimeout(250);
  expect((await info(page)).response.strength).toBeGreaterThan(.3);
  await page.mouse.click(p.x-3,p.y);
  await page.waitForTimeout(110);
  const effect=await page.evaluate(()=>{
    const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism"),age=v.impact.age;
    v.geometry();const pressed=v.points.map(p=>({...p}));
    v.impact.age=2;v.geometry();
    const delta=Math.max(...pressed.map((p,i)=>Math.hypot(p.x-v.points[i].x,p.y-v.points[i].y)));
    v.impact.age=age;return{age,delta};
  });
  expect(effect.age).toBeLessThan(.5);
  expect(effect.delta).toBeGreaterThan(3);
  await page.waitForTimeout(950);
  expect((await info(page)).impact.age).toBeGreaterThan(.9);
});

test("left drag deforms locally, captures outside canvas, and recoils on release",async({page})=>{
  const p=await edge(page,90);
  await page.mouse.move(p.x+2,p.y);await page.mouse.down();
  expect((await info(page)).drag.pointerId).not.toBeNull();
  await page.mouse.move(p.left-70,p.y,{steps:14});
  await page.waitForTimeout(280);
  const pulled=await info(page);
  expect(pulled.drag.x).toBeLessThan(-15);
  expect(Math.abs(pulled.drag.x)).toBeLessThan(73);
  expect(pulled.core.x/pulled.drag.x).toBeCloseTo(.09,2);
  const captured=await page.evaluate(()=>{
    const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism");
    return v.canvas.hasPointerCapture(v.drag.pointerId);
  });
  expect(captured).toBeTruthy();
  await page.mouse.up();
  const released=await info(page);
  expect(released.drag.pointerId).toBeNull();
  expect(Math.abs(released.drag.x)).toBeGreaterThan(5);
  await page.waitForTimeout(1600);
  expect(Math.abs((await info(page)).drag.x)).toBeLessThan(.5);
});

test("rapid right drag remains bounded, cancellation releases capture, and specimen switch clears deformation",async({page})=>{
  const p=await edge(page,0);
  await page.mouse.move(p.x-2,p.y);await page.mouse.down();
  for(const x of [p.x+120,p.x-70,p.x+220]) await page.mouse.move(x,p.y,{steps:3});
  await page.waitForTimeout(220);
  const pulled=await info(page);
  expect(pulled.drag.x).toBeGreaterThan(10);
  expect(Math.abs(pulled.drag.x)).toBeLessThan(73);
  expect(pulled.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBeTruthy();
  await page.locator("#hero-organism").dispatchEvent("pointercancel",{pointerId:pulled.drag.pointerId});
  expect((await info(page)).drag.pointerId).toBeNull();
  await page.mouse.up();
  await page.waitForTimeout(1400);
  expect(Math.abs((await info(page)).drag.x)).toBeLessThan(.5);
  await page.locator('[data-specimen="B"]').click();
  await page.locator("#hero-organism").scrollIntoViewIfNeeded();
  await expect(page.locator("#hero-organism")).toHaveAttribute("data-view-specimen","B");
  expect((await info(page)).drag.x).toBe(0);
});

test("retina hit testing and real touch drag share CSS-pixel coordinates",async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const page=await context.newPage();
  await page.goto(process.env.MILONO_TEST_URL||"http://127.0.0.1:4184/");
  await page.waitForFunction(()=>window.MilonoOrganism?.views.length===11);
  const p=await edge(page,0),session=await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:p.x-3,y:p.y}]});
  await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:p.x+55,y:p.y}]});
  await page.waitForTimeout(250);
  expect((await info(page)).drag.x).toBeGreaterThan(10);
  await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await page.waitForTimeout(1600);
  expect((await info(page)).drag.pointerId).toBeNull();
  expect(Math.abs((await info(page)).drag.x)).toBeLessThan(.5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  await context.close();
});

test("fast movement adds a bounded extension compared with the same slow pull",async({page})=>{
  async function pull(slow){
    const p=await edge(page,0);
    await page.mouse.move(p.x-2,p.y);await page.mouse.down();
    if(slow){
      for(let i=1;i<=12;i++){await page.mouse.move(p.x-2+i*3,p.y);await page.waitForTimeout(55);}
    }else await page.mouse.move(p.x+34,p.y);
    await page.waitForTimeout(20);
    const sample=await info(page);
    await page.mouse.up();await page.waitForTimeout(1600);
    return sample.drag.targetX;
  }
  const slow=await pull(true),fast=await pull(false);
  expect(fast).toBeGreaterThan(slow+1);
  expect(fast).toBeLessThan(73);
});

test("reduced motion still accepts drag and Space, without a frozen organism",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.waitForTimeout(100);
  const before=await info(page),p=await edge(page,0);
  await page.mouse.move(p.x-2,p.y);await page.mouse.down();await page.mouse.move(p.x+70,p.y,{steps:8});
  await page.waitForTimeout(300);
  const moved=await info(page);
  expect(moved.clock).toBeGreaterThan(before.clock);
  expect(moved.drag.x).toBeGreaterThan(4);
  expect(moved.drag.x).toBeLessThan(30);
  await page.mouse.up();
  await page.locator("#hero-organism").focus();await page.keyboard.press("Space");
  expect((await info(page)).impact.age).toBeLessThan(.3);
});

test("state notifications do not fast-forward the reduced-motion lifecycle",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  const delta=await page.evaluate(()=>{
    const v=MilonoOrganism.views.find(v=>v.canvas.id==="hero-organism"),clock=v.clock,core=v.coreClock;
    for(let i=0;i<5;i++)Milono.provider.emit();
    return{clock:v.clock-clock,core:v.coreClock-core};
  });
  expect(delta).toEqual({clock:0,core:0});
});

test("drag does not accidentally pin a body region or activate a thumbnail",async({page})=>{
  await page.locator("#body-canvas").scrollIntoViewIfNeeded();
  const p=await page.evaluate(()=>{
    const v=MilonoOrganism.views.find(v=>v.canvas.id==="body-canvas"),r=v.canvas.getBoundingClientRect(),p=v.points[0];
    return{x:r.left+p.x-3,y:r.top+p.y};
  });
  await page.mouse.move(p.x,p.y);await page.mouse.down();
  await page.mouse.move(p.x+40,p.y,{steps:10});await page.mouse.up();
  await expect(page.locator("#node-inspector")).toBeHidden();
  expect(await page.locator('[data-static-mode="ACTIVE"]').getAttribute("data-membrane-interactive")).toBeNull();
  await page.locator('button[data-mode="TUN"]').click();
  await expect(page.locator("#live-state")).toHaveText("TUN");
});
