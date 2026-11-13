/* =========================================================
   MÀN HÌNH MỞ ĐẦU: GÓC PHỐ HÀ THÀNH ĐANG SỐNG (v13)
   - Khung cảnh dùng lại bộ máy cảnh sống (stageCore): người đi bộ hai chiều trên vỉa hè, xe máy hai làn,
     quán trà đá có khách, hàng rong, bạn bè đi ngang chào nhân vật chính.
   - Trời, nắng, đèn đường đổi theo giờ thật trên máy người chơi.
   - Âm thanh 8-bit: nhạc nền, tiếng phố, còi xe, tiếng rao, tiếng cười; chỉ bật sau lần chạm đầu tiên.
   - Thẻ "Chơi tiếp" tóm tắt bản lưu.
   Không đổi luật chơi. Rời màn hình là mọi hoạt cảnh, hẹn giờ và âm thanh đều dừng.
   ========================================================= */
const TITLE = {
  LAYOUT: 'a',              // 'a': khung cảnh ở trên, chữ bên dưới; 'b': khung cảnh tràn viền, tên game nằm trên trời
  WALK: [36, 56],           // tốc độ người đi bộ (đơn vị hình mỗi giây)
  BIKE: [118, 138],         // tốc độ xe máy của hai làn
  SPAWN: [700, 2000],       // khoảng cách giữa hai lần có người mới xuất hiện (mili giây)
  BIKE_GAP: [1100, 3200],   // khoảng cách giữa hai xe máy
  MAX_WALKERS: 5, MAX_BIKES: 3,
  MUSIC_VOL: 1,             // độ to của nhạc nền (0 đến 1); tiếng phố và âm thanh sự kiện không đổi
  FRIEND_EVERY: [9000, 16000], VENDOR_EVERY: [14000, 24000], PARK_EVERY: [16000, 26000],
};
// Giờ thật trên máy người chơi → buổi trong ngày
function titleSlot(){ const h = new Date().getHours(); return h >= 5 && h < 10 ? 'morning' : h < 13 ? 'noon' : h < 17 ? 'afternoon' : h < 19 ? 'evening' : 'night'; }
const SHOPS = [['Phở', '#C0392B'], ['Tạp hóa', '#2F6FD1'], ['Cơm', '#E67E22'], ['Sửa xe', '#4A5568'], ['Trà sữa', '#B5838D'], ['Cắt tóc', '#2F8257'], ['Bánh mì', '#B9813E']];

