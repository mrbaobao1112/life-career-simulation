/* =========================================================
   THẾ GIỚI SỐNG – PHASE 1: LỊCH SINH HOẠT THEO GIỜ CỦA TỪNG NPC
   Mỗi người có lịch ngày thường và lịch cuối tuần (ngày lễ tính như cuối tuần), từng mốc là [giờ, việc].
   Mỗi ngày các mốc lệch đi một chút (SONG.JIT) theo bộ ngẫu nhiên riêng của ngày đó: không ngày nào giống hệt ngày nào,
   nhưng cùng một ngày thì luôn ra cùng một lịch (kiểm thử ổn định, không đụng Math.random của luật chơi).
   Đây chỉ là phần hình: không đổi chỉ số, tiền, quan hệ của người chơi.
   ========================================================= */
const SONG = {
  JIT:.25,                   // mỗi mốc lịch lệch ngẫu nhiên tối đa ±15 phút
  TICK:.25,                  // bộ máy hành vi nghĩ 4 lần mỗi giây (không phải 60)
  BEAT:[25, 70],             // trong một việc dài, cứ chừng này phút game thì có một việc xen ngắn (lấy nước, nghe điện thoại…)
  BEAT_P:.55,                // xác suất có việc xen (còn lại là ngồi yên tiếp)
  IDLE:[3, 8],               // đứng yên quan sát, chờ đợi (phút game)
  SPEED:62,                  // tốc độ đi của NPC
  LEAD:15,                   // bắt đầu đổi việc sớm chừng này phút game (thời gian đi đường), để đến nơi đúng giờ
  MIN_GAP:.1,                // sau khi lệch giờ, hai mốc liền nhau vẫn cách ít nhất 6 phút và giữ đúng thứ tự
  LOD:90,                    // NPC ở ngoài khung nhìn quá chừng này thì dịch chuyển thẳng, không diễn đi bộ
  SIGNS:true,                // hiện dấu hiệu nhỏ trên đầu (💬 😴 🍜…); tắt được trong Nếp sinh hoạt
};
// Bộ ngẫu nhiên riêng cho thế giới sống: cùng (ngày, khóa) → cùng dãy số
function songRng(key){
  let h = 2166136261; const s = `${S ? S.day : 0}|${key}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const songWeekend = (d = S.day) => isDayOff(d);

/* ----- Lịch ở nhà: Tùng (bán hàng ca chiều), bố mẹ ----- */
const HOME_DAY = {
  tung: { weekday:[[0, 'sleep'], [9.6, 'bath'], [10, 'cook'], [10.6, 'game'], [13.2, 'out'], [22, 'game'], [24.6, 'sleep']],      // ca chiều 13:30–21:30
          weekend:[[0, 'sleep'], [10.4, 'bath'], [10.8, 'game'], [15, 'out'], [18.4, 'eat'], [19, 'game'], [25.3, 'sleep']] },   // chiều cuối tuần đi trà đá
  mom:  { weekday:[[0, 'out'], [6, 'cook'], [7, 'out'], [8.6, 'sweep'], [9.5, 'tea'], [10.6, 'cook'], [12, 'eat'], [13, 'news'], [15, 'tea'], [16.8, 'cook'], [18.5, 'eat'], [19.5, 'news'], [22, 'out']],
          weekend:[[0, 'out'], [6.5, 'cook'], [7.5, 'out'], [9, 'sweep'], [10.4, 'cook'], [12, 'eat'], [13, 'news'], [15, 'out'], [16.8, 'cook'], [18.5, 'eat'], [19.5, 'news'], [22.3, 'out']] },  // sáng đi chợ, chiều sang hàng xóm
  dad:  { weekday:[[0, 'out'], [6.5, 'tea'], [7.3, 'out'], [17.3, 'tea'], [18.5, 'eat'], [19.5, 'news'], [22.5, 'out']],     // bố còn đi làm
          weekend:[[0, 'out'], [7, 'tea'], [8, 'read'], [10, 'altar'], [10.5, 'read'], [12, 'eat'], [13, 'out'], [15.5, 'tea'], [18.5, 'eat'], [19.5, 'news'], [22.5, 'out']] },
};
// Việc → chỗ (khóa trong SONG_SPOTS của từng nhà), động tác, dấu hiệu; việc xen ngắn có thể làm trong việc đó
const HOME_ACT = {
  sleep:{ spot:'sofa', lie:true, sign:'😴' }, bath:{ spot:'bath', hide:true, sign:'🚿' }, cook:{ spot:'stove', act:'act-cook', sign:'🍳' },
  game:{ spot:'tvPlay', act:'act-game', sign:'🎮', beats:['drink', 'phone', 'stretch'] }, eat:{ spot:'tableR', act:'act-eat', sign:'🍜' },
  sweep:{ spot:'mid', act:'act-sweep', sign:'🧹', roam:60 }, tea:{ spot:'tea', act:'act-drink', sign:'🍵', beats:['phone'] },
  news:{ spot:'sofaR', act:'act-read', sign:'📺', beats:['drink'] }, read:{ spot:'sofaL', act:'act-read', sign:'📰', beats:['stretch', 'drink'] },
  altar:{ spot:'altar', act:'act-think', sign:'🙏' }, out:{ out:true },
};
// Việc xen ngắn (phút game): làm xong thì quay về việc chính
const SONG_BEAT = {
  drink:  { spot:'fridge', act:'act-drink', sign:'🥤', dur:[4, 8] },
  phone:  { spot:null, act:'act-phone', sign:'📱', dur:[5, 12] },
  stretch:{ spot:null, act:'', sign:'', dur:[3, 6], step:40 },
  water:  { spot:'pantry', act:'act-drink', sign:'☕', dur:[5, 10] },
  think:  { spot:null, act:'act-think', sign:'💭', dur:[4, 9] },
  visit:  { spot:'visit', act:'act-talk', sign:'💬', dur:[5, 10] },
  board:  { spot:'meet', act:'act-read', sign:'🗂️', dur:[6, 12] },
};
// Chỗ trong từng nhà (thêm cho các việc mới; chỗ nằm trong đồ đạc thì đi đến chỗ trống gần nhất rồi ngồi vào)
const SONG_SPOTS = {
  ghep: { sofa:{ x:512, y:142 }, tvPlay:{ x:500, y:152, face:true }, stove:{ x:690, y:178 }, tableR:{ x:590, y:160, face:true }, bath:{ x:40, y:168 },
          fridge:{ x:620, y:168 }, door:{ x:732, y:164 }, mid:{ x:470, y:184 } },
  nha:  { stove:{ x:700, y:160 }, mid:{ x:470, y:180 }, sofaL:{ x:446, y:150 }, sofaR:{ x:486, y:150, face:true }, tea:{ x:540, y:150, face:true },
          tableR:{ x:790, y:160, face:true }, tableL:{ x:760, y:160 }, altar:{ x:380, y:166 }, fridge:{ x:636, y:168 }, door:{ x:584, y:164 }, bath:{ x:40, y:168 } },
};
const HOME_WHO = { ghep:['tung'], nha:['mom', 'dad'], tro:[] };

/* ----- Lịch ở công ty: đến dần, họp đầu ngày, làm việc, ăn trưa, về ----- */
const VP_DAY = {
  boss:  [[8.4, 'desk'], [9, 'meet'], [9.25, 'desk'], [11.9, 'out'], [13, 'desk'], [18.2, 'out']],
  dung:  [[8.6, 'desk'], [9, 'meet'], [9.25, 'desk'], [12.1, 'out'], [13.05, 'desk'], [18, 'out']],
  mai:   [[8.75, 'desk'], [9, 'meet'], [9.25, 'desk'], [11.85, 'out'], [12.9, 'desk'], [17.5, 'out']],
  phong: [[8.85, 'desk'], [9, 'meet'], [9.25, 'desk'], [11.85, 'out'], [12.9, 'desk'], [17.6, 'out']],
};
// Việc xen trong giờ làm theo tính cách (người hòa đồng hay sang bàn bạn; Phong hay sang hỏi anh Dũng)
const VP_BEATS = { boss:['board', 'visit', 'phone', 'water'], dung:['water', 'think'], mai:['visit', 'water', 'visit', 'phone'], phong:['visit', 'water', 'think'] };
const VP_ACT = { desk:{ spot:'desk', sign:'💻' }, meet:{ spot:'meet', act:'act-listen', sign:'🗣️' }, out:{ out:true } };

// Lịch hôm nay của một người: các mốc đã lệch theo ngày; mốc “meet” không lệch (họp đúng giờ)
function npcDay(who, kind){
  const base = kind === 'office' ? VP_DAY[who] : (HOME_DAY[who] || {})[songWeekend() ? 'weekend' : 'weekday'];
  if (!base) return [];
  const r = songRng('day:' + who), out = [];
  base.forEach(([h, act], i) => {
    let x = i === 0 || act === 'meet' ? h : h + (r() * 2 - 1) * SONG.JIT;
    if (out.length) x = Math.max(x, out[out.length - 1][0] + SONG.MIN_GAP);   // không để việc sau chen lên trước việc trước
    out.push([x, act]);
  });
  return out;
}
// Người này đang làm gì lúc t (phút game). Trả về { act, i, from, to } (i: số thứ tự mốc, để biết khi nào đổi việc)
function npcNow(who, kind, t){
  const L = npcDay(who, kind), h = t / 60; let i = 0;
  for (let k = 0; k < L.length; k++) if (L[k][0] <= h) i = k;
  if (kind === 'office' && h < L[0][0]) return { act:'out', i:-1, from:0, to:L[0][0] * 60 };
  return { act:L[i][1], i, from:L[i][0] * 60, to:(L[i + 1] ? L[i + 1][0] : 30) * 60 };
}
// Việc cần làm lúc này, có tính đường đi: sắp ra ngoài hoặc đang ở ngoài sắp về thì đi sớm SONG.LEAD phút
function songWant(who, kind, t){
  const now = npcNow(who, kind, t), ahead = npcNow(who, kind, t + SONG.LEAD);
  return ahead.act === 'out' || now.act === 'out' ? ahead : now;
}
