/* =========================================================
   v17.6 – PHASE 2: NỀN TẢNG PHÁT TRIỂN (số liệu ở du-lieu/phat-trien.js)
   Trạng thái lưu gọn trong S.pt (bản lưu cũ chưa có thì tự tạo, kỹ năng gốc lấy từ Chuyên môn và Kỹ năng mềm):
     kn: điểm kinh nghiệm từng kỹ năng · ngay: { d, kn:{điểm đã tăng hôm nay}, lan:{nguồn đã tính hôm nay} }
     cap: cấp bậc hiện tại (null khi chưa đi làm) · capNgay: ngày lên cấp · mt: danh sách mục tiêu · dem: bộ đếm (hoạt động xã hội…)
   Nối vào game ở ba chỗ, không thêm vòng lặp:
     - sau mỗi lựa chọn (settleChoice): tính kinh nghiệm theo bảng KN_NGUON;
     - đầu mỗi buổi (buildSlot): gợi ý mục tiêu, cập nhật tiến độ, xét lên cấp (chiều thứ Sáu, trước giờ tan làm);
     - hồ sơ (mo-dau-ho-so.js gọi ptHTML): mục tiêu, cấp bậc, kỹ năng nghề.
   Không đổi lương, tài chính, năng lượng, sức khỏe, chỉ số cũ.
   Thứ tự nạp: file này bọc settleChoice của giao-dien/man-choi.js nên phải nạp SAU man-choi.js (trên trình duyệt từng file chạy riêng).
   ========================================================= */
function ptAll(){
  if (S.pt) return S.pt;
  const kn = Object.fromEntries(Object.keys(KY_NANG).map(k => [k, 0]));
  kn.lap_trinh = Math.round((S.tech || 0) * PT.GOC); kn.giao_tiep = Math.round((S.soft || 0) * PT.GOC);
  return (S.pt = { kn, ngay:{ d:0, kn:{}, lan:{} }, cap:S.job && S.day >= S.job.start ? 'junior' : null, capNgay:0, mt:[], dem:{ xa_hoi:0 }, tien0:S.money });
}
const ptOn = () => typeof PT !== 'undefined' && PT.ON && !!S;
const ptXp = k => ptAll().kn[k] || 0;
const ptMuc = k => { const x = ptXp(k); let m = 0; PT.MUC.forEach((v, i) => { if (x >= v) m = i; }); return m + 1; };          // mức 1..6
const ptTenMuc = k => PT.TEN_MUC[ptMuc(k) - 1];
const mtGet = id => ptAll().mt.find(m => m.id === id);
const mtSo = id => { const m = mtGet(id); return (m && m.so) || (MUC_TIEU[id].so ? MUC_TIEU[id].so() : 1); };
const mtKn = () => { const m = mtGet('hoc_ky_nang'); return (m && m.kn) || ptYeuNhat(); };
const ptYeuNhat = () => ['lap_trinh', 'giao_tiep', 'giai_quyet'].reduce((a, b) => ptXp(b) < ptXp(a) ? b : a);

/* ----- Kinh nghiệm sau mỗi lựa chọn ----- */
function ptSnap(){ if (!ptOn()) return null; const st = S.stat || {}; return { tech:S.tech, soft:S.soft, perf:S.perf, tasks:st.tasks || 0, bugsFixed:st.bugsFixed || 0, study:st.study || 0, ot:st.ot || 0, rel:Object.values(S.rel).reduce((a, b) => a + b, 0) }; }
function ptNote(ref, ch, s0){
  if (!ptOn() || !ref || !ch || !s0) return null;
  const s1 = ptSnap(), d = Object.fromEntries(Object.keys(s0).map(k => [k, s1[k] - s0[k]]));
  const G = ptAll(), N = G.ngay.d === S.day ? G.ngay : (G.ngay = { d:S.day, kn:{}, lan:{} }), gain = {};
  for (const r of KN_NGUON) {
    let ok = false; try { ok = r.khi(ref, ch, d); } catch (e) { ok = false; }
    if (!ok) continue;
    const lap = N.lan[r.id] || 0, f = lap ? PT.LAP_LAI : 1; N.lan[r.id] = lap + 1;            // lặp lại trong ngày: ít điểm hơn
    for (const [k, v] of Object.entries(r.kn(d))) if (v > 0) gain[k] = (gain[k] || 0) + v * f;
  }
  for (const [k, v] of Object.entries(gain)) {
    const con = Math.max(0, PT.TRAN_NGAY - (N.kn[k] || 0)), x = Math.round(Math.min(con, v) * 10) / 10; if (x <= 0) continue;
    const m0 = ptMuc(k); G.kn[k] = Math.round((G.kn[k] + x) * 10) / 10; N.kn[k] = (N.kn[k] || 0) + x;
    if (ptMuc(k) > m0) note(`${KY_NANG[k].icon} ${KY_NANG[k].ten} lên mức ${ptTenMuc(k)}.`);
  }
  if (XA_HOI(ref, ch)) G.dem.xa_hoi = (G.dem.xa_hoi || 0) + 1;
  return gain;
}

