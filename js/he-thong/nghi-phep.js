/* =========================================================
   NGHỈ PHÉP (v12)
   Hệ thống này chỉ trả lời một câu: "hôm nay có phải đi làm không, và vì sao".
   Nó quản lý đơn nghỉ, số ngày phép, việc bàn giao và ảnh hưởng tới lương.
   Nó KHÔNG biết người chơi làm gì trong ngày nghỉ: ngày nghỉ là một ngày rảnh như cuối tuần,
   dùng chung màn chọn việc lúc rảnh. Du lịch sau này sẽ là một hoạt động của ngày rảnh, không dính tới đơn nghỉ.
   ========================================================= */
const LEAVE = {
  PER_MONTH: 1,             // mỗi tháng làm việc tích lũy được chừng này ngày phép (mọi công ty như nhau)
  SICK_PAID: 1,             // số ngày nghỉ ốm có lương mỗi tháng; quá thì tính như nghỉ không lương
  SICK_HEALTH: 50,          // sức khỏe dưới mức này (hoặc năng lượng dưới SICK_ENERGY, hoặc đang dư âm bia) mới xin nghỉ ốm được
  SICK_ENERGY: 25,
  MAX_DAYS: 5,              // một đơn nghỉ nhiều nhất chừng này ngày làm việc
  LONG: 3,                  // nghỉ từ chừng này ngày làm việc là "nghỉ dài": phải bàn giao, đi làm lại phải bắt nhịp
  APPROVE: 45, COUNTER: 25, // điểm xét duyệt từ APPROVE trở lên: duyệt; từ COUNTER: đề xuất đổi ngày; thấp hơn: từ chối
  EARLY_DAYS: 3, EARLY_BONUS: 15,   // xin trước từ chừng này ngày thì dễ được duyệt hơn
  PER_DAY_PENALTY: 8,       // mỗi ngày nghỉ thêm làm khó duyệt hơn
  UNPAID_BONUS: 10,         // nghỉ không lương dễ được duyệt hơn
  RECENT_DAYS: 10, RECENT_PENALTY: 20,   // vừa nghỉ trong vòng chừng này ngày thì khó duyệt hơn
  REL_COST: 1, REL_COST_LONG: 2,    // xin nghỉ làm chị Hạnh hơi kém vui
  FAKE_SICK: 2,             // xin nghỉ ốm khi vẫn khỏe: mất chừng này điểm quan hệ
  HANDOVER: { phong:{ rel:1, bug:.3 }, dung:{ rel:3, bug:.08 } },   // bàn giao cho ai: người đó phiền đến đâu, xác suất việc bị làm sai
  CATCH_UP_ENERGY: 8,       // ngày đầu đi làm lại sau kỳ nghỉ dài: tốn chừng này năng lượng để bắt nhịp
  CAUGHT: .35,              // nghỉ ốm mà ra ngoài chơi: xác suất bị đồng nghiệp bắt gặp
  CAUGHT_REL: 6,
};
const LEAVE_TYPE = {
  annual: { name:'Nghỉ phép', icon:'🏖️', paid:true },
  sick:   { name:'Nghỉ ốm', icon:'🤒', paid:true },
  unpaid: { name:'Nghỉ không lương', icon:'📝', paid:false },
};
const LEAVE_REASON = {
  annual: ['Em có việc gia đình ạ', 'Em về quê ạ', 'Em muốn nghỉ ngơi một chút ạ'],
  unpaid: ['Em có việc gia đình ạ', 'Em về quê ạ', 'Em có việc cá nhân cần giải quyết ạ'],
  sick:   ['Em bị sốt, mệt ạ', 'Em đau đầu quá ạ', 'Em đau bụng ạ'],
};

