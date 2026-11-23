/* =========================================================
   v17.7 – PHASE 2: ĐỌC NHANH (số liệu, câu chữ ở du-lieu/doc-nhanh.js)
   Bật mặc định. Là tùy chọn hiển thị chung của máy (như âm thanh), lưu trong localStorage, không nằm trong bản lưu.
   Làm gì khi bật:
     1. Cảnh (buildScene): cảnh tốn chữ nhất dùng bản ngắn (DN_CANH); cảnh khác rút gọn theo quy tắc chung:
        mô tả tối đa DN.MO_TA từ (phần còn lại vào "Xem thêm"), bỏ dòng mô tả phụ dưới mỗi lựa chọn, tối đa DN.GOI_Y thẻ gợi ý,
        kết quả sau lựa chọn chỉ giữ câu đầu. Không đổi thứ tự, hiệu ứng hay điều kiện của lựa chọn nào.
     2. Thuật ngữ: đổi chữ hiện ra theo DN_THUAT_NGU (không đổi chữ trong khung code, không đổi mã nội bộ):
        ngay từ nguồn (nhãn lựa chọn, kết quả, lời thoại, nhãn việc ở từng nơi trong thế giới đi lại), và trên khối vừa vẽ
        (cảnh, điện thoại, hồ sơ, tổng kết tuần). Gọi thẳng ở các chỗ đó, không dùng MutationObserver
        (trong jsdom, bản ghi thay đổi dồn lại khi bấm liên tục và làm hết bộ nhớ).
     3. Tổng kết tuần: chỉ hiện phần tóm tắt; các mục chi tiết thu vào từng "Xem thêm".
     4. Bố cục điện thoại (lớp .doc-nhanh trên body, xem css/giao-dien.css): thu gọn khung tranh, danh sách việc đã làm để nút hiện ngay màn đầu.
   Thứ tự nạp: bọc buildScene (loi/nep-sinh-hoat.js) và renderWeek (giao-dien/tong-ket-tuan.js), nên nạp SAU hai file đó.
   ========================================================= */
const DN_KHOA = 'lcs-doc-nhanh';
function dnOn(){
  if (typeof DN === 'undefined' || !DN.ON) return false;
  if (dnOn.nho !== undefined) return dnOn.nho;
  try { dnOn.nho = localStorage.getItem(DN_KHOA) !== '0'; } catch (e) { dnOn.nho = true; }   // không đọc được bộ nhớ trình duyệt: mặc định bật
  return dnOn.nho;
}
function dnDat(on){
  dnOn.nho = !!on;
  try { localStorage.setItem(DN_KHOA, on ? '1' : '0'); } catch (e) {}
  dnLop();
}
const dnLop = () => { if (document.body) document.body.classList.toggle('doc-nhanh', dnOn()); };
const dnTu = s => (String(s || '').replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length;

// Tách câu, không cắt giữa ngoặc kép “…” hay ngoặc đơn (…)
function dnCau(text){
  const t = String(text || '').trim(), out = []; let sau = 0, mo = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '“' || c === '(') mo++; else if ((c === '”' || c === ')') && mo > 0) mo--;
    else if (/[.!?…]/.test(c) && !mo && (i === t.length - 1 || /\s/.test(t[i + 1])) && !/\d/.test(t[i + 1] || '')) { out.push(t.slice(sau, i + 1).trim()); sau = i + 1; }
  }
  if (sau < t.length && t.slice(sau).trim()) out.push(t.slice(sau).trim());
  return out;
}
// Sửa một đoạn HTML bằng DOM (không động vào chuỗi gốc)
function dnSua(html, fn){ const tp = document.createElement('template'); tp.innerHTML = html || ''; fn(tp.content); const d = document.createElement('div'); d.appendChild(tp.content); return d.innerHTML; }
const dnThem = nodes => { const d = document.createElement('details'); d.className = 'dn-them'; const s = document.createElement('summary'); s.textContent = 'Xem thêm'; d.appendChild(s); nodes.forEach(n => d.appendChild(n)); return d; };

