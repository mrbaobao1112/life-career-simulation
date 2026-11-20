/* =========================================================
   v16: ĐI PHỐ – nối nhà ↔ phố ↔ bên trong các địa điểm, và nối đồ vật với các lựa chọn có sẵn
   S.where nhớ bạn đang ở đâu trong buổi hiện tại (sang buổi mới thì coi như đã về nhà, như trước đây).
   Việc ở mỗi nơi gọi đúng lựa chọn của cảnh (Cà phê với Linh, Trà đá với Tùng, Chạy bộ, Đi mua sắm, Cơm bụi…).
   ========================================================= */
const PHO_OPEN = { 'in:cafe':[7, 23], 'in:trada':[7, 23], 'in:bia':[16, 23.5], 'in:com':[10, 21], 'in:lib':[8, 21], 'in:lake':[5, 23], 'in:mall':[9, 22], 'in:bus':[5, 19] };
// Việc nhỏ ở các địa điểm (không thuộc luật cũ): cà phê mang về, cốc bia hơi có chút tiền và chỉ số, còn lại chỉ tốn vài phút
const PHOK = { TAKEAWAY:25000, TAKEAWAY_MOOD:2, BEER:15000, BEER_MOOD:2, BEER_ENERGY:-2, LOOK_MIN:10 };
const phoOn = () => roamOn();
const phoRef = ref => ref.id === 'activity' || (ref.id === 'meal' && !(ref.arg === 'lunch' && isWorkday()));
function whereNow(){ const w = S.where; return w && w.d === S.day && w.slot === S.slot ? w : null; }
const whereAt = () => { const w = whereNow(); return w ? w.at : 'home'; };
const phoWhere = () => (S.where = whereNow() || { d:S.day, slot:S.slot, at:'home', bike:null });
// Sang nơi khác: nhớ chỗ, đổi nơi, dựng lại cảnh (đồng hồ chạy tiếp)
function roamGo(to, enter){
  const w = phoWhere();
  if (to === 'home' && w.bike === 'ride') w.bike = null;                                   // về nhà: cất xe
  else if (to.startsWith('in:') && w.bike === 'ride') w.bike = { park:to };                 // vào quán: dựng xe trước cửa
  else if (to === 'street' && w.bike && w.bike.park === w.at) w.bike = 'ride';              // ra khỏi quán: lên xe đi tiếp
  w.at = to; w.enter = enter || (to === 'home' ? house().objs.find(o => o.kind === 'door').spot : null);
  SFX.play('pop'); renderScene();
}
function placeEnter(){ const w = whereNow(); if (w && w.enter) { const e = w.enter; w.enter = null; return e; } return null; }
const isOpen = (to, t) => { const h = PHO_OPEN[to]; if (!h) return true; const x = t / 60; return x >= h[0] && x < h[1]; };

