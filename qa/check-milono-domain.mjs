import { chromium } from '@playwright/test';
const browser = await chromium.launch({executablePath: process.env.MILONO_CHROME});
try {
  for (const host of ['milono.xyz','www.milono.xyz']) {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    try {
      const response = await page.goto('https://'+host+'/',{waitUntil:'networkidle',timeout:30000});
      await page.locator('.logo img').evaluate(img=>img.decode());
      await page.waitForFunction(()=>window.Milono?.provider);
      await page.screenshot({path:'qa/'+host+'-live.png'});
      console.log(JSON.stringify({host,status:response.status(),url:page.url(),title:await page.title(),security:await response.securityDetails(),canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),errors}));
    } catch(error) { console.log(JSON.stringify({host,error:error.message})); process.exitCode=1; }
    await page.close();
  }
} finally {await browser.close();}
