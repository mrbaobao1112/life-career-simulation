# Báo cáo – Life & Career Simulation v17.7 (Phase 1: Đo thực tế để game dễ chơi hơn)

**Vấn đề (người làm game chơi thử):**
- Trò chơi nhỏ khó, xa lạ với người không biết code.
- Quá nhiều chữ nên chán.

**Quyết định:** giữ nghề lập trình nhưng làm game đơn giản cho mọi người chơi.
- Rút gọn câu chữ: giữ ý, bỏ câu đùa phụ.
- Vẫn 4 trò chơi nhỏ, nhưng đổi sang kiểu game phổ thông (ghép 3, nhảy tránh vật cản…).

**Phase 1 chỉ đo và lập kế hoạch, chưa sửa code game.** Đã thêm 2 thứ: công cụ đếm chữ và 4 bản phác thảo trò chơi mới.

## 0. Cách đo

- **Đếm chữ:** công cụ mới `tests/audit/dem-chu.js`. Bot chơi 6 ván trọn 56 ngày, đếm đúng chữ hiện trên màn hình lúc mỗi cảnh hiện ra:
  - tiêu đề và mô tả;
  - lời thoại;
  - chữ trên nút lựa chọn;
  - kết quả sau khi chọn;
  - tin nhắn;
  - nhật ký;
  - tổng kết tuần;
  - mẹo.

  Phần đang thu gọn (như "Xem cách tính") không tính. Một "từ" là một tiếng.
- **Chơi thử 15 phút đầu** trên điện thoại giả lập (iPhone 13): chụp từng màn hình, đếm chữ trên mỗi màn.
- **Trò chơi nhỏ:** đọc luật, đếm chữ và code phải đọc, thời gian, chụp màn hình.
- **Thuật ngữ:** quét câu chữ trong mã nguồn tìm từ nghề lập trình. Đây là ước lượng, vì có lẫn vài mã nội bộ.
- **Giới hạn:** bot không phải người thật. Tôi không đo được tỉ lệ người mới chơi thua thật, nên phần trò chơi nhỏ đánh giá bằng luật chơi và lượng chữ, code phải đọc.

## 1. Người chơi phải đọc bao nhiêu chữ

Trung bình mỗi ván (bot đọc mọi lời thoại; chế độ bấm thẻ):

| | Tổng | Mô tả cảnh | Lựa chọn | Kết quả | Lời thoại | Tin nhắn | Nhật ký | Tổng kết tuần | Mẹo |
|---|---|---|---|---|---|---|---|---|---|
| **Ngày 1** | **775** | 157 | 332 | 110 | 42 | 18 | 49 | 0 | 68 |
| **Tuần 1** | **4.032** | 1.064 | 1.297 | 577 | 174 | 117 | 286 | 367 | 151 |
| **56 ngày** | **20.485** | 5.797 | 5.297 | 2.777 | 441 | 672 | 2.191 | 2.849 | 460 |

- Đọc với tốc độ khoảng 200 từ/phút, **cả ván mất khoảng 100 phút chỉ để đọc**. Riêng tuần đầu khoảng 20 phút đọc.
- **Chữ trên nút lựa chọn chiếm 26%.** Mỗi màn giờ rảnh có 8 ô, mỗi ô kèm mô tả; mỗi lựa chọn có thêm thẻ gợi ý.
- Ngày 2 nặng nhất (khoảng 1.200 từ). Đó là ngày phỏng vấn (3 câu hỏi), tính toán tháng đầu (4 màn), gợi ý mục tiêu.

### Cảnh tốn chữ nhất (vừa dài vừa hay gặp: **ưu tiên số 1**)

