/* =========================================================
   THẾ GIỚI SỐNG – PHASE 2: CÂU NÓI GIỮA CÁC NPC
   Mỗi mục là một đoạn ngắn: câu của người bắt chuyện, câu đáp (có thể thêm câu thứ ba).
   Chọn theo mức thân (than / thuong / lanh), theo cặp người và theo tình huống. Thêm câu mới = thêm vào đúng danh sách.
   ========================================================= */
const XG = {
  // chào khi đi ngang qua nhau
  greet:{
    than:[['Ơ, chào nhé!', 'Chào chào!'], ['Đi đâu đấy?', 'Lấy nước thôi.'], ['Hôm nay trông tươi thế!', 'Ngủ đủ đấy.']],
    thuong:[['Chào anh.', 'Chào em.'], ['Chào chị ạ.', 'Ừ, chào em.'], ['Chào nhé.', 'Ừ.']],
    lanh:[['…', '…']],
  },
  // nói chuyện khi sang bàn nhau (ngoài các câu theo cặp đã có trong PAIR_CHAT)
  chat:{
    than:[['Trưa nay ăn gì thế?', 'Bún chả đi!', 'Chốt!'], ['Hôm qua xem bóng đá không?', 'Thức đến 2 giờ luôn.'], ['Cuối tuần làm gì?', 'Chắc ngủ bù.', 'Hợp lý.'], ['Có bánh không, đói quá.', 'Ngăn kéo tôi có.']],
    thuong:[['Bản mới lên chưa?', 'Chiều nhé.'], ['Họp mấy giờ nhỉ?', 'Ba giờ.'], ['Cái này gửi ai duyệt?', 'Chị Hạnh.']],
    lanh:[['Xong phần đó chưa?', 'Đang làm.'], ['Cái này của ai?', 'Không biết.']],
  },
  // Phong hỏi anh Dũng: ok (còn kiên nhẫn) / tired (hỏi nhiều quá trong ngày) / cold (không thân)
  ask:{
    ok:[['Anh ơi, cái này em bí quá.', 'Dòng 42.', 'Ơ, đúng thật!'], ['Anh xem giúp em với ạ.', 'Thiếu dấu chấm phẩy.', 'Em cảm ơn anh!'], ['Anh ơi, sao chỗ này lỗi ạ?', 'Biến chưa khởi tạo.', 'À…']],
    tired:[['Anh ơi, lại em đây ạ…', 'Lần thứ mấy rồi?', 'Em xin lỗi anh…'], ['Anh xem giúp em lần nữa…', 'Tự đọc log trước đi.'], ['Anh ơi, em hỏi tí…', '…Hỏi đi. Nhanh.']],
    cold:[['Anh ơi…', 'Anh đang bận.']],
  },
  // từ chối khéo khi đang bận, theo người
  decline:{ dung:['Để sau.', 'Anh đang tập trung.'], boss:['Chị đang dở việc, lát nhé.', 'Em gửi chị qua tin nhắn nhé.'], mai:['Đợi chị tí nhé!', 'Chị đang test dở, lát chị qua.'],
            phong:['Ơ, để em làm nốt cái này đã.', 'Tí em sang nhé!'], mom:['Mẹ đang dở tay.'], dad:['Để lát.'], tung:['Đợi tao hết trận đã!'] },
  // bố mẹ nói chuyện với nhau ở nhà
  family:[['Ông ơi, mai giỗ bác Ba đấy.', 'Ừ, tôi nhớ.'], ['Con nó dạo này đi làm vất vả nhỉ.', 'Lớn rồi, tự lo được.', 'Ông cứ nói thế.'], ['Giá rau lên rồi ông ạ.', 'Thế à.'],
          ['Trưa nay ăn canh cua nhé.', 'Ừ, được.'], ['Ông đọc gì mà chăm thế?', 'Tin bóng đá.', 'Lại bóng đá.'], ['Tối nay có phim hay đấy.', 'Bà xem đi, tôi ngủ sớm.']],
  // rủ nhau về sau giờ làm
  leave:{ yes:[['Về chưa?', 'Về thôi!'], ['Đi cùng không?', 'Đợi tí, tắt máy đã.'], ['Hôm nay mệt nhỉ.', 'Về ngủ thôi.']], no:[['Về chưa?', 'Chưa, còn tí việc.'], ['Về không?', 'Em về trước đi.']] },
  // chị Mai mang bánh: lời mời, người nhận, người từ chối
  snack:{ call:['Có bánh đây, cả nhà ra ăn đi!', 'Bánh quê chị gửi lên, ra ăn nào!'], join:['Cảm ơn chị!', 'Ngon quá!', 'Cho em một cái nhé!'], skip:['Em đang dở, chị để phần em nhé.', '…Cảm ơn chị.'] },
};
