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
  w.eval(`S.habit = { meal:'rice', lunchWork:'team', bed:23.5, work:'careful' }; S.job = { co:'hotay', salary:10000000, start:3 }; S.deck = shuffle(TASKS.map(t => t.id)); OFFICE_BAL.ABSENT = 0; S.day = 8; S.slot = 'night'; S.queue = []; S.cur = null; startDay();`);
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

// 9. Động tác và dọn dẹp (v10): mỗi trạng thái có động tác; chuyển cảnh thì không còn lệnh hẹn giờ nào của cảnh cũ
{ const w = mk(); start(w, 'tro'); const d = w.document;
  w.eval(`window.matchMedia = () => ({ matches:false }); S.job = { co:'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.day = 9; S.slot = 'morning'; const box = document.querySelector('#stage'); box.innerHTML = '<div class="panel stage">' + stageSVG('x') + '</div>'; stageMount(box, 'work', {});`);
  const r = JSON.parse(w.eval(`JSON.stringify({ timers:stageTimers.size, states:[...document.querySelectorAll('.stage .actor')].map(e => e.dataset.state + '/' + e.querySelector('.cb').getAttribute('class')), parts:['cb-legL','cb-shin','cb-say','cb-lips'].map(c => document.querySelectorAll('.stage .actor .' + c).length), desks:document.querySelectorAll('.stage .desk .scr.on').length })`));
  check('Năm người đang ở trạng thái làm việc với động tác gõ phím, màn hình sáng', r.states.length === 5 && r.states.every(s => s === 'work/cb cb-idle act-type') && r.desks === 5, r.states[0]);
  check('Nhân vật có đủ khớp chân và miệng nói', r.parts.join() === '5,10,5,5', r.parts.join());
  check('Sân khấu đang chạy có lệnh hẹn giờ, dừng thì hủy sạch', r.timers > 0 && w.eval('stageStop(), stageTimers.size') === 0, r.timers + ' lệnh');
  const acts = w.eval(`Object.values(STATE_ACT).filter(Boolean).join()`);
  const css = require('fs').readFileSync(require('path').join(__dirname, '..', 'css', 'dong-tac.css'), 'utf8');
  const missing = [...new Set(acts.split(',').concat(['act-run','act-sitdown','act-standup','act-ride','act-getoff','act-eat','act-phone','act-sleep']))].filter(a => !css.includes('.' + a));
  check('Mọi động tác được dùng đều có định nghĩa trong dong-tac.css', missing.length === 0, missing.join());
  w.eval('window.matchMedia = () => ({ matches:true })'); w.close(); }

// 10. Tính cách, lịch động, xin nghỉ phép (v11)
{ const w = mk(); start(w, 'tro'); const d = w.document;
  w.eval(`S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.slot = 'morning'; S.stat.workDays = 5;`);
  const r = JSON.parse(w.eval(`(() => { const n = k => { let v = 0, c = 0; for (let i = 0; i < 300; i++) { const p = officePlan(k, COLLEAGUES); c += p.list.length; v += p.list.filter(b => b === 'visit' || b.startsWith('chat')).length; } return [c / 300, v / 300]; };
    const two = [0, 1].map(() => { OFFICE_DAY = null; return JSON.stringify(officeDay().plans); });
    return JSON.stringify({ mai:n('mai'), dung:n('dung'), khac: two[0] !== two[1] }); })()`));
  check('Chị Mai (hòa đồng) chủ động giao tiếp nhiều hơn hẳn anh Dũng (ít nói)', r.mai[1] > r.dung[1] * 3 && r.mai[0] > r.dung[0], `Mai ${r.mai[1].toFixed(1)} lần/buổi, Dũng ${r.dung[1].toFixed(1)} lần/buổi`);
  check('Lịch của hai ngày không giống hệt nhau', r.khac);
  const t = JSON.parse(w.eval(`(() => { S.lateToday = true; let late = 0; for (let i = 0; i < 30; i++) { lastTalk = {}; if (/sớm hơn/.test(pickTalk('boss').lines[0])) late++; } const a = late >= 7 ? 'Mai đến sớm hơn nhé em. (' + late + '/30 lần)' : 'chỉ ' + late + '/30 lần'; S.lateToday = false; S.rel.boss = 80; lastTalk = {}; const b = []; for (let i = 0; i < 12; i++) b.push(pickTalk('boss').lines[0]); S.rel.boss = 30; lastTalk = {}; const c = []; for (let i = 0; i < 12; i++) c.push(pickTalk('boss').lines[0]); return JSON.stringify({ a, b:[...new Set(b)], c:[...new Set(c)] }); })()`));
  check('Câu nói phụ thuộc chuyện vừa xảy ra và độ thân', /sớm hơn/.test(t.a) && t.b.some(x => /yên tâm/.test(x)) && t.c.some(x => /chủ động hơn/.test(x)) && !t.c.some(x => /yên tâm/.test(x)), t.a);
  const b0 = w.eval('S.rel.mai = 50; S.flags.chatBond = null; for (let i = 0; i < 10; i++) chatBond("mai"); S.rel.mai');
  check('Trò chuyện làm thân hơn rất nhẹ, có giới hạn mỗi ngày', b0 === 53, 'từ 50 lên ' + b0);
  const ev = JSON.parse(w.eval(`JSON.stringify((() => { const D = officeForce('meeting', 3000); return { id:D.event.id, who:D.event.who, phase:D.event.phase, plans:Object.keys(D.plans).length }; })())`));
  check('Sự kiện văn phòng được chèn vào ngày, có danh sách người tham gia', ev.id === 'meeting' && ev.who[0] === 'boss' && ev.who.length === 3 && ev.phase === 'pending' && ev.plans === 4, JSON.stringify(ev));
  w.close(); }

