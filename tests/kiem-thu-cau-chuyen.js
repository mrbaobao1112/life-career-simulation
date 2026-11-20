// Kiểm thử v17.5 – Phase 4: chuyện tự nảy sinh (Linh rủ đi thư viện, hai đồng nghiệp giận rồi làm lành),
// thông báo điện thoại gọn hơn, xe máy chỉ chạy trên phố chính, hiệu năng (NPC ngoài màn hình không chạy hoạt ảnh).
// Cần Playwright. Chạy: npm run cau-chuyen
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
  await page.evaluate(() => { S.once.roamTut = true; S.money = 5e6; });
  return page;
}
const scene = (page, at, day, h) => page.evaluate(([at, day, h]) => {
  const slot = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  S.flags.pho = { d:day, met:1, vendor:1, rain:1, jam:1 }; S.flags.rainDay = 0;
  S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = at === 'home' ? null : { d:day, slot, at, bike:null };
  S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.t = h * 60; WORLD.end = 1e9;
}, [at, day, h]).then(() => page.waitForTimeout(500));
const office = (page, day, h) => page.evaluate(([day, h]) => { OFFICE_BAL.ABSENT = 0; S.day = day; S.slot = h < 12 ? 'morning' : 'afternoon'; S.roam = { d:day, t:h * 60 }; S.roamPos = {};
  S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.end = 1e9; }, [day, h]).then(() => page.waitForTimeout(1200));
