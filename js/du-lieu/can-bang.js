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
  MOOD_DRIFT: .15,        // mỗi đêm tinh thần kéo về mức 60 một phần
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

const DAYS = [null,
  { date:16, dow:'Thứ Hai',  quote:'Có công mài sắt, có ngày nộp CV.' },
  { date:17, dow:'Thứ Ba',   quote:'Ăn quả nhớ kẻ trồng cây, đi phỏng vấn nhớ mang CV.' },
  { date:18, dow:'Thứ Tư',   quote:'Đi một ngày đàng, học một sàng khôn, cài một ngày môi trường.' },
  { date:19, dow:'Thứ Năm',  quote:'Một cây làm chẳng nên non, một dev sửa chẳng hết bug.' },
  { date:20, dow:'Thứ Sáu',  quote:'Thứ Sáu là ngày đẹp trời để không cập nhật gì lên hệ thống.' },
  { date:21, dow:'Thứ Bảy',  quote:'Ngủ nướng cũng là một cách yêu bản thân.' },
  { date:22, dow:'Chủ Nhật', quote:'Chủ Nhật là ngày của những việc định làm từ thứ Hai.' },
];
const SLOTS = ['morning','noon','afternoon','evening','night'];
const SLOT_INFO = { morning:['Sáng','07:00'], noon:['Trưa','12:00'], afternoon:['Chiều','13:30'], evening:['Tối','18:30'], night:['Đêm','22:00'] };

