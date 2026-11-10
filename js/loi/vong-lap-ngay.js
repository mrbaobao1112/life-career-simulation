/* =========================================================
   VÒNG LẶP NGÀY
   ========================================================= */
function newGame(name, gender, bg, look, fam){
  const b = BAL.BG[bg];
  S = { v:6, advances:{}, fam: fam || 'tb', bills:[], loans:[], spend:{}, finDay:0, famHelp:{}, finLast:null, name, gender, bg, look: look || defaultLook(gender), phone:{ threads:{}, unread:{}, pending:{} }, hang:{}, tick:0, day:0, slot:'morning',
    money:b.money, energy:80, health:75, mood:65, tech:b.tech, soft:b.soft, nutr:60,
    rel:{ family:60, tung: bg === 'ghep' ? 66 : 60, linh:56, boss:50, dung:50, mai:50, phong:50 },
    job:null, applied:null, ivDay:0, cv:null, sleepDebt:0, eveEnergy:null, bedHour:23, meals:[], actLog:[], am:null, prep:0, iv:null, backupDay:0,
    bugs:[], unfinished:null, otTonight:false, perf:0, askCount:0, deck:[],
    flags:{}, once:{}, sleep:8, sleepLog:[], bedShift:0, hangover:false, lateToday:false,
    stat:{ miTom:0, lateNights:0, ot:0, study:0, run:0, calls:0, bugsMade:0, bugsFixed:0, tasks:0, lateWork:0, workDays:0 },
    memo:[], notes:[], queue:[], cur:null, d0:null, w0:null, phase:'play' };
  S.w0 = snap();
  startDay();
}

function startDay(){
  S.day++;
  S.slot = 'morning';
  S.notes = [];
  S.otTonight = false; S.unfinished = null; S.askCount = 0; S.bedShift = 0;
  S.flags.gamedTonight = false; S.flags.latePenalized = false;
  S.d0 = snap();
  S.flags.outLate = false;
  applyWake();
  if (goingOut()) { const f = Math.min(FIN.FUEL, S.money); if (f > 0) { S.money -= f; spendLog(f); note(`Xăng xe: −${fmt(f)}.`); } }
  clampAll();
  tickPhone();
  buildSlot();
  const fe = processFinance(), extra = [];
  for (const e of fe) { extra.push(e); if (e.id === 'payday') { if (S.bg === 'nha') extra.push({ id:'house_contrib' }); if (S.fam === 'kho' && S.flags.dutyPromise) extra.push({ id:'fam_send' }); } }
  if (extra.length) S.queue.splice(1, 0, ...extra);
  clampAll();
  advance();
}

