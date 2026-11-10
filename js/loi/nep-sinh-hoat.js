/* =========================================================
   NẾP SINH HOẠT & TUA NHANH
   - Việc thường ngày (ăn, ngủ, họp đầu ngày, tắc đường…) tự chạy theo nếp của nhân vật,
     dùng đúng các lựa chọn và công thức của cảnh gốc, rồi ghi một dòng vào "nhật ký trong ngày".
   - "Qua nhanh hôm nay" và "Tua đến mốc" cho game tự chạy cả những việc thường lệ khác
     (task, giờ rảnh), và chỉ dừng khi có việc cần người chơi quyết định.
   ========================================================= */
// Nếp mặc định, dùng khi người chơi chưa tự chọn lần nào mà đã tua nhanh
const HABIT_DEF = { bed:23.5, work:'careful', free:'rest', lunchWork:'team' };
const MEAL_DEF = { nha:'home', tro:'rice', ghep:'cook' };
// Các lựa chọn hiện trong bảng "Nếp sinh hoạt"
const HABIT_OPTS = {
  lunchWork: () => [['team','Cơm văn phòng với team'], ['bread','Bánh mì, ăn tại bàn'], ['bun','Bún chả gần công ty'], ['nap','Nhịn ăn, ngủ trưa']],
  meal: () => [S.bg === 'nha' ? ['home','Cơm mẹ nấu'] : S.bg === 'tro' ? ['cook','Đi chợ tự nấu'] : ['cook','Nấu chung với Tùng'], ['rice','Cơm bụi đầu ngõ'], ['noodle','Mì tôm'], ['app','Gọi đồ ăn qua ứng dụng']],
  bed: () => [[22.5,'22:30'], [23.5,'23:30'], [24.5,'00:30'], [26,'02:00']],
  work: () => [['careful','Làm kỹ từng bước'], ['fast','Làm nhanh cho xong'], ['ask','Hay hỏi anh Dũng']],
  free: () => [['rest','Nằm nghỉ'], ['study','Học thêm'], ['film','Xem phim, lướt mạng'], ['game','Chơi game'], ['run','Chạy bộ'], ['clean','Dọn phòng']],
};
const HABIT_LBL = { lunchWork:'Bữa trưa ngày đi làm', meal:'Bữa ăn ở nhà', bed:'Giờ đi ngủ', work:'Cách làm việc quen tay', free:'Lúc rảnh (khi tua nhanh)' };
const HABIT_ASK = ['lunchWork','meal','bed'];   // những nếp có thể đặt "hỏi mình mỗi lần"

function habit(){ return S.habit = S.habit || {}; }
const mealCtx = kind => kind === 'lunch' && isWorkday() ? 'lunchWork' : 'meal';
// Cảnh này có phải lần đầu người chơi tự đặt nếp không (để hiện lời nhắc)
function habitFirst(ref){
  const h = habit();
  if (ref.id === 'meal') return !h[mealCtx(ref.arg)];
  if (ref.id === 'bedtime') return !h.bed;
  return false;
}

/* ----- Dựng cảnh (kèm phần trang trí) dùng chung cho cả hiển thị lẫn tự chạy ----- */
function buildScene(ref){
  const sc = SC[ref.id](ref.arg);
  const deco = ART[ref.id === 'ev' ? 'ev:' + ref.arg : ref.id];
  if (deco) Object.assign(sc, deco(ref.arg, sc) || {});
  if (sc.bg === undefined) sc.bg = 'home';
  return sc;
}

