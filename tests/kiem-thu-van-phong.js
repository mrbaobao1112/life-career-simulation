// Kiểm thử văn phòng sống trong trình duyệt thật (cần Playwright): một ngày làm việc có sự kiện bất ngờ.
// Chạy: npm run van-phong
let chromium, devices;
try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('Bỏ qua: máy này chưa có Playwright (npm i -D playwright).'); process.exit(0); }
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };

async function open(browser, opts = {}){
  const ctx = await browser.newContext({ viewport:{ width:390, height:844 }, ...opts });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) page.errs.push(m.text().slice(0, 200)); });
  await page.addInitScript(() => window.addEventListener('unhandledrejection', e => console.error('REJ ' + (e.reason && e.reason.stack || e.reason))));
  await page.goto(URL); await page.click('#fresh'); await page.click('.bgopt[data-f] >> nth=1'); await page.click('.bgopt[data-b] >> nth=1'); await page.click('#go');
  await page.evaluate(() => { S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; S.slot = 'morning'; S.stat.workDays = 5; S.deck = shuffle(TASKS.map(t => t.id)); OFFICE_BAL.ABSENT = 0; STAGE_DEBUG.conflicts = 0; STAGE_DEBUG.log.length = 0; });
  return page;
}
const mount = (page, mode = 'work') => page.evaluate(mode => { const box = document.querySelector('#stage'); box.innerHTML = '<div class="panel stage">' + stageSVG('x') + '</div>'; stageMount(box, mode, {}); }, mode);
// Lấy mẫu vị trí và trạng thái của mọi nhân vật
const sample = page => page.evaluate(() => ({ t:OFFICE_DAY.elapsed, phase:OFFICE_DAY.event ? OFFICE_DAY.event.phase : '-', plan:Object.fromEntries(Object.entries(OFFICE_DAY.plans).map(([k, p]) => [k, p.i])),
  a:[...document.querySelectorAll('.stage .actor')].map(el => { const m = new DOMMatrix(getComputedStyle(el).transform);   // vị trí chân hiện tại trên sân khấu (không bị nhiễu bởi dáng đi, tư thế)
    return { who:el.dataset.who, state:el.dataset.state, owner:el.dataset.owner || '', aisle:el.parentNode.getAttribute('class') === 'L-aisle', gone:el.classList.contains('gone'), cx:m.e, cy:m.f }; }) }));