/* ----- Tra cứu ----- */
function leaveList(){
  if (!S.leaves) S.leaves = [];
  if (S.leave) { Object.keys(S.leave).forEach(d => S.leaves.push({ id:'cu-' + d, type:'annual', from:+d, to:+d, paid:true, status:'approved' })); S.leave = null; }   // đơn của bản v11
  return S.leaves;
}
// Hôm đó có nằm trong một đơn nghỉ đã duyệt không (trả về đơn, hoặc undefined)
function leaveOn(d = S.day){ return S && (S.leaves || S.leave) ? leaveList().find(L => L.status === 'approved' && d >= L.from && d <= L.to) : undefined; }
// Còn trong thời gian thử việc không (cùng cách tính với bảng lương)
function inProbation(d = S.day){ if (!S.job) return true; const x = dateOf(d), s = dateOf(S.job.start); return (x.getFullYear() - s.getFullYear()) * 12 + x.getMonth() - s.getMonth() <= FIN.PROBATION_MONTHS; }
const leaveDays = (a, b) => { let n = 0; for (let d = a; d <= b; d++) if (!isDayOff(d)) n++; return n; };     // số ngày làm việc trong khoảng (cuối tuần, lễ không tính)
// Ngày phép: tích lũy mỗi tháng, trừ đi số ngày phép đã dùng
function leaveBalance(){
  if (!S.job) return { earned:0, used:0, left:0 };
  const x = dateOf(S.day), s = dateOf(S.job.start), months = (x.getFullYear() - s.getFullYear()) * 12 + x.getMonth() - s.getMonth() + 1;
  const used = leaveList().filter(L => L.type === 'annual' && L.status === 'approved').reduce((n, L) => n + leaveDays(L.from, L.to), 0);
  return { earned:months * LEAVE.PER_MONTH, used, left:Math.max(0, months * LEAVE.PER_MONTH - used) };
}
// Số ngày làm việc không được tính lương trong khoảng [a, b] (nghỉ không lương, nghỉ ốm quá số ngày có lương)
function unpaidIn(a, b){
  if (!S || !(S.leaves || S.leave)) return 0;
  let n = 0; for (const L of leaveList()) if (L.status === 'approved' && L.paid === false) for (let d = Math.max(a, L.from); d <= Math.min(b, L.to); d++) if (!isDayOff(d)) n++;
  return n;
}
const sickNow = () => S.health < LEAVE.SICK_HEALTH || S.energy < LEAVE.SICK_ENERGY || !!S.flags.hangoverToday;
function reviewDay(d){ return !!S.job && !S.flags.review && d >= BAL.REVIEW_DAY && dayInfo(d).wd === 5; }
// Ngày kết thúc của một kỳ nghỉ bắt đầu từ ngày from, dài n ngày làm việc (bỏ qua cuối tuần và lễ ở giữa)
function leaveEnd(from, n){ let d = from, c = 0; for (;;) { if (!isDayOff(d)) c++; if (c >= n) return d; d++; } }
const rangeTxt = (a, b) => a === b ? `ngày ${fmtD(a)}` : `từ ${fmtD(a)} đến hết ${fmtD(b)}`;

/* ----- Các loại nghỉ và khoảng ngày có thể chọn ----- */
function leaveCan(){ return !!S.job && S.day >= S.job.start && S.day < LAST_DAY; }
// Vì sao một loại nghỉ chưa dùng được (chuỗi rỗng nếu dùng được)
function leaveBlock(type){
  if (type === 'annual') { if (inProbation()) return 'Hết thử việc mới dùng được'; if (!leaveBalance().left) return 'Hết ngày phép'; }
  if (type === 'sick' && !sickNow()) return 'Chỉ xin được khi thật sự không khỏe';
  return '';
}
function leaveRanges(type){
  const out = [], today = S.day, add = (from, n, label) => { const to = leaveEnd(from, n); if (to <= LAST_DAY && !isDayOff(from)) out.push({ from, to, n, label }); };
  const next = d => { let x = d + 1; while (isDayOff(x)) x++; return x; }, t1 = next(today), t2 = next(t1);
  if (type === 'sick') {
    if (isWorkday(today) && S.slot === 'morning' && S.cur && S.cur.id === 'wake') add(today, 1, `Hôm nay (${fmtD(today)})`);
    add(t1, 1, `${dayInfo(t1).dow} ${fmtD(t1)}`); if (isWorkday(today) && S.slot === 'morning' && S.cur && S.cur.id === 'wake') add(today, 2, `Hôm nay và ${dayInfo(t1).dow.toLowerCase()}`);
    return out;
  }
  const max = type === 'annual' ? Math.min(LEAVE.MAX_DAYS, leaveBalance().left) : LEAVE.MAX_DAYS;
  add(t1, 1, `${dayInfo(t1).dow} ${fmtD(t1)}, một ngày`);
  add(t2, 1, `${dayInfo(t2).dow} ${fmtD(t2)}, một ngày`);
  if (max >= 2) add(t1, 2, `Hai ngày, ${rangeTxt(t1, leaveEnd(t1, 2))}`);
  if (max >= 3) add(t1, 3, `Ba ngày, ${rangeTxt(t1, leaveEnd(t1, 3))}`);
  let mon = today + 1; while (dayInfo(mon).wd !== 1) mon++;
  if (max >= 5 && mon > t1) add(mon, 5, `Cả tuần sau, ${rangeTxt(mon, leaveEnd(mon, 5))}`);
  return out;
}

