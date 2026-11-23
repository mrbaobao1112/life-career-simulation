// Kiểm thử v17.6 – Phase 2: nền tảng phát triển (kỹ năng nghề, cấp bậc, mục tiêu sống).
// Phần 1–7 chạy bằng jsdom; phần 8 chạy trên trình duyệt thật (cần Playwright). Chạy: npm run phat-trien
const { JSDOM } = require('jsdom');
const html = require('./nap-game')();
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
function mo(seed = 5, save){
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; if (save) w.localStorage.setItem(save.key, save.value); } });
  const w = dom.window, errs = []; w.addEventListener('error', e => errs.push(e.message)); w.errs = errs; return w;
}
const moi = (w, bg = 'tro', fam = 'tb') => w.eval(`newGame('A', 'nam', '${bg}', defaultLook('nam'), '${fam}'); 0`);
const E = (w, code) => JSON.parse(w.eval(`JSON.stringify((() => { ${code} })())`));

// 1. Tắt được: PT.ON = false thì không có gì mới
{ const w = mo(); w.eval('PT.ON = false'); moi(w);
  const r = E(w, `S.day = 2; S.slot = 'evening'; buildSlot(); openProfile(); return { pt:!!S.pt, q:S.queue.map(x => x.id), prof:/Kỹ năng nghề/.test(document.querySelector('#dlgBody').innerHTML) };`);
  check('Tắt PT.ON: không có kỹ năng nghề, mục tiêu, cấp bậc; Hồ sơ như cũ', !r.pt && !r.q.includes('muc_tieu') && !r.prof, JSON.stringify(r)); w.close(); }

// 2. Kỹ năng: gốc lấy từ chỉ số cũ; chỉ tăng khi làm việc có ích; lặp lại trong ngày ít điểm hơn; có trần mỗi ngày
{ const w = mo(); moi(w);
  const r = E(w, `const o = {}; const P = ptAll(); o.goc = { lt:P.kn.lap_trinh, gt:P.kn.giao_tiep, tech:S.tech, soft:S.soft }; o.muc = ptTenMuc('lap_trinh');
    S.day = 3; S.slot = 'afternoon'; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = S.queue.shift(); current = buildScene(S.cur);
    const pick = id => current.choices.findIndex(c => c.actId === id);
    const xp = () => JSON.parse(JSON.stringify(P.kn));
    let a = xp(); settleChoice(current.choices[pick('rest')]); let b = xp(); o.nghi = Object.keys(a).every(k => a[k] === b[k]);
    S.cur = { id:'activity', arg:'afternoon' }; current = buildScene(S.cur); a = xp(); settleChoice(current.choices[pick('film')]); b = xp(); o.phim = Object.keys(a).every(k => a[k] === b[k]);
    S.cur = { id:'activity', arg:'afternoon' }; current = buildScene(S.cur); a = xp(); settleChoice(current.choices[pick('study')]); b = xp(); o.hoc1 = { lt:+(b.lap_trinh - a.lap_trinh).toFixed(1), st:+(b.sang_tao - a.sang_tao).toFixed(1) };
    S.cur = { id:'activity', arg:'evening' }; S.slot = 'evening'; current = buildScene(S.cur); a = xp(); settleChoice(current.choices[pick('study')]); b = xp(); o.hoc2 = { lt:+(b.lap_trinh - a.lap_trinh).toFixed(1), st:+(b.sang_tao - a.sang_tao).toFixed(1) };
    for (let i = 0; i < 10; i++) { S.cur = { id:'activity', arg:'evening' }; current = buildScene(S.cur); settleChoice(current.choices[pick('study')]); }
    o.tranNgay = +(P.ngay.kn.lap_trinh).toFixed(1); o.tran = PT.TRAN_NGAY;
    S.day = 4; S.cur = { id:'activity', arg:'evening' }; current = buildScene(S.cur); a = xp(); settleChoice(current.choices[pick('study')]); b = xp(); o.homSau = +(b.lap_trinh - a.lap_trinh).toFixed(1);
    return o;`);
  check('Kỹ năng gốc lấy từ chỉ số cũ (Lập trình = Chuyên môn × 0,4; Giao tiếp = Kỹ năng mềm × 0,4)', r.goc.lt === Math.round(r.goc.tech * .4) && r.goc.gt === Math.round(r.goc.soft * .4), JSON.stringify(r.goc));
  check('Nằm nghỉ, xem phim: không tăng kỹ năng nào', r.nghi && r.phim);
  check('Học thêm, làm dự án cá nhân: tăng Lập trình và Sáng tạo', r.hoc1.lt > 0 && r.hoc1.st > 0, JSON.stringify(r.hoc1));
  check('Học lại lần nữa trong ngày: ít điểm hơn (không cày được)', r.hoc2.lt < r.hoc1.lt && r.hoc2.st < r.hoc1.st, JSON.stringify(r.hoc2));
  check(`Mỗi kỹ năng mỗi ngày tăng tối đa ${r.tran} điểm; sang ngày mới lại tăng được`, r.tranNgay <= r.tran && r.homSau > 0, `hôm nay ${r.tranNgay}, hôm sau +${r.homSau}`);
  check('Không lỗi', !w.errs.length, w.errs[0] || ''); w.close(); }

