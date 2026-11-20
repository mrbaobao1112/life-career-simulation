/* =========================================================
   v17.5 – PHASE 3: NGÀY ĐẶC BIỆT – CHỌN LOẠI NGÀY VÀ PHẢN ỨNG CỦA ĐỒNG NGHIỆP TRONG VĂN PHÒNG
   ngayLoai(d): loại của ngày d (null = ngày bình thường). Cố định theo ngày (không đổi khi tải lại game), không cần lưu.
   Trong văn phòng, đồng nghiệp phản ứng theo loại ngày:
     hạn chót / sự cố: ngồi lì ở bàn, mặt mệt hoặc hoảng (⏰ 🔥), không đi lại tán gẫu
     review: anh Dũng sang bàn bạn một lúc (🔍)
     khách đến: chị Hạnh tiếp khách ở chỗ họp (🤝)
     demo: chị Hạnh, chị Mai, anh Dũng ra chỗ họp chuẩn bị (📽️)
     team building: cuối chiều thứ Sáu cả team ra pantry (🎉)
   ========================================================= */
function ngayLoai(d){
  if (!NGAY.ON || !S.job || d < S.job.start + NGAY.TU_NGAY || isDayOff(d)) return null;
  const memo = ngayLoai.memo || (ngayLoai.memo = {}), key = S.job.co + ':' + S.job.start + ':' + d; if (key in memo) return memo[key];
  let seed = 2166136261; for (const ch of key) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;     // cố định theo công ty và ngày (FNV-1a)
  const r = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   // mulberry32
  let out = null;
  const prev = ngayLoai(d - 1), prev2 = prev && ngayLoai(d - 2);
  if (r() < NGAY.P && !(prev && prev2)) {                               // tối đa 2 ngày đặc biệt liền nhau, rồi có ngày bình thường
    const wd = dayInfo(d).wd, boost = NGAY_CTY[S.job.co] || {};
    const list = Object.entries(NGAY_LOAI).filter(([k, v]) => k !== prev && (!v.wd || v.wd.includes(wd))).map(([k, v]) => [k, v.w * (boost[k] || 1)]);
    let x = r() * list.reduce((n, [, w]) => n + w, 0); for (const [k, w] of list) { x -= w; if (x <= 0) { out = k; break; } }
  }
  return (memo[key] = out);
}
// Thêm cảnh của ngày đặc biệt vào đúng buổi (gọi từ buildSlot). Tua nhanh hoặc nghỉ phép thì không có.
// Trả về true nếu đã thêm (khi đó buổi đó không thêm sự kiện ngẫu nhiên nữa, để không dày đặc)
function ngayQueue(q, buoi){
  if (S.fast || (typeof leaveOn === 'function' && leaveOn(S.day))) return false;
  const k = ngayLoai(S.day); if (!k || NGAY_LOAI[k].buoi !== buoi) return false;
  q.push({ id:'ev', arg:'ngay_' + k }); return true;
}