| # | Cảnh | Từ mỗi ván | Lần mỗi ván | Từ mỗi lần | Vì sao dài |
|---|---|---|---|---|---|
| 1 | Thức dậy (`wake`) | 2.996 | 36,5 | 82 | Câu lịch bóc, đoạn tả giấc ngủ, đoạn tả hôm nay, bảng năng lượng, 3 lựa chọn có chú thích. Hiện gần như mỗi sáng. |
| 2 | Tổng kết tuần | 2.849 | 8 | khoảng 356 | Nhiều đoạn văn và bảng mỗi tuần |
| 3 | Giờ rảnh (`activity`) | 2.776 | 40,7 | 68 | 8 ô, mỗi ô có mô tả và gợi ý |
| 4 | Nhật ký cuối ngày (`dayReport`) | 2.436 | 36,2 | 67 | Đoạn tả ngày, thay đổi chỉ số, câu hẹn ngày mai, nút tua |
| 5 | Task | 1.606 | 15,5 | 104 | Câu giải thích "mỗi task là một lá bài…" lặp lại, thẻ task, 4 lựa chọn có chú thích |
| 6 | Tính toán tháng đầu (`plan`) | 1.013 | 1 (4 màn) | 124 mỗi màn | 4 màn liền, mỗi màn 150–220 từ |
| 7 | Thiếu ngủ (`ev:sleepdebt`) | 712 | 10 | 71 | Lặp mỗi sáng khi nợ ngủ cao |
| 8 | Hết giờ làm (`endwork`) | 469 | 7,7 | 61 | |
| 9 | Tăng ca (`ot`) | 464 | 6,7 | 70 | |
| 10 | Phỏng vấn HR (`iv_hr`) | 348 | 5,5 | 63 | |
| 11 | Báo cáo khi tua nhanh (`ffReport`) | 297 | 4,8 | 62 | |
| 12 | Rủ ai đi chơi (`hangout_pick`) | 237 | 2,8 | 84 | |

**Cảnh dài nhất mỗi lần hiện** (ít gặp hơn): báo thiếu tiền hóa đơn 133 từ, gợi ý mục tiêu 131, nộp lại hồ sơ 130, chọn nơi nộp hồ sơ 127, ngày đầu đến công ty 108, gặp cả team 104, lỗi bị trả lại 95, vòng kỹ thuật 93, viết CV 92.
Danh sách đầy đủ 30 cảnh (dài nhất / gặp nhiều nhất) nằm trong `tests/audit/ket-qua/dem-chu.json`, có thể chạy lại để so sánh.

## 2. Chơi thử 15 phút đầu (điện thoại giả lập)

| Thấy gì | Chi tiết |
|---|---|
| **Mỗi màn khoảng 90 từ** | 63 màn đầu (đến task đầu tiên, khoảng ngày 3): ít nhất 42 từ, nhiều nhất 283 từ (tạo nhân vật) |
| **Tạo nhân vật: 283 từ** | Người chơi phải đọc nhiều trước khi được chơi |
| **"Tính toán tháng đầu": 4 màn liền, 150–220 từ mỗi màn** | Ngay tối ngày 2, rồi tiếp đến gợi ý mục tiêu (189 từ) |
| **Nút lựa chọn nằm dưới màn hình đầu** | Ví dụ cảnh Task: nút đầu tiên ở độ cao 732 điểm, màn hình cao 664. Người chơi phải cuộn qua lịch, chỉ số, các buổi, danh sách việc đã làm, tranh minh họa rồi mới thấy chữ và nút. |
| **Nút điện thoại che chữ** | Che một phần thẻ task bên phải |
| **Thuật ngữ** | "Task", "#LCS-102", "senior", "OT", "Hỏi anh Dũng (senior)", "Để tối ở lại OT" ngay ở task đầu tiên |
| **Không có lỗi** | Không lỗi trang trong suốt lượt chơi |

**Thuật ngữ nghề lập trình xuất hiện trong câu chữ** (ước lượng): task 56 lần, code 29, bug 18, test 17, standup 15, OT 15, review 10, senior 8, log 8, git 8, junior 5, API 3, deploy 3, commit 3, hotfix 3.
Nhiều nhất ở:
- `js/canh/canh-di-lam.js` (23);
- `js/du-lieu/tro-choi.js` (21, câu đố trò chơi nhỏ);
- `js/du-lieu/ngay-dac-biet.js` (19);
- `js/van-phong/ngay-lam-viec.js` (18).