// 3. Nguồn tăng theo việc thật: sự cố → Giải quyết vấn đề; demo → Giao tiếp; lập kế hoạch → Quản lý; task xong → Lập trình
{ const w = mo(); moi(w);
  const r = E(w, `const o = {}, P = ptAll(), s0 = () => ptSnap();
    const thu = (ref, ch, fn) => { const s = s0(); fn(); const g = ptNote(ref, ch, s) || {}; return Object.fromEntries(Object.entries(g).map(([k, v]) => [k, +v.toFixed(1)])); };
    S.day = 10; o.suco = thu({ id:'ev', arg:'ngay_suco' }, { label:'Đọc log cùng anh Dũng' }, () => { S.tech += 2; S.perf += 1; });
    o.demo = thu({ id:'ev', arg:'ngay_demo' }, { label:'Xin trình bày' }, () => { S.soft += 2; });
    o.keHoach = thu({ id:'plan' }, { label:'Lập bảng chi tiêu' }, () => {});
    o.task = thu({ id:'task' }, { label:'Làm cẩn thận' }, () => { S.stat.tasks++; S.perf += 2; });
    o.taskHong = thu({ id:'task' }, { label:'Bỏ dở' }, () => { S.perf -= 1; });
    o.suco0 = thu({ id:'ev', arg:'ngay_suco' }, { label:'Làm nốt task' }, () => {});
    return o;`);
  check('Xử lý sự cố có ích: tăng Giải quyết vấn đề', r.suco.giai_quyet > 0, JSON.stringify(r.suco));
  check('Trình bày demo: tăng Giao tiếp', r.demo.giao_tiep > 0, JSON.stringify(r.demo));
  check('Lập kế hoạch chi tiêu: tăng Quản lý', r.keHoach.quan_ly > 0, JSON.stringify(r.keHoach));
  check('Làm xong task tốt: tăng Lập trình và Giải quyết vấn đề', r.task.lap_trinh > 0 && r.task.giai_quyet > 0, JSON.stringify(r.task));
  check('Task bỏ dở, hay chọn làm việc khác trong ngày sự cố (không có ích): không tăng gì', !Object.keys(r.taskHong).length && !Object.keys(r.suco0).length, JSON.stringify([r.taskHong, r.suco0]));
  w.close(); }

