// Kiểm thử ra phố (v16): phố, 8 địa điểm, xe máy, chuyện bất ngờ, hẹn gặp. Cần Playwright.
// Chạy: npm run ra-pho
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
  await page.evaluate(() => { S.once.roamTut = true; S.flags.pho = { d:6, met:1, vendor:1, rain:1, jam:1 }; });   // tắt chuyện bất ngờ, trừ khi bài kiểm thử tự bật
  return page;
}
// Cảnh chiều rảnh ngày 6 (thứ Bảy), đứng ở nơi `at`
const scene = (page, at = 'home', ref = { id:'activity', arg:'afternoon' }, slot = 'afternoon') => page.evaluate(([at, ref, slot]) => {
  S.day = 6; S.slot = slot; S.roam = null; S.roamPos = {}; S.where = at === 'home' ? null : { d:6, slot, at, bike:null }; S.queue = [ref]; S.cur = null; advance();
}, [at, ref, slot]).then(() => page.waitForTimeout(400));
const W = page => page.evaluate(() => ({ ...ROAM_DEBUG(), place:document.querySelector('#world') && document.querySelector('#world').dataset.place, riding:!!(WORLD && WORLD.riding) }));
const at = (page, fn) => page.evaluate(fn).then(() => page.waitForTimeout(350));
const menu = page => page.keyboard.press('KeyE').then(() => page.waitForTimeout(300)).then(() => page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim())));

