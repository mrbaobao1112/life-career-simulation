/* =========================================================
   v18.0 – TỰ CHẠY BAN NGÀY (số liệu, câu chữ ở du-lieu/tu-chay.js)
   Ngày làm việc bình thường: những việc LẶP LẠI ban ngày (chuẩn bị ra khỏi nhà, phân cảnh đến công ty, họp đầu ngày,
   task buổi sáng và chiều theo cách quen tay, tan làm) tự qua theo nếp. Cuối ban ngày hiện một thẻ tóm tắt, chờ bấm "Tiếp".
   - Dùng ĐÚNG lựa chọn và đúng hàm áp dụng lựa chọn như khi người chơi tự bấm (settleChoice), chỉ bỏ màn hình kết quả.
     Không dùng chế độ tua nhanh cũ (S.fast): chế độ đó tắt sự kiện, tin nhắn, chuyện tự nảy sinh, tức là đổi luật chơi.
     Vì vậy bật hay tắt tự chạy, cùng hạt giống và cùng lựa chọn thì ra cùng kết quả.
   - Mọi cảnh khác (sự kiện, ngày đặc biệt, chuyện tự nảy sinh, tin nhắn, lương, tổng kết tháng, được nhờ OT, được rủ đi chơi…)
     vẫn hiện ra như cũ; tự chạy chạy tới đúng cảnh đó, dừng cho người chơi chọn, rồi chạy tiếp.
   - Luôn dừng (không tự chạy việc lặp lại) khi: lần đầu gặp việc đó; ngày đặc biệt ở công ty (cả ban ngày); năng lượng, sức khỏe, tinh thần thấp; tiền sắp không đủ;
     đi làm muộn hay còn mệt; có tin nhắn chưa trả lời; đồng nghiệp còn chuyện cũ muốn nhắc (TC_LY_DO).
   - Buổi tối, đêm, cuối tuần, ngày nghỉ: không bao giờ tự chạy.
   - Bật/tắt: tùy chọn chung của máy (như Đọc nhanh), lưu trong localStorage, mặc định bật. "Tự chọn hôm nay" chỉ cho ngày đó.
   ========================================================= */
const TC_KHOA = 'lcs-tu-chay';
function tcOn(){
  if (typeof TC === 'undefined' || !TC.ON) return false;
  if (tcOn.nho !== undefined) return tcOn.nho;
  try { tcOn.nho = localStorage.getItem(TC_KHOA) !== '0'; } catch (e) { tcOn.nho = true; }   // không đọc được bộ nhớ trình duyệt: mặc định bật
  return tcOn.nho;
}
function tcDat(on){ tcOn.nho = !!on; try { localStorage.setItem(TC_KHOA, on ? '1' : '0'); } catch (e) {} }

const TC_BAN_NGAY = ['morning', 'noon', 'afternoon'];
// Hôm nay (đang ở ban ngày) có tự chạy không
const tcSeChay = () => !!S && tcOn() && !S.fast && isWorkday() && S.tcTay !== S.day && TC_BAN_NGAY.includes(S.slot);

// Việc LẶP LẠI và lựa chọn theo nếp (vị trí lựa chọn, −1 nếu lần này không phải việc lặp lại)
const tcViTri = (sc, k) => sc.choices.findIndex(c => c.key === k);
const TC_LAP = {
  home_am: () => 0,                                                    // chuẩn bị rồi ra khỏi nhà đúng giờ
  cut: () => 0,                                                        // phân cảnh đến công ty, rời công ty
  standup: () => 0,                                                    // báo cáo ngắn gọn
  task: (ref, sc) => ref.arg && ref.arg.first ? -1 : tcViTri(sc, habit().work || HABIT_DEF.work),   // task đầu tiên ở công ty: luôn tự chọn
  endwork: (ref, sc) => sc.choices.length === 1 ? 0 : sc.plain && !(ref.arg && ref.arg.invite) ? 0 : -1,   // tan làm; được nhờ OT, việc dang dở, được rủ đi chơi thì dừng
};
const tcHopLe = c => c && !c.disabled && !(c.cost && S.money < c.cost);
// Lựa chọn theo nếp của cảnh này (không xét có tự chạy hay không). Bài kiểm thử dùng để bấm đúng như tự chạy.
function tcChonNep(ref, sc){ const f = TC_LAP[ref.id]; if (!f) return -1; const i = f(ref, sc); return i >= 0 && tcHopLe(sc.choices[i]) ? i : -1; }