// 4. Mục tiêu: gợi ý theo hoàn cảnh, tối ngày 2; chọn thì theo đuổi; tiến độ; xong; có việc rồi thì mở mục tiêu lên Middle
{ const goiY = (bg, fam, job) => { const w = mo(); moi(w, bg, fam); const r = E(w, `${job ? "S.job = { co:'hotay', salary:1e7, start:2 };" : ''} return ptGoiY();`); w.close(); return r; };
  const a = goiY('tro', 'kho', false), b = goiY('nha', 'kha', true), c = goiY('ghep', 'tb', true);
  check('Gợi ý theo hoàn cảnh: thuê trọ, nhà khó khăn, chưa có việc → có việc trước, để dành', a[0] === 'co_viec' && a.includes('tiet_kiem') && a.length === 3, a.join(','));
  check('Ở với bố mẹ, nhà khá giả, đã có việc → lên Middle, đổi xe máy; không gợi ý tìm việc', b.includes('su_nghiep') && b.includes('mua_xe') && !b.includes('co_viec'), b.join(','));
  check('Ba hoàn cảnh cho ba bộ gợi ý khác nhau', a.join() !== b.join() && b.join() !== c.join(), c.join(','));
  const w = mo(); moi(w, 'tro', 'kho');
  const r = E(w, `const o = {}; S.day = 2; S.slot = 'evening'; buildSlot(); o.q = S.queue.map(x => x.id); const i = S.queue.findIndex(x => x.id === 'muc_tieu');
    S.cur = S.queue.splice(i, 1)[0]; current = buildScene(S.cur); current = buildScene(S.cur); o.lua = current.choices.map(c => c.label); const s = snap();
    choose(0); o.mt = ptAll().mt.map(m => [m.id, m.tt, !!m.chinh]); o.khongDoi = JSON.stringify(snap()) === JSON.stringify(s);
    S.day = 3; S.slot = 'evening'; S.queue = []; buildSlot(); o.lan2 = S.queue.some(x => x.id === 'muc_tieu');
    S.job = { co:'hotay', salary:1e7, start:5 }; S.day = 5; S.slot = 'morning'; buildSlot(); o.sau = ptAll().mt.map(m => [m.id, m.tt]); o.cap = ptAll().cap;
    S.money = ptAll().tien0 + mtSo('tiet_kiem') + 1; S.slot = 'afternoon'; buildSlot(); o.tk = mtGet('tiet_kiem');
    return o;`);
  check('Tối ngày 2: cảnh gợi ý mục tiêu, trước giờ rảnh', r.q.indexOf('muc_tieu') >= 0 && r.q.indexOf('muc_tieu') < r.q.indexOf('activity'), r.q.join(' '));
  check('Cảnh dựng lại nhiều lần vẫn chỉ 3 gợi ý; có lựa chọn ưu tiên, cả ba, để sau', r.lua.length === 5 && r.mt.length === 3, r.lua.join(' | '));
  check('Chọn ưu tiên: cả ba thành "đang theo đuổi", một cái được đánh dấu chính; không đổi tiền, chỉ số', r.mt.every(m => m[1] === 'dang_lam') && r.mt.filter(m => m[2]).length === 1 && r.khongDoi, JSON.stringify(r.mt));
  check('Chỉ gợi ý một lần', !r.lan2);
  check('Có việc: mục tiêu "có việc" xong, tự mở mục tiêu "lên Middle"; bắt đầu là Junior', r.sau.some(m => m[0] === 'co_viec' && m[1] === 'xong') && r.sau.some(m => m[0] === 'su_nghiep' && m[1] === 'dang_lam') && r.cap === 'junior', JSON.stringify(r.sau));
  check('Để dành đủ: mục tiêu tiết kiệm xong, có tiến độ 100%', r.tk && r.tk.tt === 'xong' && r.tk.td === 1, JSON.stringify(r.tk));
  const h = E(w, `S.day = LAST_DAY; ptCapNhat(); return ptAll().mt.map(m => [m.id, m.tt]);`);
  check('Hết 56 ngày: mục tiêu ngắn hạn chưa xong thành "hết hạn" (mục tiêu nhiều năm thì không)', h.every(m => m[1] === 'xong' || m[1] === 'het_han' || m[1] === 'dang_lam' && m[0] === 'mua_nha'), JSON.stringify(h));
  check('Không lỗi', !w.errs.length, w.errs[0] || ''); w.close(); }