/* ----- Vẽ góc phố ----- */
function titleSceneSVG(slot){
  const sky = SKY[slot], night = slot === 'night', eve = slot === 'evening', lit = night || eve;
  const houses = [[0, 44, 46, '#F2C14E'], [44, 50, 34, '#E07A5F'], [94, 46, 54, '#81B29A'], [140, 52, 30, '#F4E1C1'], [192, 44, 48, '#3D5A80'], [236, 50, 38, '#F2A65A'], [286, 42, 56, '#C3B1E1'], [328, 40, 40, '#9CC5A1']];
  let s = `<defs><radialGradient id="tLamp"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient></defs>
    <rect width="360" height="250" fill="${sky}"/>`;
  if (night) for (let i = 0; i < 18; i++) s += `<circle class="twinkle" style="animation-delay:${(i * 0.37) % 3}s" cx="${(i * 53) % 360}" cy="${6 + (i * 29) % 46}" r="${i % 3 ? 1 : 1.5}" fill="#fff"/>`;
  s += night ? '<circle cx="300" cy="24" r="10" fill="#FFF3B0"/><circle cx="305" cy="21" r="9" fill="' + sky + '"/>' : `<circle cx="${slot === 'morning' ? 60 : slot === 'noon' ? 180 : 300}" cy="${slot === 'noon' ? 18 : 30}" r="12" fill="${eve ? '#FFB067' : '#FFF3B0'}"/>`;
  s += `<g class="env"><g class="cloud"><ellipse cx="40" cy="22" rx="20" ry="7" fill="#fff" opacity="${night ? .25 : .9}"/><ellipse cx="54" cy="18" rx="12" ry="7" fill="#fff" opacity="${night ? .25 : .9}"/></g>
    <g class="cloud c2"><ellipse cx="160" cy="34" rx="16" ry="5" fill="#fff" opacity="${night ? .2 : .8}"/></g></g>`;
  if (slot === 'morning' || slot === 'noon') s += '<g class="birds"><path class="bird" d="M0 0 q4 -4 8 0 q4 -4 8 0" stroke="#3B3F4A" stroke-width="1.4" fill="none"/><path class="bird b2" d="M0 0 q3 -3 6 0 q3 -3 6 0" stroke="#3B3F4A" stroke-width="1.2" fill="none"/></g>';
  // dãy nhà ống: cửa sổ (tối thì sáng đèn), ban công, biển hiệu tầng trệt
  houses.forEach(([x, w, top, c], i) => {
    s += `<rect x="${x}" y="${top}" width="${w}" height="${150 - top}" fill="${c}"/><rect x="${x}" y="${top}" width="${w}" height="4" fill="#00000018"/>`;
    for (let r = top + 10; r < 112; r += 24) for (let k = 0; k < 2; k++) {
      const on = lit && (i * 3 + r + k * 7) % 5 < 3;
      s += `<rect x="${x + 7 + k * (w - 24)}" y="${r}" width="10" height="13" rx="1" fill="${on ? '#FFE08A' : '#fff'}" opacity="${on ? .95 : .65}"/>`;
    }
    s += `<rect x="${x + 3}" y="${118}" width="${w - 6}" height="3" fill="#5B4636" opacity=".6"/>`;
    const [name, sc] = SHOPS[i % SHOPS.length];
    s += `<rect x="${x + 4}" y="124" width="${w - 8}" height="12" rx="2" fill="${sc}" ${lit ? 'class="sign-on"' : ''}/>${T(x + w / 2, 133, name, '#fff', 7.5)}<rect x="${x + 8}" y="138" width="${w - 16}" height="12" fill="#3B3F4A" opacity=".55"/>`;
  });
  // dây điện có chim đậu, cột đèn, cây bàng
  s += `<path d="M0 46 Q90 64 180 50 T360 52" stroke="#2B2B2B" stroke-width="1.3" fill="none"/><path d="M0 54 Q100 74 200 58 T360 62" stroke="#2B2B2B" stroke-width="1" fill="none"/>
    ${night ? '' : '<g class="perch"><circle cx="122" cy="56" r="2.6" fill="#3B3F4A"/><circle cx="124" cy="54.5" r="1.6" fill="#3B3F4A"/></g>'}
    <rect x="196" y="78" width="3" height="122" fill="#4A5568"/><path d="M197 80 q12 -6 18 2" stroke="#4A5568" stroke-width="3" fill="none"/><rect x="209" y="80" width="12" height="5" rx="2" fill="${lit ? '#FFE08A' : '#CBD2DC'}"/>
    ${lit ? '<ellipse cx="215" cy="160" rx="56" ry="42" fill="url(#tLamp)"/>' : ''}
    <rect x="316" y="92" width="9" height="106" fill="#6B5040"/><ellipse cx="320" cy="92" rx="38" ry="26" fill="#4E9B5E"/><ellipse cx="300" cy="102" rx="22" ry="14" fill="#3E8A50"/><ellipse cx="342" cy="100" rx="20" ry="14" fill="#3E8A50"/>
    <g class="leaves"><path class="leaf" d="M0 0 q4 -3 8 0 q-4 3 -8 0" fill="#C9772E"/><path class="leaf l2" d="M0 0 q4 -3 8 0 q-4 3 -8 0" fill="#7FB34E"/><path class="leaf l3" d="M0 0 q4 -3 8 0 q-4 3 -8 0" fill="#D9A441"/></g>`;
  // vỉa hè, mép đường, lòng đường
  s += `<rect y="150" width="360" height="50" fill="#D9CDB8"/>${Array.from({ length:12 }, (_, i) => `<path d="M${i * 32} 150 L${i * 32 - 10} 200" stroke="#C7B9A0" stroke-width="1"/>`).join('')}<path d="M0 174 H360" stroke="#C7B9A0" stroke-width="1"/>
    <rect y="200" width="360" height="4" fill="#A79A85"/><rect y="204" width="360" height="46" fill="${night ? '#4F5663' : '#6E7684'}"/><path d="M0 230 H360" stroke="#fff" stroke-width="2" stroke-dasharray="14 12" opacity=".55"/>`;
  // quán trà đá: biển bìa, bàn thấp, ấm trà bốc hơi
  s += `<rect x="52" y="98" width="40" height="15" rx="1" fill="#F3E3C3" stroke="#B89B5E" transform="rotate(-3 72 105)"/>${T(72, 109, 'Trà đá', '#8C5A3C', 8.5)}
    <rect x="58" y="160" width="34" height="4" rx="1" fill="#2F6FD1"/><rect x="61" y="164" width="3" height="9" fill="#2F6FD1"/><rect x="86" y="164" width="3" height="9" fill="#2F6FD1"/>
    <rect x="63" y="152" width="5" height="8" fill="#E3A447" opacity=".9"/><rect x="80" y="153" width="5" height="7" fill="#E3A447" opacity=".9"/><path d="M70 160 h8 v-6 q-4 -4 -8 0z" fill="#8C8C8C"/>
    <g class="steam"><path d="M73 150 q-3 -4 0 -8 q3 -4 0 -8" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/></g>`;
  return `<svg viewBox="0 0 360 250" role="img" aria-label="Góc phố Hà Thành">${s}<g class="L-back"></g><g class="L-aisle"></g><g class="L-front"></g><g class="L-road"></g>${eve ? '<rect width="360" height="250" fill="#FF8A4C" opacity=".1" pointer-events="none"/>' : night ? '<rect width="360" height="250" fill="#121836" opacity=".22" pointer-events="none"/>' : ''}<g class="L-say"></g></svg>`;
}

