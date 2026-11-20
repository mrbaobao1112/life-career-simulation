/* =========================================================
   v17.5 – PHASE 3: NGÀY LÀM VIỆC ĐẶC BIỆT
   Không phải ngày nào cũng giống ngày nào: thỉnh thoảng có hạn chót, demo, review code, khách đến, sự cố, team building.
   - Có ngày bình thường xen giữa (NGAY.P); không hai ngày liền cùng một loại; không có trong NGAY.TU_NGAY ngày đầu đi làm.
   - Mỗi loại có một cảnh lựa chọn. Hậu quả vừa phải, luôn có một lựa chọn trung tính (không bị phạt vì việc ngoài tầm kiểm soát).
   - Đồng nghiệp phản ứng trong văn phòng (song/ngay-dac-biet-vp.js), và nhớ, nhắc lại chuyện đó khi nói chuyện.
   Thêm loại ngày mới = thêm một mục vào NGAY_LOAI và một cảnh vào EVENTS.
   ========================================================= */
const NGAY = {
  ON:true,                   // tắt (false) thì ngày nào cũng như cũ
  P:.45,                     // xác suất một ngày làm việc là ngày đặc biệt (còn lại là ngày bình thường)
  TU_NGAY:3,                 // chừng này ngày đầu đi làm luôn là ngày bình thường
  // không quá 2 ngày đặc biệt liền nhau (song/ngay-dac-biet-vp.js)
};
// Loại ngày: buổi (sáng/chiều), độ thường gặp, điều kiện thứ trong tuần (wd: 1 = thứ Hai … 5 = thứ Sáu), dấu hiệu
const NGAY_LOAI = {
  deadline:{ ten:'Ngày chạy hạn chót', buoi:'morning', w:2,   icon:'⏰' },
  review:  { ten:'Ngày review code',   buoi:'morning', w:2,   icon:'🔍' },
  khach:   { ten:'Ngày khách đến',     buoi:'morning', w:1,   icon:'🤝', wd:[2, 3, 4] },
  suco:    { ten:'Ngày có sự cố',      buoi:'morning', w:1.2, icon:'🔥' },
  demo:    { ten:'Ngày demo sản phẩm', buoi:'afternoon', w:1.5, icon:'📽️', wd:[3, 4, 5] },
  team:    { ten:'Chiều team building', buoi:'afternoon', w:3,   icon:'🎉', wd:[5] },
};
// Mỗi công ty nghiêng về vài loại ngày (nhân với w)
const NGAY_CTY = { hotay:{ khach:2, demo:1.3 }, banhmi:{ review:1.5, demo:1.4 }, cudem:{ team:2, deadline:1.5 }, loren:{ suco:2, deadline:1.5 }, songhong:{ khach:1.5 } };

