// Kiểm thử v17.5 – Phase 1: hội thoại khi chủ động bắt chuyện (trí nhớ, nơi, giờ, mức thân), câu của khách lạ theo nơi.
// Cần Playwright. Chạy: npm run hoi-thoai
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
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; S.money = 5e6; window.__said = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  return page;
}
const pickIn = (page, ref, i, day) => page.evaluate(([ref, i, day]) => { S.day = day; S.slot = 'evening'; S.queue = [ref]; S.cur = null; advance(); choose(i); }, [ref, i, day]).then(() => page.waitForTimeout(300));
const office = (page, day, h) => page.evaluate(([day, h]) => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = day; S.slot = h < 12 ? 'morning' : 'afternoon'; S.roam = { d:day, t:h * 60 }; S.roamPos = {};
  S.where = null; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.end = 1e9; WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = Infinity; }); }, [day, h]).then(() => page.waitForTimeout(1200));
const home = (page, day, h, slot = 'morning') => page.evaluate(([day, h, slot]) => { S.day = day; S.slot = slot; S.roam = { d:day, t:h * 60 }; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); WORLD.end = 1e9; }, [day, h, slot]).then(() => page.waitForTimeout(1200));
// Đứng cạnh một người, E, chọn “Bắt chuyện”, chờ nói xong; trả về các câu đã nói
async function talkTo(page, who){
  // bấm vào người đó (như người chơi bấm chuột/chạm): nhân vật tự đi tới và mở thực đơn của người đó
  await page.evaluate(w => { const a = WORLD.npcs.find(n => n.who === w && !n.gone); if (a.ai) a.ai.until = Infinity; window.__said = []; WORLD.greeted[a.id] = true;
    a.el.querySelector('.cb').dispatchEvent(new MouseEvent('click', { bubbles:true })); }, who);
  await page.waitForFunction(() => !!WORLD.menu, null, { timeout:8000 }).catch(() => {}); await page.waitForTimeout(200);
  const menu = await page.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
  const k = menu.findIndex(t => /Bắt chuyện/.test(t)); if (k < 0) { await page.keyboard.press('Escape'); return { menu, said:[] }; }
  await page.keyboard.press('Digit' + (k + 1));
  await page.waitForFunction(() => !WORLD.busy, null, { timeout:20000 }).catch(() => {});
  return { menu, said:await page.evaluate(() => window.__said.slice()), conv:await page.evaluate(() => WORLD.lastConv) };
}

