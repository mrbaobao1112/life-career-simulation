/* =========================================================
   TÍNH CÁCH CỦA TỪNG NHÂN VẬT (v11)
   Mỗi chỉ số từ 0 đến 1 và điều khiển hành vi thật trên sân khấu, không chỉ để hiển thị:
   - social: hay rời chỗ đi bắt chuyện đến mức nào
   - focus:  ngồi làm việc lâu, ít nghỉ giữa chừng đến mức nào
   - humor:  hay đùa và hay cười đến mức nào
   - brief:  nói ngắn đến mức nào (cao thì chỉ đáp vài chữ)
   ========================================================= */
const PERSONA = {
  boss:  { trait:'Bận rộn, quan tâm tiến độ', social:.5,  focus:.6,  humor:.25, brief:.4, roles:['meeting','board'] },
  dung:  { trait:'Ít nói, rất tập trung',     social:.12, focus:.95, humor:.1,  brief:.95 },
  mai:   { trait:'Hòa đồng, hay cười',        social:.9,  focus:.45, humor:.75, brief:.2 },
  phong: { trait:'Hay lo, hay hỏi',           social:.6,  focus:.4,  humor:.4,  brief:.3, asks:'dung' },
  tung:  { trait:'Thân thiện, hay đùa',       social:.9,  focus:.2,  humor:.95, brief:.2 },
  linh:  { trait:'Chăm chỉ, thẳng thắn',      social:.5,  focus:.9,  humor:.35, brief:.4 },
  mom:   { trait:'Chu đáo, hay hỏi han',      social:.8,  focus:.5,  humor:.3,  brief:.2 },
  dad:   { trait:'Trầm tính, ít lời',         social:.25, focus:.7,  humor:.2,  brief:.85 },
};
const personaOf = k => PERSONA[k === 'family' ? 'mom' : k] || { trait:'', social:.5, focus:.5, humor:.3, brief:.4 };
// Mỗi lần trò chuyện tự nhiên làm thân hơn một chút, có giới hạn mỗi ngày để không thay đổi cân bằng của game
const CHAT_REL = { GAIN:1, PER_DAY:3 };
function chatBond(who){
  const k = ['mom','dad'].includes(who) ? 'family' : who; if (S.rel[k] === undefined) return;
  const c = S.flags.chatBond && S.flags.chatBond.d === S.day ? S.flags.chatBond : (S.flags.chatBond = { d:S.day, n:0 });
  if (c.n >= CHAT_REL.PER_DAY) return;
  c.n++; S.rel[k] = clamp(S.rel[k] + CHAT_REL.GAIN); save();
}

/* ----- Câu nói khi một người chủ động đến bắt chuyện với nhân vật chính -----
   Mỗi mục: ai nói (who), khi nào nói được (when), [câu của họ, câu đáp của bạn], và có cười sau đó không (fun).
   Mục càng đứng trên càng được ưu tiên: chuyện vừa xảy ra trước, rồi công việc, rồi quan hệ, cuối cùng là tán gẫu theo tính cách. */
