// Kiểm thử v17.4: các lỗi bắt buộc sửa sau lần kiểm tra toàn diện v17.3 (docs/AUDIT_REPORT_v17.3.md). Cần Playwright.
// Chạy: npm run sua-loi-17-4
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('Bỏ qua: máy này chưa có Playwright (npm i -D playwright).'); process.exit(0); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, bg = 'tro'){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; S.money = 5e6; });
  return page;
}
// Vào nơi `at` lúc h giờ của ngày `day` (ngày 6 là thứ Bảy, ngày 8 là thứ Hai)
const scene = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 11 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0;
  S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = at === 'home' ? null : { d:day, slot, at, bike:null };
  S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.t = h * 60; WORLD.end = 1e9;
}, [at, day, h]).then(() => page.waitForTimeout(500));
const until = (page, fn, arg, ms = 15000) => page.waitForFunction(fn, arg, { timeout:ms }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();

  // 1. NPC được gọi cùng lúc ra một chỗ (pantry) không đứng chồng lên nhau
  { const page = await open(browser);
    await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 10; S.slot = 'afternoon'; S.roam = { d:10, t:900 }; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.t = 900; WORLD.end = 1e9; });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const B = { spot:'pantry', act:'act-drink', sign:'🍰', dur:[30, 40] }; WORLD.npcs.filter(a => a.ai && !a.gone).forEach(a => { a.ai.busy = false; a.ai.inBeat = false; songForceBeat(WORLD, WORLD.api, a, B); }); });
    await until(page, () => WORLD.npcs.filter(a => a.ai && !a.gone).every(a => a.ai.inBeat), null, 20000);
    const pos = await page.evaluate(() => WORLD.npcs.filter(a => a.ai && !a.gone).map(a => ({ who:a.who, x:Math.round(a.x), y:Math.round(a.y) })));
    let minD = 1e9; for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) minD = Math.min(minD, Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y));
    check(`${pos.length} người cùng được gọi ra pantry: mỗi người một chỗ, không ai đứng chồng`, pos.length >= 3 && minD >= 20, `gần nhất ${Math.round(minD)} · ${pos.map(p => p.who + '@' + p.x).join(' ')}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Người đi bộ chỉ hiện ra/biến mất ở mép bản đồ hoặc ở cửa quán, không ở giữa đường
  { const page = await open(browser); await scene(page, 'street', 8, 17.5); await page.evaluate(() => { WORLD.me.x = 380; WORLD.me.y = 176; });   // đứng gần chỗ giáp ngõ và phố
    await page.evaluate(() => { PS.SPAWN = 1; window.__ev = [];
      // ghi đúng lúc game cho người đi bộ hiện ra (songAppear) và khuất đi (psDone), kèm vị trí thật trên màn hình
      const ap = songAppear, dn = psDone, real = a => new DOMMatrix(getComputedStyle(a.el).transform).e;
      songAppear = (api, a, x, y) => { if (/^w\d/.test(a.id)) window.__ev.push(['hien', Math.round(x), Math.round(y), songInView(WORLD, x)]); return ap(api, a, x, y); };
      psDone = a => { const x = real(a); window.__ev.push(['mat', Math.round(x), Math.round(a.y), songInView(WORLD, x)]); return dn(a); }; });
    await page.waitForTimeout(25000);
    const r = await page.evaluate(() => { const doors = PHO_DOORS.map(d => d.x + d.w / 2), ok = x => x <= PS.EDGE + 6 || x >= PHO.W - PS.EDGE - 6 || doors.some(d => Math.abs(d - x) < 40);
      const seen = window.__ev.filter(e => e[3]);   // chỉ tính lúc người chơi nhìn thấy (ngoài khung nhìn thì game được phép dịch chuyển thẳng cho nhẹ máy)
      return { n:window.__ev.length, seen:seen.length, bad:seen.filter(e => !ok(e[1])), junction:window.__ev.filter(e => Math.abs(e[1] - (PHO.LANE + 10)) < 20) }; });
    check('Người đi bộ xuất hiện và biến mất ở mép bản đồ hoặc ở cửa quán', r.n >= 4 && !r.bad.length, `${r.n} lần (${r.seen} lần trong khung nhìn) · sai chỗ ${JSON.stringify(r.bad.slice(0, 3))}`);
    check('Không còn hiện ra/biến mất ở chỗ giáp ngõ và phố', !r.junction.length, JSON.stringify(r.junction.slice(0, 3)));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Tùng, Linh theo đúng lịch của họ; vắng mặt thì vẫn làm được một mình
  { const page = await open(browser, 'ghep');
    await scene(page, 'in:trada', 8, 15);
    const a = await page.evaluate(() => ({ tung:WORLD.npcs.some(n => n.who === 'tung' && !n.gone), cityAt:(cityAt('tung', WORLD.t) || {}).place }));
    check('Thứ Hai 15:00 ở trà đá: Tùng không có ở đây (Tùng đang đứng quầy ở trung tâm thương mại)', !a.tung && a.cityAt === 'in:mall', JSON.stringify(a));
    await page.evaluate(() => { const o = WORLD.H.objs.find(x => x.id === 'stools'); WORLD.me.x = o.spot.x; WORLD.me.y = o.spot.y; }); await page.waitForTimeout(400);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const menu = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
    check('Thực đơn ghế nhựa: “Ngồi trà đá một mình”', menu.some(t => /Ngồi trà đá một mình/.test(t)), menu.join(' | '));
    const s0 = await page.evaluate(() => ({ rel:S.rel.tung, money:S.money, mood:S.mood }));
    const k = menu.findIndex(t => /một mình/.test(t)); await page.keyboard.press('Digit' + (k + 1));
    await until(page, m => S.money !== m, s0.money);
    const s1 = await page.evaluate(() => ({ rel:S.rel.tung, money:S.money, mood:S.mood, toast:(document.querySelector('.w-toast') || {}).textContent || '' }));
    check('Ngồi một mình: vẫn trả tiền trà, tinh thần tăng, quan hệ với Tùng không đổi', s1.money === s0.money - 10000 && s1.mood > s0.mood && s1.rel === s0.rel, JSON.stringify(s1).slice(0, 160));
    await scene(page, 'in:trada', 6, 16);
    const b = await page.evaluate(() => { const t = WORLD.npcs.find(n => n.who === 'tung' && !n.gone); return t ? t.entries(WORLD.ref, WORLD.sc).map(e => e.label) : null; });
    check('Thứ Bảy 16:00: Tùng ngồi trà đá, đứng cạnh thì rủ “Trà đá vỉa hè với Tùng” được', b && b.some(l => /Tùng/.test(l)), JSON.stringify(b));
    await scene(page, 'in:cafe', 8, 15);
    const c = await page.evaluate(() => ({ linh:WORLD.npcs.some(n => n.who === 'linh' && !n.gone), place:(cityAt('linh', WORLD.t) || {}).place }));
    check('Thứ Hai 15:00 ở quán cà phê: Linh không có ở đây (đang ở thư viện)', !c.linh && c.place === 'in:lib', JSON.stringify(c));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Linh đi từ cửa vào chỗ khi đến giờ, hết giờ thì đi ra cửa (không bật hiện tại chỗ ngồi)
  //    Thứ Bảy, quán cà phê: Linh đến lúc 14:30, về lúc 17:00. Vào cảnh lúc 14:18 (trong khung giờ chiều, đồng hồ không bị kéo lùi).
  { const page = await open(browser);
    await scene(page, 'in:cafe', 6, 14.3);
    const pre = await page.evaluate(() => { const a = WORLD.city.find(x => x.city === 'linh'); return { gone:a.gone, t:WORLD.t }; });
    await page.evaluate(() => { window.__lp = []; const a = WORLD.city.find(x => x.city === 'linh'); setInterval(() => { if (!a.gone) { const m = new DOMMatrix(getComputedStyle(a.el).transform); window.__lp.push(Math.round(m.e)); } }, 50); });
    await until(page, () => WORLD.city.find(x => x.city === 'linh').el.querySelector('.npc-sign'), null, 20000);
    const inn = await page.evaluate(() => ({ first:window.__lp[0], last:window.__lp[window.__lp.length - 1], n:window.__lp.length }));
    check('14:30: Linh hiện ra ở cửa rồi đi vào chỗ ngồi', pre.gone && inn.first < 70 && Math.abs(inn.last - 300) < 12 && inn.n > 5, JSON.stringify({ pre, inn }));
    await page.evaluate(() => { WORLD.t = 16.99 * 60; window.__lp = []; });
    await until(page, () => WORLD.city.find(x => x.city === 'linh').gone, null, 20000);
    const out = await page.evaluate(() => ({ first:window.__lp[0], last:window.__lp[window.__lp.length - 1] }));
    check('17:00: Linh đứng dậy đi ra cửa rồi mới khuất', out.first > 250 && out.last < 70, JSON.stringify(out));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Hết buổi khi đang ở ngoài phố: kết quả là đi dạo phố, không phải xem phim ở nhà
  { const page = await open(browser); await scene(page, 'street', 8, 19);
    const s0 = await page.evaluate(() => ({ mood:S.mood, energy:S.energy }));
    await page.evaluate(() => { WORLD.end = WORLD.t + 2; });
    await until(page, () => { const t = document.querySelector('.w-toast'); return t && !t.hidden; }, null, 15000);
    const r = await page.evaluate(() => ({ text:document.querySelector('.w-toast').textContent, mood:S.mood, energy:S.energy }));
    check('Hết buổi ngoài phố: kết quả “dạo phố”, không nhắc chuyện xem phim', !/phim/.test(r.text) && /phố/.test(r.text), r.text.slice(0, 100));
    check('Chỉ số theo việc dạo phố: tinh thần nhích lên (+2, qua cách tính tăng dần của game), năng lượng −2', r.mood > s0.mood && r.mood <= s0.mood + 2 && r.energy === Math.max(0, s0.energy - 2), JSON.stringify({ s0, r:{ mood:r.mood, energy:r.energy } }));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Giờ trong nhật ký và giờ trên đầu trang theo đúng đồng hồ của thế giới
  { const page = await open(browser);
    await page.evaluate(() => { S.day = 8; S.slot = 'morning'; S.roam = { d:8, t:633 }; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:'morning' }]; S.cur = null; advance(); WORLD.end = 1e9; WORLD.t = 633; });
    await page.waitForTimeout(1500);
    const h = await page.evaluate(() => ({ meta:document.querySelector('#who .who-meta').textContent, clock:clock(WORLD.t / 60) }));
    check('Đầu trang hiện đúng giờ của đồng hồ trong cảnh', h.meta.includes(h.clock), JSON.stringify(h));
    const f = await page.evaluate(() => { const i = current.choices.findIndex(c => c.actId === 'film'); const t = clock(WORLD.t / 60); choose(i); const last = S.feed[S.feed.length - 1]; return { t, feed:last.t, text:last.text }; });
    check('Chọn từ “Danh sách lựa chọn” khi đang trong thế giới: nhật ký ghi đúng giờ trên đồng hồ', f.feed === f.t, JSON.stringify(f));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
