// Kiểm thử v17.5 – Phase 3: ngày làm việc đặc biệt (hạn chót, review, khách, sự cố, demo, team building) và đời sống gia đình.
// Cần Playwright. Chạy: npm run gia-dinh-cong-viec
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
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
  await page.evaluate(() => { const HP = ROAM_PLACES.find(p => p.id === 'home'); window.HP_ENTRIES_RAW = who => HP.npcEntries(WORLD.ref, WORLD.sc, who); window.HP_ENTRIES = who => HP_ENTRIES_RAW(who).map(e => e.label); });
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; S.money = 5e6; window.__said = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  return page;
}
const until = (page, fn, arg, ms = 20000) => page.waitForFunction(fn, arg, { timeout:ms }).then(() => true, () => false);
// Ngày đầu tiên (từ ngày 6) có loại k với công ty co
const dayOf = (page, co, k) => page.evaluate(([co, k]) => { S.job = { co, salary:1e7, start:3 }; ngayLoai.memo = {}; for (let d = 6; d < 56; d++) if (ngayLoai(d) === k) return d; return null; }, [co, k]);
const office = (page, day, h) => page.evaluate(([day, h]) => { OFFICE_BAL.ABSENT = 0; S.day = day; S.slot = h < 12 ? 'morning' : 'afternoon'; S.roam = { d:day, t:h * 60 }; S.roamPos = {};
  S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.end = 1e9; }, [day, h]).then(() => page.waitForTimeout(1200));
const home = (page, day, h, slot) => page.evaluate(([day, h, slot]) => { S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.end = 1e9; }, [day, h, slot]).then(() => page.waitForTimeout(1200));