/* ----- Việc làm được ở từng đồ vật ngoài phố và trong quán ----- */
const PHO_MINOR = {
  takeaway:() => ({ icon:'🥤', label:`Cà phê trứng mang về (${fmt(PHOK.TAKEAWAY)})`, min:5, off:S.money < PHOK.TAKEAWAY || S.flags.takeaway === S.day, why:S.flags.takeaway === S.day ? 'Hôm nay uống rồi' : 'Không đủ tiền',
    fx:() => { if (typeof pvPlayerOrder === 'function') pvPlayerOrder(WORLD); S.flags.takeaway = S.day; S.money -= PHOK.TAKEAWAY; spendLog(PHOK.TAKEAWAY); S.mood += PHOK.TAKEAWAY_MOOD; clampAll(); feedAdd({ id:'pho' }, '🥤', 'Cà phê trứng mang về.', -PHOK.TAKEAWAY); return 'Béo ngậy, thơm lừng.'; } }),
  beer:() => ({ icon:'🍺', label:`Làm một cốc bia hơi (${fmt(PHOK.BEER)})`, min:15, off:S.money < PHOK.BEER || S.flags.beer === S.day, why:S.flags.beer === S.day ? 'Một cốc thôi' : 'Không đủ tiền',
    fx:() => { S.flags.beer = S.day; S.money -= PHOK.BEER; spendLog(PHOK.BEER); S.mood += PHOK.BEER_MOOD; S.energy += PHOK.BEER_ENERGY; clampAll(); feedAdd({ id:'pho' }, '🍺', 'Một cốc bia hơi.', -PHOK.BEER); return 'Mát lạnh. Một cốc thôi đấy.'; } }),
  view:    () => ({ icon:'🌆', label:'Ngắm phố từ ban công', min:PHOK.LOOK_MIN, fx:() => 'Từ tầng 3 nhìn xuống, dòng xe như một con sông.' }),
  sipTea:  () => ({ icon:'🫖', label:'Xin cốc trà đá', min:5, fx:() => 'Bác rót cho cốc trà, bảo: “Uống đi cháu, không lấy tiền.”' }),
  football:() => ({ icon:'⚽', label:'Xem bóng đá ké', min:PHOK.LOOK_MIN, fx:() => pick(['Vàoooo! Cả quán đứng bật dậy.', 'Hiệp một hòa 0–0. Cả quán thở dài.']) }),
  book:    () => ({ icon:'📚', label:'Xem qua giá sách', min:PHOK.LOOK_MIN, fx:() => pick(['Có cuốn “Lập trình cho người mới”. Bạn đọc lướt mục lục.', 'Một cuốn tiểu thuyết dày cộp. Để hôm khác.']) }),
  tryon:   () => ({ icon:'👕', label:'Thử áo', min:PHOK.LOOK_MIN, fx:() => 'Áo đẹp, giá cũng đẹp. Bạn treo lại chỗ cũ.' }),
  cups:    () => ({ icon:'☕', label:'Ngắm cốc', min:5, fx:() => 'Một cái cốc hình con mèo. Rất muốn mua. Rất kìm lòng.' }),
  wait:    () => ({ icon:'🪑', label:'Ngồi chờ một lát', min:PHOK.LOOK_MIN, fx:() => 'Loa thông báo: “Xe đi Nam Định chuẩn bị xuất bến…”' }),
  lakeView:() => ({ icon:'🌳', label:'Ngồi ghế đá ngắm hồ', min:PHOK.LOOK_MIN, fx:() => 'Gió hồ mát. Mấy chú chim sẻ nhảy quanh chân ghế.' }),
};
function phoEntries(ref, sc, o){
  const u = o.use || {}, t = WORLD ? WORLD.t : 0, out = [];
  if (o.kind === 'go') {
    if (u.to === 'home') return [{ icon:'🏠', label:'Về nhà', go:'home' }];
    if (u.to === 'street') return [{ icon:'🚶', label:'Ra phố', go:'street', enter:u.enter }];
    const open = isOpen(u.to, t), name = PHO_ROOMS[u.to] ? PHO_ROOMS[u.to].name : o.name;
    return [{ icon:o.icon, label:`Vào ${name}`, go:u.to, off:!open, why:open ? '' : `Mở cửa ${clock(PHO_OPEN[u.to][0])}–${clock(PHO_OPEN[u.to][1])}` }];
  }
  if (o.kind === 'bike') return bikeEntries();
  const acts = ref.id === 'activity' ? (u.acts || []) : [], meals = ref.id === 'meal' ? (u.meals || []) : [];
  if (o.kind === 'act' || o.kind === 'phuong' || o.kind === 'lap') sc.choices.forEach((ch, i) => {
    const want = o.kind === 'phuong' ? ch.actId === 'trip_errand' : acts.includes(ch.actId) || meals.includes(ch.key);
    if (!want) return;
    const poor = ch.cost && S.money < ch.cost;
    if (o.kind === 'lap') { if (!WORLD || !WORLD.lap) out.push({ icon:'🏃', label:'Bắt đầu chạy một vòng hồ', run:hoStart }); return; }
    const solo = PHO_PARTNER[ch.actId] && phoSolo(PHO_PARTNER[ch.actId]);   // người đi cùng không có ở đây: làm một mình
    out.push({ icon:ch.icon, label:solo ? PHO_SOLO_LABEL[ch.actId] : ch.short || ch.label, cost:ch.cost, i, off:poor || ch.disabled, why:poor ? 'Không đủ tiền' : '' });
  });
  if (o.kind === 'minor' && PHO_MINOR[u.minor]) out.push({ ...PHO_MINOR[u.minor](), minor:true });
  return out;
}
function phoIdle(ref, o){
  if (ref.id === 'meal') return '🍚 Đang giờ ăn: ra quán cơm bụi';
  if (o.kind === 'phuong') return '🏛️ Làm giấy tờ phải đi từ sáng';
  if (o.kind === 'lap') return '🏃 Buổi này không chạy được';
  return `${o.icon} ${o.name}`;
}
// Hết buổi khi đang ở ngoài: kết quả là đi dạo phố (không phải việc ở nhà như xem phim)
const DAO_PHO = {
  MOOD:2,                    // ra ngoài hít thở, ngắm phố: tinh thần nhích nhẹ
  ENERGY:-2,                 // đi bộ lòng vòng: hơi mỏi chân
};
function phoTimeout(ref, sc){
  if (ref.id !== 'activity') return roamTimeoutChoice(ref, sc);
  return { ch:{ icon:'🚶', label:'Dạo phố', fx:() => { S.mood += DAO_PHO.MOOD; S.energy += DAO_PHO.ENERGY;
    return pick(['Bạn lang thang ngoài phố, ngắm người qua lại. Buổi này trôi qua lúc nào không hay.', 'Đi hết phố này sang phố khác, chẳng mua gì, chẳng gặp ai. Nhưng đầu óc nhẹ hơn hẳn.']); } }, text:'' };
}
// Người trong quán: người hẹn sẵn (Linh ở quán cà phê, Tùng ở trà đá) → đúng lựa chọn đi chơi; người hẹn qua “Rủ ai đó đi chơi” → cuộc trò chuyện cũ
// Việc cần người này (cà phê với Linh, trà đá với Tùng): thực đơn khi đứng cạnh họ
const phoNeedEntries = n => (ref, sc) => { const i = sc.choices.findIndex(c => c.actId === n.need); return i < 0 ? [] : [{ icon:sc.choices[i].icon, label:sc.choices[i].short || sc.choices[i].label, i, cost:sc.choices[i].cost, off:sc.choices[i].cost && S.money < sc.choices[i].cost, why:'Không đủ tiền', say:pick(['Đợi lâu chưa?', 'Xin lỗi, tắc đường quá!']), reply:pick(['Mới đến thôi.', 'Ngồi đi!']) }, { icon:'💬', label:'Bắt chuyện', talk:true }]; };
// Người đi cùng của từng việc: vắng mặt thì vẫn làm được, một mình (xem phoSolo)
const PHO_PARTNER = { cafe:'linh', trada:'tung' }, PHO_SOLO_LABEL = { cafe:'Ngồi cà phê một mình', trada:'Ngồi trà đá một mình' };
const phoSolo = who => !!(typeof WORLD !== 'undefined' && WORLD && WORLD.cityId && !WORLD.dead && !WORLD.npcs.some(a => a.who === who && !a.gone));
function roomNpcs(W, api, id){
  const R = PHO_ROOMS[id]; if (!R || !R.npcs) return;
  R.npcs().forEach((n, k) => {
    if (n.need && !W.sc.choices.some(c => c.actId === n.need)) return;
    if (n.need && typeof CITY_DAY !== 'undefined' && CITY_DAY[n.who]) return;     // Tùng, Linh: có mặt theo lịch của họ (thanh-pho.js), không ngồi sẵn
    if (S.meet && S.meet.d === S.day && n.who === S.meet.who) return;
    const a = api.npc(n.who, n.x, n.y, n.act, n.left, { id:n.who + '_' + k, look:n.look, label:n.label });
    if (n.need) a.entries = phoNeedEntries(n);
    else if (n.who === 'p') a.entries = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
  });
  const m = S.meet;
  if (m && m.d === S.day && m.slot === S.slot && m.at === id) {
    const sp = PHO_ROOMS[id].objs().find(o => o.kind === 'act');
    const a = api.npc(m.who, sp ? sp.spot.x + 40 : 200, 158, 'act-talk', true, { id:'meet_' + m.who });
    a.entries = () => [{ icon:m.sc === 'cc_hoc' ? '📚' : '💬', label:m.sc === 'cc_hoc' ? `Ngồi học cùng ${PEOPLE[m.who].name}` : `Ngồi nói chuyện với ${PEOPLE[m.who].name}`, run:() => meetStart(m.who, m.sc) }];   // sc: cảnh riêng của lần hẹn (chuyện tự nảy sinh)
    api.C.later(() => api.say(a, m.sc === 'cc_hoc' && typeof CC_LOI !== 'undefined' ? CC_LOI.linh.gap : 'Đây rồi! Ngồi đi.', 1800), 600);
  }
}
// “Rủ ai đó đi chơi”: ở chế độ đi lại, người được rủ đợi ở nơi hẹn thay vì gặp ngay
function meetLater(k, slot){
  if (!roamOn() || S.fast || k === 'family' || !HANG[k]) return false;
  const at = { cafe:'in:cafe', sidewalk:'in:trada' }[HANG[k].place]; if (!at) return false;
  S.meet = { d:S.day, slot, who:k, at }; S.queue.unshift({ id:'activity', arg:slot });
  note(`Hẹn ${PEOPLE[k].name} ở ${PHO_ROOMS[at].name}.`); return true;
}
function meetStart(k, sc){ S.meet = null; S.where = null; S.queue.unshift({ id:sc || 'hangout', arg:k }); S.cur = null; save(); advance(); }