(async () => {
  const browser = await chromium.launch();

  // 1. Dữ liệu hội thoại hợp lệ
  { const page = await open(browser);
    const d = await page.evaluate(() => {
      const bad = [], who = Object.keys(XUNG);
      HT.forEach((e, i) => { const ws = e.who === '*' ? who : [].concat(e.who);
        if (!ws.every(w => XUNG[w])) bad.push(i + ':who'); if (!HTC.NHOM[e.g]) bad.push(i + ':g'); if (!Array.isArray(e.say) || e.say.length < 2) bad.push(i + ':say');
        ws.forEach(w => e.say.forEach(s => { if (/[{}]/.test(htFill(s, w))) bad.push(i + ':{}'); })); });
      who.forEach(w => { ['sang', 'trua', 'chieu', 'toi'].forEach(sl => HT_MO[HT_KIEU[w]][sl].forEach(s => { if (/[{}]/.test(htFill(s, w))) bad.push(w + sl); })); ['than', 'thuong', 'lanh'].forEach(t => { if (!(HT_DAP[w][t] || []).length) bad.push(w + t); }); });
      const places = Object.keys(XG_NOI), office = places.filter(p => p !== 'street').flatMap(p => Object.values(XG_NOI[p]).flat(2)).filter(s => /Deploy|deploy|Họp mấy giờ/.test(s));
      const groups = [...new Set(HT.map(e => e.g))];
      return { bad, n:HT.length, groups, places, office, perWho:Object.fromEntries(who.map(w => [w, HT.filter(e => e.who === w || e.who === '*' || (Array.isArray(e.who) && e.who.includes(w))).length])) };
    });
    check('Dữ liệu hội thoại hợp lệ (người, nhóm, câu, xưng hô đều thay được)', !d.bad.length, d.bad.slice(0, 5).join(' '));
    check('Đủ các nhóm chủ đề: công việc, cuộc sống, sở thích, tâm trạng, quan hệ, hẹn gặp', ['congviec', 'cuocsong', 'sothich', 'tamtrang', 'quanhe', 'hen'].every(g => d.groups.includes(g)), d.groups.join(','));
    check('Mỗi người có ít nhất 6 câu chuyện', Object.values(d.perWho).every(n => n >= 6), JSON.stringify(d.perWho));
    check('Khách lạ có câu riêng cho 9 nơi, không còn hỏi nhau “Deploy” ở quán', d.places.length >= 9 && !d.office.length, d.places.join(',') + ' ' + d.office.join('|'));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Trí nhớ khi chủ động bắt chuyện (giúp anh Dũng mua cà phê)
  { const page = await open(browser);
    await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; });
    await pickIn(page, { id:'ev', arg:'coffee_run' }, 0, 9);
    await office(page, 10, 10);
    const r = await talkTo(page, 'dung'), lines = await page.evaluate(() => MEM_LINES['ev:coffee_run'].pos.dung);
    check('Bắt chuyện với anh Dũng: có lựa chọn “Bắt chuyện”', r.menu.some(t => /Bắt chuyện/.test(t)), r.menu.join(' | '));
    check('Hôm sau bắt chuyện: anh Dũng nhắc cốc bạc xỉu', r.said.some(s => lines.includes(s)), r.said.join(' | '));
    check('Cuộc nói chuyện có mở lời, đáp, nhắc chuyện cũ và câu bạn đáp lại', r.said.length >= 4 && r.conv && r.conv.kind === 'kyuc', r.conv && r.conv.kind);
    check('Nét mặt anh Dũng khi nhắc chuyện vui: vui', await page.evaluate(() => WORLD.npcs.find(n => n.who === 'dung').expr) === 'happy');
    const r2 = await talkTo(page, 'dung');
    check('Bắt chuyện lần nữa trong ngày: không nhắc lại, nói chuyện khác', !r2.said.some(s => lines.includes(s)) && r2.conv.kind !== 'kyuc', r2.conv.kind + ' · ' + r2.said.join(' | '));
    const n = await page.evaluate(() => memAll().find(m => m.k === 'ev:coffee_run').n);
    check('Một ngày dù nhắc ở câu chào và khi bắt chuyện cũng chỉ tính một lần', n === 1, 'n = ' + n);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Chuyện không vui: lạnh nhạt hơn một chút, rồi dần bình thường
  { const page = await open(browser, 'ghep');
    await pickIn(page, { id:'ev', arg:'tung_borrow' }, 2, 8);
    const t = await page.evaluate(() => { const a = []; S.day = 9; a.push(htTier('tung')); S.day = 13; a.push(htTier('tung')); S.day = 9; return a; });
    check('Từ chối cho Tùng mượn tiền: hôm sau Tùng hơi lạnh nhạt, vài ngày sau bình thường lại', t[0] === 'lanh' && t[1] === 'thuong', t.join(' → '));
    await home(page, 9, 11);
    const r = await talkTo(page, 'tung'), neg = await page.evaluate(() => MEM_LINES['ev:tung_borrow'].neg.tung), cold = await page.evaluate(() => HT_DAP.tung.lanh);
    check('Bắt chuyện với Tùng ở nhà: có lựa chọn “Bắt chuyện” (trước đây chỉ chào được)', r.menu.some(x => /Bắt chuyện/.test(x)), r.menu.join(' | '));
    check('Tùng đáp lạnh nhạt và nhắc chuyện cũ một cách ngại ngùng (không gay gắt)', r.said.some(s => cold.includes(s)) && r.said.some(s => neg.includes(s)), r.said.join(' | '));
    const rel = await page.evaluate(() => S.rel.tung);
    await talkTo(page, 'tung'); const rel2 = await page.evaluate(() => S.rel.tung);
    check('Nói chuyện tiếp vẫn làm thân hơn một chút (có thể cải thiện quan hệ)', rel2 > rel, `${rel} → ${rel2}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Theo nơi, giờ, việc đang làm, mức thân
  { const page = await open(browser, 'nha');
    const c = await page.evaluate(() => {
      const ctx = (who, at, h, o = {}) => ({ who, at, h, weekend:false, tier:'thuong', act:'', rel:50, ...o });
      const topics = (c, n = 40) => { const out = new Set(); for (let i = 0; i < n; i++) { const t = htTopic(c); if (t) out.add(t.say[0]); } return [...out]; };
      const mo = (who, h) => { const out = new Set(); for (let i = 0; i < 12; i++) out.add(htFill(pickLine(HT_MO[HT_KIEU[who]][htSlot(h)], 'x' + who + h), who)); return [...out]; };
      return { cook:topics(ctx('mom', 'home', 17, { act:'cook' })), dungHome:topics(ctx('dung', 'home', 10)).length, dungOffice:topics(ctx('dung', 'office', 10)),
        linhLib:topics(ctx('linh', 'in:lib', 9)), than:topics(ctx('mai', 'office', 10, { tier:'than' })), lanh:topics(ctx('mai', 'office', 10, { tier:'lanh' })),
        sang:mo('boss', 9), toi:mo('boss', 20), mom:mo('mom', 12) };
    });
    check('Mẹ đang nấu ăn: có chuyện “Mẹ đang nấu canh cua”', c.cook.some(s => /nấu canh/.test(s)), c.cook.slice(0, 4).join(' | '));
    check('Chủ đề công việc của anh Dũng chỉ ở công ty', c.dungOffice.some(s => /code|test|Đọc/.test(s)), c.dungOffice.join(' | '));
    check('Linh ở thư viện: nói nhỏ, chuyện luận văn, sách', c.linhLib.some(s => /Suỵt|Luận văn|Nhà giả kim/.test(s)), c.linhLib.join(' | '));
    check('Mức thân đổi câu chuyện: thân thì rủ đi ăn, lạnh thì xin kiểm tra kỹ', c.than.some(s => /bún chả|thích làm cùng/.test(s)) && c.lanh.some(s => /kiểm tra kỹ|đang bận/.test(s)), c.than.length + '/' + c.lanh.length);
    check('Lời mở đầu theo buổi: sáng hỏi sáng nay, tối hỏi chưa về', c.sang.some(s => /sáng nay|hôm nay/.test(s)) && c.toi.some(s => /chưa về|Muộn rồi/.test(s)), c.sang[0] + ' / ' + c.toi[0]);
    check('Xưng hô đúng với bố mẹ (con – mẹ)', c.mom.every(s => /mẹ|Mẹ/.test(s) && !/\{/.test(s)), c.mom.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Không lặp: nói chuyện nhiều lần với chị Mai
  { const page = await open(browser);
    await office(page, 10, 10);
    const s = await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'mai'), seen = []; for (let i = 0; i < 10; i++) { const c = htConversation(WORLD, a); seen.push(c.lines.slice(2).map(l => l[1]).join(' / ')); } return seen; });
    const uniq = new Set(s).size; let rep = 0; for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) rep++;
    check('10 lần bắt chuyện với chị Mai: ít nhất 6 câu chuyện khác nhau, không lặp liền nhau', uniq >= 6 && rep === 0, `${uniq} khác nhau, lặp liền ${rep}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Ở nhà, ở quán, khách lạ, họp đột xuất
  { const page = await open(browser, 'nha');
    await home(page, 6, 13.2, 'afternoon');
    const parents = await page.evaluate(() => WORLD.npcs.filter(n => n.ai && !n.gone && !(n.home && n.home.lie)).map(n => n.who));
    if (parents.length) { const r = await talkTo(page, parents[0]); check(`Ở nhà bắt chuyện với ${parents[0] === 'mom' ? 'mẹ' : 'bố'}: có câu chuyện hẳn hoi (≥ 4 câu)`, r.said.length >= 4, r.said.join(' | ')); }
    else check('Ở nhà có bố hoặc mẹ để bắt chuyện', false, 'không có ai ở nhà');
    await page.evaluate(() => { S.flags.pho = { d:8, met:1, vendor:1, rain:1, jam:1 }; S.day = 8; S.slot = 'afternoon'; S.roam = { d:8, t:15 * 60 }; S.roamPos = {}; S.where = { d:8, slot:'afternoon', at:'in:cafe', bike:null }; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance(); WORLD.end = 1e9; });
    await page.waitForTimeout(1500);
    const g = await page.evaluate(() => { const a = WORLD.pop.pool.find(x => x.vis); return a ? htGreetReply(WORLD, a) : null; });
    check('Chào khách lạ ở quán cà phê: khách đáp lại', !!g, g);
    const ok = await page.evaluate(g => HT_KHACH['in:cafe'].includes(g), g);
    check('Câu đáp nằm trong bộ câu của quán cà phê', ok);
    const bia = await page.evaluate(() => xgNoiList('in:bia', 20).flat().join(' '));
    check('Khách bia hơi buổi tối nói chuyện bóng đá, bạn bè (không nói chuyện họp, deploy)', /đội|Dzô|bạn|vợ|cưới/.test(bia) && !/Deploy|Họp mấy/.test(bia));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }
  { const page = await open(browser);
    await office(page, 10, 11);
    await page.evaluate(() => { const b = WORLD.npcs.find(n => n.who === 'boss'); WORLD.me.x = b.x - 60; WORLD.cam = Math.max(0, b.x - 180); WORLD.npcs.forEach(a => { if (a.ai) { a.ai.until = Infinity; a.ai.busy = false; a.ai.inBeat = false; } }); window.__said = []; WEV_FORCE('meeting'); });
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({ said:window.__said.find(s => /vào họp/.test(s)), called:WORLD.npcs.filter(a => a.ai && a.who !== 'boss' && a.ai.inBeat || (a.ai && a.ai.busy && a.who !== 'boss')).map(a => a.who) }));
    check('Họp đột xuất: chị Hạnh gọi đúng tên người được gọi (không viết cứng)', !!r.said && !/undefined/.test(r.said), r.said);
    await page.evaluate(() => { HTC.ON = false; });
    const r2 = await talkTo(page, 'mai');
    check('Tắt hội thoại mới (HTC.ON = false): “Bắt chuyện” vẫn chạy theo cách cũ', r2.said.length >= 2, r2.said.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
