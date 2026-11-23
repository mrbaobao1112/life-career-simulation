# Lịch sử phiên bản

## v17.7 – Phase 1: Đo thực tế để game dễ chơi hơn (hiện tại)
**Không đổi mã game.** Chỉ đo, lập kế hoạch và phác thảo. Báo cáo: `docs/AUDIT_REPORT_v17.7.md`.

**Vấn đề:** trò chơi nhỏ khó với người không biết code; quá nhiều chữ.
**Quyết định:** giữ nghề lập trình nhưng đơn giản hóa cho mọi người chơi; rút gọn câu chữ (giữ ý, bỏ câu đùa phụ); 4 trò chơi nhỏ đổi sang kiểu game phổ thông.

**Số liệu chính:**
- Mỗi ván người chơi đọc khoảng **20.500 từ** (khoảng 100 phút chỉ để đọc): ngày đầu 775 từ, tuần đầu 4.032 từ.
- **Cảnh tốn chữ nhất:** thức dậy (82 từ, gần như mỗi sáng), tổng kết tuần (khoảng 356 từ mỗi tuần), giờ rảnh, nhật ký cuối ngày, task. 10 cảnh hàng đầu chiếm 76,5% tổng chữ.
- **Trên điện thoại,** nút lựa chọn nằm dưới màn hình đầu; nút điện thoại che chữ của thẻ task.
- **Cả 4 trò chơi nhỏ** là câu đố kiến thức lập trình: đọc code thật, gõ lệnh git, nối thuật ngữ.

**Kế hoạch (chờ duyệt):**
- **Phase 2:** cài đặt "Đọc nhanh", ngân sách chữ, viết lại 10 cảnh ưu tiên, bày lại màn hình điện thoại, bảng thuật ngữ đơn giản.
- **Phase 3:** 4 trò mới (phác thảo ở `docs/phac-thao/`):
  - Ghép code (ghép 3);
  - Né bug (chạy và nhảy tránh);
  - Hứng dữ liệu (hứng đồ rơi);
  - Gõ theo nhịp (chạm theo nhịp).

**Thêm:**
- Công cụ `tests/audit/dem-chu.js` (đếm chữ người chơi phải đọc, theo ngày, theo loại, theo cảnh; dùng để so sánh trước/sau).
- 4 phác thảo SVG.

## v17.6 – Phase 2: Nền tảng phát triển
Chạy **song song** với chỉ số cũ (Chuyên môn, Kỹ năng mềm, điểm làm việc). **Không đổi** lương, tài chính, năng lượng, sức khỏe, hệ thống 56 ngày.
Bản lưu cũ vẫn chơi tiếp được: chỉ thêm `S.pt`, tự tạo khi chưa có.
Dữ liệu: `js/du-lieu/phat-trien.js`. Cách chạy: `js/he-thong/phat-trien.js`. Tắt được: `PT.ON = false`.

**Kỹ năng nghề (5 loại):** Lập trình, Giao tiếp, Quản lý, Sáng tạo, Giải quyết vấn đề.
- Mỗi kỹ năng có 6 mức: Mới bắt đầu → Cơ bản → Khá → Vững → Giỏi → Chuyên gia.
- Mức ban đầu lấy từ chỉ số cũ: Lập trình từ Chuyên môn, Giao tiếp từ Kỹ năng mềm.
- **Chỉ tăng khi làm việc có ích** (bảng `KN_NGUON`):
  - làm xong task (làm tốt thì rèn thêm giải quyết vấn đề);
  - sửa lỗi, xử lý sự cố;
  - học thêm, làm dự án cá nhân;
  - họp đầu ngày, trình bày demo, tiếp khách;
  - lập kế hoạch chi tiêu, chạy hạn chót;
  - đi chơi nói chuyện thật lòng;
  - mọi việc làm tăng Chuyên môn hay Kỹ năng mềm.
- Nằm nghỉ, xem phim không tăng gì. Cùng một việc lặp lại trong ngày chỉ được nửa điểm; mỗi kỹ năng mỗi ngày tăng tối đa 8 điểm.
- Lên mức thì có thông báo.

**Cấp bậc:** Junior → Middle → Senior → Team Leader → Manager (bảng `CAP_BAC`).
- Đi làm thì là Junior.
- Lên cấp cần cả ba điều:
  - **năng lực:** mức kỹ năng;
  - **kinh nghiệm:** ngày công, số task;
  - **kết quả công việc:** điểm làm việc trung bình, nhận xét của trưởng nhóm không bị nhắc nhở.
- Đủ điều kiện thì chiều thứ Sáu chị Hạnh gọi vào báo lên **Middle Developer**. **Lương chưa đổi** (để dành cho kỳ đánh giá ở bản sau).
- Trong 56 ngày chỉ lên được Middle. Các cấp sau cần nhiều năm kinh nghiệm, đã có sẵn trong dữ liệu.
- Bot chơi bừa không tự lên Middle được.

**Mục tiêu sống:**
- Tối ngày 2, game **gợi ý 3 mục tiêu theo hoàn cảnh** (nơi ở, gia cảnh, đã có việc chưa…):
  - có việc đầu tiên;
  - để dành tiền;
  - đổi xe máy mới;
  - tích lũy tiền đặt cọc nhà (mục tiêu nhiều năm);
  - lên Middle;
  - lên mức Khá ở kỹ năng yếu nhất;
  - thân với bố mẹ hơn;
  - có bạn thân ở công ty;
  - tham gia 6 hoạt động cùng mọi người.
- Chọn một mục tiêu ưu tiên, theo đuổi cả ba, hoặc để sau.
- Mỗi mục tiêu có trạng thái (gợi ý / đang theo đuổi / đã xong / hết hạn), tiến độ (%) và điều kiện hoàn thành.
  - Có việc rồi thì tự mở mục tiêu "Lên Middle".
  - Hết 56 ngày, mục tiêu ngắn hạn chưa xong thành "hết hạn"; mục tiêu nhiều năm thì vẫn tiếp tục.
- Hoàn thành thì có thông báo và ghi nhật ký. Không thưởng chỉ số.

**Hồ sơ:** thêm phần Mục tiêu (thanh tiến độ), Cấp bậc (từng điều kiện lên cấp tiếp theo, đạt/chưa đạt), Kỹ năng nghề.

**Kiểm thử:** thêm `npm run phat-trien` (36 kiểm tra). Phần cuối chạy trên trình duyệt thật.
- `npm test`: 21 bộ ĐẠT, 1 KHÔNG ĐẠT, 2 BÁO CÁO.
  - Bộ không đạt là `hieu-nang`: phố giờ cao điểm trên điện thoại giả lập 35,8 FPS, dưới ngưỡng 40.
  - Đo lại xen kẽ 6 lần trên main và 6 lần trên nhánh này: hai bên như nhau (trung bình 37,5 và 35,2), nên không phải do Phase 2.
  - Đây là rủi ro H1 của Phase 1, để Phase 3 xử lý. Không hạ ngưỡng.
- Lỗi đã bắt được khi viết bài: file mới bọc một hàm của `man-choi.js` nhưng lại nạp trước file đó.
  - Trên trình duyệt thật, việc này làm hỏng cả game.
  - Bài jsdom không thấy vì nó gộp mọi file làm một.
  - Đã sửa thứ tự nạp và thêm kiểm tra trên trình duyệt.

## v17.6 – Phase 1: Kiểm tra toàn bộ và kiểm thử
**Không đổi mã game.** Chỉ sửa môi trường kiểm thử, thêm bài kiểm thử và công cụ đo. Báo cáo đầy đủ: `docs/AUDIT_REPORT_v17.6.md`.

**Môi trường kiểm thử:**
- Playwright (trình duyệt dùng cho kiểm thử) nằm trong `tests/package.json`: `npm install` là đủ, không phụ thuộc bản cài sẵn trên máy.
- Thiếu Playwright thì bài báo **⏭️ SKIP** (mã thoát 3), không còn báo "Bỏ qua" rồi tính là đạt như trước.
- `npm test` giờ chạy **tất cả** các bộ (trước chỉ chạy 4 bộ), qua bộ chạy tổng `tests/chay-tat-ca.js`.
  - Mỗi bộ ghi rõ: ✅ ĐẠT / ❌ KHÔNG ĐẠT / ⏭️ SKIP / ⬜ CHƯA CHẠY / 📊 BÁO CÁO.
  - Bảng kết quả ghi vào `tests/ket-qua/tong-hop.md`.
  - Bộ đo hiệu năng chạy riêng sau cùng.
  - Bộ nhanh cũ: `npm run co-ban`.
- `he-thong`, `tai-chinh`, `ngau-nhien` có kiểm tra đạt/không đạt thật (trước chỉ in số liệu). `can-bang`, `hai-thang` ghi rõ là bảng báo cáo.

**Bài kiểm thử mới:**
- `npm run luu-tai`:
  - bản lưu thật của 16.1, 17.0, 17.3, 17.4, 17.5 (ngày 12, ngày 30, và lúc đang đi ngoài phố) mở bằng bản hiện tại và chơi tiếp đến hết;
  - bản lưu thiếu dữ liệu mới;
  - lưu rồi tải lại giữ nguyên mọi thứ;
  - đang hẹn Linh, tải lại trang vẫn còn hẹn.
  - Bản lưu mẫu ở `tests/du-lieu-mau/`, tạo thêm bằng `tao-ban-luu.js`.
- `npm run npc-on-dinh`:
  - lịch không trùng trong 56 ngày;
  - ở 10 nơi không ai trùng mặt, kẹt, ra ngoài bản đồ hay bận mãi;
  - ra vào địa điểm 24 lần không lỗi, không nhân đôi vòng lặp hình.
- `npm run hieu-nang`:
  - FPS trên điện thoại giả lập ở phố, văn phòng, quán;
  - NPC ngoài màn hình không chạy hoạt ảnh;
  - tìm đường nhanh;
  - ra vào 20 lần không rò nút trang, trình nghe sự kiện, bộ nhớ.
- Công cụ `tests/audit/trai-nghiem.js`: bot chơi nhiều ván, đếm ngày nhạt, sự kiện lặp, hoạt động được chọn, hậu quả về sau.

**Kết quả:** 21 bộ ĐẠT, 0 KHÔNG ĐẠT, 0 SKIP, 2 BÁO CÁO; 669 kiểm tra đạt.

## v17.5 – Phase 4: Chuyện tự nảy sinh và hoàn thiện
Không đổi công thức tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày. Bản lưu cũ vẫn chơi tiếp được: chỉ thêm `S.cc` (trạng thái chuyện, tự tạo khi chưa có) và vài cờ nhỏ trong `S.flags`.

