// Kiểm thử v18.0: TỰ CHẠY BAN NGÀY
// 1–4 chạy bằng jsdom (cả ván 56 ngày): bật và tắt tự chạy cho cùng kết quả, không bỏ qua cảnh đáng dừng,
//   buổi tối và cuối tuần không tự chạy, thẻ tóm tắt, các điểm dừng bắt buộc, "Tự chọn hôm nay", lưu/tải, số chữ và số lần bấm.
// 5 chạy trên trình duyệt thật (điện thoại giả lập): màn thức dậy, thẻ tóm tắt, thế giới đi lại, Cài đặt.
// Chạy: npm run tu-chay
const { JSDOM } = require('jsdom');
const html = require('./nap-game')();
const fs = require('fs'), path = require('path');
let fail = 0;
const check = (name, ok, extra = '') => { console.log((ok ? '✅' : '❌') + ' ' + name + (extra ? ' → ' + extra : '')); if (!ok) fail++; };
const nghi = () => new Promise(r => setTimeout(r, 0));   // cho jsdom dọn cửa sổ vừa đóng (xem choi-ngau-nhien.js)

// Mở game: hạt giống cố định cho số ngẫu nhiên của game; tc/dn: bật (true) hay tắt (false) tự chạy, Đọc nhanh
function mo(seed, { tc = true, dn = true, luu } = {}){
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd;
      w.localStorage.setItem('lcs-tu-chay', tc ? '1' : '0'); w.localStorage.setItem('lcs-doc-nhanh', dn ? '1' : '0');
      if (luu) for (const [k, v] of Object.entries(luu)) w.localStorage.setItem(k, v); } });
  const w = dom.window; w.errs = []; w.addEventListener('error', e => w.errs.push(e.message)); return w;
}
const batDau = (w, b) => { const d = w.document; d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[1].click(); d.querySelectorAll('.bgopt[data-b]')[b].click(); d.querySelector('#go').click(); w.eval('S.opt.roam = false'); };
const hien = (w, sel) => { const r = w.document.querySelector(sel); if (!r) return ''; const c = r.cloneNode(true);
  c.querySelectorAll('details:not([open])').forEach(dt => [...dt.children].forEach(x => { if (x.tagName !== 'SUMMARY') x.remove(); })); c.querySelectorAll('code,pre,[hidden]').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' '); };
