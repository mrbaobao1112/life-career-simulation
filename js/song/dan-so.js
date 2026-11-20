/* =========================================================
   THẾ GIỚI SỐNG – PHASE 3: DÂN SỐ THEO NƠI VÀ THEO GIỜ
   Mỗi địa điểm có mật độ khách riêng theo giờ (mảng 24 giá trị 0…1), cuối tuần đông hơn hoặc vắng hơn.
   Khách làm theo kịch bản của nơi đó: cà phê thì gọi đồ, ngồi, trả tiền, ra về; cơm bụi đông vào giờ ăn; bến xe chờ rồi lên xe…
   Hiệu năng: lúc vào cảnh tạo sẵn một nhóm nhỏ nhân vật (DS.POOL) và dùng lại liên tục, không tạo mới;
   chạy chung nhịp với vòng lặp thế giới; ngoài khung nhìn thì dịch chuyển thẳng (songWalk).
   ========================================================= */
const DS = {
  POOL:7,                    // số nhân vật dựng sẵn cho mỗi nơi (không bao giờ vượt quá)
  TICK:.5,                   // nghĩ 2 lần mỗi giây
  SPAWN:.12,                 // mỗi nhịp, nếu còn thiếu khách so với mật độ thì xác suất có người bước vào
  SPEED:56,
  QUEUE:[[0, 0], [-26, 0], [0, 16], [-26, 16], [-52, 0], [-52, 16]],   // chỗ đứng xếp hàng quanh quầy (lệch x, lệch y): không ai đứng chồng lên ai
};
const H24 = s => s.split(',').map(Number);   // mật độ 24 giờ, viết gọn
const DS_PLACE = {
  'in:cafe': { cap:5, we:1.3, hours:H24('0,0,0,0,0,0,0,.3,.6,.7,.6,.5,.5,.6,.7,.8,.8,.7,.6,.7,.8,.6,.3,0'), group:.35,
    spots:{ counter:{ x:140, y:172 } }, seats:[{ x:336, y:158, face:true }, { x:372, y:162 }, { x:206, y:162 }, { x:420, y:180, face:true }, { x:300, y:192 }], script:'cafe' },
  'in:trada': { cap:4, we:1.4, hours:H24('0,0,0,0,0,0,0,.2,.4,.5,.5,.4,.3,.4,.5,.6,.8,.9,.8,.7,.6,.4,.2,0'), group:.4,
    seats:[{ x:180, y:170 }, { x:214, y:176 }, { x:300, y:170, face:true }, { x:336, y:176, face:true }], script:'trada' },
  'in:bia': { cap:5, we:1.3, hours:H24('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.4,.7,1,1,.9,.7,.4,0'), group:.5,
    seats:[{ x:210, y:172 }, { x:250, y:176 }, { x:296, y:172, face:true }, { x:334, y:176, face:true }, { x:376, y:180, face:true }], script:'bia' },
  'in:com': { cap:4, we:.8, hours:H24('0,0,0,0,0,0,0,0,0,0,.2,.6,1,.8,.3,.1,.1,.4,.9,.6,.2,0,0,0'),
    spots:{ counter:{ x:150, y:170 } }, seats:[{ x:236, y:172 }, { x:276, y:176 }, { x:318, y:172, face:true }, { x:352, y:178, face:true }], script:'com' },
  'in:lib': { cap:4, we:1.2, hours:H24('0,0,0,0,0,0,0,0,.4,.7,.8,.6,.3,.5,.8,.8,.7,.5,.3,.2,.1,0,0,0'),
    spots:{ shelf:{ x:150, y:174 } }, seats:[{ x:120, y:184 }, { x:212, y:184 }, { x:384, y:178, face:true }, { x:300, y:192 }], script:'lib' },
  'in:mall': { cap:5, we:1.6, hours:H24('0,0,0,0,0,0,0,0,0,.3,.4,.5,.5,.5,.5,.6,.7,.8,.9,.9,.8,.5,0,0'),
    spots:{ browse:[{ x:120, y:182 }, { x:196, y:184 }, { x:300, y:182 }, { x:250, y:196 }], cashier:{ x:470, y:174 } }, seats:[], script:'mall' },
  'in:bus': { cap:4, we:1.4, hours:H24('0,0,0,0,0,.3,.6,.8,.6,.4,.4,.4,.4,.4,.5,.6,.7,.6,.4,.2,0,0,0,0'),
    spots:{ ticket:{ x:126, y:172 }, bus:{ x:360, y:170 } }, seats:[{ x:214, y:160 }, { x:244, y:162 }, { x:274, y:160 }, { x:230, y:186 }], script:'bus' },
  'in:lake': { cap:5, we:1.5, hours:H24('0,0,0,0,0,.6,1,.8,.4,.2,.2,.2,.1,.1,.2,.3,.5,.9,1,.7,.4,.2,0,0'),
    seats:[{ x:316, y:160 }, { x:350, y:160 }, { x:576, y:160 }, { x:610, y:160 }], script:'lake' },
};
// Kịch bản: [loại bước, chỗ, động tác, thời lượng (phút game), dấu hiệu]
const DS_SCRIPT = {
  cafe:[['go', 'counter', 'act-talk', [2, 4], '☕'], ['seat', null, 'act-sip', [20, 50], ''], ['go', 'counter', 'act-talk', [1, 2], '💸'], ['leave']],
  trada:[['seat', null, 'act-drink', [15, 40], '🧊'], ['leave']],
  bia:[['seat', null, 'act-drink', [25, 60], '🍺'], ['leave']],
  com:[['go', 'counter', 'act-talk', [2, 3], '🍛'], ['seat', null, 'act-eat', [12, 25], '🍜'], ['leave']],
  lib:[['go', 'shelf', 'act-read', [3, 8], '📚'], ['seat', null, 'act-read', [25, 60], '📖'], ['leave']],
  mall:[['go', 'browse', 'act-think', [3, 8], '👀'], ['go', 'browse', 'act-think', [3, 6], ''], ['maybe', .55, 'cashier', 'act-talk', [2, 3], '🛍️'], ['leave']],
  bus:[['go', 'ticket', 'act-talk', [2, 3], '🎫'], ['seat', null, 'act-phone', [10, 30], '🕒'], ['board']],
  lake:[['jog']], lakeSit:[['seat', null, '', [15, 35], '🌳'], ['leave']], lakeWalk:[['stroll']],
};
// Dáng người qua đường đa dạng (ghép từ tóc, màu da, áo có sẵn), cố định theo nơi và số thứ tự
const DS_HAIR = { nam:['hair_short', 'hair_spiky', 'hair_side'], nu:['hair_long', 'hair_bob', 'hair_bun', 'hair_pixie'] };
const DS_SKIN = ['#FFE6D5', '#FFD6BA', '#E8B48C', '#D9A07A'], DS_HC = ['#2B2321', '#3A2A22', '#4A3226', '#5A5A62', '#7A2E40'];
const DS_OUT = ['tee', 'polo', 'hoodie', 'cardigan', 'shirt'], DS_COL = ['#5B8DEF', '#E9A23B', '#6D8B74', '#F7A1A8', '#3B4252', '#E07A5F', '#81B29A', '#9D4EDD', '#FFFFFF'];
function dsLook(key){
  const r = songRng('look' + key), g = r() < .5 ? 'nam' : 'nu', pk = l => l[Math.floor(r() * l.length)];
  return { g, hair:pk(DS_HAIR[g]), hairColor:pk(DS_HC), skin:pk(DS_SKIN), outfit:{ kind:pk(DS_OUT), color:pk(DS_COL) } };
}
const dsWeekend = () => songWeekend();
function dsTarget(cfg, id, t){
  if (typeof isOpen === 'function' && id.startsWith('in:') && !isOpen(id, t)) return 0;
  const h = Math.floor((t / 60) % 24), d = cfg.hours[h] * (dsWeekend() ? cfg.we : 1);
  return Math.round(Math.min(1, d) * cfg.cap);
}

