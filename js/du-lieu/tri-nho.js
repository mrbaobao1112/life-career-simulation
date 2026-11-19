/* =========================================================
   THẾ GIỚI SỐNG – PHASE 4: CÂU NHẮC LẠI CHUYỆN CŨ
   Khi một lựa chọn làm quan hệ với ai đó thay đổi đáng kể, người đó ghi nhớ "chuyện gì" (theo cảnh) và "tốt hay không tốt".
   Lần gặp sau (từ hôm sau), họ nhắc lại bằng một câu ở đây. Chỉ những cảnh có trong bảng mới được nhớ, nên câu luôn khớp chuyện.
   MEM_LINES[cảnh] = { pos:{ người:[câu…], '*':[câu chung] }, neg:{ … } }. Thêm chuyện mới = thêm một mục.
   Cảnh sự kiện viết 'ev:mã', cảnh khác viết đúng mã cảnh (task, hangout, repay…).
   ========================================================= */
const MEM_LINES = {
  'ev:coffee_run':{ pos:{ dung:['Cốc bạc xỉu hôm trước chuẩn vị đấy.', 'Hôm nào anh mời lại em cốc nước.'], '*':['Hôm trước em mua nước cho cả team, cảm ơn nhé!'] },
                    neg:{ dung:['Hôm nay rảnh chưa, hay vẫn đang dở task?'] } },
  'ev:birthday':  { pos:{ mai:['Thiệp em viết chị vẫn giữ đấy!', 'Cảm ơn em hôm sinh nhật chị nhé.'], '*':['Bánh sinh nhật chị Mai hôm trước ngon nhỉ.'] },
                    neg:{ mai:['…Ừ, chào em.'], '*':['Hôm sinh nhật chị Mai không thấy em đâu.'] } },
  'ev:tung_drink':{ pos:{ tung:['Bữa bia hôm trước vui phết, bao giờ làm tiếp?', 'Hôm trước mày tỉnh nhất bàn đấy!'] },
                    neg:{ tung:['Hôm trước rủ mà mày không ra…', 'Lần sau đi nhé, đừng bỏ tao nữa.'] } },
  'ev:linh_study':{ pos:{ linh:['Buổi học hôm trước hiệu quả ghê, tuần sau học tiếp nhé!'] },
                    neg:{ linh:['Hẹn hôm khác mãi, bao giờ mới học cùng?'] } },
  'ev:linh_check':{ pos:{ linh:['Dạo này mày đỡ hơn chưa? Tao vẫn lo đấy.'] } },
  'ev:tung_borrow':{ pos:{ tung:['Khoản hôm trước tao nhớ đấy, có lương tao trả ngay!', 'Mày đúng là bạn tốt nhất của tao.'] },
                     neg:{ tung:['Không sao đâu… tao tự xoay được.', 'Hôm trước tao hơi kẹt thật mà.'] } },
  'tung_repay':   { pos:{ tung:['Trả xong rồi nhé, sòng phẳng!'] }, neg:{ tung:['Khoản kia tao nhớ mà, đừng nhắc nữa…'] } },
  'repay':        { pos:{ linh:['Mày trả đúng hẹn, tao quý mày ở điểm đó.'], tung:['Sòng phẳng thế, tao phục.'], mom:['Con trả mẹ đúng hẹn, mẹ vui lắm.'] },
                    neg:{ linh:['Khoản kia… mày nhớ nhé.'], tung:['Ê, khoản kia đến hẹn rồi đấy.'], mom:['Tiêu pha cẩn thận con nhé.'] } },
  'hangout':      { pos:{ tung:['Hôm trước ngồi trà đá vui ghê, mai ra tiếp?'], linh:['Hôm trước đi cà phê vui ghê, hôm nào đi tiếp nhé!'], dung:['Hôm trước ngồi trà đá với em vui đấy.'],
                          mai:['Cà phê hôm trước chị thích lắm, lần sau chị mời!'], phong:['Hôm trước ngồi trà đá với ông vui phết!'], boss:['Buổi cà phê hôm trước chị thấy em tiến bộ đấy.'], mom:['Hôm trước ngồi nói chuyện với con, mẹ vui lắm.'] } },
  'task':         { pos:{ dung:['Lỗi hôm trước em hiểu rồi chứ?', 'Có gì khó cứ hỏi anh.'] },
                    neg:{ dung:['Hôm nay tự đọc log trước nhé.', 'Hôm trước em hỏi hơi nhiều đấy.'] } },
  'bug_back':     { pos:{ mai:['Hôm trước em nhận lỗi nhanh, chị quý đấy.'], boss:['Lần trước em sửa lỗi nhanh, tốt lắm.'] },
                    neg:{ mai:['“Trên máy em chạy bình thường” hả? Chị nhớ đấy nhé.', 'Lần này chị test kỹ máy em luôn.'], boss:['Lần sau có lỗi thì nhận và sửa nhé em.'] } },
  'bug_weekend':  { pos:{ boss:['Hôm cuối tuần cảm ơn em đã xem giúp chị.'] }, neg:{ boss:['Cuối tuần trước chị nhắn mà em chưa xem…'] } },
  'endwork':      { pos:{ boss:['Hôm trước em ở lại OT, chị ghi nhận rồi.'], phong:['Hôm trước ở lại cùng nhau vui phết!'], mai:['Cảm ơn em hôm trước ở lại nhé.'] },
                    neg:{ boss:['Lần trước em xin lùi hạn, lần này cố đúng hạn nhé.'], phong:['Hôm trước ông về sớm, tôi làm một mình…'] } },
  'standup':      { neg:{ boss:['Hôm nay báo cáo ngắn gọn thôi em nhé.'] } },
  'ob_env':       { pos:{ dung:['Quen việc chưa em? Có gì cứ hỏi.'] } },
};
// Đồng nghiệp nhận ra mình vừa nghỉ mấy hôm (tính từ đơn nghỉ đã duyệt, không cần lưu thêm)
const MEM_LEAVE = { boss:['Đi làm lại rồi à, mấy hôm nghỉ ổn chứ em?'], dung:['Mấy hôm vắng em, việc dồn đấy.'], mai:['Ơ, em đi làm lại rồi! Mấy hôm nghỉ có khỏe không?'], phong:['Ông nghỉ mấy hôm, tôi tưởng ông nghỉ luôn!'] };
// NPC nhớ chuyện với NPC (lần chào nhau sau đó)
const MEM_NPC = {
  argue:[['Vụ hôm qua… tôi nói hơi to.', 'Ừ, bỏ qua đi.'], ['Chuyện tách hàm hôm qua, tôi nghĩ lại rồi.', 'Thế à, nói nghe xem.']],
  snack:[['Bánh hôm qua ngon thật chị ạ.', 'Mai chị mang tiếp!'], ['Bánh quê chị ngon quá.', 'Thích thì lần sau để phần nhé!']],
};
