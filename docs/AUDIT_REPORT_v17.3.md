# Báo cáo kiểm tra toàn diện – Life & Career Simulation v17.3

- **Ngày kiểm tra:** 19/11/2026
- **Mã nguồn:** nhánh `main` sau khi gộp PR #21 (commit `b294213`)
- **Phạm vi:** kiểm tra hành vi thực tế bằng trình duyệt thật (Chromium, Playwright) và bằng các bộ kiểm thử có sẵn. Không sửa mã nguồn game. Mọi số liệu dưới đây đều đo được; mục nào chưa đo được thì ghi rõ.

---

## 0. Cách kiểm tra (để đọc đúng các con số)

| Việc | Cách làm | Công cụ |
|---|---|---|
| Bộ kiểm thử có sẵn | Chạy cả 16 script trong `tests/package.json` | Node, jsdom, Playwright |
| Quan sát NPC | Đứng yên quan sát **17 cảnh, mỗi cảnh 5 phút thật** (= 10 giờ trong game, vì 1 giây thật = 2 phút game), thêm **5 cảnh đo lại 3 phút** sau khi sửa cách đo. Mỗi 0,2 giây đọc **vị trí thật trên màn hình** của từng NPC (vị trí đang trượt, không phải điểm đích), rồi đếm: hiện ra/biến mất trong khung nhìn, đứng chồng lên nhau khi cả hai đứng yên, chân nằm trong đồ đạc khi đang đi, đứng yên bao lâu, câu nói, dấu hiệu, lịch hoạt động | Script quan sát riêng (không nằm trong game) |
| Trí nhớ | Kịch bản đầu–cuối: bấm nút thật trong sự kiện, lưu, **tải lại trang thật**, hôm sau đi bộ bằng phím đến gặp NPC | Playwright |
| Bản lưu cũ | Chơi bằng **4 bản cũ** (v11, v13.3, v15, v16.1) đến ngày 18–21, lấy bản lưu, mở bằng v17.3 rồi chơi tiếp đến hết ngày 56 | jsdom |
| Di chuyển | Bấm phím thật (WASD, mũi tên, Shift), đi ngẫu nhiên 90 giây, kéo joystick trên giả lập iPhone 13, đi qua cửa thật | Playwright |
| Chơi thử | Bot chơi như người: bấm vào đồ vật để nhân vật tự đi tới, chọn việc, đôi khi ra phố; **không tua nhanh**; chụp màn hình ở phút 1, 5, 15, 30, 45, 60 | Playwright |
| Hiệu năng | Đo FPS bằng đếm khung hình thật, khung hình chậm, CPU và bộ nhớ qua Chrome DevTools Protocol; 3 cấu hình: máy bàn (không giới hạn CPU), laptop trung bình (CPU chậm 4 lần), điện thoại (iPhone 13, CPU chậm 6 lần); chạy liên tục 30 phút | Playwright + CDP |

**Giới hạn của cách đo (cần biết khi đọc số):**
- Máy kiểm tra là máy chủ Linux 4 nhân, Chromium chạy **không màn hình** và vẽ bằng phần mềm (không có card đồ họa). FPS trên máy thật có card đồ họa thường cao hơn; FPS ở đây là mức **thấp**, dùng để so sánh giữa các cảnh và cấu hình.
- "Laptop trung bình" và "điện thoại" là **giả lập bằng cách làm chậm CPU**, không phải thiết bị thật. Chưa đo trên điện thoại thật.
- Bot chơi thử không thay được cảm nhận của người thật. Phần "trải nghiệm" là đánh giá của người kiểm tra dựa trên ảnh chụp, nhật ký và dữ liệu, có ghi rõ chỗ nào là nhận định.
- Một phần dữ liệu quan sát văn phòng buổi sáng (8:12–8:20) bị loại vì công cụ quan sát kéo đồng hồ lùi sau khi cảnh đã dựng; khi chơi thật đồng hồ không bao giờ lùi.

---

## 1. Tổng quan chất lượng

**Kết luận ngắn:** v17.3 **ổn định về kỹ thuật**: không tìm thấy lỗi P0 hay P1, cả 16 bộ kiểm thử đều đạt, bản lưu từ 4 phiên bản cũ mở được và chơi tiếp đến hết, không rò bộ nhớ, máy bàn giữ khoảng 60 FPS. **Thế giới sống có thật**: NPC tự đi làm, ăn trưa, về nhà, khách ra vào quán theo giờ, NPC nhớ chuyện và nhắc lại sau khi tải lại game.

Nhưng về **trải nghiệm**, game mới hấp dẫn ở khoảng **15–30 phút đầu**. Sau đó vòng lặp ngày làm việc lặp lại gần như y hệt, thế giới sống chủ yếu là **cảnh nền để nhìn** (khó tham gia vào), và một số chỗ làm lộ “kịch bản”:
- người hiện ra hoặc biến mất ngay giữa màn hình;
- Tùng ngồi trà đá 10 tiếng trong khi lịch nói Tùng đang đi làm;
- khách lạ ở bia hơi hỏi nhau “Deploy chưa?”;
- nhân viên quán đứng yên cả ngày.

| Hạng mục | Đánh giá |
|---|---|
| Ổn định, dữ liệu, bản lưu | Tốt |
| Điều khiển, va chạm, camera | Tốt |
| NPC tự sống ở văn phòng | Tốt |
| NPC tự sống ở nhà | Khá (đúng lịch, nhưng im lặng) |
| Thành phố sống | Khá (đúng giờ, đúng mật độ; còn lỗi hiện/biến mất, nhân viên tĩnh) |
| Đời sống xã hội | Trung bình (lặp câu, lệch ngữ cảnh) |
| Trí nhớ NPC | Hoạt động đúng, nhưng **rất khó thấy** |
| Hiệu năng | Tốt trên máy bàn và laptop; điện thoại giả lập tụt còn 43 FPS ở phố giờ cao điểm |
| Gameplay dài hạn | Chưa đủ hấp dẫn cho trọn 56 ngày |

---

## 2. Kết quả kiểm tra từng hệ thống

### 2.1. Bộ kiểm thử có sẵn (regression)

