/* ----- Ngày đầu đi làm ----- */
SC.ob_arrive = () => ({
  icon:co().icon, title:`Ngày đầu ở ${co().name}`,
  html: P(S.lateToday ? `Bạn đến lúc ${arrClock()}, muộn ${S.lateMin} phút vào đúng ngày đầu tiên. Chị HR bảo “không sao đâu em” bằng giọng của người sẽ nhớ chuyện này rất lâu.`
                      : `Bạn đến lúc ${arrClock()}, ${arrEarly()}. Cửa văn phòng còn khóa. Bạn đứng chờ cùng chú bảo vệ và một chậu cây.`,
          'Chị HR dẫn bạn đi một vòng, đưa thẻ nhân viên và một chiếc laptop dán đầy sticker của người dùng trước.'),
  choices: [
    { icon:'🙏', label:'“Em cảm ơn chị, em sẽ giữ gìn cẩn thận.”', fx:() => { applyLate(); S.soft += 1; S.stat.workDays++;
      return 'Chị HR gật đầu hài lòng. Bạn ôm chiếc laptop như ôm một chiếc cúp.'; } },
    { icon:'🤔', label:'Tò mò hỏi về chủ cũ của chiếc laptop', fx:() => { applyLate(); S.mood += 2; S.stat.workDays++;
      return 'Chị HR ngập ngừng: “Bạn ấy… chuyển sang công ty khác rồi em.” Trên laptop có dán sticker “Tôi không sợ deadline”. Sticker đã bong một nửa.'; } },
  ],
});

SC.ob_env = () => ({
  icon:'💻', title:'Cài môi trường làm việc',
  html: P('Nhiệm vụ đầu tiên: làm cho dự án chạy được trên máy mình. Tài liệu hướng dẫn được cập nhật lần cuối từ hai năm trước.'),
  choices: [
    { icon:'📘', label:'Làm theo tài liệu từng bước', hints:['🧠 +2','⚡ −12','🙂 −3'], fx:() => { S.tech += 2; S.energy -= 12; S.mood -= 3;
      return 'Bước 7 dẫn đến một đường link đã chết. Bạn tự mò ra cách, mất trọn buổi sáng, nhưng giờ bạn hiểu dự án hơn hẳn.'; } },
    { icon:'🎧', label:'Hỏi anh Dũng (senior)', hints:['⏱ Nhanh','🤝 +Anh Dũng'], fx:() => { rel('dung',4); S.energy -= 5; S.tech += 1;
      return 'Anh Dũng tháo một bên tai nghe, gõ ba lệnh, xong. “Tài liệu cũ rồi em, lần sau cứ hỏi anh.” Anh đeo tai nghe lại.'; } },
    { icon:'🔍', label:'Tìm trên mạng rồi thử đại', hints:['🎲 Hên xui'], fx:() => {
      if (chance(.5)) { S.tech += 1; S.mood += 3; return 'Một bài viết từ năm 2019 cứu bạn. Bạn thầm cảm ơn người lạ đã viết nó.'; }
      S.energy -= 15; S.mood -= 5; rel('dung',2);
      return 'Sau khi thử 6 cách trên mạng, máy bạn có thêm 3 thứ không ai cần. Cuối cùng vẫn phải hỏi anh Dũng.'; } },
  ],
});

SC.ob_team = () => ({
  icon:'👋', title:'Gặp gỡ cả team',
  html: P('Trước giờ trưa, chị Hạnh (trưởng nhóm) giới thiệu bạn với mọi người: anh Dũng (senior, lúc nào cũng đeo tai nghe), chị Mai (tester, tìm ra bug nhanh hơn bạn tạo ra bug) và Phong (fresher cùng đợt, trông còn hoảng hơn bạn).'),
  choices: [
    { icon:'🍪', label:'Mời cả team bánh kẹo ra mắt', cost:80000, hints:['🤝 +5 với cả team'], fx:() => {
      ['boss','dung','mai','phong'].forEach(k => rel(k,5)); S.soft += 1; memo('Mời bánh cả team ngày đầu đi làm');
      return 'Hộp bánh hết trong 4 phút. Chị Mai tuyên bố bạn là “người mới đáng yêu nhất năm”.'; } },
    { icon:'🤝', label:'Chào hỏi từng người thật lịch sự', hints:['🤝 +2 với cả team'], fx:() => {
      ['boss','dung','mai','phong'].forEach(k => rel(k,2)); S.soft += 1;
      return 'Bạn bắt tay từng người. Anh Dũng bắt tay mà không tháo tai nghe, nhưng có gật đầu.'; } },
    { icon:'🙂', label:'Cười chào chung rồi về chỗ ngồi', fx:() => { rel('phong',2);
      return 'Bạn về chỗ. Phong nhắn qua nhóm chat nội bộ: “Ông cũng sợ à? Tôi cũng thế.”'; } },
  ],
});

