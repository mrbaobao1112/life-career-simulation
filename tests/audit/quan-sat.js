// Audit v17.3: quan sát một cảnh trong N phút thật, ghi lại hành vi NPC.
// node quan-sat.js <tên> <bg> <cảnh JSON> <phút> [cpu]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const [name, bg, sceneJson, minStr, cpu] = process.argv.slice(2);
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
const SC = JSON.parse(sceneJson), MIN = +minStr || 5, OUT = path.join(KQ, 'r_' + name + '.json');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:520, height:900 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  if (cpu) { const s = await ctx.newCDPSession(page); await s.send('Emulation.setCPUThrottlingRate', { rate:+cpu }); }
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click(`.bgopt[data-b="${bg}"]`); await page.click('#go');
  await page.evaluate(sc => {
    S.once.roamTut = true; S.money = 5e6;
    const slot = sc.h < 11 ? 'morning' : sc.h < 13 ? 'noon' : sc.h < 18 ? 'afternoon' : 'evening';
    S.day = sc.day; S.slot = sc.slot || slot; S.roam = { d:sc.day, t:sc.h * 60 }; S.roamPos = {};
    if (sc.office) { S.job = { co:sc.co || 'hotay', salary:1e7, start:3 }; OFFICE_BAL.ABSENT = 0; S.where = null; S.queue = [sc.ref || { id:'task', arg:{ tid:102 } }]; }
    else { S.flags.pho = { d:sc.day, met:1, vendor:1, rain:1, jam:1 }; if (sc.rain) S.flags.rainDay = sc.day; S.where = sc.at === 'home' ? null : { d:sc.day, slot:S.slot, at:sc.at, bike:null }; S.queue = [{ id:'activity', arg:S.slot }]; }
    S.cur = null; advance(); WORLD.t = sc.h * 60; WORLD.end = 1e9;
    if (sc.meX != null) { WORLD.me.x = sc.meX; WORLD.me.y = sc.meY || 175; }
    // bộ lấy mẫu: vị trí THẬT trên màn hình (đang trượt CSS), không phải điểm đích
    const A = window.__aud = { samples:0, appear:[], vanish:[], overlap:{}, through:{}, still:{}, said:[], acts:{}, signs:{}, moves:{}, maxVis:0, t0:WORLD.t, tl:[] };
    const real = a => { const m = getComputedStyle(a.el).transform; if (!m || m === 'none') return { x:a.x, y:a.y }; const v = m.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number); return { x:v[4], y:v[5] }; };
    const prev = {};
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('say')) A.said.push([Math.round(WORLD.t), n.textContent]); }))).observe(document.body, { childList:true, subtree:true });
    setInterval(() => {
      const W = WORLD; if (!W || document.hidden) return; A.samples++;
      const vis = W.npcs.filter(a => !a.gone);
      A.maxVis = Math.max(A.maxVis, vis.length);
      const inView = x => x > W.cam - 4 && x < W.cam + ROAM.VIEW_W + 4;
      const pos = {};
      for (const a of W.npcs) {
        const p = real(a), was = prev[a.id], moving = a.el.classList.contains('moving') || (was && Math.hypot(p.x - was.x, p.y - was.y) > .5);
        pos[a.id] = { ...p, gone:!!a.gone };
        if (was && was.gone !== !!a.gone) {
          const rec = { id:a.id, who:a.who, t:Math.round(W.t), x:Math.round(p.x), y:Math.round(p.y), view:inView(p.x), edge:p.x < 60 || p.x > W.H.W - 60 || (W.pop && Math.hypot(p.x - W.pop.exit.x, p.y - W.pop.exit.y) < 30) };
          (a.gone ? A.vanish : A.appear).push(rec);
        }
        if (a.gone) { if (A.still[a.id]) A.still[a.id].from = null; continue; }
        // đứng yên bao lâu (phút game)
        const k = a.id; if (!A.still[k]) A.still[k] = { max:0, from:W.t, x:p.x, y:p.y, who:a.who, label:a.label || a.who };
        const s = A.still[k]; if (s.from === null) { s.from = W.t; s.x = p.x; s.y = p.y; } if (Math.hypot(p.x - s.x, p.y - s.y) > 3) { s.from = W.t; s.x = p.x; s.y = p.y; } else s.max = Math.max(s.max, W.t - s.from);
        // đang đi mà chân ở trong đồ đạc
        if (moving && !a.rot && was && !was.gone && inView(p.x) && Math.hypot(p.x - was.x, p.y - was.y) < 30 && !roamFree(W.H, p.x, p.y)) { const key = a.label || a.who; A.through[key] = (A.through[key] || 0) + 1; (A.thrEx = A.thrEx || []).length < 30 && A.thrEx.push([Math.round(W.t), a.who, Math.round(p.x), Math.round(p.y), a.ai ? a.ai.act : "", a.ai && a.ai.inBeat ? "beat" : "", was ? Math.round(was.x) + "," + Math.round(was.y) : ""]); }
        A.moves[a.id] = (A.moves[a.id] || 0) + (moving ? 1 : 0);
        const act = a.ai ? a.ai.act : (a.vis ? 'vis' : 'fixed'); A.acts[a.who + ':' + act] = (A.acts[a.who + ':' + act] || 0) + 1;
        const sg = a.el.querySelector('.npc-sign text'); if (sg) A.signs[sg.textContent] = (A.signs[sg.textContent] || 0) + 1;
      }
      // chồng lấn: hai người cùng ĐỨNG YÊN (vị trí thật không đổi), cách nhau < 9 đơn vị; tính theo từng đợt liên tục
      const st = vis.filter(a => !a.rot && prev[a.id] && !prev[a.id].gone && Math.hypot(pos[a.id].x - prev[a.id].x, pos[a.id].y - prev[a.id].y) < .3);
      const cur = {};
      for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) {
        const p = pos[st[i].id], q = pos[st[j].id];
        if (Math.hypot(p.x - q.x, (p.y - q.y) * 1.5) < 9) { const pk = [st[i].id, st[j].id].sort().join('|'); cur[pk] = true; const run = (A.ovRun = A.ovRun || {}); run[pk] = (run[pk] || 0) + 1;
          const key = [st[i].label || st[i].who, st[j].label || st[j].who].sort().join(' + '); const o = A.overlap[key] || (A.overlap[key] = { n:0, maxS:0, ex:[] }); o.n++; o.maxS = Math.max(o.maxS, run[pk] / 5);
          if (o.ex.length < 4 && !o.ex.some(e => Math.abs(e[1] - p.x) < 6)) o.ex.push([Math.round(W.t), Math.round(p.x), Math.round(p.y), st[i].id, st[j].id]); }
      }
      for (const pk in (A.ovRun || {})) if (!cur[pk]) A.ovRun[pk] = 0;
      Object.assign(prev, pos);
      if (A.samples % 25 === 0) A.tl.push({ t:Math.round(W.t), vis:vis.length, named:W.npcs.filter(a => a.ai).map(a => a.who + ':' + (a.gone ? 'out' : a.ai.act) + (a.ai.inBeat ? '*' : '')).join(' ') });
    }, 200);
  }, SC);
  const shots = [];
  for (let m = 0; m < MIN; m++) {
    await page.waitForTimeout(60000);
    if (m === 1 || m === MIN - 1) { const f = path.join(KQ, `s_${name}_${m}.png`); await page.screenshot({ path:f, clip:await page.$eval('#world', e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:Math.min(r.height, 420) }; }) }).catch(() => {}); shots.push(f); }
  }
  const r = await page.evaluate(() => { const A = window.__aud; const W = WORLD;
    const still = Object.entries(A.still).map(([k, s]) => ({ id:k, who:s.label, max:Math.round(s.max) })).sort((a, b) => b.max - a.max);
    return { ...A, still:still.slice(0, 12), t1:Math.round(W.t), pop:typeof POP_DEBUG === 'function' ? POP_DEBUG() : null, npcRel:S.npcRel, wev:S.flags.wev, place:document.querySelector('#world') && document.querySelector('#world').dataset.place }; });
  r.errs = errs; r.shots = shots; r.scene = SC; r.minutes = MIN;
  fs.writeFileSync(OUT, JSON.stringify(r, null, 1)); console.log('xong', name, r.samples, 'mẫu', 'lỗi', errs.length);
  await b.close();
})();
