/* =========================================================
   v16: XE MÁY – dắt xe ra ở ngõ nhà, đi nhanh trên phố, dựng xe trước cửa quán, tiền xăng
   Tiền xăng dùng đúng mức có sẵn (FIN.FUEL) và đúng chỗ ghi có sẵn (S.flags.fuel): mỗi ngày tối đa một lần.
   Ngày đi làm đã trừ xăng lúc sáng thì không trừ thêm. Không đi xe thì không mất gì.
   ========================================================= */
const XE = {
  SPEED:2.5,                 // đi xe nhanh gấp chừng này lần đi bộ
  DY:-12,                    // người ngồi trên yên cao hơn mặt đường chừng này
};
const bikeState = () => { const w = whereNow(); return w ? w.bike : null; };   // null: xe ở ngõ nhà · 'ride': đang đi · { park:nơi }: dựng trước cửa
// Trả tiền xăng nếu hôm nay chưa trả (trả về số tiền đã trừ)
function bikeFuel(){
  if (goingOut() || (S.flags.fuel && S.flags.fuel.d === S.day)) return 0;
  const f = Math.min(FIN.FUEL, S.money); if (f <= 0) return 0;
  S.money -= f; spendLog(f); note(`Xăng xe: −${fmt(f)}.`); S.flags.fuel = { d:S.day, a:f };
  const was = ROAM_NOW; ROAM_NOW = WORLD ? WORLD.t / 60 : null; feedAdd({ id:'pho' }, '⛽', 'Đổ xăng đi chơi.', -f); ROAM_NOW = was;
  return f;
}
// Vẽ hoặc gỡ chiếc xe dưới chân nhân vật (dùng lại hình xe của cảnh đi làm)
function bikeLook(W, api, on){
  const me = W.me, flip = me.el.querySelector('.flip'); let g = me.el.querySelector('.w-bike');
  if (on) {
    if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'w-bike'); g.innerHTML = `<g transform="scale(2.5)">${bikeSVG()}</g>`; flip.insertBefore(g, flip.firstChild); }
    me.dy = XE.DY; W.riding = true; api.C.act(me, 'act-ride');
  } else { if (g) g.remove(); me.dy = 0; W.riding = false; api.C.act(me, ''); }
  api.put(me, me.x, me.y); bikeFit(W);
}
// Bánh xe luôn chạm mặt đường dù cỡ nhân vật đổi theo chiều sâu
function bikeFit(W){ const g = W.me.el.querySelector('.w-bike'); if (g) g.setAttribute('transform', `translate(60 ${140 - (W.me.dy || 0) / W.me.s})`); }
// Ở chỗ để xe trong ngõ: dắt xe ra / cất xe
function bikeEntries(){
  const b = bikeState();
  if (b === 'ride') return [{ icon:'🅿️', label:'Cất xe vào nhà', run:(W, api) => { whereNow().bike = null; bikeLook(W, api, false); api.say(api.me, 'Cất xe rồi.', 1200); } }];
  if (b && b.park) return [];
  const fuel = goingOut() || (S.flags.fuel && S.flags.fuel.d === S.day) ? '' : ` (xăng ${fmt(FIN.FUEL)})`;
  return [{ icon:'🛵', label:'Dắt xe ra' + fuel, run:(W, api) => { const w = whereNow() || phoWhere(); w.bike = 'ride'; S.where = w; const f = bikeFuel(); bikeLook(W, api, true); updateHUD();
    api.say(api.me, f ? `Đổ xăng hết ${fmt(f)}. Đi thôi!` : 'Lên xe, đi thôi!', 1500); SFX.play('pop'); } }];
}