**Chuyện tự nảy sinh** (dữ liệu `js/du-lieu/cau-chuyen.js`, điều khiển `js/song/cau-chuyen.js`). Không phải kịch bản cố định: chuyện chỉ bắt đầu khi các hệ thống sẵn có (trí nhớ NPC, quan hệ, sự kiện thế giới, lịch sinh hoạt) đủ điều kiện, và đi tiếp theo lựa chọn của bạn.
- **Linh rủ đi thư viện:**
  - điều kiện: Linh thân từ 58 trở lên, và 5 ngày gần đây có lần gặp vui (Linh nhớ chuyện đi cà phê, hoặc bạn vừa bắt chuyện với Linh);
  - 1–2 ngày sau Linh mới nhắn, có lý do (“Hôm trước đi cà phê với mày vui ghê.”) rồi rủ đi Thư viện quận; đang đi làm thì hẹn ngày nghỉ;
  - nhận lời: chiều hôm hẹn Linh đợi ở thư viện (“Ngồi học cùng Linh”) → cảnh học cùng (học nghiêm túc, hoặc học một lúc rồi ra hồ) → Linh nhớ và nhắc lại khi gặp, khi bắt chuyện;
  - từ chối: Linh bảo không sao; lờ tin: Linh nhắn lặng lẽ, hơi phật lòng; hẹn mà không đến: tối Linh nhắn buồn và nhớ chuyện bị “cho leo cây”;
  - xong một lần thì 12 ngày sau mới có thể rủ lại.
- **Đồng nghiệp giận rồi làm lành:**
  - sau trận tranh luận ở văn phòng, họ không bắt tay ngay nữa; hôm sau còn giận: quan hệ giữa hai người giảm thêm, không sang bàn nhau, đi ngang không chào; bắt chuyện thì họ nhắc chuyện hôm qua;
  - từ hôm sau có thể có việc chung ở chỗ họp (chị Hạnh gọi ra): hai người cùng làm, nói chuyện lại, bắt tay làm lành (🤝), thân lại, và lần chào sau nhắc “Hôm trước làm chung ăn ý đấy nhỉ.”;
  - lâu không có dịp gặp (nghỉ, cuối tuần) thì tự nguôi.
- Thêm chuyện mới: thêm số liệu, câu chữ vào `CC`, `CC_LOI` và một mục vào bảng `CC_STORIES`. Tắt được: `CC.ON = false` (khi tắt, tranh luận lại bắt tay ngay như cũ).

**Điện thoại gọn hơn (P3-08)** (`js/he-thong/dien-thoai.js`, bảng `PHONE`):
- Số đỏ trên nút điện thoại là **số cuộc trò chuyện có tin mới**, không đếm từng tin (trước đây dồn lên khoảng 35 sau hai tuần).
- **Chỉ đổ chuông khi tin quan trọng** (cần trả lời, chị Hạnh nhắc). Tin nhắc lại khi bạn lờ đi đến lặng lẽ.
- Tin nhắn vu vơ **tối đa 2 lần mỗi ngày**; NPC chỉ nhắn khi có lý do (điều kiện riêng của từng tin, chuyện đang diễn ra).
- Danh sách: cuộc **chờ trả lời lên đầu**, rồi cuộc có tin mới, rồi theo tin gần nhất. Nút điện thoại có viền vàng khi có tin chờ trả lời.
- Trong cuộc trò chuyện có **vạch “Tin mới”** ngăn tin cũ và tin chưa đọc. Lịch sử vẫn xem lại được (giữ 80 tin gần nhất mỗi cuộc).

**Sửa lỗi và hiệu năng:**
- **P2-10:** xe máy chỉ chạy trên phố chính, không chạy vào ngõ nhà.
- **P3-11 (hiệu năng trên điện thoại):** người ngoài khung nhìn hoặc đã đi khỏi thì dừng hoạt ảnh (chân bước, tay, dấu hiệu) và không vẽ; kiểm tra vài lần mỗi giây trong vòng lặp sẵn có, không thêm vòng lặp. Lối chơi trên máy tính và điện thoại giữ nguyên. Đo trên giả lập iPhone 13 (CPU chậm 6 lần), phố giờ cao điểm, 2 lần mỗi bản: bản cũ 51,7 và 59,3 FPS, CPU 96% và 76%; bản mới 58,7 và 57,7 FPS, CPU 66% và 81%. Số đo dao động nhiều giữa các lần, nhưng thời gian tính kiểu dáng (style) giảm khoảng một phần ba (trung bình 14,5% → 10,5%). Văn phòng, quán cà phê vẫn khoảng 60 FPS.
- Kiểm thử mở đầu ổn định hơn: “ít nhất 2 hành vi ngắn” được xem thêm tối đa 60 giây nếu 100 giây đầu chưa đủ (hành vi là ngẫu nhiên); “mở/đóng Cài đặt giữa lúc nói” đợi lâu hơn khi máy bận.

**Kiểm thử:** thêm `npm run cau-chuyen` (Linh rủ đi thư viện và đủ các nhánh, đồng nghiệp giận rồi làm lành, thông báo điện thoại, xe máy, dừng hoạt ảnh ngoài màn hình).

## v17.5 – Phase 3: Gia đình và công việc
Không đổi công thức tài chính, sức khỏe, năng lượng, lương, nghỉ phép. Không đổi định dạng bản lưu (chỉ thêm vài cờ nhỏ trong `S.flags`).

**Ngày làm việc không còn giống nhau (P2-12)** (dữ liệu `js/du-lieu/ngay-dac-biet.js`, điều khiển `js/song/ngay-dac-biet-vp.js`):
- 6 loại ngày đặc biệt:
  - **Hạn chót:** gánh thêm việc / hỗ trợ Phong / làm phần mình.
  - **Review code:** anh Dũng nhờ xem code. Góp ý thẳng có thể được nhận, hoặc thành một trận tranh luận nhỏ nếu chưa thân; hoặc hỏi để học; hoặc khen cho qua.
  - **Khách đến:** soạn tài liệu / đón khách / làm task.
  - **Sự cố:** khách không đăng nhập được; đọc log cùng anh Dũng / trực điện thoại / làm nốt task.
  - **Demo cho ban giám đốc:** xin trình bày (thành công tùy kỹ năng; nếu lỗi thì chị Hạnh đỡ lời, không bị phạt nặng) / chuẩn bị dữ liệu / ngồi dự.
  - **Chiều thứ Sáu team building:** tham gia (góp 50.000đ) / ghé chút / làm nốt việc.
- Cách xếp:
  - khoảng 25–45% số ngày làm việc là ngày đặc biệt, còn lại là ngày bình thường;
  - không có trong 3 ngày đầu đi làm, không hai ngày liền cùng một loại, không quá 2 ngày đặc biệt liền nhau;
  - đúng thứ trong tuần (khách đến thứ Ba–Năm, demo thứ Tư–Sáu, team building thứ Sáu);
  - mỗi công ty nghiêng về vài loại (Hồ Tây Soft hay có khách, Cú Đêm Lab hay chạy hạn chót, Lò Rèn hay có sự cố…);
  - cố định theo ngày (tải lại game không đổi), không cần lưu.
- Ngày có cảnh đặc biệt thì buổi đó **không thêm sự kiện ngẫu nhiên** (không dày đặc). Tua nhanh hoặc nghỉ phép thì là ngày bình thường.
- Mỗi cảnh **luôn có một lựa chọn không làm giảm gì**. Hậu quả vừa phải: quan hệ đổi tối đa 5, năng lượng giảm tối đa 10.
- **Đồng nghiệp phản ứng trong văn phòng:**
  - hạn chót, sự cố: ai cũng ngồi lì ở bàn (⏰ 🔥), mặt mệt hoặc hoảng, không đi lại tán gẫu;
  - review: anh Dũng sang bàn bạn (🔍);
  - khách đến: một vị khách vào ngồi ở chỗ họp cùng chị Hạnh (🤝);
  - demo: chị Hạnh, chị Mai, anh Dũng ra chỗ họp (📽️);
  - team building: cả team ra pantry (🎉).
- **Đồng nghiệp nhớ chuyện:** hôm sau nhắc lại khi bắt chuyện (“Hôm chạy hạn chót em gánh đỡ chị nhiều đấy.”). Trận tranh luận khi review thì anh Dũng hơi lạnh nhạt vài ngày. Ngay trong ngày, bắt chuyện cũng có câu về ngày hôm đó (“Tôi sắp khóc rồi ông ạ.” vào ngày hạn chót).
- Tắt được: `NGAY.ON = false`.

**Đời sống gia đình (P2-08)** (dữ liệu `js/du-lieu/gia-dinh.js`, điều khiển `js/song/gia-dinh.js`):
- **Bố mẹ trò chuyện** khi cùng ăn cơm, cùng xem TV, cùng uống trà; câu theo việc đang làm (“Mai trời rét đấy ông ạ.” – “Ừ, nhớ lấy áo bông ra.”).
- **Đi làm về, mẹ hỏi han** (ở ghép thì Tùng hỏi): “Hôm nay đi làm có mệt không con?”. Bấm vào mẹ để chọn:
  - công việc khá ổn / hơi nhiều việc / công ty có chuyện không vui / con muốn nghỉ một chút;
  - phần lớn chỉ để trò chuyện, không đổi chỉ số;
  - riêng “chuyện không vui” thì mẹ an ủi, bố nói thêm “Có gì khó thì nói với bố.”, tinh thần +2 (mỗi ngày một lần), và hôm sau mẹ hỏi lại “Chuyện công ty hôm qua, nay ổn hơn chưa con?”;
  - mỗi ngày làm việc hỏi một lần.
- **Tùng đi ca chiều về kể chuyện chỗ làm** (bà khách thử ba mươi cái áo, ông khách trả bằng xu…).
- **Lương vừa về:** bố, mẹ hỏi chuyện lương khi bắt chuyện.
- Tắt được: `GD.ON = false`.

**Kiểm thử:** thêm `npm run gia-dinh-cong-viec` (31 mục):
- chọn loại ngày đúng luật, đủ 6 loại, cố định; xếp đúng buổi, không chồng sự kiện ngẫu nhiên, tua nhanh thì không có;
- luôn có lựa chọn không làm giảm gì, hậu quả vừa phải; đồng nghiệp nhớ và nhắc lại; tranh luận làm lạnh nhạt; câu theo ngày;
- phản ứng trong văn phòng (hạn chót, review, khách, team building);
- bố mẹ trò chuyện; mẹ hỏi han và an ủi; hỏi một lần mỗi ngày; Tùng hỏi han và kể chuyện; bố hỏi lương; tắt được.

`56-ngay` (phần sân khấu văn phòng) và `van-phong` tắt ngày đặc biệt (`NGAY.ON = false`), để kiểm riêng sân khấu như trước. Ngày đặc biệt được kiểm ở bài mới.

**Bản lưu cũ:** bản lưu từ v17.5 Phase 2 (ngày 21) mở bằng bản mới, chơi tiếp đến hết ngày 56: 0 lỗi.


## v17.5 – Phase 2: Quán có đời sống thật
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày. Không đổi định dạng bản lưu (chỉ thêm hai mục nhỏ trong `S.flags` để giới hạn mỗi ngày).

