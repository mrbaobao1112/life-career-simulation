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

---

## Cập nhật sau Phase 2: Đọc nhanh (giảm chữ)

**Đã làm** (chi tiết trong `CHANGELOG.md`):
- Thêm chế độ **Đọc nhanh**, mặc định bật. Bật/tắt bằng nút ở cuối màn hình chơi, hoặc trong Cài đặt ở màn hình mở đầu.
- Chế độ này chỉ đổi chữ hiện ra và cách bày trên màn hình. Không đổi lựa chọn, hiệu ứng, con số, xác suất. Bài kiểm thử so sánh bật/tắt trên 7 cảnh cho kết quả giống hệt, và cùng một lượt chơi đi đúng cùng một đường.

**Số chữ trước và sau** (`tests/audit/dem-chu.js`, 6 ván, cùng hạt giống, cùng cách bấm):

| | Trước (tắt Đọc nhanh) | Sau (bật) | Giảm |
|---|---|---|---|
| Ngày 1 | 775 | 555 | **28%** |
| Tuần 1 | 4.032 | 2.543 | **37%** |
| Cả 56 ngày | 20.485 | 11.978 | **42%** |

| Loại chữ (56 ngày) | Trước | Sau | Giảm |
|---|---|---|---|
| Mô tả cảnh | 5.797 | 2.722 | 53% |
| Lựa chọn | 5.297 | 4.021 | 24% |
| Kết quả | 2.777 | 1.453 | 48% |
| Nhật ký cuối ngày | 2.191 | 1.634 | 25% |
| Tổng kết tuần | 2.849 | 692 | 76% |
| Mẹo, lý do sự kiện | 460 | 345 | 25% |
| Lời thoại, tin nhắn | 1.113 | 1.113 | 0% (đã ngắn) |

**Mục tiêu giảm ít nhất 50%: CHƯA ĐẠT** (đạt 42% cả ván, 37% tuần đầu).
- Chữ còn lại chủ yếu không còn là câu dài, mà là **số màn hình**:
  - giờ rảnh khoảng 41 lần mỗi ván, giờ chỉ còn tên ngắn của các ô (`📖 Học thêm`, `☕ Cà phê 45.000đ`…);
  - thức dậy khoảng 36 lần (giờ còn khoảng 15–20 từ);
  - nhật ký cuối ngày khoảng 36 lần (khoảng 25 từ).
- Phần lớn chữ còn lại là tên lựa chọn và con số cần thiết.
- Muốn giảm thêm phải **bớt số lần dừng lại**. Ví dụ: ngày bình thường thì tự dậy, tự sang ngày mới, không hiện màn thức dậy và nhật ký. Làm vậy thì người chơi bớt cơ hội chọn (nằm thêm, ngủ nướng, tua). Đây là quyết định về lối chơi, **cần người làm game duyệt**, nên chưa làm.

**Màn hình điện thoại:**
- Nút lựa chọn đầu tiên giờ hiện ngay ở màn hình đầu: thử ở các màn việc, thức dậy, hết giờ làm, giờ rảnh; cả nền sáng và nền tối. Trước đây phải cuộn xuống.
- Tờ lịch, nhân vật, khung tranh gọn hơn. Danh sách việc đã làm chỉ hiện việc gần nhất.
- Nút điện thoại nhỏ hơn và có khoảng trống phía dưới, để không che chữ khi cuộn đến cuối.

**Chơi thử 15 phút đầu** (63 màn đầu, đếm mọi chữ hiện trên màn hình kể cả lịch, chỉ số, nút): trung bình khoảng 90 từ/màn → **70 từ/màn**. Màn tạo nhân vật: 283 → 169 từ.

**Lỗi tìm thấy và đã sửa trong lúc làm:**
1. Cách đổi thuật ngữ đầu tiên dùng `MutationObserver` (theo dõi mọi thay đổi trên trang). Trong bài kiểm thử jsdom bấm liên tục, bản ghi thay đổi dồn lại và **làm hết bộ nhớ**. Đã bỏ, chuyển sang gọi đổi thuật ngữ đúng ở những chỗ vẽ chữ.
2. Quy tắc rút gọn chung **giấu nhầm** lời chị Hạnh nhờ ở lại (màn hết giờ làm) vào "Xem thêm", vì đoạn đầu chỉ tả giờ giấc. Đã viết bản riêng giữ lời nhờ.
3. Chú thích `//` trên cùng dòng với code làm hỏng cú pháp (lặp lại lỗi cũ). Đã sửa.
4. Thu gọn đầu trang lần đầu làm vỡ bố cục 3 cột (nút bị đẩy xuống thêm khoảng 150 điểm ảnh). Đã sửa.