/* ----- Ngày làm việc ----- */
SC.standup = () => ({
  icon:'🧍', title:'Họp đầu ngày',
  html: P('Chín giờ, cả team đứng quanh bảng công việc.',
          S.lateToday ? `Bạn lẻn vào lúc ${arrClock()}, muộn ${S.lateMin} phút. Chị Hạnh không nói gì, chỉ nhìn đồng hồ treo tường. Cái đồng hồ đó giờ là kẻ thù của bạn.` : '',
          S.flags.hangoverToday ? 'Đầu bạn vẫn còn ong ong vì bia hơi tối qua.' : '',
          'Đến lượt bạn báo cáo.'),
  choices: [
    { icon:'🎯', label:'Báo cáo ngắn gọn, rõ ràng', hints:['🗣️ +1','🤝 +Chị Hạnh'], fx:() => { applyLate(); S.stat.workDays++; S.soft += 1; rel('boss',1);
      return 'Hôm qua làm gì, hôm nay làm gì, có vướng gì không. Ba câu. Chị Hạnh gật đầu hài lòng.'; } },
    { icon:'📜', label:'Kể chi tiết mọi thứ mình đã làm', fx:() => { applyLate(); S.stat.workDays++; rel('boss',-1); S.energy -= 3;
      return 'Bạn nói 6 phút. Anh Dũng bắt đầu nhìn trần nhà. Chị Hạnh nhắc khéo: “Em nói ý chính thôi nhé.”'; } },
    { icon:'🤐', label:'“Em vẫn đang làm tiếp ạ.”', fx:() => { applyLate(); S.stat.workDays++; rel('boss',-1);
      return 'Ngắn thì ngắn thật. Chị Hạnh hỏi “làm tiếp cái gì em?”, và bạn phải nói lại từ đầu.'; } },
  ],
});

function drawTask(easy){
  if (!S.deck.length) S.deck = shuffle(TASKS.map(t => t.id));
  let i = easy ? S.deck.findIndex(id => TASK[id].d === 1) : 0;
  if (i < 0) i = 0;
  return S.deck.splice(i, 1)[0];
}

