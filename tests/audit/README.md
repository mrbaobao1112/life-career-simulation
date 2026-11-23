# Công cụ kiểm tra toàn diện (audit)

Các script dùng cho lần kiểm tra v17.3 (`docs/AUDIT_REPORT_v17.3.md`). Chúng **không phải** bộ kiểm thử đạt/không đạt: chúng chạy game trong trình duyệt thật, đo và ghi lại hành vi để người xem đánh giá. Không script nào sửa mã nguồn game.

- Cần Playwright và Chromium như các bài kiểm thử khác (`NODE_PATH=$(npm root -g)` nếu Playwright cài toàn cục).
- Kết quả (JSON, ảnh chụp) ghi vào `tests/audit/ket-qua/`; thư mục này không đưa lên git.
- Nên chạy khi máy rảnh. Chạy song song nhiều script làm số đo FPS và thời gian chờ sai lệch.

| Script | Làm gì | Ví dụ chạy | Thời gian |
|---|---|---|---|
| `quan-sat.js` | Đứng quan sát một cảnh N phút thật. Mỗi 0,2 giây đọc vị trí thật trên màn hình của từng NPC, rồi đếm: hiện ra/biến mất trong khung nhìn, đứng chồng nhau khi cùng đứng yên, chân trong đồ đạc khi đang đi, đứng yên bao lâu, câu nói, dấu hiệu, lịch hoạt động | `node quan-sat.js cafe tro '{"day":8,"h":15,"at":"in:cafe"}' 5` (văn phòng: `'{"office":true,"day":10,"h":10}'`) | N phút |
| `tom-tat.py` | Tóm tắt kết quả của `quan-sat.js` | `python3 tom-tat.py cafe` | tức thì |
| `di-chuyen.js` | Phím WASD, mũi tên, đi chéo, chạy, đổi hướng liên tục, hoạt ảnh, va chạm (đi ngẫu nhiên 90 giây), thực đơn, camera, thứ tự trước/sau, chuyển cảnh liên tục, đi bằng cửa, joystick điện thoại | `node di-chuyen.js` | khoảng 4 phút |
| `tri-nho.js` | Trí nhớ NPC đầu–cuối: bấm nút thật trong sự kiện, lưu, tải lại trang, hôm sau đi bộ đến gặp NPC | `node tri-nho.js` | khoảng 1 phút |
| `ban-luu-cu.js` | Chơi bằng một bản cũ đến ngày N, lấy bản lưu, mở bằng bản hiện tại và chơi tiếp đến hết 56 ngày (jsdom) | `git worktree add ../../../cu v16.1-commit` rồi `node ban-luu-cu.js ../../../cu 18 11` | vài phút |
| `choi-thu.js` | Bot chơi như người N phút thật, không tua nhanh. Chụp màn hình ở phút 1, 5, 15, 30, 45, 60; ghi nhịp chơi, cảnh đã gặp, chỉ số. Cuối lượt ép dọn bộ nhớ rồi đếm nút trang | `node choi-thu.js 60 pc` | N phút |
| `hieu-nang.js` | FPS, khung hình chậm, CPU, bộ nhớ, thời gian tải và chuyển cảnh; 3 cấu hình: máy bàn, laptop (CPU chậm 4 lần), điện thoại (iPhone 13, CPU chậm 6 lần) | `node hieu-nang.js` (hoặc `node hieu-nang.js mobile`) | khoảng 3 phút |
| `chay-lau.js` | Chạy liên tục N phút, đổi cảnh mỗi 90 giây; mỗi phút đo FPS, bộ nhớ, số nút trang | `node chay-lau.js 30` | N phút |
| `trai-nghiem.js` | (v17.6) Bot chơi N ván 56 ngày bằng nút bấm, đếm ngày nhạt, sự kiện lặp, hoạt động được chọn, ngày nghỉ có ra ngoài, chuyện NPC còn nhớ | `node trai-nghiem.js 12` | khoảng 3 phút |
| `dem-chu.js` | (v17.7) Đếm chữ người chơi phải đọc: mô tả, lựa chọn, kết quả, lời thoại, tin nhắn, nhật ký, tổng kết tuần; theo ngày và theo cảnh | `node dem-chu.js 6` | khoảng 3 phút |
| `tim-ro.js` | Chơi vài phút rồi chụp bộ nhớ, tìm nút trang đã tách khỏi trang mà còn bị giữ, và in chuỗi giữ | `node tim-ro.js world 240` | khoảng 5 phút |

**Lưu ý khi đọc số:**
- Đặt giờ cho cảnh phải nằm trong khung giờ của buổi đó (ví dụ buổi chiều từ 13:30). Nếu kéo đồng hồ lùi sau khi cảnh đã dựng, NPC sẽ “đi ra rồi đi vào lại”; đó là do công cụ, không phải lỗi game.
- Khi điều khiển trang bằng Playwright, đừng giữ tham chiếu phần tử (`page.$`) qua nhiều vòng lặp: trình duyệt sẽ không dọn được các phần tử đó, và số nút trang tăng giả.
- Ngoài khung nhìn, game cố ý dịch chuyển thẳng NPC cho nhẹ máy; các số “đi xuyên đồ vật” chỉ tính lúc NPC đang đi trong khung nhìn.
