/* =========================================================
   NGHỈ PHÉP (v12.1)
   Hệ thống này chỉ trả lời một câu: "hôm nay có phải đi làm không, và vì sao".
   Nó quản lý đơn nghỉ, số ngày phép, việc bàn giao và ảnh hưởng tới lương.
   Nó KHÔNG biết người chơi làm gì trong ngày nghỉ: ngày nghỉ là một ngày rảnh như cuối tuần,
   dùng chung màn chọn việc lúc rảnh. Du lịch sau này sẽ là một hoạt động của ngày rảnh, không dính tới đơn nghỉ.

   Nguyên tắc: xin nghỉ là BÁO cho cấp trên, lý do là chuyện riêng của người nghỉ. Game không xét lý do và không từ chối
   vì cảm tính; cái giá của việc nghỉ nằm ở hậu quả (ngày công, quan hệ, việc phải bàn giao).
   - Đang thử việc (đang hưởng lương 85%): mọi ngày nghỉ đều không tính công.
   - Đã chính thức: ngày 1 mỗi tháng được cộng 1 ngày phép (12 ngày mỗi năm). Nghỉ phép có lương; hết phép thì nghỉ không lương.
   ========================================================= */
const LEAVE = {
  PER_MONTH: 1,             // khi đã chính thức: ngày 1 mỗi tháng cộng chừng này ngày phép
  MAX_DAYS: 5,              // một lần báo nghỉ nhiều nhất chừng này ngày làm việc
  LONG: 3,                  // nghỉ từ chừng này ngày làm việc là "nghỉ dài": phải bàn giao, đi làm lại phải bắt nhịp
  REL_COST: 1,              // báo nghỉ làm chị Hạnh hơi kém vui
  REL_LONG: 1,              // nghỉ dài: thêm chừng này
  REL_LATE: 1,              // báo sát giờ (sáng hôm đó mới báo): thêm chừng này
  REL_OFTEN: 1,             // vừa nghỉ trong vòng RECENT_DAYS ngày lại nghỉ tiếp: thêm chừng này
  RECENT_DAYS: 10,
  HANDOVER: { phong:{ rel:1, bug:.3 }, dung:{ rel:3, bug:.08 } },   // bàn giao cho ai: người đó phiền đến đâu, xác suất việc bị làm sai
  CATCH_UP_ENERGY: 8,       // ngày đầu đi làm lại sau kỳ nghỉ dài: tốn chừng này năng lượng để bắt nhịp
};
const LEAVE_TYPE = {
  annual: { name:'Nghỉ phép', icon:'🏖️', paid:true },
  unpaid: { name:'Nghỉ không lương', icon:'📝', paid:false },
  sick:   { name:'Nghỉ ốm', icon:'🤒', paid:true, old:true },      // chỉ còn để đọc bản lưu của v12; không còn loại nghỉ này
};
// Lý do là chuyện riêng: chỉ để nhắn cho tự nhiên, không ảnh hưởng tới kết quả
const LEAVE_REASON = ['Em có việc gia đình ạ', 'Em về quê ạ', 'Em không được khỏe ạ', 'Em có việc cá nhân ạ'];

