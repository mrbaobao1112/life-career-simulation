/* =========================================================
   v9: SỐNG Ở MỌI NƠI – nhà, quán cà phê, vỉa hè trà đá, hồ, thư viện, trung tâm thương mại, phòng phỏng vấn
   Dùng lại phần lõi của sân khấu văn phòng (san-khau.js). Mỗi địa điểm khai báo bằng dữ liệu:
   chỗ đứng, đồ vật, ai có mặt và họ làm gì. Luật chơi không đổi, chỉ thay phần hình của cảnh.
   ========================================================= */
const LIVE = {
  S:.6, GY:174,              // cỡ nhân vật và mặt đất
  SPEED:58,                  // tốc độ đi bộ
  WANDER:[2400, 4800],       // khoảng nghỉ giữa hai lần nhân vật tự đi lại (mili giây)
  PASSER:[2600, 6000],       // khoảng cách giữa hai người qua đường
};
// Mỗi việc lúc rảnh ứng với một tư thế
const ACT_POSE = { study:'study', prep:'study', jobs:'study', cv:'study', budget:'study', game:'game', film:'film', rest:'sleep', clean:'clean', family:'phone', family2:'table', run:'run', shop:'shop', cafe:'seat', trada:'seat' };
// Người ở cùng nhà làm gì theo buổi (mỗi mục: [chỗ, động tác])
const HOME_CAST = {
  nha:  { mom:{ morning:[['stove','act-cook'],['mid','act-sweep']], noon:[['stove','act-cook']], afternoon:[['mid','act-sweep'],['tableR','act-read']], evening:[['stove','act-cook'],['tableR','act-talk']], night:[['tableR','act-read']] },
          dad:{ morning:[['tableL','act-read']], noon:[['tableL','act-eat']], afternoon:[['tableL','act-read'],['right','act-phone']], evening:[['tableL','act-read']], night:[['tableL','act-read']] } },
  ghep: { tung:{ morning:[['bed','act-sleep']], noon:[['tv','act-game']], afternoon:[['tv','act-game'],['right','act-phone']], evening:[['tv','act-game'],['tableR','act-eat']], night:[['tv','act-game']] } },
  tro:  {},
};
const HOME_SPOT = { bed:{ x:104, y:152 }, bedSit:{ x:58, y:158 }, wake:{ x:128 }, mid:{ x:168 }, right:{ x:300 }, stove:{ x:318 }, tv:{ x:262 }, tableL:{ x:216, y:168 }, tableR:{ x:258, y:168 }, talkMe:{ x:140 }, talkNpc:{ x:204 } };
const PASSER_LOOKS = [
  { g:'nam', hair:'hair_short', hairColor:'#2B2321', skin:'#E8B48C', outfit:{ kind:'tee', color:'#5B8DEF' } },
  { g:'nu', hair:'hair_long', hairColor:'#3A2A22', skin:'#FFE6D5', outfit:{ kind:'cardigan', color:'#E9A23B' } },
  { g:'nam', hair:'hair_side', hairColor:'#5A5A62', skin:'#E8B48C', outfit:{ kind:'polo', color:'#6D8B74' } },
  { g:'nu', hair:'hair_bob', hairColor:'#4A3226', skin:'#FFD6BA', outfit:{ kind:'tee', color:'#F7A1A8' } },
  { g:'nam', hair:'hair_spiky', hairColor:'#2B2321', skin:'#FFD6BA', outfit:{ kind:'hoodie', color:'#3B4252' } },
];

let passerN = 0;

