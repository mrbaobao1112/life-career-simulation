/* =========================================================
   v4: ANIMATION & ÂM THANH
   ========================================================= */
const ANIM = { WAKE_MS:1700, MOMENT_MS:1300, MONEY_MS:600, SKIP_ON_TAP:true };
document.documentElement.style.setProperty('--a-wake', ANIM.WAKE_MS + 'ms');
document.documentElement.style.setProperty('--a-moment', ANIM.MOMENT_MS + 'ms');
// Giảm chuyển động: 'auto' theo cài đặt của hệ điều hành, 'reduce' luôn giảm (chọn trong Cài đặt ở màn mở đầu)
const MOTION = { get pref(){ try { return localStorage.getItem('lcs-motion') === 'reduce' ? 'reduce' : 'auto'; } catch (e) { return 'auto'; } },
  set(v){ try { localStorage.setItem('lcs-motion', v); } catch (e) {} document.documentElement.classList.toggle('rm', v === 'reduce'); },
  get system(){ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } };
const reduceMotion = () => MOTION.pref === 'reduce' || MOTION.system;
document.documentElement.classList.toggle('rm', MOTION.pref === 'reduce');

// Âm thanh tổng hợp bằng Web Audio, không cần file ngoài
const SFX = (() => {
  let ctx = null, on = true;
  try { on = localStorage.getItem('lcs-sound') !== 'off'; } catch (e) {}
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function tone(f, t0, dur, type = 'sine', vol = .1, f2 = null){
    const c = ac(); if (!c) return; const t = c.currentTime + t0;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .03);
  }
  function noise(t0, dur, vol = .08, freq = 1200){
    const c = ac(); if (!c) return; const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(c.currentTime + t0);
  }
  const lib = {
    alarm:   () => { for (let i = 0; i < 3; i++) { tone(1320, i * .2, .08, 'square', .045); tone(1320, i * .2 + .09, .06, 'square', .03); } },
    stretch: () => { tone(523, 0, .2, 'sine', .09); tone(659, .13, .2, 'sine', .09); tone(784, .26, .35, 'sine', .09); },
    yawn:    () => { tone(330, 0, 1, 'sine', .08, 170); noise(.05, .7, .025, 500); },
    rub:     () => { tone(392, 0, .4, 'triangle', .06, 330); },
    groan:   () => { tone(210, 0, .8, 'sawtooth', .035, 140); },
    jolt:    () => { tone(880, 0, .08, 'square', .05); tone(1175, .09, .16, 'square', .05); },
    tear:    () => noise(0, .28, .12, 2600),
    coin:    () => { tone(988, 0, .08, 'square', .035); tone(1319, .07, .2, 'square', .035); },
    gain:    () => { tone(660, 0, .12, 'sine', .07); tone(880, .1, .22, 'sine', .07); },
    loss:    () => { tone(300, 0, .3, 'triangle', .07, 200); },
    fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .38, 'triangle', .08)),
    sad:     () => { tone(392, 0, .35, 'triangle', .07); tone(311, .3, .65, 'triangle', .07); },
    notify:  () => { tone(1047, 0, .1, 'sine', .07); tone(1397, .12, .18, 'sine', .07); },
    pop:     () => tone(520, 0, .14, 'sine', .07, 800),
    bell:    () => { tone(880, 0, .7, 'sine', .06); tone(1320, 0, .7, 'sine', .025); },
    dun:     () => tone(150, 0, .55, 'triangle', .09, 105),
    talk:    () => tone(480 + Math.random() * 140, 0, .05, 'triangle', .025),
    hop:     () => tone(600, 0, .1, 'sine', .05, 900),
  };
  return {
    play(n, delay = 0){ if (!on || !lib[n]) return; const f = () => { try { lib[n](); } catch (e) {} }; delay ? setTimeout(f, delay) : f(); },
    get on(){ return on; },
    raw:{ tone:(...a) => { try { tone(...a); } catch (e) {} }, noise:(...a) => { try { noise(...a); } catch (e) {} } },     // dùng cho nhạc nền màn hình mở đầu
    toggle(){ on = !on; try { localStorage.setItem('lcs-sound', on ? 'on' : 'off'); } catch (e) {} if (on) ac(); return on; },
  };
})();