/* ----- Cấp bậc ----- */
const ptCapIdx = () => CAP_BAC.findIndex(c => c.id === ptAll().cap);
const ptCapSau = () => { const i = ptCapIdx(); return i >= 0 ? CAP_BAC[i + 1] : null; };
// Kiểm tra từng điều kiện của cấp sau: [{ ten, dat, hien }]
function ptDieuKien(cap = ptCapSau()){
  if (!cap || !cap.can) return [];
  const c = cap.can, st = S.stat || {}, diem = typeof workScore === 'function' ? workScore(S.perf, st.workDays || 0, st.lateWork || 0) : 0;
  return [
    ...Object.entries(c.kn).map(([k, m]) => ({ ten:`${KY_NANG[k].icon} ${KY_NANG[k].ten} mức ${PT.TEN_MUC[m - 1]}`, dat:ptMuc(k) >= m, hien:ptTenMuc(k), tl:Math.min(1, ptXp(k) / PT.MUC[m - 1] || 0) })),
    { ten:`🗓️ ${c.ngayCong} ngày công`, dat:(st.workDays || 0) >= c.ngayCong, hien:st.workDays || 0, tl:Math.min(1, (st.workDays || 0) / c.ngayCong) },
    { ten:`✅ ${c.task} task đã làm`, dat:(st.tasks || 0) >= c.task, hien:st.tasks || 0, tl:Math.min(1, (st.tasks || 0) / c.task) },
    { ten:`📊 Điểm làm việc trung bình từ ${c.diem}`, dat:diem >= c.diem, hien:Math.round(diem * 10) / 10, tl:Math.max(0, Math.min(1, diem / c.diem)) },
    ...(c.nhanXet ? [{ ten:'🧭 Đã có nhận xét của trưởng nhóm, không bị nhắc nhở', dat:!!S.flags.review && S.flags.review !== 'warn', hien:{ good:'Tốt', ok:'Ổn', warn:'Bị nhắc nhở' }[S.flags.review] || 'chưa có', tl:S.flags.review && S.flags.review !== 'warn' ? 1 : 0 }] : []),
  ];
}
const ptCapTienDo = () => { if (!S.job) return 0; const i = CAP_BAC.findIndex(c => c.id === PT.CAP_TOI_DA); if (ptCapIdx() >= i) return 1; const L = ptDieuKien(CAP_BAC[i]); return L.length ? L.reduce((a, x) => a + x.tl, 0) / L.length * .99 : 0; };
const ptDuLen = () => { const n = ptCapSau(); if (!n || CAP_BAC.indexOf(n) > CAP_BAC.findIndex(c => c.id === PT.CAP_TOI_DA)) return false; const L = ptDieuKien(n); return L.length > 0 && L.every(x => x.dat); };
SC.thang_cap = () => {
  const n = ptCapSau();
  return { icon:'📈', title:`Lên ${n.ten}`, npc:'boss', bg:'office',
    html:P('Cuối giờ chiều thứ Sáu, chị Hạnh gọi bạn vào phòng họp nhỏ.', PT_LOI.len(n.ten), '<span class="tip">Từ giờ bạn sẽ được giao việc khó hơn. Lương được xem lại ở kỳ đánh giá sau, chưa đổi ngay.</span>'),
    choices:[
      { icon:'🙏', label:'Cảm ơn chị, em sẽ cố gắng', fx:() => { ptLen(n); return { text:'Bạn bước ra khỏi phòng họp. Phong đã đứng chờ sẵn với cốc trà sữa: “Phải khao đấy nhé!”', npcExpr:'happy' }; } },
      { icon:'🧭', label:'Hỏi chị cần làm gì để lên cấp tiếp theo', fx:() => { ptLen(n); return { text:'Chị Hạnh cười: “Kèm được người mới, và tự lo trọn một phần dự án. Từ từ thôi em.”', npcExpr:'happy' }; } },
    ] };
};
function ptLen(n){ const G = ptAll(); G.cap = n.id; G.capNgay = S.day; memo(`Lên ${n.ten}`); note(`📈 Bạn là ${n.ten} từ hôm nay.`); }

