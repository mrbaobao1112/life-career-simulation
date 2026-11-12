# Lịch sử phiên bản

## v12.1: Nghỉ phép gọn lại, đúng ngày công (hiện tại)
Sau khi rà soát v12. Không đổi giao diện, không thêm tính năng; không đổi công thức lương.
- Xin nghỉ là báo cho cấp trên: chị Hạnh không còn từ chối hay đề xuất đổi ngày vì lý do, quan hệ hay “team thiếu người”. Lý do là chuyện riêng, không ảnh hưởng kết quả. Chỉ còn các chặn sổ sách: trùng đơn, không đủ ngày phép, tối đa 5 ngày làm việc.
- Còn hai loại: nghỉ phép và nghỉ không lương. Bỏ loại nghỉ ốm (và điều kiện “phải thật sự ốm”, chuyện bị bắt gặp khi đi chơi).
- Thử việc chỉ còn một định nghĩa, trùng với bảng lương: tháng nào hưởng 85% thì tháng đó là thử việc. Trong thử việc, mọi ngày nghỉ đều không tính công.
- Ngày phép: chỉ cộng khi đã chính thức, 1 ngày vào ngày 1 mỗi tháng (12 ngày mỗi năm). Xét theo ngày nghỉ chứ không theo ngày báo, nên cuối thử việc đã báo được nghỉ phép cho ngày đầu chính thức. Hết phép thì nghỉ không lương.
- Bàn giao vẫn bắt buộc khi nghỉ từ 3 ngày hoặc đang có việc dở. Yêu cầu bàn giao để quá ngày nghỉ thì hết hiệu lực.
- Cái giá của việc nghỉ: ngày công, và chị Hạnh kém vui hơn khi nghỉ dài, báo sát giờ hoặc nghỉ dồn dập.
- Báo nghỉ được ngay sáng hôm đó; tiền xăng đã trừ lúc ngủ dậy được trả lại.
- Sửa lỗi: đơn nhiều ngày bị tính chung một trạng thái có lương hay không; đồng ý với một đề xuất đã quá hạn làm đơn bị ghi vào quá khứ và trừ lương ngày đã đi làm.
- Đơn của bản v11 và v12 (kể cả nghỉ ốm cũ) vẫn có hiệu lực và không làm đổi lương.
- Kiểm thử: 21 mục cho nghỉ phép, gồm nghỉ một ngày, hai ngày liên tiếp, nhiều lần trong tháng, vắt qua hai tháng, nghỉ phép ngay sau thử việc, vắt qua cuối tuần, lưu và tải lại, yêu cầu bàn giao đang chờ và quá hạn.

## v12: Hệ thống nghỉ phép
Thay bản xin nghỉ tối giản của v11 bằng một hệ thống riêng (`js/he-thong/nghi-phep.js`). Hệ thống này chỉ quyết định “hôm nay có phải đi làm không”; làm gì trong ngày nghỉ vẫn là màn chọn việc lúc rảnh, nên sau này thêm du lịch không phải sửa phần nghỉ phép.
- Ba loại nghỉ: nghỉ phép (có lương, trừ ngày phép), nghỉ ốm (có lương 1 ngày mỗi tháng, chỉ xin được khi sức khỏe hoặc năng lượng thật sự thấp, xin được ngay sáng hôm đó), nghỉ không lương (không tính công).
- Ngày phép: mỗi tháng tích lũy 1 ngày, mọi công ty như nhau. Đang thử việc thì chưa dùng được, muốn nghỉ chỉ có nghỉ không lương hoặc nghỉ ốm.
- Đơn nghỉ một ngày hoặc nhiều ngày liền (tối đa 5 ngày làm việc). Cuối tuần và ngày lễ nằm giữa không bị tính; cả kỳ nghỉ không quay lại lịch đi làm.
- Chị Hạnh xét đơn theo quan hệ, xin sớm hay muộn, số ngày, vừa nghỉ gần đây chưa, có lỗi treo không: duyệt, từ chối, đề xuất đổi ngày (đồng ý hoặc rút đơn), hoặc duyệt kèm yêu cầu bàn giao.
- Bàn giao cho Phong (ít phiền, dễ bị làm sót) hoặc anh Dũng (phiền hơn, chắc tay). Việc bị làm sót quay lại thành lỗi vào ngày đi làm lại.
- Nghỉ từ 3 ngày: bắt buộc bàn giao, ngày đầu đi làm lại tốn sức bắt nhịp. Đồng nghiệp nhắc tới việc bạn vừa nghỉ.
- Nghỉ không lương trừ thẳng vào ngày công của kỳ lương tới; bảng lương ghi rõ số ngày bị trừ.
- Hoạt động cả ngày vào ngày không phải đi làm: về quê thăm bố mẹ, giải quyết việc cá nhân (bảo dưỡng xe: 30 ngày sau xe không chết máy giữa đường ngập), đi chơi cả ngày với bạn (tùy hôm bạn có rảnh). Chọn rồi thì chiều và tối không còn giờ rảnh.
- Ngày nghỉ ốm: có thêm đi khám, không có hoạt động cả ngày; ra ngoài chơi có thể bị chị Mai bắt gặp.
- Hồ sơ hiện số ngày phép. Đơn nghỉ của bản v11 được chuyển sang hệ thống mới.