| Script | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|
| `test` | PASS | 302 giây | |
| `56-ngay` | PASS | 36 giây | |
| `van-phong` | PASS | 175 giây | |
| `mo-dau` | PASS | 209 giây | Một lần FAIL khi chạy song song (người đi bộ ở màn mở đầu “trùng chỗ 28 lần”); chạy riêng PASS |
| `he-thong` | PASS | 7 giây | |
| `ngau-nhien` (40 ván) | PASS | 700 giây | 40/40 ván, 0 lỗi |
| `can-bang` | PASS | 967 giây | |
| `tai-chinh` | PASS | 22 giây | |
| `hai-thang` | PASS | 31 giây | |
| `the-gioi` | PASS | 80 giây | |
| `van-phong-di-lai` | PASS | 83 giây | |
| `ra-pho` | PASS khi chạy riêng | 104 giây | **FAIL 4 mục khi chạy song song** (hàng rong, mưa, tắc đường, mỗi loại một lần/ngày). Đã lặp lại 3 lần, lần nào máy bận cũng FAIL đúng 4 mục này |
| `the-gioi-song` | PASS | 64 giây | |
| `xa-giao` | PASS | 120 giây | |
| `thanh-pho` | PASS | 52 giây | |
| `tri-nho` | PASS | 28 giây | |

### 2.2. Regression từng hệ thống cũ

| Hệ thống | Kết quả | Bằng chứng |
|---|---|---|
| Tạo nhân vật | Hoạt động | `he-thong`, `mo-dau`, bot chơi thử |
| Mô phỏng 56 ngày | Hoạt động | `56-ngay`, `ngau-nhien` 40 ván đến ngày 56 |
| Tài chính, lương | Hoạt động | `tai-chinh`, `hai-thang`, `can-bang` |
| Sức khỏe, năng lượng | Hoạt động | `he-thong`, `test` |
| Nghỉ phép | Hoạt động | `van-phong`, `tri-nho` (đồng nghiệp hỏi thăm sau khi nghỉ) |
| Đi làm, làm task | Hoạt động | `van-phong-di-lai`, bot chơi thử có việc ở Cú Đêm Lab từ ngày 4 |
| Trò chơi nhỏ | Hoạt động (theo kiểm thử) | `van-phong-di-lai`. Bot chơi thử chọn “Để nhân vật tự làm” nên **chưa tự chơi thử từng trò** |
| Ra phố, xe máy | Hoạt động | `ra-pho` (chạy riêng), kiểm tra đi bằng cửa phố → quán → phố |
| Lưu và tải game | Hoạt động | Tải lại trang thật: trí nhớ NPC, quan hệ NPC giữ nguyên; bản lưu 2.807 ký tự |
| **Bản lưu cũ** | **Hoạt động** | Bản lưu từ v11, v13.3, v15, v16.1 (ngày 18–21) mở bằng v17.3, chơi tiếp đến ngày 56: 0 lỗi, không có NaN/undefined trên màn hình |

### 2.3. NPC tự sống – văn phòng

Quan sát văn phòng Hồ Tây 10:00–18:00 (hai lần đo) và 15:30–01:30.

| Câu hỏi | Kết quả | Bằng chứng |
|---|---|---|
| Đến làm đúng giờ | Có | Theo lịch `VP_DAY` (chị Hạnh khoảng 8:24, các bạn khác 8:36–8:51, lệch tối đa ±15 phút mỗi ngày); quan sát thấy vào bàn 8:27–8:39. Có ngày một người đến muộn (sau 9:20), lỡ họp, vào bàn xin lỗi (😅) |
| Tự ngồi vào bàn | Có | 💻 chiếm phần lớn dấu hiệu trong giờ làm |
| Hoạt động trong giờ làm | Có | Mỗi người có việc xen: lấy nước (☕), nghĩ (💭), điện thoại (📱), sang bàn nhau (💬), xem bảng (🗂️) |
| Lấy nước, nghỉ, trò chuyện | Có | 37–57 câu nói mỗi ngày làm việc; sự kiện ăn bánh (🍰), tranh luận (💢→🤝), giao task, họp đột xuất |
| Tự rời văn phòng khi hết giờ | Có | 12:10 cả văn phòng đi ăn trưa, 12:50–13:30 quay lại; 17:30 Mai, Phong về; 18:40 văn phòng trống |
| Đứng yên quá lâu | Anh Dũng ngồi yên tối đa 74–137 phút liền | Đúng tính cách “hiếm khi rời bàn”, nhưng nhìn lâu thấy như hình tĩnh |
| Đứng chồng lên nhau | **Có**, ở pantry | Chị Hạnh và anh Dũng đứng trùng một điểm ở pantry tới **10,6 giây liền** (xem lỗi P2-01) |
| Đi xuyên đồ vật | Rất ít | Anh Dũng: 6 mẫu trong 6 giờ game (khoảng 1,2 giây), lúc rời ghế |

### 2.4. NPC tự sống – nhà ở

| Câu hỏi | Kết quả | Bằng chứng |
|---|---|---|
| Lịch sinh hoạt riêng | Có | Tùng (ở ghép, ngày thường): ngủ đến 9:50 → nấu ăn 10:10 → chơi game 11:00 → ra ngoài 13:10. Bố mẹ (ngày thường): mẹ nấu 6:00, đi chợ 7:00, quét nhà 9:10, uống trà 10:10, nấu 11:10, ăn 12:10, xem tin 14:10; bố đi làm 7:20 |
| Dùng đồ trong nhà | Có | Bếp (🍳), máy chơi game (🎮), bàn trà (🍵), sofa đọc báo (📰), bàn thờ (🙏), tủ lạnh (🥤) |
| Hợp thời gian | Có | Cuối tuần khác ngày thường (bố đọc báo, thắp hương; mẹ chiều sang hàng xóm) |
| Nói chuyện trong nhà | **Rất ít** | Nhà bố mẹ ngày thường: **0 câu** trong 10 giờ game; cuối tuần: **2 câu** trong 10 giờ game (xem P2-08) |
| Đi xuyên đồ vật | Không | Các lần “chân trong đồ đạc” đo được ban đầu là lúc NPC được dịch chuyển thẳng khi ở ngoài khung nhìn (cố ý, để nhẹ máy) và lúc ngồi vào sofa. Đo lại chỉ tính lúc đi bộ trong khung nhìn: 0 |

### 2.5. NPC tự sống – thành phố

Mỗi nơi quan sát 10 giờ game (5 phút thật).

