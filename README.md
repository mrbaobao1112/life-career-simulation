# Life & Career Simulation

Game mô phỏng cuộc sống và sự nghiệp của một người trẻ Việt Nam: vừa tốt nghiệp ngành Công nghệ thông tin, đi tìm việc, đi làm, xoay xở tiền nhà, giữ sức khỏe và các mối quan hệ. Mỗi lựa chọn nhỏ hôm nay có thể ảnh hưởng đến những ngày sau.

Bối cảnh là thành phố hư cấu **Hà Thành**, mang chất Hà Nội. Giọng văn hài hước nhẹ nhàng, nhân vật vẽ theo phong cách **chibi 2D**.

## Chơi thử

- Chơi trực tiếp: https://mrbaobao1112.github.io/life-career-simulation/
- Hoặc tải cả thư mục về (phải có đủ `index.html`, `css/` và `js/`) rồi mở file `index.html` bằng trình duyệt. Không cần cài đặt gì.

Bản chơi thử hiện tại là **tám tuần đầu tiên sau khi tốt nghiệp** (56 ngày trong game, từ 16/11/2026 đến 10/1/2027). Tiến trình được tự động lưu trong trình duyệt.

## Tính năng hiện có

- **Màn hình mở đầu là một góc phố Hà Thành đang sống:** người đi bộ hai chiều (có người dắt chó, người chạy bộ, người cầm điện thoại), xe máy chạy qua, quán trà đá có khách, hàng rong gánh hàng rao bán, bạn bè đi ngang chào nhân vật. Trời và đèn đường đổi theo giờ thật. Nhạc 8-bit và tiếng phố bật sau lần chạm đầu tiên. Màn hình chỉ có một nút chính (“Chơi tiếp” hoặc “Bắt đầu cuộc sống mới”); có bản lưu thì thẻ “Chơi tiếp” tóm tắt ngày, công việc, số dư, chỉ số và mốc sắp tới. Nút bánh răng ở góc trên bên phải mở Cài đặt: nhạc nền, hiệu ứng âm thanh, giảm chuyển động, chơi lại từ đầu, phiên bản.

- **Tự đi lại trong nhà (v14):** giờ rảnh, bữa ăn và giờ đi ngủ ở nhà được chơi bằng cách điều khiển nhân vật: phím WASD hoặc mũi tên để đi (đi chéo được), E để dùng đồ; trên điện thoại dùng joystick và nút ✋ ở dưới khung. Giữ Shift (hoặc kéo joystick ra sát mép) để chạy, chạy tốn năng lượng. Bấm hoặc chạm vào đồ vật thì nhân vật tự tìm đường đến. Từ v14.1, buổi sáng cũng ở trong nhà: nằm trên giường chọn dậy hay nằm thêm 10 phút; ngày đi làm thì tự chuẩn bị rồi ra cửa, ra muộn là đến công ty muộn. Lần đầu vào nhà có hướng dẫn 4 bước. Mỗi hoàn cảnh một căn nhà riêng: phòng trọ khép kín, căn hộ ghép có phòng khách với TV của Tùng, nhà bố mẹ có bàn thờ và bộ ấm chén. Đồng hồ chạy liên tục cả lúc đi lại (1 giây = 2 phút trong game); dùng giường, máy tính, bếp, cửa ra vào… thì làm đúng lựa chọn cũ và sang buổi sau; tắm, uống nước, ngắm phố chỉ tốn vài phút. Hết giờ mà chưa làm gì thì nhân vật lướt điện thoại hết buổi. Danh sách lựa chọn cũ vẫn mở được ngay dưới khung; tắt hẳn trong “Nếp sinh hoạt”.
- **Văn phòng đi lại được (v15):**
  - Ngày đi làm diễn ra trong văn phòng của công ty bạn. Có bốn kiểu văn phòng (lớn, không gian mở, startup, nhỏ), mỗi công ty trang trí riêng.
  - Đến chỗ họp nhấn E để họp đầu ngày; ngồi vào bàn nhấn E để làm task; muốn hỏi anh Dũng thì sang bàn anh ấy; ra cửa để ăn trưa và tan làm.
  - Làm task có trò chơi nhỏ (bắt bug, xếp code, gõ lệnh, nối dây API). Chơi tốt thì khả năng làm tốt nhích lên tối đa 6%; bỏ qua thì tính như cũ.
  - Bỏ bàn quá lâu trong giờ làm thì chị Hạnh nhắc: nhắn tin, đến tận nơi, rồi trừ hiệu suất.
