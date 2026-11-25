# Báo cáo – Life & Career Simulation v17.8 (Tốc độ trên điện thoại)

**Mục tiêu:** sửa phố giờ cao điểm chậm trên điện thoại (rủi ro H1, có từ v17.6), không đổi lối chơi.
Báo cáo trước: `docs/AUDIT_REPORT_v17.7.md`.

## 0. Cách đo (mới)

Trước đây chỉ đếm khung hình/giây. Cách này dao động khoảng ±8 khi máy bận nên khó kết luận. Phase này dùng thêm **Chrome tracing**: ghi lại từng việc trình duyệt làm trong mỗi khung hình, rồi cộng thời gian theo loại việc và chia cho số khung hình. Các loại việc:
- **vẽ:** ghi lại hình cần vẽ;
- **chia lớp:** chia hình thành các lớp để ghép;
- **kiểu dáng:** tính lại CSS;
- **bố cục:** tính vị trí, kích thước.

Công cụ: `tests/audit/do-ve.js`. Cảnh đo: đi qua lại trên phố giờ cao điểm, điện thoại giả lập iPhone 13, CPU chậm 6 lần.

## 1. Đính chính kết luận ở v17.7

Ở v17.7 Phase 4 tôi báo: "bật Đọc nhanh thì phố chậm hơn khoảng 15–20%".
- Đo bằng tracing, bật và tắt Đọc nhanh tốn **y hệt nhau** (vẽ 217 so với 220 ms/giây, chia lớp 197 so với 194…).
- Hàm đổi thuật ngữ chỉ chạy khoảng 1 lần/giây.
- **Kết luận cũ sai:** chênh lệch FPS khi đó là nhiễu đo.

Tuy vậy, khi kiểm tra kỹ, tôi phát hiện **một lỗi thật của Đọc nhanh** (mục 3.1).

## 2. Nguyên nhân chậm (tìm bằng thí nghiệm)

Luồng chính của trình duyệt bị dùng **100%**. Gần như toàn bộ là việc vẽ, không phải chạy mã game: chạy mã chỉ khoảng 8%.

| Thí nghiệm | Kết quả | Kết luận |
|---|---|---|
| Bật / tắt Đọc nhanh | Như nhau | Không phải Đọc nhanh |
| Tắt mọi hoạt ảnh nhân vật | 60 khung/giây, nhưng việc vẽ **mỗi khung** không đổi (khoảng 5 ms) | Hoạt ảnh tay chân làm tốn kiểu dáng (3,6 so với 1,5 ms), không phải nguyên nhân vẽ |
| Ẩn khung phố tĩnh (nhà, quán, cây…) | Vẽ mỗi khung 4,7 → 3,2 ms | **Khung phố tĩnh bị vẽ lại mỗi khi nhân vật cử động.** Hai thứ nằm chung một SVG nên trình duyệt ghi lại cả khối |
| Ẩn mọi thứ ngoài khung thế giới | 56 khung/giây; bố cục giảm khoảng 40% | Có thứ **ngoài khung** bắt tính lại bố cục mỗi khung hình |
| Ẩn từng phần ngoài khung | Không phần nào một mình gây ra hết | Tìm trong mã: thanh thời gian còn lại có hiệu ứng chuyển `width` 0,3 giây (2 lần/giây, nên khoảng 60% thời gian bị tính lại bố cục); dấu vị trí trên bản đồ nhỏ đổi `left` mỗi khung hình |
| Camera đổi thuộc tính `transform` của nhóm trong SVG | Mỗi khung hình khi đi, cả SVG phải vẽ lại | Đổi sang trượt bằng CSS transform |
| Bỏ hẳn người ngoài khung nhìn khỏi cây vẽ (`display:none`) | Không đổi | Không dùng; giữ `visibility:hidden` (an toàn hơn) |

## 3. Đã sửa

### 3.1. Lỗi của v17.7: Đọc nhanh làm khung thế giới bị thu nhỏ, cắt trên điện thoại

Quy tắc CSS thu nhỏ tranh minh hoạ của cảnh thẻ (`.scene > .panel`, cao tối đa 20% màn hình) cũng khớp với **khung thế giới đi lại**, vì khung này cũng mang lớp `panel`.
- Hậu quả: khi bật Đọc nhanh (mặc định), trên điện thoại khung thế giới chỉ còn **217×133** thay vì 352×215. Nhân vật nhỏ, hai bên trống, nhãn gợi ý lệch chỗ.
- Bài kiểm thử v17.7 không bắt được.
- Đã sửa: quy tắc chỉ áp dụng cho tranh minh hoạ (`.panel:not(.world)`). Thêm kiểm tra vào bài `doc-nhanh` (nền sáng và tối).

### 3.2. Tăng tốc vẽ

