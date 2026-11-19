// Kiểm thử thế giới sống – Phase 3 (thành phố sống): dân số theo giờ, khách vãng lai, phố và ngõ, mưa, Tùng/Linh ngoài phố,
// sự kiện thế giới có giãn cách. Cần Playwright. Chạy: npm run thanh-pho
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
  await page.evaluate(() => { S.once.roamTut = true; });
  return page;
}
// Vào nơi `at` lúc h giờ của ngày `day` (ngày 6 là thứ Bảy, ngày 8 là thứ Hai)
const scene = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0;
  S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = at === 'home' ? null : { d:day, slot, at, bike:null };
  S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.t = h * 60; WORLD.end = 1e9;
}, [at, day, h]).then(() => page.waitForTimeout(500));
const P = page => page.evaluate(() => POP_DEBUG());

(async () => {
  const browser = await chromium.launch();

  // 1. Mật độ theo giờ và ngày nghỉ (bảng DS_PLACE)
  { const page = await open(browser);
    const d = await page.evaluate(() => { const c = DS_PLACE['in:cafe'], b = DS_PLACE['in:bia'], r = {};
      S.day = 8; r.cafe8 = dsTarget(c, 'in:cafe', 8 * 60); r.cafe15 = dsTarget(c, 'in:cafe', 15 * 60); r.cafe3 = dsTarget(c, 'in:cafe', 3 * 60); r.bia10 = dsTarget(b, 'in:bia', 10 * 60); r.bia19 = dsTarget(b, 'in:bia', 19 * 60);
      S.day = 6; r.cafeWe = dsTarget(c, 'in:cafe', 15 * 60); return r; });
    check('Cà phê: chiều đông hơn sáng sớm, nửa đêm vắng tanh', d.cafe15 > d.cafe8 && d.cafe3 === 0, JSON.stringify(d));
    check('Bia hơi: 10 giờ sáng vắng, 7 giờ tối đông', d.bia10 === 0 && d.bia19 >= 3, `${d.bia10} → ${d.bia19}`);
    check('Cuối tuần quán cà phê đông hơn ngày thường (không quá sức chứa)', d.cafeWe >= d.cafe15 && d.cafeWe <= 5, `${d.cafe15} → ${d.cafeWe}`);
    await page.context().close(); }

  // 2. Khách vãng lai ở quán cà phê: có sẵn người, ghế không trùng, khách đến rồi đi, số nhân vật không tăng
  { const page = await open(browser); await scene(page, 'in:cafe', 8, 15);
    const p0 = await P(page), n0 = await page.evaluate(() => WORLD.npcs.length);
    check('Vào quán lúc 15:00: đã có khách ngồi sẵn', p0.active >= 2, JSON.stringify(p0));
    await page.evaluate(() => { DS.SPAWN = 1; window.__gone = 0; const g = popGone; popGone = (W, a) => { window.__gone++; return g(W, a); };
      WORLD.pop.pool.forEach(a => { if (a.vis) a.vis.until = Math.min(a.vis.until, WORLD.t + 3); }); });
    let maxA = 0, dup = false, overlap = false;
    for (let k = 0; k < 14; k++) { await page.waitForTimeout(700);
      const s = await page.evaluate(() => { const P = WORLD.pop, ids = P.seats.filter(Boolean).map(a => a.id), sat = P.seats.filter(Boolean);
        return { a:P.pool.filter(a => a.vis).length, dup:new Set(ids).size !== ids.length,
          ov:(still => { for (const a of still) for (const b of still) if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < 10) return `${a.id}@${Math.round(a.x)},${Math.round(a.y)} b${a.vis.i}/${a.vis.steps[a.vis.i - 1]} & ${b.id}@${Math.round(b.x)},${Math.round(b.y)} b${b.vis.i}/${b.vis.steps[b.vis.i - 1]}`; return ''; })(P.pool.filter(a => a.vis && !a.vis.busy && !a.gone)) }; });
      maxA = Math.max(maxA, s.a); dup = dup || s.dup; overlap = overlap || s.ov; }
    const r = await page.evaluate(() => ({ gone:window.__gone, n:WORLD.npcs.length, cap:WORLD.pop.cfg.cap, pool:WORLD.pop.pool.length }));
    check('Khách xong việc thì ra về (vòng đời: vào → gọi đồ → ngồi → về)', r.gone >= 1, `${r.gone} khách đã về`);
    check('Không bao giờ quá số chỗ của quán', maxA <= r.cap, `tối đa ${maxA}/${r.cap}`);
    check('Hai khách không ngồi chung một ghế, không đè lên nhau', !dup && !overlap, overlap || '');
    check('Số nhân vật không tăng (dùng lại nhóm có sẵn)', r.n === n0 && r.pool <= 7, `${n0} → ${r.n}`);
    const m = await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'p' && n.label === 'Chị pha chế'); return !!a; });
    check('Nhân viên quán (chị pha chế) vẫn đứng quầy', m);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Hồ Bán Nguyệt: nhóm tập dưỡng sinh sáng sớm, trưa thì không
  { const page = await open(browser); const ex = () => page.waitForFunction(() => WORLD && WORLD.pop && WORLD.pop.id === 'in:lake', null, { timeout:8000 }).then(() => page.waitForTimeout(600)).then(() => P(page)).then(p => p.ex);
    await scene(page, 'in:lake', 8, 6); const a = await ex(); await scene(page, 'in:lake', 8, 13); const b = await ex();
    check('Hồ: 6 giờ sáng có nhóm tập dưỡng sinh, 13 giờ thì không', a === 4 && b === 0, `${a} → ${b}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Phố và ngõ theo giờ
  { const page = await open(browser); await scene(page, 'street', 8, 7.5);
    await page.evaluate(() => { PS.SPAWN = 1; }); await page.waitForTimeout(3000);
    const st = () => page.evaluate(() => { const G = WORLD.street; return { walk:G.walk.filter(a => a.vis).length, bike:G.bike.filter(a => a.vis).length, hx:!G.lane[0].gone, kid:!G.lane[2].gone,
      n:WORLD.npcs.length, sign:G.walk.filter(a => a.vis && a.el.querySelector('.npc-sign')).length, wy:G.walk.filter(a => a.vis).map(a => Math.round(a.y)) }; });
    const s1 = await st();
    check('7:30 sáng thứ Hai: có người đi bộ và xe máy trên phố', s1.walk >= 2 && s1.bike >= 1, JSON.stringify(s1));
    check('7:30 sáng: hàng xóm đứng nói chuyện trong ngõ, trẻ con chưa ra chơi', s1.hx && !s1.kid, JSON.stringify(s1));
    const n1 = s1.n;
    await page.evaluate(() => { S.flags.rainDay = S.day; }); await page.waitForTimeout(4000);
    const s2 = await st();
    check('Trời mưa: người đi bộ chạy vào mái hiên trú (☔)', s2.sign >= 1 && s2.wy.some(y => y <= 160), JSON.stringify(s2));
    check('Trời mưa: hàng xóm vào nhà', !s2.hx);
    await page.evaluate(() => { S.flags.rainDay = 0; WORLD.t = 150; WORLD.street.walk.concat(WORLD.street.bike).forEach(a => { songHide(a, true); a.vis = null; }); }); await page.waitForTimeout(2500); const s3 = await st();
    check('2:30 sáng: phố vắng, không ai đi lại', s3.walk === 0 && s3.bike === 0 && !s3.hx, JSON.stringify(s3));
    await scene(page, 'street', 6, 16); await page.waitForTimeout(600); const s4 = await st();
    check('Chiều thứ Bảy: trẻ con chơi trong ngõ', s4.kid);
    check('Số nhân vật trên phố có giới hạn', n1 <= 20 && s4.n <= 20, `${n1}, ${s4.n}`);
    const nearMenu = await page.evaluate(() => { WORLD.me.x = 66; WORLD.me.y = 164; return true; }); await page.waitForTimeout(400);
    const pr = await page.$eval('.w-prompt', e => e.textContent).catch(() => '');
    check('Đứng ở cổng nhà: gợi ý vẫn là cửa nhà, không bị người qua đường che', nearMenu && /nhà|phòng|Cửa/i.test(pr), pr);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Tùng và Linh ngoài thành phố
  { const page = await open(browser, 'ghep');
    const vis = (at, day, h, who) => scene(page, at, day, h).then(() => page.evaluate(w => { const a = WORLD.npcs.find(n => n.who === w); return !!a && !a.gone; }, who));
    const r = { mallWd:await vis('in:mall', 8, 15, 'tung'), mallWe:await vis('in:mall', 6, 15, 'tung'), tradaWe:await vis('in:trada', 6, 16, 'tung'), mallMorning:await vis('in:mall', 8, 10, 'tung'),
      libWd:await vis('in:lib', 8, 9.5, 'linh'), libWe:await vis('in:lib', 6, 9.5, 'linh'), cafeEve:await vis('in:cafe', 8, 20, 'linh') };
    check('Tùng: chiều ngày thường đứng quầy ở trung tâm thương mại, sáng thì chưa', r.mallWd && !r.mallMorning, JSON.stringify(r));
    check('Tùng: cuối tuần không đi làm, chiều ngồi trà đá', !r.mallWe && r.tradaWe);
    check('Linh: sáng ngày thường học ở thư viện, cuối tuần thì không', r.libWd && !r.libWe);
    check('Linh: tối ngày thường ngồi cà phê', r.cafeEve);
    const home = await page.evaluate(() => { S.day = 8; return [npcNow('tung', 'home', 15 * 60).act, cityAt('tung', 15 * 60).place]; });
    check('Lịch ở nhà và ngoài phố khớp nhau: lúc Tùng “ra ngoài” thì đang ở chỗ làm', home[0] === 'out' && home[1] === 'in:mall', home.join(' / '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Sự kiện thế giới ở văn phòng: có giãn cách, có giới hạn mỗi ngày, có người đến muộn
  { const page = await open(browser);
    await page.evaluate(() => { WEV.ON = false; S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; S.roam = { d:9, t:600 }; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.t = 600; WORLD.end = 1e9;
      WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = Infinity; }); });
    await page.waitForTimeout(2500);
    const c0 = await page.evaluate(() => [['dung', 'mai'], ['phong', 'dung'], ['mai', 'phong']].reduce((n, [x, y]) => n + npcRel(x, y).t, 0));   // tổng độ tin của ba cặp có thể tranh luận
    const ok = await page.evaluate(() => WEV_FORCE('argue')); await page.waitForTimeout(6500);
    const c1 = await page.evaluate(() => [['dung', 'mai'], ['phong', 'dung'], ['mai', 'phong']].reduce((n, [x, y]) => n + npcRel(x, y).t, 0));   // tổng độ tin của ba cặp có thể tranh luận
    await page.evaluate(() => { WEV.ON = true; });
    check('Tranh luận kỹ thuật: hai đồng nghiệp cãi nhau (💢) rồi làm lành, độ tin giảm một chút', ok === true && c1 < c0, `${ok} ${c0} → ${c1}`);
    const g = await page.evaluate(() => { S.flags.wev = null; const W = WORLD, a = wevAllow(W, 'office'); wevMark(W, 'office', 'x'); const b = wevAllow(W, 'office'); W.t += WEV.GAP; const c = wevAllow(W, 'office');
      for (let k = 0; k < WEV.DAY_MAX; k++) wevMark(W, 'x' + k); W.t += 999; const d = wevAllow(W, 'office'); W.t -= 999 + WEV.GAP; return [a, b, c, d]; });
    check('Giãn cách: vừa có sự kiện thì chưa có cái mới; đủ ' + 45 + ' phút mới được', g[0] && !g[1] && g[2], g.join(','));
    check('Giới hạn mỗi ngày: đủ số sự kiện thì thôi', !g[3]);
    const late = await page.evaluate(() => { const out = []; for (let d = 4; d < 60; d++) { S.day = d; if (isDayOff(d)) continue; const w = wevLateWho(); if (w) out.push([d, w, npcDay(w, 'office')[0][0], npcDay(w, 'office').some(x => x[1] === 'meet')]); } S.day = 9; return out; });
    check('Có ngày một đồng nghiệp đến muộn (khoảng 1/5 số ngày), lỡ họp đầu ngày', late.length >= 3 && late.length <= 20 && late.every(l => l[2] > 9.3 && !l[3]), `${late.length} ngày, vd ${JSON.stringify(late[0])}`);
    const off = await page.evaluate(() => { WEV.ON = false; const r = [wevLateWho(), wevAllow(WORLD, 'zz')]; WEV.ON = true; return r; });
    check('Tắt sự kiện (WEV.ON = false) thì không có gì xảy ra', off[0] === null && off[1] === false);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Chuyển tab, giảm chuyển động, điện thoại
  { const page = await open(browser, 'tro', { reducedMotion:'reduce' }); await scene(page, 'street', 8, 17.5);
    await page.evaluate(() => { PS.SPAWN = 1; }); await page.waitForTimeout(1500);
    const xs = () => page.evaluate(() => WORLD.street.walk.map(a => Math.round(a.x)).join(','));
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable:true, get:() => true }); });
    const a = await xs(), t0 = await page.evaluate(() => WORLD.t); await page.waitForTimeout(1500); const b = await xs(), t1 = await page.evaluate(() => WORLD.t);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable:true, get:() => false }); });
    check('Chuyển tab: phố đứng yên, đồng hồ dừng', a === b && t0 === t1);
    const moving = await page.evaluate(() => document.querySelectorAll('#world .actor.moving').length);
    check('Giảm chuyển động: người đi đường không diễn đi bộ (dịch chuyển thẳng)', moving === 0, moving + '');
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }
  { const page = await open(browser, 'tro', { ...devices['iPhone 13'] }); await scene(page, 'in:cafe', 8, 15); await page.waitForTimeout(800);
    const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    check('Điện thoại: quán đông khách vẫn không tràn ngang', w[0] <= w[1], w.join(' / '));
    await scene(page, 'street', 8, 7.5); await page.waitForTimeout(800);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