Chưa làm: nghỉ nửa ngày, du lịch, hủy đơn đã duyệt, nhận bàn giao khi đồng nghiệp nghỉ.

## v11: Mỗi người một tính cách
Tài chính, sức khỏe và công thức chỉ số không đổi.
- Tính cách thành dữ liệu điều khiển hành vi (`js/du-lieu/tinh-cach.js`): hòa đồng, tập trung, hay đùa, nói ngắn. Người hòa đồng rời bàn và bắt chuyện nhiều hơn; người tập trung gõ lâu, ít nghỉ; người hay đùa hay cười sau câu chuyện. Hồ sơ hiện một dòng tính cách lấy từ cùng bảng này.
- Lịch động (`js/hinh-anh/lich-van-phong.js`): lịch của từng đồng nghiệp được xếp lại mỗi ngày theo tính cách và độ thân, không còn một chu kỳ lặp lại.
- Sự kiện văn phòng chèn lên lịch: họp đột xuất (chị Hạnh gọi vài người ra phòng họp), lỗi khẩn cấp (một người chạy sang báo, người kia sửa gấp), chạy hạn chót (cả phòng cắm mặt làm, chị Hạnh đi một vòng). Hết sự kiện, mọi người làm tiếp lịch đang dở. Chỉ ảnh hưởng đồng nghiệp, không kéo nhân vật chính vào.
- Có ngày một đồng nghiệp nghỉ phép: bàn trống, có biển nhỏ.
- Văn phòng nhớ diễn biến trong ngày: đổi thẻ giữa lúc đang họp thì người đi họp vẫn vắng mặt và quay về đúng lúc.
- Chủ động bắt chuyện: đồng nghiệp tự sang bàn bạn; ở nhà, bố mẹ hoặc Tùng tự đến nói vài câu. Câu nói chọn theo chuyện vừa xảy ra (đi muộn, OT hôm qua, lương về, lỗi còn treo), công việc đang làm, độ thân, rồi mới đến tán gẫu theo tính cách. Hai bên nói và nghe theo lượt, có lúc cùng cười. Không có lựa chọn.
- Mỗi lần được bắt chuyện làm thân hơn 1 điểm, nhiều nhất 3 lần mỗi ngày.
- Ở nhà: người ở cùng có buổi đi vắng.
- Xin nghỉ phép qua điện thoại: nhắn chị Hạnh từ hôm trước; mỗi tháng một ngày, chị Hạnh hơi kém vui; bị từ chối nếu đang có việc dở hoặc trùng buổi nhận xét. Ngày nghỉ phép vẫn tính công.
- Mỗi người chỉ do một việc điều khiển tại một thời điểm; người đi trên lối không đi chéo, chờ khi cả hai hàng đang có người.
- Sửa lỗi phát hiện khi kiểm thử: người đi họp có thể không quay lại nếu cuộc họp kết thúc trước khi họ ra tới cửa; người đang đi chỉ được tính ở điểm đến nên người khác có thể đi xuyên qua.
- Bộ đếm khung hình mỗi giây, bật trong “Nếp sinh hoạt”, để đo độ mượt trên điện thoại thật.
- Kiểm thử mới `kiem-thu-van-phong.js` chạy trong trình duyệt thật: một ngày có sự kiện bất ngờ.