// Quy tắc chung cho mô tả: giữ các đoạn <p> trong ngân sách; đoạn quá dài chỉ giữ câu đầu; phần còn lại vào "Xem thêm".
// Các khối khác (thẻ việc, bảng tiền, chip…) giữ nguyên vì là thông tin chính.
function dnMoTa(html){
  if (!html || dnTu(html) <= DN.MO_TA) return html;
  return dnSua(html, root => {
    const ps = [...root.children].filter(e => e.tagName === 'P'), bot = []; let dem = 0;
    ps.forEach((p, i) => {
      const w = dnTu(p.textContent);
      if (i === 0 || dem + w <= DN.MO_TA) {
        // đoạn dài chỉ có chữ thường, đậm, nghiêng: giữ câu đầu (mất định dạng); đoạn có thành phần khác thì để nguyên
        if (w > DN.CAU_DAI && ![...p.querySelectorAll('*')].some(e => !/^(B|I|EM|STRONG|SPAN)$/.test(e.tagName))) { const c = dnCau(p.textContent); if (c.length > 1) { const sau = document.createElement('p'); sau.textContent = c.slice(1).join(' '); p.textContent = c[0]; bot.push(sau); } }
        dem += dnTu(p.textContent);
      } else bot.push(p);
    });
    if (bot.length) { const d = dnThem([]); (ps.length ? ps[ps.length - 1] : root.lastChild).after(d); bot.forEach(n => d.appendChild(n)); }
  });
}
// Kết quả sau lựa chọn: giữ câu đầu (câu đầu quá ngắn thì thêm một câu). Kết quả có HTML thì giữ nguyên.
function dnKetQua(t){
  if (typeof t !== 'string' || /</.test(t)) return t;
  const c = dnCau(t); if (c.length <= DN.KET_QUA) return t;
  let n = DN.KET_QUA; if (dnTu(c[0]) < DN.CAU_NGAN && c[1]) n++;
  return c.slice(0, n).join(' ');
}
// Nhãn lựa chọn quá dài: giữ câu đầu. Lời nói trong ngoặc kép “…” thì lấy câu đầu bên trong và giữ ngoặc.
function dnNhan(t){
  if (typeof t !== 'string' || dnTu(t) <= DN.NHAN || /</.test(t)) return t;
  const phay = s => s.includes(',') ? s.slice(0, s.indexOf(',')).trim() + '.' : s;      // một câu mà vẫn dài: cắt ở dấu phẩy đầu
  const m = t.match(/^“([\s\S]*)”$/);
  if (m) { const c = dnCau(m[1]); const x = c.length > 1 ? c[0] : c[0] || m[1]; return `“${dnTu(x) > DN.NHAN ? phay(x) : x}”`; }
  const c = dnCau(t), x = c.length > 1 ? c[0] : t; return dnTu(x) > DN.NHAN ? phay(x) : x;
}
function dnRutGon(ref, sc){
  if (!sc || !ref) return sc;
  const id = ref.id === 'ev' ? 'ev:' + ref.arg : ref.id;
  const rieng = DN_CANH[id] ? DN_CANH[id](sc, ref) || {} : null;
  if (rieng) Object.assign(sc, rieng); else if (sc.kind !== 'journal' && sc.kind !== 'phone') sc.html = dnMoTa(sc.html);
  if (sc.title) sc.title = dnChu(sc.title);
  if (Array.isArray(sc.talk)) sc.talk = sc.talk.map(x => x && typeof x.t === 'string' ? { ...x, t:dnChu(x.t) } : x);
  if (Array.isArray(sc.choices)) sc.choices = sc.choices.map(c => {
    const n = { ...c, desc:undefined, label:dnChu(dnNhan(c.label)), short:dnChu(c.short) };
    if (Array.isArray(c.hints)) { let k = 0; n.hints = c.hints.filter(h => STAT_HINT.test(h) || k++ < DN.GOI_Y); }   // thẻ chỉ số vẫn theo cài đặt cũ; thẻ khác tối đa DN.GOI_Y
    if (typeof c.fx === 'function') n.fx = (...a) => { const o = c.fx(...a); if (typeof o === 'string') return dnChu(dnKetQua(o)); if (o && typeof o === 'object' && typeof o.text === 'string') return { ...o, text:dnChu(dnKetQua(o.text)) }; return o; };
    return n;
  });
  return sc;
}

