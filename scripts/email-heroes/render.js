const { chromium } = require('playwright');
const H = require('./heroes.js'); const fs = require('fs'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 560, height: 240 }, deviceScaleFactor: 2 });
  for (const [n, svg] of Object.entries(H)) { await p.setContent(`<style>body{margin:0}</style>${svg}`); await p.screenshot({ path: `${out}/hero-${n}.png`, clip: { x: 0, y: 0, width: 560, height: 240 } }); }
  const sheet = await b.newPage({ viewport: { width: 1140, height: 1960 } });
  await sheet.setContent(`<style>body{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px;font:14px sans-serif}</style>${Object.entries(H).map(([n, s]) => `<div>${n}<br>${s}</div>`).join('')}`);
  await sheet.screenshot({ path: `${out}/_sheet.png`, fullPage: true });
  await b.close();
})();
