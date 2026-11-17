/* =========================================================
   v15: KỶ LUẬT – đang có task mà rời bàn quá lâu thì bị nhắc
   Chỉ tính khi đang ở cảnh task chưa làm, đồng hồ đang chạy (mở điện thoại, đang chọn việc, đang nói chuyện thì không tính).
   Đứng gần bàn mình thì bộ đếm về 0. Mỗi loại nhắc tối đa một lần mỗi ngày.
   ========================================================= */
const KY_LUAT = {
  STEP:30,          // mỗi 30 phút game rời bàn liên tục thì lên một mức (30 → nhắn tin, 60 → đến tận nơi, 90 → trừ hiệu suất)
  NEAR:40,          // đứng cách bàn mình trong khoảng này thì tính là đang ở bàn
  BOSS_REL:-1,      // mức 2: quan hệ với chị Hạnh
  PERF:-1,          // mức 3: điểm hiệu suất (dùng trong buổi nhận xét)
  MEET_REL:-1,      // họp đầu ngày đến muộn (đã vào công ty mà không tới chỗ họp): quan hệ với chị Hạnh
};
const KL_MSG = ['Em đang ở đâu thế? Task sáng nay em xem chưa?', 'Em ơi, quay lại bàn làm việc nhé. Có gì vướng thì hỏi chị.'];
const KL_VISIT = ['Em ơi, giờ làm việc đấy nhé. Về bàn làm task đi em.', 'Chị thấy em đi lại nãy giờ rồi. Task xong chưa em?'];

function klToday(){ const k = S.flags.kl; return k && k.d === S.day ? k : (S.flags.kl = { d:S.day }); }
function klLog(W, icon, text){ const was = ROAM_NOW; ROAM_NOW = W.t / 60; feedAdd({ id:'kl' }, icon, text, 0); ROAM_NOW = was; note(text); }

function klFrame(W, dt, api){
  if (W.ref.id !== 'task' || W.busy || W.toast || W.menu) return;
  const d = W.H.desks.me, near = Math.hypot(W.me.x - d.x, (W.me.y - d.y) * 1.4) < KY_LUAT.NEAR;
  if (near) { W.away = 0; return; }
  W.away = (W.away || 0) + dt * ROAM.MIN_PER_SEC;
  const lv = Math.min(3, Math.floor(W.away / KY_LUAT.STEP));
  if (lv > (W.klLv || 0)) klLevel(W, api, lv);
}
// Lên một mức nhắc (mỗi loại một lần mỗi ngày)
function klLevel(W, api, lv){
  W.klLv = Math.max(W.klLv || 0, lv);
  const k = klToday();
  if (lv === 1 && !k.msg) {
    k.msg = true; pushMsg('boss', 'boss', pick(KL_MSG)); addUnread('boss'); updateHUD();
    api.say(api.me, '(Điện thoại rung… chị Hạnh nhắn)', 1600); klLog(W, '📱', 'Chị Hạnh nhắn nhắc quay về bàn làm việc.');
  } else if (lv === 2 && !k.walk) {
    k.walk = true; rel('boss', KY_LUAT.BOSS_REL); clampAll(); updateHUD();
    klLog(W, '🧭', 'Chị Hạnh đến tận nơi nhắc về bàn làm việc.'); bossVisit(W, api, pick(KL_VISIT));
  } else if (lv === 3 && !k.perf) {
    k.perf = true; S.perf += KY_LUAT.PERF; S.stat.klWarn = (S.stat.klWarn || 0) + 1; updateHUD();
    klLog(W, '⚠️', 'Bị ghi nhận bỏ bàn làm việc quá lâu (hiệu suất −1).');
    const b = W.npcs.find(n => n.who === 'boss'); if (b) api.say(b, 'Chị sẽ ghi chuyện này vào buổi nhận xét đấy.', 2200);
  }
}
// Họp đầu ngày: đã vào công ty mà không tới chỗ họp
function klMeetLate(W, api){
  const k = klToday(); if (k.meet) return; k.meet = true;
  rel('boss', KY_LUAT.MEET_REL); clampAll(); updateHUD();
  klLog(W, '🗣️', 'Đến chỗ họp muộn, chị Hạnh gọi tên trước cả nhóm.');
}
