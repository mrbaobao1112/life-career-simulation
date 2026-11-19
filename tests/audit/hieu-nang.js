// Audit v17.3: đo hiệu năng thật (FPS, khung hình chậm, CPU, bộ nhớ, số nút trang, thời gian tải) theo 3 cấu hình
const { chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const PROFILES = { desktop:{ ctx:{ viewport:{ width:1280, height:800 } }, cpu:1 }, laptop:{ ctx:{ viewport:{ width:1366, height:768 } }, cpu:4 }, mobile:{ ctx:{ ...devices['iPhone 13'] }, cpu:6 } };
const only = process.argv[2];
const res = {};
(async () => {
  const b = await chromium.launch();
  for (const [name, P] of Object.entries(PROFILES)) { if (only && only !== name) continue;
    const ctx = await b.newContext(P.ctx); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
    if (P.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate:P.cpu });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const t0 = Date.now(); await p.goto(URL); await p.waitForSelector('#fresh', { state:'visible' }); const ready = Date.now() - t0;
    const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const rs = performance.getEntriesByType('resource');
      return { domContentLoaded:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), files:rs.length + 1, kb:Math.round((n.transferSize || n.encodedBodySize || 0) / 1024 + rs.reduce((a, r) => a + (r.encodedBodySize || 0), 0) / 1024) }; });
    const metrics = async () => { const m = (await cdp.send('Performance.getMetrics')).metrics, g = k => (m.find(x => x.name === k) || {}).value; return { heap:g('JSHeapUsedSize'), nodes:g('Nodes'), task:g('TaskDuration'), script:g('ScriptDuration'), layout:g('LayoutDuration'), style:g('RecalcStyleDuration'), listeners:g('JSEventListeners') }; };
    // đo một đoạn: đếm khung hình bằng requestAnimationFrame riêng của trang (chỉ để đo)
    const measure = async (label, secs, during) => {
      await p.evaluate(() => { window.__fr = []; let last = performance.now(); window.__on = true; const f = t => { window.__fr.push(t - last); last = t; if (window.__on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
      const m0 = await metrics(), w0 = Date.now(); if (during) await during(); else await p.waitForTimeout(secs * 1000); const wall = (Date.now() - w0) / 1000; const m1 = await metrics();
      const fr = await p.evaluate(() => { window.__on = false; return window.__fr.slice(2); });
      const sorted = fr.slice().sort((a, b) => a - b), p95 = sorted[Math.floor(sorted.length * .95)] || 0;
      const r = { fps:+(fr.length / wall).toFixed(1), p95ms:+p95.toFixed(1), slow50:fr.filter(x => x > 50).length, cpu:+((m1.task - m0.task) / wall * 100).toFixed(0), script:+((m1.script - m0.script) / wall * 100).toFixed(0),
        style:+((m1.style - m0.style) / wall * 100).toFixed(0), layout:+((m1.layout - m0.layout) / wall * 100).toFixed(0), heapMB:+(m1.heap / 1048576).toFixed(1), nodes:m1.nodes, npcs:await p.evaluate(() => typeof WORLD !== 'undefined' && WORLD && WORLD.npcs ? WORLD.npcs.filter(a => !a.gone).length : null) };
      (res[name] = res[name] || {})[label] = r; console.log(name, label, JSON.stringify(r));
    };
    res[name] = { tai:{ hienNutMs:ready, ...nav } }; console.log(name, 'tải', JSON.stringify(res[name].tai));
    await measure('man-mo-dau', 8);
    await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="ghep"]'); await p.click('#go'); await p.evaluate(() => { S.once.roamTut = true; });
    const go = async (fn, arg) => { const t = Date.now(); await p.evaluate(fn, arg); await p.waitForFunction(() => typeof WORLD !== 'undefined' && WORLD && WORLD.H && document.querySelector('#world'), null, { timeout:20000 }); return Date.now() - t; };
    const home = () => { S.day = 8; S.slot = 'morning'; S.roam = { d:8, t:640 }; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:'morning' }]; S.cur = null; advance(); WORLD.end = 1e9; };
    const place = a => { const [at, d, h] = a; const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; S.flags.pho = { d, met:1, vendor:1, rain:1, jam:1 }; S.day = d; S.slot = slot; S.roam = { d, t:h * 60 }; S.roamPos = {}; S.where = { d, slot, at, bike:null }; S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.end = 1e9; };
    const office = () => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; S.roam = { d:9, t:630 }; S.roamPos = {}; S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.end = 1e9; };
    const tr = {};
    tr.home = await go(home); await p.waitForTimeout(1500); await measure('nha', 8);
    tr.office = await go(office); await p.waitForTimeout(1500); await measure('van-phong', 8);
    tr.cafe = await go(place, ['in:cafe', 6, 17]); await p.waitForTimeout(1500); await measure('ca-phe-dong', 8);
    tr.street = await go(place, ['street', 8, 17.5]); await p.waitForTimeout(1500);
    await measure('pho-gio-cao-diem-dang-di', 8, async () => { await p.evaluate(() => { WORLD.me.x = 420; WORLD.me.y = 175; }); await p.keyboard.down('KeyD'); await p.waitForTimeout(8000); await p.keyboard.up('KeyD'); });
    res[name].chuyenCanhMs = tr; console.log(name, 'chuyển cảnh', JSON.stringify(tr));
    res[name].loi = errs; await ctx.close();
  }
  fs.writeFileSync(path.join(KQ, 'r_perf' + (only ? '_' + only : '') + '.json'), JSON.stringify(res, null, 1));
  await b.close();
})();
