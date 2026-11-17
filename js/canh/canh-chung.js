/* =========================================================
   CÁC CẢNH
   ========================================================= */
function bgLine(){
  return { nha:'Mẹ đi chợ về, đặt bát xôi lên bàn kèm câu hỏi quen thuộc: “Hôm nay đi nộp hồ sơ chưa con?”',
           tro:'Phòng trọ 15 mét vuông yên tĩnh lạ thường. Tiếng động duy nhất là tiếng tủ lạnh, và nó cũng đang trống.',
           ghep:'Tùng vẫn đang ngủ, một chân thò ra khỏi chăn, tay vẫn cầm tay cầm chơi game.' }[S.bg];
}
function sleepLine(h){
  if (h >= 8) return `Bạn ngủ một giấc ngon lành ${fmtH(h)}, tỉnh dậy thấy đời đẹp hơn một chút.`;
  if (h >= 7) return `Ngủ được ${fmtH(h)}. Ổn áp.`;
  if (h >= 6) return `Ngủ ${fmtH(h)}. Hơi thiếu, nhưng một cốc cà phê sẽ giải quyết được (một phần).`;
  if (h >= 5) return `Ngủ có ${fmtH(h)}. Mắt bạn đã mở, nhưng não vẫn đang tải.`;
  return `Ngủ vỏn vẹn ${fmtH(h)}. Bạn suýt đánh răng bằng sữa rửa mặt và mất 30 giây mới nhận ra.`;
}
function todayLine(){
  const d = S.day;
  if (d === S.ivDay) return `Hôm nay: phỏng vấn ở ${co().name} lúc 9 giờ.`;
  if (isWorkday() && d === S.job.start) return `Hôm nay: ngày đầu tiên đi làm ở ${co().name}.`;
  if (isWorkday()) return `Hôm nay: một ngày làm việc ở ${co().name}.`;
  if (leaveOn(d)) return `Hôm nay bạn ${LEAVE_TYPE[leaveOn(d).type].name.toLowerCase()}${leaveOn(d).to > d ? `, còn nghỉ đến hết ${fmtD(leaveOn(d).to)}` : ''}. Văn phòng vẫn chạy, chỉ là không có bạn.`;
  if (isHoliday(d)) return 'Hôm nay nghỉ Tết Dương lịch. Cả thành phố ngủ nướng.';
  if (isWeekend(d)) return 'Hôm nay là cuối tuần. Không có lịch gì, và đó chính là lịch.';
  if (d === S.backupDay) return 'Hôm nay chưa có lịch gì. Điện thoại vẫn im lặng.';
  if (!S.job && d > 1) return 'Hôm nay không có lịch phỏng vấn nào. Thời gian thì nhiều, tiền thì không.';
  return '';
}
function nutrWord(){ return foodProfile().label.toLowerCase(); }

const SC = {};

