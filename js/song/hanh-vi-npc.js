/* =========================================================
   THẾ GIỚI SỐNG – PHASE 1: BỘ MÁY HÀNH VI NPC
   Mỗi NPC có một “bộ não” nhỏ (a.ai) đọc lịch (lich-npc.js) theo đồng hồ game và tự làm việc của mình:
   đi đến chỗ, ngồi / nằm / đứng, làm động tác, xen việc ngắn, đứng yên quan sát, ra ngoài, quay về.
   - Chạy chung một nhịp với vòng lặp thế giới (gọi từ P.frame), nghĩ 4 lần mỗi giây; không có vòng lặp hay hẹn giờ riêng.
   - Thời lượng tính bằng phút game, nên mở điện thoại, chuyển tab (vòng lặp dừng) thì NPC cũng dừng theo.
   - Giữ chỗ: hai người không chọn cùng một chỗ, không đứng đè lên người chơi.
   - Ở ngoài khung nhìn thì dịch chuyển thẳng (không diễn đi bộ); giảm chuyển động cũng vậy.
   ========================================================= */
const songSignsOn = () => !(S.opt && S.opt.signs === false);

/* ----- Giữ chỗ ----- */
function seatTaken(W, a, x, y){
  if (Math.abs(W.me.x - x) < 30 && Math.abs(W.me.y - y) < 20) return true;
  return W.npcs.some(b => b !== a && !b.gone && b.ai && b.ai.seat && Math.abs(b.ai.seat.x - x) < 30 && Math.abs(b.ai.seat.y - y) < 18);
}
// Chỗ thật cho việc này: lấy chỗ khai báo, nếu có người thì dịch sang bên cạnh
function seatFor(W, a, p){
  if (!p) return null;
  for (const d of [0, 34, -34, 68, -68]) { const x = p.x + d; if (x > W.H.x0 + 10 && x < W.H.x1 - 10 && !seatTaken(W, a, x, p.y)) return { ...p, x }; }
  return { ...p };
}

/* ----- Chỗ theo từng nơi ----- */
function songSpot(W, a, key){
  const H = W.H;
  if (W.song.kind === 'home') { const sp = (SONG_SPOTS[S.bg] || {})[key]; return sp ? { ...sp } : null; }
  const k = W.song.order.indexOf(a.who);
  if (key === 'desk') { const d = H.desks[a.who]; return { x:d.x, y:d.y, face:true }; }
  if (key === 'meet') return { x:H.meetSpot.x - 54 + k * 36, y:H.meetSpot.y + (k % 2) * 6, face:k >= 2 };
  if (key === 'pantry') return { x:H.pantry.x, y:H.pantry.y };
  if (key === 'door') { const o = H.objs.find(x => x.kind === 'door'); return { ...o.spot }; }
  if (key === 'visit') {
    const p = personaOf(a.who), present = W.npcs.filter(b => b !== a && !b.gone && b.ai && !b.ai.busy && b.ai.act === 'desk');
    const b = present.find(x => x.who === p.asks && songRng('ask' + W.t)() < .6) || present[Math.floor(songRng('visit' + a.who + W.t)() * present.length)];
    if (!b) return null; a.ai.with = b; return { x:b.x + 30, y:b.y + 6, face:true };
  }
  return null;
}
const songDef = (W, act) => (W.song.kind === 'home' ? HOME_ACT : VP_ACT)[act] || { spot:null };

/* ----- Dấu hiệu nhỏ trên đầu ----- */
function songSign(a, icon){
  let g = a.el.querySelector('.npc-sign');
  if (!icon || !songSignsOn()) { if (g) g.remove(); return; }
  if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'npc-sign'); a.el.appendChild(g); }
  g.setAttribute('transform', `translate(${a.rot ? -40 : 0} ${a.rot ? -62 : -162})`);
  g.innerHTML = `<circle r="15" fill="#fff" stroke="#B9C2CC" stroke-width="2"/><text y="6" text-anchor="middle" font-size="17">${icon}</text>`;
}

