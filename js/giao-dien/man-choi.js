/* =========================================================
   GIAO DIỆN
   ========================================================= */
const LBL = { energy:'Năng lượng', health:'Sức khỏe', mood:'Tinh thần', tech:'Chuyên môn', soft:'Kỹ năng mềm' };
function diffChips(a, b, skipEnergy){
  const out = [], detail = !!(S.opt && S.opt.detail);
  if (b.money !== a.money) { const d = b.money - a.money; out.push({ t:(d > 0 ? '+' : '−') + fmt(Math.abs(d)), good:d > 0, money:true }); }
  for (const k of ['energy','health','mood','tech','soft']) {
    if (skipEnergy && k === 'energy') continue;
    const d = Math.round(b[k] - a[k]);
    if (d) out.push({ t: detail ? `${d > 0 ? '+' : '−'}${Math.abs(d)} ${LBL[k]}` : `${LBL[k]} ${d > 0 ? '↑' : '↓'}`, good:d > 0 });
  }
  for (const k of Object.keys(b.rel)) {
    const d = Math.round(b.rel[k] - (a.rel[k] ?? b.rel[k]));
    if (d) out.push({ t: detail ? `${d > 0 ? '+' : '−'}${Math.abs(d)} ${PEOPLE[k].name}` : `${PEOPLE[k].name} ${d > 0 ? '↑' : '↓'}`, good:d > 0 });
  }
  return out;
}
function chipsHTML(chips){ return chips.map(c => `<span class="chip ${c.good ? 'good' : 'bad'}">${c.t}</span>`).join(''); }

function calHTML(extra=''){
  const di = dayInfo(S.day);
  return `<div class="cal-page ${di.wd === 0 || isHoliday() ? 'sun' : ''} ${extra}" id="calPage" aria-label="${di.dow}, ngày ${di.date} tháng ${di.month}">
    <div class="cal-bind"><span></span><span></span></div>
    <div class="cal-month">Tháng ${di.month}, ${di.year}</div>
    <div class="cal-num">${di.date}</div>
    <div class="cal-dow">${di.dow}</div></div>`;
}

function updateHUD(enter){
  fpsMeter();
  $('#top').hidden = false; $('#bars').hidden = false; $('#foot').hidden = false; $('#phoneFab').hidden = false;
  $('#cal').innerHTML = calHTML(enter ? 'enter' : '');
  $('#avatar').innerHTML = chibiSVG(playerLook(), playerExpr(), { dark:darkCircles(), label:`${S.name}, tâm trạng hiện tại` });
  const [sn, st] = SLOT_INFO[S.slot];
  const job = S.job ? (S.day >= S.job.start ? COMPANIES[S.job.co].name : `Sắp vào ${COMPANIES[S.job.co].name}`) : 'Chưa có việc';
  $('#who').innerHTML = `<div class="who-name">${esc(S.name)}</div>
    <div class="who-meta">${sn}, ${st}. ${job}</div>
    <div class="money" id="moneyBox"><span id="moneyVal">${fmt(S.money)}</span><small>Số dư hiện có</small></div>`;
  const bar = (k, ic) => { const v = S[k]; const cls = v < 30 ? 'low' : v < 55 ? 'mid' : '';
    return `<div><div class="bar-l"><span>${ic} ${LBL[k]}</span><b>${v}</b></div><div class="bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${LBL[k]}"><i class="${cls}" style="width:${v}%"></i></div></div>`; };
  $('#bars').innerHTML = bar('energy','⚡') + bar('health','❤️') + bar('mood','🙂');
  const prev = updateHUD.last;
  if (prev && !reduceMotion()) {
    ['energy','health','mood'].forEach((k, i) => { if (prev[k] !== S[k]) $('#bars').querySelectorAll('.bar')[i].classList.add('pulse'); });
    if (prev.money !== S.money) {
      const box = $('#moneyBox'), el = $('#moneyVal'), from = prev.money, to = S.money, t0 = performance.now();
      box.classList.add(to < from ? 'down' : 'up');
      const step = t => { const k = Math.min(1, (t - t0) / ANIM.MONEY_MS); el.textContent = fmt(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); };
      el.textContent = fmt(from); requestAnimationFrame(step);
    }
  }
  updateHUD.last = { money:S.money, energy:S.energy, health:S.health, mood:S.mood };
  const n = unreadCount(), b = $('#phoneBadge'), fab = $('#phoneFab');
  b.hidden = !n; b.textContent = n;
  fab.setAttribute('aria-label', n ? `Điện thoại, ${n} tin nhắn chưa đọc` : 'Điện thoại');
  if (S.flags.ring) { SFX.play('notify'); S.flags.ring = false; fab.classList.remove('ring'); void fab.offsetWidth; fab.classList.add('ring'); }
}