const tu = s => (String(s).match(/\S+/g) || []).length;
const NEP_BOT = "['wake','meal','bedtime']", VIEC_BOT = /^(d1_cv|apply|reapply|iv_|bk_|ob_|call_invite)/;   // tìm việc, phỏng vấn: bot trả lời tử tế (lựa chọn đầu) để có việc sớm như người chơi bình thường   // bot sống theo nếp ở 3 việc sinh hoạt (dậy, ăn, ngủ đúng giờ) như người chơi bình thường; cảnh khác chọn đa dạng
const bam = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// Bot chơi theo nếp, KHÔNG dùng số ngẫu nhiên của game (để bật hay tắt tự chạy đi cùng một đường):
// - việc lặp lại (TC_LAP): bấm đúng lựa chọn tự chạy sẽ chọn (tcChonNep);
// - cảnh khác: chọn theo một số băm từ (ngày, buổi, cảnh, lần thứ mấy), không chọn "Tua"/"Qua nhanh";
// - không mở điện thoại.
// Đếm: số lần bấm, số chữ của mỗi màn hình mới, lần bấm ở buổi tối/đêm/cuối tuần, chuỗi cảnh không phải việc lặp lại.
function choi(w, den = 99){
  const d = w.document, kq = { bam:0, chu:0, bamToi:0, chuoi:[], tomTat:[], loi:null };
  let last = null; const lan = {};
  for (let i = 0; i < 40000; i++) {
    if (d.querySelector('#again')) break;
    const S = w.eval('S'); if (S.day >= den) break;
    const toi = !w.eval('isWorkday()') || ['evening', 'night'].includes(S.slot);
    const nhan = () => { kq.bam++; if (toi) kq.bamToi++; };
    const man = S.phase === 'week' ? 'week' + S.day : S.cur ? S.cur : null;
    if (man && man !== last) { last = man; kq.chu += tu(hien(w, '#stage'));
      if (S.cur && S.phase !== 'week') { const id = S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id;
        if (id === 'tcTomTat') kq.tomTat.push({ d:S.day, slot:S.slot, dong:d.querySelectorAll('#stage article.journal > p:not(.tip), #stage article.journal > .chips').length, chu:tu(hien(w, '#stage article.journal')) });
        else if (!w.eval('!!TC_LAP[S.cur.id]')) kq.chuoi.push(`${S.day}:${S.slot}:${id}`); } }
    const nw = d.querySelector('#nextWeek'); if (nw) { nhan(); nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { nhan(); ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { kq.chu += tu(hien(w, '#stage .result .st')); nhan(); nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]') && !/^\s*\S*\s*(Tua |Qua nhanh)/.test(b.textContent));
    if (!ch.length) { kq.loi = 'kẹt ở ' + (S.cur && S.cur.id); break; }
    let j = w.eval('S.cur && S.cur.id === "tcTomTat" ? 0 : S.cur && current && TC_LAP[S.cur.id] ? tcChonNep(S.cur, current) : S.cur && current && ' + NEP_BOT + '.includes(S.cur.id) ? (() => { S.fast = { from:S.day, until:S.day }; const k = autoPick(S.cur, current); S.fast = null; return k; })() : -1');
    let b = j >= 0 ? ch.find(x => +x.dataset.i === j) : null;
    if (!b && S.cur && VIEC_BOT.test(S.cur.id)) b = ch[0];
    if (!b) { const k = `${S.day}|${S.slot}|${S.cur && S.cur.id}`; lan[k] = (lan[k] || 0) + 1; b = ch[bam(k + '|' + lan[k]) % ch.length]; }
    nhan(); b.click();
  }
  const S = w.eval('S');
  kq.cuoi = JSON.stringify({ day:S.day, money:S.money, energy:S.energy, health:S.health, mood:S.mood, tech:S.tech, soft:S.soft, rel:S.rel, job:S.job && S.job.co, perf:S.perf, tasks:S.stat.tasks, bugs:S.stat.bugsMade, lv:S.lv || null });
  kq.chay = (w.TC_DEBUG_CHAY || []).slice(); kq.dung = (w.TC_DEBUG || []).slice();
  if (!kq.loi && w.errs.length) kq.loi = w.errs[0];
  return kq;
}

(async () => {
  // 1. Cả ván 56 ngày, 3 hoàn cảnh: tắt, bật tự chạy (cùng hạt giống, cùng cách bấm), và bản "v17.6" (tắt cả Đọc nhanh) để so số chữ
  const VAN = [[101, 0, 'Nhà bố mẹ'], [202, 1, 'Phòng trọ'], [303, 2, 'Ở ghép']], kqVan = [];
  for (const [seed, bg, ten] of VAN) {
    const r = {};
    for (const [k, o] of [['tat', { tc:false }], ['bat', { tc:true }], ['goc', { tc:false, dn:false }]]) { const w = mo(seed, o); batDau(w, bg); r[k] = choi(w); w.close(); await nghi(); }
    kqVan.push({ ten, ...r });
  }
  for (const v of kqVan) {
    check(`${v.ten}: chơi trọn 56 ngày, không kẹt, không lỗi (tắt và bật tự chạy)`, !v.tat.loi && !v.bat.loi && JSON.parse(v.bat.cuoi).day >= 56 && JSON.parse(v.tat.cuoi).day >= 56, v.tat.loi || v.bat.loi || '');
    check(`${v.ten}: bật hay tắt tự chạy, cùng kết quả cuối ván (tiền, chỉ số, quan hệ, công việc, ngày)`, v.tat.cuoi === v.bat.cuoi, v.tat.cuoi === v.bat.cuoi ? `tự chạy ${v.bat.chay.length} việc` : `${v.tat.cuoi} | ${v.bat.cuoi}`);
    const lech = v.tat.chuoi.findIndex((x, i) => x !== v.bat.chuoi[i]);
    check(`${v.ten}: không bỏ qua cảnh đáng dừng nào (cùng ${v.tat.chuoi.length} cảnh, cùng thứ tự ở hai chế độ)`, v.tat.chuoi.length === v.bat.chuoi.length && lech < 0, lech >= 0 ? `khác từ ${v.tat.chuoi[lech]} / ${v.bat.chuoi[lech]}` : '');
    const sai = v.bat.chay.filter(c => !c.lam || !['morning', 'noon', 'afternoon'].includes(c.slot));
    check(`${v.ten}: chỉ tự chạy ban ngày của ngày làm việc (không buổi tối, đêm, cuối tuần, ngày nghỉ)`, !sai.length && v.bat.chay.length > 0, sai.slice(0, 3).map(c => `${c.d}:${c.slot}:${c.id}`).join(', '));
    const ngay = [...new Set(v.bat.chay.map(c => c.d))], thieu = ngay.filter(d => !v.bat.tomTat.some(t => t.d === d));
    const dai = v.bat.tomTat.filter(t => t.dong > 3);
    check(`${v.ten}: mỗi ngày có tự chạy đều có một thẻ tóm tắt ở đầu buổi tối, tối đa 3 dòng (${v.bat.tomTat.length} thẻ)`, !thieu.length && !dai.length && v.bat.tomTat.every(t => ['evening', 'night'].includes(t.slot)), [...thieu.map(d => 'thiếu ngày ' + d), ...dai.map(t => `ngày ${t.d}: ${t.dong} dòng`)].join(', '));
  }
  const tong = k => m => kqVan.reduce((n, v) => n + v[m][k], 0);
  const chuGoc = tong('chu')('goc'), chuBat = tong('chu')('bat'), bamTat = tong('bam')('tat'), bamBat = tong('bam')('bat');
  const giamChu = Math.round((1 - chuBat / chuGoc) * 100), giamBam = Math.round((1 - bamBat / bamTat) * 100);
  const toiTat = Math.round(tong('bamToi')('tat') / bamTat * 100), toiBat = Math.round(tong('bamToi')('bat') / bamBat * 100);
  // Chế độ thẻ (không đi lại): từ v17, ban ngày ở chế độ này đã gần như tự qua (họp, task chiều, tan làm), chỉ còn task buổi sáng.
  // Nên mức giảm ở đây nhỏ; mức giảm ở chế độ mặc định (đi lại) đo ở phần 5. Hai kiểm tra dưới là ngưỡng chặn (không được tệ đi), mục tiêu ghi riêng.
  check('Chế độ thẻ, cả ván: số lần bấm giảm khi bật tự chạy, số chữ không tăng', bamBat < bamTat && chuBat <= tong('chu')('tat'), `${bamTat} → ${bamBat} lần (giảm ${giamBam}%), chữ ${tong('chu')('tat')} → ${chuBat}`);
  check('Chế độ thẻ, cả ván: chữ giảm ít nhất 25% so với v17.6 (ngưỡng chặn; mục tiêu 50% xem dòng dưới)', giamChu >= 25, `${chuGoc} → ${chuBat} từ, giảm ${giamChu}%`);
  console.log(`   MỤC TIÊU (chế độ thẻ): chữ giảm 50% so với v17.6: ${giamChu >= 50 ? 'ĐẠT' : 'CHƯA ĐẠT'} (${giamChu}%); lần bấm giảm 30%: ${giamBam >= 30 ? 'ĐẠT' : 'CHƯA ĐẠT'} (${giamBam}%)`);
  check('Phần chơi ở buổi tối và cuối tuần chiếm tỷ lệ lớn hơn (tính theo lần bấm)', toiBat > toiTat, `${toiTat}% → ${toiBat}%`);
  const lyDo = {}; kqVan.forEach(v => v.bat.dung.forEach(x => { lyDo[x.why] = (lyDo[x.why] || 0) + 1; }));
  console.log(`   (số đo: chữ tắt tự chạy ${tong('chu')('tat')}, bật ${chuBat}, v17.6 ${chuGoc}; lần bấm v17.6 ${tong('bam')('goc')}; lý do dừng ở việc lặp lại: ${JSON.stringify(lyDo)})`);
  fs.mkdirSync(path.join(__dirname, 'ket-qua'), { recursive:true });
  fs.writeFileSync(path.join(__dirname, 'ket-qua', 'tu-chay.json'), JSON.stringify({ giamChu, giamBam, toiTat, toiBat, chuGoc, chuBat, chuTat:tong('chu')('tat'), bamTat, bamBat, bamGoc:tong('bam')('goc'), lyDo,
    van:kqVan.map(v => ({ ten:v.ten, tat:{ bam:v.tat.bam, chu:v.tat.chu }, bat:{ bam:v.bat.bam, chu:v.bat.chu, tuChay:v.bat.chay.length, tomTat:v.bat.tomTat.length }, goc:{ bam:v.goc.bam, chu:v.goc.chu } })) }, null, 1));

  // 2. Điểm dừng bắt buộc: ngày làm việc buổi sáng, việc "họp đầu ngày" (đã gặp) có tự chạy không
  { const thu = (dat, kt = "S.cur && S.cur.id") => { const w = mo(9); batDau(w, 1);
      const r = w.eval(`S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 10; S.slot = 'morning'; S.money = 3e6; S.energy = 80; S.health = 75; S.mood = 65; S.bills = []; S.npcMem = []; S.phone.pending = {}; S.lateToday = false; S.flags.hangoverToday = false;
        tcGap(); Object.keys(TC_LAP).forEach(k => S.tcGap[k] = 1); habit().lunchWork = 'team'; ${dat}; S.queue = [{ id:'standup' }, { id:'task', arg:{ tid:102 } }]; S.cur = null; advance(); ${kt}`); w.close(); return r; };
    // (chế độ thẻ: "họp đầu ngày" đã tự qua từ v17 khi không đi lại được, nên việc lặp lại đầu tiên có thể dừng là task buổi sáng)
    const CA = [['Bình thường (đối chứng)', '', 'tu-chay'], ['Năng lượng thấp', 'S.energy = 20', 'task'], ['Sức khỏe yếu', 'S.health = 30', 'task'], ['Tinh thần thấp', 'S.mood = 20', 'task'],
      ['Tiền ít', 'S.money = 100000', 'task'], ['Hóa đơn sắp đến hạn, không đủ tiền', "S.money = 1e6; S.bills = [{ id:'x', kind:'rent', amount:2e6, due:11, paid:false }]", 'task'],
      ['Đi làm muộn', 'S.lateToday = true', 'task'], ['Có tin nhắn chưa trả lời', "S.phone.pending = { family:{ id:'fam_eat', deadline:99 } }", 'task'],
      ['Đồng nghiệp còn chuyện muốn nhắc (đi lại được: dừng ở văn phòng)', "S.opt.roam = true; S.npcMem = [{ w:'dung', o:'me', k:'ev:coffee_run', v:1, d:8, n:0 }]", 'standup'],
      ['Đồng nghiệp còn chuyện muốn nhắc (chế độ thẻ: không có lúc nhắc nên không dừng)', "S.npcMem = [{ w:'dung', o:'me', k:'ev:coffee_run', v:1, d:8, n:0 }]", 'tu-chay'], ['Lần đầu làm task buổi sáng', 'delete S.tcGap.task', 'task'],
      ['Bấm "Tự chọn hôm nay"', 'S.tcTay = S.day', 'task'], ['Tắt tự chạy', 'tcDat(false)', 'task']];
    const sai = [];
    for (const [ten, dat, mong] of CA) { const r = thu(dat, "S.cur ? (S.cur.id === 'task' ? 'task' : S.cur.id) : 'không'"); const ok = mong === 'tu-chay' ? !['standup', 'task'].includes(r) : r === mong; if (!ok) sai.push(`${ten}: dừng ở ${r}`); }
    check(`Các điểm dừng bắt buộc đều dừng (${CA.filter(c => c[2] !== 'tu-chay').length} trường hợp); ngày bình thường thì tự chạy`, !sai.length, sai.join(' | '));
    // Tin nhắn chỉ làm dừng một lần, không trả lời thì lần sau vẫn tự chạy
    // hai task buổi sáng liền nhau: tin nhắn làm dừng ở task đầu; bỏ qua tin nhắn thì task sau tự chạy
    const r2 = thu("S.phone.pending = { family:{ id:'fam_eat', deadline:99 } }", "S.queue = [{ id:'task', arg:{ tid:103 } }, { id:'meal', arg:'lunch' }]; const a = S.cur.id; choose(0); const n = document.querySelector('#next'); if (n) n.click(); const b = S.cur ? S.cur.id : ''; a + '>' + b + '>' + (window.TC_DEBUG_CHAY || []).map(c => c.id).join('+')");
    check('Một tin nhắn chưa trả lời chỉ làm dừng một lần (bỏ qua thì việc sau vẫn tự chạy)', r2.split('>')[0] === 'task' && r2.split('>')[2] === 'task', r2); }

  // 3. Buổi tối và cuối tuần không tự chạy (kể cả khi đủ điều kiện), cảnh buổi tối vẫn hiện
  { const w = mo(12); batDau(w, 1);
    const r = w.eval(`S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 10; tcGap(); Object.keys(TC_LAP).forEach(k => S.tcGap[k] = 1); S.slot = 'evening'; S.queue = [{ id:'activity', arg:'evening' }]; S.cur = null; advance(); const a = S.cur.id;
      S.day = 13; S.slot = 'morning'; S.queue = [{ id:'activity', arg:'morning' }]; S.cur = null; advance(); a + ',' + S.cur.id + ',' + isWorkday()`);
    check('Buổi tối ngày làm việc và buổi sáng cuối tuần: không tự chạy, hiện cảnh giờ rảnh như cũ', r === 'activity,activity,false', r); w.close(); await nghi(); }

  // 4. Lưu giữa lúc đang tự chạy (đã qua vài ngày tự chạy) rồi tải lại; bản lưu cũ 16.1 → 17.9 vẫn tải và chơi tiếp được
  { const w = mo(404); batDau(w, 1); choi(w, 12); const kho = Object.keys(w.localStorage).filter(k => k !== 'lcs-tu-chay' && k !== 'lcs-doc-nhanh'), luu = {}; kho.forEach(k => { luu[k] = w.localStorage.getItem(k); });
    const ngay = w.eval('S.day'); w.close(); await nghi();
    const w2 = mo(405, { luu }); const cont = w2.document.querySelector('#resume'); if (cont) cont.click();
    const r = choi(w2, 26); check('Lưu sau vài ngày tự chạy, tải lại rồi chơi tiếp 2 tuần: không lỗi, vẫn tự chạy, nhớ những việc đã gặp', !r.loi && w2.eval('S.day') >= 26 && r.chay.length > 0 && w2.eval('!!(S.tcGap && S.tcGap.task)'), `ngày ${ngay} → ${w2.eval('S.day')}, tự chạy ${r.chay.length} việc ${r.loi || ''}`); w2.close(); await nghi();
    const MAU = path.join(__dirname, 'du-lieu-mau'), sai = []; let n = 0;
    for (const f of fs.existsSync(MAU) ? fs.readdirSync(MAU).filter(f => f.endsWith('.json')) : []) {
      const m = JSON.parse(fs.readFileSync(path.join(MAU, f), 'utf8')); if (!m.key || !m.value) continue;
      const w3 = mo(500 + n++, { luu:{ [m.key]:m.value } }); const c = w3.document.querySelector('#resume'); if (c) c.click();
      const r3 = choi(w3, Math.min(56, (w3.eval('S && S.day') || 1) + 4)); if (r3.loi) sai.push(`${f}: ${r3.loi}`); w3.close(); await nghi();
    }
    check(`Bản lưu cũ (${n} bản mẫu) tải được, chơi tiếp 4 ngày với tự chạy bật: không lỗi`, n > 0 && !sai.length, sai.slice(0, 3).join(' | ') || (n ? '' : 'không đọc được bản mẫu nào')); }

  // 5. Trình duyệt thật (điện thoại giả lập), chế độ mặc định: đi lại được, Đọc nhanh bật.
  // Tắt các chuyện ngẫu nhiên ban ngày (kẹt xe, mưa, tin nhắn, sự kiện, ngày đặc biệt) để kiểm tra đúng luồng giao diện; luật dừng đã kiểm tra ở phần 2.
  let chromium, devices; try { ({ chromium, devices } = require('playwright')); } catch (e) { console.log('⏭️ SKIP: máy này chưa có Playwright (chạy: cd tests && npm install). Phần 5 CHƯA CHẠY, không tính là đạt.'); process.exit(3); }
  const URL = 'file://' + path.join(__dirname, '..', 'index.html'), br = await chromium.launch();
  const moNgay = async (p, tc) => {
    await p.goto(URL); await p.evaluate(v => localStorage.setItem('lcs-tu-chay', v), tc ? '1' : '0'); await p.goto(URL);
    await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go');
    await p.evaluate(() => { S.once.roamTut = true; S.once.tcGioiThieu = true; S.job = { co:'hotay', salary:1e7, start:3 }; habit().lunchWork = 'team'; habit().work = 'careful'; S.day = 9; tcGap(); Object.keys(TC_LAP).forEach(k => S.tcGap[k] = 1);
      S.npcMem = []; S.phone.pending = {}; pushCommute = () => {}; maybeMsg = () => {}; maybeEvent = () => {}; ngayQueue = () => false; S.cur = null; S.queue = []; S.slot = 'night'; startDay(); });
    await p.waitForTimeout(500);
  };
  // Đi hết ban ngày như người chơi: mỗi màn hình cần người chơi (cảnh, màn kết quả) tính một lần; chọn như nếp (việc lặp lại), không thì lựa chọn đầu không tốn tiền
  const quaBanNgay = async p => { let man = 0, vp = 0;
    for (let i = 0; i < 30 && await p.evaluate(() => !(S.cur && S.cur.id === 'tcTomTat') && ['morning','noon','afternoon'].includes(S.slot)); i++) {
      const r = await p.evaluate(() => { const o = document.querySelector('#world') && document.querySelector('#world').dataset.place === 'office' ? 1 : 0, n = document.querySelector('#next');
        if (n) n.click(); else if (S.cur && current && current.choices) { const j = TC_LAP[S.cur.id] ? tcChonNep(S.cur, current) : -1; choose(j >= 0 ? j : Math.max(0, current.choices.findIndex(c => !c.disabled && !c.cost && !/Nằm/.test(c.label)))); }
        return o; }); man++; vp += r; await p.waitForTimeout(150); }
    return { man, vp }; };
  const SO = {};
  for (const [dv, scheme] of [['iPhone 13', 'light'], ['iPhone 13', 'dark'], ['iPhone SE', 'light']]) {
    const ctx = await br.newContext({ ...devices[dv], colorScheme:scheme }); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const p = await ctx.newPage(), errs = [], ten = `${dv} (${scheme === 'light' ? 'sáng' : 'tối'})`; p.on('pageerror', e => errs.push(e.message));
    await moNgay(p, true);
    // lựa chọn đầu: nút trong khung thế giới (đi lại được) hoặc nút lựa chọn đầu; cách đo như bài doc-nhanh: mép trên + 30 nằm trong màn hình
    const thuc = await p.evaluate(() => { const b = document.querySelector('#stage .tc-bar'), c = [...document.querySelectorAll('#world .w-wake button, #stage .choice')].find(x => x.getBoundingClientRect().height > 0);
      return { id:S.cur.id, bar:!!b && b.getBoundingClientRect().height > 0, nut:!!document.querySelector('#tcTay'), y:c ? Math.round(c.getBoundingClientRect().top + 30) : 9999, h:innerHeight, tran:document.documentElement.scrollWidth > innerWidth + 1 }; });
    check(`${ten}: màn thức dậy báo trước ban ngày tự qua, có nút "Tự chọn hôm nay"; lựa chọn đầu hiện ngay màn đầu, không tràn ngang`, thuc.id === 'wake' && thuc.bar && thuc.nut && thuc.y <= thuc.h && !thuc.tran, JSON.stringify(thuc));
    const qua = await quaBanNgay(p);
    const tt = await p.evaluate(() => { const a = document.querySelector('#stage article.journal'), c = [...document.querySelectorAll('#stage .choice')].find(b => /Tiếp/.test(b.textContent));
      return { id:S.cur && S.cur.id, slot:S.slot, van:(window.TC_DEBUG_CHAY || []).map(c => c.id).join(','), the:a ? Math.round(a.getBoundingClientRect().top) : -1, tiep:c ? Math.round(c.getBoundingClientRect().top + 30) : 9999, h:innerHeight, tran:document.documentElement.scrollWidth > innerWidth + 1 }; });
    check(`${ten}: ban ngày tự qua (không vào văn phòng đi lại); thẻ tóm tắt và nút "Tiếp" hiện ngay, không phải cuộn`, tt.id === 'tcTomTat' && !qua.vp && /standup/.test(tt.van) && /task/.test(tt.van) && tt.the >= 0 && tt.tiep <= tt.h && !tt.tran, JSON.stringify({ ...tt, ...qua }));
    await p.evaluate(() => { const c = [...document.querySelectorAll('#stage .choice')].find(b => /Tiếp/.test(b.textContent)); c.click(); }); await p.waitForTimeout(600);
    const toi = await p.evaluate(() => ({ slot:S.slot, id:S.cur && S.cur.id, world:!!document.querySelector('#world') }));
    check(`${ten}: bấm "Tiếp" là sang buổi tối, chơi như cũ`, toi.slot === 'evening' && toi.id !== 'tcTomTat', JSON.stringify(toi));
    if (!SO.bat) SO.bat = qua.man + 1;   // + thẻ tóm tắt
    check(`Không lỗi (${ten})`, !errs.length, errs[0] || ''); await ctx.close();
  }
  // Cùng ngày đó khi tắt tự chạy: đếm số màn hình ban ngày người chơi phải xử lý (mỗi màn ở văn phòng còn phải đi tới chỗ, ở đây không tính bước đi)
  { const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); await moNgay(p, false);
    const qua = await quaBanNgay(p); SO.tat = qua.man; await ctx.close();
    const giam = Math.round((1 - SO.bat / SO.tat) * 100);
    check('Chế độ mặc định (đi lại được), một ngày làm việc bình thường: số màn hình ban ngày phải xử lý giảm ít nhất 60%', giam >= 60, `tắt tự chạy ${SO.tat} màn (${qua.vp} màn ở văn phòng), bật ${SO.bat} màn, giảm ${giam}%`);
    fs.writeFileSync(path.join(__dirname, 'ket-qua', 'tu-chay-mac-dinh.json'), JSON.stringify(SO)); }
  // "Tự chọn hôm nay": ban ngày chơi như cũ (vào văn phòng đi lại); nút ở cuối màn hình và công tắc trong Cài đặt
  { const ctx = await br.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.click('#fresh'); await p.click('.bgopt[data-f] >> nth=1'); await p.click('.bgopt[data-b="tro"]'); await p.click('#go');
    await p.evaluate(() => { S.once.roamTut = true; S.job = { co:'hotay', salary:1e7, start:3 }; S.day = 9; tcGap(); Object.keys(TC_LAP).forEach(k => S.tcGap[k] = 1); S.npcMem = []; S.phone.pending = {}; S.cur = null; S.queue = []; S.slot = 'night'; startDay(); });
    await p.waitForTimeout(400); await p.click('#tcTay'); await p.waitForTimeout(200);
    const bar = await p.textContent('#stage .tc-bar');
    await p.evaluate(() => { const i = current.choices.findIndex(c => !c.cost && !/Nằm/.test(c.label)); choose(i >= 0 ? i : 0); }); await p.waitForTimeout(400);
    for (let i = 0; i < 6 && await p.evaluate(() => !document.querySelector('#world')); i++) { await p.evaluate(() => { const n = document.querySelector('#next'); if (n) n.click(); else choose(Math.max(0, current.choices.findIndex(c => !c.disabled))); }); await p.waitForTimeout(300); }
    const r = await p.evaluate(() => ({ slot:S.slot, place:document.querySelector('#world') && document.querySelector('#world').dataset.place, chay:(window.TC_DEBUG_CHAY || []).length }));
    check('Bấm "Tự chọn hôm nay": ban ngày chơi như cũ (vào thế giới đi lại buổi sáng, không tự chạy việc nào)', /Tự chọn từng buổi/i.test(bar) && r.slot === 'morning' && !!r.place && r.chay === 0, `${bar} ${JSON.stringify(r)}`);
    const nut = await p.evaluate(() => { const b = document.querySelector('#btnTc'), a = b.textContent; b.click(); const c = b.textContent, l = localStorage.getItem('lcs-tu-chay'); b.click(); return { a, c, l, d:b.textContent }; });
    check('Nút "🌤️ Tự chạy ban ngày" ở cuối màn hình: bấm thì tắt (nhớ lựa chọn), bấm lại thì bật', /bật/.test(nut.a) && /tắt/.test(nut.c) && nut.l === '0' && /bật/.test(nut.d), JSON.stringify(nut));
    await p.goto(URL); await p.click('#tGear'); await p.waitForTimeout(300);
    const sw = await p.evaluate(() => { const s = document.querySelector('#swTc'); if (!s) return null; const a = s.getAttribute('aria-checked'); s.click(); return { a, b:document.querySelector('#swTc').getAttribute('aria-checked'), l:localStorage.getItem('lcs-tu-chay') }; });
    check('Cài đặt ở màn hình mở đầu có công tắc "Tự chạy ban ngày" (mặc định bật), tắt được và nhớ lựa chọn', sw && sw.a === 'true' && sw.b === 'false' && sw.l === '0', JSON.stringify(sw));
    check('Không lỗi', !errs.length, errs[0] || ''); await ctx.close(); }
  await br.close();
  console.log(fail ? `\n${fail} mục chưa đạt` : '\nTất cả kiểm tra đều đạt');
  process.exit(fail ? 1 : 0);
})();
