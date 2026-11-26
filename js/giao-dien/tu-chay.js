/* =========================================================
   v18.0 – TỰ CHẠY BAN NGÀY: phần giao diện (xử lý ở loi/tu-chay.js)
   - Màn thức dậy của ngày sẽ tự chạy: một dòng báo trước, kèm nút "Tự chọn hôm nay".
   - Nút bật/tắt ở cuối màn hình chơi (#btnTc), công tắc trong Cài đặt ở màn hình mở đầu (man-mo-dau.js).
   - Mọi cảnh hiện ra đều được ghi "đã gặp" (lần đầu gặp một việc thì không tự chạy).
   Thứ tự nạp: bọc renderScene (giao-dien/man-choi.js, đã được doc-nhanh.js bọc), nên nạp SAU hai file đó.
   ========================================================= */
function tcNut(){ const b = document.querySelector('#btnTc'); if (b) { b.textContent = TC_CHU.nut(tcOn()); b.setAttribute('aria-pressed', String(tcOn())); } }
const tcThanhHTML = () => S.tcTay === S.day
  ? `<p class="tc-bar" role="status">${TC_CHU.daChon}</p>`
  : `<p class="tc-bar" role="status"><span>${TC_CHU.thanhSang}</span><button class="ghost sm" type="button" id="tcTay">${TC_CHU.tuChon}</button></p>`;
(() => {
  const rs = renderScene;
  renderScene = function(){
    const ref = S && S.cur;
    if (ref) tcDaHien(ref);
    rs();
    // Thẻ tóm tắt ban ngày: cuộn thẻ lên đầu màn hình để thấy cả thẻ và nút "Tiếp" mà không phải cuộn (điện thoại nhỏ)
    if (ref && ref.id === 'tcTomTat') { const a = document.querySelector('#stage article.journal'); if (a && a.scrollIntoView) a.scrollIntoView({ block:'start' }); }
    // Màn thức dậy của ngày làm việc: báo trước ban ngày sẽ tự qua (hoặc hôm nay tự chọn)
    if (ref && ref.id === 'wake' && tcOn() && !S.fast && isWorkday()) {
      const pad = document.querySelector('#stage .w-pad'), ch = document.querySelector('#stage .choices');   // đi lại được: ngay dưới khung điều khiển; không thì ngay trên các lựa chọn
      if (pad) pad.insertAdjacentHTML('afterend', tcThanhHTML()); else if (ch) ch.insertAdjacentHTML('beforebegin', tcThanhHTML()); else return;
      const b = document.querySelector('#tcTay');
      if (b) b.addEventListener('click', () => { S.tcTay = S.day; save(); const bar = document.querySelector('#stage .tc-bar'); if (bar) bar.outerHTML = tcThanhHTML(); });
    }
  };
  const lap = () => {
    tcNut();
    const b = document.querySelector('#btnTc');
    if (b && !b.dataset.ok) { b.dataset.ok = '1'; b.addEventListener('click', () => { tcDat(!tcOn()); tcNut(); if (S && S.cur && S.phase === 'play') renderScene(); }); }
  };
  if (document.body) lap(); else document.addEventListener('DOMContentLoaded', lap);
})();
