import {chromium} from "@playwright/test";
const browser=await chromium.launch({executablePath:process.env.AMEBA_CHROME});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
const url=process.env.AMEBA_TEST_URL||"http://127.0.0.1:4184/";
await page.goto(url);
await page.waitForFunction(()=>window.AmebaOrganism?.views.length===11);
const snapshot=()=>page.evaluate(()=>{
 const v=AmebaOrganism.views.find(v=>v.canvas.id==="hero-organism");
 return{points:v.points.map(p=>({x:p.x,y:p.y})),drag:{...v.drag},response:{...v.response},core:{...v.coreOffset},pulse:v.nuclearPulse,compact:v.current.compact,flow:v.current.flow,motility:v.current.motility,pods:v.explorations.length};
});
const screenPoint=index=>page.evaluate(index=>{
 const v=AmebaOrganism.views.find(v=>v.canvas.id==="hero-organism"),r=v.canvas.getBoundingClientRect(),p=v.points[index];
 return{x:r.left+p.x,y:r.top+p.y,left:r.left,right:r.right};
},index);
const shot=name=>page.locator("#hero-organism").screenshot({path:"qa/interaction-"+name+".png"});
const first=await snapshot();await shot("idle-start");
await page.waitForTimeout(1700);
const early=await snapshot();await shot("idle-2s");
await page.waitForTimeout(13000);
const late=await snapshot();await shot("idle-15s");
const delta=(a,b)=>Math.max(...a.points.map((p,i)=>Math.hypot(p.x-b.points[i].x,p.y-b.points[i].y)));
let p=await screenPoint(0);
await page.mouse.move(p.right+55,p.y,{steps:15});await page.waitForTimeout(700);
const approach=await snapshot();
await page.mouse.move(p.x-2,p.y,{steps:12});await page.waitForTimeout(400);
const hover=await snapshot();
await page.mouse.click(p.x-2,p.y);await page.waitForTimeout(120);await shot("click");
const click=await snapshot();
await page.waitForTimeout(1000);
p=await screenPoint(90);await page.mouse.move(p.x+2,p.y);await page.mouse.down();
await page.mouse.move(p.left-70,p.y,{steps:22});await page.waitForTimeout(250);
const left=await snapshot();await shot("left-drag");
await page.mouse.up();await page.waitForTimeout(1500);const released=await snapshot();await shot("released");
p=await screenPoint(0);await page.mouse.move(p.x-2,p.y);await page.mouse.down();
await page.mouse.move(p.right+120,p.y,{steps:3});await page.waitForTimeout(220);
const right=await snapshot();await shot("right-fast-drag");
await page.mouse.up();await page.waitForTimeout(1400);
await page.evaluate(()=>{
 window.motionAudit={frames:[],draws:[],last:0};
 const v=AmebaOrganism.views.find(v=>v.canvas.id==="hero-organism"),draw=v.draw.bind(v);
 v.draw=function(){const t=performance.now();draw();const a=window.motionAudit;a.draws.push(performance.now()-t);if(a.last)a.frames.push(t-a.last);a.last=t;};
});
for(let i=0;i<8;i++){
 p=await screenPoint(i%2?90:0);
 await page.mouse.move(p.x,p.y);await page.mouse.down();
 await page.mouse.move(p.x+(i%2?-60:60),p.y+(i%3-1)*20,{steps:5});
 await page.waitForTimeout(100);await page.mouse.up();await page.waitForTimeout(100);
}
const performance=await page.evaluate(()=>{
 const a=window.motionAudit,sorted=a.frames.toSorted((a,b)=>a-b),draws=a.draws.toSorted((a,b)=>a-b);
 return{observedFps:1000/(a.frames.reduce((x,y)=>x+y,0)/a.frames.length),frameIntervalP95ms:sorted[Math.floor(sorted.length*.95)],heroDrawP95ms:draws[Math.floor(draws.length*.95)],samples:sorted.length};
});
await page.locator("#stress-organism").scrollIntoViewIfNeeded();
await page.evaluate(()=>{
 for(const [key,value] of Object.entries({latency:90,noise:90,compute:10,resource:10,pressure:90})){
  const input=document.getElementById("stress-"+key);input.value=value;input.dispatchEvent(new Event("input",{bubbles:true}));
 }
});
await page.waitForTimeout(1700);
await page.locator("#stress-organism").screenshot({path:"qa/interaction-stress-tun.png"});
const tun=await page.evaluate(()=>{
 const v=AmebaOrganism.views.find(v=>v.canvas.id==="stress-organism");
 return{mode:v.lastMode,compact:v.current.compact,flow:v.current.flow,motility:v.current.motility};
});
// Read 12 seconds of dormant nucleus activity without changing its simulation.
const pulseRange=await page.evaluate(()=>new Promise(resolve=>{
 const values=[],v=AmebaOrganism.views.find(v=>v.canvas.id==="stress-organism");
 const timer=setInterval(()=>{values.push(v.nuclearPulse);if(values.length===48){clearInterval(timer);resolve({min:Math.min(...values),max:Math.max(...values)});}},250);
}));
await page.evaluate(()=>{
 for(const [key,value] of Object.entries({latency:15,noise:15,compute:85,resource:85,pressure:15})){
  const input=document.getElementById("stress-"+key);input.value=value;input.dispatchEvent(new Event("input",{bubbles:true}));
 }
});
await page.locator("#wake-button").click();
await page.locator("#stress-organism").scrollIntoViewIfNeeded();
const wake=[];
for(const wait of [150,500,1000,1800]){
 await page.waitForTimeout(wait);
 wake.push(await page.evaluate(()=>{const v=AmebaOrganism.views.find(v=>v.canvas.id==="stress-organism");return{age:v.wakeAge,core:v.current.coreActivity,flow:v.current.flow,compact:v.current.compact,motility:v.current.motility};}));
}
await page.locator("#stress-organism").screenshot({path:"qa/interaction-awake.png"});
console.log(JSON.stringify({url,idle:{after2sMaxPx:delta(first,early),after15sMaxPx:delta(first,late),pods:late.pods},
 approach:approach.response.strength,hover:hover.response.strength,clickPulse:click.pulse,
 left:{x:left.drag.x,nucleus:left.core.x},released:released.drag.x,right:{x:right.drag.x,nucleus:right.core.x},
 tun,pulseRange,wake,performance,errors}));
await browser.close();
