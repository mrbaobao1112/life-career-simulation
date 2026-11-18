/* =========================================================
   THẾ GIỚI SỐNG – PHASE 3: SỰ KIỆN THẾ GIỚI (xảy ra không cần người chơi)
   Bảng WORLD_EV: mỗi sự kiện có nơi, khung giờ, xác suất, hàm chạy. Có giãn cách (WEV.GAP) và giới hạn mỗi ngày (WEV.DAY_MAX)
   để không dày đặc. Thêm sự kiện mới = thêm một mục vào bảng.
   Văn phòng: tranh luận kỹ thuật, giao task mới, họp đột xuất, có người đến muộn.
   Phố: hai người quen gặp nhau (pho-song.js), trời mưa người đi bộ trú mưa (pho-song.js).
   Khu dân cư: hàng xóm, trẻ con, người dắt chó (pho-song.js).
   ========================================================= */
const WEV = {
  ON:true,                   // tắt (false) thì không có sự kiện thế giới nào (kiểm thử cũ dùng để tách riêng hành vi)
  GAP:45,                    // hai sự kiện ở cùng một nơi cách nhau ít nhất chừng này phút game
  DAY_MAX:6,                 // mỗi ngày tối đa chừng này sự kiện thế giới
  CHECK:6,                   // cứ chừng này phút game thì cân nhắc một sự kiện
  LATE_P:.2,                 // xác suất hôm nay có một đồng nghiệp đến muộn
};
function wevDay(){ const f = S.flags.wev; return f && f.d === S.day ? f : (S.flags.wev = { d:S.day, n:0, last:{} }); }
function wevAllow(W, place){ const f = wevDay(); return WEV.ON && f.n < WEV.DAY_MAX && W.t - (f.last[place] ?? -1e9) >= WEV.GAP; }
function wevMark(W, place, id){ const f = wevDay(); f.n++; f.last[place] = W.t; if (id) (f.ids = f.ids || []).push(id); }

