/* ----- Chạm vào nhân vật ----- */
const NPC_QUIP = { tung:['Ê, rảnh không?','Đi trà đá không?','Tao nghĩ ra kế hoạch mới rồi!'], linh:['Học bài chưa?','Có chuyện gì kể tao nghe.','Đọc sách đi!'],
  boss:['Task xong chưa em?','Có vướng gì không?','Cố lên em!'], dung:['…','(chỉnh lại tai nghe)','Hỏi đi, anh nghe.'], mai:['Chị thấy bug rồi đấy.','Hihi.','Test lại chưa em?'],
  phong:['Ơ, gì thế?','Tôi run quá…','Đi ăn trưa không ông?'], hr:['Chào em!','Bình tĩnh nhé.'], lead:['Hửm?','Nói ngắn gọn thôi em.'], giamdoc:['Kỳ lân!','Tầm nhìn!'],
  mom:['Ăn cơm chưa con?','Mặc thêm áo vào.','Tiêu cẩn thận nhé.'], dad:['Ừ.','Hồi bố còn trẻ…'] };
function playerQuip(){
  if (!S) return pick(['Chào bạn! 👋','Bắt đầu thôi!','Hôm nay sẽ là một ngày tốt!']);
  const o = [];
  if (S.energy < 25) o.push('Buồn ngủ quá…','Cho mình chợp mắt 5 phút…');
  if (S.mood >= 75) o.push('Hôm nay vui ghê!','Đời đẹp quá!');
  if (S.mood < 35) o.push('Hơi buồn một chút…');
  if (S.money < 500000) o.push('Ví mỏng quá…','Lại mì tôm à?');
  if (S.nutr < 40) o.push('Thèm rau quá…');
  if (S.flags.hangoverToday && S.slot === 'morning') o.push('Đau đầu quá…');
  if (S.job && isWorkday()) o.push('Còn task chưa xong…');
  if (!S.job) o.push('Có công ty nào gọi chưa nhỉ?');
  o.push('Ơ, gì thế?','Hihi, nhột!','👋');
  return pick(o);
}
function showQuip(box, text, cls = ''){
  if (!box) return;
  box.querySelectorAll('.quip').forEach(q => q.remove());
  const q = document.createElement('div'); q.className = 'quip ' + cls; q.textContent = text; box.appendChild(q);
  setTimeout(() => q.remove(), 1900);
}
function poke(target){
  const host = target.closest('#meG, #npcG, #avatar, .title-chibi');
  if (!host) return false;
  const cb = host.classList.contains('cb') ? host : host.querySelector('.cb'); if (!cb) return false;
  const panel = host.closest('.panel'); if (panel) panel.classList.remove('skip');
  const isNpc = host.id === 'npcG', tired = !isNpc && S && S.energy < 25;
  const anim = tired ? 'yawn' : isNpc ? pick(['hop','nod','shake']) : pick(['wave','jump','spin','cheer']);
  cb.setAttribute('class', cb.getAttribute('class').replace(/\banim-\S+/g, '').trim());
  void cb.getBoundingClientRect();
  if (!reduceMotion()) cb.classList.add('anim-' + anim);
  const text = isNpc ? pick(NPC_QUIP[host.dataset.npc] || ['…']) : playerQuip();
  if (panel) showQuip(panel, text, isNpc ? 'right' : (document.getElementById('npcG') ? 'left' : ''));
  else showQuip(host, text, host.id === 'avatar' ? 'below' : '');
  SFX.play(isNpc ? 'talk' : 'hop');
  return true;
}
document.addEventListener('click', e => { if (e.target.closest && poke(e.target)) e.stopPropagation(); }, true);
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('#avatar, .title-chibi')) { e.preventDefault(); poke(e.target); } });

SC.ev = (id) => EVENTS[id].build();