// 5. Cấp bậc: điều kiện theo năng lực, kinh nghiệm, kết quả; chiều thứ Sáu đủ điều kiện thì lên Middle; không đổi lương; không lên quá Middle
{ const w = mo(); moi(w, 'ghep');
  const r = E(w, `const o = {}; o.chuaViec = ptAll().cap; S.job = { co:'hotay', salary:12e6, start:3 }; S.day = 3; S.slot = 'morning'; buildSlot(); o.junior = ptAll().cap;
    o.dk0 = ptDieuKien().filter(x => !x.dat).length;
    const P = ptAll(); P.kn.lap_trinh = 90; P.kn.giai_quyet = 45; P.kn.giao_tiep = 45; S.stat.workDays = 30; S.stat.tasks = 50; S.perf = 70; S.stat.lateWork = 0;
    S.flags.review = 'warn'; o.warn = ptDuLen(); S.flags.review = 'good'; o.du = ptDuLen();
    let d = 30; while (dayInfo(d).wd !== 5 || !isWorkday(d)) d++; S.day = d; S.slot = 'afternoon'; S.fast = null; buildSlot(); o.q = S.queue.map(x => x.id);
    const i = S.queue.findIndex(x => x.id === 'thang_cap'); S.cur = S.queue.splice(i, 1)[0]; current = buildScene(S.cur); const s = snap(), luong = S.job.salary; choose(0);
    o.cap = ptAll().cap; o.khongDoi = JSON.stringify(snap()) === JSON.stringify(s) && S.job.salary === luong; o.memo = S.memo.slice(-1)[0];
    S.day = d + 7; S.slot = 'afternoon'; P.kn = { lap_trinh:999, giai_quyet:999, giao_tiep:999, quan_ly:999, sang_tao:999 }; S.stat.workDays = 9999; S.stat.tasks = 9999; buildSlot(); o.quaMiddle = S.queue.some(x => x.id === 'thang_cap') || ptDuLen();
    openProfile(); const h = document.querySelector('#dlgBody').innerHTML; o.hoSo = ['Mục tiêu', 'Cấp bậc', 'Kỹ năng nghề', 'Middle Developer', 'Lập trình'].filter(t => !h.includes(t));
    return o;`);
  check('Chưa đi làm: chưa có cấp bậc; bắt đầu đi làm: Junior', r.chuaViec === null && r.junior === 'junior', JSON.stringify([r.chuaViec, r.junior]));
  check('Junior mới vào: còn thiếu nhiều điều kiện lên Middle', r.dk0 >= 4, r.dk0 + ' điều kiện chưa đạt');
  check('Đủ năng lực và kinh nghiệm nhưng bị nhắc nhở trong buổi nhận xét: chưa lên', !r.warn && r.du);
  check('Đủ mọi điều kiện: chiều thứ Sáu có cảnh lên cấp, trước giờ tan làm', r.q.indexOf('thang_cap') >= 0 && r.q.indexOf('thang_cap') < r.q.indexOf('endwork'), r.q.join(' '));
  check('Lên Middle Developer: có ghi nhật ký; không đổi lương, tiền, chỉ số', r.cap === 'middle' && r.khongDoi && /Middle/.test(r.memo && r.memo.text), JSON.stringify([r.cap, r.memo]));
  check('Trong 56 ngày không lên quá Middle (Senior, Team Leader, Manager để dành cho bản sau)', !r.quaMiddle);
  check('Hồ sơ có phần Mục tiêu, Cấp bậc, Kỹ năng nghề', !r.hoSo.length, r.hoSo.join(','));
  check('Không lỗi', !w.errs.length, w.errs[0] || ''); w.close(); }

// 6. Chơi trọn 56 ngày (bot bấm ngẫu nhiên): không lỗi; có gợi ý mục tiêu; kỹ năng tăng; bot chọn bừa không tự lên Middle
{ let lenMiddle = 0, tang = 0, goiY = 0, loi = []; const N = 4;
  for (let v = 0; v < N; v++) {
    const w = mo(40 + v * 7), d = w.document;
    d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[v % 3].click(); d.querySelectorAll('.bgopt[data-b]')[v % 3].click(); d.querySelector('#go').click();
    let s = 40 + v * 7; const rnd = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 9000; i++) {
      if (d.querySelector('#again')) break;
      const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
      const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
      const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
      const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]')); if (!ch.length) { loi.push('kẹt'); break; }
      ch[Math.floor(rnd() * ch.length)].click();
    }
    const r = E(w, `return { day:S.day, cap:ptAll().cap, kn:ptAll().kn, mt:ptAll().mt.length, goc:Math.round(S.tech * 0) };`);
    if (r.day !== 56) loi.push('kết thúc ngày ' + r.day); if (r.cap === 'middle') lenMiddle++; if (Object.values(r.kn).reduce((a, b) => a + b, 0) > 60) tang++; if (r.mt >= 3) goiY++;
    loi.push(...w.errs); w.close();
  }
  check(`Chơi trọn 56 ngày (${N} ván, bấm ngẫu nhiên): không lỗi, có gợi ý mục tiêu, kỹ năng có tăng`, !loi.length && goiY === N && tang === N, loi[0] || `${goiY} ván có mục tiêu, ${tang} ván kỹ năng tăng`);
  check('Bấm bừa không tự lên Middle (cấp bậc cần kết quả công việc tốt)', lenMiddle < N, `${lenMiddle}/${N} ván lên Middle`); }

