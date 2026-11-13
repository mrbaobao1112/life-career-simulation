// Kiểm thử màn hình mở đầu trong trình duyệt thật (cần Playwright): vòng đời hoạt cảnh và âm thanh, bản lưu, giảm chuyển động, hiệu năng.
// Chạy: npm run mo-dau        Chạy thêm bài để yên 5 phút: DAI=1 npm run mo-dau
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('Bỏ qua: máy này chưa có Playwright (npm i -D playwright).'); process.exit(0); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html'), KEY = 'lcs-tuan-dau-tien-v6';
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, opts = {}, saveRaw){
  const ctx = await browser.newContext({ viewport:{ width:390, height:844 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.addInitScript(raw => {
    window.addEventListener('unhandledrejection', e => console.error('REJ ' + (e.reason && e.reason.stack || e.reason)));
    if (raw !== null && raw !== undefined) try { localStorage.setItem('lcs-tuan-dau-tien-v6', raw); } catch (e) {}
    // đếm trình nghe sự kiện “chạm” đang đăng ký trên trang
    const add = EventTarget.prototype.addEventListener, rm = EventTarget.prototype.removeEventListener; window.__pd = new Set();
    EventTarget.prototype.addEventListener = function (t, f, o) { if (this === document && t === 'pointerdown') window.__pd.add(f); return add.call(this, t, f, o); };
    EventTarget.prototype.removeEventListener = function (t, f, o) { if (this === document && t === 'pointerdown') window.__pd.delete(f); return rm.call(this, t, f, o); };
  }, saveRaw === undefined ? null : saveRaw);
  await page.goto(URL); await page.waitForSelector('.title-scene svg');
  return page;
}
const state = page => page.evaluate(() => ({ title:!!document.querySelector('.title-scene'), audio:TA.on, fading:!!TA.fading, aTimers:TA.timers.length, sTimers:stageTimers.size, pd:window.__pd.size,
  actors:document.querySelectorAll('.title-scene .actor').length, says:document.querySelectorAll('.title-scene .say').length }));
async function makeSave(page){ await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b] >> nth=1'); await page.click('#go');
  await page.evaluate(() => { S.name = 'Minh'; S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.money = 3820000; ensureBills(); save(); }); }

(async () => {
  const browser = await chromium.launch();

  // 1. Âm thanh: bật tắt liên tục không tạo nhiều vòng nhạc; vào game thì tắt hẳn
  { const page = await open(browser);
    let s = await state(page); check('Chưa chạm thì chưa có âm thanh', !s.audio && s.aTimers === 0);
    await page.mouse.click(200, 150); await page.waitForTimeout(300); s = await state(page);
    check('Chạm vào khung phố: nhạc bật, đúng một bộ hẹn giờ', s.audio && s.aTimers >= 2 && s.aTimers <= 4, `${s.aTimers} hẹn giờ âm thanh`);
    for (let i = 0; i < 21; i++) { await page.click('#tSound'); await page.waitForTimeout(i % 3 ? 15 : 120); }
    await page.waitForTimeout(400); s = await state(page);
    const btn = await page.evaluate(() => document.getElementById('tSound').textContent);
    check('Bấm nút loa 21 lần liên tục: vẫn chỉ một vòng nhạc, nút hiện đúng trạng thái', s.aTimers <= 4 && (s.audio ? btn === '🔊' : btn !== '🔊'), `${s.aTimers} hẹn giờ, đang ${s.audio ? 'bật' : 'tắt'}, nút ${btn}`);
    if (!s.audio) { await page.click('#tSound'); await page.waitForTimeout(200); }
    await makeSave(page); await page.waitForTimeout(1200); s = await state(page);
    check('Bấm Bắt đầu rồi vào game: nhạc nhỏ dần và tắt hẳn, không còn hẹn giờ âm thanh', !s.title && !s.audio && s.aTimers === 0 && s.pd === 0, JSON.stringify(s));
    check('Không có lỗi', page.errs.length === 0, page.errs[0] || ''); await page.context().close(); }

  // 2. Vào lại màn mở đầu nhiều lần: không chồng hoạt cảnh, không trùng trình nghe
  { const page = await open(browser); await makeSave(page);
    const counts = [];
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => { titleStop(); renderTitle(); }); await page.waitForTimeout(1500);
      await page.mouse.click(200, 150); await page.waitForTimeout(200);
      const s = await state(page); counts.push(`${s.pd}/${s.aTimers}/${s.actors}`);
      await page.click('#resume'); await page.waitForTimeout(900);
    }
    const s = await state(page);
    check('Ra vào màn mở đầu 5 lần: luôn đúng một trình nghe chạm, một vòng nhạc, số nhân vật không tăng dần', counts.every(c => +c.split('/')[0] === 1 && +c.split('/')[1] <= 4 && +c.split('/')[2] <= 14), counts.join(' · '));
    check('Sau lần ra cuối: không còn trình nghe, không còn âm thanh của màn mở đầu', s.pd === 0 && !s.audio && s.aTimers === 0 && !page.errs.length, JSON.stringify(s));
    // từ trong game bấm “Chơi lại từ đầu” ở chân trang để về màn mở đầu
    await page.click('#btnRestart'); await page.click('#btnRestart'); await page.waitForTimeout(500);
    check('Từ trong game xóa bản lưu và về màn mở đầu: hiện bình thường, không lỗi', (await state(page)).title && !(await page.$('.save-card')) && !page.errs.length, page.errs[0] || '');
    await page.context().close(); }

  // 3. Chuyển tab rồi quay lại
  { const page = await open(browser); await page.mouse.click(200, 150); await page.waitForTimeout(300);
    const vis = h => page.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable:true, get:() => h }); Object.defineProperty(document, 'visibilityState', { configurable:true, get:() => h ? 'hidden' : 'visible' }); document.dispatchEvent(new Event('visibilitychange')); }, h);
    await vis(true); await page.waitForTimeout(300); let s = await state(page);
    check('Chuyển sang tab khác: dừng hết hoạt cảnh và âm thanh', !s.audio && s.aTimers === 0 && s.sTimers === 0, JSON.stringify(s));
    await vis(false); await page.waitForTimeout(1500); s = await state(page);
    check('Quay lại: khung phố chạy lại, nhạc bật lại vì trước đó đang bật, chỉ một vòng', s.title && s.audio && s.aTimers <= 4 && s.sTimers > 0 && s.pd === 1, JSON.stringify(s));
    for (let i = 0; i < 4; i++) { await vis(true); await page.waitForTimeout(50); await vis(false); await page.waitForTimeout(80); }
    await page.waitForTimeout(800); s = await state(page);
    check('Chuyển tab qua lại nhanh 4 lần: không chồng vòng', s.aTimers <= 4 && s.pd === 1 && s.sTimers < 60 && !page.errs.length, JSON.stringify(s));
    await page.context().close(); }

  // 4. Bản lưu: đọc đúng, không đọc được thì báo, không bao giờ xóa hay sửa
  { const page = await open(browser); await makeSave(page);
    await page.evaluate(() => { titleStop(); renderTitle(); }); await page.waitForTimeout(400);
    const t = (await page.textContent('.save-card')).replace(/\s+/g, ' ');
    const raw0 = await page.evaluate(k => localStorage.getItem(k), KEY);
    await page.waitForTimeout(3000);
    check('Chơi tiếp đọc đúng bản lưu (tên, ngày, công việc, số dư)', /Minh/.test(t) && /24\/11/.test(t) && /Hồ Tây Soft/.test(t) && /3\.820\.000đ/.test(t), t.slice(0, 120));
    check('Chỉ mở màn mở đầu thì bản lưu không thay đổi', raw0 === await page.evaluate(k => localStorage.getItem(k), KEY));
    await page.click('#fresh'); await page.waitForTimeout(150);
    check('Chơi lại: bấm lần đầu chỉ hỏi xác nhận, bản lưu còn nguyên', !(await page.$('#go')) && raw0 === await page.evaluate(k => localStorage.getItem(k), KEY));
    await page.waitForTimeout(3700);
    check('Không bấm lần hai thì nút tự trở lại như cũ', (await page.textContent('#fresh')) === 'Chơi lại');
    await page.click('#resume'); await page.waitForTimeout(400);
    check('Bấm Chơi tiếp: vào đúng ngày đang chơi', await page.evaluate(() => S && S.day === 9 && S.name === 'Minh'));
    await page.context().close(); }
  for (const [name, raw] of [['chuỗi hỏng', '{khong-phai-json'], ['thiếu dữ liệu', JSON.stringify({ v:7, phase:'play' })], ['sai kiểu', JSON.stringify({ v:7, phase:'play', day:'ba', money:null, bg:'nha', look:{}, stat:{}, rel:{}, flags:{} })], ['phiên bản lạ', JSON.stringify({ v:99, phase:'play', day:3 })]]) {
    const page = await open(browser, {}, raw); await page.waitForTimeout(400);
    const bad = await page.$('.t-bad'), card = await page.$('.save-card');
    await page.click('#fresh'); await page.waitForTimeout(100);
    const stillTitle = !!(await page.$('.title-scene')), kept = raw === await page.evaluate(k => localStorage.getItem(k), KEY);
    check(`Bản lưu ${name}: không lỗi, báo không đọc được, giữ nguyên dữ liệu, bắt đầu mới phải xác nhận`, !!bad && !card && stillTitle && kept && !page.errs.length, page.errs[0] || '');
    await page.context().close(); }

  // 5. Bong bóng thoại, người đi bộ, các hành vi ngắn (theo dõi 100 giây)
  { const page = await open(browser);
    await page.evaluate(() => { window.__bub = []; const L = document.querySelector('.title-scene .L-say'); new MutationObserver(ms => ms.forEach(m => { m.addedNodes.forEach(n => window.__bub.push({ n, t0:performance.now(), t1:null, text:n.textContent })); m.removedNodes.forEach(n => { const b = window.__bub.find(x => x.n === n); if (b) b.t1 = performance.now(); }); })).observe(L, { childList:true }); });
    let maxSay = 0, overlap = 0, maxWalk = 0; const seen = new Set();
    for (let i = 0; i < 400; i++) {
      await page.waitForTimeout(250);
      const a = await page.evaluate(() => ({ says:document.querySelectorAll('.title-scene .say').length, w:[...document.querySelectorAll('.title-scene .actor')].map(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { who:el.dataset.who, lay:el.parentNode.getAttribute('class'), x:m.e, y:m.f, cls:el.querySelector('.cb').getAttribute('class') }; }) }));
      maxSay = Math.max(maxSay, a.says);
      const walk = a.w.filter(x => x.lay === 'L-aisle' || x.lay === 'L-front'); maxWalk = Math.max(maxWalk, walk.length);
      walk.forEach(x => { if (/act-phone/.test(x.cls) && !/act-walk/.test(x.cls)) seen.add('đứng xem điện thoại'); if (/act-run/.test(x.cls)) seen.add('chạy bộ'); });
      const byLane = {}; walk.forEach(x => (byLane[Math.round(x.y)] = byLane[Math.round(x.y)] || []).push(x));
      Object.values(byLane).forEach(L => { for (let p = 0; p < L.length; p++) for (let q = p + 1; q < L.length; q++) if (Math.abs(L[p].x - L[q].x) < 14 && L[p].x > 0 && L[p].x < 360 && L[q].x > 0 && L[q].x < 360) overlap++; });
    }
    const bub = await page.evaluate(() => window.__bub.map(b => ({ text:b.text, life:b.t1 ? Math.round(b.t1 - b.t0) : null })));
    const done = bub.filter(b => b.life != null), longest = Math.max(0, ...done.map(b => b.life));
    let repeat = 0; for (let i = 1; i < bub.length; i++) if (bub[i].text === bub[i - 1].text) repeat++;
    const texts = bub.map(b => b.text).join(' | ');
    if (/Cho cô|Bao nhiêu|Còn nóng/.test(texts)) seen.add('khách mua hàng rong'); if (/Lâu lắm|Đi đâu|Ăn sáng|đi làm muộn|Cuối tuần/.test(texts)) seen.add('hai người gặp nhau'); if (/đây!|Vòng không\?/.test(texts)) seen.add('hàng rong rao');
    check('Không bao giờ quá 2 bong bóng thoại cùng lúc', maxSay <= 2, 'nhiều nhất ' + maxSay);
    check('Bong bóng biến mất đúng lúc (không cái nào ở quá 2,5 giây)', longest <= 2500 && done.length >= 2, `${done.length} bong bóng, lâu nhất ${longest} mili giây`);
    check('Không lặp lại cùng một câu liền nhau', repeat === 0, repeat + ' lần');
    check('Không ai đi xuyên qua ai trên vỉa hè; mật độ vừa phải', overlap === 0 && maxWalk <= 6, `trùng chỗ ${overlap} lần, nhiều nhất ${maxWalk} người đi bộ`);
    check('Có các hành vi ngắn mới (ngẫu nhiên, trong 100 giây thấy ít nhất 2 loại)', seen.size >= 2, [...seen].join(', '));
    check('Không có lỗi', !page.errs.length, page.errs[0] || ''); await page.context().close(); }

  // 6. Giảm chuyển động: không có gì tự chạy, nút vẫn dùng được
  { const page = await open(browser, { reducedMotion:'reduce' }); await page.waitForTimeout(500);
    const a = await state(page); await page.waitForTimeout(3000); const b = await state(page);
    const anim = await page.evaluate(() => [...document.querySelectorAll('.title-scene *')].filter(e => getComputedStyle(e).animationName !== 'none').length);
    check('Giảm chuyển động: không hẹn giờ, không người mới xuất hiện, không hoạt ảnh trang trí', a.sTimers === 0 && b.actors === a.actors && anim === 0, `${anim} phần tử còn hoạt ảnh`);
    await page.click('#tSound'); await page.waitForTimeout(100); const c = await state(page);
    await page.click('#fresh'); await page.waitForTimeout(200);
    check('Giảm chuyển động: nút loa và nút Bắt đầu vẫn dùng được', c.audio && !!(await page.$('#go')) && !page.errs.length, page.errs[0] || '');
    await page.context().close(); }

  // 7. Hiệu năng: giả lập điện thoại với bộ xử lý chậm 4 lần
  { const page = await open(browser, { viewport:{ width:390, height:844 }, deviceScaleFactor:3, isMobile:true, hasTouch:true });
    await page.mouse.click(200, 150); await page.waitForTimeout(3000);
    const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
    const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])), t0 = Date.now();
    await page.waitForTimeout(15000);
    const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])), sec = (Date.now() - t0) / 1000;
    const cpu = Math.round((m1.TaskDuration - m0.TaskDuration) / sec * 100);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
    const fps = await page.evaluate(() => new Promise(r => { let n = 0, worst = 0, last = performance.now(); const t0 = last; const f = t => { n++; worst = Math.max(worst, t - last); last = t; t - t0 < 8000 ? requestAnimationFrame(f) : r({ fps:Math.round(n / 8), worst:Math.round(worst) }); }; requestAnimationFrame(f); }));
    check('Bộ xử lý thường: mức dùng CPU của trang', cpu < 60, `khoảng ${cpu}% một nhân, có nhạc`);
    check('Bộ xử lý chậm 4 lần: vẫn mượt', fps.fps >= 30, `${fps.fps} khung hình/giây, khung chậm nhất ${fps.worst} mili giây`);
    await page.context().close(); }

  // 8. (Tùy chọn) Để yên 5 phút: số phần tử, bộ nhớ, hẹn giờ không tăng dần
  if (process.env.DAI) { const page = await open(browser); await page.mouse.click(200, 150); const rows = [];
    for (let m = 0; m <= 5; m++) { if (m) await page.waitForTimeout(60000);
      rows.push(await page.evaluate(() => ({ phut:0, nodes:document.getElementsByTagName('*').length, heapMB:Math.round(performance.memory.usedJSHeapSize / 1e6), sTimers:stageTimers.size, aTimers:TA.timers.length, actors:document.querySelectorAll('.title-scene .actor').length }))); rows[m].phut = m; }
    console.table(rows);
    const first = rows[1], last = rows[5];
    check('Để yên 5 phút: số phần tử và bộ nhớ không tăng dần, hẹn giờ ổn định', last.nodes < first.nodes * 1.5 && last.heapMB < first.heapMB * 1.6 + 5 && last.sTimers < 60 && last.aTimers <= 4 && !page.errs.length, `phần tử ${first.nodes} → ${last.nodes}, bộ nhớ ${first.heapMB} → ${last.heapMB} MB`);
    await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục KHÔNG đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
