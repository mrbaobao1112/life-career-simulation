/* =========================================================
   v17.5 – PHASE 3: CÂU NÓI TRONG GIA ĐÌNH
   - GD_CHUYEN: bố mẹ nói chuyện với nhau khi cùng ăn, cùng xem TV, cùng uống trà (theo việc đang làm).
   - GD_HOI: đi làm về, mẹ (nhà bố mẹ) hoặc Tùng (ở ghép) hỏi han; bạn chọn một trong bốn câu trả lời.
     Phần lớn câu trả lời chỉ để trò chuyện, không đổi chỉ số; riêng “có chuyện không vui” thì được an ủi (tinh thần +GD.AN_UI).
   - GD_TUNG_KE: Tùng đi làm ca chiều về kể chuyện ở trung tâm thương mại.
   Thêm câu mới = thêm vào đúng danh sách.
   ========================================================= */
const GD = {
  ON:true,                   // tắt (false) thì nhà ở như trước
  CHAT_GAP:[18, 30],         // bố mẹ cùng ngồi thì cứ chừng này phút game lại nói chuyện một lần
  AN_UI:2,                   // kể chuyện không vui thì được an ủi: tinh thần + chừng này (mỗi ngày một lần)
  HOI_TU:17.5,               // từ giờ này (ngày đi làm) người nhà mới hỏi chuyện đi làm
};
const GD_CHUYEN = {
  eat:[['Ông ăn thêm bát nữa đi.', 'Thôi, no rồi.'], ['Canh hôm nay mặn không ông?', 'Vừa.', 'Thế là ngon.'], ['Cá này mua ở chợ đầu ngõ đấy.', 'Tươi đấy.'],
       ['Mai nấu bún riêu nhé.', 'Ừ, được.'], ['Con nó dạo này ăn ít quá.', 'Đi làm mệt thì thế.']],
  news:[['Mai trời rét đấy ông ạ.', 'Ừ, nhớ lấy áo bông ra.'], ['Giá vàng lại lên.', 'Nhà mình có vàng đâu mà lo.'], ['Đội tuyển đá thứ Bảy này.', 'Thắng thì tôi bao phở.'],
        ['Phim này dài thế, tập 80 rồi.', 'Bà xem đến tập 100 cho xem.']],
  tea:[['Trà này bà mua ở đâu thế?', 'Chè Thái người quen gửi.', 'Ngon.'], ['Chiều nay hàng xóm sang chơi.', 'Ừ, pha thêm ấm trà.'], ['Năm nay nhà mình sơn lại cửa nhé.', 'Để qua Tết.']],
};
// Ai hỏi: mẹ hoặc Tùng. Mỗi câu trả lời: câu của bạn, câu người kia đáp (có thể thêm câu bố nói)
const GD_HOI = {
  mom:{ hoi:['Hôm nay đi làm có mệt không con?', 'Về rồi đấy à? Hôm nay thế nào con?'],
        on:['Thế thì tốt, rửa tay ăn cơm đi con.'], nhieu:['Ăn nhiều vào cho có sức con ạ.', 'Việc thì làm dần, đừng thức khuya.'],
        buon:['Có chuyện gì thì kể mẹ nghe. Ở đâu cũng có lúc thế con ạ.', 'Thôi, ăn bát canh nóng rồi đi nghỉ.'], buon_bo:['Có gì khó thì nói với bố.'],
        nghi:['Ừ, lên nghỉ đi, cơm mẹ để phần.'] },
  tung:{ hoi:['Về rồi à? Hôm nay công ty mày thế nào?', 'Ê, đi làm về rồi đấy à. Ổn không?'],
         on:['Ngon! Thế tối nay làm trận game ăn mừng.'], nhieu:['Tao hiểu, hôm nay tao cũng đứng quầy mỏi cả chân.'],
         buon:['Thôi kệ, mai lại khác. Ra trà đá với tao không?', 'Tao kể chuyện khách hôm nay cho mày cười.'], nghi:['Ừ, nằm đi, tao vặn nhỏ loa.'] },
};
const GD_TRA_LOI = [['on', '😊', 'Công việc hôm nay khá ổn.'], ['nhieu', '😮‍💨', 'Hôm nay hơi nhiều việc.'], ['buon', '😔', 'Công ty có chuyện không vui.'], ['nghi', '🛌', 'Con muốn nghỉ một chút.']];
const GD_TUNG_KE = [['Hôm nay có bà khách thử ba mươi cái áo rồi không mua cái nào.', 'Thế mày làm gì?'], ['Sếp tao bảo tháng sau tăng ca cuối tuần.', 'Lương có tăng không?', 'Không. Chỉ có ca tăng.'],
                    ['Có ông khách trả tiền toàn bằng xu.', 'Đếm hết bao lâu?', 'Hai mươi phút. Tao giờ thành thần đếm.'], ['Đồng nghiệp tao vừa nghỉ việc đi bán trà sữa.', 'Lương cao hơn à?', 'Ít nhất là được uống trà sữa.']];
// Nhớ chuyện bạn kể không vui (người hỏi hôm sau hỏi lại)
Object.assign(MEM_LINES, { gd_buon:{ pos:{ mom:['Chuyện công ty hôm qua, nay ổn hơn chưa con?'], tung:['Chuyện công ty hôm qua ổn chưa mày?'] } } });
// Bố, mẹ nhắc chuyện lương khi lương vừa về (dùng bộ ghép hội thoại Phase 1)
HT.push(
  { who:'dad', g:'congviec', at:'home', when:() => !!S.job && [0, 1, 2].some(k => (S.income || {})[S.day - k]), say:['Lương về rồi à?', 'Vâng ạ.', 'Ừ. Nhớ để ra một ít.'] },
  { who:'mom', g:'congviec', at:'home', when:() => !!S.job && [0, 1, 2].some(k => (S.income || {})[S.day - k]), say:['Lương về thì mua gì cho mình đi con.', 'Con để dành mẹ ạ.', 'Ừ, thế cũng tốt.'] },
  { who:'tung', g:'cuocsong', at:'home', h:[21.5, 26], when:() => !songWeekend(), say:['Đứng quầy cả ngày, chân tao như hai khúc gỗ.', 'Ngâm chân nước nóng đi.'] },
);
