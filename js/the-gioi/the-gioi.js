/* =========================================================
   v14: THẾ GIỚI TỰ DO TRONG NHÀ
   Người chơi tự đi lại bằng bàn phím hoặc joystick, chạm vào đồ vật để nhân vật tự đi đến,
   đứng gần thì nhấn E. Đồng hồ trong game chạy liên tục (kể cả lúc đi lại) trong khung giờ của buổi;
   dùng một đồ vật chính (giường, máy tính, bếp…) thì đồng hồ quay nhanh đến cuối buổi, giống như trước.
   Hình nhân vật, động tác, bong bóng thoại dùng lại lõi sân khấu (san-khau.js).
   ========================================================= */
let WORLD = null;       // thế giới đang mở (null khi không ở trong nhà)
let ROAM_NOW = null;    // giờ hiện tại trong thế giới, để nhật ký ghi đúng giờ (xem feedTime)

function roamHTML(ref){
  const H = house();
  const hits = H.objs.map(o => `<rect class="w-obj" data-o="${o.id}" x="${o.hit[0]}" y="${o.hit[1]}" width="${o.hit[2] - o.hit[0]}" height="${o.hit[3] - o.hit[1]}" rx="6"/>`).join('');
  return `<div class="panel stage world" id="world" data-house="${S.bg}">
    <svg viewBox="0 0 ${ROAM.VIEW_W} ${ROAM.VIEW_H}" data-w="${H.W}" role="img" aria-label="${esc(H.name)}: tự đi lại và dùng đồ vật">
      <g class="w-cam">${H.paint()}${H.deco()}<g class="w-hits">${hits}</g><g class="L-world"></g><rect class="w-tint" x="0" y="0" width="${H.W}" height="${ROAM.VIEW_H}" fill="#121836" opacity="0" pointer-events="none"/><g class="L-say"></g></g>
    </svg>
    <div class="w-hud"><span class="w-clock" aria-live="off">🕘 <b>--:--</b></span><span class="w-left" aria-hidden="true"><i></i></span><span class="w-room"></span></div>
    <button class="w-prompt" type="button" hidden></button>
    <div class="w-menu" role="menu" hidden></div>
    <div class="w-help" hidden></div>
  </div>
  <div class="w-pad" hidden><div class="w-joy" aria-hidden="true"><i class="w-knob"></i></div><span class="w-padhint">Kéo vòng tròn để đi<br>Chạm vào đồ vật để tự đi tới</span><button class="w-use" type="button" disabled aria-label="Dùng đồ vật">✋</button></div>
  <div class="w-toast" role="status" hidden></div>`;
}