// 7. Lưu/tải: giữ nguyên kỹ năng, mục tiêu, cấp bậc; bản lưu cũ chưa có thì tự tạo
{ const w = mo(); moi(w); E(w, `S.job = { co:'hotay', salary:1e7, start:2 }; S.day = 4; S.slot = 'morning'; buildSlot(); ptAll().kn.quan_ly = 33; mtThem('xa_hoi', 'dang_lam'); save(); return 0;`);
  const key = w.eval('SAVE_KEY'), v = w.localStorage.getItem(key), a = JSON.parse(v).pt; w.close();
  const h = mo(5, { key, value:v }); h.document.querySelector('#resume').click();
  const b = E(h, 'return S.pt;'); check('Lưu rồi tải lại: kỹ năng, mục tiêu, cấp bậc giữ nguyên', JSON.stringify(a) === JSON.stringify(b) && b.kn.quan_ly === 33 && b.cap === 'junior' && b.mt.some(m => m.id === 'xa_hoi' && m.so === 6), JSON.stringify(b.mt));   // mục tiêu không phải tiền: không làm tròn h.close();
  const S0 = JSON.parse(v); delete S0.pt; const o = mo(5, { key, value:JSON.stringify(S0) }); o.document.querySelector('#resume').click();
  const c = E(o, 'openProfile(); return { pt:!!ptAll(), lt:S.pt.kn.lap_trinh, tech:S.tech, cap:S.pt.cap };');
  check('Bản lưu cũ chưa có phần phát triển: tự tạo (kỹ năng gốc từ Chuyên môn, đang đi làm thì là Junior)', c.pt && c.lt === Math.round(c.tech * .4) && c.cap === 'junior' && !o.errs.length, JSON.stringify(c) + (o.errs[0] || '')); o.close(); }

// 8. Trên trình duyệt thật (từng file nạp riêng theo thứ tự trong index.html): không lỗi khi mở game; chọn hoạt động thật thì kỹ năng tăng; Hồ sơ hiện phần mới
(async () => {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Phần 8 CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
  const b = await chromium.launch(), ctx = await b.newContext({ viewport:{ width:520, height:900 } }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + require('path').join(__dirname, '..', 'index.html')); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b="tro"]'); await page.click('#go');
  const r = await page.evaluate(() => { S.opt.roam = false; S.day = 3; S.slot = 'evening'; S.queue = [{ id:'activity', arg:'evening' }]; S.cur = null; advance();
    const a = ptXp('lap_trinh'), i = current.choices.findIndex(c => c.actId === 'study'); choose(i);
    openProfile(); const h = document.querySelector('#dlgBody').innerHTML; closeDlg();
    return { tang:ptXp('lap_trinh') - a, hoSo:/Kỹ năng nghề/.test(h) && /Mục tiêu/.test(h) }; });
  check('Trình duyệt thật: mở game không lỗi; chọn "Học thêm" thì Lập trình tăng; Hồ sơ có phần mới', !errs.length && r.tang > 0 && r.hoSo, JSON.stringify(r) + (errs[0] ? ' lỗi: ' + errs[0] : ''));
  await b.close();
  console.log(fail ? `\n${fail} kiểm tra KHÔNG ĐẠT` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);   // thoát hẳn: trang giả lập còn hẹn giờ chạy nền
})();