| Nơi | Đông nhất | Vào/ra | Hiện ra/biến mất bất thường | Chồng lấn khi đứng yên | Câu nói (khác nhau) |
|---|---|---|---|---|---|
| Cà phê (thường) | 7 | 27/30 | 0 | ≤0,4 giây (đo lại) | 44 (10) |
| Cà phê (cuối tuần) | 8 | 33/37 | 0 | ≤0,4 giây | 38 (8) |
| Trà đá | 6 | 25/27 | 0 | 1 giây ở cửa (đo lại) | 36 (10) |
| Bia hơi | 5 | 25/27 | 0 | có, ở cửa (cách đo cũ, chưa đo lại) | 30 (10) |
| Cơm bụi | 5 | 23/24 | 0 | có, ở cửa (cách đo cũ, chưa đo lại) | 0 |
| Thư viện | 5 | 21/21 | **Linh hiện ra/biến mất tại chỗ ngồi** (4 lần) | ít | 0 |
| Trung tâm thương mại | 7 | 37/39 | **Tùng hiện ra/biến mất tại quầy** | 5,2 giây ở cửa (đo lại) | 0 |
| Bến xe | 3 | 26/27 | **27 lần biến mất giữa sân chờ** (lên xe nhưng không có xe) | ít | 0 |
| Hồ | 9 | 23/23 | 0 | có, ở ghế đá (cách đo cũ, chưa đo lại) | 0 |
| Phố ngày thường | 9 | 78/77 | **26 hiện ra, 6–28 biến mất** ngay giữa màn hình | 2,6 giây | 11–12 (11–12) |
| Phố cuối tuần | 9 | 110/111 | **38 hiện ra, 41 biến mất** giữa màn hình | 2,6 giây | 16 (10) |
| Phố trời mưa | 8 | 57/57 | 1 | người trú mưa đứng sát nhau | 0 |

Cột “chồng lấn” ghi “đo lại” là số của lần đo thứ hai: chỉ tính khi cả hai người cùng đứng yên. Lần đo đầu tính cả lúc hai người đi ngang qua nhau, nên số cao hơn thực tế; quán cà phê từ “58 mẫu” xuống còn 0,4 giây khi đo lại.

Nhận xét chung:
- **Mật độ theo giờ và ngày hoạt động đúng:** cà phê đông chiều và tối; bia hơi từ 16 giờ; cơm bụi đông giờ trưa; phố đông 7–8 giờ và 17–19 giờ (9 người), vắng sau 22 giờ; cuối tuần đông hơn.
- **Khách có vòng đời đầy đủ:** vào cửa → gọi đồ → ngồi → trả tiền (💸) → ra về. Không khách nào đứng yên quá 54 phút game ở cà phê, quá 61 phút ở bia hơi.
- **Nhân viên quán đứng yên cả ngày:** chị pha chế, bác trà đá, cô bán cơm, thu ngân đứng một chỗ 10 tiếng game, không phục vụ, không phản ứng khi khách gọi đồ. Chị pha chế còn đứng **phía trước** quầy (xem ảnh).
- **Hoạt động ngoài trời:** hồ có người chạy bộ, đi dạo, nhóm tập dưỡng sinh 5:30–7:12; phố có xe máy dừng trước quán, hai người quen dừng nói chuyện, trú mưa (☔); ngõ có hàng xóm, trẻ con, người dắt chó.
- **Sự kiện thế giới:** văn phòng 3 sự kiện/ngày (tranh luận, giao task, họp đột xuất), phố 2–5 lần gặp nhau/ngày. Có giãn cách.

### 2.6. Đời sống xã hội

| Câu hỏi | Kết quả | Bằng chứng |
|---|---|---|
| NPC tự bắt chuyện | Có | Văn phòng: sang bàn nhau (💬), Phong hỏi anh Dũng, rủ nhau về (“Đi cùng không?” – “Đợi tí, tắt máy đã.”) |
| Phản ứng khi gặp người quen | Có | Chào khi đi ngang (👋), câu theo độ thân; cùng một cặp 40 phút game mới chào lại |
| Từ chối giao tiếp | Có | 🙅 “Anh đang tập trung.” |
| Hội thoại khác nhau | **Một phần** | Văn phòng 23–31 câu khác nhau/ngày. **Khách ở quán chỉ có 4 đoạn hội thoại** (`GENERIC_CHAT`) nên lặp nhiều: “Cuối tuần đi đâu?” 7 lần/10 giờ ở cà phê; người lạ ở bia hơi hỏi nhau “Deploy chưa?” 5 lần |
| Quan hệ NPC thay đổi | Có, chậm | Sau một ngày làm việc: Mai–Hạnh 62→64, Dũng–Hạnh 56→57, độ tin Dũng–Mai 60→59 sau tranh luận. Mỗi ngày thay đổi tối đa ±2 |
| Hành vi lặp đi lặp lại | **Có** | **Câu chào chiếm 32/57 câu** một ngày ở văn phòng (“Chào nhé.” 6 lần, “Ừ.” 6 lần) |
| Tự nhiên hay kích hoạt cứng | Nửa nọ nửa kia | Lịch, việc xen, chào, từ chối là luật có điều kiện, nhưng có ngẫu nhiên theo ngày nên nhìn khá tự nhiên ở văn phòng. Ở quán và phố, cùng 4 đoạn hội thoại lặp lại nên thấy rõ là kịch bản. Câu “Dũng, Mai vào họp nhanh nhé!” bị viết cứng tên, nên khi người được gọi là Phong thì chị Hạnh vẫn gọi tên Dũng và Mai |

### 2.7. Trí nhớ của NPC

| Bước | Kết quả | Bằng chứng |
|---|---|---|
| Người chơi giúp NPC | Ghi nhớ đúng | Sự kiện “Anh Dũng nhờ một việc”, bấm nút thật “Đi mua ngay” → `dung>me:ev:coffee_run+` |
| Lưu, tải lại trang thật | Còn nguyên | Sau `reload` + “Tiếp tục”: cả trí nhớ người chơi và trí nhớ NPC–NPC (Dũng–Mai tranh luận) |
| Gặp lại hôm sau | NPC nhớ | Đi bộ bằng phím đến gần anh Dũng ở công ty: anh nói **“Cốc bạc xỉu hôm trước chuẩn vị đấy.”**, mặt vui |
| Nhắc lại phù hợp | Phù hợp | Câu đúng chuyện, đúng người. Một tuần sau nhắc lần hai (“Hôm nào anh mời lại em cốc nước.”), sau đó thôi |
| Trí nhớ NPC–NPC | Có | Hôm sau Mai và Dũng gặp nhau: “Chuyện tách hàm hôm qua, tôi nghĩ lại rồi.” – “Thế à, nói nghe xem.” |
| **Chủ động “Bắt chuyện” (E) với anh Dũng** | **Không nhắc chuyện cũ** | Phần bắt chuyện (`officeTalk`) không đọc trí nhớ. Trí nhớ chỉ hiện ở **một câu chào khi đi ngang**, mỗi lần vào cảnh một lần (xem P2-05) |
| Chơi bằng nút (không đi lại tự do) | Không thấy trí nhớ | Trí nhớ vẫn được ghi (bản lưu cũ chơi bằng jsdom ghi 7–10 chuyện) nhưng không có chỗ nào hiện ra |

