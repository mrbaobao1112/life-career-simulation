/* =========================================================
   NỘI DUNG: task, hoạt động, câu hỏi phỏng vấn, sự kiện
   ========================================================= */
const TASKS = [
  { id:101, icon:'📐', d:1, title:'Nút “Đăng ký” lệch 3 pixel', desc:'Khách hàng phát hiện bằng mắt thường. Khách hàng có đôi mắt rất không bình thường.' },
  { id:102, icon:'📧', d:1, title:'Form chấp nhận email “abc@”', desc:'Hệ thống tin rằng “abc@” là một địa chỉ email hợp lệ. Hệ thống quá ngây thơ.' },
  { id:103, icon:'📚', d:1, title:'Đọc tài liệu dự án 87 trang', desc:'Trang cuối cập nhật năm 2021. Trang đầu ghi “tài liệu này luôn được cập nhật”.' },
  { id:104, icon:'🕐', d:2, title:'Đơn hàng hiển thị sai giờ', desc:'Khách đặt trà sữa lúc 3 giờ chiều, hệ thống ghi 8 giờ sáng. Múi giờ lại ra tay.' },
  { id:105, icon:'🐢', d:2, title:'Trang sản phẩm tải mất 9 giây', desc:'Đủ thời gian để khách đổi ý, đổi app, và suy nghĩ lại về cuộc đời.' },
  { id:106, icon:'🔤', d:1, title:'“Thanh toán” bị dịch thành “Thánh toán”', desc:'File ngôn ngữ có vẻ đã được ai đó gõ lúc 2 giờ sáng.' },
  { id:107, icon:'🌦️', d:2, title:'Gắn dữ liệu thời tiết vào app trà sữa', desc:'Sếp muốn gợi ý trà nóng khi trời lạnh. Tài liệu hướng dẫn viết bằng ba thứ tiếng, không có tiếng nào là tiếng Việt.' },
  { id:108, icon:'🧪', d:2, title:'Viết kiểm thử cho hàm tính phí ship', desc:'Hàm dài 300 dòng, tên là “tinhTienShipFinalFinal2”.' },
  { id:109, icon:'👻', d:3, title:'Lỗi chỉ xảy ra trên máy khách', desc:'Trên máy bạn chạy hoàn hảo. Đây là bí ẩn lâu đời nhất của nghề.' },
  { id:110, icon:'⚠️', d:2, title:'Nâng cấp thư viện, 47 cảnh báo vàng', desc:'Vàng chưa phải đỏ. Nhưng vàng nhiều quá thì nhìn cũng hơi đỏ.' },
  { id:111, icon:'🎨', d:1, title:'Đổi nút từ xanh sang “xanh hơn”', desc:'Chị thiết kế bảo: “Xanh như phương án 1 nhưng tươi như phương án 3.”' },
  { id:112, icon:'🔐', d:2, title:'Bấm “Đăng xuất” mà không thoát ra', desc:'Ứng dụng quá gắn bó với người dùng. Cần dạy nó cách buông tay.' },
];
const TASK = Object.fromEntries(TASKS.map(t => [t.id, t]));
const DEADLINE = { 1:'Hết hôm nay', 2:'Ngày mai', 3:'Hôm qua (khách nói thế)' };

const HR_QS = [
  { q:'“Em giới thiệu ngắn gọn về bản thân nhé.”', a:[
    { t:'“Em là người cẩn thận, thích làm việc có quy trình rõ ràng.”', trait:'stable' },
    { t:'“Em mê làm sản phẩm. Đồ án của em là app đặt trà sữa có 200 người dùng thật.”', trait:'passion' },
    { t:'“Em học nhanh, cái gì chưa biết em tự mò được. Tuần trước em còn tự sửa được máy giặt.”', trait:'proactive' },
  ]},
  { q:'“Điểm yếu lớn nhất của em là gì?”', a:[
    { t:'“Em hơi cầu toàn ạ.”', pts:1, r:'Chị HR mỉm cười lịch sự. Đây là lần thứ 14 trong tuần chị nghe câu này.' },
    { t:'“Em hay ngại hỏi khi gặp khó. Em đang tập hỏi sớm hơn.”', pts:2, r:'Chị HR gật đầu, ghi chép. Có vẻ sự thật thà được cộng điểm.' },
    { t:'“Em không có điểm yếu ạ.”', pts:0, r:'Chị HR im lặng hai giây. Hai giây dài nhất trong đời bạn.' },
  ]},
  { q:'“Hai năm tới, em mong muốn điều gì ở công ty?”', a:[
    { t:'“Được đào tạo bài bản và gắn bó lâu dài.”', trait:'stable' },
    { t:'“Được làm sản phẩm có thật nhiều người dùng.”', trait:'passion' },
    { t:'“Được giao việc khó để lên trình thật nhanh.”', trait:'proactive' },
  ]},
];

