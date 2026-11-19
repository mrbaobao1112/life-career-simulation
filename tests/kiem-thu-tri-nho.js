// Kiểm thử thế giới sống – Phase 4: NPC nhớ chuyện cũ và nhắc lại, nét mặt theo tình huống, hiệu năng sắp xếp lớp.
// Cần Playwright. Chạy: npm run tri-nho
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('Bỏ qua: máy này chưa có Playwright (npm i -D playwright).'); process.exit(0); }
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
  await page.evaluate(() => { S.once.roamTut = true; WEV.ON = false; S.money = 5e6; window.__said = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  return page;
}
// Chạy một cảnh rồi chọn lựa chọn thứ i
const pickIn = (page, ref, i, day = 5) => page.evaluate(([ref, i, day]) => { S.day = day; S.slot = 'evening'; S.queue = [ref]; S.cur = null; advance(); const t = current.title; choose(i); return t; }, [ref, i, day]).then(t => page.waitForTimeout(300).then(() => t));
const home = (page, day, slot = 'morning') => page.evaluate(([day, slot]) => { S.day = day; S.slot = slot; S.roam = null; S.roamPos = {}; S.where = null; S.queue = [{ id:'activity', arg:slot }]; S.cur = null; advance(); }, [day, slot]).then(() => page.waitForTimeout(500));
const mem = page => page.evaluate(() => MEM_DEBUG());

(async () => {
  const browser = await chromium.launch();

  // 1. Ghi nhớ: chỉ chuyện đáng nhớ, đúng người, đúng tốt/xấu
  { const page = await open(browser);
    await pickIn(page, { id:'ev', arg:'tung_borrow' }, 0);
    const m1 = await mem(page);
    check('Cho Tùng mượn 300 nghìn: Tùng nhớ chuyện tốt', m1.some(x => x.startsWith('tung>me:ev:tung_borrow+')), m1.join(' '));
    await page.evaluate(() => { S.npcMem = []; }); await pickIn(page, { id:'ev', arg:'tung_borrow' }, 1);
    check('Cho mượn 100 nghìn (quan hệ đổi ít): không ghi gì', (await mem(page)).length === 0, (await mem(page)).join(' '));
    await pickIn(page, { id:'ev', arg:'tung_borrow' }, 2);
    const m2 = await mem(page);
    check('Từ chối khéo: Tùng nhớ chuyện không vui', m2.some(x => x.startsWith('tung>me:ev:tung_borrow-')), m2.join(' '));
    await page.evaluate(() => { S.npcMem = []; }); await pickIn(page, { id:'ev', arg:'tung_drink' }, 0);
    check('Đi nhậu với Tùng: Tùng nhớ', (await mem(page)).some(x => x.startsWith('tung>me:ev:tung_drink+')));
    await page.evaluate(() => { S.npcMem = []; S.rel.linh = 60; }); await pickIn(page, { id:'hangout', arg:'linh' }, 0);
    check('Đi cà phê với Linh: Linh nhớ', (await mem(page)).some(x => x.startsWith('linh>me:hangout+')), (await mem(page)).join(' '));
    await page.evaluate(() => { S.npcMem = []; S.job = { co:'hotay', salary:1e7, start:3 }; }); await pickIn(page, { id:'ev', arg:'birthday' }, 2);
    const m3 = await mem(page);
    check('Giả vờ quên sinh nhật chị Mai: chị Mai nhớ (không vui)', m3.some(x => x.startsWith('mai>me:ev:birthday-')), m3.join(' '));
    // giới hạn và tự quên
    const cap = await page.evaluate(() => { S.npcMem = []; const keys = Object.keys(MEM_LINES);
      for (let d = 1; d <= 30; d++) { S.day = d; ['tung', 'linh', 'mai', 'dung', 'boss', 'phong', 'mom'].forEach((w, i) => memAdd({ w, o:'me', k:keys[(d + i) % keys.length], v:1 })); }
      const L = memAll(), per = Math.max(...['tung', 'linh', 'mai', 'dung', 'boss', 'phong', 'mom'].map(w => L.filter(x => x.w === w).length)), n = L.length, size = JSON.stringify(L).length;
      S.day = 60; memForget(); return { n, per, size, after:memAll().length }; });
    check('Nhớ có giới hạn: tổng ≤ 24, mỗi người ≤ 4, bản lưu thêm dưới 1.500 ký tự', cap.n <= 24 && cap.per <= 4 && cap.size < 1500, JSON.stringify(cap));
    check('Sau 14 ngày thì quên', cap.after === 0);
    // lưu và tải lại, bản lưu cũ
    await page.evaluate(() => { S.day = 8; S.npcMem = []; memAdd({ w:'linh', o:'me', k:'hangout', v:1 }); save(); });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem(SAVE_KEY)).npcMem);
    check('Trí nhớ được lưu cùng bản lưu', saved && saved.length === 1 && saved[0].w === 'linh');
    await page.evaluate(() => { const o = JSON.parse(localStorage.getItem(SAVE_KEY)); delete o.npcMem; localStorage.setItem(SAVE_KEY, JSON.stringify(o)); location.reload(); }); await page.waitForTimeout(900);
    await page.click('#resume'); await page.waitForTimeout(400);
    const old = await page.evaluate(() => { try { return [memRecall('linh'), memAll().length]; } catch (e) { return 'lỗi: ' + e.message; } });
    check('Bản lưu cũ (chưa có trí nhớ) vẫn chạy, không nhắc chuyện gì', Array.isArray(old) && old[0] === null && old[1] === 0, JSON.stringify(old));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 2. Nhắc lại chuyện cũ khi gặp ngoài đời (từ hôm sau, mỗi ngày một lần, nét mặt theo chuyện)
  { const page = await open(browser);
    await pickIn(page, { id:'ev', arg:'tung_borrow' }, 0, 8);
    const same = await page.evaluate(() => memRecall('tung'));
    check('Ngay hôm đó chưa nhắc lại (để hôm sau)', same === null);
    await home(page, 9, 'morning');
    await page.evaluate(() => { WORLD.t = 10.8 * 60; const a = WORLD.npcs.find(n => n.who === 'tung'); a.ai.until = Infinity; WORLD.me.x = a.x - 18; WORLD.me.y = a.y + 6; });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'tung'); return { said:window.__said.slice(-3), expr:a.expr }; });
    const lines = await page.evaluate(() => MEM_LINES['ev:tung_borrow'].pos.tung);
    check('Hôm sau gặp Tùng ở nhà: Tùng nhắc khoản tiền hôm trước', r.said.some(s => lines.includes(s)), r.said.join(' | '));
    check('Nét mặt Tùng vui khi nhắc chuyện tốt', r.expr === 'happy', r.expr);
    await home(page, 9, 'morning'); await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'tung'); WORLD.me.x = a.x - 18; WORLD.me.y = a.y + 6; window.__said = []; }); await page.waitForTimeout(800);
    const again = await page.evaluate(() => window.__said);
    check('Trong ngày chỉ nhắc một lần (vào lại cảnh thì chào bình thường)', !again.some(s => lines.includes(s)), again.join(' | '));
    const later = await page.evaluate(() => { S.day = 10; const a = memRecall('tung'); S.day = 11; const b = memRecall('tung'); return [!!a, b]; });
    check('Mỗi chuyện nhắc tối đa 2 lần rồi thôi', later[0] && later[1] === null, JSON.stringify(later));
    await page.evaluate(() => { S.npcMem = []; }); await pickIn(page, { id:'ev', arg:'tung_borrow' }, 2, 12);
    const neg = await page.evaluate(() => { S.day = 13; const r = memRecall('tung'); return r && { ...r, ok:MEM_LINES['ev:tung_borrow'].neg.tung.includes(r.text), m:undefined }; });
    check('Từ chối cho vay: hôm sau Tùng buồn, câu ngại ngùng', neg && neg.expr === 'sad' && neg.ok, JSON.stringify(neg));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 3. Đồng nghiệp: nghỉ mấy hôm thì hỏi thăm; chuyện giữa các NPC
  { const page = await open(browser, 'tro');
    const lv = await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; S.leaves = [{ id:'t', type:'annual', from:15, to:17, paid:true, status:'approved' }]; S.day = 18;
      const a = memRecall('boss'), b = memRecall('boss'), c = memRecall('mai'); S.day = 19; const d = memRecall('mai'); S.leaves = []; S.day = 26; const e = memRecall('mai'); return [a && MEM_LEAVE.boss.includes(a.text) && a.text, b, c && c.text, d, e]; });
    check('Đi làm lại sau 3 ngày nghỉ: chị Hạnh hỏi thăm', !!lv[0], lv[0]);
    check('Hỏi thăm một lần thôi (không hỏi lại trong tuần)', lv[1] === null && !!lv[2] && lv[3] === null, JSON.stringify(lv));
    check('Không nghỉ thì không hỏi', lv[4] === null);
    const nn = await page.evaluate(() => { S.npcMem = []; S.day = 9; memAdd({ w:'dung', o:'mai', k:'argue', v:-1 }); const a = memNpcLine('mai', 'dung'); S.day = 10; const b = memNpcLine('mai', 'dung'), c = memNpcLine('mai', 'dung'); return [a, b && MEM_NPC.argue.some(l => l[0] === b.lines[0]) && b.lines, c]; });
    check('Tranh luận hôm qua: hôm nay hai người gặp lại thì nhắc chuyện và làm lành', nn[0] === null && !!nn[1] && nn[2] === null, JSON.stringify(nn));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 4. Nét mặt theo tình huống
  { const page = await open(browser);
    const f = await page.evaluate(() => { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = actorSVG('linh', 'neutral'); const a = { who:'linh', el:g.firstChild, expr:'neutral' };
      const before = a.el.querySelector('.cb-face').innerHTML; npcFace(a, 'annoyed'); const after = a.el.querySelector('.cb-face').innerHTML;
      return { changed:before !== after, expr:a.expr, extra:!!a.el.querySelector('.cb-extra').innerHTML }; });
    check('Đổi nét mặt ngay trên nhân vật (dùng hình mặt chibi có sẵn, có dấu hiệu đi kèm)', f.changed && f.expr === 'annoyed' && f.extra, JSON.stringify(f));
    await home(page, 9, 'morning'); await page.evaluate(() => { WORLD.t = 2 * 60; WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(1500);
    const sleep = await page.evaluate(() => WORLD.npcs.find(n => n.who === 'tung').expr);
    check('2 giờ sáng: Tùng ngủ, mắt nhắm', sleep === 'tired', sleep);
    await page.evaluate(() => { WORLD.t = 11 * 60; WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(2500);
    const game = await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'tung'); return [a.ai.act, a.expr]; });
    check('11 giờ: Tùng chơi game, mặt vui', game[0] === 'game' && game[1] === 'happy', game.join(' / '));
    await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'afternoon'; S.roam = { d:9, t:17.3 * 60 }; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.t = 17.3 * 60; WORLD.end = 1e9;
      WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(2500);
    const tired = await page.evaluate(() => WORLD.npcs.filter(a => a.ai && !a.gone && a.ai.act === 'desk' && !a.feelT).map(a => a.who + ':' + a.expr));
    check('Chiều muộn ở công ty: ai còn ngồi bàn thì mặt mệt', tired.length > 0 && tired.every(s => s.endsWith(':tired')), tired.join(' '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 5. Hiệu năng: đứng yên thì không sắp xếp lại lớp nhân vật; số nhân vật không tăng
  { const page = await open(browser, 'tro');
    await page.evaluate(() => { S.flags.pho = { d:8, met:1, vendor:1, rain:1, jam:1 }; S.day = 8; S.slot = 'afternoon'; S.roam = { d:8, t:15 * 60 }; S.where = { d:8, slot:'afternoon', at:'in:cafe', bike:null }; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance();
      WORLD.pop.pool.forEach(a => { if (a.vis) a.vis.until = Infinity; }); DS.SPAWN = 0; }); await page.waitForTimeout(3500);
    const n = await page.evaluate(() => new Promise(res => { const L = document.querySelector('#world .L-world'); let k = 0; const mo = new MutationObserver(ms => { k += ms.length; }); mo.observe(L, { childList:true });
      setTimeout(() => { mo.disconnect(); res([k, WORLD.npcs.length]); }, 2500); }));
    check('Quán cà phê, không ai di chuyển: lớp nhân vật không bị xếp lại (0 lần đụng DOM)', n[0] === 0, n[0] + ' lần');
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Giảm chuyển động, điện thoại
  { const page = await open(browser, 'ghep', { ...devices['iPhone 13'], reducedMotion:'reduce' });
    await pickIn(page, { id:'ev', arg:'tung_borrow' }, 0, 8); await home(page, 9, 'morning');
    await page.evaluate(() => { WORLD.t = 11 * 60; WORLD.npcs.forEach(a => { if (a.ai) a.ai.until = 0; }); }); await page.waitForTimeout(1200);
    await page.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'tung'); a.ai.until = Infinity; WORLD.me.x = a.x - 18; WORLD.me.y = a.y + 6; }); await page.waitForTimeout(800);
    const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth, memAll()[0].n]);
    check('Điện thoại, giảm chuyển động: vẫn nhắc chuyện cũ, không tràn ngang', w[0] <= w[1] && w[2] === 1, w.join(' / '));
    check('Không lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
