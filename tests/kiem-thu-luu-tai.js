// Kiểm thử v17.6: LƯU / TẢI GAME và tương thích bản lưu cũ.
// 1. Bản lưu thật của các phiên bản 16.1 → 17.5 (tests/du-lieu-mau/, tạo bằng tao-ban-luu.js): mở bằng bản hiện tại, chơi tiếp đến hết 56 ngày.
// 2. Bản lưu thiếu các phần mới (trí nhớ NPC, quan hệ NPC, chuyện tự nảy sinh, điện thoại…): tự tạo lại, chơi tiếp được.
// 3. Lưu rồi tải lại ngay (cùng phiên bản): mọi dữ liệu giữ nguyên.
// 4. (Cần Playwright) Bản lưu lúc đang đi ngoài phố: mở lại đúng chỗ, đúng giờ, đi tiếp được. Đang có chuyện, tin nhắn chờ trả lời: tải lại vẫn còn.
// Chạy: npm run luu-tai
const path = require('path'), fs = require('fs');
const { JSDOM } = require('jsdom');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
const html = require('./nap-game')();
const MAU = path.join(__dirname, 'du-lieu-mau'), mau = fs.readdirSync(MAU).filter(f => /^ban-luu-.*\.json$/.test(f)).map(f => ({ f, ...JSON.parse(fs.readFileSync(path.join(MAU, f), 'utf8')) }));

function mo(save, seed = 5){
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; if (save) w.localStorage.setItem(save.key, save.value); } });
  const w = dom.window, errs = []; w.addEventListener('error', e => errs.push(e.message)); return { w, d:w.document, errs, rnd };
}
// Bấm như người chơi (chọn ngẫu nhiên có hạt giống) đến ngày `den` hoặc hết game
function choi(g, den){
  const { w, d } = g; let n = 0;
  while (n++ < 9000) {
    const S = w.eval('S'); if (S && S.day >= den) break;
    if (d.querySelector('#again')) break;
    const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
    if (!ch.length) { g.errs.push('kẹt ở: ' + d.querySelector('#stage').textContent.slice(0, 100)); break; }
    ch[Math.floor(g.rnd() * ch.length)].click();
  }
}
const loiHien = d => { const h = d.querySelector('#app').innerHTML + d.querySelector('#dlg').innerHTML; const m = h.match(/.{30}(NaN|undefined).{20}/); return m ? m[0] : ''; };

// 1. Bản lưu thật của các phiên bản cũ
for (const m of mau.filter(x => x.kieu === 'nut-bam')) {
  const g = mo(m), S0 = JSON.parse(m.value);
  const res = g.d.querySelector('#resume'); if (res) res.click();
  const a = g.w.eval('JSON.stringify({ day:S.day, money:S.money, job:S.job && S.job.co, rel:S.rel })');
  const same = a === JSON.stringify({ day:S0.day, money:S0.money, job:S0.job && S0.job.co, rel:S0.rel });
  choi(g, 999);
  const end = g.w.eval('JSON.stringify({ day:S.day, money:S.money, ok:Number.isFinite(S.money) && Number.isFinite(S.energy) && Number.isFinite(S.health) && Number.isFinite(S.mood), mem:Array.isArray(S.npcMem), cc:!!S.cc, phone:!!S.phone })');
  const e = JSON.parse(end), bad = loiHien(g.d);
  check(`Bản lưu ${m.ver} ngày ${m.day}: mở đúng ngày, tiền, việc, quan hệ; chơi tiếp đến hết 56 ngày không lỗi`, !!res && same && e.day === 56 && !!g.d.querySelector('#again') && e.ok && !g.errs.length && !bad,
    `${res ? '' : 'không có nút Chơi tiếp; '}${same ? '' : 'mở sai dữ liệu; '}kết thúc ngày ${e.day}${g.errs.length ? '; lỗi: ' + g.errs[0] : ''}${bad ? '; hiện: ' + bad : ''}`);
  g.w.close();
}

// 2. Bản lưu thiếu các phần mới (như bản lưu rất cũ, hoặc bị xóa bớt): tự tạo lại, không lỗi
{ const m = mau.find(x => x.ver === '17.5' && x.day === 30), S = JSON.parse(m.value);
  for (const k of ['npcMem', 'npcRel', 'cc', 'phone', 'meet', 'roam', 'roamPos', 'where', 'evLast', 'hang']) delete S[k];
  for (const k of ['msgDay', 'wev', 'chatBond', 'gdHoi', 'ccLinhGap', 'memLeave']) delete S.flags[k];
  const g = mo({ key:m.key, value:JSON.stringify(S) }); const res = g.d.querySelector('#resume'); if (res) res.click();
  choi(g, 999); const e = JSON.parse(g.w.eval('JSON.stringify({ day:S.day, mem:Array.isArray(S.npcMem), phone:!!S.phone })'));
  check('Bản lưu thiếu trí nhớ NPC, quan hệ NPC, chuyện, điện thoại, cờ mới: tự tạo lại, chơi đến hết không lỗi', !!res && e.day === 56 && e.phone && !g.errs.length && !loiHien(g.d), JSON.stringify(e) + (g.errs[0] || ''));
  g.w.close(); }