/* ----- Tự chọn: trả về vị trí lựa chọn sẽ tự chạy, hoặc −1 nếu cần người chơi quyết định ----- */
function autoPick(ref, sc){
  const fast = !!S.fast, h = habit();
  const ok = c => c && !c.disabled && !(c.cost && S.money < c.cost);
  const byKey = k => sc.choices.findIndex(c => c.key === k && ok(c));
  const cheapest = () => { let best = -1; sc.choices.forEach((c, i) => { if (ok(c) && (best < 0 || (c.cost || 0) < (sc.choices[best].cost || 0))) best = i; }); return best; };
  switch (ref.id) {
    case 'wake': return fast ? 0 : -1;
    case 'meal': {
      const ctx = mealCtx(ref.arg); let k = h[ctx];
      if (!k || k === 'ask') { if (!fast) return -1; k = ctx === 'lunchWork' ? HABIT_DEF.lunchWork : MEAL_DEF[S.bg]; }
      const i = byKey(k); return i >= 0 ? i : cheapest();
    }
    case 'bedtime': {
      let b = h.bed;
      if (!b || b === 'ask') { if (!fast) return -1; b = HABIT_DEF.bed; }
      const i = sc.choices.findIndex(c => c.h >= b); return i >= 0 ? i : sc.choices.length - 1;
    }
    case 'standup': return 0;
    case 'ev':
      if (ref.arg === 'traffic') return 1;                 // kiên nhẫn nhích từng chút
      if (ref.arg === 'rain') return 2;                    // mặc áo mưa
      if (ref.arg === 'noodle') return 0;
      if (ref.arg === 'sleepdebt' || ref.arg === 'morebattle') return fast ? 1 : -1;
      return -1;
    case 'task': {
      if (!fast && !(ref.arg && ref.arg.auto)) return -1;
      const i = byKey(h.work || HABIT_DEF.work); return i >= 0 ? i : 1;
    }
    case 'endwork':
      if (sc.choices.length === 1) return 0;               // đã nhận OT từ trước
      if (sc.plain) return fast || !(ref.arg && ref.arg.invite) ? 0 : -1;
      return fast ? 1 : -1;                                // được nhờ OT hoặc task dang dở: khi tua thì từ chối / xin lùi hạn
    case 'bug_back': case 'ot': case 'homework': return fast ? 0 : -1;
    case 'activity': {
      if (!fast) return -1;
      let i = sc.choices.findIndex(c => c.actId === (h.free || HABIT_DEF.free) && ok(c));
      if (S.energy < 25) i = sc.choices.findIndex(c => c.actId === 'rest');
      return i >= 0 ? i : sc.choices.findIndex(c => c.actId === 'rest');
    }
    default: return -1;
  }
}

/* ----- Nhật ký trong ngày: mỗi việc đã làm là một dòng ngắn ----- */
function feedTime(ref){
  if (ref && ref.id === 'wake') return clock(S.am ? S.am.wake / 60 : alarmFor(S.day));
  if (ref && ref.id === 'bedtime') return clock(S.bedHour || 23);
  return SLOT_INFO[S.slot][1];
}
function feedAdd(ref, icon, text, money){
  (S.feed = S.feed || []).push({ t:feedTime(ref), icon:icon || '•', text, m:money || 0, wake: !!(ref && ref.id === 'wake') });
  if (S.feed.length > 40) S.feed.shift();
}
function feedText(ref, sc, ch){
  switch (ref.id) {
    case 'wake': return S.day === 1 ? 'Ngày đầu tiên sau lễ tốt nghiệp.' : `Thức dậy sau ${fmtH(S.sleep)} ngủ.${S.am && S.am.delays.length ? ' Ngủ quên một lúc.' : ''}`;
    case 'bedtime': return `Đi ngủ lúc ${clock(S.bedHour || 23)}.`;
    case 'standup': return S.lateToday ? `Đến công ty lúc ${arrClock()}, muộn ${S.lateMin} phút.` : `Đến công ty lúc ${arrClock()}, họp đầu ngày.`;
    case 'task': { const t = TASK[ref.arg.tid]; return S.unfinished === t.title ? `Task “${t.title}” còn dang dở.` : `Làm task “${t.title}”.`; }
    case 'endwork': return S.otTonight === true ? 'Hết giờ, ở lại OT.' : S.otTonight === 'home' ? 'Tan làm, mang việc về nhà.' : 'Tan làm.';
    case 'ot': return 'OT buổi tối ở công ty.';
    case 'homework': return 'Làm nốt việc mang về nhà.';
    case 'bug_back': return 'Sửa lỗi cũ quay lại.';
    case 'meal': case 'activity': return ch.label + '.';
    case 'ev': return `${sc.title}: ${ch.label.charAt(0).toLowerCase() + ch.label.slice(1)}.`;
    default: return sc.title + '.';
  }
}