const recent = (re, days = 1) => (S.memo || []).some(m => m.day >= S.day - days && re.test(m.text));
const curTask = () => { const r = [S.cur, ...(S.queue || [])].find(x => x && x.id === 'task' && x.arg && x.arg.tid); return r ? TASK[r.arg.tid] : null; };
const TALKS = [
  // chuyện vừa xảy ra
  { who:'boss',  when:() => S.lateToday, say:['Mai đến sớm hơn nhé em.', 'Dạ, em xin lỗi chị.'] },
  { who:'phong', when:() => S.lateToday, say:['Ông lại tắc ở Cầu Mây à?', 'Đừng nhắc nữa…'], fun:true },
  { who:'boss',  when:() => recent(/OT/), say:['Hôm qua cảm ơn em ở lại nhé.', 'Dạ không có gì ạ.'] },
  { who:'mai',   when:() => recent(/OT/), say:['Hôm qua về muộn thế, ngủ đủ không em?', 'Em vẫn sống ạ.'], fun:true },
  { who:'phong', when:() => (S.income || {})[S.day] || (S.income || {})[S.day - 1], say:['Lương về rồi! Trà sữa không ông?', 'Ông bao nhé.'], fun:true },
  { who:'mai',   when:() => (S.income || {})[S.day], say:['Lương về, mặt ai cũng tươi nhỉ.', 'Tươi được ba ngày chị ạ.'], fun:true },
  { who:'boss',  when:() => S.flags.review === 'good' && recent(/nhận xét/, 3), say:['Giữ phong độ như tuần trước nhé.', 'Dạ, em sẽ cố ạ.'] },
  { who:'boss',  when:() => S.flags.review === 'warn' && recent(/nhận xét/, 3), say:['Tuần này chị xem lại tiến độ của em nhé.', 'Dạ vâng ạ.'] },
  { who:'mai',   when:() => (S.bugs || []).length > 0, say:['Cái lỗi hôm trước chị ghi lại rồi đấy.', 'Em sửa ngay ạ.'] },
  { who:'dung',  when:() => (S.bugs || []).length > 0, say:['Nhớ test trường hợp rỗng.', 'Dạ.'] },
  { who:'mai',   when:() => S.energy < 30, say:['Trông em mệt thế, uống nước đi.', 'Em cảm ơn chị.'] },
  { who:'phong', when:() => S.mood < 40, say:['Ông ổn không đấy?', 'Hơi oải thôi.'] },
  // công việc đang làm
  { who:'boss',  when:() => !!curTask(), say:() => [`“${curTask().title}” ổn chứ em?`, 'Em đang làm ạ.'] },
  { who:'dung',  when:() => !!curTask() && curTask().d >= 2, say:['Task đó khó đấy. Kẹt thì hỏi.', 'Dạ, em cảm ơn anh.'] },
  { who:'phong', when:() => S.stat.workDays <= 5, say:['Ông quen việc chưa? Tôi vẫn run.', 'Tôi cũng thế.'], fun:true },
  // quan hệ thân
  { who:'mai',   when:() => S.rel.mai >= 65, say:['Trưa đi bún chả với chị không?', 'Đi chứ chị!'], fun:true },
  { who:'phong', when:() => S.rel.phong >= 65, say:['Cuối tuần đá bóng không ông?', 'Để tôi xem lịch đã.'] },
  { who:'dung',  when:() => S.rel.dung >= 65, say:['Có bài viết hay, anh gửi nhé.', 'Em cảm ơn anh!'] },
  { who:'boss',  when:() => S.rel.boss >= 65, say:['Em làm chị yên tâm đấy.', 'Dạ, em cảm ơn chị.'] },
  // quan hệ chưa tốt
  { who:'mai',   when:() => S.rel.mai < 40, say:['Lần sau test kỹ giúp chị nhé.', 'Dạ vâng ạ.'] },
  { who:'boss',  when:() => S.rel.boss < 40, say:['Chị cần em chủ động hơn.', 'Dạ, em hiểu ạ.'] },
  // tán gẫu theo tính cách
  { who:'mai',   when:() => true, say:['Có bánh ở pantry đấy em.', 'Em ra ngay ạ!'], fun:true },
  { who:'mai',   when:() => true, say:['Con mèo nhà chị lại mở tủ lạnh.', 'Nó giỏi hơn em rồi.'], fun:true },
  { who:'phong', when:() => true, say:['Tí đi trà đá không ông?', 'Xong task đã.'] },
  { who:'phong', when:() => true, say:['Ông ơi, cái lỗi này lạ lắm.', 'Thử tắt đi bật lại xem.'], fun:true },
  { who:'dung',  when:() => true, say:['Code hôm qua ổn.', 'Dạ!'] },
  { who:'boss',  when:() => true, say:['Tiến độ ổn chứ em?', 'Dạ ổn ạ.'] },
  // ở nhà
  { who:'tung',  when:() => !S.job, say:['Chưa có việc à? Ra trà đá cho thông não.', 'Nghe hợp lý phết.'], fun:true },
  { who:'tung',  when:() => !!S.flags.loanTung, say:['Khoản kia tao nhớ mà, yên tâm.', 'Tao ghi sổ rồi đấy.'], fun:true },
  { who:'tung',  when:() => S.energy < 30, say:['Mặt mày như pin 5% ấy.', 'Chính xác là 4%.'], fun:true },
  { who:'tung',  when:() => true, say:['Tao nghĩ ra kế hoạch làm giàu mới.', 'Lại nuôi ốc à?'], fun:true },
  { who:'tung',  when:() => true, say:['Làm một trận không?', 'Một trận thôi đấy.'], fun:true },
  { who:'mom',   when:() => S.nutr < 45, say:['Dạo này con ăn uống kém đấy.', 'Con sẽ ăn tử tế ạ.'] },
  { who:'mom',   when:() => !S.job, say:['Có công ty nào gọi chưa con?', 'Sắp rồi mẹ ạ.'] },
  { who:'mom',   when:() => (S.sleepDebt || 0) >= 2, say:['Tối nay ngủ sớm đi con.', 'Vâng ạ.'] },
  { who:'mom',   when:() => !!S.job, say:['Đi làm có mệt không con?', 'Con quen dần rồi ạ.'] },
  { who:'mom',   when:() => true, say:['Ăn hoa quả đi con.', 'Con cảm ơn mẹ.'] },
  { who:'dad',   when:() => !!S.job, say:['Công việc ổn chứ?', 'Ổn bố ạ.'] },
  { who:'dad',   when:() => true, say:['Ừ. Cố lên.', 'Vâng ạ.'] },
];
// Chọn một câu hợp hoàn cảnh nhất cho người này: lấy trong vài mục đầu tiên thỏa điều kiện, tránh lặp câu vừa nói
let lastTalk = {};
function pickTalk(who){
  const ok = TALKS.filter(t => t.who === who && t.when()), top = ok.slice(0, 3).filter(t => t !== lastTalk[who]);
  const r = Math.random(), t = top.length ? top[r < .6 ? 0 : r < .85 ? Math.min(1, top.length - 1) : top.length - 1] : ok[0]; if (!t) return null;   // chuyện đứng trên trong danh sách được ưu tiên
  lastTalk[who] = t;
  return { lines: typeof t.say === 'function' ? t.say() : t.say, fun: !!t.fun && Math.random() < .35 + personaOf(who).humor * .6 };
}

