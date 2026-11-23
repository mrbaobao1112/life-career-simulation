// Kiểm thử v17.7 – Phase 3: 4 TRÒ CHƠI NHỎ KIỂU MỚI (ghép 3, né bug, hứng dữ liệu, gõ theo nhịp)
// Trên trình duyệt thật, điện thoại giả lập (iPhone 13):
// 1. Mỗi trò: mở đúng trò cho đúng việc, có bàn tay hướng dẫn rồi mới tính giờ, không có đoạn chữ hướng dẫn, chơi bằng thao tác thật
//    (chạm, vuốt, kéo, phím), xong trong khoảng 22 giây, nút "Để nhân vật tự làm" cho cộng trừ 0, cách đổi điểm ra cộng trừ như cũ.
// 2. Người chơi khá (bot chơi đúng lúc) đạt điểm cao; người mới (bấm chậm, hay sai) vẫn được điểm vừa phải, không bị phạt nặng.
// 3. Giữ khung hình trên điện thoại (CPU chậm 4 lần); giảm chuyển động vẫn chơi được.
// 4. Chơi 20 lượt: không rò nút trang, không còn vòng lặp hình sau khi đóng.
// 5. MG.KIEU = 'cu' thì vẫn là 4 trò cũ.
// Chạy: npm run tro-choi-moi
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
const TRO = [['ghep', 101, '🧩 Ghép code'], ['ne', 102, '🐞 Né bug'], ['hung', 103, '📦 Hứng dữ liệu'], ['nhip', 110, '⌨️ Gõ theo nhịp']];

