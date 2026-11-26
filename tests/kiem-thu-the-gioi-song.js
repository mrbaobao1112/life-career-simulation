// Kiểm thử thế giới sống – Phase 1: NPC tự sống theo lịch (nhà, văn phòng). Cần Playwright.
// Chạy: npm run the-gioi-song
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, bg = 'ghep', opts = {}){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; });
  return page;
}
const home = (page, day, slot = 'morning') => page.evaluate(([day, slot]) => { S.day = day; S.slot = slot; S.roam = null; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); }, [day, slot]).then(() => page.waitForTimeout(400));
const office = (page, ref = { id:'standup' }) => page.evaluate(ref => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; S.roam = null; S.queue = [ref]; S.cur = null; advance(); }, ref).then(() => page.waitForTimeout(500));
const D = page => page.evaluate(() => SONG_DEBUG());
// Đặt đồng hồ đến giờ h rồi chờ NPC làm xong việc chuyển (tối đa ms)
async function at(page, h, ms = 15000){
  // v18.0: giữ đồng hồ game đứng yên trong lúc chờ (WORLD.hold). Trước đây đồng hồ vẫn chạy 2 phút/giây; máy bận thì chờ lâu,
  // giờ đã trôi qua việc cần xem (ví dụ Tùng tắm xong, sang nấu ăn) nên bài chập chờn
  await page.evaluate(h => { WORLD.t = h * 60; WORLD.end = 1e9; WORLD.hold = true; }, h);
  for (let w = 0; w < ms; w += 300) { await page.waitForTimeout(300); if (await page.evaluate(() => SONG_DEBUG().every(a => !a.busy))) break; }
  const r = await D(page); await page.evaluate(() => { WORLD.hold = false; }); return r;
}
const settled = list => list.filter(a => !a.gone && !a.busy);
const overlap = list => { const s = settled(list); for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (Math.abs(s[i].x - s[j].x) < 24 && Math.abs(s[i].y - s[j].y) < 14) return `${s[i].who}/${s[j].who}`; return ''; };

