/* =========================================================
   v17.5 – PHASE 3: ĐỜI SỐNG GIA ĐÌNH (dữ liệu ở du-lieu/gia-dinh.js)
   - Bố mẹ cùng ăn, cùng xem TV, cùng uống trà thì nói chuyện với nhau (theo việc đang làm).
   - Ngày đi làm, chiều tối về nhà: mẹ (hoặc Tùng) hỏi han; bấm vào họ để chọn câu trả lời.
   - Tùng đi ca chiều về kể chuyện chỗ làm.
   Chạy theo nhịp nghĩ sẵn có của nhà (songSocialTick), không thêm vòng lặp. Chỉ ghi vài cờ nhỏ trong S.flags.
   ========================================================= */
function gdTick(W, api){
  if (!GD.ON || !W.song || W.song.kind !== 'home') return;
  gdBoMe(W, api); gdHoiTham(W, api); gdTungKe(W, api);
}
const gdAt = (W, who) => W.npcs.find(a => a.ai && a.who === who && !a.gone && !(a.home && a.home.lie));
// Bố mẹ cùng làm một việc (ăn, xem TV, uống trà) thì nói chuyện với nhau
function gdBoMe(W, api){
  const m = gdAt(W, 'mom'), d = gdAt(W, 'dad'); if (!m || !d) return;
  const act = m.ai.act; if (act !== d.ai.act || !GD_CHUYEN[act] || m.ai.busy || d.ai.busy || m.ai.inBeat || d.ai.inBeat) return;
  if (W.t < (W.gdNext ?? 0)) return;
  W.gdNext = W.t + GD.CHAT_GAP[0] + Math.random() * (GD.CHAT_GAP[1] - GD.CHAT_GAP[0]);
  const l = pickLine(GD_CHUYEN[act], 'gd' + act), [a, b] = Math.random() < .5 ? [m, d] : [d, m];
  songSign(a, '💬'); npcFeel(a, 'happy', 4500); npcFeel(b, 'happy', 4500);
  if (songInView(W, a.x) && !api.C.still) l.forEach((t, i) => api.C.later(() => api.say(i % 2 ? b : a, t, 1500), i * 1600));
  api.C.later(() => songSign(a, (songDef(W, act) || {}).sign || ''), l.length * 1600 + 200);
}
// Đi làm về: người nhà hỏi han (một lần mỗi ngày làm việc)
function gdHoiTham(W, api){
  if (W.gdHoi || !S.job || isDayOff(S.day) || (S.flags.gdHoi || 0) === S.day || W.t / 60 < GD.HOI_TU || S.otTonight === true) return;
  const who = S.bg === 'nha' ? 'mom' : S.bg === 'ghep' ? 'tung' : null, a = who && gdAt(W, who); if (!a || a.ai.busy) return;
  if (Math.abs(a.x - W.me.x) > 220) return;                                 // đợi bạn lại gần
  W.gdHoi = { who, a }; S.flags.gdHoi = S.day;
  api.C.face(a, W.me.x < a.x); songSign(a, '❓'); npcFeel(a, 'happy', 3000);
  api.say(a, pick(GD_HOI[who].hoi), 2200);
}
function gdTraLoi(W, api, k){
  const H = W.gdHoi; if (!H || H.done) return; H.done = true;
  const { who, a } = H, G = GD_HOI[who], ans = GD_TRA_LOI.find(x => x[0] === k), C = api.C;
  W.busy = true; api.showPrompt(); C.face(W.me, a.x < W.me.x); songSign(a, '');
  (async () => {
    api.say(api.me, who === 'tung' ? ans[2].replace(/^Con /, 'Tao ').replace('Công việc', 'Công ty') : ans[2], 1600); if (!await api.wait(C.still ? 0 : 1500)) return;
    const lines = G[k] || []; for (const t of lines) { api.say(a, t, 1700); C.react(a, 'nod'); if (!await api.wait(C.still ? 0 : 1600)) return; }
    if (k === 'buon') {
      npcFeel(a, who === 'mom' ? 'sad' : 'neutral', 3000);
      const d = gdAt(W, 'dad'); if (who === 'mom' && d && G.buon_bo) { api.say(d, pick(G.buon_bo), 1700); if (!await api.wait(C.still ? 0 : 1500)) return; }
      if ((S.flags.gdAnUi || 0) !== S.day) { S.flags.gdAnUi = S.day; S.mood += GD.AN_UI; clampAll(); }
      if (typeof memAdd === 'function') memAdd({ w:who, o:'me', k:'gd_buon', v:1 });
    } else npcFeel(a, 'happy', 2500);
    chatBond(who); updateHUD(); save(); W.busy = false; api.showPrompt();
  })();
}
// Tùng đi ca chiều về: kể chuyện ở chỗ làm (một lần mỗi ngày)
function gdTungKe(W, api){
  if (S.bg !== 'ghep' || songWeekend() || (S.flags.gdTung || 0) === S.day || W.t / 60 < 21.5) return;
  const a = gdAt(W, 'tung'); if (!a || a.ai.busy || Math.abs(a.x - W.me.x) > 160 || (W.gdHoi && !W.gdHoi.done)) return;
  S.flags.gdTung = S.day;
  const l = pickLine(GD_TUNG_KE, 'gdtung'); api.C.face(a, W.me.x < a.x); npcFeel(a, 'happy', l.length * 1600 + 800);
  if (!api.C.still) l.forEach((t, i) => api.C.later(() => api.say(i % 2 ? api.me : a, t, 1500), i * 1600));
}

/* ----- Nối vào nhà: nhịp nghĩ, và thực đơn trả lời khi được hỏi han ----- */
(() => {
  const social = songSocialTick;
  songSocialTick = function(W, api){ social(W, api); gdTick(W, api); };
  const HP = ROAM_PLACES.find(p => p.id === 'home'); if (!HP) return;
  const base = HP.npcEntries;
  HP.npcEntries = (ref, sc, who) => {
    const list = base(ref, sc, who), W = WORLD, H = W && W.gdHoi;
    if (H && !H.done && H.who === who) return GD_TRA_LOI.map(([k, icon, label]) => ({ icon, label:who === 'tung' ? label.replace(/^Con /, 'Tao ') : label, run:(W2, api) => gdTraLoi(W2, api, k) })).concat(list);
    return list;
  };
})();
