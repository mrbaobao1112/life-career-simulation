// Audit v17.3: chạy liên tục N phút, đổi cảnh mỗi 90 giây, mỗi phút đo FPS (5 giây), bộ nhớ, số nút trang, số trình nghe sự kiện
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const MIN = +process.argv[2] || 30;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:1280, height:800 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable'); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go'); await p.evaluate(() => { S.once.roamTut = true; });
  const scenes = [['street', 8, 17.5], ['in:cafe', 6, 16], ['office'], ['in:lake', 8, 6], ['home'], ['in:mall', 8, 15], ['street', 6, 11], ['in:bia', 8, 19]];
  const go = s => p.evaluate(s => { const [at, d, h] = s;
    if (at === 'office') { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; S.roam = { d:9, t:630 }; S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; }
    else if (at === 'home') { S.day = 8; S.slot = 'evening'; S.roam = { d:8, t:1150 }; S.where = null; S.queue = [{ id:'activity', arg:'evening' }]; }
    else { const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; S.flags.pho = { d, met:1, vendor:1, rain:1, jam:1 }; S.day = d; S.slot = slot; S.roam = { d, t:h * 60 }; S.where = { d, slot, at, bike:null }; S.queue = [{ id:'activity', arg:slot }]; }
    S.roamPos = {}; S.cur = null; advance(); WORLD.end = 1e9; }, s);
  const out = []; const t0 = Date.now(); let k = 0, lastScene = -1;
  while ((Date.now() - t0) / 60000 < MIN) {
    const m = Math.floor((Date.now() - t0) / 90000); if (m !== lastScene) { lastScene = m; await go(scenes[k++ % scenes.length]).catch(e => errs.push('go ' + e.message)); }
    // đi qua đi lại cho camera chạy
    await p.keyboard.down(k % 2 ? 'KeyD' : 'KeyA'); await p.waitForTimeout(1500); await p.keyboard.up(k % 2 ? 'KeyD' : 'KeyA');
    const fps = await p.evaluate(() => new Promise(r => { let n = 0; const s = performance.now(); const f = t => { n++; if (t - s < 5000) requestAnimationFrame(f); else r(n / ((t - s) / 1000)); }; requestAnimationFrame(f); }));
    const mm = (await cdp.send('Performance.getMetrics')).metrics, g = x => (mm.find(y => y.name === x) || {}).value;
    out.push({ phut:+((Date.now() - t0) / 60000).toFixed(1), canh:scenes[(k - 1) % scenes.length][0], fps:+fps.toFixed(1), heapMB:+(g('JSHeapUsedSize') / 1048576).toFixed(1), nodes:g('Nodes'), listeners:g('JSEventListeners'), docs:g('Documents') });
    console.log(JSON.stringify(out[out.length - 1]));
    await p.waitForTimeout(Math.max(0, 60000 - 6500 - 1500));
  }
  fs.writeFileSync(path.join(KQ, 'r_soak.json'), JSON.stringify({ out, errs }, null, 1)); await b.close();
})();
