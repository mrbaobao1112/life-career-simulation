/* =========================================================
   v17.7 – PHASE 2: ĐỌC NHANH (số liệu và câu chữ; cách chạy ở giao-dien/doc-nhanh.js)
   Mặc định bật. Tắt thì game hiện đầy đủ chữ như trước (nút "📖 Đọc nhanh" ở cuối màn hình, hoặc Cài đặt ở màn hình mở đầu).
   Chỉ đổi CHỮ HIỆN RA và cách bày trên màn hình: không đổi lựa chọn, hiệu ứng, con số, xác suất.
   - DN: ngân sách chữ.
   - DN_THUAT_NGU: thuật ngữ nghề lập trình nói đơn giản (chỉ đổi chữ người chơi thấy, không đổi mã).
   - DN_CANH: bản ngắn của các cảnh tốn chữ nhất (giữ ý, bỏ câu đùa phụ). Cảnh không có ở đây thì rút gọn theo quy tắc chung.
   ========================================================= */
const DN = {
  ON:true,                   // tắt (false) thì không có chế độ Đọc nhanh (game như v17.6)
  MO_TA:20,                  // mô tả cảnh: tối đa chừng này từ hiện sẵn; phần còn lại vào "Xem thêm"
  CAU_DAI:18,                // một đoạn dài hơn chừng này từ thì chỉ giữ câu đầu (phần sau vào "Xem thêm")
  KET_QUA:1,                 // kết quả sau lựa chọn: giữ chừng này câu (câu đầu quá ngắn thì giữ thêm một câu)
  CAU_NGAN:5,                // câu đầu ít hơn chừng này từ thì giữ thêm câu sau
  NHAN:12,                   // nhãn lựa chọn dài hơn chừng này từ thì chỉ giữ câu đầu (câu trong ngoặc kép cũng vậy)
  GOI_Y:1,                   // mỗi lựa chọn hiện tối đa chừng này thẻ gợi ý (ngoài thẻ chỉ số, vốn ẩn theo cài đặt cũ)
  NHAT_KY:2,                 // nhật ký cuối ngày, báo cáo tua nhanh: tối đa chừng này dòng việc đã làm
  DONG:12,                   // một dòng nhật ký dài hơn chừng này từ thì cắt ở dấu phẩy đầu tiên
  NHAC_LAI:3,                // cảnh lặp lại (như "Thiếu ngủ") gặp lại trong chừng này ngày thì chỉ hiện một dòng
};
// [mẫu, thay bằng]. Đọc từ trên xuống, cụm dài đặt trước. Không đổi chữ trong khung code của trò chơi nhỏ.
const DN_THUAT_NGU = [
  [/ ?\(senior\)/g, ''], [/#LCS-\d+/g, ''],
  [/\breview code\b/g, 'xem lại phần việc'], [/\bReview code\b/g, 'Xem lại phần việc'], [/\breview\b/g, 'xem lại'], [/\bReview\b/g, 'Xem lại'],
  [/\bTask\b/g, 'Việc'], [/\btask\b/g, 'việc'], [/\bTASK\b/g, 'VIỆC'],
  [/\bBug\b/g, 'Lỗi'], [/\bbug\b/g, 'lỗi'],
  [/\bOT\b/g, 'làm thêm'], [/\bstandup\b/gi, 'họp đầu ngày'],
  [/\bdeploy\b/g, 'đưa bản mới lên'], [/\bDeploy\b/g, 'Đưa bản mới lên'], [/\bhotfix\b/gi, 'bản sửa gấp'], [/\bcommit\b/g, 'lưu thay đổi'],
  [/\btester\b/g, 'người kiểm thử'], [/\blog\b/g, 'nhật ký hệ thống'], [/\bdev\b/g, 'lập trình viên'], [/\bsenior\b/g, 'người lâu năm'],
];
// Nối câu sau khi bỏ thuật ngữ: "Việc việc" (lặp) và "làm việc việc" không xảy ra với câu chữ hiện có; nếu có thì thêm mẫu ở đây.

// Tên ngắn (1–2 chữ) của các ô giờ rảnh, theo mã hoạt động
const DN_TEN = { study:'Học thêm', jobs:'Tìm việc', cafe:'Cà phê', trada:'Trà đá', game:'Chơi game', film:'Xem phim', run:'Chạy bộ', rest:'Nghỉ',
  family:'Gọi bố mẹ', clean:'Dọn phòng', shop:'Mua sắm', budget:'Tính tiền', cv:'Sửa CV', prep:'Ôn phỏng vấn', hangout:'Rủ đi chơi' };
// Một dòng nhật ký ngắn: câu đầu; còn dài thì cắt ở dấu phẩy đầu tiên
const dnDong = t => { let c = dnCau(t)[0] || t; if (dnTu(c) > DN.DONG && c.includes(',')) c = c.slice(0, c.indexOf(',')) + '.'; return c; };
// Bản ngắn của cảnh tốn chữ nhất. Mỗi hàm nhận (sc, ref) đã dựng sẵn, trả về các phần thay thế (html, choices…).
// Nhật ký: tối đa DN.NHAT_KY dòng mỗi danh sách, mỗi dòng ngắn
const dnNhatKy = html => dnSua(html, root => root.querySelectorAll('ul').forEach(u => {
  const L = [...u.children]; L.slice(0, Math.max(0, L.length - DN.NHAT_KY)).forEach(li => li.remove());
  u.querySelectorAll('li').forEach(li => { if (!li.children.length) li.textContent = dnDong(li.textContent); });
}));
const DN_CANH = {
  wake:(sc) => {
    const d = S.day, n = snoozeN(), hom = (dnCau(todayLine())[0] || '').replace(/^Hôm nay: một ngày làm việc ở .*$/, 'Hôm nay: đi làm.');
    const dong = d === 1 ? ['Sáng đầu tiên sau tốt nghiệp. Hôm nay: viết CV, nộp hồ sơ.']
      : [`😴 Ngủ ${fmtH(S.sleep)}.${S.flags.hangoverToday ? ' Còn mệt vì bia tối qua.' : ''}`, hom];
    if (n) dong.push(`Đã nằm thêm ${n * BAL.SNOOZE_MIN} phút. Giờ là ${hm(wakeMin())}.`);
    return { html:P(...dong) + (S.wakeInfo ? `<details class="fd"><summary>⚡ ${S.energy} · cách tính</summary>${wakeTable()}</details>` : '')
      };                                                                            // dòng giờ ra khỏi nhà: màn "Chuẩn bị đi làm" ngay sau đã nói
  },
  task:(sc) => ({ html:dnSua(sc.html, root => {
    root.querySelectorAll('.tip').forEach(e => e.remove());                                  // câu giới thiệu "mỗi task là một lá bài"
    root.querySelectorAll('.tk-top span:first-child').forEach(e => { e.textContent = ''; });  // mã việc #LCS-…
    root.querySelectorAll('.tk-desc').forEach(e => { e.textContent = dnCau(e.textContent)[0] || e.textContent; });
  }) }),
  dayReport:(sc) => ({ html:dnNhatKy(sc.html) }),
  ffReport:(sc) => ({ html:dnNhatKy(sc.html.replace(/^<p>[^<]*<\/p>/, '')) }),     // bỏ câu mở đầu "Những ngày vừa qua trôi theo nếp quen…"
  activity:(sc) => ({ html:'', choices:sc.choices.map(c => DN_TEN[c.actId] ? { ...c, short:DN_TEN[c.actId] } : c) }),
  plan:(sc, ref) => ({ html:dnSua(sc.html, root => {
    const p = root.querySelector('p'); if (p && !p.closest('.food')) p.textContent = ref.arg === 'manual' ? 'Tính lại tiền nong.' : 'Tính tiền nong tháng đầu.';
    root.querySelectorAll('.tip').forEach(e => { e.textContent = 'Thu xếp sớm thì nhẹ hơn.'; });
  }), choices:sc.choices.map(c => ({ ...c, label:String(c.label).replace(/^Hẹn .+? đóng (.+?) vào ngày lương \((.+)\)$/, 'Hẹn đóng $1 ngày $2') })) }),
  // Hết giờ làm: bỏ câu tả giờ giấc ở đầu, giữ phần chính (việc dang dở, lời chị Hạnh nhờ, lời rủ đi trà đá)
  endwork:(sc) => ({ html:dnSua(sc.html, root => { const p = root.querySelector('p'); if (p && /^Năm rưỡi chiều/.test(p.textContent) && (root.querySelectorAll('p').length > 1 || (sc.talk || []).length)) p.remove(); }) }),
  ob_team:() => ({ html:P('Chị Hạnh giới thiệu cả team: anh Dũng (lâu năm, hay đeo tai nghe), chị Mai (kiểm thử), Phong (mới vào như bạn).') }),
  'ev:sleepdebt':() => {
    let f = S.flags.dnNo || {};                                       // nhớ ngày gặp gần nhất và lần trước đó (cảnh có thể được dựng nhiều lần trong một ngày)
    if (f.sleepdebt !== S.day) f = S.flags.dnNo = { ...f, sleepdebt:S.day, sleepdebtTruoc:f.sleepdebt };
    const gan = f.sleepdebtTruoc && S.day - f.sleepdebtTruoc <= DN.NHAC_LAI;
    return { title:'Thiếu ngủ', html:P(gan ? '🥱 Lại thiếu ngủ.' : '🥱 Mắt díp lại. Mấy đêm thức khuya rồi.') };
  },
};
