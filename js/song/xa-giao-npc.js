/* =========================================================
   THẾ GIỚI SỐNG – PHASE 2: NPC GIAO TIẾP VỚI NPC
   - Sang chỗ nhau nói chuyện (đồng nghiệp, bố mẹ): câu theo mức thân và theo cặp; người đang bận thì từ chối khéo.
   - Phong hỏi anh Dũng: hỏi nhiều trong ngày thì anh Dũng mệt, câu đáp ngắn dần, độ thân giảm.
   - Đi ngang qua nhau thì chào (có thời gian chờ để không chào liên tục).
   - Hết giờ làm, người thân nhau rủ nhau cùng về.
   - Sự kiện nhỏ: chị Mai mang bánh, gọi cả nhóm ra pantry.
   Chỉ là hành vi và câu nói; quan hệ ghi ở quan-he-npc.js.
   ========================================================= */
const XGK = {
  LINE_MS:1500,              // mỗi câu hiện chừng này mili giây
  GREET_R:44,                // đi ngang trong khoảng này thì chào
  LEAVE_WITH:58,             // thân từ mức này thì rủ nhau về cùng
  LEAVE_WINDOW:30,           // bạn kia cũng sắp về trong chừng này phút game thì mới rủ
  SNACK_P:.35, SNACK_H:[14.5, 16],   // xác suất hôm nay chị Mai mang bánh, và khung giờ
  SNACK_JOIN:50,             // thân với chị Mai từ mức này thì ra ăn cùng
};
const xgTalkOn = (W, a) => songInView(W, a.x);
// Một đoạn hội thoại: hai người quay mặt vào nhau, câu chạy luân phiên (chỉ hiện khi đang trong khung nhìn)
async function songTalk(W, api, a, b, lines){
  if (!lines) return api.alive();
  api.C.face(a, b.x < a.x); api.C.face(b, a.x < b.x);
  api.C.act(a, 'act-talk'); api.C.act(b, 'act-listen'); songSign(a, '💬'); songSign(b, '💬');
  if (!xgTalkOn(W, a) || api.C.still) return api.alive();
  for (let i = 0; i < lines.length; i++) {
    const s = i % 2 ? b : a; api.C.act(s, 'act-talk'); api.C.act(i % 2 ? a : b, 'act-listen'); api.say(s, lines[i], XGK.LINE_MS);
    if (!await api.wait(XGK.LINE_MS + 100)) return false;
  }
  return api.alive();
}
// Người được bắt chuyện có đang bận không (đang đi, đang làm việc xen, đang tập trung cao…)
function xgBusy(W, b, a){
  if (!b || b.gone || !b.ai || b.ai.busy || b.ai.inBeat || b.lock) return true;
  const p = personaOf(b.who), r = songRng('busy' + b.who + Math.round(W.t))();
  return npcTier(a.who, b.who) !== 'than' && r < p.focus * .35;
}
// Đến chỗ người kia rồi nói chuyện (hoặc bị từ chối). Được gọi từ việc xen 'visit' (công ty) và 'chat' (bố mẹ ở nhà)
async function songVisit(W, api, a, B, target){
  const ai = a.ai, r = songRng('v' + a.who + Math.round(W.t)), p = target ? seatFor(W, a, { x:target.x + 30, y:target.y + 6, face:true }) : seatFor(W, a, songSpot(W, a, B.spot)), b = ai.with;
  if (!p || !b) { ai.until = W.t + SONG.IDLE[0]; return; }
  ai.busy = true; a.rot = 0; ai.seat = { x:p.x, y:p.y };                     // giữ chỗ trước khi đi
  if (!await songWalk(W, api, a, p)) return;
  if (xgBusy(W, b, a)) {                                                       // bận: từ chối khéo, người hỏi quay về
    api.C.face(a, b.x < a.x); songSign(b, '🙅');
    if (xgTalkOn(W, a) && !api.C.still) api.say(b, pickLine(XG.decline[b.who] || ['Lát nhé.'], 'dec' + b.who, r), XGK.LINE_MS);
    ai.with = null; ai.beatEnd = W.t + 2; ai.busy = false; ai.inBeat = true; return;
  }
  let lines, rel;
  if (a.who === 'phong' && b.who === 'dung') {                                 // Phong hỏi anh Dũng
    rel = npcRel('phong', 'dung'); rel.ask++;
    const k = rel.c < NPCREL.COLD ? 'cold' : rel.ask > NPCREL.ASK_TIRED ? 'tired' : 'ok';
    lines = pickLine(XG.ask[k], 'ask' + k, r);
    if (k === 'ok') npcBond('phong', 'dung', 1, 1); else if (k === 'tired') npcBond('phong', 'dung', -1, -1);
    ai.askTone = k;
  } else {
    const tier = b.who && W.song.kind === 'home' ? 'family' : npcTier(a.who, b.who);
    const pair = typeof PAIR_CHAT !== 'undefined' ? PAIR_CHAT[a.who + '>' + b.who] : null;
    lines = tier === 'family' ? pickLine(XG.family, 'fam', r) : pair && r() < .5 ? pickLine(pair, 'pair' + a.who + b.who, r) : pickLine(XG.chat[tier], 'chat' + tier, r);
    npcBond(a.who, b.who, tier === 'lanh' ? 0 : 1);
  }
  b.ai.held = true; const ok = await songTalk(W, api, a, b, lines); b.ai.held = false; if (!ok) return;
  api.C.act(a, B.act); songSign(a, B.sign);
  ai.beatEnd = W.t + B.dur[0] + r() * (B.dur[1] - B.dur[0]); ai.busy = false; ai.inBeat = true;
}

