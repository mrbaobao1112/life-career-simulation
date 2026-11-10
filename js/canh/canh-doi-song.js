/* ----- Bữa ăn ----- */
SC.meal = (kind) => {
  const work = kind === 'lunch' && isWorkday();
  let intro;
  if (work) intro = S.day === S.job.start ? 'Mười hai giờ. Cả team rủ bạn đi ăn trưa cùng.' : 'Mười hai giờ. Cả tầng đồng loạt đứng dậy như được lập trình sẵn.';
  else if (kind === 'lunch') intro = S.day === S.ivDay ? 'Phỏng vấn xong, bụng bạn nhắc rằng sáng nay bạn quên ăn sáng vì hồi hộp.' : 'Đến giờ ăn trưa.';
  else intro = S.otTonight === 'home' ? 'Về đến nhà, ăn tối trước đã.' : 'Trời tối dần. Đến giờ ăn tối.';
  const c = [];
  if (work) {
    c.push({ key:'team', icon:'🍱', label:'Cơm văn phòng với team', cost:35000, hints:['🥗 Khá','🤝 +Đồng nghiệp'], fx:() => {
      logMeal('rice'); rel('mai',3); rel('phong',3); S.mood += 2;
      return pick(['Hôm nay có sườn xào chua ngọt. Chị Mai kể chuyện con mèo nhà chị biết tự mở tủ lạnh. Cả bàn cười.',
                   'Phong than thở về task của cậu ấy. Bạn thấy nhẹ lòng vì không chỉ mình mình khổ.']); } });
    c.push({ key:'bread', icon:'🥖', label:'Bánh mì, ăn tại bàn', cost:20000, hints:['⏱ Tiết kiệm thời gian','⚡ +3','🥗 Thiếu chất'], fx:() => { logMeal('bread'); S.energy += 3;
      return 'Bạn vừa ăn vừa đọc lại code buổi sáng. Vụn bánh mì rơi vào bàn phím. Phím cách bây giờ hơi giòn.'; } });
    c.push({ key:'bun', icon:'🍢', label:'Bún chả quán quen gần công ty', cost:55000, hints:['🙂 +5','🥗 Khá'], fx:() => { logMeal('bun'); S.mood += 5;
      return 'Bún chả nướng than, nước chấm vừa miệng. Trong 20 phút, deadline không còn tồn tại.'; } });
    c.push({ key:'nap', icon:'😴', label:'Nhịn ăn, gục xuống bàn ngủ trưa', hints:['⚡ +12','🥗 Bỏ bữa'], fx:() => { logMeal('skip'); S.energy += 12; note('Bỏ bữa trưa.');
      return 'Bạn ngủ trưa 30 phút, tỉnh dậy với vết hằn bàn phím trên má. Chữ “F5” in ngược rất rõ.'; } });
  } else {
    if (S.bg === 'nha') c.push({ key:'home', icon:'🍚', label:'Cơm mẹ nấu', hints:['🏠 0đ nhờ ở cùng bố mẹ','🥗 Rất đủ chất','🤝 +Bố mẹ'], fx:() => { logMeal('home'); rel('family',2);
      if (!S.job) { S.mood -= 1; return 'Mẹ gắp cho bạn miếng cá kèm câu hỏi: “Thế có công ty nào gọi chưa con?” Miếng cá ngon, câu hỏi thì hơi khó nuốt.'; }
      return 'Bố hỏi công ty có xa không, có phải trực đêm không. Bạn giải thích về công việc, bố gật gù dù rõ ràng là không hiểu lắm.'; } });
    if (S.bg === 'tro') c.push({ key:'cook', icon:'🥬', label:'Đi chợ tự nấu ăn', cost:45000, hints:['🥗 Rất đủ chất','⚡ −6','⏱ Tốn công'], fx:() => { logMeal('cook'); S.energy -= 6;
      return 'Đĩa rau muống xào tỏi và quả trứng rán. Đơn giản, rẻ, và bạn tự hào về bản thân một cách hơi quá mức.'; } });
    if (S.bg === 'ghep') c.push({ key:'cook', icon:'🥬', label:'Nấu chung với Tùng, chia đôi tiền chợ', cost:25000, hints:['🥗 Rất đủ chất','🤝 +Tùng','🎲 Tùng hay quên góp'], fx:() => {
      logMeal('cook'); S.energy -= 4; rel('tung',3);
      if (chance(.3)) { S.money -= 25000; S.stat.tungForgot = (S.stat.tungForgot || 0) + 1;
        return 'Đến lúc tính tiền, Tùng vỗ túi: “Ơ, tao để ví đâu nhỉ?” Bạn trả luôn phần của Tùng. Lần này nữa thôi.'; }
      return 'Bạn nấu, Tùng phụ trách rửa rau và khen. Nồi canh rau ngót hơi mặn nhưng không ai phàn nàn.'; } });
    c.push({ key:'rice', icon:'🍛', label:'Cơm bụi đầu ngõ', cost:35000, hints:['🥗 Khá'], fx:() => { logMeal('rice');
      return 'Cô bán hàng bắt đầu nhớ mặt bạn. Hôm nay được thêm một quả trứng kho.'; } });
    c.push({ key:'noodle', icon:'🍜', label:'Mì tôm', cost:6000, hints:['💸 Rẻ nhất','🥗 Thiếu chất'], fx:() => {
      logMeal('noodle'); S.stat.miTom++; const n = W('miTom'); note(`Mì tôm lần thứ ${n}.`);
      if (n === 1) return 'Mì tôm trứng. Nhanh, rẻ, và có một vị ngọt gọi là “tiết kiệm”. Một bữa thế này thì chẳng sao.';
      if (n === 2) return 'Lại mì tôm. Gói mì nhìn bạn với ánh mắt thương hại.';
      return `Mì tôm lần thứ ${n}. Bạn bắt đầu phân biệt được vị “tôm chua cay” và “tôm chua cay đặc biệt”.`; } });
    c.push({ key:'app', icon:'🛵', label:'Gọi đồ ăn qua ứng dụng', cost:75000, hints:['⏱ Không mất công','⚡ +4','🙂 +4','🎲 Chất lượng tùy món'], fx:() => {
      const dish = pick(APP_DISHES); logMeal('app', dish.v); S.mood += 4; S.energy += 4;
      return `Bạn gọi ${dish.name}. ${dish.t}`; } });
  }
  if (!c.some(x => !x.cost || x.cost <= S.money)) {
    c.push({ key:'tab', icon:'📒', label:'Ăn chịu ở quán cơm bụi quen', hints:['📒 Ghi nợ 35.000đ, trả trong 7 ngày'], noSpend:true, fx:() => { logMeal('rice');
      (S.bills = S.bills || []).push({ id:`tab-${S.day}-${kind}`, kind:'tab', name:'Tiền ăn chịu quán cơm', amount:35000, due:S.day + 7, paid:false });
      return 'Cô bán hàng ghi tên bạn vào cuốn sổ nhỏ. Cuốn sổ có vẻ đã chứng kiến nhiều thế hệ sinh viên.'; } });
    c.push({ key:'skip', icon:'😶', label:'Nhịn bữa này', hints:['🥗 Bỏ bữa','🙂 −3'], fx:() => { logMeal('skip'); S.mood -= 3; return 'Bạn uống một cốc nước thật to và tự nhủ là mình không đói.'; } });
  }
  return { icon: kind === 'lunch' ? '🍽️' : '🌆', title: kind === 'lunch' ? 'Bữa trưa' : 'Bữa tối',
    html: P(intro), choices: c };
};

