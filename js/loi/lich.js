/* =========================================================
   LỊCH ĐỘNG: mọi thứ về ngày tháng tính từ 16/11/2026 (ngày 1 của game)
   ========================================================= */
const LAST_DAY = 56;                    // ngày cuối của bản chơi thử: Chủ Nhật 10/1/2027
const HOLIDAYS = ['1/1'];               // ngày nghỉ lễ (ngày/tháng): không phải đi làm
const DOW = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
// Câu trên lịch bóc: 7 câu đầu dành cho tuần đầu tiên, sau đó xoay vòng cả danh sách
const QUOTES = [
  'Có công mài sắt, có ngày nộp CV.',
  'Ăn quả nhớ kẻ trồng cây, đi phỏng vấn nhớ mang CV.',
  'Đi một ngày đàng, học một sàng khôn, cài một ngày môi trường.',
  'Một cây làm chẳng nên non, một dev sửa chẳng hết bug.',
  'Thứ Sáu là ngày đẹp trời để không cập nhật gì lên hệ thống.',
  'Ngủ nướng cũng là một cách yêu bản thân.',
  'Chủ Nhật là ngày của những việc định làm từ thứ Hai.',
  'Vạn sự khởi đầu nan, gian nan nhất là dậy sớm.',
  'Chậm mà chắc, miễn là đừng chậm lương.',
  'Uống nước nhớ nguồn, uống cà phê nhớ deadline.',
  'Gần mực thì đen, gần senior thì bớt bug.',
  'Tiền vào nhà khó như gió vào nhà trống.',
  'Việc hôm nay chớ để ngày mai, trừ khi hôm nay là thứ Sáu.',
  'Có thực mới vực được đạo, có lương mới vực được tiền nhà.',
  'Kiến tha lâu cũng đầy tổ, tiết kiệm lâu cũng đủ tiền trọ.',
  'Học thầy không tày học bạn, học bạn không tày đọc tài liệu.',
  'Thất bại là mẹ thành công, bug là bố kinh nghiệm.',
  'Đói cho sạch, rách cho thơm, cuối tháng cho khéo.',
  'Một nụ cười bằng mười thang thuốc bổ, một giấc ngủ bằng hai cốc cà phê.',
  'Năng nhặt chặt bị, năng lưu khỏi mất.',
  'Xa mặt cách lòng, nhớ gọi điện về nhà.',
];
function dayInfo(d = S.day){
  const x = dateOf(d);
  return { date:x.getDate(), month:x.getMonth() + 1, year:x.getFullYear(), wd:x.getDay(), dow:DOW[x.getDay()], quote:QUOTES[(d - 1) % QUOTES.length] };
}
const isWeekend = (d = S.day) => { const w = dateOf(d).getDay(); return w === 0 || w === 6; };
const isHoliday = (d = S.day) => HOLIDAYS.includes(fmtD(d));
const isDayOff = (d = S.day) => isWeekend(d) || isHoliday(d);
const weekOf = (d = S.day) => Math.ceil(d / 7);
const weekStart = (d = S.day) => (weekOf(d) - 1) * 7 + 1;
function nextWorkStart(from = S.day){ let d = from + 1; while (isDayOff(d)) d++; return d; }
// Ngày cuối cùng của tháng chứa ngày d (tính theo số ngày của game)
function monthEnd(d = S.day){ const x = dateOf(d); return dayOfDate(new Date(x.getFullYear(), x.getMonth() + 1, 0)); }
// Số liệu thống kê tính riêng cho tuần hiện tại (S.stat là cộng dồn từ đầu game)
const W = k => (S.stat[k] || 0) - ((S.ws0 || {})[k] || 0);
