/* =========================================================
   LỊCH ĐỘNG CỦA VĂN PHÒNG (v11)
   - Mỗi ngày, lịch của từng đồng nghiệp được xếp lại theo tính cách: không ngày nào giống hệt ngày nào.
   - Sự kiện văn phòng (họp đột xuất, lỗi khẩn cấp, chạy hạn chót) chèn lên lịch; hết sự kiện thì mọi người làm tiếp lịch đang dở.
   - Có ngày một người nghỉ phép: bàn trống cả ngày.
   - Văn phòng nhớ diễn biến trong ngày (ai nghỉ, sự kiện đang ở đâu), nên đổi thẻ không làm mọi thứ quay lại từ đầu.
   Đây là dữ liệu tạm của phần hình: không ghi vào bản lưu và không ảnh hưởng luật chơi.
   ========================================================= */
const OFFICE_BAL = {
  ABSENT:.14,               // xác suất hôm nay có một đồng nghiệp nghỉ phép
  EVENT:.55,                // xác suất hôm nay có một sự kiện văn phòng
  FIRST:[2500, 9000],       // việc riêng đầu tiên của mỗi người bắt đầu trong khoảng này (mili giây)
};
// Sự kiện văn phòng: bắt đầu sau bao lâu kể từ khi vào buổi (at), kéo dài bao lâu (dur)
const OFFICE_EVENTS = {
  meeting:  { name:'Họp đột xuất',  at:[7000, 12000], dur:11000 },
  hotfix:   { name:'Lỗi khẩn cấp',  at:[6000, 11000], dur:10000 },
  deadline: { name:'Chạy hạn chót', at:[5000, 9000],  dur:13000 },
};
let OFFICE_DAY = null;
const STAGE_DEBUG = { conflicts:0, log:[] };      // dùng cho kiểm thử: ghi lại ai đang được việc nào điều khiển

// Xếp lịch một buổi cho một người theo tính cách
function officePlan(who, present){
  const p = personaOf(who), others = present.filter(k => k !== who), list = [];
  const n = 2 + Math.round(p.social * 3);                    // người hòa đồng có nhiều việc xen giữa hơn
  for (let i = 0; i < n; i++) {
    const r = Math.random(); let b;
    if (r < p.social * .5 && others.length) b = 'chat:' + (p.asks && others.includes(p.asks) && Math.random() < .6 ? p.asks : pick(others));
    else if (r < p.social * .5 + .12 + p.social * .22 + (S.rel[who] - 50) / 250) b = 'visit';      // chủ động sang bàn bạn; càng thân càng hay sang
    else if ((p.roles || []).length && r < .85) b = pick(p.roles);
    else b = Math.random() < .65 ? 'water' : 'stretch';
    if (b !== list[list.length - 1]) list.push(b);
  }
  return { i:0, list, at: (OFFICE_BAL.FIRST[0] + Math.random() * (OFFICE_BAL.FIRST[1] - OFFICE_BAL.FIRST[0])) * (1.5 - p.social), gap: 1.45 - p.social * .7 };
}
function officeEvent(present){
  const ids = Object.keys(OFFICE_EVENTS).filter(id => id !== 'meeting' || present.includes('boss'));
  const id = pick(ids), E = OFFICE_EVENTS[id], others = present.filter(k => k !== 'boss');
  const who = id === 'meeting' ? ['boss', ...shuffle(others).slice(0, 2)]
    : id === 'hotfix' ? [present.includes('dung') ? 'dung' : 'boss', present.includes('mai') ? 'mai' : others.find(k => k !== 'dung') || 'phong']
    : present.slice();
  return { id, name:E.name, who, at: E.at[0] + Math.random() * (E.at[1] - E.at[0]), dur:E.dur, phase:'pending', started:0 };
}
// Trạng thái văn phòng của ngày hôm nay (tạo mới khi sang ngày, xếp lại lịch khi sang buổi)
function officeDay(){
  const fresh = !OFFICE_DAY || OFFICE_DAY.day !== S.day || OFFICE_DAY.co !== (S.job && S.job.co);
  if (fresh) {
    const special = S.day === S.job.start || reviewDue();     // ngày đầu đi làm và ngày nhận xét: đủ mặt, không có sự kiện
    const absent = !special && Math.random() < OFFICE_BAL.ABSENT ? [pick(['dung','mai','phong'])] : [];
    OFFICE_DAY = { day:S.day, co:S.job && S.job.co, absent, slot:null, eventSlot: !special && Math.random() < OFFICE_BAL.EVENT ? pick(['morning','afternoon']) : null, done:[] };
  }
  const D = OFFICE_DAY;
  if (D.slot !== S.slot) {
    D.slot = S.slot; D.elapsed = 0; D.plans = {};
    const present = COLLEAGUES.filter(k => !D.absent.includes(k));
    present.forEach(k => { D.plans[k] = officePlan(k, present); });
    D.event = D.eventSlot === S.slot && !D.done.includes('event') ? officeEvent(present) : null;
  }
  return D;
}
// Dành cho kiểm thử: ép một sự kiện xảy ra sau một khoảng thời gian
function officeForce(id, atMs, absent){
  OFFICE_DAY = null; const keep = Math.random; Math.random = () => .99; const D = officeDay(); Math.random = keep;
  D.absent = absent || []; const present = COLLEAGUES.filter(k => !D.absent.includes(k));
  D.plans = {}; present.forEach(k => { D.plans[k] = officePlan(k, present); });
  D.eventSlot = S.slot; D.event = id ? { ...officeEvent(present), id, name:OFFICE_EVENTS[id].name, at:atMs, dur:OFFICE_EVENTS[id].dur } : null;
  if (D.event) { const others = present.filter(k => k !== 'boss'); D.event.who = id === 'meeting' ? ['boss', ...others.slice(0, 2)] : id === 'hotfix' ? ['dung','mai'] : present.slice(); }
  return D;
}
