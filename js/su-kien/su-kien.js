/* =========================================================
   SỰ KIỆN
   ========================================================= */
const EVENTS = {
  traffic: { build:() => ({ icon:'🛵', title:'Tắc đường ở ngã tư Cầu Mây',
    html: P('Ngã tư Cầu Mây giờ cao điểm: hàng nghìn chiếc xe máy, một chú cảnh sát, và không ai trong số đó di chuyển.', morningLine()),
    choices: [
      { icon:'↪️', label:'Rẽ vào ngõ tắt', hints:['🎲 −10 hoặc +30 phút'], fx:() => {
        if (chance(.5)) { addDelay('Ngõ tắt', -10); S.mood += 3; return `Ngõ tắt thần kỳ! Bạn tiết kiệm được 10 phút và cảm thấy mình là người bản địa thực thụ. ${arriveTxt()}`; }
        addDelay('Lạc trong ngõ', 30); S.mood -= 3; return `Ngõ tắt dẫn bạn đi qua một cái chợ, một đám cưới và… lại ra đúng ngã tư cũ. ${arriveTxt()}`; } },
      { icon:'🐢', label:'Kiên nhẫn nhích từng chút', hints:['⏱ +20 phút'], fx:() => { S.mood -= 2; addDelay('Tắc đường', 20);
        return `Bạn nhích từng chút một, nghe hết một tập podcast. ${arriveTxt()}`; } },
      { icon:'📯', label:'Bấm còi liên tục', hints:['⏱ +20 phút','🙂 −4'], fx:() => { S.mood -= 4; addDelay('Tắc đường', 20);
        return `Giao thông không nhúc nhích, nhưng bạn cảm thấy mình đã góp phần vào bản giao hưởng buổi sáng. ${arriveTxt()}`; } },
    ] }) },

  rain: { build:() => ({ icon:'🌧️', title:'Mưa to, đường ngập',
    html: P('Trời đổ mưa như trút. Đoạn đường quen thuộc ngập đến nửa bánh xe.', morningLine()),
    choices: [
      { icon:'🌊', label:'Lội nước đi tiếp', hints:['⏱ +10 phút','❤️ −3','🙂 −4'], fx:() => { S.health -= 3; S.mood -= 4; addDelay('Lội nước', 10);
        return `Bạn đến nơi với đôi giày biết kêu “ọc ọc” mỗi bước đi. ${arriveTxt()}`; } },
      { icon:'🚕', label:'Gửi xe, gọi xe công nghệ', cost:65000, hints:['⏱ +5 phút'], fx:() => { S.mood -= 1; addDelay('Đổi sang xe công nghệ', 5);
        return `Tài xế bật nhạc bolero suốt quãng đường. Khô ráo, và có một chút cảm xúc. ${arriveTxt()}`; } },
      { icon:'🧥', label:'Mặc áo mưa và hy vọng', hints:['🎲 +5 hoặc +35 phút'], fx:() => {
        if (chance(.5)) { addDelay('Mưa', 5); return `Áo mưa làm tròn nhiệm vụ. ${arriveTxt()}`; }
        addDelay('Xe chết máy giữa đường ngập', 35); S.mood -= 3;
        return `Xe chết máy giữa đường ngập. Bạn dắt bộ 300 mét trong ánh mắt cảm thông của người đi đường. ${arriveTxt()}`; } },
    ] }) },

  sleepdebt: { build:() => ({ icon:'🥱', title:'Cơ thể đòi nợ ngủ',
    html: P('Mắt bạn díp lại ngay khi vừa ngồi dậy. Cơ thể đang nhắc khéo về những đêm thức khuya.'),
    choices: [
      { icon:'☕', label:'Uống một cốc cà phê thật đặc', cost:25000, hints:['⚡ +12 bây giờ','🌙 Tối nay ngủ muộn hơn'], fx:() => { S.energy += 12; S.bedShift = Math.max(S.bedShift, .5);
        return 'Cà phê phin đặc quánh. Bạn tỉnh hẳn, kèm một chút run tay.'; } },
      { icon:'💧', label:'Rửa mặt nước lạnh, chấp nhận mệt', hints:['🙂 −2'], fx:() => { S.mood -= 2;
        return 'Nước lạnh giúp được khoảng 30 giây. Hôm nay sẽ là một ngày dài.'; } },
    ] }) },

  morebattle: { build:() => ({ icon:'🎮', title:'Thêm một trận nữa thôi',
    html: P('Đồng hồ chỉ 22 giờ 50. Màn hình hiện nút “Chơi tiếp”. Nó nhìn bạn. Bạn nhìn nó.'),
    choices: [
      { icon:'🎯', label:'Thêm một trận (lần này là thật)', hints:['🙂 +4','😴 Ngủ muộn hơn'], fx:() => { S.mood += 4; S.bedShift = 1.5;
        note('“Thêm một trận nữa” kéo dài thành bốn trận.'); return 'Một trận thành hai, hai thành bốn. Khi ngẩng lên, đã là một ngày khác về mặt lịch.'; } },
      { icon:'🔌', label:'Tắt máy, đi ngủ', hints:['💪 Ý chí'], fx:() => { S.mood -= 2;
        return 'Bạn tắt máy. Một chiến thắng nhỏ của ý chí, không ai chứng kiến, nhưng vẫn là chiến thắng.'; } },
    ] }) },

  noodle: { build:() => ({ icon:'🩺', title:'Dạ dày gửi đơn khiếu nại',
    html: P(`Sau ${S.stat.miTom} gói mì tôm, cơ thể bạn bắt đầu có ý kiến: hơi mệt, da hơi xấu, và bạn thèm rau một cách khó hiểu.`),
    choices: [{ icon:'🥦', label:'Hứa ngày mai ăn uống tử tế', hints:['❤️ −3'], fx:() => { S.health -= 3; note('Ăn mì tôm nhiều, cơ thể bắt đầu phản đối.');
      return 'Lời hứa đã được ghi nhận. Cơ thể sẽ theo dõi.'; } }] }) },

  coffee_run: { ctx:['workmorning'], chance:.3, build:() => ({ icon:'🥤', title:'Anh Dũng nhờ một việc',
    html: P('“Em xuống mua giúp anh cốc bạc xỉu, ít sữa, nhiều đá, đá to vừa phải nhé.”'),
    choices: [
      { icon:'🏃', label:'Đi mua ngay', hints:['🤝 +Anh Dũng'], fx:() => { rel('dung',5); S.energy -= 3;
        return 'Bạn mua đúng từng chi tiết. Anh Dũng nhấp một ngụm, gật đầu: “Em có tương lai đấy.”'; } },
      { icon:'🧋', label:'Mua cho cả team luôn', cost:120000, hints:['🤝 +Cả team'], fx:() => { rel('dung',5); rel('mai',4); rel('phong',4); rel('boss',2); S.soft += 1;
        return 'Cả team nhận đồ uống trong sự bất ngờ. Chị Mai gọi bạn là “nhà tài trợ kim cương”.'; } },
      { icon:'⌨️', label:'“Em đang dở task, anh chờ em chút ạ.”', fx:() => { rel('dung',-2);
        return 'Anh Dũng tự đi mua. Anh không nói gì, nhưng tai nghe của anh có vẻ đeo chặt hơn.'; } },
    ] }) },

  birthday: { ctx:['workafternoon'], chance:.35, build:() => ({ icon:'🎂', title:'Sinh nhật chị Mai',
    html: P('Phong thì thầm: “Chiều nay sinh nhật chị Mai, cả team góp tiền mua bánh. Mỗi người 100 nghìn.”'),
    choices: [
      { icon:'💌', label:'Góp tiền và tự tay viết thiệp', cost:100000, hints:['🤝 +Chị Mai nhiều'], fx:() => { rel('mai',10); rel('phong',2); S.soft += 2; S.mood += 5; S.energy -= 3;
        return 'Chị Mai đọc thiệp xong thì cười rất tươi: “Em là người đầu tiên viết thiệp mà không có lỗi chính tả.”'; } },
      { icon:'💵', label:'Góp tiền', cost:100000, hints:['🤝 +Chị Mai'], fx:() => { rel('mai',6); rel('phong',2); S.mood += 5;
        return 'Bánh kem, nến, bài hát chúc mừng hơi lệch tông. Một buổi chiều dễ chịu.'; } },
      { icon:'🙈', label:'Giả vờ không biết', fx:() => { rel('mai',-4); rel('phong',-2);
        return 'Bạn đeo tai nghe như anh Dũng. Nhưng anh Dũng thì có góp tiền.'; } },
    ] }) },

  tung_drink: { ctx:['evening'], chance:() => S.bg === 'ghep' ? .45 : .25, build:() => ({ icon:'🍺', title:'Tùng rủ đi nhậu',
    html: P('Tùng nhắn: “Ra quán bia hơi đầu ngõ ngay! Hôm nay tao bao… một phần.”'),
    choices: [
      { icon:'🍻', label:'Đi luôn!', cost:150000, hints:['🙂 +12','🤝 +Tùng','🥴 Mai dễ mệt'], fx:() => {
        rel('tung',8); S.mood += 12; S.energy -= 12; S.health -= 3; S.hangover = true; logMeal('party'); S.flags.outLate = true;
        S.queue = S.queue.filter(r => r.id !== 'activity'); memo('Đi nhậu với Tùng'); note('Bia hơi với Tùng: vui, nhưng mai sẽ mệt.');
        return { text:'Bia hơi, lạc rang, chuyện trên trời dưới biển. Tùng hứa “cốc cuối” khoảng sáu lần.', bg:'biahoi', npc:'tung', npcExpr:'drunk', meExpr:'happy' }; } },
      { icon:'🥤', label:'Đi, nhưng chỉ uống nước ngọt', cost:60000, hints:['🙂 +6','🤝 +Tùng'], fx:() => {
        rel('tung',4); S.mood += 6; S.flags.outLate = true; S.queue = S.queue.filter(r => r.id !== 'activity');
        return { text:'Tùng gọi bạn là “người tỉnh táo duy nhất ở Hà Thành”. Bạn coi đó là lời khen.', bg:'biahoi', npc:'tung', npcExpr:'happy' }; } },
      { icon:'🏠', label:'Từ chối, ở nhà', fx:() => { rel('tung',-3);
        return 'Tùng gửi một sticker con mèo khóc. Rồi gửi thêm ảnh đĩa nem rán để bạn hối hận.'; } },
    ] }) },

  linh_study: { ctx:['evening','freeafternoon'], chance:.3, build:() => ({ icon:'📚', title:'Linh rủ học nhóm',
    html: P('Linh nhắn: “Tao đang ôn khóa học lập trình mới, ra thư viện học cùng không? Học một mình buồn ngủ lắm.”'),
    choices: [
      { icon:'🤓', label:'Đi học cùng Linh', hints:['🧠 +3','🤝 +Linh','⚡ −10'], fx:() => {
        S.tech += 3; rel('linh',6); S.energy -= 10; S.queue = S.queue.filter(r => r.id !== 'activity');
        return { text:'Hai tiếng học tập trung, xen giữa là năm phút Linh than thở về người yêu cũ. Rất hiệu quả.', bg:'library', npc:'linh', npcExpr:'happy' }; } },
      { icon:'📅', label:'Hẹn hôm khác', fx:() => { rel('linh',-2);
        return 'Linh gửi “ok” kèm dấu chấm. Dấu chấm đó nặng hơn bạn tưởng.'; } },
    ] }) },

  family_job: { ctx:['evening'], chance:.5, cond:() => !S.job && S.day >= 2 && S.day <= 6, build:() => ({ icon:'👪', title:'Bố mẹ hỏi chuyện việc làm',
    html: P(S.bg === 'nha' ? 'Bữa tối, bố đặt đũa xuống: “Thế bao giờ con đi làm?” Cả nhà quay sang nhìn bạn. Cả con mèo cũng quay sang.'
                           : 'Mẹ gọi điện: “Thế bao giờ con đi làm? Con bác Tư đi làm ngân hàng rồi đấy.”'),
    choices: [
      { icon:'🗺️', label:'Kể thật về kế hoạch tìm việc', hints:['🤝 +Bố mẹ'], fx:() => { rel('family',4); S.mood += 2; S.soft += 1;
        return 'Bố mẹ nghe xong thì bớt lo hẳn. Mẹ còn bảo: “Cứ từ từ con, nhưng đừng từ từ quá.”'; } },
      { icon:'⏳', label:'“Sắp rồi ạ.” Rồi đổi chủ đề', fx:() => { S.mood -= 2;
        return 'Chủ đề được đổi thành công. Nhưng chữ “sắp rồi” vẫn treo lơ lửng trong không khí.'; } },
      { icon:'🔄', label:'Hỏi lại “con bác Tư lương bao nhiêu ạ?”', fx:() => { rel('family',-3); S.mood += 3;
        return 'Đòn phản công hiệu quả. Cuộc trò chuyện chuyển sang con bác Tư trong 20 phút.'; } },
    ] }) },

  family_salary: { ctx:['evening'], chance:.5, cond:() => !!S.job, build:() => ({ icon:'👪', title:'Câu hỏi về lương',
    html: P(S.bg === 'nha' ? 'Đang ăn cơm, mẹ gắp cho bạn miếng thịt rồi hỏi nhẹ nhàng: “Thế lương con được bao nhiêu?” Cả bàn ăn im lặng.'
                           : 'Mẹ gọi điện, hỏi han vài câu rồi vào thẳng vấn đề: “Thế lương con được bao nhiêu?”'),
    choices: [
      { icon:'🙂', label:`Nói thật: ${fmtTr(S.job.salary)}`, hints:['🤝 +Bố mẹ'], fx:() => { rel('family',4); S.mood += 2;
        return 'Bố gật gù: “Thôi được, khởi đầu thế là được. Từ từ rồi lên.”'; } },
      { icon:'🎈', label:'Nói tròn lên một chút', hints:['🤝 +Bố mẹ','🎲 Hậu quả về sau'], fx:() => { rel('family',6); S.flags.liedSalary = true;
        memo('Nói tròn lương lên với bố mẹ');
        return 'Mẹ đi khoe cả xóm. Bây giờ bạn phải sống xứng đáng với mức lương tưởng tượng này.'; } },
      { icon:'☁️', label:'Đánh trống lảng sang chuyện thời tiết', fx:() => { rel('family',-2);
        return 'Mẹ: “Ừ, trời đẹp. Thế lương bao nhiêu?”'; } },
    ] }) },

  phone: { ctx:['freeafternoon','evening','weekendmorning'], chance:.07, build:() => ({ icon:'📱', title:'Điện thoại rơi, vỡ màn hình',
    html: P('Một giây lơ đãng. Một tiếng “cạch”. Màn hình điện thoại giờ trông như bản đồ giao thông Hà Thành.'),
    choices: [
      { icon:'🔧', label:'Thay màn hình chính hãng', cost:900000, fx:() => { S.mood -= 2; memo('Thay màn hình điện thoại 900 nghìn');
        return 'Điện thoại như mới. Ví tiền thì như cũ, nhưng mỏng hơn.'; } },
      { icon:'🩹', label:'Dán miếng cường lực đè lên', cost:40000, hints:['🙂 −4'], fx:() => { S.mood -= 4;
        return 'Bây giờ mỗi tin nhắn đều có hiệu ứng mạng nhện. Rất nghệ thuật.'; } },
      { icon:'🤷', label:'Kệ, vẫn dùng được', hints:['🙂 −6'], fx:() => { S.mood -= 6;
        return 'Bạn học được cách đọc tin nhắn qua các khe nứt. Một kỹ năng mềm mới.'; } },
    ] }) },

  landlady: { ctx:['evening'], chance:.4, cond:() => S.bg === 'tro' && S.day >= 2, build:() => ({ icon:'🧾', title:'Thông báo của bà chủ trọ',
    html: P('Tờ giấy dán ở cầu thang: “Từ tháng này tiền điện 4.000đ/số. Lý do: giá cả leo thang.” Bên dưới có ai đó viết thêm bằng bút bi: “Lương thì không”.'),
    choices: [
      { icon:'💸', label:'Đóng tiền chênh lệch tháng này', cost:150000, fx:() => { S.mood -= 2;
        return 'Bà chủ trọ nhận tiền và cho bạn một quả chuối. Tỷ giá không công bằng lắm, nhưng quả chuối ngon.'; } },
      { icon:'🌱', label:'Tắt bớt điều hòa, sống xanh', hints:['🙂 −3'], fx:() => { S.mood -= 3; S.flags.saveElectric = true;
        return 'Bạn mở cửa sổ, bật quạt. Muỗi rất cảm kích quyết định này.'; } },
    ] }) },

  tung_borrow: { ctx:['evening'], chance:.35, cond:() => S.bg === 'ghep' && S.day >= 3, build:() => ({ icon:'💰', title:'Tùng hỏi vay tiền',
    html: P('Tùng ngồi xuống cạnh bạn, giọng nghiêm túc hiếm thấy: “Cho tao mượn 300 nghìn, cuối tháng tao trả. Lần này khác thật.”'),
    choices: [
      { icon:'🤝', label:'Cho mượn', cost:300000, hints:['🤝 +Tùng'], fx:() => { rel('tung',6); S.flags.loanTung = 300000; memo('Cho Tùng mượn 300 nghìn');
        return 'Tùng ôm bạn một cái rất chặt. Bạn ghi vào điện thoại: “Tùng nợ 300k”. Lần thứ ba trong năm.'; } },
      { icon:'🤏', label:'Cho mượn 100 nghìn thôi', cost:100000, fx:() => { rel('tung',2); S.flags.loanTung = 100000;
        return 'Tùng nhận và bảo: “Thôi cũng được, đủ tiền xăng.”'; } },
      { icon:'🙅', label:'Từ chối khéo', fx:() => { rel('tung',-4);
        return 'Tùng bảo “không sao”. Tối đó cậu ấy rửa bát rất to tiếng.'; } },
    ] }) },

  mom_food: { ctx:['weekendmorning'], chance:.55, cond:() => S.bg !== 'nha', build:() => ({ icon:'📦', title:'Mẹ gửi đồ ăn từ quê lên',
    html: P('Xe khách mang lên một thùng xốp: gà luộc, giò, rau sạch và một mẩu giấy: “Ăn uống cho tử tế vào con.”'),
    choices: [
      { icon:'📞', label:'Gọi điện cảm ơn mẹ', hints:['🥗 Đủ chất cả tuần','🤝 +Bố mẹ'], fx:() => { eat(25); rel('family',6); S.mood += 8;
        return 'Mẹ bảo: “Ăn hết đi, đừng để mốc.” Bạn hứa. Lời hứa này bạn định giữ thật.'; } },
      ...(S.bg === 'ghep' ? [{ icon:'🍗', label:'Chia cho Tùng một nửa', hints:['🤝 +Tùng'], fx:() => { eat(15); rel('tung',8); rel('family',2); S.mood += 6;
        return 'Tùng cảm động đến mức hứa sẽ rửa bát cả tuần. Lời hứa có hiệu lực trong khoảng hai ngày.'; } }] : []),
    ] }) },

  linh_check: { ctx:['evening','freeafternoon'], chance:.8, cond:() => S.mood < 40, build:() => ({ icon:'💬', title:'Linh nhắn tin hỏi thăm',
    html: P('Linh: “Dạo này trông mày hơi mệt. Có chuyện gì kể tao nghe?”'),
    choices: [
      { icon:'🫂', label:'Tâm sự thật lòng', hints:['🙂 +12','🤝 +Linh'], fx:() => { S.mood += 12; rel('linh',6);
        return 'Hai đứa nói chuyện gần một tiếng. Không có vấn đề nào được giải quyết, nhưng bạn thấy nhẹ lòng hẳn.'; } },
      { icon:'👍', label:'“Ổn mà.”', fx:() => { S.mood += 2;
        return 'Linh gửi một sticker gấu ôm. Linh biết là không ổn, nhưng Linh tôn trọng.'; } },
      { icon:'👁️', label:'Xem nhưng không trả lời', fx:() => { rel('linh',-3);
        return 'Tin nhắn hiện chữ “Đã xem”. Bạn cũng hiện chữ “Đã mệt”.'; } },
    ] }) },
};

