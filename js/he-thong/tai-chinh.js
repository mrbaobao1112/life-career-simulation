/* =========================================================
   v5: TÀI CHÍNH – sổ hóa đơn, chi phí cố định, khả năng duy trì, áp lực theo bậc
   ========================================================= */
const FIN = {
  RENT_DAY: 16,                         // chu kỳ thuê tính từ ngày dọn vào (16/11): tháng sau đến hạn ngày 16
  UTIL: { tro:400000, ghep:250000 },    // điện nước internet, đến hạn ngày 1 hằng tháng (ở ghép đã chia đôi)
  PHONE: 100000,                        // cước điện thoại, đến hạn ngày 1 hằng tháng
  FUEL: 15000,                          // xăng xe mỗi ngày phải ra ngoài
  PAYDAY: 10,                           // ngày nhận lương hằng tháng
  LATE_FEE: .05,                        // phí xin nộp chậm tiền nhà
  CHEAPEST_MEAL: 6000,
  LOAN_DAYS: 14,                        // hạn trả tiền vay bạn bè
  HOUSE_CONTRIB: 1000000,               // góp tiền chợ khi ở cùng bố mẹ, sau khi có lương
  FAM_EVENT_DAY: 4,                     // sự kiện gia cảnh xuất hiện từ tối ngày thứ 4
  NORMAL: { nha:63000, tro:108000, ghep:96000 },  // mức chi tiêu bình thường mỗi ngày (dùng khi chưa đủ dữ liệu)
  SAVER:  { nha:10000, tro:51000,  ghep:38000 },  // mức tiết kiệm tối đa mỗi ngày
  LOOKAHEAD: 40, RUNWAY_MAX: 120,
};
const START_DATE = new Date(2026, 10, 16);
function dateOf(d){ const x = new Date(START_DATE); x.setDate(x.getDate() + d - 1); return x; }
const fmtD = d => { const x = dateOf(d); return `${x.getDate()}/${x.getMonth() + 1}`; };
const monthKey = (d = S.day) => { const x = dateOf(d); return `${x.getMonth() + 1}/${x.getFullYear()}`; };
const isPayday = d => dateOf(d).getDate() === FIN.PAYDAY;
const rwTxt = n => n >= FIN.RUNWAY_MAX ? 'hơn 4 tháng' : `khoảng ${n} ngày`;

