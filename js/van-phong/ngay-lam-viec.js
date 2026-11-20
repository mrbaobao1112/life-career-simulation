/* =========================================================
   v15: MỘT NGÀY Ở VĂN PHÒNG – cảnh nào chơi trong văn phòng, khung giờ, việc nào làm ở đâu
   Giống ở nhà: đồ vật chỉ là lối vào cho đúng các lựa chọn có sẵn (họp, task, ăn trưa, tan làm),
   cùng một hàm áp dụng nên chỉ số tính đúng một lần. Phần mới: vài việc nhỏ (nước, cà phê) và trò chơi khi làm task.
   ========================================================= */
const VP = {
  MEET_WAIT:15,              // vào công ty rồi, chừng này phút game chưa tới chỗ họp thì chị Hạnh gọi
  TASK_AM:[9.25, 12],        // khung giờ task buổi sáng (giờ)
  TASK_PM:[13, 17.5],        // khung giờ task buổi chiều
  LUNCH:[12, 13], END:[17.5, 18.5],
  WATER_MIN:5, COFFEE_MIN:10, COFFEE_ENERGY:2,   // pha cà phê: 10 phút, năng lượng +2, mỗi ngày tính một lần
  LOOK_MIN:5,
};
const officeMatch = ref => !!S.job && isWorkday() && (['standup','task','endwork'].includes(ref.id) || (ref.id === 'meal' && ref.arg === 'lunch'));

