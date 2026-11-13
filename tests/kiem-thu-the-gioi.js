// Kiểm thử thế giới tự do trong nhà (v14) trong trình duyệt thật (cần Playwright).
// Chạy: npm run the-gioi
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
  return page;
}
// Đưa game đến một cảnh ở nhà (mặc định: chiều rảnh của ngày 6, thứ Bảy)
const scene = (page, ref = { id:'activity', arg:'afternoon' }, slot = 'afternoon') => page.evaluate(([ref, slot]) => {
  S.day = 6; S.slot = slot; S.habit.bed = 'ask'; S.roam = null; S.queue = [ref]; S.cur = null; advance();
}, [ref, slot]).then(() => page.waitForTimeout(400));
const W = page => page.evaluate(() => ROAM_DEBUG());
const hold = async (page, keys, ms) => { for (const k of keys) await page.keyboard.down(k); await page.waitForTimeout(ms); for (const k of keys) await page.keyboard.up(k); await page.waitForTimeout(120); };

(async () => {
  const browser = await chromium.launch();

  // 1. Ba căn nhà: mở được, nhân vật đứng ở chỗ đi được, mọi đồ vật đều đi tới được
  for (const bg of ['tro', 'ghep', 'nha']) {
    const page = await open(browser, bg); await scene(page);
    const r = await page.evaluate(() => { const H = house(); return { name:H.name, world:!!document.querySelector('#world svg .actor[data-who="me"]'),
      unreachable:H.objs.filter(o => !roamPath(H, H.spawn, o.spot)).map(o => o.id), list:document.querySelectorAll('.w-list .choice').length,
      orphan:current.choices.filter(c => !H.objs.some(o => o.kind === choiceObj(S.cur, c))).map(c => c.label) }; });
    check(`${r.name}: mở thế giới tự do, có nhân vật`, r.world);
    check(`${r.name}: đồ vật nào cũng đi tới được`, !r.unreachable.length, r.unreachable.join(', '));
    check(`${r.name}: lựa chọn nào cũng có đồ vật để làm, danh sách cũ vẫn còn`, !r.orphan.length && r.list > 0, `${r.list} lựa chọn ${r.orphan.join(', ')}`);
    check(`${r.name}: không lỗi`, !page.errs.length, page.errs[0] || '');
    await page.context().close();
  }

  // 2. Bàn phím: đi, dừng, đi chéo, va chạm, mất focus
  { const page = await open(browser, 'ghep'); await scene(page);
    const a = await W(page); await hold(page, ['KeyD'], 1000); const b = await W(page);
    check('Giữ D: đi sang phải, thả phím thì đứng yên', b.x - a.x > 50 && !/act-walk/.test(b.act), `${Math.round(a.x)} → ${Math.round(b.x)}, ${b.act}`);
    await hold(page, ['ArrowLeft'], 600); const c = await W(page);
    check('Phím mũi tên trái: quay mặt và đi sang trái', c.x < b.x - 25 && c.left, `${Math.round(b.x)} → ${Math.round(c.x)}`);
    const s1 = await W(page); await hold(page, ['KeyS'], 800); const s2 = await W(page);
    check('Đi ra phía ngoài: nhân vật to lên (chiều sâu)', s2.y > s1.y && s2.scale > s1.scale, `y ${Math.round(s1.y)} → ${Math.round(s2.y)}, cỡ ${s1.scale} → ${s2.scale}`);
    const d0 = await W(page); await hold(page, ['KeyD', 'KeyW'], 800); const d1 = await W(page);
    const diag = Math.hypot(d1.x - d0.x, (d1.y - d0.y) / .62), straight = 74 * .8;
    check('Đi chéo không nhanh hơn đi thẳng', diag < straight * 1.12, `${Math.round(diag)} so với ${Math.round(straight)}`);
    await hold(page, ['KeyA'], 4500); const e = await W(page);
    const ok = await page.evaluate(() => roamFree(house(), WORLD.me.x, WORLD.me.y));
    check('Đi mãi vào tường: dừng lại ở mép, không xuyên tường, không ra ngoài bản đồ', ok && e.x >= 8, `x = ${Math.round(e.x)}`);
    await page.evaluate(() => { WORLD.me.x = 300; WORLD.me.y = 170; });
    await hold(page, ['KeyW'], 1500); const f = await W(page);
    check('Không đi xuyên đồ đạc (bàn học)', await page.evaluate(() => roamFree(house(), WORLD.me.x, WORLD.me.y)) && f.y > 156, `y = ${Math.round(f.y)}`);
    await page.keyboard.down('KeyD'); await page.waitForTimeout(300);
    await page.evaluate(() => window.dispatchEvent(new Event('blur'))); const g0 = await W(page); await page.waitForTimeout(500); const g1 = await W(page); await page.keyboard.up('KeyD');
    check('Đang giữ phím mà mất focus (chuyển tab): nhân vật dừng, không bị kẹt phím', Math.abs(g1.x - g0.x) < 2, `${Math.round(g0.x)} → ${Math.round(g1.x)}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Đồng hồ chạy liên tục, kể cả khi đi lại; dừng khi mở điện thoại
  { const page = await open(browser, 'tro'); await scene(page);
    const t0 = (await W(page)).t; await hold(page, ['KeyD'], 1500); const t1 = (await W(page)).t;
    check('Đồng hồ chạy cả khi đang đi lại', t1 - t0 > 2.4, `${(t1 - t0).toFixed(1)} phút trong 1,6 giây`);
    await page.click('#phoneFab'); await page.waitForTimeout(200); const p0 = (await W(page)).t; await page.waitForTimeout(1200); const p1 = (await W(page)).t;
    check('Mở điện thoại thì đồng hồ dừng', Math.abs(p1 - p0) < .2, `${(p1 - p0).toFixed(2)} phút`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Chạm vào đồ vật: tự đi đến, hiện việc làm được; dùng đồ = đúng như bấm nút trong danh sách
  { const runOne = async viaWorld => {
      const page = await open(browser, 'nha'); await page.evaluate(() => { Math.random = () => .42; }); await scene(page);
      if (viaWorld) {
        await page.click('#world .w-obj[data-o="desk"]', { force:true }); await page.waitForTimeout(3500);
        const m = await W(page); const items = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
        const i = items.findIndex(t => t.includes('Học thêm')); await page.keyboard.press(String(i + 1)); await page.waitForTimeout(2200);
        const t = await W(page); const toast = await page.$eval('.w-toast', el => !el.hidden && el.textContent);
        const after = await page.evaluate(() => ({ s:[S.tech, S.energy, S.mood, S.money, S.stat.study], feed:S.feed[S.feed.length - 1] }));
        await page.keyboard.press('KeyE'); await page.waitForTimeout(500); after.cur = await page.evaluate(() => S.cur && S.cur.id);
        await page.context().close(); return { m, items, t, toast, after, errs:page.errs };
      }
      await page.evaluate(() => { const i = current.choices.findIndex(c => c.actId === 'study'); choose(i); });
      const after = await page.evaluate(() => ({ s:[S.tech, S.energy, S.mood, S.money, S.stat.study], feed:S.feed[S.feed.length - 1] }));
      await page.context().close(); return { after };
    };
    const w = await runOne(true), l = await runOne(false);
    check('Chạm vào bàn học: nhân vật tự đi đến và hiện các việc làm ở đó', w.m.near === 'desk' && w.m.menu && w.items.some(t => t.includes('Học thêm')), w.items.join(' | '));
    check('Dùng đồ: diễn động tác gõ máy, đồng hồ quay đến cuối buổi, kết quả hiện ngay dưới khung', /act-type/.test(w.t.act) && w.t.t >= w.t.end && !!w.toast, `${w.t.act}, ${Math.round(w.t.t)}/${w.t.end}`);
    check('Chỉ số sau khi dùng bàn học giống hệt bấm “Học thêm” trong danh sách (không tính hai lần)', JSON.stringify(w.after.s) === JSON.stringify(l.after.s), `${JSON.stringify(w.after.s)} so với ${JSON.stringify(l.after.s)}`);
    check('Nhật ký ghi đúng giờ trên đồng hồ', w.after.feed && w.after.feed.t === '18:30' && /Học thêm/.test(w.after.feed.text), JSON.stringify(w.after.feed));
    check('Nhấn E để đi tiếp sang buổi sau', w.after.cur !== 'activity', String(w.after.cur));
    check('Không lỗi', !w.errs.length, w.errs[0] || ''); }

  // 5. Việc nhỏ (tắm) chỉ tốn ít phút, không hết buổi; tinh thần +2 một lần mỗi ngày
  { const page = await open(browser, 'ghep'); await scene(page);
    const m0 = await page.evaluate(() => S.mood), t0 = (await W(page)).t;
    await page.click('#world .w-obj[data-o="shower"]', { force:true }); await page.waitForTimeout(3600);
    await page.keyboard.press('1'); await page.waitForTimeout(1600);
    const r = await page.evaluate(() => ({ mood:S.mood, cur:S.cur && S.cur.id, t:WORLD.t, busy:WORLD.busy }));
    check('Tắm: mất khoảng 20 phút, tinh thần +2, vẫn ở trong buổi chiều', r.mood === Math.min(100, m0 + 2) && r.cur === 'activity' && r.t - t0 >= 20 && r.t - t0 < 40 && !r.busy, `tinh thần ${m0} → ${r.mood}, ${Math.round(r.t - t0)} phút`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Hết giờ mà chưa làm gì: game tự chọn “xem phim, lướt mạng” như người lười
  { const page = await open(browser, 'tro'); await scene(page);
    await page.evaluate(() => { WORLD.t = WORLD.end - .5; }); await page.waitForTimeout(2500);
    const toast = await page.$eval('.w-toast', el => !el.hidden && el.textContent);
    check('Hết buổi: nhân vật tự lướt điện thoại, có dòng giải thích', /trôi qua/.test(toast || ''), (toast || '').slice(0, 80));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Đi ngủ: lên giường lúc mấy giờ thì ghi giờ ngủ đúng lúc đó
  { const page = await open(browser, 'nha'); await scene(page, { id:'bedtime' }, 'night');
    await page.evaluate(() => { WORLD.t = 23 * 60 + 10; });
    await page.click('#world .w-obj[data-o="bed"]', { force:true }); await page.waitForTimeout(2600); await page.keyboard.press('KeyE'); await page.waitForTimeout(2400);
    const r = await page.evaluate(() => ({ bed:S.bedHour, day:S.day, cur:S.cur && S.cur.id }));
    check('Lên giường lúc 23:10 → giờ ngủ 23:15 (làm tròn 15 phút), sang ngày mới', r.bed === 23.25 && r.day === 7, JSON.stringify(r));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 8. Điện thoại: joystick đi được, nút dùng đồ hiện khi đứng gần đồ vật
  { const page = await open(browser, 'tro', { ...devices['iPhone 13'] }); await scene(page);
    const joy = await page.$('.w-joy'), box = await joy.boundingBox(); const a = await W(page);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps:4 });
    await page.waitForTimeout(900); await page.mouse.up(); await page.waitForTimeout(150); const b = await W(page);
    check('Điện thoại: có joystick, kéo sang phải thì nhân vật đi sang phải', !!box && b.x - a.x > 30, `${Math.round(a.x)} → ${Math.round(b.x)}`);
    await page.evaluate(() => { WORLD.me.x = 420; WORLD.me.y = 166; }); await page.waitForTimeout(300);
    const use = await page.$eval('.w-use', el => !el.disabled && !el.closest('[hidden]'));
    check('Đứng gần tủ lạnh: nút dùng đồ (dưới khung) sáng lên, joystick không che cảnh', use && !(await page.$('#world .w-joy')));
    const pv = await page.evaluate(() => { const r = document.querySelector('#world').getBoundingClientRect(); return r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; });
    check('Khung không tràn ngang màn hình điện thoại', pv);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 9. Tắt chế độ tự đi lại; bản lưu cũ; giảm chuyển động
  { const page = await open(browser, 'tro');
    await page.evaluate(() => { S.opt.roam = false; }); await scene(page);
    check('Tắt “Tự đi lại trong nhà”: quay về bảng chọn việc như cũ', !(await page.$('#world')) && (await page.$$('.choice.tile')).length > 0);
    await page.evaluate(() => { S.opt.roam = true; delete S.roam; save(); location.reload(); }); await page.waitForTimeout(800);
    await page.click('#resume'); await page.waitForTimeout(400); await scene(page);
    check('Bản lưu cũ (chưa có vị trí trong nhà) vẫn mở được thế giới', !!(await page.$('#world .actor')));
    await page.emulateMedia({ reducedMotion:'reduce' }); await scene(page);
    const a = await W(page); await hold(page, ['KeyD'], 600); const b = await W(page);
    check('Giảm chuyển động: vẫn điều khiển được nhân vật', b.x > a.x + 20, `${Math.round(a.x)} → ${Math.round(b.x)}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
