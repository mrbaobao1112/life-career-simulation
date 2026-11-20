/* =========================================================
   v17.5 – PHASE 2: QUÁN CÓ ĐỜI SỐNG THẬT – NHÂN VIÊN PHỤC VỤ VÀ NGƯỜI CHƠI THAM GIA
   Nhân viên (chị pha chế, cô bán cơm, bác trà đá, thu ngân, thủ thư) có việc theo khách:
     - khách đến quầy gọi đồ → nhân viên quay sang, nhận lời, pha chế, đưa đồ; khách cầm đồ về chỗ ngồi
     - khách trả tiền → nhân viên báo giá, cảm ơn
     - trà đá: bác mang cốc trà ra tận ghế
     - khách về → nhân viên ra dọn bàn (cà phê)
     - lúc rảnh: lau quầy, nghỉ ngắn, xếp sách…
   Người chơi: gọi đồ ở quầy (nhân viên làm thật cho mình), ngồi cùng bàn nói chuyện với khách, mời Linh/Tùng một cốc.
   Mỗi nơi khai báo trong PV_PLACE; nơi chưa khai báo thì nhân viên giữ như cũ. Chạy theo nhịp của dân số (popFrame), không thêm vòng lặp.
   ========================================================= */
const PV = {
  ON:true,                   // tắt (false) thì nhân viên đứng yên như trước
  PHA:[2, 4],                // pha chế / xới cơm mất chừng này phút game
  DON:[2, 3],                // dọn một bàn mất chừng này phút game
  NHAN_ROI:[25, 50],         // rảnh thì cứ chừng này phút game lại lau quầy hoặc nghỉ ngắn
  NGOI_MIN:15,               // ngồi cùng bàn nói chuyện với khách: mất chừng này phút
  NGOI_MOOD:1,               // tinh thần +1 (nói chuyện với người lạ vui vui)
  NGOI_MAX:2,                // mỗi ngày tối đa chừng này lần được tính tinh thần (vẫn ngồi được, chỉ không cộng nữa)
  MOI_REL:3,                 // mời người quen một cốc: thân hơn chừng này, mỗi người mỗi ngày một lần
  NANG:-20,                  // đứng sau quầy thì nâng người lên chừng này (như đứng trên bục), để thấy được từ vai trở lên
};
// Từng nơi: nhân viên là ai, đứng đâu (sau quầy), máy pha ở đâu, mặt trước quầy (che nửa người), các câu nói, phục vụ những gì
const PV_PLACE = {
  'in:cafe':{ label:'Chị pha chế', home:{ x:150, y:140 }, may:{ x:104, y:140 }, front:() => PFURN.counter(80, 90), frontY:153, side:{ x:182, y:152 },
    order:'counter', pay:'counter', clean:true, prop:'cup', gia:'35 nghìn', moi:() => PHOK.TAKEAWAY, moiWho:['linh'],
    noi:{ goi:['Cho em một cà phê trứng.', 'Một bạc xỉu ít đá ạ.', 'Cho chị một cốc nâu nóng.', 'Một trà đào nhé em.'], nhan:['Có ngay ạ!', 'Chờ em chút nhé.', 'Dạ, ngồi đi ạ, em mang ra.'],
         dua:['Của mình đây ạ.', 'Cà phê nóng đây ạ.'], cam:['Cảm ơn em.', 'Thơm quá!'], tra:['Của mình 35 nghìn ạ.', 'Em cảm ơn, hẹn gặp lại ạ!'], ranh:['🧽', '📱'] } },
  'in:com':{ label:'Cô bán cơm', home:{ x:150, y:140 }, may:{ x:110, y:140 }, front:() => PFURN.glassCase(90, 110), frontY:153,
    order:'counter', prop:null,
    noi:{ goi:['Cô ơi, cho cháu suất sườn.', 'Một suất trứng cô ơi.', 'Cho cháu cơm thêm trứng.'], nhan:['Có ngay cháu!', 'Ngồi đi, cô mang ra.'], dua:['Đây cháu, thêm canh nhé.', 'Ăn ngon nhé cháu.'], cam:['Cháu cảm ơn cô.'], ranh:['🧽'] } },
  'in:trada':{ label:'Bác bán trà đá', home:{ x:112, y:150 }, may:{ x:122, y:150 }, bring:true, prop:'cup', moi:() => 10000, moiWho:['tung'],
    noi:{ nhan:['Có ngay!'], dua:['Trà đây cháu.', 'Uống đi cho mát.'], cam:['Cháu cảm ơn bác.'], ranh:['🧽'] } },
  'in:mall':{ label:'Thu ngân', home:{ x:540, y:140 }, front:() => PFURN.counter(500, 80, '#9D4EDD'), frontY:153, pay:'cashier',
    noi:{ tra:['Của anh chị đây ạ.', 'Cảm ơn quý khách!', 'Quẹt thẻ hay tiền mặt ạ?'], ranh:['🧾'] } },
  'in:lib':{ label:'Cô thủ thư', home:{ x:440, y:152 }, sach:{ x:410, y:170 },
    noi:{ ranh:['📚', '📖'] } },
};
const pvSay = (W, api, a, list) => { if (list && list.length && songInView(W, a.x) && !api.C.still) api.say(a, pick(list), 1500); };
async function pvUntil(W, api, t){ while (W.t < t) if (!await api.wait(250)) return false; return api.alive(); }
// Đi trong khu sau quầy (không tìm đường, chỉ đi ngang)
const pvLift = (a, y) => { a.dy = y < ROAM.Y0 ? PV.NANG : 0; };
async function pvBehind(W, api, a, x, y){ a.s = roamScale(y); pvLift(a, y); if (!await api.C.walk(a, x, y)) return false; a.el.dataset.y = y; api.depthSort(); return api.alive(); }