// Lựa chọn → làm ở đâu. 'npc:dung' nghĩa là phải đến chỗ anh Dũng.
const VP_MEAL = { team:'door', bun:'door', bread:'mydesk', nap:'mydesk' };
function officeChoiceObj(ref, ch){
  if (ref.id === 'task') return ch.key === 'ask' && !officeMap().absent.includes('dung') ? 'npc:dung' : 'mydesk';
  if (ref.id === 'meal') return VP_MEAL[ch.key] || 'door';
  if (ref.id === 'endwork') return 'door';
  if (ref.id === 'standup') return 'meet';
  return 'mydesk';
}
function officeSpan(ref){
  if (ref.id === 'standup') { const a = (S.am ? S.am.arrive : 9 * 60) / 60; return [a, a + VP.MEET_WAIT / 60]; }
  if (ref.id === 'task') return S.slot === 'afternoon' ? VP.TASK_PM : VP.TASK_AM;
  if (ref.id === 'meal') return VP.LUNCH;
  return VP.END;
}
// Việc nhỏ trong văn phòng: chỉ tốn ít phút
const VP_MINOR = {
  water:   () => ({ icon:'🥤', label:'Uống cốc nước', min:VP.WATER_MIN, fx:() => pick(['Nước mát. Tỉnh hẳn.','Bình nước kêu “ọc” một tiếng rất to. Cả phòng quay lại nhìn.']) }),
  coffee:  () => S.flags.vpCoffee === S.day ? { icon:'☕', label:'Thêm cốc nữa?', min:VP.WATER_MIN, fx:() => 'Cốc thứ hai chỉ để cầm cho có. Tim bạn bảo thế là đủ.' }
    : { icon:'☕', label:'Pha cà phê', min:VP.COFFEE_MIN, fx:() => { S.flags.vpCoffee = S.day; S.energy += VP.COFFEE_ENERGY; clampAll(); feedAdd({ id:'vp' }, '☕', 'Pha cà phê ở pantry.', 0); return 'Cà phê đen đá. Tỉnh hẳn.'; } },
  clock:   () => ({ icon:'⏱️', label:'Chấm công', min:1, fx:() => 'Tít! Máy ghi nhận khuôn mặt hơi buồn ngủ của bạn.' }),
  printer: () => ({ icon:'🖨️', label:'Gỡ giấy kẹt', min:VP.LOOK_MIN, fx:() => pick(['Lại kẹt giấy. Bạn rút ra được một tờ in dở bản hợp đồng năm 2019.','Máy in kêu rè rè rồi im. Như chưa từng có chuyện gì.']) }),
  meet:    () => ({ icon:'🗂️', label:'Xem bảng công việc', min:VP.LOOK_MIN, fx:() => pick(['Cột “Đang làm” dài gấp đôi cột “Xong”. Như mọi tuần.','Ai đó vẽ một con mèo nhỏ ở góc bảng.']) }),
};
function officeEntries(ref, sc, o){
  const out = [];
  if (ref.id === 'standup' && o.kind === 'meet') return [{ icon:'🗣️', label:'Vào họp đầu ngày', flat:true }];
  sc.choices.forEach((ch, i) => {
    if (officeChoiceObj(ref, ch) !== o.kind) return;
    const poor = ch.cost && S.money < ch.cost, mg = ref.id === 'task' && ['fast','careful'].includes(ch.key) ? { tid:ref.arg && ref.arg.tid, how:ch.key } : null;
    out.push({ icon:ch.icon, label:ch.short || ch.label, cost:ch.cost, i, off:poor || ch.disabled, why:poor ? 'Không đủ tiền' : '', mg });
  });
  if (VP_MINOR[o.kind]) out.push({ ...VP_MINOR[o.kind](), minor:true });
  return out;
}
function officeIdle(ref, o){
  if (o.kind === 'door') return ref.id === 'task' || ref.id === 'standup' ? '💼 Đang giờ làm' : '🚪 Cửa ra vào';
  if (o.kind === 'mydesk') return ref.id === 'standup' ? '🗣️ Họp đầu ngày đã' : '💻 Bàn của bạn';
  return `${o.icon} ${o.name}`;
}
const VP_GREET = { boss:'Em chào chị ạ!', dung:'Em chào anh!', mai:'Em chào chị Mai!', phong:'Ê Phong!' };
function officeNpcEntries(ref, sc, who){
  const out = [{ icon:'💬', label:'Bắt chuyện', talk:true }];
  if (who === 'dung' && ref.id === 'task') sc.choices.forEach((ch, i) => { if (ch.key === 'ask') out.unshift({ icon:ch.icon, label:ch.label, i, say:'Anh ơi, em hỏi chút được không ạ?', reply:'Ừ, đâu em xem.' }); });
  return out;
}
// Bắt chuyện: dùng câu nói theo tính cách (tinh-cach.js), cộng quan hệ trong giới hạn mỗi ngày (chatBond)
async function officeTalk(a, api){
  if (typeof htTalk === 'function' && HTC.ON && XUNG[a.who]) return htTalk(WORLD, api, a);   // v17.5: hội thoại có trí nhớ, theo nơi, giờ, mức thân
  const t = pickTalk(a.who), lines = t ? t.lines : [pick(NPC_QUIP[a.who] || ['Ừ.']), 'Dạ.'];
  api.say(api.me, VP_GREET[a.who] || 'Chào!', 1100); SFX.play('talk'); if (!await api.wait(api.C.still ? 0 : 1000)) return;
  for (let i = 0; i < lines.length; i++) {
    const who = i % 2 === 0 ? a : api.me; api.say(who, lines[i], 1500); if (who === a) api.C.react(a, 'nod');
    if (!await api.wait(api.C.still ? 0 : 1400)) return;
  }
  if (t && t.fun) { api.C.react(a, 'laugh'); api.C.react(api.me, 'laugh'); }
  chatBond(a.who); updateHUD();
}
function officeTimeout(ref, sc){
  const f = S.fast; S.fast = { from:S.day, until:S.day }; const i = autoPick(ref, sc); S.fast = f;
  if (ref.id === 'task') return { i, text:'Hết giờ mà task chưa đụng tới. Bạn làm vội cho xong.' };
  if (ref.id === 'meal') return { i, text:'Đến giờ, bạn ăn trưa theo thói quen.' };
  return { i: i < 0 ? 0 : i, text:'' };
}
// Hết giờ: họp thì chị Hạnh gọi (tính họp muộn); task thì tính thêm một lần nhắc rồi làm theo nếp
async function officeOnTimeUp(W, api){
  if (W.ref.id === 'standup') {
    klMeetLate(W, api); const b = W.npcs.find(n => n.who === 'boss'); if (b) api.say(b, 'Họp thôi em ơi!', 1400);
    if (!await api.wait(api.C.still ? 0 : 1300)) return true;
    ROAM_FLAT = S.cur; renderScene(); return true;
  }
  if (W.ref.id === 'task') klLevel(W, api, Math.min(3, (W.klLv || 0) + 1));
  return false;
}
// Mũi tên chỉ chỗ cần đến (họp đầu ngày, task đầu tiên)
function officeArrow(W, id){
  const o = W.H.objs.find(x => x.id === id); if (!o) return;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'w-arrow');
  g.innerHTML = `<path d="M${(o.hit[0] + o.hit[2]) / 2 - 7} ${o.hit[1] - 22} h14 v8 h7 l-14 13 l-14 -13 h7Z" fill="#F6C85F" stroke="#1B2230" stroke-width="1.4"/>`;
  W.svg.querySelector('.w-hits').appendChild(g);
}

ROAM_PLACES.push({ id:'office', match:officeMatch, map:officeMap, entries:officeEntries, idle:officeIdle, npcEntries:officeNpcEntries,
  choiceObj:officeChoiceObj, span:officeSpan, timeout:officeTimeout, story:() => false, greet:who => VP_GREET[who] || 'Chào!', talk:officeTalk,
  key:() => officeMap().key, onTimeUp:officeOnTimeUp,
  mount(W, api){
    officeCastMount(W, api);
    if (W.ref.id === 'standup') { officeArrow(W, 'meet'); api.C.later(() => { const b = W.npcs.find(n => n.who === 'boss'); if (b) api.say(b, 'Cả nhà ra họp nhé!', 1800); }, 900); }
    if (W.ref.id === 'task' && W.ref.arg && W.ref.arg.first) officeArrow(W, 'mydesk');
  },
  frame(W, dt, api){ klFrame(W, dt, api); if (typeof songFrame === 'function') songFrame(W, dt, api); },
});