/* ----- Câu trao đổi giữa hai đồng nghiệp với nhau, theo tính cách của hai người ----- */
const PAIR_CHAT = {
  'phong>dung': [['Anh ơi, cái này em bí quá.', 'Dòng 42.', 'Ơ, đúng thật!'], ['Anh xem giúp em với ạ.', 'Thiếu dấu chấm phẩy.', 'Em cảm ơn anh!']],
  'mai>dung':   [['Anh Dũng, bản này lỗi nhé.', 'Ừ.', 'Chiều em test lại.'], ['Anh ăn trưa chưa?', '…Chưa.']],
  'mai>phong':  [['Phong ơi, test xong chưa?', 'Em sắp xong ạ!', 'Cố lên em.'], ['Em đừng run thế.', 'Em có run đâu ạ…', 'Tay em đang run kìa.']],
  'mai>boss':   [['Chị ơi, bản demo ổn rồi.', 'Tốt quá, cảm ơn em.'], ['Sinh nhật team tháng này ai nhỉ?', 'Để chị xem lịch.']],
  'boss>dung':  [['Dũng, tiến độ thế nào?', 'Đúng hạn.', 'Tốt.'], ['Em kèm Phong giúp chị nhé.', 'Được.']],
  'boss>mai':   [['Mai ơi, chiều họp khách nhé.', 'Vâng, em chuẩn bị ạ.']],
  'boss>phong': [['Phong quen việc chưa em?', 'Dạ… gần quen ạ.', 'Cứ từ từ.']],
  'phong>mai':  [['Chị ơi, em hỏi tí được không?', 'Hỏi đi em.', 'Cơm trưa ở đâu ngon ạ?'], ['Chị test giúp em với.', 'Gửi link chị.']],
  'dung>phong': [['Sửa lại tên biến đi em.', 'Dạ vâng ạ.']],
  'dung>mai':   [['Bản mới lên rồi.', 'Em test ngay.']],
};
const GENERIC_CHAT = [['Trưa ăn gì?', 'Bún chả!', 'Chốt.'], ['Deploy chưa?', 'Chiều nhé.'], ['Họp mấy giờ?', 'Ba giờ.'], ['Cuối tuần đi đâu?', 'Ngủ.', 'Kế hoạch hay đấy.']];
function pairChat(a, b){
  const lines = pick(PAIR_CHAT[a + '>' + b] || GENERIC_CHAT);
  return { lines, fun: Math.random() < Math.max(personaOf(a).humor, personaOf(b).humor) * .55 };
}
