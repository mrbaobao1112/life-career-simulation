/* =========================================================
   v14: THẾ GIỚI TỰ DO TRONG NHÀ
   Người chơi tự đi lại bằng bàn phím hoặc joystick, chạm vào đồ vật để nhân vật tự đi đến,
   đứng gần thì nhấn E. Đồng hồ trong game chạy liên tục (kể cả lúc đi lại) trong khung giờ của buổi;
   dùng một đồ vật chính (giường, máy tính, bếp…) thì đồng hồ quay nhanh đến cuối buổi, giống như trước.
   Hình nhân vật, động tác, bong bóng thoại dùng lại lõi sân khấu (san-khau.js).
   ========================================================= */
let WORLD = null;       // thế giới đang mở (null khi không ở trong nhà)
let ROAM_NOW = null;
const npcName = a => a.label || (NPC[a.who] ? NPC[a.who].name : 'Người qua đường');    // giờ hiện tại trong thế giới, để nhật ký ghi đúng giờ (xem feedTime)

function roamHTML(ref){
  const H = roamPlace(ref).map();
  const hits = H.objs.map(o => `<rect class="w-obj" data-o="${o.id}" x="${o.hit[0]}" y="${o.hit[1]}" width="${o.hit[2] - o.hit[0]}" height="${o.hit[3] - o.hit[1]}" rx="6"/>`).join('');
  return `<div class="panel stage world" id="world" data-place="${roamPlace(ref).id}" data-house="${H.key || S.bg}">
    <svg viewBox="0 0 ${ROAM.VIEW_W} ${ROAM.VIEW_H}" data-w="${H.W}" role="img" aria-label="${esc(H.name)}: tự đi lại và dùng đồ vật">
      <g class="w-cam">${H.paint()}${H.deco()}<g class="w-hits">${hits}</g><g class="L-world"></g><rect class="w-tint" x="0" y="0" width="${H.W}" height="${ROAM.VIEW_H}" fill="#121836" opacity="0" pointer-events="none"/><g class="L-say"></g></g>
    </svg>
    <div class="w-hud"><span class="w-clock" aria-live="off">🕘 <b>--:--</b></span><span class="w-left" aria-hidden="true"><i></i></span><span class="w-room"></span></div>
    <button class="w-prompt" type="button" hidden></button>
    <div class="w-menu" role="menu" hidden></div>
    <div class="w-wake" hidden></div>
    <div class="w-tut" role="status" hidden></div>
  </div>
  <div class="w-pad" hidden><div class="w-joy" aria-hidden="true"><i class="w-knob"></i></div><span class="w-padhint">Kéo vòng tròn để đi, kéo sát mép để chạy<br>Chạm vào đồ vật để tự đi tới</span><button class="w-use" type="button" disabled aria-label="Dùng đồ vật">✋</button></div>
  <div class="w-toast" role="status" hidden></div>`;
}