// 11. Hệ thống nghỉ phép (v12.1): báo nghỉ, ngày công, tiền lương, lịch làm việc
{ const w = mk(); start(w, 'tro'); const d = w.document;
  const reset = `S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.slot = 'evening'; S.stat.workDays = 5; S.unfinished = null; S.bugs = []; S.leaves = []; S.leave = null; S.leavePending = null; S.rel.boss = 60; S.rel.phong = 50; S.health = 75; S.energy = 70; S.flags.review = 'ok'; S.flags.fuel = null; S.cur = { id:'activity', arg:'evening' }; S.queue = [];`;
  const J = code => JSON.parse(w.eval(`(() => { ${reset} ${code} })()`));
  const U = `(f, t, r) => leaveSubmit({ type:'unpaid', from:f, to:t === undefined ? f : t, reason:r || 'Em có việc cá nhân ạ' })`;
  // thử việc = đang hưởng lương 85%: một định nghĩa duy nhất
  let r = J(`const o = {}; for (const x of [3, 46, 47, 56]) o[x] = inProbation(x); return JSON.stringify({ o, l12:payFor(56).rate, l1:payFor(87).rate, phep46:leaveBalance(46).earned, phep47:leaveBalance(47).earned, phep78:leaveBalance(78).earned });`);
  check('Thử việc trùng với lương 85%: tháng 11 và 12 là thử việc, từ 1/1 là chính thức', r.o[3] && r.o[46] && !r.o[47] && !r.o[56] && r.l12 === .85 && r.l1 === 1, JSON.stringify(r.o));
  check('Ngày phép chỉ được cộng khi đã chính thức, vào ngày 1 mỗi tháng', r.phep46 === 0 && r.phep47 === 1 && r.phep78 === 2, `31/12: ${r.phep46}, 1/1: ${r.phep47}, 1/2: ${r.phep78}`);
  // nghỉ một ngày khi đang thử việc: chỉ là báo cho chị Hạnh, không tính công
  r = J(`const U = ${U}; const blk = leaveBlock('annual'), p0 = payFor(25).days, m0 = S.money; leaveSubmit({ type:'annual', from:10, to:10, reason:'x' }); const a1 = !!leaveOn(10); U(10, 10, 'Em không được khỏe ạ');
    return JSON.stringify({ blk, a1, ok:!!leaveOn(10), pend:!!S.leavePending, paid:leaveOn(10).paid, work:isWorkday(10), next:isWorkday(11), p:[p0, payFor(25).days], money:S.money === m0, rel:S.rel.boss, msg:S.phone.threads.boss.slice(-1)[0].t });`);
  check('Thử việc: không có nghỉ phép; báo nghỉ một ngày (lý do “không khỏe”) được ghi nhận ngay, không bị xét lý do', /thử việc/.test(r.blk) && !r.a1 && r.ok && !r.pend && /biết rồi/.test(r.msg), r.msg);
  check('Ngày nghỉ đó không đi làm, không tính công (trừ đúng 1 ngày), hôm sau đi làm lại', !r.work && r.next && r.paid === false && r.p[1] === r.p[0] - 1 && r.money && r.rel === 59, `ngày công ${r.p[0]} → ${r.p[1]}`);
  // nghỉ hai ngày liên tiếp: một đơn hay hai đơn đều cho cùng kết quả, mỗi ngày tính đúng một lần
  r = J(`const U = ${U}; const p0 = payFor(25).days; U(10, 11); const one = payFor(25).days, off1 = payFor(25).off; S.leaves = []; U(10); U(11); return JSON.stringify({ p0, one, off1, two:payFor(25).days, w:[isWorkday(10), isWorkday(11), isWorkday(12)] });`);
  check('Nghỉ hai ngày liên tiếp: trừ đúng 2 ngày công, dù báo bằng một đơn hay hai đơn', r.one === r.p0 - 2 && r.off1 === 2 && r.two === r.one && r.w.join() === 'false,false,true', `${r.p0} → ${r.one} (một đơn), ${r.two} (hai đơn)`);
  // nghỉ nhiều lần trong một tháng
  r = J(`const U = ${U}; const p0 = payFor(25).days, rel = []; for (const x of [10, 12, 15]) { const b = S.rel.boss; U(x); rel.push(b - S.rel.boss); } return JSON.stringify({ p0, p1:payFor(25).days, rel, n:S.leaves.length });`);
  check('Nghỉ ba lần trong một tháng: cả ba đều được ghi nhận, trừ 3 ngày công; nghỉ dồn dập thì chị Hạnh kém vui hơn', r.n === 3 && r.p1 === r.p0 - 3 && r.rel.join() === '1,2,2', `quan hệ giảm ${r.rel.join(', ')}`);
  // đơn vắt qua hai tháng: mỗi tháng trừ đúng phần của mình
  r = J(`const U = ${U}; S.day = 13; const a0 = payFor(25).days, b0 = payFor(56).days; U(15, 16); return JSON.stringify({ a:a0 - payFor(25).days, b:b0 - payFor(56).days });`);
  check('Nghỉ 30/11 và 1/12: lương tháng 11 trừ 1 ngày, lương tháng 12 trừ 1 ngày', r.a === 1 && r.b === 1);
  // nghỉ phép ngay sau khi hết thử việc
  r = J(`const U = ${U}; S.day = 46; const blkNow = inProbation(), blk = leaveBlock('annual'), p0 = payFor(87).days; leaveSubmit({ type:'annual', from:50, to:50, reason:'x' }); const L = leaveOn(50);
    const left = leaveBalance(50).left; leaveSubmit({ type:'annual', from:51, to:51, reason:'x' }); const second = !!leaveOn(51), msg = S.phone.threads.boss.slice(-1)[0].t; U(51);
    return JSON.stringify({ blkNow, blk, ok:!!L, paid:L && L.paid, same:payFor(87).days === p0 - 1, days:[p0, payFor(87).days], left, second, msg, third:leaveOn(51) && leaveOn(51).paid });`);
  check('Ngày 31/12 (còn thử việc) báo nghỉ phép cho 4/1 (đã chính thức): được, có lương', r.blkNow && r.blk === '' && r.ok && r.paid === true, r.blk || 'dùng được');
  check('Hết ngày phép thì đơn nghỉ phép không được nhận; báo nghỉ không lương thay thế', r.left === 0 && !r.second && /không lương/.test(r.msg) && r.third === false && r.days[1] === r.days[0] - 1, r.msg);
  // nghỉ phép vắt qua cuối tuần
  r = J(`S.job.start = -40; S.day = 52; const b0 = leaveBalance(54).left, p0 = payFor(87).days; leaveSubmit({ type:'annual', from:54, to:leaveEnd(54, 2), reason:'x' }); const L = leaveOn(54);
    return JSON.stringify({ b0, to:L && L.to, used:leaveBalance(57).used, days:[54, 55, 56, 57, 58].map(x => isDayOff(x) ? 'ct' : isWorkday(x) ? 'làm' : 'nghỉ'), same:payFor(87).days === p0 });`);
  check('Nghỉ phép 2 ngày vắt qua cuối tuần: chỉ trừ 2 ngày phép, cuối tuần không tính, vẫn đủ công', r.b0 === 2 && r.to === 57 && r.used === 2 && r.days.join() === 'nghỉ,ct,ct,nghỉ,làm' && r.same, r.days.join());
  // bàn giao: nghỉ dài hoặc đang có việc dở
  r = J(`const U = ${U}; S.day = 11; U(12, leaveEnd(12, 3)); const pend = S.leavePending && S.leavePending.kind, none = !leaveOn(12), n0 = leaveReplies().length; leaveReply(0);
    const L = leaveOn(12), days = []; for (let x = 12; x <= 17; x++) days.push(isDayOff(x) ? 'ct' : isWorkday(x) ? 'làm' : 'nghỉ');
    const q = []; for (let x = 12; x <= 16; x++) { S.day = x - 1; S.slot = 'night'; S.queue = []; S.cur = null; S.fast = { from:x, until:x }; startDay(); q.push([S.cur, ...S.queue].some(z => z && ['cut','task','standup'].includes(z.id))); S.fast = null; }
    return JSON.stringify({ pend, none, n0, hand:L && L.handover, days, q, relP:S.rel.phong });`);
  check('Nghỉ ba ngày: phải bàn giao rồi đơn mới được ghi nhận', r.pend === 'handover' && r.none && r.n0 === 3 && r.hand === 'phong' && r.relP === 49, 'bàn giao cho ' + r.hand);
  check('Cả kỳ nghỉ, kể cả vắt qua cuối tuần, không ngày nào quay lại lịch đi làm', r.days.join() === 'nghỉ,ct,ct,nghỉ,nghỉ,làm' && r.q.every(x => x === false), r.days.join());
  r = J(`const U = ${U}; S.unfinished = 'Sửa nút Đặt hàng'; U(10); const pend = !!S.leavePending; leaveReply(2); return JSON.stringify({ pend, off:!leaveOn(10) && !S.leavePending, still:S.unfinished });`);
  check('Đang có việc dở thì nghỉ một ngày cũng phải bàn giao; chọn không nghỉ nữa thì không có đơn nào', r.pend && r.off && r.still === 'Sửa nút Đặt hàng');
  // yêu cầu bàn giao bị bỏ quên: hết hiệu lực, không bao giờ ghi đơn vào quá khứ
  r = J(`const U = ${U}; S.day = 11; U(12, leaveEnd(12, 3)); S.day = 11; S.slot = 'night'; S.queue = []; S.cur = null; S.fast = { from:12, until:12 }; startDay(); S.fast = null;
    const gone = !S.leavePending, work = isWorkday(12); S.day = 15; S.leavePending = { kind:'handover', req:{ type:'unpaid', from:12, to:12, reason:'x' }, asked:11 }; const p0 = payFor(25).days; leaveReply(0);
    return JSON.stringify({ gone, work, past:S.leaves.length, same:payFor(25).days === p0, msg:S.phone.threads.boss.slice(-1)[0].t });`);
  check('Chưa bàn giao mà ngày nghỉ đã tới: yêu cầu hết hiệu lực, hôm đó vẫn đi làm', r.gone && r.work, r.msg);
  check('Trả lời một yêu cầu đã quá hạn: không ghi đơn vào quá khứ, lương không bị trừ', r.past === 0 && r.same);
  // báo nghỉ ngay sáng hôm nay
  w.eval(`${reset} S.money = 1000000; S.day = 9; S.slot = 'night'; S.queue = []; S.cur = null; startDay();`);
  r = JSON.parse(w.eval(`(() => { const id0 = S.cur.id, m0 = S.money, rs = leaveRanges('unpaid').map(x => x.from), b0 = S.rel.boss; leaveSubmit({ type:'unpaid', from:S.day, to:S.day, reason:'Em không được khỏe ạ' });
    return JSON.stringify({ id0, has:rs.includes(S.day), cur:S.cur && S.cur.id, work:isWorkday(), fuel:S.money - m0, rel:b0 - S.rel.boss, xang:S.notes.some(n => /Xăng/.test(n)) }); })()`));
  check('Sáng ngủ dậy báo nghỉ hôm nay: ngày đó thành ngày ở nhà, tiền xăng được trả lại, báo sát giờ thì chị Hạnh kém vui hơn', r.id0 === 'wake' && r.has && r.cur === 'activity' && !r.work && r.fuel === 15000 && !r.xang && r.rel === 2 && !w.errs.length, `cảnh ${r.cur}, hoàn ${r.fuel}đ ${w.errs[0] || ''}`);
  // lưu và tải lại
  w.eval(`${reset} S.day = 11; leaveSubmit({ type:'unpaid', from:12, to:leaveEnd(12, 3), reason:'x' }); save();`);
  let w2 = mk(w.localStorage.getItem('lcs-tuan-dau-tien-v6'));
  r = JSON.parse(w2.eval(`S = load(); migrate(); JSON.stringify({ kind:S.leavePending && S.leavePending.kind, n:leaveReplies().length, none:!leaveOn(12) })`));
  check('Lưu rồi tải lại khi đang chờ bàn giao: yêu cầu còn nguyên, chưa có đơn nào', r.kind === 'handover' && r.n === 3 && r.none && !w2.errs.length); w2.close();
  w.eval(`leaveReply(1); S.day = 12; save();`); w2 = mk(w.localStorage.getItem('lcs-tuan-dau-tien-v6'));
  r = JSON.parse(w2.eval(`S = load(); migrate(); JSON.stringify({ L:S.leaves.map(L => [L.type, L.from, L.to, L.paid, L.handover]), w:[12, 15, 16, 17].map(x => isWorkday(x)), off:[payFor(25).off, payFor(56).off] })`));
  check('Lưu rồi tải lại giữa kỳ nghỉ: đơn, lịch làm việc và ngày công đều đúng', JSON.stringify(r.L) === '[["unpaid",12,16,false,"dung"]]' && r.w.join() === 'false,false,false,true' && r.off.join() === '2,1' && !w2.errs.length, JSON.stringify(r)); w2.close();
  // đi làm lại
  r = J(`S.unfinished = 'Sửa nút Đặt hàng'; S.leaves = [{ id:'t', type:'unpaid', from:10, to:12, paid:false, status:'approved' }]; leaveHandover(S.leaves[0], 'phong'); const keep = Math.random; Math.random = () => 0;
    S.day = 14; S.slot = 'night'; S.queue = []; S.cur = null; S.energy = 60; S.fast = { from:15, until:15 }; startDay(); Math.random = keep; S.fast = null;
    return JSON.stringify({ day:S.day, flag:S.flags.backFromLeave, talk:(() => { let n = 0; for (let i = 0; i < 20; i++) { lastTalk = {}; if (/nghỉ/.test(pickTalk('phong').lines[0])) n++; } return n; })(), notes:S.notes.join(' | ') });`);
  check('Đi làm lại sau kỳ nghỉ dài: việc bàn giao bị sót thành lỗi, phải bắt nhịp lại, đồng nghiệp nhắc chuyện vừa nghỉ', r.day === 15 && /để sót lỗi/.test(r.notes) && /bắt nhịp/.test(r.notes) && r.flag === 15 && r.talk >= 8, `Phong nhắc ${r.talk}/20 lần`);
  // hoạt động cả ngày
  w.eval(`${reset} S.leaves = [{ id:'t2', type:'unpaid', from:10, to:10, paid:false, status:'approved' }]; S.money = 2e6; S.day = 9; S.slot = 'night'; S.queue = []; S.cur = null; startDay();`);
  d.querySelector('#stage .choice').click();
  const home = [...d.querySelectorAll('#stage .choice.tile')].find(b => /Về quê/.test(b.getAttribute('aria-label')));
  const m0 = w.eval('S.money'), f0 = w.eval('S.rel.family'); if (home) home.click(); if (d.querySelector('#next')) d.querySelector('#next').click();
  const seen = []; for (let i = 0; i < 40 && w.eval('S.day') === 10; i++) { seen.push(w.eval('S.cur ? S.cur.id : "kq"')); const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; } const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; } const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]') && !b.textContent.includes('Tua đến')); if (!ch.length) break; ch[0].click(); }
  check('Ngày nghỉ: về quê cả ngày tốn tiền xe, thân hơn với bố mẹ, chiều và tối không còn giờ rảnh', !!home && w.eval('S.money') <= m0 - 180000 && w.eval('S.rel.family') > f0 && !seen.includes('activity') && !w.errs.length, seen.join(',') + (w.errs[0] || ''));
  // bản lưu cũ
  r = J(`S.leaves = null; S.leave = { 10:true }; const p0 = 9; const on = !!leaveOn(10); S.leaves.push({ id:'s', type:'sick', from:11, to:11, paid:true, status:'approved' }); return JSON.stringify({ on, work:[isWorkday(10), isWorkday(11)], pay:payFor(25).days, line:(() => { S.day = 11; return todayLine(); })() });`);
  check('Đơn của bản v11 và v12 (kể cả nghỉ ốm cũ) vẫn có hiệu lực và không làm đổi lương', r.on && r.work.join() === 'false,false' && r.pay === 9 && /nghỉ ốm/.test(r.line), r.line);
  w.close(); }

console.log(fail ? `\n${fail} mục KHÔNG đạt` : '\nTất cả đều đạt');
process.exit(fail ? 1 : 0);