### 2.8. Di chuyển và hoạt ảnh

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| WASD, mũi tên | Đạt | 1 giây đi được 74 đơn vị; đi vào/ra chậm hơn (18 đơn vị/0,4 giây) |
| Đi chéo (8 hướng) | Đạt | D+S: đi chéo, có chuẩn hóa tốc độ |
| Chạy (Shift) | Đạt | Nhanh hơn đi bộ |
| Đổi hướng liên tục | Đạt | 8 lần đổi trái/phải liên tục: bước nhảy lớn nhất mỗi khung hình 1,24 đơn vị (không giật) |
| Hoạt ảnh đi / đứng | Đạt | Đang đi: `act-walk`, 13 hoạt ảnh chạy; dừng: về dáng đứng, vẫn còn 3 hoạt ảnh (thở, chớp mắt), không đứng hình |
| Va chạm | Đạt | Đi ngẫu nhiên 90 giây (300 lượt bấm): **0 lần** đứng trong đồ đạc, không kẹt quá 3 lượt liền |
| Tương tác đồ vật | Đạt | Đứng cạnh vòi sen, E mở thực đơn |
| Di chuyển khi đang mở thực đơn | Thực đơn tự đóng, nhân vật đi tiếp | Hợp lý; không có trường hợp “vừa dùng đồ vừa đi” |
| Camera | Đạt | Theo nhân vật đến cuối bản đồ |
| Thứ tự trước/sau (z-index) | Đạt (một chiều) | Đứng phía ngoài thì che NPC. Chưa kiểm được chiều ngược lại vì không đứng được phía sau sofa |
| Chuyển cảnh | Đạt | 12 lần chuyển liên tục: 10–108 ms mỗi lần (trung bình 39 ms), chỉ một khung thế giới, số khung hình vẽ mỗi giây không tăng (60,5 → 60) |
| Đi bằng cửa | Đạt | Phố → quán cà phê → ra phố, đứng đúng trước cửa quán |
| Joystick điện thoại | Đạt | Kéo sang phải 1 giây: đi 139 đơn vị (chạy). Có nút tương tác thay E. Không tràn ngang |

---

## 3. Danh sách lỗi

Không tìm thấy lỗi **P0** (mất dữ liệu, không chơi được) hay **P1** (chức năng chính hỏng).

### P2 – Gameplay không tự nhiên hoặc trải nghiệm kém

**P2-01. Nhiều NPC đứng chồng lên nhau ở pantry khi cùng đến một lúc**
- File: `js/song/hanh-vi-npc.js:18-22` (`seatFor`), `:108-113` (`songForceBeat`), `js/song/xa-giao-npc.js:43`
- Tái hiện: ngày làm việc, khoảng 15:00 có sự kiện chị Mai mang bánh (🍰) hoặc hai người cùng đi lấy nước. Quan sát pantry.
- Mong đợi: mỗi người đứng một chỗ cạnh nhau.
- Thực tế: hai–ba người đứng trùng một điểm, lâu nhất 10,6 giây.
- Nguyên nhân: chỗ đứng chỉ được giữ (`ai.seat`) **sau khi** đi đến nơi; những người được gọi cùng lúc đều thấy chỗ còn trống nên chọn cùng một điểm.
- Hướng sửa: giữ chỗ ngay lúc chọn (trước khi đi); thêm vài chỗ đứng quanh pantry.

**P2-02. Người đi bộ hiện ra và biến mất ngay giữa màn hình ở chỗ giáp ngõ và phố**
- File: `js/song/pho-song.js:43` (điểm xuất phát và điểm đến `PHO.LANE + 10`)
- Tái hiện: ra phố, đứng trong ngõ hoặc gần đầu phố (x khoảng 250–450).
- Mong đợi: người đi đường đi vào từ mép bản đồ hoặc từ một cánh cửa.
- Thực tế: người đi bộ hiện ra và biến mất ở x = 410, trong khung nhìn. Ngày thường 26 lần hiện ra và 28 lần biến mất bất thường trong 10 giờ game; cuối tuần 38 và 41 lần.
- Hướng sửa: cho xuất hiện ngoài khung nhìn, hoặc đi vào từ trong ngõ; hoặc hiện dần.

**P2-03. Tùng và Linh “ngồi” ở quán trái với lịch của chính họ, và ngồi yên 10 tiếng**
- File: `js/pho/di-pho.js:73-80` (`roomNpcs`, nhân vật `need`), `js/pho/noi-that-quan.js:25,33`, `js/song/thanh-pho.js`
- Tái hiện: chiều thứ Hai vào quán trà đá (hoặc cà phê) khi có hoạt động “trà đá” (hoặc “cà phê”).
- Mong đợi: Tùng đang đứng quầy ở trung tâm thương mại 13:30–21:30 (theo lịch phase 3); Linh đang ở thư viện.
- Thực tế: Tùng ngồi ở trà đá từ 15:00 đến 01:00, Linh ngồi ở cà phê từ 14:00 đến 24:00, không đổi tư thế. Lịch phase 3 bị bỏ qua vì nhân vật “dùng cho hoạt động” luôn được đặt vào.
- Hướng sửa: chỉ đặt họ khi lịch nói họ ở đó (hoặc khi đã hẹn); nếu không, hoạt động vẫn làm được nhưng không có họ. Cho họ có việc xen (uống, điện thoại) như NPC ở nhà.

**P2-04. Tùng và Linh hiện ra hoặc biến mất ngay tại chỗ ngồi/quầy**
- File: `js/song/thanh-pho.js:33-37` (`cityShow`)
- Tái hiện: ở thư viện lúc 8:18 hoặc 11:30; ở trung tâm thương mại lúc 13:30 hoặc 21:30.
- Thực tế: đến giờ thì nhân vật bật hiện/tắt ngay tại bàn, không đi vào từ cửa.
- Hướng sửa: đi từ cửa vào chỗ và đi ra cửa khi hết giờ (dùng lại `songWalk`).

**P2-05. Trí nhớ chỉ hiện ở một câu chào thoáng qua**
- File: `js/the-gioi/the-gioi.js:370` (`memGreet` trong câu chào tự động), `js/van-phong/ngay-lam-viec.js:63` (`officeTalk` không đọc trí nhớ)
- Tái hiện: giúp anh Dũng; hôm sau đến công ty, bấm E → “Bắt chuyện”.
- Mong đợi: câu chuyện có nhắc lại chuyện cũ.
- Thực tế: trí nhớ chỉ được nói một lần khi đi ngang. Nếu đã chào trước đó hoặc đứng xa thì người chơi bỏ lỡ. Người chơi chế độ bấm nút không bao giờ thấy.
- Hướng sửa: cho “Bắt chuyện” và các cảnh có NPC (cảnh chữ) dùng câu nhắc chuyện cũ khi có.

