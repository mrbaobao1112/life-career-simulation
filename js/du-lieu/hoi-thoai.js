/* =========================================================
   v17.5 – PHASE 1: HỘI THOẠI KHI NGƯỜI CHƠI CHỦ ĐỘNG BẮT CHUYỆN
   Dữ liệu có điều kiện, không dùng AI trực tuyến. Thêm câu mới = thêm một mục vào đúng nhóm.
   Mỗi mục: { who, g:nhóm, at:nơi, h:[từ giờ, đến giờ], tier:'than'|'thuong'|'lanh', when:(c)=>đúng/sai, say:[câu NPC, câu bạn đáp, (câu NPC)…] }
   - who: một người, hoặc danh sách người. Bỏ trống at/h/tier/when = dùng được mọi lúc.
   - weekend:true/false: chỉ cuối tuần / chỉ ngày thường. Trong câu có thể dùng {goi} {Goi} {toi} {Toi} {ban} {ten} (xem XUNG).
   - c (ngữ cảnh) có: who, at (office/home/in:cafe…), h (giờ), weekend, tier, act (việc NPC đang làm), rel (độ thân với bạn).
   Nhóm: congviec, cuocsong, sothich, tamtrang, quanhe, hen. Chuyện cũ (trí nhớ) lấy từ tri-nho.js; chuyện vừa xảy ra và các câu tán gẫu cũ lấy từ TALKS (tinh-cach.js), nên không chép lại ở đây.
   ========================================================= */