/* ----- Âm thanh 8-bit: nhạc nền, tiếng phố, âm thanh theo sự kiện ----- */
const TA = { on:false, vol:0, timers:[], bar:0 };
const N_ = { G4:392, A4:440, C5:523, D5:587, E5:659, G5:784, A5:880, C6:1047, F2:87, G2:98, A2:110, C3:131, D3:147, E3:165, G3:196 };
const TUNE = {
  lead: [['E5','G5','A5','G5','E5','D5','C5','D5'], ['E5','E5','G5',0,'A5','G5','E5',0], ['D5','E5','G5','A5','C6','A5','G5','E5'], ['D5',0,'C5','D5','E5',0,0,0]],
  bass: [['C3','G3','C3','G3'], ['A2','E3','A2','E3'], ['F2','C3','F2','C3'], ['G2','D3','G2','D3']],
  EIGHTH: .2,
};
function tTone(f, t0, dur, type, vol, f2){ if (TA.vol > 0 && SFX.on && SFX.raw) SFX.raw.tone(f, t0, dur, type, vol * TA.vol, f2); }
function tNoise(t0, dur, vol, freq){ if (TA.vol > 0 && SFX.on && SFX.raw) SFX.raw.noise(t0, dur, vol * TA.vol, freq); }
const TSND = {
  horn:  () => { tTone(440, 0, .11, 'square', .06); tTone(554, .12, .16, 'square', .06); },
  bell:  () => { tTone(2093, 0, .45, 'sine', .06); tTone(2637, .02, .35, 'sine', .03); },
  rao:   () => [523, 659, 784, 659].forEach((f, i) => tTone(f, i * .13, .12, 'square', .05)),
  laugh: () => [700, 560, 720, 580, 740].forEach((f, i) => tTone(f, i * .08, .07, 'triangle', .07)),
  chirp: () => [0, .14, .28].forEach(t => tTone(2600, t, .06, 'sine', .04, 3400)),
  hi:    () => { tTone(660, 0, .08, 'square', .05); tTone(880, .09, .12, 'square', .05); },
  vroom: () => tTone(120, 0, .9, 'sawtooth', .025, 70),
};
function titleSound(name){ if (TA.on) try { TSND[name](); } catch (e) {} }
function titleMusicBar(){
  const E = TUNE.EIGHTH, b = TA.bar++ % 4;
  const V = TITLE.MUSIC_VOL;
  TUNE.lead[b].forEach((n, i) => { if (n) tTone(N_[n], i * E, E * .9, 'square', .04 * V); });
  TUNE.bass[b].forEach((n, i) => tTone(N_[n], i * 2 * E, E * 1.8, 'triangle', .1 * V));
  for (let i = 0; i < 8; i++) tNoise(i * E, .03, (i % 2 ? .01 : .016) * V, 7000);
  [0, 4].forEach(i => tTone(120, i * E, .12, 'sine', .12 * V, 50));
}
function titleAudioStart(){
  if (TA.on || !SFX.on || !document.querySelector('.title-scene')) return;
  TA.on = true; TA.vol = .35; TA.bar = 0;               // bắt đầu nhỏ rồi to dần
  const up = setInterval(() => { TA.vol = Math.min(1, TA.vol + .1); if (TA.vol >= 1) clearInterval(up); }, 100); TA.timers.push(up);
  titleMusicBar(); TA.timers.push(setInterval(() => { if (!document.querySelector('.title-scene')) return titleAudioStop(true); titleMusicBar(); }, TUNE.EIGHTH * 8 * 1000));
  TA.timers.push(setInterval(() => { tNoise(0, 1.8, .025, 260); if (Math.random() < .35) TSND.vroom(); }, 1700));     // tiếng phố rì rầm, xe máy xa
  const slot = titleSlot(); if (slot === 'morning' || slot === 'noon') TA.timers.push(setInterval(() => { if (Math.random() < .5) TSND.chirp(); }, 4200));
  titleSoundBtn();
}
// Tắt âm thanh: nhỏ dần rồi dừng (now = dừng ngay)
function titleAudioStop(now){
  if (!TA.on) return;
  const stop = () => { TA.timers.forEach(clearInterval); TA.timers = []; TA.on = false; TA.vol = 0; titleSoundBtn(); };
  if (now) return stop();
  TA.timers.forEach(clearInterval); TA.timers = [];
  const down = setInterval(() => { TA.vol = Math.max(0, TA.vol - .15); if (TA.vol <= 0) { clearInterval(down); stop(); } }, 80); TA.timers.push(down);
}
function titleSoundBtn(){
  const b = document.getElementById('tSound'); if (!b) return;
  b.textContent = !SFX.on ? '🔇' : TA.on ? '🔊' : '🔈';
  b.setAttribute('aria-label', !SFX.on ? 'Bật âm thanh' : TA.on ? 'Tắt âm thanh' : 'Bật nhạc');
  const hint = document.getElementById('tHint'); if (hint) hint.hidden = TA.on || !SFX.on;
}