## 3. Bốn trò chơi nhỏ hiện tại

| Trò | Dùng cho | Luật | Phải đọc | Cần biết code? | Thời gian |
|---|---|---|---|---|---|
| 🐞 Bắt bug | 5/12 task | Chạm vào những dòng code sai | 6 dòng code thật (khoảng 24 từ code) + 2 câu | **Có**: phải hiểu `if (s.length > 0) return true;` là sai | 30 giây gốc (20–36 tùy cách làm) |
| 🧩 Xếp code | 3/12 task | Kéo các dòng code về đúng thứ tự | 5–6 dòng code (khoảng 22 từ) | **Có**: phải biết thứ tự hợp lý của code | 40 giây gốc |
| ⌨️ Gõ lệnh | 1/12 task | Gõ đúng từng lệnh rồi Enter | 3–4 lệnh `git` | **Có**, và cần bàn phím (khó trên điện thoại) | 35 giây gốc |
| 🔌 Nối dây API | 3/12 task | Nối thuật ngữ với nghĩa | 3–5 cặp (API, Bug, Deploy…) | **Có**: là câu đố thuật ngữ | 32 giây gốc |

Kết luận: **cả 4 trò đều là câu đố kiến thức lập trình**, không phải trò chơi cảm giác.
- Người không biết code chỉ đoán bừa: thua, và được ít điểm hơn (tối đa −6% khả năng làm tốt task).
- Mỗi lượt phải đọc 25–30 từ trên một khung chữ nhỏ.
- Ảnh chụp "trước": xem lại bằng `tests/audit/` (ảnh không đưa lên git).

## 4. Kế hoạch Phase 2: giảm chữ (chờ duyệt)

**Cài đặt "Đọc nhanh"** (mặc định bật; tắt thì như cũ). Không đổi logic, con số, xác suất; chỉ đổi chữ hiện ra và cách bày trên màn hình.

**Ngân sách chữ khi bật:**

| Phần | Ngân sách |
|---|---|
| Mô tả cảnh | tối đa 2 câu, khoảng 25 từ |
| Một lựa chọn | 6–8 từ, bắt đầu bằng động từ, có biểu tượng; gợi ý hậu quả bằng biểu tượng |
| Kết quả | 1 câu + các con chip thay đổi chỉ số |
| Bong bóng thoại | tối đa 12 từ, hội thoại tối đa 3 lượt |
| Tin nhắn | tối đa 2 dòng |
| Nhật ký, tổng kết tuần | gạch đầu dòng ngắn có biểu tượng |

**Cách làm:**
1. **Bản ngắn đặt cạnh bản đầy đủ** trong file dữ liệu: giữ ý, bỏ câu đùa phụ. Bản đầy đủ vẫn còn cho người tắt "Đọc nhanh".
2. Các cảnh cần viết lại theo thứ tự ưu tiên:

   | Cảnh | Hiện tại (từ mỗi lần) | Mục tiêu |
   |---|---|---|
   | Thức dậy | 82 | khoảng 25 (bảng năng lượng thu gọn sẵn) |
   | Giờ rảnh | 68 | khoảng 30 (ô chỉ còn tên + biểu tượng) |
   | Nhật ký cuối ngày | 67 | khoảng 25, dạng gạch đầu dòng |
   | Task | 104 | khoảng 40 (bỏ câu "mỗi task là một lá bài" lặp lại) |
   | Tổng kết tuần | khoảng 356 | khoảng 120 |
   | Tính toán tháng đầu | 4 màn × 124 | 4 màn × khoảng 50 |
   | Thiếu ngủ | 71 | khoảng 25, và giãn cách để không lặp mỗi sáng |
   | Hết giờ làm, tăng ca | 61–70 | khoảng 25 |
   | Phỏng vấn, báo cáo tua nhanh, rủ đi chơi | 62–93 | khoảng 30–40 |
   | Tạo nhân vật | 283 | khoảng 120 |