/* ----- Tra cứu ----- */
function leaveList(){
  if (!S.leaves) S.leaves = [];
  if (S.leave) { Object.keys(S.leave).forEach(d => S.leaves.push({ id:'cu-' + d, type:'unpaid', from:+d, to:+d, paid:true, status:'approved' })); S.leave = null; }   // đơn của bản v11: giữ nguyên là đã tính công
  return S.leaves;
}
// Hôm đó có nằm trong một đơn nghỉ không (trả về đơn, hoặc undefined)
function leaveOn(d = S.day){ return S && (S.leaves || S.leave) ? leaveList().find(L => L.status === 'approved' && d >= L.from && d <= L.to) : undefined; }
const monthsBetween = (d, d0) => { const x = dateOf(d), s = dateOf(d0); return (x.getFullYear() - s.getFullYear()) * 12 + x.getMonth() - s.getMonth(); };
// Ngày d còn trong thời gian thử việc không. Chỉ có MỘT định nghĩa, trùng với bảng lương:
// tháng làm việc nào được trả 85% thì tháng đó là thử việc (lương của một tháng được trả vào ngày 10 tháng sau).
function inProbation(d = S.day){ return !S.job || monthsBetween(d, S.job.start) < FIN.PROBATION_MONTHS; }
const leaveDays = (a, b) => { let n = 0; for (let d = a; d <= b; d++) if (!isDayOff(d)) n++; return n; };     // số ngày làm việc trong khoảng (cuối tuần, lễ không tính)
// Ngày phép tính đến ngày d: mỗi ngày 1 của một tháng đã chính thức thì được cộng, trừ đi số ngày phép đã dùng
function leaveBalance(d = S.day){
  if (!S.job) return { earned:0, used:0, left:0 };
  let earned = 0;
  for (let x = Math.max(1, S.job.start); x <= d; x++) if (dateOf(x).getDate() === 1 && !inProbation(x)) earned += LEAVE.PER_MONTH;
  const used = leaveList().filter(L => L.type === 'annual' && L.status === 'approved').reduce((n, L) => n + leaveDays(L.from, L.to), 0);
  return { earned, used, left:Math.max(0, earned - used) };
}
// Số ngày làm việc không được tính công trong khoảng [a, b]
function unpaidIn(a, b){
  if (!S || !(S.leaves || S.leave)) return 0;
  let n = 0; for (const L of leaveList()) if (L.status === 'approved' && L.paid === false) for (let d = Math.max(a, L.from); d <= Math.min(b, L.to); d++) if (!isDayOff(d)) n++;
  return n;
}
function reviewDay(d){ return !!S.job && !S.flags.review && d >= BAL.REVIEW_DAY && dayInfo(d).wd === 5; }
// Ngày kết thúc của một kỳ nghỉ bắt đầu từ ngày from, dài n ngày làm việc (bỏ qua cuối tuần và lễ ở giữa)
function leaveEnd(from, n){ let d = from, c = 0; for (;;) { if (!isDayOff(d)) c++; if (c >= n) return d; d++; } }
function nextWork(d){ let x = d + 1; while (isDayOff(x)) x++; return x; }
const rangeTxt = (a, b) => a === b ? `ngày ${fmtD(a)}` : `từ ${fmtD(a)} đến hết ${fmtD(b)}`;

/* ----- Các loại nghỉ và khoảng ngày có thể chọn ----- */
function leaveCan(){ return !!S.job && S.day >= S.job.start && S.day < LAST_DAY; }
// Sáng nay vừa ngủ dậy, chưa đi làm: còn kịp báo nghỉ ngay hôm nay
const leaveMorningOk = () => isWorkday(S.day) && S.slot === 'morning' && !!S.cur && S.cur.id === 'wake';
// Vì sao một loại nghỉ chưa dùng được (chuỗi rỗng nếu dùng được). Xét theo ngày nghỉ sớm nhất có thể xin.
function leaveBlock(type){
  if (type !== 'annual') return '';
  const first = leaveMorningOk() ? S.day : nextWork(S.day);
  if (inProbation(first)) return 'Đang thử việc: chưa có ngày phép';
  if (!leaveBalance(first).left) return 'Hết ngày phép';
  return '';
}
function leaveRanges(type){
  const out = [], today = S.day, t1 = nextWork(today), t2 = nextWork(t1);
  const add = (from, n, label) => { const to = leaveEnd(from, n); if (to > LAST_DAY || isDayOff(from)) return;
    if (type === 'annual' && (inProbation(from) || leaveBalance(from).left < n)) return;                         // phép: ngày nghỉ phải là ngày đã chính thức và còn đủ phép
    if (leaveList().some(L => L.status === 'approved' && from <= L.to && to >= L.from)) return;                  // trùng đơn đã có
    out.push({ from, to, n, label }); };
  if (leaveMorningOk()) add(today, 1, `Hôm nay (${fmtD(today)})`);
  add(t1, 1, `${dayInfo(t1).dow} ${fmtD(t1)}, một ngày`);
  add(t2, 1, `${dayInfo(t2).dow} ${fmtD(t2)}, một ngày`);
  add(t1, 2, `Hai ngày, ${rangeTxt(t1, leaveEnd(t1, 2))}`);
  add(t1, 3, `Ba ngày, ${rangeTxt(t1, leaveEnd(t1, 3))}`);
  let mon = today + 1; while (dayInfo(mon).wd !== 1) mon++;
  if (mon > t1) add(mon, LEAVE.MAX_DAYS, `Cả tuần sau, ${rangeTxt(mon, leaveEnd(mon, LEAVE.MAX_DAYS))}`);
  return out;
}

