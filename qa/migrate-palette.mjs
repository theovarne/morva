import {readFileSync,writeFileSync} from 'node:fs';
const path='dist/assets/styles.css';
let css=readFileSync(path,'utf8');
const end=css.indexOf('\n}');
const tokens=css.slice(0,end+2);
let body=css.slice(end+2);
const surface=['#0b0b0b','#070707','#030303','#050505','#080808','#020202','#040404','#090909'];
const border=['#333','#4f4f4f','#292929','#4a4a4a','#242424','#505050','#393939','#4d4d4d','#303030','#202020','#4b4b4b','#3b3b3b','#2d2d2d','#282828','#515151'];
const muted=['#7a7a7a','#777','#818181','#555','#666'];
const text=['#cfcfcf','#b7b7b7'];
body=body.replace(/#[0-9a-f]{3,8}\b/gi,v=>surface.includes(v)?'var(--milono-surface)':border.includes(v)?'var(--line2)':muted.includes(v)?'var(--muted)':text.includes(v)?'var(--dim)':v==='#111'||v==='#0c0c0c'?'var(--milono-grid)':v==='#b68b8b'?'var(--milono-terracotta-soft)':['#5a6b7c','#3c4853'].includes(v)?'var(--milono-signal-border)':['#06090c','#07101a'].includes(v)?'var(--milono-signal-wash)':v);
body=body.replaceAll('rgba(255,255,255,0.025)','var(--milono-border-soft)').replaceAll('rgba(3,3,3,0.96)','var(--milono-surface-raised)').replaceAll('rgba(2,2,2,0.94)','var(--milono-surface-raised)');
writeFileSync(path,tokens+body);
let html=readFileSync('dist/index.html','utf8');
html=html.replaceAll('https://www.ameba.life/assets/milono.png','https://www.ameba.life/brand/og-image.png?v=20261011').replace('content="summary"','content="summary_large_image"').replace('<link rel="icon" href="./assets/milono.png">',`<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="MILONO ivory and terracotta segmented organism">
<meta name="twitter:image:alt" content="MILONO ivory and terracotta segmented organism">
<link rel="icon" href="./brand/favicon.ico?v=20261011" sizes="16x16 32x32 48x48">
<link rel="icon" href="./brand/favicon.svg?v=20261011" type="image/svg+xml" sizes="any">
<link rel="apple-touch-icon" href="./brand/apple-touch-icon.png?v=20261011" sizes="180x180">
<link rel="manifest" href="./site.webmanifest?v=20261011">`);
html=html.replace('<a class="brand" href="./">MILONO</a>','<a class="brand" href="./"><img src="./brand/milono-mark.png" alt="" width="45" height="30">MILONO</a>').replace('<img src="./assets/milono.png" alt="MILONO">','<img src="./brand/milono-mark.png" alt="MILONO segmented organism mark" width="200" height="200" fetchpriority="high">').replaceAll('fill="#6a6a6a"','fill="var(--milono-axis)"').replaceAll('fill="#4a4a4a"','fill="var(--milono-path)"');
writeFileSync('dist/index.html',html);
let js=readFileSync('dist/assets/visuals.js','utf8');
js=js.replace('  const M = window.Milono;',`  // Canvas colors share the CSS brand tokens; simulation mechanics are unchanged.
  const theme = getComputedStyle(document.documentElement);
  const color = name => theme.getPropertyValue('--milono-' + name).trim();
  const rgba = (name, alpha) => {
    const hex = color(name).slice(1);
    const rgb = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
    return 'rgba(' + rgb.join(',') + ',' + alpha + ')';
  };
  const M = window.Milono;`);
js=js.replace('"rgba(143,184,230," + alpha + ")"','rgba("ivory", alpha)').replace('index % 7 === 0 ? "rgba(230,230,230," + glow + ")" : "rgba(143,184,230," + glow + ")"','rgba(index % 7 === 0 ? "terracotta" : "ivory", glow)').replace('"rgba(230,230,230,0.65)"','color("terracotta")').replace('"#121212"','rgba("ivory", .08)').replace('"#696969" : "#8fb8e6"','color("text-muted") : color("ivory")').replace('"rgba(230,230,230,0.32)"','rgba("ivory", .25)').replace('"#e6e6e6"','color("terracotta")');
writeFileSync('dist/assets/visuals.js',js);
