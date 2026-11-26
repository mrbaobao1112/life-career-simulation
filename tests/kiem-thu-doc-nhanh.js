// Kiểm thử v17.7 – Phase 2: ĐỌC NHANH (giảm chữ)
// 1–4 chạy bằng jsdom: ngân sách chữ từng cảnh, không còn thuật ngữ khó, bật/tắt cho cùng lựa chọn và cùng hiệu ứng,
//   cùng một lượt chơi (cùng hạt giống) thì số chữ giảm nhiều.
// 5 chạy trên trình duyệt thật (điện thoại giả lập): nút lựa chọn hiện ngay màn hình đầu, nút bật/tắt, công tắc trong Cài đặt.
// Chạy: npm run doc-nhanh
const { JSDOM } = require('jsdom');
const html = require('./nap-game')();
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
function mo(seed, tat){
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; if (tat) w.localStorage.setItem('lcs-doc-nhanh', '0'); } });
  const w = dom.window; w.errs = []; w.addEventListener('error', e => w.errs.push(e.message)); w.rnd = rnd; return w;
}
const batDau = (w, b = 1) => { const d = w.document; d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[1].click(); d.querySelectorAll('.bgopt[data-b]')[b].click(); d.querySelector('#go').click(); w.eval('S.opt.roam = false'); };
// Chữ đang hiện (bỏ phần thu gọn "Xem thêm", bỏ khung code)
const hien = (w, sel) => { const r = w.document.querySelector(sel); if (!r) return ''; const c = r.cloneNode(true);
  c.querySelectorAll('details:not([open])').forEach(dt => [...dt.children].forEach(x => { if (x.tagName !== 'SUMMARY') x.remove(); })); c.querySelectorAll('code,pre,[hidden]').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' '); };
