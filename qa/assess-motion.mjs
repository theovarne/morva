import { chromium } from "@playwright/test";
const browser=await chromium.launch({executablePath:process.env.AMEBA_CHROME});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
await page.goto(process.env.AMEBA_TEST_URL || "http://127.0.0.1:4184/");
await page.waitForFunction(()=>AmebaOrganism.views.length===11);
const performance=await page.evaluate(()=>{
  const v=AmebaOrganism.views.find(v=>v.canvas.id==="hero-organism");
  const state=Ameba.provider.getState(),times=[];
  for(let i=0;i<180;i++){
    const start=performance.now();
    // Deliberately force all eleven views, heavier than the normal visibility budget.
    for(const view of AmebaOrganism.views){view.update(state,1/30);view.draw();}
    times.push(performance.now()-start);
  }
  times.sort((a,b)=>a-b);
  return {allElevenViewsP95ms:times[Math.floor(times.length*.95)],meanMs:times.reduce((a,b)=>a+b,0)/times.length,devicePixelRatio};
});
await page.reload();
await page.waitForFunction(()=>AmebaOrganism.views.length===11);
await page.evaluate(()=>{
  const grid=document.createElement("div");
  grid.id="motion-study";
  Object.assign(grid.style,{position:"fixed",inset:"0",zIndex:99999,background:"#000",display:"grid",gridTemplateColumns:"repeat(3,1fr)",height:"330px"});
  for(const [index,time] of [0,8,19].entries()){
    const cell=document.createElement("div"),canvas=document.createElement("canvas"),label=document.createElement("div");
    canvas.style.cssText="width:100%;height:280px";
    label.style.cssText="text-align:center;color:#929e95;font:11px monospace;letter-spacing:2px";
    label.textContent="LOCAL PHASE "+time;
    cell.append(canvas,label);grid.append(cell);document.body.append(grid);
    const v=new AmebaOrganism.View(canvas,{specimen:"A",mode:"ACTIVE"});
    v.clock=time;v.flowClock=time*.8;v.draw();v.visible=false;
    v.resizeObserver.disconnect();
  }
});
await page.locator("#motion-study").screenshot({path:"qa/membrane-phases.png"});
console.log(JSON.stringify({performance,errors}));
await browser.close();
