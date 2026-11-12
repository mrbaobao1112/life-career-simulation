/* ----- Ba loại sự kiện ----- */
const ET = { scheduled:'📅 Có lịch hẹn', random:'🎲 Bất ngờ', consequence:'🔗 Hậu quả' };
const EV_TYPE = { traffic:'random', rain:'random', morebattle:'consequence', noodle:'consequence', sleepdebt:'consequence', coffee_run:'random', birthday:'random',
  tung_drink:'random', linh_study:'random', family_job:'random', family_salary:'random', phone:'random', landlady:'random', tung_borrow:'random', mom_food:'random', linh_check:'consequence' };
const EV_CAUSE = { morebattle:() => 'Vì tối nay bạn chọn chơi game…', noodle:() => `Vì đã ăn mì tôm ${W('miTom')} bữa trong tuần…`,
  sleepdebt:() => `Vì đã thiếu ngủ tổng cộng ${fmtH(S.sleepDebt)} mấy đêm gần đây…`, linh_check:() => 'Vì tinh thần của bạn mấy hôm nay đi xuống…' };
function sceneType(ref){
  const id = ref.id;
  if (id === 'ev') return { t:EV_TYPE[ref.arg], cause: EV_CAUSE[ref.arg] ? EV_CAUSE[ref.arg]() : '' };
  if (id === 'iv_arrive' || id === 'iv_result' || id === 'ob_arrive') return { t:'scheduled' };
  if (id === 'call_invite') return { t:'consequence', cause:'Vì sáng nay bạn đã nộp hồ sơ…' };
  if (id === 'bk_call') return { t:'random' };
  if (id === 'bug_back') { const b = S.bugs.find(x => x.due <= S.day); return { t:'consequence', cause: !b ? '' : b.handover ? `Vì bạn bàn giao “${b.title}” cho ${PEOPLE[b.handover].name} trước khi nghỉ…` : `Vì hôm trước bạn chọn “làm nhanh” task ${b.title}…` }; }
  if (id === 'bill_short') return { t:'consequence', cause:'Vì đến hạn thanh toán mà số dư không đủ…' };
  if (id === 'payday' || id === 'repay' || id === 'review' || id === 'tung_repay' || id === 'reapply' || id === 'monthReport') return { t:'scheduled' };
  if (id === 'plan' && !S.cur.arg) return { t:'scheduled' };
  if (id === 'bug_weekend') return { t:'consequence', cause:'Vì trong tuần có một task bị làm vội…' };
  if (id === 'wake' && S.flags.hangoverToday) return { t:'consequence', cause:'Vì tối qua đi bia hơi với Tùng…' };
  if (id === 'wake' && (S.day === S.ivDay || (S.job && S.day === S.job.start))) return { t:'scheduled' };
  if (id === 'endwork' && ref.arg && ref.arg.ask && S.otTonight !== true && !S.unfinished) return { t:'random' };
  return {};
}
const typeHTML = ty => ty && ty.t ? `<div class="etag ${ty.t}">${ET[ty.t]}</div>${ty.cause ? `<p class="cause">${ty.cause}</p>` : ''}` : '';