/* ----- Chị Hạnh xét đơn -----
   Trả về { verdict, text }: 'approve' | 'handover' (duyệt nhưng phải bàn giao) | 'counter' (đề xuất đổi ngày, kèm offer) | 'reject' */
function leaveDecide(req){
  const { type, from, to } = req, n = leaveDays(from, to), list = leaveList();
  if (list.some(L => L.status === 'approved' && from <= L.to && to >= L.from)) return { verdict:'reject', text:'Mấy ngày đó em có đơn nghỉ rồi mà.' };
  if (type === 'sick') {
    if (!sickNow()) return { verdict:'reject', text:'Trông em vẫn khỏe mà? Ráng đi làm nhé.', rel:-LEAVE.FAKE_SICK };
    return { verdict:'approve', text: from === S.day ? 'Ừ, em nghỉ đi, uống thuốc vào nhé. Việc để mọi người lo.' : 'Em nghỉ cho khỏe hẳn đi nhé.' };
  }
  if (type === 'annual' && inProbation()) return { verdict:'reject', text:'Em đang thử việc nên chưa có phép. Cần thì em xin nghỉ không lương nhé.' };
  if (type === 'annual' && leaveBalance().left < n) return { verdict:'reject', text:`Em chỉ còn ${leaveBalance().left} ngày phép thôi.` };
  if ((S.bugs || []).length) return { verdict:'reject', text:'Còn lỗi khách đang chờ, em sửa xong rồi mình tính nhé.' };
  for (let d = from; d <= to; d++) if (reviewDay(d)) {
    const nf = to + 1 + (isDayOff(to + 1) ? 2 : 0), off = { ...req, from:nextWork(to), to:leaveEnd(nextWork(to), n) };
    return off.to <= LAST_DAY ? { verdict:'counter', text:`Hôm ${fmtD(d)} chị có buổi nhận xét với em. Em nghỉ ${rangeTxt(off.from, off.to)} được không?`, offer:off } : { verdict:'reject', text:`Hôm ${fmtD(d)} chị có buổi nhận xét với em, em sắp xếp dịp khác nhé.` };
  }
  const recent = list.some(L => L.status === 'approved' && L.to >= S.day - LEAVE.RECENT_DAYS && L.to < from);
  const score = 50 + (S.rel.boss - 50) * .6 + (from - S.day >= LEAVE.EARLY_DAYS ? LEAVE.EARLY_BONUS : 0) - (n - 1) * LEAVE.PER_DAY_PENALTY + (type === 'unpaid' ? LEAVE.UNPAID_BONUS : 0) - (recent ? LEAVE.RECENT_PENALTY : 0);
  if (score >= LEAVE.APPROVE) {
    if (S.unfinished || n >= LEAVE.LONG) return { verdict:'handover', text: S.unfinished ? `Được em. Nhưng “${S.unfinished}” đang dở, em bàn giao lại trước khi nghỉ nhé.` : 'Được em. Nghỉ dài thế thì em bàn giao việc lại cho một bạn trong team nhé.' };
    return { verdict:'approve', text: type === 'unpaid' ? 'Ok em. Mấy ngày đó không tính công nhé.' : 'Ok em, nghỉ ngơi cho khỏe nhé.' };
  }
  if (score >= LEAVE.COUNTER) {
    const off = n > 1 ? { ...req, to:leaveEnd(from, 1) } : { ...req, from:nextWork(nextWork(from) - 1 + 1), to:nextWork(nextWork(from) - 1 + 1) };
    if (n === 1) { let d = from + 2; while (isDayOff(d) || reviewDay(d)) d++; off.from = off.to = d; }
    if (off.to <= LAST_DAY) return { verdict:'counter', text: n > 1 ? `Dạo này team đang căng, nghỉ ${n} ngày thì khó. Em nghỉ một ngày ${fmtD(off.from)} thôi được không?` : `Hôm đó team thiếu người. Em nghỉ ${dayInfo(off.from).dow.toLowerCase()} ${fmtD(off.from)} được không?`, offer:off };
  }
  return { verdict:'reject', text:'Dạo này team đang thiếu người, em ráng thêm ít hôm nhé.' };
}
function nextWork(d){ let x = d + 1; while (isDayOff(x)) x++; return x; }