// Các cảnh (dùng chung khung sự kiện EVENTS; không bao giờ xảy ra ngẫu nhiên, chỉ xếp theo loại ngày)
Object.assign(EVENTS, {
  ngay_deadline:{ ctx:[], build:() => ({ icon:'⏰', title:'Hạn chót 5 giờ chiều nay',
    html:P('Bản cập nhật cho khách phải xong trước 5 giờ chiều. Cả team căng như dây đàn: anh Dũng không tháo tai nghe, chị Mai test liên tục, Phong thì cứ năm phút lại thở dài một lần.'),
    choices:[
      { icon:'💪', label:'Nhận thêm một phần việc cho team', hints:['🤝 +Chị Hạnh','⚡ −8'], fx:() => { S.energy -= 8; S.perf += 2; rel('boss', 4); rel('dung', 2); ngayGhi('gánh', 'boss', 1);
        return 'Bạn nhận thêm phần kiểm tra dữ liệu. 4 giờ 50 phút, bản cập nhật lên. Chị Hạnh gật đầu với bạn một cái rất nhẹ, nhưng có.'; } },
      { icon:'🤝', label:'Ngồi cạnh hỗ trợ Phong đang cuống', hints:['🤝 +Phong','⚡ −5'], fx:() => { S.energy -= 5; S.soft += 1; rel('phong', 5); ngayGhi('giúp', 'phong', 1);
        return 'Hai người ngồi sát nhau, sửa từng dòng. Phong bảo: “Không có ông chắc tôi xin nghỉ luôn.”'; } },
      { icon:'🎧', label:'Tập trung làm cho xong phần của mình', fx:() => { ngayGhi('riêng');
        return 'Bạn xong đúng phần mình, đúng giờ. Không hơn, không kém. Hạn chót qua đi êm ả.'; } },
    ] }) },
  ngay_review:{ ctx:[], build:() => ({ icon:'🔍', title:'Anh Dũng nhờ review code',
    html:P('Anh Dũng nghiêng người sang: “Em xem giúp anh đoạn này. Mắt người khác hay thấy cái mình không thấy.” Lần đầu tiên anh nhờ bạn.'),
    choices:[
      { icon:'🧐', label:'Đọc kỹ, góp ý thẳng chỗ chưa ổn', hints:['🧠 +2','🎲 Anh Dũng có thể không đồng ý'], fx:() => { S.tech += 2;
        if (S.rel.dung >= 55) { rel('dung', 4); ngayGhi('góp ý được nhận', 'dung', 1); return 'Anh Dũng nhìn chỗ bạn chỉ rất lâu, rồi gật: “Em nói đúng.” Anh sửa luôn, không nói thêm gì.'; }
        rel('dung', -3); ngayGhi('tranh luận', 'dung', -1); return 'Anh Dũng cãi lại, hai bên tranh luận nhỏ về cách đặt tên biến. Cuối cùng anh giữ nguyên. Không khí hơi gượng một lúc.'; } },
      { icon:'📚', label:'Hỏi lại những chỗ mình chưa hiểu', hints:['🧠 +3','🤝 +Anh Dũng','⚡ −4'], fx:() => { S.tech += 3; S.energy -= 4; rel('dung', 4); ngayGhi('học hỏi', 'dung', 1);
        return 'Anh Dũng giảng một lèo mười phút, nhiều hơn tổng số câu anh nói cả tuần. Bạn học được cách anh chia nhỏ hàm.'; } },
      { icon:'👍', label:'“Code anh ổn rồi ạ.”', fx:() => { rel('dung', 1); ngayGhi('khen');
        return 'Anh Dũng nhìn bạn: “Chắc không?” Rồi tự đọc lại thêm một lượt.'; } },
    ] }) },
  ngay_khach:{ ctx:[], build:() => ({ icon:'🤝', title:'Khách hàng đến công ty',
    html:P('10 giờ khách hàng đến họp. Chị Hạnh cần một bản tóm tắt tính năng và một người đón khách. Chị Mai đang lau lại bàn họp lần thứ ba.'),
    choices:[
      { icon:'📝', label:'Soạn tài liệu tóm tắt giúp chị Hạnh', hints:['🗣️ +2','🤝 +Chị Hạnh','⚡ −6'], fx:() => { S.energy -= 6; S.soft += 2; rel('boss', 4); ngayGhi('soạn tài liệu', 'boss', 1);
        return 'Khách lật tài liệu của bạn, hỏi đúng ba câu, cả ba đều có trong đó. Chị Hạnh liếc sang bạn, gật gù.'; } },
      { icon:'☕', label:'Đón khách, lo nước', hints:['🗣️ +1','🤝 +Chị Hạnh'], fx:() => { S.soft += 1; rel('boss', 2); S.mood += 1; ngayGhi('đón khách', 'boss', 1);
        return 'Bạn pha trà, đón khách, chỉ đường lên phòng họp. Khách khen công ty “trẻ trung, nhiệt tình”.'; } },
      { icon:'💻', label:'Ở bàn làm task như thường', fx:() => { ngayGhi('làm task');
        return 'Buổi họp diễn ra sau cửa kính. Thỉnh thoảng nghe tiếng cười. Có vẻ suôn sẻ.'; } },
    ] }) },
  ngay_suco:{ ctx:[], build:() => ({ icon:'🔥', title:'Sự cố: khách không đăng nhập được',
    html:P('11 giờ, điện thoại chị Hạnh reo liên tục: khách không đăng nhập được. Cả team bỏ dở việc. Anh Dũng đã mở log, mặt không cảm xúc.'),
    choices:[
      { icon:'🛠️', label:'Ngồi đọc log cùng anh Dũng', hints:['🧠 +2','🤝 +Anh Dũng','⚡ −10'], fx:() => { S.energy -= 10; S.tech += 2; S.perf += 1; rel('dung', 4); ngayGhi('xử lý', 'dung', 1);
        return 'Hai người dò từng dòng log. Lỗi do chứng chỉ hết hạn. 1 giờ chiều mọi thứ chạy lại. Anh Dũng nói “Cảm ơn” — hai chữ.'; } },
      { icon:'📞', label:'Trực điện thoại, cập nhật cho khách', hints:['🗣️ +2','🤝 +Chị Hạnh','⚡ −5'], fx:() => { S.energy -= 5; S.soft += 2; rel('boss', 4); ngayGhi('trực máy', 'boss', 1);
        return 'Bạn nghe mười hai cuộc gọi, giọng bình tĩnh đến mức chính bạn cũng ngạc nhiên. Chị Hạnh bảo: “Em làm tốt đấy.”'; } },
      { icon:'🙈', label:'Làm nốt task của mình', fx:() => { ngayGhi('đứng ngoài');
        return 'Sự cố được xử lý xong lúc 2 giờ. Không ai hỏi bạn đã ở đâu. Task của bạn xong đúng hạn.'; } },
    ] }) },
  ngay_demo:{ ctx:[], build:() => ({ icon:'📽️', title:'Demo sản phẩm cho ban giám đốc',
    html:P('3 giờ chiều demo. Chị Hạnh hỏi: “Ai trình bày phần tính năng mới?” Phong cúi xuống nhìn bàn phím rất chăm chú.'),
    choices:[
      { icon:'🙋', label:'Xin trình bày phần của mình', hints:['🎲 Tùy kỹ năng','⚡ −5'], fx:() => { S.energy -= 5; const ok = chance(Math.min(.85, .4 + S.soft / 200 + S.tech / 200));
        if (ok) { S.perf += 3; S.mood += 5; rel('boss', 4); ngayGhi('demo tốt', 'boss', 1); return { text:'Bạn trình bày trơn tru, còn kịp đùa một câu. Giám đốc hỏi tên bạn. Chị Hạnh cười rất tươi.', meExpr:'happy' }; }
        S.perf += 1; S.mood -= 2; ngayGhi('demo lỗi'); return 'Đúng lúc bấm nút thì màn hình đứng hình. Chị Hạnh đỡ lời: “Bản thử nghiệm mà.” Bạn đỏ mặt, nhưng cả phòng vẫn vỗ tay.'; } },
      { icon:'🖥️', label:'Chuẩn bị dữ liệu, chạy máy cho buổi demo', hints:['🗣️ +1','🤝 +Chị Mai'], fx:() => { S.soft += 1; rel('mai', 4); ngayGhi('chạy máy', 'mai', 1);
        return 'Bạn và chị Mai chuẩn bị dữ liệu mẫu. Demo chạy mượt từ đầu đến cuối. Chị Mai đập tay bạn dưới gầm bàn.'; } },
      { icon:'🪑', label:'Ngồi dự, ghi chép', fx:() => { ngayGhi('ngồi dự');
        return 'Bạn ghi được hai trang. Trang thứ hai là hình vẽ con mèo của Cú Đêm Lab. Demo suôn sẻ.'; } },
    ] }) },
  ngay_team:{ ctx:[], build:() => ({ icon:'🎉', title:'Chiều thứ Sáu: team building',
    html:P('4 giờ chiều thứ Sáu, chị Mai bày bánh, Phong mang bộ board game. “Cả nhà nghỉ tay 1 tiếng nhé!” — chị Hạnh tuyên bố. Mỗi người góp 50 nghìn.'),
    choices:[
      { icon:'🎲', label:'Tham gia cùng mọi người', cost:50000, hints:['🙂 +6','🤝 +Cả team'], fx:() => { S.mood += 6; S.energy -= 3; rel('mai', 3); rel('phong', 3); rel('boss', 2); rel('dung', 1); ngayGhi('chơi cùng', 'mai', 1);
        return { text:'Phong thua ba ván liền và đòi chơi lại. Anh Dũng thắng ván cuối mà không nói một lời. Cả team cười đến đau bụng.', meExpr:'happy' }; } },
      { icon:'🍰', label:'Ghé ăn miếng bánh rồi về bàn', hints:['🙂 +2'], fx:() => { S.mood += 2; rel('mai', 1); ngayGhi('ghé qua');
        return 'Bạn ăn một miếng bánh, chúc mọi người chơi vui rồi về bàn làm nốt việc.'; } },
      { icon:'🏠', label:'Xin phép làm nốt việc', fx:() => { ngayGhi('không tham gia');
        return 'Mọi người bảo “không sao”. Tiếng cười vọng sang suốt một tiếng.'; } },
    ] }) },
});
['deadline', 'review', 'khach', 'suco', 'demo', 'team'].forEach(k => { EV_TYPE['ngay_' + k] = 'work'; });
ET.work = '💼 Hôm nay ở công ty';