/* ----- Mục tiêu ----- */
// Gợi ý theo hoàn cảnh: mục tiêu có điểm cao nhất (bỏ cái đã có)
function ptGoiY(n = PT.GOI_Y_SO){
  const co = new Set(ptAll().mt.map(m => m.id));
  return Object.entries(MUC_TIEU).map(([id, M]) => [id, M.goiY()]).filter(([id, v]) => v > 0 && !co.has(id)).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => id);
}
function mtThem(id, tt = 'goi_y'){
  const G = ptAll(); if (mtGet(id)) return mtGet(id);
  const M = MUC_TIEU[id], m = { id, tt, bd:S.day, td:0 };
  if (M.so) m.so = M.loai === 'tien' ? Math.round(M.so() / 1e5) * 1e5 : M.so();          // số tiền làm tròn trăm nghìn
  if (id === 'hoc_ky_nang') m.kn = ptYeuNhat();
  G.mt.push(m); return m;
}
SC.muc_tieu = () => {
  const T = ptAll(); if (!T.goiY) { T.goiY = ptGoiY(); T.goiY.forEach(id => mtThem(id)); }           // gợi ý một lần (cảnh có thể được dựng lại nhiều lần)
  const ids = T.goiY;
  return { icon:'🎯', title:'Mục tiêu hai tháng tới', html:P(PT_LOI.goiY, ...ids.map(id => `${MUC_TIEU[id].icon} <b>${MUC_TIEU[id].ten()}</b>. ${MUC_TIEU[id].ly}`), '<span class="tip">Xem tiến độ trong Hồ sơ.</span>'),
    choices:[
      ...ids.map(id => ({ icon:MUC_TIEU[id].icon, label:`Ưu tiên: ${MUC_TIEU[id].ten()}`, fx:() => { ids.forEach(x => { mtGet(x).tt = 'dang_lam'; }); mtGet(id).chinh = true; return 'Bạn ghi mục tiêu lên tờ giấy nhớ, dán cạnh màn hình.'; } })),
      { icon:'🗒️', label:'Theo đuổi cả ba, không ưu tiên cái nào', fx:() => { ids.forEach(x => { mtGet(x).tt = 'dang_lam'; }); return 'Ba tờ giấy nhớ, ba màu. Trông rất có tổ chức.'; } },
      { icon:'🤷', label:'Để sau, chưa nghĩ đến', fx:() => 'Bạn gấp tờ giấy lại. Các gợi ý vẫn nằm trong Hồ sơ nếu bạn đổi ý.' },
    ] };
};
// Cập nhật tiến độ; mục tiêu đang theo đuổi đạt 100% thì hoàn thành (ghi nhật ký); hết game thì mục tiêu ngắn hạn chưa xong là hết hạn
function ptCapNhat(){
  const G = ptAll();
  for (const m of G.mt) {
    if (m.tt === 'xong' || m.tt === 'bo' || m.tt === 'het_han') continue;
    let v = 0; try { v = MUC_TIEU[m.id].tienDo(); } catch (e) { v = 0; }
    m.td = Math.max(0, Math.min(1, Math.round(v * 1000) / 1000));
    if (m.td >= 1 && m.tt === 'dang_lam') { m.tt = 'xong'; m.xong = S.day; memo(PT_LOI.xong(MUC_TIEU[m.id].ten())); note(`🎯 ${PT_LOI.xong(MUC_TIEU[m.id].ten())}`);
      const mo = MUC_TIEU[m.id].moRa; if (mo && !mtGet(mo)) mtThem(mo, 'dang_lam'); }                // có việc rồi thì mục tiêu tiếp theo là lên Middle
    else if (m.td >= 1 && m.tt === 'goi_y') m.tt = 'xong', m.xong = S.day;
  }
  if (S.day >= LAST_DAY) G.mt.forEach(m => { if ((m.tt === 'dang_lam' || m.tt === 'goi_y') && !MUC_TIEU[m.id].daiHan) m.tt = 'het_han'; });
}
function ptSlot(){
  if (!ptOn()) return;
  const G = ptAll(); if (S.job && S.day >= S.job.start && !G.cap) G.cap = 'junior';
  ptCapNhat();
  if (S.fast) return;
  if (S.slot === 'evening' && S.day === PT.GOI_Y_NGAY && !S.once.mucTieu && Array.isArray(S.queue)) {          // tối ngày 2: gợi ý mục tiêu (trước giờ rảnh)
    S.once.mucTieu = true; const i = S.queue.findIndex(r => r.id === 'activity'); S.queue.splice(i < 0 ? S.queue.length : i, 0, { id:'muc_tieu' });
  }
  if (S.slot === 'afternoon' && isWorkday() && dayInfo().wd === 5 && ptDuLen() && Array.isArray(S.queue)) {   // chiều thứ Sáu, đủ điều kiện: lên cấp (trước giờ tan làm)
    const i = S.queue.findIndex(r => r.id === 'endwork'); if (i >= 0 && !S.queue.some(r => r.id === 'thang_cap')) S.queue.splice(i, 0, { id:'thang_cap' });
  }
}