SC.task = (arg) => {
  const ref = S.cur;
  if (!ref.arg || typeof ref.arg !== 'object') ref.arg = {};
  if (!ref.arg.tid) { ref.arg.tid = drawTask(ref.arg.first); save(); }
  const t = TASK[ref.arg.tid];
  const lowE = (S.energy < 25 ? .18 : 0) - (S.mood - 50) / 500;
  const card = `<div class="ticket d${t.d}">
      <div class="tk-top"><span>#LCS-${t.id}</span><span>Độ khó ${'●'.repeat(t.d)}${'○'.repeat(3-t.d)}</span></div>
      <div class="tk-title">${t.icon} ${t.title}</div>
      <p class="tk-desc">${t.desc}</p>
      <div class="tk-meta">Hạn: ${DEADLINE[t.d]}</div></div>`;
  const intro = ref.arg.first
    ? '<p class="tip">Mỗi task là một lá bài. Không có cách xử lý nào đúng tuyệt đối: làm nhanh thì có rủi ro, làm kỹ thì tốn sức, hỏi người khác thì tốn… sự kiên nhẫn của họ.</p>'
    : P(S.slot === 'morning' ? 'Họp xong, task mới xuất hiện trên bảng của bạn.' : 'Buổi chiều, thêm một task nữa.');
  const warn = S.energy < 25 ? '<p class="warn">Năng lượng đang rất thấp. Làm gì lúc này cũng dễ hỏng hơn.</p>' : '';
  const n = S.askCount + 1;
  const choices = [
    { icon:'⚡', label:'Làm nhanh cho xong', hints:['⏱ Khoảng 1 giờ','⚠️ Có thể sót lỗi','⚡ −8'], fx:() => {
      S.energy -= 8; S.stat.tasks++; S.perf += 1;
      if (chance(.62 + S.tech/200 - t.d*.12 - lowE))
        return `Bạn xử lý “${t.title}” trong chưa đầy một tiếng. Chị Mai kiểm tra lại, không thấy vấn đề gì. Hôm nay vũ trụ đứng về phía bạn.`;
      S.stat.bugsMade++; S.bugs.push({ id:t.id, title:t.title, due:S.day + 1 });
      return `Xong “${t.title}” trong 40 phút, đẩy code lên luôn. Có một cảm giác mơ hồ là bạn đã quên kiểm tra trường hợp nào đó. Cảm giác này thường đúng.`; } },
    { icon:'🔬', label:'Làm kỹ từng bước', hints:['⏱ Khoảng 3 giờ','🧠 +2 Chuyên môn','⚡ −15'], fx:() => {
      S.energy -= 15; S.tech += 2; S.stat.tasks++;
      if (chance(.9 + S.tech/300 - t.d*.13 - lowE)) { S.perf += 2;
        return `Bạn làm “${t.title}” cẩn thận từng bước, viết cả ghi chú. Chị Mai test xong nhắn: “Sạch sẽ ghê.” Bạn học thêm được vài điều.`; }
      S.unfinished = t.title;
      return `Bạn làm kỹ đến mức… chưa xong. “${t.title}” khó hơn bạn tưởng. Hết giờ mà vẫn còn dang dở.`; } },
    { icon:'🎧', label:'Hỏi anh Dũng (senior)', hints: n <= 2 ? ['⏱ Nhanh','🤝 Anh Dũng sẵn lòng'] : ['⏱ Nhanh',`😬 Lần hỏi thứ ${n} hôm nay`], fx:() => {
      S.askCount++; S.energy -= 6; S.stat.tasks++; S.perf += 1;
      if (S.askCount <= 2) { rel('dung',4); S.tech += 1;
        return `Anh Dũng tháo một bên tai nghe, chỉ đúng chỗ cần sửa trong 2 phút. “${t.title}” xong gọn. Bạn học được một mẹo hay.`; }
      rel('dung',-6);
      return `Đây là lần thứ ${S.askCount} hôm nay bạn hỏi. Anh Dũng tháo tai nghe, thở dài rất khẽ, rồi vẫn chỉ cho bạn. Task xong, nhưng không khí hơi… lạnh.`; } },
    S.otTonight === true
      ? { icon:'🌙', label:'Gộp vào buổi OT tối nay', hints:['✅ Chắc chắn xong'], fx:() => { S.perf += 2; S.stat.tasks++;
          return `Bạn ghi “${t.title}” vào danh sách việc tối nay. Danh sách đó đang dài ra.`; } }
      : { icon:'🌙', label:'Để tối ở lại OT', hints:['✅ Chắc chắn xong','👍 Sếp để ý','🌙 Mất buổi tối'], fx:() => {
          S.otTonight = true; S.perf += 2; rel('boss',2); S.stat.tasks++;
          return `Bạn quyết định để “${t.title}” lại tối nay làm cho chắc. Chị Hạnh để ý và gật đầu. Buổi tối của bạn vừa chính thức thuộc về công ty.`; } },
  ];
  return { icon:'🗂️', title: ref.arg.first ? 'Task đầu tiên' : 'Task mới', html: intro + card + warn, choices };
};

SC.bug_back = () => {
  const b = S.bugs.find(x => x.due <= S.day);
  const done = () => { S.bugs = S.bugs.filter(x => x !== b); };
  return { icon:'🐞', title:'Lỗi quay lại',
    html: P(`Chị Mai đi thẳng đến bàn bạn, tay cầm điện thoại: “Em ơi, cái “${b.title}” hôm trước em làm ấy, khách vừa báo lỗi.”`,
            '<span class="tip">Đây là hậu quả của lựa chọn “làm nhanh” hôm trước.</span>'),
    choices: [
      { icon:'🛠️', label:'Nhận lỗi và sửa ngay', hints:['⚡ −12','🤝 +Chị Hạnh'], fx:() => { done(); S.energy -= 12; S.perf -= 1; rel('mai',2); rel('boss',2); S.stat.bugsFixed++;
        return 'Bạn xin lỗi, ngồi sửa trong một tiếng. Chị Hạnh nói: “Lỗi thì ai cũng có, nhận và sửa nhanh là được.” Bài học: nhanh hôm trước thì chậm hôm sau.'; } },
      { icon:'🙃', label:'“Trên máy em chạy bình thường mà chị.”', hints:['😬 Rủi ro'], fx:() => { done(); rel('mai',-6); rel('boss',-3); S.perf -= 2; S.stat.bugsFixed++;
        memo('Nói câu “trên máy em chạy bình thường”');
        return 'Câu nói huyền thoại của nghề. Chị Mai mở video quay lại lỗi. Bạn sửa trong im lặng, và trong ánh mắt của cả team.'; } },
      { icon:'🧋', label:'Nhờ Phong sửa giúp, hứa bao trà sữa', cost:40000, fx:() => { done(); rel('phong',-2); S.perf -= 1;
        return 'Phong sửa giúp với ánh mắt “ông nợ tôi”. Bạn mất một cốc trà sữa và một chút uy tín.'; } },
    ] };
};