// Nhãn nói về chỉ số (năng lượng, tinh thần, quan hệ…) mặc định được ẩn: tác động thấy qua thanh chỉ số và nhật ký
const STAT_HINT = /^(⚡|🙂|❤️|🧠|🗣️|🤝|🥗|👍|🥴|💪|😐|😬)/;
function choicesHTML(list, cls = 'choice'){
  const detail = !!(S.opt && S.opt.detail);
  return list.map((c, i) => {
    const poor = c.cost && S.money < c.cost, off = poor || c.disabled;
    const hints = (c.hints || []).filter(h => detail || !STAT_HINT.test(h));
    const chips = [ ...(c.cost ? [`<span class="chip cost">💸 ${fmt(c.cost)}</span>`] : []), ...hints.map(h => `<span class="chip">${h}</span>`) ];
    if (poor) chips.push('<span class="chip bad">Không đủ tiền</span>');
    return `<button class="${cls}" type="button" data-i="${i}" ${off ? 'disabled' : ''}>
      ${c.icon ? `<span class="ci" aria-hidden="true">${c.icon}</span>` : ''}
      <span class="cb"><span class="cl">${c.label}</span>${c.desc ? `<span class="cd">${c.desc}</span>` : ''}${chips.length ? `<span class="chips">${chips.join('')}</span>` : ''}</span></button>`;
  }).join('');
}
// Giờ rảnh: mỗi việc là một ô nhỏ (biểu tượng, tên ngắn, giá tiền) thay cho danh sách câu trả lời
function tilesHTML(list){
  return list.map((c, i) => {
    const poor = c.cost && S.money < c.cost, off = poor || c.disabled;
    return `<button class="choice tile" type="button" data-i="${i}" ${off ? 'disabled' : ''} aria-label="${esc(c.label)}">
      <span class="ti" aria-hidden="true">${c.icon || ''}</span><span class="tl">${c.short || c.label}</span>
      ${c.cost ? `<span class="tc">${poor ? 'Không đủ tiền' : fmt(c.cost)}</span>` : ''}</button>`;
  }).join('');
}
// Dải buổi trong ngày và nhật ký những việc đã diễn ra hôm nay
function boardHTML(done){
  const now = SLOTS.indexOf(S.slot);
  const strip = SLOTS.map((s, k) => `<span class="${done || k < now ? 'done' : k === now ? 'now' : ''}">${SLOT_INFO[s][0]}</span>`).join('');
  const feed = S.feed || [], show = feed.slice(-4), more = feed.length - show.length;
  const line = e => `<li><span class="ft">${e.t}</span><span class="fi" aria-hidden="true">${e.icon}</span><span class="fx">${e.text}${e.wake && S.wakeInfo ? `<details class="fd"><summary>Vì sao năng lượng sáng nay như vậy?</summary>${wakeTable()}</details>` : ''}</span>${e.m ? `<span class="fm ${e.m > 0 ? 'good' : 'bad'}">${e.m > 0 ? '+' : '−'}${fmt(Math.abs(e.m))}</span>` : ''}</li>`;
  return `<div class="board">${leaveBanner()}<div class="slots" aria-label="Các buổi trong ngày">${strip}</div>
    ${feed.length ? `<ul class="feed" aria-label="Việc đã diễn ra hôm nay">${more > 0 ? `<li class="fmore">… và ${more} việc trước đó</li>` : ''}${show.map(line).join('')}</ul>` : ''}</div>`;
}
const speakerName = w => w === 'me' ? S.name : (NPC[w] ? NPC[w].name : w);
const avKey = th => (THREADS[th] && THREADS[th].av) || th;

