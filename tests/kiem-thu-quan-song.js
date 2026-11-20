// Kiểm thử v17.5 – Phase 2: quán có đời sống thật (nhân viên phục vụ, vòng đời khách, người chơi tham gia). Cần Playwright.
// Chạy: npm run quan-song
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('Bỏ qua: máy này chưa có Playwright (npm i -D playwright).'); process.exit(0); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, bg = 'tro', opts = {}){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; S.money = 5e6; window.__said = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  return page;
}
// Vào nơi `at` lúc h giờ ngày `day` (6 = thứ Bảy, 8 = thứ Hai); h phải nằm trong khung giờ của buổi
const scene = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 12 ? 'morning' : h < 18.5 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0;
  S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = { d:day, slot, at, bike:null };
  S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.end = 1e9;
}, [at, day, h]).then(() => page.waitForTimeout(800));
const until = (page, fn, arg, ms = 20000) => page.waitForFunction(fn, arg, { timeout:ms }).then(() => true, () => false);
// Chạy một mục trong thực đơn của một người (như bấm vào họ rồi chọn)
const runEntry = (page, sel, re) => page.evaluate(([sel, re]) => { const a = eval(sel); const e = a.entries(WORLD.ref, WORLD.sc).find(x => new RegExp(re).test(x.label));
  if (!e) return a.entries(WORLD.ref, WORLD.sc).map(x => x.label).join(' | '); if (e.off) return 'OFF: ' + e.why; e.run(WORLD, WORLD.api); return true; }, [sel, re]);