- **Ra phố Hà Thành (v16):**
  - Bước ra cửa là ra ngõ nhà rồi ra phố Bán Nguyệt: cơm bụi, trà đá, cà phê, bia hơi, phường, thư viện, hồ, trung tâm thương mại, bến xe.
  - Vào trong từng nơi đi lại được: ngồi cà phê với Linh, trà đá với Tùng, chạy hết một vòng hồ, trả tiền ở quầy thu ngân, mua vé về quê.
  - Có xe máy: dắt xe ra ở ngõ, đi nhanh hơn, ngày nghỉ tốn 15.000đ xăng.
  - Trên phố có chuyện bất ngờ: gặp người quen, hàng rong, mưa bất chợt, tắc đường.
- **Thế giới sống (v17, phase 1):** người ở cùng nhà và đồng nghiệp có lịch sinh hoạt theo giờ riêng, khác giữa ngày thường và cuối tuần. Họ tự đi lại, làm việc, ăn uống, ra ngoài rồi quay về, có việc xen và lúc ngồi yên, kể cả khi bạn không làm gì. Dấu hiệu nhỏ trên đầu cho biết họ đang làm gì (tắt được). Từ phase 2 họ còn nói chuyện với nhau, chào nhau khi đi ngang, từ chối khi đang bận, rủ nhau về sau giờ làm; mỗi cặp có độ thân riêng thay đổi dần theo những lần gặp (ví dụ Phong hỏi anh Dũng nhiều quá thì anh Dũng bớt nhiệt tình). Từ phase 3 cả thành phố cũng có nhịp: quán đông vắng theo giờ, khách vào gọi đồ, ngồi rồi về; phố có người đi bộ, xe máy, giờ cao điểm, trời mưa thì người ta chạy vào mái hiên; ngõ có hàng xóm, trẻ con, người dắt chó; chiều ngày thường gặp Tùng đứng quầy ở trung tâm thương mại, Linh học ở thư viện (họ đi vào, đi ra bằng cửa theo giờ; không có họ thì vẫn ngồi cà phê, trà đá một mình được); ở công ty thỉnh thoảng có người tranh luận, họp đột xuất hay đến muộn. Từ phase 4 NPC còn nhớ chuyện cũ: cho Tùng mượn tiền, đi cà phê với Linh, quên sinh nhật chị Mai… thì lần gặp sau họ nhắc lại, nét mặt theo chuyện; nghỉ làm mấy hôm thì đồng nghiệp hỏi thăm. Nét mặt NPC đổi theo việc đang làm (ngủ, chơi game, mệt lúc chiều muộn, tranh luận…). Từ v17.5, “Bắt chuyện” (cả ở nhà) là một cuộc nói chuyện thật: mở lời theo buổi và cách xưng hô, người kia đáp theo mức thân, nhắc lại chuyện cũ nếu còn nhớ, hoặc nói chuyện hợp nơi, giờ, việc họ đang làm; khách lạ ở mỗi nơi nói chuyện của nơi đó. Quán có đời sống thật: chị pha chế đứng sau quầy nhận đơn, pha chế, đưa đồ, tính tiền, dọn bàn; cô bán cơm xới cơm; bác trà đá mang trà ra ghế; bạn tự gọi cà phê, ngồi cùng bàn nói chuyện với khách, mời Linh hay Tùng một cốc (họ nhớ và nhắc lại). Ngày làm việc không còn giống nhau: có ngày chạy hạn chót, review code, khách đến, sự cố, demo, team building chiều thứ Sáu, mỗi ngày một lựa chọn và đồng nghiệp phản ứng theo. Ở nhà, bố mẹ trò chuyện khi ăn cơm, xem TV; đi làm về mẹ (hoặc Tùng) hỏi han và bạn chọn câu trả lời.
- **Nếp sinh hoạt:** việc thường ngày (ăn, ngủ, họp đầu ngày, tắc đường) tự diễn ra theo nếp của nhân vật và hiện thành nhật ký trong ngày; người chơi chỉ quyết định việc đáng quyết định. Đổi nếp bất cứ lúc nào bằng nút “Nếp sinh hoạt”.
- **Cảnh sống:** mọi cảnh có hình đều chuyển động. Ở nhà: thức dậy từ trên giường, ăn, học, chơi game, quét dọn, người ở cùng (bố mẹ hoặc Tùng) có việc riêng theo buổi. Ở công ty: đi xe máy tới, chào đồng nghiệp, ngồi gõ phím, đồng nghiệp đi lại và trò chuyện, OT buổi tối vắng người. Ngoài đường: cà phê, trà đá, bia hơi, chạy bộ quanh hồ, thư viện, trung tâm thương mại, có người qua lại; trời mưa thì cảnh ngoài trời cũng mưa. Chạm vào ai thì người đó phản ứng. Bật tắt trong “Nếp sinh hoạt”.
- **Mỗi người một tính cách:** anh Dũng ít nói, hiếm khi rời bàn; chị Mai hay sang bàn người khác và hay cười; Phong hay chạy sang hỏi anh Dũng; chị Hạnh đi họp nhiều; Tùng hay đùa; mẹ hay hỏi han. Tính cách điều khiển hành vi thật trên màn hình, và hiện trong Hồ sơ.
- **Văn phòng mỗi ngày một khác:** lịch của từng người được xếp lại mỗi ngày; có ngày họp đột xuất, lỗi khẩn cấp, chạy hạn chót, có ngày một người nghỉ phép. Hết sự kiện thì ai về việc nấy.
- **Chủ động bắt chuyện:** đồng nghiệp và người ở cùng nhà tự đến nói với bạn vài câu, nội dung tùy độ thân, công việc và chuyện vừa xảy ra; không có lựa chọn, chỉ làm thân hơn rất nhẹ.
- **Nghỉ phép:** nhắn chị Hạnh trên điện thoại để báo nghỉ một hay nhiều ngày; lý do là chuyện riêng, game không xét. Đang thử việc (lương 85%) thì ngày nghỉ không tính công. Khi đã chính thức, ngày 1 mỗi tháng được cộng 1 ngày phép (12 ngày mỗi năm); hết phép thì nghỉ không lương. Nghỉ dài hoặc đang có việc dở thì phải bàn giao. Tuần đầu đi làm chỉ báo nghỉ được từng ngày một. Màn chơi và Hồ sơ luôn nhắc lịch nghỉ sắp tới. Ngày nghỉ là một ngày rảnh, có thêm các hoạt động cả ngày: về quê, giải quyết việc cá nhân, đi chơi với bạn.
- **Qua nhanh và tua:** “Qua nhanh hôm nay” cho ngày tự trôi theo nếp; “Tua đến…” chạy nhiều ngày liền và dừng ở mốc tiếp theo hoặc khi có việc cần quyết định.
- **Các mốc trong 8 tuần:** nhận xét của trưởng nhóm 27/11, Tùng trả nợ cuối tháng, hóa đơn ngày 1, lương ngày 10, tiền nhà ngày 16; tổng kết mỗi Chủ nhật và mỗi đầu tháng.
- **Tìm việc tiếp:** người chưa có việc được nộp hồ sơ lại mỗi thứ Hai, vào các công ty chưa từng nộp.