/* ----- Ghi nhận đơn đã duyệt ----- */
function leaveGrant(req, handover){
  const n = leaveDays(req.from, req.to), mk = monthKey(req.from);
  let paid = LEAVE_TYPE[req.type].paid;
  if (req.type === 'sick') { const used = leaveList().filter(L => L.type === 'sick' && L.status === 'approved' && monthKey(L.from) === mk && L.paid !== false).reduce((s, L) => s + leaveDays(L.from, L.to), 0); paid = used + n <= LEAVE.SICK_PAID; }
  const L = { id:'L' + S.day + '-' + leaveList().length, type:req.type, from:req.from, to:req.to, reason:req.reason, paid, status:'approved', asked:S.day, handover:handover || null };
  leaveList().push(L);
  if (req.type !== 'sick') rel('boss', -(n >= LEAVE.LONG ? LEAVE.REL_COST_LONG : LEAVE.REL_COST));
  if (req.type === 'sick' && req.from === S.day && S.unfinished) { rel('phong', -1); note('Nghỉ ốm đột xuất: Phong phải gánh phần việc đang dở.'); S.unfinished = null; }
  memo(`${LEAVE_TYPE[req.type].name} ${rangeTxt(req.from, req.to)}`); note(`Đã được duyệt ${LEAVE_TYPE[req.type].name.toLowerCase()} ${rangeTxt(req.from, req.to)}${paid ? '' : ' (không tính công)'}.`);
  return L;
}
// Bàn giao việc cho một đồng nghiệp: họ hơi phiền, và việc có thể bị làm sai (lỗi quay lại khi bạn đi làm lại)
function leaveHandover(L, who){
  const H = LEAVE.HANDOVER[who]; L.handover = who; rel(who, -H.rel);
  L.handTitle = S.unfinished || 'phần việc bàn giao'; S.unfinished = null;
  note(`Đã bàn giao việc cho ${PEOPLE[who].name}.`);
}
// Gọi mỗi sáng: xử lý chuyện đi làm lại sau kỳ nghỉ
function leaveMorning(){
  if (!S.job || !isWorkday()) return;
  let p = S.day - 1; while (p > 0 && isDayOff(p)) p--;
  const L = leaveOn(p); if (!L || L.returned) return;
  L.returned = S.day; S.flags.backFromLeave = S.day;
  const n = leaveDays(L.from, L.to);
  if (L.handover && LEAVE.HANDOVER[L.handover] && chance(LEAVE.HANDOVER[L.handover].bug)) {
    S.bugs.push({ id:'hand-' + L.id, title:L.handTitle || 'phần việc bàn giao', due:S.day, handover:L.handover }); S.stat.bugsMade++;
    note(`${PEOPLE[L.handover].name} làm tiếp phần việc bàn giao nhưng để sót lỗi.`);
  }
  if (n >= LEAVE.LONG) { S.energy -= LEAVE.CATCH_UP_ENERGY; note(`Đi làm lại sau ${n} ngày nghỉ: mất cả buổi sáng đọc tin nhắn và bắt nhịp lại.`); }
}