(async () => {
  const browser = await chromium.launch();

  // 1. Quán cà phê: nhân viên sau quầy, khách gọi đồ, nhân viên pha chế và đưa đồ, khách cầm cốc về chỗ, trả tiền
  { const page = await open(browser); await scene(page, 'in:cafe', 6, 15);
    const b = await page.evaluate(() => { const P = WORLD.pv, s = P.s, L = s.el.parentNode, kids = [...L.children], front = L.querySelector('.pv-front');
      return { staff:!!s, y:s.y, dy:s.dy, front:!!front, order:kids.indexOf(s.el) < kids.indexOf(front), seatedCups:WORLD.pop.pool.filter(a => a.vis && a.vis.seat >= 0 && a.holding).length, seated:WORLD.pop.pool.filter(a => a.vis && a.vis.seat >= 0).length }; });
    check('Chị pha chế đứng sau quầy: quầy che nửa người, thấy từ vai trở lên', b.staff && b.y < 148 && b.dy < 0 && b.front && b.order, JSON.stringify(b));
    check('Khách đang ngồi sẵn có cốc trên tay', b.seated > 0 && b.seatedCups === b.seated, `${b.seatedCups}/${b.seated}`);
    await page.evaluate(() => { DS.SPAWN = 1; window.__pv = []; const d = pvDo; pvDo = (W, api, j) => { window.__pv.push(j.kind); return d(W, api, j); }; });
    const served = await until(page, () => WORLD.pop.pool.some(a => a.vis && a.vis.i >= 1 && a.holding && a.vis.steps[0][4] === '☕' && a.vis.served) || window.__pv.includes('order') && WORLD.pop.pool.some(a => a.vis && a.vis.pv === null && a.holding), null, 30000);
    const r = await page.evaluate(() => ({ pv:window.__pv.slice(), said:window.__said.slice(-12), cook:WORLD.pv.s.el.querySelector('.cb').getAttribute('class') }));
    const noi = await page.evaluate(() => PV_PLACE['in:cafe'].noi);
    check('Khách đến quầy gọi đồ, chị pha chế nhận lời và đưa đồ', served && r.pv.includes('order') && r.said.some(s => noi.goi.includes(s)) && r.said.some(s => noi.nhan.includes(s)) && r.said.some(s => noi.dua.includes(s)), r.said.join(' | '));
    const cook = await page.evaluate(async () => { WORLD.pv.q.push({ kind:'order', me:true }); for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 150)); if (/act-cook/.test(WORLD.pv.s.el.querySelector('.cb').getAttribute('class'))) return { ok:true, x:Math.round(WORLD.pv.s.x) }; } return { ok:false }; });
    check('Khi pha chế, chị đi ra máy pha và có động tác pha', cook.ok && cook.x < 130, JSON.stringify(cook));
    const pay = await until(page, () => window.__pv.includes('pay'), null, 60000);
    check('Khách uống xong ra quầy trả tiền, chị báo giá và cảm ơn', pay && (await page.evaluate(() => window.__said.some(s => PV_PLACE['in:cafe'].noi.tra.includes(s)))));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Dọn bàn, lúc rảnh lau quầy / nghỉ ngắn
  { const page = await open(browser); await scene(page, 'in:cafe', 8, 14);
    await page.evaluate(() => { DS.SPAWN = 0; WORLD.pv.q = []; pvLeft(WORLD, DS_PLACE['in:cafe'].seats[0]); });
    const c = await until(page, () => { const s = WORLD.pv.s; return /act-sweep/.test(s.el.querySelector('.cb').getAttribute('class')) && s.x > 250; }, null, 20000);
    check('Khách về: chị pha chế ra dọn bàn (🧽)', c);
    const back = await until(page, () => !WORLD.pv.busy && WORLD.pv.s.y < 148, null, 25000);
    check('Dọn xong thì quay về sau quầy', back);
    await page.evaluate(() => { WORLD.pv.next = WORLD.t; });
    const idle = await until(page, () => /act-sweep|act-phone/.test(WORLD.pv.s.el.querySelector('.cb').getAttribute('class')) && WORLD.pv.s.y < 148, null, 10000);
    check('Lúc rảnh: lau quầy hoặc nghỉ ngắn', idle);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Người chơi gọi cà phê ở quầy: chị pha chế làm thật cho mình
  { const page = await open(browser); await scene(page, 'in:cafe', 8, 14);
    await page.evaluate(() => { DS.SPAWN = 0; const o = WORLD.H.objs.find(x => x.id === 'counter'); WORLD.me.x = o.spot.x; WORLD.me.y = o.spot.y; }); await page.waitForTimeout(400);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const menu = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim())), m0 = await page.evaluate(() => S.money);
    const k = menu.findIndex(t => /mang về/.test(t)); if (k >= 0) await page.keyboard.press('Digit' + (k + 1));
    const cup = await until(page, () => WORLD.me.holding === 'cup', null, 25000);
    const m1 = await page.evaluate(() => S.money);
    check('Gọi cà phê ở quầy: trả tiền, chị pha chế pha rồi đưa cốc cho mình', k >= 0 && cup && m0 - m1 === 25000, `${menu.join(' | ')} · ${m0 - m1}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Ngồi cùng bàn nói chuyện với khách: mất thời gian, vui hơn chút, có giới hạn mỗi ngày
  { const page = await open(browser); await scene(page, 'in:cafe', 6, 15);
    const sel = 'WORLD.pop.pool.find(a => a.vis && a.vis.seat >= 0 && !a.vis.pv)';
    const r = [];
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => { WORLD.pop.pool.forEach(a => { if (a.vis) a.vis.until = Infinity; }); });
      const s0 = await page.evaluate(() => ({ mood:S.mood, t:WORLD.t }));
      const ok = await runEntry(page, sel, 'Ngồi cùng bàn');
      await until(page, () => !WORLD.busy, null, 30000);
      const s1 = await page.evaluate(() => ({ mood:S.mood, t:WORLD.t, feed:S.feed[S.feed.length - 1].text }));
      r.push({ ok, dm:s1.mood - s0.mood, dt:Math.round(s1.t - s0.t), feed:s1.feed });
    }
    check('Ngồi cùng bàn với khách: có lựa chọn, đi tới ngồi, nói chuyện, mất ~15 phút', r[0].ok === true && r[0].dt >= 14, JSON.stringify(r[0]));
    check('Tinh thần +1, ghi vào nhật ký; mỗi ngày chỉ cộng tối đa 2 lần', r[0].dm === 1 && r[1].dm === 1 && r[2].dm === 0 && /Ngồi nói chuyện/.test(r[0].feed), r.map(x => x.dm).join(','));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Mời Linh một cốc: tốn tiền, thân hơn, Linh nhớ và nhắc lại hôm sau
  { const page = await open(browser); await scene(page, 'in:cafe', 6, 15);
    const s0 = await page.evaluate(() => ({ money:S.money, rel:S.rel.linh }));
    const ok = await runEntry(page, "WORLD.npcs.find(n => n.who === 'linh' && !n.gone)", 'Mời');
    await until(page, () => !WORLD.busy, null, 15000);
    const s1 = await page.evaluate(() => ({ money:S.money, rel:S.rel.linh, mem:MEM_DEBUG(), cup:WORLD.npcs.find(n => n.who === 'linh').holding }));
    check('Mời Linh một cốc: trả 25.000đ, Linh thân hơn 3, Linh cầm cốc', ok === true && s0.money - s1.money === 25000 && s1.rel - s0.rel === 3 && s1.cup === 'cup', JSON.stringify({ ok, ...s1 }));
    check('Linh ghi nhớ lần được mời', s1.mem.some(m => m.startsWith('linh>me:moi_nuoc+')), s1.mem.join(' '));
    const again = await runEntry(page, "WORLD.npcs.find(n => n.who === 'linh' && !n.gone)", 'Mời');
    check('Trong ngày chỉ mời một lần', /OFF/.test(String(again)), String(again));
    const next = await page.evaluate(() => { S.day = 7; const r = memRecall('linh', 'talk'); S.day = 6; return r && r.text; });
    check('Hôm sau Linh nhắc lại chuyện được mời', !!next && /mời/.test(next), next);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Trà đá: bác mang trà ra tận ghế; mời Tùng thì bác mang cốc cho Tùng
  { const page = await open(browser, 'ghep'); await scene(page, 'in:trada', 6, 16);
    await page.evaluate(() => { window.__pv = []; const d = pvDo; pvDo = (W, api, j) => { window.__pv.push(j.kind); return d(W, api, j); }; DS.SPAWN = 1; });
    const ok = await runEntry(page, "WORLD.npcs.find(n => n.who === 'tung' && !n.gone)", 'Mời');
    const tung = await until(page, () => WORLD.npcs.find(n => n.who === 'tung').holding === 'cup', null, 25000);
    check('Mời Tùng cốc trà: bác bán trà đá mang ra tận chỗ Tùng', ok === true && tung, String(ok));
    const bring = await until(page, () => window.__pv.filter(k => k === 'bring').length >= 2 || WORLD.pop.pool.some(a => a.vis && a.vis.seat >= 0 && a.holding), null, 40000);
    check('Khách mới ngồi xuống: bác mang trà ra ghế', bring);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Cơm bụi, thu ngân, thư viện: cùng kiến trúc
  { const page = await open(browser); await scene(page, 'in:com', 8, 11.5);
    await page.evaluate(() => { window.__pv = []; const d = pvDo; pvDo = (W, api, j) => { window.__pv.push(j.kind); return d(W, api, j); }; DS.SPAWN = 1; });
    const com = await until(page, () => window.__pv.includes('order'), null, 30000);
    const comSaid = await page.evaluate(() => window.__said.some(s => PV_PLACE['in:com'].noi.nhan.includes(s) || PV_PLACE['in:com'].noi.dua.includes(s)));
    check('Cơm bụi: cô bán cơm đứng sau tủ kính, khách gọi suất cơm, cô xới và đưa', com && comSaid && (await page.evaluate(() => WORLD.pv.s.y < 148)));
    await scene(page, 'in:mall', 8, 15);
    await page.evaluate(() => { window.__pv = []; const d = pvDo; pvDo = (W, api, j) => { window.__pv.push(j.kind); return d(W, api, j); }; DS.SPAWN = 1; DS_SCRIPT.mall[2][1] = 1; });
    const mall = await until(page, () => window.__pv.includes('pay'), null, 40000);
    check('Trung tâm thương mại: khách ra quầy, thu ngân tính tiền', mall);
    await scene(page, 'in:lib', 8, 9); await page.evaluate(() => { WORLD.pv.next = WORLD.t; WORLD.pv.cfg.noi.ranh = ['📚']; });
    const lib = await until(page, () => Math.abs(WORLD.pv.s.x - 410) < 12, null, 15000);
    check('Thư viện: cô thủ thư lúc rảnh đi xếp sách', lib);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 8. P3-05 hết chỗ thì không vào rồi ra ngay; P3-04 dáng ngồi, dưỡng sinh
  { const page = await open(browser); await scene(page, 'in:cafe', 6, 15);
    const r = await page.evaluate(() => { const P = WORLD.pop; P.pool.forEach(a => { if (!a.vis) return; a.vis.until = Infinity; }); for (let i = 0; i < P.seats.length; i++) if (!P.seats[i]) P.seats[i] = { id:'gia' };
      let n = 0; for (let i = 0; i < 20; i++) if (popSpawn(WORLD, WORLD.api, Math.random)) n++; return n; });
    check('Quán hết chỗ: không có khách nào vào rồi ra ngay ở cửa', r === 0, r + ' lần vào');
    const sit = await page.evaluate(() => WORLD.pop.pool.filter(a => a.vis && a.vis.seat >= 0).map(a => a.el.querySelector('.cb').getAttribute('class')));
    check('Khách ngồi ghế có dáng ngồi', sit.length > 0 && sit.every(c => /act-sit/.test(c)), sit[0]);
    await scene(page, 'in:lake', 8, 17.5);   // buổi chiều (buổi sáng bắt đầu từ giờ thức dậy)
    const lake = await page.evaluate(() => ({ ex:WORLD.pop.ex.filter(a => !a.gone).map(a => a.el.querySelector('.cb').getAttribute('class')), sit:DS_SCRIPT.lakeSit[0][2] }));
    check('Hồ: nhóm dưỡng sinh tập động tác tay; người ngồi ghế đá có dáng ngồi', lake.ex.length === 4 && lake.ex.every(c => /act-tap/.test(c)) && lake.sit === 'act-think', JSON.stringify(lake));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 9. Tắt được; điện thoại, giảm chuyển động
  { const page = await open(browser); await page.evaluate(() => { PV.ON = false; }); await scene(page, 'in:cafe', 6, 15);
    const off = await page.evaluate(() => ({ pv:!!WORLD.pv, sit:WORLD.pop.pool.find(a => a.vis && a.vis.seat >= 0).entries().length }));
    check('Tắt (PV.ON = false): nhân viên như cũ, khách chỉ chào được', !off.pv && off.sit === 1, JSON.stringify(off));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }
  { const page = await open(browser, 'tro', { ...devices['iPhone 13'], reducedMotion:'reduce' }); await scene(page, 'in:cafe', 6, 15);
    await page.evaluate(() => { DS.SPAWN = 1; }); await page.waitForTimeout(6000);
    const w = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    check('Điện thoại, giảm chuyển động: quán chạy bình thường, không tràn ngang', w[0] <= w[1], w.join(' / '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
