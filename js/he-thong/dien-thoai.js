/* =========================================================
   ĐIỆN THOẠI: tin nhắn trong ngày, nhóm chat, trả lời hoặc để "đã xem"
   ========================================================= */
const THREADS = {
  family:{ name:'Bố mẹ', av:'mom' }, tung:{ name:'Tùng', av:'tung' }, linh:{ name:'Linh', av:'linh' },
  team:{ name:'Nhóm chat team', av:'boss', group:true }, boss:{ name:'Chị Hạnh', av:'boss' },
  phong:{ name:'Phong', av:'phong' }, dung:{ name:'Anh Dũng', av:'dung' },
};
const THREAD_WHO = { family:'mom' };
const MSGS = {
  mom_breakfast: { th:'family', ctx:['morning'], cond:() => S.bg !== 'nha', msgs:[['mom','Con dậy chưa? Nhớ ăn sáng nhé.']],
    replies:[ { t:'Con dậy rồi, đang ăn đây ạ', fx:() => rel('family',2), resp:'Ừ, ngoan 👍' }, { t:'Con biết rồi mà mẹ 😅', fx:() => rel('family',1), resp:'Biết thì phải làm đấy nhé.' } ],
    ignore:{ fx:() => rel('family',-3), resp:'Mẹ nhắn mà không thấy con trả lời. Bận lắm à?', note:'Không trả lời tin nhắn của mẹ.' } },
  mom_weather: { th:'family', ctx:['afternoon','evening'], cond:() => S.bg !== 'nha' && S.day >= 2, msgs:[['mom','Mấy hôm nữa trời trở lạnh đấy, mặc thêm áo vào.'],['dad','Bố đây. Mẹ con bảo bố nhắn thêm câu này.']],
    replies:[ { t:'Dạ con nhớ rồi ạ ❤️', fx:() => rel('family',3), resp:'Thế mới là con của mẹ.' }, { t:'Ở đây vẫn nóng mà mẹ', fx:() => rel('family',1), resp:'Cứ mang áo theo, không thừa đâu.' } ],
    ignore:{ fx:() => rel('family',-2), resp:'Chắc con bận. Nhớ ăn uống đầy đủ nhé.' } },
  linh_video: { th:'linh', ctx:['afternoon','evening'], msgs:[['linh','Xem video này chưa, con mèo biết code 😂'],['linh','🎬 meo-viet-code.mp4']],
    replies:[ { t:'Hahaha thật á 😂', fx:() => { rel('linh',2); S.mood += 3; }, resp:'Nó còn viết code sạch hơn tao' }, { t:'Chưa, tí tao xem', fx:() => rel('linh',1), resp:'Xem đi rồi bình luận!' } ],
    ignore:{ fx:() => rel('linh',-2), resp:'Ơ, đã xem mà không trả lời à 😤' } },
  tung_football: { th:'tung', ctx:['afternoon','evening'], cond:() => !isWeekend(), msgs:[['tung','Chủ Nhật đá bóng sân Cầu Mây không? Thiếu đúng 1 người!']],
    replies:[ { t:'Có! Để tao đi', fx:() => { rel('tung',3); S.flags.football = true; }, resp:'Chuẩn! 7 giờ sáng nhé, đừng ngủ nướng' }, { t:'Tuần này tao bận rồi', fx:() => rel('tung',-1), resp:'Đồ phản bội 😤 (đùa đấy)' } ],
    ignore:{ fx:() => rel('tung',-3), resp:'Alo? Còn sống không?' } },
  tung_meme: { th:'tung', ctx:['morning','evening'], msgs:[['tung','🖼️ Ảnh chế: “Khi cập nhật hệ thống vào chiều thứ Sáu” 🔥']],
    replies:[ { t:'😂😂😂', fx:() => { rel('tung',2); S.mood += 2; }, resp:'Mày hiểu tao mà' } ],
    ignore:{ fx:() => rel('tung',-1) } },
  team_lunch: { th:'team', ctx:['morning'], cond:() => isWorkday() && S.day > S.job.start, msgs:[['phong','Trưa nay ai đi bún chả không mọi người?'],['mai','Chị đi! 🙋‍♀️']],
    replies:[ { t:'Cho em một suất!', fx:() => { rel('phong',2); rel('mai',2); }, resp:'Ok, 12 giờ dưới sảnh nhé', who:'phong' }, { t:'Hôm nay em ăn tại bàn ạ', fx:() => {}, resp:'Chăm thế 😅', who:'phong' } ],
    ignore:{} },
  team_meeting: { th:'team', ctx:['afternoon'], cond:() => isWorkday() && isWorkday(S.day + 1), msgs:[['boss','Mai 9 giờ họp nhé cả nhà, nhớ cập nhật bảng công việc trước khi về.']],
    replies:[ { t:'Dạ em nhận ạ 👍', fx:() => rel('boss',2), resp:'Cảm ơn em.', who:'boss' }, { t:'👍', fx:() => rel('boss',1) } ],
    ignore:{ fx:() => rel('boss',-3), resp:'Ai chưa đọc tin nhắn thì đọc giúp chị nhé 🙂', who:'boss', note:'Không phản hồi tin nhắn của chị Hạnh trong nhóm.' } },
  team_umbrella: { th:'team', ctx:['afternoon'], cond:() => isWorkday(), msgs:[['mai','Ai để quên ô màu hồng ở phòng pantry thế? Chị dùng tạm nhé 😌']],
    replies:[ { t:'Ô của em đấy chị 😭', fx:() => { rel('mai',2); S.mood += 1; }, resp:'Ô xinh đấy, mai chị trả', who:'mai' }, { t:'Haha 😂', fx:() => rel('mai',1) } ],
    ignore:{} },
  phong_nervous: { th:'phong', ctx:['evening'], cond:() => isWorkday() && isWorkday(S.day + 1) && S.stat.workDays <= 3, msgs:[['phong','Ông ơi, mai họp đầu ngày phải nói gì thế? Tôi run quá 😰']],
    replies:[ { t:'Hôm qua làm gì, hôm nay làm gì, vướng gì. Ba câu thôi!', fx:() => { rel('phong',4); S.soft += 1; }, resp:'Ông là cứu tinh của tôi 🙏' }, { t:'Tôi cũng không biết 😭', fx:() => rel('phong',1), resp:'Thôi hai đứa cùng run vậy' } ],
    ignore:{ fx:() => rel('phong',-2), resp:'Thôi tôi tự lo vậy…' } },
  dung_doc: { th:'dung', ctx:['evening'], cond:() => isWorkday() && S.rel.dung >= 56, msgs:[['dung','Gửi em tài liệu anh tự viết, dễ hiểu hơn tài liệu chính thức.'],['dung','📎 huong-dan-du-an-ban-that.pdf']],
    replies:[ { t:'Em cảm ơn anh nhiều ạ!', fx:() => { rel('dung',3); S.tech += 2; }, resp:'Ừ. Đọc xong có gì hỏi anh.' } ],
    ignore:{ fx:() => rel('dung',-1) } },
};
function ph(){ if (!S.phone) S.phone = { threads:{}, unread:{}, pending:{} }; return S.phone; }
function pushMsg(th, who, t){ const p = ph(); (p.threads[th] = p.threads[th] || []).push({ who, t, d:S.day, time:SLOT_INFO[S.slot][1] }); }
function addUnread(th, n = 1){ const p = ph(); p.unread[th] = (p.unread[th] || 0) + n; S.flags.ring = true; }
const unreadCount = () => Object.values(ph().unread).reduce((a, b) => a + b, 0);
// Số ngày chờ trước khi một tin nhắn có thể đến lại. Tin không có trong bảng này chỉ đến một lần.
const MSG_CD = { mom_breakfast:6, mom_weather:12, linh_video:9, tung_football:7, tung_meme:6, team_lunch:5, team_meeting:7 };
function msgReady(id){ const last = (S.evLast || {})['m_' + id]; if (last === undefined) return !S.once['m_' + id]; return !!MSG_CD[id] && S.day - last >= MSG_CD[id]; }
function maybeMsg(slot){
  if (!chance(.5)) return;
  const p = ph();
  const pool = shuffle(Object.entries(MSGS).filter(([id, m]) => m.ctx.includes(slot) && msgReady(id) && !p.pending[m.th] && (!m.cond || m.cond())));
  if (!pool.length) return;
  const [id, m] = pool[0];
  S.once['m_' + id] = true; (S.evLast = S.evLast || {})['m_' + id] = S.day;
  m.msgs.forEach(([who, t]) => pushMsg(m.th, who, t));
  addUnread(m.th, m.msgs.length);
  if (m.replies) p.pending[m.th] = { id, deadline:(S.tick || 0) + 2 };
}
function tickPhone(){
  S.tick = (S.tick || 0) + 1;
  const p = ph();
  for (const [th, pd] of Object.entries(p.pending)) {
    if (pd.deadline > S.tick) continue;
    const m = MSGS[pd.id], ig = m.ignore || {};
    delete p.pending[th];
    if (ig.fx) ig.fx();
    if (ig.resp) { pushMsg(th, ig.who || m.msgs[0][0], ig.resp); addUnread(th); }
    if (ig.note) note(ig.note);
    clampAll();
  }
}
function replyMsg(th, i){
  const p = ph(), pd = p.pending[th]; if (!pd) return;
  const m = MSGS[pd.id], r = m.replies[i], before = snap();
  pushMsg(th, 'me', r.t);
  if (r.fx) r.fx();
  shapeGains(before, null, null);
  clampAll();
  if (r.resp) pushMsg(th, r.who || m.msgs[0][0], r.resp);
  delete p.pending[th];
  save(); updateHUD(); openThread(th, diffChips(before, snap()));
}