**P2-06. Hội thoại của khách lặp lại nhiều và lệch ngữ cảnh**
- File: `js/song/dan-so.js:122`, `js/song/pho-song.js:91`, `js/du-lieu/tinh-cach.js:103` (`GENERIC_CHAT` chỉ có 4 đoạn)
- Thực tế: ở cà phê 44 câu nhưng chỉ 10 câu khác nhau trong 10 giờ game; “Cuối tuần đi đâu?” 7 lần. Người lạ ở bia hơi hỏi “Deploy chưa?”, “Họp mấy giờ?”; 18 giờ ở trà đá vẫn hỏi “Trưa ăn gì?”.
- Hướng sửa: bảng câu riêng cho từng nơi và buổi (cà phê, bia hơi, chợ, bến xe), dùng `pickLine` để không lặp.

**P2-07. Nhân viên quán đứng yên cả ngày, không phục vụ**
- File: `js/pho/noi-that-quan.js:25` (và các nơi khác trong `noi-that-quan.js`, `noi-that-lon.js`), `js/song/dan-so.js` (bước `go counter`)
- Thực tế: chị pha chế, bác trà đá, cô bán cơm, thu ngân đứng một chỗ 10 tiếng game; khách đến quầy “gọi đồ”/“trả tiền” nhưng nhân viên không có phản ứng. Chị pha chế đứng phía trước quầy.
- Hướng sửa: khi khách ở quầy thì nhân viên quay mặt, gật đầu, nói một câu, có lúc đi mang đồ; đặt nhân viên phía sau quầy.

**P2-08. Ở nhà rất ít nói chuyện**
- File: `js/song/lich-npc.js` (`HOME_ACT`, beat `chat`), `js/song/xa-giao-npc.js`
- Thực tế: nhà bố mẹ ngày thường 0 câu, cuối tuần 2 câu trong 10 giờ game; Tùng ở nhà một mình không có tương tác nào ngoài việc riêng.
- Ghi chú: một phần do lịch (bố đi làm, mẹ ở nhà một mình). Nhưng lúc hai người cùng ở nhà (ăn trưa, xem tin buổi tối) cũng gần như không nói gì, nên ngôi nhà có cảm giác im lặng.
- Hướng sửa: cho bữa ăn chung có hội thoại; mẹ nói với người chơi khi người chơi ở gần.

**P2-09. Bến xe: hành khách biến mất ở giữa sân chờ**
- File: `js/song/dan-so.js:42` (bước `board`), `:100-102`
- Thực tế: 27 lần biến mất tại x = 360 trong 10 giờ game; không có xe khách nào đến.
- Hướng sửa: có xe khách đỗ hoặc chạy qua, hoặc cho khách đi ra mép cảnh.

**P2-10. Xe máy chạy vào tận cuối ngõ nhà**
- File: `js/song/pho-song.js:67` (`from`/`to` là 10 và `PHO.W - 10`, tức cả ngõ)
- Thực tế: xe máy chạy qua ngõ dãy trọ đến x = 10–16 (cuối ngõ, trước cổng nhà) rồi biến mất. Có lần một xe đứng yên lâu tới 98 phút game (chưa rõ nguyên nhân, cần xem thêm).
- Hướng sửa: xe chỉ chạy trên phố chính (từ `PHO.LANE`), vào ngõ thì phải là người trong ngõ.

**P2-11. Hết buổi khi đang ở ngoài phố: kết quả không khớp nơi đang đứng**
- File: `js/pho/di-pho.js:67-71` (`phoTimeout`), `roamTimeoutChoice`
- Tái hiện: buổi tối ra phố, đi lang thang đến khi hết buổi.
- Mong đợi: kết quả là đi dạo phố (hoặc về nhà nghỉ).
- Thực tế: “Lang thang ngoài phố, buổi này trôi qua lúc nào không hay. Bạn định xem một tập phim. Tập phim đó đã tự kéo dài thành ba tập.” Game tự chọn hoạt động ở nhà và tính chỉ số của hoạt động đó (ảnh chụp phút 30).
- Hướng sửa: khi hết giờ ở ngoài, dùng một kết quả riêng của việc “đi dạo” với chỉ số tương ứng.

**P2-12. Vòng lặp ngày làm việc lặp lại và sự kiện ít**
- File: nội dung (`js/canh/canh-di-lam.js`, `js/su-kien/su-kien.js` có 19 sự kiện)
- Thực tế: trong 60 phút chơi (ngày 1 → 17), ngày làm việc nào cũng là họp đầu ngày → task → task → tan làm; chỉ gặp 15 sự kiện ngẫu nhiên. Xem mục 4.
- Hướng sửa: thêm loại ngày khác nhau (deadline, demo, đi gặp khách, team building), thêm sự kiện theo tuần, cho các việc trong thế giới tạo ra hệ quả nhìn thấy được.

### P3 – Lỗi giao diện, hoạt ảnh hoặc tối ưu nhỏ

**P3-01. Giờ trong nhật ký sai và lộn thứ tự**
- File: `js/loi/nep-sinh-hoat.js:89-93` (`feedTime`), `js/giao-dien/man-choi.js:179` (`choose`)
- Thực tế: “Chuẩn bị CV” làm lúc 10:33 nhưng ghi 07:00; “Họp đầu ngày” ghi 07:00; “Task mới” ghi 12:00 nhưng xếp sau mục 09:12. Lý do: chọn từ “Danh sách lựa chọn” (hoặc cảnh không có `ROAM_NOW`) thì lấy giờ đầu buổi.
- Hướng sửa: khi thế giới đang chạy thì luôn lấy giờ của đồng hồ thế giới.

**P3-02. Hai đồng hồ lệch nhau**
- Thực tế: đầu trang ghi “Trưa, 12:00” trong khi đồng hồ trong cảnh là 13:30.
- File: phần đầu trang (`updateHUD`) dùng giờ đầu buổi.

**P3-03. Câu họp đột xuất viết cứng tên**
- File: `js/song/su-kien-the-gioi.js:48`
- Thực tế: “Dũng, Mai vào họp nhanh nhé!” dù người được gọi có thể là Phong.

**P3-04. Người ngồi ghế đá ở hồ lại đứng cạnh ghế**
- File: `js/song/dan-so.js:43` (`lakeSit` dùng động tác `''`)

**P3-05. Khách vào rồi ra ngay ở cửa khi hết chỗ**
- File: `js/song/dan-so.js:85` (khách đi theo cặp vẫn được tạo khi đã hết ghế)
- Thực tế: ở trà đá, cơm bụi, trung tâm thương mại, khách đứng trùng nhau ở cửa 1–5 giây rồi biến mất.

**P3-06. Anh Dũng đi xuyên mép bàn khi rời ghế**
- Thực tế: 6–8 mẫu trong 6 giờ game, khoảng 1–1,5 giây. Ghế nằm trong vùng bàn nên đoạn đầu không có đường đi.

