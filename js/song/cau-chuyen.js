/* =========================================================
   v17.5 – PHASE 4: CHUYỆN TỰ NẢY SINH (số liệu, câu chữ ở du-lieu/cau-chuyen.js)
   Mỗi chuyện là một mục trong CC_STORIES: bat() xem đã đủ điều kiện bắt đầu chưa (đọc trí nhớ, quan hệ…),
   buoc(st, slot) cho chuyện đi tiếp ở đầu mỗi buổi. Trạng thái lưu ngắn gọn trong S.cc (bản lưu cũ chưa có thì tự tạo).
   Chạy cùng nhịp xếp lịch buổi sẵn có (buildSlot) và nhịp nghĩ của văn phòng (sự kiện thế giới), không thêm vòng lặp.
   ========================================================= */
const ccAll = () => S.cc || (S.cc = { on:{}, last:{} });
const ccOn = () => typeof CC !== 'undefined' && CC.ON && !!S;
const ccEnd = (id) => { const c = ccAll(); delete c.on[id]; c.last[id] = S.day; };

/* ----- Linh rủ đi thư viện ----- */
// Lần gần đây bạn gặp, nói chuyện vui với Linh (Linh nhớ chuyện tốt, hoặc vừa bắt chuyện với Linh)
function ccLinhLy(){
  const L = CC.LINH, m = memAll().filter(x => x.w === 'linh' && x.o === 'me' && x.v > 0 && S.day - x.d <= L.NHO).sort((a, b) => b.d - a.d)[0];
  if (m) return m.k === 'hangout' ? 'hangout' : '*';
  const g = S.flags.ccLinhGap; return g && S.day - g <= L.NHO ? 'ht' : null;
}
// Ngày hẹn: đi làm thì hẹn ngày nghỉ gần nhất, chưa đi làm thì ngày mai
function ccLinhNgay(){
  for (let d = S.day + 1; d <= S.day + CC.LINH.XA; d++) if (!S.job || isDayOff(d)) return d;
  return 0;
}
const ccNgayTen = d => d === S.day + 1 ? 'Mai' : dayInfo(d).dow;
function ccLinhNhan(ok){
  const st = ccAll().on.linh; if (!st) return;
  if (ok) { st.b = 'hen'; rel('linh', CC.LINH.NHAN); } else ccEnd('linh');
}
function ccLinhXong(){ const st = ccAll().on.linh; if (st) { memAdd({ w:'linh', o:'me', k:'cc_thuvien', v:1 }); S.flags.ccLinhHoc = S.day; ccEnd('linh'); } }
const ccLinhDaHoc = () => S.flags.ccLinhHoc && S.day > S.flags.ccLinhHoc && S.day - S.flags.ccLinhHoc <= MEM.KEEP;
// Tin nhắn mời (cần trả lời; lờ đi thì Linh thôi)
MSGS.cc_linh_tv = { th:'linh', ctx:[], msgs:[['linh', '']], why:'Linh nhớ lần gặp vui gần đây và đủ thân',
  replies:[ { t:CC_LOI.linh.nhan[0], fx:() => ccLinhNhan(true), resp:() => CC_LOI.linh.dap_nhan(ccNgayTen((ccAll().on.linh || {}).d || S.day + 1).toLowerCase()) },
            { t:CC_LOI.linh.tu_choi[0], fx:() => ccLinhNhan(false), resp:CC_LOI.linh.dap_tu_choi } ],
  ignore:{ fx:() => { rel('linh', CC.LINH.LO_TIN); ccEnd('linh'); }, resp:CC_LOI.linh.lo_tin } };

