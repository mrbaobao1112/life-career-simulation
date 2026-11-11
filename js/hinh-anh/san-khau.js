/* =========================================================
   v8: SÂN KHẤU SỐNG – thử nghiệm với một ngày đi làm ở công ty
   Văn phòng được vẽ thành một sân khấu: mỗi nhân vật có vị trí, đi lại được, ngồi gõ phím,
   đi lấy nước, sang bàn nhau trò chuyện theo "lịch riêng" của mình.
   Luật chơi không đổi: sân khấu chỉ thay phần hình minh họa của các cảnh ở công ty.
   ========================================================= */
const STAGE = {
  W:360, H:210,
  SPEED:62,                 // tốc độ đi bộ (đơn vị hình mỗi giây)
  AMBIENT:[1600, 3600],     // khoảng nghỉ giữa hai hoạt động của đồng nghiệp (mili giây)
  SIT_UP:10,                // người ngồi được nâng lên chừng này để lộ vai trên mặt bàn
  AISLE_Y:171,              // lối đi giữa hai dãy bàn
  DOOR:{ x:22, y:171 }, WATER:{ x:318, y:171 }, BOARD:{ x:64, y:171 },
  SEAT:{ dung:{ x:112, y:141, row:'back' }, mai:{ x:190, y:141, row:'back' }, boss:{ x:268, y:141, row:'back' },
         me:{ x:128, y:207, row:'front' }, phong:{ x:236, y:207, row:'front' } },
  SCALE:{ back:.42, aisle:.46, front:.5 },
};
// Lịch riêng của từng đồng nghiệp: mỗi buổi họ hay làm gì khi không gõ phím
const OFFICE_ROUTINE = {
  boss:  { morning:['board','type','chat'], afternoon:['meeting','type','board'], greet:'Chào em!', bye:'Về nhé cả nhà!' },
  dung:  { morning:['type','type','water'], afternoon:['type','stretch','chat'], greet:'…', bye:'Về.' },
  mai:   { morning:['chat','water','type'], afternoon:['water','chat','stretch'], greet:'Em đến rồi à!', bye:'Mai gặp nhé!' },
  phong: { morning:['type','chat','stretch'], afternoon:['water','chat','type'], greet:'Ông đến rồi!', bye:'Về thôi ông!' },
};
// Những câu ngắn đồng nghiệp nói với nhau
const OFFICE_CHAT = [['Trưa ăn gì?','Bún chả!'], ['Deploy chưa?','Chiều nhé.'], ['Bug kia sao rồi?','Đang xem…'], ['Cà phê không?','Đi!'], ['Họp mấy giờ?','Ba giờ.'], ['Review giúp tớ.','Ok, gửi đi.']];
// Khi không có sự kiện nào, một đồng nghiệp vẫn ghé qua bàn nói một câu
const OFFICE_DROPBY = { mai:['Chiều chị test bản của em nhé.','Có bánh ở pantry đấy em.'], phong:['Ông ơi, task này khó quá.','Tí đi trà đá không ông?'], dung:['Code hôm qua ổn đấy.','Có gì cứ hỏi anh.'], boss:['Tiến độ ổn chứ em?','Cố lên em nhé.'] };
const COLLEAGUES = ['dung','mai','boss','phong'];

const stageOn = () => !(S.opt && S.opt.stage === false);
// Cảnh nào dùng sân khấu: ban ngày ở công ty, và người xuất hiện (nếu có) là đồng nghiệp trong team
function stageFor(ref, sc){
  if (!S || !stageOn() || !S.job || !isWorkday() || S.day < S.job.start) return false;
  if (ref.id === 'cut') return true;
  if (!['morning','afternoon'].includes(S.slot) || sc.kind || sc.bg !== 'office') return false;
  return !sc.npc || COLLEAGUES.includes(sc.npc);
}