// Những loại việc người chơi đã gặp (lần đầu luôn dừng). Bản lưu cũ chưa có: coi như đã gặp hết nếu đã qua ngày đầu.
function tcGap(){
  if (!S.tcGap) { S.tcGap = {}; if (S.day > 1) Object.keys(TC_LAP).forEach(k => { S.tcGap[k] = 1; }); }
  return S.tcGap;
}
const tcTinCho = () => { const p = ph(); return Object.keys(p.pending).sort().map(k => k + ':' + p.pending[k].id).join(','); };
// Tình hình tiền cần dừng lại xem ('' nếu ổn): hóa đơn sắp đến hạn mà không đủ tiền, hoặc tiền dưới mức tối thiểu
const tcTien = () => { const hd = (S.bills || []).filter(b => !b.paid && b.due <= S.day + TC.HOA_DON_NGAY), n = hd.reduce((t, b) => t + (b.amount || 0), 0);
  return n > S.money ? 'hd:' + hd.map(b => b.id).join(',') : S.money < TC.TIEN_IT ? 'it' : ''; };
const TC_DONG_NGHIEP = ['boss', 'dung', 'mai', 'phong'];
// Chuyện cũ đồng nghiệp còn muốn nhắc (mỗi chuyện dừng một lần; chuyện chỉ được nhắc khi gặp trong thế giới đi lại nên ở chế độ thẻ nó còn mãi)
const tcNguoiQuen = () => typeof memAll !== 'function' ? '' : memAll().filter(m => TC_DONG_NGHIEP.includes(m.w) && m.o === 'me' && m.d < S.day && m.said !== S.day && m.tk !== S.day).map(m => m.w + ':' + m.k + ':' + m.d).sort().join(',');
// Lý do phải dừng ở việc lặp lại này ('' nếu không có)
function tcDung(ref){
  if (!tcGap()[ref.id]) return 'lan-dau';
  if (typeof ngayLoai === 'function' && ngayLoai(S.day)) return 'ngay-dac-biet';   // ngày review, khách đến, chạy hạn chót…: không phải ngày bình thường, cả ban ngày để người chơi tự chơi
  if (S.energy < TC.NANG_LUONG) return 'nang-luong';
  if (S.health < TC.SUC_KHOE) return 'suc-khoe';
  if (S.mood < TC.TINH_THAN) return 'tinh-than';
  const tien = tcTien(); if (tien && S.tcTien !== tien) return 'tien';   // mỗi đợt thiếu tiền, mỗi hóa đơn: dừng một lần
  if (S.lateToday || S.flags.hangoverToday) return 'muon';
  const tin = tcTinCho(); if (tin && S.tcTin !== tin) return 'tin-nhan';   // mỗi tin nhắn dừng một lần; không trả lời thì hôm đó vẫn tự chạy tiếp
  const nq = typeof roamOn === 'function' && roamOn() ? tcNguoiQuen() : ''; if (nq && S.tcNq !== nq) return 'nguoi-quen';   // chỉ khi đi lại được: dừng ở văn phòng để đồng nghiệp gặp và nhắc chuyện (chế độ thẻ không có lúc nhắc)
  return '';
}
// Vị trí lựa chọn sẽ tự chạy, hoặc −1 (hiện cảnh cho người chơi)
function tcChon(ref, sc){
  if (!tcSeChay() || !TC_LAP[ref.id]) return -1;
  const i = tcChonNep(ref, sc); if (i < 0) return -1;
  if (S.tcTien && !tcTien()) S.tcTien = '';                // tiền đã ổn lại: lần thiếu sau lại dừng
  return tcDung(ref) ? -1 : i;
}
// Một cảnh vừa hiện ra cho người chơi: ghi là đã gặp; nếu là việc lặp lại bị dừng vì tin nhắn hay người quen thì lần sau không dừng lại vì chuyện đó nữa
function tcDaHien(ref){
  if (!S || !ref) return;
  if (TC_LAP[ref.id]) {
    const why = tcSeChay() ? tcDung(ref) : '';
    if (why === 'tin-nhan') S.tcTin = tcTinCho();
    if (why === 'tien') S.tcTien = tcTien();
    if (why === 'nguoi-quen') S.tcNq = tcNguoiQuen();
    if (why && typeof window !== 'undefined') (window.TC_DEBUG = window.TC_DEBUG || []).push({ d:S.day, id:ref.id, why, e:S.energy, h:S.health });
  }
  tcGap()[ref.id] = 1;
}
// Tự chạy một việc: áp dụng lựa chọn như người chơi tự bấm (không hiện màn hình kết quả). Trả về true nếu lựa chọn chuyển sang màn khác.
function tcChay(ref, sc, i){
  current = sc;
  const r = settleChoice(sc.choices[i]);
  if (!S.tcNgay || S.tcNgay.d !== S.day) S.tcNgay = { d:S.day, viec:[], hien:false };
  S.tcNgay.viec.push(ref.id);
  if (typeof window !== 'undefined') (window.TC_DEBUG_CHAY = window.TC_DEBUG_CHAY || []).push({ d:S.day, slot:S.slot, id:ref.id, i, lam:isWorkday() });
  if (r && r.out && r.out.go && followGo(r.out)) return true;
  S.cur = null;
  return false;
}
// Trước cảnh đầu tiên của buổi tối (hoặc muộn hơn): hiện thẻ tóm tắt ban ngày nếu hôm nay có tự chạy
function tcTomTatTruoc(ref){
  const n = S.tcNgay;
  if (!n || n.d !== S.day || n.hien || SLOTS.indexOf(S.slot) <= SLOTS.indexOf('afternoon')) return false;
  n.hien = true; S.queue.unshift(ref); S.cur = { id:'tcTomTat' };
  return true;
}
// Câu tóm tắt việc ở công ty hôm nay
function tcDongViec(){
  const n = S.tcNgay ? S.tcNgay.viec.filter(id => id === 'task').length : 0, p = [];
  if (S.tcNgay && S.tcNgay.viec.includes('standup')) p.push('họp đầu ngày');
  if (n) p.push(`làm ${n} việc theo cách quen tay`);
  if (S.unfinished) p.push('còn một việc dang dở');
  p.push(S.otTonight === true ? 'tối ở lại làm thêm' : S.otTonight === 'home' ? 'mang việc về nhà' : 'tan làm lúc 17:30');
  return `🏢 Đi làm như mọi ngày: ${p.join(', ')}.`;
}
SC.tcTomTat = () => {
  const dau = !S.once.tcGioiThieu, chips = S.d0 ? diffChips(S.d0, { ...snap(), rel:S.d0.rel }).slice(0, TC.CHIP) : [];   // tiền và chỉ số chính (không kể quan hệ từng người)
  const ct = TC_CHI_TIET[(S.day * 7 + (S.job ? S.job.co.length : 0)) % TC_CHI_TIET.length];
  const ch = [{ icon:'➡️', label:TC_CHU.tiep, fx:() => { S.once.tcGioiThieu = true; return { silent:true }; } }];
  if (dau) ch.push({ icon:'✋', label:TC_CHU.tat, fx:() => { S.once.tcGioiThieu = true; tcDat(false); if (typeof tcNut === 'function') tcNut(); return { silent:true }; } });
  return { kind:'journal', title:TC_CHU.tieuDe,
    html:`${dau ? `<p class="tip">${TC_CHU.gioiThieu}</p>` : ''}<p>${tcDongViec()}</p>${chips.length ? `<div class="chips">${chipsHTML(chips)}</div>` : ''}<p class="muted">${ct}</p>`,
    choices:ch };
};