/* ----- Đồ vật thêm vào bối cảnh có sẵn ----- */
function homeProps(pose){
  const back = `<rect x="8" y="128" width="8" height="46" rx="2" fill="#8C6E54"/><rect x="12" y="150" width="98" height="12" rx="3" fill="#F4F1EA" stroke="#C9BFAE"/><rect x="12" y="160" width="98" height="12" fill="#8C6E54"/><rect x="18" y="140" width="26" height="12" rx="5" fill="#fff" stroke="#D5CCBB"/>
    ${S.bg !== 'ghep' ? `<rect x="306" y="150" width="30" height="24" rx="2" fill="#B9C2CC"/><rect x="309" y="146" width="24" height="5" rx="1" fill="#59606C"/><ellipse cx="321" cy="144" rx="9" ry="4" fill="#3A3F4B"/>` : ''}`;
  const lap = ['study','game'].includes(pose) && !(pose === 'game' && S.bg === 'ghep');
  const front = `<rect x="196" y="144" width="84" height="6" rx="2" fill="#8C6E54"/><rect x="202" y="150" width="6" height="24" fill="#7A5E47"/><rect x="268" y="150" width="6" height="24" fill="#7A5E47"/>
    ${lap ? '<rect x="222" y="133" width="18" height="11" rx="1.5" fill="#2B3240"/><rect x="224" y="135" width="14" height="7" fill="#9FC2F2"/>' : ''}
    ${['eat','table'].includes(pose) ? '<ellipse cx="216" cy="143" rx="9" ry="2.6" fill="#fff" stroke="#C9BFAE"/><ellipse cx="258" cy="143" rx="9" ry="2.6" fill="#fff" stroke="#C9BFAE"/><ellipse cx="237" cy="142" rx="8" ry="3" fill="#E9A23B"/>' : ''}`;
  const blanket = c => `<path d="M56 140 Q82 132 108 142 L110 164 L52 164Z" fill="${c}" stroke="#00000022"/>`;
  return { back, front, blanket };
}
function tableProp(x1, x2, y){ return `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="6" rx="2" fill="#8C6E54"/><rect x="${x1 + 6}" y="${y + 6}" width="5" height="${174 - y - 6}" fill="#7A5E47"/><rect x="${x2 - 11}" y="${y + 6}" width="5" height="${174 - y - 6}" fill="#7A5E47"/>`; }
function rainSVG(){ let s = '<g class="rain">'; for (let i = 0; i < 34; i++) { const x = (i * 37) % 380, y = (i * 53) % 200 - 20; s += `<path d="M${x} ${y} l-4 12" stroke="#E3F0FF" stroke-width="1.4" opacity=".75"/>`; } return s + '</g>'; }

/* ----- Cảnh nào dựng được thành cảnh sống, và dựng thế nào ----- */
function liveSpec(ref, sc, res){
  if (!S || !stageOn() || !ref || sc.kind) return null;
  let key = (res && res.bg) || sc.bg || 'home'; if (key === 'home') key = 'room_' + S.bg;
  const kind = key.split('_')[0], npc = res && res.npc !== undefined ? res.npc : sc.npc;
  if (!['room','cafe','sidewalk','biahoi','lake','library','mall','lobby','office'].includes(kind)) return null;
  let pose = 'idle';
  if (res) pose = ACT_POSE[res.actId] || (ref.id === 'meal' ? 'eat' : npc ? 'talk' : 'idle');
  else if (ref.id === 'wake') pose = S.day === 1 ? 'idle' : 'wake';
  else if (ref.id === 'meal') pose = 'eat';
  else if (ref.id === 'plan' || ref.id === 'repay' || ref.id === 'bill_short' || ref.id === 'd1_cv' || ref.id === 'apply' || ref.id === 'reapply') pose = 'study';
  else if (ref.id === 'homework') pose = 'study';
  else if (npc) pose = 'talk';
  if (kind !== 'room' && !['run','shop'].includes(pose)) pose = kind === 'lake' ? 'run' : kind === 'mall' ? 'shop' : npc ? (kind === 'office' || kind === 'lobby' ? 'interview' : 'seat') : kind === 'lobby' ? 'wait' : 'idle';
  return { key, kind, npc, pose, res:!!res, meExpr:(res && res.meExpr) || sc.meExpr, npcExpr:(res && res.npcExpr) || sc.npcExpr, meAnim:res && res.meAnim };
}
function liveSVG(spec, label){
  const hp = spec.kind === 'room' ? homeProps(spec.pose) : null;
  const outdoor = ['sidewalk','lake','biahoi'].includes(spec.kind), rain = outdoor && S.flags.rainDay === S.day;
  const front = hp ? hp.front : spec.pose === 'interview' ? tableProp(150, 210, 142) : spec.kind === 'library' ? '' : '';
  return `<svg viewBox="0 0 360 180" role="img" aria-label="${esc(label || 'Minh họa cảnh')}">${bgSVG(spec.key)}${hp ? hp.back : ''}
    <g class="L-back"></g><g class="L-aisle"></g>${front}<g class="L-front"></g>${tintSVG()}${rain ? rainSVG() : ''}<g class="L-say"></g></svg>`;
}