/* ----- Vẽ ----- */
function stageBg(){
  const co_ = S.job ? S.job.co : 'hotay';
  const wall = { hotay:'#E3ECF6', banhmi:'#FFF0D8', cudem:'#ECE6F7', loren:'#EFE6D8' }[co_] || '#E6EEF5';
  const sign = [CO_COLOR[co_] || '#2F6FD1', COMPANIES[co_].name];
  return `<rect width="360" height="210" fill="${wall}"/><rect y="132" width="360" height="78" fill="#C9D1DB"/><rect y="130" width="360" height="3" fill="#B4BDC9"/>
    <rect x="6" y="50" width="32" height="82" rx="2" fill="#8C6E54"/><rect x="10" y="54" width="24" height="74" rx="1" fill="#A98463"/><circle cx="30" cy="94" r="2" fill="#F2D27A"/>
    <rect x="50" y="18" width="66" height="46" rx="3" fill="#fff" stroke="#B9C2CC" stroke-width="2"/><rect x="57" y="25" width="12" height="10" fill="#F6C85F"/><rect x="74" y="25" width="12" height="10" fill="#9FD3B4"/><rect x="91" y="25" width="12" height="10" fill="#F7A1A8"/><rect x="57" y="42" width="12" height="10" fill="#9FC2F2"/><rect x="74" y="42" width="12" height="10" fill="#F6C85F"/>
    ${win(140, 16, 96, 44)}
    <rect x="252" y="16" width="${Math.max(70, sign[1].length * 6.4 + 14)}" height="20" rx="4" fill="${sign[0]}"/>${T(252 + Math.max(70, sign[1].length * 6.4 + 14) / 2, 30, sign[1], '#fff', 10)}
    <rect x="322" y="84" width="26" height="48" rx="3" fill="#EEF3F8" stroke="#B9C2CC" stroke-width="1.5"/><rect x="326" y="70" width="18" height="16" rx="6" fill="#9FD0F5" opacity=".85"/><rect x="331" y="100" width="8" height="5" rx="1" fill="#4A90D9"/>
    <ellipse cx="300" cy="126" rx="9" ry="5" fill="#B5603F"/><path d="M300 124 Q292 104 296 96 M300 124 Q306 100 304 92 M300 124 Q312 110 314 102" stroke="#2F8257" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}
function deskSVG(x, y, screen){
  // bàn làm việc: nhân vật ngồi phía sau, mặt bàn che phần thân dưới
  return `<rect x="${x - 34}" y="${y - 27}" width="68" height="6" rx="2" fill="#8C6E54"/><rect x="${x - 31}" y="${y - 21}" width="62" height="24" fill="#A98463"/>
    <rect x="${x + 12}" y="${y - 39}" width="18" height="12" rx="1.5" fill="#2B3240"/><rect x="${x + 14}" y="${y - 37}" width="14" height="8" fill="${screen}"/><rect x="${x + 9}" y="${y - 28}" width="24" height="2" rx="1" fill="#59606C"/>`;
}
function actorSVG(who, expr){
  const me = who === 'me', look = me ? playerLook() : NPC[who].look;
  const body = chibi(look, expr || (me ? playerExpr() : defaultNpcExpr(who)), me ? { dark:darkCircles() } : {});
  return `<g class="actor snap" data-who="${who}" ${me ? '' : `data-npc="${who}"`} role="button" aria-label="${me ? esc(S.name) : NPC[who].name}"><g class="sc"><g class="flip"><g class="cb cb-idle">${body}</g></g></g></g>`;
}
function stageSVG(label){
  const Z = STAGE.SEAT, sc = ['#9FC2F2','#B8E0C2','#F7D9A0'];
  return `<svg viewBox="0 0 360 210" role="img" aria-label="${esc(label || 'Văn phòng')}">${stageBg()}${S.slot === 'afternoon' ? '<rect width="360" height="210" fill="#FF8A4C" opacity=".06"/>' : ''}
    <g class="L-back"></g>${deskSVG(Z.dung.x, Z.dung.y, sc[0])}${deskSVG(Z.mai.x, Z.mai.y, sc[1])}${deskSVG(Z.boss.x, Z.boss.y, sc[2])}
    <g class="L-aisle"></g><g class="L-front"></g>${deskSVG(Z.me.x, Z.me.y, sc[1])}${deskSVG(Z.phong.x, Z.phong.y, sc[0])}<g class="L-say"></g></svg>`;
}
function streetSVG(){
  return `<svg viewBox="0 0 360 210" role="img" aria-label="Đường trước công ty"><g transform="translate(0 15)">${bgSVG('street')}</g><rect y="0" width="360" height="16" fill="${SKY[S.slot] || SKY.morning}"/><rect y="190" width="360" height="20" fill="#7A8290"/>
    <rect x="318" y="96" width="42" height="64" fill="#5D6B7E"/><rect x="326" y="112" width="26" height="48" rx="2" fill="#A98463"/>${T(339, 108, 'Công ty', '#fff', 8)}
    <g class="L-aisle"></g><g class="L-say"></g></svg>`;
}

/* ----- Đạo diễn: điều khiển các nhân vật trên sân khấu đang hiện ----- */
let stageRun = 0;                                             // mỗi lần dựng sân khấu mới, các hoạt cảnh cũ tự dừng
function stageMount(root, mode, o = {}){
  const run = ++stageRun, svg = root.querySelector('svg'), A = {}, still = reduceMotion();
  const alive = () => run === stageRun && !!window.document && !!document.body && document.body.contains(svg);
  const wait = ms => new Promise(r => setTimeout(() => r(alive()), ms));
  const layer = n => svg.querySelector('.L-' + n);
  const place = (a, x, y, lay) => {
    a.x = x; a.y = y; if (lay && a.lay !== lay) { a.lay = lay; layer(lay === 'aisle' ? 'aisle' : lay).appendChild(a.el); }
    const s = a.s || STAGE.SCALE[a.lay] || .46;
    a.el.querySelector('.sc').setAttribute('transform', `translate(${-60 * s} ${-140 * s}) scale(${s})`);
    a.el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const act = (a, name) => { const cb = a.el.querySelector('.cb'); cb.setAttribute('class', 'cb cb-idle' + (name ? ' ' + name : '')); a.act = name; };
  const add = (who, x, y, lay, name, expr) => {
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'g'); tmp.innerHTML = actorSVG(who, expr);
    const a = A[who] = { who, el:tmp.firstChild, busy:false }; place(a, x, y, lay); act(a, name); return a;
  };
  const snap = (a, x, y, lay) => { a.el.classList.add('snap'); place(a, x, y, lay); void a.el.getBoundingClientRect(); };
  const walk = async (a, x, y) => {
    if (still) { snap(a, x, y); return alive(); }
    const d = Math.hypot(x - a.x, y - a.y), ms = Math.max(120, d / STAGE.SPEED * 1000);
    a.el.classList.toggle('left', x < a.x); a.el.classList.remove('snap'); a.el.style.transitionDuration = ms + 'ms';
    act(a, 'act-walk'); place(a, x, y);
    const ok = await wait(ms); if (ok) act(a, ''); return ok;
  };
  const face = (a, left) => a.el.classList.toggle('left', !!left);
  const say = (a, text, ms = 1500) => {
    if (!alive()) return Promise.resolve(false);
    const s = a.s || STAGE.SCALE[a.lay] || .46, w = Math.max(22, text.length * 4.9 + 12), x = Math.min(STAGE.W - w - 3, Math.max(3, a.x - w / 2)), y = Math.max(3, a.y - 140 * s - 17);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'say');
    g.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="15" rx="7" fill="#fff" stroke="#B9C2CC"/><path d="M${a.x - 3} ${y + 14.5} L${a.x} ${y + 19} L${a.x + 3} ${y + 14.5}Z" fill="#fff" stroke="#B9C2CC" stroke-width=".8"/><rect x="${a.x - 3.4}" y="${y + 13}" width="6.8" height="2" fill="#fff"/><text x="${x + w / 2}" y="${y + 10.6}" text-anchor="middle" font-size="8.6" font-weight="600" fill="#1B2230" font-family="Be Vietnam Pro,Arial,sans-serif">${esc(text)}</text>`;
    layer('say').appendChild(g); setTimeout(() => g.remove(), ms); return wait(still ? 0 : ms);
  };
  const react = (a, anim) => { if (still) return; const cb = a.el.querySelector('.cb'); cb.classList.remove('anim-' + anim); void cb.getBoundingClientRect(); cb.classList.add('anim-' + anim); setTimeout(() => cb.classList.remove('anim-' + anim), 1200); };
  // rời ghế ra lối đi, và quay về ghế
  const stand = a => { const z = STAGE.SEAT[a.who]; snap(a, z.x + 30, STAGE.AISLE_Y + (z.row === 'front' ? 3 : -2), 'aisle'); act(a, ''); };
  const sit = a => { const z = STAGE.SEAT[a.who]; snap(a, z.x, z.y - STAGE.SIT_UP, z.row); face(a, false); act(a, 'act-type'); };
  const goSit = async a => { const z = STAGE.SEAT[a.who]; if (!await walk(a, z.x + 30, STAGE.AISLE_Y + (z.row === 'front' ? 3 : -2))) return false; sit(a); return true; };
  const seatAll = (skip = []) => COLLEAGUES.forEach(k => { if (!skip.includes(k)) { const z = STAGE.SEAT[k]; add(k, z.x, z.y - STAGE.SIT_UP, z.row, 'act-type'); } });

  // chạm vào ai thì người đó phản ứng (chỉ để cho vui, không ảnh hưởng chỉ số)
  svg.addEventListener('click', e => {
    const el = e.target.closest('.actor'); if (!el) return;
    const a = A[el.dataset.who]; if (!a) return;
    react(a, a.who === 'me' ? pick(['wave','jump','cheer']) : pick(['hop','nod','wave']));
    say(a, a.who === 'me' ? playerQuip() : pick(NPC_QUIP[a.who] || ['…']), 1500); SFX.play(a.who === 'me' ? 'hop' : 'talk');
  });

  /* ----- Hoạt động riêng của đồng nghiệp ----- */
  const doing = {
    type: async a => wait(1200),
    stretch: async a => { react(a, 'stretch'); return wait(1500); },
    water: async a => { stand(a); if (!await walk(a, STAGE.WATER.x, STAGE.WATER.y)) return; act(a, 'act-drink'); if (!await wait(2600)) return; return goSit(a); },
    board: async a => { stand(a); if (!await walk(a, STAGE.BOARD.x, STAGE.BOARD.y)) return; face(a, false); act(a, 'act-talk'); if (!await wait(2200)) return; return goSit(a); },
    meeting: async a => { stand(a); await say(a, 'Chị đi họp nhé.', 1300); if (!await walk(a, STAGE.DOOR.x, STAGE.DOOR.y)) return; a.el.classList.add('gone'); if (!await wait(7000)) return; a.el.classList.remove('gone'); return goSit(a); },
    chat: async a => {
      const others = COLLEAGUES.filter(k => k !== a.who && A[k] && !A[k].busy && A[k].act === 'act-type'); if (!others.length) return wait(800);
      const b = A[pick(others)], z = STAGE.SEAT[b.who], line = pick(OFFICE_CHAT); b.busy = true;
      stand(a);
      if (await walk(a, z.x - 30, STAGE.AISLE_Y + (z.row === 'front' ? 3 : -2))) {
        face(a, false); act(a, 'act-talk'); act(b, 'act-talk'); face(b, true);
        if (await say(a, line[0], 1500)) await say(b, line[1], 1400);
        if (alive()) { act(b, 'act-type'); face(b, false); }
      }
      b.busy = false; if (alive()) return goSit(a);
    },
  };
  const ambient = async () => {
    while (await wait(STAGE.AMBIENT[0] + Math.random() * (STAGE.AMBIENT[1] - STAGE.AMBIENT[0]))) {
      const free = COLLEAGUES.filter(k => A[k] && !A[k].busy && A[k].act === 'act-type' && !A[k].el.classList.contains('gone')); if (!free.length) continue;
      const a = A[pick(free)], list = (OFFICE_ROUTINE[a.who][S.slot] || ['type']);
      a.busy = true; doing[pick(list)](a).then(() => { a.busy = false; });
    }
  };

  /* ----- Các phân cảnh ----- */
  const Z = STAGE.SEAT;
  if (mode === 'work' || mode === 'visit') {
    seatAll(mode === 'visit' ? [o.npc] : []);
    const me = add('me', Z.me.x, Z.me.y - STAGE.SIT_UP, 'front', mode === 'visit' ? 'act-talk' : 'act-type', o.meExpr);
    if (o.meAnim) react(me, o.meAnim);
    if (mode === 'visit') {                                   // một đồng nghiệp đến bàn bạn trao đổi
      const v = add(o.npc, Z[o.npc].x + 30, STAGE.AISLE_Y, 'aisle', '', o.npcExpr); v.busy = true;
      if (still) { snap(v, Z.me.x + 46, STAGE.AISLE_Y + 4); face(v, true); }
      else (async () => { if (!await walk(v, Z.me.x + 46, STAGE.AISLE_Y + 4)) return; face(v, true); act(v, 'act-talk'); if (o.line) say(v, o.line, 1800); })();
    } else if (o.dropby && !still) {                          // không có sự kiện: vẫn có người ghé qua nói một câu
      (async () => { if (!await wait(2600)) return; const k = pick(COLLEAGUES.filter(x => A[x] && !A[x].busy)); if (!k) return; const v = A[k]; v.busy = true; stand(v);
        if (await walk(v, Z.me.x + 46, STAGE.AISLE_Y + 4)) { face(v, true); act(v, 'act-talk'); react(me, 'nod'); await say(v, pick(OFFICE_DROPBY[k]), 2200); if (alive()) await goSit(v); }
        v.busy = false; })();
    }
    if (!still) ambient();
  }
  else if (mode === 'arrive') {
    seatAll();
    const me = add('me', still ? Z.me.x : -14, still ? Z.me.y - STAGE.SIT_UP : STAGE.AISLE_Y, still ? 'front' : 'aisle', still ? 'act-type' : '');
    if (still) return { done:Promise.resolve(false) };
    return { done:(async () => {
      if (!await walk(me, 70, STAGE.AISLE_Y)) return false;
      react(me, 'wave'); SFX.play('talk');
      for (const k of ['dung','mai','boss','phong']) { const a = A[k]; if (S.lateToday && k === 'boss') { react(a, 'shake'); say(a, 'Muộn rồi đấy em.', 1500); } else { react(a, k === 'dung' ? 'nod' : 'wave'); say(a, OFFICE_ROUTINE[k].greet, 1300); } if (!await wait(420)) return false; }
      if (!await wait(700)) return false;
      if (!await goSit(me)) return false;
      ambient(); return wait(900);
    })() };
  }
  else if (mode === 'leave') {
    seatAll(); const me = add('me', Z.me.x, Z.me.y - STAGE.SIT_UP, 'front', 'act-type');
    if (still) return { done:Promise.resolve(false) };
    return { done:(async () => {
      if (!await wait(600)) return false;
      for (const k of ['mai','phong','boss','dung']) { const a = A[k];
        (async () => { stand(a); react(a, 'wave'); say(a, OFFICE_ROUTINE[k].bye, 1200); if (!await wait(650)) return; if (await walk(a, STAGE.DOOR.x, STAGE.DOOR.y)) a.el.classList.add('gone'); })();
        if (!await wait(900)) return false; }
      if (o.stay) { say(me, 'Mình ở lại thêm…', 1800); return wait(2600); }      // tối nay OT: mọi người về, bạn ở lại
      stand(me); react(me, 'stretch'); if (!await wait(1100)) return false;
      if (!await walk(me, STAGE.DOOR.x, STAGE.DOOR.y)) return false; me.el.classList.add('gone'); return wait(350);
    })() };
  }
  else if (mode === 'street') {
    // đi xe máy tới, xuống xe, đi bộ vào cửa công ty (hoặc ngược lại lúc về)
    const gY = 176, me = add('me', 0, gY, 'aisle', ''); me.s = .4; place(me, 0, gY);
    const bike = document.createElementNS('http://www.w3.org/2000/svg', 'g'); bike.setAttribute('class', 'actor snap'); bike.innerHTML = `<g transform="scale(1.5)">${moto(-11, -4, '#E5484D').replace(/<circle cx="3" cy="-22"[^>]*>/, '')}</g>`;
    layer('aisle').appendChild(bike);
    const setB = (x, ms) => { bike.classList.toggle('snap', !ms); bike.style.transitionDuration = (ms || 0) + 'ms'; bike.style.transform = `translate(${x}px, ${gY + 2}px)`; };
    const ride = async (from, to, ms) => { me.el.classList.add('snap'); me.el.style.transform = `translate(${from}px, ${gY - 6}px)`; setB(from); void bike.getBoundingClientRect(); act(me, 'act-ride');
      me.el.classList.toggle('left', to < from); me.el.classList.remove('snap'); me.el.style.transitionDuration = ms + 'ms'; me.el.style.transform = `translate(${to}px, ${gY - 6}px)`; setB(to, ms); return wait(ms); };
    if (still) return { done:Promise.resolve(false) };
    if (o.dir === 'in') return { done:(async () => {
      SFX.play('pop'); if (!await ride(-30, 150, 1500)) return false;
      act(me, ''); me.el.classList.add('snap'); me.x = 168; me.y = gY; me.el.style.transform = `translate(168px, ${gY}px)`; void me.el.getBoundingClientRect();
      if (!await wait(350)) return false;
      return walk(me, 338, gY);
    })() };
    return { done:(async () => {
      setB(150); me.x = 338; me.y = gY; me.el.classList.add('snap'); me.el.style.transform = `translate(338px, ${gY}px)`; void me.el.getBoundingClientRect();
      if (!await walk(me, 168, gY)) return false; if (!await wait(300)) return false;
      return ride(150, -40, 1500);
    })() };
  }
  return { done:null };
}

/* ----- Ghép vào màn chơi ----- */
// Trả về phần hình của cảnh, kèm việc cần làm sau khi hình đã nằm trên trang
function stagePanel(ref, sc, o = {}){
  const visit = sc.npc && COLLEAGUES.includes(sc.npc);
  const html = `<div class="panel stage">${stageSVG(sc.title)}</div>`;
  const mount = root => {
    const line = sc.talk && sc.talk.length ? '…' : '';
    if (visit) stageMount(root, 'visit', { npc:sc.npc, npcExpr:o.npcExpr || sc.npcExpr, meExpr:o.meExpr, meAnim:o.meAnim, line });
    else stageMount(root, 'work', { meExpr:o.meExpr, meAnim:o.meAnim, dropby: ref && ref.id === 'task' && S.slot === 'morning' && !o.result });
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