// Ghi lại hôm nay bạn đã chọn gì (để đồng nghiệp nhắc lại khi nói chuyện)
// who, v: người nhớ chuyện này (v = 1 vui, −1 không vui) — để hôm sau họ nhắc lại khi nói chuyện
function ngayGhi(chon, who, v){
  const loai = ngayLoai(S.day); S.flags.ngay = { d:S.day, loai, chon };
  if (who && loai && typeof memAdd === 'function') memAdd({ w:who, o:'me', k:'ev:ngay_' + loai, v });
}

// Đồng nghiệp nhớ và nhắc lại (thêm vào bảng trí nhớ: chỉ ghi khi quan hệ đổi đáng kể)
Object.assign(MEM_LINES, {
  'ev:ngay_deadline':{ pos:{ boss:['Hôm chạy hạn chót em gánh đỡ chị nhiều đấy.'], phong:['Hôm hạn chót không có ông chắc tôi toang.'], '*':['Hôm hạn chót cả team vất vả nhỉ.'] } },
  'ev:ngay_review':{ pos:{ dung:['Chỗ em góp ý hôm trước, anh sửa rồi.', 'Hôm nào em review tiếp cho anh.'] }, neg:{ dung:['Vụ tên biến hôm trước… anh vẫn thấy cách anh ổn.', 'Ừ. Hôm trước hơi căng nhỉ.'] } },
  'ev:ngay_khach':{ pos:{ boss:['Khách hôm trước khen tài liệu em soạn đấy.', 'Hôm có khách em đỡ chị nhiều.'] } },
  'ev:ngay_suco':{ pos:{ dung:['Vụ chứng chỉ hôm trước… em dò log nhanh đấy.'], boss:['Hôm sự cố em trực máy bình tĩnh thật.'] } },
  'ev:ngay_demo':{ pos:{ boss:['Giám đốc vẫn nhắc buổi demo của em đấy.'], mai:['Demo hôm trước mình phối hợp ăn ý nhỉ!'] } },
  'ev:ngay_team':{ pos:{ mai:['Chiều thứ Sáu vui quá em nhỉ!'], phong:['Tuần sau tôi phục thù board game đấy.'] } },
});
// Đồng nghiệp nói về ngày hôm nay khi bạn bắt chuyện (dùng bộ ghép hội thoại của Phase 1)
const ngayHom = () => (typeof S !== 'undefined' && S.job && NGAY.ON) ? ngayLoai(S.day) : null;
HT.push(
  { who:'boss', g:'congviec', at:'office', when:() => ngayHom() === 'deadline', say:['Năm giờ là hạn chót đấy em, cố lên!', 'Dạ, em đang làm ạ.'] },
  { who:'phong', g:'tamtrang', at:'office', when:() => ngayHom() === 'deadline', say:['Tôi sắp khóc rồi ông ạ.', 'Bình tĩnh, còn mấy tiếng nữa.'] },
  { who:'dung', g:'congviec', at:'office', when:() => ngayHom() === 'review', say:['Xem code anh chưa?', 'Em đang đọc ạ.', 'Ừ. Đọc kỹ vào.'] },
  { who:'mai', g:'congviec', at:'office', when:() => ngayHom() === 'khach', say:['Khách đến rồi, em nói nhỏ thôi nhé.', 'Dạ, em biết rồi ạ.'] },
  { who:'dung', g:'tamtrang', at:'office', when:() => ngayHom() === 'suco', say:['Đang dò log. Đừng hỏi gì.', 'Dạ, em không làm phiền ạ.'] },
  { who:'boss', g:'tamtrang', at:'office', when:() => ngayHom() === 'suco', say:['Hôm nay mệt quá em ạ.', 'Chị nghỉ chút đi ạ.', 'Xong vụ này đã.'] },
  { who:'mai', g:'congviec', at:'office', when:() => ngayHom() === 'demo', say:['Chiều demo, em hồi hộp không?', 'Hơi hơi chị ạ.', 'Chị cũng thế.'] },
  { who:['mai', 'phong'], g:'sothich', at:'office', when:() => ngayHom() === 'team', say:['Chiều nay chơi board game, nhớ tham gia nhé!', 'Nhất định rồi!'] },
);
