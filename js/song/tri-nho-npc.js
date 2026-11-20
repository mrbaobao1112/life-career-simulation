/* =========================================================
   THẾ GIỚI SỐNG – PHASE 4: TRÍ NHỚ CỦA NPC VÀ NÉT MẶT
   Trí nhớ: S.npcMem là danh sách ngắn { w:người nhớ, o:nhớ về ai ('me' hoặc một NPC), k:chuyện, v:+1 tốt / −1 không tốt, d:ngày, n:số lần đã nhắc }.
   - Ghi khi một lựa chọn làm quan hệ với ai đó thay đổi đáng kể, và chỉ với những chuyện có câu nhắc lại (MEM_LINES).
   - Từ hôm sau, lần gặp đầu tiên ngoài đời (đi ngang qua, chào) người đó nhắc lại chuyện cũ, nét mặt theo chuyện.
   - Có giới hạn (MEM.MAX, MEM.PER) và tự quên sau MEM.KEEP ngày, nên bản lưu chỉ thêm vài trăm ký tự. Bản lưu cũ chưa có thì tự tạo.
   Nét mặt: NPC đổi nét mặt theo việc đang làm và theo chuyện vừa xảy ra (dùng đúng các nét mặt chibi có sẵn), không ngẫu nhiên.
   ========================================================= */
const MEM = {
  MAX:24,                    // cả game nhớ tối đa chừng này chuyện
  PER:4,                     // mỗi người nhớ tối đa chừng này chuyện (bỏ chuyện cũ nhất)
  KEEP:14,                   // sau chừng này ngày thì quên
  SAY:2,                     // mỗi chuyện nhắc lại tối đa chừng này lần (mỗi ngày một lần)
  UP:4, DOWN:-3,             // quan hệ thay đổi từ chừng này trở lên (hoặc xuống) mới đáng nhớ
  LEAVE:2,                   // nghỉ từ chừng này ngày làm việc trong tuần qua thì đồng nghiệp hỏi thăm
  FEEL_MS:2600,              // nét mặt khi nhắc chuyện cũ giữ chừng này mili giây rồi trở lại bình thường
};
const memAll = () => S.npcMem || (S.npcMem = []);
const memSpeaker = k => k === 'family' ? 'mom' : k;
// Ghi một chuyện (trùng người, trùng chuyện thì cập nhật chuyện cũ)
function memAdd(m){
  const L = memAll(), old = L.find(x => x.w === m.w && x.o === m.o && x.k === m.k);
  if (old) { old.v = m.v; old.d = S.day; old.n = 0; return old; }
  const x = { w:m.w, o:m.o, k:m.k, v:m.v, d:S.day, n:0 }; L.push(x);
  const mine = L.filter(y => y.w === m.w); if (mine.length > MEM.PER) L.splice(L.indexOf(mine[0]), 1);
  if (L.length > MEM.MAX) L.splice(0, L.length - MEM.MAX);
  return x;
}
function memForget(){ const L = memAll(); for (let i = L.length - 1; i >= 0; i--) if (S.day - L[i].d > MEM.KEEP || (L[i].n >= MEM.SAY && L[i].said !== S.day && L[i].tk !== S.day)) L.splice(i, 1); }   // đã nhắc đủ lần thì quên (nhưng không quên giữa ngày đang nhắc)
// Gọi sau mỗi lựa chọn (settleChoice): ai thay đổi quan hệ đáng kể trong cảnh có câu nhắc thì người đó ghi nhớ
function memNote(ref, before){
  if (!ref || !before || !before.rel) return;
  const topic = ref.id === 'ev' ? 'ev:' + ref.arg : ref.id, T = MEM_LINES[topic]; if (!T) return;
  Object.keys(S.rel).forEach(k => {
    const d = S.rel[k] - (before.rel[k] ?? S.rel[k]); if (d < MEM.UP && d > MEM.DOWN) return;
    const w = memSpeaker(topic === 'hangout' && ref.arg === 'family' ? 'family' : k), side = T[d > 0 ? 'pos' : 'neg'];
    if (side && (side[w] || side['*'])) memAdd({ w, o:'me', k:topic, v:d > 0 ? 1 : -1 });
  });
}
// Câu nhắc chuyện cũ của người này với mình (null nếu không có). Đánh dấu đã nhắc.
// kind: 'chao' (câu chào khi đi ngang) hoặc 'talk' (khi bạn chủ động bắt chuyện). Mỗi kiểu nhắc tối đa một lần mỗi ngày;
// cùng một ngày dù nhắc ở cả hai kiểu cũng chỉ tính là một lần (MEM.SAY đếm theo ngày), và chọn câu khác nhau.
function memRecall(who, kind = 'chao'){
  memForget();
  const key = kind === 'talk' ? 'tk' : 'said';
  const m = memAll().filter(x => x.w === who && x.o === 'me' && x.d < S.day && x[key] !== S.day).sort((a, b) => b.d - a.d)[0];
  if (m) {
    const side = MEM_LINES[m.k] && MEM_LINES[m.k][m.v > 0 ? 'pos' : 'neg'], list = side && (side[who] || side['*']); if (!list) return null;
    if (m.said !== S.day && m.tk !== S.day) m.n++; m[key] = S.day;
    return { text:pickLine(list, 'mem' + who + m.k), expr:m.v > 0 ? 'happy' : (who === 'mom' || m.k === 'ev:tung_borrow' ? 'sad' : 'annoyed'), m };
  }
  const L = MEM_LEAVE[who], f = S.flags.memLeave || (S.flags.memLeave = {});     // vừa nghỉ mấy hôm: hỏi thăm một lần
  if (L && S.job && !isDayOff(S.day) && !leaveOn(S.day) && !(S.day - (f[who] ?? -99) < 7) && memLeaveDays() >= MEM.LEAVE) {
    f[who] = S.day; return { text:pick(L), expr:who === 'dung' ? 'neutral' : 'happy' };
  }
  return null;
}
const memLeaveDays = () => { if (typeof leaveOn !== 'function') return 0; let n = 0; for (let d = S.day - 7; d < S.day; d++) if (d >= 1 && !isDayOff(d) && leaveOn(d)) n++; return n; };
// Người chơi đi ngang qua một NPC: nhắc chuyện cũ nếu có (mỗi lần vào cảnh một lần), đổi nét mặt theo chuyện
function memGreet(W, a){
  if (!a || !NPC[a.who] || a.crowd) return null;
  W.memSaid = W.memSaid || {}; if (W.memSaid[a.who]) return null;
  const r = memRecall(a.who); if (!r) return null;
  W.memSaid[a.who] = true; npcFeel(a, r.expr, MEM.FEEL_MS);
  if (W.api) W.api.C.react(a, r.expr === 'happy' ? 'hop' : 'nod');
  return r.text;
}
// NPC nhớ chuyện với NPC: câu cho lần chào sau (ví dụ sau trận tranh luận, sau hôm ăn bánh)
function memNpcLine(a, b){
  memForget();
  const m = memAll().find(x => x.d < S.day && x.said !== S.day && MEM_NPC[x.k] && ((x.w === a && x.o === b) || (x.w === b && x.o === a))); if (!m) return null;
  m.n++; m.said = S.day; return { lines:pickLine(MEM_NPC[m.k], 'memnpc' + m.k), expr:m.k === 'argue' ? 'neutral' : 'happy' };
}

