/* =========================================================
   ĐIỆN THOẠI: tin nhắn trong ngày, nhóm chat, trả lời hoặc để "đã xem"
   v17.5 Phase 4: thông báo gọn hơn
   - Số đỏ trên nút điện thoại đếm số CUỘC TRÒ CHUYỆN có tin mới (không đếm từng tin), nên không bị dồn thành vài chục.
   - Chỉ đổ chuông khi tin cần bạn trả lời hoặc quan trọng; tin nhắc lại khi bạn lờ đi thì đến lặng lẽ.
   - Tin nhắn vu vơ của mọi người: tối đa PHONE.MAX_DAY lần mỗi ngày. NPC chỉ nhắn khi có lý do (điều kiện của từng tin).
   - Danh sách: cuộc trò chuyện chờ bạn trả lời lên đầu, rồi đến có tin mới, rồi theo tin gần nhất.
   - Trong cuộc trò chuyện có vạch “Tin mới” ngăn tin cũ và tin chưa đọc. Giữ lịch sử PHONE.KEEP tin gần nhất mỗi cuộc.
   ========================================================= */
const PHONE = {
  P:.5,                      // mỗi buổi (sáng, chiều, tối) có chừng này khả năng có một tin nhắn vu vơ
  MAX_DAY:2,                 // mỗi ngày tối đa chừng này tin nhắn vu vơ (không tính tin của chị Hạnh về nghỉ phép, kỷ luật, hay chuyện đang diễn ra)
  KEEP:80,                   // mỗi cuộc trò chuyện giữ chừng này tin gần nhất (bản lưu không phình ra)
};
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
    ignore:{ fx:() => rel('boss',-3), resp:'Ai chưa đọc tin nhắn thì đọc giúp chị nhé 🙂', who:'boss', loud:true, note:'Không phản hồi tin nhắn của chị Hạnh trong nhóm.' } },
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
function pushMsg(th, who, t){ const p = ph(), L = (p.threads[th] = p.threads[th] || []); L.push({ who, t, d:S.day, time:SLOT_INFO[S.slot][1] }); if (L.length > PHONE.KEEP) L.splice(0, L.length - PHONE.KEEP); }
// quiet: tin không quan trọng (ví dụ tin nhắc lại khi bạn lờ đi) thì không đổ chuông, chỉ hiện số
function addUnread(th, n = 1, quiet = false){ const p = ph(); p.unread[th] = (p.unread[th] || 0) + n; if (!quiet) S.flags.ring = true; }
const unreadCount = () => Object.values(ph().unread).filter(n => n > 0).length;       // số cuộc trò chuyện có tin mới
const unreadMsgs = () => Object.values(ph().unread).reduce((a, b) => a + b, 0);       // tổng số tin chưa đọc
// Số ngày chờ trước khi một tin nhắn có thể đến lại. Tin không có trong bảng này chỉ đến một lần.
const MSG_CD = { mom_breakfast:6, mom_weather:12, linh_video:9, tung_football:7, tung_meme:6, team_lunch:5, team_meeting:7 };
function msgReady(id){ const last = (S.evLast || {})['m_' + id]; if (last === undefined) return !S.once['m_' + id]; return !!MSG_CD[id] && S.day - last >= MSG_CD[id]; }
function maybeMsg(slot){
  const p = ph(), f = S.flags.msgDay && S.flags.msgDay.d === S.day ? S.flags.msgDay : (S.flags.msgDay = { d:S.day, n:0 });
  if (f.n >= PHONE.MAX_DAY || !chance(PHONE.P)) return;
  const pool = shuffle(Object.entries(MSGS).filter(([id, m]) => m.ctx.includes(slot) && msgReady(id) && !p.pending[m.th] && (!m.cond || m.cond())));
  if (!pool.length) return;
  const [id, m] = pool[0]; f.n++;
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
    if (ig.resp) { pushMsg(th, ig.who || m.msgs[0][0], ig.resp); addUnread(th, 1, !ig.loud); }   // nhắc lại khi bị lờ: lặng lẽ (trừ tin quan trọng có loud)
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
  const resp = typeof r.resp === 'function' ? r.resp() : r.resp;
  if (resp) pushMsg(th, r.who || m.msgs[0][0], resp);
  delete p.pending[th];
  save(); updateHUD(); openThread(th, diffChips(before, snap()));
}
