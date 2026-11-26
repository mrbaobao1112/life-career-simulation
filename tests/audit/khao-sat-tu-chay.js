// Khảo sát v18.0 (trước khi làm tự chạy): mỗi cảnh hiện bao nhiêu lần, tốn bao nhiêu lần bấm, bao nhiêu chữ, ở buổi nào.
// 2 hạt giống × 3 hoàn cảnh, chơi trọn 56 ngày, tự chạy TẮT, Đọc nhanh bật. Bot chơi theo nếp như bài kiem-thu-tu-chay.js.
// Chạy: cd tests && node --max-old-space-size=1024 audit/khao-sat-tu-chay.js   → in bảng, ghi tests/audit/ket-qua/khao-sat-tu-chay.json
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = require('../nap-game')();
const tu = s => (String(s).match(/\S+/g) || []).length;
const NEP_BOT = "['wake','meal','bedtime']", VIEC_BOT = /^(d1_cv|apply|reapply|iv_|bk_|ob_|call_invite)/;   // tìm việc, phỏng vấn: bot trả lời tử tế (lựa chọn đầu) để có việc sớm như người chơi bình thường   // bot sống theo nếp ở 3 việc sinh hoạt (dậy, ăn, ngủ đúng giờ) như người chơi bình thường; cảnh khác chọn đa dạng
const bam = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const hien = (w, sel) => { const r = w.document.querySelector(sel); if (!r) return ''; const c = r.cloneNode(true);
  c.querySelectorAll('details:not([open])').forEach(dt => [...dt.children].forEach(x => { if (x.tagName !== 'SUMMARY') x.remove(); })); c.querySelectorAll('code,pre,[hidden]').forEach(x => x.remove()); return c.textContent.replace(/\s+/g, ' '); };
const BUOI = { morning:'sáng', noon:'trưa', afternoon:'chiều', evening:'tối', night:'đêm' };
(async () => {
  const canh = {}, buoi = {}; let van = 0;
  for (const seed of [11, 29]) for (const bg of [0, 1, 2]) {
    let s = seed * 7 + bg; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
      beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; w.localStorage.setItem('lcs-tu-chay', '0'); } });
    const w = dom.window, d = w.document;
    d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[1].click(); d.querySelectorAll('.bgopt[data-b]')[bg].click(); d.querySelector('#go').click(); w.eval('S.opt.roam = false');
    let last = null, key = null, truoc = ''; const lan = {};
    for (let i = 0; i < 40000; i++) {
      if (d.querySelector('#again')) break;
      const S = w.eval('S');
      const loai = S.phase === 'week' ? 'Tổng kết tuần' : S.cur ? (S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id) : 'kết quả ' + truoc;
      if (S.cur) truoc = S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id;
      const nhom = S.phase === 'week' ? 'cuối tuần' : !w.eval('isWorkday()') ? (w.eval('!!S.job') ? 'ngày nghỉ' : 'chưa có việc') : BUOI[S.slot];
      const man = S.phase === 'week' ? 'w' + S.day : S.cur || ('kq' + i);
      if (man !== last) { last = man; key = loai; const c = canh[key] = canh[key] || { lan:0, bam:0, chu:0, buoi:{}, lam:0 }; c.lan++; c.chu += tu(hien(w, '#stage')); c.buoi[nhom] = (c.buoi[nhom] || 0) + 1; if (w.eval('isWorkday()')) c.lam++; }
      const c = canh[key], b0 = buoi[nhom] = buoi[nhom] || { bam:0, chu:0 };
      const nhan = () => { c.bam++; b0.bam++; };
      const nw = d.querySelector('#nextWeek'); if (nw) { nhan(); nw.click(); continue; }
      const ts = d.querySelector('#tSkip'); if (ts) { nhan(); ts.click(); continue; }
      const nx = d.querySelector('#next'); if (nx) { c.chu += tu(hien(w, '#stage .result .st')); nhan(); nx.click(); continue; }
      const ch = [...d.querySelectorAll('#stage .choice')].filter(x => !x.disabled && !x.closest('[hidden]') && !/^\s*\S*\s*(Tua |Qua nhanh)/.test(x.textContent));
      if (!ch.length) { console.log('kẹt', loai); break; }
      const j = w.eval('S.cur && current && TC_LAP[S.cur.id] ? tcChonNep(S.cur, current) : S.cur && current && ' + NEP_BOT + '.includes(S.cur.id) ? (() => { S.fast = { from:S.day, until:S.day }; const k = autoPick(S.cur, current); S.fast = null; return k; })() : -1');
      let x = j >= 0 ? ch.find(y => +y.dataset.i === j) : null;
      if (!x && S.cur && VIEC_BOT.test(S.cur.id)) x = ch[0];
      if (!x) { const k = `${S.day}|${S.slot}|${S.cur && S.cur.id}`; lan[k] = (lan[k] || 0) + 1; x = ch[bam(k + '|' + lan[k]) % ch.length]; }
      nhan(); x.click();
    }
    // chữ của màn hình theo buổi: cộng lại từ bảng cảnh không tách được, nên ghi riêng số lần bấm theo buổi
    van++; w.close(); await new Promise(r => setTimeout(r, 0));
  }
  const L = Object.entries(canh).map(([id, c]) => ({ id, lan:+(c.lan / van).toFixed(1), bam:+(c.bam / van).toFixed(1), chu:Math.round(c.chu / van), lamViec:Math.round(c.lam / c.lan * 100), buoi:Object.entries(c.buoi).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / c.lan * 100)}%`).join(', ') }))
    .sort((a, b) => b.bam - a.bam);
  const tongBam = L.reduce((n, x) => n + x.bam, 0), tongChu = L.reduce((n, x) => n + x.chu, 0);
  console.log(`Trung bình mỗi ván (${van} ván): ${Math.round(tongBam)} lần bấm, ${tongChu} từ\n`);
  console.log('| Cảnh | Lần/ván | Bấm/ván | Từ/ván | % ở ngày làm việc | Buổi |'); console.log('|---|---|---|---|---|---|');
  L.slice(0, 30).forEach(x => console.log(`| ${x.id} | ${x.lan} | ${x.bam} | ${x.chu} | ${x.lamViec}% | ${x.buoi} |`));
  console.log('\nLần bấm theo buổi (trung bình mỗi ván):'); Object.entries(buoi).forEach(([k, v]) => console.log(`- ${k}: ${Math.round(v.bam / van)}`));
  const KQ = path.join(__dirname, 'ket-qua'); fs.mkdirSync(KQ, { recursive:true });
  fs.writeFileSync(path.join(KQ, 'khao-sat-tu-chay.json'), JSON.stringify({ van, tongBam, tongChu, canh:L, buoi }, null, 1));
})();
