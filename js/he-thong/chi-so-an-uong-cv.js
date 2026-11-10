/* ----- Công thức điểm cộng: giảm dần khi chỉ số cao, khi lặp lại, khi mệt; tinh thần phụ thuộc độ thân ----- */
const repeatCount = id => id === 'hangout' ? 0 : (S.actLog || []).filter(x => x.id === id && x.d >= S.day - 1).length;
function shapeGains(before, actId, npc){
  const fade = actId ? Math.pow(BAL.REPEAT_FADE, repeatCount(actId)) : 1;
  const learn = before.energy < 30 ? BAL.LOW_ENERGY_LEARN : 1;
  const relF = npc && before.rel[npc] !== undefined ? .75 + before.rel[npc] / 200 : 1;
  const dim = v => 1 - Math.pow(v / 100, 2) * BAL.DIMINISH;
  for (const k of ['mood','health','tech','soft']) {
    const d = S[k] - before[k];
    if (d > 0) S[k] = before[k] + d * fade * dim(before[k]) * (k === 'mood' ? relF : 1) * (k === 'tech' || k === 'soft' ? learn * (before[k] >= BAL.SKILL_KNEE2 ? BAL.SKILL_SLOW2 : before[k] >= BAL.SKILL_KNEE ? BAL.SKILL_SLOW : 1) : 1);
  }
  // Ở mức cao, phần lẻ được làm tròn theo xác suất để kỹ năng vẫn nhích dần thay vì đứng yên
  for (const k of ['tech','soft']) if (before[k] >= BAL.SKILL_KNEE && S[k] > before[k]) { const f = Math.floor(S[k]); S[k] = f + (chance(S[k] - f) ? 1 : 0); }
  for (const k of Object.keys(S.rel)) { const d = S.rel[k] - before.rel[k]; if (d > 0) S.rel[k] = before.rel[k] + d * fade * (1 - Math.pow(before.rel[k] / 100, 2) * .6); }
  if (actId) { (S.actLog = S.actLog || []).push({ id:actId, d:S.day }); if (S.actLog.length > 40) S.actLog.shift(); }
}

/* ----- Thói quen ăn uống: tính theo khoảng 10 bữa gần nhất ----- */
const MEAL_TAGS = { home:{ name:'Cơm nhà', v:85 }, cook:{ name:'Tự nấu', v:80 }, rice:{ name:'Cơm bụi, cơm văn phòng', v:65 }, bun:{ name:'Bún, phở ngoài quán', v:60 },
  app:{ name:'Đồ ăn qua ứng dụng', v:50 }, ot:{ name:'Cơm hộp công ty', v:55 }, bread:{ name:'Bánh mì', v:42 }, party:{ name:'Đồ nhậu', v:30 }, noodle:{ name:'Mì tôm', v:20 }, skip:{ name:'Bỏ bữa', v:0 } };