/* ----- Xin nghỉ phép: nhắn chị Hạnh từ hôm trước, mỗi tháng một ngày ----- */
const LEAVE = { PER_MONTH:1, REL_COST:1 };     // số ngày phép mỗi tháng trong thời gian thử việc; xin nghỉ làm chị Hạnh hơi kém vui
// Có thể xin nghỉ ngày mai không (đã đi làm, mai là ngày làm việc, chưa xin rồi)
function canAskLeave(){ const d = S.day + 1; return !!S.job && S.day >= S.job.start && d <= LAST_DAY && !isDayOff(d) && d >= S.job.start && !(S.leave && S.leave[d]) && !(S.flags.leaveAsked === S.day); }
function askLeave(){
  if (!canAskLeave()) return;
  const d = S.day + 1, mk = monthKey(d), used = (S.leaveUsed || {})[mk] || 0, before = snap();
  S.flags.leaveAsked = S.day;
  pushMsg('boss', 'me', `Chị ơi, mai (${fmtD(d)}) em xin nghỉ phép một ngày ạ.`);
  let resp;
  if (used >= LEAVE.PER_MONTH) { resp = 'Tháng này em nghỉ một ngày rồi mà. Ráng thêm nhé em.'; rel('boss', -LEAVE.REL_COST); }
  else if (S.unfinished || (S.bugs || []).some(b => b.due <= d)) { resp = 'Mai còn việc đang dở, em xử lý xong đã nhé.'; }
  else if (reviewDay(d)) { resp = 'Mai chị có buổi nhận xét với em, em sắp xếp hôm khác nhé.'; }
  else { S.leave = { ...(S.leave || {}), [d]:true }; S.leaveUsed = { ...(S.leaveUsed || {}), [mk]:used + 1 }; rel('boss', -LEAVE.REL_COST);
    resp = 'Ok em, nghỉ ngơi cho khỏe nhé.'; memo(`Xin nghỉ phép ngày ${fmtD(d)}`); note(`Đã xin nghỉ phép ngày mai (${fmtD(d)}).`); }
  pushMsg('boss', 'boss', resp); clampAll(); save(); updateHUD();
  openThread('boss', diffChips(before, snap()));
}
// Ngày d có phải ngày chị Hạnh nhận xét không (không cho nghỉ đúng ngày đó)
function reviewDay(d){ return !!S.job && !S.flags.review && d >= BAL.REVIEW_DAY && dayInfo(d).wd === 5; }