let talkIdx = 0;
function renderScene(){
  const ref = S.cur;
  stageStop();                                             // chuyển cảnh: dừng mọi hoạt cảnh và lịch nhân vật của cảnh trước
  current = buildScene(ref);
  const ty = sceneType(ref);
  updateHUD();
  const isAct = ref.id === 'activity';
  const btns = isAct ? tilesHTML(current.choices) : choicesHTML(current.choices);
  const first = habitFirst(ref) ? '<p class="tip">Từ lần sau, nhân vật sẽ tự làm theo lựa chọn này. Muốn đổi thì mở “Nếp sinh hoạt” ở cuối màn hình.</p>' : '';
  // Nút "qua nhanh hôm nay": chỉ hiện khi việc trước mắt là việc thường lệ
  S.fast = { from:S.day, until:S.day }; const canFast = ref.id !== 'dayReport' && autoPick(ref, current) >= 0; S.fast = null;
  const ff = canFast ? '<div class="ffbar"><button class="ghost" type="button" id="ffDay">⏩ Qua nhanh hôm nay theo nếp</button></div>' : '';
  if (current.kind === 'journal') {
    $('#stage').innerHTML = `${ref.id === 'dayReport' ? boardHTML(true) : ''}<article class="journal"><div class="sticker">${headSVG(playerLook('sleep'), playerExpr())}</div><h2>${current.title}</h2>${current.html}</article><div class="choices">${btns}</div>`;
  } else if (current.kind === 'phone') {
    const th = current.from, T_ = THREADS[th];
    $('#stage').innerHTML = `${boardHTML()}<article class="scene">
      <header class="sh"><span class="si" aria-hidden="true">📱</span><h2>Tin nhắn từ ${T_.name}</h2></header>${typeHTML(ty)}
      ${current.html ? `<div class="st">${current.html}</div>` : ''}
      <div class="ph-frame"><div class="ph-bar"><span class="ph-av">${headSVG(NPC[avKey(th)].look, defaultNpcExpr(th))}</span><b>${T_.name}</b></div>
        <div class="ph-msgs">${current.msgs.map(t => `<div class="msg in">${t}</div>`).join('')}</div></div>
      <p class="reply-lbl">Bạn trả lời:</p><div class="choices">${btns}</div></article>`;
  } else {
    const talk = current.talk || [];
    const live = stageFor(ref, current) ? stagePanel(ref, current, { meExpr:current.meExpr }) : livePanel(ref, current);      // cảnh ở công ty: dùng sân khấu sống
    $('#stage').innerHTML = `${boardHTML()}<article class="scene">
      ${live ? live.html : `<div class="panel">${panelSVG(current.bg, current.npc, current.npcExpr, current.meExpr || (ty.t === 'random' && !current.meAnim ? 'panic' : undefined), current.title, { meAnim: current.meAnim || autoAnim(ref, ty), npcAnim: current.npcAnim, meExtras: current.meExtras || (ty.t === 'random' && !current.meAnim ? ['excl'] : undefined) })}</div>`}
      <header class="sh"><span class="si" aria-hidden="true">${current.icon || ''}</span><h2>${current.title}</h2></header>${typeHTML(ty)}
      ${current.html ? `<div class="st">${current.html}</div>` : ''}${first}
      ${talk.length ? '<div id="talk"></div>' : ''}
      <div id="rest" ${talk.length ? 'hidden' : ''}><div class="choices ${isAct ? 'tiles' : ''}">${btns}</div></div>${ff}</article>`;
    if (talk.length) { talkIdx = 0; showTalk(); }
    if (live) { if (ref.id === 'cut') cutMount($('#stage'), ref, current); else live.mount($('#stage')); }
    armPanelSkip();
  }
  $('#stage').querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
  const fb = $('#ffDay'); if (fb) fb.addEventListener('click', () => { startFast(false); S.queue.unshift(S.cur); S.cur = null; advance(); });
  window.scrollTo({ top:0 });
  if (ref.id === 'wake') { SFX.play('alarm'); SFX.play(WAKE_ANIM[wakeAnimKey()].snd, 650); }
  else if (current.kind === 'phone') SFX.play('notify');
  else if (ty.t) SFX.play({ random:'pop', consequence:'dun', scheduled:'bell' }[ty.t]);
}
function showTalk(focus){
  const talk = current.talk, line = talk[talkIdx], isMe = line.w === 'me', last = talkIdx >= talk.length - 1;
  const side = isMe ? (current.npc ? 'me' : 'solo') : 'npc';
  if (talkIdx > 0 || focus) { bobSpeaker(isMe ? 'me' : 'npc'); SFX.play('talk'); }
  $('#talk').innerHTML = `<div class="bubble ${side}"><span class="who">${esc(speakerName(line.w))}</span><span>${line.t}</span></div>
    ${last ? '' : `<div class="talk-ctl"><span class="talk-n">${talkIdx + 1}/${talk.length}</span><button class="ghost sm" type="button" id="tSkip">Bỏ qua</button><button class="btn sm" type="button" id="tNext">Tiếp</button></div>`}`;
  if (last) { $('#rest').hidden = false; if (focus) { const c = $('#rest .choice:not([disabled])'); if (c) c.focus({ preventScroll:true }); } return; }
  $('#tNext').addEventListener('click', () => { talkIdx++; showTalk(true); });
  $('#tSkip').addEventListener('click', () => { talkIdx = talk.length - 1; showTalk(true); });
  if (focus) $('#tNext').focus({ preventScroll:true });
}