/* ----- Giao diện: gửi đơn trong cuộc trò chuyện với chị Hạnh ----- */
let leaveDraft = null;
function openLeaveForm(step){
  if (!leaveCan()) return;
  if (!step) leaveDraft = {};
  const bal = leaveBalance(), D = leaveDraft, body = $('#dlgBody');
  const head = `<div class="ph-head"><button class="ghost sm" type="button" id="phBack">Quay lại</button><b class="ph-name">Xin nghỉ</b><button class="ghost sm" type="button" id="phClose">Đóng</button></div>`;
  let html = '';
  if (!D.type) {
    html = `<p class="muted">Ngày phép: đã tích lũy ${bal.earned}, đã dùng ${bal.used}${inProbation() ? '. Đang thử việc nên chưa dùng được phép.' : `, còn ${bal.left}.`}</p>` +
      Object.entries(LEAVE_TYPE).map(([k, T_]) => { const why = leaveBlock(k);
        return `<button class="choice" type="button" data-type="${k}" ${why ? 'disabled' : ''}><span class="ci" aria-hidden="true">${T_.icon}</span><span class="cb"><span class="cl">${T_.name}</span><span class="cd">${why || (k === 'annual' ? 'Có lương, trừ vào ngày phép' : k === 'sick' ? `Có lương ${LEAVE.SICK_PAID} ngày mỗi tháng, không trừ phép` : 'Không trừ phép, không tính công')}</span></span></button>`; }).join('');
  } else if (!D.from) {
    const rs = leaveRanges(D.type);
    html = `<p class="muted">${LEAVE_TYPE[D.type].name}: nghỉ khi nào?</p>` + (rs.length ? rs.map((r, i) => `<button class="choice" type="button" data-range="${i}"><span class="ci" aria-hidden="true">📅</span><span class="cb"><span class="cl">${r.label}</span></span></button>`).join('') : '<p class="ph-empty">Không còn ngày nào xin được.</p>');
  } else {
    html = `<p class="muted">${LEAVE_TYPE[D.type].name} ${rangeTxt(D.from, D.to)}. Lý do:</p>` + LEAVE_REASON[D.type].map((r, i) => `<button class="choice" type="button" data-reason="${i}"><span class="ci" aria-hidden="true">💬</span><span class="cb"><span class="cl">${r}</span></span></button>`).join('');
  }
  body.innerHTML = head + html;
  $('#phBack').addEventListener('click', () => { if (D.from) { D.from = D.to = null; openLeaveForm(1); } else if (D.type) { D.type = null; openLeaveForm(1); } else renderPhoneList(); });
  $('#phClose').addEventListener('click', () => closeDlg());
  body.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { D.type = b.dataset.type; openLeaveForm(1); }));
  body.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => { const r = leaveRanges(D.type)[+b.dataset.range]; D.from = r.from; D.to = r.to; openLeaveForm(1); }));
  body.querySelectorAll('[data-reason]').forEach(b => b.addEventListener('click', () => { D.reason = LEAVE_REASON[D.type][+b.dataset.reason]; leaveSubmit({ ...D }); }));
}
// Gửi đơn: tin nhắn đi, chị Hạnh trả lời, mở lại cuộc trò chuyện
function leaveSubmit(req){
  const before = snap(), n = leaveDays(req.from, req.to);
  pushMsg('boss', 'me', `Chị ơi, em xin ${LEAVE_TYPE[req.type].name.toLowerCase()} ${rangeTxt(req.from, req.to)}${n > 1 ? ` (${n} ngày)` : ''}. ${req.reason}.`);
  const r = leaveDecide(req);
  pushMsg('boss', 'boss', r.text);
  if (r.rel) rel('boss', r.rel);
  S.leavePending = null;
  if (r.verdict === 'approve') leaveGrant(req);
  else if (r.verdict === 'handover') S.leavePending = { kind:'handover', req };
  else if (r.verdict === 'counter') S.leavePending = { kind:'counter', req:r.offer };
  clampAll(); save(); updateHUD();
  openThread('boss', diffChips(before, snap()));
  if (r.verdict === 'approve' && req.from === S.day && S.cur && S.cur.id === 'wake' && S.phase === 'play') { closeDlg(); leaveToday(); }      // vừa được nghỉ ốm ngay hôm nay: xếp lại ngày
}
// Trả lời khi chị Hạnh đề xuất đổi ngày hoặc yêu cầu bàn giao
function leaveReplies(){
  const p = S.leavePending; if (!p) return [];
  if (p.kind === 'counter') return [
    { t:'Dạ vâng, em nghỉ hôm đó ạ.', run:() => { pushMsg('boss', 'boss', 'Ok em, chị ghi lại rồi.'); if (S.unfinished || leaveDays(p.req.from, p.req.to) >= LEAVE.LONG) { S.leavePending = { kind:'handover', req:p.req }; pushMsg('boss', 'boss', 'Nhớ bàn giao việc trước khi nghỉ nhé.'); } else { leaveGrant(p.req); S.leavePending = null; } } },
    { t:'Dạ thôi, em xin rút đơn ạ.', run:() => { pushMsg('boss', 'boss', 'Ừ, khi nào cần thì nói chị nhé.'); S.leavePending = null; } } ];
  return [
    ...Object.keys(LEAVE.HANDOVER).map(who => ({ t:`Em bàn giao cho ${who === 'dung' ? 'anh Dũng' : 'Phong'} ạ.`, run:() => { const L = leaveGrant(p.req); leaveHandover(L, who); pushMsg('boss', 'boss', who === 'dung' ? 'Ừ, Dũng làm thì chị yên tâm. Nhớ nói với Dũng một tiếng.' : 'Ừ, em dặn Phong kỹ vào nhé.'); S.leavePending = null; } })),
    { t:'Dạ thôi, em xin rút đơn ạ.', run:() => { pushMsg('boss', 'boss', 'Ừ, khi nào cần thì nói chị nhé.'); S.leavePending = null; } } ];
}
function leaveReply(i){
  const r = leaveReplies()[i]; if (!r) return; const before = snap();
  pushMsg('boss', 'me', r.t); r.run(); clampAll(); save(); updateHUD(); openThread('boss', diffChips(before, snap()));
}
// Được nghỉ ngay trong hôm nay (nghỉ ốm buổi sáng): bỏ lịch đi làm, xếp lại thành một ngày ở nhà
function leaveToday(){
  S.am = null; S.lateToday = false; S.lateMin = 0;
  S.queue = [{ id:'activity', arg:'morning' }]; S.cur = null; feedAdd(null, '🤒', 'Nhắn chị Hạnh xin nghỉ ốm hôm nay.');
  advance();
}