const until = (page, fn, arg, ms = 20000) => page.waitForFunction(fn, arg, { timeout:ms }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();

  // 1. Điện thoại: số trên nút đếm cuộc trò chuyện, tin nhắc lại không đổ chuông, giới hạn tin vu vơ mỗi ngày, vạch “Tin mới”, sắp xếp
  { const page = await open(browser);
    const r = await page.evaluate(() => {
      const o = {}; S.phone = null; S.flags.ring = false;
      pushMsg('tung', 'tung', 'a'); pushMsg('tung', 'tung', 'b'); pushMsg('tung', 'tung', 'c'); addUnread('tung', 3);
      pushMsg('linh', 'linh', 'x'); addUnread('linh', 1);
      o.count = unreadCount(); o.msgs = unreadMsgs(); S.flags.ring = false;
      ph().pending.phong = { id:'phong_nervous', deadline:S.tick || 0 }; pushMsg('phong', 'phong', 'run quá'); tickPhone();
      o.quiet = !S.flags.ring && (ph().unread.phong || 0) === 1;
      ph().pending.team = { id:'team_meeting', deadline:S.tick || 0 }; tickPhone(); o.loud = !!S.flags.ring; S.flags.ring = false;
      // 40 ngày, mỗi ngày ba buổi: tin vu vơ không quá PHONE.MAX_DAY mỗi ngày
      let worst = 0; const day0 = S.day;
      for (let d = 0; d < 40; d++) { S.day = day0 + d; let n = 0; for (const s of ['morning', 'afternoon', 'evening']) { S.slot = s; const before = Object.values(S.evLast || {}).filter(v => v === S.day).length;
          ph().pending = {}; maybeMsg(s); if (Object.values(S.evLast || {}).filter(v => v === S.day).length > before) n++; } worst = Math.max(worst, n); }
      S.day = day0; o.worst = worst;
      for (let i = 0; i < 120; i++) pushMsg('dung', 'dung', 'm' + i); o.keep = ph().threads.dung.length;
      return o; });
    check('Số trên nút điện thoại đếm cuộc trò chuyện có tin mới (3 tin của Tùng + 1 tin của Linh = 2)', r.count === 2 && r.msgs === 4, JSON.stringify(r));
    check('Lờ tin nhắn: tin nhắc lại đến lặng lẽ (không đổ chuông), vẫn hiện là tin mới', r.quiet);
    check('Tin quan trọng (chị Hạnh nhắc trong nhóm) vẫn đổ chuông', r.loud);
    check('Tin nhắn vu vơ: tối đa 2 lần mỗi ngày (40 ngày)', r.worst <= 2, 'nhiều nhất ' + r.worst);
    check('Mỗi cuộc trò chuyện giữ 80 tin gần nhất', r.keep === 80, r.keep);
    const ui = await page.evaluate(() => { S.phone = null; S.day = 5; S.slot = 'morning';
      pushMsg('tung', 'tung', 'cũ 1'); pushMsg('tung', 'me', 'cũ 2'); S.slot = 'evening'; pushMsg('linh', 'linh', 'Linh nè'); addUnread('linh', 1);
      pushMsg('tung', 'tung', 'mới 1'); pushMsg('tung', 'tung', 'mới 2'); addUnread('tung', 2, true);
      ph().pending.family = { id:'mom_breakfast', deadline:99 }; pushMsg('family', 'mom', 'Con dậy chưa?'); S.slot = 'morning'; addUnread('family', 1);
      updateHUD(); const badge = document.querySelector('#phoneBadge').textContent, wait = document.querySelector('#phoneFab').classList.contains('wait');
      openPhone(); const order = [...document.querySelectorAll('.ph-item')].map(b => b.dataset.th);
      openThread('tung'); const box = document.querySelector('.thread'), kids = [...box.children].map(n => n.className === 'ph-new' ? 'NEW' : n.textContent.replace(/^.*?(cũ|mới)/, '$1'));
      const newIdx = kids.indexOf('NEW'); const after = kids.slice(newIdx + 1).filter(t => /^(cũ|mới)/.test(t));
      openThread('tung'); const again = !document.querySelector('.ph-new'); closeDlg();
      return { badge, wait, order, newIdx, after, again }; });
    check('Nút điện thoại hiện 3 (ba cuộc có tin mới) và có viền vàng khi có tin chờ trả lời', ui.badge === '3' && ui.wait, ui.badge + ' ' + ui.wait);
    check('Danh sách: chờ trả lời lên đầu, rồi cuộc có tin mới', ui.order[0] === 'family' && ui.order.indexOf('tung') < 3 && ui.order.indexOf('linh') < 3, ui.order.join(','));
    check('Trong cuộc trò chuyện có vạch “Tin mới” ngay trước hai tin chưa đọc', ui.newIdx > 0 && ui.after.join('|') === 'mới 1|mới 2', JSON.stringify(ui.after));
    check('Đọc rồi mở lại thì không còn vạch “Tin mới”', ui.again);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Linh rủ đi thư viện: chưa đủ điều kiện thì không; đủ thì vài hôm sau nhắn; nhận lời → chiều hẹn Linh đợi ở thư viện → học cùng → Linh nhớ
  { const page = await open(browser);
    const r = await page.evaluate(() => { const o = {}; S.cc = null; S.job = { co:'cudem', salary:1e7, start:3 }; S.day = 9; S.slot = 'morning';    // ngày 9 là thứ Ba
      S.rel.linh = 50; memAdd({ w:'linh', o:'me', k:'hangout', v:1 }); S.day = 10; ccSlot('morning'); o.lowRel = !S.cc.on.linh;
      S.rel.linh = 62; S.npcMem = []; ccSlot('morning'); o.noMem = !S.cc.on.linh;
      S.day = 9; memAdd({ w:'linh', o:'me', k:'hangout', v:1 }); S.day = 10;
      CC.ON = false; ccSlot('morning'); o.off = !S.cc.on.linh; CC.ON = true;
      ccSlot('morning'); const st = S.cc.on.linh; o.start = st && st.b; o.wait = st && st.d - S.day;
      S.slot = 'afternoon'; ccSlot('afternoon'); o.notYet = !(ph().pending.linh);
      S.day = st.d; S.phone = null; ccSlot('afternoon'); o.msg = (ph().threads.linh || []).map(m => m.t); o.pending = ph().pending.linh && ph().pending.linh.id;
      o.hen = st.d; o.henDay = dayInfo(st.d).wd; o.unread = unreadCount();
      return o; });
    check('Linh chưa đủ thân thì không rủ', r.lowRel);
    check('Không có lần gặp vui nào gần đây thì không rủ (chuyện không tự đến)', r.noMem);
    check('Tắt CC.ON thì không có chuyện nào', r.off);
    check('Đủ thân và vừa đi cà phê vui với Linh: chuyện bắt đầu, Linh đợi 1–2 ngày mới nhắn', r.start === 'cho' && r.wait >= 1 && r.wait <= 2, JSON.stringify(r));
    check('Chưa đến ngày thì chưa nhắn', r.notYet);
    check('Linh nhắn có lý do (nhắc lần cà phê) và rủ đi thư viện, chờ bạn trả lời', /cà phê/.test(r.msg[0]) && /Thư viện/.test(r.msg[1]) && r.pending === 'cc_linh_tv', r.msg.join(' / '));
    check('Đang đi làm thì hẹn vào ngày nghỉ', r.henDay === 6 || r.henDay === 0, 'thứ ' + r.henDay);
    const a = await page.evaluate(() => { const before = S.rel.linh; replyMsg('linh', 0); closeDlg(); const st = S.cc.on.linh;
      return { b:st && st.b, up:S.rel.linh - before, resp:ph().threads.linh.slice(-1)[0].t }; });
    check('Nhận lời: Linh chốt hẹn, thân hơn một chút', a.b === 'hen' && a.up > 0 && /Chốt/.test(a.resp), JSON.stringify(a));
    const meet = await page.evaluate(d => { S.day = d; S.slot = 'afternoon'; buildSlot(); return { meet:S.meet, notes:S.notes.join(' ') }; }, r.hen);
    check('Chiều hôm hẹn: hẹn gặp Linh ở Thư viện quận', meet.meet && meet.meet.at === 'in:lib' && meet.meet.who === 'linh' && meet.meet.sc === 'cc_hoc', JSON.stringify(meet.meet));
    await scene(page, 'in:lib', r.hen, 15);
    const lib = await page.evaluate(() => { const L = WORLD.npcs.filter(a => a.who === 'linh' && !a.gone), a = L[0]; return { n:L.length, label:a && a.entries && a.entries().map(e => e.label).join(',') }; });
    check('Ở thư viện có đúng một Linh đang đợi, với lựa chọn “Ngồi học cùng Linh”', lib.n === 1 && /Ngồi học cùng Linh/.test(lib.label), JSON.stringify(lib));
    const sc = await page.evaluate(() => { const a = WORLD.npcs.find(x => x.who === 'linh' && !x.gone); a.entries()[0].run(); return { id:S.cur && S.cur.id, title:current && current.title }; });
    check('Ngồi xuống: cảnh “Học cùng Linh ở thư viện”', sc.id === 'cc_hoc', JSON.stringify(sc));
    const done = await page.evaluate(() => { const t0 = S.tech; choose(0); const m = memAll().find(x => x.w === 'linh' && x.k === 'cc_thuvien');
      const o = { tech:S.tech - t0, mem:m && m.v, on:!!S.cc.on.linh };
      S.day++; S.slot = 'morning'; o.recall = (memRecall('linh', 'talk') || {}).text; o.ht = HT.filter(e => e.who === 'linh' && e.when && e.when()).length; return o; });
    check('Học xong: có ích (kỹ thuật +), Linh ghi nhớ, chuyện khép lại', done.tech > 0 && done.mem === 1 && !done.on, JSON.stringify(done));
    check('Hôm sau Linh nhắc lại buổi thư viện, và có câu bắt chuyện về nó', /thư viện|học cùng/.test(done.recall || '') && done.ht >= 1, done.recall);
    const cd = await page.evaluate(() => { S.npcMem.push({ w:'linh', o:'me', k:'hangout', v:1, d:S.day, n:0 }); S.day++; ccSlot('morning'); return !S.cc.on.linh; });
    check('Vừa xong một lần thì một thời gian sau mới rủ lại', cd);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Linh rủ: từ chối, lờ đi, hẹn mà không đến
  { const page = await open(browser);
    const r = await page.evaluate(() => { const o = {};
      const start = () => { S.cc = null; S.phone = null; S.job = null; S.day = 9; S.rel.linh = 62; S.npcMem = []; memAdd({ w:'linh', o:'me', k:'hangout', v:1 }); S.day = 10; S.slot = 'morning'; ccSlot('morning');
        const st = S.cc.on.linh; S.day = st.d; S.slot = 'afternoon'; ccSlot('afternoon'); return st; };
      let st = start(); o.tomorrow = st.d === S.day + 1; replyMsg('linh', 1); closeDlg(); o.tuchoi = !S.cc.on.linh && /không sao/.test(ph().threads.linh.slice(-1)[0].t);
      st = start(); const r0 = S.rel.linh; S.flags.ring = false; S.tick += 2; tickPhone(); o.lo = !S.cc.on.linh && S.rel.linh < r0 && !S.flags.ring;
      st = start(); replyMsg('linh', 0); closeDlg(); const r1 = S.rel.linh; S.day = st.d; S.slot = 'afternoon'; S.opt.roam = true; buildSlot(); S.slot = 'evening'; ccSlot('evening');
      o.leo = !S.cc.on.linh && S.rel.linh < r1 && /không thấy mày/.test(ph().threads.linh.slice(-1)[0].t) && memAll().some(x => x.w === 'linh' && x.k === 'cc_thuvien' && x.v < 0);
      return o; });
    check('Chưa đi làm: Linh hẹn ngay ngày mai', r.tomorrow);
    check('Từ chối: Linh bảo không sao, chuyện khép lại', r.tuchoi);
    check('Lờ tin nhắn: Linh nhắn lại lặng lẽ, hơi phật lòng, chuyện khép lại', r.lo);
    check('Hẹn rồi không đến: tối Linh nhắn buồn, nhớ chuyện bị cho leo cây', r.leo);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Hai đồng nghiệp tranh luận → hôm sau giận (nhạt đi, không sang bàn, không chào) → việc chung ở chỗ họp → làm lành, nhớ lại
  { const page = await open(browser);
    await page.evaluate(() => { S.job = { co:'cudem', salary:1e7, start:3 }; ngayLoai.memo = {}; NGAY.ON = false; WEV.ON = false; S.cc = null; S.npcMem = [];
      S.day = 9; memAdd({ w:'dung', o:'mai', k:'argue', v:-1 }); S.day = 10; });
    const st = await page.evaluate(() => { const c0 = npcRel('dung', 'mai').c; ccSlot('morning'); const st = S.cc.on.lanh;
      return { b:st && st.b, drop:c0 - npcRel('dung', 'mai').c, gian:ccGian('mai', 'dung'), one:ccGian('mai'), other:ccGian('phong', 'dung'), line:memNpcLine('dung', 'mai') }; });
    check('Hôm sau trận tranh luận: hai người còn giận, quan hệ giữa họ giảm', st.b === 'gian' && st.drop > 0 && st.gian && st.one && !st.other, JSON.stringify(st));
    check('Đang giận thì không nhắc chuyện cũ khi chào', st.line === null);
    await office(page, 10, 10);
    const v = await page.evaluate(() => { const a = WORLD.npcs.find(x => x.who === 'dung'), m = WORLD.npcs.find(x => x.who === 'mai');
      WORLD.npcs.filter(x => x.ai && x !== a && x !== m).forEach(x => { x.ai.busy = true; });           // chỉ còn chị Mai để sang bàn
      let n = 0; for (let i = 0; i < 30; i++) { a.ai.with = null; const p = songSpot(WORLD, a, 'visit'); if (p && a.ai.with === m) n++; }
      WORLD.npcs.forEach(x => { if (x.ai) x.ai.busy = false; });
      return n; });
    check('Đang giận: anh Dũng không sang bàn chị Mai', v === 0, v + ' lần');
    const ht = await page.evaluate(() => HT.filter(e => (e.who === 'mai' || e.who === 'dung') && e.when && e.when({ who:'mai', at:'office' })).map(e => e.say[0]));
    check('Bắt chuyện với người đang giận: họ nhắc chuyện hôm qua', ht.length >= 1, ht.join(' / '));
    const ev = await page.evaluate(() => { const e = WORLD_EV.find(x => x.id === 'lamlanh'); const old = CC.LANH.P; CC.LANH.P = 1; const w = e.when(WORLD); CC.LANH.P = old; return w; });
    check('Hôm sau có thể có việc chung ở chỗ họp (sự kiện “lamlanh” sẵn sàng)', ev);
    await page.evaluate(() => { WORLD.t = 10.5 * 60; window.__lam = WEV_FORCE('lamlanh'); });
    const ok = await until(page, () => !S.cc.on.lanh, null, 30000);
    const after = await page.evaluate(() => ({ c:npcRel('dung', 'mai').c, mem:memAll().some(x => x.k === 'lamlanh'), argue:memAll().some(x => x.k === 'argue'), gian:ccGian('dung', 'mai'),
      seat:['dung', 'mai'].map(w => { const a = WORLD.npcs.find(x => x.who === w); return Math.round(Math.abs(a.x - WORLD.H.meetSpot.x)); }) }));
    check('Việc chung ở chỗ họp: hai người ra cùng làm, nói chuyện lại và làm lành', ok && after.mem && !after.argue && !after.gian, JSON.stringify(after));
    const g = await page.evaluate(() => { S.day++; const l = memNpcLine('dung', 'mai'); return l && l.lines[0]; });
    check('Lần chào sau đó: nhắc hôm làm chung ăn ý', !!g && /làm chung|chia đôi/.test(g), g);
    const exp = await page.evaluate(() => { S.cc = null; S.npcMem = []; S.day = 20; memAdd({ w:'phong', o:'mai', k:'argue', v:-1 }); S.day = 21; ccSlot('morning'); const ok1 = !!S.cc.on.lanh;
      S.day = 21 + CC.LANH.HET + 1; ccSlot('morning'); return ok1 && !S.cc.on.lanh; });
    check('Lâu không có dịp gặp nhau thì tự nguôi, chuyện khép lại', exp);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Tranh luận trong văn phòng (sự kiện thế giới) giờ không bắt tay làm lành ngay (tắt CC thì như cũ)
  { const page = await open(browser);
    await page.evaluate(() => { S.job = { co:'cudem', salary:1e7, start:3 }; NGAY.ON = false; WEV.ON = false; });
    await office(page, 10, 10);
    const r = await page.evaluate(async () => { await WEV_FORCE('argue'); const s = WORLD.npcs.filter(a => a.ai && a.el.querySelector('.sign') && /🤝/.test(a.el.querySelector('.sign').textContent)).length;
      return { hand:s, mem:memAll().some(x => x.k === 'argue') }; });
    check('Tranh luận xong: chưa bắt tay ngay, mỗi người còn ghi nhớ', r.hand === 0 && r.mem, JSON.stringify(r));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Xe máy chỉ chạy trên phố chính, không chạy vào ngõ
  { const page = await open(browser);
    await scene(page, 'street', 8, 17.6);
    const r = await page.evaluate(async () => { let minX = 1e9, n = 0; for (let i = 0; i < 40; i++) { await new Promise(res => setTimeout(res, 150));
        WORLD.street.bike.forEach(b => { if (!b.gone) { n++; minX = Math.min(minX, b.x); } }); }
      WORLD.street.bike.forEach(b => { if (b.vis) { songHide(b, true); b.vis = null; } });
      psBike(WORLD, WORLD.api, () => .1); const b = WORLD.street.bike.find(x => x.vis); const start = b ? Math.round(b.x) : -1;   // xe đi sang phải: xuất phát ở đầu ngõ
      return { minX:Math.round(minX), n, lane:PHO.LANE, start }; });
    check('Xe máy không vào ngõ (luôn ở phần phố chính)', r.n > 0 && r.minX >= r.lane && r.start >= r.lane, JSON.stringify(r));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Hiệu năng: NPC ngoài màn hình hoặc đã đi khỏi thì dừng hoạt ảnh
  { const page = await open(browser);
    await scene(page, 'street', 8, 17.6); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => { const vw = WORLD.view ? WORLD.view.w : 520;
      const all = WORLD.npcs.filter(a => a.el);
      const off = all.filter(a => a.el.classList.contains('off')), gone = all.filter(a => a.gone);
      const leg = a => [...a.el.querySelectorAll('*')].find(n => getComputedStyle(n).animationName !== 'none');
      const css = off.some(a => { const n = leg(a) || a.el.querySelector('*'); return n && getComputedStyle(n).animationPlayState === 'paused'; });
      const on = all.filter(a => !a.off && !a.gone).map(leg).filter(Boolean); const runs = on.every(n => getComputedStyle(n).animationPlayState === 'running');
      return { n:all.length, off:off.length, css, runs, goneOff:gone.every(a => a.el.classList.contains('off')) }; });
    check('Có NPC ngoài màn hình được đánh dấu và dừng hoạt ảnh; người trong khung nhìn vẫn chạy hoạt ảnh', r.off > 0 && r.css && r.runs, JSON.stringify(r));
    check('NPC đã đi khỏi cũng dừng hoạt ảnh', r.goneOff);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