// Cách xưng hô của bạn với từng người: goi (gọi họ), toi (bạn xưng), ten (tên gọi)
// ban: họ gọi bạn là gì
const XUNG = {
  boss:{ goi:'chị', toi:'em', ban:'em', ten:'chị Hạnh' }, dung:{ goi:'anh', toi:'em', ban:'em', ten:'anh Dũng' }, mai:{ goi:'chị', toi:'em', ban:'em', ten:'chị Mai' },
  phong:{ goi:'ông', toi:'tôi', ban:'ông', ten:'Phong' }, tung:{ goi:'mày', toi:'tao', ban:'mày', ten:'Tùng' }, linh:{ goi:'mày', toi:'tao', ban:'mày', ten:'Linh' },
  mom:{ goi:'mẹ', toi:'con', ban:'con', ten:'mẹ' }, dad:{ goi:'bố', toi:'con', ban:'con', ten:'bố' },
};
// Câu mở đầu của bạn, theo kiểu quan hệ và buổi. {goi}, {Goi}, {ten} được thay theo người nghe.
const HT_MO = {
  tren:{ sang:['Em chào {goi} ạ, sáng nay {goi} thế nào ạ?', 'Chào {goi}, hôm nay {goi} khỏe không ạ?'], trua:['{Goi} ăn trưa chưa ạ?', 'Trưa rồi, {goi} nghỉ tí không ạ?'],
         chieu:['Chiều rồi, {goi} mệt chưa ạ?', '{Goi} ơi, em hỏi chuyện tí được không ạ?'], toi:['{Goi} chưa về ạ?', 'Muộn rồi mà {goi} vẫn ở đây ạ?'] },
  ban:{ sang:['Ê {ten}, sáng nay thế nào?', 'Chào {ten}, ngủ ngon không?'], trua:['Ăn gì chưa {ten}?', 'Trưa nay ăn gì đấy?'],
        chieu:['Ê, đang làm gì đấy?', 'Chiều rồi, có gì vui không?'], toi:['Tối rồi còn ngồi đây à?', 'Ê, tối nay rảnh không?'] },
  nha:{ sang:['Con chào {goi} ạ, {goi} dậy sớm thế?', '{Goi} ơi, sáng nay ăn gì ạ?'], trua:['{Goi} ăn cơm chưa ạ?', '{Goi} đang làm gì đấy ạ?'],
        chieu:['{Goi} ơi, chiều nay {goi} có đi đâu không ạ?', '{Goi} đang làm gì đấy ạ?'], toi:['{Goi} chưa ngủ ạ?', 'Tối nay {goi} xem gì thế ạ?'] },
};
const HT_KIEU = { boss:'tren', dung:'tren', mai:'tren', phong:'ban', tung:'ban', linh:'ban', mom:'nha', dad:'nha' };
// Câu đáp lại lời chào, theo mức thân
const HT_DAP = {
  boss:{ than:['À em đấy à, chị đang tính gọi em.', 'Chào em! Hôm nay trông tỉnh táo đấy.'], thuong:['Chào em.', 'Ừ, chị đây.'], lanh:['Ừ. Có việc gì không em?', 'Chị đang bận chút.'] },
  dung:{ than:['Ừ, chào em.', 'Ờ, em đấy à.'], thuong:['…Ừ.', 'Chào.'], lanh:['Ừ.', '…'] },
  mai:{ than:['Ơ em! Đúng lúc chị đang buồn chán.', 'Chào em yêu quý của team!'], thuong:['Chào em!', 'Ơ, chào em.'], lanh:['Chào em.', 'Ừ, chị đây.'] },
  phong:{ than:['Ê ông! Đang cần người nói chuyện.', 'Ông đến đúng lúc đấy!'], thuong:['Ừ, chào ông.', 'Ê, ông đấy à.'], lanh:['Ừ, chào.', 'Có việc gì không?'] },
  tung:{ than:['Ê mày! Tao đang định gọi.', 'Đúng người tao cần gặp!'], thuong:['Ê, mày đấy à.', 'Gì đấy?'], lanh:['Ừ.', 'Có chuyện gì?'] },
  linh:{ than:['Ơ, mày! Ngồi đi.', 'Đúng lúc tao cần nghỉ tí.'], thuong:['Chào mày.', 'Ơ, mày đấy à.'], lanh:['Ừ, chào.', 'Tao đang dở chút việc.'] },
  mom:{ than:['Con đấy à, lại đây mẹ xem nào.', 'Ơi, mẹ đây.'], thuong:['Ơi, mẹ đây.', 'Gì thế con?'], lanh:['Ừ.', 'Mẹ đây.'] },
  dad:{ than:['Ừ, ngồi đây.', 'Con đấy à.'], thuong:['Ừ.', 'Bố đây.'], lanh:['Ừ.', '…'] },
};
const HT = [
  /* ----- Công việc ----- */
  { who:'boss', g:'congviec', at:'office', h:[8, 12], say:['Sáng nay ưu tiên xong phần đang dở nhé em.', 'Dạ, em làm ngay ạ.'] },
  { who:'boss', g:'congviec', at:'office', say:['Tuần này team hơi căng, cố lên nhé.', 'Dạ, em cố ạ.', 'Có gì vướng cứ báo chị sớm.'] },
  { who:'boss', g:'congviec', at:'office', h:[14, 19], say:['Cuối ngày nhớ cập nhật tiến độ lên bảng nhé.', 'Dạ vâng ạ.'] },
  { who:'boss', g:'congviec', at:'office', tier:'than', say:['Chị đang tính giao em phần khó hơn đấy.', 'Thật ạ? Em sẵn sàng ạ!', 'Từ từ đã, làm tốt phần này trước.'] },
  { who:'dung', g:'congviec', at:'office', say:['Đọc code người khác cũng là học.', 'Dạ, em sẽ đọc nhiều hơn.'] },
  { who:'dung', g:'congviec', at:'office', say:['Viết test trước rồi hãy sửa.', 'Dạ.'] },
  { who:'dung', g:'congviec', at:'office', tier:'than', say:['Hàm em viết hôm qua gọn đấy.', 'Thật ạ? Em cảm ơn anh!', 'Ừ. Nhưng đặt tên biến lại.'] },
  { who:'dung', g:'congviec', at:'office', tier:'lanh', say:['Có việc thì nói nhanh.', 'Dạ, không có gì ạ.'] },
  { who:'mai', g:'congviec', at:'office', say:['Chị vừa tìm ra một lỗi buồn cười lắm.', 'Lỗi gì thế chị?', 'Bấm nút Hủy thì nó… lưu.'] },
  { who:'mai', g:'congviec', at:'office', say:['Bản em gửi hôm qua chị test rồi, ổn đấy.', 'May quá ạ!'] },
  { who:'mai', g:'congviec', at:'office', tier:'lanh', say:['Lần này em kiểm tra kỹ trước khi gửi nhé.', 'Dạ, em nhớ rồi ạ.'] },
  { who:'phong', g:'congviec', at:'office', say:['Task của tôi to gấp đôi ông.', 'Thế đổi không?', 'Thôi khỏi.'] },
  { who:'phong', g:'congviec', at:'office', say:['Ông có thấy anh Dũng như cái máy không?', 'Máy còn biết thở dài, anh ấy thì không.'] },
  { who:'linh', g:'congviec', at:['in:lib', 'in:cafe'], say:['Luận văn tao đang kẹt ở phần số liệu.', 'Cần tao xem giúp không?', 'Mày biết thống kê à?'] },
  { who:'linh', g:'congviec', when:c => !S.job, say:['Nộp hồ sơ thêm chỗ nào chưa?', 'Đang nộp đây.', 'Nộp nhiều vào, đừng ngại.'] },
  { who:'linh', g:'congviec', when:c => !!S.job, say:['Đi làm thế nào, có học được gì không?', 'Học được cách uống cà phê đúng giờ.'] },
  { who:'tung', g:'congviec', at:'in:mall', say:['Nay bán được ba cái áo khoác rồi đấy.', 'Giỏi thế.', 'Một cái là tao tự mua.'] },
  { who:'tung', g:'congviec', when:c => !!S.job, say:['Công ty mày có cho ăn trưa không?', 'Có, nhưng phải tự trả.', 'Thế thì gọi gì là cho.'] },
  { who:'mom', g:'congviec', when:c => !!S.job, say:['Đi làm có ai bắt nạt con không?', 'Không có đâu mẹ.', 'Thế thì tốt.'] },
  { who:'mom', g:'congviec', when:c => !S.job, say:['Có chỗ nào gọi phỏng vấn chưa con?', 'Con đang chờ mẹ ạ.', 'Cứ từ từ, không vội.'] },
  { who:'dad', g:'congviec', when:c => !!S.job, say:['Lương thử việc đủ tiêu không?', 'Cũng tạm bố ạ.', 'Ừ. Tiêu ít thôi.'] },
  { who:'dad', g:'congviec', when:c => !S.job, say:['Có kế hoạch gì chưa?', 'Con đang nộp hồ sơ ạ.', 'Ừ.'] },

  /* ----- Cuộc sống ----- */
  { who:'boss', g:'cuocsong', say:['Con chị dạo này mê khủng long.', 'Bé mấy tuổi rồi chị?', 'Năm tuổi, mà thuộc tên hơn chị.'] },
  { who:'boss', g:'cuocsong', h:[11, 13.5], say:['Trưa nay chị lại ăn cơm hộp.', 'Chị chịu khó thật.'] },
  { who:'dung', g:'cuocsong', say:['Hôm qua anh ngủ được bốn tiếng.', 'Anh làm gì mà thức khuya thế ạ?', 'Đọc tài liệu.'] },
  { who:'mai', g:'cuocsong', weekend:false, h:[14, 19], say:['Chiều nay chị phải đón con.', 'Chị về sớm ạ?', 'Nếu không ai làm vỡ server.'] },
  { who:'phong', g:'cuocsong', say:['Phòng trọ tôi mất nước hai hôm rồi.', 'Thế tắm ở đâu?', 'Đừng hỏi.'] },
  { who:'phong', g:'cuocsong', say:['Mẹ tôi gửi lên một bao gạo, nặng như số phận.', 'Thế là đủ ăn đến Tết.'] },
  { who:'tung', g:'cuocsong', say:['Tao vừa xem một video dạy làm giàu.', 'Rồi sao?', 'Bước một là mua khóa học của nó.'] },
  { who:'tung', g:'cuocsong', at:'home', say:['Bồn rửa bát hôm nay là của mày đấy.', 'Hôm qua tao rửa rồi mà!', 'Thế à? Thế thì của tao.'] },
  { who:'linh', g:'cuocsong', say:['Tao vừa chuyển phòng trọ, gần thư viện hơn.', 'Tiện thế.', 'Tiện học, không tiện ngủ nướng.'] },
  { who:'mom', g:'cuocsong', at:'home', say:['Giá rau lên rồi con ạ.', 'Lên nhiều không mẹ?', 'Mớ rau muống mười lăm nghìn đấy.'] },
  { who:'mom', g:'cuocsong', at:'home', say:['Bác Ba hỏi thăm con đấy.', 'Bác khỏe không mẹ?', 'Khỏe, vẫn hay càm ràm.'] },
  { who:'dad', g:'cuocsong', at:'home', say:['Mái nhà chỗ bếp dột rồi.', 'Để con gọi thợ ạ.', 'Ừ, cuối tuần.'] },

  /* ----- Sở thích ----- */
  { who:'dung', g:'sothich', say:['Anh đang đọc một quyển về hệ thống phân tán.', 'Hay không anh?', 'Ngủ ngon.'] },
  { who:'mai', g:'sothich', weekend:false, say:['Cuối tuần chị đi leo núi Ba Vì.', 'Chị khỏe thật!', 'Leo nửa đường rồi đi ăn gà.'] },
  { who:'phong', g:'sothich', say:['Tối qua tôi leo hạng được một bậc.', 'Chơi game à?', 'Game là đam mê, đi làm là nghĩa vụ.'] },
  { who:'tung', g:'sothich', say:['Đêm nay có trận cầu đỉnh, xem không?', 'Mấy giờ?', 'Hai giờ sáng. Hợp lý mà.'] },
  { who:'tung', g:'sothich', say:['Tao đang tập guitar, nghe thử không?', 'Mấy bài rồi?', 'Một bài. Một nửa.'] },
  { who:'linh', g:'sothich', say:['Tao đang đọc lại Nhà giả kim.', 'Lần thứ mấy rồi?', 'Lần nào cũng thấy khác.'] },
  { who:'linh', g:'sothich', at:'in:cafe', say:['Quán này cà phê trứng ngon nhất phố.', 'Mày đánh giá kiểu gì?', 'Tao đã thử hết cả phố.'] },
  { who:'mom', g:'sothich', at:'home', say:['Mẹ mới học làm bánh trên mạng.', 'Ngon không mẹ?', 'Bố con bảo ngon. Bố con bảo gì cũng ngon.'] },
  { who:'dad', g:'sothich', at:'home', say:['Tối nay có bóng đá.', 'Đội nào đá hả bố?', 'Đội nào cũng được.'] },

  /* ----- Tâm trạng (theo bạn hoặc theo việc người đó đang làm) ----- */
  { who:'*', g:'tamtrang', when:c => S.energy < 30, say:['Trông {ban} mệt quá, nghỉ chút đi.', 'Vâng, {toi} hơi đuối.'] },
  { who:'*', g:'tamtrang', when:c => S.mood >= 75, say:['Hôm nay trông vui thế.', 'Hôm nay ổn thật.'] },
  { who:'*', g:'tamtrang', when:c => S.mood < 40, say:['Có chuyện gì à? Trông không vui.', 'Hơi mệt trong người thôi.'] },
  { who:'mom', g:'tamtrang', when:c => c.act === 'cook', say:['Mẹ đang nấu canh cua, con đói chưa?', 'Đói rồi mẹ ơi!', 'Chờ tí nữa nhé.'] },
  { who:'mom', g:'tamtrang', when:c => c.act === 'news', say:['Thời sự nói mai trời trở lạnh đấy.', 'Con nhớ rồi ạ.', 'Mặc thêm áo vào.'] },
  { who:'dad', g:'tamtrang', when:c => c.act === 'read' || c.act === 'news', say:['Báo nay viết về giá nhà.', 'Đắt lắm hả bố?', 'Đọc xong thấy nhà mình rộng.'] },
  { who:'dad', g:'tamtrang', when:c => c.act === 'tea', say:['Ngồi uống chén trà với bố.', 'Vâng ạ.', 'Ừ. Thế là được.'] },
  { who:'tung', g:'tamtrang', when:c => c.act === 'game', say:['Đợi tí, tao đang combat!', 'Tao đứng xem thôi.', 'Đừng đứng sau lưng, tao run.'] },
  { who:'tung', g:'tamtrang', when:c => c.act === 'cook', say:['Tao đang nấu mì đặc biệt.', 'Đặc biệt chỗ nào?', 'Hai gói.'] },
  { who:'linh', g:'tamtrang', at:'in:lib', say:['Suỵt… nói nhỏ thôi.', '(thì thầm) Học đến đâu rồi?', '(thì thầm) Đến lúc buồn ngủ.'] },
  { who:'dung', g:'tamtrang', when:c => c.h >= 17, say:['Sắp về rồi. Đừng hỏi gì khó.', 'Dạ, em chỉ chào thôi ạ.'] },

  /* ----- Quan hệ (theo độ thân với bạn) ----- */
  { who:'boss', g:'quanhe', tier:'lanh', say:['Chị cần em chủ động hơn.', 'Dạ, em sẽ cố gắng ạ.', 'Ừ, chị chờ xem.'] },
  { who:'mai', g:'quanhe', tier:'than', say:['Em là người chị thích làm cùng nhất đấy.', 'Chị nói thật ạ?', 'Thật. Đừng kể với Phong.'] },
  { who:'mai', g:'quanhe', tier:'lanh', say:['Ừ, chị đang bận test.', 'Dạ, lát em quay lại ạ.'] },
  { who:'phong', g:'quanhe', tier:'than', say:['Có ông ở đây tôi đỡ run hẳn.', 'Tôi cũng thế.'] },
  { who:'tung', g:'quanhe', tier:'than', say:['Mày là thằng bạn tốt nhất tao từng có.', 'Mày lại định vay tiền à?', 'Lần này thì không.'] },
  { who:'tung', g:'quanhe', tier:'lanh', say:['Dạo này mày bận nhỉ.', 'Ừ, hơi bận.', 'Ừ.'] },
  { who:'linh', g:'quanhe', tier:'than', say:['Có mày ngồi cùng tao học được lâu hơn.', 'Thật à?', 'Thật. Mày ngồi im như cái ghế.'] },
  { who:'linh', g:'quanhe', tier:'lanh', say:['Ừ. Tao đang bận.', 'Thôi, lúc khác vậy.'] },
  { who:'mom', g:'quanhe', tier:'than', say:['Có con ở nhà mẹ vui hẳn.', 'Con cũng thế mẹ ạ.'] },
  { who:'dad', g:'quanhe', tier:'than', say:['Con lớn thật rồi.', 'Bố nói gì thế ạ…', 'Ừ. Thế thôi.'] },

  /* ----- Thêm chuyện hằng ngày ----- */
  { who:'boss', g:'congviec', at:'office', say:['Khách vừa khen bản demo tuần trước.', 'Thật ạ? Vui quá chị ạ!', 'Ừ, nhưng họ muốn thêm ba tính năng.'] },
  { who:'boss', g:'sothich', say:['Tối qua chị xem lại phim cũ, khóc như mưa.', 'Phim gì thế chị?', 'Bí mật. Đừng kể ai.'] },
  { who:'boss', g:'cuocsong', h:[8, 11], say:['Sáng nay chị đưa con đi học muộn.', 'Bé có khóc không chị?', 'Bé không. Chị suýt khóc.'] },
  { who:'dung', g:'cuocsong', say:['Cà phê ở pantry hết rồi.', 'Để em báo chị Hạnh ạ.', 'Ừ. Việc gấp đấy.'] },
  { who:'dung', g:'sothich', say:['Cuối tuần anh lắp lại bàn phím.', 'Bàn phím cơ ạ?', 'Ừ. Gõ nghe vui tai.'] },
  { who:'dung', g:'congviec', at:'office', h:[13.5, 18], say:['Chiều nay deploy. Đừng đẩy code lúc bốn giờ.', 'Dạ, em nhớ rồi ạ.'] },
  { who:'mai', g:'cuocsong', say:['Hôm qua chị đi chợ mua được con cá to lắm.', 'Chị nấu món gì ạ?', 'Kho. Cả nhà ăn hết sạch.'] },
  { who:'mai', g:'sothich', say:['Chị mới tập vẽ màu nước.', 'Chị vẽ gì thế?', 'Vẽ con mèo. Nó nhìn như cái gối.'] },
  { who:'mai', g:'congviec', at:'office', h:[13.5, 18], say:['Chiều nay chị test bản mới, em đừng sửa gì nhé.', 'Dạ, em không động vào ạ.'] },
  { who:'mai', g:'cuocsong', h:[11, 13.5], say:['Trưa nay căng-tin có bún chả đấy.', 'Thế phải xuống sớm!'] },
  { who:'phong', g:'cuocsong', say:['Tôi định nuôi một con mèo.', 'Phòng trọ cho nuôi không?', 'Chưa hỏi. Mua mèo trước đã.'] },
  { who:'phong', g:'sothich', say:['Tôi đang học tiếng Nhật.', 'Được mấy chữ rồi?', 'Ba chữ. Chữ “mệt” là một.'] },
  { who:'phong', g:'congviec', at:'office', say:['Ông có mẹo gì đọc code nhanh không?', 'Đọc tên hàm trước, ruột sau.', 'Ồ, hay đấy.'] },
  { who:'tung', g:'cuocsong', say:['Hôm qua có khách mua mười đôi tất.', 'Mười đôi?', 'Ông ấy bảo tất hay mất.'] },
  { who:'tung', g:'sothich', say:['Tao đang tập gym, ba ngày rồi.', 'Thấy gì chưa?', 'Thấy đói.'] },
  { who:'linh', g:'cuocsong', say:['Mẹ tao hỏi bao giờ lấy chồng.', 'Mày trả lời sao?', 'Bảo bao giờ bảo vệ xong luận văn.'] },
  { who:'linh', g:'sothich', say:['Tao vừa đăng ký chạy bộ 5 cây số.', 'Mày chạy được à?', 'Đăng ký trước, chạy tính sau.'] },
  { who:'mom', g:'cuocsong', at:'home', say:['Cô Lan hàng xóm vừa sinh cháu.', 'Thế ạ, trai hay gái mẹ?', 'Con gái, kháu lắm.'] },
  { who:'mom', g:'tamtrang', at:'home', h:[18, 23], say:['Ăn cơm xong thì nghỉ sớm đi con.', 'Vâng ạ.'] },
  { who:'dad', g:'cuocsong', at:'home', say:['Cái xe của bố lại kêu.', 'Mai con dắt đi sửa cho bố.', 'Ừ.'] },
  { who:'dad', g:'congviec', at:'home', say:['Làm ở đâu cũng phải đúng giờ.', 'Vâng ạ.'] },

  /* ----- Hẹn gặp (chỉ khi đã thân) ----- */
  { who:'tung', g:'hen', tier:'than', say:['Cuối tuần ra trà đá đầu ngõ không?', 'Được, tao rủ thêm ai không?', 'Hai thằng là đủ.'] },
  { who:'linh', g:'hen', tier:'than', say:['Hôm nào đi thư viện cùng tao nhé.', 'Ừ, để tao sắp lịch.', 'Nhớ đấy, đừng hứa suông.'] },
  { who:'linh', g:'hen', tier:'than', at:'in:lib', say:['Cuối tuần ra quán cà phê trứng ngồi không?', 'Đi chứ.'] },
  { who:'mai', g:'hen', tier:'than', at:'office', say:['Trưa đi bún chả với chị không?', 'Đi chứ chị!'] },
  { who:'phong', g:'hen', tier:'than', at:'office', say:['Tan làm đi trà đá dưới công ty không?', 'Nếu không phải ở lại.'] },
];
// Bạn đáp khi người ta nhắc chuyện cũ (vui / không vui)
const HT_KYUC_DAP = { pos:['Lần sau lại thế nhé!', 'Có gì đâu ạ.', 'Nhớ lâu thế!'], neg:['Lần đó là lỗi của {toi}…', '{Toi} xin lỗi, lần sau sẽ khác.', 'Ừ… {toi} biết rồi.'] };
// Câu với khách lạ trong quán, theo nơi (người chơi bắt chuyện với khách)
const HT_KHACH = {
  'in:cafe':['Quán đông nhỉ.', 'Ngồi đây làm việc cho tập trung.', 'Cà phê trứng ở đây ngon lắm.'],
  'in:trada':['Trà đá tăng giá rồi đấy.', 'Ngồi tí cho mát.', 'Hôm nay nắng thật.'],
  'in:bia':['Làm cốc không?', 'Tối nay đội nhà đá đấy.', 'Bia ở đây lạnh chuẩn.'],
  'in:com':['Món sườn hôm nay ngon đấy.', 'Giờ này đông thật.', 'Cơm ở đây rẻ mà no.'],
  'in:lib':['(thì thầm) Ở đây yên tĩnh nhỉ.', '(thì thầm) Ôn thi à?', '(thì thầm) Còn chỗ ổ cắm bên kia.'],
  'in:mall':['Đang giảm giá đấy.', 'Đi dạo cho mát thôi.', 'Tầng trên có rạp phim.'],
  'in:bus':['Đi đâu đấy?', 'Xe sắp chạy rồi.', 'Về quê cuối tuần thôi.'],
  'in:lake':['Hôm nay gió mát thật.', 'Chạy được mấy vòng rồi?', 'Sáng nào tôi cũng ra đây.'],
  street:['Đường hôm nay đông nhỉ.', 'Chào bạn.', 'Trời dễ chịu thật.'],
};
// Khách lạ nói chuyện với nhau, theo nơi và buổi (sang, trua, chieu, toi; 'all' dùng mọi buổi). Thay cho bộ câu chung trước đây.
const XG_NOI = {
  'in:cafe':{ sang:[['Sáng nào cũng phải có cốc này.', 'Không có là không làm được gì.'], ['Hôm nay họp mấy cuộc?', 'Ba. Uống hai cốc cho chắc.']],
              chieu:[['Chiều nay làm nốt cái slide.', 'Mang laptop ra đây làm cho tỉnh.'], ['Cuối tuần đi đâu không?', 'Chắc về quê.', 'Nhớ mang quà lên nhé.']],
              toi:[['Tối rồi uống cà phê có mất ngủ không?', 'Mất ngủ thì học tiếp.'], ['Hai đứa mình quen nhau ở quán này đấy.', 'Nhớ chứ, anh làm đổ cốc của em.']],
              all:[['Cà phê trứng ở đây béo thật.', 'Mà không ngấy.'], ['Ông ôn thi đến đâu rồi?', 'Đến chương hai.', 'Tuần sau thi rồi đấy.'], ['Dạo này đi làm thế nào?', 'Cũng ổn, sếp mới dễ tính.']] },
  'in:trada':{ sang:[['Sáng nay đường tắc kinh khủng.', 'Đoạn Cầu Mây lúc nào chả tắc.']],
               chieu:[['Nắng thế này chỉ có trà đá.', 'Cho thêm đá đi bác ơi!'], ['Đọc tin chưa, giá xăng lại tăng.', 'Tăng thì đi bộ.']],
               toi:[['Tối mát, ngồi thế này là nhất.', 'Thêm đĩa hướng dương nữa.']],
               all:[['Nhà ông Tư đầu ngõ lại sửa nhà à?', 'Sửa năm thứ ba rồi.'], ['Công việc dạo này thế nào?', 'Lương chưa lên, giá lên rồi.'], ['Hôm qua mưa to nhỉ.', 'Ngập hết cả ngõ.']] },
  'in:bia':{ chieu:[['Tan làm sớm thế?', 'Sếp đi công tác.', 'Thế thì phải làm cốc!']],
             toi:[['Trận tối nay ông bắt đội nào?', 'Đội đang thua.', 'Lần nào cũng thế.'], ['Dzô! Trăm phần trăm!', 'Từ từ, mai còn đi làm.']],
             all:[['Hồi sinh viên mình hay ngồi quán này.', 'Giờ vẫn ngồi, chỉ có già hơn.'], ['Vợ gọi chưa?', 'Gọi rồi, bảo cốc cuối.', 'Cốc cuối thứ mấy?'], ['Kể chuyện này buồn cười lắm.', 'Kể đi!'], ['Thằng Nam lấy vợ rồi đấy.', 'Nhanh thế!']] },
  'in:com':{ trua:[['Hôm nay có sườn không cô?', 'Hết rồi, còn trứng.', 'Thế trứng.'], ['Ăn nhanh còn về ngủ trưa.', 'Mười lăm phút thôi.']],
             toi:[['Tối nay ăn tạm đây.', 'Về nhà lười nấu.']],
             all:[['Cơm ở đây rẻ mà no.', 'Lại có canh miễn phí.'], ['Chiều nay làm đến mấy giờ?', 'Đến khi xong.']] },
  'in:lib':{ all:[['(thì thầm) Có ổ cắm không?', '(thì thầm) Bên kia kìa.'], ['(thì thầm) Ôn đến đâu rồi?', '(thì thầm) Chưa mở sách.'], ['(thì thầm) Mượn tớ cái bút.', '(thì thầm) Trả nhé.'], ['(thì thầm) Phỏng vấn tuần sau chưa?', '(thì thầm) Run lắm.']] },
  'in:mall':{ all:[['Áo này đẹp không?', 'Đẹp, nhưng đắt.'], ['Đi xem phim không?', 'Phim gì?', 'Phim gì cũng được, ngồi điều hòa.'], ['Đang giảm giá năm mươi phần trăm kìa!', 'Mua một tặng… không có gì.'], ['Tầng trên có quán trà sữa mới.', 'Lên thử đi.']] },
  'in:bus':{ all:[['Xe mấy giờ chạy nhỉ?', 'Chín giờ, chắc chín rưỡi.'], ['Về quê có việc gì không?', 'Đám cưới em họ.'], ['Mang gì lên mà nặng thế?', 'Gạo với gà của mẹ.'], ['Đi Sa Pa à?', 'Đi chơi ba ngày.']] },
  'in:lake':{ sang:[['Sáng nay chạy mấy vòng?', 'Hai vòng thôi, già rồi.']], all:[['Gió hồ mát thật.', 'Chiều nào tôi cũng ra đây.'], ['Hồ này hồi xưa rộng hơn.', 'Hồi xưa cái gì cũng hơn.']] },
  street:{ sang:[['Đi làm sớm thế?', 'Tránh tắc đường.']], all:[['Lâu lắm không gặp!', 'Dạo này bận quá.', 'Hôm nào cà phê nhé.'], ['Đi đâu đấy?', 'Ra chợ mua ít rau.'], ['Trời đẹp nhỉ.', 'Ừ, đi bộ cho khỏe.']] },
};
