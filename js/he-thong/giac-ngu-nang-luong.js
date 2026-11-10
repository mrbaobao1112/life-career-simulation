/* =========================================================
   v3: NĂNG LƯỢNG, GIẤC NGỦ, THỜI GIAN BUỔI SÁNG, CÔNG THỨC CHỈ SỐ,
       THÓI QUEN ĂN UỐNG, CV, LOẠI SỰ KIỆN
   ========================================================= */
const CO_COLOR = { hotay:'#2F6FD1', banhmi:'#E9A23B', cudem:'#4B3F72', loren:'#8C5A3C' };
const energyCap = () => Math.round(100 - Math.max(0, 60 - S.health) * .6);

/* ----- Giấc ngủ: năng lượng sáng = năng lượng tối + hồi phục, trừ các hiệu ứng ----- */
function wakeRows(base, h, bed, debtBefore, hangover){
  // Thứ tự: năng lượng tối + hồi phục khi ngủ → giới hạn trần → trừ các hiệu ứng (để hậu quả không bị "che" bởi trần 100)
  const rows = [['Năng lượng trước khi ngủ', base, 'base'], [`Ngủ ${fmtH(h)}`, Math.round(h * BAL.SLEEP_RATE)]];
  let e = base + rows[1][1];
  const cap = energyCap();
  if (e > cap) { rows.push([cap < 100 ? `Phần vượt trần năng lượng (sức khỏe giới hạn ở ${cap})` : 'Phần vượt mức tối đa 100', cap - e]); e = cap; }
  const debt = Math.max(0, debtBefore + BAL.SLEEP_NEED - h);
  const pen = Math.min(BAL.DEBT_MAX_PENALTY, Math.round(debt * BAL.DEBT_PENALTY));
  if (pen) { rows.push([`Nợ ngủ tích lũy (${fmtH(debt)})`, -pen]); e -= pen; }
  if (hangover) { rows.push(['Dư âm bia hơi tối qua', -BAL.HANGOVER]); e -= BAL.HANGOVER; }
  if (bed >= 25) { rows.push(['Đi ngủ sau 1 giờ sáng', -BAL.LATE_BED_PENALTY]); e -= BAL.LATE_BED_PENALTY; }
  return { rows, e:Math.max(5, e), debt };
}
function applyWake(){
  S.wakeInfo = null; S.am = null; S.lateToday = false; S.lateMin = 0;
  if (S.day === 1) { S.energy = 80; return; }
  const h = S.sleep, base = S.eveEnergy ?? S.energy;
  const w = wakeRows(base, h, S.bedHour || 23, S.sleepDebt || 0, S.hangover);
  if (S.hangover) S.health -= 2;
  S.energy = w.e; S.sleepDebt = w.debt; S.wakeInfo = w.rows;
  if (h >= 7) S.mood += 2; else if (h < 5) { S.mood -= 5; S.health -= 2; } else if (h < 6) S.mood -= 2;
  S.sleepLog.push(h);
  S.flags.hangoverToday = S.hangover; S.hangover = false;
  note(`Ngủ ${fmtH(h)}: năng lượng ${base} lúc đi ngủ, ${S.energy} khi thức dậy.`);
  if (goingOut()) planMorning();
}
function wakeTable(){
  if (!S.wakeInfo) return '';
  return `<div class="ebreak"><div class="eb-h"><span>⚡ Năng lượng sáng nay</span><b>${S.energy}</b></div>${S.wakeInfo.map(([l, v, k]) =>
    `<div class="eb-r"><span>${l}</span><b class="${k === 'base' ? '' : v > 0 ? 'good' : 'bad'}">${k === 'base' ? v : (v > 0 ? '+' : '−') + Math.abs(v)}</b></div>`).join('')}</div>`;
}

/* ----- Buổi sáng: dậy + chuẩn bị + đi đường + chậm trễ = giờ đến ----- */
const hm = m => clock(m / 60);
function commuteTo(d){ const c = isWorkday(d) ? S.job.co : d === S.backupDay ? 'loren' : S.applied; return BAL.COMMUTE[S.bg][c] || 30; }
function alarmFor(d){
  if (d > 7) return S.job ? (BAL.APPOINT - BAL.PREP_MIN - (BAL.COMMUTE[S.bg][S.job.co] || 30) - BAL.BUFFER_MIN) / 60 : BAL.WAKE_FREE;
  if (goingOut(d)) return (BAL.APPOINT - BAL.PREP_MIN - commuteTo(d) - BAL.BUFFER_MIN) / 60;
  return d >= 6 ? BAL.WAKE_WEEKEND : BAL.WAKE_FREE;
}
function planMorning(){
  const commute = commuteTo(S.day), wake = Math.round(alarmFor(S.day) * 60);
  const p = Math.min(.7, .04 + (S.sleepDebt || 0) * .07 + (S.flags.hangoverToday ? .25 : 0));
  const over = chance(p) ? 10 + Math.floor(Math.random() * 31) : 0;
  S.am = { wake, prep:BAL.PREP_MIN, commute, delays: over ? [['Ngủ quên sau báo thức', over]] : [] };
  if (over) note(`Ngủ quên ${over} phút sau báo thức.`);
  recalcArrival();
}
function recalcArrival(){
  if (!S.am) { S.lateToday = false; S.lateMin = 0; return; }
  const a = S.am; a.arrive = a.wake + a.prep + a.commute + a.delays.reduce((x, d) => x + d[1], 0);
  S.lateMin = Math.max(0, a.arrive - BAL.APPOINT); S.lateToday = S.lateMin > 0;
}
function addDelay(label, min){ if (!S.am) return; S.am.delays.push([label, min]); recalcArrival(); }
const arrClock = () => S.am ? hm(S.am.arrive) : '09:00';
const arrEarly = () => { const n = S.am ? BAL.APPOINT - S.am.arrive : 10; return n > 0 ? `sớm ${n} phút` : 'vừa kịp giờ'; };
function arriveTxt(){ if (!S.am) return ''; return S.lateToday ? `Dự kiến đến lúc ${arrClock()}, muộn ${S.lateMin} phút.` : `Dự kiến đến lúc ${arrClock()}, vẫn kịp giờ.`; }
function morningLine(){
  const a = S.am; if (!a) return '';
  const ds = a.delays.map(d => `${d[0].toLowerCase()} ${d[1] > 0 ? '+' : '−'}${Math.abs(d[1])} phút`).join(', ');
  return `🕘 Báo thức ${hm(a.wake)}, chuẩn bị ${a.prep} phút, đi xe máy ${a.commute} phút${ds ? ', ' + ds : ''}. Dự kiến đến lúc <b>${hm(a.arrive)}</b> (hẹn 09:00)${S.lateToday ? `, <span class="warn">muộn ${S.lateMin} phút</span>` : ''}.`;
}

/* ----- Ban đêm: dinh dưỡng, áp lực công việc, tinh thần về mức trung bình, áp lực tài chính ----- */