/* ----- Hoạt động tự do ----- */
SC.activity = (slot) => {
  const list = ACTS.filter(a => a.slots.includes(slot) && (!a.cond || a.cond()));
  const intro = { morning:'Buổi sáng còn nguyên phía trước.', afternoon:'Buổi chiều rảnh rỗi.',
                  evening: isWorkday() ? 'Tan làm rồi. Buổi tối là của bạn.' : 'Buổi tối rảnh rỗi.' }[slot];
  return { icon:'🗓️', title: { morning:'Sáng nay làm gì?', afternoon:'Chiều nay làm gì?', evening:'Tối nay làm gì?' }[slot],
    html: P(intro, S.energy < 25 ? '<span class="warn">Bạn đang rất mệt. Nghỉ ngơi có lẽ là lựa chọn khôn ngoan.</span>' : ''),
    choices: list.map(a => ({ icon:a.icon, label:a.label, short:ACT_SHORT[a.id], hints: repeatCount(a.id) ? [...a.hints, '😐 Làm gần đây rồi, hiệu quả giảm'] : a.hints, cost:a.cost, fx:a.fx, bg:ACT_BG[a.id], npc:ACT_NPC[a.id], actId:a.id })) };
};

/* ----- Đi ngủ & nhật ký ----- */
SC.bedtime = () => {
  const wake = alarmFor(S.day + 1);
  let opts = [
    { h:22.5, icon:'🌙', label:'22:30, ngủ sớm như người có kỷ luật' },
    { h:23.5, icon:'🛏️', label:'23:30, giờ ngủ của người bình thường' },
    { h:24.5, icon:'📱', label:'00:30, lướt điện thoại thêm “5 phút”' },
    { h:26,   icon:'🦉', label:'02:00, cú đêm chính hiệu' },
  ];
  if (S.otTonight === true || S.flags.lateOT) opts = opts.filter(o => o.h > 23);
  const shiftLine = S.bedShift ? `<span class="warn">Vì ${S.bedShift >= 1 ? '“thêm một trận nữa”' : 'cốc cà phê đặc buổi sáng'}, giờ ngủ thật sẽ muộn hơn ${fmtH(S.bedShift)}.</span>` : '';
  return { icon:'🛌', title:'Đi ngủ',
    html: P(`Báo thức ngày mai: <b>${clock(wake)}</b>. Ngủ ít hơn ${fmtH(BAL.SLEEP_NEED)} sẽ tích lũy nợ ngủ.${S.sleepDebt >= .5 ? ` Bạn đang nợ ngủ ${fmtH(S.sleepDebt)}.` : ''}`, shiftLine),
    choices: opts.map(o => {
      const bed = o.h + S.bedShift, hrs = wake + 24 - bed;
      const est = wakeRows(S.energy, hrs, bed, S.sleepDebt || 0, S.hangover).e;
      return { h:o.h, icon:o.icon, label:o.label, hints:[`😴 Ngủ ${fmtH(hrs)}`, `⚡ Sáng mai khoảng ${est}`], fx:() => {
        S.sleep = hrs; S.bedHour = bed; S.eveEnergy = S.energy; if (S.bg === 'nha' && (S.flags.outLate || S.flags.lateOT)) { rel('family', -2); note('Về nhà sau 23 giờ, mẹ vẫn ngồi chờ ở phòng khách.'); } S.flags.lateOT = false;
        if (bed >= 24.5) S.stat.lateNights++;
        nightly();
        return { silent:true }; } };
    }) };
};