/* ----- Thuật ngữ ----- */
const dnChu = t => { if (typeof t !== 'string' || !dnOn() || !/[A-Za-z#]/.test(t)) return t; for (const [re, to] of DN_THUAT_NGU) t = t.replace(re, to); return t; };
const DN_BO_QUA = new Set(['CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE']);
function dnThuatNgu(root){
  if (!dnOn() || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode:n => { for (let e = n.parentNode; e && e !== root.parentNode; e = e.parentNode) if (DN_BO_QUA.has(e.nodeName)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  const L = []; while (w.nextNode()) L.push(w.currentNode);
  for (const t of L) { let v = t.nodeValue; if (!/[A-Za-z#]/.test(v)) continue; const v0 = v; for (const [re, to] of DN_THUAT_NGU) v = v.replace(re, to); if (v !== v0) t.nodeValue = v; }
}
// Dòng "vì sao xảy ra" dưới nhãn sự kiện: chỉ giữ câu đầu
function dnLyDo(){ document.querySelectorAll('#stage .cause').forEach(e => { if (!e.children.length) e.textContent = dnCau(e.textContent)[0] || e.textContent; }); }

// Màn tạo nhân vật: bỏ hai đoạn giải thích chung; mô tả mỗi gia cảnh, nơi ở chỉ giữ câu đầu (thẻ số tiền, tiền nhà vẫn hiện)
function dnTaoNV(){
  if (!dnOn()) return;
  document.querySelectorAll('#stage .field > p.hint').forEach(e => e.remove());
  document.querySelectorAll('#stage .bgopt .cd').forEach(e => { e.textContent = dnCau(e.textContent)[0] || e.textContent; });
}

/* ----- Tổng kết tuần: tóm tắt hiện sẵn, chi tiết thu gọn ----- */
function dnTongKet(){
  const a = document.querySelector('#stage article.report'); if (!a) return;
  const story = a.querySelector('.journal.story p');
  if (story) { const c = dnCau(story.textContent); if (c.length > 2) { const d = dnThem([Object.assign(document.createElement('p'), { textContent:c.slice(2).join(' ') })]); story.textContent = c.slice(0, 2).join(' '); story.parentNode.after(d); } }
  // mỗi mục <h3> và phần nội dung phía sau đến <h3> kế tiếp → một "Xem thêm" mang tên mục (trừ "Bản thân": chip chỉ số luôn hiện)
  [...a.querySelectorAll(':scope > h3')].forEach(h => {
    const ten = h.textContent, nd = []; let e = h.nextSibling;
    while (e && !(e.nodeType === 1 && (e.tagName === 'H3' || e.tagName === 'BUTTON'))) { nd.push(e); e = e.nextSibling; }
    if (ten === 'Bản thân') { nd.forEach(n => { if (n.nodeType === 1 && !n.classList.contains('chips')) n.remove(); }); return; }
    const d = dnThem(nd); d.querySelector('summary').textContent = ten; d.classList.add('dn-muc'); h.replaceWith(d);
  });
}

/* ----- Nối vào game ----- */
(() => {
  const dung = buildScene; buildScene = function(ref){ const sc = dung(ref); return dnOn() ? dnRutGon(ref, sc) : sc; };
  const tk = renderWeek; renderWeek = function(){ tk(); if (dnOn()) { dnTongKet(); dnThuatNgu($('#stage')); } };
  const rs = renderScene; renderScene = function(){ rs(); if (dnOn()) { dnLyDo(); dnThuatNgu($('#stage')); } };
  const ch = choose; choose = function(i){ const r = ch(i); dnThuatNgu($('#stage')); return r; };
  const st = showTalk; showTalk = function(f){ const r = st(f); dnThuatNgu($('#talk')); return r; };
  const pl = renderPhoneList; renderPhoneList = function(){ const r = pl(); dnThuatNgu($('#dlgBody')); return r; };
  const ot = openThread; openThread = function(...a){ const r = ot(...a); dnThuatNgu($('#dlgBody')); return r; };
  // Thế giới đi lại: nhãn việc ở từng nơi (đồ vật, người) đổi từ nguồn
  ROAM_PLACES.forEach(P => ['entries', 'npcEntries'].forEach(k => { const f = P[k]; if (typeof f !== 'function') return;
    P[k] = function(...a){ const L = f.apply(this, a); return Array.isArray(L) && dnOn() ? L.map(e => e && e.label ? { ...e, label:dnChu(e.label) } : e) : L; }; }));
  // Nút bật/tắt ở cuối màn hình chơi
  const nut = () => { const b = document.querySelector('#btnDoc'); if (b) { b.textContent = dnOn() ? '📖 Đọc nhanh: bật' : '📖 Đọc nhanh: tắt'; b.setAttribute('aria-pressed', String(dnOn())); } };
  const lap = () => {
    dnLop(); nut();
    const hs = document.querySelector('#btnProfile'); if (hs) hs.addEventListener('click', () => dnThuatNgu(document.querySelector('#dlgBody')));   // chạy sau khi Hồ sơ đã mở
    const dt = document.querySelector('#phoneFab'); if (dt) dt.addEventListener('click', () => dnThuatNgu(document.querySelector('#dlgBody')));
    const b = document.querySelector('#btnDoc'); if (b && !b.dataset.ok) { b.dataset.ok = '1'; b.addEventListener('click', () => { dnDat(!dnOn()); nut(); if (S && S.cur && S.phase === 'play') renderScene(); }); }
  };
  if (document.body) lap(); else document.addEventListener('DOMContentLoaded', lap);
})();
