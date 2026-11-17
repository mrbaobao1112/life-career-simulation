/* =========================================================
   v16: CHUYỆN BẤT NGỜ TRÊN PHỐ – gặp người quen, hàng rong, mưa bất chợt, tắc đường
   Mỗi lần ra phố có thể có một chuyện; mỗi loại tối đa một lần mỗi ngày. Tua nhanh thì không có (như sự kiện cũ).
   ========================================================= */
const GAP = {
  CHANCE:.6,                 // xác suất một lần ra phố có chuyện
  AFTER:[120, 420],          // đi được chừng này (đơn vị hình) thì chuyện xảy ra
  VENDOR_COST:15000, VENDOR_MOOD:2,
  WET_MOOD:-2,               // mưa mà không trú kịp: tinh thần
  SHELTER_MIN:10,            // có chừng này phút game để chạy vào trú dưới mái hiên
  RAINCOAT_MIN:5,            // đang đi xe: dừng mặc áo mưa
  JAM_MIN:10,                // tắc đường (chỉ khi đi xe)
};
const gapToday = () => { const g = S.flags.pho; return g && g.d === S.day ? g : (S.flags.pho = { d:S.day }); };

function gapMount(W, api){
  if (S.fast) return;
  if (S.flags.rainDay === S.day) gapRain(W, api, true);                 // hôm nay trời mưa sẵn: phố cũng mưa
  const g = gapToday(), pool = ['met', 'vendor', 'rain', 'jam'].filter(k => !g[k] && !(k === 'rain' && S.flags.rainDay === S.day));
  if (!pool.length || !chance(GAP.CHANCE)) return;
  W.gap = { kind:pick(pool), at:GAP.AFTER[0] + Math.random() * (GAP.AFTER[1] - GAP.AFTER[0]), walked:0, lx:W.me.x };
}
function gapFrame(W, dt, api){
  if (W.wetT !== undefined && W.wetT !== null) gapWetTick(W, dt, api);
  const G = W.gap; if (!G || W.busy) return;
  G.walked += Math.abs(W.me.x - G.lx); G.lx = W.me.x;
  if (G.walked < G.at) return;
  let k = G.kind; if (k === 'jam' && !W.riding) k = gapToday().vendor ? null : 'vendor';
  W.gap = null; if (!k) return;
  gapToday()[k] = true;
  ({ met:gapMet, vendor:gapVendor, rain:gapRain, jam:gapJam })[k](W, api);
}
// Tình cờ gặp người quen: đi ngược chiều, dừng lại nói vài câu theo tính cách
async function gapMet(W, api){
  const list = ['tung', 'linh', ...(S.job && isDayOff() ? ['phong', 'mai'] : [])].filter(k => !(S.meet && S.meet.who === k));
  const who = pick(list), dir = W.me.x < W.H.W / 2 ? 1 : -1, sx = Math.max(30, Math.min(W.H.W - 30, W.me.x + dir * 240));
  const a = api.npc(who, sx, 186, 'act-walk', dir > 0, { id:'met_' + who, speed:60 });
  a.entries = () => [{ icon:'💬', label:'Bắt chuyện', run:async () => { W.busy = true; await officeTalk(a, api); if (!api.alive()) return; W.busy = false; api.showPrompt(); gapLeave(W, api, a, dir); } }];
  api.C.later(() => { if (!a.left_) gapLeave(W, api, a, dir); }, 20000);        // không bắt chuyện thì một lúc sau người quen đi tiếp
  a.s = roamScale(186);
  if (!await api.C.walk(a, W.me.x + dir * 30, 186)) return;
  api.C.act(a, ''); api.C.face(a, dir > 0); api.say(a, pick(['Ơ! Gặp ông/bà ở đây à!', 'Ê, đi đâu đấy?', 'Trùng hợp ghê!']), 1600); SFX.play('talk');
  const was = ROAM_NOW; ROAM_NOW = W.t / 60; feedAdd({ id:'pho' }, '👋', `Tình cờ gặp ${PEOPLE[who] ? PEOPLE[who].name : who} trên phố.`, 0); ROAM_NOW = was;
}
// Hàng rong: đẩy xe dừng lại mời mua
async function gapVendor(W, api){
  const dir = W.me.x < W.H.W / 2 ? 1 : -1, x = Math.max(40, Math.min(W.H.W - 40, W.me.x + dir * 70));
  const cart = document.createElementNS('http://www.w3.org/2000/svg', 'g'); cart.innerHTML = PFURN.cart(x + dir * 30, 196); api.C.layer('world').appendChild(cart);
  const a = api.npc('p', x, 192, '', dir > 0, { id:'vendor', look:PASSER_LOOKS[1], label:'Cô bán bánh mì' });
  a.entries = () => { const poor = S.money < GAP.VENDOR_COST; return [
    { icon:'🥖', label:`Mua một ổ bánh mì (${fmt(GAP.VENDOR_COST)})`, off:poor, why:'Không đủ tiền', fx:() => { S.money -= GAP.VENDOR_COST; spendLog(GAP.VENDOR_COST); S.mood += GAP.VENDOR_MOOD; clampAll();
      feedAdd({ id:'pho' }, '🥖', 'Mua bánh mì hàng rong.', -GAP.VENDOR_COST); return 'Bánh mì nóng giòn đây cháu!'; } },
    { icon:'🙅', label:'Thôi ạ', fx:() => 'Ừ, lần sau nhé!' }]; };
  api.say(a, 'Bánh mì nóng giòn đây!', 2000);
}
// Mưa bất chợt
function gapRain(W, api, already){
  S.flags.rainDay = S.day;
  if (!W.svg.querySelector('.w-rain')) { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'w-rain'); g.innerHTML = rainSVG(); W.svg.appendChild(g); }
  if (already) return;
  SFX.play('dun');
  if (W.riding) {
    W.busy = true; api.say(api.me, 'Mưa rồi! Dừng xe mặc áo mưa…', 1800);
    (async () => { await api.spin(Math.min(W.end - 1, W.t + GAP.RAINCOAT_MIN), 900); if (!api.alive()) return; W.busy = false; api.showPrompt(); })();
  } else { W.wetT = 0; api.say(api.me, 'Mưa rồi! Chạy vào mái hiên trú đã!', 1800); }
}
function gapWetTick(W, dt, api){
  if (W.riding) { W.wetT = null; return; }
  const near = PHO_DOORS.some(d => Math.abs(phoDoorSpot(d).x - W.me.x) < 50) || W.me.x < PHO.LANE;
  if (near) { W.wetT = null; api.say(api.me, 'Trú tạm dưới mái hiên. Phù!', 1400); return; }
  W.wetT += dt * ROAM.MIN_PER_SEC;
  if (W.wetT >= GAP.SHELTER_MIN) { W.wetT = null; S.mood += GAP.WET_MOOD; clampAll(); updateHUD(); api.say(api.me, 'Ướt hết cả rồi…', 1600);
    const was = ROAM_NOW; ROAM_NOW = W.t / 60; feedAdd({ id:'pho' }, '🌧️', 'Dính mưa, ướt hết.', 0); ROAM_NOW = was; }
}
// Tắc đường (đang đi xe)
function gapJam(W, api){
  W.busy = true; api.say(api.me, 'Tắc đường rồi… nhích từng chút một.', 2000); SFX.play('dun');
  (async () => { await api.spin(Math.min(W.end - 1, W.t + GAP.JAM_MIN), 1400); if (!api.alive()) return; W.busy = false; api.showPrompt(); })();
}
// Người quen chào xong thì đi tiếp ra khỏi khung
async function gapLeave(W, api, a, dir){
  if (a.left_) return; a.left_ = true; api.say(a, 'Thôi tớ đi đây nhé!', 1300);
  if (!await api.wait(api.C.still ? 0 : 900)) return;
  api.C.face(a, dir < 0); const to = dir > 0 ? W.H.W + 40 : -40;
  W.npcs = W.npcs.filter(n => n !== a); W.near = null; api.showPrompt();
  if (await api.C.walk(a, to, a.y)) a.el.remove();
}