**Nhân viên phục vụ thật** (`js/song/phuc-vu.js`, bảng `PV_PLACE`):
- **Cà phê:** chị pha chế đứng **sau quầy**. Thêm mặt trước quầy che nửa người, và nâng người như đứng trên bục, nên thấy được từ vai trở lên. Trước đây chị đứng trước quầy, bất động cả ngày.
- Khách đến quầy gọi đồ (“Cho chị một cốc nâu nóng.”), khách chờ (⏳). Chị nhận lời (“Có ngay ạ!”), ra máy pha có động tác pha chế, mang lại đưa cốc (“Cà phê nóng đây ạ.”). Khách cảm ơn, cầm cốc về chỗ ngồi uống.
- Khách ra quầy trả tiền: chị báo giá, cảm ơn.
- Khách về: chị vòng ra khỏi quầy, ra **dọn bàn** (🧽), rồi quay lại sau quầy.
- Lúc rảnh: lau quầy (🧽) hoặc nghỉ ngắn xem điện thoại (📱).
- **Cơm bụi:** cô bán cơm đứng sau tủ kính, khách gọi suất cơm, cô xới rồi đưa.
- **Trà đá:** bác bán trà mang cốc trà ra tận ghế cho khách.
- **Trung tâm thương mại:** khách ra quầy, thu ngân tính tiền.
- **Thư viện:** cô thủ thư lúc rảnh đi xếp sách.
- Bia hơi chưa có nhân viên. Thêm nơi mới = thêm một mục vào `PV_PLACE`.

**Khách có vòng đời đầy đủ:** vào quán → (xếp hàng) gọi đồ → chờ → nhận đồ, cầm cốc → ngồi uống (dáng ngồi) → trả tiền → về. Khách ngồi sẵn lúc bạn vào quán đã có cốc trên tay.

**Bạn tham gia được:**
- **Gọi cà phê ở quầy** (“Cà phê trứng mang về”): chị pha chế pha và đưa cốc cho bạn thật; bạn cầm cốc một lúc. Giá và tinh thần như cũ.
- **Ngồi cùng bàn, nói chuyện với khách** (bấm vào khách đang ngồi):
  - bạn đi tới ngồi cạnh, nói vài câu hợp quán; khách đi cùng bạn cũng nói;
  - mất 15 phút, tinh thần +1 (mỗi ngày tính tối đa 2 lần), ghi vào nhật ký.
- **Mời người quen một cốc:**
  - mời Linh ở cà phê (25.000đ) hoặc Tùng ở trà đá (10.000đ);
  - họ thân hơn 3 (mỗi người mỗi ngày một lần), vui ra mặt, nhận cốc (ở trà đá thì bác mang ra tận chỗ);
  - họ nhớ chuyện này và hôm sau nhắc lại khi bắt chuyện (“Lần này đến lượt tao mời nhé.”).
- Các con số nằm trong bảng `PV`. Tắt được (`PV.ON = false`).

**Sửa lỗi:**
- **P3-05:** quán hết chỗ thì khách không vào nữa. Trước đây khách vào rồi ra ngay ở cửa. Đi theo cặp thì cần hai chỗ trống.
- **P3-04:**
  - thêm **dáng ngồi** (`act-sit`, gập chân, hạ người) cho khách ngồi ghế ở mọi quán, ghế chờ bến xe, ghế đá ở hồ; người ngồi ghế đá ngắm hồ (`act-think`);
  - thêm **động tác dưỡng sinh** (`act-tap`, hai tay từ từ nâng lên hạ xuống); nhóm tập đứng giãn ra, hai hàng so le.
- **Xếp hàng ở quầy:** các chỗ đứng cách nhau rộng hơn (36 đơn vị), hai người không đứng sát vào nhau.
- **Sửa lỗi của Phase 1:** một chú thích `//` làm mất lệnh hiện dấu 💬 và nét mặt vui khi hai khách ngồi cùng bàn nói chuyện.

**Kiểm thử:** thêm `npm run quan-song` (35 mục):
- nhân viên sau quầy; khách ngồi sẵn có cốc; gọi đồ, pha chế, đưa đồ, trả tiền, dọn bàn, lúc rảnh;
- bạn gọi cà phê; ngồi cùng bàn (giới hạn mỗi ngày); mời Linh (tiền, quan hệ, nhớ, nhắc lại hôm sau), mời Tùng (bác mang trà ra);
- cơm bụi, thu ngân, thủ thư;
- hết chỗ không vào; dáng ngồi, dưỡng sinh;
- tắt được; điện thoại và giảm chuyển động.

`thanh-pho`: bài “khách xong việc thì ra về” chờ lâu hơn (21 giây), vì giờ khách xếp hàng trả tiền và chờ nhân viên.

**Bản lưu cũ:** bản lưu từ v17.5 Phase 1 (ngày 21) mở bằng bản mới, chơi tiếp đến hết ngày 56: 0 lỗi.

**Ghi chú:** `mo-dau` có một mục dựa vào may rủi (“trong 100 giây thấy ít nhất 2 loại hành vi ngắn”). Thỉnh thoảng mục này không đạt, kể cả khi chạy riêng (2/3 lần đạt). Phase này không sửa màn hình mở đầu. Sẽ làm cho ổn định ở Phase 4.

## v17.5 – Phase 1: Hội thoại và trí nhớ khi chủ động bắt chuyện
Mục tiêu v17.5: người chơi chủ động tham gia thế giới sống, không chỉ đứng xem. Phase 1 tập trung vào nói chuyện.
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày. Không đổi định dạng bản lưu.

**“Bắt chuyện” thành một cuộc nói chuyện thật** (`js/song/hoi-thoai-npc.js`, dữ liệu `js/du-lieu/hoi-thoai.js`):
- Bạn mở lời theo buổi và đúng cách xưng hô: “Em chào chị ạ, sáng nay chị thế nào ạ?”, “Ê Tùng, ăn gì chưa?”, “Mẹ ơi, chiều nay mẹ có đi đâu không ạ?”. Người kia đáp theo mức thân: thân thì vui vẻ, bình thường thì ngắn, lạnh nhạt thì hờ hững.
- Nếu họ còn nhớ chuyện cũ với bạn, họ nhắc lại và nét mặt theo chuyện. Ví dụ hôm trước mua cà phê giúp anh Dũng, hôm sau anh Dũng nói: “Hôm nào anh mời lại em cốc nước.” Bạn đáp lại một câu phù hợp.
- Nếu không có chuyện cũ: nói chuyện vừa xảy ra (đi muộn, ở lại OT, lương về…), hoặc một chủ đề hợp nơi, giờ, mức thân, tính cách và việc người đó đang làm. Ví dụ: mẹ đang nấu ăn thì “Mẹ đang nấu canh cua, con đói chưa?”; Linh ở thư viện thì nói nhỏ “Suỵt…”; thân với chị Mai thì được rủ đi ăn bún chả.
- 8 nhóm hội thoại: chào hỏi, công việc, cuộc sống, sở thích, tâm trạng, quan hệ, hẹn gặp, chuyện đã xảy ra. Hơn 100 đoạn mới cho 8 người, cộng các câu cũ trong `TALKS`.
- Chống lặp: không kể lại 5 chuyện vừa kể với cùng một người; mỗi “chuyện vừa xảy ra” chỉ nói một lần mỗi ngày; mỗi ký ức được nhắc khi bắt chuyện tối đa một lần mỗi ngày.
- Nếu hôm đó đã nhắc ký ức trong câu chào khi đi ngang, khi bắt chuyện sẽ nhắc bằng một câu khác. Tính chung vẫn chỉ một lần trong giới hạn hai lần của ký ức.
- Chuyện không vui trong 3 ngày gần đây (nếu chưa thân lắm) làm người đó hơi lạnh nhạt, không gay gắt. Nói chuyện tiếp vẫn làm thân hơn một chút như trước (`chatBond`, tối đa 3 lần mỗi ngày), nên có thể cải thiện dần.
- **Ở nhà giờ bắt chuyện được** với bố mẹ và Tùng (trước đây chỉ có “Chào”), trừ khi họ đang ngủ.
- Có thể tắt (`HTC.ON = false`) để quay về cách cũ. Các mức ưu tiên chủ đề nằm trong bảng `HTC`.

**Câu đáp khi “Chào”:** người quen đáp theo mức thân; khách lạ ở quán đáp câu hợp nơi đó.

**Sửa lỗi:**
- **P2-06 – khách lạ nói chuyện lệch ngữ cảnh:** khách lạ giờ nói chuyện theo nơi và buổi (`XG_NOI`, 9 nơi): bia hơi nói chuyện bóng đá, bạn bè, “cốc cuối”; thư viện thì thì thầm chuyện ôn thi, phỏng vấn; bến xe thì về quê, đi chơi… Trước đây khách lạ ở bia hơi hỏi nhau “Deploy chưa?”.
- **P3-03 – họp đột xuất:** chị Hạnh gọi đúng tên hai người được gọi vào họp (trước đây luôn gọi “Dũng, Mai”).

**Kiểm thử:** thêm `npm run hoi-thoai` (34 mục):
- dữ liệu hợp lệ;
- trí nhớ khi bắt chuyện, không nhắc lại trong ngày, tính một lần;
- lạnh nhạt rồi bình thường lại, cải thiện quan hệ;
- theo nơi, giờ, việc đang làm, mức thân, xưng hô;
- không lặp;
- bắt chuyện ở nhà, khách lạ ở quán, bia hơi buổi tối;
- tên trong họp đột xuất; tắt được.

**Bản lưu cũ:** bản lưu từ v17.4 và v16.1 (ngày 20) mở bằng v17.5 và chơi tiếp đến hết ngày 56: 0 lỗi.

**Ghi chú:** khi chạy 3 luồng song song (máy bận), `mo-dau` có lần báo lỗi 2 mục: hành vi ngẫu nhiên trong 100 giây, và mở Cài đặt giữa lúc nhân vật nói. Chạy riêng thì đạt. Phần này không bị Phase 1 sửa; sẽ làm cho ổn định hơn ở Phase 4.

## v17.4: Sửa các lỗi bắt buộc sau lần kiểm tra toàn diện
Sửa 6 nhóm lỗi trong `docs/AUDIT_REPORT_v17.3.md`. Không thêm tính năng lớn. Không đổi tài chính, sức khỏe, lương, nghỉ phép, mô phỏng 56 ngày. Không đổi định dạng bản lưu.

**1. Tùng và Linh theo đúng lịch của họ (P2-03):**
- Trước đây, cứ có hoạt động “Cà phê với Linh” hay “Trà đá với Tùng” là họ ngồi sẵn ở quán, bất động 10 tiếng, kể cả lúc lịch nói họ đang đi làm hay đi học.
- Giờ họ chỉ có mặt khi lịch nói họ ở đó (hoặc khi đã hẹn qua “Rủ ai đó đi chơi”). Đứng cạnh họ vẫn rủ được như cũ.
- Họ không có ở đó thì vẫn làm được **một mình**: thực đơn hiện “Ngồi cà phê một mình” / “Ngồi trà đá một mình”, vẫn trả tiền, tinh thần vẫn tăng như cũ, nhưng quan hệ với Linh/Tùng không đổi (vì họ không có ở đó). Câu kết quả riêng cho lúc ngồi một mình.
- Lịch Linh thêm chiều thứ Bảy, Chủ nhật 14:30–17:00 ở quán cà phê, để vẫn có lúc gặp Linh ở quán vào buổi chiều.

