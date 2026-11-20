// Kiểm thử v17.6: HIỆU NĂNG (có ngưỡng đạt/không đạt, khác tests/audit/hieu-nang.js chỉ đo và ghi lại)
// 1. Điện thoại (giả lập iPhone 13, CPU chậm 6 lần): phố giờ cao điểm, văn phòng, quán cà phê giữ đủ khung hình.
// 2. NPC ngoài khung nhìn hoặc đã đi khỏi: không còn hoạt ảnh nào chạy.
// 3. Tìm đường: nhanh trên bản đồ dài nhất (phố).
// 4. Ra vào thế giới 20 lần: số nút trang, số trình nghe sự kiện, bộ nhớ không tăng dần (không rò).
// Số đo phụ thuộc máy: nên chạy riêng, khi máy rảnh (bộ chạy tổng chạy bài này cuối cùng, một mình).
// Cần Playwright. Chạy: npm run hieu-nang
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
// Ngưỡng (đo trên máy kiểm thử khi rảnh: phố giờ cao điểm khoảng 57 FPS, văn phòng và cà phê khoảng 60)
const NGUONG = {
  FPS:40,                    // khung hình mỗi giây tối thiểu trên điện thoại giả lập
  P95_MS:50,                 // 95% khung hình phải vẽ xong trong chừng này mili giây
  PATH_MS:2,                 // một lần tìm đường trên phố trung bình không quá chừng này mili giây
  TANG:.12,                  // ra vào 20 lần: số nút trang, trình nghe, bộ nhớ tăng không quá 12% so với sau 4 lần đầu
};

