// Audit v17.3: chơi thử như người thật trong N phút (không tua nhanh). Bấm vào đồ vật/cửa để đi tới, chọn việc, đôi khi đi dạo.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const MIN = +process.argv[2] || 60, TAG = process.argv[3] || 'pc', SHOTS = [1, 5, 15, 30, 45, 60];
const log = []; const t0 = Date.now(); const now = () => (Date.now() - t0) / 60000;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:1280, height:800 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push([now().toFixed(1), e.message]));
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  await p.goto(URL); await p.waitForTimeout(1500);
  await p.screenshot({ path:path.join(KQ, `play_${TAG}_title.png`) });
  // tạo nhân vật như người mới: bấm nút chính, đọc màn tạo nhân vật, chọn hoàn cảnh
  await p.click('#fresh'); await p.waitForTimeout(500); await p.screenshot({ path:path.join(KQ, `play_${TAG}_create.png`) });
  await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go'); await p.waitForTimeout(1500);
  const seen = {}, places = {}, kinds = { text:0, world:0, menu:0, walk:0, wander:0 }; let tutN = 0, lastDay = 0, lastT = 0, stall = 0, maxStall = 0, shot = 0, lastMin = -1;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  while (now() < MIN) {
    const st = await p.evaluate(() => ({ day:S.day, slot:S.slot, cur:S.cur && S.cur.id, phase:S.phase, world:!!document.querySelector('#world') && !!WORLD && !WORLD.dead,
      place:document.querySelector('#world') && document.querySelector('#world').dataset.place, t:WORLD ? Math.round(WORLD.t) : null, menu:WORLD && !!WORLD.menu, busy:WORLD && WORLD.busy,
      money:S.money, energy:Math.round(S.energy), mood:Math.round(S.mood), health:Math.round(S.health), job:S.job && S.job.co, tut:!!document.querySelector('.w-tut:not([hidden])') })).catch(() => null);
    if (!st) { await p.waitForTimeout(500); continue; }
    if (st.cur) seen[st.cur] = (seen[st.cur] || 0) + 1; if (st.place) places[st.place] = (places[st.place] || 0) + 1;
    const key = st.day * 10000 + (st.t || 0); if (key === lastT) stall++; else { maxStall = Math.max(maxStall, stall); stall = 0; } lastT = key;
    const m = Math.floor(now()); if (m !== lastMin) { lastMin = m; const perf = await cdp.send('Performance.getMetrics'); const g = k => (perf.metrics.find(x => x.name === k) || {}).value;
      log.push({ phut:m, ...st, heapMB:Math.round(g('JSHeapUsedSize') / 1048576), nodes:g('Nodes'), listeners:g('JSEventListeners') }); }
    if (shot < SHOTS.length && now() >= SHOTS[shot]) { await p.screenshot({ path:path.join(KQ, `play_${TAG}_${SHOTS[shot]}m.png`) }); shot++; }
    // màn tổng kết / hộp thoại
    // Bấm bằng mã trong trang, không giữ tham chiếu phần tử (giữ tham chiếu làm số nút trang tăng giả, xem docs/AUDIT_REPORT_v17.3.md mục 5)
    const tap = sels => p.evaluate(sels => { const vis = e => e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]'); for (const s of sels) { const all = [...document.querySelectorAll(s)].filter(vis); if (all.length) { const e = s.includes('w-wake') && all.length > 1 && Math.random() > .7 ? all[Math.floor(Math.random() * all.length)] : all[0]; const id = e.id; if (id !== 'again') e.click(); return id || s; } } return null; }, sels).catch(() => null);
    const hit = await tap(['#nextWeek', '#tSkip', '#next', '#again']); if (hit === 'again') break; if (hit) { kinds.text++; await p.waitForTimeout(700); continue; }
    // kết quả trong thế giới (nút “Tiếp tục ▸”), trò chơi nhỏ
    if (await tap(['.w-toast:not([hidden]) button'])) { kinds.text++; await p.waitForTimeout(800); continue; }
    if (await tap(['.mg-done:not([hidden])', '.mg-skip'])) { kinds.mg = (kinds.mg || 0) + 1; await p.waitForTimeout(1200); continue; }
    if (stall > 40 && await tap(['#app button.btn'])) { kinds.unstick = (kinds.unstick || 0) + 1; stall = 0; await p.waitForTimeout(800); continue; }
    // thức dậy trên giường: bấm bong bóng (như người chơi)
    if (await tap(['.w-wake:not([hidden]) button'])) { kinds.text++; await p.waitForTimeout(1500); continue; }
    // hướng dẫn lần đầu: làm theo (đi, chạy, đến gần đồ vật)
    if (st.tut && tutN < 6) { tutN++; await p.keyboard.down('KeyD'); if (tutN % 2 === 0) await p.keyboard.down('Shift'); await p.waitForTimeout(900); await p.keyboard.up('Shift'); await p.keyboard.up('KeyD'); continue; }
    if (st.world && !st.busy) {
      if (st.menu) { const items = await p.$$eval('.w-menu .w-act', b => b.map((x, i) => ({ i, t:x.textContent.trim(), off:x.disabled }))).catch(() => []);
        const good = items.filter(x => !x.off && !/^👋|Chào/.test(x.t)); const c = good.length ? pick(good) : null;
        if (c) { await p.keyboard.press('Digit' + (c.i + 1)); kinds.menu++; } else await p.keyboard.press('Escape'); await p.waitForTimeout(1500); continue; }
      // chọn một đồ vật có việc để làm (đi tới bằng cách bấm vào nó, như người chơi bấm chuột/chạm)
      const objs = await p.evaluate(() => { const sc = WORLD.sc || {}; return WORLD.H.objs.map(o => ({ id:o.id, kind:o.kind, go:['go', 'phuong', 'door', 'exit'].includes(o.kind) || !!o.exit, act:!!(o.acts && sc.choices && sc.choices.some(c => o.acts.includes(c.actId))) })); }).catch(() => []);
      const acts = objs.filter(o => o.act), doors = objs.filter(o => o.go), any = objs.filter(o => !o.go);
      let target = Math.random() < .65 && acts.length ? pick(acts) : Math.random() < .5 && doors.length ? pick(doors) : any.length ? pick(any) : null;
      if (target) { kinds[target.go ? 'wander' : 'walk']++;
        const ok = await p.evaluate(id => { const r = document.querySelector(`#world .w-obj[data-o="${id}"]`); if (!r) return false; r.dispatchEvent(new MouseEvent('click', { bubbles:true })); return true; }, target.id).catch(() => false);
        await p.waitForTimeout(ok ? 2500 : 300); continue; }
      await p.waitForTimeout(800); continue;
    }
    // cảnh chữ: chọn một lựa chọn (không chọn tua nhanh)
    const ch = await p.$$eval('#stage .choice', b => b.map((x, i) => ({ i, t:x.textContent.trim().slice(0, 50), off:x.disabled || !!x.closest('[hidden]') }))).catch(() => []);
    const ok = ch.filter(c => !c.off && !/Tua đến|Tua nhanh/.test(c.t));
    if (ok.length) { const c = pick(ok); await p.click(`#stage .choice >> nth=${c.i}`).catch(() => {}); kinds.text++; await p.waitForTimeout(900); continue; }
    await p.waitForTimeout(600);
  }
  { const pre = (await cdp.send('Performance.getMetrics')).metrics; await cdp.send('HeapProfiler.collectGarbage'); await p.waitForTimeout(500); await cdp.send('HeapProfiler.collectGarbage');
    const post = (await cdp.send('Performance.getMetrics')).metrics, g = (mm, x) => mm.find(y => y.name === x).value;
    const live = await p.evaluate(() => ({ all:document.getElementsByTagName('*').length, phone:document.querySelectorAll('#phone *, .ph-msg, .ph-item').length, feed:(S.feed || []).length }));
    log.push({ gc:true, truocDon:{ nodes:g(pre, 'Nodes'), lis:g(pre, 'JSEventListeners') }, sauDon:{ nodes:g(post, 'Nodes'), lis:g(post, 'JSEventListeners'), heapMB:Math.round(g(post, 'JSHeapUsedSize') / 1048576) }, trenTrang:live });
    console.log('GC', JSON.stringify(log[log.length - 1])); }
  const fin = await p.evaluate(() => ({ day:S.day, money:S.money, job:S.job, stat:S.stat, rel:S.rel, mem:(S.npcMem || []).length, end:!!document.querySelector('#again') }));
  fs.writeFileSync(path.join(KQ, `r_play_${TAG}.json`), JSON.stringify({ log, seen, places, kinds, maxStall, fin, errs }, null, 1));
  console.log('xong', TAG, JSON.stringify({ fin:{ day:fin.day, money:fin.money, job:fin.job && fin.job.co }, kinds, maxStall, errs:errs.length }));
  await b.close();
})();