/* ----- Gắn vào nơi: tìm nhân viên, đặt sau quầy, dựng mặt trước quầy để che nửa người ----- */
function pvMount(W, api, id){
  const cfg = PV_PLACE[id]; if (!PV.ON || !cfg) return;
  const s = W.npcs.find(n => n.label === cfg.label); if (!s) return;
  W.pv = { cfg, s, q:[], clean:[], busy:false, next:W.t + 10 };
  s.staff = true; s.speed = 48;
  if (cfg.front) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'actor pv-front'); g.style.pointerEvents = 'none';
    g.dataset.y = cfg.frontY; g.innerHTML = cfg.front(); api.C.layer('world').appendChild(g);
  }
  pvLift(s, cfg.home.y); api.put(s, cfg.home.x, cfg.home.y); api.C.face(s, true); api.C.act(s, ''); api.depthSort();
  // người quen ở đây (Linh, Tùng): thêm “Mời một cốc”
  (W.city || []).concat(W.npcs.filter(n => /^meet_/.test(n.id))).forEach(a => {
    if (!cfg.moi || !(cfg.moiWho || []).includes(a.who)) return;
    const base = a.entries; a.entries = (ref, sc) => (base ? base(ref, sc) : []).concat(pvInviteEntry(W, a));
  });
}
// Khách đến chỗ cần phục vụ (gọi popStep sau khi tới nơi): trả về true nếu khách phải chờ nhân viên
function pvArrive(W, api, a, st){
  const P = W.pv; if (!P || !PV.ON) return false;
  const spot = st[0] === 'maybe' ? st[2] : st[1], sign = st[st[0] === 'maybe' ? 5 : 4];
  let kind = null;
  if (st[0] === 'seat' && P.cfg.bring) kind = 'bring';
  else if (spot && spot === P.cfg.pay && /💸|🛍️/.test(sign || '')) kind = 'pay';
  else if (spot && spot === P.cfg.order) kind = 'order';
  if (!kind) return false;
  a.vis.until = Infinity; a.vis.pv = kind; P.q.push({ kind, a, v:a.vis });
  if (kind === 'order') { pvSay(W, api, a, P.cfg.noi.goi); songSign(a, '⏳'); }
  return true;
}
// Khách rời chỗ ngồi: thêm việc dọn bàn
function pvLeft(W, seat){ const P = W.pv; if (P && P.cfg.clean && seat) P.clean.push({ x:seat.x, y:seat.y }); }
// Người chơi gọi đồ ở quầy: nhân viên làm cho mình
function pvPlayerOrder(W){ const P = W && W.pv; if (P && P.cfg.order) P.q.push({ kind:'order', me:true }); }
// Mỗi nhịp dân số: nhân viên làm việc tiếp theo
function pvTick(W, api){
  const P = W.pv; if (!P || P.busy || !api.alive()) return;
  P.q = P.q.filter(j => j.me || (j.a.vis === j.v));                 // khách đã đi thì thôi
  const job = P.q.shift(); if (job) { P.busy = true; pvDo(W, api, job).finally(() => { P.busy = false; }); return; }
  const c = P.clean.shift(); if (c) { P.busy = true; pvClean(W, api, c).finally(() => { P.busy = false; }); return; }
  if (W.t >= P.next) { P.busy = true; pvIdle(W, api).finally(() => { P.busy = false; P.next = W.t + PV.NHAN_ROI[0] + Math.random() * (PV.NHAN_ROI[1] - PV.NHAN_ROI[0]); }); }
}
async function pvDo(W, api, j){
  const P = W.pv, s = P.s, C = api.C, who = j.me ? W.me : j.a, r = () => Math.random();
  const done = () => { if (!j.me && j.v && j.a.vis === j.v) { j.v.until = W.t + .5; j.v.pv = null; songSign(j.a, ''); } };
  C.face(s, who.x < s.x); songSign(s, '');
  if (j.kind === 'pay') { pvSay(W, api, s, P.cfg.noi.tra); C.act(s, 'act-talk'); C.react(s, 'nod'); if (!await api.wait(C.still ? 0 : 1500)) return; C.act(s, ''); return done(); }
  if (j.kind === 'bring') {                                          // trà đá: rót rồi mang ra tận ghế
    pvSay(W, api, s, P.cfg.noi.nhan); C.act(s, 'act-cook'); if (!await pvUntil(W, api, W.t + 1)) return;
    C.hold(s, P.cfg.prop); if (j.a.vis !== j.v) { C.hold(s); C.act(s, ''); return; }
    const sp = { x:j.a.x + (j.a.x > s.x ? -24 : 24), y:Math.min(ROAM.Y1, j.a.y + 6) };
    if (!await songWalk(W, api, s, sp)) return;
    C.face(s, j.a.x < s.x); pvSay(W, api, s, P.cfg.noi.dua); C.hold(s); if (j.a.vis === j.v) C.hold(j.a, P.cfg.prop);
    if (!await api.wait(C.still ? 0 : 900)) return; done();
    if (!await songWalk(W, api, s, P.cfg.home)) return; C.face(s, false); C.act(s, ''); return;
  }
  // gọi đồ: nhận lời, pha chế ở máy, mang lại đưa cho khách (hoặc cho bạn)
  pvSay(W, api, s, P.cfg.noi.nhan); C.react(s, 'nod'); songSign(s, '☕');
  const move = (x, y) => P.cfg.front ? pvBehind(W, api, s, x, y) : songWalk(W, api, s, { x, y });
  if (P.cfg.may && !await move(P.cfg.may.x, P.cfg.may.y)) return;
  C.face(s, true); C.act(s, 'act-cook');
  if (!await pvUntil(W, api, W.t + PV.PHA[0] + r() * (PV.PHA[1] - PV.PHA[0]))) return;
  C.act(s, ''); if (P.cfg.prop) C.hold(s, P.cfg.prop);
  const tx = Math.max(P.cfg.home.x - 40, Math.min(P.cfg.home.x + 10, who.x));
  if (!await move(tx, P.cfg.home.y)) return;
  C.face(s, who.x < s.x); pvSay(W, api, s, P.cfg.noi.dua); songSign(s, '');
  C.hold(s); if (P.cfg.prop) C.hold(who, P.cfg.prop);
  if (!j.me && j.a.vis === j.v) { pvSay(W, api, j.a, P.cfg.noi.cam); C.react(j.a, 'nod'); }
  if (j.me) { C.react(W.me, 'hop'); api.C.later(() => { if (W.me.holding) C.hold(W.me); }, 20000); }
  if (!await api.wait(C.still ? 0 : 700)) return; done();
  if (!await move(P.cfg.home.x, P.cfg.home.y)) return;
}
async function pvClean(W, api, c){
  const P = W.pv, s = P.s, C = api.C;
  if (P.cfg.side && !await pvBehind(W, api, s, P.cfg.side.x, P.cfg.side.y)) return;        // vòng ra khỏi quầy
  pvLift(s, ROAM.Y0); if (!await songWalk(W, api, s, { x:c.x + 20, y:Math.min(ROAM.Y1, c.y + 6) })) return;
  C.face(s, true); C.act(s, 'act-sweep'); songSign(s, '🧽');
  if (!await pvUntil(W, api, W.t + PV.DON[0] + Math.random() * (PV.DON[1] - PV.DON[0]))) return;
  C.act(s, ''); songSign(s, '');
  if (P.cfg.side) { if (!await songWalk(W, api, s, P.cfg.side)) return; if (!await pvBehind(W, api, s, P.cfg.home.x, P.cfg.home.y)) return; }
  else if (!await songWalk(W, api, s, P.cfg.home)) return;
  C.face(s, true);
}
async function pvIdle(W, api){
  const P = W.pv, s = P.s, C = api.C, k = pick(P.cfg.noi.ranh || ['🧽']);
  if (k === '📚' && P.cfg.sach) {                                    // thủ thư đi xếp sách
    songSign(s, '📚'); if (!await songWalk(W, api, s, P.cfg.sach)) return; C.act(s, 'act-read'); if (!await pvUntil(W, api, W.t + 6)) return;
    songSign(s, ''); if (!await songWalk(W, api, s, P.cfg.home)) return; C.face(s, true); C.act(s, 'act-read'); return;
  }
  const act = { '🧽':'act-sweep', '📱':'act-phone', '🧾':'act-read', '📖':'act-read' }[k] || '';
  C.act(s, act); songSign(s, k); if (!await pvUntil(W, api, W.t + 3 + Math.random() * 3)) return;
  C.act(s, P.cfg.label === 'Cô thủ thư' ? 'act-read' : ''); songSign(s, '');
}