/* ----- Báo nghỉ -----
   Chị Hạnh không duyệt hay từ chối vì lý do; chỉ có các chặn mang tính sổ sách.
   Trả về { verdict, text }: 'ok' | 'handover' (phải bàn giao việc trước) | 'reject' (trùng đơn, hoặc không đủ ngày phép) */
function leaveDecide(req){
  const { type, from, to } = req, n = leaveDays(from, to);
  if (n < 1 || n > LEAVE.MAX_DAYS) return { verdict:'reject', text:'Em xem lại ngày giúp chị nhé.' };
  if (leaveList().some(L => L.status === 'approved' && from <= L.to && to >= L.from)) return { verdict:'reject', text:'Mấy ngày đó em đã báo nghỉ rồi mà.' };
  if (type === 'annual') {
    if (inProbation(from)) return { verdict:'reject', text:'Em đang thử việc nên chưa có ngày phép. Em cứ báo nghỉ không lương nhé.' };
    const left = leaveBalance(from).left;
    if (left < n) return { verdict:'reject', text: left ? `Em chỉ còn ${left} ngày phép thôi. Phần còn lại em báo nghỉ không lương nhé.` : 'Em hết ngày phép rồi. Em báo nghỉ không lương nhé.' };
  }
  if (S.unfinished || n >= LEAVE.LONG) return { verdict:'handover', text: S.unfinished ? `Ừ, chị biết rồi. “${S.unfinished}” đang dở, em bàn giao lại cho một bạn trước khi nghỉ nhé.` : 'Ừ, chị biết rồi. Nghỉ dài thế thì em bàn giao việc lại cho một bạn trong team nhé.' };
  const paid = type === 'annual';
  return { verdict:'ok', text: paid ? 'Ừ, chị biết rồi. Nghỉ ngơi cho khỏe nhé em.' : inProbation(from) ? 'Ừ, chị biết rồi. Đang thử việc nên hôm đó không tính công nhé em.' : 'Ừ, chị biết rồi. Hôm đó không tính công nhé em.' };
}

