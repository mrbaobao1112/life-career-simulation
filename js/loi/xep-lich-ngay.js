/* ----- Ba loại sự kiện ----- */
const ET = { scheduled:'📅 Có lịch hẹn', random:'🎲 Bất ngờ', consequence:'🔗 Hậu quả' };
const EV_TYPE = { traffic:'random', rain:'random', morebattle:'consequence', noodle:'consequence', sleepdebt:'consequence', coffee_run:'random', birthday:'random',
  tung_drink:'random', linh_study:'random', family_job:'random', family_salary:'random', phone:'random', landlady:'random', tung_borrow:'random', mom_food:'random', linh_check:'consequence' };
const EV_CAUSE = { morebattle:() => 'Vì tối nay bạn chọn chơi game…', noodle:() => `Vì đã ăn mì tôm ${S.stat.miTom} bữa trong tuần…`,
  sleepdebt:() => `Vì đã thiếu ngủ tổng cộng ${fmtH(S.sleepDebt)} mấy đêm gần đây…`, linh_check:() => 'Vì tinh thần của bạn mấy hôm nay đi xuống…' };
function sceneType(ref){
  const id = ref.id;
  if (id === 'ev') return { t:EV_TYPE[ref.arg], cause: EV_CAUSE[ref.arg] ? EV_CAUSE[ref.arg]() : '' };
  if (id === 'iv_arrive' || id === 'iv_result' || id === 'ob_arrive') return { t:'scheduled' };
  if (id === 'call_invite') return { t:'consequence', cause:'Vì sáng nay bạn đã nộp hồ sơ…' };
  if (id === 'bk_call') return { t:'random' };
  if (id === 'bug_back') { const b = S.bugs.find(x => x.due <= S.day); return { t:'consequence', cause: b ? `Vì hôm trước bạn chọn “làm nhanh” task ${b.title}…` : '' }; }
  if (id === 'bill_short') return { t:'consequence', cause:'Vì đến hạn thanh toán mà số dư không đủ…' };
  if (id === 'payday' || id === 'repay') return { t:'scheduled' };
  if (id === 'plan' && !S.cur.arg) return { t:'scheduled' };
  if (id === 'bug_weekend') return { t:'consequence', cause:'Vì trong tuần có một task bị làm vội…' };
  if (id === 'wake' && S.flags.hangoverToday) return { t:'consequence', cause:'Vì tối qua đi bia hơi với Tùng…' };
  if (id === 'wake' && (S.day === S.ivDay || (S.job && S.day === S.job.start))) return { t:'scheduled' };
  if (id === 'endwork' && ref.arg && ref.arg.ask && S.otTonight !== true && !S.unfinished) return { t:'random' };
  return {};
}
const typeHTML = ty => ty && ty.t ? `<div class="etag ${ty.t}">${ET[ty.t]}</div>${ty.cause ? `<p class="cause">${ty.cause}</p>` : ''}` : '';

function buildSlot(){
  const q = [], d = S.day, s = S.slot;
  const work = isWorkday(), first = work && d === S.job.start;
  if (s === 'morning') {
    q.push({ id:'wake' });
    if ((S.sleepDebt || 0) >= 3 && !S.once['sd' + d]) { S.once['sd' + d] = true; q.push({ id:'ev', arg:'sleepdebt' }); }
    if (d === 1) q.push({ id:'d1_cv' }, { id:'apply' });
    else if (d === S.ivDay) { pushCommute(q); q.push({ id:'iv_arrive' }, { id:'iv_hr', arg:0 }, { id:'iv_hr', arg:1 }, { id:'iv_hr', arg:2 }, { id:'iv_tech' }); }
    else if (d === S.backupDay) q.push({ id:'bk_call' });
    else if (work) {
      pushCommute(q);
      if (first) q.push({ id:'ob_arrive' }, { id:'ob_env' }, { id:'ob_team' });
      else { q.push({ id:'standup' }, { id:'task', arg:{} }); maybeEvent(q, 'workmorning'); }
    } else {
      if (d === 6 && S.bugs.length) q.push({ id:'bug_weekend' });
      if (d >= 6) maybeEvent(q, 'weekendmorning');
      q.push({ id:'activity', arg:'morning' });
    }
  } else if (s === 'noon') {
    q.push({ id:'meal', arg:'lunch' });
  } else if (s === 'afternoon') {
    if (d === 1) q.push({ id:'call_invite' }, { id:'activity', arg:'afternoon' });
    else if (d === S.ivDay) q.push({ id:'iv_result' }, { id:'activity', arg:'afternoon' });
    else if (work) {
      if (S.bugs.some(b => b.due <= d)) q.push({ id:'bug_back' });
      q.push({ id:'task', arg:{ first } });
      if (!first) maybeEvent(q, 'workafternoon');
      q.push({ id:'endwork', arg:{} });
    } else { maybeEvent(q, 'freeafternoon'); q.push({ id:'activity', arg:'afternoon' }); }
  } else if (s === 'evening') {
    if (S.otTonight === true) q.push({ id:'ot' });
    else if (S.otTonight === 'home') q.push({ id:'meal', arg:'dinner' }, { id:'homework' });
    else { q.push({ id:'meal', arg:'dinner' }); if (S.day === 2 && S.bg !== 'nha' && !S.once.plan) { S.once.plan = true; q.push({ id:'plan' }); } else if (S.day >= FIN.FAM_EVENT_DAY && !S.once.fam) { S.once.fam = true; q.push({ id:'ev', arg:'fam_' + (S.fam || 'tb') }); } else maybeEvent(q, 'evening'); q.push({ id:'activity', arg:'evening' }); }
  } else if (s === 'night') {
    if (S.flags.gamedTonight && chance(.6)) q.push({ id:'ev', arg:'morebattle' });
    if (S.stat.miTom >= 3 && !S.once.noodle) { S.once.noodle = true; q.push({ id:'ev', arg:'noodle' }); }
    q.push({ id:'bedtime' }, { id:'dayReport' });
  }
  if (s === 'morning' || s === 'afternoon' || s === 'evening') maybeMsg(s);
  S.queue = q;
}

function pushCommute(q){
  if (chance(.3)) q.push({ id:'ev', arg:'traffic' });
  else if (chance(.15)) q.push({ id:'ev', arg:'rain' });
}

function maybeEvent(q, ctx){
  const pool = shuffle(Object.entries(EVENTS).filter(([id, e]) => e.ctx && e.ctx.includes(ctx) && !S.once[id] && (!e.cond || e.cond())));
  for (const [id, e] of pool) {
    const p = typeof e.chance === 'function' ? e.chance() : e.chance;
    if (chance(p)) { S.once[id] = true; q.push({ id:'ev', arg:id }); return; }
  }
}

function advance(){
  let guard = 0;
  while (!S.queue.length && guard++ < 6) {
    const i = SLOTS.indexOf(S.slot);
    if (i >= SLOTS.length - 1) return startDay();
    S.slot = SLOTS[i+1];
    S.energy = Math.max(0, S.energy - BAL.SLOT_DRAIN);
    tickPhone();
    buildSlot();
  }
  S.cur = S.queue.shift();
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

