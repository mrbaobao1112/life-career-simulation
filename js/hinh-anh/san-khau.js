/* =========================================================
   SÂN KHẤU SỐNG – văn phòng công ty (v10)
   Mỗi nhân vật có vị trí, trạng thái và lịch riêng. Đổi trạng thái thì có động tác chuyển tiếp:
   đứng dậy → đi → tới nơi → quay mặt → nói / uống → quay về → ngồi xuống → làm việc.
   Các động tác nằm ở css/dong-tac.css. Luật chơi không đổi: sân khấu chỉ là phần hình của cảnh.
   ========================================================= */
const STAGE = {
  W:360, H:250,
  SPEED:60,                 // tốc độ đi bộ (đơn vị hình mỗi giây)
  STEP:27,                  // chiều dài một bước chân, tính cho nhân vật cỡ 1 (nhân với cỡ thật)
  LANES:[197, 206],         // hai hàng trên lối đi giữa hai dãy bàn: người đi ngược chiều thì tránh sang hàng kia
  SIT_UP:10,                // người ngồi được nâng lên chừng này để lộ vai trên mặt bàn
  EDGE:47,                  // từ ghế bước sang phải chừng này là ra khỏi bàn
  MAX_AWAY:2,               // nhiều nhất chừng này đồng nghiệp rời bàn cùng lúc
  BEAT_GAP:[9000, 15000],   // khoảng nghỉ giữa hai việc riêng của một người (mili giây)
  DOOR:{ x:26 }, WATER:{ x:354 }, BOARD:{ x:70 },     // WATER: người lấy nước đứng lệch về bên phải, không chắn lối vào bàn cuối
  SEAT:{ dung:{ x:104, y:160, row:'back' }, mai:{ x:186, y:160, row:'back' }, boss:{ x:268, y:160, row:'back' },
         me:{ x:118, y:252, row:'front' }, phong:{ x:246, y:252, row:'front' } },
};
// Nhân vật càng ở gần phía trước càng lớn một chút (tạo chiều sâu)
const stageDepth = y => Math.round((.52 + Math.max(0, Math.min(102, y - 150)) * .00108) * 1000) / 1000;
// Câu chào lúc bạn đến và lúc ra về của từng người (lịch và câu trò chuyện nằm ở tinh-cach.js và lich-van-phong.js)
const OFFICE_ROUTINE = {
  boss:  { greet:'Chào em!', bye:'Về cẩn thận nhé!' },
  dung:  { greet:'…', bye:'Ừ, về đi em.' },
  mai:   { greet:'Em đến rồi à!', bye:'Mai gặp nhé!' },
  phong: { greet:'Ông đến rồi!', bye:'Về thôi ông!' },
};
const COLLEAGUES = ['dung','mai','boss','phong'];
// Mỗi trạng thái ứng với một động tác
const STATE_ACT = { work:'act-type', think:'act-think', read:'act-read', sip:'act-sip', walk:'act-walk', talk:'act-talk', listen:'act-listen', laugh:'act-laugh', drink:'act-drink', rest:'', meeting:'', leave:'act-walk' };

const stageOn = () => !(S.opt && S.opt.stage === false);
// Cảnh nào dùng sân khấu văn phòng
function stageFor(ref, sc){
  if (!S || !stageOn() || !S.job || !isWorkday() || S.day < S.job.start) return false;
  if (ref.id === 'cut') return true;
  if (sc.kind || sc.bg !== 'office') return false;
  if (S.slot === 'evening') return ref.id === 'ot';
  if (!['morning','noon','afternoon'].includes(S.slot)) return false;
  return !sc.npc || !!NPC[sc.npc];
}

