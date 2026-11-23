/* =========================================================
   v17.6 – PHASE 2: NỀN TẢNG PHÁT TRIỂN (số liệu; cách chạy ở he-thong/phat-trien.js)
   Ba phần, chạy SONG SONG với chỉ số cũ (Chuyên môn S.tech, Kỹ năng mềm S.soft, điểm làm việc S.perf):
   không thay chỉ số cũ, không đổi lương, tài chính, năng lượng, sức khỏe.
   - KY_NANG: 5 kỹ năng nghề. Chỉ tăng khi làm việc có ích (bảng KN_NGUON), có giới hạn mỗi ngày.
   - CAP_BAC: cấp bậc nghề nghiệp. Trong 56 ngày chỉ lên được Middle; các cấp sau cần kinh nghiệm nhiều năm (để dành cho bản sau).
   - MUC_TIEU: mục tiêu sống. Game gợi ý theo hoàn cảnh (nơi ở, gia cảnh, đã có việc chưa…); mỗi mục tiêu có trạng thái, tiến độ, điều kiện xong.
   Thêm kỹ năng, nguồn tăng, cấp bậc, mục tiêu mới = thêm một mục vào đúng bảng.
   ========================================================= */
const PT = {
  ON:true,                   // tắt (false) thì không có kỹ năng nghề, cấp bậc, mục tiêu (game như v17.5)
  MUC:[0, 15, 40, 80, 140, 220],   // điểm kinh nghiệm để đạt từng mức kỹ năng (mức 1 đến 6)
  TEN_MUC:['Mới bắt đầu', 'Cơ bản', 'Khá', 'Vững', 'Giỏi', 'Chuyên gia'],
  TRAN_NGAY:8,               // mỗi kỹ năng mỗi ngày tăng tối đa chừng này điểm (không "cày" được trong một ngày)
  LAP_LAI:.5,                // cùng một việc lặp lại trong ngày thì chỉ được chừng này phần điểm
  GOC:.4,                    // lúc bắt đầu (hoặc bản lưu cũ): Lập trình = Chuyên môn × chừng này, Giao tiếp = Kỹ năng mềm × chừng này
  GOI_Y_NGAY:2,              // tối ngày này game gợi ý mục tiêu
  GOI_Y_SO:3,                // gợi ý chừng này mục tiêu
  CAP_TOI_DA:'middle',       // trong 56 ngày lên tối đa cấp này
};
const KY_NANG = {
  lap_trinh:{ ten:'Lập trình', icon:'💻', mo:'Viết code, làm task, học thêm' },
  giao_tiep:{ ten:'Giao tiếp', icon:'🗣️', mo:'Trình bày, họp, nói chuyện với đồng nghiệp và khách' },
  quan_ly:{ ten:'Quản lý', icon:'📋', mo:'Sắp xếp việc, hỗ trợ người khác, lập kế hoạch' },
  sang_tao:{ ten:'Sáng tạo', icon:'🎨', mo:'Dự án cá nhân, ý tưởng mới, thiết kế' },
  giai_quyet:{ ten:'Giải quyết vấn đề', icon:'🧩', mo:'Sửa lỗi, xử lý sự cố, gỡ việc khó' },
};
// Nguồn tăng kỹ năng. khi(ref, ch, d): ref là cảnh, ch là lựa chọn, d là thay đổi sau lựa chọn
// (d.tech, d.soft, d.perf, d.tasks, d.bugsFixed, d.study, d.ot, d.rel). Chỉ tính khi lựa chọn thật sự có ích.
const evIs = (ref, ...ids) => ref.id === 'ev' && ids.includes(ref.arg);
const KN_NGUON = [
  { id:'chuyen_mon', khi:(ref, ch, d) => d.tech > 0, kn:d => ({ lap_trinh:d.tech }) },                               // mọi việc tăng Chuyên môn
  { id:'mem', khi:(ref, ch, d) => d.soft > 0, kn:d => ({ giao_tiep:d.soft * 1.5 }) },                                // mọi việc tăng Kỹ năng mềm
  { id:'task', khi:(ref, ch, d) => d.tasks > 0, kn:d => ({ lap_trinh:2, giai_quyet:d.perf >= 2 ? 2 : .5 }) },        // làm xong task (làm tốt thì rèn thêm giải quyết vấn đề)
  { id:'sua_loi', khi:(ref, ch, d) => d.bugsFixed > 0 || (['bug_back', 'bug_weekend'].includes(ref.id) && d.perf >= 0 && d.tech + d.perf > 0), kn:() => ({ giai_quyet:3, lap_trinh:1 }) },
  { id:'hop', khi:(ref) => ref.id === 'standup', kn:() => ({ giao_tiep:1 }) },                                     // họp đầu ngày: báo cáo việc của mình
  { id:'du_an', khi:(ref, ch) => ch.actId === 'study', kn:() => ({ sang_tao:2, lap_trinh:1 }) },                    // học thêm, làm dự án cá nhân
  { id:'ot', khi:(ref, ch, d) => d.ot > 0, kn:() => ({ lap_trinh:1, quan_ly:1 }) },                                   // ở lại làm cho xong việc
  { id:'ke_hoach', khi:(ref) => ref.id === 'plan', kn:() => ({ quan_ly:3 }) },                                       // lập kế hoạch chi tiêu
  { id:'nhan_xet', khi:(ref, ch) => ref.id === 'review' && !/Cảm ơn/.test(ch.label), kn:() => ({ quan_ly:1, giao_tiep:1 }) },   // chủ động hỏi việc khi được nhận xét
  { id:'demo', khi:(ref, ch, d) => evIs(ref, 'ngay_demo') && d.soft + d.tech + d.perf > 0, kn:() => ({ giao_tiep:3, sang_tao:1 }) },
  { id:'su_co', khi:(ref, ch, d) => evIs(ref, 'ngay_suco') && d.tech + d.perf + d.soft > 0, kn:() => ({ giai_quyet:3 }) },
  { id:'han_chot', khi:(ref, ch, d) => evIs(ref, 'ngay_deadline') && d.perf + d.rel > 0, kn:() => ({ quan_ly:2 }) },
  { id:'review_code', khi:(ref, ch, d) => evIs(ref, 'ngay_review') && d.tech + d.soft + d.rel > 0, kn:() => ({ lap_trinh:1, giai_quyet:1 }) },
  { id:'khach', khi:(ref, ch, d) => evIs(ref, 'ngay_khach') && d.soft + d.perf + d.rel > 0, kn:() => ({ giao_tiep:2 }) },
  { id:'team', khi:(ref, ch, d) => evIs(ref, 'ngay_team') && d.rel > 0, kn:() => ({ giao_tiep:1, quan_ly:1 }) },
  { id:'ket_noi', khi:(ref, ch, d) => ref.id === 'hangout' && d.rel >= 3, kn:() => ({ giao_tiep:1 }) },               // đi chơi, nói chuyện thật lòng
  { id:'y_tuong', khi:(ref, ch) => /thiết kế|ý tưởng|dự án/i.test(ch.label || ''), kn:() => ({ sang_tao:1 }) },
];