**2. NPC không còn đứng chồng lên nhau ở pantry (P2-01):** chỗ đứng được giữ ngay lúc chọn, trước khi đi; người được gọi cùng lúc (chị Mai mang bánh, cùng đi lấy nước, sang bàn nhau) mỗi người một chỗ.

**3. Không còn người hiện ra hay biến mất giữa màn hình (P2-02, P2-04):**
- Người đi bộ trên phố đi vào và đi ra ở mép bản đồ (qua ngõ, hoặc cuối phố), hoặc bước ra từ cửa một quán. Trước đây họ bật hiện ở chỗ giáp ngõ và phố.
- Tùng và Linh đến giờ thì đi từ cửa vào chỗ; hết giờ thì đứng dậy đi ra cửa rồi mới khuất. Trước đây họ bật hiện/tắt ngay tại chỗ ngồi.
- Sửa gốc: khi một nhân vật được đặt chỗ rồi bắt đầu đi ngay trong cùng một lượt, trình duyệt chỉ thấy điểm đích nên nhân vật “trượt” từ chỗ cũ hoặc bật hiện tại đích. Thêm `songAppear` (đặt chỗ khi còn ẩn, cập nhật vị trí, rồi mới hiện); dùng cho người đi bộ, xe máy, người dắt chó, khách vào quán, đồng nghiệp và người nhà đi vào cửa, Tùng và Linh.

**4. Hết buổi khi đang ở ngoài phố (P2-11):** kết quả là “dạo phố” (tinh thần +2, năng lượng −2, theo bảng `DAO_PHO`), không còn tự chọn “xem phim” như đang ở nhà.

**5. Giờ hiển thị đúng (P3-01, P3-02):**
- Nhật ký trong ngày ghi đúng giờ trên đồng hồ của thế giới, kể cả khi chọn từ “Danh sách lựa chọn” hoặc sau trò chơi nhỏ (trước đây ghi giờ đầu buổi, ví dụ “Chuẩn bị CV” lúc 07:00 dù làm lúc 10:33).
- Giờ trên đầu trang chạy theo đồng hồ trong cảnh (trước đây đứng ở giờ đầu buổi, ví dụ “Trưa, 12:00” khi đồng hồ cảnh đã 13:30). Dùng vòng lặp sẵn có của thế giới, chỉ cập nhật khi đổi phút.

**6. Kiểm thử đáng tin hơn khi máy bận (P3-09):**
- `ra-pho`: phần chuyện bất ngờ chờ theo điều kiện (người quen đến nơi, quan hệ đổi, tiền đổi, mưa đến, đồng hồ chạy đủ) thay vì chờ số mili giây cố định.
- `mo-dau`: bỏ các mẫu lấy lúc máy nghẽn (một khung hình quá 120 ms) khi đếm người đi bộ trùng chỗ.
- `ra-pho`: bài “cà phê/trà đá cho chỉ số giống hệt bấm nút” vào quán đúng giờ Linh, Tùng có mặt.

**Công cụ kiểm tra:** các script của lần kiểm tra v17.3 nằm ở `tests/audit/` (xem `tests/audit/README.md`). Bot chơi thử không còn giữ tham chiếu phần tử, nên số đo bộ nhớ khi chơi lâu không còn tăng giả.

**Báo cáo:** rút lại lỗi P2-09. Bến xe có xe khách đỗ sẵn, khách khuất ở cửa xe là đang lên xe.

**Kiểm thử:** thêm `npm run sua-loi-17-4` (20 mục):
- pantry không chồng;
- người đi bộ chỉ xuất hiện ở mép hoặc cửa quán;
- Tùng/Linh theo lịch, ngồi một mình, đi vào/ra bằng cửa;
- dạo phố khi hết buổi;
- giờ trong nhật ký và trên đầu trang.

## v17.3: Thế giới sống – Phase 4: NPC có trí nhớ, nét mặt và hoàn thiện
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày, quan hệ của người chơi (`S.rel`). Bản lưu chỉ thêm một danh sách ngắn `S.npcMem` (tối đa 24 chuyện, dưới 1.500 ký tự). Bản lưu cũ chưa có thì tự tạo, không cần chuyển đổi.

**NPC nhớ chuyện cũ** (`js/song/tri-nho-npc.js`, câu nói ở `js/du-lieu/tri-nho.js`):
- Khi một lựa chọn làm quan hệ với ai đó thay đổi đáng kể (tăng từ 4 hoặc giảm từ 3), người đó ghi nhớ chuyện gì và tốt hay không tốt. Ví dụ:
  - cho Tùng mượn tiền hay từ chối; đi nhậu với Tùng hay bỏ về;
  - đi cà phê với Linh; học nhóm với Linh hay hẹn mãi;
  - mua nước cho anh Dũng; hỏi anh Dũng quá nhiều lần;
  - quên sinh nhật chị Mai; cãi “trên máy em chạy bình thường” với chị Mai;
  - ở lại OT hay xin lùi hạn với chị Hạnh; trả nợ đúng hẹn hay xin khất.
- Chỉ những chuyện có câu nhắc lại trong bảng `MEM_LINES` mới được nhớ, nên câu luôn khớp chuyện. Thêm chuyện mới = thêm một mục.
- Từ hôm sau, lần đầu gặp ngoài đời (đi ngang qua), người đó nhắc lại chuyện cũ. Nét mặt theo chuyện: vui khi nhắc chuyện tốt; buồn hoặc hơi khó chịu khi nhắc chuyện không vui.
- Mỗi ngày nhắc một lần, mỗi chuyện tối đa hai lần. Sau 14 ngày thì quên. Mỗi người nhớ tối đa 4 chuyện.
- Đi làm lại sau từ 2 ngày nghỉ trở lên trong tuần: đồng nghiệp hỏi thăm (“Mấy hôm nghỉ ổn chứ em?”), mỗi người một lần.
- NPC cũng nhớ chuyện với nhau: hôm sau trận tranh luận, hai người gặp lại thì nhắc và làm lành; hôm sau chị Mai mang bánh, người đã ăn khen bánh.

**Nét mặt theo tình huống** (dùng đúng các nét mặt chibi có sẵn, không ngẫu nhiên):
- Ngủ thì nhắm mắt. Chơi game, ăn, uống trà thì vui. Khuya chưa ngủ thì ngáp. Chiều muộn ở công ty ai còn ngồi bàn thì mệt.
- Nói chuyện với người thân thì vui. Phong hỏi nhiều quá thì anh Dũng mệt, Phong buồn.
- Tranh luận thì khó chịu, làm lành thì vui. Người đến muộn thì hoảng.
- Người trú mưa buồn. Trẻ con chơi, hàng xóm nói chuyện, khách đi cùng bạn thì vui.
- Đổi nét mặt ngay trên nhân vật đang đứng, không dựng lại nhân vật.

**Hiệu năng:**
- Sửa lỗi xếp lớp nhân vật theo chiều sâu. Trước đây, khi lớp có thêm đồ vật (xe hàng rong, đồ trong quán…), mỗi khung hình đều xếp lại toàn bộ nhân vật dù không ai di chuyển. Giờ chỉ xếp khi thứ tự thật sự đổi. Đứng yên trong quán đông khách: 0 lần đụng vào trang.
- Bài chơi ngẫu nhiên 40 lượt (`npm run ngau-nhien`) từng hết bộ nhớ, cả ở bản trước. Nguyên nhân là thư viện giả lập trình duyệt (jsdom) giữ lại khoảng 5MB cho mỗi ván, kể cả với một đoạn mã thử đơn giản, nên không phải lỗi của game. Script giờ chạy với bộ nhớ lớn hơn (tên script không đổi).

**Sửa lỗi:** khi quầy quán đông, khách xếp hàng có thể đứng chồng lên nhau gần cửa. Giờ có sẵn 6 chỗ đứng xếp hàng (hai hàng) quanh quầy. Hết chỗ thì khách thôi không gọi đồ, ra về.

**Kiểm thử ổn định hơn khi máy bận:** bài `thanh-pho` chờ cảnh hồ dựng xong mới đếm; bài tranh luận tính cả ba cặp đồng nghiệp có thể tranh luận (trước chỉ xem cặp Dũng–Mai, nên có lúc báo lỗi sai).

**Kiểm thử:** thêm `npm run tri-nho` (32 mục):
- ghi nhớ đúng người, đúng tốt hay xấu; chuyện nhỏ không ghi; giới hạn và tự quên; lưu và tải lại; bản lưu cũ;
- nhắc lại từ hôm sau, mỗi ngày một lần, tối đa hai lần; nét mặt khi nhắc; đồng nghiệp hỏi thăm sau khi nghỉ; NPC nhớ chuyện với nhau;
- nét mặt khi ngủ, chơi game, chiều muộn ở công ty; không xếp lại lớp nhân vật khi đứng yên; điện thoại và giảm chuyển động.

## v17.2: Thế giới sống – Phase 3: thành phố sống
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày. Không đổi định dạng bản lưu (chỉ thêm một mục nhỏ `S.flags.wev` ghi sự kiện trong ngày), nên không cần chuyển đổi bản lưu.

**Dân số theo giờ trong các quán và địa điểm** (`js/song/dan-so.js`):
- Mỗi nơi có bảng mật độ 24 giờ, hệ số cuối tuần, số chỗ tối đa (`DS_PLACE`). Ví dụ: cà phê đông chiều và tối, bia hơi từ 16 giờ, cơm bụi đông lúc 12 giờ và 18 giờ, nửa đêm vắng.
- Khách vãng lai có vòng đời: vào → gọi đồ ở quầy (xếp hàng nếu đã có người) → ngồi → về. Ở trung tâm thương mại thì xem hàng rồi ra quầy thu ngân; ở bến xe thì mua vé, ngồi chờ, lên xe.
- Có khách đi theo nhóm hai người, ngồi cạnh nhau và nói chuyện.
- Vào quán giữa giờ đông thì đã có sẵn người ngồi; ghế không bao giờ có hai người.
- Hồ Bán Nguyệt: người chạy bộ, đi dạo, ngồi ghế đá; sáng sớm và chiều muộn có nhóm tập dưỡng sinh.
- Nhân viên quán (chị pha chế, bác trà đá, cô bán cơm, thủ thư, thu ngân) vẫn ở chỗ cũ. Khách đứng yên một chỗ cũ được thay bằng khách vãng lai.