**P3-07. Biển tên công ty đè lên gợi ý “Bàn của bạn”**
- Thấy ở văn phòng Cú Đêm Lab (ảnh phút 15).

**P3-08. Thông báo điện thoại dồn nhiều**
- 13 tin chưa đọc ở ngày 4 khi người chơi không mở điện thoại.

**P3-09. Bài kiểm thử phụ thuộc thời gian chờ cố định**
- `tests/kiem-thu-ra-pho.js` (4 mục), `tests/kiem-thu-mo-dau.js` FAIL khi máy bận, PASS khi chạy riêng.
- Hướng sửa: chờ theo điều kiện (`waitForFunction`) thay vì số mili giây.

**P3-10. Bài chơi ngẫu nhiên cần nhiều bộ nhớ**
- jsdom giữ khoảng 5MB mỗi ván, kể cả với mã thử đơn giản, nên không phải lỗi game. Đã xử lý bằng `--max-old-space-size` ở v17.3.

**P3-11. Điện thoại: phố giờ cao điểm tụt FPS**
- Đo được: giả lập iPhone 13 với CPU chậm 6 lần, vừa đi vừa xem phố lúc 17:30: **42,6 FPS**, 95% khung hình dưới 33,4 ms, 4 khung hình chậm hơn 50 ms trong 8 giây, CPU luồng chính 97%. Các cảnh khác vẫn khoảng 59–60 FPS.
- Nguyên nhân có thể: nhiều hình SVG (người đi bộ, xe, chó, biển hiệu), tính lại kiểu (style) chiếm 16% CPU.
- Ghi chú: game giới hạn mỗi khung hình tối đa 0,05 giây (`js/the-gioi/the-gioi.js:325`). Nếu FPS tụt dưới 20 thì đồng hồ và bước đi chậm lại; mức này chưa xảy ra.
- Hướng sửa: ẩn hẳn (`display:none`) nhân vật ngoài khung nhìn, giảm số người đi bộ trên điện thoại.

**P3-12. Nhiều file nhỏ**
- 81 file JS/CSS riêng, tổng khoảng 950 KB (chưa nén). Khi chơi trên GitHub Pages sẽ có hơn 80 lượt tải. **Chưa đo được** thời gian tải qua mạng thật (chỉ đo khi mở file cục bộ).

---

## 4. Chơi thử

**Cách chơi thử:** bot chơi liên tục 60 phút thật (không tua nhanh), bấm vào đồ vật hoặc cửa để nhân vật tự đi tới, chọn việc ngẫu nhiên, khoảng một nửa số lần đi ra phố hoặc vào quán. Chụp màn hình ở phút 1, 5, 15, 30, 45, 60. Nhận định về cảm giác dưới đây là của người kiểm tra, dựa trên ảnh và dữ liệu. **Chưa có người thật chơi thử.**

**Nhịp chơi đo được:** trung bình **3,5 phút thật cho một ngày game**. 60 phút đi được từ ngày 1 đến ngày 17. Chơi hết 56 ngày mất khoảng **3,3 giờ** với bot (bot không đọc chữ); người thật có lẽ 4–6 giờ (nhận định), trừ khi dùng “Qua nhanh”.

| Mốc | Ngày game | Thấy gì | Đánh giá |
|---|---|---|---|
| **5 phút** | Ngày 1, trưa | Màn mở đầu đẹp, tạo nhân vật rõ. Vào phòng trọ có mũi tên vàng chỉ bàn học để chuẩn bị CV. Mục tiêu đầu tiên rõ: chuẩn bị CV, nộp hồ sơ | **Tốt.** Hiểu ngay phải làm gì. Hơi rối: đầu trang ghi “Trưa, 12:00” trong khi đồng hồ cảnh ghi 13:30; nhật ký ghi “Chuẩn bị CV” lúc 07:00 dù làm lúc 10:33 |
| **15 phút** | Ngày 4 | Đã phỏng vấn và có việc ở Cú Đêm Lab từ ngày 2. Văn phòng tối, có mèo, đồng nghiệp tự làm việc | **Tốt.** Lần đầu vào văn phòng là lúc ấn tượng nhất. Biển tên công ty đè lên gợi ý “Bàn của bạn” |
| **30 phút** | Ngày 8 | Đã qua 5 ngày làm việc cùng một cấu trúc. Buổi tối đi lang thang ngoài phố rồi hết giờ, kết quả lại là “xem phim” (P2-11). Điện thoại có 18 tin chưa đọc | **Bắt đầu lặp.** Thế giới đẹp nhưng không có việc gì mới để làm |
| **45 phút** | Ngày 13 (thứ Bảy) | Cuối tuần ra phố gặp Tùng. Điện thoại 35 tin chưa đọc | Cuối tuần có không khí khác, nhưng các nơi chỉ có 1–2 việc |
| **60 phút** | Ngày 17 | Vẫn vòng lặp cũ. Tiền giảm từ 4,5 triệu xuống 1,15 triệu (lương đầu tiên ngày 10/12 = ngày 25). Quan hệ với chị Hạnh tụt còn 13 do lựa chọn ngẫu nhiên, Mai 91, Phong 86 | Hệ quả có, nhưng chủ yếu thấy qua con số |

**Trả lời các câu hỏi:**
- **Người chơi có hiểu phải làm gì không?** Có trong ngày đầu: mũi tên chỉ đường, gợi ý [E], thực đơn rõ. Sau đó mục tiêu dài hạn (sống sót 8 tuần, lương, quan hệ) không được nhắc lại trên màn hình chơi.
- **Có mục tiêu rõ ràng không?** Ngắn hạn có (tìm việc, đi làm đúng giờ, trả tiền nhà). Dài hạn mờ: không có bảng mục tiêu hay thành tựu; kết thúc 56 ngày là tổng kết.
- **Có hoạt động thú vị ngoài công việc không?** Có 20 hoạt động, 19 câu chuyện đi chơi với 7 người, ra phố 9 địa điểm. Nhưng trong mỗi nơi chỉ làm được 1–2 việc, và khách hay nhân viên chỉ “Chào” được.
- **Các địa điểm có lý do để khám phá không?** Ít. Không có gì mới mở ra theo thời gian. Thư viện, trung tâm thương mại, bến xe hầu như không có hội thoại (0 câu trong 6–10 giờ game quan sát).
- **Có nhàm chán không?** Có, từ khoảng phút 30. Nguyên nhân chính: (1) ngày làm việc lặp đúng một khuôn; (2) 19 sự kiện ngẫu nhiên, gặp 15 trong 17 ngày, sắp lặp lại; (3) thế giới sống để nhìn chứ không để tham gia; (4) trí nhớ NPC rất khó thấy; (5) điện thoại dồn tin đến mức bỏ qua luôn.
- **Hoạt động có ảnh hưởng đến cuộc sống và sự nghiệp không?** Có: tiền, năng lượng, tinh thần, sức khỏe, quan hệ, hiệu suất đều đổi theo lựa chọn. Nhưng ảnh hưởng đến chậm và chủ yếu thể hiện bằng số; ít thay đổi nhìn thấy được trong thế giới (ví dụ chị Hạnh lạnh nhạt không làm chị đối xử khác trong văn phòng).