SC.bug_weekend = () => {
  const b = S.bugs[0];
  return { icon:'📲', title:'Tin nhắn sáng thứ Bảy',
    html: P(`Mười giờ sáng thứ Bảy, điện thoại rung. Tin nhắn từ chị Hạnh: “Em ơi, cái “${b.title}” bị lỗi, khách đang hỏi. Em xem giúp chị được không?”`,
            '<span class="tip">Một lần “làm nhanh” trong tuần đã để lại lỗi.</span>'),
    choices: [
      { icon:'💻', label:'Mở laptop sửa luôn', hints:['⚡ −12','🙂 −6','Mất buổi sáng'], fx:() => {
        S.bugs = []; S.energy -= 12; S.mood -= 6; rel('boss',4); S.stat.bugsFixed++;
        S.queue = S.queue.filter(r => r.id !== 'activity');
        return 'Bạn sửa xong trước giờ trưa. Chị Hạnh nhắn: “Cảm ơn em nhiều.” Kèm một sticker con mèo giơ ngón cái.'; } },
      { icon:'📅', label:'Hẹn chị sáng thứ Hai sửa', fx:() => { S.bugs = []; rel('boss',-4); S.perf -= 2; S.flags.bugMonday = true;
        memo('Để lỗi tồn sang tuần sau');
        return 'Chị Hạnh trả lời: “Ok em.” Hai chữ. Bạn đọc lại 7 lần để phân tích cảm xúc.'; } },
      { icon:'👀', label:'Để chế độ “đã xem”', fx:() => { S.bugs = []; rel('boss',-8); S.perf -= 3; S.mood -= 3; S.flags.bugMonday = true;
        memo('Đã xem tin nhắn sếp nhưng không trả lời');
        return 'Bạn tắt màn hình. Nhưng tin nhắn vẫn ở đó, trong đầu bạn, suốt cả cuối tuần.'; } },
    ] };
};

SC.endwork = () => {
  const ref = S.cur;
  if (!ref.arg || typeof ref.arg !== 'object') ref.arg = {};
  if (ref.arg.ask === undefined) { ref.arg.ask = chance(co().ot); save(); }
  const head = 'Năm rưỡi chiều. Văn phòng bắt đầu có tiếng kéo ghế.';
  if (S.unfinished && S.otTonight !== true) {
    return { icon:'🕠', title:'Hết giờ làm', html: P(head, `Task “${S.unfinished}” vẫn còn dang dở.`),
      choices: [
        { icon:'🌙', label:'Ở lại OT cho xong', hints:['✅ Xong việc','🌙 Mất buổi tối'], fx:() => { S.otTonight = true; S.perf += 2; rel('boss',2);
          return 'Bạn báo với chị Hạnh là tối nay sẽ làm cho xong. Chị gật đầu.'; } },
        { icon:'🙏', label:'Xin chị Hạnh lùi hạn sang mai', fx:() => { S.unfinished = null; rel('boss',-3); S.perf -= 1;
          return 'Chị Hạnh đồng ý, kèm câu “lần sau em ước lượng thời gian kỹ hơn nhé”.'; } },
        { icon:'🏠', label:'Mang về nhà làm tiếp', hints:['🏠 Làm sau bữa tối'], fx:() => { S.otTonight = 'home'; S.perf += 1;
          return 'Bạn bỏ laptop vào ba lô. Ba lô nặng hơn hẳn, về cả nghĩa đen lẫn nghĩa bóng.'; } },
      ] };
  }
  if (S.otTonight !== true && ref.arg.ask) {
    return { icon:'🧭', title:'Chị Hạnh có việc nhờ',
      html: P(head, 'Chị Hạnh đi ngang qua: “Tối nay team cần người ở lại hỗ trợ đưa bản cập nhật lên. Em ở lại được không?”'),
      choices: [
        { icon:'💪', label:'“Dạ được ạ.”', hints:['👍 +Chị Hạnh','🌙 Mất buổi tối'], fx:() => { S.otTonight = true; S.perf += 2; rel('boss',5);
          return 'Chị Hạnh cười: “Cảm ơn em. Cơm hộp tối nay có đùi gà.”'; } },
        { icon:'🙅', label:'“Em xin phép tối nay có việc bận ạ.”', fx:() => { rel('boss',-2); rel('phong',-2);
          return 'Chị Hạnh bảo “ok em”. Phong ở lại thay. Phong nhìn bạn như nhìn kẻ phản bội.'; } },
      ] };
  }
  if (S.otTonight === true) {
    return { icon:'🕠', title:'Hết giờ làm (trừ bạn)', html: P(head, 'Mọi người lần lượt ra về. Bạn thì không.'),
      choices: [{ icon:'🍱', label:'Đi lấy cơm hộp, chuẩn bị OT', fx:() => ({ silent:true }) }] };
  }
  return { icon:'🕠', title:'Hết giờ làm', html: P(head, 'Phong ngó qua vách ngăn: “Đi trà đá không ông? Chị Mai đi đấy.”'),
    choices: [
      { icon:'🏠', label:'Về nhà thôi', fx:() => ({ silent:true }) },
      { icon:'🧊', label:'Đi trà đá với Phong và chị Mai', cost:15000, hints:['🤝 +Đồng nghiệp','🙂 +5'], fx:() => {
        rel('phong',4); rel('mai',4); S.mood += 5; S.soft += 1;
        return { text:'Ba người, ba cốc trà đá, một đĩa hướng dương. Bạn biết thêm được rằng anh Dũng từng là ca sĩ nhóm nhạc hồi đại học. Thông tin vô giá.', bg:'sidewalk', npc:'phong', npcExpr:'happy' }; } },
    ] };
};