**Phố và ngõ** (`js/song/pho-song.js`):
- Người đi bộ hai chiều trên vỉa hè; có người rẽ vào quán. Xe máy chạy dưới đường, giờ cao điểm 7–8 giờ và 17–18 giờ đông hơn; có xe dừng trước quán một lát.
- Hai người đi ngược chiều thỉnh thoảng dừng lại nói vài câu.
- Trời mưa: người đi bộ chạy vào mái hiên trú (☔), một lúc sau mới đi tiếp. Hàng xóm, trẻ con vào nhà.
- Ngõ nhà: hàng xóm đứng nói chuyện sáng sớm và chiều tối, trẻ con chơi buổi chiều (cuối tuần cả buổi sáng), người dắt chó đi dạo.

**Người quen ngoài thành phố** (`js/song/thanh-pho.js`):
- Tùng: ngày thường 13:30–21:30 đứng quầy ở trung tâm thương mại; chiều cuối tuần ngồi trà đá. Khớp với lịch ở nhà (lúc đó Tùng “ra ngoài”).
- Linh: ngày thường học ở thư viện, tối hay ngồi cà phê; sáng cuối tuần ngồi cà phê.
- Lại gần thì họ chào một câu. Hẹn gặp và hoạt động cần người này vẫn như cũ, không xếp trùng người.

**Sự kiện thế giới** (`js/song/su-kien-the-gioi.js`, bảng `WORLD_EV`):
- Ở văn phòng: hai đồng nghiệp tranh luận kỹ thuật (💢) rồi làm lành (🤝), độ tin giữa hai người giảm nhẹ; chị Hạnh giao task mới; họp đột xuất. Có ngày một đồng nghiệp đến muộn, lỡ họp đầu ngày, vào bàn thì xin lỗi (😅).
- Có giãn cách (45 phút game giữa hai sự kiện ở một nơi) và tối đa 6 sự kiện mỗi ngày, để không dày đặc. Thêm sự kiện mới chỉ cần thêm một mục vào bảng.

**Hiệu năng:** không thêm vòng lặp vẽ hay hẹn giờ lặp mới; mọi thứ chạy theo vòng lặp sẵn có của thế giới. Mỗi nơi dựng sẵn một nhóm nhỏ nhân vật (quán tối đa 7 khách, phố 6 người đi bộ và 3 xe máy) rồi dùng lại. Ngoài khung nhìn thì dịch chuyển thẳng, không diễn đi bộ. Chuyển tab thì dừng hẳn. Giảm chuyển động thì không diễn đi bộ.

**Sửa nhỏ:** người qua đường và khách vãng lai được ưu tiên thấp hơn đồ vật và người quen khi hiện gợi ý [E], nên đám đông không che mất cửa, quầy hay bạn bè. Xe máy chạy qua thì không bấm vào được.

**Kiểm thử:** thêm `npm run thanh-pho` (38 mục):
- mật độ theo giờ và cuối tuần; khách có sẵn, đến rồi về; không quá số chỗ; không ngồi chung ghế, không đè lên nhau; số nhân vật không tăng;
- nhóm tập dưỡng sinh; phố theo giờ; trú mưa; ngõ nhà; gợi ý cửa nhà không bị che;
- Tùng, Linh đúng nơi đúng giờ; tranh luận, giãn cách, giới hạn mỗi ngày, đến muộn, tắt sự kiện;
- chuyển tab, giảm chuyển động, điện thoại.
- Hai bài kiểm thử cũ `the-gioi-song` và `xa-giao` tắt sự kiện thế giới (`WEV.ON = false`) để kiểm riêng hành vi của từng phase.

## v17.1: Thế giới sống – Phase 2: đời sống xã hội giữa các NPC
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày, quan hệ của người chơi (`S.rel`).

**Quan hệ giữa các NPC** (`js/song/quan-he-npc.js`):
- Mỗi cặp có độ thân, độ tin, số lần nói chuyện, số lần nhờ vả trong ngày. Ví dụ ban đầu: bố–mẹ 82, chị Mai–chị Hạnh 62, Phong–anh Dũng 55.
- Độ thân mỗi ngày thay đổi tổng cộng tối đa ±2, nên không trôi quá nhanh.
- Lưu gọn trong bản lưu (`S.npcRel`, mỗi cặp dưới 80 ký tự). Bản lưu cũ chưa có thì tự tạo mặc định khi cần.
- Không hiện con số cho người chơi; chỉ thể hiện qua hành vi và câu nói.

**Giao tiếp giữa NPC** (`js/song/xa-giao-npc.js`, câu nói ở `js/du-lieu/xa-giao.js`):
- Sang chỗ nhau nói chuyện: hai bên quay mặt vào nhau, câu chạy qua lại. Câu chọn theo mức thân (thân, bình thường, lạnh nhạt) và theo cặp, có dùng các câu có sẵn. Nói xong thì thân hơn một chút.
- Người đang bận (đang đi, đang làm việc xen, đang tập trung) thì từ chối khéo (🙅), người hỏi quay về.
- Phong hỏi anh Dũng: hai lần đầu trong ngày anh Dũng chỉ tận tình. Từ lần thứ ba anh Dũng mệt (“Lần thứ mấy rồi?”, “Tự đọc log trước đi.”) và độ thân giảm. Nếu hai người đã lạnh nhạt thì anh Dũng từ chối luôn.
- Đi ngang qua nhau thì chào (👋), câu theo mức thân; lạnh nhạt thì chỉ gật đầu. Đã chào thì 40 phút game sau mới chào lại.
- Ở nhà bố mẹ: bố mẹ ngồi nói chuyện với nhau (giỗ bác Ba, giá rau, bóng đá…).
- Câu nói không lặp: nhớ vài câu vừa dùng cho mỗi loại.

**Sự kiện xã hội nhỏ:**
- Hết giờ làm, người thân nhau rủ nhau về cùng (“Đi cùng không?” – “Đợi tí, tắt máy đã.”) rồi cùng ra cửa. Đang dở việc thì từ chối.
- Chị Mai mang bánh: chiều có hôm chị Mai mang bánh ra pantry (🍰) gọi cả nhóm. Ai thân với chị Mai thì ra ăn cùng; người tập trung cao (anh Dũng) có thể xin để phần. Mỗi ngày một lần.

**Sửa lỗi:** người được bắt chuyện nay đứng yên lắng nghe đến hết câu chuyện (trước đây có thể bỏ đi giữa chừng). Sau đó người đó quay lại đúng việc và hướng ngồi cũ.

**Kiểm thử:** thêm `npm run xa-giao` (24 mục):
- quan hệ mặc định, giới hạn mỗi ngày, lưu và tải lại, bản lưu cũ;
- nói chuyện tăng độ thân; Phong hỏi nhiều lần thì anh Dũng mệt; người bận từ chối;
- câu không lặp; chào không lặp liên tục; bố mẹ nói chuyện; rủ nhau về; chị Mai mang bánh mỗi ngày một lần.

## v17: Thế giới sống – Phase 1: NPC tự sống theo lịch
Không đổi tài chính, sức khỏe, năng lượng, lương, nghỉ phép, mô phỏng 56 ngày, bản lưu (phase này không lưu thêm gì). Chỉ thay phần hình của người ở cùng nhà và đồng nghiệp trong thế giới đi lại.

**Lịch sinh hoạt theo giờ** (`js/song/lich-npc.js`):
- Mỗi người có lịch ngày thường và cuối tuần (ngày lễ tính như cuối tuần):
  - Tùng (bán hàng ca chiều): ngủ nướng, tắm, nấu mì, chơi game, 13:30 đi làm, tối về chơi tiếp; cuối tuần chiều đi trà đá.
  - Mẹ: nấu ăn, đi chợ, quét nhà, uống trà, xem thời sự; cuối tuần chiều sang hàng xóm.
  - Bố: ngày thường đi làm; cuối tuần uống trà, đọc báo, thắp hương.
  - Đồng nghiệp: đến công ty dần từ 8:24, họp đầu ngày 9:00, làm việc, ra ngoài ăn trưa, chiều quay lại, về lúc 17:30–18:15.
- Mỗi ngày các mốc lệch ngẫu nhiên tối đa ±15 phút nhưng luôn giữ đúng thứ tự. Cùng một ngày thì luôn ra cùng một lịch: dùng bộ ngẫu nhiên riêng theo ngày, không đụng phần ngẫu nhiên của luật chơi.
- Sắp ra ngoài hoặc từ ngoài về thì đi sớm 15 phút cho kịp đường. Các việc trong phòng (họp, về bàn) thì đúng giờ.

**Bộ máy hành vi** (`js/song/hanh-vi-npc.js`):
- NPC tự đi đến chỗ, ngồi, nằm, làm động tác, ra cửa rồi vắng hẳn, quay về.
- Trong một việc dài, cứ 25–70 phút có việc xen ngắn: lấy nước, nghe điện thoại, vươn vai, nghĩ, sang bàn bạn nói chuyện (dùng câu trao đổi có sẵn). Còn lại là ngồi yên hoặc đứng quan sát vài phút. Xong việc xen thì quay về việc chính.
- Giữ chỗ: hai người không chọn cùng một chỗ, không đứng đè lên người chơi. Người đã ra ngoài thì không bắt chuyện được, không chắn đường.
- Một nhịp chung với vòng lặp thế giới, nghĩ 4 lần mỗi giây; không có vòng lặp hay hẹn giờ riêng. Thời lượng tính theo phút game, nên mở điện thoại hoặc chuyển tab thì NPC dừng theo.
- Đang mở thực đơn nói chuyện với ai thì người đó đứng yên.
- NPC ở ngoài khung nhìn, hoặc khi bật giảm chuyển động, thì dịch chuyển thẳng, không diễn đi bộ.
- Kỷ luật (chị Hạnh đi nhắc) vẫn chạy như cũ: lúc đó bộ máy không điều khiển chị Hạnh.

**Dấu hiệu nhỏ trên đầu:** 💻 làm việc, 👥 họp, 😴 ngủ, 🚿 tắm, 🍳 nấu ăn, 🎮 chơi game, 🍜 ăn, 🍵 uống trà, 📺 xem thời sự, 📱 điện thoại, 💬 đang nói chuyện, 💭 đang nghĩ… Tắt được trong “Nếp sinh hoạt”.

**Kiểm thử:** thêm `npm run the-gioi-song` (27 mục):
- lịch theo ngày; Tùng làm đủ việc trong ngày, không kẹt, không nhân bản, ra ngoài thì vắng;
- việc xen rồi quay về; bố đi làm ngày thường, ở nhà cuối tuần;
- văn phòng họp, về bàn, đi ăn trưa, quay lại; dấu hiệu bật tắt;
- đứng yên khi đang nói chuyện; chuyển tab thì dừng; giảm chuyển động; điện thoại.