/* ----- Ghi nhận đơn ----- */
function leaveGrant(req, handover){
  const n = leaveDays(req.from, req.to), list = leaveList();
  const often = list.some(L => L.status === 'approved' && L.to >= req.from - LEAVE.RECENT_DAYS && L.to < req.from);
  const L = { id:'L' + S.day + '-' + list.length, type:req.type, from:req.from, to:req.to, reason:req.reason, paid:req.type === 'annual', status:'approved', asked:S.day, handover:handover || null };
  list.push(L);
  rel('boss', -(LEAVE.REL_COST + (n >= LEAVE.LONG ? LEAVE.REL_LONG : 0) + (req.from === S.day ? LEAVE.REL_LATE : 0) + (often ? LEAVE.REL_OFTEN : 0)));
  memo(`${LEAVE_TYPE[req.type].name} ${rangeTxt(req.from, req.to)}`); note(`Đã báo ${LEAVE_TYPE[req.type].name.toLowerCase()} ${rangeTxt(req.from, req.to)}${L.paid ? '' : ' (không tính công)'}.`);
  return L;
}
// Bàn giao việc cho một đồng nghiệp: họ hơi phiền, và việc có thể bị làm sai (lỗi quay lại khi bạn đi làm lại)
function leaveHandover(L, who){
  const H = LEAVE.HANDOVER[who]; L.handover = who; rel(who, -H.rel);
  L.handTitle = S.unfinished || 'phần việc bàn giao'; S.unfinished = null;
  note(`Đã bàn giao việc cho ${PEOPLE[who].name}.`);
}
// Gọi mỗi sáng: yêu cầu bàn giao để quá hạn thì bỏ; xử lý chuyện đi làm lại sau kỳ nghỉ
function leaveMorning(){
  leaveExpire();
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
// Đơn đang chờ bàn giao mà ngày nghỉ đã tới (hoặc đã qua) thì không còn hiệu lực: không bao giờ ghi đơn vào quá khứ
function leaveExpire(){
  const p = S.leavePending; if (!p || p.req.from > S.day || (p.req.from === S.day && p.asked === S.day)) return false;
  S.leavePending = null; pushMsg('boss', 'boss', 'Em chưa bàn giao nên chị coi như em vẫn đi làm nhé. Cần nghỉ thì báo lại chị.'); addUnread('boss');
  return true;
}

/* ----- Giao diện: báo nghỉ trong cuộc trò chuyện với chị Hạnh ----- */
let leaveDraft = null;
function openLeaveForm(step){
  if (!leaveCan()) return;
  if (!step) leaveDraft = {};
  const D = leaveDraft, body = $('#dlgBody'), prob = inProbation(), bal = leaveBalance();
  const head = `<div class="ph-head"><button class="ghost sm" type="button" id="phBack">Quay lại</button><b class="ph-name">Báo nghỉ</b><button class="ghost sm" type="button" id="phClose">Đóng</button></div>`;
  let html = '';
  if (!D.type) {
    html = `<p class="muted">${prob ? 'Bạn đang thử việc (lương 85%): chưa có ngày phép, ngày nghỉ không tính công.' : `Ngày phép: còn ${bal.left} (đã cộng ${bal.earned}, đã dùng ${bal.used}). Mỗi tháng được cộng 1 ngày.`}</p>` +
      ['annual','unpaid'].map(k => { const T_ = LEAVE_TYPE[k], why = leaveBlock(k);
        return `<button class="choice" type="button" data-type="${k}" ${why ? 'disabled' : ''}><span class="ci" aria-hidden="true">${T_.icon}</span><span class="cb"><span class="cl">${T_.name}</span><span class="cd">${why || (k === 'annual' ? 'Có lương, trừ vào ngày phép' : 'Không tính công')}</span></span></button>`; }).join('');
  } else if (!D.from) {
    const rs = leaveRanges(D.type);
    html = `<p class="muted">${LEAVE_TYPE[D.type].name}: nghỉ khi nào?</p>` + (rs.length ? rs.map((r, i) => `<button class="choice" type="button" data-range="${i}"><span class="ci" aria-hidden="true">📅</span><span class="cb"><span class="cl">${r.label}</span></span></button>`).join('') : '<p class="ph-empty">Không còn ngày nào báo nghỉ được.</p>');
  } else {
    html = `<p class="muted">${LEAVE_TYPE[D.type].name} ${rangeTxt(D.from, D.to)}. Nhắn chị Hạnh thế nào?</p>` + LEAVE_REASON.map((r, i) => `<button class="choice" type="button" data-reason="${i}"><span class="ci" aria-hidden="true">💬</span><span class="cb"><span class="cl">${r}</span></span></button>`).join('');
  }
  body.innerHTML = head + html;
  $('#phBack').addEventListener('click', () => { if (D.from) { D.from = D.to = null; openLeaveForm(1); } else if (D.type) { D.type = null; openLeaveForm(1); } else renderPhoneList(); });
  $('#phClose').addEventListener('click', () => closeDlg());
  body.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { D.type = b.dataset.type; openLeaveForm(1); }));
  body.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => { const r = leaveRanges(D.type)[+b.dataset.range]; D.from = r.from; D.to = r.to; openLeaveForm(1); }));
  body.querySelectorAll('[data-reason]').forEach(b => b.addEventListener('click', () => { D.reason = LEAVE_REASON[+b.dataset.reason]; leaveSubmit({ ...D }); }));
}
// Gửi tin báo nghỉ: chị Hạnh trả lời, mở lại cuộc trò chuyện
function leaveSubmit(req){
  const before = snap(), n = leaveDays(req.from, req.to), today = req.from === S.day;
  pushMsg('boss', 'me', `Chị ơi, em xin ${LEAVE_TYPE[req.type].name.toLowerCase()} ${today && n === 1 ? 'hôm nay' : rangeTxt(req.from, req.to)}${n > 1 ? ` (${n} ngày)` : ''}. ${req.reason || 'Em có việc riêng ạ'}.`);
  const r = leaveDecide(req);
  pushMsg('boss', 'boss', r.text);
  S.leavePending = null;
  if (r.verdict === 'ok') leaveGrant(req);
  else if (r.verdict === 'handover') S.leavePending = { kind:'handover', req, asked:S.day };
  clampAll(); save(); updateHUD();
  openThread('boss', diffChips(before, snap()));
  if (r.verdict === 'ok' && today) leaveStartToday();
}
// Trả lời khi chị Hạnh yêu cầu bàn giao
function leaveReplies(){
  const p = S.leavePending; if (!p) return [];
  const done = (who, text) => () => { const L = leaveGrant(p.req); leaveHandover(L, who); pushMsg('boss', 'boss', text); S.leavePending = null; };
  return [
    { t:'Em bàn giao cho Phong ạ.', run:done('phong', 'Ừ, em dặn Phong kỹ vào nhé.') },
    { t:'Em bàn giao cho anh Dũng ạ.', run:done('dung', 'Ừ, Dũng làm thì chị yên tâm. Nhớ nói với Dũng một tiếng.') },
    { t:'Dạ thôi, em không nghỉ nữa ạ.', run:() => { pushMsg('boss', 'boss', 'Ừ, khi nào cần thì nói chị nhé.'); S.leavePending = null; } } ];
}
function leaveReply(i){
  if (leaveExpire()) { save(); updateHUD(); return openThread('boss'); }
  const p = S.leavePending, r = leaveReplies()[i]; if (!r) return; const before = snap(), today = p.req.from === S.day;
  pushMsg('boss', 'me', r.t); r.run(); clampAll(); save(); updateHUD(); openThread('boss', diffChips(before, snap()));
  if (today && leaveOn() && i < 2) leaveStartToday();
}
// Báo nghỉ ngay trong sáng hôm nay: bỏ lịch đi làm, trả lại tiền xăng chưa đi, xếp lại thành một ngày ở nhà
function leaveStartToday(){
  if (!S.cur || S.cur.id !== 'wake' || S.phase !== 'play') return;
  const f = S.flags.fuel; if (f && f.d === S.day) { S.money += f.a; if (S.spend) S.spend[S.day] = Math.max(0, (S.spend[S.day] || 0) - f.a); S.notes = S.notes.filter(n => !/^Xăng xe/.test(n)); S.flags.fuel = null; }
  S.am = null; S.lateToday = false; S.lateMin = 0;
  closeDlg(); S.queue = [{ id:'activity', arg:'morning' }]; S.cur = null; feedAdd(null, '📝', 'Nhắn chị Hạnh báo nghỉ hôm nay.');
  advance();
}

