/* =========================================================
   v14: TƯƠNG TÁC – nối đồ vật trong nhà với các lựa chọn CÓ SẴN của cảnh hiện tại
   Đồ vật không có luật riêng: giường, máy tính, bếp… chỉ là lối vào cho đúng các lựa chọn
   mà bảng danh sách vẫn hiện. Dùng đồ = bấm lựa chọn đó, cùng một hàm áp dụng (applyChoice),
   nên chỉ số, tiền, nếp sinh hoạt, nhật ký đều tính đúng một lần như trước.
   Phần mới duy nhất là vài việc nhỏ chỉ tốn ít phút (tắm, uống nước, ngắm phố, chào người nhà).
   ========================================================= */
// Việc lúc rảnh → làm ở đồ vật nào
const ACT_OBJ = { rest:'bed', study:'desk', prep:'desk', jobs:'desk', cv:'desk', budget:'desk', clean:'broom', family:'window', family2:'sofa',
  cafe:'door', trada:'door', run:'door', shop:'door', hangout:'door', trip_home:'door', trip_errand:'door', trip_friend:'door' };
// Bữa ăn → ăn ở đâu
const MEAL_OBJ = { home:'table', cook:'kitchen', noodle:'kitchen', app:'table', skip:'table', rice:'door', tab:'door' };
function choiceObj(ref, ch){
  let k = null;
  if (ref.id === 'activity') k = ch.actId === 'game' ? (S.bg === 'ghep' ? 'tv' : 'desk') : ch.actId === 'film' ? (S.bg === 'tro' ? 'desk' : 'tv') : ACT_OBJ[ch.actId] || 'desk';
  else if (ref.id === 'meal') k = MEAL_OBJ[ch.key] || 'table';
  else if (ref.id === 'bedtime') k = 'bed';
  if (k && !house().objs.some(o => o.kind === k)) k = 'desk';      // nhà này không có đồ đó thì làm ở bàn học
  return k;
}
// Những cảnh được chơi bằng cách tự đi lại trong nhà
const roamOn = () => stageOn() && !(S.opt && S.opt.roam === false) && typeof requestAnimationFrame === 'function';
function roamFor(ref){
  if (!S || !ref || !roamOn() || S.fast) return false;
  if (ref.id === 'activity') return ['morning','afternoon','evening'].includes(ref.arg);
  if (ref.id === 'meal') return !(ref.arg === 'lunch' && isWorkday());
  return ref.id === 'bedtime';
}
// Khung giờ của cảnh (giờ, dạng số thập phân): đồng hồ chạy từ đầu đến cuối khung, dùng đồ thì nhảy đến cuối
function bedOptsMin(){ return S.otTonight === true || S.flags.lateOT ? 23.5 : 22.5; }
function roamSpan(ref){
  const wakeH = S.am ? S.am.wake / 60 : alarmFor(S.day);
  let s;
  if (ref.id === 'activity') s = { morning:[Math.max(8, wakeH + .5), 12], afternoon:[13.5, 18.5], evening:[19.5, 22] }[ref.arg];
  else if (ref.id === 'meal') s = ref.arg === 'lunch' ? [12, 13.5] : [18.5, 19.5];
  else s = [bedOptsMin() - .5, 26];
  return [Math.min(s[0], s[1] - .5), s[1]];
}
const roamKey = ref => `${S.day}:${S.slot}:${ref.id}:${ref.arg || ''}`;
const clockMin = m => clock(((m / 60) % 24 + 24) % 24);

/* ----- Danh sách việc làm được ở một đồ vật lúc này -----
   Mỗi mục: { icon, label, cost, i (vị trí lựa chọn trong cảnh) | bed (giờ đi ngủ) | minor (việc nhỏ), off, why } */