/* ----- Đi, xuất hiện, biến mất ----- */
const songInView = (W, x) => x > W.cam - SONG.LOD && x < W.cam + ROAM.VIEW_W + SONG.LOD;
async function songWalk(W, api, a, p){
  const H = W.H, goal = roamNearestFree(H, p) || p;
  songSign(a, '');
  if (api.C.still || (!songInView(W, a.x) && !songInView(W, goal.x))) { a.s = roamScale(goal.y); api.put(a, goal.x, goal.y); a.el.dataset.y = goal.y; api.depthSort(); return api.alive(); }
  const path = roamPath(H, { x:a.x, y:a.y }, goal) || [goal];
  for (const q of path) { a.s = roamScale(q.y); if (!await api.C.walk(a, q.x, q.y)) return false; a.el.dataset.y = q.y; api.depthSort(); }
  return api.alive();
}
function songHide(a, on){ a.gone = !!on; a.el.classList.toggle('gone', !!on); if (on) songSign(a, ''); }
// Vào chỗ và làm động tác của việc này
function songSettle(W, api, a, def, p){
  const C = api.C;
  if (def.lie) { a.rot = -90; a.s = .5; C.place(a, p.x, p.y); a.el.dataset.y = p.y - 30; C.act(a, 'act-sleep'); }
  else { a.rot = 0; api.put(a, p.x, p.y); C.face(a, !!p.face); C.act(a, def.act !== undefined ? def.act : (W.song.kind === 'office' ? VP_SIT[a.who] : '')); }
  if (def.hide) songHide(a, true);
  a.home = { x:p.x, y:p.y, name:def.act || '', lie:!!def.lie }; a.ai.seat = def.hide ? null : { x:p.x, y:p.y };
  api.depthSort(); songSign(a, def.sign);
}

/* ----- Một bước suy nghĩ của một NPC ----- */
async function songGo(W, api, a, now, snap){
  const ai = a.ai, def = songDef(W, now.act); ai.busy = true; ai.act = now.act; ai.with = null; ai.seat = null; a.rot = 0; if (a.home) a.home.lie = false;   // đứng dậy rồi thì chỗ cũ trống
  if (def.out) {
    if (!a.gone) { const door = songSpot(W, a, 'door') || (W.song.kind === 'home' ? null : { x:W.H.spawn.x, y:W.H.spawn.y });
      if (door && !snap && !await songWalk(W, api, a, door)) return; songHide(a, true); }
    ai.until = Infinity; ai.busy = false; return;
  }
  if (a.gone) { songHide(a, false); const door = songSpot(W, a, 'door'); if (door && !snap) { a.s = roamScale(door.y); api.put(a, door.x, door.y); } }
  const p = seatFor(W, a, songSpot(W, a, def.spot)) || { x:a.x, y:a.y };
  if (snap) { a.s = roamScale(p.y); api.put(a, p.x, p.y); } else if (!await songWalk(W, api, a, p)) return;
  songSettle(W, api, a, def, p);
  const r = songRng('beat' + a.who + Math.round(W.t));
  ai.until = W.t + SONG.BEAT[0] + r() * (SONG.BEAT[1] - SONG.BEAT[0]); ai.busy = false;
}
// Việc xen ngắn hoặc đứng yên quan sát, rồi quay về việc chính
async function songBeat(W, api, a){
  const ai = a.ai, r = songRng('b' + a.who + Math.round(W.t)), list = W.song.kind === 'office' ? (ai.act === 'desk' ? VP_BEATS[a.who] : []) : (songDef(W, ai.act).beats || []);
  if (!list.length || r() > SONG.BEAT_P || a.gone) { ai.until = W.t + SONG.IDLE[0] + r() * (SONG.IDLE[1] - SONG.IDLE[0]); return; }
  const B = SONG_BEAT[list[Math.floor(r() * list.length)]]; ai.busy = true;
  const keep = { act:ai.act }, back = { x:a.x, y:a.y };
  let p = B.spot ? seatFor(W, a, songSpot(W, a, B.spot)) : B.step ? { x:a.x + (r() < .5 ? -B.step : B.step), y:a.y } : null;
  if (p) { a.rot = 0; if (!await songWalk(W, api, a, p)) return; api.C.face(a, !!p.face); ai.seat = { x:p.x, y:p.y }; }
  api.C.act(a, B.act); songSign(a, B.sign);
  if (ai.with) { const b = ai.with; songSign(b, '💬'); api.C.act(b, 'act-listen'); api.C.face(b, false);
    const c = typeof pairChat === 'function' ? pairChat(a.who, b.who) : null; if (c && songInView(W, a.x)) c.lines.forEach((t, i) => api.C.later(() => api.say(i % 2 ? b : a, t, 1500), i * 1600)); }
  ai.beatEnd = W.t + B.dur[0] + r() * (B.dur[1] - B.dur[0]); ai.beatBack = p ? keep : null; ai.beatPos = back; ai.busy = false; ai.inBeat = true;
}
async function songEndBeat(W, api, a){
  const ai = a.ai; ai.inBeat = false;
  if (ai.with) { const b = ai.with; if (!b.gone && b.ai && !b.ai.busy) { api.C.act(b, VP_SIT[b.who] || ''); api.C.face(b, true); songSign(b, songDef(W, b.ai.act).sign); } ai.with = null; }
  await songGo(W, api, a, { act:ai.act });
}