function choose(i){
  const ch = current && current.choices[i];
  if (!ch || ch.disabled || (ch.cost && S.money < ch.cost)) return;
  const ref = S.cur;
  const { before, out } = applyChoice(ch);
  if (ref) {
    learnHabit(ref, ch);
    const daily = ['meal','bedtime','activity'].includes(ref.id);
    const quiet = ['wake','dayReport','ffReport','monthReport','hangout_pick','plan','cut'].includes(ref.id) || (out.silent && !daily && S.money === before.money);
    if (!out.go && !quiet)
      feedAdd(ref, ch.icon || current.icon, ref.id === 'bedtime' ? feedText(ref, current, ch) : daily ? ch.label + '.' : current.title + '.', S.money - before.money);
  }
  if (out.go === 'nextday') return tearAndNext();
  if (out.go === 'ff') { startFast(true); return tearAndNext(); }
  if (out.go === 'week') { S.phase = S.day >= LAST_DAY ? 'end' : 'week'; S.cur = null; save(); return renderWeek(); }
  const chips = diffChips(before, snap());
  const sceneNpc = current.kind === 'phone' ? null : current.npc;
  const npc = out.npc !== undefined ? out.npc : ch.npc !== undefined ? ch.npc : sceneNpc;
  let nExpr = out.npcExpr;
  if (!nExpr && npc && S.rel[npc] !== undefined) { const d = S.rel[npc] - before.rel[npc]; nExpr = d > 0 ? 'happy' : d < 0 ? 'annoyed' : (npc === sceneNpc ? current.npcExpr : undefined); }
  if (!nExpr && npc === 'family') { const d = S.rel.family - before.rel.family; nExpr = d > 0 ? 'happy' : d < 0 ? 'sad' : undefined; }
  const bg = out.bg || ch.bg || (current.kind === 'phone' ? 'home' : current.bg);
  const fx = resultFx(out, before);
  const live = !ref ? null : stageFor(ref, { bg, npc }) ? stagePanel(ref, { bg, npc, title:current.title }, { meExpr:out.meExpr, meAnim:fx.anim, npcExpr:nExpr, result:true })
    : livePanel(ref, { bg, npc, title:current.title }, { bg, npc, actId:ch.actId, meExpr:out.meExpr, npcExpr:nExpr, meAnim:fx.anim });
  S.cur = null; save();
  if (out.silent || (!out.text && !chips.length)) return advance();
  stageStop(); updateHUD();
  $('#stage').innerHTML = `<article class="scene result">
    ${live ? live.html : `<div class="panel">${panelSVG(bg, npc, nExpr, out.meExpr, current.title, { meAnim: fx.anim, npcAnim: npcReact(nExpr) })}</div>`}
    <header class="sh"><span class="si" aria-hidden="true">${current.icon || '📝'}</span><h2>${current.title}</h2></header>
    <div class="st">${P(out.text)}</div>
    ${chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : ''}
    <button class="btn" type="button" id="next">Tiếp tục</button></article>`;
  if (live) live.mount($('#stage'));
  const nb = $('#next'); nb.addEventListener('click', advance); nb.focus({ preventScroll:true });
  armPanelSkip(); if (fx.snd) SFX.play(fx.snd);
}