function roamMount(root, ref){
  const el = root.querySelector('#world'); if (!el) return;
  const P = roamPlace(ref), H = P.map(), sc = current, C = stageCore(el), svg = C.svg, pk = P.key();
  const [h0, h1] = P.span(ref), key = roamKey(ref), keep = S.roam && S.roam.d === S.day && (S.roam.place || 'home:' + S.roam.bg) === pk;
  const rt = S.roam && S.roam.d === S.day ? S.roam.t : -1;   // cùng ngày: đồng hồ chạy tiếp từ cảnh trước (kể cả khi vừa đổi nơi); không bao giờ quay lùi về đầu buổi
  const W = WORLD = { ref, sc, P, H, C, el, svg, cam:0, t: rt >= h0 * 60 ? Math.min(rt, h1 * 60 - 1) : h0 * 60, end:h1 * 60, hold:ref.id === 'wake', runT:0, gait:'',
    busy:false, path:null, arrive:null, menu:null, toast:false, near:null, moving:false, greeted:{}, npcs:[], lastSave:0, room:'', minute:-1 };
  const $w = s => el.querySelector(s) || root.querySelector(s);
  const run = C.run, alive = () => C.alive() && WORLD === W;

  /* --- nhân vật --- */
  // chỗ đứng lúc vào: vừa đi qua cửa thì đứng ở cửa đó (P.enter), không thì chỗ cũ ở nơi này trong hôm nay, không nữa thì chỗ mặc định
  const ent = P.enter && P.enter(), pp = ((S.roamPos || {})[pk]) || (keep ? S.roam : null);
  const start = ent && roamFree(H, ent.x, ent.y) ? ent : pp && pp.d !== undefined && pp.d === S.day && roamFree(H, pp.x, pp.y) ? { x:pp.x, y:pp.y } : H.spawn;
  const me = W.me = C.add('me', start.x, start.y, 'world', '', undefined, { s:roamScale(start.y) });
  const cast = (P.id === 'home' && H.cast) || {};
  for (const [who, plan] of Object.entries(cast)) {
    if ((S.day * 7 + who.length * 13 + SLOTS.indexOf(S.slot) * 5) % 10 < 2) continue;          // có buổi người này đi vắng
    const opts = plan[S.slot] || plan.evening, [spot, name] = opts[(S.day + who.length) % opts.length], P = H.spots[spot];
    const lie = name === 'sleep';
    const a = C.add(who, P.x, P.y, 'world', lie ? 'act-sleep' : name, lie ? 'tired' : undefined, { s:lie ? .5 : roamScale(P.y), rot:lie ? -90 : 0 });
    if (P.face) C.face(a, true);
    a.home = { x:P.x, y:P.y, name, lie }; W.npcs.push(a);
  }
  const depthSort = () => { const L = C.layer('world'), list = [...L.children].filter(n => n.classList.contains('actor')).sort((p, q) => (+p.dataset.y || 0) - (+q.dataset.y || 0));
    if (list.some((n, i) => L.children[i] !== n)) list.forEach(n => L.appendChild(n)); };
  const put = (a, x, y, s) => { a.s = s || roamScale(y); C.place(a, x, y); a.el.dataset.y = a.rot ? y - 30 : y; };
  W.npcs.forEach(a => put(a, a.x, a.y, a.s)); put(me, me.x, me.y); depthSort();

  /* --- giờ giấc và ánh sáng --- */
  const light = () => {
    const h = (W.t / 60) % 24, night = h >= 19 || h < 5.5, dusk = h >= 17 && h < 19;
    $w('.w-tint').setAttribute('opacity', night ? .3 : dusk ? .1 : 0);
    $w('.w-tint').setAttribute('fill', dusk ? '#FF8A4C' : '#121836');
    svg.querySelectorAll('.w-sky').forEach(s => s.setAttribute('fill', night ? '#24305E' : dusk ? '#F6B58A' : h < 9 ? '#D7ECFF' : '#BFE0FF'));
    svg.querySelectorAll('.w-lampglow').forEach(g => g.setAttribute('opacity', night ? .34 : dusk ? .14 : 0));
    svg.querySelectorAll('.w-hand-h').forEach(p => { const b = p.getAttribute('d').match(/M([\d.]+) ([\d.]+)/); p.setAttribute('transform', `rotate(${(h % 12) * 30} ${b[1]} ${b[2]})`); });
    svg.querySelectorAll('.w-hand-m').forEach(p => { const b = p.getAttribute('d').match(/M([\d.]+) ([\d.]+)/); p.setAttribute('transform', `rotate(${(W.t % 60) * 6} ${b[1]} ${b[2]})`); });
  };
  const hud = () => {
    const m = Math.floor(W.t); if (m === W.minute) return; W.minute = m;
    $w('.w-clock b').textContent = clockMin(m);
    if (ref.id === 'home_am') $w('.w-clock').classList.toggle('late', m > leaveBy());
    const wm = document.querySelector('#who .who-meta'); if (wm) wm.textContent = wm.textContent.replace(/\d\d:\d\d/, clockMin(m));   // dòng giờ ở đầu trang cũng chạy theo
    $w('.w-left i').style.width = Math.max(0, Math.min(100, (W.end - W.t) / (W.end - h0 * 60) * 100)) + '%';
    if (m % 5 === 0 || W.minute < 0) light();
  };
  W.minute = -2; hud(); light();

  /* --- phần hiển thị trên khung (gợi ý, thực đơn, kết quả) --- */
  const scr = (x, y) => ({ left:((x - W.cam) / ROAM.VIEW_W * 100) + '%', top:(y / ROAM.VIEW_H * 100) + '%' });
  const anchor = n => n.npc ? { x:n.npc.x, y:n.npc.y - 140 * n.npc.s - 6 } : { x:(n.o.hit[0] + n.o.hit[2]) / 2, y:Math.max(14, n.o.hit[1] - 4) };
  const label = n => {
    const list = n.npc ? (n.npc.entries ? n.npc.entries(ref, sc) : P.npcEntries(ref, sc, n.npc.who)) : P.entries(ref, sc, n.o), main = list.filter(e => !e.minor || e.greet);
    if (n.npc) return `${P.id === 'home' ? (n.npc.who === 'tung' ? '🍺' : '👪') : '💬'} ${esc(npcName(n.npc))}`;
    if (!main.length && !list.length) return `${n.o.icon} ${P.idle(ref, n.o)}`;
    const first = (main[0] || list[0]);
    return `${n.o.icon} ${main.length > 1 ? esc(n.o.name) : esc(first.label)}${main.length > 1 ? ` <small>· ${main.length} việc</small>` : ''}`;
  };
  const showPrompt = () => {
    const p = $w('.w-prompt'), n = W.near;
    if (!n || W.menu || W.toast || W.busy) { p.hidden = true; $w('.w-use').disabled = true; svg.querySelectorAll('.w-obj.near').forEach(r => r.classList.remove('near')); return; }
    p.innerHTML = `<kbd>E</kbd> ${label(n)}`; Object.assign(p.style, scr(anchor(n).x, anchor(n).y)); p.hidden = false;
    $w('.w-use').disabled = false;
    svg.querySelectorAll('.w-obj').forEach(r => r.classList.toggle('near', !!n.o && r.dataset.o === n.o.id));
  };
  // Đặt thực đơn cạnh đồ vật nhưng luôn nằm gọn trong khung (không bị cắt mép trên hay hai bên)
  const placeMenu = () => {
    const m = $w('.w-menu'); if (!W.menu || m.hidden) return;
    const R = el.getBoundingClientRect(), a = anchor(W.menu.n), w = m.offsetWidth, h = m.offsetHeight;
    const ax = (a.x - W.cam) / ROAM.VIEW_W * R.width, ay = a.y / ROAM.VIEW_H * R.height;
    m.style.left = Math.max(4, Math.min(R.width - w - 4, ax - w / 2)) + 'px';
    m.style.top = Math.max(4, Math.min(R.height - h - 4, ay - h - 6)) + 'px';
  };
  const closeMenu = () => { W.menu = null; const m = $w('.w-menu'); m.hidden = true; m.innerHTML = ''; showPrompt(); };
  const openMenu = n => {
    const list = n.npc ? (n.npc.entries ? n.npc.entries(ref, sc) : P.npcEntries(ref, sc, n.npc.who)) : P.entries(ref, sc, n.o);
    if (!list.length) { C.say(me, P.idle(ref, n.o).replace(/^\S+\s/, ''), 1400); return; }
    W.menu = { n, list }; const m = $w('.w-menu'); if (W.tut && W.tut.k === 3) tutNext();
    m.innerHTML = `<div class="w-mh">${n.npc ? esc(npcName(n.npc)) : `${n.o.icon} ${esc(n.o.name)}`}<button type="button" class="w-x" aria-label="Đóng">✕</button></div>`
      + list.map((e, k) => `<button type="button" role="menuitem" class="w-act ${e.minor ? 'minor' : ''}" data-k="${k}" ${e.off ? 'disabled' : ''}><span class="wi">${e.icon || '•'}</span><span class="wl">${esc(e.label)}</span>`
        + `${(t => t ? `<span class="wc">${t}</span>` : '')(e.off && e.why ? e.why : e.cost ? fmt(e.cost) : e.minor && e.min ? `${e.min} phút` : '')}<kbd>${k + 1}</kbd></button>`).join('');
    m.hidden = false; placeMenu(); $w('.w-prompt').hidden = true;
    m.querySelector('.w-x').addEventListener('click', closeMenu);
    m.querySelectorAll('.w-act').forEach(b => b.addEventListener('click', () => doEntry(n, list[+b.dataset.k])));
    const f = m.querySelector('.w-act:not([disabled])'); if (f) f.focus({ preventScroll:true });
    SFX.play('pop');
  };
  const toast = (html, onGo) => {
    W.toast = true; showPrompt(); const t = $w('.w-toast');
    t.innerHTML = `${html}<button class="btn" type="button">Tiếp tục ▸</button>`; t.hidden = false; t.scrollIntoView && t.scrollIntoView({ block:'nearest', behavior:C.still ? 'auto' : 'smooth' });
    const b = t.querySelector('button'); b.addEventListener('click', () => { if (!alive()) return; t.hidden = true; W.toast = false; onGo(); }, { once:true });
    b.focus({ preventScroll:true });
  };

  /* --- dùng đồ: diễn động tác, quay đồng hồ, rồi gọi đúng lựa chọn có sẵn --- */
  const partOf = (sel, o) => [...svg.querySelectorAll(sel)].find(g => { const x = +g.dataset.x; return x >= o.hit[0] - 6 && x <= o.hit[2]; });
  let blanket = null;
  const pose = (o, on) => {
    const u = o.use || {};
    if (!on) {
      if (blanket) { blanket.remove(); blanket = null; } me.rot = 0; me.el.classList.remove('gone'); C.act(me, ''); C.hold(me);
      ['.w-scr','.w-steam','.w-dish','.w-water'].forEach(s => { const g = partOf(s, o); if (g) { g.classList.remove('on'); if (s !== '.w-scr') g.setAttribute('opacity', 0); } });
      W.rest = null; put(me, o.spot.x, o.spot.y); depthSort(); return;
    }
    let x = u.x ?? o.spot.x; const y = u.y ?? o.spot.y; W.rest = o.spot;      // đứng dậy thì về chỗ đứng trước đồ vật
    // chỗ đó đã có người (bố mẹ ngồi uống trà, Tùng ngồi chơi game…): dịch sang chỗ trống bên cạnh, không đứng đè lên nhau
    if (!u.lie && !u.hide) { const taken = xx => W.npcs.some(a => !a.home.lie && document.body.contains(a.el) && Math.abs(a.x - xx) < 32 && Math.abs(a.y - y) < 18);
      for (const d of [0, 38, -38, 76, -76]) if (!taken(x + d) && x + d > H.x0 + 10 && x + d < H.x1 - 10) { x += d; break; } }
    if (u.lie) { me.rot = -90; put(me, x, y, .5); C.act(me, 'act-sleep');
      blanket = document.createElementNS('http://www.w3.org/2000/svg', 'g'); blanket.innerHTML = `<path d="M${x - 46} ${y - 14} Q${x - 18} ${y - 22} ${x + 12} ${y - 14} L${x + 14} ${y + 4} L${x - 48} ${y + 4}Z" fill="${S.bg === 'nha' ? '#F6C85F' : '#9FC2F2'}" stroke="#00000018"/>`;
      C.layer('world').appendChild(blanket); }
    else { put(me, x, y); C.face(me, !!u.face); if (u.hide) me.el.classList.add('gone'); else C.act(me, u.act || ''); }
    const scrG = u.scr && partOf('.w-scr', o); if (scrG) scrG.classList.add('on');
    ['.w-steam','.w-dish','.w-water'].forEach(s => { const g = (u.steam && s === '.w-steam') || (u.dish && s === '.w-dish') || (u.hide && s === '.w-water') ? partOf(s, o) : null; if (g) g.setAttribute('opacity', 1); });
    depthSort();
  };
  const spin = (to, ms) => new Promise(res => { W.spin = { from:W.t, to, t0:performance.now(), ms:C.still ? 1 : ms, res }; });
  const commit = (ch, pre) => {
    ROAM_NOW = W.t / 60; const r = settleChoice(ch); ROAM_NOW = null;
    if (!r) { W.busy = false; return; }
    saveRoam(true);
    if (followGo(r.out)) return;
    const chips = diffChips(r.before, snap());
    S.cur = null; save();
    if (r.out.silent || (!r.out.text && !chips.length && !pre)) return advance();
    updateHUD(); const fx = resultFx(r.out, r.before); if (fx.snd) SFX.play(fx.snd);
    toast(`<p>${pre ? pre + ' ' : ''}${r.out.text || ''}</p>${chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : ''}`, advance);
  };
  async function doEntry(n, e, pre){
    if (!e || e.off || W.busy) return;
    closeMenu(); W.busy = true; W.path = null; showPrompt();
    if (e.greet) {
      const a = n.npc; C.face(me, a.x < me.x); if (!a.home.lie) C.face(a, me.x < a.x);
      C.say(me, P.greet(a.who), 1200); SFX.play('talk'); await C.wait(C.still ? 0 : 1000); if (!alive()) return;
      if (a.home.lie) C.say(a, 'Khò… khò…', 1400); else { C.react(a, 'nod'); C.say(a, pick(NPC_QUIP[a.who] || ['Ừ.']), 1500); }
      await C.wait(C.still ? 0 : 1200); if (!alive()) return; W.busy = false; showPrompt(); return;
    }
    if (e.go) {                                                // đi sang nơi khác (ra phố, vào quán, về nhà): đồng hồ chạy tiếp
      saveRoam(true); if (P.leave) P.leave(W, e); roamGo(e.go, e.enter); return;
    }
    if (e.run) { W.busy = false; showPrompt(); e.run(W, api); return; }   // việc do nơi đó tự xử lý (dắt xe, bắt đầu chạy vòng hồ…)
    if (n.npc) {                                               // việc làm với một người: quay sang họ, nói một câu, rồi tính đúng lựa chọn
      const a = n.npc; C.face(me, a.x < me.x); if (!a.home.lie) C.face(a, me.x < a.x);
      if (e.talk) { await P.talk(a, api); if (!alive()) return; W.busy = false; showPrompt(); return; }
      if (e.fx) { ROAM_NOW = W.t / 60; const line = e.fx(); ROAM_NOW = null; updateHUD(); C.say(a, line, 1700); SFX.play('pop'); await C.wait(C.still ? 0 : 900); if (!alive()) return; W.busy = false; showPrompt(); return; }
      C.say(me, e.say || '…', 1200); SFX.play('talk'); await C.wait(C.still ? 0 : 1100); if (!alive()) return;
      if (e.reply) { C.react(a, 'nod'); C.say(a, e.reply, 1300); await C.wait(C.still ? 0 : 1100); if (!alive()) return; }
      await spin(W.end, 600); if (!alive()) return; return commit(sc.choices[e.i], pre);
    }
    const o = n.o;
    if (e.flat) { W.busy = false; ROAM_FLAT = S.cur; saveRoam(true); return renderScene(); }   // cảnh cốt truyện: mở bảng như cũ
    if (e.minor) {
      pose(o, true); await spin(Math.min(W.end - 1, W.t + e.min), 700); if (!alive()) return;
      ROAM_NOW = W.t / 60; const line = e.fx(); ROAM_NOW = null; pose(o, false); updateHUD(); C.say(me, line, 1600);
      W.busy = false; showPrompt(); saveRoam(); return;
    }
    if (e.call) {                                              // gọi điện hẹn (rủ đi chơi): vài phút, không hết buổi
      C.act(me, 'act-phone'); C.say(me, 'Alo, rảnh không?', 1300); SFX.play('talk');
      await spin(Math.min(W.end - 1, W.t + ROAM.CALL_MIN), 900); if (!alive()) return;
      C.act(me, ''); ROAM_NOW = W.t / 60; saveRoam(true); choose(e.i); ROAM_NOW = null; return;
    }
    if (o.use.exit) {                                          // ra khỏi nhà: mở cửa, bước ra, rồi sang cảnh bên ngoài như cũ
      C.door(true); SFX.play('pop'); me.el.classList.add('gone'); await C.wait(C.still ? 0 : 500); if (!alive()) return;
      if (ref.id !== 'home_am') await spin(W.end, 600);       // đi chơi: hết buổi; đi làm: ra khỏi nhà đúng lúc này
      if (!alive()) return; ROAM_NOW = W.t / 60; saveRoam(true); choose(e.i); ROAM_NOW = null; return;
    }
    pose(o, true);
    if (e.mg && typeof mgPlay === 'function') {                 // làm task: chơi trò nhỏ, kết quả chỉnh nhẹ khả năng thành công
      const res = await mgPlay(e.mg); if (!alive()) return;
      MG_BONUS = res.bonus; pre = res.line;
      await spin(W.end, ROAM.ACT_MS); if (!alive()) return;
      const ch = sc.choices[e.i]; commit(ch, pre); MG_BONUS = 0; return;
    }
    if (o.use.sweep && !C.still) (async () => { const [a, b] = o.use.sweep; me.speed = 44; C.act(me, 'act-sweep'); while (W.spin && alive()) { put(me, a + Math.random() * (b - a), 178); C.act(me, 'act-sweep'); await C.wait(400); } })();
    await spin(e.bed ? W.t : W.end, ROAM.ACT_MS); if (!alive()) return;
    if (e.bed !== undefined) { const h = typeof e.bed === 'number' ? e.bed : Math.max(W.t / 60, bedOptsMin() - .5); return commit(bedChoice({ h:Math.round(h * 4) / 4, icon:'🛌', label:`Đi ngủ lúc ${clock(h)}` }), pre); }
    commit(sc.choices[e.i], pre);
  }
  async function timeUp(){
    W.busy = true; W.path = null; closeMenu();
    if (P.onTimeUp) { const done = await P.onTimeUp(W, api); if (done || !alive()) return; }
    const r = P.timeout(ref, sc);
    C.say(me, ref.id === 'bedtime' ? 'Buồn ngủ quá…' : 'Ơ, hết giờ rồi à?', 1400); await C.wait(C.still ? 0 : 1300); if (!alive()) return;
    if (r.bed) { const o = H.objs.find(x => x.kind === 'bed'); pose(o, true); return commit(bedChoice({ h:r.bed, icon:'🦉', label:'Ngủ gục lúc 02:00' })); }
    if (r.i < 0) { S.cur = null; return advance(); }
    const ch = sc.choices[r.i], o = H.objs.find(x => x.kind === P.choiceObj(ref, ch));
    if (o && !o.use.exit) pose(o, true);
    if (o && o.use.exit) { ROAM_NOW = W.t / 60; saveRoam(true); choose(r.i); ROAM_NOW = null; return; }
    commit(ch, r.text);
  }

  /* --- chạm, bấm chuột --- */
  const goTo = (n) => {
    const spot = n.npc ? { x:n.npc.x + (me.x < n.npc.x ? -26 : 26), y:Math.max(ROAM.Y0, Math.min(ROAM.Y1, n.npc.home.lie ? 172 : n.npc.y + 8)) } : n.o.spot;
    if (Math.hypot(spot.x - me.x, spot.y - me.y) <= ROAM.NEAR) { W.near = n; return openMenu(n); }
    const path = roamPath(H, { x:me.x, y:me.y }, spot);
    if (!path) { C.say(me, 'Không đi tới được…', 1200); return; }
    W.path = path; W.arrive = () => { W.near = n; openMenu(n); };
  };
  svg.addEventListener('click', e => {
    if (W.busy || W.toast) return;
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    const vx = (e.clientX - r.left) / r.width * ROAM.VIEW_W + W.cam, vy = (e.clientY - r.top) / r.height * ROAM.VIEW_H;
    const actor = e.target.closest && e.target.closest('.actor');
    if (actor && actor.dataset.who !== 'me') { const a = W.npcs.find(n => n.id === actor.dataset.who); if (a) { closeMenu(); return goTo({ npc:a }); } }
    if (actor) return;
    const hit = e.target.closest && e.target.closest('.w-obj');
    if (hit) { closeMenu(); return goTo({ o:H.objs.find(o => o.id === hit.dataset.o) }); }
    if (W.menu) return closeMenu();
    if (vy < ROAM.Y0 - 24) return;
    const path = roamPath(H, { x:me.x, y:me.y }, { x:vx, y:Math.max(ROAM.Y0, Math.min(ROAM.Y1, vy)) });
    if (path) { W.path = path; W.arrive = null; }
  });
  $w('.w-prompt').addEventListener('click', () => { if (W.near) openMenu(W.near); });
  $w('.w-use').addEventListener('click', () => { if (W.near) openMenu(W.near); });

  /* --- bàn phím --- */
  INPUT.on = true; inputClear();
  INPUT.onMove = () => { if (!alive()) return; W.path = null; W.arrive = null; if (W.menu) closeMenu(); };
  INPUT.onKey = e => {
    if (!alive()) return false;
    if (ref.id === 'wake' && !W.wakeBusy && !W.toast) { const k = Object.entries(WAKE_KEY).find(([, v]) => 'Key' + v === e.code); const ch = k && sc.choices.find(c => c.key === k[0]); if (ch) { doWake(ch); return true; } return false; }
    if (W.toast) { const b = $w('.w-toast button'); if (b && (e.code === 'KeyE' || (['Space','Enter'].includes(e.code) && document.activeElement !== b))) { b.click(); return true; } return false; }
    if (W.busy) return false;
    if (W.menu) {
      if (e.code === 'Escape') { closeMenu(); return true; }
      const d = e.code.match(/^(?:Digit|Numpad)([1-9])$/); if (d) { const k = +d[1] - 1; if (W.menu.list[k]) doEntry(W.menu.n, W.menu.list[k]); return true; }
      if (e.code === 'KeyE') { const k = W.menu.list.findIndex(x => !x.off); if (k >= 0) doEntry(W.menu.n, W.menu.list[k]); return true; }
      return false;
    }
    if (e.code === 'KeyE' && W.near) { openMenu(W.near); return true; }
    return false;
  };

  if (touchFirst()) { $w('.w-pad').hidden = false; joyMount($w('.w-joy')); }       // điện thoại: joystick và nút dùng đồ nằm dưới khung, không che cảnh

  /* --- móc cho từng nơi (văn phòng: đồng nghiệp, kỷ luật) --- */
  // thêm một người vào nơi này (người hẹn, người bán hàng, người qua đường…)
  const npc = (who, x, y, act = '', left = false, o = {}) => {
    const a = C.add(who, x, y, 'world', act, o.expr, { s:roamScale(y), look:o.look, id:o.id || who });
    if (left) C.face(a, true); a.speed = o.speed || 50; a.home = { x, y, name:act, lie:false }; a.label = o.label; a.entries = o.entries;
    put(a, x, y); W.npcs.push(a); depthSort(); return a;
  };
  const api = { C, me, put, depthSort, alive, say:C.say, wait:C.wait, scr, showPrompt, closeMenu, toast, npc, spin:(to, ms) => spin(to, ms), commit:(ch, pre) => commit(ch, pre), pose,
    roomOf:x => (H.rooms.find(r => x >= r[1] && x < r[2]) || [''])[0], goTo:n => goTo(n), say2:(t, ms) => C.say(me, t, ms) };
  W.api = api;
  if (P.mount) P.mount(W, api);

  /* --- thức dậy: nằm trên giường, chọn dậy ngay hay nằm thêm (bong bóng chạm được, hoặc phím) --- */
  const bedObj = H.objs.find(o => o.kind === 'bed');
  const WAKE_KEY = { up:'E', snooze:'R', late:'T' };
  async function doWake(ch){
    if (!ch || W.wakeBusy) return; W.wakeBusy = true; $w('.w-wake').hidden = true;
    if (ch.key === 'snooze') {
      C.say(me, snoozeN() >= BAL.SNOOZE_MAX - 1 ? 'Thêm 5 phút nữa thôi…' : 'Thêm 10 phút nữa…', 1200); SFX.play('pop');
      await C.wait(C.still ? 0 : 1000); if (!alive()) return; return commit(ch);
    }
    if (ch.key === 'late') return commit(ch);
    pose(bedObj, false); C.react(me, 'jump'); SFX.play('hop'); W.rest = bedObj.spot;
    await C.wait(C.still ? 0 : 700); if (!alive()) return; commit(ch);
  }
  if (ref.id === 'wake') {
    W.busy = true; pose(bedObj, true); W.rest = bedObj.spot;
    const box = $w('.w-wake');
    box.innerHTML = sc.choices.map((c, i) => `<button type="button" class="w-wk ${c.key === 'up' ? 'main' : ''}" data-i="${i}"><span class="wi">${c.icon}</span><span>${esc(c.label)}</span>${WAKE_KEY[c.key] ? `<kbd>${WAKE_KEY[c.key]}</kbd>` : ''}</button>`).join('');
    box.hidden = false; box.querySelectorAll('.w-wk').forEach(b => b.addEventListener('click', () => doWake(sc.choices[+b.dataset.i])));
    const f = box.querySelector('.w-wk.main'); if (f) f.focus({ preventScroll:true });
  }

  /* --- ngày đầu tiên: mũi tên chỉ bàn học, người nhà nhắc --- */
  if (ref.id === 'd1_cv') {
    const desk = H.objs.find(o => o.kind === 'desk'), g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'w-arrow'); g.innerHTML = `<path d="M${(desk.hit[0] + desk.hit[2]) / 2 - 7} ${desk.hit[1] - 22} h14 v8 h7 l-14 13 l-14 -13 h7Z" fill="#F6C85F" stroke="#1B2230" stroke-width="1.4"/>`;
    $w('.w-hits').appendChild(g);
    C.later(() => { const a = W.npcs[0]; if (a && !a.home.lie) C.say(a, a.who === 'tung' ? 'Sửa CV rồi nộp đi mày!' : 'Sửa CV rồi nộp hồ sơ đi con!', 2200); else C.say(me, 'Ra máy tính sửa CV thôi.', 2000); }, 700);
  }

  /* --- hướng dẫn 4 bước (lần đầu, bỏ qua được, xem lại trong Nếp sinh hoạt) --- */
  const TUT = touchFirst()
    ? ['Đi lại: kéo vòng tròn bên dưới', 'Chạy: kéo vòng tròn ra sát mép (chạy tốn năng lượng)', 'Đi đến gần một đồ vật, hoặc chạm thẳng vào nó', 'Chạm nút ✋ để xem việc làm được ở đó']
    : ['Đi lại: giữ <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> hoặc phím mũi tên', 'Chạy: giữ thêm <kbd>Shift</kbd> (chạy tốn năng lượng)', 'Đi đến gần một đồ vật: giường, máy tính, bếp…', 'Nhấn <kbd>E</kbd> để xem việc làm được ở đó'];
  const tutBox = $w('.w-tut');
  const tutShow = () => { tutBox.innerHTML = `<span class="w-tn">${W.tut.k + 1}/4</span><span class="w-tt">${TUT[W.tut.k]}</span><button type="button" class="w-tskip">Bỏ qua</button>`;
    tutBox.querySelector('.w-tskip').addEventListener('click', tutEnd); tutBox.hidden = false; };
  function tutEnd(){ W.tut = null; tutBox.hidden = true; S.once.roamTut = true; save(); }
  const tutNext = () => { W.tut.k++; SFX.play('pop'); if (W.tut.k < 4) return tutShow();
    tutBox.innerHTML = '<span class="w-tt">🎉 Xong rồi! Giờ bạn tự do sinh hoạt trong nhà.</span>'; W.tut = null; S.once.roamTut = true; save(); C.later(() => { tutBox.hidden = true; }, 2600); };
  if (!S.once.roamTut && ref.id !== 'wake') { W.tut = { k:0, x:me.x, y:me.y, run:0 }; tutShow(); }

  /* --- vòng lặp 60 hình mỗi giây --- */
  let last = performance.now(), stepCss = '';
  const paused = () => document.hidden || inputBusy(null) || W.toast || !!W.menu;
  function frame(now){
    if (!alive()) { if (WORLD === W) { WORLD = null; INPUT.on = false; } return; }
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    // đồng hồ
    if (W.spin) { const k = Math.min(1, (now - W.spin.t0) / W.spin.ms); W.t = W.spin.from + (W.spin.to - W.spin.from) * k; if (k >= 1) { const r = W.spin.res; W.spin = null; r(); } }
    else if (!W.busy && !W.hold && !paused()) { W.t += dt * ROAM.MIN_PER_SEC; if (W.t >= W.end) { W.t = W.end; if (P.story(ref)) W.hold = true; else timeUp(); } }
    hud();
    if (P.frame && !W.spin && !paused()) P.frame(W, dt, api);
    // di chuyển
    let vx = 0, vy = 0;
    const wantRun = inputRun() && !W.riding, canRun = S.energy >= ROAM.RUN_MIN_ENERGY, running = wantRun && canRun && !W.busy;   // đi xe thì không tính chạy
    if (wantRun && !canRun && !W.tired) { W.tired = true; C.say(me, 'Mệt quá, không chạy nổi…', 1500); }
    const speed = ROAM.SPEED * (running ? ROAM.RUN : 1) * (P.speed ? P.speed(W) : 1);   // P.speed: đi xe máy
    if (!W.busy && !W.toast) {
      const d = inputDir();
      if (d.x || d.y) { vx = d.x * speed * dt; vy = d.y * speed * ROAM.DEPTH * dt; roamStep(H, me, vx, vy); }
      else if (W.path && W.path.length) {
        const tg = W.path[0], dx = tg.x - me.x, dy = tg.y - me.y, dist = Math.hypot(dx, dy), step = speed * dt;
        if (dist <= Math.max(1, step)) { me.x = tg.x; me.y = tg.y; W.path.shift(); if (!W.path.length) { W.path = null; const a = W.arrive; W.arrive = null; if (a) a(); } }
        else { vx = dx / dist * step; vy = dy / dist * step; if (!roamStep(H, me, vx, vy)) { W.path = null; W.arrive = null; } }
      }
    }
    const moving = Math.abs(vx) + Math.abs(vy) > 0.01;
    if (moving) {
      if (Math.abs(vx) > .02 && (vx < 0) !== !!me.left) C.face(me, vx < 0);
      put(me, me.x, me.y);
      const gait = W.riding ? 'act-ride' : running ? 'act-walk act-run' : 'act-walk', css = Math.round(STAGE.STEP * me.s * (running ? 3 : 2) / speed * 1000) + 'ms';
      if (!W.moving || gait !== W.gait) { C.act(me, gait); W.moving = true; W.gait = gait; } if (css !== stepCss) { stepCss = css; me.el.querySelector('.cb').style.setProperty('--step', css); }
      depthSort();
      // chạy tốn năng lượng: chạy liên tục RUN_SEC giây thì −RUN_ENERGY
      if (running) { W.runT += dt; if (W.runT >= ROAM.RUN_SEC) { W.runT -= ROAM.RUN_SEC; S.energy -= ROAM.RUN_ENERGY; clampAll(); updateHUD(); } }
      if (W.tut) { if (W.tut.k === 0 && Math.hypot(me.x - W.tut.x, me.y - W.tut.y) > 30) tutNext(); else if (W.tut.k === 1 && running && (W.tut.run += dt) > .6) tutNext(); }
    } else if (W.moving) { W.moving = false; W.gait = ''; if (!W.busy) C.act(me, W.riding ? 'act-ride' : ''); }
    if (!wantRun) W.tired = false;
    // camera bám theo nhân vật
    const target = Math.max(0, Math.min(H.W - ROAM.VIEW_W, me.x - ROAM.VIEW_W / 2));
    const cam = C.still ? target : W.cam + (target - W.cam) * Math.min(1, dt * 7);
    if (Math.abs(cam - W.cam) > .05 || W.cam === 0 && cam !== 0) { W.cam = Math.abs(target - cam) < .05 ? target : cam; $w('.w-cam').setAttribute('transform', `translate(${-W.cam.toFixed(2)} 0)`); placeMenu(); }
    // phòng đang đứng
    const room = (H.rooms.find(r => me.x >= r[1] && me.x < r[2]) || [''])[0];
    if (room !== W.room) { W.room = room; const rr = $w('.w-room'); rr.textContent = room; rr.classList.remove('pop'); void rr.offsetWidth; rr.classList.add('pop'); }
    // đồ vật hay người gần nhất
    if (!W.busy && !W.menu) {
      let best = null, bd = ROAM.NEAR;
      H.objs.forEach(o => { const dd = Math.hypot(o.spot.x - me.x, (o.spot.y - me.y) * 1.4); if (dd < bd) { bd = dd; best = { o }; } });
      W.npcs.forEach(a => { const dd = Math.hypot(a.x - me.x, (Math.max(ROAM.Y0, a.y) - me.y) * 1.2); if (dd < bd + 10) { bd = dd - 10; best = { npc:a }; }
        if (dd < ROAM.GREET_R && !W.greeted[a.id] && !a.home.lie) { W.greeted[a.id] = true; C.face(a, me.x < a.x); C.say(a, pick(NPC_QUIP[a.who] || ['Chào!']), 1500); } });
      const same = best && W.near && (best.o ? best.o === W.near.o : best.npc === W.near.npc);
      if (!same && (best || W.near)) { W.near = best; showPrompt(); }
      if (W.tut && W.tut.k === 2 && best) tutNext();
      else if (best && moving) Object.assign($w('.w-prompt').style, scr(anchor(best).x, anchor(best).y));
      else if (best && Math.abs(cam - target) > .05) Object.assign($w('.w-prompt').style, scr(anchor(best).x, anchor(best).y));
    }
    if (now - W.lastSave > 3000) { W.lastSave = now; saveRoam(); }
    W.raf = requestAnimationFrame(frame);
  }
  function saveRoam(noWrite){ const at = W.rest || me; S.roam = { d:S.day, bg:S.bg, place:pk, key, t:Math.round(W.t), x:Math.round(at.x), y:Math.round(at.y) };
    (S.roamPos = S.roamPos || {})[pk] = { d:S.day, x:Math.round(at.x), y:Math.round(at.y) }; if (!noWrite) save(); }   // noWrite: chỉ ghi vào S, lát nữa game tự lưu
  W.cam = Math.max(0, Math.min(H.W - ROAM.VIEW_W, me.x - ROAM.VIEW_W / 2)); $w('.w-cam').setAttribute('transform', `translate(${-W.cam} 0)`);
  W.raf = requestAnimationFrame(frame);
  return W;
}
// Rời thế giới (sang cảnh khác): thả phím, ngừng bắt phím
function roamLeave(){ if (WORLD) { if (WORLD.raf) cancelAnimationFrame(WORLD.raf); WORLD = null; } INPUT.on = false; INPUT.onKey = null; INPUT.onMove = null; inputClear(); }
// Để kiểm thử: thông tin thế giới đang mở
const ROAM_DEBUG = () => WORLD && { x:WORLD.me.x, y:WORLD.me.y, t:WORLD.t, end:WORLD.end, cam:WORLD.cam, near:WORLD.near ? (WORLD.near.o ? WORLD.near.o.id : WORLD.near.npc.who) : null,
  menu:!!WORLD.menu, toast:WORLD.toast, busy:WORLD.busy, act:WORLD.me.el.querySelector('.cb').getAttribute('class'), room:WORLD.room, left:!!WORLD.me.left, scale:WORLD.me.s };