**Hoạt động chưa có giá trị gameplay rõ:**
- Đi lang thang ngoài phố: không có gì xảy ra ngoài một sự kiện bất ngờ mỗi loại một lần mỗi ngày.
- Chào khách lạ và nhân viên: chỉ có một câu.
- Dắt xe máy chỉ để đi nhanh hơn.
- Quan sát NPC nói chuyện: không ảnh hưởng gì đến người chơi.

---

## 5. Hiệu năng

**Thời gian tải** (mở file cục bộ, đến khi hiện nút “Bắt đầu”): máy bàn **237 ms**, laptop **533 ms**, điện thoại **693 ms**. Chưa đo qua mạng thật (xem P3-12).

**FPS và CPU theo cảnh** (đo 8 giây mỗi cảnh; CPU là phần trăm thời gian luồng chính bận):

| Cảnh | NPC trên cảnh | Máy bàn | Laptop (CPU ×4 chậm) | Điện thoại (iPhone 13, CPU ×6 chậm) |
|---|---|---|---|---|
| Màn mở đầu | – | 59,7 FPS · CPU 15% | 57,1 · 70% | 59,2 · 74% |
| Nhà (ở ghép) | 1 | 59,9 · 9% | 59,7 · 33% | 59,7 · 47% |
| Văn phòng | 4 | 59,8 · 10% | 59,9 · 43% | 59,5 · 62% |
| Cà phê cuối tuần đông | 7 | 59,8 · 15% | 59,7 · 53% | 59,1 · 68% |
| Phố 17:30, đang đi | 7 | 59,5 · 24% | 57,7 · 81% | **42,6 · 97%** (p95 33,4 ms) |

**Chuyển cảnh** (từ lúc gọi đến khi thế giới dựng xong): máy bàn 26–40 ms; laptop 67–166 ms; điện thoại 136–273 ms. Chuyển 12 lần liên tục: số khung hình vẽ mỗi giây không tăng (60,5 → 60), chỉ một khung thế giới.

**Bộ nhớ:**
- Bộ nhớ JS 2,6–4,2 MB ở mọi cảnh.
- **Chạy liên tục 30 phút** (đổi cảnh mỗi 90 giây, 8 loại cảnh): FPS 58,5–60,2 suốt 30 phút; bộ nhớ JS 2,7 → 3,4 MB; số nút trang quay về đúng giá trị cũ mỗi lần trở lại một cảnh (phố khoảng 1.960–1.990, cà phê khoảng 1.214, văn phòng khoảng 1.110–1.230). **Không rò bộ nhớ.**
- Chuyển cảnh 40 lần rồi ép dọn bộ nhớ: số nút đứng yên ở 1.253.

**Lưu ý về một số đo dễ hiểu nhầm:** trong lượt chơi thử 60 phút, số nút trang đo được tăng dần từ 2.149 lên 58.171. Kiểm tra lại cho thấy đó là do **công cụ chơi thử** giữ tham chiếu đến các phần tử nó đã bấm (Playwright giữ lại cho đến khi đóng trang). Chơi bằng cách không giữ tham chiếu (4 phút đi lại thật, rồi chụp bộ nhớ): **0 nút bị giữ lại**. Đây không phải lỗi của game.

**Chưa kiểm tra được:** điện thoại và laptop thật; máy có card đồ họa; mạng chậm.

---

## 6. Những tính năng đã hoạt động tốt

- **Ổn định và dữ liệu:** 16/16 bộ kiểm thử đạt; 40 ván chơi ngẫu nhiên đến ngày 56 không lỗi; bản lưu từ v11, v13.3, v15, v16.1 mở được và chơi tiếp đến hết; lưu và tải lại giữ đủ trí nhớ và quan hệ NPC.
- **Điều khiển:** WASD, mũi tên, đi chéo, chạy, joystick, va chạm (0 lần lọt vào đồ đạc sau 300 lượt đi ngẫu nhiên), camera, đi qua cửa đúng chỗ, chuyển cảnh nhanh.
- **Văn phòng sống:** đến làm, họp, làm việc, việc xen, ăn trưa, về đúng giờ; có người đến muộn, tranh luận, giao task, họp đột xuất, ăn bánh; rủ nhau về.
- **Lịch ở nhà:** đúng giờ, khác ngày thường và cuối tuần, dùng đồ trong nhà.
- **Mật độ thành phố:** đúng theo giờ và cuối tuần; khách có vòng đời đầy đủ; phố có giờ cao điểm, trú mưa, xe dừng trước quán, ngõ có hàng xóm, trẻ con, người dắt chó.
- **Trí nhớ NPC:** ghi đúng chuyện, đúng người, đúng tốt/xấu; nhắc lại đúng câu, đúng nét mặt; có giới hạn và tự quên; còn sau khi tải lại trang; NPC nhớ chuyện với nhau.
- **Hiệu năng:** 60 FPS trên máy bàn và laptop giả lập ở mọi cảnh; không rò bộ nhớ sau 30 phút; tải dưới 0,7 giây ở mọi cấu hình (file cục bộ).
- **Màn mở đầu và tạo nhân vật:** đẹp, rõ, một nút chính.

## 7. Những tính năng hoạt động nhưng chưa tự nhiên

- **Người đi đường hiện ra và biến mất ngay giữa màn hình** ở chỗ giáp ngõ và phố (P2-02); Tùng và Linh bật hiện ngay tại chỗ ngồi hoặc quầy (P2-04); khách bến xe biến mất giữa sân (P2-09).
- **Tùng và Linh ngồi ở quán trái lịch, bất động 10 tiếng** (P2-03).
- **Nhân viên quán không phục vụ, đứng yên cả ngày** (P2-07).
- **Hội thoại khách lặp và lệch ngữ cảnh** (P2-06). Câu chào chiếm hơn một nửa số câu ở văn phòng.
- **Nhà ở im lặng** (P2-08).
- **NPC đứng chồng nhau ở pantry** (P2-01); khách vào rồi ra ngay ở cửa khi hết chỗ (P3-05).
- **Xe máy chạy vào tận cuối ngõ nhà** (P2-10).
- **Anh Dũng ngồi yên 74–137 phút liền:** đúng tính cách, nhưng nhìn lâu thấy như ảnh tĩnh.
- **Hết buổi ở ngoài nhưng kết quả là “xem phim ở nhà”** (P2-11).
- **Nhật ký và hai đồng hồ lệch nhau** (P3-01, P3-02).
- **Người ngồi ghế đá ở hồ lại đứng** (P3-04).

