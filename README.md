# Life & Career Simulation

Game mô phỏng cuộc sống và sự nghiệp của một người trẻ Việt Nam: vừa tốt nghiệp ngành Công nghệ thông tin, đi tìm việc, đi làm, xoay xở tiền nhà, giữ sức khỏe và các mối quan hệ. Mỗi lựa chọn nhỏ hôm nay có thể ảnh hưởng đến những ngày sau.

Bối cảnh là thành phố hư cấu **Hà Thành**, mang chất Hà Nội. Giọng văn hài hước nhẹ nhàng, nhân vật vẽ theo phong cách **chibi 2D**.

## Chơi thử

- Chơi trực tiếp: https://mrbaobao1112.github.io/life-career-simulation/
- Hoặc tải về và mở file `index.html` bằng trình duyệt. Không cần cài đặt gì.

Bản chơi thử hiện tại là **tuần đầu tiên sau khi tốt nghiệp** (7 ngày trong game). Tiến trình được tự động lưu trong trình duyệt.

## Tính năng hiện có

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
index.html        Toàn bộ game (HTML, CSS, JavaScript trong một file)
tests/            Kiểm thử tự động (chạy bằng Node.js)
docs/             Ghi chú thiết kế
CHANGELOG.md      Lịch sử các phiên bản
```

Các con số cân bằng (tiền, lương, tốc độ hồi phục năng lượng…) nằm trong hằng số `BAL` ở đầu phần JavaScript của `index.html`, có chú thích để dễ chỉnh khi thử nghiệm.

## Chạy kiểm thử

Cần cài [Node.js](https://nodejs.org/) (bản 18 trở lên).

```bash
cd tests
npm install
npm test              # kiểm thử hệ thống + 30 lượt chơi ngẫu nhiên
npm run ngau-nhien    # 50 lượt chơi ngẫu nhiên trọn tuần
npm run can-bang      # so sánh 5 chiến lược chơi để kiểm tra cân bằng
npm run tai-chinh     # kiểm thử sổ hóa đơn và mô phỏng tài chính cả tháng
npm run hai-thang     # mô phỏng hai tháng, so sánh thu xếp sớm và phút chót
```

## Hướng phát triển

Xem `docs/quyet-dinh-thiet-ke.md` và mục "Để lại cho bản sau" trong `CHANGELOG.md`.
