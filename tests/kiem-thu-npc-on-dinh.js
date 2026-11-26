// Kiểm thử v17.6: NPC ỔN ĐỊNH
// 1. Lịch không trùng: lịch ở nhà, ở công ty, ngoài thành phố của mỗi người không chồng giờ; ngoài phố thì ở nhà phải là "đi vắng".
// 2. Ở từng nơi (nhà, công ty, phố giờ cao điểm, cà phê, thư viện, trung tâm thương mại, trà đá, bia hơi), cho đồng hồ chạy nhanh rồi theo dõi:
//    không ai xuất hiện hai lần cùng lúc, không ai đứng kẹt giữa đường khi đang đi, không ai ra ngoài bản đồ,
//    không ai bận mãi một việc (kẹt trạng thái), dấu "đã đi" khớp với hình trên màn hình, không lỗi.
// 3. Ra vào địa điểm liên tục: không lỗi, không nhân đôi vòng lặp hình, số người không tăng dần.
// Cần Playwright. Chạy: npm run npc-on-dinh
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
const NHANH = 6;            // đồng hồ trong game chạy nhanh gấp 3 lần bình thường (6 phút game mỗi giây) để thấy nhiều lượt ra vào
const GIAY = 30;            // theo dõi mỗi nơi chừng này giây thật

async function open(browser, bg = 'ghep'){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  await page.evaluate(() => { S.once.roamTut = true; S.money = 5e6; S.job = { co:'hotay', salary:1e7, start:3 }; });
  return page;
}
// Vào một nơi: 'home', 'office', 'street' hoặc 'in:…' lúc h giờ ngày day
const vao = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0; S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {};
  if (at === 'office') { OFFICE_BAL.ABSENT = 0; S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; }
  else { S.where = at === 'home' ? null : { d:day, slot, at, bike:null }; S.queue = [{ id:'activity', arg:slot }]; }
  S.cur = null; advance(); WORLD.end = 1e9;
}, [at, day, h]).then(() => page.waitForTimeout(600));

// Theo dõi trong trang: mỗi 250 ms đọc trạng thái mọi NPC
const theoDoi = (page, giay) => page.evaluate(async giay => {
  const W = WORLD, H = W.H, out = { trung:[], ket:[], ngoai:[], banMai:[], lech:[], mau:0, nguoi:new Set() };
  const move = new Map(), busy = new Map();
  const t0 = performance.now();
  while (performance.now() - t0 < giay * 1000) {
    await new Promise(r => setTimeout(r, 250)); if (WORLD !== W || W.dead || W.t >= W.end) break; out.mau++;   // v18.0: hết giờ của buổi thì thế giới tạm dừng (đúng thiết kế); người đang đi dở dừng giữa đường, không phải kẹt
    const now = performance.now(), seen = {};
    for (const a of W.npcs) {
      if (!a.el) continue;
      if (!!a.gone !== a.el.classList.contains('gone')) out.lech.push(a.who);
      if (a.gone) { move.delete(a); continue; }
      out.nguoi.add(a.id);
      if (a.who !== 'p' && !a.crowd) { if (seen[a.who]) out.trung.push(a.who + '@' + Math.round(W.t / 60 * 10) / 10 + 'h'); seen[a.who] = true; }
      if (a.x < -60 || a.x > H.W + 60 || a.y < 60 || a.y > 260) out.ngoai.push(a.who + ':' + Math.round(a.x) + ',' + Math.round(a.y));
      // Kẹt khi đi: game đặt ngay điểm đến rồi cho hình trượt tới trong `ms` (transitionDuration). Một quãng đi chưa xong sau ms + 3 giây là kẹt.
      const m = move.get(a), key = a.tx != null ? a.fx + '>' + a.tx : null;
      if (!key) move.delete(a);
      else if (!m || m.key !== key) move.set(a, { key, t:now, ms:parseFloat(a.el.style.transitionDuration) || 0 });
      else if (now - m.t > m.ms + 3000) { out.ket.push(a.who + ':' + Math.round(a.x) + '@' + Math.round(W.t / 60 * 10) / 10 + 'h'); move.set(a, { ...m, t:1e15 }); }
      if (a.ai) { const b = busy.get(a); if (a.ai.busy) { if (b == null) busy.set(a, W.t); else if (W.t - b > 120) { out.banMai.push(a.who); busy.set(a, 1e9); } } else busy.delete(a); }
    }
  }
  const uniq = L => [...new Set(L)];
  return { trung:uniq(out.trung).slice(0, 5), ket:uniq(out.ket).slice(0, 5), ngoai:uniq(out.ngoai).slice(0, 5), banMai:uniq(out.banMai), lech:uniq(out.lech), mau:out.mau, nguoi:out.nguoi.size, gio:Math.round(W.t / 60 * 10) / 10 };
}, giay);