function liveMount(root, spec){
  const C = stageCore(root), { A, still, alive, wait, layer, place, act, add, snap, face, say, react } = C;
  const s = LIVE.S, GY = LIVE.GY;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const walk = async (a, x, y) => { const sp = STAGE.SPEED; STAGE.SPEED = a.speed || LIVE.SPEED; const p = C.walk(a, x, y === undefined ? a.y : y); STAGE.SPEED = sp; const ok = await p; if (ok && a.moveAct) act(a, a.moveAct); return ok; };
  const mk = (who, x, y, name, expr, o = {}) => add(who, x, y === undefined ? GY : y, o.lay || 'aisle', name, expr, { s:o.s || s, ...o });
  // người qua đường: đi ngang phía sau, nhỏ hơn một chút
  const passers = async (y, sc2, runMode) => {
    let first = true;
    while (await wait(first ? rnd(500, 1600) : rnd(...LIVE.PASSER) * (runMode ? .7 : 1))) {
      first = false; if (svgCount() > 6) continue;
      const left = Math.random() < .5, id = 'p' + (++passerN), a = mk('p', left ? 380 : -20, y, '', 'neutral', { id, look:pick(PASSER_LOOKS), s:sc2, lay:'back' });
      a.speed = runMode ? 120 : rnd(40, 62); a.moveAct = null;
      if (runMode) { a.el.querySelector('.cb').classList.add('act-run'); }
      walk(a, left ? -24 : 384, y).then(() => { a.el.remove(); delete A[id]; });
      if (runMode) setTimeout(() => { if (alive() && A[id]) a.el.querySelector('.cb').setAttribute('class', 'cb cb-idle act-walk act-run'); }, 30);
    }
  };
  const svgCount = () => Object.keys(A).length;
  const P = HOME_SPOT;
  let me;

  if (spec.kind === 'room') {
    const hp = homeProps(spec.pose);
    const lie = (who, o = {}) => { const a = mk(who, P.bed.x, P.bed.y, 'act-sleep', o.expr || 'tired', { ...o, rot:-90 });
      const b = document.createElementNS('http://www.w3.org/2000/svg', 'g'); b.setAttribute('class', 'blanket'); b.innerHTML = hp.blanket(o.color || '#9FC2F2') + '<text class="zz" x="34" y="126" font-size="13" font-weight="800" fill="#7C8AA5" font-family="Be Vietnam Pro,Arial,sans-serif">z</text><text class="zz z2" x="44" y="114" font-size="10" font-weight="800" fill="#7C8AA5" font-family="Be Vietnam Pro,Arial,sans-serif">z</text>';
      layer('aisle').appendChild(b); a.blanket = b; return a; };
    const getUp = a => { if (a.blanket) { a.blanket.remove(); a.blanket = null; } a.rot = 0; snap(a, P.wake.x, GY); act(a, ''); };
    // người ở cùng
    const cast = HOME_CAST[S.bg] || {}, others = [];
    const inScene = spec.npc === 'family' ? ['mom','dad'] : spec.npc && NPC[spec.npc] ? [spec.npc] : [];
    for (const [who, plan] of Object.entries(cast)) {
      if (inScene.includes(who) || spec.pose === 'table') continue;
      if ((S.day * 7 + who.length * 13 + SLOTS.indexOf(S.slot) * 5) % 10 < 2) continue;      // có buổi người này đi vắng
      const opts = plan[S.slot] || plan.evening, [spot, name] = opts[(S.day + who.length) % opts.length];
      if (spot === 'bed') { if (['sleep','wake','film'].includes(spec.pose)) continue; others.push(lie(who, { color:'#F6C85F' })); continue; }
      if (['tableL','tableR'].includes(spot) && ['eat','study'].includes(spec.pose) && spot === 'tableL') continue;
      const a = mk(who, P[spot].x, P[spot].y, name); a.home = { spot, name, opts }; if (spot === 'tv' || spot === 'stove') face(a, false); others.push(a);
    }
    // nhân vật chính
    if (spec.pose === 'wake') {
      me = lie('me', { expr:'tired' });
      if (still) getUp(me);
      else (async () => { if (!await wait(900)) return; getUp(me); react(me, wakeAnimKey()); if (!await wait(ANIM.WAKE_MS)) return; await walk(me, P.mid.x); })();
    } else if (spec.pose === 'sleep') { me = lie('me', { expr:'tired' }); }
    else if (spec.pose === 'film') { me = mk('me', P.bedSit.x, P.bedSit.y, 'act-phone', spec.meExpr); }
    else if (spec.pose === 'eat') { me = mk('me', P.tableL.x, P.tableL.y, 'act-eat', spec.meExpr); }
    else if (spec.pose === 'study') { me = mk('me', P.tableL.x + 14, P.tableL.y, 'act-type', spec.meExpr); }
    else if (spec.pose === 'game') { me = S.bg === 'ghep' ? mk('me', P.tv.x - 44, GY, 'act-game', 'happy') : mk('me', P.tableL.x + 14, P.tableL.y, 'act-game', 'happy'); }
    else if (spec.pose === 'phone') { me = mk('me', P.mid.x, GY, 'act-phone', 'happy'); }
    else if (spec.pose === 'clean') { me = mk('me', P.mid.x, GY, 'act-sweep'); me.moveAct = 'act-sweep';
      if (!still) (async () => { while (alive()) { if (!await walk(me, rnd(124, 190))) return; if (!await wait(500)) return; if (!await walk(me, rnd(284, 300))) return; if (!await wait(500)) return; } })(); }
    else if (spec.pose === 'table') {                          // ngồi uống trà, trò chuyện với bố mẹ
      me = mk('me', P.tableL.x - 4, P.tableL.y, 'act-talk', 'happy'); const m = mk('mom', P.tableR.x - 6, P.tableR.y, 'act-talk', 'happy'), d = mk('dad', P.tableR.x + 34, P.tableR.y, 'act-drink'); face(m, true); face(d, true); }
    else if (spec.pose === 'talk') {
      me = mk('me', P.talkMe.x, GY, 'act-talk', spec.meExpr);
      inScene.forEach((who, i) => { const a = mk(who, still ? P.talkNpc.x + i * 44 : 380, GY, '', spec.npcExpr); a.busy = true;
        if (still) { face(a, true); return; }
        (async () => { if (!await wait(i * 350)) return; if (!await walk(a, P.talkNpc.x + i * 44)) return; face(a, true); act(a, i ? '' : 'act-talk'); })(); });
    } else {                                                   // rảnh rỗi: tự đi lại trong phòng
      me = mk('me', P.mid.x, GY, '', spec.meExpr);
      if (!still) (async () => { while (await wait(rnd(...LIVE.WANDER))) { if (me.chatting) continue; if (Math.random() < .3) { react(me, pick(['stretch','nod'])); continue; } if (!await walk(me, rnd(126, 196))) return; } })();
    }
    if (spec.meAnim && me && !me.rot) react(me, spec.meAnim);
    // người ở cùng chủ động đến bắt chuyện: ai hòa đồng thì hay sang, câu nói tùy hoàn cảnh của bạn
    if (!still && me && !me.rot && !['talk','table','clean','wake'].includes(spec.pose)) (async () => {
      while (await wait(rnd(5200, 9500))) {
        const a = others.filter(x => x.home && !x.busy && !x.rot).find(x => Math.random() < personaOf(x.who).social * .7); if (!a || me.chatting) continue;
        const t = pickTalk(a.who); if (!t) continue;
        a.busy = true; me.chatting = true; const back = { x:a.x, y:a.y, act:a.act }, mine = me.act;
        if (await walk(a, me.x + (a.x < me.x ? -46 : 46), GY)) {
          face(a, me.x < a.x); face(me, a.x < me.x);
          act(a, 'act-talk'); act(me, 'act-listen'); SFX.play('talk');
          if (await say(a, t.lines[0], Math.max(1400, t.lines[0].length * 95))) {
            act(a, 'act-listen'); act(me, 'act-talk');
            if (await say(me, t.lines[1], 1400)) { if (t.fun) { act(a, 'act-laugh'); act(me, 'act-laugh'); await wait(1000); } chatBond(a.who); }
          }
          if (alive()) { act(me, mine); face(me, false); if (await walk(a, back.x, back.y)) { act(a, back.act); face(a, false); } }
        }
        a.busy = false; me.chatting = false;
      }
    })();
    // người ở cùng thỉnh thoảng đổi việc
    if (!still) (async () => { while (await wait(rnd(4200, 7600))) { const a = pick(others.filter(x => x.home && !x.busy)); if (!a) continue; const [spot, name] = pick(a.home.opts); if (spot === 'bed' || spot === a.home.spot) continue;
      if (['tableL'].includes(spot) && ['eat','study','game'].includes(spec.pose)) continue;
      a.busy = true; if (await walk(a, P[spot].x, P[spot].y || GY)) { act(a, name); a.home.spot = spot; face(a, false); } a.busy = false; } })();
    return;
  }

  // ----- các địa điểm ngoài nhà -----
  const npcs = spec.npc === 'family' ? ['mom'] : spec.npc && NPC[spec.npc] ? [spec.npc] : [];
  if (spec.pose === 'run') {
    me = mk('me', 60, GY, 'act-walk act-run', 'happy'); me.speed = 118; me.moveAct = null;
    if (!still) { stageRunLoop(C, me, 40, 322, 118); passers(160, .46, true); }
    return;
  }
  if (spec.pose === 'shop') {
    me = mk('me', 80, GY, '', 'happy');
    if (!still) { stageRunLoop(C, me, 50, 310, 46, 900); passers(160, .46); passers(158, .44); }
    return;
  }
  if (spec.pose === 'wait') {                                  // sảnh công ty trước giờ phỏng vấn
    me = mk('me', still ? 150 : -20, GY, '', spec.meExpr || 'panic');
    if (!still) { (async () => { if (!await walk(me, 150)) return; while (await wait(rnd(1800, 3000))) react(me, pick(['jitter','nod'])); })(); passers(162, .48); }
    return;
  }
  if (spec.pose === 'interview') {
    me = mk('me', 126, GY, 'act-talk', spec.meExpr); const v = mk(npcs[0], 236, GY, 'act-talk', spec.npcExpr); face(v, true);
    if (spec.meAnim) react(me, spec.meAnim); else if (!still) (async () => { while (await wait(rnd(2200, 3600))) react(me, 'jitter'); })();
    return;
  }
  // ngồi quanh bàn: cà phê, trà đá, bia hơi, thư viện
  const low = ['sidewalk','biahoi'].includes(spec.kind) ? 9 : 0, gap = spec.kind === 'library' ? 52 : 40;
  const myAct = spec.kind === 'library' ? 'act-read' : spec.kind === 'biahoi' ? 'act-drink' : 'act-talk';
  me = mk('me', 180 - gap, GY + low * .4, npcs.length ? myAct : 'act-drink', spec.meExpr || 'happy', { dy:low });
  npcs.forEach((who, i) => { const a = mk(who, 180 + gap + i * 40, GY + low * .4, spec.kind === 'library' ? 'act-read' : spec.kind === 'biahoi' ? 'act-drink' : 'act-talk', spec.npcExpr || 'happy', { dy:low }); face(a, true); a.seat = true; });
  if (spec.meAnim) react(me, spec.meAnim);
  if (!still) {
    // hai người lần lượt nói và uống
    if (npcs.length && spec.kind !== 'library') (async () => { const o = A[npcs[0]]; let t = 0; while (await wait(rnd(1700, 2600))) { t++; act(me, t % 2 ? 'act-drink' : 'act-talk'); act(o, t % 2 ? 'act-talk' : 'act-drink'); if (t % 3 === 0) react(pick([me, o]), 'bob'); } })();
    passers(spec.kind === 'cafe' ? 158 : 160, .44);
  }
}
// đi qua đi lại giữa hai điểm (chạy bộ, dạo trung tâm thương mại)
function stageRunLoop(C, a, x1, x2, speed, pause = 0){
  (async () => {
    let to = x2;
    while (C.alive()) {
      const sp = STAGE.SPEED; STAGE.SPEED = speed; const p = C.walk(a, to, a.y); STAGE.SPEED = sp;
      if (speed > 90) a.el.querySelector('.cb').classList.add('act-run');
      if (!await p) return; if (pause && !await C.wait(pause)) return;
      to = to === x2 ? x1 : x2;
    }
  })();
}

/* ----- Ghép vào màn chơi ----- */
function livePanel(ref, sc, res){
  const spec = liveSpec(ref, sc, res); if (!spec) return null;
  return { html:`<div class="panel stage">${liveSVG(spec, sc.title)}</div>`, mount:root => liveMount(root, spec) };
}