- **Tạo nhân vật:** tên, giới tính, kiểu tóc, màu tóc, màu da; gia cảnh (khá giả, bình thường, khó khăn) và nơi ở (ở cùng bố mẹ, thuê trọ, ở ghép) chọn độc lập.
- **Tài chính:** sổ hóa đơn, chi phí cố định, khả năng duy trì cuộc sống, áp lực tài chính theo bậc, các lối ra khi thiếu tiền.
- **Tìm việc:** viết CV (độ nổi bật, độ trung thực, kỹ năng khai báo), chọn công ty, phỏng vấn 3 vòng, thương lượng lương, phương án dự phòng khi trượt.
- **Đi làm:** họp đầu ngày, task dạng lá bài với 4 cách xử lý, lỗi do làm vội quay lại về sau, OT.
- **Đời sống:** bữa ăn theo hoàn cảnh, hoạt động tự do, rủ bạn bè và đồng nghiệp đi chơi với câu chuyện mở dần theo độ thân.
- **Giấc ngủ và năng lượng:** hồi phục cộng dồn, nợ ngủ, bảng giải thích năng lượng mỗi sáng.
- **Buổi sáng có lịch trình:** báo thức, chuẩn bị, đi xe máy, tắc đường, mưa, tính ra giờ đến nơi.
- **Thói quen ăn uống:** dinh dưỡng tính theo khoảng 10 bữa gần nhất, hồ sơ thói quen trong mục Hồ sơ.
- **Sự kiện ba loại:** có lịch hẹn, bất ngờ, hậu quả (kèm nguyên nhân).
- **Điện thoại trong game:** tin nhắn, nhóm chat, trả lời ảnh hưởng độ thân, để "đã xem" quá lâu sẽ có hậu quả.
- **Tháng đầu đi thuê nhà:** lương thử việc theo ngày công, kế hoạch tháng đầu, nhờ vả gia đình, bạn bè, chủ nhà, tạm ứng lương, sổ nợ.
- **Chạm vào nhân vật** để nhân vật phản ứng và nói câu theo tình trạng thật.
- **Animation và âm thanh:** nhân vật vươn vai, ngáp, dụi mắt, ôm đầu tùy giấc ngủ đêm trước; phản ứng theo sự kiện; âm thanh tổng hợp có nút tắt tiếng.
- **Nhật ký cuối ngày** và **tổng kết tuần** với danh hiệu.