/* ----- Hoạt động cả ngày: chỉ có vào buổi sáng của một ngày không phải đi làm -----
   Mỗi hoạt động chiếm trọn ngày (span:'day'): buổi chiều và buổi tối không còn chọn việc khác.
   Du lịch sau này sẽ khai báo theo đúng kiểu này, với span dài hơn. */
const DAY_TRIP = { home:{ cost:180000 }, errand:{ cost:120000, days:30 }, friend:{ cost:250000, tungFree:.6, linhFree:.25 } };
const freeDay = () => S.slot === 'morning' && !isWorkday() && (isDayOff() || !!leaveOn()) && S.day !== S.ivDay && !(leaveOn() && leaveOn().type === 'sick');
// Hôm nay bạn nào rảnh để đi chơi cả ngày (cuối tuần thì cả hai; ngày thường tùy hôm)
function friendFree(){ if (isDayOff()) return S.rel.tung >= S.rel.linh ? 'tung' : 'linh'; const h = (S.day * 37 % 100) / 100; return h < DAY_TRIP.friend.tungFree ? 'tung' : h > 1 - DAY_TRIP.friend.linhFree ? 'linh' : null; }
const dayTrip = () => { S.flags.dayTrip = S.day; S.queue = S.queue.filter(r => r.id !== 'activity'); };
ACTS.push(
  { id:'trip_home', span:'day', icon:'🚌', label:'Về quê thăm bố mẹ, tối quay lại', slots:['morning'], cost:DAY_TRIP.home.cost, cond:() => freeDay() && S.bg !== 'nha',
    hints:['⏱ Cả ngày','🤝 +Bố mẹ','🙂 +8'],
    fx:() => { dayTrip(); rel('family', 12); S.mood += 8; S.energy -= 10; logMeal('home'); logMeal('home'); S.stat.calls++; memo('Về quê thăm bố mẹ');
      return { text:'Hai tiếng xe khách. Mẹ ra tận cổng đón, mâm cơm có đủ những món bạn thích. Bố không nói nhiều, chỉ gắp thức ăn cho bạn liên tục.', bg:'room_nha', npc:'family', npcExpr:'happy', meExpr:'happy' }; } },
  { id:'trip_errand', span:'day', icon:'🧾', label:'Giải quyết việc cá nhân: giấy tờ, bảo dưỡng xe', slots:['morning'], cost:DAY_TRIP.errand.cost, cond:() => freeDay() && !(S.flags.bikeFixed && S.day - S.flags.bikeFixed < DAY_TRIP.errand.days),
    hints:['⏱ Cả ngày','🛵 Xe đỡ hỏng vặt','🙂 −2'],
    fx:() => { dayTrip(); S.flags.bikeFixed = S.day; S.mood -= 2; S.energy -= 8; S.soft += 1;
      return { text:'Sáng xếp hàng làm giấy tờ, chiều ngồi chờ thay dầu, bơm lốp. Một ngày không có gì vui, nhưng danh sách việc tồn đọng đã ngắn hẳn.', bg:'mall' }; } },
  { id:'trip_friend', span:'day', icon:'🎡', label:'Đi chơi cả ngày với bạn', slots:['morning'], cost:DAY_TRIP.friend.cost, cond:() => freeDay() && !!friendFree(),
    hints:['⏱ Cả ngày','🤝 +Bạn thân','🙂 +12'],
    fx:() => { const k = friendFree(); dayTrip(); rel(k, 10); S.mood += 12; S.energy -= 14; S.soft += 1; S.flags.outLate = true; logMeal('bun'); memo(`Đi chơi cả ngày với ${PEOPLE[k].name}`);
      return k === 'tung' ? { text:'Tùng hôm nay cũng rảnh. Hai đứa lượn hết phố cổ, ăn bún chả, rồi ngồi trà đá đến tối. Tùng trình bày thêm ba kế hoạch làm giàu.', bg:'sidewalk', npc:'tung', npcExpr:'happy', meExpr:'happy' }
                         : { text:'Linh xin nghỉ một buổi học để đi cùng. Hai đứa đi bảo tàng, cà phê, rồi dạo hồ. Linh mang theo sách, nhưng không mở ra lần nào.', bg:'cafe', npc:'linh', npcExpr:'happy', meExpr:'happy' }; } },
  { id:'clinic', icon:'🩺', label:'Đi khám ở phòng khám gần nhà', slots:['morning','afternoon'], cost:150000, cond:() => !!leaveOn() && leaveOn().type === 'sick' && S.flags.clinic !== S.day,
    hints:['❤️ +6 Sức khỏe','⚡ −5'],
    fx:() => { S.flags.clinic = S.day; S.health += 6; S.energy -= 5; return 'Bác sĩ bảo bạn thiếu ngủ và ăn uống thất thường, kê vitamin và dặn nghỉ ngơi. Lời dặn nghe quen như lời mẹ.'; } },
);
Object.assign(ACT_SHORT, { trip_home:'Về quê cả ngày', trip_errand:'Việc cá nhân cả ngày', trip_friend:'Đi chơi cả ngày', clinic:'Đi khám' });
// Đang nghỉ ốm mà ra ngoài chơi: có thể bị đồng nghiệp bắt gặp
const SICK_OUT = ['cafe','trada','shop','run','hangout'];
function sickOuting(actId){
  const L = leaveOn(); if (!L || L.type !== 'sick' || !SICK_OUT.includes(actId) || S.flags.caught === S.day) return '';
  if (!chance(LEAVE.CAUGHT)) return '';
  S.flags.caught = S.day; rel('boss', -LEAVE.CAUGHT_REL); rel('mai', -2); memo('Nghỉ ốm đi chơi, bị chị Mai bắt gặp');
  return ' Trên đường về, bạn chạm mặt chị Mai. Chị nhìn bạn, nhìn cốc trà sữa trên tay bạn, rồi cười rất khó đoán: “Ốm mà vẫn khỏe nhỉ em.”';
}

/* ----- Đồng nghiệp nhắc tới việc bạn vừa nghỉ ----- */
TALKS.unshift(
  { who:'mai',   when:() => S.flags.backFromLeave === S.day, say:['Nghỉ vui không em?', 'Vui ạ, giờ thì hết vui rồi.'], fun:true },
  { who:'phong', when:() => S.flags.backFromLeave === S.day, say:['Ông nghỉ sướng thế, tôi gánh hộ đấy.', 'Nợ ông một cốc trà đá.'], fun:true },
  { who:'boss',  when:() => S.flags.backFromLeave === S.day, say:['Nghỉ xong rồi thì tăng tốc nhé em.', 'Dạ vâng ạ.'] },
  { who:'dung',  when:() => S.flags.backFromLeave === S.day, say:['Về rồi à. Việc trong nhóm chat.', 'Dạ.'] },
);
