// Kiểm thử văn phòng đi lại được (v15): bốn kiểu văn phòng, họp, task với trò chơi nhỏ, kỷ luật, tan làm. Cần Playwright.
// Chạy: npm run van-phong-di-lai
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, co = 'hotay', opts = {}){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="tro"]'); await page.click('#go');
  await page.evaluate(co => { MG.KIEU = 'cu';   // v17.7: bài này chơi trực tiếp 4 trò cũ (đọc code); trò mới kiểm thử ở kiem-thu-tro-choi-moi.js
    S.once.roamTut = true; S.job = { co, salary:1e7, start:3 }; S.habit = { meal:'rice', lunchWork:'team', bed:23.5, work:'careful' }; OFFICE_BAL.ABSENT = 0; S.day = 9; }, co);
  return page;
}
// Mở một cảnh ở văn phòng
const scene = (page, refs, slot = 'morning') => page.evaluate(([refs, slot]) => { S.slot = slot; S.roam = null; S.queue = refs; S.cur = null; advance(); }, [refs, slot]).then(() => page.waitForTimeout(400));
const W = page => page.evaluate(() => ROAM_DEBUG());
// Giải trọn một trò chơi nhỏ đang mở (good = true) hoặc chơi thật tệ rồi bấm Xong
async function solve(page, good){
  return page.evaluate(async good => {
    const box = document.querySelector('.mg'); if (!box) return 'không mở';
    const wait = ms => new Promise(r => setTimeout(r, ms));
    if (box.querySelector('.mg-code')) {                                     // bắt bug
      const kind = 'bug', tid = WORLD.ref.arg.tid, bad = MG_DATA.bug[tid].bad;
      box.querySelectorAll('.mg-line').forEach(b => { if (bad.includes(+b.dataset.i) === good) b.click(); });
    } else if (box.querySelector('.mg-order')) {                             // xếp code
      // chơi giỏi: xếp đúng thứ tự. Chơi kém: xếp NGƯỢC rồi bấm Xong (v17.9: trước đây bấm Xong ngay, thứ tự xáo ngẫu nhiên đôi khi có sẵn nhiều dòng đúng nên điểm ra 0, bài chập chờn)
      const goc = MG_DATA.order[WORLD.ref.arg.tid].lines, lines = good ? goc : [...goc].reverse();
      for (let p = 0; p < lines.length; p++) for (let n = 0; n < 12; n++) {
        const rows = [...box.querySelectorAll('.mg-row')], at = rows.findIndex(r => r.querySelector('code').textContent === lines[p]);
        if (at <= p || !document.body.contains(box)) break; rows[at].querySelector('[data-mv="-1"]').click(); await wait(10); }
    } else if (box.querySelector('.mg-term')) {                              // gõ lệnh
      const inp = box.querySelector('input'), items = [...box.querySelectorAll('.mg-cmds li code')];
      for (const it of items) { inp.value = good ? it.textContent : 'sai'; inp.dispatchEvent(new Event('input')); inp.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true })); await wait(10); if (!good) break; }
      if (!good) box.querySelector('.mg-done') && !box.querySelector('.mg-done').hidden ? box.querySelector('.mg-done').click() : null;
    } else if (box.querySelector('.mg-match')) {                             // nối dây
      const Ls = [...box.querySelectorAll('.mg-cell.L:not([disabled])')];
      for (const l of Ls) { l.click(); const want = good ? l.dataset.i : [...box.querySelectorAll('.mg-cell.R:not([disabled])')].find(r => r.dataset.i !== l.dataset.i)?.dataset.i;
        const r = box.querySelector(`.mg-cell.R[data-i="${want}"]`); if (r) r.click(); await wait(10); }
    }
    const d = box.querySelector('.mg-done'); if (!good && d && !d.hidden && document.body.contains(box)) d.click();   // chơi kém: bấm Xong cho nhanh
    return 'ok';
  }, good);
}