Chưa làm: các chuyến đi ngắn (lấy nước, sang bàn nhau) chưa được nhớ khi đổi thẻ, chỉ sự kiện và người nghỉ phép được nhớ; ở nhà mới có bắt chuyện và đi vắng, chưa có sự kiện chèn lịch như văn phòng.

## v10: Động tác tự nhiên
Theo góp ý “nhân vật giống hình minh họa bị kéo đi trên nền”. Luật chơi, tài chính, sức khỏe và lưu game không đổi.
- Sửa lỗi gốc: ở v8 và v9, động tác tay được gắn vào lớp tay đang bị ẩn nên tay gần như không cử động. Giờ mỗi động tác bật đúng lớp tay của nó.
- Nhân vật có thêm khớp: đùi và bắp chân tách riêng, miệng mấp máy khi nói, tay cầm được cốc, tài liệu, điện thoại.
- Bộ động tác tách ra file riêng `css/dong-tac.css`, mỗi động tác một khối: đi, chạy, ngồi xuống, đứng dậy, gõ phím, suy nghĩ, đọc, nói, nghe, cười, uống, nhấp ngụm nước, ăn, điện thoại, chơi game, quét dọn, nấu ăn, ngủ, ngồi xe máy, xuống xe.
- Đi bộ: số bước tính theo quãng đường nên chân không còn trượt; gối gập khi nhấc chân, tay vung ngược nhịp, thân nhún mỗi bước, tăng giảm tốc ở hai đầu, đổi hướng thì quay người trước.
- Ngồi và đứng: nhún người đứng dậy, lách ra mép bàn rồi mới bước đi; về thì lách vào ghế và ngồi xuống.
- Làm việc là một chu kỳ: gõ, dừng nghĩ, nhấp ngụm nước, đọc tài liệu, vươn vai, gõ tiếp. Màn hình chỉ chạy chữ khi đang gõ.
- Đồng nghiệp có trạng thái rõ ràng (làm việc, đi, nói, nghe, uống, họp, nghỉ) và lịch riêng theo thứ tự thay cho ngẫu nhiên. Trao đổi theo lượt: đi tới, quay mặt vào nhau, người nói ra tay, người nghe gật đầu, có lúc cùng cười, rồi về việc cũ.
- Không đi xuyên qua nhau: lối đi có hai hàng, chỗ đứng được giữ trước, nhiều nhất hai đồng nghiệp rời bàn cùng lúc.
- Môi trường: cửa mở khi có người ra vào, đồng hồ chỉ giờ theo buổi và có kim giây, mây trôi ngoài cửa sổ, mưa ngoài cửa sổ vào ngày mưa, cốc trên bàn được cầm lên đặt xuống, ghế sau mỗi bàn.
- Bố cục: khung văn phòng cao hơn, nhân vật lớn hơn khoảng một phần tư, có chiều sâu (ở gần thì lớn hơn).
- Xe máy: nhân vật ngồi co chân trên xe, bánh xe quay, giảm tốc rồi dừng, bước xuống xe, đi vào cửa; lúc về thì lên xe và tăng tốc dần.
- Tan làm: chị Mai và Phong về trước; bạn đứng dậy, vươn vai, chào, những người còn lại chào đáp; rồi ra cửa.
- Dọn dẹp: mọi lệnh hẹn giờ của một cảnh được hủy khi chuyển cảnh.

Chưa làm: nút điện thoại nổi vẫn có thể che góc khung cảnh; ở nhà và nơi khác mới dùng động tác mới, chưa có trạng thái và lịch chặt chẽ như văn phòng; chạy, ăn, ngủ mới ở mức cơ bản.