// Animation thức dậy chọn theo dữ liệu thật của đêm hôm trước
const WAKE_ANIM = {
  stretch:  { expr:'happy',  extras:['sparkle'],        snd:'stretch' },
  rub:      { expr:'tired',  extras:[],                 snd:'rub' },
  yawn:     { expr:'yawn',   extras:['zzz'],            snd:'yawn' },
  headache: { expr:'drunk',  extras:['bubbles'],        snd:'groan' },
  jolt:     { expr:'panic',  extras:['sweat','alarm'],  snd:'jolt' },
};
function wakeAnimKey(){
  if (S.day === 1) return 'stretch';
  if (S.am && S.am.delays.some(d => d[0].startsWith('Ngủ quên'))) return 'jolt';
  if (S.flags.hangoverToday) return 'headache';
  if ((S.sleepDebt || 0) >= 3 || S.sleep < 5.5) return 'yawn';
  if (S.sleep < 7 || (S.sleepDebt || 0) >= 1) return 'rub';
  return 'stretch';
}
function autoAnim(ref, ty){
  if (ref.id === 'iv_hr' || ref.id === 'iv_tech') return 'jitter';
  if (ty && ty.t === 'random') return 'surprise';
  if (ty && ty.t === 'consequence') return 'slump';
  if (ty && ty.t === 'scheduled') return 'nod';
  return '';
}
const npcReact = e => e === 'happy' ? 'hop' : e === 'annoyed' ? 'shake' : e === 'sad' ? 'slump' : '';
function resultFx(out, before){
  const dm = S.mood - before.mood, dh = S.health - before.health, dmoney = S.money - before.money;
  let anim = out.anim, snd = null;
  if (!anim) {
    if (out.meExpr === 'happy') { anim = 'jump'; snd = 'fanfare'; }
    else if (out.meExpr === 'sad') { anim = 'slump'; snd = 'sad'; }
    else if (out.meExpr === 'tired') { anim = 'drag'; snd = 'groan'; }
    else if (dm >= 6) { anim = 'cheer'; snd = 'gain'; }
    else if (dm <= -5 || dh <= -3) { anim = 'slump'; snd = 'loss'; }
    else anim = 'nod';
  }
  if (dmoney < 0) { if (snd) SFX.play('coin', 380); else snd = 'coin'; }
  return { anim, snd };
}
function bobSpeaker(w){
  const el = document.getElementById(w === 'me' ? 'meG' : 'npcG'); if (!el || reduceMotion()) return;
  el.classList.remove('anim-bob'); void el.getBoundingClientRect(); el.classList.add('anim-bob');
}
function armPanelSkip(){
  if (!ANIM.SKIP_ON_TAP) return;
  document.querySelectorAll('#stage .panel').forEach(p => p.addEventListener('click', () => p.classList.add('skip'), { once:true }));
}

function panelSVG(bg, npc, npcExpr, meExpr, label, o = {}){
  const s = .95, y = (174 - 140 * s).toFixed(1);
  let chars = '';
  const na = o.npcAnim ? ' anim-' + o.npcAnim : '';
  if (npc === 'family') {
    const s2 = .8, y2 = (174 - 140 * s2).toFixed(1);
    chars += `<g transform="translate(178 ${y2}) scale(${s2})"><g id="npcG" data-npc="mom" class="cb cb-idle${na}">${chibi(NPC.mom.look, npcExpr || 'happy')}</g></g><g transform="translate(252 ${y2}) scale(${s2})"><g class="cb cb-idle${na}">${chibi(NPC.dad.look, npcExpr === 'sad' ? 'sad' : 'neutral', { noExtras:true })}</g></g>`;
  } else if (npc && NPC[npc]) {
    chars += `<g transform="translate(206 ${y}) scale(${s})"><g id="npcG" data-npc="${npc}" class="cb cb-idle${na}">${chibi(NPC[npc].look, npcExpr || defaultNpcExpr(npc))}</g></g>`;
  }
  const ma = o.meAnim ? ' anim-' + o.meAnim : '';
  const me = `<g transform="translate(${npc ? 30 : 112} ${y}) scale(${s})"><g id="meG" class="cb cb-idle${ma}">${chibi(playerLook(), meExpr || playerExpr(), { dark:darkCircles(), extras:o.meExtras })}</g></g>`;
  return `<svg viewBox="0 0 360 180" role="img" aria-label="${esc(label || 'Minh họa cảnh')}">${bgSVG(bg)}${tintSVG()}${me}${chars}</svg>`;
}

