// Audit v17.6: đo trải nghiệm chơi 56 ngày (không phải bài đạt/không đạt).
// Bot chơi N ván bằng nút bấm (jsdom, chế độ thẻ cảnh; không đi lại tự do), ghi lại mỗi ngày gặp những cảnh nào, rồi đếm:
//   ngày "nhạt" (không có sự kiện, không có cảnh cần quyết định ngoài việc thường ngày), sự kiện lặp lại trong một ván,
//   hoạt động tự do được chọn, tỉ lệ ngày rảnh có ra ngoài, số chuyện NPC còn nhớ, số quyết định có hậu quả về sau.
// Dùng: node trai-nghiem.js 12     → in bảng và ghi ket-qua/trai-nghiem.json
const path = require('path'), fs = require('fs');
const { JSDOM } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const N = +process.argv[2] || 12;
const html = require('../nap-game')();
const THUONG = new Set(['wake', 'home_am', 'meal', 'bedtime', 'dayReport', 'cut', 'task', 'standup', 'endwork', 'activity', 'commute', 'monthReport', 'ffReport']);
const all = { van:[], ngayNhat:0, ngay:0, ev:{}, evLap:0, hd:{}, ra:0, ranh:0, nho:[], hauQua:{} };
for (let v = 0; v < N; v++) {
  let s = 100 + v * 37; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; } });
  const w = dom.window, d = w.document;
  d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[v % 3].click(); d.querySelectorAll('.bgopt[data-b]')[v % 3].click(); d.querySelector('#go').click();
  const ngay = {}; let last = null;
  for (let i = 0; i < 9000; i++) {
    if (d.querySelector('#again')) break;
    const S = w.eval('S'); const cur = S && S.cur;
    if (cur && cur !== last) { last = cur; const k = cur.id === 'ev' ? 'ev:' + cur.arg : cur.id; (ngay[S.day] = ngay[S.day] || []).push(k); }
    const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
    if (!ch.length) break;
    const c = ch[Math.floor(rnd() * ch.length)];
    if (cur && cur.id === 'activity') { const t = c.textContent.trim().split('\n')[0].trim().slice(0, 40); all.hd[t] = (all.hd[t] || 0) + 1; }
    c.click();
  }
  const S = w.eval('S'), seen = {};
  for (const [dd, L] of Object.entries(ngay)) {
    all.ngay++; const dac = L.filter(k => !THUONG.has(k));
    if (!dac.length) all.ngayNhat++;
    L.filter(k => k.startsWith('ev:')).forEach(k => { all.ev[k] = (all.ev[k] || 0) + 1; seen[k] = (seen[k] || 0) + 1; });
    if (w.eval(`isDayOff(${dd})`)) { all.ranh++; if (L.some(k => /hangout|ev:(tung_beer|linh_study|cafe|lake)/.test(k))) all.ra++; }
  }
  all.evLap += Object.values(seen).filter(n => n > 1).length;
  all.nho.push((S.npcMem || []).length);
  for (const k of ['football', 'loanTung', 'tungStudy', 'phongDesign', 'dutyPromise']) if (S.flags[k]) all.hauQua[k] = (all.hauQua[k] || 0) + 1;
  all.van.push({ ket:S.day, tien:S.money, viec:S.job && S.job.co, ngayDacBiet:Object.values(ngay).filter(L => L.some(k => !THUONG.has(k))).length });
  w.close();
}
const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
const out = { soVan:N, tiLeNgayNhat:+(all.ngayNhat / all.ngay * 100).toFixed(1), suKienKhacNhau:Object.keys(all.ev).length, suKienMoiVan:+(Object.values(all.ev).reduce((a, b) => a + b, 0) / N).toFixed(1),
  suKienLapMoiVan:+(all.evLap / N).toFixed(1), suKienNhieuNhat:top(all.ev).slice(0, 8), hoatDongTuDo:top(all.hd).slice(0, 12), ngayNghiCoRaNgoai:all.ranh ? +(all.ra / all.ranh * 100).toFixed(1) : 0,
  chuyenNpcNhoCuoiVan:all.nho, hauQua:all.hauQua, van:all.van };
fs.mkdirSync(path.join(__dirname, 'ket-qua'), { recursive:true }); fs.writeFileSync(path.join(__dirname, 'ket-qua', 'trai-nghiem.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