/* ----- Người chơi tham gia ----- */
// Ngồi cùng bàn với một khách đang ngồi, nói chuyện vài câu (mất thời gian, vui hơn chút)
function pvVisitorEntries(a){
  return () => {
    const out = [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
    const v = a.vis; if (!PV.ON || !v || v.seat < 0 || v.pv) return out;
    out.unshift({ icon:'🪑', label:`Ngồi cùng bàn, nói chuyện (${PV.NGOI_MIN} phút)`, run:(W, api) => pvSitWith(W, api, a) });
    return out;
  };
}
async function pvSitWith(W, api, a){
  const C = api.C, me = W.me, at = W.cityId, P = W.pop, seat = P && a.vis && P.cfg.seats[a.vis.seat]; if (!seat) return;
  W.busy = true; api.showPrompt();
  const sp = { x:seat.x + (seat.x > 240 ? -28 : 28), y:Math.min(ROAM.Y1, seat.y + 4) }, path = roamPath(W.H, { x:me.x, y:me.y }, sp) || [sp];
  for (const q of path) { me.s = roamScale(q.y); if (!await C.walk(me, q.x, q.y)) return; }
  C.face(me, a.x < me.x); C.face(a, me.x < a.x); C.act(me, 'act-sit act-sip');
  const r = Math.random, buddy = a.vis && a.vis.buddy && a.vis.buddy.vis ? a.vis.buddy : null;
  const lines = [[a, pick(HT_KHACH[at] || HT_KHACH.street)], [me, pick(['Ừ, đúng thế.', 'Thật à?', 'Hay nhỉ.', 'Tôi cũng nghĩ vậy.'])]];
  const noi = pickLine(xgNoiList(at, W.t / 60), 'pvngoi' + at); if (noi) noi.forEach((t, i) => lines.push([i % 2 && buddy ? buddy : i % 2 ? me : a, t]));
  for (const [w, t] of lines) { C.say(w, t, 1500); if (w !== me) C.react(w, 'nod'); if (!await C.wait(C.still ? 0 : 1450)) return; }
  const f = S.flags.pvNgoi && S.flags.pvNgoi.d === S.day ? S.flags.pvNgoi : (S.flags.pvNgoi = { d:S.day, n:0 });
  await api.spin(Math.min(W.end - 1, W.t + PV.NGOI_MIN), 900); if (!api.alive()) return;
  if (f.n < PV.NGOI_MAX) { f.n++; S.mood += PV.NGOI_MOOD; clampAll(); }
  ROAM_NOW = W.t / 60; feedAdd({ id:'pho' }, '🪑', `Ngồi nói chuyện với khách ở ${PHO_ROOMS[at] ? PHO_ROOMS[at].name : 'quán'}.`, 0); ROAM_NOW = null;
  C.act(me, ''); updateHUD(); save(); W.busy = false; api.showPrompt();
}
// Mời người quen (Linh ở cà phê, Tùng ở trà đá) một cốc
function pvInviteEntry(W, a){
  const cfg = W.pv && W.pv.cfg; if (!cfg || !cfg.moi) return [];
  const cost = cfg.moi(), name = (XUNG[a.who] || {}).ten || 'bạn', done = (S.flags.pvMoi || {})[a.who] === S.day;
  return [{ icon:'☕', label:`Mời ${name.replace(/^(anh|chị) /, '')} một cốc`, cost, off:done || S.money < cost, why:done ? 'Hôm nay mời rồi' : 'Không đủ tiền', run:(W2, api) => pvInvite(W2, api, a, cost) }];
}
async function pvInvite(W, api, a, cost){
  const C = api.C; W.busy = true; api.showPrompt();
  S.money -= cost; spendLog(cost); (S.flags.pvMoi = S.flags.pvMoi || {})[a.who] = S.day;
  const k = a.who === 'family' ? 'family' : a.who; if (S.rel[k] !== undefined) S.rel[k] = clamp(S.rel[k] + PV.MOI_REL);
  if (typeof memAdd === 'function') memAdd({ w:a.who, o:'me', k:'moi_nuoc', v:1 });
  ROAM_NOW = W.t / 60; feedAdd({ id:'pho' }, '☕', `Mời ${(XUNG[a.who] || {}).ten || ''} một cốc.`, -cost); ROAM_NOW = null; updateHUD(); save();
  C.face(W.me, a.x < W.me.x); C.say(W.me, a.who === 'tung' ? 'Bác ơi, cho Tùng thêm cốc nữa, cháu trả!' : 'Để tao mời cốc này!', 1500);
  if (!await C.wait(C.still ? 0 : 1400)) return;
  npcFeel(a, 'happy', 4000); C.react(a, 'hop'); C.say(a, pick(a.who === 'tung' ? ['Ơ, mày hôm nay hào phóng thế!', 'Thế thì tao không khách sáo!'] : ['Ơ, cảm ơn mày nhé!', 'Lần sau tao mời lại.']), 1600);
  if (W.pv && W.pv.cfg.bring) W.pv.q.push({ kind:'bring', a, v:a.vis });           // bác trà đá mang cốc ra
  else if (W.pv && W.pv.cfg.prop) C.hold(a, W.pv.cfg.prop);
  if (!await C.wait(C.still ? 0 : 1500)) return;
  W.busy = false; api.showPrompt();
}