async function watch(page, ms, onTick){
  const out = { overlap:0, maxAway:0, samples:[] };
  for (let t = 0; t < ms; t += 250) {
    await page.waitForTimeout(250); const s = await sample(page); out.samples.push(s);
    const walk = s.a.filter(a => a.aisle && !a.gone); out.maxAway = Math.max(out.maxAway, walk.filter(a => a.who !== 'me').length);
    for (let i = 0; i < walk.length; i++) for (let j = i + 1; j < walk.length; j++) if (Math.abs(walk[i].cx - walk[j].cx) < 14 && Math.abs(walk[i].cy - walk[j].cy) < 5) { out.overlap++; (out.where = out.where || []).push(`${walk[i].who}(${walk[i].state}/${walk[i].owner}) và ${walk[j].who}(${walk[j].state}/${walk[j].owner}) tại x=${Math.round(walk[i].cx)}, pha ${s.phase}`); }
    if (onTick && await onTick(s, t)) break;
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();

  // 1. Họp đột xuất: lịch bị thay đổi rồi được khôi phục
  { const page = await open(browser);
    const who = await page.evaluate(() => officeForce('meeting', 4000).event.who); await mount(page);
    const r = await watch(page, 60000, s => s.phase === 'done' && s.t > 0 && false);
    const S0 = r.samples, iRun = S0.findIndex(s => s.phase === 'running'), iDone = S0.findIndex(s => s.phase === 'done');
    check('Họp đột xuất bắt đầu rồi kết thúc', iRun > 0 && iDone > iRun, `bắt đầu ở mẫu ${iRun}, xong ở mẫu ${iDone}`);
    const mid = S0.slice(iRun, iDone), allGone = mid.some(s => who.every(k => s.a.find(a => a.who === k).gone));
    check('Trong lúc họp, những người được gọi rời phòng; người khác vẫn làm việc', allGone && mid.some(s => s.a.filter(a => !who.includes(a.who) && a.who !== 'me').every(a => !a.gone)), who.join(', '));
    const end = S0[S0.length - 1], justAfter = S0[Math.min(S0.length - 1, iDone + 2)], back = who.every(k => { const a = justAfter.a.find(x => x.who === k); return !a.gone; });   // xét ngay sau khi họp xong (về sau chị Hạnh có thể đi họp theo lịch riêng)
    const planAtRun = S0[iRun].plan, planAtDone = S0[iDone].plan, planEnd = end.plan;
    const frozen = who.every(k => planAtDone[k] === planAtRun[k]), resumed = who.some(k => planEnd[k] > planAtDone[k]);
    check('Hết họp, mọi người về lại phòng', back);
    check('Lịch riêng dừng trong lúc họp và chạy tiếp từ chỗ đang dở sau khi họp xong', frozen && resumed, `trước họp ${JSON.stringify(planAtRun)}, sau cùng ${JSON.stringify(planEnd)}`);
    check('Không có hai người đứng trùng chỗ hay đi xuyên nhau', r.overlap === 0, `${r.overlap} lần trong ${S0.length} mẫu ${(r.where || []).join('; ')}`);
    const conf = await page.evaluate(() => STAGE_DEBUG.conflicts);
    check('Không có hai việc cùng điều khiển một người', conf === 0, conf + ' lần');
    const t1 = await page.evaluate(() => stageTimers.size); await page.evaluate(() => stageStop()); await page.waitForTimeout(1500);
    check('Chuyển cảnh thì không còn lệnh hẹn giờ nào', t1 > 0 && await page.evaluate(() => stageTimers.size) === 0, `${t1} → 0`);
    check('Không có lỗi', page.errs.length === 0, page.errs[0] || ''); await page.context().close(); }

  // 2. Đổi thẻ giữa lúc đang họp: sự kiện tiếp tục, không chạy lại từ đầu
  { const page = await open(browser);
    const who = await page.evaluate(() => officeForce('meeting', 3000).event.who); await mount(page);
    await watch(page, 30000, s => s.phase === 'running' && s.a.filter(a => a.gone).length >= 2);
    await mount(page); await page.waitForTimeout(400); const s1 = await sample(page);
    check('Dựng lại cảnh giữa cuộc họp: người đang họp vẫn vắng mặt', s1.phase === 'running' && who.every(k => s1.a.find(a => a.who === k).gone));
    const r = await watch(page, 30000, s => s.phase === 'done');
    await page.waitForTimeout(6000); const s2 = await sample(page);
    const log = await page.evaluate(() => STAGE_DEBUG.log.filter(x => x.startsWith('event')));
    check('Cuộc họp chỉ diễn ra một lần và kết thúc đúng', log.filter(x => x === 'event-start:meeting').length === 1 && log.filter(x => x === 'event-done:meeting').length === 1 && who.every(k => !s2.a.find(a => a.who === k).gone), log.join(', '));
    check('Không lỗi, không trùng chỗ, không tranh quyền điều khiển', page.errs.length === 0 && r.overlap === 0 && await page.evaluate(() => STAGE_DEBUG.conflicts) === 0, page.errs[0] || ''); await page.context().close(); }

  // 3. Lỗi khẩn cấp và chạy hạn chót; có người nghỉ phép
  for (const [id, absent] of [['hotfix', []], ['deadline', ['phong']]]) {
    const page = await open(browser);
    await page.evaluate(([id, absent]) => officeForce(id, 3000, absent), [id, absent]); await mount(page);
    const r = await watch(page, 50000, s => s.phase === 'done');
    await page.waitForTimeout(5000); const s = await sample(page);
    const seated = s.a.filter(a => !a.aisle && !a.gone).length, n = 5 - absent.length;
    check(`${id === 'hotfix' ? 'Lỗi khẩn cấp' : 'Chạy hạn chót' + (absent.length ? ' (Phong nghỉ phép)' : '')}: diễn ra trọn vẹn, xong thì ai về việc nấy`, s.phase === 'done' && s.a.length === n && seated >= n - 2 && r.overlap === 0 && page.errs.length === 0 && await page.evaluate(() => STAGE_DEBUG.conflicts) === 0,
      `${s.a.length} người, ${seated} đang ngồi, trùng chỗ ${r.overlap}, ${page.errs[0] || 'không lỗi'}`);
    if (absent.length) check('Bàn của người nghỉ phép có biển báo', await page.evaluate(() => document.querySelectorAll('.stage .away-sign').length) === 1);
    await page.context().close(); }

  // 4. Tua nhanh và sang ngày giữa lúc sự kiện đang diễn ra
  { const page = await open(browser);
    await page.evaluate(() => { S.habit = { meal:'rice', lunchWork:'team', bed:23.5, work:'careful' }; S.day = 8; S.slot = 'night'; S.queue = []; S.cur = null; S.sleep = 7.5; startDay(); });
    await page.locator('#stage .choice').first().click();                                   // thức dậy
    await page.evaluate(() => officeForce('meeting', 2500));
    for (let i = 0; i < 60 && await page.evaluate(() => S.cur && S.cur.id === 'cut'); i++) await page.waitForTimeout(500);
    await watch(page, 20000, s => s.phase === 'running');
    const d0 = await page.evaluate(() => S.day);
    await page.click('#ffDay'); await page.waitForTimeout(800);
    const st = await page.evaluate(() => ({ day:S.day, cur:S.cur && S.cur.id, timers:stageTimers.size, live:!!document.querySelector('.panel.stage') }));
    check('Qua nhanh giữa cuộc họp: game đi tiếp, không lỗi', page.errs.length === 0 && st.cur !== 'cut', `đang ở cảnh ${st.cur}`);
    for (let i = 0; i < 80 && await page.evaluate(d => S.day === d, d0); i++) { await page.evaluate(() => { const q = x => document.querySelector(x); if (q('#tSkip')) return q('#tSkip').click(); if (q('#next')) return q('#next').click(); const fd = q('#ffDay'); if (fd) return fd.click(); const ch = [...document.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]') && !b.textContent.includes('Tua đến')); if (ch.length) ch[0].click(); }); await page.waitForTimeout(150); }
    const d1 = await page.evaluate(() => S.day); await page.waitForTimeout(600);
    check('Sang ngày mới: không lỗi, không còn hẹn giờ của văn phòng hôm trước', d1 === d0 + 1 && page.errs.length === 0 && await page.evaluate(() => !document.querySelector('.panel.stage svg[viewBox="0 0 360 250"]')), `ngày ${d0} → ${d1}`);
    const fresh = await page.evaluate(() => { S.slot = 'morning'; const D = officeDay(); return D.day === S.day && (!D.event || D.event.phase === 'pending'); });
    check('Ngày mới có lịch văn phòng mới', fresh); await page.context().close(); }

  // 5. Hiệu năng: giả lập điện thoại, bộ xử lý chậm gấp 4 lần
  { const page = await open(browser, { ...devices['Pixel 5'] });
    const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
    await page.evaluate(() => officeForce('deadline', 2000)); await mount(page); await page.waitForTimeout(4000);
    const fps = await page.evaluate(() => new Promise(r => { let n = 0, worst = 0, last = performance.now(); const t0 = last; const f = t => { n++; worst = Math.max(worst, t - last); last = t; t - t0 < 5000 ? requestAnimationFrame(f) : r({ fps:Math.round(n / 5), worst:Math.round(worst) }); }; requestAnimationFrame(f); }));
    check('Giả lập điện thoại, bộ xử lý chậm 4 lần: vẫn mượt', fps.fps >= 30, `${fps.fps} khung hình/giây, khung chậm nhất ${fps.worst} mili giây`);
    await page.context().close(); }

  await browser.close();
  console.log(fail ? `\n${fail} mục KHÔNG đạt` : '\nTất cả đều đạt');
  process.exit(fail ? 1 : 0);
})();
