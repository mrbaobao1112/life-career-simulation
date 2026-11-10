/* ----- Ngày 1: CV và nộp hồ sơ ----- */
SC.d1_cv = () => ({
  icon:'📄', title:'Chuẩn bị CV',
  html: P('Bạn mở file CV viết từ năm ba. Mục “Kỹ năng” ghi: “Thành thạo Microsoft Word, chịu được áp lực cao, hát karaoke tốt”.', 'Trước khi nộp hồ sơ, bạn quyết định…'),
  choices: [
    { icon:'✍️', label:'Viết lại cẩn thận, đưa đồ án tốt nghiệp lên đầu', hints:['📄 Nổi bật 6/10','✅ Trung thực 10/10','⚡ −12'], fx:() => {
      setCV(6, 10, ['Đồ án app đặt trà sữa','JavaScript','Git'], []); S.energy -= 12; S.soft += 1; memo('Viết lại CV chỉn chu trước khi nộp');
      return 'Hai tiếng sau, CV của bạn gọn gàng, có số liệu, có đường link đồ án. Mục karaoke đã bị xóa, với một chút tiếc nuối.'; } },
    { icon:'✨', label:'Thêm vài từ khóa thật kêu', hints:['📄 Nổi bật 8/10','⚠️ Trung thực 4/10','🎲 Có thể bị hỏi vặn'], fx:() => {
      setCV(8, 4, ['JavaScript','Git'], ['Blockchain','AI','Cloud','Microservices']);
      return 'Bạn thêm “Blockchain”, “AI”, “Cloud”, “Microservices”. Bạn hiểu khoảng… một nửa trong số đó.'; } },
    { icon:'🚀', label:'Giữ nguyên, nộp luôn cho nóng', hints:['⏱ Tiết kiệm thời gian'], fx:() => {
      setCV(2, 8, ['Microsoft Word','Hát karaoke'], []); return 'Tốc độ là lợi thế. Karaoke cũng là lợi thế, biết đâu được.'; } },
  ],
});

SC.apply = () => ({
  icon:'📮', title:'Chọn nơi nộp hồ sơ',
  html: P('Ba tin tuyển dụng Fresher Developer đang mở ở Hà Thành. Bạn chỉ còn đủ sức nộp một nơi cho tử tế.', '<span class="tip">Mỗi công ty thích một kiểu người khác nhau. Đọc kỹ mô tả nhé.</span>'),
  choices: ['hotay','banhmi','cudem'].map(k => {
    const c = COMPANIES[k];
    return { icon:c.icon, label:`${c.name}`, desc:c.desc, hints:[c.type, `💰 ${fmtTr(c.salary)}/tháng`], fx:() => {
      S.applied = k; S.ivDay = 2; (S.appliedList = S.appliedList || []).push(k); memo(`Nộp hồ sơ vào ${c.name}`);
      return 'Bạn bấm “Nộp hồ sơ”. Màn hình hiện dòng chữ “Cảm ơn bạn đã quan tâm”. Giờ thì chờ.'; } };
  }),
});

SC.call_invite = () => ({
  icon:'📱', title:'Điện thoại reo',
  html: P('Một số lạ gọi đến. Bạn hắng giọng ba lần trước khi bắt máy.',
          `“Chào em, chị là HR bên ${co().name}. Bên chị mời em phỏng vấn lúc 9 giờ sáng mai nhé.”`,
          S.flags.buzz ? '“À, chị thấy CV em có ghi Blockchain. Mai anh trưởng nhóm sẽ hỏi kỹ phần đó nhé.” Bạn nuốt nước bọt.' : ''),
  choices: [
    { icon:'🙏', label:'“Dạ vâng, em cảm ơn chị!”', fx:() => { S.mood += 5; return 'Bạn cúp máy và nhảy một điệu nhỏ giữa phòng. Ngày mai là ngày quan trọng.'; } },
    { icon:'👔', label:'“Dạ, cho em hỏi nên mặc gì ạ?”', hints:['🗣️ +1 Kỹ năng mềm'], fx:() => {
      S.soft += 1; S.mood += 4; return 'Chị HR cười: “Em mặc lịch sự là được. Đừng mặc áo đồng phục lớp là được.”'; } },
  ],
});