/* ----- Đạo diễn góc phố ----- */
let titleUnlock = null;
function titleStop(){
  stageStop(); titleAudioStop();
  if (titleUnlock) { document.removeEventListener('pointerdown', titleUnlock, true); document.removeEventListener('keydown', titleUnlock, true); titleUnlock = null; }
}
function titleMount(root, look){
  const C = stageCore(root), { A, still, alive, wait, later, layer, act, add, snap, face, say, react } = C, svg = C.svg;
  const rnd = (a, b) => a + Math.random() * (b - a), now = () => performance.now();
  // người chơi chạm lần đầu thì bật âm thanh (trình duyệt không cho tự phát)
  titleUnlock = e => { if (e.target.closest && e.target.closest('#resume, #fresh, #tSound')) return; titleAudioStart(); };
  document.addEventListener('pointerdown', titleUnlock, true); document.addEventListener('keydown', titleUnlock, true);

  // nhân vật chính đứng trước cửa hàng, hơi lệch phải
  const hero = add('me', 252, 162, 'back', '', 'happy', { look, s:.44 });
  // quán trà đá: hai người khách ngồi ghế nhựa, lần lượt nói và uống, thỉnh thoảng cùng cười
  const guests = [add('p', 50, 164, 'back', 'act-talk', 'happy', { id:'g1', look:PASSER_LOOKS[0], s:.42, dy:6 }), add('p', 100, 164, 'back', 'act-drink', 'happy', { id:'g2', look:PASSER_LOOKS[3], s:.42, dy:6 })];
  face(guests[1], true);
  // một xe máy đỗ sẵn bên đường
  const bikeEl = (look2, dir, rider) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'bike snap');
    g.innerHTML = `<g transform="scale(${dir < 0 ? -1 : 1} 1)">${bikeSVG()}<g class="rider" transform="translate(-3 -11) scale(.4) translate(-60 -140)" ${rider ? '' : 'style="display:none"'}><g class="cb cb-idle act-ride">${chibi(look2, 'neutral')}</g></g></g>`;
    layer('road').appendChild(g); return g;
  };
  const moveEl = (el, x, y, ms, curve) => { el.classList.toggle('snap', !ms); el.style.transitionDuration = (ms || 0) + 'ms'; el.style.transitionTimingFunction = curve || 'linear'; el.style.transform = `translate(${x}px, ${y}px)`; };
  const parked = { el:bikeEl(PASSER_LOOKS[2], 1, false), x:150, look:PASSER_LOOKS[2] }; moveEl(parked.el, 150, 214);
  if (still) { add('p', 140, 178, 'aisle', '', 'neutral', { id:'w1', look:PASSER_LOOKS[1], s:.45 }); add('p', 300, 194, 'front', '', 'neutral', { id:'w2', look:PASSER_LOOKS[4], s:.5 }); face(A.w2, true); return; }

  /* --- người đi bộ: hai làn ngược chiều; trong một làn, người đi sau không bao giờ nhanh hơn người đi trước --- */
  const lanes = [{ y:178, dir:1, lay:'aisle', s:.45, list:[], block:0 }, { y:194, dir:-1, lay:'front', s:.5, list:[], block:0 }];
  const xAt = w => w.stop != null && now() >= w.tStop ? w.stop : w.x0 + w.dir * w.speed * (now() - w.t0) / 1000;
  const startX = L => L.dir > 0 ? -22 : 382, endX = L => L.dir > 0 ? 384 : -24;
  let pid = 0;
  const laneFree = (L, need = 46) => L.block === 0 && L.list.every(w => (xAt(w) - startX(L)) * L.dir >= need);
  const slowest = L => L.list.reduce((m, w) => Math.min(m, w.stop != null ? 0 : w.speed), 999);
  // giữ riêng một làn cho một hoạt cảnh (hàng rong, bạn bè, chủ xe): không cho người mới vào, chờ những người đang đi ra hết
  const claim = async (L, max = 60) => { if (L.block) return false; L.block++; for (let i = 0; i < max && L.list.length; i++) if (!await wait(300)) return false; if (L.list.length) { L.block--; return false; } return true; };
  // cho một người đi từ đầu đến cuối làn (hoặc tới điểm dừng); trả về khi đi xong
  const cross = async (L, w, a, until) => {
    const to = until ?? endX(L); a.speed = w.speed; a.el.style.transitionTimingFunction = 'linear';
    void a.el.getBoundingClientRect();                                // người vừa xuất hiện: để trình duyệt ghi nhận vị trí đầu rồi mới cho đi
    w.x0 = a.x; w.t0 = now(); w.dir = L.dir;
    const ok = await C.walk(a, to, L.y, { act:w.act, keep:!!w.act });
    return ok;
  };
  const walker = async (L, kind) => {
    if (L.list.length >= 4 || Object.keys(A).length > 15) return;
    const id = 'w' + (++pid), look2 = pick(PASSER_LOOKS), cap = slowest(L);
    let speed = rnd(...TITLE.WALK), actName = '', extra = '';
    if (kind === 'run') { if (L.list.length) return; speed = 96; actName = 'act-walk act-run'; }
    if (kind === 'phone') actName = 'act-walk act-phone';
    speed = Math.min(speed, cap); if (speed < 24) return;
    const a = add('p', startX(L), L.y, L.lay, '', 'neutral', { id, look:look2, s:L.s }); a.el.querySelector('.cb').style.setProperty('--step', Math.round(2 * 27 * L.s / speed * 1000) + 'ms');
    if (kind === 'dog') { const dg = document.createElementNS('http://www.w3.org/2000/svg', 'g'); dg.setAttribute('class', 'dog'); dg.innerHTML = '<path d="M92 112 L140 126" stroke="#8C5A3C" stroke-width="1.6"/><g class="dog-body"><ellipse cx="150" cy="128" rx="13" ry="7" fill="#E3B27A"/><circle cx="163" cy="122" r="6" fill="#E3B27A"/><path d="M165 117 l3 -5 l2 6z" fill="#B9813E"/><rect x="141" y="133" width="3" height="7" fill="#B9813E"/><rect x="155" y="133" width="3" height="7" fill="#B9813E"/><path d="M137 125 q-6 -6 -4 -10" stroke="#E3B27A" stroke-width="3" fill="none"/></g>'; a.el.querySelector('.flip').appendChild(dg); }
    face(a, L.dir < 0);
    const w = { a, speed, act:actName || null }; L.list.push(w);
    await cross(L, w, a);
    L.list = L.list.filter(x => x !== w); a.el.remove(); delete A[id];
  };
  // hàng rong gánh hàng: đi chậm, dừng giữa đường rao một câu (cả làn chờ phía sau)
  const vendor = async () => {
    const L = lanes[0]; if (!await claim(L)) return;
    const id = 'v' + (++pid), a = add('p', startX(L), L.y, L.lay, '', 'happy', { id, look:{ g:'nu', hair:'hair_bun', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'tee', color:'#7FB3D5' } }, s:L.s });
    const cb = a.el.querySelector('.cb'), g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'prop');
    g.innerHTML = '<path d="M-22 90 L142 90" stroke="#8C5A3C" stroke-width="4" stroke-linecap="round"/><path d="M-14 90 L-22 116 M-14 90 L-6 116 M134 90 L126 116 M134 90 L142 116" stroke="#8C5A3C" stroke-width="1.6"/><ellipse cx="-14" cy="120" rx="16" ry="7" fill="#C9A15B"/><ellipse cx="134" cy="120" rx="16" ry="7" fill="#C9A15B"/><path d="M-26 117 q12 -8 24 0 M122 117 q12 -8 24 0" fill="#E9C46A"/>';
    cb.appendChild(g);
    const hat = document.createElementNS('http://www.w3.org/2000/svg', 'path'); hat.setAttribute('d', 'M14 24 L60 -12 L106 24 Z'); hat.setAttribute('fill', '#E9D7A5'); hat.setAttribute('stroke', '#B89B5E'); a.el.querySelector('.cb-head').appendChild(hat);
    const w = { a, speed:28, act:null }; L.list.push(w);
    if (await cross(L, w, a, 168)) { w.stop = 168; w.tStop = now(); act(a, ''); titleSound('rao'); if (await say(a, pick(['Bánh mì nóng đây!', 'Xôi ngô, xôi lạc đây!', 'Ai cốm làng Vòng không?']), 1900)) { w.stop = null; await cross(L, w, a); } }
    L.list = L.list.filter(x => x !== w); a.el.remove(); delete A[id]; L.block--;
  };
  // bạn bè đi ngang: dừng lại chào nhân vật chính, nói một câu rồi đi tiếp
  const FRIENDS = [['tung', 'Ê! Trà đá không?'], ['linh', 'Hôm nay học gì chưa?'], ['mai', 'Đi làm à em?'], ['phong', 'Ông ơi, chờ tôi với!'], ['mom', 'Nhớ ăn sáng nhé con!']];
  const friend = async () => {
    const L = lanes[1]; if (!await claim(L)) return;
    const [who, line] = pick(FRIENDS), a = add(who, startX(L), L.y, L.lay, '', 'happy', { s:L.s }); face(a, true);
    const w = { a, speed:44, act:null }; L.list.push(w); titleSound('bell');
    if (await cross(L, w, a, hero.x + 34)) {
      w.stop = hero.x + 34; w.tStop = now(); face(a, true); face(hero, false);
      react(a, 'wave'); act(a, 'act-talk'); titleSound('hi');
      if (await say(a, line, 1700)) { act(a, 'act-listen'); react(hero, 'wave'); act(hero, 'act-talk'); if (await say(hero, pick(['Chào!', 'Hì, chào nhé!', 'Lát nữa nhé!']), 1300)) { act(hero, ''); act(a, ''); w.stop = null; await cross(L, w, a); } }
    }
    L.list = L.list.filter(x => x !== w); a.el.remove(); delete A[who]; L.block--; act(hero, '');
  };

  /* --- xe máy: hai làn ngược chiều, mỗi làn một tốc độ nên không bao giờ đâm vào nhau --- */
  const road = [{ y:226, dir:1, speed:TITLE.BIKE[0], list:[], block:0 }, { y:246, dir:-1, speed:TITLE.BIKE[1], list:[], block:0 }];
  const roadFree = R => R.block === 0 && R.list.every(b => now() - b.t0 > 90 / R.speed * 1000);
  const bike = async R => {
    if (R.list.length >= TITLE.MAX_BIKES || !roadFree(R)) return;
    const from = R.dir > 0 ? -50 : 410, to = R.dir > 0 ? 410 : -50, ms = Math.abs(to - from) / R.speed * 1000;
    const el = bikeEl(pick(PASSER_LOOKS), R.dir, true), b = { el, t0:now() }; el.classList.add('moving'); R.list.push(b);
    moveEl(el, from, R.y); void el.getBoundingClientRect(); moveEl(el, to, R.y, ms);
    if (Math.random() < .3) later(() => titleSound('horn'), ms * .4);
    await wait(ms); el.remove(); R.list = R.list.filter(x => x !== b);
  };
  // xe đỗ bên đường: chủ xe từ quán đi ra, lên xe, nổ máy rời đi; một lúc sau có xe khác tấp vào, người bước xuống đi vào phố
  const park = async () => {
    const R = road[0], L = lanes[1];
    if (parked.el) {
      if (R.block || !await claim(L)) return; R.block++;
      const a = add('p', startX(L), L.y, L.lay, '', 'neutral', { id:'own', look:parked.look, s:L.s }); face(a, true);
      const w = { a, speed:40, act:null }; L.list.push(w);
      if (await cross(L, w, a, parked.x + 6)) {
        L.list = L.list.filter(x => x !== w); a.el.remove(); delete A.own;
        const el = parked.el; el.querySelector('.rider').style.display = ''; titleSound('vroom');
        if (await wait(500)) { el.classList.add('moving'); moveEl(el, parked.x + 40, R.y, 700, 'ease-in'); if (await wait(700)) { moveEl(el, 410, R.y, (410 - parked.x) / R.speed * 1000); if (await wait((410 - parked.x) / R.speed * 1000)) el.remove(); } }
        parked.el = null;
      } else L.list = L.list.filter(x => x !== w);
      L.block--; R.block--; return;
    }
    if (R.block) return; R.block++; for (let i = 0; i < 20 && R.list.length; i++) if (!await wait(300)) return;
    if (R.list.length) { R.block--; return; }
    const look2 = pick(PASSER_LOOKS), el = bikeEl(look2, 1, true); el.classList.add('moving');
    moveEl(el, -50, R.y); void el.getBoundingClientRect(); moveEl(el, 150, 214, 2300, 'cubic-bezier(.2,.7,.35,1)');     // giảm tốc, tấp vào lề
    if (!await wait(2300)) return; el.classList.remove('moving'); R.block--;
    parked.el = el; parked.x = 150; parked.look = look2;
    if (!await wait(400)) return;
    for (let i = 0; i < 20 && !(laneFree(L, 0) && L.list.every(w => xAt(w) < 120)); i++) if (!await wait(300)) return;   // chờ vỉa hè trống chỗ rồi mới bước xuống
    el.querySelector('.rider').style.display = 'none';
    const a = add('p', 156, L.y, L.lay, 'act-getoff', 'neutral', { id:'p' + (++pid), look:look2, s:L.s }); face(a, true);
    const w = { a, speed:Math.min(42, slowest(L)), act:null }; L.list.push(w);
    if (await wait(430)) { act(a, ''); await cross(L, w, a); }
    L.list = L.list.filter(x => x !== w); a.el.remove(); delete A[a.id];
  };

  /* --- quán trà đá và nhân vật chính --- */
  (async () => { let t = 0; while (await wait(rnd(1600, 2600))) { t++; act(guests[0], t % 2 ? 'act-drink' : 'act-talk'); act(guests[1], t % 2 ? 'act-talk' : 'act-drink');
    if (t % 5 === 0) { act(guests[0], 'act-laugh'); act(guests[1], 'act-laugh'); titleSound('laugh'); if (!await wait(1100)) return; } } })();
  (async () => { while (await wait(rnd(5000, 9000))) { if (hero.act) continue; const r = Math.random();
    if (r < .35) { face(hero, Math.random() < .5); } else if (r < .6) { act(hero, 'act-phone'); if (!await wait(2600)) return; act(hero, ''); } else react(hero, pick(['stretch', 'nod'])); } })();

  /* --- lịch xuất hiện --- */
  const loop = async (gap, fn) => { while (await wait(rnd(...gap))) fn(); };
  walker(lanes[0], ''); later(() => walker(lanes[1], 'dog'), 600); later(() => bike(road[0]), 300); later(() => bike(road[1]), 1300);
  loop(TITLE.SPAWN, () => { const L = pick(lanes); const r = Math.random(); if (laneFree(L)) walker(L, r < .12 ? 'run' : r < .3 ? 'phone' : r < .4 ? 'dog' : ''); });
  loop(TITLE.BIKE_GAP, () => bike(pick(road)));
  (async () => { if (!await wait(4500)) return; friend(); loop(TITLE.FRIEND_EVERY, friend); })();
  (async () => { if (!await wait(9000)) return; vendor(); loop(TITLE.VENDOR_EVERY, vendor); })();
  (async () => { if (!await wait(13000)) return; park(); loop(TITLE.PARK_EVERY, park); })();
}