3. **Bày lại màn hình trên điện thoại khi "Đọc nhanh":**
   - thu gọn danh sách việc đã làm và tranh minh họa, để chữ và nút hiện ngay ở màn hình đầu;
   - dời nút điện thoại để không che chữ.
4. **Thuật ngữ đơn giản:** bảng từ điển trong một file dữ liệu riêng, áp dụng thống nhất. Ví dụ:

   | Thuật ngữ | Cách nói |
   |---|---|
   | task | việc |
   | bug | lỗi |
   | review code | xem lại phần việc |
   | OT | ở lại làm thêm |
   | senior | người đi trước |
   | standup | họp đầu ngày |
   | deploy | đưa bản mới lên |
   | log | nhật ký hệ thống |
   | #LCS-102 | (ẩn) |

   Từ nào còn giữ thì có giải thích một dòng khi chạm vào.
5. **Ước tính:**
   - 10 cảnh ưu tiên chiếm 76,5% tổng số chữ. Rút ngắn chúng như bảng trên (giảm khoảng 63% mỗi cảnh) thì tổng chỉ giảm khoảng **48%**, chưa đủ 50%.
   - Vì vậy áp dụng thêm ngân sách chữ cho nút lựa chọn và kết quả ở mọi cảnh còn lại: chữ trên nút đang chiếm 26% tổng. Như thế mới đạt mục tiêu giảm ít nhất 50%.
   - Sẽ đo lại bằng `dem-chu.js`; không đạt thì báo đúng số.

## 5. Kế hoạch Phase 3: 4 trò chơi nhỏ mới (chờ duyệt)

Lấy cách chơi theo **thể loại** quen thuộc. Hình, tên, nội dung là của game mình, không chép game nào. Phác thảo: `docs/phac-thao/*.svg` (mở được ngay trên GitHub).

| Trò mới | Thay cho | Thể loại | Cách chơi | Điều khiển |
|---|---|---|---|---|
| 🧩 **Ghép code** | Xếp code | Ghép 3 | Bảng 6×6 khối code nhiều màu. Vuốt đổi chỗ hai khối cạnh nhau; 3 khối cùng màu thẳng hàng thì nổ, khối mới rơi xuống. Dọn đủ số khối trong 20 giây. | Vuốt (hoặc chạm hai ô) |
| 🐞 **Né bug** | Bắt bug | Chạy và nhảy tránh vật cản | Nhân vật chibi tự chạy trên dải bàn phím. Chạm để nhảy qua con bọ, nhặt cốc cà phê. 3 mạng, trụ 20 giây. | Chạm |
| 📦 **Hứng dữ liệu** | Nối dây API | Hứng đồ rơi | Kéo máy chủ qua lại, hứng gói xanh, né gói đỏ. 20 giây. | Kéo |
| ⌨️ **Gõ theo nhịp** | Gõ lệnh | Chạm theo nhịp | 3 làn phím rơi xuống theo nhịp; chạm đúng làn khi phím tới vạch vàng; đúng liên tiếp có combo. 20 giây. | Chạm |