/* ----- Phỏng vấn ----- */
SC.iv_arrive = () => {
  const c = co();
  const flavor = { hotay:'Sảnh công ty có cây quất to và màn hình chạy chữ “Chào mừng đối tác Nhật Bản”.',
                   banhmi:'Văn phòng có quầy bánh mì miễn phí. Bạn tự hỏi đây có phải bài kiểm tra đầu tiên không.',
                   cudem:'Văn phòng là tầng 4 một căn nhà ống. Một con mèo tên là “Production” đang ngủ trên máy chủ.' }[S.applied];
  return { icon:c.icon, title:`Phỏng vấn ở ${c.name}`,
    html: P(S.lateToday ? `Bạn đến lúc ${arrClock()}, muộn ${S.lateMin} phút, mồ hôi nhễ nhại. Chị HR nhìn đồng hồ, rồi nhìn bạn, rồi ghi gì đó vào sổ.`
                        : `Bạn đến lúc ${arrClock()}, ${arrEarly()}, ngồi ở sảnh, uống cốc nước lọc thứ ba vì hồi hộp.`, flavor),
    choices: [{ icon:'🚪', label:'Hít một hơi thật sâu, bước vào phòng', fx:() => {
      S.iv = { hr:0, late:S.lateToday, tech:0 };
      if (S.lateToday) { memo('Đến muộn buổi phỏng vấn'); note('Đến muộn buổi phỏng vấn.'); }
      return { silent:true }; } }] };
};

SC.iv_hr = (i) => {
  const Q = HR_QS[i], c = co();
  return { icon:'🧑‍💼', title:`Vòng HR, câu ${i+1}/3`, html: P(i === 0 ? 'Chị HR mở sổ, mỉm cười:' : 'Chị HR hỏi tiếp:', Q.q),
    choices: Q.a.map(a => ({ icon:'💬', label:a.t, fx:() => {
      if (a.trait) {
        const match = a.trait === c.pref;
        S.iv.hr += match ? 2 : 1;
        return match ? { text:'Mắt chị HR sáng lên một chút. Câu trả lời có vẻ đúng tần số với công ty.', npcExpr:'happy' }
                     : { text:'Chị HR gật đầu. Ánh mắt nói rằng “cũng được”.', npcExpr:'neutral' };
      }
      S.iv.hr += a.pts; if (a.pts === 2) S.soft += 1;
      return { text:a.r, npcExpr: a.pts === 2 ? 'happy' : a.pts === 0 ? 'annoyed' : 'neutral' }; } })) };
};

SC.iv_tech = () => {
  const ref = S.cur;
  if (typeof ref.arg !== 'number') { ref.arg = Math.floor(Math.random() * TECH_QS.length); save(); }
  const Q = TECH_QS[ref.arg];
  return { icon:'👨‍💻', title:'Vòng kỹ thuật',
    html: P('Anh trưởng nhóm kỹ thuật bước vào, đặt laptop xuống.',
            S.flags.buzz ? 'Trước tiên anh hỏi về Blockchain trong CV. Bạn giải thích được đúng hai câu, câu thứ ba bạn chuyển sang nói về thời tiết.' : '',
            S.energy < 40 ? '<span class="warn">Bạn đang khá mệt, đầu óc không được nhanh nhạy lắm.</span>' : '',
            'Rồi anh hỏi:', Q.q),
    choices: Q.a.map(a => ({ icon:'🧠', label:a.t, fx:() => {
      S.iv.tech = S.tech + S.prep + cvBonus() + a.s + Math.round((S.mood - 50) / 10) - (S.iv.late ? 5 : 0) - (S.energy < 40 ? 5 : 0) - (S.flags.buzz ? 8 : 0);
      S.energy -= 10;
      return { text: a.r + ' Buổi phỏng vấn kết thúc. Chị HR bảo sẽ báo kết quả trong chiều nay.', npcExpr: a.s >= 15 ? 'happy' : 'annoyed' }; } })) };
};

function setJob(k, salary, start){
  S.job = { co:k, salary, start };
  S.deck = shuffle(TASKS.map(t => t.id));
  memo(`Nhận việc ở ${COMPANIES[k].name}, lương ${fmtTr(salary)}`);
}