/* ----- Nét mặt ----- */
// Đổi nét mặt một NPC ngay trên sân khấu (dùng lại hình mặt chibi). Không đổi nếu đã đúng nét đó.
function npcFace(a, expr){
  if (!a || !a.el || a.who === 'me' || a.expr === expr) return;
  const L = a.look || (NPC[a.who] && NPC[a.who].look), f = a.el.querySelector('.cb-face'), x = a.el.querySelector('.cb-extra'); if (!L || !f) return;
  f.innerHTML = faceSVG(expr, L.skin, { g:L.g, hc:L.hairColor });
  if (x) x.innerHTML = (EXPR_EXTRA[expr] || []).map(e => EXTRA[e] || '').join('');
  a.expr = expr;
}
// Nét mặt trong chốc lát rồi trở lại nét mặt theo việc đang làm
function npcFeel(a, expr, ms = MEM.FEEL_MS){
  if (!a) return; npcFace(a, expr); clearTimeout(a.feelT);
  a.feelT = setTimeout(() => { if (a.el && a.el.isConnected) npcFace(a, a.baseExpr || 'neutral'); }, ms);
}
// Nét mặt theo việc đang làm: ngủ thì nhắm mắt, chơi game hay ăn thì vui, chiều muộn ở công ty thì mệt
const EXPR_ACT = { sleep:'tired', game:'happy', eat:'happy', tea:'happy', news:'neutral', read:'neutral', cook:'neutral', sweep:'neutral', altar:'neutral', meet:'neutral' };
function npcBaseExpr(W, a, key){
  if (W.song && W.song.kind === 'office') return key === 'desk' && W.t >= 17 * 60 ? 'tired' : defaultNpcExpr(a.who);
  if (key !== 'sleep' && W.t >= 23 * 60) return 'yawn';
  return EXPR_ACT[key] || (NPC[a.who] ? defaultNpcExpr(a.who) : 'neutral');
}
// Gắn nét mặt vào bộ máy hành vi (không sửa bộ máy, chỉ bọc thêm)
(() => {
  const settle = songSettle;
  songSettle = function(W, api, a, def, p){
    const r = settle(W, api, a, def, p);
    if (a && a.ai && !a.gone) { a.baseExpr = def.lie ? 'tired' : npcBaseExpr(W, a, a.ai.act || a.ai.i); if (!a.feelT || a.expr === a.baseExpr) npcFace(a, a.baseExpr); }
    return r;
  };
  const talk = songTalk;
  songTalk = async function(W, api, a, b, lines){
    // nói chuyện: thân thì vui; Phong hỏi nhiều quá thì anh Dũng mệt, Phong buồn
    const tone = a.who === 'phong' && b.who === 'dung' ? a.ai && a.ai.askTone : null, tier = a.who && b.who && NPC[a.who] && NPC[b.who] ? npcTier(a.who, b.who) : 'thuong';
    const ea = tone === 'tired' ? 'sad' : tone === 'cold' ? 'neutral' : tier === 'than' || W.song.kind === 'home' ? 'happy' : 'neutral';
    const eb = tone === 'tired' ? 'tired' : tone === 'cold' ? 'annoyed' : ea;
    npcFeel(a, ea, 60000); npcFeel(b, eb, 60000);
    const ok = await talk(W, api, a, b, lines);
    [a, b].forEach(x => npcFeel(x, x.expr, 1500));
    return ok;
  };
})();
// Dành cho kiểm thử
const MEM_DEBUG = () => memAll().map(m => `${m.w}>${m.o}:${m.k}${m.v > 0 ? '+' : '-'}@${m.d}#${m.n}`);