// Lịch thu chi định kỳ: nguồn duy nhất cho cả sổ hóa đơn và phép tính khả năng duy trì
function scheduleOn(d){
  const x = dateOf(d), m = x.getMonth() + 1, per = `${m}-${x.getFullYear()}`, out = [];
  const rent = BAL.BG[S.bg].rent;
  if (rent && x.getDate() === FIN.RENT_DAY && d > 1) out.push({ id:`rent-${per}`, kind:'rent', name:`Tiền nhà tháng ${m}`, amount:rent, due:d });
  if (x.getDate() === 1 && d > 1) {
    if (FIN.UTIL[S.bg]) out.push({ id:`util-${per}`, kind:'util', name:`Điện nước, internet tháng ${m}`, amount:FIN.UTIL[S.bg], due:d });
    out.push({ id:`phone-${per}`, kind:'phone', name:`Cước điện thoại tháng ${m}`, amount:FIN.PHONE, due:d });
  }
  return out;
}
function ensureBills(){
  S.bills = S.bills || [];
  for (let d = S.day; d <= S.day + FIN.LOOKAHEAD; d++)
    for (const b of scheduleOn(d)) if (!S.bills.some(x => x.id === b.id)) S.bills.push({ ...b, paid:false });
}
/* ----- v6: lương thử việc theo ngày công, tạm ứng, sổ nợ ----- */
FIN.PROBATION_RATE = .85;      // lương thử việc = 85% lương chính thức
FIN.PROBATION_MONTHS = 2;      // thời gian thử việc (tháng)
FIN.ADVANCE_AFTER = 10;        // đi làm từ 10 ngày trở lên mới xin tạm ứng được
FIN.ADVANCE_RATE = .5;         // tạm ứng tối đa 50% số lương đã làm được
FIN.EARLY_DAYS = 5;            // hỏi trước hạn từ 5 ngày trở lên là "thu xếp sớm"
FIN.FAM_EARLY_MOOD = .5;       // xin gia đình chủ động thì áy náy chỉ bằng một nửa lúc phút chót
const dayOfDate = dt => Math.round((new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) - START_DATE) / 864e5) + 1;
function workdays(a, b){ let n = 0; for (let d = a; d <= b; d++) { const w = dateOf(d).getDay(); if (w >= 1 && w <= 5) n++; } return n; }
// Lương nhận ngày d (ngày 10) là lương của tháng trước, tính theo ngày công, trừ tạm ứng
function payFor(d){
  if (!S.job) return { amount:0, days:0 };
  const x = dateOf(d), a = dayOfDate(new Date(x.getFullYear(), x.getMonth() - 1, 1)), b = dayOfDate(new Date(x.getFullYear(), x.getMonth(), 0));
  const from = Math.max(a, S.job.start); if (from > b) return { amount:0, days:0 };
  const off = unpaidIn(from, b), days = workdays(from, b) - off, full = workdays(a, b);      // ngày nghỉ không lương không tính công
  const sx = dateOf(S.job.start), monthsIn = (x.getFullYear() - sx.getFullYear()) * 12 + x.getMonth() - sx.getMonth();
  const rate = monthsIn <= FIN.PROBATION_MONTHS ? FIN.PROBATION_RATE : 1;
  const per = `${x.getMonth()}-${x.getFullYear()}`, adv = (S.advances || {})[per] || 0;
  const gross = Math.round(S.job.salary * rate * days / full / 1000) * 1000;
  return { amount: Math.max(0, gross - adv), gross, days, full, rate, adv, per, off };
}
const payLine = p => `${p.days}/${p.full} ngày công × ${fmtTr(S.job.salary)}${p.rate < 1 ? ` × ${Math.round(p.rate * 100)}% thử việc` : ''}${p.adv ? `, trừ tạm ứng ${fmt(p.adv)}` : ''} = <b>${fmt(p.amount)}</b>${p.off ? ` (đã trừ ${p.off} ngày nghỉ không lương)` : ''}`;
function addLoan(from, amount, due, label){ (S.loans = S.loans || []).push({ from, amount, due, mk:monthKey(), label }); }
function nextPaydayAfter(d){ for (let i = d + 1; i <= d + 40; i++) if (isPayday(i)) return i; return d + 30; }
function openLoans(){ return (S.loans || []).filter(L => !L.repaid); }
function earnedSoFar(){
  if (!S.job || S.day < S.job.start) return 0;
  const x = dateOf(S.day), a = dayOfDate(new Date(x.getFullYear(), x.getMonth(), 1)), b = dayOfDate(new Date(x.getFullYear(), x.getMonth() + 1, 0));
  return Math.round(S.job.salary * FIN.PROBATION_RATE * (workdays(Math.max(a, S.job.start), S.day) - unpaidIn(Math.max(a, S.job.start), S.day)) / workdays(a, b));
}
function advanceKey(){ const x = dateOf(S.day); return `${x.getMonth() + 1}-${x.getFullYear()}`; }
function canAdvance(){ return S.job && S.day >= S.job.start + FIN.ADVANCE_AFTER && !(S.advances || {})[advanceKey()]; }
function takeAdvance(){ const amt = Math.round(earnedSoFar() * FIN.ADVANCE_RATE / 100000) * 100000; S.advances = { ...(S.advances || {}), [advanceKey()]: amt }; S.money += amt; rel('boss', -2); memo(`Xin tạm ứng lương ${fmt(amt)}`); return amt; }
function nextRentBill(){ return (S.bills || []).filter(b => b.kind === 'rent' && !b.paid).sort((a, b) => a.due - b.due)[0]; }