/* ----- Giao diện điện thoại ----- */
function closeDlg(){ const d = $('#dlg'); if (d.close) d.close(); else d.removeAttribute('open'); }
function openPhone(){
  if (!S) return;
  renderPhoneList();
  const dlg = $('#dlg');
  dlg.classList.add('phone-dlg');
  if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
}
function renderPhoneList(){
  const p = ph(), keys = Object.keys(THREADS).filter(k => p.threads[k] && p.threads[k].length);
  $('#dlgBody').innerHTML = `<div class="ph-head"><h2>Tin nhắn</h2><button class="ghost sm" type="button" id="phClose">Đóng</button></div>
    ${keys.length ? keys.map(k => { const last = p.threads[k][p.threads[k].length - 1], u = p.unread[k] || 0;
      return `<button class="ph-item" type="button" data-th="${k}"><span class="ph-av">${headSVG(NPC[avKey(k)].look, defaultNpcExpr(k))}</span>
        <span class="ph-txt"><b>${THREADS[k].name}</b><span>${last.who === 'me' ? 'Bạn: ' : ''}${esc(last.t)}</span></span>
        ${p.pending[k] ? '<span class="ph-wait">Chờ trả lời</span>' : ''}${u ? `<span class="ph-badge">${u}</span>` : ''}</button>`; }).join('')
      : '<p class="ph-empty">Chưa có tin nhắn nào. Yên bình quá.</p>'}
    ${leaveCan() ? '<button class="ghost" type="button" id="askLeave" style="width:100%;margin-top:12px">🏖️ Nhắn chị Hạnh báo nghỉ</button>' : ''}`;
  $('#phClose').addEventListener('click', () => closeDlg());
  const al = $('#askLeave'); if (al) al.addEventListener('click', () => openLeaveForm());
  $('#dlgBody').querySelectorAll('.ph-item').forEach(b => b.addEventListener('click', () => openThread(b.dataset.th)));
}
function openThread(th, chips){
  const p = ph(), T_ = THREADS[th], msgs = p.threads[th] || [], pd = p.pending[th];
  p.unread[th] = 0; save(); updateHUD();
  let lastDay = 0;
  const body = msgs.map(m => {
    const day = m.d !== lastDay ? `<div class="ph-day">${dayInfo(m.d).dow}, ${fmtD(m.d)}</div>` : ''; lastDay = m.d;
    if (m.who === 'me') return `${day}<div class="msg out">${esc(m.t)}</div>`;
    return `${day}<div class="msg in">${T_.group ? `<span class="au">${esc(speakerName(m.who))}</span>` : ''}${esc(m.t)}</div>`;
  }).join('');
  const replies = pd ? MSGS[pd.id].replies.map((r, i) => `<button class="reply" type="button" data-r="${i}">${esc(r.t)}</button>`).join('') : '';
  $('#dlgBody').innerHTML = `<div class="ph-head"><button class="ghost sm" type="button" id="phBack">Quay lại</button><b class="ph-name">${T_.name}</b><button class="ghost sm" type="button" id="phClose">Đóng</button></div>
    <div class="ph-msgs thread">${body}</div>
    ${chips && chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : ''}
    ${pd ? `<p class="reply-lbl">Trả lời (nếu để quá lâu, ${T_.name.toLowerCase() === 'bố mẹ' ? 'bố mẹ' : 'họ'} sẽ phật lòng):</p>${replies}` : ''}
    ${th === 'boss' && S.leavePending ? `<p class="reply-lbl">Trả lời chị Hạnh:</p>${leaveReplies().map((r, i) => `<button class="reply lv" type="button" data-lv="${i}">${esc(r.t)}</button>`).join('')}` : ''}`;
  $('#phBack').addEventListener('click', renderPhoneList);
  $('#phClose').addEventListener('click', () => closeDlg());
  $('#dlgBody').querySelectorAll('.reply:not(.lv)').forEach(b => b.addEventListener('click', () => replyMsg(th, +b.dataset.r)));
  $('#dlgBody').querySelectorAll('.reply.lv').forEach(b => b.addEventListener('click', () => leaveReply(+b.dataset.lv)));
  const box = $('#dlgBody .thread'); if (box) box.scrollTop = box.scrollHeight;
}

function tearAndNext(){
  S.cur = null;
  const page = $('#calPage');
  const reduce = reduceMotion();
  $('#stage').querySelectorAll('button').forEach(b => b.disabled = true);
  const go = () => { startDay(); updateHUD(true); };
  SFX.play('tear');
  if (page && !reduce) { page.classList.add('tear'); setTimeout(go, 520); } else go();
}