(async () => {
  const browser = await chromium.launch();

  // 1. Bốn kiểu văn phòng: mở được, đủ người, đồ vật nào cũng đi tới được, không ai đứng trùng chỗ
  for (const co of ['hotay','banhmi','cudem','loren','songhong','trasua','xeom','giaytot']) {
    const page = await open(browser, co); await scene(page, [{ id:'standup' }]);
    const r = await page.evaluate(() => { const H = WORLD.H; return { name:H.name, kind:H.kind, place:document.querySelector('#world').dataset.place, npcs:WORLD.npcs.map(a => a.who).sort().join(','),
      unreach:H.objs.filter(o => !roamPath(H, H.spawn, o.spot)).map(o => o.id), spots:WORLD.npcs.map(a => Math.round(a.x)), sign:document.querySelector('#world svg').textContent.includes(H.name) }; });
    const dup = new Set(r.spots).size !== r.spots.length;
    check(`${r.name} (${r.kind}): mở văn phòng, đủ 4 đồng nghiệp, có biển tên công ty`, r.place === 'office' && r.npcs === 'boss,dung,mai,phong' && r.sign, r.npcs);
    check(`${r.name}: mọi đồ vật đi tới được, không ai đứng trùng chỗ`, !r.unreach.length && !dup, r.unreach.join(', '));
    // v17.9 (P3-06): đồng nghiệp rời ghế đi tới mọi đồ vật, mọi bàn khác: dò từng điểm ảnh, chân không chạm bàn, vách ngăn
    const xuyen = await page.evaluate(() => { const H = WORLD.H, ghe = Object.values(H.desks), dich = [...H.objs.map(o => o.spot).filter(Boolean), ...ghe, ...ghe.map(d => ({ x:d.x + 34, y:d.y })), ...ghe.map(d => ({ x:d.x - 34, y:d.y }))], sai = [];
      const cham = (a, q) => { const n = Math.ceil(Math.hypot(q.x - a.x, q.y - a.y)); for (let i = 1; i <= n; i++) { const x = a.x + (q.x - a.x) * i / n, y = a.y + (q.y - a.y) * i / n; if (!roamFree(H, x, y)) return `${Math.round(x)},${Math.round(y)}`; } return ''; };
      for (const f of ghe) for (const g of dich) { const gg = roamNearestFree(H, g); if (!gg) continue; const duong = roamPath(H, f, gg) || [gg]; let a = f; for (const q of duong) { const c = cham(a, q); if (c) { sai.push(`${f.x}→${Math.round(gg.x)}: chạm ${c}`); break; } a = q; } }
      return { n:ghe.length * dich.length, sai }; });
    check(`${r.name}: đồng nghiệp rời ghế đi tới mọi chỗ không cắt qua mép bàn, vách (${xuyen.n} đường)`, !xuyen.sai.length, `${xuyen.sai.length} đường: ${xuyen.sai.slice(0, 3).join(' | ')}`);
    // v17.9 (P3-07): biển tên công ty không đè lên đồng hồ, thanh thời gian và chữ neon trên tường
    const de = await page.evaluate(() => { const hop = el => el && el.getBoundingClientRect(), bien = hop(document.querySelector('#world .o-sign'));
      const cham = (a, b) => !!(a && b && a.width && b.width && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1);
      return ['.w-clock', '.w-left', '#world .o-neon'].filter(q => cham(bien, hop(document.querySelector(q)))); });
    check(`${r.name}: biển tên công ty không đè lên đồng hồ, thanh thời gian, chữ neon`, !de.length, de.join(', '));
    check(`${r.name}: không lỗi`, !page.errs.length, page.errs[0] || '');
    await page.context().close();
  }

  // 2. Họp đầu ngày: đến chỗ họp nhấn E là vào cảnh họp cũ; không tới thì chị Hạnh gọi, quan hệ −1
  { const page = await open(browser, 'banhmi'); await scene(page, [{ id:'standup' }, { id:'task', arg:{ tid:102 } }]);
    await page.evaluate(() => { WORLD.me.x = WORLD.H.meetSpot.x; WORLD.me.y = 176; }); await page.waitForTimeout(500);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(300); await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
    const a = await page.evaluate(() => ({ cur:S.cur.id, world:!!document.querySelector('#world'), n:document.querySelectorAll('#stage .choice').length }));
    check('Đến chỗ họp nhấn E: vào đúng cảnh họp đầu ngày như cũ (3 cách báo cáo)', a.cur === 'standup' && !a.world && a.n === 3, JSON.stringify(a));
    await page.context().close(); }
  { const page = await open(browser, 'hotay'); await scene(page, [{ id:'standup' }]);
    const b0 = await page.evaluate(() => S.rel.boss); await page.evaluate(() => { WORLD.t = WORLD.end - .3; }); await page.waitForTimeout(2200);
    const r = await page.evaluate(() => ({ boss:S.rel.boss, cur:S.cur.id, world:!!document.querySelector('#world'), feed:S.feed.map(f => f.text).join(' / ') }));
    check('Không tới chỗ họp: chị Hạnh gọi, tính họp muộn (quan hệ −1), rồi vào họp', r.boss === b0 - 1 && r.cur === 'standup' && !r.world && /họp muộn/.test(r.feed), `${b0} → ${r.boss}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Task ở bàn: đúng các cách làm cũ; hỏi anh Dũng thì phải sang bàn anh Dũng
  { const page = await open(browser, 'cudem'); await scene(page, [{ id:'task', arg:{ tid:102 } }]);
    await page.evaluate(() => WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = Infinity; }));   // thế giới sống: tạm dừng việc xen để mọi người ngồi yên ở bàn trong mục này
    await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(400);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const desk = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim())); await page.keyboard.press('Escape');
    await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'dung'); WORLD.me.x = a.x - 26; WORLD.me.y = a.y + 8; }); await page.waitForTimeout(400);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const dung = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
    check('Bàn của bạn: làm nhanh, làm kỹ, để tối OT (không có “hỏi anh Dũng”)', desk.some(t => /Làm nhanh/.test(t)) && desk.some(t => /Làm kỹ/.test(t)) && !desk.some(t => /Dũng/.test(t)), desk.join(' | '));
    check('Đến chỗ anh Dũng: có “Hỏi anh Dũng” và “Bắt chuyện”', dung.some(t => /Hỏi anh Dũng/.test(t)) && dung.some(t => /Bắt chuyện/.test(t)), dung.join(' | '));
    const r0 = await page.evaluate(() => S.rel.dung); await page.keyboard.press('Digit1'); await page.waitForTimeout(3500);
    const r = await page.evaluate(() => ({ dung:S.rel.dung, ask:S.askCount, toast:!document.querySelector('.w-toast').hidden }));
    check('Hỏi anh Dũng tại chỗ anh ấy: tính đúng lựa chọn cũ (không có trò chơi)', r.ask === 1 && r.dung > r0 && r.toast && !(await page.$('.mg')), JSON.stringify(r));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Bỏ qua trò chơi: chỉ số giống hệt bấm nút trong danh sách
  { const run = async viaWorld => { const page = await open(browser, 'loren'); await page.evaluate(() => { Math.random = () => .5; }); await scene(page, [{ id:'task', arg:{ tid:104 } }]);
      if (viaWorld) { await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(300); await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
        await page.keyboard.press('Digit2'); await page.waitForTimeout(500); await page.click('.mg-skip'); await page.waitForTimeout(2200); }
      else await page.evaluate(() => choose(current.choices.findIndex(c => c.key === 'careful')));
      const s = await page.evaluate(() => [S.tech, S.energy, S.perf, S.stat.tasks, S.bugs.length, S.unfinished || ''].join(','));
      await page.context().close(); return s; };
    const a = await run(true), b = await run(false);
    check('Bỏ qua trò chơi (“Để nhân vật tự làm”): kết quả giống hệt bấm nút như cũ', a === b, `${a} so với ${b}`); }

  // 5. Bốn trò chơi: chơi giỏi thì +6%, chơi kém thì âm, luôn trong giới hạn ±6%
  for (const [tid, name] of [[102, 'Bắt bug'], [101, 'Xếp code'], [110, 'Gõ lệnh'], [107, 'Nối dây API']]) {
    const res = {};
    for (const good of [true, false]) {
      const page = await open(browser, 'banhmi'); await scene(page, [{ id:'task', arg:{ tid } }]);
      await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(300); await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
      await page.keyboard.press('Digit1'); await page.waitForTimeout(500);
      const opened = await page.$eval('.mg .mg-tt b', el => el.textContent).catch(() => '');
      await solve(page, good); await page.waitForTimeout(3200);
      const toast = await page.$eval('.w-toast', el => el.textContent).catch(() => '');
      const m = toast.match(/khả năng làm tốt ([+−])(\d+)%/), bonus = m ? (m[1] === '−' ? -1 : 1) * +m[2] / 100 : null;
      res[good] = { opened, bonus, toast, errs:page.errs.slice() }; await page.context().close();
    }
    check(`${name}: mở đúng trò cho task #${tid}`, res.true.opened === name, res.true.opened);
    check(`${name}: chơi giỏi → +6%, chơi kém → âm, không vượt ±6%`, res.true.bonus === .06 && res.false.bonus !== null && res.false.bonus < 0 && res.false.bonus >= -.06, `${res.true.bonus} / ${res.false.bonus}`);
    check(`${name}: kết quả trò chơi ghi trong khung kết quả`, /khả năng làm tốt \+6%/.test(res.true.toast), res.true.toast.slice(0, 100));
    check(`${name}: không lỗi`, !res.true.errs.length && !res.false.errs.length, res.true.errs[0] || res.false.errs[0] || '');
  }

  // 6. Kỷ luật: rời bàn 30 / 60 / 90 phút game → nhắn tin / đến tận nơi (quan hệ −1) / hiệu suất −1; mỗi loại một lần mỗi ngày
  { const page = await open(browser, 'hotay'); await scene(page, [{ id:'task', arg:{ tid:103 } }]);
    const s0 = await page.evaluate(() => ({ boss:S.rel.boss, perf:S.perf, unread:unreadCount() }));
    await page.evaluate(() => { WORLD.me.x = WORLD.H.pantry.x; WORLD.me.y = 180; WORLD.away = 29; }); await page.waitForTimeout(1200);
    const a = await page.evaluate(() => ({ unread:unreadCount(), msg:(S.phone.threads.boss || []).slice(-1)[0], boss:S.rel.boss }));
    check('Rời bàn 30 phút game: chị Hạnh nhắn tin nhắc', a.unread > s0.unread && a.msg && a.msg.who === 'boss' && a.boss === s0.boss, a.msg && a.msg.t);
    await page.evaluate(() => { WORLD.away = 59; }); await page.waitForTimeout(1200);
    const b = await page.evaluate(() => ({ boss:S.rel.boss, perf:S.perf }));
    check('Rời bàn 60 phút: chị Hạnh đến tận nơi, quan hệ −1', b.boss === s0.boss - 1 && b.perf === s0.perf, `${s0.boss} → ${b.boss}`);
    await page.evaluate(() => { WORLD.away = 89; }); await page.waitForTimeout(1200);
    const c = await page.evaluate(() => ({ perf:S.perf, kl:S.stat.klWarn, feed:S.feed.map(f => f.text).join(' / ') }));
    check('Rời bàn 90 phút: hiệu suất −1, ghi vào nhật ký', c.perf === s0.perf - 1 && c.kl === 1 && /hiệu suất −1/.test(c.feed), c.feed.slice(-80));
    await page.evaluate(() => { WORLD.klLv = 0; WORLD.away = 95; }); await page.waitForTimeout(800);
    const d = await page.evaluate(() => ({ boss:S.rel.boss, perf:S.perf }));
    check('Mỗi loại nhắc chỉ tính một lần mỗi ngày', d.boss === b.boss && d.perf === c.perf);
    await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(400);
    check('Về đến bàn: bộ đếm rời bàn về 0', await page.evaluate(() => WORLD.away) === 0);
    const rv = await page.evaluate(() => SC.review().html);
    check('Buổi nhận xét nhắc lại chuyện bỏ bàn', /quay về bàn làm việc/.test(rv));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Tan làm: ra cửa ở sảnh; ăn trưa: ra cửa cùng team hoặc ăn ở bàn
  { const page = await open(browser, 'xeom'); await scene(page, [{ id:'endwork', arg:{ ask:false, invite:true } }], 'afternoon');
    await page.evaluate(() => { const d = WORLD.H.objs.find(o => o.id === 'door').spot; WORLD.me.x = d.x; WORLD.me.y = d.y; }); await page.waitForTimeout(400); await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const m = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
    check('Tan làm: ở cửa có “Về nhà” và “Đi trà đá”', m.some(t => /Về nhà/.test(t)) && m.some(t => /trà đá/.test(t)), m.join(' | '));
    await page.keyboard.press('Digit1'); await page.waitForTimeout(1600);
    check('Ra cửa về nhà: sang cảnh tiếp theo, không kẹt', await page.evaluate(() => !S.cur || S.cur.id !== 'endwork'));
    await page.evaluate(() => { S.habit.lunchWork = 'ask'; }); await scene(page, [{ id:'meal', arg:'lunch' }], 'noon');
    await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(400); await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
    const lunch = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
    check('Ăn trưa ở bàn: bánh mì hoặc ngủ trưa', lunch.some(t => /Bánh mì/.test(t)) && lunch.some(t => /ngủ trưa/.test(t)), lunch.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 8. Tua nhanh qua ngày làm việc: không dừng ở văn phòng, không kẹt
  { const page = await open(browser, 'trasua');
    await page.evaluate(() => { S.slot = 'night'; S.queue = []; S.cur = null; S.sleep = 8; startDay(); }); await page.waitForTimeout(300);
    const d0 = await page.evaluate(() => S.day);
    for (let i = 0; i < 40 && await page.evaluate(d => S.day === d, d0); i++) { await page.evaluate(() => { const q = x => document.querySelector(x); if (q('#next')) return q('#next').click(); const fd = q('#ffDay'); if (fd) return fd.click(); const ch = [...document.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.textContent.includes('Tua đến')); if (ch.length) ch[0].click(); }); await page.waitForTimeout(150); }
    check('Tua nhanh qua một ngày làm việc: sang ngày mới, không kẹt, không lỗi', await page.evaluate(d => S.day > d, d0) && !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 9. Điện thoại: chạm được vào trò chơi
  { const page = await open(browser, 'cudem', { ...devices['iPhone 13'] }); await scene(page, [{ id:'task', arg:{ tid:107 } }]);
    await page.evaluate(() => { WORLD.me.x = WORLD.H.desks.me.x; WORLD.me.y = 164; }); await page.waitForTimeout(400);
    await page.tap('.w-use'); await page.waitForTimeout(300); await page.tap('.w-menu .w-act >> nth=0'); await page.waitForTimeout(500);
    const box = await page.$('.mg'); const fits = await page.evaluate(() => { const r = document.querySelector('.mg-box').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; });
    await page.tap('.mg-cell.L >> nth=0'); await page.waitForTimeout(100);
    const pressed = await page.$eval('.mg-cell.L >> nth=0', el => el.getAttribute('aria-pressed'));
    check('Điện thoại: chạm nút ✋ → chọn cách làm → trò chơi vừa màn hình, chạm được', !!box && fits && pressed === 'true');
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