const FAST = ['app','noodle','bread','party'];
const APP_DISHES = [
  { name:'gà rán sốt cay', v:28, t:'Ngon, giòn, và bạn biết chắc là không tốt cho sức khỏe lắm.' },
  { name:'cơm gà xối mỡ', v:48, t:'No căng bụng. Phí giao hàng bằng nửa giá món.' },
  { name:'bún bò Huế', v:62, t:'Nước dùng đậm đà, có cả rau sống. Một lựa chọn khá tử tế.' },
  { name:'salad ức gà', v:82, t:'Bạn tự hào về bản thân khoảng 20 phút, cho đến khi thấy đói lại.' },
];
function updateNutr(){ const last = [...Array(10).fill({ v:60 }), ...(S.meals || [])].slice(-10); S.nutr = Math.round(last.reduce((a, m) => a + m.v, 0) / last.length); }
function logMeal(tag, v){ (S.meals = S.meals || []).push({ d:S.day, tag, v: v ?? MEAL_TAGS[tag].v }); if (S.meals.length > 30) S.meals.shift(); updateNutr(); }
// Thêm thói quen mới: thêm một dòng vào đây, đặt on:true khi đã có dữ liệu
const HABITS = [
  { id:'regular', name:'Ăn đủ bữa', on:true, eval:m => { const n = m.slice(-6).filter(x => x.tag === 'skip').length; return n === 0 ? ['good','Đều đặn'] : n === 1 ? ['ok','Thỉnh thoảng bỏ bữa'] : ['bad','Hay bỏ bữa']; } },
  { id:'variety', name:'Ăn đa dạng', on:true, eval:m => { const n = new Set(m.slice(-8).map(x => x.tag)).size; return n >= 4 ? ['good','Phong phú'] : n === 3 ? ['ok','Tạm ổn'] : ['bad','Ăn đi ăn lại vài món']; } },
  { id:'fast', name:'Đồ ăn nhanh', on:true, eval:m => { const n = m.slice(-8).filter(x => FAST.includes(x.tag)).length; return n <= 1 ? ['good','Ít'] : n <= 3 ? ['ok','Vừa phải'] : ['bad','Nhiều, cần cải thiện']; } },
  { id:'homecook', name:'Cơm nhà, tự nấu', on:true, eval:m => { const n = m.slice(-8).filter(x => x.tag === 'home' || x.tag === 'cook').length; return n >= 3 ? ['good','Thường xuyên'] : n >= 1 ? ['ok','Thỉnh thoảng'] : ['bad','Chưa có bữa nào']; } },
  { id:'water', name:'Uống đủ nước', on:false, eval:() => ['ok','Sẽ có trong bản sau'] },
];
function foodProfile(){
  const m = S.meals || [], v = S.nutr;
  return { v, label: v >= 70 ? 'Tốt' : v >= 55 ? 'Khá' : v >= 40 ? 'Tạm ổn' : 'Cần cải thiện', rows: m.length ? HABITS.filter(h => h.on).map(h => [h.name, ...h.eval(m)]) : [] };
}
function foodHTML(){
  const f = foodProfile();
  return `<div class="food"><div class="food-top"><span>Chất lượng dinh dưỡng</span><b>${f.label}</b></div>
    <div class="bar"><i class="${f.v < 40 ? 'low' : f.v < 55 ? 'mid' : ''}" style="width:${f.v}%"></i></div>
    ${f.rows.length ? `<div class="habits">${f.rows.map(([n, l, t]) => `<div class="hb"><span>${n}</span><span class="lv ${l}">${t}</span></div>`).join('')}</div>` : '<p class="muted">Chưa có dữ liệu bữa ăn.</p>'}
    <p class="muted">Tính theo khoảng 10 bữa gần nhất: một bữa không ảnh hưởng nhiều, thói quen mới quan trọng.</p></div>`;
}

/* ----- CV: độ nổi bật, độ trung thực, kỹ năng đã khai ----- */
function setCV(stand, honest, real, fake){
  S.cv = { stand, honest, real, fake };
  S.flags.buzz = fake.length > 0 && chance((10 - honest) / 10 + .1);
}
const cvBonus = () => S.cv && typeof S.cv === 'object' ? Math.round(S.cv.stand * .8) : 0;
const cvHR = () => (S.cv && S.cv.stand >= 6 ? 1 : 0) - (S.flags.buzz ? 1 : 0);
function cvHTML(){
  if (!S.cv || typeof S.cv !== 'object') return '<p class="muted">Chưa viết CV.</p>';
  const c = S.cv;
  return `<div class="kv"><span>Độ nổi bật</span><span>${c.stand}/10</span><span>Độ trung thực</span><span>${c.honest}/10</span></div>
    <div class="chips">${c.real.map(x => `<span class="chip">${x}</span>`).join('')}${c.fake.map(x => `<span class="chip bad" title="Chưa thật sự biết">⚠️ ${x}</span>`).join('')}</div>
    ${c.fake.length ? '<p class="muted">Các kỹ năng có dấu ⚠️ là khai khống. Chúng có thể bị kiểm tra lại, cả bây giờ lẫn sau này.</p>' : ''}`;
}

