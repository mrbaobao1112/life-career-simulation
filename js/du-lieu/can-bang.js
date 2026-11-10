/* =========================================================
   CÂN BẰNG GAME: chỉnh các con số ở đây khi thử nghiệm
   ========================================================= */
const BAL = {
  BG: {
    nha:  { money: 4000000,  rent: 0,       tech: 30, soft: 33 },
    tro:  { money: 4500000,  rent: 3500000, tech: 34, soft: 30 },
    ghep: { money: 3500000,  rent: 2000000, tech: 30, soft: 36 },
  },
  LIVING_PER_MONTH: 4000000,   // chi phí ăn uống, đi lại ước tính mỗi tháng
  DAYS_TO_PAYDAY: 18,          // từ Chủ Nhật 22/11 đến ngày nhận lương 10/12
  PREP_BONUS: 12,              // điểm kỹ thuật cộng thêm mỗi lần ôn phỏng vấn
  HR_PASS: 4,                  // điểm HR tối thiểu để đậu
  LATE_CHANCE: [[5, .6], [6, .4], [7, .15], [99, .04]], // [ngủ dưới X giờ, xác suất đi muộn]
  NUTR_DECAY: 8,               // dinh dưỡng giảm mỗi đêm
  WORK_STRESS: 4,              // tinh thần giảm sau mỗi ngày đi làm
  WAKE_WORK: 6.75, WAKE_FREE: 8.5, WAKE_WEEKEND: 9.25,
  // Năng lượng & giấc ngủ
  SLEEP_RATE: 8,          // điểm năng lượng hồi phục mỗi giờ ngủ
  SLEEP_NEED: 7.5,        // số giờ ngủ cần mỗi đêm; thiếu thì tích lũy nợ ngủ
  DEBT_PENALTY: 4,        // điểm năng lượng bị trừ cho mỗi giờ nợ ngủ
  DEBT_MAX_PENALTY: 24,
  HANGOVER: 15,           // dư âm bia hơi
  LATE_BED_PENALTY: 5,    // ngủ sau 1 giờ sáng
  SLOT_DRAIN: 4,          // năng lượng tiêu hao tự nhiên mỗi buổi thức
  // Công thức chỉ số
  DIMINISH: .7,           // chỉ số càng gần 100, điểm cộng càng ít
  REPEAT_FADE: .7,        // mỗi lần lặp lại cùng hoạt động trong 2 ngày, hiệu quả nhân thêm hệ số này
  LOW_ENERGY_LEARN: .6,   // năng lượng dưới 30: hiệu quả học còn 60%
  SKILL_KNEE: 55, SKILL_SLOW: .3,   // chuyên môn, kỹ năng mềm từ 55 trở lên thì tăng chậm hẳn (để 8 tuần không chạm trần 100)
  SKILL_KNEE2: 80, SKILL_SLOW2: .1, // từ 80 trở lên thì gần như chỉ còn nhích từng chút
  MOOD_DRIFT: .15,        // mỗi đêm tinh thần kéo về mức 60 một phần
  TRADA_INVITE: .3,       // xác suất đồng nghiệp rủ đi trà đá lúc tan làm
  EVENT_RATE: .6,         // sau tuần đầu: xác suất một buổi có thể có sự kiện bất ngờ
  REVIEW_DAY: 12,         // nhận xét đầu tiên của trưởng nhóm: thứ Sáu đầu tiên từ ngày này (27/11)
  REVIEW_MIN_DAYS: 5,     // phải đi làm ít nhất chừng này ngày mới có nhận xét
  // Buổi sáng (phút)
  PREP_MIN: 35, BUFFER_MIN: 25, APPOINT: 9 * 60,
  COMMUTE: { nha:{ hotay:20, banhmi:30, cudem:15, loren:25 }, tro:{ hotay:40, banhmi:35, cudem:45, loren:30 }, ghep:{ hotay:25, banhmi:20, cudem:30, loren:35 } },
};

const COMPANIES = {
  hotay:  { name:'Hồ Tây Soft', type:'Outsource lớn', icon:'🏢', salary:10000000, pref:'stable', need:42, ot:.25,
            desc:'1.200 nhân viên, quy trình dày như từ điển. Ổn định, OT theo mùa dự án.' },
  banhmi: { name:'Bánh Mì Pay', type:'Công ty sản phẩm', icon:'🥖', salary:12500000, pref:'passion', need:55, ot:.2,
            desc:'Ví điện tử cho người ăn sáng vội. Lương khá, phỏng vấn kỹ thuật nổi tiếng là khó.' },
  cudem:  { name:'Cú Đêm Lab', type:'Startup', icon:'🦉', salary:9000000, pref:'proactive', need:46, ot:.45,
            desc:'12 người, một con mèo, rất nhiều ước mơ. Học cực nhanh, giờ giấc cực… linh hoạt.' },
  loren:  { name:'Giải Pháp Số Lò Rèn', type:'Công ty nhỏ', icon:'🔨', salary:8000000, pref:null, need:0, ot:.3,
            desc:'Đang thiếu người gấp. Rất gấp.' },
  // Các công ty xuất hiện trong những đợt tin tuyển dụng sau (dành cho người chưa có việc)
  songhong: { name:'Sông Hồng Tech', type:'Outsource vừa', icon:'🌊', salary:9000000, pref:'stable', need:40, ot:.3,
            desc:'300 nhân viên, làm dự án cho khách Hàn Quốc. Quy củ, hơi nhiều họp.' },
  xeom:   { name:'Xe Ôm Xanh', type:'Startup', icon:'🛵', salary:9500000, pref:'proactive', need:44, ot:.4,
            desc:'Ứng dụng gọi xe ôm cho các ngõ nhỏ. Việc nhiều, người ít, ai cũng làm ba vai.' },
  trasua: { name:'Trà Sữa Số', type:'Công ty sản phẩm', icon:'🧋', salary:11000000, pref:'passion', need:50, ot:.2,
            desc:'Phần mềm quản lý cho chuỗi trà sữa. Lương ổn, phỏng vấn hỏi khá sâu.' },
  giaytot: { name:'Giấy Tốt Agency', type:'Công ty nhỏ', icon:'📰', salary:8500000, pref:'stable', need:36, ot:.3,
            desc:'Làm website cho doanh nghiệp nhỏ. Khách đổi ý liên tục, nhưng học được nhiều thứ.' },
};

const PEOPLE = {
  family:{ name:'Bố mẹ', icon:'👪', note:'Luôn hỏi chuyện việc làm' },
  tung:  { name:'Tùng', icon:'🍺', note:'Bạn thân, chuyên gia rủ rê' },
  linh:  { name:'Linh', icon:'📚', note:'Bạn thân, chăm chỉ đến đáng sợ' },
  boss:  { name:'Chị Hạnh', icon:'🧭', note:'Trưởng nhóm', work:true },
  dung:  { name:'Anh Dũng', icon:'🎧', note:'Senior, lúc nào cũng đeo tai nghe', work:true },
  mai:   { name:'Chị Mai', icon:'🔍', note:'Tester, tìm bug nhanh hơn bạn tạo bug', work:true },
  phong: { name:'Phong', icon:'🌱', note:'Fresher cùng đợt', work:true },
};

const SLOTS = ['morning','noon','afternoon','evening','night'];
const SLOT_INFO = { morning:['Sáng','07:00'], noon:['Trưa','12:00'], afternoon:['Chiều','13:30'], evening:['Tối','18:30'], night:['Đêm','22:00'] };