/* ----- Thẻ "Chơi tiếp": tóm tắt bản lưu ----- */
function saveSummary(sv){
  const keep = S; S = sv;
  try {
    const d = sv.day || 1, di = dayInfo(d), job = sv.job ? COMPANIES[sv.job.co] : null;
    let fin = '', next = [];
    try { fin = finStage().label; } catch (e) {}
    try {
      const c = [];
      (sv.bills || []).filter(b => !b.paid && b.due >= d).forEach(b => c.push([b.due, `${b.name}, ${fmtD(b.due)}`]));
      if (sv.job) for (let i = 0; i <= 40; i++) if (isPayday(d + i) && payFor(d + i).days > 0) { c.push([d + i, `Lương về ${fmtD(d + i)}`]); break; }
      openLoans().forEach(L => c.push([L.due, `${L.label || 'Trả nợ'}, ${fmtD(L.due)}`]));
      next = c.sort((a, b) => a[0] - b[0]).slice(0, 2).map(x => x[1]);
    } catch (e) {}
    const at = sv.savedAt ? new Date(sv.savedAt) : null, pad = n => String(n).padStart(2, '0');
    const atTxt = at ? (at.toDateString() === new Date().toDateString() ? `hôm nay lúc ${pad(at.getHours())}:${pad(at.getMinutes())}` : `${pad(at.getHours())}:${pad(at.getMinutes())}, ${at.getDate()}/${at.getMonth() + 1}`) : '';
    return { name:sv.name, look:sv.look ? lookToL(sv.look, 'casual', sv.gender) : null, home:{ nha:'Ở cùng bố mẹ', tro:'Thuê trọ', ghep:'Ở ghép với Tùng' }[sv.bg] || '', d, di, week:Math.min(8, weekOf(d)), pct:Math.round(Math.min(1, d / LAST_DAY) * 100),
      job: job ? (d < sv.job.start ? `Sắp vào ${job.name}` : `${job.name} · ${fmtTr(sv.job.salary)}/tháng`) : 'Đang tìm việc',
      money:sv.money, fin, next, end:sv.phase === 'end', bars:[['⚡', 'Năng lượng', sv.energy], ['❤️', 'Sức khỏe', sv.health], ['🙂', 'Tinh thần', sv.mood]], atTxt };
  } finally { S = keep; }
}
function saveCardHTML(sv){
  const m = saveSummary(sv), bar = ([ic, l, v]) => `<div class="sc-bar" title="${l}"><span aria-hidden="true">${ic}</span><div class="bar" role="meter" aria-label="${l}" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><i class="${v < 30 ? 'low' : v < 55 ? 'mid' : ''}" style="width:${v}%"></i></div><b>${v}</b></div>`;
  return `<div class="save-card">
    <div class="sc-top"><span class="sc-av">${headSVG(m.look || defaultLook('nam'), 'happy')}</span><div class="sc-who"><b>${esc(m.name || 'Nhân vật')}</b><small>${m.home}</small></div>${m.atTxt ? `<small class="sc-time">Lưu ${m.atTxt}</small>` : ''}</div>
    <div class="sc-day"><span>📅 ${m.di.dow}, ${fmtD(m.d)}</span><span>${m.end ? 'Đã xong bản chơi thử' : `Tuần ${m.week}/8`}</span></div>
    <div class="sc-prog" aria-hidden="true"><i style="width:${m.pct}%"></i></div>
    <div class="sc-row"><span>💼 ${m.job}</span></div>
    <div class="sc-row"><span>💰 ${fmt(m.money)}</span>${m.fin ? `<span class="sc-fin">${m.fin}</span>` : ''}</div>
    <div class="sc-bars">${m.bars.map(bar).join('')}</div>
    ${m.next.length ? `<div class="sc-next">⏭️ Sắp tới: ${m.next.join(' · ')}</div>` : ''}
    <button class="btn" type="button" id="resume">${m.end ? 'Xem lại tổng kết' : 'Chơi tiếp'}</button></div>`;
}