/* ----- Vẽ ----- */
function stageBg(){
  const co_ = S.job ? S.job.co : 'hotay';
  const wall = { hotay:'#E3ECF6', banhmi:'#FFF0D8', cudem:'#ECE6F7', loren:'#EFE6D8' }[co_] || '#E6EEF5';
  const sign = [CO_COLOR[co_] || '#2F6FD1', COMPANIES[co_].name], sw = Math.max(70, sign[1].length * 6.4 + 14);
  const sky = SKY[S.slot] || SKY.morning, night = S.slot === 'evening' || S.slot === 'night', rain = S.flags.rainDay === S.day;
  const hour = { morning:9, noon:12, afternoon:14.5, evening:19, night:22 }[S.slot] || 9, ha = hour % 12 * 30, ma = hour % 1 * 360;
  const hand = (deg, len, w) => `<path d="M132 34 L${(132 + Math.sin(deg * Math.PI / 180) * len).toFixed(1)} ${(34 - Math.cos(deg * Math.PI / 180) * len).toFixed(1)}" stroke="#2B2321" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<rect width="360" height="250" fill="${wall}"/><rect y="150" width="360" height="100" fill="#C9D1DB"/><rect y="148" width="360" height="3" fill="#B4BDC9"/>
    <rect x="6" y="60" width="38" height="90" rx="2" fill="#6F563F"/><rect x="10" y="64" width="30" height="86" fill="#3B3F4A"/>
    <g class="door"><rect x="10" y="64" width="30" height="86" rx="1" fill="#A98463"/><rect x="14" y="70" width="22" height="30" rx="1" fill="#B8926F"/><circle cx="35" cy="110" r="2.2" fill="#F2D27A"/></g>
    <rect x="52" y="20" width="62" height="46" rx="3" fill="#fff" stroke="#B9C2CC" stroke-width="2"/><rect x="59" y="27" width="12" height="10" fill="#F6C85F"/><rect x="75" y="27" width="12" height="10" fill="#9FD3B4"/><rect x="91" y="27" width="12" height="10" fill="#F7A1A8"/><rect x="59" y="44" width="12" height="10" fill="#9FC2F2"/><rect x="75" y="44" width="12" height="10" fill="#F6C85F"/>
    <g class="env"><circle cx="132" cy="34" r="12" fill="#fff" stroke="#8B6B4A" stroke-width="2.5"/>${hand(ha, 5.5, 2)}${hand(ma, 8, 1.5)}<path class="sec" style="transform-origin:132px 34px" d="M132 34 V25" stroke="#E5484D" stroke-width="1"/><circle cx="132" cy="34" r="1.3" fill="#2B2321"/></g>
    <clipPath id="stWin"><rect x="158" y="18" width="88" height="46" rx="2"/></clipPath>
    <g class="env" clip-path="url(#stWin)"><rect x="158" y="18" width="88" height="46" fill="${rain ? '#9AA7B8' : sky}"/><circle cx="226" cy="31" r="6.5" fill="${night ? '#FFF3B0' : '#FFF7D1'}" opacity="${rain ? .3 : 1}"/>
      <g class="cloud"><ellipse cx="170" cy="30" rx="13" ry="5" fill="#fff" opacity=".9"/><ellipse cx="179" cy="27" rx="8" ry="5" fill="#fff" opacity=".9"/></g><g class="cloud c2"><ellipse cx="168" cy="42" rx="10" ry="4" fill="#fff" opacity=".75"/></g>
      <path d="M158 56 L176 44 L192 54 L212 42 L230 52 L246 46 V64 H158Z" fill="${night ? '#3B456E' : '#9BB7A6'}" opacity=".75"/>
      ${rain ? `<g class="winrain">${Array.from({ length:16 }, (_, i) => `<path d="M${160 + i * 6} ${10 + (i * 17) % 40} l-3 9" stroke="#E3F0FF" stroke-width="1.1" opacity=".8"/>`).join('')}</g>` : ''}</g>
    <rect x="158" y="18" width="88" height="46" rx="2" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M202 18 V64" stroke="#fff" stroke-width="3.5"/>
    <rect x="${352 - sw}" y="20" width="${sw}" height="20" rx="4" fill="${sign[0]}"/>${T(352 - sw / 2, 34, sign[1], '#fff', 10)}
    <rect x="318" y="100" width="28" height="50" rx="3" fill="#EEF3F8" stroke="#B9C2CC" stroke-width="1.5"/><rect x="322" y="84" width="20" height="18" rx="7" fill="#9FD0F5" opacity=".85"/><rect x="328" y="117" width="8" height="5" rx="1" fill="#4A90D9"/>`;
}
function chairSVG(x, y){ return `<rect x="${x - 17}" y="${y - 50}" width="34" height="40" rx="7" fill="#4A5568"/><rect x="${x - 13}" y="${y - 46}" width="26" height="32" rx="5" fill="#5B6779"/>`; }
function deskSVG(who){
  // bàn làm việc: nhân vật ngồi phía sau, mặt bàn che phần thân dưới; trên bàn có màn hình và cốc nước
  const z = STAGE.SEAT[who], x = z.x, y = z.y, big = z.row === 'front' ? 1.12 : 1;
  return `<g class="desk" data-desk="${who}" transform="translate(${x} ${y}) scale(${big})"><rect x="-40" y="-27" width="80" height="6" rx="2" fill="#8C6E54"/><rect x="-37" y="-21" width="74" height="27" fill="#A98463"/><rect x="-37" y="-21" width="74" height="3" fill="#00000018"/>
    <rect x="20" y="-43" width="20" height="14" rx="1.5" fill="#2B3240"/><rect x="22" y="-41" width="16" height="10" fill="#1E2A3A"/>
    <g class="scr"><rect class="ln" x="24" y="-39.5" width="11" height="1.6" fill="#7CE0A3"/><rect class="ln l2" x="24" y="-36.5" width="8" height="1.6" fill="#9FC2F2"/><rect class="ln l3" x="24" y="-33.5" width="12" height="1.6" fill="#F6C85F"/></g>
    <rect x="27" y="-29" width="6" height="2.5" fill="#59606C"/><rect x="18" y="-28" width="24" height="2" rx="1" fill="#59606C"/>
    <g class="cup"><rect x="-34" y="-36" width="8" height="9" rx="1.5" fill="#fff" stroke="#B9C2CC"/><path d="M-26 -34 q4 2 0 5" stroke="#B9C2CC" fill="none"/></g></g>`;
}
function actorSVG(who, expr, look, id){
  const me = who === 'me'; look = look || (me ? playerLook() : NPC[who].look);
  const body = chibi(look, expr || (me ? playerExpr() : NPC[who] ? defaultNpcExpr(who) : 'neutral'), me && S ? { dark:darkCircles() } : {});
  return `<g class="actor snap" data-who="${id || who}" ${me ? '' : `data-npc="${who}"`} role="button" aria-label="${me ? esc(S ? S.name : 'Nhân vật chính') : NPC[who] ? NPC[who].name : 'Người qua đường'}"><g class="sc"><g class="flip"><g class="cb cb-idle">${body}</g></g></g></g>`;
}
const PROP_SVG = {
  cup:'<rect x="87" y="107" width="10" height="11" rx="2" fill="#fff" stroke="#B9C2CC" stroke-width="1.2"/>',
  paper:'<rect x="80" y="98" width="19" height="24" rx="1.5" fill="#fff" stroke="#B9C2CC" stroke-width="1.2"/><path d="M84 104 h11 M84 109 h11 M84 114 h7" stroke="#9AA7B6" stroke-width="1.4"/>',
  phone:'<rect x="87" y="104" width="9" height="15" rx="2" fill="#2B3240"/>',
};
function stageSVG(label){
  const Z = STAGE.SEAT, back = ['dung','mai','boss'], front = ['me','phong'];
  const tint = S.slot === 'afternoon' ? '<rect width="360" height="250" fill="#FF8A4C" opacity=".06" pointer-events="none"/>'
    : S.slot === 'evening' ? '<rect width="360" height="250" fill="#121836" opacity=".34" pointer-events="none"/><path d="M96 0 L150 0 L196 250 L50 250Z" fill="#FFF3B0" opacity=".13" pointer-events="none"/>' : '';
  return `<svg viewBox="0 0 360 250" role="img" aria-label="${esc(label || 'Văn phòng')}">${stageBg()}
    ${back.map(k => chairSVG(Z[k].x, Z[k].y)).join('')}<g class="L-back"></g>${back.map(deskSVG).join('')}
    <g class="L-aisle"></g>${front.map(k => chairSVG(Z[k].x, Z[k].y)).join('')}<g class="L-front"></g>${front.map(deskSVG).join('')}${tint}<g class="L-say"></g></svg>`;
}
function bikeSVG(){
  const wheel = x => `<g class="wheel"><circle cx="${x}" cy="0" r="9" fill="#2B2B2B"/><circle cx="${x}" cy="0" r="4.5" fill="#9AA3AF"/><path d="M${x - 8} 0 H${x + 8} M${x} -8 V8" stroke="#D5DAE1" stroke-width="1.4"/></g>`;
  return `${wheel(-20)}${wheel(22)}<path d="M-22 -6 Q-4 -24 16 -12 L26 -4 L-18 -2Z" fill="#E5484D"/><rect x="-16" y="-17" width="24" height="6" rx="3" fill="#2B2B2B"/><path d="M18 -12 L24 -30 M20 -30 H29" stroke="#3A3F4B" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="27" cy="-22" r="3.5" fill="#FFF3B0"/>`;
}
function streetSVG(){
  return `<svg viewBox="0 0 360 210" role="img" aria-label="Đường trước công ty"><g transform="translate(0 15)">${bgSVG('street')}</g><rect y="0" width="360" height="16" fill="${SKY[S.slot] || SKY.morning}"/><rect y="190" width="360" height="20" fill="#7A8290"/>
    <rect x="312" y="80" width="48" height="80" fill="#5D6B7E"/><rect x="322" y="106" width="30" height="54" rx="2" fill="#3B3F4A"/><g class="door"><rect x="322" y="106" width="30" height="54" rx="2" fill="#A98463"/></g>${T(337, 98, 'Công ty', '#fff', 8)}
    <g class="L-back"></g><g class="L-aisle"></g>${S.flags.rainDay === S.day ? rainSVG() : ''}<g class="L-say"></g></svg>`;
}