/* ----- Hoạt động cả ngày: chỉ có vào buổi sáng của một ngày không phải đi làm -----
   Mỗi hoạt động chiếm trọn ngày (span:'day'): buổi chiều và buổi tối không còn chọn việc khác.
   Du lịch sau này sẽ khai báo theo đúng kiểu này, với span dài hơn. */
const DAY_TRIP = { home:{ cost:180000 }, errand:{ cost:120000, days:30 }, friend:{ cost:250000, tungFree:.6, linhFree:.25 } };
const freeDay = () => S.slot === 'morning' && !isWorkday() && (isDayOff() || !!leaveOn()) && S.day !== S.ivDay;
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
  { id:'clinic', icon:'🩺', label:'Đi khám ở phòng khám gần nhà', slots:['morning','afternoon'], cost:150000, cond:() => !isWorkday() && S.health < 60 && S.flags.clinic !== S.day,
    hints:['❤️ +6 Sức khỏe','⚡ −5'],
    fx:() => { S.flags.clinic = S.day; S.health += 6; S.energy -= 5; return 'Bác sĩ bảo bạn thiếu ngủ và ăn uống thất thường, kê vitamin và dặn nghỉ ngơi. Lời dặn nghe quen như lời mẹ.'; } },
);
Object.assign(ACT_SHORT, { trip_home:'Về quê cả ngày', trip_errand:'Việc cá nhân cả ngày', trip_friend:'Đi chơi cả ngày', clinic:'Đi khám' });
/* ----- Đồng nghiệp nhắc tới việc bạn vừa nghỉ ----- */
TALKS.unshift(
  { who:'mai',   when:() => S.flags.backFromLeave === S.day, say:['Nghỉ vui không em?', 'Vui ạ, giờ thì hết vui rồi.'], fun:true },
  { who:'phong', when:() => S.flags.backFromLeave === S.day, say:['Ông nghỉ sướng thế, tôi gánh hộ đấy.', 'Nợ ông một cốc trà đá.'], fun:true },
  { who:'boss',  when:() => S.flags.backFromLeave === S.day, say:['Nghỉ xong rồi thì tăng tốc nhé em.', 'Dạ vâng ạ.'] },
  { who:'dung',  when:() => S.flags.backFromLeave === S.day, say:['Về rồi à. Việc trong nhóm chat.', 'Dạ.'] },
);