function buildSlot(){
  const q = [], d = S.day, s = S.slot, di = dayInfo(d);
  const work = isWorkday(), first = work && d === S.job.start;
  if (s === 'morning') {
    q.push({ id:'wake' });
    if (di.date === 1 && d > 1) q.push({ id:'monthReport' });
    if ((S.sleepDebt || 0) >= 3 && !S.once['sd' + d]) { S.once['sd' + d] = true; q.push({ id:'ev', arg:'sleepdebt' }); }
    if (d === 1) q.push({ id:'d1_cv' }, { id:'apply' });
    else if (d === S.ivDay) { pushCommute(q); q.push({ id:'iv_arrive' }, { id:'iv_hr', arg:0 }, { id:'iv_hr', arg:1 }, { id:'iv_hr', arg:2 }, { id:'iv_tech' }); }
    else if (d === S.backupDay) q.push({ id:'bk_call' });
    else if (work) {
      pushCommute(q);
      q.push({ id:'cut', arg:'arrive' });                    // phân cảnh đến công ty (tự bỏ qua khi tua hoặc khi tắt sân khấu)
      if (first) q.push({ id:'ob_arrive' }, { id:'ob_env' }, { id:'ob_team' });
      else { q.push({ id:'standup' }, { id:'task', arg:{} }); maybeEvent(q, 'workmorning'); }
    } else {
      if (!S.job && di.wd === 1 && d > 1 && reapplyList().length) q.push({ id:'reapply' });   // thứ Hai: tìm việc tiếp
      if (di.wd === 6 && S.job && S.bugs.length) q.push({ id:'bug_weekend' });
      if (isDayOff(d)) maybeEvent(q, 'weekendmorning');
      q.push({ id:'activity', arg:'morning' });
    }
  } else if (s === 'noon') {
    q.push({ id:'meal', arg:'lunch' });
  } else if (s === 'afternoon') {
    if (d === 1) q.push({ id:'call_invite' }, { id:'activity', arg:'afternoon' });
    else if (d === S.ivDay) q.push({ id:'iv_result' }, { id:'activity', arg:'afternoon' });
    else if (work) {
      if (S.bugs.some(b => b.due <= d)) q.push({ id:'bug_back' });
      q.push({ id:'task', arg:{ first, auto:!first } });       // task buổi chiều tự làm theo cách quen tay
      if (!first) maybeEvent(q, 'workafternoon');
      if (reviewDue()) q.push({ id:'review' });
      q.push({ id:'endwork', arg:{} }, { id:'cut', arg:'leave' });
    } else { maybeEvent(q, 'freeafternoon'); q.push({ id:'activity', arg:'afternoon' }); }
  } else if (s === 'evening') {
    if (S.otTonight === true) q.push({ id:'ot' });
    else if (S.otTonight === 'home') q.push({ id:'meal', arg:'dinner' }, { id:'homework' });
    else {
      q.push({ id:'meal', arg:'dinner' });
      if (S.day === 2 && S.bg !== 'nha' && !S.once.plan) { S.once.plan = true; q.push({ id:'plan' }); }
      else if (S.flags.loanTung && d >= (S.tungDue || 15)) q.push({ id:'tung_repay' });
      else if (S.day >= FIN.FAM_EVENT_DAY && !S.once.fam) { S.once.fam = true; q.push({ id:'ev', arg:'fam_' + (S.fam || 'tb') }); }
      else maybeEvent(q, 'evening');
      q.push({ id:'activity', arg:'evening' });
    }
  } else if (s === 'night') {
    if (S.flags.gamedTonight && chance(.6)) q.push({ id:'ev', arg:'morebattle' });
    if (W('miTom') >= 3 && !S.once['noodle' + weekOf(d)]) { S.once['noodle' + weekOf(d)] = true; q.push({ id:'ev', arg:'noodle' }); }
    q.push({ id:'bedtime' }, { id:'dayReport' });
  }
  if (!S.fast && (s === 'morning' || s === 'afternoon' || s === 'evening')) maybeMsg(s);   // khi tua nhanh, điện thoại im lặng
  S.queue = S.flags.dayTrip === d && s !== 'morning' ? q.filter(r => r.id !== 'activity' && r.id !== 'ev') : q;   // đi cả ngày: chiều và tối không còn giờ rảnh
}

function pushCommute(q){
  if (chance(.3)) q.push({ id:'ev', arg:'traffic' });
  else if (chance(.15)) { q.push({ id:'ev', arg:'rain' }); S.flags.rainDay = S.day; }      // hôm nay mưa: các cảnh ngoài trời cũng có mưa
}

// Sự kiện có thời gian chờ: EV_CD[id] là số ngày phải chờ trước khi xảy ra lại; không ghi thì chỉ xảy ra một lần
function evReady(id){
  const last = (S.evLast || {})[id];
  if (last === undefined) return true;
  return !!EV_CD[id] && S.day - last >= EV_CD[id];
}
function maybeEvent(q, ctx){
  if (S.fast) return;                                        // khi tua nhanh: những ngày bình thường, không có sự kiện bất ngờ
  if (S.day > 7 && !chance(BAL.EVENT_RATE)) return;          // sau tuần đầu, sự kiện thưa hơn
  const pool = shuffle(Object.entries(EVENTS).filter(([id, e]) => e.ctx && e.ctx.includes(ctx) && evReady(id) && (!e.cond || e.cond())));
  for (const [id, e] of pool) {
    const p = typeof e.chance === 'function' ? e.chance() : e.chance;
    if (chance(p)) { (S.evLast = S.evLast || {})[id] = S.day; S.once[id] = true; q.push({ id:'ev', arg:id }); return; }
  }
}

// Đi tiếp: việc thường ngày tự chạy theo nếp, chỉ dừng lại ở cảnh cần người chơi quyết định
function advance(){
  for (let n = 0; n < 2000; n++) {
    let guard = 0;
    while (!S.queue.length && guard++ < 6) {
      const i = SLOTS.indexOf(S.slot);
      if (i >= SLOTS.length - 1) return startDay();
      S.slot = SLOTS[i+1];
      S.energy = Math.max(0, S.energy - BAL.SLOT_DRAIN);
      tickPhone();
      buildSlot();
    }
    const ref = S.cur = S.queue.shift();
    if (ref.id === 'dayReport') {
      const f = S.fast;
      if (f && f.multi) {
        fastLogDay();
        if (S.day < f.until && S.day < LAST_DAY && dayInfo().wd !== 0) { S.cur = null; return startDay(); }   // tua tiếp sang ngày sau
        endFast(); ref.arg = { ff:true };
      } else S.fast = null;
      break;
    }
    const sc = buildScene(ref), i = autoPick(ref, sc);
    if (i < 0) {                                             // cần người chơi: dừng tua, hiện tóm tắt những ngày đã qua (nếu có)
      if (endFast()) { S.queue.unshift(ref); S.cur = { id:'ffReport' }; }
      break;
    }
    runAuto(ref, sc, i);
  }
  save();
  renderScene();
}

function applyLate(){
  if (S.lateToday && !S.flags.latePenalized) {
    S.flags.latePenalized = true;
    rel('boss', -4); S.mood -= 3; S.stat.lateWork++;
    note('Đi làm muộn, chị Hạnh có để ý.');
  }
}

