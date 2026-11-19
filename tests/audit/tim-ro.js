// Tìm ai giữ các nút DOM đã tách khỏi trang: chơi vài phút, chụp heap, lần ngược chuỗi giữ
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const KQ = path.join(__dirname, 'ket-qua'); require('fs').mkdirSync(KQ, { recursive:true });   // kết quả, ảnh chụp (không đưa lên git)
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:1280, height:800 } }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go'); await p.evaluate(() => { S.once.roamTut = true; });
  // chơi nhanh bằng cảnh chữ: bấm lựa chọn / tiếp tục trong 90 giây (đi qua nhiều cảnh như người chơi)
  const t0 = Date.now();
  const MODE = process.argv[2] || 'world', SECS = +process.argv[3] || 150;
  while (Date.now() - t0 < SECS * 1000) {
    const did = await p.evaluate(MODE => { const vis = e => e && e.offsetParent !== null;
      const q = ['.w-toast:not([hidden]) button', '.w-wake:not([hidden]) button', '#next', '#tSkip', '#nextWeek', '.mg-skip'].map(s => document.querySelector(s)).find(vis); if (q) { q.click(); return 'btn'; }
      const W = typeof WORLD !== 'undefined' ? WORLD : null;
      if (MODE === 'world' && W && W.H && document.querySelector('#world') && !W.busy) {
        if (W.menu) { const it = [...document.querySelectorAll('.w-menu .w-act')].filter(b => !b.disabled && !/Chào/.test(b.textContent)); if (it.length) it[Math.floor(Math.random() * it.length)].click(); else document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', code:'Escape' })); return 'menu'; }
        const objs = [...document.querySelectorAll('#world .w-obj')]; if (objs.length) { objs[Math.floor(Math.random() * objs.length)].dispatchEvent(new MouseEvent('click', { bubbles:true })); return 'obj'; }
      }
      const ch = [...document.querySelectorAll('#stage .choice')].filter(b => !b.disabled && vis(b) && !/Tua/.test(b.textContent)); if (ch.length) { ch[Math.floor(Math.random() * ch.length)].click(); return 'choice'; }
      return null; }, MODE);
    await p.waitForTimeout(did === 'obj' ? 2200 : did ? 400 : 600);
  }
  await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('Performance.enable');
  { const mm = (await cdp.send('Performance.getMetrics')).metrics; console.log('Nodes', mm.find(x => x.name === 'Nodes').value, 'trên trang', await p.evaluate(() => document.getElementsByTagName('*').length), 'listeners', mm.find(x => x.name === 'JSEventListeners').value); }
  const chunks = []; cdp.on('HeapProfiler.addHeapSnapshotChunk', e => chunks.push(e.chunk));
  await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress:false });
  const snap = JSON.parse(chunks.join('')); const M = snap.snapshot.meta, NF = M.node_fields.length, EF = M.edge_fields.length;
  const nodes = snap.nodes, edges = snap.edges, strings = snap.strings, NT = M.node_types[0], ET = M.edge_types[0];
  const iName = M.node_fields.indexOf('name'), iEC = M.node_fields.indexOf('edge_count'), iType = M.node_fields.indexOf('type'), iId = M.node_fields.indexOf('id');
  const eType = M.edge_fields.indexOf('type'), eName = M.edge_fields.indexOf('name_or_index'), eTo = M.edge_fields.indexOf('to_node');
  const N = nodes.length / NF, first = new Int32Array(N + 1); for (let i = 0, e = 0; i < N; i++) { first[i] = e; e += nodes[i * NF + iEC] * EF; } first[N] = edges.length;
  const rev = Array.from({ length:N }, () => []);
  for (let i = 0; i < N; i++) for (let e = first[i]; e < first[i + 1]; e += EF) { const t = edges[e + eTo] / NF, ty = ET[edges[e + eType]]; if (ty === 'weak') continue; rev[t].push([i, ty === 'element' || ty === 'hidden' ? '[' + edges[e + eName] + ']' : strings[edges[e + eName]]]); }
  const name = i => strings[nodes[i * NF + iName]], type = i => NT[nodes[i * NF + iType]];
  const iDet = M.node_fields.indexOf('detachedness'); const isDet = i => iDet >= 0 ? nodes[i * NF + iDet] === 2 : /^Detached /.test(name(i));
  const det = []; for (let i = 0; i < N; i++) if (isDet(i) && /Element|Text|Comment/.test(name(i))) det.push(i);
  console.log('fields', M.node_fields.join(','));
  const byName = {}; det.forEach(i => byName[name(i)] = (byName[name(i)] || 0) + 1);
  console.log('Số nút tách rời còn bị giữ:', det.length, JSON.stringify(Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 8)));
  // lần ngược từ vài nút tách rời lên gốc, bỏ qua các cạnh nối giữa chính các nút tách rời
  const seen = new Set(); let shown = 0;
  for (const s of det) { if (shown >= 5) break;
    const path = []; let cur = s, guard = 0; const vis = new Set([cur]);
    while (guard++ < 14) { const r = rev[cur].find(([j]) => !vis.has(j) && !isDet(j)) || rev[cur].find(([j]) => !vis.has(j)); if (!r) break;
      path.push(`${r[1]} ← ${type(r[0])}:${name(r[0]).slice(0, 60)}`); cur = r[0]; vis.add(cur); if (/^Window|system \/ Context|\(GC roots\)/.test(name(cur))) break; }
    const key = path.slice(0, 6).join(' | '); if (seen.has(key)) continue; seen.add(key); shown++;
    console.log('\n' + name(s) + '\n  ' + path.join('\n  ')); }
  await b.close();
})();