SC.ot = () => ({
  icon:'🌙', title:'Buổi tối ở công ty',
  html: P('Văn phòng buổi tối vắng lặng. Cơm hộp công ty hôm nay có đùi gà. Bạn làm việc dưới ánh đèn của một nửa tầng.'),
  choices: [
    { icon:'🎯', label:'Tập trung làm cho xong sớm', hints:['⚡ −20','🙂 −5'], fx:() => {
      S.energy -= 20; S.mood -= 5; S.tech += 1; eat(6); S.stat.ot++; if (S.unfinished) { S.perf += 1; S.unfinished = null; }
      memo('Ở lại OT'); note('OT buổi tối: mệt nhưng được sếp ghi nhận.');
      return { text:'Mọi thứ xong xuôi lúc 9 giờ 15. Chị Hạnh nhắn: “Cảm ơn em, về nghỉ đi.” Đường về vắng, gió lạnh, và bạn thấy mình hơi giống người lớn.', meExpr:'tired' }; } },
    { icon:'🎵', label:'Vừa làm vừa nghe nhạc, thong thả', hints:['⚡ −15','🌙 Về muộn hơn'], fx:() => {
      S.energy -= 15; S.mood -= 2; eat(6); S.stat.ot++; S.flags.lateOT = true; if (S.unfinished) S.unfinished = null;
      memo('Ở lại OT'); note('OT buổi tối, về muộn.');
      return { text:'Xong lúc 10 giờ kém. Hơi muộn, nhưng danh sách nhạc hôm nay rất hay.', meExpr:'tired' }; } },
  ],
});

SC.homework = () => ({
  icon:'🏠', title:'Mang việc về nhà',
  html: P('Ăn tối xong, bạn mở laptop trên bàn.', S.bg === 'ghep' ? 'Tùng rủ chơi game. Bạn từ chối với một nỗi đau thể xác.' : ''),
  choices: [
    { icon:'💻', label:'Làm cho xong rồi mới nghỉ', hints:['⚡ −15','🙂 −4'], fx:() => { S.energy -= 15; S.mood -= 4; S.tech += 1; S.unfinished = null;
      note('Mang việc về nhà làm.'); return 'Xong lúc 10 giờ tối. Bạn gập laptop và cảm thấy như vừa leo xong một ngọn đồi nhỏ.'; } },
    { icon:'😮‍💨', label:'Làm một nửa, mai tính tiếp', hints:['⚡ −7'], fx:() => { S.energy -= 7; S.perf -= 1; S.unfinished = null;
      return 'Bạn làm được một nửa thì mắt díp lại. Sáng mai sẽ phải giải thích với chị Hạnh.'; } },
  ],
});