(async () => {
  const browser = await chromium.launch();

  // 1. Lịch không trùng (đọc thẳng bảng lịch, mọi ngày 1–56)
  { const page = await open(browser);
    const r = await page.evaluate(() => { const bad = [];
      const tang = (L, tag) => { for (let i = 1; i < L.length; i++) if (!(L[i][0] > L[i - 1][0])) bad.push(tag + ' giờ ' + L[i][0]); };
      for (const [who, D] of Object.entries(HOME_DAY)) for (const k of ['weekday', 'weekend']) tang(D[k], 'nhà ' + who + ' ' + k);
      for (const [who, L] of Object.entries(VP_DAY)) tang(L, 'công ty ' + who);
      const keep = S.day;
      for (let d = 1; d <= 56; d++) { S.day = d;
        for (const who of Object.keys(HOME_DAY)) tang(npcDay(who, 'home'), 'nhà ' + who + ' ngày ' + d);
        for (const who of Object.keys(VP_DAY)) if (!isDayOff(d)) tang(npcDay(who, 'office'), 'công ty ' + who + ' ngày ' + d);
        for (const who of Object.keys(CITY_DAY)) for (let t = 0; t < 24 * 60; t += 10) {
          const L = CITY_DAY[who][songWeekend() ? 'weekend' : 'weekday'].filter(([a, b]) => t / 60 >= a && t / 60 < b);
          if (L.length > 1) bad.push(`${who} ở hai nơi lúc ${t / 60}h ngày ${d}`);
          if (L.length && HOME_DAY[who]) { const now = npcNow(who, 'home', t); if (now.act !== 'out') bad.push(`${who} vừa ở ${L[0][2]} vừa ở nhà (${now.act}) lúc ${t / 60}h ngày ${d}`); }
        }
      }
      S.day = keep; return [...new Set(bad)]; });
    check('Lịch không trùng: lịch nhà, công ty theo giờ tăng dần; Tùng, Linh không ở hai nơi cùng lúc; đang ở ngoài phố thì ở nhà là "đi vắng" (56 ngày)', !r.length, r.slice(0, 4).join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Theo dõi từng nơi khi đồng hồ chạy nhanh
  const NOI = [
    ['Nhà ở ghép, ngày thường từ trưa', 'home', 8, 12.5, 'ghep'], ['Nhà bố mẹ, cuối tuần từ sáng', 'home', 6, 8, 'nha'], ['Công ty, cả ngày làm việc', 'office', 9, 9.2, 'ghep'],
    ['Phố giờ cao điểm chiều', 'street', 8, 16.8, 'ghep'], ['Quán cà phê chiều cuối tuần', 'in:cafe', 6, 14.5, 'ghep'], ['Thư viện ngày thường', 'in:lib', 8, 13.6, 'ghep'],
    ['Trung tâm thương mại chiều', 'in:mall', 8, 13.6, 'ghep'], ['Trà đá chiều cuối tuần', 'in:trada', 6, 15, 'ghep'], ['Bia hơi tối', 'in:bia', 8, 19.6, 'ghep'], ['Hồ Bán Nguyệt sáng', 'in:lake', 6, 7, 'ghep'],
  ];
  for (const [ten, at, day, h, bg] of NOI) {
    const page = await open(browser, bg); await vao(page, at, day, h);
    await page.evaluate(n => { ROAM.MIN_PER_SEC = n; }, NHANH);
    const r = await theoDoi(page, GIAY);
    const ok = !r.trung.length && !r.ket.length && !r.ngoai.length && !r.banMai.length && !r.lech.length && r.mau > 40 && !page.errs.length;
    check(`${ten} (${h}h → ${r.gio}h, ${r.nguoi} người): không ai trùng mặt, kẹt giữa đường, ra ngoài bản đồ, bận mãi, hay ẩn hiện sai`, ok,
      JSON.stringify({ trung:r.trung, ket:r.ket, ngoai:r.ngoai, banMai:r.banMai, lech:r.lech, mau:r.mau }) + (page.errs[0] ? ' lỗi: ' + page.errs[0] : ''));
    await page.context().close();
  }

  // 3. Ra vào địa điểm liên tục: không lỗi, không nhân đôi vòng lặp hình, số người không tăng dần, khung cũ được dọn
  { const page = await open(browser);
    await page.evaluate(() => { const raf = window.requestAnimationFrame; window.__raf = 0; window.requestAnimationFrame = f => { window.__raf++; return raf(f); }; });
    const vong = ['street', 'in:cafe', 'home', 'in:lib', 'office', 'street', 'in:mall', 'in:trada', 'home', 'street', 'in:bia', 'office'];
    const so = [];
    for (let i = 0; i < 2; i++) for (const at of vong) { await vao(page, at, at === 'office' ? 9 : 8, at === 'office' ? 10 : at === 'in:bia' ? 19.5 : 15); await page.waitForTimeout(500);
      so.push(await page.evaluate(() => ({ worlds:document.querySelectorAll('#world').length, actors:document.querySelectorAll('#world .actor').length, npcs:WORLD.npcs.length }))); }
    const raf = await page.evaluate(async () => { window.__raf = 0; await new Promise(r => setTimeout(r, 2000)); return window.__raf / 2; });
    const a = so.slice(0, vong.length), b = so.slice(vong.length);
    const grow = b.some((x, i) => x.actors > a[i].actors + 6);
    check('Ra vào 24 lần qua 8 nơi: luôn chỉ một khung thế giới, số người ở mỗi nơi không tăng dần, không lỗi', so.every(x => x.worlds === 1) && !grow && !page.errs.length, JSON.stringify(b.map(x => x.actors)) + (page.errs[0] || ''));
    check('Chỉ một vòng lặp hình đang chạy (khoảng 60 lần mỗi giây, không nhân đôi)', raf > 20 && raf < 100, raf + ' lần mỗi giây');
    await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