## v16.1: Sửa lỗi nhân vật đè lên nhau, đồng hồ nhảy khi rủ đi chơi
- Ở ghép, buổi sáng Tùng ngủ trên sofa: trước đây Tùng nằm lệch, đầu thò ra đè lên tủ TV. Nay nằm gọn trên đệm sofa.
- Chỗ nào có người đang nằm ngủ (sofa, giường) thì khóa, ghi lý do “Tùng đang ngủ ở đây”.
- Dùng đồ ở chỗ đã có người thì nhân vật tự ngồi sang chỗ trống bên cạnh, không đứng đè lên nhau. Ví dụ ngồi sofa khi Tùng đang chơi game, uống trà khi bố mẹ đang ngồi.
- Rủ ai đó đi chơi ở cửa nhà: trước đây nhân vật bước ra cửa, đồng hồ quay đến 18:30 rồi lại lùi về 13:30. Nay nhân vật rút điện thoại gọi hẹn (5 phút, `ROAM.CALL_MIN`) rồi tiếp tục đúng giờ đang chơi.
- Đồng hồ không bao giờ quay lùi về đầu buổi khi vào lại cùng một buổi.
- Gồm cả bản sửa cuối của v16: đã hẹn ai trong buổi thì không rủ thêm người khác.
- Kiểm thử: thêm 3 mục vào `npm run the-gioi` (sofa, chỗ ngồi), 3 mục vào `npm run ra-pho` (rủ đi chơi không làm đồng hồ nhảy).

## v16: Ra phố Hà Thành – 8 địa điểm đi lại được, xe máy, chuyện bất ngờ
Không đổi lương, nghỉ phép, sự kiện, công thức chỉ số, mô phỏng 56 ngày. Không đi xe, không mua đồ lặt vặt thì tiền và chỉ số y như trước. Bản lưu cũ mở bình thường.

**Phố Hà Thành.** Ở chế độ đi lại, cửa nhà dẫn ra phố (“Ra phố”); “Rủ ai đó đi chơi” vẫn ở cửa nhà.
- Mỗi hoàn cảnh một ngõ: ở với bố mẹ (cổng sắt, hoa giấy), ở trọ (dãy trọ), ở ghép (sảnh chung cư mini, thang máy).
- Ngõ nối ra phố chính Bán Nguyệt có 9 điểm đến: cơm bụi, trà đá vỉa hè, cà phê trứng, bia hơi, UBND phường, thư viện quận, hồ Bán Nguyệt, trung tâm thương mại, bến xe khách. Có cột điện, đèn đường, cây, lòng đường, vỉa hè.
- Bản đồ nhỏ ngay dưới khung: thấy mình đang ở đâu, chạm vào biểu tượng địa điểm để tự đi tới.
- Đồng hồ chạy liên tục khi đi. Về nhà thì tiếp tục buổi ở nhà. Hết buổi mà còn ở ngoài thì buổi sau coi như đã về nhà (như trước).

**Bên trong 8 địa điểm** (đi lại được). Người và đồ vật nối với đúng lựa chọn có sẵn, nên chỉ số tính y như bấm nút:
- Quán cà phê: Linh ngồi chờ ở bàn → “Cà phê với Linh”. Ở quầy có cà phê trứng mang về (25.000đ, tinh thần +2, mỗi ngày một lần). Có ban công ngắm phố.
- Trà đá vỉa hè: Tùng ngồi sẵn → “Trà đá với Tùng”. Bác bán trà cho xin cốc trà.
- Bia hơi (mở từ 16:00): xem bóng đá ké; một cốc bia hơi (15.000đ, tinh thần +2, năng lượng −2, mỗi ngày một cốc).
- Cơm bụi (giờ ăn): “Cơm bụi đầu ngõ”, ăn chịu khi hết tiền.
- Thư viện: học, ôn phỏng vấn, sửa CV, xem tin tuyển dụng, tính tiền nong ở bàn đọc (y như ở nhà).
- Hồ Bán Nguyệt: chạy bộ thật. Nhấn E ở cột “Xuất phát”, chạy đến cột “Quay đầu” rồi về thì tính là “Chạy bộ quanh hồ”. Có ghế đá, các cô chú tập dưỡng sinh.
- Trung tâm thương mại: thử áo, ngắm cốc; “Đi mua sắm” ở quầy thu ngân.
- Bến xe khách (buổi sáng): “Về quê thăm bố mẹ”, “Đi chơi cả ngày với bạn”. UBND phường: “Giải quyết giấy tờ”.
- Nơi chưa mở cửa thì ghi rõ giờ mở. Thực đơn nay luôn ghi lý do khi một việc bị khóa.
- **Rủ ai đó đi chơi:** người được rủ đợi ở nơi hẹn (quán cà phê hoặc trà đá); đến nơi “Ngồi nói chuyện” là vào cuộc trò chuyện cũ. Đã hẹn rồi thì buổi đó không rủ thêm người khác.

**Xe máy:**
- Ở chỗ để xe trong ngõ nhấn E để dắt xe ra. Đi xe nhanh gấp 2,5 lần đi bộ, có dáng ngồi xe (dùng lại hình xe của cảnh đi làm), không tính là chạy.
- Đến cửa quán thì dựng xe trước cửa, đi bộ vào; ra khỏi quán thì lên xe đi tiếp. Về nhà thì cất xe.
- Tiền xăng: ngày nghỉ có đi xe thì trừ một lần 15.000đ (đúng mức xăng có sẵn); ngày đi làm đã trừ rồi thì không trừ thêm.

**Chuyện bất ngờ trên phố** (bảng `GAP`): mỗi lần ra phố có thể có một chuyện, mỗi loại tối đa một lần mỗi ngày, tua nhanh thì không có.
- Gặp người quen: Tùng, Linh, hoặc đồng nghiệp vào ngày nghỉ, đi tới chào. Bắt chuyện theo tính cách, quan hệ cộng theo giới hạn mỗi ngày. Nói xong thì người đó đi tiếp.
- Hàng rong: cô bán bánh mì mời mua (15.000đ, tinh thần +2).
- Mưa bất chợt: đi xe thì dừng mặc áo mưa (5 phút). Đi bộ thì có 10 phút chạy vào mái hiên trú, không kịp thì tinh thần −2. Hôm trời mưa thì phố và hồ đều mưa.
- Tắc đường khi đi xe: mất 10 phút.

**Mã:**
- Thêm `js/pho/` (8 file: đồ đạc phố, bản đồ phố, bên trong các quán, bên trong các nơi lớn, hồ, xe máy, chuyện bất ngờ, đi phố) và `css/pho.css`.
- Bộ máy thế giới:
  - đổi nơi giữa chừng mà đồng hồ chạy tiếp;
  - nhớ chỗ đứng riêng ở từng nơi;
  - thêm tốc độ đi xe và những người phụ (người bán hàng, người qua đường).
- File dài nhất dưới 250 dòng.

**Kiểm thử:** thêm `npm run ra-pho` (42 mục):
- ba ngõ nhà; mọi nơi đi tới được;
- 7 việc ở các địa điểm cho chỉ số giống hệt bấm nút;
- xe máy và tiền xăng; giờ mở cửa; về nhà đồng hồ chạy tiếp;
- 4 chuyện bất ngờ; hẹn gặp; trời mưa; tắt chế độ; tua nhanh; điện thoại.

## v15: Đi lại trong văn phòng, trò chơi nhỏ khi làm task, kỷ luật
Không đổi lương, OT, nghỉ phép, tài chính, sự kiện. Không chơi trò nhỏ thì công thức task y như cũ, nên mô phỏng 56 ngày không đổi. Bản lưu cũ mở bình thường.

**Văn phòng đi lại được.** Ngày đi làm: họp đầu ngày, task sáng, ăn trưa, task chiều, tan làm đều diễn ra trong văn phòng. Bộ máy đi lại dùng chung với ở nhà: phím, Shift để chạy, joystick, chạm để tự đi tới, gợi ý [E].
- Bốn kiểu văn phòng, mỗi công ty trang trí riêng:
  - Văn phòng lớn (Hồ Tây Soft, Sông Hồng Tech): lễ tân, máy chấm công, phòng họp vách kính.
  - Không gian mở (Bánh Mì Pay, Trà Sữa Số): bảng trắng đầy sơ đồ, góc sofa có TV, quầy bánh mì hoặc trà sữa ở pantry.
  - Startup (Cú Đêm Lab, Xe Ôm Xanh): tường tối, chữ neon, ghế lười, bàn dài chung; Cú Đêm có con mèo đi lang thang, Xe Ôm Xanh có giá mũ bảo hiểm.
  - Văn phòng nhỏ (Lò Rèn, Giấy Tốt Agency): máy in, giấy tờ chồng chất, quạt cây.
- Đồng nghiệp ngồi ở bàn riêng với tư thế theo tính cách. Thỉnh thoảng một người ra pantry rồi quay về, đi vòng qua bàn ghế, không ai đứng trùng chỗ. Người nghỉ phép thì vắng, bàn có biển “Nghỉ phép” (theo lịch văn phòng có sẵn).
- Họp đầu ngày: mũi tên chỉ chỗ họp, chị Hạnh gọi “Cả nhà ra họp nhé!”; đến nơi nhấn E là vào cảnh họp cũ.
- Task: ngồi vào bàn nhấn E, chọn làm nhanh, làm kỹ hoặc để tối OT. “Hỏi anh Dũng” thì phải đi sang bàn anh Dũng. Task buổi chiều cũng tự làm ở bàn; ở chế độ danh sách và khi tua nhanh thì vẫn tự làm theo nếp như cũ.
- Ăn trưa: ra cửa cùng team hoặc ăn bún chả; ăn bánh mì hay ngủ trưa thì ở bàn. Tan làm: ra cửa ở sảnh, gặp các lựa chọn về nhà, trà đá, OT như cũ.
- Việc nhỏ ở văn phòng: uống nước, pha cà phê (10 phút, năng lượng +2, mỗi ngày một lần), chấm công, gỡ giấy kẹt máy in, xem bảng công việc.
- Bắt chuyện với đồng nghiệp: câu nói theo tính cách, quan hệ cộng theo giới hạn mỗi ngày đã có từ v11.

**Bốn trò chơi nhỏ khi làm task** (chọn làm nhanh hoặc làm kỹ thì mới có trò chơi):
- 🐞 Bắt bug: chạm đúng dòng code sai.
- 🧩 Xếp code: kéo thả hoặc bấm ▲ ▼ để đưa các bước về đúng thứ tự.
- ⌨️ Gõ lệnh: gõ đúng vài lệnh `npm`, `git`.
- 🔌 Nối dây API: nối hàm với kết quả, hoặc khái niệm với nghĩa của nó.
- Mỗi task gắn với một trò hợp loại việc, có câu đố riêng (`js/du-lieu/tro-choi.js`).
- Làm nhanh thì ít thời gian hơn. Làm kỹ thì có gợi ý: chỉ chỗ cần nhìn, đặt sẵn dòng đầu, nối sẵn một cặp, không phân biệt chữ hoa thường. Task khó hơn và Chuyên môn thấp hơn thì ít thời gian hơn.
- Kết quả chỉ nhích nhẹ: điểm 0–1 đổi thành ±6 điểm phần trăm cộng vào khả năng làm task thành công (`MG.MAX`). Kết quả ghi ngay trong khung kết quả.
- Nút “Để nhân vật tự làm” và nút “Xong” để dừng sớm. Bỏ qua thì được tính ±0, giống hệt bấm nút như cũ.
- Chơi được bằng chuột, bàn phím, chạm. Đồng hồ trò chơi dừng khi chuyển tab.