const TECH_QS = [
  { q:'“Trang web của bọn anh tự nhiên chạy rất chậm. Em kiểm tra gì đầu tiên?”', a:[
    { t:'Đo xem chậm ở đâu: mạng, máy chủ hay truy vấn dữ liệu', s:15, r:'Anh trưởng nhóm gật đầu: “Đúng hướng.” Anh hỏi thêm vài câu và bạn trả lời được hơn một nửa.' },
    { t:'Nâng cấp máy chủ lên gói đắt nhất', s:2, r:'Anh trưởng nhóm cười: “Em có biết gói đắt nhất giá bao nhiêu không?” Bạn không biết. Anh cũng không định nói.' },
    { t:'Tắt đi bật lại', s:5, r:'“Tinh thần lạc quan đấy.” Anh ghi một chữ rất ngắn vào giấy.' },
  ]},
  { q:'“Code của em chạy đúng trên máy em nhưng lỗi trên máy đồng nghiệp. Em làm gì?”', a:[
    { t:'So sánh môi trường hai máy: phiên bản, cấu hình, dữ liệu', s:15, r:'Anh trưởng nhóm gật đầu: “Chuẩn.” Anh hỏi thêm về cách bạn ghi lại cấu hình, bạn trả lời khá ổn.' },
    { t:'Bảo đồng nghiệp cài lại máy', s:3, r:'“Thế lỡ máy khách hàng cũng lỗi thì em bảo khách cài lại máy à?” Bạn nghĩ đó là một câu hỏi tu từ.' },
    { t:'Cho đồng nghiệp mượn máy của em luôn', s:5, r:'“Sáng tạo đấy, nhưng công ty có 40 người.”' },
  ]},
];

