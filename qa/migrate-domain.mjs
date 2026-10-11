import {readFileSync, writeFileSync} from 'node:fs';
const files=['README.md','dist/index.html','dist/robots.txt','dist/sitemap.xml','package.json','docs/brand-system.md','scripts/validate.mjs','tests/brand.spec.mjs','tests/tardigrade.spec.mjs'];
for (const file of files) {
  let source=readFileSync(file,'utf8').replaceAll('https://www.ameba.life/','https://milono.xyz/');
  if (file==='README.md') source=source.replace('Production screenshot from [ameba.life](https://milono.xyz/), refreshed 2026-10-11.','Production UI screenshot, refreshed 2026-10-11.');
  writeFileSync(file,source);
}