// Cấp bậc: điều kiện lên cấp gồm năng lực (mức kỹ năng), kinh nghiệm (ngày công) và kết quả công việc (điểm làm việc trung bình, số task, nhận xét không bị nhắc nhở)
const CAP_BAC = [
  { id:'junior', ten:'Junior Developer' },
  { id:'middle', ten:'Middle Developer', can:{ kn:{ lap_trinh:4, giai_quyet:3, giao_tiep:3 }, ngayCong:25, task:40, diem:1.6, nhanXet:true } },
  { id:'senior', ten:'Senior Developer', can:{ kn:{ lap_trinh:5, giai_quyet:4, giao_tiep:3, quan_ly:2 }, ngayCong:250, task:200, diem:2.2, nhanXet:true } },
  { id:'lead', ten:'Team Leader', can:{ kn:{ lap_trinh:5, giao_tiep:4, quan_ly:4, giai_quyet:4 }, ngayCong:500, task:350, diem:2.4, nhanXet:true } },
  { id:'manager', ten:'Manager', can:{ kn:{ giao_tiep:5, quan_ly:5, giai_quyet:4 }, ngayCong:900, task:500, diem:2.4, nhanXet:true } },
];

// Mục tiêu sống. goiY(): điểm gợi ý theo hoàn cảnh (0 = không gợi ý); tienDo(): 0..1; xong khi tiến độ đạt 1.
// daiHan: mục tiêu nhiều năm, hết 56 ngày vẫn tiếp tục (không tính là trượt).
const tienKiem = () => Math.max(0, S.money - ((S.pt && S.pt.tien0) ?? S.money));
const MUC_TIEU = {
  tiet_kiem:{ icon:'🐷', ten:() => `Để dành ${fmtTr(mtSo('tiet_kiem'))} trong hai tháng`, loai:'tien',
    so:() => ({ nha:5e6, tro:3e6, ghep:4e6 }[S.bg] || 4e6) * (S.fam === 'kho' ? .7 : S.fam === 'kha' ? 1.3 : 1),
    goiY:() => (S.fam === 'kho' ? 3 : 2) + (S.bg === 'tro' ? 1 : 0), tienDo:() => tienKiem() / mtSo('tiet_kiem'), ly:'Lương đầu tiên, tiền nhà, tiền ăn: để dành được là bước đầu.' },
  mua_xe:{ icon:'🛵', ten:() => `Để dành đổi xe máy mới (${fmtTr(mtSo('mua_xe'))})`, loai:'tien', so:() => 15e6,
    goiY:() => (S.bg === 'nha' ? 2 : 0) + (S.fam === 'kha' ? 2 : 0), tienDo:() => S.money / mtSo('mua_xe'), ly:'Chiếc xe cũ đã đi từ hồi sinh viên.' },
  mua_nha:{ icon:'🏠', ten:() => `Tích lũy tiền đặt cọc căn hộ (${fmtTr(mtSo('mua_nha'))})`, loai:'tien', daiHan:true, so:() => 300e6,
    goiY:() => (S.bg === 'tro' || S.bg === 'ghep' ? 1 : 0) + (S.fam === 'kha' ? 1 : 0), tienDo:() => tienKiem() / mtSo('mua_nha'), ly:'Đi thuê mãi cũng mệt. Mục tiêu nhiều năm, bắt đầu từ bây giờ.' },
  co_viec:{ icon:'💼', ten:() => 'Có công việc đầu tiên', loai:'su_nghiep',
    goiY:() => S.job ? 0 : 5, tienDo:() => S.job ? 1 : S.applied || (S.appliedList || []).length ? .5 : 0, ly:'Việc đầu tiên quan trọng nhất.', moRa:'su_nghiep' },
  su_nghiep:{ icon:'📈', ten:() => 'Lên Middle Developer', loai:'su_nghiep',
    goiY:() => S.job ? 4 : 0, tienDo:() => ptCapTienDo(), ly:'Làm tốt, học thêm, rồi sẽ được giao việc lớn hơn.' },
  hoc_ky_nang:{ icon:'📚', ten:() => `Lên mức Khá kỹ năng ${KY_NANG[mtKn()].ten}`, loai:'ky_nang',
    goiY:() => 2 + (S.tech < 40 ? 1 : 0), tienDo:() => Math.min(1, ptXp(mtKn()) / PT.MUC[2]), ly:'Kỹ năng yếu nhất là chỗ dễ tiến bộ nhất.' },
  quan_he_gd:{ icon:'👪', ten:() => 'Thân với bố mẹ hơn (từ 75)', loai:'quan_he',
    goiY:() => (S.bg !== 'nha' ? 2 : 0) + (S.fam === 'kho' ? 1 : 0) + (S.rel.family < 65 ? 1 : 0), tienDo:() => Math.min(1, S.rel.family / 75), ly:'Ra ở riêng rồi mới thấy cơm nhà ngon.' },
  quan_he_cty:{ icon:'🤝', ten:() => 'Có một người bạn thân ở công ty (từ 70)', loai:'quan_he',
    goiY:() => S.job ? 2 : 0, tienDo:() => Math.min(1, Math.max(...['dung', 'mai', 'phong', 'boss'].map(k => S.rel[k])) / 70), ly:'Đi làm vui hơn khi có người để rủ ăn trưa.' },
  xa_hoi:{ icon:'🎉', ten:() => 'Tham gia 6 hoạt động cùng mọi người', loai:'xa_hoi', so:() => 6,
    goiY:() => 1 + (S.bg === 'tro' ? 2 : 0), tienDo:() => ((S.pt && S.pt.dem.xa_hoi) || 0) / 6, ly:'Ở thành phố mới, đừng chỉ đi làm rồi về.' },
};
// Hoạt động cùng mọi người (tính cho mục tiêu xã hội)
const XA_HOI = (ref, ch) => ref.id === 'hangout' || ref.id === 'cc_hoc' || ['cafe', 'trada'].includes(ch.actId) || (ref.id === 'ev' && ['ngay_team', 'tung_drink', 'linh_study', 'football'].includes(ref.arg) && !/Từ chối|hôm khác|ở nhà/i.test(ch.label || ''));
const PT_LOI = {
  goiY:'Hai tháng tới, bạn muốn đạt được điều gì? Dựa trên hoàn cảnh của bạn, có vài gợi ý:',
  xong:t => `Hoàn thành mục tiêu: ${t}`,
  len:(ten) => `Chị Hạnh: “Từ tuần sau em là ${ten}. Em xứng đáng.”`,
};