(async () => {
  const browser = await chromium.launch();

  // 1. Lịch theo giờ: cùng ngày ra cùng lịch, ngày khác lệch khác; ngày thường khác cuối tuần
  { const page = await open(browser);
    const r = await page.evaluate(() => { S.day = 8; const a = JSON.stringify(npcDay('tung', 'home')), b = JSON.stringify(npcDay('tung', 'home')); S.day = 9; const c = JSON.stringify(npcDay('tung', 'home')); S.day = 6; const w = npcDay('tung', 'home').map(x => x[1]).join(','); S.day = 8;
      return { same:a === b, diff:a !== c, wd:JSON.parse(a).map(x => x[1]).join(','), we:w, noon:npcNow('tung', 'home', 11.5 * 60).act, aft:npcNow('tung', 'home', 15 * 60).act }; });
    check('Lịch theo ngày: cùng ngày luôn giống nhau, ngày khác giờ giấc lệch khác nhau', r.same && r.diff);
    check('Tùng: ngày thường ca chiều (13:30 đi làm), cuối tuần chiều đi trà đá – hai lịch khác nhau', r.wd !== r.we && r.noon === 'game' && r.aft === 'out', `${r.wd} | ${r.we}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Ở ghép, ngày thường: Tùng tự chuyển qua các việc trong ngày, không kẹt, không nhân bản
  { const page = await open(browser, 'ghep'); await home(page, 8);
    const seen = []; let stuck = '';
    const marks = await page.evaluate(() => { const L = npcDay('tung', 'home'); return L.slice(0, 5).map((m, i) => +(((m[0] + (L[i + 1] ? L[i + 1][0] : m[0] + 1)) / 2).toFixed(2))); });   // giữa mỗi mốc lịch hôm nay
    for (const h of [...marks.slice(0, 4), 13.7]) { const l = await at(page, h); const t = l.find(a => a.who === 'tung'); seen.push(`${h}:${t.act}${t.gone ? '(vắng)' : ''}`); if (t.busy) stuck = h; }
    check('Tùng tự làm theo lịch: ngủ → tắm → nấu ăn → chơi game → đi làm', /:sleep/.test(seen.join(' ')) && /bath/.test(seen.join(' ')) && /cook/.test(seen.join(' ')) && /game/.test(seen.join(' ')) && /13.7:out\(vắng\)/.test(seen.join(' ')), seen.join(' '));
    check('Mỗi việc đều tự kết thúc, không kẹt giữa đường', !stuck, String(stuck));
    await page.evaluate(() => { renderScene(); renderScene(); WORLD.t = 13.7 * 60; WORLD.end = 1e9; }); await page.waitForTimeout(1200);
    check('Dựng lại cảnh nhiều lần: Tùng không bị nhân bản', await page.evaluate(() => document.querySelectorAll('#world .actor[data-who="tung"]').length) === 1);
    check('Đi ra ngoài thì vắng hẳn: không bắt chuyện được, không chặn đường', await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'tung'); WORLD.me.x = a.x - 20; WORLD.me.y = a.y; return true; }).then(() => page.waitForTimeout(400)).then(() => page.evaluate(() => !WORLD.near || !WORLD.near.npc)));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Có việc xen ngắn và lúc đứng yên; quay về việc chính sau khi xong
  { const page = await open(browser, 'ghep'); await home(page, 8);
    await at(page, 11); let beat = false, back = false;
    for (let m = 0; m < 160 && !(beat && back); m += 4) {
      await page.evaluate(m => { WORLD.t = 11 * 60 + m; }, m); await page.waitForTimeout(160);
      const t = (await D(page)).find(a => a.who === 'tung'); if (t.beat) beat = true; else if (beat && !t.busy && t.act === 'game') back = true;
    }
    check('Trong lúc chơi game, Tùng có việc xen (lấy nước, nghe điện thoại…) rồi quay về chơi tiếp', beat && back, `xen ${beat}, quay về ${back}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Nhà bố mẹ: ngày thường bố đi làm; cuối tuần bố ở nhà uống trà, đọc báo
  { const page = await open(browser, 'nha');
    await home(page, 8); const wd = await at(page, 10);
    await home(page, 6); const we = await at(page, 8.4);
    const dad = l => l.find(a => a.who === 'dad'), mom = l => l.find(a => a.who === 'mom');
    check('Ngày thường 10:00: bố đi làm (vắng), mẹ ở nhà làm việc nhà', dad(wd).gone && !mom(wd).gone, `${dad(wd).act} / ${mom(wd).act}`);
    check('Cuối tuần 8:24: bố ở nhà (đọc báo, uống trà)', !dad(we).gone && ['read', 'tea'].includes(dad(we).act), dad(we).act);
    check('Không ai đứng đè lên ai', !overlap(we) && !overlap(wd), overlap(we) || overlap(wd));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Văn phòng: 9:00 cả nhóm ở chỗ họp; sau đó về bàn; trưa ra ngoài ăn; chiều quay lại
  { const page = await open(browser, 'tro'); await office(page);
    const meet = await D(page);
    check('9:00: cả 4 người đứng ở chỗ họp, không đè lên nhau', meet.length === 4 && meet.every(a => a.act === 'meet' && !a.gone) && !overlap(meet), meet.map(a => a.who + '@' + a.x).join(' '));
    const desk = await at(page, 9.6);
    check('Họp xong: ai về bàn nấy', desk.every(a => a.act === 'desk' && !a.gone && !a.busy), desk.map(a => a.who + ':' + a.act).join(' '));
    await page.evaluate(() => { WORLD.t = 11.7 * 60; WORLD.end = 1e9; }); await page.waitForTimeout(16000);   // đồng hồ chạy thật từ 11:42 đến khoảng 12:14
    const lunch = await D(page);
    check('Khoảng 12:15: mọi người ra ngoài ăn trưa (văn phòng vắng)', lunch.every(a => a.gone), lunch.map(a => a.who + (a.gone ? '(vắng)' : '')).join(' '));
    const pm = await at(page, 13.5, 25000);
    check('13:30: quay lại làm việc', pm.every(a => a.act === 'desk' && !a.gone), pm.map(a => a.who + ':' + a.act).join(' '));
    check('Có dấu hiệu nhỏ trên đầu (💻 đang làm việc)', await page.evaluate(() => document.querySelectorAll('#world .npc-sign').length) >= 3);
    await page.evaluate(() => { S.opt.signs = false; renderScene(); }); await page.waitForTimeout(400);
    check('Tắt dấu hiệu trong Nếp sinh hoạt: không còn dấu hiệu', await page.evaluate(() => document.querySelectorAll('#world .npc-sign').length) === 0);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Đang nói chuyện với người chơi thì đứng yên; chuyển tab thì dừng; giảm chuyển động thì dịch chuyển thẳng
  { const page = await open(browser, 'tro'); await office(page, { id:'task', arg:{ tid:102 } });
    await at(page, 9.6);
    await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'mai'); WORLD.me.x = a.x - 26; WORLD.me.y = a.y + 8; }); await page.waitForTimeout(350);
    await page.keyboard.press('KeyE'); await page.waitForTimeout(200);
    const before = await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'mai'); a.ai.until = 0; return a.x; });
    await page.waitForTimeout(1500);
    check('Đang mở thực đơn nói chuyện với chị Mai: chị Mai đứng yên, không bỏ đi', await page.evaluate(() => WORLD.npcs.find(n => n.who === 'mai').x) === before);
    await page.keyboard.press('Escape');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable:true, get:() => true }); });
    const t0 = await page.evaluate(() => WORLD.t); await page.waitForTimeout(1500); const t1 = await page.evaluate(() => WORLD.t);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable:true, get:() => false }); });
    check('Chuyển tab: đồng hồ và NPC dừng hẳn', t0 === t1, `${t0} → ${t1}`);
    await page.emulateMedia({ reducedMotion:'reduce' }); await office(page);
    const r = await at(page, 9.6, 1500);
    check('Giảm chuyển động: NPC vào chỗ ngay, không diễn đi bộ', r.every(a => a.act === 'desk' && !a.busy), r.map(a => a.who + ':' + a.busy).join(' '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Điện thoại: thế giới sống chạy, vẫn điều khiển được
  { const page = await open(browser, 'ghep', { ...devices['iPhone 13'] }); await home(page, 8, 'morning');
    const box = await (await page.$('.w-joy')).boundingBox(); const x0 = await page.evaluate(() => WORLD.me.x);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width * .85, box.y + box.height / 2, { steps:3 }); await page.waitForTimeout(700); await page.mouse.up();
    check('Điện thoại: vẫn điều khiển được khi người ở cùng tự sinh hoạt', await page.evaluate(() => WORLD.me.x) > x0 + 20 && (await D(page)).length === 1);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