const tu = s => (String(s).match(/\S+/g) || []).length;
// Bấm như người chơi đến ngày `den`; gọi `moiCanh(id)` mỗi khi một cảnh mới hiện ra
function choi(w, den, moiCanh){
  const d = w.document; let last = null, chu = 0;
  for (let i = 0; i < 9000; i++) {
    if (d.querySelector('#again')) break;
    const S = w.eval('S'); if (S.day >= den) break;
    if (S.cur && S.cur !== last) { last = S.cur; if (moiCanh) moiCanh(S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id); chu += tu(hien(w, '#stage')); }
    const nw = d.querySelector('#nextWeek'); if (nw) { chu += tu(hien(w, '#stage')); nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { chu += tu(hien(w, '#stage .result, #stage .res')); nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]')); if (!ch.length) { w.errs.push('kẹt'); break; }
    ch[Math.floor(w.rnd() * ch.length)].click();
  }
  return chu;
}
const KHO = /(?<![\p{L}\d])(task|Task|bug|Bug|OT|standup|deploy|Deploy|review|Review|senior|commit|hotfix|tester|#LCS-\d+)(?![\p{L}\d])/u;

// 1, 2. Ngân sách chữ và thuật ngữ trên 2 ván, 3 tuần đầu
{ const vuot = [], kho = [], ketQua = [];
  for (const [seed, b] of [[11, 1], [23, 2]]) {
    const w = mo(seed); batDau(w, b);
    choi(w, 22, id => {
      const st = w.document.querySelector('#stage');
      const moTa = [...st.querySelectorAll('.st > p, .w-st > p')].filter(p => !p.closest('details')).map(p => p.textContent).join(' ');
      if (tu(moTa) > w.eval('DN.MO_TA + DN.CAU_DAI')) vuot.push(`${id}: mô tả ${tu(moTa)} từ`);
      [...st.querySelectorAll('.choice .cl, .tile .tl')].forEach(l => { if (tu(l.textContent) > 12) vuot.push(`${id}: lựa chọn "${l.textContent.slice(0, 40)}"`); });
      [...st.querySelectorAll('.choice')].forEach(c => { const n = c.querySelectorAll('.chips .chip:not(.cost):not(.bad)').length; if (n > 1) vuot.push(`${id}: ${n} thẻ gợi ý`); });
      const m = hien(w, '#stage').match(KHO); if (m) kho.push(`${id}: "${m[0]}"`);
    });
    const kq = [...w.document.querySelectorAll('#stage .res p, #stage .result p')].map(p => p.textContent); ketQua.push(...kq);
    if (w.errs.length) vuot.push('lỗi: ' + w.errs[0]); w.close();
  }
  const uniq = L => [...new Set(L)];
  check('Ngân sách chữ: mô tả cảnh, nhãn lựa chọn (tối đa 12 từ), mỗi lựa chọn tối đa 1 thẻ gợi ý (2 ván, 3 tuần đầu)', !vuot.length, uniq(vuot).slice(0, 5).join(' | '));
  check('Không còn thuật ngữ khó trên màn hình (task, bug, OT, standup, deploy, review, senior, commit, mã #LCS…)', !kho.length, uniq(kho).slice(0, 6).join(' | ')); }

// 3. Bật/tắt: cùng lựa chọn (số lượng, thứ tự, giá, điều kiện) và cùng hiệu ứng
{ const sosanh = [];
  for (const ref of ["{ id:'task', arg:{ tid:102 } }", "{ id:'endwork' }", "{ id:'wake' }", "{ id:'activity', arg:'evening' }", "{ id:'ev', arg:'sleepdebt' }", "{ id:'plan' }", "{ id:'dayReport' }"]) {
    const kq = [true, false].map(tat => { const w = mo(5, tat); batDau(w, 2);
      const r = JSON.parse(w.eval(`S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.slot = 'afternoon'; S.cur = ${ref}; const sc = buildScene(S.cur);
        const keo = JSON.stringify(S); const kq = sc.choices.map((c, i) => { S = JSON.parse(keo); const t = c.fx ? c.fx() : null; return { i, key:c.key, actId:c.actId, cost:c.cost || 0, off:!!c.disabled, snap:JSON.stringify(snap()), go:t && t.go }; });
        S = JSON.parse(keo); JSON.stringify(kq)`)); w.close(); return r; });
    if (JSON.stringify(kq[0]) !== JSON.stringify(kq[1])) sosanh.push(ref);
  }
  check('Bật hay tắt Đọc nhanh: cùng lựa chọn, cùng thứ tự, giá, điều kiện, và cùng hiệu ứng lên tiền, chỉ số (7 cảnh)', !sosanh.length, sosanh.join(', ')); }

// 4. Cùng một lượt chơi (cùng hạt giống, cùng cách bấm): tắt và bật Đọc nhanh
{ const a = mo(31, true); batDau(a, 1); const ca = choi(a, 8); const da = a.eval('S.day + ":" + S.money');
  const b = mo(31, false); batDau(b, 1); const cb = choi(b, 8); const db = b.eval('S.day + ":" + S.money');
  check('Cùng một lượt chơi tuần đầu: đi đúng cùng một đường (cùng ngày, cùng số tiền)', da === db, `${da} so với ${db}`);
  const giam = Math.round((1 - cb / ca) * 100);
  check('Tuần đầu: chữ trên màn hình giảm ít nhất 25% (ngưỡng chặn chữ dài trở lại; mục tiêu 50% của v17.7 CHƯA ĐẠT, xem docs/AUDIT_REPORT_v17.7.md)', giam >= 25, `${ca} → ${cb} từ, giảm ${giam}%`);
  check('Không lỗi', !a.errs.length && !b.errs.length, (a.errs[0] || b.errs[0] || '')); a.close(); b.close(); }

// 5. Trình duyệt thật, điện thoại giả lập
(async () => {
  let chromium, devices; try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Phần 5 CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
  const URL = 'file://' + require('path').join(__dirname, '..', 'index.html');
  const br = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await br.newContext({ ...devices['iPhone 13'], colorScheme:scheme }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go');
    const thap = [];
    for (const [q, slot] of [["{ id:'task', arg:{ tid:102 } }", 'morning'], ["{ id:'wake' }", 'morning'], ["{ id:'endwork' }", 'afternoon'], ["{ id:'activity', arg:'evening' }", 'evening']]) {
      await p.evaluate(([q, slot]) => { S.opt.roam = false; S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.slot = slot; S.queue = [eval('(' + q + ')')]; S.cur = null; advance(); }, [q, slot]);
      await p.waitForTimeout(500);
      const r = await p.evaluate(() => ({ y:document.querySelector('#stage .choice').getBoundingClientRect().top, h:innerHeight, tran:document.documentElement.scrollWidth > innerWidth + 1 }));
      if (r.y + 30 > r.h || r.tran) thap.push(`${q.slice(6, 14)}: nút ở ${Math.round(r.y)}/${r.h}${r.tran ? ', tràn ngang' : ''}`);
    }
    // v17.8: khung thế giới đi lại không bị thu nhỏ hay cắt khi bật Đọc nhanh (lỗi của v17.7)
    await p.evaluate(() => { S.opt.roam = true; S.once.roamTut = true; S.flags.pho = { d:8, met:1, vendor:1, rain:1, jam:1 }; S.day = 8; S.slot = 'afternoon'; S.roam = { d:8, t:15 * 60 }; S.roamPos = {}; S.where = { d:8, slot:'afternoon', at:'street', bike:null }; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance(); });
    await p.waitForTimeout(600);
    const wv = await p.evaluate(() => { const w = document.querySelector('#world'), v = w.querySelector('.w-view'); return { w:w.clientWidth, vw:v.clientWidth, vh:v.clientHeight, ty:getComputedStyle(w).maxHeight }; });
    check(`Điện thoại (${scheme === 'light' ? 'nền sáng' : 'nền tối'}): khung thế giới đi lại giữ nguyên cỡ khi bật Đọc nhanh (không bị thu nhỏ, cắt)`, wv.vw === wv.w && Math.abs(wv.vh - wv.vw * 220 / 360) <= 2 && wv.ty === 'none', JSON.stringify(wv));
    // v17.9: câu người đi đường, đồng nghiệp tự nói trong thế giới đi lại cũng đổi thuật ngữ (bật), giữ nguyên (tắt)
    const noi = await p.evaluate(async () => { const C = WORLD.api.C, a = WORLD.npcs.find(x => !x.gone) || WORLD.me, cau = 'Fix bug của task này rồi review nhé', doc = () => [...document.querySelectorAll('#world .say text')].map(t => t.textContent);
      C.say(a, cau, 400); const bat = doc().pop(); await new Promise(r => setTimeout(r, 500)); dnOn.nho = false; C.say(a, cau, 400); const tat = doc().pop(); dnOn.nho = true; return { bat, tat }; });
    check(`Thế giới đi lại (${scheme === 'light' ? 'nền sáng' : 'nền tối'}): câu nhân vật tự nói đổi thuật ngữ khi bật Đọc nhanh, giữ nguyên khi tắt`, noi.bat === 'Fix lỗi của việc này rồi xem lại nhé' && noi.tat === 'Fix bug của task này rồi review nhé', JSON.stringify(noi));
    check(`Điện thoại (${scheme === 'light' ? 'nền sáng' : 'nền tối'}): nút lựa chọn đầu tiên hiện ngay màn hình đầu, không tràn ngang (việc, thức dậy, hết giờ làm, giờ rảnh)`, !thap.length, thap.join(' | '));
    if (scheme === 'light') {
      const t = await p.evaluate(() => { const b = document.querySelector('#btnDoc'), a = b.textContent; b.click(); const c = b.textContent, full = document.querySelector('#stage').textContent.length; b.click(); return { a, c, on:dnOn(), lop:document.body.classList.contains('doc-nhanh'), full, ngan:document.querySelector('#stage').textContent.length }; });
      check('Nút "📖 Đọc nhanh" ở cuối màn hình: bấm thì tắt (hiện chữ đầy đủ), bấm lại thì bật', /bật/.test(t.a) && /tắt/.test(t.c) && t.on && t.lop && t.full > t.ngan, JSON.stringify(t));
      await p.evaluate(() => { localStorage.clear(); }); await p.goto(URL); await p.click('#tGear');
      const s = await p.evaluate(() => { const x = document.querySelector('#swDoc'); const a = x && x.getAttribute('aria-checked'); x.click(); return { a, b:x.getAttribute('aria-checked'), luu:localStorage.getItem('lcs-doc-nhanh') }; });
      check('Cài đặt ở màn hình mở đầu có công tắc "Đọc nhanh" (mặc định bật), tắt được và nhớ lựa chọn', s.a === 'true' && s.b === 'false' && s.luu === '0', JSON.stringify(s));
    }
    check(`Không lỗi (${scheme})`, !errs.length, errs[0] || ''); await ctx.close();
  }
  await br.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