## v9: Sống ở mọi nơi
Theo góp ý “nhiều phân cảnh vẫn chưa có animation”: mọi cảnh có hình giờ đều là cảnh sống. Luật chơi và con số không đổi.
- Tách phần lõi của sân khấu (đặt nhân vật, đi lại, bong bóng thoại, phản ứng khi chạm) để mọi địa điểm dùng chung; mỗi địa điểm khai báo bằng dữ liệu.
- Động tác mới dùng lại được: ăn, đọc, chơi game, nghe điện thoại, quét dọn, nấu ăn, chạy, ngủ.
- Ở nhà (cả ba kiểu nơi ở): thức dậy từ trên giường rồi vươn vai hoặc ngáp theo giấc ngủ đêm trước; ăn và học ở bàn; chơi game; xem phim trên giường; nằm nghỉ; quét dọn; lúc rảnh tự đi lại. Bố mẹ hoặc Tùng có việc riêng theo buổi và thỉnh thoảng đổi việc; khi có chuyện thì đi tới nói với bạn.
- Ngoài nhà: cà phê, trà đá, bia hơi (hai người lần lượt nói và uống), thư viện, chạy bộ quanh hồ, dạo trung tâm thương mại; có người qua lại phía sau.
- Phỏng vấn: ngồi chờ ở sảnh, rồi ngồi đối diện người phỏng vấn qua bàn.
- Công ty: thêm bữa trưa, ngày đầu đi làm (chị HR đi vào từ cửa) và OT buổi tối (văn phòng tối, vắng người).
- Trời mưa (ngày có sự kiện mưa): các cảnh ngoài trời và đoạn đi xe máy cũng có mưa.
- Chạm vào bất kỳ ai ở bất kỳ đâu: họ phản ứng và nói một câu.
- Kiểm thử: chín ngày đầu không còn cảnh hình tĩnh nào.

Chưa làm: quán ăn riêng (bữa ăn giờ tự chạy theo nếp nên hiếm khi hiện thành cảnh); đồ cầm tay theo động tác (bát đũa, chổi, sách); nhân vật thay quần áo; phân cảnh riêng cho các mốc lớn.

## v8 (thử nghiệm): Văn phòng sống
Lát cắt thử nghiệm hướng “thế giới đang sống”: một ngày đi làm ở công ty. Luật chơi và con số không đổi, chỉ thay phần hình của các cảnh ở công ty.
- Sân khấu văn phòng: hai dãy bàn, cửa ra vào, bảng công việc, góc lấy nước. Mỗi nhân vật có vị trí và đi lại được.
- Động tác mới dùng lại được: đi bộ (chân tách riêng), ngồi gõ phím, nói chuyện, cầm cốc uống, đi xe máy.
- Phân cảnh đến công ty: đi xe máy tới, xuống xe, vào cửa, đồng nghiệp chào, ngồi vào bàn. Phân cảnh tan làm: mọi người lần lượt ra về; tối OT thì bạn ở lại. Bấm nút là bỏ qua; tự bỏ qua khi tua nhanh.
- Đồng nghiệp có lịch riêng theo buổi: gõ phím, đi lấy nước, ra bảng công việc, sang bàn nhau trao đổi vài câu, chị Hạnh đi họp.
- Khi có sự kiện với đồng nghiệp (nhờ mua cà phê, sinh nhật, lỗi quay lại, nhận xét), người đó đi tới bàn bạn. Buổi sáng không có sự kiện thì vẫn có người ghé qua nói một câu.
- Chạm vào bất kỳ ai trên sân khấu: họ phản ứng và nói một câu. Chỉ để cho vui, không ảnh hưởng chỉ số.
- Bật tắt bằng ô “Văn phòng sống” trong “Nếp sinh hoạt” để so với hình tĩnh cũ. Khi thiết bị bật giảm chuyển động: nhân vật đứng yên đúng chỗ, bỏ các phân cảnh.

Chưa làm: các địa điểm khác (nhà, quán ăn, cà phê, công viên), thời tiết, lịch của nhân vật ngoài giờ làm, phân cảnh riêng cho các mốc lớn.