**Kỷ luật** (bảng `KY_LUAT`). Đang có task mà rời bàn liên tục thì bị nhắc theo ba mức:
- 30 phút game: chị Hạnh nhắn tin nhắc.
- 60 phút: chị đến tận nơi nhắc, quan hệ −1.
- 90 phút: hiệu suất −1, ghi vào nhật ký và buổi nhận xét có nhắc lại.
- Vào công ty rồi mà 15 phút không tới chỗ họp: chị Hạnh gọi tên trước cả nhóm, quan hệ −1.
- Hết giờ mà chưa làm task thì tính thêm một lần nhắc.
- Mỗi loại tối đa một lần mỗi ngày. Lúc đang nói chuyện, đang chọn việc, đang mở điện thoại thì không tính.

**Sửa lỗi:**
- (Từ v14) Ở nhà bố mẹ, chạm vào bố hoặc mẹ rồi chọn “Uống trà với bố mẹ” thì game báo lỗi. Nay đã chạy đúng.
- (Từ v14.1) Khung hướng dẫn đã ẩn vẫn hiện thành một chấm tối nhỏ ở đầu khung.

**Mã:**
- Thêm `js/van-phong/` (5 file: đồ đạc, bản đồ công ty, đồng nghiệp, kỷ luật, ngày làm việc).
- Thêm `js/tro-choi/` (khung chung và 4 trò), `js/du-lieu/tro-choi.js`, `css/van-phong.css`, `css/tro-choi.css`.
- Bộ máy thế giới nhận nhiều “nơi chơi” (`ROAM_PLACES`): nhà, văn phòng; thêm nơi mới chỉ cần thêm một mục.
- File dài nhất dưới 300 dòng.

**Kiểm thử:**
- Thêm `npm run van-phong-di-lai` (62 mục):
  - đủ 8 văn phòng, họp, họp muộn, task ở bàn, hỏi anh Dũng;
  - bỏ qua trò chơi cho kết quả giống hệt bấm nút; 4 trò chơi giỏi +6%, chơi kém âm;
  - ba mức kỷ luật, mỗi ngày một lần; tan làm, ăn trưa, tua nhanh; điện thoại.
- Phần văn phòng cũ trong kiểm thử 56 ngày chạy ở chế độ danh sách.

## v14.1: Buổi sáng tự do – thức dậy trên giường, nằm thêm, ra khỏi nhà, chạy, hướng dẫn
Không đổi tài chính, lương, nghỉ phép, sự kiện. Bản lưu cũ mở bình thường.
- Ngay khi vào game đã điều khiển được nhân vật: cảnh thức dậy diễn ra trong nhà, nhân vật nằm trên giường, đồng hồ đứng ở giờ báo thức.
  - Hai bong bóng lớn chạm được (điện thoại) hoặc nhấn phím: ☀️ Dậy (E) và 😴 Nằm thêm 10 phút (R). Ngày nghỉ còn thêm “Ngủ nướng tới trưa” (T) như cũ.
  - Lời trên lịch bóc, giấc ngủ đêm qua, việc hôm nay hiện gọn dưới khung.
- Luật nằm thêm thống nhất cho mọi ngày (danh sách cũ cũng dùng luật này):
  - Mỗi lần 10 phút, năng lượng +1, tối đa 3 lần. Lần cuối nhân vật lẩm bẩm “Thêm 5 phút nữa thôi…”.
  - Ngày đi làm, đi phỏng vấn thì giờ đến lùi theo, tính bằng phần đi muộn có sẵn.
  - Trước đây chỉ ngày đi làm có “Nằm thêm 15 phút” (năng lượng +5), một lần.
- Ngày đầu tiên: dậy xong là đi lại được; mũi tên vàng chỉ bàn học, Tùng hoặc mẹ nhắc sửa CV. Đến bàn học nhấn E, chọn “Sửa CV, nộp hồ sơ” thì mở đúng hai cảnh cũ.
- Ngày đi làm, ngày phỏng vấn: có thêm bước ở nhà chuẩn bị rồi ra cửa.
  - Dưới khung ghi giờ phải ra khỏi nhà để kịp; quá giờ đó thì đồng hồ chuyển màu đỏ.
  - Ra cửa lúc nào thì giờ đến lùi hoặc sớm hơn đúng chừng ấy, tính qua phần đi muộn có sẵn. Vội mấy cũng mất ít nhất 15 phút chuẩn bị (`BAL.PREP_FAST`).
  - Quá giờ phải đi một tiếng mà chưa ra cửa thì tự đi.
  - Ở chế độ danh sách, khi tua nhanh hoặc tắt thế giới tự do thì bước này tự qua, ra khỏi nhà đúng giờ như trước.
  - Buổi sáng có thêm “Ăn sáng nhanh” ở bếp: 10 phút, năng lượng +2, mỗi ngày một lần.
- Chạy: giữ Shift khi đi; trên điện thoại kéo joystick ra sát mép.
  - Nhanh gấp 1,8 lần đi bộ, có dáng chạy.
  - Tốn năng lượng: chạy liên tục 10 giây thì −1. Năng lượng dưới 8 thì không chạy nổi.
  - Các con số nằm ở bảng `ROAM`.
- Hướng dẫn 4 bước khi vào nhà lần đầu, bước sau hiện khi xong bước trước: đi lại → chạy → đến gần đồ vật → nhấn E (điện thoại: chạm ✋). Có nút “Bỏ qua”; xem lại bằng nút trong “Nếp sinh hoạt”.
- Đồng hồ chạy nối tiếp giữa các cảnh trong ngày (dậy → chuẩn bị → buổi sáng), không nhảy lùi hay nhảy cóc.
- Kiểm thử: thêm 20 mục vào `npm run the-gioi`:
  - ngày đầu điều khiển được ngay, nằm thêm, hướng dẫn, sửa CV ở bàn học;
  - nằm thêm 3 lần cộng ra khỏi nhà muộn 20 phút thì đến công ty muộn đúng 50 phút;
  - chạy nhanh hơn và tốn năng lượng, mệt thì không chạy nổi;
  - điện thoại: chạm để dậy, joystick kéo hết cỡ thì chạy.

Để lại cho bản sau: văn phòng đi lại được (v15), ngoài phố và các địa điểm (v16).

## v14: Tự đi lại trong nhà – Phase 1 của thế giới tương tác
Không đổi luật chơi, công thức chỉ số, tài chính, lương, nghỉ phép, mô phỏng 56 ngày. Bản lưu cũ mở bình thường (chỉ thêm vị trí nhân vật trong nhà).
- Giờ rảnh, bữa ăn ở nhà và giờ đi ngủ giờ được chơi trong một căn nhà có thể đi lại tự do, thay cho bảng chọn việc:
  - Bàn phím: WASD hoặc mũi tên để đi, giữ để đi liên tục, giữ hai phím để đi chéo (không nhanh hơn đi thẳng); E để dùng đồ, số 1–9 để chọn việc, Esc để đóng.
  - Điện thoại: joystick và nút ✋ nằm ngay dưới khung nên không che cảnh.
  - Bấm hoặc chạm vào đồ vật: nhân vật tự tìm đường đến (vòng qua đồ đạc, vách ngăn), tới nơi thì hiện các việc làm được ở đó. Bấm xuống sàn thì đi đến chỗ đó.
  - Không đi xuyên tường, đồ đạc hay ra ngoài nhà. Đi vào phía trong thì nhân vật nhỏ lại, ra phía ngoài thì to lên. Camera bám theo, góc phải ghi tên phòng đang đứng.
  - Mất focus hay chuyển tab khi đang giữ phím thì nhân vật dừng ngay, không bị kẹt phím.
- Mỗi hoàn cảnh một căn nhà khác hẳn:
  - Phòng trọ: một phòng khép kín (đệm, bàn học, bàn gấp, tủ lạnh mini, bếp điện, dây phơi quần áo) và nhà tắm nhỏ.
  - Căn hộ ghép: nhà tắm, phòng ngủ của bạn, phòng khách có TV và máy chơi game (Tùng hay ngồi chơi hoặc ngủ trên sofa), bếp có bàn ăn.
  - Nhà bố mẹ: phòng của bạn, phòng khách có bàn thờ và bộ ấm chén (bố đọc báo, uống trà), bếp có mẹ nấu cơm và mâm cơm.
- Đồ vật là lối vào cho đúng các lựa chọn cũ, cùng một hàm áp dụng, nên chỉ số và tiền tính đúng một lần:
  - Giường: nằm nghỉ; ban đêm là đi ngủ.
  - Máy tính: học, ôn phỏng vấn, xem tin tuyển dụng, sửa CV, tính tiền nong; ở trọ thì chơi game và xem phim cũng ở đây.
  - TV: xem phim; ở ghép thì chơi game với máy của Tùng.
  - Bếp và tủ lạnh: tự nấu, mì tôm. Bàn ăn: cơm mẹ nấu, gọi đồ ăn.
  - Chổi: dọn nhà. Cửa sổ: gọi về cho bố mẹ. Bộ ấm chén: uống trà với bố mẹ.
  - Cửa ra vào: cà phê, trà đá, chạy bộ, mua sắm, rủ đi chơi, các việc cả ngày, cơm bụi đầu ngõ. Ra cửa thì chuyển sang cảnh bên ngoài như trước.
- Đồng hồ trong game chạy liên tục cả khi đi lại (1 giây ngoài đời = 2 phút), dừng khi mở điện thoại, khi đang chọn việc hay chuyển tab. Mỗi buổi có khung giờ riêng: sáng từ lúc dậy đến 12:00, chiều 13:30–18:30, tối 19:30–22:00, ăn trưa và ăn tối mỗi bữa một khung, đêm 22:00–02:00.
  - Dùng một đồ vật chính thì nhân vật diễn động tác (nằm đắp chăn, gõ máy, nấu có khói, ăn, quét nhà, ra cửa), đồng hồ quay nhanh đến cuối buổi, kết quả hiện ngay dưới khung, rồi nhấn E hoặc “Tiếp tục”.
  - Việc nhỏ chỉ tốn vài phút, vẫn ở trong buổi: tắm (20 phút, tinh thần +2, mỗi ngày tính một lần), rửa mặt, uống nước, ngắm phố, ngồi nghỉ ở sofa, chào người nhà.
  - Lên giường lúc nào thì giờ đi ngủ tính đúng lúc đó (làm tròn 15 phút). Đến 02:00 chưa ngủ thì ngủ gục.
  - Hết giờ mà chưa làm gì: giờ rảnh thì tính là lướt điện thoại (như chọn “Xem phim, lướt mạng”), bữa ăn thì ăn theo nếp.
  - Dòng giờ ở đầu trang và nhật ký trong ngày ghi đúng giờ trên đồng hồ.
