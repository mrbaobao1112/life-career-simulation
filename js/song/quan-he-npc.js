/* =========================================================
   THẾ GIỚI SỐNG – PHASE 2: QUAN HỆ GIỮA CÁC NPC VỚI NHAU
   Mỗi cặp người có: c (độ thân 0–100), t (độ tin 0–100), n (số lần nói chuyện), ask (số lần nhờ vả hôm nay), d (ngày ghi gần nhất).
   Lưu trong S.npcRel (rất gọn). Bản lưu cũ chưa có thì tự tạo mặc định khi cần, không cần chuyển đổi.
   Chỉ ảnh hưởng hành vi và câu nói của NPC; không đụng quan hệ của người chơi (S.rel), tiền hay chỉ số.
   ========================================================= */
const NPCREL = {
  MAX_DAY:2,                 // mỗi cặp, mỗi ngày độ thân thay đổi tối đa chừng này (tránh trôi quá nhanh)
  ASK_TIRED:2,               // Phong hỏi anh Dũng quá chừng này lần mỗi ngày thì anh Dũng bắt đầu mệt
  WARM:65, COLD:40,          // ngưỡng thân / lạnh nhạt
  GREET_CD:40,               // hai người đã chào nhau thì chừng này phút game sau mới chào lại
  INIT:{                     // quan hệ ban đầu (cặp không có trong bảng: thân 50, tin 50)
    'dad|mom':{ c:82, t:88 }, 'linh|tung':{ c:58, t:52 },
    'dung|phong':{ c:55, t:50 }, 'boss|mai':{ c:62, t:66 }, 'mai|phong':{ c:60, t:55 }, 'boss|dung':{ c:56, t:72 }, 'dung|mai':{ c:52, t:60 }, 'boss|phong':{ c:50, t:48 },
  },
};
const pairKey = (a, b) => [a, b].sort().join('|');
function npcRel(a, b){
  const all = S.npcRel || (S.npcRel = {}), k = pairKey(a, b);
  if (!all[k]) { const i = NPCREL.INIT[k] || { c:50, t:50 }; all[k] = { c:i.c, t:i.t, n:0, ask:0, dc:0, d:0 }; }
  const r = all[k]; if (r.d !== S.day) { r.d = S.day; r.dc = 0; r.ask = 0; }
  return r;
}
// Thân hơn / nhạt đi sau một lần tương tác (có giới hạn mỗi ngày)
function npcBond(a, b, dc, dt = 0){
  const r = npcRel(a, b), to = Math.max(-NPCREL.MAX_DAY, Math.min(NPCREL.MAX_DAY, r.dc + dc)), x = to - r.dc;   // tổng thay đổi trong ngày nằm trong ±MAX_DAY
  r.c = clamp(r.c + x); r.t = clamp(r.t + dt); r.dc += x; r.n++;
  return r;
}
const npcTier = (a, b) => { const c = npcRel(a, b).c; return c >= NPCREL.WARM ? 'than' : c < NPCREL.COLD ? 'lanh' : 'thuong'; };

/* ----- Chọn câu không lặp: nhớ vài câu vừa dùng cho mỗi loại (chỉ trong lúc chơi, không lưu) ----- */
const SONG_SAID = {};
function pickLine(list, key, r = Math.random){
  if (!list || !list.length) return null;
  const used = SONG_SAID[key] || (SONG_SAID[key] = []), fresh = list.filter(l => !used.includes(l)), pool = fresh.length ? fresh : list;
  const line = pool[Math.floor(r() * pool.length)];
  used.push(line); if (used.length > Math.min(3, list.length - 1)) used.shift();
  return line;
}