**Kiểm thử `npm test`** (23/11/2026, chạy thật):
- ✅ ĐẠT 23 bộ · ❌ KHÔNG ĐẠT 0 · ⏭️ SKIP 0 · ⬜ CHƯA CHẠY 0 · 📊 BÁO CÁO 2; 717 kiểm tra đạt.
- Các bài cũ chạy với Đọc nhanh bật sẵn (mặc định) và vẫn đạt.
- Bài mới `doc-nhanh` (12 kiểm tra):
  - ngân sách chữ;
  - không còn thuật ngữ khó;
  - bật/tắt cho cùng lựa chọn, cùng hiệu ứng;
  - cùng một lượt chơi đi cùng đường;
  - tuần đầu giảm ít nhất 25% (ngưỡng chặn chữ dài trở lại, không phải mục tiêu);
  - nút hiện ngay màn hình đầu trên điện thoại (sáng, tối);
  - nút bật/tắt và công tắc Cài đặt.

**Lỗi và giới hạn còn lại:**
- Mục tiêu 50% chưa đạt (xem trên).
- **Ngoài phạm vi Phase 2:**
  - Câu NPC tự nói trong thế giới đi lại (bong bóng thoại) chưa được đổi thuật ngữ; chủ yếu là câu chào, ít thuật ngữ.
  - Chữ trong trò chơi nhỏ chưa được đổi; Phase 3 thay cả 4 trò.
- Khi rút gọn theo quy tắc chung (câu đầu của đoạn dài), phần sau vẫn đọc được ở "Xem thêm". Riêng kết quả sau lựa chọn bị bỏ phần sau (thường là câu đùa phụ). Tắt Đọc nhanh thì đọc đủ.

---

## Cập nhật sau Phase 3: 4 trò chơi nhỏ kiểu mới

**Đã làm:** thay 4 trò đọc code bằng 4 trò kiểu phổ thông, đúng như phác thảo ở Phase 1 (chi tiết trong `CHANGELOG.md`).

| Trò | Thể loại | Chữ phải đọc | Cần biết code? | Thời gian |
|---|---|---|---|---|
| 🧩 Ghép code | ghép 3 | 0 (chỉ số khối "🎯 0/29") | Không | 20 giây (dọn đủ thì xong sớm) |
| 🐞 Né bug | chạy, nhảy tránh | 0 | Không | 20 giây |
| 📦 Hứng dữ liệu | hứng đồ rơi | 0 | Không | 20 giây |
| ⌨️ Gõ theo nhịp | chạm theo nhịp | 0 (chữ A S D trên nút) | Không | 20 giây |

So với trước: mỗi lượt phải đọc 25–30 từ, 6 dòng code thật hoặc lệnh `git`; thời gian 20–40 giây.

**Kết quả đo** (`npm run tro-choi-moi`, điện thoại giả lập iPhone 13):
- Mỗi lượt khoảng 22–23,5 giây: 2 giây bàn tay hướng dẫn + 20 giây chơi + 1,3 giây hiện kết quả. Ghép code có thể xong sớm.
- Khung hình khi CPU chậm 4 lần: ghép 60, né bug 56, hứng 58, nhịp 60 khung/giây.
- Chơi rồi đóng 20 lượt: nút trang 762 → 762, trình nghe sự kiện 69 → 69. Vòng lặp hình sau khi đóng: 60 → 60 lần/giây (không còn vòng của trò).
- Bot chơi đúng lúc: ghép 1,0 · né 0,98 · hứng 0,88 · nhịp 1,0.
- Bot "người mới" (chậm, hay sai): ghép 1,0 · né 0,32 · hứng 0,87 · nhịp 1,0.