(async () => {
  const browser = await chromium.launch();

  // 1. Ba ngõ nhà và phố: cửa nhà ra phố, mọi địa điểm đi tới được, mọi nơi bên trong đi lại được
  for (const bg of ['nha', 'tro', 'ghep']) {
    const page = await open(browser, bg); await scene(page);
    await at(page, () => { const d = WORLD.H.objs.find(o => o.kind === 'door'); WORLD.me.x = d.spot.x; WORLD.me.y = d.spot.y; });
    const m = await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    const r = await page.evaluate(() => { const H = WORLD.H; return { place:document.querySelector('#world').dataset.place, lane:WORLD.room,
      unreach:H.objs.filter(o => !roamPath(H, H.spawn, o.spot)).map(o => o.id),
      rooms:Object.keys(PHO_ROOMS).filter(id => { const R = phoRoom(id); return R.objs.some(o => !roamPath(R, R.spawn, o.spot)); }) }; });
    check(`${bg}: cửa nhà có “Ra phố”, ra đến ${r.lane}`, m[0].includes('Ra phố') && r.place === 'street', m.join(' | '));
    check(`${bg}: mọi địa điểm trên phố đi tới được, bên trong 8 nơi đều đi lại được`, !r.unreach.length && !r.rooms.length, r.unreach.concat(r.rooms).join(', '));
    check(`${bg}: không lỗi`, !page.errs.length, page.errs[0] || ''); await page.context().close();
  }

  // 2. Việc ở từng nơi cho chỉ số giống hệt bấm nút cũ
  const SAME = [['in:cafe', 'cafe', 'linh'], ['in:trada', 'trada', 'tung'], ['in:mall', 'shop', 'cashier'], ['in:lib', 'study', 'desk'], ['in:lake', 'run', 'lap'], ['in:bus', 'trip_home', 'ticket', 'morning']];
  for (const [place, act, where, slot = 'afternoon'] of SAME) {
    const run = async world => {
      const page = await open(browser, 'tro'); await page.evaluate(() => { Math.random = () => .4; });
      await scene(page, world ? place : 'home', { id:'activity', arg:slot }, slot);
      if (world) {
        if (where === 'lap') {
          await at(page, () => { WORLD.me.x = 110; WORLD.me.y = 172; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(200);
          await at(page, () => { WORLD.me.x = 850; }); await page.keyboard.down('KeyD'); await page.waitForTimeout(150); await page.keyboard.up('KeyD');
          await at(page, () => { WORLD.me.x = 120; }); await page.keyboard.down('KeyA'); await page.waitForTimeout(150); await page.keyboard.up('KeyA'); await page.waitForTimeout(2600);
        } else {
          await page.evaluate(w => { const a = WORLD.npcs.find(n => n.who === w); const o = WORLD.H.objs.find(x => x.id === w); const p = a ? { x:a.x - 26, y:a.y + 8 } : o.spot; WORLD.me.x = p.x; WORLD.me.y = p.y; }, where);
          await page.waitForTimeout(350); const m = await menu(page);
          const k = m.findIndex(t => !/Bắt chuyện|Chào/.test(t)); await page.keyboard.press('Digit' + (k + 1)); await page.waitForTimeout(3500);
        }
      } else await page.evaluate(a => choose(current.choices.findIndex(c => c.actId === a)), act);
      const s = await page.evaluate(() => [S.money, S.energy, S.mood, S.health, S.tech, JSON.stringify(S.rel)].join(','));
      const errs = page.errs.slice(); await page.context().close(); return { s, errs };
    };
    const a = await run(true), b = await run(false);
    check(`${place}: “${act}” ở đây cho chỉ số giống hệt bấm nút`, a.s === b.s && !a.errs.length, a.s === b.s ? '' : `${a.s.slice(0, 60)} | ${b.s.slice(0, 60)}`);
  }
  { const run = async world => { const page = await open(browser, 'nha'); await page.evaluate(() => { Math.random = () => .4; S.habit.meal = 'ask'; });
      await scene(page, world ? 'in:com' : 'home', { id:'meal', arg:'lunch' }, 'noon');
      if (world) { await at(page, () => { const o = WORLD.H.objs.find(x => x.id === 'case'); WORLD.me.x = o.spot.x; WORLD.me.y = o.spot.y; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(3500); }
      else await page.evaluate(() => choose(current.choices.findIndex(c => c.key === 'rice')));
      const s = await page.evaluate(() => [S.money, S.nutr, S.energy, S.mood].join(',')); await page.context().close(); return s; };
    const a = await run(true), b = await run(false);
    check('Cơm bụi: ăn ở quán cho kết quả giống hệt bấm nút “Cơm bụi đầu ngõ”', a === b, `${a} | ${b}`); }

  // 3. Xe máy: nhanh hơn đi bộ, tiền xăng một lần mỗi ngày nghỉ, dựng xe trước quán rồi đi tiếp
  { const page = await open(browser, 'ghep'); await scene(page, 'street');
    await at(page, () => { WORLD.me.x = 500; WORLD.me.y = 190; }); const a = await W(page); await page.keyboard.down('KeyD'); await page.waitForTimeout(800); await page.keyboard.up('KeyD'); const walk = (await W(page)).x - a.x;
    const m0 = await page.evaluate(() => S.money);
    await at(page, () => { WORLD.me.x = 166; WORLD.me.y = 178; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(400);
    const m1 = await page.evaluate(() => S.money);
    await at(page, () => { WORLD.me.x = 500; WORLD.me.y = 190; }); await page.keyboard.down('KeyD'); await page.waitForTimeout(800); await page.keyboard.up('KeyD'); const ride = (await W(page)).x - 500;
    check('Dắt xe ra: trừ đúng 15.000đ tiền xăng (ngày nghỉ)', m0 - m1 === 15000, `${m0} → ${m1}`);
    check('Đi xe nhanh hơn đi bộ hơn 2 lần, có dáng ngồi xe', ride > walk * 2 && /act-ride/.test((await W(page)).act), `${Math.round(walk)} so với ${Math.round(ride)}`);
    await at(page, () => { const d = phoDoorSpot(phoDoor('in:mall')); WORLD.me.x = d.x; WORLD.me.y = d.y; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    const inside = await W(page);
    await at(page, () => { const o = WORLD.H.objs.find(x => x.id === 'exit'); WORLD.me.x = o.spot.x; WORLD.me.y = o.spot.y; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    const out = await W(page);
    check('Vào quán thì dựng xe đi bộ vào; ra khỏi quán thì lên xe đi tiếp, đứng ngay trước cửa quán', inside.place === 'in:mall' && !inside.riding && out.place === 'street' && out.riding && Math.abs(out.x - 1740) < 30, `${inside.place}/${inside.riding} → ${out.place}/${out.riding} x=${Math.round(out.x)}`);
    await at(page, () => { WORLD.me.x = 166; WORLD.me.y = 178; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(300);
    await at(page, () => { WORLD.me.x = 166; WORLD.me.y = 178; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(400);
    check('Cất xe rồi dắt ra lại trong ngày: không trừ xăng lần nữa', await page.evaluate(() => S.money) === m1);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Đồng hồ chạy khi đi phố; về nhà thì tiếp tục buổi ở nhà; quán chưa mở thì nói rõ giờ mở cửa
  { const page = await open(browser, 'nha'); await scene(page, 'street', { id:'activity', arg:'morning' }, 'morning');
    const t0 = (await W(page)).t; await page.keyboard.down('KeyD'); await page.waitForTimeout(1500); await page.keyboard.up('KeyD'); const t1 = (await W(page)).t;
    check('Đi trên phố: đồng hồ chạy liên tục', t1 - t0 > 2.4, `${(t1 - t0).toFixed(1)} phút`);
    await at(page, () => { const d = phoDoorSpot(phoDoor('in:bia')); WORLD.me.x = d.x; WORLD.me.y = d.y; }); const bia = await menu(page);
    check('Buổi sáng: bia hơi chưa mở, ghi rõ giờ mở cửa', await page.$eval('.w-menu .w-act', b => b.disabled) && /Mở cửa 16:00/.test(bia.join(' ')), bia.join(' | ')); await page.keyboard.press('Escape');
    await at(page, () => { WORLD.me.x = 66; WORLD.me.y = 166; }); await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    const h = await page.evaluate(() => ({ cur:S.cur.id, place:document.querySelector('#world').dataset.place, t:WORLD.t }));
    check('Về nhà: trở lại nhà, vẫn là buổi sáng, đồng hồ chạy tiếp (không nhảy lùi)', h.cur === 'activity' && h.place === 'home' && h.t >= t1, JSON.stringify(h));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Chuyện bất ngờ: gặp người quen, hàng rong, mưa, tắc đường; mỗi loại một lần mỗi ngày
  { const page = await open(browser, 'tro'); await page.evaluate(() => { S.flags.pho = null; }); await scene(page, 'street');
    const force = k => page.evaluate(k => { WORLD.gap = { kind:k, at:0, walked:0, lx:WORLD.me.x }; WORLD.me.x += 2; }, k).then(() => page.waitForTimeout(250));
    await at(page, () => { WORLD.me.x = 900; WORLD.me.y = 190; });
    const r0 = await page.evaluate(() => JSON.stringify(S.rel)); await force('met'); await page.waitForTimeout(4500);
    const met = await page.evaluate(() => WORLD.npcs.find(a => /^met_/.test(a.id)));
    check('Gặp người quen: một người bạn đi tới chào', !!met);
    await page.evaluate(() => { const a = WORLD.npcs.find(n => /^met_/.test(n.id)); WORLD.me.x = a.x - 26; WORLD.me.y = a.y; }); await page.waitForTimeout(300);
    await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(6000);
    check('Bắt chuyện với người quen: quan hệ tăng (theo giới hạn mỗi ngày)', await page.evaluate(() => JSON.stringify(S.rel)) !== r0);
    const m0 = await page.evaluate(() => ({ money:S.money, mood:S.mood })); await force('vendor'); await page.waitForTimeout(400);
    await page.evaluate(() => { const a = WORLD.npcs.find(n => n.id === 'vendor'); WORLD.me.x = a.x - 26; WORLD.me.y = a.y; }); await page.waitForTimeout(300);
    const vm = await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(1300);
    const m1 = await page.evaluate(() => ({ money:S.money, mood:S.mood }));
    check('Hàng rong: mua bánh mì −15.000đ, tinh thần +2', m0.money - m1.money === 15000 && m1.mood === Math.min(100, m0.mood + 2), vm.join(' | '));
    await at(page, () => { WORLD.me.x = 1235; WORLD.me.y = 200; }); await force('rain'); await page.evaluate(() => { WORLD.wetT = 9.95; }); await page.waitForTimeout(600);
    const m2 = await page.evaluate(() => ({ mood:S.mood, rain:S.flags.rainDay === S.day, svg:!!document.querySelector('.w-rain') }));
    check('Mưa bất chợt: phố có mưa; không trú kịp thì tinh thần −2', m2.rain && m2.svg && m2.mood === m1.mood - 2, JSON.stringify(m2));
    await page.evaluate(() => { S.flags.pho.jam = false; WORLD.riding = true; }); const t0 = (await W(page)).t; await force('jam'); await page.waitForTimeout(1800);
    check('Tắc đường khi đi xe: mất khoảng 10 phút', (await W(page)).t - t0 >= 10, `${((await W(page)).t - t0).toFixed(1)} phút`);
    check('Mỗi loại chuyện chỉ một lần mỗi ngày', await page.evaluate(() => { const g = gapToday(); return g.met && g.vendor && g.rain && g.jam; }));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Rủ ai đó đi chơi: người được rủ đợi ở nơi hẹn, đến nơi thì vào cuộc trò chuyện cũ
  { const page = await open(browser, 'tro'); await scene(page);
    await page.evaluate(() => { choose(current.choices.findIndex(c => c.actId === 'hangout')); }); await page.waitForTimeout(400);
    await page.evaluate(() => { choose(current.choices.findIndex(c => /Tùng/.test(c.label))); }); await page.waitForTimeout(500);
    const m = await page.evaluate(() => ({ meet:S.meet, cur:S.cur.id }));
    check('Rủ Tùng: Tùng hẹn ở quán trà đá, mình quay lại nhà để tự đi tới', m.meet && m.meet.who === 'tung' && m.meet.at === 'in:trada' && m.cur === 'activity', JSON.stringify(m));
    await page.evaluate(() => { S.where = { d:S.day, slot:S.slot, at:'in:trada', bike:null }; renderScene(); }); await page.waitForTimeout(500);
    await page.evaluate(() => { const a = WORLD.npcs.find(n => n.id === 'meet_tung'); WORLD.me.x = a.x - 26; WORLD.me.y = a.y + 8; }); await page.waitForTimeout(350);
    const mm = await menu(page); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    check('Đến quán trà đá: Tùng đợi sẵn; ngồi nói chuyện thì vào đúng cuộc trò chuyện cũ', /Ngồi nói chuyện với Tùng/.test(mm.join(' ')) && await page.evaluate(() => S.cur && S.cur.id === 'hangout'), mm.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Hôm trời mưa thì phố mưa; tắt chế độ đi lại thì như cũ; tua nhanh không kẹt
  { const page = await open(browser, 'nha'); await page.evaluate(() => { S.flags.rainDay = 6; S.flags.pho = { d:6, met:1, vendor:1, jam:1 }; }); await scene(page, 'street');
    check('Hôm có mưa: ra phố thấy mưa', !!(await page.$('.w-rain')));
    await page.evaluate(() => { S.opt.roam = false; }); await scene(page);
    check('Tắt “Tự đi lại”: vẫn chọn việc ra ngoài bằng danh sách như cũ', !(await page.$('#world')) && (await page.$$('.choice.tile')).length > 3);
    await page.evaluate(() => { S.opt.roam = true; }); await scene(page);
    const d0 = await page.evaluate(() => S.day);
    for (let i = 0; i < 40 && await page.evaluate(d => S.day === d, d0); i++) { await page.evaluate(() => { const q = x => document.querySelector(x); if (q('#next')) return q('#next').click(); const fd = q('#ffDay'); if (fd) return fd.click(); const ch = [...document.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.textContent.includes('Tua đến')); if (ch.length) ch[0].click(); }); await page.waitForTimeout(150); }
    check('Tua nhanh: sang ngày mới, không kẹt', await page.evaluate(d => S.day > d, d0));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 8. Điện thoại: joystick đi được trên phố; chạm vào bản đồ nhỏ thì tự đi tới
  { const page = await open(browser, 'tro', { ...devices['iPhone 13'] }); await scene(page, 'street');
    const x0 = (await W(page)).x; await page.tap('.w-mini-pin[data-to="in:com"]'); await page.waitForTimeout(8000);
    const r = await W(page);
    check('Chạm biểu tượng cơm bụi trên bản đồ nhỏ: tự đi tới cửa quán', r.x > x0 + 200 && r.near === 'd_in:com', `${Math.round(x0)} → ${Math.round(r.x)}, gần ${r.near}`);
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    check('Không tràn ngang màn hình điện thoại', fits);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 9. v16.1 – rủ đi chơi lúc 13:30 chỉ là gọi điện hẹn: đồng hồ tăng vài phút, không nhảy đến 18:30 rồi lùi về 13:30
  { const page = await open(browser, 'tro'); await scene(page);
    await at(page, () => { const d = WORLD.H.objs.find(o => o.kind === 'door'); WORLD.me.x = d.spot.x; WORLD.me.y = d.spot.y; });
    const t0 = (await W(page)).t; await menu(page); await page.keyboard.press('Digit2'); await page.waitForTimeout(1500);
    const mid = await page.evaluate(() => ({ cur:S.cur.id, t:S.roam.t }));
    await page.evaluate(() => choose(current.choices.length - 1)); await page.waitForTimeout(500);   // “Thôi, để hôm khác”
    const t1 = (await W(page)).t;
    check('Rủ đi chơi: gọi điện hẹn (bảng chọn người), đồng hồ chỉ tăng vài phút', mid.cur === 'hangout_pick' && mid.t - t0 < 10, `${Math.round(t0)} → ${mid.t}`);
    check('Chọn “Thôi, để hôm khác”: quay lại đúng giờ đang chơi, không lùi, không nhảy cuối buổi', t1 >= mid.t && t1 - t0 < 12, `${Math.round(t0)} → ${Math.round(t1)}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