const MINOR = {
  shower: () => ({ icon:'🚿', label:'Tắm', min:ROAM.SHOWER_MIN, fx:() => {
    if (S.flags.shower === S.day) return 'Tắm lại cho mát.';
    S.flags.shower = S.day; S.mood += ROAM.SHOWER_MOOD; clampAll(); feedAdd({ id:'roam' }, '🚿', 'Tắm rửa.', 0); return 'Tắm xong, người nhẹ hẳn.'; } }),
  sink:    () => ({ icon:'🚰', label:'Rửa mặt', min:ROAM.SIP_MIN, fx:() => 'Nước mát. Tỉnh cả người.' }),
  kitchen: () => ({ icon:'🥛', label:'Uống cốc nước', min:ROAM.SIP_MIN, fx:() => pick(['Ực ực… Đủ nước rồi.','Tủ lạnh còn mỗi chai nước và nửa quả chanh.']) }),
  sofa:    () => ({ icon:'🛋️', label:'Ngồi nghỉ chân', min:ROAM.LOOK_MIN, fx:() => 'Ghế êm thật. Suýt nữa thì ngủ quên.' }),
  window:  () => ({ icon:'🌆', label:'Ngắm phố', min:ROAM.LOOK_MIN, fx:() => pick(['Ngoài kia xe cộ vẫn nối đuôi nhau.','Có bác bán xôi đi ngang qua.','Hà Thành hôm nay trời đẹp thật.']) }),
};
function objEntries(ref, sc, o){
  const out = [];
  sc.choices.forEach((ch, i) => {
    if (choiceObj(ref, ch) !== o.kind) return;
    const poor = ch.cost && S.money < ch.cost;
    out.push({ icon:ch.icon, label:ch.short || ch.label, cost:ch.cost, i, off:poor || ch.disabled, why:poor ? 'Không đủ tiền' : '' });
  });
  if (ref.id === 'bedtime' && o.kind === 'bed') { out.length = 0; out.push({ icon:'🛌', label:'Đi ngủ', bed:true }); }
  if (MINOR[o.kind]) out.push({ ...MINOR[o.kind](), minor:true });
  return out;
}
// Đồ vật không có việc gì lúc này: một câu ngắn giải thích
function objIdle(ref, o){
  if (o.kind === 'bed') return ref.id === 'meal' ? '🍚 Ăn đã rồi hãy nằm' : '😴 Chưa đến giờ ngủ';
  if (o.kind === 'door') return ref.id === 'bedtime' ? '🌙 Khuya rồi, ở nhà thôi' : '🏠 Bữa này ăn ở nhà';
  if (ref.id === 'meal') return '🍚 Đang giờ ăn';
  if (ref.id === 'bedtime') return '🌙 Khuya rồi, đi ngủ thôi';
  if (o.kind === 'table' || o.kind === 'kitchen') return '🍽️ Chưa đến bữa';
  return `${o.name}`;
}
// Người trong nhà: chào hỏi; bố mẹ thì có thể ngồi uống trà (nếu lúc này có lựa chọn đó)
function npcEntries(ref, sc, who){
  const out = [{ icon:'👋', label:'Chào', minor:true, greet:true, min:0 }];
  if (who === 'mom' || who === 'dad') sc.choices.forEach((ch, i) => { if (ch.actId === 'family2') out.unshift({ icon:ch.icon, label:ch.short || ch.label, i }); });
  return out;
}
const GREET = { mom:'Con chào mẹ!', dad:'Con chào bố!', tung:'Ê Tùng!' };

// Hết giờ mà chưa làm gì: chọn thay theo đúng cách game vẫn tự chọn
function roamTimeoutChoice(ref, sc){
  if (ref.id === 'bedtime') return { bed:26, text:'' };
  if (ref.id === 'meal') { const f = S.fast; S.fast = { from:S.day, until:S.day }; const i = autoPick(ref, sc); S.fast = f; return { i, text:'Đến bữa rồi, bạn ăn theo thói quen.' }; }
  let i = sc.choices.findIndex(c => c.actId === 'film'); if (i < 0) i = sc.choices.findIndex(c => c.actId === 'rest');
  return { i, text:'Mải lướt điện thoại, buổi này trôi qua lúc nào không hay.' };
}