/* ----- Hồ sơ: phần Phát triển ----- */
function ptHTML(){
  if (!ptOn()) return '';
  const G = ptAll(), bar = (v, cls = '') => `<div class="bar"><i class="${cls}" style="width:${Math.round(v * 100)}%"></i></div>`;
  const kn = Object.entries(KY_NANG).map(([k, K]) => { const m = ptMuc(k), a = PT.MUC[m - 1], b = PT.MUC[m]; const tl = b ? (ptXp(k) - a) / (b - a) : 1;
    return `<div style="margin-top:8px"><div class="bar-l"><span>${K.icon} ${K.ten}</span><b>${PT.TEN_MUC[m - 1]}</b></div>${bar(tl)}<small style="color:var(--muted)">${K.mo}</small></div>`; }).join('');
  const cap = CAP_BAC.find(c => c.id === G.cap), sau = ptCapSau(), toiDa = CAP_BAC.findIndex(c => c.id === PT.CAP_TOI_DA);
  const dk = sau && CAP_BAC.indexOf(sau) <= toiDa ? ptDieuKien(sau) : [];
  const capHTML = !S.job ? '<p class="tip">Chưa đi làm.</p>' : `<div class="kv"><span>Hiện tại</span><span><b>${cap ? cap.ten : 'Junior Developer'}</b>${G.capNgay ? ` (từ ngày ${fmtD(G.capNgay)})` : ''}</span></div>
    ${dk.length ? `<p style="margin:8px 0 4px">Để lên <b>${sau.ten}</b>:</p>${dk.map(x => `<div class="pt-dk${x.dat ? ' ok' : ''}">${x.dat ? '✔' : '○'} ${x.ten} <small>(${x.hien})</small></div>`).join('')}`
      : '<p class="tip">Các cấp tiếp theo (Senior, Team Leader, Manager) cần nhiều năm kinh nghiệm.</p>'}`;
  const TT = { goi_y:'Gợi ý', dang_lam:'Đang theo đuổi', xong:'Đã xong', bo:'Đã bỏ', het_han:'Hết hạn' };
  const mt = G.mt.length ? G.mt.map(m => { const M = MUC_TIEU[m.id];
    return `<div style="margin-top:8px"><div class="bar-l"><span>${M.icon} ${M.ten()}${m.chinh ? ' ⭐' : ''}</span><b>${TT[m.tt]} · ${Math.round(m.td * 100)}%</b></div>${bar(m.td, m.tt === 'xong' ? '' : 'mid')}${M.daiHan ? '<small style="color:var(--muted)">Mục tiêu nhiều năm</small>' : ''}</div>`; }).join('')
    : `<p class="tip">Tối ngày ${PT.GOI_Y_NGAY} game sẽ gợi ý mục tiêu theo hoàn cảnh của bạn.</p>`;
  return `<h3>Mục tiêu</h3>${mt}<h3>Cấp bậc</h3>${capHTML}<h3>Kỹ năng nghề</h3>${kn}`;
}

/* ----- Nối vào game ----- */
(() => {
  const slot = buildSlot; buildSlot = function(){ slot(); ptSlot(); };
  const settle = settleChoice;
  settleChoice = function(ch){ const s0 = ptSnap(), ref = S && S.cur; const r = settle(ch); if (r) ptNote(r.ref || ref, ch, s0); return r; };
})();
// Dành cho kiểm thử
const PT_DEBUG = () => ({ kn:Object.fromEntries(Object.keys(KY_NANG).map(k => [k, [ptXp(k), ptTenMuc(k)]])), cap:ptAll().cap, mt:ptAll().mt.map(m => [m.id, m.tt, m.td]), du:ptDuLen() });