(async () => {
  const browser = await chromium.launch();

  // 1. Chọn loại ngày: có ngày bình thường xen giữa, đúng thứ, không lặp, cố định theo ngày
  { const page = await open(browser);
    const r = await page.evaluate(() => { const out = {}, bad = [];
      for (const co of ['hotay', 'banhmi', 'cudem', 'loren']) { S.job = { co, salary:1e7, start:3 }; ngayLoai.memo = {};
        const days = []; for (let d = 3; d <= 56; d++) if (!isDayOff(d)) days.push([d, ngayLoai(d)]);
        const sp = days.filter(x => x[1]).length; out[co] = Math.round(sp / days.length * 100);
        days.forEach(([d, k], i) => { const wd = dayInfo(d).wd;
          if (k && d < 6) bad.push(co + d + ':sớm'); if (k && NGAY_LOAI[k].wd && !NGAY_LOAI[k].wd.includes(wd)) bad.push(co + d + ':' + k + '@' + wd);
          if (k && i && days[i - 1][1] === k && days[i - 1][0] === d - 1) bad.push(co + d + ':lặp'); if (k && i > 1 && days[i - 1][1] && days[i - 2][1] && days[i - 1][0] === d - 1 && days[i - 2][0] === d - 2) bad.push(co + d + ':3 ngày'); });
        ngayLoai.memo = {}; const again = days.every(([d, k]) => ngayLoai(d) === k); if (!again) bad.push(co + ':không cố định'); }
      for (let d = 1; d <= 56; d++) if (isDayOff(d) && ngayLoai(d)) bad.push('nghỉ' + d);
      const all = new Set(); for (const co of ['hotay', 'banhmi', 'cudem', 'loren']) { S.job = { co, salary:1e7, start:3 }; ngayLoai.memo = {}; for (let d = 6; d <= 56; d++) if (ngayLoai(d)) all.add(ngayLoai(d)); }
      return { out, bad, kinds:[...all] }; });
    check('Khoảng 25–50% ngày làm việc là ngày đặc biệt, còn lại là ngày bình thường', Object.values(r.out).every(p => p >= 20 && p <= 55), JSON.stringify(r.out));
    check('Đúng luật: không trong 3 ngày đầu, đúng thứ, không hai ngày liền cùng loại, không quá 2 ngày đặc biệt liền nhau, cố định khi tải lại', !r.bad.length, r.bad.slice(0, 5).join(' '));
    check('Có đủ 6 loại ngày', r.kinds.length === 6, r.kinds.join(','));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Xếp vào buổi, không chồng thêm sự kiện ngẫu nhiên; tua nhanh thì không có
  { const page = await open(browser);
    const d = await dayOf(page, 'cudem', 'deadline'), d2 = await dayOf(page, 'cudem', 'demo');
    const q = await page.evaluate(([d, d2]) => { const res = {}; const old = BAL.EVENT_RATE; BAL.EVENT_RATE = 1;
      S.day = d; S.slot = 'morning'; S.fast = null; buildSlot(); res.sang = S.queue.map(r => r.id + (r.arg && typeof r.arg === 'string' ? ':' + r.arg : '')).join(' ');
      S.day = d2; S.slot = 'afternoon'; buildSlot(); res.chieu = S.queue.map(r => r.id + (r.arg && typeof r.arg === 'string' ? ':' + r.arg : '')).join(' ');
      S.fast = { from:d, until:d + 3 }; S.day = d; S.slot = 'morning'; buildSlot(); res.tua = S.queue.some(r => r.arg === 'ngay_deadline'); S.fast = null; BAL.EVENT_RATE = old; return res; }, [d, d2]);
    check('Ngày hạn chót: cảnh xếp sau họp đầu ngày, trước task; không thêm sự kiện ngẫu nhiên trong giờ làm', /standup ev:ngay_deadline task$/.test(q.sang), q.sang);
    check('Ngày demo: cảnh xếp buổi chiều, trước giờ tan làm', /ev:ngay_demo .*endwork/.test(q.chieu), q.chieu);
    check('Tua nhanh: ngày bình thường, không có cảnh', !q.tua);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Các cảnh: luôn có lựa chọn trung tính; hậu quả vừa phải; đồng nghiệp nhớ chuyện
  { const page = await open(browser);
    const r = await page.evaluate(() => { S.job = { co:'cudem', salary:1e7, start:3 }; const out = [];
      for (const k of Object.keys(NGAY_LOAI)) { const sc = EVENTS['ngay_' + k].build();
        sc.choices.forEach((c, i) => { const b = { money:S.money, energy:S.energy, perf:S.perf, rel:{ ...S.rel } };
          const realRand = Math.random; Math.random = () => .2; c.fx(); Math.random = realRand;
          const drel = Math.max(...Object.keys(S.rel).map(x => Math.abs(S.rel[x] - b.rel[x])));
          const worse = S.money < b.money || S.energy < b.energy || S.perf < b.perf || Object.keys(S.rel).some(x => S.rel[x] < b.rel[x]);
          out.push({ k, i, neutral:i === sc.choices.length - 1 ? !worse : null, drel, dE:S.energy - b.energy, cost:c.cost || 0 });
          S.rel = b.rel; S.energy = b.energy; S.perf = b.perf; }); }
      return out; });
    check('Mỗi ngày đặc biệt có lựa chọn cuối không làm giảm gì (không bị phạt vì việc ngoài tầm kiểm soát)', r.filter(x => x.neutral !== null).every(x => x.neutral), r.filter(x => x.neutral === false).map(x => x.k).join(','));
    check('Hậu quả vừa phải: quan hệ đổi tối đa 5, năng lượng giảm tối đa 10', r.every(x => x.drel <= 5 && x.dE >= -10), JSON.stringify(r.filter(x => x.drel > 5 || x.dE < -10)));
    const d = await dayOf(page, 'cudem', 'deadline');
    const m = await page.evaluate(d => { S.npcMem = []; S.day = d; S.slot = 'morning'; S.queue = [{ id:'ev', arg:'ngay_deadline' }]; S.cur = null; advance(); choose(0); const a = MEM_DEBUG(); S.day = d + 1; const r = memRecall('boss', 'talk'); return { a, r:r && r.text, ghi:S.flags.ngay }; }, d);
    check('Gánh việc ngày hạn chót: chị Hạnh nhớ và hôm sau nhắc lại', m.a.some(x => x.startsWith('boss>me:ev:ngay_deadline+')) && /hạn chót/.test(m.r || ''), JSON.stringify(m));
    const rv = await dayOf(page, 'cudem', 'review');
    const n = await page.evaluate(d => { S.npcMem = []; S.rel.dung = 50; S.day = d; S.slot = 'morning'; S.queue = [{ id:'ev', arg:'ngay_review' }]; S.cur = null; advance(); choose(0); S.day = d + 1; return { tier:htTier('dung'), mem:MEM_DEBUG() }; }, rv);
    check('Review góp ý thẳng khi chưa thân: tranh luận nhỏ, anh Dũng nhớ, hôm sau hơi lạnh nhạt', n.tier === 'lanh' && n.mem.some(x => x.startsWith('dung>me:ev:ngay_review-')), JSON.stringify(n));
    const ht = await page.evaluate(d => { S.day = d; const c = { who:'phong', at:'office', h:10, weekend:false, tier:'thuong', act:'desk', rel:50 }; const seen = new Set(); for (let i = 0; i < 40; i++) { const t = htTopic(c); if (t) seen.add(t.say[0]); } return [...seen]; }, d);
    check('Ngày hạn chót, bắt chuyện với Phong: có câu về hạn chót', ht.some(s => /khóc/.test(s)), ht.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Trong văn phòng: đồng nghiệp phản ứng theo loại ngày
  { const page = await open(browser);
    const d = await dayOf(page, 'cudem', 'deadline'); await office(page, d, 10);
    await page.evaluate(() => { WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(6000);
    const dl = await page.evaluate(() => WORLD.npcs.filter(a => a.ai && !a.gone && a.ai.act === 'desk').map(a => ({ who:a.who, sign:(a.el.querySelector('.npc-sign text') || {}).textContent, beat:!!a.ai.inBeat, expr:a.expr })));
    check('Ngày hạn chót: mọi người ngồi lì ở bàn (⏰), không đi lại tán gẫu, mặt mệt', dl.length >= 3 && dl.every(x => x.sign === '⏰' && !x.beat && x.expr === 'tired'), JSON.stringify(dl));
    const rv = await dayOf(page, 'cudem', 'review'); await office(page, rv, 10.1);
    const r = await until(page, () => { const a = WORLD.npcs.find(n => n.who === 'dung'), d = WORLD.H.desks.me; return a && Math.abs(a.x - d.x) < 60 && /🔍/.test((a.el.querySelector('.npc-sign text') || {}).textContent || ''); }, null, 20000);
    check('Ngày review: anh Dũng sang bàn bạn (🔍)', r);
    const kh = await dayOf(page, 'hotay', 'khach'); await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; }); await office(page, kh, 9.9);
    const k = await until(page, () => { const g = WORLD.npcs.find(n => n.id === 'khach_hang'); return g && !g.gone && Math.abs(g.x - WORLD.H.meetSpot.x - 30) < 20; }, null, 20000);
    check('Ngày khách đến: khách hàng vào ngồi ở chỗ họp cùng chị Hạnh', k);
    let tm = null, tco = null; for (const co of ['cudem', 'banhmi', 'loren', 'hotay']) { tm = await dayOf(page, co, 'team'); if (tm) { tco = co; break; } }   // công ty nào có chiều team building
    await page.evaluate(co => { S.job = { co, salary:1e7, start:3 }; ngayLoai.memo = {}; }, tco); await office(page, tm, 15.5); await page.evaluate(() => { WORLD.t = 15.98 * 60; });
    const t = await until(page, () => WORLD.npcs.filter(a => a.ai && !a.gone && /🎉/.test((a.el.querySelector('.npc-sign text') || {}).textContent || '')).length >= 3, null, 25000);
    check('Chiều thứ Sáu team building: cả team ra pantry (🎉)', t);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Gia đình: bố mẹ trò chuyện; đi làm về mẹ hỏi han, chọn câu trả lời; hôm sau mẹ hỏi lại
  { const page = await open(browser, 'nha');
    await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; });
    await home(page, 8, 19.6, 'evening');
    await page.evaluate(() => { WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(3000);
    await page.evaluate(() => { const m = WORLD.npcs.find(n => n.who === 'mom'); S.flags.gdHoi = S.day; WORLD.me.x = m.x + 60; WORLD.me.y = Math.min(ROAM.Y1, m.y + 20); }); await page.waitForTimeout(800);   // đứng gần để nhìn thấy (chưa để mẹ hỏi han)
    await page.evaluate(() => { WORLD.gdNext = 0; window.__said = []; });
    const chat = await until(page, () => window.__said.some(s => Object.values(GD_CHUYEN).flat(2).includes(s)), null, 15000);
    check('Bố mẹ cùng xem TV buổi tối: nói chuyện với nhau', chat, (await page.evaluate(() => window.__said.slice(-3))).join(' | '));
    await page.evaluate(() => { S.flags.gdHoi = 0; const m = WORLD.npcs.find(n => n.who === 'mom'); WORLD.me.x = m.x - 40; WORLD.me.y = Math.min(ROAM.Y1, m.y + 10); });
    const asked = await until(page, () => !!WORLD.gdHoi, null, 10000);
    const menu = await page.evaluate(() => WORLD.gdHoi && HP_ENTRIES('mom'));
    check('Đi làm về: mẹ hỏi “Hôm nay đi làm có mệt không con?”, bấm vào mẹ có 4 câu trả lời', asked && menu && menu.length >= 4 && /ổn/.test(menu[0]), JSON.stringify(menu));
    const s0 = await page.evaluate(() => S.mood);
    await page.evaluate(() => { const e = HP_ENTRIES_RAW('mom').find(x => /không vui/.test(x.label)); e.run(WORLD, WORLD.api); });
    await until(page, () => !WORLD.busy, null, 15000);
    const r = await page.evaluate(() => ({ mood:S.mood, said:window.__said.slice(-4), mem:MEM_DEBUG(), again:WORLD.gdHoi.done }));
    check('Kể chuyện không vui: mẹ an ủi, bố nói thêm, tinh thần +2', r.mood - s0 === 2 && r.said.some(s => /kể mẹ nghe|ăn bát canh/.test(s)), JSON.stringify(r).slice(0, 220));
    const next = await page.evaluate(() => { S.day = 9; const x = memRecall('mom', 'talk'); S.day = 8; return x && x.text; });
    check('Hôm sau mẹ hỏi lại chuyện công ty', /công ty/.test(next || ''), next);
    const once = await page.evaluate(() => { WORLD.gdHoi = null; gdHoiTham(WORLD, WORLD.api); return !!WORLD.gdHoi; });
    check('Mỗi ngày mẹ chỉ hỏi một lần', !once);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Câu trả lời bình thường không đổi chỉ số; Tùng hỏi han và kể chuyện chỗ làm; bố nhắc lương
  { const page = await open(browser, 'ghep');
    await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; });
    await home(page, 9, 21.8, 'evening');
    await page.evaluate(() => { WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(4000);
    await page.evaluate(() => { const t = WORLD.npcs.find(n => n.who === 'tung'); if (t) { WORLD.me.x = t.x - 40; WORLD.me.y = Math.min(ROAM.Y1, t.y + 10); } });
    const asked = await until(page, () => !!WORLD.gdHoi && WORLD.gdHoi.who === 'tung', null, 12000);
    const s0 = await page.evaluate(() => JSON.stringify([S.mood, S.energy, S.money]));
    if (asked) { await page.evaluate(() => HP_ENTRIES_RAW('tung').find(x => /khá ổn/.test(x.label)).run(WORLD, WORLD.api)); await until(page, () => !WORLD.busy, null, 15000); }
    const s1 = await page.evaluate(() => JSON.stringify([S.mood, S.energy, S.money]));
    check('Ở ghép: Tùng hỏi “Hôm nay công ty mày thế nào?”; trả lời “khá ổn” thì không đổi chỉ số', asked && s0 === s1, `${s0} → ${s1}`);
    await page.evaluate(() => { window.__said = []; S.flags.gdTung = 0; WORLD.gdHoi.done = true; gdTungKe(WORLD, WORLD.api); });
    await page.waitForTimeout(3500);
    const ke = await page.evaluate(() => window.__said.some(s => GD_TUNG_KE.flat().includes(s)));
    check('Tùng đi ca về kể chuyện chỗ làm', ke, (await page.evaluate(() => window.__said)).join(' | '));
    const luong = await page.evaluate(() => { S.income = { [S.day]:1e7 }; const c = { who:'dad', at:'home', h:20, weekend:false, tier:'thuong', act:'news', rel:60 }; const seen = new Set(); for (let i = 0; i < 40; i++) { const t = htTopic(c); if (t) seen.add(t.say[0]); } return [...seen]; });
    check('Lương vừa về: bố hỏi chuyện lương khi bắt chuyện', luong.some(s => /Lương về/.test(s)), luong.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Tắt được
  { const page = await open(browser);
    const r = await page.evaluate(() => { NGAY.ON = false; GD.ON = false; S.job = { co:'cudem', salary:1e7, start:3 }; ngayLoai.memo = {}; let n = 0; for (let d = 6; d < 56; d++) if (ngayLoai(d)) n++; return n; });
    check('Tắt (NGAY.ON = false): không còn ngày đặc biệt', r === 0);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