async function open(browser, opts = {}, cpu = 1){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.cdp = await ctx.newCDPSession(page); await page.cdp.send('Performance.enable');
  if (cpu > 1) await page.cdp.send('Emulation.setCPUThrottlingRate', { rate:cpu });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="ghep"]'); await page.click('#go');
  await page.evaluate(() => { S.once.roamTut = true; S.money = 5e6; S.job = { co:'hotay', salary:1e7, start:3 }; });
  return page;
}
const vao = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0; S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {};
  if (at === 'office') { OFFICE_BAL.ABSENT = 0; S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; }
  else { S.where = at === 'home' ? null : { d:day, slot, at, bike:null }; S.queue = [{ id:'activity', arg:slot }]; }
  S.cur = null; advance(); WORLD.end = 1e9;
}, [at, day, h]);
// Đếm khung hình trong `giay` giây (trong lúc nhân vật đi qua lại để camera chạy)
async function doFps(page, giay){
  await page.evaluate(() => { window.__fr = []; let last = performance.now(); window.__on = true; const f = t => { window.__fr.push(t - last); last = t; if (window.__on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const t0 = Date.now();
  for (let i = 0; i < giay; i++) { await page.keyboard.down(i % 4 < 2 ? 'd' : 'a'); await page.waitForTimeout(1000); await page.keyboard.up(i % 4 < 2 ? 'd' : 'a'); }
  const fr = await page.evaluate(() => { window.__on = false; return window.__fr.slice(3); }), wall = (Date.now() - t0) / 1000;
  const s = fr.slice().sort((a, b) => a - b);
  return { fps:+(fr.length / wall).toFixed(1), p95:+(s[Math.floor(s.length * .95)] || 0).toFixed(1) };
}
const metrics = async page => { const m = (await page.cdp.send('Performance.getMetrics')).metrics, g = k => (m.find(x => x.name === k) || {}).value; return { nodes:g('Nodes'), listeners:g('JSEventListeners'), heap:Math.round(g('JSHeapUsedSize') / 1024) }; };

(async () => {
  const browser = await chromium.launch();

  // 1. Điện thoại
  { const page = await open(browser, { ...devices['iPhone 13'] }, 6);
    for (const [ten, at, day, h] of [['phố giờ cao điểm', 'street', 8, 17.5], ['văn phòng', 'office', 9, 10], ['quán cà phê đông', 'in:cafe', 6, 17]]) {
      await vao(page, at, day, h); await page.waitForTimeout(2500);
      const r = await doFps(page, 8), n = await page.evaluate(() => WORLD.npcs.filter(a => !a.gone).length);
      check(`Điện thoại (iPhone 13, CPU chậm 6 lần), ${ten}: từ ${NGUONG.FPS} khung hình/giây, 95% khung dưới ${NGUONG.P95_MS} ms`, r.fps >= NGUONG.FPS && r.p95 <= NGUONG.P95_MS, `${r.fps} FPS, 95% ≤ ${r.p95} ms, ${n} người`);
    }
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. NPC ngoài khung nhìn: không còn hoạt ảnh chạy; trong khung nhìn vẫn chạy bình thường
  { const page = await open(browser); await vao(page, 'street', 8, 17.5); await page.waitForTimeout(3000);
    const r = await page.evaluate(() => { const run = a => [...a.el.querySelectorAll('*')].filter(n => { const c = getComputedStyle(n); return c.animationName !== 'none' && c.animationPlayState === 'running'; }).length;
      const off = WORLD.npcs.filter(a => a.el && a.off), on = WORLD.npcs.filter(a => a.el && !a.off && !a.gone);
      return { off:off.length, chayNgoai:off.reduce((n, a) => n + run(a), 0), on:on.length, chayTrong:on.reduce((n, a) => n + run(a), 0) }; });
    check('NPC ngoài khung nhìn hoặc đã đi khỏi: không còn hoạt ảnh nào chạy', r.off > 0 && r.chayNgoai === 0, JSON.stringify(r));
    check('NPC trong khung nhìn vẫn cử động bình thường', r.on > 0 && r.chayTrong > 0, JSON.stringify(r));

    // 3. Tìm đường trên phố (bản đồ dài nhất)
    const p = await page.evaluate(() => { const H = WORLD.H, pts = []; let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 300; i++) pts.push([{ x:20 + r() * (H.W - 40), y:ROAM.Y0 + r() * (ROAM.Y1 - ROAM.Y0) }, { x:20 + r() * (H.W - 40), y:ROAM.Y0 + r() * (ROAM.Y1 - ROAM.Y0) }]);
      const t0 = performance.now(); let found = 0; for (const [a, b] of pts) if (roamPath(H, a, b)) found++; return { ms:(performance.now() - t0) / pts.length, found, W:H.W }; });
    check(`Tìm đường trên phố (dài ${p.W}): trung bình dưới ${NGUONG.PATH_MS} ms mỗi lần`, p.ms < NGUONG.PATH_MS, `${p.ms.toFixed(3)} ms, tìm được ${p.found}/300`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Ra vào thế giới 20 lần: không rò nút trang, trình nghe, bộ nhớ
  { const page = await open(browser);
    const vong = [['street', 8, 15], ['in:cafe', 8, 15], ['home', 8, 15], ['office', 9, 10], ['in:lib', 8, 15]];
    const gc = async () => { await page.cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(300); await page.cdp.send('HeapProfiler.collectGarbage'); };
    let m4;
    for (let i = 0; i < 20; i++) { const [at, d, h] = vong[i % vong.length]; await vao(page, at, d, h); await page.waitForTimeout(700); if (i === 3) { await vao(page, 'street', 8, 15); await page.waitForTimeout(700); await gc(); m4 = await metrics(page); } }
    await vao(page, 'street', 8, 15); await page.waitForTimeout(700); await gc(); const m20 = await metrics(page);
    const tang = k => (m20[k] - m4[k]) / m4[k];
    check(`Ra vào 20 lần: số nút trang không tăng dần (tối đa +${NGUONG.TANG * 100}%)`, tang('nodes') <= NGUONG.TANG, `${m4.nodes} → ${m20.nodes}`);
    check(`Ra vào 20 lần: số trình nghe sự kiện không tăng dần (tối đa +${NGUONG.TANG * 100}%)`, tang('listeners') <= NGUONG.TANG, `${m4.listeners} → ${m20.listeners}`);
    check(`Ra vào 20 lần: bộ nhớ JavaScript không tăng dần (tối đa +${NGUONG.TANG * 100}%)`, tang('heap') <= NGUONG.TANG, `${m4.heap} KB → ${m20.heap} KB`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