function roamMount(root, ref){
  const el = root.querySelector('#world'); if (!el) return;
  const H = house(), sc = current, C = stageCore(el), svg = C.svg;
  const [h0, h1] = roamSpan(ref), key = roamKey(ref), keep = S.roam && S.roam.d === S.day && S.roam.bg === S.bg;
  const W = WORLD = { ref, sc, H, C, el, svg, cam:0, t: keep && S.roam.key === key ? Math.max(h0 * 60, Math.min(h1 * 60 - 1, S.roam.t)) : h0 * 60, end:h1 * 60,
    busy:false, path:null, arrive:null, menu:null, toast:false, near:null, moving:false, greeted:{}, npcs:[], lastSave:0, room:'', minute:-1 };
  const $w = s => el.querySelector(s) || root.querySelector(s);
  const run = C.run, alive = () => C.alive() && WORLD === W;

  /* --- nhân vật --- */
  const start = keep && roamFree(H, S.roam.x, S.roam.y) ? { x:S.roam.x, y:S.roam.y } : H.spawn;
  const me = W.me = C.add('me', start.x, start.y, 'world', '', undefined, { s:roamScale(start.y) });
  const cast = H.cast || {};
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
    const wm = document.querySelector('#who .who-meta'); if (wm) wm.textContent = wm.textContent.replace(/\d\d:\d\d/, clockMin(m));   // dòng giờ ở đầu trang cũng chạy theo
    $w('.w-left i').style.width = Math.max(0, Math.min(100, (W.end - W.t) / (W.end - h0 * 60) * 100)) + '%';
    if (m % 5 === 0 || W.minute < 0) light();
  };
  W.minute = -2; hud(); light();

  /* --- phần hiển thị trên khung (gợi ý, thực đơn, kết quả) --- */
  const scr = (x, y) => ({ left:((x - W.cam) / ROAM.VIEW_W * 100) + '%', top:(y / ROAM.VIEW_H * 100) + '%' });
  const anchor = n => n.npc ? { x:n.npc.x, y:n.npc.y - 140 * n.npc.s - 6 } : { x:(n.o.hit[0] + n.o.hit[2]) / 2, y:Math.max(14, n.o.hit[1] - 4) };
  const label = n => {
    const list = n.npc ? npcEntries(ref, sc, n.npc.who) : objEntries(ref, sc, n.o), main = list.filter(e => !e.minor || e.greet);
    if (n.npc) return `${n.npc.who === 'tung' ? '🍺' : '👪'} ${esc(NPC[n.npc.who].name)}`;
    if (!main.length && !list.length) return `${n.o.icon} ${objIdle(ref, n.o)}`;
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
    const list = n.npc ? npcEntries(ref, sc, n.npc.who) : objEntries(ref, sc, n.o);
    if (!list.length) { C.say(me, objIdle(ref, n.o).replace(/^\S+\s/, ''), 1400); return; }
    W.menu = { n, list }; const m = $w('.w-menu');
    m.innerHTML = `<div class="w-mh">${n.npc ? esc(NPC[n.npc.who].name) : `${n.o.icon} ${esc(n.o.name)}`}<button type="button" class="w-x" aria-label="Đóng">✕</button></div>`
      + list.map((e, k) => `<button type="button" role="menuitem" class="w-act ${e.minor ? 'minor' : ''}" data-k="${k}" ${e.off ? 'disabled' : ''}><span class="wi">${e.icon || '•'}</span><span class="wl">${esc(e.label)}</span>`
        + `${e.cost ? `<span class="wc">${e.off ? e.why : fmt(e.cost)}</span>` : e.minor && e.min ? `<span class="wc">${e.min} phút</span>` : ''}<kbd>${k + 1}</kbd></button>`).join('');
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
    const x = u.x ?? o.spot.x, y = u.y ?? o.spot.y; W.rest = o.spot;      // đứng dậy thì về chỗ đứng trước đồ vật
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
      C.say(me, GREET[a.who] || 'Chào!', 1200); SFX.play('talk'); await C.wait(C.still ? 0 : 1000); if (!alive()) return;
      if (a.home.lie) C.say(a, 'Khò… khò…', 1400); else { C.react(a, 'nod'); C.say(a, pick(NPC_QUIP[a.who] || ['Ừ.']), 1500); }
      await C.wait(C.still ? 0 : 1200); if (!alive()) return; W.busy = false; showPrompt(); return;
    }
    const o = n.o;
    if (e.minor) {
      pose(o, true); await spin(Math.min(W.end - 1, W.t + e.min), 700); if (!alive()) return;
      ROAM_NOW = W.t / 60; const line = e.fx(); ROAM_NOW = null; pose(o, false); updateHUD(); C.say(me, line, 1600);
      W.busy = false; showPrompt(); saveRoam(); return;
    }
    if (o.use.exit) {                                          // ra khỏi nhà: mở cửa, bước ra, rồi sang cảnh bên ngoài như cũ
      C.door(true); SFX.play('pop'); me.el.classList.add('gone'); await C.wait(C.still ? 0 : 500); if (!alive()) return;
      await spin(W.end, 600); if (!alive()) return; ROAM_NOW = W.t / 60; saveRoam(true); choose(e.i); ROAM_NOW = null; return;
    }
    pose(o, true);
    if (o.use.sweep && !C.still) (async () => { const [a, b] = o.use.sweep; me.speed = 44; C.act(me, 'act-sweep'); while (W.spin && alive()) { put(me, a + Math.random() * (b - a), 178); C.act(me, 'act-sweep'); await C.wait(400); } })();
    await spin(e.bed ? W.t : W.end, ROAM.ACT_MS); if (!alive()) return;
    if (e.bed !== undefined) { const h = typeof e.bed === 'number' ? e.bed : Math.max(W.t / 60, bedOptsMin() - .5); return commit(bedChoice({ h:Math.round(h * 4) / 4, icon:'🛌', label:`Đi ngủ lúc ${clock(h)}` }), pre); }
    commit(sc.choices[e.i], pre);
  }
  async function timeUp(){
    W.busy = true; W.path = null; closeMenu();
    const r = roamTimeoutChoice(ref, sc);
    C.say(me, ref.id === 'bedtime' ? 'Buồn ngủ quá…' : 'Ơ, hết giờ rồi à?', 1400); await C.wait(C.still ? 0 : 1300); if (!alive()) return;
    if (r.bed) { const o = H.objs.find(x => x.kind === 'bed'); pose(o, true); return commit(bedChoice({ h:r.bed, icon:'🦉', label:'Ngủ gục lúc 02:00' })); }
    if (r.i < 0) { S.cur = null; return advance(); }
    const ch = sc.choices[r.i], o = H.objs.find(x => x.kind === choiceObj(ref, ch));
    if (o && !o.use.exit) pose(o, true);
    if (o && o.use.exit) return choose(r.i);
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
  INPUT.onMove = () => { if (!alive()) return; W.path = null; W.arrive = null; if (W.menu) closeMenu(); hideHelp(); };
  INPUT.onKey = e => {
    if (!alive()) return false;
    if (W.toast) { const b = $w('.w-toast button'); if (b && (e.code === 'KeyE' || (['Space','Enter'].includes(e.code) && document.activeElement !== b))) { b.click(); return true; } return false; }
    if (W.busy) return false;
    if (W.menu) {
      if (e.code === 'Escape') { closeMenu(); return true; }
      const d = e.code.match(/^(?:Digit|Numpad)([1-9])$/); if (d) { const k = +d[1] - 1; if (W.menu.list[k]) doEntry(W.menu.n, W.menu.list[k]); return true; }
      if (e.code === 'KeyE') { const k = W.menu.list.findIndex(x => !x.off); if (k >= 0) doEntry(W.menu.n, W.menu.list[k]); return true; }
      return false;
    }
    if (e.code === 'KeyE' && W.near) { openMenu(W.near); hideHelp(); return true; }
    return false;
  };

  /* --- lời nhắc cách chơi (lần đầu) --- */
  const help = $w('.w-help');
  function hideHelp(){ if (!help.hidden) { help.hidden = true; S.once.roamHelp = true; } }
  if (touchFirst()) { $w('.w-pad').hidden = false; joyMount($w('.w-joy')); }       // điện thoại: joystick và nút dùng đồ nằm dưới khung, không che cảnh
  else if (!S.once.roamHelp) { help.innerHTML = '<kbd>WASD</kbd> hoặc mũi tên để đi · <kbd>E</kbd> để dùng đồ · bấm vào đồ vật để tự đi tới'; help.hidden = false; C.later(hideHelp, 9000); }

  /* --- vòng lặp 60 hình mỗi giây --- */
  let last = performance.now(), stepCss = '';
  const paused = () => document.hidden || inputBusy(null) || W.toast || !!W.menu;
  function frame(now){
    if (!alive()) { if (WORLD === W) { WORLD = null; INPUT.on = false; } return; }
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    // đồng hồ
    if (W.spin) { const k = Math.min(1, (now - W.spin.t0) / W.spin.ms); W.t = W.spin.from + (W.spin.to - W.spin.from) * k; if (k >= 1) { const r = W.spin.res; W.spin = null; r(); } }
    else if (!W.busy && !paused()) { W.t += dt * ROAM.MIN_PER_SEC; if (W.t >= W.end) { W.t = W.end; timeUp(); } }
    hud();
    // di chuyển
    let vx = 0, vy = 0;
    if (!W.busy && !W.toast) {
      const d = inputDir();
      if (d.x || d.y) { vx = d.x * ROAM.SPEED * dt; vy = d.y * ROAM.SPEED * ROAM.DEPTH * dt; roamStep(H, me, vx, vy); }
      else if (W.path && W.path.length) {
        const tg = W.path[0], dx = tg.x - me.x, dy = tg.y - me.y, dist = Math.hypot(dx, dy), step = ROAM.SPEED * dt;
        if (dist <= Math.max(1, step)) { me.x = tg.x; me.y = tg.y; W.path.shift(); if (!W.path.length) { W.path = null; const a = W.arrive; W.arrive = null; if (a) a(); } }
        else { vx = dx / dist * step; vy = dy / dist * step; if (!roamStep(H, me, vx, vy)) { W.path = null; W.arrive = null; } }
      }
    }
    const moving = Math.abs(vx) + Math.abs(vy) > 0.01;
    if (moving) {
      if (Math.abs(vx) > .02 && (vx < 0) !== !!me.left) C.face(me, vx < 0);
      put(me, me.x, me.y);
      const css = Math.round(STAGE.STEP * me.s * 2 / ROAM.SPEED * 1000) + 'ms';
      if (!W.moving) { C.act(me, 'act-walk'); W.moving = true; } if (css !== stepCss) { stepCss = css; me.el.querySelector('.cb').style.setProperty('--step', css); }
      depthSort();
    } else if (W.moving) { W.moving = false; if (!W.busy) C.act(me, ''); }
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
      else if (best && moving) Object.assign($w('.w-prompt').style, scr(anchor(best).x, anchor(best).y));
      else if (best && Math.abs(cam - target) > .05) Object.assign($w('.w-prompt').style, scr(anchor(best).x, anchor(best).y));
    }
    if (now - W.lastSave > 3000) { W.lastSave = now; saveRoam(); }
    W.raf = requestAnimationFrame(frame);
  }
  function saveRoam(noWrite){ const at = W.rest || me; S.roam = { d:S.day, bg:S.bg, key, t:Math.round(W.t), x:Math.round(at.x), y:Math.round(at.y) }; if (!noWrite) save(); }   // noWrite: chỉ ghi vào S, lát nữa game tự lưu
  W.cam = Math.max(0, Math.min(H.W - ROAM.VIEW_W, me.x - ROAM.VIEW_W / 2)); $w('.w-cam').setAttribute('transform', `translate(${-W.cam} 0)`);
  W.raf = requestAnimationFrame(frame);
  return W;
}
// Rời thế giới (sang cảnh khác): thả phím, ngừng bắt phím
function roamLeave(){ if (WORLD) { if (WORLD.raf) cancelAnimationFrame(WORLD.raf); WORLD = null; } INPUT.on = false; INPUT.onKey = null; INPUT.onMove = null; inputClear(); }
// Để kiểm thử: thông tin thế giới đang mở
const ROAM_DEBUG = () => WORLD && { x:WORLD.me.x, y:WORLD.me.y, t:WORLD.t, end:WORLD.end, cam:WORLD.cam, near:WORLD.near ? (WORLD.near.o ? WORLD.near.o.id : WORLD.near.npc.who) : null,
  menu:!!WORLD.menu, toast:WORLD.toast, busy:WORLD.busy, act:WORLD.me.el.querySelector('.cb').getAttribute('class'), room:WORLD.room, left:!!WORLD.me.left, scale:WORLD.me.s };
