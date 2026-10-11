import { chromium } from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.MILONO_CHROME});
const page=await browser.newPage();
const target=process.env.MILONO_TEST_URL || 'http://127.0.0.1:4184';
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[375,900]]){
 await page.setViewportSize({width,height}); await page.goto(target); await page.locator('.brand img').evaluate(img=>img.decode());
 await page.screenshot({path:`qa/brand-${width}.png`});
}
await page.setViewportSize({width:1440,height:1000});
await page.goto(target); await page.locator('#body-canvas').scrollIntoViewIfNeeded(); await page.screenshot({path:'qa/brand-body.png'});
await page.locator('#stress-title').scrollIntoViewIfNeeded(); await page.screenshot({path:'qa/brand-stress.png'});
await page.locator('#terminal-input').scrollIntoViewIfNeeded(); await page.screenshot({path:'qa/brand-terminal.png'});
await page.setViewportSize({width:1280,height:1250}); await page.goto(target); await page.locator('.logo img').evaluate(img=>img.decode());
await page.screenshot({path:'docs/assets/research-console.png'});
await page.setViewportSize({width:640,height:220});
await page.setContent(`<style>body{background:#000;color:#F3ECE4;font:14px monospace;display:flex;gap:40px;padding:35px}figure{margin:0}img{display:block;image-rendering:pixelated}figcaption{margin-top:18px}</style>${[16,32,48].map(size=>`<figure><img width="${size*3}" height="${size*3}" src="${target}/brand/favicon-${size}.png"><figcaption>${size} px, 3× preview</figcaption></figure>`).join('')}`);
await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
await page.screenshot({path:'qa/favicon-review.png'});
await browser.close();