// Lời mời phỏng vấn gấp của Lò Rèn chỉ đến một lần, sau lần trượt đầu tiên
function backup(){ if (!S.flags.bkUsed) { S.flags.bkUsed = true; S.backupDay = S.day + 1; } }
SC.iv_result = () => {
  const c = co(), k = S.applied;
  const hrScore = S.iv.hr + (S.soft >= 35 ? 1 : 0) - (S.iv.late ? 1 : 0) + cvHR();
  const techOK = S.iv.tech >= c.need, hrOK = hrScore >= BAL.HR_PASS;
  if (techOK && hrOK) {
    return { icon:'📱', title:'Kết quả phỏng vấn',
      html: P('Hai giờ chiều, điện thoại reo. Bạn bắt máy bằng giọng chuyên nghiệp nhất có thể.',
              `“Chúc mừng em! Bên chị muốn mời em về làm Fresher Developer, lương ${fmtTr(c.salary)} một tháng. ${dayInfo(nextWorkStart()).dow} em bắt đầu đi làm được không?”`),
      choices: [
        { icon:'🤝', label:'“Dạ em đồng ý ạ!”', hints:[`💰 ${fmtTr(c.salary)}`], fx:() => {
          setJob(k, c.salary, nextWorkStart()); S.mood += 15;
          return { text:'Bạn cảm ơn rối rít, cúp máy, rồi hét lên một tiếng. Hàng xóm đập tường. Không sao, hôm nay bạn có việc rồi.', meExpr:'happy' }; } },
        { icon:'📈', label:`“Em mong được ${fmtTr(c.salary + 1e6)} ạ.”`, hints:['🎲 Thương lượng nhẹ'], fx:() => {
          if (chance(.55 + (S.soft - 30) / 100)) { setJob(k, c.salary + 1e6, nextWorkStart()); S.mood += 18; S.soft += 1;
            return { text:'Đầu dây bên kia im lặng ba giây. “Ừ, được em.” Bạn vừa kiếm thêm 12 triệu một năm bằng một câu nói.', meExpr:'happy' }; }
          setJob(k, c.salary, nextWorkStart()); S.mood += 10; S.soft += 1;
          return '“Mức này là mức chung cho Fresher em ạ.” Bạn vẫn nhận lời với mức cũ. Ít nhất bạn đã thử.'; } },
        { icon:'🎰', label:`“Em mong được ${fmtTr(c.salary + 2e6)} ạ.”`, hints:['🎲 Rủi ro cao'], fx:() => {
          const r = Math.random();
          if (r < .3) { setJob(k, c.salary + 2e6, nextWorkStart()); S.mood += 20; memo('Thương lượng lương thành công rực rỡ');
            return { text:'Chị HR xin phép hỏi lại cấp trên, mười phút sau gọi lại: “Được em nhé.” Bạn không tin vào tai mình.', meExpr:'happy' }; }
          if (r < .7) { setJob(k, c.salary + 1e6, nextWorkStart()); S.mood += 12;
            return { text:'“Bên chị chỉ có thể tăng thêm 1 triệu thôi em.” Bạn đồng ý. Thương lượng thành công một nửa vẫn là thành công.', meExpr:'happy' }; }
          backup(); S.applied = k; S.mood -= 12; memo(`Mất offer ở ${c.name} vì đòi lương cao`);
          return { text:'Chị HR nói sẽ “trao đổi lại với cấp trên”. Một tiếng sau, email đến: “Bên chị rất tiếc…” Bạn nhìn trần nhà rất lâu.', meExpr:'sad' }; } },
      ] };
  }
  const reason = !techOK && !hrOK ? 'chưa đáp ứng được cả phần kỹ thuật lẫn phần trao đổi'
               : !techOK ? 'phần kỹ thuật chưa đạt yêu cầu' : 'chưa thực sự phù hợp với văn hóa công ty';
  const hint = !techOK ? 'Gợi ý cho lần sau: ôn phỏng vấn và viết lại CV giúp ích nhiều cho phần kỹ thuật.'
                       : 'Gợi ý cho lần sau: mỗi loại công ty thích một kiểu câu trả lời khác nhau.';
  const fail = () => { backup(); memo(`Trượt phỏng vấn ở ${c.name}`); };
  return { icon:'📧', title:'Kết quả phỏng vấn',
    html: P(`Ba giờ chiều, email đến: “Cảm ơn em đã tham gia phỏng vấn. Rất tiếc, ở thời điểm hiện tại em ${reason}…”`, `<span class="tip">${hint}</span>`),
    choices: [
      { icon:'🍜', label:'Ăn bát phở cho đời bớt buồn', cost:50000, hints:['🙂 Đỡ buồn một chút'], fx:() => {
        fail(); S.mood -= 4; return { text:'Bát phở nóng, nước dùng trong. Đời vẫn buồn, nhưng là nỗi buồn no bụng.', meExpr:'sad' }; } },
      { icon:'📝', label:'Ghi lại những câu mình trả lời chưa tốt', hints:['🧠 +1','🗣️ +2'], fx:() => {
        fail(); S.mood -= 8; S.soft += 2; S.tech += 1; return { text:'Bạn viết ra từng câu hỏi và câu trả lời tốt hơn. Đau, nhưng lần sau sẽ khác.', meExpr:'sad' }; } },
    ] };
};

/* ----- Phương án dự phòng ----- */
SC.bk_call = () => ({
  icon:'📱', title:'Một cuộc gọi bất ngờ',
  html: P('Bảy giờ sáng, điện thoại reo. Một giọng đàn ông rất nhiệt tình:',
          '“Em ơi, anh bên Giải Pháp Số Lò Rèn đây. Anh thấy CV em trên mạng. Sáng nay em qua phỏng vấn luôn được không? Bên anh đang cần người gấp. Rất gấp.”'),
  choices: [
    { icon:'🛵', label:'Đi luôn, còn nước còn tát', fx:() => { S.queue.unshift({ id:'bk_offer' }); S.applied = 'loren';
      return 'Bạn mặc vội chiếc sơ mi duy nhất còn phẳng và phóng xe ra đường.'; } },
    { icon:'🙅', label:'Cảm ơn anh, em muốn tìm thêm', fx:() => { S.queue.unshift({ id:'activity', arg:'morning' }); memo('Từ chối lời mời phỏng vấn gấp');
      return 'Bạn quyết định không vội. Có thể đó là lựa chọn khôn ngoan. Cũng có thể không. Thứ Hai tới sẽ có đợt tin tuyển dụng mới.'; } },
  ],
});

