// Audit v17.7: ĐẾM CHỮ người chơi phải đọc (không phải bài đạt/không đạt).
// Bot chơi bằng nút bấm (jsdom), gắn vào lúc game hiển thị để đếm đúng chữ hiện trên màn hình:
//   mo_ta (tiêu đề + đoạn mô tả cảnh), loi_thoai (các câu nói nối tiếp trong cảnh), lua_chon (chữ trên nút lựa chọn),
//   ket_qua (đoạn kết quả sau khi chọn), tin_nhan (tin nhắn điện thoại người khác gửi), nhat_ky (nhật ký cuối ngày, báo cáo tháng),
//   tong_ket (tổng kết tuần), huong_dan (mẹo, gợi ý hiện kèm).
// "Từ" = một tiếng (cách nhau bởi khoảng trắng), bỏ biểu tượng cảm xúc đứng riêng.
// Dùng: node dem-chu.js 6   → 6 ván, in bảng; ghi ket-qua/dem-chu.json (dùng để so sánh trước/sau)
const path = require('path'), fs = require('fs');
const { JSDOM } = require(path.join(__dirname, '..', 'node_modules', 'jsdom'));
const N = +process.argv[2] || 6;
const html = require('../nap-game')();
const tu = s => (String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’.,:;!?…“”"()%/+-]*/gu) || []).length;
const LOAI = ['mo_ta', 'loi_thoai', 'lua_chon', 'ket_qua', 'tin_nhan', 'nhat_ky', 'tong_ket', 'huong_dan'];
const tong = { ngay1:{}, tuan1:{}, ca:{} }, canh = {}, theoNgay = {};
for (let v = 0; v < N; v++) {
  let s = 700 + v * 31; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.org/',
    beforeParse(w){ w.matchMedia = () => ({ matches:true }); w.scrollTo = () => {}; w.HTMLElement.prototype.focus = function(){}; w.Math.random = rnd; } });
  const w = dom.window, d = w.document;
  const cong = (loai, so, id) => {
    if (!so) return; const day = w.eval('S ? S.day : 0');
    for (const [k, ok] of [['ca', true], ['ngay1', day <= 1], ['tuan1', day <= 7]]) if (ok) tong[k][loai] = (tong[k][loai] || 0) + so;
    theoNgay[day] = (theoNgay[day] || 0) + so;
    if (id) { const c = canh[id] || (canh[id] = { lan:0, tu:0, loai:{} }); c.tu += so; c.loai[loai] = (c.loai[loai] || 0) + so; }
  };
  w.__cong = cong; w.__tu = tu;
  d.querySelector('#fresh').click(); d.querySelectorAll('.bgopt[data-f]')[v % 3].click(); d.querySelectorAll('.bgopt[data-b]')[v % 3].click(); d.querySelector('#go').click();
  // Gắn đếm: mỗi lần một cảnh hiện ra; mỗi lần có kết quả; mỗi tin nhắn đến; mỗi lần tổng kết tuần
  w.eval(`S.opt.roam = false;
    const _r = renderScene; renderScene = function(){ _r(); const ref = S.cur; if (!ref) return; const id = ref.id === 'ev' ? 'ev:' + ref.arg : ref.id;
      const st = document.querySelector('#stage').cloneNode(true);
      st.querySelectorAll('details:not([open])').forEach(dt => [...dt.children].forEach(c => { if (c.tagName !== 'SUMMARY') c.remove(); })); /* phần thu gọn: chỉ thấy dòng tiêu đề */
      st.querySelectorAll('[hidden]').forEach(e => { if (e.id !== 'rest') e.remove(); });
      const T = q => { const L = [...st.querySelectorAll(q)]; return L.filter(e => !L.some(o => o !== e && o.contains(e))).map(e => e.textContent).join(' '); }; /* không đếm hai lần phần lồng nhau */
      if (current.kind === 'journal') { __cong('nhat_ky', __tu(T('article.journal')), id); }
      else { __cong('huong_dan', __tu(T('.tip, .cause')), id); st.querySelectorAll('.st .tip, .st .cause').forEach(e => e.remove()); /* mẹo nằm trong đoạn mô tả: tính vào hướng dẫn, không tính hai lần */ __cong('mo_ta', __tu(T('h2') + ' ' + T('.st')), id); __cong('loi_thoai', __tu((current.talk || []).map(x => x.t).join(' ')), id); }
      __cong('lua_chon', __tu(T('.choice, .tile')), id); (window.__lan = window.__lan || {})[id] = 1; };
    const _s = settleChoice; settleChoice = function(ch){ const id = S.cur ? (S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id) : '?'; const r = _s(ch); if (r && r.out && r.out.text && !r.out.go) __cong('ket_qua', __tu(r.out.text), id); return r; };
    const _p = pushMsg; pushMsg = function(th, who, t){ if (who !== 'me') __cong('tin_nhan', __tu(t), 'tin:' + th); return _p(th, who, t); };
    const _w = renderWeek; renderWeek = function(){ _w(); __cong('tong_ket', __tu(document.querySelector('#stage').textContent), 'tong_ket_tuan'); };`);
  let last = null;
  for (let i = 0; i < 9000; i++) {
    if (d.querySelector('#again')) break;
    const S = w.eval('S'); if (S && S.cur && S.cur !== last) { last = S.cur; const id = S.cur.id === 'ev' ? 'ev:' + S.cur.arg : S.cur.id; (canh[id] || (canh[id] = { lan:0, tu:0, loai:{} })).lan++; }
    const nw = d.querySelector('#nextWeek'); if (nw) { nw.click(); continue; }
    const ts = d.querySelector('#tSkip'); if (ts) { ts.click(); continue; }
    const nx = d.querySelector('#next'); if (nx) { nx.click(); continue; }
    const ch = [...d.querySelectorAll('#stage .choice')].filter(b => !b.disabled && !b.closest('[hidden]'));
    if (!ch.length) break;
    ch[Math.floor(rnd() * ch.length)].click();
  }
  w.close();
}
const tb = o => Object.fromEntries(LOAI.map(k => [k, Math.round((o[k] || 0) / N)]));
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
const ds = Object.entries(canh).map(([id, c]) => ({ id, lan:+(c.lan / N).toFixed(1), tuMoiLan:Math.round(c.tu / Math.max(1, c.lan)), tuMoiVan:Math.round(c.tu / N), loai:c.loai }));
const out = {
  soVan:N, ghiChu:'Số từ trung bình mỗi ván. Chế độ bấm thẻ (tắt đi lại tự do); bot bấm ngẫu nhiên, đọc mọi lời thoại.',
  ngay1:{ tong:Math.round(sum(tong.ngay1) / N), ...tb(tong.ngay1) }, tuan1:{ tong:Math.round(sum(tong.tuan1) / N), ...tb(tong.tuan1) }, ca56:{ tong:Math.round(sum(tong.ca) / N), ...tb(tong.ca) },
  tuMoiNgay:Object.fromEntries(Object.entries(theoNgay).map(([d, n]) => [d, Math.round(n / N)])),
  daiNhat:ds.filter(x => !x.id.startsWith('tin:')).sort((a, b) => b.tuMoiLan - a.tuMoiLan).slice(0, 30),
  gapNhieuNhat:ds.filter(x => !x.id.startsWith('tin:')).sort((a, b) => b.lan - a.lan).slice(0, 30),
  tonChuNhat:ds.sort((a, b) => b.tuMoiVan - a.tuMoiVan).slice(0, 30),
};
fs.mkdirSync(path.join(__dirname, 'ket-qua'), { recursive:true }); fs.writeFileSync(path.join(__dirname, 'ket-qua', 'dem-chu.json'), JSON.stringify(out, null, 1));
console.log('Ngày 1:', JSON.stringify(out.ngay1)); console.log('Tuần 1:', JSON.stringify(out.tuan1)); console.log('56 ngày:', JSON.stringify(out.ca56));
console.log('\nTốn chữ nhất (từ mỗi ván):'); out.tonChuNhat.slice(0, 15).forEach(x => console.log(`  ${x.id.padEnd(22)} ${String(x.tuMoiVan).padStart(5)} từ/ván  ${String(x.lan).padStart(5)} lần/ván  ${String(x.tuMoiLan).padStart(4)} từ/lần`));
