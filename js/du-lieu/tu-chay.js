/* =========================================================
   v18.0 – TỰ CHẠY BAN NGÀY: số liệu và câu chữ (xử lý ở loi/tu-chay.js, giao diện ở giao-dien/tu-chay.js)
   Ngày làm việc bình thường: buổi sáng, trưa, chiều tự qua theo nếp sinh hoạt. Buổi tối và cuối tuần luôn để người chơi tự chơi.
   ========================================================= */
const TC = {
  ON:true,                   // tắt (false) thì không có chế độ tự chạy (game như v17.9)
  NANG_LUONG:30,             // năng lượng dưới mức này: dừng lại, không tự chạy
  SUC_KHOE:40,               // sức khỏe dưới mức này: dừng lại
  TINH_THAN:30,              // tinh thần dưới mức này: dừng lại
  TIEN_IT:300000,            // tiền dưới mức này (đồng): dừng lại
  HOA_DON_NGAY:2,            // hóa đơn chưa trả đến hạn trong chừng này ngày tới mà không đủ tiền: dừng lại
  CHIP:4,                    // thẻ tóm tắt: tối đa chừng này thẻ thay đổi (tiền trước, rồi năng lượng, sức khỏe, tinh thần, chuyên môn…)
};

// Lý do dừng (ghi trong báo cáo kiểm thử, và để người chơi hiểu vì sao hôm nay không tự chạy)
const TC_LY_DO = {
  'lan-dau':'lần đầu gặp việc này',
  'nang-luong':'năng lượng thấp',
  'suc-khoe':'sức khỏe yếu',
  'tinh-than':'tinh thần đi xuống',
  'tien':'tiền sắp không đủ',
  'muon':'đi làm muộn, hay còn mệt vì tối qua',
  'tin-nhan':'có tin nhắn chưa trả lời',
  'nguoi-quen':'đồng nghiệp có chuyện muốn nói với bạn',
};

// Một chi tiết đời thường ở công ty cho thẻ tóm tắt. Chọn theo ngày (không dùng số ngẫu nhiên của game, để bật hay tắt tự chạy vẫn ra cùng kết quả).
const TC_CHI_TIET = [
  'Anh Dũng chỉ bạn một mẹo tìm lỗi nhanh hơn.',
  'Chị Mai mang bánh vào, cả team chia nhau.',
  'Phong kể chuyện con mèo nhà Phong biết mở tủ lạnh.',
  'Chị Hạnh khen cả team trong buổi họp.',
  'Máy pha cà phê ở công ty lại hỏng. Ai cũng thở dài.',
  'Bạn học được một phím tắt mới, tiết kiệm cả chục lần bấm chuột.',
  'Trời ngoài cửa sổ đẹp, cả buổi chiều ai cũng muốn ra ngoài.',
  'Anh Dũng đeo tai nghe cả ngày. Không ai dám làm phiền.',
  'Phong rủ bạn đặt trà sữa chung, được giảm giá.',
  'Chị Mai tìm ra một lỗi cũ từ năm ngoái, cả team cười ồ.',
];

const TC_CHU = {
  tieuDe:'Ban ngày đã qua',
  gioiThieu:'Ban ngày bình thường sẽ tự qua theo nếp. Buổi tối là của bạn.',
  tiep:'Tiếp',
  tat:'Tắt tự chạy ban ngày',
  thanhSang:'🌤️ Ban ngày hôm nay sẽ tự qua theo nếp.',
  tuChon:'✋ Tự chọn hôm nay',
  daChon:'✋ Hôm nay bạn tự chọn từng buổi.',
  nut:on => on ? '🌤️ Tự chạy ban ngày: bật' : '🌤️ Tự chạy ban ngày: tắt',
  caiDat:['Tự chạy ban ngày', 'Ngày làm việc bình thường, buổi sáng và chiều tự qua theo nếp. Buổi tối và cuối tuần bạn luôn tự chơi'],
};