## v7: Nếp sinh hoạt và tám tuần đầu tiên
Đổi cách chơi theo góp ý “chơi giống làm bài test”, và kéo dài bản thử từ 7 ngày lên 56 ngày (16/11/2026 đến 10/1/2027).
- Nếp sinh hoạt: bữa ăn, giờ ngủ, họp đầu ngày, tắc đường, task buổi chiều tự diễn ra theo nếp của nhân vật và hiện thành một dòng trong nhật ký của ngày. Bữa ăn và giờ ngủ chỉ hỏi lần đầu; lựa chọn đó thành nếp. Đổi nếp bằng nút “Nếp sinh hoạt”. Mọi con số vẫn tính bằng đúng công thức cũ.
- Màn hình ngày: dải năm buổi, nhật ký những việc đã diễn ra kèm số tiền, giờ rảnh chọn bằng các ô nhỏ thay cho danh sách câu trả lời.
- Bớt nhãn cộng trừ: trên lựa chọn chỉ còn tiền, thời gian và rủi ro; kết quả hiện mũi tên lên xuống thay cho con số. Bật lại chi tiết trong “Nếp sinh hoạt”.
- Mỗi ngày đi làm còn một task cần quyết định; task buổi chiều làm theo cách quen tay. Lời rủ trà đá lúc tan làm chỉ thỉnh thoảng mới có.
- “Qua nhanh hôm nay” (có từ ngày đầu tiên) và “Tua đến…” ở cuối ngày: game tự chạy theo nếp, dừng ở mốc tiếp theo hoặc khi có việc cần quyết định, rồi hiện bảng tóm tắt. Trong lúc tua không có sự kiện bất ngờ và điện thoại im lặng.
- Lịch động: thứ, ngày, tháng tính từ 16/11/2026; nghỉ Tết Dương lịch 1/1; câu trên lịch bóc xoay vòng.
- Các mốc: nhận xét của chị Hạnh thứ Sáu 27/11 (bản ngắn), Tùng trả nợ cuối tháng (trả đủ, trả một nửa hoặc xin khất), hóa đơn 1/12, lương 10/12, tiền nhà 16/12, lương 10/1, góp tiền chợ, gửi tiền về nhà.
- Sự kiện và tin nhắn có số ngày chờ trước khi lặp lại, thay cho “chỉ một lần”.
- Chưa có việc thì mỗi thứ Hai được nộp hồ sơ lại vào công ty chưa từng nộp (thêm 4 công ty); có thể sửa lại CV trong giờ rảnh.
- Tổng kết mỗi Chủ nhật, tổng kết tháng vào sáng ngày 1, màn kết thúc ngày 10/1. Danh hiệu tính theo từng tuần.
- Bản lưu của bản 7 ngày chơi tiếp được sang ngày 8.
- Cân bằng: chuyên môn và kỹ năng mềm từ 55 trở lên tăng chậm hẳn, để sau 8 tuần không chạm trần 100.
- Kiểm thử mới `kiem-thu-56-ngay.js`; bài chơi ngẫu nhiên và bảng cân bằng chạy trọn 56 ngày.

Chưa làm trong bản này (để lại cho bản sau):
- Tuần 3 đến 8 còn ít nội dung mới: vẫn là khoảng 10 task và các sự kiện viết cho tuần đầu, lặp lại theo thời gian chờ.
- Chưa rút gọn câu chữ trong phỏng vấn, task và sự kiện; hoạt động xã hội chưa chuyển hẳn sang tin nhắn.
- Đánh giá thử việc đầy đủ; quan hệ chưa phai dần khi lâu không gặp.

## v6.1: Tách file, không đổi lối chơi
- Tách `index.html` (hơn 3.000 dòng) thành 3 file giao diện trong `css/` và 25 file theo từng hệ thống trong `js/` (dữ liệu cân bằng, tài chính, giấc ngủ và năng lượng, sự kiện, nhân vật chibi và bối cảnh, animation và âm thanh, giao diện, lưu game…). Chỉ cắt và chuyển chỗ, không sửa dòng lệnh nào.
- Game chơi y như v6; bản lưu cũ vẫn dùng được. Vẫn mở được bằng cách bấm đúp `index.html` và vẫn chạy trên GitHub Pages, không cần công cụ build.
- Kiểm thử: thêm `tests/nap-game.js` để ghép các file lại khi kiểm thử; 5 bài kiểm thử chỉ đổi dòng đọc file.
- README có bảng “Muốn sửa gì thì mở file nào”.