/* ----- Chào khi đi ngang ----- */
function songGreetTick(W, api){
  const list = W.npcs.filter(a => a.ai && !a.gone && songInView(W, a.x));
  W.greetT = W.greetT || {};
  for (const a of list) {
    if (a.tx == null) continue;                                               // chỉ người đang đi mới chủ động chào
    for (const b of list) {
      if (b === a || a.ai.with === b || b.ai.with === a || Math.abs(a.x - b.x) > XGK.GREET_R || Math.abs(a.y - b.y) > 30) continue;   // đang đến để nói chuyện thì không chào kiểu đi ngang
      const k = pairKey(a.who, b.who); if (W.t - (W.greetT[k] ?? -1e9) < NPCREL.GREET_CD) continue;
      W.greetT[k] = W.t; const tier = W.song.kind === 'home' ? 'than' : npcTier(a.who, b.who);
      if (tier === 'lanh') { api.C.react(b, 'nod'); continue; }
      const mem = typeof memNpcLine === 'function' ? memNpcLine(a.who, b.who) : null;   // nhớ chuyện hôm trước (tranh luận, ăn bánh)
      const l = mem ? mem.lines : pickLine(XG.greet[tier], 'greet' + tier, songRng('g' + k + Math.round(W.t)));
      if (mem && typeof npcFeel === 'function') { npcFeel(a, mem.expr); npcFeel(b, mem.expr); }
      if (!api.C.still) { api.say(a, l[0], 1200); api.C.later(() => api.say(b, l[1], 1200), 900); api.C.react(b, 'nod'); }
      songSign(a, '👋'); api.C.later(() => songSign(a, ''), 1400);
    }
  }
}

/* ----- Hết giờ làm: rủ người thân cùng về ----- */
async function songLeaveTogether(W, api, a){
  if (W.song.kind !== 'office' || W.t < 17 * 60 || a.ai.forceOut || a.ai.leftWith) return;
  const lastOut = who => { const L = npcDay(who, 'office'); return L[L.length - 1][0] * 60; };
  const b = W.npcs.find(x => x !== a && x.ai && !x.gone && !x.ai.busy && !x.ai.inBeat && x.ai.act === 'desk' && !x.lock && npcRel(a.who, x.who).c >= XGK.LEAVE_WITH && lastOut(x.who) - W.t <= XGK.LEAVE_WINDOW);
  if (!b) return;
  a.ai.leftWith = b.who; const p = seatFor(W, a, { x:b.x + 30, y:b.y + 6, face:true });
  if (!await songWalk(W, api, a, p)) return;
  const yes = npcRel(a.who, b.who).c >= XGK.LEAVE_WITH + 4 || songRng('lv' + a.who)() < .6;
  if (!await songTalk(W, api, a, b, pickLine(XG.leave[yes ? 'yes' : 'no'], 'leave' + (yes ? 'y' : 'n'), songRng('lw' + a.who)))) return;
  if (yes) { b.ai.forceOut = true; b.ai.until = 0; npcBond(a.who, b.who, 1); }
}

/* ----- Sự kiện nhỏ: chị Mai mang bánh ----- */
async function songSnackTick(W, api){
  if (W.song.kind !== 'office' || S.flags.snackDay === S.day || W.ref.id !== 'task') return;
  const h = W.t / 60; if (h < XGK.SNACK_H[0] || h > XGK.SNACK_H[1]) return;
  if (songRng('snack')() > XGK.SNACK_P) { S.flags.snackDay = S.day; return; }
  const mai = W.npcs.find(x => x.who === 'mai' && x.ai && !x.gone && !x.ai.busy && !x.ai.inBeat && x.ai.act === 'desk'); if (!mai) return;
  S.flags.snackDay = S.day;
  const B = { spot:'pantry', act:'act-eat', sign:'🍰', dur:[10, 14] }, r = songRng('snk');
  await songForceBeat(W, api, mai, B); if (!api.alive()) return;
  if (!api.C.still && xgTalkOn(W, mai)) api.say(mai, pickLine(XG.snack.call, 'snc', r), 2000);
  for (const b of W.npcs.filter(x => x !== mai && x.ai && !x.gone && !x.ai.busy && !x.ai.inBeat && !x.lock)) {
    const join = npcRel('mai', b.who).c >= XGK.SNACK_JOIN && !(personaOf(b.who).focus > .9 && r() < .6);
    if (join) { npcBond('mai', b.who, 1); if (typeof memAdd === 'function') memAdd({ w:b.who, o:'mai', k:'snack', v:1 }); songForceBeat(W, api, b, B).then(() => { if (!api.C.still && xgTalkOn(W, b)) api.say(b, pickLine(XG.snack.join, 'snj', r), 1500); }); }
    else { songSign(b, '🙅'); if (!api.C.still && xgTalkOn(W, b)) api.say(b, pickLine(XG.snack.skip, 'sns', r), 1600); }
  }
}
// Gọi mỗi nhịp nghĩ của bộ máy hành vi
function songSocialTick(W, api){ songGreetTick(W, api); songSnackTick(W, api); if (typeof wevTick === 'function') wevTick(W, api); }
// Dành cho kiểm thử: bắt một NPC làm ngay một việc xen (visit, chat, water…)
function SONG_FORCE(who, key, withWho){
  const W = WORLD, a = W && W.npcs.find(x => x.ai && x.who === who); if (!a) return null;
  const B = SONG_BEAT[key];
  if (withWho) { const b = W.npcs.find(x => x.who === withWho); a.ai.with = b; return songVisit(W, W.api, a, { ...B, spot:null }, b); }
  return B.spot === 'visit' || B.spot === 'partner' ? songVisit(W, W.api, a, B) : songForceBeat(W, W.api, a, B);
}