/* ----- Cửa nhà ở chế độ đi lại: dẫn ra phố (rủ ai đó đi chơi vẫn ở đây) ----- */
(() => {
  const HP = ROAM_PLACES.find(p => p.id === 'home'), base = HP.entries;
  HP.enter = placeEnter;
  HP.entries = (ref, sc, o) => {
    const list = base(ref, sc, o); if (o.kind !== 'door' || !phoRef(ref)) return list;
    return [{ icon:'🚶', label:'Ra phố', go:'street', enter:{ x:66, y:172 } }, ...list.filter(e => e.i !== undefined && sc.choices[e.i].actId === 'hangout').map(e => ({ ...e, call:true }))];   // rủ đi chơi = gọi điện hẹn, không phải ra khỏi nhà
  };
})();

/* ----- Đăng ký các nơi: phố và tám địa điểm ----- */
const phoPlace = (id, map, extra = {}) => ({ id, match:ref => phoRef(ref) && whereAt() === id, map, entries:phoEntries, idle:phoIdle,
  npcEntries:(ref, sc, who) => [{ icon:'💬', label:'Bắt chuyện', talk:true }], choiceObj:() => null, span:roamSpan, timeout:phoTimeout, story:() => false,
  greet:who => VP_GREET[who] || 'Chào!', talk:officeTalk, key:() => map().key, enter:placeEnter, ...extra });
