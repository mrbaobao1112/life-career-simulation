// Audit v17.8: ĐO VIỆC VẼ bằng Chrome tracing (chính xác hơn đếm khung hình/giây, vốn dao động ±8 khi máy bận).
// Đi qua lại trên phố giờ cao điểm 6 giây (điện thoại giả lập, CPU chậm 6 lần), cộng thời gian luồng chính theo loại việc:
//   vẽ (Paint), chia lớp (Layerize), tính kiểu dáng (UpdateLayoutTree), bố cục (Layout); chia cho số khung hình để ra mili giây mỗi khung.
// Có thể chèn CSS để thí nghiệm (ví dụ tắt một nhóm hoạt ảnh) và so sánh.
// Dùng: node do-ve.js                    → 2 lần, giữ nguyên
//       node do-ve.js ".world .actor *{animation:none!important}"   → thêm 1 lần có chèn CSS đó
//       DN_TAT=1 node do-ve.js           → tắt Đọc nhanh
const { chromium, devices } = require('playwright');
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const THEM = process.argv[2];
(async () => {
  const b = await chromium.launch(), lan = [['giữ nguyên (1)', ''], ['giữ nguyên (2)', ''], ...(THEM ? [['chèn CSS', THEM]] : [])];
  for (const [ten, css] of lan) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] }); if (process.env.DN_TAT) await ctx.addInitScript(() => localStorage.setItem('lcs-doc-nhanh', '0'));
    const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate:6 });
    await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="ghep"]'); await p.click('#go');
    await p.evaluate(css => { if (css) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
      S.once.roamTut = true; S.flags.pho = { d:8, met:1, vendor:1, rain:1, jam:1 }; S.day = 8; S.slot = 'afternoon'; S.roam = { d:8, t:17.5 * 60 }; S.roamPos = {};
      S.where = { d:8, slot:'afternoon', at:'street', bike:null }; S.queue = [{ id:'activity', arg:'afternoon' }]; S.cur = null; advance(); WORLD.end = 1e9; }, css);
    await p.waitForTimeout(2500);
    await b.startTracing(p, { categories:['devtools.timeline', 'blink', 'cc'] });
    await p.evaluate(() => { window.__fr = 0; window.__on = true; const f = () => { window.__fr++; if (window.__on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    for (let i = 0; i < 6; i++) { const k = i % 4 < 2 ? 'd' : 'a'; await p.keyboard.down(k); await p.waitForTimeout(1000); await p.keyboard.up(k); }
    const fr = await p.evaluate(() => { window.__on = false; return window.__fr; });
    const raw = JSON.parse((await b.stopTracing()).toString()), E = raw.traceEvents || raw, tn = {};
    E.filter(e => e.ph === 'M' && e.name === 'thread_name').forEach(e => { tn[e.pid + ':' + e.tid] = e.args.name; });
    const ms = n => E.filter(e => e.ph === 'X' && e.name === n && /CrRendererMain/.test(tn[e.pid + ':' + e.tid] || '')).reduce((a, e) => a + e.dur / 1000, 0) / Math.max(1, fr);
    console.log(`${ten.padEnd(16)} ${(fr / 6).toFixed(0).padStart(3)} khung/giây · mỗi khung: vẽ ${ms('Paint').toFixed(1)} · chia lớp ${ms('Layerize').toFixed(1)} · kiểu dáng ${ms('UpdateLayoutTree').toFixed(1)} · bố cục ${ms('Layout').toFixed(1)} ms`);
    await ctx.close();
  }
  await b.close();
})();