/* ----- Áp dụng một lựa chọn (dùng chung cho bấm tay và tự chạy) ----- */
function applyChoice(ch){
  const before = snap();
  if (ch.cost) S.money -= ch.cost;
  let out = ch.fx ? ch.fx() : '';
  if (!ch.noSpend && S.money < before.money) spendLog(before.money - S.money);
  shapeGains(before, ch.actId, ch.npc !== undefined ? ch.npc : (current.kind === 'phone' ? null : current.npc));
  clampAll();
  if (typeof out === 'string') out = { text:out };
  out = out || {};
  if (current.kind === 'phone') {
    const th = current.from, who = THREAD_WHO[th] || th;
    current.msgs.forEach(t => pushMsg(th, who, t));
    const q = ch.label.match(/“([^”]+)”/); pushMsg(th, 'me', q ? q[1] : ch.label);
  }
  return { before, out };
}
// Người chơi tự chọn thì game ghi nhớ thành nếp
function learnHabit(ref, ch){
  const h = habit();
  if (ref.id === 'meal' && ch.key && !['tab','skip'].includes(ch.key)) { const ctx = mealCtx(ref.arg); if (h[ctx] !== 'ask') h[ctx] = ch.key; }
  if (ref.id === 'bedtime' && ch.h && h.bed !== 'ask') h.bed = ch.h;
  if (ref.id === 'task' && ['fast','careful','ask'].includes(ch.key)) h.work = ch.key;
  if (ref.id === 'activity' && HABIT_OPTS.free().some(o => o[0] === ch.actId)) h.free = ch.actId;
}
function runAuto(ref, sc, i){
  current = sc;
  const ch = sc.choices[i];
  const { before } = applyChoice(ch);
  feedAdd(ref, ch.icon || sc.icon, feedText(ref, sc, ch), S.money - before.money);
  S.cur = null;
}