// Nằm thêm sau báo thức: số lần đã nằm thêm hôm nay, và giờ thức dậy thật (phút)
const snoozeN = () => S.flags.snooze && S.flags.snooze.d === S.day ? S.flags.snooze.n : 0;
function wakeMin(){
  if (S.am) return S.am.wake + S.am.delays.filter(x => /^(Ngủ quên|Nằm thêm)/.test(x[0])).reduce((a, x) => a + x[1], 0);
  return Math.round(alarmFor(S.day) * 60) + snoozeN() * BAL.SNOOZE_MIN;
}
SC.wake = () => {
  const d = S.day, di = dayInfo(d), n = snoozeN();
  const lines = [`<div class="quote">Lịch bóc hôm nay: “${di.quote}”</div>`];
  if (d === 1) lines.push(P('Sáng thứ Hai đầu tiên sau lễ tốt nghiệp. Tấm bằng đã treo trên tường, còn việc làm thì chưa thấy đâu.', bgLine()));
  else lines.push(P(sleepLine(S.sleep), S.flags.hangoverToday ? 'Đầu bạn nặng như vừa cài lại hệ điều hành. Đây là tác dụng phụ của bia hơi tối qua.' : '', todayLine()));
  if (n) lines.push(P(`Đã nằm thêm ${n * BAL.SNOOZE_MIN} phút. Bây giờ là ${hm(wakeMin())}.${S.am ? ' ' + arriveTxt() : ''}`));
  // Nằm thêm: dùng chung cho mọi ngày; đi làm, đi phỏng vấn thì giờ đến lùi theo
  const snooze = n < BAL.SNOOZE_MAX ? [{ key:'snooze', icon:'😴', label: n === BAL.SNOOZE_MAX - 1 ? `Nằm thêm ${BAL.SNOOZE_MIN} phút (lần cuối)` : `Nằm thêm ${BAL.SNOOZE_MIN} phút`,
    hints:[`⚡ +${BAL.SNOOZE_ENERGY}`, `⏱ +${BAL.SNOOZE_MIN} phút`], fx:() => {
      S.flags.snooze = { d:S.day, n:snoozeN() + 1 }; S.energy += BAL.SNOOZE_ENERGY; addDelay('Nằm thêm', BAL.SNOOZE_MIN);
      note(`Nằm thêm ${BAL.SNOOZE_MIN} phút sau báo thức.`); S.queue.unshift({ id:'wake' });
      return { silent:true }; } }] : [];
  let choices;
  if (d === 1) choices = [{ key:'up', icon:'☀️', label:'Dậy thôi, bắt đầu hành trình', fx:() => ({ silent:true }) }, ...snooze];
  else if (goingOut()) choices = [{ key:'up', icon:'☀️', label:'Dậy ngay', fx:() => ({ silent:true }) }, ...snooze];
  else choices = [
    { key:'up', icon:'☀️', label:'Dậy thôi', fx:() => ({ silent:true }) }, ...snooze,
    { key:'late', icon:'🛏️', label:'Ngủ nướng tới trưa', hints:['⚡ +15','🙂 +4','Bỏ qua buổi sáng'], fx:() => {
      S.energy += 15; S.mood += 4; S.queue = S.queue.filter(r => r.id !== 'activity');
      return 'Bạn mở mắt lúc 11 giờ 40. Buổi sáng đã trôi qua, nhẹ nhàng như chưa từng tồn tại.'; } },
  ];
  return { icon:'⏰', title:`${di.dow}, ${fmtD(d)}`, html: lines.join(''), choices };
};
// Trước khi đi làm, đi phỏng vấn: ở nhà chuẩn bị rồi ra khỏi nhà.
// Ra khỏi nhà lúc nào (trong thế giới tự do) thì giờ đến công ty lùi hoặc sớm hơn đúng chừng ấy, qua addDelay có sẵn.
// Không ở thế giới tự do (tua nhanh, tắt chế độ) thì ra khỏi nhà đúng giờ như trước.
const leaveBy = () => S.am ? BAL.APPOINT - S.am.commute : 8 * 60;
const plannedLeave = () => wakeMin() + (S.am ? S.am.prep : BAL.PREP_MIN);
SC.home_am = () => ({ icon:'🎒', title: S.day === S.ivDay ? 'Chuẩn bị đi phỏng vấn' : 'Chuẩn bị đi làm',
  html: P(`Phải ra khỏi nhà trước <b>${hm(leaveBy())}</b> để kịp giờ. Có thể tắm, ăn sáng nhanh trước khi đi.`),
  choices:[{ key:'go', icon:'🛵', label:'Ra khỏi nhà', fx:() => {
    const t = Math.round(typeof ROAM_NOW === 'number' ? ROAM_NOW * 60 : plannedLeave()), diff = Math.max(t - plannedLeave(), BAL.PREP_FAST - (S.am ? S.am.prep : BAL.PREP_MIN));   // vội mấy cũng mất ít nhất PREP_FAST phút
    if (diff) addDelay(diff > 0 ? 'Ra khỏi nhà muộn' : 'Chuẩn bị nhanh gọn', diff);
    const was = ROAM_NOW; ROAM_NOW = t / 60; feedAdd({ id:'home_am' }, '🛵', `Ra khỏi nhà lúc ${hm(t)}.${S.lateToday ? ` Sẽ muộn ${S.lateMin} phút.` : ''}`, 0); ROAM_NOW = was;
    return { silent:true }; } }] });