## Cấu trúc thư mục

```
index.html        Khung trang và danh sách file cần nạp (thứ tự nạp quan trọng, đừng đổi chỗ)
css/              Giao diện: bố cục và màu sắc, nhân vật và điện thoại, animation
js/
  du-lieu/        Con số cân bằng (BAL) và nội dung: task, câu hỏi phỏng vấn, hoạt động
  loi/            Trạng thái game, lưu game, lịch, vòng lặp ngày, xếp lịch trong ngày, nếp sinh hoạt và tua nhanh
  he-thong/       Giấc ngủ và năng lượng, tài chính (FIN), chỉ số, ăn uống, CV, điện thoại, gặp gỡ
  canh/           Các cảnh: tìm việc, đi làm, đời sống
  su-kien/        Sự kiện, gia cảnh, nhờ vả, ngày lương, trả nợ, các mốc theo thời gian
  hinh-anh/       Danh mục đồ, nhân vật chibi, bối cảnh, animation và âm thanh (ANIM)
  the-gioi/       Bộ máy đi lại tự do (dùng chung cho nhà và văn phòng): bản đồ ba căn nhà, điều khiển, va chạm và tìm đường, nối đồ vật với lựa chọn
  van-phong/      Văn phòng đi lại được: đồ đạc, bốn kiểu văn phòng của các công ty, đồng nghiệp, kỷ luật, một ngày làm việc
  song/           Thế giới sống: lịch sinh hoạt theo giờ của từng NPC, bộ máy hành vi (đi lại, ngồi, việc xen, giữ chỗ), dấu hiệu trên đầu, dân số theo giờ, phố và ngõ, người quen ngoài phố, sự kiện thế giới, trí nhớ của NPC, nét mặt theo tình huống
  pho/            Ra phố: bản đồ phố và ngõ nhà, bên trong 8 địa điểm, hồ Bán Nguyệt, xe máy, chuyện bất ngờ
  tro-choi/       Trò chơi nhỏ khi làm task: khung chung và bốn trò (bắt bug, xếp code, gõ lệnh, nối dây)
  giao-dien/      Màn chơi, tổng kết tuần, màn mở đầu, hồ sơ
tests/            Kiểm thử tự động (chạy bằng Node.js)
docs/             Ghi chú thiết kế
CHANGELOG.md      Lịch sử các phiên bản
```

Muốn sửa gì thì mở file nào:

| Muốn sửa | Mở file |
|---|---|
| Con số cân bằng (năng lượng, điểm cộng…) | `js/du-lieu/can-bang.js` |
| Tiền, lương, hóa đơn | `js/he-thong/tai-chinh.js` |
| Nghỉ phép: số ngày phép, điều kiện duyệt, bàn giao, hoạt động cả ngày | `js/he-thong/nghi-phep.js` |
| Task, câu hỏi phỏng vấn, hoạt động tự do | `js/du-lieu/noi-dung.js` |
| Sự kiện, số ngày chờ trước khi lặp lại | `js/su-kien/su-kien.js` |
| Nhận xét của trưởng nhóm, Tùng trả nợ, tổng kết tháng | `js/su-kien/moc-thoi-gian.js` |
| Ngày bắt đầu, ngày kết thúc, ngày lễ, câu trên lịch bóc | `js/loi/lich.js` |
| Việc nào tự chạy, nếp mặc định, cách tua | `js/loi/nep-sinh-hoat.js` |
| Tin nhắn điện thoại | `js/he-thong/dien-thoai.js` |
| Hình nhân vật, kiểu tóc, quần áo | `js/hinh-anh/chibi.js`, `js/hinh-anh/danh-muc-do.js` |
| Tốc độ animation, âm thanh | `js/hinh-anh/animation-am-thanh.js` |
| Văn phòng sống: vị trí bàn, tốc độ đi, các việc riêng và sự kiện diễn ra thế nào | `js/hinh-anh/san-khau.js` |
| Tính cách từng người, câu họ nói với bạn và với nhau | `js/du-lieu/tinh-cach.js` |
| Xác suất có sự kiện văn phòng, có người nghỉ phép; cách xếp lịch mỗi ngày | `js/hinh-anh/lich-van-phong.js` |
| Cảnh sống ở nhà và nơi khác: chỗ đứng, tư thế theo việc, lịch của người ở cùng | `js/hinh-anh/dia-diem.js` |
| Tự đi lại trong nhà: tốc độ đi, tốc độ đồng hồ, cỡ nhân vật, tắm mất bao lâu; vị trí đồ đạc từng căn nhà | `js/the-gioi/ban-do-nha.js` (bảng `ROAM`, `HOUSES`) |
| Đồ vật nào làm được việc gì, hết giờ thì tự chọn gì, khung giờ từng cảnh | `js/the-gioi/tuong-tac.js` |
| Văn phòng từng công ty: bề rộng các khu, màu, đồ trang trí riêng | `js/van-phong/ban-do-cong-ty.js` |
| Hình vẽ đồ văn phòng (bàn máy tính, bảng trắng, máy nước, con mèo…) | `js/van-phong/do-dac-van-phong.js` |
| Khung giờ trong ngày làm việc, việc nhỏ ở văn phòng (cà phê…), việc nào làm ở đâu | `js/van-phong/ngay-lam-viec.js` (bảng `VP`) |
| Đồng nghiệp ra pantry bao lâu một lần, tư thế ngồi | `js/van-phong/dong-nghiep.js` |
| Kỷ luật: rời bàn bao lâu thì bị nhắc, mức trừ | `js/van-phong/ky-luat.js` (bảng `KY_LUAT`) |
| Trò chơi nhỏ: thời gian, mức cộng trừ tối đa | `js/tro-choi/khung-tro-choi.js` (bảng `MG`) |
| Câu đố của trò chơi nhỏ cho từng task, task nào chơi trò nào | `js/du-lieu/tro-choi.js` |
| Lịch sinh hoạt của Tùng, bố mẹ, đồng nghiệp; chỗ ngồi trong nhà; việc xen | `js/song/lich-npc.js` (`HOME_DAY`, `VP_DAY`, `SONG_SPOTS`, `SONG_BEAT`, bảng `SONG`) |
| NPC tự làm việc của mình: đi, ngồi, giữ chỗ, dấu hiệu | `js/song/hanh-vi-npc.js` |
| Quan hệ giữa các NPC: mức ban đầu, giới hạn mỗi ngày, ngưỡng thân / lạnh | `js/song/quan-he-npc.js` (bảng `NPCREL`) |
| Câu nói giữa các NPC: chào, nói chuyện, hỏi việc, từ chối, bố mẹ, rủ về, ăn bánh | `js/du-lieu/xa-giao.js` |
| NPC giao tiếp với nhau, sự kiện nhỏ (rủ về, chị Mai mang bánh) | `js/song/xa-giao-npc.js` (bảng `XGK`) |
| Phố: vị trí, tên, màu các địa điểm; ngõ nhà từng hoàn cảnh | `js/pho/ban-do-pho.js` (`PHO_DOORS`, `PHO_LANE`) |
| Bên trong các địa điểm: đồ đạc, người có mặt, việc nào làm ở đâu | `js/pho/noi-that-quan.js`, `js/pho/noi-that-lon.js`, `js/pho/ho-ban-nguyet.js` |
| Giờ mở cửa, cà phê mang về, bia hơi, việc nhỏ ở các quán | `js/pho/di-pho.js` (`PHO_OPEN`, `PHOK`) |
| Xe máy: tốc độ, tiền xăng | `js/pho/xe-may.js` (bảng `XE`) |
| Chuyện bất ngờ trên phố: xác suất, giá bánh mì, mưa, tắc đường | `js/pho/gap-tren-pho.js` (bảng `GAP`) |
| Nằm thêm sau báo thức, chuẩn bị nhanh nhất mất bao lâu | `js/du-lieu/can-bang.js` (`SNOOZE_*`, `PREP_FAST`) |
| Các động tác (đi, ngồi, gõ phím, nghĩ, nói, nghe, cười, uống, đi xe…) | `css/dong-tac.css` |
| Màu sắc, cỡ chữ | `css/giao-dien.css` |
| Màn hình mở đầu: mật độ người và xe, nhạc nền, hộp thoại Cài đặt, số phiên bản | `js/giao-dien/man-mo-dau.js`, `css/mo-dau.css` |