function previewTomorrow(){
  const d = S.day + 1;
  if (d > LAST_DAY) return '';
  if (d === S.ivDay) return `Ngày mai: phỏng vấn ở ${COMPANIES[S.applied].name}, 9 giờ sáng.`;
  if (S.job && d === S.job.start) return `Ngày mai: ngày đầu tiên đi làm ở ${COMPANIES[S.job.co].name}. Nhớ đặt báo thức.`;
  if (isWorkday(d)) return 'Ngày mai: đi làm, có mặt lúc 9 giờ.';
  if (isHoliday(d)) return 'Ngày mai: nghỉ Tết Dương lịch.';
  if (isWeekend(d)) return 'Ngày mai: cuối tuần!';
  return 'Ngày mai: chưa có lịch gì.';
}

SC.dayReport = (arg) => {
  const now = snap(), d0 = S.d0, di = dayInfo();
  const ff = arg && arg.ff && S.ffSum;                       // vừa tua xong nhiều ngày: hiện bảng gộp
  const chips = diffChips(d0, now, true);
  const notes = S.notes.slice(-6);
  const sunday = di.wd === 0, last = S.day >= LAST_DAY, stop = last || sunday ? null : nextStop();
  return { kind:'journal', title: ff ? `Đã tua từ ${fmtD(S.ffSum.from)} đến ${fmtD(S.ffSum.to)}` : `Nhật ký ${di.dow.toLowerCase()}, ${fmtD(S.day)}`,
    html: ff ? ffSumHTML() + (previewTomorrow() ? `<p class="tomorrow">${previewTomorrow()}</p>` : '')
      : `${chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : '<p>Một ngày không có gì thay đổi nhiều. Cũng là một kiểu bình yên.</p>'}
           ${notes.length ? `<ul>${notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
           ${previewTomorrow() ? `<p class="tomorrow">${previewTomorrow()}</p>` : ''}`,
    choices: last ? [{ icon:'🏁', label:'Xem tổng kết bản chơi thử', fx:() => ({ go:'week' }) }]
      : sunday ? [{ icon:'📊', label:'Xem tổng kết tuần', fx:() => ({ go:'week' }) }]
      : [{ icon:'📆', label:'Bóc lịch, sang ngày mới', fx:() => ({ go:'nextday' }) },
         { icon:'⏩', label:`Tua đến ${fmtD(stop.day)}`, desc:`Các ngày ở giữa tự trôi theo nếp. Dừng ở: ${stop.why}.`, fx:() => ({ go:'ff' }) }] };
};