## v6: Tháng đầu thực tế và chạm vào nhân vật
- Lương thử việc 85%, tính theo ngày công: bắt đầu 18/11 thì lương nhận 10/12 chỉ khoảng 3,6 triệu (9/21 ngày công). Màn ngày lương hiện bảng tính chi tiết.
- Tạm ứng lương sau 10 ngày đi làm (tối đa 50% số đã làm), trừ vào lương kỳ sau.
- Kế hoạch tháng đầu: tối ngày thứ hai, người thuê trọ và ở ghép xem dự báo dòng tiền và chủ động thu xếp: xin gia đình (gia đình bình thường cho vay, hẹn trả khi có lương), hẹn chủ nhà đóng tiền nhà vào ngày lương (hỏi sớm không mất phí), nhờ Tùng ứng phần tiền nhà (ở ghép), vay Linh, tạm ứng lương. Có thể mở lại bất cứ lúc nào qua hoạt động "Tính toán tiền nong tháng này".
- Phút chót đắt hơn: xin gia đình áy náy gấp đôi, Tùng khó đồng ý hơn, xin nộp chậm sát hạn mất phí 5%.
- Sổ nợ và màn trả nợ khi đến hẹn: trả hết, trả một nửa, hoặc xin khất (ảnh hưởng quan hệ). Dự báo dòng tiền có tính các khoản nợ.
- Lương chỉ được nhận một lần mỗi kỳ, kể cả khi tải lại game.
- Chạm vào nhân vật (màn hình đầu, ảnh đại diện, trong khung cảnh): nhân vật vẫy tay, nhảy, xoay người hoặc ngáp nếu đang mệt, kèm câu nói theo tình trạng thật (đói, buồn ngủ, ví mỏng…). Nhân vật phụ cũng phản ứng với câu nói riêng.
- Kiểm thử hai tháng (đến 10/1): so sánh thu xếp sớm và phút chót.

## v5: Tài chính và gia cảnh
- Tiền khởi đầu mới: ở cùng bố mẹ 4 triệu, thuê trọ 4,5 triệu, ở ghép 3,5 triệu (tiền tiết kiệm làm thêm và tiền mừng tốt nghiệp).
- Sổ hóa đơn: mỗi khoản có mã kỳ, hạn, trạng thái; chỉ trả một lần, kể cả khi lưu và tải lại game.
- Chu kỳ tiền nhà tính từ ngày dọn vào (16/11), tháng sau đến hạn 16/12. Điện nước internet và cước điện thoại đến hạn ngày 1 hằng tháng. Xăng xe 15.000đ mỗi ngày ra ngoài.
- Khả năng duy trì cuộc sống: tính theo chi tiêu thật 7 ngày gần nhất, có hóa đơn sắp đến hạn và lương sắp nhận; hiện trong Hồ sơ và báo cáo tuần.
- Áp lực tài chính theo bậc: ổn định, lo lắng, căng thẳng, thiếu tiền; nhật ký chỉ nhắc khi đổi bậc.
- Lối ra khi thiếu tiền: vay Tùng hoặc Linh, xin nộp chậm tiền nhà (phí 5%), xin bố mẹ (theo gia cảnh), xin khất; ăn chịu hoặc nhịn khi hết tiền ăn.
- Tách gia cảnh (khá giả, bình thường, khó khăn) khỏi nơi ở; mỗi gia cảnh có một sự kiện đặc trưng trong tuần đầu.
- Ở cùng bố mẹ: góp tiền chợ 1 triệu/tháng sau khi có lương; về nhà sau 23 giờ thì bố mẹ phật lòng.
- Kiểm thử tài chính: sổ hóa đơn chống trừ trùng, mô phỏng cả tháng 3 nơi ở × 3 mức chi tiêu × có hoặc chưa có việc × 3 gia cảnh.
- Chưa hiện khi chơi (chờ kéo dài bản thử): hóa đơn 1/12, lương 10/12, tiền nhà 16/12, góp tiền chợ, gửi tiền về nhà, trả nợ bạn bè.

