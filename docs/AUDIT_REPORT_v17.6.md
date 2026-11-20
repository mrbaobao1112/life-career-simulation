# Báo cáo kiểm tra – Life & Career Simulation v17.6 (Phase 1: Audit và kiểm thử)

Bản được kiểm tra: **v17.5** (main sau PR #26). Báo cáo cũ: `docs/AUDIT_REPORT_v17.3.md`.
Phase 1 **không thay đổi gameplay**. Chỉ sửa môi trường kiểm thử và thêm bài kiểm thử, công cụ đo.

## 0. Cách kiểm tra

- Đọc toàn bộ cấu trúc mã nguồn, `CHANGELOG.md`, báo cáo v17.3 và phần cập nhật v17.4.
- Chạy **mọi** bộ kiểm thử bằng bộ chạy tổng mới (`npm test`).
  - Chỉ dùng thư viện cài trong `tests/`, không dựa vào thư viện cài sẵn trên máy (biến `NODE_PATH`), để biết máy mới có thiếu gì không.
- Thêm 3 bộ kiểm thử mới: lưu/tải, NPC ổn định, hiệu năng.
- Đo trải nghiệm 56 ngày bằng bot chơi 12 ván (`tests/audit/trai-nghiem.js`).
- Máy kiểm tra: Linux, Node 22, Playwright 1.63 với Chromium, chạy không giao diện.
  - "Điện thoại" là giả lập iPhone 13 với CPU chậm 6 lần, không phải máy thật.

## 1. Cấu trúc mã nguồn

Không có bước build. 78 file JavaScript nạp lần lượt trong `index.html`, dùng chung biến toàn cục (`S` là trạng thái game, `WORLD` là cảnh đang đi lại).

| Thư mục | File | Dòng | Nội dung |
|---|---|---|---|
| `js/loi` | 5 | 501 | trạng thái, lưu game, lịch, vòng lặp ngày, xếp lịch buổi |
| `js/du-lieu` | 10 | 831 | số liệu cân bằng và câu chữ (task, sự kiện, hội thoại, trí nhớ, gia đình, chuyện) |
| `js/he-thong` | 6 | 810 | năng lượng, tài chính, chỉ số, điện thoại, gặp gỡ, nghỉ phép |
| `js/canh`, `js/su-kien` | 7 | 1001 | các cảnh và sự kiện dạng thẻ |
| `js/the-gioi` | 5 | 850 | bộ máy đi lại tự do (bản đồ, điều khiển, tìm đường, vòng lặp hình) |
| `js/van-phong`, `js/pho` | 13 | 844 | văn phòng đi lại được; phố, 8 địa điểm, xe máy |
| `js/song` | 14 | 1530 | thế giới sống: lịch NPC, hành vi, quan hệ, xã hội, dân số, phố, sự kiện thế giới, trí nhớ, hội thoại, phục vụ quán, ngày đặc biệt, gia đình, chuyện tự nảy sinh |
| `js/hinh-anh`, `js/giao-dien`, `js/tro-choi` | 18 | 2548 | hình chibi, sân khấu, giao diện, trò chơi nhỏ |
| `css` | 12 | 870 | giao diện, động tác |
| `tests` | 25 + 10 công cụ audit | ~3200 | kiểm thử |

**Điểm kiến trúc cần biết (rủi ro):**
- Các module v17 trở đi **bọc lại hàm của module trước** để nối thêm hành vi, không sửa file gốc. Có 9 hàm được bọc:
  - `buildSlot`, `chatBond`, `memNpcLine`, `songSpot` (do `cau-chuyen.js` bọc);
  - `songSocialTick` (`gia-dinh.js`);
  - `songBeat`, `songSettle` (`ngay-dac-biet-vp.js`; `songSettle` còn bị `tri-nho-npc.js` bọc);
  - cùng các hàm `mount`, `frame`, `npcEntries`, `entries` của nơi chốn.
- Cách này giữ file nhỏ và bật/tắt được từng hệ thống. Đổi lại, **thứ tự nạp file trong `index.html` là bắt buộc**: đổi chỗ hai dòng có thể làm mất hành vi mà không báo lỗi.
- Trạng thái lưu (`S`) có 80 khóa, thêm dần qua các phiên bản. Phần mới luôn được tạo khi chưa có (`S.npcMem`, `S.npcRel`, `S.cc`, `S.phone`…), nên bản lưu cũ mở được.

## 2. Tình trạng từng hệ thống

| Hệ thống | Tình trạng | Bằng chứng | Ghi chú |
|---|---|---|---|
| NPC tự sống (lịch, hành vi, việc xen) | Hoạt động tốt | `the-gioi-song`, `npc-on-dinh` (mới) | Ở 10 nơi, khi cho đồng hồ chạy nhanh gấp 3: không trùng mặt, không kẹt, không bận mãi, không ra ngoài bản đồ |
| Trí nhớ NPC | Hoạt động tốt | `tri-nho`, `hoi-thoai`, `cau-chuyen` | Nhớ tối đa 24 chuyện, tự quên sau 14 ngày |
| Hội thoại (bắt chuyện) | Hoạt động tốt | `hoi-thoai` | |
| Quan hệ NPC–NPC | Hoạt động tốt | `xa-giao`, `cau-chuyen` | |
| Đời sống xã hội (chào, rủ về, ăn bánh) | Hoạt động tốt | `xa-giao` | |
| Vòng đời khách ở quán, nhân viên phục vụ | Hoạt động tốt | `quan-song`, `thanh-pho` | |
| Gia đình | Hoạt động tốt | `gia-dinh-cong-viec` | |
| Ngày làm việc đặc biệt | Hoạt động tốt | `gia-dinh-cong-viec`, `van-phong` | |
| Chuyện tự nảy sinh | Hoạt động, mới có 2 chuyện | `cau-chuyen`, `luu-tai` | Linh rủ đi thư viện; đồng nghiệp giận rồi làm lành |
| Thông báo điện thoại | Hoạt động tốt | `cau-chuyen` | |
| Lưu / tải, bản lưu cũ | Hoạt động tốt | `luu-tai` (mới), `56-ngay` | Bản lưu thật của 16.1, 17.0, 17.3, 17.4, 17.5 đều chơi tiếp được đến ngày 56 |
| Hiệu năng điện thoại | Chấp nhận được, còn sát ngưỡng ở phố | `hieu-nang` (mới) | Xem mục 7 |
| Tài chính, năng lượng, 56 ngày | Hoạt động tốt | `tai-chinh`, `he-thong`, `56-ngay`, `ngau-nhien` | |

**Chưa hoàn thiện** (không phải lỗi; sẽ đánh giá trong Phase 3):
- Chuyện tự nảy sinh mới có 2 chuyện.
- Phần lớn quyết định chỉ ảnh hưởng chỉ số và quan hệ, ít hậu quả về sau (xem mục 6).
- Người chơi chế độ bấm thẻ (tắt đi lại tự do) không thấy được các phần chỉ có khi đi lại: hẹn ở thư viện, quán sống, đồng nghiệp giận nhau.
  - Riêng hẹn Linh đã có cảnh thẻ thay thế.

**Lỗi cũ từ báo cáo v17.3 còn để lại** (đều nhỏ, mức P3):
- **P3-06:** anh Dũng đi xuyên mép bàn khi rời ghế.
- **P3-07:** biển tên công ty đè lên gợi ý "Bàn của bạn".
- **P3-10:** bài chơi ngẫu nhiên cần nhiều bộ nhớ (6 GB).
- **P3-12:** nhiều file nhỏ (78 file JS, chậm khi tải qua mạng chậm).

Các mục P2 của báo cáo v17.3 đã sửa hết trong v17.4 và v17.5.

## 3. Môi trường kiểm thử: vấn đề tìm thấy và đã sửa

| # | Vấn đề | Hậu quả | Đã sửa |
|---|---|---|---|
| Q1 | Playwright không có trong `tests/package.json`. Máy kiểm tra chạy được chỉ vì có bản cài sẵn toàn cục (`NODE_PATH`). | Máy mới `npm install` xong vẫn thiếu trình duyệt kiểm thử | Thêm `playwright` 1.63.0 vào `devDependencies`, có `package-lock.json` |
| Q2 | 14 bài dùng trình duyệt: thiếu Playwright thì in "Bỏ qua" rồi **thoát mã 0** | Bài không chạy mà vẫn được tính là **đạt** | Thoát mã 3 và in "⏭️ SKIP… CHƯA CHẠY, không tính là đạt" |
| Q3 | `npm test` chỉ chạy 4 bộ không cần trình duyệt | Phần lớn kiểm thử (20 bộ) không bao giờ được chạy khi gõ `npm test` | `npm test` chạy **tất cả** qua bộ chạy tổng `tests/chay-tat-ca.js`; bộ cũ thành `npm run co-ban` |
| Q4 | `he-thong`, `tai-chinh`, `ngau-nhien` không có kiểm tra đạt/không đạt, chỉ in số (`ngau-nhien` chỉ báo khi lỗi) | "Chạy xong" bị hiểu nhầm là "đạt" | Thêm kiểm tra thật: `he-thong` 5, `tai-chinh` 4, `ngau-nhien` 1 |
| Q4b | `can-bang`, `hai-thang` là bảng mô phỏng cân bằng cho người đọc | | Giữ nguyên, ghi rõ là 📊 BÁO CÁO, không tính là đạt |
| Q5 | Không có bài kiểm thử tự động cho bản lưu của nhiều phiên bản (chỉ có công cụ audit cần dựng lại bản cũ bằng tay) | | Bản lưu thật của 5 phiên bản trong `tests/du-lieu-mau/`, bài `luu-tai` |

**Bộ chạy tổng (`npm test`)** phân loại từng bộ:
- ✅ ĐẠT;
- ❌ KHÔNG ĐẠT (có kiểm tra sai, lỗi, hoặc quá 25 phút);
- ⏭️ SKIP (thiếu môi trường, không tính là đạt, `npm test` báo lỗi);
- ⬜ CHƯA CHẠY;
- 📊 BÁO CÁO.

Bảng kết quả ghi vào `tests/ket-qua/tong-hop.md`. Bộ đo hiệu năng chạy một mình sau cùng để số đo không bị các bộ khác làm sai. Đã thử giả lập máy thiếu Playwright: bài báo SKIP, mã thoát 3, `npm test` báo lỗi.

## 4. Kết quả kiểm thử (chạy thật bằng `npm test`)

KET_QUA_BANG

## 5. Bài kiểm thử theo từng hệ thống được yêu cầu

| Hệ thống | Bộ kiểm thử |
|---|---|
| NPC Memory | `tri-nho`, `hoi-thoai` (nhắc chuyện cũ khi bắt chuyện), `cau-chuyen` (Linh nhớ buổi thư viện) |
| NPC Relationship | `xa-giao` (quan hệ NPC–NPC), `cau-chuyen` (giận, làm lành) |
| NPC Conversation | `hoi-thoai` |
| Cafe Customer Lifecycle | `quan-song`, `thanh-pho` |
| Family Interaction | `gia-dinh-cong-viec` |
| Workday Events | `gia-dinh-cong-viec` (6 loại ngày), `van-phong`, `van-phong-di-lai` |
| Emergent Stories | `cau-chuyen` |
| Save/Load | **`luu-tai` (mới)**, `56-ngay` |
| Mobile Performance | **`hieu-nang` (mới)**, `tri-nho` (một kiểm tra FPS) |
| NPC ra vào địa điểm, trùng lịch, mắc kẹt, hành động xung đột | **`npc-on-dinh` (mới)** |

Chi tiết các bộ mới:
- **`luu-tai`:**
  - 10 bản lưu thật (5 phiên bản × ngày 12, ngày 30) mở bằng bản hiện tại: đúng ngày, tiền, việc, quan hệ; chơi tiếp đến ngày 56 không lỗi, không hiện NaN/undefined.
  - Bản lưu bị xóa các phần mới vẫn tự tạo lại được.
  - Lưu rồi tải lại giữ nguyên mọi dữ liệu, kể cả chuyện đang diễn ra và tin chờ trả lời.
  - 5 bản lưu lúc đang đi ngoài phố mở lại đúng chỗ, đúng giờ, đi tiếp được.
  - Đang hẹn Linh ở thư viện, tải lại trang: Linh vẫn đợi.
- **`npc-on-dinh`:**
  - Lịch nhà, công ty, ngoài phố của 56 ngày không chồng giờ.
  - 10 nơi theo dõi 30 giây mỗi nơi, mỗi giây đọc trạng thái 4 lần: không ai xuất hiện hai lần, không kẹt giữa quãng đi, không ra ngoài bản đồ, không bận một việc quá 2 tiếng game, dấu "đã đi" khớp với hình.
  - Ra vào 24 lần qua 8 nơi: luôn một khung thế giới, số người không tăng dần, chỉ một vòng lặp hình (60 lần/giây).
- **`hieu-nang`:**
  - FPS trên điện thoại giả lập ở phố giờ cao điểm, văn phòng, quán cà phê (ngưỡng 40 FPS, 95% khung dưới 50 ms).
  - NPC ngoài khung nhìn không còn hoạt ảnh chạy.
  - Tìm đường dưới 2 ms.
  - Ra vào 20 lần: số nút trang, số trình nghe sự kiện, bộ nhớ không tăng quá 12%.

**Đã phát hiện khi viết bài mới:** bài `npc-on-dinh` lúc đầu báo một xe máy "kẹt" ở đầu ngõ. Điều tra thì không phải lỗi game: game đặt ngay điểm đến, còn hình xe trượt tới trong khoảng 16 giây; bộ dò đã được sửa để tính theo thời gian của từng quãng đi.

## 6. Trải nghiệm 56 ngày (số liệu, để đánh giá trong Phase 3)

Bot chọn ngẫu nhiên, 12 ván, chế độ bấm thẻ (`tests/audit/trai-nghiem.js`). Người chơi thật chọn có chủ đích hơn, nên đây là **dấu hiệu cần xem**, chưa phải kết luận.

| Chỉ số | Kết quả | Nhận xét |
|---|---|---|
| Ngày "nhạt" (không có cảnh nào ngoài việc thường ngày) | **21%** số ngày | Khoảng 1 ngày trong 5 không có gì đáng nhớ |
| Sự kiện khác nhau gặp được | 21 loại, trung bình 31 lượt mỗi ván | |
| Sự kiện lặp lại trong cùng một ván | trung bình 5 loại mỗi ván | |
| Sự kiện lặp nhiều nhất | **"Thiếu ngủ" 128 lượt / 12 ván (khoảng 11 lần mỗi ván)** | Khi nợ ngủ từ 3 trở lên, cảnh này hiện mỗi sáng. Đây là cảnh lặp nặng nhất. |
| Hoạt động tự do được chọn | học thêm, xem phim, chơi game, nằm nghỉ, chạy bộ quanh hồ, trà đá với Tùng… | Đủ đa dạng |
| Ngày nghỉ có ra ngoài gặp người | **16,5%** (chế độ thẻ) | Ít lý do để ra ngoài vào ngày nghỉ. Đi lại tự do có thêm quán sống và chuyện, nhưng chưa có lý do chủ động (mục tiêu, việc cần làm ngoài phố). |
| Chuyện NPC còn nhớ cuối ván | 9–12 | Trí nhớ hoạt động |
| Quyết định có hậu quả về sau | chỉ thấy 2 loại cờ thường gặp: cho Tùng vay, hứa gửi tiền nhà | Ít quyết định tạo hậu quả nhiều ngày sau |

**Đề xuất cho Phase 3** (không làm trong Phase 1):
1. Cảnh "Thiếu ngủ": giãn cách, hoặc gộp vào cảnh buổi sáng khi đã gặp gần đây.
2. Lý do ra ngoài ngày nghỉ: nối với mục tiêu (Phase 2), ví dụ "học kỹ năng ở thư viện", "gặp Linh".
3. Thêm hậu quả về sau dựa trên mục tiêu và kỹ năng (Phase 2), không thêm hàng loạt sự kiện ngẫu nhiên.

## 7. Hiệu năng

PERF_BANG

- Không thấy rò bộ nhớ, rò trình nghe sự kiện hay nhân đôi vòng lặp hình khi ra vào địa điểm nhiều lần.
- NPC ngoài màn hình đã dừng hoạt ảnh (v17.5). NPC ngoài màn hình vẫn được cập nhật vị trí theo lịch (cố ý, để mô phỏng đúng), nhưng đi thẳng tới đích, không tính từng bước.
- **Rủi ro còn lại:** phố giờ cao điểm trên điện thoại khi nhân vật đang đi (camera chạy) thấp nhất trong các cảnh, cần theo dõi nếu thêm người hoặc xe.

## 8. Rủi ro regression

1. **Thứ tự nạp file** (`index.html`): các module bọc hàm của nhau. Đổi thứ tự có thể làm mất hành vi mà không báo lỗi. Các bài `cau-chuyen`, `gia-dinh-cong-viec`, `hoi-thoai` sẽ bắt được phần lớn.
2. **Định dạng bản lưu:** thêm khóa mới vào `S` phải tự tạo khi chưa có. Bài `luu-tai` giờ kiểm tra bằng bản lưu thật của 5 phiên bản; **khi ra phiên bản mới, nên thêm bản lưu mẫu** bằng `tests/du-lieu-mau/tao-ban-luu.js`.
3. **Phase 2 (kỹ năng, cấp bậc) đụng vào `S.tech`, `S.soft`, `S.perf`, lương:** yêu cầu không đổi công thức lương và tài chính. Cần thêm kỹ năng **bên cạnh** chỉ số cũ, không thay thế, để kết quả cân bằng (`can-bang`, `ngau-nhien`) không đổi.
4. **Kiểm thử phụ thuộc thời gian thật:** các bài trình duyệt chạy 3 luồng song song. Máy chậm hoặc bận có thể làm hỏng bài đo FPS, nên bài hiệu năng giờ chạy riêng.
5. **Chế độ bấm thẻ và chế độ đi lại** đi hai đường khác nhau. Tính năng mới cần có cả hai, hoặc ghi rõ chỉ có ở một chế độ.
6. **Bài chơi ngẫu nhiên cần 6 GB bộ nhớ** (P3-10). Máy yếu có thể không chạy được, lúc đó bộ chạy tổng báo KHÔNG ĐẠT (không phải SKIP).

## 9. Lỗi còn tồn tại sau Phase 1

LOI_CON

## 10. Phase 1 đã thay đổi gì

Chỉ kiểm thử và tài liệu, **không đổi mã game**:
- Môi trường:
  - `tests/package.json`: thêm Playwright, đổi `npm test` thành chạy tất cả, thêm `co-ban`, `luu-tai`, `npc-on-dinh`, `hieu-nang`;
  - thêm `tests/package-lock.json`.
- Bộ chạy tổng: `tests/chay-tat-ca.js`.
- Bài mới:
  - `tests/kiem-thu-luu-tai.js`, `tests/kiem-thu-npc-on-dinh.js`, `tests/kiem-thu-hieu-nang.js`;
  - bản lưu mẫu và công cụ tạo: `tests/du-lieu-mau/`.
- Thêm tiêu chí đạt/không đạt: `tests/kiem-thu-he-thong.js`, `tests/kiem-thu-tai-chinh.js`, `tests/choi-ngau-nhien.js`.
- Báo SKIP thay vì đạt: 14 file `tests/kiem-thu-*.js`.
- Công cụ đo trải nghiệm: `tests/audit/trai-nghiem.js`.
- Tài liệu: `docs/AUDIT_REPORT_v17.6.md` (file này), `CHANGELOG.md`, `README.md`, `tests/audit/README.md`, `.gitignore`.
