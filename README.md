# Life & Career Simulation

Game mô phỏng cuộc sống và sự nghiệp của một người trẻ Việt Nam: vừa tốt nghiệp ngành Công nghệ thông tin, đi tìm việc, đi làm, xoay xở tiền nhà, giữ sức khỏe và các mối quan hệ. Mỗi lựa chọn nhỏ hôm nay có thể ảnh hưởng đến những ngày sau.

Bối cảnh là thành phố hư cấu **Hà Thành**, mang chất Hà Nội. Giọng văn hài hước nhẹ nhàng, nhân vật vẽ theo phong cách **chibi 2D**.

## Chơi thử

- Chơi trực tiếp: https://mrbaobao1112.github.io/life-career-simulation/
- Hoặc tải cả thư mục về (phải có đủ `index.html`, `css/` và `js/`) rồi mở file `index.html` bằng trình duyệt. Không cần cài đặt gì.

Bản chơi thử hiện tại là **tám tuần đầu tiên sau khi tốt nghiệp** (56 ngày trong game, từ 16/11/2026 đến 10/1/2027). Tiến trình được tự động lưu trong trình duyệt.

## Tính năng hiện có

- **Nếp sinh hoạt:** việc thường ngày (ăn, ngủ, họp đầu ngày, tắc đường) tự diễn ra theo nếp của nhân vật và hiện thành nhật ký trong ngày; người chơi chỉ quyết định việc đáng quyết định. Đổi nếp bất cứ lúc nào bằng nút “Nếp sinh hoạt”.
- **Văn phòng sống (thử nghiệm):** trong ngày đi làm, văn phòng là một sân khấu: nhân vật đi xe máy tới, vào cửa, chào đồng nghiệp, ngồi gõ phím; đồng nghiệp tự đi lấy nước, sang bàn nhau trò chuyện, đi họp, rồi lần lượt ra về. Chạm vào ai thì người đó phản ứng. Bật tắt trong “Nếp sinh hoạt”.
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
| Task, câu hỏi phỏng vấn, hoạt động tự do | `js/du-lieu/noi-dung.js` |
| Sự kiện, số ngày chờ trước khi lặp lại | `js/su-kien/su-kien.js` |
| Nhận xét của trưởng nhóm, Tùng trả nợ, tổng kết tháng | `js/su-kien/moc-thoi-gian.js` |
| Ngày bắt đầu, ngày kết thúc, ngày lễ, câu trên lịch bóc | `js/loi/lich.js` |
| Việc nào tự chạy, nếp mặc định, cách tua | `js/loi/nep-sinh-hoat.js` |
| Tin nhắn điện thoại | `js/he-thong/dien-thoai.js` |
| Hình nhân vật, kiểu tóc, quần áo | `js/hinh-anh/chibi.js`, `js/hinh-anh/danh-muc-do.js` |
| Tốc độ animation, âm thanh | `js/hinh-anh/animation-am-thanh.js` |
| Văn phòng sống: vị trí bàn, lịch riêng và câu nói của đồng nghiệp | `js/hinh-anh/san-khau.js` |
| Màu sắc, cỡ chữ | `css/giao-dien.css` |

Các file dùng chung biến với nhau và được nạp lần lượt theo danh sách trong `index.html`. Khi thêm file mới, nhớ thêm một dòng `<script src="...">` vào đúng vị trí, và tránh đặt trùng tên biến với file khác.

## Chạy kiểm thử

Cần cài [Node.js](https://nodejs.org/) (bản 18 trở lên).

```bash
cd tests
npm install
npm test              # kiểm thử hệ thống, tài chính, các mốc 56 ngày + 20 lượt chơi ngẫu nhiên trọn 56 ngày
npm run 56-ngay       # lịch, các mốc, tua nhanh, lưu và tải lại, bản lưu cũ
npm run ngau-nhien    # 40 lượt chơi ngẫu nhiên trọn 56 ngày
npm run can-bang      # so sánh 5 cách sống trong 56 ngày để kiểm tra cân bằng (mất vài phút)
npm run tai-chinh     # kiểm thử sổ hóa đơn và mô phỏng tài chính cả tháng
npm run hai-thang     # mô phỏng hai tháng, so sánh thu xếp sớm và phút chót
```

## Hướng phát triển

Xem `docs/quyet-dinh-thiet-ke.md` và mục "Để lại cho bản sau" trong `CHANGELOG.md`.