/* ----- Trong văn phòng ----- */
const NGAY_VP = { REVIEW_H:[10.2, 11.5], KHACH_H:[10, 11.5], DEMO_H:[14.5, 15.6], TEAM_H:[16, 17.2] };
function ngayVpMount(W, api){
  const k = ngayLoai(S.day); W.ngay = k ? { k, done:{} } : null; if (!k) return;
  if (k === 'khach') {                                   // khách hàng ngồi ở chỗ họp cùng chị Hạnh
    const m = W.H.meetSpot, g = api.npc('p', m.x + 30, m.y, 'act-talk', true, { id:'khach_hang', label:'Khách hàng', look:{ g:'nam', hair:'hair_side', hairColor:'#2B2321', skin:'#FFD6BA', outfit:{ kind:'shirt', color:'#3B4252' } } });
    g.crowd = true; g.entries = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }]; songHide(g, true); W.ngay.khach = g;
  }
}
function ngayVpFrame(W, api){
  const N = W.ngay; if (!N || !W.song || W.song.kind !== 'office') return;
  const h = W.t / 60, inH = r => h >= r[0] && h < r[1], free = who => W.npcs.find(a => a.ai && a.who === who && !a.gone && !a.ai.busy && !a.ai.inBeat && !a.ai.held && a.ai.act === 'desk');
  const once = (key, fn) => { if (!N.done[key]) { N.done[key] = true; fn(); } };
  if (N.k === 'review' && inH(NGAY_VP.REVIEW_H)) once('review', () => {   // anh Dũng sang bàn bạn
    const a = free('dung'), d = W.H.desks && W.H.desks.me; if (!a || !d) return;
    a.ai.busy = true; songWalk(W, api, a, seatFor(W, a, { x:d.x + 34, y:d.y + 8, face:true })).then(ok => { if (!ok) return; api.C.face(a, true); api.C.act(a, 'act-talk'); songSign(a, '🔍'); if (songInView(W, a.x) && !api.C.still) api.say(a, 'Em xem giúp anh đoạn này.', 1600); a.ai.beatEnd = W.t + 15; a.ai.inBeat = true; a.ai.busy = false; });
  });
  if (N.k === 'khach' && N.khach) {
    const on = inH(NGAY_VP.KHACH_H), g = N.khach;
    if (on && g.gone) { songAppear(api, g, W.H.spawn.x, W.H.spawn.y); songWalk(W, api, g, { x:W.H.meetSpot.x + 30, y:W.H.meetSpot.y }).then(ok => { if (ok) { api.C.face(g, true); api.C.act(g, 'act-talk'); songSign(g, '🤝'); } });
      const b = free('boss'); if (b) songForceBeat(W, api, b, { spot:'meet', act:'act-talk', sign:'🤝', dur:[80, 90] }); }
    if (!on && !g.gone && !g.ngayOut) { g.ngayOut = true; songWalk(W, api, g, W.H.spawn).then(ok => { if (ok) songHide(g, true); }); }
  }
  if (N.k === 'demo' && inH(NGAY_VP.DEMO_H)) once('demo', () => ['boss', 'mai', 'dung'].forEach(w => { const a = free(w); if (a) songForceBeat(W, api, a, { spot:'meet', act:'act-listen', sign:'📽️', dur:[50, 60] }); }));
  if (N.k === 'team' && inH(NGAY_VP.TEAM_H)) once('team', () => {
    W.npcs.filter(a => a.ai && !a.gone).forEach(a => { a.ai.busy = false; a.ai.inBeat = false; songForceBeat(W, api, a, { spot:'pantry', act:'act-laugh', sign:'🎉', dur:[50, 60] }).then(() => npcFeel(a, 'happy', 30000)); });
    const m = W.npcs.find(a => a.who === 'mai' && !a.gone); if (m && songInView(W, m.x) && !api.C.still) api.say(m, 'Cả nhà ơi, ra chơi nào!', 1800);
  });
}
// Hạn chót, sự cố: ngồi lì ở bàn, không đi lại; dấu hiệu và nét mặt theo ngày
(() => {
  const beat = songBeat;
  songBeat = function(W, api, a){
    const N = W.ngay; if (N && (N.k === 'deadline' || N.k === 'suco') && W.song.kind === 'office' && a.ai.act === 'desk') { a.ai.until = W.t + SONG.IDLE[1]; return; }
    return beat(W, api, a);
  };
  const settle = songSettle;
  songSettle = function(W, api, a, def, p){
    const r = settle(W, api, a, def, p), N = W.ngay;
    if (N && (N.k === 'deadline' || N.k === 'suco') && a.ai && a.ai.act === 'desk') { songSign(a, NGAY_LOAI[N.k].icon); a.baseExpr = N.k === 'suco' ? 'panic' : 'tired'; npcFace(a, a.baseExpr); }
    return r;
  };
  const OP = ROAM_PLACES.find(p => p.id === 'office'); if (!OP) return;
  const mount = OP.mount, frame = OP.frame;
  OP.mount = function(W, api){ ngayVpMount(W, api); const r = mount.call(this, W, api); return r; };
  OP.frame = function(W, dt, api){ const r = frame ? frame.call(this, W, dt, api) : undefined; ngayVpFrame(W, api); return r; };
})();
// Dành cho kiểm thử: loại ngày của các ngày tới
const NGAY_DEBUG = (from = S.day, n = 20) => Array.from({ length:n }, (_, i) => [from + i, dayInfo(from + i).dow, ngayLoai(from + i)]);
