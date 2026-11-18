/* =========================================================
   THẾ GIỚI SỐNG – PHASE 3: NGƯỜI QUEN Ở NGOÀI THÀNH PHỐ
   Tùng (bán hàng ca chiều) và Linh (học thạc sĩ) có lịch ở ngoài nhà, nên ra phố có thể gặp họ đúng chỗ, đúng giờ:
   - Tùng: ngày thường 13:30–21:30 đứng quầy ở trung tâm thương mại; cuối tuần chiều ngồi trà đá.
   - Linh: ngày thường học ở thư viện (sáng và chiều), tối hay ngồi cà phê; cuối tuần sáng cà phê.
   Chỉ để gặp và chào; hẹn gặp (S.meet) và hoạt động cần người này (need) vẫn theo luật cũ, không xếp trùng.
   ========================================================= */
const CITY_DAY = {
  tung:{ weekday:[[13.5, 21.5, 'in:mall', { x:250, y:160, act:'', sign:'🏷️', label:'Tùng (đang làm ca)' }]],
         weekend:[[15.2, 18.2, 'in:trada', { x:262, y:160, act:'act-talk', sign:'🧊', left:true }]] },
  linh:{ weekday:[[8.3, 11.5, 'in:lib', { x:180, y:164, act:'act-read', sign:'📚' }], [13.5, 17, 'in:lib', { x:180, y:164, act:'act-read', sign:'📚' }], [19, 21.5, 'in:cafe', { x:300, y:156, act:'act-sip', sign:'☕', left:true }]],
         weekend:[[9, 11.5, 'in:cafe', { x:300, y:156, act:'act-sip', sign:'☕', left:true }]] },
};
const CITY_LINE = {
  tung:{ 'in:mall':['Ơ, mày đi mua gì đấy?', 'Đang ca, tí về nói chuyện nhé!'], 'in:trada':['Ngồi làm cốc trà đá không?', 'Cuối tuần sướng thật!'] },
  linh:{ 'in:lib':['Suỵt… mình đang ôn bài.', 'Luận văn chưa xong chương 2…'], 'in:cafe':['Ơ, tình cờ thế!', 'Ngồi đây học cho tỉnh.'] },
};
// Lúc t (phút game), người này ở đâu ngoài thành phố (null: không ở ngoài)
function cityAt(who, t){
  const L = (CITY_DAY[who] || {})[songWeekend() ? 'weekend' : 'weekday'] || [], h = t / 60;
  const s = L.find(([a, b]) => h >= a && h < b); return s ? { place:s[2], ...s[3] } : null;
}
function cityMount(W, api, id){
  W.city = []; W.cityId = id;
  Object.keys(CITY_DAY).forEach(who => {
    if (W.npcs.some(a => a.who === who)) return;                               // đã có mặt (hẹn gặp / hoạt động cần người này)
    const p = CITY_DAY[who][songWeekend() ? 'weekend' : 'weekday'].find(s => s[2] === id); if (!p) return;
    const o = p[3], a = api.npc(who, o.x, o.y, o.act, !!o.left, { id:'city_' + who, label:o.label });
    a.city = who; a.entries = () => [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
    W.city.push(a); cityShow(W, api, a, true);
  });
}
function cityShow(W, api, a, first){
  const at = cityAt(a.city, W.t), on = !!at && at.place === W.cityId;
  if (!first && a.gone === !on) return;
  songHide(a, !on); if (on) { api.C.act(a, at.act); songSign(a, at.sign); }
}
function cityFrame(W, api){
  for (const a of W.city || []) {
    cityShow(W, api, a);
    if (!a.gone && !a.said && Math.abs(W.me.x - a.x) < 70 && !api.C.still) { a.said = true; const l = CITY_LINE[a.city][W.cityId]; if (l) api.say(a, pick(l), 1800); }
  }
}