- Người nhà có mặt theo buổi và chào khi bạn đi ngang. Chạm vào họ để chào; với bố mẹ thì có thêm “Uống trà với bố mẹ” nếu lúc đó làm được.
- Danh sách lựa chọn cũ vẫn mở được ngay dưới khung (“📋 Danh sách lựa chọn”). Nút “Qua nhanh hôm nay” vẫn như cũ. Tắt hẳn chế độ này trong “Nếp sinh hoạt”, hoặc tắt “Cảnh sống” thì cũng tắt luôn.
- Giảm chuyển động: vẫn điều khiển bình thường, camera và các động tác không chạy hiệu ứng.
- Mã: thêm thư mục `js/the-gioi/` (bản đồ, điều khiển, di chuyển, tương tác, vòng lặp) và `css/the-gioi.css`. Hàm `choose` tách phần áp dụng lựa chọn thành `settleChoice` để thế giới dùng chung; lựa chọn giờ ngủ tách thành `bedChoice`. Các con số chỉnh được nằm ở bảng `ROAM`.
- Kiểm thử: thêm `npm run the-gioi` (43 mục, trình duyệt thật) gồm:
  - ba căn nhà: đồ vật nào cũng đi tới được, lựa chọn nào cũng có chỗ làm;
  - phím, đi chéo, va chạm, mất focus, đồng hồ chạy và dừng;
  - dùng bàn học cho chỉ số giống hệt bấm nút; tắm; hết giờ; đi ngủ đúng giờ;
  - joystick trên điện thoại; tắt chế độ; bản lưu cũ; giảm chuyển động.

Để lại cho bản sau:
- Nhân vật chưa có dáng quay lưng hay đi lên trên: đi vào trong hay ra ngoài thì vẫn quay mặt ra.
- Người nhà còn đứng yên tại chỗ theo buổi; trò chuyện sâu, rủ đi chơi khi gặp trực tiếp để Phase 2.
- Văn phòng và ngoài phố vẫn là cảnh xem (Phase 3–4).
- Chưa thử trên điện thoại thật, chỉ giả lập iPhone 13 trong trình duyệt.

## v13.3: Nghỉ phép rõ ràng hơn, luật cho người mới
Không đổi gameplay khác, tài chính, mô phỏng 56 ngày; không đổi cấu trúc bản lưu.
- Người mới đi làm: trong 5 ngày làm việc đầu tiên chỉ báo nghỉ được từng ngày một (việc gấp), không được nghỉ đúng ngày đầu đi làm. Xin nghỉ nhiều ngày lúc này thì chị Hạnh giải thích và không nhận đơn; nghỉ một ngày thì được nhưng chị nhắc khéo và kém vui hơn một chút. Qua tuần đầu thì như cũ.
- Màn chơi luôn nhắc lịch nghỉ: “Đã xin nghỉ … · còn N ngày nữa. Hôm nay vẫn đi làm.”; khi đang nghỉ thì ghi ngày thứ mấy và ngày đi làm lại; đang chờ bàn giao cũng được nhắc.
- Form xin nghỉ ghi rõ hôm nay vẫn đi làm bình thường, muốn nghỉ ngay trong ngày thì báo lúc vừa ngủ dậy; người mới thì ghi rõ luật tuần đầu.
- Hồ sơ liệt kê các ngày nghỉ sắp tới.
- Kiểm thử: thêm 10 mục cho luật người mới và phần nhắc lịch nghỉ.
## v13.2: Màn hình mở đầu gọn lại – một nút chính, một lối vào Cài đặt
Chỉ thay giao diện màn hình mở đầu. Không đổi gameplay, tài chính, sức khỏe, nghỉ phép, mô phỏng 56 ngày; không đổi cấu trúc bản lưu.
- Màn chính chỉ còn một nút hành động: “Chơi tiếp” khi có bản lưu, “Bắt đầu cuộc sống mới” khi chưa có. Bản lưu không đọc được thì báo rõ, nút chính hỏi xác nhận trước khi bắt đầu mới, không xóa dữ liệu cũ.
- Đầu trang: tên game và một dòng giới thiệu bên trái; nút Cài đặt (bánh răng, 46×46 điểm ảnh) cố định ở góc trên bên phải, không trôi khi cuộn. Bỏ nút loa và nút chơi lại khỏi màn chính.
- Hộp thoại Cài đặt (dùng lại hộp thoại có sẵn của game; giữa màn hình trên máy tính, trượt lên từ đáy trên điện thoại; đóng bằng nút ✕, Escape hoặc chạm ra ngoài; nội dung dài thì cuộn bên trong):
  - Âm thanh: Nhạc nền và Hiệu ứng âm thanh, hai công tắc độc lập. Nhạc nền là tùy chọn mới (chỉ có ở màn mở đầu); Hiệu ứng âm thanh dùng chung với nút âm thanh trong game.
  - Hiển thị: “Luôn giảm chuyển động” (mặc định theo hệ điều hành; bật thì áp dụng cho cả game). Chất lượng hình ảnh ghi “Tự động”, không phải công tắc, vì game chưa có cơ chế chất lượng riêng.
  - Dữ liệu trò chơi: “Chơi mới / Chơi lại từ đầu” mở bước xác nhận nêu rõ tiến trình nào sẽ bị thay; bản lưu cũ còn nguyên cho đến khi tạo xong nhân vật mới.
  - Thông tin: phiên bản, thời gian của bản chơi thử.
- Mở hoặc đóng Cài đặt không dựng lại khung phố, nhân vật, hoạt cảnh hay âm thanh. Đóng thì con trỏ bàn phím quay về nút Cài đặt.
- Kiểm thử màn mở đầu cập nhật theo giao diện mới, thêm phần hộp thoại Cài đặt và 5 cỡ màn hình.

## v13.1: Hoàn thiện màn hình mở đầu
Không đổi luật chơi, tài chính, sức khỏe, nghỉ phép; không đổi cấu trúc bản lưu.

Lỗi thật đã sửa (đã tái hiện được trên v13):
- Bản lưu hỏng hoặc thiếu dữ liệu làm màn mở đầu trắng trơn, không có nút nào để bấm. Giờ kiểm tra bản lưu trước khi đọc; không đọc được thì báo rõ, vẫn cho bắt đầu mới (phải bấm xác nhận) và không xóa hay sửa bản lưu.
- Chuyển sang tab khác thì nhạc và hoạt cảnh vẫn chạy ngầm. Giờ dừng hẳn khi rời tab, quay lại thì dựng lại khung phố và bật lại nhạc nếu trước đó đang bật.
- Bật nhạc lại trong lúc nhạc đang nhỏ dần thì bị bỏ qua, nhạc tắt luôn. Giờ dừng hẳn phần đang nhỏ dần rồi phát lại.
- Có bản lưu thì nút “Chơi tiếp” nằm dưới mép màn hình ở 4/6 cỡ điện thoại đã thử (320, 360, 375 điểm ảnh), phải cuộn mới thấy.

Cải tiến:
- Thanh nút luôn nằm trong màn hình (kể cả màn hình thấp), nút cao 50 điểm ảnh dễ bấm; “Chơi tiếp” và “Chơi lại” nằm cạnh nhau.
- Khung phố tràn hết bề ngang trên điện thoại và có thêm một dải trời: lớn hơn 12–15%. Màn hình máy tính giữ như cũ.
- Chữ mô tả to hơn (16,5 điểm ảnh); người chơi quay lại thì không hiện lại phần giới thiệu; thu gọn khoảng trống.
- Khung chờ hiện ngay trong lúc các file của game đang tải (trên 3G giả lập: có nội dung sau khoảng 0,2 giây thay vì màn trắng 2,9 giây), cùng kích thước với màn thật nên không nhảy bố cục. Font Google không còn chặn hiển thị trang.
- Nhịp phố lúc đông lúc vắng thay vì đều tăm tắp; không để hai người cùng làm một việc đặc biệt; mỗi lúc chỉ một hoạt cảnh, xáo thứ tự.
- Hành vi ngắn mới: người đi bộ dừng lại xem điện thoại hoặc đứng nghỉ rồi đi tiếp; hai người gặp nhau dừng lại hỏi han; khách dừng mua của hàng rong.
- Nhiều nhất 2 bong bóng thoại cùng lúc, kể cả khi chạm vào nhân vật; không lặp lại câu vừa nói.
- Bật tắt chế độ giảm chuyển động trong lúc đang ở màn mở đầu thì khung phố dựng lại theo chế độ mới.
- Kiểm thử mới `kiem-thu-mo-dau.js` chạy trong trình duyệt thật.

## v13: Màn hình mở đầu – góc phố Hà Thành
Không đổi luật chơi.
- Màn hình mở đầu thành một góc phố đang sống, dùng lại bộ máy cảnh sống: dãy nhà ống có biển hiệu, dây điện, cột đèn, cây bàng lá rơi, mây trôi, chim bay.
- Người đi bộ hai chiều trên vỉa hè, mỗi người một dáng và tốc độ; có người dắt chó, người chạy bộ, người vừa đi vừa xem điện thoại. Trong một làn, người đi sau không bao giờ nhanh hơn người đi trước nên không ai đi xuyên qua ai.
- Xe máy chạy hai làn ngược chiều, bánh xe quay. Có xe tấp vào lề, người bước xuống đi vào phố; có chủ xe từ quán đi ra, lên xe, nổ máy rời đi.
- Quán trà đá: hai khách lần lượt nói và uống, thỉnh thoảng cùng cười; ấm trà bốc hơi.
- Hàng rong gánh hàng, đội nón lá, dừng lại rao “Bánh mì nóng đây!”. Bạn bè (Tùng, Linh, chị Mai, Phong, mẹ) thỉnh thoảng đi ngang, dừng lại chào nhân vật chính, nhân vật vẫy tay đáp lời.
- Trời, nắng, đèn đường, cửa sổ và biển hiệu đổi theo giờ thật trên máy: sáng, trưa, chiều, tối, đêm có sao.
- Âm thanh 8-bit: nhạc nền vui lặp lại, tiếng phố rì rầm, xe máy xa gần, còi xe, chuông, tiếng rao, tiếng cười, chim hót buổi sáng. Bật sau lần chạm đầu tiên, có nút bật tắt riêng, nhỏ dần khi vào game.
- Tên game hiện dần; tờ lịch lật vào, có bản lưu thì hiện đúng ngày đang chơi; nhân vật chính mặc đúng ngoại hình đã tạo.
- Thẻ “Chơi tiếp”: ảnh nhân vật, nơi ở, ngày và tuần thứ mấy trên 8 tuần, công việc và lương, số dư và tình trạng tài chính, năng lượng, sức khỏe, tinh thần, mốc sắp tới, thời điểm lưu.
- “Chơi lại từ đầu” khi đang có bản lưu phải bấm hai lần.
- Hai bố cục: khung cảnh ở trên (mặc định) hoặc khung cảnh tràn viền với tên game nằm trên trời (đổi `TITLE.LAYOUT`).
- Giảm chuyển động: khung cảnh tĩnh, đủ thông tin, không có gì tự chạy.
- Rời màn hình là mọi hoạt cảnh, hẹn giờ và âm thanh đều dừng.

## v12.1: Nghỉ phép gọn lại, đúng ngày công
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