async function open(browser, opts = {}, cpu = 1){
  const ctx = await browser.newContext({ ...devices['iPhone 13'], ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  if (cpu > 1) { const c = await ctx.newCDPSession(page); await c.send('Emulation.setCPUThrottlingRate', { rate:cpu }); }
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="tro"]'); await page.click('#go');
  await page.evaluate(() => { S.tech = 40; window.__kq = null; });
  return page;
}
const bat = (page, tid, how = 'fast') => page.evaluate(([tid, how]) => { window.__kq = null; window.__t0 = performance.now(); mgPlay({ tid, how }).then(r => { window.__kq = { ...r, giay:(performance.now() - window.__t0) / 1000 }; }); }, [tid, how]);
const xong = page => page.waitForFunction(() => window.__kq, null, { timeout:40000 }).then(() => page.evaluate(() => window.__kq));
const choDemo = page => page.waitForFunction(() => document.querySelector('.mg') && !document.querySelector('.mgm-demo'), null, { timeout:6000 });

// Bot chơi trong trang bằng thao tác thật. gioi = true: chơi đúng lúc; false: "người mới" (chậm, hay sai)
async function choiBot(page, ten, gioi){
  if (ten === 'ghep') {                                                            // chạm hai ô cạnh nhau (thao tác thật)
    for (let i = 0; i < 60; i++) { const kq = await page.evaluate(() => window.__kq); if (kq) return;
      const m = await page.evaluate(g => { const G = mgPlay.dang; if (!G) return null; if (g || Math.random() < .35) return G.goiY(); const a = Math.floor(Math.random() * 36); return [a, a % 6 < 5 ? a + 1 : a - 1]; }, gioi);
      if (m) for (const i of m) { const b = await page.locator(`.mgm-o[data-i="${i}"]`).boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }   // chạm theo toạ độ: lưới vẽ lại sau mỗi lần chạm
      await page.waitForTimeout(gioi ? 350 : 900); }
  } else {
    await page.evaluate(([ten, gioi]) => new Promise(done => {                    // vòng đợi riêng của bot (chỉ trong bài kiểm thử)
      const kt = () => { const G = mgPlay.dang; if (!G || window.__kq) return done();
        if (ten === 'ne') { const d = G.gan(); if (d !== null && d < (gioi ? 34 : 18 + Math.random() * 40) && d > 0 && Math.random() < (gioi ? 1 : .5)) document.querySelector('.mgm-san').dispatchEvent(new PointerEvent('pointerdown', { bubbles:true })); }
        if (ten === 'hung') { const g = G.gan(); if (g) G.toi(g.xau ? (g.x < 150 ? 260 : 40) : (gioi ? g.x : g.x + (Math.random() - .5) * 120)); }
        if (ten === 'nhip') { const n = G.gan(); if (n && n.con < (gioi ? .03 : .1) && Math.random() < (gioi ? 1 : .6)) document.querySelector(`.mgm-nut button[data-l="${n.lan}"]`).dispatchEvent(new PointerEvent('pointerdown', { bubbles:true })); }
        setTimeout(kt, gioi ? 16 : 60); };
      kt(); }), [ten, gioi]);
  }
}

(async () => {
  const browser = await chromium.launch();

  // 1, 2. Từng trò
  { const page = await open(browser), diem = {};
    for (const [ten, tid, nhan] of TRO) {
      await bat(page, tid);
      const mo = await page.evaluate(() => { const b = document.querySelector('.mg'); return { ten:b && b.querySelector('.mg-tt b').textContent, demo:!!b.querySelector('.mgm-demo'), hint:!!b.querySelector('.mg-hint'), code:!!b.querySelector('code'), chu:(b.querySelector('.mg-body').innerText.match(/[\p{L}]{2,}/gu) || []).length }; });
      await page.waitForTimeout(300); const t1 = await page.evaluate(() => document.querySelector('.mg-time').textContent);
      check(`${nhan}: mở đúng trò cho việc #${tid}; có bàn tay hướng dẫn (đồng hồ chưa chạy); không có đoạn chữ hướng dẫn, không có code`, mo.ten === nhan.slice(3) && mo.demo && !mo.hint && !mo.code && t1 === '20s' && mo.chu <= 4, JSON.stringify({ ...mo, t1 }));
      await choDemo(page); await choiBot(page, ten, true); const k = await xong(page);
      diem[ten] = { gioi:k.score };
      check(`${nhan}: chơi bằng thao tác thật, xong trong khoảng 22 giây, điểm 0–1, đổi điểm ra cộng trừ như cũ (±6%)`, k.giay <= 25 && k.score >= 0 && k.score <= 1 && Math.abs(k.bonus - Math.round((k.score - .5) * 2 * .06 * 1000) / 1000) < 1e-9 && /khả năng làm tốt/.test(k.line), `${k.giay.toFixed(1)} giây, điểm ${k.score.toFixed(2)}, ${k.line}`);
      await page.waitForTimeout(1500);
      await bat(page, tid); await choDemo(page); await choiBot(page, ten, false); const m = await xong(page); diem[ten].moi = m.score;
      await page.waitForTimeout(1500);
    }
    const gioi = Object.values(diem).map(x => x.gioi), moi = Object.values(diem).map(x => x.moi);
    check('Người chơi khá (bot chơi đúng lúc) đạt điểm cao ở cả 4 trò (từ 0,7)', gioi.every(x => x >= .7), JSON.stringify(diem));
    check('Người mới (chậm, hay sai) vẫn được điểm vừa phải ở cả 4 trò (từ 0,2), thấp hơn người chơi khá', moi.every((x, i) => x >= .2 && x <= gioi[i] + .05), JSON.stringify(diem));
    await bat(page, 102); await page.waitForTimeout(800); await page.click('.mg-skip'); const s = await xong(page);
    check('"Để nhân vật tự làm": đóng ngay, cộng trừ 0 (y như trước khi có trò chơi)', s.score === null && s.bonus === 0, JSON.stringify(s));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // Thao tác thật riêng từng kiểu: vuốt (ghép), kéo (hứng), phím (né, nhịp)
  { const page = await open(browser);
    await bat(page, 101); await choDemo(page);
    const vuot = await page.evaluate(async () => { const G = mgPlay.dang, m = G.goiY(); if (!m) return 'không có nước'; const [a, b] = m, el = document.querySelector(`.mgm-o[data-i="${a}"]`), r = el.getBoundingClientRect();
      const dx = b === a + 1 ? 30 : b === a - 1 ? -30 : 0, dy = b === a + 6 ? 30 : b === a - 6 ? -30 : 0, c = [r.left + r.width / 2, r.top + r.height / 2];
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, clientX:c[0], clientY:c[1] })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles:true, clientX:c[0] + dx, clientY:c[1] + dy }));
      await new Promise(r => setTimeout(r, 700)); return +document.querySelector('.mgm-muc b').textContent; });
    await page.click('.mg-skip'); await xong(page); await page.waitForTimeout(300);
    await bat(page, 103); await choDemo(page);
    const box = await page.locator('.mgm-san').boundingBox(); await page.mouse.move(box.x + 30, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width - 30, box.y + box.height / 2, { steps:8 }); await page.mouse.up(); await page.waitForTimeout(400);
    const keo = await page.evaluate(() => { const m = document.querySelector('.mgm-may').getBoundingClientRect(), s = document.querySelector('.mgm-san').getBoundingClientRect(); return (m.left + m.width / 2 - s.left) / s.width; });
    await page.click('.mg-skip'); await xong(page); await page.waitForTimeout(300);
    await bat(page, 102); await choDemo(page); await page.keyboard.press('Space'); await page.waitForTimeout(150);
    const phimNe = await page.evaluate(() => document.querySelector('.mgm-nv').classList.contains('nhay'));
    await page.click('.mg-skip'); await xong(page); await page.waitForTimeout(300);
    await bat(page, 110); await choDemo(page); await page.keyboard.press('s'); await page.waitForTimeout(60);
    const phimNhip = await page.evaluate(() => document.querySelector('.mgm-nut button[data-l="1"]').classList.contains('an'));
    await page.click('.mg-skip'); await xong(page);
    check('Ghép code: vuốt một khối sang bên cạnh thì đổi chỗ và nổ', vuot >= 3, String(vuot));
    check('Hứng dữ liệu: kéo ngón tay thì máy chủ chạy theo', keo > .7, keo.toFixed(2));
    check('Bàn phím: Space để nhảy (Né bug), A S D để gõ nhịp', phimNe && phimNhip, JSON.stringify({ phimNe, phimNhip }));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Khung hình trên điện thoại (CPU chậm 4 lần), và giảm chuyển động
  { const page = await open(browser, {}, 4), fps = {};
    for (const [ten, tid] of TRO) {
      await bat(page, tid); await choDemo(page);
      fps[ten] = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res(Math.round(n / 4)); }; requestAnimationFrame(f); }));
      await page.click('.mg-skip'); await xong(page); await page.waitForTimeout(300);
    }
    check('Điện thoại (CPU chậm 4 lần): cả 4 trò giữ từ 40 khung hình/giây', Object.values(fps).every(x => x >= 40), JSON.stringify(fps));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }
  { const page = await open(browser, { reducedMotion:'reduce' });
    await bat(page, 102); await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({ demo:!!document.querySelector('.mgm-demo'), co:!!mgPlay.dang }));
    await choiBot(page, 'ne', true); const k = await xong(page);
    check('Giảm chuyển động: không có bàn tay động, chậm hơn, vẫn chơi được đến hết', !r.demo && r.co && k.score > .5, JSON.stringify({ ...r, diem:k.score }));
    await page.context().close(); }

  // 4. 20 lượt: không rò, không còn vòng lặp hình
  { const page = await open(browser); const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
    const m = async () => { await cdp.send('HeapProfiler.collectGarbage'); const x = (await cdp.send('Performance.getMetrics')).metrics; return Object.fromEntries(x.filter(v => ['Nodes', 'JSEventListeners'].includes(v.name)).map(v => [v.name, v.value])); };
    const raf = () => page.evaluate(() => new Promise(res => { const o = window.requestAnimationFrame; let n = 0; window.requestAnimationFrame = f => { n++; return o(f); }; setTimeout(() => { window.requestAnimationFrame = o; res(n); }, 1000); }));
    const r0 = await raf(); let m4;
    for (let i = 0; i < 20; i++) { await bat(page, TRO[i % 4][1]); await page.waitForTimeout(900); await page.click('.mg-skip'); await xong(page); if (i === 3) m4 = await m(); }
    const m20 = await m(), r1 = await raf();
    check('Chơi rồi đóng 20 lượt: số nút trang và trình nghe sự kiện không tăng dần', m20.Nodes <= m4.Nodes * 1.1 && m20.JSEventListeners <= m4.JSEventListeners * 1.1, JSON.stringify({ m4, m20 }));
    check('Đóng trò thì không còn vòng lặp hình của trò', r1 <= r0 + 2, `trước ${r0}, sau ${r1} lần gọi mỗi giây`);
    await page.context().close(); }

  // 5. Công tắc trò cũ
  { const page = await open(browser);
    await page.evaluate(() => { MG.KIEU = 'cu'; }); await bat(page, 102); await page.waitForTimeout(400);
    const cu = await page.evaluate(() => ({ code:!!document.querySelector('.mg .mg-code'), hint:!!document.querySelector('.mg .mg-hint') }));
    await page.click('.mg-skip'); await xong(page);
    check("MG.KIEU = 'cu': vẫn là trò cũ (Bắt bug đọc code)", cu.code && cu.hint, JSON.stringify(cu));
    await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