/* ----- Gắn vào một nơi ----- */
function popMount(W, api, id){
  const cfg = DS_PLACE[id]; if (!cfg) return;
  const P = W.pop = { id, cfg, acc:0, pool:[], seats:cfg.seats.map(() => null), exit:{ x:40, y:170 } };
  for (let k = 0; k < Math.min(DS.POOL, cfg.cap + 2); k++) {
    const a = api.npc('p', P.exit.x, P.exit.y, '', false, { id:`v${k}`, look:dsLook(id + k), speed:DS.SPEED, label:'Khách' });
    a.entries = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
    a.crowd = true; songHide(a, true); a.vis = null; P.pool.push(a);
  }
  // vào cảnh: một số khách đã ngồi sẵn giữa chừng (quán không trống trơn), nhóm tập dưỡng sinh ở hồ
  const n = Math.round(dsTarget(cfg, id, W.t) * .8), r = songRng('fill' + id + Math.round(W.t / 30));
  for (let k = 0; k < n; k++) popSpawn(W, api, r, true);
  if (id === 'in:lake') popExercise(W, api);
}
const popFree = P => P.pool.find(a => !a.vis && !a.fixed);
const popActive = P => P.pool.filter(a => a.vis).length;
// Một khách bước vào (hoặc đã ngồi sẵn khi vừa vào cảnh)
function popSpawn(W, api, r, seated, buddyOf){
  const P = W.pop, a = popFree(P); if (!a) return null;
  let script = P.cfg.script; if (script === 'lake') script = r() < .45 ? 'lake' : r() < .5 ? 'lakeSit' : 'lakeWalk';
  const steps = DS_SCRIPT[script];
  a.vis = { steps, i:0, until:0, busy:false, seat:-1, buddy:buddyOf || null };
  songAppear(api, a, P.exit.x, P.exit.y);
  if (seated) { const si = steps.findIndex(s => s[0] === 'seat'); if (si >= 0) { a.vis.i = si; popStep(W, api, a, r, true); return a; } }
  popStep(W, api, a, r);
  if (!buddyOf && !seated && P.cfg.group && r() < P.cfg.group) { const b = popSpawn(W, api, r, false, a); if (b) a.vis.buddy = b; }   // đi theo nhóm hai người
  return a;
}
function popSeat(P, a, near){
  const free = P.seats.map((s, i) => s ? -1 : i).filter(i => i >= 0); if (!free.length) return -1;
  let i = free[0]; if (near && near.vis && near.vis.seat >= 0) i = free.sort((x, y) => Math.abs(P.cfg.seats[x].x - P.cfg.seats[near.vis.seat].x) - Math.abs(P.cfg.seats[y].x - P.cfg.seats[near.vis.seat].x))[0];
  else i = free[Math.floor(Math.random() * free.length)];
  P.seats[i] = a; return i;
}
function popRelease(P, a){ if (a.vis && a.vis.seat >= 0) P.seats[a.vis.seat] = null; }
// Thực hiện bước hiện tại của khách
async function popStep(W, api, a, r, snap){
  const P = W.pop, v = a.vis, st = v.steps[v.i]; if (!st) return popGone(W, a);
  v.busy = true; const dur = d => W.t + d[0] + r() * (d[1] - d[0]);
  const go = async p => { if (snap) { a.s = roamScale(p.y); api.put(a, p.x, p.y); return true; } return songWalk(W, api, a, p); };
  if (st[0] === 'leave' || st[0] === 'board') {
    popRelease(P, a); v.seat = -1; v.spot = null;
    const p = st[0] === 'board' ? P.cfg.spots.bus : P.exit; if (!await go(p)) return; return popGone(W, a);
  }
  if (st[0] === 'maybe' && r() > st[1]) { v.i++; v.busy = false; v.until = 0; return; }
  if (st[0] === 'jog' || st[0] === 'stroll') {                             // hồ: chạy (hoặc đi dạo) hết đường rồi ra
    a.speed = st[0] === 'jog' ? 110 : 40; api.C.act(a, st[0] === 'jog' ? 'act-walk act-run' : 'act-walk'); songSign(a, st[0] === 'jog' ? '🏃' : '🚶');
    const y = 178 + Math.round(r() * 26); if (!await go({ x:W.H.W - 50, y })) return; if (!await go({ x:P.exit.x, y })) return; a.speed = DS.SPEED; return popGone(W, a);
  }
  let p;
  if (st[0] === 'seat') { const i = popSeat(P, a, v.buddy); if (i < 0) { v.i = v.steps.length - 1; v.busy = false; return; } v.seat = i; p = { ...P.cfg.seats[i] }; }
  else { const s = P.cfg.spots[st[st[0] === 'maybe' ? 2 : 1]]; p = Array.isArray(s) ? { ...s[Math.floor(r() * s.length)] } : { ...s }; p.x += Math.round(r() * 12 - 6);
    const taken = q => P.pool.some(b => b !== a && b.vis && b.vis.spot && Math.abs(b.vis.spot.x - q.x) < 20 && Math.abs(b.vis.spot.y - q.y) < 12);
    const slot = DS.QUEUE.map(([dx, dy]) => ({ ...p, x:p.x + dx, y:p.y + dy })).find(q => !taken(q));   // có người đứng đó rồi: xếp hàng phía sau (hai hàng)
    if (slot) p = slot; else { v.i = v.steps.length - 1; v.busy = false; return; }                     // quầy quá đông: thôi, ra về
  }
  v.spot = st[0] === 'seat' ? null : p;
  if (!await go(p)) return;
  const k = st[0] === 'maybe' ? 3 : 2;
  api.C.face(a, !!p.face); api.C.act(a, st[k]); songSign(a, st[k + 2]);
  v.until = dur(st[k + 1]);
  if (st[0] === 'seat' && v.buddy && v.buddy.vis && v.buddy.vis.seat >= 0 && songInView(W, a.x) && !api.C.still) {   // ngồi cùng bạn: nói chuyện
    const l = pickLine(typeof xgNoiList === 'function' ? xgNoiList(P.id, W.t / 60) : [['Ngon nhỉ.', 'Ừ.']], 'noi' + P.id, r);   // câu theo nơi và buổi songSign(a, '💬'); songSign(v.buddy, '💬'); npcFace(a, 'happy'); npcFace(v.buddy, 'happy');
    l.forEach((t, j) => api.C.later(() => api.say(j % 2 ? v.buddy : a, t, 1400), 600 + j * 1500));
  }
  v.i++; v.busy = false;
}
function popGone(W, a){ popRelease(W.pop, a); songHide(a, true); a.vis = null; a.speed = DS.SPEED; npcFace(a, 'neutral'); }
function popFrame(W, dt, api){
  const P = W.pop; if (!P) return;
  P.acc += dt; if (P.acc < DS.TICK) return; P.acc = 0;
  const r = songRng('tick' + P.id + Math.round(W.t * 4)), want = dsTarget(P.cfg, P.id, W.t);
  if (popActive(P) < want && r() < DS.SPAWN) popSpawn(W, api, r);
  for (const a of P.pool) { const v = a.vis; if (!v || v.busy || W.t < v.until) continue; if (W.menu && W.menu.n.npc === a) continue; popStep(W, api, a, r); }
  if (P.id === 'in:lake') popExerciseTick(W, api);
}
// Hồ Bán Nguyệt: nhóm tập dưỡng sinh sáng sớm và chiều muộn
function popExercise(W, api){
  W.pop.ex = [0, 1, 2, 3].map(k => { const a = api.npc('p', 470 + k * 30, 180 + (k % 2) * 8, '', k % 2 === 1, { id:'ex' + k, look:dsLook('ex' + k), label:'Người tập dưỡng sinh' }); a.fixed = true; a.crowd = true;
    a.entries = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }]; return a; });
  popExerciseTick(W, api, true);
}
function popExerciseTick(W, api, first){
  const h = (W.t / 60) % 24, on = (h >= 5.5 && h < 7.2) || (h >= 17 && h < 18.6);
  (W.pop.ex || []).forEach((a, k) => { if (a.gone === !on && !first) return; songHide(a, !on); if (on) { songSign(a, k === 0 ? '🤸' : ''); if (!api.C.still && songInView(W, a.x)) api.C.react(a, pick(['nod', 'jump'])); } });
}
const POP_DEBUG = () => WORLD && WORLD.pop && { id:WORLD.pop.id, active:popActive(WORLD.pop), want:dsTarget(WORLD.pop.cfg, WORLD.pop.id, WORLD.t), pool:WORLD.pop.pool.length,
  seats:WORLD.pop.seats.map(a => a ? a.id : null), steps:WORLD.pop.pool.filter(a => a.vis).map(a => a.id + ':' + a.vis.i), ex:(WORLD.pop.ex || []).filter(a => !a.gone).length };
