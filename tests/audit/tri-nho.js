// Audit v17.3: kịch bản trí nhớ đầu–cuối, có lưu và tải lại trang thật
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const out = []; const rec = (k, ok, v) => { out.push({ k, ok, v }); console.log((ok ? 'OK  ' : 'BAD ') + k + ' → ' + JSON.stringify(v)); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:1280, height:800 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go');
  const said = () => p.evaluate(() => window.__said || []);
  const watch = () => p.evaluate(() => { window.__said = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) window.__said.push(n.textContent); }))).observe(document.body, { childList:true, subtree:true }); });
  await watch();
  // 1. Giúp anh Dũng: sự kiện “Anh Dũng nhờ một việc”, chọn “Đi mua ngay” (qua giao diện thật)
  await p.evaluate(() => { S.once.roamTut = true; S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; S.queue = [{ id:'ev', arg:'coffee_run' }]; S.cur = null; advance(); });
  await p.waitForTimeout(600);
  const btn = await p.$$eval('#stage .choice', b => b.map(x => x.textContent.trim().slice(0, 40)));
  await p.click('#stage .choice >> nth=0'); await p.waitForTimeout(800);
  const m1 = await p.evaluate(() => MEM_DEBUG());
  rec('Giúp anh Dũng (mua nước, qua nút bấm thật): anh Dũng ghi nhớ', m1.some(s => s.startsWith('dung>me:ev:coffee_run+')), { nut:btn, nho:m1 });
  // 2. Tranh luận giữa hai đồng nghiệp (trí nhớ NPC–NPC)
  await p.evaluate(() => { memAdd({ w:'dung', o:'mai', k:'argue', v:-1 }); save(); });
  // 3. Lưu, đóng hẳn trang, mở lại, chơi tiếp
  const before = await p.evaluate(() => localStorage.getItem(SAVE_KEY).length);
  await p.reload(); await p.waitForTimeout(800);
  const hasResume = !!(await p.$('#resume')); if (hasResume) await p.click('#resume'); await p.waitForTimeout(600); await watch();
  const m2 = await p.evaluate(() => MEM_DEBUG());
  rec('Sau khi tải lại trang: trí nhớ còn nguyên', m2.some(s => s.startsWith('dung>me:ev:coffee_run+')) && m2.some(s => s.startsWith('dung>mai:argue')), { nho:m2, kichThuocBanLuu:before });
  // 4. Hôm sau đến công ty, đi bộ (phím thật) đến gần anh Dũng
  await p.evaluate(() => { S.day = 10; S.slot = 'morning'; S.roam = { d:10, t:10 * 60 }; S.roamPos = {}; S.queue = [{ id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); WORLD.t = 600; WORLD.end = 1e9; WEV.ON = false; });
  await p.waitForTimeout(1500);
  const d = await p.evaluate(() => { const a = WORLD.npcs.find(n => n.who === 'dung'); a.ai.until = Infinity; return { x:a.x, y:a.y, gone:!!a.gone }; });
  await p.evaluate(d => { WORLD.me.x = d.x + 80; WORLD.me.y = Math.min(ROAM.Y1, d.y + 14); }, d);
  for (let i = 0; i < 12; i++) { await p.keyboard.down('KeyA'); await p.waitForTimeout(150); await p.keyboard.up('KeyA'); await p.waitForTimeout(50); }
  await p.waitForTimeout(600);
  const s1 = await said(); const lines = await p.evaluate(() => MEM_LINES['ev:coffee_run'].pos.dung);
  const ex = await p.evaluate(() => WORLD.npcs.find(n => n.who === 'dung').expr);
  rec('Hôm sau gặp anh Dũng ở công ty: anh nhắc chuyện cốc bạc xỉu', s1.some(s => lines.includes(s)), { cau:s1.slice(-4), dung:d });
  rec('Nét mặt anh Dũng khi nhắc: vui', ex === 'happy', ex);
  // 5. Bắt chuyện trực tiếp với anh Dũng (phím E): câu nói có liên quan chuyện cũ không?
  await p.evaluate(() => { window.__said = []; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(300);
  const menu = await p.$$eval('.w-menu .w-act', b => b.map(x => x.textContent.trim()));
  const k = menu.findIndex(t => /Bắt chuyện/.test(t)); if (k >= 0) { await p.keyboard.press('Digit' + (k + 1)); await p.waitForTimeout(6000); }
  const s2 = await said();
  rec('Bắt chuyện (E) với anh Dũng sau đó: có nhắc chuyện cũ không', s2.some(s => lines.includes(s)), { menu, cau:s2 });
  // 6. NPC–NPC: hôm sau Mai và Dũng gặp nhau
  const nn = await p.evaluate(() => { const r = memNpcLine('mai', 'dung'); return r && r.lines; });
  rec('NPC nhớ chuyện với nhau sau khi tải lại: Mai và Dũng nhắc trận tranh luận', !!nn, nn);
  // 7. Gặp lại sau 1 tuần: còn nhắc (lần 2); sau 15 ngày: quên
  const later = await p.evaluate(() => { S.day = 17; const a = memRecall('dung'); S.day = 30; const b = memRecall('dung'); return [a && a.text, b]; });
  rec('Một tuần sau: nhắc thêm một lần (tối đa 2 lần)', !!later[0], later[0]);
  rec('Sau đó không nhắc nữa', later[1] === null, later[1]);
  // 8. Chế độ không đi lại tự do (chỉ bấm nút): có thấy trí nhớ không?
  const roamOpt = await p.evaluate(() => typeof roamOn === 'function' ? roamOn() : null);
  rec('Ghi chú: trí nhớ chỉ hiện trong thế giới đi lại tự do', true, { roamOn:roamOpt });
  rec('Không lỗi trang', !errs.length, errs.slice(0, 3));
  fs.writeFileSync(path.join(KQ, 'r_tri-nho.json'), JSON.stringify(out, null, 1)); await b.close();
})();