**Giới hạn của số liệu:** bot đọc thẳng vị trí trong trò, nên **"người mới" bằng bot vẫn chơi giỏi hơn người thật**. Độ khó thật với người chơi (nhất là Ghép code và Gõ theo nhịp) cần người làm game chơi thử để chỉnh bảng `MGM`.

**Lỗi tìm thấy và đã sửa trong lúc làm:**
1. **Bàn tay hướng dẫn không tắt:** hàm tắt kiểm tra thời gian sau khi đã về 0, nên trò không bắt đầu.
2. **Né bug quá khắc nghiệt:** bản đầu có "hết mạng", người mới chỉ được 0,14 điểm. Sửa thành không có thua, mỗi lần va trừ một ít.
3. **Phím Space không nhảy:** trò không có nút nào nên khung chưa nhận phím.
4. **Ghép code quá dễ:** bot dọn đủ mục tiêu trong 5,6 giây. Đã nâng mục tiêu 12–21 → 21–33 khối.
5. **Nút "Xong" vẫn hiện ở trò mới:** CSS đè lên thuộc tính ẩn.
6. **Ký hiệu `</>` bị hiểu là thẻ HTML** nên khối xanh lá trống.

**Kiểm thử `npm test`** (chạy thật, 3 luồng): ✅ ĐẠT 22 · ❌ KHÔNG ĐẠT 2 · ⏭️ SKIP 0 · ⬜ CHƯA CHẠY 0 · 📊 BÁO CÁO 2; 737 kiểm tra đạt, 2 hỏng.

| Bộ không đạt | Lần chạy chung | Nguyên nhân | Đã làm | Chạy lại riêng |
|---|---|---|---|---|
| `tro-choi-moi` | 1/22 hỏng: bot "người mới" Hứng dữ liệu 0,91, cao hơn bot khá 0,79 | Kiểm tra sai: so hai bot cùng đọc thẳng vị trí trò, máy bận thì điểm dao động ngẫu nhiên | Bỏ phần so sánh hai bot; giữ hai ngưỡng có ý nghĩa (chơi tốt từ 0,7; người mới vẫn từ 0,2) | ✅ 22/22 đạt |
| `hieu-nang` | phố giờ cao điểm trên điện thoại 27,3 FPS (ngưỡng 40) | Rủi ro H1 có từ v17.6. Phase 3 không đổi phần vẽ thế giới. Lần chạy chung máy bận (bộ `can-bang` chậm hơn 30%) | Không hạ ngưỡng | ✅ 2 lần: 42,5 và 41,3 FPS, vẫn sát ngưỡng |

Chưa chạy lại toàn bộ `npm test` sau khi sửa (chỉ sửa bài `tro-choi-moi`; các bộ khác không đổi).

**Lỗi còn tồn tại:**
- Độ khó với người thật chưa được thử (xem trên).
- Mục tiêu giảm 50% chữ của Phase 2 vẫn chưa đạt (42%). Đang chờ quyết định có cho ngày bình thường tự chạy hay không.
- Phố giờ cao điểm trên điện thoại sát ngưỡng khung hình (H1, từ v17.6).

---

## Phase 4: Kiểm thử toàn bộ và tổng kết v17.7

### Trước và sau (đo lại ở Phase 4, cùng công cụ, cùng cách chơi)