ROAM_PLACES.push(phoPlace('street', phoMap, {
  speed:W => W.riding ? XE.SPEED : 1,
  mount(W, api){ if (bikeState() === 'ride') bikeLook(W, api, true); gapMount(W, api); streetMount(W, api); phoMiniMount(W, api);
    const m = S.meet; if (m && m.d === S.day && m.slot === S.slot) api.C.later(() => api.say(api.me, `Hẹn ${PEOPLE[m.who].name} ở ${PHO_ROOMS[m.at].name}.`, 2000), 500); },
  frame(W, dt, api){ if (W.riding) bikeFit(W); gapFrame(W, dt, api); streetFrame(W, dt, api); phoMiniFrame(W); },
}));
Object.keys(PHO_ROOMS).forEach(id => ROAM_PLACES.push(phoPlace(id, () => phoRoom(id), {
  mount(W, api){ roomNpcs(W, api, id); popMount(W, api, id); cityMount(W, api, id); if (typeof pvMount === 'function') pvMount(W, api, id); if (S.flags.rainDay === S.day && id === 'in:lake') { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = rainSVG(); W.svg.appendChild(g); } },
  frame(W, dt, api){ if (id === 'in:lake') hoFrame(W, api); popFrame(W, dt, api); cityFrame(W, api); },
})));

/* ----- Bản đồ nhỏ trên phố: vị trí của bạn và các địa điểm; chạm vào địa điểm để tự đi tới ----- */
function phoMiniMount(W, api){
  const box = document.createElement('div'); box.className = 'w-mini'; box.setAttribute('aria-label', 'Bản đồ phố');
  box.innerHTML = `<i class="w-mini-road"></i>${PHO_DOORS.map(d => `<button type="button" class="w-mini-pin" data-to="${d.to}" style="left:${(d.x + d.w / 2) / PHO.W * 100}%" title="${esc(d.name)}" aria-label="Đi tới ${esc(d.name)}">${d.icon}</button>`).join('')}<b class="w-mini-me" aria-hidden="true">●</b><span class="w-mini-home" style="left:${66 / PHO.W * 100}%">🏠</span>`;
  W.el.insertAdjacentElement('afterend', box); W.mini = box.querySelector('.w-mini-me');   // nằm ngay dưới khung, không che cảnh và gợi ý
  box.querySelectorAll('.w-mini-pin').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); if (W.busy || W.toast) return; const o = W.H.objs.find(x => x.use && x.use.to === b.dataset.to); if (o) api.goTo({ o }); }));
}
function phoMiniFrame(W){ if (W.mini) W.mini.style.left = (W.me.x / PHO.W * 100) + '%'; }
