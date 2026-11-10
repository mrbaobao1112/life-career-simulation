/* =========================================================
   TRANG TRÍ CẢNH: thêm bối cảnh, nhân vật, lời thoại cho từng cảnh
   ========================================================= */
const ACT_BG  = { cafe:'cafe', trada:'sidewalk', run:'lake', shop:'mall' };
const ACT_NPC = { cafe:'linh', trada:'tung' };
function ivPass(){
  const c = co(), hr = S.iv.hr + (S.soft >= 35 ? 1 : 0) - (S.iv.late ? 1 : 0) + cvHR();
  return S.iv.tech >= c.need && hr >= BAL.HR_PASS;
}
const ART = {
  wake: (a, sc) => ({ meAnim:wakeAnimKey(), meExpr:WAKE_ANIM[wakeAnimKey()].expr, meExtras:WAKE_ANIM[wakeAnimKey()].extras, bg:'home', html: sc.html + wakeTable() + (S.am ? `<p class="plan">${morningLine()}</p>` : '') }),
  d1_cv: () => ({ bg:'home' }),
  apply: () => ({ bg:'home' }),
  call_invite: () => ({ bg:'home', npc:'hr', npcExpr:'happy',
    html: P('Một số lạ gọi đến. Bạn hắng giọng ba lần trước khi bắt máy.'),
    talk:[ { w:'hr', t:`“Chào em, chị là HR bên ${co().name}. Bên chị mời em phỏng vấn lúc 9 giờ sáng mai nhé.”` },
      ...(S.flags.buzz ? [ { w:'hr', t:'“À, chị thấy CV em có ghi Blockchain. Mai anh trưởng nhóm sẽ hỏi kỹ phần đó nhé.”' }, { w:'me', t:'“Dạ… vâng ạ.” (Bạn nuốt nước bọt.)' } ] : []) ] }),
  iv_arrive: () => ({ bg:'lobby', meExpr: S.lateToday ? 'panic' : 'neutral' }),
  iv_hr: i => ({ bg:'lobby', npc:'hr', npcExpr:'neutral', html: i === 0 ? P('Chị HR mở sổ, mỉm cười.') : '', talk:[ { w:'hr', t:HR_QS[i].q } ] }),
  iv_tech: () => ({ bg:'lobby', npc:'lead', npcExpr:'neutral', meExpr:'panic',
    html: S.energy < 40 ? P('<span class="warn">Bạn đang khá mệt, đầu óc không được nhanh nhạy lắm.</span>') : '',
    talk:[ { w:'lead', t:'“Chào em. Mình vào việc luôn nhé.”' },
      ...(S.flags.buzz ? [ { w:'lead', t:'“CV em có ghi Blockchain. Em giải thích ngắn gọn anh nghe?”' }, { w:'me', t:'“Dạ… Blockchain là… một chuỗi… các khối… ạ. Hôm nay trời đẹp anh nhỉ?”' } ] : []),
      { w:'lead', t:TECH_QS[S.cur.arg].q } ] }),
  iv_result: () => ivPass()
    ? { bg:'home', npc:'hr', npcExpr:'happy', html: P('Hai giờ chiều, điện thoại reo. Bạn bắt máy bằng giọng chuyên nghiệp nhất có thể.'),
        talk:[ { w:'hr', t:`“Chúc mừng em! Bên chị muốn mời em về làm Fresher Developer, lương ${fmtTr(co().salary)} một tháng.”` }, { w:'hr', t:'“Thứ Tư em bắt đầu đi làm được không?”' } ] }
    : { bg:'home', meExpr:'sad' },
  bk_call: () => ({ bg:'home', npc:'giamdoc', html: P('Bảy giờ sáng, điện thoại reo.'),
    talk:[ { w:'giamdoc', t:'“Em ơi, anh bên Giải Pháp Số Lò Rèn đây! Anh thấy CV em trên mạng.”' }, { w:'giamdoc', t:'“Sáng nay em qua phỏng vấn luôn được không? Bên anh đang cần người gấp. Rất gấp.”' } ] }),
  bk_offer: () => ({ bg:'office_loren', npc:'giamdoc', html: P('Văn phòng nằm trên tầng 3, ngay trên một tiệm sửa xe máy.'),
    talk:[ { w:'giamdoc', t:'“Tầm nhìn của công ty anh là trở thành kỳ lân công nghệ của phố Lò Rèn!”' }, { w:'me', t:'(Mười một phút sau…)' }, { w:'giamdoc', t:'“Ngày mai em đi làm luôn nhé, lương 8 triệu.”' } ] }),
  ob_arrive: () => ({ bg:'office', npc:'hr', npcExpr: S.lateToday ? 'annoyed' : 'happy',
    talk:[ { w:'hr', t:'“Đây là thẻ nhân viên và laptop của em nhé. Laptop hơi… nhiều sticker một chút.”' } ] }),
  ob_env: () => ({ bg:'office', npc:'dung' }),
  ob_team: () => ({ bg:'office', npc:'boss', npcExpr:'happy', talk:[ { w:'boss', t:'“Cả nhà ơi, đây là thành viên mới của team mình. Mọi người chào bạn đi!”' } ] }),
  standup: () => ({ bg:'office', npc:'boss', npcExpr: S.lateToday ? 'annoyed' : 'neutral',
    talk:[ { w:'boss', t:'“Rồi, đến lượt em. Hôm qua làm gì, hôm nay làm gì, có vướng gì không?”' } ] }),
  task: () => ({ bg:'office' }),
  bug_back: () => { const b = S.bugs.find(x => x.due <= S.day);
    return { bg:'office', npc:'mai', npcExpr:'annoyed', html: P('<span class="tip">Đây là hậu quả của lựa chọn “làm nhanh” hôm trước.</span>'),
      talk:[ { w:'mai', t:`“Em ơi, cái task ${b.title} hôm trước em làm ấy, khách vừa báo lỗi.”` } ] }; },
  bug_weekend: () => ({ kind:'phone', from:'boss', msgs:[ 'Em ơi, có lỗi khách đang hỏi.', `Cái task ${S.bugs[0].title} ấy. Em xem giúp chị được không?` ],
    html: P('Mười giờ sáng thứ Bảy, điện thoại rung.', '<span class="tip">Một lần “làm nhanh” trong tuần đã để lại lỗi.</span>') }),
  endwork: () => {
    const a = S.cur.arg || {};
    if (S.unfinished && S.otTonight !== true) return { bg:'office' };
    if (S.otTonight !== true && a.ask) return { bg:'office', npc:'boss', html: P('Năm rưỡi chiều. Văn phòng bắt đầu có tiếng kéo ghế.'),
      talk:[ { w:'boss', t:'“Tối nay team cần người ở lại hỗ trợ đưa bản cập nhật lên. Em ở lại được không?”' } ] };
    if (S.otTonight === true) return { bg:'office' };
    return { bg:'office', npc:'phong', npcExpr:'happy', html: P('Năm rưỡi chiều. Văn phòng bắt đầu có tiếng kéo ghế.'),
      talk:[ { w:'phong', t:'“Đi trà đá không ông? Chị Mai đi đấy.”' } ] };
  },
  ot: () => ({ bg:'office' }),
  homework: () => ({ bg:'home' }),
  meal: kind => (kind === 'lunch' && isWorkday()) ? { bg:'office', npc:'phong' } : (S.bg === 'nha' ? { bg:'home', npc:'family' } : { bg:'home' }),
  activity: () => ({ bg:'home' }),
  bedtime: () => ({ bg:'home' }),
  hangout_pick: () => ({ bg:'home' }),
  'ev:traffic': () => ({ bg:'street', meExpr:'panic' }),
  'ev:rain': () => ({ bg:'street_rain', meExpr:'sad' }),
  'ev:morebattle': () => ({ bg:'home', meExpr:'happy' }),
  'ev:noodle': () => ({ bg:'home', meExpr:'sick' }),
  'ev:sleepdebt': () => ({ bg:'home', meExpr:'tired' }),
  'ev:coffee_run': () => ({ bg:'office', npc:'dung', html:'', talk:[ { w:'dung', t:'“Em xuống mua giúp anh cốc bạc xỉu, ít sữa, nhiều đá, đá to vừa phải nhé.”' } ] }),
  'ev:birthday': () => ({ bg:'office', npc:'phong', html:'', talk:[ { w:'phong', t:'“Psst… chiều nay sinh nhật chị Mai, cả team góp tiền mua bánh. Mỗi người 100 nghìn.”' } ] }),
  'ev:tung_drink': () => ({ kind:'phone', from:'tung', msgs:[ 'Ra quán bia hơi đầu ngõ ngay!', 'Hôm nay tao bao… một phần 🍺' ], html:'' }),
  'ev:linh_study': () => ({ kind:'phone', from:'linh', msgs:[ 'Tao đang ôn khóa lập trình mới.', 'Ra thư viện học cùng không? Học một mình buồn ngủ lắm 😴' ], html:'' }),
  'ev:family_job': () => S.bg === 'nha'
    ? { bg:'home', npc:'family', npcExpr:'neutral', html: P('Bữa tối, bố đặt đũa xuống. Cả nhà quay sang nhìn bạn. Cả con mèo cũng quay sang.'), talk:[ { w:'dad', t:'“Thế bao giờ con đi làm?”' } ] }
    : { kind:'phone', from:'family', msgs:[ 'Thế bao giờ con đi làm?', 'Con bác Tư đi làm ngân hàng rồi đấy.' ], html:'' },
  'ev:family_salary': () => S.bg === 'nha'
    ? { bg:'home', npc:'family', html: P('Đang ăn cơm, mẹ gắp cho bạn miếng thịt. Cả bàn ăn bỗng im lặng.'), talk:[ { w:'mom', t:'“Thế lương con được bao nhiêu?”' } ] }
    : { kind:'phone', from:'family', msgs:[ 'Con đi làm thế nào? Có mệt không?', 'Thế lương con được bao nhiêu? 😊' ], html:'' },
  'ev:phone': () => ({ bg:'home', meExpr:'panic' }),
  'ev:landlady': () => ({ bg:'home' }),
  'ev:tung_borrow': () => ({ bg:'home', npc:'tung', npcExpr:'neutral', html:'', talk:[ { w:'tung', t:'“Cho tao mượn 300 nghìn, cuối tháng tao trả. Lần này khác thật.”' } ] }),
  'ev:mom_food': () => ({ bg:'home', meExpr:'happy' }),
  'ev:linh_check': () => ({ kind:'phone', from:'linh', msgs:[ 'Dạo này trông mày hơi mệt.', 'Có chuyện gì kể tao nghe?' ], html:'' }),
};

