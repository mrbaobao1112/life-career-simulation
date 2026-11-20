/* =========================================================
   v17.5 – PHASE 1: BỘ GHÉP HỘI THOẠI KHI BẠN CHỦ ĐỘNG BẮT CHUYỆN (phím E → “Bắt chuyện”)
   Ghép một cuộc nói chuyện ngắn từ dữ liệu có điều kiện (du-lieu/hoi-thoai.js):
     1. Bạn mở lời theo buổi và kiểu quan hệ; người kia đáp theo mức thân.
     2. Nếu họ còn nhớ chuyện cũ với bạn (tri-nho-npc.js): nhắc lại, nét mặt theo chuyện, bạn đáp lại.
     3. Nếu không: chuyện vừa xảy ra (TALKS trong tinh-cach.js) hoặc một chủ đề hợp nơi, giờ, mức thân, tính cách, việc họ đang làm.
   Mức thân lấy từ quan hệ với bạn (S.rel) và chuyện không vui gần đây. Nói chuyện vẫn làm thân hơn một chút như cũ (chatBond,
   có giới hạn mỗi ngày), nên quan hệ lạnh nhạt vẫn cải thiện được dần. Không đổi tiền, chỉ số; không lưu thêm gì.
   ========================================================= */
const HTC = {
  ON:true,                   // tắt (false) thì “Bắt chuyện” dùng cách cũ (một câu theo tính cách)
  KYUC:true,                 // nhắc chuyện cũ khi bắt chuyện
  SUKIEN:.6,                 // có chuyện vừa xảy ra (đi muộn, OT, lương về…) thì nói chuyện đó với xác suất này
  NHOM:{ congviec:3, cuocsong:2, sothich:2, tamtrang:3, quanhe:1.5, hen:1 },   // độ ưu tiên mỗi nhóm chủ đề
  NHOM_NHA:{ congviec:1.2 },                                                   // ở nhà ít nói chuyện công việc hơn
  LANH_NGAY:3,               // chuyện không vui trong chừng này ngày gần đây làm họ hơi lạnh nhạt (nếu chưa thân lắm)
  LINE_MS:1600,              // mỗi câu hiện chừng này mili giây
  SUKIEN_N:12,               // số mục đầu của TALKS là “chuyện vừa xảy ra”
  NHO_GAN:5,                 // không kể lại một trong chừng này chuyện vừa kể với cùng người
};
let HT_EV_SAID = {};                                            // chuyện vừa xảy ra đã nói hôm nay (chỉ trong lúc chơi, không lưu)
const htSlot = h => h < 11 ? 'sang' : h < 13.5 ? 'trua' : h < 18 ? 'chieu' : 'toi';
const htRel = who => S.rel[who === 'mom' || who === 'dad' ? 'family' : who] ?? 50;
// Mức thân của người này với bạn lúc này
function htTier(who){
  const r = htRel(who);
  if (r < NPCREL.COLD) return 'lanh';
  const sore = memAll().some(m => m.w === who && m.o === 'me' && m.v < 0 && S.day - m.d <= HTC.LANH_NGAY);   // vừa có chuyện không vui
  if (sore && r < NPCREL.WARM) return 'lanh';
  return r >= NPCREL.WARM ? 'than' : 'thuong';
}
// Thay {goi} {toi} {ban} {ten} (viết hoa chữ đầu nếu tên biến viết hoa)
function htFill(s, who){
  const x = XUNG[who] || { goi:'bạn', toi:'tôi', ban:'bạn', ten:'bạn' };
  return s.replace(/\{(goi|Goi|toi|Toi|ban|Ban|ten|Ten)\}/g, (m, k) => { const v = x[k.toLowerCase()] || ''; return k[0] !== k[0].toLowerCase() ? v.charAt(0).toUpperCase() + v.slice(1) : v; });
}
// Ngữ cảnh: ai, ở đâu, mấy giờ, cuối tuần không, đang làm gì
function htCtx(W, a){
  const at = W.cityId || (W.street ? 'street' : W.song ? W.song.kind : 'home');
  return { who:a.who, at, h:(W.t / 60) % 24, weekend:songWeekend(), tier:htTier(a.who), act:a.ai ? a.ai.act : '', rel:htRel(a.who) };
}
function htMatch(e, c){
  if (e.who !== '*' && e.who !== c.who && !(Array.isArray(e.who) && e.who.includes(c.who))) return false;
  if (e.at && (Array.isArray(e.at) ? !e.at.includes(c.at) : e.at !== c.at)) return false;
  if (e.h && !(c.h >= e.h[0] && c.h < e.h[1])) return false;
  if (e.tier && e.tier !== c.tier) return false;
  if (e.weekend !== undefined && e.weekend !== c.weekend) return false;
  return !e.when || !!e.when(c);
}
// Chọn một chủ đề: rút thăm theo độ ưu tiên của nhóm, rồi lấy câu chưa nói gần đây trong nhóm đó
let HT_RECENT = {};                                             // vài chuyện vừa kể với mỗi người (chỉ trong lúc chơi, không lưu)
function htTopic(c){
  // cùng dùng các câu tán gẫu sẵn có theo tính cách (phần sau của TALKS) như một chủ đề cuộc sống
  const old = TALKS.slice(HTC.SUKIEN_N).filter(t => t.who === c.who && t.when()).map(t => t.ht || (t.ht = { g:'cuocsong', say:typeof t.say === 'function' ? t.say() : t.say }));
  const all = HT.filter(e => htMatch(e, c)).concat(old); if (!all.length) return null;
  const recent = HT_RECENT[c.who] || (HT_RECENT[c.who] = []), fresh = all.filter(e => !recent.includes(e)), ok = fresh.length ? fresh : all;   // chưa kể lại chuyện vừa kể
  const groups = [...new Set(ok.map(e => e.g))], w = g => (c.at === 'home' && HTC.NHOM_NHA[g]) || HTC.NHOM[g] || 1;
  let r = Math.random() * groups.reduce((n, g) => n + w(g), 0), g = groups[0];
  for (const x of groups) { r -= w(x); if (r <= 0) { g = x; break; } }
  const e = pickLine(ok.filter(x => x.g === g), 'ht' + c.who + g);
  if (e) { recent.push(e); if (recent.length > HTC.NHO_GAN) recent.shift(); }
  return e && { g, say:e.say };
}
// Ghép cả cuộc nói chuyện: [['npc' | 'me', câu], …], kèm nét mặt
function htConversation(W, a){
  const who = a.who, c = htCtx(W, a), kieu = HT_KIEU[who] || 'ban', slot = htSlot(c.h);
  const mo = HT_MO[kieu][slot] || HT_MO[kieu].sang, dap = (HT_DAP[who] || {})[c.tier] || ['Ừ.'];
  const lines = [['me', htFill(pickLine(mo, 'htmo' + who), who)], ['npc', pickLine(dap, 'htdap' + who + c.tier)]];
  let expr = c.tier === 'than' ? 'happy' : c.tier === 'lanh' ? 'neutral' : null, kind = 'chude';
  const mem = HTC.KYUC && typeof memRecall === 'function' ? memRecall(who, 'talk') : null;
  if (mem) {                                                   // chuyện cũ
    const pos = !mem.m || mem.m.v > 0;
    lines.push(['npc', mem.text], ['me', htFill(pickLine(HT_KYUC_DAP[pos ? 'pos' : 'neg'], 'htkd' + who), who)]);
    expr = mem.expr; kind = 'kyuc';
  } else {
    const said = HT_EV_SAID[S.day] || (HT_EV_SAID = { [S.day]:new Set() })[S.day];
    const ev = TALKS.slice(0, HTC.SUKIEN_N).filter(t => t.who === who && !said.has(t) && t.when());
    if (ev.length && Math.random() < HTC.SUKIEN) {              // chuyện vừa xảy ra (mỗi chuyện chỉ nói một lần mỗi ngày)
      const t = ev[0], say = typeof t.say === 'function' ? t.say() : t.say; said.add(t);
      say.forEach((s, i) => lines.push([i % 2 ? 'me' : 'npc', s])); kind = 'sukien';
    } else {
      const tp = htTopic(c);
      if (tp) { tp.say.forEach((s, i) => lines.push([i % 2 ? 'me' : 'npc', htFill(s, who)])); kind = tp.g; }
      else { const t = pickTalk(who); if (t) t.lines.forEach((s, i) => lines.push([i % 2 ? 'me' : 'npc', s])); }
    }
  }
  return { lines, expr, kind, tier:c.tier };
}
// Diễn cuộc nói chuyện trên sân khấu
async function htTalk(W, api, a){
  const conv = htConversation(W, a); W.lastConv = conv;
  if (conv.expr) npcFeel(a, conv.expr, conv.lines.length * HTC.LINE_MS + 1500);
  for (const [w, t] of conv.lines) {
    const s = w === 'me' ? api.me : a; api.say(s, t, HTC.LINE_MS); if (s === a) api.C.react(a, conv.tier === 'lanh' ? 'nod' : 'hop');
    SFX.play('talk'); if (!await api.wait(api.C.still ? 0 : HTC.LINE_MS - 100)) return;
  }
  if (conv.tier === 'than' && Math.random() < personaOf(a.who).humor) { api.C.react(a, 'laugh'); api.C.react(api.me, 'laugh'); }
  chatBond(a.who); updateHUD();
}
// Câu đáp khi bạn chỉ “Chào”: người quen đáp theo mức thân, khách lạ đáp theo nơi
function htGreetReply(W, a){
  if (!HTC.ON) return null;
  if (a.crowd) { const at = W.cityId || (W.street ? 'street' : ''); return HT_KHACH[at] ? pick(HT_KHACH[at]) : null; }
  const d = HT_DAP[a.who]; return d ? pick(d[htTier(a.who)]) : null;
}
// Khách lạ nói chuyện với nhau: câu theo nơi và buổi (thay cho bộ câu chung trước đây)
function xgNoiList(at, h){
  const P = XG_NOI[at] || XG_NOI.street, s = htSlot(h);
  return (P[s] || []).concat(P.all || []);
}

/* ----- Ở nhà: thêm “Bắt chuyện” với bố mẹ, Tùng (trước đây chỉ chào được) ----- */
(() => {
  const HP = ROAM_PLACES.find(p => p.id === 'home'); if (!HP) return;
  const base = HP.npcEntries;
  HP.npcEntries = (ref, sc, who) => {
    const list = base(ref, sc, who), a = WORLD && WORLD.npcs.find(n => n.who === who && !n.gone);
    if (HTC.ON && XUNG[who] && a && !(a.home && a.home.lie)) list.splice(list.findIndex(e => e.greet), 0, { icon:'💬', label:'Bắt chuyện', talk:true });
    return list;
  };
  HP.talk = (a, api) => htTalk(WORLD, api, a);
})();