## 8. Những tính năng chưa hoạt động

Không có chức năng đã hứa nào bị hỏng hẳn. Những phần **chưa có** hoặc **chưa hiện cho người chơi**:
- **Trí nhớ NPC trong “Bắt chuyện” và trong cảnh chữ:** chưa có (P2-05). Người chơi chế độ bấm nút không thấy trí nhớ.
- **Nhân viên phục vụ khách:** chưa có (P2-07).
- **Xe khách ở bến xe:** chưa có, khách “lên xe” bằng cách biến mất (P2-09).
- **Tham gia vào cuộc sống của NPC** (ngồi cùng bàn khách, nghe chuyện, xen vào tranh luận): chưa có.
- **Chưa kiểm tra được:** từng trò chơi nhỏ chơi bằng tay (bot chọn “Để nhân vật tự làm”, chỉ có kiểm thử tự động); thiết bị thật; mạng thật; trình đọc màn hình.

## 9. Các vấn đề cần ưu tiên xử lý

**Bắt buộc sửa trước v18** (nhỏ, ít rủi ro, ảnh hưởng lớn đến cảm giác “thế giới thật”):
1. **P2-03** Tùng và Linh ở quán trái lịch: cho lịch phase 3 quyết định họ có mặt hay không.
2. **P2-01** NPC đứng chồng ở pantry: giữ chỗ trước khi đi.
3. **P2-02, P2-04, P2-09** hiện ra/biến mất giữa màn hình: đi vào từ cửa hoặc từ ngoài khung nhìn.
4. **P2-11** hết buổi ở ngoài phố: kết quả “đi dạo” riêng.
5. **P3-01, P3-02** giờ trong nhật ký và hai đồng hồ: lấy đúng giờ thế giới.
6. **P3-09** bài kiểm thử phụ thuộc thời gian chờ: chuyển sang chờ theo điều kiện, để kiểm thử đáng tin.

**Nên sửa sớm** (ảnh hưởng gameplay):
7. **P2-05** cho trí nhớ hiện trong “Bắt chuyện” và cảnh chữ.
8. **P2-06** câu nói riêng cho từng nơi và buổi.
9. **P2-07** nhân viên phục vụ khách.
10. **P2-08** nói chuyện trong bữa ăn ở nhà.
11. **P2-10** xe máy không vào ngõ.

**Có thể để sau:** P3-03 đến P3-08, P3-11, P3-12.

## 10. Đề xuất kế hoạch nâng cấp tiếp theo

**v17.4 – Sửa lỗi tin cậy của thế giới (khoảng 1 PR):** các mục bắt buộc 1–6 ở trên. Không thêm tính năng.

**v18 – Tham gia vào thế giới sống (gameplay):**
- Trí nhớ dùng ở mọi nơi có NPC nói chuyện (bắt chuyện, cảnh chữ, tin nhắn), và ảnh hưởng hành vi nhìn thấy được (chị Hạnh lạnh nhạt thì ít ghé bàn hơn; Tùng còn nợ thì tránh mặt).
- Mỗi địa điểm có 2–3 việc mới gắn với NPC ở đó: ngồi cùng bàn khách quen ở cà phê, giúp bác trà đá dọn, đọc bảng tin ở thư viện, gặp người quen ở bến xe.
- Nhân viên phục vụ, xe khách đến và đi, câu nói theo nơi và buổi.

**v18.x – Chống lặp vòng ngày làm việc:**
- Loại ngày làm việc khác nhau (hạn chót, demo, đi gặp khách, sự cố) theo tuần.
- Thêm sự kiện theo mốc tuần (sinh nhật, lương, tiền nhà đã có; thêm đám cưới bạn, ốm, tăng ca cuối tuần…).
- Bảng mục tiêu tuần ngắn trên màn hình chơi (ví dụ: “Tuần 3: hoàn thành 5 task, đi chơi với Linh, để dành 500.000đ”).
- Gom tin nhắn điện thoại, hoặc cho người chơi biết tin nào quan trọng.

**Hiệu năng (khi cần):** ẩn hẳn nhân vật ngoài khung nhìn, giảm người đi bộ trên điện thoại; gộp file khi phát hành.

**Kiểm thử:** giữ các script quan sát của lần audit này thành một bài kiểm thử định kỳ (“đứng xem 5 phút”) để bắt lỗi hiện/biến mất, chồng lấn, đứng yên quá lâu.

---

## Phụ lục: công cụ dùng trong lần kiểm tra

Các script quan sát, chơi thử, đo hiệu năng, bản lưu cũ **không nằm trong repo**: chúng chạy ngoài game và không thay đổi mã nguồn. Có thể đưa vào `tests/audit/` nếu muốn chạy lại định kỳ.

## Kết luận

**Game đã đủ ổn định để phát triển nội dung mới chưa?**
**Có, về kỹ thuật.** Không có lỗi P0/P1. 16/16 bộ kiểm thử đạt. Bản lưu cũ chạy tốt. Không rò bộ nhớ. Hiệu năng tốt trên máy bàn và laptop. Nền tảng (lịch NPC, hành vi, xã hội, thành phố, trí nhớ) dùng được để xây tiếp. Riêng các bài kiểm thử phụ thuộc thời gian chờ (P3-09) nên sửa trước, để khi thêm nội dung thì kiểm thử vẫn đáng tin.

**Gameplay đã đủ hấp dẫn chưa?**
**Chưa cho trọn 56 ngày.** 15–30 phút đầu tốt: mục tiêu rõ, hình đẹp, văn phòng sống động. Sau khoảng 30 phút, ngày làm việc lặp lại, các địa điểm ít việc để làm, thế giới sống chủ yếu để nhìn, trí nhớ NPC rất khó thấy. Game đang là **một bộ mô phỏng đẹp để quan sát** hơn là **một cuộc sống để tham gia**.

**Những vấn đề bắt buộc phải sửa trước v18:**
1. P2-03 Tùng/Linh ở quán trái với lịch của họ.
2. P2-01 NPC đứng chồng ở pantry.
3. P2-02, P2-04, P2-09 người hiện ra/biến mất giữa màn hình.
4. P2-11 hết buổi ở ngoài phố cho kết quả “xem phim”.
5. P3-01, P3-02 giờ trong nhật ký và hai đồng hồ lệch nhau.
6. P3-09 bài kiểm thử phụ thuộc thời gian chờ.

Chưa sửa bất kỳ dòng mã nguồn nào trong lần kiểm tra này. Chờ xác nhận trước khi sửa.