// 3. Lưu rồi tải lại (cùng phiên bản): giữ nguyên mọi thứ, kể cả trí nhớ, quan hệ NPC, chuyện đang diễn ra, tin nhắn chờ trả lời
{ const g = mo(null, 9); g.d.querySelector('#fresh').click(); g.d.querySelectorAll('.bgopt[data-f]')[1].click(); g.d.querySelectorAll('.bgopt[data-b]')[2].click(); g.d.querySelector('#go').click();
  choi(g, 18);
  g.w.eval(`memAdd({ w:'linh', o:'me', k:'hangout', v:1 }); npcBond('dung', 'mai', -2); ccAll().on.linh = { b:'hen', d:S.day + 2, ly:'hangout' };
    pushMsg('tung', 'tung', 'Ê, mai đá bóng không?'); addUnread('tung', 1); ph().pending.tung = { id:'tung_football', deadline:(S.tick || 0) + 2 }; save();`);
  const a = g.w.eval('JSON.stringify(S)'), key = g.w.eval('SAVE_KEY'), v = g.w.localStorage.getItem(key); g.w.close();
  const h = mo({ key, value:v }); const res = h.d.querySelector('#resume'); if (res) res.click();
  const S1 = JSON.parse(h.w.eval('JSON.stringify(S)')), S0 = JSON.parse(a);
  const keys = Object.keys(S0).filter(k => JSON.stringify(S0[k]) !== JSON.stringify(S1[k]) && !['cur', 'queue', 'flags'].includes(k));   // cảnh đang mở được dựng lại khi tải; cờ so riêng bên dưới
  const flagDiff = Object.keys({ ...S0.flags, ...S1.flags }).filter(k => k !== 'ring' && JSON.stringify(S0.flags[k]) !== JSON.stringify(S1.flags[k]));   // ring: chuông báo tin, đã kêu khi mở game thì tắt (đúng)
  check('Lưu rồi tải lại: mọi dữ liệu giữ nguyên (tiền, chỉ số, trí nhớ NPC, quan hệ NPC, chuyện đang diễn ra, tin nhắn chờ trả lời)', !!res && !keys.length && !flagDiff.length && S1.cc.on.linh && S1.phone.pending.tung && S1.npcMem.some(x => x.k === 'hangout'), keys.join(', ') + ' ' + flagDiff.map(k => k + ':' + JSON.stringify(S0.flags[k]) + '→' + JSON.stringify(S1.flags[k])).join(' '));
  choi(h, 999); check('Sau khi tải lại, chơi tiếp đến hết không lỗi', h.w.eval('S.day') === 56 && !h.errs.length && !loiHien(h.d), h.errs[0] || '');
  h.w.close(); }

// 4. Trong trình duyệt thật: bản lưu lúc đang đi ngoài phố
(async () => {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Phần 4 CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
  const URL = 'file://' + path.join(__dirname, '..', 'index.html');
  const b = await chromium.launch();
  for (const m of mau.filter(x => x.kieu === 'dang-di')) {
    const ctx = await b.newContext({ viewport:{ width:520, height:900 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem('daNap')) { localStorage.setItem(k, v); sessionStorage.setItem('daNap', '1'); } }, [m.key, m.value]);
    const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL); await page.click('#resume'); await page.waitForTimeout(1200);
    const r0 = await page.evaluate(() => ({ world:typeof WORLD !== 'undefined' && !!WORLD && !!document.querySelector('#world'), x:WORLD && Math.round(WORLD.me.x), t:WORLD && Math.round(WORLD.t), npcs:WORLD ? WORLD.npcs.filter(a => !a.gone).length : 0 }));
    await page.keyboard.down('d'); await page.waitForTimeout(1200); await page.keyboard.up('d');
    const x1 = await page.evaluate(() => WORLD && Math.round(WORLD.me.x));
    check(`Bản lưu ${m.ver} lúc đang đi ngoài phố: mở lại đúng chỗ, đúng giờ, có người qua lại, đi tiếp được, không lỗi`, r0.world && Math.abs(r0.x - 251) < 30 && Math.abs(r0.t - 911) < 15 && r0.npcs > 0 && x1 > r0.x + 20 && !errs.length,
      JSON.stringify({ ...r0, x1 }) + (errs[0] ? ' ' + errs[0] : ''));
    await ctx.close();
  }
  // Đang có hẹn với Linh và đang ở thư viện: tải lại trang vẫn còn Linh đợi
  { const ctx = await b.newContext({ viewport:{ width:520, height:900 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="tro"]'); await page.click('#go');
    await page.evaluate(() => { S.once.roamTut = true; S.day = 6; S.slot = 'afternoon'; S.meet = { d:6, slot:'afternoon', who:'linh', at:'in:lib', sc:'cc_hoc' }; ccAll().on.linh = { b:'cho_gap', d:6 };
      S.roam = { d:6, t:15 * 60 }; S.roamPos = {}; S.where = { d:6, slot:'afternoon', at:'in:lib', bike:null }; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance(); });
    await page.waitForTimeout(3500); await page.evaluate(() => save()); await page.reload(); await page.click('#resume'); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ linh:WORLD.npcs.filter(a => a.who === 'linh' && !a.gone).map(a => a.entries().map(e => e.label).join()), st:S.cc.on.linh && S.cc.on.linh.b }));
    check('Đang hẹn Linh ở thư viện, tải lại trang: Linh vẫn đợi (một người), chuyện vẫn tiếp tục', r.linh.length === 1 && /Ngồi học cùng Linh/.test(r.linh[0]) && r.st === 'cho_gap' && !errs.length, JSON.stringify(r) + (errs[0] || ''));
    await ctx.close(); }
  await b.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