/* ----- Tua nhanh ----- */
// Ngày tiếp theo có việc đáng dừng lại, kèm lý do để ghi trên nút
function nextStop(){
  const d0 = S.day, c = [];
  const add = (d, why) => { if (d > d0) c.push([d, why]); };
  add(weekStart(d0) + 6, 'Chủ Nhật, tổng kết tuần');
  add(monthEnd(d0) + 1, 'đầu tháng, hóa đơn');
  for (let d = d0 + 1; d <= d0 + 31; d++) if (isPayday(d) && S.job && payFor(d).days > 0) { add(d, 'ngày lương'); break; }
  (S.bills || []).filter(b => !b.paid).forEach(b => add(b.due, b.kind === 'rent' ? 'hạn tiền nhà' : 'hạn hóa đơn'));
  openLoans().forEach(L => add(L.due, 'hẹn trả nợ'));
  if (S.flags.loanTung) add(S.tungDue || 15, 'Tùng hẹn trả tiền');
  if (S.job && !S.flags.review) { let d = Math.max(d0 + 1, BAL.REVIEW_DAY); while (dayInfo(d).wd !== 5) d++; add(d, 'nhận xét của trưởng nhóm'); }
  if (S.ivDay > d0) add(S.ivDay, 'phỏng vấn');
  if (S.job && S.job.start > d0) add(S.job.start, 'ngày đầu đi làm');
  if (!S.job) { let d = d0 + 1; while (dayInfo(d).wd !== 1) d++; add(d, 'thứ Hai, tìm việc tiếp'); }
  add(LAST_DAY, 'ngày cuối bản chơi thử');
  c.sort((a, b) => a[0] - b[0]);
  const [day, why] = c[0];
  return { day: Math.min(day, LAST_DAY), why };
}
function startFast(multi){
  S.fast = multi ? { multi:true, from:S.day, until:nextStop().day, start:snap(), days:[] } : { from:S.day, until:S.day };
}
function fastLogDay(){
  const keep = S.notes.filter(n => /lương|Đã trả|nợ|muộn|Bỏ bữa|sức khỏe|căng thẳng|lo\b|OT/i.test(n)).slice(0, 2);
  S.fast.days.push({ d:S.day, money:S.money - S.d0.money, work:isWorkday(), notes:keep });
}
// Kết thúc lượt tua: cất phần tóm tắt lại để hiện cho người chơi
function endFast(){
  const f = S.fast; S.fast = null;
  if (f && f.multi && f.days.length) S.ffSum = { from:f.from + 1, to:f.days[f.days.length - 1].d, start:f.start, days:f.days };
  return !!(f && f.multi && f.days.length);
}
function ffSumHTML(){
  const f = S.ffSum; if (!f) return '';
  const chips = diffChips(f.start, snap(), true);
  const rows = f.days.map(x => { const di = dayInfo(x.d);
    return `<div class="hb"><span>${di.dow}, ${fmtD(x.d)}: ${x.work ? 'đi làm' : isDayOff(x.d) ? 'ngày nghỉ' : 'ở nhà'}${x.notes.length ? '. ' + x.notes.join(' ') : ''}</span><span>${x.money ? (x.money > 0 ? '+' : '−') + fmt(Math.abs(x.money)) : ''}</span></div>`; }).join('');
  return `<div class="food">${rows}</div>${chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : ''}`;
}
SC.ffReport = () => {
  const f = S.ffSum || { from:S.day, to:S.day, days:[] };
  return { kind:'journal', title: f.from === f.to ? `Đã qua ngày ${fmtD(f.to)}` : `Đã tua từ ${fmtD(f.from)} đến ${fmtD(f.to)}`,
    html: `<p>Những ngày vừa qua trôi theo nếp quen. Hôm nay có việc cần bạn quyết định.</p>${ffSumHTML()}`,
    choices: [{ icon:'👀', label:'Xem việc hôm nay', fx:() => ({ silent:true }) }] };
};

/* ----- Bảng "Nếp sinh hoạt" ----- */
function openHabits(){
  if (!S) return;
  const h = habit();
  const row = k => {
    const opts = HABIT_OPTS[k](), cur = h[k] ?? (HABIT_ASK.includes(k) ? '' : HABIT_DEF[k]);
    const sel = [...(HABIT_ASK.includes(k) ? [['ask','Hỏi mình mỗi lần']] : []), ...opts]
      .map(([v, l]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`).join('');
    return `<label class="hrow"><span>${HABIT_LBL[k]}</span><select data-h="${k}">${cur === '' ? '<option value="" selected>Chưa đặt (game sẽ hỏi lần đầu)</option>' : ''}${sel}</select></label>`;
  };
  $('#dlgBody').innerHTML = `<div class="ph-head"><h2>Nếp sinh hoạt</h2><button class="ghost sm" type="button" id="closeDlg">Đóng</button></div>
    <p class="muted">Những việc thường ngày sẽ tự diễn ra theo nếp này. Thay đổi có hiệu lực từ lần kế tiếp, kể cả trong hôm nay.</p>
    ${['lunchWork','meal','bed','work','free'].map(row).join('')}
    <label class="hrow chk"><input type="checkbox" id="optDetail" ${S.opt && S.opt.detail ? 'checked' : ''}><span>Hiện chi tiết cộng trừ chỉ số trên từng lựa chọn</span></label>`;
  const dlg = $('#dlg'); dlg.classList.remove('phone-dlg');
  $('#closeDlg').addEventListener('click', () => { closeDlg(); if (S && S.cur && S.phase === 'play') renderScene(); });
  $('#dlgBody').querySelectorAll('select[data-h]').forEach(s => s.addEventListener('change', () => {
    const k = s.dataset.h, v = s.value; if (v === '') return;
    h[k] = k === 'bed' && v !== 'ask' ? +v : v; save(); }));
  $('#optDetail').addEventListener('change', e => { S.opt = S.opt || {}; S.opt.detail = e.target.checked; save(); });
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}
