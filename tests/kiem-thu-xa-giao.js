// Kiểm thử thế giới sống – Phase 2: quan hệ và giao tiếp giữa các NPC. Cần Playwright.
// Chạy: npm run xa-giao
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Bài này CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, bg = 'tro'){
  const ctx = await browser.newContext({ viewport:{ width:520, height:900 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = []; page.says = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  // ghi lại mọi câu nói hiện trên sân khấu
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; window.__said = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  return page;
}
const office = (page, h = 10) => page.evaluate(h => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = h < 12 ? 'morning' : 'afternoon'; S.roam = { d:9, t:h * 60 }; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.t = h * 60; WORLD.end = 1e9;
  WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = Infinity; }); }, h).then(() => page.waitForTimeout(600));
// Đặt người chơi gần một NPC để thấy hội thoại (câu chỉ hiện khi trong khung nhìn)
const watch = (page, who) => page.evaluate(who => { const a = WORLD.npcs.find(n => n.who === who); WORLD.me.x = a.x - 60; WORLD.me.y = 200; }, who).then(() => page.waitForTimeout(500));
const said = page => page.evaluate(() => window.__said.splice(0));

(async () => {
  const browser = await chromium.launch();

  // 1. Quan hệ NPC–NPC: mặc định, đối xứng, giới hạn mỗi ngày, lưu và tải lại, bản lưu cũ
  { const page = await open(browser);
    const r = await page.evaluate(() => { S.day = 9; delete S.npcRel; const a = npcRel('dung', 'phong').c, b = npcRel('phong', 'dung').c, fam = npcRel('mom', 'dad').c;
      for (let i = 0; i < 6; i++) npcBond('mai', 'phong', 1); const cap = npcRel('mai', 'phong').c - 60;
      S.day = 10; npcBond('mai', 'phong', 1); const next = npcRel('mai', 'phong').c - 60; save(); return { a, b, fam, cap, next, json:JSON.parse(localStorage.getItem(SAVE_KEY)).npcRel['mai|phong'] }; });
    check('Quan hệ ban đầu hợp lý và đối xứng (Phong–anh Dũng 55, bố–mẹ 82)', r.a === 55 && r.b === 55 && r.fam === 82, JSON.stringify(r));
    check('Độ thân mỗi ngày thay đổi tối đa 2, sang ngày mới mới tăng tiếp', r.cap === 2 && r.next === 3, `${r.cap} rồi ${r.next}`);
    check('Quan hệ NPC–NPC được lưu vào bản lưu (gọn)', r.json && r.json.c === 63 && JSON.stringify(r.json).length < 80, JSON.stringify(r.json));
    await page.evaluate(() => { const o = JSON.parse(localStorage.getItem(SAVE_KEY)); delete o.npcRel; localStorage.setItem(SAVE_KEY, JSON.stringify(o)); location.reload(); }); await page.waitForTimeout(900);
    await page.click('#resume'); await page.waitForTimeout(400);
    check('Bản lưu cũ (chưa có quan hệ NPC) vẫn mở được, tự tạo mặc định', await page.evaluate(() => npcRel('dung', 'phong').c === 55) && !page.errs.length, page.errs[0] || '');
    await page.context().close(); }

  // 2. Sang bàn nói chuyện: hai bên quay vào nhau, có câu qua lại, độ thân tăng
  { const page = await open(browser); await office(page); await watch(page, 'mai');
    await page.evaluate(() => { npcRel('mai', 'boss').c = 70; }); const c0 = await page.evaluate(() => npcRel('mai', 'boss').c); await said(page);   // thân hẳn: không bị từ chối ngẫu nhiên
    await page.evaluate(() => SONG_FORCE('mai', 'visit', 'boss')); await page.waitForTimeout(6500);
    const s = await said(page), c1 = await page.evaluate(() => npcRel('mai', 'boss').c);
    check('Chị Mai sang bàn chị Hạnh: có ít nhất 2 câu qua lại', s.length >= 2, s.join(' | '));
    check('Nói chuyện xong: độ thân tăng', c1 === c0 + 1, `${c0} → ${c1}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Phong hỏi anh Dũng nhiều lần trong ngày: lần thứ 3 anh Dũng mệt, câu ngắn lại, độ thân giảm
  { const page = await open(browser); await office(page); await watch(page, 'dung');
    const c0 = await page.evaluate(() => npcRel('dung', 'phong').c); const tones = [];
    for (let i = 0; i < 3; i++) { await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'phong'); a.ai.inBeat = false; a.ai.busy = false; const d = WORLD.npcs.find(n => n.who === 'dung'); d.ai.inBeat = false; d.ai.busy = false;
      const r = songRng; window.__keep = songRng; }); await page.evaluate(() => SONG_FORCE('phong', 'visit', 'dung')); await page.waitForTimeout(6500);
      tones.push(await page.evaluate(() => WORLD.npcs.find(n => n.who === 'phong').ai.askTone || 'từ chối')); await page.evaluate(() => { WORLD.t += 7; }); }
    const c1 = await page.evaluate(() => npcRel('dung', 'phong').c), s = await said(page);
    check('Hai lần đầu anh Dũng chỉ cho tận tình; lần thứ ba mệt', tones[0] === 'ok' && tones[1] === 'ok' && tones[2] === 'tired', tones.join(', '));
    check('Độ thân sau ngày hỏi nhiều: tăng ít rồi giảm lại (không tăng mãi)', c1 <= c0 + 1, `${c0} → ${c1}`);
    check('Câu của anh Dũng lần thứ ba khác hẳn (mệt, ngắn)', s.some(t => /Lần thứ mấy|Tự đọc log|Hỏi đi\. Nhanh/.test(t)), s.slice(-3).join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Người đang bận thì từ chối khéo
  { const page = await open(browser); await office(page); await watch(page, 'dung');
    await page.evaluate(() => { const d = WORLD.npcs.find(n => n.who === 'dung'); d.ai.inBeat = true; d.ai.beatEnd = 1e9; }); await said(page);
    await page.evaluate(() => SONG_FORCE('mai', 'visit', 'dung')); await page.waitForTimeout(4000);
    const s = await said(page), sign = await page.evaluate(() => { const g = WORLD.npcs.find(n => n.who === 'dung').el.querySelector('.npc-sign text'); return g && g.textContent; });
    check('Anh Dũng đang bận: từ chối khéo (🙅), chị Mai quay về', s.some(t => /Để sau|đang tập trung/.test(t)) && sign === '🙅', `${s.join(' | ')} ${sign}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Câu nói không lặp liên tục
  { const page = await open(browser);
    const r = await page.evaluate(() => { const out = []; for (let i = 0; i < 9; i++) out.push(pickLine(XG.chat.than, 't')[0]); let rep = 0; for (let i = 1; i < out.length; i++) if (out[i] === out[i - 1]) rep++; return { rep, kinds:new Set(out).size }; });
    check('Chọn câu: không lặp câu vừa nói, đổi đều nhiều câu', r.rep === 0 && r.kinds >= 4, JSON.stringify(r));
    await page.context().close(); }

  // 6. Đi ngang qua nhau thì chào, không chào lại liền
  { const page = await open(browser); await office(page); await watch(page, 'mai');
    await said(page);
    await page.evaluate(() => { const m = WORLD.npcs.find(n => n.who === 'mai'), p = WORLD.npcs.find(n => n.who === 'phong'); p.lock = true; m.lock = true; p.tx = m.x; p.x = m.x + 20; p.y = m.y; });
    await page.waitForTimeout(1600); const s1 = await said(page); await page.waitForTimeout(2000); const s2 = await said(page);
    check('Phong đi ngang chị Mai: hai người chào nhau', s1.length >= 1, s1.join(' | '));
    check('Vừa chào xong thì không chào lại liên tục', s2.length === 0, s2.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 7. Ở nhà bố mẹ: bố mẹ ngồi nói chuyện với nhau
  { const page = await open(browser, 'nha');
    await page.evaluate(() => { S.day = 6; S.slot = 'evening'; S.roam = { d:6, t:20 * 60 }; S.queue = [{ id:'activity', arg:'evening' }]; S.cur = null; advance(); WORLD.t = 20 * 60; WORLD.end = 1e9; });
    await page.waitForTimeout(8000);
    const ok = await page.evaluate(() => { const m = WORLD.npcs.find(n => n.who === 'mom'), d = WORLD.npcs.find(n => n.who === 'dad'); return !m.gone && !d.gone; });
    if (ok) { await watch(page, 'dad'); await said(page); await page.evaluate(() => SONG_FORCE('mom', 'chat')); await page.waitForTimeout(5000); }
    const s = ok ? await said(page) : [];
    check('Bố mẹ cùng ở nhà thì ngồi nói chuyện với nhau (câu chuyện gia đình)', ok && s.length >= 2, s.join(' | '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 8. Hết giờ làm: người thân nhau rủ nhau cùng về
  { const page = await open(browser); await office(page, 17.2);
    await page.evaluate(() => { npcRel('mai', 'phong').c = 80; });   // mọi người đang ngồi làm việc ở bàn
    await watch(page, 'mai'); await said(page);
    await page.evaluate(() => { WORLD.t = 17.45 * 60; }); await page.waitForTimeout(16000);
    const r = await page.evaluate(() => ({ phong:WORLD.npcs.find(n => n.who === 'phong').gone, mai:WORLD.npcs.find(n => n.who === 'mai').gone, force:WORLD.npcs.find(n => n.who === 'phong').ai.forceOut || WORLD.npcs.find(n => n.who === 'mai').ai.forceOut }));
    const s = await said(page);
    check('17:30: chị Mai và Phong (thân nhau) rủ nhau về cùng', r.phong && r.mai && r.force && s.some(t => /Về chưa|Đi cùng|mệt nhỉ/.test(t)), `${JSON.stringify(r)} ${s.join(' | ')}`);
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 9. Sự kiện nhỏ: chị Mai mang bánh, người thân ra ăn, người tập trung cao có thể từ chối
  { const page = await open(browser); await office(page, 15);
    await page.evaluate(() => { songRng = (k => { const f = songRng; return key => key === 'snack' ? () => 0 : f(key); })(); WORLD.npcs.forEach(a => { if (a.ai) { a.ai.until = Infinity; a.ai.inBeat = false; } }); });
    await page.waitForTimeout(9000);
    const r = await page.evaluate(() => ({ day:S.flags.snackDay === S.day, mai:WORLD.npcs.find(n => n.who === 'mai').el.querySelector('.npc-sign text')?.textContent,
      eat:WORLD.npcs.filter(n => n.ai && n.who !== 'mai' && Math.abs(n.x - WORLD.H.pantry.x) < 90).length }));
    check('15:00: chị Mai mang bánh ra pantry (🍰), có người ra ăn cùng', r.day && r.mai === '🍰' && r.eat >= 1, JSON.stringify(r));
    check('Mỗi ngày chỉ một lần', await page.evaluate(() => { songSnackTick(WORLD, WORLD.api); return S.flags.snackDay === S.day; }));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