/* ----- Phần lõi dùng chung cho mọi địa điểm: đặt nhân vật, cho đi lại, nói, phản ứng ----- */
let stageRun = 0;
const stageTimers = new Set();
// Dừng hẳn sân khấu đang chạy: mọi hoạt cảnh tự thoát, mọi lệnh hẹn giờ bị hủy
function stageStop(){ stageRun++; stageTimers.forEach(clearTimeout); stageTimers.clear(); }
function stageCore(root){
  stageStop();
  const run = stageRun, svg = root.querySelector('svg'), A = {}, still = reduceMotion(), office = svg.getAttribute('viewBox') === '0 0 360 250';
  const alive = () => run === stageRun && !!window.document && !!document.body && document.body.contains(svg);
  const later = (fn, ms) => { const id = setTimeout(() => { stageTimers.delete(id); if (alive()) fn(); }, ms); stageTimers.add(id); return id; };
  const wait = ms => new Promise(r => { const id = setTimeout(() => { stageTimers.delete(id); r(alive()); }, ms); stageTimers.add(id); });
  const layer = n => svg.querySelector('.L-' + n);
  const scaleOf = a => a.s || (office ? stageDepth(a.y) : .5);
  const place = (a, x, y, lay) => {
    a.x = x; a.y = y; if (lay && a.lay !== lay) { a.lay = lay; layer(lay).appendChild(a.el); }
    const s = scaleOf(a);
    a.el.querySelector('.sc').setAttribute('transform', `${a.rot ? `rotate(${a.rot}) ` : ''}translate(-60 ${-140 + (a.dy || 0) / s})`);
    a.el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  };
  const cbOf = a => a.el.querySelector('.cb');
  const act = (a, name) => { cbOf(a).setAttribute('class', 'cb cb-idle' + (name ? ' ' + name : '')); a.act = name; };
  const add = (who, x, y, lay, name, expr, x2 = {}) => {
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'g'); tmp.innerHTML = actorSVG(who, expr, x2.look, x2.id);
    const a = A[x2.id || who] = { who, id:x2.id || who, el:tmp.firstChild, busy:false, s:x2.s, rot:x2.rot, dy:x2.dy }; place(a, x, y, lay); act(a, name); return a;
  };
  const snap = (a, x, y, lay) => { a.el.classList.add('snap'); place(a, x, y, lay); void a.el.getBoundingClientRect(); };
  const face = (a, left) => { a.left = !!left; a.el.classList.toggle('left', !!left); };
  // Trượt một đoạn ngắn không bước chân (kéo ghế ngồi vào, nhích sang bên)
  const slide = async (a, x, y, ms = 300) => {
    if (still) { snap(a, x, y); return alive(); }
    a.el.classList.remove('snap'); a.el.classList.add('ease'); a.el.style.transitionDuration = ms + 'ms'; place(a, x, y);
    const ok = await wait(ms); a.el.classList.remove('ease'); return ok;
  };
  // Đi bộ: số bước tính theo quãng đường để chân không "trượt"; đổi hướng thì quay người trước
  const walk = async (a, x, y, o = {}) => {
    if (still) { snap(a, x, y); return alive(); }
    const d = Math.hypot(x - a.x, y - a.y); if (d < 1.5) return alive();
    if (Math.abs(x - a.x) > 2 && (x < a.x) !== !!a.left) { face(a, x < a.x); if (!await wait(170)) return false; }
    const sp = a.speed || STAGE.SPEED, ms = Math.max(160, d / sp * 1000), stepLen = STAGE.STEP * scaleOf(a) * (sp > 95 ? 1.5 : 1);
    a.tx = x; a.fx = a.x; a.el.classList.remove('snap'); a.el.style.transitionDuration = ms + 'ms';      // fx → tx: quãng đường đang đi, để người khác biết mà tránh
    act(a, o.act || (sp > 95 ? 'act-walk act-run' : 'act-walk')); cbOf(a).style.setProperty('--step', Math.round(stepLen * 2 / sp * 1000) + 'ms');
    place(a, x, y);
    const ok = await wait(ms); a.tx = null; a.fx = null; if (ok && !o.keep) act(a, ''); return ok;
  };
  const say = (a, text, ms = 1500) => {
    if (!alive()) return Promise.resolve(false);
    const s = scaleOf(a), W = +svg.dataset.w || (office ? STAGE.W : 360), w = Math.max(22, text.length * 4.9 + 12), x = Math.min(W - w - 3, Math.max(3, a.x - w / 2)), y = Math.max(3, a.y - 140 * s - 17 + (a.dy || 0));
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'say');
    g.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="15" rx="7" fill="#fff" stroke="#B9C2CC"/><path d="M${a.x - 3} ${y + 14.5} L${a.x} ${y + 19} L${a.x + 3} ${y + 14.5}Z" fill="#fff" stroke="#B9C2CC" stroke-width=".8"/><rect x="${a.x - 3.4}" y="${y + 13}" width="6.8" height="2" fill="#fff"/><text x="${x + w / 2}" y="${y + 10.6}" text-anchor="middle" font-size="8.6" font-weight="600" fill="#1B2230" font-family="Be Vietnam Pro,Arial,sans-serif">${esc(text)}</text>`;
    layer('say').appendChild(g); later(() => g.remove(), ms); return wait(still ? 0 : ms);
  };
  // Phản ứng một lần (vẫy, gật, nhảy…) chồng lên động tác đang làm, xong thì tự gỡ
  const react = (a, anim, ms = 1200) => { if (still) return; const cb = cbOf(a); cb.classList.remove('anim-' + anim); void cb.getBoundingClientRect(); cb.classList.add('anim-' + anim); later(() => cb.classList.remove('anim-' + anim), ms); };
  // Cầm một món đồ trong tay phải (cốc, tài liệu, điện thoại); gọi không tham số để bỏ xuống
  const hold = (a, kind) => {
    a.el.querySelectorAll('.prop').forEach(p => p.remove()); a.holding = kind || null;
    if (!kind) return;
    a.el.querySelectorAll('.cb-armR').forEach(arm => { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'prop'); g.innerHTML = PROP_SVG[kind]; arm.appendChild(g); });
  };
  const door = open => { const d = svg.querySelector('.door'); if (d) d.classList.toggle('open', !!open); };
  // chạm vào ai thì người đó phản ứng (chỉ để cho vui, không ảnh hưởng chỉ số)
  svg.addEventListener('click', e => {
    const el = e.target.closest('.actor'); if (!el) return;
    const a = A[el.dataset.who]; if (!a || a.rot) return;
    react(a, a.who === 'me' ? pick(['wave','jump','cheer']) : pick(['hop','nod','wave']));
    say(a, a.who === 'me' ? playerQuip() : pick(NPC_QUIP[a.who] || ['…','Chào!','Hử?']), 1500); SFX.play(a.who === 'me' ? 'hop' : 'talk');
  });
  return { run, svg, A, still, alive, wait, later, layer, place, act, add, snap, slide, walk, face, say, react, hold, door };
}

/* ----- Đạo diễn văn phòng ----- */
function stageMount(root, mode, o = {}){
  const C = stageCore(root), { svg, A, still, alive, wait, later, act, add, snap, slide, walk, face, say, react, hold, door } = C;
  const cbOf = a => a.el.querySelector('.cb');
  const Z = STAGE.SEAT, rnd = (a, b) => a + Math.random() * (b - a);
  const seatY = who => Z[who].y - STAGE.SIT_UP;
  const deskOf = a => svg.querySelector(`.desk[data-desk="${a.who}"]`);
  const screen = (a, on) => { const d = deskOf(a); if (d) d.querySelector('.scr').classList.toggle('on', !!on && !still); };
  const deskCup = (a, show) => { const d = deskOf(a); if (d) d.querySelector('.cup').style.display = show ? '' : 'none'; };
  // Đổi trạng thái: động tác đổi theo, màn hình chỉ chạy khi đang gõ
  const setState = (a, st) => { a.state = st; a.el.dataset.state = st; act(a, STATE_ACT[st] || ''); screen(a, st === 'work'); };
  const away = () => COLLEAGUES.filter(k => A[k] && A[k].lay === 'aisle').length;
  // Chọn hàng đi để không đi xuyên qua người đang đứng hoặc đang đi trên lối
  const lane = (a, x, strict) => {
    const lo = Math.min(a.x, x) - 24, hi = Math.max(a.x, x) + 24, dir = Math.sign(x - a.x), fast = (a.speed || STAGE.SPEED) > STAGE.SPEED;
    for (const y of STAGE.LANES) {
      const hit = Object.values(A).some(b => {
        if (b === a || b.lay !== 'aisle' || b.el.classList.contains('gone') || Math.abs((b.ty ?? b.y) - y) >= 6) return false;
        const b0 = b.fx ?? b.x, moving = b.fx != null && Math.abs(b.x - b0) > 2;
        // người đi cùng chiều, đã ở phía trước một quãng và sẽ đi xa hơn mình thì không vướng (cùng tốc độ nên không đuổi kịp)
        if (moving && !fast && dir && Math.sign(b.x - b0) === dir && (b0 - a.x) * dir >= 30 && (b.x - x) * dir >= 20) return false;
        return Math.max(b.x, b0) > lo && Math.min(b.x, b0) < hi; });
      if (!hit) return y;
    }
    return strict ? null : STAGE.LANES[1];
  };
  // Chờ đến khi có một hàng trống rồi mới đi (không chen vào khi cả hai hàng đang có người)
  const laneWait = async (a, x) => { for (let i = 0; i < 16; i++) { const y = lane(a, x, true); if (y != null) return y; setState(a, 'rest'); if (!await wait(300)) return null; } return alive() ? lane(a, x) : null; };
  // Lối rẽ ở cột x có đang vướng người không (người đứng đó, hoặc người đang đi ngang qua)
  const colBusy = (a, x) => Object.values(A).some(b => b !== a && b.lay === 'aisle' && !b.el.classList.contains('gone') && Math.max(b.x, b.fx ?? b.x) > x - 20 && Math.min(b.x, b.fx ?? b.x) < x + 20 && Math.abs(b.y - a.y) > 4);
  const colWait = async (a, x) => { for (let i = 0; i < 14 && colBusy(a, x); i++) { setState(a, 'rest'); if (!await wait(280)) return false; } return alive(); };
  // Đi tới x: bước thẳng ra lối đi trước (nếu đang ở mép bàn), rồi đi dọc theo một hàng. Không đi chéo qua lối.
  const go = async (a, x) => {
    if (!STAGE.LANES.some(l => Math.abs(a.y - l) < 3)) { if (!await colWait(a, a.x)) return false; const y0 = lane(a, a.x); a.ty = y0; setState(a, 'walk'); const ok0 = await walk(a, a.x, y0, { keep:true }); a.ty = null; if (!ok0) return false; }
    const y = await laneWait(a, x); if (y == null) return false;
    if (Math.abs(a.y - y) > 3) { a.ty = y; setState(a, 'walk'); const ok1 = await walk(a, a.x, y, { keep:true }); if (!ok1) return false; }      // đổi hàng trước khi đi
    a.ty = y; setState(a, 'walk'); const ok = await walk(a, x, y, { keep:true }); a.ty = null; return ok; };
  const spots = {};
  const take = (name, a) => { if (spots[name] && spots[name] !== a) return false; spots[name] = a; return true; };
  const free = a => Object.keys(spots).forEach(k => { if (spots[k] === a) delete spots[k]; });
  // Mỗi người chỉ do một việc điều khiển tại một thời điểm: việc khác muốn dùng người này phải chờ
  const begin = (a, tag) => { if (a.owner) { STAGE_DEBUG.conflicts++; STAGE_DEBUG.log.push(`${a.who}: ${a.owner} / ${tag}`); return false; } a.owner = tag; a.busy = true; a.el.dataset.owner = tag; return true; };
  const end = a => { a.owner = null; a.busy = false; a.el.dataset.owner = ''; free(a); };
  const D = officeDay();

  // Chu kỳ làm việc tại bàn: gõ một lúc, dừng nghĩ, nhấp ngụm nước, đọc tài liệu, vươn vai
  const workLoop = async a => {
    const my = a.loop = (a.loop || 0) + 1, on = () => alive() && a.loop === my && a.lay !== 'aisle';
    setState(a, 'work'); if (still) return;
    while (on()) {
      cbOf(a).classList.toggle('fast', !!a.focusMode);
      const fo = personaOf(a.who).focus;
      if (!await wait(rnd(2600, 5200) * (.7 + fo * .9)) || !on()) return;
      if (a.focusMode) continue;                               // đang chạy việc gấp: không nghỉ giữa chừng
      const r = Math.random() / (1.15 - fo * .5);
      if (r < .4) { setState(a, 'think'); if (!await wait(rnd(1400, 2400)) || !on()) return; }
      else if (r < .58) { deskCup(a, false); hold(a, 'cup'); setState(a, 'sip'); const ok = await wait(2400) && on(); hold(a); deskCup(a, true); if (!ok) return; }
      else if (r < .7) { hold(a, 'paper'); setState(a, 'read'); const ok = await wait(rnd(2400, 3400)) && on(); hold(a); if (!ok) return; }
      else if (r < .8) { setState(a, 'rest'); react(a, 'stretch', ANIM.WAKE_MS); if (!await wait(ANIM.WAKE_MS + 100) || !on()) return; }
      if (on()) setState(a, 'work');
    }
  };
  const stopWork = a => { a.loop = (a.loop || 0) + 1; if (a.holding) { hold(a); deskCup(a, true); } };
  // Đứng dậy rời bàn: nhún người đứng lên, nhích ra mép bàn rồi mới bước ra lối đi
  const standUp = async a => {
    stopWork(a); setState(a, 'rest'); const z = Z[a.who];
    if (still) { snap(a, z.x + STAGE.EDGE, STAGE.LANES[0], 'aisle'); return alive(); }
    act(a, 'act-standup'); if (!await wait(340)) return false;
    if (!await slide(a, z.x + STAGE.EDGE, seatY(a.who), 300)) return false;
    snap(a, a.x, a.y, 'aisle'); return true;
  };
  // Về bàn ngồi xuống: đi tới mép bàn, lách vào ghế, nhún người ngồi xuống rồi làm việc tiếp
  const sitDown = async a => {
    const z = Z[a.who]; free(a);
    if (still) { snap(a, z.x, seatY(a.who), z.row); face(a, false); workLoop(a); return alive(); }
    if (Math.abs(a.x - (z.x + STAGE.EDGE)) > 8 && !await go(a, z.x + STAGE.EDGE)) return false;       // đi dọc lối đi tới ngang bàn mình rồi mới rẽ vào
    if (!await colWait(a, z.x + STAGE.EDGE)) return false;                                             // chờ nếu lối rẽ vào bàn đang vướng người
    setState(a, 'walk'); a.ty = seatY(a.who); const ok = await walk(a, z.x + STAGE.EDGE, seatY(a.who), { keep:true }); a.ty = null; if (!ok) return false;
    snap(a, a.x, a.y, z.row); face(a, true);
    if (!await slide(a, z.x, seatY(a.who), 300)) return false;
    face(a, false); act(a, 'act-sitdown'); if (!await wait(340)) return false;
    workLoop(a); return true;
  };
  const seat = (who, expr) => { const a = add(who, Z[who].x, seatY(who), Z[who].row, '', expr); a.state = 'work'; return a; };
  const awaySign = k => { const z = Z[k], g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('pointer-events', 'none'); g.setAttribute('class', 'away-sign');
    g.innerHTML = `<rect x="${z.x - 25}" y="${z.y - 48}" width="50" height="14" rx="3" fill="#FFF7D6" stroke="#C9B36A"/><text x="${z.x}" y="${z.y - 38}" text-anchor="middle" font-size="8" font-weight="700" fill="#7A5C00" font-family="Be Vietnam Pro,Arial,sans-serif">Nghỉ phép</text>`; C.layer('say').appendChild(g); };
  const seatAll = (skip = []) => COLLEAGUES.forEach(k => { if (D.absent.includes(k)) { awaySign(k); return; } if (!skip.includes(k)) workLoop(seat(k)); });
  // Hai người trao đổi theo lượt: người nói mấp máy miệng và ra tay, người nghe nhìn và gật đầu
  const converse = async (a, b, lines, o2 = {}) => {
    let ok = true;
    for (let i = 0; i < lines.length && ok; i++) {
      const sp = i % 2 ? b : a, li = i % 2 ? a : b;
      setState(sp, 'talk'); setState(li, 'listen'); SFX.play('talk');
      ok = await say(sp, lines[i], Math.max(1300, lines[i].length * 95));
      if (ok) ok = await wait(220);
    }
    if (ok && o2.laugh) { setState(a, 'laugh'); setState(b, 'laugh'); ok = await wait(1000); }
    return ok;
  };

  /* ----- Việc riêng của đồng nghiệp ----- */
  const beats = {
    stretch: async a => { stopWork(a); setState(a, 'rest'); react(a, 'stretch', ANIM.WAKE_MS); if (!await wait(ANIM.WAKE_MS + 200)) return; workLoop(a); },
    water: async a => {
      if (!take('water', a)) return;
      if (!await standUp(a)) return; deskCup(a, false); hold(a, 'cup');
      if (!await go(a, STAGE.WATER.x - 14)) return; face(a, false);
      setState(a, 'rest'); if (!await wait(700)) return;                 // hứng nước
      setState(a, 'drink'); if (!await wait(2600)) return;
      free(a); if (!await sitDown(a)) return; hold(a); deskCup(a, true);
    },
    board: async a => {
      if (!take('board', a)) return;
      if (!await standUp(a)) return; if (!await go(a, STAGE.BOARD.x)) return;
      face(a, false); setState(a, 'think'); if (!await wait(2600)) return;
      free(a); await sitDown(a);
    },
    meeting: async a => {
      if (!take('door', a)) return;
      if (!await standUp(a)) return; hold(a, 'paper'); setState(a, 'talk'); if (!await say(a, 'Chị đi họp nhé.', 1300)) return;
      if (!await go(a, STAGE.DOOR.x)) return; door(true); if (!await wait(320)) return;
      a.el.classList.add('gone'); a.state = 'meeting'; a.el.dataset.state = 'meeting'; door(false); free(a);
      if (!await wait(9000)) return;
      if (!take('door', a)) { if (!await wait(2500)) return; take('door', a); }
      door(true); if (!await wait(320)) return; a.el.classList.remove('gone'); later(() => door(false), 700); free(a);
      if (!await sitDown(a)) return; hold(a);
    },
    // sang bàn một đồng nghiệp trao đổi: nội dung và việc có cười hay không tùy tính cách hai người
    chat: async (a, withWho) => {
      const b = A[withWho]; if (!b || b.owner || b.lay === 'aisle' || b.state === 'meeting' || !take('chat:' + withWho, a)) return;
      begin(b, 'chat-partner');
      const zb = Z[withWho], bx = zb.row === 'back' ? zb.x - 58 : zb.x + 52, t = pairChat(a.who, withWho);
      if (await standUp(a) && await go(a, bx)) {
        face(a, zb.x < a.x); stopWork(b); face(b, a.x < zb.x);
        await converse(a, b, t.lines, { laugh:t.fun });
        if (alive()) { face(b, false); workLoop(b); }
      }
      end(b); free(a); if (alive()) await sitDown(a);
    },
    // chủ động sang bàn nhân vật chính bắt chuyện: câu nói tùy quan hệ, công việc và chuyện vừa xảy ra
    visit: async a => {
      const me = A.me; if (!me || me.owner || me.lay === 'aisle' || mode !== 'work' || S.slot === 'evening') return;
      const t = pickTalk(a.who); if (!t) return;
      begin(me, 'visited');
      if (await standUp(a) && await go(a, Z.me.x + 54)) {
        face(a, true); stopWork(me); face(me, false);
        const ok = await converse(a, me, t.lines, { laugh:t.fun });
        if (ok) chatBond(a.who);
        if (alive()) workLoop(me);
      }
      end(me); if (alive()) await sitDown(a);
    },
  };

  /* ----- Sự kiện văn phòng: chèn lên lịch, xong thì mọi người làm tiếp lịch đang dở ----- */
  const waitFree = async list => { for (let i = 0; i < 40; i++) { if (list.every(k => !A[k].owner && A[k].lay !== 'aisle')) return true; if (!await wait(400)) return false; } return false; };
  const runEvent = async (ev, resume) => {
    const P = ev.who.filter(k => A[k]); if (!P.length) { ev.phase = 'done'; D.done.push('event'); return; }
    if (!resume) { ev.phase = 'starting'; if (!await waitFree(P)) { if (alive()) ev.phase = 'pending'; return; } ev.phase = 'running'; ev.started = D.elapsed; STAGE_DEBUG.log.push('event-start:' + ev.id); }
    const left = () => Math.max(700, ev.dur - (D.elapsed - ev.started));
    const finish = () => { ev.phase = 'done'; D.done.push('event'); D.quiet = false; STAGE_DEBUG.log.push('event-done:' + ev.id); };
    P.forEach(k => begin(A[k], 'event:' + ev.id));
    if (ev.id === 'meeting') {                                         // họp đột xuất: chị Hạnh gọi vài người ra phòng họp
      if (!resume) {
        const boss = A.boss; stopWork(boss); setState(boss, 'talk'); if (!await say(boss, 'Cả nhà họp nhanh nhé!', 1500)) return;
        const outs = [];
        for (const k of P.slice().sort((x, y) => Z[x].x - Z[y].x)) { const a = A[k];             // người ngồi gần cửa đi trước, để không dồn nhau ở cửa
          outs.push((async () => { if (!await standUp(a)) return; if (k === 'boss') hold(a, 'paper'); if (!await go(a, STAGE.DOOR.x)) return; door(true); if (!await wait(280)) return; a.el.classList.add('gone'); a.state = 'meeting'; a.el.dataset.state = 'meeting'; later(() => door(false), 400); })());
          if (!await wait(1900)) return; }
        await Promise.all(outs); if (!alive()) return;            // chờ mọi người ra hẳn khỏi phòng rồi mới tính giờ họp
      } else P.forEach(k => { const a = A[k]; stopWork(a); snap(a, STAGE.DOOR.x, STAGE.LANES[0], 'aisle'); a.el.classList.add('gone'); a.state = 'meeting'; a.el.dataset.state = 'meeting'; screen(a, false); });
      if (!await wait(left())) return;
      for (const k of P) { const a = A[k]; door(true); if (!await wait(300)) return; a.el.classList.remove('gone'); a.state = 'rest';
        (async () => { if (await sitDown(a)) { hold(a); end(a); } })(); later(() => door(false), 600); if (!await wait(1700)) return; }
      finish();
    } else if (ev.id === 'hotfix') {                                   // lỗi khẩn cấp: một người chạy sang báo, người kia sửa gấp
      const F = A[P[0]], R = A[P[1]]; if (!R) { end(F); finish(); return; }
      const zf = Z[F.who], rx = zf.row === 'back' ? zf.x - 58 : zf.x + 52; D.quiet = true;
      if (!resume) {
        R.speed = 96; const ok = await standUp(R) && await go(R, rx); R.speed = null; if (!ok) return;
        face(R, zf.x < R.x); stopWork(F); face(F, R.x < zf.x);
        if (!await converse(R, F, ['Production lỗi rồi!', F.who === 'dung' ? 'Để anh xem.' : 'Để chị xem.'])) return;
      } else { stopWork(R); snap(R, rx, STAGE.LANES[0], 'aisle'); face(R, zf.x < R.x); stopWork(F); }
      face(F, false); F.focusMode = true; workLoop(F); setState(R, 'think');
      if (!await wait(left())) return;
      F.focusMode = false; stopWork(F); setState(F, 'talk'); if (!await say(F, 'Xong.', 1100)) return;
      setState(R, 'laugh'); setState(F, 'listen'); say(R, 'Cứu tinh!', 1200); if (!await wait(1300)) return;
      workLoop(F); end(F); if (await sitDown(R)) end(R);
      finish();
    } else {                                                           // chạy hạn chót: cả phòng cắm mặt làm, chị Hạnh đi một vòng xem
      D.quiet = true; const boss = A.boss, rest = P.filter(k => k !== 'boss');
      if (!resume && boss) { stopWork(boss); setState(boss, 'talk'); rest.forEach(k => { stopWork(A[k]); setState(A[k], 'listen'); }); if (!await say(boss, 'Chiều nay chốt bản demo nhé!', 1700)) return; }
      rest.forEach(k => { A[k].focusMode = true; workLoop(A[k]); });
      if (boss) {
        if (!resume) (async () => { if (!await standUp(boss)) return; for (const k of rest) { const z = Z[k]; if (!await go(boss, z.row === 'back' ? z.x - 58 : z.x + 52)) return; face(boss, z.x < boss.x); setState(boss, 'think'); if (!await wait(1300)) return; } await sitDown(boss); })();
        else { boss.focusMode = true; workLoop(boss); }
      }
      if (!await wait(left())) return;
      for (let i = 0; i < 20 && boss && boss.lay === 'aisle'; i++) if (!await wait(400)) return;
      P.forEach(k => { const a = A[k]; a.focusMode = false; stopWork(a); setState(a, 'rest'); react(a, 'stretch', ANIM.WAKE_MS); });
      if (rest[0]) say(A[rest[0]], 'Phù, xong!', 1300);
      if (!await wait(ANIM.WAKE_MS + 200)) return;
      P.forEach(k => { workLoop(A[k]); end(A[k]); });
      finish();
    }
  };
  // Người điều phối: đọc lịch của ngày, cho từng người làm việc riêng, chèn sự kiện khi đến lúc
  const director = async () => {
    if (still) return;
    const ev = D.event;
    if (ev && ev.phase === 'starting') ev.phase = 'pending';
    if (ev && ev.phase === 'running') runEvent(ev, true);              // quay lại cảnh giữa lúc sự kiện đang diễn ra
    while (await wait(900)) {
      D.elapsed += 900; const now = D.elapsed;
      if (ev && ev.phase === 'pending' && now >= ev.at) { runEvent(ev, false); continue; }
      if (D.quiet || (ev && ev.phase === 'starting') || away() >= STAGE.MAX_AWAY) continue;
      const k = COLLEAGUES.find(k => A[k] && D.plans[k] && D.plans[k].list.length && now >= D.plans[k].at && !A[k].owner && A[k].lay !== 'aisle' && A[k].state !== 'meeting'); if (!k) continue;
      const p = D.plans[k], [name, arg] = p.list[p.i % p.list.length].split(':'), a = A[k];
      p.i++; p.at = now + rnd(...STAGE.BEAT_GAP) * p.gap;
      if (begin(a, name)) beats[name](a, arg).then(() => end(a));
    }
  };

  /* ----- Các phân cảnh ----- */
  if (mode === 'work' || mode === 'visit') {
    const night = S.slot === 'evening', guest = mode === 'visit' && !Z[o.npc];
    if (night) { if (S.day % 2 && !D.absent.includes('dung')) workLoop(seat('dung')); }   // tối OT: văn phòng vắng, thỉnh thoảng còn anh Dũng
    else seatAll(mode === 'visit' ? [o.npc] : []);
    const me = seat('me', o.meExpr);
    if (o.meAnim) react(me, o.meAnim);
    if (mode === 'visit') {                                            // một người đến bàn bạn trao đổi (cảnh có lựa chọn)
      const from = guest ? STAGE.DOOR.x : Z[o.npc].x + STAGE.EDGE, spot = Z.me.x + 54;
      const v = add(o.npc, still ? spot : from, STAGE.LANES[1], 'aisle', '', o.npcExpr); v.state = 'rest'; begin(v, 'scene'); begin(me, 'scene');
      setState(me, 'listen'); face(me, false);
      if (still) face(v, true);
      else (async () => {
        if (guest) { door(true); later(() => door(false), 900); }
        if (!await go(v, spot)) return; face(v, true);
        setState(v, 'talk'); if (!await wait(1900)) return;
        // trong lúc người chơi đọc và chọn: hai bên lần lượt nói, nghe
        while (alive()) { setState(v, 'listen'); setState(me, 'talk'); if (!await wait(rnd(1500, 2300))) return; setState(me, 'listen'); setState(v, 'talk'); if (!await wait(rnd(1700, 2600))) return; }
      })();
    } else workLoop(me);
    if (!night) director();
    return { done:null };
  }
  if (mode === 'arrive') {
    seatAll();
    if (still) { workLoop(seat('me')); return { done:Promise.resolve(false) }; }
    const me = add('me', STAGE.DOOR.x, STAGE.LANES[0], 'aisle', ''); me.el.classList.add('gone'); me.state = 'rest';
    return { done:(async () => {
      if (!await wait(350)) return false;
      door(true); SFX.play('pop'); if (!await wait(330)) return false; me.el.classList.remove('gone');
      if (!await go(me, 84)) return false; door(false);
      setState(me, 'rest'); react(me, 'wave'); SFX.play('talk');
      // đồng nghiệp ngẩng lên nhìn rồi chào, từng người một
      for (const k of ['dung','mai','boss','phong']) {
        const a = A[k]; if (!a) continue; stopWork(a); setState(a, 'listen'); face(a, k !== 'phong');
        later(() => { if (S.lateToday && k === 'boss') { react(a, 'shake'); say(a, 'Muộn rồi đấy em.', 1500); } else { react(a, k === 'dung' ? 'nod' : 'wave'); say(a, OFFICE_ROUTINE[k].greet, 1300); } }, 260);
        later(() => { face(a, false); workLoop(a); }, 1900);
        if (!await wait(480)) return false;
      }
      if (!await wait(900)) return false;
      if (!await sitDown(me)) return false;
      director(); return wait(1500);
    })() };
  }
  if (mode === 'leave') {
    seatAll(); const me = seat('me'); workLoop(me);
    if (still) return { done:Promise.resolve(false) };
    const exit = async (a, line) => {
      if (!a || !begin(a, 'leave')) return false; if (!await standUp(a)) return false;
      face(a, false); setState(a, 'rest'); react(a, 'wave'); if (line) say(a, line, 1300); if (!await wait(900)) return false;
      if (!await go(a, STAGE.DOOR.x)) return false; door(true); if (!await wait(300)) return false; a.el.classList.add('gone'); later(() => door(false), 500); return true;
    };
    return { done:(async () => {
      if (!await wait(900)) return false;
      exit(A.mai, OFFICE_ROUTINE.mai.bye); if (!await wait(1500)) return false;
      exit(A.phong, OFFICE_ROUTINE.phong.bye); if (!await wait(2600)) return false;
      if (o.stay) {                                                    // tối nay OT: mọi người về, bạn ở lại
        exit(A.boss, 'Cảm ơn em ở lại nhé!'); if (!await wait(2400)) return false;
        stopWork(me); setState(me, 'rest'); react(me, 'stretch', ANIM.WAKE_MS); if (!await wait(ANIM.WAKE_MS)) return false; workLoop(me); return wait(1600);
      }
      // bạn đứng dậy, chào những người còn lại, rồi ra về
      if (!await standUp(me)) return false; face(me, false); setState(me, 'rest'); react(me, 'stretch', ANIM.WAKE_MS); if (!await wait(ANIM.WAKE_MS)) return false;
      react(me, 'wave'); say(me, 'Em về trước ạ!', 1400);
      for (const k of ['boss','dung']) { const a = A[k]; if (!a) continue; stopWork(a); setState(a, 'listen'); later(() => { react(a, k === 'dung' ? 'nod' : 'wave'); say(a, OFFICE_ROUTINE[k].bye, 1300); }, 500); later(() => workLoop(a), 2200); }
      if (!await wait(1900)) return false;
      if (!await go(me, STAGE.DOOR.x)) return false; door(true); if (!await wait(300)) return false; me.el.classList.add('gone'); later(() => door(false), 400);
      return wait(600);
    })() };
  }
  if (mode === 'street') {
    // đi xe máy tới, giảm tốc, dừng, xuống xe, đi bộ vào cửa công ty (lúc về thì ngược lại)
    const gY = 178, me = add('me', -60, gY - 13, 'back', 'act-ride', null, { s:.5 });
    const bike = document.createElementNS('http://www.w3.org/2000/svg', 'g'); bike.setAttribute('class', 'bike snap'); bike.innerHTML = `<g transform="scale(1.25)">${bikeSVG()}</g>`;
    C.layer('aisle').appendChild(bike);
    const setB = (x, ms) => { bike.classList.toggle('snap', !ms); bike.style.transitionDuration = (ms || 0) + 'ms'; bike.style.transform = `translate(${x}px, ${gY}px)`; };
    const both = (x, ms, curve) => { [me.el, bike].forEach(el => { el.classList.remove('snap'); el.style.transitionDuration = ms + 'ms'; el.style.transitionTimingFunction = curve; }); C.place(me, x - 3, gY - 13); bike.style.transform = `translate(${x}px, ${gY}px)`; };
    const moving = on => { svg.classList.toggle('moving', on); };
    if (still) return { done:Promise.resolve(false) };
    if (o.dir === 'in') return { done:(async () => {
      setB(-60); snap(me, -63, gY - 13); SFX.play('pop'); if (!await wait(60)) return false;
      moving(true); both(150, 2000, 'cubic-bezier(.15,.6,.3,1)'); if (!await wait(2000)) return false;       // giảm tốc dần rồi dừng
      moving(false); if (!await wait(350)) return false;
      me.el.style.transitionTimingFunction = ''; snap(me, 178, gY, 'aisle'); act(me, 'act-getoff'); if (!await wait(430)) return false;   // xuống xe
      act(me, ''); if (!await wait(150)) return false;
      if (!await walk(me, 326, gY - 2)) return false; door(true); if (!await wait(320)) return false; me.el.classList.add('gone'); return wait(250);
    })() };
    return { done:(async () => {
      setB(150); snap(me, 336, gY - 2, 'aisle'); act(me, ''); me.el.classList.add('gone');
      door(true); if (!await wait(320)) return false; me.el.classList.remove('gone');
      if (!await walk(me, 178, gY)) return false; door(false); if (!await wait(250)) return false;
      snap(me, 147, gY - 13, 'back'); face(me, true); act(me, 'act-ride act-getoff'); if (!await wait(450)) return false;                 // lên xe
      bike.style.transform = `translate(150px, ${gY}px) scaleX(-1)`; if (!await wait(60)) return false;
      moving(true); [me.el, bike].forEach(el => { el.classList.remove('snap'); el.style.transitionDuration = '1700ms'; el.style.transitionTimingFunction = 'cubic-bezier(.6,0,.9,.5)'; });
      C.place(me, -57, gY - 13); bike.style.transform = `translate(-60px, ${gY}px) scaleX(-1)`;
      return wait(1700);
    })() };
  }
  return { done:null };
}

/* ----- Ghép vào màn chơi ----- */
// Trả về phần hình của cảnh, kèm việc cần làm sau khi hình đã nằm trên trang
function stagePanel(ref, sc, o = {}){
  const visit = sc.npc && !!NPC[sc.npc];
  const html = `<div class="panel stage">${stageSVG(sc.title)}</div>`;
  const mount = root => {
    if (visit) stageMount(root, 'visit', { npc:sc.npc, npcExpr:o.npcExpr || sc.npcExpr, meExpr:o.meExpr, meAnim:o.meAnim });
    else stageMount(root, 'work', { meExpr:o.meExpr, meAnim:o.meAnim });
  };
  return { html, mount };
}
// Phân cảnh chuyển tiếp: đến công ty và tan làm
SC.cut = (arg) => arg === 'arrive'
  ? { icon:'🏢', title:'Đến công ty', html:P(S.lateToday ? `Bạn đến lúc ${arrClock()}, muộn ${S.lateMin} phút.` : `Bạn đến lúc ${arrClock()}.`), bg:'office', cut:'arrive',
      choices:[{ icon:'▶️', label:'Vào việc thôi', fx:() => ({ silent:true }) }] }
  : { icon:'🌇', title: S.otTonight === true ? 'Mọi người ra về' : 'Tan làm', html:P(S.otTonight === true ? 'Văn phòng vắng dần. Bạn ở lại.' : 'Một ngày làm việc khép lại.'), bg:'office', cut:'leave',
      choices:[{ icon:'▶️', label: S.otTonight === true ? 'Ở lại làm tiếp' : 'Về nhà', fx:() => ({ silent:true }) }] };
// Chạy phân cảnh rồi tự đi tiếp; người chơi có thể bấm nút để bỏ qua bất cứ lúc nào
function cutMount(root, ref, sc){
  const box = root.querySelector('.panel.stage'); if (!box) return;
  if (reduceMotion()) { stageMount(root, sc.cut === 'arrive' ? 'arrive' : 'work'); return; }
  const next = () => { if (S.cur === ref) { const b = document.querySelector('#stage .choice'); if (b) b.click(); } };
  const show = (svgHTML, mode, o) => { box.querySelectorAll('svg').forEach(x => x.remove()); box.insertAdjacentHTML('afterbegin', svgHTML); return stageMount(root, mode, o).done; };
  (async () => {
    if (sc.cut === 'arrive') {
      if (!await show(streetSVG(), 'street', { dir:'in' })) return;
      if (!await show(stageSVG(sc.title), 'arrive')) return;
    } else {
      const stay = S.otTonight === true;
      if (!await show(stageSVG(sc.title), 'leave', { stay })) return;
      if (!stay && !await show(streetSVG(), 'street', { dir:'out' })) return;
    }
    next();
  })();
}