/* ----- Gắn vào một nơi: tạo người theo lịch, rồi chạy cùng vòng lặp thế giới ----- */
function songMount(W, api, kind){
  const list = kind === 'office' ? DESK_ORDER.filter(k => k !== 'me' && !W.H.absent.includes(k)) : (HOME_WHO[S.bg] || []);
  W.song = { kind, acc:0, order:list.slice() }; W.npcs = W.npcs || [];
  list.forEach(who => {
    const door = kind === 'office' ? W.H.spawn : (SONG_SPOTS[S.bg] || {}).door || W.H.spawn;
    const a = api.npc(who, door.x, door.y, '', false, { id:who, speed:SONG.SPEED });
    a.ai = { who, block:null, until:0, busy:false, act:null };
    const now = songWant(who, kind, W.t); a.ai.block = now.i; songGo(W, api, a, now, true);
  });
  W.el.classList.toggle('no-signs', !songSignsOn());
}
function songFrame(W, dt, api){
  const G = W.song; if (!G) return;
  G.acc += dt; if (G.acc < SONG.TICK) return; G.acc = 0;
  for (const a of W.npcs) {
    const ai = a.ai; if (!ai || ai.busy || a.lock || a.left_) continue;
    if (W.menu && W.menu.n.npc === a) continue;                                 // đang nói chuyện với người chơi: đứng yên
    const now = songWant(ai.who, G.kind, W.t);                                 // có tính trước thời gian đi đường
    if (now.i !== ai.block) { ai.block = now.i; ai.inBeat = false; songGo(W, api, a, now); continue; }
    if (ai.inBeat) { if (W.t >= ai.beatEnd) songEndBeat(W, api, a); continue; }
    if (W.t >= ai.until && !a.gone) songBeat(W, api, a);
  }
}
const songHomeOn = () => (HOME_WHO[S.bg] || []).length > 0;
// Dành cho kiểm thử: tóm tắt NPC đang làm gì
const SONG_DEBUG = () => WORLD && WORLD.song && WORLD.npcs.filter(a => a.ai).map(a => ({ who:a.who, act:a.ai.act, gone:!!a.gone, x:Math.round(a.x), y:Math.round(a.y), busy:a.ai.busy, beat:!!a.ai.inBeat, lie:!!(a.home && a.home.lie) }));

/* ----- Nối vào nhà ----- */
(() => {
  const HP = ROAM_PLACES.find(p => p.id === 'home');
  const m0 = HP.mount, f0 = HP.frame;
  HP.mount = (W, api) => { if (m0) m0(W, api); if (songHomeOn()) songMount(W, api, 'home'); };
  HP.frame = (W, dt, api) => { if (f0) f0(W, dt, api); songFrame(W, dt, api); };
})();