function payBill(b){
  if (!b || b.paid || S.money < b.amount) return false;
  S.money -= b.amount; b.paid = true; b.paidDay = S.day;
  note(`Đã trả ${b.name.toLowerCase()}: −${fmt(b.amount)}.`);
  return true;
}
// Chạy đúng một lần mỗi ngày (S.finDay), mỗi hóa đơn chỉ trả một lần (b.paid): không thể trừ tiền hai lần, kể cả khi tải lại game
function processFinance(){
  if (S.finDay === S.day) return [];
  S.finDay = S.day;
  ensureBills();
  const ev = [];
  if (S.job && isPayday(S.day)) { const p = payFor(S.day); S.paidPer = S.paidPer || {}; if (p.days > 0 && !S.paidPer[p.per]) { S.paidPer[p.per] = true;
    S.money += p.amount; (S.income = S.income || {})[S.day] = p.amount; S.lastPay = p; S.flags.paidCount = (S.flags.paidCount || 0) + 1;
    note(`Nhận lương: +${fmt(p.amount)} (${p.days} ngày công).`); memo(`Nhận lương ${fmt(p.amount)}`); ev.push({ id:'payday' }); } }
  if (openLoans().some(L => L.due <= S.day)) ev.push({ id:'repay' });
  for (const b of S.bills.filter(b => !b.paid && b.due <= S.day).sort((a, b) => a.due - b.due))
    if (!payBill(b) && !b.alerted) { b.alerted = true; ev.push({ id:'bill_short', arg:b.id }); }
  return ev;
}
function spendLog(a){ if (a > 0) { S.spend = S.spend || {}; S.spend[S.day] = (S.spend[S.day] || 0) + a; } }
// Chi tiêu hằng ngày = trung bình chi tiêu thực 7 ngày gần nhất (chưa đủ 3 ngày thì dùng mức bình thường theo nơi ở)
function avgDaily(){
  const sp = S.spend || {}, days = [];
  for (let d = S.day - 1; d >= Math.max(1, S.day - 7); d--) days.push(sp[d] || 0);
  if (days.length < 3) return FIN.NORMAL[S.bg] + (S.job ? FIN.FUEL : 0);
  return Math.max(FIN.SAVER[S.bg], Math.round(days.reduce((a, b) => a + b, 0) / days.length));
}
const saverDaily = () => FIN.SAVER[S.bg] + (S.job ? FIN.FUEL : 0);
// Mô phỏng từng ngày phía trước: chi tiêu hằng ngày + hóa đơn đến hạn − lương sắp nhận, đến khi số dư âm
function runway(daily){
  let m = S.money;
  const bills = S.bills || [], unpaid = bills.filter(b => !b.paid);
  for (let i = 0; i <= FIN.RUNWAY_MAX; i++) {
    const d = S.day + i;
    if (i > 0) { m -= daily; if (S.job && isPayday(d)) m += payFor(d).amount; for (const L of openLoans()) if (L.due === d) m -= L.amount; }
    if (i === 0) for (const L of openLoans()) if (L.due <= d) m -= L.amount;
    for (const b of unpaid) if (i === 0 ? b.due <= d : b.due === d) m -= b.amount;
    if (i > 0) for (const b of scheduleOn(d)) if (!bills.some(x => x.id === b.id)) m -= b.amount;
    if (m < 0) return i;
  }
  return FIN.RUNWAY_MAX;
}
function nextIncomeIn(){ if (!S.job) return null; for (let i = 1; i <= 40; i++) if (isPayday(S.day + i) && payFor(S.day + i).days > 0) return i; return null; }
const FIN_STAGE = {
  stable: { label:'Ổn định', pen:0 },
  worried: { label:'Lo lắng', pen:2, note:'Tiền không còn dư dả so với thời gian đến khoản thu tiếp theo: bắt đầu thấy lo.' },
  tense: { label:'Căng thẳng', pen:4, note:'Sắp đến hạn hóa đơn mà số dư chưa đủ: căng thẳng.' },
  short: { label:'Thiếu tiền', pen:6, note:'Không đủ tiền trả hóa đơn hoặc tiền ăn: rất căng thẳng.' },
};
function finStage(){
  const avg = avgDaily(), r = runway(avg), inc = nextIncomeIn(), bills = S.bills || [];
  let key = 'stable';
  if (bills.some(b => !b.paid && b.due <= S.day) || S.money < FIN.CHEAPEST_MEAL) key = 'short';
  else if (bills.some(b => !b.paid && b.due > S.day && b.due <= S.day + 5 && S.money - avg * (b.due - S.day) < b.amount)) key = 'tense';
  else if (r < (inc ?? 30) + 7) key = 'worried';
  return { key, ...FIN_STAGE[key], r, avg };
}
// Giữ tên cũ để các chỗ khác vẫn dùng được
function finPressure(){ const s = finStage(); return { label:s.label, pen:s.pen, note:s.note }; }
function billsHTML(list){
  return list.map(b => `<div class="hb"><span>${b.name}, hạn ${fmtD(b.due)}${b.due <= S.day ? ' (quá hạn)' : ''}</span><span>${fmt(b.amount)}</span></div>`).join('');
}
function finCardHTML(){
  const st = finStage(), rw = runway(st.avg), rs = runway(saverDaily());
  const up = (S.bills || []).filter(b => !b.paid).sort((a, b) => a.due - b.due).slice(0, 4);
  const loans = (S.loans || []).filter(L => !L.repaid);
  return `<div class="food"><div class="food-top"><span>Tình trạng</span><b class="lv ${st.key === 'stable' ? 'good' : st.key === 'worried' ? 'ok' : 'bad'}">${st.label}</b></div>
    <div class="hb"><span>Theo cách chi tiêu hiện tại (~${fmt(st.avg)}/ngày)</span><span>${rwTxt(rw)}</span></div>
    <div class="hb"><span>Nếu tiết kiệm tối đa (~${fmt(saverDaily())}/ngày)</span><span>${rwTxt(rs)}</span></div>
    ${up.length ? `<p class="muted">Sắp đến hạn:</p>${billsHTML(up)}` : ''}
    ${loans.map(L => `<div class="hb"><span>${L.label || 'Đang nợ ' + PEOPLE[L.from].name}, hẹn trả ${fmtD(L.due)}</span><span>${fmt(L.amount)}</span></div>`).join('')}
    <p class="muted">Số ngày duy trì tính cả hóa đơn sắp đến hạn${S.job ? ' và lương sắp nhận' : ''}, chưa tính sự kiện bất ngờ.</p></div>`;
}

function nightly(){
  updateNutr();
  if (S.nutr < 30) { S.health -= 3; note('Ăn uống kém nhiều bữa liền: sức khỏe giảm.'); }
  else if (S.nutr < 40) { S.health -= 2; note('Ăn uống thất thường: sức khỏe giảm nhẹ.'); }
  else if (S.nutr >= 70) S.health += 1;
  if (isWorkday()) S.mood -= BAL.WORK_STRESS;
  S.mood -= Math.round((S.mood - 60) * BAL.MOOD_DRIFT);
  const st = finStage(); if (st.pen) S.mood -= st.pen;
  if (st.key !== S.finLast) { if (st.note) note(st.note); S.finLast = st.key; }
}

