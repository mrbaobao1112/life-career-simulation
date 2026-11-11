// Kiểm thử bản chơi thử 56 ngày (16/11/2026 đến 10/1/2027): lịch, các mốc, tua nhanh, lưu và tải lại, bản lưu cũ
const { JSDOM, VirtualConsole } = require('jsdom');
const html = require('./nap-game')();
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
function mk(saved){
  const errs = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
  const dom = new JSDOM(html, { virtualConsole:vc, runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({matches:true}); w.scrollTo=()=>{}; w.HTMLElement.prototype.focus=function(){}; if (saved) w.localStorage.setItem('lcs-tuan-dau-tien-v6', saved); } });
  dom.window.errs = errs; return dom.window;
}
// Chơi theo kiểu "tua tối đa": luôn chọn tua / qua nhanh, việc cần quyết thì chọn theo danh sách ưu tiên rồi đến lựa chọn đầu tiên
function play(w, { until = 99, pref = [], log = [], noTua = false } = {}){
  const d = w.document;
  for (let i = 0; i < 9000; i++) {
    const S = w.eval('S');
    if (d.querySelector('#again') || (S && S.day >= until && S.cur && S.cur.id === 'wake')) break;
    if (S && S.cur) log.push([S.day, S.cur.id + (S.cur.id === 'ev' ? ':' + S.cur.arg : ''), S.money]);
    const nw = d.querySelector('#nextWeek'); if (nw) { log.push([S.day, 'WEEK']); nw.click(); continue; }
    const fd = d.querySelector('#ffDay'); if (fd && !noTua) { fd.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
    if (!ch.length) { w.errs.push('kẹt: ' + d.querySelector('#stage').textContent.slice(0, 120)); break; }
    let b = noTua ? null : ch.find(x => x.textContent.includes('Tua đến'));
    if (!b) for (const k of pref) { b = ch.find(x => x.textContent.includes(k)); if (b) break; }
    (b || ch[0]).click();
  }
  return log;
}
function start(w, bg, fam = 1){ const d = w.document; d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[fam].click(); d.querySelector(`.bgopt[data-b="${bg}"]`).click(); d.querySelector('#go').click(); }

// 1. Lịch
{ const w = mk(); start(w, 'tro');
  const r = JSON.parse(w.eval(`JSON.stringify({ d1:dayInfo(1), d56:dayInfo(56), tet:isHoliday(47), last:LAST_DAY, wk:[weekOf(7), weekOf(8), weekStart(10)], me:monthEnd(3) })`));
  check('Ngày 1 là thứ Hai 16/11/2026', r.d1.dow === 'Thứ Hai' && r.d1.date === 16 && r.d1.month === 11);
  check('Ngày 56 là Chủ Nhật 10/1/2027', r.d56.dow === 'Chủ Nhật' && r.d56.date === 10 && r.d56.month === 1 && r.d56.year === 2027 && r.last === 56);
  check('1/1/2027 là ngày nghỉ, tuần và tháng tính đúng', r.tet && r.wk.join() === '1,2,8' && r.me === 15); w.close(); }

// 2. Các mốc: người có việc từ tuần đầu, chơi bằng cách tua
for (const bg of ['tro', 'ghep', 'nha']) {
  const w = mk(); start(w, bg);
  const log = play(w, { pref:['Viết lại cẩn thận', 'Hồ Tây', 'đồng ý', 'Cho mượn', 'Làm kỹ', 'Nhắc khéo', 'Trả hết', 'Góp 1'] });
  const S = w.eval('S'), on = id => log.filter(x => x[1] === id).map(x => x[0]);
  const tag = { tro:'Thuê trọ', ghep:'Ở ghép', nha:'Bố mẹ' }[bg] + ': ';
  check(tag + 'chơi đến hết ngày 56, không lỗi', S.day === 56 && !!w.document.querySelector('#again') && !w.errs.length, w.errs[0] || '');
  if (S.job) {
    check(tag + 'lương về đúng 10/12 và 10/1, mỗi kỳ một lần', on('payday').join() === '25,56' && S.flags.paidCount === 2, 'ngày ' + on('payday').join());
    check(tag + 'nhận xét của trưởng nhóm vào thứ Sáu 27/11', on('review').join() === '12', 'ngày ' + on('review').join());
  } else console.log('  (lượt này trượt phỏng vấn, bỏ qua kiểm tra lương)');
  check(tag + 'tổng kết tháng vào 1/12 và 1/1', on('monthReport').join() === '16,47', 'ngày ' + on('monthReport').join());
  check(tag + 'tổng kết tuần đủ 7 Chủ nhật trước ngày cuối', on('WEEK').join() === '7,14,21,28,35,42,49', on('WEEK').join());
  const paid = S.bills.filter(b => b.paid), ids = paid.map(b => b.id);
  check(tag + 'không hóa đơn nào bị trả hai lần', ids.length === new Set(ids).size);
  check(tag + 'hóa đơn 1/12 đã được xử lý', S.bills.some(b => b.id.startsWith('phone-12') && (b.paid || b.alerted)));
  if (bg !== 'nha') check(tag + 'tiền nhà 16/12 đã được xử lý (trả, hẹn lại hoặc báo thiếu)', S.bills.some(b => b.id.startsWith('rent-12')));
  if (bg === 'nha' && S.job) check(tag + 'có cảnh góp tiền chợ sau ngày lương', on('house_contrib').length >= 1);
  check(tag + 'không còn chữ undefined/NaN trên màn tổng kết', !/undefined|NaN/.test(w.document.querySelector('#app').innerHTML));
  w.close();
}

// 3. Tua nhanh không sinh sự kiện bất ngờ; việc thường ngày tự chạy theo nếp
{ const w = mk(); start(w, 'tro'); const log = play(w, { until:8, noTua:true, pref:['Hồ Tây', 'đồng ý', 'Cơm bụi', '23:30'] });
  const meals = log.filter(x => x[1] === 'meal').length, beds = log.filter(x => x[1] === 'bedtime').length;
  check('Bữa ăn chỉ hỏi lần đầu cho mỗi hoàn cảnh, giờ ngủ chỉ hỏi một lần', meals <= 2 && beds === 1, `hỏi bữa ăn ${meals} lần, giờ ngủ ${beds} lần trong 7 ngày`);
  const h = w.eval('S.habit'); check('Game ghi nhớ nếp sinh hoạt', !!h.meal && h.bed === 23.5, JSON.stringify(h));
  const meals7 = w.eval('S.meals.length'); check('Vẫn ăn đủ bữa dù không hỏi', meals7 >= 12, meals7 + ' bữa trong 7 ngày');
  const n = w.eval(`(() => { S.fast = { from:S.day, until:S.day }; let n = 0; for (let i = 0; i < 300; i++) { const q = []; maybeEvent(q, 'evening'); n += q.length; } S.fast = null; return n; })()`);
  check('Trong lúc tua không sinh sự kiện bất ngờ', n === 0, n + ' sự kiện trong 300 lần thử');
  w.close(); }

// 4. Lưu rồi tải lại giữa chừng: không nhận lương hai lần, không trừ tiền hai lần
{ const w = mk(); start(w, 'tro'); play(w, { until:26, pref:['Hồ Tây', 'đồng ý'] });
  const S = w.eval('S'), json = w.localStorage.getItem('lcs-tuan-dau-tien-v6');
  const w2 = mk(json); w2.document.querySelector('#resume').click(); const S2 = w2.eval('S');
  check('Tải lại: cùng ngày, cùng số dư, cùng số lần nhận lương', S2.day === S.day && S2.money === S.money && (S2.flags.paidCount || 0) === (S.flags.paidCount || 0), `ngày ${S2.day}, ${S2.money}đ`);
  w2.eval('S.finDay = 0; processFinance()'); check('Chạy lại sổ thu chi trong ngày không đổi số dư', w2.eval('S.money') === S.money);
  w.close(); w2.close(); }

// 5. Bản lưu cũ của bản 7 ngày (v6) chơi tiếp được sang ngày 8
{ const w = mk(); start(w, 'ghep'); play(w, { until:7, noTua:true });
  w.eval(`for (const k of ['habit','feed','evLast','opt','fast','appliedList','ws0','g0','m0','tungDue']) delete S[k]; S.v = 6; S.day = 7; S.phase = 'end'; S.cur = null; S.queue = []; S.slot = 'night'; save();`);
  const w2 = mk(w.localStorage.getItem('lcs-tuan-dau-tien-v6')), d = w2.document;
  check('Bản lưu cũ: màn mở đầu có nút Chơi tiếp', !!d.querySelector('#resume'));
  d.querySelector('#resume').click();
  check('Bản lưu cũ: hiện tổng kết tuần với nút Sang tuần mới', !!d.querySelector('#nextWeek') && !w2.errs.length, w2.errs[0] || '');
  d.querySelector('#nextWeek').click();
  check('Bản lưu cũ: sang được ngày 8', w2.eval('S.day') === 8 && w2.eval('S.v') === 7 && !w2.errs.length, w2.errs[0] || '');
  play(w2); check('Bản lưu cũ: chơi tiếp đến hết ngày 56', w2.eval('S.day') === 56 && !w2.errs.length, w2.errs[0] || '');
  w.close(); w2.close(); }

// 6. Người trượt phỏng vấn: thứ Hai sau được nộp lại, danh sách không có công ty đã nộp
{ const w = mk(); start(w, 'tro');
  w.eval(`S.day = 7; S.applied = 'banhmi'; S.appliedList = ['banhmi']; S.ivDay = 2; S.flags.bkUsed = true; S.cv = S.cv || { stand:2, honest:8, real:[], fake:[] }; S.queue = []; S.cur = null; S.slot = 'night'; startDay();`);
  const q = w.eval(`JSON.stringify([S.cur, ...S.queue].map(r => r.id))`), list = w.eval('reapplyList()');
  check('Thứ Hai 23/11 có cảnh đợt tin tuyển dụng mới', q.includes('reapply'), q);
  check('Danh sách không có công ty đã trượt và có 3 nơi khác', list.length === 3 && !list.includes('banhmi') && !list.includes('loren'), list.join());
  w.close(); }

// 7. Sân khấu văn phòng (v8): cảnh ở công ty có đủ 5 nhân vật; tắt đi thì về hình tĩnh; phân cảnh không chặn đường
{ const w = mk(); start(w, 'tro'); const d = w.document;
  w.eval(`S.habit = { meal:'rice', lunchWork:'team', bed:23.5, work:'careful' }; S.job = { co:'hotay', salary:10000000, start:3 }; S.deck = shuffle(TASKS.map(t => t.id)); S.day = 8; S.slot = 'night'; S.queue = []; S.cur = null; startDay();`);
  d.querySelector('#stage .choice').click();                                   // thức dậy
  const id1 = w.eval('S.cur.id'), actors = d.querySelectorAll('.panel.stage svg .actor').length;
  check('Ngày đi làm: cảnh task hiện trên sân khấu với 5 nhân vật', id1 === 'task' && actors === 5 && !w.errs.length, `cảnh ${id1}, ${actors} nhân vật ${w.errs[0] || ''}`);
  check('Phân cảnh đến công ty tự bỏ qua khi bật giảm chuyển động', w.eval(`(S.feed || []).length >= 0 && !S.queue.some(r => r.id === 'cut' && r.arg === 'arrive')`));
  w.eval(`S.opt.stage = false; renderScene();`);
  check('Tắt “Văn phòng sống” thì dùng lại hình tĩnh', !d.querySelector('.panel.stage') && !!d.querySelector('.panel svg'));
  w.eval(`S.opt.stage = true; window.matchMedia = () => ({ matches:false }); S.queue.unshift({ id:'cut', arg:'leave' }); S.queue.unshift(S.cur); S.cur = null; S.fast = null; advance();`);
  d.querySelector('#stage .choice').click(); if (d.querySelector('#next')) d.querySelector('#next').click();
  const id2 = w.eval('S.cur && S.cur.id + ":" + S.cur.arg');
  check('Có chuyển động: phân cảnh hiện ra và bấm một lần là qua', id2 === 'cut:leave' && !!d.querySelector('#stage .choice'), String(id2));
  const refBefore = w.eval('S.cur'); d.querySelector('#stage .choice').click(); check('Qua phân cảnh, game đi tiếp bình thường', w.eval('S.cur') !== refBefore && !w.errs.length, w.errs[0] || '');
  w.eval('window.matchMedia = () => ({ matches:true })'); w.close(); }

// 8. Cảnh sống ở mọi nơi (v9): mọi cảnh có hình đều dựng được, kể cả khi có chuyển động
{ const w = mk(); start(w, 'ghep'); const d = w.document; let live = 0, still = 0; const seen = new Set();
  w.eval('window.matchMedia = () => ({ matches:false })');
  for (let i = 0; i < 700 && w.eval('S.day') <= 9; i++) {
    const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
    if (d.querySelector('.panel')) { if (d.querySelector('.panel.stage .actor')) { live++; seen.add(w.eval('S.cur ? S.cur.id : "kq"')); } else still++; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]') && !b.textContent.includes('Tua đến')); if (!ch.length) break;
    ch[i % ch.length].click();
  }
  check('Chín ngày đầu: mọi cảnh có hình đều là cảnh sống, không lỗi', live >= 10 && still === 0 && !w.errs.length, `${live} cảnh sống, ${still} cảnh tĩnh, ${seen.size} loại cảnh ${w.errs[0] || ''}`);
  const kinds = w.eval(`JSON.stringify(['room_nha','cafe','sidewalk','biahoi','lake','library','mall','lobby'].map(k => { const sp = liveSpec({ id:'activity' }, { bg:k, npc: k === 'cafe' ? 'linh' : null }, null); return sp ? sp.pose : null; }))`);
  check('Mỗi địa điểm có tư thế riêng', kinds === '["idle","seat","idle","idle","run","idle","shop","wait"]', kinds);
  w.eval('window.matchMedia = () => ({ matches:true })'); w.close(); }

console.log(fail ? `\n${fail} mục KHÔNG đạt` : '\nTất cả đều đạt');
process.exit(fail ? 1 : 0);
