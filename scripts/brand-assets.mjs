// Deterministic format exports from the approved mark and code-native favicon.
// Run after changing either master: MILONO_CHROME=/path/to/chrome node scripts/brand-assets.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const directory = resolve(import.meta.dirname, '../dist/brand');
const mark = readFileSync(resolve(directory, 'morva-mark.png')).toString('base64');
const browser = await chromium.launch({executablePath: process.env.MILONO_CHROME || undefined});
try {
  const page = await browser.newPage({deviceScaleFactor: 1});
  const svg = readFileSync(resolve(directory, 'favicon.svg'), 'utf8');
  const frames = [];
  for (const size of [16, 32, 48]) {
    await page.setViewportSize({width: size, height: size});
    await page.setContent(`<style>html,body{margin:0;background:#000}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    const name = `favicon-${size}.png`;
    const png = await page.screenshot({path: resolve(directory, name)});
    frames.push({size, png});
  }
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({size, png}, index) => {
    const at = 6 + index * 16;
    header[at] = size; header[at + 1] = size;
    header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(png.length, at + 8); header.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  const ico = Buffer.concat([header, ...frames.map(frame => frame.png)]);
  writeFileSync(resolve(directory, 'favicon.ico'), ico);
  // Browsers may request this conventional path without reading HTML metadata.
  writeFileSync(resolve(directory, '../favicon.ico'), ico);
  // Larger app icons and the shareable square use the complete logo.
  // Equal padding keeps antennae, claws and tail inside the square safe area.
  for (const size of [180, 192, 512, 1024]) {
    await page.setViewportSize({width: size, height: size});
    await page.setContent(`<style>
      *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#000}
      body{padding:8%;display:flex;align-items:center;justify-content:center}
      img{display:block;width:100%;height:100%;object-fit:contain}
    </style><img src="data:image/png;base64,${mark}" alt="">`);
    await page.locator('img').evaluate(image => image.decode());
    const name = size === 1024 ? 'morva-logo.png' : size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    await page.screenshot({path: resolve(directory, name)});
  }
  await page.setViewportSize({width: 1200, height: 630});
  await page.setContent(`<style>
    *{box-sizing:border-box}body{margin:0;background:#000;color:#F3ECE4;font-family:Arial,sans-serif}
    main{width:1200px;height:630px;display:flex;align-items:center;padding:80px;gap:70px}
    img{width:430px;height:320px;object-fit:contain}h1{font-size:70px;letter-spacing:7px;margin:0 0 24px;font-weight:500}
    p{font-size:24px;color:#D9D1C9;line-height:1.5;margin:0}footer{margin-top:55px;font-family:monospace;font-size:15px;line-height:1.8;letter-spacing:2px}
    .signal{display:block;width:24px;height:3px;background:#CE6241;margin-bottom:20px}
  </style><main><img src="data:image/png;base64,${mark}" alt=""><section><h1>MORVA</h1><p>An experimental cryptographic organism.</p><footer><span class="signal"></span>FORM CHANGES.<br>IDENTITY REMAINS.</footer></section></main>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({path: resolve(directory, 'og-image.png')});
  console.log('Brand exports: favicon 16/32/48 + ICO, Apple 180, full-logo icons 192/512, square logo 1024, OG 1200×630.');
} finally { await browser.close(); }
