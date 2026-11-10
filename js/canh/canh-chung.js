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
  if (d >= 6) return 'Hôm nay là cuối tuần. Không có lịch gì, và đó chính là lịch.';
  if (d === S.backupDay) return 'Hôm nay chưa có lịch gì. Điện thoại vẫn im lặng.';
  if (!S.job && d > 1) return 'Hôm nay không có lịch phỏng vấn nào. Thời gian thì nhiều, tiền thì không.';
  return '';
}
function nutrWord(){ return foodProfile().label.toLowerCase(); }

const SC = {};

SC.wake = () => {
  const d = S.day, di = DAYS[d];
  const lines = [`<div class="quote">Lịch bóc hôm nay: “${di.quote}”</div>`];
  if (d === 1) lines.push(P('Sáng thứ Hai đầu tiên sau lễ tốt nghiệp. Tấm bằng đã treo trên tường, còn việc làm thì chưa thấy đâu.', bgLine()));
  else lines.push(P(sleepLine(S.sleep), S.flags.hangoverToday ? 'Đầu bạn nặng như vừa cài lại hệ điều hành. Đây là tác dụng phụ của bia hơi tối qua.' : '', todayLine()));
  let choices;
  if (d === 1) choices = [{ icon:'☀️', label:'Dậy thôi, bắt đầu hành trình', fx:() => ({ silent:true }) }];
  else if (goingOut()) choices = [
    { icon:'☀️', label:'Dậy ngay', fx:() => ({ silent:true }) },
    { icon:'🛏️', label:'Nằm thêm 15 phút', hints:['⚡ +5','⏱ +15 phút'], fx:() => {
      S.energy += 5; addDelay('Nằm thêm', 15);
      return `Mười lăm phút trôi qua như mười lăm giây. Bạn bật dậy, vừa mặc áo vừa đánh răng. ${arriveTxt()}`; } },
  ];
  else choices = [
    { icon:'☀️', label:'Dậy thôi', fx:() => ({ silent:true }) },
    { icon:'🛏️', label:'Ngủ nướng tới trưa', hints:['⚡ +15','🙂 +4','Bỏ qua buổi sáng'], fx:() => {
      S.energy += 15; S.mood += 4; S.queue = S.queue.filter(r => r.id !== 'activity');
      return 'Bạn mở mắt lúc 11 giờ 40. Buổi sáng đã trôi qua, nhẹ nhàng như chưa từng tồn tại.'; } },
  ];
  return { icon:'⏰', title:`${di.dow}, ${di.date}/11`, html: lines.join(''), choices };
};