SC.bk_offer = () => ({
  icon:'🔨', title:'Giải Pháp Số Lò Rèn',
  html: P('Văn phòng nằm trên tầng 3, ngay trên một tiệm sửa xe máy. Buổi phỏng vấn kéo dài 15 phút, trong đó 11 phút anh giám đốc kể về tầm nhìn “trở thành kỳ lân công nghệ của phố Lò Rèn”.',
          '“Ngày mai em đi làm luôn nhé, lương 8 triệu.”'),
  choices: [
    { icon:'🤝', label:'Nhận lời', hints:['💰 8 triệu'], fx:() => { setJob('loren', 8e6, nextWorkStart()); S.mood += 10;
      return { text:'Anh giám đốc bắt tay bạn rất chặt. Dưới tầng, tiếng máy nén khí của tiệm sửa xe vang lên như một lời chúc mừng.', meExpr:'happy' }; } },
    { icon:'📈', label:'“Em xin 9 triệu được không ạ?”', hints:['🎲 Năm ăn năm thua'], fx:() => {
      if (chance(.5)) { setJob('loren', 9e6, nextWorkStart()); S.mood += 14; return { text:'Anh giám đốc vỗ đùi: “Được! Anh thích người dám nói.”', meExpr:'happy' }; }
      setJob('loren', 8e6, nextWorkStart()); S.mood += 6; return 'Anh giám đốc cười: “Cứ làm đi, tháng sau anh xem xét.” Câu này thường có nghĩa là không, nhưng bạn vẫn có việc.'; } },
    { icon:'🙅', label:'Từ chối, tìm tiếp', fx:() => { S.mood -= 3; memo('Từ chối offer ở Lò Rèn');
      return 'Bạn cảm ơn và ra về. Tiệm sửa xe bên dưới vẫn bận rộn, chỉ có bạn là chưa.'; } },
  ],
});


/* ----- Tìm việc tiếp: mỗi thứ Hai có đợt tin mới, không nộp lại nơi đã trượt ----- */
function reapplyList(){
  const used = S.appliedList || [];
  return Object.keys(COMPANIES).filter(k => k !== 'loren' && !used.includes(k)).slice(0, 3);
}
SC.reapply = () => {
  const list = reapplyList();
  return { icon:'📮', title:'Đợt tin tuyển dụng mới',
    html: P('Thứ Hai, các trang tuyển dụng có đợt tin mới.', 'Những nơi đã từng trượt thì không nhận lại hồ sơ, nên bạn chỉ xem các công ty chưa nộp.',
            S.cv && S.cv.honest < 6 ? '<span class="tip">CV hiện tại có vài chỗ nói quá. Có thể sửa lại CV trong giờ rảnh.</span>' : ''),
    choices: [ ...list.map(k => { const c = COMPANIES[k];
        return { icon:c.icon, label:c.name, desc:c.desc, hints:[c.type, `💰 ${fmtTr(c.salary)}/tháng`], fx:() => {
          S.applied = k; (S.appliedList = S.appliedList || []).push(k); S.ivDay = S.day + 1; S.iv = null; S.prep = 0; memo(`Nộp hồ sơ vào ${c.name}`);
          return `Bạn nộp hồ sơ. Buổi trưa, HR bên ${c.name} gọi: “Sáng mai 9 giờ em qua phỏng vấn nhé.”`; } }; }),
      { icon:'⏸️', label:'Tuần này chưa nộp đâu cả', fx:() => { S.mood -= 2; return 'Bạn đóng máy. Tuần sau tính tiếp.'; } } ] };
};
ACTS.push({ id:'cv', icon:'📄', label:'Sửa lại CV cho chỉn chu', slots:['morning','afternoon','evening'], cond:() => !S.job && S.day > 1 && S.cv && (S.cv.stand < 6 || S.cv.honest < 10),
  hints:['📄 Nổi bật 6/10','✅ Trung thực 10/10','⚡ −12'],
  fx:() => { setCV(6, 10, ['Đồ án app đặt trà sữa','JavaScript','Git'], []); S.energy -= 12; S.soft += 1; memo('Sửa lại CV trước khi nộp tiếp');
    return 'Bạn viết lại CV: gọn, có số liệu, có đường link đồ án. Những từ khóa nói quá đã được xóa.'; } });