const CC_STORIES = {
  linh:{
    bat(){
      const L = CC.LINH, c = ccAll();
      if (S.day - (c.last.linh ?? -99) < L.CD || S.rel.linh < L.REL || !ccLinhLy()) return null;
      return { b:'cho', d:S.day + L.CHO[0] + Math.floor(Math.random() * (L.CHO[1] - L.CHO[0] + 1)), ly:ccLinhLy() };
    },
    buoc(st, slot){
      const T = CC_LOI.linh;
      if (st.b === 'cho' && S.day >= st.d && (slot === 'afternoon' || slot === 'evening') && !S.fast) {
        const p = ph(); if (p.pending.linh) return;
        const d = ccLinhNgay(); if (!d) return ccEnd('linh');
        st.b = 'moi'; st.d = d;
        pushMsg('linh', 'linh', T.ly[st.ly] || T.ly['*']); pushMsg('linh', 'linh', T.moi(ccNgayTen(d)));
        addUnread('linh', 2); p.pending.linh = { id:'cc_linh_tv', deadline:(S.tick || 0) + 2 };
      }
      if (st.b === 'moi' && !ph().pending.linh && ccAll().on.linh === st) ccEnd('linh');       // tin mời đã hết hạn mà không ai xử lý
      if (st.b !== 'hen') return;
      if (S.day === st.d && slot === 'afternoon') {
        if (S.fast) return ccEnd('linh');                                   // tua nhanh: bỏ qua, không trách
        if (roamOn()) { S.meet = { d:S.day, slot:'afternoon', who:'linh', at:'in:lib', sc:'cc_hoc' }; note(T.hen_note); }
        else { const i = S.queue.findIndex(r => r.id === 'activity'); S.queue.splice(i < 0 ? S.queue.length : i, 0, { id:'cc_hoc', arg:'linh' }); }
        st.b = 'cho_gap'; return;
      }
      if (S.day > st.d) ccEnd('linh');
    },
  },
  lanh:{
    bat(){
      const m = memAll().find(x => x.k === 'argue' && x.v < 0 && x.d < S.day && S.day - x.d <= 1 && CC_LOI.lanh.viec[x.w] && CC_LOI.lanh.viec[x.o]); if (!m) return null;
      npcBond(m.w, m.o, -CC.LANH.GIAM);
      return { a:m.w, o:m.o, d:m.d, b:'gian' };
    },
    buoc(st){ if (S.day - st.d > CC.LANH.HET) { npcBond(st.a, st.o, Math.ceil(CC.LANH.LEN / 2)); ccEnd('lanh'); } },     // lâu không gặp thì tự nguôi
  },
};
// Hẹn Linh mà không đến (gọi ở đầu buổi tối của ngày hẹn hoặc hôm sau)
function ccLinhLo(st){
  pushMsg('linh', 'linh', CC_LOI.linh.lo_hen); addUnread('linh', 1, true);
  rel('linh', CC.LINH.LO); memAdd({ w:'linh', o:'me', k:'cc_thuvien', v:-1 }); clampAll(); ccEnd('linh');
}
// Đầu mỗi buổi: chuyện đang diễn ra đi tiếp, rồi xem có chuyện mới bắt đầu không
function ccSlot(slot){
  if (!ccOn()) return;
  const c = ccAll();
  const lt = c.on.linh; if (lt && lt.b === 'cho_gap' && (S.day > lt.d || slot === 'evening' || slot === 'night')) ccLinhLo(lt);
  for (const [id, X] of Object.entries(CC_STORIES)) { const st = c.on[id]; if (st) X.buoc(st, slot); }
  if (slot !== 'morning') return;
  for (const [id, X] of Object.entries(CC_STORIES)) { if (c.on[id]) continue; const st = X.bat(); if (st) c.on[id] = st; }
}
// Hai đồng nghiệp này còn đang giận nhau không (gọi với một người: người này có đang giận ai không)
function ccGian(x, y){
  if (!ccOn()) return false;
  const st = ccAll().on.lanh; if (!st || st.b !== 'gian') return false;
  return y === undefined ? st.a === x || st.o === x : (st.a === x && st.o === y) || (st.a === y && st.o === x);
}
// Việc chung ở chỗ họp: hai người đang giận được gọi ra cùng làm, nói chuyện lại với nhau, làm lành
WORLD_EV.push({ id:'lamlanh', where:'office', h:[9.5, 16.5], p:1, when:() => { const st = ccOn() && ccAll().on.lanh; return !!st && st.b === 'gian' && S.day - st.d >= CC.LANH.GIAN && Math.random() < CC.LANH.P; },
  run:async (W, api) => {
    const st = ccAll().on.lanh, a = st && officeNpc(W, st.a), b = st && officeNpc(W, st.o); if (!a || !b) return false;
    const T = CC_LOI.lanh, boss = officeNpc(W, 'boss');
    st.b = 'lam';                                                             // từ đây không còn tránh nhau
    if (boss && songInView(W, boss.x) && !api.C.still) api.say(boss, T.goi(T.viec[st.a], T.viec[st.o].toLowerCase()), 1800);
    const B = { spot:'meet', act:'act-talk', sign:'📋', dur:[30, 40] };
    await Promise.all([songForceBeat(W, api, a, B), songForceBeat(W, api, b, B)]);
    if (!api.alive() || a.gone || b.gone) { st.b = 'gian'; return true; }
    a.ai.held = b.ai.held = true;
    const ok = await songTalk(W, api, a, b, pickLine(T.noi, 'cclanh', songRng('ll' + W.t)));
    a.ai.held = b.ai.held = false; if (!ok && !api.alive()) { st.b = 'gian'; return true; }
    songSign(a, '🤝'); songSign(b, '🤝'); npcFeel(a, 'happy', 20000); npcFeel(b, 'happy', 20000);
    npcBond(st.a, st.o, CC.LANH.LEN, 1);
    const L = memAll(); for (let i = L.length - 1; i >= 0; i--) if (L[i].k === 'argue' && ((L[i].w === st.a && L[i].o === st.o) || (L[i].w === st.o && L[i].o === st.a))) L.splice(i, 1);
    memAdd({ w:st.a, o:st.o, k:'lamlanh', v:1 }); ccEnd('lanh'); save();
    return true; } });

/* ----- Nối vào các hệ thống sẵn có ----- */
(() => {
  const slot = buildSlot;                                                     // đầu mỗi buổi
  buildSlot = function(){ slot(); ccSlot(S.slot); };
  const bond = chatBond;                                                      // vừa bắt chuyện với Linh: Linh nhớ là gặp vui
  chatBond = function(who){ if (who === 'linh') S.flags.ccLinhGap = S.day; return bond(who); };
  const spot = songSpot;                                                      // đang giận: không sang bàn nhau
  songSpot = function(W, a, key){ const p = spot(W, a, key); if (p && key === 'visit' && a.ai.with && ccGian(a.who, a.ai.with.who)) { a.ai.with = null; return null; } return p; };
  const memLine = memNpcLine;                                                 // đang giận: không chào hỏi, chưa nhắc chuyện cũ
  memNpcLine = function(a, b){ return ccGian(a, b) ? null : memLine(a, b); };
})();