| Thay đổi | File |
|---|---|
| **Tách khung phố tĩnh** (`H.paint()`) ra một SVG riêng (`.w-nen`), nằm dưới SVG chính (đồ vật có trạng thái, vùng chạm, nhân vật, lớp tối, bong bóng thoại). Nhân vật cử động không làm khung phố phải vẽ lại | `js/the-gioi/the-gioi.js`, `css/the-gioi.css` |
| **Camera trượt cả khối** (`.w-truot`, chứa hai SVG rộng bằng cả nơi đó) bằng CSS `transform`. Card đồ hoạ dời hình đã vẽ sẵn, không đổi thuộc tính bên trong SVG nữa | như trên |
| Phần tử đổi theo giờ (bầu trời, đèn, kim đồng hồ) hay theo việc (màn hình, hơi nước…) được tìm trong cả khung, vì có thể nằm ở một trong hai lớp | `js/the-gioi/the-gioi.js` |
| **Thanh thời gian còn lại:** co giãn bằng `transform: scaleX` thay cho `width` | `js/the-gioi/the-gioi.js`, `css/the-gioi.css` |
| **Dấu vị trí trên bản đồ nhỏ:** dời bằng `transform`, chỉ cập nhật khi đổi từ nửa điểm ảnh | `js/pho/di-pho.js`, `css/pho.css` |
| **Người ngoài khung nhìn:** không vẽ (`visibility:hidden`; trước chỉ dừng hoạt ảnh). Lề nới từ 40 lên 90, kiểm tra 4 lần/giây. Vừa hiện ra thì bỏ dấu ngay, nên không bị vô hình | `css/the-gioi.css`, `js/the-gioi/ban-do-nha.js`, `js/song/hanh-vi-npc.js` |

Không đổi: luật chơi, điều khiển, tốc độ đi, đồng hồ game, NPC, bản lưu.

## 4. Kết quả trước và sau

**Tracing** (`do-ve.js`, phố giờ cao điểm, điện thoại giả lập, CPU chậm 6 lần; 4 lần mỗi bản, đo xen kẽ khi máy rảnh):

| Mỗi khung hình | v17.7 | v17.8 | Thay đổi |
|---|---|---|---|
| Vẽ | 5,6 ms (4,8–6,9) | 3,3 ms (3,1–3,5) | **−41%** |
| Bố cục | 1,75 ms | 1,4 ms | −20% |
| Chia lớp | 4,7 ms | 4,5 ms | gần như không đổi |
| Kiểu dáng | 3,9 ms | 3,8 ms | không đổi |
| Khung/giây | TB 43, thấp nhất 36 | TB 46,5, thấp nhất 45 | +8%, ổn định hơn |

**Bài `hieu-nang`:**
- So với main, 4 cặp đo xen kẽ: phố 46,8 → 49,7 khung/giây.
- Lần chạy `npm test`: phố **53,8**, văn phòng 59,4, quán cà phê 58,4. Đạt ngưỡng 40; trước đó có lần chỉ 27–36.

**Giới hạn:**
- Phần còn tốn nhất là **chia lớp** (khoảng 4,5 ms) và **kiểu dáng** (khoảng 3,8 ms). Cả hai đến từ cách vẽ nhân vật: mỗi nhân vật khoảng 60 phần tử SVG, tay chân chuyển động bằng hoạt ảnh CSS.
- Muốn giảm tiếp phải làm lại cách vẽ, hoặc chuyển động của nhân vật. Đó là việc lớn, nên để một phase riêng nếu cần.
- Chưa thử trên điện thoại thật.

## 5. Kiểm thử

**Bài kiểm thử mới:**
- `hieu-nang`:
  - camera trượt bằng `transform` của khối, không có thuộc tính `transform` trong SVG;
  - khung phố tĩnh ở lớp riêng, không có người;
  - thanh thời gian và dấu bản đồ nhỏ dùng `transform`.
- `doc-nhanh`: khung thế giới giữ nguyên cỡ khi bật Đọc nhanh (nền sáng, tối).
- Kiểm tra hình ảnh bằng ảnh chụp: phố buổi tối (lớp tối, bầu trời), chạm để đi, nhà (kim đồng hồ quay), văn phòng (5 màn hình, 4 đồng nghiệp). Không lỗi.

**`npm test`:** ✅ ĐẠT 22 · ❌ KHÔNG ĐẠT 2 · ⏭️ SKIP 0 · ⬜ CHƯA CHẠY 0 · 📊 BÁO CÁO 2; 747 kiểm tra đạt, 2 hỏng.

| Bộ không đạt | Kiểm tra hỏng | Chạy lại riêng (2 lần) | Kết luận |
|---|---|---|---|
| `mo-dau` | "Mở/đóng Cài đặt giữa lúc nhân vật đang nói": trong 50 giây không có câu nói nào ở màn hình mở đầu | ✅ cả 2 lần (thấy câu nói) | Chập chờn: chờ một câu nói ngẫu nhiên. Phase này không đổi màn hình mở đầu |
| `tro-choi-moi` | Rò bộ nhớ sau 20 lượt: 58/721 → 69/766 | ✅ cả 2 lần: 69/766 → 69/766 | Mốc đo sau lượt thứ 4 thấp bất thường (máy đang chạy song song bài khác); mức cuối giống các lần trước. Không phải rò |

Chưa chạy lại toàn bộ sau đó.

## 6. Còn lại

1. Chia lớp và kiểu dáng của nhân vật (xem mục 4).
2. Hai bài kiểm thử còn chập chờn: `mo-dau` (chờ câu nói ngẫu nhiên) và mốc đo rò bộ nhớ của `tro-choi-moi`. Nên sửa ở lần sau: chờ theo điều kiện thay vì thời gian cố định, và đo nhiều mốc.
3. Các việc chờ quyết định từ v17.7:
   - ngày bình thường tự chạy (để giảm chữ tới 50%);
   - chơi thử 4 trò mới với người thật.
4. Lỗi nhỏ cũ: P3-06, P3-07 (biển tên công ty đè lên thanh thời gian ở văn phòng), P3-10, P3-12.