| Mục | Trước v17.7 | Sau v17.7 | Thay đổi |
|---|---|---|---|
| Chữ phải đọc, ngày đầu | 775 từ | 555 từ | −28% |
| Chữ phải đọc, tuần đầu | 4.032 từ | 2.543 từ | −37% |
| Chữ phải đọc, cả 56 ngày | 20.485 từ (khoảng 100 phút đọc) | 11.978 từ (khoảng 60 phút) | **−42%** (mục tiêu −50%: chưa đạt) |
| 15 phút đầu trên điện thoại: chữ mỗi màn (kể cả lịch, chỉ số, nút) | 97 từ | 70 từ | −28% |
| Màn tạo nhân vật | 283 từ | 169 từ | −40% |
| Tổng kết tuần (phần hiện sẵn) | khoảng 356 từ | khoảng 87 từ | −76% |
| Nút lựa chọn trên điện thoại | dưới màn hình đầu (phải cuộn) | ngay màn hình đầu | đạt |
| Thuật ngữ khó trên màn hình (task, bug, OT, standup, review, senior, #LCS…) | khoảng 130 lần trong câu chữ (ước lượng bằng quét mã nguồn ở Phase 1) | 0 khi bật Đọc nhanh (bài `doc-nhanh` quét 2 ván, 3 tuần) | đạt |
| Trò chơi nhỏ: chữ, code phải đọc mỗi lượt | 25–30 từ, 6 dòng code hoặc lệnh `git` | 0 | đạt |
| Trò chơi nhỏ: cần biết code | có (cả 4 trò) | không | đạt |
| Trò chơi nhỏ: thời gian | 20–40 giây | 20 giây (+2 giây hướng dẫn) | đạt |
| Trò chơi nhỏ: cách chơi | đọc, kéo dòng, gõ phím | chạm, vuốt, kéo; hướng dẫn bằng hình | đạt |

Số chữ đo bằng `tests/audit/dem-chu.js` (6 ván, cùng hạt giống, chạy lại ở Phase 4 ra đúng số của Phase 2). 15 phút đầu đo bằng bot chơi trên điện thoại giả lập, bật và tắt Đọc nhanh.

### Không đổi (đã kiểm tra)

- **Lựa chọn, hiệu ứng, con số, xác suất, lương, tài chính, năng lượng, sức khỏe, 56 ngày.** Bài `doc-nhanh` so bật/tắt trên 7 cảnh giống hệt; cùng một lượt chơi đi cùng đường, cùng số tiền.
- **Cách tính điểm trò chơi nhỏ:** bài `tro-choi-moi` kiểm cộng trừ đúng công thức cũ; tự làm cho cộng trừ 0.
- **Bản lưu:** thêm bản lưu mẫu của **17.6 và 17.7**. Bài `luu-tai` giờ thử bản lưu thật của 7 phiên bản (16.1 → 17.7), mở bằng bản hiện tại và chơi tiếp đến hết.
- **Điều khiển nhân vật, thế giới đi lại:** các bài `the-gioi`, `van-phong-di-lai`, `ra-pho`, `npc-on-dinh` vẫn đạt.

### Sửa thêm ở Phase 4

- **Số phiên bản trong Cài đặt** vẫn ghi v17.5 từ hồi v17.5 (quên đổi ở v17.6 và các phase trước của v17.7). Đã đổi thành **v17.7**.

### Kết quả `npm test` ở Phase 4

Chạy toàn bộ 2 lần (3 luồng; `mo-dau` và `hieu-nang` chạy một mình sau cùng ở lần 2):

| Lần | ✅ ĐẠT | ❌ KHÔNG ĐẠT | ⏭️ SKIP | ⬜ CHƯA CHẠY | 📊 BÁO CÁO | Kiểm tra |
|---|---|---|---|---|---|---|
| 1 | 23 | 1 (`mo-dau`) | 0 | 0 | 2 | 744 đạt, 1 hỏng |
| 2 (cuối) | 22 | 2 (`56-ngay`, `hieu-nang`) | 0 | 0 | 2 | 742 đạt, 3 hỏng |

Các bộ không đạt và đã làm gì:

| Bộ | Kiểm tra hỏng | Nguyên nhân | Đã làm | Kết quả sau |
|---|---|---|---|---|
| `mo-dau` (lần 1) | Người đi bộ ở màn hình mở đầu "trùng chỗ 28 lần" | Kiểm tra theo thời gian thật, sai khi máy bận (v17.7 không đổi phần này). Chạy riêng 2 lần: 0 lần trùng | Bộ chạy tổng cho `mo-dau` chạy một mình sau cùng | Lần 2: ✅ 40/40 |
| `56-ngay` (lần 2) | "Phong nhắc chuyện vừa nghỉ" 6/20 (cần 8) | Kiểm tra dùng số ngẫu nhiên không cố định. Chạy lại 6 lần: 10–16/20 | Dùng hạt giống cố định cho phần này (mục đích kiểm tra giữ nguyên) | ✅ chạy riêng 3 lần: 13/20 |
| `hieu-nang` (lần 2) | Điện thoại: phố 36,4 FPS, quán cà phê 37,8 FPS (ngưỡng 40) | Xem điều tra bên dưới. **Chưa tìm ra nguyên nhân, chưa sửa** | Không hạ ngưỡng | ❌ còn |

Sau các sửa trên, **chưa chạy lại toàn bộ lần thứ 3**: chỉ chạy lại riêng `56-ngay` và `mo-dau`.

### Điều tra hiệu năng điện thoại (H1): v17.7 có làm chậm không?

Đo phố giờ cao điểm, điện thoại giả lập, CPU chậm 6 lần; xen kẽ bản cuối v17.6 (`71e4c5d`) và bản hiện tại, cùng máy:

| Thử nghiệm | v17.6 (FPS) | v17.7 (FPS) | Ghi chú |
|---|---|---|---|
| 4 cặp, v17.6 chạy trước | 39,2 · 37 · 46 · 36,6 (TB 39,7) | 33,4 · 34,8 · 26,9 · 31,3 (TB 31,6) | |
| 3 cặp, v17.7 chạy trước | 40,7 · 40 · 38,5 (TB 39,7) | 33,3 · 35,2 · 32,4 (TB 33,6) | Không phải do thứ tự |
| 3 cặp, v17.7 **tắt** Đọc nhanh | 31,9 · 38,8 · 34,3 (TB 35,0) | 36,4 · 29,8 · 37,6 (TB 34,6) | Ngang nhau |
| 3 cặp, v17.7 bật, bỏ CSS điện thoại của Đọc nhanh | 32,5 · 35,6 · 45,6 (TB 37,9) | 35,3 · 29,1 · 37,5 (TB 34,0) | Không rõ |
| Thời gian máy (Chrome đo) khi đi trên phố | mã 8,3–8,7% · kiểu dáng 20–22% · bố cục 8,1–8,4% | mã 8,0–8,7% · kiểu dáng 19–21% · bố cục 8,3–9,1% | Như nhau. Hàm đổi thuật ngữ chỉ chạy khoảng 1 lần/giây |

**Kết luận:**
- Khi bật Đọc nhanh, v17.7 có vẻ chậm hơn v17.6 khoảng 15–20% ở phố trên điện thoại giả lập (7/7 cặp).
- Nhưng thời gian chạy mã, kiểu dáng, bố cục đo được là như nhau. Tắt Đọc nhanh thì ngang nhau. Bỏ CSS điện thoại thì không rõ.
- Với cách đo hiện có (mỗi lần dao động ±8 FPS), **chưa xác định được nguyên nhân**. Có thể nằm ở bước vẽ hình mà các số đo này không bao quát.
- Ở Phase 2 và 3 tôi đã cho rằng FPS thấp "chỉ là máy dao động". Điều đó **không đúng hoàn toàn**: ít nhất một phần là do v17.7.

**Đề xuất:** một phase hiệu năng riêng, đo chi tiết từng khung hình (Chrome tracing: vẽ, ghép lớp) và thử trên điện thoại thật.

Tạm thời, người chơi thấy giật ở phố có thể tắt Đọc nhanh; đổi lại sẽ đọc chữ đầy đủ.

### Việc còn lại và đề xuất

| # | Việc | Ghi chú |
|---|---|---|
| 1 | **Mục tiêu −50% chữ chưa đạt (−42%)** | Phần còn lại là tên lựa chọn ở các màn lặp mỗi ngày. Giảm thêm cần bớt số lần dừng lại (ngày bình thường tự dậy, tự sang ngày). Đây là thay đổi lối chơi, **chờ người làm game quyết định**. |
| 2 | **Chơi thử 4 trò mới với người thật** | Bot đọc thẳng vị trí trong trò nên chơi giỏi hơn người. Chỉnh độ khó trong bảng `MGM` theo cảm nhận thật. |
| 3 | **Phố giờ cao điểm trên điện thoại dưới ngưỡng khung hình (H1)** | Có từ v17.6. Bật Đọc nhanh thì chậm thêm khoảng 15–20%, chưa rõ nguyên nhân (xem điều tra ở trên). Bài `hieu-nang` đang KHÔNG ĐẠT. Cần một phase hiệu năng riêng. |
| 4 | Câu NPC tự nói trong thế giới đi lại chưa đổi thuật ngữ | Ít gặp thuật ngữ (chủ yếu câu chào). |
| 5 | Lỗi nhỏ cũ: P3-06, P3-07, P3-10, P3-12 | Để sau. |