// Hoạt động tự do dùng chung cho buổi sáng, chiều, tối
const ACTS = [
  { id:'prep', icon:'🎯', label:'Ôn câu hỏi phỏng vấn', slots:['morning','afternoon','evening'], cond:()=>S.applied && S.day < S.ivDay,
    hints:['🎯 Phỏng vấn dễ thở hơn','⚡ −12'],
    fx:()=>{ S.prep += BAL.PREP_BONUS; S.energy -= 12; S.tech += 1;
      return pick(['Bạn luyện câu “Hãy giới thiệu về bản thân” trước gương. Đến lần thứ năm thì cái gương có vẻ đã thuộc.',
                   'Bạn đọc lại một loạt câu hỏi phỏng vấn kỹ thuật. Một nửa bạn biết, một nửa bạn biết là mình không biết. Cũng là tiến bộ.']); } },
  { id:'study', icon:'📖', label:'Học thêm, làm dự án cá nhân', slots:['morning','afternoon','evening'],
    hints:['🧠 +3 Chuyên môn','⚡ −15'],
    fx:()=>{ S.tech += 3; S.energy -= 15; S.mood -= 2; S.stat.study++;
      return pick(['Bạn làm tiếp dự án cá nhân: một app nhắc uống nước. Bạn quên uống nước trong lúc làm.',
                   'Ba video bài giảng, hai bài tập. Bạn hiểu ra một điều mà trước giờ chỉ gật gù cho qua.',
                   'Bạn đọc mã nguồn của một thư viện nổi tiếng. Choáng ngợp, nhưng học được vài cách viết rất gọn.']); } },
  { id:'jobs', icon:'🔎', label:'Lướt tin tuyển dụng cho tuần sau', slots:['morning','afternoon'], cond:()=>!S.job && S.day >= 3 && S.day <= 5,
    hints:['🗂️ Chuẩn bị cho tuần sau','🙂 −2'],
    fx:()=>{ S.soft += 1; S.mood -= 2; S.flags.jobSearch = (S.flags.jobSearch||0) + 1;
      return 'Bạn lưu 6 tin tuyển dụng. Bốn tin yêu cầu “3 năm kinh nghiệm cho vị trí Fresher”. Hai tin còn lại có vẻ khả thi.'; } },
  { id:'cafe', icon:'☕', label:'Cà phê với Linh', slots:['afternoon','evening'], cost:45000,
    hints:['🙂 +8','🤝 +Linh'],
    fx:()=>{ rel('linh',7); S.mood += 8; S.soft += 1; S.energy -= 4;
      return pick(['Linh kể về khóa học mới với ánh mắt rực lửa. Bạn được truyền cảm hứng, kèm một chút áp lực.',
                   'Hai đứa ngồi quán cà phê trứng trên tầng 3, nhìn xuống phố. Linh bảo: “Cứ từ từ, ai cũng mất phương hướng một thời gian.”']); } },
  { id:'trada', icon:'🧊', label:'Trà đá vỉa hè với Tùng', slots:['afternoon','evening'], cost:10000,
    hints:['🙂 +7','🤝 +Tùng'],
    fx:()=>{ rel('tung',6); S.mood += 7; S.soft += 1;
      return pick(['Hai đứa ngồi ghế nhựa xanh, bàn chuyện bóng đá, thế sự, và việc tại sao trà đá lên 5.000đ.',
                   'Tùng kể kế hoạch làm giàu thứ 17 của cậu ấy. Kế hoạch lần này liên quan đến nuôi ốc. Bạn cười đến đau bụng.']); } },
  { id:'game', icon:'🎮', label:'Chơi game', slots:['morning','afternoon','evening'],
    hints:['🙂 +9','⚡ −4'],
    fx:()=>{ S.mood += 9; S.energy -= 4; if (S.slot === 'evening') S.flags.gamedTonight = true;
      return pick(['Bạn thắng 3 trận, thua 5 trận. Theo thống kê là thua, theo cảm xúc là vui.',
                   'Đồng đội của bạn hôm nay là một em học sinh lớp 6 chơi giỏi hơn bạn rất nhiều và nói cho bạn biết điều đó.']); } },
  { id:'film', icon:'🎬', label:'Xem phim, lướt mạng', slots:['morning','afternoon','evening'],
    hints:['🙂 +5','⚡ +5'],
    fx:()=>{ S.mood += 5; S.energy += 5;
      return 'Bạn định xem một tập phim. Tập phim đó đã tự kéo dài thành ba tập.'; } },
  { id:'run', icon:'🏃', label:'Chạy bộ quanh hồ Bán Nguyệt', slots:['morning','afternoon','evening'],
    hints:['❤️ +4 Sức khỏe','⚡ −10'],
    fx:()=>{ S.health += 4; S.energy -= 10; S.mood += 4; S.stat.run++;
      return 'Một vòng hồ Bán Nguyệt. Các cô chú tập dưỡng sinh vượt mặt bạn hai lần, nhưng bạn thấy người nhẹ hẳn.'; } },
  { id:'rest', icon:'😴', label:'Nằm nghỉ', slots:['morning','afternoon','evening'],
    hints:['⚡ +18'],
    fx:()=>{ S.energy += 18; S.mood += 1;
      return 'Bạn nằm nhìn trần nhà. Trần nhà không đưa ra lời khuyên nào, nhưng bạn thấy khỏe hơn.'; } },
  { id:'family', icon:'📞', label:'Gọi điện cho bố mẹ', slots:['afternoon','evening'], cond:()=>S.bg !== 'nha',
    hints:['🤝 +Bố mẹ','🙂 +3'],
    fx:()=>{ rel('family',7); S.mood += 3; S.stat.calls++;
      return S.stat.miTom > 0
        ? 'Mẹ hỏi ăn uống thế nào. Bạn nói “con ăn uống đầy đủ ạ” và liếc nhìn gói mì tôm trên bàn.'
        : 'Mẹ dặn mặc thêm áo. Hà Thành đang 26 độ. Bạn vẫn dạ vâng.'; } },
  { id:'family2', icon:'🫖', label:'Ngồi uống trà với bố mẹ', slots:['afternoon','evening'], cond:()=>S.bg === 'nha',
    hints:['🤝 +Bố mẹ','🙂 +3'],
    fx:()=>{ rel('family',7); S.mood += 3; S.stat.calls++;
      return 'Bố kể chuyện hồi bố mới đi làm, lương 300 nghìn vẫn mua được xe đạp. Mẹ bảo bố kể chuyện này lần thứ 40 rồi.'; } },
  { id:'clean', icon:'🧹', label:'Dọn phòng', slots:['morning','afternoon','evening'],
    hints:['🙂 +4','⚡ −6'],
    fx:()=>{ S.mood += 4; S.energy -= 6; if (S.bg === 'ghep') rel('tung',5);
      return S.bg === 'ghep'
        ? 'Bạn dọn phòng, tìm thấy 3 chiếc tất lẻ: một của Tùng, hai chiếc không rõ nguồn gốc. Tùng cảm động vì phòng sạch.'
        : 'Bạn dọn phòng, tìm thấy 50 nghìn trong túi áo cũ. Một ngày may mắn, về mặt tâm lý.'; } },
  { id:'shop', icon:'🛍️', label:'Đi trung tâm thương mại', slots:['afternoon','evening'], cost:350000,
    hints:['🙂 +9','⚡ −8'],
    fx:()=>{ S.mood += 9; S.energy -= 8;
      return 'Bạn định chỉ đi dạo. Bạn về nhà với một cái áo, một cái cốc, và một cảm giác hơi có lỗi với ví tiền.'; } },
];