// Người hôm nay đến muộn (ở công ty): giờ đến lùi khoảng 35 phút
function wevLateWho(){
  if (!WEV.ON || !S.job || S.day === S.job.start || songRng('late')() > WEV.LATE_P) return null;
  return ['dung', 'mai', 'phong'][Math.floor(songRng('latewho')() * 3)];
}
const XG_EV = {
  argue:[['Cái này phải tách hàm ra chứ.', 'Tách ra chậm hơn đấy.', 'Thôi, thử cả hai cách xem.'], ['Lỗi này do bên em mà.', 'Không, log ghi rõ phía máy chủ.', 'Ừ, để xem lại.']],
  newtask:[['Em nhận thêm task này nhé, hạn thứ Sáu.', 'Dạ vâng ạ.'], ['Có task gấp, em xem giúp chị.', 'Dạ, em làm ngay.']],
  late:['Xin lỗi, tắc đường quá!', 'Hôm nay xe hỏng giữa đường…', 'Em xin lỗi, ngủ quên ạ.'],
};
const officeNpc = (W, who) => W.npcs.find(a => a.ai && a.who === who && !a.gone && !a.ai.busy && !a.ai.inBeat && !a.ai.held && !a.lock && a.ai.act === 'desk');
const WORLD_EV = [
  { id:'argue', where:'office', h:[9.5, 16.5], p:.35, run:async (W, api) => {           // hai đồng nghiệp tranh luận kỹ thuật, rồi làm lành
    const pairs = [['dung', 'mai'], ['phong', 'dung'], ['mai', 'phong']].filter(([x, y]) => officeNpc(W, x) && officeNpc(W, y)); if (!pairs.length) return false;
    const [x, y] = pairs[Math.floor(songRng('arg' + W.t)() * pairs.length)], a = officeNpc(W, x), b = officeNpc(W, y);
    a.ai.busy = true; b.ai.held = true;
    if (!await songWalk(W, api, a, seatFor(W, a, { x:b.x + 30, y:b.y + 6, face:true }))) return true;
    songSign(a, '💢'); songSign(b, '💢'); npcBond(x, y, 0, -1);
    await songTalk(W, api, a, b, pickLine(XG_EV.argue, 'arg', songRng('a' + W.t)));
    if (!api.alive()) return true; songSign(a, '🤝'); songSign(b, '🤝'); b.ai.held = false; a.ai.busy = false; a.ai.until = 0; return true; } },
  { id:'newtask', where:'office', h:[9.5, 16], p:.3, run:async (W, api) => {           // chị Hạnh giao task mới cho một người
    const boss = officeNpc(W, 'boss'), to = ['phong', 'mai', 'dung'].map(k => officeNpc(W, k)).find(Boolean); if (!boss || !to) return false;
    boss.ai.busy = true; to.ai.held = true;
    if (!await songWalk(W, api, boss, seatFor(W, boss, { x:to.x + 30, y:to.y + 6, face:true }))) return true;
    songSign(boss, '📋'); await songTalk(W, api, boss, to, pickLine(XG_EV.newtask, 'nt', songRng('n' + W.t)));
    if (!api.alive()) return true; to.ai.held = false; to.ai.until = W.t + 60; songSign(to, '💻'); boss.ai.busy = false; boss.ai.until = 0; return true; } },
  { id:'meeting', where:'office', h:[10, 16], p:.25, run:async (W, api) => {          // họp đột xuất: chị Hạnh gọi hai người vào chỗ họp
    const boss = officeNpc(W, 'boss'), others = ['dung', 'mai', 'phong'].map(k => officeNpc(W, k)).filter(Boolean).slice(0, 2); if (!boss || others.length < 2) return false;
    if (songInView(W, boss.x) && !api.C.still) api.say(boss, 'Dũng, Mai vào họp nhanh nhé!', 1800);
    const B = { spot:'meet', act:'act-listen', sign:'👥', dur:[15, 25] };
    [boss, ...others].forEach(a => songForceBeat(W, api, a, B)); return true; } },
];
// Cân nhắc một sự kiện (gọi từ nhịp nghĩ của văn phòng)
function wevTick(W, api){
  if (W.song.kind !== 'office') return;
  wevLateTick(W, api);
  if (!W.ref || W.ref.id !== 'task') return;
  if (W.t - (W.wevCheck ?? -1e9) < WEV.CHECK) return; W.wevCheck = W.t;
  if (!wevAllow(W, 'office')) return;
  const r = songRng('wev' + Math.round(W.t)), h = W.t / 60, f = wevDay();
  const ok = WORLD_EV.filter(e => e.where === 'office' && h >= e.h[0] && h < e.h[1] && !(f.ids || []).includes(e.id));
  const e = ok[Math.floor(r() * ok.length)]; if (!e || r() > e.p) return;
  wevMark(W, 'office', e.id);
  e.run(W, api).then(started => { if (started === false) { f.n--; f.ids.pop(); f.last.office = -1e9; } });
}
// Người đến muộn vừa vào đến bàn: xin lỗi, chị Hạnh lắc đầu (mỗi ngày một lần)
function wevLateTick(W, api){
  const who = wevLateWho(), f = wevDay(); if (!who || f.lateSaid) return;
  const a = W.npcs.find(x => x.ai && x.who === who && !x.gone && x.ai.act === 'desk' && !x.ai.busy); if (!a) return;
  f.lateSaid = true; songSign(a, '😅');
  if (songInView(W, a.x) && !api.C.still) { api.say(a, pick(XG_EV.late), 1800); const b = W.npcs.find(x => x.who === 'boss' && !x.gone); if (b) api.C.later(() => api.C.react(b, 'nod'), 900); }
}
// Dành cho kiểm thử: chạy ngay một sự kiện
const WEV_FORCE = id => { const e = WORLD_EV.find(x => x.id === id); return e && e.run(WORLD, WORLD.api); };