Các file dùng chung biến với nhau và được nạp lần lượt theo danh sách trong `index.html`. Khi thêm file mới, nhớ thêm một dòng `<script src="...">` vào đúng vị trí, và tránh đặt trùng tên biến với file khác.

## Chạy kiểm thử

Cần cài [Node.js](https://nodejs.org/) (bản 18 trở lên).

```bash
cd tests
npm install
npm test              # kiểm thử hệ thống, tài chính, các mốc 56 ngày + 20 lượt chơi ngẫu nhiên trọn 56 ngày
npm run 56-ngay       # lịch, các mốc, tua nhanh, lưu và tải lại, bản lưu cũ, tính cách, xin nghỉ phép
npm run van-phong     # ngày làm việc có sự kiện bất ngờ, chạy trong trình duyệt thật (cần Playwright, mất khoảng 3 phút)
npm run the-gioi      # tự đi lại trong nhà: phím, va chạm, đồng hồ, dùng đồ, đi ngủ, joystick trên điện thoại (cần Playwright, khoảng 1 phút)
npm run van-phong-di-lai  # văn phòng đi lại được: 8 văn phòng, họp, task, 4 trò chơi nhỏ, kỷ luật, tan làm (cần Playwright, khoảng 3 phút)
npm run ra-pho        # ra phố: ngõ nhà, 8 địa điểm, xe máy, chuyện bất ngờ, hẹn gặp (cần Playwright, khoảng 4 phút)
npm run the-gioi-song # thế giới sống: lịch theo giờ, NPC tự sinh hoạt ở nhà và công ty (cần Playwright, khoảng 3 phút)
npm run xa-giao       # thế giới sống phase 2: quan hệ, nói chuyện, chào, từ chối, rủ về, ăn bánh (cần Playwright, khoảng 3 phút)
npm run thanh-pho     # thế giới sống phase 3: dân số theo giờ, phố, mưa, Tùng/Linh ngoài phố, sự kiện thế giới (cần Playwright, khoảng 2 phút)
npm run tri-nho       # thế giới sống phase 4: NPC nhớ chuyện cũ, nhắc lại, nét mặt, hiệu năng (cần Playwright, khoảng 1 phút)
npm run sua-loi-17-4  # v17.4: các lỗi sửa sau lần kiểm tra toàn diện (cần Playwright, khoảng 2 phút)
npm run hoi-thoai     # v17.5 phase 1: bắt chuyện có trí nhớ, theo nơi, giờ, mức thân; khách lạ nói theo nơi (cần Playwright, khoảng 2 phút)
npm run quan-song     # v17.5 phase 2: nhân viên phục vụ, vòng đời khách, gọi đồ, ngồi cùng bàn, mời người quen (cần Playwright, khoảng 4 phút)
npm run gia-dinh-cong-viec # v17.5 phase 3: ngày làm việc đặc biệt, bố mẹ trò chuyện, hỏi han khi đi làm về (cần Playwright, khoảng 3 phút)
# Công cụ kiểm tra toàn diện (quan sát, chơi thử, hiệu năng, bản lưu cũ): xem tests/audit/README.md
npm run mo-dau        # màn hình mở đầu: âm thanh, ra vào, chuyển tab, bản lưu hỏng, giảm chuyển động, hiệu năng (cần Playwright, khoảng 3 phút; thêm DAI=1 để để yên 5 phút)
npm run ngau-nhien    # 40 lượt chơi ngẫu nhiên trọn 56 ngày
npm run can-bang      # so sánh 5 cách sống trong 56 ngày để kiểm tra cân bằng (mất vài phút)
npm run tai-chinh     # kiểm thử sổ hóa đơn và mô phỏng tài chính cả tháng
npm run hai-thang     # mô phỏng hai tháng, so sánh thu xếp sớm và phút chót
```

## Hướng phát triển

Xem `docs/quyet-dinh-thiet-ke.md` và mục "Để lại cho bản sau" trong `CHANGELOG.md`.