**Cho cả 4 trò:**
- **Không đọc chữ:** hướng dẫn bằng bàn tay động 3 giây, tên trò chỉ 2–3 chữ.
- **Không cần biết code:** chỉ là hình, màu, ẩn dụ.
- **Độ khó** tăng nhẹ theo độ khó của task và kỹ năng Lập trình (người mới thì dễ). "Làm kỹ" = dễ hơn một bậc. "Làm nhanh" = khó hơn một bậc. Thời gian luôn 20 giây.
- **Giữ nguyên** cách đổi điểm ra cộng trừ (bảng `MG`, tối đa ±6%), việc nào chơi trò nào (`MG_FOR_TASK`), nút "Để nhân vật tự làm" (cộng trừ 0 như cũ).
- **Không thêm vòng lặp hình mới:** trò chạy trong đúng vòng đếm giờ sẵn có của khung trò chơi, dừng hẳn khi xong.
- **Giảm chuyển động:** chậm hơn, bớt hiệu ứng. Nút lớn cho ngón tay. Có bàn phím cho máy tính (Space để nhảy, mũi tên để kéo, A S D để gõ nhịp).
- **Bật/tắt:** `MG.KIEU = 'moi'` (mặc định) hoặc `'cu'` (trò cũ vẫn giữ trong mã).

## 6. Rủi ro và cách giữ an toàn

1. Bài `van-phong-di-lai` đang bấm vào trò cũ (8 chỗ). Khi đổi trò, bài này chạy với `MG.KIEU = 'cu'`, và có bài kiểm thử mới cho trò mới.
2. Viết lại câu chữ có thể làm hỏng các bài kiểm thử tìm theo câu chữ cũ. Vì vậy dùng **bản ngắn đặt cạnh bản đầy đủ**: bài cũ chạy với "Đọc nhanh" tắt nếu cần, bài mới kiểm tra "Đọc nhanh" bật.
3. Bố cục mới trên điện thoại phải giữ đủ thứ cần thiết (chỉ số, giờ). Sẽ kiểm tra bằng ảnh chụp ở nền sáng và tối.
4. Hiệu năng: trò chạy liên tục (né bug, hứng dữ liệu, nhịp) cần đủ khung hình trên điện thoại. Sẽ thêm vào bài `hieu-nang`.
5. Bản lưu: chỉ thêm cài đặt `S.opt.docNhanh`; trò chơi nhỏ không lưu gì mới.

## 7. Kiểm thử Phase 1

Phase 1 không đổi mã game, chỉ thêm `tests/audit/dem-chu.js` và `docs/phac-thao/`. Vẫn chạy lại toàn bộ `npm test` (kết quả ở mục dưới).

Chạy ngày 23/11/2026, `npm test`, 3 luồng, bộ hiệu năng chạy riêng sau cùng.

**Tổng: ✅ ĐẠT 22 bộ · ❌ KHÔNG ĐẠT 0 · ⏭️ SKIP 0 · ⬜ CHƯA CHẠY 0 · 📊 BÁO CÁO 2 (chạy xong, không lỗi). Có 705 kiểm tra đạt, 0 hỏng.**

Lần này bộ `hieu-nang` đạt: phố giờ cao điểm trên điện thoại giả lập 55,3 FPS. Lần chạy Phase 2 trước đó, bộ này không đạt (35,8 FPS). Phase 1 không đổi mã game, nên đây là **dao động của máy** chứ không phải đã sửa được. Rủi ro H1 (phố trên điện thoại sát ngưỡng 40 FPS) vẫn còn. Phase 3 khi thêm trò chơi chạy liên tục sẽ phải đo kỹ.

## 8. Lỗi còn tồn tại

| Mức | Vấn đề | Xử lý ở |
|---|---|---|
| P2 | Quá nhiều chữ (khoảng 20.500 từ mỗi ván) | Phase 2 |
| P2 | Trò chơi nhỏ cần biết code | Phase 3 |
| P2 | Nút lựa chọn nằm dưới màn hình đầu trên điện thoại; nút điện thoại che chữ | Phase 2 |
| P2 | Cảnh "Thiếu ngủ" lặp mỗi sáng (G1 từ v17.6) | Phase 2 |
| P3 | Phố giờ cao điểm trên điện thoại sát ngưỡng 40 FPS (H1) | Phase 3–4 |
| P3 | Lỗi nhỏ cũ: P3-06, P3-07, P3-10, P3-12 | để sau |

**Chờ duyệt kế hoạch Phase 2 và 4 phác thảo trò chơi trước khi sửa code game.**