## v4: Animation và âm thanh
- Nhân vật chibi tách thành bộ phận cử động được: tay, đầu, mắt, thân.
- Chuyển động nền: chớp mắt, thở nhẹ.
- Animation thức dậy mỗi sáng theo dữ liệu đêm hôm trước: vươn vai (ngủ đủ), dụi mắt (hơi thiếu ngủ), ngáp (nợ ngủ nhiều), ôm đầu lắc lư (dư âm bia), giật mình kèm đồng hồ báo thức (ngủ quên).
- Animation cho sự kiện và kết quả lựa chọn: nhảy mừng khi nhận offer, xụi vai khi bị từ chối, lê bước sau OT, giật mình với sự kiện bất ngờ, gục xuống với sự kiện hậu quả; nhân vật phụ phản ứng (nhún vui, lắc đầu); người đang nói gật đầu theo từng câu thoại.
- Số dư đếm lùi hoặc tiến và nháy màu khi tiền thay đổi, thanh chỉ số nháy khi thay đổi.
- Âm thanh tổng hợp (không cần file ngoài): chuông báo thức, ngáp, vươn vai, xé lịch, tiền, tin nhắn, nhận offer, bị từ chối, sự kiện. Có nút bật hoặc tắt tiếng.
- Bấm vào khung cảnh để bỏ qua animation; tự tắt chuyển động khi thiết bị bật chế độ giảm chuyển động.

## v3: Logic một ngày
- Năng lượng buổi sáng tính cộng dồn: năng lượng tối qua + hồi phục khi ngủ, giới hạn trần, sau đó trừ nợ ngủ, dư âm bia, ngủ quá muộn. Có bảng giải thích từng dòng.
- Sửa lỗi cũ: năng lượng buổi sáng trước đây bị đặt lại theo số giờ ngủ, bỏ qua năng lượng tối hôm trước.
- Nợ ngủ tích lũy qua nhiều đêm, sự kiện "Cơ thể đòi nợ ngủ".
- Lịch trình buổi sáng: báo thức, chuẩn bị, thời gian đi xe máy theo nơi ở và công ty, ngủ quên, tắc đường, mưa. Chỉ muộn khi thật sự đến sau giờ hẹn.
- Công thức chỉ số: điểm cộng giảm dần khi chỉ số cao, lặp lại hoạt động thì giảm hiệu quả, mệt thì học kém, tinh thần phụ thuộc độ thân, tinh thần kéo dần về mức trung bình, áp lực tài chính.
- Thói quen ăn uống tính theo nhiều bữa, hồ sơ ăn uống, bữa ăn theo hoàn cảnh sống.
- CV có độ nổi bật, độ trung thực, danh sách kỹ năng; kỹ năng khai khống có thể bị hỏi vặn.
- Ba loại sự kiện có nhãn và nguyên nhân.
- Kiểu tóc gắn với giới tính, nút ngẫu nhiên đúng giới tính, khuôn mặt nam và nữ khác nhau.
- Kiểm thử cân bằng theo 5 chiến lược chơi.

## v2: Nhân vật chibi
- Nhân vật chibi vẽ theo lớp, biểu cảm theo trạng thái, trang phục theo bối cảnh.
- Tùy chỉnh ngoại hình, danh mục đồ sẵn sàng cho cửa hàng sau này.
- 11 nhân vật phụ, hội thoại kiểu truyện tranh, 12 bối cảnh minh họa.
- Điện thoại trong game, gặp gỡ chủ động.

## v1: Bản chơi thử dạng chữ
- Vòng lặp 7 ngày: tìm việc, phỏng vấn, đi làm, bữa ăn, giấc ngủ, sự kiện, nhật ký, tổng kết tuần.

## Để lại cho bản sau
- Chọn phương tiện đi lại (xe buýt, xe công nghệ).
- Nợ ngủ kéo dài ảnh hưởng sức khỏe mạnh hơn khi game dài hơn một tuần.
- Tên gợi ý ngẫu nhiên theo giới tính.
- Nút điện thoại nổi đôi khi che số liệu ở mép phải trên điện thoại.
- Hệ thống kiếm thêm và đầu tư trong game.
